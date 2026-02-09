---
title: run
weight: 1
prev: /docs/commands/engine
next: /docs/commands/exec
---

# rfswift run

Create and start a new container from an RF Swift image.

## Synopsis

```bash
rfswift run -i IMAGE -n CONTAINER_NAME [options]
```

The `run` command is the primary way to create new containers in RF Swift. It pulls the specified image (if not already available), creates a container with the given name, and starts it with an interactive shell.

---

## Options

### Required Flags

| Flag | Description | Example |
|------|-------------|---------|
| `-i, --image STRING` | Image name or tag to use | `-i sdr_full` |
| `-n, --name STRING` | Name for the new container | `-n my_container` |

### Security Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-u, --privileged INT` | Privilege level (1=privileged, 0=unprivileged) | `0` | `-u 0` |
| `-a, --capabilities STRING` | Additional capabilities (comma-separated) | None | `-a NET_ADMIN,NET_RAW` |
| `-g, --cgroups STRING` | Cgroup device rules (comma-separated) | See config | `-g "c 189:* rwm"` |
| `-m, --seccomp STRING` | Custom seccomp profile path | Default | `-m /path/to/profile.json` |

### Performance Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--realtime` | Enable realtime mode for SDR operations | `false` | `--realtime` |
| `--ulimits STRING` | Set custom ulimits (comma-separated) | None | `--ulimits "rtprio=95,memlock=-1"` |

### Device & Volume Options

| Flag | Description | Example |
|------|-------------|---------|
| `-s, --devices STRING` | Device mappings (comma-separated) | `-s /dev/ttyUSB0:/dev/ttyUSB0` |
| `-b, --bind STRING` | Volume bindings (comma-separated) | `-b ~/projects:/root/projects` |

### Network Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-t, --network STRING` | Network mode | `host` | `-t bridge` |
| `-z, --exposedports STRING` | Expose ports for inter-container communication | None | `-z 8080,3000` |
| `-w, --bindedports STRING` | Bind ports to host | None | `-w 8080:80/tcp` |
| `-x, --extrahosts STRING` | Add extra host entries | None | `-x pluto.local:192.168.1.2` |

### Display & Audio Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-d, --display STRING` | X11 display setting | `DISPLAY=:0` | `-d DISPLAY=:1` |
| `-p, --pulseserver STRING` | PulseAudio server address | `tcp:127.0.0.1:34567` | `-p tcp:127.0.0.1:4713` |
| `--no-x11` | Disable X11 forwarding | false | `--no-x11` |

### Recording Options

| Flag | Description | Example |
|------|-------------|---------|
| `--record` | Enable session recording | `--record` |
| `--record-output STRING` | Custom recording filename | `--record-output session.cast` |

---

## Examples

### Basic Usage

**Create a simple SDR container:**
```bash
rfswift run -i sdr_full -n my_sdr
```

**Create with default image from config:**
```bash
# Requires imagename set in ~/.config/rfswift/config.ini
rfswift run -n my_container
```

### With Realtime Mode

**Create container optimized for SDR operations:**
```bash
rfswift run -i sdr_full -n sdr_realtime --realtime
```

This automatically configures:
- `SYS_NICE` capability
- `rtprio=95` ulimit
- `memlock=unlimited` ulimit
- `nice=40` ulimit

**With custom ulimits:**
```bash
rfswift run -i sdr_full -n custom_limits --ulimits "rtprio=95,memlock=-1,nofile=65536"
```

**Combine realtime with custom overrides:**
```bash
rfswift run -i sdr_full -n sdr_pro --realtime --ulimits "rtprio=99"
```

**Professional SDR setup with all optimizations:**
```bash
rfswift run -i sdr_full -n rf_pentest \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures \
  --record
```

### With Devices

**All USB devices:**
```bash
rfswift run -i sdr_full -n rtlsdr_work \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm"
```

**Multiple USB serial devices:**
```bash
rfswift run -i hardware -n multi_device \
  -s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0 \
  -g "c 189:* rwm,c 166:* rwm"
```


### With Security Configuration

**Unprivileged container with specific capabilities:**
```bash
rfswift run -i wifi -n wifi_scan \
  -u 0 \
  -a NET_ADMIN,NET_RAW \
  -t bridge
```

