---
title: "rfswift container last"
linkTitle: "container last"
navGroup: "Containers"
level: reference
description: "List the containers RF Swift created, most recent first."
weight: 4
---

`rfswift container last` lists your RF Swift containers, running and stopped, with their name, status, image and creation time. Use it whenever you want to see which labs you have.

```bash
rfswift container last
```

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift last` still works and prints a notice. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Options

| Flag | Description |
|---|---|
| `-f, --filter` | Show only the containers whose image, name or ID contains this text (case-insensitive) |

## Examples

### Basic usage

#### List all containers
```bash
rfswift container last
```

#### Only some containers
```bash
rfswift container last -f sdr_full     # containers created from an sdr_full image
rfswift container last -f bluetooth_1  # by name (or part of the container ID)
```

#### Example output
```
CONTAINER ID   NAME           IMAGE                        STATUS      CREATED        PORTS
a1b2c3d4e5f6   sdr_work       penthertz/rfswift_resolute:sdr_full   Up 2 hours  3 hours ago    0.0.0.0:8080->80/tcp
b2c3d4e5f6g7   bluetooth_1    penthertz/rfswift_resolute:bluetooth  Up 1 day    2 days ago     
c3d4e5f6g7h8   analysis       penthertz/rfswift_resolute:sdr_full   Exited      1 week ago     
```

### Understanding output

| Column | Meaning |
|---|---|
| **CONTAINER ID** | Short container ID |
| **NAME** | Container name |
| **IMAGE** | Image the container was created from |
| **STATUS** | Running state (Up or Exited) |
| **CREATED** | When the container was created |
| **PORTS** | Port bindings, if any |

| Status | Meaning |
|---|---|
| `Up X minutes/hours/days` | The container is running |
| `Exited (0)` | The container stopped normally |
| `Exited (137)` | The container was killed |
| `Created` | The container was created but never started |
| `Restarting` | The container is restarting |

## Use cases

### Quick container check

```bash
# Check what containers exist
rfswift container last

# Find specific container
rfswift container last -f sdr_work

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

## Related commands

- [`container create`](/docs/commands/run/): create a new container
- [`container rm`](/docs/commands/remove/): remove a container
- [`container stop`](/docs/commands/stop/): stop a running container
- [`container shell`](/docs/commands/exec/): enter a container
- [`system cleanup`](/docs/commands/cleanup/): remove old containers and images by age

{{< callout type="info" >}}
**Filtering**: the list always includes running and stopped containers (like `docker ps -a`). `-f` narrows it by image, name or ID; to filter by state, pipe it through `grep` (`grep "Up"` for running containers, `grep "Exited"` for stopped ones).
{{< /callout >}}