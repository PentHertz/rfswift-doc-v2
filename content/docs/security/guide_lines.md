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