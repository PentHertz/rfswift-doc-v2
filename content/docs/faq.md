---
title: FAQ & troubleshooting
description: Answers to the questions newcomers ask most, and fixes for the problems people hit most, grouped by symptom.
level: beginner
weight: 8
---

The first half of this page answers common questions. The second half is a troubleshooting guide: find your symptom, apply the fix. If your problem isn't here, the end of the page says where to ask.

## Questions

### Do I need to know Docker or Linux?

No. The installer sets up the container engine for you, and the [Workbench](/docs/guide/workbench/) lets you create and open labs without typing commands. If you prefer the terminal, the [Quick start](/docs/quick-start/) needs a handful of commands, each explained.

### Should I use the CLI or the Workbench?

Either. They manage the same labs. The Workbench adds missions, notes, findings, captures and reports; the CLI (`rfswift`) is best for scripting and remote machines. You can switch between them at any time.

### Does the Workbench need VS code or another editor?

No. The Workbench is a completely standalone desktop app: no VS Code, no IDE, no plugins, no browser extension. It installs with RF Swift and needs nothing else.

### Do I have to download a whole toolbox image?

No. A Nix environment in **lazy mode** installs nothing up front: each tool is fetched the first time you run it, then pinned. Use `--lazy` on the command line or tick **Lazy tools** in the Workbench:

```bash
rfswift container create --engine nix -i sdr_light -n radio --lazy
```

To try a single tool without creating anything: `rfswift env run sdr_light sdrpp`. See [Nix engine](/docs/guide/nix-engine/).

### Does it work on Windows and macOS?

Yes. On Windows, one installer sets up WSL 2, USB passthrough and the engine. On macOS, use Homebrew or the signed disk image, then pick your engine: Docker Desktop or Podman for containers, **Lima** when containers need your USB radio, or **Nix** to run the tools natively (the lightest option, with direct USB access). Some hardware features differ per system: see [Will it run on my computer?](/docs/supports/) and [Known limits](/docs/guide/limitations/).

### Does it run on a Raspberry Pi or other small boards?

Yes. Images are published for x86_64, ARM64 and RISC-V64, and boards such as the Raspberry Pi 5, Milk-V Jupiter, Orange Pi RV2 and Radxa ROCK 5B+ are tested. On boards with little memory, **Podman** avoids a background daemon and the **Nix engine** avoids image layers altogether. The full list is in [Will it run on my computer?](/docs/supports/)

### How is it different from Kali, Parrot or DragonOS? Can I keep my distribution?

RF Swift isn't meant to replace them. A distribution is a whole operating system with its tools; RF Swift runs on the system you already use and gives each job its own environment. You don't have to choose: RF Swift installs inside Kali, Parrot, BlackArch or DragonOS like on any Linux, and its Nix engine adds tools without touching the distribution's packages. On a plain, freshly installed system, one command brings the whole tool set. See [RF Swift and dedicated RF distributions](/docs/comparisons/).

### Do I need Python or other dependencies?

No. RF Swift is a single self-contained binary: no Python, pip or virtual environment to manage on your computer. The installer adds the engine you choose (Docker, Podman, Lima or Nix) and the few host tools labs need for display and sound. The Workbench is a standalone desktop app.

### Can I control a lab machine remotely?

Yes. The remote agent is built into the same `rfswift` binary. Run it on a lab server or a small board next to your antennas, then drive it from the Workbench on your laptop over mutual TLS. See [Remote agent](/docs/guide/remote-agent/).

### Containers or Nix: which engine should I pick?

- **Docker or Podman (containers)**: the default. Each lab is isolated from your system and from the others; Podman runs without admin rights.
- **Nix**: the same tools installed natively, with no container engine. Closest to the hardware, handy on a laptop without Docker, and the lightest option in lazy mode (`--lazy`), where each tool is fetched on first use. An optional jail (`--isolate`) hides your files from the tools. A great fit for macOS.
- **Lima**: on macOS, when you want containers with USB hardware.

Not sure? Keep what the installer set up. [Choose your engine](/docs/engines/) compares all four in plain words.

### How much disk space do I need?

