---
title: gpus
weight: 18
prev: /docs/commands/cgroups
next: /docs/commands/ports
---

# GPU Passthrough

Enable GPU access in containers for hardware-accelerated workloads: CUDA/OpenCL computing, GPU-based signal processing, machine learning inference, and GUI rendering.

{{< callout emoji="🔍" >}}
**Auto-detection**: RF Swift automatically detects your GPU vendor (NVIDIA, AMD, or Intel) and configures the container accordingly. Just use `--gpus all` — RF Swift handles the rest.
{{< /callout >}}

## How It Works

When you use `--gpus all` or select "GPU passthrough" in the wizard, RF Swift:

1. **Scans** `/sys/class/drm/card*/device/vendor` and vendor-specific device nodes
2. **Detects** the GPU vendor(s) present on the host
3. **Configures** the container automatically:

| Detected GPU | What RF Swift does |
|---|---|
| **NVIDIA** (vendor 0x10de) | Adds Docker DeviceRequests with `nvidia` driver (requires nvidia-container-toolkit) |
| **AMD** (vendor 0x1002) | Adds `/dev/kfd` + `/dev/dri` device bindings and cgroup rule `c 226:* rwm` |
| **Intel** (vendor 0x8086) | Adds `/dev/dri` device binding and cgroup rule `c 226:* rwm` |
| **Multiple GPUs** | Configures all detected vendors |

---

## Synopsis

```bash
# Create container with GPU (auto-detects vendor)
rfswift run -i IMAGE -n NAME --gpus all

# Add GPU to existing container
rfswift gpus add -c CONTAINER [-g SPECIFIER]

# Remove GPU from existing container
rfswift gpus rm -c CONTAINER
```

The interactive wizard also offers "GPU passthrough" as a feature toggle.

---

## Prerequisites

You need the GPU drivers and runtime installed on the **host** — not inside the container.

### NVIDIA GPUs

1. **Install NVIDIA drivers** on the host:
   ```bash
   # Check if already installed
   nvidia-smi
   ```

2. **Install NVIDIA Container Toolkit:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
     sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit

   # Fedora/RHEL
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
     sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
   sudo dnf install -y nvidia-container-toolkit
   ```

3. **Configure the runtime:**
   ```bash
   # For Docker
   sudo nvidia-ctk runtime configure --runtime=docker
   sudo systemctl restart docker

   # For Podman
   sudo nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
   nvidia-ctk cdi list  # verify
   ```

4. **Verify:**
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
   ```

### NVIDIA Examples

```bash
# Verify inside container
rfswift exec -c gpu_sdr -e "nvidia-smi"

# Specific GPU in multi-GPU system (NVIDIA only)
rfswift run -i penthertz/rfswift_noble:sdr_full -n sdr_gpu --gpus 0
rfswift run -i penthertz/rfswift_noble:sdr_full -n ml_gpu --gpus 1

# CUDA / PyTorch verification
rfswift exec -c gpu_sdr
python3 -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0)}')"
```

---

## AMD GPUs (ROCm)

When RF Swift detects an AMD GPU (vendor `0x1002` or `/dev/kfd`), `--gpus all` automatically adds `/dev/kfd`, `/dev/dri`, and the cgroup rule `c 226:* rwm`.

### Prerequisites

1. **Install ROCm on the host:**
   ```bash
   # Ubuntu 22.04/24.04
   sudo apt-get update
   wget https://repo.radeon.com/amdgpu-install/latest/ubuntu/jammy/amdgpu-install_6.0.60000-1_all.deb
   sudo apt-get install ./amdgpu-install_6.0.60000-1_all.deb
   sudo amdgpu-install --usecase=rocm

   # Verify
   rocm-smi
   ```

2. **Add your user to the `render` and `video` groups:**
   ```bash
   sudo usermod -aG render,video $USER
   # Log out and back in
   ```

3. **Verify device nodes exist:**
   ```bash
   ls -l /dev/kfd /dev/dri/render*
   # /dev/kfd          - Kernel Fusion Driver (compute)
   # /dev/dri/renderD* - DRM render nodes (per-GPU)
   ```

### Usage

With auto-detection, just use `--gpus all` — RF Swift handles the rest:

```bash
# Create container (auto-detects AMD and adds /dev/kfd + /dev/dri + cgroup)
rfswift run -i penthertz/rfswift_noble:sdr_full -n rocm_sdr --gpus all

# Add GPU to existing container
rfswift gpus add -c sdr_work

# Verify inside container
rfswift exec -c rocm_sdr
rocm-smi                          # List GPUs
rocminfo                          # Detailed GPU info
clinfo                            # OpenCL info
```

