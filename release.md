# RF Swift v2.0.0 "Harmonic" - Release Notes

## Overview

RF Swift v2.0.0 "Harmonic" is a major release that brings a completely restructured codebase, a new interactive terminal UI, desktop environment support, VPN integration, Podman support, and significant improvements across the board. This release represents a full rewrite of the CLI and container engine layer, with 66 files changed and ~17,000 lines of new code.

---

## Major Features

### Desktop Mode (VNC/noVNC)

RF Swift now supports running a full desktop environment inside containers, accessible via VNC or noVNC.

- `--desktop` flag to enable desktop mode on `run` and `exec`
- `--desktop-config proto:host:port` for custom configuration
- `--desktop-pass` for VNC password protection
- `--desktop-ssl` for encrypted VNC connections
- New `[desktop]` section in `config.ini` for persistent settings

### VPN Integration

Containers can now be launched with built-in VPN connectivity:

- **WireGuard**: `--vpn wireguard:./wg0.conf`
- **OpenVPN**: `--vpn openvpn:./client.ovpn`
- **Tailscale**: `--vpn tailscale[:auth-key]`
- **Netbird**: `--vpn netbird[:setup-key]`

Automatically injects required capabilities (`NET_RAW`) and devices (`/dev/net/tun`).

### Interactive TUI Wizard

A new terminal UI built with Charmbracelet provides guided container creation:

- Interactive wizard launches when `rfswift run` is called without `-i` and `-n`
- Container picker for `exec`, `stop`, `remove`, `commit`, `rename`, and other commands
- Image picker for `delete`, `retag`, `download`, and `export`
- File picker for `import`
- All interactive features gracefully degrade to standard CLI flags when scripting

### Container Engine Abstraction (Docker + Podman)

- New `ContainerEngine` interface supporting both Docker and Podman
- Auto-detection of available engine with `--engine auto|docker|podman` global flag
- Rootless Podman support for security-focused environments
- Podman socket activation and management

### Doctor Command

New `rfswift doctor` command for system diagnostics:

- Container engine detection and status
- Engine version and permissions
- RF Swift image availability
- X11 display and xhost configuration
- Audio system (PulseAudio/PipeWire) status
- USB device availability
- Configuration file validation
- Kernel module checks

### Realtime Mode

One-command SDR performance optimization:

- `rfswift realtime enable -c CONTAINER` configures SYS_NICE, rtprio, memlock, and nice
- `rfswift realtime disable -c CONTAINER` to revert
- `rfswift realtime status -c CONTAINER` to inspect
- Also available as `--realtime` flag on `run`

### Session Recording

Built-in terminal session recording in asciinema format:

- `--record` and `--record-output` flags on `run` and `exec`
- `rfswift log start/stop` for manual recording control
- `rfswift log replay -i FILE` for playback
- `rfswift log list` to browse recordings

---

## Codebase Restructuring

The entire Go codebase has been reorganized for maintainability:

