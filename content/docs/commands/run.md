---
title: "rfswift container create"
linkTitle: "container create"
navGroup: "Containers"
level: reference
description: "Create and start a new container, or a native Nix environment, with every available option."
weight: 2
---

Create and start a new container from an RF Swift image, or, with `--engine nix`, a native Nix environment.

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift container create`. The legacy form `rfswift run` and the short aliases `rfswift create` and `rfswift new` still work and print a notice. Flags are identical on every spelling; the examples below use the short legacy form for brevity.
{{< /callout >}}

## Synopsis

```bash
rfswift container create -i IMAGE -n CONTAINER_NAME [options]
rfswift run -i IMAGE -n CONTAINER_NAME [options]                    # legacy spelling
rfswift container create --engine nix -i ENVIRONMENT -n NAME [--lazy] [--pure] [--isolate] [--flake REF] [--create-only]
```

The command pulls the image if it is not local, checks that the engine can map the devices you asked for (and says which it cannot, with the reason, before dropping them on your confirmation), checks USB reachability, creates the container with a workspace, and enters it with an interactive shell. On Windows it offers the usbipd device picker when it detects RF hardware.

{{< callout type="info" >}}
**Interactive Wizard**: When run without `-i` and `-n` flags in an interactive terminal, RF Swift launches a guided wizard that walks you through all options step by step. See [Interactive Wizard](#interactive-wizard) below.
{{< /callout >}}

---

## Options

### Required flags

| Flag | Description | Example |
|------|-------------|---------|
| `-i, --image STRING` | Image name or tag to use | `-i sdr_full` |
| `-n, --name STRING` | Name for the new container | `-n my_container` |

{{< callout type="info" >}}
Both flags are optional when using the interactive wizard. If omitted in an interactive terminal, the wizard launches automatically.
{{< /callout >}}

### Security options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-u, --privileged INT` | Privilege level (1=privileged, 0=unprivileged). Never required for USB devices | `0` | `-u 0` |
| `-a, --capabilities STRING` | Additional capabilities (comma-separated) | None | `-a NET_ADMIN,NET_RAW` |
| `-g, --cgroups STRING` | Cgroup device rules (comma-separated) | See config | `-g "c 189:* rwm"` |
| `-m, --seccomp STRING` | Custom seccomp profile path | Default | `-m /path/to/profile.json` |

### Performance options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--realtime` | Enable realtime mode for SDR operations | `false` | `--realtime` |
| `--ulimits STRING` | Set custom ulimits (comma-separated) | None | `--ulimits "rtprio=95,memlock=-1"` |
| `--gpus STRING` | GPU devices to pass through | None | `--gpus all` or `--gpus 0,1` |

### Workspace options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--workspace STRING` | Custom workspace host path | `~/rfswift-workspace/<name>/` | `--workspace ~/my-project` |
| `--cwd` | Mount current directory as workspace | false | `--cwd` |
| `--no-workspace` | Disable automatic workspace | false | `--no-workspace` |

By default, every container gets a **shared workspace directory** automatically mounted:
- **Host**: `~/rfswift-workspace/<container-name>/`
- **Container**: `/workspace`

Files saved to `/workspace` inside the container are immediately available on the host. IQ captures, logs, reports and scripts all land in one place, without manual `--bind` flags.

{{< callout type="info" >}}
The workspace directory persists after the container is deleted. Your data stays on the host.
{{< /callout >}}

### Device & volume options

| Flag | Description | Example |
|------|-------------|---------|
| `-s, --devices STRING` | Device mappings (comma-separated) | `-s /dev/ttyUSB0:/dev/ttyUSB0` |
| `-b, --bind STRING` | Extra volume bindings (comma-separated) | `-b ~/projects:/root/projects` |

### Network options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-t, --network STRING` | Network mode | `host` | `-t bridge` |
| `-z, --exposedports STRING` | Expose ports for inter-container communication | None | `-z 8080,3000` |
| `-w, --bindedports STRING` | Bind ports to host | None | `-w 8080:80/tcp` |
| `-x, --extrahosts STRING` | Add extra host entries | None | `-x pluto.local:192.168.1.2` |

