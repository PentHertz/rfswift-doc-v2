---
title: "rfswift container rm"
linkTitle: "container rm"
navGroup: "Containers"
level: reference
description: "Remove a container. Its workspace folder on the host is kept."
weight: 7
---

`rfswift container rm` deletes a container for good and frees its disk space. Use it when a piece of work is finished, or before re-creating a container with different settings.

```bash
rfswift container rm -c my_old_container
```

Your workspace folder (`~/rfswift-workspace/<name>/`) and any folder you mounted from your computer are kept. Everything else stored inside the container is lost.

{{< callout type="warning" >}}
**This cannot be undone.** Files you saved inside the container, outside the workspace and mounted folders, are deleted with it. To keep the container's state, [commit it to an image](/docs/commands/commit/) first.
{{< /callout >}}

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift remove` and the short alias `rfswift rm` still work and print a notice. The flags are the same. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift container rm -c CONTAINER_NAME
```

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container name or ID to remove | Yes | `-c my_container` |

{{< callout type="info" >}}
**Container picker**: without `-c` in an interactive terminal, RF Swift shows a picker with every container's name, ID, image and state, then asks you to confirm before deleting.
{{< /callout >}}

## Examples

### Basic usage

#### Remove a stopped container
```bash
rfswift container rm -c my_old_container
```

#### Remove by container ID
```bash
rfswift container rm -c a1b2c3d4e5f6
```

#### Remove with short container ID
```bash
rfswift container rm -c a1b2c3
```

### Everyday cases

#### Clean up completed project
```bash
# Project complete, remove container
rfswift container rm -c client_assessment_2024_01
```

#### Free disk space
```bash
# Remove old test containers
rfswift container rm -c test_container_1
rfswift container rm -c test_container_2
rfswift container rm -c experiment_old
```

#### Remove failed containers
```bash
# Clean up containers that didn't work
rfswift container rm -c broken_config
rfswift container rm -c failed_setup
```

#### Weekly cleanup
```bash
# One container at a time; for age-based cleanup see rfswift system cleanup
rfswift container rm -c week_old_container
```

#### Before recreating container
```bash
# Need to recreate with different config
rfswift container rm -c sdr_container
rfswift container create -i sdr_full -n sdr_container -s /dev/bus/usb:/dev/bus/usb
```

## What gets deleted

### Data loss

When you remove a container:

| Data location | Kept? | Example |
|--------------|------------|---------|
| Container filesystem | **Deleted** | `/root/captures/data.bin` (inside the container) |
| Workspace folder | **Kept** | `~/rfswift-workspace/my_container/` on your computer |
| Mounted volumes | **Kept** | `~/captures:/root/captures` (a folder on your computer) |
| Container configuration | **Deleted** | Network settings, capabilities, cgroups |
| Container metadata | **Deleted** | Creation date, history, logs |
| Images | **Kept** | The image you created it from stays available |

#### Important distinction
```bash
# Create container with volume
rfswift container create -i sdr_full -n my_container \
  -b /pathto/captures:/root/captures

# Inside container:
# /root/captures - SAFE (mounted from host)
# /root/temp_work - AT RISK (inside container)

# After remove:
rfswift container rm -c my_container
# ~/captures on host: Still exists
# /root/temp_work: Gone forever
```

### Configuration loss

The container's settings go with it: port and network settings, device bindings and cgroup rules, capabilities and security settings, environment variables and startup commands.

#### To preserve configuration
```bash
# Option 1: Commit to image before removing
rfswift container commit -c my_container -i my_container_backup
rfswift container rm -c my_container

# Option 2: Document configuration
docker inspect my_container > container_config.json
rfswift container rm -c my_container
# Recreate later from documentation
```

## Safe removal practices

### Before removing: checklist

```bash
# 1. Verify container name
docker ps -a | grep container_name

# 2. Check for important data
rfswift container shell -c container_name
ls -la /root/
# Look for files NOT in mounted volumes
exit

# 3. Back up if needed
rfswift container commit -c container_name -i backup_image

# 4. Export if needed for transfer
rfswift image export container -c container_name -o container_backup.tar.gz

# 5. Remove
rfswift container rm -c container_name
```

