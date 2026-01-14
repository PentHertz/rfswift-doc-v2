---
title: log
weight: 21
prev: /docs/commands/cleanup
next: /docs/commands/host
---

# rfswift log

Record and replay terminal sessions for documentation and training.

## Synopsis

```bash
# Start recording a session
rfswift log start [-o OUTPUT_FILE] [--use-script]

# Stop recording
rfswift log stop

# Replay a recorded session
rfswift log replay -i INPUT_FILE [-s SPEED]

# List recorded sessions
rfswift log list [--dir DIRECTORY]
```

The `log` command records RF Swift terminal sessions using `asciinema` (or the `script` command as fallback). This is perfect for creating tutorials, documenting workflows, or sharing demonstrations.

---

## Subcommands

### log start

Start recording a terminal session.

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-o, --output STRING` | Output file path | Auto-generated | `-o my-session.cast` |
| `--use-script` | Force use of `script` command | false | `--use-script` |

### log stop

Stop the currently active recording session.

**No options required.**

### log replay

Replay a previously recorded session.

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-i, --input STRING` | Input file to replay | Required | `-i session.cast` |
| `-s, --speed FLOAT` | Playback speed multiplier | 1.0 | `-s 2.0` |

### log list

List all recorded session files in a directory.

**Options:**

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--dir STRING` | Directory to search | Current directory | `--dir ~/recordings` |

---

## Examples

### Basic Usage

**Start recording:**
```bash
rfswift log start
# Recording started: rfswift-session-20240112-143015.cast
```

**Start recording with custom filename:**
```bash
rfswift log start -o tutorial-wifi-analysis.cast
```

**Stop recording:**
```bash
rfswift log stop
```

**Replay a session:**
```bash
rfswift log replay -i tutorial-wifi-analysis.cast
```

**Replay at 2x speed:**
```bash
rfswift log replay -i tutorial-wifi-analysis.cast -s 2.0
```

**List all recordings:**
```bash
rfswift log list
```

**List recordings in specific directory:**
```bash
rfswift log list --dir ~/rfswift-tutorials
```

### Real-World Scenarios

**Create a tutorial:**
```bash
# Start recording
rfswift log start -o sdr-tutorial-basics.cast

# Perform tutorial steps
rfswift run -i penthertz/rfswift:sdr_full -n tutorial
rfswift exec -c tutorial
rtl_test -t
# ... demonstrate features ...
exit

# Stop recording
rfswift log stop

# Replay to verify
rfswift log replay -i sdr-tutorial-basics.cast
```

**Document a bug:**
```bash
# Record the problem
rfswift log start -o bug-report-issue-123.cast

# Reproduce the issue
rfswift exec -c production
# ... reproduce bug ...
exit

# Stop recording
rfswift log stop

# Share bug-report-issue-123.cast with team
```

---

## Recording Format

### Asciinema Format (.cast)

By default, RF Swift uses asciinema format, which records:
- Terminal output with timing information
- Exact keystroke timing
- Terminal dimensions
- Environment metadata

**Advantages:**
- Compact file size
- Precise timing reproduction
- Web-embeddable
- Editable timing

**Example .cast file:**
```json
{"version": 2, "width": 120, "height": 30, "timestamp": 1704981234}
[0.123456, "o", "$ rfswift run -i sdr_full -n demo\r\n"]
[1.234567, "o", "Container started: demo\r\n"]
```

### Script Format (Fallback)

When asciinema is not available, RF Swift falls back to the `script` command:

**Use `--use-script` flag to force:**
```bash
rfswift log start --use-script -o session.txt
```

---

## Playback Control

### Speed Control

```bash
# Normal speed (1.0x)
rfswift log replay -i session.cast

# Fast playback (2x)
rfswift log replay -i session.cast -s 2.0

# Very fast (3x)
rfswift log replay -i session.cast -s 3.0

# Slow playback (0.5x)
rfswift log replay -i session.cast -s 0.5

# Very slow (0.25x)
rfswift log replay -i session.cast -s 0.25
```

### Interactive Playback

If using asciinema format, you can use asciinema player for interactive control:

```bash
# Install asciinema
pip install asciinema

# Play with controls
asciinema play session.cast

# Controls during playback:
# Space - Pause/Resume
# . - Step forward
# Ctrl+C - Exit
```

---

## Sharing Recordings

### Web Embedding (Asciinema)

```bash
# Upload to asciinema.org
asciinema upload session.cast

# Returns URL: https://asciinema.org/a/abc123

# Embed in documentation:
# <script src="https://asciinema.org/a/abc123.js" id="asciicast-abc123" async></script>
```

### Self-Hosting

```bash
# Copy recordings to web server
scp *.cast webserver:/var/www/tutorials/

# Link in documentation
# https://tutorials.example.com/wifi-setup.cast
```

### Distribution

```bash
# Create distribution package
mkdir -p rfswift-training-package
cp ~/recordings/*.cast rfswift-training-package/

# Add README
cat > rfswift-training-package/README.md << 'EOF'
# RF Swift Training Materials

## Lessons
1. basics.cast - RF Swift basics
2. wifi-analysis.cast - WiFi analysis
3. sdr-setup.cast - SDR setup

## Playback
```bash
rfswift log replay -i lesson-name.cast
```
EOF

# Package
tar czf rfswift-training.tar.gz rfswift-training-package/

# Distribute
# Share rfswift-training.tar.gz with team

---

## Troubleshooting

### Recording Not Starting

**Problem:** `rfswift log start` fails

**Solutions:**
```bash
# Check if asciinema is installed
which asciinema

# Install asciinema
pip install asciinema
# or
apt-get install asciinema  # Ubuntu/Debian
brew install asciinema      # macOS

# Use script command as fallback
rfswift log start --use-script
```

### Recording File Not Found

**Problem:** Cannot find recorded file

**Solutions:**
```bash
# Check current directory
ls -la *.cast

# List all recordings
rfswift log list

# Check in home directory
rfswift log list --dir ~

# Find by date
find ~ -name "*.cast" -mtime -1  # Last 24 hours
```

### Replay Not Working

**Problem:** Cannot replay session

**Solutions:**
```bash
# Check file exists
ls -l session.cast

# Verify file is not corrupted
file session.cast

# Try with asciinema directly
asciinema play session.cast

# Use script format instead
rfswift log start --use-script
```

---

## Related Commands

- [`exec`](/docs/commands/exec) - Execute commands that can be recorded
- [`run`](/docs/commands/run) - Run containers to record
- [`last`](/docs/commands/last) - Show containers for recording sessions

---

{{< callout emoji="🎬" >}}
**Perfect for Training**: The `log` command is ideal for creating training materials. Record once, share with your entire team. Students can replay at their own pace with speed control!
{{< /callout >}}

{{< callout type="warning" >}}
**Sensitive Information**: Recordings capture everything displayed in the terminal, including passwords and API keys if shown. Review recordings before sharing publicly!
{{< /callout >}}

{{< callout type="info" >}}
**Asciinema vs Script**: RF Swift prefers asciinema format (.cast) for its precise timing and web-embeddable features. The script command is available as a fallback with `--use-script`.
{{< /callout >}}