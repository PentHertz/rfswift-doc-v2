---
title: Sharing Files & Devices
weight: 6
prev: /docs/guide/host-actions/
cascade:
  type: docs
---

# Sharing Files and Devices

When conducting RF assessments with RF Swift, you'll need to exchange files between your host system and containers, as well as connect specialized hardware devices. This guide covers the automatic workspace, manual file sharing, and device binding techniques.

## Automatic Workspace

Every RF Swift container gets a **shared workspace directory** automatically — no configuration needed.

```
~/rfswift-workspace/
├── my_sdr/            → /workspace inside container "my_sdr"
├── wifi_pentest/      → /workspace inside container "wifi_pentest"
└── client_assessment/ → /workspace inside container "client_assessment"
```

| Location | Path |
|----------|------|
| **Host** | `~/rfswift-workspace/<container-name>/` |
| **Container** | `/workspace` |

### How It Works

When you run `rfswift run -n my_sdr`, RF Swift automatically:
1. Creates `~/rfswift-workspace/my_sdr/` on your host
2. Mounts it at `/workspace` inside the container
3. Shows the workspace path in the container summary

**No `--bind` flag needed for the common case.** Just save files to `/workspace` inside the container and they're immediately available on your host.

```bash
# Create a container — workspace is automatic
rfswift run -i penthertz/rfswift_noble:sdr_full -n capture_session

# Inside the container, /workspace is your shared folder
cd /workspace
rtl_433 -f 433.92M -s 2M > captures/433mhz.iq
echo "Found signal at 433.92 MHz" > notes.txt

# Files are immediately available on host at:
# ~/rfswift-workspace/capture_session/captures/433mhz.iq
# ~/rfswift-workspace/capture_session/notes.txt
```

### Workspace Options

| Flag | Description |
|------|-------------|
| *(default)* | Auto-creates `~/rfswift-workspace/<name>/` |
| `--workspace /path` | Use a custom host directory as workspace |
| `--cwd` | Mount current working directory as workspace |
| `--no-workspace` | Disable workspace entirely |

```bash
# Use current directory as workspace
rfswift run -i sdr_full -n quick_test --cwd

# Custom path
rfswift run -i sdr_full -n project_x --workspace ~/projects/project-x/rf-data

# Disable workspace
rfswift run -i sdr_full -n headless --no-workspace
```

### Workspace and Reports

The workspace integrates with RF Swift's [report generator](/docs/commands/report). All files in the workspace are automatically inventoried in generated reports:

```bash
# After your assessment, generate a report
rfswift report generate -c capture_session --format html

# Report includes workspace file inventory:
#   captures/433mhz.iq (capture, 12.5 MB)
#   notes.txt (log, 0.1 KB)
```

{{< callout type="info" >}}
The workspace directory **persists** on the host after the container is stopped or deleted. Your captured data, notes, and scripts are never lost.
{{< /callout >}}

---

## Additional Volume Bindings

For directories beyond the workspace, use the `-b` flag to bind additional host directories.

### Basic Directory Sharing

```bash
rfswift run -i penthertz/rfswift_noble:telecom -n telecom_analysis -b ~/shared_data:/root/shared
```

This binds your host's `~/shared_data` directory to `/root/shared` inside the container, **in addition to** the automatic workspace at `/workspace`.

#### Multiple Directory Bindings

You can bind multiple directories by separating them with commas:

```bash
rfswift run -i penthertz/rfswift_noble:sdr_full -n sdr_project \
  -b ~/captures:/root/captures,~/scripts:/root/scripts,~/reports:/root/reports
```

{{< callout type="warning" >}}
Always specify paths in the format `host_path:container_path`, and separate multiple bindings with commas.
{{< /callout >}}

#### Verifying Bindings

The container summary will display all active bindings:

```
 🧊 Container Summary                                                      
╭────────────────────────────────────────────────────────────────────────────╮
│ Container Name  │ telecom_analysis                                         │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ X Display       │ :0                                                       │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Shell           │ /bin/zsh                                                 │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Privileged Mode │ true                                                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Network Mode    │ host                                                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Image Name      │ penthertz/rfswift_noble:telecom                                │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Size on Disk    │ 11150.42 MB                                              │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Bindings        │ /tmp/.X11-unix:/tmp/.X11-unix,/dev/bus/usb:/dev/bus/usb, │
│                 │                                                          │
│                 │ /home/user/shared_data:/root/shared                      │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Extra Hosts     │ pluto.local:192.168.2.1                                  │
╰────────────────────────────────────────────────────────────────────────────╯
```

#### Adding Bindings to Existing Containers

If you forgot to bind a directory when creating a container, you can add it later using the `bindings` command:

```bash
rfswift bindings add -c telecom_analysis -s ~/new_data -t /root/new_data
```

### Working with Shared Files

Once your directories are bound, you can access them from within the container:

```bash
# Inside the container
cd /root/shared
touch analysis_results.txt
echo "Signal detected at 915MHz" > analysis_results.txt
```

