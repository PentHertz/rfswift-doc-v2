---
title: "rfswift image export"
linkTitle: "image export"
navGroup: "Images"
level: reference
description: "Export containers or images to archives."
weight: 26
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift image export`. The legacy form `rfswift export` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Export containers or images to compressed archive files for backup or transfer.

## Synopsis

```bash
# Export container
rfswift image export container -c CONTAINER_NAME -o OUTPUT_FILE.tar.gz

# Export image
rfswift image export image -i IMAGE_NAME -o OUTPUT_FILE.tar.gz
```

The `export` command creates compressed tar.gz archives of containers or images, preserving all data, configuration, and metadata. This is the recommended method for creating portable backups.

---

## Options

### Export container

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container to export | Yes | `-c my_container` |
| `-o, --output STRING` | Output filename | No | `-o backup.tar.gz` |

### Export image

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --images STRINGS` | Image(s) to export (can specify multiple) | Yes | `-i sdr_full` |
| `-o, --output STRING` | Output filename | No | `-o backup.tar.gz` |

{{< callout type="info" >}}
**Auto-generated filenames**: If `-o` is omitted, filenames are generated automatically:
- **Container export**: `{container_name}-{YYYYMMDD}.tar.gz`
- **Image export**: `{image_name}_converted.tar.gz` (with `/` and `:` replaced by `_`)
{{< /callout >}}

---

## Examples

### Export containers

**Basic container export:**
```bash
rfswift image export container -c my_sdr_container -o sdr_backup.tar.gz
```

**Export with descriptive filename:**
```bash
rfswift image export container -c client_assessment \
  -o client_assessment_$(date +%Y%m%d).tar.gz
```

**Export to specific directory:**
```bash
rfswift image export container -c important_work \
  -o ~/backups/containers/important_work_backup.tar.gz
```

**Export before removal:**
```bash
# Create backup before deleting
rfswift image export container -c old_container -o archives/old_container_final.tar.gz
rfswift container rm -c old_container
```

### Export images

**Basic image export:**
```bash
rfswift image export image -i sdr_full -o sdr_full_image.tar.gz
```

**Export custom image:**
```bash
rfswift image export image -i my_custom_sdr:v1.0 -o custom_sdr_v1.tar.gz
```

---

## What gets exported

### Container export

When exporting a container:

| Content | Included? | Notes |
|---------|-----------|-------|
| Container filesystem | Yes | All files and modifications |
| Installed packages | Yes | Everything in container |
| Configuration files | Yes | Modified configs |
| Running processes | No | Only filesystem |
| Mounted volumes | No | Volume data not included |
| Container metadata | ⚠️ Limited | Basic info only |
| Network config | No | Not preserved |
| Port bindings | No | Not preserved |

**Important:** Export captures filesystem only, not Docker metadata like port bindings or network configuration.

### Image export

When exporting an image:

| Content | Included? | Notes |
|---------|-----------|-------|
| Image layers | Yes | All filesystem layers |
| Image metadata | Yes | Tags, labels, etc. |
| Build history | Yes | Layer history |
| Configuration | Yes | Default settings |

---

## File size considerations

### Typical export sizes

| Container Type | Uncompressed | Compressed (tar.gz) | Compression Ratio |
|---------------|--------------|---------------------|-------------------|
| Minimal (base only) | 500 MB | 150-200 MB | ~3:1 |
| SDR with tools | 2-3 GB | 700 MB - 1 GB | ~3:1 |
| Full SDR stack | 5-8 GB | 1.5-2.5 GB | ~3:1 |
| With large data | 20+ GB | 5-10 GB | ~2-3:1 |

### Minimizing export size

**Before exporting, clean up:**
```bash
rfswift container shell -c my_container

# Remove package caches
apt-get clean
rm -rf /var/lib/apt/lists/*

# Remove temporary files
rm -rf /tmp/*
rm -rf /root/.cache/*

# Remove unnecessary logs
truncate -s 0 /var/log/*.log

# Remove development files if not needed
apt-get remove -y build-essential
apt-get autoremove -y

exit

# Now export will be smaller
rfswift image export container -c my_container -o clean_backup.tar.gz
```

---

## Troubleshooting

### Container/Image not found

**Error:** `Error: No such container/image: name`

**Solutions:**
```bash
# List containers
rfswift container last

# List images
rfswift image local
```

### Permission denied

**Error:** `Permission denied` when writing output file

**Solutions:**
```bash
# Check output directory permissions
ls -ld ~/backups/

# Create directory if needed
mkdir -p ~/backups/containers

# Set correct permissions
chmod 755 ~/backups/containers

# Or use sudo
sudo rfswift image export container -c container -o /backup/file.tar.gz
```

---

## Related commands

- [`import`](/docs/commands/import) - Import exported containers/images
- [`commit`](/docs/commands/commit) - Create images from containers
- [`download`](/docs/commands/download) - Download images from registry
- [`remove`](/docs/commands/remove) - Remove containers after export


---

{{< callout >}}
**Backup Strategy**: Export creates compressed, portable backups. For production environments, schedule regular automated exports to multiple locations (local, NAS, offsite).
{{< /callout >}}

{{< callout type="warning" >}}
**Volume Data Not Included**: Exports only include the container filesystem, not mounted volumes. Back up volume data separately using standard file backup tools.
{{< /callout >}}

{{< callout type="info" >}}
**Compression**: Export automatically compresses to tar.gz format, typically achieving 3:1 compression ratio. This saves significant storage space compared to uncompressed backups.
{{< /callout >}}