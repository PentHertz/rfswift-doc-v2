---
title: ⚙️ Requirements & supported platforms
weight: 2
next: /docs/comparisons
prev: /docs
cascade:
  type: docs
---

## System Requirements

The minimum requirements to run RF Swift are:

- **CPU**: Any dual-core CPU (quad-core recommended for better performance)
- **RAM**: 4GB minimum (8GB or more recommended)
- **Storage**: 10GB free space (20GB+ recommended for multiple container images)
- **Container Engine**: Docker or Podman (automatically installed by the one-line installer)
- **Internet Connection**: Required for initial setup and image downloads

## Container Engine Support

RF Swift supports both **Docker** and **Podman** as container engines. All RF Swift images are OCI-compatible and work identically with either engine.

| | Docker | Podman |
|---|---|---|
| **Architecture** | Client-server (daemon) | Daemonless (fork-exec) |
| **Root required** | Yes (daemon runs as root) | No (rootless by default) |
| **Linux** | ✅ Fully supported | ✅ Fully supported |
| **Windows** | ✅ Docker Desktop | ✅ Via WSL2 or Podman Desktop |
| **macOS** | ✅ Docker Desktop | ✅ `podman machine` or Podman Desktop |
| **SBCs (ARM64/RISC-V)** | ✅ Supported | ✅ Supported |
| **Best for** | Broad ecosystem, Windows/macOS | Security-focused, air-gapped, embedded |

{{< callout type="info" >}}
RF Swift **auto-detects** the available container engine at startup. If both are installed, you can force a specific one with `rfswift --engine docker` or `rfswift --engine podman`. See the [engine command reference](/docs/commands/engine) for details.
{{< /callout >}}

{{< tabs items="Docker setup,Podman setup" >}}
  {{< tab >}}
**Quick Docker setup:**

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker run hello-world
```
  {{< /tab >}}
  {{< tab >}}
**Quick Podman setup:**

```bash
# Debian / Ubuntu
sudo apt install podman slirp4netns fuse-overlayfs uidmap

# Fedora / RHEL
sudo dnf install podman slirp4netns fuse-overlayfs

# Arch Linux
sudo pacman -S podman slirp4netns fuse-overlayfs crun

# macOS
brew install podman && podman machine init && podman machine start

# Configure rootless (Linux)
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Verify
podman run hello-world
```
  {{< /tab >}}
{{< /tabs >}}

Or let the RF Swift installer handle everything:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

The installer will prompt you to choose Docker, Podman, or both if no engine is detected.

## Supported Platforms

RF Swift is designed to work across multiple platforms and architectures to suit your specific environment.

### Operating Systems

| Platform | x86_64/amd64 | arm64/v8 | riscv64 |
|----------|--------------|----------|---------|
| Windows  | ✅ Fully supported | ❓ Limited testing | ❌ Not supported |
| Linux    | ✅ Fully supported | ✅ Fully supported | ✅ Fully supported |
| macOS    | ❓ Limited support | ✅ Supported (better inside a VM for USB devices) | ❌ Not supported |

### Tested Single-Board Computers

| SBC | Status | Container Engine | Comments |
|-----|--------|------------------|----------|
| Raspberry Pi 5 | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools |
| Milk-V Jupiter | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools, but slower than Raspberry Pi 5 |
| Orange Pi RV2  | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools, but slower than Milk-V Jupiter |
| Milk-V Mars | ❌ | ❌ | Software support is currently unavailable. Docker/Podman installation is problematic |
| UP Squared Series | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools |
| Nano Pi T6 | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools |
| Orange pi 5 ultra | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools |
| Radxa ROCK 5B+ | ✅ | Docker ✅ Podman ✅ | Works perfectly with most tools |

And more!

{{< callout type="info" >}}
On resource-constrained SBCs, **Podman** can be a better choice than Docker since it has no background daemon consuming memory and CPU.
{{< /callout >}}

## Feature Compatibility Matrix

| Feature | Linux | Windows | macOS |
|---------|-------|---------|-------|
| Container Execution (Docker) | ✅ | ✅ | ✅ |
| Container Execution (Podman) | ✅ | ✅ (via WSL2) | ✅ (via podman machine) |
| GUI Applications | ✅ | ✅ | ✅ (with XQuartz) |
| USB Device Forwarding | ✅ | ✅ (with usbipd) | ❌ |
| Rootless Containers | ✅ (Podman) | ✅ (Podman in WSL2) | ✅ (Podman) |
| Audio Support | ✅ | ✅ (with PulseAudio) | ❓ Limited |
| Hardware Acceleration | ✅ | ❓ Limited | ❓ Limited |
| Cross-Compilation | ✅ | ✅ (in WSL) | ✅ |
| One-Line Installer | ✅ | ❌ | ✅ |

## Questions or Feedback?

{{< callout emoji="❓" >}}
  RF Swift is still in active development.
  Have a question or feedback? Feel free to [open an issue](https://github.com/PentHertz/RF-Swift/issues)!
{{< /callout >}}

## Next Steps

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/comparisons" title="Comparisons with dedicated distributions" icon="star" subtitle="Compare RF Swift with dedicated distributions" >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Setup your environment" >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Quickly run RF Swift and start a container" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binary" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}