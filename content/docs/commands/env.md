---
title: "rfswift env"
linkTitle: "env (Nix)"
navGroup: "Nix environments"
level: reference
description: "Create, enter, update, roll back, audit and export native Nix environments."
weight: 30
---

`rfswift env` manages **native Nix environments**: the same RF Swift tool sets as the container images (`sdr_light`, `rfid`, `wifi`, ...), installed directly on your computer as pinned, reproducible Nix packages. There is no daemon and no container in between.

The most common use runs one tool without setting anything up:

```bash
rfswift env run sdr_light sdrpp
```

`rfswift nix ...` is the legacy spelling and still works.

{{< callout type="info" >}}
New to the Nix engine? Read the [Nix engine guide](/docs/guide/nix-engine) first. It explains eager and on-demand (lazy) builds, the `--isolate` jail, OpenGL on hosts that are not NixOS, udev rules, and how the engine runs inside WSL 2 on Windows.
{{< /callout >}}

## Synopsis

```bash
# Creating and entering environments goes through the container commands with --engine nix
rfswift --engine nix container create -i sdr_light -n radio [--lazy] [--pure] [--isolate] [--flake REF] [--rebuild] [--create-only]
rfswift env shell radio                          # enter it (alias: env enter, or: rfswift --engine nix container shell -c radio)

# Discovery
rfswift env catalog                              # environments you can create
rfswift env list [--json]                        # environments you created
rfswift env info NAME [--json]                   # details, pin, tools, security posture
rfswift env tools NAME [--installed] [--json]    # on-demand shims and installed extras
rfswift env search TERM [--nixpkgs] [--env NAME] [--flake REF] [--json]
rfswift env versions [--flake REF] [--json]      # published RF-Swift-nix tags and nightly revision

# Tools
rfswift env run ENV|IMAGE TOOL [-- args...]      # build (if needed) and run one tool
rfswift env install [PACKAGE...] [--env NAME] [--flake REF]   # wizard when no package is given

# Lifecycle
rfswift env update [NAME] [--check] [--input INPUT] [--tool TOOL] [-y]
rfswift env rebuild NAME
rfswift env generations NAME [--json]
rfswift env rollback NAME [GENERATION]
rfswift env remove NAME [--workspace]
rfswift env export NAME [-o FILE.rfenv]
rfswift env import FILE.rfenv [--name NAME] [--workspace DIR]
rfswift env gc [--dry-run] [--max-free SIZE]

# Host integration
rfswift env audit [NAME] [--format ...] [--fail-on ...] [--out DIR]
rfswift env gl [NAME] [--check] [--json]
rfswift env udev NAME [--list] [--remove] [--no-groups] [--json] [-y]
rfswift env wsl status|setup|use|shell|display-reset       # Windows only
```

## Creating and entering

You create an environment with `rfswift container create` (or the legacy `rfswift run`) and `--engine nix`. Without `-i` and `-n`, a wizard opens: it offers a searchable catalog, the choice between eager and on-demand builds, and the isolation switch.

| Flag | What it does |
|------|--------------|
| `--lazy` | On-demand mode. Nothing is built up front: each tool is a small launcher (shim) that builds the tool the first time you call it, then keeps it pinned under `<env>/tools/<attribute>` |
| `--pure` | Enter a pure shell (`nix develop --ignore-environment`) that does not inherit your host environment |
| `--isolate` | Enter inside a jail: bubblewrap on Linux, Seatbelt (`sandbox-exec`) on macOS. It hides `$HOME` and the host filesystem, and keeps USB and serial devices, the display and the network. The setting is saved, so later entries use the same jail |
| `--flake REF` | Use this flake instead of the default. The default is `RFSWIFT_NIX_FLAKE`, then a local `RF-Swift-nix` checkout, then `github:PentHertz/RF-Swift-nix` |
| `--rebuild` | Force a rebuild during creation (eager mode) |
| `--create-only` | Create and build without entering the shell (for scripts and the Workbench) |
| `--workspace`, `--cwd`, `--no-workspace` | The same workspace options as containers. Inside a Linux jail the workspace is mounted at `/workspace` |

