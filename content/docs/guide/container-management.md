---
title: Dynamic Container Management
weight: 2
next: /docs/guide/list-of-images/
prev: /docs/guide/running-rf-swift
cascade:
  type: docs
---

## Dynamic Container Management

One of RF Swift's most powerful features is the ability to modify running containers without recreation. This page covers dynamic management of bindings, capabilities, cgroups, and ports - allowing you to adapt containers to changing assessment needs in real-time.

{{< callout type="info" >}}
**What Makes This Powerful**: Traditional Docker requires destroying and recreating containers to change most settings. RF Swift's dynamic management saves time and preserves your work environment while adapting to new requirements.
{{< /callout >}}

---

## 🔌 Dynamic Device and Volume Bindings

The `bindings` command allows you to add or remove device and volume bindings to running containers without interruption.

### Command Overview

```bash
rfswift bindings [command]

Available Commands:
  add         Add device or volume binding to a container
  rm          Remove device or volume binding from a container (aliases: rm)

Flags:
  -c, --container string   Container name or ID
  -d, --device            Manage devices (not volumes)
  -s, --source string     Source path (host)
  -t, --target string     Target path (container)
```

### Adding Device Bindings

**Syntax for devices:**
```bash
# Full syntax with source and target
rfswift bindings add -c CONTAINER -d -s /dev/ttyUSB0 -t /dev/ttyUSB0

# Shortcut when source and target are identical
rfswift bindings add -c CONTAINER -d -t /dev/ttyUSB0
```

**Real-world examples:**

```bash
# Add a specific RTL-SDR device
rfswift bindings add -c sdr_container -d -t /dev/rtlsdr0

# Add all USB devices
rfswift bindings add -c sdr_container -d -t /dev/bus/usb

# Add USB serial device
rfswift bindings add -c my_container -d -s /dev/ttyUSB0 -t /dev/ttyUSB0

# Example with a Proxmark3 on /dev/ttyACM0
rfswift bindings add -c rfid_container -d -t /dev/ttyACM0
```

### Adding Volume Bindings

**Syntax for volumes:**
```bash
# Using -b flag (recommended)
rfswift bindings add -c CONTAINER -b /host/path:/container/path

# Using -s and -t flags
rfswift bindings add -c CONTAINER -s /host/path -t /container/path
```

**Real-world examples:**

```bash
# Mount project directory
rfswift bindings add -c my_container -b ~/projects:/root/projects

# Mount captures directory
rfswift bindings add -c pentest_container -b ~/captures:/root/captures

# Mount tool configuration
rfswift bindings add -c sdr_container -b ~/.config/gqrx:/root/.config/gqrx

# Mount shared data directory 
rfswift bindings add -c analysis_container -b /data/samples:/root/samples

# Mount shared data directory in RO mode (read-only would need Docker API)
rfswift bindings add -c analysis_container -b /data/samples:/root/samples:ro

# Mount USB drive for data exfiltration
rfswift bindings add -c assessment_container -b /media/usb:/mnt/usb
```

### Removing Bindings

**Remove device bindings:**
```bash
# Remove by target path
rfswift bindings remove -c my_container -d -t /dev/ttyUSB0

# Alternative: use rm alias
rfswift bindings rm -c my_container -d -t /dev/ttyUSB0
```

**Remove volume bindings:**
```bash
# Remove by target path
rfswift bindings remove -c my_container -t /root/projects

# Remove multiple bindings
rfswift bindings rm -c my_container -t /root/captures
rfswift bindings rm -c my_container -t /root/samples
```

### Hot-Plugging Workflow

RF Swift excels at handling devices that are plugged in after container creation:

```bash
# 1. Start container without device
rfswift run -i sdr_full -n sdr_work

# 2. Plug in RTL-SDR device
# (Device appears as /dev/rtlsdr0)

# 3. Add device to running container
rfswift bindings add -c sdr_work -d -t /dev/rtlsdr0

# 4. Use the device immediately
rfswift exec -c sdr_work
rtl_test -t

# 5. When done, you can also remove the device binding
rfswift bindings rm -c sdr_work -d -t /dev/rtlsdr0

# 6. Physically unplug the device
```

