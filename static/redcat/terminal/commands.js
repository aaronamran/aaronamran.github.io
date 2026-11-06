// RHCSA Commands Aggregator
// Combines all modular command files into a unified interface
// Part of Red Cat RHCSA Terminal Simulator

class RHCSACommands {
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
        
        // Last exit code for $?
        this.lastExitCode = 0;
        
        // Positional parameters for scripts: $0, $1-$9, $#, $@, $*
        this.scriptArgs = ['bash']; // Default: $0 is shell name, empty args
        
        // Aggregate all command modules
        this._modules = [];
        this._initializeModularCommands();
    }
    
    _initializeModularCommands() {
        // Create shared state object that all modules can access
        const sharedState = {
            fs: this.fs,
            env: this.env,
            selinuxMode: this.selinuxMode,
            hostname: this.hostname,
            installedPackages: this.installedPackages,
            availablePackages: this.availablePackages,
            services: this.services,
            processes: this.processes,
            pvs: this.pvs,
            vgs: this.vgs,
            lvs: this.lvs,
            disks: this.disks,
            firewallZones: this.firewallZones,
            networkInterfaces: this.networkInterfaces,
            lastExitCode: this.lastExitCode,
            scriptArgs: this.scriptArgs,
            parent: this  // Pass parent reference for dynamic access
        };
        
        this._shared = sharedState;   // read by the tab-completion engine

        // Helper function to copy only methods (not properties) from module to this
        const copyMethods = (module) => {
            this._modules.push(module);   // kept so the whole simulated machine can be saved and restored
            Object.getOwnPropertyNames(Object.getPrototypeOf(module)).forEach(name => {
                if (name !== 'constructor' && typeof module[name] === 'function') {
                    this[name] = module[name].bind(module);
                }
            });
        };
        
        // Initialize all modular command classes
        // They're loaded from commands/ folder before this file
        try {
            if (typeof CoreCommands !== 'undefined') {
                const coreCommands = new CoreCommands(sharedState);
                copyMethods(coreCommands);
            }
            if (typeof TextCommands !== 'undefined') {
                const textCommands = new TextCommands(sharedState);
                copyMethods(textCommands);
            }
            if (typeof FileCommands !== 'undefined') {
                const fileCommands = new FileCommands(sharedState);
                copyMethods(fileCommands);
            }
            if (typeof UserCommands !== 'undefined') {
                const userCommands = new UserCommands(sharedState);
                copyMethods(userCommands);
            }
            if (typeof NetworkCommands !== 'undefined') {
                const networkCommands = new NetworkCommands(sharedState);
                copyMethods(networkCommands);
            }
            if (typeof SystemCommands !== 'undefined') {
                const systemCommands = new SystemCommands(sharedState);
                copyMethods(systemCommands);
            }
            if (typeof DiskCommands !== 'undefined') {
                const diskCommands = new DiskCommands(sharedState);
                copyMethods(diskCommands);
            }
            if (typeof SELinuxCommands !== 'undefined') {
                const selinuxCommands = new SELinuxCommands(sharedState);
                copyMethods(selinuxCommands);
            }
            if (typeof ProcessCommands !== 'undefined') {
                const processCommands = new ProcessCommands(sharedState);
                copyMethods(processCommands);
            }
            if (typeof JobControlCommands !== 'undefined') {
                const jobControlCommands = new JobControlCommands(sharedState);
                copyMethods(jobControlCommands);
            }
            if (typeof KernelModuleCommands !== 'undefined') {
                const kernelModuleCommands = new KernelModuleCommands(sharedState);
                copyMethods(kernelModuleCommands);
            }
            if (typeof SchedulingCommands !== 'undefined') {
                const schedulingCommands = new SchedulingCommands(sharedState);
                copyMethods(schedulingCommands);
            }
            if (typeof PackageCommands !== 'undefined') {
                const packageCommands = new PackageCommands(sharedState);
                copyMethods(packageCommands);
            }
            if (typeof ContainerCommands !== 'undefined') {
                const containerCommands = new ContainerCommands(sharedState);
                copyMethods(containerCommands);
            }
            if (typeof EditorCommands !== 'undefined') {
                const editorCommands = new EditorCommands(sharedState);
                copyMethods(editorCommands);
            }
            if (typeof AdvancedCommands !== 'undefined') {
                const advancedCommands = new AdvancedCommands(sharedState);
                copyMethods(advancedCommands);
            }
            if (typeof ExtraCommands !== 'undefined') {
                // Loaded last on purpose: corrected versions of users/groups, ls, mkdir, LVM, firewall-cmd...
                const extraCommands = new ExtraCommands(sharedState);
                copyMethods(extraCommands);
            }
            if (typeof StorageCommands !== 'undefined') {
                // Partitions, filesystems, mounts, swap: one shared model (needs ExtraCommands for LVM state)
                const storageCommands = new StorageCommands(sharedState);
                copyMethods(storageCommands);
            }
            if (typeof ServiceCommands !== 'undefined') {
                // Service table <-> process table: systemctl, ps, top, kill, pstree...
                const serviceCommands = new ServiceCommands(sharedState);
                copyMethods(serviceCommands);
                serviceCommands.installHooks(this);
            }
            if (typeof SELinuxEngine !== 'undefined') {
                // File contexts, booleans, ports, audit log, ausearch/audit2allow/sealert, curl vs httpd
                const seEngine = new SELinuxEngine(sharedState);
                copyMethods(seEngine);
                seEngine.installHooks(this);
            }
            if (typeof TimeCommands !== 'undefined') {
                // Clock model: date, timedatectl, hwclock, chronyc makestep
                const timeCommands = new TimeCommands(sharedState);
                copyMethods(timeCommands);
                timeCommands.installHooks(this);
            }
            if (typeof SchedulerCommands !== 'undefined') {
                // crontab/crond, at/atd, anacron, mail: jobs really run on the simulated clock
                const schedCommands = new SchedulerCommands(sharedState);
                copyMethods(schedCommands);
            }
            if (typeof UnitCommands !== 'undefined') {
                // custom .service/.timer units, systemd-analyze, systemd-run
                const unitCommands = new UnitCommands(sharedState);
                copyMethods(unitCommands);
                unitCommands.installHooks(this);
            }
            if (typeof NetEngine !== 'undefined') {
                // NetworkManager profiles <-> devices <-> ip/route <-> resolv.conf <-> DNS/hosts lookups
                const netEngine = new NetEngine(sharedState);
                copyMethods(netEngine);
                netEngine.installHooks(this);
            }
            if (typeof PackageEngine !== 'undefined') {
                // package catalog, repos from /etc/yum.repos.d, dnf/yum/rpm transactions that create the package files
                const pkgEngine = new PackageEngine(sharedState);
                copyMethods(pkgEngine);
            }
            if (typeof PodmanEngine !== 'undefined') {
                // podman images/containers/volumes, generate systemd, rootless user services, loginctl, skopeo
                const podmanEngine = new PodmanEngine(sharedState);
                copyMethods(podmanEngine);
                podmanEngine.installHooks(this);
            }
            if (typeof SessionEngine !== 'undefined') {
                // su/sudo with sudoers + password prompts, su - sessions, interactive passwd, chpasswd
                const sessionEngine = new SessionEngine(sharedState);
                copyMethods(sessionEngine);
                sessionEngine.installHooks(this);
            }
            if (typeof NfsEngine !== 'undefined') {
                // /etc/exports -> exportfs/showmount/mount.nfs checks, autofs maps that mount on first access
                const nfsEngine = new NfsEngine(sharedState);
                copyMethods(nfsEngine);
                nfsEngine.installHooks(this);
            }
            if (typeof TuneEngine !== 'undefined') {
                // sysctl keys in /proc/sys, tuned profiles that change them, nice/renice
                const tuneEngine = new TuneEngine(sharedState);
                copyMethods(tuneEngine);
            }
            if (typeof UtilEngine !== 'undefined') {
                // md5sum/sha*sum, base64, expr, timeout, realpath, mktemp, nl, tac, od, xxd, ...
                const utilEngine = new UtilEngine(sharedState);
                copyMethods(utilEngine);
            }
            if (typeof AppEngine !== 'undefined') {
                // programs that come from packages (tree, nc, nmap, tcpdump, ssh-keygen, createrepo_c ...): they exist while the package is installed
                const appEngine = new AppEngine(sharedState);
                copyMethods(appEngine);
                appEngine.installHooks(this);
            }
            if (typeof AppEngine2 !== 'undefined') {
                // git, jq, bc, openssl, python3/perl one-liners, httpd/nginx config checks, mariadb client, make/gcc, tmux/screen
                const appEngine2 = new AppEngine2(sharedState);
                copyMethods(appEngine2);
            }
            if (typeof AppEngine3 !== 'undefined') {
                // python3/perl one-liners, httpd/nginx config checks, mariadb client, make/gcc, tmux/screen
                const appEngine3 = new AppEngine3(sharedState);
                copyMethods(appEngine3);
            }
            if (typeof JobEngine !== 'undefined') {
                // cmd & , jobs, fg, bg, wait, disown, nohup, kill %n, foreground sleep with Ctrl+C / Ctrl+Z
                const jobEngine = new JobEngine(sharedState);
                copyMethods(jobEngine);
                jobEngine.installHooks(this);
            }
            if (typeof BootEngine !== 'undefined') {
                // reboot/poweroff/shutdown: runtime state is rebuilt from what is on disk, bad fstab -> emergency mode
                const bootEngine = new BootEngine(sharedState);
                copyMethods(bootEngine);
                bootEngine.installHooks(this);
            }
            if (typeof ContainerEngine !== 'undefined') {
                // container root filesystems, users, packages and interactive shells (podman run -it / exec -it)
                const ctrEngine = new ContainerEngine(sharedState);
                copyMethods(ctrEngine);
                ctrEngine.installHooks(this);
            }
            
            console.log('✅ Red Cat: All command modules loaded successfully');
        } catch (err) {
            console.error('❌ Red Cat: Error loading modular commands:', err);
        }
    }
    
    // called after a saved machine has been loaded into a fresh page
    afterRestore() {
        const j = this._shared && this._shared.jobEngine;
        if (j && j.endSession) j.endSession(false);
        const b = this._shared && this._shared.boot;
        if (b) { b.scheduled = null; }
    }

    // Helper method for variable expansion (used by commands)
    expandVariables(str) {
        return str.replace(/\$\{?([A-Za-z_?@*#0-9][A-Za-z0-9_]*)\}?/g, (match, varName) => {
            if (varName === '?') return String(this.lastExitCode);
            if (varName === '#') return String(this.scriptArgs.length - 1);
            if (varName === '@' || varName === '*') return this.scriptArgs.slice(1).join(' ');
            if (/^[0-9]$/.test(varName)) {
                const index = parseInt(varName);
                return this.scriptArgs[index] || '';
            }
            if (this.env.hasOwnProperty(varName)) return this.env[varName];
            return '';
        });
    }
    
    // Helper method for parsing flags (used by commands)
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

// Export for use in terminal.js
if (typeof window !== 'undefined') {
    window.RHCSACommands = RHCSACommands;
}
