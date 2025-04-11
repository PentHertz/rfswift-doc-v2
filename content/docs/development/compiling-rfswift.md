---
title: Compiling RF Swift from Source
weight: 1
prev: /docs/development
next: /docs/development/building-images
cascade:
  type: docs
---

# Building RF Swift from Source

This guide explains how to compile RF Swift from source code, allowing you to customize the binary, contribute to development, or build for specific architectures.

## Prerequisites

Before you begin, ensure your system has sufficient resources:
- At least 2GB of RAM
- At least 4GB of free disk space
- Internet connection (for downloading dependencies)
- Administrator/root access for installation

## Compilation Process

{{% steps %}}

### Clone the Repository

First, clone the RF Swift source code from the official repository:

```bash
git clone https://github.com/PentHertz/RF-Swift.git
cd RF-Swift
```

### Build Using Installation Scripts

RF Swift provides platform-specific scripts to handle the entire build process:

#### Linux/macOS

Use the `install.sh` script which handles all dependencies and compilation:

```bash
./install.sh
```

The script will:
1. Check for and install required dependencies (Docker, BuildX, Go)
2. Compile the RF Swift binary for your architecture
3. Offer to create a system-wide alias for the `rfswift` command
4. Provide options for building or pulling container images

#### Windows

For Windows systems, use the `build-windows.bat` script:

```cmd
build-windows.bat
```

This script will set up the required dependencies and compile the RF Swift binary for Windows.

#### Special Platform: Steam Deck

The Linux installation script includes special handling for Steam Deck:

```bash
./install.sh
[+] Checking Docker installation
Are you installing on a Steam Deck? (yes/no): yes
```

Selecting "yes" will:
- Unlock Steam OS from read-only mode
- Configure Steam Deck-specific settings
- Install appropriate dependencies for the Steam Deck hardware

### Configure Your Installation

During installation, you'll be prompted with several configuration options:

```bash
Do you want to create an alias for the binary? (yes/no): yes
```

Creating an alias allows you to run RF Swift from any directory using the `rfswift` command.

After compilation completes, you'll be asked whether to build or pull container images:

```bash
Docker is already installed. Moving on.
Docker Buildx is already installed. Moving on.
Docker Compose v2 is already installed. Moving on.
[+] Installing Go
golang is already installed in /usr/local/go/bin. Moving on.
[+] Building RF Swift Go Project
RF Swift Go Project built successfully.
Do you want to build a Docker container, pull an existing image, or exit?
1) Build Docker container
2) Pull Docker image
3) Exit
Choose an option (1, 2, or 3): 
```

You can choose to:
- Build a custom container image (option 1)
- Pull an existing pre-built image from the repository (option 2)
- Exit and handle images later (option 3)

{{< callout type="info" >}}
You can always build or pull images later using the RF Swift command-line interface.
{{< /callout >}}

### Test Your Compilation

Once compiled, verify that your RF Swift binary works correctly:

```bash
# If you created an alias
rfswift --version

# Or using the direct path
./rfswift --version
```

This should display the version information and confirm the binary is functioning properly.

{{% /steps %}}

## Manual Compilation

If you prefer to handle the compilation process manually or need more control over the build, you can follow these steps:

### Install Dependencies

First, ensure you have all required dependencies:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git golang-go docker.io

# Fedora/CentOS/RHEL
sudo dnf install -y git golang docker

# Arch Linux
sudo pacman -S git go docker

# macOS (using Homebrew)
brew install go docker
```

### Compile the Binary

Navigate to the cloned repository and compile the binary:

```bash
cd RF-Swift
go build -o rfswift
```

For cross-compilation (building for a different architecture):

```bash
# For ARM64 (e.g., Raspberry Pi)
GOOS=linux GOARCH=arm64 go build -o rfswift_arm64

# For Windows
GOOS=windows GOARCH=amd64 go build -o rfswift.exe

# For macOS
GOOS=darwin GOARCH=amd64 go build -o rfswift_macos
```

### Install the Binary

Move the compiled binary to a location in your PATH:

```bash
# Linux/macOS
sudo mv rfswift /usr/local/bin/
sudo chmod +x /usr/local/bin/rfswift

# Or for local user only
mv rfswift ~/bin/
chmod +x ~/bin/rfswift
```

## Running RF Swift

After compiling RF Swift, you can start using it to manage containers:

### Create and Run a Container

To create and run a container using an image:

```bash
# With sudo (Linux without Docker Desktop)
sudo rfswift run -i penthertz/rfswift:sdr_full -n my_sdr_container

# Without sudo (macOS, Windows, or Linux with Docker Desktop)
rfswift run -i penthertz/rfswift:sdr_full -n my_sdr_container
```

### Resume Existing Containers

To resume work with previously created containers:

```bash
rfswift exec -c my_sdr_container
```

## Troubleshooting Compilation Issues

If you encounter issues during compilation:

### Go Module Issues

```bash
# Reset the Go module cache
go clean -modcache
# Try building again
go build -o rfswift
```

### Docker Permissions

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### Dependency Version Conflicts

```bash
# Force use of specific versions in go.mod
go mod edit -require=github.com/some/dependency@v1.2.3
go mod tidy
```

## Next Steps

Now that you have successfully compiled RF Swift, you can:

{{< cards >}}
  {{< card link="/docs/development/building-images" title="Build Custom Images" icon="beaker" subtitle="Create your own specialized container images with custom tools" >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="play" subtitle="Learn how to use RF Swift with pre-built images" >}}
  {{< card link="/docs/guide" title="User Guide" icon="book-open" subtitle="Explore the complete RF Swift documentation" >}}
{{< /cards >}}