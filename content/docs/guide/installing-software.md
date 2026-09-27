---
title: "Installing software"
level: intermediate
description: "Three ways to get more tools: pick another image, run an install function in a container, or add just the tools you need with Nix."
weight: 5
---

Need a tool your lab doesn't have, or want to keep your disk light? RF Swift gives you three ways to get tools. Which one fits depends on how much you need and how long it should stay.

{{< callout type="tip" title="The lightest option: a lazy Nix environment" >}}
Nothing is installed up front. Each tool is fetched the first time you run it (standard tools come prebuilt from the binary cache), then stays pinned:

```bash
rfswift container create --engine nix -i sdr_light -n radio --lazy
```

In the Workbench, pick the Nix engine and tick **Lazy tools (build on first use)**. Details in [Nix engine](/docs/guide/nix-engine/#build-modes-all-at-once-or-on-demand).
{{< /callout >}}

## Which way should I use?

| Your situation | Use |
|---|---|
| You know the engagement | **A container from the matching image.** The fastest way to a complete, tested toolbox, and the same digest lands on every colleague's machine. |
| One tool is missing | **`container install`** in the container, or **`env install`** in a Nix environment. Commit, or write a recipe, if it must survive. |
| You want one tool, now, on a laptop without an engine | **`rfswift env run <set> <tool>`** |
| You want to stay light and only install what you use | **A lazy Nix environment** (`--lazy`) |
| You need reproducibility or rollback | **Nix, eager** (the default build mode), with `env export` to move it |
| You need isolation from the host | **A container**, or a Nix environment with `--isolate` |

Both engines coexist. The [Workbench](/docs/guide/workbench/) shows containers and environments side by side (right-click a mission and choose **Install tools...** to add tools from a dialog), and `rfswift audit` scans either. To compare the engines themselves, see [Choose your engine](/docs/engines/).

## 1. Container images: pick the task, not the distribution

Every official image is built for one kind of work and inherits from `corebuild` (see [Choose a toolbox](/docs/guide/list-of-images/)). Images share their base layers on disk, so a second image costs only what differs.

Create a container from the image that matches the job:

```bash
rfswift container create -i rfid -n badge          # Proxmark3, libnfc, mfoc and friends
rfswift container create -i sdr_full -n survey     # the whole SDR stack, GNU Radio 3.10 included
rfswift image versions                             # published releases of every image
rfswift image pull -i sdr_full -V 1.0.0            # pin a release next to the rolling tag
```

Tools are on `PATH` in the container's shell. The [tool list](/docs/guide/list-of-tools/) says what each image carries and which tools are optional.

## 2. Install functions: one more tool in a running container

Every image carries `/root/scripts`: the same shell functions that built it, several hundred of them. A tool that is not preinstalled is one function away, and the function knows the image's compilers, paths and patches.

```bash
rfswift container install -c radio                          # filterable picker of the functions the image ships
rfswift container install -c radio -i sdrpp_soft_install
rfswift container install -c wifi -i mdk3_soft_install
rfswift container install -c radio -i install_soapy_modules
```

- Inside the container, plain `apt`, `pip` and `uv` work too: the images are Ubuntu 26.04.
- A build report inside every image (`/var/lib/db/rfswift_build_report.tsv`) says whether a tool's own build failed on your architecture; the install function puts it back.

### Keep what you added

Whatever you add lives in the container's writable layer. To keep it beyond that container:

```bash
rfswift container commit -c radio -i penthertz/rfswift_resolute:radio_mine   # a new local image
rfswift container upgrade -c radio -i sdr_full -r /root/share,/opt/tools    # move to a newer image, keep directories
rfswift image build -r rfswift-recipe.yaml                                   # or bake it in with a YAML recipe
```

Recipes are the reproducible route for a team: see the [YAML recipe guide](/docs/development/yaml-recipe-guide/).

## 3. Nix: a tool set, a single tool, or one package more

The Nix engine installs the same tool sets natively, and this is where the granularity changes: you do not have to take the whole set. In lazy mode (`--lazy`) an environment starts empty and each tool is fetched the first time you call it.

```bash
rfswift env catalog                                                   # the environments and what they carry
rfswift container create --engine nix -i sdr_light -n radio           # the set, built eagerly
rfswift container create --engine nix -i sdr_light -n radio --lazy    # each tool builds on first call
rfswift env run sdr_light sdrpp                                       # one tool, nothing else, no environment created
rfswift env install soapyrtlsdr --env radio                           # one package more, in this environment
rfswift env install ffmpeg                                            # shared profile: on PATH in every environment
rfswift env search hackrf --nixpkgs                                   # anything in the pinned nixpkgs
rfswift env tools radio --installed                                   # what is there now
```

- **`env run`** builds only that tool's closure and starts it with the OpenGL runtime the engine adds. An afternoon with SDR++ costs the SDR++ closure, not a distribution.
- **`env install`** adds any nixpkgs package to one environment or to the shared profile, and offers the udev rules the package ships.
- **Pinned**: everything is pinned to the flake revision the environment was created from, so nothing changes until you ask.
- **Rollback**: an eager environment keeps its previous generation for `env rollback`. Lazy environments are pinned to a revision but have no rollback generations.

The [Nix engine guide](/docs/guide/nix-engine/) covers on-demand builds, isolation, OpenGL and udev in detail.

## The three ways side by side

| | Container image | Install function in a container | Nix environment |
|---|---|---|---|
| **What you get** | A task-sized image with its tools preinstalled (`sdr_light`, `rfid`, `wifi_full`, ...) | One more tool fetched or compiled inside a running container | A native, pinned tool set, one package more, or one single tool |
| **Command** | `rfswift container create -i sdr_light -n radio` | `rfswift container install -c radio -i sdrpp_soft_install` | `rfswift container create --engine nix -i sdr_light -n radio`, `rfswift env install sdrpp --env radio`, `rfswift env run sdr_light sdrpp` |
| **Disk** | The image; images of the same family share their base layers | The container's writable layer | Only the closure of what you asked for, shared between environments |
| **Persistence** | The image, as long as you keep it | The container; `container commit` turns it into an image | The environment; an eager environment's generations let `env rollback` undo an update |
| **Reproducible elsewhere** | Same tag, same digest, on any host | Depends on what the function fetched that day | Same flake revision, same store paths |
| **Isolation** | Container | Container | None by default, the `--isolate` jail on request |
| **Hardware** | Device mapping and `c 189:* rwm`, udev rules on rootless Podman | Same | Your user with the udev rules the packages ship |
| **Best for** | A known engagement type, a team that must share one environment | A tool the image does not carry, once | Laptops without an engine, one tool, staying light, pinned research setups |
