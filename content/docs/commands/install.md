---
title: "rfswift container install"
linkTitle: "container install"
navGroup: "Containers"
level: reference
description: "Install extra tools in a container with its install functions, or in a Nix environment."
weight: 5
---

`rfswift container install` adds a tool that isn't preinstalled in your container, using the install functions the image ships. With the Nix engine, it opens the guided package installer instead. Use it when a toolbox is missing one tool you need.

```bash
rfswift container install -c my_container
```

Without `-i`, you pick the function from a searchable list of everything the image offers, so you never have to know its name.

{{< callout type="info" >}}
**Other spellings**: the legacy `rfswift install` still works and prints a notice.
{{< /callout >}}

## Synopsis

```bash
rfswift container install -c CONTAINER                 # pick a function from a searchable list
rfswift container install -c CONTAINER -i FUNCTION     # run one by name
rfswift --engine nix container install                 # the Nix package wizard (same as: rfswift env install)
```

How it works:

- Every RF Swift image carries `/root/scripts` with install functions for tools that are not preinstalled. The [Included tools](/docs/guide/list-of-tools/) tables list each tool's function in the **Installation function** column.
- Each function takes care of the tool's dependencies, compilation and configuration.
- Without `-i`, RF Swift lists the functions found inside the container in a filterable picker.
- The function's exit status is checked: a failed build is reported with the end of its output instead of being marked as installed. Errors from apt housekeeping are only warnings.
- The Workbench offers the same picker as **Install tools...** on a mission.

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name (interactive picker if omitted) | No | `-c my_container` |
| `-i, --install STRING` | Function name to run (searchable list if omitted) | No | `-i gqrx_soft_install` |

{{< callout type="info" >}}
**Container picker**: without `-c` in an interactive terminal, RF Swift shows a picker so you can choose the container to install into.
{{< /callout >}}

## Examples

### Basic usage

#### Install SDR++
```bash
rfswift container install -c work -i sdrpp_soft_fromsource_install
```

#### Install a GNU Radio module (gr-dab)
```bash
rfswift container install -c sdr_work -i grdab_grmod_install
```

#### Install Aircrack-ng
```bash
rfswift container install -c wifi_analysis -i aircrack_soft_install
```

### Everyday cases

#### Setup new SDR container
```bash
# Create container
rfswift container create -i penthertz/rfswift_resolute:sdr_light -n sdr_custom

# Install additional tools
rfswift container install -c sdr_custom -i sdrpp_soft_fromsource_install
rfswift container install -c sdr_custom -i hackrf_devices_install
rfswift container install -c sdr_custom -i rtlsdr_devices_install

# Container now has custom toolset
rfswift container shell -c sdr_custom
```

#### Add missing tool
```bash
# You are working in the container and need another tool
rfswift container shell -c analysis
# ... you realise you need Inspectrum
exit

# Install it from your computer
rfswift container install -c analysis -i inspectrum_soft_install

# Tool now available
rfswift container shell -c analysis
inspectrum
```

#### Batch installation
```bash
# Install multiple tools
TOOLS=(
    "sdrpp_soft_fromsource_install"
    "gqrx_soft_install"
    "urh_soft_install"
    "inspectrum_soft_install"
)

for tool in "${TOOLS[@]}"; do
    echo "Installing: $tool"
    rfswift container install -c sdr_full -i "$tool"
done
```

#### Custom toolchain setup
```bash
# Create specialized container
rfswift container create -i penthertz/rfswift_resolute:corebuild -n custom_rf

# Install specific tools
rfswift container install -c custom_rf -i gnuradio_soft_install
rfswift container install -c custom_rf -i hackrf_devices_install
rfswift container install -c custom_rf -i limesdr_devices_install

# Commit as custom image
rfswift container commit -c custom_rf -i my_custom_toolchain:v1
```

## Troubleshooting

### Installation failed

An install function fails.

To fix it:
```bash
# Check container is running
rfswift container last | grep container_name

# Check internet connectivity in container
rfswift container shell -c container -e "ping -c 3 google.com"

# Check disk space
rfswift container shell -c container -e "df -h"

# See the full output by running the function yourself inside the container
rfswift container shell -c container
exit

# Update package lists first
rfswift container shell -c container -e "apt-get update"

# Then retry install
rfswift container install -c container -i function_name
```

### Function not found

The function name you gave doesn't exist in this image.

To fix it:
```bash
# Let RF Swift list the functions found inside the container
rfswift container install -c container

# Refresh the scripts inside the container (update_rfscripts), then retry
rfswift container shell -c container -e "update_rfscripts"
```

## Related commands

- [`container shell`](/docs/commands/exec/): use the tools you installed
- [`container commit`](/docs/commands/commit/): save the container once the tools are installed
- [`container create`](/docs/commands/run/): create a container
- [`container upgrade`](/docs/commands/upgrade/): move a container to a newer image
- [Add more software](/docs/guide/installing-software/): all the ways to get more tools

{{< callout type="warning" >}}
**Needs internet access**: install functions download source code and packages, so the container needs network access while they run.
{{< /callout >}}

{{< callout type="info" >}}
**Keep what you installed**: tools you add live in this container only. Commit it with `rfswift container commit` if you want to keep them after the container is removed.
{{< /callout >}}