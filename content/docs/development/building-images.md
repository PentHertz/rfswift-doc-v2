---
title: Helper Functions Reference
weight: 3
prev: /docs/development/building-custom-images
cascade:
  type: docs
---

# RF Swift Helper Functions Reference

This page documents the Bash helper functions used in the RF Swift container build system. These utilities simplify logging, dependency management, source code builds, and network operations.

Most helpers implement retry logic and consistent logging to ensure resilience and ease of use when building custom images or tools.

{{< callout type="info" >}}
**New!** These helper functions can now be used in both **YAML recipe files** and traditional **Dockerfiles**, making custom image creation easier than ever!
{{< /callout >}}

---

## 🎨 Output & Logging Functions

These functions provide consistent, colored output for different message types during container builds.

### `colorecho <message>`

Prints a blue-colored informational message to stdout.

**Usage:**
```bash
colorecho "Starting installation process..."
colorecho "Configuration phase complete"
```

**Output:**
```
[INFO] Starting installation process...
```

**When to use:**
- Progress updates during long operations
- Neutral informational messages
- Step indicators in complex builds

---

### `goodecho <message>`

Prints a green-colored success message to stdout.

**Usage:**
```bash
goodecho "Installation completed successfully!"
goodecho "All tests passed"
```

**Output:**
```
[SUCCESS] Installation completed successfully!
```

**When to use:**
- Confirmation of successful operations
- Completion messages
- Positive status updates

---

### `criticalecho <message>`

Prints a red-colored error message to stderr and exits with code 1.

**Usage:**
```bash
if [ ! -f "required_file.txt" ]; then
    criticalecho "Required file not found!"
fi
```

**Output:**
```
[ERROR] Required file not found!
```

**When to use:**
- Unrecoverable errors that should stop the build
- Missing critical dependencies
- Failed validation checks

{{< callout type="warning" >}}
**Important:** `criticalecho` will terminate the build process. Use `criticalecho-noexit` if you need to log errors without stopping execution.
{{< /callout >}}

---

### `criticalecho-noexit <message>`

Prints a red-colored error message to stderr without exiting.

**Usage:**
```bash
if ! some_optional_operation; then
    criticalecho-noexit "Optional feature installation failed, continuing..."
fi
```

**Output:**
```
[ERROR] Optional feature installation failed, continuing...
```

**When to use:**
- Non-critical errors that allow continued execution
- Warning about missing optional features
- Logging errors while attempting fallback solutions

---

## 📦 Package Installation Helpers

### `installfromnet <command>`

Executes a shell command up to 5 times with 15-second intervals between attempts. Essential for handling network instability during builds.

**Parameters:**
- `command`: Any shell command (wrapped in quotes if it contains spaces)

**Usage:**
```bash
# Simple download
installfromnet "wget http://example.com/tool.tar.gz"

# Git clone
installfromnet "git clone https://github.com/user/repo.git"

# Complex command with pipes
installfromnet "curl -L https://example.com/install.sh | bash"
```

**In YAML recipes:**
```yaml
base_image: "ubuntu:24.04"
tag: "my-custom-image:latest"

run_commands:
  - "installfromnet 'wget http://example.com/tool.tar.gz'"
  - "installfromnet 'git clone https://github.com/user/repo.git'"
```

**In Dockerfiles:**
```dockerfile
RUN . /tmp/common.sh && \
    installfromnet "wget http://example.com/tool.tar.gz" && \
    tar xzf tool.tar.gz
```

**Behavior:**
- Attempt 1: Executes immediately
- Attempts 2-5: Wait 15 seconds between each retry
- Success: Continues to next command
- All attempts fail: Build fails with error message

**Real-world example:**
```bash
# Building RTL-SDR using the cmake_clone_and_build helper
# This automatically handles download retries, build, and installation
cmake_clone_and_build \
    "https://github.com/osmocom/rtl-sdr.git" \
    "build" \
    "v0.6.0" \
    "v0.6.0" \
    "rtlsdr_install" \
    -DINSTALL_UDEV_RULES=ON \
    -DDETACH_KERNEL_DRIVER=ON

# Much simpler than manual download/build/install!
```

**When to use:**
- Any network operation (wget, curl, git clone)
- Downloading from mirrors that might be temporarily unavailable
- Building from source that requires fetching remote dependencies

