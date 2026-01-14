---
title: Air-Gapped Installation
weight: 20
cascade:
  type: docs
---

# Air-Gapped Installation Guide

Complete guide for installing and running RF Swift in air-gapped, offline, or isolated environments where internet access is restricted or prohibited.

{{< callout type="warning" >}}
**Security Note**: Air-gapped installations are common in secure facilities, classified networks, and critical infrastructure environments. This guide ensures RF Swift works completely offline after initial setup.
{{< /callout >}}

---

## Overview

Air-gapped installation requires downloading all components while online, then transferring them to the isolated system. RF Swift fully supports offline operation using the `-q` (disconnected mode) flag.

### What You'll Need

**Downloaded while online:**
- Docker static binaries
- RF Swift binary (static compilation)
- Docker images (via download or export)
- X11 utilities (for GUI applications)

**Target system requirements:**
- A Linux system - Debian or Ubuntu recommended
- x86_64, RISCV64 or ARM64 architecture
- Storage for Docker images (5-20 GB depending on images)

---

## Phase 1: Online Preparation

### Step 1: Download Docker

Download Docker static binaries from the official repository:

```bash
# On a system with internet access
cd ~/airgap-prep

# For x86_64 systems
wget https://download.docker.com/linux/static/stable/x86_64/docker-29.1.4.tgz

# For ARM64 systems (if needed)
wget https://download.docker.com/linux/static/stable/aarch64/docker-29.1.4.tgz

# Verify download
ls -lh docker-*.tgz
```

{{< callout type="info" >}}
Look for latest binaries directly on the official website: `https://download.docker.com/linux/static/stable`.
{{< /callout >}}


### Step 2: Download RF Swift Binary

Download the latest RF Swift static binary from GitHub releases:

```bash
# Download latest release for x86_64
wget https://github.com/PentHertz/RF-Swift/releases/download/v0.6.5-rc4/rfswift_Linux_x86_64.tar.gz

tar -zvxf rfswift_Linux_x86_64.tar.gz

# Make executable
chmod +x rfswift

# Verify
./rfswift --version
```

**For ARM64 systems:**
```bash
wget https://github.com/PentHertz/RF-Swift/releases/download/v0.6.5-rc4/rfswift_Linux_arm64.tar.gz
tar -zvxf rfswift_Linux_arm64.tar.gz
chmod +x rfswift
```

**For RISCV64 systems:**
```bash
wget https://github.com/PentHertz/RF-Swift/releases/download/v0.6.5-rc4/rfswift_Linux_riscv64.tar.gz
tar -zvxf rfswift_Linux_riscv64.tar.gz
chmod +x rfswift
```

### Step 3: Download X11 Utilities (for GUI)

For systems that need GUI applications (GQRX, SDR++, URH, etc.):

**Debian/Ubuntu:**
```bash
# Download xhost and dependencies
apt-get download xhost x11-xserver-utils libx11-6 libxau6 libxdmcp6 libxcb1

# Or create a local repository
mkdir -p airgap-debs
cd airgap-debs
apt-get download $(apt-cache depends --recurse --no-recommends --no-suggests --no-conflicts --no-breaks --no-replaces --no-enhances xhost x11-xserver-utils | grep "^\w" | sort -u)
```

**RHEL/CentOS:**
```bash
yumdownloader --resolve xorg-x11-server-utils libX11
```

**Alpine:**
```bash
apk fetch --recursive xhost xauth
```

### Step 4: Prepare Docker Images

You have two options for Docker images:

#### Option A: Official Images (Using download feature)

```bash
# Install Docker and RF Swift temporarily on the online system
# (or use existing installation)

# Download RF Swift images with custom output names
rfswift download -i penthertz/rfswift_noble:sdr_full -o rfswift_sdr_full.tar.gz
rfswift download -i penthertz/rfswift_noble:telecom -o rfswift_telecom.tar.gz
rfswift download -i penthertz/rfswift_noble:wifi -o rfswift_wifi.tar.gz
rfswift download -i penthertz/rfswift_noble:automotive -o rfswift_automotive.tar.gz

# Images are saved with custom names as specified with -o flag
ls -lh *.tar.gz
```

