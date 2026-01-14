---
title: ⚙️ Requirements & supported platforms
weight: 2
next: /docs/comparisons
prev: /docs
cascade:
  type: docs
---

## System Requirements

The minimum requirements to run RF Swift are:

- **CPU**: Any dual-core CPU (quad-core recommended for better performance)
- **RAM**: 4GB minimum (8GB or more recommended)
- **Storage**: 10GB free space (20GB+ recommended for multiple container images)
- **Docker**: Automatically installed by the one-line installer
- **Internet Connection**: Required for initial setup and image downloads

## Supported Platforms

RF Swift is designed to work across multiple platforms and architectures to suit your specific environment.

### Operating Systems

| Platform | x86_64/amd64 | arm64/v8 | riscv64 |
|----------|--------------|----------|---------|
| Windows  | ✅ Fully supported | ❓ Limited testing | ❌ Not supported |
| Linux    | ✅ Fully supported | ✅ Fully supported | ✅ Fully supported |
| macOS    | ❓ Limited support | ✅ Supported (better inside a VM for USB devices) | ❌ Not supported |

### Tested Single-Board Computers

| SBC | Status | Comments |
|-----|--------|----------|
| Raspberry Pi 5 | ✅ | Works perfectly with most tools |
| Milk-V Jupiter | ✅ | Works perfectly with most tools, but slower than Raspberry Pi 5 |
| Orange Pi RV2  | ✅ | Works perfectly with most tools, but slower than Milk-V Jupiter |
| Milk-V Mars | ❌ | Software support is currently unavailable. Docker installation is problematic |
| UP Squared Series | ✅ | Works perfectly with most tools |


## Feature Compatibility Matrix

| Feature | Linux | Windows | macOS |
|---------|-------|---------|-------|
| Container Execution | ✅ | ✅ | ✅ |
| GUI Applications | ✅ | ✅ | ✅ (with XQuartz) |
| USB Device Forwarding | ✅ | ✅ (with usbipd) | ❌ |
| Audio Support | ✅ | ✅ (with PulseAudio) | ❓ Limited |
| Hardware Acceleration | ✅ | ❓ Limited | ❓ Limited |
| Cross-Compilation | ✅ | ✅ (in WSL) | ✅ |
| One-Line Installer | ✅ | ❌ | ✅ |

## Questions or Feedback?

{{< callout emoji="❓" >}}
  RF Swift is still in active development.
  Have a question or feedback? Feel free to [open an issue](https://github.com/PentHertz/RF-Swift/issues)!
{{< /callout >}}

## Next Steps

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/comparisons" title="Comparisons with dedicated distributions" icon="star" subtitle="Comapre RF Swift with dedicated distributions" >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Setup your environment" >}}
  {{< card link="/docs/quick-start" title="Quick Start" icon="document-text" subtitle="Quickly run RF Swift and start a container" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift binary" icon="document-text" subtitle="Compile RF Swift and develop around the framework" >}}
{{< /cards >}}