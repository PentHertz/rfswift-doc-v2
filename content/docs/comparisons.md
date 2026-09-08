---
title: Comparisons with dedicated distributions
next: /docs/getting-started
prev: /docs/release-notes-v4
weight: 4
cascade:
  type: docs
---
 
## RF Swift and the dedicated distributions

This page is not a contest. Dedicated distributions and RF Swift solve different problems, and they combine well. There are two ways to get an RF and hardware lab with RF Swift: **complete the distribution you already run** (Kali, Parrot, Pentoo, BlackArch, DragonOS), or **start from a plain, lighter system** (a minimal Arch, Debian, Fedora or Ubuntu, a Mac, a Windows laptop, a small board) and let RF Swift supply the tools. The table below shows where each approach stands on its own; the sections after it show how to use them together.

The model behind the dedicated distributions comes from the late 1990s live CDs: one machine, one system, every tool preinstalled. It carried this field for twenty-five years and it still does a lot of things right. What changed is what a lab is expected to be. RF Swift is what that same idea looks like in 2026, and it is built to run on those distributions as happily as next to them.

| A lab, the distribution way | A lab in 2026, with RF Swift |
|---|---|
| One machine, one system, one shared state | One environment per engagement, on any machine, deleted or archived when the report ships |
| Install the whole image to get the tools | Pull the set you need, or run one tool, natively or in a container |
| Tools frozen with the distribution's release | Tools pinned to a revision you chose, updated and rolled back per environment |
| A dedicated partition, a dual boot or a VM | Your own Linux, Mac or Windows machine, on x86_64, ARM64 or RISC-V64 |
| Notes, captures and reports somewhere on the disk | A mission: terminals with recordings, notebook, findings, evidence, reports |
| The lab is where the machine is | The lab is wherever you are: a remote agent drives the rack from your laptop |
| Trust the image | Audit what you run, jail what you do not trust |
| Alone with the man pages | A coding agent that reads the mission's evidence, read-only unless you say otherwise |

With RF Swift's container and Nix engines, each engagement runs in its own isolated environment. You can experiment freely, knowing that a broken dependency or conflicting library won't cascade across your entire system.

| Feature | RF Swift | Pentest Distributions | Dragon OS |
|---------|----------|----------------------|-----------|
| 🖥️ **Host OS Preservation** | ✅ Runs alongside your existing OS | ❌ Requires dedicated partition or VM | ❌ Requires dedicated partition or VM |
| 🧰 **Tool Isolation** | ✅ Tools run in containers without impacting system | ⚠️ Tools can affect system stability | ⚠️ Tools can affect system stability |
| 🚀 **Deployment Speed** | ✅ Fast container deployment | ❌ Full OS installation required | ❌ Full OS installation required |
| 📦 **VM Requirement** | ✅ No VM needed | ⚠️ Needs VM for non-dedicated machines | ⚠️ Needs VM for non-dedicated machines |
| 🔧 **Tool Availability** | ✅ Extensive collection for RF, hardware security, and reversing | ✅ Extensive collection for general pentesting | ✅ Specialized for RF |
| 🔄 **Tool Updates** | ✅ Independent container updates | ⚠️ Tied to system update cycle | ⚠️ Tied to system update cycle |
| 🔁 **Rollback Capability** | ✅ Instant rollback via container images | ❌ Requires snapshots or manual backup | ❌ Requires snapshots or manual backup |
| 💾 **Storage Efficiency** | ✅ Modular, install only what you need | ❌ Requires significant disk space | ❌ Requires significant disk space |
| 🛡️ **Security Isolation** | ✅ Containers with custom confinement, or a native Nix environment inside a bubblewrap (Linux) or Seatbelt (macOS) jail with `--isolate` | ⚠️ Limited isolation between applications | ⚠️ Limited isolation between applications |
| 🔌 **Network Containment** | ✅ Per-container network isolation | ⚠️ Requires additional setup | ⚠️ Requires additional setup |
| 🏗️ **Architecture Support** | ✅ x86_64, ARM64, RISC-V64 | ✅ x86_64, ARM64 | ⚠️ Primarily x86_64 |
| 🧩 **Customization** | ✅ Highly modular, pick specific tools | ✅ Customizable, but changes affect entire system | ⚠️ Limited customization |
| 📱 **USB Device Access** | ✅ Streamlined USB forwarding | ✅ Direct access | ✅ Direct access |
| 🔊 **Audio Support** | ✅ Container-based audio support | ✅ Native audio support | ✅ Native audio support |
| 🌐 **Internet Connectivity** | ✅ Configurable per container | ✅ System-wide configuration | ✅ System-wide configuration |
| ❄️ **Native option** | ✅ Nix engine: the same tools natively, pinned, with rollback | ✅ Native by definition | ✅ Native by definition |
| 🖥️ **Assessment workflow** | ✅ Workbench: missions, recordings, findings, captures, reports | ⚠️ Separate tools | ⚠️ Separate tools |
| 📡 **Remote lab** | ✅ mTLS remote agent drives a lab machine from your laptop | ⚠️ SSH and manual setup | ⚠️ SSH and manual setup |
| 🎯 **One tool only** | ✅ `rfswift env run sdr_light sdrpp` fetches that tool's closure and runs it | ❌ Install the distribution to get one tool | ❌ Install the distribution to get one tool |
| 💽 **Disk for one tool** | ✅ The tool's closure, or a task-sized image for a job | ❌ A full system image, tens of GB | ❌ A full system image, tens of GB |
| 🔍 **Knowing what you run** | ✅ `rfswift audit` scans an image, a container or an environment for CVEs and attack surface | ⚠️ Distribution advisories only | ⚠️ No built-in audit |

