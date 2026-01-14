---
title: build
weight: 11
prev: /docs/commands/upgrade
next: /docs/commands/images
---

# rfswift build

Build custom Docker images from simplified YAML recipe files.

## Synopsis

```bash
rfswift build [-r RECIPE_FILE] [-t TAG] [--no-cache]
```

The `build` command creates Docker images using RF Swift's simplified YAML recipe format. This provides an easier alternative to Dockerfiles for building custom RF Swift images with specific tools and configurations.

---

## Options

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-r, --recipe STRING` | Path to recipe file | `rfswift-recipe.yaml` | `-r my-recipe.yaml` |
| `-t, --tag STRING` | Override tag from recipe | From recipe | `-t my_custom:v1` |
| `--no-cache` | Build without using cache | false | `--no-cache` |

---

## Examples

### Basic Usage

**Build from default recipe:**
```bash
rfswift build
```

**Build from specific recipe:**
```bash
rfswift build -r custom-sdr-recipe.yaml
```

**Build with custom tag:**
```bash
rfswift build -r my-recipe.yaml -t my_image:test
```

**Build without cache:**
```bash
rfswift build -r recipe.yaml --no-cache
```

### Real-World Scenarios

**Create custom SDR environment:**
```bash
# Create recipe
cat > sdr-custom.yaml << 'EOF'
name: my_sdr_custom
tag: sdr_custom:v1.0
base: penthertz/rfswift_noble:sdr_light
packages:
  - gqrx-sdr
  - inspectrum
  - urh
