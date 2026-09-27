---
title: "rfswift container rename"
linkTitle: "container rename"
navGroup: "Containers"
level: reference
description: "Rename a container."
weight: 8
---

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift container rename`. The legacy form `rfswift rename` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

Change a container's name to a new identifier.

## Synopsis

```bash
rfswift container rename -n OLD_NAME -d NEW_NAME
```

The `rename` command changes a container's name without affecting its data, configuration, or state. This is useful for organizing containers, fixing naming mistakes, or adapting to new naming conventions.

---

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Current container name | Yes | `-n old_container` |
| `-d, --destination STRING` | New container name | Yes | `-d new_container` |

{{< callout type="info" >}}
**Interactive Picker**: When run without `-n` in an interactive terminal, RF Swift displays a scrollable container picker to select the container to rename.
{{< /callout >}}

---

## Examples

### Basic usage

**Simple rename:**
```bash
rfswift container rename -n old_container -d new_container
```

**Fix a typo:**
```bash
rfswift container rename -n sdr_containr -d sdr_container
```

**More descriptive name:**
```bash
rfswift container rename -n test -d sdr_spectrum_analysis_2024_01
```

### Real-World scenarios

**Add date to container name:**
```bash
rfswift container rename -n client_assessment -d client_assessment_2024_01_12
```

**Organize by project:**
```bash
rfswift container rename -n wifi_tools -d project_alpha_wifi_scanner
```

**Change naming convention:**
```bash
# Old convention: type_number
rfswift container rename -n sdr_1 -d rtlsdr_spectrum_analyzer

# New convention: purpose_date
rfswift container rename -n test_container -d frequency_scan_2024_jan
```

**Clarify purpose:**
```bash
rfswift container rename -n container1 -d bluetooth_le_scanner_building_a
```

**Stage-based naming:**
```bash
# Development to production
rfswift container rename -n api_server_dev -d api_server_prod

# Testing to staging
rfswift container rename -n web_test -d web_staging
```

---

## What happens during rename

### What changes

When you rename a container:
- Container name changes
- Container appears with new name in `rfswift container last` and `docker ps`
- Docker internal references update

### What stays the same

Everything else remains unchanged:
- Container ID (unchanged)
- All data inside container
- Mounted volumes and bindings
- Network configuration
- Port mappings
- Capabilities and cgroups
- Container state (running/stopped)
- Running processes (if container is running)
- Creation date and history

**Example:**
```bash
# Before rename
docker ps
# CONTAINER ID   NAME           IMAGE            CREATED
# a1b2c3d4e5f6   old_name       rfswift:sdr      2 hours ago

rfswift container rename -n old_name -d new_name

# After rename
docker ps
# CONTAINER ID   NAME           IMAGE            CREATED
# a1b2c3d4e5f6   new_name       rfswift:sdr      2 hours ago
# Same ID, new name, same creation time
```

### Container state during rename

The rename operation works on both:
- **Running containers**: Continue running without interruption
- **Stopped containers**: Remain stopped after rename

**No downtime:**
```bash
# Container is running
docker ps | grep web_server

# Rename while running
rfswift container rename -n web_server -d api_backend

# Still running with new name
docker ps | grep api_backend
# Processes inside container are unaffected
```

---

## Troubleshooting

### New name already exists

**Error:** `Error: Conflict. The container name "..." is already in use`

**Solutions:**
```bash
# Check existing containers
docker ps -a | grep new_name

# Option 1: Choose different name
rfswift container rename -n old_name -d alternative_name

# Option 2: Remove/rename conflicting container first
rfswift container rename -n new_name -d new_name_backup
rfswift container rename -n old_name -d new_name

# Option 3: Remove conflicting container
rfswift container rm -c new_name
rfswift container rename -n old_name -d new_name
```

### Source container not found

**Error:** `Error: No such container: old_name`

**Solutions:**
```bash
# List all containers
rfswift container last
```

### Invalid container name

**Error:** `Invalid container name`

**Common causes:**
- Spaces in name
- Special characters (!@#$%^&*)
- Starting with hyphen
- Uppercase and symbols mixed

**Solutions:**
```bash
# Remove spaces
rfswift container rename -n old -d my_new_container  # Not "my new container"

# Remove special characters
rfswift container rename -n old -d my_container  # Not "my-container!"

# Don't start with hyphen
rfswift container rename -n old -d my_container  # Not "-my-container"

# Use lowercase and underscores
rfswift container rename -n old -d my_sdr_container_2024
```

### Permission denied

**Error:** `Permission denied` or `Cannot connect to Docker daemon`

**Solutions:**
```bash
# Use sudo on Linux
sudo rfswift container rename -n old_name -d new_name

# Or add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then try again
rfswift container rename -n old_name -d new_name
```

---

## Related commands

- [`run`](/docs/commands/run) - Create containers with proper names from the start
- [`last`](/docs/commands/last) - View container names
- [`exec`](/docs/commands/exec) - Access containers by name
- [`remove`](/docs/commands/remove) - Remove containers
- [`commit`](/docs/commands/commit) - Save container state

---

{{< callout >}}
**Naming Tip**: Use a consistent naming convention from the start. Format like `{purpose}_{project}_{date}` makes containers easy to identify and organize: `sdr_analysis_alpha_2024_01`
{{< /callout >}}

{{< callout type="info" >}}
**No Downtime**: Renaming a running container doesn't interrupt it. Processes continue running, and all configuration remains intact. Only the name changes!
{{< /callout >}}

{{< callout type="warning" >}}
**Update Dependencies**: If scripts, monitoring systems, or other containers reference the old name, update them before or immediately after renaming to avoid broken integrations.
{{< /callout >}}