---
linkTitle: "Documentation"
title: Introduction
weight: 3
cascade:
  type: docs
---

👋 Hello! Welcome to the RF Swift documentation!

![landscape](https://github.com/PentHertz/RF-Swift-docs/blob/main/.assets/logo.png?raw=true)

<div align="center">
  <table>
    <tr>
      <td><strong>Supported OSes</strong></td>
      <td><img alt="linux supported" src="https://img.shields.io/badge/linux-supported-success"></td>
      <td><img alt="windows supported" src="https://img.shields.io/badge/windows-supported-success"></td>
      <td><img alt="windows supported" src="https://img.shields.io/badge/macos-pending-orange"></td>
    </tr>
    <tr>
      <td><strong>Supported architectures</strong></td>
      <td><img alt="amd64" src="https://img.shields.io/badge/amd64%20(x86__64)-supported-success"></td>
      <td><img alt="arm64" src="https://img.shields.io/badge/arm64%20(aarch64)-supported-success"></td>
      <td><img alt="riscv64" src="https://img.shields.io/badge/riscv64%20-supported-success"></td>
    </tr>
    <tr>
      <td><strong>Presented in</strong></td>
      <td><a target="_blank" rel="noopener noreferrer" href="https://www.blackhat.com/eu-24/arsenal/schedule/index.html#rf-swift-a-swifty-toolbox-for-all-wireless-assessments-41157" title="Schedule">
       <img alt="Black Hat Europe 2024" src="https://img.shields.io/badge/Black%20Hat%20Arsenal-Europe%202024-blueviolet">
      </a></td>
      <td>
        <a target="_blank" rel="noopener noreferrer" href="https://spectrum-conference.org/24/schedule" title="Schedule">
       <img alt="Spectrum 24" src="https://img.shields.io/badge/Spectrum-2024-yellow">
      </a>
      </td>
    </tr>
    <tr>
      <td><strong>Socials</strong></td>
      <td><a target="_blank" rel="noopener noreferrer" href="https://x.com/intent/follow?screen_name=FlUxIuS" title="Follow"><img src="https://img.shields.io/twitter/follow/_nwodtuhs?label=FlUxIuS&style=social" alt="Twitter FlUxIuS"></a></td>
      <td><a target="_blank" rel="noopener noreferrer" href="https://x.com/intent/follow?screen_name=Penthertz" title="Follow"><img src="https://img.shields.io/twitter/follow/_nwodtuhs?label=Penthertz&style=social" alt="Twitter Penthertz"></a></td>
      <td>
        <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/NS3HayKrpA" title="Join us on Discord"><img src="https://github.com/PentHertz/RF-Swift-docs/blob/main/.assets/discord_join_us.png?raw=true" width="150" alt="Join us on Discord"></a>
      </td>
    </tr>
  </table>
</div>

## What is RF Swift?

RF Swift is a toolbox for creating an environment laboratory for your RF assessments, that can easily fit your prerequirements.

This toolbox is probably the best solution to deploy a generic, as well as a special environment securely, skipping the headache and waste of time when installing and using RF tools on same host.

{{< callout type="warning" >}}
  Even if the project, could work on macOS with some manual workaround, we do not adverstise it for the moment, but this system will be a 100% supported anytime soon.
{{< /callout >}}


## The RF Swift project

```mermaid
graph TD
    A[rfswift] --> B[Host manager]
    B --> C[Host]
    B --> D[USB]
    B --> F[Sound]

    B --> G[Images Container manager]

    H[Dockerfiles] --> G

    G --> I[Pull]
    G --> J[List]
    G --> K[Save]
    G --> L[Tag]
    G --> M[Run]
    G --> N[Exec]
    
    style A fill:#f9f,stroke:#333,stroke-width:4px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style H fill:#afa,stroke:#333,stroke-width:2px

    style G fill:#bbf,stroke:#333,stroke-width:2px

```

- **Go binary (rfswift)** - instruments containers and hosts to simplify the use of tools that may require internet connectivity, display, sounds, USB accesses. This rfswift is the main program you will interact with to run clean containers, execute inside running or paused containers, and do many magic actions that will make things work without headache.
- **Docker images** - some pre-built Docker container images are available in RF Swift’s repository. In case you wan to bake your own environment, preserve some spaces, and have a special set-up, you will also find some Docker files you can edit to fit your expectations.

## Questions or Feedback?

{{< callout emoji="❓" >}}
  RF Swift is still in active development.
  Have a question or feedback? Feel free to [open an issue](https://github.com/PentHertz/RF-Swift/issues)!
{{< /callout >}}

## Next

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Learn how to run RF Swift" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binarry" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}