**With custom seccomp profile:**
```bash
rfswift run -i pentest -n secure_assessment \
  -u 0 \
  -m ~/seccomp-profiles/restricted.json \
  -g "c 189:* rwm"
```

**Privileged mode (use sparingly):**
```bash
rfswift run -i hardware -n hardware_debug \
  -u 1
```

### With Network Configuration

**Bridge network with port binding:**
```bash
rfswift run -i web_tools -n web_server \
  -t bridge \
  -w 8080:80/tcp
```

**Multiple ports exposed and bound:**
```bash
rfswift run -i api_server -n backend \
  -t bridge \
  -z 3000,3001,3002 \
  -w 8080:3000/tcp,8081:3001/tcp
```

**Network isolation (no network):**
```bash
rfswift run -i analysis -n offline_analysis \
  -t none \
  -b ~/data:/root/data
```

**Custom host entries:**
```bash
rfswift run -i penthertz/rfswift_noble:telecom -n network_test \
  -x "device1.local:192.168.1.10,device2.local:192.168.1.11"
```

### With Session Recording

**Record with auto-generated filename:**
```bash
rfswift run -i bluetooth -n bt_assessment \
  --record
```

**Record with custom filename:**
```bash
rfswift run -i sdr_full -n client_pentest \
  --record \
  --record-output client-assessment-2024-01-12.cast
```

**Combined: Recording with security and devices:**
```bash
rfswift run -i wifi -n wifi_audit \
  -u 0 \
  -a NET_ADMIN,NET_RAW \
  -t bridge \
  -s /dev/wlan0:/dev/wlan0 \
  --record \
  --record-output wifi-audit-session.cast
```

### Complex Real-World Examples

**Complete SDR assessment setup:**
```bash
rfswift run -i sdr_full -n site_survey \
  -u 0 \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -b /pathto/captures:/root/captures \
  -b /pathto/projects:/root/projects:ro \
  -g "c 189:* rwm,c 116:* rwm" \
  -t bridge \
  -w 8080:80/tcp \
  --record \
  --record-output site-survey-2024-01-12.cast
```

**Bluetooth security assessment:**
```bash
rfswift run -i bluetooth -n bt_pentest \
  -u 0 \
  -a NET_ADMIN,NET_RAW \
  -s /dev/ttyACM0:/dev/ttyACM0 \
  -b /pathto/bt-captures:/root/captures \
  -g "c 166:* rwm" \
  -t bridge \
  --record
```

**High-performance signal capture:**
```bash
rfswift run -i sdr_full -n high_perf_capture \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures
```

---

## Detailed Option Explanations

### Image Selection (`-i, --image`)

Specifies which RF Swift image to use for the container.

**Formats:**
```bash
# Full registry path
-i penthertz/rfswift_noble:sdr_full

# Short name (resolves to penthertz/rfswift_noble:IMAGE)
-i sdr_full

# Custom registry
-i myregistry.com/rfswift:custom
```

**Common images:**
- `sdr_full` - Complete SDR toolkit
- `sdr_light` - Lightweight SDR tools
- `bluetooth` - Bluetooth security tools
- `wifi` - Wi-Fi assessment tools
- `hardware` - Hardware hacking tools
- `automotive` - Vehicle protocol tools

See [List of Images](/docs/guide/list-of-images/) for all available images.

### Container Naming (`-n, --name`)

Assigns a unique name to the container. Names must be unique across all containers (running or stopped).

**Naming conventions:**
```bash
# Good names (descriptive, unique)
-n rtlsdr_capture_session_1
-n client_assessment_2024_01
-n wifi_audit_conference_room
-n bluetooth_pentest_device_a

# Avoid generic names
-n test        # Too generic
-n container1  # Not descriptive
```

### Realtime Mode (`--realtime`)

Enables optimized settings for low-latency SDR operations. This is a convenience flag that automatically configures:

| Setting | Value | Purpose |
|---------|-------|---------|
| SYS_NICE capability | Added | Allows real-time scheduling |
| rtprio ulimit | 95 | Enables `chrt -f 1` through `chrt -f 95` |
| memlock ulimit | unlimited | Prevents sample buffers from being swapped |
| nice ulimit | 40 | Allows nice -20 to +19 |

