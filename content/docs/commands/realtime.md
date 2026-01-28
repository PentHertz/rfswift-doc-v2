---
title: realtime
weight: 27
prev: /docs/commands/ulimits
---

# rfswift realtime

Enable or disable realtime mode for optimal SDR performance.

## Synopsis

```bash
rfswift realtime enable -c CONTAINER
rfswift realtime disable -c CONTAINER
rfswift realtime status -c CONTAINER
```

The `realtime` command provides a one-command solution to configure containers for low-latency RF/SDR operations. It automatically sets up the necessary capabilities and ulimits to eliminate buffer underruns and enable real-time scheduling.

---

## What Realtime Mode Configures

When you enable realtime mode, RF Swift automatically configures:

| Setting | Value | Purpose |
|---------|-------|---------|
| **SYS_NICE capability** | Added | Allows setting process priorities and real-time scheduling |
| **rtprio ulimit** | 95 | Enables real-time scheduling up to priority 95 |
| **memlock ulimit** | unlimited | Prevents sample buffers from being swapped to disk |
| **nice ulimit** | 40 | Allows nice values from -20 to 19 |

---

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `enable` | Enable realtime mode on a container |
| `disable` | Disable realtime mode on a container |
| `status` | Check realtime mode status and current ulimits |

---

## Options

### realtime enable / disable / status

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | ✅ Yes | `-c my_container` |

---

## Examples

### Basic Usage

**Enable realtime mode:**
```bash
rfswift realtime enable -c sdr_work
```

**Check realtime status:**
```bash
rfswift realtime status -c sdr_work
```

**Disable realtime mode:**
```bash
rfswift realtime disable -c sdr_work
```

### Real-World Scenarios

**Fix SDR buffer underruns:**
```bash
# Experiencing underruns with HackRF/BladeRF/RTL-SDR?
rfswift realtime enable -c sdr_container

# Verify it's working
rfswift exec -c sdr_container -e "ulimit -r"
# Output: 95

# Now run your SDR application with real-time priority
rfswift exec -c sdr_container
chrt -f 50 hackrf_transfer -r samples.bin -f 433920000 -s 8000000
```

**Create new container with realtime mode:**
```bash
# Use --realtime flag during creation
rfswift run -n sdr_realtime -i penthertz/rfswift_noble:sdr_full --realtime

# Container is ready for low-latency SDR work
rfswift exec -c sdr_realtime
```

**Professional RF testing setup:**
```bash
# Create optimized container
rfswift run -n rf_pentest -i penthertz/rfswift_noble:rfid --realtime

# Verify configuration
rfswift realtime status -c rf_pentest

# Run time-critical captures
rfswift exec -c rf_pentest
chrt -f 70 proxmark3 /dev/ttyACM0
```

**Using real-time scheduling inside container:**
```bash
rfswift exec -c sdr_container

# Run with FIFO real-time scheduling (priority 1-99)
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 output.bin

# Run with round-robin real-time scheduling
chrt -r 50 gqrx

# Run with elevated nice priority
nice -n -15 gnuradio-companion

# Check current process scheduling
chrt -p $$
```

---

## When to Use Realtime Mode

### ✅ Enable Realtime Mode For:

- **High sample rate captures** - Prevents dropped samples at high bandwidths
- **Real-time signal processing** - GNU Radio flowgraphs, SDR++, GQRX
- **Multiple SDR tools** - Running several applications simultaneously
- **Time-critical protocols** - RFID, NFC, automotive keyfobs
- **Professional pentesting** - When reliability is critical
- **Live demonstrations** - Avoid embarrassing buffer underruns

### ❌ Not Necessary For:

- **Offline analysis** - Inspectrum, signal analysis of recorded files
- **Low sample rates** - Simple FM reception, slow protocols
- **Non-SDR work** - General container usage, development

---

## Alternative: Host-Level Configuration

Instead of per-container settings, you can configure Docker daemon defaults:

**Edit `/etc/docker/daemon.json`:**
```json
{
  "default-ulimits": {
    "rtprio": { "Name": "rtprio", "Hard": 95, "Soft": 95 },
    "memlock": { "Name": "memlock", "Hard": -1, "Soft": -1 },
    "nice": { "Name": "nice", "Hard": 40, "Soft": 40 }
  }
}
```

**Restart Docker:**
```bash
sudo systemctl restart docker
```

This applies realtime ulimits to **all** containers on the host automatically.

---

## Troubleshooting

### Realtime Mode Not Working

**Problem:** Still experiencing buffer underruns after enabling realtime mode

**Solutions:**
```bash
# Verify realtime mode is enabled
rfswift realtime status -c container

# Check ulimits inside container
rfswift exec -c container -e "ulimit -r && ulimit -l"
# Should show: 95 and unlimited

# Ensure you're actually using real-time scheduling
rfswift exec -c container
chrt -f 50 your_sdr_command  # Must use chrt!

# Check if host kernel supports real-time
uname -a  # Should not be a -virtual or -cloud kernel
```

### Permission Denied

**Problem:** `Operation not permitted` when using `chrt`

**Solutions:**
```bash
# Re-enable realtime mode (recreates container)
rfswift realtime enable -c container

# Verify SYS_NICE capability
rfswift exec -c container -e "grep Cap /proc/self/status"

# If using rootless Docker, also set host ulimits
# Edit /etc/security/limits.conf:
# your_user  -  rtprio  95
# your_user  -  memlock unlimited
```

### Container Won't Start After Enable

**Problem:** Container fails to start after enabling realtime mode

**Solutions:**
```bash
# Check Docker logs
docker logs container_name

# Try disabling and re-enabling
rfswift realtime disable -c container
rfswift realtime enable -c container

# If persists, recreate container
rfswift run -n new_container -i image_name --realtime
```

---

## Technical Details

### How It Works

1. **Container inspection** - RF Swift reads current container configuration
2. **Configuration update** - Adds SYS_NICE capability and ulimits
3. **Container recreation** - Stops, removes, and recreates container with new settings
4. **Verification** - Container starts with realtime configuration

### Ulimit Values Explained

| Ulimit | Value | Meaning |
|--------|-------|---------|
| rtprio=95 | Max RT priority | Can use `chrt -f 1` through `chrt -f 95` |
| memlock=-1 | Unlimited | No limit on locked memory (prevents swapping) |
| nice=40 | Range adjustment | Allows nice -20 to +19 (40-20=20 range) |

### Kernel Requirements

Real-time scheduling works best with:
- **Standard kernels** (not -virtual or -cloud variants)
- **PREEMPT_RT patches** (optional, for hard real-time)
- **Sufficient CPU resources** (avoid overcommitting)

---

## Related Commands

- [`ulimits`](/docs/commands/ulimits) - Fine-grained ulimit control
- [`capabilities`](/docs/commands/capabilities) - Manage container capabilities
- [`run`](/docs/commands/run) - Create container with `--realtime` flag
- [`exec`](/docs/commands/exec) - Access container to use real-time scheduling

---

{{< callout emoji="🚀" >}}
**One Command Setup**: `rfswift realtime enable -c container` configures everything needed for optimal SDR performance. No need to understand ulimits or capabilities!
{{< /callout >}}

{{< callout type="warning" >}}
**Container Recreation**: Enabling/disabling realtime mode recreates the container. Commit important changes first with `rfswift commit`!
{{< /callout >}}

{{< callout type="info" >}}
**New Containers**: Use `rfswift run -n name -i image --realtime` to create containers with realtime mode already enabled!
{{< /callout >}}