---
title: "rfswift container shell"
linkTitle: "container shell"
navGroup: "Containers"
level: reference
description: "Enter an existing container with a shell, or run a single command in it."
weight: 3
---

`rfswift container shell` takes you back into a lab you created earlier, or runs a single command in it. If the container is stopped, it is started first. Use it every time you come back to your work.

```bash
rfswift container shell -c my_sdr
```

{{< callout type="info" >}}
**Other spellings**: the legacy form `rfswift exec` and the aliases `rfswift shell` and `rfswift enter` still work and print a notice. With `--engine nix`, the same command enters a native Nix environment (the dedicated form is `rfswift env shell NAME`).
{{< /callout >}}

## Synopsis

```bash
rfswift container shell [-c CONTAINER] [-w WORKDIR] [-e COMMAND] [options]
rfswift exec [-c CONTAINER] [-w WORKDIR] [options]                  # legacy spelling
rfswift container shell -c CONTAINER -e "rtl_test -t"               # one command, no shell
```

Without `-c`, a picker lists your containers in an interactive terminal; in a script, the most recent container is used. When you enter, RF Swift prints the container summary (image version and freshness, size, shell, display, privileges, mounts, devices, seccomp, ulimits, GPUs, network, ports) and syncs the hot-pluggable serial ports.

{{< callout type="info" >}}
**Container picker**: the picker shows every container with its name, ID, image and state. The most recent one is marked `<- latest`.
{{< /callout >}}

## Options

### Container selection

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-c, --container STRING` | Container name or ID | Most recent | `-c my_container` |
| `-w, --workdir STRING` | Working directory inside container | `/root` | `-w /root/projects` |
| `-e, --command STRING` | Shell or command to run | `/bin/zsh` (Bash when missing) | `-e /bin/bash`, `-e "hackrf_info"` |
| `-i, --install STRING` | Run an install function from the image's scripts before the shell | | `-i gqrx_soft_install` |

### Display options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--no-x11` | Disable X11 forwarding and remove X11 socket binding | false | `--no-x11` |
| `--desktop` | Start remote desktop via VNC/noVNC in the container | false | `--desktop` |
| `--desktop-config STRING` | Desktop config as `proto:host:port` | `http:127.0.0.1:6080` | `--desktop-config "http:0.0.0.0:6080"` |
| `--desktop-pass STRING` | Set VNC password for desktop access | None | `--desktop-pass "mypassword"` |
| `--desktop-ssl` | Enable SSL/TLS for desktop connections | false | `--desktop-ssl` |

### VPN options

| Flag | Description | Example |
|------|-------------|---------|
| `--vpn STRING` | Start VPN inside the container | `--vpn tailscale` |

