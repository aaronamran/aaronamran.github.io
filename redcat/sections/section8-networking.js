/**
 * Section 8: Networking
 * 3 unique question sets for practice variety
 */

const section8Data = {
    id: 8,
    title: "Networking",
    description: "Configure network interfaces, firewall rules, and SSH access",
    totalPoints: 30,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Use nmcli to set a static IP address 192.168.1.100/24 on connection eth0",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "eth0", "ipv4.addresses", "192.168.1.100/24"] },
                    { command: "nmcli", requiredValues: ["con", "mod", "eth0", "ipv4.addresses", "192.168.1.100/24"] }
                ],
                allowedPreChecks: [
                    { command: "nmcli", requiredValues: ["connection", "show", "eth0"] }
                ],
                explanation: "nmcli connection modify configures network connection parameters.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Set the IPv4 method to manual for eth0 connection",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "eth0", "ipv4.method", "manual"] },
                    { command: "nmcli", requiredValues: ["con", "mod", "eth0", "ipv4.method", "manual"] }
                ],
                allowedPreChecks: [],
                explanation: "Setting method to manual enables static IP configuration.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Set the default gateway to 192.168.1.1 for eth0",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "eth0", "ipv4.gateway", "192.168.1.1"] },
                    { command: "nmcli", requiredValues: ["con", "mod", "eth0", "ipv4.gateway", "192.168.1.1"] }
                ],
                allowedPreChecks: [],
                explanation: "Gateway defines the router for outbound traffic.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Set DNS servers to 8.8.8.8 and 8.8.4.4 for eth0",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "eth0", "ipv4.dns", "\"8.8.8.8 8.8.4.4\""] },
                    { command: "nmcli", requiredValues: ["con", "mod", "eth0", "ipv4.dns", "8.8.8.8,8.8.4.4"] }
                ],
                allowedPreChecks: [],
                explanation: "DNS servers resolve domain names to IP addresses.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Activate the eth0 connection to apply changes",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "up", "eth0"] },
                    { command: "nmcli", requiredValues: ["con", "up", "eth0"] }
                ],
                allowedPreChecks: [],
                explanation: "Connection must be reactivated to apply configuration changes.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify eth0 IP address configuration",
                expected: [
                    { command: "ip", requiredValues: ["addr", "show", "eth0"] },
                    { command: "nmcli", requiredValues: ["connection", "show", "eth0"] },
                    { command: "ifconfig", requiredValues: ["eth0"] }
                ],
                explanation: "ip addr show displays current interface configuration.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Set the system hostname to webserver.example.com",
                expected: [
                    { command: "hostnamectl", requiredValues: ["set-hostname", "webserver.example.com"] },
                    { command: "hostnamectl", requiredValues: ["hostname", "webserver.example.com"] }
                ],
                allowedPreChecks: [
                    { command: "hostnamectl" },
                    { command: "hostname" }
                ],
                explanation: "hostnamectl manages system hostname persistently.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify the hostname change",
                expected: [
                    { command: "hostnamectl" },
                    { command: "hostname" },
                    { command: "cat", requiredValues: ["/etc/hostname"] }
                ],
                explanation: "hostnamectl shows all hostname details.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Add firewall rule to allow HTTP service (port 80)",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--add-service=http", "--permanent"] },
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--add-service=http"] }
                ],
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] }
                ],
                explanation: "--permanent makes firewall rules persist after reboot.",
                points: 3
            },
            {
                id: 10,
                category: "Implementation",
                description: "Reload firewall to apply permanent rules",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--reload"] }
                ],
                allowedPreChecks: [],
                explanation: "Firewall must be reloaded after adding permanent rules.",
                points: 2
            },
            {
                id: 11,
                category: "Audit",
                description: "List all enabled firewall services",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] },
                    { command: "firewall-cmd", requiredValues: ["--list-all"] }
                ],
                explanation: "--list-services displays currently allowed services.",
                points: 2
            },
            {
                id: 12,
                category: "Implementation",
                description: "Test network connectivity to 8.8.8.8 with 3 packets",
                expected: [
                    { command: "ping", requiredFlags: ["-c"], requiredValues: ["3", "8.8.8.8"] },
                    { command: "ping", requiredValues: ["-c", "3", "8.8.8.8"] }
                ],
                allowedPreChecks: [],
                explanation: "ping -c limits packet count for quick connectivity tests.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a new network connection named 'office' for interface enp0s8",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "add", "con-name", "office", "type", "ethernet", "ifname", "enp0s8"] },
                    { command: "nmcli", requiredValues: ["con", "add", "con-name", "office", "type", "ethernet", "ifname", "enp0s8"] }
                ],
                allowedPreChecks: [
                    { command: "nmcli", requiredValues: ["connection", "show"] }
                ],
                explanation: "nmcli connection add creates new network profiles.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Assign static IP 10.0.0.50/24 to the office connection",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "office", "ipv4.addresses", "10.0.0.50/24"] },
                    { command: "nmcli", requiredValues: ["con", "mod", "office", "ipv4.addresses", "10.0.0.50/24"] }
                ],
                allowedPreChecks: [],
                explanation: "Configure IP address on the newly created connection.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Set gateway to 10.0.0.1 and DNS to 10.0.0.2 for office connection",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "office", "ipv4.gateway", "10.0.0.1"] },
                    { command: "nmcli", requiredValues: ["connection", "modify", "office", "ipv4.dns", "10.0.0.2"] }
                ],
                allowedPreChecks: [],
                explanation: "Gateway and DNS complete network configuration.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Set IPv4 method to manual and bring up the office connection",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "office", "ipv4.method", "manual"] },
                    { command: "nmcli", requiredValues: ["connection", "up", "office"] }
                ],
                allowedPreChecks: [],
                explanation: "Manual method with connection up activates static configuration.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Display all active network connections",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "show", "--active"] },
                    { command: "nmcli", requiredValues: ["con", "show", "--active"] }
                ],
                explanation: "--active filters to show only currently active connections.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Set hostname to dbserver.lab.local",
                expected: [
                    { command: "hostnamectl", requiredValues: ["set-hostname", "dbserver.lab.local"] }
                ],
                allowedPreChecks: [
                    { command: "hostnamectl" }
                ],
                explanation: "Change system identity to dbserver.lab.local.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Display current hostname and related system info",
                expected: [
                    { command: "hostnamectl" },
                    { command: "hostnamectl", requiredValues: ["status"] }
                ],
                explanation: "Shows hostname, chassis type, virtualization, OS info.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Allow HTTPS traffic (port 443) through firewall permanently",
                expected: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--add-service=https"] },
                    { command: "firewall-cmd", requiredValues: ["--add-service=https", "--permanent"] }
                ],
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] }
                ],
                explanation: "HTTPS service allows secure web traffic.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Allow TCP port 8080 through firewall permanently",
                expected: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--add-port=8080/tcp"] },
                    { command: "firewall-cmd", requiredValues: ["--add-port=8080/tcp", "--permanent"] }
                ],
                allowedPreChecks: [],
                explanation: "--add-port allows specific port/protocol combinations.",
                points: 3
            },
            {
                id: 10,
                category: "Implementation",
                description: "Reload firewall and verify rules are active",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--reload"] },
                    { command: "firewall-cmd", requiredValues: ["--list-all"] }
                ],
                allowedPreChecks: [],
                explanation: "Reload applies permanent rules, list-all shows complete configuration.",
                points: 2
            },
            {
                id: 11,
                category: "Audit",
                description: "Show default firewall zone",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--get-default-zone"] }
                ],
                explanation: "Default zone applies to interfaces without explicit zone assignment.",
                points: 2
            },
            {
                id: 12,
                category: "Implementation",
                description: "Test DNS resolution for google.com",
                expected: [
                    { command: "nslookup", requiredValues: ["google.com"] },
                    { command: "dig", requiredValues: ["google.com"] },
                    { command: "host", requiredValues: ["google.com"] }
                ],
                allowedPreChecks: [],
                explanation: "nslookup, dig, or host verify DNS is functioning.",
                points: 2
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Set eth1 connection to use DHCP for IP configuration",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "modify", "eth1", "ipv4.method", "auto"] },
                    { command: "nmcli", requiredValues: ["con", "mod", "eth1", "ipv4.method", "auto"] }
                ],
                allowedPreChecks: [
                    { command: "nmcli", requiredValues: ["connection", "show", "eth1"] }
                ],
                explanation: "Method 'auto' enables DHCP for dynamic IP assignment.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Bring down and then up the eth1 connection",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "down", "eth1"] },
                    { command: "nmcli", requiredValues: ["connection", "up", "eth1"] }
                ],
                allowedPreChecks: [],
                explanation: "Cycling connection applies DHCP configuration.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display IP address obtained via DHCP on eth1",
                expected: [
                    { command: "ip", requiredValues: ["addr", "show", "eth1"] },
                    { command: "nmcli", requiredValues: ["device", "show", "eth1"] }
                ],
                explanation: "Verify DHCP lease was obtained successfully.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Delete the network connection named 'Wired connection 1'",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "delete", "\"Wired connection 1\""] },
                    { command: "nmcli", requiredValues: ["con", "del", "'Wired connection 1'"] }
                ],
                allowedPreChecks: [
                    { command: "nmcli", requiredValues: ["connection", "show"] }
                ],
                explanation: "nmcli connection delete removes connection profiles.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "List all network connections to confirm deletion",
                expected: [
                    { command: "nmcli", requiredValues: ["connection", "show"] },
                    { command: "nmcli", requiredValues: ["con", "show"] }
                ],
                explanation: "Deleted connection should no longer appear in list.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Change hostname to mailserver.company.org",
                expected: [
                    { command: "hostnamectl", requiredValues: ["set-hostname", "mailserver.company.org"] }
                ],
                allowedPreChecks: [],
                explanation: "Configure hostname for mail server role.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Show routing table",
                expected: [
                    { command: "ip", requiredValues: ["route"] },
                    { command: "ip", requiredValues: ["route", "show"] },
                    { command: "route", requiredFlags: ["-n"] }
                ],
                explanation: "ip route displays kernel routing table.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Remove HTTP service from firewall permanently",
                expected: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--remove-service=http"] },
                    { command: "firewall-cmd", requiredValues: ["--remove-service=http", "--permanent"] }
                ],
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] }
                ],
                explanation: "--remove-service blocks previously allowed traffic.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Block port 21 (FTP) permanently and reload firewall",
                expected: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--remove-port=21/tcp"] },
                    { command: "firewall-cmd", requiredValues: ["--reload"] }
                ],
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-ports"] }
                ],
                explanation: "Remove port permission to block FTP traffic.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display all open ports in the default zone",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--list-ports"] },
                    { command: "firewall-cmd", requiredValues: ["--list-all"] }
                ],
                explanation: "Shows which ports are explicitly allowed through firewall.",
                points: 2
            },
            {
                id: 11,
                category: "Implementation",
                description: "Configure SSH to allow root login by editing /etc/ssh/sshd_config",
                expected: [
                    { command: "vi", requiredValues: ["/etc/ssh/sshd_config"] },
                    { command: "nano", requiredValues: ["/etc/ssh/sshd_config"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^#PermitRootLogin.*/PermitRootLogin yes/'", "/etc/ssh/sshd_config"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["PermitRootLogin", "/etc/ssh/sshd_config"] }
                ],
                explanation: "Edit sshd_config to set PermitRootLogin yes (use cautiously).",
                points: 3
            },
            {
                id: 12,
                category: "Audit",
                description: "Verify SSH configuration and restart sshd",
                expected: [
                    { command: "sshd", requiredFlags: ["-t"] },
                    { command: "systemctl", requiredValues: ["restart", "sshd"] }
                ],
                explanation: "sshd -t tests config syntax before applying with restart.",
                points: 2
            }
        ],
        
        // Set 4: SSH basics
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Connect to remote server 192.168.1.100 as user 'admin' via SSH.",
                expected: [
                    { command: "ssh", requiredValues: ["admin@192.168.1.100"] },
                    { command: "ssh", requiredFlags: ["-l"], requiredValues: ["admin", "192.168.1.100"] }
                ],
                allowedPreChecks: [
                    { command: "ping", requiredFlags: ["-c", "3"], requiredValues: ["192.168.1.100"] }
                ],
                explanation: "ssh user@host establishes encrypted remote shell connection.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Check if SSH service is running.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "sshd"] },
                    { command: "systemctl", requiredValues: ["is-active", "sshd"] }
                ],
                explanation: "sshd must be active to accept SSH connections.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Connect to server using non-standard SSH port 2222.",
                expected: [
                    { command: "ssh", requiredFlags: ["-p", "2222"], requiredValues: ["user@server.com"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["Port", "/etc/ssh/sshd_config"] }
                ],
                explanation: "-p specifies alternate port when SSH runs on non-standard port.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Display SSH server configuration file.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/ssh/sshd_config"] },
                    { command: "less", requiredValues: ["/etc/ssh/sshd_config"] }
                ],
                explanation: "/etc/ssh/sshd_config controls SSH server behavior.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Configure SSH to listen on port 2222 instead of default 22.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/ssh/sshd_config"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^#Port 22/Port 2222/'", "/etc/ssh/sshd_config"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["Port", "/etc/ssh/sshd_config"] }
                ],
                explanation: "Change Port directive and restart sshd. Update firewall rules too.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Test SSH configuration syntax.",
                expected: [
                    { command: "sshd", requiredFlags: ["-t"] },
                    { command: "sshd", requiredFlags: ["-T"] }
                ],
                explanation: "sshd -t tests config. -T shows effective configuration.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Disable password authentication and require key-only login.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/ssh/sshd_config"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^PasswordAuthentication yes/PasswordAuthentication no/'", "/etc/ssh/sshd_config"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["PasswordAuthentication", "/etc/ssh/sshd_config"] }
                ],
                explanation: "PasswordAuthentication no enforces SSH key authentication only.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Display SSH client configuration.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/ssh/ssh_config"] },
                    { command: "cat", requiredValues: ["~/.ssh/config"] }
                ],
                explanation: "/etc/ssh/ssh_config is system-wide. ~/.ssh/config is per-user.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Connect to server with verbose output for troubleshooting.",
                expected: [
                    { command: "ssh", requiredFlags: ["-v"], requiredValues: ["user@server.com"] },
                    { command: "ssh", requiredFlags: ["-vv"], requiredValues: ["user@server.com"] }
                ],
                allowedPreChecks: [],
                explanation: "-v shows debug output. -vv/-vvv increase verbosity.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "List active SSH connections.",
                expected: [
                    { command: "ss", requiredFlags: ["-tn"], requiredValues: ["sport", "=", ":22"] },
                    { command: "netstat", requiredFlags: ["-tn"], requiredValues: ["|", "grep", ":22"] },
                    { command: "who", requiredValues: [] }
                ],
                explanation: "ss or netstat show TCP connections. who shows logged-in users.",
                points: 3
            }
        ],
        
        // Set 5: SSH keys
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Generate new RSA SSH key pair with 4096 bits.",
                expected: [
                    { command: "ssh-keygen", requiredFlags: ["-t", "rsa", "-b", "4096"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["~/.ssh/"] }
                ],
                explanation: "ssh-keygen creates public/private key pair. -t specifies type, -b specifies bits.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the newly generated public key.",
                expected: [
                    { command: "cat", requiredValues: ["~/.ssh/id_rsa.pub"] },
                    { command: "ssh-keygen", requiredFlags: ["-l", "-f"], requiredValues: ["~/.ssh/id_rsa.pub"] }
                ],
                explanation: ".pub file contains public key. -l shows fingerprint.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Copy public key to remote server user@192.168.1.100 for passwordless login.",
                expected: [
                    { command: "ssh-copy-id", requiredValues: ["user@192.168.1.100"] },
                    { command: "ssh-copy-id", requiredFlags: ["-i"], requiredValues: ["~/.ssh/id_rsa.pub", "user@192.168.1.100"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["~/.ssh/id_rsa.pub"] }
                ],
                explanation: "ssh-copy-id automatically appends key to remote ~/.ssh/authorized_keys.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify authorized_keys file on local system.",
                expected: [
                    { command: "cat", requiredValues: ["~/.ssh/authorized_keys"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["~/.ssh/authorized_keys"] }
                ],
                explanation: "authorized_keys contains public keys allowed to log into this account.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Generate Ed25519 SSH key (modern, faster algorithm).",
                expected: [
                    { command: "ssh-keygen", requiredFlags: ["-t", "ed25519"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["~/.ssh/"] }
                ],
                explanation: "Ed25519 is faster and more secure than RSA. Recommended for new keys.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Check permissions of SSH private key file.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["~/.ssh/id_rsa"] },
                    { command: "stat", requiredValues: ["~/.ssh/id_rsa"] }
                ],
                explanation: "Private key must be 600 (rw-------) for SSH to accept it.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Set correct permissions on private key file.",
                expected: [
                    { command: "chmod", requiredValues: ["600", "~/.ssh/id_rsa"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["~/.ssh/id_rsa"] }
                ],
                explanation: "chmod 600 ensures only owner can read/write private key.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Display SSH key fingerprint for verification.",
                expected: [
                    { command: "ssh-keygen", requiredFlags: ["-l", "-f"], requiredValues: ["~/.ssh/id_rsa.pub"] },
                    { command: "ssh-keygen", requiredFlags: ["-lf"], requiredValues: ["~/.ssh/id_rsa"] }
                ],
                explanation: "Fingerprint uniquely identifies key. Useful for verification.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Generate SSH key with comment 'deploy-key' for identification.",
                expected: [
                    { command: "ssh-keygen", requiredFlags: ["-t", "rsa", "-C"], requiredValues: ["'deploy-key'"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["~/.ssh/"] }
                ],
                explanation: "-C adds comment to key. Helps identify key purpose.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Test SSH connection using specific identity file.",
                expected: [
                    { command: "ssh", requiredFlags: ["-i"], requiredValues: ["~/.ssh/deploy_key", "user@server.com"] }
                ],
                explanation: "-i specifies which private key to use for authentication.",
                points: 2
            }
        ],
        
        // Set 6: Secure file transfer
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Copy local file /tmp/data.txt to remote server user@192.168.1.100:/home/user/.",
                expected: [
                    { command: "scp", requiredValues: ["/tmp/data.txt", "user@192.168.1.100:/home/user/"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/data.txt"] }
                ],
                explanation: "scp copies files securely over SSH. Syntax: scp source destination.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Copy file from remote server to local /tmp/ directory.",
                expected: [
                    { command: "scp", requiredValues: ["user@192.168.1.100:/home/user/report.txt", "/tmp/"] }
                ],
                explanation: "Remote path format: user@host:/path. Local path is destination.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Copy entire directory /opt/config to remote server recursively.",
                expected: [
                    { command: "scp", requiredFlags: ["-r"], requiredValues: ["/opt/config", "user@server:/opt/"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/opt/config"] }
                ],
                explanation: "-r recursively copies directories and contents.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Use rsync to sync /var/www to remote server, showing progress.",
                expected: [
                    { command: "rsync", requiredFlags: ["-av", "--progress"], requiredValues: ["/var/www/", "user@server:/var/www/"] },
                    { command: "rsync", requiredFlags: ["-avz"], requiredValues: ["/var/www/", "user@server:/var/www/"] }
                ],
                explanation: "rsync is more efficient than scp for large transfers. -a preserves attributes.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Sync files from remote to local, deleting files not on source.",
                expected: [
                    { command: "rsync", requiredFlags: ["-av", "--delete"], requiredValues: ["user@server:/data/", "/backup/data/"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/backup/data/"] }
                ],
                explanation: "--delete removes files on destination not present on source.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Dry-run rsync to see what would be transferred without actual transfer.",
                expected: [
                    { command: "rsync", requiredFlags: ["-av", "--dry-run"], requiredValues: ["/source/", "user@server:/dest/"] },
                    { command: "rsync", requiredFlags: ["-avn"], requiredValues: ["/source/", "user@server:/dest/"] }
                ],
                explanation: "--dry-run (or -n) shows what would happen without making changes.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Copy file using scp with custom SSH port 2222.",
                expected: [
                    { command: "scp", requiredFlags: ["-P", "2222"], requiredValues: ["/tmp/file.txt", "user@server:/tmp/"] }
                ],
                allowedPreChecks: [],
                explanation: "scp uses -P (capital) for port, unlike ssh which uses -p (lowercase).",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Use rsync with compression for slow connections.",
                expected: [
                    { command: "rsync", requiredFlags: ["-avz"], requiredValues: ["/large/dataset/", "user@server:/backup/"] }
                ],
                explanation: "-z enables compression during transfer. Faster on slow networks.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Use rsync to sync only files modified in last 7 days.",
                expected: [
                    { command: "find", requiredFlags: ["/data/", "-mtime"], requiredValues: ["-7", "-exec", "rsync", "-av", "{}", "user@server:/backup/", "\\;"] },
                    { command: "rsync", requiredFlags: ["-av"], requiredValues: ["--files-from=<(find /data/ -mtime -7)", "user@server:/backup/"] }
                ],
                allowedPreChecks: [
                    { command: "find", requiredFlags: ["/data/", "-mtime"], requiredValues: ["-7"] }
                ],
                explanation: "Combine find with rsync to selectively sync recent files.",
                points: 4
            },
            {
                id: 10,
                category: "Audit",
                description: "Display bandwidth usage during rsync transfer.",
                expected: [
                    { command: "rsync", requiredFlags: ["-av", "--progress", "--stats"], requiredValues: ["/data/", "user@server:/backup/"] }
                ],
                explanation: "--progress shows per-file progress. --stats shows transfer summary.",
                points: 2
            }
        ]
    }
};
