---
title: "rfswift config gpus"
linkTitle: "config gpus"
navGroup: "Runtime configuration"
level: reference
description: "Give an existing container access to GPUs."
weight: 44
---

GPU access lets tools inside a container use your graphics card: CUDA or OpenCL computing, GPU-based signal processing, machine-learning inference, and faster rendering. You can request it when you create a container (`--gpus`), or add it later with `rfswift config gpus`.

The most common use creates a container with every GPU available:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n my_gpu --gpus all
```

RF Swift detects whether your GPU is NVIDIA, AMD or Intel and sets up the container for it. GPU passthrough needs a Linux host.

{{< callout type="info" title="What happens when you apply a change" >}}
Adding or removing a GPU on an existing container restarts it, so save your work first. On Linux with Docker, the change is applied in place after one `sudo` prompt. On Podman, the container is committed and created again; add `--recreate` to use that method on Docker too. The shorter spelling `rfswift gpus` also works. See [config](/docs/commands/config).
{{< /callout >}}

## Synopsis

Create a container with a GPU (the vendor is detected):

```bash
rfswift container create -i IMAGE -n NAME --gpus all
```

Add a GPU to an existing container, or remove it:

```bash
rfswift config gpus add -c CONTAINER [-g SPECIFIER]
rfswift config gpus rm  -c CONTAINER
```

The interactive wizard also has a "GPU passthrough" switch.

## How it works

When you use `--gpus all`, or turn on "GPU passthrough" in the wizard, RF Swift:

1. Reads `/sys/class/drm/card*/device/vendor` and the vendor-specific device files.
2. Works out which GPU vendors are present.
3. Sets up the container for each of them:

| Detected GPU | What RF Swift does |
|---|---|
| **NVIDIA** (vendor 0x10de) | Adds a Docker DeviceRequest with the `nvidia` driver (needs nvidia-container-toolkit) |
| **AMD** (vendor 0x1002) | Adds the `/dev/kfd` and `/dev/dri` devices and the cgroup rule `c 226:* rwm` |
| **Intel** (vendor 0x8086) | Adds the `/dev/dri` device and the cgroup rule `c 226:* rwm` |
| **Several GPUs** | Sets up every vendor it found |

## Before you start

The GPU drivers and runtime go on the **host**, not inside the container.

## NVIDIA GPUs

### Prerequisites

1. Check that the NVIDIA drivers are installed on the host:

   ```bash
   nvidia-smi
   ```

2. Install the NVIDIA Container Toolkit.

   On Ubuntu or Debian:

   ```bash
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
     sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   ```

   On Fedora or RHEL:

   ```bash
   curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
     sudo tee /etc/yum.repos.d/nvidia-container-toolkit.repo
   sudo dnf install -y nvidia-container-toolkit
   ```

3. Configure the runtime.

   For Docker:

   ```bash
   sudo nvidia-ctk runtime configure --runtime=docker
   sudo systemctl restart docker
   ```

   For Podman:

   ```bash
   sudo nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
   nvidia-ctk cdi list  # verify
   ```

4. Check that a container can see the GPU:

   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
   ```

### Examples

Check the GPU from inside a container:

```bash
rfswift container shell -c gpu_sdr -e "nvidia-smi"
```

On a machine with several NVIDIA GPUs, give each container a specific one:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n sdr_gpu --gpus 0
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n ml_gpu --gpus 1
```

Check that CUDA works from PyTorch:

```bash
rfswift container shell -c gpu_sdr
python3 -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0)}')"
```

## AMD GPUs (ROCm)

When RF Swift detects an AMD GPU (vendor `0x1002`, or `/dev/kfd` is present), `--gpus all` adds `/dev/kfd`, `/dev/dri` and the cgroup rule `c 226:* rwm`.

### Prerequisites

1. Install ROCm on the host (Ubuntu 22.04 or 24.04), then check it:

   ```bash
   sudo apt-get update
   wget https://repo.radeon.com/amdgpu-install/latest/ubuntu/jammy/amdgpu-install_6.0.60000-1_all.deb
   sudo apt-get install ./amdgpu-install_6.0.60000-1_all.deb
   sudo amdgpu-install --usecase=rocm

   rocm-smi
   ```

2. Add your user to the `render` and `video` groups, then log out and back in:

   ```bash
   sudo usermod -aG render,video $USER
   ```

3. Check that the device files exist. `/dev/kfd` is the compute interface; each `/dev/dri/renderD*` is one GPU:

   ```bash
   ls -l /dev/kfd /dev/dri/render*
   ```

### Usage

Create a container with the GPU, or add it to an existing one:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n rocm_sdr --gpus all
rfswift config gpus add -c sdr_work
```

