---
title: "rfswift --engine and rfswift engine"
linkTitle: "engine"
navGroup: "Host & devices"
level: reference
description: "Choose the engine RF Swift uses, and manage the Lima VM on macOS."
weight: 64
---

An engine is the program that runs your labs: Docker, Podman, Lima (macOS) or Nix. RF Swift picks one for you automatically. Use `--engine` when you want a specific one for a command, and `rfswift engine lima` to manage the Lima virtual machine on macOS.

Not sure which engine to use? [Choose your engine](/docs/engines/) compares them in plain words.

```bash
rfswift --engine podman container create -i sdr_full -n my_lab
```

## Synopsis

```bash
rfswift --engine ENGINE [command] [options]      # docker, podman, lima, nix, auto
rfswift --gpu [command] [options]                 # macOS Apple Silicon: the krunkit GPU VM (implies --engine lima)
rfswift engine                                    # which engine is active, and why
rfswift engine lima status|set|reconfig|reset     # macOS
```

`--engine` is a **global flag**: put it before the subcommand. When several settings are present, RF Swift uses the first one it finds, in this order:

1. the `--engine` flag;
2. the `RFSWIFT_ENGINE` environment variable;
3. `engine =` in the `[general]` section of `config.ini`;
4. auto-detection.

`nix` selects the native [Nix engine](/docs/guide/nix-engine), which needs no container service: `rfswift container create --engine nix` creates a native environment, and `rfswift env ...` manages them.

## Options

| Flag | Description | Values |
|------|-------------|--------|
| `--engine STRING` | Engine for this command | `auto` (default), `docker`, `podman`, `lima`, `nix` |
| `--gpu` | macOS Apple Silicon: use the GPU-accelerated Lima VM (krunkit, Vulkan through Venus and MoltenVK). It is a separate instance, `rfswift-gpu`, with GPU compute but **no** USB passthrough | |

To make an engine the default without typing `--engine` every time, set it in `config.ini`:

```ini
[general]
engine = podman
```

## How RF Swift picks an engine

When you don't pass `--engine`, RF Swift looks for an engine at startup, in this order:

```
1. Is Podman installed?        -> check podman binary + fallback paths
2. Is Docker installed?        -> check docker binary
3. Is podman-docker shim active? -> detect via `docker --version` containing "podman"
4. Is Docker daemon running?   -> verify daemon connectivity
```

{{< tabs items="Both installed,Only Docker,Only Podman,Neither" >}}
  {{< tab >}}
When both Docker and Podman are installed, RF Swift uses whichever engine responds first. Force one with `--engine`:

```bash
rfswift --engine docker container create -i sdr_full -n my_container
rfswift --engine podman container create -i sdr_full -n my_container
```
  {{< /tab >}}
  {{< tab >}}
Docker is used automatically. You don't need `--engine`.

```bash
rfswift container create -i sdr_full -n my_container   # uses Docker
```
  {{< /tab >}}
  {{< tab >}}
Podman is used automatically. You don't need `--engine`.

```bash
rfswift container create -i sdr_full -n my_container   # uses Podman
```

{{< callout type="info" >}}
If `podman-docker` is installed, RF Swift recognises it and treats the system as Podman-only, even though a `docker` command exists.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
RF Swift reports that no container engine is available. If the Nix engine is set up, it points you to it instead: run the tools natively with `rfswift --engine nix ...`, or make Nix the default with `engine = nix` in `config.ini`. On Linux, `rfswift host setup` installs Docker, Podman or Nix.
  {{< /tab >}}
{{< /tabs >}}

## Examples

### Use Docker

Pull an image, create a lab and list your labs, all with Docker:

```bash
rfswift --engine docker image pull -i sdr_full
rfswift --engine docker container create -i sdr_full -n my_sdr
rfswift --engine docker container last
```

### Use Podman

The same with Podman, which runs the lab rootless:

```bash
rfswift --engine podman image pull -i sdr_full
rfswift --engine podman container create -i sdr_full -n rootless_sdr
rfswift --engine podman container last
```