---

### `install_dependencies "<packages>"`

Installs Debian/Ubuntu packages using `apt-fast` (a parallel apt wrapper) with automatic retry logic.

**Parameters:**
- `packages`: Space-separated list of package names (must be quoted)

**Usage:**

**In YAML recipes (recommended):**
```yaml
base_image: "ubuntu:24.04"
tag: "gnuradio-image:latest"

packages:
  - python3-numpy
  - python3-scipy
  - g++
  - cmake
  - libusb-1.0-0-dev
  - libfftw3-dev
  - libboost-all-dev
```

**In Bash/Dockerfiles:**
```bash
# Single package
install_dependencies "python3-numpy"

# Multiple packages
install_dependencies "python3-numpy python3-scipy g++ cmake"

# Development libraries
install_dependencies "libusb-1.0-0-dev libfftw3-dev libboost-all-dev"
```

**Features:**
- Automatically runs `apt-get update` if needed
- Uses `apt-fast` for parallel downloads (faster than standard apt)
- Retries on network failures
- Logs installed packages for tracking

**Real-world example:**

**YAML Recipe - Complete GNU Radio Environment:**
```yaml
base_image: "ubuntu:24.04"
tag: "gnuradio:latest"

packages:
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
  - python3-yaml
  - python3-click
  - python3-click-plugins
  - python3-zmq
  - python3-scipy
  - python3-gi
  - python3-gi-cairo
  - gobject-introspection
  - gir1.2-gtk-3.0

run_commands:
  - "echo 'GNU Radio dependencies installed'"
```

**Bash - Installing dependencies for GNU Radio:**
```bash
# Installing dependencies for GNU Radio
install_dependencies "git cmake g++ libboost-all-dev libgmp-dev \
    swig python3-numpy python3-mako python3-sphinx python3-lxml \
    doxygen libfftw3-dev libsdl1.2-dev libgsl-dev libqwt-qt5-dev \
    libqt5opengl5-dev python3-pyqt5 liblog4cpp5-dev libzmq3-dev \
    python3-yaml python3-click python3-click-plugins python3-zmq \
    python3-scipy python3-gi python3-gi-cairo gobject-introspection \
    gir1.2-gtk-3.0"
```

**When to use:**
- Installing system libraries
- Setting up build environments
- Adding runtime dependencies
- Installing development tools

---

### `check_and_install_lib <lib-name> <pkg-config-name>`

Checks if a library is installed using `pkg-config`. If not found, installs it via `apt-fast`.

**Parameters:**
- `lib-name`: Debian package name
- `pkg-config-name`: Name used by pkg-config (usually without -dev suffix)

**Usage:**
```bash
# Check for libusb
check_and_install_lib "libusb-1.0-0-dev" "libusb-1.0"

# Check for FFTW
check_and_install_lib "libfftw3-dev" "fftw3"

# Check for OpenSSL
check_and_install_lib "libssl-dev" "openssl"
```

**Behavior:**
```bash
# If library is found:
[INFO] libusb-1.0 is already installed

# If library is not found:
[INFO] libusb-1.0 not found, installing libusb-1.0-0-dev...
[SUCCESS] libusb-1.0-0-dev installed successfully
```

**Real-world example:**
```bash
# Checking multiple libraries before building from source
check_and_install_lib "libusb-1.0-0-dev" "libusb-1.0"
check_and_install_lib "libfftw3-dev" "fftw3"
check_and_install_lib "libpython3-dev" "python3"

# Now safe to build
cd my-project
mkdir build && cd build
cmake ..
make -j$(nproc)
```

**When to use:**
- Before building software from source
- Creating conditional builds based on available libraries
- Avoiding redundant package installations
- Validating build prerequisites

---

## 🐍 Python Package Management

### `pip3install <args>`

Installs Python packages using `pip3` with automatic retry logic and proper error handling.

**Parameters:**
- `args`: Any valid pip install arguments

**Usage:**

**In YAML recipes (recommended):**
```yaml
base_image: "ubuntu:24.04"
tag: "sdr-tools:latest"

python_packages:
  - numpy
  - scipy
  - matplotlib
  - pyrtlsdr
  - "gnuradio==3.10.5.0"  # Specific version
```

