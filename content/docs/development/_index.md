---
linkTitle: 🧑‍🍳 Development
title: Developing with RF Swift
prev: /docs/guide
next: /docs/development/compiling-rfswift
weight: 8
---

# RF Swift Development Guide

This section covers topics related to developing with RF Swift, building custom components, and contributing to the project. Whether you want to compile the RF Swift binary from source, create custom container images using the new YAML build system, or extend the project's capabilities, you'll find the necessary guidance here.

## Getting Started with Development

RF Swift is designed to be extensible and customizable. You can tailor it to your specific RF assessment needs by:
1. **Compiling the binary** from source with custom features or for specific architectures
2. **Building custom container images** with specialized tools using the simplified YAML recipe format
3. **Contributing to the core project** by adding new features or fixing issues

## Key Development Areas

{{< cards >}}
  {{< card link="compiling-rfswift" title="Compile RF Swift Binary" icon="chip" subtitle="Build the RF Swift binary from source for different platforms and architectures" >}}
  {{< card link="yaml-recipe-guide" title="YAML Recipe Guide" icon="document-text" subtitle="Create custom container images using simple, readable YAML recipes without Dockerfile complexity" >}}
  {{< card link="building-images" title="Building Custom Images" icon="beaker" subtitle="Advanced Docker image creation with Dockerfiles and multi-stage builds" >}}
{{< /cards >}}

## Simplified Image Building with YAML Recipes

RF Swift now includes a powerful YAML-based build system that simplifies the process of creating custom images. Instead of writing complex Dockerfiles, you can define your image requirements in a simple, readable YAML format.

### Quick Example

Create a custom image with just a YAML recipe file:

```yaml
# my-custom-image.yaml
base_image: "ubuntu:24.04"
tag: "my-custom-sdr:latest"
packages:
  - rtl-sdr
  - hackrf
  - gqrx-sdr
python_packages:
  - numpy
  - scipy
run_commands:
  - "echo 'Custom image ready!'"
```
Build it with a single command:
```bash
rfswift build -r my-custom-image.yaml
```
This approach makes it much easier to:
- 🚀 **Quickly prototype** new image configurations
- 📝 **Share recipes** with the community
- 🔄 **Version control** your image definitions
- 🛠️ **Customize** existing images without Dockerfile knowledge
See the [Building Custom Images](building-images) section for detailed information about the YAML recipe format and advanced features.

## Development Environment Setup

Before diving into RF Swift development, ensure your environment meets these prerequisites:

### Prerequisites

- **Go 1.20+**: Required for compiling the RF Swift binary
- **Docker**: Required for building and testing container images
- **BuildX**: Required for cross-platform image building
- **Git**: Required for source code management

## Cross-Platform Development

RF Swift supports multiple platforms and architectures. When developing:
- Test on multiple operating systems when possible
- Use BuildX for cross-platform container builds
- Consider architecture-specific optimizations for ARM64 and RISC-V
- The YAML build system automatically handles multi-architecture builds when BuildX is configured

## Community Resources

Join the RF Swift community to get help with development:
- **Discord**: [Join our Discord server](https://discord.gg/NS3HayKrpA)
- **GitHub Issues**: [Report bugs or request features](https://github.com/PentHertz/RF-Swift/issues)
- **Documentation**: Refer to the [API Reference](https://github.com/PentHertz/RF-Swift/wiki/API-Reference) (coming soon)
{{< callout emoji="🚧" >}}
Additional development documentation is being actively created. We welcome contributions to the documentation, especially for specialized development scenarios and custom image recipes.
{{< /callout >}}