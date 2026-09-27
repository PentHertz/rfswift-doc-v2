---
title: "Security guidelines"
level: advanced
description: "Practical rules for running RF Swift containers safely: Docker access, privileges, capabilities, networks, remote desktops and recordings."
weight: 5
---

Practical rules for running RF Swift safely on your machine and in client environments. Each section says what the setting does, what can go wrong, and what we recommend.

**In short**

- Keep containers **unprivileged** (`-u 0`, the default) and add **only** the capabilities and device rules a tool needs.
- Add sensitive capabilities for the time you need them, then remove them with `rfswift config capabilities rm`.
- Prefer `bridge` or `none` networking when a tool doesn't need the host network.
- Keep remote desktops on `127.0.0.1`. When you must expose one, use a password **and** SSL, or an SSH tunnel.
- Treat session recordings like penetration-test reports.

{{< callout type="info" >}}
The examples use the v4 command `rfswift container create`. The older spelling `rfswift run` still works with the same flags.
{{< /callout >}}

## Docker permissions

### Running Docker without sudo (Linux)

On Linux, the Docker service runs as root. The simplest way to use it without `sudo` is to let RF Swift grant your user access. It adds you to the `docker` group and sets a socket ACL, effective right away, with no logout needed:

```bash
rfswift host docker-access
```

To do the same by hand:

