---
title: "What's new in v4.0 \"Nucleus\""
linkTitle: "What's new in v4.0"
description: "The Nix engine, the Workbench, the remote agent, a resource-first CLI, built-in audits and native installers."
weight: 3
---

RF Swift v4.0 is the biggest change since the project started. The current release is **v4.1.1**; what the releases after v4.0.2 added is in [Updates since v4.0.2](#updates-since-v402). v4.0 adds:

- a native **Nix engine** that runs the tool sets without containers;
- a desktop **Workbench** for assessments;
- a secure **remote agent** to drive a lab machine from your laptop;
- a resource-first CLI and built-in security audits;
- native packages and installers for the three operating systems;
- a long list of hardware fixes.

{{< callout type="info" title="In one line" >}}
The same RF and hardware lab, now as containers **or** native environments, on your machine **or** on a remote one, from the terminal **or** from a GUI.
{{< /callout >}}

**Highlights**

- [Nix engine](#nix-engine-native-environments): the tool sets without containers, pinned, with an on-demand (lazy) mode.
- [Workbench](#rf-swift-workbench): a standalone desktop app for missions, findings and reports.
- [Remote agent](#remote-agent): drive a lab machine from your laptop over mutual TLS.
- [Resource-first CLI](#resource-first-cli): `container`, `image`, `env`, `config`... Every old command still works.
- [Security built in](#security-built-in): `rfswift audit`, verified downloads, a hardened baseline.
- Native installers and packages for [Linux](#linux-packages-and-host-setup), [Windows](#windows) and [macOS](#macos), plus [hardware fixes](#hardware-fixes-that-matter-in-the-field).
- [Upgrading from v3.x](#upgrading-from-v3x) takes a few minutes.

## Updates since v4.0.2

Update with `rfswift update` (see [update](/docs/commands/update/)). Newest first.

### v4.1.1: Qubes OS, rootful Podman, SELinux and a safer update

- **Qubes OS.** `rfswift host qubes` checks a qube for RF Swift, and `rfswift host qubes setup` fixes what it finds in one root script that it prints first: the virtual USB bus for devices attached from sys-usb, persistent engine storage and Nix store across AppVM restarts, rootful Podman and Docker access for the user, a working Nix daemon for a Determinate Nix template, and the RTL-SDR DVB-T driver blacklisted. `rfswift doctor` and the Workbench (**Set up for Qubes**) show the same checks. See [Qubes OS](/docs/guide/qubes-os/).
- **Rootful Podman without sudo.** `podman_mode = rootful` in `[general]` (or `RFSWIFT_PODMAN_MODE`) drives the system Podman service through its socket, for rootful device access while audio, X11, home and workspaces stay yours. See [Podman](/docs/guide/podman/).
- **SELinux.** On an enforcing host, unprivileged containers are created with `label=disable` so they can read their workspace, the X11 socket and USB nodes. `[container] selinux_label = keep` (or `RFSWIFT_SELINUX_LABEL=keep`) opts out.
- **`rfswift update`** now updates the way RF Swift was installed (deb/rpm/pacman package through the system package manager, `brew upgrade --cask`, or the binary in place), after one Yes/No question, and verifies every download against the release's SHA-256 checksums. `--yes` skips the question, `--check` only looks.
- **USB hot-plug** with `rfswift run`/`container create`: device trees such as `/dev/bus/usb` are bind-mounted, so a dongle plugged in or forwarded later appears in the running container.
- **Audio under sudo** and after a reboot: `sudo rfswift run|exec` talks to your audio session, and `rfswift exec` reloads the audio server's TCP module when it is missing.

### v4.0.5: Workbench polish

- The image field of the create dialog suggests the images published on Docker Hub for your architecture (cached for 6 hours; **Refresh list** fetches it again).
- Agent settings take a program path for each coding-agent CLI, with **Browse…**, and the search now covers nvm, fnm, pnpm, yarn, deno and mise.
- Terminal zoom (Ctrl + / Ctrl - / Ctrl 0, Ctrl + wheel, pinch), and a progress bar while a container's configuration changes.
- `rfswift config bindings add -d` accepts a directory such as `/dev/bus/usb`.

### v4.0.4: new Nix environments and agents

- Nix catalog: `sdr_hacks` (repurposed chips as SDRs), `cyberether_release`, `telecom_5g_oai` (5G SA with OpenAirInterface) and `telecom_ltesniffer`.
- The Workbench hosts **OpenCode** and **Mistral Vibe** in missions, next to the other AI assistants.
- The `sdr_hacks` image is listed with the other toolboxes.

### v4.0.3: engine choice and Workbench updates

- When several engines are installed and none is set, the `rfswift run` wizard asks which one to use and can keep it. `rfswift engine set <auto|docker|podman|lima|nix>` sets it directly.
- The Workbench's Engine doctor shows a newer release and installs it after verifying its GitHub digest and Sigstore build provenance.
- A warning, with the fix, when `~/.config/rfswift` belongs to root after a `sudo rfswift` run.
- X11 fixes for GUI tools after a reboot (MIT-SHM, "Authorization required").

## Nix engine: native environments

`--engine nix` installs an RF Swift tool set straight onto the host as a reproducible, pinned Nix environment. No daemon, no container boundary: USB radios, audio and the GPU work with zero device plumbing.

```bash
rfswift container create --engine nix -i sdr_light -n mysdr    # or the wizard: rfswift container create --engine nix
rfswift env shell mysdr
rfswift env update --check mysdr && rfswift env update mysdr
rfswift env rollback mysdr
```

- Eager builds or **on-demand** tools (`--lazy`): each tool builds the first time it is called and is pinned for good.
- Transactional updates with **rollback generations**, a guided update wizard, `--tool` refresh of a single tool.
- `env install` adds any nixpkgs package to one environment or to a shared profile; `env search` finds tools in the curated set or all of nixpkgs; `env run` runs one tool without creating anything.
- **`--isolate`**: a bubblewrap jail on Linux and a Seatbelt sandbox on macOS that hides your home and the host filesystem while keeping USB, display and network. `rfswift host isolate` fixes Ubuntu 24.04+'s user-namespace restriction in one command.
- OpenGL on hosts that are not NixOS (Mesa from the same pin, or the matching NVIDIA libraries), `env gl --check` to probe it, `env udev` to install the hardware rules the environment's packages ship, Soapy modules found across tools.
- **Windows**: the engine runs inside a WSL 2 distribution that `rfswift env wsl setup` (or the installer) provisions; the same commands work from PowerShell and the Workbench. WSLg display and sound, usbipd radios and `env wsl display-reset` for a stuck display client.
- `env export` / `env import` move an environment (closure plus workspace) as one `.rfenv` archive.

Guide: [Nix engine](/docs/guide/nix-engine). Reference: [env](/docs/commands/env).

## RF Swift Workbench

A standalone desktop app (Linux, macOS, Windows) that turns targets into **missions**: one container or Nix environment per assessment. Nothing else to install: no editor, no plugins.

Each mission has dockable panels:

- **Notebook**, **Console** (terminals with asciinema recordings) and **Config & network**;
- **Findings** (pwndoc-compatible) and **Captures**, with an artifact decoder and an offline CyberChef;
- **Secrets** in the OS vault;
- an optional **coding-agent terminal** (Codex, Claude Code, Kimi Code, GLM) bridged over a mission-scoped MCP server.

Missions are created with the same options as the CLI (profiles, templates, devices, USB passthrough, Nix version picker, live build progress), configured afterwards, audited, exported as projects or archives, and reported.

Guide: [Workbench](/docs/guide/workbench), [AI assistant](/docs/guide/ai-assistant).

## Remote agent

`rfswift agent` serves a machine's engines to authenticated clients:

- TLS 1.3 with mandatory mutual TLS and pinned server certificates;
- encrypted private keys whose passwords live in the OS vault, and neutral certificate subjects;
- `certs client`, `certs export` and `certs import` move credentials between machines as passphrase-protected files.

The Workbench connects, lists every engine of the lab host, creates and configures missions there with live progress, opens terminals, audits, pulls images, reclaims space and registers remote artifacts as evidence.

Guide: [Remote agent](/docs/guide/remote-agent). Reference: [agent](/docs/commands/agent).

## Resource-first CLI

`rfswift --help` is now grouped (Containers, Images, Native Nix environments, Runtime configuration, Networking, Devices, Security, Remote access, System). The canonical commands are `rfswift container ...`, `rfswift image ...`, `rfswift env ...`, `rfswift config ...`, `rfswift system ...`, `rfswift host ...`, `rfswift usb ...`, `rfswift audit`, `rfswift agent`. **Every previous command keeps working** and prints a notice pointing at its new spelling. Man pages and completions ship with the Linux packages. See the [command reference](/docs/commands).

## Security built in

- `rfswift audit <target>` auto-detects a Nix environment (vulnix, syft, grype, osv-scanner, integrity, provenance, hygiene), a container image (trivy, grype) or a container (attack surface: privileges, host namespaces, sensitive mounts, capabilities, seccomp/AppArmor, devices, exposed ports, CVEs, attack-enabling binaries), with `json`, `html` and `pdf` reports and a `--fail-on` gate.
- The installer verifies every file's SHA-256 against the release manifest, rejects unsafe archive members, and offers Sigstore build-provenance verification. Releases carry attestations, the macOS image is Developer ID signed and notarized, Windows artifacts are Authenticode-signed when the secrets are configured.
- A dated security ground truth and hardened deployment baseline: [Security](/docs/security).

## Linux packages and host setup

- `rfswift` (CLI, man pages, completions) and `rfswift-workbench` ship as deb, rpm and pacman packages and pull in `xhost` and `pactl`.
- The host steps a package must not decide for you are asked for: `rfswift host setup` (udev rules for RF hardware, Docker and/or Podman from the distribution, Nix, Docker socket access without logging out, the Nix jail), or the single steps `host udev`, `host docker-access`, `host isolate`.
- `rfswift update` respects packaged installs.
- Rootless Podman keeps your groups inside containers.
- The installer gained stable and development channels, CLI/Workbench/both, native or AppImage Workbench, and environment variables for unattended runs.

## Windows

- A one-click **installer bundle** (`RFSwift-Setup-<version>-<arch>.exe`, x64 and arm64) installs WSL 2 with WSLg, usbipd-win, Docker Desktop or Podman Desktop (or none, "Nix only"), optionally Nix in WSL 2, and RF Swift itself under a single UAC prompt. An MSI covers enterprise deployment.
- USB passthrough was rebuilt on usbipd-win with least privilege (`rfswift usb list|attach|detach|bind|unbind|status|vm-devices`, one UAC prompt per device to share, unprivileged attach).
- Sound and display come from WSLg, with no PulseAudio install.
- The remote agent and interactive terminals work on Windows through ConPTY.

Guide: [Windows](/docs/guide/windows).

## macOS

- A Homebrew cask and a signed, notarized DMG with app-bundle launchers.
- XQuartz OpenGL fixed for SDR++ and every GLFW, Qt and SDL tool, by creating contexts through EGL.
- Lima USB passthrough with `rfswift usb` and automatic VM lifecycle; `rfswift engine lima set` for CPU, memory and disk.
- An opt-in krunkit VM for Vulkan GPU compute (`--gpu`).
- The Nix engine runs natively on macOS, with the Seatbelt `--isolate` jail for Nix environments.

## Hardware fixes that matter in the field

- **Serial hot-plug**: `/dev/ttyACM*`, `/dev/ttyUSB*` and `/dev/ttyAMA*` ports are attached on demand on Docker and rootful Podman; a reader plugged in after creation works at the next shell. `rfswift config serial-hotplug on|off` switches it per container.
- Pre-creation **device checks** list the devices an engine cannot map on this host, with the reason, and a **USB reachability** check says exactly what a container needs to open a device (mapping plus `c 189:* rwm`, no privileged mode).
- A device node bind-mounted while unplugged no longer leaves a root-owned directory behind; `rfswift host devclean` cleans up old ones.
- Container configuration edits (`rfswift config ...`, the Workbench Configure dialog) work again on Linux Docker by asking for root once; `--recreate` (commit and re-create) remains the way on Podman. Capability removal works, GPU requests survive re-creation, `config` accepts container IDs.
- Host audio is loaded automatically at every container start on Linux and macOS, and `host audio enable` is idempotent.
- The RFID template maps the console the Proxmark3 client needs; built-in profiles are refreshed automatically when RF Swift's copy was never edited.

## Upgrading from v3.x

1. **Update the CLI**: `rfswift update` on a tarball install, your package manager on a packaged one, or re-run the installer from [Getting Started](/docs/getting-started).
2. **Nothing to change in scripts**: the old commands keep working. Move to the new spellings at your pace (`rfswift container create` for `run`, `rfswift image pull` for `images pull`, ...).
3. **Linux desktops**: run `rfswift host setup` once to get the udev rules, Docker socket access and the Nix jail if you want them.
4. **Try the Nix engine** on a laptop that never had Docker: `rfswift host setup --engine none --nix yes`, then `rfswift container create --engine nix`.
5. **Windows**: install the new bundle; existing containers in Docker Desktop are untouched.

## Next steps

{{< cards >}}
  {{< card link="/docs/guide/nix-engine/" title="Nix engine" icon="snowflake" subtitle="Native, pinned tool environments, with a lazy mode" >}}
  {{< card link="/docs/guide/workbench/" title="Workbench" icon="desktop" subtitle="The standalone assessment app" >}}
  {{< card link="/docs/guide/remote-agent/" title="Remote agent" icon="broadcast" subtitle="Drive a lab machine securely" >}}
  {{< card link="/docs/commands/" title="Command reference" icon="book-open" subtitle="The v4 command tree" >}}
{{< /cards >}}
