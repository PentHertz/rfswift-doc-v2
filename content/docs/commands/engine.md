---
title: engine
weight: 0
prev: /docs/commands
next: /docs/commands/run
---

# rfswift --engine

Select the container engine used by RF Swift.

## Synopsis

```bash
rfswift --engine ENGINE [command] [options]
```

The `--engine` flag is a **global flag** that overrides RF Swift's auto-detection and forces a specific container engine for the current command. It must be placed **before** any subcommand.

---

## Options

| Flag | Description | Values |
|------|-------------|--------|
| `--engine STRING` | Force a specific container engine | `docker`, `podman` |

---

## Auto-Detection Behavior

When `--engine` is **not specified**, RF Swift automatically detects the available container engine at startup using the following priority:

```
1. Is Podman installed?        → check podman binary + fallback paths
2. Is Docker installed?        → check docker binary
3. Is podman-docker shim active? → detect via `docker --version` containing "podman"
4. Is Docker daemon running?   → verify daemon connectivity
```

{{< tabs items="Both installed,Only Docker,Only Podman,Neither" >}}
  {{< tab >}}
When both Docker and Podman are installed, RF Swift defaults to whichever engine responds first. Use `--engine` to force a specific one:

```bash
# Force Docker
rfswift --engine docker run -i sdr_full -n my_container

# Force Podman
rfswift --engine podman run -i sdr_full -n my_container
```
  {{< /tab >}}
  {{< tab >}}
Docker is used automatically. No `--engine` flag needed.

```bash
rfswift run -i sdr_full -n my_container
# → uses Docker
```
  {{< /tab >}}
  {{< tab >}}
Podman is used automatically. No `--engine` flag needed.

```bash
rfswift run -i sdr_full -n my_container
# → uses Podman
```

{{< callout type="info" >}}
If `podman-docker` is installed, RF Swift detects it and treats the system as Podman-only, even though the `docker` command is available.
{{< /callout >}}
  {{< /tab >}}
  {{< tab >}}
RF Swift will display an error and prompt you to install a container engine:

```
❌ No container engine found. Please install Docker or Podman.
   Run ./install.sh or visit https://rfswift.io/docs/getting-started/
```
  {{< /tab >}}
{{< /tabs >}}

---

## Examples

### Force Docker

```bash
# Pull image with Docker
rfswift --engine docker images pull -i sdr_full

# Run container with Docker
rfswift --engine docker run -i sdr_full -n my_sdr

# List containers managed by Docker
rfswift --engine docker last
```

### Force Podman

```bash
# Pull image with Podman
rfswift --engine podman images pull -i sdr_full

# Run rootless container with Podman
rfswift --engine podman run -i sdr_full -n rootless_sdr

# List containers managed by Podman
rfswift --engine podman last
```

### Mixed Workflows

If both engines are installed, you can maintain separate environments:

```bash
# Docker for privileged hardware work
rfswift --engine docker run -i sdr_full -n docker_sdr \
  -u 1 \
  -s /dev/bus/usb:/dev/bus/usb

# Podman for rootless analysis
rfswift --engine podman run -i reversing -n podman_analysis \
  -u 0 \
  -t none \
  -b ~/samples:/root/samples:ro
```

{{< callout type="warning" >}}
Containers created with one engine are **not visible** to the other. A container created with `--engine docker` cannot be accessed with `--engine podman` and vice versa.
{{< /callout >}}

---

## Engine Comparison

| | Docker | Podman |
|---|---|---|
| **Architecture** | Client-server (daemon) | Daemonless (fork-exec) |
| **Root required** | Yes (daemon runs as root) | No (rootless by default) |
| **Socket** | `/var/run/docker.sock` | `$XDG_RUNTIME_DIR/podman/podman.sock` |
| **Image format** | OCI / Docker | OCI / Docker |
| **Compose** | `docker-compose` | `podman-compose` |
| **Privileged mode** | Full host access | User-namespace scoped |
| **Device passthrough** | Native | Supported (may need `--device` flags) |
| **Networking (rootless)** | N/A (daemon is root) | `slirp4netns` or `pasta` |
| **Best for** | Broad ecosystem, Windows/macOS | Security-focused, air-gapped, embedded |