#### Option B: Custom Images (Using export)

**Exporting with RF Swift:**
```bash
# Export container as tarball
rfswift export -c my_work_container -t container -o work_env.tar.gz

# Export image
rfswift export -i my_custom:latest -t image -o custom_image.tar.gz
```

### Step 5: Create Transfer Package

Organize everything for transfer:

```bash
# Create transfer directory
mkdir -p ~/rfswift-airgap-package
cd ~/rfswift-airgap-package

# Copy all components
cp ~/airgap-prep/docker-*.tgz .
cp ~/airgap-prep/rfswift .
cp ~/airgap-prep/*.tar.gz .
cp -r ~/airgap-prep/airgap-debs .

# Create installation script
cat > install-airgap.sh << 'EOF'
#!/bin/bash
# RF Swift Air-Gapped Installation Script

set -e

INSTALL_DIR="/usr/local/bin"
DOCKER_DIR="/opt/docker"

echo "=== RF Swift Air-Gapped Installation ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Install Docker
echo "[1/5] Installing Docker..."
mkdir -p $DOCKER_DIR
tar xzf docker-*.tgz -C $DOCKER_DIR --strip-components=1

# Link Docker binaries
for binary in $DOCKER_DIR/*; do
    ln -sf "$binary" "$INSTALL_DIR/$(basename $binary)"
done

# Create systemd service for Docker
cat > /etc/systemd/system/docker.service << 'DOCKERSERVICE'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target docker.socket
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/local/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
Restart=on-failure
StartLimitBurst=3
StartLimitInterval=60s

[Install]
WantedBy=multi-user.target
DOCKERSERVICE

systemctl daemon-reload
systemctl enable docker
systemctl start docker
sleep 3

echo "✓ Docker installed"

# Install RF Swift
echo "[2/5] Installing RF Swift..."
cp rfswift $INSTALL_DIR/
chmod +x $INSTALL_DIR/rfswift

echo "✓ RF Swift installed"

# Install X11 utilities (if available)
echo "[3/5] Installing X11 utilities..."
if [ -d "airgap-debs" ]; then
    dpkg -i airgap-debs/*.deb 2>/dev/null || true
    echo "✓ X11 utilities installed"
else
    echo "⚠ X11 utilities not found (GUI apps may not work)"
fi

# Load Docker images
echo "[4/5] Loading Docker images..."
for image in *.tar.gz; do
    if [[ "$image" != "docker-"* ]] && [[ "$image" != "rfswift_"* ]]; then
        echo "  Loading: $image"
        rfswift import -t image -i "$image"
    fi
done

# Load RF Swift images (custom names)
for image in rfswift_*.tar.gz; do
    if [ -f "$image" ]; then
        echo "  Loading: $image"
        rfswift import -t image -i "$image"
    fi
done

echo "✓ Images loaded"

# Verify installation
echo "[5/5] Verifying installation..."
docker --version
rfswift --version
rfswift -q images local

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Run: rfswift -q run -i penthertz/rfswift_noble:sdr_full -n test"
echo "(Use -q flag for disconnected mode)"
EOF

chmod +x install-airgap.sh

# Create README
cat > README.txt << 'EOF'
RF Swift Air-Gapped Installation Package
=========================================

This package contains everything needed to install RF Swift in an air-gapped environment.

Contents:
- docker-*.tgz       : Docker static binaries
- rfswift            : RF Swift binary (static)
- *.tar.gz           : Docker images
- airgap-debs/       : X11 utilities (if needed)
- install-airgap.sh  : Automated installation script

Installation:
1. Transfer this entire directory to the air-gapped system
2. Run: sudo ./install-airgap.sh
3. Use: rfswift -q [command]

Note: Always use -q flag in air-gapped environments to disable update checks.

For manual installation, see: https://rfswift.io/docs/air-gapped
EOF

echo "✓ Transfer package ready: $(pwd)"
ls -lh
```

### Step 6: Calculate Transfer Size

```bash
# Check total size
du -sh ~/rfswift-airgap-package

# Create checksum file
cd ~/rfswift-airgap-package
sha256sum * > SHA256SUMS
```

---

## Phase 2: Transfer to Air-Gapped System

