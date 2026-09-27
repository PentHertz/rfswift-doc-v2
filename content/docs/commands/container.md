---
title: "rfswift container"
linkTitle: "container"
navGroup: "Containers"
level: reference
description: "Create, enter, stop, remove, rename, commit and upgrade containers."
weight: 1
---

`rfswift container` groups every command that creates and manages containers (labs): create, enter, list, stop, remove, rename, commit and upgrade. In RF Swift v4 these commands moved here from the top level (`run`, `exec`, `stop`, `remove`...); the old names still work.

```bash
rfswift container create -i sdr_full -n lab    # create a lab and enter it
rfswift container shell -c lab                 # come back to it later
```

## Synopsis

```bash
rfswift container create   -i IMAGE -n NAME [options]     # was: rfswift run
rfswift container shell    -c NAME [options]              # was: rfswift exec
rfswift container last     [-f FILTER]                    # was: rfswift last
rfswift container install  -c NAME [-i FUNCTION]          # was: rfswift install
rfswift container stop     -c NAME                        # was: rfswift stop
rfswift container rm       -c NAME                        # was: rfswift remove
rfswift container rename   -n OLD -d NEW                  # was: rfswift rename
rfswift container commit   -c NAME -i IMAGE               # was: rfswift commit
rfswift container upgrade  -c NAME [-i IMAGE] [-r DIRS]   # was: rfswift upgrade
```

{{< callout type="info" >}}
Every subcommand accepts the global `--engine` flag. With `--engine nix`, `container create` and `container shell` create and enter a **native Nix environment** instead of a container. They take the same flags, plus the Nix-only ones (`--lazy`, `--pure`, `--isolate`, `--flake`, `--rebuild`, `--create-only`). See the [Nix engine guide](/docs/guide/nix-engine/).
{{< /callout >}}

## Subcommands

| Subcommand | What it does | Details |
|------------|--------------|---------|
| `create` | Pull the image if needed, create the container with your devices, mounts, network and features, and enter it. Opens the wizard when `-i`/`-n` are missing. Aliases: `rfswift create`, `rfswift new`. | [container create](/docs/commands/run) |
| `shell` | Enter an existing container (started automatically if stopped) or run a single command in it (`-e`). Aliases: `rfswift shell`, `rfswift enter`. | [container shell](/docs/commands/exec) |
| `last` | List the containers RF Swift created, most recent first (`-f` filters by image). | [container last](/docs/commands/last) |
| `install` | Run one of the install functions shipped in the image (`-i FUNCTION`), or pick one from a searchable list. With `--engine nix`, the guided Nix package installer. | [container install](/docs/commands/install) |
| `stop` | Stop a running container. Alias: `rfswift halt`. | [container stop](/docs/commands/stop) |
| `rm` | Remove a container. Its workspace directory on the host is kept. Alias: `rfswift rm`. | [container rm](/docs/commands/remove) |
| `rename` | Rename a container. | [container rename](/docs/commands/rename) |
| `commit` | Save the container's current filesystem as a new image. | [container commit](/docs/commands/commit) |
| `upgrade` | Re-create the container from a newer (or another) image, preserving listed directories. | [container upgrade](/docs/commands/upgrade) |

## What a container gets by default

When you run `rfswift container create -i sdr_full -n lab`, RF Swift:

- **pulls the image** `penthertz/rfswift_resolute:sdr_full` if it is not on your computer yet. Short names resolve through `repotag` in `config.ini`.
- **mounts a workspace**: `~/rfswift-workspace/lab/` on your computer is `/workspace` in the container. `--workspace`, `--cwd` and `--no-workspace` change this.
- **maps the devices** and cgroup rules listed in `config.ini` (USB tree, sound, DRI, input...). Before creating anything, it checks that the engine can map them on this computer. Devices that cannot work (root-only nodes on rootless Podman, a device missing from the Lima VM, USB on Docker Desktop for macOS) are listed with the reason and dropped after you confirm.
- **checks that USB devices will be reachable**: `/dev/bus/usb` must be mapped **and** `c 189:* rwm` allowed. Privileged mode is not needed.
- **sets up serial hot-plug** when you name a serial port. `/dev/ttyACM*`, `/dev/ttyUSB*` and `/dev/ttyAMA*` get cgroup rules, and their device nodes are created inside the container at every start and every shell. A reader you plug in later then works without re-creating anything (Docker and rootful Podman).
- **forwards the display** (X11 on Linux, XQuartz with EGL on macOS, WSLg on Windows) **and sound** (the host PulseAudio/PipeWire TCP module, loaded automatically on Linux and macOS; WSLg's PulseAudio socket on Windows).
- **opens a shell**: `/bin/zsh`, or Bash if zsh is missing. It first prints a summary: image version and freshness, size, shell, display, privileges, mounts, devices, seccomp, ulimits, GPUs, network mode and ports.

On Windows, `create`, `shell` and `env shell` offer the usbipd device picker when they detect shared or known RF hardware, so you can forward a radio into WSL 2 before the container starts.

## Examples

```bash
# Interactive wizard (profiles, image, workspace, devices, network, features)
rfswift container create

# Quick SDR container with realtime scheduling
rfswift container create -i sdr_full -n sdr --realtime

# From a profile, NAT-isolated, with a custom workspace
rfswift container create --profile wifi -n wifi_audit -t nat --workspace ~/audits/wifi

# Enter it again later (starts it if stopped)
rfswift container shell -c sdr

# Run one command instead of a shell
rfswift container shell -c sdr -e "rtl_test -t"

# Native Nix environment, on-demand tools, inside a jail
rfswift --engine nix container create -i sdr_light -n radio --lazy --isolate

# Upgrade to the latest image, keeping two directories
rfswift container upgrade -c sdr -r /root/captures,/opt/tools
```

## Related

- [Running RF Swift](/docs/guide/running-rf-swift/): the day-to-day workflow
- [`config`](/docs/commands/config/): change devices, mounts, capabilities and ports afterwards
- [`env`](/docs/commands/env/): the Nix counterpart of this group
- [Known limits](/docs/guide/limitations/): what each engine and platform cannot do