- **cli/**: Split from monolithic `rfcli.go` into dedicated files per command group (`container.go`, `images.go`, `properties.go`, `cleanup.go`, `logging.go`, `transfer.go`, `ulimits.go`, `doctor.go`, `winusb.go`)
- **dock/**: Split from monolithic `rfdock.go` into focused modules (`container.go`, `images.go`, `properties.go`, `engine.go`, `vpn.go`, `doctor.go`, `logging.go`, `cleanup.go`, `transfer.go`, `ulimits.go`, `upgrade.go`, `recipe.go`, `helpers.go`, `types.go`, `setters.go`, `podman.go`)
- **tui/**: New package for terminal UI components (`wizard.go`, `confirm.go`, `progress.go`, `spinner.go`, `table.go`, `properties.go`, `doctor.go`, `styles.go`)
- **scripts/**: Reorganized into `scripts/` directory (`get_rfswift.sh`, `install.sh`, `install_dev.sh`, `build_project.sh`, `common.sh`)

---

## CLI Changes

### New Commands

| Command | Description |
|---------|-------------|
| `rfswift doctor` | System environment diagnostics |
| `rfswift realtime enable/disable/status` | Realtime SDR mode management |
| `rfswift images versions` | List available image versions |
| `rfswift log start/stop/replay/list` | Session recording management |
| `rfswift winusb list/attach/detach` | Windows/WSL2 USB management |

### Updated Commands

- **`cleanup`**: Now uses subcommands (`cleanup all`, `cleanup containers`, `cleanup images`) with `--older-than`, `--dry-run`, `--stopped`, `--dangling`, `--prune-children` options
- **`run`**: New flags `--desktop`, `--desktop-config`, `--desktop-pass`, `--desktop-ssl`, `--vpn`, `--realtime`, `--record`, `--record-output`, `--no-x11`, `--ulimits`
- **`exec`**: New flags `--record`, `--record-output`, `--vpn`, `--desktop`
- **`images local/remote`**: New `-v` (show versions) and `-f` (filter) flags

### New Global Flags

- `--engine docker|podman|auto` - Container engine selection
- `-q, --disconnect` - Disconnected/offline mode (existing, now better documented)

---

## RF Swift Images Updates

### New Images

| Image | Description |
|-------|-------------|
| `deeptempest` | Electromagnetic emanation analysis (Deep Tempest) |
| `sdr_full_intelgpu` | Full SDR with Intel GPU acceleration and gr-fosphor |
| `sdr_full_nvidiagpu` | Full SDR with NVIDIA GPU acceleration and gr-fosphor |
| `telecom_5G_train` | Extended 5G training image (builds on telecom_4G_5GNSA) |
| `telecom_5G_bladerf` | 5G SA with BladeRF device support |

### New Tools Added

- **Network**: John the Ripper, SecLists, SQLMap, SStiMap, Nerva, Airsnitch
- **WiFi**: hostapd-wpe, Airgeddon, Wiretapper, MACstealer
- **Hardware**: SLogic, Findus, RD6006
- **SDR**: HydraSDR 433 improvements, SAStudio updates
- **Core**: VPN tools (WireGuard, OpenVPN, Tailscale, Netbird), desktop/VNC packages

### Infrastructure

- Desktop mode support in `corebuild` (VNC/noVNC packages)
- VPN tools installed in base image
- Multi-architecture support: amd64, arm64, riscv64
- Multi-stage builds for `sdr_full` with registry-based caching
- Updated CI/CD workflows for all architectures

### Updated Image Hierarchy

```
corebuild
├── sdrsa_devices
│   ├── sdr_light
│   │   ├── sdr_full
│   │   ├── sdr_light_intelgpu → sdr_full_intelgpu
│   │   └── sdr_light_nvidiagpu → sdr_full_nvidiagpu
│   ├── bluetooth
│   ├── telecom_utils
│   │   ├── telecom_2Gto3G
│   │   ├── telecom_4G_5GNSA → telecom_5G_train
│   │   ├── telecom_4Gto5G
│   │   ├── telecom_5G
│   │   └── telecom_5G_bladerf
│   ├── hardware
│   ├── network → wifi
│   └── deeptempest
├── rfid
├── automotive
├── reversing
├── sdrsa_devices_antsdr
└── sdrsa_devices_rtlsdrv4
```

---

## Build & Dependencies

- **Go version**: 1.26.1
- **Docker SDK**: v28.5.2
- **New dependencies**: Charmbracelet (huh, lipgloss) for TUI, resty for HTTP
- **Static builds**: `CGO_ENABLED=0 -tags netgo` for portable binaries
- **Supported platforms**: Linux (amd64, arm64, riscv64), Windows (amd64, arm64), macOS (amd64, arm64)

---

## Documentation Updates

- Complete command reference for all new commands (doctor, realtime, winusb, images versions)
- Updated `cleanup` documentation to match new subcommand structure
- Fixed image hierarchy diagrams to match actual build dependencies
- Added `[desktop]` configuration section
- Updated CLI flags documentation with all new flags
- Added GPU variant images and `deeptempest` to image reference table
- Renamed `telecom_4Gto5G_extended` to `telecom_5G_train` in all references
- Updated version references from v0.6.5-rc4 to v2.0.0
- Updated compilation guide with Go 1.26.1 requirement and static build flags
- Fixed broken navigation links in development docs

---

## Breaking Changes

- CLI cleanup command now uses subcommands (`cleanup all/containers/images`) instead of top-level flags (`--all`, `--containers`, `--images`)
- Project directory restructured: scripts moved to `scripts/` directory
- Monolithic source files split into multiple modules (import paths unchanged)
- Image tag `telecom_4Gto5G_extended` renamed to `telecom_5G_train`

---

## Contributors

- Sebastien Dudek (@FlUxIuS) - PentHertz
