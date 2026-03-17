---
title: macusb
weight: 29
prev: /docs/commands/winusb
---

# rfswift macusb

Manage USB device passthrough on macOS via Lima QEMU VM.

## Synopsis

```bash
# List USB devices on macOS host
rfswift macusb list

# Attach a USB device to the Lima VM
rfswift macusb attach --vid VENDOR_ID --pid PRODUCT_ID

# Detach a USB device from the Lima VM
rfswift macusb detach --vid VENDOR_ID --pid PRODUCT_ID

# List USB devices currently attached to the Lima VM
rfswift macusb vm-devices

# Check Lima VM status for USB passthrough
rfswift macusb status
```

The `macusb` command manages USB device passthrough on macOS. Docker Desktop and Podman on macOS run their own Linux VMs that **cannot forward USB devices** into containers. Lima solves this by running a QEMU VM where USB devices can be hot-plugged via the QMP protocol.

{{< callout type="warning" >}}
This command is **macOS only**. On Linux, USB devices are directly accessible via [`bindings`](/docs/commands/bindings). On Windows, use [`winusb`](/docs/commands/winusb).
{{< /callout >}}

---

## How It Works

```mermaid
graph LR
    A[macOS USB Device] -->|QMP hot-plug| B[Lima QEMU VM]
    B -->|/dev/bus/usb| C[Docker inside Lima]
    C -->|container| D[RF Swift Container]
```

On macOS, there are **two container engine modes**:

| Mode | Engine flag | USB access | Use case |
|------|-----------|------------|----------|
| **Docker Desktop** | `--engine docker` (default) | No USB | General work, no RF hardware needed |
| **Lima VM** | `--engine lima` | USB hot-plug | RF hardware, SDR dongles |

When you need USB devices in your containers, you must:
1. Attach the device to the Lima VM with `macusb attach`
2. Run your container with `--engine lima` so it runs inside Lima's Docker (where the USB device is visible)

---

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `macusb list` | List all USB devices connected to the macOS host |
| `macusb attach` | Hot-plug a USB device into the Lima VM |
| `macusb detach` | Hot-unplug a USB device from the Lima VM |
| `macusb vm-devices` | List USB devices currently forwarded into the VM |
| `macusb status` | Check Lima installation, VM status, and QMP availability |

---

### macusb list

List all USB devices connected to the macOS host using `system_profiler`. Shows device name, vendor ID, product ID, and serial number.

**No additional options.**

### macusb attach

Hot-plug a USB device from the macOS host into the Lima QEMU VM.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `--vid STRING` | USB Vendor ID (hex) | Yes | `--vid 0x1d50` |
| `--pid STRING` | USB Product ID (hex) | Yes | `--pid 0x604b` |

### macusb detach

Hot-unplug a USB device from the Lima QEMU VM.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `--vid STRING` | USB Vendor ID (hex) | With `--pid` | `--vid 0x1d50` |
| `--pid STRING` | USB Product ID (hex) | With `--vid` | `--pid 0x604b` |
| `--devid STRING` | QMP device ID | Alternative | `--devid usb-1d50-604b` |

You can detach by vendor/product ID pair or by the QMP device ID shown in `vm-devices`.

### macusb vm-devices

List USB devices currently forwarded into the Lima VM via QMP `info usb`.

**No additional options.**

### macusb status

Check the full USB passthrough setup:
- Lima installation
- rfswift VM instance status
- QMP socket availability
- Currently attached USB devices

**No additional options.**

---

### Global Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

---

## Examples

### Complete SDR Workflow on macOS

```bash
# 1. Check that Lima is ready
rfswift macusb status

# 2. List USB devices to find your SDR
rfswift macusb list
# NAME                           VENDOR ID    PRODUCT ID   SERIAL
# HackRF One                     0x1d50       0x604b       000000000000000...
# RTL2838UHIDIR                  0x0bda       0x2838

# 3. Attach HackRF to the Lima VM
rfswift macusb attach --vid 0x1d50 --pid 0x604b

# 4. Verify it's in the VM
rfswift macusb vm-devices

# 5. Run container via Lima's Docker (where USB device lives)
rfswift --engine lima run -i penthertz/rfswift_noble:sdr_light -n sdr_work

# 6. Inside the container, the device is accessible
# $ hackrf_info
# Found HackRF ...

# 7. When done, detach the device
rfswift macusb detach --vid 0x1d50 --pid 0x604b
```

### Attaching Multiple Devices

```bash
# Attach RTL-SDR and HackRF
rfswift macusb attach --vid 0x0bda --pid 0x2838
rfswift macusb attach --vid 0x1d50 --pid 0x604b

# Run container with both devices available
rfswift --engine lima run -i penthertz/rfswift_noble:sdr_full -n multi_sdr
```

