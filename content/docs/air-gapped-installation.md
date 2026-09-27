---
title: "Air-gapped installation"
linkTitle: "Air-gapped install"
level: advanced
description: "Install and run RF Swift on machines with no internet access: prepare everything online, transfer it, install offline."
weight: 20
---

This guide installs RF Swift on a machine with **no internet access**: secure facilities, classified networks, critical infrastructure, or a lab machine that must stay offline. You prepare everything on a connected computer, carry it over, and install it offline. After that, RF Swift works completely offline with the `-q` (disconnected mode) flag.

**The four phases:**

1. **Prepare online**: download the engine, the RF Swift binary, the images and the X11 utilities.
2. **Transfer**: carry the package over an approved channel and verify its checksums.
3. **Install offline**: run the install script, or install each piece by hand.
4. **Configure and use**: make disconnected mode the default and test a container.

{{< callout type="warning" title="Plan ahead" >}}
Download more images than you think you'll need. In secure facilities, coming back for another component usually means another approval cycle.
{{< /callout >}}

## Overview

### Two routes: containers or Nix

| | Containers (Docker or Podman) | Nix environments |
|---|---|---|
| **What you carry** | The engine, the RF Swift binary, image archives (`rfswift image download`) | The RF Swift binary and `.rfenv` archives (`rfswift env export`) |
| **Target needs** | A container engine | Nix installed |
| **On the target** | `rfswift image import image -i <file>` | `rfswift env import <file>.rfenv` |

**The Nix route, without a container engine**: an air-gapped machine with Nix installed can run native environments from `.rfenv` archives. Export on the online machine with `rfswift env export mysdr -o mysdr.rfenv` (the closure and the workspace travel together) and import with `rfswift env import mysdr.rfenv`. The Workbench exports the same archives from a mission's right-click menu.

