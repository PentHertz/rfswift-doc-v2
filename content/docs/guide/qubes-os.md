---
title: QubesOS
weight: 8
prev: /docs/guide/podman
---

# Running RF Swift on QubesOS

QubesOS provides security through compartmentalization using Xen virtual machines. RF Swift runs inside an AppVM with Docker or Podman — no special code or engine needed.

{{< callout type="info" >}}
**Recommended setup**: Podman in an AppVM. Podman is daemonless and rootless, which fits Qubes' security model. See [Using Podman](/docs/guide/podman) for general Podman guidance.
{{< /callout >}}

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    dom0                          │
│            (Xen management, no containers)       │
├──────────┬──────────┬───────────────────────────┤
│ sys-usb  │ sys-net  │   rf-work (AppVM)         │
│          │    ↓     │  ┌─────────────────────┐  │
│ USB HW ──┤ sys-fw   │  │ Podman / Docker     │  │
│ (/dev/*) │    ↓     │  │  └─ RF Swift container│ │
│          │ rf-work  │  │     └─ SDR tools     │  │
│  qvm-usb ──────────────→  /dev/ttyUSB0       │  │
│          │          │  └─────────────────────┘  │
└──────────┴──────────┴───────────────────────────┘
```

Key points:
- **dom0**: Never install Docker/Podman here
- **sys-usb**: Holds USB controllers — attach devices to your AppVM via `qvm-usb`
- **sys-net / sys-firewall**: Network passes through transparently
- **AppVM** (e.g. `rf-work`): Runs RF Swift + containers

---

## Setup

### 1. Install in the TemplateVM

Install Docker or Podman in the TemplateVM so all derived AppVMs can use it.

**Podman (recommended):**
```bash
# In the TemplateVM (e.g. fedora-41)
sudo dnf install -y podman podman-plugins slirp4netns

# Or for Debian-based templates
sudo apt-get install -y podman slirp4netns uidmap
```

**Docker:**
```bash
# In the TemplateVM
# Follow official Docker Engine install for your distro:
# https://docs.docker.com/engine/install/

# Do NOT install Docker Desktop (requires nested virtualization, unavailable on Xen)
```

Shut down the TemplateVM after installation.

### 2. Configure the AppVM

Create a dedicated AppVM for RF work:

```bash
# In dom0
qvm-create rf-work --template fedora-41 --label orange
qvm-prefs rf-work netvm sys-firewall
qvm-prefs rf-work memory 4096
qvm-prefs rf-work maxmem 8192
```

### 3. Persistent storage for containers

AppVMs reset their root filesystem on reboot. Container images and data must be stored in the persistent `/rw` or `/home` partition.

**Podman** (automatic — images stored in `~/.local/share/containers/`):

No extra configuration needed. Podman stores everything in the user's home directory, which persists across reboots.

**Docker** (requires configuration):

Create `/rw/config/rc.local` in the AppVM:
```bash
#!/bin/bash

# Start Docker with persistent storage
mkdir -p /home/user/docker
cat > /etc/docker/daemon.json << 'EOF'
{
    "data-root": "/home/user/docker",
    "group": "user"
}
EOF
systemctl start docker
```

Make it executable:
```bash
chmod +x /rw/config/rc.local
```

### 4. Install RF Swift

Download and install the RF Swift binary in the AppVM:

```bash
# In the rf-work AppVM
# Download latest release
wget https://github.com/PentHertz/RF-Swift/releases/latest/download/rfswift_linux_amd64
chmod +x rfswift_linux_amd64
sudo mv rfswift_linux_amd64 /usr/local/bin/rfswift

# For Podman, tell RF Swift to use it
export RFSWIFT_ENGINE=podman
# Or use the --engine flag:
rfswift --engine podman run ...
```

To make the engine preference persistent, add to `~/.bashrc`:
```bash
echo 'export RFSWIFT_ENGINE=podman' >> ~/.bashrc
```

---

## USB Device Passthrough

USB devices on QubesOS go through `sys-usb`. You must attach them to your AppVM **before** RF Swift can use them.

### Attach USB devices

```bash
# In dom0: list available USB devices
qvm-usb list

# Example output:
# sys-usb:2-1    0bda:2838  Realtek_RTL2838
# sys-usb:2-3    1d50:6089  Great_Scott_Gadgets_HackRF

# Attach to your AppVM
qvm-usb attach rf-work sys-usb:2-1    # RTL-SDR
qvm-usb attach rf-work sys-usb:2-3    # HackRF
```

### Verify in the AppVM

```bash
# In rf-work AppVM
lsusb
# Should show your attached devices

ls /dev/bus/usb/
# Devices should be visible
```

### Use with RF Swift

Once attached, use RF Swift normally:

```bash
rfswift run -i penthertz/rfswift_noble:sdr_full -n sdr_work
rfswift exec -c sdr_work
rtl_test -t        # Test RTL-SDR
hackrf_info         # Test HackRF
```

### Auto-attach USB devices

For convenience, create a script in dom0 to auto-attach specific devices:

```bash
#!/bin/bash
# /usr/local/bin/attach-sdr.sh (in dom0)
# Attach all SDR devices to rf-work

for dev in $(qvm-usb list | grep -E "0bda:|1d50:|2cf0:" | awk '{print $1}'); do
    qvm-usb attach rf-work "$dev" 2>/dev/null
done
```

Common USB vendor IDs for SDR:
| Vendor ID | Device |
|-----------|--------|
| `0bda` | RTL-SDR (Realtek) |
| `1d50` | HackRF, Ubertooth (Great Scott Gadgets) |
| `2cf0` | BladeRF (Nuand) |
| `0456` | PlutoSDR (Analog Devices) |
| `9ac4` | Proxmark3 |
| `1915` | nRF Sniffer (Nordic) |

---

## Network Configuration

Networking works transparently through the Qubes network stack:

```
Container → AppVM → sys-firewall → sys-net → Internet
```

RF Swift's `host` network mode maps to the AppVM's network — not the physical host. This works fine for most use cases.

### Isolated RF assessments

For sensitive work, create an AppVM with no network:

```bash
# In dom0
qvm-create rf-airgap --template fedora-41 --label red
qvm-prefs rf-airgap netvm none
```

Pre-pull images before disconnecting:
```bash
# While still connected
rfswift images pull -i penthertz/rfswift_noble:sdr_full

# Then disconnect
# In dom0: qvm-prefs rf-airgap netvm none
```

Or use [air-gapped installation](/docs/air-gapped-installation) to transfer images via USB.

---

## GPU Passthrough

GPU passthrough on QubesOS is **severely limited** due to Xen:

| Limitation | Impact |
|-----------|--------|
| 3.5GB RAM ceiling | AppVM with GPU cannot exceed 3.5GB RAM |
| No hot-swap | GPU assigned at boot, cannot move between VMs |
| Device reset failures | Many GPUs fail to reset between VM assignments |
| Intel iGPU issues | Requires patches, often broken |

**Recommendation**: Do not rely on GPU passthrough for RF/SDR work on QubesOS. Use CPU-based processing or offload GPU workloads to a non-Qubes machine.

---

## Recommended Profiles

### Minimal SDR (low memory)

```yaml
name: qubes-sdr
description: SDR for QubesOS (memory-efficient)
image: penthertz/rfswift_noble:sdr_light
network: host
realtime: true
```

### WiFi assessment

```yaml
name: qubes-wifi
description: WiFi assessment for QubesOS
image: penthertz/rfswift_noble:wifi
network: host
caps: "NET_ADMIN,NET_RAW"
```

---

## Troubleshooting

### USB device not visible in container

**Problem**: Device attached via `qvm-usb` but not visible in RF Swift container

**Solution**:
```bash
# 1. Verify device is attached to the AppVM
lsusb  # Should show device

# 2. Check RF Swift device bindings
rfswift bindings add -d -c container -s /dev/bus/usb -t /dev/bus/usb

# 3. Check cgroup rules
rfswift cgroups add -c container -r "c 189:* rwm"
```

### Docker daemon not starting on reboot

**Problem**: Docker service doesn't persist across AppVM reboots

**Solution**: Ensure `/rw/config/rc.local` is configured (see Setup section) or switch to Podman (daemonless, no startup needed).

### "No space left on device"

**Problem**: Container images fill up the AppVM private storage

**Solution**:
```bash
# Increase AppVM private storage (in dom0)
qvm-volume resize rf-work:private 50G

# Clean up unused images
rfswift cleanup images
```

### Container networking fails

**Problem**: Container can't reach the internet

**Solution**:
```bash
# Check AppVM has a NetVM assigned (in dom0)
qvm-prefs rf-work netvm

# Use host networking (default for RF Swift)
rfswift run -i image -n name -t host

# If using Podman rootless, check pasta/slirp4netns
podman info | grep network
```

### Permission denied on USB device

**Problem**: RF Swift container can't access USB device

**Solution**:
```bash
# Qubes USB proxy may change device permissions
# Inside AppVM, fix permissions
sudo chmod 666 /dev/bus/usb/*/*

# Or run RF Swift container with privileged mode (less secure)
rfswift run -i image -n name -u 1
```

---

## Security Considerations

QubesOS + RF Swift provides defense in depth:

| Layer | Protection |
|-------|-----------|
| **Xen hypervisor** | Isolates AppVMs from each other and dom0 |
| **sys-usb** | Isolates USB hardware from dom0 |
| **sys-firewall** | Network filtering between VMs |
| **Container** | Process/namespace isolation within the AppVM |
| **RF Swift config** | Capabilities, cgroups, seccomp for least privilege |

**Best practices**:
- Use a dedicated AppVM for RF work (don't mix with personal data)
- Use Podman rootless when possible
- Prefer capabilities over privileged mode
- Use air-gapped AppVMs for sensitive assessments
- Detach USB devices when not in use (`qvm-usb detach`)

---

## Related

- [Using Podman](/docs/guide/podman) - Podman-specific guidance
- [Air-Gapped Installation](/docs/air-gapped-installation) - Offline image transfer
- [Running RF Swift](/docs/guide/running-rf-swift) - General usage guide
- [Container Management](/docs/guide/container-management) - Dynamic device/capability management

---

{{< callout emoji="🔒" >}}
**Security Stack**: QubesOS (VM isolation) + RF Swift containers (process isolation) = defense in depth for RF assessments. USB devices are isolated through sys-usb, network through sys-firewall, and container privileges through capabilities and cgroups.
{{< /callout >}}

{{< callout type="warning" >}}
**USB First**: Always attach USB devices to your AppVM via `qvm-usb` in dom0 before starting RF Swift. Containers can only see devices that are available in the AppVM.
{{< /callout >}}

{{< callout type="info" >}}
**Podman Preferred**: Podman's daemonless, rootless architecture is a natural fit for QubesOS. No daemon startup, no root required, persistent storage in home directory.
{{< /callout >}}
