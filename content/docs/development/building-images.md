---
title: "Helper functions reference"
level: advanced
description: "The Bash helpers you can call when building RF Swift images: logging, package installs with retries, Git clones and CMake builds."
weight: 3
---

RF Swift images are built with a small library of Bash helper functions. They print consistent log messages, retry network steps, install packages and build projects from source in one call.

You need this page when you write the `run_commands` of a [YAML recipe](/docs/development/yaml-recipe-guide/) or your own Dockerfile. The helpers work in both.

**Where to start:** the table below shows every helper at a glance. For most recipes you only need `colorecho`, `installfromnet` and `cmake_clone_and_build`. All helpers are defined in `images/scripts/common.sh` in the RF Swift repository.

## All helpers at a glance

| Category | Function | Retries | Logging | Stops the build on error |
|----------|----------|-------------|---------|---------------|
| Output | `colorecho` | No | Console | No |
| Output | `goodecho` | No | Console | No |
| Output | `criticalecho` | No | Console | Yes |
| Output | `criticalecho-noexit` | No | Console | No |
| Install | `installfromnet` | Yes (5 times) | Console | Yes, after the last attempt |
| Install | `install_dependencies` | Yes (implicit) | apt logs | Yes |
| Install | `check_and_install_lib` | Yes (implicit) | Console and apt | Yes |
| Python | `pip3install` | Yes (5 times) | pip logs | Yes |
| Git | `gitinstall` | No | Console and database | Yes |
| Build | `cmake_clone_and_build` | No | Console and database | Yes |
| Build | `grclone_and_build` | No | Console and database | Yes |

## Output and logging

These helpers print coloured, prefixed messages, so a long build log stays readable.

### `colorecho <message>`

Prints a blue informational message to stdout. Use it for progress updates and step markers.

```bash
colorecho "Starting installation process..."
colorecho "Configuration phase complete"
```

Output:

```
[INFO] Starting installation process...
```

### `goodecho <message>`

Prints a green success message to stdout. Use it to confirm that a step finished.

```bash
goodecho "Installation completed successfully!"
goodecho "All tests passed"
```

Output:

```
[SUCCESS] Installation completed successfully!
```

### `criticalecho <message>`

Prints a red error message to stderr and **exits with code 1**, which stops the build. Use it for errors that make the rest of the build pointless: a missing critical dependency or a failed check.

```bash
if [ ! -f "required_file.txt" ]; then
    criticalecho "Required file not found!"
fi
```

Output:

```
[ERROR] Required file not found!
```

{{< callout type="warning" >}}
`criticalecho` ends the build. To log an error and keep going, use `criticalecho-noexit`.
{{< /callout >}}

### `criticalecho-noexit <message>`

Prints a red error message to stderr **without exiting**. Use it for optional features that failed, or before trying a fallback.

```bash
if ! some_optional_operation; then
    criticalecho-noexit "Optional feature installation failed, continuing..."
fi
```

Output:

```
[ERROR] Optional feature installation failed, continuing...
```

## Installing packages

### `installfromnet <command>`

Runs a shell command up to 5 times, waiting 15 seconds between attempts. Wrap every network step in it (wget, curl, git clone), so a flaky mirror does not break the build.

**Parameter:** `command`, any shell command, in quotes if it contains spaces.

**Behaviour:** the first attempt runs immediately; attempts 2 to 5 each wait 15 seconds first. On success the build continues; if all five attempts fail, the build stops with an error.

In a shell script:

```bash
# Simple download
installfromnet "wget http://example.com/tool.tar.gz"

# Git clone
installfromnet "git clone https://github.com/user/repo.git"

# Complex command with pipes
installfromnet "curl -L https://example.com/install.sh | bash"
```

In a YAML recipe:

```yaml
base_image: "ubuntu:24.04"
tag: "my-custom-image:latest"

run_commands:
 - "installfromnet 'wget http://example.com/tool.tar.gz'"
 - "installfromnet 'git clone https://github.com/user/repo.git'"
```

In a Dockerfile, load the helpers first:

```dockerfile
RUN . /tmp/common.sh && \
    installfromnet "wget http://example.com/tool.tar.gz" && \
    tar xzf tool.tar.gz
```

For a whole download-build-install cycle, `cmake_clone_and_build` already includes the retries:

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

### `install_dependencies "<packages>"`

Installs Debian or Ubuntu packages with `apt-fast` (a parallel apt wrapper), with automatic retries. Use it for system libraries, build tools and runtime dependencies.

**Parameter:** `packages`, a space-separated list of package names, in quotes.

**What it does for you:**

- runs `apt-get update` when needed;
- downloads in parallel with `apt-fast`;
- retries on network failures;
- logs the installed packages.

In a YAML recipe, list the packages under `packages` instead; the recipe installs them for you:

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

In a shell script or Dockerfile:

```bash
# Single package
install_dependencies "python3-numpy"

# Multiple packages
install_dependencies "python3-numpy python3-scipy g++ cmake"

# Development libraries
install_dependencies "libusb-1.0-0-dev libfftw3-dev libboost-all-dev"
```

