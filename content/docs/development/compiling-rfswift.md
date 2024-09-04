---
title: Compiling RF Swift
weight: 1
prev: /docs/development
next: /docs/development/building-images
cascade:
  type: docs
---

The project can install from source by following the simple steps:

## Installing RF Swift from source

{{% steps %}}

### Get binary from GitHub

Get the latest commit from the  [the official repository](https://github.com/PentHertz/RF-Swift):
```bash
git clone https://github.com/PentHertz/RF-Swift.git
```

### Use the installation script

Two scripts are available to install all development tools if not installed and build the project:

- **install.sh**: Installation script for Linux, handling also the installation of Docker (also on Steam Deck), Buildx, and go.
- **build-windows.bat**

If you are running the `install.sh` script, it will ask you if you want to install it for a Steam Deck. If yes, this will also unlock Steam OS from read-only.

```bash
./install.sh 
[+] Checking Docker installation
Are you installing on a Steam Deck? (yes/no)
Choose an option:
```

After this process, `install.sh` will take care for `Golang`, `Docker`, `Build X`, and `compose` installation.

On Linux, you will have also the choice to make an alias for this binary:

```bash
Do you want to create an alias for the binary? (yes/no): 
```

{{< callout type="info" >}}
  The alias will allow you to start the binary with `rfswift` command.
{{< /callout >}}

And then ask you if you want to build a Docker image (1), or pull an existing one (2), or exit the process (3):

```bash
Docker is already installed. Moving on.
Docker Buildx is already installed. Moving on.
Docker Compose v2 is already installed. Moving on.
[+] Installing Go
golang is already installed in /usr/local/go/bin. Moving on.
[+] Building RF Switch Go Project
RF Switch Go Project built successfully.
Do you want to build a Docker container, pull an existing image, or exit?
1) Build Docker container
2) Pull Docker image
3) Exit
Choose an option (1, 2, or 3): 
```

You can always choose to build images, or pull images later.

{{< cards >}}
  {{< card link="/docs/development/building-images" title="Beak your own images" icon="document-text" subtitle="Make your own images, save space and enjoy your environment" >}}
  {{< card link="/docs/images" title="Managing images" icon="document-text" subtitle="List local and remote images, and pull them from the official registry" >}}
{{< /cards >}}

### Running the container

After building, or pulling an existing image, you can run the container and enjoy the included tools !

```shell
sudo ./rfswift run -i penthertz/rfswift:sdr_full -n supercontainername
```

{{% /steps %}}

## Restarting a container

You can create as many fresh container you want, but sometimes you want to get back to previous job.

To restart a container, you can do it with the following command using `-c nameofthecontainer`:

```shell
sudo ./rfswift exec -c supercontainername
```

## Next

Now your are ready to use RF Swift with provided images, build your own images, and contribute on the Go binary and the content of images. 

{{< cards >}}
  {{< card link="/docs/getting-started" title="Getting Started" icon="document-text" subtitle="Learn how to run RF Swift with provided images" >}}
{{< /cards >}}
