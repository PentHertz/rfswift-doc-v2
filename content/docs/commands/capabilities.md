---
title: capabilities
weight: 16
prev: /docs/commands/bindings
next: /docs/commands/cgroups
---

# rfswift capabilities

Dynamically add or remove Linux capabilities to running containers for fine-grained privilege control.

## Synopsis

```bash
# Add capability
rfswift capabilities add -c CONTAINER -p CAPABILITY

# Remove capability
rfswift capabilities rm -c CONTAINER -p CAPABILITY
```

The `capabilities` command allows you to add or remove Linux capabilities to containers without restarting them. This provides fine-grained security control, granting specific privileges without running fully privileged containers.

---

## Subcommands

### capabilities add

Add a Linux capability to a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-p, --capability STRING` | Capability to add | Yes | `-p NET_ADMIN` |

### capabilities rm

Remove a Linux capability from a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-p, --capability STRING` | Capability to remove | Yes | `-p NET_ADMIN` |

---

## Common Capabilities

### Network Capabilities

**NET_ADMIN**
- **Purpose**: Network administration (interfaces, routes, iptables)
- **Use case**: WiFi monitoring, packet capture, network reconfiguration
- **Risk**: Medium - can modify network configuration

**NET_RAW**
- **Purpose**: Use RAW and PACKET sockets
- **Use case**: Packet crafting, raw socket operations, ping
- **Risk**: Medium - can send arbitrary packets

**NET_BIND_SERVICE**
- **Purpose**: Bind to privileged ports (<1024)
- **Use case**: Running services on standard ports
- **Risk**: Low - just port binding

### System Capabilities

**SYS_PTRACE**
- **Purpose**: Trace processes with ptrace
- **Use case**: Debugging, reverse engineering, GDB
- **Risk**: High - can inspect/modify processes

**SYS_ADMIN**
- **Purpose**: Wide range of system administration
- **Use case**: Mount operations, namespace management
- **Risk**: Very High - nearly equivalent to root

**SYS_MODULE**
- **Purpose**: Load/unload kernel modules
- **Use case**: Custom kernel module work
- **Risk**: Critical - full kernel access

### File Capabilities

**DAC_OVERRIDE**
- **Purpose**: Bypass file permission checks
- **Use case**: Access files regardless of permissions
- **Risk**: High - can read/write any file

**DAC_READ_SEARCH**
- **Purpose**: Bypass read/execute permission checks
- **Use case**: Read files without permission
- **Risk**: Medium-High - can read protected files

**CHOWN**
- **Purpose**: Change file ownership
- **Use case**: Changing file owners/groups
- **Risk**: Medium - can change file ownership

---

## Examples

### Basic Usage

**Add network admin capability:**
```bash
rfswift capabilities add -c sdr_work -p NET_ADMIN
```

**Add raw socket capability:**
```bash
rfswift capabilities add -c packet_craft -p NET_RAW
```

**Add ptrace capability for debugging:**
```bash
rfswift capabilities add -c debug_session -p SYS_PTRACE
```

**Remove capability:**
```bash
rfswift capabilities rm -c container -p NET_ADMIN
```

### Real-World Scenarios

**WiFi monitoring mode:**
```bash
# Create container
rfswift run -i penthertz/rfswift:wifi -n wifi_mon

# Add capabilities for WiFi monitoring
rfswift capabilities add -c wifi_mon -p NET_ADMIN
rfswift capabilities add -c wifi_mon -p NET_RAW

# Add wireless interface
rfswift bindings add -d -c wifi_mon -s /dev/wlan0 -t /dev/wlan0

# Now can set monitor mode
rfswift exec -c wifi_mon
airmon-ng start wlan0
exit
```

**Packet capture and analysis:**
```bash
# Network analysis container
rfswift run -i penthertz/rfswift:sdr_full -n netcap

# Add packet capture capabilities
rfswift capabilities add -c netcap -p NET_ADMIN
rfswift capabilities add -c netcap -p NET_RAW

# Run tcpdump
rfswift exec -c netcap
tcpdump -i eth0 -w capture.pcap
exit
```

**Debugging application:**
```bash
# Development container
rfswift run -i penthertz/rfswift:sdr_full -n debug

# Add debugging capability
rfswift capabilities add -c debug -p SYS_PTRACE

# Debug with GDB
rfswift exec -c debug
gdb -p <pid>
exit
```

**Running services on privileged ports:**
```bash
# Web server container
rfswift run -i penthertz/rfswift:sdr_full -n web

# Add capability to bind port 80
rfswift capabilities add -c web -p NET_BIND_SERVICE

# Run web server on port 80
rfswift exec -c web
python3 -m http.server 80
exit
```

**Network reconfiguration:**
```bash
# SDR with network tools
rfswift run -i penthertz/rfswift:sdr_full -n sdr_net

# Add network capabilities
rfswift capabilities add -c sdr_net -p NET_ADMIN
rfswift capabilities add -c sdr_net -p NET_RAW

# Configure network
rfswift exec -c sdr_net
ip link set dev eth0 mtu 9000
ip route add 192.168.1.0/24 via 192.168.1.1
exit
```

---

## Capabilities vs Privileged Mode

### Comparison

| Feature | Capabilities | Privileged Mode |
|---------|--------------|-----------------|
| **Granularity** | Fine-grained | All or nothing |
| **Security** | Better | Worse |
| **Control** | Specific privileges | Full privileges |
| **Risk** | Lower | Higher |
| **Flexibility** | Add as needed | Fixed at creation |
| **Best for** | Production | Testing/development |

### Security Hierarchy

