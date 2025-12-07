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
