---
title: "rfswift update"
linkTitle: "update"
navGroup: "System"
level: reference
description: "Update RF Swift the way it was installed (package manager, Homebrew or binary), with SHA-256 verification."
weight: 93
---

`rfswift update` updates RF Swift itself to the latest release from the official Penthertz repository. It only updates the program: your toolbox images, your labs and your data stay as they are.

```bash
rfswift update           # show what changes, ask, then update
rfswift update --check   # only report whether an update exists
rfswift update --yes     # update without asking (scripts)
```

The update follows the way RF Swift was installed:

| Installed as | How `rfswift update` updates it |
|---|---|
| Debian package | Downloads the release's `.deb` for your architecture and installs it with `apt-get` (or `dpkg`), through `sudo` |
| RPM package | Downloads the release's `.rpm` and installs it with `dnf`, `yum` or `zypper`, through `sudo` |
| Arch package | Downloads the release's `.pkg.tar.zst` and installs it with `pacman`, through `sudo` |
| Homebrew cask | Runs `brew upgrade --cask rfswift` |
| Standalone binary | Replaces the binary in place, with `sudo` when its directory is not writable (e.g. `/usr/local/bin`) |
| Windows installer | Points you to the new installer |

Every download is checked against the release's SHA-256 checksums before anything is installed; a file that does not match, or is not listed, is refused. After installing, RF Swift runs `rfswift --version` to confirm the new version, and warns when another `rfswift` earlier in your `PATH` would still start the old one.

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system update`. The legacy form `rfswift update` still works. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift update [--check] [-y]
```

| Flag | Description |
|---|---|
| `--check` | Only report whether a newer release exists and how it would be installed; change nothing |
| `-y, --yes` | Update without asking (for scripts) |

Without a flag, RF Swift shows what it will do, then asks one Yes/No question.

## Example

The output looks like this (versions and paths are only an example):

```
╭─ Update available ───────────────────────────────────────────╮
│ rfswift 4.0.5 → 4.1.1                                         │
│ Installed as: Debian package at /usr/bin/rfswift              │
│ Release notes: https://github.com/PentHertz/RF-Swift/releases │
╰───────────────────────────────────────────────────────────────╯
The update will:
    1. download rfswift_4.1.1_amd64.deb and check its SHA-256 against the release checksums
    2. install it: sudo apt-get install -y ./rfswift_4.1.1_amd64.deb
Update rfswift 4.0.5 → 4.1.1? [Y/n] y
SHA-256 verified: rfswift_4.1.1_amd64.deb
Running: sudo apt-get install -y ./rfswift_4.1.1_amd64.deb
rfswift updated: 4.0.5 → 4.1.1
```

Other commands also tell you when a release is out, with what to run: `RF Swift 4.1.1 is available (you have 4.0.5). Update with: rfswift update`.

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

Reinstall with the installer, or download the previous release from [GitHub releases](https://github.com/PentHertz/RF-Swift/releases). Then check that it works:

```bash
curl -fsSL "https://raw.githubusercontent.com/PentHertz/RF-Swift/refs/heads/main/get_rfswift.sh" | sh

rfswift --version
rfswift container last
```

## Good to know

- Updates never touch your containers or your data.
- A standalone binary is replaced atomically (the new one is written next to it, then renamed over it), so a failed update never leaves a half-written `rfswift`. On Windows the previous binary is kept as `rfswift.exe.old` until the next update.
- To update toolboxes, use `rfswift image pull`; to move a lab to a newer toolbox, use `rfswift container upgrade`.

## Related

- [image pull](/docs/commands/images): update toolbox images
- [container upgrade](/docs/commands/upgrade): move a lab to a newer image
- [completion](/docs/commands/completion): refresh shell completion after an update
