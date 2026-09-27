---
title: "rfswift image"
linkTitle: "image"
navGroup: "Images"
level: reference
description: "List, pull, audit, build, tag, export and import container images."
weight: 20
---

`rfswift image` groups every command that works on container images. Use it to see which images you have, download new ones, check them for vulnerabilities, build your own, and move images between machines.

The most common use is downloading a toolbox:

```bash
rfswift image pull -i sdr_full
```

This is the canonical v4 group. The older spellings (`rfswift images ...`, `rfswift build`, `rfswift delete`, `rfswift retag`, `rfswift download`, `rfswift export` and `rfswift import`) still work and print a notice with the new name.

## Synopsis

```bash
rfswift image local     [-v] [-f FILTER]                 # was: images local
rfswift image remote    [-v] [-f FILTER]                 # was: images remote
rfswift image pull      -i IMAGE [-t TAG] [-V VERSION]   # was: images pull
rfswift image versions  [-f FILTER]                      # was: images versions
rfswift image audit     IMAGE [IMAGE...] [--format ...]  # was: images audit
rfswift image build     -r RECIPE.yaml [-t TAG] [--no-cache]   # was: build
rfswift image rm        -i IMAGE                         # was: delete
rfswift image tag       -i IMAGE -t NEWTAG               # was: retag
rfswift image download  -i IMAGE [-o FILE] [--pull]      # was: download
rfswift image export    container|image ...              # was: export
rfswift image import    container|image ...              # was: import
```

The group-level flags `-v, --show-versions` and `-f, --filter` apply to `local` and `remote`.

## Subcommands

| Subcommand | What it does | Details |
|------------|--------------|---------|
| `local` | Lists the RF Swift images on the active engine, with their version status | [images](/docs/commands/images) |
| `remote` | Lists the images published in the official repository for your architecture | [images](/docs/commands/images) |
| `pull` | Downloads an image. `-V` picks a published version, `-t` gives it a local tag | [images](/docs/commands/images) |
| `versions` | Lists every published version of each image | [images](/docs/commands/images) |
| `audit` | Scans one or more images for known vulnerabilities (CVEs) with trivy, plus a second opinion from grype on the host. trivy runs from the host binary, or as a container through the engine if it is not installed. Options: `--format stdout,json,html,pdf`, `--fail-on`, `--out` | [audit](/docs/commands/audit) |
| `build` | Builds an image from a simplified YAML recipe | [build](/docs/commands/build) |
| `rm` | Deletes an image. Without `-i`, a picker opens | [delete](/docs/commands/delete) |
| `tag` | Renames an image tag | [retag](/docs/commands/retag) |
| `download` | Saves an image to a compressed `tar.gz` file. `--pull` fetches it first | [download](/docs/commands/download) |
| `export container` / `export image` | Exports a container's filesystem, or one or more images, to `tar.gz` | [export](/docs/commands/export) |
| `import container` / `import image` | Imports such an archive back. Without `-i`, a file picker opens | [import](/docs/commands/import) |

## Examples

See which images are on this machine, and whether newer versions are published:

```bash
rfswift image local -v
```

See which telecom images you can pull for this architecture:

```bash
rfswift image remote -f telecom
```

Pull a specific published version and give it a short local tag:

```bash
rfswift image pull -i sdr_full -V 0.1.1 -t sdr:pinned
```

Audit an image before an engagement, and make a CI pipeline fail on critical vulnerabilities:

```bash
rfswift image audit penthertz/rfswift_resolute:sdr_full --format json,html --fail-on critical
```

Move an image to an air-gapped machine: save it on a connected machine, then import it on the offline one:

```bash
rfswift image download -i sdr_light -o sdr_light.tar.gz --pull
rfswift image import image -i sdr_light.tar.gz
```

Save a customised container as an image and carry it to another machine:

```bash
rfswift container commit -c lab -i lab_ready:v1
rfswift image export image -i lab_ready:v1 -o lab_ready.tar.gz
```

{{< callout type="info" title="Where official images live" >}}
Since v3.0.0, official images are published under `penthertz/rfswift_resolute` (Ubuntu 26.04). Short names such as `sdr_full` are expanded with the `repotag` set in your `config.ini`. RF Swift prints a notice when a container still runs an image from the older `rfswift_noble` repository.
{{< /callout >}}

{{< callout type="warning" title="Pull fails with “invalid username/password”" >}}
This comes from an old `docker login` or `podman login` for Docker Hub that the engine still remembers. RF Swift sends no credentials of its own. The error message names the credential file and the `logout` command that clears it.
{{< /callout >}}

## Related

- [container](/docs/commands/container): run what you pulled
- [Air-gapped installation](/docs/air-gapped-installation): the full download and import workflow
- [env export / import](/docs/commands/env): the Nix equivalent, with `.rfenv` archives
