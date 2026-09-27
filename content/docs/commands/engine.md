---
title: "rfswift --engine and rfswift engine"
linkTitle: "engine"
navGroup: "Host & devices"
level: reference
description: "Choose the engine RF Swift uses, and manage the Lima VM on macOS."
weight: 64
---

Select the engine used by RF Swift, and manage the Lima VM on macOS.

## Synopsis

```bash
rfswift --engine ENGINE [command] [options]      # docker, podman, lima, nix, auto
rfswift --gpu [command] [options]                 # macOS Apple Silicon: the krunkit GPU VM (implies --engine lima)
rfswift engine                                    # which engine is active, and why
rfswift engine lima status|set|reconfig|reset     # macOS
```

`--engine` is a **global flag** placed before any subcommand. Precedence when several are set: the `--engine` flag, then the `RFSWIFT_ENGINE` environment variable, then `engine =` in the `[general]` section of `config.ini`, then auto-detection. `nix` selects the native [Nix engine](/docs/guide/nix-engine), which needs no container daemon: `rfswift container create --engine nix` creates a native environment and `rfswift env ...` manages them.

---

## Options

| Flag | Description | Values |
|------|-------------|--------|
| `--engine STRING` | Engine for this command | `auto` (default), `docker`, `podman`, `lima`, `nix` |
| `--gpu` | macOS Apple Silicon: use the GPU-accelerated Lima VM (krunkit, Vulkan through Venus and MoltenVK). Separate instance `rfswift-gpu`, GPU compute but **no** USB passthrough | |

```ini
# make Podman (or nix) the default without typing --engine
[general]
engine = podman
```

---

## Auto-Detection behavior

When `--engine` is **not specified**, RF Swift automatically detects the available container engine at startup using the following priority:

```
1. Is Podman installed?        -> check podman binary + fallback paths
2. Is Docker installed?        -> check docker binary
3. Is podman-docker shim active? -> detect via `docker --version` containing "podman"
4. Is Docker daemon running?   -> verify daemon connectivity
```

{{< tabs items="Both installed,Only Docker,Only Podman,Neither" >}}
  {{< tab >}}
When both Docker and Podman are installed, RF Swift defaults to whichever engine responds first. Use `--engine` to force a specific one:

```bash
# Force Docker
rfswift --engine docker container create -i sdr_full -n my_container

# Force Podman
rfswift --engine podman container create -i sdr_full -n my_container
```
  {{< /tab >}}
  {{< tab >}}
Docker is used automatically. No `--engine` flag needed.

```bash
rfswift container create -i sdr_full -n my_container
# -> uses Docker
```
  {{< /tab >}}
  {{< tab >}}
Podman is used automatically. No `--engine` flag needed.

```bash
rfswift container create -i sdr_full -n my_container
# -> uses Podman
```

{{< callout type="info" >}}
If `podman-docker` is installed, RF Swift detects it and treats the system as Podman-only, even though the `docker` command is available.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
RF Swift reports that no container engine is available. When the Nix engine is set up on the host it points at it instead: run tools natively with `rfswift --engine nix ...`, or make it the default with `engine = nix` in `config.ini`. `rfswift host setup` installs Docker, Podman or Nix on Linux.
  {{< /tab >}}
{{< /tabs >}}

---

## Examples

### Force Docker

```bash
# Pull image with Docker
rfswift --engine docker image pull -i sdr_full

# Run container with Docker
rfswift --engine docker container create -i sdr_full -n my_sdr

# List containers managed by Docker
rfswift --engine docker container last
```

### Force Podman

```bash
# Pull image with Podman
rfswift --engine podman image pull -i sdr_full

# Run rootless container with Podman
rfswift --engine podman container create -i sdr_full -n rootless_sdr

# List containers managed by Podman
rfswift --engine podman container last
```

### Force Lima (macOS USB passthrough)

