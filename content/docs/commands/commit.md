---
title: "rfswift container commit"
linkTitle: "container commit"
navGroup: "Containers"
level: reference
description: "Save a container's current state as a new image."
weight: 9
---

`rfswift container commit` saves a container's current state as a new image: every tool you installed and every file you changed inside it. Use it to keep a setup you spent time on, to take a snapshot before a risky change, or to share a customised environment.

```bash
rfswift container commit -c my_sdr_work -i my_sdr_backup
```

You can then create new containers from that image with `rfswift container create -i my_sdr_backup -n NAME`.

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift commit` still works and prints a notice. The flags are the same. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift container commit -c CONTAINER_NAME -i NEW_IMAGE_NAME
```

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container to commit | Yes | `-c my_container` |
| `-i, --image STRING` | Name for new image | Yes | `-i my_backup:v1` |

{{< callout type="info" >}}
**Container picker**: without `-c` in an interactive terminal, RF Swift shows a container picker. If you also leave out `-i`, it suggests an image name based on the container's current image (or `rfswift/committed:latest`).
{{< /callout >}}

## Examples

### Basic usage

#### Create backup image
```bash
rfswift container commit -c my_sdr_work -i my_sdr_backup
```

#### With version tag
```bash
rfswift container commit -c assessment -i assessment_backup:v1.0
```

#### Before removing container
```bash
# Save state first
rfswift container commit -c temp_container -i saved_state

# Safe to remove now
rfswift container rm -c temp_container

# Can recreate later
rfswift container create -i saved_state -n restored_container
```

### Everyday cases

#### Save configured environment
```bash
# You spent hours configuring tools
rfswift container shell -c sdr_work
# ... install additional tools, configure settings ...
exit

# Save all that work
rfswift container commit -c sdr_work -i sdr_configured:2024_01
```

#### Create project snapshot
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

#### Share custom environment with team
```bash
# Create customized environment
rfswift container commit -c my_setup -i team_sdr_environment:v1

# Export the image to a file you can share
rfswift image export image -i team_sdr_environment:v1 -o sdr_backup.tar.gz

# (or export the container itself)
rfswift image export container -c my_setup -o sdr_backup.tar.gz

# Team members import the file
rfswift image import image -i sdr_backup.tar.gz
```

#### Before major changes
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

#### Create versioned snapshots
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

## What gets committed

### Captured in image

What the new image contains:

| Content | Included? | Notes |
|---------|-----------|-------|
| Container filesystem changes | Yes | All modifications to files |
| Installed packages | Yes | APT, pip, npm packages |
| Configuration files | Yes | Modified configs in container |
| Created files | Yes | Scripts, data files, logs |
| Environment variables | Partial | Runtime variables are not kept |
| Running processes | No | Only filesystem, not RAM |
| Mounted volumes | No | Volume data not in image |
| Network configuration | Partial | Basic settings only |
| Port bindings | No | Set them again on the new container |

#### Example of what's saved
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
# Temporary /tmp files may not persist   # Depends

exit

rfswift container commit -c my_container -i my_configured_image
```

### Mounted volumes

**Mounted folders are not included.** Files in a folder you mounted from your computer (with `-b`) stay on your computer and are not copied into the image. To include them, copy them into the container's own filesystem before committing, or back them up separately:

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

## Troubleshooting

### Container not found

The error message is: `Error: No such container: container_name`

To fix it:
```bash
# List containers
rfswift container last
```

### Image name already exists

The error message is: `Error: Conflict: Tag already exists`

To fix it:
```bash
# Option 1: Use different tag
rfswift container commit -c container -i image:v2

# Option 2: Remove the old image first
rfswift image rm -i image:v1
rfswift container commit -c container -i image:v1
```

## Related commands

- [`container create`](/docs/commands/run/): create containers from a committed image
- [`image export`](/docs/commands/export/): another way to back up (a `.tar.gz` file)
- [`image import`](/docs/commands/import/): import exported containers and images
- [`image download`](/docs/commands/download/): save registry images to `.tar.gz`
- [`image local`](/docs/commands/images/): list and manage your images
- [`container rm`](/docs/commands/remove/): remove a container after committing it

{{< callout >}}
**Keep images small**: before committing, clean up inside the container (`apt-get clean`, old logs, caches). For a portable backup, use `image export` instead.
{{< /callout >}}

{{< callout type="info" >}}
**Commit, export or download?**
- `container commit` creates an image you reuse to create new containers.
- `image export` creates a compressed file to back up or move to another machine.
- `image download` saves a published image to a file for offline use.
{{< /callout >}}