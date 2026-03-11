---
title: Security guidelines
weight: 5
cascade:
  type: docs
---


# 🛡️ RF Swift Security Guidelines

This document provides important security guidelines for using RF Swift in various environments. Following these recommendations will help you maintain a secure system while enjoying the full capabilities of RF Swift.

## 🐳 Docker Permissions

### Running Docker Without Sudo (Linux) 🐧

By default, Docker requires root privileges on Linux systems, but this can be a security concern. Here's how to use Docker without `sudo`:

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

⚠️ **Security Implications**: Users in the docker group effectively have root privileges on the host. Only add trusted users to this group.

### Docker Desktop Security (Windows & macOS) 🪟 🍎

Docker Desktop provides a more user-friendly approach to permissions:

- **Windows**: Docker Desktop runs through a VM and doesn't require admin rights for normal operation after installation
- **macOS**: Docker Desktop handles permissions through the application

🔒 **Recommended Settings**:
- Enable the "Use Docker Compose V2" option
- Enable the "Use containerd for pulling and storing images" option
- Keep Docker Desktop updated to the latest version

## 🔐 Container Security Parameters

RF Swift provides several mechanisms to control container privileges and access:

### Privileged Mode 🚨

```bash
rfswift run -u 1  # Privileged mode (1)
rfswift run -u 0  # Unprivileged mode (0)
```

⚠️ **Security Risk**: Privileged containers can access all devices on the host and potentially escape container isolation.

🛡️ **Recommendation**: Use unprivileged mode (`-u 0`) whenever possible, which is the default in RF Swift.

### Linux Capabilities 🧢

Capabilities provide a more granular approach to permissions than privileged mode:

```bash
rfswift run -a NET_ADMIN,SYS_PTRACE  # Add specific capabilities
```

#### Common Capabilities and Risks

| Capability | Use Case | Security Risk | Recommendation |
|------------|----------|---------------|----------------|
| `NET_ADMIN` | Wi-Fi/Bluetooth tools | Network traffic interception | Only use with networking tools |
| `NET_RAW` | Raw socket access | Packet spoofing | Only use with specific networking tools |
| `SYS_PTRACE` | Debugging | Process inspection, memory access | Only use for debugging or reverse engineering |
| `SYS_ADMIN` | Mount operations | Almost root equivalent | Avoid unless absolutely necessary |
| `MKNOD` | Create device nodes | Create arbitrary devices | Rarely needed, avoid |
| `CHOWN` | Change file ownership | Permission escalation | Rarely needed for RF tools |

🛡️ **Recommendation**: Only add the specific capabilities required for your tools. RF Swift automatically configures common capabilities for specific image types.

### Seccomp Profiles 🔒

Seccomp filters restrict the system calls a container can make:

```bash
rfswift run -m /path/to/seccomp.json  # Use custom seccomp profile
```

🛡️ **Default Profile**: RF Swift uses Docker's default seccomp profile which blocks ~44 system calls out of 300+.

#### Creating Custom Seccomp Profiles

For highly sensitive environments, create a custom profile:

