---
title: "Tutorial: listen to your first signal"
linkTitle: Your first signal
description: Hear a local FM radio station with an RTL-SDR and SDR++ or GQRX, in about 15 minutes. Your first real signal, start to finish.
level: beginner
weight: 7
---

In this tutorial you tune a software-defined radio (SDR) to a local FM broadcast station and hear it through your speakers. It is the "hello world" of radio: once it works, your radio, your lab, the display and the sound are all proven, and every other tool follows the same path.

**Time:** about 15 minutes, plus the first download of the toolbox.

## What you need

- **RF Swift installed** and `rfswift doctor` without red lines. If not: [Install](/docs/getting-started/), then steps 1 to 3 of the [Quick start](/docs/quick-start/).
- **An SDR receiver.** A cheap RTL-SDR USB dongle is perfect. A HydraSDR, HackRF, Airspy or any other SDR supported by the tools works too.
- **An antenna.** The small one that comes with most dongles is enough for strong FM stations. Near a window is better than in a basement.
- **Speakers or headphones.**

{{< callout type="info" title="Is this legal?" >}}
Listening to public FM broadcasts is fine almost everywhere. This tutorial only **receives**. Transmitting is a different matter: it needs the right licence or a lab setup such as a shielded enclosure, and RF Swift's tools are meant for authorised work only.
{{< /callout >}}

{{% steps %}}

### Create a lab from the `sdr_light` toolbox

`sdr_light` contains the classic receiver tools, including **SDR++** (`sdrpp`) and **GQRX** (`gqrx`).

```bash
rfswift container create -i sdr_light -n fm
```

Already have a lab from the quick start? Enter it instead: `rfswift container shell -c my_first_lab`.

On a **Mac**, create the lab with `rfswift --engine lima container create -i sdr_light -n fm`: only the Lima engine can pass USB devices through on macOS.

### Plug in the dongle and check that the lab sees it

{{< tabs items="Linux,Windows,macOS" >}}
  {{< tab >}}
Plug the dongle in. USB devices are shared with the lab by default; if you plugged it in after creating the lab, `exit` and enter again with `rfswift container shell -c fm`.
  {{< /tab >}}
  {{< tab >}}
Forward the dongle into WSL 2, where labs run, then enter the lab again:

```powershell
rfswift usb attach
rfswift container shell -c fm
```

Pick the dongle in the list. The first time, Windows asks for administrator approval once.
  {{< /tab >}}
  {{< tab >}}
Attach the dongle to the Lima VM, then enter the lab again:

```bash
rfswift usb attach
rfswift --engine lima container shell -c fm
```

Pick the dongle in the list.
  {{< /tab >}}
{{< /tabs >}}

Inside the lab, test an RTL-SDR with:

```bash
rtl_test -t
```

It should find your device and print its tuner. Other SDRs have their own test tools (for example `hydrasdr_info` for a HydraSDR, `hackrf_info` for a HackRF), or you can go straight to the next step.

{{< callout type="warning" title="Linux: the dongle is busy or not found?" >}}
Linux sometimes grabs RTL-SDR dongles for digital TV (DVB-T). Block that driver **on your computer** (not in the lab), then restart your computer:

```bash
echo "blacklist dvb_usb_rtl28xxu" | sudo tee /etc/modprobe.d/blacklist-dvb_usb_rtl28xxu.conf
```
{{< /callout >}}

### Open a receiver

Start **SDR++** from the lab's shell:

```bash
sdrpp
```

Its window opens on your desktop, even though it runs inside the lab. Prefer GQRX? Run `gqrx` instead; the steps below are the same idea.

### Tune to an FM station

1. **Choose your device.** In SDR++, open the **Source** section of the side menu and pick your SDR (for example RTL-SDR). GQRX shows a device dialog on first start: select your dongle there.
2. **Start the radio** with the play button (top left in SDR++, the power button in GQRX's toolbar). A live spectrum and a waterfall start scrolling.
3. **Set the frequency** of a station you know, anywhere between **88 and 108 MHz** (for example 98.5 MHz). Click the frequency digits at the top and type or scroll them. Broadcast stations show up as wide, bright bands in the waterfall.
4. **Select the demodulator `WFM`** (wide FM). In SDR++ it is in the **Radio** section; in GQRX it is the **Mode** setting of the receiver options.
5. **Turn the volume up.** You should hear the station. Click the centre of a bright band to fine-tune.

If the audio is noisy, adjust the **gain** in the source settings: too little and you hear hiss, too much and strong stations distort.

### Keep your notes in the workspace

Everything saved in `/workspace` inside the lab lands in `~/rfswift-workspace/fm/` on your computer, and stays there even if you delete the lab:

```bash
echo "Strong station at 98.5 MHz, clean audio with WFM" > /workspace/notes.txt
```

Point the record or save dialogs of SDR++ and GQRX to `/workspace` too, and your recordings will be waiting for you on your computer.

{{% /steps %}}

## It doesn't work?

**No device found.** On Linux, check the DVB-T note above; with rootless Podman, run `rfswift host udev` on your computer, log out and in, and re-plug the dongle. On Windows, run `rfswift usb attach` again. On a Mac, check that the lab was created with `--engine lima` and that the dongle is attached (`rfswift usb vm-devices` lists what the VM sees).

**No sound.** On Linux and macOS, run `rfswift host audio enable` on your computer (not in the lab); if `pactl` is missing it tells you which package to install. On Windows, sound goes through WSLg: if `rfswift doctor` cannot find the WSLg sockets, run `wsl --update`, then `wsl --shutdown`.

**No window opens.** On Linux, `rfswift doctor` checks the X11 display and `xhost`. On macOS, windows open through XQuartz, which must be installed. On any system, `--desktop` gives the lab a desktop in your web browser instead. More in [FAQ & troubleshooting](/docs/faq/).

## What's next

You have proven the whole chain: radio, lab, display, sound and files. The same steps work for every other tool.

{{< cards >}}
  {{< card link="/docs/guide/list-of-tools/" title="Explore the tools" icon="toolbox" subtitle="Decode weather sensors with rtl_433, track aircraft with dump1090, reverse protocols with URH" >}}
  {{< card link="/docs/guide/list-of-images/" title="Try another toolbox" icon="stack" subtitle="wifi, bluetooth, rfid, telecom, automotive, hardware and more" >}}
  {{< card link="/docs/guide/workbench/" title="Use the Workbench" icon="desktop" subtitle="Keep notes, terminal recordings and captures together per mission" tag="Beginner" >}}
  {{< card link="/docs/guide/sharing-files/" title="Files & devices" icon="folder-open" subtitle="Share more folders and serial devices with your labs" >}}
{{< /cards >}}
