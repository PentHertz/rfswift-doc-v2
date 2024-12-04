---
title: Configurations
weight: 4
next: /docs/guide/host-actions
prev: /docs/guide/list-of-tools/
cascade:
  type: docs
---

RF Swift can be configured on the fly, or using a profile configuration file for conveniency.

## Profil configuration

Depending on your os, RF Swift will look for a profile configuration and ask you to create one if it is not found in the following path:

{{< tabs items="Linux,Windows,macOS X" defaultIndex="1" >}}

  {{< tab >}}
```
/home/username/.config/rfswift/config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
C:\Users\username\AppData\Roaming\rfswift\config.ini
```
  {{< /tab >}}
  {{< tab >}}
```
/Users/username/.config/rfswift/config.ini
```
  {{< /tab >}}
{{< /tabs >}}

This file contains different sections and lines parameters for RF Swift as follows:

```
[general]
imagename = myrfswift:latest
repotag = penthertz/rfswift

[container]
shell = /bin/zsh
bindings = /dev/bus/usb:/dev/bus/usb,/run/dbus/system_bus_socket:/run/dbus/system_bus_socket,/dev/snd:/dev/snd,/dev/dri:/dev/dri,/dev/input:/dev/input
network = host
x11forward = /tmp/.X11-unix:/tmp/.X11-unix
xdisplay = "DISPLAY=:0"
extrahost = pluto.local:192.168.2.1
extraenv = ""

[audio]
pulse_server = tcp:localhost:34567
```

In the `general` section, we have a `imagename` parameter which is the default image name of the container you want to create and run with command `run`.
This parameters allows you to skip `-i` parameter for the command `run`.

The `repotag` parameter allows you to chose a different default repository for Docker images.

In the `container` section:

* `shell`: default shell to use in the container (e.g: bash/dash/zsh);
* `bindings`: Allows to share files/directories from the host to host container;
* `network`: network configuration mode (e.g: host/private/bridge/overlay/ipvlan/macvlan);
* `x11forward`: extends bindings for X11 sharing between host and guest;
* `extrahost`: host aliases binding with IPs;
* `xdisplay`: environment variable dedicated to X11;
* `extraenv`: extra environment variables you want to setup.

The `audio` section contains a parameter `pulse_server` which will setup the `PULSE_SERVER` environment variable to point applications to the right address of your `pulseaudio` server.

## Parameters from CLI

You can also choose to modify any parameter when using the `run` command:

```bash
Usage:
  rfswift run [flags]

Flags:
  -b, --bind string          extra bindings (separate them with commas)
  -e, --command string       command to exec (by default: '/bin/bash')
  -d, --display string       set X Display (duplicates hosts's env by default) (default "DISPLAY=:0")
  -x, --extrahosts string    set extra hosts (default: 'pluto.local:192.168.1.2', and separate them with commas)
  -h, --help                 help for run
  -i, --image string         image (default: 'myrfswift:latest')
  -n, --name string          A docker name
  -p, --pulseserver string   PULSE SERVER TCP address (by default: tcp:127.0.0.1:34567) (default "tcp:127.0.0.1:34567")
```

## Re-bindings for existing containers

This is a feature that do not exist natively in Docker, that RF Swift provides in case we mess with the bindings when lauching a container.

After some time working with a container, you will probably regret not providing certain bindings to you container, and think about recreating a new one with correct bindings. That problem is solved thanks to the `bindings` feature as follows:

```bash
sudo ./bin/rfswift_linux_amd64 bindings
...
[+] You are running version: 0.5.2 (Up to date)
Add, or remove, a binding for a container

Usage:
  rfswift bindings [command]

Available Commands:
  add         Add a binding
  rm          Remove a binding

Flags:
  -h, --help   help for bindings

Use "rfswift bindings [command] --help" for more information about a command.
```

### Adding a binding

To add a new binding, use the following command:

```bash
sudo rfswift bindings add -c <name_of_the_container> -t /dev/vhci [-s /dev/vhci]
```

In case the source path (host side) should be different from the target (container side), use the `-s` parameter.

### Removing a binding

Following command can be issue for to remove a useless binding:

```bash
sudo rfswift bindings rm -c <name_of_the_container> -t /dev/vhci [-s /dev/vhci]
```

In case the source path (host side) should be different from the target (container side), use the `-s` parameter.