```
Unprivileged Container (Safest)
    ↓ Add specific capabilities
Container with Capabilities (Secure)
    ↓ Add more capabilities
Container with Many Capabilities (Less secure)
    ↓ Enable privileged mode
Privileged Container (Least secure)
```

### When to Use Each

**Use capabilities when:**
- ✅ Need specific privileges only
- ✅ Production environment
- ✅ Security is important
- ✅ Know exact requirements
- ✅ Want minimal risk

**Use privileged mode when:**
- ✅ Quick testing
- ✅ Need many privileges
- ✅ Development only
- ✅ Unsure what's needed
- ❌ Not for production

**Example comparison:**
```bash
# Privileged mode (not recommended)
rfswift run -i sdr_full -n work -u 1

# Better: Specific capabilities
rfswift run -i sdr_full -n work
rfswift capabilities add -c work -p NET_ADMIN
rfswift capabilities add -c work -p NET_RAW
```

---

## Capability Combinations

### Common Combinations

**WiFi Security Testing:**
```bash
rfswift capabilities add -c wifi_test -p NET_ADMIN
rfswift capabilities add -c wifi_test -p NET_RAW
```

**Network Forensics:**
```bash
rfswift capabilities add -c forensics -p NET_ADMIN
rfswift capabilities add -c forensics -p NET_RAW
rfswift capabilities add -c forensics -p SYS_PTRACE
```

**System Debugging:**
```bash
rfswift capabilities add -c debug -p SYS_PTRACE
rfswift capabilities add -c debug -p DAC_READ_SEARCH
```

**Web Development:**
```bash
rfswift capabilities add -c webdev -p NET_BIND_SERVICE
```

**Packet Analysis:**
```bash
rfswift capabilities add -c analysis -p NET_RAW
rfswift capabilities add -c analysis -p NET_ADMIN
```

---

## Security Considerations

### Capability Risk Levels

**Low Risk:**
- NET_BIND_SERVICE
- CHOWN (limited contexts)

**Medium Risk:**
- NET_RAW
- NET_ADMIN
- DAC_READ_SEARCH

**High Risk:**
- SYS_PTRACE
- DAC_OVERRIDE
- SETUID/SETGID

**Critical Risk (Avoid):**
- SYS_ADMIN
- SYS_MODULE
- SYS_RAWIO

---

## Troubleshooting

### Operation Not Permitted

**Problem:** Command fails with "Operation not permitted"

**Solutions:**
```bash
# Identify needed capability
# Network operations → NET_ADMIN
rfswift capabilities add -c container -p NET_ADMIN

# Raw sockets → NET_RAW  
rfswift capabilities add -c container -p NET_RAW

# Debugging → SYS_PTRACE
rfswift capabilities add -c container -p SYS_PTRACE

# Privileged ports → NET_BIND_SERVICE
rfswift capabilities add -c container -p NET_BIND_SERVICE
```

### Capability Not Taking Effect

**Problem:** Added capability but operation still fails

**Solutions:**
```bash
# Check if capability was added
docker inspect container | grep -A5 CapAdd

# Try restarting process in container
rfswift exec -c container
# ... restart application ...

# Some operations need multiple capabilities
rfswift capabilities add -c container -p NET_ADMIN
rfswift capabilities add -c container -p NET_RAW

# May also need cgroup rules for devices
rfswift cgroups add -c container -r "c 189:* rwm"
```

### Invalid Capability Name

**Error:** `invalid capability name`

**Solutions:**
```bash
# Use correct capability names (all caps)
# Good
rfswift capabilities add -c work -p NET_ADMIN

# Bad (wrong case)
rfswift capabilities add -c work -p net_admin

# Common capability names:
# NET_ADMIN, NET_RAW, SYS_PTRACE, NET_BIND_SERVICE
# DAC_OVERRIDE, DAC_READ_SEARCH, CHOWN
```

### Permission Denied Error Persists

**Problem:** Capability added but still permission denied

**Solutions:**
```bash
# May need multiple capabilities
rfswift capabilities add -c work -p NET_ADMIN
rfswift capabilities add -c work -p NET_RAW

# Or may need privileged mode for this specific operation
# (as last resort)
rfswift run -i image -n work -u 1

# Check kernel security modules (SELinux, AppArmor)
# May be blocking regardless of capabilities
```

### Cannot Remove Capability

**Problem:** Remove command fails

**Solutions:**
```bash
# Check current capabilities
docker inspect container | grep -A5 CapAdd

# Use exact capability name
rfswift capabilities rm -c container -p NET_ADMIN

# If still issues, capability may not have been added
# (no error if removing non-existent capability)
```


---

## Related Commands

- [`bindings`](/docs/commands/bindings) - Add device/volume bindings
- [`cgroups`](/docs/commands/cgroups) - Manage device access
- [`run`](/docs/commands/run) - Create containers with initial capabilities
- [`exec`](/docs/commands/exec) - Execute commands with added capabilities

---

{{< callout emoji="🔒" >}}
**Security First**: Capabilities provide fine-grained privilege control. Always start with an unprivileged container and add only the specific capabilities needed for your task!
{{< /callout >}}

{{< callout type="warning" >}}
**High-Risk Capabilities**: Capabilities like SYS_ADMIN, SYS_MODULE, and SYS_RAWIO provide extensive privileges. Avoid these in production. Use specific capabilities like NET_ADMIN or NET_RAW instead.
{{< /callout >}}

{{< callout type="info" >}}
**Better Than Privileged**: Using specific capabilities is more secure than running containers in privileged mode (`-u 1`). Grant only what's needed: NET_ADMIN for WiFi, NET_RAW for packets, SYS_PTRACE for debugging.
{{< /callout >}}