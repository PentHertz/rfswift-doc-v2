---
title: import
weight: 8
prev: /docs/commands/export
next: /docs/commands/download
---

# rfswift import

Import containers or images from compressed archive files.

## Synopsis

```bash
# Import container filesystem as image
rfswift import container -i INPUT_FILE.tar.gz -n IMAGE_NAME

# Import Docker image(s)
rfswift import image -i INPUT_FILE.tar.gz
```

The `import` command restores containers and images from tar.gz archives created by the `export` or `download` commands, enabling backup restoration and system migration.

---

## Options

### Import Container

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --input STRING` | Input tar.gz file path | Yes | `-i backup.tar.gz` |
| `-n, --name STRING` | Name for the imported image | Yes | `-n myimage:tag` |

### Import Image

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-i, --input STRING` | Input tar.gz file path | Yes | `-i images.tar.gz` |

---

## Examples

### Import Containers

**Basic container import:**
```bash
rfswift import container -i sdr_backup.tar.gz -n sdr_restored:v1
```

**Import with descriptive tag:**
```bash
rfswift import container -i client_assessment_20250112.tar.gz \
  -n client_assessment_restored:2025_01_12
```

**Import and immediately run:**
```bash
# Import
rfswift import container -i backup.tar.gz -n my_container_restored

# Run new container from imported image
rfswift run -i my_container_restored -n my_container
```

### Import Images

**Basic image import:**
```bash
rfswift import image -i sdr_full_image.tar.gz
```

**Import multiple images:**
```bash
# This imports all images contained in the archive
rfswift import image -i rfswift_images_bundle.tar.gz
```

**Import downloaded RF Swift image:**
```bash
rfswift import image -i rfswift-sdr-full-20250112.tar.gz
```

### Real-World Scenarios

**Disaster recovery:**
```bash
# On backup system, import critical containers
rfswift import container -i /backup/dr/production_monitor_20250112.tar.gz \
  -n production_monitor_restored

# Start restored container
rfswift run -i production_monitor_restored -n production_monitor

# Verify functionality
rfswift exec -c production_monitor
```

**System migration:**
```bash
# On new system after receiving transfer
rfswift import container -i sdr_work_transfer.tar.gz \
  -n sdr_work_migrated:v1

# Run with same name as original
rfswift run -i sdr_work_migrated:v1 -n sdr_work \
  -b ~/captures:/root/captures

# Resume work
rfswift exec -c sdr_work
```

**Offline installation:**
```bash
# Import RF Swift images on air-gapped system
rfswift import image -i rfswift-images-offline-bundle.tar.gz

# List imported images
rfswift images local

# Run container
rfswift run -i penthertz/rfswift:sdr_full -n offline_work
```

**Team distribution:**
```bash
# Each team member imports training environment
rfswift import image -i sdr_course_2024_q1.tar.gz

# Run personal workspace
rfswift run -i sdr_course_2024_q1 -n student_workspace
```

**Project restoration:**
```bash
# Import archived project
rfswift import container -i archives/client_2024_01_container.tar.gz \
  -n client_project_archive:2024_01

# Run for review
rfswift run -i client_project_archive:2024_01 -n project_review \
  -b ~/pathto/review:/root/work
```

---

## What Gets Imported

### Container Import

When importing a container (from `export container`):

| Content | Imported? | Notes |
|---------|-----------|-------|
| Container filesystem | ✅ Yes | Complete filesystem state |
| Installed packages | ✅ Yes | All software |
| Configuration files | ✅ Yes | All configs |
| Created files | ✅ Yes | Data, scripts, logs |
| Layer history | ❌ No | Flattened to single layer |
| Container metadata | ⚠️ Limited | Basic info only |
| Mounted volumes | ❌ No | Not included in export |
| Running processes | ❌ No | Filesystem only |

### Image Import

When importing an image (from `export image` or `download`):

| Content | Imported? | Notes |
|---------|-----------|-------|
| Image layers | ✅ Yes | Complete layer history |
| Image metadata | ✅ Yes | Tags, labels, config |
| Build history | ✅ Yes | Layer creation history |
| Default configuration | ✅ Yes | CMD, ENV, WORKDIR, etc. |

**Important:** Volume data is never included in exports/imports. Back up volumes separately.

---

## Common Workflows

### Disaster Recovery Workflow

```bash
# === Scenario: Production system failed ===

# 1. Get backup from backup system
scp backup-server:/backups/production_20250112.tar.gz /tmp/

# 2. Import container
rfswift import container -i /tmp/production_20250112.tar.gz \
  -n production_restored:emergency

# 3. Restore volumes from separate backup
tar xzf /tmp/production_volumes_20250112.tar.gz -C ~/

# 4. Run restored container with volumes
rfswift run -i production_restored:emergency -n production \
  -b ~/production-data:/root/data \
  -t bridge \
  -w 8080:80/tcp

# 5. Verify service
curl http://localhost:8080/health
```

### Cross-Platform Migration

```bash
# === From Development Laptop to Production Server ===

# On development laptop (macOS/Windows)
rfswift export container -c sdr_dev -o sdr_dev_export.tar.gz

# Transfer to production server (Linux)
scp sdr_dev_export.tar.gz prod-server:/tmp/

# On production server
rfswift import container -i /tmp/sdr_dev_export.tar.gz \
  -n sdr_production:v1.0

# Run with production configuration
rfswift run -i sdr_production:v1.0 -n sdr_prod \
  -b /data/captures:/root/captures \
  -s /dev/rtlsdr0:/dev/rtlsdr0 \
  -g "c 189:* rwm" \
  -t bridge
```

---

## Troubleshooting

### Image Name Already Exists

**Error:** `Error: image name already in use`

**Solutions:**
```bash
# Option 1: Use different name
rfswift import container -i backup.tar.gz -n restored_alternative:v1

# Option 2: Remove existing image first
docker rmi existing_image:tag
rfswift import container -i backup.tar.gz -n existing_image:tag

# Option 3: Add version tag
rfswift import container -i backup.tar.gz -n existing_image:v2
```

### Permission Denied

**Error:** `Permission denied` reading archive

**Solutions:**
```bash
# Check file permissions
ls -l backup.tar.gz

# Read permission for user
chmod 644 backup.tar.gz

# Or use sudo
sudo rfswift import container -i backup.tar.gz -n restored:v1

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

---

## Related Commands

- [`export`](/docs/commands/export) - Create archives to import
- [`download`](/docs/commands/download) - Download images for offline import
- [`run`](/docs/commands/run) - Run containers from imported images
- [`images`](/docs/commands/images) - Manage imported images
- [`remove`](/docs/commands/remove) - Remove imported containers


---

{{< callout emoji="💾" >}}
**Import Strategy**: Always verify archive integrity before importing with `tar -tzf file.tar.gz`. For production systems, test imports in a non-production environment first!
{{< /callout >}}

{{< callout type="warning" >}}
**Volume Data**: Imported containers don't include volume data from the original. Back up and restore volumes separately, then remount when running the restored container.
{{< /callout >}}

{{< callout type="info" >}}
**Container vs Image Import**: Use `import container` for container exports (creates new flattened image), use `import image` for image exports (preserves layers and tags). Choose based on your source archive type!
{{< /callout >}}