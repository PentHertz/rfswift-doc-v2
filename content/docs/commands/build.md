---
title: "rfswift image build"
linkTitle: "image build"
navGroup: "Images"
level: reference
description: "Build a container image from a YAML recipe."
weight: 22
---

`rfswift image build` creates your own container image from a short YAML recipe. Use it when you want an RF Swift image with extra tools or settings baked in, without writing a Dockerfile.

The most common use builds from a recipe file:

```bash
rfswift image build -r my-recipe.yaml
```

{{< callout type="info" >}}
`rfswift image build` is the v4 spelling. The older `rfswift build` still works, takes the same flags and prints a notice with the new name. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift image build [-r RECIPE_FILE] [-t TAG] [--no-cache]
```

## Options

| Flag | What it does | Default | Example |
|------|--------------|---------|---------|
| `-r, --recipe STRING` | Path to the recipe file | `rfswift-recipe.yaml` | `-r my-recipe.yaml` |
| `-t, --tag STRING` | Use this tag instead of the one in the recipe | From the recipe | `-t my_custom:v1` |
| `--no-cache` | Build without Docker's layer cache | false | `--no-cache` |

## Examples

Build from `rfswift-recipe.yaml` in the current directory:

```bash
rfswift image build
```

Build from a specific recipe:

```bash
rfswift image build -r custom-sdr-recipe.yaml
```

Build with a different tag than the one in the recipe:

```bash
rfswift image build -r my-recipe.yaml -t my_image:test
```

Rebuild everything from scratch, ignoring the cache:

```bash
rfswift image build -r recipe.yaml --no-cache
```

### A custom SDR image

This recipe starts from `sdr_light`, adds three tools and cleans up the package cache. Write it to a file, then build it:

```bash
cat > sdr-custom.yaml << 'EOF'
name: my_sdr_custom
tag: sdr_custom:v1.0
base: penthertz/rfswift_resolute:sdr_light
packages:
 - gqrx-sdr
 - inspectrum
 - urh
scripts:
 - apt-get clean
 - rm -rf /var/lib/apt/lists/*
EOF

rfswift image build -r sdr-custom.yaml
```

## Recipe file format

### Structure

A recipe has three required keys (`name`, `tag`, `base`) and several optional sections:

```yaml
# Image metadata
name: my_custom_image
tag: my_custom:v1.0
base: penthertz/rfswift_resolute:sdr_full

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

### Complete example

This recipe adds SDR and cellular tools to `sdr_full`, sets environment variables, copies a few files in and prepares working folders:

```yaml
name: advanced_sdr_setup
tag: advanced_sdr:v2.0
base: penthertz/rfswift_resolute:sdr_full

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

## Recipe sections

### name (required)

A name for the image, used for documentation.

```yaml
name: my_custom_sdr
```

### tag (required)

The Docker tag of the image you build, in `repository:tag` form.

```yaml
tag: my_custom_sdr:v1.0
```

The `-t` flag overrides it:

```bash
rfswift image build -r recipe.yaml -t override_tag:v2
```

### base (required)

The image to start from, usually an RF Swift image.

```yaml
base: penthertz/rfswift_resolute:sdr_full
```

Common base images:

- `penthertz/rfswift_resolute:sdr_full`: the complete SDR stack
- `penthertz/rfswift_resolute:sdr_light`: the essential SDR tools
- `penthertz/rfswift_resolute:bluetooth`: Bluetooth tools
- `penthertz/rfswift_resolute:wifi`: Wi-Fi tools
- `penthertz/rfswift_resolute:hardware`: hardware security tools

### packages (optional)

APT packages to install.

```yaml
packages:
 - gqrx-sdr
 - inspectrum
 - wireshark
 - python3-pip
```

### environment (optional)

Environment variables to set in the image.

```yaml
environment:
 - PATH=/opt/tools:$PATH
 - CUSTOM_VAR=value
 - DEBUG=1
```

### files (optional)

Files to copy into the image. `src` is relative to the recipe file; `dest` is an absolute path in the image.

```yaml
files:
 - src: ./local/config.txt
   dest: /root/.config/
 - src: ./scripts/
   dest: /opt/scripts/
 - src: ./tool
   dest: /usr/local/bin/tool
```

### commands (optional)

Commands to run during the build.

```yaml
commands:
 - chmod +x /usr/local/bin/script.sh
 - pip3 install custom-package
 - git clone https://github.com/user/repo /opt/repo
 - make -C /opt/repo install
```

### scripts (optional)

Cleanup commands, run at the end of the build.

```yaml
scripts:
 - apt-get clean
 - rm -rf /var/lib/apt/lists/*
 - rm -rf /tmp/*
 - history -c
```

### workdir (optional)

The default working directory of the image.

```yaml
workdir: /root/projects
```

{{< callout type="warning" title="Files must exist next to the recipe" >}}
Every file in the `files` section must exist, relative to the recipe file's location. Prefix paths with `./` for clarity, and check they are there before you build.
{{< /callout >}}

{{< callout type="info" title="When to use --no-cache" >}}
Docker reuses cached layers, so repeated builds are fast. Use `--no-cache` when you want every package updated and every command run again.
{{< /callout >}}

## Troubleshooting

### “recipe file not found”

The full error is `Error: recipe file not found`. RF Swift looks for `rfswift-recipe.yaml` in the current directory unless you pass `-r`. Check the file is there, or give its full path:

```bash
ls -l rfswift-recipe.yaml
pwd
rfswift image build -r /full/path/to/recipe.yaml
```

### “invalid YAML”

The full error is `Error parsing recipe: invalid YAML`. The usual causes are a missing colon after a key, wrong indentation, or tabs instead of spaces. Check the syntax, and look for tabs (shown as `^I`):

```bash
yamllint recipe.yaml
cat -A recipe.yaml | grep "^I"
```

### “base image not found”

The full error is `Error: base image not found`. Pull the base image first, then check its exact name in your recipe:

```bash
rfswift image pull -i penthertz/rfswift_resolute:sdr_full
rfswift image local
grep "^base:" recipe.yaml
```

### “Unable to locate package”

The full error is `E: Unable to locate package`. Check the package name first:

```bash
apt-cache search package-name
```

If the name is right, refresh the package lists before installing: add an update step at the start of `packages`, or run the install from the `commands` section:

```yaml
packages:
 - apt-update  # Add this first

commands:
 - apt-get update
 - apt-get install -y your-package
```

### “COPY failed: no such file or directory”

The full error looks like `COPY failed: stat /src/file: no such file or directory`. A `src` path in `files` does not exist relative to the recipe. Check the file and the folder layout:

```bash
ls -l ./configs/file.txt
tree .
```

Then use the correct relative path:

```yaml
files:
 - src: ./configs/file.txt  # Relative to recipe location
   dest: /root/.config/
```

### The build does not pick up your changes

Docker's cache reused an old layer. Rebuild without the cache, or clear Docker's build cache:

```bash
rfswift image build -r recipe.yaml --no-cache
docker builder prune
```

## Related commands

- [`run`](/docs/commands/run): create containers from the images you built
- [`commit`](/docs/commands/commit): save a modified container as an image
- [`export`](/docs/commands/export): export the images you built
- [`images`](/docs/commands/images): list and manage images
- [`delete`](/docs/commands/delete): remove images
- [YAML recipe guide](/docs/development/yaml-recipe-guide/): recipes in depth
