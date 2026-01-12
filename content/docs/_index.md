---
linkTitle: "Documentation"
title: Introduction
weight: 3
cascade:
  type: docs
---

# 👋 Hello! Welcome to the RF Swift documentation!

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

**RF Swift** is a toolbox for creating an environment laboratory for your RF assessments, that can easily fit your prerequirements.

This toolbox is probably the **best solution** to deploy a generic, as well as a special environment securely, skipping the headache and waste of time when installing and using RF tools on same host.

{{< callout type="warning" >}}
  Even if the project could work on macOS with some manual workaround, we do not advertise it for the moment, but this system will be fully supported in the near future.
{{< /callout >}}

# RF Swift vs. Specific Security or RF distributions comparison

RF Swift was born from real-world operational needs that no existing distribution could fully address.
During security engagements, we often work on multiple projects within the same week—sometimes even the same day. This creates several challenges that traditional distributions struggle to handle:

- **Isolation between engagements**: Each project needs to remain completely separate to preserve forensic integrity and avoid cross-contamination of traces and artifacts.
- **Reproducible environments**: We need the ability to spin up known-working configurations instantly, without worrying about dependency conflicts or broken toolchains.
- **Experimentation without risk**: Installing experimental tools or libraries for one engagement shouldn't break the setup we rely on for another.

With RF Swift's container-based architecture, each engagement runs in its own isolated environment. You can experiment freely, knowing that a broken dependency or conflicting library won't cascade across your entire system.

| Feature | RF Swift | Pentest Distributions | Dragon OS |
|---------|----------|----------------------|-----------|
| 🖥️ **Host OS Preservation** | ✅ Runs alongside your existing OS | ❌ Requires dedicated partition or VM | ❌ Requires dedicated partition or VM |
| 🧰 **Tool Isolation** | ✅ Tools run in containers without impacting system | ⚠️ Tools can affect system stability | ⚠️ Tools can affect system stability |
| 🚀 **Deployment Speed** | ✅ Fast container deployment | ❌ Full OS installation required | ❌ Full OS installation required |
| 📦 **VM Requirement** | ✅ No VM needed | ⚠️ Needs VM for non-dedicated machines | ⚠️ Needs VM for non-dedicated machines |
| 🔧 **Tool Availability** | ✅ Extensive collection for RF, hardware security, and reversing | ✅ Extensive collection for general pentesting | ✅ Specialized for RF |
| 🔄 **Tool Updates** | ✅ Independent container updates | ⚠️ Tied to system update cycle | ⚠️ Tied to system update cycle |
| 🔁 **Rollback Capability** | ✅ Instant rollback via container images | ❌ Requires snapshots or manual backup | ❌ Requires snapshots or manual backup |
| 💾 **Storage Efficiency** | ✅ Modular—install only what you need | ❌ Requires significant disk space | ❌ Requires significant disk space |
| 🛡️ **Security Isolation** | ✅ Strong container isolation with custom confinement | ⚠️ Limited isolation between applications | ⚠️ Limited isolation between applications |
| 🔌 **Network Containment** | ✅ Per-container network isolation | ⚠️ Requires additional setup | ⚠️ Requires additional setup |
| 🏗️ **Architecture Support** | ✅ x86_64, ARM64, RISC-V64 | ✅ x86_64, ARM64 | ⚠️ Primarily x86_64 |
| 🧩 **Customization** | ✅ Highly modular—pick specific tools | ✅ Customizable, but changes affect entire system | ⚠️ Limited customization |
| 📱 **USB Device Access** | ✅ Streamlined USB forwarding | ✅ Direct access | ✅ Direct access |
| 🔊 **Audio Support** | ✅ Container-based audio support | ✅ Native audio support | ✅ Native audio support |
| 🌐 **Internet Connectivity** | ✅ Configurable per container | ✅ System-wide configuration | ✅ System-wide configuration |

> **Pentest Distributions** includes Kali Linux, Pentoo, Parrot OS, and similar security-focused operating systems.

## Key Benefits of RF Swift

- **Flexibility**: Use RF tools without disrupting your daily work environment
- **Efficiency**: Deploy only the tools you need, when you need them
- **Security**: Strong isolation between containers prevents cross-contamination
- **Portability**: Works across multiple architectures with consistent experience
- **Resource Management**: Optimized resource usage compared to full VMs

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
| Sharing setups with other users | ⭐⭐⭐ | ❌ | ❌ |
| Recording sessions | ⭐⭐⭐ | ❌ | ❌ |

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

- **Go binary (rfswift)** - Instruments containers and hosts to simplify the use of tools that may require:
  - Internet connectivity
  - Display
  - Sounds
  - USB accesses
  
  This rfswift is the main program you will interact with to:
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
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Learn how to run RF Swift" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binary" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}