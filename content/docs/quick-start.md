---
title: 🚀 Quick Start
weight: 6
next: /docs/guide
prev: /docs/getting-started
cascade:
  type: docs
---

## Getting up and running with RF Swift

Here we quickly get started with RF Swift using the installers, pre-built images and, if you prefer, native Nix environments.

{{< tabs items="Docker,Podman,Nix" >}}
  {{< tab >}}
{{< callout type="info" >}}
**Docker on Linux**: grant your user access to the socket once, no `sudo` and no logout afterwards:

```bash
rfswift host docker-access
```
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
{{< callout type="info" >}}
**Podman runs rootless by default**. Configure subordinate IDs and install the udev rules that let your user open RF hardware:

```bash
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER
rfswift host udev
```
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
{{< callout type="info" >}}
**No container engine at all?** The Nix engine installs the tool sets natively: `rfswift host setup --engine none --nix yes`, then `rfswift container create --engine nix`. It is also the way to add RF Swift to a distribution you already use, Kali or DragonOS for instance, without touching its packages. See [Nix engine](/docs/guide/nix-engine) and [Keep your distribution, add RF Swift](/docs/comparisons#complete-the-distribution-you-already-run).
{{< /callout >}}
  {{< /tab >}}
{{< /tabs >}}

{{% steps %}}

### Install RF Swift

Skip this step if you already did it. Full details, including the native Linux packages and Homebrew, are in [Getting Started](/docs/getting-started).

{{< tabs items="Linux / macOS (script),macOS (DMG),Windows (installer)" >}}
  {{< tab >}}
```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

The installer asks for the release channel, what to install (CLI, Workbench or both), the container engine (Docker, Podman, both, Lima on macOS, or skip), whether to install Nix for the native engine, the udev rules and the Nix jail helper. Every question can be answered up front with an environment variable (`RFSWIFT_ENGINE=podman RFSWIFT_NIX=1 ...`). It verifies every download against the release SHA-256 manifest.
  {{< /tab >}}
  {{< tab >}}
**The DMG, no terminal needed.** Download `rfswift_Darwin_universal.dmg` from the [releases page](https://github.com/PentHertz/RF-Swift/releases), open it and drag `rfswift-workbench.app` to Applications. Two helpers sit next to it: **Install RF Swift CLI** copies `rfswift` to `/usr/local/bin`, and **RF Swift Setup** installs and picks your container engine. Everything in the image is Developer ID signed and notarized, so Gatekeeper opens it without a warning. Then open the Workbench from Applications, or `rfswift` from a terminal.
  {{< /tab >}}
  {{< tab >}}
Run `RFSwift-Setup-<version>-x64.exe` (or `-arm64`) from the [releases](https://github.com/PentHertz/RF-Swift/releases): it installs WSL 2 with WSLg, usbipd-win, Docker Desktop or Podman Desktop (or "Nix only"), and RF Swift itself under one UAC prompt. Then open "RF Swift Console" from the Start Menu. See [Windows](/docs/guide/windows).
  {{< /tab >}}
{{< /tabs >}}

On first run RF Swift creates its configuration file with the shipped defaults (it asks first on an interactive terminal):

```
Config file not found in your user profile. Would you like to create one with default values? (y/n)
```

{{< callout type="info" >}}
RF Swift **auto-detects** the container engine (Docker, Podman, Lima). Override it with `rfswift --engine podman ...`, `RFSWIFT_ENGINE`, or `engine = ...` in `config.ini`.
{{< /callout >}}

### Check the host

```bash
rfswift doctor
```

The doctor reports the engines and their services, Docker access, the host udev rules, the Nix engine and its jail, images, X11 and `xhost`, the audio server, USB, the config file and kernel modules (plus usbipd-win, WSLg and the WSL 2 distribution on Windows, the Lima VM on macOS). On a Linux desktop, `rfswift host setup` walks through the opt-in steps: udev rules, engine installation, Nix, Docker access, the Nix jail.

### Pull a pre-built image

```bash
rfswift image pull -i sdr_full
rfswift image pull -i sdr_full -t my_custom_tag      # local tag of your choice
rfswift image pull -i sdr_full -V 0.1.1              # a specific published version
```

All images are OCI-compatible and work identically on Docker, Podman and Lima. Since v3.0.0 they are built on Ubuntu 26.04 "Resolute" and published under `penthertz/rfswift_resolute:<tag>`, the CLI default; the previous `penthertz/rfswift_noble` images remain available. Pin another repository in the `[general]` section of `config.ini`:

```ini
[general]
imagename = myrfswift:latest
repotag = penthertz/rfswift_resolute
```

`rfswift image remote` lists what is published for your architecture, `rfswift image local` what you have, and `rfswift image audit sdr_full` scans an image for known vulnerabilities before you rely on it.

### Run the container

```bash
rfswift container create -i sdr_full -n my_sdr_container
```

This creates a container named `my_sdr_container` from the `sdr_full` image and opens a shell in it. A **workspace** is created at `~/rfswift-workspace/my_sdr_container/` and mounted at `/workspace`: files saved there are immediately on your host. Use `--workspace /path`, `--cwd` or `--no-workspace` to change that.

Without `-i` and `-n` in a terminal, the **wizard** guides you through profiles, image, workspace, mounts, devices, ports, network and features. `rfswift run` still works as the old spelling.

{{< callout type="warning" >}}
Before creating anything, RF Swift lists the default devices this engine cannot map on your host (a device absent from the Lima VM, a root-only node on rootless Podman, USB on Docker Desktop for macOS) and asks once before dropping them. You can also edit the `devices` list in `config.ini`.
{{< /callout >}}

## Advanced features

The `container create` command has many options; the most common:

| Flag | Description |
|------|-------------|
| `-i, --image string` | Image name or tag (default from `config.ini`) |
| `-n, --name string` | Container name |
| `--profile string` | Start from a preset (`rfswift profile list`) |
| `-b, --bind string` | Extra bind mounts, comma-separated (`~/data:/root/data:ro` for read-only) |
| `-s, --devices string` | Extra device mappings, comma-separated |
| `-a, --capabilities string` | Extra Linux capabilities, comma-separated |
| `-g, --cgroups string` | Extra cgroup device rules, comma-separated |
| `-t, --network string` | `host` (default), `nat`, `nat:NAME`, `bridge`, `none` |
| `-w, --bindedports`, `-z, --exposedports` | Published and exposed ports |
| `-u, --privileged int` | 1 privileged, 0 unprivileged (default) |
| `-e, --command string` | Shell or command to run (default `/bin/zsh`) |
| `--realtime`, `--ulimits string` | SDR performance settings |
| `--record`, `--record-output string` | Session recording |
| `--desktop`, `--desktop-config`, `--desktop-pass`, `--desktop-ssl` | Browser or VNC desktop |
| `--vpn string` | WireGuard, OpenVPN, Tailscale or Netbird inside the container |
| `--no-x11` | No X11 forwarding |
| `--gpus string` | GPU request (`all`, `0,1`) |
| `--lazy`, `--pure`, `--isolate`, `--flake` | Nix engine only |

The complete list with examples: [container create](/docs/commands/run).

**Share files with the container**

```bash
rfswift container create -i sdr_full -n my_sdr_container -b ~/sdr_projects:/root/projects
rfswift container create -i sdr_full -n my_sdr_container -b ~/sdr_projects:/root/projects,~/datasets:/root/data
```

**Share specific devices**

```bash
rfswift container create -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0
rfswift container create -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0
```

{{< callout type="info" >}}
The USB tree (`/dev/bus/usb`) is mapped by default with the cgroup rule that makes it usable, so a USB device plugged in later is visible in the next shell. Serial ports named at creation are **hot-pluggable** on Docker and rootful Podman: unplugged at creation, they are attached on demand when you plug them in and open a shell.
{{< /callout >}}

{{< tabs items="Docker device notes,Podman device notes" >}}
  {{< tab >}}
Device passthrough works natively. Privileged mode (`-u 1`) exposes every host device but is never required for USB.
  {{< /tab >}}
  {{< tab >}}
Rootless Podman cannot set cgroup device rules or create device nodes: RF Swift drops the rules with a warning and needs serial ports present at creation. Install `rfswift host udev` so your user may open the hardware. RF Swift auto-detects cgroup v1 and v2.
  {{< /tab >}}
{{< /tabs >}}

**Add Linux capabilities**

```bash
rfswift container create -i wifi -n my_wifi_container -a NET_ADMIN
rfswift container create -i wifi -n my_container -a NET_ADMIN,NET_RAW
```

{{< callout type="warning" >}}
**Security**: capabilities such as `NET_ADMIN` let a compromised container capture or manipulate network interfaces. Add only what is strictly necessary, and remove it afterwards with `rfswift config capabilities rm`.
{{< /callout >}}

{{< callout type="info" >}}
Bindings, devices, ports, capabilities, cgroup rules, GPUs and ulimits can all be changed later with `rfswift config ...` ([Dynamic container management](/docs/guide/container-management)).
{{< /callout >}}

**Network**

```bash
rfswift container create -i sdr_full -n my_sdr_container -t bridge
rfswift container create -i sdr_full -n isolated_sdr -t nat
```

**Privilege level**

```bash
rfswift container create -i sdr_full -n my_sdr_container -u 0    # unprivileged (default)
rfswift container create -i sdr_full -n my_sdr_container -u 1    # privileged, use with caution
```

**Custom command**

```bash
rfswift container create -i sdr_full -n signal_processor -e "gnuradio-companion"
```

**Recording**

```bash
rfswift container create -i sdr_full -n my_sdr_container --record
rfswift container create -i sdr_full -n my_sdr_container --record --record-output my-session.cast
```

### Use RF tools in the container

Connect your SDR and run, for example, `sdrpp` inside the container.

{{< callout type="warning" >}}
No sound? On Linux and macOS the host audio server module is loaded automatically at every start; `rfswift host audio enable` does it by hand and names the package to install when `pactl` is missing. Windows plays through WSLg without any setup.
{{< /callout >}}

### USB devices by platform

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
Map devices at creation with `-s`, or later:

```bash
rfswift config bindings add -c my_container -d -t /dev/ttyUSB0
rfswift config bindings add -c my_container -s /home/user/data -t /root/data
rfswift config bindings rm  -c my_container -d -t /dev/ttyUSB0
```

The `-d` switch means "a device, not a volume".
  {{< /tab >}}
  {{< tab >}}
Forward the device into WSL 2 first (usbipd-win; one administrator approval per device to share, unprivileged attach):

```powershell
rfswift usb list
rfswift usb attach --busid 2-3
rfswift container create -i sdr_full -n my_container
rfswift usb detach --busid 2-3
```

`container create` offers the picker itself when it sees RF hardware. See [Windows](/docs/guide/windows).
  {{< /tab >}}
  {{< tab >}}
Docker Desktop and Podman cannot forward USB devices; RF Swift uses **Lima** (a QEMU VM created on first use):

```bash
brew install lima qemu
rfswift usb list
rfswift usb attach --vid 0x1d50 --pid 0x604b
rfswift --engine lima container create -i sdr_light -n sdr_work
rfswift usb detach --vid 0x1d50 --pid 0x604b
```

Use `--engine lima` for hardware, Docker Desktop for everything else. See [usb](/docs/commands/usb) and [engine](/docs/commands/engine).
  {{< /tab >}}
{{< /tabs >}}

{{% /steps %}}

## Managing existing containers

```bash
rfswift container stop -c my_sdr_container       # stop
rfswift container shell -c my_sdr_container      # start again and enter
rfswift container shell                          # the most recent container (or a picker)
rfswift container last                           # list containers
rfswift container commit -c my_sdr_container -i my_custom_image   # save the state as an image
rfswift container rm -c my_sdr_container         # remove (the workspace stays)
```

Record `shell` sessions too:

```bash
rfswift container shell -c my_sdr_container --record
rfswift container shell -c my_sdr_container -w /root/projects --record --record-output debug-session.cast
```

## Session playback

```bash
rfswift log replay -i rfswift-exec-mycontainer-20260112-134651.cast
rfswift log replay -i session.cast -s 2.0
rfswift log list
rfswift log list --dir ~/recordings
```

Recordings are asciinema `.cast` files: replay them, embed them in documentation, or let `rfswift report generate` inventory them.

## Common commands reference

| Command | Description |
|---------|-------------|
| `rfswift container create -i IMAGE -n NAME` | Create and run a new container |
| `rfswift container shell -c NAME` | Enter an existing container |
| `rfswift --engine nix container create -i sdr_light -n NAME` | Create a native Nix environment |
| `rfswift env shell NAME` | Enter a Nix environment |
| `rfswift image local` | Local images |
| `rfswift container last` | All containers |
| `rfswift config bindings add` | Add a device or volume to an existing container |
| `rfswift host audio enable` | Host audio for containers (Linux, macOS) |
| `rfswift usb attach` | Forward a USB device (macOS, Windows) |
| `rfswift log replay -i FILE` | Replay a recording |
| `rfswift doctor` | Check the host |
| `rfswift --engine podman ...` | Force an engine |

## Next steps

{{< cards >}}
  {{< card link="/docs/guide" title="Follow the guide" icon="document-text" subtitle="The complete guide to daily assessments with RF Swift" >}}
  {{< card link="/docs/guide/workbench" title="Try the Workbench" icon="desktop-computer" subtitle="Missions, notes, findings, captures and reports in a GUI" >}}
{{< /cards >}}
