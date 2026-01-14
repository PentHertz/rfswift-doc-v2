---
title: ports
weight: 18
prev: /docs/commands/cgroups
next: /docs/commands/last
---

# rfswift ports

Dynamically manage port bindings on running containers.

## Synopsis

```bash
# Bind port
rfswift ports bind -c CONTAINER -b "HOST_PORT:CONTAINER_PORT/PROTOCOL"

# Unbind port
rfswift ports unbind -c CONTAINER -b "HOST_PORT:CONTAINER_PORT/PROTOCOL"

# List port bindings
rfswift ports list -c CONTAINER
```

The `ports` command allows you to add, remove, or list port bindings for running containers without restarting them. This enables dynamic port mapping for network services.

---

## Subcommands

### ports bind

Add a port binding to a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-b, --binding STRING` | Port binding specification | Yes | `-b "8080:80/tcp"` |

### ports unbind

Remove a port binding from a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |
| `-b, --binding STRING` | Port binding specification | Yes | `-b "8080:80/tcp"` |

### ports list

List all port bindings for a container.

**Options:**

| Flag | Description | Required | Example |
|------|-------------|----------|---------|
| `-c, --container STRING` | Container ID or name | Yes | `-c my_container` |

---

## Port Binding Format

### Binding Syntax

Port bindings follow this format:

```
[host_ip:]host_port:container_port/protocol
```

**Components:**
- **host_ip**: Host IP to bind to (optional, defaults to 0.0.0.0)
- **host_port**: Port on host system
- **container_port**: Port inside container
- **protocol**: `tcp` or `udp`

### Binding Examples

**Basic TCP port:**
```bash
"8080:80/tcp"           # Host port 8080 → Container port 80 (TCP)
```

**UDP port:**
```bash
"5000:5000/udp"         # Host port 5000 → Container port 5000 (UDP)
```

**Same port both sides:**
```bash
"3000:3000/tcp"         # Port 3000 on both sides
```

**Specific host IP:**
```bash
"127.0.0.1:8080:80/tcp" # Only accessible from localhost
```

**Multiple port mappings:**
```bash
"8080:80/tcp"           # HTTP
"8443:443/tcp"          # HTTPS
"3000:3000/udp"         # Custom UDP service
```

---

## Examples

### Basic Usage

**Bind port:**
```bash
rfswift ports bind -c web_server -b "8080:80/tcp"
```

**Unbind port:**
```bash
rfswift ports unbind -c web_server -b "8080:80/tcp"
```

**List ports:**
```bash
rfswift ports list -c web_server
```

### Real-World Scenarios

**Web server on custom port:**
```bash
# Start container
rfswift run -i penthertz/rfswift:sdr_full -n web_service

# Add web server port
rfswift ports bind -c web_service -b "8080:80/tcp"

# Start web server
rfswift exec -c web_service
python3 -m http.server 80
exit

# Access from host: http://localhost:8080
```

**Multiple service ports:**
```bash
# API server container
rfswift run -i penthertz/rfswift:sdr_full -n api_server

# Bind HTTP and HTTPS
rfswift ports bind -c api_server -b "8080:80/tcp"
rfswift ports bind -c api_server -b "8443:443/tcp"

# Add metrics port
rfswift ports bind -c api_server -b "9090:9090/tcp"

# List all bindings
rfswift ports list -c api_server
```

**UDP service:**
```bash
# Network analysis container
rfswift run -i penthertz/rfswift:sdr_full -n netflow

# Add UDP port for netflow
rfswift ports bind -c netflow -b "2055:2055/udp"

# Start netflow collector
rfswift exec -c netflow
nfcapd -p 2055
exit
```

**Development server:**
```bash
# Development container
rfswift run -i penthertz/rfswift:sdr_full -n dev_env

# Add development ports
rfswift ports bind -c dev_env -b "3000:3000/tcp"  # React dev server
rfswift ports bind -c dev_env -b "5000:5000/tcp"  # API backend
rfswift ports bind -c dev_env -b "35729:35729/tcp" # LiveReload
```

**Temporary port for testing:**
```bash
# Test container
rfswift run -i penthertz/rfswift:sdr_full -n test_service

# Bind port temporarily
rfswift ports bind -c test_service -b "9999:80/tcp"

# Run tests
curl http://localhost:9999

# Remove when done
rfswift ports unbind -c test_service -b "9999:80/tcp"
```

**Change port mapping:**
```bash
# Service running on port 8080
rfswift ports list -c service

# Switch to port 8081
rfswift ports unbind -c service -b "8080:80/tcp"
rfswift ports bind -c service -b "8081:80/tcp"

