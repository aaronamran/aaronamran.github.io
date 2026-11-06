// Services and processes: systemctl (service verbs), ps/top/pstree/kill family, rpm2cpio/cpio, flatpak
// Part of Red Cat RHCSA Terminal Simulator
//
// The service table is the single source of truth: starting or stopping a unit creates or removes
// its processes, so ps, top, pstree, pgrep, pidof, kill and systemctl status always agree.

class ServiceCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.svc = this;
        this.svNextPid = 1500;
        this.svBoot = new Date(Date.now() - (4 * 3600 + 22 * 60) * 1000);

        // unit definitions: description, docs, exec, user, extra workers, config-derived port, SELinux domain
        this.svDefs = {
            sshd: { desc: 'OpenSSH server daemon', docs: 'man:sshd(8)\n             man:sshd_config(5)', cmd: 'sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups', comm: 'sshd', user: 'root', exec: '/usr/sbin/sshd -D $OPTIONS', domain: 'sshd_t', reload: true, port: { file: '/etc/ssh/sshd_config', re: /^\s*Port\s+(\d+)/m, def: 22, type: 'ssh_port_t', proto: 'tcp' } },
            firewalld: { desc: 'firewalld - dynamic firewall daemon', docs: 'man:firewalld(1)', cmd: '/usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid', comm: 'firewalld', user: 'root', exec: '/usr/sbin/firewalld --nofork --nopid $FIREWALLD_ARGS', domain: 'firewalld_t', reload: true },
            chronyd: { desc: 'NTP client/server', docs: 'man:chronyd(8)\n             man:chrony.conf(5)', cmd: '/usr/sbin/chronyd -F 2', comm: 'chronyd', user: 'chrony', exec: '/usr/sbin/chronyd $OPTIONS', domain: 'chronyd_t' },
            crond: { desc: 'Command Scheduler', docs: '', cmd: '/usr/sbin/crond -n', comm: 'crond', user: 'root', exec: '/usr/sbin/crond -n $CRONDARGS', domain: 'crond_t' },
            atd: { desc: 'Deferred execution scheduler', docs: 'man:atd(8)', cmd: '/usr/sbin/atd -f', comm: 'atd', user: 'root', exec: '/usr/sbin/atd -f $OPTS', domain: 'crond_t' },
            rsyslog: { desc: 'System Logging Service', docs: 'man:rsyslogd(8)\n             https://www.rsyslog.com/doc/', cmd: '/usr/sbin/rsyslogd -n', comm: 'rsyslogd', user: 'root', exec: '/usr/sbin/rsyslogd -n $SYSLOGD_OPTIONS', domain: 'syslogd_t', reload: true },
            NetworkManager: { desc: 'Network Manager', docs: 'man:NetworkManager(8)', cmd: '/usr/sbin/NetworkManager --no-daemon', comm: 'NetworkManager', user: 'root', exec: '/usr/sbin/NetworkManager --no-daemon', domain: 'NetworkManager_t', reload: true },
            tuned: { desc: 'Dynamic System Tuning Daemon', docs: 'man:tuned(8)\n             man:tuned.conf(5)\n             man:tuned-adm(8)', cmd: '/usr/bin/python3 -Es /usr/sbin/tuned -l -P', comm: 'tuned', user: 'root', exec: '/usr/sbin/tuned -l -P', domain: 'tuned_t' },
            auditd: { desc: 'Security Auditing Service', docs: 'man:auditd(8)\n             https://github.com/linux-audit/audit-documentation', cmd: '/sbin/auditd', comm: 'auditd', user: 'root', exec: '/sbin/auditd', domain: 'auditd_t' },
            'systemd-journald': { desc: 'Journal Service', docs: 'man:systemd-journald.service(8)', cmd: '/usr/lib/systemd/systemd-journald', comm: 'systemd-journal', user: 'root', exec: '/usr/lib/systemd/systemd-journald', domain: 'syslogd_t', static: true },
            kdump: { desc: 'Crash recovery kernel arming', docs: 'man:kdumpctl(8)', cmd: null, user: 'root', exec: '/usr/bin/kdumpctl start', oneshot: true, domain: 'kdump_t' },
            httpd: { desc: 'The Apache HTTP Server', docs: 'man:httpd.service(8)', cmd: '/usr/sbin/httpd -DFOREGROUND', comm: 'httpd', user: 'root', exec: '/usr/sbin/httpd $OPTIONS -DFOREGROUND', workers: { n: 5, user: 'apache' }, domain: 'httpd_t', reload: true, port: { file: '/etc/httpd/conf/httpd.conf', re: /^\s*Listen\s+(?:[\d.\[\]:]*:)?(\d+)/m, def: 80, type: 'http_port_t', proto: 'tcp' }, pkg: 'httpd' },
            nginx: { desc: 'The nginx HTTP and reverse proxy server', docs: '', cmd: 'nginx: master process /usr/sbin/nginx', comm: 'nginx', user: 'root', exec: '/usr/sbin/nginx', workers: { n: 2, user: 'nginx', cmd: 'nginx: worker process' }, domain: 'httpd_t', reload: true, port: { file: '/etc/nginx/nginx.conf', re: /^\s*listen\s+(?:[\d.\[\]:]*:)?(\d+)/m, def: 80, type: 'http_port_t', proto: 'tcp' }, pkg: 'nginx' },
            mariadb: { desc: 'MariaDB 10.5 database server', docs: 'man:mariadbd(8)\n             https://mariadb.com/kb/en/library/systemd/', cmd: '/usr/libexec/mysqld --basedir=/usr', comm: 'mysqld', user: 'mysql', exec: '/usr/libexec/mysqld --basedir=/usr', domain: 'mysqld_t', port: { def: 3306, type: 'mysqld_port_t', proto: 'tcp' }, pkg: 'mariadb-server' },
            postgresql: { desc: 'PostgreSQL database server', docs: 'man:postgres(1)', cmd: '/usr/bin/postmaster -D /var/lib/pgsql/data', comm: 'postmaster', user: 'postgres', exec: '/usr/bin/postmaster -D ${PGDATA}', domain: 'postgresql_t', port: { def: 5432, type: 'postgresql_port_t', proto: 'tcp' }, pkg: 'postgresql-server' },
            vsftpd: { desc: 'Vsftpd ftp daemon', docs: '', cmd: '/usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf', comm: 'vsftpd', user: 'root', exec: '/usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf', domain: 'ftpd_t', port: { def: 21, type: 'ftp_port_t', proto: 'tcp' }, pkg: 'vsftpd' },
            autofs: { desc: 'Automounts filesystems on demand', docs: '', cmd: '/usr/sbin/automount --systemd-service --dont-check-daemon', comm: 'automount', user: 'root', exec: '/usr/sbin/automount $OPTIONS --dont-check-daemon', domain: 'automount_t', pkg: 'autofs', reload: true },
            'nfs-server': { desc: 'NFS server and services', docs: 'man:rpc.nfsd(8)\n             man:exportfs(8)', cmd: null, user: 'root', exec: '/usr/sbin/exportfs -r', oneshot: true, domain: 'nfsd_t', pkg: 'nfs-utils' },
            'systemd-timesyncd': { desc: 'Network Time Synchronization', docs: 'man:systemd-timesyncd.service(8)', cmd: '/usr/lib/systemd/systemd-timesyncd', comm: 'systemd-timesyn', user: 'systemd-timesync', exec: '/usr/lib/systemd/systemd-timesyncd', domain: 'ntpd_t', masked: false }
        };

        // service state lives in sharedState.services (also read by the older systemctl)
        const S = sharedState.services;
        const init = { sshd: [true, true], firewalld: [true, true], chronyd: [true, true], crond: [true, true], atd: [true, true], rsyslog: [true, true], NetworkManager: [true, true], tuned: [true, true], auditd: [true, true], 'systemd-journald': [true, true], kdump: [true, true], httpd: [false, false], nginx: [false, false], mariadb: [false, false], postgresql: [false, false], vsftpd: [false, false], autofs: [false, false], 'nfs-server': [false, false], 'systemd-timesyncd': [false, false] };
        for (const [n, [en, act]] of Object.entries(init)) {
            if (!S[n]) S[n] = { enabled: en, active: act, description: this.svDefs[n].desc };
            S[n].description = this.svDefs[n].desc;
            S[n].enabled = en;
            S[n].active = act;
            S[n].failed = false;
            S[n].since = act ? this.svBoot : null;
            S[n].log = [];
        }
        // fixed pids for the boot-time services, so listings look like a real machine
        const fixed = { 'systemd-journald': 580, auditd: 640, NetworkManager: 744, rsyslog: 790, chronyd: 812, crond: 830, atd: 831, tuned: 905, sshd: 912, firewalld: 925 };
        this.svFixed = fixed;

        this._svBuildBase();
        for (const [n, svc] of Object.entries(S)) if (svc.active && this.svDefs[n]) this._svSpawn(n, fixed[n]);
        this._svSort();

        // package names that dnf can install, so unit/command gating has something to work with
        const avail = sharedState.availablePackages;
        for (const p of ['flatpak', 'tree', 'wget', 'htop', 'tmux', 'rsync', 'git', 'vim-enhanced', 'nfs-utils', 'autofs', 'setroubleshoot-server', 'cpio', 'bind-utils', 'mariadb-server', 'vsftpd', 'postgresql-server', 'cockpit', 'samba', 'lsof', 'net-tools', 'telnet', 'nmap-ncat', 'tcpdump']) {
            if (!avail.includes(p) && !sharedState.installedPackages.includes(p)) avail.push(p);
        }
        for (const p of ['bash', 'systemd', 'kernel', 'firewalld', 'chrony', 'cronie', 'at', 'tuned', 'openssh-server', 'rsyslog', 'NetworkManager', 'audit', 'policycoreutils', 'policycoreutils-python-utils', 'selinux-policy-targeted', 'rpm', 'dnf', 'coreutils', 'grubby', 'kexec-tools', 'xfsprogs', 'e2fsprogs', 'lvm2', 'parted', 'util-linux', 'podman', 'nginx']) {
            if (!sharedState.installedPackages.includes(p) && !['nginx'].includes(p)) sharedState.installedPackages.push(p);
        }
    }

    // ===== helpers =====

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _root() { return this.fs.currentUid === 0; }
    _X() { return this.shared.extra; }

    _svUnitName(n) { return String(n).replace(/\.service$/, ''); }

    _svBuildBase() {
        const P = this.shared.processes;
        P.splice(0, P.length);
        const add = (o) => P.push(Object.assign({ cpu: 0.0, mem: 0.1, user: 'root', tty: '?', stat: 'Ss', ni: 0, ppid: 1, time: '00:00:00', start: this._hhmm(this.svBoot), service: null, domain: 'kernel_t' }, o, { command: o.command, comm: o.comm || String(o.command).split(' ')[0].replace(/^\[|\]$/g, '').split('/').pop() }));
        add({ pid: 1, ppid: 0, command: '/usr/lib/systemd/systemd --switched-root --system --deserialize 31', comm: 'systemd', cpu: 0.1, mem: 0.5, time: '00:00:04', domain: 'init_t' });
        add({ pid: 2, ppid: 0, command: '[kthreadd]', comm: 'kthreadd', stat: 'S', mem: 0, domain: 'kernel_t' });
        const kthreads = ['rcu_gp', 'rcu_par_gp', 'slub_flushwq', 'netns', 'mm_percpu_wq', 'rcu_tasks_kthre', 'ksoftirqd/0', 'rcu_preempt', 'migration/0', 'cpuhp/0', 'kdevtmpfs', 'kauditd', 'khungtaskd', 'oom_reaper', 'writeback', 'kcompactd0', 'khugepaged', 'kintegrityd', 'kblockd', 'kswapd0', 'xfsalloc', 'xfs_mru_cache', 'jbd2/sda1-8'];
        kthreads.forEach((k, i) => add({ pid: 3 + i * 3, ppid: 2, command: `[${k}]`, comm: k, stat: i % 7 === 0 ? 'I<' : 'S', mem: 0, domain: 'kernel_t' }));
        add({ pid: 612, command: '/usr/lib/systemd/systemd-udevd', comm: 'systemd-udevd', mem: 0.3, domain: 'udev_t' });
        add({ pid: 702, command: '/usr/lib/systemd/systemd-logind', comm: 'systemd-logind', user: 'root', mem: 0.2, domain: 'systemd_logind_t' });
        add({ pid: 704, command: '/usr/bin/dbus-broker-launch --scope system --audit', comm: 'dbus-broker-lau', user: 'dbus', mem: 0.1, domain: 'system_dbusd_t' });
        add({ pid: 710, ppid: 704, command: 'dbus-broker --log 4 --controller 9 --machine-id 4a9d1c2e7b5f4e0f9a3c6d1e8b2f7a90 --max-bytes 536870912 --max-fds 4096 --max-matches 131072 --audit', comm: 'dbus-broker', user: 'dbus', mem: 0.1, domain: 'system_dbusd_t' });
        add({ pid: 801, command: '/usr/lib/polkit-1/polkitd --no-debug', comm: 'polkitd', user: 'polkitd', mem: 0.7, domain: 'policykit_t' });
        add({ pid: 1010, command: '/sbin/agetty -o -p -- \\u --noclear - linux', comm: 'agetty', tty: 'tty1', stat: 'Ss+', mem: 0.0, domain: 'getty_t' });
        add({ pid: 1180, ppid: 912, command: 'sshd: root [priv]', comm: 'sshd', mem: 0.3, domain: 'sshd_t' });
        add({ pid: 1190, ppid: 1180, command: 'sshd: root@pts/0', comm: 'sshd', mem: 0.2, domain: 'sshd_t' });
        add({ pid: 1201, ppid: 1190, command: '-bash', comm: 'bash', tty: 'pts/0', stat: 'Ss', mem: 0.1, domain: 'unconfined_t' });
    }

    _hhmm(d) {
        if (this.shared.timeCmds) return this._loc(d, '%H:%M'); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; }

    _svSpawn(name, fixedPid) {
        const def = this.svDefs[name];
        const svc = this.shared.services[name];
        if (!def || !def.cmd) { svc.pids = []; return; }
        const P = this.shared.processes;
        const master = fixedPid || this.svNextPid++;
        const started = svc.since || new Date();
        const mem = { httpd: 0.9, nginx: 0.4, mariadb: 3.1, postgresql: 1.4, sshd: 0.4, tuned: 1.2, NetworkManager: 0.8, firewalld: 1.5, rsyslog: 0.5 }[name] || 0.3;
        const base = { service: name, domain: def.domain, start: this._hhmm(started), time: '00:00:0' + (master % 9) };
        P.push(Object.assign({ pid: master, ppid: 1, user: def.user, cpu: 0.0, mem, tty: '?', stat: name === 'tuned' ? 'Ssl' : 'Ss', ni: 0, command: def.cmd, comm: def.comm }, base));
        const pids = [master];
        if (def.workers) {
            for (let i = 0; i < def.workers.n; i++) {
                const pid = this.svNextPid++;
                P.push(Object.assign({ pid, ppid: master, user: def.workers.user, cpu: 0.0, mem: mem * 0.4, tty: '?', stat: 'S', ni: 0, command: def.workers.cmd || def.cmd, comm: def.comm }, base));
                pids.push(pid);
            }
        }
        svc.pids = pids;
        svc.mainPid = master;
    }

    _svSort() { this.shared.processes.sort((a, b) => a.pid - b.pid); }

    _svKillProcs(name) {
        const P = this.shared.processes;
        for (let i = P.length - 1; i >= 0; i--) if (P[i].service === name) P.splice(i, 1);
        this.shared.services[name].pids = [];
    }

    _log(name, msg) {
        const svc = this.shared.services[name];
        if (!svc) return;
        if (!svc.log) svc.log = [];
        const d = new Date();
        svc.log.push(`${this._loc(d, '%b %e %H:%M:%S')} rhcsa-lab ${msg}`);
        if (svc.log.length > 40) svc.log.shift();
    }
    _loc(d, fmt) {
        const tm = this.shared.timeCmds;
        return tm ? tm.format(d, tm.tm.tz, fmt) : d.toISOString();
    }
    _mon(d) { return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]; }
    _hms(d) { return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`; }
    _stamp(d) {
        if (this.shared.timeCmds) return this._loc(d, '%a %Y-%m-%d %H:%M:%S %Z'); return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]} ${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${this._hms(d)} UTC`; }
    _ago(d) {
        const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}min ${s % 60}s ago`;
        return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min ago`;
    }

    // configured listening port of a unit, and whether SELinux / another unit blocks it
    _svPort(name) {
        const def = this.svDefs[name];
        if (!def || !def.port) return null;
        let port = def.port.def;
        if (def.port.file) {
            const node = this.fs.getNode(def.port.file);
            const m = node && node.content ? def.port.re.exec(node.content) : null;
            if (m) port = parseInt(m[1], 10);
        }
        return { port, type: def.port.type, proto: def.port.proto };
    }

    _unitFileExists(name) {
        const def = this.svDefs[name];
        if (!def) return false;
        if (def.pkg && !this.shared.installedPackages.includes(def.pkg)) return false;
        return true;
    }

    _svStart(name, isRestart) {
        const S = this.shared.services[name];
        const def = this.svDefs[name];
        const unit = `${name}.service`;
        if (S.masked) return this._err(`Failed to start ${unit}: Unit ${unit} is masked.`);
        if (S.active) return null;
        const failMsg = `Job for ${unit} failed because the control process exited with error code.\nSee "systemctl status ${unit}" and "journalctl -xeu ${unit}" for details.`;
        const p = this._svPort(name);
        if (p) {
            // another unit already listening on that port
            const other = Object.keys(this.svDefs).find(o => o !== name && this.shared.services[o].active && this._svPort(o) && this._svPort(o).port === p.port && this._svPort(o).proto === p.proto);
            if (other) {
                S.active = false; S.failed = true; S.since = new Date(); S.failReason = 'exit-code';
                this._log(name, `systemd[1]: Starting ${def.desc}...`);
                if (name === 'httpd') this._log(name, `httpd[${this.svNextPid}]: (98)Address already in use: AH00072: make_sock: could not bind to address [::]:${p.port}`);
                else if (name === 'nginx') this._log(name, `nginx[${this.svNextPid}]: nginx: [emerg] bind() to 0.0.0.0:${p.port} failed (98: Address already in use)`);
                else this._log(name, `${name}[${this.svNextPid}]: error: bind failed: Address already in use`);
                this._log(name, `systemd[1]: ${unit}: Failed with result 'exit-code'.`);
                this._log(name, `systemd[1]: Failed to start ${def.desc}.`);
                return this._err(failMsg);
            }
            const selinux = this.shared.parent && this.shared.parent.seCheckBind ? this.shared.parent.seCheckBind(name, def, p) : null;
            if (selinux && selinux.denied) {
                S.active = false; S.failed = true; S.since = new Date(); S.failReason = 'exit-code';
                this._log(name, `systemd[1]: Starting ${def.desc}...`);
                if (name === 'httpd') this._log(name, `httpd[${this.svNextPid}]: (13)Permission denied: AH00072: make_sock: could not bind to address [::]:${p.port}`);
                else if (name === 'nginx') this._log(name, `nginx[${this.svNextPid}]: nginx: [emerg] bind() to 0.0.0.0:${p.port} failed (13: Permission denied)`);
                else if (name === 'sshd') { this._log(name, `sshd[${this.svNextPid}]: error: Bind to port ${p.port} on 0.0.0.0 failed: Permission denied.`); this._log(name, `sshd[${this.svNextPid}]: fatal: Cannot bind any address.`); }
                else this._log(name, `${name}[${this.svNextPid}]: error: could not bind to port ${p.port}: Permission denied`);
                this._log(name, `systemd[1]: ${unit}: Failed with result 'exit-code'.`);
                this._log(name, `systemd[1]: Failed to start ${def.desc}.`);
                return this._err(name === 'sshd' ? `Job for ${unit} failed because the control process exited with error code.\nSee "systemctl status ${unit}" and "journalctl -xeu ${unit}" for details.` : failMsg);
            }
        }
        // a configuration file that does not parse stops the daemon from starting
        const cfg = this._svConfigError(name);
        if (cfg) {
            S.active = false; S.failed = true; S.since = new Date(); S.failReason = 'exit-code';
            this._log(name, `systemd[1]: Starting ${def.desc}...`);
            for (const l of cfg.split('\n')) this._log(name, `${name}[${this.svNextPid}]: ${l}`);
            this._log(name, `systemd[1]: ${unit}: Failed with result 'exit-code'.`);
            this._log(name, `systemd[1]: Failed to start ${def.desc}.`);
            return this._err(failMsg);
        }
        S.active = true; S.failed = false; S.failReason = null; S.since = new Date();
        this._svSpawn(name);
        this._svSort();
        this._log(name, `systemd[1]: Starting ${def.desc}...`);
        if (name === 'httpd') this._log(name, `httpd[${S.mainPid}]: Server configured, listening on: port ${p ? p.port : 80}`);
        if (name === 'sshd') this._log(name, `sshd[${S.mainPid}]: Server listening on 0.0.0.0 port ${p ? p.port : 22}.`);
        this._log(name, `systemd[1]: Started ${def.desc}.`);
        if (name === 'chronyd' && this.shared.timeCmds) this.shared.timeCmds.tm.offsetMs = 0;
        if (this.shared.parent.seOnServiceStart) this.shared.parent.seOnServiceStart(name);
        return null;
    }

    // the message the daemon prints when its configuration is broken, or null when it parses
    _svConfigError(name) {
        const a3 = this.shared.apps3;
        if (!a3) return null;
        try {
            if (name === 'httpd' && a3._httpdCheck) { const c = a3._httpdCheck(); return c.err ? a3._httpdErr(c.err) : null; }
            if (name === 'nginx' && a3._nginxCheck) {
                const r = a3._nginxCheck('/etc/nginx/nginx.conf');
                return r.err ? `nginx: [emerg] ${r.err.msg} in ${r.err.path}:${r.err.line}` : null;
            }
        } catch (e) { /* a checker that cannot run never blocks a start */ }
        return null;
    }

    _svStop(name) {
        const S = this.shared.services[name];
        const def = this.svDefs[name];
        if (!S.active && !S.failed) return;
        this._log(name, `systemd[1]: Stopping ${def.desc}...`);
        this._svKillProcs(name);
        S.active = false; S.failed = false; S.since = new Date();
        this._log(name, `systemd[1]: ${name}.service: Deactivated successfully.`);
        this._log(name, `systemd[1]: Stopped ${def.desc}.`);
    }

    // ===== systemctl: service verbs; everything else goes to the original implementation =====

    installHooks(parent) {
        this._origSystemctl = parent.systemctl;
        this._origDnf = parent.dnf;
        this._origRpm = parent.rpm;
        this._origJournalctl = parent.journalctl;
        this._origIp = parent.ip;
        parent.ip = (args, stdin) => this._ip(args, stdin);
        parent.journalctl = (args, stdin) => this._journalctl(args, stdin);
        parent.systemctl = (args, stdin) => this._systemctl(args, stdin);
        parent.dnf = (args, stdin) => this._dnf(args, stdin);
        parent.rpm = (args, stdin) => this._rpm(args, stdin);
    }

    _systemctl(args, stdin) {
        // strip global options that do not change the result here
        const opts = [];
        const pos = [];
        for (const a of args) (a.startsWith('-') && a !== '-' ? opts : pos).push(a);
        const verb = pos[0];
        const unitsRaw = pos.slice(1);
        const optHas = (...ks) => opts.some(o => ks.includes(o));
        if (opts.includes('--user')) return this._origSystemctl(args, stdin);

        const svcVerbs = ['start', 'stop', 'restart', 'reload', 'try-restart', 'reload-or-restart', 'enable', 'disable', 'mask', 'unmask', 'status', 'is-active', 'is-enabled', 'is-failed', 'kill', 'reset-failed', 'show', 'cat', 'condrestart'];
        if (verb === 'list-units' || verb === 'list-unit-files' || verb === undefined) {
            if (!verb) return this._origSystemctl(args, stdin);
            const typeOpt = opts.find(o => o.startsWith('--type=')) || (optHas('-t') ? '--type=' + pos[1] : null);
            const type = typeOpt ? typeOpt.slice(7) : (pos[1] && !opts.length ? null : null);
            const wantSvc = (opts.includes('--type=service')) || (type === 'service');
            if (verb === 'list-units' && (wantSvc || opts.includes('--failed'))) return this._listUnits(opts);
            if (verb === 'list-unit-files' && wantSvc) return this._listUnitFiles(opts, pos[1]);
            return this._origSystemctl(args, stdin);
        }
        if (opts.includes('--failed') && !verb) return this._listUnits(opts);
        if (!svcVerbs.includes(verb)) return this._origSystemctl(args, stdin);

        if (verb === 'kill') return this._kill(opts, args, unitsRaw);
        if (unitsRaw.length === 0) {
            if (verb === 'show' || verb === 'status') return this._origSystemctl(args, stdin);
            return this._err(`Too few arguments.`);
        }
        const outs = [];
        const errs = [];
        let code = 0;
        for (const raw of unitsRaw) {
            if (/\.(socket|target|timer|mount|path|slice|device|swap)$/.test(raw)) {
                const r = this._origSystemctl([verb, raw, ...opts], stdin);
                if (r.stdout || r.output) outs.push(r.stdout || r.output);
                if (r.stderr || r.error) { errs.push(r.stderr || r.error); code = r.exitCode || 1; }
                continue;
            }
            const name = this._svcName(raw);
            const S = this.shared.services[name];
            const unit = `${name}.service`;
            const known = S && this.svDefs[name] && this._unitFileExists(name);
            const mutating = ['start', 'stop', 'restart', 'reload', 'try-restart', 'reload-or-restart', 'enable', 'disable', 'mask', 'unmask', 'condrestart', 'reset-failed'].includes(verb);
            if (!known && !this.svMaskedExtra) this.svMaskedExtra = new Set();
            if (!known && ['mask', 'unmask'].includes(verb) && !S) {
                if (!this._root()) { errs.push(`Failed to ${verb} unit: Interactive authentication required.`); code = 1; continue; }
                if (verb === 'mask' && !this.svMaskedExtra.has(name)) { this.svMaskedExtra.add(name); outs.push(`Created symlink /etc/systemd/system/${unit} → /dev/null.`); }
                if (verb === 'unmask' && this.svMaskedExtra.has(name)) { this.svMaskedExtra.delete(name); outs.push(`Removed "/etc/systemd/system/${unit}".`); }
                continue;
            }
            if (!known && this.svMaskedExtra.has(name)) {
                if (verb === 'is-enabled') { outs.push('masked'); code = 1; continue; }
                if (verb === 'is-active') { outs.push('inactive'); code = 3; continue; }
                if (verb === 'status') { outs.push(`○ ${unit}\n     Loaded: masked (Reason: Unit ${unit} is masked.)\n     Active: inactive (dead)`); code = 3; continue; }
                if (['start', 'restart', 'reload', 'enable'].includes(verb)) { errs.push(verb === 'enable' ? `Failed to enable unit: Unit file /etc/systemd/system/${unit} is masked.` : `Failed to ${verb} ${unit}: Unit ${unit} is masked.`); code = 1; continue; }
            }
            if (!known) {
                if (['is-active', 'is-enabled', 'is-failed'].includes(verb)) {
                    outs.push(verb === 'is-active' ? 'inactive' : verb === 'is-failed' ? 'inactive' : 'not-found'.replace('not-found', ''));
                    if (verb === 'is-enabled') { errs.push(`Failed to get unit file state for ${unit}: No such file or directory`); outs.pop(); }
                    code = verb === 'is-failed' ? 1 : (verb === 'is-enabled' ? 1 : 4); continue;
                }
                if (verb === 'status') { errs.push(`Unit ${unit} could not be found.`); code = 4; continue; }
                if (verb === 'show') { outs.push(`Id=${unit}\nNames=${unit}\nLoadState=not-found\nActiveState=inactive\nSubState=dead`); continue; }
                errs.push(mutating && ['enable', 'disable', 'mask', 'unmask'].includes(verb) ? `Failed to ${verb} unit: Unit file ${unit} does not exist.` : `Failed to ${verb} ${unit}: Unit ${unit} not found.`);
                code = verb === 'mask' || verb === 'unmask' || verb === 'enable' || verb === 'disable' ? 1 : 5;
                continue;
            }
            if (mutating && !this._root()) {
                errs.push(['enable', 'disable', 'mask', 'unmask'].includes(verb) ? `Failed to ${verb} unit: Interactive authentication required.` : `Failed to ${verb} ${unit}: Interactive authentication required.\nSee system logs and 'systemctl status ${unit}' for details.`);
                code = 1; continue;
            }
            const now = optHas('--now');
            switch (verb) {
                case 'start': { const r = this._svStart(name); if (r) { errs.push(r.stderr); code = 1; } break; }
                case 'stop': this._svStop(name); break;
                case 'restart': case 'condrestart': {
                    if (S.masked) { errs.push(`Failed to restart ${unit}: Unit ${unit} is masked.`); code = 1; break; }
                    this._svStop(name); const r = this._svStart(name); if (r) { errs.push(r.stderr); code = 1; } break; }
                case 'try-restart': if (S.active) { this._svStop(name); const r = this._svStart(name); if (r) { errs.push(r.stderr); code = 1; } } break;
                case 'reload': case 'reload-or-restart':
                    if (!S.active) { errs.push(`Failed to ${verb} ${unit}: Unit ${unit} is not active.`); code = 1; break; }
                    if (!this.svDefs[name].reload) {
                        if (verb === 'reload-or-restart') { this._svStop(name); const r = this._svStart(name); if (r) { errs.push(r.stderr); code = 1; } }
                        else { errs.push(`Failed to reload ${unit}: Job type reload is not applicable for unit ${unit}.`); code = 1; }
                        break;
                    }
                    this._log(name, `systemd[1]: Reloading ${this.svDefs[name].desc}...`);
                    this._log(name, `systemd[1]: Reloaded ${this.svDefs[name].desc}.`);
                    break;
                case 'enable': {
                    if (S.masked) { errs.push(`Failed to enable unit: Unit file ${'/etc/systemd/system/' + unit} is masked.`); code = 1; break; }
                    if (this.svDefs[name].static) { errs.push(`The unit files have no installation config (WantedBy=, RequiredBy=, Also=,\nAlias= settings in the [Install] section, and DefaultInstance= for template\nunits). This means they are not meant to be enabled or disabled using systemctl.`); break; }
                    if (!S.enabled) {
                        S.enabled = true;
                        outs.push(`Created symlink /etc/systemd/system/multi-user.target.wants/${unit} → /usr/lib/systemd/system/${unit}.`);
                        if (name === 'firewalld') outs.push(`Created symlink /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service → /usr/lib/systemd/system/firewalld.service.`);
                    }
                    if (now) { const r = this._svStart(name); if (r) { errs.push(r.stderr); code = 1; } }
                    break; }
                case 'disable':
                    if (S.enabled) { S.enabled = false; outs.push(`Removed "/etc/systemd/system/multi-user.target.wants/${unit}".`); }
                    if (now) this._svStop(name);
                    break;
                case 'mask':
                    if (S.masked) break;
                    S.masked = true; if (S.active && optHas('--now')) this._svStop(name);
                    outs.push(`Created symlink /etc/systemd/system/${unit} → /dev/null.`);
                    break;
                case 'unmask':
                    if (S.masked) { S.masked = false; outs.push(`Removed "/etc/systemd/system/${unit}".`); }
                    break;
                case 'reset-failed': S.failed = false; S.failReason = null; break;
                case 'status': { const r = this._status(name, opts); outs.push(r.stdout); if (r.exitCode) code = r.exitCode; break; }
                case 'is-active': outs.push(S.active ? 'active' : (S.failed ? 'failed' : 'inactive')); if (!S.active) code = 3; break;
                case 'is-failed': outs.push(S.failed ? 'failed' : (S.active ? 'active' : 'inactive')); if (!S.failed) code = 1; break;
                case 'is-enabled': {
                    const st = S.masked ? 'masked' : (this.svDefs[name].static ? 'static' : (S.enabled ? 'enabled' : 'disabled'));
                    outs.push(st); if (st === 'disabled' || st === 'masked') code = 1; break; }
                case 'show': outs.push(this._show(name, opts, args)); break;
                case 'cat': outs.push(`# /usr/lib/systemd/system/${unit}\n[Unit]\nDescription=${this.svDefs[name].desc}\nAfter=network.target\n\n[Service]\nType=${this.svDefs[name].oneshot ? 'oneshot' : 'simple'}\nExecStart=${this.svDefs[name].exec}\n\n[Install]\nWantedBy=multi-user.target`); break;
            }
        }
        return { stdout: outs.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _svcName(raw) { return this._svUnitName(raw); }

    // journalctl -u UNIT reads the per-unit log kept by the service model
    _journalctl(args, stdin) {
        const uIdx = args.findIndex(a => a === '-u' || a === '--unit');
        const uEq = args.find(a => a.startsWith('--unit='));
        const unitRaw = uEq ? uEq.slice(7) : (uIdx >= 0 ? args[uIdx + 1] : null);
        if (!unitRaw) return this._origJournalctl(args, stdin);
        if (args.some(a => ['--disk-usage', '--vacuum-size', '--flush', '-k', '--list-boots'].includes(a))) return this._origJournalctl(args, stdin);
        const name = this._svcName(unitRaw);
        const S = this.shared.services[name];
        if (!S || !this.svDefs[name]) return this._ok('-- No entries --');
        let log = (S.log || []).slice();
        if (!log.length && S.active) {
            const d = S.since || this.svBoot;
            log = [`${this._loc(d, '%b %e %H:%M:%S')} rhcsa-lab systemd[1]: Starting ${this.svDefs[name].desc}...`, `${this._loc(d, '%b %e %H:%M:%S')} rhcsa-lab systemd[1]: Started ${this.svDefs[name].desc}.`];
        }
        const nIdx = args.findIndex(a => a === '-n' || a === '--lines');
        const nEq = args.find(a => /^--lines=\d+$/.test(a) || /^-n\d+$/.test(a));
        const n = nIdx >= 0 ? parseInt(args[nIdx + 1], 10) : (nEq ? parseInt(nEq.replace(/\D/g, ''), 10) : null);
        if (n) log = log.slice(-n);
        if (args.includes('-r') || args.includes('--reverse')) log.reverse();
        if (!log.length) return this._ok('-- No entries --');
        return this._ok(log.join('\n').replace(/^(\w{3})  (\d) /gm, '$1 0$2 '));
    }

    _status(name, opts) {
        const S = this.shared.services[name];
        const def = this.svDefs[name];
        const unit = `${name}.service`;
        const state = S.masked ? 'masked' : (def.static ? 'static' : (S.enabled ? 'enabled' : 'disabled'));
        const preset = ['sshd', 'firewalld', 'chronyd', 'crond', 'atd', 'rsyslog', 'NetworkManager', 'tuned', 'auditd', 'kdump', 'systemd-journald'].includes(name) ? 'enabled' : 'disabled';
        const dot = S.active ? '●' : (S.failed ? '×' : '○');
        const lines = [`${dot} ${unit} - ${def.desc}`];
        lines.push(`     Loaded: ${S.masked ? 'masked (Reason: Unit ' + unit + ' is masked.)' : `loaded (/usr/lib/systemd/system/${unit}; ${state}; preset: ${preset})`}`);
        if (def.oneshot && S.active) lines.push(`     Active: active (exited) since ${this._stamp(S.since || this.svBoot)}; ${this._ago(S.since || this.svBoot)}`);
        else if (S.active) lines.push(`     Active: active (running) since ${this._stamp(S.since || this.svBoot)}; ${this._ago(S.since || this.svBoot)}`);
        else if (S.failed) lines.push(`     Active: failed (Result: ${S.failReason || 'exit-code'}) since ${this._stamp(S.since)}; ${this._ago(S.since)}`);
        else lines.push(`     Active: inactive (dead)${S.since ? ` since ${this._stamp(S.since)}; ${this._ago(S.since)}` : ''}`);
        if (def.docs) lines.push(`       Docs: ${def.docs}`);
        if (S.active && S.mainPid && def.cmd) {
            lines.push(`   Main PID: ${S.mainPid} (${def.comm})`);
            if (name === 'httpd') lines.push(`     Status: "Total requests: 0; Idle/Busy workers 100/0;Requests/sec: 0; Bytes served/sec:   0 B/sec"`);
            const nproc = (S.pids || []).length;
            lines.push(`      Tasks: ${name === 'httpd' ? 213 : nproc} (limit: 22978)`);
            const mem = this.shared.processes.filter(p => p.service === name).reduce((s, p) => s + p.mem, 0);
            lines.push(`     Memory: ${(mem * 37.5).toFixed(1)}M`);
            lines.push(`        CPU: ${20 + (S.mainPid % 60)}ms`);
            lines.push(`     CGroup: /system.slice/${unit}`);
            const procs = this.shared.processes.filter(p => p.service === name);
            procs.forEach((p, i) => lines.push(`             ${i === procs.length - 1 ? '└─' : '├─'}${p.pid} ${p.command}`));
        } else if (S.failed) {
            lines.push(`    Process: ${this.svNextPid - 1} ExecStart=${def.exec} (code=exited, status=${name === 'sshd' ? '255/EXCEPTION' : '1/FAILURE'})`);
            lines.push(`   Main PID: ${this.svNextPid - 1} (code=exited, status=${name === 'sshd' ? '255/EXCEPTION' : '1/FAILURE'})`);
            lines.push(`        CPU: 31ms`);
        }
        lines.push('');
        const log = (S.log || []).slice(-10);
        if (!log.length && S.active) {
            const d = S.since || this.svBoot;
            log.push(`${this._loc(d, '%b %e %H:%M:%S')} rhcsa-lab systemd[1]: Started ${def.desc}.`);
        }
        lines.push(...log);
        return { stdout: lines.join('\n'), exitCode: S.active ? 0 : 3 };
    }

    _show(name, opts, args) {
        const S = this.shared.services[name];
        const def = this.svDefs[name];
        const all = {
            Id: `${name}.service`, Names: `${name}.service`, Description: def.desc, LoadState: 'loaded',
            ActiveState: S.active ? 'active' : (S.failed ? 'failed' : 'inactive'),
            SubState: S.active ? (def.oneshot ? 'exited' : 'running') : (S.failed ? 'failed' : 'dead'),
            MainPID: String(S.active && S.mainPid ? S.mainPid : 0), ExecStart: `{ path=${def.exec.split(' ')[0]} ; argv[]=${def.exec} ; }`,
            UnitFileState: S.masked ? 'masked' : (S.enabled ? 'enabled' : 'disabled'), FragmentPath: `/usr/lib/systemd/system/${name}.service`
        };
        const pIdx = args.findIndex(a => a === '-p' || a === '--property');
        const pl = pIdx >= 0 ? args[pIdx + 1] : (args.find(a => a.startsWith('--property=')) || '').slice(11);
        if (pl) return pl.split(',').filter(k => k in all).map(k => `${k}=${all[k]}`).join('\n');
        return Object.entries(all).map(([k, v]) => `${k}=${v}`).join('\n');
    }

    _listUnits(opts) {
        const S = this.shared.services;
        const failedOnly = opts.includes('--failed');
        const all = opts.includes('--all') || opts.includes('-a');
        const stateOpt = (opts.find(o => o.startsWith('--state=')) || '').slice(8);
        let rows = Object.keys(this.svDefs).filter(n => this._unitFileExists(n)).map(n => {
            const s = S[n];
            const active = s.active ? 'active' : (s.failed ? 'failed' : 'inactive');
            const sub = s.active ? (this.svDefs[n].oneshot ? 'exited' : 'running') : (s.failed ? 'failed' : 'dead');
            return { n, load: 'loaded', active, sub, desc: this.svDefs[n].desc };
        });
        // a few always-present system services
        rows.push({ n: 'dbus-broker', load: 'loaded', active: 'active', sub: 'running', desc: 'D-Bus System Message Bus' });
        rows.push({ n: 'systemd-logind', load: 'loaded', active: 'active', sub: 'running', desc: 'User Login Management' });
        rows.push({ n: 'systemd-udevd', load: 'loaded', active: 'active', sub: 'running', desc: 'Rule-based Manager for Device Events and Files' });
        rows.push({ n: 'polkit', load: 'loaded', active: 'active', sub: 'running', desc: 'Authorization Manager' });
        if (failedOnly) rows = rows.filter(r => r.active === 'failed');
        else if (stateOpt) rows = rows.filter(r => r.sub === stateOpt || r.active === stateOpt);
        else if (!all) rows = rows.filter(r => r.active === 'active');
        rows.sort((a, b) => a.n.localeCompare(b.n));
        if (!rows.length) return this._ok(failedOnly ? '  UNIT LOAD ACTIVE SUB DESCRIPTION\n0 loaded units listed.' : '0 loaded units listed.');
        const w = Math.max(4, ...rows.map(r => r.n.length + 8));
        const lines = [`  ${'UNIT'.padEnd(w)} LOAD   ACTIVE SUB     DESCRIPTION`];
        for (const r of rows) lines.push(`${r.active === 'failed' ? '● ' : '  '}${(r.n + '.service').padEnd(w)} ${r.load.padEnd(6)} ${r.active.padEnd(6)} ${r.sub.padEnd(7)} ${r.desc}`);
        lines.push('', 'LOAD   = Reflects whether the unit definition was properly loaded.', 'ACTIVE = The high-level unit activation state, i.e. generalization of SUB.', 'SUB    = The low-level unit activation state, values depend on unit type.', '', `${rows.length} loaded units listed.${all || failedOnly || stateOpt ? '' : ' Pass --all to see loaded but inactive units, too.'}`, `To show all installed unit files use 'systemctl list-unit-files'.`);
        return this._ok(lines.join('\n'));
    }

    _listUnitFiles(opts, filter) {
        const S = this.shared.services;
        const stateOpt = (opts.find(o => o.startsWith('--state=')) || '').slice(8);
        const preset = (n) => (['sshd', 'firewalld', 'chronyd', 'crond', 'atd', 'rsyslog', 'NetworkManager', 'tuned', 'auditd', 'kdump'].includes(n) ? 'enabled' : 'disabled');
        let rows = Object.keys(this.svDefs).filter(n => this._unitFileExists(n)).map(n => ({ n: n + '.service', st: S[n].masked ? 'masked' : (this.svDefs[n].static ? 'static' : (S[n].enabled ? 'enabled' : 'disabled')), pr: this.svDefs[n].static ? '-' : preset(n) }));
        for (const x of ['dbus-broker', 'systemd-logind', 'systemd-udevd', 'polkit', 'getty@', 'user@']) rows.push({ n: x + '.service', st: 'static', pr: '-' });
        if (stateOpt) rows = rows.filter(r => r.st === stateOpt);
        rows.sort((a, b) => a.n.localeCompare(b.n));
        const w = Math.max(9, ...rows.map(r => r.n.length));
        const out = [`${'UNIT FILE'.padEnd(w)} STATE    PRESET`];
        for (const r of rows) out.push(`${r.n.padEnd(w)} ${r.st.padEnd(8)} ${r.pr}`);
        out.push('', `${rows.length} unit files listed.`);
        return this._ok(out.join('\n'));
    }

    // systemctl kill [-s SIG|--signal=SIG] unit
    _kill(opts, args, units) {
        if (!this._root()) return this._err(`Failed to kill unit ${units[0] || ''}: Interactive authentication required.`);
        const sIdx = args.findIndex(a => a === '-s' || a === '--signal');
        let sig = 'SIGTERM';
        if (sIdx >= 0) sig = args[sIdx + 1];
        const eq = args.find(a => a.startsWith('--signal='));
        if (eq) sig = eq.slice(9);
        const unitArgs = units.filter(u => u !== sig);
        const name = this._svcName(unitArgs[0] || '');
        if (!this.shared.services[name] || !this.svDefs[name]) return this._err(`Failed to kill unit ${name}.service: Unit ${name}.service not loaded.`);
        const s = this._sigNum(sig);
        if (s === null) return this._err(`Failed to parse signal string ${sig}.`);
        this._signalService(name, s);
        return this._ok();
    }

    _sigNum(sig) {
        const table = { HUP: 1, INT: 2, QUIT: 3, KILL: 9, USR1: 10, SEGV: 11, USR2: 12, TERM: 15, CONT: 18, STOP: 19, 0: 0 };
        if (/^\d+$/.test(String(sig))) return parseInt(sig, 10);
        const k = String(sig).toUpperCase().replace(/^SIG/, '');
        return k in table ? table[k] : null;
    }

    _signalService(name, sig) {
        const S = this.shared.services[name];
        if (!S.active) return;
        if (sig === 0 || sig === 18 || sig === 19) return;
        if (sig === 1 && this.svDefs[name].reload) { this._log(name, `systemd[1]: Reloading ${this.svDefs[name].desc}...`); return; }
        // ordinary termination
        this._svKillProcs(name);
        S.active = false;
        S.since = new Date();
        if (sig === 9) { S.failed = true; S.failReason = 'signal'; this._log(name, `systemd[1]: ${name}.service: Main process exited, code=killed, status=9/KILL`); this._log(name, `systemd[1]: ${name}.service: Failed with result 'signal'.`); }
        else { this._log(name, `systemd[1]: ${name}.service: Deactivated successfully.`); }
    }

    // ===== kill, pkill, killall, pgrep, pidof =====

    kill(args) {
        if (args.length === 0) return this._err('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]', 2);
        if (args[0] === '-l' || args[0] === '-L') {
            if (args[1]) { const n = this._sigNum(args[1]); const names = { 1: 'HUP', 2: 'INT', 3: 'QUIT', 9: 'KILL', 15: 'TERM', 10: 'USR1', 12: 'USR2', 18: 'CONT', 19: 'STOP' }; return this._ok(/^\d+$/.test(args[1]) ? (names[n] || '') : String(n)); }
            const list = [' 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 4) SIGILL\t 5) SIGTRAP', ' 6) SIGABRT\t 7) SIGBUS\t 8) SIGFPE\t 9) SIGKILL\t10) SIGUSR1', '11) SIGSEGV\t12) SIGUSR2\t13) SIGPIPE\t14) SIGALRM\t15) SIGTERM', '16) SIGSTKFLT\t17) SIGCHLD\t18) SIGCONT\t19) SIGSTOP\t20) SIGTSTP', '21) SIGTTIN\t22) SIGTTOU\t23) SIGURG\t24) SIGXCPU\t25) SIGXFSZ', '26) SIGVTALRM\t27) SIGPROF\t28) SIGWINCH\t29) SIGIO\t30) SIGPWR', '31) SIGSYS\t34) SIGRTMIN\t35) SIGRTMIN+1\t36) SIGRTMIN+2\t37) SIGRTMIN+3'];
            return this._ok(list.join('\n'));
        }
        let sig = 15;
        const pids = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-s' || a === '-n') { const s = this._sigNum(args[++i]); if (s === null) return this._err(`bash: kill: ${args[i]}: invalid signal specification`, 1); sig = s; }
            else if (/^-[A-Za-z0-9]+$/.test(a)) { const s = this._sigNum(a.slice(1)); if (s === null) return this._err(`bash: kill: ${a.slice(1)}: invalid signal specification`, 1); sig = s; }
            else pids.push(a);
        }
        if (!pids.length) return this._err('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]', 2);
        const errs = [];
        for (const raw of pids) {
            if (!/^\d+$/.test(raw)) { errs.push(`bash: kill: ${raw}: arguments must be process or job IDs`); continue; }
            const code = this._signalPid(parseInt(raw, 10), sig, errs, true);
        }
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    _signalPid(pid, sig, errs, verbose) {
        const P = this.shared.processes;
        const p = P.find(x => x.pid === pid);
        if (!p) { if (verbose) errs.push(`bash: kill: (${pid}) - No such process`); return 1; }
        if (!this._root() && p.user !== this.fs.currentUser) { if (verbose) errs.push(`bash: kill: (${pid}) - Operation not permitted`); return 1; }
        if (sig === 0) return 0;
        if (pid === 1 || /^\[.*\]$/.test(p.command)) { if (sig === 9 && pid !== 1) { /* kernel threads ignore */ } return 0; }
        if (p.pid === 1201) { if (sig === 9 || sig === 15 && false) { /* your own shell: ignore in the simulator */ } return 0; }
        if (p.customUnit && this.shared.units) { this.shared.units._procKilled(p, sig); return 0; }
        const name = p.service;
        if (!name) {
            if (sig === 1 || sig === 18 || sig === 19) return 0;
            P.splice(P.indexOf(p), 1);
            return 0;
        }
        const S = this.shared.services[name];
        const isMaster = S.mainPid === pid;
        if (isMaster) { this._signalService(name, sig); return 0; }
        // worker: HUP/TERM/KILL -> master respawns a replacement
        if (sig === 1 || sig === 18 || sig === 19) return 0;
        P.splice(P.indexOf(p), 1);
        S.pids = (S.pids || []).filter(x => x !== pid);
        const np = Object.assign({}, p, { pid: this.svNextPid++ });
        P.push(np);
        S.pids.push(np.pid);
        this._svSort();
        return 0;
    }

    _matchProcs(pattern, o) {
        let re;
        try { re = new RegExp(pattern, o.i ? 'i' : ''); } catch (e) { return null; }
        return this.shared.processes.filter(p => !/^\[.*\]$/.test(p.command) || o.kernel).filter(p => {
            const target = o.f ? p.command : p.comm;
            if (o.x ? target !== pattern : !re.test(target)) return false;
            if (o.u !== undefined && o.u !== true && p.user !== o.u) return false;
            return true;
        });
    }

    _pOpts(args, withSignal) {
        const o = {}; const rest = []; let sig = 15;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-u' || a === '--euid') o.u = args[++i];
            else if (a === '-U') o.u = args[++i];
            else if (a === '-s' || a === '--signal') { sig = this._sigNum(args[++i]); }
            else if (withSignal && /^-(\d+|[A-Z]+)$/.test(a) && this._sigNum(a.slice(1)) !== null && !/^-[xfilnovq]$/.test(a)) sig = this._sigNum(a.slice(1));
            else if (/^-[a-zA-Z]+$/.test(a)) for (const ch of a.slice(1)) o[ch] = true;
            else rest.push(a);
        }
        return { o, rest, sig };
    }

    pgrep(args) {
        const { o, rest } = this._pOpts(args, false);
        if (!rest[0] && o.u === undefined) return this._err('pgrep: no matching criteria specified\nTry `pgrep --help\' for more information.', 2);
        const hits = this._matchProcs(rest[0] || '.', o);
        if (!hits) return this._err('pgrep: invalid regular expression', 2);
        if (!hits.length) return { stdout: '', stderr: '', exitCode: 1 };
        return this._ok(hits.map(p => (o.a ? `${p.pid} ${p.command}` : o.l ? `${p.pid} ${p.comm}` : String(p.pid))).join(o.d ? ',' : '\n'));
    }

    pidof(args) {
        const names = args.filter(a => !a.startsWith('-'));
        if (!names.length) return { stdout: '', stderr: '', exitCode: 1 };
        const found = [];
        for (const n of names) for (const p of this.shared.processes) if (p.comm === n || p.command.split(' ')[0].split('/').pop() === n) found.push(p.pid);
        if (!found.length) return { stdout: '', stderr: '', exitCode: 1 };
        found.sort((a, b) => b - a);
        return this._ok((args.includes('-s') ? found.slice(0, 1) : found).join(' '));
    }

    pkill(args) {
        const { o, rest, sig } = this._pOpts(args, true);
        if (!rest[0] && o.u === undefined) return this._err('pkill: no matching criteria specified\nTry `pkill --help\' for more information.', 2);
        if (sig === null) return this._err('pkill: invalid signal', 2);
        const hits = this._matchProcs(rest[0] || '.', o);
        if (!hits) return this._err('pkill: invalid regular expression', 2);
        if (!hits.length) return { stdout: '', stderr: '', exitCode: 1 };
        const errs = [];
        for (const p of hits.slice()) { if (p.pid === 1201) continue; this._signalPid(p.pid, sig, errs, false); }
        return this._ok();
    }

    killall(args) {
        const { o, rest, sig } = this._pOpts(args, true);
        if (!rest.length) return this._err('Usage: killall [OPTION]... [--] NAME...', 1);
        if (!this._root() && false) return this._err('');
        const errs = [];
        for (const n of rest) {
            const hits = this.shared.processes.filter(p => (p.comm === n || (o.e ? false : p.command.split(' ')[0].split('/').pop() === n)) && !/^\[.*\]$/.test(p.command));
            const mine = hits.filter(p => this._root() || p.user === this.fs.currentUser);
            if (!hits.length) { errs.push(`${n}: no process found`); continue; }
            if (!mine.length) { errs.push(`${n}(${hits[0].pid}): Operation not permitted`); continue; }
            for (const p of mine) if (p.pid !== 1201) this._signalPid(p.pid, sig, errs, false);
        }
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    // ===== ps =====
    //   Replaces the simplified ps of the extra module: it understands the process table fields.

    ps(args) {
        const ex = this._X();
        const norm = args.map(a => (/^[aux]+[a-zA-Z]*$/.test(a) && !a.startsWith('-') ? '-' + a : a));
        const { o, rest } = ex._opts(norm, 'poUCtT', ['sort']);
        let rows = this.shared.processes.map(p => ({
            pid: p.pid, ppid: p.ppid, user: p.user, cpu: p.cpu, mem: p.mem, ni: p.ni || 0, cmd: p.command, comm: p.comm, tty: p.tty || '?', stat: p.stat || 'S', start: p.start || '09:00',
            time: p.time || '00:00:00', vsz: Math.floor(20000 + p.pid * 13 + (p.mem * 12000)), rss: Math.floor(3000 + p.pid * 3 + (p.mem * 9000)), domain: p.domain || 'unconfined_t', kernel: /^\[.*\]$/.test(p.command)
        }));
        const selected = o.e || o.A || o.a || o.x || (o.p !== undefined && o.p !== true) || (o.U !== undefined) || (o.C !== undefined) || o.u || o.f || o.l || o.ax;
        if (!selected && !o.o) {
            rows = rows.filter(r => r.tty === 'pts/0' && !r.kernel);
            rows.push({ pid: this.svNextPid + 40, ppid: 1201, user: 'root', cpu: 0, mem: 0, ni: 0, cmd: 'ps', comm: 'ps', tty: 'pts/0', stat: 'R+', start: this._hhmm(new Date()), time: '00:00:00', vsz: 223000, rss: 3800, domain: 'unconfined_t' });
        } else if (o.a && !o.x && !o.e && !o.A) {
            rows = rows.filter(r => r.tty !== '?' && r.stat.indexOf('s') < 0 || r.tty.startsWith('pts') || r.tty.startsWith('tty'));
            rows = rows.filter(r => r.tty !== '?');
        } else if (o.x && !o.a && !o.e) {
            rows = rows.filter(r => r.user === this.fs.currentUser || true);
        }
        if (o.p !== undefined && o.p !== true) { const w = String(o.p).split(/[ ,]+/).map(Number); rows = rows.filter(r => w.includes(r.pid)); }
        if (o.U !== undefined && o.U !== true) rows = rows.filter(r => r.user === o.U);
        if (o.C !== undefined && o.C !== true) rows = rows.filter(r => r.comm === o.C);
        if (o.sort) {
            const desc = String(o.sort).startsWith('-');
            const key = String(o.sort).replace(/^[-+]/, '').replace('%', '');
            const map = { pcpu: 'cpu', cpu: 'cpu', pmem: 'mem', mem: 'mem', rss: 'rss', vsz: 'vsz', pid: 'pid', ni: 'ni', nice: 'ni', user: 'user', comm: 'comm', cmd: 'cmd', time: 'time' };
            const k = map[key];
            if (!k) return this._err(`error: unknown sort key: ${key}`, 1);
            rows.sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (desc ? -1 : 1));
        } else rows.sort((a, b) => a.pid - b.pid);

        const pr = (v, n) => String(v).padStart(n);
        const pl = (v, n) => String(v).padEnd(n);
        const fmtCpu = (v) => pr(v.toFixed(1), 4);
        // custom columns
        if (o.o !== undefined && o.o !== true) {
            const defs = {
                pid: ['PID', r => pr(r.pid, 7), 7], ppid: ['PPID', r => pr(r.ppid, 7), 7], ni: ['NI', r => pr(r.ni, 3), 3], nice: ['NI', r => pr(r.ni, 3), 3], user: ['USER', r => pl(r.user, 8), 8],
                cmd: ['CMD', r => r.cmd, 0], args: ['COMMAND', r => r.cmd, 0], command: ['COMMAND', r => r.cmd, 0], comm: ['COMMAND', r => r.comm, 0], '%cpu': ['%CPU', r => fmtCpu(r.cpu), 4], pcpu: ['%CPU', r => fmtCpu(r.cpu), 4],
                '%mem': ['%MEM', r => fmtCpu(r.mem), 4], pmem: ['%MEM', r => fmtCpu(r.mem), 4], rss: ['RSS', r => pr(r.rss, 6), 6], vsz: ['VSZ', r => pr(r.vsz, 7), 7], tty: ['TT', r => pl(r.tty, 8), 8], stat: ['STAT', r => pl(r.stat, 4), 4], time: ['TIME', r => pr(r.time, 8), 8], start: ['STARTED', r => pr(r.start, 8), 8], label: ['LABEL', r => `system_u:system_r:${r.domain}:s0`, 0], euser: ['EUSER', r => pl(r.user, 8), 8], uid: ['UID', r => pr(r.user === 'root' ? 0 : 1000, 5), 5]
            };
            const cols = [];
            for (const raw of String(o.o).split(',')) {
                const nm = raw.split('=')[0].toLowerCase();
                if (!defs[nm]) return this._err(`error: unknown user-defined format specifier "${raw}"\n\nUsage:\n ps [options]\n\n Try 'ps --help <simple|list|output|threads|misc|all>'\n  or 'ps --help <s|l|o|t|m|a>'\n for additional help text.\n\nFor more details see ps(1).`, 1);
                cols.push(defs[nm]);
            }
            const head = cols.map(c => (c[2] ? (c[1]({ pid: 0 }) ? pr(c[0], c[2]) : c[0]) : c[0])).join(' ');
            const headLine = cols.map(c => c[2] ? (['USER', 'TT', 'STAT', 'EUSER'].includes(c[0]) ? pl(c[0], c[2]) : pr(c[0], c[2])) : c[0]).join(' ');
            return this._ok([headLine, ...rows.map(r => cols.map(c => c[1](r)).join(' '))].join('\n'));
        }
        const Z = o.Z;
        const label = (r) => `system_u:system_r:${r.domain}:s0`.replace(/^system_u:system_r:unconfined_t:s0$/, 'unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023').replace(/^system_u:system_r:kernel_t:s0$/, 'system_u:system_r:kernel_t:s0');
        const lw = Math.max(5, ...rows.map(r => label(r).length));
        if (o.u) {
            const head = `${Z ? 'LABEL'.padEnd(lw) + ' ' : ''}USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND`;
            const lines = rows.map(r => `${Z ? label(r).padEnd(lw) + ' ' : ''}${pl(r.user.length > 8 ? r.user.slice(0, 7) + '+' : r.user, 8)} ${pr(r.pid, 7)} ${fmtCpu(r.cpu)} ${fmtCpu(r.mem)} ${pr(r.vsz, 6)} ${pr(r.rss, 5)} ${pl(r.tty, 8)} ${pl(r.stat, 4)} ${pl(r.start, 5)} ${pr(r.time.replace(/^00:/, '').replace(/^0/, ''), 6)} ${r.cmd}`);
            return this._ok([head, ...lines].join('\n'));
        }
        if (o.f || o.l) {
            const full = !!o.f;
            const head = `${Z ? 'LABEL'.padEnd(lw) + ' ' : ''}${full ? 'UID          PID    PPID  C STIME TTY          TIME CMD' : 'F S   UID     PID    PPID  C PRI  NI ADDR SZ WCHAN  TTY          TIME CMD'}`;
            const lines = rows.map(r => `${Z ? label(r).padEnd(lw) + ' ' : ''}` + (full
                ? `${pl(r.user.length > 8 ? r.user.slice(0, 7) + '+' : r.user, 8)} ${pr(r.pid, 7)} ${pr(r.ppid, 7)}  0 ${pl(r.start, 5)} ${pl(r.tty, 8)} ${r.time} ${r.cmd}`
                : `4 ${r.stat[0]} ${pr(r.user === 'root' ? 0 : 1000, 5)} ${pr(r.pid, 7)} ${pr(r.ppid, 7)}  0  80 ${pr(r.ni, 3)} - ${pr(Math.floor(r.vsz / 4), 5)} -      ${pl(r.tty, 8)} ${r.time} ${r.comm}`));
            return this._ok([head, ...lines].join('\n'));
        }
        if (o.e || o.A || (!o.a && !o.x && Z)) {
            const head = `${Z ? 'LABEL'.padEnd(lw) + ' ' : ''}    PID TTY          TIME CMD`;
            const lines = rows.map(r => `${Z ? label(r).padEnd(lw) + ' ' : ''}${pr(r.pid, 7)} ${pl(r.tty, 8)} ${r.time} ${r.comm}`);
            return this._ok([head, ...lines].join('\n'));
        }
        // BSD style: ps ax / ps a / plain
        const head = `${Z ? 'LABEL'.padEnd(lw) + ' ' : ''}    PID TTY      STAT   TIME COMMAND`;
        const lines = rows.map(r => `${Z ? label(r).padEnd(lw) + ' ' : ''}${pr(r.pid, 7)} ${pl(r.tty, 8)} ${pl(r.stat, 4)} ${pr(r.time.replace(/^00:/, '').replace(/^0/, ''), 6)} ${o.a || o.x || selected ? r.cmd : r.comm}`);
        if (!o.a && !o.x && !selected && !Z) {
            return this._ok(['    PID TTY          TIME CMD', ...rows.map(r => `${pr(r.pid, 7)} ${pl(r.tty, 8)} ${r.time} ${r.comm}`)].join('\n'));
        }
        return this._ok([head, ...lines].join('\n'));
    }

    // ===== sockets, uptime, sessions (all derived from the service table) =====

    _listeners() {
        const rows = [];
        const S = this.shared.services;
        const add = (proto, addr, port, comm, pid, v6) => rows.push({ proto, addr, port, comm, pid, v6 });
        for (const name of Object.keys(this.svDefs)) {
            if (!S[name] || !S[name].active) continue;
            const def = this.svDefs[name];
            const p = this._svPort(name);
            const pid = S[name].mainPid;
            if (p) {
                if (name === 'httpd' || name === 'nginx') { add('tcp', '*', p.port, def.comm, pid); }
                else { add('tcp', '0.0.0.0', p.port, def.comm, pid); add('tcp', '[::]', p.port, def.comm, pid, true); }
            }
        }
        if (S.chronyd && S.chronyd.active) { add('udp', '127.0.0.1', 323, 'chronyd', S.chronyd.mainPid); add('udp', '[::1]', 323, 'chronyd', S.chronyd.mainPid, true); }
        if (S.chronyd && S.chronyd.active && this.shared.parent.seChronyServer) add('udp', '0.0.0.0', 123, 'chronyd', S.chronyd.mainPid);
        const rpc = this.shared.parent.nfsListening;
        void rpc;
        return rows;
    }

    ss(args) {
        const f = new Set();
        const filters = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === 'sport' || a === 'dport') { filters.push({ k: a, v: String(args[i + 2] || args[i + 1]).replace(/^[=:]+/, '').replace(/^.*:/, '') }); i += 2; continue; }
            if (a.startsWith('-')) for (const ch of a.slice(1)) f.add(ch);
            else if (a.startsWith(':')) filters.push({ k: 'sport', v: a.slice(1) });
        }
        const wantT = f.has('t'), wantU = f.has('u');
        const all = f.has('a'), listen = f.has('l');
        const showProc = f.has('p');
        const useTcp = wantT || !wantU;
        const useUdp = wantU;
        const showNetid = wantT && wantU;
        let rows = [];
        if (listen || all) {
            for (const r of this._listeners()) {
                if (r.proto === 'tcp' && !useTcp) continue;
                if (r.proto === 'udp' && !useUdp) continue;
                if (f.has('4') && r.v6) continue;
                if (f.has('6') && !r.v6) continue;
                rows.push({ netid: r.proto, state: r.proto === 'udp' ? 'UNCONN' : 'LISTEN', rq: 0, sq: r.proto === 'udp' ? 0 : 128, local: `${r.addr}:${r.port}`, peer: r.v6 ? '[::]:*' : '0.0.0.0:*', proc: `users:(("${r.comm}",pid=${r.pid},fd=${r.proto === 'udp' ? 6 : (r.v6 ? 4 : 3)}))`, port: r.port });
            }
        }
        if (!listen && (useTcp)) {
            const S = this.shared.services;
            if (S.sshd && S.sshd.active) rows.push({ netid: 'tcp', state: 'ESTAB', rq: 0, sq: 0, local: '192.168.1.100:22', peer: '192.168.1.10:52144', proc: 'users:(("sshd",pid=1190,fd=4),("sshd",pid=1180,fd=4))', port: 22 });
        }
        for (const flt of filters) rows = rows.filter(r => String(r.port) === flt.v || (flt.k === 'dport' && /:\d+$/.test(r.peer) && r.peer.endsWith(':' + flt.v)));
        const n = (x) => x;
        const w1 = Math.max(...rows.map(r => r.local.length), 13);
        const w2 = Math.max(...rows.map(r => r.peer.length), 12);
        const hdr = `${showNetid ? 'Netid  ' : ''}State  Recv-Q Send-Q ${'Local Address:Port'.padStart(w1)} ${'Peer Address:Port'.padStart(w2)} ${showProc ? 'Process' : ''}`.trimEnd();
        const lines = rows.map(r => `${showNetid ? r.netid.padEnd(7) : ''}${r.state.padEnd(6)} ${String(r.rq).padEnd(6)} ${String(r.sq).padEnd(6)} ${r.local.padStart(w1)} ${r.peer.padStart(w2)} ${showProc ? r.proc : ''}`.trimEnd());
        return this._ok([hdr, ...lines].join('\n'));
    }

    netstat(args) {
        const f = new Set();
        for (const a of args) if (a.startsWith('-')) for (const ch of a.slice(1)) f.add(ch);
        const listen = f.has('l');
        const rows = this._listeners().filter(r => (r.proto === 'tcp' ? (f.has('t') || !f.has('u')) : f.has('u')));
        const lines = [listen ? 'Active Internet connections (only servers)' : 'Active Internet connections (w/o servers)', 'Proto Recv-Q Send-Q Local Address           Foreign Address         State       ' + (f.has('p') ? 'PID/Program name' : '')];
        for (const r of rows) {
            const v6 = r.v6 || r.addr === '*';
            const local = r.addr === '*' ? ':::' + r.port : (r.v6 ? r.addr + ':' + r.port : r.addr + ':' + r.port);
            lines.push(`${(r.proto + (r.v6 || r.addr === '*' ? '6' : '')).padEnd(5)} ${'0'.padStart(6)} ${'0'.padStart(6)} ${(f.has('n') ? local : local).padEnd(23)} ${(v6 ? ':::*' : '0.0.0.0:*').padEnd(23)} ${(r.proto === 'tcp' ? 'LISTEN' : '').padEnd(11)} ${f.has('p') ? r.pid + '/' + r.comm : ''}`.trimEnd());
        }
        return this._ok(lines.join('\n'));
    }

    uptime(args) {
        const now = new Date();
        const secs = Math.floor((now - this.svBoot) / 1000);
        const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60);
        const up = d ? `${d} day${d > 1 ? 's' : ''}, ${h}:${String(m).padStart(2, '0')}` : (h ? `${h}:${String(m).padStart(2, '0')}` : `${m} min`);
        if (args.includes('-p') || args.includes('--pretty')) return this._ok('up ' + [d && `${d} day${d > 1 ? 's' : ''}`, h && `${h} hour${h > 1 ? 's' : ''}`, `${m} minute${m !== 1 ? 's' : ''}`].filter(Boolean).join(', '));
        if (args.includes('-s') || args.includes('--since')) return this._ok(this._stamp(this.svBoot).replace(/^\w+ /, '').replace(' UTC', ''));
        const tm = this.shared.timeCmds;
        const clock = tm ? tm.format(tm.now(), tm.tm.tz, '%H:%M:%S') : this._hms(now);
        return this._ok(` ${clock} up ${up},  1 user,  load average: 0.00, 0.01, 0.05`);
    }

    who(args) {
        const boot = this._stamp(this.svBoot).split(' ');
        const bootStr = `${boot[1]} ${boot[2].slice(0, 5)}`;
        if (args.includes('-b')) return this._ok(`         system boot  ${bootStr}`);
        if (args.includes('-r')) return this._ok(`         run-level 3  ${bootStr}`);
        if (args.includes('-q')) return this._ok('root\n# users=1');
        const login = this._stamp(new Date(this.svBoot.getTime() + 600000)).split(' ');
        const row = `${this.fs.currentUser.padEnd(8)} pts/0        ${login[1]} ${login[2].slice(0, 5)} (192.168.1.10)`;
        if (args.includes('-H')) return this._ok('NAME     LINE         TIME             COMMENT\n' + row);
        return this._ok(row);
    }

    w(args) {
        const up = this.uptime([]).stdout;
        const login = this._stamp(new Date(this.svBoot.getTime() + 600000)).split(' ');
        return this._ok(up + '\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\n' + `${this.fs.currentUser.padEnd(8)} pts/0    192.168.1.10     ${login[2].slice(0, 5)}    0.00s  0.02s  0.00s w`);
    }

    last(args) {
        const b = this._stamp(this.svBoot).split(' ');
        const fmtD = (d) => { const p = this._stamp(d).split(' '); const dt = p[1].split('-'); return `${p[0]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+dt[1] - 1]} ${String(+dt[2]).padStart(2)} ${p[2].slice(0, 5)}`; };
        const login = new Date(this.svBoot.getTime() + 600000);
        const earlier = [
            ['reboot', 'system boot', '5.14.0-362.8.1.e', new Date(this.svBoot.getTime() - 3 * 86400000), 'still running'.replace('still running', '- ' + fmtD(this.svBoot).slice(-5) + '  (3+00:00)')],
        ];
        const rows = [];
        const reboot = ['reboot', 'system boot', '5.14.0-362.8.1.e', fmtD(this.svBoot), 'still running'];
        const log = [this.fs.currentUser, 'pts/0', '192.168.1.10', fmtD(login), 'still logged in'];
        const prev = ['reboot', 'system boot', '5.14.0-284.11.1.e', fmtD(new Date(this.svBoot.getTime() - 4 * 86400000)), '- ' + fmtD(this.svBoot).slice(-5) + '  (4+00:00)'];
        const line = (r) => `${r[0].padEnd(8)} ${r[1].padEnd(12)} ${r[2].padEnd(17)} ${r[3]}   ${r[4]}`.replace(/\s+$/, '');
        const all = [log, reboot, prev];
        const want = args.filter(a => !a.startsWith('-'));
        const sel = want.length ? all.filter(r => want.includes(r[0])) : all;
        const n = args.findIndex(a => a === '-n');
        const limited = n >= 0 ? sel.slice(0, parseInt(args[n + 1], 10)) : sel;
        const first = fmtD(new Date(this.svBoot.getTime() - 4 * 86400000));
        return this._ok(limited.map(line).join('\n') + `\n\nwtmp begins ${first.slice(0, 3)} ${first.slice(4, 10)}`);
    }

    _ip(args, stdin) {
        const brief = args.some(a => a === '-br' || a === '-brief' || a === '-b');
        const rest = args.filter(a => !a.startsWith('-'));
        if (brief && (rest[0] === undefined || ['a', 'addr', 'address'].includes(rest[0]))) {
            return this._ok('lo               UNKNOWN        127.0.0.1/8 ::1/128\neth0             UP             192.168.1.100/24 fe80::5054:ff:fe12:3456/64');
        }
        if (brief && rest[0] === 'link') return this._ok('lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>\neth0             UP             52:54:00:12:34:56 <BROADCAST,MULTICAST,UP,LOWER_UP>');
        return this._origIp(args.filter(a => !['-br', '-brief', '-b'].includes(a)), stdin);
    }

    // ===== top (one snapshot, like top -b -n 1) =====

    top(args) {
        let batch = false, n = 1, user = null, pids = null, numRows = 25, delay = 3;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-b') batch = true;
            else if (a === '-n') n = parseInt(args[++i], 10) || 1;
            else if (a === '-u') user = args[++i];
            else if (a === '-p') pids = String(args[++i]).split(',').map(Number);
            else if (/^-bn\d+$/.test(a)) { batch = true; n = parseInt(a.slice(3), 10); }
            else if (a === '-d') delay = parseFloat(args[++i]) || 3;
            else if (a === '-w' || a === '-o' || a === '-s') i++;
            else if (/^-[a-zA-Z]+$/.test(a) || a === '-h' || a === '-v') { if (a.includes('b')) batch = true; }
        }
        if (!batch) {
            // on the terminal top is live: hand a snapshot generator to the pager overlay
            const c = typeof window !== 'undefined' && window.terminal && window.terminal.commands;
            const live = c && c._tryPage && c._tryPage({ kind: 'top', delay, refresh: (o) => this._topText({ user, pids, numRows: o.rows, sort: o.sort }) });
            if (live) return live;
        }
        const text = this._topText({ user, pids, numRows, sort: 'cpu' });
        if (batch) return this._ok(n > 1 ? Array(n).fill(text).join('\n\n') : text);
        return this._ok(text + '\n\n(top runs interactively on a real system; this is a single snapshot. Use top -b -n 1 in scripts.)');
    }

    // one screenful of top output; sort is cpu, mem, pid or time
    _topText({ user, pids, numRows, sort }) {
        let list = this.shared.processes.filter(p => !/^\[.*\]$/.test(p.command) || p.pid === 2);
        if (user) list = list.filter(p => p.user === user);
        if (pids) list = list.filter(p => pids.includes(p.pid));
        const timeKey = (p) => (p.pid % 10) * 100 + (p.pid % 100);
        const order = {
            cpu: (a, b) => (b.cpu - a.cpu) || (b.mem - a.mem) || (a.pid - b.pid),
            mem: (a, b) => (b.mem - a.mem) || (b.cpu - a.cpu) || (a.pid - b.pid),
            pid: (a, b) => a.pid - b.pid,
            time: (a, b) => (timeKey(b) - timeKey(a)) || (a.pid - b.pid),
        }[sort || 'cpu'];
        list = list.slice().sort(order);
        const total = this.shared.processes.length;
        const totalMem = 3751.8;
        const usedMem = 260 + totalMem * this.shared.processes.reduce((s, p) => s + p.mem, 0) / 100;
        const swapTotal = this.shared.storage ? this.shared.storage.stSwaps.reduce((s, w) => s + w.sizeMiB, 0) : 2048;
        const now = new Date();
        const lines = [
            `top - ${this._hms(now)} up  4:22,  1 user,  load average: 0.00, 0.01, 0.05`,
            `Tasks: ${String(total).padStart(3)} total,   1 running, ${String(total - 1).padStart(3)} sleeping,   0 stopped,   0 zombie`,
            `%Cpu(s):  0.3 us,  0.2 sy,  0.0 ni, 99.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st`,
            `MiB Mem : ${totalMem.toFixed(1).padStart(8)} total, ${(totalMem - usedMem - 337).toFixed(1).padStart(8)} free, ${usedMem.toFixed(1).padStart(8)} used, ${(337).toFixed(1).padStart(8)} buff/cache`,
            `MiB Swap: ${swapTotal.toFixed(1).padStart(8)} total, ${swapTotal.toFixed(1).padStart(8)} free, ${(0).toFixed(1).padStart(8)} used. ${(totalMem - usedMem).toFixed(1).padStart(8)} avail Mem `,
            '',
            '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND'
        ];
        for (const p of list.slice(0, numRows)) {
            const virt = Math.floor(20000 + p.pid * 13 + p.mem * 12000);
            const res = Math.floor(3000 + p.pid * 3 + p.mem * 9000);
            lines.push(`${String(p.pid).padStart(7)} ${p.user.slice(0, 8).padEnd(8)}  20  ${String(p.ni || 0).padStart(2)} ${String(virt).padStart(7)} ${String(res).padStart(6)} ${String(Math.floor(res / 3)).padStart(6)} ${(p.stat || 'S')[0]} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(5)} ${(' 0:0' + (p.pid % 10) + '.' + String(p.pid % 100).padStart(2, '0')).padStart(9)} ${p.comm}`);
        }
        return lines.join('\n');
    }

    // ===== pstree =====

    pstree(args) {
        let showPid = false;
        let user = null;
        let root = 1;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-p') showPid = true;
            else if (a === '-u') { /* uid transitions */ }
            else if (a === '-a') { /* arguments */ }
            else if (a === '-h' || a === '-n' || a === '-c' || a === '-A' || a === '-U') { /* tolerated */ }
            else if (/^-[pushanc]+$/.test(a)) { if (a.includes('p')) showPid = true; }
            else if (/^\d+$/.test(a)) root = parseInt(a, 10);
            else if (/^[a-z_][a-z0-9_-]*$/.test(a)) user = a;
            else if (a.startsWith('-')) return this._err(`pstree: invalid option -- '${a.replace(/^-+/, '')}'`, 1);
        }
        const P = this.shared.processes.filter(p => !/^\[.*\]$/.test(p.command));
        const byParent = new Map();
        for (const p of P) { if (!byParent.has(p.ppid)) byParent.set(p.ppid, []); byParent.get(p.ppid).push(p); }
        const label = (p) => (p.pid === 1 ? 'systemd' : p.comm) + (showPid ? `(${p.pid})` : '');
        const render = (p, prefixFirst, prefixRest) => {
            const kids = (byParent.get(p.pid) || []).slice().sort((a, b) => a.comm.localeCompare(b.comm) || a.pid - b.pid);
            let text = label(p);
            if (!kids.length) return [prefixFirst + text];
            // collapse identical leaf siblings when pids are hidden
            const groups = [];
            for (const k of kids) {
                const last = groups[groups.length - 1];
                const leaf = !(byParent.get(k.pid) || []).length;
                if (!showPid && last && leaf && last.leaf && last.p.comm === k.comm) last.n++;
                else groups.push({ p: k, n: 1, leaf });
            }
            const lines = [];
            const own = prefixFirst + text;
            if (groups.length === 1) {
                const g = groups[0];
                const sub = g.n > 1 ? [`${g.n}*[${label(g.p)}]`] : render(g.p, '', '');
                const joined = (g.n > 1 ? sub : render(g.p, '', prefixRest + ' '.repeat(text.length + 3)));
                joined[0] = own + '───' + joined[0];
                return joined;
            }
            groups.forEach((g, i) => {
                const first = i === 0 ? '─┬─' : (i === groups.length - 1 ? ' └─' : ' ├─');
                const pre = (i === 0 ? own : prefixRest + ' '.repeat(text.length)) ;
                const childPrefix = prefixRest + ' '.repeat(text.length) + (i === groups.length - 1 ? '   ' : ' │ ');
                const sub = g.n > 1 ? [`${g.n}*[${label(g.p)}]`] : render(g.p, '', childPrefix);
                sub[0] = pre + first + sub[0];
                lines.push(...sub);
            });
            return lines;
        };
        const start = P.find(p => p.pid === root);
        if (!start) return this._err(`pstree: no process found with PID ${root}`, 1);
        return this._ok(render(start, '', '').join('\n'));
    }

    // ===== rpm2cpio / cpio / dnf download / rpm -qp =====

    _pkgDb() {
        return {
            rsync: { ver: '3.2.5-2.el9', summary: 'A program for synchronizing files over a network', files: ['/usr/bin/rsync', '/usr/lib/systemd/system/rsyncd.service', '/usr/share/man/man1/rsync.1.gz', '/usr/share/man/man5/rsyncd.conf.5.gz', '/etc/rsyncd.conf'], conf: ['/etc/rsyncd.conf'], req: ['libacl.so.1()(64bit)', 'libc.so.6()(64bit)', 'systemd'] },
            tree: { ver: '1.8.0-10.el9', summary: 'File system tree viewer', files: ['/usr/bin/tree', '/usr/share/doc/tree/LICENSE', '/usr/share/man/man1/tree.1.gz'], conf: [], req: ['libc.so.6()(64bit)'] },
            wget: { ver: '1.21.1-7.el9', summary: 'A utility for retrieving files using the HTTP or FTP protocols', files: ['/etc/wgetrc', '/usr/bin/wget', '/usr/share/man/man1/wget.1.gz'], conf: ['/etc/wgetrc'], req: ['libc.so.6()(64bit)', 'libssl.so.3()(64bit)'] },
            httpd: { ver: '2.4.57-5.el9', summary: 'Apache HTTP Server', files: ['/etc/httpd/conf/httpd.conf', '/usr/sbin/httpd', '/usr/lib/systemd/system/httpd.service', '/var/www/html', '/usr/share/man/man8/httpd.8.gz'], conf: ['/etc/httpd/conf/httpd.conf'], req: ['/bin/sh', 'httpd-core = 2.4.57-5.el9', 'mod_http2'] },
            nginx: { ver: '1:1.20.1-14.el9', summary: 'A high performance web server and reverse proxy server', files: ['/etc/nginx/nginx.conf', '/usr/sbin/nginx', '/usr/lib/systemd/system/nginx.service', '/usr/share/nginx/html/index.html'], conf: ['/etc/nginx/nginx.conf'], req: ['/bin/sh', 'libc.so.6()(64bit)'] },
            'vim-enhanced': { ver: '2:8.2.2637-20.el9', summary: 'A version of the VIM editor which includes recent enhancements', files: ['/usr/bin/vim', '/usr/bin/vimdiff', '/usr/share/man/man1/vim.1.gz'], conf: [], req: ['vim-common = 2:8.2.2637-20.el9'] },
            tmux: { ver: '3.2a-4.el9', summary: 'A terminal multiplexer', files: ['/usr/bin/tmux', '/usr/share/man/man1/tmux.1.gz'], conf: [], req: ['libevent-2.1.so.7()(64bit)'] },
            htop: { ver: '3.2.1-2.el9', summary: 'Interactive process viewer', files: ['/usr/bin/htop', '/usr/share/man/man1/htop.1.gz'], conf: [], req: ['libncursesw.so.6()(64bit)'] },
            flatpak: { ver: '1.12.7-4.el9', summary: 'Application deployment framework for desktop apps', files: ['/usr/bin/flatpak', '/etc/flatpak/remotes.d', '/usr/share/man/man1/flatpak.1.gz'], conf: [], req: ['ostree-libs', 'bubblewrap'] },
            bash: { ver: '5.1.8-6.el9', summary: 'The GNU Bourne Again shell', files: ['/etc/skel/.bash_logout', '/etc/skel/.bash_profile', '/etc/skel/.bashrc', '/usr/bin/bash', '/usr/share/man/man1/bash.1.gz'], conf: ['/etc/skel/.bashrc'], req: ['filesystem >= 3'] }
        };
    }

    _dnf(args, stdin) {
        const rest = args.filter(a => !a.startsWith('-'));
        if (rest[0] === 'download') {
            const pkgs = rest.slice(1);
            if (!pkgs.length) return this._err('Error: Need a package name', 1);
            const destOpt = args.find(a => a.startsWith('--destdir='));
            const dIdx = args.indexOf('--destdir');
            const dest = destOpt ? destOpt.slice(10) : (dIdx >= 0 ? args[dIdx + 1] : this.fs.currentPath);
            const dnode = this.fs.getNode(dest);
            if (!dnode || dnode.type !== 'directory') return this._err(`Error: --destdir ${dest}: No such directory`, 1);
            const db = this._pkgDb();
            const out = ['Last metadata expiration check: 0:11:42 ago on ' + this._stamp(new Date()).replace(' UTC', '') + '.'];
            for (const p of pkgs) {
                const e = db[p] || (this.shared.availablePackages.includes(p) || this.shared.installedPackages.includes(p) ? { ver: '1.0-1.el9', summary: p, files: [`/usr/bin/${p}`, `/usr/share/man/man1/${p}.1.gz`], conf: [], req: ['libc.so.6()(64bit)'] } : null);
                if (!e) return this._err(`No package ${p} available.\nError: Unable to find a match: ${p}`, 1);
                const ver = e.ver.replace(/^\d+:/, '');
                const fname = `${p}-${ver}.x86_64.rpm`;
                dnode.children[fname] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 120000 + p.length * 9000, modified: new Date(), content: '\u0000RPM\u0000', rpm: { name: p, ver, summary: e.summary, files: e.files, conf: e.conf || [], req: e.req || [] } };
                out.push(`${fname}`.padEnd(40) + ' 1.1 MB/s | 118 kB     00:00');
            }
            return this._ok(out.join('\n'));
        }
        return this._origDnf(args, stdin);
    }

    _rpmNode(path) {
        const n = this.fs.getNode(path);
        if (!n) return { err: `error: open of ${path} failed: No such file or directory` };
        if (n.type !== 'file') return { err: `error: ${path}: not an rpm package (or package manifest): Is a directory` };
        if (!n.rpm) return { err: `error: ${path}: not an rpm package (or package manifest)` };
        return { node: n };
    }

    _rpm(args, stdin) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const files = args.filter(a => !a.startsWith('-'));
        const hasPkgFile = files.some(f => /\.rpm$/.test(f));
        const isQp = /^-q/.test(args[0] || '') && /p/.test((args[0] || '').slice(1)) || args.includes('-p');
        if (hasPkgFile && (isQp || /^-(K|V)/.test(args[0] || '') || args.includes('--checksig') || args.includes('--scripts'))) {
            const f = files.find(x => /\.rpm$/.test(x));
            const r = this._rpmNode(f);
            if (r.err) return this._err(r.err, 1);
            const m = r.node.rpm;
            const q = args[0].startsWith('-q') ? args[0] : '-q';
            const long = args.includes('--requires') || /R/.test(q);
            if (args.includes('--checksig') || /^-K/.test(args[0])) return this._ok(`${f}: digests signatures OK`);
            if (/^-V/.test(args[0])) return this._ok('');
            if (args.includes('--scripts')) return this._ok('postinstall scriptlet (using /bin/sh):\n/usr/bin/systemctl daemon-reload >/dev/null 2>&1 || :');
            if (long) return this._ok(m.req.join('\n'));
            const out = [];
            if (/l/.test(q)) out.push(m.files.join('\n'));
            if (/i/.test(q)) out.push(`Name        : ${m.name}\nVersion     : ${m.ver.split('-')[0]}\nRelease     : ${m.ver.split('-')[1] || '1.el9'}\nArchitecture: x86_64\nInstall Date: (not installed)\nGroup       : Unspecified\nSize        : ${r.node.size}\nLicense     : GPLv2+\nSignature   : RSA/SHA256, Tue Aug 15 09:12:03 2023, Key ID 199e2f91fd431d51\nSource RPM  : ${m.name}-${m.ver}.src.rpm\nBuild Date  : Tue Aug 15 09:11:12 2023\nPackager    : Red Hat, Inc. <http://bugzilla.redhat.com/bugzilla>\nVendor      : Red Hat, Inc.\nSummary     : ${m.summary}\nDescription :\n${m.summary}.`);
            if (!out.length) out.push(`${m.name}-${m.ver}.x86_64`);
            return this._ok(out.join('\n'));
        }
        return this._origRpm(args, stdin);
    }

    rpm2cpio(args, stdin = '') {
        const f = args.filter(a => !a.startsWith('-'))[0];
        if (!f) {
            if (stdin) return this._err('rpm2cpio: reading from stdin is not supported in the simulator', 1);
            return this._err('Usage: rpm2cpio {packagefile|-}', 1);
        }
        const node = this.fs.getNode(f);
        if (!node) return this._err(`error: ${f}: open failed: No such file or directory`, 1);
        if (!node.rpm) return this._err(`rpm2cpio: ${f}: not an rpm package (or package manifest)`, 1);
        const m = node.rpm;
        const payload = m.files.map(p => ({ path: '.' + p, dir: !/\.[a-z0-9]+(\.gz)?$/.test(p) && !/\/(bin|sbin)\//.test(p) && !/\/rsync$|\/tmux$|\/htop$/.test(p) && /\/(html|remotes\.d)$/.test(p) }));
        return this._ok('\u0001CPIO' + JSON.stringify({ name: m.name, files: payload }));
    }

    cpio(args, stdin = '') {
        const flags = args.filter(a => a.startsWith('-')).join('').replace(/-/g, '');
        if (!flags.match(/[ito]/)) return this._err('cpio: You must specify one of -oipt options.\nTry \'cpio --help\' or \'cpio --usage\' for more information.', 1);
        if (!stdin.startsWith('\u0001CPIO')) return this._err(flags.includes('i') || flags.includes('t') ? 'cpio: premature end of archive' : 'cpio: this simulator supports extracting/listing archives produced by rpm2cpio only', 2);
        let arch;
        try { arch = JSON.parse(stdin.slice(5)); } catch (e) { return this._err('cpio: invalid archive', 2); }
        const list = arch.files.map(f => f.path);
        if (flags.includes('t')) return { stdout: list.join('\n'), stderr: `${Math.ceil(list.length * 1.4)} blocks`, exitCode: 0 };
        if (!flags.includes('i')) return this._err('cpio: unsupported mode', 1);
        const verbose = flags.includes('v');
        const mkdirs = flags.includes('d');
        const errs = [];
        for (const f of arch.files) {
            const rel = f.path.replace(/^\.\//, '');
            const parts = rel.split('/').filter(Boolean);
            let cur = this.fs.getNode(this.fs.currentPath);
            for (let i = 0; i < parts.length; i++) {
                const last = i === parts.length - 1;
                if (!cur.children[parts[i]]) {
                    if (!last && !mkdirs) { errs.push(`cpio: ${f.path}: Cannot open: No such file or directory`); cur = null; break; }
                    cur.children[parts[i]] = last && !f.dir
                        ? { type: 'file', permissions: /\/s?bin\//.test(rel) ? '0755' : '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 1024 * (3 + parts.length), modified: new Date(), content: `(contents of ${f.path.slice(1)} from ${arch.name})\n` }
                        : { type: 'directory', permissions: '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} };
                }
                cur = cur.children[parts[i]];
            }
        }
        const out = verbose ? list.join('\n') : '';
        return { stdout: out, stderr: errs.concat([`${Math.ceil(list.length * 1.4)} blocks`]).join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    // ===== flatpak =====

    _fp() {
        if (!this.fpState) this.fpState = { remotes: [], apps: [], runtimes: [] };
        return this.fpState;
    }

    _fpCatalog() {
        return {
            'org.gnome.Calculator': { name: 'Calculator', summary: 'Perform arithmetic, scientific or financial calculations', version: '44.0', size: '12.8 MB', runtime: 'org.gnome.Platform/x86_64/44', branch: 'stable' },
            'org.mozilla.firefox': { name: 'Firefox', summary: 'Fast, Private & Safe Web Browser', version: '118.0.1', size: '78.2 MB', runtime: 'org.freedesktop.Platform/x86_64/22.08', branch: 'stable' },
            'org.videolan.VLC': { name: 'VLC', summary: 'VLC media player, the open-source multimedia player', version: '3.0.18', size: '38.4 MB', runtime: 'org.kde.Platform/x86_64/5.15-22.08', branch: 'stable' },
            'org.gimp.GIMP': { name: 'GNU Image Manipulation Program', summary: 'Create images and edit photographs', version: '2.10.34', size: '51.7 MB', runtime: 'org.gnome.Platform/x86_64/44', branch: 'stable' },
            'org.libreoffice.LibreOffice': { name: 'LibreOffice', summary: 'The LibreOffice productivity suite', version: '7.5.7.1', size: '316.2 MB', runtime: 'org.freedesktop.Platform/x86_64/22.08', branch: 'stable' },
            'org.gnome.Calendar': { name: 'Calendar', summary: 'Calendar management', version: '44.1', size: '9.1 MB', runtime: 'org.gnome.Platform/x86_64/44', branch: 'stable' }
        };
    }

    flatpak(args, stdin = '') {
        if (!this.shared.installedPackages.includes('flatpak')) return this._err('flatpak: command not found', 127);
        const st = this._fp();
        const opts = args.filter(a => a.startsWith('-'));
        const pos = args.filter(a => !a.startsWith('-'));
        const verb = pos[0];
        const yes = opts.includes('-y') || opts.includes('--assumeyes') || opts.includes('--noninteractive');
        if (opts.includes('--version') && !verb) return this._ok('Flatpak 1.12.7');
        if (!verb) return this._err('Usage:\n  flatpak [OPTION…] COMMAND\n\nBuiltin Commands:\n Manage installed applications and runtimes\n  install    Install an application or runtime\n  update     Update an installed application or runtime\n  uninstall  Uninstall an installed application or runtime\n  list       List installed applications and/or runtimes\n\n Finding applications and runtimes\n  search     Search for remote apps/runtimes\n\n Manage remote repositories\n  remotes    List all configured remote repositories\n  remote-add Add a new remote repository (by URL)', 1);
        const needRoot = () => !this._root() && !opts.includes('--user');
        switch (verb) {
            case 'remotes': {
                if (!st.remotes.length) return this._ok('');
                if (opts.includes('--show-details') || opts.includes('-d')) return this._ok(['Name    Title   URL   Collection ID   Priority Options'.replace(/ {3,}/g, '  '), ...st.remotes.map(r => `${r.name}  ${r.name}  ${r.url}  -  1  system`)].join('\n'));
                return this._ok(['Name    Options', ...st.remotes.map(r => `${r.name.padEnd(8)}system`)].join('\n'));
            }
            case 'remote-add': {
                const [name, url] = pos.slice(1);
                if (!name || !url) return this._err('error: NAME and LOCATION must be specified', 1);
                if (needRoot()) return this._err('error: Flatpak system operation ModifyRepo not allowed for user', 1);
                if (st.remotes.some(r => r.name === name)) {
                    if (opts.includes('--if-not-exists')) return this._ok('');
                    return this._err(`error: Remote "${name}" already exists`, 1);
                }
                if (!/^(https?:\/\/|file:\/\/|\/)/.test(url)) return this._err(`error: Can't load uri ${url}: Unable to find remote location`, 1);
                if (/^https?:\/\//.test(url) && !/flathub\.org|flatpak|redhat\.com|example/.test(url)) return this._err(`error: Can't load uri ${url}: Server returned status 404: Not Found`, 1);
                st.remotes.push({ name, url: url.replace(/\.flatpakrepo$/, '').replace(/flathub\.org\/repo\/flathub/, 'dl.flathub.org/repo/') });
                return this._ok('');
            }
            case 'remote-delete': case 'remote-remove': {
                const name = pos[1];
                if (!name) return this._err('error: NAME must be specified', 1);
                const i = st.remotes.findIndex(r => r.name === name);
                if (i < 0) return this._err(`error: Remote "${name}" not found`, 1);
                st.remotes.splice(i, 1);
                st.apps = st.apps.filter(a => a.remote !== name);
                return this._ok('');
            }
            case 'search': {
                const term = (pos[1] || '').toLowerCase();
                if (!term) return this._err('error: TEXT must be specified', 1);
                if (!st.remotes.length) return this._err('error: No remote refs found for ‘' + pos[1] + '’', 1);
                const cat = this._fpCatalog();
                const hits = Object.entries(cat).filter(([id, a]) => id.toLowerCase().includes(term) || a.name.toLowerCase().includes(term) || a.summary.toLowerCase().includes(term));
                if (!hits.length) return this._err(`No matches found`, 1);
                return this._ok(['Name\tDescription\tApplication ID\tVersion\tBranch\tRemotes', ...hits.map(([id, a]) => `${a.name}\t${a.summary}\t${id}\t${a.version}\t${a.branch}\t${st.remotes[0].name}`)].join('\n'));
            }
            case 'remote-ls': {
                const remote = pos[1] || (st.remotes[0] && st.remotes[0].name);
                if (!remote || !st.remotes.some(r => r.name === remote)) return this._err(`error: Remote "${remote || ''}" not found`, 1);
                if (opts.includes('--updates')) return this._ok('');
                const cat = this._fpCatalog();
                const rows = Object.entries(cat).map(([id, a]) => `${a.name}\t${id}\t${a.version}\t${a.branch}`);
                return this._ok(['Name\tApplication ID\tVersion\tBranch', ...rows].join('\n'));
            }
            case 'remote-info': {
                const [remote, ref] = pos.slice(1);
                const a = this._fpCatalog()[ref];
                if (!st.remotes.some(r => r.name === remote)) return this._err(`error: Remote "${remote}" not found`, 1);
                if (!a) return this._err(`error: Nothing matches ${ref} in remote ${remote}`, 1);
                return this._ok(`${a.name} - ${a.summary}\n\n          ID: ${ref}\n         Ref: app/${ref}/x86_64/${a.branch}\n        Arch: x86_64\n      Branch: ${a.branch}\n     Version: ${a.version}\n     License: GPL-3.0+\n  Collection: org.flathub.Stable\nDownload: ${a.size}\n   Installed: unknown\n     Runtime: ${a.runtime}`);
            }
            case 'install': {
                let [remote, ref] = pos.slice(1);
                if (ref === undefined) { ref = remote; remote = st.remotes[0] && st.remotes[0].name; }
                if (!ref) return this._err('error: At least one REF must be specified', 1);
                if (!st.remotes.length) return this._err(`error: No remote refs found for ‘${ref}’`, 1);
                if (!st.remotes.some(r => r.name === remote)) return this._err(`error: Remote "${remote}" not found`, 1);
                if (needRoot()) return this._err('error: Flatpak system operation Deploy not allowed for user', 1);
                const cat = this._fpCatalog();
                const id = cat[ref] ? ref : Object.keys(cat).find(k => cat[k].name.toLowerCase() === ref.toLowerCase());
                if (!id) return this._err(`error: Nothing matches ${ref} in remote ${remote}`, 1);
                if (st.apps.some(a => a.id === id)) return this._err(`error: ${id} already installed... use flatpak update`.replace('... use flatpak update', ''), 1);
                const a = cat[id];
                const rt = a.runtime;
                const newRt = !st.runtimes.includes(rt);
                const rows = [];
                let n = 1;
                const total = newRt ? 3 : 1;
                const out = [`Looking for matches…`, `Required runtime for ${id}/x86_64/${a.branch} (runtime/${rt}) found in remote ${remote}`];
                if (!yes) out.push(`Do you want to install it? [Y/n]: (assuming yes in this terminal)`);
                out.push('', `${'ID'.padEnd(43)} Branch   Op Remote  Download`);
                if (newRt) { out.push(` 1. [✓] ${rt.split('/')[0].padEnd(35)} ${rt.split('/')[2].padEnd(8)} i  ${remote.padEnd(7)} < 312.4 MB`); out.push(` 2. [✓] ${rt.split('/')[0]}.Locale`.padEnd(48) + ` ${rt.split('/')[2].padEnd(8)} i  ${remote.padEnd(7)} <  18.6 kB (partial)`); n = 3; }
                out.push(`${String(n).padStart(2)}. [✓] ${id.padEnd(39)} ${a.branch.padEnd(8)} i  ${remote.padEnd(7)} < ${a.size}`);
                out.push('', 'Installation complete.');
                if (newRt) st.runtimes.push(rt);
                st.apps.push({ id, name: a.name, version: a.version, branch: a.branch, remote, runtime: rt, size: a.size });
                return this._ok(out.join('\n'));
            }
            case 'list': {
                const appOnly = opts.includes('--app');
                const rtOnly = opts.includes('--runtime');
                const rows = [];
                if (!rtOnly) st.apps.forEach(a => rows.push(`${a.name}\t${a.id}\t${a.version}\t${a.branch}\t${a.remote}\tsystem`));
                if (!appOnly) st.runtimes.forEach(r => rows.push(`${r.split('/')[0]}\t${r.split('/')[0]}\t\t${r.split('/')[2]}\t${st.remotes[0] ? st.remotes[0].name : ''}\tsystem`));
                if (!rows.length) return this._ok('');
                return this._ok(['Name\tApplication ID\tVersion\tBranch\tInstallation', ...rows].join('\n'));
            }
            case 'info': {
                const ref = pos[1];
                const a = st.apps.find(x => x.id === ref);
                if (!a) return this._err(`error: ${ref} not installed`, 1);
                return this._ok(`${a.name}\n\n          ID: ${a.id}\n         Ref: app/${a.id}/x86_64/${a.branch}\n        Arch: x86_64\n      Branch: ${a.branch}\n     Version: ${a.version}\n  Collection: org.flathub.Stable\nInstallation: system\n   Installed: ${a.size}\n     Runtime: ${a.runtime}\n         Sdk: ${a.runtime.replace('Platform', 'Sdk')}`);
            }
            case 'run': {
                const ref = pos[1];
                if (!st.apps.some(x => x.id === ref)) return this._err(`error: app/${ref}/*unspecified*/*unspecified* not installed`, 1);
                return this._ok(`(${ref} is a graphical application; it cannot display in this terminal)`);
            }
            case 'uninstall': {
                if (opts.includes('--unused')) {
                    const used = new Set(st.apps.map(a => a.runtime));
                    const unused = st.runtimes.filter(r => !used.has(r));
                    if (!unused.length) return this._ok('Nothing unused to uninstall');
                    st.runtimes = st.runtimes.filter(r => used.has(r));
                    return this._ok(['', 'ID                                         Branch   Op', ...unused.map((r, i) => ` ${i + 1}. [✓] ${r.split('/')[0].padEnd(39)} ${r.split('/')[2].padEnd(8)} r`), '', 'Uninstall complete.'].join('\n'));
                }
                const ref = pos[1];
                if (!ref) return this._err('error: Must specify at least one REF, --unused, --all or --delete-data', 1);
                const i = st.apps.findIndex(x => x.id === ref);
                if (i < 0) return this._err(`error: ${ref} not installed`, 1);
                const [a] = st.apps.splice(i, 1);
                return this._ok(['', 'ID                                         Branch   Op', ` 1. [✓] ${a.id.padEnd(39)} ${a.branch.padEnd(8)} r`, '', 'Uninstall complete.'].join('\n'));
            }
            case 'update': {
                if (!st.remotes.length) return this._ok('Looking for updates…\n\nNothing to do.');
                return this._ok('Looking for updates…\n\nNothing to do.');
            }
            default:
                return this._err(`error: Unknown command '${verb}'`, 1);
        }
    }
}

if (typeof window !== 'undefined') {
    window.ServiceCommands = ServiceCommands;
}