### Use Lima (USB devices on macOS)

Attach the USB device to the Lima VM first, create the lab with Lima, and detach the device when you are done:

```bash
rfswift usb attach --vid 0x1d50 --pid 0x604b
rfswift --engine lima container create -i sdr_full -n usb_sdr
rfswift --engine lima container last
rfswift usb detach --vid 0x1d50 --pid 0x604b
```

{{< callout type="info" >}}
Lima creates and starts its QEMU VM on first use. You never need to run `limactl` yourself.
{{< /callout >}}

### Use both engines side by side

With both engines installed, you can keep separate labs. For example, a privileged Docker lab for hardware work and a rootless, offline Podman lab with read-only samples:

```bash
rfswift --engine docker container create -i sdr_full -n docker_sdr \
  -u 1 \
  -s /dev/bus/usb:/dev/bus/usb

rfswift --engine podman container create -i reversing -n podman_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro
```

{{< callout type="warning" >}}
Each engine only sees its own containers. A container created with `--engine docker` cannot be opened with `--engine podman`, and the other way round.
{{< /callout >}}

## Engine comparison

| | Docker | Podman | Lima |
|---|---|---|---|
| **Architecture** | Client-server (daemon) | Daemonless (fork-exec) | Docker inside a QEMU VM |
| **Root required** | Yes (daemon runs as root) | No (rootless by default) | No (Lima manages the VM) |
| **Socket** | `/var/run/docker.sock` | `$XDG_RUNTIME_DIR/podman/podman.sock` | `~/.lima/rfswift/sock/docker.sock` |
| **Image format** | OCI / Docker | OCI / Docker | OCI / Docker |
| **USB passthrough** | Linux only | Linux only | macOS, through QMP hot-plug |
| **Privileged mode** | Full host access | Limited to the user namespace | Full access inside the VM |
| **Platform** | Linux, macOS, Windows | Linux, macOS, Windows | macOS only |
| **Best for** | Broad ecosystem | Security-focused, air-gapped | macOS with USB hardware |

The fourth engine, **Nix**, is not a container engine. It installs the tool sets natively as pinned environments: no daemon, direct hardware access, and an optional `--isolate` jail. See the [Nix engine guide](/docs/guide/nix-engine).

{{< callout type="info" >}}
**USB on macOS**: Docker Desktop and Podman cannot forward USB devices into containers. Use `--engine lima` for SDR dongles and other USB RF hardware, or the Nix engine to run the tools natively. See [usb](/docs/commands/usb).
{{< /callout >}}

## Podman notes

### Rootless setup

Podman runs rootless by default. Check that your system is ready:

```bash
# Check subordinate UID/GID ranges
grep $USER /etc/subuid /etc/subgid

# If empty, configure them
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Keep containers running after you log out
sudo loginctl enable-linger $USER

# Enable the Podman socket (Docker API compatibility)
systemctl --user enable --now podman.socket
```

### Image names and registries

With a short image name, Podman may ask which registry to use. A full name never asks:

```bash
rfswift --engine podman image pull -i docker.io/penthertz/rfswift_resolute:sdr_full   # no prompt
rfswift --engine podman image pull -i sdr_full                                          # may prompt
```

To stop the prompts, set a default registry in `/etc/containers/registries.conf`:

```toml
unqualified-search-registries = ["docker.io"]
```

### Privileged mode

In rootless Podman, `-u 1` (privileged) gives privileges **inside the user namespace** only. That is more restricted than Docker's privileged mode, which gives full root access to the host:

```bash
rfswift --engine docker container create -i sdr_full -n docker_priv -u 1   # full host root access
rfswift --engine podman container create -i sdr_full -n podman_priv -u 1   # root inside the user namespace
```

### cgroups

RF Swift detects cgroup v1 and v2 and sets the device access rules to match. There is nothing to configure.

## Docker notes

### The Docker service must be running

```bash
sudo systemctl status docker     # check
sudo systemctl start docker      # start it
sudo systemctl enable docker     # start it at boot
```

