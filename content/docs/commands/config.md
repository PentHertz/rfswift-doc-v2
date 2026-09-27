---
title: "rfswift config"
linkTitle: "config"
navGroup: "Runtime configuration"
level: reference
description: "Change the devices, mounts, capabilities, cgroups, GPUs, ports and ulimits of an existing container."
weight: 40
---

Change the runtime configuration of an **existing** container: devices and bind mounts, Linux capabilities, cgroup device rules, GPU requests, exposed and published ports, ulimits, and the serial hot-plug. Alias: `rfswift cfg`. Each group is also available at the top level (`rfswift ports bind ...`), and neither form is deprecated.

## Synopsis

```bash
rfswift config bindings      add|rm   -c NAME [-d] -t TARGET [-s SOURCE]
rfswift config capabilities  add|rm   -c NAME -p CAP
rfswift config cgroups       add|rm   -c NAME -r "c 189:* rwm"
rfswift config gpus          add|rm   -c NAME [-g all|0,1]
rfswift config ports         bind|unbind|expose|unexpose -c NAME (-b BINDING | -p PORT)
rfswift config ulimits       add|rm|list -c NAME [-n NAME -v VALUE]
rfswift config serial-hotplug on|off -c NAME
```

`-c` accepts a container name or ID, full or abbreviated. Every group accepts `--recreate`.

---

## How a change is applied

{{< tabs items="Docker (Linux),Podman,Lima / macOS,Remote agent" >}}
  {{< tab >}}
Docker keeps a container's configuration in files under `/var/lib/docker` that only root can edit. RF Swift rewrites them in place and restarts the Docker service: no copy of the container, no extra disk. It asks for the missing root itself, with **one `sudo` prompt**, then re-runs as root. The edited container comes back running, and the other containers the service restart stopped are started again.

A change that cannot work is refused **before** the password prompt, not after.
  {{< /tab >}}
  {{< tab >}}
Podman has no editable store, so the change is applied by **committing** the container to a snapshot image and re-creating it with the new setting. No root is needed; one snapshot image is left per change. Rootless Podman allows neither cgroup device rules nor `mknod`, so cgroup rules are dropped with a warning and serial ports must be present at creation.
  {{< /tab >}}
  {{< tab >}}
Docker inside the Lima VM edits through the VM's own sudo, without a prompt.
  {{< /tab >}}
  {{< tab >}}
When the Workbench is connected to an agent, the same change runs on the agent host through the `targets.configure` method. Docker on that host asks nothing: the agent's user must already be able to edit the daemon's files or the commit-and-recreate path is used.
  {{< /tab >}}
{{< /tabs >}}

| Flag | Description |
|------|-------------|
| `--recreate` | Commit the container and re-create it with the new setting instead of editing its files. No root needed, leaves a snapshot image per change. This is always the way on Podman |

{{< callout type="warning" >}}
Either path **restarts the container**. Processes running inside are interrupted. Save your work before changing a configuration.
{{< /callout >}}

---

## Groups

| Group | Purpose | Page |
|-------|---------|------|
| `bindings` | Add or remove a bind mount (`-b`/`-s`+`-t`) or a device mapping (`-d`). A device node given as a bind mount is bind-mounted with the cgroup rule its major needs; a `/dev` tree such as `/dev/bus/usb` gets the rule that makes its nodes usable; a serial port added with `-d` is attached on demand and hot-pluggable | [bindings](/docs/commands/bindings) |
| `capabilities` | Add or remove Linux capabilities. Names are compared and shown in short form (`NET_ADMIN`), so removing one works and adding twice does not duplicate | [capabilities](/docs/commands/capabilities) |
| `cgroups` | Device cgroup rules (`c 189:* rwm`) | [cgroups](/docs/commands/cgroups) |
| `gpus` | GPU device requests (`all`, `0,1`). The request survives a re-creation | [gpus](/docs/commands/gpu) |
| `ports` | Expose a port to other containers, or bind (publish) it to the host, and undo both | [ports](/docs/commands/ports) |
| `ulimits` | Resource limits (`rtprio`, `memlock`, `nice`, `nofile`, ...) | [ulimits](/docs/commands/ulimits) |
| `serial-hotplug` | Switch the serial hot-plug on or off for a container (below) | this page |

---

## config serial-hotplug

```bash
rfswift config serial-hotplug on  -c NAME
rfswift config serial-hotplug off -c NAME
```

With the hot-plug **on** (the default as soon as a mission names a serial port), the container may open serial ports (`/dev/ttyACM*`, `/dev/ttyUSB*`, `/dev/ttyAMA*`) through its device cgroup, and RF Swift creates their nodes inside the container when it starts and whenever a terminal or command opens in it, removing nodes whose device is gone. A port that is unplugged at creation is recorded and attached on demand instead of failing the start: plug it in, open a shell, and the port is there.

**Off** removes those cgroup rules and leaves the container's `/dev` alone; ports must then be mapped or bind-mounted explicitly.

Supported on Docker and rootful Podman. Rootless Podman keeps the mapping and needs the port present at creation; Lima on macOS and Windows hosts forward USB into a VM first (see [usb](/docs/commands/usb)).

{{< callout type="info" >}}
Earlier versions could leave an empty, root-owned directory where a device node belongs (`/dev/ttyACM0` bind-mounted while the reader was unplugged). `rfswift host devclean` lists and removes those.
{{< /callout >}}

---

## Examples

```bash
# Hot-plug a Proxmark3 into a running RFID container
rfswift config bindings add -c rfid -d -t /dev/ttyACM0

# Give a Wi-Fi container the capabilities its tools need, then take them back
rfswift config capabilities add -c wifi -p NET_ADMIN
rfswift config capabilities add -c wifi -p NET_RAW
rfswift config capabilities rm  -c wifi -p NET_RAW

# Publish a web UI on localhost only
rfswift config ports bind -c web -b 127.0.0.1:8080:80/tcp

# GPU for an OpenCL image, on Podman (commit + recreate)
rfswift --engine podman config gpus add -c gpu_work -g all --recreate

# Realtime limits by hand (or: rfswift realtime enable -c sdr)
rfswift config ulimits add -c sdr -n rtprio -v 95
rfswift config ulimits add -c sdr -n memlock -v -1
rfswift config ulimits list -c sdr
```

## Related

- [Dynamic container management](/docs/guide/container-management)
- [realtime](/docs/commands/realtime)
- [host devclean](/docs/commands/host)