**In Bash/Dockerfiles:**
```bash
# Single package
pip3install numpy

# Specific version
pip3install "scipy==1.9.0"

# From requirements file
pip3install -r requirements.txt

# From git repository
pip3install git+https://github.com/user/python-package.git

# With extras
pip3install "matplotlib[all]"

# Editable install
pip3install -e .
```

**Features:**
- Retries on network failures (up to 5 attempts)
- Uses `--break-system-packages` flag for container environments
- Logs installed packages
- Handles timeout errors gracefully

**Real-world examples:**

**Example 1: Data Science Stack**
```bash
pip3install numpy
pip3install scipy
pip3install matplotlib
pip3install pandas
pip3install scikit-learn
```

**Example 2: RF Signal Processing**
```bash
pip3install numpy scipy
pip3install gnuradio
pip3install pyrtlsdr
pip3install pySoapySDR
```

**Example 3: Requirements File**
```bash
# Create requirements.txt
cat > requirements.txt << EOF
numpy>=1.21.0
scipy>=1.7.0
matplotlib>=3.4.0
pyserial>=3.5
EOF

# Install all at once
pip3install -r requirements.txt
```

**Example 4: Installing from GitHub**
```bash
# Install latest development version
pip3install git+https://github.com/mossmann/hackrf.git@master#subdirectory=host/libhackrf/python

# Install specific commit
pip3install git+https://github.com/osmocom/pyosmo-sdr@a1b2c3d
```

**When to use:**
- Installing Python dependencies for tools
- Setting up Python-based SDR software
- Installing signal processing libraries
- Adding scripting capabilities to containers

{{< callout type="info" >}}
**Best Practice:** For reproducible builds, always specify package versions in production images:
```bash
pip3install "numpy==1.24.0" "scipy==1.10.0"
```
{{< /callout >}}

---

## 🧬 Git and Source Management

### `gitinstall <repo-url> <method> <branch>`

Clones or updates a Git repository with automatic tracking and metadata logging.

**Parameters:**
- `repo-url`: Full HTTPS or SSH URL to Git repository
- `method`: Installation method name (used for logging/tracking)
- `branch`: Git branch, tag, or commit to checkout (optional, defaults to default branch)

**Usage:**
```bash
# Clone default branch
gitinstall "https://github.com/osmocom/rtl-sdr.git" "rtlsdr_install"

# Clone specific branch
gitinstall "https://github.com/mossmann/hackrf.git" "hackrf_install" "master"

# Clone specific tag
gitinstall "https://github.com/gnuradio/gnuradio.git" "gnuradio_install" "v3.10.5.0"
```

**Features:**
- Automatically initializes and updates submodules
- Logs repository metadata to `/var/lib/db/rfswift_github.lst`
- Records: method name, repository URL, commit hash, branch, clone date
- If repository exists, pulls latest changes instead of re-cloning
- Handles shallow clones and full clones appropriately

**Metadata Logging:**
The function creates an entry in `/var/lib/db/rfswift_github.lst`:
```
rtlsdr_install|https://github.com/osmocom/rtl-sdr.git|a1b2c3d4e5f6|master|2024-01-12
```

**Real-world examples:**

**Example 1: Installing RTL-SDR**
```bash
gitinstall "https://github.com/osmocom/rtl-sdr.git" "rtlsdr_install"
cd rtl-sdr
mkdir build && cd build
cmake ../ -DINSTALL_UDEV_RULES=ON -DDETACH_KERNEL_DRIVER=ON
make -j$(nproc)
make install
ldconfig
```

**Example 2: GNU Radio OOT Module**
```bash
gitinstall "https://github.com/osmocom/gr-osmosdr.git" "gr_osmosdr_install" "master"
cd gr-osmosdr
mkdir build && cd build
cmake ..
make -j$(nproc)
make install
ldconfig
```

**Example 3: Multiple Related Repositories**
```bash
# Install entire SDR suite
gitinstall "https://github.com/osmocom/rtl-sdr.git" "rtlsdr_install"
gitinstall "https://github.com/mossmann/hackrf.git" "hackrf_install"
gitinstall "https://github.com/greatscottgadgets/ubertooth.git" "ubertooth_install"

# Build each one
for repo in rtl-sdr hackrf ubertooth; do
    cd $repo
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc)
    make install
    cd ../..
done
ldconfig
```