Plan for **10 GB** free, and **20 GB or more** for several toolboxes. Base images take 2 to 5 GB, specialised ones 5 to 10 GB, and the big suites (`sdr_full`, `telecom_5G`) 10 to 20 GB. Related toolboxes share their common layers, so `sdr_light` plus `sdr_full` uses much less than the sum of both. Remove what you no longer use with `rfswift container rm -c NAME` and `rfswift image rm`.

### Where are my files?

In your **workspace**: `~/rfswift-workspace/<lab name>/` on your computer, visible as `/workspace` inside the lab. It stays on your computer after you stop or delete the lab. See [Files & devices](/docs/guide/sharing-files/).

### Can I use it without internet access?

Yes. You need the internet to install RF Swift and download toolboxes; after that, everything runs offline with `rfswift -q ...` (disconnected mode: no update check, no network query). For a machine that is never online, follow [Offline / air-gapped install](/docs/air-gapped-installation/) to export images or Nix environments and install them offline.

### How do I update RF Swift and the toolboxes?

- **RF Swift itself**: `rfswift update`. If you installed a deb, rpm, pacman or Homebrew package, update it with your package manager instead (`rfswift update` tells you so).
- **A toolbox**: `rfswift image local` shows which images have an update available; pull it again with `rfswift image pull -i sdr_full`.
- **An existing lab**: `rfswift container upgrade -c NAME` re-creates it from the newer image (`-r /root/captures` keeps a directory). Nix environments use `rfswift env update NAME`.

### My old commands (`rfswift run`, `rfswift exec`) still work?

Yes. RF Swift v4 grouped the commands by resource (`rfswift container create`, `rfswift container shell`, `rfswift image pull`, ...), but every previous command keeps working and prints a notice with its new spelling. The full mapping is in the [command reference](/docs/commands/).

## Troubleshooting

### Start with `rfswift doctor`

```bash
rfswift doctor
```

It checks the engines, display, sound, USB, udev rules, the Nix engine and the configuration file, and every failed line names the command that fixes it. On a Linux desktop, `rfswift host setup` walks through all the one-time host steps, asking before each one. The Workbench's **Engine doctor** shows the same checks with buttons.

### Docker says "permission denied"

Your user isn't allowed to talk to the Docker socket yet. Fix it without logging out:

```bash
rfswift host docker-access
```

It adds you to the `docker` group and grants you access to the socket right away. Members of the `docker` group are root-equivalent on the host.

### Podman: "`/` is not a shared mount" or short-name errors

```bash
sudo mount --make-rshared /
```

