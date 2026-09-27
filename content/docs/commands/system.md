---
title: "rfswift system"
linkTitle: "system"
navGroup: "System"
level: reference
description: "Housekeeping for RF Swift: doctor, cleanup, update, upgrade, log and report."
weight: 90
---

`rfswift system` groups the housekeeping commands for RF Swift itself: checking your computer, cleaning up, updating, recording sessions and writing reports. Every subcommand also works at the top level (`rfswift doctor`, `rfswift cleanup`, ...). The alias `rfswift admin` works too.

```bash
rfswift system doctor
```

## Synopsis

```bash
rfswift system doctor
rfswift system cleanup all|containers|images [--older-than 7d] [--dry-run] [--force] [...]
rfswift system update
rfswift system upgrade -c NAME [-i IMAGE] [-r DIRS]
rfswift system log start|stop|list|replay [...]
rfswift system report generate -c NAME [-f markdown|html|pdf] [-o FILE] [-t TITLE]
```

## Subcommands

| Subcommand | What it does | Page |
|------------|--------------|------|
| `doctor` | Checks your computer: the engines and their services, Docker access, host udev rules, the Nix engine (and its WSL 2 backend on Windows), the Nix jail, the Lima VM, images, X11 and xhost, the audio system and server, USB, the config file, kernel modules, and usbipd on Windows | [doctor](/docs/commands/doctor) |
| `cleanup` | Removes old or unused containers and images by age. A dry run shows what would go first | [cleanup](/docs/commands/cleanup) |
| `update` | Updates the RF Swift binary from the official releases. On a deb, rpm, pacman or Homebrew install, it tells you how to upgrade through your package manager instead of overwriting the packaged binary | [update](/docs/commands/update) |
| `upgrade` | Re-creates a container from a newer image and keeps the directories you list (same as `container upgrade`) | [upgrade](/docs/commands/upgrade) |
| `log` | Records and replays terminal sessions (asciinema, or `script` with `--use-script`) | [log](/docs/commands/log) |
| `report` | Builds an assessment report from a container and its workspace | [report](/docs/commands/report) |

## Examples

Check that your computer is ready:

```bash
rfswift system doctor
```

Preview which stopped containers older than 30 days would be removed:

```bash
rfswift system cleanup containers --stopped --older-than 30d --dry-run
```

Replay a recorded session at twice the speed:

```bash
rfswift system log replay -i session.cast -s 2.0
```

Write an HTML report for a container:

```bash
rfswift system report generate -c pentest_wifi -f html
```