**When to use:**
- Cloning source code for compilation
- Tracking which repositories are in the container
- Keeping source code for future reference
- Enabling reproducible builds

---

### `cmake_clone_and_build <repo-url> <build-dir> <branch> <reset-commit> <method> [cmake-args...]`

All-in-one function that clones a repository and builds it using CMake in a single command.

**Parameters:**
1. `repo-url`: Git repository URL
2. `build-dir`: Build directory path relative to repository root
3. `branch`: Branch/tag to checkout (use "" for default)
4. `reset-commit`: Specific commit/tag to reset to (use "" to skip)
5. `method`: Installation method name for logging
6. `[cmake-args...]`: Additional CMake arguments

**Usage:**
```bash
# Simple build with default settings
cmake_clone_and_build \
    "https://github.com/osmocom/rtl-sdr.git" \
    "build" \
    "" \
    "" \
    "rtlsdr_install"

# Build specific version with custom options
cmake_clone_and_build \
    "https://github.com/gnuradio/gnuradio.git" \
    "build" \
    "v3.10.5.0" \
    "v3.10.5.0" \
    "gnuradio_install" \
    -DENABLE_GR_QTGUI=ON \
    -DENABLE_PYTHON=ON \
    -DPYTHON_EXECUTABLE=/usr/bin/python3

# Build with custom install prefix
cmake_clone_and_build \
    "https://github.com/mossmann/hackrf.git" \
    "host/build" \
    "master" \
    "" \
    "hackrf_install" \
    -DCMAKE_INSTALL_PREFIX=/opt/hackrf
```

**Process Flow:**
1. Clones repository (or pulls if exists)
2. Checkouts specified branch
3. Resets to specific commit if specified
4. Initializes submodules
5. Creates build directory
6. Runs CMake with provided arguments
7. Compiles with `make -j$(nproc)`
8. Installs with `make install`
9. Runs `ldconfig`
10. Logs to metadata database

**Real-world examples:**

**YAML Recipe - Simple SDR Library:**
```yaml
base_image: "ubuntu:24.04"
tag: "rtlsdr:latest"

packages:
  - cmake
  - build-essential
  - libusb-1.0-0-dev

run_commands:
  - "cmake_clone_and_build 'https://github.com/osmocom/rtl-sdr.git' 'build' 'master' '' 'rtlsdr_install' -DINSTALL_UDEV_RULES=ON -DDETACH_KERNEL_DRIVER=ON"
```

**YAML Recipe - Complex Build with Multiple Options:**
```yaml
base_image: "ubuntu:24.04"
tag: "gnuradio:3.10"

packages:
  - cmake
  - g++
  - libboost-all-dev
  - python3-dev
  - swig

run_commands:
  - |
    cmake_clone_and_build \
      'https://github.com/gnuradio/gnuradio.git' \
      'build' \
      'v3.10' \
      '' \
      'gnuradio_install' \
      -DCMAKE_BUILD_TYPE=Release \
      -DENABLE_GR_QTGUI=ON \
      -DENABLE_GR_UHD=ON \
      -DENABLE_PYTHON=ON \
      -DPYTHON_EXECUTABLE=/usr/bin/python3
```

**Bash - Example 1: Simple SDR Library**
```bash
cmake_clone_and_build \
    "https://github.com/osmocom/rtl-sdr.git" \
    "build" \
    "master" \
    "" \
    "rtlsdr_install" \
    -DINSTALL_UDEV_RULES=ON \
    -DDETACH_KERNEL_DRIVER=ON
```

**Bash - Example 2: Complex Build with Multiple Options**
```bash
cmake_clone_and_build \
    "https://github.com/gnuradio/gnuradio.git" \
    "build" \
    "v3.10" \
    "" \
    "gnuradio_install" \
    -DCMAKE_BUILD_TYPE=Release \
    -DENABLE_GR_QTGUI=ON \
    -DENABLE_GR_UHD=ON \
    -DENABLE_GR_AUDIO=ON \
    -DENABLE_GR_BLOCKS=ON \
    -DENABLE_GR_FFT=ON \
    -DENABLE_GR_FILTER=ON \
    -DENABLE_PYTHON=ON \
    -DPYTHON_EXECUTABLE=/usr/bin/python3 \
    -DENABLE_DOXYGEN=OFF \
    -DENABLE_SPHINX=OFF
```

