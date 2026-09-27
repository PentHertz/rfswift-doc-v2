---
title: "rfswift cleanup"
linkTitle: "cleanup"
navGroup: "System"
level: reference
description: "Remove old containers and images to reclaim disk space."
weight: 92
---

`rfswift cleanup` frees disk space by removing old or unused containers and images. You can target containers, images or both, and filter by age. Always preview first with `--dry-run`: it shows what would be removed without deleting anything.

```bash
rfswift cleanup all --dry-run
```

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system cleanup`. The legacy form `rfswift cleanup` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift cleanup <subcommand> [OPTIONS]
```

## Subcommands

| Subcommand | What it removes |
|------------|-----------------|
| `all` | Old containers and old images |
| `containers` | Old containers only |
| `images` | Old images only |

## Options for every subcommand

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--older-than` | Only remove items older than this | `""` | `--older-than 7d` |
| `--force` | Don't ask for confirmation | `false` | `--force` |
| `--dry-run` | Show what would be removed, without removing it | `false` | `--dry-run` |

`--older-than` accepts durations such as `24h`, `7d`, `1m` and `1y`.

## Options for one subcommand

### containers

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--stopped` | Only remove stopped containers | `false` | `--stopped` |

### images

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--dangling` | Only remove dangling (untagged) images | `false` | `--dangling` |
| `--prune-children` | Also remove the child images that depend on them | `false` | `--prune-children` |

## Examples

### Basic use

Preview a full cleanup, then run it:

```bash
rfswift cleanup all --dry-run
rfswift cleanup all
```

Run it without the confirmation prompt:

```bash
rfswift cleanup all --force
```

Clean only containers, or only images:

```bash
rfswift cleanup containers
rfswift cleanup images
```

### Filter by age

Remove containers older than a week, images older than a month, or everything older than a day:

```bash
rfswift cleanup containers --older-than 7d
rfswift cleanup images --older-than 1m
rfswift cleanup all --older-than 24h --force
```

### Weekly maintenance

Remove stopped containers older than a week, then dangling images:

```bash
rfswift cleanup containers --stopped --older-than 7d --force
rfswift cleanup images --dangling --force
```

### Make room before a large download

```bash
rfswift cleanup all --force
rfswift image pull -i penthertz/rfswift_resolute:sdr_full
```

### The disk is full

Remove everything unused, then check how much space you got back:

```bash
rfswift cleanup all --force
df -h
```

### Only dangling images and their children

```bash
rfswift cleanup images --dangling --prune-children --force
```

## Choosing how much to remove

| Approach | Command | Good for |
|----------|---------|----------|
| **Careful**: only stopped containers and dangling images | `rfswift cleanup containers --stopped --force` then `rfswift cleanup images --dangling --force` | Production machines, careful disk management, keeping development labs |
| **Balanced**: older unused items | `rfswift cleanup all --older-than 7d --force` | Regular maintenance, development machines |
| **Everything unused** | `rfswift cleanup all --force` | Emergency space recovery, a fresh start, CI machines |

For regular maintenance, running `rfswift cleanup all --older-than 7d --force` daily or weekly keeps disk usage in check.

## Troubleshooting

### Cleanup doesn't free enough space

See what uses the space first:

```bash
docker system df -v
du -sh /var/lib/docker/*
find /var/lib/docker -name "*.log" -size +100M
```

If you need more space, these Docker commands go further. Both are **destructive**: `docker system prune -a --volumes` removes every unused image, container and volume, including ones RF Swift did not create, and truncating the logs erases them.

```bash
docker system prune -a -f --volumes
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### "Permission denied"

Give your user access to Docker (see [host docker-access](/docs/commands/host)), then run the cleanup again. By hand, add yourself to the `docker` group:

```bash
sudo usermod -aG docker $USER
newgrp docker
rfswift cleanup all --force
```

As a one-off, `sudo rfswift cleanup all --force` also works.

### A container you needed was removed

If you exported it before, import it again. Otherwise, re-create it from its image:

```bash
ls ~/docker-backups/
rfswift image import container -i backup.tar.gz -n restored_container
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n recreated_container
```

Next time, export important containers before cleaning up:

```bash
rfswift image export container -c important -o backup.tar.gz
```

## Related

- [container last](/docs/commands/last): see your containers before cleaning up
- [container rm](/docs/commands/remove): remove one container
- [image rm](/docs/commands/delete): remove one image
- [image local](/docs/commands/images): see your images before cleaning up
