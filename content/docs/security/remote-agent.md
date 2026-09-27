---
title: "Remote agent hardening"
level: advanced
description: "Expose the remote agent safely: network, dedicated user, keys, vault, service, logs and incident response."
weight: 7
---

`rfswift agent` turns a lab machine into a server that a Workbench can drive. A client certificate signed by the agent's CA gives **full command execution as the agent's user** on that machine: creating privileged containers, mounting host directories into them, opening terminals, pulling images.

Treat the agent like SSH with a shared root key, and deploy it with the same care. This page is the checklist. The [remote agent guide](/docs/guide/remote-agent/) explains how it works, and the [audit page](/docs/security/audit/) records what was verified in the code.

**In short**

1. Never expose the port publicly: keep it on loopback and reach it through a VPN or an SSH tunnel.
2. Run the agent as a dedicated, unprivileged user, ideally with rootless Podman.
3. Keep the CA key off the agent host, and issue one client file per person and per machine.
4. Run it as a service and read its logs.
5. Know how to rotate: there is no revocation, only a new bundle.

## What the protocol guarantees, and what it does not

| Guaranteed by the implementation (verified) | Not provided: your deployment must cover it |
|---|---|
| TLS 1.3 only; TLS 1.2 handshakes are refused | Hiding the port: an open TLS port is visible to scanners |
| Mutual TLS: a connection without a CA-signed client certificate is closed during the handshake; nothing HTTP is reachable, not even a health route | Authorisation inside the agent: every client certificate has the same rights, there are no roles |
| Expired, wrong-usage (a server certificate used as a client one) and foreign-CA certificates are refused | Revoking one client: only rotating the whole bundle revokes |
| The client pins the server certificate's SHA-256 fingerprint and verifies its name against the CA | Rate limiting or lockout: there is nothing to guess, but repeated handshakes still cost CPU |
| Unknown routes and wrong methods close the connection without a byte | Protecting the agent host from what an authorised client asks for |
| Request bodies are capped (64 KiB commands, 2 MiB control, 16 KiB headers); idle and slow connections are closed after 5 s of silence, 15 s to read a request, 30 s idle | Confining the agent's user: it runs containers, so a docker-group user is root-equivalent |
| Private keys are encrypted at rest with random passwords held only in the OS vault | A vault on a headless server: Linux needs an unlocked Secret Service in the agent's session |
| Transferable credential files are protected by a passphrase (scrypt, AES-256-GCM) and, since v4.0.2, carry an integrity tag that binds the CA, certificate, endpoint and pin to the same passphrase | Verifying files issued by older releases: compare fingerprints by hand |
| Every authenticated request is logged with the client's certificate fingerprint, source address and method | Shipping, keeping and reviewing the logs |

## Deployment checklist

### 1. Network: never a public port

- Keep the default bind, `127.0.0.1:8443`. Reach it through **WireGuard** (best for a permanent lab), another authenticated VPN, or an SSH tunnel: `ssh -N -L 8443:127.0.0.1:8443 user@lab`. The agent then only ever sees connections from the tunnel endpoint.
- If it must listen on an interface, bind it to the VPN interface address (`--bind 10.8.0.5:8443`), not `0.0.0.0`. Add a firewall rule that drops everything except the VPN peers. For any non-loopback bind, `rfswift agent` reports "lan" exposure to the Workbench and the connection audit warns.
- Do not port-forward the agent from a home router. Do not put it behind a reverse proxy that terminates TLS: the client certificate must reach the agent itself. Do not give it a DNS name that resolves publicly.

### 2. Identity: a dedicated, unprivileged agent user

- Run the agent as a **dedicated account** that owns nothing else: no personal SSH keys, no browser profile, no other projects. Everything a client does runs as this user.
- Give that account only the engine access it needs. On Linux with Docker that means the `docker` group, which is root-equivalent by design. For an exposed agent, prefer **rootless Podman**: a client that creates a privileged container then gets root inside a user namespace, not on the host. `rfswift host udev` gives the account hardware access without root.
- Keep the agent's user out of `sudo`. Host setup (`rfswift host setup`) is done once by an administrator, not through the agent.

### 3. Keys: generate them where you can protect them

