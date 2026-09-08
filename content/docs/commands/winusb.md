---
title: winusb
weight: 28
prev: /docs/commands/ulimits
next: /docs/commands/macusb
---

# rfswift winusb

USB passthrough on Windows: forward host USB devices (SDR dongles, HackRF, Proxmark, serial adapters) into the WSL 2 virtual machine where Docker Desktop, Podman and the Nix engine run. Built on [usbipd-win](https://github.com/dorssel/usbipd-win) with the least privilege the tool allows.

{{< callout type="info" >}}
**RF Swift v4**: the cross-platform front door is `rfswift usb ...`, which runs these commands on Windows. `rfswift winusb ...` remains available. See [usb](/docs/commands/usb).
{{< /callout >}}

## Synopsis

```powershell
rfswift usb status                     # usbipd-win version, WSL 2 distribution, shared devices
rfswift usb list                       # host devices with their usbipd state
rfswift usb attach [--busid 2-3] [--yes]
rfswift usb detach [--busid 2-3]
rfswift usb bind   [--busid 2-3] [--yes]
rfswift usb unbind [--busid 2-3 | --guid GUID] [--yes]
rfswift usb vm-devices                 # devices as seen inside WSL 2
```

## Requirements

- Windows 10 or 11 with WSL 2 (installed by the RF Swift installer bundle, or `wsl --install`).
- usbipd-win 4.0 or later (`winget install usbipd`, or the installer bundle).
- Docker Desktop or Podman Desktop in WSL 2 mode, or the Nix engine in a WSL 2 distribution.

## How it works

Containers on Windows run inside the WSL 2 VM, which cannot see the host USB bus. usbipd-win **shares** a device (registers it for forwarding) and **attaches** it to WSL 2, where it appears under `/dev/bus/usb` for every distribution, Docker Desktop's included, because they share one kernel.

- **Sharing a device the first time needs administrator rights.** RF Swift requests them through a single UAC prompt for `usbipd.exe` itself, never a shell, once per device. `--yes` allows the prompt without asking, for scripts.
- **Attaching and detaching never need elevation.**
- A device stays shared after a reboot; `unbind` forgets it (administrator approval again; `--guid` addresses a shared device that is currently unplugged).

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | Host devices with bus ID, vendor and product, and usbipd state (`host`, `shared`, `attached`, `unplugged`). Common RF hardware gets a friendly name (RTL-SDR, HackRF, bladeRF, Proxmark, LimeSDR, USRP, ...) |
| `attach` | Share if needed (UAC, once) and attach to WSL 2. Without `--busid` an interactive picker opens; keyboard- and mouse-like devices are warned about before forwarding |
| `detach` | Give the device back to Windows |
| `bind` | Share only (administrator approval) |
| `unbind` | Stop sharing (administrator approval) |
| `status` | usbipd-win version, connected, shared and attached counts, the default WSL 2 distribution |
| `vm-devices` | `/dev/bus/usb` and `lsusb` as seen inside WSL 2 |

`attach`, `detach`, `bind` and `unbind` take `-i, --busid` (the bus ID from `list`, for example `2-3`); `attach`, `bind` and `unbind` take `-y, --yes`.

## Workflow

```powershell
rfswift usb list
rfswift usb attach --busid 2-3            # or just: rfswift usb attach  (picker)
rfswift container create -i sdr_light -n sdr_work
rfswift container shell -c sdr_work -e "lsusb"
rfswift usb detach --busid 2-3
```

`rfswift container create`, `container shell` and `env shell` offer the same picker themselves when they detect shared or known RF hardware; plain keyboards and webcams never trigger the question. In the Workbench the dialog is **USB passthrough...** on Docker, Podman and Nix missions, with one-click share and attach, detach, unshare and a view of what WSL 2 currently sees.

Inside the container `/dev/bus/usb` must be mapped **and** major 189 allowed (`c 189:* rwm`), both part of RF Swift's defaults; a bind mount alone lists the devices but cannot open them, and privileged mode is not required. `rfswift container create` and the Workbench check this before creating a container.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `usbipd-win is not installed` | `winget install usbipd`, then open a new terminal |
| "administrator approval was declined" | Accept the UAC prompt, or run `usbipd bind --busid 2-3` once in an administrator terminal |
| Device attached but the tool does not see it | Check `rfswift usb vm-devices`; make sure the container maps `/dev/bus/usb` with the USB cgroup rule (`rfswift usb`, or "Apply USB hotplug defaults" in the Workbench) |
| Device disappears after a replug | Attach it again (`rfswift usb attach --busid 2-3`); the container needs no re-creation when `/dev/bus/usb` is mapped |
| Windows cannot use the device any more | It is attached to WSL 2: `rfswift usb detach --busid 2-3` |
| The Nix environment cannot open the device without root | `rfswift env udev <name>` inside the distribution (no password prompt) |

## Related

- [usb](/docs/commands/usb), [Windows guide](/docs/guide/windows)
- [doctor](/docs/commands/doctor) reports the usbipd-win state
