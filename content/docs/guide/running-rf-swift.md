---
title: Running RF Swift
weight: 1
next: /docs/guide/container-management/
prev: /docs/quick-start
cascade:
  type: docs
---

# Important settings

RF Swift provides a streamlined command line to manage containers and native Nix environments for RF and hardware security work. This guide covers the essential commands and workflows.

{{< tabs items="Docker,Podman,Nix" >}}
  {{< tab >}}
{{< callout type="info" >}}
**Docker on Linux** talks to a root-owned socket. Instead of `sudo rfswift ...`, grant your user access once:

```bash
rfswift host docker-access     # docker group + a socket ACL, effective right away, no logout
```

Docker Desktop on macOS and Windows needs nothing. Members of the `docker` group are root-equivalent on the host.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
{{< callout type="info" >}}
**Podman runs rootless by default**: no `sudo`, no daemon, no group. Make sure your subordinate UID/GID ranges exist, and install RF Swift's udev rules so your user may open the RF hardware (rules inside a container are never evaluated):

```bash
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER
rfswift host udev
```
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
{{< callout type="info" >}}
**The Nix engine** runs the same tool sets natively, as your user, with no container. Select it per command with `--engine nix`, per session with `RFSWIFT_ENGINE=nix`, or permanently with `engine = nix` in `config.ini`. See the [Nix engine guide](/docs/guide/nix-engine).
{{< /callout >}}
  {{< /tab >}}
{{< /tabs >}}

RF Swift auto-detects the available container engine (Docker, Podman, Lima). Force one with `rfswift --engine podman ...`; the precedence is the flag, then `RFSWIFT_ENGINE`, then `[general] engine` in the config file.

## Command overview

`rfswift --help` groups the commands by resource:

```
Containers:
  container    Create and manage RF Swift containers

Images and portability:
  image        Manage container images

Native Nix environments:
  env          Create and manage native Nix environments

Runtime configuration:
  bindings       Manage devices and volumes bindings
  capabilities   Manage container capabilities
  cgroups        Manage container cgroup rules
  config       Configure container devices, privileges, ports and resources
  gpus           Manage container GPU device requests
  ports          Manage container ports
  ulimits        Manage container ulimits

Networking:
  network      Manage container networks

Devices (USB / host):
  host         Host configuration (setup, udev rules, Docker access, audio)
  usb          Attach/detach USB devices to a container (macOS/Windows)

Security:
  audit        Audit a Nix environment, a container image, or a container for security
  report       Generate assessment reports

Remote access:
  agent        Serve RF Swift engines to authenticated remote clients

System & maintenance:
  cleanup      Clean up containers and images
  completion   Generate a shell completion script
  doctor       Check system environment and configuration
  engine       Container engine information and management
  log          Record and replay terminal sessions
  profile      Manage container profiles
  realtime     Manage realtime mode for SDR operations
  system       Maintain and diagnose the RF Swift host
  update       Update RF Swift

Flags:
  -q, --disconnect      Don't query updates (disconnected mode)
      --engine string   Engine to use: auto, docker, podman, lima, or nix (default "auto")
      --gpu             Use the GPU-accelerated Lima VM on macOS Apple Silicon (krunkit/Vulkan)
  -v, --version         version for rfswift
```

The commands you used before v4 (`rfswift run`, `rfswift exec`, `rfswift images pull`, `rfswift nix install`, ...) still work and print a notice with the new spelling. The full mapping is in the [command reference](/docs/commands).

## Core workflows

### 1. Keeping RF Swift updated

RF Swift checks for a new release at start (skip it with `-q`). Update with:

```bash
rfswift update
```

On a deb, rpm, pacman or Homebrew install, `update` tells you to upgrade through your package manager instead of overwriting the packaged binary. `rfswift --version` prints the version without touching the network.

### 2. Creating and running containers

```bash
rfswift container create -i sdr_full -n my_sdr_container
```

Short image names resolve through the `repotag` of your `config.ini` (`penthertz/rfswift_resolute` by default). The container gets a workspace (`~/rfswift-workspace/my_sdr_container/` on the host, `/workspace` inside), the USB tree, sound, display and the host audio server, and opens a `zsh` shell. Without `-i` and `-n` the interactive wizard walks you through profiles, image, workspace, mounts, devices, ports, network and features.

**Profiles** bundle image, network, features, devices and rules into a preset:

```bash
rfswift profile init                              # generate the built-in presets
rfswift profile list
rfswift container create --profile sdr-full -n my_sdr
```

**Realtime mode** for SDR captures (rtprio, memlock, `SYS_NICE`):

```bash
rfswift container create -i sdr_full -n my_sdr_container --realtime
```

**Session recording** in asciinema format:

```bash
rfswift container create -i sdr_full -n my_sdr_container --record
rfswift container create -i sdr_full -n my_sdr_container --record --record-output my-session.cast
```

During a recording the terminal title reads "REC | RF Swift" and `RFSWIFT_RECORDING=1` is set inside the container.

### 3. Finding and re-entering containers

