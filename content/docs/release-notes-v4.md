---
title: 🆕 What's new in v4.0 "Nucleus"
weight: 3
next: /docs/comparisons
prev: /docs/supports
cascade:
  type: docs
---

# RF Swift v4.0 "Nucleus"

RF Swift v4.0 (current release: **v4.0.2**) is the biggest change since the project started. It adds a native **Nix engine** that runs the tool sets without containers, a desktop **Workbench** for assessments, a secure **remote agent** to drive a lab machine from your laptop, a resource-first CLI, built-in security audits, native packages and installers for the three operating systems, and a long list of hardware fixes.

{{< callout emoji="⚡" >}}
**In one line:** the same RF and hardware lab, now as containers **or** native environments, on your machine **or** on a remote one, from the terminal **or** from a GUI.
{{< /callout >}}

## ❄️ Nix engine: native environments

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

## 🖥️ RF Swift Workbench

A desktop GUI (Linux, macOS, Windows) that turns targets into **missions**: one container or Nix environment per assessment, with dockable panels for the Notebook, Console (terminals with asciinema recordings), Config & network, Findings (pwndoc-compatible), Captures with an artifact decoder and an offline CyberChef, Secrets in the OS vault, and an optional coding-agent terminal (Codex, Claude Code, Kimi Code, GLM) bridged over a mission-scoped MCP server. Missions are created with the same options as the CLI (profiles, templates, devices, USB passthrough, Nix version picker, live build progress), configured afterwards, audited, exported as projects or archives, and reported.

Guide: [Workbench](/docs/guide/workbench), [AI assistant](/docs/guide/ai-assistant).

## 📡 Remote agent

`rfswift agent` serves a machine's engines to authenticated clients over TLS 1.3 with mandatory mutual TLS, pinned server certificates, encrypted private keys whose passwords live in the OS vault, and neutral certificate subjects. `certs client`, `certs export` and `certs import` move credentials between machines as passphrase-protected files. The Workbench connects, lists every engine of the lab host, creates and configures missions there with live progress, opens terminals, audits, pulls images, reclaims space and registers remote artifacts as evidence.

Guide: [Remote agent](/docs/guide/remote-agent). Reference: [agent](/docs/commands/agent).

## 🧭 Resource-first CLI

`rfswift --help` is now grouped (Containers, Images, Native Nix environments, Runtime configuration, Networking, Devices, Security, Remote access, System). The canonical commands are `rfswift container ...`, `rfswift image ...`, `rfswift env ...`, `rfswift config ...`, `rfswift system ...`, `rfswift host ...`, `rfswift usb ...`, `rfswift audit`, `rfswift agent`. **Every previous command keeps working** and prints a notice pointing at its new spelling. Man pages and completions ship with the Linux packages. See the [command reference](/docs/commands).

## 🛡️ Security built in

- `rfswift audit <target>` auto-detects a Nix environment (vulnix, syft, grype, osv-scanner, integrity, provenance, hygiene), a container image (trivy, grype) or a container (attack surface: privileges, host namespaces, sensitive mounts, capabilities, seccomp/AppArmor, devices, exposed ports, CVEs, attack-enabling binaries), with `json`, `html` and `pdf` reports and a `--fail-on` gate.
- The installer verifies every file's SHA-256 against the release manifest, rejects unsafe archive members, and offers Sigstore build-provenance verification; releases carry attestations, the macOS image is Developer ID signed and notarized, Windows artifacts are Authenticode-signed when the secrets are configured.
- A dated security ground truth and hardened deployment baseline: [Security](/docs/security).

## 🐧 Linux packages and host setup

`rfswift` (CLI, man pages, completions) and `rfswift-workbench` ship as deb, rpm and pacman packages and pull in `xhost` and `pactl`. The host steps a package must not decide for you are asked for: `rfswift host setup` (udev rules for RF hardware, Docker and/or Podman from the distribution, Nix, Docker socket access without logging out, the Nix jail), or the single steps `host udev`, `host docker-access`, `host isolate`. `rfswift update` respects packaged installs. Rootless Podman keeps your groups inside containers. The installer gained stable and development channels, CLI/Workbench/both, native or AppImage Workbench, and environment variables for unattended runs.

## 🪟 Windows

A one-click **installer bundle** (`RFSwift-Setup-<version>-<arch>.exe`, x64 and arm64) installs WSL 2 with WSLg, usbipd-win, Docker Desktop or Podman Desktop (or none, "Nix only"), optionally Nix in WSL 2, and RF Swift itself under a single UAC prompt; an MSI for enterprise deployment. USB passthrough was rebuilt on usbipd-win with least privilege (`rfswift usb list|attach|detach|bind|unbind|status|vm-devices`, one UAC prompt per device to share, unprivileged attach), sound and display come from WSLg with no PulseAudio install, and the remote agent and interactive terminals work on Windows through ConPTY.

Guide: [Windows](/docs/guide/windows).

## 🍎 macOS

Homebrew cask and a signed, notarized DMG with app-bundle launchers; XQuartz OpenGL fixed for SDR++ and every GLFW, Qt and SDL tool by creating contexts through EGL; Lima USB passthrough with `rfswift usb` and automatic VM lifecycle, `rfswift engine lima set` for CPU, memory and disk; an opt-in krunkit VM for Vulkan GPU compute (`--gpu`); the Seatbelt `--isolate` jail for Nix environments.

## 🔌 Hardware fixes that matter in the field

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
  {{< card link="/docs/guide/nix-engine" title="Nix engine" icon="sparkles" subtitle="Native, pinned tool environments" >}}
  {{< card link="/docs/guide/workbench" title="Workbench" icon="desktop-computer" subtitle="The assessment GUI" >}}
  {{< card link="/docs/guide/remote-agent" title="Remote agent" icon="wifi" subtitle="Drive a lab machine securely" >}}
  {{< card link="/docs/commands" title="Command reference" icon="book-open" subtitle="The v4 command tree" >}}
{{< /cards >}}
