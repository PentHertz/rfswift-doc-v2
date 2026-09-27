---
title: "VPN inside containers"
level: advanced
description: "Connect a lab to WireGuard, OpenVPN, Tailscale or Netbird from inside the container, without touching your host network."
weight: 6
---

RF Swift can start a VPN client **inside a container** when it starts. Your tools can then reach remote networks, Tailscale or Netbird mesh peers, or a corporate VPN, while your host network stays exactly as it is.

**In short**

- Add `--vpn TYPE[:ARGUMENT]` to `rfswift container create` (or to `rfswift container shell` for an existing lab).
- **Tailscale** and **Netbird** work without privileged mode, through a local proxy.
- **WireGuard** and **OpenVPN** need privileged mode (`-u 1`).

```bash
rfswift container create -i sdr_full -n my_sdr --vpn tailscale
```

{{< callout type="info" >}}
The examples use the v4 commands `rfswift container create` and `rfswift container shell`. The older spellings `rfswift run` and `rfswift exec` still work with the same flags.
{{< /callout >}}

## Supported VPN providers

| Provider | Type | Config required | Interactive login | Privileged required |
|----------|------|-----------------|-------------------|---------------------|
| **WireGuard** | Tunnel | Config file | No | Yes |
| **OpenVPN** | Tunnel | Config file | No | Yes |
| **Tailscale** | Mesh | Optional auth key | Yes (login URL) | No (userspace mode) |
| **Netbird** | Mesh | Optional setup key | Yes (login URL) | No (netstack mode) |

## Quick start

{{< tabs items="Tailscale,Netbird,WireGuard,OpenVPN" >}}
  {{< tab >}}
```bash
rfswift container create -i sdr_full -n my_sdr --vpn tailscale
```

RF Swift then:

1. starts the Tailscale daemon inside the container;
2. prints a login URL that you open in your browser to authenticate;
3. once you're authenticated, drops you into the shell with Tailscale connected.
  {{< /tab >}}
  {{< tab >}}
```bash
rfswift container create -i sdr_full -n my_sdr --vpn netbird
```

A login URL is printed: open it in your browser to authenticate.
  {{< /tab >}}
  {{< tab >}}
```bash
rfswift container create -i sdr_full -n my_sdr \
  --vpn wireguard:./wg0.conf \
  -u 1
```
  {{< /tab >}}
  {{< tab >}}
```bash
rfswift container create -i sdr_full -n my_sdr \
  --vpn openvpn:./client.ovpn \
  -u 1
```
  {{< /tab >}}
{{< /tabs >}}

## The `--vpn` flag

```bash
--vpn TYPE[:ARGUMENT]
```

| Type | Argument | Example |
|------|----------|---------|
| `wireguard` | Path to `.conf` file (required) | `--vpn wireguard:./wg0.conf` |
| `openvpn` | Path to `.ovpn` file (required) | `--vpn openvpn:./client.ovpn` |
| `tailscale` | Auth key (optional) | `--vpn tailscale` or `--vpn tailscale:tskey-auth-xxx` |
| `netbird` | Setup key (optional) | `--vpn netbird` or `--vpn netbird:nb-setup-xxx` |

The flag works when you create a lab and when you enter an existing one:

```bash
# Start the VPN when creating a new container
rfswift container create -i sdr_full -n my_sdr --vpn tailscale

# Start the VPN when entering an existing container
rfswift container shell -c my_sdr --vpn tailscale
```

## Privileged vs non-privileged mode

What the VPN can do depends on whether the container runs in privileged mode.

| | Privileged (`-u 1`) | Non-privileged (default) |
|---|---|---|
| **VPN types** | All four | Tailscale and Netbird only |
| **Network interface** | Real TUN/TAP interface, visible in `ip addr` | None (not visible in `ip addr`) |
| **TCP/UDP** | Direct | Through a SOCKS5/HTTP proxy |
| **Ping (ICMP)** | Works | Does not work |

### Privileged mode (`-u 1`)