**When to use:**
- High sample rate captures (avoid buffer underruns)
- Real-time signal processing with GNU Radio, SDR++, GQRX
- Time-critical protocols (RFID, NFC, automotive)
- Professional pentesting where reliability is critical

```bash
# Simple usage
rfswift run -i sdr_full -n sdr_work --realtime

# Verify inside container
rfswift exec -c sdr_work -e "ulimit -r"
# Output: 95

# Use real-time scheduling
rfswift exec -c sdr_work
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 output.bin
```

### Custom Ulimits (`--ulimits`)

Set specific resource limits for fine-grained control.

**Format:** `name=value` or `name=soft:hard` (comma-separated for multiple)

| Name | Description | Example |
|------|-------------|---------|
| `rtprio` | Real-time scheduling priority (0-99) | `rtprio=95` |
| `memlock` | Max locked memory (-1 = unlimited) | `memlock=-1` |
| `nice` | Nice priority range | `nice=40` |
| `nofile` | Max open file descriptors | `nofile=65536` |
| `nproc` | Max processes | `nproc=4096` |

**Examples:**
```bash
# Single ulimit
--ulimits "rtprio=95"

# Multiple ulimits
--ulimits "rtprio=95,memlock=-1,nofile=65536"

# With soft:hard format
--ulimits "nofile=1024:65536"

# Combine with realtime (custom values override defaults)
--realtime --ulimits "rtprio=99"
```

### Privilege Level (`-u, --privileged`)

Controls container privilege level:
- `0` (default): Unprivileged - Recommended for most use cases
- `1`: Privileged - Full host access, use only when necessary

**When to use privileged mode:**
- Kernel module loading required
- Low-level hardware access
- Complex network operations

{{< callout type="warning" >}}
**Security Risk**: Privileged containers can escape isolation and compromise the host. Use `-u 1` only when absolutely necessary and remove the container after use.
{{< /callout >}}

### Capabilities (`-a, --capabilities`)

Add specific Linux capabilities for fine-grained privilege control.

**Common capabilities:**
```bash
# Network operations
-a NET_ADMIN,NET_RAW

# Process debugging
-a SYS_PTRACE

# Real-time scheduling (added automatically with --realtime)
-a SYS_NICE

# Low port binding
-a NET_BIND_SERVICE

# File ownership changes
-a CHOWN,DAC_OVERRIDE
```

See [Capabilities Reference](/docs/commands/capabilities/) for complete list.

### Cgroups (`-g, --cgroups`)

Control which device types the container can access.

**Format:** `type major:minor permissions`
- `type`: `c` (character) or `b` (block)
- `major:minor`: Device numbers (use `*` for all)
- `permissions`: `r` (read), `w` (write), `m` (mknod)

**Common rules:**
```bash
# USB serial (RTL-SDR, HackRF)
-g "c 189:* rwm"

# ACM devices (Proxmark3, Arduino)
-g "c 166:* rwm"

# USB converters
-g "c 188:* rwm"

# Audio devices
-g "c 116:* rwm"

# GPU devices
-g "c 226:* rwm"

# Multiple devices
-g "c 189:* rwm,c 166:* rwm,c 188:* rwm"
```

Find device major numbers:
```bash
ls -l /dev/your_device
# Example output: crw-rw---- 1 root dialout 189, 0 ...
#                                          ^^^ major number
```

### Device Mappings (`-s, --devices`)

Make specific host devices available in the container.

**Format:** `host_device:container_device` or just `host_device` (same path in container)

```bash
# Single device
-s /dev/ttyUSB0:/dev/ttyUSB0

# Multiple devices
-s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0
```

{{< callout type="info" >}}
**Cgroups + Devices**: You need BOTH cgroup rules and device mappings. Cgroups allow access to device types, mappings make specific devices available.
{{< /callout >}}

### Volume Bindings (`-b, --bind`)

Share directories between host and container.

**Format:** `host_path:container_path[:options]`

**Options:**
- None (default): Read-write access
- `:ro`: Read-only access

```bash
# Read-write binding
-b ~/projects:/root/projects

# Read-only binding
-b ~/samples:/root/samples:ro

# Multiple bindings
-b ~/projects:/root/projects,~/captures:/root/captures
```

**Use cases:**
- Share project files
- Save captures to host
- Mount firmware samples (read-only)
- Share tool configurations

