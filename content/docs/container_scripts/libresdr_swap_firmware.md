---
title: LibreSDR FPGA Swap Utility
weight: 7
prev: /docs/container_scripts/avahi_inside_container
cascade:
  type: docs
---

# LibreSDR FPGA Swap Utility

## Overview

The `libresdr_swapfpga` utility allows you to easily switch between different FPGA firmware binaries for USRP B210/B220 devices when using them with LibreSDR. This tool provides a simple interface to backup, replace, and restore FPGA firmware files, enabling enhanced functionality with LibreSDR modifications.

## What This Utility Does

This utility manages the FPGA firmware files that control the behavior of USRP B210/B220 software-defined radio devices. It allows you to:

1. **Backup** the original USRP FPGA firmware
2. **Replace** the firmware with LibreSDR-enhanced versions
3. **Restore** the original firmware when needed

## When to Use This Utility

Use the `libresdr_swapfpga` utility when:

- You want to enhance your USRP B210/B220 with LibreSDR capabilities
- You need to switch between different FPGA firmware versions for testing
- You want to restore the original firmware for standard UHD operation

## Using the Utility

### Running the Utility

The utility must be run with root privileges:

```bash
sudo libresdr_swapfpga
```

### Main Menu Options

The utility presents a menu with four options:

```
What would you like to do?
1) Backup the original binary
2) Replace the original binary
3) Restore the backup binary
4) Exit
```

#### 1. Backup the Original Binary

Before making any changes, it's recommended to back up the original FPGA firmware:

```bash
Enter your choice [1-4]: 1
```

This creates a backup at: `/usr/share/uhd/images/usrp_b210_fpga_backup.bin`

If a backup already exists, this operation will be skipped to prevent overwriting your existing backup.

#### 2. Replace the Original Binary

To replace the original firmware with a LibreSDR version:

```bash
Enter your choice [1-4]: 2
```

You'll be presented with two replacement options:

```
Select the binary to replace the original:
1) libresdr_b210.bin
2) libresdr_b220.bin
3) Cancel
```

- `libresdr_b210.bin`: Enhanced firmware for USRP B210 devices
- `libresdr_b220.bin`: Enhanced firmware for USRP B220 devices

#### 3. Restore the Backup Binary

If you need to revert to the original firmware:

```bash
Enter your choice [1-4]: 3
```

This will restore the previously backed-up firmware file.

#### 4. Exit

To exit the utility:

```bash
Enter your choice [1-4]: 4
```

## Technical Details

### File Locations

The utility manages the following files:

- Original firmware: `/usr/share/uhd/images/usrp_b210_fpga.bin`
- Backup location: `/usr/share/uhd/images/usrp_b210_fpga_backup.bin`
- LibreSDR B210: `/rftools/sdr/libresdr/libresdr_b210.bin`
- LibreSDR B220: `/rftools/sdr/libresdr/libresdr_b220.bin`

### System Requirements

- Root privileges (required to modify files in `/usr/share/uhd/images/`)
- UHD (USRP Hardware Driver) installed
- LibreSDR firmware files

## Important Notes

- **Always backup your original firmware** before making any changes
- After changing firmware, you may need to restart any applications using the USRP device
- Some LibreSDR features may require specific software support
- The enhanced firmware may consume more power or generate more heat during operation

## Troubleshooting

### Common Issues

**Device not recognized after firmware swap:**
- Disconnect and reconnect the device
- Restart the UHD service: `sudo systemctl restart uhd`

**Errors during firmware replacement:**
- Ensure you have sufficient disk space
- Verify that the LibreSDR firmware files exist in the correct location

**Permission issues:**
- The utility must be run with sudo or as root

### Restoring from Command Line

If you need to restore the original firmware without the utility:

```bash
sudo cp /usr/share/uhd/images/usrp_b210_fpga_backup.bin /usr/share/uhd/images/usrp_b210_fpga.bin
```