For short-name resolution errors, use the full image name (`docker.io/penthertz/rfswift_resolute:sdr_light`), or set `unqualified-search-registries = ["docker.io"]` in `/etc/containers/registries.conf`. Rootless Podman also needs your subordinate ID ranges: see [Quick start, step 1](/docs/quick-start/#check-that-your-computer-is-ready).

### Image pull fails with "invalid username/password"

A stale `docker login` for Docker Hub is getting in the way. The error message names the credential file and the `logout` command to run; after logging out, pull again.

### An old version of `rfswift` still runs

After switching to a package install, an older copy from a tarball install may come first in your `PATH`. Check with:

```bash
which -a rfswift
```

The installer offers to remove the old copies in `/usr/local/bin/rfswift` and `~/.rfswift/bin`.

### My RTL-SDR is busy or not found (Linux)

Linux may have claimed the dongle for digital TV (DVB-T). Block that driver on your computer, then restart it:

```bash
echo "blacklist dvb_usb_rtl28xxu" | sudo tee /etc/modprobe.d/blacklist-dvb_usb_rtl28xxu.conf
```

### My USB device is not visible in the lab

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
- The USB tree is shared by default, and a device plugged in after the lab was created appears the next time you open a shell in it (`rfswift container shell -c NAME`).
- **Rootless Podman and Nix** run the tools as your user, who needs permission to open the hardware. Install the host rules, then log out and in (or `newgrp plugdev`) and re-plug the device:

```bash
rfswift host udev
```

- **Serial devices** (`/dev/ttyACM0`, `/dev/ttyUSB0`, ...): add them to an existing lab with `rfswift config bindings add -c NAME -d -t /dev/ttyACM0`. They are hot-pluggable on Docker and rootful Podman; rootless Podman needs them plugged in when the lab is created.
- Inside a container, a USB device works only when `/dev/bus/usb` is mapped **and** the rule `c 189:* rwm` is allowed. Both are defaults; privileged mode is not required.
  {{< /tab >}}
  {{< tab >}}
Labs run inside WSL 2, which cannot see your USB ports until you forward a device with usbipd-win:

```powershell
rfswift usb status
rfswift usb attach
```

The first time you share a device, Windows asks for administrator approval once; attaching and detaching never do. Give the device back to Windows with `rfswift usb detach --busid <id>`. See [Windows](/docs/guide/windows/).
  {{< /tab >}}
  {{< tab >}}
Docker Desktop and Podman on macOS cannot receive USB devices. Use the **Lima** engine: install it with `brew install qemu lima`, attach the device to the VM, and create the lab with `--engine lima`:

```bash
rfswift usb attach
rfswift usb vm-devices                  # what the VM currently sees
rfswift --engine lima container create -i sdr_light -n sdr_work
```

See [usb](/docs/commands/usb/).
  {{< /tab >}}
{{< /tabs >}}

### PlutoSDR is not found

If `iio_info -s` does not list your PlutoSDR and mentions that the Avahi daemon is not running, start the discovery service. On a Linux computer, make sure `avahi-daemon` runs on the host. Or, inside the lab, run the helper script that ships in RF Swift containers:

```bash
avahicontainer_start
iio_info -s
```

Details: [Avahi container start script](/docs/container_scripts/avahi_inside_container/).

### No sound

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
Labs play sound through your computer's PulseAudio or PipeWire server. RF Swift loads the module it needs every time a lab starts; to do it by hand, run this **on your computer**, as your user (never as root):

```bash
rfswift host audio enable
```

If `pactl` is missing, the message names the package to install.
  {{< /tab >}}
  {{< tab >}}
Sound comes from WSLg, with nothing to install. If `rfswift doctor` cannot find the WSLg sockets, update and restart WSL:

```powershell
wsl --update
wsl --shutdown
```
  {{< /tab >}}
  {{< tab >}}
Labs use PulseAudio from Homebrew. Run `rfswift host audio enable` on your Mac: it starts PulseAudio through Homebrew services and, when Lima runs, lets the VM reach it.
  {{< /tab >}}
{{< /tabs >}}

### A graphical tool doesn't open

- **Linux**: tools open on your X11 display. `rfswift doctor` checks that `DISPLAY` is set and that `xhost` is installed. If a window still doesn't appear, allow local connections with `xhost +local:`.
- **macOS**: windows open through XQuartz, which must be installed. Images built before RF Swift switched macOS to EGL fail with `GLX: Failed to create context`; with those, use `--desktop` (a desktop in your browser).
- **Windows**: windows open through WSLg. If `rfswift doctor` cannot find the WSLg sockets, run `wsl --update` then `wsl --shutdown`. For a Nix environment whose tool shows only a taskbar icon, `rfswift env wsl display-reset` helps.
- **Headless or over SSH**: create the lab with `--desktop` to get a desktop in your web browser (`http://127.0.0.1:6080`), or connect with `ssh -X`.

### The Nix jail (`--isolate`) fails on Ubuntu 24.04 or later

The error is `bwrap: setting up uid map: Permission denied`. Ubuntu 24.04+ restricts the user namespaces the jail needs. Fix it once:

```bash
rfswift host isolate
```

It installs the distribution's bubblewrap and its AppArmor profile, leaving the restriction in place for every other program. Running RF Swift with `sudo` is **not** the fix.

### Samples drop or the audio stutters during captures

Buffer underruns and dropped samples usually go away with realtime mode: create the lab with `--realtime`, or turn it on for an existing one with `rfswift realtime enable -c NAME`.

## Still stuck?

- Ask the community on [Discord](https://discord.gg/NS3HayKrpA). Include the output of `rfswift doctor`: it answers most first questions.
- Search or open an issue on [GitHub](https://github.com/PentHertz/RF-Swift/issues).
- Check [Known limits](/docs/guide/limitations/): some combinations of system, engine and hardware cannot do everything, and that page lists them.
