---
title: "rfswift image"
linkTitle: "image"
navGroup: "Images"
level: reference
description: "List, pull, audit, build, tag, export and import container images."
weight: 20
---

Manage container images: list what is local or published, pull, audit for vulnerabilities, build from a recipe, tag, and move images or containers around as archives. This is the canonical v4 group; `rfswift images ...`, `rfswift build`, `rfswift delete`, `rfswift retag`, `rfswift download`, `rfswift export` and `rfswift import` still work and print a notice.

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

Group-level flags `-v, --show-versions` and `-f, --filter` apply to `local` and `remote`.

---

## Subcommands

| Subcommand | Purpose | Details |
|------------|---------|---------|
| `local` | RF Swift images present on the active engine, with version status | [images](/docs/commands/images) |
| `remote` | Images published in the official repository for your architecture | [images](/docs/commands/images) |
| `pull` | Pull an image (`-V` picks a published version, `-t` retags it locally) | [images](/docs/commands/images) |
| `versions` | Every published version of each image | [images](/docs/commands/images) |
| `audit` | Scan one or more images for CVEs with trivy (host binary, else run as a container through the engine), plus a host grype second opinion; `--format stdout,json,html,pdf`, `--fail-on`, `--out` | [audit](/docs/commands/audit) |
| `build` | Build an image from a simplified YAML recipe | [build](/docs/commands/build) |
| `rm` | Delete an image (interactive picker if `-i` is omitted) | [delete](/docs/commands/delete) |
| `tag` | Rename an image tag | [retag](/docs/commands/retag) |
| `download` | Save an image to a compressed `tar.gz` (`--pull` fetches it first) | [download](/docs/commands/download) |
| `export container` / `export image` | Export a container filesystem or one or more images to `tar.gz` | [export](/docs/commands/export) |
| `import container` / `import image` | Import an archive back (a file picker opens when `-i` is omitted) | [import](/docs/commands/import) |

---

## Examples

```bash
# What is on this machine, with freshness against the registry
rfswift image local -v

# What can be pulled for this architecture
rfswift image remote -f telecom

# Pull a specific published version and give it a short local tag
rfswift image pull -i sdr_full -V 0.1.1 -t sdr:pinned

# Audit before an engagement, fail the pipeline on critical CVEs
rfswift image audit penthertz/rfswift_resolute:sdr_full --format json,html --fail-on critical

# Move an image to an air-gapped machine
rfswift image download -i sdr_light -o sdr_light.tar.gz --pull
rfswift image import image -i sdr_light.tar.gz

# Snapshot a customised container and carry it elsewhere
rfswift container commit -c lab -i lab_ready:v1
rfswift image export image -i lab_ready:v1 -o lab_ready.tar.gz
```

{{< callout type="info" >}}
**Image repository**: since v3.0.0 official images live under `penthertz/rfswift_resolute` (Ubuntu 26.04). Short names such as `sdr_full` are expanded with the `repotag` of your `config.ini`. RF Swift prints a notice when a container still runs an image from the older `rfswift_noble` repository.
{{< /callout >}}

{{< callout type="warning" >}}
**Pull errors mentioning `invalid username/password`** come from a stale `docker login` / `podman login` for Docker Hub kept by the engine. RF Swift sends no credentials of its own; the message names the credential file and the `logout` command that clears it.
{{< /callout >}}

## Related

- [container](/docs/commands/container) to run what you pulled
- [Air-gapped installation](/docs/air-gapped-installation) for the download / import workflow
- [env export / import](/docs/commands/env) for the Nix equivalent (`.rfenv` archives)
