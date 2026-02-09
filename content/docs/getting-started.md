---
title: Getting Started
weight: 5
next: /docs/quick-start
prev: /docs/comparisons
cascade:
  type: docs
---

# Getting Started with RF Swift 🚀

This guide will help you get started with RF Swift by covering system requirements, installation steps, and next actions. First we will need to setup the environment.

## Installation

RF Swift now offers a streamlined one-line installer that automatically installs all dependencies and configures your system for optimal performance.

Our new installer takes care of everything for you in a single command! It will:

- Install **Docker** or **Podman** (your choice) if not already present
- Download and install the latest RF Swift release
- Configure your system for USB, audio, and GUI support
- Create a convenient shell alias for easy access
- Set up proper permissions and configurations

{{< tabs items="Linux/macOS (curl),Linux/macOS (wget),Windows" >}}
  {{< tab >}}
```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```
After installation, simply run: `rfswift`
  {{< /tab >}}
  {{< tab >}}
```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```
After installation, simply run: `rfswift`
  {{< /tab >}}
  {{< tab >}}
See our [installation documentation](/docs/quick-start) for Windows installation instructions.
  {{< /tab >}}
{{< /tabs >}}

The installer will detect your system and prompt you to choose a container engine if none is found:

```
📝 Which container engine would you like to install?
   🐳 Docker  — Industry standard, requires daemon (root)
   🦭 Podman  — Daemonless, rootless by default
1) Docker   2) Podman   3) Both   4) Skip
```

If both engines are already installed, RF Swift will auto-detect the available one at runtime.

### Choosing a Container Engine

RF Swift supports both **Docker** and **Podman** as container engines. All RF Swift images are OCI-compatible and work identically with either engine.

| | Docker | Podman |
|---|---|---|
| **Architecture** | Client-server daemon | Daemonless, fork-exec |
| **Root required** | Yes (daemon runs as root) | No (rootless by default) |
| **Best for** | Broad ecosystem, Windows/macOS | Security-focused, air-gapped, embedded |
| **Device passthrough** | Native | Supported (may need extra config) |

{{< callout type="info" >}}
You can override the auto-detected engine at any time with `rfswift --engine docker` or `rfswift --engine podman`.
{{< /callout >}}

### Manual Installation

If you prefer to have more control over the installation process, you can install the components separately.

#### Linux Manual Installation

{{< callout type="info" >}}
On Linux, Docker or Podman, BuildX, and Go can be directly installed with the `install.sh` script included in the repository.
{{< /callout >}}

**Essential Components**

{{< tabs items="Docker,Podman" >}}
  {{< tab >}}
**Docker** — Industry standard container engine

```bash
# Install Docker via official script
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker run hello-world
```
  {{< /tab >}}
  {{< tab >}}
**Podman** — Daemonless, rootless container engine

```bash
# Debian / Ubuntu
sudo apt install podman podman-compose slirp4netns fuse-overlayfs uidmap

# Fedora / RHEL
sudo dnf install podman podman-compose slirp4netns fuse-overlayfs

# Arch Linux
sudo pacman -S podman podman-compose slirp4netns fuse-overlayfs crun

# macOS (via Homebrew)
brew install podman
podman machine init && podman machine start
```

**Rootless configuration** (Linux only):

```bash
# Ensure subordinate UID/GID ranges are set
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Enable lingering so containers survive logout
sudo loginctl enable-linger $USER

# Enable the Podman socket (Docker API compatibility)
systemctl --user enable --now podman.socket
```

Verify installation:

```bash
podman run hello-world
```
  {{< /tab >}}
{{< /tabs >}}

**Other Essential Components**

