---
title: remove
weight: 4
prev: /docs/commands/stop
next: /docs/commands/rename
---

# rfswift remove

Permanently delete a container and free associated disk space.

## Synopsis

```bash
rfswift remove -c CONTAINER_NAME
```

The `remove` command permanently deletes a container from your system. This operation cannot be undone - all data stored within the container's filesystem will be lost.

{{< callout type="warning" >}}
**Destructive Operation**: This command permanently deletes the container. Data in mounted volumes is preserved, but any data stored inside the container filesystem is lost forever.
{{< /callout >}}

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container name or ID to remove | Yes | `-c my_container` |

---

## Examples

### Basic Usage

**Remove a stopped container:**
```bash
rfswift remove -c my_old_container
```

**Remove by container ID:**
```bash
rfswift remove -c a1b2c3d4e5f6
```

**Remove with short container ID:**
```bash
rfswift remove -c a1b2c3
```

### Real-World Scenarios

**Clean up completed project:**
```bash
# Project complete, remove container
rfswift remove -c client_assessment_2024_01
```

**Free disk space:**
```bash
# Remove old test containers
rfswift remove -c test_container_1
rfswift remove -c test_container_2
rfswift remove -c experiment_old
```

**Remove failed containers:**
```bash
# Clean up containers that didn't work
rfswift remove -c broken_config
rfswift remove -c failed_setup
```

**Weekly cleanup:**
```bash
# Remove all containers older than 7 days
# (See cleanup command for automated version)
rfswift remove -c week_old_container
```

**Before recreating container:**
```bash
# Need to recreate with different config
rfswift remove -c sdr_container
rfswift run -i sdr_full -n sdr_container -s /dev/bus/usb:/dev/bus/usb
```

---

## What Gets Deleted

### Data Loss

When you remove a container:

| Data Location | Preserved? | Example |
|--------------|------------|---------|
| Container filesystem | ❌ **DELETED** | `/root/captures/data.bin` (inside container) |
| Mounted volumes | ✅ **PRESERVED** | `~/captures:/root/captures` (host directory) |
| Container configuration | ❌ **DELETED** | Network settings, capabilities, cgroups |
| Container metadata | ❌ **DELETED** | Creation date, history, logs |
| Docker images | ✅ **PRESERVED** | Source images remain available |

**Important distinction:**
```bash
# Create container with volume
rfswift run -i sdr_full -n my_container \
  -b /pathto/captures:/root/captures

# Inside container:
# /root/captures - SAFE (mounted from host)
# /root/temp_work - AT RISK (inside container)

# After remove:
rfswift remove -c my_container
# ~/captures on host: Still exists ✅
# /root/temp_work: Gone forever ❌
```

### Configuration Loss

Removed containers lose:
- Port bindings and network configuration
- Device bindings and cgroups
- Capabilities and security settings
- Environment variables
- Startup commands

**To preserve configuration:**
```bash
# Option 1: Commit to image before removing
rfswift commit -c my_container -i my_container_backup
rfswift remove -c my_container

# Option 2: Document configuration
docker inspect my_container > container_config.json
rfswift remove -c my_container
# Recreate later from documentation
```

---

## Safe Removal Practices

### Before Removing: Checklist

```bash
# 1. Verify container name
docker ps -a | grep container_name

# 2. Check for important data
rfswift exec -c container_name
ls -la /root/
# Look for files NOT in mounted volumes
exit

# 3. Back up if needed
rfswift commit -c container_name -i backup_image

# 4. Export if needed for transfer
rfswift export -c container_name -o container_backup.tar.gz

# 5. Remove
rfswift remove -c container_name
```

---

## Common Workflows

### Project Lifecycle

```bash
# Week 1: Create project container
rfswift run -i pentest -n project_alpha \
  -b ~/projects/alpha:/root/work

# Weeks 1-4: Use for project
rfswift exec -c project_alpha

# Project complete: Back up and remove
rfswift commit -c project_alpha -i project_alpha_final
rfswift remove -c project_alpha

# Optional: Export final state
docker save project_alpha_final | gzip > project_alpha_archive.tar.gz
```

### Testing and Development

```bash
# Create test container
rfswift run -i sdr_full -n test_new_config

# Test configuration
rfswift exec -c test_new_config
# ... test ...
exit

# If test fails, remove and try again
rfswift remove -c test_new_config
rfswift run -i sdr_full -n test_new_config # Try different config

# If test succeeds, remove test container
rfswift remove -c test_new_config
# Create production container with working config
rfswift run -i sdr_full -n production # Use tested config
```