## Common workflows

### Project lifecycle

```bash
# Week 1: Create project container
rfswift container create -i network -n project_alpha \
  -b ~/projects/alpha:/root/work

# Weeks 1-4: Use for project
rfswift container shell -c project_alpha

# Project complete: Back up and remove
rfswift container commit -c project_alpha -i project_alpha_final
rfswift container rm -c project_alpha

# Optional: Export final state
docker save project_alpha_final | gzip > project_alpha_archive.tar.gz
```

### Testing and development

```bash
# Create test container
rfswift container create -i sdr_full -n test_new_config

# Test configuration
rfswift container shell -c test_new_config
# ... test ...
exit

# If test fails, remove and try again
rfswift container rm -c test_new_config
rfswift container create -i sdr_full -n test_new_config # Try different config

# If test succeeds, remove test container
rfswift container rm -c test_new_config
# Create production container with working config
rfswift container create -i sdr_full -n production # Use tested config
```

## Troubleshooting

### Container not found

The error message is: `Error: No such container: container_name`

To fix it:
```bash
# List all containers
rfswift container last
docker ps -a

# Check for typos
docker ps -a | grep partial_name

# Container may already be removed
# No action needed if that's the case
```

### Container still running

RF Swift prints `Container is running, stopping first...`. This is normal: it stops a running container before removing it.

#### To avoid the warning
```bash
# Stop first
rfswift container stop -c my_container
rfswift container rm -c my_container
```

### Permission denied

The error message is: `Permission denied` or `Cannot connect to Docker daemon`

On Linux, your user can't talk to Docker yet. Give it access once (no logout needed), then try again:

```bash
rfswift host docker-access
rfswift container rm -c my_container
```

Or, by hand:

```bash
sudo usermod -aG docker $USER
newgrp docker
rfswift container rm -c my_container
```

### Container has dependent containers

The error message is: `Error: cannot remove container: container has dependent containers`

To fix it:
```bash
# Find dependent containers
docker ps -a --filter "ancestor=container_name"

# Remove dependent containers first
docker rm dependent_container

# Then remove parent
rfswift container rm -c parent_container

# Or force remove entire chain
docker rm -f $(docker ps -aq --filter "ancestor=container_name")
```

### Disk space not freed

You removed a container, but your free disk space barely changed. That is expected: the image (which takes most of the space), the volumes and the build cache are still there.

To fix it:
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

### Accidental removal

You removed the wrong container.

#### If you have backups
```bash
# From committed image
rfswift container create -i backup_image -n restored_container

# From exported tar
rfswift image import container -i backup.tar.gz
```

Without a backup, the container and the data inside it cannot be recovered. Your workspace and mounted folders are still there, and you can create a new container from the original image.

#### Prevention
```bash
# Check before removing
docker ps -a | grep container_name
# Read the output carefully before confirming

# Use tab completion to avoid typos
rfswift container rm -c my_cont<TAB>
```

## Best practices

### 1. Verify before removing

```bash
# Double-check container name
docker ps -a | grep container_name

# Verify it's the right one
docker inspect container_name | grep -E "Name|Image|Created"

# Then remove
rfswift container rm -c container_name
```

### 2. Commit important containers before removing

```bash
# Save state as image
rfswift container commit -c important_container -i important_backup

# Then safe to remove
rfswift container rm -c important_container

# Can recreate later
rfswift container create -i important_backup -n restored_container
```

### 3. Check for data outside mounted volumes

```bash
# Before removing, check for important files
rfswift container shell -c my_container
find /root -type f -size +10M  # Find large files
ls -la /root/  # Check for important data
exit

# Copy important files to host first
docker cp my_container:/root/important_file.dat ~/backup/

# Then safe to remove
rfswift container rm -c my_container
```

### 4. Document container configuration

