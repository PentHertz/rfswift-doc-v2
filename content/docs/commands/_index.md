---
linkTitle: "Commands"
title: "Command reference"
level: reference
description: "Every rfswift command with its syntax, options and examples, grouped by what it manages."
weight: 11
---

Every `rfswift` command has its own page, with its syntax, options and examples. You don't need to read this reference to get started: the [Quick start](/docs/quick-start/) covers the few commands most people use every day. Come here when you need a specific option.

{{< callout type="beginner" title="New to the command line?" >}}
You never have to remember flags. Most commands open an interactive picker when something is missing: `rfswift container create` with no options starts a guided wizard, and `rfswift container shell` with no name lets you pick a container from a list. Prefer windows and buttons? The [Workbench](/docs/guide/workbench/) does the same things without typing.
{{< /callout >}}

## The 10 commands you'll use most

| You want to… | Command |
|---|---|
| Check that your computer is ready | `rfswift doctor` |
| Create a lab (guided) | `rfswift container create` |
| Create a lab from a toolbox | `rfswift container create -i sdr_light -n mylab` |
| Go back into a lab | `rfswift container shell -c mylab` |
| See your labs | `rfswift container last` |
| Download a toolbox | `rfswift image pull -i sdr_full` |
| See which toolboxes exist | `rfswift image remote` |
| Add a device to an existing lab | `rfswift config bindings add -c mylab -d -t /dev/ttyUSB0` |
| Stop or delete a lab | `rfswift container stop -c mylab` / `rfswift container rm -c mylab` |
| Update RF Swift | `rfswift update` |

## Getting help in the terminal

```bash
rfswift --help                      # grouped overview
rfswift container create --help     # one command
rfswift config bindings add --help  # a subcommand
man rfswift-env-update              # Linux packages ship man pages
rfswift completion zsh --install    # tab completion
```

`rfswift env update` without a name also opens a guided wizard. In scripts and pipes, every command works with plain flags and never waits for input.

## The v4 command tree

Since v4.0 "Nucleus", commands are grouped by what they act on: containers, images, Nix environments, configuration, the host, and so on. The older flat commands (`rfswift run`, `rfswift exec`, `rfswift images pull`, `rfswift nix install`, ...) still work and print a notice with the new name, so existing scripts keep working.

```
rfswift
├── container   create | shell | last | install | stop | rm | rename | commit | upgrade
├── image       local | remote | pull | rm | build | tag | download | export | import | audit | versions
├── env         catalog | list | info | shell | run | install | search | tools | remove | export | import
│               update | rebuild | rollback | generations | audit | gc | gl | udev | versions | wsl (Windows)
├── config      bindings | capabilities | cgroups | gpus | ports | ulimits | serial-hotplug
├── network     create | list | remove | cleanup
├── host        setup | udev | docker-access | isolate | devclean | audio
├── usb         list | attach | detach | status | vm-devices (+ bind | unbind on Windows)
├── audit       <environment | image | container>
├── agent       (serve) | certs init | certs client | certs export | certs import
├── profile     list | show | create | init | delete
├── realtime    enable | disable | status
├── engine      lima status | set | reconfig | reset (macOS)
└── system      doctor | cleanup | update | upgrade | log | report
```

{{% details title="Old command names (v3 and earlier) and their v4 equivalents" %}}

| Canonical (v4) | Legacy (still works) | Short aliases |
|---|---|---|
| `rfswift container create` | `rfswift run` | `rfswift create`, `rfswift new` |
| `rfswift container shell` | `rfswift exec` | `rfswift shell`, `rfswift enter` |
| `rfswift container stop` | `rfswift stop` | `rfswift halt` |
| `rfswift container rm` | `rfswift remove` | `rfswift rm` |
| `rfswift container last` | `rfswift last` | |
| `rfswift container install` | `rfswift install` | |
| `rfswift container rename` / `commit` / `upgrade` | `rfswift rename` / `commit` / `upgrade` | |
| `rfswift image pull` / `local` / `remote` / `versions` / `audit` | `rfswift images pull` / ... | |
| `rfswift image build` / `rm` / `tag` / `download` / `export` / `import` | `rfswift build` / `delete` / `retag` / `download` / `export` / `import` | |
| `rfswift env ...` | `rfswift nix ...` | |
| `rfswift config ports bind` | `rfswift ports bind` | `rfswift cfg ports bind` |
| `rfswift system doctor` / `cleanup` / `update` / `log` / `report` | `rfswift doctor` / `cleanup` / `update` / `log` / `report` | `rfswift admin ...` |
| `rfswift agent` | | `rfswift remote` |
| `rfswift usb ...` | `rfswift macusb ...` (macOS), `rfswift winusb ...` (Windows) | |

