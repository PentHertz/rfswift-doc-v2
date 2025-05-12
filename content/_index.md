---
title: RF Swift
layout: hextra-home
---
{{< hextra/hero-badge >}}
  <div class="hx-w-2 hx-h-2 hx-rounded-full hx-bg-primary-400"></div>
  <span>Free, open source</span>
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}
<div class="hx-mt-6 hx-mb-6">
{{< hextra/hero-headline >}}
  The epic RF companion ⚡ &nbsp;<br class="sm:hx-block hx-hidden" />for HAMs and professionals
{{< /hextra/hero-headline >}}
</div>
<div class="hx-mb-12">
{{< hextra/hero-subtitle >}}
  Fast, efficient, and multi-platform&nbsp;<br class="sm:hx-block hx-hidden" /> toolbox for your RF & hardware security assessments
{{< /hextra/hero-subtitle >}}
</div>
<div class="hx-mb-6">
{{< hextra/hero-button text="Get Started" link="docs" >}}
{{< hextra/hero-button text="Download Latest Release 📦" link="https://github.com/PentHertz/RF-Swift/releases" >}}
</div>

<div class="hx-mt-6 hx-mb-12 hx-px-4 sm:hx-px-6 md:hx-px-8 lg:hx-px-12 max-w-screen-lg mx-auto">
  <h2 class="hx-text-3xl hx-font-bold hx-mb-4">Easy Installation</h2>
  <p class="hx-mb-6">Get RF-Swift up and running on your system with our one-line installer - no technical expertise required!</p>

## Quick One-Line Installer

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
```bash
curl -fsSL "https://get.rfswift.io/" | sudo sh
```

Or if you prefer wget:

```bash
wget -qO- "https://get.rfswift.io/" | sudo sh
```

The installer will:
1. Check for and install Docker if needed
2. Detect and download the latest RF-Swift release
3. Install RF-Swift to your system
4. Create a convenient alias in your shell configuration

After installation, you can start using RF-Swift immediately with the simple command:

```bash
rfswift
```

Note: You may need to restart your terminal or run `source ~/.bashrc` (or equivalent for your shell) to use the alias.
  {{< /tab >}}
  {{< tab >}}
```bash
curl -fsSL "https://get.rfswift.io/" | sudo sh
```

Or if you prefer wget:

```bash
wget -qO- "https://get.rfswift.io/" | sudo sh
```

The installer will:
1. Check for and install Docker if needed (via Homebrew if available)
2. Detect and download the latest RF-Swift release
3. Install RF-Swift to your system
4. Create a convenient shell alias in your .bash_profile or .zshrc

After installation, you can start using RF-Swift immediately with the simple command:

```bash
rfswift
```

Note: You may need to restart your terminal or run `source ~/.zshrc` (or equivalent for your shell) to use the alias.
  {{< /tab >}}
  {{< tab >}}
Open PowerShell as administrator and run:

```powershell
iwr -useb https://get.rfswift.io/win.ps1 | iex
```

The Windows installer will:
1. Check for and install Docker Desktop if needed
2. Download the latest RF-Swift release
3. Install RF-Swift and add it to your PATH
4. Create a desktop shortcut for easy access

After installation, you can start using RF-Swift from any PowerShell or Command Prompt window:

```powershell
rfswift
```
  {{< /tab >}}
{{< /tabs >}}

## Manual Installation

