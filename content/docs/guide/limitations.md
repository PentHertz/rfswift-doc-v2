---
title: Known limits
weight: 13
prev: /docs/guide/remote-agent
next: /docs/guide/vpn
cascade:
  type: docs
---

# Known limits and platform constraints

RF Swift runs on three operating systems, four engines and inside VMs on two of them. Some combinations cannot do everything. This page collects the constraints in one place, engine by engine, so you can pick the right setup before an engagement.

{{< callout type="info" >}}
`rfswift doctor` reports most of these for your host, and the pre-creation checks of `rfswift container create` and the Workbench name the devices an engine cannot map before anything is created.
{{< /callout >}}

## Engines at a glance

| | Docker | Podman | Lima (macOS) | Nix |
|---|---|---|---|---|
| Runs on | Linux, macOS (Desktop), Windows (Desktop, WSL 2) | Linux, macOS (machine), Windows (Desktop, WSL 2) | macOS | Linux, macOS, Windows (inside WSL 2) |
| Isolation | Container | Container, user namespace when rootless | Container inside a VM | None by default; `--isolate` jail |
| USB devices | Linux: mapped. Windows: usbipd into WSL 2. macOS: **no** | Linux: mapped (rootless needs host udev rules). Windows: usbipd. macOS: **no** | Yes, hot-plug into the VM | Direct (host udev rules needed) |
| Serial hot-plug | Yes | Rootful only | No (VM) | Not needed |
| cgroup device rules | Yes | Rootful only | Yes (in VM) | Not applicable |
| Realtime ulimits | Yes | Rootless: only up to your host hard limits | Yes | Host limits |
| GUI | X11 / WSLg / XQuartz+EGL | same | XQuartz+EGL | Native, embedded GL runtime |
| Audio | Host TCP module / WSLg | same | Host TCP module through the VM | Native |
| GPU | `--gpus` with the vendor runtime | same | krunkit VM: Vulkan only, no USB | Native drivers |

## USB and devices