Full kernel-level networking: a real interface, ping, and incoming connections from VPN peers all work.

```bash
rfswift container create -i sdr_full -n my_sdr -u 1 --vpn tailscale
```

```
# Inside container
$ ip addr show tailscale0
4: tailscale0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP>
    inet 100.81.110.127/32 scope global tailscale0

$ ping 100.68.119.76
PING 100.68.119.76: 64 bytes from 100.68.119.76: icmp_seq=0 ttl=64 time=12.3 ms
```

### Non-privileged mode (default)

Userspace networking, for Tailscale and Netbird only. WireGuard and OpenVPN are **not supported** here, and RF Swift shows a warning.

{{< tabs items="Tailscale,Netbird" >}}
  {{< tab >}}
```bash
rfswift container create -i sdr_full -n my_sdr --vpn tailscale
```

Tailscale runs in userspace mode with:

- a **SOCKS5 proxy** on `localhost:1055`;
- an **HTTP proxy** on `localhost:1080`.

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
rfswift container create -i sdr_full -n my_sdr --vpn netbird
```

Netbird runs in netstack mode with a **SOCKS5 proxy** on `localhost:1080`.

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

{{< callout type="warning" title="WireGuard and OpenVPN require privileged mode" >}}
They create kernel-level TUN interfaces and manipulate iptables, which is not possible in unprivileged Docker containers. Use `-u 1` with these VPN types.
{{< /callout >}}

## Provider setup in detail

### WireGuard

**You need** a WireGuard config file (`.conf`) and privileged mode (`-u 1`).

```bash
# Basic usage
rfswift container create -i sdr_full -n wg_container \
  -u 1 \
  --vpn wireguard:./wg0.conf

# With bridge network
rfswift container create -i sdr_full -n wg_container \
  -u 1 \
  -t bridge \
  --vpn wireguard:/path/to/wg0.conf
```

RF Swift automatically:

- mounts the config file to `/etc/wireguard/wg0.conf` inside the container;
- adds the `NET_RAW` capability and the `/dev/net/tun` device;
- runs `wg-quick up wg0` after the container starts.

```bash
# Verify inside container
wg show
ip addr show wg0
```

### OpenVPN

**You need** an OpenVPN config file (`.ovpn`) and privileged mode (`-u 1`).

```bash
rfswift container create -i sdr_full -n ovpn_container \
  -u 1 \
  --vpn openvpn:./client.ovpn
```

RF Swift automatically:

- mounts the config file to `/etc/openvpn/client.ovpn`;
- adds the `NET_RAW` capability and the `/dev/net/tun` device;
- runs `openvpn --config /etc/openvpn/client.ovpn --daemon`.

```bash
# Verify inside container
ip addr show tun0
```

### Tailscale

**Interactive login** (no pre-generated key): a login URL is printed. Open it in your browser to authenticate; once approved, the shell session starts.

```bash
rfswift container create -i sdr_full -n ts_container --vpn tailscale
```

**Headless, with an auth key**:

```bash
rfswift container create -i sdr_full -n ts_container \
  --vpn tailscale:tskey-auth-xxxxxxxxxxxx
```

Generate auth keys at [https://login.tailscale.com/admin/settings/keys](https://login.tailscale.com/admin/settings/keys).

```bash
# Verify inside container
tailscale status
tailscale ip
```

### Netbird

**Interactive login**: a login URL is printed. Authenticate in your browser.

```bash
rfswift container create -i sdr_full -n nb_container --vpn netbird
```

**Headless, with a setup key** (generate it in the Netbird dashboard):

```bash
rfswift container create -i sdr_full -n nb_container \
  --vpn netbird:nb-setup-xxxxxxxxxxxx
```

```bash
# Verify inside container
netbird status
```

## Starting a VPN in an existing container

You can start a VPN when entering a container that already exists:

```bash
# Enter container with Tailscale
rfswift container shell -c my_sdr --vpn tailscale

