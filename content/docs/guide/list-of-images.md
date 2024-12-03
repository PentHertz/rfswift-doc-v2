---
title: Container images
weight: 2
next: /docs/guide/list-of-tools
prev: /docs/guide/running-rf-swift
cascade:
  type: docs
---

RF Swift has an `images` options that allows to deal with remote and local images.

Let us discover these different options.

## Remote images

You can list remote images associated to the architecture you are using with the `images remote` command set:

```bash
rfswift images remote
...
  💿 Official Images                                                                                                 
┌──────────────────────────────┬──────────────────────┬────────────────────────────────────────────────┬──────────────┐
│ Tag                          │ Pushed Date          │ Image                                          │ Architecture │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ bluetooth                    │ 2024-11-07T05:42:30Z │ penthertz/rfswift:bluetooth                    │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ reversing                    │ 2024-11-07T05:33:35Z │ penthertz/rfswift:reversing                    │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ sdrsa_devices_antsdr         │ 2024-11-07T02:42:15Z │ penthertz/rfswift:sdrsa_devices_antsdr         │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ sdr_full_amd64               │ 2024-11-07T02:38:30Z │ penthertz/rfswift:sdr_full_amd64               │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ telecom_2Gto3G               │ 2024-11-07T02:06:18Z │ penthertz/rfswift:telecom_2Gto3G               │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ sdr_light                    │ 2024-11-07T01:51:47Z │ penthertz/rfswift:sdr_light                    │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ wifi_amd64                   │ 2024-11-07T01:17:27Z │ penthertz/rfswift:wifi_amd64                   │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ bluetooth_amd64              │ 2024-11-07T01:00:11Z │ penthertz/rfswift:bluetooth_amd64              │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ telecom_2Gto3G_amd64         │ 2024-11-07T00:44:47Z │ penthertz/rfswift:telecom_2Gto3G_amd64         │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ automotive                   │ 2024-11-07T00:38:37Z │ penthertz/rfswift:automotive                   │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ reversing_amd64              │ 2024-11-07T00:37:29Z │ penthertz/rfswift:reversing_amd64              │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ deeptemptest_amd64           │ 2024-11-07T00:27:08Z │ penthertz/rfswift:deeptemptest_amd64           │ amd64        │
├──────────────────────────────┼──────────────────────┼────────────────────────────────────────────────┼──────────────┤
│ telecom_utils                │ 2024-11-07T00:23:12Z │ penthertz/rfswift:telecom_utils                │ amd64        │
...
```

You will see that some tag are specific to the architecture `sdr_light_amd64`, but others like `sdr_light` do not include the architecture.
First you should know that those two tags are the same, but `sdr_light` can be used also against aarch64/arm64, and riscv64 as well.

To better explain the different pre-compiled image, look at this table showing the main images you will be interested in:

{{< csv-table "content/docs/guide/precompimages.csv" >}}


Here is you will find images hierarchy:

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
    B[sdrsa_devices]-->J[wifi_basic];
    B[sdrsa_devices]-->L[telecom_utils];
    L-->M[telecom_2Gto3G];
    L-->N[telecom_4G_5GNSA];
    L-->O[telecom_5G];
    J-->P[wifi_full];
    H-->K[sdr_full]
```

So if you want to build one of your own, do not hesitate to take one these images as a reference.


## List local images

To list pulled, but also built images, you can issue the `images local` command, that will display these local images and details:

```bash
  📦 RF Swift Images                                                                                          
┌──────────────────────┬─────────────────┬──────────────┬───────────────────────────┬─────────────┬────────────┐
│ Repository           │ Tag             │ Image ID     │ Created                   │ Size        │ Status     │
├──────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┤
│ myrfswift            │ latest          │ sha256:0bdb2 │ 2024-09-01T00:56:27+02:00 │ 16635.22 MB │ Custom     │
├──────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┤
│ penthertz/rfswiftdev │ sdr_full_amd64  │ sha256:0bdb2 │ 2024-09-01T00:56:27+02:00 │ 16635.22 MB │ Up to date │
├──────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┤
│ penthertz/rfswiftdev │ sdr_light_amd64 │ sha256:476c0 │ 2024-09-01T00:34:55+02:00 │ 9617.12 MB  │ Up to date │
├──────────────────────┼─────────────────┼──────────────┼───────────────────────────┼─────────────┼────────────┤
│ penthertz/rfswift    │ sdr_full        │ sha256:50ce1 │ 2024-08-02T14:45:46+02:00 │ 10383.56 MB │ Custom     │
└──────────────────────┴─────────────────┴──────────────┴───────────────────────────┴─────────────┴────────────┘
```

{{< callout type="info" >}}
  The status can serve as a good indicator to show if the images are up-to-date when using official tags.
{{< /callout >}}

If an update is necessary you can issue a `images pull` command as follows:

```bash
rfswift images pull -i penthertz/rfswift:<tag_name>
```

## Next

In next pages, you will have a better idea of tools installed for each images, as well as other details.

Dive right into the following section to get started:

{{< cards >}}
  {{< card link="/docs/guide/list-of-tools" title="List of tools" icon="document-text" subtitle="List of tools per images." >}}
  {{< card link="/docs/guide/configurations" title="Configurations" icon="document-text" subtitle="Manage configurations in your profile and in RF Swift." >}}
{{< /cards >}}
