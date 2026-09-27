---
title: "rfswift config capabilities"
linkTitle: "config capabilities"
navGroup: "Runtime configuration"
level: reference
description: "Add or remove Linux capabilities on an existing container."
weight: 42
---

`rfswift config capabilities` grants or removes individual Linux privileges (capabilities) on a container you already created. Use it when a tool fails with “Operation not permitted”: give the container only the privilege the tool needs, instead of running it fully privileged.

The most common use lets Wi-Fi and network tools manage interfaces:

```bash
rfswift config capabilities add -c wifi -p NET_ADMIN
```

{{< callout type="info" title="What happens when you apply a change" >}}
The container restarts, so save your work first. On Linux with Docker, the change is applied in place after one `sudo` prompt. On Podman, the container is committed and created again; add `--recreate` to use that method on Docker too. The shorter spelling `rfswift capabilities` also works. See [config](/docs/commands/config).
{{< /callout >}}

## Synopsis

```bash
rfswift config capabilities add -c CONTAINER -p CAPABILITY
rfswift config capabilities rm  -c CONTAINER -p CAPABILITY
```

## Options

`add` and `rm` take the same options:

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-c, --container STRING` | The container, by name or ID | Yes | `-c my_container` |
| `-p, --capability STRING` | The capability to add or remove | Yes | `-p NET_ADMIN` |

## Common capabilities

### Network

| Capability | What it allows | Typical use | Risk |
|---|---|---|---|
| `NET_ADMIN` | Network administration: interfaces, routes, iptables | Wi-Fi monitor mode, packet capture, network changes | Medium: can change the network configuration |
| `NET_RAW` | Raw and packet sockets | Packet crafting, raw sockets, ping | Medium: can send any packet |
| `NET_BIND_SERVICE` | Listening on ports below 1024 | Running a service on a standard port | Low: only port binding |

### System

| Capability | What it allows | Typical use | Risk |
|---|---|---|---|
| `SYS_PTRACE` | Tracing processes with ptrace | Debugging, reverse engineering, GDB | High: can inspect and change processes |
| `SYS_ADMIN` | A wide range of system administration | Mounts, namespaces | Very high: close to full root |
| `SYS_MODULE` | Loading and unloading kernel modules | Custom kernel module work | Critical: full kernel access |

### Files

| Capability | What it allows | Typical use | Risk |
|---|---|---|---|
| `DAC_OVERRIDE` | Ignoring file permission checks | Accessing files whatever their permissions | High: can read and write any file |
| `DAC_READ_SEARCH` | Ignoring read and search permission checks | Reading files without permission | Medium to high: can read protected files |
| `CHOWN` | Changing file owners | Changing owners and groups | Medium |

## Examples

Let a container manage the network:

```bash
rfswift config capabilities add -c sdr_work -p NET_ADMIN
```

Allow raw sockets:

```bash
rfswift config capabilities add -c packet_craft -p NET_RAW
```

Allow debugging with ptrace:

```bash
rfswift config capabilities add -c debug_session -p SYS_PTRACE
```

Remove a capability:

```bash
rfswift config capabilities rm -c container -p NET_ADMIN
```

### Wi-Fi monitor mode

Create a Wi-Fi container, give it the two network capabilities, then switch the adapter to monitor mode from inside. With the default host network, the container sees your Wi-Fi interfaces directly:

```bash
rfswift container create -i penthertz/rfswift_resolute:wifi -n wifi_mon
rfswift config capabilities add -c wifi_mon -p NET_ADMIN
rfswift config capabilities add -c wifi_mon -p NET_RAW

rfswift container shell -c wifi_mon
airmon-ng start wlan0
exit
```

### Packet capture

Give a container the network capabilities, then capture with tcpdump:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n netcap
rfswift config capabilities add -c netcap -p NET_ADMIN
rfswift config capabilities add -c netcap -p NET_RAW

rfswift container shell -c netcap
tcpdump -i eth0 -w capture.pcap
exit
```

### Debugging a program

Allow ptrace, then attach GDB to a running process:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n debug
rfswift config capabilities add -c debug -p SYS_PTRACE

rfswift container shell -c debug
gdb -p <pid>
exit
```

### A service on port 80

Allow binding to ports below 1024, then start a web server on port 80:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n web
rfswift config capabilities add -c web -p NET_BIND_SERVICE

rfswift container shell -c web
python3 -m http.server 80
exit
```

### Changing the network configuration

Give the container both network capabilities, then change the MTU and add a route:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n sdr_net
rfswift config capabilities add -c sdr_net -p NET_ADMIN
rfswift config capabilities add -c sdr_net -p NET_RAW