### Display & audio options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-d, --display STRING` | X11 display setting | `DISPLAY=:0` | `-d DISPLAY=:1` |
| `-p, --pulseserver STRING` | PulseAudio server address | `tcp:127.0.0.1:34567` | `-p tcp:127.0.0.1:4713` |
| `--no-x11` | Disable X11 forwarding and remove X11 socket binding | false | `--no-x11` |
| `--desktop` | Enable remote desktop via VNC/noVNC | false | `--desktop` |
| `--desktop-config STRING` | Desktop config as `proto:host:port` | `http:127.0.0.1:6080` | `--desktop-config "http:0.0.0.0:6080"` |
| `--desktop-pass STRING` | Set VNC password for desktop access | None | `--desktop-pass "mypassword"` |
| `--desktop-ssl` | Enable SSL/TLS for desktop connections | false | `--desktop-ssl` |

### Profile options

| Flag | Description | Example |
|------|-------------|---------|
| `--profile STRING` | Use a preset profile | `--profile sdr-full` |

Profiles bundle image, network, features, devices, ports, capabilities, and cgroup rules into a single named preset. CLI flags override profile values. See [`rfswift profile`](/docs/commands/profile/) for details.

```bash
# Use a profile
rfswift container create --profile sdr-full -n my_sdr

# Profile with CLI overrides
rfswift container create --profile wifi -n my_wifi -t nat --realtime
```

### VPN options

| Flag | Description | Example |
|------|-------------|---------|
| `--vpn STRING` | Enable VPN inside container | `--vpn tailscale` |

**Format:** `--vpn TYPE[:ARGUMENT]`

| Type | Argument | Example |
|------|----------|---------|
| `wireguard` | Config file path (required) | `--vpn wireguard:./wg0.conf` |
| `openvpn` | Config file path (required) | `--vpn openvpn:./client.ovpn` |
| `tailscale` | Auth key (optional) | `--vpn tailscale` or `--vpn tailscale:tskey-auth-xxx` |
| `netbird` | Setup key (optional) | `--vpn netbird` or `--vpn netbird:nb-setup-xxx` |

{{< callout type="info" >}}
**Privileged mode**: WireGuard and OpenVPN require `-u 1`. Tailscale and Netbird work without privileges (userspace mode with SOCKS5 proxy). See [VPN Inside Containers](/docs/guide/vpn) for details.
{{< /callout >}}

### Recording options

| Flag | Description | Example |
|------|-------------|---------|
| `--record` | Enable session recording | `--record` |
| `--record-output STRING` | Custom recording filename | `--record-output session.cast` |

### Shell

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-e, --command STRING` | Shell or command to run in the container | `/bin/zsh` (Bash when zsh is missing) | `-e /bin/bash`, `-e "gnuradio-companion"` |

### Nix engine options (`--engine nix`)

| Flag | Description |
|------|-------------|
| `--lazy` | On-demand environment: each tool builds the first time it is called and is then pinned |
| `--pure` | Pure shell (`nix develop --ignore-environment`) |
| `--isolate` | Enter inside a jail (bubblewrap on Linux, Seatbelt on macOS): hides `$HOME` and the host filesystem, keeps USB and serial devices, the display and the network. Stored on the environment |
| `--flake REF` | Flake reference instead of the default (a local RF-Swift-nix checkout or `github:PentHertz/RF-Swift-nix`) |
| `--rebuild` | Force re-realisation of the closure at creation |
| `--create-only` | Create and realise without entering (scripts, the Workbench) |

With the Nix engine the workspace, `--cwd`, `--no-workspace`, `--record`, `-e` and the wizard behave as for containers; container-only flags (devices, capabilities, ports, desktop, VPN) do not apply. See the [Nix engine guide](/docs/guide/nix-engine).

---

## Examples

### Basic usage

**Create a simple SDR container:**
```bash
rfswift container create -i sdr_full -n my_sdr
rfswift run -i sdr_full -n my_sdr            # same, legacy spelling
```

**Create a native Nix environment instead:**
```bash
rfswift container create --engine nix -i sdr_light -n radio
rfswift container create --engine nix -i rfid -n badge --lazy --isolate
```

**Create with default image from config:**
```bash
# Requires imagename set in ~/.config/rfswift/config.ini
rfswift container create -n my_container
```

### With realtime mode

**Create container optimized for SDR operations:**
```bash
rfswift container create -i sdr_full -n sdr_realtime --realtime
```

This automatically configures:
- `SYS_NICE` capability
- `rtprio=95` ulimit
- `memlock=unlimited` ulimit
- `nice=40` ulimit

**With custom ulimits:**
```bash
rfswift container create -i sdr_full -n custom_limits --ulimits "rtprio=95,memlock=-1,nofile=65536"
```

**Combine realtime with custom overrides:**
```bash
rfswift container create -i sdr_full -n sdr_pro --realtime --ulimits "rtprio=99"
```

**Professional SDR setup with all optimizations:**
```bash
rfswift container create -i sdr_full -n rf_pentest \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures \
  --record
