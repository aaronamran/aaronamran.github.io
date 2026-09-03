// System Management Commands - systemctl, journalctl, etc.
// Part of Red Cat RHCSA Terminal Simulator

class SystemCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.services = sharedState.services;
        this.hostname = sharedState.hostname;
    }

    // Placeholder - commands will be moved here
    // systemctl, journalctl, sysctl, dracut
    // timedatectl, hwclock, chronyc, tzselect
    // logger, ausearch

    systemctl(args) {
        if (args.length === 0) {
            return { error: 'systemctl: missing command' };
        }
        
        const command = args[0];
        const service = args[1];
        
        if (command === 'start') {
            if (!service) {
                return { error: 'systemctl start: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to start ${service}: Unit not found.` };
            }
            
            this.services[service].active = true;
            return { output: '' };
        }
        
        if (command === 'stop') {
            if (!service) {
                return { error: 'systemctl stop: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to stop ${service}: Unit not found.` };
            }
            
            this.services[service].active = false;
            return { output: '' };
        }
        
        if (command === 'enable') {
            if (!service) {
                return { error: 'systemctl enable: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to enable ${service}: Unit not found.` };
            }
            
            this.services[service].enabled = true;
            return { output: `Created symlink /etc/systemd/system/multi-user.target.wants/${service} → /usr/lib/systemd/system/${service}.service` };
        }
        
        if (command === 'disable') {
            if (!service) {
                return { error: 'systemctl disable: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to disable ${service}: Unit not found.` };
            }
            
            this.services[service].enabled = false;
            return { output: `Removed /etc/systemd/system/multi-user.target.wants/${service}.service` };
        }
        
        if (command === 'status') {
            if (!service) {
                return { error: 'systemctl status: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Unit ${service} could not be found.` };
            }
            
            const svc = this.services[service];
            const active = svc.active ? 'active (running)' : 'inactive (dead)';
            const enabled = svc.enabled ? 'enabled' : 'disabled';
            
            return { output: `● ${service}.service - ${svc.description}\n   Loaded: loaded (/usr/lib/systemd/system/${service}.service; ${enabled})\n   Active: ${active} since ${new Date().toUTCString()}\n Main PID: 1234 (${service})\n    Tasks: 1\n   Memory: 2.3M\n   CGroup: /system.slice/${service}.service\n           └─1234 /usr/sbin/${service}` };
        }
        
        if (command === 'is-active') {
            if (!service) {
                return { error: 'systemctl is-active: missing service name' };
            }
            
            if (!this.services[service]) {
                return { output: 'unknown' };
            }
            
            return { output: this.services[service].active ? 'active' : 'inactive' };
        }
        
        if (command === 'is-enabled') {
            if (!service) {
                return { error: 'systemctl is-enabled: missing service name' };
            }
            
            if (!this.services[service]) {
                return { output: 'disabled' };
            }
            
            return { output: this.services[service].enabled ? 'enabled' : 'disabled' };
        }
        
        if (command === 'restart') {
            if (!service) {
                return { error: 'systemctl restart: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to restart ${service}: Unit not found.` };
            }
            
            this.services[service].active = true;
            return { output: '' };
        }
        
        if (command === 'reload') {
            if (!service) {
                return { error: 'systemctl reload: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to reload ${service}: Unit not found.` };
            }
            
            return { output: '' };
        }
        
        if (command === 'daemon-reload') {
            return { output: '' };
        }
        
        if (command === 'list-units') {
            let output = 'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\n';
            for (const svcName in this.services) {
                const svc = this.services[svcName];
                const load = 'loaded';
                const active = svc.active ? 'active' : 'inactive';
                const sub = svc.active ? 'running' : 'dead';
                output += `${svcName}.service`.padEnd(25) + load.padEnd(7) + active.padEnd(7) + sub.padEnd(8) + svc.description + '\n';
            }
            return { output };
        }
        
        if (command === 'set-default') {
            if (this.fs.currentUid !== 0) {
                return { error: 'systemctl: Permission denied' };
            }
            const target = service;
            if (!target) {
                return { error: 'systemctl set-default: missing target' };
            }
            if (!this.systemdDefaultTarget) {
                this.systemdDefaultTarget = 'multi-user.target';
            }
            this.systemdDefaultTarget = target;
            return { output: `Removed /etc/systemd/system/default.target.\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/${target}.` };
        }
        
        if (command === 'get-default') {
            return { output: this.systemdDefaultTarget || 'multi-user.target' };
        }
        
        if (command === 'isolate') {
            if (this.fs.currentUid !== 0) {
                return { error: 'systemctl: Permission denied' };
            }
            const target = service;
            if (!target) {
                return { error: 'systemctl isolate: missing target' };
            }
            return { output: '' };
        }
        
        if (command === 'list-timers') {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24*60*60*1000);
            const formatTime = (date) => {
                const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
                return `${day} ${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
            };
            
            let output = 'NEXT                         LEFT          LAST                         PASSED       UNIT                         ACTIVATES\n';
            
            // Add realistic timers
            const timers = [
                { next: '12h 34m left', last: '11h 26m ago', unit: 'dnf-makecache.timer', activates: 'dnf-makecache.service' },
                { next: '23h 45m left', last: '12m 15s ago', unit: 'systemd-tmpfiles-clean.timer', activates: 'systemd-tmpfiles-clean.service' },
                { next: formatTime(tomorrow), last: formatTime(new Date(now.getTime() - 24*60*60*1000)), unit: 'logrotate.timer', activates: 'logrotate.service' },
                { next: '6 days left', last: '1 day 2h ago', unit: 'unbound-anchor.timer', activates: 'unbound-anchor.service' }
            ];
            
            for (const timer of timers) {
                output += `${timer.next.padEnd(29)}${timer.last.padEnd(29)}${timer.unit.padEnd(29)}${timer.activates}\n`;
            }
            
            output += `\n${timers.length} timers listed.`;
            return { output };
        }
        
        if (command === '--user') {
            // systemctl --user [command] [service]
            const userCommand = args[1];
            const userService = args[2];
            
            if (!this.userServices) {
                this.userServices = {};
            }
            
            if (!this.userServices[this.fs.currentUser]) {
                this.userServices[this.fs.currentUser] = {
                    'pulseaudio': { active: true, enabled: true, description: 'Sound Service' },
                    'dbus': { active: true, enabled: true, description: 'D-Bus User Message Bus' },
                    'gvfs-daemon': { active: true, enabled: false, description: 'Virtual filesystem service' }
                };
            }
            
            const userSvcs = this.userServices[this.fs.currentUser];
            
            if (userCommand === 'list-units') {
                let output = 'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\n';
                for (const svcName in userSvcs) {
                    const svc = userSvcs[svcName];
                    const load = 'loaded';
                    const active = svc.active ? 'active' : 'inactive';
                    const sub = svc.active ? 'running' : 'dead';
                    output += `${svcName}.service`.padEnd(25) + load.padEnd(7) + active.padEnd(7) + sub.padEnd(8) + svc.description + '\n';
                }
                return { output };
            }
            
            if (userCommand === 'status') {
                if (!userService || !userSvcs[userService]) {
                    return { error: `Unit ${userService || 'unknown'} could not be found.` };
                }
                const svc = userSvcs[userService];
                const active = svc.active ? 'active (running)' : 'inactive (dead)';
                const enabled = svc.enabled ? 'enabled' : 'disabled';
                
                return { output: `● ${userService}.service - ${svc.description}\n   Loaded: loaded (/usr/lib/systemd/user/${userService}.service; ${enabled})\n   Active: ${active} since ${new Date().toUTCString()}\n Main PID: ${1000 + Math.floor(Math.random() * 1000)} (${userService})\n   CGroup: /user.slice/user-${this.fs.currentUid}.slice/user@${this.fs.currentUid}.service/${userService}.service` };
            }
            
            if (userCommand === 'start' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].active = true;
                    return { output: '' };
                }
                return { error: `Failed to start ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'stop' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].active = false;
                    return { output: '' };
                }
                return { error: `Failed to stop ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'enable' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].enabled = true;
                    return { output: `Created symlink /home/${this.fs.currentUser}/.config/systemd/user/default.target.wants/${userService}.service → /usr/lib/systemd/user/${userService}.service` };
                }
                return { error: `Failed to enable ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'disable' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].enabled = false;
                    return { output: `Removed /home/${this.fs.currentUser}/.config/systemd/user/default.target.wants/${userService}.service` };
                }
                return { error: `Failed to disable ${userService}: Unit not found.` };
            }
            
            return { error: 'systemctl --user: usage: systemctl --user [start|stop|enable|disable|status|list-units] [service]' };
        }
        
        return { error: `systemctl: unknown command: ${command}` };
    }

    dracut(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'dracut: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['f', 'v']);
        
        return { output: `dracut: Executing: /usr/bin/dracut -f
dracut: *** Creating initramfs image file '/boot/initramfs-5.14.0-284.el9.x86_64.img' ***
dracut: *** Creating image file ***
dracut: *** Creating image file done ***
dracut: *** Creating initramfs image file '/boot/initramfs-5.14.0-284.el9.x86_64.img' done ***` };
    }

    journalctl(args) {
        const flags = this.parseFlags(args, ['u', 'f', 'n', 'b', 'p', 'x', 'e']);
        
        // -u: Filter by unit
        if (flags.u) {
            const unitIndex = args.indexOf('-u');
            if (unitIndex !== -1 && args[unitIndex + 1]) {
                const unit = args[unitIndex + 1];
                return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 10:00:00 rhcsa-lab systemd[1]: Starting ${unit}...\nDec 05 10:00:01 rhcsa-lab ${unit}[1234]: Started successfully\nDec 05 10:00:01 rhcsa-lab systemd[1]: Started ${unit}.` };
            }
        }
        
        // -f: Follow (tail -f style)
        if (flags.f) {
            return { output: '[Following journal... Press Ctrl+C to stop]\nDec 05 12:00:00 rhcsa-lab systemd[1]: Started Session 1 of user root.' };
        }
        
        // -n: Number of lines
        if (flags.n) {
            const lines = flags.args[0] || '10';
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 11:59:50 rhcsa-lab systemd[1]: Started Session 1 of user root.\nDec 05 11:59:55 rhcsa-lab sshd[234]: Accepted publickey for root from 192.168.1.1\nDec 05 12:00:00 rhcsa-lab cron[567]: (root) CMD (run-parts /etc/cron.hourly)` };
        }
        
        // -b: Boot messages
        if (flags.b) {
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 09:00:00 rhcsa-lab kernel: Linux version 5.14.0-284.el9.x86_64\nDec 05 09:00:01 rhcsa-lab systemd[1]: Reached target Basic System.\nDec 05 09:00:02 rhcsa-lab systemd[1]: Started Network Manager.` };
        }
        
        // -p: Priority level
        if (flags.p) {
            const priority = flags.args[0];
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 11:00:00 rhcsa-lab systemd[1]: Failed to start some-service.\nDec 05 11:30:00 rhcsa-lab kernel: Out of memory: Kill process 1234.` };
        }
        
        // -x: Add explanatory help texts
        if (flags.x) {
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 10:00:00 rhcsa-lab systemd[1]: Starting Network Manager...\n-- Subject: A start job for unit NetworkManager.service has begun execution` };
        }
        
        // Default: Show all logs
        return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 09:00:00 rhcsa-lab kernel: Linux version 5.14.0-284.el9.x86_64\nDec 05 09:00:01 rhcsa-lab systemd[1]: Reached target Basic System.\nDec 05 10:00:00 rhcsa-lab sshd[234]: Server listening on 0.0.0.0 port 22.\nDec 05 11:00:00 rhcsa-lab cron[567]: (root) CMD (run-parts /etc/cron.hourly)\nDec 05 12:00:00 rhcsa-lab systemd[1]: Started Session 1 of user root.` };
    }

    ausearch(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'ausearch: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['m', 'ts', 'te']);
        
        // -m: Message type
        if (flags.m) {
            const msgType = flags.args[0];
            return { output: `----\ntime->Thu Dec  5 10:00:00 2024\ntype=${msgType.toUpperCase()} msg=audit(1701774000.000:100): avc:  denied  { read } for  pid=1234 comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0` };
        }
        
        return { output: 'ausearch: no events found' };
    }

    sysctl(args) {
        const flags = this.parseFlags(args, ['a', 'w', 'p']);
        
        // Initialize kernel parameters if not exists
        if (!this.kernelParams) {
            this.kernelParams = {
                'kernel.hostname': 'rhcsa-lab',
                'kernel.ostype': 'Linux',
                'kernel.osrelease': '5.14.0-362.24.1.el9_3.x86_64',
                'kernel.pid_max': '4194304',
                'net.ipv4.ip_forward': '0',
                'net.ipv4.tcp_syncookies': '1',
                'net.ipv6.conf.all.disable_ipv6': '0',
                'vm.swappiness': '30',
                'vm.dirty_ratio': '20',
                'fs.file-max': '9223372036854775807'
            };
        }
        
        // -a: Display all parameters
        if (flags.a) {
            let output = [];
            for (const [key, value] of Object.entries(this.kernelParams).sort()) {
                output.push(`${key} = ${value}`);
            }
            return { output: output.join('\n') };
        }
        
        // -w: Write value (requires root)
        if (flags.w) {
            if (this.fs.currentUid !== 0) {
                return { error: 'sysctl: setting key requires root' };
            }
            
            const wIndex = args.indexOf('-w');
            if (wIndex !== -1 && args[wIndex + 1]) {
                const assignment = args[wIndex + 1];
                const [key, value] = assignment.split('=');
                if (key && value) {
                    this.kernelParams[key.trim()] = value.trim();
                    return { output: `${key.trim()} = ${value.trim()}` };
                }
            }
            return { error: 'sysctl: malformed assignment' };
        }
        
        // -p: Load settings from /etc/sysctl.conf
        if (flags.p) {
            return { output: '[Loaded sysctl settings from /etc/sysctl.conf]' };
        }
        
        // Show specific parameter
        if (flags.args.length > 0) {
            const key = flags.args[0];
            if (this.kernelParams.hasOwnProperty(key)) {
                return { output: `${key} = ${this.kernelParams[key]}` };
            } else {
                return { error: `sysctl: cannot stat /proc/sys/${key.replace(/\\./g, '/')}: No such file or directory` };
            }
        }
        
        return { error: 'sysctl: no variables specified' };
    }

    timedatectl(args) {
        if (args.length === 0) {
            return { output: `               Local time: ${new Date().toString()}
           Universal time: ${new Date().toUTCString()}
                 RTC time: ${new Date().toUTCString()}
                Time zone: America/New_York (EST, -0500)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no` };
        }
        
        const subcommand = args[0];
        
        if (subcommand === 'status') {
            return this.timedatectl([]);
        }
        
        if (subcommand === 'list-timezones') {
            return { output: `Africa/Abidjan\nAfrica/Accra\nAmerica/New_York\nAmerica/Chicago\nAmerica/Los_Angeles\nAsia/Tokyo\nEurope/London\nEurope/Paris\nUTC` };
        }
        
        if (subcommand === 'set-timezone') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            const tz = args[1];
            if (!tz) {
                return { error: 'timedatectl: missing timezone argument' };
            }
            return { output: '' };
        }
        
        if (subcommand === 'set-time') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            const time = args[1];
            if (!time) {
                return { error: 'timedatectl: missing time argument' };
            }
            return { output: '' };
        }
        
        if (subcommand === 'set-ntp') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            return { output: '' };
        }
        
        return { error: `timedatectl: unknown command: ${subcommand}` };
    }

    hwclock(args) {
        const flags = this.parseFlags(args, ['r', 'w', 's', 'systohc', 'hctosys']);
        
        if (flags.r || args.length === 0) {
            return { output: new Date().toString() };
        }
        
        if (flags.w || flags.systohc) {
            if (this.fs.currentUid !== 0) {
                return { error: 'hwclock: Permission denied' };
            }
            return { output: '' };
        }
        
        if (flags.s || flags.hctosys) {
            if (this.fs.currentUid !== 0) {
                return { error: 'hwclock: Permission denied' };
            }
            return { output: '' };
        }
        
        return { output: new Date().toString() };
    }

    chronyc(args) {
        if (args.length === 0 || args[0] === 'tracking') {
            return { output: `Reference ID    : A9FEA97B (169.254.169.123)
Stratum         : 3
Ref time (UTC)  : ${new Date().toUTCString()}
System time     : 0.000000023 seconds fast of NTP time
Last offset     : +0.000000456 seconds
RMS offset      : 0.000001234 seconds
Frequency       : 5.678 ppm fast
Residual freq   : +0.012 ppm
Skew            : 0.123 ppm
Root delay      : 0.012345678 seconds
Root dispersion : 0.001234567 seconds
Update interval : 64.5 seconds
Leap status     : Normal` };
        }
        
        if (args[0] === 'sources') {
            return { output: `MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* time.google.com               2   6   377    34   +123us[ +456us] +/-   12ms
^- ntp.ubuntu.com                2   6   377    35   -234us[ -567us] +/-   23ms
^+ 0.pool.ntp.org                3   6   377    36   +345us[ +678us] +/-   34ms` };
        }
        
        if (args[0] === 'activity') {
            return { output: `200 OK
3 sources online
0 sources offline
0 sources doing burst (return to online)
0 sources doing burst (return to offline)
0 sources with unknown address` };
        }
        
        return { error: `chronyc: unknown command: ${args[0]}` };
    }

    tzselect(args) {
        return { output: `Please identify a location so that time zone rules can be set correctly.
Please select a continent, ocean, "coord", or "TZ".
 1) Africa
 2) Americas
 3) Antarctica
 4) Asia
 5) Atlantic Ocean
 6) Australia
 7) Europe
 8) Indian Ocean
 9) Pacific Ocean
10) coord - I want to use geographical coordinates.
11) TZ - I want to specify the timezone using the Posix TZ format.
#? [Selection required - interactive mode simulated]

Current timezone: America/New_York (EST5EDT)
To change timezone, use: timedatectl set-timezone <timezone>` };
    }

    logger(args) {
        const flags = this.parseFlags(args, ['p', 't', 'i']);
        
        if (flags.args.length === 0) {
            return { error: 'logger: missing message' };
        }
        
        const message = flags.args.join(' ');
        let priority = 'user.notice';
        let tag = this.fs.currentUser;
        let pid = Math.floor(Math.random() * 30000) + 1000;
        
        // -p: priority (facility.level)
        if (flags.p) {
            const pIndex = args.indexOf('-p');
            if (pIndex !== -1 && args[pIndex + 1]) {
                priority = args[pIndex + 1];
            }
        }
        
        // -t: tag
        if (flags.t) {
            const tIndex = args.indexOf('-t');
            if (tIndex !== -1 && args[tIndex + 1]) {
                tag = args[tIndex + 1];
            }
        }
        
        // Simulate adding to journal (would normally go to /var/log/messages or journald)
        // For simulation, we just return success
        if (flags.i) {
            // -i: log process ID
            return { output: `[Message logged with ${priority}: ${tag}[${pid}]: ${message}]` };
        }
        
        return { output: `[Message logged with ${priority}: ${tag}: ${message}]` };
    }

    tunedadm(args) {
        // tuned-adm command - tuning profiles management
        if (args.length === 0) {
            return { error: 'tuned-adm: missing command\nUsage: tuned-adm <command> [options]\nCommands: list, active, profile, recommend' };
        }
        
        const command = args[0];
        
        if (command === 'list') {
            return { output: `Available profiles:
- balanced                    - General non-specialized tuned profile
- desktop                     - Optimize for desktop systems
- latency-performance         - Optimize for deterministic performance
- network-latency             - Optimize for low latency networking
- network-throughput          - Optimize for high network throughput
- powersave                   - Optimize for low power consumption
- throughput-performance      - Broadly applicable tuning for maximum throughput
- virtual-guest               - Optimize for running inside a virtual guest
- virtual-host                - Optimize for running KVM guests` };
        }
        
        if (command === 'active') {
            return { output: `Current active profile: virtual-guest` };
        }
        
        if (command === 'recommend') {
            return { output: `virtual-guest` };
        }
        
        if (command === 'profile') {
            if (!args[1]) {
                return { error: 'tuned-adm profile: missing profile name' };
            }
            
            if (this.fs.currentUid !== 0) {
                return { error: 'tuned-adm: Permission denied' };
            }
            
            const profile = args[1];
            return { output: `Tuning profile set to: ${profile}` };
        }
        
        return { error: `tuned-adm: unknown command: ${command}` };
    }

    'tuned-adm'(args) {
        return this.tunedadm(args);
    }

    grub2mkconfig(args) {
        // grub2-mkconfig command - generate GRUB configuration
        if (this.fs.currentUid !== 0) {
            return { error: 'grub2-mkconfig: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['o']);
        let output = '/boot/grub2/grub.cfg';
        
        if (flags.o) {
            const oIndex = args.indexOf('-o');
            if (oIndex !== -1 && args[oIndex + 1]) {
                output = args[oIndex + 1];
            }
        }
        
        return { output: `Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.14.0-362.8.1.el9_3.x86_64
Found initrd image: /boot/initramfs-5.14.0-362.8.1.el9_3.x86_64.img
done
Configuration written to ${output}` };
    }

    'grub2-mkconfig'(args) {
        return this.grub2mkconfig(args);
    }

    grub2editenv(args) {
        // grub2-editenv command - edit GRUB environment block
        if (args.length === 0) {
            return { error: 'grub2-editenv: missing command\nUsage: grub2-editenv [FILENAME] <command>' };
        }
        
        let file = '/boot/grub2/grubenv';
        let command = args[0];
        
        if (args.length > 1) {
            file = args[0];
            command = args[1];
        }
        
        if (command === 'list') {
            return { output: `saved_entry=0\nkernel_opts=` };
        }
        
        if (command === 'set') {
            if (this.fs.currentUid !== 0) {
                return { error: 'grub2-editenv: Permission denied' };
            }
            
            if (!args[args.length - 1].includes('=')) {
                return { error: 'grub2-editenv: missing variable=value' };
            }
            
            return { output: '' };
        }
        
        return { error: `grub2-editenv: unknown command: ${command}` };
    }

    'grub2-editenv'(args) {
        return this.grub2editenv(args);
    }

    systemdanalyze(args) {
        // systemd-analyze command - analyze system boot performance
        if (args.length === 0 || args[0] === 'time') {
            return { output: `Startup finished in 1.234s (kernel) + 2.567s (initrd) + 5.432s (userspace) = 9.233s
graphical.target reached after 5.321s in userspace` };
        }
        
        if (args[0] === 'blame') {
            return { output: `          2.154s firewalld.service
          1.987s NetworkManager.service
          1.432s tuned.service
          0.876s sshd.service
          0.654s systemd-logind.service
          0.543s chronyd.service
          0.432s auditd.service
          0.321s rsyslog.service
          0.234s systemd-user-sessions.service
          0.123s systemd-tmpfiles-setup.service` };
        }
        
        if (args[0] === 'critical-chain') {
            return { output: `The time when unit became active or started is printed after the "@" character.
The time the unit took to start is printed after the "+" character.

graphical.target @5.321s
└─multi-user.target @5.298s
  └─firewalld.service @3.144s +2.154s
    └─network.target @3.123s
      └─NetworkManager.service @1.136s +1.987s
        └─dbus.service @1.012s
          └─basic.target @989ms
            └─sockets.target @987ms` };
        }
        
        if (args[0] === 'verify') {
            return { output: '' };
        }
        
        return { error: `systemd-analyze: unknown command: ${args[0]}` };
    }

    'systemd-analyze'(args) {
        return this.systemdanalyze(args);
    }

    localectl(args) {
        // localectl command - control system locale and keyboard layout
        if (args.length === 0 || args[0] === 'status') {
            return { output: `   System Locale: LANG=en_US.UTF-8
       VC Keymap: us
      X11 Layout: us` };
        }
        
        if (args[0] === 'list-locales') {
            return { output: `C.utf8
en_US.utf8
en_GB.utf8
fr_FR.utf8
de_DE.utf8
es_ES.utf8` };
        }
        
        if (args[0] === 'list-keymaps') {
            return { output: `us
uk
de
fr
es` };
        }
        
        if (args[0] === 'set-locale') {
            if (this.fs.currentUid !== 0) {
                return { error: 'localectl: Permission denied' };
            }
            
            if (!args[1]) {
                return { error: 'localectl set-locale: missing locale argument' };
            }
            
            return { output: '' };
        }
        
        if (args[0] === 'set-keymap') {
            if (this.fs.currentUid !== 0) {
                return { error: 'localectl: Permission denied' };
            }
            
            if (!args[1]) {
                return { error: 'localectl set-keymap: missing keymap argument' };
            }
            
            return { output: '' };
        }
        
        return { error: `localectl: unknown command: ${args[0]}` };
    }

    loginctl(args) {
        // loginctl command - control systemd login manager
        if (args.length === 0 || args[0] === 'list-sessions') {
            return { output: `SESSION  UID  USER  SEAT  TTY
      1    0  root  seat0 tty1

1 sessions listed.` };
        }
        
        if (args[0] === 'list-users') {
            return { output: `  UID USER
    0 root
 1000 aaron

2 users listed.` };
        }
        
        if (args[0] === 'user-status') {
            const user = args[1] || this.fs.currentUser;
            return { output: `${user} (${user === 'root' ? '0' : '1000'})
           Since: ${new Date().toUTCString()}
           State: active
        Sessions: *1
          Linger: no` };
        }
        
        if (args[0] === 'session-status') {
            const session = args[1] || '1';
            return { output: `${session} - root (0)
           Since: ${new Date().toUTCString()}
          Leader: 1234 (bash)
            Seat: seat0; vc1
             TTY: tty1
         Service: login
            Type: tty
           State: active` };
        }
        
        if (args[0] === 'terminate-session' || args[0] === 'terminate-user') {
            if (this.fs.currentUid !== 0) {
                return { error: 'loginctl: Permission denied' };
            }
            
            if (!args[1]) {
                return { error: `loginctl ${args[0]}: missing argument` };
            }
            
            return { output: '' };
        }
        
        return { error: `loginctl: unknown command: ${args[0]}` };
    }

    lscpu(args) {
        const flags = this.parseFlags(args, ['e', 'p', 'x']);
        
        // Extended information
        if (flags.e || flags.extended) {
            return { output: `Architecture:            x86_64
  CPU op-mode(s):        32-bit, 64-bit
  Address sizes:         46 bits physical, 48 bits virtual
  Byte Order:            Little Endian
CPU(s):                  4
  On-line CPU(s) list:   0-3
Vendor ID:               GenuineIntel
  Model name:            Intel(R) Xeon(R) CPU E5-2670 v3 @ 2.30GHz
    CPU family:          6
    Model:               63
    Thread(s) per core:  2
    Core(s) per socket:  2
    Socket(s):           1
    Stepping:            2
    BogoMIPS:            4589.38
    Flags:               fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov
                         pat pse36 clflush mmx fxsr sse sse2 ht syscall nx rdtscp lm
                         constant_tsc rep_good nopl xtopology nonstop_tsc cpuid tsc_known_freq
                         pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe
                         popcnt aes xsave avx f16c rdrand hypervisor lahf_lm abm invpcid_single
                         pti fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid xsaveopt
Virtualization features:
  Hypervisor vendor:     KVM
  Virtualization type:   full
Caches (sum of all):
  L1d:                   64 KiB (2 instances)
  L1i:                   64 KiB (2 instances)
  L2:                    512 KiB (2 instances)
  L3:                    30 MiB (1 instance)
NUMA:
  NUMA node(s):          1
  NUMA node0 CPU(s):     0-3` };
        }
        
        // Default output
        return { output: `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Byte Order:              Little Endian
Address sizes:           46 bits physical, 48 bits virtual
CPU(s):                  4
On-line CPU(s) list:     0-3
Thread(s) per core:      2
Core(s) per socket:      2
Socket(s):               1
NUMA node(s):            1
Vendor ID:               GenuineIntel
CPU family:              6
Model:                   63
Model name:              Intel(R) Xeon(R) CPU E5-2670 v3 @ 2.30GHz
Stepping:                2
CPU MHz:                 2294.608
BogoMIPS:                4589.38
Hypervisor vendor:       KVM
Virtualization type:     full
L1d cache:               64 KiB
L1i cache:               64 KiB
L2 cache:                512 KiB
L3 cache:                30 MiB
NUMA node0 CPU(s):       0-3
Vulnerability Itlb multihit:     Not affected
Vulnerability L1tf:              Mitigation; PTE Inversion
Vulnerability Mds:               Vulnerable; SMT Host state unknown
Vulnerability Meltdown:          Mitigation; PTI
Vulnerability Mmio stale data:   Vulnerable
Vulnerability Spec store bypass: Vulnerable
Vulnerability Spectre v1:        Mitigation; usercopy/swapgs barriers
Vulnerability Spectre v2:        Mitigation; Retpolines, STIBP disabled
Vulnerability Srbds:             Not affected
Vulnerability Tsx async abort:   Not affected
Flags:                           fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov
                                  pat pse36 clflush mmx fxsr sse sse2 ht syscall nx rdtscp lm
                                  constant_tsc rep_good nopl xtopology nonstop_tsc cpuid tsc_known_freq
                                  pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe
                                  popcnt aes xsave avx f16c rdrand hypervisor lahf_lm abm invpcid_single
                                  pti fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid xsaveopt` };
    }

    lsmem(args) {
        const flags = this.parseFlags(args, ['a', 'o', 's']);
        
        // Summary output
        if (flags.s || args.includes('--summary')) {
            return { output: `RANGE                                 SIZE  STATE REMOVABLE BLOCK
0x0000000000000000-0x000000007fffffff   2G online       yes   0-15
0x0000000100000000-0x000000017fffffff   2G online       yes 32-47

Memory block size:       128M
Total online memory:       4G
Total offline memory:      0B` };
        }
        
        // Default output
        return { output: `RANGE                                  SIZE  STATE REMOVABLE  BLOCK
0x0000000000000000-0x000000007fffffff    2G online       yes    0-15
0x0000000100000000-0x000000017fffffff    2G online       yes   32-47

Memory block size:         128M
Total online memory:         4G
Total offline memory:        0B` };
    }

    dmidecode(args) {
        const flags = this.parseFlags(args, ['t', 's', 'q']);
        
        // Check for root privileges
        if (this.fs.currentUid !== 0) {
            return { error: 'dmidecode: Permission denied. You must be root to run dmidecode.' };
        }
        
        // Type-specific output
        if (flags.t || args.includes('--type')) {
            const typeIndex = args.findIndex(a => a === '-t' || a === '--type');
            const type = typeIndex !== -1 ? args[typeIndex + 1] : null;
            
            if (type === '1' || type === 'system') {
                return { output: `# dmidecode 3.3
Getting SMBIOS data from sysfs.
SMBIOS 2.8 present.

Handle 0x0001, DMI type 1, 27 bytes
System Information
\tManufacturer: QEMU
\tProduct Name: Standard PC (Q35 + ICH9, 2009)
\tVersion: pc-q35-rhel9.2.0
\tSerial Number: Not Specified
\tUUID: 12345678-90ab-cdef-1234-567890abcdef
\tWake-up Type: Power Switch
\tSKU Number: Not Specified
\tFamily: Red Hat Enterprise Linux` };
            }
            
            if (type === '4' || type === 'processor') {
                return { output: `# dmidecode 3.3
Getting SMBIOS data from sysfs.
SMBIOS 2.8 present.

Handle 0x0004, DMI type 4, 42 bytes
Processor Information
\tSocket Designation: CPU 0
\tType: Central Processor
\tFamily: Xeon
\tManufacturer: Intel(R) Corporation
\tID: 63 06 03 00 FF FB EB BF
\tSignature: Type 0, Family 6, Model 63, Stepping 2
\tFlags:
\t\tFPU (Floating-point unit on-chip)
\t\tVME (Virtual mode extension)
\t\tDE (Debugging extension)
\t\tPSE (Page size extension)
\tVersion: Intel(R) Xeon(R) CPU E5-2670 v3 @ 2.30GHz
\tVoltage: Unknown
\tExternal Clock: Unknown
\tMax Speed: 2300 MHz
\tCurrent Speed: 2300 MHz
\tStatus: Populated, Enabled
\tUpgrade: Other
\tCore Count: 2
\tCore Enabled: 2
\tThread Count: 4` };
            }
        }
        
        // Default full output
        return { output: `# dmidecode 3.3
Getting SMBIOS data from sysfs.
SMBIOS 2.8 present.
74 structures occupying 2841 bytes.
Table at 0x000F5A40.

Handle 0x0000, DMI type 0, 24 bytes
BIOS Information
\tVendor: SeaBIOS
\tVersion: 1.16.0-4.el9
\tRelease Date: 04/01/2014
\tAddress: 0xE8000
\tRuntime Size: 96 kB
\tROM Size: 64 kB
\tCharacteristics:
\t\tBIOS characteristics not supported
\t\tTargeted content distribution is supported
\tBIOS Revision: 0.0

Handle 0x0001, DMI type 1, 27 bytes
System Information
\tManufacturer: QEMU
\tProduct Name: Standard PC (Q35 + ICH9, 2009)
\tVersion: pc-q35-rhel9.2.0
\tSerial Number: Not Specified
\tUUID: 12345678-90ab-cdef-1234-567890abcdef
\tWake-up Type: Power Switch
\tSKU Number: Not Specified
\tFamily: Red Hat Enterprise Linux

Handle 0x0004, DMI type 4, 42 bytes
Processor Information
\tSocket Designation: CPU 0
\tType: Central Processor
\tFamily: Xeon
\tManufacturer: Intel(R) Corporation
\tVersion: Intel(R) Xeon(R) CPU E5-2670 v3 @ 2.30GHz
\tMax Speed: 2300 MHz
\tCurrent Speed: 2300 MHz
\tStatus: Populated, Enabled
\tCore Count: 2
\tCore Enabled: 2
\tThread Count: 4

Handle 0x0010, DMI type 16, 23 bytes
Physical Memory Array
\tLocation: System Board Or Motherboard
\tUse: System Memory
\tError Correction Type: Multi-bit ECC
\tMaximum Capacity: 4 GB
\tNumber Of Devices: 1

Handle 0x0011, DMI type 17, 40 bytes
Memory Device
\tArray Handle: 0x0010
\tTotal Width: 64 bits
\tData Width: 64 bits
\tSize: 4 GB
\tForm Factor: DIMM
\tType: RAM
\tType Detail: None
\tSpeed: Unknown
\tManufacturer: QEMU
\tSerial Number: Not Specified

End Of Table` };
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
    window.SystemCommands = SystemCommands;
}
