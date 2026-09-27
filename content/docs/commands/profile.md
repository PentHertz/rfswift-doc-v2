---
title: "rfswift profile"
linkTitle: "profile"
navGroup: "Containers"
level: reference
description: "Manage profiles: YAML presets for quick container creation."
weight: 11
---

A profile is a named preset for creating containers: image, network mode, features (desktop, realtime, privileged), device mappings, capabilities, cgroup rules and port bindings in one YAML file. `rfswift profile` lists, shows, creates and deletes them. Use profiles so you don't have to type long `rfswift container create` commands again and again.

```bash
rfswift profile init                                   # generate the built-in profiles
rfswift container create --profile sdr-full -n my_sdr  # use one
```

## Synopsis

```bash
rfswift profile [subcommand] [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | List all available profiles |
| `show [name]` | Show detailed configuration for a profile |
| `create` | Create a new profile interactively |
| `init` | Generate default profile YAML files |
| `delete [name]` | Delete a profile |

## Profile storage

Each profile is a YAML file in this folder:

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
```
~/.config/rfswift/profiles/
```
  {{< /tab >}}
  {{< tab >}}
```
~/Library/Application Support/rfswift/profiles/
```
  {{< /tab >}}
  {{< tab >}}
```
%APPDATA%\rfswift\profiles\
```
  {{< /tab >}}
{{< /tabs >}}

You can edit, copy or share these files like any other file.

## Profile format

A profile YAML file contains:

```yaml
name: sdr-full
description: Full SDR suite with all tools and device support
image: penthertz/rfswift_resolute:sdr_full
network: host
desktop: false
desktop_ssl: false
no_x11: false
privileged: false
realtime: true
devices: ""
bindings: ""
exposed_ports: ""
port_bindings: ""
caps: ""
cgroups: ""
gpus: ""
vpn: ""
```

### Profile fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Profile name (used with `--profile`) | `sdr-full` |
| `description` | string | Human-readable description | `Full SDR suite` |
| `image` | string | Container image to use | `penthertz/rfswift_resolute:sdr_full` |
| `network` | string | Network mode (`host`, `nat`, `bridge`) | `host` |
| `desktop` | bool | Enable remote desktop | `true` |
| `desktop_ssl` | bool | Enable SSL for desktop | `false` |
| `no_x11` | bool | Disable X11 forwarding | `false` |
| `privileged` | bool | Enable privileged mode | `false` |
| `realtime` | bool | Enable realtime mode | `true` |
| `devices` | string | Device mappings (comma-separated) | `/dev/ttyUSB0:/dev/ttyUSB0` |
| `bindings` | string | Volume bindings (comma-separated) | `~/data:/root/data` |
| `exposed_ports` | string | Exposed ports | `8080/tcp,443/tcp` |
| `port_bindings` | string | Port bindings | `8080:8080/tcp` |
| `caps` | string | Linux capabilities (comma-separated) | `NET_ADMIN,NET_RAW` |
| `cgroups` | string | Cgroup device rules (comma-separated) | `c 189:* rwm` |
| `gpus` | string | GPU passthrough (`all` or comma-separated IDs) | `all` |
| `vpn` | string | VPN configuration | `tailscale` |

## Examples

### Initialize default profiles

Generate the built-in starter profiles:

```bash
rfswift profile init
```

This creates the built-in profiles for common RF and security work:

| Profile | Purpose |
|---------|---------|
| `yolo` | Everything on: privileged, USB, realtime, GPU; for quick experiments, not for engagements |
| `network-host` | Network tools on the host network |
| `network-nat` | Network tools on an isolated RF Swift NAT network |
| `sdr-full` | Full SDR suite, realtime and USB hot-plug |
| `sdr-light` | Lightweight SDR tools |
| `wifi` | Wi-Fi monitor mode and injection |
| `bluetooth` | Bluetooth tools |
| `telecom` | 2G to 4G/5G-NSA stacks |
| `telecom-5g` | 5G SA (OCUDU) |
| `rfid` | RFID/NFC tools (Proxmark3, libnfc) over USB, with the console the Proxmark3 client needs and hot-pluggable serial ports |
| `automotive` | CAN tools, realtime |
| `hardware` | Hardware hacking tools |
| `reversing` | Reversing tools with a desktop |
| `headless` | No X11, NAT network |

`rfswift profile show NAME` prints the exact settings of each one. When RF Swift improves a built-in profile, your copy is refreshed automatically, unless you edited it: an edited copy is kept, and RF Swift tells you (a fingerprint records what RF Swift wrote).

To overwrite existing profiles:
```bash
rfswift profile init --force
```

### List profiles

```bash
rfswift profile list
```

It prints a table with each profile's name, description, image, network mode and enabled features.

### Show profile details

```bash
# By name
rfswift profile show sdr-full

