---
title: images
weight: 12
prev: /docs/commands/build
next: /docs/commands/delete
---

# rfswift images

Manage Docker images - list local images, browse remote registry, and pull images.

## Synopsis

```bash
# List local images
rfswift images local

# List remote registry images
rfswift images remote

# Pull image from registry
rfswift images pull -i IMAGE_NAME [-t TAG]
```

The `images` command provides comprehensive image management: view locally available images, discover images in the RF Swift registry, and pull images from Docker registries.

---

## Subcommands

### images local

List all RF Swift images present on the local system.

**Usage:**
```bash
rfswift images local
```

**Output includes:**
- Image repository and tag
- Image ID
- Creation date
- Image size

### images remote

List available RF Swift images from the official Penthertz registry.

**Usage:**
```bash
rfswift images remote
```

**Output includes:**
- Available image names
- Image descriptions
- Available tags/versions

### images pull

Pull images from Docker registries to local system.

**Usage:**
```bash
rfswift images pull -i IMAGE_NAME [-t TAG]
```

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image reference to pull | Yes | `-i penthertz/rfswift:sdr_full` |
| `-t, --tag STRING` | Rename to target tag locally | No | `-t my_sdr:v1` |

---

## Examples

### List Local Images

**View all local RF Swift images:**
```bash
rfswift images local
```

**Example output:**
```
REPOSITORY              TAG        IMAGE ID       CREATED        SIZE
penthertz/rfswift_noble      sdr_full    a1b2c3d4e5f6   2 weeks ago    4.2GB
penthertz/rfswift_noble      bluetooth   b2c3d4e5f6g7   3 weeks ago    2.1GB
my_custom_sdr          v1.0        c3d4e5f6g7h8   1 day ago      3.8GB
```

### Browse Remote Images

**See available images in registry:**
```bash
rfswift images remote
```

**Example output:**
```
Available RF Swift Images:

sdr_full - Complete SDR toolkit with all tools
sdr_light - Lightweight SDR environment
bluetooth - Bluetooth security and analysis tools
wifi - WiFi security and penetration testing
hardware - Hardware security and reverse engineering
automotive - Automotive security (CAN, V2X)
telecom - Telecommunications security (2G-5G)
```

### Pull Images

**Pull specific image:**
```bash
rfswift images pull -i penthertz/rfswift:sdr_full
```

**Pull and rename locally:**
```bash
rfswift images pull -i penthertz/rfswift:sdr_full -t my_sdr:production
```

**Pull specific version:**
```bash
rfswift images pull -i penthertz/rfswift:sdr_full -t sdr_v0.6.5
```

**Pull multiple images:**
```bash
# Pull all needed images
rfswift images pull -i penthertz/rfswift:sdr_full
rfswift images pull -i penthertz/rfswift:bluetooth
rfswift images pull -i penthertz/rfswift:wifi
```

### Real-World Scenarios

**Initial setup:**
```bash
# Check what's available
rfswift images remote

# Pull main working image
rfswift images pull -i penthertz/rfswift:sdr_full

# Verify it's available
rfswift images local

# Run it
rfswift run -i penthertz/rfswift:sdr_full -n my_workspace
```

**Version management:**
```bash
# Pull new version with specific tag
rfswift images pull -i penthertz/rfswift:sdr_full -t sdr_v0.6.6

# Keep old version
rfswift images local | grep penthertz/rfswift

# Test new version
rfswift run -i sdr_v0.6.6 -n test_new_version

# If good, update production
rfswift upgrade -c production -i sdr_v0.6.6
```

**Multi-environment setup:**
```bash
# Pull images for different purposes
rfswift images pull -i penthertz/rfswift:sdr_full -t sdr_work
rfswift images pull -i penthertz/rfswift:bluetooth -t bt_analysis
rfswift images pull -i penthertz/rfswift:wifi -t wifi_testing

# Verify all available
rfswift images local
```

**Team synchronization:**
```bash
#!/bin/bash
# Pull standard team images

echo "Synchronizing team images..."

TEAM_IMAGES=(
    "penthertz/rfswift:sdr_full"
    "penthertz/rfswift:bluetooth"
    "penthertz/rfswift:wifi"
)

for image in "${TEAM_IMAGES[@]}"; do
    echo "Pulling $image..."
    rfswift images pull -i "$image"
done

echo "Team images synchronized:"
rfswift images local
```

---

## Image Management Workflows

### Check Available Images

