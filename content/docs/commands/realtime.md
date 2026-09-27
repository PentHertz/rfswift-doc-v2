---
title: "rfswift realtime"
linkTitle: "realtime"
navGroup: "Runtime configuration"
level: reference
description: "Enable or disable realtime mode for better SDR performance."
weight: 47
---

Realtime mode sets up a container for low-latency radio work in one command. It adds the capability and the resource limits that SDR tools need to run with real-time priority, which helps avoid buffer underruns (dropped samples).

Use it when a capture drops samples, or before time-critical work. For a new lab, pass `--realtime` to `rfswift container create` instead.

```bash
rfswift realtime enable -c my_sdr
```

## Synopsis

```bash
rfswift realtime enable  -c CONTAINER
rfswift realtime disable -c CONTAINER
rfswift realtime status  -c CONTAINER
```

## What realtime mode sets

| Setting | Value | Purpose |
|---------|-------|---------|
| **SYS_NICE capability** | Added | Allows changing process priorities and real-time scheduling |
| **rtprio ulimit** | 95 | Real-time scheduling up to priority 95 |
| **memlock ulimit** | unlimited | Keeps sample buffers in RAM instead of swap |
| **nice ulimit** | 40 | Allows nice values from -20 to 19 |

{{< callout type="warning" >}}
Enabling or disabling realtime mode re-creates the container. Commit important changes first with `rfswift container commit`.
{{< /callout >}}

## Subcommands

| Subcommand | What it does |
|------------|--------------|
| `enable` | Turns realtime mode on for a container |
| `disable` | Turns realtime mode off |
| `status` | Shows whether realtime mode is on, and the current limits |

All three take `-c, --container STRING` (container ID or name, required), for example `-c my_container`.

## Examples

### Basic use

Turn realtime mode on, check it, and turn it off:

```bash
rfswift realtime enable  -c sdr_work
rfswift realtime status  -c sdr_work
rfswift realtime disable -c sdr_work
```

### Fix SDR buffer underruns

If a HackRF, BladeRF or RTL-SDR capture drops samples, enable realtime mode, check that `rtprio` is now 95, then run the capture with real-time priority:

```bash
rfswift realtime enable -c sdr_container
rfswift container shell -c sdr_container -e "ulimit -r"
# Output: 95

rfswift container shell -c sdr_container
chrt -f 50 hackrf_transfer -r samples.bin -f 433920000 -s 8000000
```

### Create a lab with realtime mode already on

```bash
rfswift container create -n sdr_realtime -i penthertz/rfswift_resolute:sdr_full --realtime
rfswift container shell -c sdr_realtime
```

### Time-critical RFID captures

Create an `rfid` lab with realtime mode, check it, and run the Proxmark3 client with real-time priority:

```bash
rfswift container create -n rf_pentest -i penthertz/rfswift_resolute:rfid --realtime
rfswift realtime status -c rf_pentest

rfswift container shell -c rf_pentest
chrt -f 70 proxmark3 /dev/ttyACM0
```

### Real-time scheduling inside a lab

Inside the lab, `chrt` starts a program with real-time scheduling, and `nice` raises its priority:

```bash
rfswift container shell -c sdr_container

# Run with FIFO real-time scheduling (priority 1-99)
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 output.bin

# Run with round-robin real-time scheduling
chrt -r 50 gqrx

# Run with elevated nice priority
nice -n -15 gnuradio-companion

# Check current process scheduling
chrt -p $$
```

## When to use realtime mode

### Useful for

- **High sample rates**: avoids dropped samples at high bandwidths.
- **Live signal processing**: GNU Radio flowgraphs, SDR++, GQRX.
- **Several SDR tools at once.**
- **Time-critical protocols**: RFID, NFC, car key fobs.
- **Professional assessments**, where reliability matters.
- **Live demonstrations**, to avoid dropped samples in front of an audience.

### Not needed for

- **Offline analysis**: Inspectrum, or analysing recorded files.
- **Low sample rates**: simple FM reception, slow protocols.
- **Non-SDR work**: general use, development.

## Set it for every container on the host

Instead of setting it per container, you can configure default limits for the Docker service. Edit `/etc/docker/daemon.json`:

```json
{
  "default-ulimits": {
    "rtprio": { "Name": "rtprio", "Hard": 95, "Soft": 95 },
    "memlock": { "Name": "memlock", "Hard": -1, "Soft": -1 },
    "nice": { "Name": "nice", "Hard": 40, "Soft": 40 }
  }
}
```

Then restart Docker. Every container on the host now gets these limits:

```bash
sudo systemctl restart docker
```

## Troubleshooting

### Captures still drop samples after enabling realtime mode

Check that realtime mode is on and that the limits reached the lab (you should see 95 and unlimited). Real-time priority only applies to programs you start with `chrt`. Also check the host kernel: `-virtual` and `-cloud` kernels are not suited to real-time work.

```bash
rfswift realtime status -c container
rfswift container shell -c container -e "ulimit -r && ulimit -l"

rfswift container shell -c container
chrt -f 50 your_sdr_command  # Must use chrt!

uname -a  # Should not be a -virtual or -cloud kernel
```

### `Operation not permitted` when using `chrt`

Enable realtime mode again (this re-creates the container) and check that the `SYS_NICE` capability is present:

```bash
rfswift realtime enable -c container
rfswift container shell -c container -e "grep Cap /proc/self/status"
```

With rootless Docker, also raise the limits on the host, in `/etc/security/limits.conf`:

```
your_user - rtprio  95
your_user - memlock unlimited
```

### The container doesn't start after enabling realtime mode

Look at the engine's logs, try disabling and enabling again, and if it still fails, create a new lab with `--realtime`:

```bash
docker logs container_name
rfswift realtime disable -c container
rfswift realtime enable -c container
rfswift container create -n new_container -i image_name --realtime
```

## How it works

1. **Inspect**: RF Swift reads the container's current configuration.
2. **Update**: it adds the `SYS_NICE` capability and the limits.
3. **Re-create**: it stops, removes and re-creates the container with the new settings.
4. **Start**: the container starts with realtime settings.

### What the values mean

| Limit | Value | Meaning |
|-------|-------|---------|
| rtprio=95 | Maximum real-time priority | You can use `chrt -f 1` through `chrt -f 95` |
| memlock=-1 | Unlimited | No limit on locked memory, so nothing is swapped out |
| nice=40 | Range | Allows nice -20 to +19 (40 - 20 = 20) |

### Kernel requirements

Real-time scheduling works best with:

- a **standard kernel** (not a `-virtual` or `-cloud` variant);
- the **PREEMPT_RT patches**, optionally, for hard real-time;
- **enough CPU**: avoid overcommitting the machine.

## Related

- [config ulimits](/docs/commands/ulimits): set individual limits
- [config capabilities](/docs/commands/capabilities)
- [container create](/docs/commands/run): the `--realtime` flag
- [container shell](/docs/commands/exec)
