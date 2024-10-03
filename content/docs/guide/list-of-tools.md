---
title: Included tools
weight: 3
next: /docs/guide/configurations
prev: /docs/guide/list-of-images
cascade:
  type: docs
---



{{< callout emoji="📈" >}}
   RF Swift is still in active development so more tools will be expected, and will readapted for all architectures as possible.
{{< /callout >}}

RF Swift prebuilt images are compiled with tools you can discover in the next sections.

Here you will find images hierarchy:

```mermaid
graph TD;
    A[corebuild]-->B[sdrsa_devices];
    A-->C[rfid];
    A-->D[automotive];
    A-->E[reversing];
    A-->F[sdrsa_devices_antsdr];
    A-->G[sdrsa_devices_rtlsdrv4];
    B[sdrsa_devices]-->H[sdr_light];
    B[sdrsa_devices]-->I[bluetooth];
    B[sdrsa_devices]-->J[wifi];
    B[sdrsa_devices]-->L[telecom_utils];
    J-->M[telecom_2Gto3G];
    J-->N[telecom_4Gto5G];
    H-->K[sdr_full]
```

## sdrsa_devices

{{< csv-table "content/docs/guide/tools_sdrsa_devices.csv" >}}

{{< callout type="info" >}}
  For RTL-SDR v4, the `rtlsdrv4_devices_install` function can be used instead. For ANTSDR, use `antsdr__devices_install`
{{< /callout >}}

## sdr_light

{{< csv-table "content/docs/guide/tools_for_sdr_light.csv" >}}

## sdr_full

### GNU Radio Out-Of-Tree Modules

{{< csv-table "content/docs/guide/tools_for_sdr_full_oot.csv" >}}

### Extra-softwares

{{< csv-table "content/docs/guide/tools_for_sdr_full.csv" >}}

## RFID

{{< csv-table "content/docs/guide/tools_for_rfid.csv" >}}


## Bluetooth

{{< csv-table "content/docs/guide/tools_for_bluetooth.csv" >}}

## Wi-Fi

{{< csv-table "content/docs/guide/tools_for_wifi.csv" >}}

## Telecom 

### Utils

{{< csv-table "content/docs/guide/tools_for_telecom_utils.csv" >}}

### 2G to 3G

{{< csv-table "content/docs/guide/tools_for_telecom_2gto3g.csv" >}}

### 4G to 5G

{{< csv-table "content/docs/guide/tools_for_telecom_4gto5g.csv" >}}

## Automotive

{{< csv-table "content/docs/guide/tools_for_automotive.csv" >}}

## Reversing

{{< csv-table "content/docs/guide/tools_for_reversing.csv" >}}
