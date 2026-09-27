---
title: Install RF Swift
linkTitle: Install
description: One installer per system sets up RF Swift and the engine it needs. Pick your system below; it takes about five minutes.
level: beginner
weight: 5
---

The recommended way for each system is shown first. You can accept the installer's defaults, and change any choice later. The current release is **v4.0.2**.

{{< callout type="beginner" title="Before you start" >}}
Check that your computer is supported: [Will it run on my computer?](/docs/supports/) Unsure what an "engine" is? [Key ideas](/docs/concepts/#engine) explains it in one paragraph. You can accept the installer's defaults.
{{< /callout >}}

## Install

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
**1. Open a terminal and paste this line:**

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

**2. Answer a few questions.** The defaults are fine for most people. The installer asks:

- which **release channel** to use: stable (recommended) or the development prerelease;
- **what to install**: the `rfswift` command line, the Workbench desktop app, or both;
- **how to install it**: a native package (deb, rpm or pacman) when your system allows it, otherwise a folder of your choice;
- which **engine** to install if you have none: Docker, Podman, both, or skip;
- whether to add **Nix** for the native engine, and its isolation helper;
- whether to install the **udev rules** that let your user open radio hardware, and set up Docker access, display and sound.

Every download is checked against the release's SHA-256 manifest before it is used.

**3. Run `rfswift`.** The first time, it offers to create its configuration file with the default values. Answer `y`.
  {{< /tab >}}
  {{< tab >}}
**The disk image: no terminal needed.**

1. Download `rfswift_Darwin_universal.dmg` from the [releases page](https://github.com/PentHertz/RF-Swift/releases/latest) (it works on Intel and Apple Silicon Macs).
2. Open it and drag **rfswift-workbench.app** to Applications.
3. Double-click **Install RF Swift CLI** next to it: it copies the `rfswift` command to `/usr/local/bin`.
4. Double-click **RF Swift Setup**: it installs and selects your container engine.
5. Open the Workbench from Applications, or type `rfswift` in a terminal.

Everything in the image is signed and notarized by Apple, so macOS opens it without a warning.

**Prefer Homebrew?** This installs the same signed command line and Workbench, then picks your engine:

```bash
brew install --cask penthertz/rfswift/rfswift
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/main/scripts/setup-macos.sh" | bash
```

The one-line Linux installer works on macOS too.

{{< callout type="info" title="Radios and graphical tools on a Mac" >}}
- **USB radios**: Docker Desktop and Podman on macOS can't pass USB devices to a lab. Two good options: the **Nix** engine, which runs the tools natively with direct USB access (see [Nix engine](/docs/guide/nix-engine/)), or the **Lima** engine for containers: `brew install qemu lima`. See [usb](/docs/commands/usb/) and [engine](/docs/commands/engine/).
- **Graphical tools** such as SDR++ need XQuartz; the `scripts/setup-xquartz-macos.sh` script of the RF Swift repository configures it.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
**The installer bundle: one click, one administrator prompt.**

1. Download `RFSwift-Setup-<version>-x64.exe` (or `-arm64.exe` on an ARM PC) from the [releases page](https://github.com/PentHertz/RF-Swift/releases/latest). Or fetch it from PowerShell:

   ```powershell
   $setup = (Invoke-RestMethod https://api.github.com/repos/PentHertz/RF-Swift/releases/latest).assets | Where-Object name -like 'RFSwift-Setup-*-x64.exe'
   Invoke-WebRequest $setup.browser_download_url -OutFile RFSwift-Setup.exe; .\RFSwift-Setup.exe
   ```

2. Run it and tick what you want. The defaults suit most people:
   - **WSL 2 with WSLg**: the Linux layer of Windows where your labs run, with display and sound;
   - **usbipd-win**: forwards your USB radios to the labs;
   - **a container engine**: Docker Desktop (default), Podman Desktop, "I already have one", or "No container engine, Nix only";
   - optionally **Nix in WSL 2** for the native engine.

   Everything installs under a single administrator (UAC) prompt.
3. Open **RF Swift Console** or **RF Swift Workbench** from the Start Menu, or type `rfswift` in any terminal.

Docker Desktop needs a paid subscription in larger organisations; Podman Desktop is the open-source alternative and works just as well. Managed deployments (MSI, silent install): see [Windows](/docs/guide/windows/).
  {{< /tab >}}
{{< /tabs >}}

## Check that it worked

```bash
rfswift --version
rfswift doctor
```

`rfswift --version` prints the installed version. `rfswift doctor` checks your system: the engines, USB, display, sound, the configuration file and more. **Each failing line names the command that fixes it.**

{{< callout type="tip" title="On a Linux desktop" >}}
Run `rfswift host setup` once. It walks you through the optional host steps (udev rules for radio hardware, installing an engine, Nix, Docker access, the Nix isolation jail) and asks before each one.

If Docker says "permission denied", run `rfswift host docker-access`: it gives your user access right away, with no logout. Members of the `docker` group are root-equivalent on the host.
{{< /callout >}}

{{< callout type="info" title="Already on Kali, Parrot, BlackArch or DragonOS?" >}}
Keep it. RF Swift installs inside the distribution like on any Linux (Kali gets its own `docker.io` package). The Nix engine adds pinned per-engagement environments, single tools on demand and the `--isolate` jail without touching the distribution's packages: `rfswift host setup --engine none --nix yes`, then `rfswift env run sdr_light sdrpp`. See [Keep your distribution, add RF Swift](/docs/comparisons/#complete-the-distribution-you-already-run).
{{< /callout >}}

## What's next

{{< cards >}}
  {{< card link="/docs/quick-start/" title="Quick start" icon="rocket-launch" subtitle="Download a toolbox and open your first lab." tag="Beginner" >}}
  {{< card link="/docs/first-signal/" title="Tutorial: your first signal" icon="broadcast" subtitle="Plug in an SDR and listen to a real transmission." tag="Beginner" >}}
  {{< card link="/docs/guide/workbench/" title="Tour the Workbench" icon="desktop" subtitle="The graphical way to use RF Swift." tag="Beginner" >}}
{{< /cards >}}

## Advanced installation

You don't need this section for a normal install. It covers unattended installs, native packages, choosing and setting up an engine yourself, and verifying downloads.

### Review the script before running it

{{< callout type="warning" >}}
Piping a script into a shell runs it without review. To stay in control, download `get_rfswift.sh` from the official repository, read it, and run the local copy; or use the native packages below. See [Security](/docs/security/audit/) for the trust model.
{{< /callout >}}

The script also works with `wget`:

```bash
wget -qO- "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

On Debian, where the first user is not in `sudo`, the installer offers the fix or runs from a root shell (`su -`). With a recent, logged-in GitHub CLI it also offers to check the Sigstore build-provenance attestation.

### Unattended installation

Every installer question can be answered up front with an environment variable:

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

On Linux the Workbench comes as a portable AppImage or a smaller native build. On macOS the script can also install Lima for USB passthrough.

### Native Linux packages

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

The wizard also offers to install Docker and/or Podman from your distribution, or Nix. A packaged `rfswift` is upgraded with the next package; `rfswift update` says so instead of overwriting it. The installer removes the copies an earlier tarball install left in `/usr/local/bin` or `~/.rfswift/bin` when you agree. Details: [host](/docs/commands/host/).

### Choosing an engine

| | Docker | Podman | Lima | Nix |
|---|---|---|---|---|
| **What it is** | Client-server daemon | Daemonless, rootless by default | Docker inside a QEMU VM (macOS) | Native, pinned tool environments |
| **Root required** | Daemon runs as root (join the `docker` group) | No | No | No (udev rules for hardware) |
| **USB hardware** | Linux; Windows via usbipd | Linux (host udev rules); Windows via usbipd | macOS hot-plug | Direct |
| **Best for** | Broad ecosystem, Windows and macOS | Security-focused, air-gapped, shared machines | macOS with RF hardware | Laptops without a container engine, lowest latency to hardware, GPU |

The benefits and trade-offs of each, in plain words: [Choose your engine](/docs/engines/). RF Swift auto-detects Docker, Podman and Lima. Override with `--engine`, `RFSWIFT_ENGINE`, or `engine =` in `config.ini`. All engines can coexist and the Workbench lists their targets side by side. See [engine](/docs/commands/engine/), [Podman](/docs/guide/podman/) and [Nix engine](/docs/guide/nix-engine/).

### Setting up an engine by hand

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

On Windows: `rfswift env wsl setup`. Details in the [Nix engine guide](/docs/guide/nix-engine/).
  {{< /tab >}}
{{< /tabs >}}

### Verifying downloads

```bash
gh attestation verify rfswift_Linux_x86_64.tar.gz --repo PentHertz/RF-Swift
```

Every release asset carries a Sigstore build-provenance attestation proving it was built by the official release workflow from a specific commit. The installer runs this check when a recent, logged-in `gh` is available and always verifies the SHA-256 manifest.

### Troubleshooting the installation

More answers in [FAQ & troubleshooting](/docs/faq/).

1. Run `rfswift doctor`; it points at the missing piece.
2. Check the [GitHub issues](https://github.com/PentHertz/RF-Swift/issues) for known problems, and join the [Discord](https://discord.gg/NS3HayKrpA).
3. Verify the engine: `docker run hello-world` or `podman run hello-world`.
4. Docker "permission denied" on the socket: `rfswift host docker-access`.
5. Podman "`/` is not a shared mount": `sudo mount --make-rshared /`.
6. Podman short-name resolution: use the full name, `docker.io/penthertz/rfswift_resolute:sdr_light`, or set `unqualified-search-registries = ["docker.io"]` in `/etc/containers/registries.conf`.
7. Image pull fails with `invalid username/password`: a stale `docker login` for Docker Hub; the message names the credential file and the `logout` command.
8. `rfswift` still runs an old copy after a package install: the installer offers to remove `/usr/local/bin/rfswift` and `~/.rfswift/bin`; check `which -a rfswift`.
