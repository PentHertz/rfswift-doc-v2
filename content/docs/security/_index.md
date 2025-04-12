---
linkTitle: 🛡️ Security
title: RF Swift Security Guidelines
prev: /docs/guide
next: /docs/security/guide_lines
weight: 4
---

# 🛡️ RF Swift Security Guidelines

Security is a critical consideration when using RF Swift, as containerized environments often require special permissions to access hardware devices and network interfaces. This section provides comprehensive guidance on securing your RF Swift deployments while maintaining full functionality.

## Why Security Matters for RF Swift

Radio frequency and hardware security work inherently requires elevated privileges. Balancing functionality with security is essential to:

- 🔒 Protect your host system from container exploits
- 🛡️ Prevent lateral movement if a container is compromised
- 🔍 Maintain isolation between different testing environments
- 🧰 Allow tools to function correctly with minimum necessary privileges

## Key Security Areas

{{< cards >}}
  {{< card link="guide_lines" title="Security Guidelines" icon="shield-check" subtitle="Essential security practices for RF Swift" >}}
{{< /cards >}}

## Security Quick Reference

| Setting | Command | Security Impact |
|---------|---------|----------------|
| Unprivileged Mode | `rfswift run -u 0` | ✅ Recommended: Reduces container privileges |
| Minimal Capabilities | `rfswift run -a NET_ADMIN` | ✅ Recommended: Only add required capabilities |
| Network Isolation | `rfswift run -t bridge` | ✅ Recommended: Isolates container network |
| Device Restrictions | `rfswift run -g "c 189:* rwm"` | ✅ Recommended: Limit device access |
| Privileged Mode | `rfswift run -u 1` | ⚠️ High Risk: Grants extensive privileges |
| Default Network | `rfswift run -t host` | ⚠️ Medium Risk: Shares host network stack |

## Container Security Philosophy

With RF Swift you can also adopt a security philosophy of:

1. **Principle of Least Privilege**: Containers start with minimal privileges
2. **Dynamic Enhancement**: Add capabilities only when needed
3. **Separation of Concerns**: Use dedicated containers for different tasks
4. **Defense in Depth**: Multiple security layers working together

## Best Practices at a Glance

- 🔍 **Audit Permissions**: Regularly review container privileges
- 🔄 **Update Regularly**: Keep RF Swift and images updated
- 🧩 **Separate Workloads**: Use dedicated containers for each assessment
- 🚪 **Remove When Done**: Delete containers that are no longer needed
- 🔒 **Monitor Usage**: Watch for unusual container behavior

## Reporting Security Issues

If you discover a security vulnerability in RF Swift, please report it responsibly by:

1. **Creating a GitHub Issue** marked as "Security Concern"
2. **Join our Discord** for security discussions
3. **Contact Project Maintainers** directly for critical vulnerabilities

{{< callout emoji="⚠️" >}}
Remember that security is a balance. RF Swift needs certain privileges to function correctly, especially when working with hardware devices. Follow these guidelines to maintain that balance safely.
{{< /callout >}}