```

### With profiles

**Quick container from a profile:**
```bash
rfswift container create --profile sdr-full -n my_sdr
```

**Profile with image override:**
```bash
rfswift container create --profile wifi -n wifi_custom -i penthertz/rfswift_resolute:sdr_full
```

**Profile with NAT isolation:**
```bash
rfswift container create --profile pentest-full -n pentest_session
```

### With devices

**All USB devices:**
```bash
rfswift container create -i sdr_full -n rtlsdr_work \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm"
```

**Multiple USB serial devices:**
```bash
rfswift container create -i hardware -n multi_device \
  -s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0 \
  -g "c 189:* rwm,c 166:* rwm"
```


### With security configuration

**Unprivileged container with specific capabilities:**
```bash
rfswift container create -i wifi -n wifi_scan \
  -u 0 \
  -a NET_ADMIN,NET_RAW \
  -t bridge
```

**With custom seccomp profile:**
```bash
rfswift container create -i pentest -n secure_assessment \
  -u 0 \
  -m ~/seccomp-profiles/restricted.json \
  -g "c 189:* rwm"
```

**Privileged mode (use sparingly):**
```bash
rfswift container create -i hardware -n hardware_debug \
  -u 1
```

### With network configuration

**Bridge network with port binding:**
```bash
rfswift container create -i web_tools -n web_server \
  -t bridge \
  -w 8080:80/tcp
```

**Multiple ports exposed and bound:**
```bash
rfswift container create -i api_server -n backend \
  -t bridge \
  -z 3000,3001,3002 \
  -w 8080:3000/tcp,8081:3001/tcp
```

**Network isolation (no network):**
```bash
rfswift container create -i analysis -n offline_analysis \
  -t none \
  -b ~/data:/root/data
```

**Custom host entries:**
```bash
rfswift container create -i penthertz/rfswift_resolute:telecom -n network_test \
  -x "device1.local:192.168.1.10,device2.local:192.168.1.11"
```

### With session recording

**Record with auto-generated filename:**
```bash
rfswift container create -i bluetooth -n bt_assessment \
  --record
```

**Record with custom filename:**
```bash
rfswift container create -i sdr_full -n client_pentest \
  --record \
  --record-output client-assessment-2024-01-12.cast
```

**Combined: Recording with security and devices:**
```bash
rfswift container create -i wifi -n wifi_audit \
  -u 0 \
  -a NET_ADMIN,NET_RAW \
  -t bridge \
  -s /dev/wlan0:/dev/wlan0 \
  --record \
  --record-output wifi-audit-session.cast
```

### With remote desktop

**Enable noVNC desktop (browser-based GUI):**
```bash
rfswift container create -i sdr_full -n sdr_desktop --desktop
```
Then open `http://127.0.0.1:6080` in your browser to access the GUI desktop.

**Expose desktop on all interfaces:**
```bash
rfswift container create -i sdr_full -n sdr_desktop \
  --desktop --desktop-config "http:0.0.0.0:6080"
```

**Use raw VNC instead of noVNC:**
```bash
rfswift container create -i sdr_full -n sdr_desktop \
  --desktop --desktop-config "vnc::5900"
```
Then connect with a VNC client (e.g., TigerVNC, RealVNC) to `127.0.0.1:5900`.

**Custom port:**
```bash
rfswift container create -i sdr_full -n sdr_desktop \
  --desktop --desktop-config "http:0.0.0.0:8080"
```

**With VNC password (recommended when exposing on network):**
```bash
rfswift container create -i sdr_full -n sdr_desktop \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mysecretpass"
```

**Desktop with SDR devices and no X11 forwarding:**
```bash
rfswift container create -i sdr_full -n sdr_desktop \
  --desktop \
  --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mysecretpass" \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  --no-x11
```

### With VPN

**Tailscale mesh (interactive login):**
```bash
rfswift container create -i sdr_full -n mesh_sdr --vpn tailscale
```

