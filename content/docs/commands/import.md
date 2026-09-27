---
title: "rfswift image import"
linkTitle: "image import"
navGroup: "Images"
level: reference
description: "Import containers or images from archives."
weight: 27
---

`rfswift image import` brings back an archive created with [`rfswift image export`](/docs/commands/export) or [`rfswift image download`](/docs/commands/download). Use it to restore a backup, move a lab to a new machine, or install images on an offline system.

The most common use restores an image saved on another machine:

```bash
rfswift image import image -i sdr_full_image.tar.gz
```

{{< callout type="info" >}}
`rfswift image import` is the v4 spelling. The older `rfswift import` still works, takes the same flags and prints a notice with the new name. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

Import a container archive as a new image:

```bash
rfswift image import container [-i INPUT_FILE.tar.gz] [-n IMAGE_NAME]
rfswift image import container [FILE]
```

Import one or more images:

```bash
rfswift image import image [-i INPUT_FILE.tar.gz]
rfswift image import image [FILE]
```

Both subcommands also accept the file path on its own, without `-i`:

```bash
rfswift image import container /path/to/backup.tar.gz
rfswift image import image /path/to/image.tar.gz
```

### Container or image: which one?

- Use `import container` for archives made with `export container`. It creates a new image with a single, flattened layer.
- Use `import image` for archives made with `export image` or `download`. It keeps the layers and tags.

## Options

### Import container

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --input STRING` | The archive to import | No* | `-i backup.tar.gz` |
| `-n, --name STRING` | The name of the new image | No* | `-n myimage:tag` |

### Import image

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --input STRING` | The archive to import | No* | `-i images.tar.gz` |

*\* In a terminal, RF Swift asks for anything you leave out.*

{{< callout type="info" title="Defaults" >}}
Without `-i` or a file path, RF Swift lists the `.tar.gz` files in the current folder, with their sizes in MB, so you can pick one.

For `import container`, if you leave out `-n`, the image is named after the file: `rfswift/{filename}:imported`.
{{< /callout >}}

## Examples

### Import containers

Import a container archive under a name of your choice:

```bash
rfswift image import container -i sdr_backup.tar.gz -n sdr_restored:v1
```

Use a descriptive tag, such as the backup date:

```bash
rfswift image import container -i client_assessment_20250112.tar.gz \
  -n client_assessment_restored:2025_01_12
```

Import, then create a container from the new image straight away:

```bash
rfswift image import container -i backup.tar.gz -n my_container_restored
rfswift container create -i my_container_restored -n my_container
```

### Import images

Import an image archive:

```bash
rfswift image import image -i sdr_full_image.tar.gz
```

If the archive holds several images, they are all imported:

```bash
rfswift image import image -i rfswift_images_bundle.tar.gz
```

Import an image saved with `rfswift image download`:

```bash
rfswift image import image -i rfswift-sdr-full-20250112.tar.gz
```

### Recover after a failure

On the backup system, import the container, create it again and check it works:

```bash
rfswift image import container -i /backup/dr/production_monitor_20250112.tar.gz \
  -n production_monitor_restored
rfswift container create -i production_monitor_restored -n production_monitor
rfswift container shell -c production_monitor
```

### Move to a new machine

On the new machine, import the archive, create the container under its old name with the same folders, and carry on:

```bash
rfswift image import container -i sdr_work_transfer.tar.gz \
  -n sdr_work_migrated:v1
rfswift container create -i sdr_work_migrated:v1 -n sdr_work \
  -b ~/captures:/root/captures
rfswift container shell -c sdr_work
```

### Install images offline

On an air-gapped system, import the images, check they are there, and create a container:

```bash
rfswift image import image -i rfswift-images-offline-bundle.tar.gz
rfswift image local
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n offline_work
```

### Share a training environment

Each team member imports the same image and creates their own workspace:

```bash
rfswift image import image -i sdr_course_2024_q1.tar.gz
rfswift container create -i sdr_course_2024_q1 -n student_workspace
```

### Reopen an archived project

Import the archived container and open it with a review folder mounted:

