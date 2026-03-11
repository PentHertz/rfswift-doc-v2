---
title: VPN Inside Containers
weight: 6
prev: /docs/guide/sharing-files
next: /docs/guide/list-of-images
---

# VPN Inside Containers

Connect your RF Swift containers to VPN networks for remote access, mesh networking, and secure tunneling.

## Overview

RF Swift supports launching VPN clients **inside containers** at startup, allowing your containerized tools to reach remote networks, Tailscale/Netbird mesh peers, or corporate VPNs — all without modifying your host network.

### Supported VPN Providers

| Provider | Type | Config required | Interactive login | Privileged required |
|----------|------|-----------------|-------------------|---------------------|
| **WireGuard** | Tunnel | Config file | No | Yes |
| **OpenVPN** | Tunnel | Config file | No | Yes |
| **Tailscale** | Mesh | Optional auth key | Yes (login URL) | No (userspace mode) |
| **Netbird** | Mesh | Optional setup key | Yes (login URL) | No (netstack mode) |

---

## Quick Start

### Tailscale (interactive login)

```bash
rfswift run -i sdr_full -n my_sdr --vpn tailscale
```

RF Swift will:
1. Start the Tailscale daemon inside the container
2. Print a login URL — open it in your browser to authenticate
3. Once authenticated, drop you into the shell with Tailscale connected

### WireGuard (config file)

```bash
rfswift run -i sdr_full -n my_sdr \
  --vpn wireguard:./wg0.conf \
  -u 1
```

### OpenVPN (config file)

```bash
rfswift run -i sdr_full -n my_sdr \
  --vpn openvpn:./client.ovpn \
  -u 1
```

### Netbird (interactive login)

```bash
rfswift run -i sdr_full -n my_sdr --vpn netbird
```

---

## The `--vpn` Flag

### Syntax

```bash
--vpn TYPE[:ARGUMENT]
```

| Type | Argument | Example |
|------|----------|---------|
| `wireguard` | Path to `.conf` file (required) | `--vpn wireguard:./wg0.conf` |
| `openvpn` | Path to `.ovpn` file (required) | `--vpn openvpn:./client.ovpn` |
| `tailscale` | Auth key (optional) | `--vpn tailscale` or `--vpn tailscale:tskey-auth-xxx` |
| `netbird` | Setup key (optional) | `--vpn netbird` or `--vpn netbird:nb-setup-xxx` |

The `--vpn` flag is available on both `run` and `exec` commands:

```bash
# Start VPN when creating a new container
rfswift run -i sdr_full -n my_sdr --vpn tailscale

# Start VPN when entering an existing container
rfswift exec -c my_sdr --vpn tailscale
```

---

## Privileged vs Non-Privileged Mode

VPN behavior depends on whether the container runs in privileged mode:

### Privileged Mode (`-u 1`)

Full kernel-level networking:
- Real TUN/TAP interface visible in `ip addr`
- Ping works
- Incoming connections from VPN peers work
- All VPN types supported

```bash
rfswift run -i sdr_full -n my_sdr -u 1 --vpn tailscale
```

```
# Inside container
$ ip addr show tailscale0
4: tailscale0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP>
    inet 100.81.110.127/32 scope global tailscale0

$ ping 100.68.119.76
PING 100.68.119.76: 64 bytes from 100.68.119.76: icmp_seq=0 ttl=64 time=12.3 ms
```

### Non-Privileged Mode (default)

Userspace networking (Tailscale and Netbird only):
- No kernel interface (not visible in `ip addr`)
- TCP/UDP works via SOCKS5/HTTP proxy
- Ping (ICMP) does not work
- WireGuard and OpenVPN are **not supported** — a warning is displayed

{{< tabs items="Tailscale,Netbird" >}}
  {{< tab >}}
```bash
rfswift run -i sdr_full -n my_sdr --vpn tailscale
```