**Tailscale with auth key (headless):**
```bash
rfswift container create -i sdr_full -n mesh_sdr \
  --vpn tailscale:tskey-auth-xxxxxxxxxxxx
```

**WireGuard tunnel (requires privileged mode):**
```bash
rfswift container create -i sdr_full -n vpn_sdr \
  -u 1 \
  --vpn wireguard:./wg0.conf
```

**OpenVPN with bridge network:**
```bash
rfswift container create -i sdr_full -n corp_sdr \
  -u 1 \
  -t bridge \
  --vpn openvpn:./client.ovpn
```

**Netbird mesh (interactive login):**
```bash
rfswift container create -i sdr_full -n nb_sdr --vpn netbird
```

**VPN + Remote Desktop + SDR (full remote setup):**
```bash
rfswift container create -i sdr_full -n remote_sdr \
  -u 1 \
  --vpn tailscale \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  --record
```

### Complex Real-World examples

**Complete SDR assessment setup:**
```bash
rfswift container create -i sdr_full -n site_survey \
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
rfswift container create -i bluetooth -n bt_pentest \
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
rfswift container create -i sdr_full -n high_perf_capture \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures
```

---

## Detailed option explanations

### Image selection (`-i, --image`)

Specifies which RF Swift image to use for the container.

**Formats:**
```bash
# Full registry path
-i penthertz/rfswift_resolute:sdr_full

# Short name (resolves to penthertz/rfswift_resolute:IMAGE)
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

### Container naming (`-n, --name`)

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

### Realtime mode (`--realtime`)

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
rfswift container create -i sdr_full -n sdr_work --realtime

# Verify inside container
rfswift container shell -c sdr_work -e "ulimit -r"
# Output: 95

# Use real-time scheduling
rfswift container shell -c sdr_work
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 output.bin
```

### GPU passthrough (`--gpus`)

Passes GPU devices into the container for hardware-accelerated workloads. Requires the appropriate GPU runtime (NVIDIA Container Toolkit, ROCm, etc.) installed on the host.

| Specifier | Meaning |
|-----------|---------|
| `all` | All available GPUs |
| `0` | First GPU only |
| `0,1` | First and second GPU |

```bash
# All GPUs
rfswift container create -i sdr_full -n gpu_sdr --gpus all

# Specific GPU
rfswift container create -i sdr_full -n gpu_sdr --gpus 0

# Combined with other features
rfswift container create -i sdr_full -n gpu_sdr --gpus all --realtime --desktop
```

See [`gpus`](/docs/commands/gpu) for full documentation, prerequisites, and troubleshooting.

### Custom ulimits (`--ulimits`)

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

### Privilege level (`-u, --privileged`)

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

### Device mappings (`-s, --devices`)

Make specific host devices available in the container. Serial ports (`/dev/ttyACM*`, `/dev/ttyUSB*`, `/dev/ttyAMA*`) named here are **hot-pluggable** on Docker and rootful Podman: plugged in at creation they are mapped, absent they are attached on demand when you plug them in and open a shell. Before creation RF Swift lists the devices this engine cannot map on your host (rootless Podman root-only nodes, a device absent from the Lima VM, USB on Docker Desktop for macOS) and asks once before dropping them.

**Format:** `host_device:container_device` or just `host_device` (same path in container)

```bash
# Single device
-s /dev/ttyUSB0:/dev/ttyUSB0

# Multiple devices
-s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0
```

{{< callout type="info" >}}
**Cgroups + Devices**: You need BOTH cgroup rules and device mappings. Cgroups allow access to device types, mappings make specific devices available. For USB, the default `/dev/bus/usb` mapping with `c 189:* rwm` is what makes a device reachable; a bind mount alone lists the nodes but cannot open them, and `--privileged` is not required. RF Swift checks this before creating the container.
{{< /callout >}}

### Volume bindings (`-b, --bind`)

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

### Network modes (`-t, --network`)

Configure container network isolation:

| Mode | Description | Use Case |
|------|-------------|----------|
| `host` | No isolation (default) | Most RF tools, full network access |
| `nat` | Isolated NAT network (RF Swift managed) | Pentesting, desktop mode, network isolation |
| `nat:NAME` | Join an existing NAT network | Multiple containers on same subnet |
| `bridge` | Default Docker bridge | Web services, API servers |
| `none` | No network access | Offline analysis, malware analysis |
| `container:NAME` | Share network with another container | Linked services |