```bash
rfswift image import container -i archives/client_2024_01_container.tar.gz \
  -n client_project_archive:2024_01
rfswift container create -i client_project_archive:2024_01 -n project_review \
  -b ~/pathto/review:/root/work
```

## What gets imported

### Container import

From an `export container` archive:

| Content | Imported? | Notes |
|---------|-----------|-------|
| Container filesystem | Yes | The complete filesystem |
| Installed packages | Yes | All software |
| Configuration files | Yes | All configuration |
| Created files | Yes | Data, scripts, logs |
| Layer history | No | Flattened into one layer |
| Container metadata | Limited | Basic information only |
| Mounted volumes | No | Not in the export |
| Running processes | No | Filesystem only |

### Image import

From an `export image` or `download` archive:

| Content | Imported? | Notes |
|---------|-----------|-------|
| Image layers | Yes | The complete layer history |
| Image metadata | Yes | Tags, labels, configuration |
| Build history | Yes | How the layers were created |
| Default configuration | Yes | CMD, ENV, WORKDIR and so on |

{{< callout type="warning" title="Mounted folders are never included" >}}
Exports and imports never contain the data of mounted folders (volumes). Back them up and restore them separately, then mount them again when you create the restored container.
{{< /callout >}}

## Common workflows

### Recover a failed system

This example restores a container and its data from backups, then publishes a port and checks the service:

```bash
# === Scenario: Production system failed ===

# 1. Get backup from backup system
scp backup-server:/backups/production_20250112.tar.gz /tmp/

# 2. Import container
rfswift image import container -i /tmp/production_20250112.tar.gz \
  -n production_restored:emergency

# 3. Restore volumes from separate backup
tar xzf /tmp/production_volumes_20250112.tar.gz -C ~/

# 4. Run restored container with volumes
rfswift container create -i production_restored:emergency -n production \
  -b ~/production-data:/root/data \
  -t bridge \
  -w 8080:80/tcp

# 5. Verify service
curl http://localhost:8080/health
```

### Move from a laptop to a Linux server

Export on the laptop (macOS or Windows), copy the file, then import and create the container on the server with its devices and folders:

```bash
# On development laptop (macOS/Windows)
rfswift image export container -c sdr_dev -o sdr_dev_export.tar.gz

# Transfer to production server (Linux)
scp sdr_dev_export.tar.gz prod-server:/tmp/

# On production server
rfswift image import container -i /tmp/sdr_dev_export.tar.gz \
  -n sdr_production:v1.0

# Run with production configuration
rfswift container create -i sdr_production:v1.0 -n sdr_prod \
  -b /data/captures:/root/captures \
  -s /dev/device:/dev/device \
  -g "c 189:* rwm" \
  -t bridge
```

{{< callout type="tip" title="Check archives before importing" >}}
List an archive's contents with `tar -tzf file.tar.gz` to check it is intact. For production systems, try the import on a test machine first.
{{< /callout >}}

## Troubleshooting

### “image name already in use”

An image with that name already exists. Choose another name, add a version tag, or remove the existing image first:

```bash
rfswift image import container -i backup.tar.gz -n restored_alternative:v1
```

```bash
rfswift image import container -i backup.tar.gz -n existing_image:v2
```

```bash
docker rmi existing_image:tag
rfswift image import container -i backup.tar.gz -n existing_image:tag
```

### “Permission denied” when reading the archive

Check that you can read the file, and make it readable if needed:

```bash
ls -l backup.tar.gz
chmod 644 backup.tar.gz
```

If the problem is access to Docker itself, run `rfswift host docker-access` on Linux, add your user to the `docker` group, or use `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

```bash
sudo rfswift image import container -i backup.tar.gz -n restored:v1
```

## Related commands

- [`export`](/docs/commands/export): create the archives to import
- [`download`](/docs/commands/download): save images for an offline import
- [`run`](/docs/commands/run): create containers from imported images
- [`images`](/docs/commands/images): manage imported images
- [`remove`](/docs/commands/remove): remove imported containers
