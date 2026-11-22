---
title: "rfswift host"
linkTitle: "host"
navGroup: "Host & devices"
level: reference
description: "Prepare the host: udev rules, Docker access, the Nix jail, the audio server and Qubes OS."
weight: 60
---

`rfswift host` prepares your computer (the "host") for labs. It covers:

- the udev rules that let your user open RF hardware;
- Docker access without logging out;
- what the Nix `--isolate` jail needs;
- cleanup of stray device directories;
- the audio server that gives containers sound;
- the Qubes OS integration (USB from sys-usb, persistent engines, rootful Podman without sudo).

On a fresh Linux desktop, start with the guided setup:

```bash
rfswift host setup
```

## Synopsis

```bash
rfswift host setup [--yes] [--udev ask|yes|no] [--engine ask|docker|podman|both|none] [--nix ask|yes|no] [--docker-access ask|yes|no] [--isolate ask|yes|no]
rfswift host udev [--list] [--remove] [--json] [-y]
rfswift host docker-access [--status] [--json] [-y]
rfswift host isolate [--status] [--sysctl] [--json] [-y]
rfswift host devclean [--list] [-y]
rfswift host qubes [--json]
rfswift host qubes setup [-y] [--dry-run] [--no-...]
rfswift host audio enable [-s tcp:127.0.0.1:34567]
rfswift host audio unload
```

RF Swift asks before every privileged step, then runs it in **one `sudo` call**. Installing the packages never changes these settings by itself.

---

## host setup (Linux)

The guided setup. The deb, rpm and pacman packages point you to it after installation, and it is the first thing to run on a fresh Linux desktop. It asks before each step:

1. **udev rules**: RF Swift's rules for SDR, RF and hardware-security devices. Rootless Podman and Nix environments need them; Docker does not.
2. **engine**: install Docker and/or Podman from your distribution's repositories, or skip (Nix engine only).
3. **Nix**: install the native, daemon-backed Nix engine with flakes (Determinate installer, falling back to the official NixOS installer).
4. **Docker access**: add you to the `docker` group **and** make it effective in the current session with a socket ACL.
5. **isolation**: make the Nix engine's `--isolate` jail work (bubblewrap and, on Ubuntu 24.04+, its AppArmor profile).

```bash
rfswift host setup
rfswift host setup --yes --engine podman
rfswift host setup --udev no --engine none --nix yes --docker-access no
```

`--yes` accepts every recommended default: udev rules, Docker access and isolation. The engine step runs only when you pass `--engine`. The first time you run a packaged `rfswift` in a terminal, it offers this wizard by itself.

## host udev (Linux)

Use this if you run rootless Podman or Nix environments. Docker runs containers as root and needs no udev setup.

Rootless Podman and native Nix environments run as your user, and your user cannot open root-owned USB devices. SDR, RFID, Bluetooth and debug hardware then fails with "permission denied" until udev rules on the **host** grant access. Rules inside a container are never used.

```bash
rfswift host udev            # show the state, offer to install
rfswift host udev --list     # only show
rfswift host udev --yes      # install without asking (scripts)
rfswift host udev --remove   # remove what RF Swift installed
```

What the install does:

- copies the rules into `/etc/udev/rules.d` (a reference copy ships in `/usr/share/rfswift/udev/70-rfswift.rules` and inside the binary);
- creates the `plugdev` group and adds you to it;
- reloads udev and re-triggers it.

Devices get mode `0660`, the `plugdev` group and the systemd `uaccess` tag (an access rule for the logged-in user). They are never made writable by everyone. Serial ports keep the `dialout` group.

After the first install, log out and back in (or run `newgrp plugdev`), then unplug and replug the device.

The Nix engine has its own per-environment version, `rfswift env udev`, for the rules that an environment's packages ship.

## host docker-access (Linux)

Use this when Docker says "permission denied" on its socket.

The Docker socket belongs to `root:docker`. Joining the `docker` group normally only takes effect at your next login. This command adds you to the group **and** gives you access to the socket right away. That temporary access lasts until the Docker service recreates the socket, and by then your group membership is active.

```bash
rfswift host docker-access            # show the state, offer to fix it
rfswift host docker-access --status   # only show
rfswift host docker-access --yes      # fix without asking
```

{{< callout type="warning" >}}
Members of the `docker` group are root-equivalent on the host.
{{< /callout >}}

## host isolate (Linux)

Use this if the Nix jail fails with `bwrap: setting up uid map: Permission denied`, typically on Ubuntu 24.04 and later.

`rfswift container create --engine nix --isolate` hides your home and the host files from a Nix environment, using a bubblewrap jail. bubblewrap needs to create a user namespace as your user. Ubuntu 24.04 and later restrict that with AppArmor: only a `/usr/bin/bwrap` with an AppArmor profile is allowed to.

```bash
rfswift host isolate            # show what is in the way, offer the fix
rfswift host isolate --status   # only show
rfswift host isolate --yes      # apply without asking
rfswift host isolate --sysctl   # last resort, see below
```

What the fix does:

- If the bwrap in use is not the distribution's (for example one from a Nix profile or a nixpkgs build), it installs the distribution's bubblewrap package.
- It then installs the `bwrap-userns-restrict` AppArmor profile, from `/etc/apparmor.d` or, if missing, from the `apparmor-profiles` extras. The restriction stays in force for every other program.
- On a Debian kernel with `kernel.unprivileged_userns_clone=0`, it restores the distribution default.

