---
title: Quick start
description: Go from "RF Swift is installed" to a working radio lab on your computer in about ten minutes. Five steps, no container knowledge needed.
level: beginner
weight: 6
---

This page takes you from a fresh install to your first **lab**: an isolated environment full of radio tools, with your SDR, screen, sound and a shared folder already connected. It takes about ten minutes, most of it waiting for a download.

## Before you start

- **RF Swift is installed.** If not, follow [Install RF Swift](/docs/getting-started/) first (one command or one installer).
- **A terminal.** On Windows, open **RF Swift Console** from the Start Menu.
- **Optional: a radio.** An RTL-SDR, HydraSDR, HackRF or any other supported SDR. You can do every step without one and plug it in later.

{{< callout type="beginner" title="New words on this page?" >}}
A **toolbox** (or *image*) is a ready-made set of tools. A **lab** (or *container*) is your own copy of a toolbox that you work in. The **workspace** is the folder shared between your computer and the lab. [Key ideas in 5 minutes](/docs/concepts/) explains them all.
{{< /callout >}}

{{% steps %}}

### Check that your computer is ready

Run the built-in doctor:

```bash
rfswift doctor
```

It checks your container engine, display, sound, USB and a few more things, one line each:

| Icon | Meaning |
|------|---------|
| `✓` green | Passed |
| `!` yellow | Works, but could be better |
| `✗` red | Needs a fix: the line tells you which command fixes it |
| `-` gray | Not applicable on your system |

If you used the installer, it has already offered the one-time setup below. Otherwise, run the step that matches the engine you use (Docker Desktop on macOS and Windows needs nothing):

{{< tabs items="Docker,Podman,Nix" >}}
  {{< tab >}}
**Docker on Linux**: let your user talk to Docker without `sudo`. It works right away, no logout needed.

```bash
rfswift host docker-access
```

Members of the `docker` group are root-equivalent on the host.
  {{< /tab >}}
  {{< tab >}}
**Podman runs rootless** (without admin rights). Give your user the ID ranges Podman needs, and install the rules that let you open RF hardware:

```bash
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER
rfswift host udev
```
  {{< /tab >}}
  {{< tab >}}
**No container engine at all?** The Nix engine installs the same tools natively on your system:

```bash
rfswift host setup --engine none --nix yes
```

Then use `rfswift container create --engine nix` in the next steps. See [Nix engine](/docs/guide/nix-engine/).
  {{< /tab >}}
{{< /tabs >}}

Run `rfswift doctor` again until there is no red line.

### Pick a toolbox

Toolboxes are grouped by job. For a first lab, `sdr_light` is a good choice: the classic radio tools (GQRX, SDR++, GNU Radio, Universal Radio Hacker, rtl_433...) at a reasonable size.

| Toolbox | Use it for |
|---------|------------|
| `sdr_light` | Listening to, recording and analysing radio signals with the essential SDR tools |
| `sdr_full` | Everything in `sdr_light` plus the full SDR tool collection |
| `wifi` | Wi-Fi security testing |
| `bluetooth` | Bluetooth Classic and Low Energy testing |
| `rfid` | RFID and NFC testing |
| `hardware` | Hardware security testing |

There are many more, from telecom (2G to 5G) to automotive, reversing and Active Directory: see [Choose a toolbox](/docs/guide/list-of-images/). A toolbox is a download of several GB (around 9 GB for `sdr_light`, 16 GB for `sdr_full`), but related toolboxes share most of their content on disk.

{{< callout type="tip" title="Want to stay light?" >}}
You don't have to download a whole toolbox. With the Nix engine in **lazy mode**, nothing is installed up front: each tool is fetched the first time you run it, and only that tool.

```bash
rfswift container create --engine nix -i sdr_light -n my_first_lab --lazy
```

