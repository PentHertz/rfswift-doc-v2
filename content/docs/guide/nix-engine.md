---
title: Nix engine (native environments)
weight: 3
prev: /docs/guide/container-management
next: /docs/guide/list-of-images
cascade:
  type: docs
---

# The Nix engine: RF Swift tools without containers

RF Swift v4.0 adds a fourth engine next to Docker, Podman and Lima: **Nix**. Where the container engines run your tools inside an image, the Nix engine installs them straight onto the host as a reproducible, pinned environment. There is no daemon and no container boundary, so USB radios, audio and the GPU work without any device or socket plumbing. The tool sets are the same ones the images ship (`sdr_light`, `rfid`, `wifi`, ...), defined in the companion repository [RF-Swift-nix](https://github.com/PentHertz/RF-Swift-nix).

{{< callout type="info" >}}
**Command reference**: [env](/docs/commands/env). This page explains how the engine behaves; the reference lists every flag.
{{< /callout >}}

## When to use which engine

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

A working [Nix](https://nixos.org/download) install with flakes. The multi-user (daemon) install is recommended. RF Swift enables `nix-command` and `flakes` on every call, so `nix.conf` needs no editing. The installer offers to install Nix (`RFSWIFT_NIX=1`), and so does `rfswift host setup` (step 3, Determinate installer, falling back to the official NixOS installer).

On **Windows** Nix runs inside a WSL 2 distribution; see [Windows](#windows-the-engine-runs-in-wsl-2).

## Quick start

```bash
rfswift container create --engine nix                   # wizard: environment, name, workspace, build mode, isolation
rfswift container create --engine nix -i sdr_light -n mysdr
rfswift env shell mysdr                                 # re-enter it later
rfswift --engine nix container shell -c mysdr -e gqrx   # one command in it
```

`RFSWIFT_ENGINE=nix` or `engine = nix` under `[general]` in `config.ini` make it the default engine, so the plain `rfswift container create` and `container shell` commands then work on environments. The legacy spellings `rfswift run --engine nix`, `rfswift exec --engine nix` and `rfswift nix ...` still work.

## Environments

An environment is the Nix analogue of a container: created once, re-entered, removed. Each lives under `~/.rfswift/nix/environments/<name>/`. Creation resolves the image name to a flake output, builds its closure with `nix build` and pins it with a GC-root symlink. Entering starts your shell with the tools on `PATH` and the workspace as working directory (`~/rfswift-workspace/<name>/` by default; `--workspace`, `--cwd`, `--no-workspace` as for containers).

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

- **Eager (default)**: `rfswift container create --engine nix -i sdr_light -n mysdr` builds the whole tool set once and pins it. The first run downloads cached tools and compiles the few that are not cached; after that every entry is instant and works offline.
- **On-demand** (`--lazy`): nothing is prebuilt. Each tool becomes a shim that builds it the first time it is called. Type `gqrx` and gqrx is built and run; type `inspectrum` next and only that is built. A tool built this way is pinned under `<env>/tools/<attribute>` (a GC root) and later calls start it directly (about 0.03 s instead of 0.9 s through `nix run`). The environment itself is pinned to the flake revision it was created from, so a push to RF-Swift-nix never rebuilds a tool behind your back.

"Build" mostly means "download from the binary cache". Standard nixpkgs tools (GNU Radio, GQRX, Wireshark, ...) come prebuilt; only RF-Swift-nix's own derivations compile locally unless the project's cache has them.

You can also run a single tool with no environment at all:

```bash
rfswift env run sdr_light gqrx              # build and run gqrx from the pinned set
rfswift env run sdr_light sdrpp             # the image's SDR++ (HydraSDR fork), by command name
rfswift env run mysdr inspectrum -- x.iq    # through the environment: its shim, its pin, its GL runtime
```

In a terminal you watch Nix's own progress bar. The Workbench follows the same build through Nix's machine-readable log and shows derivations built and remaining, store paths fetched with their size, what compiles right now with its phase and elapsed time, and the log tail; a failed build opens the log with Nix's own reason, and the full log stays at `<env>/build.log`.

### Installing more tools

```bash
rfswift env install                                   # wizard: curated set or all of nixpkgs, shared or one environment
rfswift env install ffmpeg                             # shared profile: on PATH in every environment
rfswift env install gnuradioPackages.gr-foo --env mysdr   # this environment only
```

A package that ships udev rules offers to install them right away. Environment shells export `SOAPY_SDR_PLUGIN_PATH` with every Soapy module directory of the profile and the extras, so a module installed later is found by SDR++, gqrx, SigDigger, SatDump and rtl_433.

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

For eager environments an update is transactional: prerequisites and a candidate closure are built first, the active profile switches last, a failed build leaves the current environment active, and the former closure is kept as a GC-rooted generation under `<env>/generations/`. For on-demand environments `update --check` tells whether the pinned reference moved on and `update` moves the pin and rebuilds the tools already built; they have no rollback generations. Updating marks the security audit stale; run `rfswift env audit mysdr` again.

### Choosing where environments come from

The flake reference is resolved in this order: `--flake`, then `RFSWIFT_NIX_FLAKE` (a flake URL or a local path), then a local `RF-Swift-nix` checkout next to the working directory or the binary, then `github:PentHertz/RF-Swift-nix`. `rfswift env versions` lists the published tags and the nightly revision you can pin with `--flake`; the Workbench create dialog has the same version picker.

## Isolation: the `--isolate` jail

By default the engine runs tools **natively**, as your user, with full access to your home, files, network and devices. That is what makes it good at driving real hardware, but it is not a sandbox: a vulnerable or untrusted tool has the same reach you do. `--isolate` adds an optional, usability-preserving jail:

- **Linux**: [bubblewrap](https://github.com/containers/bubblewrap) with unprivileged user namespaces. Private `$HOME`, own PID/IPC/UTS namespaces, private `/tmp`; the host filesystem is hidden. The workspace is mounted at `/workspace` (and the working directory), the environment's state at `/rfswift/env` (read-only), the shared extras profile at `/rfswift/shared` (read-only), and the private home carries a `workspace` link.
- **macOS**: Apple's Seatbelt sandbox (`sandbox-exec`, part of the OS). Files keep their real paths; the policy denies every user home and re-allows only this environment's state (read-only), its workspace (read-write) and a private per-environment HOME. There is no PID namespace and no private `/tmp` on macOS; the filesystem-hiding guarantee is the same.

What the jail keeps so tools still work: the `/nix` store and the tools, USB and serial devices (`/dev/bus/usb`, `/dev/tty{USB,ACM,S}*`, `/sys`, `/run/udev`), the X11/Wayland display, and the network including name resolution. Verified with a HydraSDR: visible to `lsusb` and openable inside the jail, while `$HOME`, SSH keys and host processes are hidden. Sibling environments and other workspaces (their captures and evidence) are hidden too.

```bash
rfswift container create --engine nix -i sdr_light -n mysdr --isolate
```

The choice is stored on the environment, so `env shell`, the Workbench terminal and every later entry re-enter the same jail. The wizard and the Workbench create form ("Isolate (jail)") offer it too.

{{< callout type="warning" >}}
**Ubuntu 24.04+ restricts unprivileged user namespaces** with AppArmor: only a profiled `/usr/bin/bwrap` may create one, so a Nix-built or Nix-profile bubblewrap fails with `bwrap: setting up uid map: Permission denied`. RF Swift prefers the distribution's `/usr/bin/bwrap` and, when the jail still cannot start, points at the fix: `rfswift host isolate` installs the distribution's bubblewrap package and the `bwrap-userns-restrict` AppArmor profile in one sudo call, leaving the restriction in force for every other program. `--sysctl` is the last resort that lifts it for everything. `rfswift doctor` has a "Nix jail (--isolate)" check, `rfswift host setup` runs it as its fifth step, the installer tests the sandbox on every run, and the Workbench engine doctor has an "Enable sandbox" button. Running with `sudo` is **not** the fix.
{{< /callout >}}

Paths differ by mode: scripts that hard-code the workspace should use `/workspace` only under Linux `--isolate`, or a relative path, which works everywhere. See [Known limits](/docs/guide/limitations#nix-engine) for the full list.

## GUI tools and hardware on hosts that are not NixOS

### OpenGL

nixpkgs programs look for GPU drivers where NixOS installs them (`/run/opengl-driver`). On Ubuntu, Fedora or Arch that directory does not exist, and every OpenGL tool would fail with `EGL: Failed to get EGL display`. The engine handles this the way nixGL does: every Linux environment ships a small `rfswift-gl` runtime (Mesa's drivers from the same nixpkgs pin) that entering the environment exports. Intel, AMD, nouveau, VMware, virtio and other open drivers are served by Mesa (llvmpipe when no hardware driver matches). With the proprietary NVIDIA driver the engine builds the matching user-space libraries once per driver version and pins them under `~/.rfswift/nix/gl/nvidia-<version>`, keeping Mesa as fallback for hybrid laptops. `RFSWIFT_NIX_GL=mesa` forces Mesa, `RFSWIFT_NIX_GL=off` disables the runtime. On macOS nothing is exported: nixpkgs programs use Apple's OpenGL/Metal directly.

```bash
rfswift env gl                 # what this host needs, GPUs and their drivers
rfswift env gl mysdr --check   # create a context with mysdr's runtime, print the driver that answered
```

Run the check first when SDR++ or gqrx will not open a window. `rfswift-gl <program>` runs one program with the runtime by hand, and `rfsudo <tool>` keeps the display and the runtime when a tool must run as root.

### Device backends

Every SDR application in `sdr_light` and `sdr_full` is built on the same device layer: SDR++ (HydraSDR fork) with its native sources plus the vendor ones the images ship (Harogic, SignalHound BB60, Deepace KC908 on the architectures their libraries exist for), and RF Swift's own SoapySDR plugin set (nixpkgs modules plus SoapyHydraSDR, SoapyRFNM, SoapyXTRX, LiteX M2SDR and uSDR) shared by gqrx, SigDigger, SatDump and rtl_433. `SoapySDRUtil --find` inside the shell lists what is reachable.

### udev rules

In a container the tools run as root with `/dev/bus/usb` mapped in. Native tools run as your user, so HackRF, RTL-SDR, bladeRF, Airspy, LimeSDR, USRP, Proxmark and friends are only reachable without root once the udev rules their packages ship are installed on the host. Entering an environment lists the rules that are missing and offers to install them (one `sudo`); later:

```bash
rfswift env udev mysdr            # show, then install what is missing
rfswift env udev mysdr --list
rfswift env udev mysdr --remove   # remove what RF Swift installed
```

Installing also creates the groups the rules rely on (`plugdev`, `bladerf`, ...) and adds you to them: log out and back in (or `newgrp plugdev`), then re-plug the device. The "device access" warning at entry says exactly what is wrong: a stray directory (`rfswift host devclean`), a root-owned node without a rule, a group you are not in, or a group this session has not picked up yet. RF Swift's own generic rules (`rfswift host udev`) cover the same hardware for containers on rootless Podman.

## Windows: the engine runs in WSL 2

Nix has no Windows port, so on Windows the engine lives inside a **WSL 2 distribution** that RF Swift provisions and drives. Every command keeps the same spelling: `rfswift container create --engine nix`, `rfswift env install`, `rfswift env update`, typed in PowerShell or the RF Swift Console, is served by the Linux `rfswift` inside the distribution with the same wizards, builds and shells. The Workbench uses the same backend, so Nix missions appear there as on Linux.

```powershell
rfswift env wsl setup     # systemd, Nix with flakes, the Linux rfswift CLI at the Windows version
rfswift env wsl status    # distribution, nix, rfswift, WSLg sockets, forwarded USB devices
rfswift env wsl use Ubuntu-24.04
rfswift env wsl shell
```

`setup` asks before each step (`--yes` answers for you), installs Ubuntu when no WSL 2 Linux distribution exists (you create a Linux user on first boot), enables systemd in `/etc/wsl.conf` so the Nix daemon and udev run as services, installs Nix with the Determinate installer, sets `keep-derivations = false`, and puts the Linux `rfswift` in `/usr/local/bin`. Any Nix command that finds the distribution unprovisioned offers the same setup, and the [Windows installer](/docs/guide/windows) has a "Set up Nix in WSL 2" step. Docker Desktop's and Podman's utility VMs are never used. The distribution comes from `RFSWIFT_WSL_DISTRO`, then `[nix] wsl_distro` in `config.ini`, then the default WSL 2 distribution.

- **What lives where**: environments, profiles, audit reports and default workspaces are inside the distribution (`~/.rfswift/nix/` and `~/rfswift-workspace/<name>/` of your Linux user), reachable in Explorer at `\\wsl.localhost\<distro>\home\<user>\rfswift-workspace`. A Windows path given to `--workspace`, `env export -o`, `env import` or `--flake` is translated to its `/mnt/<drive>/` view (slower than the distribution's own disk).
- **USB radios**: forward them with `rfswift usb attach` (usbipd-win). `container create`, `container shell` and `env shell` offer the picker when they detect RF hardware. One attach serves containers and Nix environments alike, since every WSL 2 distribution shares the kernel. Inside, `rfswift env udev <name>` installs the rules without a password prompt.
- **Display, sound, GPU**: WSLg provides `DISPLAY=:0` and PulseAudio. GUI tools are started on X11 (WSLg's Xwayland) because GLFW, hence SDR++, stalls for seconds at window creation on WSLg's Wayland compositor (`RFSWIFT_NIX_WAYLAND=1` keeps Wayland). Mesa gets WSLg's GPU libraries appended, but Xwayland exposes no DRI3 device, so rendering is llvmpipe in practice.
- **A tool shows only a taskbar icon and no window**: WSLg's display client (`msrdc.exe`) stopped painting after an RDP graphics error. `rfswift env wsl display-reset` restarts it in seconds; `container create`, `container shell` and `env shell` do it themselves when the event log shows the error (`RFSWIFT_WSLG_AUTORESET=0` opts out), and the Workbench engine doctor has a "Reset WSLg display" button.
- **Disk space**: `rfswift env gc` frees space inside the distribution, but the WSL 2 virtual disk does not shrink on its own. Run `wsl --shutdown` then `wsl --manage <distro> --set-sparse true` once.
- **Versions**: the Windows `rfswift.exe` and the Linux `rfswift` should match; the front end says when they differ, and `rfswift env wsl setup --update` reinstalls the Linux side at the Windows version.
- `--isolate` works inside the distribution (bubblewrap built from nixpkgs on first use) and binds WSLg's display and sound sockets and `/dev/dxg` back into the jail.

## Portability

```bash
rfswift env export mysdr -o mysdr.rfenv         # closure + workspace
rfswift env import mysdr.rfenv --name mysdr2    # on another machine
```

An `.rfenv` archive contains executable code. Extraction is path-safe, but that does not prove provenance: import only archives from a source you trust.

## Security audit

```bash
rfswift env audit mysdr                          # vulnix, syft, grype, osv-scanner, integrity, provenance, hygiene
rfswift env audit mysdr --format json,html --fail-on high
```

The posture line appears in `env info` and after each build. See [audit](/docs/commands/audit).

## Notes and limits

- Not every tool in the Docker images is in nixpkgs yet. RF-Swift-nix carries its own derivations for source-built tools and the PentHertz/HydraSDR forks; proprietary vendor SDKs are opt-in and need a manual download. Anything not yet packaged is listed per environment and dropped from the shell with a trace rather than failing the build.
- Environments created before a feature existed (OpenGL runtime, on-demand pins, new shims) pick it up on their next entry.
- The full list of platform constraints is in [Known limits](/docs/guide/limitations#nix-engine).
