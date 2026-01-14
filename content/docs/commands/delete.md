---
title: delete
weight: 13
prev: /docs/commands/images
next: /docs/commands/retag
---

# rfswift delete

Delete Docker images from the local system to free disk space.

## Synopsis

```bash
rfswift delete -i IMAGE_ID_OR_TAG
```

The `delete` command removes Docker images from your local system. This is useful for freeing disk space, removing old versions, or cleaning up after testing.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --image STRING` | Image ID or tag to delete | Yes | `-i penthertz/rfswift:old_version` |

---

## Examples

### Basic Usage

**Delete by tag:**
```bash
rfswift delete -i penthertz/rfswift:old_version
```

**Delete by image ID:**
```bash
rfswift delete -i a1b2c3d4e5f6
```

**Delete custom built image:**
```bash
rfswift delete -i my_custom_sdr:v1.0
```

### Real-World Scenarios

**Clean up old versions:**
```bash
# Check what you have
rfswift images local

# Delete old version
rfswift delete -i penthertz/rfswift_noble:tag

# Verify deletion
rfswift images local
```

**Remove test images:**
```bash
# After testing
rfswift delete -i test_image:experimental

# Remove multiple test images
rfswift delete -i test_build:v1
rfswift delete -i test_build:v2
rfswift delete -i test_build:v3
```

**Free disk space:**
```bash
# Check current usage
docker system df

# Delete large unused images
rfswift delete -i penthertz/rfswift:sdr_full_old

# Check space recovered
docker system df
```

**Remove failed builds:**
```bash
# Build failed, leaving dangling image
rfswift delete -i failed_build:latest

# Or delete by ID
rfswift delete -i a1b2c3d4e5f6
```

**Cleanup after upgrade:**
```bash
# After upgrading containers, remove old image
rfswift upgrade -c my_container -i new_image:v2

# Delete old image
rfswift delete -i old_image:v1
```

---

## What Gets Deleted

### Image Deletion Impact

When you delete an image:

| Item | Deleted? | Impact |
|------|----------|--------|
| Image layers | ✅ Yes | Removed from disk |
| Image metadata | ✅ Yes | Tags, labels removed |
| Containers using image | ❌ No | Continue running |
| Exported tar.gz files | ❌ No | Remain on disk |
| Custom files you added | ✅ Yes | Gone from image |

### Important Notes

**Images in use cannot be deleted:**
```bash
# This will fail if containers are using the image
rfswift delete -i penthertz/rfswift:sdr_full

# Error: image is being used by running container
```

**Solution: Stop/remove containers first:**
```bash
# Stop containers using the image
rfswift stop -c container_using_image

# Remove containers
rfswift remove -c container_using_image

# Now delete image
rfswift delete -i penthertz/rfswift:old_version
```

---

## Delete vs Remove

### Comparison

| Command | Target | What It Deletes |
|---------|--------|-----------------|
| `delete` | Images | Docker images |
| `remove` | Containers | Container instances |

---

## Troubleshooting

### Image In Use

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
rfswift delete -i image:tag
```

### Image Has Dependent Child Images

**Error:** `Error: image has dependent child images`

**Solutions:**
```bash
# Force delete with docker
docker rmi -f image:tag

# Or delete child images first
docker images --filter "since=image:tag" --format "{{.Repository}}:{{.Tag}}" | \
while read child; do
    rfswift delete -i "$child"
done

# Then delete parent
rfswift delete -i image:tag
```

### Image Not Found

**Error:** `Error: No such image: image:tag`

**Solutions:**
```bash
# Check exact image name
rfswift images local

# Check image ID
docker images

# Use correct format
rfswift delete -i penthertz/rfswift:sdr_full
# Or by ID
rfswift delete -i a1b2c3d4e5f6
```

### Permission Denied

**Error:** `Permission denied`

**Solutions:**
```bash
# Use sudo
sudo rfswift delete -i image:tag

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then retry
rfswift delete -i image:tag
```

### Tag Refers to Multiple Images

**Problem:** Same tag on different images

**Solution:**
```bash
# Use image ID instead of tag
docker images

# Delete by specific ID
rfswift delete -i a1b2c3d4e5f6
```

---

## Related Commands

- [`images`](/docs/commands/images) - List and manage images
- [`remove`](/docs/commands/remove) - Remove containers
- [`export`](/docs/commands/export) - Backup images before deletion
- [`build`](/docs/commands/build) - Build new images
- [`cleanup`](/docs/commands/cleanup) - Automated cleanup

---

{{< callout emoji="⚠️" >}}
**Permanent Deletion**: Deleting an image is permanent. If you might need it later, use `export image` to create a backup first. You can always `import` it back if needed.
{{< /callout >}}

{{< callout type="warning" >}}
**Containers First**: You cannot delete an image while containers are using it. Stop and remove containers first with `stop` and `remove` commands, then delete the image.
{{< /callout >}}

{{< callout type="info" >}}
**Disk Space Recovery**: Deleting large images can free significant disk space (1-4GB per image). Check with `docker system df` before and after to see space recovered!
{{< /callout >}}