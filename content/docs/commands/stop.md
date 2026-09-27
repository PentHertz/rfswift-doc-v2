---
title: "rfswift container stop"
linkTitle: "container stop"
navGroup: "Containers"
level: reference
description: "Stop a running container."
weight: 6
---

`rfswift container stop` stops a running container without deleting it. Its files and settings are kept; only the programs running inside stop. Use it to free memory and CPU when you are done for the day.

```bash
rfswift container stop -c my_sdr_container
```

To start it again, enter it with [`rfswift container shell`](/docs/commands/exec/): a stopped container is started for you.

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift stop` and the short alias `rfswift halt` still work and print a notice. The flags are the same. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift container stop -c CONTAINER_NAME
```

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container name or ID to stop | Yes | `-c my_container` |

{{< callout type="info" >}}
**Container picker**: without `-c` in an interactive terminal, RF Swift shows a picker with only the **running** containers (name, ID, image and state).
{{< /callout >}}

## Examples

### Basic usage

#### Stop a specific container
```bash
rfswift container stop -c my_sdr_container
```

#### Stop by container ID
```bash
rfswift container stop -c a1b2c3d4e5f6
```

#### Stop with short container ID
```bash
rfswift container stop -c a1b2c3
```

### Everyday cases

#### End of work day
```bash
# Stop assessment container for the day
rfswift container stop -c client_assessment

# Resume tomorrow
rfswift container shell -c client_assessment
```

#### Free up resources
```bash
# Stop idle containers to free memory
rfswift container stop -c sdr_capture
rfswift container stop -c wifi_analysis
rfswift container stop -c bluetooth_scanner
```

#### Before system maintenance

To stop every running RF Swift container at once, for example before a system update:

```bash
# Stop all RF Swift containers before a system update
for container in $(docker ps -q --filter "ancestor=penthertz/rfswift_resolute"); do
    rfswift container stop -c $container
done
```

#### Take a break
```bash
rfswift container stop -c long_running_capture     # stop it
rfswift container shell -c long_running_capture    # pick up again later
```

## What happens when you stop a container

### Data persistence

What is **kept** when a container stops:
- every file inside the container, and your workspace and mounted folders;
- its settings: bindings, capabilities, port and network settings.

What is **lost**:
- the programs running inside: they are terminated;
- whatever was only in memory: the container is not hibernated.

#### Example
```bash
# Create container with captures
rfswift container create -i sdr_full -n capture_session -b ~/captures:/root/captures

# Inside container: Start long capture
rfswift container shell -c capture_session
rtl_sdr -f 100M -s 2.4M capture.dat &
exit

# Stop container
rfswift container stop -c capture_session
# Process terminates, but files in ~/captures persist

# Resume later
rfswift container shell -c capture_session
ls /root/captures  # Files still there
```

### Process handling

The container shuts down gracefully:
1. Docker sends SIGTERM to every process.
2. The processes get 10 seconds to clean up.
3. Any process still running then gets SIGKILL.
4. The container stops.

Keep this in mind for long captures (data still being written may be lost), databases (let them finish writing) and network services (open connections are dropped).

### Container state after stop

```bash
# Check container status
docker ps -a | grep my_container

# Output shows:
# STATUS: Exited (0) 2 minutes ago
```

A stopped container still exists: you can start it again, commit it to an image or remove it. It uses no CPU and no memory, but it still takes disk space.

### Stop vs exit

| Operation | `container stop` | `exit` (from the shell) |
|-----------|--------|---------------------|
| Run from | Your computer | Inside the container |
| Stops the container | Always | Only if nothing else is running inside |
| Graceful shutdown | Yes | Depends |
| Use it when | You are done with the container for now | You are done with this shell |

#### Workflow comparison
```bash
# Using exit (from inside container)
rfswift container shell -c my_container
# ... work ...
exit
# Container may still be running if background processes exist

# Using stop (from host)
rfswift container stop -c my_container
# Container definitely stops, all processes terminate
```

## Common workflows

