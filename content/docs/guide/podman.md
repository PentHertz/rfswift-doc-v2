---
title: Using Podman
weight: 7
prev: /docs/guide/vpn
next: /docs/guide/list-of-images
---

# Using RF Swift with Podman

RF Swift supports Podman as an alternative to Docker, enabling rootless and daemonless container workflows.

## Overview

Podman is a daemonless container engine that can run containers without root privileges. RF Swift auto-detects Podman and adapts its behavior for rootless compatibility.

### Docker vs Podman at a Glance

| Feature | Docker | Podman |
|---------|--------|--------|
| Architecture | Client-server (daemon) | Daemonless (fork-exec) |
| Root required | Yes (daemon) | No (rootless by default) |
| Device passthrough | Native | Supported |
| Cgroup rules | Full support | Not supported in rootless |
| Privileged mode | Full host access | User-namespace scoped |
| USB hotplug | With cgroup rules | Limited in rootless |
| Networking | Host/bridge | slirp4netns/pasta |

---

## Getting Started with Podman

### Installation

{{< tabs items="Ubuntu/Debian,Fedora,Arch,macOS" >}}
  {{< tab >}}
```bash
sudo apt install podman
```
  {{< /tab >}}
  {{< tab >}}
```bash
sudo dnf install podman
```
  {{< /tab >}}
  {{< tab >}}
```bash
sudo pacman -S podman
```
  {{< /tab >}}
  {{< tab >}}
```bash
brew install podman
podman machine init
podman machine start
```
  {{< /tab >}}
{{< /tabs >}}

### Configuration

```bash
# Ensure subordinate UID/GID ranges are configured
grep $USER /etc/subuid /etc/subgid

# If empty, add them
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Enable lingering (containers survive logout)
sudo loginctl enable-linger $USER

# Configure default registry to avoid prompts
echo 'unqualified-search-registries = ["docker.io"]' | sudo tee -a /etc/containers/registries.conf
```

### Using RF Swift with Podman

```bash
# Auto-detected (if Podman is the only engine)
rfswift run -i sdr_full -n my_sdr

# Explicit engine selection (if both Docker and Podman are installed)
rfswift --engine podman run -i sdr_full -n my_sdr
```

---

## Rootless Mode

By default, Podman runs rootless — no `sudo` required. RF Swift automatically adapts:

### What Works in Rootless Mode

- Container creation and management
- Image pulling and building
- Volume bindings (user-accessible paths)
- X11 forwarding
- Audio (PulseAudio/PipeWire)
- Session recording
- Remote desktop (VNC/noVNC)
- Network modes (slirp4netns/pasta)
- Tailscale/Netbird VPN (userspace mode)

### What Requires Root or Privileged Mode

- Device cgroup rules (USB hotplug)
- Some device nodes (`/dev/tty`, `/dev/console`, `/dev/vhci`, `/dev/uinput`)
- WireGuard/OpenVPN VPN
- Full TUN/TAP networking
- Raw hardware access

### Automatic Device Filtering

RF Swift automatically drops devices that can't be mapped in rootless mode:

```
[!] Dropping 5 inaccessible device(s) for rootless mode:
  - /dev/vhci
  - /dev/console
  - /dev/tty0
  - /dev/tty1
  - /dev/uinput
```

Devices that remain accessible (e.g., `/dev/bus/usb`, `/dev/snd`, `/dev/dri`) are kept.

### Cgroup Rules

Rootless Podman doesn't support device cgroup rules. RF Swift detects this and prompts:

```
[!] Rootless Podman does not support device cgroup rules.
[!] Rules that will be dropped: c 189:* rwm, c 166:* rwm, ...
[i] Device hotplug (USB, SDR dongles) may not work without cgroup rules.
[i] To use cgroup rules, run RF Swift with sudo.
```

{{< callout type="info" >}}
**Devices still work** — you can use USB devices that are plugged in before container start. What doesn't work without cgroup rules is **hotplug** (plugging/unplugging devices while the container is running).
{{< /callout >}}

---

## Running with Root (Podman + sudo)

For full hardware access, run Podman with `sudo`:

```bash
# Full hardware support with sudo
sudo rfswift --engine podman run -i sdr_full -n my_sdr \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm"
```

This gives you the same capabilities as Docker with root, including cgroup rules and full device access.

---

## Podman and VPN

### Tailscale/Netbird (Rootless)

Mesh VPNs work in rootless Podman using userspace networking:

```bash
rfswift --engine podman run -i sdr_full -n my_sdr --vpn tailscale
```

### WireGuard/OpenVPN (Requires Root)

Tunnel VPNs need privileged mode:

```bash
sudo rfswift --engine podman run -i sdr_full -n my_sdr \
  -u 1 \
  --vpn wireguard:./wg0.conf
```

---

## Podman-Specific Commands

### Image Registry

Podman may prompt for a registry when using short image names. RF Swift normalizes image names automatically, but you can also use full names:

```bash
# Short name (RF Swift resolves it)
rfswift --engine podman run -i sdr_full -n my_sdr

# Full name (no resolution needed)
rfswift --engine podman run -i docker.io/penthertz/rfswift_noble:sdr_full -n my_sdr
```

### Container Management

All RF Swift commands work with Podman:

```bash
# List containers
rfswift --engine podman last

# Enter container
rfswift --engine podman exec -c my_sdr

# Stop container
rfswift --engine podman stop -c my_sdr

# Remove container
rfswift --engine podman remove -c my_sdr

# Export/import
rfswift --engine podman export container -c my_sdr -o backup.tar.gz
rfswift --engine podman import container -i backup.tar.gz
```

---

## Networking

### Rootless Networking

Rootless Podman uses `slirp4netns` or `pasta` for networking instead of a real bridge:

```bash
# Host network (default) — works with slirp4netns
rfswift --engine podman run -i sdr_full -n my_sdr

# Bridge network
rfswift --engine podman run -i sdr_full -n my_sdr -t bridge

# Port forwarding with bridge
rfswift --engine podman run -i sdr_full -n my_sdr \
  -t bridge \
  -w 8080:80/tcp
```

{{< callout type="info" >}}
Port forwarding works in rootless mode but only for ports above 1024. To bind to low ports (e.g., 80, 443), use `sudo` or configure `sysctl net.ipv4.ip_unprivileged_port_start=0`.
{{< /callout >}}

### Remote Desktop with Podman

```bash
rfswift --engine podman run -i sdr_full -n sdr_desktop \
  --desktop \
  --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mypassword"
```

---

## Common Workflows

### Rootless SDR Analysis

```bash
# Pull image
rfswift --engine podman images pull -i sdr_full

# Create container (rootless)
rfswift --engine podman run -i sdr_full -n analysis \
  -b ~/captures:/root/captures \
  -s /dev/bus/usb:/dev/bus/usb

# Enter later
rfswift --engine podman exec -c analysis
```

### Full Hardware Setup (with sudo)

```bash
sudo rfswift --engine podman run -i sdr_full -n hw_work \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm,c 166:* rwm" \
  --realtime \
  -b ~/captures:/root/captures
```

### Air-Gapped Environment

Podman is ideal for air-gapped systems since it has no daemon:

```bash
# On connected machine: export image
rfswift --engine podman export image -i sdr_full -o sdr_full.tar.gz

# Transfer to air-gapped machine (USB, etc.)

# On air-gapped machine: import and run
rfswift --engine podman import image -i sdr_full.tar.gz
rfswift --engine podman run -i sdr_full -n offline_work -t none
```

---

## Troubleshooting

### "error creating device nodes"

**Error:** `error during container init: error creating device nodes: create device inode /dev/tty: no such device or address`

**Cause:** Rootless Podman can't create certain device nodes.

**Solution:** RF Swift automatically filters these. If you see this error, update to the latest RF Swift version. As a workaround, remove problematic devices:
```bash
# RF Swift handles this automatically, but you can also avoid the issue by not mapping tty devices
rfswift --engine podman run -i sdr_full -n my_sdr -s /dev/bus/usb:/dev/bus/usb
```

### "Rootless Podman does not support device cgroup rules"

**Not an error** — this is informational. Your container will still work; only USB hotplug is affected. Plug in devices before starting the container.

To get full cgroup support:
```bash
sudo rfswift --engine podman run ...
```

### Containers Not Visible Across Engines

Containers created with Docker are invisible to Podman and vice versa:

```bash
# Created with Docker? Use Docker to access it
rfswift --engine docker exec -c my_container

# Created with Podman? Use Podman
rfswift --engine podman exec -c my_container
```

### Image Pull Prompts

**Problem:** Podman asks which registry to use

**Solution:** Configure default registries:
```bash
echo 'unqualified-search-registries = ["docker.io"]' | sudo tee -a /etc/containers/registries.conf
```

### Permission Denied on /dev/bus/usb

**Solution:** Add your user to the correct groups:
```bash
sudo usermod -aG plugdev $USER
newgrp plugdev
```

Or use `sudo` for full access.

---

## Related

- [`engine`](/docs/commands/engine) - Container engine selection and comparison
- [`run`](/docs/commands/run) - Create and run containers
- [VPN Inside Containers](/docs/guide/vpn) - VPN support with Podman
- [Getting Started](/docs/getting-started) - Installation and setup
- [Air-Gapped Installation](/docs/air-gapped-installation) - Offline deployment

---

{{< callout emoji="🔒" >}}
**Security Advantage**: Podman's rootless mode provides better isolation than Docker. Even if a container escape occurs, the attacker only has unprivileged user access — not root.
{{< /callout >}}

{{< callout emoji="💡" >}}
**Tip**: For most RF work, rootless Podman is sufficient. Only use `sudo` when you need USB hotplug or WireGuard/OpenVPN VPN.
{{< /callout >}}
