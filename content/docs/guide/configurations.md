---
title: "Configuration"
level: advanced
description: "Change RF Swift's defaults: the config.ini file, reusable profiles, environment variables and command-line flags."
weight: 4
---

RF Swift works out of the box with sensible defaults. Read this page when you want to change one: your default engine, the image repository, the devices every container gets, or a preset you use every week.

## Where settings come from

Four layers, from the most permanent to the most specific. When two disagree, the more specific one wins.

| Layer | Use it for | Scope |
|---|---|---|
| [`config.ini`](#the-configuration-file) | Your persistent preferences | Every command |
| [Profiles](#container-profiles) (YAML) | Named presets for recurring setups | `container create --profile NAME` |
| [Environment variables](#environment-variables) | One-off or per-session overrides | The current terminal |
| [Command-line flags](#command-line-overrides) | This one command | Wins over everything |

### Common changes

| I want to… | Do this |
|---|---|
| Make Nix (or Podman…) my default engine | `engine = nix` under `[general]` in `config.ini` |
| Use a mirror or my own registry | Change `repotag` under `[general]` |
| Reuse the same options every time | Create a [profile](#container-profiles) |
| Work offline, with no update check | Add `-q` to any command ([disconnected mode](#disconnected-mode)) |
| Change a container that already exists | `rfswift config ...` (see [below](#changing-a-container-afterwards)) |

## The configuration file

### Location

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
```
~/.config/rfswift/config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
C:\Users\username\AppData\Roaming\rfswift\config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
~/.config/rfswift/config.ini
```
  {{< /tab >}}
{{< /tabs >}}

On first run RF Swift asks whether to create the file with the shipped defaults. When there is no terminal to answer (the Workbench, a script), it is created silently.

### Structure

```ini
[general]
imagename = myrfswift:latest
repotag = penthertz/rfswift_resolute
engine = auto

[container]
shell = /bin/zsh
bindings =
network = host
exposedports =
portbindings =
x11forward = /tmp/.X11-unix:/tmp/.X11-unix
xdisplay = "DISPLAY=:0"
extrahost = pluto.local:192.168.2.1
extraenv =
devices = /dev/bus/usb:/dev/bus/usb,/dev/snd:/dev/snd,/dev/dri:/dev/dri,/dev/input:/dev/input,/dev/vhci:/dev/vhci,/dev/console:/dev/console,/dev/vcsa:/dev/vcsa,/dev/tty:/dev/tty,/dev/tty0:/dev/tty0,/dev/tty1:/dev/tty1,/dev/tty2:/dev/tty2,/dev/uinput:/dev/uinput
privileged = false
caps =
seccomp =
cgroups = c 189:* rwm,c 166:* rwm,c 188:* rwm

[audio]
pulse_server = tcp:localhost:34567

[desktop]
proto = vnc
host = 127.0.0.1
port = 6080
password =
ssl = false

[nix]
wsl_distro =
```

The device defaults depend on the operating system the file was created on.

### `[general]`

| Key | Description | Example |
|-----|-------------|---------|
| `imagename` | Image used when `container create` has no `-i` | `myrfswift:latest` |
| `repotag` | Repository prepended to short image names | `penthertz/rfswift_resolute` |
| `engine` | Default engine when neither `--engine` nor `RFSWIFT_ENGINE` is set: `auto`, `docker`, `podman`, `lima`, `nix`. Which one to pick: [Choose your engine](/docs/engines/) | `nix` |

{{< callout type="info" >}}
Official images are built on Ubuntu 26.04 "Resolute" and published under `penthertz/rfswift_resolute`. Set `repotag = penthertz/rfswift_noble` to fall back to the Ubuntu 24.04 images, or point it at a mirror or your own registry.
{{< /callout >}}

#### Changing the repository

`repotag` is what RF Swift prepends to short tags, so `rfswift container create -i sdr_full` resolves to `penthertz/rfswift_resolute:sdr_full` by default. Edit the `[general]` section to use another repository.

### `[container]`

| Key | Description | Example |
|-----|-------------|---------|
| `shell` | Shell opened in containers (Bash fallback when missing) | `/bin/zsh` |
| `bindings` | Extra bind mounts for every container | `/home/user/data:/data` |
| `network` | Default network mode | `host`, `nat`, `bridge`, `none` |
| `exposedports`, `portbindings` | Default exposed and published ports | `8080/tcp`, `8080:80/tcp` |
| `x11forward` | X11 socket binding | `/tmp/.X11-unix:/tmp/.X11-unix` |
| `xdisplay` | Display variable | `"DISPLAY=:0"` |
| `extrahost` | Extra `/etc/hosts` entries | `pluto.local:192.168.2.1` |
| `extraenv` | Extra environment variables | `VAR1=value1,VAR2=value2` |
| `devices` | Default device mappings. Devices the engine cannot map on this host are listed before creation and dropped after you confirm | `/dev/bus/usb:/dev/bus/usb` |
| `privileged` | Privileged mode | `false` |
| `caps` | Capabilities added to every container | `NET_ADMIN,SYS_PTRACE` |
| `seccomp` | Seccomp profile | `/path/to/profile.json` |
| `cgroups` | Device cgroup rules | `c 189:* rwm,c 166:* rwm` |

### `[audio]`, `[desktop]` and `[nix]`

- **`[audio]`**: `pulse_server` is the host audio server address containers get in `PULSE_SERVER`, and the port `rfswift host audio enable` opens (`tcp:localhost:PORT` yields a local-only ACL). Windows ignores it and uses WSLg.
- **`[desktop]`**: `proto` (`vnc`, or `http` for noVNC), `host`, `port`, `password` and `ssl` are the defaults of `--desktop`.
- **`[nix]`**: `wsl_distro` names the WSL 2 distribution that hosts the Nix engine on Windows (`rfswift env wsl use` writes it).

## Container profiles

A profile is a named YAML preset that bundles image, network mode, features, devices, mounts, ports, capabilities, cgroup rules, GPU and VPN. Profiles live in:

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
```
~/.config/rfswift/profiles/
```
  {{< /tab >}}
  {{< tab >}}
```
~/Library/Application Support/rfswift/profiles/
```
  {{< /tab >}}
  {{< tab >}}
```
%APPDATA%\rfswift\profiles\
```
  {{< /tab >}}
{{< /tabs >}}

```bash
rfswift profile init                                   # write the built-in presets
rfswift profile list
rfswift container create --profile sdr-full -n my_sdr
rfswift container create --profile wifi -n my_wifi -i penthertz/rfswift_resolute:sdr_full   # flags override the profile
```

- **Built-in profiles**: `yolo`, `network-host`, `network-nat`, `sdr-full`, `sdr-light`, `wifi`, `bluetooth`, `telecom`, `telecom-5g`, `rfid`, `automotive`, `hardware`, `reversing`, `headless`.
- **Updates**: a built-in profile you never edited is refreshed automatically when RF Swift improves it (a fingerprint records what RF Swift wrote). An edited copy is kept.
- **Workbench**: the create dialog offers the same presets.

See [profile](/docs/commands/profile/).

## Environment variables

### Variables you can set

| Variable | Effect |
|----------|--------|
| `RFSWIFT_ENGINE` | Engine (`docker`, `podman`, `lima`, `nix`); overrides the config file, `--engine` wins |
| `RFSWIFT_LIMA_INSTANCE` | Lima instance name (default `rfswift`; `--gpu` uses `rfswift-gpu`) |
| `RFSWIFT_NO_BANNER` | Skip the ASCII banner (it is already skipped when stdout is not a terminal) |
| `RFSWIFT_NIX_FLAKE` | Flake reference or local path of RF-Swift-nix |
| `RFSWIFT_NIX_HOME` | State directory of the Nix engine (default `~/.rfswift/nix`) |
| `RFSWIFT_NIX_CATALOG` | Alternate environment catalog |
| `RFSWIFT_NIX_GL` | OpenGL runtime for Nix environments: `mesa` forces Mesa, `off` disables it |
| `RFSWIFT_NIX_WAYLAND` | `1` keeps GUI tools on Wayland under WSLg (X11 is the default there) |
| `RFSWIFT_WSL_DISTRO` | WSL 2 distribution hosting the Nix engine (Windows) |
| `RFSWIFT_WSLG_AUTORESET` | `0` disables the automatic WSLg display-client restart (Windows) |
| `DOCKER_API_VERSION` | Pin the Docker API version when the daemon is older than the client (see [below](#docker-api-version)) |

### Variables RF Swift sets for you

| Variable | Where and why |
|----------|---------------|
| `RFSWIFT_GL_PLATFORM` | `egl` is set for containers on macOS so GUI tools create OpenGL contexts through EGL |
| `RFSWIFT_WORKSPACE` | Exported inside Nix environment shells: the workspace path the shell sees |
| `RFSWIFT_NIX_GL_RUNTIME` | Exported inside Nix environment shells when the OpenGL runtime was applied |
| `RFSWIFT_RECORDING` | Set to `1` inside a recorded session |

Installer variables (`get_rfswift.sh`) are listed in [Install RF Swift](/docs/getting-started/#unattended-installation).

## Command-line overrides

Every setting can be overridden per container on `rfswift container create` (`-b`, `-s`, `-a`, `-g`, `-t`, `-u`, `-e`, `-d`, `-p`, `-w`, `-z`, `-x`, `-m`, `--workspace`, `--realtime`, `--desktop*`, `--vpn`, ...).

- The full list with examples is on the [container create](/docs/commands/run/) page.
- The security-related flags are summarised in [Running RF Swift](/docs/guide/running-rf-swift/#security-related-flags-of-container-create).

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n my_sdr_container
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n captures -b /home/user/captures:/data/captures
rfswift container create -i penthertz/rfswift_resolute:wifi -n wifi -a NET_ADMIN
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n web -t bridge -w 8080:80/tcp
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n bash_only -e /bin/bash
```

## Changing a container afterwards

Bind mounts, devices, capabilities, cgroup rules, GPUs, ports and ulimits of an existing container are managed with `rfswift config ...` (see [Change a container after creation](/docs/guide/container-management/)):

```bash
rfswift config bindings add -c my_sdr_container -s /home/user/data -t /data
rfswift config bindings add -c my_container -d -t /dev/ttyUSB0
rfswift config bindings rm  -c my_container -t /data
```

## Disconnected mode

```bash
rfswift -q container create -i sdr_full -n quick_analysis
rfswift --disconnect image local
rfswift -q container shell -c my_container
```

- `-q` / `--disconnect` skips the release check and every network query; everything else works the same.
- Use it in air-gapped labs, in scripts and on slow links.
- `rfswift --version` never touches the network either.

## Troubleshooting

### Docker API version

If the Docker daemon is older than the client library, you may see:

```
client version 1.47 is too new. Maximum supported API version is 1.45
```

Pin the version:

```bash
DOCKER_API_VERSION=1.45 rfswift config bindings add -c my_container -s /tmp -t /root/myshare
export DOCKER_API_VERSION=1.45     # in ~/.bashrc or ~/.zshrc for good
```

## Best practices

1. Put your common preferences in `config.ini`, and the default engine in `[general] engine`.
2. Use profiles for recurring setups and flags for one-off changes.
3. Keep `privileged = false`; add capabilities per container and remove them afterwards.
4. Be selective with `devices`: the USB tree plus the serial hot-plug covers most hardware.
5. Use `rfswift config ...` for changes instead of re-creating containers.

## Common scenarios

```bash
# SDR development environment
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n sdr_dev -b ~/sdr_projects:/projects -s /dev/ttyUSB0:/dev/ttyUSB0

# Wi-Fi security testing
rfswift container create -i penthertz/rfswift_resolute:wifi -n wifi_testing -a NET_ADMIN,NET_RAW -b ~/wifi_captures:/captures

# Offline firmware analysis
rfswift container create -i penthertz/rfswift_resolute:reversing -n firmware_analysis -t none -b ~/firmware:/firmware

# Native, no container engine
rfswift container create --engine nix -i sdr_light -n radio

# Native and light: each tool fetched the first time you run it
rfswift container create --engine nix -i sdr_light -n radio --lazy
```