If you prefer to download and install manually:

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
1. Visit the [GitHub Releases page](https://github.com/PentHertz/RF-Swift/releases)
2. Download the appropriate package: `rfswift_Linux_x86_64.tar.gz` or `rfswift_Linux_arm64.tar.gz`
3. Extract the archive:
   ```bash
   tar -xzf rfswift_Linux_*.tar.gz
   ```
4. Move the binary to a directory in your PATH:
   ```bash
   sudo mv rfswift /usr/local/bin/
   sudo chmod +x /usr/local/bin/rfswift
   ```
5. Create an alias in your shell configuration file:
   ```bash
   echo 'alias rfswift="/usr/local/bin/rfswift"' >> ~/.bashrc
   source ~/.bashrc
   ```
  {{< /tab >}}
  {{< tab >}}
1. Visit the [GitHub Releases page](https://github.com/PentHertz/RF-Swift/releases)
2. Download the appropriate package: `rfswift_Darwin_x86_64.tar.gz` or `rfswift_Darwin_arm64.tar.gz`
3. Extract the archive:
   ```bash
   tar -xzf rfswift_Darwin_*.tar.gz
   ```
4. Move the binary to a directory in your PATH:
   ```bash
   sudo mv rfswift /usr/local/bin/
   sudo chmod +x /usr/local/bin/rfswift
   ```
5. Create an alias in your shell configuration file:
   ```bash
   # For Bash
   echo 'alias rfswift="/usr/local/bin/rfswift"' >> ~/.bash_profile
   source ~/.bash_profile
   
   # For Zsh
   echo 'alias rfswift="/usr/local/bin/rfswift"' >> ~/.zshrc
   source ~/.zshrc
   ```
  {{< /tab >}}
  {{< tab >}}
1. Visit the [GitHub Releases page](https://github.com/PentHertz/RF-Swift/releases)
2. Download the appropriate package: `rfswift_Windows_x86_64.zip`
3. Extract the ZIP file to a location of your choice (e.g., `C:\Program Files\RF-Swift\`)
4. Add the folder to your PATH:
   ```powershell
   $env:Path += ";C:\Program Files\RF-Swift"
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)
   ```
5. Create a desktop shortcut if desired
  {{< /tab >}}
{{< /tabs >}}

## System Requirements

- Docker installed (our installer can set this up for you)
- Supported platforms:
  - Linux (x86_64, arm64, riscv64)
  - macOS (x86_64, arm64)
  - Windows (x86_64)
- Minimal disk space required (most tools run in containers)
</div>

<div class="hx-mt-6"></div>
{{< hextra/feature-grid >}}
  {{< hextra/feature-card
    title="Fast and Full-featured"
    subtitle="Access hundreds of radio frequency and hardware security tools with just a few commands."
    image="/images/docs/imagesrf.png"
    imageClass="hx-top-[40%] hx-left-[24px] hx-w-[180%] sm:hx-w-[110%] dark:hx-opacity-80"
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(194,97,254,0.15),hsla(0,0%,100%,0));"
  >}}
  
  {{< hextra/feature-card
    title="Efficient Container Management"
    subtitle="Simple to use yet powerful orchestration for RF and security tools with optimized resource usage."
    image="/images/docs/sdrangel.png"
    imageClass="hx-top-[40%] hx-left-[24px] hx-w-[180%] sm:hx-w-[110%] dark:hx-opacity-80"
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-lg:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(142,53,74,0.15),hsla(0,0%,100%,0));"
  >}}
  
  {{< hextra/feature-card
    title="Multi-platform & Multi-architecture"
    subtitle="Run on Linux, Windows, or macOS without reformatting your computer. Supports x86_64, ARM64, and RISCV64."
    image="/images/docs/onsteamdeck.jpg"
    imageClass="hx-top-[40%] hx-left-[24px] hx-w-[180%] sm:hx-w-[110%] dark:hx-opacity-80"
    class="hx-aspect-auto md:hx-aspect-[1.1/1] max-md:hx-min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(221,210,59,0.15),hsla(0,0%,100%,0));"
  >}}
  
  {{< hextra/feature-card
    title="Save Time & Resources"
    icon="clock"
    subtitle="Create dedicated environments for your assessments with simple commands, eliminating lengthy setup processes."
  >}}
  
  {{< hextra/feature-card
    title="Customize Your Environment"
    icon="beaker"
    subtitle="Create your own optimized images with our helper scripts and Dockerfiles. Build environments that fit your specific needs."
  >}}
  
  {{< hextra/feature-card
    title="Always Updated"
    icon="sparkles"
    subtitle="Stay current with the latest tools through our streamlined update process. No more dependency conflicts or outdated packages."
  >}}
  {{< hextra/feature-card
    title="Hardware Integration"
    icon="chip"
    subtitle="Seamless USB, audio, and video forwarding for SDRs and other RF hardware devices with minimal configuration."
  >}}
  
  {{< hextra/feature-card
    title="Portable Testing Lab"
    icon="device-mobile"
    subtitle="Turn any computer into a complete RF testing lab in minutes. Perfect for field work and remote assessments."
  >}}
  
  {{< hextra/feature-card
    title="Community Driven"
    icon="users"
    subtitle="Join a growing community of RF enthusiasts and security professionals. Share custom images and workflows."
  >}}
{{< /hextra/feature-grid >}}