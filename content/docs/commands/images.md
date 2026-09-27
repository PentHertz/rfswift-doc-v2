---
title: "rfswift image local / remote / pull / versions"
linkTitle: "image pull / local / remote"
navGroup: "Images"
level: reference
description: "List local images, browse the official registry, pull images and track their versions."
weight: 21
---

These four subcommands answer everyday questions about images: what do I have, what can I download, how do I get it, and which version is it?

The most common use is downloading a toolbox:

```bash
rfswift image pull -i sdr_full
```

{{< callout type="info" >}}
`rfswift image ...` is the v4 spelling. The older `rfswift images ...` still works and prints a notice. The whole group, including `build`, `rm`, `tag`, `download`, `export`, `import` and `audit`, is described on the [image](/docs/commands/image) page.
{{< /callout >}}

## Synopsis

```bash
rfswift image local [-v] [-f FILTER]              # local images with version status
rfswift image remote [-v] [-f FILTER]             # images published for your architecture
rfswift image pull -i IMAGE [-t TAG] [-V VERSION] # pull, optionally a specific version, optionally retag
rfswift image versions [-f FILTER]                # every published version of each image
rfswift image audit IMAGE [--format ...]          # CVE scan, see the audit page
```

## Subcommands

### images local

Lists the RF Swift images on this computer.

```bash
rfswift image local [-v] [-f FILTER]
```

| Flag | What it does | Example |
|------|--------------|---------|
| `-v, --show-versions` | Also show version information | `-v` |
| `-f, --filter STRING` | Only show images whose name matches | `-f sdr_full` |

For each image you see the repository and tag, the image ID, the creation date, the size and, since v0.7.0, the version.

### images remote

Lists the RF Swift images published in the official Penthertz registry.

```bash
rfswift image remote [-v] [-f FILTER]
```

| Flag | What it does | Example |
|------|--------------|---------|
| `-v, --show-versions` | Also show the version history | `-v` |
| `-f, --filter STRING` | Only show images whose name matches | `-f wifi` |

For each image you see its name, description and available tags. With `-v` you also get the version history.

### images pull

Downloads an image from a registry to this computer.

```bash
rfswift image pull -i IMAGE_NAME [-t TAG] [-V version]
```

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --image STRING` | The image to pull | Yes | `-i penthertz/rfswift_resolute:sdr_full` |
| `-t, --tag STRING` | Local tag to give the pulled image | No | `-t my_sdr:v1` |
| `-V, --version STRING` | Pull a specific published version | No | `-V 0.1.1` |

### images versions

Lists every published version of each RF Swift image.

```bash
rfswift image versions [-f FILTER]
```

| Flag | What it does | Example |
|------|--------------|---------|
| `-f, --filter STRING` | Only show images whose name matches | `-f sdr_full` |

List the versions of all images:

```bash
rfswift image versions
```

List the versions of one image:

```bash
rfswift image versions -f wifi
```

Example output:

```
┌──────────────────────────────────────┬────────────────────┬──────────────┐
│ Image                                │ Version            │ Status       │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:wifi         │ latest, 0.1.1      │ Up to date   │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:sdr_full     │ latest, 0.1.1      │ Up to date   │
├──────────────────────────────────────┼────────────────────┼──────────────┤
│ penthertz/rfswift_resolute:sdr_light    │ latest, 0.1.1      │ Up to date   │
└──────────────────────────────────────┴────────────────────┴──────────────┘
```

## Version management (v0.7.0+)

Since RF Swift v0.7.0, images carry version numbers. This lets you pin a known release and see when a newer one is published.

### See which versions exist

List the published images together with their versions:

```bash
rfswift image remote -v
```

Example output:

```
┌──────────────────────┬────────────────────┬─────────────────────────────────────┬──────────────┬──────────────────────────────────────────────────────────────┐
│ Tag                  │ Pushed Date        │ Image                               │ Size         │ Versions                                                     │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
│ wifi                 │ 2026-01-27 16:27   │ penthertz/rfswift_resolute:wifi        │ 7981.2 MB    │ latest, 0.1.1                                                │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
│ sdr_full             │ 2026-01-27 16:27   │ penthertz/rfswift_resolute:sdr_full    │ 14176.2 MB   │ latest, 0.1.1                                                │
├──────────────────────┼────────────────────┼─────────────────────────────────────┼──────────────┼──────────────────────────────────────────────────────────────┤
```

### Pull a specific version

Pull the latest version (the default):

```bash
rfswift image pull -i sdr_full
```

Pull a specific version:

```bash
rfswift image pull -i sdr_full -V 0.1.1
```

### Compare local versions

The Version column shows which release each local image is:

```bash
  📦 RF Swift Images                                                                                                            
┌──────────────────────────────┬─────────────────┬──────────────┬───────────────────────────┬─────────────┬────────────┬─────────┐
│ Repository                   │ Tag             │ Image ID     │ Created                   │ Size        │ Status     │ Version │
├──────────────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┼─────────┤
│ penthertz/rfswift_resolute      │ sdr_light_0.1.1 │ cdf39442893e │ 2026-01-19T20:17:49+01:00 │ 13076.96 MB │ Up to date │ 0.1.1   │
...
```

{{< callout type="warning" title="Check your disk space first" >}}
Images are large: several gigabytes each (about 8 GB for `wifi` and 14 GB for `sdr_full` in the listing above). Check free space with `df -h` before pulling several images or versions. On a small disk, start with `sdr_light`.
{{< /callout >}}

## Troubleshooting

### No images are listed locally

`rfswift image local` shows nothing when you have not pulled an image yet, or when the engine is not running.

Pull your first image:

```bash
rfswift image pull -i sdr_full
```

List every image the engine knows (not only RF Swift ones), and check that Docker is running:

```bash
docker images
docker ps
```

### The remote list is empty or fails

`rfswift image remote` needs to reach Docker Hub. Check the network, Docker Hub itself, and whether a proxy or firewall blocks the connection:

```bash
ping registry.hub.docker.com
curl -I https://hub.docker.com
docker search penthertz/rfswift_resolute
```

### Pull fails with “invalid username/password”

The full error is `unable to retrieve auth token: invalid username/password`. The engine is presenting an old `docker login` or `podman login` for Docker Hub that is no longer valid. RF Swift sends no credentials of its own. The error message names the credential file and the `logout` command that clears it.

### Pull fails with “Error pulling image”

Check the exact image name and version, then try pulling with Docker directly. Also check free disk space and the network:

```bash
rfswift image remote -v
docker pull penthertz/rfswift_resolute:sdr_full
df -h
ping registry.hub.docker.com
```

### “Version not found” or “Tag not found”

The version you asked for is not published. List the available versions and copy the version string exactly as shown:

```bash
rfswift image remote -v
rfswift image pull -i wifi -V 0.1.1
```

### A private registry asks for a login

Log in with the engine first, then pull as usual. For a private registry:

```bash
docker login registry.example.com
rfswift image pull -i registry.example.com/image:tag
```

For private images on Docker Hub:

```bash
docker login
rfswift image pull -i myuser/private-image:tag
```

## Related commands

- [`build`](/docs/commands/build): build your own images
- [`download`](/docs/commands/download): save images to files
- [`export`](/docs/commands/export): export images to archives
- [`import`](/docs/commands/import): import images from archives
- [`delete`](/docs/commands/delete): remove images
- [`retag`](/docs/commands/retag): give images a new local tag
- [`run`](/docs/commands/run): create containers from images
- [`upgrade`](/docs/commands/upgrade): move a container to a newer image
