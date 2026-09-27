---
title: "Audits and hardened deployment"
level: advanced
description: "RF Swift's built-in vulnerability and attack-surface audits, the project's own security review, and a hardened deployment baseline."
weight: 6
---

RF Swift can audit what you run: its images, containers and Nix environments. The project also publishes a dated security review of its own code. This page summarises both, then gives a deployment baseline for sensitive environments.

## Auditing what you run

`rfswift audit` detects the kind of target by itself. You can also call the image and environment audits directly:

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

Good to know:

- Reports go to `./security-report` (change it with `--out`), as `stdout`, `json`, `html` or `pdf`.
- `--fail-on high` makes the audit fail the run, which turns it into a CI gate.
- Nix environments keep a **Security posture** line in `rfswift env info` and print it after each build. Updating an environment marks its audit as stale.
- The Workbench runs the same scanners from its Security posture panel, and keeps the raw JSON as ground truth for its optional AI review.

Full reference: [audit](/docs/commands/audit/).

## The project's own security posture

RF Swift keeps a dated **security ground truth** in its repository: [docs/security-ground-truth-2026-08-31.md](https://github.com/PentHertz/RF-Swift/blob/main/docs/security-ground-truth-2026-08-31.md). It covers the CLI and remote agent, the Workbench backend and its import/export paths, the installers and the GitHub Actions workflows.

It defines these trust boundaries:

| Boundary | Assumption |
|---|---|
| Workbench WebView to Go backend | Web input is untrusted; every filesystem operation validates workspace, mission, filename and archive paths |
| Imported projects, `.rfenv` files, captures and notes | Hostile data. Evidence can contain prompt injection. A portable Nix closure is executable code and must come from a trusted source |
| Docker / Podman / Lima socket | Engine access is host-administration access. Do not expose the socket to untrusted users or workloads |
| Remote agent | A client certificate authorises remote command execution. Loopback by default, keys protected, exposed only on a trusted network or authenticated tunnel |
| Installer and release pipeline | Repository, release signing identity, pinned workflow actions, downloaded checksums and external platform installers are supply-chain trust roots |
| Hardware-enabled mission | Devices, capabilities, host networking, X11, mounts and privileged mode deliberately reduce isolation. Enable only what the assessment requires |

### The remote agent review

A dedicated review of the remote agent protocol was run against a live agent before its network exposure. It is recorded in [docs/remote-agent-security-audit-2026-09.md](https://github.com/PentHertz/RF-Swift/blob/main/docs/remote-agent-security-audit-2026-09.md). Its findings are fixed in v4.0.2: credential files now carry an integrity tag, the agent reports its version, and every authenticated request is logged. Its deployment rules are on the [Remote agent hardening](/docs/security/remote-agent/) page.

### Controls confirmed in the current baseline

- mandatory mTLS and TLS 1.3 for the agent, with bounded responses and full server timeouts;
- central path validation in the Workbench store;
- native, path-safe extraction of `.rfenv` and project archives, with entry and size limits (20 GiB / 100,000 entries for mission companion data);
- bounded remote command output;
- installer checksum and archive-member checks;
- GitHub Actions pinned to commit SHAs, and read-only default permissions in the release workflow.

### Residual risks, by design

- coarse remote-agent authorisation (every client has the same rights);
- executable Nix imports;
- engine sockets and privileged missions that control the host;
- third-party bootstrap scripts (Docker's installer, the Determinate Nix installer);
- release signing that depends on secrets.

## Hardened deployment baseline

1. **Verify what you install.** Install only artifacts whose checksum, signature or attestation, repository and version you checked yourself: `gh attestation verify <file> --repo PentHertz/RF-Swift`. Review `get_rfswift.sh` before running it, or use the native packages and the [air-gapped procedure](/docs/air-gapped-installation/).
2. **Use a dedicated, non-administrator account.** Keep membership of the engine and hardware groups narrow. Members of the `docker` group are root-equivalent.
3. **Grant as little as possible.** Prefer rootless Podman, read-only binds, explicit devices and minimal capabilities. Avoid `--privileged`, host networking, broad `/dev` mounts, `SYS_ADMIN` and writable host binds unless you need them. `rfswift audit <container>` shows what you granted.
4. **Keep the remote agent private.** Keep it on loopback or a private authenticated tunnel, make its key directory owner-only, and rotate the bundle after a loss or a change of staff.
5. **Treat imports as untrusted** until you know where they come from: missions, notes, captures, images and Nix environments. Import `.rfenv` archives only from sources you trust.
6. **Jail tools you do not fully trust.** Nix environments run natively as your user: use `--isolate` for such tools, and `rfswift env audit` for supply-chain posture.
7. **Audit again regularly.** Re-run `rfswift audit` on images and environments before each engagement and after every update.

## Reporting a vulnerability

Report security issues privately to the maintainers ([penthertz.com](https://penthertz.com/)) before opening a public issue. On every push, the repository's security workflow runs dependency audits, ShellCheck, installer tests, fuzzing of the remote and archive parsers, and the immutable-action guard.
