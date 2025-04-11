---
title: Running RF Swift
weight: 1
next: /docs/guide/list-of-images/
prev: /docs/quick-start
cascade:
  type: docs
---

# Running RF Swift

RF Swift provides a streamlined command-line interface to manage containers for RF and hardware security applications. This guide covers essential commands and workflows.

{{< callout type="warning" >}}
**On Linux**, unless you are using Docker Desktop, you will need to use `sudo` with the `rfswift` command for operations that require elevated privileges.
{{< /callout >}}

## Command Overview

Let's explore the available commands with `rfswift --help`:

```bash
rfswift --help
[...]                                                                                                                                              


  888~-_   888~~        ,d88~~\                ,e,   88~\   d8   
  888   \  888___       8888    Y88b    e    /  "  _888__ _d88__ 
  888    | 888          'Y88b    Y88b  d8b  /  888  888    888   
  888   /  888           'Y88b,   Y888/Y88b/   888  888    888   
  888_-~   888             8888    Y8/  Y8/    888  888    888   
  888 ~-_  888          \__88P'     Y    Y     888  888    "88_/       

                RF toolbox for HAMs and professionals                                                                             

rfswift is THE toolbox for any HAM & radiocommunications and hardware professionals

Usage:
  rfswift [flags]
  rfswift [command]

Available Commands:
  bindings    Manage devices and volumes bindings
  commit      Commit a container
  completion  Generate the autocompletion script for the specified shell
  delete      Delete an rfswift images
  exec        Exec a command
  help        Help about any command
  host        Host configuration
  images      RF Swift images management remote/local
  install     Install function script
  last        Last container run
  remove      Remove a container
  rename      Rename a container
  retag       Rename an image
  run         Create and run a program
  stop        Stop a container
  update      Update RF Swift

Flags:
  -q, --disconnect   Don't query updates (disconnected mode)
  -h, --help         help for rfswift

Use "rfswift [command] --help" for more information about a command.
```

{{< callout type="info" >}}
**Privilege requirements by platform:**
- **Linux**: `sudo` is required for most container operations when not using Docker Desktop
- **Windows/macOS**: With Docker Desktop or OrbStack, `sudo` is not necessary
- **Windows**: Commands related to USB binding require Administrator privileges
{{< /callout >}}

## Core Workflows

### 1. Keeping RF Swift Updated

RF Swift automatically checks for updates when launched:

```bash
[!] You are running version: 0.4.8 (Obsolete)
[+] Do you want to update to the latest version? (yes/no): 
```

You can also trigger updates manually:

```bash
rfswift update

[!] Your current version (0.4.8) is obsolete. Please update to version (v0.6.0).
[+] Do you want to update to the latest version? (yes/no): yes
Latest release download URL: https://github.com/PentHertz/RF-Swift/releases/download/v0.6.0/rfswift_linux_amd64
[+] Do you want to replace the existing binary with this new release? (yes/no): yes
13.67 MiB / 13.67 MiB [---------------------------------------------------------------------------------------------------------------------------------------------------------------------------] 100.00%%
File downloaded and replaced successfully.
```

### 2. Image Management

#### Customizing Image Tags

You can rename image tags for convenience or to match your default configuration:

```bash
rfswift retag -i penthertz/rfswiftdev:sdr_full_amd64 -t myrfswift:latest
[+] You are running version: 0.4.9 (Up to date)
[+] Image renamed!
```

This allows you to use the default tag in your configuration file:

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
```bash
cat /home/username/.config/rfswift/config.ini
[general]
imagename = myrfswift:latest
...
```
  {{< /tab >}}
  {{< tab >}}
```powershell
type C:\Users\username\AppData\Roaming\rfswift\config.ini
[general]
imagename = myrfswift:latest
...
```
  {{< /tab >}}
  {{< tab >}}
```bash
cat /Users/username/.config/rfswift/config.ini
[general]
imagename = myrfswift:latest
...
```
  {{< /tab >}}
{{< /tabs >}}

With the default tag set, you can simplify the `run` command:

```bash
rfswift run -n my_container  # Equivalent to: rfswift run -i myrfswift:latest -n my_container
```

{{< callout type="info" >}}
Changing an image's tag makes it a "custom" image in RF Swift, which means it won't receive automatic updates from the official registry.
{{< /callout >}}

### 3. Container Management

#### Creating and Running Containers

Create a new container from an image:

```bash
rfswift run -i sdr_full -n my_sdr_container
```

#### Container Listing and Selection

If you forget container names, use the `last` command:

