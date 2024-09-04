---
title: Sharing files
weight: 6
prev: /docs/guide/host-actions/
cascade:
  type: docs
---

When using RF Swift for your assesment, you would like to retrieve the reports, logs, capture, or any file resulting the mission.

Let see with two examples how we can to it.

## Binding directories 

### General

Sharing file between host and guest is possible throught the binding `-b` parameter when using `run` command.

First, create a directory you want to share with the guest on your host:

```bash
mkdir shared

```

Then you can simply use bindings when issuing the `run` command as follows:

```bash
rfswift run -i penthertz/rfswift:telecom -n supertelecom2 -b /home/user/shared:/root/shared
```

{{< callout type="warning" >}}
  Remember to always begin with host, and then guest like that: hostpath:guestpath. And separate each binding with commas.
{{< /callout >}}

The container summary will display you the bindings that are used:

```bash

 🧊 Container Summary                                                      
╭────────────────────────────────────────────────────────────────────────────╮
│ Container Name  │ supertelecom2                                            │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ X Display       │ :0                                                       │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Shell           │ /bin/zsh                                                 │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Privileged Mode │ true                                                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Network Mode    │ host                                                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Image Name      │ penthertz/rfswift:telecom (Obsolete)                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Size on Disk    │ 11150.42 MB                                              │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Bindings        │ /tmp/.X11-unix:/tmp/.X11-unix,/dev/bus/usb:/dev/bus/usb, │
│                 │                                                          │
│                 │ /home/user/shared:/root/shared                           │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Extra Hosts     │ pluto.local:192.168.2.1                                  │
╰────────────────────────────────────────────────────────────────────────────╯
```

{{< callout type="warning" >}}
  Some default profile bindings have been probably disabled. You can re-enable then with `-b` parameter of `run` command.
{{< /callout >}}


Running the command `ls` inside the container, you will see that a directory is present:

```bash
┌─[root@topms] - [~] - [Wed Sep 04, 13:46]
└─[$]> ls
config  scripts  shared
```

Let us go inside this `shared` directory and put a file inside:

```bash
┌─[root@topms] - [~] - [Wed Sep 04, 13:48]
└─[$]> cd shared 
┌─[root@topms] - [~/shared] - [Wed Sep 04, 13:49]
└─[$]> touch superfile
```

If you look on your host, the file will be present.



## Example with Harogic devices

### Sharing calibration data

Along with a Spectrum Analyzer and other stuff, Harogic provides a USB key where you can find a `CalFile` directory:

![[Content of USB Harogic USB key]](/images/docs/harogicusb.png)

To avoid any problem, let us copy this directory to the host side:

```bash
$ cp -R /media/fluxius/37B6-82D6/CalFile .
$ ls
build-windows.bat  CalFile  go  images  install.sh  LICENSE  README.md  rfswift  rules  run  shared
```

And share it with a container based on `sdr_light` images:

```bash
rfswift run -i penthertz/rfswift:sdr_light -n harogictest -b <host/path/of/CalFile>:/rftools/analysers/SAStudio4_x86_64_05_23_17_06/bin/CalFile
```

Then you can run `sastudio` inside the container, and you get your Harogic device running:

![[Harogic device running with SaStudio]](/images/docs/harogicsas.png)


### Running SDR++ with Harogic

To run `SDR++` with Harogic devices, you will need only to copy the CalFile in `/rftools/analysers/SAStudio4_x86_64_05_23_17_06/bin/CalFile` inside your container to `/usr/bin` that way:

```bash
cp -R /rftools/analysers/SAStudio4_x86_64_05_23_17_06/bin/CalFile /usr/bin
```

And then you can start SDR++ with Harogic, and voilà!


![[Content of USB Harogic USB key]](/images/docs/harogicsdrpp.png)


## Next

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/development/building-images/" title="Beak your own image" icon="beaker" subtitle="Be a master chef, and create your own images." >}}
{{< /cards >}}
