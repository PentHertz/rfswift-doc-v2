---
title: exec
weight: 2
prev: /docs/commands/run
next: /docs/commands/stop
---

# rfswift exec

Execute commands in a running or stopped container, typically used to enter containers with an interactive shell.

## Synopsis

```bash
rfswift exec [-c CONTAINER] [-w WORKDIR] [options]
```

The `exec` command enters an existing container with an interactive shell. If no container is specified, it automatically uses the most recently created container.

---

## Options

### Container Selection

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-c, --container STRING` | Container name or ID | Most recent | `-c my_container` |
| `-w, --workdir STRING` | Working directory inside container | `/root` | `-w /root/projects` |

### Recording Options

| Flag | Description | Example |
|------|-------------|---------|
| `--record` | Enable session recording | `--record` |
| `--record-output STRING` | Custom recording filename | `--record-output debug.cast` |

---

## Examples

### Basic Usage

**Enter most recent container:**
```bash
rfswift exec
```

**Enter specific container by name:**
```bash
rfswift exec -c my_sdr_container
```

**Enter with specific working directory:**
```bash
rfswift exec -c my_container -w /root/projects
```

**Enter by container ID:**
```bash
rfswift exec -c a1b2c3d4e5f6
```

**Short container ID:**
```bash
rfswift exec -c a1b2c3
```

### With Session Recording

**Record with auto-generated filename:**
```bash
rfswift exec -c assessment --record
```

**Record with custom filename:**
```bash
rfswift exec -c pentest --record --record-output debug-session.cast
```

**Record in specific directory with working dir:**
```bash
rfswift exec -c analysis \
  -w /root/data \
  --record \
  --record-output ~/recordings/analysis-$(date +%Y%m%d-%H%M%S).cast
```

### Working Directory Examples

**Start in projects directory:**
```bash
rfswift exec -c dev_container -w /root/projects
```

**Start in captures directory:**
```bash
rfswift exec -c sdr_work -w /root/captures
```

**Start in mounted volume:**
```bash
rfswift exec -c analysis -w /mnt/data
```

### Real-World Workflows

**Resume assessment work:**
```bash
# Yesterday's work
rfswift run -i pentest -n client_assessment \
  -b ~/client-work:/root/work

# Today - resume where you left off
rfswift exec -c client_assessment -w /root/work
```

**Debug with recording:**
```bash
rfswift exec -c problematic_container \
  --record \
  --record-output troubleshooting-$(date +%Y%m%d-%H%M).cast
```

**Quick check on running container:**
```bash
# Check what's running
rfswift last

# Jump into most recent
rfswift exec

# Or specific one
rfswift exec -c sdr_capture
```

**Multiple sessions in same container:**
```bash
# Terminal 1
rfswift exec -c sdr_analysis -w /root/captures

# Terminal 2 (different session, same container)
rfswift exec -c sdr_analysis -w /root/tools
```

---

## Detailed Explanations

### Container Selection (`-c, --container`)

Specifies which container to enter. Accepts:
- **Container name**: Full name as specified during creation
- **Container ID**: Full or partial Docker container ID
- **Auto-selection**: If omitted, uses most recently created container

**How auto-selection works:**
```bash
# These containers were created in this order:
# 1. sdr_container
# 2. wifi_container
# 3. bluetooth_container (most recent)

rfswift exec
# Enters: bluetooth_container (most recent)

rfswift exec -c sdr_container
# Enters: sdr_container (explicit)
```

**Finding container names:**
```bash
# List recent containers
rfswift last

# Show all containers
docker ps -a

# Show only running containers
docker ps
```

**Partial container ID matching:**
```bash
# Full ID
rfswift exec -c a1b2c3d4e5f6g7h8

# Short form (first 12 chars)
rfswift exec -c a1b2c3d4e5f6

# Minimal (first few unique chars)
rfswift exec -c a1b2
```

### Working Directory (`-w, --workdir`)

Sets the initial directory when entering the container. Useful for:
- Starting in project directories
- Continuing work in specific locations
- Accessing mounted volumes directly

**Default behavior:**
- If not specified: `/root` (container default)
- Directory must exist in container
- Can be any valid path

**Common working directories:**
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

**Non-existent directory:**
```bash
# This will fail if directory doesn't exist
rfswift exec -c container -w /root/nonexistent

