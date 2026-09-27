---
title: "rfswift completion"
linkTitle: "completion"
navGroup: "System"
level: reference
description: "Generate and install shell completion for bash, zsh and fish."
weight: 95
---

Shell completion lets you press <kbd>Tab</kbd> to complete `rfswift` commands, flags, container names and image names. `rfswift completion` installs it for your shell. It covers the whole v4 command tree, including the package names of `rfswift env install`.

If you installed RF Swift from a Linux package (deb, rpm, pacman), bash, zsh and fish completion is already installed.

```bash
rfswift completion        # detects your shell and installs completion
```

After installing, reload your shell (`source ~/.bashrc`, or open a new terminal) before <kbd>Tab</kbd> works.

## Synopsis

```bash
rfswift completion              # detect the shell and install
rfswift completion bash
rfswift completion zsh
rfswift completion fish
rfswift completion powershell
```

`rfswift completion bash|zsh|fish --install` writes the script into your platform's completion folder for you.

## Examples

Without an argument, RF Swift detects your shell and installs the script:

```bash
rfswift completion
# Detected shell: bash
# Installing completion script to /etc/bash_completion.d/rfswift
# ✓ Completion script installed successfully
```

Or name the shell yourself:

```bash
rfswift completion bash
rfswift completion zsh
rfswift completion fish
rfswift completion powershell
```

## Where the scripts go

### Bash

System-wide (needs sudo): `/etc/bash_completion.d/rfswift`. For your user only: `~/.bash_completion.d/rfswift` or `~/.bash_completion`.

Make sure your `~/.bashrc` loads it:

```bash
[[ -f ~/.bash_completion ]] && source ~/.bash_completion
```

### Zsh

Usual locations:

```
~/.zsh/completion/_rfswift
~/.oh-my-zsh/completions/_rfswift
/usr/local/share/zsh/site-functions/_rfswift
${fpath[1]}/_rfswift
```

Make sure your `~/.zshrc` adds the folder and starts the completion system:

```bash
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit
compinit
```

### Fish

`~/.config/fish/completions/rfswift.fish`. Fish loads it automatically; nothing else to set up.

### PowerShell

Find your profile, then load the completion script from it:

```powershell
# Check profile path
echo $PROFILE

# Typical locations:
# Windows PowerShell:
#   ~\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
# PowerShell Core:
#   ~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

```powershell
. "C:\Path\To\CompletionScripts\rfswift.ps1"
```

## What completes

Commands and command groups:

```bash
rfswift <Tab>
# Shows: container, image, env, config, host, usb, audit, ...
```

Subcommands:

```bash
rfswift image <Tab>
# Shows: local, remote, pull
```

Flags:

```bash
rfswift container create -<Tab>
# Shows: -i, -n, -b, -p, -d, etc.
```

Container names:

```bash
rfswift container shell -c <Tab>
# Shows: container1, container2, container3, etc.
```

Image names:

```bash
rfswift container create -i <Tab>
# Shows: penthertz/rfswift_resolute:sdr_full, penthertz/rfswift_resolute:wifi, etc.
```

Completion only offers what makes sense at that point: container names from your containers, image names from your local images, and common values for flags.

## Troubleshooting

### <kbd>Tab</kbd> does nothing

Check that the completion file exists and that your shell loads it, then reload your shell.

Bash:

```bash
ls -la ~/.bash_completion.d/rfswift
ls -la ~/.bash_completion
grep bash_completion ~/.bashrc
echo '[[ -f ~/.bash_completion ]] && source ~/.bash_completion' >> ~/.bashrc
source ~/.bashrc
```

Zsh:

```bash
ls -la ~/.zsh/completion/_rfswift
echo $fpath

cat >> ~/.zshrc << 'EOF'
fpath=(~/.zsh/completion $fpath)
autoload -Uz compinit
compinit
EOF

source ~/.zshrc
```

Fish:

```bash
ls -la ~/.config/fish/completions/rfswift.fish
fish_update_completions
exec fish
```

### "Permission denied" when installing

The system-wide folder needs root. Check it, then either install for your user only or use `sudo`:

```bash
ls -ld /etc/bash_completion.d
rfswift completion bash          # installs to ~/.bash_completion.d/
sudo rfswift completion bash     # system-wide
```

### Completion still shows old commands

Clear the cached completion, install it again and reload.

Bash:

```bash
complete -r rfswift
rfswift completion bash
source ~/.bashrc
```

Zsh:

```bash
rm -f ~/.zcompdump*
rfswift completion zsh
autoload -Uz compinit
compinit
source ~/.zshrc
```

Fish:

```bash
rm -rf ~/.cache/fish/
rfswift completion fish
exec fish
```

### Another tool's completion gets in the way

Find which completion is active and whether several `rfswift` binaries are installed, remove the conflicting one, and install again:

```bash
complete -p rfswift  # Bash
which -a rfswift     # Check multiple installations
rm /path/to/conflicting/completion
rfswift completion
```

### Your shell isn't detected

Name the shell yourself, or set `SHELL`:

```bash
rfswift completion bash

export SHELL=/bin/bash
rfswift completion
```

## Related

- [update](/docs/commands/update): refresh completion after an update
- [container install](/docs/commands/install)
