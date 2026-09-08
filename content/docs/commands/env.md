---
title: env
weight: 20
prev: /docs/commands/import
next: /docs/commands/config
---

# rfswift env

Create and manage **native Nix environments**: the same RF Swift tool sets as the container images (`sdr_light`, `rfid`, `wifi`, ...), installed on the host as reproducible, pinned Nix closures, without a daemon or a container boundary. `rfswift nix ...` is the legacy spelling and still works.

{{< callout type="info" >}}
Read the [Nix engine guide](/docs/guide/nix-engine) first: it explains eager and on-demand builds, the `--isolate` jail, OpenGL on non-NixOS hosts, udev rules, and how the engine runs inside WSL 2 on Windows.
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

---

## Creating and entering

Creation is `rfswift container create` (or the legacy `rfswift run`) with `--engine nix`. Without `-i` and `-n` the wizard opens with a searchable catalog, a build-mode choice (eager or on-demand) and the isolation toggle.

| Flag | Meaning |
|------|---------|
| `--lazy` | On-demand: nothing is prebuilt, each tool is a shim that builds on first call and is then pinned under `<env>/tools/<attribute>` |
| `--pure` | Enter a pure shell (`nix develop --ignore-environment`), not inheriting the host environment |
| `--isolate` | Enter inside a jail: bubblewrap on Linux, Seatbelt (`sandbox-exec`) on macOS. Hides `$HOME` and the host filesystem, keeps USB/serial devices, the display and the network. Stored on the environment, so later entries re-enter the same jail |
| `--flake REF` | Flake reference instead of the default (`RFSWIFT_NIX_FLAKE`, a local `RF-Swift-nix` checkout, else `github:PentHertz/RF-Swift-nix`) |
| `--rebuild` | Force re-realisation during creation (eager mode) |
| `--create-only` | Create and realise without entering (scripts, the Workbench) |
| `--workspace`, `--cwd`, `--no-workspace` | Same workspace options as containers; inside a Linux jail the workspace is mounted at `/workspace` |

Entering prints a container-style summary (workspace, flake and pin, build mode, tool count, native-user execution) and warns when a visible serial device cannot be opened by your session. The shell (bash or zsh) shows a `(rfswift:<name>)` prompt, has the tools on `PATH`, and provides `rfsudo <tool>` to run one tool as root while keeping the display and the OpenGL runtime.

```bash
rfswift --engine nix container create -i rfid -n badge --isolate
rfswift env shell badge
rfswift --engine nix container shell -c badge -e "proxmark3 -h"
```

---

## Subcommands

### Discovery

| Subcommand | Notes |
|---|---|
| `catalog` | Environments defined by RF-Swift-nix (name, category, description, tools). The wizard filters this list by name or tool |
| `list` | Created environments with their mode and pin |
| `info NAME` | Flake, pinned revision and the reference it came from, packages, workspace, isolation, and the **Security posture** line from the last audit |
| `tools NAME` | Per-tool state: on-demand shims (built or not, store path) and packages installed with `env install --env NAME`. `--installed` keeps only the latter |
| `search TERM` | Curated RF Swift tool set, telling which environments bundle each hit. `--nixpkgs` searches the whole pinned nixpkgs (slower, exhaustive), `--env` uses that environment's pinned flake |
| `versions` | Latest published tag, nightly default-branch commit and older tags, for `--flake` at creation |

### Running and installing tools

| Subcommand | Notes |
|---|---|
| `run ENV\|IMAGE TOOL [-- args]` | Builds only that tool's closure and runs it. For a catalog image the command name maps to the package that provides it (`sdr_light sdrpp` runs the HydraSDR fork of SDR++); for an existing environment the tool runs exactly as from its shell (its pin, GC-safe, with the OpenGL runtime). `--flake` runs a tool from an explicit flake |
| `install [PACKAGE...]` | Adds nixpkgs packages to a persistent profile: the **shared** profile (on `PATH` in every environment) or one environment with `--env`. Without a package the guided installer opens (curated set or all of nixpkgs, shared or scoped). Installing a device library offers to install its udev rules right away. Shell completion suggests package names |

### Updating, rebuilding, rolling back

| Subcommand | Notes |
|---|---|
| `update [NAME]` | Without a name: a wizard (environment picker, check-only / all inputs / one input, recap with rollback points, confirmation). `--check` previews lock changes without writing or building. `--input nixpkgs` updates one input (needs a writable local flake checkout). `--tool TOOL` refreshes one on-demand shim or installed extra. `-y` for CI |
| `rebuild NAME` | Rebuild with the lock that is already pinned |
| `generations NAME` | Rollback points kept under `~/.rfswift/nix/environments/<name>/generations/`, registered as GC roots |
| `rollback NAME [GENERATION]` | Restore the newest, or a listed, previous generation |

