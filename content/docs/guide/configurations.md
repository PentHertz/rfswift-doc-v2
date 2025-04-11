---
title: Configurations
weight: 4
next: /docs/guide/host-actions
prev: /docs/guide/list-of-tools/
cascade:
  type: docs
---

# RF Swift Configuration

RF Swift provides flexible configuration options to customize your environment. You can configure settings through a profile configuration file for persistent preferences or via command-line arguments for one-time adjustments.

## Profile Configuration

### Configuration File Location

RF Swift looks for a profile configuration file in a platform-specific location:

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
```
/home/username/.config/rfswift/config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
C:\Users\username\AppData\Roaming\rfswift\config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
/Users/username/.config/rfswift/config.ini
```
  {{< /tab >}}
{{< /tabs >}}

If this file doesn't exist when you first run RF Swift, you'll be prompted to create one with default settings.

### Configuration File Structure

The `config.ini` file is organized into sections for different aspects of RF Swift's behavior:

```ini
[general]
imagename = myrfswift:latest
repotag = penthertz/rfswift

[container]
shell = /bin/zsh
bindings =
network = host
exposedports =
portbindings =
x11forward = /tmp/.X11-unix:/tmp/.X11-unix
xdisplay = "DISPLAY=:0"
extrahost = pluto.local:192.168.2.1
extraenv =
devices = /dev/bus/usb:/dev/bus/usb,/dev/snd:/dev/snd,/dev/dri:/dev/dri,/dev/input:/dev/input,/dev/vhci:/dev/vhci,/dev/console:/dev/console,/dev/vcsa:/dev/vcsa,/dev/tty:/dev/tty,/dev/tty0:/dev/tty0,/dev/tty1:/dev/tty1,/dev/tty2:/dev/tty2,/dev/uinput:/dev/uinput
privileged = false
caps =
seccomp =
cgroups = c 189:* rwm,c 166:* rwm,c 188:* rwm

[audio]
pulse_server = tcp:localhost:34567
```

### Configuration Sections Explained

#### General Section

| Parameter | Description | Example |
|-----------|-------------|---------|
| `imagename` | Default image used when running containers without `-i` | `myrfswift:latest` |
| `repotag` | Default repository for RF Swift images | `penthertz/rfswift` |

#### Container Section

| Parameter | Description | Example |
|-----------|-------------|---------|
| `shell` | Default shell inside containers | `/bin/zsh` |
| `bindings` | Host directories to share with containers | `/home/user/data:/data` |
| `network` | Network mode for containers | `host`, `bridge`, `none` |
| `exposedports` | Ports exposed from the container | `8080`, `443` |
| `portbindings` | Host-to-container port mappings | `8080:80/tcp` |
| `x11forward` | X11 binding for GUI applications | `/tmp/.X11-unix:/tmp/.X11-unix` |
| `xdisplay` | X11 display environment variable | `"DISPLAY=:0"` |
| `extrahost` | Custom host-to-IP mappings | `pluto.local:192.168.2.1` |
| `extraenv` | Additional environment variables | `VAR1=value1,VAR2=value2` |
| `devices` | Device mappings for hardware access | `/dev/bus/usb:/dev/bus/usb` |
| `privileged` | Run containers in privileged mode | `false` |
| `caps` | Linux capabilities to add | `NET_ADMIN,SYS_PTRACE` |
| `seccomp` | Seccomp profile for syscall filtering | `/path/to/profile.json` |
| `cgroups` | Control group rules for device access | `c 189:* rwm,c 166:* rwm` |

#### Audio Section

| Parameter | Description | Example |
|-----------|-------------|---------|
| `pulse_server` | PulseAudio server address | `tcp:localhost:34567` |

## Command-Line Configuration

You can override any configuration setting when running a container using command-line flags with the `run` command:

```bash
rfswift run [flags]
```

### Available Flags

```
Flags:
  -b, --bind string           Extra bindings (separate with commas)
  -w, --bindedports string    Ports to bind between host and container
  -a, --capabilities string   Extra capabilities (separate with commas)
  -g, --cgroups string        Extra cgroup rules (separate with commas)
  -e, --command string        Command to execute (default: '/bin/bash')
  -s, --devices string        Extra device mappings (separate with commas)
  -d, --display string        Set X Display (default: "DISPLAY=:0")
  -z, --exposedports string   Ports to expose
  -x, --extrahosts string     Set extra hosts (default: 'pluto.local:192.168.1.2')
  -h, --help                  Help for run command
  -i, --image string          Image to use (default: 'myrfswift:latest')
  -n, --name string           Container name
  -t, --network string        Network mode (default: 'host')
  -u, --privileged int        Set privilege level (1: privileged, 0: unprivileged)
  -p, --pulseserver string    PulseAudio server address (default: "tcp:127.0.0.1:34567")
  -m, --seccomp string        Set Seccomp profile (default: 'default')

Global Flags:
  -q, --disconnect            Don't query updates (disconnected mode)
```