### Network Modes (`-t, --network`)

Configure container network isolation:

| Mode | Description | Use Case |
|------|-------------|----------|
| `host` | No isolation (default) | Most RF tools, full network access |
| `bridge` | Default Docker bridge | Web services, API servers |
| `none` | No network access | Offline analysis, malware analysis |
| `container:NAME` | Share network with another container | Linked services |

```bash
# Full network access (default)
-t host

# Isolated with port forwarding
-t bridge -w 8080:80/tcp

# Complete isolation
-t none
```

### Port Configuration

**Exposed ports (`-z`)**: Make ports available to other containers
```bash
-z 8080              # Single port
-z 8080,3000,3001    # Multiple ports
```

**Bound ports (`-w`)**: Publish ports to host
```bash
# Format: host_port:container_port/protocol
-w 8080:80/tcp

# With host IP
-w 127.0.0.1:8080:80/tcp

# Multiple ports
-w 8080:80/tcp,8443:443/tcp
```

### Display Options

**X11 Display (`-d`)**: Configure X11 forwarding for GUI applications
```bash
-d DISPLAY=:0        # Default display
-d DISPLAY=:1        # Alternate display
```

**PulseAudio (`-p`)**: Configure audio server
```bash
-p tcp:127.0.0.1:34567    # Default
-p tcp:localhost:4713      # Custom port
```

**Disable X11 (`--no-x11`)**: For headless containers
```bash
--no-x11    # No GUI support
```

### Recording Options

**Enable recording (`--record`)**: Records terminal session
```bash
--record    # Auto-generated filename
```

**Custom filename (`--record-output`)**: Specify recording filename
```bash
--record-output client-session.cast
--record-output /path/to/recordings/$(date +%Y%m%d)-session.cast
```

Recordings are saved in asciinema format (.cast files) and can be replayed with `rfswift log replay`.

---

## Common Patterns

### Quick Container for Testing

```bash
# Minimal setup
rfswift run -i sdr_light -n test

# With one device
rfswift run -i sdr_full -n quick_test -s /dev/bus/usb:/dev/bus/usb
```

### High-Performance SDR Container

```bash
rfswift run -i sdr_full -n high_perf \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures
```

### Repeatable Assessment Container

```bash
# Save as script: setup_assessment.sh
#!/bin/bash
CONTAINER_NAME="assessment_$(date +%Y%m%d)"
rfswift run -i pentest -n "$CONTAINER_NAME" \
  -u 0 \
  --realtime \
  -t bridge \
  -b ~/assessments:/root/work \
  --record \
  --record-output "${CONTAINER_NAME}.cast"
```

### Development Container

```bash
rfswift run -i sdr_full -n sdr_dev \
  -b ~/code:/root/code \
  -b ~/.ssh:/root/.ssh:ro \
  -b ~/.gitconfig:/root/.gitconfig:ro \
  -w 8888:8888/tcp
```

### Isolated Analysis Container

```bash
rfswift run -i reversing -n isolated_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro \
  -b ~/output:/root/output \
  --no-x11
```

---

## Troubleshooting

### Container Name Already Exists

**Error:** `Error response from daemon: Conflict. The container name "..." is already in use`

**Solution:**
```bash
# Remove existing container
rfswift remove -c container_name

# Or use different name
rfswift run -i image -n container_name_2
```

### Image Not Found

**Error:** `Error: No such image: penthertz/rfswift_noble:image_name`

**Solution:**
```bash
# Pull image first
rfswift images pull -i image_name

# Or let run pull automatically (if network available)
rfswift run -i image_name -n container
```

### Device Not Accessible

**Problem:** Device binding added but can't access device in container

**Solution:**
```bash
# Add cgroup rule for device type
rfswift run -i image -n container \
  -s /dev/ttyUSB0:/dev/ttyUSB0 \
  -g "c 189:* rwm"

# Or add dynamically
rfswift cgroups add -c container -g "c 189:* rwm"
```

### Permission Denied for Device

**Problem:** Permission denied when accessing device

**Solution:**
```bash
# Check host permissions
ls -l /dev/your_device

# Add user to device group on host
sudo usermod -aG dialout $USER
newgrp dialout

# Then run container
rfswift run -i image -n container -s /dev/your_device:/dev/your_device
```

