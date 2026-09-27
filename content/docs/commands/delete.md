---
title: "rfswift image rm"
linkTitle: "image rm"
navGroup: "Images"
level: reference
description: "Delete a local image."
weight: 23
---

`rfswift image rm` deletes an image from your computer. Use it to free disk space, remove old versions, or clean up after testing.

The most common use deletes one image by its tag:

```bash
rfswift image rm -i penthertz/rfswift_resolute:old_version
```

{{< callout type="info" >}}
`rfswift image rm` is the v4 spelling. The older `rfswift delete` still works, takes the same flags and prints a notice with the new name. See the [command tree](/docs/commands/#the-v4-command-tree).
{{< /callout >}}

## Synopsis

```bash
rfswift image rm -i IMAGE_ID_OR_TAG
```

## Options

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-i, --image STRING` | The image ID or tag to delete | Yes | `-i penthertz/rfswift_resolute:old_version` |

{{< callout type="info" title="Pick from a list" >}}
Run it without `-i` in a terminal and RF Swift shows a scrollable list of your local images. It asks for confirmation (`Delete image 'name'?`) before deleting.
{{< /callout >}}

## Examples

Delete an image by its tag:

```bash
rfswift image rm -i penthertz/rfswift_resolute:old_version
```

Delete an image by its ID:

```bash
rfswift image rm -i a1b2c3d4e5f6
```

Delete an image you built yourself:

```bash
rfswift image rm -i my_custom_sdr:v1.0
```

### Clean up old versions

List your images, delete the old one, then check it is gone:

```bash
rfswift image local
rfswift image rm -i penthertz/rfswift_resolute:tag
rfswift image local
```

### Remove test images

Delete test images one by one:

```bash
rfswift image rm -i test_image:experimental
rfswift image rm -i test_build:v1
rfswift image rm -i test_build:v2
rfswift image rm -i test_build:v3
```

### Free disk space

Compare disk usage before and after deleting a large image:

```bash
docker system df
rfswift image rm -i penthertz/rfswift_resolute:sdr_full_old
docker system df
```

### Remove a failed build

A failed build can leave an image behind. Delete it by tag or by ID:

```bash
rfswift image rm -i failed_build:latest
rfswift image rm -i a1b2c3d4e5f6
```

### Clean up after an upgrade

Once a container has moved to a new image, delete the old one:

```bash
rfswift container upgrade -c my_container -i new_image:v2
rfswift image rm -i old_image:v1
```

## What gets deleted

| Item | Deleted? | What it means |
|------|----------|---------------|
| Image layers | Yes | Removed from disk |
| Image metadata | Yes | Tags and labels are removed |
| Containers using the image | No | They are not touched, and while they exist the image cannot be deleted (see below) |
| Exported `tar.gz` files | No | They stay on disk |
| Files you added to the image | Yes | Gone with the image |

Deleting an image is permanent. If you might need it again, back it up first with `rfswift image export image`; you can bring it back later with `rfswift image import`.

### Images in use cannot be deleted

This fails while a container still uses the image:

```bash
rfswift image rm -i penthertz/rfswift_resolute:sdr_full
# Error: image is being used by running container
```

Stop and remove the containers that use it first, then delete the image:

```bash
rfswift container stop -c container_using_image
rfswift container rm -c container_using_image
rfswift image rm -i penthertz/rfswift_resolute:old_version
```

## image rm or container rm?

| Command | Works on | What it deletes |
|---------|----------|-----------------|
| `rfswift image rm` (legacy `delete`) | Images | A toolbox image |
| `rfswift container rm` (legacy `remove`) | Containers | One lab built from an image |

## Troubleshooting

### “image is being used by running container”

A container still uses the image. Find those containers, stop and remove them, then delete the image:

```bash
docker ps -a --filter ancestor="image:tag"

docker ps -a --filter ancestor="image:tag" --format "{{.Names}}" | \
xargs -r docker stop

docker ps -a --filter ancestor="image:tag" --format "{{.Names}}" | \
xargs -r docker rm

rfswift image rm -i image:tag
```

### “image has dependent child images”

Another image was built on top of this one. Either force the deletion with Docker, or delete the child images first and then the parent:

```bash
docker rmi -f image:tag
```

```bash
docker images --filter "since=image:tag" --format "{{.Repository}}:{{.Tag}}" | \
while read child; do
    rfswift image rm -i "$child"
done

rfswift image rm -i image:tag
```

### “No such image”

The full error is `Error: No such image: image:tag`. Check the exact name or ID, then use it as shown:

```bash
rfswift image local
docker images
rfswift image rm -i penthertz/rfswift_resolute:sdr_full
rfswift image rm -i a1b2c3d4e5f6
```

### “Permission denied”

Your user cannot talk to Docker. On Linux, `rfswift host docker-access` grants access without logging out. You can also add your user to the `docker` group by hand, or run the command with `sudo`:

```bash
rfswift host docker-access
```

```bash
sudo usermod -aG docker $USER
newgrp docker
rfswift image rm -i image:tag
```

```bash
sudo rfswift image rm -i image:tag
```

### The same tag points to several images

Delete by image ID instead. List the images to find the right ID:

```bash
docker images
rfswift image rm -i a1b2c3d4e5f6
```

{{< callout type="info" title="How much space you get back" >}}
Images take several gigabytes each, so deleting one frees a lot of space. Run `docker system df` before and after to see how much.
{{< /callout >}}

## Related commands

- [`images`](/docs/commands/images): list and manage images
- [`remove`](/docs/commands/remove): remove containers
- [`export`](/docs/commands/export): back up an image before deleting it
- [`build`](/docs/commands/build): build new images
- [`cleanup`](/docs/commands/cleanup): automated cleanup