When you enter an environment, RF Swift prints a summary: workspace, flake and pin, build mode, number of tools, and the fact that tools run as your own user. It warns you when a serial device is visible but your session cannot open it.

The shell (bash or zsh) shows a `(rfswift:<name>)` prompt and has the tools on its `PATH`. To run one tool as root while keeping the display and the OpenGL runtime, use `rfsudo <tool>`.

Create an isolated RFID environment, enter it, or run a single command in it:

```bash
rfswift --engine nix container create -i rfid -n badge --isolate
rfswift env shell badge
rfswift --engine nix container shell -c badge -e "proxmark3 -h"
```

## Subcommands

### Discovery

| Subcommand | What it does |
|---|---|
| `catalog` | Lists the environments defined by RF-Swift-nix, with their category, description and tools. The wizard lets you filter this list by name or tool |
| `list` | Lists the environments you created, with their mode and pin |
| `info NAME` | Shows the flake, the pinned revision and where it came from, the packages, the workspace, the isolation setting, and the **Security posture** line from the last audit |
| `tools NAME` | Shows each tool's state: on-demand shims (built or not, and their store path) and packages added with `env install --env NAME`. `--installed` shows only the added packages |
| `search TERM` | Searches the curated RF Swift tool set and tells you which environments include each result. `--nixpkgs` searches the whole pinned nixpkgs (slower, but complete). `--env` uses that environment's pinned flake |
| `versions` | Lists the latest published tag, the nightly commit of the default branch and older tags, to pass to `--flake` when you create an environment |

### Running and installing tools

| Subcommand | What it does |
|---|---|
| `run ENV\|IMAGE TOOL [-- args]` | Builds only that tool and runs it. With a catalog name, the command maps to the package that provides it (`sdr_light sdrpp` runs the HydraSDR fork of SDR++). With an existing environment, the tool runs exactly as it would from that environment's shell: same pin, protected from garbage collection, with the OpenGL runtime. `--flake` runs a tool from a specific flake |
| `install [PACKAGE...]` | Adds nixpkgs packages to a persistent profile: the **shared** profile (on `PATH` in every environment), or one environment with `--env`. Without a package name, a guided installer opens (curated set or all of nixpkgs, shared or one environment). When you install a device library, it offers to install its udev rules right away. Shell completion suggests package names |

### Updating, rebuilding, rolling back

| Subcommand | What it does |
|---|---|
| `update [NAME]` | Without a name, a wizard opens: pick an environment, choose check-only, all inputs or one input, review a recap with the rollback points, then confirm. `--check` previews lock changes without writing or building anything. `--input nixpkgs` updates one input (this needs a writable local flake checkout). `--tool TOOL` refreshes one on-demand shim or added package. `-y` skips questions, for CI |
| `rebuild NAME` | Rebuilds with the lock that is already pinned |
| `generations NAME` | Lists the rollback points, kept under `~/.rfswift/nix/environments/<name>/generations/` and protected from garbage collection |
| `rollback NAME [GENERATION]` | Restores the newest previous generation, or the one you name |

**How updates work for eager environments.** Updates are transactional: the new version is built before anything changes, a failed build leaves your current environment active, and a failed local update restores `flake.lock`.

**How updates work for lazy environments.** They are pinned to a flake revision instead. `update --check` tells you whether that revision moved on, and `update` moves the pin and rebuilds the tools you already built. Lazy environments have no rollback generations.

After any update, the environment's security audit is marked out of date (the old report is kept). Run `env audit` again.

### Portability and disk space

| Subcommand | What it does |
|---|---|
| `export NAME [-o FILE.rfenv]` | Builds the environment, then packs all its Nix packages and its workspace into one compressed `.rfenv` archive |
| `import FILE.rfenv` | Adds the packages to the local store, restores the workspace and registers the environment. `--name` and `--workspace` override the archived values. Extraction rejects unsafe paths, device entries, links that point outside and malformed store paths. Still, an `.rfenv` is **executable code**: import only archives you trust |
| `remove NAME [--workspace]` | Deletes the environment and frees what only it used. The workspace is kept unless you add `--workspace`. Home folders, filesystem roots and symlinked workspaces are refused |
| `gc [--dry-run] [--max-free 5G]` | Frees disk space by removing store paths nothing uses. Environments, their built on-demand tools, generations and the OpenGL runtime are protected and kept |

