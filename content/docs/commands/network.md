---
title: "rfswift network"
linkTitle: "network"
navGroup: "Networking"
level: reference
description: "Create and manage NAT networks to isolate containers from each other."
weight: 50
---

A NAT network is a private network, with its own subnet, that one or more containers can join. Containers on the same NAT network can talk to each other; containers on different NAT networks cannot. Use this to keep engagements, or groups of labs, apart from each other.

You rarely need these commands: `rfswift container create -t nat` creates a NAT network for you. `rfswift network` gives you manual control for shared or custom setups.

```bash
rfswift network create -n pentest_lab
```

## Synopsis

```bash
rfswift network list                            # list all NAT networks
rfswift network create -n NAME [--subnet CIDR]  # create one
rfswift network remove -n NAME                  # remove one
rfswift network cleanup                         # remove networks whose container is gone
```

## Subcommands

### network list

Lists every RF Swift NAT network with its subnet and the containers attached to it. It takes no options.

```bash
rfswift network list
```

### network create

Creates a named NAT network that containers can join.

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Network name | Yes | `-n pentest_lab` |
| `--subnet STRING` | Custom subnet (CIDR) | No | `--subnet 172.30.10.0/24` |

Without `--subnet`, RF Swift picks a free `/28` subnet from the `172.30.0.0/16` range. In an interactive terminal, running it without `-n` asks for the name and the subnet.

### network remove

Removes an RF Swift NAT network by name.

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-n, --name STRING` | Network name or container name | Yes | `-n pentest_lab` |

In an interactive terminal, running it without `-n` shows a list of your NAT networks and asks you to confirm before removing one.

### network cleanup

Removes leftover NAT networks whose container no longer exists. It takes no options.

```bash
rfswift network cleanup
```

## Examples

### Create a network for a lab

With an automatic subnet, or with one you choose:

```bash
rfswift network create -n pentest_lab
rfswift network create -n pentest_lab --subnet 172.30.10.0/24
```

### Put two labs on the same network

Create the network, then create two labs that join it. They can reach each other on the same subnet:

```bash
rfswift network create -n my_lab
rfswift container create -i sdr_full -n sdr_node -t nat:rfswift_nat_my_lab
rfswift container create -i wifi -n wifi_node -t nat:rfswift_nat_my_lab
```

### List and clean up

```bash
rfswift network list
rfswift network remove -n pentest_lab
rfswift network cleanup
```

### Let `container create` handle it

Most NAT networks are created by the `-t nat` flag. On its own it creates a private network for that lab; with a name, it joins an existing one:

```bash
rfswift container create -i sdr_full -n my_sdr -t nat
rfswift container create -i wifi -n wifi_tools -t nat:rfswift_nat_my_sdr
```

## Network names

RF Swift NAT networks are named `rfswift_nat_<name>` and carry the `org.rfswift.nat` label. With `-t nat` in `rfswift container create`, the network is named after the container.

## Troubleshooting

### `container create -t nat:rfswift_nat_foo` fails: the network doesn't exist

Create the network first, or use `-t nat` without a name to create one automatically:

```bash
rfswift network create -n foo
rfswift container create -i sdr_full -n my_sdr -t nat
```

### Networks remain after their containers are deleted

Remove the leftovers:

```bash
rfswift network cleanup
```

### Creating a network fails: the subnet overlaps another one

Choose a subnet that is free, or let RF Swift pick one:

```bash
rfswift network create -n my_net --subnet 10.10.0.0/24
rfswift network create -n my_net
```

## Related

- [container create](/docs/commands/run): the `-t nat` network mode
- [config ports](/docs/commands/ports): publish ports for labs on NAT networks
- [engine](/docs/commands/engine)