RF Swift adds the following automatically:

| What | Value | Purpose |
|------|-------|---------|
| Device | `/dev/kfd` | Kernel Fusion Driver — ROCm compute interface |
| Device | `/dev/dri` | Direct Rendering Infrastructure — GPU render nodes |
| Cgroup rule | `c 226:* rwm` | Allow access to DRI device nodes |

You can also configure manually if needed:
```bash
rfswift bindings add -d -c sdr_work -s /dev/kfd -t /dev/kfd
rfswift bindings add -d -c sdr_work -s /dev/dri -t /dev/dri
rfswift cgroups add -c sdr_work -r "c 226:* rwm"
```

### ROCm with PyTorch

```bash
rfswift exec -c rocm_sdr
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0
python3 -c "import torch; print(f'HIP available: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0)}')"
```

### Specific GPU Selection

On multi-GPU AMD systems, control which GPUs are visible:

```bash
# Inside the container, use HIP_VISIBLE_DEVICES
rfswift exec -c rocm_sdr
export HIP_VISIBLE_DEVICES=0       # First GPU only
export HIP_VISIBLE_DEVICES=0,1     # First two GPUs
rocm-smi                           # Shows only selected GPUs
```

Or expose only specific render nodes:

```bash
# Only first GPU
rfswift run -i penthertz/rfswift_noble:sdr_full -n rocm_gpu0 \
  -s /dev/kfd:/dev/kfd,/dev/dri/renderD128:/dev/dri/renderD128 \
  -g "c 226:* rwm"
```

### Profile for ROCm

```yaml
name: rocm-sdr
description: SDR with AMD GPU (ROCm)
image: penthertz/rfswift_noble:sdr_full
gpus: all
```

---

## Intel GPUs

When RF Swift detects an Intel GPU (vendor `0x8086`), `--gpus all` automatically adds `/dev/dri` and the cgroup rule `c 226:* rwm`. Supports integrated (UHD, Iris) and discrete (Arc) GPUs for OpenCL and oneAPI workloads.

### Prerequisites

1. **Install Intel compute drivers:**
   ```bash
   # Ubuntu
   sudo apt-get install -y intel-opencl-icd intel-level-zero-gpu level-zero \
     intel-media-va-driver-non-free libmfx1 libvpl2

   # For Intel Arc (discrete GPU), also install:
   sudo apt-get install -y intel-gpu-tools
   ```

2. **Add your user to the `render` group:**
   ```bash
   sudo usermod -aG render $USER
   ```

3. **Verify:**
   ```bash
   ls -l /dev/dri/render*
   clinfo | grep "Device Name"
   ```

### Usage

```bash
# Create container (auto-detects Intel and adds /dev/dri + cgroup)
rfswift run -i penthertz/rfswift_noble:sdr_full -n intel_sdr --gpus all

# Add GPU to existing container
rfswift gpus add -c sdr_work

# Verify inside container
rfswift exec -c intel_sdr
clinfo | grep "Device Name"       # OpenCL devices
vainfo                             # Video acceleration info
intel_gpu_top                      # GPU utilization (if intel-gpu-tools installed)
```

Manual setup if needed:
```bash
rfswift bindings add -d -c sdr_work -s /dev/dri -t /dev/dri
rfswift cgroups add -c sdr_work -r "c 226:* rwm"
```

### Intel with oneAPI

```bash
rfswift exec -c intel_sdr
pip3 install intel-extension-for-pytorch
python3 -c "import intel_extension_for_pytorch as ipex; print('Intel GPU available')"
```

### Profile for Intel GPU

```yaml
name: intel-sdr
description: SDR with Intel GPU
image: penthertz/rfswift_noble:sdr_full
gpus: all
```

---

## Quick Comparison

All three vendors use the same `--gpus all` flag — RF Swift auto-detects and configures accordingly:

| | NVIDIA | AMD (ROCm) | Intel |
|--|--------|-----------|-------|
| **RF Swift flag** | `--gpus all` | `--gpus all` | `--gpus all` |
| **What RF Swift adds** | DeviceRequests (nvidia driver) | `/dev/kfd` + `/dev/dri` + cgroup | `/dev/dri` + cgroup |
| **Host requirement** | nvidia-container-toolkit | ROCm drivers | Intel compute drivers |
| **Compute API** | CUDA, OpenCL | ROCm HIP, OpenCL | oneAPI, OpenCL |
| **ML framework** | PyTorch, TensorFlow | PyTorch (ROCm) | PyTorch (IPEX) |
| **Specific GPU select** | `--gpus 0,1` | `HIP_VISIBLE_DEVICES=0,1` (env var) | Expose specific renderD* |

