---
title: "YAML recipe guide"
level: advanced
description: "Build your own RF Swift image from a short YAML file: a base image, the packages you want and a few commands."
weight: 2
---

A YAML recipe describes a custom RF Swift image in a few lines: which image to start from, which packages to add and which commands to run. RF Swift turns it into a Dockerfile and builds the image for you.

Use a recipe when the official toolboxes miss a tool you need every time, or when a team should share one reproducible image. To add a single tool to one lab, [Add more software](/docs/guide/installing-software/) is quicker.

**Where to start:** copy the [first recipe](#your-first-recipe) below, build it, then look at the [complete examples](#complete-examples). The [helper functions reference](/docs/development/building-images/) lists the build helpers you can call from a recipe.

## Quick start

### Your first recipe

Create a file named `my-sdr.yaml`:

```yaml
base_image: "ubuntu:24.04"
tag: "my-sdr:latest"

packages:
 - rtl-sdr
 - gqrx-sdr
 - hackrf

python_packages:
 - numpy
 - scipy

run_commands:
 - "echo 'SDR tools installed successfully!'"
```

Build it:

```bash
rfswift image build -r my-sdr.yaml
```

You now have a local image called `my-sdr:latest`. Create a lab from it like any other image: `rfswift container create -i my-sdr:latest -n mylab`.

## Recipe fields

A recipe has two required fields and four optional ones.

| Field | Type | Required | What it does |
|-------|------|----------|-------------|
| `base_image` | String | Yes | The image to start from (for example `ubuntu:24.04`) |
| `tag` | String | Yes | Name and tag of the image you build |
| `packages` | List | No | System packages installed with APT |
| `python_packages` | List | No | Python packages installed with pip |
| `run_commands` | List | No | Bash commands run during the build |
| `context` | String | No | Build context directory (default: `.`) |

Here is every field in one file:

```yaml
# Base configuration (required)
base_image: "ubuntu:24.04"        # Base Docker image
tag: "my-image:latest"            # Tag for the resulting image

# Package management (optional)
packages:                          # APT packages to install
 - package1
 - package2-dev
 - package3

python_packages:                   # Python packages via pip
 - numpy
 - scipy==1.10.0                 # Can specify versions
 - git+https://github.com/user/repo.git  # From git

# Custom commands (optional)
run_commands:                      # Bash commands to execute
 - "echo 'Starting build...'"
 - "mkdir -p /opt/tools"
 - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      '' \
      'rtlsdr_install'

# Build context (optional)
context: "."                       # Build context directory (default: ".")
```

## Choosing a base image

### RF Swift base images

Starting from an RF Swift base image gives you its libraries and helper functions from the start:

```yaml
# Core RF Swift base (recommended)
base_image: "penthertz/rfswift_resolute:core"

# RF Swift base image
base_image: "penthertz/rfswift_resolute:base"

# Ubuntu Jammy (22.04) - Stable LTS
base_image: "ubuntu:22.04"
```

### Standard base images

To build from scratch, start from a distribution image:

```yaml
# Ubuntu (recommended for RF tools)
base_image: "ubuntu:24.04"      # Noble Numbat (latest LTS)
base_image: "ubuntu:22.04"      # Jammy Jellyfish (stable)
base_image: "ubuntu:20.04"      # Focal Fossa (older but stable)

# Debian (alternative)
base_image: "debian:bookworm"   # Debian 12 (latest stable)
base_image: "debian:bullseye"   # Debian 11

# Fedora (for cutting-edge packages)
base_image: "fedora:39"

# Alpine (for minimal images)
base_image: "alpine:3.19"       # Warning: May lack some RF libraries
```

### Which base to pick

| Base | Pick it when |
|---|---|
| Ubuntu 24.04 | You want recent packages and wide hardware support, you build a general-purpose SDR image, or you are new to recipes |
| Ubuntu 22.04 | You need proven stability, long-term support, or you work in an enterprise environment |
| Debian | You prefer Debian's package stability, want slightly less overhead than Ubuntu, or run Debian-based infrastructure |
| Alpine | Image size matters most (a base under 50 MB). Few RF libraries are packaged, so expect to compile a lot yourself |

{{< callout type="warning" title="Check the architecture" >}}
Make sure the base image exists for your target architecture (amd64, arm64 or riscv64). Multi-architecture images such as `ubuntu:24.04` cover all three.
{{< /callout >}}

## Installing packages

### System packages (APT)

List system packages under `packages`. Comments help keep long lists readable:

```yaml
packages:
  # Development tools
 - build-essential
 - cmake
 - git
 - pkg-config
  
  # Libraries
 - libusb-1.0-0-dev
 - libfftw3-dev
 - libsoapysdr-dev
  
  # SDR tools
 - rtl-sdr
 - hackrf
 - gqrx-sdr
 - gnuradio
  
  # Utilities
 - wget
 - curl
 - vim
```

Good habits:

- Group related packages and label each group with a comment.
- Add the `-dev` package of every library you compile against.
- List all build dependencies here, so they are installed before any compilation step in `run_commands`.

### Python packages (pip)

List Python packages under `python_packages`. You can pin versions, install from Git and request extras:

```yaml
python_packages:
  # Basic scientific stack
 - numpy
 - scipy
 - matplotlib
  
  # Specific versions
 - "pandas==2.0.0"
 - "scikit-learn>=1.3.0"
  
  # From git repositories
 - "git+https://github.com/pyrtlsdr/pyrtlsdr.git"
 - "git+https://github.com/mossmann/hackrf.git@master#subdirectory=host/libhackrf/python"
  
  # With extras
 - "matplotlib[all]"
 - "jupyter[notebook]"
```

The version syntax is pip's:

```yaml
python_packages:
 - "package"           # Latest version
 - "package==1.0.0"    # Exact version
 - "package>=1.0.0"    # Minimum version
 - "package>=1.0,<2.0" # Version range
```

## Running commands (run_commands)

Everything under `run_commands` runs in Bash during the build, in order.

### Simple commands

One command per line:

```yaml
run_commands:
 - "echo 'Build starting...'"
 - "mkdir -p /opt/tools"
 - "useradd -m rfuser"
 - "chmod 755 /opt/tools"
```

### Multi-line commands

For several steps that belong together, use YAML's pipe (`|`) syntax:

```yaml
run_commands:
 - |
    echo "Installing custom tool..."
    cd /opt
    git clone https://github.com/user/tool.git
    cd tool
    make
    make install
```

### Helper functions

RF Swift's build helpers are available in every recipe. They print coloured messages, retry network steps, and clone and build CMake projects and GNU Radio out-of-tree modules:

```yaml
run_commands:
  # Colored output
 - "colorecho 'Starting RTL-SDR installation...'"
  
  # Install with retry logic
 - "installfromnet 'git clone https://github.com/osmocom/rtl-sdr.git'"
  
  # Build from source with CMake
 - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      '' \
      'rtlsdr_install' \
      -DINSTALL_UDEV_RULES=ON
  
  # GNU Radio OOT modules
 - |
    grclone_and_build \
      'https://github.com/osmocom/gr-osmosdr.git' \
      'gr-osmosdr' \
      'gr_osmosdr_install'
  
  # Success message
 - "goodecho 'Installation complete!'"
```

Every helper and its arguments are described in the [helper functions reference](/docs/development/building-images/).

## Complete examples

### Example 1: a simple SDR image

Basic SDR tools for learning and experimenting:

```yaml
base_image: "ubuntu:24.04"
tag: "sdr-beginner:latest"

packages:
 - rtl-sdr
 - gqrx-sdr
 - dump1090-mutability
 - multimon-ng

python_packages:
 - numpy
 - matplotlib

run_commands:
 - "echo 'SDR tools ready!'"
```

Build it with `rfswift image build -r sdr-beginner.yaml`.

### Example 2: a GNU Radio development environment

GNU Radio 3.10 built from source, with the gr-osmosdr out-of-tree module:

```yaml
base_image: "ubuntu:24.04"
tag: "gnuradio-dev:3.10"

packages:
  # GNU Radio dependencies
 - git
 - cmake
 - g++
 - libboost-all-dev
 - libgmp-dev
 - swig
 - python3-numpy
 - python3-mako
 - python3-sphinx
 - python3-lxml
 - doxygen
 - libfftw3-dev
 - libsdl1.2-dev
 - libgsl-dev
 - libqwt-qt5-dev
 - libqt5opengl5-dev
 - python3-pyqt5
 - liblog4cpp5-dev
 - libzmq3-dev
  
  # Additional tools
 - vim
 - git
 - pkg-config

python_packages:
 - numpy
 - scipy
 - matplotlib

run_commands:
  # Build GNU Radio from source
 - "colorecho 'Building GNU Radio 3.10...'"
 - |
    cmake_clone_and_build \
      'https://github.com/gnuradio/gnuradio.git' \
      'build' \
      'v3.10.9.2' \
      'v3.10.9.2' \
      'gnuradio_install' \
      -DCMAKE_BUILD_TYPE=Release \
      -DENABLE_GR_QTGUI=ON \
      -DENABLE_PYTHON=ON
  
  # Build gr-osmosdr
 - "colorecho 'Building gr-osmosdr...'"
 - |
    grclone_and_build \
      'https://github.com/osmocom/gr-osmosdr.git' \
      'gr-osmosdr' \
      'gr_osmosdr_install'
  
 - "goodecho 'GNU Radio environment ready!'"
```

### Example 3: several SDR devices

Drivers for RTL-SDR, HackRF, Airspy and LimeSDR, built from source:

```yaml
base_image: "ubuntu:24.04"
tag: "multi-sdr:latest"

packages:
  # Build essentials
 - build-essential
 - cmake
 - git
 - pkg-config
 - libusb-1.0-0-dev
  
  # Libraries
 - libfftw3-dev
 - libsoapysdr-dev
  
  # Pre-built tools
 - gqrx-sdr

python_packages:
 - numpy
 - scipy
 - pyrtlsdr

run_commands:
  # RTL-SDR
 - "colorecho 'Installing RTL-SDR support...'"
 - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      '' \
      'rtlsdr_install' \
      -DINSTALL_UDEV_RULES=ON \
      -DDETACH_KERNEL_DRIVER=ON
  
  # HackRF
 - "colorecho 'Installing HackRF support...'"
 - |
    cmake_clone_and_build \
      'https://github.com/mossmann/hackrf.git' \
      'host/build' \
      'master' \
      '' \
      'hackrf_install' \
      -DINSTALL_UDEV_RULES=ON
  
  # Airspy
 - "colorecho 'Installing Airspy support...'"
 - |
    cmake_clone_and_build \
      'https://github.com/airspy/airspyone_host.git' \
      'build' \
      'master' \
      '' \
      'airspy_install' \
      -DINSTALL_UDEV_RULES=ON
  
  # LimeSDR (via SoapySDR)
 - "colorecho 'Installing LimeSDR support...'"
 - |
    cmake_clone_and_build \
      'https://github.com/myriadrf/LimeSuite.git' \
      'builddir' \
      'master' \
      '' \
      'limesdr_install'
  
 - "goodecho 'All SDR devices supported!'"
```

### Example 4: Bluetooth analysis tools

The BlueZ stack, Ubertooth and Python tools for Bluetooth work:

```yaml
base_image: "ubuntu:24.04"
tag: "bluetooth-tools:latest"

packages:
  # Bluetooth stack
 - bluez
 - bluez-tools
 - bluetooth
 - libbluetooth-dev
  
  # Build tools
 - build-essential
 - cmake
 - git
 - libusb-1.0-0-dev
  
  # Analysis tools
 - wireshark-common
 - tcpdump

python_packages:
 - pybluez
 - scapy

run_commands:
  # Ubertooth tools
 - "colorecho 'Installing Ubertooth...'"
 - |
    cmake_clone_and_build \
      'https://github.com/greatscottgadgets/ubertooth.git' \
      'host/build' \
      'master' \
      '' \
      'ubertooth_install'
  
  # Install additional Python tools
 - "pip3install crackle"
  
 - "goodecho 'Bluetooth tools ready!'"
```

### Example 5: an RF assessment toolkit

SDR, analysis and YARD Stick One tools on top of the RF Swift core image:

```yaml
base_image: "penthertz/rfswift_resolute:core"
tag: "rf-hacking:latest"

packages:
  # SDR tools
 - gqrx-sdr
 - inspectrum
 - urh
  
  # RF utilities
 - kalibrate-rtl
 - multimon-ng
 - dump1090-mutability
  
  # Analysis
 - wireshark
 - audacity

python_packages:
 - numpy
 - scipy
 - matplotlib
 - jupyter
 - rfcat

run_commands:
  # Universal Radio Hacker with dependencies
 - "colorecho 'Setting up Universal Radio Hacker...'"
 - "pip3install pyqt5 numpy psutil cython"
  
  # Install YardStick One tools
 - "colorecho 'Installing RfCat for YardStick One...'"
 - "pip3install git+https://github.com/atlas0fd00m/rfcat.git"
  
  # Create workspace
 - "mkdir -p /root/rf-projects"
  
 - "goodecho 'RF Hacking suite ready!'"
```

## Advanced techniques

### Keeping the image small

Build in `/tmp`, then delete sources and APT caches at the end:

```yaml
base_image: "ubuntu:24.04"
tag: "optimized-sdr:latest"

packages:
 - build-essential
 - cmake
 - libusb-1.0-0-dev

run_commands:
  # Build in /tmp for cleanup
 - "cd /tmp"
  
  # Build RTL-SDR
 - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      '' \
      'rtlsdr_install'
  
  # Cleanup to reduce image size
 - "rm -rf /tmp/*"
 - "apt-get clean"
 - "rm -rf /var/lib/apt/lists/*"
```

### Different steps per architecture

Test `uname -m` to run architecture-specific steps:

```yaml
base_image: "ubuntu:24.04"
tag: "arch-specific:latest"

run_commands:
  # Build different components based on architecture
 - |
    if [ "$(uname -m)" = "aarch64" ]; then
      colorecho "Building for ARM64..."
      # ARM-specific optimizations
    else
      colorecho "Building for x86_64..."
      # x86-specific optimizations
    fi
```

### Pinning versions for reproducible builds

Pin APT and pip versions, and pass a commit to the build helper (fourth argument of `cmake_clone_and_build`):

```yaml
base_image: "ubuntu:24.04"
tag: "reproducible-sdr:v1.0.0"

packages:
 - rtl-sdr=0.6.0-1
 - hackrf=2021.03.1-2

python_packages:
 - "numpy==1.24.3"
 - "scipy==1.10.1"
 - "matplotlib==3.7.1"

run_commands:
  # Pin a specific git commit (fourth argument)
 - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      'a1b2c3d4e5f6' \
      'rtlsdr_install'
```

### Environment variables

Append `export` lines to the shell profile:

```yaml
base_image: "ubuntu:24.04"
tag: "custom-env:latest"

run_commands:
  # Set environment variables
 - "echo 'export PATH=/opt/tools/bin:$PATH' >> /root/.bashrc"
 - "echo 'export LD_LIBRARY_PATH=/opt/tools/lib:$LD_LIBRARY_PATH' >> /root/.bashrc"
 - "echo 'export PYTHONPATH=/opt/tools/python:$PYTHONPATH' >> /root/.bashrc"
```

## Building your recipe

### Build commands

```bash
# Build with default settings
rfswift image build -r my-recipe.yaml

# Build without cache (fresh build)
rfswift image build -r my-recipe.yaml --no-cache

# Override tag from command line
rfswift image build -r my-recipe.yaml -t custom-tag:latest
```

### Options

```bash
rfswift image build [options]

Options:
  -r, --recipe string    Path to YAML recipe file (default "rfswift-recipe.yaml")
  -t, --tag string       Override tag from recipe
  --no-cache            Build without using cache
  -h, --help            Help for build command
```

### What happens during a build

When you run `rfswift image build -r recipe.yaml`, RF Swift:

1. checks the YAML structure;
2. generates a Dockerfile from it;
3. prepares the build context;
4. runs the Docker build;
5. tags the resulting image;
6. removes its temporary files.

## Good practices

### Keep recipes organised

Group packages by purpose and comment each group:

```yaml
# Good: Organized and commented
base_image: "ubuntu:24.04"
tag: "my-sdr:v1.0"

packages:
  # Build dependencies
 - build-essential
 - cmake
  
  # SDR libraries
 - libusb-1.0-0-dev
 - libfftw3-dev
  
  # SDR tools
 - rtl-sdr
 - gqrx-sdr

python_packages:
  # Scientific computing
 - numpy
 - scipy
  
  # SDR-specific
 - pyrtlsdr

run_commands:
 - "colorecho 'Build starting...'"
 - "goodecho 'Build complete!'"
```

### Keep recipes in Git

Version your recipes and tag releases, so a team can rebuild the same image later:

```bash
# Store recipes in git
git add recipes/
git commit -m "Add SDR recipe v1.0"
git tag recipe-sdr-v1.0

# Share with team
git push origin main --tags
```

### Test before you share

Build under a test tag, create a lab from it and check the tools:

```bash
# Build locally
rfswift image build -r test-recipe.yaml -t test:dev

# Test the image
rfswift container create -i test:dev -n test-container

# Verify tools work
rfswift container shell -c test-container
```

### Document the recipe

A short header says what the recipe is for and what it was tested with:

```yaml
# SDR Analysis Container v1.2
# Author: Your Name
# Purpose: General purpose SDR analysis with RTL-SDR and HackRF support
# Last updated: 2024-01-12

base_image: "ubuntu:24.04"
tag: "sdr-analysis:v1.2"

# Core SDR packages - tested with RTL-SDR V3 and HackRF One
packages:
 - rtl-sdr
 - hackrf

# Python stack for signal processing
python_packages:
 - numpy>=1.24.0  # Required for scipy
 - scipy>=1.10.0  # Signal processing
```

## Troubleshooting

### "Package not found"

The package name is wrong, or the package does not exist in the base image's repositories. Check the exact name for that distribution:

```yaml
# Problem: Package name incorrect or not available
packages:
 - rtl-sdr-tools  # Wrong name

# Solution: Use correct package name
packages:
 - rtl-sdr
```

### A Python package fails to install

It usually needs system libraries that are missing. Install them under `packages` first:

```yaml
# Problem: Missing system dependencies
python_packages:
 - matplotlib  # Needs system libraries

# Solution: Install system dependencies first
packages:
 - python3-dev
 - libfreetype6-dev
 - libpng-dev
python_packages:
 - matplotlib
```

### "Command not found" in run_commands

The helper functions are always available, so this is almost always a syntax error. Check the quoting and the line continuations:

```yaml
# Problem: Helper functions not available
run_commands:
 - "cmake_clone_and_build ..."  # Fails

# Solution: They're automatically available - check syntax
run_commands:
 - |
    cmake_clone_and_build \
      'https://...' \
      'build' \
      'master' \
      '' \
      'install_name'
```

### Checking a recipe before a long build

There is no dry-run flag yet. Check the YAML syntax, then build into a throwaway tag:

```bash
# Check YAML syntax
python3 -c "import yaml; yaml.safe_load(open('recipe.yaml'))"

# There is no dry-run flag yet: build into a throwaway tag to validate
rfswift image build -r recipe.yaml -t recipe-check:test
```

### Debugging a failing build

Rebuild with full output, or try the recipe's commands by hand in a plain lab:

```bash
# Build with verbose output
docker build --progress=plain -t test:debug .

# Check generated Dockerfile
# (RF Swift generates it in /tmp during build)

# Interactive debugging
rfswift container create -i ubuntu:24.04 -n debug
# Manually test commands from recipe
```

## Sharing recipes

A small Git repository, organised by category, is enough to share recipes with a team or the community:

````bash
# Create a recipe repository
mkdir rf-swift-recipes
cd rf-swift-recipes

# Organize by category
mkdir -p sdr bluetooth wifi automotive

# Add README with usage instructions
cat > README.md << 'EOF'
# RF Swift Recipe Collection

## SDR Recipes
- `sdr/rtlsdr-basic.yaml` - Basic RTL-SDR setup
- `sdr/multi-hardware.yaml` - Multiple SDR support

## Usage
```bash
rfswift image build -r sdr/rtlsdr-basic.yaml
```
EOF

# Share on GitHub
git init
git add .
git commit -m "Initial recipe collection"
git remote add origin https://github.com/yourusername/rf-swift-recipes.git
git push -u origin main
````

Where to find and share recipes:

- the [official RF Swift recipes](https://github.com/PentHertz/RF-Swift/blob/main/recipes);
- the [RF Swift recipe repository](https://github.com/PentHertz/RF-Swift-Recipes), which accepts contributions;
- the [Discord](https://discord.gg/NS3HayKrpA) community.

{{< callout type="tip" >}}
Start with a small recipe and grow it: build, test, then add the next tool.
{{< /callout >}}

## Related documentation

{{< cards >}}
  {{< card link="/docs/development/building-images/" title="Helper functions" subtitle="Every helper you can call from a recipe" >}}
  {{< card link="/docs/development/compiling-rfswift/" title="Compile RF Swift" subtitle="Build the RF Swift binary from source" >}}
  {{< card link="/docs/guide/list-of-images/" title="Official images" subtitle="Browse the pre-built RF Swift images" >}}
{{< /cards >}}
