---
title: last
weight: 19
prev: /docs/commands/ports
next: /docs/commands/cleanup
---

# rfswift last

List all RF Swift containers with their status and information.

## Synopsis

```bash
rfswift last
```

The `last` command provides a quick overview of all RF Swift containers on the system, showing their names, status, images, creation time, and other details. This is your go-to command for checking what containers exist.

---

## Options

The `last` command takes no options and displays all containers.

---

## Examples

### Basic Usage

**List all containers:**
```bash
rfswift last
```

**Example output:**
```
CONTAINER ID   NAME           IMAGE                        STATUS      CREATED        PORTS
a1b2c3d4e5f6   sdr_work       penthertz/rfswift_noble:sdr_full   Up 2 hours  3 hours ago    0.0.0.0:8080->80/tcp
b2c3d4e5f6g7   bluetooth_1    penthertz/rfswift_noble:bluetooth  Up 1 day    2 days ago     
c3d4e5f6g7h8   analysis       penthertz/rfswift_noble:sdr_full   Exited      1 week ago     
```

### Understanding Output

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

## Use Cases

### Quick Container Check

```bash
# Check what containers exist
rfswift last

# Find specific container
rfswift last | grep sdr_work

# Count total containers
rfswift last | tail -n +2 | wc -l
```

### Clean Up Old Containers

```bash
# List containers
rfswift last

# Identify old unused ones
rfswift last | grep "Exited"

# Remove specific container
rfswift remove -c old_container
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create new containers
- [`remove`](/docs/commands/remove) - Remove containers
- [`stop`](/docs/commands/stop) - Stop running containers
- [`exec`](/docs/commands/exec) - Access containers
- [`cleanup`](/docs/commands/cleanup) - Automated cleanup

---

{{< callout emoji="📋" >}}
**Quick Overview**: `rfswift last` is your first stop for seeing what containers exist. It shows all containers (running and stopped) with their essential information at a glance.
{{< /callout >}}

{{< callout type="warning" >}}
**No Filtering Options**: Unlike `docker ps`, the `last` command shows all containers without filtering options. Use `grep`, `awk`, or pipe to `docker ps` for advanced filtering.
{{< /callout >}}

{{< callout type="info" >}}
**All Containers Shown**: `rfswift last` shows both running AND stopped containers (equivalent to `docker ps -a`). Use `grep "Up"` to see only running ones, or `grep "Exited"` for stopped ones.
{{< /callout >}}