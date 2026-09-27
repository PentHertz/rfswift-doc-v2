---
title: RF Swift Workbench
linkTitle: Workbench
description: A desktop app for Linux, macOS and Windows that turns each lab into a mission, with terminals, notes, findings, captures and reports in one window.
level: beginner
weight: 10
---

The Workbench is the desktop companion of the `rfswift` command line. It turns every RF Swift container or native Nix environment into a **mission**, and gives each mission its own terminals, notebook, findings, captures and report, so one window takes you from "plug in the SDR" to "hand over the report".

It is a completely standalone desktop app: no code editor, no IDE, no plugins and no browser extension to install. It drives the same engines as the CLI (Docker, Podman, Lima, Nix), on your computer or on a remote lab machine, and there is nothing in it you cannot also do from a terminal.

{{< youtube id="LBUJcKiZVgM" title="RF Swift Workbench tour" >}}

## Your first mission in 5 steps

{{% steps %}}

### Install and open the Workbench

The Workbench ships with the same installers as the CLI. If you have not installed it yet, pick **Workbench** or **CLI and Workbench** when the installer asks (see [Install RF Swift](/docs/getting-started/)).

{{< tabs items="Linux,macOS,Windows" >}}
  {{< tab >}}
Install the `rfswift-workbench` package (deb, rpm or pacman), or use the portable AppImage on x86-64. Start it from your desktop menu or with `rfswift-workbench`.
  {{< /tab >}}
  {{< tab >}}
Use the Homebrew cask, or open the signed DMG and drag `rfswift-workbench.app` to Applications. Then open it from Applications.
  {{< /tab >}}
  {{< tab >}}
Use the installer bundle (or the MSI), then open **RF Swift Workbench** from the Start Menu.
  {{< /tab >}}
{{< /tabs >}}

While it starts, it shows "Connecting to RF Swift..." as it detects your engines, then lists your labs. If something is missing, click **Engine doctor** in the left rail: it checks your setup and offers the fix.

### Create a mission

Click **New mission** in the left rail. Give it a **Name** (used for the container or environment) and a **Title** (what you read in the list).

### Choose an engine and a toolbox

- **Engine**: Docker, Podman, Nix, or Lima on macOS. Pick one that is installed on this computer (the Engine doctor lists them).
- **Want to stay light?** Pick **Nix** and tick **Lazy tools (build on first use)**: nothing is installed until you run a tool, and then only that tool is fetched. On a Mac this runs the tools natively, with direct access to your USB radio.
- **Environment / image**: the toolbox to use, for example `sdr_light` for radio work. Not sure which one? See [Choose a toolbox](/docs/guide/list-of-images/).
- For containers, you can instead pick an **RF-Swift preset**, a ready-made set of options for a kind of job.
- Leave **Workspace** empty: your files will go to `~/rfswift-workspace/<name>` automatically.

Click create. The Workbench checks the image, your USB access and your devices first, then shows a progress bar while it downloads and builds.

### Start the mission and open a terminal