**Bash - Example 3: Building Specific Tagged Release**
```bash
# Build exactly SDR++ version 1.1.0
cmake_clone_and_build \
    "https://github.com/AlexandreRouma/SDRPlusPlus.git" \
    "build" \
    "1.1.0" \
    "1.1.0" \
    "sdrpp_install" \
    -DOPT_BUILD_AIRSPY_SOURCE=ON \
    -DOPT_BUILD_AIRSPYHF_SOURCE=ON \
    -DOPT_BUILD_HACKRF_SOURCE=ON \
    -DOPT_BUILD_RTL_SDR_SOURCE=ON
```

**When to use:**
- Building from source in a single command
- Reproducible builds with specific versions
- Complex CMake configurations
- Automated container image creation

---

### `grclone_and_build <repo-url> <subdir> <method> [-b branch] [cmake-args...]`

Simplified wrapper optimized for GNU Radio Out-of-Tree (OOT) modules.

**Parameters:**
- `repo-url`: Git repository URL
- `subdir`: Subdirectory containing the source (usually same as repo name)
- `method`: Installation method name for logging
- `-b branch`: Optional branch flag (if omitted, uses default branch)
- `[cmake-args...]`: Additional CMake arguments

**Usage:**
```bash
# Simple GNU Radio module
grclone_and_build \
    "https://github.com/osmocom/gr-osmosdr.git" \
    "gr-osmosdr" \
    "gr_osmosdr_install"

# With specific branch
grclone_and_build \
    "https://github.com/osmocom/gr-gsm.git" \
    "gr-gsm" \
    "gr_gsm_install" \
    -b master

# With custom CMake options
grclone_and_build \
    "https://github.com/greatscottgadgets/gr-bluetooth.git" \
    "gr-bluetooth" \
    "gr_bluetooth_install" \
    -DENABLE_DOXYGEN=OFF \
    -DENABLE_TESTING=OFF
```

**Real-world examples:**

**Example 1: Building Multiple GNU Radio Modules**
```bash
# Build common GNU Radio OOT modules
grclone_and_build \
    "https://github.com/osmocom/gr-osmosdr.git" \
    "gr-osmosdr" \
    "gr_osmosdr_install"

grclone_and_build \
    "https://github.com/osmocom/gr-gsm.git" \
    "gr-gsm" \
    "gr_gsm_install"

grclone_and_build \
    "https://github.com/ptrkrysik/gr-lte.git" \
    "gr-lte" \
    "gr_lte_install"
```

**Example 2: Building with Dependencies Check**
```bash
# Ensure GNU Radio is installed first
if ! pkg-config --exists gnuradio-runtime; then
    criticalecho "GNU Radio must be installed first!"
fi

# Now build OOT modules
grclone_and_build \
    "https://github.com/osmocom/gr-iqbal.git" \
    "gr-iqbal" \
    "gr_iqbal_install"

grclone_and_build \
    "https://github.com/osmocom/gr-fosphor.git" \
    "gr-fosphor" \
    "gr_fosphor_install" \
    -DENABLE_GLFW=ON \
    -DENABLE_QT=ON
```

**When to use:**
- Installing GNU Radio OOT modules
- Building SDR-related GNU Radio blocks
- Creating RF signal processing containers
- Extending GNU Radio capabilities

---

## 🧠 Complete Function Reference Table

| Category | Function | Retry Logic | Logging | Exit on Error |
|----------|----------|-------------|---------|---------------|
| **Output** | `colorecho` | No | Console | No |
| **Output** | `goodecho` | No | Console | No |
| **Output** | `criticalecho` | No | Console | Yes |
| **Output** | `criticalecho-noexit` | No | Console | No |
| **Install** | `installfromnet` | Yes (5×) | Console | Yes (on failure) |
| **Install** | `install_dependencies` | Yes (implicit) | apt logs | Yes (on failure) |
| **Install** | `check_and_install_lib` | Yes (implicit) | Console + apt | Yes (on failure) |
| **Python** | `pip3install` | Yes (5×) | pip logs | Yes (on failure) |
| **Git** | `gitinstall` | No | Console + DB | Yes (on failure) |
| **Build** | `cmake_clone_and_build` | No | Console + DB | Yes (on failure) |
| **Build** | `grclone_and_build` | No | Console + DB | Yes (on failure) |

