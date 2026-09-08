---
title: RF Swift
layout: hextra-home
---
{{< hextra/hero-badge link="docs/release-notes-v4" >}}
  <div class="hx:w-2 hx:h-2 hx:rounded-full hx:bg-primary-400"></div>
  <span>New: v4.0 "Nucleus"</span>
  {{< icon name="arrow-circle-right" attributes="height=14" >}}
{{< /hextra/hero-badge >}}

<div class="hx:mt-6 hx:mb-6">
{{< hextra/hero-headline >}}
  The epic RF companion ⚡ &nbsp;<br class="hx:sm:block hx:hidden" />for HAMs and professionals
{{< /hextra/hero-headline >}}
</div>

<div class="hx:mb-12">
{{< hextra/hero-subtitle >}}
  Fast, efficient, and multi-platform&nbsp;<br class="hx:sm:block hx:hidden" /> toolbox for your RF & hardware security assessments
{{< /hextra/hero-subtitle >}}
</div>

<div class="hx:mb-6">
{{< hextra/hero-button text="Get Started" link="docs" >}}
{{< hextra/hero-button text="Download Latest Release 📦" link="https://github.com/PentHertz/RF-Swift/releases" >}}
</div>

<div class="hx:mt-6 hx:mb-12 hx:px-4 hx:sm:px-6 hx:md:px-8 hx:lg:px-12 max-w-screen-lg mx-auto">
  <h2 class="hx:text-3xl hx:font-bold hx:mb-4">Easy Installation</h2>
  <p class="hx:mb-6">Get RF Swift up and running in a minute: a one-line installer on Linux and macOS, a signed disk image on macOS, and a one-click installer on Windows. No technical expertise required.</p>

{{< tabs items="Linux / macOS (script),macOS (DMG),Windows (installer)" >}}
  {{< tab >}}

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

Then run `rfswift`. The script installs the CLI, the Workbench or both, and sets up Docker, Podman or Nix for you.

  {{< /tab >}}
  {{< tab >}}

```bash
# Homebrew: CLI and Workbench from the signed release
brew install --cask penthertz/rfswift/rfswift

# or the signed and notarized disk image
curl -LO https://github.com/PentHertz/RF-Swift/releases/latest/download/rfswift_Darwin_universal.dmg && open rfswift_Darwin_universal.dmg
```

In the disk image, drag the Workbench to Applications and run **Install RF Swift CLI** next to it. The same image is on the [releases page](https://github.com/PentHertz/RF-Swift/releases).

  {{< /tab >}}
  {{< tab >}}

```powershell
# Fetch the latest installer (x64 here, arm64 exists too) and run it
$setup = (Invoke-RestMethod https://api.github.com/repos/PentHertz/RF-Swift/releases/latest).assets | Where-Object name -like 'RFSwift-Setup-*-x64.exe'
Invoke-WebRequest $setup.browser_download_url -OutFile RFSwift-Setup.exe; .\RFSwift-Setup.exe
```

Or download it by hand from the [releases page](https://github.com/PentHertz/RF-Swift/releases). One UAC prompt installs WSL 2, USB passthrough, the container engine of your choice or Nix, and RF Swift with its Start Menu entries.

  {{< /tab >}}
{{< /tabs >}}

{{< youtube vDInlPsriUg >}}

{{< callout type="info" >}}
Every download is verified against the release SHA-256 manifest, with an optional Sigstore build-provenance check. Native packages (deb, rpm, pacman, Homebrew cask, MSI) and all the details are in [Getting Started](docs/getting-started).
{{< /callout >}}
</div>

<div class="hx:mt-6"></div>

{{< hextra/feature-grid >}}
  {{< hextra/feature-card
    title="Fast and Full-featured"
    subtitle="Access hundreds of radio frequency and hardware security tools with just a few commands."
    image="images/docs/imagesrf.png"
    imageClass="hx:top-[40%] hx:left-[24px] hx:w-[180%] hx:sm:w-[110%] hx:dark:opacity-80"
    class="hx:aspect-auto hx:md:aspect-[1.1/1] hx:max-md:min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(194,97,254,0.15),hsla(0,0%,100%,0));"
  >}}
  
  {{< hextra/feature-card
    title="Containers or native environments"
    subtitle="Run the tool sets in Docker, Podman or Lima containers, or natively with the Nix engine: pinned, reproducible, and closest to your hardware."
    image="images/docs/sdrangel.png"
    imageClass="hx:top-[40%] hx:left-[24px] hx:w-[180%] hx:sm:w-[110%] hx:dark:opacity-80"
    class="hx:aspect-auto hx:md:aspect-[1.1/1] hx:max-lg:min-h-[340px]"
    style="background: radial-gradient(ellipse at 50% 80%,rgba(142,53,74,0.15),hsla(0,0%,100%,0));"
  >}}
  
  {{< hextra/feature-card
    title="Multi-platform & Multi-architecture"
    subtitle="Run on Linux, Windows, or macOS without reformatting your computer. Supports x86_64, ARM64, and RISCV64."
    image="images/docs/onsteamdeck.jpg"
    imageClass="hx:top-[40%] hx:left-[24px] hx:w-[180%] hx:sm:w-[110%] hx:dark:opacity-80"
    class="hx:aspect-auto hx:md:aspect-[1.1/1] hx:max-md:min-h-[340px]"
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
    subtitle="Turn any computer into a complete RF testing lab in minutes, and drive a remote lab machine securely with the RF Swift agent."
  >}}
  
  {{< hextra/feature-card
    title="Workbench GUI"
    icon="desktop-computer"
    subtitle="Missions, terminals with recordings, notebook, findings, captures and branded reports in one desktop app."
  >}}
  
  {{< hextra/feature-card
    title="Community Driven"
    icon="users"
    subtitle="Join a growing community of RF enthusiasts and security professionals. Share custom images and workflows."
  >}}
{{< /hextra/feature-grid >}}