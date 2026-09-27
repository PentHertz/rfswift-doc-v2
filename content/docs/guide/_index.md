---
title: Guide
linkTitle: Guide
description: How to use RF Swift day to day, from the Workbench and your first toolbox to engines, platforms and advanced features.
level: intermediate
weight: 7
---

You have installed RF Swift and opened your first lab with the [Quick start](/docs/quick-start/). This guide covers everything after that. It is grouped the same way as the sidebar: start with **Everyday use**, then read the other groups when you need them.

{{< callout type="beginner" title="New here?" >}}
If words like *image*, *container* or *workspace* are unfamiliar, read [Key ideas in 5 minutes](/docs/concepts/) first. Every page below is marked **Beginner** or **Advanced** so you know what to expect.
{{< /callout >}}

## Everyday use

The pages you will come back to most: the desktop app, choosing a toolbox, getting files and radios in and out, and changing a lab after you created it.

{{< cards >}}
  {{< card link="/docs/guide/workbench/" title="Workbench (desktop app)" icon="desktop" subtitle="Missions, terminals, notes, findings and reports in one window" tag="Beginner" >}}
  {{< card link="/docs/guide/list-of-images/" title="Choose a toolbox" icon="stack" subtitle="Which image to pick for radio, Wi-Fi, RFID, cellular, cars and more" tag="Beginner" >}}
  {{< card link="/docs/guide/list-of-tools/" title="Included tools" icon="table" subtitle="Every tool in every image, with a filter box" >}}
  {{< card link="/docs/guide/sharing-files/" title="Files & devices" icon="folder-open" subtitle="Your workspace folder, USB radios, serial readers, Bluetooth and Wi-Fi" tag="Beginner" >}}
  {{< card link="/docs/guide/running-rf-swift/" title="Daily workflow" icon="terminal-window" subtitle="Create, re-enter, record and update your labs from the terminal" >}}
  {{< card link="/docs/guide/container-management/" title="Change a container later" icon="wrench" subtitle="Add devices, folders, ports or capabilities without starting over" >}}
  {{< card link="/docs/guide/installing-software/" title="Add more software" icon="download-simple" subtitle="Install functions, apt, recipes and Nix packages compared" >}}
  {{< card link="/docs/commands/report/" title="Assessment reports" icon="file-text" subtitle="Turn a container and its workspace into a report from the CLI" >}}
{{< /cards >}}

## Platforms & engines

RF Swift runs the same toolboxes on Linux, macOS and Windows, with Docker, Podman, Lima or the native Nix engine. Read the page for your platform or engine when something behaves differently from the Quick start.

{{< cards >}}
  {{< card link="/docs/guide/windows/" title="Windows" icon="windows-logo" subtitle="The installer bundle, WSL 2, USB passthrough with usbipd-win" >}}
  {{< card link="/docs/guide/podman/" title="Podman" icon="cube" subtitle="Rootless containers, no daemon, and what changes for devices" >}}
  {{< card link="/docs/guide/nix-engine/" title="Nix engine (no containers)" icon="snowflake" subtitle="The same tool sets installed natively, pinned, with rollback" tag="Advanced" >}}
  {{< card link="/docs/guide/qubes-os/" title="QubesOS" icon="shield-check" subtitle="Running RF Swift in a Qubes qube, step by step" tag="Advanced" >}}
  {{< card link="/docs/air-gapped-installation/" title="Offline / air-gapped install" icon="wifi-slash" subtitle="Export images and install them on a machine without internet" tag="Advanced" >}}
  {{< card link="/docs/guide/limitations/" title="Known limits" icon="warning" subtitle="What each platform and engine cannot do, and why" >}}
{{< /cards >}}

## Advanced

Configuration, host plumbing, remote labs and automation. None of this is needed to get started.

{{< cards >}}
  {{< card link="/docs/guide/configurations/" title="Configuration file & profiles" icon="gear" subtitle="config.ini, container profiles, environment variables and overrides" >}}
  {{< card link="/docs/guide/host-actions/" title="Host actions" icon="desktop-tower" subtitle="Host setup on Linux, sound for containers, USB device management" >}}
  {{< card link="/docs/guide/caches/" title="Caches & fast delivery" icon="lightning" subtitle="Where downloads are cached, and running your own cache for a team" >}}
  {{< card link="/docs/guide/remote-agent/" title="Remote agent" icon="broadcast" subtitle="Drive a lab machine from your laptop over mutual TLS" >}}
  {{< card link="/docs/guide/ai-assistant/" title="AI assistant (MCP)" icon="sparkle" subtitle="Connect a coding agent to a mission through a permission-gated bridge" >}}
  {{< card link="/docs/guide/vpn/" title="VPN inside containers" icon="lock-key" subtitle="WireGuard, OpenVPN, Tailscale or Netbird per container" >}}
{{< /cards >}}

## Looking for a specific command?

Every flag of every command is in the [command reference](/docs/commands/). Press <kbd>Ctrl</kbd> <kbd>K</kbd> to search the whole documentation.
