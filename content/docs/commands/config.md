---
title: "rfswift config"
linkTitle: "config"
navGroup: "Runtime configuration"
level: reference
description: "Change the devices, mounts, capabilities, cgroups, GPUs, ports and ulimits of an existing container."
weight: 40
---

`rfswift config` changes a container you already created, without starting over. Use it to add a device or a folder, grant or remove a Linux capability, change device rules, request a GPU, open ports, set resource limits, or switch serial hot-plug on or off.

The most common use adds a device, such as a Proxmark3 on `/dev/ttyACM0`:

```bash
rfswift config bindings add -c rfid -d -t /dev/ttyACM0
```

The short alias is `rfswift cfg`. Every group also works at the top level (for example `rfswift ports bind ...`); both forms are supported and neither is deprecated.

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

## How a change is applied

How RF Swift applies the change depends on your engine:

{{< tabs items="Docker (Linux),Podman,Lima / macOS,Remote agent" >}}
  {{< tab >}}
Docker keeps each container's configuration in files under `/var/lib/docker` that only root can edit. RF Swift edits those files in place and restarts the Docker service. The container is not copied, so no extra disk space is used.

RF Swift asks for root itself, with **one `sudo` prompt**, and then runs the change as root. The edited container comes back running, and any other containers stopped by the service restart are started again.

If a change cannot work, RF Swift refuses it **before** asking for your password.
  {{< /tab >}}
  {{< tab >}}
Podman has no configuration files to edit. RF Swift **commits** the container to a snapshot image and creates it again with the new setting. No root is needed, and each change leaves one snapshot image behind.

Rootless Podman allows neither cgroup device rules nor `mknod`. Cgroup rules are therefore dropped with a warning, and serial ports must be plugged in when the container is created.
  {{< /tab >}}
  {{< tab >}}
With Docker inside the Lima VM, RF Swift edits through the VM's own `sudo`, without asking you for a password.
  {{< /tab >}}
  {{< tab >}}
When the Workbench is connected to a remote agent, the same change runs on the agent's machine (through the `targets.configure` method). Docker on that machine asks nothing: either the agent's user can already edit Docker's files, or RF Swift uses the commit-and-recreate method.
  {{< /tab >}}
{{< /tabs >}}

| Flag | What it does |
|------|--------------|
| `--recreate` | Commit the container and create it again with the new setting, instead of editing its files. No root needed; each change leaves a snapshot image. This is always the method on Podman |

{{< callout type="warning" title="The container restarts" >}}
Both methods restart the container, which stops any process running inside it. Save your work before changing the configuration.
{{< /callout >}}

## Groups

| Group | What it changes | Page |
|-------|-----------------|------|
| `bindings` | Adds or removes a folder (`-b`, or `-s` with `-t`) or a device (`-d`). See the notes below the table | [bindings](/docs/commands/bindings) |
| `capabilities` | Adds or removes Linux capabilities. Names are shown in short form (`NET_ADMIN`); removing works, and adding the same one twice does not duplicate it | [capabilities](/docs/commands/capabilities) |
| `cgroups` | Device cgroup rules such as `c 189:* rwm` | [cgroups](/docs/commands/cgroups) |
| `gpus` | GPU requests (`all`, `0,1`). The request is kept when the container is created again | [gpus](/docs/commands/gpu) |
| `ports` | Exposes a port to other containers, or publishes it to the host, and undoes both | [ports](/docs/commands/ports) |
| `ulimits` | Resource limits (`rtprio`, `memlock`, `nice`, `nofile`, ...) | [ulimits](/docs/commands/ulimits) |
| `serial-hotplug` | Switches serial hot-plug on or off (see below) | this page |

What `bindings` does with devices:

- A device node given as a bind mount is mounted with the cgroup rule its device type needs.
- A `/dev` tree such as `/dev/bus/usb` gets the rule that makes its devices usable.
- A serial port added with `-d` is attached when needed, and can be plugged in later (hot-plug).

## config serial-hotplug

```bash
rfswift config serial-hotplug on  -c NAME
rfswift config serial-hotplug off -c NAME
```

**On** is the default as soon as a container names a serial port. The container may then open serial ports (`/dev/ttyACM*`, `/dev/ttyUSB*`, `/dev/ttyAMA*`). RF Swift creates their device files inside the container when it starts and every time you open a terminal or run a command in it, and removes the ones whose device is gone. A port that was unplugged when the container was created is remembered and attached later: plug it in, open a shell, and it is there.

**Off** removes those rules and leaves the container's `/dev` alone. You then have to map or bind-mount each port yourself.

Serial hot-plug works on Docker and rootful Podman. Rootless Podman keeps the mapping but needs the port plugged in at creation. With Lima on macOS, and on Windows, USB is first forwarded into a virtual machine (see [usb](/docs/commands/usb)).

{{< callout type="info" title="Clean up after older versions" >}}
Earlier versions could leave an empty, root-owned folder where a device file belongs (for example `/dev/ttyACM0` mounted while the reader was unplugged). `rfswift host devclean` lists and removes those folders.
{{< /callout >}}

## Examples

Plug a Proxmark3 into a running RFID container:

```bash
rfswift config bindings add -c rfid -d -t /dev/ttyACM0
```

Give a Wi-Fi container the capabilities its tools need, then remove one:

```bash
rfswift config capabilities add -c wifi -p NET_ADMIN
rfswift config capabilities add -c wifi -p NET_RAW
rfswift config capabilities rm  -c wifi -p NET_RAW
```

Publish a web interface on this computer only (localhost):

```bash
rfswift config ports bind -c web -b 127.0.0.1:8080:80/tcp
```

Give a Podman container access to all GPUs, for an OpenCL image (commit and recreate):

```bash
rfswift --engine podman config gpus add -c gpu_work -g all --recreate
```

Set realtime limits by hand, then list them. `rfswift realtime enable -c sdr` does the same in one step:

```bash
rfswift config ulimits add -c sdr -n rtprio -v 95
rfswift config ulimits add -c sdr -n memlock -v -1
rfswift config ulimits list -c sdr
```

## Related

- [Change a container after creation](/docs/guide/container-management)
- [realtime](/docs/commands/realtime)
- [host devclean](/docs/commands/host)
