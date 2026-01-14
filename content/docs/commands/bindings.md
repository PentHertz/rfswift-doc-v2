---
title: bindings
weight: 15
prev: /docs/commands/retag
next: /docs/commands/capabilities
---

# rfswift bindings

Dynamically add or remove volume mounts and device bindings to running containers.

## Synopsis

```bash
# Add volume binding
rfswift bindings add -c CONTAINER -s SOURCE -t TARGET

# Add device binding  
rfswift bindings add -d -c CONTAINER -s SOURCE -t TARGET

# Remove volume binding
rfswift bindings rm -c CONTAINER -s SOURCE -t TARGET

# Remove device binding
rfswift bindings rm -d -c CONTAINER -s SOURCE -t TARGET
```

The `bindings` command allows you to add or remove volume mounts and device mappings to containers without restarting them. This is part of RF Swift's dynamic container management features.

---

## Subcommands

### bindings add

Add a new volume mount or device binding to a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-s, --source STRING` | Source path/device | Optional* | `-s ~/captures` |
| `-t, --target STRING` | Target path in container | Yes | `-t /root/captures` |
| `-d, --devices` | Manage device (not volume) | No | `-d` |

{{< callout type="warning" >}}
If source is omitted, source equals target.
{{< /callout >}}

### bindings rm

Remove an existing volume mount or device binding from a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-s, --source STRING` | Source path/device | Optional* | `-s ~/captures` |
| `-t, --target STRING` | Target path in container | Yes | `-t /root/captures` |
| `-d, --devices` | Manage device (not volume) | No | `-d` |

{{< callout type="warning" >}}
If source is omitted, source equals target.
{{< /callout >}}

---

## Examples

### Volume Bindings

**Add volume mount:**
```bash
rfswift bindings add -c my_container \
  -s ~/captures \
  -t /root/captures
```

**Add multiple volumes:**
```bash
rfswift bindings add -c sdr_work -s ~/data -t /root/data
rfswift bindings add -c sdr_work -s ~/scripts -t /root/scripts
rfswift bindings add -c sdr_work -s ~/configs -t /root/.config
```

**Add read-only volume:**
```bash
rfswift bindings add -c container \
  -s ~/reference-data \
  -t /root/reference:ro
```

**Remove volume mount:**
```bash
rfswift bindings rm -c my_container \
  -s ~/captures \
  -t /root/captures
```

### Device Bindings

**Add USB device:**
```bash
rfswift bindings add -d -c sdr_work \
  -s /dev/bus/usb \
  -t /dev/bus/usb
```

or more simply if the target and source are the same:

 ```bash
rfswift bindings add -d -c sdr_work \
  -t /dev/bus/usb
```

{{< callout type="info" >}}
If you know you will plug and unplug devices, just use the volume by turning of `-d` switch.
{{< /callout >}}

**Add USB serial device:**
```bash
rfswift bindings add -d -c analysis \
  -s /dev/ttyUSB0 \
  -t /dev/ttyUSB0
```

---

## How Bindings Work

### Dynamic Mounting

When you add a binding to a running container:

1. **Docker updates** container configuration
2. **Namespace modified** to include new mount/device
3. **Immediate access** - no restart needed
4. **Persists** until removed or container deleted

```mermaid
graph LR
    A[Host Directory/Device] -->|Bind Mount| B[Container Namespace]
    B -->|Access| C[Container Process]
    C -->|Read/Write| A
```

### Volume vs Device Bindings

**Volume Bindings (without `-d`):**
- Mount host directories into container
- Share files between host and container
- Two-way sync (changes visible on both sides)
- Use for: data, configs, scripts
- Can be use to share devices and resists to hot(un)plug

**Device Bindings (with `-d`):**
- Expose hardware devices to container
- Direct device access
- Requires proper permissions (cgroups)
- Use for: SDR, serial, USB devices
- Not hot(un)plug resistant

---

## Bindings vs Initial Mount

### Comparison

