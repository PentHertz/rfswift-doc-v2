---
title: ⚙️ Requirements & supported platforms
weight: 2
next: /docs/release-notes-v4
prev: /docs
cascade:
  type: docs
---

## System requirements

- **CPU**: any dual-core CPU (quad-core recommended)
- **RAM**: 4 GB minimum (8 GB or more recommended; the Workbench and GUI tools like more)
- **Storage**: 10 GB free (20 GB or more for several images; the Nix store shares tools between environments)
- **An engine**: Docker, Podman or Lima for containers, or Nix for native environments (the installers set them up)
- **Internet**: for the installation and the image or environment downloads; afterwards everything runs offline (`-q`)

## Engines

| | Docker | Podman | Lima | Nix |
|---|---|---|---|---|
| **Architecture** | Client-server daemon | Daemonless | Docker in a QEMU VM | Native environments, no daemon |
| **Root required** | Daemon as root | No (rootless by default) | No | No |
| **Linux** | ✅ | ✅ | - | ✅ |
| **Windows** | ✅ Docker Desktop (WSL 2) | ✅ Podman Desktop / WSL 2 | - | ✅ inside a WSL 2 distribution |
| **macOS** | ✅ Docker Desktop (no USB) | ✅ `podman machine` (no USB) | ✅ USB passthrough, optional GPU VM | ✅ |
| **SBCs (arm64, riscv64)** | ✅ | ✅ | - | ✅ (arm64) |
| **Best for** | Broad ecosystem | Security-focused, air-gapped, embedded | macOS with RF hardware | No container engine, closest to the hardware |

{{< callout type="info" >}}
RF Swift auto-detects the engine. Force one with `rfswift --engine docker|podman|lima|nix`, `RFSWIFT_ENGINE`, or `engine =` in `config.ini`. See [engine](/docs/commands/engine) and the [Nix engine guide](/docs/guide/nix-engine).
{{< /callout >}}

Let the installer handle everything:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

## Supported platforms

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

## Feature compatibility matrix

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

The constraints behind each cell are listed in [Known limits](/docs/guide/limitations).

## Questions or feedback?

{{< callout emoji="❓" >}}
  RF Swift is in active development. Have a question or feedback? [Open an issue](https://github.com/PentHertz/RF-Swift/issues) or join the [Discord](https://discord.gg/NS3HayKrpA).
{{< /callout >}}

## Next steps

{{< cards >}}
  {{< card link="/docs/release-notes-v4" title="What's new in v4.0" icon="sparkles" subtitle="Nix engine, Workbench, remote agent, new CLI" >}}
  {{< card link="/docs/comparisons" title="Comparisons with dedicated distributions" icon="star" subtitle="Compare RF Swift with dedicated distributions" >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Set up your environment" >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Run RF Swift and start a container" >}}
{{< /cards >}}
