// Network Commands - ip, nmcli, ping, etc.
// Part of Red Cat RHCSA Terminal Simulator

class NetworkCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.networkInterfaces = sharedState.networkInterfaces;
        this.hostname = sharedState.hostname;
        this.staticRoutes = sharedState.staticRoutes;
    }

    ip(args) {
        if (args.length === 0) {
            return { error: 'ip: missing command' };
        }
        
        const subcommand = args[0];
        
        // ip addr show / ip a
        if (subcommand === 'addr' || subcommand === 'a' || subcommand === 'address') {
            if (args[1] === 'show' || args.length === 1) {
                // Show all interfaces
                let output = [];
                let index = 1;
                
                for (const [ifname, ifdata] of Object.entries(this.networkInterfaces)) {
                    const flags = ifname === 'lo' ? '<LOOPBACK,UP,LOWER_UP>' : '<BROADCAST,MULTICAST,UP,LOWER_UP>';
                    output.push(`${index}: ${ifname}: ${flags} mtu ${ifname === 'lo' ? '65536' : '1500'} qdisc noqueue state ${ifdata.state} group default qlen 1000`);
                    output.push(`    link/ether ${ifdata.mac} brd ff:ff:ff:ff:ff:ff`);
                    output.push(`    inet ${ifdata.ipv4} ${ifname === 'lo' ? 'scope host' : 'brd ' + this.calculateBroadcast(ifdata.ipv4) + ' scope global'} ${ifname}`);
                    output.push(`       valid_lft forever preferred_lft forever`);
                    index++;
                }
                
                return { output: output.join('\n') };
            }
            
            // ip addr add <IP> dev <interface>
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                const ipAddr = args[2];
                const devIndex = args.indexOf('dev');
                
                if (!ipAddr || devIndex === -1 || !args[devIndex + 1]) {
                    return { error: 'ip addr add: missing address or device' };
                }
                
                const iface = args[devIndex + 1];
                
                if (!this.networkInterfaces[iface]) {
                    return { error: `Cannot find device "${iface}"` };
                }
                
                this.networkInterfaces[iface].ipv4 = ipAddr;
                return { output: '' };
            }
            
            // ip addr del <IP> dev <interface>
            if (args[1] === 'del' || args[1] === 'delete') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                return { output: '' };
            }
        }
        
        // ip link show / ip l
        if (subcommand === 'link' || subcommand === 'l') {
            let output = [];
            let index = 1;
            
            for (const [ifname, ifdata] of Object.entries(this.networkInterfaces)) {
                const flags = ifname === 'lo' ? '<LOOPBACK,UP,LOWER_UP>' : '<BROADCAST,MULTICAST,UP,LOWER_UP>';
                output.push(`${index}: ${ifname}: ${flags} mtu ${ifname === 'lo' ? '65536' : '1500'} qdisc noqueue state ${ifdata.state} mode DEFAULT group default qlen 1000`);
                output.push(`    link/ether ${ifdata.mac} brd ff:ff:ff:ff:ff:ff`);
                index++;
            }
            
            return { output: output.join('\n') };
        }
        
        // ip route show / ip r
        if (subcommand === 'route' || subcommand === 'r') {
            // ip route add
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                const network = args[2];
                const viaIndex = args.indexOf('via');
                const devIndex = args.indexOf('dev');
                
                if (!network) {
                    return { error: 'ip route add: missing network' };
                }
                
                // Initialize routes if not exists
                if (!this.staticRoutes) {
                    this.staticRoutes = [];
                }
                
                const route = { network };
                
                if (viaIndex !== -1 && args[viaIndex + 1]) {
                    route.via = args[viaIndex + 1];
                }
                
                if (devIndex !== -1 && args[devIndex + 1]) {
                    route.dev = args[devIndex + 1];
                }
                
                this.staticRoutes.push(route);
                return { output: '' };
            }
            
            // ip route show
            const gateway = this.networkInterfaces.eth0.gateway || '192.168.1.1';
            const network = this.calculateNetwork(this.networkInterfaces.eth0.ipv4);
            let output = `default via ${gateway} dev eth0 proto dhcp metric 100\n${network} dev eth0 proto kernel scope link src ${this.networkInterfaces.eth0.ipv4.split('/')[0]} metric 100`;
            
            // Add static routes
            if (this.staticRoutes && this.staticRoutes.length > 0) {
                for (const route of this.staticRoutes) {
                    let routeLine = route.network;
                    if (route.via) routeLine += ` via ${route.via}`;
                    if (route.dev) routeLine += ` dev ${route.dev}`;
                    output += '\n' + routeLine;
                }
            }
            
            return { output };
        }
        
        return { error: `ip: unknown command: ${subcommand}` };
    }
    
    traceroute(args) {
        if (args.length === 0) {
            return { error: 'traceroute: missing host' };
        }
        
        const host = args[0];
        
        return { output: `traceroute to ${host} (93.184.216.34), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  1.234 ms  1.189 ms  1.156 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.645 ms  5.612 ms
 3  172.16.0.1 (172.16.0.1)  12.345 ms  12.312 ms  12.289 ms
 4  * * *
 5  93.184.216.1 (93.184.216.1)  23.456 ms  23.423 ms  23.390 ms
 6  ${host} (93.184.216.34)  25.678 ms  25.645 ms  25.612 ms` };
    }
    
    calculateBroadcast(cidr) {
        const [ip, mask] = cidr.split('/');
        const parts = ip.split('.');
        const maskNum = parseInt(mask);
        const lastOctet = Math.pow(2, 32 - maskNum) - 1;
        return `${parts[0]}.${parts[1]}.${parts[2]}.255`;
    }
    
    calculateNetwork(cidr) {
        const [ip, mask] = cidr.split('/');
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/${mask}`;
    }
    
    nmcli(args) {
        if (args.length === 0) {
            return { error: 'nmcli: missing command' };
        }
        
        // nmcli connection show
        if (args[0] === 'connection' || args[0] === 'con' || args[0] === 'c') {
            if (args[1] === 'show') {
                return { output: `NAME    UUID                                  TYPE      DEVICE\neth0    5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03  ethernet  eth0` };
            }
            
            // nmcli con add
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const typeIndex = args.indexOf('type');
                const ifnameIndex = args.indexOf('ifname');
                const conNameIndex = args.indexOf('con-name');
                
                if (typeIndex === -1 || !args[typeIndex + 1]) {
                    return { error: 'Error: missing connection type' };
                }
                
                const type = args[typeIndex + 1];
                const ifname = ifnameIndex !== -1 ? args[ifnameIndex + 1] : 'eth1';
                const conName = conNameIndex !== -1 ? args[conNameIndex + 1] : ifname;
                
                return { output: `Connection '${conName}' (${this.generateUUID()}) successfully added.` };
            }
            
            // nmcli con up/down
            if (args[1] === 'up') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                if (!connection) {
                    return { error: 'Error: missing connection name' };
                }
                
                return { output: `Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)` };
            }
            
            if (args[1] === 'down') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                if (!connection) {
                    return { error: 'Error: missing connection name' };
                }
                
                return { output: `Connection '${connection}' successfully deactivated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)` };
            }
            
            // nmcli con mod <connection> ipv4.addresses <IP>
            if (args[1] === 'mod' || args[1] === 'modify') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                const property = args[3];
                const value = args[4];
                
                if (!connection || !property || !value) {
                    return { error: 'nmcli: missing arguments' };
                }
                
                if (property === 'ipv4.addresses' && this.networkInterfaces[connection]) {
                    this.networkInterfaces[connection].ipv4 = value;
                    return { output: `Connection '${connection}' successfully updated.` };
                }
                
                if (property.startsWith('ipv4.')) {
                    return { output: `Connection '${connection}' successfully updated.` };
                }
                
                return { error: `Error: unknown property: '${property}'` };
            }
        }
        
        // nmcli device show
        if (args[0] === 'device' || args[0] === 'dev' || args[0] === 'd') {
            return { output: `GENERAL.DEVICE:                         eth0
