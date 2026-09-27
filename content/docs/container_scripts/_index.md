---
title: "Container scripts"
linkTitle: "Container Scripts"
level: advanced
description: "Small helper scripts that ship inside every RF Swift container, and when to use each one."
weight: 10
---

Every RF Swift container ships a few helper scripts. Each one turns a multi-step task into a single command: starting a service, swapping a firmware, or updating the scripts themselves.

The scripts are installed in every container and are on the `PATH`, so you can run them from any directory inside a lab:

```bash
# Example: Start Avahi service discovery
avahicontainer_start

# Example: Update RF scripts
update_rfscripts

# Example: Swap USRP firmware
libresdr_swapfpga
```

## Available scripts

| Script | Command | Use it to |
|---|---|---|
| [Avahi start script](/docs/container_scripts/avahi_inside_container/) | `avahicontainer_start` | Start mDNS service discovery, for example to find a PlutoSDR on the network |
| [LibreSDR FPGA swap](/docs/container_scripts/libresdr_swap_firmware/) | `libresdr_swapfpga` | Switch a USRP B210/B220 to the LibreSDR FPGA firmware, and back |
| [RF scripts update](/docs/container_scripts/rfswift_install/) | `update_rfscripts` | Update the installation scripts inside a container to their latest versions |

{{< cards >}}
  {{< card link="/docs/container_scripts/avahi_inside_container/" title="Avahi start script" subtitle="Service discovery for PlutoSDR and other network devices" >}}
  {{< card link="/docs/container_scripts/libresdr_swap_firmware/" title="LibreSDR FPGA swap" subtitle="LibreSDR firmware for USRP B210/B220, with backup and restore" >}}
  {{< card link="/docs/container_scripts/rfswift_install/" title="RF scripts update" subtitle="Keep the scripts in a container up to date" >}}
{{< /cards >}}

## If a script does not work

- Check that the script is executable: `chmod +x scriptname`.
- Check that the dependencies it needs are installed in the container.
- Check that you have the permissions the operation needs.
- See the troubleshooting section of the script's own page.
