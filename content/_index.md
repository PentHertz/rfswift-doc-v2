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

## Used by Professionals Worldwide

<div class="hx-grid hx-grid-cols-2 md:hx-grid-cols-4 hx-gap-8 hx-mt-8">
  <div class="hx-flex hx-flex-col hx-items-center hx-justify-center hx-text-center">
    <div class="hx-text-4xl hx-font-bold hx-text-primary-500">100+</div>
    <div class="hx-mt-2">Pre-built tools</div>
  </div>
  <div class="hx-flex hx-flex-col hx-items-center hx-justify-center hx-text-center">
    <div class="hx-text-4xl hx-font-bold hx-text-primary-500">3</div>
    <div class="hx-mt-2">Architectures supported</div>
  </div>
  <div class="hx-flex hx-flex-col hx-items-center hx-justify-center hx-text-center">
    <div class="hx-text-4xl hx-font-bold hx-text-primary-500">Easy</div>
    <div class="hx-mt-2">Hardware integration</div>
  </div>
  <div class="hx-flex hx-flex-col hx-items-center hx-justify-center hx-text-center">
    <div class="hx-text-4xl hx-font-bold hx-text-primary-500">Fast</div>
    <div class="hx-mt-2">Deployment</div>
  </div>
</div>

## Get Started in Minutes

```bash
# Download RF Swift
curl -sSL https://github.com/PentHertz/RF-Swift/releases/latest/download/rfswift-linux-amd64 -o rfswift

# Make it executable
chmod +x rfswift

# Run a container with GNU Radio
./rfswift run penthertz/gnuradio-companion
```

## Featured Tools

RF Swift provides seamless access to essential RF and hardware security tools:

<div class="hx-grid hx-grid-cols-1 md:hx-grid-cols-3 hx-gap-4 hx-mt-6">
  <div class="hx-p-4 hx-border hx-rounded-lg hx-shadow-sm">
    <h3 class="hx-text-lg hx-font-semibold">SDR Tools</h3>
    <ul class="hx-mt-2 hx-list-disc hx-list-inside">
      <li>SDR++</li>
      <li>SDRangel</li>
      <li>GNU Radio</li>
      <li>GQRX</li>
      <li>URH / Inspectrum</li>
      <li>And morem</li>
    </ul>
  </div>
  <div class="hx-p-4 hx-border hx-rounded-lg hx-shadow-sm">
    <h3 class="hx-text-lg hx-font-semibold">Reversing</h3>
    <ul class="hx-mt-2 hx-list-disc hx-list-inside">
      <li>Ghidra</li>
      <li>Unicorn</li>
      <li>binwalk 3</li>
      <li>And more</li>
    </ul>
  </div>
  <div class="hx-p-4 hx-border hx-rounded-lg hx-shadow-sm">
    <h3 class="hx-text-lg hx-font-semibold">Wireless Analysis</h3>
    <ul class="hx-mt-2 hx-list-disc hx-list-inside">
      <li>Bluetooth tools</li>
      <li>RFID</li>
      <li>Zigbee analysis</li>
      <li>WiFi tools</li>
      <li>Signal analyzers</li>
      <li>And more</li>
    </ul>
  </div>
</div>

But also automotive, hardware programming, and more.