GENERAL.TYPE:                           ethernet
GENERAL.HWADDR:                         52:54:00:12:34:56
GENERAL.MTU:                            1500
GENERAL.STATE:                          100 (connected)
IP4.ADDRESS[1]:                         ${this.networkInterfaces.eth0.ipv4}
IP4.GATEWAY:                            ${this.networkInterfaces.eth0.gateway || '192.168.1.1'}` };
        }
        
        return { error: `nmcli: unknown command: ${args[0]}` };
    }
    
    ping(args) {
        if (args.length === 0) {
            return { error: 'ping: missing host operand' };
        }
        
        const host = args[0];
        return { output: `PING ${host} (192.168.1.1) 56(84) bytes of data.
64 bytes from ${host} (192.168.1.1): icmp_seq=1 ttl=64 time=0.234 ms
64 bytes from ${host} (192.168.1.1): icmp_seq=2 ttl=64 time=0.189 ms
64 bytes from ${host} (192.168.1.1): icmp_seq=3 ttl=64 time=0.201 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.189/0.208/0.234/0.018 ms` };
    }
    
    hostname(args) {
        if (args.length === 0) {
            return { output: this.hostname };
        }
        
        if (this.fs.currentUid !== 0) {
            return { error: 'hostname: you must be root to change the hostname' };
        }
        
        this.hostname = args[0];
        return { output: '' };
    }
    
    ifconfig(args) {
        // ifconfig is legacy, redirect to ip addr
        return this.ip(['addr']);
    }
    
    ss(args) {
        const flags = this.parseFlags(args, ['t', 'u', 'l', 'n', 'p', 'a']);
        
        // ss -tunlp (most common)
        let output = 'Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process\n';
        
        if (flags.t || flags.a) {
            output += 'tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*          users:(("sshd",pid=234,fd=3))\n';
            output += 'tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*          users:(("httpd",pid=456,fd=4))\n';
            output += 'tcp    ESTAB   0       0       192.168.1.100:22      192.168.1.1:54321  users:(("sshd",pid=789,fd=3))\n';
        }
        
        if (flags.u || flags.a) {
            output += 'udp    UNCONN  0       0       0.0.0.0:68            0.0.0.0:*          users:(("dhclient",pid=123,fd=6))\n';
        }
        
        return { output };
    }
    
    curl(args) {
        if (args.length === 0) {
            return { error: 'curl: try \'curl --help\' for more information' };
        }
        
        const flags = this.parseFlags(args, ['I', 'o', 'O', 'L', 's', 'v']);
        const url = flags.args[0];
        
        if (!url) {
            return { error: 'curl: no URL specified' };
        }
        
        // -I: Fetch headers only
        if (flags.I) {
            return { output: `HTTP/1.1 200 OK\nServer: nginx/1.20.1\nDate: ${new Date().toUTCString()}\nContent-Type: text/html\nContent-Length: 612\nConnection: keep-alive` };
        }
        
        // Simulate fetching content
        return { output: `<!DOCTYPE html>\n<html>\n<head><title>Simulated Page</title></head>\n<body><h1>This is a simulated curl response for ${url}</h1></body>\n</html>` };
    }
    
    wget(args) {
        if (args.length === 0) {
            return { error: 'wget: missing URL' };
        }
        
        const flags = this.parseFlags(args, ['O', 'q', 'c']);
        const url = flags.args[0];
        
        if (!url) {
            return { error: 'wget: missing URL' };
        }
        
        // Extract filename
        const filename = url.split('/').pop() || 'index.html';
        
        // Create simulated file
        const parent = this.fs.getNode(this.fs.currentPath);
        parent.children[filename] = {
            type: 'file',
            content: `[Downloaded content from ${url}]`,
            size: 1024,
            permissions: '0644',
            owner: this.fs.currentUser,
            group: this.fs.currentUser,
            modified: new Date()
        };
        
        if (!flags.q) {
            return { output: `--${new Date().toISOString()}--  ${url}\nResolving host...\nConnecting to host... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1.0K) [text/html]\nSaving to: '${filename}'\n\n${filename}   100%[==================>]   1.00K  --.-KB/s    in 0s\n\n${new Date().toISOString()} (12.3 MB/s) - '${filename}' saved [1024/1024]` };
        }
        
        return { output: '' };
    }
    
    rsync(args) {
        if (args.length < 2) {
            return { error: 'rsync: missing source or destination' };
        }
        
        const flags = this.parseFlags(args, ['a', 'v', 'z', 'r', 'n', 'u', 'delete', 'progress']);
        
        if (flags.args.length < 2) {
            return { error: 'rsync: must specify source and destination' };
        }
        
        const source = flags.args[0];
        const dest = flags.args[1];
        
        // Simulate dry-run
        if (flags.n) {
            return { output: `sending incremental file list\nfile1.txt\nfile2.txt\nfile3.txt\n\nsent 234 bytes  received 45 bytes  558.00 bytes/sec\ntotal size is 12,345  speedup is 44.24 (DRY RUN)` };
        }
        
        // Simulate verbose output
        if (flags.v) {
            return { output: `sending incremental file list\nfile1.txt\nfile2.txt\nfile3.txt\n\nsent 12,567 bytes  received 234 bytes  25,602.00 bytes/sec\ntotal size is 12,345  speedup is 0.96` };
        }
        
        // Basic rsync
        return { output: `sent 12,567 bytes  received 234 bytes  8,534.00 bytes/sec\ntotal size is 12,345  speedup is 0.96` };
    }
    
    netstat(args) {
        // netstat is deprecated, redirect to ss
        return this.ss(args);
    }
    
    dig(args) {
        if (args.length === 0) {
            return { error: 'dig: missing domain name' };
        }
        
        const domain = args[0];
        const recordType = args[1] || 'A';
        
        return { output: `; <<>> DiG 9.16.23-RH <<>> ${domain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;${domain}.			IN	A

;; ANSWER SECTION:
${domain}.		300	IN	A	93.184.216.34

;; Query time: 23 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: ${new Date().toString()}
;; MSG SIZE  rcvd: 56` };
    }
    
    nslookup(args) {
        if (args.length === 0) {
            return { error: 'nslookup: missing domain name' };
        }
        
        const domain = args[0];
        
        return { output: `Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	${domain}
Address: 93.184.216.34` };
    }
    
    host(args) {
        if (args.length === 0) {
            return { error: 'host: missing domain name' };
        }
        
        const domain = args[0];
        
        return { output: `${domain} has address 93.184.216.34\n${domain} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946\n${domain} mail is handled by 10 mail.${domain}.` };
    }
    
    hostnamectl(args) {
        if (args.length === 0 || args[0] === 'status') {
            return { output: `   Static hostname: ${this.hostname}
         Icon name: computer-vm
           Chassis: vm
        Machine ID: 1234567890abcdef1234567890abcdef
           Boot ID: abcdef1234567890abcdef1234567890
    Virtualization: kvm
  Operating System: Red Hat Enterprise Linux 9.0 (Plow)
       CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos
            Kernel: Linux 5.14.0-284.el9.x86_64
      Architecture: x86-64` };
        }
        
        if (args[0] === 'set-hostname') {
            if (this.fs.currentUid !== 0) {
                return { error: 'hostnamectl: Permission denied' };
            }
            const newHostname = args[1];
            if (!newHostname) {
                return { error: 'hostnamectl: missing hostname argument' };
            }
            this.hostname = newHostname;
            return { output: '' };
        }
        
        return { error: `hostnamectl: unknown command: ${args[0]}` };
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (validFlags.includes(char)) {
                        flags[char] = true;
                    }
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        flags.args = remainingArgs;
        return flags;
    }
}

if (typeof window !== 'undefined') {
    window.NetworkCommands = NetworkCommands;
}
