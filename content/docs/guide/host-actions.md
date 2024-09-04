---
title: Host actions
weight: 5
next: /docs/guide/file-sharing
prev: /docs/guide/configurations
cascade:
  type: docs
---

Know we know how to run, configure, and manage images, let us see how we can also manage perform important host actions depending on the context.

## Enabling audio

When running a container, you will probably encounter the following warning notification:

```bash
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️  Warning                                                                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Warning: Unable to connect to Pulse server at 127.0.0.1:34567                                    │
│ To install Pulse server on Linux, follow these steps:                                            │
│ 1. Update your package manager: sudo apt update (for Debian-based) or sudo yum update (for Red   │
│ Hat-based).                                                                                      │
│ 2. Install Pulse server: sudo apt install pulse-server (for Debian-based) or sudo yum install    │
│ pulse-server (for Red Hat-based).                                                                │
│ After installation, enable the module with the following command as unprivileged user:           │
│ ./rfswift host audio enable                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

That means `pulseaudio` server is not found on the default IP and TCP port (127.0.0.1:34567)

With `host audio` command you can enable or disable pulseaudio in TCP, and so to listen to the sound coming from some tools like GQRX, SDR++, etc:

```bash
rfswift host audio
...
[+] You are running version: 0.4.9 (Up to date)
Manage pulseaudio server

Usage:
  rfswift host audio [command]

Available Commands:
  enable      Enable connection
  unload      Unload TCP module from Pulseaudio server

Flags:
  -h, --help   help for audio

Use "rfswift host audio [command] --help" for more information about a command.
```

So if we want to enable `pulseaudio`, we can simply enable it with default IP and TCP port as follows:

```bash
rfswift host audio enable
``` 

If you want, you can also open the server to you LAN network, or VPN, by precising another host, and optionaly another TCP port:

```bash
rfswift host audio enable -s 10.0.0.1:34567
``` 

{{< callout type="warning" >}}
  For security reasons, it is not advised to open the port to all computer in any network, so do it carefully.
{{< /callout >}}


## Binding USB devices on a Windows host

TODO
