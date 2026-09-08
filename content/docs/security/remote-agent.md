---
title: Remote agent hardening
weight: 7
prev: /docs/security/audit
next: /docs/security/mcp
cascade:
  type: docs
---

# 📡 Exposing the remote agent safely

`rfswift agent` turns a lab machine into a server that a Workbench can drive. A client certificate signed by the agent's CA is **full command execution as the agent's user** on that machine: creating privileged containers, mounting host directories into them, opening terminals, pulling images. Treat the agent like SSH with a shared root key, and deploy it with the same care. This page is the checklist; the [remote agent guide](/docs/guide/remote-agent) explains the mechanics and the [audit](/docs/security/audit) records what was verified in the code.

## What the protocol guarantees, and what it does not

| Guaranteed by the implementation (verified) | Not provided, your deployment must cover it |
|---|---|
| TLS 1.3 only; TLS 1.2 handshakes are refused | Any hiding of the port: an open TLS port is visible to scanners |
| Mutual TLS: a connection without a CA-signed client certificate is closed during the handshake; nothing HTTP is reachable, not even a health route | Authorisation inside the agent: every client certificate has the same rights, there are no roles |
| Expired, wrong-usage (a server certificate used as a client one) and foreign-CA certificates are refused | Revocation of one client: only rotating the whole bundle revokes |
| The client pins the server certificate's SHA-256 fingerprint and verifies its name against the CA | Rate limiting or lockout: there is nothing to guess, but repeated handshakes still cost CPU |
| Unknown routes and wrong methods close the connection without a byte | Protection of the agent host from what an authorised client asks for |
| Request bodies are capped (64 KiB commands, 2 MiB control, 16 KiB headers), idle and slow connections are closed after 5 s of silence, 15 s to read a request, 30 s idle | Confinement of the agent's user: it runs containers, so a docker-group user is root-equivalent |
| Private keys are encrypted at rest with random passwords held only in the OS vault | A vault on a headless server: Linux needs an unlocked Secret Service in the agent's session |
| Transferable credential files are protected by a passphrase (scrypt, AES-256-GCM) and, since v4.0.2, carry an integrity tag that binds the CA, certificate, endpoint and pin to the same passphrase | Verification of files issued by older releases: compare fingerprints by hand |
| Every authenticated request is logged with the client's certificate fingerprint, source address and method | Log shipping, retention and review |

## Deployment checklist

### 1. Network: never a public port

- Keep the default bind, `127.0.0.1:8443`, and reach it through **WireGuard** (preferred for a permanent lab), another authenticated VPN, or an SSH tunnel (`ssh -N -L 8443:127.0.0.1:8443 user@lab`). The agent only ever sees connections from the tunnel endpoint.
- If it must listen on an interface, bind it to the VPN interface address (`--bind 10.8.0.5:8443`), not `0.0.0.0`, and add a firewall rule that drops everything except the VPN peers. `rfswift agent` reports "lan" exposure to the Workbench for any non-loopback bind, and the connection audit warns.
- Do not port-forward the agent from a home router, do not put it behind a reverse proxy that terminates TLS (the client certificate must reach the agent itself), and do not add it to a DNS name that resolves publicly.

### 2. Identity: a dedicated, unprivileged agent user

- Run the agent as a **dedicated account** that owns nothing else: no personal SSH keys, no browser profile, no other projects. Everything a client does runs as this user.
- Give that account only the engine access it needs. On Linux Docker this means the `docker` group, which is root-equivalent by design: prefer **rootless Podman** for an exposed agent, so a client that creates a privileged container gets root inside a user namespace, not on the host. `rfswift host udev` gives the account hardware access without root.
- Keep the agent's own user out of `sudo`. Host setup steps (`rfswift host setup`) are done once, by an administrator, not through the agent.

### 3. Keys: generate them where you can protect them

- **Keep the CA off the exposed host.** Run `rfswift agent certs init` on your administration workstation, export the agent's side with `rfswift agent certs export`, and install it on the lab machine with `rfswift agent certs import`. The lab machine then holds only its server key and the CA certificate; it cannot mint client certificates, and a compromise there does not give the attacker your CA.
- Issue one client file **per person and per machine** (`rfswift agent certs client --name alice-laptop`), never share a client file, and record the client fingerprint the command prints: the agent logs requests under it.
- Use a **long transfer passphrase** (12 characters is the minimum, a full sentence is better) and send the file and the passphrase over different channels. On import, compare the endpoint and the server fingerprint the import prints with the values printed at issue time; files from releases before v4.0.2 carry no integrity tag, and the import says so.
- Certificates live one year. Put the expiry in your calendar: an expired client certificate fails with a bare "bad certificate", and the Workbench warns only for the server certificate (30 days ahead). Rotation is "new bundle, re-issue every client": plan it during a quiet week.
- Key directories are owner-only (`0700`, key files `0600`); on Windows keep them inside the user profile, whose ACL does the same job. Never copy `client-key.pem` or `server-key.pem` to another machine: they only open with the vault of the user who generated them.

### 4. The vault on a server

