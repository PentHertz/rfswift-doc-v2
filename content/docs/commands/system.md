---
title: "rfswift system"
linkTitle: "system"
navGroup: "System"
level: reference
description: "Housekeeping for RF Swift: doctor, cleanup, update, upgrade, log and report."
weight: 90
---

Housekeeping for RF Swift itself. Every subcommand is also available at the top level (`rfswift doctor`, `rfswift cleanup`, ...). Alias: `rfswift admin`.

## Synopsis

```bash
rfswift system doctor
rfswift system cleanup all|containers|images [--older-than 7d] [--dry-run] [--force] [...]
rfswift system update
rfswift system upgrade -c NAME [-i IMAGE] [-r DIRS]
rfswift system log start|stop|list|replay [...]
rfswift system report generate -c NAME [-f markdown|html|pdf] [-o FILE] [-t TITLE]
```

| Subcommand | Purpose | Page |
|------------|---------|------|
| `doctor` | Check the host: engines and their services, Docker access, host udev rules, Nix engine and its WSL 2 backend on Windows, the Nix jail, Lima VM, images, X11 and xhost, audio system and server, USB, config file, kernel modules, usbipd on Windows | [doctor](/docs/commands/doctor) |
| `cleanup` | Remove old or unused containers and images by age, with a dry run | [cleanup](/docs/commands/cleanup) |
| `update` | Update the RF Swift binary from the official releases. On a deb, rpm, pacman or Homebrew install it explains how to upgrade through the package instead of overwriting the packaged binary | [update](/docs/commands/update) |
| `upgrade` | Re-create a container from a newer image, preserving listed directories (same as `container upgrade`) | [upgrade](/docs/commands/upgrade) |
| `log` | Record and replay terminal sessions (asciinema, or `script` with `--use-script`) | [log](/docs/commands/log) |
| `report` | Assessment report from a container and its workspace | [report](/docs/commands/report) |

## Examples

```bash
rfswift system doctor
rfswift system cleanup containers --stopped --older-than 30d --dry-run
rfswift system log replay -i session.cast -s 2.0
rfswift system report generate -c pentest_wifi -f html
```