{{< callout type="warning" >}}
**Container Recreation**: Adding or removing bindings requires RF Swift to stop the container, modify its configuration, and restart it. Any processes running in the container will be interrupted. Save your work before modifying bindings!
{{< /callout >}}


### Permanent device binding

If you need to plug and unplug devices and do not want to stop the container everytime, use the volume binding feature instead of device bindings in Linux (without `-d`).

---

## 🧢 Dynamic Capability Management

Linux capabilities provide fine-grained control over privileged operations. RF Swift allows you to add or remove capabilities from running containers.

### Command Overview

```bash
rfswift capabilities [command]

Available Commands:
  add         Add capabilities to a container
  rm          Remove capabilities from a container (aliases: rm)

Flags:
  -c, --container string      Container name or ID
  -a, --capabilities string   Capabilities to add/remove (comma-separated)
```

### Common Capabilities

| Capability | Use Case | Risk Level |
|-----------|----------|------------|
| `NET_ADMIN` | Network configuration, Wi-Fi/Bluetooth tools | Medium |
| `NET_RAW` | Raw socket access, packet crafting | Medium |
| `SYS_PTRACE` | Process debugging, memory inspection | High |
| `SYS_ADMIN` | Mount operations, system administration | Very High |
| `DAC_OVERRIDE` | Bypass file permission checks | High |
| `CHOWN` | Change file ownership | Medium |
| `SETUID/SETGID` | Change process UID/GID | High |
| `NET_BIND_SERVICE` | Bind to ports < 1024 | Low |
| `SYS_MODULE` | Load kernel modules | Very High |
| `SYS_RAWIO` | Raw I/O operations | High |

### Adding Capabilities

```bash
# Add single capability
rfswift capabilities add -c wifi_container -a NET_ADMIN

# Add multiple capabilities
rfswift capabilities add -c pentest_container -a NET_ADMIN,NET_RAW,SYS_PTRACE
```

**Real-world examples:**

```bash
# Enable Wi-Fi monitoring mode
rfswift capabilities add -c wifi_tools -a NET_ADMIN,NET_RAW

# Enable Bluetooth scanning
rfswift capabilities add -c bluetooth_scanner -a NET_ADMIN

# Enable debugging tools
rfswift capabilities add -c reversing_container -a SYS_PTRACE

# Enable raw I/O for hardware access
rfswift capabilities add -c hardware_tools -a SYS_RAWIO

# Enable low port binding for testing
rfswift capabilities add -c web_server -a NET_BIND_SERVICE
```

### Listing Capabilities

View current capabilities:

```bash
rfswift capabilities list -c my_container

Current Capabilities:
  NET_ADMIN
  NET_RAW
```

### Removing Capabilities

Remove capabilities when they're no longer needed:

```bash
# Remove single capability
rfswift capabilities remove -c wifi_container -a NET_ADMIN

# Remove multiple capabilities
rfswift capabilities rm -c pentest_container -a NET_ADMIN,NET_RAW
```

### Security Best Practice: Temporary Capabilities

Use capabilities only when needed and remove them immediately:

```bash
# Add capability for specific task
rfswift capabilities add -c assessment -a NET_ADMIN

# Enter container and perform task
rfswift exec -c assessment
# ... perform network configuration ...
# exit

# Remove capability after task completes
rfswift capabilities rm -c assessment -a NET_ADMIN
```

{{< callout type="warning" >}}
**Security Risk**: Capabilities like `SYS_ADMIN` and `SYS_MODULE` are nearly equivalent to full root access. Only add them when absolutely necessary and remove them immediately after use.
{{< /callout >}}

---

## 🧩 Dynamic Cgroup Management

Control groups (cgroups) restrict container access to specific device types. RF Swift allows dynamic modification of cgroup rules.

### Command Overview

