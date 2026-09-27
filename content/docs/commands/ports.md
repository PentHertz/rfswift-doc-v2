---
title: "rfswift config ports"
linkTitle: "config ports"
navGroup: "Runtime configuration"
level: reference
description: "Expose and publish ports on an existing container."
weight: 45
---

`rfswift config ports` opens or closes network ports on a container you already created. Use it to reach a service running in the container (a web interface, an API, a collector) from your computer or from other containers.

The most common use publishes a web interface on your computer only:

```bash
rfswift config ports bind -c web -b "127.0.0.1:8080:80/tcp"
```

Publishing ports matters when the container uses an isolated network such as `bridge` or `nat`. The default `host` mode has no network isolation, so a service in the container already uses your computer's ports. See the [network modes](/docs/commands/run/#network-modes--t---network).

{{< callout type="info" title="What happens when you apply a change" >}}
The container restarts, so save your work first. On Linux with Docker, the change is applied in place after one `sudo` prompt. On Podman, the container is committed and created again; add `--recreate` to use that method on Docker too. The shorter spelling `rfswift ports` also works. See [config](/docs/commands/config).
{{< /callout >}}

## Synopsis

Expose a port to other containers, or stop exposing it:

```bash
rfswift config ports expose   -c CONTAINER -p "PORT/PROTOCOL"
rfswift config ports unexpose -c CONTAINER -p "PORT/PROTOCOL"
```

Publish a container port on a host port, or remove it:

```bash
rfswift config ports bind   -c CONTAINER -b "HOST_PORT:CONTAINER_PORT/PROTOCOL"
rfswift config ports unbind -c CONTAINER -b "HOST_PORT:CONTAINER_PORT/PROTOCOL"
```

## Subcommands

### expose and unexpose

`expose` makes a port available to other containers on the same network. `unexpose` removes it.

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-c, --container STRING` | The container, by name or ID | Yes | `-c my_container` |
| `-p, --port STRING` | The port and protocol | Yes | `-p "8080/tcp"` |

### bind and unbind

`bind` publishes a container port on a port of your computer, so you can reach the service from the host. `unbind` removes it.

| Flag | What it does | Required | Example |
|------|--------------|----------|---------|
| `-c, --container STRING` | The container, by name or ID | Yes | `-c my_container` |
| `-b, --binding STRING` | The binding, see the format below | Yes | `-b "8080:80/tcp"` |

## Binding format

```
[host_ip:]host_port:container_port/protocol
```

- **host_ip** (optional): the address on your computer to listen on. The default is `0.0.0.0`, which means every network interface.
- **host_port**: the port on your computer.
- **container_port**: the port inside the container.
- **protocol**: `tcp`, `udp` or `sctp`. Always write it; a service that needs two protocols needs one binding for each.

Examples:

```bash
"8080:80/tcp"           # Host port 8080 -> Container port 80 (TCP)
"5000:5000/udp"         # Host port 5000 -> Container port 5000 (UDP)
"3000:3000/tcp"         # Port 3000 on both sides
"127.0.0.1:8080:80/tcp" # Only accessible from localhost
```

Several services at once, one binding each:

```bash
"8080:80/tcp"           # HTTP
"8443:443/tcp"          # HTTPS
"3000:3000/udp"         # Custom UDP service
```

## Examples

Expose a port to other containers:

```bash
rfswift config ports expose -c web_server -p "80/tcp"
```

Publish it on port 8080 of your computer:

```bash
rfswift config ports bind -c web_server -b "8080:80/tcp"
```

Remove the published port, then stop exposing it:

```bash
rfswift config ports unbind -c web_server -b "8080:80/tcp"
rfswift config ports unexpose -c web_server -p "80/tcp"
```

### A web server on a custom port

Publish port 80 of the container on port 8080, start a web server inside, then open `http://localhost:8080` on your computer:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n web_service
rfswift config ports bind -c web_service -b "8080:80/tcp"

rfswift container shell -c web_service
python3 -m http.server 80
exit
```

### Several services

Publish HTTP, HTTPS and a metrics port, and expose the same ports to other containers:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n api_server

rfswift config ports bind -c api_server -b "8080:80/tcp"
rfswift config ports bind -c api_server -b "8443:443/tcp"
rfswift config ports bind -c api_server -b "9090:9090/tcp"

rfswift config ports expose -c api_server -p "80/tcp"
rfswift config ports expose -c api_server -p "443/tcp"
rfswift config ports expose -c api_server -p "9090/tcp"
```

### A UDP service

Publish a UDP port, then start a NetFlow collector on it:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n netflow
rfswift config ports bind -c netflow -b "2055:2055/udp"

rfswift container shell -c netflow
nfcapd -p 2055
exit
```

### A development setup

Publish the ports of a front-end server, an API backend and LiveReload:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n dev_env
rfswift config ports bind -c dev_env -b "3000:3000/tcp"  # React dev server
rfswift config ports bind -c dev_env -b "5000:5000/tcp"  # API backend
rfswift config ports bind -c dev_env -b "35729:35729/tcp" # LiveReload
```

