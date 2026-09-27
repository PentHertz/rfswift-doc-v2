---
title: "rfswift audit"
linkTitle: "audit"
navGroup: "Security"
level: reference
description: "Audit a Nix environment, a container image or a container for vulnerabilities and attack surface."
weight: 70
---

`rfswift audit` tells you how exposed a toolbox is before you rely on it. It scans a Nix environment, a container image or a running container for known vulnerabilities (CVEs) and risky settings, and writes a report.

It detects the kind of target on its own. `rfswift env audit` and `rfswift image audit` are the dedicated forms.

```bash
rfswift audit penthertz/rfswift_resolute:sdr_full
```

## Synopsis

```bash
rfswift audit TARGET [--type auto|env|image|container] [--format stdout,json,html,pdf] [--fail-on SEVERITY] [--out DIR]
rfswift env audit [NAME] [--env NAME] [--format stdout,txt,json,html,pdf] [--fail-on SEVERITY] [--out DIR]
rfswift image audit IMAGE [IMAGE...] [--format ...] [--fail-on SEVERITY] [--out DIR]
```

How the target is detected:

1. a name from the Nix catalog is a Nix environment;
2. a reference with a tag or a `/` is an image;
3. anything else is a container.

Use `--type` to force it.

## What each audit covers

| Target | Scanners and checks |
|--------|---------------------|
| **Nix environment** | vulnix (CVEs in the Nix closure), a syft SBOM, grype, osv-scanner, store integrity, signature provenance, and flake and configuration hygiene. It runs through the flake's `audit` app. Each vulnix match lists the package, installed version, derivation, score, severity and description |
| **Container image** | trivy on OS packages and language dependencies. RF Swift uses trivy on the host when it is installed; otherwise it runs trivy as a container through the active engine (`save` + `--input`, so no socket mount is needed, and it works on Linux, macOS and Windows). A host grype, when installed, gives a second opinion |
| **Container** | Its attack surface: host exposure (`--privileged`, host network / PID / IPC, sensitive bind mounts including the engine socket, added capabilities, disabled seccomp or AppArmor, root, device passthrough), network exposure (published and exposed ports, flagged when bound to all interfaces), the image's CVEs, and attack-enabling binaries in a running container |

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--format` | Report formats, comma-separated: `stdout`, `json`, `html`, `pdf` (or `all`). `env audit` also has `txt` | `stdout` (`env audit`: `stdout,txt,json`) |
| `--fail-on` | Exit with an error when a finding is at least `low`, `medium`, `high` or `critical` | `none` |
| `--out` | Directory for the reports | `./security-report` (Nix environments keep their report next to the environment metadata) |
| `--type` | `auto`, `env`, `image`, `container` (`rfswift audit` only) | `auto` |

PDF output needs `weasyprint` or `wkhtmltopdf` on the host. Without one, you still get the HTML report.

## Examples

Audit a Nix environment, then write JSON and HTML reports for another one:

```bash
rfswift audit wifi
rfswift env audit mysdr --format json,html
```

Audit an image and fail a CI pipeline on critical findings, or write every report format to a folder:

```bash
rfswift audit penthertz/rfswift_resolute:sdr_full --fail-on critical
rfswift image audit myimage:latest --format all --out /tmp/audit
```

Check the attack surface of a running container:

```bash
rfswift audit mysdr --type container --format json,html
```

## Keeping audits current

- `rfswift env info NAME` shows a **Security posture** line from the last audit. Building a Nix environment prints it too.
- Updating an environment marks its audit as stale. Run the audit again after `env update`.
- The Workbench runs the same scanners from its **Security posture** panel. It keeps the unmodified JSON report as the reference for its optional AI review. Environment CVEs never count as mission findings.

## Related

- [Security guidelines](/docs/security/guide_lines)
- [Audits and hardened deployment](/docs/security/audit) for the deployment baseline and residual risks
- [env](/docs/commands/env), [image](/docs/commands/image)
