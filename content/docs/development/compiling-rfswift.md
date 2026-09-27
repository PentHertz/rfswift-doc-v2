---
title: "Compiling RF Swift from source"
linkTitle: "Compile from source"
level: advanced
description: "Build the rfswift CLI and the Workbench from source, for your machine or another architecture."
weight: 1
---

RF Swift is two Go programs in one repository:

- the lean `rfswift` CLI/TUI, which also contains the remote agent;
- the `rfswift-workbench` desktop GUI.

This guide builds both, for your machine or for another architecture. You need it to test changes, contribute, or target a platform that has no release build.

## Prerequisites

- **Go 1.27 or later.** The modules declare `go 1.27.1`, and the Go toolchain downloads it by itself when yours is older. Distribution packages are often older; take the archive from [go.dev/dl](https://go.dev/dl/).
- **Git.**
- **A container engine** (Docker or Podman) **or Nix**, to run what you build.
- **For the Workbench on Linux:** the GTK 3 and WebKitGTK 4.1 development packages. `make deps` installs them on apt, dnf, pacman, zypper and apk. macOS and Windows need nothing extra: the webview ships with the OS.

{{% steps %}}

### Clone the repository

```bash
git clone https://github.com/PentHertz/RF-Swift.git
cd RF-Swift
```

### Build the CLI

Build a static binary and check that it runs:

```bash
cd go/rfswift
CGO_ENABLED=0 go build -tags netgo -o rfswift .
./rfswift --version
```

`CGO_ENABLED=0` with the `netgo` tag gives the same static binary the releases ship. It runs on a headless Raspberry Pi as well as on a laptop.

To cross-compile, set the target system and architecture:

```bash
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64   go build -tags netgo -o rfswift_arm64 .
CGO_ENABLED=0 GOOS=linux   GOARCH=riscv64 go build -tags netgo -o rfswift_riscv64 .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64   go build -tags netgo -o rfswift.exe .
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64   go build -tags netgo -o rfswift_macos .
```

`scripts/build_project.sh` runs the same build for the host, and `scripts/build-windows.bat` does it on Windows.

### Build the Workbench

The Workbench is a separate module under `go/rfswift-workbench`. It links the CLI's packages through a module replacement and never shells out to the CLI. It needs cgo and the platform webview, so on Linux it cannot be a static binary.

```bash
cd go/rfswift-workbench
make deps          # Linux only: GTK 3 + WebKitGTK 4.1 headers
make build         # runs the Wails CLI through `go run`, no separate install needed
ls build/bin/
```

Build it against your own system's WebKit. A binary linked to another WebKit (one built inside Nix, for example) can fail to initialise OpenGL and show a blank window. The `Makefile` and `.github/workflows/workbench.yml` hold the release matrix: native Linux and AppImage, universal macOS `.app`, Windows `.exe`.

### Test

Run the unit tests and checks of both modules:

```bash
cd go/rfswift
go test ./...
go vet ./...

cd ../rfswift-workbench
make security-test         # go test, go vet, frontend sink guards, short fuzz campaigns
```

Two more scripts test specific parts: `scripts/test-remote.sh unit|fuzz|all` exercises the remote agent's security core, and `scripts/test-installer.sh` tests the shell installer.

### Install

Copy the binary onto your `PATH`:

```bash
sudo install -m 0755 go/rfswift/rfswift /usr/local/bin/rfswift
```

For packaging: `go run ./tools/genman <dir>` (from `go/rfswift`) generates the man pages from the command tree, and `scripts/generate-packaging-assets.sh` prepares everything the deb, rpm and pacman packages contain.

{{% /steps %}}

## Running what you built

Check the host, then create and enter a lab:

```bash
rfswift doctor
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n my_sdr_container
rfswift container shell -c my_sdr_container
```

On Linux with Docker, give your user access to the Docker socket once with `rfswift host docker-access`, instead of running the binary with `sudo`.

## Developing the Nix engine

The Nix environments live in the companion [RF-Swift-nix](https://github.com/PentHertz/RF-Swift-nix) flake. Clone it next to `RF-Swift` and RF Swift uses your local checkout automatically, or point to it with `RFSWIFT_NIX_FLAKE=/path/to/RF-Swift-nix`. With that writable checkout, `rfswift env update --input nixpkgs <name>` and `rfswift env rebuild <name>` work against your changes.

## Troubleshooting

### Go module errors

Clear the module cache, then build again: `go clean -modcache`.

### Wrong Go version

`go version` must print 1.27 or later. Distribution packages often lag behind; use the archive from go.dev.

### The Workbench shows a blank window on Linux

Rebuild it against the system WebKit (`make deps`, then `make build`), or use the AppImage.

### "Permission denied" on the Docker socket

Run `rfswift host docker-access` once.

## Next steps

{{< cards >}}
  {{< card link="/docs/development/yaml-recipe-guide/" title="YAML recipe guide" subtitle="Build your own images from a short recipe" >}}
  {{< card link="/docs/development/building-images/" title="Helper functions" subtitle="The build helpers you can use in recipes and Dockerfiles" >}}
  {{< card link="/docs/guide/" title="User guide" subtitle="Explore the complete documentation" >}}
{{< /cards >}}