> **Pentest Distributions** includes Kali Linux, Pentoo, Parrot OS, and similar security-focused operating systems.

## What a dedicated distribution gives you, and where RF Swift completes it

Distributions like Kali, Parrot, Pentoo, BlackArch or DragonOS are good at what they were made for, and there are cases where they stay the better base. RF Swift is built to sit on top of them, not to argue with them.

**Where they win**

- **Everything is there after one install.** Boot, plug the radio, type the command. No engine, no image, no device mapping to learn.
- **The kernel is part of the package.** Drivers, realtime patches, kernel modules and firmware are integrated and tested together. A container still runs on your host's kernel.
- **Full hardware access is the default.** USB, PCIe cards, Wi-Fi monitor mode and GPUs need no passthrough, which matters most on a Windows or macOS host where a VM sits between the tools and the hardware.
- **Made for a machine you dedicate.** A lab PC or a burner laptop with nothing else on it is exactly their use case.

**Where they run short**

- **You take everything to use one thing.** Trying SDR++ or one new GNU Radio module means installing a distribution of tens of GB, or a VM of that size, and keeping it updated.
- **One system, one state.** Tools share libraries and Python versions. An upgrade for one can break another, and the fix is a snapshot or a reinstall; there is no per-tool rollback.
- **Your own OS goes.** A partition, a dual boot or a VM, and a context switch every time you go back to email, notes and the report.
- **Hard to reproduce.** "Works on my install" is not a build recipe. Colleagues, CI and next year's you get a different system after the first upgrade.
- **Few architectures.** Most are x86_64 first; ARM64 boards and RISC-V are partial or absent.
- **The attack surface is the whole image.** A monolithic tool set ships every vulnerable library it contains, and nothing tells you which.

**What RF Swift adds**

- **Containers, per task.** `rfswift container create -i rfid -n badge` gives a tested toolbox for that job, from a digest that is identical on every machine, on Linux, macOS and Windows, on x86_64, ARM64 and RISC-V64. Delete it when the engagement ends.
- **Nix, per tool.** `rfswift env run sdr_light sdrpp` fetches that tool's closure (prebuilt for standard packages, built once for RF Swift's patched ones) and runs it natively with USB, audio and OpenGL, on a laptop that has no container engine. `rfswift env install <package>` adds one package, pinned, with rollback. A tool costs its closure, not a distribution.
- **Native, and isolated when you want it.** On Linux and macOS the same native environment runs inside a jail with `--isolate` (bubblewrap, or Seatbelt on macOS): your home and the host filesystem disappear, the radios, the display and the network stay. A distribution cannot give you that without a VM.
- **Your OS stays.** Both run next to your desktop, and the Workbench keeps the engagement's notes, findings, captures and reports with the target.
- **You know what you run.** `rfswift audit` tells you the CVEs and the attack surface of what you are about to use, so a large tool set is a conscious choice, not a silent default.
- **The gaps are stated.** What a container cannot bring from the host kernel, and the few tools that do not build on an architecture, are written down as [known limits](/docs/guide/limitations) rather than hidden.

