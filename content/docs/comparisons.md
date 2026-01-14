---
title: Comparisons with dedicated distributions
next: /docs/getting-started
prev: /docs/supports
weight: 3
cascade:
  type: docs
---
 
## RF Swift vs. Specific Security or RF distributions comparison

Your hearth struggle choosing a specific distribution and RF Swift? Here are some key arguments that at the end made us developped that solution ;)

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