```bash
rfswift cgroups [command]

Available Commands:
  add     Add cgroup rules to a container
  rm      Remove cgroup rules from a container (aliases: rm)

Flags:
  -c, --container string   Container name or ID
  -g, --cgroups string     Cgroup rules (comma-separated)
```

### Cgroup Rule Format

Rules follow the pattern: `type major:minor permissions`

**Components:**
- `type`: `c` (character device) or `b` (block device)
- `major:minor`: Device numbers (use `*` for wildcard)
- `permissions`: `r` (read), `w` (write), `m` (mknod - create device files)

**Common device major numbers:**

| Major | Devices | Example Use |
|-------|---------|-------------|
| 189 | USB serial (ttyUSB*) | RTL-SDR, HackRF, GPS receivers |
| 166 | ACM devices (ttyACM*) | Proxmark3, Arduino |
| 188 | USB serial converters | FTDI adapters, CH340 |
| 116 | ALSA audio | Audio capture, SDR audio |
| 226 | DRI (GPU) | OpenCL, GPU acceleration |
| 81 | Video4Linux | Webcams, video capture |
| 180 | USB devices | General USB access |
| 89 | I2C devices | Hardware interfaces |
| 13 | Input devices | Keyboards, mice, gamepads |

Find device major numbers:
```bash
ls -l /dev/ttyUSB0
crw-rw---- 1 root dialout 188, 0 Jan 12 10:30 /dev/ttyUSB0
#                          ^^^ major number
```

### Adding Cgroup Rules

```bash
# Add single rule
rfswift cgroups add -c my_container -g "c 189:* rwm"

# Add multiple rules
rfswift cgroups add -c my_container -g "c 189:* rwm,c 166:* rwm,c 188:* rwm"
```

**Real-world examples:**

```bash
# Grant access to RTL-SDR (USB serial)
rfswift cgroups add -c sdr_container -g "c 189:* rwm"

# Grant access to Proxmark3 (ACM device)
rfswift cgroups add -c rfid_container -g "c 166:* rwm"

# Grant access to FTDI USB serial converters
rfswift cgroups add -c hardware_tools -g "c 188:* rwm"

# Grant access to ALSA audio devices
rfswift cgroups add -c audio_analysis -g "c 116:* rwm"

# Grant GPU access for OpenCL
rfswift cgroups add -c gpu_container -g "c 226:* rwm"

# Grant access to Video4Linux (webcams)
rfswift cgroups add -c video_capture -g "c 81:* rwm"

# Comprehensive hardware access
rfswift cgroups add -c hardware_lab -g "c 189:* rwm,c 166:* rwm,c 188:* rwm,c 116:* rwm,c 226:* rwm"
```

### Removing Cgroup Rules

Remove specific cgroup rules:

```bash
# Remove single rule
rfswift cgroups remove -c my_container -g "c 189:* rwm"

# Remove multiple rules
rfswift cgroups rm -c my_container -g "c 189:* rwm,c 166:* rwm"
```

### Identifying Required Cgroups

When a tool fails to access a device:

```bash
# 1. Check device information on host
ls -l /dev/your_device
crw-rw---- 1 root dialout 189, 0 Jan 12 10:30 /dev/your_device
#                          ^^^ major number: 189

# 2. Add corresponding cgroup rule
rfswift cgroups add -c your_container -g "c 189:* rwm"

# 3. Add device binding
rfswift bindings add -c your_container -d -t /dev/your_device

# 4. Test access
rfswift exec -c your_container
ls -l /dev/your_device
```

{{< callout type="info" >}}
**Cgroups vs Device Bindings**: Cgroups control which *types* of devices a container can access, while device bindings make *specific* devices available. You need both: cgroups allow access to the device class, and bindings expose the actual device.
{{< /callout >}}

---

## 🌐 Dynamic Port Management

RF Swift allows you to manage container ports dynamically, supporting both exposed ports (container-to-container) and bound ports (host-to-container).

### Command Overview

