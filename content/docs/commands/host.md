---
title: host
weight: 22
prev: /docs/commands/log
next: /docs/commands/update
---

# rfswift host

Configure host system for RF Swift container operations.

## Synopsis

```bash
# Enable pulseaudio network access
rfswift host audio enable [-s SERVER_ADDRESS]

# Unload pulseaudio TCP module
rfswift host audio unload
```

The `host` command configures the host system to support RF Swift containers, primarily managing pulseaudio server settings for audio passthrough to containers.

{{< callout type="info" >}}
**Automatic audio management**: RF Swift now automatically detects and starts the audio system (PulseAudio or PipeWire) when you enable audio. No need to manually start PulseAudio — RF Swift handles it for you. See [Automatic Pulse Server Handling](#automatic-pulse-server-handling) below.
{{< /callout >}}

---

## Subcommands

### host audio enable

Enable pulseaudio network module for container audio access.

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-s, --pulseserver STRING` | Pulse server address | `tcp:127.0.0.1:34567` | `-s tcp:127.0.0.1:34567` |

### host audio unload

Unload the TCP module from pulseaudio server.

**No additional options.**

---

## Examples

### Basic Usage

**Enable pulseaudio with default settings:**
```bash
rfswift host audio enable
```

**Enable with custom address:**
```bash
rfswift host audio enable -s tcp:192.168.1.100:34567
```

**Unload pulseaudio module:**
```bash
rfswift host audio unload
```

### Real-World Scenarios

**Setup for SDR with audio:**
```bash
# Enable audio on host
rfswift host audio enable

# Create container with audio
rfswift run -i penthertz/rfswift_noble:sdr_full -n sdr_audio \
  -p tcp:127.0.0.1:34567

# Audio now works in container
rfswift exec -c sdr_audio
gqrx
# Audio output works!
exit
```

**Remote audio access:**
```bash
# Enable on specific interface
rfswift host audio enable -s tcp:192.168.1.100:34567

# Containers on network can access audio
# Use with -p flag when creating container
```

**Troubleshooting audio:**
```bash
# Unload module
rfswift host audio unload

# Wait a moment
sleep 2

# Re-enable
rfswift host audio enable

# Test audio in container
rfswift exec -c sdr_work
speaker-test -c 2
exit
```

**Clean shutdown:**
```bash
# Before stopping RF Swift work
rfswift host audio unload

# This cleanly removes the module
```

---

## Automatic Pulse Server Handling

RF Swift now **automatically manages the PulseAudio/PipeWire server** when you run `host audio enable`. You no longer need to manually check if PulseAudio is running or start it yourself — RF Swift handles everything:

### What happens automatically

1. **Audio system detection**: RF Swift detects whether your system uses PulseAudio or PipeWire
2. **Auto-start**: If the audio server is not running, RF Swift starts it automatically
3. **TCP module loading**: Loads `module-native-protocol-tcp` with the correct settings
4. **Lima-aware ACLs** (macOS): When Lima is detected, RF Swift automatically expands the `auth-ip-acl` to include VM and Docker bridge subnets (`192.168.0.0/16`, `172.16.0.0/12`, `10.0.0.0/8`), so containers inside the Lima VM can reach the host audio server

### Platform-specific behavior

{{< tabs items="Linux,macOS" >}}
  {{< tab >}}
**Linux auto-start logic:**
- Detects PipeWire or PulseAudio
- If PipeWire is detected: starts via systemd user services (`pipewire.service`, `pipewire-pulse.service`, `wireplumber.service`)
- If PulseAudio is detected: starts with `pulseaudio --start`
- If neither is detected: tries PipeWire first, falls back to PulseAudio
- Red Hat/Fedora: also starts additional services (`pipewire-media-session`, `wireplumber`)
  {{< /tab >}}
  {{< tab >}}
**macOS auto-start logic:**
- Checks if PulseAudio is installed (via Homebrew)
- Detects stale PulseAudio daemons (process exists but unresponsive) and restarts them
- Cleans up stale runtime symlinks in `~/.config/pulse/` (caused by macOS `/var/folders/` cleanup)
- Starts PulseAudio via `brew services start pulseaudio` (preferred)
- Falls back to direct foreground mode: `pulseaudio --exit-idle-time=-1`
- When Lima is running: automatically allows connections from VM subnets
  {{< /tab >}}
{{< /tabs >}}

### Example: fully automatic workflow

```bash
# Just run this — RF Swift will start PulseAudio/PipeWire if needed,
# load the TCP module, and configure the right ACLs
rfswift host audio enable

# On macOS with Lima, you'll see:
# [i] Starting PulseAudio on macOS...
# [+] PulseAudio started via brew services.
# [i] Lima detected: allowing connections from VM and Docker subnets
# [+] Successfully loaded module-native-protocol-tcp with index 29
```

---

## How Audio Passthrough Works

### Pulseaudio TCP Module

When you enable audio:

1. **Ensure audio server is running**: RF Swift automatically starts PulseAudio or PipeWire if not already running
2. **Load TCP module**: Loads `module-native-protocol-tcp`
3. **Bind to port**: Listens on specified address (default: 127.0.0.1:34567)
4. **Container access**: Containers connect via `PULSE_SERVER` environment variable
5. **Audio streams**: Audio from container apps plays on host

```mermaid
graph LR
    A[Container App] -->|PULSE_SERVER| B[TCP:34567]
    B -->|Network| C[Host Pulseaudio]
    C -->|Audio| D[Host Speakers]
```

### Environment Variable

Containers need `PULSE_SERVER` set:

```bash
# Automatically set by rfswift run with -p flag
PULSE_SERVER=tcp:127.0.0.1:34567

# Container applications use this to find pulse server
```

---

## Security Considerations

### Localhost vs Network Binding

**Localhost (Secure):**
```bash
# Only local containers can access
rfswift host audio enable -s tcp:127.0.0.1:34567
```

**Network Binding (Less Secure):**
```bash
# Any machine on network can access
rfswift host audio enable -s tcp:0.0.0.0:34567

# Or specific interface
rfswift host audio enable -s tcp:192.168.1.100:34567
```

---

## Troubleshooting

### Module Not Loading

**Problem:** `rfswift host audio enable` fails

{{< callout type="info" >}}
RF Swift now automatically detects and starts the audio server. Most "module not loading" issues are resolved automatically. If you still encounter problems, try the manual steps below.
{{< /callout >}}

**Solutions:**
```bash
# RF Swift should handle this automatically, but if it fails:

# Check for conflicts
pactl list modules | grep tcp

# Kill existing modules
pactl unload-module module-native-protocol-tcp

# Try again — RF Swift will auto-start the audio server
rfswift host audio enable
```

### Port Already in Use

**Problem:** Port 34567 already in use

**Solutions:**
```bash
# Check what's using the port
sudo lsof -i :34567

# Use different port
rfswift host audio enable -s tcp:127.0.0.1:34568

# Update container creation
rfswift run -i sdr_full -n work -p tcp:127.0.0.1:34568
```

### No Audio in Container

**Problem:** Container has no audio output

**Solutions:**
```bash
# Verify module is loaded
pactl list modules | grep module-native-protocol-tcp

# Check PULSE_SERVER in container
rfswift exec -c container
echo $PULSE_SERVER
exit

# Should show: tcp:127.0.0.1:34567

# If not set, recreate container with -p flag
rfswift run -i sdr_full -n work -p tcp:127.0.0.1:34567
```

### Permission Denied

**Problem:** Cannot load module

**Solutions:**
```bash
# Run as your user (not root)
# Pulseaudio runs as user, not root

# Check pulseaudio ownership
ps aux | grep pulseaudio

# If running as different user, restart
pulseaudio --kill
pulseaudio --start

# Then load module
rfswift host audio enable
```

### Module Won't Unload

**Problem:** `unload` command fails

**Solutions:**
```bash
# Force unload with pactl
pactl unload-module module-native-protocol-tcp

# Or restart pulseaudio
pulseaudio --kill
pulseaudio --start

# Module will be gone after restart
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers with audio (`-p` flag)
- [`exec`](/docs/commands/exec) - Test audio in containers
- [`stop`](/docs/commands/stop) - Stop containers before unloading

---

{{< callout emoji="🔊" >}}
**Audio for SDR**: The `host audio` commands enable audio passthrough from containers to your host speakers. Essential for SDR applications like GQRX that need audio output!
{{< /callout >}}

{{< callout type="warning" >}}
**Run as User**: Always run `rfswift host audio enable` as your regular user, NOT as root. Pulseaudio runs as your user and needs proper permissions.
{{< /callout >}}

{{< callout type="info" >}}
**Container Flag Required**: Don't forget the `-p tcp:127.0.0.1:34567` flag when creating containers. Without it, containers won't know where to find the pulseaudio server!
{{< /callout >}}