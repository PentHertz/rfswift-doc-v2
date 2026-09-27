---
title: What's new in v3.0.0 "Resonance"
description: "Archived release notes for RF Swift v3.0.0 \"Resonance\": the Ubuntu 26.04 rebase and the ad, android and osint images."
weight: 1
aliases:
  - /docs/release-notes-v3/
---

{{< callout type="info" >}}
**Archived.** v3.0.0 has been superseded by v4.0 "Nucleus" (current release v4.0.2). The images described here are still the ones RF Swift ships; the commands use the v3 spellings, which v4 keeps as legacy aliases. See [What's new in v4.0](/docs/release-notes-v4).
{{< /callout >}}

RF Swift v3.0.0 rebases the whole image collection on **Ubuntu 26.04 "Resolute"**, rebuilds the CLI on the new **Moby SDK**, and adds a set of images that take RF Swift beyond the radio layer and into full engagement territory.

{{< callout >}}
**In one line:** a hardware and RF security lab in seconds, from a ham shack on a Sunday afternoon to a full engagement on Monday morning.
{{< /callout >}}

## New base: Ubuntu Noble -> Resolute (26.04)

Every official image now builds on `ubuntu:26.04`. The published repository moved accordingly:

| | Repository |
|---|---|
| **Before (v2.x)** | `penthertz/rfswift_noble` |
| **Now (v3.0.0)** | `penthertz/rfswift_resolute` |

```bash
rfswift run -i penthertz/rfswift_resolute:sdr_full
```

The CLI defaults to the new repository, and warns you when a container is still running an image from the legacy `noble` repository.

### Why this was real work

Resolute is not a cosmetic bump. The toolchain moved under everything at once:

- **GCC 15** promotes K&R-style C to hard errors, so a lot of RF software from the 2000s simply stopped compiling
- **CMake 4** dropped compatibility with `cmake_minimum_required(VERSION < 3.5)`, which most GNU Radio out-of-tree modules still declare
- **Boost 1.90** removed the deprecated `io_context` APIs several SDR projects still call
- **Python 3.14** and **Java 25** became the defaults, breaking pinned toolchains and native extensions

Rather than freezing on an old base, we patched what was broken and maintain the forks publicly:

`gr-osmosdr_resolute`, `gr-gsm_resolute`, `gr-fosphor_resolute`, `gr-dvbs2_resolute`, `gr-nordic_resolute`, `gr-grnet_resolute`, `gr-pdu_utils_resolute`, `gr-sandia_utils_resolute`, `gr-fhss_utils_resolute`, `gr-timing_utils_resolute`, `srsRAN_4G_resolute`, `yate_resolute`

**OpenBTS** and **OpenBTS-UMTS** are legacy C++ that GCC 15 rejects outright; both are maintained on the `resolute` branches of the [PentHertz/OpenBTS](https://github.com/PentHertz/OpenBTS) and [PentHertz/OpenBTS-UMTS](https://github.com/PentHertz/OpenBTS-UMTS) forks, with porting still in progress.

The result: 50+ GNU Radio out-of-tree modules still build on 26.04.

{{< callout type="info" >}}
Images no longer abort when a single tool fails to build. Failures are recorded in `/var/lib/db/rfswift_build_report.tsv` inside each image, so you can see exactly what landed in your build and reinstall anything missing with `rfswift install`.
{{< /callout >}}

## Rebuilt CLI

`rfswift` now drives containers through the **new Moby SDK** (`github.com/moby/moby/api` + `github.com/moby/moby/client`) instead of the legacy Docker Go client, and every Go dependency is current.

Engine choice is still yours and is auto-detected at startup, or forced with `--engine`:

- **Docker**: the default on Linux and Windows
- **Podman**: rootless and daemonless ([guide](/docs/guide/podman))
- **Lima**: how RF Swift gets real USB passthrough for SDR dongles on macOS, plus an optional GPU VM ([`rfswift engine lima`](/docs/commands/engine))

## Telecom: 5G SA now runs on OCUDU

The 5G SA CU/DU stack installed in the `telecom_5G` images is now [**OCUDU**](https://gitlab.com/ocudu/ocudu) instead of srsRAN Project. It still provides the `gnb` binary and builds into `/telecom/5G/ocudu`, so existing configurations carry over, and `srsran5GSA_soft_install` is kept as an alias.

**srsRAN 4G** is unaffected and remains the 4G / 5G-NSA stack, from the `srsRAN_4G_resolute` fork.

2G to 5G, still one pull. See [Telecommunications](/docs/guide/list-of-tools#telecommunications) for the full inventory.

## GNU Radio 4, testable in seconds

Curious about GNU Radio 4 but not willing to wreck the GNU Radio 3.10 environment you actually work in? There is now a dedicated image:

```bash
rfswift run -i penthertz/rfswift_resolute:sdr_gnuradio4
```

GR4 (4.0.0-RC2) is built from source into `/opt/gnuradio4` with its own Python 3.12 virtual environment for the embedded interpreter, in parallel with the apt GNU Radio 3.10 that stays the image default. No building from source yourself, no VM, no disturbing your existing flowgraphs.

{{< callout type="warning" >}}
GNU Radio 4 is a **release candidate**. Expect API churn. This image is for evaluating GR4, not for production work. Not yet available on RISC-V64.
{{< /callout >}}

## New images for full engagements

Radio work rarely stops at the radio. Three new images cover what comes after:

| Image | What it's for | Highlights |
|-------|---------------|------------|
| **`ad`** | Active Directory engagements | Impacket, NetExec, Responder, BloodHound.py, Certipy, bloodyAD, certsync, mitm6, kerbrute, lsassy, ldapdomaindump, sprayhound, DonPAPI, SharpLAPS, pyGoldenGMSA, skewrun |
| **`android`** | Mobile assessment | adb/fastboot, apktool, smali, apksigner, scrcpy, dex2jar, Frida, objection, androguard, drozer, MobSF |
| **`osint`** | Recon and open-source intelligence | theHarvester, Sherlock, maigret, holehe, GHunt, toutatis, instaloader, Sublist3r, h8mail, censys, subfinder, SpiderFoot, recon-ng, FinalRecon |

All three build on all supported architectures. See [Included Tools](/docs/guide/list-of-tools) for the complete per-image tables.

## New tools in existing images

- **Reversing** gained a proper SAST/DAST set. **Trivy** (vulnerabilities, misconfigurations, secrets, SBOM) and **Sighthound** (tree-sitter taint-flow scanner with SARIF output) join Semgrep, Joern, cppcheck, honggfuzz, AFL and the Clang static analyzer
- **Bluetooth** gained **Caeruleus** (single-binary BLE assessment workflow with JSON output) and **BlueSploit**, alongside the **WhisperPair** exploit for CVE-2025-36911
- **SDR** gained **FISSURE** in an isolated venv that reuses the image's existing GNU Radio/SoapySDR stack, plus HydraSDR support (`gr-hydrasdr`, `hydrasdr_433`)
- **Network** gained Sniffnet, NetWatch, Hetty, HExHTTP, SSRFmap, GraphQLmap, betterleaks, SecLists and more
- **Hardware** gained the Sipeed SLogic PulseView build, plus `findus` (PicoGlitcher) and `rd6006` support

## Multi-architecture

Everything above ships on **x86_64**, **ARM64** and **RISC-V64**, with the exception of `sdr_gnuradio4` (amd64 and arm64 for now) and the GPU-accelerated SDR variants (amd64 only).

## Upgrading from v2.x

1. **Update the CLI:**
   ```bash
   rfswift update
   ```
   or reinstall with the one-liner from [Getting Started](/docs/getting-started).

2. **Pull the new images.** Your `noble` containers keep working, but new pulls should target `penthertz/rfswift_resolute`:
   ```bash
   rfswift images pull -i sdr_full
   ```

3. **Recreate long-lived containers** rather than upgrading in place if you rely on tools that were rebuilt against the new toolchain:
   ```bash
   rfswift upgrade -c my_container -i penthertz/rfswift_resolute:sdr_full \
     -r /root/captures,/root/scripts
   ```
   The `-r` flag preserves the directories you list. See [`rfswift upgrade`](/docs/commands/upgrade).

4. **Check the build report** in the new image if a tool you depend on seems absent:
   ```bash
   cat /var/lib/db/rfswift_build_report.tsv
   ```

## Next steps

{{< cards >}}
  {{< card link="/docs/guide/list-of-images" title="Container Images" icon="document-text" subtitle="The full image catalogue, including the new ad, android, osint and sdr_gnuradio4 images." >}}
  {{< card link="/docs/guide/list-of-tools" title="Included Tools" icon="document-text" subtitle="Per-image tool inventories with architecture support." >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Install or update RF Swift." >}}
{{< /cards >}}
