---
title: ⚡ Caches and fast delivery
weight: 7
next: /docs/guide/sharing-files
prev: /docs/guide/installing-software
cascade:
  type: docs
---

# Caches and fast delivery

Nothing in RF Swift compiles on your machine unless it has to. Containers arrive as image layers, Nix environments as prebuilt store paths, and both engines keep a local cache, so the second environment, the second engagement or the second laptop costs a fraction of the first. This page says where those caches live, how to keep them small, and how a team runs its own for fast delivery on a LAN or with no internet at all.

## The local caches on your computer

### Container engines: the image store

Docker and Podman keep every pulled image in their store (`/var/lib/docker`, `~/.local/share/containers` for rootless Podman, the Lima VM's disk on macOS). Official images share their base layers, since they all derive from `corebuild`, so `sdr_full` next to `sdr_light` costs only what `sdr_full` adds. A pinned release (`sdr_full_1.0.0`) sits next to the rolling tag with the same sharing, and a container adds only its writable layer.

```bash
rfswift image local -v                 # what is on disk, with its version status
rfswift image rm                       # remove an image (picker)
rfswift system cleanup images          # unused images; "containers" or "all" for the rest
rfswift -q container shell -c radio    # disconnected: no registry query at all
```

`rfswift image pull` and the Workbench's Download button fetch only the layers the store lacks; an up-to-date image is a no-op. The freshness check compares local digests with the registry, and `-q` skips it.

### Nix: the store and its roots

Every Nix environment is a set of paths in `/nix/store`, shared between environments and with anything else Nix built on the machine: two environments that both need GNU Radio hold one copy. What keeps a path alive is a GC root, and RF Swift owns a few under `~/.rfswift/nix/`:

| Root | What it protects |
|---|---|
| `environments/<name>/profile` | The environment's current closure |
| `environments/<name>/prerequisites` | Its device and library layer (the udev rules are read from there) |
| `environments/<name>/tools/` | Tools an on-demand (`--lazy`) environment built so far |
| `environments/<name>/generations/` | Rollback points of eager environments |
| `gl/` | The OpenGL runtime (Mesa, or the matching NVIDIA libraries) |

Everything else is garbage the moment nothing references it:

```bash
rfswift env gc --dry-run        # what would go
rfswift env gc --max-free 5G    # stop once 5 GB are free
rfswift env remove old          # drops that environment's roots first
```

Nix's own `nix store gc` does the same without the RF Swift bookkeeping; the roots above survive either.

## Where the prebuilt binaries come from

### Images: Docker Hub, or your registry

Official images are published on Docker Hub under `penthertz/rfswift_resolute`, one tag per image and architecture, plus numbered releases. RF Swift prepends that repository to short names; the `repotag` key of `config.ini` changes it, so a mirror or your own registry is one line:

```ini
[general]
repotag = registry.lab.internal:5000/penthertz/rfswift_resolute
```

### Nix: cache.nixos.org, and what builds on your machine

Standard nixpkgs packages come prebuilt from `cache.nixos.org`, which Nix uses out of the box, and that is most of every environment. RF Swift's own derivations (patched SDR tools, forks, the assembled environments) are the part that builds on your machine, once: the local store keeps them, and every later environment or update reuses them. PentHertz builds the same derivations in CI into a private binary cache for its own machines; it is not open to the public at this point, so there is no token to ask for. The section below shows how to run that kind of cache for your own team, with the same attic deployment.

## Running your own cache for a team

Fast delivery on a site means the second laptop never touches the internet for what the first one already has. Both engines have a simple route and a full one.

### Images

- **Pull-through mirror**: run the standard registry as a proxy (`registry:2` with `REGISTRY_PROXY_REMOTEURL=https://registry-1.docker.io`) and declare it as a mirror in Docker's `daemon.json` (`registry-mirrors`) or Podman's `registries.conf` (`[[registry.mirror]]`). RF Swift needs no change: pulls of `penthertz/rfswift_resolute:*` go through the mirror and stay there.
- **Your own repository**: push the images you use (`docker tag` and `docker push` to `registry.lab.internal:5000/penthertz/rfswift_resolute:sdr_full`) and set `repotag` as above on every client.
- **No network at all**: `rfswift image download -i sdr_full -o sdr_full.tar.gz` on the online machine, then `rfswift image import image -i sdr_full.tar.gz` on the other one; `rfswift image export container -c radio -o radio.tar.gz` carries a customised container the same way. The [air-gapped guide](/docs/air-gapped-installation) walks through a full offline setup.

### Nix environments

- **A shared directory or an S3 bucket**: `nix copy` writes a binary cache anywhere Nix can read back. Sign it once with a key of your own, and every client that trusts the key substitutes from it:

  ```bash
  nix key generate-secret --key-name lab-1 > /etc/nix/lab-1.secret
  nix key convert-secret-to-public < /etc/nix/lab-1.secret       # goes into the clients' trusted keys
  nix copy --to 'file:///mnt/share/nixcache?secret-key=/etc/nix/lab-1.secret' \
      ~/.rfswift/nix/environments/radio/profile ~/.rfswift/nix/environments/radio/prerequisites
  ```

  Clients add `extra-substituters = file:///mnt/share/nixcache` (or `s3://bucket?region=...`) and the public key to `nix.conf`. Creating the same environment on those clients then downloads from the share.
- **A real cache server**: the [nix-cache-infra](https://github.com/PentHertz/RF-Swift-nix/tree/main/nix-cache-infra) directory of RF-Swift-nix is the deployment PentHertz runs for itself: [attic](https://github.com/zhaofengli/attic) with S3 storage, TLS and token access, managed with Nix on a small VPS, with scripts to mint tokens and to push and promote closures from CI. Deploy it for your organisation, mint a reader token per user, and point every client at it. For a cache reachable as `nixcache.lab.internal` the client side is:

  ```
  # /etc/nix/nix.conf
  extra-substituters = https://nixcache.lab.internal/release
  extra-trusted-public-keys = release:<public key printed by "attic cache info release">
  ```

  with the token in `/etc/nix/netrc` (`machine nixcache.lab.internal` on one line, `password <reader token>` on the next, root-owned, mode 600), then a daemon restart. The full client walkthrough, including the daemon and `trusted-users` details, is [RF-Swift-nix/docs/binary-cache.md](https://github.com/PentHertz/RF-Swift-nix/blob/main/docs/binary-cache.md).
- **Sneakernet**: `rfswift env export radio -o radio.rfenv` packs the closure and the workspace; `rfswift env import radio.rfenv` restores both on a machine that only has Nix installed. Nothing is compiled on the receiving side.

Whichever route: the first build happens once, on one machine or in CI, and the rest of the team pulls bytes.