# Now accessible on port 8081
```

---

## Common Port Numbers

### Standard Ports

| Service | Port | Protocol | Use Case |
|---------|------|----------|----------|
| **HTTP** | 80 | TCP | Web servers |
| **HTTPS** | 443 | TCP | Secure web servers |
| **SSH** | 22 | TCP | Remote access |
| **FTP** | 21 | TCP | File transfer |
| **SMTP** | 25 | TCP | Email |
| **DNS** | 53 | TCP/UDP | Domain name service |
| **MySQL** | 3306 | TCP | Database |
| **PostgreSQL** | 5432 | TCP | Database |
| **Redis** | 6379 | TCP | Cache/database |
| **MongoDB** | 27017 | TCP | Database |

### Development Ports

| Service | Port | Use Case |
|---------|------|----------|
| **React Dev** | 3000 | React development server |
| **Node.js** | 3000, 8000 | Node applications |
| **Python HTTP** | 8000 | Python SimpleHTTPServer |
| **Flask** | 5000 | Flask development |
| **Django** | 8000 | Django development |
| **LiveReload** | 35729 | Live reload/hot reload |
| **Webpack** | 8080 | Webpack dev server |
| **Vite** | 5173 | Vite dev server |

### RF Swift Common Ports

| Service | Port | Use Case |
|---------|------|----------|
| **Web UI** | 8080 | Web interfaces |
| **API** | 8000 | REST APIs |
| **WebSocket** | 9000 | Real-time data |
| **Metrics** | 9090 | Prometheus metrics |
| **Status** | 8081 | Health checks |

---

## Security Considerations

### Binding to Specific IPs

**Public access (default):**
```bash
# Accessible from anywhere
rfswift ports bind -c service -b "8080:80/tcp"
# Binds to 0.0.0.0:8080
```

**Localhost only:**
```bash
# Only accessible from host
rfswift ports bind -c service -b "127.0.0.1:8080:80/tcp"
# Binds to 127.0.0.1:8080
```

**Specific network interface:**
```bash
# Only accessible from specific IP
rfswift ports bind -c service -b "192.168.1.100:8080:80/tcp"
```

### Port Range Restrictions

**Safe port ranges:**
```bash
# User ports (1024-49151) - Safe for non-root users
rfswift ports bind -c service -b "8080:80/tcp"

# Dynamic/private ports (49152-65535) - Good for temporary services
rfswift ports bind -c service -b "50000:80/tcp"
```

**Avoid privileged ports:**
```bash
# Privileged ports (<1024) require special capabilities
# Use higher ports and reverse proxy if needed
rfswift ports bind -c service -b "8080:80/tcp"  # Good
# Not: rfswift ports bind -c service -b "80:80/tcp"  # Requires privileges
```

---

## Troubleshooting

### Port Already in Use

**Error:** `port is already allocated`

**Solutions:**
```bash
# Check what's using the port
netstat -tuln | grep :8080
lsof -i :8080

# Use different host port
rfswift ports bind -c service -b "8081:80/tcp"

# Or stop conflicting service
sudo systemctl stop service-using-8080

# Then bind
rfswift ports bind -c service -b "8080:80/tcp"
```

### Cannot Bind to Port

**Problem:** Binding fails without clear error

**Solutions:**
```bash
# Check if container is running
docker ps | grep container_name

# Check permissions for low ports (<1024)
# Use higher port instead
rfswift ports bind -c service -b "8080:80/tcp"

# Check firewall rules
sudo iptables -L -n | grep 8080

# Check if port is blocked
sudo ufw status
```

### Service Not Accessible

**Problem:** Port bound but service not accessible

**Solutions:**
```bash
# Check binding was successful in the summary & test from inside container first
rfswift exec -c container
curl localhost:80
exit

# If works inside, check from host
curl localhost:8080

# Check container network mode
docker inspect container | grep -A5 NetworkMode

# Verify firewall
sudo iptables -L -n
sudo ufw status
```

### Wrong Protocol

**Problem:** Service works with TCP but not UDP (or vice versa)

**Solutions:**
```bash
# Check protocol in binding
rfswift ports list -c container

# Bind correct protocol
rfswift ports bind -c service -b "5000:5000/udp"

# Some services need both
rfswift ports bind -c service -b "53:53/tcp"
rfswift ports bind -c service -b "53:53/udp"
```

### Port Unbind Fails

**Problem:** Cannot remove port binding

**Solutions:**
```bash
# Check exact binding
rfswift ports list -c container

# Use exact binding string
rfswift ports unbind -c container -b "8080:80/tcp"

# If still fails, may need container restart
# (as last resort)
```

---

## Related Commands

- [`run`](/docs/commands/run) - Create containers with initial port bindings
- [`exec`](/docs/commands/exec) - Access container to test services
- [`bindings`](/docs/commands/bindings) - Manage volume/device bindings
- [`last`](/docs/commands/last) - List containers with port information

---

{{< callout emoji="🔌" >}}
**Dynamic Port Mapping**: The `ports` command enables adding and removing port bindings without restarting containers. Perfect for development when you need to expose services on the fly!
{{< /callout >}}

{{< callout type="warning" >}}
**Privileged Ports**: Ports below 1024 require special privileges. Use ports 1024+ (like 8080 instead of 80) to avoid permission issues. Set up a reverse proxy if you need standard ports.
{{< /callout >}}

{{< callout type="info" >}}
**Protocol Matters**: Always specify the protocol (`/tcp`, `/sctp` or `/udp`) in your binding. Some services need both protocols on the same port - bind each separately!
{{< /callout >}}