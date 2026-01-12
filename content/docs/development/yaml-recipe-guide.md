---
title: YAML Recipe Guide
weight: 2
prev: /docs/development/compiling-rfswift
next: /docs/development/helper-functions
cascade:
  type: docs
---

# YAML Recipe Guide for RF Swift

YAML recipes provide a simplified, readable way to build custom RF Swift container images without writing complex Dockerfiles. This guide covers everything you need to know about creating, customizing, and building images with YAML recipes.

{{< callout type="info" >}}
**Why YAML Recipes?** They eliminate the complexity of Dockerfiles while providing all the power you need for RF and hardware security tool containers. Perfect for quick prototyping and sharing configurations!
{{< /callout >}}

---

## 🚀 Quick Start

### Your First YAML Recipe

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
rfswift build -r my-sdr.yaml
```

That's it! You now have a custom SDR container image.

---

## 📋 YAML Recipe Structure

### Complete Field Reference

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

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `base_image` | String | ✅ Yes | Base Docker image (e.g., `ubuntu:24.04`) |
| `tag` | String | ✅ Yes | Name and tag for resulting image |
| `packages` | List | ⬜ No | APT/system packages to install |
| `python_packages` | List | ⬜ No | Python packages to install via pip |
| `run_commands` | List | ⬜ No | Custom bash commands to execute |
| `context` | String | ⬜ No | Build context directory (default: `.`) |

---

## 🎨 Choosing a Base Image

### Official RF Swift Base Images

Start from RF Swift's optimized base images for best results:

```yaml
# Core RF Swift base (recommended)
base_image: "penthertz/rfswift:core"

# Ubuntu Noble (24.04) - Latest LTS
base_image: "penthertz/rfswift_noble:base"

# Ubuntu Jammy (22.04) - Stable LTS
base_image: "ubuntu:22.04"
```

### Standard Base Images

For building from scratch:

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

### Choosing the Right Base

**Use Ubuntu 24.04 when:**
- ✅ You want the latest packages and kernel support
- ✅ Building general-purpose SDR containers
- ✅ You need wide hardware compatibility
- ✅ You're new to RF Swift development

**Use Ubuntu 22.04 when:**
- ✅ You need proven stability
- ✅ Working with enterprise environments
- ✅ Long-term support is critical

**Use Debian when:**
- ✅ You prefer Debian's package stability
- ✅ You need minimal overhead beyond Ubuntu
- ✅ Working in Debian-based infrastructure

**Use Alpine when:**
- ✅ Image size is critical (<50MB base)
- ⚠️ Warning: Limited RF library support, manual compilation often needed

{{< callout type="warning" >}}
**Architecture Note:** Ensure your base image supports your target architecture (amd64, arm64, or riscv64). Use multi-arch images like `ubuntu:24.04` which support multiple architectures.
{{< /callout >}}

---

## 📦 Package Management

### System Packages (APT)

The `packages` section installs system packages using apt:

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

**Best Practices:**
- Group related packages together with comments
- Use `-dev` packages for libraries you'll compile against
- Include all build dependencies before compilation steps

### Python Packages (pip)

The `python_packages` section installs Python packages:

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

**Version Specifications:**
```yaml
python_packages:
  - "package"           # Latest version
  - "package==1.0.0"    # Exact version
  - "package>=1.0.0"    # Minimum version
  - "package>=1.0,<2.0" # Version range
```

---

## 🔧 Custom Commands (run_commands)

The `run_commands` section executes bash commands during the build:

### Simple Commands

```yaml
run_commands:
  - "echo 'Build starting...'"
  - "mkdir -p /opt/tools"
  - "useradd -m rfuser"
  - "chmod 755 /opt/tools"
```

### Multi-line Commands

Use YAML's pipe (`|`) syntax for complex commands:

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

### Using Helper Functions

RF Swift provides powerful helper functions:

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

See the [Helper Functions Reference](/docs/development/helper-functions) for complete documentation.

---

## 📚 Complete Examples

### Example 1: Simple SDR Image

Basic SDR tools for learning and experimentation:

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

Build: `rfswift build -r sdr-beginner.yaml`

---

### Example 2: GNU Radio Development Environment

Complete GNU Radio setup with OOT modules:

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

---

### Example 3: Multi-SDR Hardware Support

Support for multiple SDR devices:

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

---

### Example 4: Bluetooth Analysis Tools

Specialized Bluetooth security container:

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

---

### Example 5: RF Hacking Suite

Complete RF security assessment toolkit:

```yaml
base_image: "penthertz/rfswift:core"
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

---

## 🎯 Advanced Techniques

### Multi-stage Builds (Using run_commands)

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

