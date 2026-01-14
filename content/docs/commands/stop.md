---
title: stop
weight: 3
prev: /docs/commands/exec
next: /docs/commands/remove
---

# rfswift stop

Stop a running container without removing it.

## Synopsis

```bash
rfswift stop -c CONTAINER_NAME
```

The `stop` command gracefully stops a running container while preserving all data and state. The container can be restarted later with `exec` or using Docker commands.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container name or ID to stop | Yes | `-c my_container` |

---

## Examples

### Basic Usage

**Stop a specific container:**
```bash
rfswift stop -c my_sdr_container
```

**Stop by container ID:**
```bash
rfswift stop -c a1b2c3d4e5f6
```

**Stop with short container ID:**
```bash
rfswift stop -c a1b2c3
```

### Real-World Scenarios

**End of work day:**
```bash
# Stop assessment container for the day
rfswift stop -c client_assessment

# Resume tomorrow
rfswift exec -c client_assessment
```

**Free up resources:**
```bash
# Stop idle containers to free memory
rfswift stop -c sdr_capture
rfswift stop -c wifi_analysis
rfswift stop -c bluetooth_scanner
```

**Before system maintenance:**

For now you can do the following trick:

```bash
# Stop all RF Swift containers before system update
for container in $(docker ps -q --filter "ancestor=penthertz/rfswift_noble"); do
    rfswift stop -c $container
done
```

**Temporary pause:**
```bash
# Stop container during lunch break
rfswift stop -c long_running_capture

# Resume after lunch
rfswift exec -c long_running_capture
```

---

## What Happens When You Stop a Container

### Data Persistence

When a container is stopped:
- ✅ **Container filesystem**: All data inside the container is preserved
- ✅ **Mounted volumes**: Data in mounted directories remains intact
- ✅ **Container configuration**: All settings, bindings, and capabilities are preserved
- ✅ **Network configuration**: Port bindings and network settings are saved
- ❌ **Running processes**: All processes inside the container are terminated
- ❌ **Memory state**: RAM contents are lost (not hibernated)

**Example:**
```bash
# Create container with captures
rfswift run -i sdr_full -n capture_session -b ~/captures:/root/captures

# Inside container: Start long capture
rfswift exec -c capture_session
rtl_sdr -f 100M -s 2.4M capture.dat &
exit

# Stop container
rfswift stop -c capture_session
# Process terminates, but files in ~/captures persist

# Resume later
rfswift exec -c capture_session
ls /root/captures  # Files still there
```

### Process Handling

**Graceful shutdown:**
1. Docker sends SIGTERM to all processes
2. Processes have 10 seconds to clean up
3. If processes don't exit, Docker sends SIGKILL
4. Container stops

**Important for:**
- Database containers (ensure data consistency)
- Long-running captures (may lose in-progress data)
- Network services (connections are dropped)

### Container State After Stop

```bash
# Check container status
docker ps -a | grep my_container

# Output shows:
# STATUS: Exited (0) 2 minutes ago
```

**Container is:**
- ✅ Still exists in Docker
- ✅ Can be restarted
- ✅ Can be committed to an image
- ✅ Can be removed
- ❌ Not consuming CPU
- ❌ Not consuming RAM
- ✅ Still consuming disk space

---

### Stop vs Exit

| Operation | `stop` | `exit` (from shell) |
|-----------|--------|---------------------|
| Initiated from | Host | Inside container |
| Stops container | ✅ Always | ⚠️ Sometimes* |
| Graceful shutdown | ✅ Yes | ⚠️ Depends |
| Use when | Managing from host | Done with current session |

{{< callout type="warning" >}}
Container stops if no other processes are running
{{< /callout >}}

**Workflow comparison:**
```bash
# Using exit (from inside container)
rfswift exec -c my_container
# ... work ...
exit
# Container may still be running if background processes exist

# Using stop (from host)
rfswift stop -c my_container
# Container definitely stops, all processes terminate
```

---

## Common Workflows

### Daily Work Cycle

