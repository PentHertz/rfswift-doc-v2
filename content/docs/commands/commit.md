---
title: "rfswift container commit"
linkTitle: "container commit"
navGroup: "Containers"
level: reference
description: "Save a container's current state as a new image."
weight: 9
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift container commit`. The legacy form `rfswift commit` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Save a container's current state as a new Docker image.

## Synopsis

```bash
rfswift container commit -c CONTAINER_NAME -i NEW_IMAGE_NAME
```

The `commit` command creates a new Docker image from a container's current state, capturing all changes made to the filesystem. This is useful for preserving work, creating backups, or sharing customized environments.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container to commit | Yes | `-c my_container` |
| `-i, --image STRING` | Name for new image | Yes | `-i my_backup:v1` |

{{< callout type="info" >}}
**Interactive Picker**: When run without `-c` in an interactive terminal, RF Swift displays a scrollable container picker. If `-i` is also omitted, the image name is auto-suggested based on the container's current image (fallback: `rfswift/committed:latest`).
{{< /callout >}}

---

## Examples

### Basic usage

**Create backup image:**
```bash
rfswift container commit -c my_sdr_work -i my_sdr_backup
```

**With version tag:**
```bash
rfswift container commit -c assessment -i assessment_backup:v1.0
```

**Before removing container:**
```bash
# Save state first
rfswift container commit -c temp_container -i saved_state

# Safe to remove now
rfswift container rm -c temp_container

# Can recreate later
rfswift container create -i saved_state -n restored_container
```

### Real-World scenarios

**Save configured environment:**
```bash
# Spent hours configuring tools
rfswift container shell -c sdr_work
# ... install additional tools, configure settings ...
exit

# Save all that work
rfswift container commit -c sdr_work -i sdr_configured:2024_01
```

**Create project snapshot:**
```bash
# End of assessment phase
rfswift container commit -c client_assessment -i client_assessment_phase1:final

# Continue to phase 2
rfswift container shell -c client_assessment
# ... more work ...
exit

# Save phase 2
rfswift container commit -c client_assessment -i client_assessment_phase2:final
```

**Share custom environment with team:**
```bash
# Create customized environment
rfswift container commit -c my_setup -i team_sdr_environment:v1

# Export container for sharing
rfswift image export container -c team_sdr_environment:v1 -o sdr_backup.tar.gz

# Export image for sharing
rfswift image export image -i imagetoexport -o sdr_backup.tar.gz

# Team members import
docker import 
```

**Before major changes:**
```bash
# Checkpoint before risky operation
rfswift container commit -c production_monitor -i production_monitor_backup:pre_upgrade

# Try upgrade
rfswift container shell -c production_monitor
# ... attempt upgrade ...
# ... something breaks ...
exit

# Restore from backup
rfswift container rm -c production_monitor
rfswift container create -i production_monitor_backup:pre_upgrade -n production_monitor
```

**Create versioned snapshots:**
```bash
# Daily snapshots during project
rfswift container commit -c research_container -i research_project:day_1
# ... work ...
rfswift container commit -c research_container -i research_project:day_2
# ... work ...
rfswift container commit -c research_container -i research_project:day_3

# Can return to any day's state
rfswift container create -i research_project:day_2 -n restore_day_2
```

---

## What gets committed

### Captured in image

When you commit a container, the new image includes:

| Content | Included? | Notes |
|---------|-----------|-------|
| Container filesystem changes | Yes | All modifications to files |
| Installed packages | Yes | APT, pip, npm packages |
| Configuration files | Yes | Modified configs in container |
| Created files | Yes | Scripts, data files, logs |
| Environment variables | ⚠️ Partial | Runtime vars not preserved |
| Running processes | No | Only filesystem, not RAM |
| Mounted volumes | No | Volume data not in image |
| Network configuration | ⚠️ Partial | Basic config only |
| Port bindings | No | Must reconfigure on new container |

**Example of what's saved:**
```bash
# Inside container
rfswift container shell -c my_container

# Changes that WILL be in committed image:
apt-get install -y new-tool              # Saved
pip3 install additional-package          # Saved
echo "alias ll='ls -la'" >> ~/.bashrc   # Saved
mkdir /root/my-scripts                   # Saved
cp tool.py /usr/local/bin/              # Saved

# Changes that WON'T be in committed image:
# Data in mounted volumes                # Not saved
# Running processes                       # Not saved
# Temporary /tmp files may not persist   # ⚠️ Depends

exit

rfswift container commit -c my_container -i my_configured_image
```

### Mounted volumes

**Important:** Mounted volume data is NOT included in committed images:

```bash
# Create container with volume
rfswift container create -i sdr_full -n capture_work \
  -b ~/captures:/root/captures

# Inside container
rfswift container shell -c capture_work
# Files in /root/captures are on host (~/captures)
# Files in /root/other are in container filesystem
exit

# Commit
rfswift container commit -c capture_work -i capture_backup

# New container from committed image
rfswift container create -i capture_backup -n restored
rfswift container shell -c restored
ls /root/captures  # Empty! (no volume mounted)
ls /root/other     # Present! (was in container filesystem)
exit

# Need to mount volume again
rfswift container rm -c restored
rfswift container create -i capture_backup -n restored -b ~/captures:/root/captures
```

---

## Troubleshooting

### Container not found

**Error:** `Error: No such container: container_name`

**Solutions:**
```bash
# List containers
rfswift container last
```

### Image name already exists

**Error:** `Error: Conflict: Tag already exists`

**Solutions:**
```bash
# Option 1: Use different tag
rfswift container commit -c container -i image:v2

# Option 2: Remove old image first
rfswift container rm -c container
rfswift container commit -c container -i image:v1
```

---

## Related commands

- [`run`](/docs/commands/run) - Create containers from committed images
- [`export`](/docs/commands/export) - Alternative backup method (creates tar.gz)
- [`import`](/docs/commands/import) - Import exported containers
- [`download`](/docs/commands/download) - Download images from registry to tar.gz
- [`images`](/docs/commands/images) - Manage committed images
- [`remove`](/docs/commands/remove) - Remove containers after committing


---

{{< callout >}}
**Pro Tip**: Before committing, clean up unnecessary files to keep image size small. Run `apt-get clean`, remove logs, and clear caches inside the container first! For portable backups, consider using `export` instead.
{{< /callout >}}

{{< callout type="warning" >}}
**Volume Data Not Included**: Data in mounted volumes (specified with `-b` flag) is NOT saved in committed images. Only the container's internal filesystem is captured. Use `export` for backups or copy volume data into container before committing.
{{< /callout >}}

{{< callout type="info" >}}
**Commit vs Export vs Download**: `commit` creates a Docker image for reuse, `export` creates a compressed portable backup, and `download` saves registry images offline. Choose based on your use case: development (commit), backup/transfer (export), or getting base images (download).
{{< /callout >}}