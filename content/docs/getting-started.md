---
title: Getting Started
weight: 5
next: /docs/quick-start
prev: /docs/comparisons
cascade:
  type: docs
---

# Getting Started with RF Swift 🚀

This guide covers installation on Linux, macOS and Windows, what the installer sets up for you, and the few host steps that are left to you on purpose.

The current release is **v4.0.2**. Linux and macOS have a one-line install script; every platform also has native installers on the [releases page](https://github.com/PentHertz/RF-Swift/releases): deb, rpm and pacman packages and a Workbench AppImage for Linux, a Homebrew cask and a signed DMG for macOS, and a one-click bundle or an MSI for Windows. Pick the tab that matches your machine.

## Installation

{{< tabs items="Linux / macOS (one line),Linux packages,macOS (DMG / Homebrew),Windows (installer)" >}}
  {{< tab >}}
```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

or with wget:

```bash
wget -qO- "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

The installer asks a handful of questions and does the rest:

1. **Release channel**: stable, or the development prerelease.
2. **What to install**: the `rfswift` CLI/TUI, the Workbench GUI, or both. On Linux the Workbench comes as a portable AppImage or a smaller native build.
3. **Install method**: the native package (deb, rpm, pacman; the signed Homebrew cask on macOS) when a package manager and root are available, else a tarball in a directory of your choice.
4. **Container engine** when none is found: Docker, Podman, both, Lima (macOS, USB passthrough), or skip.
5. **Nix** for the native engine, and **bubblewrap** for its `--isolate` jail (the sandbox is tested on every run).
6. **udev rules** for RF hardware (Linux), then Docker session access, `xhost` and `pactl`.

Every download is verified against the release SHA-256 manifest; with a recent, logged-in GitHub CLI it also offers to check the Sigstore build-provenance attestation. On Debian, where the first user is not in `sudo`, the installer offers the fix or runs from a root shell (`su -`).

Answer everything up front for automation:

| Variable | Values |
|----------|--------|
| `RFSWIFT_CHANNEL` | `stable`, `dev` |
| `RFSWIFT_INSTALL` | `cli`, `workbench`, `both` |
| `RFSWIFT_PKG_FORMAT` | `native`, `tarball` |
| `RFSWIFT_WORKBENCH_FORMAT` | `native`, `appimage` |
| `RFSWIFT_INSTALL_DIR` | directory for a tarball install |
| `RFSWIFT_ENGINE` | `docker`, `podman`, `both`, `skip` |
| `RFSWIFT_NIX`, `RFSWIFT_ISOLATE`, `RFSWIFT_UDEV`, `RFSWIFT_ATTEST` | `1` or `0` |

```bash
RFSWIFT_CHANNEL=stable RFSWIFT_INSTALL=both RFSWIFT_ENGINE=podman RFSWIFT_NIX=1 RFSWIFT_UDEV=1 sh get_rfswift.sh
```

{{< callout type="warning" >}}
Review a script before piping it into a shell. Download `get_rfswift.sh` from the official repository, read it, and run the local copy; or use the native packages below. See [Security](/docs/security/audit) for the trust model.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
Two packages ship with every release on the [releases page](https://github.com/PentHertz/RF-Swift/releases): `rfswift` (CLI/TUI, man pages, bash/zsh/fish completions) and `rfswift-workbench` (desktop GUI). They pull in `xhost` and `pactl`, the two host tools every container needs; `bubblewrap` and a container engine are recommended.

```bash
sudo apt install ./rfswift_<version>_amd64.deb            # Debian / Ubuntu
sudo dnf install ./rfswift-<version>-1.x86_64.rpm         # Fedora / RHEL
sudo pacman -U rfswift-<version>-1-x86_64.pkg.tar.zst     # Arch Linux
```

The packages install `rfswift` in `/usr/bin` and leave three host changes to you, asked for rather than applied:

```bash
rfswift host setup           # asks each step; --yes takes the defaults
rfswift host udev            # RF Swift's udev rules only (rootless Podman and Nix need them, Docker does not)
rfswift host docker-access   # docker group + socket ACL, effective without logging out
rfswift host isolate         # Nix jail on Ubuntu 24.04+: bubblewrap and its AppArmor profile
```

The wizard also offers to install Docker and/or Podman from your distribution, or Nix. A packaged `rfswift` is upgraded with the next package; `rfswift update` says so instead of overwriting it. The installer removes the copies an earlier tarball install left in `/usr/local/bin` or `~/.rfswift/bin` when you agree.
  {{< /tab >}}
  {{< tab >}}
**The DMG, no terminal needed.** Download `rfswift_Darwin_universal.dmg` from the [releases page](https://github.com/PentHertz/RF-Swift/releases), open it and drag `rfswift-workbench.app` to Applications. Two helpers sit next to it: **Install RF Swift CLI** copies `rfswift` to `/usr/local/bin`, and **RF Swift Setup** installs and picks your container engine. Everything in the image is Developer ID signed and notarized, so Gatekeeper opens it without a warning.

**Homebrew** does the same from the terminal:

```bash
brew install --cask penthertz/rfswift/rfswift
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/main/scripts/setup-macos.sh" | bash
```

The cask installs the CLI and the Workbench from the signed release; the setup script picks your engine. The one-line installer of the first tab works on macOS too.

For USB hardware install Lima (`brew install qemu lima`); for GUI tools install XQuartz (`scripts/setup-xquartz-macos.sh` configures it). See [engine](/docs/commands/engine) and [usb](/docs/commands/usb).
  {{< /tab >}}
  {{< tab >}}
Download `RFSwift-Setup-<version>-x64.exe` (or `-arm64`) from the [releases page](https://github.com/PentHertz/RF-Swift/releases) and run it. Under a single UAC prompt it installs what you tick: WSL 2 with WSLg, usbipd-win for USB passthrough, Docker Desktop or Podman Desktop (or none for a Nix-only setup), optionally Nix inside WSL 2, and RF Swift with its Start Menu entries. `RFSwift-<version>-<arch>.msi` installs RF Swift alone for managed deployments.

Then open **RF Swift Console** or **RF Swift Workbench** from the Start Menu, or type `rfswift` in any terminal. Details, silent switches and the trust model: [Windows](/docs/guide/windows).
  {{< /tab >}}
{{< /tabs >}}

{{< callout emoji="🐉" >}}
**Already on Kali, Parrot, BlackArch or DragonOS?** Keep it. RF Swift installs inside the distribution like on any Linux (Kali gets its own `docker.io` package), and the Nix engine adds pinned per-engagement environments, single tools on demand and the `--isolate` jail without touching the distribution's packages: `rfswift host setup --engine none --nix yes`, then `rfswift env run sdr_light sdrpp`. See [Keep your distribution, add RF Swift](/docs/comparisons#complete-the-distribution-you-already-run).
{{< /callout >}}

## Choosing an engine

| | Docker | Podman | Lima | Nix |
|---|---|---|---|---|
| **What it is** | Client-server daemon | Daemonless, rootless by default | Docker inside a QEMU VM (macOS) | Native, pinned tool environments |
| **Root required** | Daemon runs as root (join the `docker` group) | No | No | No (udev rules for hardware) |
| **USB hardware** | Linux; Windows via usbipd | Linux (host udev rules); Windows via usbipd | macOS hot-plug | Direct |
| **Best for** | Broad ecosystem, Windows and macOS | Security-focused, air-gapped, shared machines | macOS with RF hardware | Laptops without a container engine, lowest latency to hardware, GPU |

RF Swift auto-detects Docker, Podman and Lima. Override with `--engine`, `RFSWIFT_ENGINE`, or `engine =` in `config.ini`. All engines can coexist and the Workbench lists their targets side by side. See [engine](/docs/commands/engine), [Using Podman](/docs/guide/podman) and [Nix engine](/docs/guide/nix-engine).

### Engine setup by hand

{{< tabs items="Docker,Podman,Nix" >}}
  {{< tab >}}
```bash
curl -fsSL https://get.docker.com | sudo sh      # or your distribution's package
rfswift host docker-access                       # docker group + socket ACL, no logout needed
docker run hello-world
```

Kali installs `docker.io` from its own repository (Docker's script refuses it). Docker Desktop on macOS and Windows needs no group setup.
  {{< /tab >}}
  {{< tab >}}
```bash
sudo apt install podman slirp4netns fuse-overlayfs uidmap   # Debian / Ubuntu
sudo dnf install podman slirp4netns fuse-overlayfs          # Fedora / RHEL
sudo pacman -S podman slirp4netns fuse-overlayfs crun       # Arch
brew install podman                                         # macOS (RF Swift runs 'podman machine init/start' for you)

sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER
sudo loginctl enable-linger $USER                           # containers survive logout
rfswift host udev                                           # your user may open RF hardware
podman run hello-world
```
  {{< /tab >}}
  {{< tab >}}
```bash
sh <(curl -L https://nixos.org/nix/install) --daemon        # or: rfswift host setup --nix yes
rfswift container create --engine nix                       # wizard
```

On Windows: `rfswift env wsl setup`. Details in the [Nix engine guide](/docs/guide/nix-engine).
  {{< /tab >}}
{{< /tabs >}}

## Check the host

```bash
rfswift doctor
```

The doctor lists every engine and its service, Docker access, the host udev rules, the Nix engine (and its WSL 2 backend on Windows), the Nix jail, the Lima VM, images, X11 and `xhost`, the audio server, USB devices, the config file and kernel modules. Each failing row names the command that fixes it.

## Verifying downloads

```bash
gh attestation verify rfswift_Linux_x86_64.tar.gz --repo PentHertz/RF-Swift
```

Every release asset carries a Sigstore build-provenance attestation proving it was built by the official release workflow from a specific commit. The installer runs this check when a recent, logged-in `gh` is available and always verifies the SHA-256 manifest.

## Next steps

{{< cards >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Pull an image and run your first container or environment" >}}
  {{< card link="/docs/guide/workbench" title="Workbench" icon="desktop-computer" subtitle="The assessment GUI" >}}
  {{< card link="/docs/development" title="Developing and contributing" icon="document-text" subtitle="Compile the binaries, build images, contribute" >}}
{{< /cards >}}

## Troubleshooting

1. Run `rfswift doctor`; it points at the missing piece.
2. Check the [GitHub issues](https://github.com/PentHertz/RF-Swift/issues) for known problems, and join the [Discord](https://discord.gg/NS3HayKrpA).
3. Verify the engine: `docker run hello-world` or `podman run hello-world`.
4. Docker "permission denied" on the socket: `rfswift host docker-access`.
5. Podman "`/` is not a shared mount": `sudo mount --make-rshared /`.
6. Podman short-name resolution: use the full name, `docker.io/penthertz/rfswift_resolute:sdr_light`, or set `unqualified-search-registries = ["docker.io"]` in `/etc/containers/registries.conf`.
7. Image pull fails with `invalid username/password`: a stale `docker login` for Docker Hub; the message names the credential file and the `logout` command.
8. `rfswift` still runs an old copy after a package install: the installer offers to remove `/usr/local/bin/rfswift` and `~/.rfswift/bin`; check `which -a rfswift`.
