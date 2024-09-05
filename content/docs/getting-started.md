---
title: Getting started
weight: 1
next: /docs/quick-start
prev: /docs/
cascade:
  type: docs
---

To get started using RF Swift, you first need to follow specific requirements.

## Supported on

### Platforms

| Plateform | x86_64/amd64 | arm64/v8                                      | riscv64  |
| --------  | ------------ | --------------------------------------------  | -------- |
| Windows   | ✅           | ❓                                            |          |
| Linux     | ✅           | ✅                                            | ✅       |
| macOS     | ❓           | ✅ (better inside a VM for USB devices)       |          |


### Tested single-board computers


| SBC                  | Status       | Comments                                                                      |
| -------------------- | ------------ | ----------------------------------------------------------------------------  |
| Raspberry Pi 5       | ✅           | Works perfectly with most of the tools.                                       |
| Milk-V Jupiyter      | ✅           | Works perfectly with most of the tools, but slower than Raspberry Pi 5.       |
| Milk-V Mars          | ❌           | Software support is dead for the moment. Impossible to easily install Docker. |
| UP Squared Series    | ✅           | Works perfectly with most of the tools.                                       |

## Requirements

The minimum requirements to run the project are the following:


{{< tabs items="Linux (preferred),Windows,macOS" >}}

  {{< tab >}}

{{< callout type="info" >}}
  On Linux, Docker, BuildX, and go can be directly installed with `install.sh` script.
{{< /callout >}}

    Docker is needed at least to run RF Swift containers. It can be directly your prefered package manager, such as APT or installed manually. From Linux systems, Docker can be installed quickly and easily with the following command-line:

```bash
curl -fsSL "https://get.docker.com/" | sh
```
    Other dependencies will be also needed such as:

  - `xhost`: to install depending on your distribution
  - `pulseaudio`: to install depending on your distribution
  - `golang`: Go compiler 
  - Optional `buildx`: For cross-compilation
  {{< /tab >}}

  {{< tab >}}
  - [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) to run container
  - [usbipd](https://learn.microsoft.com/en-us/windows/wsl/connect-usb) to bind USB devices to the host
  - For programs using PulseAudio, follow steps in the following [pulseaudio page](https://www.linuxuprising.com/2021/03/how-to-get-sound-pulseaudio-to-work-on.html) using [new binaries here](https://pgaskin.net/pulseaudio-win32/).

  {{< callout type="warning" >}}
    Make sure Docker Desktop runs in [WSL2](https://docs.docker.com/desktop/wsl/#enabling-docker-support-in-wsl-2-distros).
  {{< /callout >}}

  {{< /tab >}}

  {{< tab >}}
{{< callout type="warning" >}}
  This system will be soon supported at 100%
{{< /callout >}}
  {{< /tab >}}
{{< /tabs >}}

## Next

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/quick-start" title="Quick start" icon="document-text" subtitle="Running RF Swift with pre-built images and binary." >}}
  {{< card link="/docs/development" title="Developping and contributing" icon="document-text" subtitle="Compile binary and build images from sources, contribute to the project." >}}
{{< /cards >}}