Updates are transactional for eager environments: a candidate closure is built before the active profile changes, a failed build leaves the current environment active, and a failed local update restores `flake.lock`. Lazy environments are pinned to a flake revision instead: `update --check` tells whether the reference moved on, `update` moves the pin and rebuilds the tools already built. Lazy environments have no rollback generations. Updating invalidates the environment's security audit (the old report is kept as stale); run `env audit` again.

### Portability and disk

| Subcommand | Notes |
|---|---|
| `export NAME [-o FILE.rfenv]` | Realises the environment and packs its whole Nix closure plus its workspace into one compressed `.rfenv` archive |
| `import FILE.rfenv` | Adds the closure to the local store, restores the workspace and registers the environment. `--name` and `--workspace` override the archived values. Extraction refuses traversal, device entries, escaping links and malformed store paths, but an `.rfenv` is **executable code**: import only archives you trust |
| `remove NAME [--workspace]` | Deletes the environment (frees its GC roots). The workspace is kept unless `--workspace` is given; home directories, filesystem roots and symlinked workspaces are refused |
| `gc [--dry-run] [--max-free 5G]` | Collects unreferenced store paths. Environments, their built on-demand tools, generations and the OpenGL runtime are rooted and survive |

### Security

| Subcommand | Notes |
|---|---|
| `audit [NAME]` | vulnix (closure CVEs), syft SBOM, grype, osv-scanner, store integrity, signature provenance and flake hygiene, through the flake's `audit` app. `--format stdout,txt,json,html,pdf` (default `stdout,txt,json`), `--fail-on`, `--out`. See [audit](/docs/commands/audit) |

### Host integration

| Subcommand | Notes |
|---|---|
| `gl [NAME] [--check]` | Shows the OpenGL runtime GUI tools get on this host (Mesa from the environment's nixpkgs, or the matching proprietary NVIDIA libraries), the GPUs the kernel exposes and their drivers, and with `--check` creates a context and prints the driver that answered. Run it first when SDR++ or gqrx will not open a window |
| `udev NAME` | Installs the udev rules shipped by the environment's packages (HackRF, RTL-SDR, bladeRF, Airspy, LimeSDR, USRP, Proxmark, ...) into `/etc/udev/rules.d`, creates the groups they rely on and adds you to them, in one `sudo`. `--list` shows the state, `--remove` takes them out, `--no-groups` installs the rules only. Log out and in (or `newgrp plugdev`), then re-plug the device |
| `wsl ...` | **Windows only.** `status` shows the WSL 2 distribution serving the engine and what it offers (nix, rfswift, WSLg sockets, forwarded USB). `setup` provisions it: systemd, Nix with flakes, the Linux `rfswift` at the Windows version (`--yes`, `--distro`, `--install-distro Ubuntu`, `--update`, `--version TAG`, `--binary FILE`, `--no-nix`, `--no-rfswift`). `use DISTRO` picks the distribution (saved in `config.ini`). `shell` opens a login shell in it. `display-reset` restarts WSLg's display client when a GUI tool shows only a taskbar icon |

---

## Examples

```bash
# Browse, then create an eager environment and enter it
rfswift env catalog
rfswift --engine nix container create -i sdr_light -n mysdr

# Run one tool without creating anything
rfswift env run sdr_light gqrx

# Add a Soapy module to that environment only, then check what is installed
rfswift env install soapyrtlsdr --env mysdr
rfswift env tools mysdr --installed

# Safe update: preview, apply, roll back if needed
rfswift env update --check mysdr
rfswift env update mysdr
rfswift env rollback mysdr

# Hardware access without root
rfswift env udev mysdr

# Take the environment to another machine
rfswift env export mysdr -o mysdr.rfenv
rfswift env import mysdr.rfenv --name mysdr2

# Windows: provision the WSL 2 side once
rfswift env wsl setup
rfswift env wsl status
```

## Files

| Path | Content |
|------|---------|
| `~/.rfswift/nix/environments/<name>/` | Profile link (GC root), `tools/` shims, `generations/`, audit reports, `build.log` of the last Workbench-driven build |
| `~/rfswift-workspace/<name>/` | Default workspace |
| `~/.rfswift/nix/gl/` | OpenGL runtime pins (`nvidia-<version>`, `rfswift-gl.nix`) |

On Windows these live inside the WSL 2 distribution, reachable from Explorer at `\\wsl.localhost\<distro>\home\<user>\...`.

## Related

- [Nix engine guide](/docs/guide/nix-engine)
- [audit](/docs/commands/audit)
- [host isolate](/docs/commands/host) when `--isolate` fails on Ubuntu 24.04+
- [Known limits](/docs/guide/limitations)