# Interactive selection
rfswift profile show
```

It shows the full configuration and the equivalent `rfswift container create` command.

### Create a profile interactively

```bash
rfswift profile create
```

A step-by-step wizard asks for:

1. **Profile name**: unique identifier (e.g., `my-sdr-setup`)
2. **Description**: what this profile is for
3. **Image selection**: pick from local images or enter manually
4. **Network mode**: host, NAT, bridge, or join existing NAT network
5. **Feature toggles**: desktop, SSL, no-X11, privileged, realtime
6. **Device mappings**: optional device paths
7. **Volume bindings**: optional host:container paths
8. **Port mappings**: simplified `hostPort:containerPort` format
9. **Capabilities**: multi-select from common Linux capabilities (NET_ADMIN, SYS_RAWIO, etc.)
10. **Cgroup rules**: multi-select from common device access rules (USB, serial, sound, etc.)
11. **Recap and confirm**

The profile is saved as a YAML file that you can edit afterwards.

### Delete a profile

```bash
# By name
rfswift profile delete wifi

# Interactive selection
rfswift profile delete
```

### Edit a profile manually

Profiles are plain YAML files, so you can edit them with any text editor:

```bash
# Linux
nano ~/.config/rfswift/profiles/sdr-full.yaml

# macOS
nano ~/Library/Application\ Support/rfswift/profiles/sdr-full.yaml
```

## Using profiles with `rfswift container create`

### Basic usage

Use a profile with the `--profile` flag:

```bash
rfswift container create --profile sdr-full -n my_sdr
```

The container is created with all of the profile's settings (image, network, features, devices...).

### Profile + CLI overrides

Flags you add on the command line override the profile's values:

```bash
# Use wifi profile but with a different image
rfswift container create --profile wifi -n my_wifi -i penthertz/rfswift_resolute:sdr_full

# Use sdr-full profile but in NAT mode
rfswift container create --profile sdr-full -n isolated_sdr -t nat

# Use headless profile but add realtime
rfswift container create --profile headless -n headless_rt --realtime
```

### Profile in the interactive wizard

When you run `rfswift container create` without `-i` and `-n`, the wizard offers profile selection as the first step:

```
? Start from a profile?
  > No profile (manual configuration)
    sdr-full: Full SDR suite, realtime and USB hotplug
    wifi: Wi-Fi monitor mode and injection, unprivileged
    yolo: Everything on: privileged, USB, realtime, GPU
    ...
```

After selecting a profile, you're asked:

```
? Use profile 'sdr-full' as-is?
  > Yes, use as-is
    No, let me customize
```

- **Yes, use as-is**: skips the configuration steps. The wizard only asks for the container name, shows a recap and creates the container. This is the fastest way to get a container.
- **No, let me customize**: fills in every wizard step with the profile's values and lets you change anything before creation, including the image.

## Sharing profiles

Profiles are plain YAML files, so you share them like any file:

```bash
# Copy a profile to another machine
scp ~/.config/rfswift/profiles/my-setup.yaml user@remote:~/.config/rfswift/profiles/

# Share a team-wide profile
cp team-standard.yaml ~/.config/rfswift/profiles/
```

## Related commands

- [`container create`](/docs/commands/run/): create containers (accepts `--profile`)
- [Configuration](/docs/guide/configurations/): the global configuration file
- [Running RF Swift](/docs/guide/running-rf-swift/): everyday workflows

{{< callout >}}
**Tip**: create a profile for each setup you use often (SDR capture, hardware debugging, network testing...) and use `--profile` instead of repeating the same flags. Edit the YAML files directly for fine-tuning.
{{< /callout >}}
