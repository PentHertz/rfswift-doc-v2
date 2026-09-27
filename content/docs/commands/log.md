---
title: "rfswift log"
linkTitle: "log"
navGroup: "System"
level: reference
description: "Record and replay terminal sessions."
weight: 94
---

`rfswift log` records your terminal sessions and plays them back. Use it to keep evidence of what you did during an assessment, to write tutorials, or to show a colleague how to reproduce a problem. Recordings use `asciinema` (or the `script` command as a fallback), and assessment reports list them automatically.

```bash
rfswift log start
```

{{< callout type="info" >}}
**RF Swift v4 canonical spelling**: `rfswift system log`. The legacy form `rfswift log` still works and prints a notice pointing at the new name. Flags are identical. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

{{< callout type="warning" >}}
A recording captures everything shown in the terminal, including passwords and API keys if they appear on screen. Review a recording before you share it.
{{< /callout >}}

## Synopsis

```bash
rfswift log start [-o OUTPUT_FILE] [--use-script]   # start recording
rfswift log stop                                    # stop recording
rfswift log replay -i INPUT_FILE [-s SPEED]         # play a recording
rfswift log list [--dir DIRECTORY]                  # list recordings
```

You can also record a lab session directly: add `--record` to `rfswift container create` or `rfswift container shell`.

## Subcommands

### log start

Starts recording the terminal.

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-o, --output STRING` | Output file | Auto-generated | `-o my-session.cast` |
| `--use-script` | Use the `script` command instead of asciinema | false | `--use-script` |

### log stop

Stops the current recording and restores the terminal title. It takes no options.

### log replay

Plays a recording back. Give the file with `-i`, or directly as an argument:

```bash
rfswift log replay [-i INPUT_FILE] [-s SPEED]
rfswift log replay session.cast
```

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `-i, --input STRING` | File to replay | None | `-i session.cast` |
| `-s, --speed FLOAT` | Playback speed multiplier | 1.0 | `-s 2.0` |

In an interactive terminal, running it without a file shows a list of your recordings to pick from, with each file's path, recording tool (`asciinema` or `script`), size in KB and date.

### log list

Lists the recordings in a folder.

| Flag | Description | Default | Example |
|------|-------------|---------|---------|
| `--dir STRING` | Folder to search | Current folder | `--dir ~/recordings` |

The list is shown as a table:

```
Session Recordings
┌───┬──────────────────────────────────────────┬───────────┬─────────┬──────────────────┐
│ # │ File                                     │ Tool      │ Size    │ Date             │
├───┼──────────────────────────────────────────┼───────────┼─────────┼──────────────────┤
│ 1 │ rfswift-run-sdr_work-20250115-1430.cast  │ asciinema │ 24.5 KB │ 2025-01-15 14:30 │
│ 2 │ rfswift-exec-debug-20250116-0900.cast    │ asciinema │ 12.1 KB │ 2025-01-16 09:00 │
│ 3 │ rfswift-session-20250117-1100.cast       │ asciinema │ 45.3 KB │ 2025-01-17 11:00 │
└───┴──────────────────────────────────────────┴───────────┴─────────┴──────────────────┘
```

## While a recording runs

- The terminal title changes to `⏺ REC | RF Swift`, as a reminder.
- The environment variable `RFSWIFT_RECORDING=1` is set, so scripts can tell that the session is being recorded.

Without `-o`, the file name depends on how the recording started:

| Started with | File name |
|--------------|-----------|
| `log start` | `rfswift-session-{YYYYMMDD-HHMMSS}.cast` |
| `container create --record` | `rfswift-run-{container_name}-{YYYYMMDD-HHMMSS}.cast` |
| `container shell --record` | `rfswift-exec-{container_name}-{YYYYMMDD-HHMMSS}.cast` |

## Examples

### Basic use

Start a recording (RF Swift prints the file name):

```bash
rfswift log start
# Recording started: rfswift-session-20250112-143015.cast
# Terminal title changes to: ⏺ REC | RF Swift
```

Record to a file name you choose, then stop:

```bash
rfswift log start -o tutorial-wifi-analysis.cast
rfswift log stop
```

Replay it at normal speed, then twice as fast:

```bash
rfswift log replay -i tutorial-wifi-analysis.cast
rfswift log replay -i tutorial-wifi-analysis.cast -s 2.0
```

List the recordings here, or in another folder:

```bash
rfswift log list
rfswift log list --dir ~/rfswift-tutorials
```

### Record a tutorial

Start recording, go through the steps in a lab, stop, and replay to check:

```bash
rfswift log start -o sdr-tutorial-basics.cast

