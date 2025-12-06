// RHCSA Commands Base Class
// Shared state and helper methods for all command modules

class RHCSACommandsBase {
    constructor(filesystem) {
        this.fs = filesystem;
        
        // Environment variables
        this.env = {
            'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'HOME': '/root',
            'USER': 'root',
            'SHELL': '/bin/bash',
            'HOSTNAME': 'rhcsa-lab',
            'LANG': 'en_US.UTF-8',
            'PWD': '/root',
            'OLDPWD': '/root',
            'TERM': 'xterm-256color',
            'LOGNAME': 'root'
        };
        
        // Virtual system state
        this.selinuxMode = 'enforcing';
        this.hostname = 'rhcsa-lab';
        this.installedPackages = ['httpd', 'vim', 'bash', 'systemd', 'kernel', 'firewalld'];
        this.availablePackages = ['nginx', 'postgresql', 'mariadb', 'python3', 'git', 'tar'];
        
        // Systemd services state
        this.services = {
            'httpd': { enabled: false, active: false, description: 'The Apache HTTP Server' },
            'sshd': { enabled: true, active: true, description: 'OpenSSH server daemon' },
            'firewalld': { enabled: true, active: true, description: 'firewalld - dynamic firewall daemon' },
            'chronyd': { enabled: true, active: true, description: 'NTP client/server' },
            'nginx': { enabled: false, active: false, description: 'nginx HTTP server' }
        };
        
        // Virtual processes
        this.processes = [
            { pid: 1, user: 'root', cpu: 0.1, mem: 0.5, command: 'systemd' },
            { pid: 234, user: 'root', cpu: 0.0, mem: 0.2, command: 'sshd' },
            { pid: 567, user: 'root', cpu: 0.0, mem: 0.3, command: 'firewalld' },
            { pid: 890, user: 'root', cpu: 0.1, mem: 0.1, command: 'chronyd' }
        ];
        
        // LVM state
        this.pvs = [];
        this.vgs = [];
        this.lvs = [];
        
        // Virtual disks
        this.disks = {
            '/dev/sda': { size: '20G', type: 'disk', children: [] },
            '/dev/sdb': { size: '10G', type: 'disk', children: [] },
            '/dev/sdc': { size: '5G', type: 'disk', children: [] }
        };
        
        // Firewall zones and rules
        this.firewallZones = {
            'public': { services: ['ssh', 'dhcpv6-client'], ports: [] }
        };
        
        // Network interfaces state
        this.networkInterfaces = {
            'lo': {
                ipv4: '127.0.0.1/8',
                ipv6: '::1/128',
                mac: '00:00:00:00:00:00',
                state: 'UP'
            },
            'eth0': {
                ipv4: '192.168.1.100/24',
                ipv6: 'fe80::5254:ff:fe12:3456/64',
                mac: '52:54:00:12:34:56',
                state: 'UP',
                gateway: '192.168.1.1'
            }
        };
        
        // Command history
        this.commandHistory = [];
    }
    
    // ===== HELPER METHODS =====
    
    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1 && arg[1] !== '-') {
                // Short flags: -abc becomes -a -b -c
                for (let i = 1; i < arg.length; i++) {
                    const flag = arg[i];
                    if (validFlags.includes(flag)) {
                        flags[flag] = true;
                    }
                }
            } else if (arg.startsWith('--')) {
                // Long flags: --verbose
                const flag = arg.slice(2);
                if (validFlags.includes(flag)) {
                    flags[flag] = true;
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        return { ...flags, args: remainingArgs };
    }
    
    expandVariables(str) {
        // Expand environment variables in string
        return str.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (match, varName) => {
            return this.env[varName] || '';
        });
    }
}
