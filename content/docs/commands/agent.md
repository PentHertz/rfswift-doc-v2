---
title: agent
weight: 60
prev: /docs/commands/audit
next: /docs/commands/system
---

# rfswift agent

Serve the engines of a machine (Docker, Podman, Lima, Nix) to authenticated remote clients. Typical use: a lab machine holds the SDR, RFID, serial or GPU hardware; the [Workbench](/docs/guide/workbench) on your laptop drives it through the agent. Alias: `rfswift remote`.

{{< callout type="warning" >}}
A valid client certificate grants **command execution** on the agent host. Keep the agent on loopback and reach it through WireGuard, another authenticated VPN, or an SSH tunnel. Never bind it to a public interface. Read the [remote agent guide](/docs/guide/remote-agent) for the security model and the limits.
{{< /callout >}}

## Synopsis

```bash
# 1. On the lab machine: generate a CA and encrypted server/client certificates
rfswift agent certs init --dir DIR [--name NAME] [--host DNS-OR-IP]

# 2. Serve
rfswift agent --bundle DIR [--bind 127.0.0.1:8443] [--name "RF Swift agent"]

# 3. Credentials for a Workbench on another machine
rfswift agent certs client --bundle DIR --name laptop [--endpoint https://host:8443] [--out FILE] [--passphrase-file FILE]
rfswift agent certs import FILE [--dir DIR] [--passphrase-file FILE]

# Move the agent's own side to another host
rfswift agent certs export --bundle DIR [--out FILE] [--passphrase-file FILE]
```

---

## rfswift agent

Runs the headless agent over TLS 1.3 with mandatory mutual TLS. It prints its "listening" line only once the key is decrypted from the OS vault and the socket is bound.

| Flag | Description | Default |
|------|-------------|---------|
| `--bind` | Listen address. Loopback is recommended; expose through VPN or SSH | `127.0.0.1:8443` |
| `--bundle` | Directory written by `certs init`. Its `bundle.json` supplies the certificate, the key, the key's vault reference and the client CA | |
| `--cert` | Server certificate PEM | `server.pem` of the bundle |
| `--key` | Encrypted server key PEM. Given alone, the `bundle.json` next to it supplies the reference and CA | `server-key.pem` of the bundle |
| `--key-ref` | Secure-store reference of the encrypted key | `ServerKeyRef` of `bundle.json` |
| `--client-ca` | CA PEM that clients must be signed by (`ca.pem`) | `ca.pem` of the bundle |
| `--name` | Display name reported to clients | `RF Swift agent` |

Missing items are listed by flag name. The agent refuses to start without a client CA or with an unencrypted key.

```bash
rfswift agent certs init --dir ~/.config/rfswift/remote/lab --name lab-agent --host lab.internal
rfswift agent --bundle ~/.config/rfswift/remote/lab
```

Run the agent in a session of the **same user** that ran `certs init`: the key passwords live in that user's vault (Secret Service on Linux, Keychain on macOS, Credential Manager on Windows), and a service under another account cannot open them. RF Swift fails closed when the vault is unavailable.

---

## rfswift agent certs

### certs init

Generates a private CA, a server certificate for `--host`, and an initial client certificate. Every private key is a password-encrypted PKCS#8 file; the random passwords go into the OS vault and are referenced from `bundle.json`.

| Flag | Default |
|------|---------|
| `--dir` | `./rfswift-agent-certs` |
| `--name` | `rfswift-agent` (recorded in `bundle.json`; certificate subjects stay neutral) |
| `--host` | `localhost` (use the DNS name or IP clients will dial) |

The directory contains `ca.pem`, `ca-key.pem`, `server.pem`, `server-key.pem`, `client.pem`, `client-key.pem` and `bundle.json` (key files and `bundle.json` are `0600`). The command ends by printing the agent start command and the server certificate fingerprint to pin.

### certs client

Signs a **new** client certificate with the bundle's CA and writes one JSON file with everything that client needs: the CA, the certificate, the private key encrypted under a transfer passphrase (12 characters or more; scrypt and AES-256-GCM), the agent address and the server fingerprint to pin.

| Flag | Default |
|------|---------|
| `--bundle` | required: the directory holding the CA key |
| `--name` | `workbench` (the machine or person, becomes the certificate subject) |
| `--endpoint` | `https://<host of the server certificate>:8443` |
| `--out` | `<bundle>/clients/<name>-client.json` |
| `--passphrase-file` | read the passphrase from a file instead of the terminal |

Do not copy `client-key.pem` from the bundle to another machine: it only opens with the vault of the user who generated it. Issue a client file instead. Each machine gets its own certificate and can be recognised by its fingerprint.

### certs export

Packs the agent's **own** side (server certificate, its key under a passphrase, and the CA that verifies clients) into `server-credentials.json`, to run the agent on another host. Useful when the bundle was generated in the Workbench and the agent must run elsewhere.

### certs import

Installs a client or server credential file on this machine. It checks the certificate against the CA, decrypts the key with the passphrase and re-encrypts it under a random password in **this** machine's vault; the passphrase is not kept.

| Flag | Default |
|------|---------|
| `--dir` | the file's name without `.json` |
| `--passphrase-file` | read the passphrase from a file |

```bash
# On the agent host
rfswift agent certs client --bundle ~/.config/rfswift/remote/lab --name laptop
# -> ~/.config/rfswift/remote/lab/clients/laptop-client.json, move it to the laptop

# On the laptop: CLI import (or Workbench: Connection & security > Add agent > Import client credentials)
rfswift agent certs import laptop-client.json --dir ~/.config/rfswift/remote/lab-client
```

---

## What the agent serves

Authenticated clients get a typed control plane, not a shell: target listing across every engine of the host, inspection, start and stop, container and Nix creation as cancellable jobs with live progress, deletion, container configuration, image checks and pulls, profile defaults, audits, tool search and install, interactive terminals (PTY, ConPTY on Windows), mission-workspace artifact listing and transfer, engine status and prune, Nix garbage collection, and USB passthrough (macOS Lima, Windows usbipd). A few Workbench calls still run the remote `rfswift` binary through a bounded JSON argument array (never a shell), with `-q` so no banner reaches the output.

Unknown routes are closed without a response. Without a trusted client certificate nothing answers, not even `/health` or `/v1/info`.

---

## Common errors

| Error | Meaning |
|-------|---------|
| `secure store: ...` | Unlock or start the current non-root user's native vault |
| `secret not found in keyring` | The reference in `bundle.json` does not match this vault; the message names the reference and key file |
| `missing --cert, --key, ...` | Pass `--bundle DIR`, or every file and the reference explicitly |
| `read client CA ... no such file` | `--client-ca` must be `ca.pem`, not a vault reference |
| `agent certificate pin changed` (client side) | The pinned fingerprint belongs to another bundle's server certificate. Issue a new client file from the agent's current bundle |
| `wrong passphrase, or the credential file is damaged` | The passphrase at import differs from the one chosen at issue time |
| Connected, but no containers listed | The Workbench engine doctor shows the agent host's engines as the agent's user sees them. A Docker socket that user cannot open means the `docker` group was joined after the agent's session started: log out and in, and restart the agent. Only containers with the `org.container.project=rfswift` label are listed |

## Related

- [Remote agent guide](/docs/guide/remote-agent): security model, VPN-first deployment, Workbench connection, Windows notes, limits
- [Known limits](/docs/guide/limitations#remote-agent-mode)
- [Workbench](/docs/guide/workbench)
