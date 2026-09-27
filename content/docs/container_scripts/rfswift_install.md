---
title: "RF scripts update utility"
linkTitle: "RF scripts update"
level: advanced
description: "Keep the RF Swift installation scripts in sync with the latest versions from the official repository."
weight: 8
---

`update_rfscripts` downloads the latest RF Swift installation scripts from the official repository and syncs them into a local `scripts` folder. You get new tools and fixes without downloading and managing script files by hand.

Run it:

- after a new RF Swift release;
- when you need a tool that was added recently;
- when you think your scripts are out of date;
- before starting a new assessment.

```bash
update_rfscripts
```

It needs no root privileges: run it from your home folder and the scripts land in `~/scripts`.

## What it does

1. Creates the `scripts` folder if it does not exist.
2. Downloads the latest scripts from the [RF-Swift-images](https://github.com/PentHertz/RF-Swift-images) repository.
3. Syncs them into the folder: new files are added, existing ones updated.
4. Makes the scripts executable.
5. Removes its temporary files.

## What you will see

The messages are coloured by type:

| Colour | Meaning |
|---|---|
| Yellow | A directory is being created |
| Blue | Progress: files being downloaded and copied |
| Red | An error |
| Green | The update finished successfully |

Example output:

```
Fetching file list from https://github.com/PentHertz/RF-Swift-images
Updating scripts in /home/user/scripts
sending incremental file list
./
automotive_software.sh
cal_devices.sh
common.sh
corebuild.sh
entrypoint.sh
gr_oot_modules.sh
lab_software.sh
reverse_software.sh
...
Cleaning up temporary files
Update completed successfully.
```

## Use the updated scripts

The scripts are in `~/scripts/`. Run one directly, or add the folder to your `PATH`:

```bash
# Run a specific script
~/scripts/entrypoint.sh tool_name_install

# Or add to your PATH for easier access
echo 'export PATH="$HOME/scripts:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## How the update works

It runs in four steps:

1. **Preparation**: creates the directories and a temporary workspace.
2. **Download**: uses `curl` and `tar` to fetch only the scripts folder of the repository.
3. **Synchronisation**: uses `rsync` with `--delete`, so the local folder exactly matches the repository.
4. **Finalisation**: makes the scripts executable and removes the temporary files.

The `rsync` options are:

- `-a`: archive mode (keeps permissions, timestamps and so on);
- `-v`: verbose, so you see which files change;
- `--delete`: removes local files that no longer exist in the repository.

## Customisation

### Change the target folder

Edit the `TARGET_DIR` variable in the `update_rfscripts` file:

```bash
# Original
TARGET_DIR="$(pwd)/scripts"

# Modified example (specific directory)
TARGET_DIR="/opt/rfswift/scripts"
```

### Keep your local changes

`--delete` removes files that are not in the repository. To keep local changes, remove that option from the `rsync` command:

```bash
# Change from
rsync -av --delete "$TEMP_DIR/" "$TARGET_DIR/"

# To
rsync -av "$TEMP_DIR/" "$TARGET_DIR/"
```

## Troubleshooting

### Network errors

Check your internet connection, and that GitHub is reachable from your network.

### Permission errors

Check who owns the scripts folder, then give yourself write access:

```bash
ls -la ~/scripts
```

```bash
chmod u+w ~/scripts
```

### Scripts do not run after the update

Make them executable again:

```bash
chmod +x ~/scripts/*.sh
```

## Related documentation

- [Container scripts](/docs/container_scripts/)
- [Build your own images (YAML recipes)](/docs/development/yaml-recipe-guide/)
- [FAQ and troubleshooting](/docs/faq/)