```bash
# Full network access (default)
-t host

# Isolated NAT network (auto-creates subnet)
-t nat

# Join existing NAT network
-t nat:rfswift_nat_mylab

# Isolated with port forwarding
-t bridge -w 8080:80/tcp

# Complete isolation
-t none
```

{{< callout type="info" >}}
**NAT mode** creates an isolated network with its own subnet. RF Swift automatically manages the network lifecycle. When using NAT with desktop mode, port bindings are configured automatically so you can access the desktop from your browser on the host.
{{< /callout >}}

### Port configuration

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

### Display options

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

**Disable X11 (`--no-x11`)**: Disables X11 forwarding and removes the `/tmp/.X11-unix` socket binding from the container for improved security.
```bash
--no-x11    # No X11 forwarding, no X11 socket binding
```

### Remote desktop (`--desktop`)

Enable a remote desktop inside the container, accessible via a web browser (noVNC) or a VNC client. This is useful for running GUI tools (SDR++, SDRangel, GQRX, etc.) without requiring X11 forwarding on the host.

When enabled, RF Swift:
- Injects `RFSWIFT_DESKTOP_PROTO`, `RFSWIFT_DESKTOP_HOST`, and `RFSWIFT_DESKTOP_PORT` environment variables into the container
- Uses an entrypoint wrapper that starts the VNC server before launching the shell
- Sets up port bindings automatically for non-host network modes
- Prints the access URL to the terminal
- Adds an `org.rfswift.desktop` label to the container

**Desktop config format (`--desktop-config`):** `proto:host:port`

All parts are optional and fall back to defaults:

| Part | Options | Default |
|------|---------|---------|
| `proto` | `http` (noVNC), `vnc` (raw VNC) | `http` |
| `host` | Bind address | `127.0.0.1` |
| `port` | Listen port | `6080` (http) or `5900` (vnc) |

```bash
# Browser access (default, localhost only)
--desktop
--desktop --desktop-config "http:0.0.0.0:6080"

# VNC client access
--desktop --desktop-config "vnc::5900"

# Custom port on all interfaces
--desktop --desktop-config "http:0.0.0.0:8080"
```

**Password protection (`--desktop-pass`):**

Set a VNC password to secure the desktop session. Recommended when binding to `0.0.0.0`:

```bash
# Password-protected desktop on all interfaces
--desktop --desktop-config "http:0.0.0.0:6080" --desktop-pass "mysecretpass"
```

When a password is set, both noVNC (browser) and VNC clients will prompt for it before connecting. Without a password, access is unauthenticated. That is safe when bound to `127.0.0.1` (the default), but a security risk when exposed on the network.

**SSL/TLS encryption (`--desktop-ssl`):**

Enable SSL/TLS to encrypt the desktop connection. A self-signed certificate is automatically generated inside the container:

```bash
# SSL-encrypted desktop with password
--desktop --desktop-config "http:0.0.0.0:6080" --desktop-pass "mysecretpass" --desktop-ssl

# SSL with VNC client
--desktop --desktop-config "vnc:0.0.0.0:5900" --desktop-pass "mysecretpass" --desktop-ssl
```

With SSL enabled, noVNC uses `https://` and VNC clients connect via `vncs://` (TLS-wrapped VNC). The self-signed certificate will trigger a browser warning on first connection, which is expected.

The password and SSL can also be set in the config file (`~/.config/rfswift/config.ini`):
```ini
[desktop]
password = mysecretpass
ssl = true
```

{{< callout type="info" >}}
**Tip**: Combine `--desktop` with `--no-x11` when you only need browser-based GUI access. This removes the X11 socket binding entirely, which improves security and avoids the need for `xhost` or X11 configuration on the host.
{{< /callout >}}

### Recording options

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

**Auto-generated filenames:** When `--record` is used without `--record-output`, the filename is automatically generated as:
```
rfswift-run-{container_name}-{YYYYMMDD-HHMMSS}.cast
```

**Recording indicator:** During recording, the terminal title changes to `⏺ REC | RF Swift` as a visual reminder. The environment variable `RFSWIFT_RECORDING=1` is also set inside the container, which can be used by scripts to detect recording mode.

---

## Interactive wizard