rfswift container shell -c sdr_net
ip link set dev eth0 mtu 9000
ip route add 192.168.1.0/24 via 192.168.1.1
exit
```

## Capabilities or privileged mode?

A privileged container (`-u 1`) gets every privilege at once. Capabilities let you grant only what a tool needs.

| | Capabilities | Privileged mode |
|---|---|---|
| **Granularity** | One privilege at a time | All or nothing |
| **Security** | Better | Worse |
| **What you grant** | Specific privileges | Every privilege |
| **Risk** | Lower | Higher |
| **Change later** | Add as needed | Fixed at creation |
| **Best for** | Real engagements | Quick tests |

The more you grant, the less isolated the container is:

```
Unprivileged Container (Safest)
    ↓ Add specific capabilities
Container with Capabilities (Secure)
    ↓ Add more capabilities
Container with Many Capabilities (Less secure)
    ↓ Enable privileged mode
Privileged Container (Least secure)
```

Use **capabilities** when you know what the tool needs, and whenever security matters.

Use **privileged mode** only for quick tests during development, when you need many privileges or do not yet know which ones.

For example, instead of a privileged container:

```bash
rfswift container create -i sdr_full -n work -u 1
```

create a normal one and add only what you need:

```bash
rfswift container create -i sdr_full -n work
rfswift config capabilities add -c work -p NET_ADMIN
rfswift config capabilities add -c work -p NET_RAW
```

{{< callout type="tip" title="Start with nothing, add what you need" >}}
Create an unprivileged container first, then add only the capabilities your task requires: `NET_ADMIN` for Wi-Fi, `NET_RAW` for packets, `SYS_PTRACE` for debugging.
{{< /callout >}}

## Common combinations

Wi-Fi security testing, and packet analysis:

```bash
rfswift config capabilities add -c wifi_test -p NET_ADMIN
rfswift config capabilities add -c wifi_test -p NET_RAW
```

Network forensics:

```bash
rfswift config capabilities add -c forensics -p NET_ADMIN
rfswift config capabilities add -c forensics -p NET_RAW
rfswift config capabilities add -c forensics -p SYS_PTRACE
```

System debugging:

```bash
rfswift config capabilities add -c debug -p SYS_PTRACE
rfswift config capabilities add -c debug -p DAC_READ_SEARCH
```

Web development on standard ports:

```bash
rfswift config capabilities add -c webdev -p NET_BIND_SERVICE
```

## Risk levels

| Risk | Capabilities |
|---|---|
| Low | `NET_BIND_SERVICE`, `CHOWN` (in limited contexts) |
| Medium | `NET_RAW`, `NET_ADMIN`, `DAC_READ_SEARCH` |
| High | `SYS_PTRACE`, `DAC_OVERRIDE`, `SETUID`/`SETGID` |
| Critical (avoid) | `SYS_ADMIN`, `SYS_MODULE`, `SYS_RAWIO` |

{{< callout type="warning" title="Avoid the critical ones" >}}
`SYS_ADMIN`, `SYS_MODULE` and `SYS_RAWIO` grant very broad privileges. Avoid them on real engagements, and use specific capabilities such as `NET_ADMIN` or `NET_RAW` instead.
{{< /callout >}}

## Troubleshooting

### “Operation not permitted”

The tool needs a privilege the container does not have. Add the one that matches what the tool does:

| The tool does | Add |
|---|---|
| Network configuration | `NET_ADMIN` |
| Raw sockets | `NET_RAW` |
| Debugging | `SYS_PTRACE` |
| Listening on a port below 1024 | `NET_BIND_SERVICE` |

```bash
rfswift config capabilities add -c container -p NET_ADMIN
```

### The capability does not seem to work

Check it was added, then restart the program inside the container. Some operations need several capabilities, and devices may also need a cgroup rule:

```bash
docker inspect container | grep -A5 CapAdd

rfswift config capabilities add -c container -p NET_ADMIN
rfswift config capabilities add -c container -p NET_RAW

rfswift config cgroups add -c container -r "c 189:* rwm"
```

### “invalid capability name”

Write capability names in capitals.

This works:

```bash
rfswift config capabilities add -c work -p NET_ADMIN
```

This fails:

```bash
rfswift config capabilities add -c work -p net_admin
```

Common names: `NET_ADMIN`, `NET_RAW`, `SYS_PTRACE`, `NET_BIND_SERVICE`, `DAC_OVERRIDE`, `DAC_READ_SEARCH`, `CHOWN`.

### Still “permission denied” after adding a capability

The operation may need more than one capability:

```bash
rfswift config capabilities add -c work -p NET_ADMIN
rfswift config capabilities add -c work -p NET_RAW
```

Security modules such as SELinux or AppArmor can also block an operation whatever the capabilities. As a last resort for one specific operation, use a privileged container:

```bash
rfswift container create -i image -n work -u 1
```

### Removing a capability fails

Check the current capabilities and use the exact name. Removing a capability that was never added does not show an error:

```bash
docker inspect container | grep -A5 CapAdd
rfswift config capabilities rm -c container -p NET_ADMIN
```

## Related commands

- [`bindings`](/docs/commands/bindings): add devices and folders
- [`cgroups`](/docs/commands/cgroups): device access
- [`run`](/docs/commands/run): create containers with capabilities from the start
- [`exec`](/docs/commands/exec): run commands in the container