```bash
# Save configuration before removing
docker inspect my_container > my_container_config.json

# Save as script for recreation
cat > recreate_container.sh << 'EOF'
rfswift container create -i sdr_full -n my_container \
  -s /dev/bus/usb:/dev/bus/usb \
  -b /pathto/captures:/root/captures \
  -g "c 189:* rwm"
EOF

# Now safe to remove
rfswift container rm -c my_container
```

### 5. Use batch removal carefully

```bash
# Bad: Remove all at once without checking
docker rm $(docker ps -aq)  # Dangerous!

# Good: List first, then decide
docker ps -a
# Review the list
docker rm container1 container2 container3  # Explicit list
```

### 6. Regular cleanup schedule

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

## Advanced usage

### Conditional removal

```bash
# Remove only if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^container_name$"; then
    rfswift container rm -c container_name
    echo "Container removed"
else
    echo "Container not found"
fi
```

### Remove with verification

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
    rfswift container rm -c "$CONTAINER"
    echo "Container removed"
else
    echo "Removal cancelled"
fi
```

### Bulk removal with pattern

```bash
# Remove all containers matching pattern
docker ps -a --format '{{.Names}}' | grep "^test_" | while read container; do
    echo "Removing $container..."
    rfswift container rm -c "$container"
done

# Or using docker directly
docker rm $(docker ps -aq --filter "name=test_*")
```

### Remove and archive

```bash
#!/bin/bash
# archive_and_remove.sh

CONTAINER=$1
ARCHIVE_DIR=~/container_archives

# Create archive directory
mkdir -p "$ARCHIVE_DIR"

# Export container
echo "Archiving $CONTAINER..."
rfswift image export container -c "$CONTAINER" -o "$ARCHIVE_DIR/${CONTAINER}_$(date +%Y%m%d).tar.gz"

# Verify export
if [ -f "$ARCHIVE_DIR/${CONTAINER}_$(date +%Y%m%d).tar.gz" ]; then
    echo "Archive created successfully"
    
    # Remove container
    rfswift container rm -c "$CONTAINER"
    echo "Container removed. Archive saved to $ARCHIVE_DIR"
else
    echo "Error: Archive creation failed. Container NOT removed."
    exit 1
fi
```

## Disk space management

### Understanding disk usage

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

### Freeing disk space

#### Conservative approach (remove only stopped containers)
```bash
# Remove specific stopped containers
rfswift container rm -c old_container_1
rfswift container rm -c old_container_2

# Remove all stopped containers (preview first with --dry-run)
rfswift system cleanup containers --stopped --dry-run
rfswift system cleanup containers --stopped
```

#### Moderate approach (remove old data)
```bash
# Remove containers unused for 7 days
docker container prune --filter "until=168h"

# Remove images unused for 7 days
docker image prune -a --filter "until=168h"
```

#### Aggressive approach (full cleanup)
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

#### Space recovery comparison
```bash
# Before cleanup
docker system df
# Containers: 5GB (3GB reclaimable)

# Remove 3 old containers
rfswift container rm -c old1
rfswift container rm -c old2
rfswift container rm -c old3

# After cleanup
docker system df
# Containers: 2GB (0GB reclaimable)
# Freed: 3GB
```

## Related commands

- [`container create`](/docs/commands/run/): create a new container
- [`container stop`](/docs/commands/stop/): stop a container before removing it
- [`container commit`](/docs/commands/commit/): save a container's state as an image first
- [`image export`](/docs/commands/export/): export a container to an archive first
- [`system cleanup`](/docs/commands/cleanup/): remove old containers and images by age
- [`container last`](/docs/commands/last/): list containers to find the ones to remove

{{< callout >}}
**A safety net for important containers**: commit first with `rfswift container commit -c container -i backup`, then run `rfswift container rm -c container`. You can re-create the container from `backup` at any time.
{{< /callout >}}

{{< callout type="info" >}}
**Disk space**: removing containers frees some space, but images take most of it. `docker image prune` frees much more after you remove containers.
{{< /callout >}}