When you run `rfswift container create` without specifying `-i` (image) and `-n` (name) in an interactive terminal, RF Swift launches a step-by-step guided wizard using a TUI (Terminal User Interface).

**Launch the wizard:**
```bash
rfswift container create
```

### Wizard steps

The wizard guides you through the following steps:

0. **Profile Selection** (if profiles are available) -- Choose a profile to pre-fill settings, or select "No profile" for manual configuration. If a profile is selected, you're asked whether to **use it as-is** (fast path: only asks for container name) or **customize** all settings with profile values pre-filled.

1. **Image Selection** -- If a profile was selected, its image appears first with all local images available as alternatives, plus "Other (enter manually)". Without a profile, shows a scrollable picker of local images.

2. **Container Name** -- Required text input (placeholder: `my_sdr`).

3. **Workspace Directory** -- Select how to mount the shared workspace:
 - **Auto** (default): `~/rfswift-workspace/<name>/` -> `/workspace`
 - **Custom path**: Enter a host directory to mount as `/workspace`
 - **Current directory**: Mount `$PWD` as `/workspace`
 - **Disable**: No workspace mount

4. **Volume Bindings** -- Asks if you want to add *additional* volume bindings beyond the workspace.

5. **Device Mappings** -- Asks if you want to add device mappings, then prompts for comma-separated device paths.

6. **Port Mappings** -- Simplified port binding step. Enter `hostPort:containerPort` pairs (e.g., `8080:80,4443:443`). RF Swift auto-generates both exposed ports and port bindings from this input.

7. **Network Mode** -- Select from host, NAT (create new isolated network), join existing NAT network, or bridge.

8. **Feature Toggles** -- Multi-select checklist:
 - Remote Desktop (VNC/noVNC)
 - Desktop SSL/TLS
 - Disable X11 forwarding
 - Privileged mode
 - Realtime mode (audio/SDR)
 - VPN (WireGuard/OpenVPN/Tailscale/Netbird)

9. **Desktop Port Configuration** (if desktop enabled with non-host network) -- Choose the host bind address (`127.0.0.1` or `0.0.0.0`) and port for the desktop service.

10. **VPN Configuration** (if VPN selected) -- Prompts for VPN type, then type-specific input.

11. **Capabilities** -- Multi-select from 18 common Linux capabilities with descriptions (NET_ADMIN, NET_RAW, SYS_RAWIO, SYS_ADMIN, SYS_PTRACE, SYS_NICE, etc.).

12. **Cgroup Rules** -- Multi-select from common device cgroup rules with descriptions:
 - `c 189:* rwm`: USB devices (SDR dongles, serial adapters)
 - `c 188:* rwm`: USB serial (ttyUSB)
 - `c 166:* rwm`: ACM modems (ttyACM)
 - `c 116:* rwm`: ALSA sound devices
 - `c 226:* rwm`: DRI/GPU rendering
 - `c 13:* rwm`: Input devices (HID, joystick)
 - `c 137:* rwm`: VHCI (virtual HCI for Bluetooth)
 - And more...

13. **USB Devices** (macOS with `--engine lima` only) -- Asks whether to attach USB devices to the Lima VM, then shows a multi-select picker of discovered host USB devices.

14. **Configuration Recap** -- Displays a summary of all selected options, including workspace path.

15. **CLI Equivalent** -- Shows the equivalent `rfswift container create` command.

16. **Final Confirmation** -- `Create this container?` Yes/No prompt.

### Example: wizard with profile (fast path)

```
? Start from a profile?
  > sdr-full: Full SDR suite, realtime and USB hotplug

? Use profile 'sdr-full' as-is?
  > Yes, use as-is

? Container name: my_sdr_work

──────────────────────────────────────────────────
Container Configuration (from profile):
  Image:    penthertz/rfswift_resolute:sdr_full
  Name:     my_sdr_work
  Network:  host
  Realtime: enabled
──────────────────────────────────────────────────

? Create this container? Yes
```

### Example: wizard without profile

