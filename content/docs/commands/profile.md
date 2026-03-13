---
title: profile
weight: 2
prev: /docs/commands/run
next: /docs/commands/exec
---

# rfswift profile

Manage container profiles — YAML presets for quick container creation.

## Synopsis

```bash
rfswift profile [subcommand] [options]
```

Profiles bundle image, network mode, features (desktop, realtime, privileged), device mappings, capabilities, cgroup rules, and port bindings into a single named preset. Instead of typing long `rfswift run` commands, you can create a profile once and reuse it.

{{< callout type="info" >}}
**Quick Start**: Run `rfswift profile init` to generate default profiles, then use them with `rfswift run --profile sdr-full -n my_container`.
{{< /callout >}}

---

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | List all available profiles |
| `show [name]` | Show detailed configuration for a profile |
| `create` | Create a new profile interactively |
| `init` | Generate default profile YAML files |
| `delete [name]` | Delete a profile |

---

## Profile Storage

Profiles are stored as individual YAML files in a platform-specific directory:

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

Each profile is a standalone `.yaml` file that you can edit, copy, or share.

---

## Profile Format

A profile YAML file contains:

```yaml
name: sdr-full
description: Full SDR suite with all tools and device support
image: penthertz/rfswift_noble:sdr_full
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
vpn: ""
```

### Profile Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Profile name (used with `--profile`) | `sdr-full` |
| `description` | string | Human-readable description | `Full SDR suite` |
| `image` | string | Container image to use | `penthertz/rfswift_noble:sdr_full` |
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
| `vpn` | string | VPN configuration | `tailscale` |

---

## Examples

### Initialize Default Profiles

Generate the built-in starter profiles:

```bash
rfswift profile init
```

This creates 12 default profiles covering common RF/security use cases:

| Profile | Image | Features |
|---------|-------|----------|
| `sdr-full` | `sdr_full` | Realtime |
| `sdr-light` | `sdr_light` | — |
| `wifi` | `wifi` | Privileged |
| `bluetooth` | `bluetooth` | — |
| `telecom` | `telecom_4Gto5G` | Realtime |
| `rfid` | `rfid` | — |
| `automotive` | `automotive` | Realtime |
| `hardware` | `hardware` | — |
| `reversing` | `reversing` | Desktop |
| `network` | `network` | NAT network |
| `pentest-full` | `sdr_full` | Desktop, privileged, realtime, NAT |
| `headless` | `sdr_light` | No X11, NAT |

To overwrite existing profiles:
```bash
rfswift profile init --force
```

### List Profiles

```bash
rfswift profile list
```

Displays a table with name, description, image, network mode, and enabled features for all profiles.

### Show Profile Details

```bash
# By name
rfswift profile show sdr-full

# Interactive selection
rfswift profile show
```

Shows the full configuration and the equivalent `rfswift run` CLI command.

### Create a Profile Interactively

```bash
rfswift profile create
```

Launches a step-by-step wizard to create a new profile:

1. **Profile name** — unique identifier (e.g., `my-sdr-setup`)
2. **Description** — what this profile is for
3. **Image selection** — pick from local images or enter manually
4. **Network mode** — host, NAT, bridge, or join existing NAT network
5. **Feature toggles** — desktop, SSL, no-X11, privileged, realtime
6. **Device mappings** — optional device paths
7. **Volume bindings** — optional host:container paths
8. **Port mappings** — simplified `hostPort:containerPort` format
9. **Capabilities** — multi-select from common Linux capabilities (NET_ADMIN, SYS_RAWIO, etc.)
10. **Cgroup rules** — multi-select from common device access rules (USB, serial, sound, etc.)
11. **Recap and confirm**

The profile is saved as a YAML file that you can further edit manually.

### Delete a Profile

```bash
# By name
rfswift profile delete wifi

# Interactive selection
rfswift profile delete
```

### Edit a Profile Manually

Profiles are plain YAML files — edit them with any text editor:

```bash
# Linux
nano ~/.config/rfswift/profiles/sdr-full.yaml

# macOS
nano ~/Library/Application\ Support/rfswift/profiles/sdr-full.yaml
```

---

## Using Profiles with `rfswift run`

### Basic Usage

Use a profile with the `--profile` flag:

```bash
rfswift run --profile sdr-full -n my_sdr
```

This applies all the profile's settings (image, network, features, devices, etc.) and creates the container.

### Profile + CLI Overrides

CLI flags override profile values, so you can customize on the fly:

```bash
# Use wifi profile but with a different image
rfswift run --profile wifi -n my_wifi -i penthertz/rfswift_noble:sdr_full

# Use sdr-full profile but in NAT mode
rfswift run --profile sdr-full -n isolated_sdr -t nat

# Use headless profile but add realtime
rfswift run --profile headless -n headless_rt --realtime
```

### Profile in the Interactive Wizard

When you run `rfswift run` without `-i` and `-n`, the wizard offers profile selection as the first step:

```
? Start from a profile?
  > No profile (manual configuration)
    sdr-full — Full SDR suite with all tools and device support
    wifi — WiFi pentesting and assessment tools
    pentest-full — Full pentest setup: SDR + desktop + NAT isolation
    ...
```

After selecting a profile, you're asked:

```
? Use profile 'sdr-full' as-is?
  > Yes, use as-is
    No, let me customize
```

- **Yes, use as-is**: Skips all configuration steps — only asks for the container name, shows a recap, and creates the container. This is the fastest way to spin up a container.
- **No, let me customize**: Pre-fills all wizard fields with the profile's values, then lets you change anything before creation. You can also choose a different image while keeping all other profile settings.

---

## Sharing Profiles

Since profiles are plain YAML files, sharing is straightforward:

```bash
# Copy a profile to another machine
scp ~/.config/rfswift/profiles/my-setup.yaml user@remote:~/.config/rfswift/profiles/

# Share a team-wide profile
cp team-standard.yaml ~/.config/rfswift/profiles/
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers (supports `--profile` flag)
- [Configurations](/docs/guide/configurations) - Global configuration file
- [Running RF Swift](/docs/guide/running-rf-swift) - Core workflows and features

---

{{< callout emoji="💡" >}}
**Tip**: Create profiles for your most common setups (pentesting, SDR capture, hardware debug) and use `--profile` to skip repetitive configuration. Edit the YAML files directly for fine-tuning.
{{< /callout >}}

{{< callout type="info" >}}
**Exegol-style Presets**: RF Swift profiles are inspired by [Exegol's](https://github.com/ThePorgs/Exegol) profile system. If you're coming from Exegol, you'll find the concept familiar — profiles bundle all container settings into a reusable preset.
{{< /callout >}}
