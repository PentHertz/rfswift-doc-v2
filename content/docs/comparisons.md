---
title: "RF Swift and dedicated RF distributions"
linkTitle: "Comparisons"
description: "How RF Swift compares with Kali, Parrot, DragonOS and other distributions, and how to use them together."
weight: 4
---

This page is not a contest. Dedicated distributions (Kali, Parrot, Pentoo, BlackArch, DragonOS) and RF Swift solve different problems, and they combine well. RF Swift isn't meant to replace them: it completes them, or brings the same tools to a plain system.

**In short**

- A distribution is **one system with every tool preinstalled**. It is great on a machine you dedicate to it.
- RF Swift gives you **one environment per engagement** on the computer you already use: a container, or a native Nix environment. In lazy mode a Nix environment installs nothing up front and fetches each tool the first time you run it.
- You don't have to choose: RF Swift runs happily **on top of** those distributions, or on a plain, freshly installed system where one command brings the whole tool set. See [Two ways to get the lab](#two-ways-to-get-the-lab).

Dedicated distributions grew out of the live CDs of the late 1990s: one machine, one system, every tool preinstalled. That model has served this field for twenty-five years and still does a lot of things right. RF Swift takes a different angle, one environment per job on the machine you already have, and is built to run on those distributions as happily as next to them.

## At a glance

| One system with every tool | One environment per job, with RF Swift |
|---|---|
| One machine, one system, one shared state | One environment per engagement, on any machine, deleted or archived when the report ships |
| Install the whole image to get the tools | Pull the set you need, or run one tool, natively or in a container. A lazy Nix environment fetches each tool the first time you run it |
| Tools follow the distribution's release cycle | Tools pinned to a revision you chose, updated and rolled back per environment |
| A dedicated partition, a dual boot or a VM | Your own Linux, Mac or Windows machine, on x86_64, ARM64 or RISC-V64 |
| Notes, captures and reports organised your own way | A mission in the standalone Workbench app: terminals with recordings, notebook, findings, evidence, reports |
| The lab is where the machine is | The lab is wherever you are: a remote agent drives the rack from your laptop |
| The distribution's security advisories | Audit what you run, jail what you do not trust |
| Man pages and your own notes | An optional coding agent that reads the mission's evidence, read-only unless you say otherwise |

With RF Swift's container and Nix engines, each engagement runs in its own environment. You can experiment freely, knowing that a broken dependency or conflicting library won't cascade across your entire system.

### Feature by feature

Each approach has its trade-offs. This table puts them side by side.

| Feature | RF Swift | Pentest distributions | DragonOS |
|---|---|---|---|
| **Host OS preservation** | Runs alongside your existing OS | Requires dedicated partition or VM | Requires dedicated partition or VM |
| **Tool isolation** | Tools run in containers without impacting system | Tools can affect system stability | Tools can affect system stability |
| **Deployment speed** | Fast container deployment | Full OS installation required | Full OS installation required |
| **VM requirement** | No VM needed | Needs VM for non-dedicated machines | Needs VM for non-dedicated machines |
| **Tool availability** | Extensive collection for RF, hardware security, and reversing | Extensive collection for general pentesting | Specialized for RF |
| **Tool updates** | Independent container updates | Tied to system update cycle | Tied to system update cycle |
| **Rollback** | Instant rollback via container images | Requires snapshots or manual backup | Requires snapshots or manual backup |
| **Storage efficiency** | Modular: pick a task-sized image, or a lazy Nix environment that installs only the tools you run | Requires significant disk space | Requires significant disk space |
| **Security isolation** | Containers with custom confinement, or a native Nix environment inside a bubblewrap (Linux) or Seatbelt (macOS) jail with `--isolate` | Limited isolation between applications | Limited isolation between applications |
| **Network containment** | Per-container network isolation | Requires additional setup | Requires additional setup |
| **Architecture support** | x86_64, ARM64, RISC-V64 | x86_64, ARM64 | Primarily x86_64 |
| **Customization** | Highly modular, pick specific tools | Customizable, but changes affect entire system | Changes affect the entire system |
| **USB device access** | Streamlined USB forwarding | Direct access | Direct access |
| **Audio** | Container-based audio support | Native audio support | Native audio support |
| **Internet connectivity** | Configurable per container | System-wide configuration | System-wide configuration |
| **Native option** | Nix engine: the same tools natively and pinned; lazy mode fetches each tool on first use; full environments roll back | Native by definition | Native by definition |
| **Assessment workflow** | Standalone Workbench app (no editor or plugins): missions, recordings, findings, captures, reports | Separate tools | Separate tools |
| **Remote lab** | mTLS remote agent drives a lab machine from your laptop | ⚠️ SSH and manual setup | ⚠️ SSH and manual setup |
| **One tool only** | `rfswift env run sdr_light sdrpp` fetches that tool's closure and runs it | Install the distribution to get one tool | Install the distribution to get one tool |
| **Disk for one tool** | The tool's closure, or a task-sized image for a job | A full system image, tens of GB | A full system image, tens of GB |
| **Knowing what you run** | `rfswift audit` scans an image, a container or an environment for CVEs and attack surface | ⚠️ Distribution advisories only | ⚠️ No built-in audit |

