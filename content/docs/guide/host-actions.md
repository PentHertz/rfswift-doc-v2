---
title: Host actions
weight: 5
next: /docs/guide/file-sharing
prev: /docs/guide/configurations
cascade:
  type: docs
---

Know we know how to run, configure, and manage images, let us see how we can also manage perform important host actions depending on the context.

## Enabling audio

When running a container, you will probably encounter the following warning notification:

```bash
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️  Warning                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Warning: Unable to connect to Pulse server at 127.0.0.1:34567                                    │
│ To install Pulse server on Linux, follow these steps:                                            │
│ 1. Update your package manager: sudo apt update (for Debian-based) or sudo yum update (for Red   │
│ Hat-based).                                                                                      │
│ 2. Install Pulse server: sudo apt install pulse-server (for Debian-based) or sudo yum install    │
│ pulse-server (for Red Hat-based).                                                                │
│ After installation, enable the module with the following command as unprivileged user:           │
│ ./rfswift host audio enable                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

That means `pulseaudio` server is not found on the default IP and TCP port (127.0.0.1:34567)

With `host audio` command you can enable or disable pulseaudio in TCP, and so to listen to the sound coming from some tools like GQRX, SDR++, etc:

```bash
rfswift host audio
...
[+] You are running version: 0.4.9 (Up to date)
Manage pulseaudio server

Usage:
  rfswift host audio [command]

Available Commands:
  enable      Enable connection
  unload      Unload TCP module from Pulseaudio server

Flags:
  -h, --help   help for audio

Use "rfswift host audio [command] --help" for more information about a command.
```

So if we want to enable `pulseaudio`, we can simply enable it with default IP and TCP port as follows:

```bash
rfswift host audio enable
``` 

If you want, you can also open the server to you LAN network, or VPN, by precising another host, and optionaly another TCP port:

```bash
rfswift host audio enable -s 10.0.0.1:34567
``` 

{{< callout type="warning" >}}
  For security reasons, it is not advised to open the port to all computer in any network, so do it carefully.
{{< /callout >}}


## Binding USB devices on a Windows host

To manage USB sharing access between host and container, a `winusb` command has been introduced to simplify all the process.

{{< callout type="warning" >}}
  This command needs `usbipd` to be installed, and Docker Desktop running.
{{< /callout >}}

To allows a USB device, we first need to identify it by first fingerprinting current devices and keeping the targeted one unplugged:

```powershell
rfswift.exe winusb list
...
BusID: 1-3, DeviceID: 8087:0032, VendorID: Intel(R), ProductID: Wireless, Description: Bluetooth(R) Not shared
BusID: 1-4, DeviceID: 1532:0270, VendorID: USB, ProductID: Input, Description: Device, Razer Blade 14 Shared
BusID: 2-4, DeviceID: 13d3:56d5, VendorID: Integrated, ProductID: Camera,, Description: Integrated IR Camera Not shared
PS C:\Users\fluxius\Downloads\RF-Swift-main (1)\RF-Swift-main>
```

Then we plug the devices we want to use and issue the `list` command once again:

```powershell
rfswift.exe winusb list
...
USB Devices:
BusID: 1-2, DeviceID: 0bda:2838, VendorID: Bulk-In,, ProductID: Interface, Description: Not shared
BusID: 1-3, DeviceID: 8087:0032, VendorID: Intel(R), ProductID: Wireless, Description: Bluetooth(R) Not shared
BusID: 1-4, DeviceID: 1532:0270, VendorID: USB, ProductID: Input, Description: Device, Razer Blade 14 Shared
BusID: 2-4, DeviceID: 13d3:56d5, VendorID: Integrated, ProductID: Camera,, Description: Integrated IR Camera Not shared
```

We can see a new device appeared `BusID: 1-2`, to attach this device, we need to run the following command **as and administrator**:

```powershell
(administrator) rfswift.exe winusb attach -i 1-2
```

If it worked well, you can see the device that switched from *Not Shared* to *Shared Status*:

```powershell
...
USB Devices:
BusID: 1-2, DeviceID: 0bda:2838, VendorID: Bulk-In,, ProductID: Interface, Description: Attached
...
```

And if you try running a container, and use for example SDRAngel to display what the device stream:


![SDRAngel on Windows](/images/docs/sdrangelwindows.png "Running SDR Angel on Windows with RTL-SDR attached")

sdrangelwindows.png