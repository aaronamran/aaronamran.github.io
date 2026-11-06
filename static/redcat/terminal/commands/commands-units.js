// Custom systemd units and timers
// Part of Red Cat RHCSA Terminal Simulator
//
// Unit files that the user writes under /etc/systemd/system (services and timers) are parsed,
// started, enabled and scheduled. Timers fire on the simulated clock and start their service,
// whose output ends up in the journal. Built-in services stay in commands-services.js.

class UnitCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.units = this;
        this.loaded = {};            // name -> { def, mtime, dropMtime }
        this.state = {};             // name -> runtime state
        this.nextPid = 7000;
        this.builtinTimers = [
            { name: 'dnf-makecache.timer', unit: 'dnf-makecache.service', every: 3600000, offset: 600000, desc: 'dnf makecache --timer' },
            { name: 'logrotate.timer', unit: 'logrotate.service', cal: 'daily', desc: 'Daily rotation of log files' },
            { name: 'systemd-tmpfiles-clean.timer', unit: 'systemd-tmpfiles-clean.service', every: 86400000, offset: 900000, desc: 'Daily Cleanup of Temporary Directories' },
            { name: 'fstrim.timer', unit: 'fstrim.service', cal: 'weekly', desc: 'Discard unused blocks once a week', disabled: true }
        ];
        this._startTicker();
    }

    // ===== helpers =====

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _node(p) { return this.fs.getNode(p); }
    _sh() { return typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null; }

    _fmt(d, f) { const tm = this._tm(); return tm ? tm.format(d, tm.tm.tz, f) : d.toISOString(); }
    _stamp(d) { return this._fmt(d, '%a %Y-%m-%d %H:%M:%S %Z'); }
    _jtime(d) { return this._fmt(d, '%b %e %H:%M:%S'); }

    _left(ms) {
        const s = Math.max(0, Math.round(ms / 1000));
        if (s < 60) return `${s}s`;
        if (s < 3600) return `${Math.floor(s / 60)}min ${s % 60 ? s % 60 + 's' : ''}`.trim();
        if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}min`;
        return `${Math.floor(s / 86400)} day${Math.floor(s / 86400) > 1 ? 's' : ''} ${Math.floor((s % 86400) / 3600)}h`;
    }

    _writeFile(path, content, perms = '0644') {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        cur.children[name] = { type: 'file', permissions: perms, owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    _symlink(path, target) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        cur.children[name] = { type: 'symlink', permissions: '0777', owner: 'root', group: 'root', size: target.length, modified: new Date(), target };
    }

    _unlink(path) {
        const parent = this._node(this.fs.getParentPath(path));
        if (parent && parent.children) delete parent.children[this.fs.getBasename(path)];
    }

    // ===== unit files =====

    _unitPath(name) {
        for (const d of ['/etc/systemd/system', '/run/systemd/system', '/usr/lib/systemd/system']) {
            const n = this._node(`${d}/${name}`);
            if (n && n.type === 'file') return `${d}/${name}`;
        }
        return null;
    }

    _parseUnit(text) {
        const sections = {};
        const errors = [];
        let sec = null;
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let l = lines[i].trim();
            while (l.endsWith('\\') && i + 1 < lines.length) { l = l.slice(0, -1) + ' ' + lines[++i].trim(); }
            if (!l || l.startsWith('#') || l.startsWith(';')) continue;
            const m = /^\[([A-Za-z]+)\]$/.exec(l);
            if (m) { sec = m[1]; if (!sections[sec]) sections[sec] = {}; continue; }
            const kv = /^([A-Za-z0-9]+)\s*=\s*(.*)$/.exec(l);
            if (!kv) { errors.push(`line ${i + 1}: Missing '=', ignoring line.`); continue; }
            if (!sec) { errors.push(`line ${i + 1}: Assignment outside of section. Ignoring.`); continue; }
            const k = kv[1];
            if (!sections[sec][k]) sections[sec][k] = [];
            if (kv[2] === '' && /^(Exec|Environment|Wants|Requires|After|Before|OnCalendar|WantedBy)/.test(k)) sections[sec][k] = [];
            else sections[sec][k].push(kv[2]);
        }
        return { sections, errors };
    }

    _loadDef(name, force) {
        const path = this._unitPath(name);
        if (!path) return null;
        const node = this._node(path);
        const dropDir = this._node(path.replace(/\/[^/]+$/, '') + `/${name}.d`);
        let text = node.content || '';
        let dropMtime = 0;
        const dropins = [];
        if (dropDir && dropDir.children) {
            for (const f of Object.keys(dropDir.children).sort()) if (f.endsWith('.conf')) { const dn = dropDir.children[f]; text += '\n' + (dn.content || ''); dropins.push(`${path.replace(/\/[^/]+$/, '')}/${name}.d/${f}`); dropMtime = Math.max(dropMtime, dn.modified ? dn.modified.getTime() : 0); }
        }
        const cached = this.loaded[name];
        if (cached && !force) return cached;
        const parsed = this._parseUnit(text);
        this.loaded[name] = { path, def: parsed.sections, errors: parsed.errors, mtime: node.modified ? node.modified.getTime() : 0, dropMtime, dropins, text: node.content || '' };
        return this.loaded[name];
    }

    // true when the file changed after the unit was loaded
    _stale(name) {
        const c = this.loaded[name];
        if (!c) return false;
        const node = this._node(c.path);
        if (!node) return true;
        const dropDir = this._node(c.path.replace(/\/[^/]+$/, '') + `/${name}.d`);
        let dm = 0;
        if (dropDir && dropDir.children) for (const dn of Object.values(dropDir.children)) dm = Math.max(dm, dn.modified ? dn.modified.getTime() : 0);
        return (node.modified ? node.modified.getTime() : 0) > c.mtime || dm > c.dropMtime;
    }

    _val(u, sec, key, def) { const s = u.def[sec]; return s && s[key] && s[key].length ? s[key][s[key].length - 1] : def; }
    _vals(u, sec, key) { const s = u.def[sec]; return s && s[key] ? s[key] : []; }

    _st(name) {
        if (!this.state[name]) this.state[name] = { active: 'inactive', sub: 'dead', since: null, result: 'success', log: [], enabledLink: false };
        return this.state[name];
    }

    _log(name, msg, pid) {
        const s = this._st(name);
        s.log.push(`${this._jtime(this._now())} rhcsa-lab ${msg}`);
        if (s.log.length > 60) s.log.shift();
    }

    // ===== systemctl wrapper =====

    installHooks(parent) {
        this._prevSystemctl = parent.systemctl;
        this._prevJournalctl = parent.journalctl;
        this._prevAnalyze = parent['systemd-analyze'];
        parent.systemctl = (args, stdin) => this._systemctl(args, stdin);
        parent.journalctl = (args, stdin) => this._journalctl(args, stdin);
        parent['systemd-analyze'] = (args, stdin) => this._analyze(args, stdin);
        parent['systemd-run'] = (args, stdin) => this._run(args, stdin);
    }

    _isBuiltin(name) {
        const svc = this.shared.svc;
        const base = name.replace(/\.service$/, '');
        const overridden = !!this._node('/etc/systemd/system/' + base + '.service') || !!this._node('/run/systemd/system/' + base + '.service');
        return /\.service$/.test(name) || !/\.[a-z]+$/.test(name) ? !!(svc && svc.svDefs && svc.svDefs[base]) && !overridden : false;
    }

    _normName(n) {
        if (/\.(service|timer|socket|target|mount|path|slice|device|swap|scope)$/.test(n)) return n;
        return n + '.service';
    }

    _isCustom(n) {
        const name = this._normName(n);
        if (this._isBuiltin(name)) return false;
        if (/\.timer$/.test(name)) return true;
        if (/\.service$/.test(name)) return !!this._unitPath(name) || !!this.state[name];
        return false;
    }

    _systemctl(args, stdin) {
        const opts = args.filter(a => a.startsWith('-'));
        const pos = args.filter(a => !a.startsWith('-'));
        const verb = pos[0];
        const units = pos.slice(1);
        if (verb === 'daemon-reload' || verb === 'daemon-reexec') {
            if (!this._isRoot()) return this._err('Failed to reload daemon: Interactive authentication required.', 1);
            for (const n of Object.keys(this.loaded)) { this.loaded[n] = null; delete this.loaded[n]; this._loadDef(n, true); }
            this.shared.parent.lastExitCode = 0;
            return this._prevSystemctl(args, stdin);
        }
        if (verb === 'list-timers') return this._listTimers(opts);
        if (verb === 'edit') return this._edit(units, opts);
        if ((verb === 'list-units' || verb === 'list-unit-files') && (opts.includes('--type=timer') || opts.includes('--type=service') || opts.includes('-t'))) {
            const base = this._prevSystemctl(args, stdin);
            return this._appendCustomListing(verb, opts, pos, base);
        }
        const unitVerbs = ['start', 'stop', 'restart', 'reload', 'try-restart', 'status', 'enable', 'disable', 'is-active', 'is-enabled', 'is-failed', 'mask', 'unmask', 'cat', 'show', 'reset-failed', 'kill'];
        if (!unitVerbs.includes(verb) || !units.length) return this._prevSystemctl(args, stdin);
        // split into custom and built-in units and merge the answers
        const outs = [], errs = [];
        let code = 0;
        for (const u of units) {
            const name = this._normName(u);
            if (this._isCustom(u) || (/\.timer$/.test(name))) {
                const r = this._customVerb(verb, name, opts);
                if (r.stdout) outs.push(r.stdout);
                if (r.stderr) errs.push(r.stderr);
                if (r.exitCode) code = r.exitCode;
            } else {
                const r = this._prevSystemctl([...opts, verb, u], stdin);
                const o = r.stdout !== undefined ? r.stdout : (r.output || '');
                const e = r.stderr !== undefined ? r.stderr : (r.error || '');
                if (o) outs.push(o);
                if (e) errs.push(e);
                if (r.exitCode) code = r.exitCode;
            }
        }
        return { stdout: outs.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _needRoot(verb, name) {
        if (this._isRoot()) return null;
        if (['enable', 'disable', 'mask', 'unmask'].includes(verb)) return this._err(`Failed to ${verb} unit: Interactive authentication required.`, 1);
        return this._err(`Failed to ${verb} ${name}: Interactive authentication required.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
    }

    _customVerb(verb, name, opts) {
        const isTimer = /\.timer$/.test(name);
        const mutating = ['start', 'stop', 'restart', 'reload', 'try-restart', 'enable', 'disable', 'mask', 'unmask', 'reset-failed', 'kill'].includes(verb);
        if (mutating) { const e = this._needRoot(verb, name); if (e) return e; }
        const path = this._unitPath(name);
        const s = this._st(name);
        if (!path && !s.masked) {
            if (verb === 'is-active') return { stdout: 'inactive', stderr: '', exitCode: 3 };
            if (verb === 'is-enabled') return { stdout: '', stderr: `Failed to get unit file state for ${name}: No such file or directory`, exitCode: 1 };
            if (verb === 'is-failed') return { stdout: 'inactive', stderr: '', exitCode: 1 };
            if (verb === 'status') return this._err(`Unit ${name} could not be found.`, 4);
            if (['enable', 'disable', 'mask', 'unmask'].includes(verb) && verb !== 'mask') return this._err(`Failed to ${verb} unit: Unit file ${name} does not exist.`, 1);
            if (verb === 'cat') return this._err(`No files found for ${name}.`, 1);
            return this._err(`Failed to ${verb} ${name}: Unit ${name} not found.`, 5);
        }
        const warn = this.loaded[name] && this._stale(name) && !['daemon-reload', 'cat', 'is-enabled', 'is-active', 'is-failed'].includes(verb)
            ? `Warning: The unit file, source configuration file or drop-ins of ${name} changed on disk. Run 'systemctl daemon-reload' to reload units.` : '';
        const u = this._loadDef(name);
        const withWarn = (r) => { if (warn) r.stderr = r.stderr ? warn + '\n' + r.stderr : warn; return r; };
        switch (verb) {
            case 'start': return withWarn(isTimer ? this._startTimer(name, u) : this._startService(name, u));
            case 'stop': return withWarn(isTimer ? this._stopTimer(name) : this._stopService(name));
            case 'restart': case 'try-restart': { if (verb === 'try-restart' && s.active !== 'active') return this._ok(''); if (isTimer) { this._stopTimer(name); return withWarn(this._startTimer(name, u)); } this._stopService(name); return withWarn(this._startService(name, u)); }
            case 'reload': return withWarn(this._reload(name, u));
            case 'status': return withWarn(this._status(name, u, isTimer));
            case 'is-active': return { stdout: s.active === 'active' ? 'active' : (s.active === 'failed' ? 'failed' : 'inactive'), stderr: '', exitCode: s.active === 'active' ? 0 : 3 };
            case 'is-failed': return { stdout: s.active === 'failed' ? 'failed' : (s.active === 'active' ? 'active' : 'inactive'), stderr: '', exitCode: s.active === 'failed' ? 0 : 1 };
            case 'is-enabled': { const e = this._enabledState(name, u); return { stdout: e, stderr: '', exitCode: ['enabled', 'static', 'alias'].includes(e) ? 0 : 1 }; }
            case 'enable': return withWarn(this._enable(name, u, opts));
            case 'disable': return withWarn(this._disable(name, u, opts));
            case 'mask': { s.masked = true; this._symlink(`/etc/systemd/system/${name}`, '/dev/null'); return this._ok(`Created symlink /etc/systemd/system/${name} → /dev/null.`); }
            case 'unmask': { s.masked = false; this._unlink(`/etc/systemd/system/${name}`); return this._ok(`Removed "/etc/systemd/system/${name}".`); }
            case 'reset-failed': if (s.active === 'failed') { s.active = 'inactive'; s.sub = 'dead'; s.result = 'success'; } return this._ok('');
            case 'cat': return this._cat(name, u);
            case 'show': return this._show(name, u);
            case 'kill': { if (s.pid) this._stopService(name, true); return this._ok(''); }
            default: return this._err('unsupported verb', 1);
        }
    }

    // ===== service execution =====

    _words(line) {
        const out = [];
        let cur = '', q = null, has = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (q) { if (c === q) q = null; else if (c === '\\' && q === '"' && i + 1 < line.length) cur += line[++i]; else cur += c; continue; }
            if (c === '"' || c === "'") { q = c; has = true; continue; }
            if (/\s/.test(c)) { if (cur || has) { out.push(cur); cur = ''; has = false; } continue; }
            if (c === '\\' && i + 1 < line.length) { cur += line[++i]; continue; }
            cur += c;
        }
        if (cur || has) out.push(cur);
        return out;
    }

    _envOf(u) {
        const env = {};
        for (const e of this._vals(u, 'Service', 'Environment')) for (const w of this._words(e)) { const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(w); if (m) env[m[1]] = m[2]; }
        for (const ef of this._vals(u, 'Service', 'EnvironmentFile')) {
            const opt = ef.startsWith('-');
            const n = this._node(opt ? ef.slice(1) : ef);
            if (!n) { if (!opt) env.__missingEnvFile = ef; continue; }
            for (const l of (n.content || '').split('\n')) { const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(l); if (m) env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2'); }
        }
        return env;
    }

    // run one ExecStart-style line. returns { code, out, err, running, spawnError }
    _exec(name, line, u, env, user) {
        let prefix = '';
        while (/^[-@+!:]/.test(line)) { prefix += line[0]; line = line.slice(1); }
        const argv = this._words(line.replace(/%t/g, '/run').replace(/%n/g, name).replace(/%h/g, '/root').replace(/%%/g, '%')).map(w => w.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (m, k) => (k in env ? env[k] : '')));
        if (!argv.length) return { code: 0, out: '', err: '' };
        const exe = argv[0];
        const sh = this._sh();
        const optional = prefix.includes('-');
        const fail = (msg, status) => ({ code: status || 203, out: '', err: '', spawnError: msg, optional });
        if (!exe.startsWith('/')) return fail(`Neither a valid executable name nor an absolute path: ${exe}`, 203);
        const node = this._node(exe);
        const virtual = !node && sh && sh.t.commandMethod(exe.split('/').pop()) && /^\/(usr\/)?(s?bin)\//.test(exe);
        if (!node && !virtual) return fail(`Failed to locate executable ${exe}: No such file or directory`, 203);
        if (node && node.type === 'directory') return fail(`Failed to execute ${exe}: Permission denied`, 203);
        if (node && node.type === 'file' && !/[1357]/.test((node.permissions || '0644').slice(-3))) return fail(`Failed to execute ${exe}: Permission denied`, 203);
        // SELinux: init_t may only execute files with an executable label
        const se = this.shared.selinux;
        if (node && se && se.mode !== 'disabled' && !/^\/(usr\/)?(s?bin|libexec|lib|lib64)\//.test(exe) && !/^\/usr\/local\/(s?bin)\//.test(exe)) {
            const lab = se.label(exe, node);
            const okTypes = ['bin_t', 'usr_t', 'lib_t', 'shell_exec_t', 'httpd_exec_t', 'sshd_exec_t', 'chronyd_exec_t', 'initrc_exec_t', 'systemd_unit_file_t', 'ld_so_t', 'ssh_exec_t', 'sudo_exec_t', 'mysqld_exec_t', 'container_runtime_exec_t', 'rpm_exec_t', 'ping_exec_t'];
            if (!okTypes.includes(lab.type) && node.type === 'file') {
                const denied = se.logAvc({ src: 'init_t', comm: '(' + exe.split('/').pop() + ')', exe: '/usr/lib/systemd/systemd', perm: 'execute', tclass: 'file', tcontext: lab, path: exe, user: 'root' });
                if (denied) return fail(`Failed to execute ${exe}: Permission denied`, 203);
            }
        }
        // user / working directory
        const cwd = this._val(u, 'Service', 'WorkingDirectory', null);
        if (cwd && cwd !== '~' && !this._node(cwd)) return { code: 200, out: '', err: '', spawnError: `Changing to the requested working directory failed: No such file or directory`, status: '200/CHDIR' };
        const quote = (w) => "'" + w.replace(/'/g, "'\\''") + "'";
        const code = argv.map(quote).join(' ');
        const saved = { user: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid, cwd: this.fs.currentPath };
        const o = [], e = [];
        const io = { stdin: { text: '', pos: 0 }, out: (s) => { if (s) o.push(s); }, err: (s) => { if (s) e.push(s); }, piped: true };
        const envSaved = Object.assign({}, this.shared.env);
        let rc = 0, running = false;
        const uname = user || 'root';
        const usr = this.fs.users[uname];
        this.fs.currentUser = uname; this.fs.currentUid = usr ? usr.uid : 0; this.fs.currentGid = usr ? usr.gid : 0;
        this.fs.currentPath = cwd && cwd !== '~' ? cwd : (cwd === '~' && usr ? usr.home : '/');
        for (const k of Object.keys(this.shared.env)) delete this.shared.env[k];
        Object.assign(this.shared.env, { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin', LANG: 'en_US.UTF-8', HOME: usr ? usr.home : '/root', LOGNAME: uname, USER: uname, SHELL: '/bin/sh' }, env);
        const stepSaved = sh.stepLimit;
        sh.stepLimit = 300;
        const interSaved = sh.interactive;
        sh.interactive = false;
        try {
            const base = exe.split('/').pop();
            if (base === 'sleep' && (/^(infinity|\d{3,})$/.test(argv[1] || '') || parseInt(argv[1], 10) >= 30)) running = true;
            else if (/^(httpd|nginx|sshd|crond|chronyd|rsyslogd|mysqld|postmaster|tail|nc|ncat|python3?|node)$/.test(base) && (base !== 'tail' || argv.includes('-f')) && (!/^python3?$/.test(base) || argv.includes('-m')) ) running = true;
            else rc = sh.runScriptText(code, argv[0], [], io);
        } catch (err) {
            if (err && /simulator stopped a loop/.test(err.message || '')) running = true;
            else { e.push(String(err && err.message ? err.message : err) + '\n'); rc = 1; }
        } finally {
            sh.stepLimit = stepSaved;
            sh.interactive = interSaved;
            for (const k of Object.keys(this.shared.env)) delete this.shared.env[k];
            Object.assign(this.shared.env, envSaved);
            this.fs.currentUser = saved.user; this.fs.currentUid = saved.uid; this.fs.currentGid = saved.gid; this.fs.currentPath = saved.cwd;
        }
        // a loop-limit stop leaves partial output: keep it
        return { code: rc, out: o.join(''), err: e.join(''), running, exe, optional };
    }

    _journalOutput(name, exe, pid, text) {
        const ident = exe.split('/').pop();
        for (const line of text.split('\n')) if (line !== '') this._log(name, `${ident}[${pid}]: ${line}`);
    }

    _startService(name, u) {
        const s = this._st(name);
        if (s.masked) return this._err(`Failed to start ${name}: Unit ${name} is masked.`, 1);
        if (u.errors && u.errors.length && !u.def.Service) return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
        if (s.active === 'active') return this._ok('');
        const type = this._val(u, 'Service', 'Type', 'simple');
        const execs = this._vals(u, 'Service', 'ExecStart');
        const desc = this._val(u, 'Unit', 'Description', name);
        const failMsg = `Job for ${name} failed because the control process exited with error code.\nSee "systemctl status ${name}" and "journalctl -xeu ${name}" for details.`;
        if (!u.def.Service) {
            this._log(name, `systemd[1]: ${name}: Unit configured without [Service] section`);
            return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
        }
        if (!execs.length && type !== 'oneshot') {
            this._log(name, `systemd[1]: ${name}: Service has no ExecStart=, ExecStop=, or SuccessAction=. Refusing.`);
            s.active = 'failed'; s.sub = 'failed'; s.result = 'resources'; s.since = this._now();
            return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
        }
        const user = this._val(u, 'Service', 'User', null);
        if (user && !this.fs.users[user] && !/^\d+$/.test(user)) {
            this._log(name, `systemd[1]: Starting ${desc}...`);
            this._log(name, `systemd[${this.nextPid}]: ${name}: Failed to determine user credentials: No such process`);
            this._log(name, `systemd[${this.nextPid}]: ${name}: Failed at step USER spawning ${(execs[0] || '').split(/\s+/)[0]}: No such process`);
            this._log(name, `systemd[1]: ${name}: Main process exited, code=exited, status=217/USER`);
            this._log(name, `systemd[1]: ${name}: Failed with result 'exit-code'.`);
            this._log(name, `systemd[1]: Failed to start ${desc}.`);
            s.active = 'failed'; s.sub = 'failed'; s.result = 'exit-code'; s.status = '217/USER'; s.since = this._now(); s.pid = null; s.process = { cmd: execs[0], code: '217/USER' };
            return this._err(failMsg, 1);
        }
        const env = this._envOf(u);
        if (env.__missingEnvFile) {
            this._log(name, `systemd[1]: ${name}: Failed to load environment files: No such file or directory`);
            this._log(name, `systemd[1]: ${name}: Failed to run 'start' task: No such file or directory`);
            s.active = 'failed'; s.sub = 'failed'; s.result = 'resources'; s.since = this._now();
            return this._err(failMsg, 1);
        }
        delete env.__missingEnvFile;
        this._log(name, `systemd[1]: Starting ${desc}...`);
        s.since = this._now();
        const pid = this.nextPid++;
        s.process = { cmd: execs[0], pid };
        // ExecStartPre
        for (const pre of this._vals(u, 'Service', 'ExecStartPre')) {
            const r = this._exec(name, pre, u, env, user);
            if (r.spawnError && !r.optional) return this._failStart(name, desc, pre, r, pid, failMsg);
            this._journalOutput(name, (r.exe || pre.split(/\s+/)[0]), pid, r.out + r.err);
            if (r.code !== 0 && !r.optional && !r.spawnError) return this._failStart(name, desc, pre, r, pid, failMsg);
        }
        let main = null;
        for (const line of execs) {
            main = this._exec(name, line, u, env, user);
            if (main.spawnError) {
                if (main.optional) continue;
                return this._failStart(name, desc, line, main, pid, failMsg);
            }
            this._journalOutput(name, main.exe || line.split(/\s+/)[0], pid, main.out + main.err);
            if (type === 'oneshot' && main.code !== 0 && !main.optional) return this._failStart(name, desc, line, main, pid, failMsg);
            if (type !== 'oneshot') break;
        }
        const restart = this._val(u, 'Service', 'Restart', 'no');
        const remain = /^(yes|true|1|on)$/i.test(this._val(u, 'Service', 'RemainAfterExit', 'no'));
        if (main && !main.running && !main.spawnError && main.code === 0 && (type === 'forking' || type === 'notify')) main.running = true;
        if (main && main.running) {
            s.active = 'active'; s.sub = 'running'; s.pid = pid; s.result = 'success';
            this._addProc(name, u, execs[0], pid, user);
            this._log(name, `systemd[1]: Started ${desc}.`);
            for (const post of this._vals(u, 'Service', 'ExecStartPost')) { const r = this._exec(name, post, u, env, user); this._journalOutput(name, r.exe || post.split(/\s+/)[0], pid, r.out + r.err); }
            return this._ok('');
        }
        if (type === 'oneshot' || !main) {
            if (remain) { s.active = 'active'; s.sub = 'exited'; s.pid = null; s.result = 'success'; s.exited = true; this._log(name, `systemd[1]: Finished ${desc}.`); }
            else { s.active = 'inactive'; s.sub = 'dead'; s.pid = null; s.result = 'success'; this._log(name, `systemd[1]: ${name}: Deactivated successfully.`); this._log(name, `systemd[1]: Finished ${desc}.`); }
            s.status = '0/SUCCESS';
            s.finished = this._now();
            return this._ok('');
        }
        // simple service whose process ended
        if (main.code !== 0) {
            this._log(name, `systemd[1]: ${name}: Main process exited, code=exited, status=${main.code}/FAILURE`);
            if (/^(always|on-failure|on-abnormal)$/.test(restart)) { this._log(name, `systemd[1]: ${name}: Failed with result 'exit-code'.`); this._log(name, `systemd[1]: ${name}: Scheduled restart job, restart counter is at 1.`); this._log(name, `systemd[1]: ${name}: Start request repeated too quickly.`); this._log(name, `systemd[1]: ${name}: Failed with result 'start-limit-hit'.`); s.active = 'failed'; s.sub = 'failed'; s.result = 'start-limit-hit'; }
            else { this._log(name, `systemd[1]: ${name}: Failed with result 'exit-code'.`); s.active = 'failed'; s.sub = 'failed'; s.result = 'exit-code'; }
            s.status = `${main.code}/FAILURE`; s.pid = null; s.finished = this._now();
            this._log(name, `systemd[1]: Started ${desc}.`);
            return this._ok('');
        }
        if (restart === 'always') {
            this._log(name, `systemd[1]: ${name}: Main process exited, code=exited, status=0/SUCCESS`);
            this._log(name, `systemd[1]: ${name}: Scheduled restart job, restart counter is at 5.`);
            this._log(name, `systemd[1]: ${name}: Start request repeated too quickly.`);
            this._log(name, `systemd[1]: ${name}: Failed with result 'start-limit-hit'.`);
            this._log(name, `systemd[1]: Failed to start ${desc}.`);
            s.active = 'failed'; s.sub = 'failed'; s.result = 'start-limit-hit'; s.status = '0/SUCCESS'; s.pid = null; s.finished = this._now();
            return this._ok('');
        }
        s.active = remain ? 'active' : 'inactive'; s.sub = remain ? 'exited' : 'dead'; s.pid = null; s.result = 'success'; s.status = '0/SUCCESS'; s.finished = this._now();
        this._log(name, `systemd[1]: Started ${desc}.`);
        this._log(name, `systemd[1]: ${name}: Deactivated successfully.`);
        return this._ok('');
    }

    _failStart(name, desc, line, r, pid, failMsg) {
        const s = this._st(name);
        const exe = (line.replace(/^[-@+!:]+/, '').split(/\s+/)[0]) || '';
        if (r.spawnError) {
            const status = r.status || '203/EXEC';
            this._log(name, `systemd[${pid}]: ${name}: ${r.spawnError}`);
            if (r.status === undefined) this._log(name, `systemd[${pid}]: ${name}: Failed at step EXEC spawning ${exe}: ${/Permission denied/.test(r.spawnError) ? 'Permission denied' : 'No such file or directory'}`);
            else this._log(name, `systemd[${pid}]: ${name}: Failed at step CHDIR spawning ${exe}: No such file or directory`);
            this._log(name, `systemd[1]: ${name}: Main process exited, code=exited, status=${status}`);
            s.status = status;
        } else {
            this._log(name, `systemd[1]: ${name}: Main process exited, code=exited, status=${r.code}/FAILURE`);
            s.status = `${r.code}/FAILURE`;
        }
        this._log(name, `systemd[1]: ${name}: Failed with result 'exit-code'.`);
        this._log(name, `systemd[1]: Failed to start ${desc}.`);
        s.active = 'failed'; s.sub = 'failed'; s.result = 'exit-code'; s.pid = null; s.finished = this._now();
        s.process = { cmd: line, pid, code: s.status };
        return this._err(failMsg, 1);
    }

    _addProc(name, u, execLine, pid, user) {
        const argv = this._words(execLine.replace(/^[-@+!:]+/, ''));
        this.shared.processes.push({ pid, ppid: 1, user: user || 'root', cpu: 0, mem: 0.3, tty: '?', stat: 'Ss', ni: 0, command: argv.join(' '), comm: (argv[0] || '').split('/').pop().slice(0, 15), service: null, customUnit: name, domain: 'unconfined_service_t', start: this._fmt(this._now(), '%H:%M'), time: '00:00:00' });
        this.shared.processes.sort((a, b) => a.pid - b.pid);
    }

    _removeProc(name) {
        const P = this.shared.processes;
        for (let i = P.length - 1; i >= 0; i--) if (P[i].customUnit === name) P.splice(i, 1);
    }

    _stopService(name, killed) {
        const s = this._st(name);
        const u = this._loadDef(name);
        const desc = u ? this._val(u, 'Unit', 'Description', name) : name;
        if (s.active !== 'active' && s.active !== 'failed') return this._ok('');
        this._log(name, `systemd[1]: Stopping ${desc}...`);
        if (u) {
            const env = this._envOf(u);
            for (const stop of this._vals(u, 'Service', 'ExecStop')) { const r = this._exec(name, stop, u, env, this._val(u, 'Service', 'User', null)); this._journalOutput(name, r.exe || stop.split(/\s+/)[0], s.pid || 0, r.out + r.err); }
        }
        this._removeProc(name);
        s.active = 'inactive'; s.sub = 'dead'; s.pid = null; s.result = 'success'; s.since = this._now();
        this._log(name, killed ? `systemd[1]: ${name}: Main process exited, code=killed, status=15/TERM` : `systemd[1]: ${name}: Deactivated successfully.`);
        this._log(name, `systemd[1]: Stopped ${desc}.`);
        return this._ok('');
    }

    _procKilled(p, sig) {
        const name = p.customUnit;
        const s = this._st(name);
        if (sig === 0 || sig === 18 || sig === 19) return;
        const u = this._loadDef(name);
        const restart = u ? this._val(u, 'Service', 'Restart', 'no') : 'no';
        this._removeProc(name);
        this._log(name, `systemd[1]: ${name}: Main process exited, code=${sig === 9 ? 'killed, status=9/KILL' : 'killed, status=' + sig + '/TERM'}`);
        if (restart === 'always' || restart === 'on-failure' || restart === 'on-abnormal') {
            this._log(name, `systemd[1]: ${name}: Failed with result 'signal'.`);
            this._log(name, `systemd[1]: ${name}: Scheduled restart job, restart counter is at 1.`);
            s.active = 'active'; s.sub = 'running';
            const pid = this.nextPid++;
            s.pid = pid;
            this._addProc(name, u, this._vals(u, 'Service', 'ExecStart')[0], pid, this._val(u, 'Service', 'User', null));
            this._log(name, `systemd[1]: Started ${this._val(u, 'Unit', 'Description', name)}.`);
            return;
        }
        s.active = sig === 9 ? 'failed' : 'inactive'; s.sub = sig === 9 ? 'failed' : 'dead'; s.result = sig === 9 ? 'signal' : 'success'; s.pid = null; s.since = this._now();
        this._log(name, sig === 9 ? `systemd[1]: ${name}: Failed with result 'signal'.` : `systemd[1]: ${name}: Deactivated successfully.`);
    }

    _reload(name, u) {
        const s = this._st(name);
        if (s.active !== 'active') return this._err(`Failed to reload ${name}: Unit ${name} is not active.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
        const rel = this._vals(u, 'Service', 'ExecReload');
        if (!rel.length) return this._err(`Failed to reload ${name}: Job type reload is not applicable for unit ${name}.`, 1);
        const env = this._envOf(u);
        this._log(name, `systemd[1]: Reloading ${this._val(u, 'Unit', 'Description', name)}...`);
        for (const line of rel) { const r = this._exec(name, line.replace(/\$MAINPID/g, String(s.pid || '')), u, env, this._val(u, 'Service', 'User', null)); this._journalOutput(name, r.exe || line.split(/\s+/)[0], s.pid || 0, r.out + r.err); }
        this._log(name, `systemd[1]: Reloaded ${this._val(u, 'Unit', 'Description', name)}.`);
        return this._ok('');
    }

    // ===== enable / disable =====

    _installTargets(u) {
        const t = [];
        for (const k of ['WantedBy', 'RequiredBy']) for (const v of this._vals(u, 'Install', k)) for (const w of v.split(/\s+/)) if (w) t.push([k === 'WantedBy' ? 'wants' : 'requires', w]);
        return t;
    }

    _enabledState(name, u) {
        const s = this._st(name);
        if (s.masked) return 'masked';
        const targets = this._installTargets(u);
        if (!targets.length) return 'static';
        for (const [kind, tgt] of targets) if (this._node(`/etc/systemd/system/${tgt}.${kind}/${name}`)) return 'enabled';
        return 'disabled';
    }

    _enable(name, u, opts) {
        const s = this._st(name);
        if (s.masked) return this._err(`Failed to enable unit: Unit file /etc/systemd/system/${name} is masked.`, 1);
        const targets = this._installTargets(u);
        const out = [];
        if (!targets.length) {
            return { stdout: '', stderr: 'The unit files have no installation config (WantedBy=, RequiredBy=, Also=,\nAlias= settings in the [Install] section, and DefaultInstance= for template\nunits). This means they are not meant to be enabled or disabled using systemctl.\n\nPossible reasons for having these kinds of units are:\n• A unit may be statically enabled by being symlinked from another unit\'s\n  .wants/ or .requires/ directory.\n• A unit\'s purpose may be to act as a helper for some other unit which has\n  a requirement dependency on it.\n• A unit may be started when needed via activation (socket, path, timer,\n  D-Bus, udev, scripted systemctl call, ...).\n• In case of template units, the unit is meant to be enabled with some\n  instance name specified.', exitCode: 0 };
        }
        for (const [kind, tgt] of targets) {
            const link = `/etc/systemd/system/${tgt}.${kind}/${name}`;
            if (this._node(link)) continue;
            const src = this._unitPath(name);
            this._symlink(link, src);
            out.push(`Created symlink ${link} → ${src}.`);
        }
        if (opts.includes('--now')) { const r = /\.timer$/.test(name) ? this._startTimer(name, u) : this._startService(name, u); if (r.exitCode) return { stdout: out.join('\n'), stderr: r.stderr, exitCode: r.exitCode }; }
        return this._ok(out.join('\n'));
    }

    _disable(name, u, opts) {
        const out = [];
        for (const [kind, tgt] of this._installTargets(u)) {
            const link = `/etc/systemd/system/${tgt}.${kind}/${name}`;
            if (this._node(link)) { this._unlink(link); out.push(`Removed "${link}".`); }
        }
        if (opts.includes('--now')) { if (/\.timer$/.test(name)) this._stopTimer(name); else this._stopService(name); }
        return this._ok(out.join('\n'));
    }

    // ===== status / cat / show =====

    _status(name, u, isTimer) {
        const s = this._st(name);
        const path = this._unitPath(name);
        const en = this._enabledState(name, u);
        const lines = [];
        const desc = this._val(u, 'Unit', 'Description', name);
        const dot = s.active === 'active' ? '●' : (s.active === 'failed' ? '×' : '○');
        lines.push(`${dot} ${name}${desc !== name ? ' - ' + desc : ''}`);
        lines.push(`     Loaded: ${s.masked ? 'masked (Reason: Unit ' + name + ' is masked.)' : `loaded (${path}; ${en}${en === 'static' ? '' : '; preset: disabled'})`}`);
        const drop = (u.dropins || []);
        if (drop.length) { lines.push(`    Drop-In: ${drop[0].replace(/\/[^/]+$/, '')}`); lines.push(`             └─${drop.map(d => d.split('/').pop()).join(', ')}`); }
        if (isTimer) {
            const ts = this._timerState(name);
            if (s.active === 'active') lines.push(`     Active: active (waiting) since ${this._stamp(s.since)}; ${this._ago(s.since)}`);
            else lines.push(`     Active: inactive (dead)${s.since ? ` since ${this._stamp(s.since)}; ${this._ago(s.since)}` : ''}`);
            if (s.active === 'active') { lines.push(`    Trigger: ${ts && ts.next ? this._stamp(ts.next) + '; ' + this._left(ts.next - this._now()) + ' left' : 'n/a'}`); }
            lines.push(`   Triggers: ● ${this._val(u, 'Timer', 'Unit', name.replace(/\.timer$/, '.service'))}`);
        } else {
            if (s.active === 'active' && s.sub === 'running') lines.push(`     Active: active (running) since ${this._stamp(s.since)}; ${this._ago(s.since)}`);
            else if (s.active === 'active') lines.push(`     Active: active (exited) since ${this._stamp(s.since)}; ${this._ago(s.since)}`);
            else if (s.active === 'failed') lines.push(`     Active: failed (Result: ${s.result}) since ${this._stamp(s.finished || s.since)}; ${this._ago(s.finished || s.since)}`);
            else lines.push(`     Active: inactive (dead)${s.finished || s.since ? ` since ${this._stamp(s.finished || s.since)}; ${this._ago(s.finished || s.since)}` : ''}`);
            const trig = this._timerFor(name);
            if (trig) lines.push(`TriggeredBy: ${this._st(trig).active === 'active' ? '●' : '○'} ${trig}`);
            if (s.process && s.process.cmd && s.active !== 'active') {
                lines.push(`    Process: ${s.process.pid || ''} ExecStart=${s.process.cmd.replace(/^[-@+!:]+/, '')} (code=exited, status=${s.status || '0/SUCCESS'})`);
                lines.push(`   Main PID: ${s.process.pid || ''} (code=exited, status=${s.status || '0/SUCCESS'})`);
            } else if (s.pid) {
                const argv = this._words((s.process.cmd || '').replace(/^[-@+!:]+/, ''));
                lines.push(`   Main PID: ${s.pid} (${(argv[0] || '').split('/').pop()})`);
                lines.push(`      Tasks: 1 (limit: 22978)`);
                lines.push(`     Memory: 1.2M`);
                lines.push(`        CPU: 3ms`);
                lines.push(`     CGroup: /system.slice/${name}`);
                lines.push(`             └─${s.pid} ${argv.join(' ')}`);
            }
            if (s.active !== 'active') lines.push('        CPU: 4ms');
        }
        lines.push('');
        lines.push(...s.log.slice(-10));
        return { stdout: lines.join('\n'), stderr: '', exitCode: s.active === 'active' ? 0 : 3 };
    }

    _ago(d) {
        if (!d) return '';
        const sec = Math.max(0, Math.floor((this._now() - d) / 1000));
        if (sec < 60) return `${sec}s ago`;
        if (sec < 3600) return `${Math.floor(sec / 60)}min ${sec % 60}s ago`;
        return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}min ago`;
    }

    _cat(name, u) {
        const out = [`# ${u.path}`, u.text.replace(/\n$/, '')];
        for (const d of (u.dropins || [])) out.push('', `# ${d}`, (this._node(d).content || '').replace(/\n$/, ''));
        return this._ok(out.join('\n'));
    }

    _show(name, u) {
        const s = this._st(name);
        const kv = { Id: name, Names: name, Description: this._val(u, 'Unit', 'Description', name), LoadState: 'loaded', ActiveState: s.active, SubState: s.sub, FragmentPath: u.path, UnitFileState: this._enabledState(name, u), MainPID: String(s.pid || 0), Result: s.result, ExecMainStatus: String((s.status || '0').split('/')[0]) };
        return this._ok(Object.entries(kv).map(([k, v]) => `${k}=${v}`).join('\n'));
    }

    // ===== timers =====

    _timerFor(serviceName) {
        const base = serviceName.replace(/\.service$/, '');
        const dir = this._node('/etc/systemd/system');
        if (!dir || !dir.children) return null;
        for (const f of Object.keys(dir.children)) {
            if (!f.endsWith('.timer')) continue;
            const u = this._loadDef(f);
            const unit = this._val(u, 'Timer', 'Unit', f.replace(/\.timer$/, '.service'));
            if (unit === serviceName) return f;
        }
        return null;
    }

    _parseDuration(text) {
        let total = 0, matched = false;
        const unit = { us: 0.001, usec: 0.001, ms: 1, msec: 1, s: 1000, sec: 1000, second: 1000, seconds: 1000, m: 60000, min: 60000, minute: 60000, minutes: 60000, h: 3600000, hr: 3600000, hour: 3600000, hours: 3600000, d: 86400000, day: 86400000, days: 86400000, w: 604800000, week: 604800000, weeks: 604800000, M: 2629800000, month: 2629800000, months: 2629800000, y: 31557600000, year: 31557600000, years: 31557600000 };
        const re = /(\d+(?:\.\d+)?)\s*([A-Za-z]*)/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            const u = m[2] === '' ? 's' : m[2];
            if (!(u in unit)) return null;
            total += parseFloat(m[1]) * unit[u];
            matched = true;
        }
        return matched ? total : null;
    }

    // ---- OnCalendar
    _parseCalendar(expr) {
        let e = expr.trim();
        if (!e) return null;
        const lower = e.toLowerCase();
        const alias = { minutely: '*-*-* *:*:00', hourly: '*-*-* *:00:00', daily: '*-*-* 00:00:00', midnight: '*-*-* 00:00:00', weekly: 'Mon *-*-* 00:00:00', monthly: '*-*-01 00:00:00', quarterly: '*-01,04,07,10-01 00:00:00', semiannually: '*-01,07-01 00:00:00', yearly: '*-01-01 00:00:00', annually: '*-01-01 00:00:00' };
        if (alias[lower]) e = alias[lower];
        const parts = e.split(/\s+/);
        let dow = null, date = null, time = null;
        for (const p of parts) {
            if (/^(mon|tue|wed|thu|fri|sat|sun)/i.test(p) && !/[:]/.test(p) && !/^\d/.test(p)) dow = p;
            else if (/:/.test(p)) time = p;
            else if (/^[\d*]/.test(p) && /-/.test(p)) date = p;
            else if (p === '*') date = date || '*-*-*';
            else return null;
        }
        if (!time && !date && !dow) return null;
        if (!time) time = '00:00:00';
        if (!date) date = '*-*-*';
        const tp = time.split(':');
        if (tp.length < 2 || tp.length > 3) return null;
        if (tp.length === 2) tp.push('00');
        const dp = date.split('-');
        let y, mo, d;
        if (dp.length === 2) { y = '*'; mo = dp[0]; d = dp[1]; } else if (dp.length === 3) { [y, mo, d] = dp; } else return null;
        const set = (txt, min, max) => {
            const out = new Set();
            for (const part of txt.split(',')) {
                const m = /^(\*|\d+(?:\.\.\d+)?)(?:\/(\d+))?$/.exec(part);
                if (!m) return undefined;
                let lo, hi;
                const step = m[2] ? parseInt(m[2], 10) : 1;
                if (m[1] === '*') { lo = min; hi = max; }
                else if (m[1].includes('..')) { [lo, hi] = m[1].split('..').map(Number); }
                else { lo = parseInt(m[1], 10); hi = m[2] ? max : lo; }
                if (lo < min || hi > max || lo > hi) return undefined;
                for (let v = lo; v <= hi; v += step) out.add(v);
            }
            return out;
        };
        const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        let dowSet = null;
        if (dow) {
            dowSet = new Set();
            for (const part of dow.split(',')) {
                const r = part.split('..');
                const a = names.indexOf(r[0].toLowerCase().slice(0, 3));
                const b = r[1] ? names.indexOf(r[1].toLowerCase().slice(0, 3)) : a;
                if (a < 0 || b < 0) return null;
                for (let v = a; ; v = (v + 1) % 7) { dowSet.add(v); if (v === b) break; }
            }
        }
        const Y = y === '*' ? null : set(y, 1970, 2200), MO = set(mo, 1, 12), D = set(d, 1, 31), H = set(tp[0], 0, 23), MI = set(tp[1], 0, 59), SE = set(tp[2], 0, 59);
        if (Y === undefined || !MO || !D || !H || !MI || !SE) return null;
        return { Y, MO, D, H, MI, SE, dowSet, text: this._normalizeCalendar(dow, y, mo, d, tp) };
    }

    _normalizeCalendar(dow, y, mo, d, tp) {
        const pad = (s) => s.split(',').map(x => (/^\d+$/.test(x) ? x.padStart(2, '0') : x)).join(',');
        const t = tp.map(pad).join(':');
        const days = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
        const dw = dow ? dow.split(',').map(x => x.split('..').map(z => days[z.toLowerCase().slice(0, 3)]).join('..')).join(',') + ' ' : '';
        return `${dw}${y}-${pad(mo)}-${pad(d)} ${t}`;
    }

    _nextCalendar(cal, from) {
        const tm = this._tm();
        const tz = tm.tm.tz;
        let t = new Date(Math.floor(from.getTime() / 1000) * 1000 + 1000);
        for (let i = 0; i < 3700; i++) {
            const p = tm.parts(t, tz);
            const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.wd);
            const dayOk = (!cal.Y || cal.Y.has(p.Y)) && cal.MO.has(p.m) && cal.D.has(p.d) && (!cal.dowSet || cal.dowSet.has(wd));
            if (dayOk) {
                const sameDay = (cand) => { const pp = tm.parts(cand, tz); return pp.Y === p.Y && pp.m === p.m && pp.d === p.d; };
                for (let h = (i === 0 ? p.H : 0); h < 24; h++) {
                    if (!cal.H.has(h)) continue;
                    for (let mi = (i === 0 && h === p.H ? p.M : 0); mi < 60; mi++) {
                        if (!cal.MI.has(mi)) continue;
                        for (let se = (i === 0 && h === p.H && mi === p.M ? p.S : 0); se < 60; se++) {
                            if (!cal.SE.has(se)) continue;
                            const cand = tm.fromLocal(p.Y, p.m, p.d, h, mi, se, tz);
                            if (cand.getTime() >= from.getTime() + 1 - 1000 && cand > from && sameDay(cand)) return cand;
                        }
                    }
                }
            }
            const nextDay = tm.fromLocal(p.Y, p.m, p.d + 1, 0, 0, 0, tz);
            t = nextDay;
        }
        return null;
    }

    _timerState(name) {
        const s = this._st(name);
        return s.timer || null;
    }

    _computeNext(name, u, after) {
        const s = this._st(name);
        const t = s.timer || (s.timer = { last: null, next: null, started: this._now(), serviceActivated: null });
        const now = after || this._now();
        let best = null;
        const consider = (d) => { if (d && d > now - 0 && (!best || d < best)) best = d; };
        for (const c of this._vals(u, 'Timer', 'OnCalendar')) { const cal = this._parseCalendar(c); if (cal) consider(this._nextCalendar(cal, now)); }
        const boot = this.shared.svc ? this.shared.svc.svBoot : new Date(Date.now() - 4 * 3600000);
        for (const k of ['OnBootSec', 'OnStartupSec']) for (const v of this._vals(u, 'Timer', k)) { const ms = this._parseDuration(v); if (ms !== null && !t.firedBoot) consider(new Date(boot.getTime() + ms)); }
        for (const v of this._vals(u, 'Timer', 'OnActiveSec')) { const ms = this._parseDuration(v); if (ms !== null && !t.firedActive) consider(new Date(t.started.getTime() + ms)); }
        for (const v of this._vals(u, 'Timer', 'OnUnitActiveSec')) { const ms = this._parseDuration(v); if (ms !== null) consider(new Date(((t.serviceActivated || t.started)).getTime() + ms)); }
        for (const v of this._vals(u, 'Timer', 'OnUnitInactiveSec')) { const ms = this._parseDuration(v); if (ms !== null) consider(new Date(((t.serviceInactive || t.started)).getTime() + ms)); }
        t.next = best;
        return best;
    }

    _startTimer(name, u) {
        const s = this._st(name);
        if (s.masked) return this._err(`Failed to start ${name}: Unit ${name} is masked.`, 1);
        if (s.active === 'active') return this._ok('');
        const unitName = this._val(u, 'Timer', 'Unit', name.replace(/\.timer$/, '.service'));
        if (!u.def.Timer) return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1);
        const hasTrigger = ['OnCalendar', 'OnBootSec', 'OnStartupSec', 'OnActiveSec', 'OnUnitActiveSec', 'OnUnitInactiveSec'].some(k => this._vals(u, 'Timer', k).length);
        if (!hasTrigger) { this._log(name, `systemd[1]: ${name}: Timer unit lacks value setting. Refusing.`); return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1); }
        for (const c of this._vals(u, 'Timer', 'OnCalendar')) if (!this._parseCalendar(c)) { this._log(name, `systemd[1]: ${name}: Failed to parse calendar specification, ignoring: ${c}`); return this._err(`Failed to start ${name}: Unit ${name} has a bad unit file setting.\nSee system logs and 'systemctl status ${name}' for details.`, 1); }
        const svcPath = this._unitPath(unitName);
        const builtinSvc = this.shared.svc && this.shared.svc.svDefs && this.shared.svc.svDefs[unitName.replace(/\.service$/, '')];
        if (!svcPath && !builtinSvc) { this._log(name, `systemd[1]: ${name}: Failed to load configuration: No such file or directory`); return this._err(`Failed to start ${name}: Unit ${unitName} not found.`, 5); }
        s.active = 'active'; s.sub = 'waiting'; s.since = this._now();
        s.timer = { last: null, next: null, started: this._now(), serviceActivated: null };
        this._computeNext(name, u);
        this._log(name, `systemd[1]: Started ${this._val(u, 'Unit', 'Description', name)}.`);
        return this._ok('');
    }

    _stopTimer(name) {
        const s = this._st(name);
        if (s.active !== 'active') return this._ok('');
        s.active = 'inactive'; s.sub = 'dead'; s.since = this._now();
        if (s.timer) s.timer.next = null;
        this._log(name, `systemd[1]: Stopped ${name}.`);
        return this._ok('');
    }

    _startTicker() {
        if (typeof window === 'undefined') return;
        if (window.__redcatUnits) clearInterval(window.__redcatUnits);
        window.__redcatUnits = setInterval(() => { try { this._utick(); } catch (e) { /* never break the page */ } }, 1000);
    }

    _utick() {
        const now = this._now();
        for (const [name, s] of Object.entries(this.state)) {
            if (!/\.timer$/.test(name) || s.active !== 'active' || !s.timer || !s.timer.next) continue;
            if (now < s.timer.next) continue;
            const u = this._loadDef(name);
            if (!u) continue;
            const unitName = this._val(u, 'Timer', 'Unit', name.replace(/\.timer$/, '.service'));
            s.timer.last = now;
            if (this._vals(u, 'Timer', 'OnBootSec').length || this._vals(u, 'Timer', 'OnStartupSec').length) s.timer.firedBoot = true;
            if (this._vals(u, 'Timer', 'OnActiveSec').length) s.timer.firedActive = true;
            // start the triggered service
            const unitDef = this._loadDef(unitName);
            if (unitDef) { const r = this._startService(unitName, unitDef); void r; }
            else if (this.shared.svc && this.shared.svc.svDefs[unitName.replace(/\.service$/, '')]) { /* built-in service triggered */ }
            const after = new Date(now.getTime() + 1000);
            s.timer.serviceActivated = now;
            s.timer.serviceInactive = this._now();
            this._computeNext(name, u, after);
        }
    }

    _timerRows() {
        const rows = [];
        const now = this._now();
        for (const [name, s] of Object.entries(this.state)) {
            if (!/\.timer$/.test(name) || s.active !== 'active' || !s.timer) continue;
            const u = this._loadDef(name);
            if (!u) continue;
            rows.push({ next: s.timer.next, last: s.timer.last, unit: name, activates: this._val(u, 'Timer', 'Unit', name.replace(/\.timer$/, '.service')) });
        }
        const tm = this._tm();
        for (const b of this.builtinTimers) {
            if (b.disabled) continue;
            let next;
            if (b.cal) { const cal = this._parseCalendar(b.cal); next = this._nextCalendar(cal, now); }
            else { const boot = this.shared.svc ? this.shared.svc.svBoot : now; let n = boot.getTime() + b.offset; while (n <= now.getTime()) n += b.every; next = new Date(n); }
            const last = b.cal ? null : new Date(next.getTime() - b.every);
            rows.push({ next, last: b.cal ? new Date(next.getTime() - 86400000) : last, unit: b.name, activates: b.unit });
        }
        return rows.sort((a, b) => (a.next || 8e15) - (b.next || 8e15));
    }

    _listTimers(opts) {
        const rows = this._timerRows();
        const now = this._now();
        const fmtD = (d) => (d ? this._stamp(d) : 'n/a');
        const data = rows.map(r => [fmtD(r.next), r.next ? this._left(r.next - now) + ' left' : 'n/a', fmtD(r.last), r.last ? this._left(now - r.last) + ' ago' : 'n/a', r.unit, r.activates]);
        const hdr = ['NEXT', 'LEFT', 'LAST', 'PASSED', 'UNIT', 'ACTIVATES'];
        const w = hdr.map((h, i) => Math.max(h.length, ...data.map(r => r[i].length)));
        const fmt = (r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(w[i]))).join(' ');
        const lines = [fmt(hdr), ...data.map(fmt), '', `${data.length} timers listed.`];
        if (!opts.includes('--all')) lines.push('Pass --all to see loaded but inactive timers, too.');
        return this._ok(lines.join('\n'));
    }

    _appendCustomListing(verb, opts, pos, base) {
        const type = (opts.find(o => o.startsWith('--type=')) || '').slice(7) || (pos[1] || '');
        const custom = [];
        const dir = this._node('/etc/systemd/system');
        const all = opts.includes('--all') || opts.includes('-a');
        if (dir && dir.children) for (const f of Object.keys(dir.children).sort()) {
            const n = dir.children[f];
            if (n.type !== 'file' || !/\.(service|timer)$/.test(f)) continue;
            if (type && !f.endsWith('.' + type)) continue;
            custom.push(f);
        }
        let text = base.stdout !== undefined ? base.stdout : (base.output || '');
        if (verb === 'list-unit-files') {
            const extra = custom.map(f => { const u = this._loadDef(f); return `${f.padEnd(25)} ${this._enabledState(f, u).padEnd(8)} disabled`; });
            if (extra.length) text = text.replace(/\n\n\d+ unit files listed\./, '\n' + extra.join('\n') + `\n\n${(parseInt((/(\d+) unit files listed/.exec(text) || [0, 0])[1], 10) || 0) + extra.length} unit files listed.`);
        } else {
            const extra = custom.filter(f => (all || this._st(f).active === 'active') && this._st(f).active !== undefined).map(f => { const s = this._st(f); const u = this._loadDef(f); return `  ${f.padEnd(25)} loaded ${s.active.padEnd(6)} ${s.sub.padEnd(7)} ${this._val(u, 'Unit', 'Description', f)}`; });
            if (extra.length) text = text.replace(/\n\nLOAD/, '\n' + extra.join('\n') + '\n\nLOAD');
        }
        return { stdout: text, stderr: base.stderr || '', exitCode: base.exitCode || 0 };
    }

    // ===== systemctl edit =====

    _edit(units, opts) {
        if (!this._isRoot()) return this._err('Failed to edit: Interactive authentication required.', 1);
        const t = typeof window !== 'undefined' ? window.terminal : null;
        if (!t) return this._err('systemctl edit: no editor available', 1);
        if (!units.length) return this._err('systemctl: Too few arguments.', 1);
        const name = this._normName(units[0]);
        const full = opts.includes('--full');
        const path = full ? `/etc/systemd/system/${name}` : `/etc/systemd/system/${name}.d/override.conf`;
        const existing = this._node(path);
        let content = existing ? existing.content || '' : '';
        if (full && !existing) { const src = this._unitPath(name); content = src ? this._node(src).content : ''; }
        const header = `### Editing ${path}\n### Anything between here and the comment below will become the new contents of the file\n\n`;
        const footer = '\n\n### Lines below this comment will be discarded\n';
        const tmp = `/tmp/systemctl-edit-${Math.random().toString(36).slice(2, 8)}`;
        this._writeFile(tmp, header + content + footer, '0600');
        t.afterEditor = () => {
            const n = this._node(tmp);
            const parent = this._node('/tmp'); if (parent) delete parent.children[tmp.split('/').pop()];
            const text = n ? n.content || '' : '';
            let body = text;
            const a = body.indexOf('\n\n'); if (body.startsWith('### Editing')) body = body.slice(a + 2);
            const cut = body.indexOf('### Lines below this comment will be discarded'); if (cut >= 0) body = body.slice(0, cut);
            body = body.replace(/\s+$/, '') + (body.trim() ? '\n' : '');
            if (!body.trim() || body === (content.replace(/\s+$/, '') + (content.trim() ? '\n' : ''))) { t.addOutput('<span class="info">No changes.</span>'); return; }
            this._writeFile(path, body);
            for (const k of Object.keys(this.loaded)) delete this.loaded[k];
            this.shared.parent.lastExitCode = 0;
        };
        t.openEditor('vim', tmp, header + content + footer);
        return this._ok('');
    }

    // ===== journalctl -u custom =====

    _journalctl(args, stdin) {
        const idx = args.findIndex(a => a === '-u' || a === '--unit');
        const eq = args.find(a => a.startsWith('--unit='));
        const raw = eq ? eq.slice(7) : (idx >= 0 ? args[idx + 1] : null);
        if (raw) {
            const name = this._normName(raw);
            if (this._isCustom(raw) || this.state[name]) {
                const s = this._st(name);
                let log = s.log.slice();
                const ni = args.findIndex(a => a === '-n' || a === '--lines');
                if (ni >= 0) log = log.slice(-parseInt(args[ni + 1], 10));
                else { const m = args.find(a => /^-n\d+$/.test(a)); if (m) log = log.slice(-parseInt(m.slice(2), 10)); }
                if (args.includes('-r')) log.reverse();
                if (args.includes('-o') && args[args.indexOf('-o') + 1] === 'cat') log = log.map(l => l.replace(/^\w+\s+\d+\s[\d:]+\s\S+\s[^:]*:\s/, ''));
                return this._ok(log.length ? log.join('\n') : '-- No entries --');
            }
        }
        return this._prevJournalctl(args, stdin);
    }

    // ===== systemd-analyze =====

    _analyze(args, stdin) {
        const verb = args[0];
        if (verb === 'calendar') {
            const exprs = args.slice(1).filter(a => !a.startsWith('--'));
            if (!exprs.length) return this._err('Too few arguments.', 1);
            const iterIdx = args.find(a => a.startsWith('--iterations='));
            const iters = iterIdx ? parseInt(iterIdx.slice(13), 10) : 1;
            const out = [];
            const tm = this._tm();
            for (const ex of exprs) {
                const cal = this._parseCalendar(ex);
                if (!cal) return this._err(`Failed to parse calendar specification '${ex}': Invalid argument`, 1);
                out.push(`  Original form: ${ex}`);
                out.push(`Normalized form: ${cal.text}`);
                let from = this._now();
                for (let i = 0; i < iters; i++) {
                    const next = this._nextCalendar(cal, from);
                    if (!next) { out.push('    Next elapse: never'); break; }
                    out.push(i === 0 ? `    Next elapse: ${this._stamp(next)}` : `       Iteration #${i + 1}: ${this._stamp(next)}`);
                    if (i === 0) {
                        if (tm.tm.tz !== 'UTC') out.push(`       (in UTC): ${tm.format(next, 'UTC', '%a %Y-%m-%d %H:%M:%S %Z')}`);
                        out.push(`       From now: ${this._left(next - this._now())} left`);
                    }
                    from = next;
                }
                out.push('');
            }
            return this._ok(out.join('\n').replace(/\n$/, ''));
        }
        if (verb === 'timespan') {
            const t = args.slice(1).join(' ');
            const ms = this._parseDuration(t);
            if (ms === null) return this._err(`Failed to parse time span '${t}': Invalid argument`, 1);
            return this._ok(`Original: ${t}\n      μs: ${Math.round(ms * 1000)}\n   Human: ${this._left(ms).replace(/ left$/, '')}`);
        }
        if (verb === 'verify') {
            const files = args.slice(1);
            const msgs = [];
            for (const f of files) {
                const n = this._node(f);
                if (!n) { msgs.push(`Failed to load ${f}: No such file or directory`); continue; }
                const parsed = this._parseUnit(n.content || '');
                parsed.errors.forEach(e => msgs.push(`${f}:${e}`));
                const known = { Service: ['Type', 'ExecStart', 'ExecStartPre', 'ExecStartPost', 'ExecStop', 'ExecReload', 'User', 'Group', 'WorkingDirectory', 'Environment', 'EnvironmentFile', 'Restart', 'RestartSec', 'RemainAfterExit', 'TimeoutStartSec', 'TimeoutStopSec', 'PIDFile', 'KillMode', 'StandardOutput', 'StandardError', 'SyslogIdentifier', 'LimitNOFILE', 'Nice', 'UMask', 'PrivateTmp', 'ProtectSystem', 'ProtectHome', 'NoNewPrivileges', 'CapabilityBoundingSet', 'AmbientCapabilities', 'SuccessExitStatus', 'ExecCondition', 'RuntimeDirectory', 'StateDirectory'], Timer: ['OnCalendar', 'OnBootSec', 'OnStartupSec', 'OnActiveSec', 'OnUnitActiveSec', 'OnUnitInactiveSec', 'Persistent', 'AccuracySec', 'RandomizedDelaySec', 'Unit', 'WakeSystem', 'RemainAfterElapse'], Unit: ['Description', 'Documentation', 'After', 'Before', 'Requires', 'Wants', 'BindsTo', 'PartOf', 'Conflicts', 'ConditionPathExists', 'AssertPathExists', 'OnFailure', 'Requisite', 'StartLimitIntervalSec', 'StartLimitBurst'], Install: ['WantedBy', 'RequiredBy', 'Alias', 'Also', 'DefaultInstance'] };
                for (const [sec, keys] of Object.entries(parsed.sections)) {
                    if (!known[sec]) { msgs.push(`${f}: Unknown section '${sec}'. Ignoring.`); continue; }
                    for (const k of Object.keys(keys)) if (!known[sec].includes(k)) msgs.push(`${f}: Unknown key name '${k}' in section '${sec}', ignoring.`);
                }
                if (parsed.sections.Service) {
                    for (const line of (parsed.sections.Service.ExecStart || [])) {
                        const exe = this._words(line.replace(/^[-@+!:]+/, ''))[0] || '';
                        if (!exe.startsWith('/')) msgs.push(`${f.split('/').pop()}: Service has a non-absolute executable path: ${exe}`);
                        else if (!this._node(exe)) msgs.push(`${f.split('/').pop()}: Command ${exe} is not executable: No such file or directory`);
                    }
                    if (!(parsed.sections.Service.ExecStart || []).length && ((parsed.sections.Service.Type || [])[0] !== 'oneshot')) msgs.push(`${f.split('/').pop()}: Service has no ExecStart=, ExecStop=, or SuccessAction=. Refusing.`);
                }
            }
            return { stdout: '', stderr: msgs.join('\n'), exitCode: msgs.length ? 1 : 0 };
        }
        return this._prevAnalyze ? this._prevAnalyze(args, stdin) : this._err('systemd-analyze: command not found', 127);
    }

    // ===== systemd-run (transient timers/services) =====

    _run(args, stdin) {
        if (!this._isRoot()) return this._err('Failed to start transient service unit: Interactive authentication required.', 1);
        let onActive = null, onCalendar = null, unitName = null;
        const cmd = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (cmd.length) { cmd.push(a); continue; }
            if (a.startsWith('--on-active=')) onActive = a.slice(12); else if (a === '--on-active') onActive = args[++i];
            else if (a.startsWith('--on-calendar=')) onCalendar = a.slice(14); else if (a === '--on-calendar') onCalendar = args[++i];
            else if (a.startsWith('--unit=')) unitName = a.slice(7); else if (a === '--unit') unitName = args[++i];
            else if (a === '--collect' || a === '--no-block' || a === '--quiet' || a === '-q' || a === '--wait' || a === '--pty') { /* accepted */ }
            else if (a.startsWith('--')) { /* property or option: accepted */ }
            else cmd.push(a);
        }
        if (!cmd.length) return this._err('Command line to execute required.', 1);
        const id = unitName || `run-r${Math.random().toString(16).slice(2, 10)}`;
        const svcName = id.replace(/\.service$/, '') + '.service';
        const body = `[Unit]\nDescription=/${cmd.join(' ')}\n\n[Service]\nType=oneshot\nExecStart=${cmd.map(c => (/\s/.test(c) ? `"${c}"` : c)).join(' ')}\n`;
        this._writeFile(`/run/systemd/system/${svcName}`, body);
        if (onActive || onCalendar) {
            const tname = svcName.replace(/\.service$/, '.timer');
            this._writeFile(`/run/systemd/system/${tname}`, `[Unit]\nDescription=/${cmd.join(' ')}\n\n[Timer]\n${onActive ? `OnActiveSec=${onActive}` : `OnCalendar=${onCalendar}`}\nRemainAfterElapse=no\n`);
            const u = this._loadDef(tname, true);
            this._startTimer(tname, u);
            return { stdout: '', stderr: `Running timer as unit: ${tname}\nWill run service as unit: ${svcName}`, exitCode: 0 };
        }
        const u = this._loadDef(svcName, true);
        this._startService(svcName, u);
        return { stdout: '', stderr: `Running as unit: ${svcName}`, exitCode: 0 };
    }
}

if (typeof window !== 'undefined') {
    window.UnitCommands = UnitCommands;
}
