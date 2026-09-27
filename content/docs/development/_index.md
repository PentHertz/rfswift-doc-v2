---
linkTitle: "Development"
title: "Developing with RF Swift"
level: advanced
description: "Compile RF Swift from source, write YAML recipes and build your own images."
weight: 8
---

This section is for people who want to go beyond the official toolboxes: compile the `rfswift` binary yourself, build your own images, or contribute to the project.

## What you can do

1. **Compile the binary** from source, for your machine or another architecture.
2. **Build your own images** with a short YAML recipe, or with a Dockerfile.
3. **Contribute** new features or fixes to the project.

{{< cards >}}
  {{< card link="/docs/development/compiling-rfswift/" title="Compile RF Swift" subtitle="Build the CLI and the Workbench from source, for any supported platform" >}}
  {{< card link="/docs/development/yaml-recipe-guide/" title="YAML recipe guide" subtitle="Describe a custom image in a few readable lines instead of a Dockerfile" >}}
  {{< card link="/docs/development/building-images/" title="Helper functions" subtitle="The Bash helpers you call when building images: logging, retries, CMake builds" >}}
{{< /cards >}}

## Your own image in two steps

A YAML recipe lists the base image, the packages and a few commands. For example:

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

Build it with one command:

```bash
rfswift image build -r my-custom-image.yaml
```

Recipes are quick to prototype, easy to share and to keep in version control, and you do not need to know how to write a Dockerfile. The [YAML recipe guide](/docs/development/yaml-recipe-guide/) covers every field and has complete examples.

## What you need

- **Go 1.27 or later**, to compile the RF Swift binary and the Workbench.
- **Docker or Podman**, to build and test container images (the Nix engine needs Nix instead).
- **BuildX**, for cross-platform image builds.
- **Git**, for the source code.

## Building for several platforms

RF Swift runs on several operating systems and architectures. When you develop for it:

- test on more than one operating system when you can;
- use BuildX for cross-platform container builds; the YAML build system handles multi-architecture builds once BuildX is configured;
- keep ARM64 and RISC-V in mind when you tune a build.

## Getting help

- **Discord**: [join the server](https://discord.gg/NS3HayKrpA) to ask questions.
- **GitHub issues**: [report a bug or request a feature](https://github.com/PentHertz/RF-Swift/issues).
- **API reference**: planned on the [project wiki](https://github.com/PentHertz/RF-Swift/wiki/API-Reference).

{{< callout type="info" >}}
More development documentation is on its way. Contributions are welcome, especially for specialised development setups and custom image recipes.
{{< /callout >}}