This needs Nix: the RF Swift installer offers to install it (on Linux, `rfswift host setup --nix yes` does too). Everything else on this page works the same. See [Nix engine](/docs/guide/nix-engine/#build-modes-all-at-once-or-on-demand).
{{< /callout >}}

### Create your first lab

```bash
rfswift container create -i sdr_light -n my_first_lab
```

`-i` is the toolbox (image) and `-n` the name you give your lab. Prefer to be guided? Run `rfswift container create` with no options and a wizard asks you everything step by step.

The first time, RF Swift downloads the toolbox, which can take a few minutes. Then it:

- creates the lab `my_first_lab` from `penthertz/rfswift_resolute:sdr_light`;
- creates a **workspace** folder, `~/rfswift-workspace/my_first_lab/` on your computer, visible as `/workspace` inside the lab;
- connects your USB devices, screen and sound;
- prints a summary and opens a shell **inside** the lab. Your prompt changes: every command you type now runs in the lab.

{{< callout type="tip" >}}
Save your captures and notes in `/workspace`. They appear instantly in `~/rfswift-workspace/my_first_lab/` on your computer, and they stay there even if you delete the lab.
{{< /callout >}}

{{< callout type="info" title="On a Mac with a radio?" >}}
Docker Desktop and Podman on macOS cannot pass USB devices to a lab. You have two good options:

- **Nix** (native, the lightest): `rfswift container create --engine nix -i sdr_light -n my_first_lab --lazy`. The tools run directly on macOS and open the radio like any Mac program, with no VM in between.
- **Lima** (containers): `rfswift --engine lima container create -i sdr_light -n my_first_lab`. The next step shows how to attach the radio to the Lima VM.
{{< /callout >}}

### Plug in your radio and open a tool

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
Plug the radio in. The USB devices are shared with the lab by default, so a device plugged in after the lab was created shows up the next time you open a shell in it.

Then start a tool from the lab's shell:

```bash
sdrpp
```

Rootless Podman or Nix? Run `rfswift host udev` once on your computer so your user may open the hardware.
  {{< /tab >}}
  {{< tab >}}
On Windows, labs run inside WSL 2, which cannot see your USB ports until you forward a device to it. RF Swift does that with usbipd-win:

```powershell
rfswift usb list
rfswift usb attach
```

`rfswift usb attach` shows a picker. The first time you share a device, Windows asks for administrator approval once. `rfswift container create` also offers this picker by itself when it sees RF hardware.

When you are done, give the device back to Windows with `rfswift usb detach --busid <id>` (the bus ID is shown by `rfswift usb list`). See [Windows](/docs/guide/windows/).
  {{< /tab >}}
  {{< tab >}}
USB on macOS goes through the Lima VM (install it once with `brew install lima qemu`). Attach the radio to the VM, then use a lab created with `--engine lima`:

```bash
rfswift usb list
rfswift usb attach
rfswift --engine lima container shell -c my_first_lab
```

`rfswift usb attach` shows a picker; `rfswift usb detach` gives the device back. Windows of graphical tools open through XQuartz. See [usb](/docs/commands/usb/) and [engine](/docs/commands/engine/).
  {{< /tab >}}
{{< /tabs >}}

Want to hear something right away? Follow [Tutorial: listen to your first signal](/docs/first-signal/).

### Leave, and come back later

Type `exit` to leave the lab. Your lab and its workspace stay on your computer.

```bash
rfswift container shell -c my_first_lab     # go back in (starts the lab if it was stopped)
rfswift container shell                      # pick from a list, or the most recent lab
rfswift container last                       # list your labs
rfswift container stop -c my_first_lab       # stop it
rfswift container rm -c my_first_lab         # delete it (the workspace folder is kept)
```

{{% /steps %}}

## You have a working lab

That is the whole loop: pick a toolbox, create a lab, plug in, work in `/workspace`, come back later. Everything else builds on it.

{{< cards >}}
  {{< card link="/docs/first-signal/" title="Listen to your first signal" icon="broadcast" subtitle="Hear FM radio with an RTL-SDR in about 15 minutes" tag="Beginner" >}}
  {{< card link="/docs/guide/workbench/" title="Prefer clicking? Try the Workbench" icon="desktop" subtitle="Create labs, open terminals, take notes and export reports from a desktop app" tag="Beginner" >}}
  {{< card link="/docs/guide/sharing-files/" title="Files & devices" icon="folder-open" subtitle="The workspace, extra folders and serial devices" >}}
  {{< card link="/docs/faq/" title="Something not working?" icon="lifebuoy" subtitle="FAQ & troubleshooting" >}}
{{< /cards >}}

## Advanced: going further

{{< callout type="info" >}}
Everything below is optional. It covers the options of `rfswift container create` and the commands to manage labs. The complete list, with examples, is in [container create](/docs/commands/run/).
{{< /callout >}}

### Choosing the engine

RF Swift **auto-detects** the container engine (Docker, Podman, Lima). Override it with `rfswift --engine podman ...`, the `RFSWIFT_ENGINE` environment variable, or `engine = ...` in `config.ini`. The precedence is the flag, then `RFSWIFT_ENGINE`, then the config file.

On first run RF Swift creates its configuration file with the shipped defaults (it asks first on an interactive terminal):

```
Config file not found in your user profile. Would you like to create one with default values? (y/n)
```

### Pulling images ahead of time

`container create` pulls the image it needs, but you can download images first:

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

### Options of `container create`

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
| `--workspace`, `--cwd`, `--no-workspace` | Where the workspace is, or no workspace |
| `--lazy`, `--pure`, `--isolate`, `--flake` | Nix engine only |

Before creating anything, RF Swift lists the default devices this engine cannot map on your host (a device absent from the Lima VM, a root-only node on rootless Podman, USB on Docker Desktop for macOS) and asks once before dropping them. You can also edit the `devices` list in `config.ini`.

### Sharing folders and devices

```bash
rfswift container create -i sdr_full -n my_sdr_container -b ~/sdr_projects:/root/projects
rfswift container create -i sdr_full -n my_sdr_container -b ~/sdr_projects:/root/projects,~/datasets:/root/data
rfswift container create -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0
rfswift container create -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0
```

The USB tree (`/dev/bus/usb`) is mapped by default with the cgroup rule that makes it usable, so a USB device plugged in later is visible in the next shell. Serial ports named at creation are **hot-pluggable** on Docker and rootful Podman: unplugged at creation, they are attached on demand when you plug them in and open a shell.

{{< tabs items="Docker device notes,Podman device notes" >}}
  {{< tab >}}
Device passthrough works natively. Privileged mode (`-u 1`) exposes every host device but is never required for USB.
  {{< /tab >}}
  {{< tab >}}
Rootless Podman cannot set cgroup device rules or create device nodes: RF Swift drops the rules with a warning and needs serial ports present at creation. Install `rfswift host udev` so your user may open the hardware. RF Swift auto-detects cgroup v1 and v2.
  {{< /tab >}}
{{< /tabs >}}

Add or remove devices and folders on an existing lab:

```bash
rfswift config bindings add -c my_container -d -t /dev/ttyUSB0
rfswift config bindings add -c my_container -s /home/user/data -t /root/data
rfswift config bindings rm  -c my_container -d -t /dev/ttyUSB0
```

The `-d` switch means "a device, not a volume". Bindings, devices, ports, capabilities, cgroup rules, GPUs and ulimits can all be changed later with `rfswift config ...` ([Change a container later](/docs/guide/container-management/)).

### Capabilities, network and privileges

```bash
rfswift container create -i wifi -n my_wifi_container -a NET_ADMIN
rfswift container create -i wifi -n my_container -a NET_ADMIN,NET_RAW
```

{{< callout type="warning" title="Security" >}}
Capabilities such as `NET_ADMIN` let a compromised container capture or manipulate network interfaces. Add only what is strictly necessary, and remove it afterwards with `rfswift config capabilities rm`.
{{< /callout >}}

```bash
rfswift container create -i sdr_full -n my_sdr_container -t bridge
rfswift container create -i sdr_full -n isolated_sdr -t nat
rfswift container create -i sdr_full -n my_sdr_container -u 0    # unprivileged (default)
rfswift container create -i sdr_full -n my_sdr_container -u 1    # privileged, use with caution
```

### Custom command and recording

```bash
rfswift container create -i sdr_full -n signal_processor -e "gnuradio-companion"
rfswift container create -i sdr_full -n my_sdr_container --record
rfswift container create -i sdr_full -n my_sdr_container --record --record-output my-session.cast
```

### Managing existing containers

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

### Session playback

```bash
rfswift log replay -i rfswift-exec-mycontainer-20260112-134651.cast
rfswift log replay -i session.cast -s 2.0
rfswift log list
rfswift log list --dir ~/recordings
```

Recordings are asciinema `.cast` files: replay them, embed them in documentation, or let `rfswift report generate` inventory them.

### Common commands

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

{{< cards >}}
  {{< card link="/docs/guide/running-rf-swift/" title="Daily workflow" icon="compass" subtitle="Profiles, realtime mode, networks, remote desktop and host isolation" tag="Advanced" >}}
  {{< card link="/docs/commands/" title="Command reference" icon="book-open" subtitle="Every command and flag" tag="Advanced" >}}
{{< /cards >}}
