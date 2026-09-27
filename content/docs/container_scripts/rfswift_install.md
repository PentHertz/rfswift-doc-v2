---
title: "RF scripts update utility"
linkTitle: "RF scripts update"
level: advanced
description: "Keep the RF Swift scripts inside a container in sync with the latest versions."
weight: 8
---

## Overview

The `update_rfscripts` utility is a tool that keeps your local RF Swift scripts synchronized with the latest versions from the official repository. This ensures you always have access to the most recent tools, fixes, and improvements without manually downloading and managing script files.

## What this utility does

The utility performs several operations to update your local scripts directory:

1. **Creates a scripts directory** in your home folder if it doesn't exist
2. **Downloads the latest scripts** from the RF-Swift-images GitHub repository
3. **Synchronizes the files** to your local directory, adding new files and updating existing ones
4. **Sets proper permissions** on the scripts to make them executable
5. **Cleans up** any temporary files used during the update process

## When to use this utility

Use the `update_rfscripts` utility:

- After a new RF Swift release to get the latest scripts
- When you need access to newly added tools
- If you suspect your scripts might be outdated
- Before starting a new RF assessment to ensure you have the latest capabilities

## Using the utility

### Running the utility

To update your RF scripts, simply run:

```bash
update_rfscripts
```

No root privileges are required, as the scripts are installed to your user's home directory.

### What to expect

When you run the utility, you'll see a series of colored messages indicating the progress:

1. **Yellow text**: Indicates the creation of new directories (if needed)
2. **Blue text**: Shows progress information as files are downloaded and copied
3. **Red text**: Alerts you to any errors (hopefully you won't see these)
4. **Green text**: Confirms successful completion of the update

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

## Script location and usage

### Where scripts are installed

The utility installs all scripts to the `scripts` directory in your home folder:

```
~/scripts/
```

### Using the updated scripts

After updating, you can use the scripts directly from your home directory. For example:

```bash
# Run a specific script
~/scripts/entrypoint.sh tool_name_install

# Or add to your PATH for easier access
echo 'export PATH="$HOME/scripts:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Technical details

### Repository source

The scripts are downloaded from the official RF Swift images repository:
```
https://github.com/PentHertz/RF-Swift-images
```

### Update process

The utility uses a four-step process:

1. **Preparation**: Creates necessary directories and sets up a temporary workspace
2. **Download**: Uses `curl` and `tar` to fetch only the scripts folder from the repository
3. **Synchronization**: Uses `rsync` with the `--delete` option to ensure your local directory exactly matches the repository
4. **Finalization**: Sets executable permissions and cleans up temporary files

### File handling

The utility uses `rsync` with the following options:
- `-a`: Archive mode (preserves permissions, timestamps, etc.)
- `-v`: Verbose output so you can see which files are updated
- `--delete`: Removes local files that no longer exist in the repository

## Customization

If you need to modify the default behavior of the script updater:

### Changing the target directory

Edit the `update_rfscripts` file to change the `TARGET_DIR` variable:

```bash
# Original
TARGET_DIR="$(pwd)/scripts"

# Modified example (specific directory)
TARGET_DIR="/opt/rfswift/scripts"
```

### Preserving local modifications

If you've made local changes to scripts that you want to keep, remove the `--delete` option from the rsync command:

```bash
# Change from
rsync -av --delete "$TEMP_DIR/" "$TARGET_DIR/"

# To
rsync -av "$TEMP_DIR/" "$TARGET_DIR/"
```

## Troubleshooting

### Common issues

**Network Connection Errors**
- Ensure you have a working internet connection
- Check if GitHub is accessible from your network

**Permission Errors**
- If you see permission errors, check the ownership of your scripts directory:
  ```bash
  ls -la ~/scripts
  ```
- Ensure you have write permissions to the directory:
  ```bash
  chmod u+w ~/scripts
  ```

**Execution Fails After Update**
- If scripts won't execute after updating, check the permissions:
  ```bash
  chmod +x ~/scripts/*.sh
  ```

## Related documentation

- [RF Swift Utilities](/docs/container_scripts)
- [Custom Script Development](/docs/development/yaml-recipe-guide)
- [Troubleshooting](/docs/faq/)