- **Keep the CA off the exposed host.** Run `rfswift agent certs init` on your administration workstation, export the agent's side with `rfswift agent certs export`, and install it on the lab machine with `rfswift agent certs import`. The lab machine then holds only its server key and the CA certificate. It cannot mint client certificates, and a compromise there does not give an attacker your CA.
- Issue one client file **per person and per machine** (`rfswift agent certs client --name alice-laptop`). Never share a client file. Write down the client fingerprint the command prints: the agent logs requests under it.
- Use a **long transfer passphrase**: 12 characters is the minimum, a full sentence is better. Send the file and the passphrase over different channels.
- On import, compare the endpoint and server fingerprint the import prints with the values printed when the file was issued. Files from releases before v4.0.2 carry no integrity tag, and the import says so.
- Certificates last one year. Put the expiry date in your calendar: an expired client certificate fails with a bare "bad certificate", and the Workbench warns only about the server certificate (30 days ahead). Rotating means a new bundle and re-issuing every client; plan it for a quiet week.
- Key directories are owner-only (`0700`, key files `0600`). On Windows, keep them inside the user profile, whose ACL does the same job. Never copy `client-key.pem` or `server-key.pem` to another machine: they only open with the vault of the user who generated them.

### 4. The vault on a server

The agent decrypts its key with a password stored in the OS credential vault of the user it runs as: macOS Keychain, Windows Credential Manager, or **Secret Service** on Linux (GNOME Keyring, KDE Wallet with the Secret Service bridge, KeePassXC). It fails closed when the vault is missing or locked.

- **Linux servers without a desktop** need an unlocked Secret Service on the agent user's session D-Bus. Two practical setups:
  - run the agent inside a login session of that user, for example a `tmux` session after an SSH login where `gnome-keyring-daemon --unlock` was run;
  - run it as a systemd user service with `loginctl enable-linger` and a keyring unlocked at boot.

  Test with `rfswift agent --bundle DIR`: it prints "listening" only once the key was decrypted.
- **Windows:** run the agent in a session of the same Windows user that imported the credentials. A scheduled task under another account cannot open that vault.
- Do not work around a missing vault by decrypting keys into plaintext files.

### 5. Run it as a service, with logs

A minimal hardened systemd **user** unit. The agent must run as the credential owner; `loginctl enable-linger agent` keeps the session alive:

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

- Every authenticated request is logged to stderr as `agent: client <fingerprint prefix> from <address>: <method>`. Rejected handshakes appear as `http: TLS handshake error from <address>: <reason>`.
- Send the journal somewhere you actually read it. Alert on handshake errors from unexpected addresses, and on `command` or `control targets.create` lines outside working hours.
- Restart the service after `rfswift update`. The Workbench refuses to create anything through an agent whose schema is older than its own, and warns when the versions differ.

### 6. Limit what an authorised client can reach

Once connected, a client can run any `rfswift` command as the agent user. It can create containers with any mount, capability or device the engine allows, open interactive shells, read the mission workspace, prune images and collect the Nix store. Limit what that reaches:

- Keep other engagements' data off the agent host, or in workspaces the agent user cannot read.
- Prefer rootless Podman, which refuses root-only devices and cgroup rules, over Docker.
- Do not point mission workspaces at the agent user's home or at shared directories. The artifact listing is confined to the workspace, but the workspace is whatever the creator chose.
- Review the access log for `command` lines. The Workbench only ever issues `exec -c <mission> -e <command>` there; anything else is not the Workbench.

### 7. Rotation and incident response

- **A client file or laptop is lost or stolen.** There is no revocation list. Generate a new bundle (`certs init` in a new directory), export the server side to the agent, restart it, and re-issue every legitimate client. The old CA is then worthless.
- **The agent host is compromised.** Assume every mission workspace and container on it is compromised, and that the attacker holds the server key and the CA certificate (but not the CA key, if you kept it off the host). Rebuild the host, create a new bundle and new clients.
- **A passphrase was typed into the wrong place.** It only protects the file in transit; once imported, the key is re-encrypted under a vault password. Re-issue the client anyway.

## On the Workbench side

- The Workbench was reviewed as the target of a hostile agent. Everything an agent returns is escaped or shown as text, the WebView runs under a Content Security Policy that forbids remote connections, and secrets never cross the JavaScript bridge. Still, do not connect to an agent you do not trust: a hostile agent can feed you wrong evidence and attack the terminals and tools you use through it.
- After connecting, open **Connection & security** and read the audit rows. Transport, authentication, server identity, certificate validity, network exposure and **agent version** must all be green. "Reachable on the local network" means the agent is not bound to loopback. "Agent reports X; this Workbench is Y" means one side was not updated.
- Saved agent profiles hold the endpoint, the pinned fingerprint and the credential folder, nothing secret. **Forget** removes the profile but leaves the certificate files and the vault entry; clean those up by hand when you retire a credential.
- When you import a client file, the Workbench shows the endpoint and fingerprint it found, and flags a file from an older release as unverified. Compare them with what the issuing side printed before you press **Connect**.

## Quick reference

The whole setup, from the administration workstation to each Workbench machine:

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

The sizes, timeouts and unsupported operations of remote mode are listed in [Known limits](/docs/guide/limitations/#remote-agent-mode).
