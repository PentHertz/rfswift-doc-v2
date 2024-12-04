---
title: 🚀 Quick Start
weight: 2
next: /docs/guide
prev: /docs/getting-started
cascade:
  type: docs
---

{{< callout type="warning" >}}
  **On Linux**, unless your are using Docker Desktop, you will have to use `rfswift` with sudo most of the time.
{{< /callout >}}

To install RF Swift, you have to choice using the pre-compiled binary wrapper depending on your system and pull an existing container image, or to compile the Go project and/or the Docker images from sources.

In this section, we will go straight forward to the quickest way to run the project.


{{% steps %}}

### Get binary from GitHub

Get the latest binary from [the official repository ↗](https://github.com/PentHertz/RF-Swift/tags).

Rename the binary to `rfswift` to make things simplier.

If you run the binary without config, the tool will ask you if you want to create one or use values by default:

```bash
rfswift 
Config file not found. Would you like to create one with default values? (y/n)
```

### Pulling a built image

RF Swift have already some prebuilt images you can fire on the go.

For the example, we will pull an image containing a complete SDR images `sdr_full` on an `x86_64` architecture:

```bash
rfswift images pull -i sdr_full [-t myrfswift:label]
```
   **Important options**:
   - i: remote label
   - t: optional local tag we want to use.

Note that you can use the complete image tag `penthertz/rfswift:sdr_full` if you like, or change the repository in your profile to use the short tag only with a different source.

{{< callout type="info" >}}
  Using Docker Desktop (Windows and macOS) or OrbStack on macOS, `sudo` is not necessary.
{{< /callout >}}

### Running the container

After downloading the image, you can create and run the container by precising the `tag with -i` assigned to the image and the `name with -n` of the container:

```shell
rfswift run -i sdr_full -n supercontainername
```

Optionally, you can also share a directory with `-b` option as follows:

```shell
rfswift run -i sdr_full -n supercontainername -b /path/to/bind:/target
```

More details can be found in the sharing [sharing files](/docs/guide/sharing-files) section of this guide.

Note that you can use the complete image name `penthertz/rfswift:sdr_full` if you want to change the repository. You can also change default repository within your RF Swift profile.

{{< callout type="info" >}}
  The name of the container will allow to restart it without having to remember its ID.
{{< /callout >}}

And there you can execute all programs installed on it ;)!

As an example, plug an supported SDR devices in your computer, and inside the command shell `sdrpp`.

{{< callout type="warning" >}}
  The sound could be maybe missing, we will see other options the `rfswift`, but if you follow the warnings you will probably see that `./rfswift host audio enable` will solve the issues if `pulseaudio` is well running on your host. 
{{< /callout >}}

{{% /steps %}}

## Restarting a container

You can create as many fresh container you want, but sometimes you want to get back to previous job.

To restart a container, you can do it with the following command using `-c nameofthecontainer`:

```shell
rfswift exec -c supercontainername
```

{{< callout type="info" >}}
  On Unix-Like systems, consider using an alias, if you want to start the binary from any location with `rfswift` command ;)
  ```basg
    echo "alias rfswift='<BINARY_PATH>/rfswift'" >> "$HOME/.<shell>rc" # example /home/user/.bashrc
  ```
{{< /callout >}}


## Next

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/guide" title="Follow the guide" icon="document-text" subtitle="Read the guide and learn how to use RF Swift for your dealy assessments." >}}
{{< /cards >}}