The runtime-configuration groups (`bindings`, `capabilities`, `cgroups`, `gpus`, `ports`, `ulimits`) and the maintenance commands (`doctor`, `cleanup`, `update`, `log`, `report`) exist both at the top level and under their `config` / `system` parent. Neither form is deprecated.

{{% /details %}}

## Global flags

| Flag | Description |
|------|-------------|
| `--engine auto\|docker\|podman\|lima\|nix` | Engine to use. Precedence: this flag, then `RFSWIFT_ENGINE`, then `[general] engine` in `config.ini`, then auto-detection. `nix` selects the native [Nix engine](/docs/guide/nix-engine). |
| `--gpu` | macOS Apple Silicon only: use the GPU-accelerated Lima VM (krunkit, Vulkan). Implies `--engine lima`, provides GPU compute but **no** USB passthrough. |
| `-q, --disconnect` | Disconnected mode: no update check, no network query. |
| `-v, --version` | Print the version and exit, without touching the network or an engine. |

```bash
# Work without querying for updates
rfswift -q container create -i sdr_full -n work

# Run the same command natively with the Nix engine
rfswift --engine nix container create -i sdr_light -n radio

# Set an engine once for the shell session
export RFSWIFT_ENGINE=podman
```

The ASCII banner only appears in an interactive terminal. It is skipped when the output goes to a pipe (scripts, `--json` consumers) and when `RFSWIFT_NO_BANNER` is set.

## Command groups

### Containers

{{< cards >}}
  {{< card link="container" title="container" subtitle="Create, enter, stop, remove, rename, commit and upgrade containers" >}}
  {{< card link="run" title="container create (run)" subtitle="Create and start a new container, all options" >}}
  {{< card link="exec" title="container shell (exec)" subtitle="Enter a container or run a command in it" >}}
  {{< card link="install" title="container install" subtitle="Guided tool installation in a container or Nix environment" >}}
  {{< card link="profile" title="profile" subtitle="YAML presets for quick container creation" >}}
  {{< card link="stop" title="container stop" subtitle="Stop a running container" >}}
  {{< card link="remove" title="container rm" subtitle="Remove a container" >}}
  {{< card link="rename" title="container rename" subtitle="Rename a container" >}}
  {{< card link="commit" title="container commit" subtitle="Save a container as a new image" >}}
  {{< card link="last" title="container last" subtitle="List recently used containers" >}}
  {{< card link="upgrade" title="container upgrade" subtitle="Move a container to a new image" >}}
{{< /cards >}}

### Images and portability

{{< cards >}}
  {{< card link="image" title="image" subtitle="List, pull, audit, build, tag, export and import images" >}}
  {{< card link="images" title="image local / remote / pull / versions" subtitle="Registry browsing, pulling and version tracking" >}}
  {{< card link="build" title="image build" subtitle="Build an image from a YAML recipe" >}}
  {{< card link="delete" title="image rm" subtitle="Delete an image" >}}
  {{< card link="retag" title="image tag" subtitle="Rename an image tag" >}}
  {{< card link="download" title="image download" subtitle="Save an image to tar.gz" >}}
  {{< card link="export" title="image export" subtitle="Export containers or images" >}}
  {{< card link="import" title="image import" subtitle="Import containers or images" >}}
{{< /cards >}}

### Native Nix environments

{{< cards >}}
  {{< card link="env" title="env" subtitle="Create, enter, update, roll back, audit and export native Nix environments" >}}
  {{< card link="/docs/guide/nix-engine" title="Nix engine guide" subtitle="How the native engine works, isolation, GPU, udev, Windows" >}}
{{< /cards >}}

### Runtime configuration

{{< cards >}}
  {{< card link="config" title="config" subtitle="Change devices, mounts, capabilities, cgroups, GPUs, ports and ulimits of an existing container" >}}
  {{< card link="bindings" title="config bindings" subtitle="Device and volume bindings" >}}
  {{< card link="capabilities" title="config capabilities" subtitle="Linux capabilities" >}}
  {{< card link="cgroups" title="config cgroups" subtitle="cgroup device rules" >}}
  {{< card link="gpu" title="config gpus" subtitle="GPU passthrough" >}}
  {{< card link="ports" title="config ports" subtitle="Exposed and published ports" >}}
  {{< card link="ulimits" title="config ulimits" subtitle="Resource limits" >}}
  {{< card link="realtime" title="realtime" subtitle="One-command realtime mode for SDR work" >}}
{{< /cards >}}