The file will be immediately available on your host system at `~/shared_data/analysis_results.txt`.

{{< callout type="info" >}}
File changes are bidirectional and immediate. Any changes made on either the host or container side will be instantly visible on the other side.
{{< /callout >}}

## Device Binding for RF Hardware

Many RF tools require access to specific hardware devices. RF Swift makes it easy to bind these devices to your containers.

### Common RF Device Bindings

| Device Type | Host Path | Container Path | Required Capabilities |
|-------------|-----------|----------------|----------------------|
| RTL-SDR | `/dev/bus/usb` | `/dev/bus/usb` | None |
| HackRF | `/dev/bus/usb` | `/dev/bus/usb` | None |
| Proxmark3 | `/dev/ttyACM0` | `/dev/ttyACM0` | None |
| Bluetooth Adapters | `/dev/vhci` | `/dev/vhci` | `NET_ADMIN` |
| Wi-Fi Adapters | `/dev/ttyUSB0` | `/dev/ttyUSB0` | `NET_ADMIN` |

Most RF Swift images automatically bind common device paths, but you may need to add specific devices or additional bindings for specialized hardware.

### RFID Device Binding

For Proxmark3 and similar RFID tools, you may need to bind specific device paths:

```bash
# Default Proxmark3 device
rfswift run -i penthertz/rfswift_noble:rfid -n rfid_scanner -s /dev/ttyACM0:/dev/ttyACM0

# For multiple Proxmark3 devices
rfswift run -i penthertz/rfswift_noble:rfid -n multi_proxmark \
  -s /dev/ttyACM0:/dev/ttyACM0,/dev/ttyACM1:/dev/ttyACM1
```

### Bluetooth Device Binding

For Bluetooth scanning and analysis:

```bash
rfswift run -i penthertz/rfswift_noble:bluetooth -n bt_scanner \
  -s /dev/vhci:/dev/vhci \
  -a NET_ADMIN
```

{{< callout type="warning" >}}
Bluetooth and Wi-Fi tools typically require the `NET_ADMIN` capability in addition to device bindings. Add this with the `-a NET_ADMIN` parameter.
{{< /callout >}}

## Specialized Hardware Configuration

### Harogic Spectrum Analyzer Setup

Harogic spectrum analyzers require calibration files to function properly. Here's how to configure a container for use with these devices:

#### 1. Copy Calibration Files

First, copy the calibration files from the provided USB to your host:

![Content of Harogic USB key](/images/docs/harogicusb.png "Content of Harogic USB key")

```bash
# Copy from USB to host
cp -R /media/username/37B6-82D6/CalFile ~/harogic_cal
```

#### 2. Bind Calibration Directory

When creating your container, bind the calibration directory to the proper location:

```bash
rfswift run -i penthertz/rfswift_noble:sdr_light -n harogic_analysis \
  -b ~/harogic_cal:/rftools/analysers/SAStudio4_x86_64_05_23_17_06/bin/CalFile
```

#### 3. Run SAStudio

Once inside the container, you can run SAStudio with the calibration files properly configured:

```bash
# Inside the container
sastudio
```

![Harogic device running with SaStudio](/images/docs/harogicsas.png "Harogic device running with SaStudio")

#### Using Harogic with SDR++

To use Harogic devices with SDR++, copy the calibration files to the correct location:

```bash
# Inside the container
cp -R /rftools/analysers/SAStudio4_x86_64_05_23_17_06/bin/CalFile /usr/bin
```

Then launch SDR++:

```bash
sdrpp
```

![Running SDR++ with Harogic](/images/docs/harogicsdrpp.png "Running SDR++ with Harogic")

## Best Practices for File Sharing

1. **Use Consistent Directory Structures**: Create a standardized directory layout for your assessments to make file management easier
2. **Organize by Project**: Create separate shared directories for different projects or assessments
3. **Keep User Data Separate**: Use dedicated directories for user data, software configurations, and temporary files
4. **Bind Read-Only When Possible**: For reference data that shouldn't be modified, consider mounting as read-only
5. **Use Descriptive Container Names**: Name containers based on their purpose to easily identify bound directories later

## Troubleshooting

### Permission Issues

If you experience permission errors when accessing shared directories:

```bash
# On the host, ensure proper ownership
sudo chown -R your_username:your_username ~/shared_data

# Or make the directory world-writable (less secure)
chmod -R 777 ~/shared_data
```

### Missing Bindings

If default bindings are missing, you can restore them while adding your custom bindings:

```bash
rfswift run -i penthertz/rfswift_noble:sdr_full -n sdr_analysis \
  -b /tmp/.X11-unix:/tmp/.X11-unix,/dev/bus/usb:/dev/bus/usb,~/my_data:/root/my_data
```

## Next Steps

Now that you understand how to share files and devices, you might want to create your own customized images:

{{< cards >}}
  {{< card link="/docs/development/building-images/" title="Build Your Own Image" icon="beaker" subtitle="Become a master chef and create your own custom RF Swift images." >}}
{{< /cards >}}