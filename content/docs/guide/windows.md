---
title: Windows
weight: 9
prev: /docs/guide/podman
next: /docs/guide/qubes-os
cascade:
  type: docs
---

# RF Swift on Windows

On Windows, containers run inside the **WSL 2** virtual machine (Docker Desktop or Podman Desktop) and the Nix engine runs inside a WSL 2 Linux distribution. RF Swift drives both from `rfswift.exe` and the Workbench, forwards your USB radios into the VM with usbipd-win, and uses WSLg for display and sound.

## Installing

Two deliverables ship with each release, for `x64` and `arm64`:

| Artifact | What it is | Who it is for |
|----------|------------|---------------|
| `RFSwift-Setup-<version>-<arch>.exe` | A bundle that installs the prerequisites you pick, then RF Swift, under **one** UAC prompt | Everyone: the one-click path from a fresh machine to a working RF Swift |
| `RFSwift-<version>-<arch>.msi` | RF Swift alone: the `rfswift` CLI on the system `PATH`, the Workbench, Start Menu shortcuts ("RF Swift Console", "RF Swift Workbench"). Installs **no** dependencies | Enterprise deployment (Intune, GPO, SCCM) and machines that already have the prerequisites |

The bundle's option page:

- **Enable WSL 2 + WSLg** (default on, skipped when present): containers live in the WSL 2 VM; WSLg provides the X11 and PulseAudio sockets RF Swift mounts into every container.
- **usbipd-win** (default on): forwards host USB devices into WSL 2. This is the whole point of RF Swift on Windows.
- **Container engine**: Docker Desktop (default), Podman Desktop, "I already have one", or **"No container engine, Nix only"** which skips engines and runs the Nix setup. Docker Desktop needs a paid subscription in larger organisations; Podman Desktop is the open-source alternative RF Swift supports equally (`--engine podman`).
- **Set up Nix in WSL 2** (default off): provisions a WSL 2 distribution with systemd, Nix with flakes and the Linux `rfswift` for the native engine. Needs network access at install time; on an air-gapped machine skip it and run `rfswift env wsl setup` later. Set `RFSWIFT_WSL_DISTRO` before running the bundle to target a specific distribution.
- **RF Swift CLI + Workbench**: always installed.

Re-running the bundle on a machine that already has a piece skips it, so it doubles as a repair tool. Silent install of the bundle passes the engine as `ContainerEngine=docker|podman|none|nix`.

```powershell
# MSI only, unattended
msiexec /i RFSwift-4.0.2-x64.msi /qn /norestart
msiexec /i RFSwift-4.0.2-x64.msi /qn ADDLOCAL=CliFeature       # CLI only
msiexec /i RFSwift-4.0.2-x64.msi /qn /l*v rfswift-install.log  # with a log
```

Feature IDs are `CliFeature` and `WorkbenchFeature`; the MSI installs to `%ProgramFiles%\RF Swift`.

{{< callout type="info" >}}
**Trust**: every dependency the bundle downloads is pinned to an exact version and SHA-256 verified before it runs; the `.msi` and `.exe` carry Sigstore build-provenance attestations (`gh attestation verify RFSwift-Setup-<version>-x64.exe --repo PentHertz/RF-Swift`) and are Authenticode-signed when the release was cut with the signing secrets. Docker Desktop, Podman Desktop and usbipd-win are vendor-signed and verified by Windows when they run.
{{< /callout >}}

Manual route: install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) in WSL 2 mode (or Podman Desktop), [usbipd-win](https://github.com/dorssel/usbipd-win) (`winget install usbipd`), and unzip `rfswift_Windows_x86_64.zip` from the [releases](https://github.com/PentHertz/RF-Swift/releases) somewhere on `PATH`.

## USB passthrough (usbipd-win)

Docker Desktop and Podman run their containers inside the WSL 2 VM, which cannot see the host USB bus. RF Swift forwards devices with usbipd-win. Only **sharing** a device the first time needs administrator rights; RF Swift asks for them through a normal UAC prompt for `usbipd.exe`, once per device. Attaching and detaching never need elevation.

```powershell
rfswift usb status                     # usbipd-win, WSL 2 distribution, shared devices
rfswift usb list                       # host devices with their usbipd state
rfswift usb attach                     # picker: shares (UAC, once) then attaches to WSL 2
rfswift usb attach --busid 2-3 --yes   # by bus ID; --yes allows the UAC prompt in scripts
rfswift container create -i sdr_light -n sdr_work    # sees /dev/bus/usb
rfswift usb detach --busid 2-3         # give the device back to Windows
```

`container create`, `container shell` and `env shell` offer the same picker when they detect shared or known RF hardware, and the Workbench exposes it as **USB passthrough...** on Docker, Podman and Nix missions. The picker warns before forwarding keyboard- or mouse-like devices and names common RF hardware. A forwarded device is visible to every WSL 2 distribution, including Docker Desktop's and the one hosting the Nix engine, because they share one kernel.

Inside the container `/dev/bus/usb` must be mapped **and** major 189 allowed (`c 189:* rwm`), both part of the defaults; privileged mode is not required. `rfswift container create` and the mission form check this before creating anything.

## Sound and display (WSLg)

No PulseAudio for Windows and no `rfswift host audio enable`: WSLg already runs an X11 server and a PulseAudio server for the WSL 2 VM, and RF Swift mounts its `/mnt/wslg` tree into every container (also `--no-x11` ones) with `DISPLAY=:0` and `PULSE_SERVER=unix:/mnt/wslg/PulseServer`. GQRX, SDR++ and friends play through your Windows audio device. If `rfswift doctor` cannot find the WSLg sockets, run `wsl --update` followed by `wsl --shutdown`.

## The Nix engine on Windows

```powershell
rfswift env wsl setup                                   # systemd, Nix (flakes), the Linux rfswift
rfswift env wsl status
rfswift container create --engine nix -i sdr_light -n lab   # served by the Linux rfswift inside WSL 2
rfswift env install gnuradioPackages.gr-foo --env lab
rfswift env udev lab                                    # device rules, no password prompt (WSL grants root)
```

Everything about it, including display resets, disk space and version alignment, is in the [Nix engine guide](/docs/guide/nix-engine#windows-the-engine-runs-in-wsl-2).

## Remote agent on Windows

Both roles work: `rfswift agent certs init` and `rfswift agent` serve TLS 1.3 + mTLS from `rfswift.exe` with Credential Manager as the vault (run the agent in a session of the same Windows user), and the Workbench connects to Linux, macOS or Windows agents. See [Remote agent](/docs/guide/remote-agent#windows-notes).

## Doctor

`rfswift doctor` on Windows reports the container engine, the usbipd-win version with connected, shared and attached counts, the default WSL 2 distribution, the WSLg X11 and audio sockets (asked from WSL, not looked up on the Windows filesystem), and the Nix engine's WSL backend.

## Related

- [usb](/docs/commands/usb), [winusb](/docs/commands/winusb)
- [Workbench](/docs/guide/workbench)
- [Known limits](/docs/guide/limitations)
