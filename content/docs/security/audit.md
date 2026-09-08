---
title: Audits and hardened deployment
weight: 6
prev: /docs/security/guide_lines
next: /docs/security/remote-agent
cascade:
  type: docs
---

# 🔍 Security audits and the hardened deployment baseline

RF Swift v4 ships its own vulnerability and attack-surface audits, and the project publishes a dated security review of its own code. This page summarises both and gives the deployment baseline for sensitive environments.

## Auditing what you run

```bash
rfswift audit <target>                       # auto-detects a Nix environment, an image or a container
rfswift env audit mysdr --format json,html   # Nix closure: vulnix, syft SBOM, grype, osv-scanner, integrity, provenance, hygiene
rfswift image audit penthertz/rfswift_resolute:sdr_full --fail-on critical   # trivy (+ grype)
rfswift audit lab --type container           # attack surface + image CVEs of a container
```

What the **container** audit flags:

| Area | Findings |
|------|----------|
| Host exposure | `--privileged`, host network / PID / IPC, sensitive bind mounts (including the engine socket), added capabilities, disabled seccomp or AppArmor, root, device passthrough |
| Network exposure | published and exposed ports, flagged when bound to all interfaces |
| Supply chain | the image's CVEs |
| Runtime | attack-enabling binaries present in a running container |

Reports go to `./security-report` (`--out`) as `stdout`, `json`, `html` or `pdf`; `--fail-on high` turns the audit into a CI gate. Nix environments keep a **Security posture** line in `rfswift env info` and print it after each build; updating an environment marks its audit stale. The Workbench runs the same scanners from its Security posture panel and keeps the raw JSON as ground truth for its optional AI review. Full reference: [audit](/docs/commands/audit).

## The project's own security posture

RF Swift maintains a dated **security ground truth** in the repository ([docs/security-ground-truth-2026-08-31.md](https://github.com/PentHertz/RF-Swift/blob/main/docs/security-ground-truth-2026-08-31.md)) covering the CLI and remote agent, the Workbench backend and its import/export paths, the installers and the GitHub Actions workflows. The trust boundaries it defines:

| Boundary | Assumption |
|---|---|
| Workbench WebView to Go backend | Web input is untrusted; every filesystem operation validates workspace, mission, filename and archive paths |
| Imported projects, `.rfenv` files, captures and notes | Hostile data. Evidence can contain prompt injection. A portable Nix closure is executable code and must come from a trusted source |
| Docker / Podman / Lima socket | Engine access is host-administration access. Do not expose the socket to untrusted users or workloads |
| Remote agent | A client certificate authorises remote command execution. Loopback by default, keys protected, exposed only on a trusted network or authenticated tunnel |
| Installer and release pipeline | Repository, release signing identity, pinned workflow actions, downloaded checksums and external platform installers are supply-chain trust roots |
| Hardware-enabled mission | Devices, capabilities, host networking, X11, mounts and privileged mode deliberately reduce isolation. Enable only what the assessment requires |

A dedicated review of the remote agent protocol, run against a live agent before its network exposure, is recorded in [docs/remote-agent-security-audit-2026-09.md](https://github.com/PentHertz/RF-Swift/blob/main/docs/remote-agent-security-audit-2026-09.md); its findings (credential files now carry an integrity tag, the agent reports its version, every authenticated request is logged) are fixed in v4.0.2 and its deployment rules are on the [Remote agent hardening](/docs/security/remote-agent) page.

Controls confirmed in the current baseline include mandatory mTLS and TLS 1.3 for the agent with bounded responses and full server timeouts, central path validation in the Workbench store, native path-safe extraction of `.rfenv` and project archives with entry and size bounds (20 GiB / 100,000 entries for mission companion data), bounded remote command output, installer checksum and archive-member checks, GitHub Actions pinned to commit SHAs, and read-only default permissions in the release workflow. Residual risks remain by design: coarse remote-agent authorisation, executable Nix imports, engine sockets and privileged missions controlling the host, third-party bootstrap scripts (Docker's installer, the Determinate Nix installer), and secret-dependent release signing.

## Hardened deployment baseline

1. Install only artifacts whose checksum, signature or attestation, repository and version were independently verified: `gh attestation verify <file> --repo PentHertz/RF-Swift`; review `get_rfswift.sh` before running it, or use the native packages and the [air-gapped procedure](/docs/air-gapped-installation).
2. Use a dedicated non-administrator account; keep engine and hardware groups narrowly assigned. Members of the `docker` group are root-equivalent.
3. Prefer rootless Podman, read-only binds, explicit devices and minimal capabilities. Avoid `--privileged`, host networking, broad `/dev` mounts, `SYS_ADMIN` and writable host binds unless required. `rfswift audit <container>` shows what you granted.
4. Keep the remote agent on loopback or a private authenticated tunnel; protect its key directory with owner-only permissions; rotate the bundle after a loss or a personnel change.
5. Treat imported missions, notes, captures, images and Nix environments as untrusted until provenance is established. Import `.rfenv` archives only from sources you trust.
6. Nix environments run natively as your user: use `--isolate` for tools you do not fully trust, and `rfswift env audit` for supply-chain posture.
7. Re-run `rfswift audit` on images and environments before each engagement and after every update.

## Reporting a vulnerability

Report security issues privately to the maintainers ([penthertz.com](https://penthertz.com/)) before opening a public issue. The repository's security workflow runs dependency audits, ShellCheck, installer tests, fuzzing of the remote and archive parsers, and the immutable-action guard on every push.
