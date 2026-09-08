---
title: host
weight: 22
prev: /docs/commands/log
next: /docs/commands/usb
---

# rfswift host

Configure the host for containers and native environments: the udev rules that let your user open RF hardware, Docker socket access without logging out, the Nix jail prerequisites, cleanup of stray device directories, and the host audio server for container sound.

## Synopsis

```bash
rfswift host setup [--yes] [--udev ask|yes|no] [--engine ask|docker|podman|both|none] [--nix ask|yes|no] [--docker-access ask|yes|no] [--isolate ask|yes|no]
rfswift host udev [--list] [--remove] [--json] [-y]
rfswift host docker-access [--status] [--json] [-y]
rfswift host isolate [--status] [--sysctl] [--json] [-y]
rfswift host devclean [--list] [-y]
rfswift host audio enable [-s tcp:127.0.0.1:34567]
rfswift host audio unload
```

Every privileged step runs in **one `sudo` call, after asking**. Nothing is applied by the packages themselves.

---

## host setup (Linux)

The wizard the deb, rpm and pacman packages point at after installation, and the first thing to run on a fresh Linux desktop. It asks each step before running it:

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

`--yes` takes every recommended default (udev yes, Docker access yes, isolation yes; the engine step only with `--engine`). The first interactive run of a packaged `rfswift` offers this wizard by itself.

## host udev (Linux)

Docker runs containers as root and needs no udev setup. Rootless Podman and native Nix environments run as your user and cannot open root-owned USB nodes, so SDR, RFID, Bluetooth and debug hardware fails with "permission denied" until rules on the **host** grant access (rules inside a container are never evaluated).

```bash
rfswift host udev            # show the state, offer to install
rfswift host udev --list     # only show
rfswift host udev --yes      # install without asking (scripts)
rfswift host udev --remove   # remove what RF Swift installed
```

The rules ship as a reference copy in `/usr/share/rfswift/udev/70-rfswift.rules` and inside the binary; this command installs them into `/etc/udev/rules.d`, creates the `plugdev` group, adds you to it and reloads and re-triggers udev. Nodes get mode `0660`, group `plugdev` and the systemd `uaccess` tag (a seat ACL for the logged-in user), never world-writable permissions; serial ports keep the `dialout` group. Log out and in (or `newgrp plugdev`) after the first install, then re-plug the device. The Nix engine has its own per-environment variant, `rfswift env udev`, for the rules the environment's packages ship.

## host docker-access (Linux)

The Docker socket belongs to `root:docker`. Being added to the `docker` group only counts from the next login; this command adds you **and** puts an ACL for you on the socket so Docker works right away (the ACL lasts until the daemon recreates the socket, by which time the group is active).

```bash
rfswift host docker-access            # show the state, offer to fix it
rfswift host docker-access --status   # only show
rfswift host docker-access --yes      # fix without asking
```

{{< callout type="warning" >}}
Members of the `docker` group are root-equivalent on the host.
{{< /callout >}}

## host isolate (Linux)

`rfswift container create --engine nix --isolate` hides your home and the host filesystem from a Nix environment with a bubblewrap jail. bubblewrap must be able to create a user namespace as your user, and Ubuntu 24.04+ restricts that with AppArmor: only a profiled `/usr/bin/bwrap` may, so the jail otherwise fails with `bwrap: setting up uid map: Permission denied`.

```bash
rfswift host isolate            # show what is in the way, offer the fix
rfswift host isolate --status   # only show
rfswift host isolate --yes      # apply without asking
rfswift host isolate --sysctl   # last resort, see below
```

The targeted fix installs the distribution's bubblewrap package when the bwrap in use is another one (a Nix profile's, a nixpkgs build), then the `bwrap-userns-restrict` AppArmor profile (loaded from `/etc/apparmor.d`, else copied from the `apparmor-profiles` extras). The restriction stays in force for every other program. A Debian kernel with `kernel.unprivileged_userns_clone=0` gets the distribution default back. `--sysctl` lifts Ubuntu's restriction for **every** program (`kernel.apparmor_restrict_unprivileged_userns=0`, persisted under `/etc/sysctl.d`), which weakens the host; use it only when the profile route is impossible. `rfswift doctor` reports the jail state and the Workbench engine doctor has an "Enable sandbox" button for the same fix.

## host devclean (Linux)

A container that bind-mounted a device node (`/dev/ttyACM0` listed under its volumes) while the device was unplugged made Docker or Podman create an empty, root-owned directory in its place; the device then never reappears under that name. RF Swift no longer creates such mounts; this command cleans up the ones that exist.

```bash
rfswift host devclean          # list, then offer to remove
rfswift host devclean --list   # only list
rfswift host devclean --yes    # remove without asking
```

## host audio (Linux, macOS)

Container sound goes through the host PulseAudio or PipeWire server: RF Swift loads `module-native-protocol-tcp` on the port of `[audio] pulse_server` (default `tcp:127.0.0.1:34567`, local connections only) and containers get `PULSE_SERVER` pointing at it. `rfswift container create` and the Workbench load the module automatically at every start; these commands do it by hand.

```bash
rfswift host audio enable                          # as your user, never root
rfswift host audio enable -s tcp:127.0.0.1:34568
rfswift host audio unload
```

`enable` detects PulseAudio or PipeWire, starts it when needed, and is idempotent: when the module already listens on the port it says so. On macOS it starts PulseAudio through Homebrew services (cleaning stale runtime links) and, when Lima runs, widens the ACL to the VM subnets. `unload` removes every instance of the module, even without `pactl`. When `pactl` is missing the message names the package to install. Windows needs none of this: containers use WSLg's PulseAudio socket, and `host audio enable` only checks it.

{{< callout type="info" >}}
Binding the audio module to a network interface (`-s tcp:0.0.0.0:34567`) lets any machine on the network play through your speakers. Keep the default loopback address unless you know why you need otherwise.
{{< /callout >}}

## Related

- [doctor](/docs/commands/doctor) reports the state of every item above
- [usb](/docs/commands/usb) for USB passthrough on macOS and Windows
- [Nix engine](/docs/guide/nix-engine) for `--isolate` and `env udev`
- [Host actions](/docs/guide/host-actions)