Tailscale runs in userspace mode with:
- **SOCKS5 proxy** on `localhost:1055`
- **HTTP proxy** on `localhost:1080`

```bash
# Check status
tailscale status

# Access peers via SOCKS5
curl --socks5 localhost:1055 http://100.68.119.76:8080

# Or set environment proxy
export ALL_PROXY=socks5://localhost:1055
export http_proxy=http://localhost:1080

# SSH through Tailscale
ssh -o ProxyCommand="nc -x localhost:1055 %h %p" user@100.68.119.76
```
  {{< /tab >}}
  {{< tab >}}
```bash
rfswift run -i sdr_full -n my_sdr --vpn netbird
```

Netbird runs in netstack mode with:
- **SOCKS5 proxy** on `localhost:1080`

```bash
# Check status
netbird status

# Access peers via SOCKS5
curl --socks5 localhost:1080 http://peer-ip:8080

# Set environment proxy
export ALL_PROXY=socks5://localhost:1080
```
  {{< /tab >}}
{{< /tabs >}}

{{< callout type="warning" >}}
**WireGuard and OpenVPN require privileged mode.** They create kernel-level TUN interfaces and manipulate iptables, which is not possible in unprivileged Docker containers. Use `-u 1` when running with these VPN types.
{{< /callout >}}

---

## Detailed Provider Setup

### WireGuard

**Prerequisites:**
- WireGuard config file (`.conf`)
- Privileged mode (`-u 1`)

```bash
# Basic usage
rfswift run -i sdr_full -n wg_container \
  -u 1 \
  --vpn wireguard:./wg0.conf

# With bridge network
rfswift run -i sdr_full -n wg_container \
  -u 1 \
  -t bridge \
  --vpn wireguard:/path/to/wg0.conf
```

RF Swift automatically:
- Mounts the config file to `/etc/wireguard/wg0.conf` inside the container
- Adds `NET_RAW` capability and `/dev/net/tun` device
- Runs `wg-quick up wg0` after container start

```bash
# Verify inside container
wg show
ip addr show wg0
```

### OpenVPN

**Prerequisites:**
- OpenVPN config file (`.ovpn`)
- Privileged mode (`-u 1`)

```bash
rfswift run -i sdr_full -n ovpn_container \
  -u 1 \
  --vpn openvpn:./client.ovpn
```

RF Swift automatically:
- Mounts the config file to `/etc/openvpn/client.ovpn`
- Adds `NET_RAW` capability and `/dev/net/tun` device
- Runs `openvpn --config /etc/openvpn/client.ovpn --daemon`

```bash
# Verify inside container
ip addr show tun0
```

### Tailscale

**Interactive login (no pre-generated key):**

```bash
rfswift run -i sdr_full -n ts_container --vpn tailscale
```

A login URL will be printed — open it in your browser to authenticate. Once approved, the shell session starts.

**Headless with auth key:**

```bash
rfswift run -i sdr_full -n ts_container \
  --vpn tailscale:tskey-auth-xxxxxxxxxxxx
```

