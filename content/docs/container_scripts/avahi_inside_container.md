---
title: "Avahi container start script"
linkTitle: "Avahi start script"
level: advanced
description: "Start Avahi inside a container for mDNS service discovery, for example to find a PlutoSDR."
weight: 6
---

`avahicontainer_start` starts the Avahi service inside an RF Swift container. Avahi provides zeroconf (mDNS) service discovery, which some devices rely on to be found on the network, the PlutoSDR in particular.

Run it when:

- you work with a PlutoSDR or another device found through network service discovery;
- a tool needs mDNS (multicast DNS) or service discovery;
- you see "Avahi daemon not running" or a similar error.

```bash
# Inside your RF Swift container
avahicontainer_start
```

## What the script does

The script lives in `/usr/sbin`. It:

1. creates the `/var/run/dbus` directory if it does not exist;
2. starts the D-Bus system daemon in the background;
3. waits 2 seconds so D-Bus is fully up;
4. starts the Avahi daemon in daemon mode (`-D`).

## Check that it works

Look for the Avahi process, then list the services it sees:

```bash
# Check if Avahi is running
ps aux | grep avahi

# Test service discovery
avahi-browse -a
```

## Example: finding a PlutoSDR

Start Avahi, give the services a moment to register, then look for IIO devices:

```bash
# Start Avahi service
avahicontainer_start

# Wait a moment for services to register
sleep 2

# Find PlutoSDR on the network
iio_info -s

# Should show something like:
# Available IIO contexts:
# Context 0: ip:pluto.local
```

## Troubleshooting

### The device is still not found

**Check the network mode.** The container must use the host network, which is RF Swift's default. The summary printed by `rfswift container shell -c <name>` shows the network mode.

**Check the firewall.** Multicast DNS uses UDP port 5353; make sure it is not blocked:

```bash
# Check if multicast traffic is allowed
sudo iptables -L | grep 5353
```

**Check for a second Avahi.** Conflicts can happen when the host also runs Avahi. Stop the host's Avahi for a moment to test:

```bash
# On your host system, temporarily stop Avahi if needed
sudo systemctl stop avahi-daemon
```

## Advanced usage

### Start Avahi with the container

Run the script as the container's command, followed by a shell:

```bash
rfswift container create -i sdr_full -n pluto_container -e "avahicontainer_start && /bin/bash"
```

### Advertise your own services

Add a service file to advertise a service of your own, then restart Avahi:

```bash
# Create a custom service file
cat > /etc/avahi/services/myservice.service << EOF
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>MyCustomService</name>
  <service>
    <type>_myservice._tcp</type>
    <port>12345</port>
  </service>
</service-group>
EOF

# Restart Avahi to apply
avahi-daemon -r
```
