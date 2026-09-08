---
title: install
weight: 25
prev: /docs/commands/completion
next: /docs/commands/ulimits
---

# rfswift container install

Install extra tools in a container with the install functions its image ships, or in a Nix environment with the guided package installer.

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift container install`. The legacy `rfswift install` still works and prints a notice.
{{< /callout >}}

## Synopsis

```bash
rfswift container install -c CONTAINER                 # pick a function from a searchable list
rfswift container install -c CONTAINER -i FUNCTION     # run one by name
rfswift --engine nix container install                 # the Nix package wizard (same as: rfswift env install)
```

Every RF Swift image carries `/root/scripts` with install functions for tools that are not preinstalled (`sdrpp_soft_install`, `gnuradio_modules_install`, ...). Without `-i`, RF Swift lists the functions found inside the container in a filterable picker, so you never have to look up a function name. The function's exit status is checked: a failed build is reported with the tail of its output instead of being called installed; apt housekeeping errors are only warnings. The Workbench offers the same picker as **Install tools...** on a mission.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name (interactive picker if omitted) | No | `-c my_container` |
| `-i, --install STRING` | Function name to execute (searchable list if omitted) | No | `-i sdrpp_soft_install` |

{{< callout type="info" >}}
**Interactive Picker**: When run without `-c` in an interactive terminal, RF Swift displays a scrollable container picker to select the installation target.
{{< /callout >}}

---

## Examples

### Basic Usage

**Install SDR++ software:**
```bash
rfswift install -c work -i sdrpp_soft_install
```

**Install GNU Radio modules:**
```bash
rfswift install -c sdr_work -i gnuradio_modules_install
```

**Install wireless tools:**
```bash
rfswift install -c wifi_analysis -i wireless_tools_install
```

### Real-World Scenarios

**Setup new SDR container:**
```bash
# Create container
rfswift run -i penthertz/rfswift_resolute:sdr_light -n sdr_custom

# Install additional tools
rfswift install -c sdr_custom -i sdrpp_soft_install
rfswift install -c sdr_custom -i hackrf_tools_install
rfswift install -c sdr_custom -i rtlsdr_tools_install

# Container now has custom toolset
rfswift exec -c sdr_custom
```

**Add missing tool:**
```bash
# Working in container, need additional tool
rfswift exec -c analysis
# Realize you need inspectrum
exit

# Install from host
rfswift install -c analysis -i inspectrum_install

# Tool now available
rfswift exec -c analysis
inspectrum
```

**Batch installation:**
```bash
# Install multiple tools
TOOLS=(
    "sdrpp_soft_install"
    "gqrx_install"
    "urh_install"
    "inspectrum_install"
)

for tool in "${TOOLS[@]}"; do
    echo "Installing: $tool"
    rfswift install -c sdr_full -i "$tool"
done
```

**Custom toolchain setup:**
```bash
# Create specialized container
rfswift run -i penthertz/rfswift_resolute:base -n custom_rf

# Install specific tools
rfswift install -c custom_rf -i gnuradio_install
rfswift install -c custom_rf -i hackrf_tools_install
rfswift install -c custom_rf -i limesuite_install

# Commit as custom image
rfswift commit -c custom_rf -i my_custom_toolchain:v1
```

---

## Troubleshooting

### Installation Failed

**Problem:** Installation function fails

**Solutions:**
```bash
# Check container is running
rfswift last | grep container_name

# Check internet connectivity in container
rfswift exec -c container -e "ping -c 3 google.com"

# Check disk space
rfswift exec -c container -e "df -h"

# Try with more verbose output
rfswift exec -c container
# Run installation command manually to see errors
exit

# Update package lists first
rfswift exec -c container -e "apt-get update"

# Then retry install
rfswift install -c container -i function_name
```

### Function Not Found

**Problem:** Installation function doesn't exist

**Solutions:**
```bash
# Let RF Swift list the functions found inside the container
rfswift container install -c container

# Refresh the scripts inside the container (update_rfscripts), then retry
rfswift container shell -c container -e "update_rfscripts"
```

---

## Related Commands

- [`exec`](/docs/commands/exec) - Execute commands after installation
- [`commit`](/docs/commands/commit) - Save container after installations
- [`run`](/docs/commands/run) - Create container for installations
- [`upgrade`](/docs/commands/upgrade) - Upgrade container with new tools

---

{{< callout emoji="🔧" >}}
**Automated Setup**: The `install` command uses predefined functions that handle dependencies, compilation, and configuration automatically. No need to manually compile or configure!
{{< /callout >}}

{{< callout type="warning" >}}
**Internet Required**: Installation functions download source code and packages from the internet. Ensure your container has network access during installation!
{{< /callout >}}

{{< callout type="info" >}}
**Commit After Installing**: After installing tools, commit your container with `rfswift commit` to preserve your work. Otherwise, changes are lost if the container is removed!
{{< /callout >}}