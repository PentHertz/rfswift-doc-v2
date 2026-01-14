---
title: completion
weight: 24
prev: /docs/commands/update
next: /docs/commands/install
---

# rfswift completion

Generate and install shell completion scripts for tab-completion.

## Synopsis

```bash
# Auto-detect shell and install
rfswift completion

# Install for specific shell
rfswift completion bash
rfswift completion zsh
rfswift completion fish
rfswift completion powershell
```

The `completion` command generates and installs tab-completion scripts for your shell, enabling command, flag, and argument completion when you press Tab.

---

## Examples

### Basic Usage

**Auto-detect and install:**
```bash
rfswift completion
# Detected shell: bash
# Installing completion script to /etc/bash_completion.d/rfswift
# ✓ Completion script installed successfully
```

**Install for specific shell:**
```bash
# Bash
rfswift completion bash

# Zsh
rfswift completion zsh

# Fish
rfswift completion fish

# PowerShell
rfswift completion powershell
```

---

## Installation Locations

### Bash

**System-wide (requires sudo):**
```
/etc/bash_completion.d/rfswift
```

**User-specific:**
```
~/.bash_completion.d/rfswift
~/.bash_completion
```

**Enable in ~/.bashrc:**
```bash
# Add if not already present
[[ -f ~/.bash_completion ]] && source ~/.bash_completion
```

### Zsh

**Common locations:**
```
~/.zsh/completion/_rfswift
~/.oh-my-zsh/completions/_rfswift
/usr/local/share/zsh/site-functions/_rfswift
${fpath[1]}/_rfswift
```

**Enable in ~/.zshrc:**
```bash
# Add completion directory to fpath
fpath=(~/.zsh/completion $fpath)

# Initialize completion system
autoload -Uz compinit
compinit
```

### Fish

**Location:**
```
~/.config/fish/completions/rfswift.fish
```

**No additional configuration needed** - Fish loads completions automatically.

### PowerShell

**Profile location:**
```powershell
# Check profile path
echo $PROFILE

# Typical locations:
# Windows PowerShell: 
#   ~\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
# PowerShell Core:
#   ~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

**Enable in profile:**
```powershell
# Add to profile
. "C:\Path\To\CompletionScripts\rfswift.ps1"
```

---

## How Completion Works

### What Gets Completed

**Commands:**
```bash
rfswift <Tab>
# Shows: run, exec, stop, remove, images, last, etc.
```

**Subcommands:**
```bash
rfswift images <Tab>
# Shows: local, remote, pull
```

**Flags:**
```bash
rfswift run -<Tab>
# Shows: -i, -n, -b, -p, -d, etc.
```

**Container names:**
```bash
rfswift exec -c <Tab>
# Shows: container1, container2, container3, etc.
```

**Image names:**
```bash
rfswift run -i <Tab>
# Shows: penthertz/rfswift_noble:sdr_full, penthertz/rfswift_noble:wifi, etc.
```

### Completion Features

**Smart completion:**
- Only shows relevant options for current context
- Completes container names from running containers
- Completes image names from local images
- Suggests common values for flags

---

## Troubleshooting

### Completion Not Working

**Problem:** Tab completion doesn't work

**Solutions:**

**For Bash:**
```bash
# Check if completion file exists
ls -la ~/.bash_completion.d/rfswift
ls -la ~/.bash_completion

# Check if sourced in .bashrc
grep bash_completion ~/.bashrc

# Add if missing
echo '[[ -f ~/.bash_completion ]] && source ~/.bash_completion' >> ~/.bashrc

# Reload
source ~/.bashrc
```

**For Zsh:**
```bash
# Check if completion file exists
ls -la ~/.zsh/completion/_rfswift

# Check fpath
echo $fpath

# Add completion directory to .zshrc
cat >> ~/.zshrc << 'EOF'
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit
compinit
EOF

# Reload
source ~/.zshrc
```

**For Fish:**
```bash
# Check if completion file exists
ls -la ~/.config/fish/completions/rfswift.fish

# Reload completions
fish_update_completions

# Restart fish
exec fish
```

### Permission Denied

**Problem:** Cannot write completion file

**Solutions:**
```bash
# Check permissions
ls -ld /etc/bash_completion.d

# Install to user directory instead
rfswift completion bash
# Will install to ~/.bash_completion.d/

# Or use sudo for system-wide
sudo rfswift completion bash
```

### Old Completions Cached

**Problem:** Completions show old commands

**Solutions:**

**Bash:**
```bash
# Clear completion cache
complete -r rfswift

# Reinstall
rfswift completion bash

# Reload
source ~/.bashrc
```

**Zsh:**
```bash
# Remove compiled completion files
rm -f ~/.zcompdump*

# Reinstall
rfswift completion zsh

# Rebuild cache
autoload -Uz compinit
compinit

# Reload
source ~/.zshrc
```

**Fish:**
```bash
# Clear fish cache
rm -rf ~/.cache/fish/

# Reinstall
rfswift completion fish

# Restart
exec fish
```

### Completions Conflict

**Problem:** Completions conflict with other tools

**Solutions:**
```bash
# Check what provides rfswift completion
complete -p rfswift  # Bash
which -a rfswift     # Check multiple installations

# Remove conflicting completion
rm /path/to/conflicting/completion

# Reinstall correct one
rfswift completion
```

### Shell Not Detected

**Problem:** Auto-detection fails

**Solutions:**
```bash
# Specify shell explicitly
rfswift completion bash

# Or set SHELL variable
export SHELL=/bin/bash
rfswift completion
```

---

## Related Commands

- [`update`](/docs/commands/update) - Update RF Swift (refresh completions after)
- [`install`](/docs/commands/install) - Install function scripts

---

{{< callout emoji="⌨️" >}}
**Productivity Boost**: Tab-completion dramatically improves workflow efficiency. Press Tab to complete commands, flags, container names, and image names automatically!
{{< /callout >}}

{{< callout type="warning" >}}
**Reload Required**: After installing completions, you must reload your shell configuration (`source ~/.bashrc` or restart terminal) before tab-completion will work.
{{< /callout >}}

{{< callout type="info" >}}
**Auto-Detection**: Running `rfswift completion` without arguments automatically detects your shell and installs the appropriate completion script. You can also specify the shell explicitly!
{{< /callout >}}