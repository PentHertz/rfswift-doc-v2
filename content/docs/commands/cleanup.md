---
title: cleanup
weight: 20
prev: /docs/commands/last
next: /docs/commands/log
---

# rfswift cleanup

Automated cleanup of Docker resources to free disk space.

## Synopsis

```bash
rfswift cleanup [OPTIONS]
```

The `cleanup` command removes unused Docker resources including stopped containers, dangling images, unused volumes, and build cache. This helps maintain disk space and keep your Docker environment clean.

---

## Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--all` | Remove all unused resources | false | `--all` |
| `--containers` | Remove stopped containers only | false | `--containers` |
| `--images` | Remove unused images only | false | `--images` |
| `--volumes` | Remove unused volumes only | false | `--volumes` |
| `--force` | Skip confirmation prompts | false | `--force` |

---

## Examples

### Basic Usage

**Interactive cleanup (asks confirmation):**
```bash
rfswift cleanup
```

**Full cleanup without prompts:**
```bash
rfswift cleanup --all --force
```

**Remove stopped containers only:**
```bash
rfswift cleanup --containers
```

**Remove unused images only:**
```bash
rfswift cleanup --images
```

### Real-World Scenarios

**Weekly maintenance:**
```bash
# Clean up stopped containers and dangling images
rfswift cleanup --containers --images
```

**Before major operations:**
```bash
# Free space before pulling large images
rfswift cleanup --all

# Then pull new images
rfswift images pull -i penthertz/rfswift:sdr_full
```

**Emergency disk space recovery:**
```bash
# Aggressive cleanup when disk is full
rfswift cleanup --all --force

# Check space recovered
df -h
```

**Selective cleanup:**
```bash
# Keep running containers, remove images only
rfswift cleanup --images --force
```

**Post-development cleanup:**
```bash
# After testing, clean up test containers and images
rfswift cleanup --containers --images
```

---

## What Gets Cleaned Up

### Cleanup Targets

| Resource | Description | When Removed |
|----------|-------------|--------------|
| **Stopped containers** | Containers not running | Always safe |
| **Dangling images** | Untagged images (`<none>:<none>`) | Always safe |
| **Unused images** | Images not used by any container | Safe if not needed |
| **Build cache** | Docker build layer cache | Safe but slows rebuilds |
| **Networks** | Unused custom networks | Usually safe |

### Safety Levels

**Safe to remove:**
- ✅ Stopped containers (can recreate)
- ✅ Dangling images (no tag, no use)
- ✅ Build cache (recreated on next build)
- ✅ Unused networks

**Caution required:**
- ⚠️ Unused images (may need later)
- ⚠️ Unused volumes (may contain data)

**Never removed:**
- ❌ Running containers
- ❌ Images used by running containers
- ❌ Volumes attached to containers

---

## Cleanup Strategies

### Conservative Strategy

Remove only clearly unused resources:

```bash
# Stopped containers only
rfswift cleanup --containers --force
```

**Good for:**
- Production systems
- Careful disk management
- Preserving development environments

### Balanced Strategy

Remove most unused resources:

```bash
# Containers and images
rfswift cleanup --all
```

**Good for:**
- Regular maintenance
- Development systems
- General cleanup

### Aggressive Strategy

Remove everything unused:

```bash
# Full cleanup
rfswift cleanup --all --force
```

**Good for:**
- Emergency space recovery
- Fresh start scenarios
- CI/CD systems

---

## Troubleshooting

### Cleanup Not Freeing Space

**Problem:** Ran cleanup but disk usage still high

**Solutions:**
```bash
# Check what's using space
docker system df -v

# Try more aggressive cleanup
docker system prune -a -f --volumes

# Check for large log files
find /var/lib/docker -name "*.log" -size +100M

# Check other disk usage
du -sh /var/lib/docker/*

# May need to clean Docker logs
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### Permission Denied

**Problem:** Cleanup fails with permission errors

**Solutions:**
```bash
# Use sudo
sudo rfswift cleanup --all --force

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then retry
rfswift cleanup --all --force
```

### Important Container Removed

**Problem:** Accidentally removed needed container

**Solutions:**
```bash
# Check backups
ls ~/docker-backups/

# Restore from export
rfswift import container -i backup.tar.gz -n restored_container

# Recreate from image if no backup
rfswift run -i penthertz/rfswift:sdr_full -n recreated_container

# Lesson: Always export important containers before cleanup
rfswift export container -c important -o backup.tar.gz
```

---

## Related Commands

- [`last`](/docs/commands/last) - List containers before cleanup
- [`remove`](/docs/commands/remove) - Remove specific containers
- [`delete`](/docs/commands/delete) - Remove specific images
- [`images`](/docs/commands/images) - Check images before cleanup

---

{{< callout emoji="🧹" >}}
**Regular Maintenance**: Schedule regular cleanup with `rfswift cleanup --containers --images --force` to prevent disk space issues. Daily or weekly cleanup keeps your system healthy!
{{< /callout >}}

{{< callout type="warning" >}}
**Data Loss Risk**: The `--volumes` flag removes ALL unused volumes, which may contain important data. Always check volumes before removing them, and backup any important data!
{{< /callout >}}

{{< callout type="info" >}}
**Safe Defaults**: Without flags, `cleanup` removes stopped containers and dangling images only - the safest cleanup. Use `--all` for more aggressive cleanup when you need more space.
{{< /callout >}}