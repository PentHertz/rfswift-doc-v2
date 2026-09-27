---
title: Requirements & supported platforms
linkTitle: Will it run on my computer?
description: RF Swift runs on Linux, macOS and Windows, on x86_64, ARM64 and RISC-V64. Here is what you need, and what works where.
level: beginner
weight: 2
---

**Short answer: almost certainly yes.** RF Swift runs on Linux, macOS and Windows, on regular PCs and Macs as well as on small boards such as a Raspberry Pi 5. The installer sets up everything else it needs.

## What you need

- **A dual-core processor** (quad-core recommended).
- **4 GB of memory** (8 GB or more recommended: the Workbench and graphical tools like more).
- **10 GB of free disk space** (20 GB or more if you plan to use several toolboxes).
- **An internet connection** to install RF Swift and download toolboxes. After that, everything works offline. No internet at all? See [Offline installation](/docs/air-gapped-installation/).
- **Optional: a radio or other hardware** such as an RTL-SDR, HydraSDR, HackRF, USRP, bladeRF or Proxmark3. You can explore the tools without one.

You do **not** need to install Docker or anything else first: the [installer](/docs/getting-started/) takes care of the engine. Curious what each engine is good at? See [Choose your engine](/docs/engines/).

## Is my system supported?

| Your system | Supported? | Good to know |
|---|---|---|
| **Linux** (Ubuntu, Debian, Fedora, Arch, Kali, DragonOS...) | Yes, fully | The smoothest option for USB radios: devices are shared with your labs directly. |
| **macOS 13 or later** (Intel or Apple Silicon) | Yes | For USB radios, use the **Nix** engine (tools run natively, direct USB access) or the **Lima** engine (containers in a small VM). Docker Desktop and Podman on macOS can't pass USB devices through. Graphical tools in containers need XQuartz. |
| **Windows 10 or 11** (x64 or ARM64) | Yes | One installer sets up WSL 2 and USB forwarding. Radios are forwarded with `rfswift usb attach` (or a Workbench button); Windows asks for administrator approval once per device. |
| **Single-board computers** (Raspberry Pi 5 and others, ARM64 or RISC-V64) | Yes, for most boards | See the tested boards below. Lighter toolboxes work best. A board can also sit next to the antenna and be driven from your laptop with the [remote agent](/docs/guide/remote-agent/). |

{{< callout type="tip" title="Not sure? Just try it" >}}
After installing, run `rfswift doctor`. It checks your system and tells you exactly what is missing and which command fixes it.
{{< /callout >}}

The Workbench desktop app runs on Linux, macOS and Windows on x86_64 and ARM64. On RISC-V64 boards you use the command line.

## Details for experts

The tables below list exactly what works where. The reasons behind each limitation are in [Known limits](/docs/guide/limitations/).

### Engines

| | Docker | Podman | Lima | Nix |
|---|---|---|---|---|
| **Architecture** | Client-server daemon | Daemonless | Docker in a QEMU VM | Native environments, no daemon |
| **Root required** | Daemon as root | No (rootless by default) | No | No |
| **Linux** | ✅ | ✅ | - | ✅ |
| **Windows** | ✅ Docker Desktop (WSL 2) | ✅ Podman Desktop / WSL 2 | - | ✅ inside a WSL 2 distribution |
| **macOS** | ✅ Docker Desktop (no USB) | ✅ `podman machine` (no USB) | ✅ USB passthrough, optional GPU VM | ✅ |
| **SBCs (arm64, riscv64)** | ✅ | ✅ | - | ✅ (arm64) |
| **Best for** | Broad ecosystem | Security-focused, air-gapped, embedded | macOS with RF hardware | No container engine, closest to the hardware |

RF Swift auto-detects the engine. Force one with `rfswift --engine docker|podman|lima|nix`, `RFSWIFT_ENGINE`, or `engine =` in `config.ini`. See [engine](/docs/commands/engine/) and the [Nix engine guide](/docs/guide/nix-engine/).

### Platforms and architectures

| Platform | x86_64 / amd64 | arm64 | riscv64 |
|----------|----------------|-------|---------|
| Linux | ✅ Fully supported (deb, rpm, pacman, tarball, AppImage) | ✅ Fully supported | ✅ CLI and images (no Workbench) |
| Windows 10/11 | ✅ Fully supported (installer bundle, MSI) | ✅ Supported (installer bundle, MSI) | ❌ |
| macOS 13+ | ✅ Supported (universal binaries; Lima for USB) | ✅ Supported (Lima for USB, krunkit GPU VM on macOS 14+) | ❌ |

### Tested single-board computers

| SBC | Status | Engines | Comments |
|-----|--------|---------|----------|
| Raspberry Pi 5 | ✅ | Docker, Podman | Works with most tools |
| Milk-V Jupiter | ✅ | Docker, Podman | Slower than a Raspberry Pi 5 |
| Orange Pi RV2 | ✅ | Docker, Podman | Slower than the Milk-V Jupiter |
| Milk-V Mars | ❌ | | Docker and Podman installation is problematic on its software stack |
| UP Squared series | ✅ | Docker, Podman | |
| NanoPi T6 | ✅ | Docker, Podman | |
| Orange Pi 5 Ultra | ✅ | Docker, Podman | |
| Radxa ROCK 5B+ | ✅ | Docker, Podman | |

{{< callout type="info" >}}
On resource-constrained boards, **Podman** avoids a background daemon, and the **Nix engine** avoids image layers altogether.
{{< /callout >}}

### Feature compatibility matrix

| Feature | Linux | Windows | macOS |
|---------|-------|---------|-------|
| Containers (Docker) | ✅ | ✅ Docker Desktop | ✅ Docker Desktop |
| Containers (Podman) | ✅ rootless | ✅ WSL 2 / Podman Desktop | ✅ podman machine |
| Native Nix environments | ✅ | ✅ inside WSL 2 | ✅ |
| GUI tools | ✅ X11 | ✅ WSLg | ✅ XQuartz (EGL) or `--desktop` |
| USB / SDR hardware in containers | ✅ mapped | ✅ usbipd-win into WSL 2 | ✅ Lima VM (not Docker Desktop) |
| Serial hot-plug | ✅ Docker, rootful Podman | ✅ via usbipd | ❌ (attach to the VM) |
| Audio | ✅ host PulseAudio / PipeWire | ✅ WSLg, no setup | ✅ host PulseAudio (Homebrew) |
| GPU in containers | ✅ vendor runtime | ❓ limited | ✅ Vulkan compute in the krunkit VM (no USB) |
| Nix `--isolate` jail | ✅ bubblewrap | ✅ inside WSL 2 | ✅ Seatbelt (no PID namespace) |
| Workbench GUI | ✅ AppImage, native | ✅ | ✅ universal app |
| Remote agent (host and client) | ✅ | ✅ | ✅ |
| One-line installer | ✅ | ❌ (installer bundle instead) | ✅ |
| Native packages | ✅ deb, rpm, pacman | ✅ MSI, bundle | ✅ Homebrew cask, DMG |

## Next steps

{{< cards >}}
  {{< card link="/docs/getting-started/" title="Install RF Swift" icon="download-simple" subtitle="One installer per system." tag="Beginner" >}}
  {{< card link="/docs/quick-start/" title="Quick start" icon="rocket-launch" subtitle="Open your first lab." tag="Beginner" >}}
  {{< card link="/docs/guide/limitations/" title="Known limits" icon="warning" subtitle="What each platform can't do, and why." >}}
{{< /cards >}}
