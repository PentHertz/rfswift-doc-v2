---
title: Getting Started
weight: 1
next: /docs/quick-start
prev: /docs/comparisons
cascade:
  type: docs
---

# Getting Started with RF Swift 🚀

This guide will help you get started with RF Swift by covering system requirements, installation steps, and next actions. First we will need to setup the environment.

## Installation

RF Swift now offers a streamlined one-line installer that automatically installs all dependencies (including Docker) and configures your system for optimal performance.

Our new installer takes care of everything for you in a single command! It will:

- Install Docker if it's not already present
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
wget -qO- "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```
After installation, simply run: `rfswift`
  {{< /tab >}}
  {{< tab >}}
See our [installation documentation](docs/quick-start) for Windows installation instructions.
  {{< /tab >}}
{{< /tabs >}}

### Manual Installation

If you prefer to have more control over the installation process, you can install the components separately.

#### Linux Manual Installation

{{< callout type="info" >}}
On Linux, Docker, BuildX, and Go can be directly installed with the `install.sh` script included in the repository.
{{< /callout >}}

**Essential Components**

- **Docker**: Required to run RF Swift containers
  ```bash
  curl -fsSL "https://get.docker.com/" | sh
  ```
- **xhost**: Required for GUI application support (install via your distribution's package manager)
- **PulseAudio**: Required for audio support (install via your distribution's package manager)

**Optional Components**

- **Go Compiler**: Required if you want to build RF Swift from source
- **BuildX**: Required for cross-architecture compilation
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
- Install Docker if not already present
- Set up BuildX for cross-architecture support
- Install Go compiler if needed
- Configure xhost for GUI application access
- Set up PulseAudio for sound
- Configure user permissions for Docker
- Download and install the latest RF Swift binary

**Running Docker Without Sudo**

To avoid using `sudo` for every Docker command, add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

You may need to log out and back in for the changes to take effect. Verify it works by running `docker ps` without sudo.

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

**Installation Steps**

1. Install Docker Desktop and ensure WSL2 integration is enabled
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

**Required Software**

- Docker Desktop for macOS
- XQuartz for X11 forwarding (optional)

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
2. Verify your Docker installation is working correctly with `docker run hello-world`
3. Ensure you have the required permissions (e.g., user is in the docker group on Linux)
4. Join our [Discord community](https://discord.gg/NS3HayKrpA) for direct assistance

### Common Issues with the One-Line Installer

If you encounter issues with the one-line installer:

- **Permission Denied**: Ensure you have sudo privileges for Linux/macOS installation
- **Docker Service Not Starting**: Try restarting your system after installation
- **Shell Alias Not Working**: Open a new terminal window or manually source your shell configuration file
- **GitHub API Rate Limiting**: If you see an error about GitHub API limits, wait a few minutes and try again