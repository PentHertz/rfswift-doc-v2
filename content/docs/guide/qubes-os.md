---
title: QubesOS
weight: 8
prev: /docs/guide/podman
---

# Running RF Swift on QubesOS

We use **Podman** which is the preferred way for QubesOS, allowing rootless mode without any issues.

The setup is straightforward: create a **TemplateVM** (to install dependencies), then an **AppVM** (to hold RF Swift and images).

{{< callout type="info" >}}
See [Using Podman](/docs/guide/podman) for general Podman guidance.
{{< /callout >}}

---

## Step 1 -- Create a TemplateVM

We need a TemplateVM where we install Podman and RF Swift dependencies. These dependencies will persist in the template and be inherited by AppVMs.

Go to: **Menu > QubesOS Tools > Qube Manager > New qube**

- Name it something recognizable (e.g. `rfswift-template`)
- Choose a color for this domain

![Creating a new Qube](/images/docs/qubes-createqube.png "Creating a new Qube")

- Provide **network temporarily** to this TemplateVM so we can install dependencies

![Setting up network for the TemplateVM](/images/docs/qubes-rfswiftnetwork.png "Setting up network for the TemplateVM")

Then open a terminal in the TemplateVM and run:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

![Installing dependencies in the TemplateVM](/images/docs/qubes-templateinstall.png "Installing dependencies in the TemplateVM")

{{< callout type="warning" >}}
The RF Swift binary and images **will not persist** in the TemplateVM. We only use this script here to install the system dependencies (Podman, libraries, etc.) that will be inherited by AppVMs.
{{< /callout >}}

Once done, switch the TemplateVM network back to **"none"** and shut it down.

---

## Step 2 -- Create an AppVM

Now create an AppVM that will hold the RF Swift binary and images:

Go to: **Menu > QubesOS Tools > Qube Manager > New qube**

- Name it properly (e.g. `rfswift`)
- Choose a color to recognize the domain
- **Use the TemplateVM** you just created as the template (to inherit the dependencies)
- Set networking to `sys-firewall` (needed to pull images)

![Creating the AppVM](/images/docs/qubes-creatingappvm.png "Creating the AppVM")

### Resize storage

Depending on the images you want, you may need more space. In **dom0** terminal:

```bash
qvm-volume resize rfswift:private 90GB
qvm-volume resize rfswift:root 20GB
```

Adjust sizes depending on your needs -- `90GB` for private can hold all images comfortably.

---

## Step 3 -- Install RF Swift and pull images

Open a terminal in your new AppVM and install RF Swift:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

Then pull the image(s) you want:

```bash
rfswift images pull -i sdr_full
```

Other available images include `sdr_light`, `rfid`, `bluetooth`, `wifi`, etc.

---

## Step 4 -- Attach USB devices

Before running a container with a device, you need to attach the USB device to your AppVM.

### Using the GUI

1. Plug in your SDR device
2. Left-click the **Devices** icon in the system tray
3. Find your device (e.g. HackRF, RTL-SDR)
4. Select **Attach to rfswift** (or your AppVM name)

### Using the CLI (dom0)

```bash
# List available USB devices
qvm-usb list

# Attach to your AppVM
qvm-usb attach rfswift sys-usb:2-1
```

---

## Step 5 -- Run a container

Once the device is attached, run an image to create a container:

```bash
rfswift run
```

The TUI will guide you through options:

![Running a container](/images/docs/qubes-runningacontainer.png "Running a container")

Key settings:

- **Device mount**: use `/dev/bus/usb:/dev/bus/usb` to pass all USB devices to the container

![Device mount configuration](/images/docs/qubes-devbususb.png "Device mount configuration")

- **Privileged mode**: enable it to use X11 display and USB devices
- **Realtime mode**: optionally enable it to boost container processing performance

![Realtime mode](/images/docs/qubes-realtimemode.png "Realtime mode")

After that, you can fire up your tools inside the container:

```bash
sdrpp             # SDR++
urh               # Universal Radio Hacker
cyberether        # CyberEther
hackrf_info       # Test HackRF
rtl_test -t       # Test RTL-SDR
```

Here are some examples of tools running on QubesOS:

![SDR++ receiving FM with a dirty antenna](/images/docs/qubes-sdrpp-fm.png "SDR++ receiving FM")

![URH-NG](/images/docs/qubes-urh.png "Universal Radio Hacker")

![CyberEther](/images/docs/qubes-cyberether.png "CyberEther")

You can also install additional software later inside the same container, like Ghidra:

![Ghidra running in the container](/images/docs/qubes-ghidra.png "Ghidra running in the container")

---

## Troubleshooting

### USB device not visible in container

1. Verify the device is attached to the AppVM: `lsusb`
2. Make sure you used `/dev/bus/usb:/dev/bus/usb` as device mount when creating the container
3. Try enabling **Privileged mode**

### "No space left on device"

Increase storage in dom0:

```bash
qvm-volume resize rfswift:private 50G
```

Clean up unused images:

```bash
rfswift cleanup images
```

### Container networking fails

Check your AppVM has a NetVM assigned:

```bash
# In dom0
qvm-prefs rfswift netvm
```

---

## Related

- [Using Podman](/docs/guide/podman) -- Podman-specific guidance
- [Air-Gapped Installation](/docs/air-gapped-installation) -- Offline image transfer
- [Running RF Swift](/docs/guide/running-rf-swift) -- General usage guide
- [Container Management](/docs/guide/container-management) -- Dynamic device/capability management
