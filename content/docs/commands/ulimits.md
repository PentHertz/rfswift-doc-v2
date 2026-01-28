---
title: ulimits
weight: 26
prev: /docs/commands/install
next: /docs/commands/realtime
---

# rfswift ulimits

Manage resource limits (ulimits) for containers to optimize SDR performance.

## Synopsis

```bash
rfswift ulimits add -c CONTAINER -n NAME -v VALUE
rfswift ulimits rm -c CONTAINER -n NAME
rfswift ulimits list -c CONTAINER
```

The `ulimits` command allows you to add, remove, or list resource limits on containers. Ulimits control various kernel-level resource constraints that affect process scheduling, memory locking, and file descriptors. For SDR work for example, proper ulimit configuration can eliminate buffer underruns and improve real-time performance.

---

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `add` | Add or update an ulimit on a container |
| `rm` | Remove an ulimit from a container |
| `list` | List all ulimits set on a container |

---

## Options

### ulimits add

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | ✅ Yes | `-c my_container` |
| `-n, --name STRING` | Ulimit name | ✅ Yes | `-n rtprio` |
| `-v, --value STRING` | Ulimit value | ✅ Yes | `-v 95` |

### ulimits rm

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | ✅ Yes | `-c my_container` |
| `-n, --name STRING` | Ulimit name to remove | ✅ Yes | `-n rtprio` |

### ulimits list

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | ✅ Yes | `-c my_container` |

---

## Common Ulimit Names

| Name | Description | SDR Use Case |
|------|-------------|--------------|
| `rtprio` | Real-time scheduling priority (0-99) | Enables `chrt` for real-time SDR processing |
| `memlock` | Max locked memory in bytes (-1 = unlimited) | Prevents sample buffers from being swapped |
| `nice` | Nice priority range (40 allows nice -20) | Higher process priority |
| `nofile` | Max open file descriptors | Multiple SDR devices or large file operations |
| `nproc` | Max number of processes | Parallel processing pipelines |

---

## Value Format

Ulimit values can be specified in two formats:

| Format | Description | Example |
|--------|-------------|---------|
| `value` | Sets both soft and hard limit | `95` |
| `soft:hard` | Sets soft and hard limits separately | `1024:65536` |
| `-1` or `unlimited` | Unlimited value | `-1` |

---

## Examples

### Basic Usage

**Add rtprio ulimit for real-time scheduling:**
```bash
rfswift ulimits add -c sdr_work -n rtprio -v 95
```

**Set unlimited memory locking:**
```bash
rfswift ulimits add -c sdr_work -n memlock -v -1
```

**Set file descriptor limits with soft/hard values:**
```bash
rfswift ulimits add -c sdr_work -n nofile -v 1024:65536
```

**List current ulimits:**
```bash
rfswift ulimits list -c sdr_work
```

**Remove an ulimit:**
```bash
rfswift ulimits rm -c sdr_work -n rtprio
```

### Real-World Scenarios

**Optimize container for SDR work:**
```bash
# Add all SDR-relevant ulimits
rfswift ulimits add -c hackrf_work -n rtprio -v 95
rfswift ulimits add -c hackrf_work -n memlock -v unlimited
rfswift ulimits add -c hackrf_work -n nice -v 40

# Verify configuration
rfswift ulimits list -c hackrf_work
```

**Fix buffer underruns:**
```bash
# Check current ulimits
rfswift ulimits list -c sdr_container

# Add rtprio if missing
rfswift ulimits add -c sdr_container -n rtprio -v 95

# Verify inside container
rfswift exec -c sdr_container -e "ulimit -r"
# Should output: 95
```

**Use real-time scheduling inside container:**
```bash
# After setting rtprio ulimit
rfswift exec -c sdr_container

# Inside container, run SDR tool with real-time priority
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 - | ...

# Or with higher nice priority
nice -n -10 gqrx
```

---

## Troubleshooting

### Ulimit Not Taking Effect

**Problem:** Ulimit set but not working inside container

**Solutions:**
```bash
# Verify ulimit is set
rfswift ulimits list -c container

# Check inside container
rfswift exec -c container -e "ulimit -a"

# For rtprio, also need SYS_NICE capability
rfswift capabilities add -c container -p SYS_NICE

# Or use realtime mode which sets everything
rfswift realtime enable -c container
```

### Permission Denied with chrt

**Problem:** `chrt: failed to set pid 0's policy: Operation not permitted`

**Solutions:**
```bash
# Need both rtprio ulimit AND SYS_NICE capability
rfswift ulimits add -c container -n rtprio -v 95
rfswift capabilities add -c container -p SYS_NICE

# Or simply enable realtime mode
rfswift realtime enable -c container
```

### Container Recreation

**Note:** Modifying ulimits requires container recreation. The container will be stopped, removed, and recreated with the new settings. Your data in mounted volumes is preserved, but uncommitted changes inside the container may be lost.

```bash
# Commit important changes before modifying ulimits
rfswift commit -c container -i my_image:backup

# Then modify ulimits
rfswift ulimits add -c container -n rtprio -v 95
```

---

## Related Commands

- [`realtime`](/docs/commands/realtime) - Quick setup for all SDR-related ulimits
- [`capabilities`](/docs/commands/capabilities) - Manage container capabilities
- [`exec`](/docs/commands/exec) - Test ulimits inside container
- [`run`](/docs/commands/run) - Create container with ulimits using `--ulimits` flag

---

{{< callout emoji="⚡" >}}
**Quick Setup**: For RF work, use `rfswift realtime enable -c container` instead of setting individual ulimits. It configures rtprio, memlock, nice, and SYS_NICE capability automatically!
{{< /callout >}}

{{< callout type="warning" >}}
**Container Restart**: Changing ulimits requires recreating the container. Commit your work first with `rfswift commit` if you have uncommitted changes!
{{< /callout >}}

{{< callout type="info" >}}
**Host Alternative**: You can also configure default ulimits in `/etc/docker/daemon.json` to apply to all containers on the host. See the [realtime documentation](/docs/commands/realtime) for details.
{{< /callout >}}