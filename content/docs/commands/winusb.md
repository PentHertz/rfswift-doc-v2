---
title: "rfswift winusb"
linkTitle: "usb on Windows (winusb)"
navGroup: "Host & devices"
level: reference
description: "Windows USB passthrough through usbipd-win, now reached through rfswift usb."
weight: 63
---

On Windows, Docker Desktop, Podman and the Nix engine all run inside the WSL 2 virtual machine, which cannot see your USB ports. This page explains how RF Swift forwards a USB device (an SDR dongle, a HackRF, a Proxmark, a serial adapter) into WSL 2. It is built on [usbipd-win](https://github.com/dorssel/usbipd-win) and asks for as few privileges as the tool allows.

```powershell
rfswift usb attach      # pick a device, share it once, attach it to WSL 2
```

{{< callout type="info" >}}
**RF Swift v4**: use `rfswift usb ...`, which runs these commands on Windows. `rfswift winusb ...` still works. See [usb](/docs/commands/usb).
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

Forwarding a device takes two steps:

1. **Share** it: usbipd-win registers the device for forwarding.
2. **Attach** it: the device appears in WSL 2 under `/dev/bus/usb`. Every WSL 2 distribution sees it, Docker Desktop's included, because they all share one kernel.

About privileges:

- **Sharing a device the first time needs administrator rights.** RF Swift asks once per device, with a single UAC prompt for `usbipd.exe` itself (never for a shell). In scripts, `--yes` allows the prompt without asking.
- **Attaching and detaching never need administrator rights.**
- A device stays shared after a reboot. `unbind` stops sharing it (this needs administrator approval again). Use `--guid` to address a shared device that is currently unplugged.

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

`attach`, `detach`, `bind` and `unbind` take `-i, --busid` (the bus ID shown by `list`, for example `2-3`). `attach`, `bind` and `unbind` also take `-y, --yes`.

## Workflow

List your devices, attach one, create a lab, check that the lab sees it, then give the device back to Windows:

```powershell
rfswift usb list
rfswift usb attach --busid 2-3            # or just: rfswift usb attach  (picker)
rfswift container create -i sdr_light -n sdr_work
rfswift container shell -c sdr_work -e "lsusb"
rfswift usb detach --busid 2-3
```

You often don't need to attach by hand: `rfswift container create`, `container shell` and `env shell` open the same picker when they detect shared or known RF hardware. Ordinary keyboards and webcams never trigger it.

In the Workbench, the **USB passthrough...** dialog (on Docker, Podman and Nix missions) shares and attaches in one click, and also detaches, stops sharing and shows what WSL 2 currently sees.

Inside the container, a device can be opened only when `/dev/bus/usb` is mapped **and** major 189 is allowed (`c 189:* rwm`). Both are part of RF Swift's defaults, and privileged mode is not required. A bind mount alone lists the devices but cannot open them. `rfswift container create` and the Workbench check this before creating a container.

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
