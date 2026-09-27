---
title: "rfswift doctor"
linkTitle: "doctor"
navGroup: "System"
level: reference
description: "Diagnose the host: engines, Nix, USB, display, audio, udev rules and the jail."
weight: 91
---

Diagnose the host for RF Swift. `rfswift doctor` (also `rfswift system doctor`) checks every engine, the display, audio, devices, the Nix engine and the host prerequisites, and tells you which command fixes what is wrong.

## Syntax

```bash
rfswift doctor
rfswift system doctor
```

## What it checks

| Check | What it verifies |
|-------|------------------|
| **Container engine** | Docker, Podman or Lima detected, which one is active |
| **Engine service** | The daemon or VM is running and reachable, with its version |
| **Docker permissions** | Your user can talk to the Docker socket (group membership and the session ACL); fix: `rfswift host docker-access` |
| **Host udev rules** | RF Swift's rules are installed and current, your user is in `plugdev`; fix: `rfswift host udev` |
| **Nix engine** | Nix is installed with flakes; on Windows, the WSL 2 distribution that hosts it, the Linux `rfswift` inside and version skew |
| **Nix jail (--isolate)** | bubblewrap is present and may create a user namespace (AppArmor profile on Ubuntu 24.04+); fix: `rfswift host isolate` |
| **Lima VM** (macOS) | Instance state, QMP socket for USB passthrough, Docker socket |
| **RF Swift images** | Images pulled locally |
| **X11 display** | `DISPLAY` set and the X11 socket present; on Windows the WSLg socket, asked from WSL |
| **xhost** | Installed for local X11 authorisation |
| **Audio system** | PulseAudio or PipeWire running (Windows: WSLg audio socket) |
| **Audio TCP server** | The module listens on the configured port; fix: `rfswift host audio enable` |
| **USB devices** | `/dev/bus/usb` present; on Windows the usbipd-win version with connected, shared and attached counts and the default WSL 2 distribution |
| **Config file** | Exists with safe permissions |
| **Kernel modules** | USB, sound, Bluetooth, Wi-Fi modules loaded (Linux) |

## Status icons

| Icon | Meaning |
|------|---------|
| `✓` (green) | Passed |
| `!` (yellow) | Warning, works but could be better |
| `✗` (red) | Failed, needs a fix |
| `-` (gray) | Skipped, not applicable on this platform |

## Example output

```
🩺 RF Swift Doctor
══════════════════════════════════════════════════════════

  ✓  Container engine               Docker (docker)
  ✓  Engine service                 Running and reachable
  ✓  Engine version                 29.1.4 (API 1.53)
  ✓  Docker permissions             User 'user' can use the Docker socket
  ✓  Host udev rules                /etc/udev/rules.d/70-rfswift.rules installed, user in plugdev
  ✓  Nix engine                     nix 2.30 with flakes
  ✓  Nix jail (--isolate)           bubblewrap ready (/usr/bin/bwrap, AppArmor profile loaded)
  ✓  RF Swift images                3 RF Swift image(s) available
  ✓  X11 display                    DISPLAY=:0, X11 socket present
  ✓  xhost                          Installed
  ✓  Audio system                   PipeWire
  !  Audio TCP server               Not reachable at localhost:34567 (run: rfswift host audio enable)
  ✓  USB devices                    /dev/bus/usb present (4 bus(es))
  ✓  Config file                    /home/user/.config/rfswift/config.ini
  ✓  Kernel modules                 Loaded: USB support, Sound/ALSA, Bluetooth, Wi-Fi/802.11

──────────────────────────────────────────────────────────
  14 passed  1 warnings
```

## Common issues and fixes

```bash
rfswift host setup                  # everything below, asked step by step
rfswift host docker-access          # Docker socket "permission denied"
rfswift host udev                   # hardware needs root on rootless Podman or Nix
rfswift host isolate                # bwrap "setting up uid map: Permission denied"
rfswift host audio enable           # audio TCP server not reachable
rfswift image pull -i sdr_full      # no RF Swift images
rfswift env wsl setup               # Windows: Nix backend not provisioned
chmod 600 ~/.config/rfswift/config.ini
```

Headless or over SSH without X forwarding: use `--desktop` for a browser desktop, or `ssh -X`.

## Platform notes

- **Linux**: all checks run.
- **macOS**: the Lima VM check replaces Docker permissions and kernel modules; audio expects PulseAudio from Homebrew.
- **Windows**: WSLg display and audio, usbipd-win, the default WSL 2 distribution and the Nix WSL backend are reported; if the WSLg sockets are missing run `wsl --update` then `wsl --shutdown`.

The Workbench's **Engine doctor** shows the same checks with buttons that apply the fixes.