```bash
rfswift ports [command]

Available Commands:
  bind        Bind a port between host and container
  expose      Expose a container port
  unbind      Remove a port binding
  unexpose    Remove an exposed port

Flags:
  -c, --container string   Container name or ID
  -p, --port string        Port specification
```

### Port Concepts

**Exposed Ports** (`expose`):
- Make ports available to other containers on the same network
- Don't publish to host
- Used for container-to-container communication

**Bound Ports** (`bind`):
- Publish container ports to host
- Format: `host_port:container_port/protocol`
- Optional host IP: `host_ip:host_port:container_port/protocol`

### Exposing Ports

Make ports available for inter-container communication:

```bash
# Expose single port
rfswift ports expose -c web_server -p 8080

# Expose multiple ports (add one at a time)
rfswift ports expose -c api_server -p 3000
rfswift ports expose -c api_server -p 3001
rfswift ports expose -c api_server -p 3002
```

### Binding Ports

Publish container ports to host:

```bash
# Bind with automatic host port
rfswift ports bind -c web_server -p 8080:80/tcp

# Bind to specific host IP
rfswift ports bind -c api_server -p 127.0.0.1:8080:80/tcp

# Bind UDP port
rfswift ports bind -c dns_server -p 5353:53/udp

# Bind to all interfaces
rfswift ports bind -c http_server -p 0.0.0.0:8080:80/tcp
```

**Real-world examples:**

```bash
# Web server for assessment results
rfswift ports bind -c pentest_container -p 8080:80/tcp

# API server for tool integration
rfswift ports bind -c automation -p 127.0.0.1:5000:5000/tcp

# Database for analysis results
rfswift ports bind -c analysis -p 127.0.0.1:5432:5432/tcp

# Jupyter notebook for RF analysis
rfswift ports bind -c jupyter_sdr -p 8888:8888/tcp

# SSH for remote access
rfswift ports bind -c remote_lab -p 2222:22/tcp

# VNC for remote GUI
rfswift ports bind -c gui_tools -p 5900:5900/tcp

# Multiple service ports
rfswift ports bind -c full_stack -p 80:80/tcp
rfswift ports bind -c full_stack -p 443:443/tcp
rfswift ports bind -c full_stack -p 3306:3306/tcp
```

### Removing Ports

**Unexpose ports:**
```bash
rfswift ports unexpose -c web_server -p 8080
```

**Unbind ports:**
```bash
# Unbind by host port
rfswift ports unbind -c web_server -p 8080:80/tcp

# Unbind from specific IP
rfswift ports unbind -c api_server -p 127.0.0.1:5000:5000/tcp
```

### Port Management Workflow

Typical workflow for adding web interface to analysis container:

```bash
# 1. Start container without ports
rfswift run -i analysis -n data_analysis

# 2. Run analysis, realize you need web interface
# (inside container, start jupyter notebook)

# 3. Exit container and bind port
exit
rfswift ports bind -c data_analysis -p 8888:8888/tcp

# 4. Access from host browser
# Open http://localhost:8888

# 5. When done, unbind port for security
rfswift ports unbind -c data_analysis -p 8888:8888/tcp
```

{{< callout type="warning" >}}
**Security Consideration**: Binding ports to `0.0.0.0` makes services accessible from any network interface. Use `127.0.0.1` to restrict access to localhost only, especially for sensitive services.
{{< /callout >}}

---

## 🎯 Real-World Workflows

### Workflow 1: Multi-SDR Assessment

Handle multiple SDR devices during a site survey:

```bash
# Day 1: Start with RTL-SDR only
rfswift run -i sdr_full -n site_survey
rfswift bindings add -c site_survey -d -t /dev/rtlsdr0

# Day 2: Client provides HackRF for specific test
rfswift bindings add -c site_survey -d -t /dev/hackrf
rfswift cgroups add -c site_survey -g "c 189:* rwm"  # If not already present

# Day 3: Need to analyze with Airspy
rfswift bindings add -c site_survey -d -t /dev/airspy0

# Day 4: Return HackRF, continue with others
rfswift bindings rm -c site_survey -d -t /dev/hackrf

# Cleanup: List all active bindings
rfswift bindings list -c site_survey
```