Check the GPU from inside the container:

```bash
rfswift container shell -c rocm_sdr
rocm-smi                          # List GPUs
rocminfo                          # Detailed GPU info
clinfo                            # OpenCL info
```

RF Swift adds these for you:

| What | Value | Purpose |
|------|-------|---------|
| Device | `/dev/kfd` | Kernel Fusion Driver, the ROCm compute interface |
| Device | `/dev/dri` | Direct Rendering Infrastructure, the GPU render nodes |
| Cgroup rule | `c 226:* rwm` | Access to the DRI device files |

You can also add them by hand:

```bash
rfswift config bindings add -d -c sdr_work -s /dev/kfd -t /dev/kfd
rfswift config bindings add -d -c sdr_work -s /dev/dri -t /dev/dri
rfswift config cgroups add -c sdr_work -r "c 226:* rwm"
```

### ROCm with PyTorch

Install the ROCm build of PyTorch inside the container, then check the GPU:

```bash
rfswift container shell -c rocm_sdr
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0
python3 -c "import torch; print(f'HIP available: {torch.cuda.is_available()}, Device: {torch.cuda.get_device_name(0)}')"
```

### Choosing specific GPUs

On a machine with several AMD GPUs, choose which ones tools see with `HIP_VISIBLE_DEVICES` inside the container:

```bash
rfswift container shell -c rocm_sdr
export HIP_VISIBLE_DEVICES=0       # First GPU only
export HIP_VISIBLE_DEVICES=0,1     # First two GPUs
rocm-smi                           # Shows only selected GPUs
```

Or give the container only one GPU's render node:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n rocm_gpu0 \
  -s /dev/kfd:/dev/kfd,/dev/dri/renderD128:/dev/dri/renderD128 \
  -g "c 226:* rwm"
```

### A profile for ROCm

```yaml
name: rocm-sdr
description: SDR with AMD GPU (ROCm)
image: penthertz/rfswift_resolute:sdr_full
gpus: all
```

## Intel GPUs

When RF Swift detects an Intel GPU (vendor `0x8086`), `--gpus all` adds `/dev/dri` and the cgroup rule `c 226:* rwm`. This covers integrated GPUs (UHD, Iris) and discrete ones (Arc), for OpenCL and oneAPI.

### Prerequisites

1. Install the Intel compute drivers on the host (Ubuntu):

   ```bash
   sudo apt-get install -y intel-opencl-icd intel-level-zero-gpu level-zero \
     intel-media-va-driver-non-free libmfx1 libvpl2
   ```

   For an Intel Arc card, also install:

   ```bash
   sudo apt-get install -y intel-gpu-tools
   ```

2. Add your user to the `render` group:

   ```bash
   sudo usermod -aG render $USER
   ```

3. Check the GPU:

   ```bash
   ls -l /dev/dri/render*
   clinfo | grep "Device Name"
   ```

### Usage

Create a container with the GPU, or add it to an existing one:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n intel_sdr --gpus all
rfswift config gpus add -c sdr_work
```

Check the GPU from inside the container:

```bash
rfswift container shell -c intel_sdr
clinfo | grep "Device Name"       # OpenCL devices
vainfo                             # Video acceleration info
intel_gpu_top                      # GPU utilization (if intel-gpu-tools installed)
```

To add it by hand:

```bash
rfswift config bindings add -d -c sdr_work -s /dev/dri -t /dev/dri
rfswift config cgroups add -c sdr_work -r "c 226:* rwm"
```

### Intel with oneAPI

```bash
rfswift container shell -c intel_sdr
pip3 install intel-extension-for-pytorch
python3 -c "import intel_extension_for_pytorch as ipex; print('Intel GPU available')"
```

### A profile for Intel GPUs

```yaml
name: intel-sdr
description: SDR with Intel GPU
image: penthertz/rfswift_resolute:sdr_full
gpus: all
```

{{< callout type="info" title="Profiles work with any GPU" >}}
`gpus: all` in a profile works for every vendor, because detection runs when the container is created.
{{< /callout >}}

## Comparison

All three vendors use the same `--gpus all` flag:

| | NVIDIA | AMD (ROCm) | Intel |
|--|--------|-----------|-------|
| **RF Swift flag** | `--gpus all` | `--gpus all` | `--gpus all` |
| **What RF Swift adds** | DeviceRequests (nvidia driver) | `/dev/kfd` + `/dev/dri` + cgroup | `/dev/dri` + cgroup |
| **Host requirement** | nvidia-container-toolkit | ROCm drivers | Intel compute drivers |
| **Compute API** | CUDA, OpenCL | ROCm HIP, OpenCL | oneAPI, OpenCL |
| **ML framework** | PyTorch, TensorFlow | PyTorch (ROCm) | PyTorch (IPEX) |
| **Choosing a GPU** | `--gpus 0,1` | `HIP_VISIBLE_DEVICES=0,1` (environment variable) | Give specific `renderD*` nodes |

## Engine compatibility

| Engine | NVIDIA | AMD/Intel |
|--------|--------|-----------|
| **Docker (Linux)** | Full (`--gpus`) | Full (devices + cgroups) |
| **Podman (Linux)** | Supported (CDI) | Full (devices + cgroups) |
| **macOS (any engine)** | Not supported | Not supported |
| **Windows (WSL2)** | Not supported | Not supported |

`--gpus` passthrough needs a **Linux host** with direct access to the GPU. On macOS and Windows, container engines run inside a virtual machine without GPU access.

{{< callout type="info" title="On a Mac with Apple Silicon" >}}
`--gpus` does not apply, but the global `--gpu` flag starts a separate Lima VM (krunkit, macOS 14 or later) that gives containers Vulkan compute. That VM has no USB passthrough. See [engine](/docs/commands/engine/) and [Known limits](/docs/guide/limitations/).
{{< /callout >}}

### Podman with NVIDIA

RF Swift translates `--gpus all` into Podman's CDI syntax (`--device nvidia.com/gpu=all`). Set it up once:

```bash
sudo apt-get install nvidia-container-toolkit
sudo nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
nvidia-ctk cdi list  # verify
```

### Podman with AMD or Intel

This works as with Docker, because device bindings and cgroup rules are standard Linux features:

```bash
rfswift --engine podman container create -i penthertz/rfswift_resolute:sdr_full -n rocm_sdr \
  -s /dev/kfd:/dev/kfd,/dev/dri:/dev/dri \
  -g "c 226:* rwm"
```

## Troubleshooting

### NVIDIA: “could not select device driver”

The full error is `Error: could not select device driver "nvidia" with capabilities: [[gpu]]`. The NVIDIA Container Toolkit is missing or not configured. Install and configure it, then check:

```bash
sudo apt-get install nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

### AMD: “permission denied” on /dev/kfd

ROCm commands fail with permission errors. Check the device permissions, make sure the cgroup rule is set, and check your groups on the host (they should include `render` and `video`):

```bash
ls -l /dev/kfd /dev/dri/render*
rfswift config cgroups add -c container -r "c 226:* rwm"
groups
```

If it still fails, you may need to run the container as root or match the group IDs.

### AMD: “no GPU agent found”

`rocminfo` shows no GPU. Check that the devices are in the container, add them if they are missing, and make sure ROCm works on the host first:

```bash
rfswift container shell -c container -e "ls -l /dev/kfd /dev/dri/"

rfswift config bindings add -d -c container -s /dev/kfd -t /dev/kfd
rfswift config bindings add -d -c container -s /dev/dri -t /dev/dri

rocm-smi
```

### Intel: “no OpenCL devices found”

`clinfo` shows no device. Check that `/dev/dri` is in the container, and add it with its rule if missing:

```bash
rfswift container shell -c container -e "ls -l /dev/dri/"

rfswift config bindings add -d -c container -s /dev/dri -t /dev/dri
rfswift config cgroups add -c container -r "c 226:* rwm"
```

If needed, install the OpenCL driver inside the container:

```bash
apt-get install -y intel-opencl-icd
```

### The GPU works with Docker but not in an RF Swift container

Check the GPU request Docker recorded for the container, then add the GPU with RF Swift (the vendor is detected):

```bash
docker inspect container --format '{{json .HostConfig.DeviceRequests}}'
rfswift config gpus add -c container
```

## Related commands

- [`cgroups`](/docs/commands/cgroups): device access rules
- [`bindings`](/docs/commands/bindings): devices and folders
- [`capabilities`](/docs/commands/capabilities): Linux capabilities
- [`run`](/docs/commands/run): create containers with `--gpus`
- [`realtime`](/docs/commands/realtime): realtime mode for SDR performance
