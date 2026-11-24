---
title: Included tools
description: Every tool in every RF Swift toolbox, the architectures it runs on, and how to add the ones that are not installed by default.
level: reference
weight: 3
---

This page lists the tools inside each RF Swift toolbox (container image). It is a reference: you don't need to read it from top to bottom. If you are still choosing a toolbox, start with [Choose a toolbox](/docs/guide/list-of-images/).

## How to use this page

- **Find a tool.** Long tables have a filter box above them: type part of a name to narrow the table down. To search the whole documentation at once, press <kbd>Ctrl</kbd> <kbd>K</kbd>.
- **Read the status columns.**
  - **Yes**: the tool is installed by default: it is in the image when you pull or build it.
  - **No**: install it manually: the image ships an installation function for it, which you run after creating your lab.
  - **Limited**: the tool may have architecture-specific issues.
- **Add a tool marked No.** Create your lab, then run the function named in the **Installation function** column:

  ```bash
  rfswift container install -c my_lab -i <installation_function_name>
  ```

  Leave out `-i` to pick the function from a searchable list. [Add more software](/docs/guide/installing-software/) compares this with the other ways to add tools, and [container install](/docs/commands/install/) has every option.

{{< callout type="info" >}}
RF Swift is in active development: the tool collection is regularly expanded and optimized for all supported architectures.
{{< /callout >}}

## Image hierarchy