*Pentest distributions* means Kali Linux, Pentoo, Parrot OS and similar security-focused operating systems.

## What a dedicated distribution gives you, and where RF Swift completes it

Distributions like Kali, Parrot, Pentoo, BlackArch or DragonOS are good at what they were made for, and there are cases where they stay the better base. RF Swift is built to sit on top of them and complete them, not to replace them.

**What they do well**

- **Everything is there after one install.** Boot, plug the radio, type the command. No engine, no image, no device mapping to learn.
- **The kernel is part of the package.** Drivers, realtime patches, kernel modules and firmware are integrated and tested together. A container still runs on your host's kernel.
- **Full hardware access is the default.** USB, PCIe cards, Wi-Fi monitor mode and GPUs need no passthrough. That matters most on a Windows or macOS host, where a VM sits between the tools and the hardware.
- **Made for a machine you dedicate.** A lab PC or a burner laptop with nothing else on it is exactly their use case.

**Where a separate tool helps**

- **You take everything to use one thing.** Trying SDR++ or one new GNU Radio module means installing a distribution of tens of GB, or a VM of that size, and keeping it updated.
- **One system, one state.** Tools share libraries and Python versions. An upgrade for one can break another, and the fix is a snapshot or a reinstall; there is no per-tool rollback.
- **Your own OS steps aside.** A partition, a dual boot or a VM, and a context switch every time you go back to email, notes and the report.
- **Harder to reproduce.** Two installs drift apart after a few upgrades, so colleagues, CI and next year's you may not get the same system.
- **Few architectures.** Most are x86_64 first; ARM64 boards and RISC-V are partial or absent.
- **The attack surface is the whole image.** A large tool set ships every library it contains, and it is hard to tell which ones are vulnerable.

**What RF Swift adds**

- **Containers, per task.** `rfswift container create -i rfid -n badge` gives a tested toolbox for that job. It comes from a digest that is identical on every machine: Linux, macOS and Windows, on x86_64, ARM64 and RISC-V64. Delete it when the engagement ends.
- **Nix, per tool.** `rfswift env run sdr_light sdrpp` fetches that tool's closure (prebuilt for standard packages, built once for RF Swift's patched ones). It runs natively with USB, audio and OpenGL, even on a laptop with no container engine. `rfswift env install <package>` adds one package, pinned, with rollback. A tool costs its closure, not a distribution. In lazy mode (`--lazy`) a whole environment starts empty and fetches each tool the first time you call it.
- **Native, and isolated when you want it.** On Linux and macOS the same native environment can run inside a jail with `--isolate` (bubblewrap, or Seatbelt on macOS). Your home and the host filesystem disappear; the radios, the display and the network stay. Without it, the same separation usually takes a VM.
- **Your OS stays.** Both run next to your desktop, and the Workbench, a standalone desktop app with nothing else to install, keeps the engagement's notes, findings, captures and reports with the target.
- **You know what you run.** `rfswift audit` tells you the CVEs and the attack surface of what you are about to use. A large tool set becomes a conscious choice, not a silent default.
- **The gaps are stated.** What a container cannot bring from the host kernel, and the few tools that do not build on an architecture, are written down as [known limits](/docs/guide/limitations/) rather than hidden.

How to install one tool, one image or one environment: [Installing software](/docs/guide/installing-software/). How the caches make the second machine fast: [Caches and fast delivery](/docs/guide/caches/).

## Two ways to get the lab

### Complete the distribution you already run

None of this asks you to leave Kali, Parrot, Pentoo, BlackArch or DragonOS. Many people keep the distribution they know and add RF Swift on top, and the Nix engine makes that work without a container engine, a VM or a single change to the distribution's packages. Your distribution is the operating system. RF Swift is the lab you carry from one engagement to the next.

**Why they work well together**

