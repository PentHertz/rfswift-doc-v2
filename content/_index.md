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

{{< tabs items="Linux/macOS (curl),Linux/macOS (wget),Windows" >}}
  {{< tab >}}
```bash
curl -fsSL "https://get.rfswift.io/" | sh
```
After installation, simply run: `rfswift`
  {{< /tab >}}
  {{< tab >}}
```bash
wget -qO- "https://get.rfswift.io/" | sh
```
After installation, simply run: `rfswift`
  {{< /tab >}}
  {{< tab >}}
See our [installation documentation](docs/quick-start) for Windows installation instructions.
  {{< /tab >}}
{{< /tabs >}}

{{< callout type="Warning" >}}
For security, it is advised to check the script and execute separately. As we don't have proper way to make a secure easy install, the best solution is would be manual installation through the `install.sh` script provided in each release.
{{< /callout >}}
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