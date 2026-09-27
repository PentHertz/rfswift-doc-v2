---
title: "rfswift cleanup"
linkTitle: "cleanup"
navGroup: "System"
level: reference
description: "Remove old containers and images to reclaim disk space."
weight: 92
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system cleanup`. The legacy form `rfswift cleanup` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Clean up containers and images to free disk space.

## Synopsis

```bash
rfswift cleanup <subcommand> [OPTIONS]
```

The `cleanup` command removes old or unused containers and images based on age filters. It provides three subcommands to target specific resource types or clean everything at once.

---

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `all` | Remove both old containers and images |
| `containers` | Remove old containers only |
| `images` | Remove old images only |

---

## Common options

These options are available on **all** subcommands (`all`, `containers`, `images`):

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--older-than` | Remove items older than duration | `""` | `--older-than 7d` |
| `--force` | Don't ask for confirmation | `false` | `--force` |
| `--dry-run` | Show what would be deleted without actually deleting | `false` | `--dry-run` |

The `--older-than` flag accepts durations such as `24h`, `7d`, `1m`, and `1y`.

## Subcommand-Specific options

### containers

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--stopped` | Only remove stopped containers | `false` | `--stopped` |

### images

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--dangling` | Only remove dangling (untagged) images | `false` | `--dangling` |
| `--prune-children` | Also remove dependent child images | `false` | `--prune-children` |

---

## Examples

### Basic usage

**Clean both containers and images:**
```bash
rfswift cleanup all
```

**Preview what would be deleted:**
```bash
rfswift cleanup all --dry-run
```

**Full cleanup without prompts:**
```bash
rfswift cleanup all --force
```

**Remove containers only:**
```bash
rfswift cleanup containers
```

**Remove images only:**
```bash
rfswift cleanup images
```

### Filtering by age

**Remove containers older than 7 days:**
```bash
rfswift cleanup containers --older-than 7d
```

**Remove images older than 1 month:**
```bash
rfswift cleanup images --older-than 1m
```

**Remove all resources older than 24 hours:**
```bash
rfswift cleanup all --older-than 24h --force
```

### Real-World scenarios

**Weekly maintenance:**
```bash
# Remove stopped containers older than a week
rfswift cleanup containers --stopped --older-than 7d --force

# Remove dangling images
rfswift cleanup images --dangling --force
```

**Before major operations:**
```bash
# Free space before pulling large images
rfswift cleanup all --force

# Then pull new images
rfswift image pull -i penthertz/rfswift_resolute:sdr_full
```

**Emergency disk space recovery:**
```bash
# Aggressive cleanup when disk is full
rfswift cleanup all --force

# Check space recovered
df -h
```

**Selective image cleanup:**
```bash
# Remove only dangling images and their children
rfswift cleanup images --dangling --prune-children --force
```

**Safe preview before cleanup:**
```bash
# See what would be removed without deleting anything
rfswift cleanup all --dry-run

# If the list looks right, run for real
rfswift cleanup all --force
```

---

## Cleanup strategies

### Conservative strategy

Remove only stopped containers and dangling images:

```bash
rfswift cleanup containers --stopped --force
rfswift cleanup images --dangling --force
```

**Good for:**
- Production systems
- Careful disk management
- Preserving development environments

### Balanced strategy

Remove older unused resources:

```bash
rfswift cleanup all --older-than 7d --force
```

**Good for:**
- Regular maintenance
- Development systems
- General cleanup

### Aggressive strategy

Remove everything unused:

```bash
rfswift cleanup all --force
```

**Good for:**
- Emergency space recovery
- Fresh start scenarios
- CI/CD systems

---

## Troubleshooting

### Cleanup not freeing space

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

### Permission denied

**Problem:** Cleanup fails with permission errors

**Solutions:**
```bash
# Use sudo
sudo rfswift cleanup all --force

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then retry
rfswift cleanup all --force
```

### Important container removed

**Problem:** Accidentally removed needed container

**Solutions:**
```bash
# Check backups
ls ~/docker-backups/

# Restore from export
rfswift image import container -i backup.tar.gz -n restored_container

# Recreate from image if no backup
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n recreated_container

# Lesson: Always export important containers before cleanup
rfswift image export container -c important -o backup.tar.gz
```

---

## Related commands

- [`last`](/docs/commands/last) - List containers before cleanup
- [`remove`](/docs/commands/remove) - Remove specific containers
- [`delete`](/docs/commands/delete) - Remove specific images
- [`images`](/docs/commands/images) - Check images before cleanup

---

{{< callout emoji="🧹" >}}
**Regular Maintenance**: Schedule regular cleanup with `rfswift cleanup all --older-than 7d --force` to prevent disk space issues. Daily or weekly cleanup keeps your system healthy!
{{< /callout >}}

{{< callout type="warning" >}}
**Use Dry Run First**: Before running a large cleanup, use `--dry-run` to preview what will be deleted. This helps avoid accidentally removing resources you still need.
{{< /callout >}}

{{< callout type="info" >}}
**Targeted Cleanup**: Use the `containers` and `images` subcommands with their specific flags (`--stopped`, `--dangling`, `--prune-children`) for precise control over what gets removed.
{{< /callout >}}