---
title: "Change a container after creation"
linkTitle: "Change a container"
level: intermediate
description: "Add devices, folders, ports, capabilities, GPUs and resource limits to an existing container, without re-creating it or losing what you installed."
weight: 2
---

Forgot to share a folder, or need a Proxmark3 in a lab you created yesterday? You don't have to start over. The `rfswift config` commands change an existing container (its devices and folders, Linux capabilities, device rules, GPUs, ports and resource limits) while keeping the container, its name, its workspace and everything installed in it.

{{< callout type="info" title="Why this matters" >}}
With plain Docker most of these settings are frozen when the container is created. RF Swift edits the container's configuration for you and restarts it.
{{< /callout >}}

Prefer clicking? In the [Workbench](/docs/guide/workbench/), right-click a mission and choose **Configure...**: it is the same feature in a dialog.

## In short

| I want to… | Command |
|---|---|
| Share a folder | `rfswift config bindings add -c NAME -s ~/projects -t /root/projects` |
| Add a serial device (Proxmark3, Arduino…) | `rfswift config bindings add -c NAME -d -t /dev/ttyACM0` |
| Give network tools more rights | `rfswift config capabilities add -c NAME -p NET_ADMIN` |
| Allow a class of devices | `rfswift config cgroups add -c NAME -r "c 189:* rwm"` |
| Use the GPU | `rfswift config gpus add -c NAME -g all` |
| Open a port on the host | `rfswift config ports bind -c NAME -b 127.0.0.1:8080:80/tcp` |
| Better SDR performance | `rfswift realtime enable -c NAME` |

Every subcommand also exists at the top level (`rfswift bindings ...`, `rfswift ports ...`).

## Before you change anything

{{< callout type="warning" title="The container restarts" >}}
Whatever the engine, the container is restarted and the processes running inside are interrupted. Save your work first. A change that cannot work (for example a cgroup rule on rootless Podman) is refused before any password prompt.
{{< /callout >}}

### How the change is applied

| Engine | Method | What to expect |
|--------|--------|----------------|
| Docker on Linux | Edits the container's files under `/var/lib/docker` and restarts the Docker service | One `sudo` prompt per command (RF Swift re-runs itself as root); the container comes back running, other containers stopped by the restart are started again. No extra disk |
| Docker in the Lima VM (macOS) | Same edit, through the VM's sudo | No prompt |
| Podman | Commits the container to a snapshot image and re-creates it with the new setting | No root; one snapshot image per change. Rootless Podman cannot add cgroup rules or `mknod` |
| Any engine with `--recreate` | Commit and re-create instead of editing | Use it when you prefer not to touch the daemon's files |
| Through a remote agent (Workbench) | The same operation on the agent host | |

### Check what a container has now

- Enter it: `rfswift container shell` prints a summary (image, mounts, devices, capabilities, cgroups, ulimits, GPUs, network, ports).
- `rfswift config ulimits list -c NAME` lists the limits.
- The other groups have no `list` subcommand: use `docker inspect NAME` or `podman inspect NAME` for the raw data.

## Folders and devices (bindings)

```bash
rfswift config bindings add -c CONTAINER -s HOST_PATH -t CONTAINER_PATH      # bind mount
rfswift config bindings add -c CONTAINER -d -t /dev/ttyUSB0                  # device (source = target)
rfswift config bindings add -c CONTAINER -d -s /dev/ttyUSB0 -t /dev/ttyUSB0  # device, explicit source
rfswift config bindings rm  -c CONTAINER [-d] -t CONTAINER_PATH
```

| Flag | Description |
|------|-------------|
| `-c, --container` | Container name or ID |
| `-s, --source` | Host path (defaults to the target) |
| `-t, --target` | Path inside the container |
| `-d, --devices` | Manage a **device** mapping rather than a volume |
| `--recreate` | Commit and re-create instead of editing |

What RF Swift does with a device path:

