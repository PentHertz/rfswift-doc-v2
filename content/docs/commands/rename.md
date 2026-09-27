---
title: "rfswift container rename"
linkTitle: "container rename"
navGroup: "Containers"
level: reference
description: "Rename a container."
weight: 8
---

`rfswift container rename` gives a container a new name. Its data, settings and state don't change, and a running container keeps running. Use it to fix a typo or to name containers more clearly.

```bash
rfswift container rename -n old_container -d new_container
```

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift rename` still works and prints a notice. The flags are the same. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift container rename -n OLD_NAME -d NEW_NAME
```

## Options

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Current container name | Yes | `-n old_container` |
| `-d, --destination STRING` | New container name | Yes | `-d new_container` |

{{< callout type="info" >}}
**Container picker**: without `-n` in an interactive terminal, RF Swift shows a picker so you can choose the container to rename.
{{< /callout >}}

## Examples

### Basic usage

#### Simple rename
```bash
rfswift container rename -n old_container -d new_container
```

#### Fix a typo
```bash
rfswift container rename -n sdr_containr -d sdr_container
```

#### More descriptive name
```bash
rfswift container rename -n test -d sdr_spectrum_analysis_2024_01
```

### Everyday cases

#### Add date to container name
```bash
rfswift container rename -n client_assessment -d client_assessment_2024_01_12
```

#### Organize by project
```bash
rfswift container rename -n wifi_tools -d project_alpha_wifi_scanner
```

#### Change naming convention
```bash
# Old convention: type_number
rfswift container rename -n sdr_1 -d rtlsdr_spectrum_analyzer

# New convention: purpose_date
rfswift container rename -n test_container -d frequency_scan_2024_jan
```

#### Clarify purpose
```bash
rfswift container rename -n container1 -d bluetooth_le_scanner_building_a
```

#### Stage-based naming
```bash
# Development to production
rfswift container rename -n api_server_dev -d api_server_prod

# Testing to staging
rfswift container rename -n web_test -d web_staging
```

## What happens during rename

### What changes

Only the name changes: the container appears under its new name in `rfswift container last` and `docker ps`, and the engine's internal references are updated.

### What stays the same

Everything else stays as it was: the container ID, the data inside it, mounted folders and bindings, network settings and port mappings, capabilities and cgroup rules, its state (running or stopped), the processes running in it, and its creation date and history.

#### Example
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

You can rename a container whether it is running or stopped. A running container keeps running without interruption; a stopped one stays stopped.

#### No downtime
```bash
# Container is running
docker ps | grep web_server

# Rename while running
rfswift container rename -n web_server -d api_backend

# Still running with new name
docker ps | grep api_backend
# Processes inside container are unaffected
```

## Troubleshooting

### New name already exists

The error message is: `Error: Conflict. The container name "..." is already in use`

To fix it:
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

The error message is: `Error: No such container: old_name`

To fix it:
```bash
# List all containers
rfswift container last
```

### Invalid container name

The error message is: `Invalid container name`

Common causes: a space in the name, special characters such as `!@#$%^&*`, or a name that starts with a hyphen.

To fix it:
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

The error message is: `Permission denied` or `Cannot connect to Docker daemon`

On Linux, your user can't talk to Docker yet. Give it access once (no logout needed), then try again:
```bash
rfswift host docker-access
rfswift container rename -n old_name -d new_name
```

Or, by hand:
```bash
sudo usermod -aG docker $USER
newgrp docker
rfswift container rename -n old_name -d new_name
```

## Related commands

- [`container create`](/docs/commands/run/): create containers with clear names from the start
- [`container last`](/docs/commands/last/): see container names
- [`container shell`](/docs/commands/exec/): enter a container by name
- [`container rm`](/docs/commands/remove/): remove a container
- [`container commit`](/docs/commands/commit/): save a container's state

{{< callout >}}
**Naming tip**: pick one naming pattern and stick to it, for example `{purpose}_{project}_{date}`: `sdr_analysis_alpha_2024_01`.
{{< /callout >}}

{{< callout type="warning" >}}
**Update anything that uses the old name**: scripts, monitoring or other containers that refer to the container by name need the new name too.
{{< /callout >}}