### Examples

```bash
# Run with custom image and name
rfswift run -i penthertz/rfswift:sdr_full -n my_sdr_container

# Share a host directory with the container
rfswift run -i penthertz/rfswift:sdr_full -b /home/user/captures:/data/captures

# Add network capabilities for Wi-Fi tools
rfswift run -i penthertz/rfswift:wifi -a NET_ADMIN

# Use bridge network with port mapping
rfswift run -i penthertz/rfswift:sdr_full -t bridge -w 8080:80/tcp

# Specify a custom shell
rfswift run -i penthertz/rfswift:sdr_full -e /bin/bash
```

## Dynamic Container Modification with Bindings

RF Swift offers a unique feature that Docker doesn't provide natively: the ability to modify bindings for existing containers. This eliminates the need to recreate containers when you need to add or remove bindings.

### Bindings Command Overview

```bash
rfswift bindings
```

This command has two subcommands:
- `add`: Add a binding to an existing container
- `rm`: Remove a binding from an existing container

### Adding Bindings to Existing Containers

To add a new binding to a running or stopped container:

```bash
rfswift bindings add -c <container_name> -t <target_path> [-s <source_path>]
```

Parameters:
- `-c, --container`: Container name or ID (required)
- `-t, --target`: Path inside the container (required)
- `-s, --source`: Path on the host (optional, defaults to same as target)

Examples:

```bash
# Add a simple directory binding
rfswift bindings add -c my_sdr_container -s /home/user/data -t /data

# Add a device binding
rfswift bindings add -c my_bt_container -s /dev/bluetooth -t /dev/bluetooth

# When source and target are identical
rfswift bindings add -c my_container -t /dev/ttyUSB0
```

### Removing Bindings from Containers

To remove an existing binding:

```bash
rfswift bindings rm -c <container_name> -t <target_path> [-s <source_path>]
```

Example:

```bash
# Remove a binding
rfswift bindings rm -c my_container -t /data
```

### Docker API Version Compatibility

If you encounter a Docker API version mismatch error:

```
Error response from daemon: client version 1.47 is too new. Maximum supported API version is 1.45
```

You can set the API version to match your Docker engine:

```bash
sudo DOCKER_API_VERSION=1.45 rfswift bindings add -c my_container -s /tmp -t /root/myshare
```

For persistent configuration, add this to your shell profile:

```bash
# Add to ~/.bashrc, ~/.zshrc, etc.
export DOCKER_API_VERSION=1.45
```

## Quiet Mode / Disconnected Mode

RF Swift includes a global flag that allows you to run in "disconnected mode," which prevents the tool from checking for updates or requiring internet connectivity:

```bash
rfswift -q [command]
# or
rfswift --disconnect [command]
```

### When to Use Quiet Mode

This mode is particularly useful in several scenarios:

1. **Air-gapped Environments**: When working in secure environments without internet access
2. **Bandwidth-limited Situations**: When working with limited connectivity (field operations, remote locations)
3. **Automated Scripts**: When running RF Swift as part of automated workflows where update checks are not desired
4. **Rapid Execution**: When you need immediate tool execution without the delay of update checking

### Examples

```bash
# Run a container without checking for updates
rfswift -q run -i sdr_full -n quick_analysis

# List local images in disconnected mode
rfswift --disconnect images local

# Execute a command in a container without update checks
rfswift -q exec -c my_container
```

The quiet/disconnected mode can be combined with any RF Swift command and its respective options.

{{< callout type="info" >}}
Using quiet mode doesn't affect RF Swift's functionality—it only disables the automatic update checks. Consider periodically checking for updates manually with `rfswift update` to ensure you have the latest features and security improvements.
{{< /callout >}}

## Best Practices

1. **Base Configuration**: Set your common preferences in the `config.ini` file
2. **Special Cases**: Use command-line flags for one-time or specialized settings
3. **Security First**: Keep the `privileged = false` setting when possible and only add specific capabilities as needed
4. **Dynamic Adjustments**: Use the `bindings` feature for on-the-fly modifications
5. **Device Access**: Be selective about device mappings; only share what is needed

## Common Configuration Scenarios

### SDR Development Environment

```bash
rfswift run -i penthertz/rfswift:sdr_full -n sdr_dev \
  -b ~/sdr_projects:/projects \
  -s /dev/ttyUSB0:/dev/ttyUSB0
```

### Wi-Fi Security Testing

```bash
rfswift run -i penthertz/rfswift:wifi -n wifi_testing \
  -a NET_ADMIN,NET_RAW \
  -b ~/wifi_captures:/captures
```

### Offline Device Analysis

```bash
# Create a container with no network
rfswift run -i penthertz/rfswift:reversing -n firmware_analysis \
  -t none \
  -b ~/firmware:/firmware
```