### Use Docker without sudo

`rfswift host docker-access` does this for you, effective right away. By hand:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

## Troubleshooting

### "No container engine found"

Install an engine with the RF Swift installer, or, on a packaged install, with the host wizard:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
rfswift host setup --engine podman
```

Or install one by hand:

```bash
sudo apt install podman     # Debian/Ubuntu
sudo dnf install podman     # Fedora
curl -fsSL https://get.docker.com | sudo sh  # Docker
```

### RF Swift uses Docker when you want Podman (or the other way round)

Pass the engine explicitly:

```bash
rfswift --engine podman container create -i sdr_full -n my_container
```

### podman-docker shim detected as Docker

The `podman-docker` package provides a `docker` command that is really Podman. RF Swift handles this: it checks the output of `docker --version` for the word "podman" and identifies the engine correctly. Nothing to do.

### A container created with one engine is missing in the other

This is expected: each engine keeps its own containers and images. Use the same `--engine` you used to create the container:

```bash
rfswift --engine docker container shell -c my_container   # created with Docker
rfswift --engine podman container shell -c my_container   # created with Podman
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RFSWIFT_ENGINE` | Choose the engine (`docker`, `podman`, `lima`, `nix`). The `--engine` flag wins over it | `auto` |
| `RFSWIFT_LIMA_INSTANCE` | Custom Lima VM instance name (`--gpu` uses `rfswift-gpu`) | `rfswift` |

For example, to use Lima for a whole terminal session, or a Lima instance of your own:

```bash
export RFSWIFT_ENGINE=lima
rfswift container create -i sdr_full -n my_sdr

export RFSWIFT_LIMA_INSTANCE=my_custom_vm
rfswift usb status
```

## rfswift engine

Without a subcommand, `rfswift engine` shows the engine in use, how it was detected, and its socket paths.

```bash
rfswift engine
```

## rfswift engine lima

Manage the Lima QEMU VM on macOS without using `limactl` directly.

{{< callout type="warning" >}}
**macOS only**: the `engine lima` subcommands are only available on macOS.
{{< /callout >}}

### What RF Swift does for you

RF Swift manages the Lima VM automatically. Whenever you run a command with `--engine lima`, it:

1. **Checks** whether the Lima instance exists.
2. **Creates** it if it doesn't, from the best available template (it searches the standard paths and falls back to a built-in template).
3. **Starts** it if it exists but is stopped.
4. **Waits** up to 60 seconds for Docker to be ready inside the VM.
5. **Routes** container commands to the VM by setting `DOCKER_HOST` to the Lima Docker socket.

The first run creates and starts the VM; later runs only start it if needed:

```bash
# First run: RF Swift creates the VM, installs Docker + USB tools, starts everything
rfswift --engine lima container create -i sdr_full -n my_sdr
# -> "Lima instance 'rfswift' not found. Creating it..."
# -> "Lima instance 'rfswift' created and started"
# -> Container runs normally

# Second run: the VM already exists, RF Swift starts it if stopped
rfswift --engine lima container create -i sdr_full -n another_sdr
# -> "Starting Lima instance 'rfswift'..."
# -> Container runs normally