# Solution: Create in container first or bind from host
rfswift bindings add -c container -b /pathto/projects:/root/projects
rfswift exec -c container -w /root/projects
```

### Session Recording

Records the entire terminal session for documentation, debugging, or training.

**What gets recorded:**
- All terminal input (commands typed)
- All terminal output (command results)
- Timing information for accurate playback
- Tool outputs and error messages

**Auto-generated filenames:**
Format: `rfswift-exec-{container}-{timestamp}.cast`
```bash
rfswift exec -c my_container --record
# Creates: rfswift-exec-my_container-20240112-143022.cast
```

**Custom filenames:**
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

**Recording location:**
- Auto-generated: Current working directory on host
- Custom: As specified in `--record-output` path

**During recording:**
- No visible indication inside container
- `exit` of the sessions ends recording

**Playback:**
```bash
rfswift log replay -i session.cast
rfswift log replay -i session.cast -s 2.0  # 2x speed
```

---

## Container States

The `exec` command works with containers in different states:

### Running Containers

**Most common use case:**
```bash
# Container is already running
docker ps | grep my_container
# Shows running container

rfswift exec -c my_container
# Enters immediately
```

### Stopped Containers

**Container was previously stopped:**
```bash
# Container exists but is stopped
docker ps -a | grep my_container
# Shows exited container

rfswift exec -c my_container
# RF Swift automatically starts the container, then enters it
```

**What happens:**
1. RF Swift detects container is stopped
2. Starts the container with `docker start`
3. Waits for container to be ready
4. Enters with interactive shell

### Non-Existent Containers

**Error handling:**
```bash
rfswift exec -c nonexistent_container
# Error: No such container: nonexistent_container

# Solution: Create container first
rfswift run -i image -n nonexistent_container
```

---

## Shell Behavior

### Default Shell

RF Swift containers use `zsh` as the default shell with:
- Oh My Zsh configuration
- Syntax highlighting
- Auto-completion
- Custom prompt showing container name

**Terminal prompt example:**
```bash
┌─[root@container_name] - [/root/projects] - [Thu Jan 12, 14:30]
└─[$]>
```

### Multiple Sessions

You can have multiple `exec` sessions in the same container:

```bash
# Terminal 1
rfswift exec -c my_container

# Terminal 2 (simultaneously)
rfswift exec -c my_container

# Both sessions work in the same container
# Changes in one are visible in the other
```

**Use cases:**
- Monitor logs in one terminal while working in another
- Run long-running process in one, interact in another
- Separate recording sessions for different tasks

---

## Common Workflows

### Daily Assessment Workflow

```bash
# Morning: Start fresh
rfswift run -i pentest -n daily_work -b ~/work:/root/work

# Throughout day: Enter as needed
rfswift exec -c daily_work

# Exit and return multiple times
exit
rfswift exec -c daily_work

# End of day: Stop but keep for tomorrow
rfswift stop -c daily_work

# Next morning: Resume
rfswift exec -c daily_work  # Auto-starts and enters
```

### Development Workflow

```bash
# Setup development container
rfswift run -i sdr_full -n sdr_dev \
  -b ~/code:/root/code \
  -b ~/.gitconfig:/root/.gitconfig:ro

# Edit code on host with your IDE
# Test in container
rfswift exec -c sdr_dev -w /root/code
cd my_project
./build.sh
./test.sh
exit

# Repeat edit-test cycle
rfswift exec -c sdr_dev -w /root/code
```

### Troubleshooting Workflow

```bash
# Issue reported in container
rfswift exec -c problematic_container --record

# Investigate and record findings
ps aux
df -h
netstat -tulpn
exit

# Share recording with team
rfswift log replay -i rfswift-exec-problematic_container-*.cast
```

### Training Workflow

```bash
# Instructor prepares example
rfswift run -i sdr_full -n training_demo \
  -s /dev/rtlsdr0:/dev/rtlsdr0

# Record demonstration
rfswift exec -c training_demo \
  --record \
  --record-output training-lesson-01.cast

# Demonstrate tools and techniques
rtl_test -t
gqrx
exit