```bash
# Monday: Create container
rfswift run -i pentest -n weekly_work -b ~/work:/root/work

# Monday-Friday: Use throughout week
rfswift exec -c weekly_work
# ... work ...
exit

# Each evening: Stop to free resources
rfswift stop -c weekly_work

# Each morning: Resume
rfswift exec -c weekly_work  # Auto-starts

# Friday: Clean up when done
rfswift remove -c weekly_work
```

### Resource Management

```bash
# List running containers
docker ps

# Stop idle containers
rfswift stop -c sdr_test1
rfswift stop -c old_assessment
rfswift stop -c experiment_container
```

### Container Lifecycle Management

```bash
# Week 1: Create and use
rfswift run -i sdr_full -n project_alpha

# Week 1-2: Use daily
rfswift exec -c project_alpha

# Weekend: Stop to save resources
rfswift stop -c project_alpha

# Week 3: Resume
rfswift exec -c project_alpha

# Project complete: Remove if not needed anymore
rfswift remove -c project_alpha
```

### Batch Container Management

```bash
# Stop multiple related containers
CONTAINERS="capture1 capture2 capture3"
for container in $CONTAINERS; do
    echo "Stopping $container..."
    rfswift stop -c $container
done

# Or using docker directly
docker stop capture1 capture2 capture3
```

---

## Troubleshooting

### Container Already Stopped

**Problem:** Trying to stop an already stopped container

```bash
rfswift stop -c my_container
# Error: Container is not running
```

**Solution:**
```bash
# Check if running
docker ps | grep my_container

# If not in output, it's already stopped
docker ps -a | grep my_container

# No action needed
```

### Container Not Found

**Error:** `Error: No such container: container_name`

**Solutions:**
```bash
# List all containers
rfswift las

# Container may have been removed
# Need to create new one
rfswift run -i image -n container_name
```

### Container Won't Stop

**Problem:** Container doesn't stop after reasonable time

**Solutions:**
```bash
# Wait longer (some containers need cleanup time)
rfswift stop -c my_container
# Wait 30-60 seconds

# Force stop with Docker
docker kill my_container         # Immediate force stop

# Check what's preventing shutdown
docker logs my_container
```

### Multiple Containers with Similar Names

**Problem:** Ambiguous container name

**Solutions:**
```bash
# Use full name
rfswift stop -c full_container_name

# Use container ID
docker ps  # Get ID
rfswift stop -c a1b2c3d4e5f6

# List to identify
rfswift last
```

### Permission Denied

**Problem:** Can't stop container

**Solutions:**
```bash
# Use sudo on Linux (if not in docker group)
sudo rfswift stop -c my_container

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then try again
rfswift stop -c my_container
```

### Data Loss Concerns

**Problem:** Worried about losing data when stopping

**Verification:**
```bash
# Check mounted volumes
docker inspect my_container | grep -A 10 Mounts

# Data in mounted volumes is safe
# Data in container filesystem is preserved when stopped
# Only running processes and RAM contents are lost

# To be extra safe, commit before stopping
rfswift commit -c my_container -i backup_image
rfswift stop -c my_container
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create new containers
- [`exec`](/docs/commands/exec) - Enter and restart stopped containers
- [`remove`](/docs/commands/remove) - Permanently delete containers
- [`last`](/docs/commands/last) - List recent containers with status
- [`commit`](/docs/commands/commit) - Save container state before stopping

---

{{< callout emoji="💡" >}}
**Quick Tip**: Create a nightly cron job to stop idle RF Swift containers and free resources: `crontab -e` then add `0 2 * * * /path/to/stop_idle_containers.sh`
{{< /callout >}}

{{< callout type="info" >}}
**Data Safety**: Stopping a container is completely safe - all your data is preserved. Only running processes are terminated. Think of it like "sleep mode" for your container!
{{< /callout >}}

{{< callout type="warning" >}}
**Long-Running Processes**: If you have captures or long-running processes inside a container, they will be terminated when the container stops. Save your work before stopping!
{{< /callout >}}