### Workflow 2: Secure Wireless Assessment

Progressive security hardening for Wi-Fi assessment:

```bash
# Start with minimal privileges
rfswift run -i wifi -n wifi_assess -u 0 -t bridge

# Need monitor mode - add NET_ADMIN temporarily
rfswift capabilities add -c wifi_assess -a NET_ADMIN,NET_RAW

# Perform monitoring
rfswift exec -c wifi_assess
airmon-ng start wlan0
airodump-ng wlan0mon
# ... perform capture ...
exit

# Remove capabilities after capture
rfswift capabilities rm -c wifi_assess -a NET_ADMIN,NET_RAW

# Add web server for reporting
rfswift ports bind -c wifi_assess -p 127.0.0.1:8080:80/tcp

# Share results directory
rfswift bindings add -c wifi_assess -b ~/client-results:/root/results
```

### Workflow 3: Hardware Reverse Engineering

Iterative device exploration:

```bash
# Start with basic tools
rfswift run -i hardware -n rev_eng -u 0

# Connect device, add binding
rfswift bindings add -c rev_eng -d -t /dev/ttyUSB0
rfswift cgroups add -c rev_eng -g "c 188:* rwm"

# Need JTAG - add more devices
rfswift bindings add -c rev_eng -d -t /dev/ttyACM0
rfswift cgroups add -c rev_eng -g "c 166:* rwm"

# Need debugging capabilities
rfswift capabilities add -c rev_eng -a SYS_PTRACE

# Need shared workspace with host
rfswift bindings add -c rev_eng -b ~/projects/device-re:/root/work

# Export results over network
rfswift ports bind -c rev_eng -p 2222:22/tcp

# Security: Remove capabilities when done
rfswift capabilities rm -c rev_eng -a SYS_PTRACE
```

### Workflow 4: Bluetooth Security Assessment

Complete Bluetooth engagement workflow:

```bash
# Initial setup
rfswift run -i bluetooth -n bt_assess -u 0 -t bridge

# Add Bluetooth capabilities
rfswift capabilities add -c bt_assess -a NET_ADMIN,NET_RAW

# Add Ubertooth device when it arrives
rfswift bindings add -c bt_assess -d -t /dev/ttyACM0
rfswift cgroups add -c bt_assess -g "c 166:* rwm"

# Add second Bluetooth adapter
rfswift bindings add -c bt_assess -d -t /dev/ttyACM1

# Share capture directory
rfswift bindings add -c bt_assess -b ~/bt-captures:/root/captures

# Set up web interface for results
rfswift ports bind -c bt_assess -p 127.0.0.1:8000:8000/tcp

# When assessment complete, remove sensitive capabilities
rfswift capabilities rm -c bt_assess -a NET_ADMIN,NET_RAW
```

### Workflow 5: Teaching Lab Environment

Classroom setup with controlled progression:

```bash
# Week 1: Basic SDR concepts (no hardware)
rfswift run -i sdr_light -n student_lab

# Week 2: Add RTL-SDR access
rfswift bindings add -c student_lab -d -t /dev/rtlsdr0
rfswift cgroups add -c student_lab -g "c 189:* rwm"

# Week 3: Add audio for AM/FM demodulation
rfswift cgroups add -c student_lab -g "c 116:* rwm"

# Week 4: Share project directories
rfswift bindings add -c student_lab -b ~/student-projects:/root/projects

# Week 5: Enable web access for visualization
rfswift ports bind -c student_lab -p 8080:8080/tcp

# End of semester: Review configuration
rfswift bindings list -c student_lab
rfswift capabilities list -c student_lab
rfswift cgroups list -c student_lab
rfswift ports list -c student_lab
```

---

## 🔍 Troubleshooting

### Device Not Accessible After Binding