```bash
# See what's in the registry
rfswift images remote

# See what you have locally
rfswift images local

# Compare local vs remote
echo "=== LOCAL IMAGES ==="
rfswift images local
echo ""
echo "=== AVAILABLE REMOTE IMAGES ==="
rfswift images remote
```

### Update to Latest Versions

```bash
#!/bin/bash
# update_images.sh

echo "Checking for image updates..."

# List current local images
rfswift images local

# Pull latest versions
echo "Pulling latest versions..."
rfswift images pull -i penthertz/rfswift:sdr_full
rfswift images pull -i penthertz/rfswift:bluetooth
rfswift images pull -i penthertz/rfswift:wifi

echo "Update complete. Current images:"
rfswift images local
```

### Cleanup Old Images

```bash
# View all images
rfswift images local

# Remove old/unused images
docker images | grep "penthertz/rfswift"

# Remove specific old version
docker rmi penthertz/rfswift:old_version

# Or use RF Swift delete command
rfswift delete -i penthertz/rfswift:old_version

# Verify cleanup
rfswift images local
```

---

## Understanding Image Tags

### Official RF Swift Tags

RF Swift images use descriptive tags for different configurations:

| Tag | Purpose | Size | Use Case |
|-----|---------|------|----------|
| `sdr_full` | Complete SDR stack | ~4GB | Professional SDR work |
| `sdr_light` | Lightweight SDR | ~1.5GB | Basic SDR tasks |
| `bluetooth` | Bluetooth tools | ~2GB | Bluetooth security |
| `wifi` | WiFi tools | ~2GB | WiFi security |
| `hardware` | Hardware security | ~2.5GB | Hardware hacking |
| `automotive` | Automotive security | ~2GB | Vehicle security |
| `telecom` | Telecom security | ~3GB | Mobile networks |


---

## Common Patterns

### First-Time Setup

```bash
# 1. See what's available
rfswift images remote

# 2. Pull what you need
rfswift images pull -i penthertz/rfswift:sdr_full

# 3. Verify it's ready
rfswift images local

# 4. Start using it
rfswift run -i penthertz/rfswift:sdr_full -n mission
```

---

## Troubleshooting

### No Images Listed Locally

**Problem:** `images local` shows no RF Swift images

**Solutions:**
```bash
# Pull your first image
rfswift images pull -i penthertz/rfswift:sdr_full

# Check all Docker images (not just RF Swift)
docker images

# Verify Docker is running
docker ps
```

### Remote Registry Not Accessible

**Problem:** `images remote` fails or shows no images

**Solutions:**
```bash
# Check network connectivity
ping registry.hub.docker.com

# Check Docker Hub status
curl -I https://hub.docker.com

# Try direct docker search
docker search penthertz/rfswift_noble

# Check if behind proxy/firewall
```

### Pull Fails

**Error:** `Error pulling image`

**Solutions:**
```bash
# Check image name spelling
rfswift images remote  # Verify exact name

# Try with docker directly
docker pull penthertz/rfswift:sdr_full

# Check disk space
df -h

# Check network
ping registry.hub.docker.com
```

### Authentication Required

**Problem:** Private registry requires login

**Solutions:**
```bash
# Login to registry
docker login registry.example.com

# Then pull
rfswift images pull -i registry.example.com/image:tag

# For Docker Hub private images
docker login
rfswift images pull -i myuser/private-image:tag
```

---

## Related Commands

- [`build`](/docs/commands/build) - Build custom images
- [`download`](/docs/commands/download) - Download images to files
- [`export`](/docs/commands/export) - Export images to archives
- [`import`](/docs/commands/import) - Import images from archives
- [`delete`](/docs/commands/delete) - Remove images
- [`run`](/docs/commands/run) - Run containers from images

---

{{< callout emoji="🖼️" >}}
**Check Before Pull**: Use `images remote` to see what's available before pulling. This helps you choose the right image variant for your needs and avoid pulling unnecessary large images.
{{< /callout >}}

{{< callout type="warning" >}}
**Disk Space**: RF Swift images can be large (1.5-4GB). Always check available disk space with `df -h` before pulling multiple images. Use `sdr_light` for space-constrained systems.
{{< /callout >}}

{{< callout type="info" >}}
**Tag Management**: Use the `-t` flag when pulling to create descriptive local tags like `sdr_production` or `sdr_dev`. This makes it easier to manage multiple versions and environments!
{{< /callout >}}