- **`-d /dev/ttyACM0`**: a device mapping. A serial port (`/dev/ttyACM*`, `/dev/ttyUSB*`, `/dev/ttyAMA*`) added this way is attached on demand and hot-pluggable on Docker and rootful Podman (see [serial hot-plug](#serial-hot-plug)).
- **A device node without `-d`**: bind-mounted as asked, with the cgroup rule its major needs.
- **A `/dev` tree such as `/dev/bus/usb` without `-d`**: mounted with the cgroup rule that makes its nodes usable (USB major 189).

```bash
# Add a Proxmark3 to an RFID container after it was created
rfswift config bindings add -c rfid -d -t /dev/ttyACM0

# All USB devices (hot-plug friendly: the tree, not a single node)
rfswift config bindings add -c sdr -t /dev/bus/usb

# Share a project directory, then a captures directory
rfswift config bindings add -c sdr -s ~/projects -t /root/projects
rfswift config bindings add -c sdr -s ~/captures -t /root/captures

# Remove a mount, remove a device
rfswift config bindings rm -c sdr -t /root/projects
rfswift config bindings rm -c rfid -d -t /dev/ttyACM0
```

Read-only mounts are set at creation time: `rfswift container create ... -b ~/samples:/root/samples:ro`.

### Serial hot-plug

On Docker and rootful Podman, containers created by RF Swift can open serial ports through their device cgroup:

- RF Swift creates the port's node inside the container when it starts and whenever a shell opens, and removes nodes whose device is gone.
- A port that is unplugged at creation is recorded and attached on demand: plug it in, run `rfswift container shell`, and the port is there.

Switch it per container:

```bash
rfswift config serial-hotplug on  -c rfid
rfswift config serial-hotplug off -c rfid     # removes the serial cgroup rules, leaves /dev alone
```

Rootless Podman keeps the mapping but needs the port present at creation. Lima on macOS and Windows hosts forward USB devices into their VM first ([usb](/docs/commands/usb/)).

### Hot-plugging workflow

```bash
# 1. Start a container without the device
rfswift container create -i sdr_full -n sdr_work

# 2. Plug in the RTL-SDR: it is under /dev/bus/usb, mapped by default with the USB cgroup rule,
#    so rtl_test works right away in a new shell
rfswift container shell -c sdr_work -e "rtl_test -t"

# 3. A serial device (Proxmark3, Arduino) gets a node on demand
rfswift config serial-hotplug on -c sdr_work
rfswift container shell -c sdr_work -e "ls -l /dev/ttyACM0"
```

{{< callout type="info" >}}
Earlier RF Swift versions could leave an empty, root-owned `/dev/ttyACM0` directory on the host when a device node was bind-mounted while unplugged. `rfswift host devclean` finds and removes such directories.
{{< /callout >}}

## Capabilities

Capabilities are extra rights for the tools inside, such as configuring a network interface.

```bash
rfswift config capabilities add -c CONTAINER -p CAPABILITY
rfswift config capabilities rm  -c CONTAINER -p CAPABILITY
```

- One capability per command (`-p NET_ADMIN`).
- Names are compared in their short form, so removing a capability the daemon reports as `CAP_NET_ADMIN` works, and adding one twice does not duplicate it.

| Capability | Use case | Risk |
|-----------|----------|------|
| `NET_ADMIN` | Network configuration, monitor mode, Wi-Fi and Bluetooth tools | Medium |
| `NET_RAW` | Raw sockets, packet injection | Medium |
| `SYS_PTRACE` | Debugging, memory inspection | High |
| `SYS_NICE` | Realtime scheduling (added by `--realtime`) | Low |
| `NET_BIND_SERVICE` | Bind ports below 1024 | Low |
| `SYS_RAWIO` | Raw I/O for hardware tools | High |
| `DAC_OVERRIDE`, `CHOWN` | File permission and ownership changes | High / Medium |
| `SYS_ADMIN`, `SYS_MODULE` | Mounts, kernel modules: nearly root | Very high |

```bash
# Wi-Fi monitor mode and injection
rfswift config capabilities add -c wifi_tools -p NET_ADMIN
rfswift config capabilities add -c wifi_tools -p NET_RAW

# Debugging in a reversing container, removed when done
rfswift config capabilities add -c reversing -p SYS_PTRACE
rfswift config capabilities rm  -c reversing -p SYS_PTRACE
```

{{< callout type="warning" >}}
`SYS_ADMIN` and `SYS_MODULE` are close to full root on the host. Add them only when a tool cannot work otherwise, and remove them immediately after. `rfswift audit CONTAINER` lists the capabilities a container carries.
{{< /callout >}}

## Cgroup device rules

A device rule allows the container to use a whole class of devices, identified by its **major** number.

```bash
rfswift config cgroups add -c CONTAINER -r "c 189:* rwm"
rfswift config cgroups rm  -c CONTAINER -r "c 189:* rwm"
```

- One rule per command.
- A rule is `type major:minor permissions`: `c` (character) or `b` (block), the device numbers (`*` for any), and `r` (read), `w` (write), `m` (mknod).
- RF Swift auto-detects cgroup v1 and v2.
- Rootless Podman cannot set device rules at all: they are dropped with a warning, and access depends on the host udev rules (`rfswift host udev`).

To find a device's major number, list it on the host:

```bash
ls -l /dev/ttyUSB0
# crw-rw---- 1 root dialout 188, 0 ... /dev/ttyUSB0    <- major 188
```

| Major | Devices | Typical use |
|-------|---------|-------------|
| 189 | USB devices (`/dev/bus/usb`) | SDR dongles, HackRF, Proxmark over USB |
| 166 | CDC-ACM serial (`/dev/ttyACM*`) | Proxmark3, Arduino, many dev boards |
| 188 | USB serial converters (`/dev/ttyUSB*`) | FTDI, CH340, CP210x adapters |
| 116 | ALSA sound | Audio capture and playback |
| 226 | DRI (GPU) | OpenCL, hardware rendering |
| 81 | Video4Linux | Webcams, video capture |
| 13 | Input devices | HID, joysticks |
| 137 | VHCI | Virtual Bluetooth HCI |
| 89 | I2C | Hardware interfaces |

```bash
rfswift config cgroups add -c sdr -r "c 189:* rwm"      # USB
rfswift config cgroups add -c rfid -r "c 166:* rwm"     # ACM serial
rfswift config cgroups add -c gpu_work -r "c 226:* rwm" # DRI
```

## GPU requests

```bash
rfswift config gpus add -c CONTAINER [-g all|0,1]
rfswift config gpus rm  -c CONTAINER [-g SPEC]      # empty spec removes all
```

- Requires the vendor runtime on the host (NVIDIA Container Toolkit, ROCm, ...).
- The request is stored as given (`all`, `0,1`) and survives a re-creation.

```bash
rfswift config gpus add -c sdr_gpu -g all
rfswift config gpus rm  -c sdr_gpu
```

See [gpus](/docs/commands/gpu/).

## Ports

```bash
rfswift config ports expose   -c CONTAINER -p 8080/tcp                 # visible to other containers
rfswift config ports unexpose -c CONTAINER -p 8080/tcp
rfswift config ports bind     -c CONTAINER -b 8080:80/tcp              # published on the host
rfswift config ports bind     -c CONTAINER -b 127.0.0.1:8080:80/tcp    # localhost only
rfswift config ports unbind   -c CONTAINER -b 8080:80/tcp
```

- Bindings accept `HOST:CONTAINER/proto`, `CONTAINER/proto:HOST` and `IP:HOST:CONTAINER/proto`.
- Publishing a port needs a non-host network mode (`-t bridge` or `-t nat` at creation). In host mode the container already shares the host's ports.

```bash
# A web UI reachable from the host only
rfswift config ports bind -c web -b 127.0.0.1:8080:80/tcp

# A service other containers on the same NAT network can reach
rfswift config ports expose -c api -p 3000/tcp
```

## Ulimits and realtime

For SDR work, use the one-command form:

```bash
rfswift realtime enable -c CONTAINER     # SYS_NICE, rtprio=95, memlock=unlimited, nice=40
rfswift realtime status -c CONTAINER
rfswift realtime disable -c CONTAINER
```

Or set individual limits:

```bash
rfswift config ulimits add  -c CONTAINER -n rtprio  -v 95
rfswift config ulimits add  -c CONTAINER -n memlock -v -1
rfswift config ulimits add  -c CONTAINER -n nofile  -v 1024:65536
rfswift config ulimits list -c CONTAINER
rfswift config ulimits rm   -c CONTAINER -n nofile
```

Rootless Podman skips limits above your host hard limits instead of failing the start.

## Real-world workflows

### Multi-SDR site survey

```bash
rfswift container create -i sdr_full -n site_survey --realtime
# HackRF plugged in later: already reachable through /dev/bus/usb
rfswift container shell -c site_survey -e "hackrf_info"
# a GPS receiver on a USB-serial adapter
rfswift config bindings add -c site_survey -d -t /dev/ttyUSB0
rfswift config bindings add -c site_survey -s ~/survey -t /root/survey
```

### Secure wireless assessment

```bash
rfswift container create -i wifi -n wifi_assess -t nat
rfswift config capabilities add -c wifi_assess -p NET_ADMIN
rfswift config capabilities add -c wifi_assess -p NET_RAW
rfswift config ports bind -c wifi_assess -b 127.0.0.1:8080:80/tcp
# ... assessment ...
rfswift config capabilities rm -c wifi_assess -p NET_ADMIN
rfswift config capabilities rm -c wifi_assess -p NET_RAW
```

### Hardware reverse engineering

```bash
rfswift container create -i hardware -n rev_eng
rfswift config bindings add -c rev_eng -d -t /dev/ttyUSB0        # JTAG / UART adapter
rfswift config bindings add -c rev_eng -d -t /dev/ttyACM0        # dev board, hot-pluggable
rfswift config capabilities add -c rev_eng -p SYS_PTRACE
rfswift config bindings add -c rev_eng -s ~/projects/device-re -t /root/work
```

### Teaching lab

```bash
rfswift container create -i sdr_light -n student_lab -t nat
rfswift config bindings add -c student_lab -s ~/student-projects -t /root/projects
rfswift config ports bind -c student_lab -b 8888:8888/tcp        # Jupyter
```

## Troubleshooting

### The device isn't accessible after binding

The node is mapped but its major is not allowed. Add the rule (`rfswift config cgroups add -c NAME -r "c 189:* rwm"`), or map the whole `/dev/bus/usb` tree, which carries the rule. On rootless Podman, install `rfswift host udev` so your user may open the node on the host.

### A capability doesn't take effect

Check with `rfswift container shell -c NAME -e "capsh --print"`. Some tools need two capabilities (`NET_ADMIN` and `NET_RAW` for injection).

### The port is already in use

Find the owner with `sudo lsof -i :8080` on the host, then bind another host port (`-b 8081:80/tcp`).

### The container won't restart after a change

`docker logs NAME` (or `podman logs`) shows why. A missing device that was mapped explicitly is the usual cause: remove the mapping (`rfswift config bindings rm -c NAME -d -t /dev/...`) or plug the device in.

### Permission denied on the Docker files

The `config` commands ask for `sudo` on Linux Docker. If you cannot escalate, use `--recreate`.

## Security best practices

- **Least privilege**: start unprivileged, add capabilities and devices as needed, remove them when the task is done. `rfswift audit NAME` shows what a container carries.
- **Temporary escalation**: `capabilities add`, do the work, `capabilities rm`.
- **Network isolation**: `-t nat` or `-t bridge` at creation, then publish only the ports you need on `127.0.0.1`.
- **Devices**: prefer the USB tree over `--privileged`; privileged mode is never required for USB access.

## Compared with plain Docker

| Task | Plain Docker | RF Swift |
|------|--------------|----------|
| Add a bind mount | Re-create the container | `config bindings add` |
| Add a device | Re-create, or `--privileged` | `config bindings add -d`, serial hot-plug |
| Change capabilities | Re-create | `config capabilities add` / `rm` |
| Publish a port | Re-create | `config ports bind` |
| Realtime limits | `--ulimit` at creation | `realtime enable` any time |
| Keep tools installed in the container | Commit by hand first | Kept (Docker edit) or snapshotted for you (Podman) |