### Daily work cycle

```bash
# Monday: Create container
rfswift container create -i network -n weekly_work -b ~/work:/root/work

# Monday-Friday: Use throughout week
rfswift container shell -c weekly_work
# ... work ...
exit

# Each evening: Stop to free resources
rfswift container stop -c weekly_work

# Each morning: Resume
rfswift container shell -c weekly_work  # Auto-starts

# Friday: Clean up when done
rfswift container rm -c weekly_work
```

### Resource management

```bash
# List running containers
docker ps

# Stop idle containers
rfswift container stop -c sdr_test1
rfswift container stop -c old_assessment
rfswift container stop -c experiment_container
```

### Container lifecycle management

```bash
# Week 1: Create and use
rfswift container create -i sdr_full -n project_alpha

# Week 1-2: Use daily
rfswift container shell -c project_alpha

# Weekend: Stop to save resources
rfswift container stop -c project_alpha

# Week 3: Resume
rfswift container shell -c project_alpha

# Project complete: Remove if not needed anymore
rfswift container rm -c project_alpha
```

### Batch container management

```bash
# Stop multiple related containers
CONTAINERS="capture1 capture2 capture3"
for container in $CONTAINERS; do
    echo "Stopping $container..."
    rfswift container stop -c $container
done

# Or using docker directly
docker stop capture1 capture2 capture3
```

## Troubleshooting

### Container already stopped

You try to stop a container that is already stopped.

```bash
rfswift container stop -c my_container
# Error: Container is not running
```

To fix it:
```bash
# Check if running
docker ps | grep my_container

# If not in output, it's already stopped
docker ps -a | grep my_container

# No action needed
```

### Container not found

The error message is: `Error: No such container: container_name`

To fix it:
```bash
# List all containers
rfswift container last

# Container may have been removed
# Need to create new one
rfswift container create -i image -n container_name
```

### Container won't stop

The container doesn't stop after a reasonable time.

To fix it:
```bash
# Wait longer (some containers need cleanup time)
rfswift container stop -c my_container
# Wait 30-60 seconds

# Force stop with Docker
docker kill my_container         # Immediate force stop

# Check what's preventing shutdown
docker logs my_container
```

### Multiple containers with similar names

The name you gave matches more than one container.

To fix it:
```bash
# Use full name
rfswift container stop -c full_container_name

# Use container ID
docker ps  # Get ID
rfswift container stop -c a1b2c3d4e5f6

# List to identify
rfswift container last
```

### Permission denied

You can't stop the container because your user can't talk to Docker yet (Linux).

To fix it, give your user access once (no logout needed), then try again:
```bash
rfswift host docker-access
rfswift container stop -c my_container
```

Or, by hand:
```bash
sudo usermod -aG docker $USER
newgrp docker
rfswift container stop -c my_container
```

### Data loss concerns

You are worried about losing data when you stop a container.

#### Verification
```bash
# Check mounted volumes
docker inspect my_container | grep -A 10 Mounts

# Data in mounted volumes is safe
# Data in container filesystem is preserved when stopped
# Only running processes and RAM contents are lost

# To be extra safe, commit before stopping
rfswift container commit -c my_container -i backup_image
rfswift container stop -c my_container
```

## Related commands

- [`container create`](/docs/commands/run/): create a new container
- [`container shell`](/docs/commands/exec/): enter a container (starts it if stopped)
- [`container rm`](/docs/commands/remove/): delete a container for good
- [`container last`](/docs/commands/last/): list recent containers with their status
- [`container commit`](/docs/commands/commit/): save a container's state as an image

{{< callout type="warning" >}}
**Running captures are stopped too.** Any capture or long-running program inside the container is terminated when it stops. Let it finish, or save its output, before you stop the container.
{{< /callout >}}

{{< callout >}}
**Tip**: to stop idle containers every night, put the loop from [Before system maintenance](#before-system-maintenance) in a script and schedule it with cron, for example `0 2 * * * /path/to/stop_idle_containers.sh`.
{{< /callout >}}