```bash
rfswift last
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ℹ️  Up-to-date                                                                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ You are running the latest version: 0.6.0-dev                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
  🤖 Last Run Containers                                                                                                                   
┌───────────────────────────┬─────────────────────────────┬───────────────────────────────────────────────────────┬──────────────┬──────────┐
│ Created                   │ Image Tag (ID)              │ Container Name                                        │ Container ID │ Command  │
├───────────────────────────┼─────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┼──────────┤
│ 2025-04-11T16:47:02+02:00 │ penthertz/rfswift:hardware  │ hardware                                              │ b6e43a87e1f6 │ /bin/zsh │
├───────────────────────────┼─────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┼──────────┤
│ 2025-04-11T16:23:43+02:00 │ penthertz/rfswift:bluetooth │ missionbluetooth                                      │ 3d92cb59560f │ /bin/zsh │
├───────────────────────────┼─────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┼──────────┤
│ 2025-04-11T16:18:22+02:00 │ penthertz/rfswift:rfid      │ missionrfid2                                          │ 50cbccef53f5 │ /bin/zsh │
├───────────────────────────┼─────────────────────────────┼───────────────────────────────────────────────────────┼──────────────┼──────────┤
...
``` 

#### Restarting Existing Containers

To restart the most recently used container:

```bash
rfswift exec
```

To restart a specific container by name:

```bash
rfswift exec -c my_sdr_container
```

#### Container Lifecycle Management

**Save container changes as a new image:**
```bash
rfswift commit -c my_container -i my_new_image
```

**Rename a container:**
```bash
rfswift rename -n old_name -d new_name
```

**Remove a container:**
```bash
rfswift remove -c container_name
```

**Delete an image:**
```bash
rfswift delete -c penthertz/rfswift:tag_name
```

### 4. Device and Resource Management

#### Audio Support

RF Swift will warn if audio support is not properly configured:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️  Warning                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Warning: Unable to connect to Pulse server at 127.0.0.1:34567                                    │
...
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Enable audio support (run **without sudo**):

```bash
rfswift host audio enable
[+] Successfully loaded module-native-protocol-tcp with index 29
```

#### Dynamic Device and Volume Binding

One of RF Swift's most powerful features is the ability to add or remove device bindings to running containers:

```bash
# Add a USB device to an existing container
rfswift bindings add -c my_container -d -s /dev/ttyUSB0:/dev/ttyUSB0

# For some destination, use shortcuts with -t only
rfswift bindings add -c my_container -d -t /dev/ttyUSB0

# Add a shared folder
rfswift bindings add -c my_container -b ~/projects:/root/projects

# Remove a binding
rfswift bindings rm -c my_container -t /dev/ttyUSB0 [-d]

# List current bindings
rfswift bindings list -c my_container
```

Don't forget the `-d` switch if you want to deal with devices and not volumes.

### 5. Network Configuration

RF Swift supports various network isolation modes:

| Mode | Description |
|------|-------------|
| `host` | No network isolation (default) |
| `bridge` | Default Docker network driver with isolation |
| `none` | Complete network isolation |
| `overlay` | Connect multiple Docker daemons |
| `ipvlan` | Full IPv4/IPv6 addressing control |
| `macvlan` | Assign MAC addresses to containers |

Example of using bridge mode with port mapping:

```bash
rfswift run -i bluetooth -n my_container -t bridge -z 8000 -w 8000:127.0.0.1:80/tcp
```

This command:
- Uses the `-t bridge` option to enable bridge networking
- Maps container port 8000 to host port 80 on localhost with `-w 8000:127.0.0.1:80/tcp`
- Exposes port 8000 to other containers with `-z 8000`

{{< callout type="warning" >}}
For Wi-Fi and Bluetooth tools, you may need to add the `NET_ADMIN` capability: `rfswift run -i wifi_tools -n my_container -a NET_ADMIN`
Be cautious when adding capabilities as they increase security risks if the container is compromised.
{{< /callout >}}

## Container Architecture Benefits

```mermaid
graph TD;
    A[Core build]-->B[Image 1];
    A-->C[Docker image 2];
    B-->D[Container #1 from image 1];
    B-->E[Container #2 from image 1];
    C-->F[Container from image 2]
```

This architecture provides significant advantages:
- **Portability**: Move environments between systems easily
- **Isolation**: Create separate environments for different tasks
- **Disposability**: Create, experiment with, and destroy environments without impact
- **Specialization**: Tailored environments for specific assessment needs
- **Efficiency**: No need to reinstall entire systems
- **Performance**: Less resource-intensive than VMs
- **Time-saving**: Quick deployment for last-minute assessment preparations

{{< callout type="info" >}}
RF Swift significantly flattens the Docker learning curve while providing powerful features like dynamic device binding and host resource integration that would otherwise require considerable Docker expertise.
{{< /callout >}}

## Using RF Tools

Once your container is running, you can use any included RF tools. For example, with an SDR device connected:

```bash
┌─[root@topms] - [~] - [Tue Sep 03, 15:15]
└─[$]> sdrangel
```

![Running SDRAngel with an RTL-SDR](/images/docs/sdrangel.png "Running SDRAngel with an RTL-SDR")

{{< callout type="warning" >}}
GUI applications require:
- **Linux**: `xhost` installed and configured
- **macOS**: `XQuartz` properly configured
- **Windows**: Native support via Docker Desktop
{{< /callout >}}

## Advanced Features

### Host Isolation

{{< callout type="info" >}}
Host isolation features are in development and will be available soon.
{{< /callout >}}