---

## 💡 Best Practices

### Complete Build Workflow - YAML Recipe

```yaml
# hackrf-tools.yaml - Complete HackRF installation
base_image: "ubuntu:24.04"
tag: "hackrf:latest"

# System packages
packages:
  - libusb-1.0-0-dev
  - libfftw3-dev
  - build-essential
  - cmake
  - git

# Python packages
python_packages:
  - numpy
  - pyusb

# Build from source
run_commands:
  - "colorecho 'Installing HackRF support...'"
  - "cmake_clone_and_build 'https://github.com/mossmann/hackrf.git' 'host/build' 'master' '' 'hackrf_install' -DINSTALL_UDEV_RULES=ON"
  - "goodecho 'HackRF installation complete!'"
```

Build it with:
```bash
rfswift build -r hackrf-tools.yaml
```

### Complete Build Workflow - Bash Script

```bash
# Complete installation workflow
colorecho "Installing HackRF support..."

# Install system dependencies
install_dependencies "libusb-1.0-0-dev libfftw3-dev"

# Install Python dependencies
pip3install numpy pyusb

# Clone and build
cmake_clone_and_build \
    "https://github.com/mossmann/hackrf.git" \
    "host/build" \
    "master" \
    "" \
    "hackrf_install" \
    -DINSTALL_UDEV_RULES=ON

goodecho "HackRF installation complete!"
```

### Error Handling

```bash
# Check prerequisites before proceeding
check_and_install_lib "libusb-1.0-0-dev" "libusb-1.0" || {
    criticalecho "Failed to install libusb"
}

# Optional feature installation
if ! pip3install optional-package 2>/dev/null; then
    criticalecho-noexit "Optional package not available"
fi
```

### YAML Recipe Integration (Recommended)

The easiest way to use helper functions is through YAML recipes:

```yaml
base_image: "ubuntu:24.04"
tag: "rtlsdr:latest"

packages:
  - build-essential
  - cmake
  - git

run_commands:
  - "install_dependencies 'libusb-1.0-0-dev'"
  - "cmake_clone_and_build 'https://github.com/osmocom/rtl-sdr.git' 'build' 'master' '' 'rtlsdr_install' -DINSTALL_UDEV_RULES=ON"
```

Build with:
```bash
rfswift build -r my-image.yaml
```

### Dockerfile Integration (Traditional)

For advanced users who prefer Dockerfiles:

```dockerfile
FROM ubuntu:24.04

# Copy helper scripts
COPY scripts/common.sh /tmp/
RUN chmod +x /tmp/common.sh && \
    . /tmp/common.sh && \
    install_dependencies "build-essential cmake git" && \
    cmake_clone_and_build \
        "https://github.com/osmocom/rtl-sdr.git" \
        "build" \
        "master" \
        "" \
        "rtlsdr_install" \
        -DINSTALL_UDEV_RULES=ON && \
    rm -rf /tmp/*
```

### Layer Optimization

**YAML (Automatic Optimization):**
```yaml
# YAML recipes automatically optimize layers
base_image: "ubuntu:24.04"
tag: "optimized:latest"

packages:
  - pkg1
  - pkg2
  - pkg3

python_packages:
  - package1
  - package2

run_commands:
  - "cmake_clone_and_build [...]"
  # Cleanup is handled automatically
```

**Dockerfile (Manual Optimization):**
```bash
# Good: Single RUN command with multiple operations
RUN . /tmp/common.sh && \
    install_dependencies "pkg1 pkg2 pkg3" && \
    pip3install package1 package2 && \
    cmake_clone_and_build [...] && \
    rm -rf /tmp/* /var/lib/apt/lists/*

# Bad: Multiple RUN commands (creates more layers)
RUN install_dependencies "pkg1"
RUN pip3install package1
RUN cmake_clone_and_build [...]
```

---

## 📋 YAML vs Dockerfile: When to Use Each