A complete GNU Radio build environment as a recipe:

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

The same dependencies in a shell script:

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

### `check_and_install_lib <lib-name> <pkg-config-name>`

Checks with `pkg-config` whether a library is present, and installs it with `apt-fast` only if it is missing. Use it before building from source, to validate prerequisites without reinstalling what is already there.

**Parameters:**

- `lib-name`: the Debian package name;
- `pkg-config-name`: the name pkg-config knows (usually without the `-dev` suffix).

```bash
# Check for libusb
check_and_install_lib "libusb-1.0-0-dev" "libusb-1.0"

# Check for FFTW
check_and_install_lib "libfftw3-dev" "fftw3"

# Check for OpenSSL
check_and_install_lib "libssl-dev" "openssl"
```

What it prints:

```bash
# If library is found:
[INFO] libusb-1.0 is already installed

# If library is not found:
[INFO] libusb-1.0 not found, installing libusb-1.0-0-dev...
[SUCCESS] libusb-1.0-0-dev installed successfully
```

Checking several libraries before a manual build:

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

## Installing Python packages

### `pip3install <args>`

Installs Python packages with `pip3`, retrying up to 5 times on network failures. It passes `--break-system-packages` (appropriate in a container), logs what it installs and handles timeouts.

**Parameter:** `args`, any valid `pip install` arguments.

In a YAML recipe, list the packages under `python_packages` instead:

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

In a shell script or Dockerfile:

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

A data science stack, one package per call:

```bash
pip3install numpy
pip3install scipy
pip3install matplotlib
pip3install pandas
pip3install scikit-learn
```

RF signal processing libraries:

```bash
pip3install numpy scipy
pip3install gnuradio
pip3install pyrtlsdr
pip3install pySoapySDR
```

Everything from a requirements file:

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

Straight from GitHub, at a branch or a commit:

```bash
# Install latest development version
pip3install git+https://github.com/mossmann/hackrf.git@master#subdirectory=host/libhackrf/python

# Install specific commit
pip3install git+https://github.com/osmocom/pyosmo-sdr@a1b2c3d
```

{{< callout type="tip" title="Pin versions in production images" >}}
For reproducible builds, give every package an exact version:

```bash
pip3install "numpy==1.24.0" "scipy==1.10.0"
```
{{< /callout >}}

## Cloning and building from source

### `gitinstall <repo-url> <method> <branch>`

Clones a Git repository, or pulls it if it is already there, and records where it came from. Use it when you clone source code to compile, so the image keeps a list of what it contains.

**Parameters:**

- `repo-url`: HTTPS or SSH URL of the repository;
- `method`: a name for this installation, used in the logs;
- `branch`: branch, tag or commit to check out (optional; the default branch otherwise).

**What it does for you:**

- initialises and updates submodules;
- pulls instead of cloning again when the repository already exists;
- handles shallow and full clones;
- records the method name, URL, commit hash, branch and date in `/var/lib/db/rfswift_github.lst`.

```bash
# Clone default branch
gitinstall "https://github.com/osmocom/rtl-sdr.git" "rtlsdr_install"

# Clone specific branch
gitinstall "https://github.com/mossmann/hackrf.git" "hackrf_install" "master"

# Clone specific tag
gitinstall "https://github.com/gnuradio/gnuradio.git" "gnuradio_install" "v3.10.5.0"
```

A line in `/var/lib/db/rfswift_github.lst` looks like this:

```
rtlsdr_install|https://github.com/osmocom/rtl-sdr.git|a1b2c3d4e5f6|master|2024-01-12
```

Cloning RTL-SDR, then building it by hand:

```bash
gitinstall "https://github.com/osmocom/rtl-sdr.git" "rtlsdr_install"
cd rtl-sdr
mkdir build && cd build
cmake ../ -DINSTALL_UDEV_RULES=ON -DDETACH_KERNEL_DRIVER=ON
make -j$(nproc)
make install
ldconfig
```

A GNU Radio out-of-tree module:

```bash
gitinstall "https://github.com/osmocom/gr-osmosdr.git" "gr_osmosdr_install" "master"
cd gr-osmosdr
mkdir build && cd build
cmake ..
make -j$(nproc)
make install
ldconfig
```

Several related repositories, built in a loop:

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

### `cmake_clone_and_build <repo-url> <build-dir> <branch> <reset-commit> <method> [cmake-args...]`

Clones a repository and builds and installs it with CMake, in one call. This is the helper most recipes use, and the easiest way to build a pinned version reproducibly.

**Parameters, in order:**

1. `repo-url`: Git repository URL;
2. `build-dir`: build directory, relative to the repository root;
3. `branch`: branch or tag to check out (`""` for the default);
4. `reset-commit`: commit or tag to reset to (`""` to skip);
5. `method`: a name for this installation, used in the logs;
6. `[cmake-args...]`: extra CMake arguments.

**What it does, step by step:**