### Using a Custom Lima Instance

```bash
# All macusb commands support --instance for non-default VMs
rfswift macusb list --instance my_custom_vm
rfswift macusb attach --vid 0x1d50 --pid 0x604b --instance my_custom_vm
rfswift --engine lima run -i sdr_light -n my_work
```

---

## Setup

### Prerequisites

1. **Lima** must be installed:
   ```bash
   brew install lima
   ```

2. The Lima VM must use **`vmType: qemu`** (not `vz`) for USB passthrough support.

### First-Time Setup

RF Swift can auto-create the Lima VM on first use:

```bash
# Option 1: Let RF Swift create it automatically
rfswift --engine lima run -i penthertz/rfswift_noble:sdr_light -n my_sdr
# → Detects no Lima instance, creates one, installs Docker + udev rules, starts VM

# Option 2: Create manually with the bundled template
limactl create --name rfswift lima/rfswift.yaml
limactl start rfswift
```

The auto-created VM includes:
- Docker engine inside the VM
- USB libraries (`libusb`, `libhidapi`, `libftdi`)
- Kernel modules for USB serial devices (`cp210x`, `ftdi_sio`, `ch341`)
- Udev rules for all common SDR/RF devices (HackRF, RTL-SDR, USRP, BladeRF, Airspy, PlutoSDR, LimeSDR, etc.)

### Supported RF Devices

The Lima VM comes pre-configured with udev rules for:

| Device | Vendor ID |
|--------|-----------|
| HackRF, Great Scott Gadgets | `0x1d50` |
| RTL-SDR (all variants) | `0x0bda` |
| Ettus USRP (B200/B210/B100) | `0x2500`, `0x3923`, `0xfffe` |
| Nuand BladeRF (v1/v2) | `0x2cf0` |
| Airspy, Airspy HF+ | `0x1d50`, `0x03eb` |
| ADALM-Pluto (PlutoSDR) | `0x0456`, `0x2fa2` |
| LimeSDR | `0x0403`, `0x1d50` |
| FTDI devices (probes, serial) | `0x0403` |
| STM32 (VNA, bootloaders) | `0x0483` |
| FUNcube Dongle | `0x04d8` |

---

## Troubleshooting

### Lima Not Installed

**Problem:** `macusb` commands fail because Lima is not installed

**Solution:**
```bash
brew install lima
```

### QMP Socket Not Found

**Problem:** `macusb status` reports no QMP socket

**Solution:** Your Lima VM must use `vmType: qemu`. The Apple Virtualization framework (`vmType: vz`) does not support USB passthrough.

```bash
# Check your VM config
cat ~/.lima/rfswift/lima.yaml | grep vmType
# Should show: vmType: qemu

# If it shows vz, recreate with QEMU:
limactl delete rfswift
limactl create --name rfswift lima/rfswift.yaml
limactl start rfswift
```

### Device Not Visible in Container

**Problem:** Device attached via `macusb attach` but not visible in the container

**Solution:** Make sure you're using `--engine lima`:
```bash
# Wrong: runs in Docker Desktop (no USB access)
rfswift run -i sdr_light -n my_sdr

# Correct: runs in Lima's Docker (USB devices visible)
rfswift --engine lima run -i sdr_light -n my_sdr
```

### Attach Fails with Permission Error

**Problem:** `macusb attach` returns a QMP error

**Solution:** QEMU USB passthrough may require elevated permissions on macOS:
```bash
# Check if the Lima VM is running
rfswift macusb status

# Restart the VM if needed
limactl stop rfswift && limactl start rfswift
```

---

## Related Commands

- [`--engine`](/docs/commands/engine) - Select container engine (use `--engine lima` for USB)
- [`winusb`](/docs/commands/winusb) - USB management on Windows/WSL2
- [`bindings`](/docs/commands/bindings) - Device bindings on Linux
- [`run`](/docs/commands/run) - Create containers
- [`doctor`](/docs/commands/doctor) - Diagnose environment (includes Lima checks on macOS)

---

{{< callout type="info" >}}
**Prerequisites**: Lima must be installed (`brew install lima`) and the VM must use `vmType: qemu` for USB passthrough support.
{{< /callout >}}

{{< callout type="warning" >}}
**macOS Only**: This command is exclusively for macOS hosts. On Linux, USB devices are directly accessible. On Windows, use [`winusb`](/docs/commands/winusb).
{{< /callout >}}

{{< callout emoji="💡" >}}
**Remember**: Always use `rfswift --engine lima run ...` when you need USB devices in your containers. Without `--engine lima`, containers run in Docker Desktop which has no USB access.
{{< /callout >}}