- **macOS with Docker Desktop, OrbStack or Podman machine**: no USB, serial, audio or GPU passthrough into the VM. Use `--engine lima` for hardware; the device check points there.
- **Lima on macOS**: a device must be attached to the VM (`rfswift usb attach`) and is absent from the VM otherwise; the pre-creation check lists such devices. USB and GPU need different VM backends on Apple Silicon: the QEMU VM (`--engine lima`) has USB, the krunkit VM (`--gpu`, instance `rfswift-gpu`) has Vulkan compute and **no** USB. They are separate instances with separate images and containers.
- **Windows**: containers run in the WSL 2 VM, which cannot see the host USB bus; forward devices with usbipd-win (`rfswift usb attach`). Sharing a device the first time needs one administrator approval per device; attach and detach never do. A forwarded device is visible to every WSL 2 distribution.
- **Inside a container** a USB device is reachable only when `/dev/bus/usb` is mapped **and** `c 189:* rwm` is allowed. A bind mount alone lists the nodes but cannot open them. Privileged mode is not required.
- **Rootless Podman** allows neither cgroup device rules nor `mknod`: rules are dropped with a warning, root-only nodes (`/dev/console`, `/dev/tty*`, `/dev/vhci`, `/dev/uinput`, ...) are left out, ulimits above your host hard limits (realtime `rtprio`, `memlock`, `nice`) are skipped, and serial ports must be present at creation. Devices you may open on the host stay usable inside (supplementary groups are kept with the crun runtime); install `rfswift host udev` so they are yours.
- **Serial hot-plug** (`/dev/ttyACM*`, `/dev/ttyUSB*`, `/dev/ttyAMA*`) works on Docker and rootful Podman only.
- A device node bind-mounted while unplugged used to leave a root-owned empty directory in its place; RF Swift no longer creates such mounts and `rfswift host devclean` removes old ones.
- **Linux desktops**: Docker runs containers as root and needs no udev setup; rootless Podman and Nix environments need the host rules (`rfswift host udev`, or the rules of the environment's packages with `rfswift env udev`). Rules inside a container are never evaluated.

## Display and audio

- **macOS**: windows open through XQuartz. XQuartz's GLX gives Mesa no usable OpenGL context, so RF Swift makes containers create contexts through EGL (`RFSWIFT_GL_PLATFORM=egl`, honoured by Qt, SDL and a preloaded GLFW shim). Rendering is software (llvmpipe). Images built before this change keep failing with `GLX: Failed to create context`; `--desktop` (noVNC) is the alternative there.
- **Windows**: display and sound come from WSLg (`DISPLAY=:0`, `PULSE_SERVER=unix:/mnt/wslg/PulseServer`); there is no PulseAudio for Windows and `rfswift host audio enable` only checks WSLg. If `rfswift doctor` cannot find the WSLg sockets, run `wsl --update` then `wsl --shutdown`. A GUI tool that shows only a taskbar icon needs `rfswift env wsl display-reset` (or restarts automatically).
- **Linux and macOS**: container audio needs the host audio server's TCP module; `container create`, the Workbench and `rfswift host audio enable` load it, `host audio unload` removes it. The Nix engine plays sound natively.
- **SSH-forwarded X11** sessions get the active Xauthority cookie mounted read-only; local sessions rely on `xhost` local ACLs.

## Nix engine

- **Windows**: Nix has no Windows port; the engine runs inside a WSL 2 distribution that RF Swift provisions. Environments and workspaces live inside it; Windows paths given to `--workspace`, `env export`, `env import` and `--flake` are translated to `/mnt/<drive>` (slower). Docker Desktop's and Podman's utility distributions are never used. Rendering is llvmpipe (Xwayland has no DRI3). Space freed by `env gc` reaches the Windows drive only once the WSL virtual disk is sparse or compacted.
- **Isolation**: `--isolate` is Linux (bubblewrap) and macOS (Seatbelt) only. On macOS there is no PID/IPC namespace and no private `/tmp`; paths are not remapped (no `/workspace`). On Linux the workspace is remapped to `/workspace`. Ubuntu 24.04+ needs `rfswift host isolate` once (AppArmor-profiled bubblewrap); a Debian kernel with `kernel.unprivileged_userns_clone=0` gets its own hint. The jail keeps the network and the display: it hides files and processes, it is not a full security sandbox.
- **Rollback**: only eager environments keep rollback generations; on-demand (`--lazy`) environments are pinned to a revision and have none. `env update --input` needs a writable local flake checkout; a GitHub reference can only be refreshed as a whole. Pure environments have nothing pinned to preserve.
- **Coverage**: not every tool of the Docker images is in nixpkgs yet; unpackaged tools are listed per environment and dropped with a trace. Proprietary vendor SDKs are opt-in and need a manual download.
- **OpenGL**: on non-NixOS Linux the embedded Mesa (or the NVIDIA libraries matching the loaded kernel module) is exported; a proprietary NVIDIA version that cannot be fetched falls back to Mesa with a warning. macOS needs nothing.
- **Trust**: an `.rfenv` archive is executable code. Import only trusted exports.

## Remote-agent mode

The full list is in the [remote agent guide](/docs/guide/remote-agent#limits-of-remote-agent-mode). In short:

- A valid client certificate is full command execution as the agent's user: no roles, revocation or rate limiting. Requests are logged with the client fingerprint. Loopback plus VPN or SSH tunnel is the supported deployment; see [Remote agent hardening](/docs/security/remote-agent).
- The agent must run as the user whose vault holds the key passwords; services under another account cannot start it.
- No CSR enrollment yet: client keys are issued on the agent host and travel in a passphrase-protected file.
- Caps: 16 MiB of command output, 16 MiB per artifact transfer, 5,000 files per workspace listing, 4 MiB per terminal poll, 2 MiB per request body; 8-second connect probe; server read and idle timeouts of 15 and 30 seconds.
- Not routed remotely: Lima VM start and stop, the MCP coding-agent bridge, the Workbench store (notes, findings, captures, reports, secrets). The mission workspace stays on the agent host.
- Older agents reject nothing silently: creation through an outdated agent is refused rather than run without the requested protections. Keep agent and Workbench versions aligned.
- Only containers with the `org.container.project=rfswift` label are listed.
- The CLI is not a remote client; the Workbench is.

## Workbench

- One mission is one target (a container or a Nix environment). Nix environments have no start/stop lifecycle; their commands run through the console.
- Environment CVE audits are never promoted into mission findings automatically, and are excluded from finding totals and PwnDoc exports.
- Secret values live in the OS credential vault only and are excluded from project exports, findings, reports and evidence indexes.
- The Workbench binary cannot be a static executable on Linux (it links GTK and WebKit): use the AppImage or the distro-linked package matching your system's WebKit; a mismatched WebKit can render a blank window.
- The MCP bridge is local stdio only, off by default, and exposes only the tools you enable (`read`, plus `--mcp-write`, plus `--mcp-exec`). RF Swift never calls a model API itself.
- Container configuration changes from the GUI on Linux Docker need root once per change (a polkit prompt); Podman uses commit-and-recreate and leaves a snapshot image per change. Either path restarts the container.

## Installer and packages

- The one-line installer needs a way to get root for the system steps (sudo or a root shell). On a stock Debian the first user is not in `sudo`; the script offers the Debian wiki fix or runs from `su -`. A user-local tarball install works without root.
- Native packages are used on the stable channel by default (deb, rpm, pacman, Homebrew cask); `RFSWIFT_PKG_FORMAT=tarball` forces the tarball. A packaged `rfswift` is upgraded with the package, and `rfswift update` says so instead of overwriting it.
- The Workbench AppImage is offered for Linux x86-64; native Workbench archives exist for Linux x86-64 and arm64, macOS universal, and Windows x64 and arm64.
- Build-provenance attestation checks need a recent, logged-in GitHub CLI (2.49+); otherwise only the SHA-256 manifest is verified and the manual command is printed.
- Third-party bootstrap scripts (Docker's convenience installer, the Determinate Nix installer) are external trust roots; air-gapped or hardened deployments should use audited, version-pinned packages and [air-gapped installation](/docs/air-gapped-installation).
- Docker Desktop requires a paid subscription in larger organisations; the Windows bundle offers Podman Desktop as the open-source alternative.

## Architecture support

- Linux: x86_64, arm64, riscv64 for the CLI and the images (`sdr_gnuradio4` and the GPU-accelerated SDR variants are amd64 or amd64/arm64 only).
- macOS: universal CLI and Workbench; Lima USB passthrough on Apple Silicon and Intel, the krunkit GPU VM on Apple Silicon with macOS 14+.
- Windows: x64 and arm64 installers; WSL 2 is required for any container or Nix work.
