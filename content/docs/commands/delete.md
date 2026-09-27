---
title: "rfswift image rm"
linkTitle: "image rm"
navGroup: "Images"
level: reference
description: "Delete a local image."
weight: 23
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift image rm`. The legacy form `rfswift delete` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Delete Docker images from the local system to free disk space.

## Synopsis

```bash
rfswift image rm -i IMAGE_ID_OR_TAG
```

The `delete` command removes Docker images from your local system. This is useful for freeing disk space, removing old versions, or cleaning up after testing.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image ID or tag to delete | Yes | `-i penthertz/rfswift_resolute:old_version` |

{{< callout type="info" >}}
**Interactive Picker**: When run without `-i` in an interactive terminal, RF Swift displays a scrollable image picker listing all local images. A confirmation prompt (`Delete image 'name'?`) is shown before deletion.
{{< /callout >}}

---

## Examples

### Basic usage

**Delete by tag:**
```bash
rfswift image rm -i penthertz/rfswift_resolute:old_version
```

**Delete by image ID:**
```bash
rfswift image rm -i a1b2c3d4e5f6
```

**Delete custom built image:**
```bash
rfswift image rm -i my_custom_sdr:v1.0
```

### Real-World scenarios

**Clean up old versions:**
```bash
# Check what you have
rfswift image local

# Delete old version
rfswift image rm -i penthertz/rfswift_resolute:tag

# Verify deletion
rfswift image local
```

**Remove test images:**
```bash
# After testing
rfswift image rm -i test_image:experimental

# Remove multiple test images
rfswift image rm -i test_build:v1
rfswift image rm -i test_build:v2
rfswift image rm -i test_build:v3
```

**Free disk space:**
```bash
# Check current usage
docker system df

# Delete large unused images
rfswift image rm -i penthertz/rfswift_resolute:sdr_full_old

# Check space recovered
docker system df
```

**Remove failed builds:**
```bash
# Build failed, leaving dangling image
rfswift image rm -i failed_build:latest

# Or delete by ID
rfswift image rm -i a1b2c3d4e5f6
```

**Cleanup after upgrade:**
```bash
# After upgrading containers, remove old image
rfswift container upgrade -c my_container -i new_image:v2

# Delete old image
rfswift image rm -i old_image:v1
```

---

## What gets deleted

### Image deletion impact

When you delete an image:

| Item | Deleted? | Impact |
|------|----------|--------|
| Image layers | Yes | Removed from disk |
| Image metadata | Yes | Tags, labels removed |
| Containers using image | No | Continue running |
| Exported tar.gz files | No | Remain on disk |
| Custom files you added | Yes | Gone from image |

### Important notes

**Images in use cannot be deleted:**
```bash
# This will fail if containers are using the image
rfswift image rm -i penthertz/rfswift_resolute:sdr_full

# Error: image is being used by running container
```

**Solution: Stop/remove containers first:**
```bash
# Stop containers using the image
rfswift container stop -c container_using_image

# Remove containers
rfswift container rm -c container_using_image

# Now delete image
rfswift image rm -i penthertz/rfswift_resolute:old_version
```

---

## Delete vs remove

### Comparison

| Command | Target | What It Deletes |
|---------|--------|-----------------|
| `delete` | Images | Docker images |
| `remove` | Containers | Container instances |

---

## Troubleshooting

### Image in use

**Error:** `Error: image is being used by running container`

**Solutions:**
```bash
# Find containers using the image
docker ps -a --filter ancestor="image:tag"

# Stop containers
docker ps -a --filter ancestor="image:tag" --format "{{.Names}}" | \
xargs -r docker stop

# Remove containers
docker ps -a --filter ancestor="image:tag" --format "{{.Names}}" | \
xargs -r docker rm

# Now delete image
rfswift image rm -i image:tag
```

### Image has dependent child images

**Error:** `Error: image has dependent child images`

**Solutions:**
```bash
# Force delete with docker
docker rmi -f image:tag

# Or delete child images first
docker images --filter "since=image:tag" --format "{{.Repository}}:{{.Tag}}" | \
while read child; do
    rfswift image rm -i "$child"
done

# Then delete parent
rfswift image rm -i image:tag
```

### Image not found

**Error:** `Error: No such image: image:tag`

**Solutions:**
```bash
# Check exact image name
rfswift image local

# Check image ID
docker images

# Use correct format
rfswift image rm -i penthertz/rfswift_resolute:sdr_full
# Or by ID
rfswift image rm -i a1b2c3d4e5f6
```

### Permission denied

**Error:** `Permission denied`

**Solutions:**
```bash
# Use sudo
sudo rfswift image rm -i image:tag

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then retry
rfswift image rm -i image:tag
```

### Tag refers to multiple images

**Problem:** Same tag on different images

**Solution:**
```bash
# Use image ID instead of tag
docker images

# Delete by specific ID
rfswift image rm -i a1b2c3d4e5f6
```

---

## Related commands

- [`images`](/docs/commands/images) - List and manage images
- [`remove`](/docs/commands/remove) - Remove containers
- [`export`](/docs/commands/export) - Backup images before deletion
- [`build`](/docs/commands/build) - Build new images
- [`cleanup`](/docs/commands/cleanup) - Automated cleanup

---

{{< callout >}}
**Permanent Deletion**: Deleting an image is permanent. If you might need it later, use `export image` to create a backup first. You can always `import` it back if needed.
{{< /callout >}}

{{< callout type="warning" >}}
**Containers First**: You cannot delete an image while containers are using it. Stop and remove containers first with `stop` and `remove` commands, then delete the image.
{{< /callout >}}

{{< callout type="info" >}}
**Disk Space Recovery**: Deleting large images can free significant disk space (1-4GB per image). Check with `docker system df` before and after to see space recovered!
{{< /callout >}}