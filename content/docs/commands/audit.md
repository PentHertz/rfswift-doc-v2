---
title: audit
weight: 50
prev: /docs/commands/usb
next: /docs/commands/agent
---

# rfswift audit

Audit the security posture of a Nix environment, a container image, or a running container. `rfswift audit` auto-detects the target type; `rfswift env audit` and `rfswift image audit` are the dedicated forms.

## Synopsis

```bash
rfswift audit TARGET [--type auto|env|image|container] [--format stdout,json,html,pdf] [--fail-on SEVERITY] [--out DIR]
rfswift env audit [NAME] [--env NAME] [--format stdout,txt,json,html,pdf] [--fail-on SEVERITY] [--out DIR]
rfswift image audit IMAGE [IMAGE...] [--format ...] [--fail-on SEVERITY] [--out DIR]
```

Detection order: a name from the Nix catalog is an environment, a reference with a tag or a `/` is an image, anything else is a container. `--type` forces it.

---

## What each audit covers

| Target | Scanners and checks |
|--------|---------------------|
| **Nix environment** | vulnix (CVEs in the Nix closure), syft SBOM, grype, osv-scanner, store integrity, signature provenance, flake and configuration hygiene. Runs through the flake's `audit` app. Each vulnix match is embedded with package, installed version, derivation, score, severity and description |
| **Container image** | trivy on OS packages and language dependencies. A host trivy is used when present, otherwise trivy runs as a container through the active engine (`save` + `--input`, so no socket mount is needed, and it works on Linux, macOS and Windows). A host grype gives a second opinion when installed |
| **Container** | Its attack surface: host exposure (`--privileged`, host network / PID / IPC, sensitive bind mounts including the engine socket, added capabilities, disabled seccomp or AppArmor, root, device passthrough), network exposure (published and exposed ports, flagged when bound to all interfaces), the image's CVEs, and attack-enabling binaries in a running container |

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--format` | Report formats, comma-separated: `stdout`, `json`, `html`, `pdf` (or `all`). `env audit` also has `txt` | `stdout` (`env audit`: `stdout,txt,json`) |
| `--fail-on` | Exit non-zero when a finding is at least `low`, `medium`, `high` or `critical` | `none` |
| `--out` | Report output directory | `./security-report` (Nix environments keep their report beside the environment metadata) |
| `--type` | `auto`, `env`, `image`, `container` (`rfswift audit` only) | `auto` |

PDF output needs a host `weasyprint` or `wkhtmltopdf`; without one the HTML report is still produced.

---

## Examples

```bash
# A Nix environment
rfswift audit wifi
rfswift env audit mysdr --format json,html

# An image, gating a CI pipeline
rfswift audit penthertz/rfswift_resolute:sdr_full --fail-on critical
rfswift image audit myimage:latest --format all --out /tmp/audit

# A running container's attack surface
rfswift audit mysdr --type container --format json,html
```

## Routine awareness

- `rfswift env info NAME` prints a **Security posture** line from the last audit, and building a Nix environment prints it too.
- Updating an environment marks its audit stale; audit again after `env update`.
- The Workbench runs the same scanners from the Security posture panel and keeps the unmodified JSON report as ground truth for its optional AI review; environment CVEs never count as mission findings.

## Related

- [Security guidelines](/docs/security/guide_lines)
- [Security audit page](/docs/security/audit) for the deployment baseline and residual risks
- [env](/docs/commands/env), [image](/docs/commands/image)
