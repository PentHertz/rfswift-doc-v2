---
title: "rfswift update"
linkTitle: "update"
navGroup: "System"
level: reference
description: "Update the RF Swift binary, or learn how when it came from a package manager."
weight: 93
---

`rfswift update` updates RF Swift itself to the latest release from the official Penthertz repository. It only updates the program: your toolbox images, your labs and your data stay as they are.

```bash
rfswift update
```

{{< callout type="warning" >}}
**Installed from a package?** On a deb, rpm, pacman or Homebrew install, `rfswift update` tells you how to upgrade through your package manager instead of overwriting the packaged binary. (Overwriting it put the package database out of sync, and the next package upgrade reverted it.) Running `get_rfswift.sh` again also upgrades a packaged install.
{{< /callout >}}

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system update`. The legacy form `rfswift update` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift update
```

It takes no options. It downloads and installs the latest version of RF Swift and all its components, and keeps a backup of the current version.

## Example

The output looks like this (the version numbers are only an example):

```
Checking for updates...
Current version: v2.1.0
Latest version: v3.0.0
Downloading update...
Installing RF Swift v3.0.0...
✓ Update successful!
RF Swift updated to v3.0.0
```

## What gets updated

| Component | Updated? | Location |
|-----------|----------|----------|
| **RF Swift binary** | Yes | `/usr/local/bin/rfswift` |
| **CLI tool** | Yes | Command-line interface |
| **Helper scripts** | Yes | Internal utilities |
| **Documentation** | Yes | Built-in help |

### What does not change

| Component | Updated? | How to update it |
|-----------|----------|------------------|
| **Docker images** | No | `rfswift image pull` |
| **Containers** | No | `rfswift container upgrade` |
| **User data** | No | Never modified |
| **Configuration** | No | Kept as is |

## When to update

Good moments:

- when new features are announced;
- when security or bug fixes are released;
- before starting a new project;
- as part of monthly maintenance.

Better to wait:

- in the middle of critical work;
- on production machines (test the update first);
- when you are offline.

## Troubleshooting

### The update fails

Check your internet connection, the permissions and free space where RF Swift is installed, then try again (with `sudo` if needed). You can also reinstall with the installer:

```bash
ping github.com
ls -l /usr/local/bin/rfswift
sudo rfswift update
df -h /usr/local
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### "Already up-to-date", but the version seems old

Check your version against the [latest release](https://github.com/PentHertz/RF-Swift/releases). If needed, reinstall with the installer:

```bash
rfswift --version
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh
```

### The download fails

Check that GitHub is reachable, and your firewall or proxy settings. Then try again with `sudo`:

```bash
curl -I https://github.com
sudo rfswift update
```

### The update finished, but `rfswift` no longer works

Put the backup back, or reinstall. Then check that it works:

```bash
sudo mv /usr/local/bin/rfswift.old /usr/local/bin/rfswift
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh

rfswift --version
rfswift container last
```

## Good to know

- Updates never touch your containers or your data.
- The update keeps a backup of the previous version at `/usr/local/bin/rfswift.old`, so you can roll back.
- To update toolboxes, use `rfswift image pull`; to move a lab to a newer toolbox, use `rfswift container upgrade`.

## Related

- [image pull](/docs/commands/images): update toolbox images
- [container upgrade](/docs/commands/upgrade): move a lab to a newer image
- [completion](/docs/commands/completion): refresh shell completion after an update