---

## Troubleshooting

### Container Not Found

**Error:** `Error: No such container: container_name`

**Solutions:**
```bash
# List all containers
rfswift last
docker ps -a

# Check for typos
docker ps -a | grep partial_name

# Container may already be removed
# No action needed if that's the case
```

### Container Still Running

**Warning:** `Container is running, stopping first...`

**This is normal:** RF Swift automatically stops running containers before removal.

**To avoid the warning:**
```bash
# Stop first
rfswift stop -c my_container
rfswift remove -c my_container
```

### Permission Denied

**Error:** `Permission denied` or `Cannot connect to Docker daemon`

**Solutions:**
```bash
# Use sudo on Linux
sudo rfswift remove -c my_container

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then try again
rfswift remove -c my_container
```

### Container Has Dependent Containers

**Error:** `Error: cannot remove container: container has dependent containers`

**Solutions:**
```bash
# Find dependent containers
docker ps -a --filter "ancestor=container_name"

# Remove dependent containers first
docker rm dependent_container

# Then remove parent
rfswift remove -c parent_container

# Or force remove entire chain
docker rm -f $(docker ps -aq --filter "ancestor=container_name")
```

### Disk Space Not Freed

**Problem:** Removed container but disk space unchanged

**Explanation:** Container removed, but:
- Image still exists (most disk space)
- Volumes still exist
- Build cache remains

**Solutions:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
# Warning: This removes ALL unused Docker data!

# Or targeted removal
docker rmi image_name
docker volume rm volume_name
```

### Accidental Removal

**Problem:** Removed wrong container

**Recovery options:**

**If you have backups:**
```bash
# From committed image
rfswift run -i backup_image -n restored_container

# From exported tar
rfswift import -i backup.tar.gz
```

**If no backups:**
- ❌ Container cannot be recovered
- ❌ Data inside container is lost
- ✅ Mounted volumes still exist
- ✅ Can recreate container from original image

**Prevention:**
```bash
# Always verify before removing
docker ps -a | grep container_name
# Read the output carefully before confirming

# Use tab completion to avoid typos
rfswift remove -c my_cont<TAB>
```

---

## Best Practices

### 1. Verify Before Removing

```bash
# Double-check container name
docker ps -a | grep container_name

# Verify it's the right one
docker inspect container_name | grep -E "Name|Image|Created"

# Then remove
rfswift remove -c container_name
```

### 2. Commit Important Containers Before Removing

```bash
# Save state as image
rfswift commit -c important_container -i important_backup

# Then safe to remove
rfswift remove -c important_container

# Can recreate later
rfswift run -i important_backup -n restored_container
```

### 3. Check for Data Outside Mounted Volumes

```bash
# Before removing, check for important files
rfswift exec -c my_container
find /root -type f -size +10M  # Find large files
ls -la /root/  # Check for important data
exit

# Copy important files to host first
docker cp my_container:/root/important_file.dat ~/backup/

# Then safe to remove
rfswift remove -c my_container
```

### 4. Document Container Configuration

```bash
# Save configuration before removing
docker inspect my_container > my_container_config.json

# Save as script for recreation
cat > recreate_container.sh << 'EOF'
rfswift run -i sdr_full -n my_container \
  -s /dev/bus/usb:/dev/bus/usb \
  -b /pathto/captures:/root/captures \
  -g "c 189:* rwm"
EOF

# Now safe to remove
rfswift remove -c my_container
```

### 5. Use Batch Removal Carefully

```bash
# Bad: Remove all at once without checking
docker rm $(docker ps -aq)  # Dangerous!

# Good: List first, then decide
docker ps -a
# Review the list
docker rm container1 container2 container3  # Explicit list
```

### 6. Regular Cleanup Schedule

```bash
# Weekly cleanup script
#!/bin/bash
# cleanup_old_containers.sh

# Remove containers older than 30 days
docker container prune -f --filter "until=720h"

# Remove unused images
docker image prune -f --filter "until=720h"

echo "Cleanup complete. Disk space recovered:"
docker system df
```

Add to crontab:
```bash
# Run every Sunday at 2 AM
0 2 * * 0 /path/to/cleanup_old_containers.sh
```

---

## Advanced Usage

### Conditional Removal

```bash
# Remove only if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^container_name$"; then
    rfswift remove -c container_name
    echo "Container removed"