```bash
rfswift container last            # containers RF Swift created, most recent first
rfswift container shell           # picker, or the most recent container
rfswift container shell -c my_sdr_container
rfswift container shell -c my_sdr_container -w /root/projects --record
rfswift container shell -c my_sdr_container -e "rtl_test -t"    # one command, no shell
```

A stopped container is started before you enter it. `rfswift container stop -c NAME` stops it; `rfswift container rm -c NAME` removes it (the workspace stays on the host).

### 4. Container lifecycle

```bash
rfswift container commit -c my_container -i my_new_image          # save changes as an image
rfswift container rename -n old_name -d new_name
rfswift container upgrade -c my_container -r /root/captures        # newer image, keep a directory
rfswift container rm -c container_name
rfswift image rm -i penthertz/rfswift_resolute:tag_name
```

### 5. Installing more tools

Every image ships install functions for tools that are not preinstalled. Pick one from a searchable list, or name it:

```bash
rfswift container install -c my_container
rfswift container install -c my_container -i sdrpp_soft_install
```

Failures now surface with the tail of the build output. Commit the container afterwards if you want to keep the result as an image.

### 6. Session recording and playback

```bash
rfswift log replay -i session.cast            # or pick from the current directory
rfswift log replay -i session.cast -s 2.0     # 2x
rfswift log list --dir ~/recordings
rfswift log start -o my-session.cast          # record outside a container; rfswift log stop ends it
```

Recordings are `.cast` files (asciinema), also produced by the Workbench terminals, and are inventoried by `rfswift report generate`.

### 7. Devices and resources

**Audio**: on Linux and macOS the host PulseAudio/PipeWire TCP module is loaded automatically whenever a container starts, and `rfswift host audio enable` does it by hand (as your user, never root); `host audio unload` removes it. Windows uses WSLg's audio socket and needs nothing.

**Devices and mounts after creation** (details in [Dynamic container management](/docs/guide/container-management)):

```bash
rfswift config bindings add -c my_container -d -t /dev/ttyUSB0            # a device, hot-pluggable serial
rfswift config bindings add -c my_container -s ~/projects -t /root/projects
rfswift config bindings rm  -c my_container -t /root/projects
rfswift config capabilities add -c my_container -p NET_ADMIN
rfswift config cgroups add -c my_container -r "c 226:* rwm"
rfswift config ports bind -c my_container -b 127.0.0.1:8080:80/tcp
```

**Realtime** on an existing container:

```bash
rfswift realtime enable  -c my_sdr_container
rfswift realtime status  -c my_sdr_container
rfswift realtime disable -c my_sdr_container
```

Inside: `chrt -f 50 rtl_sdr -f 433920000 -s 2048000 out.bin`, and `ulimit -r` shows 95.

{{< tabs items="Docker device notes,Podman device notes" >}}
  {{< tab >}}
Device passthrough works natively. The USB tree is mapped by default with the USB cgroup rule, serial ports are hot-pluggable, and `-u 1` (privileged) is never needed for USB.
  {{< /tab >}}
  {{< tab >}}
Rootless Podman cannot set cgroup device rules or create nodes, so RF Swift drops the rules with a warning, leaves root-only nodes out, skips realtime limits above your host limits, and requires serial ports to be present at creation. Install `rfswift host udev` so your user may open the hardware on the host; your groups (`dialout`, `plugdev`) are kept inside the container with the crun runtime.
  {{< /tab >}}
{{< /tabs >}}

### 8. Network configuration

| Mode | Description |
|------|-------------|
| `host` | No network isolation (default) |
| `nat` | RF Swift managed NAT network with automatic subnet allocation |
| `nat:NAME` | Join a named NAT network shared by several containers |
| `bridge` | The engine's default bridge |
| `none` | No network |
| `container:NAME` | Share another container's network |

```bash
rfswift container create -i bluetooth -n my_container -t bridge -w 127.0.0.1:8000:80/tcp
rfswift container create -i sdr_full -n sdr_work -t nat:lab_network
rfswift container create -i bluetooth -n bt_work -t nat:lab_network
rfswift network list
rfswift network create -n pentest_lab --subnet 172.30.10.0/24
rfswift network cleanup
```

Wi-Fi and Bluetooth tools need `-a NET_ADMIN` (and often `NET_RAW`). Add capabilities sparingly.

### 9. Remote desktop mode

```bash
rfswift container create -i sdr_full -n sdr_desktop --desktop                       # http://127.0.0.1:6080
rfswift container create -i sdr_full -n sdr_desktop --desktop --desktop-config "vnc::5900"
rfswift container create -i sdr_full -n sdr_desktop --desktop --desktop-config "http:0.0.0.0:6080" --desktop-pass "secret" --desktop-ssl
rfswift container shell -c my_container --desktop                                   # on an existing container
```

`--desktop-config` is `proto:host:port` (`http` for noVNC on 6080, `vnc` on 5900). On the network always set `--desktop-pass` and `--desktop-ssl`; combine with `--no-x11` when the browser is your only GUI. In `nat` or `bridge` mode the in-container listener is forced to `0.0.0.0` so port forwarding reaches it, and the wizard asks for the bind address and port.

