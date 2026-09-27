---
title: "Using Podman"
linkTitle: "Podman"
level: intermediate
description: "Run RF Swift with rootless, daemonless Podman: why you'd pick it, how to set it up, and what rootless mode changes."
weight: 7
---

Podman is a container engine that runs **without a background service and without root rights**. RF Swift supports it as a full alternative to Docker: the same toolboxes, the same commands and the same Workbench. RF Swift detects Podman automatically and adapts to its rootless mode for you.

## Why pick Podman

- **Rootless by default**: your labs run as you, not as root. Even if a container escape occurred, the attacker would only get unprivileged user access, not root.
- **No daemon**: nothing runs in the background when you are not using it, which also helps on small boards with little memory.
- **Good for sensitive setups**: shared or company machines, security-focused environments, and air-gapped networks.
- **Open source everywhere**: on Windows, Podman Desktop is the open-source alternative to Docker Desktop.

{{< callout type="tip" >}}
For most RF work, rootless Podman is enough. You only need `sudo` for USB hot-plug (plugging a device in while the lab runs) or for WireGuard/OpenVPN VPNs.
{{< /callout >}}

Comparing all four engines: [Choose your engine](/docs/engines/).

### Docker and Podman at a glance

| Feature | Docker | Podman |
|---------|--------|--------|
| Architecture | Client-server (daemon) | Daemonless (fork-exec) |
| Root required | Yes (daemon) | No (rootless by default) |
| Device passthrough | Native | Supported |
| Cgroup rules | Full support | Not supported in rootless |
| Privileged mode | Full host access | User-namespace scoped |
| USB hotplug | With cgroup rules | Limited in rootless |
| Networking | Host/bridge | slirp4netns/pasta |

## Getting started

### 1. Install Podman

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

On macOS, Podman runs in a VM (`podman machine`) that cannot receive USB devices. For radios on a Mac, use the Lima or Nix engine: see [Choose your engine](/docs/engines/).
  {{< /tab >}}
{{< /tabs >}}

### 2. One-time setup (Linux)

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

# Let your user open RF hardware (rules inside a container are never evaluated)
rfswift host udev
```

### 3. Create a lab

```bash
# Auto-detected (if Podman is the only engine)
rfswift container create -i sdr_full -n my_sdr

# Explicit engine selection (if both Docker and Podman are installed)
rfswift --engine podman container create -i sdr_full -n my_sdr
```

The legacy spelling `rfswift run` still works.

## Rootless mode

By default Podman runs rootless, so no `sudo` is required. RF Swift adapts automatically and tells you, before creating anything, what it had to adjust.

| Works rootless | Needs root or privileged mode |
|---|---|
| Container creation and management | Device cgroup rules (USB hotplug) |
| Image pulling and building | Some device nodes (`/dev/tty`, `/dev/console`, `/dev/vhci`, `/dev/uinput`) |
| Volume bindings (user-accessible paths) | WireGuard/OpenVPN VPN |
| X11 forwarding | Full TUN/TAP networking |
| Audio (PulseAudio/PipeWire) | Raw hardware access |
| Session recording | |
| Remote desktop (VNC/noVNC) | |
| Network modes (slirp4netns/pasta) | |
| Tailscale/Netbird VPN (userspace mode) | |

### What RF Swift adjusts for you

- **Host udev rules**: rootless Podman runs containers as your user, so a USB device is only reachable once the host grants you access. `rfswift host udev` installs RF Swift's rules (group `plugdev`, seat ACL); rules inside a container are never evaluated.
- **Your groups are kept**: with the crun runtime, `dialout` and `plugdev` follow you into the container, so a device you may open on the host is usable inside.
- **Inaccessible devices are dropped**: root-only device nodes are left out, while devices that remain accessible (for example `/dev/bus/usb`, `/dev/snd`, `/dev/dri`) are kept.

  ```
  [!] Dropping 5 inaccessible device(s) for rootless mode:
   - /dev/vhci
   - /dev/console
   - /dev/tty0
   - /dev/tty1
   - /dev/uinput
  ```

- **Cgroup device rules are dropped with a warning**, since rootless Podman doesn't support them:

  ```
  [!] Rootless Podman does not support device cgroup rules.
  [!] Rules that will be dropped: c 189:* rwm, c 166:* rwm, ...
  [i] Device hotplug (USB, SDR dongles) may not work without cgroup rules.
  [i] To use cgroup rules, run RF Swift with sudo.
  ```

- **Realtime ulimits** above your host hard limits are skipped instead of failing the start.
- **Serial ports** must be present at creation (no `mknod`, no cgroup rules); the hot-plug works on rootful Podman and Docker.
- **Configuration changes** (`rfswift config ...`) commit the container and re-create it, since Podman has no editable store; one snapshot image per change remains.
- **Images**: `rfswift image pull` works the same; use `docker.io/penthertz/rfswift_resolute:...` or set `unqualified-search-registries` to avoid the short-name prompt.
- **Audit**: `rfswift image audit` runs trivy as a container through Podman when no host trivy is installed.

`rfswift container create` and the Workbench list what will be dropped before creation.

{{< callout type="info" title="Your devices still work" >}}
You can use USB devices that are plugged in before the container starts. What doesn't work without cgroup rules is **hotplug**: plugging or unplugging devices while the container is running.
{{< /callout >}}

## Running with root (Podman + sudo)

For full hardware access, run Podman with `sudo`. This gives you the same capabilities as Docker with root, including cgroup rules and full device access:

```bash
sudo rfswift --engine podman container create -i sdr_full -n my_sdr \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm"
```

## VPN with Podman

**Tailscale and Netbird work rootless**, using userspace networking:

```bash
rfswift --engine podman container create -i sdr_full -n my_sdr --vpn tailscale
```

**WireGuard and OpenVPN need root** and privileged mode, because they create a tunnel:

```bash
sudo rfswift --engine podman container create -i sdr_full -n my_sdr \
  -u 1 \
  --vpn wireguard:./wg0.conf
