---
title: images
weight: 12
prev: /docs/commands/build
next: /docs/commands/delete
---

# rfswift image local / remote / pull / versions

List local images, browse the official registry, pull images and track their versions.

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift image ...`. The legacy `rfswift images ...` tree still works and prints a notice. The whole group, including `build`, `rm`, `tag`, `download`, `export`, `import` and `audit`, is described on the [image](/docs/commands/image) page.
{{< /callout >}}

## Synopsis

```bash
rfswift image local [-v] [-f FILTER]              # local images with version status
rfswift image remote [-v] [-f FILTER]             # images published for your architecture
rfswift image pull -i IMAGE [-t TAG] [-V VERSION] # pull, optionally a specific version, optionally retag
rfswift image versions [-f FILTER]                # every published version of each image
rfswift image audit IMAGE [--format ...]          # CVE scan, see the audit page
```

---

## Subcommands

### images local

List all RF Swift images present on the local system.

**Usage:**
```bash
rfswift image local [-v] [-f FILTER]
```

**Options:**

| Flag | Description | Example |
|------|-------------|---------|
| `-v, --show-versions` | Show version information for images | `-v` |
| `-f, --filter STRING` | Filter images by name | `-f sdr_full` |

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
rfswift image remote [-v] [-f FILTER]
```

**Options:**

| Flag | Description | Example |
|------|-------------|---------|
| `-v, --show-versions` | Show version information for images | `-v` |
| `-f, --filter STRING` | Filter images by name | `-f wifi` |

**Output includes:**
- Available image names
- Image descriptions
- Available tags/versions
- **Version history** (with `-v` flag)

### images pull

Pull images from Docker registries to local system.

**Usage:**
```bash
rfswift image pull -i IMAGE_NAME [-t TAG] [-V version]
```

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image reference to pull | Yes | `-i penthertz/rfswift_resolute:sdr_full` |
| `-t, --tag STRING` | Rename to target tag locally | No | `-t my_sdr:v1` |
| `-V, --version STRING` | Rename to wanted version | No | `-V 0.1.1` |

### images versions

List all available versions for RF Swift images.

**Usage:**
```bash
rfswift image versions [-f FILTER]
```

**Options:**

| Flag | Description | Example |
|------|-------------|---------|
| `-f, --filter STRING` | Filter by image name | `-f sdr_full` |

**Example:**
```bash
# List versions for all images
rfswift images versions

# List versions for a specific image
rfswift images versions -f wifi
```

**Example output:**
```
┌──────────────────────────────────────┬────────────────────┬──────────────┐
│ Image                                │ Version            │ Status       │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:wifi         │ latest, 0.1.1      │ Up to date   │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:sdr_full     │ latest, 0.1.1      │ Up to date   │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:sdr_light    │ latest, 0.1.1      │ Up to date   │
└──────────────────────────────────────┴────────────────────┴──────────────┘
```

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
│ wifi                 │ 2026-01-27 16:27   │ penthertz/rfswift_resolute:wifi        │ 7981.2 MB    │ latest, 0.1.1                                                │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
│ sdr_full             │ 2026-01-27 16:27   │ penthertz/rfswift_resolute:sdr_full    │ 14176.2 MB   │ latest, 0.1.1                                                │
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
│ penthertz/rfswift_resolute      │ sdr_light_0.1.1 │ cdf39442893e │ 2026-01-19T20:17:49+01:00 │ 13076.96 MB │ Up to date │ 0.1.1   │
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
docker search penthertz/rfswift_resolute

# Check if behind proxy/firewall
```

### Pull Fails

**Error:** `unable to retrieve auth token: invalid username/password`

The engine presents a stored `docker login` or `podman login` for Docker Hub that is no longer valid; RF Swift sends no credentials. The message names the credential file and the `logout` command that clears it.

**Error:** `Error pulling image`

**Solutions:**
```bash
# Check image name spelling
rfswift images remote -v  # Verify exact name and version

# Try with docker directly
docker pull penthertz/rfswift_resolute:sdr_full

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
