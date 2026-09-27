---
title: "rfswift image download"
linkTitle: "image download"
navGroup: "Images"
level: reference
description: "Save an image to a compressed archive, for example to move it to an offline machine."
weight: 25
---

`rfswift image download` saves an image as a compressed `tar.gz` file. Use it to carry images to an offline or air-gapped machine, to share them, or to keep an archive of a version you rely on.

The most common use fetches the latest image and saves it in one step:

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o sdr_full.tar.gz --pull
```

On the destination machine, bring it back with [`rfswift image import image`](/docs/commands/import).

{{< callout type="info" >}}
`rfswift image download` is the v4 spelling. The older `rfswift download` still works, takes the same flags and prints a notice with the new name. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift image download -i IMAGE_NAME -o OUTPUT_FILE.tar.gz [--pull]
```

The image can come from Docker Hub or a private registry.

## Options

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --image STRING` | The image to save | Yes | `-i penthertz/rfswift_resolute:sdr_full` |
| `-o, --output STRING` | Where to write the archive | No | `-o rfswift-sdr.tar.gz` |
| `--pull` | Pull the image first if it is not on this computer | No | `--pull` |

{{< callout type="info" title="Defaults" >}}
Without `-i`, a terminal shows a scrollable list of images to choose from. Without `-o`, the file is named `{image_name}_converted.tar.gz`, with `/` and `:` replaced by `_`.
{{< /callout >}}

{{< callout type="tip" title="Use --pull to get the latest version" >}}
Without `--pull`, RF Swift saves the copy already on this computer, which may be out of date.
{{< /callout >}}

## Examples

Save an image to a file:

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o rfswift-sdr-full.tar.gz
```

Pull the latest version first, then save it:

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o sdr_full.tar.gz --pull
```

Choose a descriptive file name:

```bash
rfswift image download -i penthertz/rfswift_resolute:bluetooth -o bluetooth-tools-v2025.tar.gz
```

Save into a specific folder, with today's date in the name:

```bash
rfswift image download -i penthertz/rfswift_resolute:wifi \
  -o ~/offline-images/wifi-tools-$(date +%Y%m%d).tar.gz
```

### Prepare a USB drive for offline installs

Save the images you need onto the drive, and add a short README for whoever uses it:

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full \
  -o /media/usb/rfswift-sdr-full.tar.gz --pull

rfswift image download -i penthertz/rfswift_resolute:bluetooth \
  -o /media/usb/rfswift-bluetooth.tar.gz --pull

rfswift image download -i penthertz/rfswift_resolute:wifi \
  -o /media/usb/rfswift-wifi.tar.gz --pull

cat > /media/usb/README.txt << 'EOF'
RF Swift Offline Installation

To install:
1. Import images: rfswift image import image -i rfswift-*.tar.gz
2. Run container: rfswift container create -i penthertz/rfswift_resolute:sdr_full -n workspace
EOF
```

### Prepare an air-gapped system

On a connected machine, save the latest images into one folder and create a checksum file. Then copy the whole folder to the air-gapped system:

```bash
OFFLINE_DIR=~/offline-bundle
mkdir -p "$OFFLINE_DIR"

rfswift image download -i penthertz/rfswift_resolute:sdr_full \
  -o "$OFFLINE_DIR/sdr_full_$(date +%Y%m%d).tar.gz" --pull

rfswift image download -i penthertz/rfswift_resolute:hardware \
  -o "$OFFLINE_DIR/hardware_$(date +%Y%m%d).tar.gz" --pull

cd "$OFFLINE_DIR"
sha256sum *.tar.gz > checksums.sha256
```

The full procedure is in [Air-gapped installation](/docs/air-gapped-installation/).

### Archive a version before upgrading

Save the current image before you upgrade, with a note describing it:

```bash
rfswift image download -i penthertz/rfswift_resolute:sdr_full \
  -o archives/rfswift-sdr-full-v0.6.5.tar.gz

echo "RF Swift SDR Full v0.6.5 - Archived $(date)" \
  > archives/rfswift-sdr-full-v0.6.5.txt
```

{{< callout type="warning" title="Disk space" >}}
Saving and compressing an image needs about twice the size of the final file in free space. For example, a 1.5 GB file needs about 3 GB free.
{{< /callout >}}

## Troubleshooting

### “image not found”

The full error looks like `Error: image not found: penthertz/rfswift_resolute:unknown_tag`. Check the list of published images and the spelling:

```bash
rfswift image remote
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o output.tar.gz
```

### Connection timeout or “network unreachable”

Check the connection to Docker Hub and that Docker is running:

```bash
ping registry.hub.docker.com
docker info
```

Behind a firewall, set your proxy before retrying. A longer timeout may need a change to Docker's daemon configuration.

```bash
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
```

### “permission denied” when writing the file

You cannot write to the output folder. Check its permissions, or write into a folder you own:

```bash
ls -ld $(dirname output.tar.gz)
mkdir -p ~/downloads
chmod 755 ~/downloads
rfswift image download -i image -o ~/downloads/image.tar.gz
```

To write to a system folder, use `sudo`:

```bash
sudo rfswift image download -i image -o /opt/images/image.tar.gz
```

### The download stopped halfway

Delete the partial file and start again:

```bash
ls -lh output.tar.gz
rm output.tar.gz
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o output.tar.gz --pull
```

On an unstable connection, run it inside `screen` or `tmux` so it survives a dropped session. Press Ctrl+A then D to detach from `screen`:

```bash
screen -S download
rfswift image download -i image -o output.tar.gz --pull
```

### “authentication required”

The image is in a private registry. Log in with the engine first, then download. For a private registry:

```bash
docker login registry.example.com
rfswift image download -i registry.example.com/image:tag -o output.tar.gz
```

For private repositories on Docker Hub:

```bash
docker login
rfswift image download -i myuser/private-image:tag -o output.tar.gz
```

### `--pull` does not seem to work

Write the flag on its own, without `=true`:

```bash
rfswift image download -i image -o output.tar.gz --pull
```

If it still fails, pull the image with Docker first, check it is there, then download:

```bash
docker pull penthertz/rfswift_resolute:sdr_full
docker images | grep rfswift
rfswift image download -i penthertz/rfswift_resolute:sdr_full -o output.tar.gz
```

## Related commands

- [`export`](/docs/commands/export): export local images or containers to `tar.gz`
- [`import`](/docs/commands/import): import the archives you saved
- [`images`](/docs/commands/images): pull and list images
- [`run`](/docs/commands/run): create containers from imported images
