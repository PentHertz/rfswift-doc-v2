---
title: export
weight: 7
prev: /docs/commands/commit
next: /docs/commands/import
---

# rfswift export

Export containers or images to compressed archive files for backup or transfer.

## Synopsis

```bash
# Export container
rfswift export container -c CONTAINER_NAME -o OUTPUT_FILE.tar.gz

# Export image
rfswift export image -i IMAGE_NAME -o OUTPUT_FILE.tar.gz
```

The `export` command creates compressed tar.gz archives of containers or images, preserving all data, configuration, and metadata. This is the recommended method for creating portable backups.

---

## Options

### Export Container

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container to export | Yes | `-c my_container` |
| `-o, --output STRING` | Output filename | Yes | `-o backup.tar.gz` |

### Export Image

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --images STRINGS` | Image(s) to export (can specify multiple) | Yes | `-i sdr_full` |
| `-o, --output STRING` | Output filename | Yes | `-o backup.tar.gz` |

---

## Examples

### Export Containers

**Basic container export:**
```bash
rfswift export container -c my_sdr_container -o sdr_backup.tar.gz
```

**Export with descriptive filename:**
```bash
rfswift export container -c client_assessment \
  -o client_assessment_$(date +%Y%m%d).tar.gz
```

**Export to specific directory:**
```bash
rfswift export container -c important_work \
  -o ~/backups/containers/important_work_backup.tar.gz
```

**Export before removal:**
```bash
# Create backup before deleting
rfswift export container -c old_container -o archives/old_container_final.tar.gz
rfswift remove -c old_container
```

### Export Images

**Basic image export:**
```bash
rfswift export image -i sdr_full -o sdr_full_image.tar.gz
```

**Export custom image:**
```bash
rfswift export image -i my_custom_sdr:v1.0 -o custom_sdr_v1.tar.gz
```

---

## What Gets Exported

### Container Export

When exporting a container:

| Content | Included? | Notes |
|---------|-----------|-------|
| Container filesystem | ✅ Yes | All files and modifications |
| Installed packages | ✅ Yes | Everything in container |
| Configuration files | ✅ Yes | Modified configs |
| Running processes | ❌ No | Only filesystem |
| Mounted volumes | ❌ No | Volume data not included |
| Container metadata | ⚠️ Limited | Basic info only |
| Network config | ❌ No | Not preserved |
| Port bindings | ❌ No | Not preserved |

**Important:** Export captures filesystem only, not Docker metadata like port bindings or network configuration.

### Image Export

When exporting an image:

| Content | Included? | Notes |
|---------|-----------|-------|
| Image layers | ✅ Yes | All filesystem layers |
| Image metadata | ✅ Yes | Tags, labels, etc. |
| Build history | ✅ Yes | Layer history |
| Configuration | ✅ Yes | Default settings |

---

## File Size Considerations

### Typical Export Sizes

| Container Type | Uncompressed | Compressed (tar.gz) | Compression Ratio |
|---------------|--------------|---------------------|-------------------|
| Minimal (base only) | 500 MB | 150-200 MB | ~3:1 |
| SDR with tools | 2-3 GB | 700 MB - 1 GB | ~3:1 |
| Full SDR stack | 5-8 GB | 1.5-2.5 GB | ~3:1 |
| With large data | 20+ GB | 5-10 GB | ~2-3:1 |

### Minimizing Export Size

**Before exporting, clean up:**
```bash
rfswift exec -c my_container

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
rfswift export container -c my_container -o clean_backup.tar.gz
```

---

## Troubleshooting

### Container/Image Not Found

**Error:** `Error: No such container/image: name`

**Solutions:**
```bash
# List containers
rfswift last

# List images
rfswift images local
```

### Permission Denied

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
sudo rfswift export container -c container -o /backup/file.tar.gz
```

---

## Related Commands

- [`import`](/docs/commands/import) - Import exported containers/images
- [`commit`](/docs/commands/commit) - Create images from containers
- [`download`](/docs/commands/download) - Download images from registry
- [`remove`](/docs/commands/remove) - Remove containers after export


---

{{< callout emoji="💾" >}}
**Backup Strategy**: Export creates compressed, portable backups. For production environments, schedule regular automated exports to multiple locations (local, NAS, offsite).
{{< /callout >}}

{{< callout type="warning" >}}
**Volume Data Not Included**: Exports only include the container filesystem, not mounted volumes. Back up volume data separately using standard file backup tools.
{{< /callout >}}

{{< callout type="info" >}}
**Compression**: Export automatically compresses to tar.gz format, typically achieving 3:1 compression ratio. This saves significant storage space compared to uncompressed backups.
{{< /callout >}}