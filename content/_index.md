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
{{< hextra/hero-button text="All Release 📦" link="https://github.com/PentHertz/RF-Swift/releases" >}}
</div>

{{< hextra/content-section-start >}}

## Easy Installation

Get RF-Swift up and running on your system with our one-line installer - no technical expertise required!

{{< tabs items="One-Line Installation,Manual Download" >}}

{{< tab >}}

### Quick Installer

Just copy and paste one of these commands in your terminal:

{{< details summary="On Linux or macOS" >}}

```bash
curl -fsSL "https://get.rfswift.io/" | sudo sh
```

or if you prefer wget:

```bash
wget -qO- "https://get.rfswift.io/" | sudo sh
```

The installer will:
1. Check for and install Docker if needed
2. Automatically detect and download the latest RF-Swift release
3. Install RF-Swift to your system
4. Create a convenient shell alias so you can run RF-Swift from anywhere

After installation, you can start using RF-Swift immediately with:

```bash
rfswift
```

Note: You may need to restart your terminal or run `source ~/.bashrc` (or equivalent for your shell) to use the alias.
{{< /details >}}

{{< details summary="On Windows" >}}
Open PowerShell as administrator and run:

```powershell
iwr -useb https://get.rfswift.io/win.ps1 | iex
```

The Windows installer sets up RF-Swift and creates a shortcut for easy access.
{{< /details >}}

{{< /tab >}}

{{< tab >}}

### Manual Installation 

If you prefer to download and install manually:

1. Visit the [GitHub Releases page](https://github.com/PentHertz/RF-Swift/releases)
2. Download the appropriate package for your operating system and architecture:
   - **Linux**: `rfswift_Linux_x86_64.tar.gz` or `rfswift_Linux_arm64.tar.gz`
   - **macOS**: `rfswift_Darwin_x86_64.tar.gz` or `rfswift_Darwin_arm64.tar.gz`
   - **Windows**: `rfswift_Windows_x86_64.zip`
3. Extract the archive to a location of your choice
4. Add the extracted directory to your PATH or create a symbolic link to the binary

For manual alias creation:
- **Bash**: Add `alias rfswift='/path/to/rfswift'` to your `~/.bashrc` or `~/.bash_profile`
- **Zsh**: Add `alias rfswift='/path/to/rfswift'` to your `~/.zshrc`
- **Fish**: Add `alias rfswift '/path/to/rfswift'` to your `~/.config/fish/config.fish`

{{< /tab >}}

{{< /tabs >}}

## System Requirements

- Docker installed (our installer can set this up for you)
- Supported platforms:
  - Linux (x86_64, arm64, riscv64)
  - macOS (x86_64, arm64)
  - Windows (x86_64)
- Minimal disk space required (most tools run in containers)

{{< hextra/content-section-end >}}

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