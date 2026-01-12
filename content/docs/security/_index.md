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
- 📹 Safeguard sensitive data in session recordings
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
| Session Recording | `rfswift run --record` | ⚠️ Data Sensitivity: May capture credentials and sensitive information |
| Privileged Mode | `rfswift run -u 1` | ⚠️ High Risk: Grants extensive privileges |
| Default Network | `rfswift run -t host` | ⚠️ Medium Risk: Shares host network stack |
## Container Security Philosophy
With RF Swift you can also adopt a security philosophy of:
1. **Principle of Least Privilege**: Containers start with minimal privileges
2. **Dynamic Enhancement**: Add capabilities only when needed
3. **Separation of Concerns**: Use dedicated containers for different tasks
4. **Defense in Depth**: Multiple security layers working together
5. **Data Protection**: Secure handling of session recordings and sensitive data
## Session Recording Security
RF Swift's session recording feature provides valuable documentation capabilities, but recordings may contain sensitive information that requires careful handling.

### What Gets Recorded
Session recordings capture everything displayed in your terminal, including:
- ✅ Commands and their outputs
- ✅ Tool execution results
- ✅ System information and configuration details
- ⚠️ **Credentials** entered in plaintext
- ⚠️ **API keys** and tokens
- ⚠️ **Target system information**
- ⚠️ **Exploit code** and techniques
- ⚠️ **Network traffic analysis** results

### Recording Security Best Practices

**Storage and Access Control:**
```bash
# Store recordings in protected directories
mkdir -p ~/assessments/recordings
chmod 700 ~/assessments/recordings

# Record to protected location
rfswift run -i sdr_full -n assessment --record \
  --record-output ~/assessments/recordings/client-session.cast

# Set appropriate permissions
chmod 600 ~/assessments/recordings/client-session.cast
```

**Avoid Recording Sensitive Operations:**
```bash
# For sensitive credential entry, pause recording
rfswift log stop

# Manually enter credentials without recording
# ...

# Resume recording after sensitive operations
rfswift log start -o continued-session.cast
```

**Sanitization Before Sharing:**
```bash
# Review recordings before sharing
rfswift log replay -i session.cast

# Edit recordings to remove sensitive data if needed
# (Consider using asciinema tools or manual editing)

# Never upload sensitive recordings to public platforms
# like asciinema.org without thorough sanitization
```

**Encryption for Long-term Storage:**
```bash
# Encrypt recordings for archival
gpg --encrypt --recipient your@email.com session.cast

# Decrypt when needed
gpg --decrypt session.cast.gpg > session.cast
```

### Recording Data Handling Policy

Organizations using RF Swift should establish clear policies:

1. **Retention**: Define how long recordings are kept
2. **Storage**: Specify secure storage locations
3. **Access**: Control who can view recordings
4. **Sharing**: Establish approval processes for sharing
5. **Disposal**: Secure deletion when no longer needed

{{< callout type="warning" >}}
**Critical Security Warning**: Session recordings may contain enough information to compromise assessed systems. Treat recordings with the same security level as penetration testing reports and ensure they are:
- Stored on encrypted filesystems
- Protected with appropriate access controls
- Never committed to version control systems
- Sanitized before sharing with third parties
{{< /callout >}}

### Recording in Compliance Frameworks

For regulated environments:

**PCI DSS Considerations:**
- Recordings containing cardholder data must be encrypted
- Access to recordings must be logged and audited
- Recordings must be included in data retention policies

**GDPR Considerations:**
- Recordings may contain personal data
- Data subjects have rights to access and deletion
- Document recording purposes in privacy policies

**SOC 2 Considerations:**
- Recordings can demonstrate security controls
- Access to recordings must be monitored
- Include recordings in information security policies

## Best Practices at a Glance
- 🔍 **Audit Permissions**: Regularly review container privileges
- 🔄 **Update Regularly**: Keep RF Swift and images updated
- 🧩 **Separate Workloads**: Use dedicated containers for each assessment
- 🚪 **Remove When Done**: Delete containers that are no longer needed
- 🔒 **Monitor Usage**: Watch for unusual container behavior
- 📹 **Secure Recordings**: Protect session recordings like sensitive assessment data
- 🗑️ **Clean Up**: Delete recordings when they are no longer needed
- 🔐 **Encrypt Storage**: Use encrypted filesystems for recording storage

## Secure Recording Workflow Example

Here's a complete secure workflow for using RF Swift with recording:

```bash
# 1. Create encrypted storage for recordings
mkdir -p ~/secure-assessments
# Use LUKS, VeraCrypt, or native OS encryption

# 2. Set restrictive permissions
chmod 700 ~/secure-assessments

# 3. Run assessment with recording
rfswift run -i penthertz/rfswift:sdr -n client-assessment \
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

## Reporting Security Issues
If you discover a security vulnerability in RF Swift, please report it responsibly by:
1. **Creating a GitHub Issue** marked as "Security Concern"
2. **Join our Discord** for security discussions
3. **Contact Project Maintainers** directly for critical vulnerabilities

{{< callout emoji="⚠️" >}}
Remember that security is a balance. RF Swift needs certain privileges to function correctly, especially when working with hardware devices. Follow these guidelines to maintain that balance safely while protecting sensitive data in recordings and assessments.
{{< /callout >}}