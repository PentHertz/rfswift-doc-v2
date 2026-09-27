---
title: "rfswift container last"
linkTitle: "container last"
navGroup: "Containers"
level: reference
description: "List the containers RF Swift created, most recent first."
weight: 4
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift container last`. The legacy form `rfswift last` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

List all RF Swift containers with their status and information.

## Synopsis

```bash
rfswift container last
```

The `last` command provides a quick overview of all RF Swift containers on the system, showing their names, status, images, creation time, and other details. This is your go-to command for checking what containers exist.

---

## Options

The `last` command takes no options and displays all containers.

---

## Examples

### Basic usage

**List all containers:**
```bash
rfswift container last
```

**Example output:**
```
CONTAINER ID   NAME           IMAGE                        STATUS      CREATED        PORTS
a1b2c3d4e5f6   sdr_work       penthertz/rfswift_resolute:sdr_full   Up 2 hours  3 hours ago    0.0.0.0:8080->80/tcp
b2c3d4e5f6g7   bluetooth_1    penthertz/rfswift_resolute:bluetooth  Up 1 day    2 days ago     
c3d4e5f6g7h8   analysis       penthertz/rfswift_resolute:sdr_full   Exited      1 week ago     
```

### Understanding output

**Output columns:**
- **CONTAINER ID**: Short container ID
- **NAME**: Container name
- **IMAGE**: Docker image used
- **STATUS**: Running state (Up/Exited)
- **CREATED**: When container was created
- **PORTS**: Port bindings (if any)

**Status values:**
- `Up X minutes/hours/days`: Container is running
- `Exited (0)`: Container stopped normally
- `Exited (137)`: Container was killed
- `Created`: Container created but never started
- `Restarting`: Container is restarting

---

## Use cases

### Quick container check

```bash
# Check what containers exist
rfswift container last

# Find specific container
rfswift container last | grep sdr_work

# Count total containers
rfswift container last | tail -n +2 | wc -l
```

### Clean up old containers

```bash
# List containers
rfswift container last

# Identify old unused ones
rfswift container last | grep "Exited"

# Remove specific container
rfswift container rm -c old_container
```

---

## Related commands

- [`run`](/docs/commands/run) - Create new containers
- [`remove`](/docs/commands/remove) - Remove containers
- [`stop`](/docs/commands/stop) - Stop running containers
- [`exec`](/docs/commands/exec) - Access containers
- [`cleanup`](/docs/commands/cleanup) - Automated cleanup

---

{{< callout emoji="📋" >}}
**Quick Overview**: `rfswift container last` is your first stop for seeing what containers exist. It shows all containers (running and stopped) with their essential information at a glance.
{{< /callout >}}

{{< callout type="warning" >}}
**No Filtering Options**: Unlike `docker ps`, the `last` command shows all containers without filtering options. Use `grep`, `awk`, or pipe to `docker ps` for advanced filtering.
{{< /callout >}}

{{< callout type="info" >}}
**All Containers Shown**: `rfswift container last` shows both running AND stopped containers (equivalent to `docker ps -a`). Use `grep "Up"` to see only running ones, or `grep "Exited"` for stopped ones.
{{< /callout >}}