| Feature | Runtime Bindings | Initial Mount (`run -b`) |
|---------|------------------|--------------------------|
| **When** | After creation | At creation |
| **Restart needed** | ❌ No | N/A (during creation) |
| **Modification** | ✅ Can add/remove | ❌ Fixed |
| **Performance** | Same | Same |
| **Use case** | Dynamic needs | Known requirements |

### When to Use Each

**Use runtime `bindings` when:**
- ✅ Requirements change during work
- ✅ Hot-plugging devices
- ✅ Temporary data access
- ✅ Testing different configurations
- ✅ Adding forgotten mounts

**Use initial `-b` flag when:**
- ✅ Requirements known upfront
- ✅ Permanent mounts needed
- ✅ Creating container fresh
- ✅ Documenting standard setup

**Example:**
```bash
# Initial mount at creation
rfswift run -i sdr_full -n work \
  -b /pathto/scripts:/root/scripts

# Later add more dynamically
rfswift bindings add -c work -s /pathto/captures -t /root/captures

# Add device when plugged in
rfswift bindings add -d -c work -s /dev/bus/usb -t /dev/bus/usb
```

---

## Troubleshooting

### Binding Not Visible in Container

**Problem:** Added binding but can't see it in container

**Solutions:**
```bash
# Check if binding was actually added
docker inspect container | grep -A5 Binds

# Try accessing directly
rfswift exec -c container
ls -la /path/to/binding
exit

# Remove and re-add with correct paths
rfswift bindings rm -c container -s source -t target
rfswift bindings add -c container -s source -t target
```

### Device Access Denied

**Problem:** Device binding added but access denied in container

**Solutions:**
```bash
# Add device binding
rfswift bindings add -d -c container -s /dev/rtlsdr0 -t /dev/rtlsdr0

# Add cgroup rule for device access
rfswift cgroups add -c container -r "c 189:* rwm"

# Check device major:minor numbers
ls -l /dev/rtlsdr0
# Example: crw-rw---- 1 root dialout 189, 0

# Add rule for correct major number
rfswift cgroups add -c container -r "c 189:* rwm"
```

### Permission Denied on Volume

**Problem:** Can't write to mounted volume

**Solutions:**
```bash
# Check host directory permissions
ls -ld ~/data

# Fix permissions
chmod 755 ~/data

# Or run container as specific user
# (requires container recreation)

# Or use capabilities
rfswift capabilities add -c container -p DAC_OVERRIDE
```

### Source Path Not Found

**Error:** `source path does not exist`

**Solutions:**
```bash
# Check source path exists
ls -la /path/to/source

# Create directory if needed
mkdir -p ~/data

# Use absolute path
rfswift bindings add -c container \
  -s /home/user/data \
  -t /root/data
```

### Cannot Remove Binding

**Problem:** `rm` command fails

**Solutions:**
```bash
# Check exact paths used
docker inspect container | grep -A10 Binds

# Use same source and target as when added
rfswift bindings rm -c container \
  -s /exact/source/path \
  -t /exact/target/path

# If still fails, recreate container
# (as last resort)
```

### Device Not Found

**Problem:** Device doesn't exist at specified path

**Solutions:**
```bash
# Check device exists
ls -l /dev/bus/usb

# Check device name pattern
ls -l /dev | grep rtl
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers with initial bindings
- [`cgroups`](/docs/commands/cgroups) - Manage device permissions
- [`capabilities`](/docs/commands/capabilities) - Manage container capabilities
- [`exec`](/docs/commands/exec) - Access container after adding bindings

---

{{< callout emoji="🔌" >}}
**Hot-Plugging**: The `bindings` command enables hot-plugging devices and volumes without container restart. Perfect for SDR work where devices are frequently connected/disconnected!
{{< /callout >}}

{{< callout type="warning" >}}
**Device Permissions**: Adding device bindings (`-d` flag) usually requires corresponding cgroup rules. Use `rfswift cgroups add` to grant device access after adding the binding.
{{< /callout >}}

{{< callout type="info" >}}
**Volumes vs Devices**: Use `bindings add` without `-d` for directories/files (volumes), and with `-d` for hardware devices like SDRs, USB devices, serial ports, etc.
{{< /callout >}}