### 10. Native environments (Nix)

```bash
rfswift container create --engine nix -i sdr_light -n radio
rfswift env shell radio
rfswift env update --check radio
```

The [Nix engine guide](/docs/guide/nix-engine) covers build modes, the `--isolate` jail, hardware rules and Windows.

## Using RF tools

Once inside, run any included tool, for example `sdrangel` with an RTL-SDR plugged in:

![Running SDRAngel with an RTL-SDR](/images/docs/sdrangel.png "Running SDRAngel with an RTL-SDR")

{{< callout type="warning" >}}
GUI applications need a display: X11 with `xhost` on Linux, XQuartz on macOS (RF Swift switches OpenGL to EGL there), WSLg on Windows, or `--desktop` for a browser desktop on any platform.
{{< /callout >}}

{{< callout emoji="⚡" >}}
**SDR performance**: buffer underruns or dropped samples usually go away with `--realtime` (or `rfswift realtime enable -c NAME`).
{{< /callout >}}

## Host isolation

Containers start unprivileged with the cgroup rules of `config.ini`:

```ini
[container]
privileged = false
caps =
seccomp =
cgroups = c 189:* rwm,c 166:* rwm,c 188:* rwm
```

- `privileged = false`: no full root on the host.
- cgroup rules limit device access by major number (189 USB, 166 ACM serial, 188 USB serial). RF Swift adapts to cgroup v1 and v2.
- `caps` and `seccomp` add capabilities or a custom seccomp profile for every container.

Override per container with `-u`, `-a`, `-g`, `-m`, `-s` on `rfswift container create`, and audit what you granted with `rfswift audit NAME`.

{{< tabs items="Docker isolation,Podman isolation" >}}
  {{< tab >}}
Docker's daemon runs as root; an unprivileged container is still confined by capabilities, seccomp and the device cgroup.
  {{< /tab >}}
  {{< tab >}}
Rootless Podman adds a user namespace: root inside the container maps to your unprivileged user on the host. `-u 1` grants privileges within that namespace only.
  {{< /tab >}}
{{< /tabs >}}

### Security-related flags of `container create`

```
Security:
  -u, --privileged int        1 privileged, 0 unprivileged (default 0)
  -a, --capabilities string   extra capabilities, comma-separated
  -g, --cgroups string        extra cgroup rules, comma-separated
  -m, --seccomp string        seccomp profile ('default' by default)
  -s, --devices string        extra device mappings, comma-separated

Network:
  -t, --network string        host (default), nat, nat:NAME, bridge, none, container:NAME
  -z, --exposedports string   exposed ports
  -w, --bindedports string    published ports
  -x, --extrahosts string     extra hosts (default 'pluto.local:192.168.1.2')

Resources:
  -b, --bind string           extra bind mounts, comma-separated
  --workspace / --cwd / --no-workspace
  -d, --display string        X display (default DISPLAY=:0)
  -p, --pulseserver string    audio server (default tcp:127.0.0.1:34567)
  --gpus string               GPU request ('all' or IDs)

Performance:
  --realtime                  SYS_NICE + rtprio=95 + memlock=unlimited
  --ulimits string            e.g. 'rtprio=95,memlock=-1'

Recording and display:
  --record, --record-output string
  --no-x11
  --desktop, --desktop-config, --desktop-pass, --desktop-ssl
  --vpn string                wireguard:FILE, openvpn:FILE, tailscale[:KEY], netbird[:KEY]

Nix engine only:
  --lazy, --pure, --isolate, --flake REF, --rebuild, --create-only
```

Examples:

```bash
rfswift container create -i penthertz/rfswift_resolute:wifi -n wifi_tools -u 0 -a NET_ADMIN,NET_RAW
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n rtlsdr -g "c 226:* rwm" -s "/dev/bus/usb:/dev/bus/usb"
rfswift container create -i penthertz/rfswift_resolute:reversing -n forensics -m ~/custom_seccomp.json -t none
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n sdr_capture --realtime -b ~/captures:/root/captures --record
rfswift --engine podman container create -i penthertz/rfswift_resolute:sdr_full -n rootless_sdr --realtime
```

{{< callout type="warning" >}}
Command-line settings extend or override the config file. Keep `privileged = false` and add only the capabilities and devices a task needs.
{{< /callout >}}

## Next steps

{{< cards >}}
  {{< card link="/docs/guide/container-management" title="Dynamic container management" icon="scissors" subtitle="Change mounts, devices, capabilities and ports after creation" >}}
  {{< card link="/docs/guide/nix-engine" title="Nix engine" icon="sparkles" subtitle="The same tools, natively" >}}
  {{< card link="/docs/guide/workbench" title="Workbench" icon="desktop-computer" subtitle="The assessment GUI" >}}
  {{< card link="/docs/guide/list-of-images/" title="Container images" icon="database" subtitle="Pre-built images" >}}
{{< /cards >}}