### Security

| Subcommand | What it does |
|---|---|
| `audit [NAME]` | Runs vulnix (known vulnerabilities in the packages), a syft software bill of materials, grype, osv-scanner, a store integrity check, signature provenance and flake hygiene, through the flake's `audit` app. `--format stdout,txt,json,html,pdf` (default `stdout,txt,json`), `--fail-on`, `--out`. See [audit](/docs/commands/audit) |

### Host integration

| Subcommand | What it does |
|---|---|
| `gl [NAME] [--check]` | Shows the OpenGL runtime that graphical tools get on this computer (Mesa from the environment's nixpkgs, or the matching NVIDIA libraries), the GPUs the kernel sees and their drivers. With `--check`, it creates an OpenGL context and prints which driver answered. Run it first when SDR++ or gqrx does not open a window |
| `udev NAME` | Installs the udev rules that come with the environment's packages (HackRF, RTL-SDR, bladeRF, Airspy, LimeSDR, USRP, Proxmark, ...) into `/etc/udev/rules.d`, creates the groups they need and adds you to them, with one `sudo`. `--list` shows what is installed, `--remove` takes the rules out, `--no-groups` installs only the rules. Afterwards, log out and in (or run `newgrp plugdev`), then plug the device in again |
| `wsl ...` | **Windows only.** `status` shows the WSL 2 distribution that runs the engine and what it provides (Nix, rfswift, WSLg sockets, forwarded USB). `setup` prepares it: systemd, Nix with flakes, and the Linux `rfswift` at the same version as on Windows (`--yes`, `--distro`, `--install-distro Ubuntu`, `--update`, `--version TAG`, `--binary FILE`, `--no-nix`, `--no-rfswift`). `use DISTRO` picks the distribution and saves it in `config.ini`. `shell` opens a login shell in it. `display-reset` restarts WSLg's display client when a graphical tool shows only a taskbar icon |

## Examples

Browse the catalog, then create an eager environment and enter it:

```bash
rfswift env catalog
rfswift --engine nix container create -i sdr_light -n mysdr
```

Run one tool without creating anything:

```bash
rfswift env run sdr_light gqrx
```

Add a Soapy module to one environment only, then check what you added:

```bash
rfswift env install soapyrtlsdr --env mysdr
rfswift env tools mysdr --installed
```

Update safely: preview the changes, apply them, and roll back if something breaks:

```bash
rfswift env update --check mysdr
rfswift env update mysdr
rfswift env rollback mysdr
```

Let your user open the radio hardware without root:

```bash
rfswift env udev mysdr
```

Move the environment to another machine:

```bash
rfswift env export mysdr -o mysdr.rfenv
rfswift env import mysdr.rfenv --name mysdr2
```

On Windows, prepare the WSL 2 side once, then check it:

```bash
rfswift env wsl setup
rfswift env wsl status
```

## Files

| Path | What it holds |
|------|---------------|
| `~/.rfswift/nix/environments/<name>/` | The profile link (protected from garbage collection), `tools/` shims, `generations/`, audit reports, and the `build.log` of the last build started from the Workbench |
| `~/rfswift-workspace/<name>/` | The default workspace |
| `~/.rfswift/nix/gl/` | OpenGL runtime pins (`nvidia-<version>`, `rfswift-gl.nix`) |

On Windows these are inside the WSL 2 distribution. You can reach them from Explorer at `\\wsl.localhost\<distro>\home\<user>\...`.

## Related

- [Nix engine guide](/docs/guide/nix-engine)
- [audit](/docs/commands/audit)
- [host isolate](/docs/commands/host): when `--isolate` fails on Ubuntu 24.04 and later
- [Known limits](/docs/guide/limitations)
