---
title: images
weight: 12
prev: /docs/commands/build
next: /docs/commands/delete
---

# rfswift images

Manage Docker images - list local images, browse remote registry, pull images, and track versions.

## Synopsis

```bash
# List local images
rfswift images local

# List remote registry images
rfswift images remote

# List remote images with versions
rfswift images remote -v

# Pull image from registry
rfswift images pull -i IMAGE_NAME [-t TAG] [-V version]
```

The `images` command provides comprehensive image management: view locally available images, discover images in the RF Swift registry, pull images from Docker registries, and **track image versions** for better environment control.

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
- **Version information** (v0.7.0+)

### images remote

List available RF Swift images from the official Penthertz registry.

**Usage:**
```bash
rfswift images remote [-v]
```

**Options:**

| Flag | Description | Example |
|------|-------------|---------|
| `-v, --versions` | Show available versions for each image | `-v` |

**Output includes:**
- Available image names
- Image descriptions
- Available tags/versions
- **Version history** (with `-v` flag)

### images pull

Pull images from Docker registries to local system.

**Usage:**
```bash
rfswift images pull -i IMAGE_NAME [-t TAG] [-V version]
```

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image reference to pull | Yes | `-i penthertz/rfswift_noble:sdr_full` |
| `-t, --tag STRING` | Rename to target tag locally | No | `-t my_sdr:v1` |
| `-V, --version STRING` | Rename to wanted version | No | `-V 0.1.1` |

---

## 🆕 Version Management (v0.7.0+)

Starting with RF Swift v0.7.0, images now support **proper versioning** to help you track and manage different image releases.

### Viewing Available Versions

```bash
# List remote images with all available versions
rfswift images remote -v
```

**Example output:**
```
┌──────────────────────┬────────────────────┬─────────────────────────────────────┬──────────────┬──────────────────────────────────────────────────────────────┐
│ Tag                  │ Pushed Date        │ Image                               │ Size         │ Versions                                                     │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
│ wifi                 │ 2026-01-27 16:27   │ penthertz/rfswift_noble:wifi        │ 7981.2 MB    │ latest, 0.1.1                                                │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
│ sdr_full             │ 2026-01-27 16:27   │ penthertz/rfswift_noble:sdr_full    │ 14176.2 MB   │ latest, 0.1.1                                                │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
```

### Pulling Specific Versions

```bash
# Pull latest version (default)
rfswift images pull -i sdr_full

# Pull specific version
rfswift images pull -i sdr_full -V 0.1.1
```

### Version Comparison

```bash
  📦 RF Swift Images                                                                                                            
┌──────────────────────────────┬─────────────────┬──────────────┬───────────────────────────┬─────────────┬────────────┬─────────┐
│ Repository                   │ Tag             │ Image ID     │ Created                   │ Size        │ Status     │ Version │
├──────────────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┼─────────┤
│ penthertz/rfswift_noble      │ sdr_light_0.1.1 │ cdf39442893e │ 2026-01-19T20:17:49+01:00 │ 13076.96 MB │ Up to date │ 0.1.1   │
...
```

---

## Troubleshooting

### No Images Listed Locally

**Problem:** `images local` shows no RF Swift images

**Solutions:**
```bash
# Pull your first image
rfswift images pull -i sdr_full

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
rfswift images remote -v  # Verify exact name and version

# Try with docker directly
docker pull penthertz/rfswift:sdr_full

# Check disk space
df -h

# Check network
ping registry.hub.docker.com
```

### Version Not Found

**Error:** `Version not found` or `Tag not found`

**Solutions:**
```bash
# List all available versions
rfswift images remote -v

# Verify the version exists
# Use the exact version string shown in the list

# Pull with correct version format
rfswift images pull -i wifi v0.1.0
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
- [`retag`](/docs/commands/retag) - Retag images locally
- [`run`](/docs/commands/run) - Run containers from images
- [`upgrade`](/docs/commands/upgrade) - Upgrade container to new image version

---

{{< callout type="warning" >}}
**Disk Space**: RF Swift images can be large (1.5-4GB). Always check available disk space with `df -h` before pulling multiple images or versions. Use `sdr_light` for space-constrained systems.
{{< /callout >}}