# VM already running, so this runs immediately with no extra steps
rfswift --engine lima container shell -c my_sdr
```

The VM comes with:

- the Docker engine;
- USB libraries (`libusb`, `libhidapi`, `libftdi`);
- kernel modules for USB serial devices (`cp210x`, `ftdi_sio`, `ch341`);
- a Bluetooth stack (`bluez`, `btusb`, `rfcomm`, `vhci-hcd`);
- udev rules for more than 100 RF and USB devices (HackRF, RTL-SDR, USRP, BladeRF, Airspy, PlutoSDR, LimeSDR, and more).

{{< callout type="info" >}}
**USB on macOS in two steps**: plug in your SDR, attach it with `rfswift usb attach`, then run `rfswift --engine lima container create ...`. The VM is created, started and prepared for you.
{{< /callout >}}

### engine lima status

Shows the Lima VM: whether it is running, its configuration file, where its template came from, its QMP socket and its Docker socket.

```bash
rfswift engine lima status
rfswift engine lima status --instance my_custom_vm
```

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

The output shows:

- the instance name and whether it is running or stopped;
- the configuration file path (`~/.lima/<instance>/lima.yaml`);
- the template source (or "inline fallback" if none was found);
- the QMP socket path, needed for USB passthrough;
- the Docker socket path, used to route container commands.

### engine lima reconfig

Applies an updated YAML template to the VM. By default this keeps your data: RF Swift stops the VM, applies the template and restarts it. Docker images, containers and everything else inside the VM are kept.

```bash
# Keep the data: stop -> apply template -> restart
rfswift engine lima reconfig

# Use a specific template
rfswift engine lima reconfig --template ~/my-custom-lima.yaml

# Destructive: delete and recreate the VM (all VM data lost)
rfswift engine lima reconfig --force
```

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--template STRING` | Path to the Lima YAML template | Auto-detected | `--template ~/lima.yaml` |
| `--force` | Delete and recreate the VM (destructive) | `false` | `--force` |
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

Without `--template`, RF Swift looks for a template in this order:

1. `<binary_dir>/lima/rfswift.yaml`
2. `~/.config/rfswift/lima.yaml`
3. `~/.rfswift/lima.yaml`

{{< callout type="warning" >}}
**`--force` is destructive**: the VM is deleted and recreated from scratch, and everything inside it is lost, including Docker images and containers. RF Swift asks you to confirm first.
{{< /callout >}}

Use `reconfig` when you have:

- changed the CPU, memory or disk allocation in the YAML;
- added port forwards or host directory mounts;
- updated the provisioning scripts (udev rules, kernel modules);
- changed the base OS image or the disk size (these need `--force`, a full rebuild).

### engine lima set

Changes the VM's CPUs, memory or disk without editing the YAML by hand. The change is written to your user template (`~/.config/rfswift/lima.yaml`, or `lima-gpu.yaml` with `--gpu`). CPU and memory changes apply after a restart (`--apply`); a disk change needs a destructive rebuild.

```bash
rfswift engine lima set --memory 16GiB
rfswift engine lima set --cpus 8 --memory 16GiB --apply
rfswift --gpu engine lima set --disk 300GiB     # target the GPU VM
```

| Flag | Description |
|------|-------------|
| `--cpus INT` | Number of vCPUs |
| `--memory STRING` | VM memory, for example `16GiB` |
| `--disk STRING` | VM disk size, for example `200GiB` (recreate the VM to apply) |
| `--apply` | Apply now: restart for CPU and memory, recreate (after confirmation) for disk |

### engine lima reset

Deletes the Lima VM and recreates it from scratch. Everything inside the VM is lost. It does the same as `reconfig --force`, but also works when no instance exists yet.

```bash
rfswift engine lima reset
rfswift engine lima reset --template ~/my-custom-lima.yaml
```

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--template STRING` | Path to the Lima YAML template | Auto-detected | `--template ~/lima.yaml` |
| `--instance STRING` | Lima instance name | `rfswift` | `--instance myvm` |

{{< callout type="warning" >}}
**Destructive**: RF Swift asks you to confirm before it deletes the VM.
{{< /callout >}}

## Related

- [Choose your engine](/docs/engines/): what each engine is good at
- [container create](/docs/commands/run) and [container shell](/docs/commands/exec)
- [image pull / local / remote](/docs/commands/images)
- [usb](/docs/commands/usb) and [macusb](/docs/commands/macusb): USB devices on macOS
- [network](/docs/commands/network)
- [Install RF Swift](/docs/getting-started) and [Will it run on my computer?](/docs/supports)

{{< callout type="tip" >}}
If you only ever use one engine, you never need `--engine`: RF Swift detects it. The flag matters when several engines are installed and you want a specific one.
{{< /callout >}}
