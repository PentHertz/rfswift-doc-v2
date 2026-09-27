---
title: "rfswift agent"
linkTitle: "agent"
navGroup: "Remote access"
level: reference
description: "Serve a lab machine's engines to authenticated remote clients over mutual TLS."
weight: 80
---

`rfswift agent` lets you drive a lab machine from somewhere else. It serves that machine's engines (Docker, Podman, Lima, Nix) to authenticated clients.

A typical setup: a machine in the lab, or a small board next to the antenna, holds the SDR, RFID, serial or GPU hardware, and the [Workbench](/docs/guide/workbench) on your laptop controls it through the agent. The agent is built into the `rfswift` binary. The alias `rfswift remote` works too.

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

Starts the agent. It uses TLS 1.3, and clients must present their own certificate (mutual TLS). The agent prints its "listening" line only after it has decrypted its key from the OS vault and opened its port.

| Flag | Description | Default |
|------|-------------|---------|
| `--bind` | Listen address. Loopback is recommended; expose through VPN or SSH | `127.0.0.1:8443` |
| `--bundle` | Directory written by `certs init`. Its `bundle.json` supplies the certificate, the key, the key's vault reference and the client CA | |
| `--cert` | Server certificate PEM | `server.pem` of the bundle |
| `--key` | Encrypted server key PEM. Given alone, the `bundle.json` next to it supplies the reference and CA | `server-key.pem` of the bundle |
| `--key-ref` | Secure-store reference of the encrypted key | `ServerKeyRef` of `bundle.json` |
| `--client-ca` | CA PEM that clients must be signed by (`ca.pem`) | `ca.pem` of the bundle |
| `--name` | Display name reported to clients | `RF Swift agent` |

If something is missing, the agent lists it by flag name. It refuses to start without a client CA or with an unencrypted key.

Generate the certificates once, then start the agent:

```bash
rfswift agent certs init --dir ~/.config/rfswift/remote/lab --name lab-agent --host lab.internal
rfswift agent --bundle ~/.config/rfswift/remote/lab
```

Run the agent as the **same user** that ran `certs init`. The key passwords are stored in that user's vault (Secret Service on Linux, Keychain on macOS, Credential Manager on Windows), and a service running under another account cannot open them. If the vault is unavailable, RF Swift refuses to start rather than run unprotected.

---

## rfswift agent certs

### certs init

Creates a private certificate authority (CA), a server certificate for `--host`, and a first client certificate. Every private key is encrypted with a random password (PKCS#8). The passwords are stored in the OS vault, and `bundle.json` records where to find them.

| Flag | Default |
|------|---------|
| `--dir` | `./rfswift-agent-certs` |
| `--name` | `rfswift-agent` (recorded in `bundle.json`; certificate subjects stay neutral) |
| `--host` | `localhost` (use the DNS name or IP clients will dial) |

The directory then contains `ca.pem`, `ca-key.pem`, `server.pem`, `server-key.pem`, `client.pem`, `client-key.pem` and `bundle.json` (the key files and `bundle.json` are `0600`). At the end, the command prints how to start the agent and the server certificate fingerprint that clients should pin.

### certs client

Creates a **new** client certificate, signed by the bundle's CA, and writes a single JSON file with everything that client needs:

- the CA and the client certificate;
- the private key, encrypted with a transfer passphrase you choose (12 characters or more; scrypt and AES-256-GCM);
- the agent address and the server fingerprint to pin.

| Flag | Default |
|------|---------|
| `--bundle` | required: the directory holding the CA key |
| `--name` | `workbench` (the machine or person, becomes the certificate subject) |
| `--endpoint` | `https://<host of the server certificate>:8443` |
| `--out` | `<bundle>/clients/<name>-client.json` |
| `--passphrase-file` | read the passphrase from a file instead of the terminal |

Don't copy `client-key.pem` from the bundle to another machine: it only opens with the vault of the user who created it. Issue a client file instead. Each machine then gets its own certificate, recognisable by its fingerprint.

### certs export

Packs the agent's **own** side (its server certificate, its key protected by a passphrase, and the CA that checks clients) into `server-credentials.json`, so you can run the agent on another host. This is useful when you created the bundle in the Workbench but the agent must run elsewhere.

### certs import

Installs a client or server credential file on this machine. It checks the certificate against the CA, decrypts the key with your passphrase, then re-encrypts it with a new random password stored in **this** machine's vault. The passphrase itself is not kept.

| Flag | Default |
|------|---------|
| `--dir` | the file's name without `.json` |
| `--passphrase-file` | read the passphrase from a file |

A typical exchange: issue a file on the agent host, move it to the laptop, and import it there.

```bash
# On the agent host
rfswift agent certs client --bundle ~/.config/rfswift/remote/lab --name laptop
# -> ~/.config/rfswift/remote/lab/clients/laptop-client.json, move it to the laptop

# On the laptop: CLI import (or Workbench: Connection & security > Add agent > Import client credentials)
rfswift agent certs import laptop-client.json --dir ~/.config/rfswift/remote/lab-client
```

---

## What the agent serves

Authenticated clients get a fixed set of typed operations, not a shell:

- list the targets of every engine on the host, inspect them, start and stop them;
- create containers and Nix environments as cancellable jobs with live progress, delete them, configure containers;
- check and pull images, read profile defaults, run audits, search and install tools;
- open interactive terminals (PTY, ConPTY on Windows);
- list and transfer artifacts from mission workspaces;
- see engine status, reclaim space, collect Nix garbage;
- pass USB devices through (Lima on macOS, usbipd on Windows).

A few Workbench calls still run the remote `rfswift` binary, always through a bounded JSON argument array (never a shell) and with `-q` so no banner reaches the output.

Unknown requests are closed without a response. Without a trusted client certificate nothing answers at all, not even `/health` or `/v1/info`.

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
