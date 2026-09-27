---
title: "rfswift usb"
linkTitle: "usb"
navGroup: "Host & devices"
level: reference
description: "Attach and detach USB devices on macOS (Lima) and Windows (usbipd-win)."
weight: 61
---

On macOS and Windows, containers run inside a virtual machine that cannot see your USB ports on its own. `rfswift usb` forwards a device (an SDR, a Proxmark3, a serial adapter) into that machine so your containers and Nix environments can use it.

- **macOS**: it drives USB hot-plug in the Lima VM.
- **Windows**: it drives usbipd-win into WSL 2.
- **Linux**: there is no attach step. Devices are mapped when the container is created.

```bash
rfswift usb attach      # shows a picker of your USB devices
```

## Synopsis

{{< tabs items="macOS (Lima),Windows (usbipd),Linux" >}}
  {{< tab >}}
```bash
rfswift usb list                                  # host USB devices
rfswift usb attach --vid 0x1d50 --pid 0x604b      # forward into the Lima VM (picker when omitted)
rfswift usb detach --vid 0x1d50 --pid 0x604b      # or --devid usb-1d50-604b
rfswift usb vm-devices                            # what the VM currently sees
rfswift usb status                                # Lima VM readiness for passthrough
```

Install Lima once with `brew install qemu lima`. The VM is created and started the first time you use `--engine lima`.

For a device to work, two things are needed: the device must be attached to the VM, **and** the container must run with `--engine lima`. Docker Desktop and Podman machine cannot receive USB devices.

Details: [macusb](/docs/commands/macusb), [engine lima](/docs/commands/engine).
  {{< /tab >}}
  {{< tab >}}
```bash
rfswift usb status                    # usbipd-win version, WSL 2 distribution, shared devices
rfswift usb list                      # host devices with their usbipd state
rfswift usb attach                    # picker: share (UAC, once per device) then attach to WSL 2
rfswift usb attach --busid 2-3 --yes  # by bus ID; --yes allows the UAC prompt in scripts
rfswift usb detach --busid 2-3        # give the device back to Windows
rfswift usb bind   --busid 2-3        # share only (administrator approval)
rfswift usb unbind --busid 2-3        # stop sharing (--guid for a device that is unplugged)
rfswift usb vm-devices                # devices as seen inside WSL 2
```

This needs [usbipd-win](https://github.com/dorssel/usbipd-win) (`winget install usbipd`, or the installer bundle).

- Only **sharing** a device the first time needs administrator rights. RF Swift raises one UAC prompt for `usbipd.exe` itself, never for a shell. Attaching and detaching need no special rights.
- The picker warns you before forwarding something that looks like a keyboard or a mouse, and shows friendly names for common RF hardware (RTL-SDR, HackRF, bladeRF, Proxmark, LimeSDR, USRP, ...).
- A forwarded device is visible to every WSL 2 distribution, including Docker Desktop's and the one that hosts the Nix engine, because they all share one kernel.

Details: [winusb](/docs/commands/winusb).
  {{< /tab >}}
  {{< tab >}}
On Linux, `rfswift usb` only prints a reminder. Instead:

- pass devices when you create the container (`-s /dev/ttyUSB0`); the USB tree is mapped by default;
- or add them later with `rfswift config bindings add -c NAME -d -t /dev/ttyACM0`.

Serial ports are hot-pluggable on Docker and rootful Podman (see [config serial-hotplug](/docs/commands/config)). Rootless Podman and Nix environments run tools as your user, so they need the host udev rules: `rfswift host udev`.
  {{< /tab >}}
{{< /tabs >}}

## Inside the container

A forwarded device can be opened only when both of these are true:

- `/dev/bus/usb` is mapped into the container;
- USB device major 189 is allowed (`c 189:* rwm`).

Both are part of the RF Swift defaults, and **privileged mode is not required**. A bare bind mount is not enough: it lists the device nodes, but opening them fails with "Permission denied".

`rfswift container create` and the Workbench mission form check this before creating the container and tell you what is missing. The Workbench offers **Apply USB hotplug defaults** to fix it in one click.

On Windows, `rfswift container create`, `container shell` and `env shell` open the usbipd picker themselves when they detect shared or known RF hardware; ordinary keyboards and webcams never trigger it. The Workbench offers the same as **USB passthrough...** on Docker, Podman and Nix missions.

## Related

- [macusb](/docs/commands/macusb), [winusb](/docs/commands/winusb)
- [host udev](/docs/commands/host)
- [Known limits](/docs/guide/limitations#usb-and-devices)