The agent decrypts its key with a password stored in the OS credential vault of the user it runs as: macOS Keychain, Windows Credential Manager, or **Secret Service** on Linux (GNOME Keyring, KDE Wallet with the Secret Service bridge, KeePassXC). It fails closed when the vault is missing or locked.

- Linux servers without a desktop need a Secret Service on the agent user's session D-Bus, unlocked. The practical setups: run the agent inside a login session of that user (a `tmux` session after an SSH login where `gnome-keyring-daemon --unlock` was run), or a systemd user service with `loginctl enable-linger` and a keyring unlocked at boot. Test with `rfswift agent --bundle DIR`: it prints "listening" only after the key was decrypted.
- Windows: run the agent in a session of the same Windows user that imported the credentials; a scheduled task under another account cannot open that vault.
- Do not work around a missing vault by decrypting keys into plaintext files.

### 5. Run it as a service, with logs

A minimal hardened systemd **user** unit (the agent must run as the credential owner; `loginctl enable-linger agent` keeps the session alive):

```ini
# ~/.config/systemd/user/rfswift-agent.service
[Unit]
Description=RF Swift remote agent
After=default.target

[Service]
ExecStart=/usr/bin/rfswift agent --bundle %h/.config/rfswift/remote/lab --bind 127.0.0.1:8443
Restart=on-failure
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=%h /var/run/docker.sock
UMask=0077

[Install]
WantedBy=default.target
```

- Every authenticated request is logged to stderr as `agent: client <fingerprint prefix> from <address>: <method>`; rejected handshakes appear as `http: TLS handshake error from <address>: <reason>`. Ship the journal somewhere you read it, and alert on handshake errors from unexpected addresses and on `command` or `control targets.create` lines outside working hours.
- Restart the service after `rfswift update`: the Workbench refuses creation through an agent whose schema is older than its own and warns when the versions differ.

### 6. What clients can do once inside, and how to limit the blast radius

An authenticated client can run any `rfswift` command as the agent user, create containers with any mount, capability or device the engine allows, open interactive shells, read the mission workspace, prune images and collect the Nix store. Limit what that reaches:

- Keep assessment data for other engagements off the agent host, or in workspaces the agent user cannot read.
- Prefer rootless Podman, which refuses root-only devices and cgroup rules, over Docker.
- Do not point mission workspaces at the agent user's home or at shared directories; the artifact listing is confined to the workspace, but the workspace is whatever the creator chose.
- Review the access log for `command` lines: the Workbench only issues `exec -c <mission> -e <command>` there; anything else is not the Workbench.

### 7. Rotation and incident response

- **Lost or stolen client file or laptop**: there is no revocation list. Generate a new bundle (`certs init` in a new directory), export the server side to the agent, restart it, and re-issue every legitimate client. The old CA is then worthless.
- **Compromised agent host**: assume every mission workspace and every container on it is compromised, and that the attacker holds the server key and the CA certificate (not the CA key, if you kept it off the host). Rebuild the host, new bundle, new clients.
- **Passphrase typed into the wrong place**: it only protects the file in transit; once imported, the key is re-encrypted under a vault password. Re-issue the client anyway.

## On the Workbench side

- The Workbench was reviewed as a target of a hostile agent: everything an agent returns is escaped or rendered as text, the WebView runs under a Content Security Policy that forbids remote connections, and secrets never cross the JavaScript bridge. You still do not want to connect to an agent you do not trust: a hostile agent can feed you wrong evidence and can attack the terminals and tools you use through it.
- Open **Connection & security** after connecting and read the audit rows: transport, authentication, server identity, certificate validity, network exposure and **agent version** must all be green. "Reachable on the local network" means the agent is not bound to loopback; "Agent reports X; this Workbench is Y" means one side was not updated.
- Saved agent profiles hold the endpoint, the pinned fingerprint and the credential folder, nothing secret; **Forget** removes the profile and leaves the certificate files and the vault entry in place. Clean those up by hand when a credential is retired.
- When importing a client file the Workbench shows the endpoint and the fingerprint it found; a file from an older release is announced as unverified. Compare with what the issuing side printed before pressing **Connect**.

## Quick reference

```bash
# administration workstation: CA stays here
rfswift agent certs init --dir ~/agents/lab --name lab --host lab.vpn.internal
rfswift agent certs export --bundle ~/agents/lab                    # server-credentials.json
rfswift agent certs client --bundle ~/agents/lab --name alice-laptop  # clients/alice-laptop-client.json

# agent host (dedicated user, VPN address, no CA key)
rfswift agent certs import server-credentials.json --dir ~/.config/rfswift/remote/lab
rfswift agent --bundle ~/.config/rfswift/remote/lab --bind 10.8.0.5:8443

# each Workbench machine
rfswift agent certs import alice-laptop-client.json --dir ~/.config/rfswift/remote/lab-client
# then Workbench > Connection & security > Add agent > Import client credentials, compare the fingerprint, Connect
```

The [Known limits](/docs/guide/limitations#remote-agent-mode) page lists the sizes, timeouts and unsupported operations of remote mode.