Select the mission, click **Start mission** (Nix environments don't need starting), then in the **Console** panel choose a shell and click **Connect**. You now have a terminal inside your lab, with all its tools. Tick **Record on connect** to keep a replayable recording of the session.

### Take notes, log findings and export a report

- Write what you see in the **Notebook** panel. Paste a screenshot straight into it.
- Log each issue in **Findings**, with the built-in CVSS v3.1 calculator.
- Click **Report** in the top bar to get a branded Markdown, HTML or PDF report.

{{% /steps %}}

{{< callout type="tip" title="Missions belong to projects" >}}
Missions are grouped into **projects**, one per engagement. You start in the `default` project; use the project button in the top bar to create another one before you start real client work. See [Projects](#projects).
{{< /callout >}}

## What it can do

| Area | What you get |
|------|--------------|
| **Missions** | One card per container or Nix environment, filtered by engine, with status, findings count and environment-audit posture at a glance |
| **Creation** | The CLI's whole option set in a dialog: profiles and templates, image download with progress, an image version picker for containers, devices and USB passthrough, network and ports, desktop, realtime, Nix build modes and version picker, live Nix build log, cancellation that cleans up |
| **Console** | Real terminals in the target (zsh, bash, sh; Nix PTY; ConPTY on Windows), asciinema recordings in segments, an inline player, and read-only tabs that show what the AI agent runs |
| **Notebook** | A Markdown note per mission, WYSIWYG or source, screenshots pasted straight in, embedded terminal recordings, AI rewrites through your own coding agent |
| **Config & network** | The container summary the CLI prints, live: image freshness, mounts, devices with serial hot-plug state, capabilities, ports, workspace, desktop link |
| **Findings** | pwndoc-style vulnerabilities with CVSS v3.1 calculator, priorities, retest status, proof of concept with images; import and export as pwndoc JSON |
| **Captures** | Import evidence, inventory the live workspace, register artifacts as AI-readable evidence, decode bytes with a native decoder stack or an offline CyberChef, read MIFARE Classic and Ultralight dumps |
| **Secrets** | Credentials collected during the assessment, stored in the OS vault only, excluded from every export |
| **Agent** | Codex, Claude Code, Kimi Code or GLM connected to the mission through a local, permission-gated MCP bridge; RF Swift never calls a model API itself |
| **Security posture** | The same scanners as `rfswift audit`, with a progress view, detailed CVE records and an AI-grounded review |
| **Reports** | Branded Markdown, HTML and PDF reports, pwndoc export and import |
| **Engine doctor** | Every engine's state, space reclaim, Lima VM lifecycle and settings, udev rules, Docker access, the Nix jail, host audio, Nix in WSL 2, WSLg display reset |
| **Remote** | Connect to a lab machine over pinned TLS 1.3 and mutual TLS; missions, terminals, audits, pulls, artifacts and USB passthrough run there |

---

{{< callout type="info" title="Reference" >}}
The rest of this page describes every panel, dialog and menu in detail. You don't need to read it in order: use the table of contents or <kbd>Ctrl</kbd> <kbd>K</kbd> to jump to what you need.
{{< /callout >}}

## Installing and launching

The Workbench is a separate binary from the CLI, delivered by the same installers:

- `get_rfswift.sh`: pick "Workbench" or "CLI and Workbench" (`RFSWIFT_INSTALL=both`).
- Linux: the `rfswift-workbench` deb, rpm or pacman package, or the portable AppImage on x86-64.
- macOS: the Homebrew cask or the DMG.
- Windows: the installer bundle or the MSI ("RF Swift Workbench" in the Start Menu).

It needs the CLI's engines to be set up: run `rfswift doctor` or open the Engine doctor from the Workbench.

Start it from the desktop menu or with `rfswift-workbench`. On start it shows "Connecting to RF Swift..." while it detects the engines, then lists your targets. It looks for engines and coding-agent CLIs in the usual tool directories even when they are not on your login `PATH`.

{{< callout type="info" >}}
On Linux the Workbench links your system's GTK and WebKit; use the package or AppImage that matches your distribution rather than a binary built elsewhere, or the window may stay blank.
{{< /callout >}}

## The window at a glance

- **Left rail, "Targets"**: two scope tabs, "Containers" and "Nix envs", a search box, an engine filter (all, docker, podman, lima) and one card per mission with its status dot, name, findings chip, "env" audit chip, engine and state, plus a Start/Stop button. Below: "New mission", "Import...", "Refresh", "Engine doctor". Right-click a card for the mission menu.
- **Top bar**: the project button (`project: default`), the "Agent" button (shows the connected coding-agent CLI), "Report", the connection chip (a lock coloured by the security audit, "This machine / local IPC" or the agent name and "mTLS / TLS 1.3"), and the theme toggle.
- **Mission bar**: title, path and engine of the selected mission, "Start mission" / "Stop mission" (Nix environments are native and have no lifecycle), "+ Panel" to open a panel you closed, "Reset layout".
- **Panels**: Notebook, Console, Config & network, Findings, Captures, Secrets, Agent terminal.
  - Drag a tab beside another to make a column, above or below to make a row, or drop it on a tab strip to stack.
  - Resize columns and rows; maximize one column.
  - Each mission remembers its layout.
- **Footer**: the RF Swift version and edition.

## Projects

A Workbench **project** holds the missions of one engagement: notes, findings, captures, reports, recordings and audits, under `~/.rfswift/workspaces/<project>/`. The project button opens **Workbench projects**:

- **Create or open by name**, switch between projects, **Close project** (back to `default`).
- **Export current project...** writes `<project>.rfswift-workbench.zip` with everything except secret values (those stay in the OS vault).
- **Import archive...** restores a project from such a ZIP under its recorded name (`-imported-N` on collision) and opens it. Archives are checked for unsafe paths, links and size (20 GiB expanded).
- **Delete** a project after closing it. The confirmation says what goes (mission data) and what stays (running containers, bind-mounted files).

Missions of the open project are shown; a live container or environment that is not recorded yet is added to the project the first time the list refreshes.

## Creating missions in detail

Press **New mission**. The **Create mission** dialog is the GUI twin of `rfswift container create`.

**Common fields**: Name, Title, Engine (Nix, Docker, Podman, and Lima on macOS), Environment / image with a hint that resolves short names, an optional Workspace path (empty for the automatic `~/rfswift-workspace/<name>`, "none" to disable), and a live line about USB reachability and devices the engine cannot map on this host.

{{% details title="Container options" level="advanced" %}}
- **RF-Swift preset**: the same profiles as `rfswift profile list`; typing a known image applies its preset.
- **Image version** picker, shown once the image is an official one:
  - **Latest** follows the newest published build, the same thing the CLI pulls.
  - Each published release is listed with its date and is pulled and kept as its own local tag (`sdr_full_0.1.1` next to `sdr_full`), so an older release can be pinned for a mission without replacing the current one.
  - **Refresh** reloads the list. Custom and imported images have no published versions, so the row stays hidden.
- **Network**: bridge, host, none, RF-Swift NAT with name and subnet.
- **Capabilities** checkboxes plus a free list.
- **GPU**: disabled, all, GPU 0, custom IDs.
- **Toggles**: "Realtime audio/SDR", "Start after creation", "Privileged", X11 forwarding (WSLg on Windows), host audio server (Linux and macOS).
- **Remote desktop** section: noVNC or VNC, bind address, port, password, SSL.
- **Bind mounts and mapped devices** with pickers: "Add directory...", "Add file...", "Bind device path...", "Add device...", "Add /dev/ttyACM0 (Proxmark)", "Apply USB hotplug defaults".
- **Ports**: exposed and published ports.
- **cgroup device rules** and **seccomp profile**.
- A **Download image** button with a layer-by-layer progress bar.
{{% /details %}}

{{% details title="Nix environment options" level="advanced" %}}
- "Lazy tools (build on first use)"
- "Pure environment"
- "Isolate (jail)"
- The **RF-Swift Nix version** picker: Latest, Nightly, every published tag, or a custom flake reference or a local checkout.
- The "USB passthrough..." button on Windows.
{{% /details %}}

{{% details title="What happens when you click create" %}}
**Before anything is created**, the Workbench checks:

- the image (it offers to download a newer official image, unless a release was pinned in the version picker);
- the USB access of the container ("USB devices will not be reachable", with "Apply USB hotplug defaults");
- the device mappings the engine cannot honour ("Remove unsupported devices").

**Then it runs the creation with a progress bar.** For Nix, the **build panel** shows derivations built and fetched, what compiles right now with its phase and elapsed time, tasks left, and the log tail. It opens the log on failure (kept at `~/.rfswift/nix/environments/<name>/build.log`).

- **Stop & clean** interrupts the build or the pull and removes partial resources.
- When the engine adjusted something (rootless Podman dropping cgroup rules, udev rules the environment ships but the host lacks), a "Created with adjustments" dialog lists it.
- On a rootless engine that refuses cgroup rules, the dialog offers to remove them and retries.

Through a remote agent the same dialog shows the same progress: the build or the pull runs on the agent host as a job, and "Stop & clean" cancels it there.
{{% /details %}}

### Importing a target

**Import...** in the rail restores what "Export archive..." produced. Import is local only.

- **Containers**: pick the engine (start it if stopped, the Lima VM included), an image name, the archive password if it has one, then the archive (`.tar.gz`, `.tar.gz.age`, `.tgz`, `.tar`). The filesystem becomes a verified local image and a mission is created from it automatically.
- **Nix**: pick a name (or keep the archived one), the password, and the `.rfenv` or `.rfenv.age`.
- If a **mission companion** file sits next to the archive (`<archive>.mission.zip`), notes, captures, findings, reports, recordings and audits are restored with it.

## Working in a mission

### Console

- Tabs are terminals: pick zsh, bash or sh, **Connect**, work, **Disconnect**; "+" opens another.
  - Containers are started if needed and serial device nodes are synced first.
  - Nix environments open a real PTY (inside their jail when isolated, with the OpenGL runtime and the display).
  - On a Windows Nix mission the shell runs in the WSL 2 distribution.
- **Recording**: "Record on connect", or **Start REC** / **Stop REC** at any time for segments, to `<mission>/recordings/` or a folder you choose. Recordings are asciinema `.cast` files; the **Recordings** drawer plays, renames and adds them to the note, and **Use as AI evidence** registers a copy for the mission's agent.
- **AI tool tabs** appear automatically when the connected coding agent runs a command through MCP: read-only, showing the command, its output and the result, so nothing mixes with your own shell.
- **Copy and paste**: Cmd+C / Cmd+V on macOS, Ctrl+Shift+C / Ctrl+Shift+V elsewhere. Right-click for Copy, Paste, Select all and, on macOS, "Option as Meta"; Option with the arrow keys moves by word. Links in the output open in the browser.
- A Nix mission whose jail cannot start (Ubuntu 24.04+ AppArmor) is offered the fix ("Enable isolation for this mission?") behind a polkit prompt, then reconnects.

### Notebook

One Markdown note per mission (`notes/note.md`).

- Edit it **Rendered** (WYSIWYG, with a sticky formatting bar: text styles, bold, italic, lists, quote, code block, link, clear) or as **Source**.
- Paste a screenshot or drop an image file: it is copied into `notes/assets/` and embedded. Image blocks have Copy, caption, move and delete controls.
- Embed a terminal recording as an inline player.
- **Export** saves the note as Markdown.
- **AI** sends the selection or the whole document with your instruction ("Improve clarity", "Summarize", "Remediation steps", "Proofread", or your own) to the connected coding agent, which writes the result back through MCP; the note refreshes when it does.

### Config & network

Three cards:

- **Configuration** shows what `rfswift container shell` prints: engine, environment or image with a freshness chip ("up to date", "update available", "custom"), the image version, size on disk, shell, X display, privileges, capabilities, device cgroups, bind mounts, devices (serial ports as "on demand, plugged in / not plugged in"), the serial hot-plug state, extra hosts, seccomp, ulimits, GPUs, the **workspace** (host path and the path the shell sees in a container or jail), and the remote desktop link with "Copy link" and "Open".
  - The image version is the release a pinned tag names or, for a rolling tag such as `rfid`, the release whose published digest the local image carries, with the newest published release next to it when an update exists.
- **Network** shows the mode, NAT subnet, exposed and published ports.
- **Tool environment security** is the audit card (see [Security posture and audits](#security-posture-and-audits)).

### Findings

A table of findings sorted by severity, each edited like a pwndoc vulnerability:

- title, type, affected scope, status (draft, open, confirmed, in progress, remediated, risk accepted, false positive);
- a **CVSS v3.1 calculator** (vector and score, severity derived from it), optional CVSS v4 vector;
- pwndoc category, priority, remediation complexity;
- rich Description, Observation, Remediation and Proof of concept (with images), references, retest status, and advanced pwndoc fields.

**Suggest from evidence** asks the connected agent for source-cited candidates from the notes and registered artifacts; **Collect credentials** stores exact observed credentials in the vault through the agent. Environment CVEs never become findings by themselves.

### Captures

- **Import evidence file...** copies a file into `captures/` with a metadata sidecar and classifies it: IQ recording, Flipper, Proxmark, binary or firmware, network capture, document, terminal recording, or a **custom type** you define with a name, an icon and extensions.
- **Open** runs the type's tool inside the target (inspectrum, qFlipper, ghidra, pm3, wireshark) or plays a recording.
- **Live workspace artifacts** inventories the mission workspace (up to 5,000 files, contents never read) with **Register**, **Add to note**, **Allow AI content** (text files up to 256 KiB, per file, on explicit approval) and **Inspect / decode**.
- The **Artifact decoder** shows the first 256 KiB as hex and ASCII, text, strings or Base64, with a byte range.
  - A **decoder stack** chains operations: hex, Base64 and Base64URL, Base32, Base58, ASCII85, numeric bytes, URL, quoted-printable, HTML entities, JSON, UTF-16, XOR, byte arithmetic, endian swaps, reverse, ROT13, gzip, zlib, raw deflate.
  - **Open selected range in CyberChef** hands the bytes to a pinned offline CyberChef v11.4.0 in your browser, served from an ephemeral loopback listener where the bytes travel only in the URL fragment.
- **MIFARE Classic** and **MIFARE Ultralight / NTAG** views decode card dumps:
  - Classic: sectors and blocks, manufacturer block, value blocks, sector keys with known defaults flagged, access bits with the permission they grant, complement-bit validation.
  - Ultralight / NTAG: pages, UID and BCC checks, OTP and lock bytes, NDEF summaries, EV1 configuration and password pages.

### Secrets

Credentials found during the assessment (passwords, tokens, API keys, private keys, Wi-Fi, PINs, cookies) with their exact source.

- Values are stored in the OS credential vault (Keychain, Credential Manager, Secret Service) and never in files; the panel keeps metadata only.
- **Reveal** and **Copy** ask before showing a value.
- **Find with AI** lets the connected agent search notes, approved artifacts and completed recordings and save exact credentials through the write-gated `save_secret` tool.
- Secrets are excluded from project exports, reports, findings and the MCP evidence index.

### Agent terminal

The optional coding-agent bridge. In **Agent & MCP** (the "Agent" button or **Configure** in the panel):

1. Enable the bridge.
2. Pick Codex CLI, Claude Code, Kimi Code or GLM CLI (the dialog says which are installed).
3. Choose the permissions: read only, "Allow updating notes and findings", "Allow executing commands inside the selected mission", and the client's own YOLO mode with its warning.

**Connect** writes the client's configuration under the mission's `agent-workspace/`, performs a real MCP handshake, and starts the client's TUI in the panel; the prompt box pastes text into it. Everything the agent reads is labelled untrusted evidence, and everything it runs shows up in the Console. Details: [AI assistant](/docs/guide/ai-assistant/).

## Managing a mission

Right-click a mission card in the left rail to open the mission menu.

{{% details title="Every item of the right-click menu" %}}
| Item | What it does |
|------|--------------|
| **Start / Stop container** | Lifecycle; starting loads the host audio module (unless disabled) and syncs serial nodes |
| **Enable / Disable host audio server** | Loads or unloads the host PulseAudio/PipeWire TCP module and remembers the choice for the mission (Linux, macOS) |
| **USB passthrough...** | The USB dialog: on macOS attach and detach host devices to the Lima VM; on Windows share (one UAC prompt per device), attach, detach and unshare through usbipd-win, with a view of what the VM or WSL 2 currently sees. Works for Nix missions on Windows too |
| **Install device rules...** | Nix: installs the udev rules the environment's packages ship, behind a polkit prompt (no prompt on Windows) |
| **Install tools...** | Search the curated RF Swift set or all pinned nixpkgs for a Nix environment, or the install functions found inside a container, and install with progress cards. "List this environment's tools" shows on-demand and installed tools and updates one of them |
| **Check for updates...** | Nix: `env update --check`, with "Update now" |
| **Update environment...** | Nix: refresh the flake (lazy) or refresh and rebuild with a kept generation (eager) |
| **Rebuild environment...** | Nix, eager: rebuild against the pinned lock |
| **Roll back environment...** | Nix, eager: pick a generation to restore |
| **Configure...** | Containers: the **Configure container** dialog. Nix: reopens the create dialog to change the flake reference or version ("Update environment") |
| **Export archive...** | A container filesystem (`.tar.gz`) or a Nix environment (`.rfenv`), optionally password-protected, with a mission companion holding notes, captures, findings, reports, recordings and audits (never secrets). Nix export is not available on Windows yet |
| **Delete container... / Remove Nix environment...** | Removes the target, keeps the Workbench mission data and the workspace |
| **Delete + clean Nix store...** | Removes the environment and runs a store garbage collection |
| **Delete mission completely...** | Removes the target and every Workbench-owned file of the mission, with a checkbox to delete the workspace directory too (ticked by default only for the automatic location; home directories, roots and symlinks are refused) |
{{% /details %}}

### Configure container

This is the GUI of [rfswift config](/docs/commands/config/).

1. Pick a setting: directory or file bind mount, device path as bind mount, mapped device, Linux capability, cgroup device rule, GPU, exposed port, published port, serial hot-plug.
2. Pick an action: add or replace, remove; enable or disable.
3. Check the container's **current values** for that setting, then click **Apply change**.

How the change is applied:

- On Linux Docker the change is applied in place after one polkit prompt (the Workbench re-runs itself as root for that step).
- Tick "Re-create the container instead of rewriting its Docker files" to commit and re-create without a prompt, which is always the way on Podman.
- A change that cannot work is refused before any prompt. Serial ports are attached on demand and reported as such.

## Security posture and audits

The **Tool environment security** card on the Config & network panel runs the same scanners as [rfswift audit](/docs/commands/audit/):

- for Nix: vulnix, syft, grype, osv-scanner and the integrity and provenance checks;
- for containers: trivy and configuration checks.

It shows the stage while it runs, keeps the raw report as ground truth under `environment-audits/`, and lists every record with severity, scope (runtime closure, build-time only, environment, container image), component, installed and fixed versions, scanner and raw evidence.

**Audit with AI** first runs the deterministic audit, then asks the connected agent to explain the report without inventing anything and without saving findings. The counters feed the "env" chip on the mission card and never count as mission findings.

## Reports and export

**Report** renders a branded report of the mission: summary table, findings by severity with their CVSS vectors, notes with images, registered captures.

- **Save in workspace** (`reports/report-<mission>.md`)
- **Download .md**
- **Download .html** (standalone, print-ready)
- **Export PDF** (opens the print dialog, choose "Save as PDF")

**pwndoc** exports the findings as pwndoc-compatible JSON (copy or download) and imports a pwndoc array, document or backup back into the mission. Secrets and environment audits are never part of a report.

## Engine doctor

The rail's **Engine doctor** is `rfswift doctor` with buttons:

- **One row per engine** (Docker, Podman, Lima) with its state and socket, and **Reclaim space...** (dangling or unused images, build cache, unused volumes and networks). For Lima: **Start VM** / **Stop VM**, **VM settings...** (CPUs, memory, disk, VM type) and **Reset VM...**.
- **Host fixes**, each privileged step asking through polkit:
  - **Docker access** with "Grant access" (docker group plus a socket ACL, effective at once);
  - **Host device rules (udev)** with "Install rules", "Update rules", "Fix groups" and "Remove";
  - **Stray device directories** cleanup;
  - the **Nix jail** with "Install bubblewrap" or "Enable sandbox";
  - **Host audio** with Enable and Disable (Linux; audio also on macOS).
- **The Nix block**: native, in WSL 2 (with "Set up Nix in WSL 2" and "Reset WSLg display" on Windows) or on the agent host, "Collect garbage", and the workspace root.

While connected to a remote agent the doctor describes the agent host: every engine with its state, the containers the agent can list on it and the reason it cannot use one, whether Nix is installed there, and "Reclaim space" and "Collect garbage" run there. Host fixes and the Lima VM stay local.

## Remote agents and connection security

The connection chip opens **Connection & security**:

- the current connection (agent, endpoint, encryption, pinned server certificate, authentication);
- a **connection security audit** (transport, authentication, server identity, certificate validity, network exposure, MCP posture);
- the **Agents** list ("This machine" and every agent of the session);
- **Saved remote agents** with Connect, Edit and Forget.

**Add agent** opens the provisioning card:

1. **Connect to an existing agent**: import a client credential file issued on the agent host (`rfswift agent certs client`), which fills the address, the pinned fingerprint and the secrets location, then **Connect**; or fill them by hand for credentials that already live on this machine. **Save** keeps a named profile (endpoint, fingerprint, credential folder; never a key).
2. **Create an agent certificate bundle** for an agent on this machine: name, DNS name or IP, parent folder, **Generate encrypted bundle**. Key passwords go straight to the OS vault; the dialog prints the `rfswift agent --bundle` command and the fingerprint.
3. **Credentials for another machine**: **Issue client file** (a Workbench elsewhere) or **Export server file** (an agent elsewhere), each protected by a transfer passphrase of 12 characters or more.
4. **Verify an existing agent** with explicit certificate paths and vault reference.

Once authenticated, the Workbench switches to the agent, fail-closed: missions, terminals, creation, configuration, audits, pulls, artifacts, engine doctor rows and USB passthrough come from the agent host, a heartbeat watches the connection, and **Disconnect** returns to the local machine explicitly. What stays local and the size limits are listed in [Remote agent](/docs/guide/remote-agent/#what-runs-where-once-connected).

## Where the data lives

```
~/.rfswift/workspaces/
  agent.json                       MCP bridge settings
  <project>/
    workspace.json
    capture-types.json
    missions/<mission>/
      mission.json                 title, notes, host audio choice, audit counters
      notes/note.md, notes/assets/ the notebook and its images
      captures/                    imported evidence and registered artifacts (+ .meta.json)
      findings.json
      secrets.json                 metadata only; values are in the OS vault
      reports/                     saved reports
      recordings/                  terminal recordings (.cast)
      environment-audits/          raw scanner reports
      agent-workspace/             coding-agent configuration and command events
```

The mission **workspace** (captures written by the tools) is the same `~/rfswift-workspace/<name>` the CLI uses; on a remote agent it stays on the agent host. Theme, panel layouts, the selected mission and the saved agent profiles are browser-local settings of the app, not part of project exports.

## Keyboard shortcuts and small things

- <kbd>Enter</kbd> confirms dialogs, <kbd>Esc</kbd> closes them. The Connection & security dialog closes only with its X or Escape, so a stray click cannot discard a half-filled form.
- <kbd>Cmd</kbd>+<kbd>Enter</kbd> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> sends the agent prompt.
- Toasts confirm every action; there are no OS notifications.
- The engine list, mission states and the agent heartbeat refresh on their own (4 to 5 seconds).
- Everything privileged on Linux goes through polkit; when no graphical prompt is available the dialog tells you which `rfswift` command does the same.

## Limits

The Workbench shares the engines' limits ([Known limits](/docs/guide/limitations/#workbench)) and adds a few of its own:

- one target per mission;
- Nix environments have no start/stop lifecycle;
- container and Nix import and export are local-only operations;
- Nix export is not available from a Windows host yet;
- remote tool listing and per-tool updates are not supported yet;
- the coding-agent bridge always runs on the Workbench machine.

## Next steps

{{< cards >}}
  {{< card link="/docs/guide/list-of-images/" title="Choose a toolbox" icon="stack" subtitle="Which image to pick for your mission" tag="Beginner" >}}
  {{< card link="/docs/guide/sharing-files/" title="Files & devices" icon="folder-open" subtitle="Your workspace folder and plugging in radios" tag="Beginner" >}}
  {{< card link="/docs/guide/ai-assistant/" title="AI assistant (MCP)" icon="sparkle" subtitle="Connect a coding agent to a mission" tag="Advanced" >}}
  {{< card link="/docs/guide/remote-agent/" title="Remote agent" icon="broadcast" subtitle="Run missions on a lab machine from your laptop" tag="Advanced" >}}
{{< /cards >}}