Each RF Swift image builds upon a foundation of tools, with specialized images adding domain-specific capabilities: `corebuild` is the base, `sdrsa_devices` adds the SDR drivers, `sdr_light` builds on it, `sdr_full` on `sdr_light`, and so on. The full diagram is in [Choose a toolbox](/docs/guide/list-of-images/#how-images-build-on-each-other). A tool listed for a base image is also in every image built on it.

## Tools by image

### Core SDR device support

The `sdrsa_devices` image serves as the foundation for many RF Swift images, providing essential drivers and utilities for software-defined radio hardware.

{{< csv-table "content/docs/guide/tools_sdrsa_devices.csv" >}}

{{< callout type="info" >}}
**Device-Specific Notes:**
- **UHD vs ANTSDR**: Choose either standard UHD or ANTSDR variant during build (mutually exclusive)
- **RTL-SDR versions**: Standard rtl-sdr or rtlsdrv4 blog version (mutually exclusive)
- **Manual installation tools**: SoapySDR modules, SoapyPlutoSDR, and pocketVNA require manual installation after container creation
{{< /callout >}}

#### Common device troubleshooting

##### RTL-SDR kernel module conflicts

If your RTL-SDR device is unavailable when using tools like `nfc-spy`, the DVB-T kernel module may have claimed it. Blacklist the module with:

```bash
echo "blacklist dvb_usb_rtl28xxu" | sudo tee /etc/modprobe.d/blacklist-dvb_usb_rtl28xxu.conf
```

You'll need to restart your host system after adding this blacklist entry.

##### PlutoSDR connection issues

If the PlutoSDR doesn't appear with `iio_info -s` and you see errors like:

```
with backends: local xml ip usb
Unable to create Local IIO context : No such file or directory (2)
ERROR: Unable to create Avahi DNS-SD client :Daemon not running
Scanning for IIO contexts failed: Text file busy (26)
```

This can be resolved in two ways:
1. On Linux hosts: Ensure `avahi-daemon` is running on your host system
2. Inside the container: Run the Avahi daemon with:
   ```bash
   avahi-daemon --no-drop-root --no-rlimits
   ```

### SDR light

The `sdr_light` image includes essential software-defined radio tools for signal capture, analysis, and basic decoding.

{{< csv-table "content/docs/guide/tools_for_sdr_light.csv" >}}

{{< callout type="info" >}}
**Tool Locations:**
Most SDR tools are installed in standard system paths (`/usr/bin`, `/usr/local/bin`), with specialized tools in:
- `/rftools/sdr/` - SDR-specific applications
- `/rftools/sdr/oot/` - GNU Radio out-of-tree modules
- `/rftools/analysers/` - Spectrum analyzer software
- `/rftools/generators/` - Signal generator software
{{< /callout >}}

{{< callout type="info" title="New in v3.0.0" >}}
**FISSURE**, the AInfoSec RF framework, is installed in a dedicated virtual environment created with `--system-site-packages` so it reuses the GNU Radio, SoapySDR and driver stack already present in the image instead of pip-installing its own pinned copies over your system Python. Launch it with `fissure`. HydraSDR support also lands here, with the `gr-hydrasdr` GNU Radio source block and the `hydrasdr_433` decoder.
{{< /callout >}}

### SDR full

The `sdr_full` image builds on `sdr_light` to provide a complete SDR development and analysis environment, including GNU Radio and specialized plugins.

#### GNU Radio out-of-tree modules

These modules extend GNU Radio's capabilities for specific protocols and signal types:

{{< csv-table "content/docs/guide/tools_for_sdr_full_oot.csv" >}}

{{< callout type="warning" >}}
**Known Issues:**
- **gr-ccsds**: Currently broken due to strtod_l dependency issues
- **deep-tempest**: Available in the separate `deeptempest` image due to specific dependencies (see [Deep Tempest](#deep-tempest))
- **gr-fosphor**: Only included in GPU-enabled builds (requires OpenCL/CUDA)
- **gr-signal-hound**: Requires manual installation (architecture-specific)
{{< /callout >}}

#### Additional SDR software

{{< csv-table "content/docs/guide/tools_for_sdr_full.csv" >}}

{{< callout type="info" >}}
**Major Software Suites:**
- **SDR++**: Modern cross-platform SDR software with plugin support
- **SDRAngel**: Advanced SDR software with extensive plugin ecosystem
- **GQRX**: Popular SDR receiver powered by GNU Radio
- **SigDigger**: Signal analysis and reverse engineering tool
- **URH**: Universal Radio Hacker for wireless protocol analysis (with HydraSDR fork enhancements)
{{< /callout >}}

### GNU Radio 4.0
The `sdr_gnuradio4` image builds **GNU Radio 4.0** from source *alongside* the GNU Radio 3.10 already present in `sdr_light`, together with **GR4 Studio** and the GR4 control plane. It uses the newest release of the official [`gnuradio/gnuradio4`](https://github.com/gnuradio/gnuradio4) repository, currently **4.0.0-RC3**. GR4 is a separate C++23 codebase with its own headers, namespace and prefix, so nothing about your existing 3.10 flowgraphs changes:

```bash
rfswift container create -i sdr_gnuradio4 -n gr4
```

{{< csv-table "content/docs/guide/tools_for_gnuradio4.csv" >}}

**Run GR4 Studio in your browser.** This is the easiest way from a container:

```bash
gr4-studio-web        # then open http://localhost:8080 on the host
```

It listens on `127.0.0.1:8080`. RF Swift's default host networking makes that reachable from your browser and nowhere else. The control plane behind it stays on a private loopback port. With another network mode, run `GR4_STUDIO_WEB_BIND=0.0.0.0 gr4-studio-web` and publish the port on the host's loopback only (`-w "127.0.0.1:8080:8080/tcp"`, see [ports](/docs/commands/ports/)). For the desktop app, run `gr4-studio` with display forwarding.

{{< callout type="info" >}}
**How GR4 is isolated:**
- Installed under `/opt/gnuradio4/install`. Login shells load its environment from `/etc/profile.d/gnuradio4.sh`; in any other shell run `. /opt/gnuradio4/env.sh`
- The apt GNU Radio 3.10 remains the default `gnuradio-companion` in the image
- The image build runs upstream's own checks against the installed GR4: an out-of-tree program is built against the SDK, and the control plane must list the block catalog. A failure shows up in the build report (`/var/lib/db/rfswift_build_report.tsv`)
- Full usage, including building your own GR4 code: [GNU Radio 4 guide](https://github.com/PentHertz/RF-Swift-images/blob/main/docs/gnuradio4.md)
{{< /callout >}}

{{< callout type="warning" >}}
**GNU Radio 4 is a release candidate.** Expect API churn: this image is for evaluating GR4, not for production flowgraphs. **Studio has no login** and can start flowgraphs, including ones that transmit with an attached SDR. Keep it on localhost or on networks you trust. Not yet available on RISC-V64; Studio needs amd64 or arm64.
{{< /callout >}}

### SDR hacks

The `sdr_hacks` image builds on `sdr_light` and turns hardware that was never sold as an SDR into one: MediaTek Wi-Fi dongles and routers, ESP32 boards and the Semtech LR2021. It also carries alternative SDR firmware: fpv_capture turns an AntSDR E200 or E310 into an analog FPV video scanner.

{{< csv-table "content/docs/guide/tools_for_sdr_hacks.csv" >}}

{{< callout type="warning" >}}
**Some hacks need the host.** Mtk79ICAP's kernel modules and patched firmware must be built and loaded on the host, not in the container. The ESP32 and LR2021 projects need their firmware flashed first; `esptool` is included for that.
{{< /callout >}}

{{< callout type="info" >}}
**AntSDR FPV scanner (fpv_capture).** Copy the boot files for your board to the root of the SD card's FAT32 boot partition, then boot the SDR from the SD card:

```sh
cp /rftools/sdr/fpv_capture/bootfiles/e200/* /media/<sd-boot-partition>/   # or bootfiles/e310
```

Give the host `192.168.1.100/24` on the Ethernet link and open `http://192.168.1.10/` to scan and lock frequencies. The board's SSH login is `root` / `root`, so keep it on an isolated link. To record frames from the container, run `fpv-receive --url http://192.168.1.10 --lock-mhz 5800 --output fpv-recordings`. It saves BMP images with JSON metadata, grouped by frequency.

`u220-fpv-tx` replays PAL/NTSC test video through a MicroPhase U220 (UHD, `--args type=b200,serial=<serial>`). It only plans the run unless you pass `--transmit`. `u220-fpv-gui` builds the test signals and drives it. Transmit only into a dummy load or a shielded setup, or where you are licensed to.
{{< /callout >}}

### Deep Tempest

The `deeptempest` image is dedicated to [Deep-TEMPEST](https://github.com/emidan19/deep-tempest): it reconstructs video from the electromagnetic emanations of a display cable, using GNU Radio and a deep-learning model. It carries GNU Radio 3.10, the SoapySDR modules (including PlutoSDR), gr-guiextra and the deep-tempest blocks with their pre-compiled example flowgraphs.

### RFID

The `rfid` image focuses on radio-frequency identification analysis and exploitation:

{{< csv-table "content/docs/guide/tools_for_rfid.csv" >}}

{{< callout type="warning" >}}
**RFID Device Requirements:**
When using RFID tools, you need to ensure that your RFID reader device (typically appearing as `/dev/ttyACM0`) is properly bound to the container:

```bash
# When creating a new container
rfswift container create -i rfid -n rfid_tools -s /dev/ttyACM0:/dev/ttyACM0

# Or with an existing container
rfswift config bindings add -c rfid_tools -d -t /dev/ttyACM0   # serial port, attached on demand
```
{{< /callout >}}

### Bluetooth

The `bluetooth` image contains specialized tools for Bluetooth protocol analysis and security testing:

{{< csv-table "content/docs/guide/tools_for_bluetooth.csv" >}}

{{< callout type="warning" >}}
**Required Capability:**
Bluetooth tools require the `NET_ADMIN` capability to function properly. Always include this capability when running the container:

```bash
rfswift container create -i bluetooth -n bt_tools -a NET_ADMIN
```

Without this capability, many Bluetooth tools will fail with permission errors when attempting to configure network interfaces.
{{< /callout >}}

{{< callout type="info" >}}
**Python Virtual Environments:**
Some Bluetooth tools run in isolated Python environments:
- **Mirage**: Python 3.10 venv at `/opt/mirage-env/`, run with `mirage`. scapy is held at 2.5.0 there, because newer scapy renamed HCI commands that Mirage's BLE code uses
- **Bluing**: Python 3.10 venv at `/rftools/bluetooth/bluing/`, run with `bluing`
- Both get Python 3.10 from `uv` on every architecture

**New in v3.0.0:** **Caeruleus**, a single Go binary covering the whole BLE assessment workflow on BlueZ (scan, GATT enumeration, read/write/notify, fuzzing and structured assessment with JSON/JSONL output), and **BlueSploit**, a Bluetooth exploitation framework. Both sit next to the existing **WhisperPair** exploit for CVE-2025-36911.

**Tool Locations:**
- `/rftools/bluetooth/` - Main Bluetooth tools directory
- `/rftools/bluetooth/firmwares/` - Firmware for various BLE sniffers (Btlejack, Injectable NRF52840, Sniffle)
{{< /callout >}}

### Wi-Fi

The `wifi` image provides tools for Wi-Fi network analysis, packet capture, and security assessment:

{{< csv-table "content/docs/guide/tools_for_wifi_basic.csv" >}}

{{< callout type="warning" >}}
**Required Capability:**
Wi-Fi tools require the `NET_ADMIN` capability to manipulate wireless interfaces. Always include this capability when running the container:

```bash
rfswift container create -i wifi -n wifi_tools -a NET_ADMIN
```

If you see errors about insufficient permissions when using Wi-Fi tools, this capability is likely missing.
{{< /callout >}}

{{< callout type="info" >}}
**WPA3 Attack Tools:**
RF Swift includes a complete suite of WPA3 vulnerability testing tools:
- **dragonslayer** - Dragonfly handshake vulnerabilities
- **dragonforce** - Downgrade and DoS attacks
- **dragondrain-and-time** - Resource exhaustion
- **wacker** - SAE timing attacks

All WPA3 tools are located in `/rftools/wifi/wpa3/`
{{< /callout >}}

### Telecommunications

The telecommunications images are divided into several categories based on mobile network generations:

#### Telecom utilities

Foundation tools for cellular network analysis:

{{< csv-table "content/docs/guide/tools_for_telecom_utils.csv" >}}

{{< callout type="info" >}}
**Python Libraries:**
- **pycrate**: Complete Python cellular protocol stack
- **CryptoMobile**: Mobile network cryptography (Milenage, TUAK, Kasumi, etc.)
- **pysctp**: Python SCTP bindings for signaling protocols
- **bromelia**: Diameter protocol stack for LTE/5G core
{{< /callout >}}

#### 2G/3G

Tools for GSM, UMTS, and related technologies:

{{< csv-table "content/docs/guide/tools_for_telecom_2gto3g.csv" >}}

{{< callout type="warning" >}}
**Architecture Limitations:**
- **YateBTS**: Requires Qt5 dependencies, may have limited multi-arch support
- **OpenBTS/OpenBTS-UMTS**: x86_64 only due to build dependencies
- **OsmoCom suite**: Builds on all architectures but requires significant system resources
{{< /callout >}}

{{< callout type="info" title="OpenBTS and OpenBTS-UMTS on Resolute" >}}
Both are legacy C++ code bases that GCC 15 (the compiler shipping with Ubuntu 26.04) rejects outright. RF Swift installs them from PentHertz forks on dedicated `resolute` branches, [PentHertz/OpenBTS](https://github.com/PentHertz/OpenBTS) and [PentHertz/OpenBTS-UMTS](https://github.com/PentHertz/OpenBTS-UMTS), rather than from the dead upstreams.

Porting is still in progress: some translation units (notably the OpenBTS-UHD `Transceiver` code, which trips a `std::complex` ambiguity under GCC 15) may still fail to build. RF Swift records these as build failures instead of aborting the image, so check `/var/lib/db/rfswift_build_report.tsv` inside a `telecom_2Gto3G` container to see exactly what landed in *your* build. YateBTS and the OsmoCom suite are unaffected and remain the recommended 2G/3G path.
{{< /callout >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/telecom/2G/` - 2G base stations and tools
- `/telecom/3G/` - 3G/UMTS tools
- `/telecom/SIM/` - SIM card programming tools
- Configuration files in `/root/config/osmobts/`
{{< /callout >}}

#### 4G/5G

Tools for LTE and 5G-NSA:

{{< csv-table "content/docs/guide/tools_for_telecom_4gto5g.csv" >}}

{{< callout type="info" >}}
**srsRAN 4G**:
Complete LTE stack including:
- **srsENB**: LTE eNodeB (base station)
- **srsEPC**: Evolved Packet Core
- **srsUE**: UE simulator
{{< /callout >}}

#### 5G standalone

Tools for 5G standalone (SA) and core networks:

{{< csv-table "content/docs/guide/tools_for_telecom_5g.csv" >}}

{{< callout type="info" title="5G SA now runs on OCUDU" >}}
As of v3.0.0, the CU/DU stack installed in the 5G images is [OCUDU](https://gitlab.com/ocudu/ocudu) instead of srsRAN Project. The `srsran5GSA_soft_install` function is kept as an alias so existing recipes and scripts keep working, but it now installs OCUDU. It builds into `/telecom/5G/ocudu` and still provides the `gnb` binary, so your existing configuration files and workflows carry over.

srsRAN 4G is unaffected and remains the 4G/5G-NSA stack. See the [4G/5G section](#4g5g) above.
{{< /callout >}}

{{< callout type="warning" >}}
**MongoDB Requirement:**
Open5GS requires MongoDB for subscriber database. The container includes:
- MongoDB 6.0 from official repository
- Web UI for subscriber management (Node.js based)
- Database directory at `/data/db/`

To start all Open5GS components: `Open5Gs_deployall`
{{< /callout >}}

#### 5G with OpenAirInterface

The `telecom_5G_oai` image (on top of `telecom_utils`) pairs the OpenAirInterface 5G RAN with the Open5GS core:

{{< csv-table "content/docs/guide/tools_for_telecom_5g_oai.csv" >}}

{{< callout type="info" >}}
OAI's own `build_oai -I` dependency step refuses Ubuntu 26.04, so RF Swift reproduces it with the apt packages and the asn1c and SIMDE commits that OAI pins. The soft modems and sample configurations are under `/telecom/5G/openairinterface5g/` (`targets/PROJECTS/GENERIC-NR-5GC/CONF/`).
{{< /callout >}}

#### LTE sniffing

The `telecom_ltesniffer` image (on top of `telecom_utils`) carries LTESniffer, which decodes LTE downlink and uplink control traffic passively:

{{< csv-table "content/docs/guide/tools_for_telecom_ltesniffer.csv" >}}

{{< callout type="warning" >}}
Capturing cellular traffic is regulated in most countries. Only sniff networks you own or are authorized to test.
{{< /callout >}}

### Automotive

The `automotive` image contains tools for vehicle network analysis and communication:

{{< csv-table "content/docs/guide/tools_for_automotive.csv" >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/automotive/` - Main automotive tools directory
- CAN/LIN/FlexRay tools
- Vehicle protocol analyzers
{{< /callout >}}

### Reverse engineering & SAST

The `reversing` image provides tools for firmware analysis, hardware reverse engineering and static application security testing:

{{< csv-table "content/docs/guide/tools_for_reversing.csv" >}}

{{< callout type="info" title="Static analysis alongside the RE tooling" >}}
Beyond the disassemblers and unpackers, the image carries a full SAST/fuzzing set you can point at extracted firmware and source trees: **Semgrep**, **Joern**, **cppcheck**, the **Clang static analyzer**, **AFL** and **honggfuzz**. Two of those are new in v3.0.0: **Trivy**, which scans images, filesystems and repos for vulnerabilities, misconfigurations, secrets and SBOMs, and **Sighthound**, a tree-sitter based scanner that follows source-to-sink taint flows through Python, JS/TS, Java, PHP, C#, Go and Ruby and reports in text, JSON, CSV or SARIF.
{{< /callout >}}

{{< callout type="warning" >}}
**Architecture-Specific Tools:**
- **Ghidra**: Java-based, works on all architectures
- **Radare2/Cutter**: x86_64 only due to Qt dependencies
- **Unicorn/Keystone**: x86_64 only (ARM64 builds broken)
- **Binwalk v3**: Requires Rust 1.82+, uses cargo for installation
{{< /callout >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/reverse/` - Reverse engineering tools and projects
- Ghidra at `/reverse/ghidra_X.X.X_PUBLIC/`
- ImHex: extracted from its AppImage on every architecture (there is no Ubuntu 26.04 package), linked as `imhex`
{{< /callout >}}

### Network

The `network` image contains general network analysis and security tools:

{{< csv-table "content/docs/guide/tools_for_network.csv" >}}

{{< callout type="info" >}}
**Major Frameworks:**
- **Metasploit**: Full penetration testing framework (x86_64/aarch64)
- **NetExec**: Network protocol exploitation
- **Kismet**: Wireless/Bluetooth packet capture and analysis
- **Caido**: Modern web security testing platform
- **Burp Suite Community**: Multi-architecture support (JAR fallback for non-x86_64)
{{< /callout >}}

{{< callout type="warning" title="Exploit PoCs and collections: authorized testing only" >}}
- **Recent-CVE proof-of-concept repositories** live under `/opt/network/exploits/`: SIP2Shell, the CVE-2026-123007 NGINX HTTP/2 PoC and the nginx2root lab suite. Each is pinned to a commit that was reviewed for code aimed at the operator: install hooks, data exfiltration, obfuscation. None of them run at build time.
- **php2shell** and **brotli2crash** crash their targets, so they are **opt-in**: install them with `rfswift container install -c <lab> -i php2shell_soft_install` (or `brotli2crash_soft_install`).
- **Exploit-DB/searchsploit, commix and RouterSploit** track upstream. Refresh them with `searchsploit -u` or `git pull`.
- **`poc-lookup CVE-…`** searches an offline index of public PoC repositories. The repositories it lists are **unvetted**: review their code before running anything from them.

Details: [exploit PoCs guide](https://github.com/PentHertz/RF-Swift-images/blob/main/docs/network-exploit-pocs.md).
{{< /callout >}}

### Active directory
The `ad` image builds on `network` and packs the tooling needed for Windows domain engagements, the part of an assessment that starts once you are past the radio layer:

{{< csv-table "content/docs/guide/tools_for_ad.csv" >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/opt/ad/` - Staged AD tooling (SharpLAPS and other target-side payloads)
- `/opt/network/` - Shared network tooling inherited from the `network` image (Responder, DonPAPI, DonPwner, pyGoldenGMSA)
- pipx-installed tools are symlinked into `/usr/sbin/`
{{< /callout >}}

{{< callout type="warning" >}}
**Kerberos clock skew:** domain controllers reject tickets when your clock drifts more than a few minutes, and inside a container you usually cannot (and should not) change the system clock. `skewrun` resolves the DC's time over AD protocols and fakes it via `LD_PRELOAD`/libfaketime **for the wrapped process only**, so Impacket, NetExec and friends survive `KRB_AP_ERR_SKEW` without root and without touching the host clock. Run `skewrun --help` for the exact invocation.
{{< /callout >}}

{{< callout type="warning" >}}
**SharpLAPS** is a C#/.NET tool meant to run against Windows targets. RF Swift stages the repository under `/opt/ad/SharpLAPS` rather than compiling it on Linux. Build it on or against your Windows target.
{{< /callout >}}

### Mobile / Android
The `android` image covers Android application and device assessment, from pulling an APK off a handset to running it through a full static analysis pipeline:

{{< csv-table "content/docs/guide/tools_for_android.csv" >}}

{{< callout type="warning" >}}
**USB device access:** `adb` and `fastboot` need the handset bound into the container. Pass the device (or the whole USB bus) at creation time:

```bash
rfswift container create -i android -n mobile_lab -s /dev/bus/usb:/dev/bus/usb
```

On macOS, attach the device to the Lima VM first with `rfswift usb attach` (see [usb](/docs/commands/usb/)).
{{< /callout >}}

{{< callout type="info" >}}
**Tool Locations and Notes:**
- `/mobile/` - dex2jar (`/mobile/dex-tools-v2.4`) and the MobSF checkout
- **MobSF** only supports Python 3.12-3.13, so RF Swift provisions a dedicated interpreter with `uv` at `/mobile/.mobsf-python` and drives MobSF through it. Start it with `mobsf` and browse to `http://localhost:8000` (the default `host` network makes the port reachable as is; with another network mode, publish it with `-w 8000:8000/tcp`)
- **PDF report export** in MobSF relies on `wkhtmltopdf`, which Ubuntu removed. The upstream static build is installed best-effort on amd64/arm64; MobSF runs fine without it
{{< /callout >}}

### OSINT
The `osint` image collects open-source intelligence and reconnaissance tooling on top of `corebuild`:

{{< csv-table "content/docs/guide/tools_for_osint.csv" >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/opt/osint/` - SpiderFoot, recon-ng and FinalRecon, each in its own Python virtual environment with a wrapper script in `/usr/local/bin`
- pipx-installed tools are symlinked into `/usr/sbin/`
- Go tools (`subfinder`, `assetfinder`, `waybackurls`) land in `/usr/local/bin`
{{< /callout >}}

{{< callout type="warning" >}}
**API keys:** many OSINT tools (Censys, GHunt, SpiderFoot modules, subfinder sources) need credentials to return useful results. Configure them inside the container and commit the result with `rfswift container commit`, or bind a configuration directory from the host so your keys survive container recreation.
{{< /callout >}}

### Hardware security

The `hardware` image focuses on general hardware security testing and analysis:

{{< csv-table "content/docs/guide/tools_for_hardware.csv" >}}

{{< callout type="warning" >}}
**Logic Analyzer Software:**
- **Logic 2 (Saleae)**: x86_64 only, uses `--no-sandbox` flag automatically
- **PulseView/Sigrok**: Built from source with ARM64 libsigrokdecode patch
- **DSView**: Built from source for DSLogic devices
{{< /callout >}}

{{< callout type="info" >}}
**Tool Locations:**
- `/hardware/` - Logic analyzers, programmers, and debugging tools
- Arduino IDE wrapper at `/usr/sbin/arduino`
- OpenOCD with extensive debug probe support
{{< /callout >}}

### AI agents

The `llm` image (on top of `corebuild`, amd64 and arm64) gathers AI coding agents, shared security skill packs for all of them, and agent-side analysis tools. REA and Craft Anything are already registered with every agent as MCP servers.

{{< csv-table "content/docs/guide/tools_for_llm.csv" >}}

{{< callout type="info" title="Keep your sign-ins" >}}
Each agent keeps its credentials in the container's home directory. Bind those directories from the host so a new container finds them:

```bash
rfswift container create -i llm -n agents \
  -b ~/.rfswift-llm/claude:/root/.claude,~/.rfswift-llm/codex:/root/.codex,~/.rfswift-llm/vibe:/root/.vibe
```

Then sign in once: `claude` then `/login`, `codex login`, `opencode auth login`, `vibe --setup` or `hermes setup` (or set the matching API key variable). An empty host directory hides what the image put there (enabled skills, MCP registrations): copy the directory out of a fresh container first. `llm-skills list` shows the skill packs and `llm-skills enable` turns more on. The full guide is in the [llm image documentation](https://github.com/PentHertz/RF-Swift-images/blob/main/docs/llm.md).
{{< /callout >}}

{{< callout type="warning" >}}
**Strix** starts a sandbox container per scan, so it needs the host's Docker socket (`-b /var/run/docker.sock:/var/run/docker.sock`), which gives the container control of the host's Docker. **ARTEMIS** is opt-in (`rfswift container install -c agents -i artemis_redteam_soft_install`), and its sub-agents run commands inside the container itself. Point either one only at targets you are authorized to test.
{{< /callout >}}

### ARTEX

The `artex` image runs [ARTEX](https://github.com/BaaRai/ARTEX), an autonomous, agent-driven web-security testing platform. It has a Go backend with a web UI, a recording proxy, and a bundled recon toolchain (nmap, nuclei, httpx, katana, ffuf, dalfox, sqlmap, bbot, Playwright). PostgreSQL is included and started by hand, the way the Open5GS image works:

```bash
rfswift container create -i penthertz/rfswiftdev_resolute:artex -n artex
# inside the container
artex-postgres      # initialise (first time) and start the database
artex-start         # start ARTEX and print the one-time setup token
```

Then open `http://localhost:8787/setup`. ARTEX tracks the upstream `main` branch and is published to the development registry only (see [Choose a toolbox](/docs/guide/list-of-images/)). It is AGPL-3.0 with authorized-use-only terms from its maintainers.

## Native Nix environments

The same categories exist as native environments for the [Nix engine](/docs/guide/nix-engine), defined in [RF-Swift-nix](https://github.com/PentHertz/RF-Swift-nix). `rfswift env catalog` lists them on your machine, `rfswift env tools <name>` shows what one carries, and `rfswift env run <environment> <tool>` runs a single tool without creating anything. This table comes from the catalog (RF-Swift-nix 4.0.0):

| Environment | Category | Packages | What it covers |
|---|---|---|---|
| `ad` | Network | 20 | Active Directory attack tooling: impacket, NetExec, kerbrute, Samba/LDAP/Kerberos clients. |
| `android` | Mobile | 21 | Android / mobile: adb/fastboot, apktool, frida, androguard, scrcpy, jadx and reversing tools. |
| `automotive` | Automotive | 13 | Automotive / CAN bus: can-utils, SavvyCAN, gallia and CAN analysis tooling. |
| `bluetooth` | Bluetooth | 29 | Bluetooth Classic + BLE: BlueZ stack, Ubertooth, and Python BLE tooling, on the SDR device layer. |
| `cyberether` | SDR | 11 | CyberEther: heterogeneous SDR signal visualisation (Vulkan), with the SoapySDR device stack. |
| `cyberether_release` | SDR | 47 | CyberEther from upstream's prebuilt release (no compilation; also on aarch64 Linux and macOS), with the SoapySDR device stack. |
| `hardware` | Hardware | 29 | Hardware hacking: avrdude, sigrok/PulseView, OpenOCD, flashrom, openFPGALoader, esptool, dfu-util. |
| `network` | Network | 126 | General network & web pentest: nmap, Wireshark, Metasploit, bettercap, Kismet, hashcat/john, sqlmap and more. |
| `osint` | OSINT | 24 | OSINT: theHarvester, sherlock, recon-ng, subfinder, exiftool and reconnaissance tools. |
| `reversing` | Reversing | 46 | Reverse engineering & firmware analysis: Ghidra, rizin/Cutter, radare2, binwalk, AFL++, semgrep, ImHex. |
| `rfid` | RFID | 23 | RFID / NFC toolkit: Proxmark3 (Iceman), libnfc, MIFARE crackers and NFC utilities. |
| `sdr_full` | SDR | 78 | Full SDR arsenal: sdr_light plus SDRangel, SatDump, SigDigger, GQRX and many GNU Radio OOT modules available in nixpkgs. |
| `sdr_hacks` | SDR | 108 | sdr_light plus repurposed chips as SDRs: MediaTek Wi-Fi dongles and routers (BirriaSDR, Mtk79ICAP, W1700K), ESP32 radios (ESP-SDR, SoapyESPSDR) and the Semtech LR2021. |
| `sdr_light` | SDR | 59 | Light SDR set: GNU Radio, everyday SDR apps and the full device/driver layer (sdrsa_devices). |
| `telecom` | Telecom | 50 | Mobile telecom 2G-5G: Osmocom stack, srsRAN, Open5GS, UERANSIM, YATE and SDR. |
| `telecom_5g_bladerf` | Telecom | 26 | 5G SA on a bladeRF: srsRAN Project bladeRF fork with its SoapyBladeRF variant, Open5GS core, and the telecom utility set (telecom_5G_bladerf image). |
| `telecom_5g_oai` | Telecom | 60 | 5G SA with OpenAirInterface: OAI gNB and nrUE soft-modems over UHD (USRP), Open5GS core, and the telecom utility set (telecom_5G_oai image). |
| `telecom_ltesniffer` | Telecom | 58 | Passive LTE downlink/uplink sniffing with LTESniffer on a USRP, plus the telecom utility set (telecom_ltesniffer image). |
| `wifi` | WiFi | 45 | Wi-Fi audit suite: aircrack-ng, hcxtools, WPS/WPA3 attacks and rogue-AP frameworks, on top of the network toolkit. |

Packages are nixpkgs attribute names (`python3Packages.impacket`, `gnuradioPackages.gr-osmosdr`), which is also what `rfswift env install` and `rfswift env search --nixpkgs` accept, so a tool the catalog does not carry is one `env install` away. The catalog records the packages that do not build on an architecture, and the environment ships without them there. See [Installing software](/docs/guide/installing-software) for how this compares with the images.

## Tips for using the tools

### Where tools are installed

RF Swift organizes tools in specialized directories for easier discovery:

- `/rftools/` - Radio frequency analysis tools
 - `/rftools/sdr/` - SDR software and utilities
 - `/rftools/bluetooth/` - Bluetooth tools and firmwares
 - `/rftools/wifi/` - WiFi security tools
 - `/rftools/rfid/` - RFID readers and utilities
 - `/rftools/calibration/` - VNA and calibration tools
 - `/rftools/analysers/` - Spectrum analyzer software
 - `/rftools/generators/` - Signal generator software
- `/hardware/` - Hardware security and testing tools
- `/automotive/` - Vehicle communication and analysis tools
- `/reverse/` - Reverse engineering and firmware analysis tools
- `/telecom/` - Telecommunications tools
 - `/telecom/2G/` - GSM/2G base stations
 - `/telecom/3G/` - UMTS/3G tools  
 - `/telecom/4G/` - LTE/4G tools
 - `/telecom/5G/` - 5G SA/NSA tools
 - `/telecom/SIM/` - SIM card tools
- `/security/` - Security testing tools (Caido, etc.)
- `/opt/network/` - Network security tools
- `/opt/ad/` - Active Directory tooling (`ad` image)
- `/opt/osint/` - OSINT frameworks in their own venvs (`osint` image)
- `/mobile/` - Android and mobile tooling (`android` image)
- `/opt/gnuradio4/` - GNU Radio 4.0 tree and its Python venv (`sdr_gnuradio4` image)
- `/opt/fuzzing/` - Wordlists and fuzzing resources (SecLists)
- `/nettools/` - Network monitoring tools built from source
- `/opt/crack/` - Password cracking tools
- `/sast/` - Static analysis security testing

These directories complement the standard system paths (`/usr/bin`, `/usr/local/bin`) and contain specialized tools, scripts, and resources.

### Finding available tools

To discover which tools are available in your current container:

```bash
# List all executable commands in standard paths
find /usr/bin /usr/local/bin -type f -executable | sort

# List RF tools in the dedicated directory
ls -la /rftools

# List tools in other specialized directories
ls -la /hardware
ls -la /automotive
ls -la /reverse
ls -la /telecom

# Search for a specific tool across all locations
find /usr/bin /usr/local/bin /rftools /hardware /automotive /reverse /telecom -name "*sdr*" -type f -executable
```

### Installing tools manually

Some tools are not installed by default but can be added after container creation. To install these tools:

```bash
rfswift container install -c container_name -i <installation_function_name>
```

The [Installing software](/docs/guide/installing-software) page compares this with `apt` inside the container, committing the result, recipes, and the Nix engine's `env install` and `env run`.

Common manually-installed tools:
- `mdk3_soft_install` - WiFi DoS testing
- `wifipumpkin3_soft_install` - Rogue AP framework
- `install_soapy_modules` - Additional SoapySDR device support
- `pocketvna_sa_device` - PocketVNA software (x86_64 only)
- `srsran5GSA_bladerf_soft_install` - 5G SA gNB fork with bladeRF support

To find out what is available in a given image, check the **Installation function** column of the tables above. Every entry marked No can be installed this way.

{{< callout type="info" >}}
**Check what actually built.** RF Swift images record install failures instead of aborting the whole build, so a tool listed as installed by default may still be missing if its build broke on your architecture. Every image carries its build report at `/var/lib/db/rfswift_build_report.tsv`. Inspect it from inside a running container:

```bash
cat /var/lib/db/rfswift_build_report.tsv
```

An empty or missing file means nothing failed. Failures are recorded as `CATEGORY / STAGE / ITEM / DETAIL`, so you can see exactly which tool broke and why, then reinstall it manually with `rfswift container install` once the upstream issue is fixed.
{{< /callout >}}

### Tool documentation

Most tools include built-in help available through the `-h` or `--help` flags:

```bash
tool_name --help
```

For more detailed documentation, many tools include man pages:

```bash
man tool_name
```

### Creating tool aliases

For frequently used tools with complex options, consider creating aliases in your container:

```bash
echo 'alias rtlpower-optimized="rtl_power -f 88M:108M:25k -g 50 -i 10 -e 1h power.csv"' >> ~/.zshrc
source ~/.zshrc
```

## Architecture-specific notes

### x86_64 / AMD64
- Broadest tool support
- All GPU-accelerated tools available
- SignalHound and specialized SA software supported

### ARM64 / aarch64
- Most tools fully supported
- Some GUI applications require AppImage extraction
- Limited SA software support (no SignalHound Spike/VSG60)
- Python tools may need building from source

### RISC-V64
- Growing support, most core SDR tools work
- Some tools installed from source due to package availability
- Limited pre-built binary support
- Python packages may require longer build times

## Next steps

{{< cards >}}
  {{< card link="/docs/guide/installing-software/" title="Add more software" icon="download-simple" subtitle="Install functions, apt, recipes and Nix packages compared" >}}
  {{< card link="/docs/guide/sharing-files/" title="Files & devices" icon="folder-open" subtitle="Plug in your radios and readers" tag="Beginner" >}}
  {{< card link="/docs/guide/configurations/" title="Configuration file & profiles" icon="gear" subtitle="Customize your RF Swift environment" tag="Advanced" >}}
{{< /cards >}}
