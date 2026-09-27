---
title: "rfswift config ulimits"
linkTitle: "config ulimits"
navGroup: "Runtime configuration"
level: reference
description: "Set resource limits (ulimits) on an existing container."
weight: 46
---

Resource limits ("ulimits") control things like real-time priority, locked memory and open files for the processes in a container. For SDR work, the right limits prevent buffer underruns (dropped samples) and improve real-time performance. `rfswift config ulimits` adds, removes and lists them on an existing container.

For radio work, the one-command shortcut is usually enough: `rfswift realtime enable -c NAME` sets every limit SDR tools need (see [realtime](/docs/commands/realtime)).

```bash
rfswift config ulimits add -c my_sdr -n rtprio -v 95
```

{{< callout type="info" >}}
**RF Swift v4**: this group lives under `config` as `rfswift config ulimits`. The short form `rfswift ulimits` is still current. On Linux Docker the change is applied in place after one `sudo` prompt. On Podman the container is committed and re-created; add `--recreate` to force that path on Docker too. Either way, the container restarts. See [config](/docs/commands/config).
{{< /callout >}}

## Synopsis

```bash
rfswift config ulimits add  -c CONTAINER -n NAME -v VALUE
rfswift config ulimits rm   -c CONTAINER -n NAME
rfswift config ulimits list -c CONTAINER
```

## Subcommands

| Subcommand | What it does |
|------------|--------------|
| `add` | Adds or updates a limit on a container |
| `rm` | Removes a limit from a container |
| `list` | Lists the limits set on a container |

## Options

### ulimits add

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-n, --name STRING` | Limit name | Yes | `-n rtprio` |
| `-v, --value STRING` | Limit value | Yes | `-v 95` |

### ulimits rm

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-n, --name STRING` | Name of the limit to remove | Yes | `-n rtprio` |

### ulimits list

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |

## Common limits

| Name | What it controls | Why it matters for SDR |
|------|------------------|------------------------|
| `rtprio` | Real-time scheduling priority (0-99) | Lets you run SDR processing with real-time priority (`chrt`) |
| `memlock` | Maximum locked memory in bytes (-1 = unlimited) | Keeps sample buffers in RAM instead of swap |
| `nice` | Nice priority range (40 allows nice -20) | Higher process priority |
| `nofile` | Maximum open file descriptors | Several SDR devices, or large file operations |
| `nproc` | Maximum number of processes | Parallel processing pipelines |

## Value format

| Format | Meaning | Example |
|--------|---------|---------|
| `value` | Same soft and hard limit | `95` |
| `soft:hard` | Separate soft and hard limits | `1024:65536` |
| `-1` or `unlimited` | No limit | `-1` |

## Examples

### Basic use

Allow real-time scheduling:

```bash
rfswift config ulimits add -c sdr_work -n rtprio -v 95
```

Allow unlimited locked memory:

```bash
rfswift config ulimits add -c sdr_work -n memlock -v -1
```

Set separate soft and hard limits for open files:

```bash
rfswift config ulimits add -c sdr_work -n nofile -v 1024:65536
```

List the current limits, then remove one:

```bash
rfswift config ulimits list -c sdr_work
rfswift config ulimits rm -c sdr_work -n rtprio
```

### Tune a lab for SDR work

Set the three limits SDR tools use, then check them:

```bash
rfswift config ulimits add -c hackrf_work -n rtprio -v 95
rfswift config ulimits add -c hackrf_work -n memlock -v unlimited
rfswift config ulimits add -c hackrf_work -n nice -v 40
rfswift config ulimits list -c hackrf_work
```

### Fix buffer underruns

Check the limits, add `rtprio` if it is missing, then confirm it from inside the lab (it should print 95):

```bash
rfswift config ulimits list -c sdr_container
rfswift config ulimits add -c sdr_container -n rtprio -v 95
rfswift container shell -c sdr_container -e "ulimit -r"
```

### Run a tool with real-time priority

Once `rtprio` is set, enter the lab and start the tool with a real-time or raised priority:

```bash
rfswift container shell -c sdr_container

# Inside the container, run SDR tool with real-time priority
chrt -f 50 rtl_sdr -f 433920000 -s 2048000 - | ...

# Or with higher nice priority
nice -n -10 gqrx
```

## Troubleshooting

### A limit is set but has no effect

Check that the limit is set, then look at it from inside the lab. `rtprio` also needs the `SYS_NICE` capability. `realtime enable` sets everything at once:

```bash
rfswift config ulimits list -c container
rfswift container shell -c container -e "ulimit -a"
rfswift config capabilities add -c container -p SYS_NICE
rfswift realtime enable -c container
```

### `chrt: failed to set pid 0's policy: Operation not permitted`

Real-time scheduling needs both the `rtprio` limit **and** the `SYS_NICE` capability. Add both, or enable realtime mode:

```bash
rfswift config ulimits add -c container -n rtprio -v 95
rfswift config capabilities add -c container -p SYS_NICE
rfswift realtime enable -c container
```

### The container restarts

Changing a limit always restarts the container. On Linux Docker the change is applied in place; on Podman (or with `--recreate`) the container is committed and re-created. Files in mounted volumes and in the workspace are kept. To be safe, commit important changes first:

```bash
rfswift container commit -c container -i my_image:backup
rfswift config ulimits add -c container -n rtprio -v 95
```

## Good to know

- To set limits for every container on a host, you can also configure default ulimits in `/etc/docker/daemon.json`. See [realtime](/docs/commands/realtime).
- You can set limits when creating a lab with `rfswift container create --ulimits`.

## Related

- [realtime](/docs/commands/realtime): all SDR limits in one command
- [config capabilities](/docs/commands/capabilities)
- [container shell](/docs/commands/exec): check limits inside a container
- [container create](/docs/commands/run): the `--ulimits` flag
