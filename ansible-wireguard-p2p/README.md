# Ansible WireGuard P2P Setup
This playbook automates the setup of a WireGuard P2P tunnel and Podman overlay network as described in the blog post.

## Directory Structure
- `ansible-wireguard-p2p/`
    - `inventory.ini`: List of hosts.
    - `group_vars/all.yml`: Common configuration (subnet, etc.).
    - `host_vars/<hostname>.yml`: Host-specific configuration (physical IP, WG IP, Pod IP, Peer info).
    - `templates/wg0.conf.j2`: WireGuard configuration template.
    - `playbook.yml`: The main Ansible playbook.
