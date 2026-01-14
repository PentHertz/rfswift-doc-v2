---
title: Container Scripts
linkTitle: 🛠️ Container Scripts
weight: 10
prev: /docs/guide
next: /docs/container_scripts/avahi_inside_container
cascade:
  type: docs
---

# RF Swift Container Scripts

## Overview

RF Swift provides several utility scripts that simplify common tasks inside containers. These scripts enable advanced functionality, streamline configuration, and help you get the most out of your RF and hardware tools.

## Available Scripts

{{< cards >}}
  {{< card link="avahi_inside_container" title="Avahi Container Script" icon="wifi" subtitle="Enable service discovery for PlutoSDR and network devices" >}}
  {{< card link="libresdr_swap_firmware" title="LibreSDR Firmware Swap" icon="chip" subtitle="Upgrade USRP B210/B220 with enhanced FPGA firmware" >}}
  {{< card link="rfswift_install" title="RF Scripts Updater" icon="refresh" subtitle="Keep your RF Swift scripts updated with the latest versions" >}}
{{< /cards >}}

## Why Container Scripts?

Container scripts extend RF Swift's capabilities by:

1. **Simplifying Complex Tasks**: Turn multi-step processes into single commands
2. **Enhancing Device Compatibility**: Improve functionality with specialized hardware
3. **Maintaining Updates**: Keep tools and utilities current with minimal effort
4. **Enabling Advanced Features**: Access capabilities not available in standard configurations

## Using Container Scripts

All container scripts are automatically installed in RF Swift containers and available in the system PATH. You can execute them directly from any directory inside the container:

```bash
# Example: Start Avahi service discovery
avahicontainer_start

# Example: Update RF scripts
update_rfscripts

# Example: Swap USRP firmware
libresdr_swapfpga
```

## Script Categories

### Service Enablement
Scripts that activate or configure services inside containers:
- **[Avahi Container Script](avahi_inside_container)**: Enables mDNS service discovery

### Hardware Enhancement
Scripts that modify or optimize hardware functionality:
- **[LibreSDR Firmware Swap](libresdr_swap_firmware)**: Enhances USRP devices with improved firmware

### Maintenance
Scripts that help keep your environment updated and optimized:
- **[RF Scripts Updater](rfswift_install)**: Synchronizes local scripts with the latest versions

## Troubleshooting

If you encounter issues with container scripts:

- Ensure the script has execute permissions (`chmod +x scriptname`)
- Check that required dependencies are installed in the container
- Verify you have the necessary permissions for the operation
- Consult the specific script documentation for troubleshooting guidance

## Next Steps

Explore each script's dedicated documentation for detailed usage instructions, examples, and technical details.