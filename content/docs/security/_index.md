---
linkTitle: "Security"
title: "Security overview"
level: advanced
description: "How to use RF Swift safely: isolation, privileges, session recordings and where to report issues."
weight: 9
---

Radio and hardware security work often needs special permissions: access to USB devices, network interfaces, sometimes privileged mode. This section shows how to keep those permissions as small as possible while everything still works, and how to handle the sensitive data an assessment produces.

**In short**

- Start labs **unprivileged** (the default) and add only the capabilities and devices a tool needs.
- Keep remote desktops on localhost, or protect them with a password and SSL.
- Run `rfswift audit` on an image, container or environment before an engagement.
- Use a Nix environment with `--isolate` for tools you don't trust.
- Treat session recordings like penetration-test reports: they can contain credentials.

## Why it matters

Balancing functionality with security lets you:

- protect your host system from container exploits;
- prevent lateral movement if a container is compromised;
- keep different testing environments isolated from each other;
- let tools work with the minimum privileges they need;
- safeguard sensitive data in session recordings;
- secure remote desktop connections exposed on the network.

## Key security areas

{{< cards >}}
  {{< card link="/docs/security/guide_lines/" title="Security guidelines" icon="shield-check" subtitle="Essential practices: privileges, capabilities, networks, desktops, recordings" >}}
  {{< card link="/docs/security/audit/" title="Audits and hardened deployment" icon="magnifying-glass" subtitle="rfswift audit, the project's security baseline, deployment rules" >}}
  {{< card link="/docs/security/remote-agent/" title="Remote agent hardening" icon="broadcast" subtitle="Deploying an exposed agent: network, keys, vault, service, rotation" >}}
  {{< card link="/docs/security/mcp/" title="AI bridge (MCP) best practices" icon="chat-circle-dots" subtitle="Permissions, evidence trust, data sent to vendors, review" >}}
  {{< card link="/docs/guide/nix-engine/#isolation-the---isolate-jail" title="Nix isolation jail" icon="cube" subtitle="bubblewrap and Seatbelt for native environments" >}}
{{< /cards >}}

## Quick reference

### Recommended settings

| Setting | Command | Why |
|---------|---------|-----|
| Unprivileged mode | `rfswift container create -u 0` | Reduces container privileges (the default) |
| Minimal capabilities | `rfswift container create -a NET_ADMIN` | Add only the capabilities a tool requires |
| Network isolation | `rfswift container create -t bridge` | Isolates the container's network |
| Device restrictions | `rfswift container create -g "c 189:* rwm"` | Limits device access |
| Desktop on localhost | `rfswift container create --desktop` | Safe: only reachable from the host |
| Desktop with password and SSL | `--desktop-pass "pw" --desktop-ssl` | Encrypted and authenticated |
| Disable X11 for the desktop | `rfswift container create --desktop --no-x11` | Removes the X11 socket exposure |
| Audit before an engagement | `rfswift audit NAME` | Shows the attack surface and CVEs of a container, image or environment |
| Nix jail | `rfswift container create --engine nix --isolate` | Hides your home and the host filesystem, keeps devices |

### Settings that need care

| Setting | Command | Risk |
|---------|---------|------|
| Desktop without password on the network | `--desktop-config "http:0.0.0.0:6080"` | **Critical**: unauthenticated remote access |
| Privileged mode | `rfswift container create -u 1` | **High**: grants extensive privileges |
| Default network | `rfswift container create -t host` | **Medium**: shares the host network stack |
| Session recording | `rfswift container create --record` | **Data sensitivity**: may capture credentials and sensitive information |
| Native Nix environment | `rfswift container create --engine nix` | Runs as your user with no container: use `--isolate` for tools you do not trust |
| Remote agent | `rfswift agent --bundle DIR` | A client certificate is full command execution: loopback plus VPN or SSH only. See [Remote agent hardening](/docs/security/remote-agent/) |
| AI bridge | Workbench > Agent & MCP | Keep it read-only unless a task needs more; evidence is untrusted input. See [MCP best practices](/docs/security/mcp/) |
| Docker group | `rfswift host docker-access` | Members of the `docker` group are root-equivalent |

## Container security philosophy

With RF Swift you can adopt five simple principles:

1. **Least privilege**: containers start with minimal privileges.
2. **Dynamic enhancement**: add capabilities only when needed.
3. **Separation of concerns**: use dedicated containers for different tasks.
4. **Defense in depth**: several security layers working together.
5. **Data protection**: handle session recordings and sensitive data securely.

## Session recording security

Session recordings are valuable documentation, but they may contain sensitive information that needs careful handling.

### What gets recorded

Everything displayed in your terminal:

| Everyday output | Sensitive: handle with care |
|---|---|
| Commands and their outputs | **Credentials** entered in plaintext |
| Tool execution results | **API keys** and tokens |
| System information and configuration details | **Target system information** |
| | **Exploit code** and techniques |
| | **Network traffic analysis** results |

### Best practices for recordings

**Store them in protected directories**

```bash
# Store recordings in protected directories
mkdir -p ~/assessments/recordings
chmod 700 ~/assessments/recordings

# Record to protected location
rfswift container create -i sdr_full -n assessment --record \
  --record-output ~/assessments/recordings/client-session.cast

# Set appropriate permissions
chmod 600 ~/assessments/recordings/client-session.cast
```

**Pause the recording for sensitive operations**

```bash
# For sensitive credential entry, pause recording
rfswift log stop

# Manually enter credentials without recording
# ...

# Resume recording after sensitive operations
rfswift log start -o continued-session.cast
```

**Sanitize before sharing**

```bash
# Review recordings before sharing
rfswift log replay -i session.cast

# Edit recordings to remove sensitive data if needed
# (Consider using asciinema tools or manual editing)

# Never upload sensitive recordings to public platforms
# like asciinema.org without thorough sanitization
```

**Encrypt for long-term storage**

```bash
# Encrypt recordings for archival
gpg --encrypt --recipient your@email.com session.cast

# Decrypt when needed
gpg --decrypt session.cast.gpg > session.cast
```

### A data-handling policy for recordings

Organizations using RF Swift should set clear rules for:

1. **Retention**: how long recordings are kept.
2. **Storage**: where recordings may be stored securely.
3. **Access**: who can view recordings.
4. **Sharing**: the approval process for sharing.
5. **Disposal**: secure deletion when recordings are no longer needed.

{{< callout type="warning" title="Recordings can compromise the systems you assessed" >}}
Treat recordings with the same security level as penetration-testing reports. Make sure they are:

- stored on encrypted filesystems;
- protected with appropriate access controls;
- never committed to version control systems;
- sanitized before sharing with third parties.
{{< /callout >}}

{{% details title="Recordings in compliance frameworks (PCI DSS, GDPR, SOC 2)" %}}

**PCI DSS**

- Recordings containing cardholder data must be encrypted.
- Access to recordings must be logged and audited.
- Recordings must be included in data retention policies.

**GDPR**

- Recordings may contain personal data.
- Data subjects have rights to access and deletion.
- Document recording purposes in privacy policies.

**SOC 2**

- Recordings can demonstrate security controls.
- Access to recordings must be monitored.
- Include recordings in information security policies.

{{% /details %}}

### A secure recording workflow, end to end

```bash
# 1. Create encrypted storage for recordings
mkdir -p ~/secure-assessments
# Use LUKS, VeraCrypt, or native OS encryption

# 2. Set restrictive permissions
chmod 700 ~/secure-assessments

# 3. Run assessment with recording
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n client-assessment \
  -u 0 \
  -t bridge \
  -a NET_ADMIN \
  --record \
  --record-output ~/secure-assessments/client-2024-01-12.cast

# 4. After assessment, review and sanitize
rfswift log replay -i ~/secure-assessments/client-2024-01-12.cast

# 5. Create sanitized version for client delivery
# (Remove any internal notes, sensitive paths, etc.)
cp client-2024-01-12.cast client-2024-01-12-sanitized.cast
# Edit sanitized version as needed

# 6. Encrypt for archival
gpg --encrypt --recipient security@company.com \
  ~/secure-assessments/client-2024-01-12.cast

# 7. Securely delete original after archival
shred -vfz -n 3 ~/secure-assessments/client-2024-01-12.cast
```

## Best practices at a glance

- **Audit permissions**: regularly review container privileges.
- **Update regularly**: keep RF Swift and images up to date.
- **Separate workloads**: use a dedicated container for each assessment.
- **Remove when done**: delete containers that are no longer needed.
- **Monitor usage**: watch for unusual container behavior.
- **Secure desktops**: always use `--desktop-pass` and `--desktop-ssl` when exposing VNC on the network.
- **Secure recordings**: protect session recordings like sensitive assessment data.
- **Clean up**: delete recordings when they are no longer needed.
- **Encrypt storage**: use encrypted filesystems for recording storage.

## Reporting security issues

If you discover a security vulnerability in RF Swift, please report it responsibly:

1. **Contact the maintainers** privately through [penthertz.com](https://penthertz.com/) for anything exploitable.
2. **Open a GitHub issue** marked "Security Concern" for hardening suggestions.
3. **Join our [Discord](https://discord.gg/NS3HayKrpA)** for security discussions.

{{< callout type="info" title="Security is a balance" >}}
RF Swift needs certain privileges to work, especially with hardware devices. Follow these guidelines to keep that balance safely while protecting sensitive data in recordings and assessments.
{{< /callout >}}
