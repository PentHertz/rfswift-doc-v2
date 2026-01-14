---
linkTitle: 📘 Commands
title: RF Swift Command Reference
next: /docs/commands/run
prev: /docs/container_scripts/
weight: 5
cascade:
  type: docs
---

# RF Swift Command Reference

Complete reference for all RF Swift commands. Each command has its own dedicated page with syntax, options, and examples.

{{< callout type="info" >}}
**Quick Help**: Use `rfswift [command] --help` for instant command help.
{{< /callout >}}

---

## 🔌 Global Flags

### Disconnected Mode

All RF Swift commands support the `-q` or `--disconnect` flag to disable update checks when working offline or in air-gapped environments:

```bash
# Work without querying for updates
rfswift -q run -i sdr_full -n work
rfswift --disconnect last
rfswift -q images local

# Useful for:
# - Offline/air-gapped systems
# - Avoiding network delays
# - Scripting/automation
# - Systems behind firewalls
```

When disconnected mode is enabled, RF Swift skips checking for new versions and runs immediately without any network queries. All functionality remains available - only the update notification system is disabled.

---

## 📋 Command Categories

### 🐳 Container Management

{{< cards >}}
  {{< card link="run" title="run" icon="play" subtitle="Create and start a new container" >}}
  {{< card link="exec" title="exec" icon="terminal" subtitle="Execute commands in a running container" >}}
  {{< card link="stop" title="stop" icon="pause" subtitle="Stop a running container" >}}
  {{< card link="remove" title="remove" icon="trash" subtitle="Remove a container" >}}
  {{< card link="rename" title="rename" icon="pencil" subtitle="Rename a container" >}}
  {{< card link="commit" title="commit" icon="save" subtitle="Save container as new image" >}}
{{< /cards >}}

### 🖼️ Image Management

{{< cards >}}
  {{< card link="images" title="images" icon="photograph" subtitle="Manage RF Swift images (pull, list, search)" >}}
  {{< card link="build" title="build" icon="beaker" subtitle="Build image from YAML recipe" >}}
  {{< card link="delete" title="delete" icon="x" subtitle="Delete an image" >}}
  {{< card link="retag" title="retag" icon="tag" subtitle="Rename an image tag" >}}
  {{< card link="download" title="download" icon="download" subtitle="Download and save image to tar.gz" >}}
  {{< card link="import" title="import" icon="upload" subtitle="Import containers or images" >}}
  {{< card link="export" title="export" icon="share" subtitle="Export containers or images" >}}
{{< /cards >}}

### ⚙️ Dynamic Configuration

{{< cards >}}
  {{< card link="bindings" title="bindings" icon="link" subtitle="Manage device and volume bindings" >}}
  {{< card link="capabilities" title="capabilities" icon="shield-check" subtitle="Manage Linux capabilities" >}}
  {{< card link="cgroups" title="cgroups" icon="adjustments" subtitle="Manage cgroup device rules" >}}
  {{< card link="ports" title="ports" icon="server" subtitle="Manage container ports" >}}
{{< /cards >}}

### 📹 Session Recording

{{< cards >}}
  {{< card link="log" title="log" icon="film" subtitle="Record and replay terminal sessions" >}}
{{< /cards >}}

### 🔧 System Operations

{{< cards >}}
  {{< card link="host" title="host" icon="desktop-computer" subtitle="Host system configuration" >}}
  {{< card link="update" title="update" icon="refresh" subtitle="Update RF Swift binary" >}}
  {{< card link="completion" title="completion" icon="code" subtitle="Generate shell completion scripts" >}}
  {{< card link="install" title="install" icon="puzzle" subtitle="Install helper scripts" >}}
{{< /cards >}}

### 🛠️ Utilities

{{< cards >}}
  {{< card link="last" title="last" icon="clock" subtitle="Show recently used containers" >}}
  {{< card link="cleanup" title="cleanup" icon="trash" subtitle="Clean up old containers and images" >}}
  {{< card link="upgrade" title="upgrade" icon="arrow-up" subtitle="Upgrade container to new image" >}}
{{< /cards >}}

---

## 🚀 Quick Reference

| Command | Purpose |
|---------|---------|
| `rfswift run -i IMAGE -n NAME` | Create new container |
| `rfswift exec -c CONTAINER` | Enter container |
| `rfswift last` | List recent containers |
| `rfswift bindings add -c CONTAINER -d -t DEVICE` | Add device |
| `rfswift capabilities add -c CONTAINER -a CAP` | Add capability |
| `rfswift ports bind -c CONTAINER -p PORT` | Bind port |
| `rfswift images pull -i IMAGE` | Download image |
| `rfswift build -r RECIPE.yaml` | Build from recipe |
| `rfswift log replay -i FILE.cast` | Replay session |
| `rfswift update` | Update RF Swift |

---

## 🆘 Getting Help

```bash
rfswift --help              # All commands
rfswift run --help          # Specific command
rfswift bindings add --help # Subcommand
```

---

{{< callout emoji="💡" >}}
**New to RF Swift?** Start with the [Quick Start Guide](/docs/quick-start/) before diving into command details.
{{< /callout >}}