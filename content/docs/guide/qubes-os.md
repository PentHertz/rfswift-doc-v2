---
title: "Running RF Swift on QubesOS"
linkTitle: "QubesOS"
level: advanced
description: "Run RF Swift with Podman in a QubesOS AppVM, with USB radios attached from dom0."
weight: 8
---

This guide sets up RF Swift on QubesOS in a few steps. You create a **TemplateVM** that holds the dependencies, then an **AppVM** that holds RF Swift and its images, attach your USB radio to it, and run your first container.

**Why Podman?** It is the preferred engine on QubesOS: it runs rootless without any issues. See [Using Podman](/docs/guide/podman/) for general Podman guidance.

**Before you start**: plan about 90 GB of private storage for the AppVM if you want room for all images (less if you only need one or two).

{{% steps %}}

### Create a TemplateVM for the dependencies

The TemplateVM is where Podman and RF Swift's dependencies are installed. AppVMs based on it inherit them.

Go to **Menu > QubesOS Tools > Qube Manager > New qube**:

- Name it something recognizable (for example `rfswift-template`).
- Choose a color for this domain.

![Creating a new Qube](/images/docs/qubes-createqube.png "Creating a new Qube")

- Give this TemplateVM **network access temporarily**, so it can install dependencies.

![Setting up network for the TemplateVM](/images/docs/qubes-rfswiftnetwork.png "Setting up network for the TemplateVM")

Then open a terminal in the TemplateVM and run:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

![Installing dependencies in the TemplateVM](/images/docs/qubes-templateinstall.png "Installing dependencies in the TemplateVM")

{{< callout type="warning" >}}
The RF Swift binary and images **will not persist** in the TemplateVM. The script is only used here to install the system dependencies (Podman, libraries, etc.) that AppVMs inherit.
{{< /callout >}}

When it's done, switch the TemplateVM network back to **"none"** and shut it down.

### Create an AppVM for RF Swift

The AppVM holds the RF Swift binary and your images. Go to **Menu > QubesOS Tools > Qube Manager > New qube**:

- Name it (for example `rfswift`) and choose a color to recognize the domain.
- **Use the TemplateVM** you just created as its template, to inherit the dependencies.
- Set networking to `sys-firewall` (needed to pull images).

![Creating the AppVM](/images/docs/qubes-creatingappvm.png "Creating the AppVM")

**Resize its storage.** Depending on the images you want, you may need more space. In a **dom0** terminal:

```bash
qvm-volume resize rfswift:private 90GB
qvm-volume resize rfswift:root 20GB
```

Adjust the sizes to your needs: `90GB` of private storage holds all images comfortably.

### Install RF Swift

Open a terminal in the new AppVM and install RF Swift:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### Prepare the qube

A qube needs a few things a regular Linux host does not: USB devices arrive from sys-usb, and an AppVM forgets `/etc` and the rootful engines' storage at every restart. RF Swift checks and fixes this for you:

```bash
rfswift host qubes          # show what is missing
rfswift host qubes setup    # show the root script, ask, apply
```

The setup loads `vhci-hcd` at every start (so `/dev/bus/usb` exists before a device is attached), keeps the engines' storage and the Nix store across restarts, lets your user drive rootful Podman (and Docker) without `sudo`, blacklists the DVB-T driver that grabs RTL-SDR dongles, and gives root-owned workspaces back to you. In an AppVM it only writes under `/rw/config` (delete `qubes-bind-dirs.d/50_rfswift.conf` and `rc.local.d/50-rfswift.rc` to undo). `--dry-run` only prints the script; each part can be skipped (`--no-podman-socket`, `--no-rtl-blacklist`, ...). The Workbench's Engine doctor has the same action as a **Set up for Qubes** button. All flags are on the [host](/docs/commands/host/#host-qubes-qubes-os) reference page.

`rfswift host qubes` also warns when the private volume has less than 20 GiB free, with the dom0 command to grow it.

### Pull images

Pull the image(s) you want:

```bash
rfswift image pull -i sdr_full
```

Other images include `sdr_light`, `rfid`, `bluetooth`, `wifi` and more: see [Choose a toolbox](/docs/guide/list-of-images/).

### Attach your USB device to the AppVM

A container can only use a device that is attached to its AppVM first.

**With the GUI:**

1. Plug in your SDR device.
2. Left-click the **Devices** icon in the system tray.
3. Find your device (for example HackRF or RTL-SDR).
4. Select **Attach to rfswift** (or your AppVM's name).

**With the CLI (dom0):**

```bash
# List available USB devices
qvm-usb list

# Attach to your AppVM
qvm-usb attach rfswift sys-usb:2-1
```

### Create a container and start your tools

With the device attached, start the wizard:

```bash
rfswift container create
```

(`rfswift run` is the older spelling and still works.) The TUI guides you through the options:

![Running a container](/images/docs/qubes-runningacontainer.png "Running a container")

Key settings:

- **Device mount**: use `/dev/bus/usb:/dev/bus/usb` to pass all USB devices to the container.

![Device mount configuration](/images/docs/qubes-devbususb.png "Device mount configuration")

- **Privileged mode**: enable it to use the X11 display and USB devices.
- **Realtime mode**: optionally enable it to boost container processing performance.

![Realtime mode](/images/docs/qubes-realtimemode.png "Realtime mode")

Then start your tools inside the container:

```bash
sdrpp             # SDR++
urh               # Universal Radio Hacker
cyberether        # CyberEther
hackrf_info       # Test HackRF
rtl_test -t       # Test RTL-SDR
```

{{% /steps %}}

## What it looks like

![SDR++ receiving FM with a dirty antenna](/images/docs/qubes-sdrpp-fm.png "SDR++ receiving FM")

![URH-NG](/images/docs/qubes-urh.png "Universal Radio Hacker")

![CyberEther](/images/docs/qubes-cyberether.png "CyberEther")

You can also install more software later in the same container, like Ghidra:

![Ghidra running in the container](/images/docs/qubes-ghidra.png "Ghidra running in the container")

## Troubleshooting

### USB device not visible in the container

1. Check that the device is attached to the AppVM: `lsusb`.
2. Make sure you used `/dev/bus/usb:/dev/bus/usb` as device mount when creating the container.
3. Try enabling **Privileged mode**.

### An RTL-SDR stops streaming or disappears

Through sys-usb, keep USB transfers small: librtlsdr's default large asynchronous buffers (15 × 256 KiB) make the USB proxy drop the device. Use `rtl_sdr -b 16384`, the gr-osmosdr / GQRX device string `rtl=0,buflen=16384`, or sync mode (`-S`); this streams at 1 MS/s. If it still drops, give sys-usb more memory (dom0: `qvm-prefs sys-usb memory` / `maxmem`, then restart it), or assign a USB controller to this qube with `qvm-pci` for sustained high rates. With a device attached, `rfswift host qubes` prints the same advice.

### "No space left on device"

Increase the storage in dom0:

```bash
qvm-volume resize rfswift:private 50G
```

Clean up unused images:

```bash
rfswift system cleanup images
```

### Container networking fails

Check that your AppVM has a NetVM assigned:

```bash
# In dom0
qvm-prefs rfswift netvm
```

## Related

- [Using Podman](/docs/guide/podman/): Podman-specific guidance
- [Air-gapped installation](/docs/air-gapped-installation/): offline image transfer
- [Running RF Swift](/docs/guide/running-rf-swift/): general usage guide
- [Change a container after creation](/docs/guide/container-management/): add devices and capabilities later
