---
title: Helper Functions Reference
weight: 3
prev: /docs/development/building-custom-images
cascade:
  type: docs
---

# RF Swift Helper Functions Reference

This page documents the Bash helper functions used in the RF Swift container build system. These utilities simplify logging, dependency management, source code builds, and network operations.

Most helpers implement retry logic and consistent logging to ensure resilience and ease of use when building custom images or tools.

---

## 🎨 Output & Logging Functions

| Function | Description |
|----------|-------------|
| `colorecho <message>` | Prints a blue-colored message to indicate neutral info |
| `goodecho <message>` | Prints a green-colored message for successful actions |
| `criticalecho <message>` | Prints a red-colored message and exits with error code 1 |
| `criticalecho-noexit <message>` | Prints a red-colored message without exiting |

Example:
```bash
goodecho "Installation complete!"
criticalecho "An unrecoverable error occurred."
```

---

## 📦 Package Installation Helpers

### `installfromnet <command>`

Executes a given shell command up to 5 times with 15-second intervals between attempts. Useful for flaky downloads or network-related tasks.

Example:
```bash
installfromnet "wget http://example.com/tool.tar.gz"
```

---

### `install_dependencies "<packages>"`

Installs Debian packages using `apt-fast`, with retry logic.

Example:
```bash
install_dependencies "python3-numpy python3-scipy g++"
```

---

### `check_and_install_lib <lib-name> <pkg-config-name>`

Checks whether a library is installed via `pkg-config`. If not found, attempts to install it via `apt-fast`.

Example:
```bash
check_and_install_lib "libusb-1.0-0-dev" "libusb-1.0"
```

---

## 🐍 Python Installer Helper

### `pip3install <args>`

Installs Python packages using `pip3` with retry logic. Supports both single package installs and `requirements.txt` files.

Examples:
```bash
pip3install scikit-learn
pip3install -r requirements.txt
```

---

## 🧬 Git and Source Management

### `gitinstall <repo-url> <method> <branch>`

Clones or updates a Git repository. On success, logs the repository metadata to `/var/lib/db/rfswift_github.lst`. Also initializes submodules if needed.

Example:
```bash
gitinstall "https://github.com/example/tool.git" "tool_install" "main"
```

---

### `cmake_clone_and_build <repo-url> <build-dir> <branch> <reset-commit> <method> [cmake-args...]`

Clones a Git repository, optionally resets to a specific commit/tag, then configures and builds the project using CMake.

Arguments:
- `repo-url`: URL of the Git repository
- `build-dir`: Relative build path within the repo
- `branch`: Git branch to use (optional)
- `reset-commit`: Commit or tag to reset to (optional)
- `method`: Name of the install function (used in logs)
- `[cmake-args...]`: Additional arguments passed to `cmake`

Example:
```bash
cmake_clone_and_build "https://github.com/example/project.git" "build" "main" "v1.0.0" "mytool_install" -DENABLE_X=ON
```

---

### `grclone_and_build <repo-url> <subdir> <method> [-b branch] [cmake-args...]`

Simplified wrapper for `cmake_clone_and_build`, designed for GNU Radio OOT modules.

Example:
```bash
grclone_and_build "https://github.com/author/gr-foo.git" "gr-foo" "gr_foo_install" -b dev -DENABLE_DOCS=OFF
```

---

## 🧠 Summary Table

| Category | Function | Description |
|----------|----------|-------------|
| Output | `colorecho` | Info messages (blue) |
| Output | `goodecho` | Success messages (green) |
| Output | `criticalecho` | Error + exit (red) |
| Output | `criticalecho-noexit` | Error only (red) |
| Install | `installfromnet` | Retry logic for flaky commands |
| Install | `install_dependencies` | Apt-based dependency installation |
| Install | `check_and_install_lib` | Lib check + install via `pkg-config` |
| Python | `pip3install` | Retry pip install |
| Git | `gitinstall` | Clone/update and log repos |
| Build | `cmake_clone_and_build` | Git clone + CMake build |
| Build | `grclone_and_build` | Optimized for GNU Radio modules |

---

## 💡 Tips

- Always use `installfromnet` when working with downloads or Git operations in Dockerfiles.
- Group commands in a single `RUN` line in Dockerfiles to reduce layers.
- Clean build directories and cache files to keep image size minimal.
- You can extend the helper library by placing new functions in `images/scripts/common.sh` or custom scripts.

---

## Related Docs

{{< cards >}}
  {{< card link="/docs/development/building-custom-images" title="Build Custom Images" icon="box" subtitle="Use these helpers in your own container builds" >}}
  {{< card link="/docs/guide/configurations" title="System Configuration" icon="cog" subtitle="Tune RF Swift for your hardware" >}}
  {{< card link="https://github.com/PentHertz/RF-Swift" title="Contribute" icon="github" subtitle="Improve or extend these helper functions on GitHub" >}}
{{< /cards >}}