Transfer the package using approved methods:

- **USB Drive**: Copy to USB
- **Secure File Transfer**: Use transfer system
- **Approved Network Transfer**: If limited connectivity allowed

```bash
# Example: USB transfer
cp -r ~/rfswift-airgap-package /media/usb/

# Verify checksums on destination
cd /media/usb/rfswift-airgap-package
sha256sum -c SHA256SUMS
```

---

## Phase 3: Air-Gapped Installation

### Automated Installation

On the air-gapped system:

```bash
# Extract transfer package
cd /path/to/rfswift-airgap-package

# Run installation script
sudo ./install-airgap.sh
```

### Manual Installation

If you prefer manual installation:

#### 1. Install Docker

```bash
# Extract Docker binaries (uses wildcard to match any version)
sudo tar xzf docker-*.tgz -C /opt/docker --strip-components=1

# Link to system path
sudo ln -sf /opt/docker/* /usr/local/bin/

# Create Docker systemd service
sudo tee /etc/systemd/system/docker.service > /dev/null << 'EOF'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target docker.socket
Wants=network-online.target

[Service]
Type=notify
ExecStart=/usr/local/bin/dockerd
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Start Docker
sudo systemctl daemon-reload
sudo systemctl enable docker
sudo systemctl start docker

# Verify
docker --version
```

#### 2. Install RF Swift

```bash
# Install binary
sudo cp rfswift /usr/local/bin/
sudo chmod +x /usr/local/bin/rfswift

# Verify
rfswift --version
```

#### 3. Install X11 Utilities

```bash
# For Debian/Ubuntu
sudo dpkg -i airgap-debs/*.deb

# Or manually install individual packages
sudo dpkg -i xhost*.deb x11-xserver-utils*.deb

# Verify
which xhost
```

#### 4. Load Docker Images

**Method 1: Using rfswift import (for images downloaded with custom names)**
```bash
# Import images with custom filenames from download command
rfswift import -t image -i rfswift_sdr_full.tar.gz
rfswift import -t image -i rfswift_telecom.tar.gz
rfswift import -t image -i rfswift_wifi.tar.gz
rfswift import -t image -i rfswift_automotive.tar.gz

# Verify
rfswift -q images local
```

**Method 2: Using docker load (for images saved with docker save)**
```bash
# Load images saved with docker save
docker load -i sdr_full.tar.gz
docker load -i telecom.tar.gz

# Or from .tar files
gunzip -c sdr_full.tar.gz | docker load

# Verify
docker images
```

**Method 3: Import exported containers**
```bash
# Import containers exported with docker export
docker import work_env.tar.gz my_work_env:latest

# Or with RF Swift
rfswift import -t container -i work_env.tar.gz -n restored_work
```

---

## Phase 4: Configuration & Usage

### Configure for Air-Gapped Operation

#### 1. Set Disconnected Mode by Default

```bash
# Create alias
echo 'alias rfswift="rfswift -q"' >> ~/.bashrc
source ~/.bashrc

# Or create wrapper script
sudo tee /usr/local/bin/rfswift-airgap > /dev/null << 'EOF'
#!/bin/bash
/usr/local/bin/rfswift -q "$@"
EOF
sudo chmod +x /usr/local/bin/rfswift-airgap
```

#### 2. Configure X11 for GUI

```bash
# Allow local connections
xhost +local:

# Make persistent
echo 'xhost +local:' >> ~/.xinitrc

# Or for specific user
xhost +SI:localuser:$(whoami)
```

#### 3. Verify Installation

```bash
# Test disconnected mode
rfswift -q last

# List available images
rfswift -q images local

# Create test container
rfswift -q run -i penthertz/rfswift_noble:sdr_full -n airgap_test

# Test GUI (if X11 configured)
rfswift -q exec -c airgap_test -e "xclock"

# Cleanup test
rfswift -q remove -c airgap_test
```

---

## Common Air-Gapped Workflows

### Starting a Container

```bash
# Always use -q flag
rfswift -q run -i penthertz/rfswift_noble:sdr_full -n sdr_work \
  -d /dev/bus/usb

# With GUI support
rfswift -q run -i penthertz/rfswift_noble:sdr_full -n sdr_gui \
  -d /dev/bus/usb \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=$DISPLAY
```