1. clones the repository (or pulls it if it exists);
2. checks out the branch;
3. resets to the given commit, if any;
4. initialises submodules;
5. creates the build directory;
6. runs CMake with your arguments;
7. compiles with `make -j$(nproc)`;
8. installs with `make install`;
9. runs `ldconfig`;
10. records the build in the metadata database.

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

In a YAML recipe, on one line:

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

In a YAML recipe, with many options, using the pipe syntax:

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

A simple SDR library in a shell script:

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

A large build with many CMake options:

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

An exact tagged release (here SDR++ 1.1.0):

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

### `grclone_and_build <repo-url> <subdir> <method> [-b branch] [cmake-args...]`

A shorter wrapper made for GNU Radio out-of-tree (OOT) modules. Use it to add GNU Radio blocks to an image.

**Parameters:**

- `repo-url`: Git repository URL;
- `subdir`: directory holding the source (usually the repository name);
- `method`: a name for this installation, used in the logs;
- `-b branch`: optional branch (the default branch otherwise);
- `[cmake-args...]`: extra CMake arguments.

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

Several common modules in a row:

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

Checking that GNU Radio is present before building modules:

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

## Putting it together

### A complete recipe

HackRF support built from source, with logging:

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

Build it:

```bash
rfswift image build -r hackrf-tools.yaml
```

### The same workflow as a shell script

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

### Handling errors

Stop on a missing prerequisite; log and continue when an optional package fails:

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

### Using the helpers in a YAML recipe (recommended)

A recipe is the easiest way to use the helpers: they are always available in `run_commands`.

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

Build it:

```bash
rfswift image build -r my-image.yaml
```

### Using the helpers in a Dockerfile

Copy `common.sh` into the build and source it in the `RUN` step:

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

### Keeping layers small

A YAML recipe arranges the layers for you:

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

In a Dockerfile, group the steps in one `RUN` command and clean up at the end:

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

## YAML recipe or Dockerfile?

Start with a YAML recipe. Switch to a Dockerfile only when you need a feature recipes do not offer.

| Use a YAML recipe when you... | Use a Dockerfile when you... |
|---|---|
| want a short, readable configuration | need fine-grained control over the build |
| build a standard SDR or RF tool image | need multi-stage builds |
| prototype quickly | need a custom base image setup |
| want layers arranged for you | integrate with existing Docker workflows |
| share configurations with others | need Docker features such as HEALTHCHECK or STOPSIGNAL |
| want cross-platform builds configured for you | |

A recipe:

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

A multi-stage Dockerfile:

```dockerfile
FROM ubuntu:24.04 AS builder
RUN . /tmp/common.sh && build_tools...

FROM ubuntu:24.04
COPY --from=builder /usr/local /usr/local
```

## Advanced usage

### Your own retry logic

When you need more attempts or a different delay than `installfromnet`, write a small wrapper with the logging helpers:

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

### Different builds per architecture

Test `uname -m` and pass architecture-specific options:

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

### Finding out what an image was built from

Every `gitinstall`, `cmake_clone_and_build` and `grclone_and_build` call is recorded in `/var/lib/db/rfswift_github.lst`:

```bash
# List all installed GitHub repositories
cat /var/lib/db/rfswift_github.lst

# Find specific installation
grep "rtlsdr_install" /var/lib/db/rfswift_github.lst

# Extract commit hash
awk -F'|' '/rtlsdr_install/ {print $3}' /var/lib/db/rfswift_github.lst
```

## Troubleshooting

### "Command failed after 5 attempts"

`installfromnet` could not reach the source. Check the network, or use a mirror:

```bash
# Solution: Check network connectivity
ping -c 3 github.com

# Or use a mirror
installfromnet "git clone https://mirror.example.com/repo.git"
```

### "Library not found by pkg-config"

The library is installed where pkg-config does not look. Add the path, refresh the linker cache and try again:

```bash
# Solution: Update pkg-config path
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH
ldconfig

# Then retry
check_and_install_lib "mylib-dev" "mylib"
```

### "CMake configuration failed"

A build dependency is usually missing, or CMake is too old (3.16 or later is expected). Install the dependencies first:

```bash
# Solution: Install missing dependencies first
install_dependencies "cmake g++ libboost-all-dev"

# Check CMake version
cmake --version  # Should be 3.16+

# Then retry build
cmake_clone_and_build [...]
```

{{< callout type="tip" >}}
All helpers live in `images/scripts/common.sh`. You can extend them or add your own for your images.
{{< /callout >}}

## Related documentation

{{< cards >}}
  {{< card link="/docs/development/yaml-recipe-guide/" title="YAML recipe guide" subtitle="Use these helpers in a recipe" >}}
  {{< card link="/docs/guide/configurations/" title="Configuration" subtitle="Configure RF Swift for your hardware" >}}
  {{< card link="https://github.com/PentHertz/RF-Swift" title="Contribute on GitHub" subtitle="Improve or extend these helper functions" >}}
{{< /cards >}}
