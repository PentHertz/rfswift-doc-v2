---
title: engine
weight: 0
prev: /docs/commands
next: /docs/commands/run
---

# rfswift --engine

Select the container engine used by RF Swift.

## Synopsis

```bash
rfswift --engine ENGINE [command] [options]
```

The `--engine` flag is a **global flag** that overrides RF Swift's auto-detection and forces a specific container engine for the current command. It must be placed **before** any subcommand.

---

## Options

| Flag | Description | Values |
|------|-------------|--------|
| `--engine STRING` | Force a specific container engine | `docker`, `podman`, `lima` |

---

## Auto-Detection Behavior

When `--engine` is **not specified**, RF Swift automatically detects the available container engine at startup using the following priority:

```
1. Is Podman installed?        → check podman binary + fallback paths
2. Is Docker installed?        → check docker binary
3. Is podman-docker shim active? → detect via `docker --version` containing "podman"
4. Is Docker daemon running?   → verify daemon connectivity
```

{{< tabs items="Both installed,Only Docker,Only Podman,Neither" >}}
  {{< tab >}}
When both Docker and Podman are installed, RF Swift defaults to whichever engine responds first. Use `--engine` to force a specific one:

```bash
# Force Docker
rfswift --engine docker run -i sdr_full -n my_container

# Force Podman
rfswift --engine podman run -i sdr_full -n my_container
```
  {{< /tab >}}
  {{< tab >}}
Docker is used automatically. No `--engine` flag needed.

```bash
rfswift run -i sdr_full -n my_container
# → uses Docker
```
  {{< /tab >}}
  {{< tab >}}
Podman is used automatically. No `--engine` flag needed.

```bash
rfswift run -i sdr_full -n my_container
# → uses Podman
```

{{< callout type="info" >}}
If `podman-docker` is installed, RF Swift detects it and treats the system as Podman-only, even though the `docker` command is available.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
RF Swift will display an error and prompt you to install a container engine:

```
❌ No container engine found. Please install Docker or Podman.
   Run ./scripts/install.sh or visit https://rfswift.io/docs/getting-started/
```
  {{< /tab >}}
{{< /tabs >}}

---

## Examples

### Force Docker

```bash
# Pull image with Docker
rfswift --engine docker images pull -i sdr_full

# Run container with Docker
rfswift --engine docker run -i sdr_full -n my_sdr

# List containers managed by Docker
rfswift --engine docker last
```

### Force Podman

```bash
# Pull image with Podman
rfswift --engine podman images pull -i sdr_full

# Run rootless container with Podman
rfswift --engine podman run -i sdr_full -n rootless_sdr

# List containers managed by Podman
rfswift --engine podman last
```

### Force Lima (macOS USB passthrough)

```bash
# Attach USB device to Lima VM first
rfswift macusb attach --vid 0x1d50 --pid 0x604b

# Run container via Lima's Docker (USB devices visible)
rfswift --engine lima run -i sdr_full -n usb_sdr

# List containers in Lima
rfswift --engine lima last

# When done, detach device
rfswift macusb detach --vid 0x1d50 --pid 0x604b
```

{{< callout type="info" >}}
Lima auto-creates and starts the QEMU VM on first use. No manual `limactl` setup needed.
{{< /callout >}}

### Mixed Workflows

If both engines are installed, you can maintain separate environments:

```bash
# Docker for privileged hardware work
rfswift --engine docker run -i sdr_full -n docker_sdr \
  -u 1 \
  -s /dev/bus/usb:/dev/bus/usb

# Podman for rootless analysis
rfswift --engine podman run -i reversing -n podman_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro
```

{{< callout type="warning" >}}
Containers created with one engine are **not visible** to the other. A container created with `--engine docker` cannot be accessed with `--engine podman` and vice versa.
{{< /callout >}}

---

## Engine Comparison

| | Docker | Podman | Lima |
|---|---|---|---|
| **Architecture** | Client-server (daemon) | Daemonless (fork-exec) | Docker inside QEMU VM |
| **Root required** | Yes (daemon runs as root) | No (rootless by default) | No (Lima manages VM) |
| **Socket** | `/var/run/docker.sock` | `$XDG_RUNTIME_DIR/podman/podman.sock` | `~/.lima/rfswift/sock/docker.sock` |
| **Image format** | OCI / Docker | OCI / Docker | OCI / Docker |
| **USB passthrough** | Linux only | Linux only | macOS via QMP hot-plug |
| **Privileged mode** | Full host access | User-namespace scoped | Full access inside VM |
| **Platform** | Linux, macOS, Windows | Linux, macOS, Windows | macOS only |
| **Best for** | Broad ecosystem | Security-focused, air-gapped | macOS + USB hardware |