```bash
# Attach USB device to Lima VM first
rfswift macusb attach --vid 0x1d50 --pid 0x604b

# Run container via Lima's Docker (USB devices visible)
rfswift --engine lima container create -i sdr_full -n usb_sdr

# List containers in Lima
rfswift --engine lima container last

# When done, detach device
rfswift macusb detach --vid 0x1d50 --pid 0x604b
```

{{< callout type="info" >}}
Lima auto-creates and starts the QEMU VM on first use. No manual `limactl` setup needed.
{{< /callout >}}

### Mixed workflows

If both engines are installed, you can maintain separate environments:

```bash
# Docker for privileged hardware work
rfswift --engine docker container create -i sdr_full -n docker_sdr \
  -u 1 \
  -s /dev/bus/usb:/dev/bus/usb

# Podman for rootless analysis
rfswift --engine podman container create -i reversing -n podman_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro
```

{{< callout type="warning" >}}
Containers created with one engine are **not visible** to the other. A container created with `--engine docker` cannot be accessed with `--engine podman` and vice versa.
{{< /callout >}}

---

## Engine comparison

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

The fourth engine, **Nix**, is not a container engine: it installs the tool sets natively as pinned environments (no daemon, direct hardware access, optional `--isolate` jail). See the [Nix engine guide](/docs/guide/nix-engine).

{{< callout type="info" >}}
**macOS USB passthrough**: On macOS, Docker Desktop and Podman cannot forward USB devices into containers. Use `--engine lima` when you need SDR dongles or other USB RF hardware. See [`macusb`](/docs/commands/macusb) for details.
{{< /callout >}}

---

## Podman-Specific notes

### Rootless configuration

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

### Image registry

Podman may prompt for a registry when using short image names:

```bash
# Full name (no prompt)
rfswift --engine podman image pull -i docker.io/penthertz/rfswift_resolute:sdr_full

# Short name (may prompt for registry selection)
rfswift --engine podman image pull -i sdr_full
```

To avoid prompts, configure default registries in `/etc/containers/registries.conf`:

```toml
unqualified-search-registries = ["docker.io"]
```

### Privileged mode differences

In rootless Podman, `-u 1` (privileged) grants privileges **within the user namespace**, which is still more restricted than Docker's privileged mode:

```bash
# Docker privileged = full host root access
rfswift --engine docker container create -i sdr_full -n docker_priv -u 1

# Podman privileged = root within user namespace (safer)
rfswift --engine podman container create -i sdr_full -n podman_priv -u 1
```

### Cgroup compatibility

RF Swift auto-detects cgroup v1 and v2 and configures device access rules accordingly. No manual configuration is needed.

---

## Docker-Specific notes

### Daemon requirement

Docker requires its daemon to be running:

```bash
# Check daemon status
sudo systemctl status docker

# Start if stopped
sudo systemctl start docker

# Enable at boot
sudo systemctl enable docker
```

### Group membership

To run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Troubleshooting

### Engine not found

**Error:** `No container engine found`

**Solution:**
```bash
# Install via RF Swift installer, or the host wizard on a packaged install
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
rfswift host setup --engine podman

# Or install manually
sudo apt install podman     # Debian/Ubuntu
sudo dnf install podman     # Fedora
curl -fsSL https://get.docker.com | sudo sh  # Docker
```

### Wrong engine detected

**Problem:** RF Swift picks Docker when you want Podman (or vice versa)

**Solution:**
```bash
# Explicit override
rfswift --engine podman container create -i sdr_full -n my_container
```

### podman-docker shim detected as Docker

**Problem:** `podman-docker` package makes `docker` command available but it's actually Podman

**Solution:** RF Swift handles this automatically. It checks `docker --version` output for the word "podman" and correctly identifies the engine. No action needed.

### Containers not visible across engines

**Problem:** Created a container with Docker but can't see it with Podman

**Solution:** This is expected behavior. Each engine manages its own containers and images independently. Use the same `--engine` flag you used to create the container:

```bash
# If created with Docker
rfswift --engine docker container shell -c my_container

# If created with Podman
rfswift --engine podman container shell -c my_container
```

---

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RFSWIFT_ENGINE` | Override the engine (`docker`, `podman`, `lima`, `nix`); the `--engine` flag wins | `auto` |
| `RFSWIFT_LIMA_INSTANCE` | Custom Lima VM instance name (`--gpu` uses `rfswift-gpu`) | `rfswift` |

```bash
# Use Lima engine via environment variable
export RFSWIFT_ENGINE=lima
rfswift container create -i sdr_full -n my_sdr

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

### Automatic VM lifecycle management

RF Swift now **automatically manages the Lima VM**, so you never need to run `limactl` yourself. When you run any command with `--engine lima`, RF Swift transparently handles the full VM lifecycle:

1. **Instance detection**: Checks if the Lima instance exists
2. **Auto-creation**: If the instance doesn't exist, creates it from the best available template (searches standard paths, falls back to a built-in inline template)
3. **Auto-start**: If the instance exists but is stopped, starts it automatically
4. **Docker readiness**: Waits (up to 60 seconds) for Docker to become available inside the VM before proceeding
5. **Socket routing**: Sets `DOCKER_HOST` to the Lima Docker socket so all container operations work transparently

```bash
# First run: RF Swift creates the VM, installs Docker + USB tools, starts everything
rfswift --engine lima container create -i sdr_full -n my_sdr
# -> "Lima instance 'rfswift' not found. Creating it..."
# -> "Lima instance 'rfswift' created and started"
# -> Container runs normally

# Second run: the VM already exists, RF Swift just starts it if stopped
rfswift --engine lima container create -i sdr_full -n another_sdr
# -> "Starting Lima instance 'rfswift'..."
# -> Container runs normally

# VM already running, so this runs immediately with no extra steps
rfswift --engine lima container shell -c my_sdr
```

The auto-created VM is fully provisioned with:
- Docker engine
- USB libraries (`libusb`, `libhidapi`, `libftdi`)
- Kernel modules for USB serial devices (`cp210x`, `ftdi_sio`, `ch341`)
- Bluetooth stack (`bluez`, `btusb`, `rfcomm`, `vhci-hcd`)
- Udev rules for 100+ RF/USB devices (HackRF, RTL-SDR, USRP, BladeRF, Airspy, PlutoSDR, LimeSDR, etc.)

{{< callout type="info" >}}
**Zero-configuration USB workflow on macOS**: Just plug in your SDR, run `rfswift --engine lima container create ...`, and the VM is created, started and ready, all automatically.
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

Apply an updated YAML template to the VM. By default this is **non-destructive**: the VM is stopped, the template is applied, and the VM is restarted. The VM filesystem (Docker images, containers, etc.) is preserved.

```bash
# Non-destructive: stop -> apply template -> restart
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

### engine lima set

Change the VM's CPUs, memory or disk without editing the YAML by hand. Changes are written to your user template (`~/.config/rfswift/lima.yaml`, or `lima-gpu.yaml` with `--gpu`); CPU and memory apply with a restart (`--apply`), a disk change needs a destructive rebuild.

```bash
rfswift engine lima set --memory 16GiB
rfswift engine lima set --cpus 8 --memory 16GiB --apply
rfswift --gpu engine lima set --disk 300GiB     # target the GPU VM
```

| Flag | Description |
|------|-------------|
| `--cpus INT` | Number of vCPUs |
| `--memory STRING` | VM memory, e.g. `16GiB` |
| `--disk STRING` | VM disk size, e.g. `200GiB` (recreate to apply) |
| `--apply` | Apply now: restart for CPU and memory, recreate (after confirmation) for disk |

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
**Tip**: If you always use the same engine, you don't need `--engine` at all, because RF Swift auto-detects and uses whatever is available. The flag is only needed when both engines are installed and you want to force a specific one.
{{< /callout >}}