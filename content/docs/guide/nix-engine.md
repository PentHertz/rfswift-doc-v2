---
title: "Nix engine: RF Swift without containers"
linkTitle: "Nix engine"
level: intermediate
description: "Run the RF Swift tool sets natively, with no container engine: pinned, reproducible, and as light as you want with lazy mode."
weight: 3
---

The Nix engine installs RF Swift's tool sets **straight onto your computer**, as your user, instead of running them in a container. There is no daemon and no container boundary, so USB radios, audio and the GPU work without any device or socket plumbing.

- **Same toolboxes**: the tool sets are the ones the images ship (`sdr_light`, `rfid`, `wifi`, ...), defined in the companion repository [RF-Swift-nix](https://github.com/PentHertz/RF-Swift-nix).
- **Same commands**: `rfswift container create --engine nix` creates an environment the way `container create` creates a container.
- **Pinned and reproducible**: every environment is tied to an exact revision, so nothing changes until you ask.

{{< callout type="tip" title="Stay light: lazy mode" >}}
Add `--lazy` (or tick **Lazy tools** in the Workbench) and nothing is installed up front: each tool is fetched the first time you run it, then pinned. Use SDR++ and only SDR++ lands on your disk. See [Build modes](#build-modes-all-at-once-or-on-demand).
{{< /callout >}}

{{< callout type="info" title="Excellent on macOS" >}}
On a Mac, Nix runs the tools natively: USB radios open directly, sound plays natively and OpenGL needs no setup, with no Linux VM in between. `--isolate` uses Apple's built-in Seatbelt sandbox. Containers on macOS need the Lima VM for USB (Docker Desktop and Podman can't pass USB devices through).
{{< /callout >}}

**Command reference**: [env](/docs/commands/env/). This page explains how the engine behaves; the reference lists every flag.

## When to use which engine

Pick Nix when you want native tools, a light footprint or the lowest latency to your hardware; pick a container engine when you want each lab sealed off from your system. [Choose your engine](/docs/engines/) compares all four engines in plain words. In detail:

| | Container engines (Docker, Podman, Lima) | Nix engine |
|---|---|---|
| Isolation | Container by default | **Native**, as your user; optional `--isolate` jail |
| Hardware | Device mappings, cgroup rules, VM passthrough on macOS and Windows | Direct: the tool opens the device like any host program (host udev rules needed) |
| Display and audio | X11 / WSLg / XQuartz forwarding, host audio TCP module | Native, plus an embedded OpenGL runtime on non-NixOS hosts |
| Disk | Image layers | Nix store, shared between environments, garbage-collected |
| Updates | Pull a new image, `container upgrade` | `env update` with transactional rollback generations |
| Reproducibility | Image digest | Flake pin (`flake.lock` or revision) |
| Windows | Docker Desktop / Podman in WSL 2 | Runs inside a WSL 2 distribution RF Swift provisions |
| Portability | `image export` / `image download` | `env export` (`.rfenv` archive with the whole closure and the workspace) |

Both engines can be mixed on one machine; the Workbench lists containers and environments side by side.

## Requirements

- **Nix with flakes.** A working [Nix](https://nixos.org/download) install; the multi-user (daemon) install is recommended.
- **No configuration.** RF Swift enables `nix-command` and `flakes` on every call, so `nix.conf` needs no editing.
- **Easy to install.** The RF Swift installer offers to install Nix (`RFSWIFT_NIX=1`), and so does `rfswift host setup` on Linux (step 3: the Determinate installer, falling back to the official NixOS installer).
- **On Windows**, Nix runs inside a WSL 2 distribution; see [Windows](#windows-the-engine-runs-in-wsl-2).

## Quick start

```bash
rfswift container create --engine nix                   # wizard: environment, name, workspace, build mode, isolation
rfswift container create --engine nix -i sdr_light -n mysdr
rfswift container create --engine nix -i sdr_light -n mysdr --lazy   # or: nothing installed until each tool is first used
rfswift env shell mysdr                                 # re-enter it later
rfswift --engine nix container shell -c mysdr -e gqrx   # one command in it
```

To make Nix your default engine, set `RFSWIFT_ENGINE=nix` or `engine = nix` under `[general]` in `config.ini`. The plain `rfswift container create` and `container shell` commands then work on environments.

The legacy spellings `rfswift run --engine nix`, `rfswift exec --engine nix` and `rfswift nix ...` still work.

## Environments

An environment is the Nix equivalent of a container: you create it once, re-enter it, and remove it when you are done.

- **Where it lives**: `~/.rfswift/nix/environments/<name>/`.
- **Creating it** resolves the image name to a flake output, builds its closure with `nix build`, and pins it with a GC-root symlink.
- **Entering it** starts your shell with the tools on `PATH` and the workspace as working directory: `~/rfswift-workspace/<name>/` by default, changed with `--workspace`, `--cwd` or `--no-workspace` as for containers.

```bash
rfswift env catalog          # what you can create
rfswift env list             # what you created
rfswift env info mysdr       # details, pin, packages, security posture
rfswift env tools mysdr      # on-demand shims and installed extras
rfswift env search hackrf    # find a tool (add --nixpkgs for the whole pinned nixpkgs)
rfswift env remove mysdr     # delete it (add --workspace to delete captures too)
rfswift env gc               # reclaim store space; environments and their tools survive
```

`list`, `info`, `tools`, `search`, `generations`, `gl` and `udev --list` accept `--json`.

### Build modes: all at once, or on demand

| | Eager (default) | On demand (`--lazy`) |
|---|---|---|
| **What is installed at creation** | The whole tool set, built once and pinned | Nothing: each tool is a small shim |
| **First use of a tool** | Instant | The tool is built (usually downloaded) and started |
| **Later uses** | Instant, and works offline | Instant: the tool is pinned under `<env>/tools/<attribute>` (a GC root) |
| **Disk** | The full tool set | Only the tools you actually ran |
| **Rollback** | Yes, with generations | No generations (the environment stays pinned to its revision) |

- **Eager**: `rfswift container create --engine nix -i sdr_light -n mysdr` builds the whole tool set once. The first run downloads cached tools and compiles the few that are not cached; after that every entry is instant and works offline.
- **On demand**: `--lazy` prebuilds nothing. Type `gqrx` and gqrx is built and run; type `inspectrum` next and only that is built. Later calls start a pinned tool directly (about 0.03 s instead of 0.9 s through `nix run`).
- **Nothing moves behind your back**: an on-demand environment is pinned to the flake revision it was created from, so a push to RF-Swift-nix never rebuilds a tool you already have.

"Build" mostly means "download from the binary cache". Standard nixpkgs tools (GNU Radio, GQRX, Wireshark, ...) come prebuilt; only RF-Swift-nix's own derivations compile locally, unless the project's cache has them.

**Run a single tool with no environment at all:**

```bash
rfswift env run sdr_light gqrx              # build and run gqrx from the pinned set
rfswift env run sdr_light sdrpp             # the image's SDR++ (HydraSDR fork), by command name
rfswift env run mysdr inspectrum -- x.iq    # through the environment: its shim, its pin, its GL runtime
```

**Watching a build**: in a terminal you see Nix's own progress bar. The Workbench follows the same build through Nix's machine-readable log and shows:

- derivations built and remaining, and store paths fetched with their size;
- what compiles right now, with its phase and elapsed time;
- the log tail. A failed build opens the log with Nix's own reason, and the full log stays at `<env>/build.log`.

### Installing more tools

```bash
rfswift env install                                   # wizard: curated set or all of nixpkgs, shared or one environment
rfswift env install ffmpeg                             # shared profile: on PATH in every environment
rfswift env install gnuradioPackages.gr-foo --env mysdr   # this environment only
```

- A package that ships udev rules offers to install them right away.
- Environment shells export `SOAPY_SDR_PLUGIN_PATH` with every Soapy module directory of the profile and the extras, so a module installed later is found by SDR++, gqrx, SigDigger, SatDump and rtl_433.

### Updating, rebuilding and rolling back

```bash
rfswift env update --check mysdr           # preview without changing anything
rfswift env update                          # guided wizard
rfswift env update mysdr                    # update every input, rebuild, keep a rollback generation
rfswift env update --input nixpkgs mysdr    # one input (needs a writable local flake checkout)
rfswift env update --tool sdrpp mysdr       # one tool of a lazy environment or an installed extra
rfswift env rebuild mysdr                   # rebuild with the pinned lock
rfswift env generations mysdr
rfswift env rollback mysdr                  # newest previous generation, or a listed one
```

**Eager environments update transactionally:**

1. Prerequisites and a candidate closure are built first.
2. The active profile switches last, so a failed build leaves the current environment active.
3. The former closure is kept as a GC-rooted generation under `<env>/generations/`, ready for `env rollback`.

**On-demand environments**: `update --check` tells whether the pinned reference moved on, and `update` moves the pin and rebuilds the tools already built. They have no rollback generations.

Updating marks the security audit stale: run `rfswift env audit mysdr` again.

### Choosing where environments come from

The flake reference is resolved in this order:

1. `--flake`
2. `RFSWIFT_NIX_FLAKE` (a flake URL or a local path)
3. a local `RF-Swift-nix` checkout next to the working directory or the binary
4. `github:PentHertz/RF-Swift-nix`

`rfswift env versions` lists the published tags and the nightly revision you can pin with `--flake`; the Workbench create dialog has the same version picker.

## Isolation: the `--isolate` jail

By default the engine runs tools **natively**, as your user, with full access to your home, files, network and devices. That is what makes it good at driving real hardware, but it is not a sandbox: a vulnerable or untrusted tool has the same reach you do.

`--isolate` adds an optional jail that keeps the tools usable:

```bash
rfswift container create --engine nix -i sdr_light -n mysdr --isolate
```

The choice is stored on the environment, so `env shell`, the Workbench terminal and every later entry re-enter the same jail. The wizard and the Workbench create form ("Isolate (jail)") offer it too.

**What the jail hides**: your `$HOME` (including SSH keys), the host filesystem and host processes, sibling environments and other workspaces (their captures and evidence).

**What it keeps, so tools still work**: the `/nix` store and the tools, USB and serial devices (`/dev/bus/usb`, `/dev/tty{USB,ACM,S}*`, `/sys`, `/run/udev`), the X11/Wayland display, and the network including name resolution. Verified with a HydraSDR: visible to `lsusb` and openable inside the jail, while `$HOME`, SSH keys and host processes are hidden.

**How it works on each system:**

- **Linux**: [bubblewrap](https://github.com/containers/bubblewrap) with unprivileged user namespaces. Private `$HOME`, own PID/IPC/UTS namespaces, private `/tmp`; the host filesystem is hidden. The workspace is mounted at `/workspace` (and the working directory), the environment's state at `/rfswift/env` (read-only), the shared extras profile at `/rfswift/shared` (read-only), and the private home carries a `workspace` link.
- **macOS**: Apple's Seatbelt sandbox (`sandbox-exec`, part of the OS). Files keep their real paths; the policy denies every user home and re-allows only this environment's state (read-only), its workspace (read-write) and a private per-environment HOME. There is no PID namespace and no private `/tmp` on macOS; the filesystem-hiding guarantee is the same.

{{< callout type="warning" title="Ubuntu 24.04 and later: run rfswift host isolate once" >}}
Ubuntu 24.04+ restricts unprivileged user namespaces with AppArmor: only a profiled `/usr/bin/bwrap` may create one, so a Nix-built or Nix-profile bubblewrap fails with `bwrap: setting up uid map: Permission denied`.

- RF Swift prefers the distribution's `/usr/bin/bwrap` and, when the jail still cannot start, points at the fix.
- `rfswift host isolate` installs the distribution's bubblewrap package and the `bwrap-userns-restrict` AppArmor profile in one sudo call, leaving the restriction in force for every other program. `--sysctl` is the last resort that lifts it for everything.
- `rfswift doctor` has a "Nix jail (--isolate)" check, `rfswift host setup` runs it as its fifth step, the installer tests the sandbox on every run, and the Workbench engine doctor has an "Enable sandbox" button.
- Running with `sudo` is **not** the fix.
{{< /callout >}}

**Paths differ by mode**: scripts that hard-code the workspace should use `/workspace` only under Linux `--isolate`, or a relative path, which works everywhere. See [Known limits](/docs/guide/limitations/#nix-engine) for the full list.

## GUI tools and hardware on hosts that are not NixOS

### OpenGL

**The problem**: nixpkgs programs look for GPU drivers where NixOS installs them (`/run/opengl-driver`). On Ubuntu, Fedora or Arch that directory does not exist, and every OpenGL tool would fail with `EGL: Failed to get EGL display`.

**What RF Swift does** (the way nixGL does): every Linux environment ships a small `rfswift-gl` runtime, Mesa's drivers from the same nixpkgs pin, which entering the environment exports.

- **Open drivers** (Intel, AMD, nouveau, VMware, virtio and others) are served by Mesa, or llvmpipe when no hardware driver matches.
- **The proprietary NVIDIA driver**: the engine builds the matching user-space libraries once per driver version and pins them under `~/.rfswift/nix/gl/nvidia-<version>`, keeping Mesa as fallback for hybrid laptops.
- **Overrides**: `RFSWIFT_NIX_GL=mesa` forces Mesa, `RFSWIFT_NIX_GL=off` disables the runtime.
- **macOS**: nothing is exported: nixpkgs programs use Apple's OpenGL/Metal directly.

```bash
rfswift env gl                 # what this host needs, GPUs and their drivers
rfswift env gl mysdr --check   # create a context with mysdr's runtime, print the driver that answered
```

Run the check first when SDR++ or gqrx will not open a window. `rfswift-gl <program>` runs one program with the runtime by hand, and `rfsudo <tool>` keeps the display and the runtime when a tool must run as root.

### Device backends

Every SDR application in `sdr_light` and `sdr_full` is built on the same device layer:

- **SDR++** (HydraSDR fork) with its native sources, plus the vendor ones the images ship (Harogic, SignalHound BB60, Deepace KC908, on the architectures their libraries exist for).
- **RF Swift's own SoapySDR plugin set** (nixpkgs modules plus SoapyHydraSDR, SoapyRFNM, SoapyXTRX, LiteX M2SDR and uSDR), shared by gqrx, SigDigger, SatDump and rtl_433.

`SoapySDRUtil --find` inside the shell lists what is reachable.

### udev rules

In a container the tools run as root with `/dev/bus/usb` mapped in. Native tools run as your user, so HackRF, RTL-SDR, bladeRF, Airspy, LimeSDR, USRP, Proxmark and friends are only reachable without root once the udev rules their packages ship are installed on the host.

Entering an environment lists the rules that are missing and offers to install them (one `sudo`). Later:

```bash
rfswift env udev mysdr            # show, then install what is missing
rfswift env udev mysdr --list
rfswift env udev mysdr --remove   # remove what RF Swift installed
```

- Installing also creates the groups the rules rely on (`plugdev`, `bladerf`, ...) and adds you to them: log out and back in (or `newgrp plugdev`), then re-plug the device.
- The "device access" warning at entry says exactly what is wrong: a stray directory (`rfswift host devclean`), a root-owned node without a rule, a group you are not in, or a group this session has not picked up yet.
- RF Swift's own generic rules (`rfswift host udev`) cover the same hardware for containers on rootless Podman.

## Windows: the engine runs in WSL 2

Nix has no Windows port, so on Windows the engine lives inside a **WSL 2 distribution** that RF Swift provisions and drives. Nothing changes for you: `rfswift container create --engine nix`, `rfswift env install`, `rfswift env update`, typed in PowerShell or the RF Swift Console, are served by the Linux `rfswift` inside the distribution, with the same wizards, builds and shells. The Workbench uses the same backend, so Nix missions appear there as on Linux.

```powershell
rfswift env wsl setup     # systemd, Nix with flakes, the Linux rfswift CLI at the Windows version
rfswift env wsl status    # distribution, nix, rfswift, WSLg sockets, forwarded USB devices
rfswift env wsl use Ubuntu-24.04
rfswift env wsl shell
```

**What `setup` does** (it asks before each step; `--yes` answers for you):

1. Installs Ubuntu when no WSL 2 Linux distribution exists (you create a Linux user on first boot).
2. Enables systemd in `/etc/wsl.conf`, so the Nix daemon and udev run as services.
3. Installs Nix with the Determinate installer and sets `keep-derivations = false`.
4. Puts the Linux `rfswift` in `/usr/local/bin`.

Any Nix command that finds the distribution unprovisioned offers the same setup, and the [Windows installer](/docs/guide/windows/) has a "Set up Nix in WSL 2" step. Docker Desktop's and Podman's utility VMs are never used. The distribution comes from `RFSWIFT_WSL_DISTRO`, then `[nix] wsl_distro` in `config.ini`, then the default WSL 2 distribution.

- **What lives where**: environments, profiles, audit reports and default workspaces are inside the distribution (`~/.rfswift/nix/` and `~/rfswift-workspace/<name>/` of your Linux user), reachable in Explorer at `\\wsl.localhost\<distro>\home\<user>\rfswift-workspace`. A Windows path given to `--workspace`, `env export -o`, `env import` or `--flake` is translated to its `/mnt/<drive>/` view (slower than the distribution's own disk).
- **USB radios**: forward them with `rfswift usb attach` (usbipd-win). `container create`, `container shell` and `env shell` offer the picker when they detect RF hardware. One attach serves containers and Nix environments alike, since every WSL 2 distribution shares the kernel. Inside, `rfswift env udev <name>` installs the rules without a password prompt.
- **Display, sound, GPU**: WSLg provides `DISPLAY=:0` and PulseAudio. GUI tools are started on X11 (WSLg's Xwayland) because GLFW, hence SDR++, stalls for seconds at window creation on WSLg's Wayland compositor (`RFSWIFT_NIX_WAYLAND=1` keeps Wayland). Mesa gets WSLg's GPU libraries appended, but Xwayland exposes no DRI3 device, so rendering is llvmpipe in practice.
- **A tool shows only a taskbar icon and no window**: WSLg's display client (`msrdc.exe`) stopped painting after an RDP graphics error. `rfswift env wsl display-reset` restarts it in seconds; `container create`, `container shell` and `env shell` do it themselves when the event log shows the error (`RFSWIFT_WSLG_AUTORESET=0` opts out), and the Workbench engine doctor has a "Reset WSLg display" button.
- **Disk space**: `rfswift env gc` frees space inside the distribution, but the WSL 2 virtual disk does not shrink on its own. Run `wsl --shutdown` then `wsl --manage <distro> --set-sparse true` once.
- **Versions**: the Windows `rfswift.exe` and the Linux `rfswift` should match; the front end says when they differ, and `rfswift env wsl setup --update` reinstalls the Linux side at the Windows version.
- **Isolation**: `--isolate` works inside the distribution (bubblewrap built from nixpkgs on first use) and binds WSLg's display and sound sockets and `/dev/dxg` back into the jail.

## Portability

Move an environment to another machine as one archive, with its closure and its workspace:

```bash
rfswift env export mysdr -o mysdr.rfenv         # closure + workspace
rfswift env import mysdr.rfenv --name mysdr2    # on another machine
```

{{< callout type="warning" >}}
An `.rfenv` archive contains executable code. Extraction is path-safe, but that does not prove provenance: import only archives from a source you trust.
{{< /callout >}}

## Security audit

```bash
rfswift env audit mysdr                          # vulnix, syft, grype, osv-scanner, integrity, provenance, hygiene
rfswift env audit mysdr --format json,html --fail-on high
```

The posture line appears in `env info` and after each build. See [audit](/docs/commands/audit/).

## Notes and limits

- **Coverage**: not every tool in the Docker images is in nixpkgs yet. RF-Swift-nix carries its own derivations for source-built tools and the PentHertz/HydraSDR forks; proprietary vendor SDKs are opt-in and need a manual download. Anything not yet packaged is listed per environment and dropped from the shell with a trace rather than failing the build.
- **Older environments** created before a feature existed (OpenGL runtime, on-demand pins, new shims) pick it up on their next entry.
- The full list of platform constraints is in [Known limits](/docs/guide/limitations/#nix-engine).
