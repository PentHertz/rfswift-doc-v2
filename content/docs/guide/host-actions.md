---
title: Host Actions
weight: 5
next: /docs/guide/file-sharing
prev: /docs/guide/configurations
cascade:
  type: docs
---

# Host Actions

After learning how to run, configure, and manage RF Swift containers and images, this section covers important host-level operations that enhance the functionality of your RF tools and containers.

## Audio Configuration

### Managing PulseAudio for Container Sound

Many RF tools like GQRX, SDR++, and SDRAngel produce audio output that requires proper configuration to be heard on your host system. RF Swift provides commands to manage the PulseAudio server for this purpose.

#### Diagnosing Audio Issues

When audio is not properly configured, you'll see this warning when running a container:

```
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

This indicates that PulseAudio is not configured to accept TCP connections on the default address (127.0.0.1:34567).

#### Audio Command Options

The `host audio` command provides options to manage PulseAudio:

```bash
rfswift host audio
```

This displays available subcommands:

```
Manage pulseaudio server

Usage:
  rfswift host audio [command]

Available Commands:
  enable      Enable connection
  unload      Unload TCP module from Pulseaudio server

Flags:
  -h, --help   help for audio
```

#### Enabling Audio Forwarding

To enable audio in containers using the default configuration:

```bash
rfswift host audio enable
```

This command:
- Loads the PulseAudio TCP module
- Configures it to listen on 127.0.0.1:34567
- Does not require sudo/administrator privileges

You should see confirmation like:

```
[+] Successfully loaded module-native-protocol-tcp with index 29
```

#### Custom Audio Configuration

You can customize the listening address and port:

```bash
rfswift host audio enable -s 10.0.0.1:34567
```

This allows audio forwarding across a network (useful for remote connections or VMs).

{{< callout type="warning" >}}
**Security Note**: Opening PulseAudio to network interfaces introduces potential security risks. Only use custom addresses on secure networks and consider using firewalls to restrict access.
{{< /callout >}}

#### Disabling Audio Forwarding

When you no longer need audio forwarding:

```bash
rfswift host audio unload
```

This removes the TCP module from PulseAudio, closing the network port.

### Troubleshooting Audio Issues

If you continue to experience audio problems after enabling the server:

1. **Verify PulseAudio is running**:
   ```bash
   pulseaudio --check
   ```

2. **Restart PulseAudio if needed**:
   ```bash
   pulseaudio -k
   pulseaudio --start
   ```

3. **Check your container's PULSE_SERVER environment variable**:
   ```bash
   rfswift exec -c my_container
   echo $PULSE_SERVER
   ```
   It should show `tcp:127.0.0.1:34567` (or your custom address)

## USB Device Management

RF Swift provides platform-specific methods for managing USB devices, which is critical for SDR hardware.

### Windows USB Management

On Windows, RF Swift includes the `winusb` command to simplify USB device sharing between the host and containers.

{{< callout type="warning" >}}
**Prerequisites**: 
- [usbipd](https://learn.microsoft.com/en-us/windows/wsl/connect-usb) must be installed
- Docker Desktop must be running
- Administrator privileges are required for attachment operations
{{< /callout >}}

#### Listing Available USB Devices

To see all USB devices connected to your system:

```powershell
rfswift winusb list
```

This displays information about each device:

```
USB Devices:
BusID: 1-2, DeviceID: 0bda:2838, VendorID: Bulk-In, ProductID: Interface, Description: Not shared
BusID: 1-3, DeviceID: 8087:0032, VendorID: Intel(R), ProductID: Wireless, Description: Bluetooth(R) Not shared
BusID: 1-4, DeviceID: 1532:0270, VendorID: USB, ProductID: Input, Description: Device, Razer Blade 14 Shared
BusID: 2-4, DeviceID: 13d3:56d5, VendorID: Integrated, ProductID: Camera, Description: Integrated IR Camera Not shared
```

#### Device Identification Strategy

To easily identify a new device:

1. Run `rfswift winusb list` **before** connecting your device
2. Connect your device (e.g., RTL-SDR, HackRF, etc.)
3. Run `rfswift winusb list` again to identify the new entry

The newly appeared device is the one you want to share.

#### Attaching USB Devices

To share a device with containers, use the `attach` command with administrator privileges:

```powershell
# Run PowerShell as Administrator
rfswift winusb attach -i 1-2
```

Where `1-2` is the BusID of your device from the list command.

You can verify the attachment was successful by running `list` again - the device should show as "Attached" rather than "Not shared".

#### Automatic SDR Device Detection

For common SDR devices, RF Swift can automatically detect and attach them:

```powershell
# Run PowerShell as Administrator
rfswift winusb attach-all-sdrs
```

This identifies common SDR devices by their vendor and product IDs and attaches them all at once.

#### Detaching USB Devices

When you're finished using a device, you can detach it:

```powershell
# Run PowerShell as Administrator
rfswift winusb detach -i 1-2
```

### Linux USB Management

On Linux, USB devices are typically accessible to containers through device bindings. You can:

1. Add devices during container creation:
   ```bash
   rfswift run -i sdr_full -n my_sdr -s /dev/ttyUSB0:/dev/ttyUSB0
   ```

2. Add devices to an existing container:
   ```bash
   rfswift bindings add -c my_sdr -s /dev/ttyUSB0:/dev/ttyUSB0
   ```

For SDR devices that use USB, ensure the relevant device files are bound:
- RTL-SDR: `/dev/bus/usb` (generally bound by default)
- Serial devices: `/dev/ttyUSB0`, `/dev/ttyACM0`, etc.
- HackRF: Typically accessible through `/dev/bus/usb`

## Common Device Examples

### RTL-SDR Setup

After connecting an RTL-SDR device:

**On Windows**:
```powershell
# Identify device (typically has vendor ID 0bda)
rfswift winusb list
# Attach device (replace 1-2 with your device's BusID)
rfswift winusb attach -i 1-2
```

**On Linux**:
```bash
# Check if device is recognized
lsusb | grep RTL
# Run container with default USB bindings
rfswift run -i sdr_full -n rtlsdr_container
```

### Using SDR Tools with Attached Devices

Once your SDR device is properly attached, you can use tools like SDRAngel:

```bash
# Inside your container
sdrangel
```

![SDRAngel on Windows](/images/docs/sdrangelwindows.png "Running SDR Angel on Windows with RTL-SDR attached")

## Next Steps

Continue to the file sharing section to learn how to exchange data between your host and containers:

{{< cards >}}
  {{< card link="/docs/guide/sharing-files/" title="File Sharing" icon="document-text" subtitle="Learn how to share files and directories between host and containers." >}}
{{< /cards >}}