### Working with Containers

```bash
# Execute commands
rfswift -q exec -c sdr_work

# Add devices dynamically
rfswift -q bindings add -c sdr_work -d -t /dev/ttyUSB0

# Manage capabilities
rfswift -q capabilities add -c sdr_work -a NET_ADMIN

# Stop and restart
rfswift -q stop -c sdr_work
docker start sdr_work
```

### Creating Custom Images

```bash
# Install additional tools
rfswift -q exec -c sdr_work
apt-get update
apt-get install -y custom-tool
exit

# Commit as new image
rfswift -q commit -c sdr_work -i custom_sdr:v1

# Export for backup or sharing
rfswift -q export -i custom_sdr:v1 -t image -o custom_sdr_v1.tar.gz
```

### Container Migration

```bash
# On source system (with network)
rfswift export -c production_sdr -t container -o prod_sdr.tar.gz

# Transfer to air-gapped system
# On air-gapped system
rfswift -q import -t container -i prod_sdr.tar.gz -n production_sdr
```

---

## Troubleshooting

### Docker Won't Start

**Problem**: Docker daemon fails to start

**Solutions:**
```bash
# Check Docker daemon logs
sudo journalctl -u docker -n 50

# Verify kernel support
uname -r  # Should be 3.10+

# Check for missing kernel modules
lsmod | grep overlay
lsmod | grep bridge

# Manually load if needed
sudo modprobe overlay
sudo modprobe br_netfilter

# Restart Docker
sudo systemctl restart docker
```

### GUI Applications Don't Work

**Problem**: X11 applications fail to start

**Solutions:**
```bash
# Verify X11 is running
echo $DISPLAY

# Check xhost permissions
xhost

# Allow Docker containers
xhost +local:docker

# Verify X11 socket exists
ls -la /tmp/.X11-unix/

# Test X11 in container
rfswift -q exec -c test -e "echo \$DISPLAY"

# Check X11 forwarding
rfswift -q exec -c test -e "xdpyinfo" | head -5
```

### Images Won't Load

**Problem**: Cannot import Docker images

**Solutions:**
```bash
# Verify file integrity
sha256sum image.tar.gz

# Check file format
file image.tar.gz

# Try different import method
gunzip image.tar.gz
docker load -i image.tar

# Check Docker storage
docker system df
df -h /var/lib/docker

# Clean up space if needed
rfswift -q cleanup --all
```

### Permission Denied

**Problem**: Cannot access devices or files

**Solutions:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix device permissions
sudo chmod 666 /dev/ttyUSB0

# Use bindings for device access
rfswift -q bindings add -c container -d -t /dev/ttyUSB0

# Add necessary capabilities
rfswift -q capabilities add -c container -a NET_ADMIN
rfswift -q capabilities add -c container -a SYS_ADMIN
```

### Network Checks Hanging

**Problem**: Commands hang waiting for network

**Solutions:**
```bash
# Always use -q flag
rfswift -q [command]

# Set permanent alias
alias rfswift='rfswift -q'

# Check if accidentally using network
strace rfswift last 2>&1 | grep connect

# Disable Docker DNS
sudo tee /etc/docker/daemon.json > /dev/null << EOF
{
  "dns": ["127.0.0.1"]
}
EOF
sudo systemctl restart docker
```

---

## Related Documentation

- [Requirements & Supported Platforms](/docs/supports)
- [Quick Start](/docs/quick-start)
- [Command Reference](/docs/commands)
- [Security Guidelines](/docs/security)

---

{{< callout emoji="🔒" >}}
**Security First**: Always verify checksums of downloaded components. Use the `-q` flag to ensure no network calls in classified environments.
{{< /callout >}}

{{< callout type="warning" >}}
**Plan Ahead**: Download more images than you think you'll need. Returning for additional components requires another approval cycle in secure facilities.
{{< /callout >}}

{{< callout type="info" >}}
**Stay Updated**: While air-gapped systems can't auto-update, plan regular update cycles where new packages are brought in through approved channels.
{{< /callout >}}