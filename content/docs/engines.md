---
title: "Choose your engine"
linkTitle: "Choose your engine"
description: "Docker, Podman, Lima or Nix: what each engine is good at, what it can't do, and which one fits your computer."
level: beginner
weight: 3
---

An **engine** is the program that actually runs your labs. RF Swift works with four of them: **Docker**, **Podman**, **Lima** and **Nix**. They all use the same `rfswift` commands, the same toolboxes and the same [Workbench](/docs/guide/workbench/), so what you learn with one works with the others.

{{< callout type="beginner" title="Not sure? You can skip this page." >}}
The installer detects what you have and suggests an engine. Keep its suggestion to start: you can install another engine later, run several side by side, and switch with one flag.
{{< /callout >}}

## The quick answer

| Your situation | Pick |
|---|---|
| Linux desktop, you want the most common setup | **Docker** |
| Shared or company machine, no admin rights wanted, air-gapped network, or a small board | **Podman** |
| Mac, you want native tools with direct access to your USB radio | **Nix** |
| Mac, you want containers and your USB radio | **Lima** |
| Mac or Windows, no radio needed | **Docker Desktop** or **Podman** |
| Windows, with a radio | **Docker Desktop** or **Podman Desktop** (USB goes through usbipd-win), or **Nix** inside WSL 2 |
| Little disk space, or you only need a few tools | **Nix** in lazy mode |
| You want to keep Kali, Parrot or DragonOS exactly as it is | **Nix** (or rootless Podman) |
| A team that must run the exact same toolbox everywhere | **Docker** or **Podman** (same image, same digest on every machine) |

## The four engines

### Docker: the common choice {#docker}

**In one sentence:** the most widely used container engine, on every operating system.

**Why pick it**
- The broadest ecosystem, and the default on most machines: Docker Engine on Linux, Docker Desktop on macOS and Windows.
- Every lab is an isolated container: nothing you install in it touches your system or your other labs.
- The most complete hardware support on Linux: USB radios, serial ports that can be plugged in after the lab was created (hot-plug), device rules and realtime settings for SDR work.
- A toolbox is an image with a fixed digest, so a colleague pulling the same image gets exactly the same tools.

**Good to know**
- On Linux the Docker service runs as root. Give your user access once with `rfswift host docker-access` (no logout needed). Members of the `docker` group are effectively root on the machine.
- Docker Desktop on macOS can't pass USB devices to a lab. For radios on a Mac, use Lima or Nix.
- On Windows, labs run inside WSL 2 and radios are forwarded with `rfswift usb attach` (usbipd-win).

```bash
rfswift container create -i sdr_light -n radio
```

### Podman: rootless and daemonless {#podman}

**In one sentence:** a Docker-compatible engine that runs without a background service and without admin rights.

**Why pick it**
- **Rootless by default**: your labs run as you, not as root. A good fit for shared machines, company laptops and security-focused setups.
- **No daemon**: nothing runs in the background when you're not using it. That also helps on small boards with little memory.
- Well suited to air-gapped and embedded environments.
- The same images as Docker: toolboxes work identically on both.

**Good to know**
- Run `rfswift host udev` once so your user may open the radio hardware, and set up the subordinate ID ranges Podman needs (the [Quick start](/docs/quick-start/) shows the commands).
- Rootless Podman can't create device rules: serial ports must be plugged in before you create the lab, and realtime limits can't exceed your host's limits. Rootful Podman behaves like Docker here.
- On macOS (`podman machine`) there is no USB passthrough, as with Docker Desktop.

```bash
rfswift --engine podman container create -i sdr_light -n radio
```

More in [Using Podman](/docs/guide/podman/).

### Lima: containers with USB on a Mac {#lima}

**In one sentence:** on macOS, Lima runs your containers in a small Linux virtual machine that can receive your USB radios.

**Why pick it**
- The way to use **containers with RF hardware on a Mac**: USB devices are attached to the VM on demand, and hot-plug works.
- RF Swift creates the VM on first use and manages its lifecycle for you.
- Adjustable resources: `rfswift engine lima set` changes the VM's CPUs, memory and disk.
- On Apple Silicon with macOS 14 or later, an optional GPU VM (`--gpu`) gives Vulkan compute to GPU tools.

**Good to know**
- Install it once with `brew install qemu lima`.
- A device must be attached to the VM before a lab can use it: `rfswift usb attach` shows a picker, `rfswift usb detach` gives the device back to macOS.
- The GPU VM and the USB VM are separate: the GPU one has no USB.
- Graphical tools open through XQuartz with software rendering.

