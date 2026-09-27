---
title: "rfswift image tag"
linkTitle: "image tag"
navGroup: "Images"
level: reference
description: "Rename an image tag."
weight: 24
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift image tag`. The legacy form `rfswift retag` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Create new tags for existing Docker images or rename image tags.

## Synopsis

```bash
rfswift image tag -i IMAGE_REFERENCE -t NEW_TAG
```

The `retag` command creates a new tag for an existing Docker image. This is useful for organizing images, creating aliases, marking versions, or preparing images for distribution.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Source image reference | Yes | `-i penthertz/rfswift_resolute:sdr_full` |
| `-t, --tag STRING` | New tag name | Yes | `-t my_sdr:production` |

{{< callout type="info" >}}
**Interactive Picker**: When run without `-i` in an interactive terminal, RF Swift displays a scrollable image picker listing all local images with their tags.
{{< /callout >}}

---

## Examples

### Basic usage

**Create new tag for existing image:**
```bash
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t my_sdr:v1
```

**Create alias for convenience:**
```bash
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t sdr:latest
```

**Mark as production:**
```bash
rfswift image tag -i my_custom_image:test -t my_custom_image:production
```

**Version tagging:**
```bash
rfswift image tag -i my_image:latest -t my_image:v1.0.0
```

### Real-World scenarios

**Environment-based tagging:**
```bash
# Pull image
rfswift image pull -i penthertz/rfswift_resolute:sdr_full

# Create environment-specific tags
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t sdr_work:development
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t sdr_work:staging
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t sdr_work:production
```

**Version management:**
```bash
# Tag current version
rfswift image tag -i my_custom_sdr:latest -t my_custom_sdr:v1.2.0

# Keep latest tag updated
rfswift image tag -i my_custom_sdr:v1.2.0 -t my_custom_sdr:latest

# Create stable release tag
rfswift image tag -i my_custom_sdr:v1.2.0 -t my_custom_sdr:stable
```

---

## How retag works

### Tag creation process

When you retag an image:

1. **No duplication**: New tag points to same image layers
2. **No disk space used**: Both tags reference same underlying data
3. **Multiple tags allowed**: One image can have many tags
4. **Original tag remains**: Source tag is NOT removed

```mermaid
graph LR
    A[Image Layers] --> B[Tag: original:v1]
    A --> C[Tag: original:latest]
    A --> D[Tag: my_version:prod]
```

**Example:**
```bash
# Original image
docker images
# penthertz/rfswift_resolute:sdr_full  a1b2c3d4e5f6  2.5GB

# Create new tag
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t my_sdr:work

# Both tags exist, pointing to same image
docker images
# penthertz/rfswift_resolute:sdr_full  a1b2c3d4e5f6  2.5GB
# my_sdr:work                 a1b2c3d4e5f6  2.5GB
# Same image ID, no extra disk space
```

---

## Retag vs rename

### Key differences

| Feature | `retag` | `rename` |
|---------|---------|----------|
| **Target** | Images | Containers |
| **Operation** | Creates new tag | Changes container name |
| **Original** | Remains unchanged | Changed |
| **Multiple names** | Yes (many tags) | No (one name) |
| **Disk usage** | None | None |

---

## Tag naming conventions

### Recommended patterns

**Version-based:**
```bash
# Semantic versioning
my_image:v1.2.3
my_image:v1.2
my_image:v1

# Date-based
my_image:2025.01.12
my_image:2026_q1

# Git-based
my_image:commit_a1b2c3d
my_image:branch_develop
```

**Environment-based:**
```bash
my_image:development
my_image:dev
my_image:testing
my_image:test
my_image:staging
my_image:stage
my_image:production
my_image:prod
```

**Purpose-based:**
```bash
my_image:latest
my_image:stable
my_image:experimental
my_image:beta
my_image:release
```

**Combined:**
```bash
my_image:v1.2.3_production
my_image:v1.2_stable
my_image:2026.01_dev
my_image:v1_experimental
```

### Tag best practices

**Good tag names:**
```bash
# Clear and descriptive
sdr_analysis:v2.1.0_production
sdr_analysis:stable
sdr_analysis:2026_q1_release

# Environment markers
app:prod_v1.2
app:dev_latest
app:staging_candidate
```

**Avoid:**
```bash
# Ambiguous
image:1
image:a
image:test1

# Too generic
my_tag
temp
old
new
```

---

## Troubleshooting

### Source image not found

**Error:** `Error: No such image: source:tag`

**Solutions:**
```bash
# List available images
rfswift image local

# Check exact image name
docker images | grep image_name

# Pull if needed
rfswift image pull -i penthertz/rfswift_resolute:sdr_full

# Then retag
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t my_sdr:v1
```

### Invalid tag format

**Error:** `invalid reference format`

**Solutions:**
```bash
# Check tag format (no spaces, special chars)
# Good
rfswift image tag -i image:old -t image:new

# Bad
rfswift image tag -i image:old -t "image with spaces:new"
rfswift image tag -i image:old -t "image:new tag"

# Use underscores or hyphens
rfswift image tag -i image:old -t image_new:v1
rfswift image tag -i image:old -t image-new:v1
```

### Tag already exists

**Problem:** Tag already points to different image

**Solution:**
```bash
# Check existing tag
rfswift image local

# Remove old tag first
rfswift image rm old_image:new_tag

# Then create new tag
rfswift image tag -i source:tag -t new_tag:version

# Or: Tag overwrites automatically with same ID
rfswift image tag -i source:tag -t existing:tag
```

### Permission denied

**Error:** `Permission denied`

**Solutions:**
```bash
# Use sudo
sudo rfswift image tag -i source:tag -t new:tag

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then retry
rfswift image tag -i source:tag -t new:tag
```

### Cannot retag while container running

**Problem:** Want to retag image being used by container

**Solution:**
```bash
# This is actually OK - containers are unaffected
# Tags can be changed while containers are running

# Container continues using the image it was started with
# New tag just provides another reference to same image
rfswift image tag -i penthertz/rfswift_resolute:sdr_full -t my_sdr:v1
# Running containers using penthertz/rfswift_resolute:sdr_full are unaffected
```

---

## Related commands

- [`images`](/docs/commands/images) - List and manage images
- [`rename`](/docs/commands/rename) - Rename containers
- [`build`](/docs/commands/build) - Build images to tag
- [`delete`](/docs/commands/delete) - Remove old tags
- [`export`](/docs/commands/export) - Export tagged images

---

{{< callout emoji="🏷️" >}}
**No Disk Space Used**: Retagging creates a new reference to the same image data. Multiple tags for one image don't use extra disk space - they all point to the same layers!
{{< /callout >}}

{{< callout type="warning" >}}
**Original Tag Remains**: Unlike `rename` for containers, `retag` doesn't remove the original tag. Both the old and new tags will exist. Use `delete` to remove unwanted tags.
{{< /callout >}}

{{< callout type="info" >}}
**Version Management**: Use `retag` to create semantic version tags (v1.2.3), major version tags (v1), and special tags (latest, stable). This makes version management and rollback much easier!
{{< /callout >}}