rfswift container create -i penthertz/rfswift_resolute:sdr_full -n tutorial
rfswift container shell -c tutorial
rtl_test -t
# ... demonstrate features ...
exit

rfswift log stop
rfswift log replay -i sdr-tutorial-basics.cast
```

### Record a bug

Record yourself reproducing the problem, then share the `.cast` file with your team:

```bash
rfswift log start -o bug-report-issue-123.cast

rfswift container shell -c production
# ... reproduce bug ...
exit

rfswift log stop
```

## Recording formats

### asciinema (.cast), the default

An asciinema recording keeps the terminal output with its timing, the timing of each keystroke, the terminal size and some environment details. The files are small, replay with exact timing, can be embedded in web pages, and their timing can be edited.

A `.cast` file looks like this:

```json
{"version": 2, "width": 120, "height": 30, "timestamp": 1704981234}
[0.123456, "o", "$ rfswift container create -i sdr_full -n demo\r\n"]
[1.234567, "o", "Container started: demo\r\n"]
```

### script, the fallback

When asciinema isn't available, RF Swift uses the `script` command instead. To use it on purpose:

```bash
rfswift log start --use-script -o session.txt
```

## Playback

### Speed

`-s` sets the speed: above 1 is faster, below 1 is slower.

```bash
rfswift log replay -i session.cast            # normal speed
rfswift log replay -i session.cast -s 2.0     # 2x
rfswift log replay -i session.cast -s 3.0     # 3x
rfswift log replay -i session.cast -s 0.5     # half speed
rfswift log replay -i session.cast -s 0.25    # quarter speed
```

### Pause and step with asciinema

With the asciinema player you can pause and step through a recording:

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

## Sharing recordings

### On asciinema.org

Upload a recording, then embed it in your documentation with the script tag it gives you:

```bash
# Upload to asciinema.org
asciinema upload session.cast

# Returns URL: https://asciinema.org/a/abc123

# Embed in documentation:
# <script src="https://asciinema.org/a/abc123.js" id="asciicast-abc123" async></script>
```

### On your own web server

```bash
# Copy recordings to web server
scp *.cast webserver:/var/www/tutorials/

# Link in documentation
# https://tutorials.example.com/wifi-setup.cast
```

### As a training package

Put the recordings in a folder with a README, and pack it as one archive:

````bash
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
````

## Troubleshooting

### `rfswift log start` fails

Check that asciinema is installed, install it if needed, or record with `script` instead:

```bash
which asciinema

pip install asciinema
# or
apt-get install asciinema  # Ubuntu/Debian
brew install asciinema      # macOS

rfswift log start --use-script
```

### You can't find a recording

Look in the current folder, list recordings here and in your home folder, or search for recent `.cast` files:

```bash
ls -la *.cast
rfswift log list
rfswift log list --dir ~
find ~ -name "*.cast" -mtime -1  # Last 24 hours
```

### A recording doesn't replay

Check that the file exists and isn't damaged, and try playing it with asciinema directly. If recordings keep failing, record with `script` instead:

```bash
ls -l session.cast
file session.cast
asciinema play session.cast
rfswift log start --use-script
```

## Related

- [report](/docs/commands/report): reports list your recordings automatically
- [container shell](/docs/commands/exec) and [container create](/docs/commands/run): `--record`
- [container last](/docs/commands/last)
