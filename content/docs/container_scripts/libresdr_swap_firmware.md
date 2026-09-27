---
title: "LibreSDR FPGA swap utility"
linkTitle: "LibreSDR FPGA swap"
level: advanced
description: "Back up, replace and restore the FPGA firmware of USRP B210/B220 boards for LibreSDR."
weight: 7
---

`libresdr_swapfpga` switches the FPGA firmware of a USRP B210 or B220 between the original UHD image and the LibreSDR versions. A short menu lets you back up the original, replace it, and restore it later.

Use it when:

- you want to add LibreSDR capabilities to a USRP B210/B220;
- you switch between FPGA firmware versions for testing;
- you want the original firmware back for standard UHD operation.

## Run it

The utility needs root privileges, because it writes to `/usr/share/uhd/images/`:

```bash
sudo libresdr_swapfpga
```

It shows a menu with four choices:

```
What would you like to do?
1) Backup the original binary
2) Replace the original binary
3) Restore the backup binary
4) Exit
```

### 1. Back up the original firmware

Do this first, before any change:

```bash
Enter your choice [1-4]: 1
```

The backup is written to `/usr/share/uhd/images/usrp_b210_fpga_backup.bin`. If a backup already exists, this step is skipped, so your first backup is never overwritten.

### 2. Replace the firmware

Install a LibreSDR firmware in place of the original:

```bash
Enter your choice [1-4]: 2
```

Then pick the image for your board:

```
Select the binary to replace the original:
1) libresdr_b210.bin
2) libresdr_b220.bin
3) Cancel
```

- `libresdr_b210.bin`: LibreSDR firmware for USRP B210 devices.
- `libresdr_b220.bin`: LibreSDR firmware for USRP B220 devices.

### 3. Restore the original firmware

Put the backed-up firmware back:

```bash
Enter your choice [1-4]: 3
```

### 4. Exit

```bash
Enter your choice [1-4]: 4
```

## Good to know

- **Back up the original firmware** before any change.
- Restart any application that uses the USRP after changing the firmware.
- Some LibreSDR features need matching software support.
- The LibreSDR firmware may draw more power or run hotter.

## Files it manages

| File | Path |
|---|---|
| Original firmware | `/usr/share/uhd/images/usrp_b210_fpga.bin` |
| Backup | `/usr/share/uhd/images/usrp_b210_fpga_backup.bin` |
| LibreSDR B210 | `/rftools/sdr/libresdr/libresdr_b210.bin` |
| LibreSDR B220 | `/rftools/sdr/libresdr/libresdr_b220.bin` |

Requirements: root privileges, UHD (the USRP Hardware Driver), and the LibreSDR firmware files above.

## Troubleshooting

### The device is not recognised after the swap

Unplug the device and plug it back in, then restart the UHD service: `sudo systemctl restart uhd`.

### The replacement fails

Check that there is enough free disk space, and that the LibreSDR firmware files are at the paths listed above.

### Permission errors

Run the utility with `sudo` or as root.

### Restore without the utility

Copy the backup over the original by hand:

```bash
sudo cp /usr/share/uhd/images/usrp_b210_fpga_backup.bin /usr/share/uhd/images/usrp_b210_fpga.bin
```