1. Start with the [default Docker profile](https://github.com/moby/moby/blob/master/profiles/seccomp/default.json)
2. Modify it to allow only required system calls
3. Test thoroughly with your specific tools

⚠️ **Warning**: Overly restrictive seccomp profiles can cause tools to fail in unexpected ways.

### Control Groups (cgroups) 🧩

Cgroups limit container access to devices:

```bash
rfswift run -g "c 189:* rwm,c 166:* rwm"  # Allow specific device access
```

#### Common cgroup Rules

| Rule | Devices | Use Case |
|------|---------|----------|
| `c 189:* rwm` | USB serial devices (ttyUSB*) | RTL-SDR, HackRF |
| `c 166:* rwm` | ACM devices (ttyACM*) | Proxmark3, Arduino |
| `c 188:* rwm` | USB serial converters | Various adapters |
| `c 116:* rwm` | ALSA devices | Audio capture |
| `c 226:* rwm` | DRI (GPU) | OpenCL acceleration |

🛡️ **Format Explanation**:
- `c` = character device, `b` = block device
- `Major#:Minor#` = device identifier (use `*` for all minor devices)
- `r` = read, `w` = write, `m` = mknod (create device files)

## 🔄 Dynamic Permission Management

One of RF Swift's key advantages is the ability to add or remove permissions dynamically:

```bash
# Temporarily add NET_ADMIN capability
rfswift bindings add -c my_container -a NET_ADMIN

# When finished with sensitive operations
rfswift bindings remove -c my_container -a NET_ADMIN
```

🛡️ **Best Practice**: Add sensitive capabilities only when needed and remove them immediately afterward.

## 🌐 Network Isolation

Control the container's network access for added security:

```bash
# Complete network isolation
rfswift run -t none -n isolated_container

# Bridge network with limited connectivity
rfswift run -t bridge -n bridge_container
```

🛡️ **Network Modes**:
- `host`: Full network access (default, needed for many RF tools)
- `bridge`: Isolated network with optional port forwarding
- `none`: No network access (highest security)
- `custom`: Create custom networks for container-to-container communication

## 📹 Session Recording Security

RF Swift's session recording feature provides valuable documentation and compliance capabilities, but recordings contain sensitive information that requires careful handling.

### Understanding Recording Data Sensitivity 🎥

Session recordings capture **everything** displayed in your terminal session, including:

**Low-Risk Data:**
- Command sequences and tool usage
- Tool output and results
- System configurations

**High-Risk Data:**
- 🔑 Credentials entered in plaintext (passwords, tokens, API keys)
- 🎯 Target system information (IP addresses, hostnames, network architecture)
- 🛠️ Exploitation techniques and payloads
- 📊 Captured traffic and sensitive network data
- 💾 File contents displayed in terminal
- 🔐 Private keys or certificates displayed

⚠️ **Critical Warning**: Treat session recordings with the same security level as penetration testing reports. They contain sufficient information to compromise assessed systems.


## 🖥️ Remote Desktop Security

RF Swift's `--desktop` feature starts a VNC/noVNC server inside the container for remote GUI access. While convenient, VNC connections carry security risks that must be addressed — especially when the desktop is exposed beyond localhost.

### Understanding the Attack Surface

When you enable desktop mode, the following services run inside the container:

| Service | Protocol | Default Port | Purpose |
|---------|----------|-------------|---------|
| TigerVNC | VNC (RFB) | 5900 | VNC server rendering the desktop |
| websockify + noVNC | HTTP/WebSocket | 6080 | Browser-based VNC access |

By default, these bind to `127.0.0.1` (localhost only), which means only the host machine can connect. However, when bound to `0.0.0.0` or a specific network-facing IP (e.g., `192.168.1.10`), anyone who can reach that address and port can attempt to connect.

### Threat Model

| Threat | Risk | Mitigation |
|--------|------|------------|
| Unauthenticated access | **Critical** — full desktop control | Use `--desktop-pass` |
| Eavesdropping on VNC traffic | **High** — keystrokes, screen content visible | Use `--desktop-ssl` |
| Brute-force VNC password | **Medium** — VNC passwords are limited to 8 chars | Combine with firewall rules, use SSL |
| Exposed port on public network | **High** — internet-wide scanning for VNC | Bind to `127.0.0.1` (default), use SSH tunnel, or restrict with firewall |
| Self-signed certificate MITM | **Low** — attacker on same network could intercept | Pin certificate or use trusted CA cert |

### Security Levels

Choose the appropriate level based on your environment:

#### Level 1: Local-only (Default) ✅

Desktop bound to localhost — only reachable from the host machine:

```bash
rfswift run -i sdr_full -n my_sdr --desktop
# Accessible at http://127.0.0.1:6080 from the host only
```

This is the safest option and suitable for most local development and testing scenarios.

#### Level 2: Password-protected 🔒

When you need remote access from other machines on your network, binding to `0.0.0.0` (all interfaces) or a specific network IP:

```bash
# Expose on all interfaces
rfswift run -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password"

# Expose on a specific network interface
rfswift run -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:192.168.1.10:6080" \
  --desktop-pass "a-strong-password"
```

⚠️ **Any IP other than `127.0.0.1`/`localhost` makes the desktop reachable from the network.** Binding to a specific IP (e.g., `192.168.1.10`) limits exposure to that interface but does not replace authentication or encryption.

⚠️ **VNC password limitation**: The VNC protocol truncates passwords to 8 characters. While this applies to direct VNC connections, noVNC (browser) transmits the full password over WebSocket before the VNC layer truncates it. Use SSL to protect the password in transit.

#### Level 3: SSL + Password (Recommended for network exposure) 🔐

Full encryption with authentication — the recommended setup for any non-localhost deployment:

```bash
rfswift run -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl
```

This enables:
- **TLS encryption** on the VNC layer (X509Vnc security type)
- **HTTPS** for noVNC browser access (websockify with `--cert`/`--key`)
- **Auto-generated self-signed certificate** stored at `/root/.vnc/rfswift.pem`

For direct VNC clients with SSL:
```bash
rfswift run -i sdr_full -n my_sdr \
  --desktop --desktop-config "vnc:0.0.0.0:5900" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl
# Connect with: vncs://host:5900
```

#### Level 4: SSH Tunnel (Maximum security) 🛡️

For the highest security, keep the desktop on localhost and tunnel through SSH:

```bash
# On the RF Swift host — desktop stays on localhost
rfswift run -i sdr_full -n my_sdr --desktop

# From your remote machine — create an SSH tunnel
ssh -L 6080:127.0.0.1:6080 user@rfswift-host
# Then open http://127.0.0.1:6080 in your local browser
```

This approach requires no VNC password or SSL since all traffic is encrypted through the SSH tunnel. It also provides strong authentication via SSH keys.

### Disabling X11 for Desktop-only Containers

When using desktop mode, you typically don't need X11 forwarding. Use `--no-x11` to remove the X11 socket binding from the container, reducing the attack surface:

```bash
rfswift run -i sdr_full -n my_sdr \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "a-strong-password" \
  --desktop-ssl \
  --no-x11
```

The `--no-x11` flag removes the `/tmp/.X11-unix` socket mount, preventing any X11-based access to the host display server.

### Config File Security

Desktop settings can be persisted in `~/.config/rfswift/config.ini`:

```ini
[desktop]
proto = http
host = 127.0.0.1
port = 6080
password = mysecretpass
ssl = true
```

⚠️ **The password is stored in plaintext** in this file. Ensure appropriate file permissions:

```bash
chmod 600 ~/.config/rfswift/config.ini
```

### Comparison with Other Frameworks

| Feature | RF Swift | Exegol |
|---------|----------|--------|
| VNC encryption | Optional (`--desktop-ssl`), X509 security types | Always-on TLS (`TLSPlain`) |
| noVNC/browser encryption | Optional (`--desktop-ssl`), HTTPS via websockify | Not supported |
| Authentication | VNC password (`--desktop-pass`) | PAM-based (system user/password) |
| Default binding | `127.0.0.1` (localhost) | Container hostname |
| SSL certificate | Auto-generated self-signed | Auto-generated by TigerVNC |
| User control | Full CLI flags for each option | Automatic, fewer knobs |

RF Swift gives you explicit control over each security layer, while Exegol takes an opinionated approach with TLS always enabled on the VNC layer but no encryption on the noVNC/browser path.

### Desktop Security Checklist

Before exposing a desktop on the network, verify:

- [ ] `--desktop-pass` is set with a strong password
- [ ] `--desktop-ssl` is enabled for encrypted connections
- [ ] `--no-x11` is used if X11 forwarding is not needed
- [ ] Host firewall restricts access to the desktop port
- [ ] Container runs with minimal privileges (`-u 0`)
- [ ] Container uses bridge network (`-t bridge`) if host network is not required
- [ ] Config file permissions are set to `600`

{{< callout type="warning" >}}
**Never expose a VNC desktop on a network-facing address (`0.0.0.0` or a specific IP like `192.168.1.10`) without a password.** Automated scanners actively probe for open VNC ports, and an unauthenticated desktop grants full GUI control over the container — including access to any connected hardware devices. Only `127.0.0.1` and `localhost` are safe without authentication.
{{< /callout >}}

## 🌟 Real-World Secure Configurations

### SDR Work with Minimal Privileges

```bash
# RTL-SDR with just the required devices
rfswift run -i sdr_light -n secure_sdr -u 0 -g "c 189:* rwm" -t bridge
```

### Wi-Fi Assessment with Controlled Capabilities and Recording

```bash
# Start with minimal privileges, record for compliance
rfswift run -i wifi -n wifi_assessment -a NET_ADMIN \
  --record --record-output /secure/assessments/wifi-test.cast
```

### Hardware Reverse Engineering with Isolation

```bash
# Isolated environment for reverse engineering
rfswift run -i reversing -n secure_reversing -u 0 -t none \
  -s /dev/ttyUSB0:/dev/ttyUSB0
```

### Full Client Assessment example

```bash
# Complete secure workflow with recording
CLIENT="acme-corp"
DATE=$(date +%Y-%m-%d)
RECORDING_DIR="/secure/clients/$CLIENT/recordings"

mkdir -p "$RECORDING_DIR"
chmod 700 "$RECORDING_DIR"

# Run assessment with recording
rfswift run -i pentest -n "${CLIENT}-assessment" \
  -u 0 -t bridge -a NET_ADMIN \
  --record --record-output "$RECORDING_DIR/${DATE}-assessment.cast"

# After assessment, secure the recording
chmod 600 "$RECORDING_DIR/${DATE}-assessment.cast"
gpg --encrypt --recipient security@company.com \
  "$RECORDING_DIR/${DATE}-assessment.cast"
shred -vfz -n 3 "$RECORDING_DIR/${DATE}-assessment.cast"
```

## 🔄 Keeping Updated

Security is an ongoing process. Stay informed about:

- 🔔 RF Swift updates
- 🐳 Docker security advisories
- 🛡️ Container security best practices
- 📹 Recording data protection regulations

## 📚 Additional Resources

- [Docker Security Documentation](https://docs.docker.com/engine/security/)
- [Linux Capabilities Documentation](https://man7.org/linux/man-pages/man7/capabilities.7.html)
- [Seccomp Security Profiles for Docker](https://docs.docker.com/engine/security/seccomp/)
- [Control Groups Documentation](https://www.kernel.org/doc/Documentation/cgroup-v1/devices.txt)
- [NIST Guidelines for Media Sanitization](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final)
- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)