---
title: update
weight: 23
prev: /docs/commands/host
next: /docs/commands/completion
---

# rfswift update

Update RF Swift to the latest version from the official Penthertz repository.

## Synopsis

```bash
rfswift update
```

The `update` command downloads and installs the latest version of RF Swift, including the command-line tool and all its components. The update process is automatic and handles backup of the current version.

---

## Options

The `update` command takes no options.

---

## Examples

### Basic Usage

**Update to latest version:**
```bash
rfswift update
```

**Example output:**
```
Checking for updates...
Current version: v0.6.4
Latest version: v0.6.5
Downloading update...
Installing RF Swift v0.6.5...
✓ Update successful!
RF Swift updated to v0.6.5
```

---

## What Gets Updated

### Updated Components

When you run `rfswift update`:

| Component | Updated? | Location |
|-----------|----------|----------|
| **RF Swift binary** | ✅ Yes | `/usr/local/bin/rfswift` |
| **CLI tool** | ✅ Yes | Command-line interface |
| **Helper scripts** | ✅ Yes | Internal utilities |
| **Documentation** | ✅ Yes | Built-in help |

### NOT Updated

| Component | Updated? | How to Update |
|-----------|----------|---------------|
| **Docker images** | ❌ No | `rfswift images pull` |
| **Containers** | ❌ No | `rfswift upgrade` |
| **User data** | ❌ No | Never modified |
| **Configuration** | ❌ No | Preserved |

### Update Triggers

**When to update:**
- ✅ New features announced
- ✅ Security updates released
- ✅ Bug fixes available
- ✅ Before starting new projects
- ✅ Monthly maintenance

**When to delay:**
- ⚠️ During active critical work
- ⚠️ In production environments (test first)
- ⚠️ When disconnected/offline

---

## Troubleshooting

### Update Failed

**Problem:** Update command fails

**Solutions:**
```bash
# Check internet connection
ping github.com

# Check permissions
ls -l /usr/local/bin/rfswift

# Update with sudo if needed
sudo rfswift update

# Check disk space
df -h /usr/local

# Try manual installation
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### Already Up-to-Date

**Problem:** "Already up-to-date" but version seems old

**Solutions:**
```bash
# Check current version
rfswift --version

# Check latest release
# Visit: https://github.com/penthertz/rfswift/releases

# Force reinstall if needed
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### Download Failed

**Problem:** Cannot download new version

**Solutions:**
```bash
# Check internet connection
curl -I https://github.com

# Check firewall/proxy settings

# Try with sudo
sudo rfswift update
```

### Binary Corrupted

**Problem:** Update succeeded but binary doesn't work

**Solutions:**
```bash
# Restore backup
sudo mv /usr/local/bin/rfswift.old /usr/local/bin/rfswift

# Or reinstall
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh

# Verify
rfswift --version
rfswift last
```

---

## Related Commands

- [`images`](/docs/commands/images) - Update Docker images separately
- [`upgrade`](/docs/commands/upgrade) - Upgrade containers to new images
- [`completion`](/docs/commands/completion) - Regenerate completions after update

---

{{< callout emoji="⬆️" >}}
**Regular Updates**: Keep RF Swift updated for the latest features, bug fixes, and security improvements. Updates are automatic and safe - your containers and data are never modified!
{{< /callout >}}

{{< callout type="warning" >}}
**Binary Only**: The `update` command only updates the RF Swift CLI tool, not Docker images or containers. Use `rfswift images pull` to update images and `rfswift upgrade` to upgrade containers.
{{< /callout >}}

{{< callout type="info" >}}
**Automatic Backup**: The update process automatically backs up your current version to `/usr/local/bin/rfswift.old`, allowing easy rollback if needed!
{{< /callout >}}