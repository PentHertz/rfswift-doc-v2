---
title: Avahi Container Start Script
weight: 6
prev: /docs/container_scripts/rfswift_install
next: /docs/container_scripts/libresdr_swap_firmware
cascade:
  type: docs
---

# Using the Avahi Container Start Script

## Overview

The `avahicontainer_start` script is a utility included in RF Swift containers to enable service discovery through Avahi. This script is particularly useful when working with PlutoSDR and other devices that rely on zeroconf/mDNS discovery.

## Script Details

The `avahicontainer_start` script in `/usr/sbin` initializes the D-Bus daemon and Avahi service within a container:

### What This Script Does

1. **Create D-Bus Directory**: Creates the `/var/run/dbus` directory if it doesn't exist
2. **Start D-Bus Daemon**: Launches the D-Bus system daemon in the background
3. **Wait Period**: Pauses for 2 seconds to ensure D-Bus is fully initialized
4. **Start Avahi Daemon**: Launches the Avahi daemon in daemon mode (`-D`)

## When to Use This Script

Use the `avahicontainer_start` script when:

- Working with PlutoSDR or similar devices that use network service discovery
- Running tools that require mDNS (multicast DNS) or service discovery
- Encountering "Avahi daemon not running" or similar errors

## Using the Script

### Manual Execution

To manually start Avahi in a running container:

```bash
# Inside your RF Swift container
avahicontainer_start
```

### Verifying It's Working

After running the script, you can verify that Avahi is properly running:

```bash
# Check if Avahi is running
ps aux | grep avahi

# Test service discovery
avahi-browse -a
```

### PlutoSDR Example

When working with PlutoSDR, you can use this script to enable automatic discovery:

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

### Common Issues

If the script doesn't solve your service discovery issues:

1. **Network Configuration**: Ensure your container is using the host network (the default for RF Swift)
   ```bash
   # Check network mode of your container
   rfswift container list
   ```

2. **Firewall Settings**: Multicast DNS uses UDP port 5353 - ensure it's not blocked
   ```bash
   # Check if multicast traffic is allowed
   sudo iptables -L | grep 5353
   ```

3. **Multiple Avahi Instances**: Sometimes conflicts occur if the host is also running Avahi
   ```bash
   # On your host system, temporarily stop Avahi if needed
   sudo systemctl stop avahi-daemon
   ```

## Advanced Usage

### Auto-Starting Avahi

To automatically start Avahi when running a container:

```bash
rfswift run -i sdr_full -n pluto_container -e "avahicontainer_start && /bin/bash"
```

### Custom Service Files

You can add custom Avahi service files to advertise specific services:

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