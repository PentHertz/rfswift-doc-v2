---
title: Compiling RF Swift from Source
weight: 1
prev: /docs/development
next: /docs/development/building-images
cascade:
  type: docs
---

# Building RF Swift from Source

RF Swift is two Go programs in one repository: the lean `rfswift` CLI/TUI (which also contains the remote agent) and the `rfswift-workbench` desktop GUI. This guide builds both, for your machine or for another architecture.

## Prerequisites

- **Go 1.27 or later** (the modules declare `go 1.27.1` and the Go toolchain downloads it on its own when yours is older; distribution packages are often older, take the archive from [go.dev/dl](https://go.dev/dl/))
- Git
- A container engine (Docker or Podman) or Nix to run what you build
- For the Workbench on Linux: the GTK 3 and WebKitGTK 4.1 development packages (`make deps` installs them on apt, dnf, pacman, zypper and apk). macOS and Windows need nothing extra, the webview ships with the OS

{{% steps %}}

### Clone the repository

```bash
git clone https://github.com/PentHertz/RF-Swift.git
cd RF-Swift
```

### Build the CLI

```bash
cd go/rfswift
CGO_ENABLED=0 go build -tags netgo -o rfswift .
./rfswift --version
```

`CGO_ENABLED=0` with `netgo` gives the static binary the releases ship (it runs on a headless Raspberry Pi as well as on a laptop). Cross-compile by setting the target:

```bash
CGO_ENABLED=0 GOOS=linux   GOARCH=arm64   go build -tags netgo -o rfswift_arm64 .
CGO_ENABLED=0 GOOS=linux   GOARCH=riscv64 go build -tags netgo -o rfswift_riscv64 .
CGO_ENABLED=0 GOOS=windows GOARCH=amd64   go build -tags netgo -o rfswift.exe .
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64   go build -tags netgo -o rfswift_macos .
```

`scripts/build_project.sh` runs the same build for the host, and `scripts/build-windows.bat` does it on Windows.

### Build the Workbench

The Workbench is a separate module under `go/rfswift-workbench` (it links the CLI's packages through a module replacement, never shells out to the CLI). It needs cgo and the platform webview, so it cannot be a static binary on Linux.

```bash
cd go/rfswift-workbench
make deps          # Linux only: GTK 3 + WebKitGTK 4.1 headers
make build         # runs the Wails CLI through `go run`, no separate install needed
ls build/bin/
```

Build it against your own system's WebKit: a binary linked to another WebKit (one built inside Nix, for example) can fail to initialise OpenGL and show a blank window. The `Makefile` and `.github/workflows/workbench.yml` hold the release matrix (native Linux and AppImage, universal macOS `.app`, Windows `.exe`).

### Test

```bash
cd go/rfswift
go test ./...
go vet ./...

cd ../rfswift-workbench
make security-test         # go test, go vet, frontend sink guards, short fuzz campaigns
```

`scripts/test-remote.sh unit|fuzz|all` exercises the remote agent's security core, and `scripts/test-installer.sh` the shell installer.

### Install

```bash
sudo install -m 0755 go/rfswift/rfswift /usr/local/bin/rfswift
```

Man pages for the Linux packages are generated from the command tree with `go run ./tools/genman <dir>` (from `go/rfswift`), and `scripts/generate-packaging-assets.sh` prepares everything the deb, rpm and pacman packages contain.

{{% /steps %}}

## Running what you built

```bash
rfswift doctor
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n my_sdr_container
rfswift container shell -c my_sdr_container
```

On Linux Docker, grant your user socket access once with `rfswift host docker-access` instead of running the binary with `sudo`.

## Developing the Nix engine

The environments live in the companion [RF-Swift-nix](https://github.com/PentHertz/RF-Swift-nix) flake. Clone it next to `RF-Swift` and RF Swift uses your local checkout automatically (or set `RFSWIFT_NIX_FLAKE=/path/to/RF-Swift-nix`); `rfswift env update --input nixpkgs <name>` and `rfswift env rebuild <name>` work against that writable checkout.

## Troubleshooting

- **Go module issues**: `go clean -modcache`, then build again.
- **Wrong Go version**: `go version` must print 1.27 or later; distribution packages lag behind.
- **Workbench blank window on Linux**: rebuild against the system WebKit (`make deps` then `make build`), or use the AppImage.
- **Docker permissions**: `rfswift host docker-access`.

## Next steps

{{< cards >}}
  {{< card link="/docs/development/building-images" title="Build Custom Images" icon="beaker" subtitle="Create your own specialized container images" >}}
  {{< card link="/docs/development/yaml-recipe-guide" title="YAML Recipe Guide" icon="document-text" subtitle="Images from simple recipes" >}}
  {{< card link="/docs/guide" title="User Guide" icon="book-open" subtitle="Explore the complete documentation" >}}
{{< /cards >}}