{{< callout type="info" >}}
**macOS USB passthrough**: On macOS, Docker Desktop and Podman cannot forward USB devices into containers. Use `--engine lima` when you need SDR dongles or other USB RF hardware. See [`macusb`](/docs/commands/macusb) for details.
{{< /callout >}}

---

## Podman-Specific Notes

### Rootless Configuration

Podman runs rootless by default. Ensure your system is configured:

```bash
# Check subordinate UID/GID ranges
grep $USER /etc/subuid /etc/subgid

# If empty, configure them
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Enable lingering (containers survive logout)
sudo loginctl enable-linger $USER

# Enable Podman socket (Docker API compatibility)
systemctl --user enable --now podman.socket
```

### Image Registry

Podman may prompt for a registry when using short image names:

```bash
# Full name (no prompt)
rfswift --engine podman images pull -i docker.io/penthertz/rfswift_noble:sdr_full

# Short name (may prompt for registry selection)
rfswift --engine podman images pull -i sdr_full
```

To avoid prompts, configure default registries in `/etc/containers/registries.conf`:

```toml
unqualified-search-registries = ["docker.io"]
```

### Privileged Mode Differences

In rootless Podman, `-u 1` (privileged) grants privileges **within the user namespace**, which is still more restricted than Docker's privileged mode:

```bash
# Docker privileged = full host root access
rfswift --engine docker run -i sdr_full -n docker_priv -u 1

# Podman privileged = root within user namespace (safer)
rfswift --engine podman run -i sdr_full -n podman_priv -u 1
```

### Cgroup Compatibility

RF Swift auto-detects cgroup v1 and v2 and configures device access rules accordingly. No manual configuration is needed.

---

## Docker-Specific Notes

### Daemon Requirement

Docker requires its daemon to be running:

```bash
# Check daemon status
sudo systemctl status docker

# Start if stopped
sudo systemctl start docker

# Enable at boot
sudo systemctl enable docker
```

### Group Membership

To run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Troubleshooting

### Engine Not Found

**Error:** `No container engine found`

**Solution:**
```bash
# Install via RF Swift installer
curl -fsSL "https://get.rfswift.io/" | sh

# Or install manually
sudo apt install podman     # Debian/Ubuntu
sudo dnf install podman     # Fedora
curl -fsSL https://get.docker.com | sudo sh  # Docker
```

### Wrong Engine Detected

**Problem:** RF Swift picks Docker when you want Podman (or vice versa)

**Solution:**
```bash
# Explicit override
rfswift --engine podman run -i sdr_full -n my_container
```

### podman-docker Shim Detected as Docker

**Problem:** `podman-docker` package makes `docker` command available but it's actually Podman

**Solution:** RF Swift handles this automatically. It checks `docker --version` output for the word "podman" and correctly identifies the engine. No action needed.

### Containers Not Visible Across Engines

**Problem:** Created a container with Docker but can't see it with Podman

**Solution:** This is expected behavior. Each engine manages its own containers and images independently. Use the same `--engine` flag you used to create the container:

```bash
# If created with Docker
rfswift --engine docker exec -c my_container

# If created with Podman
rfswift --engine podman exec -c my_container
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RFSWIFT_ENGINE` | Override the container engine (`docker`, `podman`, `lima`) | `auto` |
| `RFSWIFT_LIMA_INSTANCE` | Custom Lima VM instance name | `rfswift` |

```bash
# Use Lima engine via environment variable
export RFSWIFT_ENGINE=lima
rfswift run -i sdr_full -n my_sdr

# Use a custom Lima instance name
export RFSWIFT_LIMA_INSTANCE=my_custom_vm
rfswift macusb status
```

---

## rfswift engine

Running `rfswift engine` without subcommands displays information about the currently active container engine, including detection results and socket paths.

```bash
rfswift engine
```

---

## rfswift engine lima

Manage the Lima QEMU VM lifecycle on macOS. These commands give you direct control over the Lima VM without resorting to raw `limactl` commands.

{{< callout type="warning" >}}
**macOS only**: The `engine lima` subcommands are only available on macOS.
{{< /callout >}}

### Automatic VM Lifecycle Management

RF Swift now **automatically manages the Lima VM** — no manual `limactl` commands required. When you run any command with `--engine lima`, RF Swift transparently handles the full VM lifecycle:

1. **Instance detection**: Checks if the Lima instance exists
2. **Auto-creation**: If the instance doesn't exist, creates it from the best available template (searches standard paths, falls back to a built-in inline template)
3. **Auto-start**: If the instance exists but is stopped, starts it automatically
4. **Docker readiness**: Waits (up to 60 seconds) for Docker to become available inside the VM before proceeding
5. **Socket routing**: Sets `DOCKER_HOST` to the Lima Docker socket so all container operations work transparently