# Enter container with WireGuard (container must have been created with -u 1)
rfswift container shell -c my_sdr --vpn wireguard:./wg0.conf
```

{{< callout type="info" >}}
With `container shell`, the VPN starts inside the already-running container via `docker exec`. For WireGuard and OpenVPN, the container must have been created with the necessary capabilities and devices (for example via `--vpn` or `-u 1` at creation).
{{< /callout >}}

## VPN in the interactive wizard

When you run `rfswift container create` without flags, the interactive wizard includes a VPN option in the feature toggles:

1. Select **VPN** in the feature multi-select.
2. Choose a VPN type (WireGuard, OpenVPN, Tailscale, Netbird).
3. Enter the config file path or auth key (leave it empty for interactive login).

The wizard prints the equivalent CLI command, so you can reproduce the setup later.

## Real-world scenarios

### Remote SDR access via Tailscale

Reach an SDR dongle on a remote machine through Tailscale:

```bash
# On the remote machine (has SDR dongle)
rfswift container create -i sdr_full -n remote_sdr \
  -u 1 \
  --vpn tailscale \
  -s /dev/bus/usb:/dev/bus/usb \
  -g "c 189:* rwm" \
  --desktop --desktop-config "http:0.0.0.0:6080"
```

Then, from any Tailscale peer, open `http://100.x.x.x:6080` to reach the SDR desktop.

### Corporate VPN for signal intelligence

Connect to a corporate network to reach internal spectrum analyzers:

```bash
rfswift container create -i sdr_full -n corp_assessment \
  -u 1 \
  --vpn openvpn:./corp-vpn.ovpn \
  -t bridge \
  --record
```

### Mesh network lab

Connect containers on different machines through Tailscale:

```bash
# Machine A: SDR capture
rfswift container create -i sdr_full -n capture_node \
  --vpn tailscale:tskey-auth-xxx \
  -s /dev/bus/usb:/dev/bus/usb

# Machine B: Analysis
rfswift container create -i sdr_full -n analysis_node \
  --vpn tailscale:tskey-auth-yyy
```

Both containers can then talk to each other over the Tailscale mesh.

## Troubleshooting

### VPN tool not found

**Error:** `failed to start Tailscale daemon: executable file not found in $PATH`

**Fix:** the container image doesn't have the VPN tools installed. VPN tools are included in `corebuild` images built after v2.0.0. For older images, install them manually inside the container:

```bash
rfswift container shell -c my_container
apt update && curl -fsSL https://tailscale.com/install.sh | sh
```

### WireGuard or OpenVPN fails in non-privileged mode

**Warning:** `wireguard requires privileged mode for kernel TUN/iptables access`

**Fix:** use privileged mode:

```bash
rfswift container create -i sdr_full -n my_sdr -u 1 --vpn wireguard:./wg0.conf
```

### Tailscale daemon not ready

**Error:** `tailscaled did not become ready after 15 seconds`

**Fix:** check the daemon log inside the container:

```bash
rfswift container shell -c my_container
cat /tmp/tailscaled.log
```

### Can't ping Tailscale or Netbird peers (non-privileged)

**This is expected.** In non-privileged mode only TCP/UDP works, through the proxy:

```bash
# Instead of: ping 100.x.x.x
curl --socks5 localhost:1055 http://100.x.x.x:port
```

For full ICMP support, use privileged mode (`-u 1`).

## Good to know

{{< callout type="tip" title="Security tip" >}}
Prefer Tailscale or Netbird for mesh networking: they work without privileged mode and don't require exposing ports. Use WireGuard or OpenVPN for site-to-site tunnels where privileged mode is acceptable.
{{< /callout >}}

{{< callout type="info" title="Container images" >}}
VPN tools (WireGuard, OpenVPN, Tailscale, Netbird) are pre-installed in all RF Swift `corebuild` images from v2.0.0 onwards.
{{< /callout >}}

## Related commands

- [`container create`](/docs/commands/run/): create containers with the `--vpn` flag
- [`container shell`](/docs/commands/exec/): enter containers with the `--vpn` flag
- [`engine`](/docs/commands/engine/): container engine selection