```

More in [VPN inside containers](/docs/guide/vpn/).

## Networking

Rootless Podman uses `slirp4netns` or `pasta` for networking instead of a real bridge:

```bash
# Host network (default), works with slirp4netns
rfswift --engine podman container create -i sdr_full -n my_sdr

# Bridge network
rfswift --engine podman container create -i sdr_full -n my_sdr -t bridge

# Port forwarding with bridge
rfswift --engine podman container create -i sdr_full -n my_sdr \
  -t bridge \
  -w 8080:80/tcp
```

{{< callout type="info" >}}
Port forwarding works in rootless mode, but only for ports above 1024. To bind to low ports (for example 80 or 443), use `sudo` or configure `sysctl net.ipv4.ip_unprivileged_port_start=0`.
{{< /callout >}}

**Remote desktop with Podman:**

```bash
rfswift --engine podman container create -i sdr_full -n sdr_desktop \
  --desktop \
  --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mypassword"
```

## Managing labs and images

All RF Swift commands work with Podman:

```bash
rfswift --engine podman container last                  # list containers
rfswift --engine podman container shell -c my_sdr       # enter a container
rfswift --engine podman container stop -c my_sdr        # stop it
rfswift --engine podman container rm -c my_sdr          # remove it

# Export/import
rfswift --engine podman image export container -c my_sdr -o backup.tar.gz
rfswift --engine podman image import container -i backup.tar.gz
```

**Image names**: Podman may prompt for a registry when it sees a short image name. RF Swift normalizes image names automatically, but you can also use full names:

```bash
# Short name (RF Swift resolves it)
rfswift --engine podman container create -i sdr_full -n my_sdr

# Full name (no resolution needed)
rfswift --engine podman container create -i docker.io/penthertz/rfswift_resolute:sdr_full -n my_sdr
```

## Common workflows

### Rootless SDR analysis

```bash
# Pull image
rfswift --engine podman image pull -i sdr_full

# Create container (rootless)
rfswift --engine podman container create -i sdr_full -n analysis \
  -b ~/captures:/root/captures \
  -s /dev/bus/usb:/dev/bus/usb

# Enter later
rfswift --engine podman container shell -c analysis
```

### Full hardware setup (with sudo)

```bash
sudo rfswift --engine podman container create -i sdr_full -n hw_work \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm,c 166:* rwm" \
  --realtime \
  -b ~/captures:/root/captures
```

### Air-gapped environment

Podman is ideal for air-gapped systems since it has no daemon:

```bash
# On connected machine: export image
rfswift --engine podman image export image -i sdr_full -o sdr_full.tar.gz

# Transfer to air-gapped machine (USB, etc.)

# On air-gapped machine: import and run
rfswift --engine podman image import image -i sdr_full.tar.gz
rfswift --engine podman container create -i sdr_full -n offline_work -t none
```

See also [Air-gapped installation](/docs/air-gapped-installation/).

## Troubleshooting

### "error creating device nodes"

**Error:** `error during container init: error creating device nodes: create device inode /dev/tty: no such device or address`

**Cause:** rootless Podman can't create certain device nodes.

**Solution:** RF Swift filters these automatically; if you see this error, update to the latest RF Swift version. As a workaround, avoid mapping tty devices:

```bash
rfswift --engine podman container create -i sdr_full -n my_sdr -s /dev/bus/usb:/dev/bus/usb
```

### "Rootless Podman does not support device cgroup rules"

**Not an error**, just information. Your container still works; only USB hotplug is affected. Plug in devices before starting the container. For full cgroup support:

```bash
sudo rfswift --engine podman container create ...
```

### Containers not visible across engines

Containers created with Docker are invisible to Podman, and the other way round. Use the engine that created them:

```bash
rfswift --engine docker container shell -c my_container   # created with Docker
rfswift --engine podman container shell -c my_container   # created with Podman
```

### Images not found after pulling with sudo

**Problem:** you pulled an image with `sudo podman pull`, but RF Swift can't find it when running rootless.

**Why:** Podman stores images separately for root and rootless users. An image pulled with `sudo` goes to the root image store, which rootless Podman doesn't see by default.

**Solutions:**

```bash
# Option 1: Pull without sudo (rootless)
podman pull penthertz/rfswift_resolute:sdr_full

# Option 2: Configure additionalimage stores to see root images
# Add to ~/.config/containers/storage.conf:
# [storage]
# [storage.options]
# additionalimagestores = ["/var/lib/containers/storage"]
```

RF Swift includes an `ImageInspectCompat` layer that automatically resolves image names across both local and remote registries, handling Podman's short-name resolution transparently.

### Podman asks which registry to use

Configure default registries:

```bash
echo 'unqualified-search-registries = ["docker.io"]' | sudo tee -a /etc/containers/registries.conf
```

### Permission denied on /dev/bus/usb

Install RF Swift's udev rules with `rfswift host udev`, or add your user to the right group:

```bash
sudo usermod -aG plugdev $USER
newgrp plugdev
```

Or use `sudo` for full access.

## Related

- [Choose your engine](/docs/engines/): Podman compared with Docker, Lima and Nix
- [`engine`](/docs/commands/engine/): engine selection and comparison
- [`container create`](/docs/commands/run/): create and run containers
- [VPN inside containers](/docs/guide/vpn/): VPN support with Podman
- [Install RF Swift](/docs/getting-started/): installation and setup
- [Air-gapped installation](/docs/air-gapped-installation/): offline deployment