```bash
# First run — RF Swift creates the VM, installs Docker + USB tools, starts everything
rfswift --engine lima run -i sdr_full -n my_sdr
# → "Lima instance 'rfswift' not found. Creating it..."
# → "Lima instance 'rfswift' created and started"
# → Container runs normally

# Second run — VM already exists, RF Swift just starts it if stopped
rfswift --engine lima run -i sdr_full -n another_sdr
# → "Starting Lima instance 'rfswift'..."
# → Container runs normally

# VM already running — no extra steps, runs immediately
rfswift --engine lima exec -c my_sdr
```

The auto-created VM is fully provisioned with:
- Docker engine
- USB libraries (`libusb`, `libhidapi`, `libftdi`)
- Kernel modules for USB serial devices (`cp210x`, `ftdi_sio`, `ch341`)
- Bluetooth stack (`bluez`, `btusb`, `rfcomm`, `vhci-hcd`)
- Udev rules for 100+ RF/USB devices (HackRF, RTL-SDR, USRP, BladeRF, Airspy, PlutoSDR, LimeSDR, etc.)

{{< callout type="info" >}}
**Zero-configuration USB workflow on macOS**: Just plug in your SDR, run `rfswift --engine lima run ...`, and the VM is created, started, and ready — all automatically.
{{< /callout >}}

### engine lima status

Display the Lima VM instance details: running status, configuration file path, template source, QMP socket, and Docker socket.

```bash
rfswift engine lima status
rfswift engine lima status --instance my_custom_vm
```

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

**Output includes:**
- Instance name and running/stopped status
- Configuration file path (`~/.lima/<instance>/lima.yaml`)
- Template source location (or "inline fallback" if none found)
- QMP socket path (required for USB passthrough)
- Docker socket path (for container engine routing)

### engine lima reconfig

Apply an updated YAML template to the VM. By default this is **non-destructive** — the VM is stopped, the template is applied, and the VM is restarted. The VM filesystem (Docker images, containers, etc.) is preserved.

```bash
# Non-destructive: stop → apply template → restart
rfswift engine lima reconfig

# Use a specific template
rfswift engine lima reconfig --template ~/my-custom-lima.yaml

# Destructive: delete and recreate the VM (all VM data lost)
rfswift engine lima reconfig --force
```

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--template STRING` | Path to Lima YAML template | Auto-detected | `--template ~/lima.yaml` |
| `--force` | Delete and recreate the VM (destructive) | `false` | `--force` |
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

**Template search order** (when `--template` is not specified):
1. `<binary_dir>/lima/rfswift.yaml`
2. `~/.config/rfswift/lima.yaml`
3. `~/.rfswift/lima.yaml`

{{< callout type="warning" >}}
**`--force` is destructive**: With `--force`, the VM is deleted and recreated from scratch. All data inside the VM is lost, including Docker images and containers. An interactive confirmation prompt is shown before proceeding.
{{< /callout >}}

**Use cases:**
- Changed CPU, memory, or disk allocation in the YAML
- Added new port forwards or host directory mounts
- Updated provisioning scripts (udev rules, kernel modules)
- With `--force`: changed base OS image or disk size (requires full recreation)

### engine lima reset

Delete and recreate the Lima VM from scratch. All data inside the VM is lost. This is equivalent to `reconfig --force`, but also works when no instance exists yet.

```bash
rfswift engine lima reset
rfswift engine lima reset --template ~/my-custom-lima.yaml
```

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--template STRING` | Path to Lima YAML template | Auto-detected | `--template ~/lima.yaml` |
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

{{< callout type="warning" >}}
**Destructive operation**: An interactive confirmation prompt is shown before the VM is deleted.
{{< /callout >}}

---

## Related

- [`run`](/docs/commands/run) - Create and run containers
- [`exec`](/docs/commands/exec) - Enter existing containers
- [`images`](/docs/commands/images) - Manage container images
- [`macusb`](/docs/commands/macusb) - Manage USB devices on macOS via Lima
- [`network`](/docs/commands/network) - Manage container networks
- [Getting Started](/docs/getting-started) - Installation and engine setup
- [Container Engine Support](/docs/supports) - Requirements and platform support

---

{{< callout emoji="💡" >}}
**Tip**: If you always use the same engine, you don't need `--engine` at all — RF Swift auto-detects and uses whatever is available. The flag is only needed when both engines are installed and you want to force a specific one.
{{< /callout >}}