---

## Engine Compatibility

| Engine | NVIDIA | AMD/Intel |
|--------|--------|-----------|
| **Docker (Linux)** | Full (`--gpus`) | Full (devices + cgroups) |
| **Podman (Linux)** | Supported (CDI) | Full (devices + cgroups) |
| **macOS (any engine)** | Not supported | Not supported |
| **Windows (WSL2)** | Not supported | Not supported |

GPU passthrough requires a **Linux host** with direct access to the GPU hardware. On macOS and Windows, all container engines run inside a VM without GPU access.

### Podman with NVIDIA

RF Swift automatically translates `--gpus all` to Podman's CDI syntax (`--device nvidia.com/gpu=all`). Setup:

```bash
sudo apt-get install nvidia-container-toolkit
sudo nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
nvidia-ctk cdi list  # verify
```

### Podman with AMD/Intel

Works the same as Docker — device bindings and cgroup rules are standard Linux features:

```bash
rfswift --engine podman run -i penthertz/rfswift_noble:sdr_full -n rocm_sdr \
  -s /dev/kfd:/dev/kfd,/dev/dri:/dev/dri \
  -g "c 226:* rwm"
```

---

## Troubleshooting

### NVIDIA: "could not select device driver"

**Problem:** `Error: could not select device driver "nvidia" with capabilities: [[gpu]]`

**Solution:** NVIDIA Container Toolkit is not installed or not configured:
```bash
sudo apt-get install nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Verify
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

### AMD: "Permission denied" on /dev/kfd

**Problem:** ROCm commands fail with permission errors

**Solution:**
```bash
# Check device permissions
ls -l /dev/kfd /dev/dri/render*

# Ensure cgroup rule is set
rfswift cgroups add -c container -r "c 226:* rwm"

# Check user groups on host
groups  # should include render, video

# May need to run container as root or match GIDs
```

### AMD: "No GPU agent found"

**Problem:** `rocminfo` shows no GPU agents

**Solution:**
```bash
# Verify devices are bound into container
rfswift exec -c container -e "ls -l /dev/kfd /dev/dri/"

# If missing, add bindings
rfswift bindings add -d -c container -s /dev/kfd -t /dev/kfd
rfswift bindings add -d -c container -s /dev/dri -t /dev/dri

# Verify ROCm works on host first
rocm-smi
```

### Intel: "No OpenCL devices found"

**Problem:** `clinfo` shows no devices

**Solution:**
```bash
# Check DRI is bound
rfswift exec -c container -e "ls -l /dev/dri/"

# If missing
rfswift bindings add -d -c container -s /dev/dri -t /dev/dri
rfswift cgroups add -c container -r "c 226:* rwm"

# Install OpenCL ICD inside container if needed
apt-get install -y intel-opencl-icd
```

### GPU Works in Docker But Not RF Swift

```bash
# Check container config
rfswift properties -c container | grep -i gpu

# Add GPU (auto-detects vendor)
rfswift gpus add -c container
```

---

## Related Commands

- [`cgroups`](/docs/commands/cgroups) - Device access rules
- [`bindings`](/docs/commands/bindings) - Device bindings
- [`capabilities`](/docs/commands/capabilities) - Linux capabilities
- [`run`](/docs/commands/run) - Create containers with `--gpus` flag
- [`realtime`](/docs/commands/realtime) - Realtime mode for SDR performance

---

{{< callout emoji="🎮" >}}
**Quick Start (any GPU)**: `rfswift run -n my_gpu -i penthertz/rfswift_noble:sdr_full --gpus all` — RF Swift auto-detects NVIDIA, AMD, or Intel and configures the container accordingly.
{{< /callout >}}

{{< callout type="warning" >}}
**Linux Only**: GPU passthrough requires a Linux host with direct hardware access. macOS and Windows container engines run inside VMs without GPU support.
{{< /callout >}}

{{< callout type="info" >}}
**Profiles**: `gpus: all` in a profile YAML works for any GPU vendor — the auto-detection runs at container creation time.
{{< /callout >}}