```
? Start from a profile?
  > No profile (manual configuration)

? Select an image:
  > penthertz/rfswift_resolute:sdr_full

? Container name: my_sdr_work

? Add volume bindings? Yes
? Volume bindings: ~/captures:/root/captures

? Add device mappings? Yes
? Device paths: /dev/bus/usb

? Expose ports? No

? Network mode: Host

? Select features:
  [x] Realtime mode (audio/SDR)
  [x] VPN (WireGuard/OpenVPN/Tailscale/Netbird)

? VPN type: tailscale
? Auth key (optional):

? Add extra Linux capabilities? Yes
? Select capabilities:
  [x] NET_ADMIN - network config, monitor mode, packet capture
  [x] NET_RAW - raw sockets, packet injection

? Add device cgroup rules? Yes
? Select cgroup rules:
  [x] c 189:* rwm - USB devices (SDR dongles, serial adapters)

──────────────────────────────────────────────────
Container Configuration:
  Image:        penthertz/rfswift_resolute:sdr_full
  Name:         my_sdr_work
  Bindings:     ~/captures:/root/captures
  Devices:      /dev/bus/usb
  Capabilities: NET_ADMIN,NET_RAW
  Cgroups:      c 189:* rwm
  Realtime:     enabled
  VPN:          tailscale
──────────────────────────────────────────────────

Equivalent CLI command:
  rfswift container create -i penthertz/rfswift_resolute:sdr_full -n my_sdr_work \
    -b ~/captures:/root/captures -s /dev/bus/usb \
    -a NET_ADMIN,NET_RAW -g "c 189:* rwm" --realtime --vpn tailscale

? Create this container? Yes
```

{{< callout type="info" >}}
**Non-interactive mode**: The wizard only appears in interactive terminals. When piping or scripting, always provide `-i` and `-n` flags explicitly.
{{< /callout >}}

---

## Common patterns

### Quick container for testing

```bash
# Minimal setup
rfswift container create -i sdr_light -n test

# With one device
rfswift container create -i sdr_full -n quick_test -s /dev/bus/usb:/dev/bus/usb
```

### High-Performance SDR container

```bash
rfswift container create -i sdr_full -n high_perf \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures
```

### Repeatable assessment container

```bash
# Save as script: setup_assessment.sh
#!/bin/bash
CONTAINER_NAME="assessment_$(date +%Y%m%d)"
rfswift container create -i pentest -n "$CONTAINER_NAME" \
  -u 0 \
  --realtime \
  -t bridge \
  -b ~/assessments:/root/work \
  --record \
  --record-output "${CONTAINER_NAME}.cast"
```

### Development container

```bash
rfswift container create -i sdr_full -n sdr_dev \
  -b ~/code:/root/code \
  -b ~/.ssh:/root/.ssh:ro \
  -b ~/.gitconfig:/root/.gitconfig:ro \
  -w 8888:8888/tcp
```

### Remote desktop SDR workstation

```bash
rfswift container create -i sdr_full -n remote_sdr \
  --desktop \
  --desktop-config "http:0.0.0.0:6080" \
  --no-x11 \
  --realtime \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  -b ~/captures:/root/captures \
  --record
```

### Isolated analysis container

```bash
rfswift container create -i reversing -n isolated_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro \
  -b ~/output:/root/output \
  --no-x11
```

---

## Troubleshooting

### Container name already exists

**Error:** `container name 'X' is already in use. Use a different name with -n, or exec into the existing container with: rfswift exec -c X`

**Solution:**
```bash
# Exec into the existing container
rfswift container shell -c container_name

# Or remove it and recreate
rfswift container rm -c container_name

# Or use a different name
rfswift container create -i image -n container_name_2
```

### Image not found

**Error:** `Error: No such image: penthertz/rfswift_resolute:image_name`

**Solution:**
```bash
# Pull image first
rfswift image pull -i image_name

# Or let run pull automatically (if network available)
rfswift container create -i image_name -n container
```

### Device not accessible

**Problem:** Device binding added but can't access device in container

**Solution:**
```bash
# Add cgroup rule for device type
rfswift container create -i image -n container \
  -s /dev/ttyUSB0:/dev/ttyUSB0 \
  -g "c 189:* rwm"

# Or add dynamically
rfswift config cgroups add -c container -r "c 189:* rwm"
```

### Permission denied for device

**Problem:** Permission denied when accessing device

**Solution:**
```bash
# Check host permissions
ls -l /dev/your_device

# Add user to device group on host
sudo usermod -aG dialout $USER
newgrp dialout

# Then run container
rfswift container create -i image -n container -s /dev/your_device:/dev/your_device
```

### Network operations fail

**Problem:** Wi-Fi/Bluetooth tools can't configure interfaces