# Students replay later
rfswift log replay -i training-lesson-01.cast -s 1.5
```

---

## Comparison: run vs exec

| Aspect | `run` | `exec` |
|--------|-------|--------|
| **Purpose** | Create new container | Enter existing container |
| **Container state** | Creates new | Uses existing |
| **Image required** | Yes | No |
| **Configuration** | Full options available | Limited options |
| **Use when** | Starting new work | Continuing existing work |
| **Typical frequency** | Once per project | Multiple times per day |

**Typical flow:**
```bash
# Day 1: Create with run
rfswift run -i sdr_full -n project -b ~/work:/root/work

# Day 1-N: Enter with exec
rfswift exec -c project
# ... work ...
exit

# Repeat exec as needed
rfswift exec -c project
```

---

## Troubleshooting

### Container Not Found

**Error:** `Error: No such container: container_name`

**Solutions:**
```bash
# List all containers to find correct name
rfswift last

# Maybe it was removed?
rfswift run -i image -n container_name
```

### Container Won't Start

**Error:** Container fails to start when entering stopped container

**Solutions:**
```bash
# Check container status
docker ps -a | grep container_name

# Check logs
docker logs container_name

# Try manual start
docker start container_name

# If still fails, recreate
rfswift remove -c container_name
rfswift run -i image -n container_name
```

### Working Directory Doesn't Exist

**Error:** `cannot change directory to '/root/nonexistent'`

**Solutions:**
```bash
# Use default directory
rfswift exec -c container

# Create directory in container
rfswift exec -c container
mkdir -p /root/nonexistent
exit

# Or bind from host
rfswift bindings add -c container -b /pathto/host-dir:/root/nonexistent
rfswift exec -c container -w /root/nonexistent
```

### Recording Fails

**Problem:** `--record` flag doesn't work

**Solutions:**
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

### Permission Issues Inside Container

**Problem:** Can't access files or directories

**Solutions:**
```bash
# Check file permissions inside container
rfswift exec -c container
ls -la /path/to/file

# Fix permissions inside container
chmod 755 /path/to/file
chown root:root /path/to/file

# Or fix on host (for mounted volumes)
exit
chmod 755 ~/host-path/file
rfswift exec -c container
```

### Terminal Display Issues

**Problem:** Terminal formatting looks wrong

**Solutions:**
```bash
# Reset terminal
rfswift exec -c container
reset

# Or clear screen
clear

# Set correct TERM
export TERM=xterm-256color
```

### Multiple Containers with Similar Names

**Problem:** Partial name matches multiple containers

**Solutions:**
```bash
# Use full container name
rfswift exec -c full_container_name

# Or use container ID
docker ps -a  # Get full ID
rfswift exec -c a1b2c3d4e5f6

# List recent to identify
rfswift last
```

---

## Advanced Usage

### Execute Single Command (Non-Interactive)

While `exec` is primarily for interactive shells, you can execute single commands:

```bash
# Note: This requires using docker directly
docker exec -it container_name command

# For RF Swift interactive access, use:
rfswift exec -c container_name
```

### Enter as Different User

RF Swift containers run as root by default. To change user:

```bash
# Inside container
rfswift exec -c container
su - username # solution for now
```

### Custom Shell Environment

```bash
# Inside container, customize environment
rfswift exec -c container

# Set custom aliases
echo 'alias ll="ls -la"' >> ~/.zshrc
echo 'alias scan="rtl_test -t"' >> ~/.zshrc

# Reload
source ~/.zshrc
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create new containers
- [`stop`](/docs/commands/stop) - Stop running containers
- [`last`](/docs/commands/last) - List recent containers
- [`remove`](/docs/commands/remove) - Delete containers
- [`log`](/docs/commands/log) - Replay recorded sessions
- [`bindings`](/docs/commands/bindings) - Add devices/volumes to running containers

---

{{< callout emoji="💡" >}}
**Quick Tip**: Create a shell alias for faster access: `alias rfe='rfswift exec'` then just type `rfe` to enter your most recent container!
{{< /callout >}}

{{< callout type="info" >}}
**Recording Reminder**: When recording sessions with `--record`, remember that your terminal title will show "🔴 RECORDING" as a visual reminder. Everything you type and see will be captured!
{{< /callout >}}