### Network Operations Fail

**Problem:** Wi-Fi/Bluetooth tools can't configure interfaces

**Solution:**
```bash
# Add network capabilities
rfswift run -i wifi -n wifi_tools \
  -a NET_ADMIN,NET_RAW \
  -t bridge
```

### X11 Not Working

**Problem:** GUI applications won't start or display

**Solution:**
```bash
# On host (Linux)
xhost +local:

# Then run container
rfswift run -i image -n container -d DISPLAY=$DISPLAY

# Or disable X11 for headless operation
rfswift run -i image -n container --no-x11
```

### Audio Not Working

**Problem:** No audio output from container

**Solution:**
```bash
# Enable audio support first
rfswift host audio enable

# Check PulseAudio is running
ps aux | grep pulse

# Run container with correct server
rfswift run -i image -n container -p tcp:127.0.0.1:34567
```

### Port Already in Use

**Problem:** Can't bind port - already in use

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :8080

# Use different host port
rfswift run -i image -n container -w 8081:80/tcp

# Or stop conflicting service
sudo systemctl stop service_name
```

### Buffer Underruns with SDR

**Problem:** Experiencing sample drops or buffer underruns

**Solution:**
```bash
# Enable realtime mode
rfswift run -i sdr_full -n sdr_work --realtime

# Or add to existing container
rfswift realtime enable -c existing_container

# Verify inside container
rfswift exec -c sdr_work -e "ulimit -r"
# Should show: 95

# Use real-time scheduling
chrt -f 50 your_sdr_command
```

---

## Best Practices

### 1. Use Descriptive Names

```bash
# Good
rfswift run -i sdr_full -n rtlsdr_spectrum_analysis_2024_01

# Not recommended
rfswift run -i sdr_full -n test1
```

### 2. Start Unprivileged

Always start with `-u 0` and add capabilities as needed:

```bash
# Start unprivileged
rfswift run -i wifi -n wifi_scan -u 0

# Add capabilities if needed
rfswift capabilities add -c wifi_scan -a NET_ADMIN
```

### 3. Use Realtime Mode for SDR Work

```bash
# Always use --realtime for SDR captures
rfswift run -i sdr_full -n hackrf_capture --realtime
```

### 4. Use Read-Only Mounts for Reference Data

```bash
rfswift run -i analysis -n data_analysis \
  -b ~/samples:/root/samples:ro \
  -b ~/output:/root/output
```

### 5. Record Important Sessions

```bash
rfswift run -i pentest -n client_assessment \
  --record \
  --record-output client-$(date +%Y%m%d).cast
```

### 6. Use Bridge Network for Services

```bash
rfswift run -i web_tools -n web_server \
  -t bridge \
  -w 127.0.0.1:8080:80/tcp
```

### 7. Organize Project Directories

```bash
# Create organized structure
mkdir -p /pathto/rf-assessments/{captures,projects,recordings}

# Use in containers
rfswift run -i sdr_full -n assessment \
  -b /pathto/rf-assessments/captures:/root/captures,/pathto/rf-assessments/projects:/root/projects \
  --record-output /pathto/rf-assessments/recordings/session.cast
```

---

## Related Commands

- [`exec`](/docs/commands/exec) - Enter an existing container
- [`stop`](/docs/commands/stop) - Stop a running container
- [`remove`](/docs/commands/remove) - Remove a container
- [`bindings`](/docs/commands/bindings) - Dynamically add devices/volumes
- [`capabilities`](/docs/commands/capabilities) - Modify capabilities after creation
- [`cgroups`](/docs/commands/cgroups) - Modify cgroup rules after creation
- [`ports`](/docs/commands/ports) - Manage ports after creation
- [`realtime`](/docs/commands/realtime) - Enable/disable realtime mode on existing containers
- [`ulimits`](/docs/commands/ulimits) - Manage ulimits on existing containers

---

{{< callout emoji="⚡" >}}
**SDR Performance**: Use `--realtime` flag for optimal SDR performance. It automatically configures rtprio, memlock, nice ulimits and SYS_NICE capability to eliminate buffer underruns!
{{< /callout >}}

{{< callout emoji="💡" >}}
**Tip**: Use `rfswift run --help` to see all options with their current default values from your config file.
{{< /callout >}}