### A temporary port for testing

Publish a port, test it, and remove it when you are done:

```bash
rfswift container create -i penthertz/rfswift_resolute:sdr_full -n test_service
rfswift config ports bind -c test_service -b "9999:80/tcp"
curl http://localhost:9999
rfswift config ports unbind -c test_service -b "9999:80/tcp"
```

### Moving a service to another port

Remove the old binding and add the new one. The service is then on port 8081:

```bash
rfswift config ports unbind -c service -b "8080:80/tcp"
rfswift config ports bind -c service -b "8081:80/tcp"
```

## Common port numbers

### Standard services

| Service | Port | Protocol | Used for |
|---------|------|----------|----------|
| **HTTP** | 80 | TCP | Web servers |
| **HTTPS** | 443 | TCP | Secure web servers |
| **SSH** | 22 | TCP | Remote access |
| **FTP** | 21 | TCP | File transfer |
| **SMTP** | 25 | TCP | Email |
| **DNS** | 53 | TCP/UDP | Domain name service |
| **MySQL** | 3306 | TCP | Database |
| **PostgreSQL** | 5432 | TCP | Database |
| **Redis** | 6379 | TCP | Cache or database |
| **MongoDB** | 27017 | TCP | Database |

### Development servers

| Service | Port | Used for |
|---------|------|----------|
| **React Dev** | 3000 | React development server |
| **Node.js** | 3000, 8000 | Node applications |
| **Python HTTP** | 8000 | Python's built-in web server |
| **Flask** | 5000 | Flask development |
| **Django** | 8000 | Django development |
| **LiveReload** | 35729 | Live reload |
| **Webpack** | 8080 | Webpack dev server |
| **Vite** | 5173 | Vite dev server |

### Ports often used by tool interfaces

| Service | Port | Used for |
|---------|------|----------|
| **Web UI** | 8080 | Web interfaces |
| **API** | 8000 | REST APIs |
| **WebSocket** | 9000 | Real-time data |
| **Metrics** | 9090 | Prometheus metrics |
| **Status** | 8081 | Health checks |

## Security

### Choose who can reach the port

By default a published port listens on every network interface (`0.0.0.0`), so other machines on your network can reach it:

```bash
rfswift config ports bind -c service -b "8080:80/tcp"
```

To allow only your own computer, bind to localhost:

```bash
rfswift config ports bind -c service -b "127.0.0.1:8080:80/tcp"
```

To allow only one network interface, bind to its address:

```bash
rfswift config ports bind -c service -b "192.168.1.100:8080:80/tcp"
```

### Choose the host port

Ports 1024 to 49151 are fine for normal use, and 49152 to 65535 suit temporary services:

```bash
rfswift config ports bind -c service -b "8080:80/tcp"
rfswift config ports bind -c service -b "50000:80/tcp"
```

{{< callout type="warning" title="Avoid host ports below 1024" >}}
Host ports below 1024 need special privileges. Use a higher port (8080 instead of 80), and put a reverse proxy in front if you need the standard port.
{{< /callout >}}

```bash
rfswift config ports bind -c service -b "8080:80/tcp"  # Good
# Not: rfswift config ports bind -c service -b "80:80/tcp"  # Requires privileges
```

## Troubleshooting

### “port is already allocated”

Another program already uses that port on your computer. Find it, then either use another port or stop that program:

```bash
netstat -tuln | grep :8080
lsof -i :8080
```

```bash
rfswift config ports bind -c service -b "8081:80/tcp"
```

```bash
sudo systemctl stop service-using-8080
rfswift config ports bind -c service -b "8080:80/tcp"
```

### Binding fails without a clear error

Check that the container is running, use a port above 1024, and look at the firewall:

```bash
docker ps | grep container_name
rfswift config ports bind -c service -b "8080:80/tcp"
sudo iptables -L -n | grep 8080
sudo ufw status
```

### The port is published but the service does not answer

Test from inside the container first. If it works there, test from your computer, then check the container's network mode and the firewall:

```bash
rfswift container shell -c container
curl localhost:80
exit

curl localhost:8080

docker inspect container | grep -A5 NetworkMode
sudo iptables -L -n
sudo ufw status
```

### It works over TCP but not UDP (or the reverse)

Bind the protocol the service really uses. Some services, such as DNS, need both:

```bash
rfswift config ports bind -c service -b "5000:5000/udp"

rfswift config ports bind -c service -b "53:53/tcp"
rfswift config ports bind -c service -b "53:53/udp"
```

### Removing a binding fails

Use exactly the same binding string as when you added it. As a last resort, restart the container:

```bash
rfswift config ports unbind -c container -b "8080:80/tcp"
```

## Related commands

- [`run`](/docs/commands/run): create containers with published ports from the start
- [`exec`](/docs/commands/exec): open a shell to test a service
- [`bindings`](/docs/commands/bindings): folders and devices
- [`last`](/docs/commands/last): list containers with their ports