### Networking

{{< cards >}}
  {{< card link="network" title="network" subtitle="Managed NAT networks for container isolation" >}}
{{< /cards >}}

### Devices and host

{{< cards >}}
  {{< card link="host" title="host" subtitle="Host setup: udev rules, Docker access, Nix jail, audio server" >}}
  {{< card link="usb" title="usb" subtitle="USB passthrough on macOS (Lima) and Windows (usbipd)" >}}
  {{< card link="macusb" title="macusb" subtitle="macOS USB backend details" >}}
  {{< card link="winusb" title="winusb" subtitle="Windows USB backend details" >}}
  {{< card link="engine" title="engine" subtitle="Engine selection, Lima VM management" >}}
{{< /cards >}}

### Security

{{< cards >}}
  {{< card link="audit" title="audit" subtitle="Vulnerability and attack-surface audit of environments, images and containers" >}}
  {{< card link="report" title="report" subtitle="Assessment reports from a container and its workspace" >}}
{{< /cards >}}

### Remote access

{{< cards >}}
  {{< card link="agent" title="agent" subtitle="Serve the engines of a lab machine to authenticated remote clients (mTLS)" >}}
  {{< card link="/docs/guide/remote-agent" title="Remote agent guide" subtitle="Setup, credential files, Workbench connection, limits" >}}
{{< /cards >}}

### System and maintenance

{{< cards >}}
  {{< card link="system" title="system" subtitle="doctor, cleanup, update, upgrade, log and report under one parent" >}}
  {{< card link="doctor" title="doctor" subtitle="Diagnose the host: engines, Nix, USB, display, audio, udev rules, jail" >}}
  {{< card link="cleanup" title="cleanup" subtitle="Remove old containers and images" >}}
  {{< card link="update" title="update" subtitle="Update the RF Swift binary" >}}
  {{< card link="log" title="log" subtitle="Record and replay terminal sessions" >}}
  {{< card link="completion" title="completion" subtitle="Shell completion scripts" >}}
{{< /cards >}}

## Quick reference

| Command | Purpose |
|---------|---------|
| `rfswift container create -i IMAGE -n NAME` | Create a new container |
| `rfswift container create --profile sdr-full -n NAME` | Create a container from a profile |
| `rfswift --engine nix container create -i sdr_light -n NAME` | Create a native Nix environment |
| `rfswift --engine nix container create -i sdr_light -n NAME --isolate` | Same, inside the bubblewrap / Seatbelt jail |
| `rfswift container shell -c NAME` | Enter a container (starts it if stopped) |
| `rfswift env shell NAME` | Enter a Nix environment |
| `rfswift container last` | List recent containers |
| `rfswift container install -c NAME` | Pick and run an install function |
| `rfswift image pull -i sdr_full` | Download an image |
| `rfswift image audit penthertz/rfswift_resolute:sdr_full` | Scan an image for CVEs |
| `rfswift audit NAME` | Audit a container, image or Nix environment (auto-detected) |
| `rfswift env catalog` | Nix environments you can create |
| `rfswift env update --check NAME` | Preview a Nix environment update |
| `rfswift env rollback NAME` | Restore the previous generation |
| `rfswift config bindings add -c NAME -d -t /dev/ttyUSB0` | Add a device to an existing container |
| `rfswift config serial-hotplug on -c NAME` | Hot-pluggable serial ports |
| `rfswift config ports bind -c NAME -b 8080:80/tcp` | Publish a port |
| `rfswift realtime enable -c NAME` | Realtime SDR mode |
| `rfswift network create -n lab` | Create an isolated NAT network |
| `rfswift host setup` | udev rules, engine install, Nix, Docker access, jail |
| `rfswift host udev` | RF Swift's udev rules (rootless Podman, Nix) |
| `rfswift host docker-access` | docker group + socket ACL, no logout |
| `rfswift host audio enable` | Host audio server for containers (Linux, macOS) |
| `rfswift usb attach` | Forward a USB device (macOS Lima, Windows usbipd) |
| `rfswift agent certs init --dir DIR --host HOST` | Generate remote-agent certificates |
| `rfswift agent --bundle DIR` | Serve this machine's engines remotely |
| `rfswift doctor` | Diagnose the environment |
| `rfswift system cleanup all --dry-run` | Preview a cleanup |
| `rfswift log replay -i FILE.cast` | Replay a session |
| `rfswift report generate -c NAME -f html` | HTML assessment report |
| `rfswift engine lima status` | Lima VM status (macOS) |
| `rfswift update` | Update RF Swift (or tells you to use your package manager) |
