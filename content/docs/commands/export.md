---
title: "rfswift image export"
linkTitle: "image export"
navGroup: "Images"
level: reference
description: "Export containers or images to archives."
weight: 26
---

`rfswift image export` saves a container or an image as a compressed `tar.gz` archive. Use it to back up your work, or to move a lab to another machine.

The most common use backs up a container:

```bash
rfswift image export container -c my_sdr_container -o sdr_backup.tar.gz
```

Bring an archive back with [`rfswift image import`](/docs/commands/import).

{{< callout type="info" >}}
`rfswift image export` is the v4 spelling. The older `rfswift export` still works, takes the same flags and prints a notice with the new name. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

Export a container:

```bash
rfswift image export container -c CONTAINER_NAME -o OUTPUT_FILE.tar.gz
```

Export an image:

```bash
rfswift image export image -i IMAGE_NAME -o OUTPUT_FILE.tar.gz
```

## Options

### Export container

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-c, --container STRING` | The container to export | Yes | `-c my_container` |
| `-o, --output STRING` | The output file | No | `-o backup.tar.gz` |

### Export image

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --images STRINGS` | The image or images to export | Yes | `-i sdr_full` |
| `-o, --output STRING` | The output file | No | `-o backup.tar.gz` |

{{< callout type="info" title="Default file names" >}}
Without `-o`, the file name is generated for you:
- **Container export**: `{container_name}-{YYYYMMDD}.tar.gz`
- **Image export**: `{image_name}_converted.tar.gz`, with `/` and `:` replaced by `_`
{{< /callout >}}

## Examples

### Export containers

Export a container to a file:

```bash
rfswift image export container -c my_sdr_container -o sdr_backup.tar.gz
```

Include today's date in the file name:

```bash
rfswift image export container -c client_assessment \
  -o client_assessment_$(date +%Y%m%d).tar.gz
```

Save into a specific folder:

```bash
rfswift image export container -c important_work \
  -o ~/backups/containers/important_work_backup.tar.gz
```

Keep a final backup before you delete a container:

```bash
rfswift image export container -c old_container -o archives/old_container_final.tar.gz
rfswift container rm -c old_container
```

### Export images

Export an image to a file:

```bash
rfswift image export image -i sdr_full -o sdr_full_image.tar.gz
```

Export an image you built yourself:

```bash
rfswift image export image -i my_custom_sdr:v1.0 -o custom_sdr_v1.tar.gz
```

## What gets exported

### Container export

A container export captures the container's filesystem only. Docker settings such as port bindings and network configuration are not included.

| Content | Included? | Notes |
|---------|-----------|-------|
| Container filesystem | Yes | All files and changes |
| Installed packages | Yes | Everything in the container |
| Configuration files | Yes | Including the ones you changed |
| Running processes | No | Only the filesystem |
| Mounted volumes | No | Volume data is not included |
| Container metadata | Limited | Basic information only |
| Network configuration | No | Not preserved |
| Port bindings | No | Not preserved |

{{< callout type="warning" title="Mounted folders are not included" >}}
Folders mounted into the container, such as the workspace, stay on your computer and are not in the archive. Back them up separately with your usual file backup tools.
{{< /callout >}}

### Image export

| Content | Included? | Notes |
|---------|-----------|-------|
| Image layers | Yes | All filesystem layers |
| Image metadata | Yes | Tags, labels and so on |
| Build history | Yes | The layer history |
| Configuration | Yes | Default settings |

## File sizes

Archives are compressed as `tar.gz`, usually to about a third of the original size. These are rough examples; your sizes depend on the image and what you added to it. The official toolboxes are larger than these examples: `rfswift image remote` lists their sizes.

| Container type | Uncompressed | Compressed (tar.gz) | Ratio |
|---------------|--------------|---------------------|-------|
| Minimal (base only) | 500 MB | 150-200 MB | ~3:1 |
| SDR with tools | 2-3 GB | 700 MB - 1 GB | ~3:1 |
| Full SDR stack | 5-8 GB | 1.5-2.5 GB | ~3:1 |
| With large data | 20+ GB | 5-10 GB | ~2-3:1 |

### Make the archive smaller

Clean up inside the container before exporting. Open a shell in it:

```bash
rfswift container shell -c my_container
```

Inside the container, remove package caches, temporary files, logs and build tools you no longer need, then leave:

```bash
apt-get clean
rm -rf /var/lib/apt/lists/*
rm -rf /tmp/*
rm -rf /root/.cache/*
truncate -s 0 /var/log/*.log
apt-get remove -y build-essential
apt-get autoremove -y
exit
```

Then export as usual:

```bash
rfswift image export container -c my_container -o clean_backup.tar.gz
```

{{< callout type="tip" title="Keep regular backups" >}}
For work you cannot lose, export on a schedule and keep copies in more than one place: locally, on a NAS and off-site.
{{< /callout >}}

## Troubleshooting

### “No such container/image”

The name does not match a container or image on this computer. List them and check the exact name:

```bash
rfswift container last
rfswift image local
```

### “Permission denied” when writing the file

You cannot write to the output folder. Check its permissions, or create a folder you own:

```bash
ls -ld ~/backups/
mkdir -p ~/backups/containers
chmod 755 ~/backups/containers
```

To write to a system folder, use `sudo`:

```bash
sudo rfswift image export container -c container -o /backup/file.tar.gz
```

## Related commands

- [`import`](/docs/commands/import): import exported containers and images
- [`commit`](/docs/commands/commit): turn a container into an image
- [`download`](/docs/commands/download): save an image from the registry
- [`remove`](/docs/commands/remove): remove containers after exporting them