1. **Create the docker group** (if it doesn't exist):
   ```bash
   sudo groupadd docker
   ```
2. **Add your user to the docker group**:
   ```bash
   sudo usermod -aG docker $USER
   ```
3. **Apply the new group membership**:
   ```bash
   newgrp docker
   ```
4. **Verify it works**:
   ```bash
   docker run hello-world
   ```

{{< callout type="warning" title="The docker group is root-equivalent" >}}
Users in the `docker` group effectively have root privileges on the host. Only add trusted users to this group. Rootless [Podman](/docs/guide/podman/) avoids this entirely.
{{< /callout >}}

### Docker Desktop security (Windows and macOS)

Docker Desktop handles permissions for you:

- **Windows**: Docker Desktop runs through a VM and doesn't require admin rights for normal operation after installation.
- **macOS**: Docker Desktop handles permissions through the application.

**Recommended settings**

- Enable the "Use Docker Compose V2" option.
- Enable the "Use containerd for pulling and storing images" option.
- Keep Docker Desktop updated to the latest version.

## Container security parameters

RF Swift gives you several ways to control what a container can access. From broadest to finest:

| Mechanism | Flag | Controls |
|---|---|---|
| Privileged mode | `-u 1` / `-u 0` | Everything at once (avoid) |
| Linux capabilities | `-a` | Specific kernel privileges |
| Seccomp profile | `-m` | Which system calls are allowed |
| Cgroup device rules | `-g` | Which devices can be opened |

### Privileged mode

```bash
rfswift container create -u 1  # Privileged mode (1)
rfswift container create -u 0  # Unprivileged mode (0)
```

{{< callout type="warning" title="Privileged containers can escape isolation" >}}
Privileged containers can access all devices on the host and potentially escape container isolation. Use unprivileged mode (`-u 0`) whenever possible: it is the default in RF Swift, and it is never required for USB devices.
{{< /callout >}}

### Linux capabilities

Capabilities are a finer-grained alternative to privileged mode:

```bash
rfswift container create -a NET_ADMIN,SYS_PTRACE  # Add specific capabilities
```

| Capability | Use case | Security risk | Recommendation |
|------------|----------|---------------|----------------|
| `NET_ADMIN` | Wi-Fi/Bluetooth tools | Network traffic interception | Only use with networking tools |
| `NET_RAW` | Raw socket access | Packet spoofing | Only use with specific networking tools |
| `SYS_PTRACE` | Debugging | Process inspection, memory access | Only use for debugging or reverse engineering |
| `SYS_ADMIN` | Mount operations | Almost root equivalent | Avoid unless absolutely necessary |
| `MKNOD` | Create device nodes | Create arbitrary devices | Rarely needed, avoid |
| `CHOWN` | Change file ownership | Permission escalation | Rarely needed for RF tools |

**Recommendation**: add only the capabilities your tools require. RF Swift automatically configures common capabilities for specific image types.

### Seccomp profiles

Seccomp filters restrict the system calls a container can make:

```bash
rfswift container create -m /path/to/seccomp.json  # Use custom seccomp profile
```

By default, RF Swift uses Docker's default seccomp profile, which blocks about 44 system calls out of 300+.

For highly sensitive environments, create a custom profile:

1. Start with the [default Docker profile](https://github.com/moby/moby/blob/master/profiles/seccomp/default.json).
2. Modify it to allow only the required system calls.
3. Test thoroughly with your specific tools.

{{< callout type="warning" >}}
Overly restrictive seccomp profiles can make tools fail in unexpected ways.
{{< /callout >}}

### Control groups (cgroups)

Cgroup rules limit which devices a container can use:

```bash
rfswift container create -g "c 189:* rwm,c 166:* rwm"  # Allow specific device access
```

| Rule | Devices | Use case |
|------|---------|----------|
| `c 189:* rwm` | USB serial devices (ttyUSB*) | RTL-SDR, HackRF |
| `c 166:* rwm` | ACM devices (ttyACM*) | Proxmark3, Arduino |
| `c 188:* rwm` | USB serial converters | Various adapters |
| `c 116:* rwm` | ALSA devices | Audio capture |
| `c 226:* rwm` | DRI (GPU) | OpenCL acceleration |

**How to read a rule**

- `c` = character device, `b` = block device.
- `Major#:Minor#` = device identifier (use `*` for all minor devices).
- `r` = read, `w` = write, `m` = mknod (create device files).

## Add permissions only while you need them

One of RF Swift's key advantages is that you can add or remove permissions on an existing container:

```bash
# Temporarily add NET_ADMIN capability
rfswift config capabilities add -c my_container -p NET_ADMIN

# When finished with sensitive operations
rfswift config capabilities rm -c my_container -p NET_ADMIN
```

**Best practice**: add sensitive capabilities only when needed, and remove them immediately afterwards. More in [Change a container after creation](/docs/guide/container-management/).

## Network isolation

Control a container's network access with `-t`:

```bash
# Complete network isolation
rfswift container create -t none -n isolated_container

# Bridge network with limited connectivity
rfswift container create -t bridge -n bridge_container
```

| Mode | What the container gets |
|---|---|
| `host` | Full network access (the default, needed by many RF tools) |
| `bridge` | An isolated network with optional port forwarding |
| `nat` / `nat:NAME` | An RF Swift NAT network: an isolated bridge network with its own subnet, which several containers can share to talk to each other. See [network](/docs/commands/network/) |
| `none` | No network access (highest security) |

## Session recording security

Session recordings are valuable for documentation and compliance, but they capture **everything** displayed in your terminal.

| Lower-risk data | High-risk data |
|---|---|
| Command sequences and tool usage | Credentials entered in plaintext (passwords, tokens, API keys) |
| Tool output and results | Target system information (IP addresses, hostnames, network architecture) |
| System configurations | Exploitation techniques and payloads |
| | Captured traffic and sensitive network data |
| | File contents displayed in the terminal |
| | Private keys or certificates displayed |

{{< callout type="warning" title="Recordings can compromise assessed systems" >}}
Treat session recordings with the same security level as penetration-testing reports: they contain enough information to compromise the systems you assessed. Storage, sharing and encryption practices are in the [Security overview](/docs/security/#session-recording-security).
{{< /callout >}}

## Remote desktop security

The `--desktop` option starts a VNC/noVNC server inside the container for remote GUI access. It is convenient, but VNC carries risks as soon as the desktop is reachable beyond localhost.

### What runs when the desktop is on

| Service | Protocol | Default port | Purpose |
|---------|----------|-------------|---------|
| TigerVNC | VNC (RFB) | 5900 | VNC server rendering the desktop |
| websockify + noVNC | HTTP/WebSocket | 6080 | Browser-based VNC access |

By default these bind to `127.0.0.1` (localhost only), so only the host machine can connect. When bound to `0.0.0.0` or to a network-facing IP (for example `192.168.1.10`), anyone who can reach that address and port can try to connect.

### Threat model

| Threat | Risk | Mitigation |
|--------|------|------------|
| Unauthenticated access | **Critical**: full desktop control | Use `--desktop-pass` |
| Eavesdropping on VNC traffic | **High**: keystrokes and screen content are visible | Use `--desktop-ssl` |
| Brute-force VNC password | **Medium**: VNC passwords are limited to 8 chars | Combine with firewall rules, use SSL |
| Exposed port on public network | **High**: internet-wide scanning for VNC | Bind to `127.0.0.1` (default), use SSH tunnel, or restrict with firewall |
| Self-signed certificate MITM | **Low**: an attacker on the same network could intercept | Pin certificate or use trusted CA cert |

### Four security levels

Pick the level that matches your environment.

| Level | Setup | When to use it |
|---|---|---|
| 1. Local only (default) | `--desktop` | The desktop is only used from the host |
| 2. Password | `--desktop-pass` on a network address | Trusted local network, short sessions |
| 3. SSL + password | `--desktop-pass` and `--desktop-ssl` | **Recommended** for any network exposure |
| 4. SSH tunnel | Desktop on localhost + `ssh -L` | Maximum security |

#### Level 1: local only (default)

The desktop is bound to localhost, so only the host machine can reach it:

```bash
rfswift container create -i sdr_full -n my_sdr --desktop
# Accessible at http://127.0.0.1:6080 from the host only
```

This is the safest option and suits most local development and testing.

#### Level 2: password-protected

For remote access from other machines on your network, bind to `0.0.0.0` (all interfaces) or to a specific network IP:

```bash
# Expose on all interfaces
rfswift container create -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password"

# Expose on a specific network interface
rfswift container create -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:192.168.1.10:6080" \
  --desktop-pass "a-strong-password"
```

{{< callout type="warning" >}}
- **Any IP other than `127.0.0.1`/`localhost` makes the desktop reachable from the network.** Binding to a specific IP (for example `192.168.1.10`) limits exposure to that interface, but does not replace authentication or encryption.
- **VNC password limitation**: the VNC protocol truncates passwords to 8 characters. This applies to direct VNC connections; noVNC (browser) transmits the full password over WebSocket before the VNC layer truncates it. Use SSL to protect the password in transit.
{{< /callout >}}

#### Level 3: SSL + password (recommended for network exposure)

Full encryption with authentication, the recommended setup for any non-localhost deployment:

```bash
rfswift container create -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl
```

This enables:

- **TLS encryption** on the VNC layer (X509Vnc security type);
- **HTTPS** for noVNC browser access (websockify with `--cert`/`--key`);
- an **auto-generated self-signed certificate** stored at `/root/.vnc/rfswift.pem`.

For direct VNC clients with SSL:

```bash
rfswift container create -i sdr_full -n my_sdr \
  --desktop --desktop-config "vnc:0.0.0.0:5900" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl
# Connect with: vncs://host:5900
```

#### Level 4: SSH tunnel (maximum security)

Keep the desktop on localhost and tunnel through SSH:

```bash
# On the RF Swift host, the desktop stays on localhost
rfswift container create -i sdr_full -n my_sdr --desktop

# From your remote machine, create an SSH tunnel
ssh -L 6080:127.0.0.1:6080 user@rfswift-host
# Then open http://127.0.0.1:6080 in your local browser
```

No VNC password or SSL is needed, since all traffic is encrypted through the SSH tunnel, and SSH keys provide strong authentication.

### Disable X11 for desktop-only containers

With desktop mode you usually don't need X11 forwarding. `--no-x11` removes the `/tmp/.X11-unix` socket mount from the container, which prevents any X11-based access to the host display server:

```bash
rfswift container create -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl \
  --no-x11
```

### Config file security

Desktop settings can be saved in `~/.config/rfswift/config.ini`:

```ini
[desktop]
proto = http
host = 127.0.0.1
port = 6080
password = mysecretpass
ssl = true
```

{{< callout type="warning" title="The password is stored in plaintext" >}}
Restrict the file's permissions:

```bash
chmod 600 ~/.config/rfswift/config.ini
```
{{< /callout >}}

### Desktop security checklist

Before exposing a desktop on the network, check that:

- [ ] `--desktop-pass` is set with a strong password
- [ ] `--desktop-ssl` is enabled for encrypted connections
- [ ] `--no-x11` is used if X11 forwarding is not needed
- [ ] the host firewall restricts access to the desktop port
- [ ] the container runs with minimal privileges (`-u 0`)
- [ ] the container uses a bridge network (`-t bridge`) if the host network is not required
- [ ] the config file permissions are set to `600`

{{< callout type="error" title="Never expose a VNC desktop without a password" >}}
Never expose a desktop on a network-facing address (`0.0.0.0` or a specific IP like `192.168.1.10`) without a password. Automated scanners actively probe for open VNC ports, and an unauthenticated desktop grants full GUI control over the container, including access to any connected hardware devices. Only `127.0.0.1` and `localhost` are safe without authentication.
{{< /callout >}}

## Secure configurations for real work

### SDR work with minimal privileges

```bash
# RTL-SDR with just the required devices
rfswift container create -i sdr_light -n secure_sdr -u 0 -g "c 189:* rwm" -t bridge
```

### Wi-Fi assessment with controlled capabilities and recording

```bash
# Start with minimal privileges, record for compliance
rfswift container create -i wifi -n wifi_assessment -a NET_ADMIN \
  --record --record-output /secure/assessments/wifi-test.cast
```

### Hardware reverse engineering with isolation

```bash
# Isolated environment for reverse engineering
rfswift container create -i reversing -n secure_reversing -u 0 -t none \
  -s /dev/ttyUSB0:/dev/ttyUSB0
```

### A full client assessment

```bash
# Complete secure workflow with recording
CLIENT="acme-corp"
DATE=$(date +%Y-%m-%d)
RECORDING_DIR="/secure/clients/$CLIENT/recordings"

mkdir -p "$RECORDING_DIR"
chmod 700 "$RECORDING_DIR"

# Run assessment with recording
rfswift container create -i network -n "${CLIENT}-assessment" \
  -u 0 -t bridge -a NET_ADMIN \
  --record --record-output "$RECORDING_DIR/${DATE}-assessment.cast"

# After assessment, secure the recording
chmod 600 "$RECORDING_DIR/${DATE}-assessment.cast"
gpg --encrypt --recipient security@company.com \
  "$RECORDING_DIR/${DATE}-assessment.cast"
shred -vfz -n 3 "$RECORDING_DIR/${DATE}-assessment.cast"
```

## Keeping up to date

Security is an ongoing process. Stay informed about:

- RF Swift updates (`rfswift update`);
- Docker security advisories;
- container security best practices;
- recording data protection regulations.

## Additional resources

- [Docker Security Documentation](https://docs.docker.com/engine/security/)
- [Linux Capabilities Documentation](https://man7.org/linux/man-pages/man7/capabilities.7.html)
- [Seccomp Security Profiles for Docker](https://docs.docker.com/engine/security/seccomp/)
- [Control Groups Documentation](https://www.kernel.org/doc/Documentation/cgroup-v1/devices.txt)
- [NIST Guidelines for Media Sanitization](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
