---
title: 🚀 Quick Start
weight: 2
next: /docs/guide
prev: /docs/getting-started
cascade:
  type: docs
---

# Getting Up and Running with RF Swift

This guide will help you quickly get started with RF Swift using pre-built binaries and container images.

{{< callout type="warning" >}}
**On Linux**, unless you are using Docker Desktop, you may need to use `sudo` with the `rfswift` command for operations that require elevated privileges.
{{< /callout >}}

To install RF Swift, you can either use pre-compiled binaries and existing container images (quickest method) or compile the Go project and/or Docker images from source. This guide focuses on the fastest way to get up and running.

{{% steps %}}

### Install RF Swift

#### Linux and macOS

The easiest way to install RF Swift on Linux or macOS is to use the installation script:

```bash
# Clone the repository
git clone https://github.com/PentHertz/RF-Swift.git
cd RF-Swift

# Run the installation script
./install.sh
```

The `install.sh` script will:
- Install all required dependencies (Docker, BuildX, Go)
- Configure necessary services (xhost, PulseAudio)
- Set up proper permissions
- Create a system-wide alias for the `rfswift` command
- Install the latest RF Swift binary

#### Windows or Manual Installation

If you prefer manual installation or are using Windows:

1. Download the latest binary from [the official repository ↗](https://github.com/PentHertz/RF-Swift/releases)
2. Rename the binary to `rfswift` (or `rfswift.exe` on Windows)
3. Make the binary executable (on Linux/macOS): `chmod +x rfswift`

When you run the binary for the first time, it will guide you through configuration:

```bash
rfswift 
Config file not found. Would you like to create one with default values? (y/n)
```

Select `y` to create a default configuration file or `n` to configure manually.

### Pull a Pre-built Image

RF Swift provides several pre-built images to get you started quickly. For example, let's pull a complete SDR image:

```bash
rfswift images pull -i sdr_full
```

You can also specify a custom tag for the image:

```bash
rfswift images pull -i sdr_full -t my_custom_tag
```

**Available Options:**
- `-i`: Remote image label (required)
- `-t`: Local tag to assign to the pulled image (optional)
- `-r`: Repository to pull from (defaults to penthertz/rfswift)

{{< callout type="info" >}}
You can use the complete image tag `penthertz/rfswift:sdr_full` if you prefer, or change the default repository in your RF Swift profile.
{{< /callout >}}

### Run the Container

Once you have an image, you can create and run a container:

```bash
rfswift run -i sdr_full -n my_sdr_container
```

This will start a container using the `sdr_full` image with the name `my_sdr_container`.

**Run Command Options:**

```bash
rfswift run -i sdr_full -n my_sdr_container
```

The `run` command has numerous options for configuring your container environment:

| Flag | Description |
|------|-------------|
| `-i, --image string` | Image name/tag to use (default: 'myrfswift:latest') |
| `-n, --name string` | Name for the container (makes it easier to reference later) |
| `-b, --bind string` | Extra bind mounts, separated by commas (e.g., `/host/path:/container/path,/another/path:/in/container`) |
| `-s, --devices string` | Extra device mappings in unprivileged mode, separated by commas (e.g., `/dev/ttyUSB0:/dev/ttyUSB0`) |
| `-a, --capabilities string` | Extra Linux capabilities, separated by commas (e.g., `NET_ADMIN,SYS_ADMIN`) |
| `-t, --network string` | Network mode (default: 'host') |
| `-u, --privileged int` | Set privilege level (1: privileged, 0: unprivileged) |
| `-e, --command string` | Command to execute (default: '/bin/bash') |
| `-d, --display string` | Set X Display (duplicates host's env by default) (default "DISPLAY=:0") |
| `-p, --pulseserver string` | PulseAudio server TCP address (default: "tcp:127.0.0.1:34567") |
| `-w, --bindedports string` | Ports to bind (between container and host) |
| `-z, --exposedports string` | Ports to expose |
| `-x, --extrahosts string` | Set extra hosts (default: 'pluto.local:192.168.1.2'), separated by commas |
| `-g, --cgroups string` | Extra cgroup rules, separated by commas |
| `-m, --seccomp string` | Set Seccomp profile (default: 'default') |

**Share Files with the Container:**

To share files between your host system and the container:

```bash
rfswift run -i sdr_full -n my_sdr_container -b ~/sdr_projects:/home/user/projects
```

You can bind multiple directories by separating them with commas:

```bash
rfswift run -i sdr_full -n my_sdr_container -b ~/sdr_projects:/home/user/projects,~/datasets:/home/user/data
```

**Share Specific Devices:**

When running in unprivileged mode, you can share specific devices:

```bash
rfswift run -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0
```

Multiple devices can be shared by separating them with commas:

```bash
rfswift run -i sdr_full -n my_sdr_container -s /dev/ttyUSB0:/dev/ttyUSB0,/dev/ttyACM0:/dev/ttyACM0
```

**Add Linux Capabilities:**

For Wi-Fi and Bluetooth tools, you may need additional Linux capabilities:

```bash
rfswift run -i wifi_tools -n my_wifi_container -a NET_ADMIN
```

For multiple capabilities:

```bash
rfswift run -i advanced_tools -n my_container -a NET_ADMIN,SYS_ADMIN
```

{{< callout type="warning" >}}
**Security Consideration:** Be cautious when adding capabilities like `NET_ADMIN`. If the container becomes compromised, malicious programs could capture or manipulate network interfaces! Only add capabilities that are strictly necessary for your work.
{{< /callout >}}

**Network Configuration:**

By default, containers use the host network mode. To use a different network:

```bash
rfswift run -i sdr_full -n my_sdr_container -t bridge
```

**Privilege Levels:**

Control container privilege level:

```bash
# Run in unprivileged mode
rfswift run -i sdr_full -n my_sdr_container -u 0

# Run in privileged mode (use with caution)
rfswift run -i sdr_full -n my_sdr_container -u 1
```

**Custom Commands:**

Run a specific command instead of the default shell:

```bash
rfswift run -i gnuradio -n signal_processor -e "gnuradio-companion"
```

{{< callout type="info" >}}
Using a named container with the `-n` flag makes it much easier to restart or access the container later.
{{< /callout >}}

### Use RF Tools in the Container

Once the container is running, you can use any of the pre-installed RF tools. For example, to run SDR++:

1. Connect your SDR device to your computer
2. Inside the container, run: `sdrpp`

{{< callout type="warning" >}}
If you encounter audio issues, you can enable audio forwarding with: `rfswift host audio enable`
This requires `pulseaudio` to be properly configured on your host system.
{{< /callout >}}

### USB Device Management

USB device handling varies by platform:

#### Windows USB Forwarding

On Windows, you'll need to explicitly forward USB devices to your container using the `winusb` commands in Administrator mode:

```bash
# List available USB devices on Windows
rfswift winusb list

# Attach a specific device on Windows
rfswift winusb attach -b <USB ID>
```

#### Linux USB Device Access

On Linux, you can access USB devices in two ways:

1. **During container creation** - use the `-s` option to bind specific devices:
   ```bash
   rfswift run -i sdr_full -n my_container -s /dev/ttyUSB0:/dev/ttyUSB0
   ```

2. **After container creation** - use the powerful `bindings` feature to add devices to an existing container:
   ```bash
   # Add a new USB device to an existing container
   rfswift bindings add -c my_container -d -s /dev/ttyUSB0 -t /dev/ttyUSB0*

   # Same but shorter: Add a new USB device to an existing container with some destination
   rfswift bindings add -c my_container -t /dev/ttyUSB0
   
   # Add a new volume to an existing container
   rfswift bindings add -c my_container -s /home/user/data -t /root/data
   
   # Remove a binding
   rfswift bindings rm -c my_container -s /dev/ttyUSB0
   ```

Note that to rebind a device, you need the `-d` switch.

{{% /steps %}}

## Managing Existing Containers

### Restart an Existing Container

To return to a previously created container:

```bash
rfswift exec -c my_sdr_container
```

You can also use the short command if you want to recall the last container:

```bash
rfswift exec
```

This restarts the container if it's stopped and gives you a shell inside it.

### List Running Containers

View all RF Swift containers:

```bash
rfswift last
```

### Save Container State

If you've made changes to a container that you want to preserve:

```bash
rfswift commit -c my_sdr_container -i my_custom_image
```

This saves the current state of the container as a new image.

## Creating an Alias (Linux/macOS)

For convenience, you can create an alias to run RF Swift from anywhere. If you didn't use the `install.sh` script (which creates this automatically), you can add an alias manually:

```bash
echo "alias rfswift='$(pwd)/rfswift'" >> "$HOME/.$(basename $SHELL)rc"
source "$HOME/.$(basename $SHELL)rc"
```

Replace `$(pwd)/rfswift` with the full path to your RF Swift binary.

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `rfswift run -i IMAGE -n NAME` | Create and run a new container |
| `rfswift exec -c CONTAINER` | Enter an existing container |
| `rfswift images local` | List available local images |
| `rfswift last` | List all containers |
| `rfswift host audio enable` | Enable audio forwarding |
| `rfswift host video enable` | Enable video forwarding |

## Next Steps

Dive right into the following section to learn more:

{{< cards >}}
  {{< card link="/docs/guide" title="Follow the Guide" icon="document-text" subtitle="Read the complete guide and learn how to use RF Swift for your daily assessments." >}}
{{< /cards >}}