```bash
rfswift usb attach
rfswift --engine lima container create -i sdr_light -n radio
```

More in [usb](/docs/commands/usb/) and [engine](/docs/commands/engine/).

### Nix: native tools, no containers {#nix}

**In one sentence:** the same toolboxes installed natively on your computer, as your user, pinned to exact versions.

**Why pick it**
- **The lightest option.** In lazy mode (`--lazy`, or **Lazy tools** in the Workbench) nothing is installed up front: each tool is fetched the first time you run it, then pinned. `rfswift env run sdr_light sdrpp` runs a single tool without creating anything.
- **Closest to the hardware.** On Linux and macOS there is no container and no VM in between. USB radios open directly and sound plays natively. Graphical tools get a working OpenGL runtime, and GPUs use their native drivers.
- **Excellent on macOS.** Tools run natively on your Mac with direct USB access and no Linux VM, and `--isolate` uses Apple's built-in Seatbelt sandbox.
- **Reproducible and safe to update.** An environment is pinned to the revision it was created from; full (non-lazy) environments update transactionally and can roll back.
- **No container engine needed**, and it never touches your distribution's packages: ideal for adding RF tools to Kali, Parrot or DragonOS.
- Environments share one store on disk, and an environment moves to another machine as a single `.rfenv` archive.

**Good to know**
- There is no isolation by default: tools run as your user. Add `--isolate` for a jail that hides your home and the host files (bubblewrap on Linux, Seatbelt on macOS). On Ubuntu 24.04 and later, run `rfswift host isolate` once first.
- Not every tool from the container images is packaged for Nix yet; missing ones are listed per environment.
- On Linux, run `rfswift host udev` once so your user may open radio hardware. On Windows, Nix runs inside a WSL 2 distribution that `rfswift env wsl setup` (or the installer) prepares.
- It needs Nix installed; the RF Swift installer offers to do it.

```bash
rfswift container create --engine nix -i sdr_light -n radio --lazy
```

More in [Nix engine](/docs/guide/nix-engine/).

## At a glance

| | Docker | Podman | Lima | Nix |
|---|---|---|---|---|
| **Runs on** | Linux, macOS, Windows | Linux, macOS, Windows | macOS | Linux, macOS, Windows (inside WSL 2) |
| **Admin rights** | The service runs as root | Not needed (rootless) | Not needed | Not needed |
| **Isolation** | Container | Container, as your user | Container inside a VM | None by default, optional `--isolate` jail |
| **USB radios** | Linux; Windows via usbipd; not on macOS | Linux; Windows via usbipd; not on macOS | Yes, attached to the VM | Direct on Linux and macOS; Windows via usbipd |
| **Graphics and sound** | Forwarded from the host | Forwarded from the host | Forwarded through the VM | Native (WSLg on Windows) |
| **Disk** | Images of several GB, shared layers | Same as Docker | Same, inside the VM | Only the tools you use (lazy), shared store |
| **Best for** | The common setup, teams, Windows | Security-focused, shared or air-gapped machines, small boards | Containers with USB radios on a Mac | Staying light, macOS, lowest latency to hardware |

The full list of constraints per engine is in [Known limits](/docs/guide/limitations/#engines-at-a-glance).

## Use several, switch any time

Engines can live side by side on the same computer, and the Workbench lists the labs of every engine together. RF Swift picks an engine in this order:

1. the `--engine` flag: `rfswift --engine nix container create ...`
2. the `RFSWIFT_ENGINE` environment variable, for a whole terminal session
3. `engine =` under `[general]` in `config.ini`, to make it permanent
4. otherwise it detects what is installed (Docker, Podman, Lima)

```bash
rfswift doctor     # shows which engines are installed and working
```

{{< cards >}}
  {{< card link="/docs/getting-started/" title="Install RF Swift" icon="download-simple" subtitle="The installer sets up the engine you pick" tag="Beginner" >}}
  {{< card link="/docs/guide/nix-engine/" title="Nix engine" icon="snowflake" subtitle="Lazy mode, isolation, updates and rollback" >}}
  {{< card link="/docs/guide/podman/" title="Using Podman" icon="shield-check" subtitle="Rootless setup and its limits" >}}
  {{< card link="/docs/guide/limitations/" title="Known limits" icon="warning" subtitle="What each engine can't do, per platform" tag="Advanced" >}}
{{< /cards >}}