**Solution:**
```bash
# Add network capabilities
rfswift container create -i wifi -n wifi_tools \
  -a NET_ADMIN,NET_RAW \
  -t bridge
```

### X11 not working

**Problem:** GUI applications won't start or display

**Solution:**
```bash
# On host (Linux)
xhost +local:

# Then run container
rfswift container create -i image -n container -d DISPLAY=$DISPLAY

# Or disable X11 for headless operation
rfswift container create -i image -n container --no-x11
```

### Audio not working

**Problem:** No audio output from container

**Solution:**
```bash
# Enable audio support first
rfswift host audio enable

# Check PulseAudio is running
ps aux | grep pulse

# Run container with correct server
rfswift container create -i image -n container -p tcp:127.0.0.1:34567
```

### Port already in use

**Problem:** Can't bind port - already in use

**Solution:**
```bash
# Check what's using the port
sudo lsof -i :8080

# Use different host port
rfswift container create -i image -n container -w 8081:80/tcp

# Or stop conflicting service
sudo systemctl stop service_name
```

### Buffer underruns with SDR

**Problem:** Experiencing sample drops or buffer underruns

**Solution:**
```bash
# Enable realtime mode
rfswift container create -i sdr_full -n sdr_work --realtime

# Or add to existing container
rfswift realtime enable -c existing_container

# Verify inside container
rfswift container shell -c sdr_work -e "ulimit -r"
# Should show: 95

# Use real-time scheduling
chrt -f 50 your_sdr_command
```

---

## Best practices

### 1. Use descriptive names

```bash
# Good
rfswift container create -i sdr_full -n rtlsdr_spectrum_analysis_2024_01

# Not recommended
rfswift container create -i sdr_full -n test1
```

### 2. Start unprivileged

Always start with `-u 0` and add capabilities as needed:

```bash
# Start unprivileged
rfswift container create -i wifi -n wifi_scan -u 0

# Add capabilities if needed
rfswift config capabilities add -c wifi_scan -p NET_ADMIN
```

### 3. Use realtime mode for SDR work

```bash
# Always use --realtime for SDR captures
rfswift container create -i sdr_full -n hackrf_capture --realtime
```

### 4. Use Read-Only mounts for reference data

```bash
rfswift container create -i analysis -n data_analysis \
  -b ~/samples:/root/samples:ro \
  -b ~/output:/root/output
```

### 5. Record important sessions

```bash
rfswift container create -i pentest -n client_assessment \
  --record \
  --record-output client-$(date +%Y%m%d).cast
```

### 6. Use bridge network for services

```bash
rfswift container create -i web_tools -n web_server \
  -t bridge \
  -w 127.0.0.1:8080:80/tcp
```

### 7. Organize project directories

```bash
# Create organized structure
mkdir -p /pathto/rf-assessments/{captures,projects,recordings}

# Use in containers
rfswift container create -i sdr_full -n assessment \
  -b /pathto/rf-assessments/captures:/root/captures,/pathto/rf-assessments/projects:/root/projects \
  --record-output /pathto/rf-assessments/recordings/session.cast
```

---

## Related commands

- [`profile`](/docs/commands/profile) - Manage container profiles (presets)
- [`exec`](/docs/commands/exec) - Enter an existing container
- [`stop`](/docs/commands/stop) - Stop a running container
- [`remove`](/docs/commands/remove) - Remove a container
- [`bindings`](/docs/commands/bindings) - Dynamically add devices/volumes
- [`capabilities`](/docs/commands/capabilities) - Modify capabilities after creation
- [`cgroups`](/docs/commands/cgroups) - Modify cgroup rules after creation
- [`ports`](/docs/commands/ports) - Manage ports after creation
- [`realtime`](/docs/commands/realtime) - Enable/disable realtime mode on existing containers
- [`ulimits`](/docs/commands/ulimits) - Manage ulimits on existing containers
- [VPN Inside Containers](/docs/guide/vpn) - Detailed VPN setup guide
- [Using Podman](/docs/guide/podman) - Podman-specific guidance

---

{{< callout emoji="⚡" >}}
**SDR Performance**: Use `--realtime` flag for optimal SDR performance. It automatically configures rtprio, memlock, nice ulimits and SYS_NICE capability to eliminate buffer underruns!
{{< /callout >}}

{{< callout emoji="💡" >}}
**Tip**: Use `rfswift container create --help` to see all options with their current default values from your config file.
{{< /callout >}}