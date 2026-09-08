---
title: usb
weight: 40
prev: /docs/commands/host
next: /docs/commands/audit
---

# rfswift usb

Attach and detach USB devices for RF Swift containers and Nix environments on the two platforms whose containers run inside a VM. `rfswift usb` is the cross-platform front door: on macOS it drives the Lima VM's USB hot-plug, on Windows it drives usbipd-win into WSL 2. On Linux there is no attach step; devices are mapped when the container is created.

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

Requires `brew install qemu lima`. The VM is created and started on first use of `--engine lima`; a device must be attached to the VM **and** the container must run with `--engine lima`. Docker Desktop and Podman machine cannot receive USB devices. Details: [macusb](/docs/commands/macusb), [engine lima](/docs/commands/engine).
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

Requires [usbipd-win](https://github.com/dorssel/usbipd-win) (`winget install usbipd`, or the installer bundle). Only **sharing** a device the first time needs administrator rights; RF Swift raises one UAC prompt for `usbipd.exe` itself, never a shell. Attach and detach stay unprivileged. The picker warns before forwarding keyboard- or mouse-like devices and shows friendly names for common RF hardware (RTL-SDR, HackRF, bladeRF, Proxmark, LimeSDR, USRP, ...). A forwarded device is visible to every WSL 2 distribution, including Docker Desktop's and the one hosting the Nix engine, because they share one kernel. Details: [winusb](/docs/commands/winusb).
  {{< /tab >}}
  {{< tab >}}
`rfswift usb` only prints a reminder. Pass devices at creation (`-s /dev/ttyUSB0`, the USB tree is mapped by default) or add them later with `rfswift config bindings add -c NAME -d -t /dev/ttyACM0`. Serial ports are hot-pluggable on Docker and rootful Podman ([config serial-hotplug](/docs/commands/config)). Rootless Podman and Nix environments run tools as your user and need the host udev rules: `rfswift host udev`.
  {{< /tab >}}
{{< /tabs >}}

---

## Inside the container

A forwarded device is reachable only when `/dev/bus/usb` is mapped **and** USB device major 189 is allowed (`c 189:* rwm`). Both are part of the RF Swift defaults. A bare bind mount lists the nodes but `open()` fails with "Permission denied", and **privileged mode is not required**. `rfswift container create` and the Workbench mission form check this before creating the container and say what is missing; the Workbench offers "Apply USB hotplug defaults" in one click.

`rfswift container create`, `container shell` and `env shell` on Windows offer the usbipd picker themselves when they detect shared or known RF hardware; plain keyboards and webcams never trigger it. The Workbench exposes the same as **USB passthrough...** on Docker, Podman and Nix missions.

## Related

- [macusb](/docs/commands/macusb), [winusb](/docs/commands/winusb)
- [host udev](/docs/commands/host)
- [Known limits](/docs/guide/limitations#usb-and-devices)
