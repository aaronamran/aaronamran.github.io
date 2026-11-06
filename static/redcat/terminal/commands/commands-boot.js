// Boot engine: reboot, poweroff, halt, shutdown, init/telinit, systemctl reboot, emergency mode, last
// Part of Red Cat RHCSA Terminal Simulator
//
// A reboot keeps what is on disk (files, packages, enabled units, NetworkManager profiles, fstab, sysctl.d,
// the permanent firewall) and rebuilds everything that only lives in memory from it: processes, mounts,
// runtime firewall rules, setenforce, sysctl -w, ip addr add, the system clock (back to the RTC), loaded modules.
// A failing fstab line drops the machine into emergency mode, as on a real system.

class BootEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.boot = this;
        const svc = sharedState.svc;
        const b = svc ? svc.svBoot : new Date();
        this.kernel = '5.14.0-362.8.1.el9_3.x86_64';
        this.history = [
            { start: new Date(b.getTime() - 4 * 86400000), end: b, kernel: '5.14.0-284.11.1.el9_2.x86_64' },
            { start: b, end: null, kernel: this.kernel }
        ];
        this.emergency = null;     // { failed: [{ tgt, msg }] } while the machine sits in emergency mode
        this.poweredOff = false;
        this.scheduled = null;
        // the pending shutdown timer is not machine state, so it stays out of saved games
        Object.defineProperty(this, 'timer', { value: null, writable: true, enumerable: false });
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    get parent() { return this.shared.parent; }
    _bt_node(p) { return this.fs.getNode(p); }
    _bt_text(p) { const n = this._bt_node(p); return n && n.type === 'file' ? n.content || '' : null; }
    _bt_term() { return typeof window !== 'undefined' ? window.terminal : null; }
    _bt_grub() { const x = this.shared.extra; return x && x._grubState ? x._grubState() : null; }

    _bt_write(path, content) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        cur.children[name] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    _bt_asRoot(fn) {
        const f = this.fs, keep = { u: f.currentUser, uid: f.currentUid, gid: f.currentGid };
        f.currentUser = 'root'; f.currentUid = 0; f.currentGid = 0;
        try { return fn(); } finally { f.currentUser = keep.u; f.currentUid = keep.uid; f.currentGid = keep.gid; }
    }

    // one boot step must never take the whole machine down with it
    _bt_try(name, fn) {
        try { return fn(); } catch (e) { if (typeof console !== 'undefined') console.warn(`Red Cat boot step "${name}" failed:`, e); return undefined; }
    }

    // ===== shutdown commands =====
    _bt_request(kind, info) {
        const t = this._bt_term();
        if (t && t.queueBoot) { t.queueBoot(Object.assign({ kind }, info)); return this._ok(''); }
        // no terminal around (tests, scripts): do the work without the show
        if (kind === 'reboot') this.bootMachine({});
        else this.poweredOff = true;
        return this._ok('');
    }

    _bt_needRoot(what) {
        if (this._isRoot()) return null;
        if (what === 'reboot') return this._err('Failed to reboot system via logind: Interactive authentication required.\nFailed to open initctl fifo: Permission denied\nFailed to talk to init daemon.', 1);
        return this._err(`Failed to ${what === 'halt' ? 'halt system' : 'power off system'} via logind: Interactive authentication required.${what === 'halt' ? '' : '\nFailed to open initctl fifo: Permission denied\nFailed to talk to init daemon.'}`, 1);
    }

    reboot(args = []) {
        if (args.includes('--help')) return this._ok('reboot [OPTIONS...] [ARG]\n\nReboot the system.\n\n     --help      Show this help\n     --halt      Halt the machine\n  -p --poweroff  Switch off the machine\n     --reboot    Reboot the machine\n  -f --force     Force immediate halt/power-off/reboot\n  -w --wtmp-only Don\'t halt/power-off/reboot, just write wtmp record\n  -d --no-wtmp   Don\'t write wtmp record\n     --no-wall   Don\'t send wall message before halt/power-off/reboot');
        const e = this._bt_needRoot('reboot');
        if (e) return e;
        if (args.includes('-w') || args.includes('--wtmp-only')) return this._ok('');
        if (args.includes('--halt')) return this._bt_request('halt', { quick: args.includes('-f') });
        if (args.includes('-p') || args.includes('--poweroff')) return this._bt_request('poweroff', { quick: args.includes('-f') });
        return this._bt_request('reboot', { quick: args.includes('-f') || args.includes('--force') });
    }

    poweroff(args = []) {
        const e = this._bt_needRoot('poweroff');
        if (e) return e;
        if (args.includes('--reboot')) return this._bt_request('reboot', {});
        return this._bt_request('poweroff', { quick: args.includes('-f') });
    }

    halt(args = []) {
        const e = this._bt_needRoot('halt');
        if (e) return e;
        if (args.includes('-p') || args.includes('--poweroff')) return this._bt_request('poweroff', {});
        if (args.includes('--reboot')) return this._bt_request('reboot', {});
        return this._bt_request('halt', {});
    }

    init(args = []) {
        const lvl = args[0];
        if (lvl === undefined) return this._err('Usage: init 0123456SsQqAaBbCcUu\n       telinit [OPTIONS...] {COMMAND}', 1);
        const e = this._bt_needRoot('reboot');
        if (e) return this._err('Failed to talk to init daemon.', 1);
        if (lvl === '6') return this._bt_request('reboot', {});
        if (lvl === '0') return this._bt_request('poweroff', {});
        if (['1', 's', 'S'].includes(lvl)) return this._ok('');
        if (['2', '3', '4', '5'].includes(lvl)) return this._ok('');
        if (['q', 'Q'].includes(lvl)) return this._ok('');
        return this._err('Usage: init 0123456SsQqAaBbCcUu\n       telinit [OPTIONS...] {COMMAND}', 1);
    }

    telinit(args = []) { return this.init(args); }

    shutdown(args = []) {
        const flags = args.filter(a => a.startsWith('-'));
        const rest = args.filter(a => !a.startsWith('-'));
        if (flags.includes('--help')) return this._ok('shutdown [OPTIONS...] [TIME] [WALL...]\n\nShut down the system.\n\n     --help      Show this help\n  -H --halt      Halt the machine\n  -P --poweroff  Power-off the machine\n  -r --reboot    Reboot the machine\n  -h             Equivalent to --poweroff, overridden by --halt\n  -k             Don\'t halt/power-off/reboot, just send warnings\n     --no-wall   Don\'t send wall message before halt/power-off/reboot\n  -c             Cancel a pending shutdown');
        if (!this._isRoot()) return this._err('Failed to set wall message, ignoring: Interactive authentication required.\nFailed to call ScheduleShutdown in logind, proceeding with immediate shutdown: Interactive authentication required.\nFailed to talk to init daemon.', 1);
        if (flags.includes('-c')) {
            if (!this.scheduled) return this._ok('');
            clearTimeout(this.timer); this.timer = null; this.scheduled = null;
            return this._ok('');
        }
        const known = ['-r', '--reboot', '-h', '-H', '--halt', '-P', '--poweroff', '-k', '--no-wall', '-t', '-a', '-F', '-f'];
        for (const f of flags) if (!known.includes(f) && !/^-[rhHPkcatFf]+$/.test(f)) return this._err(`shutdown: unrecognized option '${f}'`, 1);
        const kind = flags.some(f => f === '-r' || f === '--reboot' || /^-[a-z]*r[a-z]*$/.test(f)) ? 'reboot' : (flags.some(f => f === '-H' || f === '--halt') ? 'halt' : 'poweroff');
        const when = rest[0] || '+1';
        if (!/^(now|\+\d+|\d{1,2}:\d{2})$/.test(when)) return this._err(`Bad time spec: ${when}`, 1);
        if (flags.includes('-k')) return this._ok(`Shutdown scheduled for ${new Date(Date.now() + 60000).toString().slice(0, 24)}, use 'shutdown -c' to cancel.`);
        let mins = 0;
        if (when === 'now') mins = 0;
        else if (when.startsWith('+')) mins = parseInt(when.slice(1), 10);
        else {
            const [h, m] = when.split(':').map(Number);
            const now = new Date(), at = new Date(now); at.setHours(h, m, 0, 0);
            if (at <= now) at.setDate(at.getDate() + 1);
            mins = Math.round((at - now) / 60000);
        }
        if (mins <= 0) return this._bt_request(kind, { wall: rest.slice(1).join(' ') });
        if (this.timer) clearTimeout(this.timer);
        const at = new Date(Date.now() + mins * 60000);
        this.scheduled = { kind, at };
        this.timer = setTimeout(() => {
            this.timer = null; this.scheduled = null;
            const t = this._bt_term();
            if (t && t.queueBoot) { t.queueBoot({ kind }); t.runQueuedBoot(); } else this._bt_request(kind, {});
        }, mins * 60000);
        return this._ok(`Shutdown scheduled for ${at.toString().slice(0, 24)}, use 'shutdown -c' to cancel.`);
    }

    // systemctl reboot | poweroff | halt | kexec | default (leaves emergency mode)
    installHooks(parent) {
        const prev = parent.systemctl;
        parent.systemctl = (args, stdin) => {
            const verb = (args || []).find(a => !a.startsWith('-'));
            if (verb === 'reboot' || verb === 'kexec') { const e = this._bt_needRoot('reboot'); return e || this._bt_request('reboot', {}); }
            if (verb === 'poweroff') { const e = this._bt_needRoot('poweroff'); return e || this._bt_request('poweroff', {}); }
            if (verb === 'halt') { const e = this._bt_needRoot('halt'); return e || this._bt_request('halt', {}); }
            if ((verb === 'default' || verb === 'isolate' && /multi-user|graphical|default/.test((args || []).join(' '))) && this.emergency && this._isRoot()) {
                const t = this._bt_term();
                if (t && t.leaveEmergency) { t.leaveEmergency(); return this._ok(''); }
            }
            return prev(args, stdin);
        };
        // exit / Ctrl-D in the emergency shell continues the boot
        const prevExit = parent.sessionExit;
        parent.sessionExit = (code) => {
            if (this.emergency) {
                const t = this._bt_term();
                if (t && t.leaveEmergency) { t.leaveEmergency(); return 'quiet'; }
            }
            return prevExit ? prevExit(code) : false;
        };
    }

    // ===== read-only filesystems (emergency mode mounts / read-only until mount -o remount,rw /) =====
    _roPath(path) {
        const st = this.shared.storage;
        if (!st || !st.stMounts.some(m => /(^|,)ro(,|$)/.test(m.opts) && m.type !== 'iso9660')) return false;
        const full = this.fs.resolvePath(path);
        let best = null;
        for (const m of st.stMounts) {
            if (m.tgt === '/' || full === m.tgt || full.startsWith(m.tgt + '/')) if (!best || m.tgt.length >= best.tgt.length) best = m;
        }
        return !!best && /(^|,)ro(,|$)/.test(best.opts) && best.type !== 'iso9660';
    }

    // returns the error text when a command would change something on a read-only filesystem
    _roGuard(name, args) {
        const st = this.shared.storage;
        if (!st || !st.stMounts.some(m => /(^|,)ro(,|$)/.test(m.opts) && m.type !== 'iso9660')) return null;
        const paths = (args || []).filter(a => typeof a === 'string' && !a.startsWith('-'));
        const msg = {
            touch: (p) => `touch: cannot touch '${p}': Read-only file system`,
            mkdir: (p) => `mkdir: cannot create directory '${p}': Read-only file system`,
            rm: (p) => `rm: cannot remove '${p}': Read-only file system`,
            rmdir: (p) => `rmdir: failed to remove '${p}': Read-only file system`,
            cp: (p) => `cp: cannot create regular file '${p}': Read-only file system`,
            mv: (p) => `mv: cannot move to '${p}': Read-only file system`,
            ln: (p) => `ln: failed to create symbolic link '${p}': Read-only file system`,
            chmod: (p) => `chmod: changing permissions of '${p}': Read-only file system`,
            chown: (p) => `chown: changing ownership of '${p}': Read-only file system`,
            chgrp: (p) => `chgrp: changing group of '${p}': Read-only file system`,
            tee: (p) => `tee: ${p}: Read-only file system`,
            install: (p) => `install: cannot create regular file '${p}': Read-only file system`,
            truncate: (p) => `truncate: cannot open '${p}' for writing: Read-only file system`
        };
        if (name === 'sed' && (args || []).some(a => /^-[a-zA-Z]*i/.test(a) || a.startsWith('--in-place'))) {
            const f = paths[paths.length - 1];
            return f && this._roPath(f) ? `sed: couldn't open temporary file ${this.fs.getParentPath(this.fs.resolvePath(f)).replace(/\/$/, '')}/sedXXXXXX: Read-only file system` : null;
        }
        if (['useradd', 'groupadd', 'usermod', 'userdel', 'groupmod', 'groupdel', 'chage'].includes(name) && this._roPath('/etc/passwd')) return `${name}: cannot lock /etc/passwd; try again later.`;
        if (name === 'passwd' && this._roPath('/etc/shadow')) return 'passwd: Authentication token manipulation error';
        const f = msg[name];
        if (!f) return null;
        let targets = paths;
        if (['chmod', 'chown', 'chgrp'].includes(name)) targets = paths.slice(1);
        else if (['cp', 'ln', 'install'].includes(name)) targets = paths.slice(-1);
        for (const p of targets) if (this._roPath(p)) return f(p);
        return null;
    }

    // ===== last =====
    _bt_stampOf(d) { const svc = this.shared.svc; return svc._stamp(d); }

    last(args = []) {
        const svc = this.shared.svc;
        const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const fmtD = (d) => { const p = svc._stamp(d).split(' '); const dt = p[1].split('-'); return `${p[0]} ${mon[+dt[1] - 1]} ${String(+dt[2]).padStart(2)} ${p[2].slice(0, 5)}`; };
        const hm = (d) => svc._stamp(d).split(' ')[2].slice(0, 5);
        const dur = (a, b) => {
            const mins = Math.max(0, Math.floor((b - a) / 60000)), d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
            return `(${d}+${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')})`;
        };
        const line = (r) => `${r[0].padEnd(8)} ${r[1].padEnd(12)} ${r[2].padEnd(17)} ${r[3]}   ${r[4]}`.replace(/\s+$/, '');
        const rows = [];
        const cur = this.history[this.history.length - 1];
        const login = new Date(cur.start.getTime() + 600000);
        rows.push([this.fs.currentUser, 'pts/0', '192.168.1.10', fmtD(login), 'still logged in']);
        for (let i = this.history.length - 1; i >= 0; i--) {
            const h = this.history[i];
            const k = h.kernel.length > 17 ? h.kernel.slice(0, 17) : h.kernel;
            const end = h.end ? `- ${hm(h.end)}  ${dur(h.start, h.end)}` : 'still running';
            rows.push(['reboot', 'system boot', k, fmtD(h.start), end]);
            if (args.includes('-x') && h.end) rows.push(['shutdown', 'system down', k, fmtD(h.end), `- ${hm(h.end)}  ${dur(h.end, h.end)}`]);
        }
        const want = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a));
        const sel = want.length ? rows.filter(r => want.includes(r[0])) : rows;
        const n = args.findIndex(a => a === '-n');
        const limited = n >= 0 ? sel.slice(0, parseInt(args[n + 1], 10)) : sel;
        const first = fmtD(this.history[0].start);
        return this._ok(limited.map(line).join('\n') + `\n\nwtmp begins ${first.slice(0, 3)} ${first.slice(4, 10)}`);
    }

    // ===== the boot itself =====
    // Phase 1 is what the initramfs and early boot do (clock, kernel, hostname, sysctl, local mounts); a failed
    // mount stops here in emergency mode. Phase 2 starts the system proper.
    bootMachine(opts = {}) {
        const log = [];
        const ok = (s) => log.push({ t: 'ok', s });
        const fail = (s) => log.push({ t: 'fail', s });
        const text = (s) => log.push({ t: 'text', s });
        this.poweredOff = false;
        this.emergency = null;
        const failed = this._bt_phase1(log, opts, { ok, fail, text });
        if (failed.length) {
            this.emergency = { failed };
            this._bt_baseline();
            this._bt_try('root-ro', () => this._bt_rootMode(true));
            return { log, emergency: this.emergency };
        }
        this._bt_phase2(log, opts, { ok, fail, text });
        return { log, emergency: null };
    }

    // after the emergency shell: try again from the mounts onwards
    resumeBoot() {
        const log = [];
        const h = { ok: (s) => log.push({ t: 'ok', s }), fail: (s) => log.push({ t: 'fail', s }), text: (s) => log.push({ t: 'text', s }) };
        this.emergency = null;
        this._bt_try('root-rw', () => this._bt_rootMode(false));
        const failed = this._bt_asRoot(() => this._bt_mounts(log, h));
        if (failed.length) {
            this.emergency = { failed };
            this._bt_try('root-ro', () => this._bt_rootMode(true));
            return { log, emergency: this.emergency };
        }
        this._bt_phase2(log, { resume: true }, h);
        return { log, emergency: null };
    }

    _bt_phase1(log, opts, h) {
        const svc = this.shared.svc, tm = this.shared.timeCmds, cmds = this.parent;
        const text = h.text;
        const when = new Date();
        // history: close the old boot, open a new one
        const last = this.history[this.history.length - 1];
        if (last && !last.end) last.end = when;
        // the clock comes back from the hardware clock; with chrony enabled it is stepped to the right time
        this._bt_try('clock', () => {
            if (!tm) return;
            const chrony = this.shared.services.chronyd;
            tm.tm.offsetMs = tm.tm.rtcOffsetMs;
            if (chrony && chrony.enabled) { tm.tm.offsetMs = 0; tm.tm.rtcOffsetMs = 0; }
        });
        if (svc) svc.svBoot = when;
        // kernel: one-shot entry from grub2-reboot first, then the default
        const g = this._bt_grub();
        let entry = 0;
        if (g) {
            entry = g.next !== null && g.next !== undefined ? g.next : g.def;
            g.next = null;
        }
        const path = g && g.kernels[entry] ? g.kernels[entry] : '/boot/vmlinuz-5.14.0-362.8.1.el9_3.x86_64';
        this.kernel = path.split('vmlinuz-')[1];
        cmds.kernelRelease = this.kernel;
        this.history.push({ start: when, end: null, kernel: this.kernel });
        if (this.history.length > 12) this.history.shift();
        text(`GRUB: booting 'Red Hat Enterprise Linux (${this.kernel}) 9.3 (Plow)'`);
        text(`[    0.000000] Linux version ${this.kernel} (mockbuild@x86-vm-08.build.eng.bos.redhat.com) (gcc (GCC) 11.4.1 20230605 (Red Hat 11.4.1-2))`);
        const args = g ? g.args : 'ro crashkernel=1G-4G:192M resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet';
        const cmdline = `BOOT_IMAGE=(hd0,msdos1)/vmlinuz-${this.kernel} root=/dev/mapper/rhel-root ${args}`;
        text(`[    0.000000] Command line: ${cmdline}`);
        this._bt_try('cmdline', () => this._bt_write('/proc/cmdline', cmdline + '\n'));

        this._bt_try('hostname', () => {
            const st = (this._bt_text('/etc/hostname') || '').split('\n')[0].trim();
            cmds.hostname = st || 'localhost.localdomain';
        });
        this._bt_try('root-rw', () => this._bt_rootMode(false));
        this._bt_try('sysctl', () => this._bt_asRoot(() => this._bt_sysctl()));
        this._bt_try('modules', () => this._bt_modules());
        this._bt_try('selinux-mode', () => {
            const m = /^SELINUX=(\w+)/m.exec(this._bt_text('/etc/selinux/config') || '');
            const mode = m ? m[1].toLowerCase() : 'enforcing';
            const engine = (this.parent._modules || []).find(x => x.constructor && x.constructor.name === 'SELinuxEngine');
            if (engine) engine.mode = mode;
            cmds.selinuxMode = mode;
        });
        return this._bt_asRoot(() => this._bt_mounts(log, h));
    }

    _bt_sysctl() {
        const tune = this.shared.tune;
        if (!tune) return;
        const fresh = tune._defaults();
        for (const [k, def] of Object.entries(fresh)) if (k !== 'kernel.hostname') tune._procWrite(k, def.v);
        if (this.kernel) tune._procWrite('kernel.osrelease', this.kernel);
        tune._loadSystem({ q: true });
        tune.expected = {};
    }

    _bt_modules() {
        const world = this._bt_term() && this._bt_term().world;
        const cmds = this.parent;
        const mods = cmds.kernelModules;
        if (!world || !mods) return;
        const p = world.pristine['cmds'] && world.pristine['cmds'].kernelModules;
        if (!p) return;
        world.merge(mods, world.decode(JSON.parse(p)));
        // /etc/modules-load.d/*.conf names modules to load at boot
        const dir = this._bt_node('/etc/modules-load.d');
        if (dir && dir.children) {
            for (const f of Object.keys(dir.children).sort()) {
                if (!f.endsWith('.conf')) continue;
                for (const line of (dir.children[f].content || '').split('\n')) {
                    const name = line.trim();
                    if (!name || name.startsWith('#') || name.startsWith(';')) continue;
                    if (!mods.some(m => m.name === name)) mods.push({ name, size: 16384, used: 0, usedBy: [] });
                }
            }
        }
    }

    // local filesystems from fstab; returns the entries that stopped the boot
    _bt_mounts(log, h) {
        const st = this.shared.storage;
        if (!st) return [];
        const keep = new Set(['/sys', '/proc', '/dev', '/sys/kernel/security', '/dev/shm', '/dev/pts', '/run', '/sys/fs/cgroup', '/sys/fs/selinux', '/', '/boot', '/run/user/0']);
        st.stMounts = st.stMounts.filter(m => keep.has(m.tgt));
        const failed = [];
        for (const r of st._fstab()) {
            if (r.bad) { h.text(`systemd-fstab-generator: Failed to parse /etc/fstab line ${r.line}, ignoring.`); continue; }
            const o = r.opts.split(',');
            if (r.type === 'swap' || r.tgt === 'none' || r.type === 'ignore') continue;
            if (o.includes('noauto')) continue;
            if (st.stMounts.some(m => m.tgt === st._normPath(r.tgt))) { continue; }
            const src = st._resolveSrc(r.src) || r.src;
            const res = st._mountOne(src, r.tgt, r.type, o, r.src);
            const remote = /^(nfs4?|cifs|smb3?)$/.test(r.type) || o.includes('_netdev');
            if (res.exitCode) {
                if (o.includes('nofail') || remote) { h.fail(`Failed to mount ${r.tgt}.`); continue; }
                failed.push({ tgt: r.tgt, src: r.src, msg: (res.stderr || '').split('\n')[0] });
                h.fail(`Failed to mount ${r.tgt}.`);
            } else h.ok(`Mounted ${r.tgt}.`);
        }
        // swap from fstab
        st.stSwaps = [];
        for (const r of st._fstab()) {
            if (r.bad || r.type !== 'swap') continue;
            const dev = st._resolveSrc(r.src) || r.src;
            const res = st._swapOn(dev);
            if (res.exitCode === 0) h.ok(`Activated swap ${dev}.`);
        }
        st._stSyncProc();
        if (failed.length) {
            h.text('[DEPEND] Dependency failed for Local File Systems.');
            h.text("[DEPEND] Dependency failed for Mark the need to relabel after reboot.");
        } else h.ok('Reached target Local File Systems.');
        return failed;
    }

    // the machine as it is in emergency mode: kernel threads and a login shell, no services
    _bt_rootMode(ro) {
        const st = this.shared.storage;
        const m = st && st.stMounts.find(x => x.tgt === '/');
        if (!m) return;
        const list = m.opts.split(',').filter(o => o !== 'ro' && o !== 'rw');
        m.opts = [ro ? 'ro' : 'rw'].concat(list).join(',');
        st._stSyncProc();
    }

    _bt_baseline() {
        const svc = this.shared.svc, S = this.shared.services;
        for (const n of Object.keys(S)) { S[n].active = false; S[n].failed = false; S[n].since = null; S[n].pids = []; }
        if (svc) svc._svBuildBase();
        const ej = this.shared.jobEngine;
        if (ej && ej.endSession) ej.endSession(true);
        this._bt_login();
    }

    _bt_login() {
        const sess = this.shared.session, f = this.fs, cmds = this.parent;
        if (sess) { sess.stack.length = 0; }
        f.currentUser = 'root'; f.currentUid = 0; f.currentGid = 0; f.currentPath = '/root';
        if (sess && sess._loginEnv) sess._loginEnv('root', true);
        cmds.lastExitCode = 0;
    }

    _bt_phase2(log, opts, h) {
        const svc = this.shared.svc, S = this.shared.services, cmds = this.parent;
        const root = (fn) => this._bt_asRoot(fn);
        // SELinux relabel requested with /.autorelabel
        this._bt_try('relabel', () => {
            const marker = this._bt_node('/.autorelabel');
            if (!marker) return;
            h.text('*** Warning -- SELinux targeted policy relabel is required.');
            h.text('*** Relabeling could take a very long time, depending on file');
            h.text('*** system size and speed of hard drives.');
            root(() => { try { cmds.restorecon(['-R', '/']); } catch (e) { /* best effort */ } });
            delete this.fs.fs['/'].children['.autorelabel'];
            h.text('Relabeling / /boot /dev/shm /run done');
            h.text('Rebooting system');
            this.history[this.history.length - 1].relabeled = true;
        });

        // containers do not survive the shutdown; units that run them start them again below
        this._bt_try('containers', () => this._bt_containers());

        // services: everything that is enabled comes up, everything else stays down
        this._bt_try('services', () => {
            if (!svc) return;
            for (const n of Object.keys(S)) { S[n].active = false; S[n].failed = false; S[n].since = null; S[n].pids = []; S[n].log = []; }
            svc.svNextPid = 1500;
            svc._svBuildBase();
            const units = this.shared.units;
            if (units) for (const n of Object.keys(units.state)) { units._removeProc(n); Object.assign(units.state[n], { active: 'inactive', sub: 'dead', since: null, pid: null, result: 'success' }); }
            const ej = this.shared.jobEngine;
            if (ej && ej.endSession) ej.endSession(true);
            this._bt_login();
            const names = Object.keys(S);
            // the built-in daemons first, started the way systemctl would (so port clashes, SELinux
            // denials and broken config files fail them), with the same pids as a first boot
            const origSpawn = svc._svSpawn.bind(svc);
            svc._svSpawn = (n, pid) => origSpawn(n, pid || svc.svFixed[n]);
            try {
                root(() => {
                    for (const n of names) {
                        const s = S[n];
                        if (!svc.svFixed[n] || !svc.svDefs[n] || !s.enabled || s.masked) continue;
                        const r = svc._svStart(n);
                        if (r && r.exitCode) h.fail(`Failed to start ${svc.svDefs[n].desc}.`);
                        else { s.since = svc.svBoot; h.ok(`Started ${svc.svDefs[n].desc}.`); }
                    }
                });
            } finally { svc._svSpawn = origSpawn; }
            root(() => {
                for (const n of names) {
                    const s = S[n];
                    if (svc.svFixed[n] || !s.enabled || s.masked) continue;
                    if (!svc.svDefs[n]) { s.active = true; s.since = svc.svBoot; continue; }
                    const r = cmds.systemctl(['start', n]);
                    if (r && r.exitCode) h.fail(`Failed to start ${svc.svDefs[n].desc}.`);
                    else h.ok(`Started ${svc.svDefs[n].desc}.`);
                }
                // units written by the user (services and timers) that are enabled
                if (units) {
                    const seen = new Set([...Object.keys(units.loaded), ...Object.keys(units.state)]);
                    const custom = [...seen].filter(n => !S[n] && units._isCustom && units._isCustom(n)).sort((a, b) => (/\.timer$/.test(a) ? 1 : 0) - (/\.timer$/.test(b) ? 1 : 0));
                    for (const n of custom) {
                        const u = units._loadDef(n);
                        if (!u || units._enabledState(n, u) !== 'enabled') continue;
                        const r = cmds.systemctl(['start', n]);
                        const desc = units._val(u, 'Unit', 'Description', n);
                        if (r && r.exitCode) h.fail(`Failed to start ${desc}.`); else h.ok(`Started ${desc}.`);
                    }
                }
            });
            svc._svSort();
        });

        this._bt_try('network', () => this._bt_network());
        this._bt_try('firewall', () => {
            const x = this.shared.extra;
            if (x && x.xfw && x.xfw.permanent) {
                x.xfw.runtime = JSON.parse(JSON.stringify(x.xfw.permanent));
                if (x.xfw.permDefault !== undefined) x.xfw.defaultZone = x.xfw.permDefault;
            }
        });
        this._bt_try('tuned', () => {
            const tune = this.shared.tune, t = S.tuned;
            if (!tune || !t || !t.active) return;
            const prof = (this._bt_text('/etc/tuned/active_profile') || '').trim();
            if (prof) root(() => tune.applyProfile(prof, true));
        });
        this._bt_try('cron-reboot', () => {
            const sched = (this.parent._modules || []).find(x => x.constructor && x.constructor.name === 'SchedulerCommands');
            if (!sched) return;
            sched.lastMinute = null;
            const crond = S.crond;
            if (!crond || !crond.active) return;
            for (const tab of sched._crontabs()) {
                const env = { SHELL: tab.system ? '/bin/bash' : '/bin/sh' };
                tab.text.split('\n').forEach((line) => {
                    const r = sched.parseLine(line, tab.system);
                    if (r.env) { env[r.env[0]] = r.env[1]; return; }
                    if (!r.job || !r.job.reboot) return;
                    root(() => sched.runJob(r.job, Object.assign({}, env), tab.system ? r.job.user : tab.user));
                });
            }
        });

        this._bt_try('journal', () => this._bt_bootLog(log));
        h.ok('Reached target Multi-User System.');
        this._bt_login();
        this.parent.afterBoot = true;
    }

    _bt_network() {
        const net = this.shared.net;
        if (!net) return;
        net.kroutes = [];
        for (const d of Object.values(net.devices)) {
            if (d.name === 'lo') continue;
            d.addrs = []; d.active = null; d.up = false; d.dhcpLease = null;
        }
        for (const c of net.conns) c.active = null;
        const nm = this.shared.services.NetworkManager;
        if (!nm || !nm.active) return;
        const prio = (c) => parseInt(c.props['connection.autoconnect-priority'] || '0', 10) || 0;
        const list = net.conns.slice().sort((a, b) => prio(b) - prio(a));
        for (const c of list) {
            if (c.props['connection.autoconnect'] === 'no') continue;
            const ifn = c.props['connection.interface-name'];
            const dev = ifn ? net.devices[ifn] : Object.values(net.devices).find(d => d.type === 'ethernet' && !d.active);
            if (!dev || dev.active || dev.type === 'loopback') continue;
            net._activate(c, dev, true);
        }
    }

    _bt_containers() {
        const pod = this.shared.podman;
        if (!pod) return;
        for (const st of Object.values(pod.stores)) {
            for (const c of st.containers) if (c.state === 'running') pod._stopContainer(c, true);
        }
        // rootless user units only come back for users with lingering enabled
        for (const [user, units] of Object.entries(pod.userUnits)) {
            for (const u of Object.values(units)) if (!pod.linger.has(user)) u.active = false;
        }
    }

    _bt_bootLog(log) {
        const d = this.shared.svc._loc(new Date(), '%b %e %H:%M:%S');
        const host = this.parent.hostname;
        const lines = [
            `${d} ${host} kernel: Linux version ${this.kernel} (mockbuild@x86-vm-08.build.eng.bos.redhat.com)`,
            `${d} ${host} systemd[1]: Reached target Multi-User System.`,
            `${d} ${host} systemd[1]: Startup finished.`
        ];
        const n = this._bt_node('/var/log/messages');
        if (n && n.type === 'file') { n.content = (n.content || '') + lines.join('\n') + '\n'; n.size = n.content.length; }
    }
}

window.BootEngine = BootEngine;
