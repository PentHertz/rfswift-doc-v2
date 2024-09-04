---
title: Building images
weight: 2
prev: /docs/development/compiling-rfswift
cascade:
  type: docs
---


Available images are all present in the `images` submodule that can be checked with git as follows inside RF Swift root directory:

```bash
git submodule update --init --recursive
```

When entering the `images` directory, you can see different files and directory:

* **config**: where configurations files are stored for specific tools;
* **Dockerfiles**: Docker files to build images;
* **rules**: some dev rules files specific to devices;
* **run**: bash script we want to run;
* **scripts**: installation scripts.

To build you own images, the important dicterories are `scripts` and `Dockerfiles`.

## Making a custom image

So let say we want to cook a light images, for an RTL-SDR v4 device only, and just need GQRX tool, we can use the `corebuild` images reference at the begining of our Docker file:

```
FROM penthertz/rfswift:corebuild
```

To make the image be recognized by RF Swift, we need to use also the following labels:

```
LABEL "org.container.project"="rfswift"
LABEL "org.container.author"="Super author" # optional
```

After that, you can put all function you want to install, but remember to update packages manager list first:

```
...
RUN apt-fast update # required before!

RUN ./entrypoint.sh rtlsdrv4_devices_install && \
    ./entrypoint.sh gqrx_soft_install
...
```

And voilà!

Do not hesitate to finish the Docker file cleaning stuff:

```
# Cleaning and quitting
WORKDIR /root/
RUN rm -rf /root/thirdparty && \
  rm -rf /root/rules/ && \
  rm -rf /root/config/ && \
  apt-fast clean
RUN DEBIAN_FRONTEND=noninteractive rm -rf /var/lib/apt/lists/*
```

## Making your own installation function

### Creating a source file

Installation functions are called by `entrypoint.sh` script inside `RF-Swift/images/scripts` directory.

The different installation function are included in some script files:

```bash
$ ls
automotive_software.sh  common.sh     entrypoint.sh      lab_software.sh      rf_tools.sh    sast_software.sh    sdr_softwares.sh     terminal_harness.sh
cal_devices.sh          corebuild.sh  gr_oot_modules.sh  reverse_software.sh  sa_devices.sh  sdr_peripherals.sh  telecom_software.sh
```

If you want to create a new script file, and include it, you need also to include it in `entrypoint.sh` as follows:

```bash
#!/bin/bash

...
source yournewsourcefile.sh
```

### Making functions

To make a function, you will then just need to call it as you whish, but something that could be practical and easy to copy for users such as:

```bash
function newsuper_soft_install() {
  // your code here
}
```

So you can then put any script you want, but do be efficient, we also provide you with some harness functions to make things easier


## List of harness functions

| Function              | Arguments                                                                                                                                                | Description                                                                                 |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| colorecho             | arg1: String                                                                                                                                             | Display text in blue                                                                        |
| criticalecho          | arg1: String                                                                                                                                             | Display error in red and exit 1                                                             |
| criticalecho-noexit   | arg1: String                                                                                                                                             | Display error in red only                                                                   |
| goodecho              | arg1: String                                                                                                                                             | Display text in green                                                                       |
| installfromnet        | arg1: String                                                                                                                                             | In case an internet action is not working, this function will do 5 attempt to get resources |
| install_dependencies  | arg1: String for dependencies                                                                                                                            | Function doing installfromnet 'apt-fast install -y <your dependencies>'                     |
| grclone_and_build     | arg1: repo URL; arg2: destination directory, arg3: function installation name; arg4: build dir for cmake; arg5: git branch; next args*: cmake arguments  | Function responsible to install GNU Radio modules from GitHub                               |
| gitinstall            | arg1: repo URL; arg2: function name that calls it; arg3: branch                                                                                          | Function that will fetch a git project                                                      |
| cmake_clone_and_build | arg1: repo URL, arg2: cmake build directory; arg3: branch; arg4: reset commit, if necessary; arg5: function name that calls it; other args*: cmake args* | Function that handles a cmake project from Git                                              |
| check_and_install_lib | arg1: library name to check; arg2: pkg config name                                                                                                       | Checks if library exist, and install it if not detected                                     |