**Problem**: Device binding added but tool can't access it.

**Solution**:
```bash
# 1. Check if cgroup rule allows device type
rfswift cgroups list -c my_container

# 2. Add missing cgroup rule
rfswift cgroups add -c my_container -g "c 189:* rwm"

# 3. Verify device exists in container
rfswift exec -c my_container
ls -l /dev/your_device
```

### Capability Not Taking Effect

**Problem**: Added capability but operation still fails.

**Solution**:
```bash
# 1. Check if you need multiple capabilities
rfswift capabilities add -c my_container -a NET_ADMIN,NET_RAW

# 2. Some operations may need privileged mode
rfswift run -i image -n new_container -u 1  # Recreate if necessary
```

### Port Already in Use

**Problem**: Can't bind port because it's already in use.

**Solution**:
```bash
# 1. Check what's using the port
sudo lsof -i :8080

# 2. Use a different host port
rfswift ports bind -c my_container -p 8081:80/tcp

# 3. Or stop the conflicting service
sudo systemctl stop service_name
rfswift ports bind -c my_container -p 8080:80/tcp
```

### Container Won't Restart After Changes

**Problem**: Container fails to restart after adding bindings.

**Solution**:
```bash
# 1. Check container status
docker ps -a | grep my_container

# 2. View container logs
docker logs my_container

# 3. Remove problematic binding
rfswift bindings rm -c my_container -t /problematic/path

# 4. Try manual restart
docker start my_container
```

### Permission Denied Inside Container

**Problem**: Can't access device even with binding and cgroup.

**Solution**:
```bash
# 1. Check host device permissions
ls -l /dev/your_device

# 2. Add user to required group on host
sudo usermod -aG dialout $USER

# 3. Restart container
docker restart my_container

# 4. Or run container as privileged (less secure)
rfswift capabilities add -c my_container -a DAC_OVERRIDE
```

---

## 🛡️ Security Best Practices

### Principle of Least Privilege

```bash
# Bad: Start with everything
rfswift run -i image -n container -u 1 -a ALL

# Good: Add only what's needed, when needed
rfswift run -i image -n container -u 0
# ... later, when needed:
rfswift capabilities add -c container -a NET_ADMIN
# ... when done:
rfswift capabilities rm -c container -a NET_ADMIN
```

### Temporary Privilege Escalation

```bash
# Workflow for sensitive operations
# 1. Add capability
rfswift capabilities add -c assessment -a SYS_PTRACE

# 2. Perform task
rfswift exec -c assessment
# ... do debugging work ...
exit

# 3. Remove capability immediately
rfswift capabilities rm -c assessment -a SYS_PTRACE
```

### Network Isolation

```bash
# Start with network isolation
rfswift run -i tools -n isolated -t none

# Add specific ports only when needed
rfswift ports expose -c isolated -p 8080

# Bind to localhost only for host access
rfswift ports bind -c isolated -p 127.0.0.1:8080:8080/tcp
```

---

## 📊 Comparison with Traditional Docker

| Operation | Traditional Docker | RF Swift |
|-----------|-------------------|----------|
| Add device | Stop, remove, recreate container | `rfswift bindings add` |
| Add volume | Stop, remove, recreate container | `rfswift bindings add` |
| Add capability | Stop, remove, recreate container | `rfswift capabilities add` |
| Modify cgroups | Stop, remove, recreate container | `rfswift cgroups add` |
| Add port | Stop, remove, recreate container | `rfswift ports bind` |
| Time to modify | 2-5 minutes | 5-10 seconds |
| Data preservation | Manual backup/restore | Automatic |
| Risk of data loss | High | Low |

---

{{< callout emoji="💡" >}}
**Pro Tip**: Use `rfswift last` to quickly find container names, then pipe operations together for rapid configuration changes during assessments!
{{< /callout >}}

{{< callout type="info" >}}
**Remember**: All dynamic management commands require stopping and restarting the container. Save your work before making changes!
{{< /callout >}}