How to install one tool, one image or one environment: [Installing software](/docs/guide/installing-software). How the caches make the second machine fast: [Caches and fast delivery](/docs/guide/caches).

## Two ways to get the lab

### Complete the distribution you already run

None of this asks you to leave Kali, Parrot, Pentoo, BlackArch or DragonOS. The strongest setup is not one or the other: it is the distribution you already know with RF Swift on top, and the Nix engine is what makes that combination work without a container engine, a VM or a single change to the distribution's packages. Your distribution is the operating system. RF Swift is the lab you carry from one engagement to the next.

**Why the pair beats either alone**

- **The RF stack is where a distribution is weakest, and where RF Swift is strongest.** A distribution's GNU Radio is whatever its release froze, and out-of-tree modules are the first casualties of every version bump; srsRAN, OCUDU, the patched SDR forks and the telecom stacks are simply not in the repositories. RF Swift brings 50+ GNU Radio modules that build and are tested, the 2G-to-5G stacks, RFID, automotive and hardware sets, pinned to a revision. Kali keeps the general pentest tooling; RF Swift brings the radio side to the same laptop, both current.
- **One environment per engagement, instead of one shared state.** On a distribution, two clients' captures, wordlists, credentials and half-installed tools live in the same home. With RF Swift each engagement is its own environment or container, with its own workspace, deletable when the report is delivered and exportable as one archive when a colleague takes over. The Workbench keeps notes, findings and evidence with it.
- **Try anything without breaking what you rely on.** Installing a bleeding-edge tool on the distribution can take down the ones you depend on tomorrow morning. In a Nix environment it is pinned, updates are transactional and `env rollback` undoes them; `rfswift env run` tries a tool with no footprint at all. Nix never fights the distribution's package manager: a tool that needs Python 3.14 or Boost 1.90 carries its own closure while the distribution keeps its versions.
- **Untrusted tools stop being a risk to the whole laptop.** A pentest laptop carries client data and SSH keys next to tools downloaded from anywhere. `--isolate` runs an environment in a jail that hides your home and the system while the USB radio, the display and the network keep working; `rfswift audit` tells you the CVEs and attack surface of a tool set before you use it. A distribution has no equivalent short of a VM.
- **The same lab on every machine, and on the one in the rack.** An environment is a flake revision, an image is a digest: the DragonOS box in the lab, the Kali laptop and a colleague's Mac run the same tools, and the remote agent lets the laptop drive the lab box from the Workbench. "Works on my install" stops being an argument.
- **It costs what you use, and it leaves no trace.** One tool costs its closure, not a second VM or a dual boot. Everything RF Swift installs lives in `/nix/store` and `~/.rfswift/nix/`, so `rfswift env remove` and `rfswift env gc` take it away without a line changed in the distribution's package database.

```bash
# On the distribution, as your user
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh   # pick Nix, Podman, Docker or several
rfswift host setup --engine none --nix yes                          # or later: Nix only, nothing else changes

rfswift env run sdr_light sdrpp                                     # one tool, natively, with the distribution's display and audio
rfswift container create --engine nix -i sdr_full -n survey         # the whole SDR stack next to the distribution's tools
rfswift container create --engine nix -i rfid -n badge --isolate    # jailed: the tool cannot read your home or the system
rfswift container create -i telecom_5G -n gnb                       # a container, when Docker or Podman is there
```