else
    echo "Container not found"
fi
```

### Remove with Verification

```bash
#!/bin/bash
# safe_remove.sh

CONTAINER=$1

# Verify container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "Error: Container '$CONTAINER' not found"
    exit 1
fi

# Show container info
echo "Container details:"
docker inspect "$CONTAINER" --format='Name: {{.Name}}
Image: {{.Config.Image}}
Created: {{.Created}}
Status: {{.State.Status}}'

# Confirm removal
read -p "Remove this container? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    rfswift remove -c "$CONTAINER"
    echo "Container removed"
else
    echo "Removal cancelled"
fi
```

### Bulk Removal with Pattern

```bash
# Remove all containers matching pattern
docker ps -a --format '{{.Names}}' | grep "^test_" | while read container; do
    echo "Removing $container..."
    rfswift remove -c "$container"
done

# Or using docker directly
docker rm $(docker ps -aq --filter "name=test_*")
```

### Remove and Archive

```bash
#!/bin/bash
# archive_and_remove.sh

CONTAINER=$1
ARCHIVE_DIR=~/container_archives

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Export container
echo "Archiving $CONTAINER..."
rfswift export -c "$CONTAINER" -o "$ARCHIVE_DIR/${CONTAINER}_$(date +%Y%m%d).tar.gz"

# Verify export
if [ -f "$ARCHIVE_DIR/${CONTAINER}_$(date +%Y%m%d).tar.gz" ]; then
    echo "Archive created successfully"
    
    # Remove container
    rfswift remove -c "$CONTAINER"
    echo "Container removed. Archive saved to $ARCHIVE_DIR"
else
    echo "Error: Archive creation failed. Container NOT removed."
    exit 1
fi
```

---

## Disk Space Management

### Understanding Disk Usage

```bash
# Check Docker disk usage
docker system df

# Output shows:
# TYPE            TOTAL    ACTIVE   SIZE      RECLAIMABLE
# Images          10       5        5.2GB     2.1GB (40%)
# Containers      8        2        1.5GB     1.2GB (80%)
# Local Volumes   3        1        500MB     300MB (60%)
# Build Cache     15       0        2.1GB     2.1GB (100%)
```

### Freeing Disk Space

**Conservative approach (remove only stopped containers):**
```bash
# Remove specific stopped containers
rfswift remove -c old_container_1
rfswift remove -c old_container_2

# Remove all stopped containers
docker cleanup [other options] # check that command before ;)
```

**Moderate approach (remove old data):**
```bash
# Remove containers unused for 7 days
docker container prune --filter "until=168h"

# Remove images unused for 7 days
docker image prune -a --filter "until=168h"
```

**Aggressive approach (full cleanup):**
```bash
# WARNING: This removes ALL unused Docker data!
docker system prune -a --volumes

# This removes:
# - Stopped containers
# - Unused images
# - Unused networks
# - Unused volumes
# - Build cache
```

**Space recovery comparison:**
```bash
# Before cleanup
docker system df
# Containers: 5GB (3GB reclaimable)

# Remove 3 old containers
rfswift remove -c old1
rfswift remove -c old2
rfswift remove -c old3

# After cleanup
docker system df
# Containers: 2GB (0GB reclaimable)
# Freed: 3GB
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create new containers
- [`stop`](/docs/commands/stop) - Stop containers before removing
- [`commit`](/docs/commands/commit) - Save container state before removing
- [`export`](/docs/commands/export) - Export container before removing
- [`cleanup`](/docs/commands/cleanup) - Automated container cleanup
- [`last`](/docs/commands/last) - List containers to identify removal candidates


---

{{< callout emoji="⚠️" type="warning" >}}
**Cannot Be Undone**: Container removal is permanent. All data inside the container filesystem is lost forever. Only mounted volumes are preserved. Always verify you're removing the correct container!
{{< /callout >}}

{{< callout emoji="💡" >}}
**Before Removing Important Containers**: Always commit to an image first: `rfswift commit -c container -i backup` then `rfswift remove -c container`. This gives you a safety net!
{{< /callout >}}

{{< callout type="info" >}}
**Disk Space Tip**: Removing containers frees some space, but most disk usage is from images. Use `docker image prune` to free significant disk space after removing containers.
{{< /callout >}}