- **xhost**: Required for GUI application support (install via your distribution's package manager)
- **PulseAudio/PipeWire**: Required for audio support (install via your distribution's package manager)

**Optional Components**

- **Go Compiler**: Required if you want to build RF Swift from source
- **BuildX**: Required for cross-architecture compilation (Docker only)
- **asciinema**: Required for recording sessions

**Repository Installation**

```bash
# Clone the repository
git clone https://github.com/PentHertz/RF-Swift.git
cd RF-Swift

# Run the installation script to automatically install all dependencies
./install.sh
```

The `install.sh` script will:
- Offer to install Docker, Podman, or both
- Set up BuildX for cross-architecture support (Docker)
- Configure rootless mode (Podman)
- Install Go compiler if needed
- Configure xhost for GUI application access
- Set up PulseAudio/PipeWire for sound
- Configure user permissions
- Download and install the latest RF Swift binary

{{< tabs items="Docker post-install,Podman post-install" >}}
  {{< tab >}}
**Running Docker Without Sudo**

To avoid using `sudo` for every Docker command, add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

You may need to log out and back in for the changes to take effect. Verify it works by running `docker ps` without sudo.
  {{< /tab >}}
  {{< tab >}}
**Podman Rootless Mode**

Podman runs rootless by default — no group membership or daemon required. Just make sure subordinate UID/GID ranges are configured:

```bash
# Check your ranges
grep $USER /etc/subuid /etc/subgid

# If empty, add them
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER
```

For Docker CLI compatibility (so tools expecting `docker` work with Podman):

```bash
# Some distros provide podman-docker package
sudo apt install podman-docker   # Debian/Ubuntu
sudo dnf install podman-docker   # Fedora
```
  {{< /tab >}}
{{< /tabs >}}

#### Windows Manual Installation

**Required Software**

- [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) to run containers
- [usbipd](https://learn.microsoft.com/en-us/windows/wsl/connect-usb) to bind USB devices to the host

**For Audio Support**

For programs requiring PulseAudio:

1. Follow the setup guide on [Linux Uprising](https://www.linuxuprising.com/2021/03/how-to-get-sound-pulseaudio-to-work-on.html)
2. Use the updated binaries available at [pgaskin.net/pulseaudio-win32](https://pgaskin.net/pulseaudio-win32/)

{{< callout type="warning" >}}
Make sure Docker Desktop runs in [WSL2 mode](https://docs.docker.com/desktop/wsl/#enabling-docker-support-in-wsl-2-distros) for optimal performance and compatibility.
{{< /callout >}}

{{< callout type="info" >}}
**Podman on Windows**: Podman can also be used on Windows via WSL2. Install it inside your WSL2 distribution using the Linux instructions above. Podman Desktop is also available at [podman-desktop.io](https://podman-desktop.io/).
{{< /callout >}}

**Installation Steps**

1. Install Docker Desktop (or Podman via WSL2) and ensure WSL2 integration is enabled
2. Install usbipd for USB device support
3. Set up PulseAudio if audio functionality is needed
4. Download the latest RF Swift binary from the releases page

#### macOS Manual Installation

{{< callout type="warning" >}}
macOS support will be fully implemented soon. Currently, some features may have limited functionality.
{{< /callout >}}

**Current Status**

- Container functionality works without USB forwarding
- For full functionality including USB device support, running in a Linux VM is recommended

{{< tabs items="Docker,Podman" >}}
  {{< tab >}}
**Docker Desktop for macOS**

- Install [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) from the official website
- XQuartz for X11 forwarding (optional)
  {{< /tab >}}
  {{< tab >}}
**Podman on macOS**

```bash
# Install via Homebrew
brew install podman

# Initialize and start the Podman machine (Linux VM)
podman machine init
podman machine start

# Verify
podman run hello-world
```

- XQuartz for X11 forwarding (optional)
- Podman Desktop available at [podman-desktop.io](https://podman-desktop.io/)
  {{< /tab >}}
{{< /tabs >}}

**Known Limitations**

- USB device forwarding is not currently supported natively
- Some specialized RF tools may have compatibility issues

## Creating an Alias (Linux/macOS)

This part can be considered if you manually downloaded the binary.

For convenience, you can create an alias to run RF Swift from anywhere. If you didn't use the `install.sh` script (which creates this automatically), you can add an alias manually:

```bash
echo "alias rfswift='$(pwd)/rfswift'" >> "$HOME/.$(basename $SHELL)rc"
source "$HOME/.$(basename $SHELL)rc"
```

Replace `$(pwd)/rfswift` with the full path to your RF Swift binary.

## Next Steps

After installation, you can dive right into:

{{< cards >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Running RF Swift with pre-built images and binary" >}}
  {{< card link="/docs/development" title="Developing and Contributing" icon="document-text" subtitle="Compile binary and build images from sources, contribute to the project" >}}
{{< /cards >}}

## Troubleshooting

If you encounter issues during installation or usage:

1. Check the [GitHub Issues](https://github.com/PentHertz/RF-Swift/issues) page for known problems
2. Verify your container engine is working correctly:
   - Docker: `docker run hello-world`
   - Podman: `podman run hello-world`
3. Ensure you have the required permissions (e.g., user is in the docker group for Docker, or subuid/subgid configured for Podman)
4. Join our [Discord community](https://discord.gg/NS3HayKrpA) for direct assistance

### Common Issues with the One-Line Installer

If you encounter issues with the one-line installer:

- **Permission Denied**: Ensure you have sudo privileges for Linux/macOS installation
- **Docker/Podman Service Not Starting**: Try restarting your system after installation
- **Shell Alias Not Working**: Open a new terminal window or manually source your shell configuration file
- **GitHub API Rate Limiting**: If you see an error about GitHub API limits, wait a few minutes and try again

### Podman-Specific Issues

- **"WARN[0000] "/" is not a shared mount"**: Run `sudo mount --make-rshared /` or add it to `/etc/fstab`
- **Device passthrough not working**: Some devices may require `--privileged` or explicit `--device` flags; RF Swift handles this automatically in most cases
- **Image pull fails with "short-name resolution"**: Use the full image name, e.g., `docker.io/penthertz/rfswift:sdr_light`