| Distribution | What RF Swift adds on top |
|---|---|
| **Kali, Parrot** (Debian-based) | The RF stack they do not carry: 50+ GNU Radio out-of-tree modules, srsRAN 4G and OCUDU, patched SDR forks, the telecom, RFID, automotive and hardware sets, plus per-engagement isolation and pinned, roll-backable environments. The installer picks the deb packages and, on Kali, its own `docker.io` package; `--isolate` works out of the box, since Debian-based systems do not restrict unprivileged user namespaces. |
| **DragonOS** (Ubuntu-based) | DragonOS already ships a large SDR collection. RF Swift adds a clean, pinned copy per engagement instead of one shared system state, the non-radio sets (`ad`, `android`, `osint`, `reversing`, `network`), `rfswift audit`, the Workbench and the remote agent. On a build based on Ubuntu 24.04 or later, run `rfswift host isolate` once before using the jail. |
| **BlackArch** (Arch-based), **Pentoo** (Gentoo-based) | The pacman package on BlackArch, the tarball install on Pentoo; Podman or Docker from the distribution; the same Nix engine. |
| **Any of them** | The Workbench for missions, findings and reports, the remote agent to drive the distribution box from a laptop, `rfswift audit` for what you run, and versions pinned to a digest or a flake revision, so the engagement is reproducible next year. |

A container engine is optional; rootless Podman is the least intrusive one on a shared box. Whichever you pick, the distribution stays exactly as it was: RF Swift only fills in what it did not ship.

### Or start from a plain, lighter system

The other route is a system that ships nothing security-specific at all: a minimal Arch, Debian, Fedora or Ubuntu, a Mac, a Windows laptop, a Raspberry Pi 5 or a RISC-V board. RF Swift turns it into the same lab, and the result is lighter than any dedicated image, because you install the base system once and then only the tool sets you use.

```bash
# Arch (pacman package), Debian and Ubuntu (deb), Fedora (rpm): one installer, or the package by hand
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
rfswift host setup                                        # udev rules, Podman or Docker, Nix, the jail: each step asked
rfswift container create -i sdr_light -n radio            # a container...
rfswift container create --engine nix -i rfid -n badge    # ...or a native environment, same command
```

- **A base you chose.** Your window manager, your dotfiles, your update cadence. RF Swift does not care which Linux it is, and the same commands work on macOS and Windows.
- **Only what you use on disk.** The base system plus the images or closures you asked for. A laptop set up for SDR and RFID work carries those two sets, not thirty tool categories.
- **The same tools as the Kali user next to you.** Environments are pinned to a flake revision and images to a digest, so a team can mix Arch, Kali, macOS and a Pi in the lab and still run identical tools.
- **Quick to rebuild.** A reinstalled laptop is back in minutes: install RF Swift, then pull again or restore the `.rfenv` and image archives you exported.
- **Small boards included.** arm64 and riscv64 images cover the Raspberry Pi 5 and RISC-V boards, where dedicated images are rare or absent, and the Nix engine runs on arm64 too.

Both routes end in the same place: the same pinned environments, the same Workbench, the same audits and the same remote agent, on whatever base you prefer.

## Use Case Scenarios

| Scenario | RF Swift | Kali Linux/Pentoo/Parrot OS | Dragon OS |
|----------|---------|------------------------------|-----------|
| Air-gapped environments | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Security assessments | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Quick assessment on personal device | ⭐⭐⭐ | ⭐ | ⭐ |
| Deployment on a burner laptop | ⭐⭐⭐ | ⭐ | ⭐ |
| Low storage environments | ⭐⭐⭐ | ⭐ | ⭐ |
| Multiple architecture development | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Isolated testing environment | ⭐⭐⭐ | ⭐ | ❌ |
| Organization of traces | ⭐⭐⭐ | ❌ | ❌ |
| Sharing setups accross users and servers | ⭐⭐⭐ | ❌ | ❌ |
| Recording sessions | ⭐⭐⭐ | ❌ | ❌ |

## Questions or Feedback?

{{< callout emoji="❓" >}}
  RF Swift is still in active development.
  Have a question or feedback? Feel free to [open an issue](https://github.com/PentHertz/RF-Swift/issues)!
{{< /callout >}}

## Next Steps

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Learn how to run RF Swift" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binary" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}