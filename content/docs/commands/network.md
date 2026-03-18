---
title: network
weight: 19
prev: /docs/commands/ports
next: /docs/commands/last
---

# rfswift network

Manage RF Swift NAT networks for per-container network isolation.

## Synopsis

```bash
# List all NAT networks
rfswift network list

# Create a NAT network
rfswift network create -n NAME [--subnet CIDR]

# Remove a NAT network
rfswift network remove -n NAME

# Remove orphaned networks
rfswift network cleanup
```

The `network` command manages RF Swift NAT networks. These are isolated bridge networks with their own subnets, used when containers are created with `-t nat` network mode. Multiple containers can share the same NAT network to communicate with each other while remaining isolated from other networks.

{{< callout type="info" >}}
**Automatic Management**: NAT networks are typically created automatically when you use `-t nat` with `rfswift run`. These commands give you manual control for advanced setups.
{{< /callout >}}

---

## Subcommands

### network list

List all RF Swift NAT networks with their subnet allocations and associated containers.

```bash
rfswift network list
```

**No additional options.**

### network create

Create a named NAT network that containers can join.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Network name | Yes | `-n pentest_lab` |
| `--subnet STRING` | Custom subnet CIDR | No | `--subnet 172.30.10.0/24` |

If `--subnet` is omitted, RF Swift auto-allocates a `/28` subnet from the `172.30.0.0/16` range.

{{< callout type="info" >}}
**Interactive Mode**: When run without `-n` in an interactive terminal, the command prompts for the network name and subnet.
{{< /callout >}}

### network remove

Remove an RF Swift NAT network by name.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Network name or container name | Yes | `-n pentest_lab` |

{{< callout type="info" >}}
**Interactive Mode**: When run without `-n` in an interactive terminal, shows a picker of existing NAT networks with a confirmation prompt before removal.
{{< /callout >}}

### network cleanup

Remove orphaned NAT networks whose associated container no longer exists.

```bash
rfswift network cleanup
```

**No additional options.**

---

## Examples

### Create an Isolated Lab Network

```bash
# Create a network for pentesting
rfswift network create -n pentest_lab

# Create with a specific subnet
rfswift network create -n pentest_lab --subnet 172.30.10.0/24
```

### Run Containers on the Same Network

```bash
# Create the network
rfswift network create -n my_lab

# Run containers that share the network
rfswift run -i sdr_full -n sdr_node -t nat:rfswift_nat_my_lab
rfswift run -i wifi -n wifi_node -t nat:rfswift_nat_my_lab

# Both containers can communicate on the same subnet
```

### List and Clean Up

```bash
# See all NAT networks
rfswift network list

# Remove a specific network
rfswift network remove -n pentest_lab

# Clean up networks for deleted containers
rfswift network cleanup
```

### Using NAT Mode with rfswift run

NAT networks are most commonly created implicitly via the `-t nat` flag:

```bash
# Auto-creates an isolated NAT network for this container
rfswift run -i sdr_full -n my_sdr -t nat

# Join an existing network by name
rfswift run -i wifi -n wifi_tools -t nat:rfswift_nat_my_sdr
```

---

## Network Naming

RF Swift NAT networks follow the naming convention `rfswift_nat_<name>` and are labeled with `org.rfswift.nat` for identification. When using `-t nat` in `rfswift run`, the network name is derived from the container name.

---

## Troubleshooting

### Network Not Found

**Problem:** `rfswift run -t nat:rfswift_nat_foo` fails because the network doesn't exist

**Solution:**
```bash
# Create the network first
rfswift network create -n foo

# Or use -t nat (without a name) to auto-create
rfswift run -i sdr_full -n my_sdr -t nat
```

### Orphaned Networks

**Problem:** Networks remain after containers are deleted

**Solution:**
```bash
# Clean up all orphaned networks
rfswift network cleanup
```

### Subnet Conflict

**Problem:** Network creation fails due to subnet overlap

**Solution:**
```bash
# Specify a non-conflicting subnet
rfswift network create -n my_net --subnet 10.10.0.0/24

# Or let RF Swift auto-allocate
rfswift network create -n my_net
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers with `-t nat` network mode
- [`ports`](/docs/commands/ports) - Manage port bindings for containers on NAT networks
- [`engine`](/docs/commands/engine) - Container engine selection

---

{{< callout emoji="🔒" >}}
**Network Isolation**: NAT networks provide true network isolation between container groups. Containers on different NAT networks cannot communicate with each other, making this ideal for multi-tenant pentesting setups.
{{< /callout >}}
