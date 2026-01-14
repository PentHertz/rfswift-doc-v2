---
title: download
weight: 9
prev: /docs/commands/import
next: /docs/commands/upgrade
---

# rfswift download

Download Docker images from registries and save them as compressed archives for offline use.

## Synopsis

```bash
rfswift download -i IMAGE_NAME -o OUTPUT_FILE.tar.gz [--pull]
```

The `download` command pulls Docker images from registries (Docker Hub, private registries) and saves them locally as compressed tar.gz files. This enables offline distribution, air-gapped installations, and image archival.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image name to download | Yes | `-i penthertz/rfswift:sdr_full` |
| `-o, --output STRING` | Output file path | Yes | `-o rfswift-sdr.tar.gz` |
| `--pull` | Pull image first if not present locally | No | `--pull` |

---

## Examples

### Basic Usage

**Download RF Swift image:**
```bash
rfswift download -i penthertz/rfswift:sdr_full -o rfswift-sdr-full.tar.gz
```

**Download with automatic pull:**
```bash
rfswift download -i penthertz/rfswift:sdr_full -o sdr_full.tar.gz --pull
```

**Download specific version:**
```bash
rfswift download -i penthertz/rfswift:bluetooth -o bluetooth-tools-v2025.tar.gz
```

**Download to specific directory:**
```bash
rfswift download -i penthertz/rfswift:wifi \
  -o ~/offline-images/wifi-tools-$(date +%Y%m%d).tar.gz
```

### Real-World Scenarios

**Prepare offline installation media:**
```bash
# Download all required RF Swift images
rfswift download -i penthertz/rfswift:sdr_full \
  -o /media/usb/rfswift-sdr-full.tar.gz --pull

rfswift download -i penthertz/rfswift:bluetooth \
  -o /media/usb/rfswift-bluetooth.tar.gz --pull

rfswift download -i penthertz/rfswift:wifi \
  -o /media/usb/rfswift-wifi.tar.gz --pull

# Create README for offline users
cat > /media/usb/README.txt << 'EOF'
RF Swift Offline Installation

To install:
1. Import images: rfswift import image -i rfswift-*.tar.gz
2. Run container: rfswift run -i penthertz/rfswift:sdr_full -n workspace
EOF
```

**Air-gapped system preparation:**
```bash
# On internet-connected system
OFFLINE_DIR=~/offline-bundle
mkdir -p "$OFFLINE_DIR"

# Download latest images
rfswift download -i penthertz/rfswift:sdr_full \
  -o "$OFFLINE_DIR/sdr_full_$(date +%Y%m%d).tar.gz" --pull

rfswift download -i penthertz/rfswift:hardware \
  -o "$OFFLINE_DIR/hardware_$(date +%Y%m%d).tar.gz" --pull

# Create checksum file
cd "$OFFLINE_DIR"
sha256sum *.tar.gz > checksums.sha256

# Transfer entire directory to air-gapped system
```

**Version archival:**
```bash
# Archive specific version before upgrade
rfswift download -i penthertz/rfswift:sdr_full \
  -o archives/rfswift-sdr-full-v0.6.5.tar.gz

# Document version
echo "RF Swift SDR Full v0.6.5 - Archived $(date)" \
  > archives/rfswift-sdr-full-v0.6.5.txt
```

---

## Troubleshooting

### Image Not Found in Registry

**Error:** `Error: image not found: penthertz/rfswift:unknown_tag`

**Solutions:**
```bash
# List available images
rfswift images remote

# Verify spelling
rfswift download -i penthertz/rfswift_noble:sdr_full -o output.tar.gz
```

### Network Connection Failed

**Error:** `Error: connection timeout` or `network unreachable`

**Solutions:**
```bash
# Check network connectivity
ping registry.hub.docker.com

# Check Docker daemon
docker info

# Use proxy if behind firewall
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port

# Retry with longer timeout
# (May need Docker daemon configuration)
```


### Permission Denied

**Error:** `permission denied` writing output file

**Solutions:**
```bash
# Check directory permissions
ls -ld $(dirname output.tar.gz)

# Create directory with proper permissions
mkdir -p ~/downloads
chmod 755 ~/downloads

# Use absolute path
rfswift download -i image -o ~/downloads/image.tar.gz

# Or use sudo
sudo rfswift download -i image -o /opt/images/image.tar.gz
```

### Download Interrupted

**Problem:** Download stopped mid-way

**Solutions:**
```bash
# Check if partial file exists
ls -lh output.tar.gz

# Remove partial file
rm output.tar.gz

# Retry download
rfswift download -i penthertz/rfswift:sdr_full -o output.tar.gz --pull

# For unstable connections, use screen/tmux
screen -S download
rfswift download -i image -o output.tar.gz --pull
# Ctrl+A, D to detach
```

### Authentication Required

**Error:** `authentication required` for private registry

**Solutions:**
```bash
# Login to registry first
docker login registry.example.com
# Enter username and password

# Then download
rfswift download -i registry.example.com/image:tag -o output.tar.gz

# For Docker Hub private repos
docker login
rfswift download -i myuser/private-image:tag -o output.tar.gz
```

### Pull Flag Not Working

**Problem:** `--pull` doesn't seem to work

**Solutions:**
```bash
# Verify flag syntax (no equals sign)
rfswift download -i image -o output.tar.gz --pull

# Not: --pull=true

# Manually pull first if needed
docker pull penthertz/rfswift:sdr_full
rfswift download -i penthertz/rfswift:sdr_full -o output.tar.gz

# Check image exists after pull
docker images | grep rfswift
```

---

## Related Commands

- [`export`](/docs/commands/export) - Export local images/containers to tar.gz
- [`import`](/docs/commands/import) - Import downloaded archives
- [`images`](/docs/commands/images) - Manage images (pull, list)
- [`run`](/docs/commands/run) - Run containers from downloaded images

---

{{< callout emoji="📥" >}}
**Always Use --pull**: For downloading latest versions, always include the `--pull` flag. Without it, RF Swift uses the locally cached image which may be outdated.
{{< /callout >}}

{{< callout type="warning" >}}
**Space Requirements**: Downloading and compressing images requires approximately 2x the final file size in available disk space. A 1.5 GB download needs ~3 GB free space.
{{< /callout >}}

{{< callout type="info" >}}
**Offline Distribution**: The `download` command is specifically designed for creating offline installation packages. Combine with `import image` on the destination system to complete the workflow.
{{< /callout >}}