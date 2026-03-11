---
title: doctor
weight: 85
cascade:
  type: docs
---

# doctor

Diagnose your system environment for RF Swift compatibility. The `doctor` command performs a series of checks and reports the status of each component needed to run RF Swift containers.

## Syntax

```bash
rfswift doctor
```

## What It Checks

| Check | What it verifies |
|-------|-----------------|
| **Container engine** | Docker or Podman is installed and detected |
| **Engine service** | The container engine daemon is running and reachable |
| **Engine version** | Reports the engine and API version |
| **Docker permissions** | Current user is in the `docker` group (Linux) |
| **RF Swift images** | RF Swift images are pulled and available locally |
| **X11 display** | `DISPLAY` is set and `/tmp/.X11-unix` socket exists |
| **xhost** | `xhost` command is installed for X11 forwarding |
| **Audio system** | PulseAudio or PipeWire is running |
| **Audio TCP server** | Audio server is listening on the configured TCP port |
| **USB devices** | `/dev/bus/usb` is present and accessible |
| **Config file** | Config file exists and has secure permissions |
| **Kernel modules** | Key kernel modules are loaded (USB, sound, Bluetooth, Wi-Fi) |

## Status Icons

| Icon | Meaning |
|------|---------|
| `✓` (green) | Check passed |
| `!` (yellow) | Warning -- functional but could be improved |
| `✗` (red) | Check failed -- something needs to be fixed |
| `-` (gray) | Skipped -- not applicable on this platform |

## Example Output

```
🩺 RF Swift Doctor
══════════════════════════════════════════════════════════

  ✓  Container engine               Docker (docker)
  ✓  Engine service                 Running and reachable
  ✓  Engine version                 27.3.1 (API 1.47)
  ✓  Docker permissions             User 'user' is in docker group
  ✓  RF Swift images                3 RF Swift image(s) available
  ✓  X11 display                    DISPLAY=:0, X11 socket present
  ✓  xhost                          Installed
  ✓  Audio system                   PipeWire
  !  Audio TCP server               Not reachable at localhost:34567 (run: rfswift host audio enable)
  ✓  USB devices                    /dev/bus/usb present (4 bus(es))
  ✓  Config file                    /home/user/.config/rfswift/config.ini
  ✓  Kernel modules                 Loaded: USB support, Sound/ALSA, Bluetooth, Wi-Fi/802.11

──────────────────────────────────────────────────────────
  11 passed  1 warnings
```

## Common Issues and Fixes

### Container engine not found

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Or install Podman
sudo apt install podman  # Debian/Ubuntu
sudo dnf install podman  # Fedora/RHEL
```

### User not in docker group

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Audio TCP server not reachable

The audio server TCP module needs to be loaded for container audio passthrough:

```bash
rfswift host audio enable
```

### X11 display not set

If you're running headless or via SSH without X forwarding:

```bash
# Option 1: Use desktop mode instead
rfswift run -i sdr_full -n my_sdr --desktop

# Option 2: Forward X11 via SSH
ssh -X user@host
```

### Config file permissions

```bash
chmod 600 ~/.config/rfswift/config.ini
```

### No RF Swift images

```bash
rfswift images pull -i penthertz/rfswift_noble:sdr_full
```

## Platform Notes

- **Linux**: All checks are performed
- **macOS**: Docker permissions and kernel module checks are skipped
- **Windows/WSL**: Checks for WSLg X11 socket and `usbipd` availability