---

## Podman-Specific Notes

### Rootless Configuration

Podman runs rootless by default. Ensure your system is configured:

```bash
# Check subordinate UID/GID ranges
grep $USER /etc/subuid /etc/subgid

# If empty, configure them
sudo usermod --add-subuids 100000-165535 $USER
sudo usermod --add-subgids 100000-165535 $USER

# Enable lingering (containers survive logout)
sudo loginctl enable-linger $USER

# Enable Podman socket (Docker API compatibility)
systemctl --user enable --now podman.socket
```

### Image Registry

Podman may prompt for a registry when using short image names:

```bash
# Full name (no prompt)
rfswift --engine podman images pull -i docker.io/penthertz/rfswift_noble:sdr_full

# Short name (may prompt for registry selection)
rfswift --engine podman images pull -i sdr_full
```

To avoid prompts, configure default registries in `/etc/containers/registries.conf`:

```toml
unqualified-search-registries = ["docker.io"]
```

### Privileged Mode Differences

In rootless Podman, `-u 1` (privileged) grants privileges **within the user namespace**, which is still more restricted than Docker's privileged mode:

```bash
# Docker privileged = full host root access
rfswift --engine docker run -i sdr_full -n docker_priv -u 1

# Podman privileged = root within user namespace (safer)
rfswift --engine podman run -i sdr_full -n podman_priv -u 1
```

### Cgroup Compatibility

RF Swift auto-detects cgroup v1 and v2 and configures device access rules accordingly. No manual configuration is needed.

---

## Docker-Specific Notes

### Daemon Requirement

Docker requires its daemon to be running:

```bash
# Check daemon status
sudo systemctl status docker

# Start if stopped
sudo systemctl start docker

# Enable at boot
sudo systemctl enable docker
```

### Group Membership

To run Docker without `sudo`:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## Troubleshooting

### Engine Not Found

**Error:** `No container engine found`

**Solution:**
```bash
# Install via RF Swift installer
curl -fsSL "https://get.rfswift.io/" | sh

# Or install manually
sudo apt install podman     # Debian/Ubuntu
sudo dnf install podman     # Fedora
curl -fsSL https://get.docker.com | sudo sh  # Docker
```

### Wrong Engine Detected

**Problem:** RF Swift picks Docker when you want Podman (or vice versa)

**Solution:**
```bash
# Explicit override
rfswift --engine podman run -i sdr_full -n my_container
```

### podman-docker Shim Detected as Docker

**Problem:** `podman-docker` package makes `docker` command available but it's actually Podman

**Solution:** RF Swift handles this automatically. It checks `docker --version` output for the word "podman" and correctly identifies the engine. No action needed.

### Containers Not Visible Across Engines

**Problem:** Created a container with Docker but can't see it with Podman

**Solution:** This is expected behavior. Each engine manages its own containers and images independently. Use the same `--engine` flag you used to create the container:

```bash
# If created with Docker
rfswift --engine docker exec -c my_container

# If created with Podman
rfswift --engine podman exec -c my_container
```

---

## Related

- [`run`](/docs/commands/run) - Create and run containers
- [`exec`](/docs/commands/exec) - Enter existing containers
- [`images`](/docs/commands/images) - Manage container images
- [Getting Started](/docs/getting-started) - Installation and engine setup
- [Container Engine Support](/docs/supports) - Requirements and platform support

---

{{< callout emoji="💡" >}}
**Tip**: If you always use the same engine, you don't need `--engine` at all — RF Swift auto-detects and uses whatever is available. The flag is only needed when both engines are installed and you want to force a specific one.
{{< /callout >}}