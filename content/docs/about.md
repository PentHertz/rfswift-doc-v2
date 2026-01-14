---
linkTitle: "Documentation"
title: About
weight: 2
next: /docs/supports
cascade:
  type: docs
---

## 👋 Welcome!

![RF Swift Logo](https://github.com/PentHertz/RF-Swift-docs/blob/main/.assets/logo.png?raw=true)

<div align="center">
  <table>
    <tr>
      <td><strong>Supported OSes</strong></td>
      <td><img alt="linux supported" src="https://img.shields.io/badge/linux-supported-success"></td>
      <td><img alt="windows supported" src="https://img.shields.io/badge/windows-supported-success"></td>
      <td><img alt="macOS supported" src="https://img.shields.io/badge/macos-supported%20without%20USB%20forward-success"></td>
    </tr>
    <tr>
      <td><strong>Supported architectures</strong></td>
      <td><img alt="amd64" src="https://img.shields.io/badge/amd64%20(x86__64)-supported-success"></td>
      <td><img alt="arm64" src="https://img.shields.io/badge/arm64%20(aarch64)-supported-success"></td>
      <td><img alt="riscv64" src="https://img.shields.io/badge/riscv64%20-supported-success"></td>
    </tr>
    <tr>
      <td><strong>Presented at</strong></td>
      <td><a target="_blank" rel="noopener noreferrer" href="https://www.blackhat.com/eu-24/arsenal/schedule/index.html#rf-swift-a-swifty-toolbox-for-all-wireless-assessments-41157" title="Schedule">
       <img alt="Black Hat Europe 2024" src="https://img.shields.io/badge/Black%20Hat%20Arsenal-Europe%202024-blueviolet">
      </a></td>
      <td>
        <a target="_blank" rel="noopener noreferrer" href="https://spectrum-conference.org/24/schedule" title="Schedule">
       <img alt="Spectrum 24" src="https://img.shields.io/badge/Spectrum-2024-yellow">
      </a>
      </td>
      <td>
        <a target="_blank" rel="noopener noreferrer" href="https://fosdem.org/2025/schedule/event/fosdem-2025-4301-rf-swift-a-swifty-toolbox-for-all-wireless-assessments/" title="Schedule">
         <img alt="FOSDEM 2025" src="https://img.shields.io/badge/FOSDEM-2025-pink">
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://www.cyberonboard.org/en/content/sujetsscientifiques" title="Schedule">
         <img alt="CyberOnBoard" src="https://img.shields.io/badge/CyberOnBoard-2025-green">
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

**RF Swift** is a toolbox for creating a laboratory environment for your RF assessments, easily adaptable to your requirements:

- Working tools for specific engagements available in seconds
- Reproducible setups for each context
- Custom recipes for your precise needs
- Freedom from bloated distributions where only 30% of the tools are used and half of what you need is missing
-  No conflicts with your environment or security requirements, unlike dedicated distributions

So this toolbox is probably the **best solution** to deploy a generic, as well as a special environment securely, skipping the headache and waste of time when installing and using RF tools on same host.

{{< callout type="warning" >}}
  Even if the project could work on macOS with some manual workaround, we do not advertise it for the moment, but this system will be fully supported in the near future.
{{< /callout >}}

## An actively used tool

RF Swift was born from real-world operational needs at [Penthertz](https://penthertz.com/) that no existing distribution could fully address.

During security engagements, we often work on multiple projects within the same week—sometimes even the same day. This creates several challenges that traditional distributions struggle to handle:

- **Isolation between engagements**: Each project needs to remain completely separate to preserve integrity and avoid cross-contamination of traces and artifacts
- **Reproducible environments**: The ability to spin up known-working configurations instantly, without worrying about dependency conflicts or broken toolchains
- **Experimentation without risk**: Installing experimental tools or libraries for one engagement shouldn't break the setup relied on for another
- **Scalability and time saving**: Consultants spend around 1–2 days setting up their computers with all the necessary tools—sometimes more when newly hired
- **No conflict with company environments, especially on Linux**: Not everyone has the luxury of a second laptop for dedicated security work. This solution lets you keep your internal corporate environment intact
- **Maintain own images**: People can maintain their own image and fit them on their needs

## Key Benefits of RF Swift

- **Flexibility**: Use RF tools without disrupting your daily work environment
- **Efficiency**: Deploy only the tools you need, when you need them
- **Security**: Manage isolation between containers preventing cross-contamination
- **Portability**: Works across multiple architectures with consistent experience
- **Resource Management**: Optimized resource usage compared to full VMs
 
## Comprehensive Container Orchestration

RF Swift provides a complete orchestration solution that goes beyond traditional containers. Unlike standard Docker, RF Swift simplifies the entire workflow with a straightforward learning curve:

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

RF Swift handles everything from container creation and execution to pulling images, committing changes, and re-tagging. What sets it apart is the seamless integration of USB, video, and audio forwarding in a user-friendly interface—tasks that typically require significant expertise in standard Docker environments.

### Key Components

- **Go binary (rfswift)** 
  - Instruments containers and hosts to simplify the use of tools that may require:
  - Internet connectivity
  - Display
  - Sounds
  - USB accesses
  
  This ``rfswift`` is the main program you will interact with to:
  - Run clean containers
  - Execute inside running or paused containers
  - Perform many magic actions that will make things work without a headache

- **Docker images** - Pre-built Docker container images are available in RF Swift's repository. In case you want to bake your own environment, preserve some space, and have a special set-up, you will also find some Docker files you can edit to fit your expectations.

## Questions or Feedback?

{{< callout emoji="❓" >}}
  RF Swift is still in active development.
  Have a question or feedback? Feel free to [open an issue](https://github.com/PentHertz/RF-Swift/issues)!
{{< /callout >}}

## Next Steps

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/supports" title="Requirements & supports" icon="support" subtitle="Requirements & supported platforms" >}}
  {{< card link="/docs/comparisons" title="Comparisons with dedicated distributions" icon="star" subtitle="Compare RF Swift with dedicated distributions" >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Setup your environment" >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Quickly run RF Swift and start a container" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binary" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}