### Use YAML Recipes When:
- ✅ You want simple, readable configurations
- ✅ You're building standard SDR/RF tool containers
- ✅ You need quick prototyping
- ✅ You want automatic layer optimization
- ✅ You're sharing configurations with the community
- ✅ You need cross-platform builds automatically configured

**Example:**
```yaml
base_image: "ubuntu:24.04"
tag: "my-sdr:latest"
packages:
  - rtl-sdr
  - hackrf
python_packages:
  - numpy
  - scipy
run_commands:
  - "echo 'Build complete!'"
```

### Use Dockerfiles When:
- ⚙️ You need fine-grained control over build process
- ⚙️ You're implementing complex multi-stage builds
- ⚙️ You need custom base image configurations
- ⚙️ You're integrating with existing Docker workflows
- ⚙️ You need advanced Docker features (HEALTHCHECK, STOPSIGNAL, etc.)

**Example:**
```dockerfile
FROM ubuntu:24.04 AS builder
RUN . /tmp/common.sh && build_tools...

FROM ubuntu:24.04
COPY --from=builder /usr/local /usr/local
```

{{< callout type="info" >}}
**Recommendation:** Start with YAML recipes for most use cases. Switch to Dockerfiles only when you need advanced features not supported by YAML.
{{< /callout >}}

---

## 🔧 Advanced Usage

### Custom Retry Logic

```bash
# Wrap any command with custom retry logic
retry_custom() {
    local max_attempts=10
    local delay=5
    local command="$1"
    
    for i in $(seq 1 $max_attempts); do
        if eval "$command"; then
            return 0
        fi
        colorecho "Attempt $i failed, retrying in ${delay}s..."
        sleep $delay
    done
    
    criticalecho "Command failed after $max_attempts attempts"
}

# Usage
retry_custom "wget https://unstable-mirror.example.com/file.tar.gz"
```

### Conditional Builds

```bash
# Build different components based on architecture
if [ "$(uname -m)" = "aarch64" ]; then
    colorecho "Building for ARM64"
    cmake_clone_and_build \
        "https://github.com/example/arm-optimized.git" \
        "build" \
        "arm64" \
        "" \
        "arm_build" \
        -DARM_NEON=ON
else
    colorecho "Building for x86_64"
    cmake_clone_and_build \
        "https://github.com/example/x86-optimized.git" \
        "build" \
        "master" \
        "" \
        "x86_build" \
        -DAVX2=ON
fi
```

### Metadata Queries

```bash
# List all installed GitHub repositories
cat /var/lib/db/rfswift_github.lst

# Find specific installation
grep "rtlsdr_install" /var/lib/db/rfswift_github.lst

# Extract commit hash
awk -F'|' '/rtlsdr_install/ {print $3}' /var/lib/db/rfswift_github.lst
```

---

## 📚 Related Documentation

{{< cards >}}
  {{< card link="/docs/development/building-images" title="Build Custom Images" icon="cube" subtitle="Use these helpers in your YAML recipes and Dockerfiles" >}}
  {{< card link="/docs/guide/configurations" title="System Configuration" icon="cog" subtitle="Configure RF Swift for your hardware" >}}
  {{< card link="https://github.com/PentHertz/RF-Swift" title="Contribute on GitHub" icon="github" subtitle="Improve or extend these helper functions" >}}
{{< /cards >}}

---

## 🆘 Troubleshooting

### Common Issues

**Issue: "Command failed after 5 attempts"**
```bash
# Solution: Check network connectivity
ping -c 3 github.com

# Or use a mirror
installfromnet "git clone https://mirror.example.com/repo.git"
```

**Issue: "Library not found by pkg-config"**
```bash
# Solution: Update pkg-config path
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
ldconfig

# Then retry
check_and_install_lib "mylib-dev" "mylib"
```

**Issue: "CMake configuration failed"**
```bash
# Solution: Install missing dependencies first
install_dependencies "cmake g++ libboost-all-dev"

# Check CMake version
cmake --version  # Should be 3.16+

# Then retry build
cmake_clone_and_build [...]
```

---

{{< callout emoji="💡" >}}
**Pro Tip**: All helper functions are defined in `images/scripts/common.sh`. You can extend them or create new ones for your specific needs!
{{< /callout >}}