The rest of this page follows the container route with Docker. Podman has no daemon, which suits air-gapped systems well: see [Using Podman](/docs/guide/podman/#air-gapped-environment).

### What you'll need

**Downloaded while online:**

- Docker static binaries (or Podman from the distribution's repositories)
- The RF Swift binary (static, `rfswift_Linux_<arch>.tar.gz`) or the native package (`.deb`, `.rpm`, `.pkg.tar.zst`), which also brings `xhost` and `pactl` as dependencies
- Container images (`rfswift image download`), or Nix environments (`rfswift env export`)
- X11 utilities (for GUI applications)

**Target system:**

- A Linux system; Debian or Ubuntu recommended
- x86_64, RISCV64 or ARM64 architecture
- Storage for the images (5-20 GB depending on the images)

## Phase 1: online preparation

{{% steps %}}

### Download Docker

Download the Docker static binaries from the official repository:

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

Look for the latest binaries directly on the official website: `https://download.docker.com/linux/static/stable`.

### Download the RF Swift binary

Download the RF Swift static binary from the GitHub releases:

{{< tabs items="x86_64,ARM64,RISCV64" >}}
  {{< tab >}}
```bash
wget https://github.com/PentHertz/RF-Swift/releases/download/v4.0.2/rfswift_Linux_x86_64.tar.gz
tar -zvxf rfswift_Linux_x86_64.tar.gz
chmod +x rfswift
./rfswift --version
```
  {{< /tab >}}
  {{< tab >}}
```bash
wget https://github.com/PentHertz/RF-Swift/releases/download/v4.0.2/rfswift_Linux_arm64.tar.gz
tar -zvxf rfswift_Linux_arm64.tar.gz
chmod +x rfswift
```
  {{< /tab >}}
  {{< tab >}}
```bash
wget https://github.com/PentHertz/RF-Swift/releases/download/v4.0.2/rfswift_Linux_riscv64.tar.gz
tar -zvxf rfswift_Linux_riscv64.tar.gz
chmod +x rfswift
```
  {{< /tab >}}
{{< /tabs >}}

### Download the X11 utilities (for GUI tools)

Needed for graphical applications such as GQRX, SDR++ or URH:

{{< tabs items="Debian/Ubuntu,RHEL/CentOS,Alpine" >}}
  {{< tab >}}
```bash
# Download xhost and dependencies
apt-get download xhost x11-xserver-utils libx11-6 libxau6 libxdmcp6 libxcb1

# Or create a local repository
mkdir -p airgap-debs
cd airgap-debs
apt-get download $(apt-cache depends --recurse --no-recommends --no-suggests --no-conflicts --no-breaks --no-replaces --no-enhances xhost x11-xserver-utils | grep "^\w" | sort -u)
```
  {{< /tab >}}
  {{< tab >}}
```bash
yumdownloader --resolve xorg-x11-server-utils libX11
```
  {{< /tab >}}
  {{< tab >}}
```bash
apk fetch --recursive xhost xauth
```
  {{< /tab >}}
{{< /tabs >}}

### Prepare the images

**Option A: official images**, saved with the download command (install Docker and RF Swift temporarily on the online system, or use an existing installation):

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o rfswift_sdr_full.tar.gz
rfswift image download -i penthertz/rfswift_resolute:telecom -o rfswift_telecom.tar.gz
rfswift image download -i penthertz/rfswift_resolute:wifi -o rfswift_wifi.tar.gz
rfswift image download -i penthertz/rfswift_resolute:automotive -o rfswift_automotive.tar.gz

# Images are saved with the names given to -o
ls -lh *.tar.gz
```

**Option B: your own containers and images**, saved with export:

```bash
# Export a container as a tarball
rfswift image export container -c my_work_container -o work_env.tar.gz

# Export an image
rfswift image export image -i my_custom:latest -o custom_image.tar.gz
```

The older spellings (`rfswift download`, `rfswift export`, `rfswift import`) still work.

### Create the transfer package

Put everything in one directory, with an install script and a README:

```bash
mkdir -p ~/rfswift-airgap-package
cd ~/rfswift-airgap-package

# Copy all components
cp ~/airgap-prep/docker-*.tgz .
cp ~/airgap-prep/rfswift .
cp ~/airgap-prep/*.tar.gz .
cp -r ~/airgap-prep/airgap-debs .
```

{{% details title="The install-airgap.sh script and README (create them in the package directory)" %}}

```bash
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
        rfswift image import image -i "$image"
    fi
done

# Load RF Swift images (custom names)
for image in rfswift_*.tar.gz; do
    if [ -f "$image" ]; then
        echo "  Loading: $image"
        rfswift image import image -i "$image"
    fi
done

echo "✓ Images loaded"

# Verify installation
echo "[5/5] Verifying installation..."
docker --version
rfswift --version
rfswift -q image local

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Run: rfswift -q container create -i penthertz/rfswift_resolute:sdr_full -n test"
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

For manual installation, see: https://rfswift.io/docs/air-gapped-installation/
EOF

echo "✓ Transfer package ready: $(pwd)"
ls -lh
```

{{% /details %}}

### Check the size and create checksums

```bash
# Check total size
du -sh ~/rfswift-airgap-package

# Create checksum file
cd ~/rfswift-airgap-package
sha256sum * > SHA256SUMS
```

{{% /steps %}}

## Phase 2: transfer to the air-gapped system

Transfer the package with an approved method:

- **USB drive**: copy it to a USB drive.
- **Secure file transfer**: use your organisation's transfer system.
- **Approved network transfer**: if limited connectivity is allowed.

Then verify the checksums on the destination:

```bash
# Example: USB transfer
cp -r ~/rfswift-airgap-package /media/usb/

# Verify checksums on destination
cd /media/usb/rfswift-airgap-package
sha256sum -c SHA256SUMS
```

## Phase 3: air-gapped installation

**Automated**: on the air-gapped system, run the script from the package:

```bash
cd /path/to/rfswift-airgap-package
sudo ./install-airgap.sh
```

**Manual**: if you prefer to install each piece yourself, follow these steps:

{{% steps %}}

### Install Docker

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

### Install RF Swift

```bash
sudo cp rfswift /usr/local/bin/
sudo chmod +x /usr/local/bin/rfswift
rfswift --version
```

### Install the X11 utilities

```bash
# For Debian/Ubuntu
sudo dpkg -i airgap-debs/*.deb

# Or manually install individual packages
sudo dpkg -i xhost*.deb x11-xserver-utils*.deb

# Verify
which xhost
```

### Load the images

Images saved with `image download` (custom file names):

```bash
rfswift image import image -i rfswift_sdr_full.tar.gz
rfswift image import image -i rfswift_telecom.tar.gz
rfswift image import image -i rfswift_wifi.tar.gz
rfswift image import image -i rfswift_automotive.tar.gz

# Verify
rfswift -q image local
```

Containers saved with `image export container`:

```bash
rfswift image import container -i work_env.tar.gz -n restored_work:tag
```

{{% /steps %}}

## Phase 4: configuration and usage

### Make disconnected mode the default

Always use `-q` in air-gapped environments: it disables update checks and every other network query.

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

### Configure X11 for GUI tools

```bash
# Allow local connections
xhost +local:

# Make persistent
echo 'xhost +local:' >> ~/.xinitrc

# Or for specific user
xhost +SI:localuser:$(whoami)
```

### Verify the installation

```bash
rfswift -q container last                                      # test disconnected mode
rfswift -q image local                                         # list available images
rfswift -q container create -i penthertz/rfswift_resolute:sdr_full -n airgap_test
rfswift -q container shell -c airgap_test -e "xclock"         # test GUI (if X11 is configured)
rfswift -q container rm -c airgap_test                         # clean up
```

## Troubleshooting

### Docker won't start

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

### GUI applications don't start

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
rfswift -q container shell -c test -e "echo \$DISPLAY"

# Check X11 forwarding
rfswift -q container shell -c test -e "xdpyinfo" | head -5
```

### Images won't load

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
rfswift -q system cleanup all
```

### Permission denied on devices or files

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix device permissions
sudo chmod 666 /dev/ttyUSB0

# Use bindings for device access
rfswift -q config bindings add -c container -d -t /dev/ttyUSB0

# Add necessary capabilities
rfswift -q config capabilities add -c container -p NET_ADMIN
rfswift -q config capabilities add -c container -p SYS_ADMIN
```

### Commands hang waiting for the network

```bash
# Always use -q flag
rfswift -q [command]

# Set permanent alias
alias rfswift='rfswift -q'

# Check if accidentally using network
strace rfswift container last 2>&1 | grep connect

# Disable Docker DNS
sudo tee /etc/docker/daemon.json > /dev/null << EOF
{
  "dns": ["127.0.0.1"]
}
EOF
sudo systemctl restart docker
```

## Good practice

- **Verify checksums** of every downloaded component, and use `-q` so that no network call is made in classified environments.
- **Plan regular update cycles**: air-gapped systems can't update themselves, so bring new packages in through approved channels on a schedule.

## Related

- [Will it run on my computer?](/docs/supports/)
- [Choose your engine](/docs/engines/)
- [Quick start](/docs/quick-start/)
- [Command reference](/docs/commands/)
- [Security](/docs/security/)