`--sysctl` is the last resort. It lifts Ubuntu's restriction for **every** program (`kernel.apparmor_restrict_unprivileged_userns=0`, kept under `/etc/sysctl.d`), which weakens the host. Use it only when the profile route is impossible.

`rfswift doctor` reports the jail state, and the Workbench engine doctor offers the same fix as an **Enable sandbox** button.

## host devclean (Linux)

Use this if a serial device (for example `/dev/ttyACM0`) never shows up again under its usual name.

This happens when an older container bind-mounted a device node while the device was unplugged. Docker or Podman then created an empty, root-owned directory in its place, and the device can no longer appear under that name. RF Swift no longer creates such mounts; this command removes the leftovers.

```bash
rfswift host devclean          # list, then offer to remove
rfswift host devclean --list   # only list
rfswift host devclean --yes    # remove without asking
```

## host qubes (Qubes OS)

In a Qubes OS qube, USB devices come from sys-usb, so `/dev/bus/usb` only exists once a first device is attached, and a template-based AppVM loses `/etc` and the rootful engines' images at every restart. `rfswift host qubes` shows what is in the way; `rfswift host qubes setup` fixes it in one root script that it prints before asking. Outside Qubes OS both say there is nothing to do.

```bash
rfswift host qubes                   # show the state and what the setup would do
rfswift host qubes --json            # the same, as JSON
rfswift host qubes setup             # show the script, ask, apply
rfswift host qubes setup --dry-run   # only print the script
rfswift host qubes setup --yes --no-podman-socket
```

The setup:

- loads `vhci-hcd` at every start, so `/dev/bus/usb` exists and containers can be created before a device is attached;
- keeps `/var/lib/containers`, `/var/lib/docker` and `/nix` across restarts (bind-dirs);
- makes the rootful Podman socket usable by your user and sets `podman_mode = rootful`, so RF Swift and the Workbench run as you, without sudo, with rootful device access (skipped where root needs a password);
- with Docker installed, starts `docker.socket` at boot and gives you the socket (docker group plus an ACL), without restarting a running daemon;
- runs the Nix profile's own daemon when a Determinate Nix in the template is not visible from the AppVM;
- blacklists the DVB-T driver that claims RTL2832U dongles (`dvb_usb_rtl28xxu`);
- gives root-owned workspace folders back to you and drops `/dev/dri` (no GPU in a qube) from the default devices.

In an AppVM it writes `/rw/config/qubes-bind-dirs.d/50_rfswift.conf` and `/rw/config/rc.local.d/50-rfswift.rc` (delete them to undo); in a TemplateVM or StandaloneVM it writes `/etc` directly.

| Flag (`setup`) | Effect |
|---|---|
| `-y, --yes` | Apply without asking |
| `--dry-run` | Only print what would run |
| `--podman-socket` | Grant the rootful Podman socket even where root needs a password |
| `--no-podman-socket` | Leave the rootful Podman socket root-only (keep using sudo for USB work) |
| `--group NAME` | Group that owns the rootful Podman socket (default: your primary group) |
| `--no-docker-group` | Do not give you access to the Docker socket |
| `--no-docker-start` | Do not start Docker's socket at boot |
| `--no-persist` | Do not keep the rootful engines' storage across restarts |
| `--no-vhci` | Do not load `vhci-hcd` at boot |
| `--no-workspace` | Leave root-owned workspace folders as they are |
| `--no-rtl-blacklist` | Keep the DVB-T driver for RTL2832U dongles (TV use); native tools then cannot open them |

`rfswift doctor` shows the same checks, and the Workbench's Engine doctor has a **Set up for Qubes** button. The [Qubes OS guide](/docs/guide/qubes-os/) explains the whole workflow.

## host audio (Linux, macOS)

Containers play sound through your computer's PulseAudio or PipeWire server. RF Swift loads `module-native-protocol-tcp` on the port set by `[audio] pulse_server` (default `tcp:127.0.0.1:34567`, local connections only), and points the container's `PULSE_SERVER` at it.

`rfswift container create` and the Workbench load the module automatically every time a lab starts. Use these commands to do it by hand, for example after a sound problem:

```bash
rfswift host audio enable                          # as your user, never root
rfswift host audio enable -s tcp:127.0.0.1:34568
rfswift host audio unload
```

- `enable` detects PulseAudio or PipeWire and starts it if needed. Running it twice is safe: if the module already listens on the port, it says so.
- On macOS, it starts PulseAudio through Homebrew services (and cleans stale runtime links). When Lima is running, it also allows the VM's network to connect.
- `unload` removes every instance of the module, even without `pactl`.
- If `pactl` is missing, the message tells you which package to install.

Windows needs none of this: containers use WSLg's PulseAudio socket, and `host audio enable` only checks it.

{{< callout type="info" >}}
Binding the audio module to a network interface (`-s tcp:0.0.0.0:34567`) lets any machine on the network play through your speakers. Keep the default loopback address unless you know why you need otherwise.
{{< /callout >}}

## Related

- [doctor](/docs/commands/doctor) reports the state of every item above
- [usb](/docs/commands/usb) for USB passthrough on macOS and Windows
- [Nix engine](/docs/guide/nix-engine) for `--isolate` and `env udev`
- [Host actions](/docs/guide/host-actions)