scripts:
  - apt-get clean
  - rm -rf /var/lib/apt/lists/*
EOF

# Build
rfswift build -r sdr-custom.yaml
```

---

## Recipe File Format

### Basic Structure

```yaml
# Image metadata
name: my_custom_image
tag: my_custom:v1.0
base: penthertz/rfswift_noble:sdr_full

# Package installation
packages:
  - package1
  - package2
  - package3

# Environment variables
environment:
  - VAR1=value1
  - VAR2=value2

# File copies
files:
  - src: local/file.txt
    dest: /container/path/

# Custom commands
commands:
  - command1
  - command2

# Cleanup scripts
scripts:
  - cleanup_command1
  - cleanup_command2

# Working directory
workdir: /root/workspace
```

### Complete Example

```yaml
name: advanced_sdr_setup
tag: advanced_sdr:v2.0
base: penthertz/rfswift_noble:sdr_full

# Install additional tools
packages:
  - gqrx-sdr
  - inspectrum
  - urh
  - universal-radio-hacker
  - gr-gsm
  - gr-lte

# Set environment
environment:
  - SDR_BUFFER_SIZE=262144
  - DISPLAY=:0
  - PULSE_SERVER=tcp:127.0.0.1:34567

# Copy custom files
files:
  - src: ./configs/sdr-config.conf
    dest: /root/.config/
  - src: ./scripts/startup.sh
    dest: /usr/local/bin/
  - src: ./tools/custom-tool
    dest: /opt/tools/

# Post-installation commands
commands:
  - chmod +x /usr/local/bin/startup.sh
  - chmod +x /opt/tools/custom-tool
  - ln -s /opt/tools/custom-tool /usr/local/bin/
  - mkdir -p /root/captures
  - mkdir -p /root/analysis

# Cleanup
scripts:
  - apt-get clean
  - rm -rf /var/lib/apt/lists/*
  - rm -rf /tmp/*
  - rm -rf /root/.cache/*

# Set working directory
workdir: /root/workspace
```

---

## Recipe Sections

### name (Required)

Image name for documentation purposes.

```yaml
name: my_custom_sdr
```

### tag (Required)

Docker image tag (repository:tag format).

```yaml
tag: my_custom_sdr:v1.0
```

Can be overridden with `-t` flag:
```bash
rfswift build -r recipe.yaml -t override_tag:v2
```

### base (Required)

Base image to build from. Usually an RF Swift image.

```yaml
base: penthertz/rfswift_noble:sdr_full
```

Common base images:
- `penthertz/rfswift_noble:sdr_full` - Complete SDR stack
- `penthertz/rfswift_noble:sdr_light` - Lightweight SDR
- `penthertz/rfswift_noble:bluetooth` - Bluetooth tools
- `penthertz/rfswift_noble:wifi` - WiFi tools
- `penthertz/rfswift_noble:hardware` - Hardware security tools

### packages (Optional)

APT packages to install.

```yaml
packages:
  - gqrx-sdr
  - inspectrum
  - wireshark
  - python3-pip
```

### environment (Optional)

Environment variables to set.

```yaml
environment:
  - PATH=/opt/tools:$PATH
  - CUSTOM_VAR=value
  - DEBUG=1
```

### files (Optional)

Files to copy into the image.

```yaml
files:
  - src: ./local/config.txt
    dest: /root/.config/
  - src: ./scripts/
    dest: /opt/scripts/
  - src: ./tool
    dest: /usr/local/bin/tool
```

**Paths:**
- `src`: Relative to recipe file location
- `dest`: Absolute path in container

### commands (Optional)

Commands to run during build.

```yaml
commands:
  - chmod +x /usr/local/bin/script.sh
  - pip3 install custom-package
  - git clone https://github.com/user/repo /opt/repo
  - make -C /opt/repo install
```

### scripts (Optional)

Cleanup scripts run at the end of the build.

```yaml
scripts:
  - apt-get clean
  - rm -rf /var/lib/apt/lists/*
  - rm -rf /tmp/*
  - history -c
```

### workdir (Optional)

Default working directory for the image.

```yaml
workdir: /root/projects
```

---

## Troubleshooting

### Recipe File Not Found

**Error:** `Error: recipe file not found`

**Solutions:**
```bash
# Check file exists
ls -l rfswift-recipe.yaml

# Use absolute path
rfswift build -r /full/path/to/recipe.yaml

# Check current directory
pwd
```

### Invalid Recipe Format

**Error:** `Error parsing recipe: invalid YAML`

**Solutions:**
```bash
# Validate YAML syntax
yamllint recipe.yaml

# Check indentation (must use spaces, not tabs)
cat -A recipe.yaml | grep "^I"

# Common issues:
# - Missing colons after keys
# - Incorrect indentation
# - Tabs instead of spaces
```

### Base Image Not Found

**Error:** `Error: base image not found`

**Solutions:**
```bash
# Pull base image first
rfswift images pull penthertz/rfswift_noble:sdr_full

# Check available images
rfswift images local

# Verify base image name in recipe
grep "^base:" recipe.yaml
```

### Package Installation Failed

**Error:** `E: Unable to locate package`

**Solutions:**
```bash
# Update package lists in recipe
packages:
  - apt-update  # Add this first

# Or add to commands section
commands:
  - apt-get update
  - apt-get install -y your-package

# Check package name spelling
apt-cache search package-name
```

### File Copy Failed

**Error:** `COPY failed: stat /src/file: no such file or directory`

**Solutions:**
```bash
# Check source file exists relative to recipe
ls -l ./configs/file.txt

# Use correct relative path
files:
  - src: ./configs/file.txt  # Relative to recipe location
    dest: /root/.config/

# Verify directory structure
tree .
```

### Build Cache Issues

**Problem:** Build not reflecting changes

**Solution:**
```bash
# Force rebuild without cache
rfswift build -r recipe.yaml --no-cache

# Clear Docker build cache
docker builder prune
```

---

## Related Commands

- [`run`](/docs/commands/run) - Run containers from built images
- [`commit`](/docs/commands/commit) - Save modified containers as images
- [`export`](/docs/commands/export) - Export built images
- [`images`](/docs/commands/images) - Manage built images
- [`delete`](/docs/commands/delete) - Remove built images


---

{{< callout emoji="🔨" >}}
**Recipe vs Dockerfile**: RF Swift recipes provide a simplified YAML format that's easier to read and maintain than Dockerfiles. They're perfect for building custom RF Swift variants without Dockerfile complexity!
{{< /callout >}}

{{< callout type="warning" >}}
**File Paths**: Files referenced in the `files` section must exist relative to the recipe file location. Use `./` prefix for clarity and always verify files exist before building.
{{< /callout >}}

{{< callout type="info" >}}
**Cache Control**: Use `--no-cache` when you want to ensure all packages are updated and all commands run fresh. Otherwise, Docker's layer caching speeds up repeated builds.
{{< /callout >}}