**Format:** `--vpn TYPE[:ARGUMENT]`, the same syntax as [`container create --vpn`](/docs/commands/run/#vpn-options).

{{< callout type="info" >}}
With `--vpn`, the VPN client starts inside the running container. WireGuard and OpenVPN need a container created in privileged mode (`-u 1`). See [VPN inside containers](/docs/guide/vpn/).
{{< /callout >}}

### Recording options

| Flag | Description | Example |
|------|-------------|---------|
| `--record` | Enable session recording | `--record` |
| `--record-output STRING` | Custom recording filename | `--record-output debug.cast` |

## Examples

### Basic usage

#### Enter most recent container
```bash
rfswift container shell
```

#### Enter specific container by name
```bash
rfswift container shell -c my_sdr_container
```

#### Enter with specific working directory
```bash
rfswift container shell -c my_container -w /root/projects
```

#### Enter by container ID
```bash
rfswift container shell -c a1b2c3d4e5f6
```

#### Short container ID
```bash
rfswift container shell -c a1b2c3
```

### With session recording

#### Record with auto-generated filename
```bash
rfswift container shell -c assessment --record
```

#### Record with custom filename
```bash
rfswift container shell -c pentest --record --record-output debug-session.cast
```

#### Record in specific directory with working dir
```bash
rfswift container shell -c analysis \
  -w /root/data \
  --record \
  --record-output ~/recordings/analysis-$(date +%Y%m%d-%H%M%S).cast
```

### With remote desktop

`--desktop` starts a remote desktop when you enter, even if the container was created without one.

#### Start desktop when entering a container
```bash
rfswift container shell -c my_container --desktop
```
Then open `http://127.0.0.1:6080` in your browser.

#### Expose on all interfaces with password
```bash
rfswift container shell -c my_container \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mysecretpass"
```

#### Use VNC client instead of browser
```bash
rfswift container shell -c my_container \
  --desktop --desktop-config "vnc::5900"
```

#### With SSL/TLS encryption
```bash
rfswift container shell -c my_container \
  --desktop --desktop-config "http:0.0.0.0:6080" \
  --desktop-pass "mysecretpass" --desktop-ssl
```

### With VPN

#### Start Tailscale when entering a container
```bash
rfswift container shell -c my_sdr --vpn tailscale
```

#### WireGuard on a privileged container
```bash
rfswift container shell -c my_sdr --vpn wireguard:./wg0.conf
```

#### Netbird with setup key
```bash
rfswift container shell -c my_sdr --vpn netbird:nb-setup-xxxxxxxxxxxx
```

### Working directory examples

#### Start in projects directory
```bash
rfswift container shell -c dev_container -w /root/projects
```

#### Start in captures directory
```bash
rfswift container shell -c sdr_work -w /root/captures
```

#### Start in mounted volume
```bash
rfswift container shell -c analysis -w /mnt/data
```

### Everyday workflows

#### Resume assessment work
```bash
# Yesterday's work
rfswift container create -i network -n client_assessment \
  -b ~/client-work:/root/work

# Today - resume where you left off
rfswift container shell -c client_assessment -w /root/work
```

#### Debug with recording
```bash
rfswift container shell -c problematic_container \
  --record \
  --record-output troubleshooting-$(date +%Y%m%d-%H%M).cast
```

#### Quick check on running container
```bash
# Check what's running
rfswift container last

# Jump into most recent
rfswift container shell

# Or specific one
rfswift container shell -c sdr_capture
```

#### Multiple sessions in same container
```bash
# Terminal 1
rfswift container shell -c sdr_analysis -w /root/captures

# Terminal 2 (different session, same container)
rfswift container shell -c sdr_analysis -w /root/tools
```

## Detailed explanations

### Container selection (`-c, --container`)

Which container to enter. You can give:
- **the container name** you chose at creation;
- **the container ID**, in full or its first characters;
- **nothing**: the most recently created container is used.

#### How auto-selection works
```bash
# These containers were created in this order:
# 1. sdr_container
# 2. wifi_container
# 3. bluetooth_container (most recent)

rfswift container shell
# Enters: bluetooth_container (most recent)

rfswift container shell -c sdr_container
# Enters: sdr_container (explicit)
```

#### Finding container names
```bash
# List recent containers
rfswift container last

# Show all containers
docker ps -a

# Show only running containers
docker ps
```

#### Partial container ID matching
```bash
# Full ID
rfswift container shell -c a1b2c3d4e5f6g7h8

# Short form (first 12 chars)
rfswift container shell -c a1b2c3d4e5f6

# Minimal (first few unique chars)
rfswift container shell -c a1b2
```

### Working directory (`-w, --workdir`)

The folder you start in. Handy to land directly in a project folder or a mounted volume.

- Default: `/root`.
- The folder must exist inside the container.

#### Common working directories
```bash
# User home
-w /root

# Project directory
-w /root/projects

# Captures directory
-w /root/captures

# Mounted volume
-w /mnt/shared

# Tool directory
-w /opt/tools

# Temporary work
-w /tmp/analysis
```

#### Non-existent directory
```bash
# This will fail if directory doesn't exist
rfswift container shell -c container -w /root/nonexistent

# Fix: create it in the container first, or bind it from the host
rfswift config bindings add -c container -s /pathto/projects -t /root/projects
rfswift container shell -c container -w /root/projects
```

### Session recording

Records the whole terminal session, for documentation, debugging or training. The recording captures what you type, what the tools print, and the timing, so it plays back exactly as it happened.

Without `--record-output`, the file is named `rfswift-exec-{container}-{YYYYMMDD-HHMMSS}.cast`:
```bash
rfswift container shell -c my_container --record
# Creates: rfswift-exec-my_container-20240112-143022.cast
```

**Recording indicator:** while recording, the terminal title reads `⏺ REC | RF Swift`, and `RFSWIFT_RECORDING=1` is set so scripts can detect it.

#### Custom filenames
```bash
# Simple name
--record-output session.cast

# With date
--record-output session-$(date +%Y%m%d).cast

# Full path
--record-output ~/recordings/client-assessment.cast

# Organized structure
--record-output ~/assessments/client-$(date +%Y%m%d)/session.cast
```

Where the file goes:
- with an automatic name: the current folder on your computer;
- with `--record-output`: the path you give.

Nothing changes inside the shell itself (only the terminal title). Typing `exit` ends the recording.

#### Playback
```bash
rfswift log replay -i session.cast
rfswift log replay -i session.cast -s 2.0  # 2x speed
```

## Container states

`container shell` works whatever state the container is in.

### Running containers

#### Most common use case
```bash
# Container is already running
docker ps | grep my_container
# Shows running container

rfswift container shell -c my_container
# Enters immediately
```

### Stopped containers

#### Container was previously stopped
```bash
# Container exists but is stopped
docker ps -a | grep my_container
# Shows exited container

rfswift container shell -c my_container
# RF Swift automatically starts the container, then enters it
```

What happens:
1. RF Swift sees that the container is stopped.
2. It starts the container (`docker start`).
3. It waits until the container is ready.
4. It opens the interactive shell.

### Non-Existent containers

#### Error handling
```bash
rfswift container shell -c nonexistent_container
# Error: No such container: nonexistent_container

# Fix: create the container first
rfswift container create -i image -n nonexistent_container
```

## Shell behavior

### Default shell

RF Swift containers use `zsh` by default, with Oh My Zsh, syntax highlighting, auto-completion and a prompt that shows the container name.

#### Terminal prompt example
```bash
┌─[root@container_name] - [/root/projects] - [Thu Jan 12, 14:30]
└─[$]>
```

### Multiple sessions

You can open several shells in the same container at once:

```bash
# Terminal 1
rfswift container shell -c my_container

# Terminal 2 (simultaneously)
rfswift container shell -c my_container

# Both sessions work in the same container
# Changes in one are visible in the other
```

This is useful to watch logs in one terminal while you work in another, to keep a long capture running while you use other tools, or to record different tasks separately.

## Common workflows

### Daily assessment workflow

```bash
# Morning: Start fresh
rfswift container create -i network -n daily_work -b ~/work:/root/work

# Throughout day: Enter as needed
rfswift container shell -c daily_work

# Exit and return multiple times
exit
rfswift container shell -c daily_work

# End of day: Stop but keep for tomorrow
rfswift container stop -c daily_work

# Next morning: Resume
rfswift container shell -c daily_work  # Auto-starts and enters
```

### Development workflow

```bash
# Setup development container
rfswift container create -i sdr_full -n sdr_dev \
  -b ~/code:/root/code \
  -b ~/.gitconfig:/root/.gitconfig:ro

# Edit code on host with your IDE
# Test in container
rfswift container shell -c sdr_dev -w /root/code
cd my_project
./build.sh
./test.sh
exit

# Repeat edit-test cycle
rfswift container shell -c sdr_dev -w /root/code
```

### Troubleshooting workflow

```bash
# Issue reported in container
rfswift container shell -c problematic_container --record

# Investigate and record findings
ps aux
df -h
netstat -tulpn
exit

# Share recording with team
rfswift log replay -i rfswift-exec-problematic_container-*.cast
```

### Training workflow

```bash
# Instructor prepares example
rfswift container create -i sdr_full -n training_demo \
  -s /dev/bus/usb:/dev/bus/usb

# Record demonstration
rfswift container shell -c training_demo \
  --record \
  --record-output training-lesson-01.cast

# Demonstrate tools and techniques
rtl_test -t
gqrx
exit

# Students replay later
rfswift log replay -i training-lesson-01.cast -s 1.5
```

## Create vs shell

| Aspect | `container create` | `container shell` |
|--------|-------|--------|
| **Purpose** | Create new container | Enter existing container |
| **Container state** | Creates new | Uses existing |
| **Image required** | Yes | No |
| **Configuration** | Full options available | Limited options |
| **Use when** | Starting new work | Continuing existing work |
| **Typical frequency** | Once per project | Multiple times per day |

#### Typical flow
```bash
# Day 1: create it
rfswift container create -i sdr_full -n project -b ~/work:/root/work

# Every day after: enter it
rfswift container shell -c project
# ... work ...
exit

# Come back as often as you need
rfswift container shell -c project
```

## Troubleshooting

### Container not found

The error message is: `Error: No such container: container_name`

To fix it:
```bash
# List all containers to find correct name
rfswift container last

# Maybe it was removed?
rfswift container create -i image -n container_name
```

### Container won't start

The container fails to start when you enter it.

To fix it:
```bash
# Check container status
docker ps -a | grep container_name

# Check logs
docker logs container_name

# Try manual start
docker start container_name

# If still fails, recreate
rfswift container rm -c container_name
rfswift container create -i image -n container_name
```

### Working directory doesn't exist

The error message is: `cannot change directory to '/root/nonexistent'`

To fix it:
```bash
# Use default directory
rfswift container shell -c container

# Create directory in container
rfswift container shell -c container
mkdir -p /root/nonexistent
exit

# Or bind from host
rfswift config bindings add -c container -s /pathto/host-dir -t /root/nonexistent
rfswift container shell -c container -w /root/nonexistent
```

### Recording fails

`--record` doesn't work.

To fix it:
```bash
# Check if asciinema is installed on host
which asciinema

# Install if missing (Ubuntu/Debian)
sudo apt-get install asciinema

# Install on macOS
brew install asciinema

# Verify recording works
asciinema rec test.cast
# Press Ctrl+D
asciinema play test.cast
```

### Permission issues inside container

You can't open some files or folders.

To fix it:
```bash
# Check file permissions inside container
rfswift container shell -c container
ls -la /path/to/file

# Fix permissions inside container
chmod 755 /path/to/file
chown root:root /path/to/file

# Or fix on host (for mounted volumes)
exit
chmod 755 ~/host-path/file
rfswift container shell -c container
```

### Terminal display issues

Terminal formatting looks wrong.

To fix it:
```bash
# Reset terminal
rfswift container shell -c container
reset

# Or clear screen
clear

# Set correct TERM
export TERM=xterm-256color
```

### Multiple containers with similar names

A partial name matches more than one container.

To fix it:
```bash
# Use full container name
rfswift container shell -c full_container_name

# Or use container ID
docker ps -a  # Get full ID
rfswift container shell -c a1b2c3d4e5f6

# List recent to identify
rfswift container last
```

## Advanced usage

### Run one command without a shell

Pass the command with `-e`. The container is started if needed, and the command runs with the container's environment (display, audio, workspace):

```bash
rfswift container shell -c container_name -e "rtl_test -t"
rfswift container shell -c container_name -e "ulimit -r"
```

### Enter as different user

RF Swift containers run as root. To switch to another user inside the container:

```bash
# Inside container
rfswift container shell -c container
su - username
```

### Custom shell environment

```bash
# Inside container, customize environment
rfswift container shell -c container

# Set custom aliases
echo 'alias ll="ls -la"' >> ~/.zshrc
echo 'alias scan="rtl_test -t"' >> ~/.zshrc

# Reload
source ~/.zshrc
```

## Related commands

- [`container create`](/docs/commands/run/): create a new container
- [`container stop`](/docs/commands/stop/): stop a running container
- [`container last`](/docs/commands/last/): list recent containers
- [`container rm`](/docs/commands/remove/): delete a container
- [`log`](/docs/commands/log/): replay recorded sessions
- [`config bindings`](/docs/commands/bindings/): add devices and folders to a container
- [VPN inside containers](/docs/guide/vpn/): the VPN setup guide
- [Using Podman](/docs/guide/podman/): Podman specifics

{{< callout >}}
**Tip**: add a shell alias such as `alias rfe='rfswift container shell'`, then type `rfe` to enter your most recent container.
{{< /callout >}}

{{< callout type="info" >}}
**While recording**: the terminal title shows `⏺ REC | RF Swift`. Everything you type and see is captured, so avoid typing secrets.
{{< /callout >}}