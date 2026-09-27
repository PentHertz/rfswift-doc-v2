---
title: "rfswift update"
linkTitle: "update"
navGroup: "System"
level: reference
description: "Update the RF Swift binary, or learn how when it came from a package manager."
weight: 93
---

{{< callout type="warning" >}}
**Packaged installs**: on a deb, rpm, pacman or Homebrew install, `rfswift update` explains how to upgrade through the package manager instead of overwriting the packaged binary (which desynced the package database and was reverted by the next package upgrade). Re-running `get_rfswift.sh` also upgrades a packaged install.
{{< /callout >}}

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system update`. The legacy form `rfswift update` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

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

### Basic usage

**Update to latest version:**
```bash
rfswift update
```

**Example output:**
```
Checking for updates...
Current version: v2.1.0
Latest version: v3.0.0
Downloading update...
Installing RF Swift v3.0.0...
✓ Update successful!
RF Swift updated to v3.0.0
```

---

## What gets updated

### Updated components

When you run `rfswift update`:

| Component | Updated? | Location |
|-----------|----------|----------|
| **RF Swift binary** | Yes | `/usr/local/bin/rfswift` |
| **CLI tool** | Yes | Command-line interface |
| **Helper scripts** | Yes | Internal utilities |
| **Documentation** | Yes | Built-in help |

### NOT updated

| Component | Updated? | How to Update |
|-----------|----------|---------------|
| **Docker images** | No | `rfswift image pull` |
| **Containers** | No | `rfswift container upgrade` |
| **User data** | No | Never modified |
| **Configuration** | No | Preserved |

### Update triggers

**When to update:**
- New features announced
- Security updates released
- Bug fixes available
- Before starting new projects
- Monthly maintenance

**When to delay:**
- ⚠️ During active critical work
- ⚠️ In production environments (test first)
- ⚠️ When disconnected/offline

---

## Troubleshooting

### Update failed

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
# Visit: https://github.com/PentHertz/RF-Swift/releases

# Force reinstall if needed
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### Download failed

**Problem:** Cannot download new version

**Solutions:**
```bash
# Check internet connection
curl -I https://github.com

# Check firewall/proxy settings

# Try with sudo
sudo rfswift update
```

### Binary corrupted

**Problem:** Update succeeded but binary doesn't work

**Solutions:**
```bash
# Restore backup
sudo mv /usr/local/bin/rfswift.old /usr/local/bin/rfswift

# Or reinstall
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh

# Verify
rfswift --version
rfswift container last
```

---

## Related commands

- [`images`](/docs/commands/images) - Update Docker images separately
- [`upgrade`](/docs/commands/upgrade) - Upgrade containers to new images
- [`completion`](/docs/commands/completion) - Regenerate completions after update

---

{{< callout >}}
**Regular Updates**: Keep RF Swift updated for the latest features, bug fixes, and security improvements. Updates are automatic and safe - your containers and data are never modified!
{{< /callout >}}

{{< callout type="warning" >}}
**Binary Only**: The `update` command only updates the RF Swift CLI tool, not Docker images or containers. Use `rfswift image pull` to update images and `rfswift container upgrade` to upgrade containers.
{{< /callout >}}

{{< callout type="info" >}}
**Automatic Backup**: The update process automatically backs up your current version to `/usr/local/bin/rfswift.old`, allowing easy rollback if needed!
{{< /callout >}}