### Conditional Builds

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

### Version Pinning for Reproducibility

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
  # Pin specific git commits
  - |
    cmake_clone_and_build \
      'https://github.com/osmocom/rtl-sdr.git' \
      'build' \
      'master' \
      'a1b2c3d4e5f6'  # Specific commit
      'rtlsdr_install'
```

### Environment Variables

```yaml
base_image: "ubuntu:24.04"
tag: "custom-env:latest"

run_commands:
  # Set environment variables
  - "echo 'export PATH=/opt/tools/bin:$PATH' >> /root/.bashrc"
  - "echo 'export LD_LIBRARY_PATH=/opt/tools/lib:$LD_LIBRARY_PATH' >> /root/.bashrc"
  - "echo 'export PYTHONPATH=/opt/tools/python:$PYTHONPATH' >> /root/.bashrc"
```

---

## 🛠️ Building Your Recipe

### Basic Build

```bash
# Build with default settings
rfswift build -r my-recipe.yaml

# Build without cache (fresh build)
rfswift build -r my-recipe.yaml --no-cache

# Override tag from command line
rfswift build -r my-recipe.yaml -t custom-tag:latest
```

### Build Options

```bash
rfswift build [options]

Options:
  -r, --recipe string    Path to YAML recipe file (default "rfswift-recipe.yaml")
  -t, --tag string       Override tag from recipe
  --no-cache            Build without using cache
  -h, --help            Help for build command
```

### Build Process

When you run `rfswift build -r recipe.yaml`, RF Swift:

1. **Validates** the YAML structure
2. **Generates** an optimized Dockerfile
3. **Prepares** the build context
4. **Executes** the Docker build
5. **Tags** the resulting image
6. **Cleans up** temporary files

---

## ✅ Best Practices

### Organization

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

### Version Control

```bash
# Store recipes in git
git add recipes/
git commit -m "Add SDR recipe v1.0"
git tag recipe-sdr-v1.0

# Share with team
git push origin main --tags
```

### Testing

```bash
# Build locally
rfswift build -r test-recipe.yaml -t test:dev

# Test the image
rfswift run -i test:dev -n test-container

# Verify tools work
rfswift exec -c test-container
```

### Documentation

Add comments to your recipes:

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

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Package not found"**
```yaml
# Problem: Package name incorrect or not available
packages:
  - rtl-sdr-tools  # Wrong name

# Solution: Use correct package name
packages:
  - rtl-sdr
```

**Issue: "Python package install fails"**
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

**Issue: "Command not found in run_commands"**
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

### Validation

Before building, validate your YAML:

```bash
# Check YAML syntax
python3 -c "import yaml; yaml.safe_load(open('recipe.yaml'))"

# Dry-run (validate without building)
rfswift build -r recipe.yaml --dry-run  # Coming soon
```

### Debugging Builds

```bash
# Build with verbose output
docker build --progress=plain -t test:debug .

# Check generated Dockerfile
# (RF Swift generates it in /tmp during build)

# Interactive debugging
rfswift run -i ubuntu:24.04 -n debug
# Manually test commands from recipe
```

---

## 📖 Recipe Library

### Sharing Recipes

Share your recipes with the community:

```bash
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
rfswift build -r sdr/rtlsdr-basic.yaml
```
EOF

# Share on GitHub
git init
git add .
git commit -m "Initial recipe collection"
git remote add origin https://github.com/yourusername/rf-swift-recipes.git
git push -u origin main
```

### Community Recipes

Browse community recipes:
- [Official RF Swift Recipes](https://github.com/PentHertz/RF-Swift-Recipes)
- Share your recipes on Discord
- Contribute to the recipe library

---

## 🔗 Related Documentation

{{< cards >}}
  {{< card link="/docs/development/helper-functions" title="Helper Functions" icon="command-line" subtitle="Complete reference for all helper functions" >}}
  {{< card link="/docs/development/compiling-rfswift" title="Compile RF Swift" icon="chip" subtitle="Build the RF Swift binary from source" >}}
  {{< card link="/docs/guide/list-of-images" title="Official Images" icon="cube" subtitle="Browse pre-built RF Swift images" >}}
{{< /cards >}}

---

{{< callout emoji="💡" >}}
**Pro Tip:** Start with a simple recipe and iterate. Build, test, refine. YAML recipes make experimentation fast and easy!
{{< /callout >}}

{{< callout emoji="🤝" >}}
**Contribute:** Share your recipes with the community! Submit them to the [RF Swift Recipe Repository](https://github.com/PentHertz/RF-Swift-Recipes) or share on [Discord](https://discord.gg/NS3HayKrpA).
{{< /callout >}}