Generate auth keys at [https://login.tailscale.com/admin/settings/keys](https://login.tailscale.com/admin/settings/keys).

```bash
# Verify inside container
tailscale status
tailscale ip
```

### Netbird

**Interactive login:**

```bash
rfswift run -i sdr_full -n nb_container --vpn netbird
```

A login URL will be printed. Authenticate in your browser.

**Headless with setup key:**

```bash
rfswift run -i sdr_full -n nb_container \
  --vpn netbird:nb-setup-xxxxxxxxxxxx
```

Generate setup keys in the Netbird dashboard.

```bash
# Verify inside container
netbird status
```

---

## VPN with `exec`

You can start a VPN when entering an **existing** container:

```bash
# Enter container with Tailscale
rfswift exec -c my_sdr --vpn tailscale

# Enter container with WireGuard (container must have been created with -u 1)
rfswift exec -c my_sdr --vpn wireguard:./wg0.conf
```

{{< callout type="info" >}}
When using `--vpn` with `exec`, the VPN starts inside the already-running container via `docker exec`. For WireGuard/OpenVPN, the container must have been created with the necessary capabilities and devices (e.g., via `--vpn` or `-u 1` during `run`).
{{< /callout >}}

---

## VPN in the Interactive Wizard

When running `rfswift run` without flags, the interactive wizard includes a VPN option in the feature toggles:

1. Select **VPN** in the feature multi-select
2. Choose a VPN type (WireGuard, OpenVPN, Tailscale, Netbird)
3. Enter the config file path or auth key (leave empty for interactive login)

The wizard generates the equivalent CLI command for reproducibility.

---

## Real-World Scenarios

### Remote SDR Access via Tailscale

Access an SDR dongle on a remote machine through Tailscale:

```bash
# On the remote machine (has SDR dongle)
rfswift run -i sdr_full -n remote_sdr \
  -u 1 \
  --vpn tailscale \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  --desktop --desktop-config "http:0.0.0.0:6080"
```

Then from any Tailscale peer, open `http://100.x.x.x:6080` to access the SDR desktop.

### Corporate VPN for Signal Intelligence

Connect to a corporate network to reach internal spectrum analyzers:

```bash
rfswift run -i sdr_full -n corp_assessment \
  -u 1 \
  --vpn openvpn:./corp-vpn.ovpn \
  -t bridge \
  --record
```

### Mesh Network Lab

Connect multiple containers across different machines via Tailscale:

```bash
# Machine A: SDR capture
rfswift run -i sdr_full -n capture_node \
  --vpn tailscale:tskey-auth-xxx \
  -s /dev/bus/usb:/dev/bus/usb

# Machine B: Analysis
rfswift run -i sdr_full -n analysis_node \
  --vpn tailscale:tskey-auth-yyy
```

Both containers can communicate over the Tailscale mesh.

---

## Troubleshooting

### VPN Tool Not Found

**Error:** `failed to start Tailscale daemon: executable file not found in $PATH`

**Solution:** The container image doesn't have the VPN tools installed. Rebuild the image with VPN support:

```bash
# VPN tools are included in corebuild images built after v2.0.0
# For older images, install manually inside the container:
rfswift exec -c my_container
apt update && curl -fsSL https://tailscale.com/install.sh | sh
```

### WireGuard/OpenVPN Fails in Non-Privileged Mode

**Error/Warning:** `wireguard requires privileged mode for kernel TUN/iptables access`

**Solution:** Use privileged mode:
```bash
rfswift run -i sdr_full -n my_sdr -u 1 --vpn wireguard:./wg0.conf
```

### Tailscale Daemon Not Ready

**Error:** `tailscaled did not become ready after 15 seconds`

**Solution:** Check the daemon log inside the container:
```bash
rfswift exec -c my_container
cat /tmp/tailscaled.log
```

### Can't Ping Tailscale/Netbird Peers (Non-Privileged)

**Expected behavior.** In non-privileged mode, only TCP/UDP works via the proxy. Use:
```bash
# Instead of: ping 100.x.x.x
curl --socks5 localhost:1055 http://100.x.x.x:port
```

For full ICMP support, use privileged mode (`-u 1`).

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers with `--vpn` flag
- [`exec`](/docs/commands/exec) - Enter containers with `--vpn` flag
- [`engine`](/docs/commands/engine) - Container engine selection

---

{{< callout emoji="🔒" >}}
**Security Tip**: Prefer Tailscale or Netbird for mesh networking — they work without privileged mode and don't require exposing ports. Use WireGuard/OpenVPN for site-to-site tunnels where privileged mode is acceptable.
{{< /callout >}}

{{< callout type="info" >}}
**Container Images**: VPN tools (WireGuard, OpenVPN, Tailscale, Netbird) are pre-installed in all RF Swift `corebuild` images from v2.0.0 onwards.
{{< /callout >}}