- **RF Swift focuses on the RF stack.** A distribution's GNU Radio is the version its release shipped, and out-of-tree modules often break when that version changes. srsRAN, OCUDU, the patched SDR forks and the telecom stacks are not in the repositories at all. RF Swift brings 50+ GNU Radio modules that build and are tested, the 2G-to-5G stacks, RFID, automotive and hardware sets, pinned to a revision. Kali keeps the general pentest tooling; RF Swift brings the radio side to the same laptop, both current.
- **One environment per engagement, instead of one shared state.** On a distribution, two clients' captures, wordlists, credentials and half-installed tools live in the same home. With RF Swift each engagement is its own environment or container, with its own workspace, deletable when the report is delivered and exportable as one archive when a colleague takes over. The Workbench keeps notes, findings and evidence with it.
- **Try anything without breaking what you rely on.** Installing a bleeding-edge tool on the distribution can take down the ones you depend on tomorrow morning. In a Nix environment it is pinned, updates are transactional and `env rollback` undoes them; `rfswift env run` tries a tool with no footprint at all. Nix never fights the distribution's package manager: a tool that needs Python 3.14 or Boost 1.90 carries its own closure while the distribution keeps its versions.
- **Untrusted tools stop being a risk to the whole laptop.** A pentest laptop carries client data and SSH keys next to tools downloaded from anywhere. `--isolate` runs an environment in a jail that hides your home and the system, while the USB radio, the display and the network keep working. `rfswift audit` tells you the CVEs and attack surface of a tool set before you use it. Otherwise this kind of separation usually takes a VM.
- **The same lab on every machine, and on the one in the rack.** An environment is a flake revision and an image is a digest, so the DragonOS box in the lab, the Kali laptop and a colleague's Mac run the same tools. The remote agent lets the laptop drive the lab box from the Workbench. Everyone runs the same tools.
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

The other route is a system that ships nothing security-specific at all: a freshly installed Arch, Debian, Fedora or Ubuntu, a Mac, a Windows laptop, a Raspberry Pi 5 or a RISC-V board. One command brings the whole tool set, with nothing to compile. A toolbox image arrives already built; a lazy Nix environment is ready in seconds and fetches each tool the first time you run it. It stays light, because you install the base system once and then only the tool sets you use.

```bash
# Arch (pacman package), Debian and Ubuntu (deb), Fedora (rpm): one installer, or the package by hand
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
rfswift host setup                                        # udev rules, Podman or Docker, Nix, the jail: each step asked
rfswift container create -i sdr_light -n radio            # a container...
rfswift container create --engine nix -i rfid -n badge    # ...or a native environment, same command
```

- **A base you chose.** Your window manager, your dotfiles, your update cadence. RF Swift does not care which Linux it is, and the same commands work on macOS and Windows.
- **Only what you use on disk.** The base system plus the images or closures you asked for. A laptop set up for SDR and RFID work carries those two sets, not thirty tool categories.
- **The same tools as the Kali user next to you.** Environments are pinned to a flake revision and images to a digest. A team can mix Arch, Kali, macOS and a Pi in the lab and still run identical tools.
- **Quick to rebuild.** A reinstalled laptop is back in minutes: install RF Swift, then pull again or restore the `.rfenv` and image archives you exported.
- **Small boards included.** arm64 and riscv64 images cover the Raspberry Pi 5 and RISC-V boards, where dedicated images are rare or absent, and the Nix engine runs on arm64 too.

Both routes end in the same place: the same pinned environments, the same Workbench, the same audits and the same remote agent, on whatever base you prefer.

## Which fits when

There is no single right answer. Here is where each approach tends to fit.

| Situation | Often a good fit |
|---|---|
| A machine dedicated to security work, with everything preinstalled | A dedicated distribution |
| Drivers, kernel modules or realtime patches integrated with the system | A dedicated distribution |
| Air-gapped environments | Both work well |
| Your everyday laptop, where your own system must stay as it is | RF Swift |
| Several engagements a week that must stay separate, with recorded sessions | RF Swift |
| macOS, Windows, ARM64 or RISC-V machines | RF Swift |
| Little disk space, or only a few tools needed | RF Swift, with lazy Nix environments |
| The same setup shared across a team or servers | RF Swift |
| The tools you know plus the RF stack | RF Swift on top of your distribution |

## Next steps

{{< cards >}}
  {{< card link="/docs/getting-started/" title="Install RF Swift" icon="download-simple" subtitle="On Linux, macOS or Windows, including on top of your distribution" tag="Beginner" >}}
  {{< card link="/docs/engines/" title="Choose your engine" icon="gear" subtitle="Docker, Podman, Lima or Nix: what each is good at" >}}
  {{< card link="/docs/guide/installing-software/" title="Add more software" icon="stack" subtitle="One tool, one image or one environment" >}}
  {{< card link="/docs/development/compiling-rfswift/" title="Compile RF Swift" icon="code" subtitle="Build the CLI and the Workbench from source" tag="Advanced" >}}
{{< /cards >}}

Questions or feedback? [Open an issue](https://github.com/PentHertz/RF-Swift/issues) or ask on [Discord](https://discord.gg/NS3HayKrpA).
