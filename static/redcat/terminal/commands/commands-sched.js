// Scheduling: crontab, crond, at/atd, anacron, run-parts, mail
// Part of Red Cat RHCSA Terminal Simulator
//
// Jobs really run: a one-second ticker compares the simulated clock with every crontab,
// /etc/cron.d, and queued at job, and executes due commands through the shell interpreter.
// Output is mailed to the owner (/var/spool/mail/USER) and CMD lines go to /var/log/cron.

class SchedulerCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.sched = this;
        this.atJobs = [];                 // {id, when, user, text, queue}
        this.atSerial = 0;
        this.lastMinute = null;
        this.lastAnacron = {};
        this.crondPid = 0;
        this._ensureFiles();
        this._startTicker();
    }

    // ===== files and helpers =====

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _svc(n) { return this.shared.services[n]; }

    _node(path) { return this.fs.getNode(path); }

    _mkdirs(path, perms = '0755') {
        const parts = path.split('/').filter(Boolean);
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: perms, owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        return cur;
    }

    _writeFile(path, content, perms = '0644', owner = 'root', group = 'root', append = false) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        const dir = this._mkdirs('/' + parts.join('/'));
        const ex = dir.children[name];
        if (ex && ex.type === 'file') { ex.content = append ? (ex.content || '') + content : content; ex.size = ex.content.length; ex.modified = new Date(); return ex; }
        dir.children[name] = { type: 'file', permissions: perms, owner, group, size: content.length, modified: new Date(), content };
        return dir.children[name];
    }

    _ensureFiles() {
        this._mkdirs('/var/spool/cron', '0700');
        this._mkdirs('/var/spool/at', '0700');
        this._mkdirs('/var/spool/anacron', '0755');
        this._mkdirs('/var/spool/mail', '0775');
        for (const d of ['cron.hourly', 'cron.daily', 'cron.weekly', 'cron.monthly']) this._mkdirs('/etc/' + d);
        if (!this._node('/etc/crontab')) this._writeFile('/etc/crontab', 'SHELL=/bin/bash\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n\n# For details see man 4 crontabs\n\n# Example of job definition:\n# .---------------- minute (0 - 59)\n# |  .------------- hour (0 - 23)\n# |  |  .---------- day of month (1 - 31)\n# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...\n# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat\n# |  |  |  |  |\n# *  *  *  *  * user-name  command to be executed\n\n', '0644');
        if (!this._node('/etc/cron.d/0hourly')) this._writeFile('/etc/cron.d/0hourly', '# Run the hourly jobs\nSHELL=/bin/bash\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n01 * * * * root run-parts /etc/cron.hourly\n');
        if (!this._node('/etc/anacrontab')) this._writeFile('/etc/anacrontab', '# /etc/anacrontab: configuration file for anacron\n\n# See anacron(8) and anacrontab(5) for details.\n\nSHELL=/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n# the maximal random delay added to the base delay of the jobs\nRANDOM_DELAY=45\n# the jobs will be started during the following hours only\nSTART_HOURS_RANGE=3-22\n\n#period in days   delay in minutes   job-identifier   command\n1\t5\tcron.daily\t\tnice run-parts /etc/cron.daily\n7\t25\tcron.weekly\t\tnice run-parts /etc/cron.weekly\n@monthly 45\tcron.monthly\t\tnice run-parts /etc/cron.monthly\n');
        if (!this._node('/etc/cron.deny')) this._writeFile('/etc/cron.deny', '', '0644');
        if (!this._node('/etc/at.deny')) this._writeFile('/etc/at.deny', '', '0644');
        if (!this._node('/etc/cron.hourly/0anacron')) this._writeFile('/etc/cron.hourly/0anacron', '#!/bin/sh\n# Skip execution unless the date has changed from the previous run\nif test -r /var/spool/anacron/cron.daily; then\n    day=`cat /var/spool/anacron/cron.daily`\nfi\nif [ `date +%Y%m%d` = "$day" ]; then\n    exit 0;\nfi\n/usr/sbin/anacron -s\n', '0755');
        if (!this._node('/var/log/cron')) this._writeFile('/var/log/cron', '', '0600');
        if (!this._node('/var/spool/mail/root')) this._writeFile('/var/spool/mail/root', '', '0660', 'root', 'mail');
        this._cronLog('crond', 'STARTUP'.length ? '(CRON) STARTUP (1.5.7)' : '');
        this._cronLog('crond', '(CRON) INFO (RANDOM_DELAY will be scaled with factor 36% if used.)');
        this._cronLog('crond', '(CRON) INFO (running with inotify support)');
    }

    _stamp(d) {
        const tm = this._tm();
        return tm ? tm.format(d, tm.tm.tz, '%b %e %H:%M:%S') : d.toString().slice(4, 15);
    }

    _cronLog(who, msg, pid) {
        const p = pid || (1000 + Math.floor(Math.random() * 8000));
        this._writeFile('/var/log/cron', `${this._stamp(this._now())} rhcsa-lab ${who}[${p}]: ${msg}\n`, '0600', 'root', 'root', true);
    }

    // ===== cron expression handling =====

    _fieldSet(text, min, max, names) {
        const set = new Set();
        for (const part of text.split(',')) {
            const m = /^(\*|[A-Za-z0-9]+(?:-[A-Za-z0-9]+)?)(?:\/(\d+))?$/.exec(part);
            if (!m) return null;
            const step = m[2] ? parseInt(m[2], 10) : 1;
            if (step < 1) return null;
            let lo, hi;
            const val = (s) => {
                if (/^\d+$/.test(s)) return parseInt(s, 10);
                if (names) { const i = names.indexOf(s.toLowerCase().slice(0, 3)); if (i >= 0) return i + (names.length === 12 ? 1 : 0); }
                return NaN;
            };
            if (m[1] === '*') { lo = min; hi = max; }
            else if (m[1].includes('-')) { const [a, b] = m[1].split('-'); lo = val(a); hi = val(b); }
            else { lo = val(m[1]); hi = m[2] ? max : lo; }
            if (Number.isNaN(lo) || Number.isNaN(hi) || lo < min || hi > max + (names && names.length === 7 ? 0 : 0) || lo > hi) {
                if (!(names && names.length === 7 && hi === 7)) return null;
            }
            for (let v = lo; v <= hi; v += step) set.add(v === 7 && names && names.length === 7 ? 0 : v);
        }
        return set;
    }

    // parse one crontab line. system=true means a user column is expected. Returns {error} or {env} or {job}
    parseLine(line, system) {
        const t = line.trim();
        if (!t || t.startsWith('#')) return { skip: true };
        let m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(t);
        if (m && !/^\s*[\d*@]/.test(t)) return { env: [m[1], m[2].replace(/^(["'])(.*)\1$/, '$2')] };
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const mons = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        let rest, spec;
        if (t.startsWith('@')) {
            const sp = t.split(/\s+/);
            const map = { '@reboot': 'reboot', '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' };
            if (!(sp[0] in map)) return { error: 'bad minute' };
            spec = map[sp[0]]; rest = sp.slice(1);
        } else {
            const sp = t.split(/\s+/);
            if (sp.length < 6) return { error: sp.length < 5 ? 'bad minute' : 'bad command' };
            spec = sp.slice(0, 5).join(' '); rest = sp.slice(5);
        }
        let fields = null;
        if (spec !== 'reboot') {
            const f = spec.split(' ');
            const names = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];
            const ranges = [[0, 59, null], [0, 23, null], [1, 31, null], [1, 12, mons], [0, 7, days]];
            fields = [];
            for (let i = 0; i < 5; i++) {
                const set = this._fieldSet(f[i], ranges[i][0], ranges[i][1], ranges[i][2]);
                if (!set) return { error: 'bad ' + names[i] };
                fields.push({ set, star: f[i].startsWith('*') });
            }
        }
        let user = null;
        if (system) {
            user = rest.shift();
            if (!user) return { error: 'bad username' };
            if (!this.fs.users[user]) return { error: 'bad username' };
        }
        if (!rest.length) return { error: 'bad command' };
        return { job: { fields, reboot: spec === 'reboot', user, cmd: rest.join(' ') } };
    }

    // validate a whole crontab text; returns array of "line N: message"
    validate(text, system) {
        const errs = [];
        text.split('\n').forEach((l, i) => { const r = this.parseLine(l, system); if (r.error) errs.push(`"crontab":${i + 1}: ${r.error}`); });
        return errs;
    }

    _matches(job, p) {
        const [mi, ho, dom, mo, dow] = job.fields;
        if (!mi.set.has(p.M) || !ho.set.has(p.H) || !mo.set.has(p.m)) return false;
        const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.wd);
        const domOk = dom.set.has(p.d), dowOk = dow.set.has(wd);
        if (dom.star || dow.star) return domOk && dowOk;
        return domOk || dowOk;
    }

    // ===== running commands (cron/at) =====

    runAs(user, code, env, cwd) {
        const t = typeof window !== 'undefined' ? window.terminal : null;
        const sh = t && t.getShell ? t.getShell() : null;
        if (!sh) return { out: '', err: '', code: 1 };
        const u = this.fs.users[user] || this.fs.users.root;
        const saved = { user: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid, cwd: this.fs.currentPath };
        const o = [], e = [];
        const io = { stdin: { text: '', pos: 0 }, out: (s) => { if (s) o.push(s); }, err: (s) => { if (s) e.push(s); }, piped: true };
        const savedIn = { interactive: sh.interactive };
        let rc = 0;
        this.fs.currentUser = user; this.fs.currentUid = u.uid; this.fs.currentGid = u.gid;
        this.fs.currentPath = cwd || u.home || '/';
        const envSaved = Object.assign({}, this.shared.env);
        Object.assign(this.shared.env, { HOME: u.home, LOGNAME: user, USER: user, SHELL: '/bin/sh', PATH: '/usr/bin:/bin' }, env || {});
        sh.interactive = false;
        const exitCodeBefore = this.shared.parent.lastExitCode;
        try { rc = sh.runScriptText(code, '/bin/sh', [], io); }
        catch (err) { e.push(String(err && err.message ? err.message : err) + '\n'); rc = 1; }
        finally {
            for (const k of Object.keys(this.shared.env)) delete this.shared.env[k];
            Object.assign(this.shared.env, envSaved);
            this.fs.currentUser = saved.user; this.fs.currentUid = saved.uid; this.fs.currentGid = saved.gid; this.fs.currentPath = saved.cwd;
            sh.interactive = savedIn.interactive;
            this.shared.parent.lastExitCode = exitCodeBefore;
        }
        return { out: o.join(''), err: e.join(''), code: rc };
    }

    _mail(to, subject, from, body) {
        const d = this._now();
        const tm = this._tm();
        const dateStr = tm ? tm.format(d, tm.tm.tz, '%a %b %e %H:%M:%S %Y') : d.toString();
        const hdr = tm ? tm.format(d, tm.tm.tz, '%a, %d %b %Y %H:%M:%S %z') : d.toUTCString();
        const msg = `From ${from}@rhcsa-lab.example.com  ${dateStr}\nReturn-Path: <${from}@rhcsa-lab.example.com>\nX-Original-To: ${to}\nDelivered-To: ${to}@rhcsa-lab.example.com\nReceived: by rhcsa-lab.example.com (Postfix, from userid ${this.fs.users[from] ? this.fs.users[from].uid : 0})\n\tid 4F2A9C1A5B; ${hdr}\nFrom: ${from}@rhcsa-lab.example.com (Cron Daemon)\nTo: ${to}@rhcsa-lab.example.com\nSubject: ${subject}\nContent-Type: text/plain; charset=UTF-8\nAuto-Submitted: auto-generated\nMessage-Id: <${Math.floor(d.getTime() / 1000)}.${Math.floor(Math.random() * 1e5)}@rhcsa-lab.example.com>\nDate: ${hdr}\n\n${body}${body.endsWith('\n') ? '' : '\n'}\n`;
        const target = this.fs.users[to] ? to : 'root';
        this._writeFile('/var/spool/mail/' + target, msg, '0660', target, 'mail', true);
    }

    runJob(job, env, user, label) {
        const home = (this.fs.users[user] || {}).home;
        const cmd = job.cmd.replace(/%/g, (m, off, s) => (s[off - 1] === '\\' ? '%' : '\n')).replace(/\\%/g, '%');
        const lines = cmd.split('\n');
        const code = lines[0] + (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '') ;
        const pid = 2000 + Math.floor(Math.random() * 6000);
        this._cronLog('CROND', `(${user}) CMD (${job.cmd})`, pid);
        const run = this.runAs(user, lines.length > 1 ? lines[0] : code, env, env.__cwd || home);
        const output = run.out + run.err;
        const mailto = Object.prototype.hasOwnProperty.call(env, 'MAILTO') ? env.MAILTO : user;
        if (output.trim() && mailto !== '') this._mail(mailto, `Cron <${user}@rhcsa-lab> ${job.cmd}`, user, output);
        return run;
    }

    // ===== the ticker =====

    _startTicker() {
        if (typeof window === 'undefined') return;
        if (window.__redcatSched) clearInterval(window.__redcatSched);
        window.__redcatSched = setInterval(() => { try { this.tick(); } catch (e) { /* the scheduler must never break the page */ } }, 1000);
    }

    _crontabs() {
        const list = [];
        const dir = this._node('/var/spool/cron');
        if (dir) for (const [user, n] of Object.entries(dir.children || {})) if (n.type === 'file' && this.fs.users[user]) list.push({ user, text: n.content || '', system: false });
        list.push({ user: null, text: (this._node('/etc/crontab') || {}).content || '', system: true, src: '/etc/crontab' });
        const cd = this._node('/etc/cron.d');
        if (cd) for (const [name, n] of Object.entries(cd.children || {})) if (n.type === 'file' && !name.startsWith('.')) list.push({ user: null, text: n.content || '', system: true, src: '/etc/cron.d/' + name });
        return list;
    }

    tick() {
        const now = this._now();
        const key = Math.floor(now.getTime() / 60000);
        const crond = this._svc('crond');
        const atd = this._svc('atd');
        // at jobs: due as soon as their time has passed
        if (atd && atd.active) {
            for (const j of this.atJobs.slice()) {
                if (j.when.getTime() <= now.getTime()) { this._runAt(j); this.atJobs = this.atJobs.filter(x => x !== j); this._syncAtFiles(); }
            }
        }
        if (this.lastMinute === null) this.lastMinute = key - 1;
        if (key === this.lastMinute) return;
        const from = Math.max(this.lastMinute + 1, key - 3);       // a clock jump replays at most a few minutes
        this.lastMinute = key;
        if (!crond || !crond.active) return;
        const tm = this._tm();
        for (let k = from; k <= key; k++) {
            const when = new Date(k * 60000);
            const p = tm ? tm.parts(when, tm.tm.tz) : null;
            if (!p) continue;
            for (const tab of this._crontabs()) {
                const env = { SHELL: tab.system ? '/bin/bash' : '/bin/sh' };
                tab.text.split('\n').forEach((line) => {
                    const r = this.parseLine(line, tab.system);
                    if (r.env) { env[r.env[0]] = r.env[1]; return; }
                    if (!r.job || r.job.reboot) return;
                    if (!this._matches(r.job, p)) return;
                    const user = tab.system ? r.job.user : tab.user;
                    const e2 = Object.assign({}, env);
                    if (e2.SHELL === '/bin/bash') { /* bash features available */ }
                    this.runJob(r.job, e2, user);
                });
            }
            this._anacron(when, p);
        }
    }

    _anacron(when, p) {
        // a stand-in for crond + anacron: daily/weekly/monthly run scripts once per period after 03:05
        if (p.H < 3 || (p.H === 3 && p.M < 5)) return;
        const keyDay = `${p.Y}${String(p.m).padStart(2, '0')}${String(p.d).padStart(2, '0')}`;
        const jobs = [['cron.daily', 1], ['cron.weekly', 7], ['cron.monthly', 30]];
        for (const [name, period] of jobs) {
            const stampNode = this._node('/var/spool/anacron/' + name);
            const last = stampNode ? (stampNode.content || '').trim() : '';
            let due = !last;
            if (last) {
                const ly = parseInt(last.slice(0, 4), 10), lm = parseInt(last.slice(4, 6), 10), ld = parseInt(last.slice(6, 8), 10);
                due = (Date.UTC(p.Y, p.m - 1, p.d) - Date.UTC(ly, lm - 1, ld)) / 86400000 >= period;
            }
            if (!due) continue;
            this._writeFile('/var/spool/anacron/' + name, keyDay + '\n', '0600');
            this._cronLog('anacron', `Job \`${name}' started`);
            const r = this.runParts('/etc/' + name, 'root');
            this._cronLog('anacron', `Job \`${name}' terminated`);
            if (r.trim()) this._mail('root', `Anacron job '${name}' on rhcsa-lab`, 'root', r);
        }
    }

    runParts(dir, user) {
        const d = this._node(dir);
        if (!d || d.type !== 'directory') return '';
        let out = '';
        for (const name of Object.keys(d.children).sort()) {
            const n = d.children[name];
            if (n.type !== 'file' || name.startsWith('.') || !/[1357]/.test((n.permissions || '0644').slice(-3)) || !/^[A-Za-z0-9_-]+$/.test(name)) continue;
            const r = this.runAs(user || 'root', dir + '/' + name, {});
            out += r.out + r.err;
        }
        return out;
    }

    'run-parts'(args) {
        const dirs = args.filter(a => !a.startsWith('-'));
        if (!dirs.length) return this._err('Usage: run-parts [OPTION]... DIRECTORY', 1);
        const d = this._node(dirs[0]);
        if (!d) return this._err(`run-parts: failed to open directory ${dirs[0]}: No such file or directory`, 1);
        if (args.includes('--test')) {
            const names = Object.keys(d.children).sort().filter(n => d.children[n].type === 'file' && /[1357]/.test((d.children[n].permissions || '0644').slice(-3)));
            return this._ok(names.map(n => dirs[0].replace(/\/$/, '') + '/' + n).join('\n'));
        }
        const out = this.runParts(dirs[0], this.fs.currentUser);
        return { stdout: out.replace(/\n$/, ''), rawStdout: out, stderr: '', exitCode: 0 };
    }

    anacron(args) {
        if (!this._isRoot()) return this._err('anacron: Operation not permitted', 1);
        if (args.includes('-T')) return this._ok('');
        const force = args.includes('-f');
        const now = this._now();
        const tm = this._tm();
        const p = tm.parts(now, tm.tm.tz);
        const keyDay = `${p.Y}${String(p.m).padStart(2, '0')}${String(p.d).padStart(2, '0')}`;
        const out = [];
        for (const name of ['cron.daily', 'cron.weekly', 'cron.monthly']) {
            const stamp = this._node('/var/spool/anacron/' + name);
            if (!force && stamp && (stamp.content || '').trim() === keyDay) continue;
            this._writeFile('/var/spool/anacron/' + name, keyDay + '\n', '0600');
            this._cronLog('anacron', `Job \`${name}' started`);
            const r = this.runParts('/etc/' + name, 'root');
            this._cronLog('anacron', `Job \`${name}' terminated`);
            out.push(`Anacron started on ${tm.format(now, tm.tm.tz, '%Y-%m-%d')}`);
            if (r.trim()) this._mail('root', `Anacron job '${name}' on rhcsa-lab`, 'root', r);
        }
        return this._ok(out.join('\n'));
    }

    // ===== crontab =====

    _cronAllowed(user) {
        const allow = this._node('/etc/cron.allow');
        const deny = this._node('/etc/cron.deny');
        const has = (n) => (n.content || '').split('\n').map(x => x.trim()).includes(user);
        if (user === 'root') return true;
        if (allow) return has(allow);
        if (deny) return !has(deny);
        return false;
    }

    crontab(args, stdin = '') {
        let target = this.fs.currentUser;
        let action = null, file = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-u') target = args[++i];
            else if (a.startsWith('-u') && a.length > 2) target = a.slice(2);
            else if (a === '-l') action = 'l'; else if (a === '-e') action = 'e'; else if (a === '-r') action = 'r'; else if (a === '-i') { /* prompt on -r: skipped */ }
            else if (a === '-n' || a === '-s' || a === '-c' || a === '-x') { /* accepted */ }
            else if (a.startsWith('-') && a !== '-') return this._err(`crontab: invalid option -- '${a.replace(/^-+/, '')}'\ncrontab: usage error: unrecognized option\nusage:\tcrontab [-u user] file\n\tcrontab [-u user] [ -e | -l | -r ]\n\t\t(default operation is replace, per 1003.2)\n\t-e\t(edit user's crontab)\n\t-l\t(list user's crontab)\n\t-r\t(delete user's crontab)\n\t-i\t(prompt before deleting user's crontab)\n\t-n\t(reload crontab file)\n\t-s\t(selinux context)\n\t-x\t(enable debugging)`, 1);
            else file = a;
        }
        if (target !== this.fs.currentUser && !this._isRoot()) return this._err(`must be privileged to use -u`, 1);
        if (!this.fs.users[target]) return this._err(`crontab: user \`${target}' unknown`, 1);
        if (!this._cronAllowed(this.fs.currentUser)) return this._err(`You (${this.fs.currentUser}) are not allowed to use this program (crontab)\nSee crontab(1) for more information`, 1);
        const path = '/var/spool/cron/' + target;
        const node = this._node(path);
        if (action === 'l') {
            if (!node) return this._err(`no crontab for ${target}`, 1);
            this._cronLog('crontab', `(${target}) LIST (${target})`);
            return { stdout: (node.content || '').replace(/\n$/, ''), rawStdout: node.content || '', stderr: '', exitCode: 0 };
        }
        if (action === 'r') {
            if (!node) return this._err(`no crontab for ${target}`, 1);
            const dir = this._node('/var/spool/cron'); delete dir.children[target];
            this._cronLog('crontab', `(${target}) DELETE (${target})`);
            return this._ok('');
        }
        const install = (text) => {
            const errs = this.validate(text, false);
            if (errs.length) return this._err(errs.join('\n') + "\ncrontab: errors in crontab file, can't install.", 1);
            const grp = target;
            this._writeFile(path, text.endsWith('\n') || !text ? text : text + '\n', '0600', target, grp);
            this._cronLog('crontab', `(${target}) ${node ? 'REPLACE' : 'REPLACE'} (${target})`);
            const crond = this._svc('crond');
            if (crond && crond.active) this._cronLog('crond', `(${target}) RELOAD (/var/spool/cron/${target})`);
            return this._ok('');
        };
        if (action === 'e') {
            const t = typeof window !== 'undefined' ? window.terminal : null;
            if (!t) return this._err('crontab: no editor available', 1);
            const tmpName = `/tmp/crontab.${Math.random().toString(36).slice(2, 8)}`;
            const original = node ? node.content || '' : '';
            this._writeFile(tmpName, original, '0600', this.fs.currentUser, this.fs.currentUser);
            this._cronLog('crontab', `(${target}) BEGIN EDIT (${target})`);
            t.afterEditor = () => {
                const edited = this._node(tmpName);
                const text = edited ? edited.content || '' : '';
                const parent = this._node('/tmp'); if (parent) delete parent.children[tmpName.split('/').pop()];
                const out = (cls, msg) => t.addOutput(`<span class="${cls}">${t.escapeHtml(msg)}</span>`);
                if (text === original) { out('info', 'crontab: no changes made to crontab'); return; }
                const r = install(text);
                if (r.exitCode) { out('error', r.stderr.replace(/^crontab: /gm, '')); out('error', 'crontab: edits discarded'); }
                else { out('info', 'crontab: installing new crontab'); this._cronLog('crontab', `(${target}) END EDIT (${target})`); }
            };
            const opener = (typeof window !== 'undefined' && window.terminal) ? window.terminal : null;
            opener.openEditor(this.shared.env.EDITOR && /nano/.test(this.shared.env.EDITOR) ? 'nano' : 'vim', tmpName, original);
            return { stdout: '', stderr: '', exitCode: 0 };
        }
        // crontab file  /  crontab -
        let text;
        if (file && file !== '-') {
            const n = this._node(file);
            if (!n) return this._err(`crontab: ${file}: No such file or directory`, 1);
            text = n.content || '';
        } else if (file === '-' || stdin || this.shared.parent._hasStdin) {
            text = stdin || '';
        } else {
            return this._err('crontab: usage error: file name must be specified for replace\nusage:\tcrontab [-u user] file\n\tcrontab [-u user] [ -e | -l | -r ]', 1);
        }
        return install(text);
    }

    // ===== at / atd =====

    _parseAtTime(words) {
        const tm = this._tm();
        const now = this._now();
        const tz = tm.tm.tz;
        const s = words.join(' ').toLowerCase().trim();
        if (!s) return null;
        const base = tm.parts(now, tz);
        let m;
        const addUnits = (d, n, unit) => {
            const ms = { minute: 60000, minutes: 60000, min: 60000, mins: 60000, hour: 3600000, hours: 3600000, day: 86400000, days: 86400000, week: 604800000, weeks: 604800000 }[unit];
            if (ms) return new Date(d.getTime() + n * ms);
            if (/^months?$/.test(unit)) return tm.fromLocal(base.Y, base.m + n, base.d, base.H, base.M, 0, tz);
            if (/^years?$/.test(unit)) return tm.fromLocal(base.Y + n, base.m, base.d, base.H, base.M, 0, tz);
            return null;
        };
        if ((m = /^now(?:\s*\+\s*(\d+)\s*(minutes?|mins?|hours?|days?|weeks?|months?|years?))?$/.exec(s))) {
            const d = new Date(Math.floor(now.getTime() / 60000) * 60000);
            return m[1] ? addUnits(d, parseInt(m[1], 10), m[2]) : d;
        }
        // time of day [date]
        let timePart = null, rest = s;
        const tmatch = /^(noon|midnight|teatime|(\d{1,2}):(\d{2})\s*(am|pm)?|(\d{1,2})\s*(am|pm)|(\d{4}))(?:\s+(.*))?$/.exec(s);
        if (tmatch) {
            let H, M = 0;
            if (tmatch[1] === 'noon') H = 12; else if (tmatch[1] === 'midnight') H = 0; else if (tmatch[1] === 'teatime') H = 16;
            else if (tmatch[2] !== undefined) { H = parseInt(tmatch[2], 10); M = parseInt(tmatch[3], 10); if (tmatch[4] === 'pm' && H < 12) H += 12; if (tmatch[4] === 'am' && H === 12) H = 0; }
            else if (tmatch[5] !== undefined) { H = parseInt(tmatch[5], 10); if (tmatch[6] === 'pm' && H < 12) H += 12; if (tmatch[6] === 'am' && H === 12) H = 0; }
            else { H = parseInt(tmatch[7].slice(0, 2), 10); M = parseInt(tmatch[7].slice(2), 10); }
            if (H > 23 || M > 59) return null;
            timePart = { H, M };
            rest = (tmatch[8] || '').trim();
        } else if (/^(today|tomorrow)$/.test(s) || /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(\s+\d{4})?|(mon|tue|wed|thu|fri|sat|sun)[a-z]*)$/.test(s)) {
            timePart = { H: base.H, M: base.M };
            rest = s;
        } else return null;
        let y = base.Y, mo = base.m, d = base.d;
        let dateGiven = false;
        let rel = null;
        if (rest) {
            if ((m = /^\+\s*(\d+)\s*(minutes?|mins?|hours?|days?|weeks?|months?|years?)$/.exec(rest))) { rel = [parseInt(m[1], 10), m[2]]; }
            else if (rest === 'today') dateGiven = true;
            else if (rest === 'tomorrow') { const t2 = new Date(now.getTime() + 86400000); const p2 = tm.parts(t2, tz); y = p2.Y; mo = p2.m; d = p2.d; dateGiven = true; }
            else if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rest))) { y = +m[1]; mo = +m[2]; d = +m[3]; dateGiven = true; }
            else if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(rest))) { mo = +m[1]; d = +m[2]; y = +m[3]; dateGiven = true; }
            else if ((m = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:\s+(\d{4}))?$/.exec(rest))) { mo = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(m[1]) + 1; d = +m[2]; if (m[3]) y = +m[3]; else if (mo < base.m || (mo === base.m && d < base.d)) y++; dateGiven = true; }
            else if ((m = /^(sun|mon|tue|wed|thu|fri|sat)[a-z]*$/.exec(rest))) { const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; const cur = names.indexOf(base.wd.toLowerCase().slice(0, 3)); let diff = (names.indexOf(m[1]) - cur + 7) % 7; if (diff === 0) diff = 7; const t2 = new Date(now.getTime() + diff * 86400000); const p2 = tm.parts(t2, tz); y = p2.Y; mo = p2.m; d = p2.d; dateGiven = true; }
            else return null;
        }
        let when = tm.fromLocal(y, mo, d, timePart.H, timePart.M, 0, tz);
        if (rel) when = addUnits(when, rel[0], rel[1]);
        else if (!dateGiven && when.getTime() <= now.getTime() && !rest) when = new Date(when.getTime() + 86400000);
        return when;
    }

    _syncAtFiles() {
        const dir = this._node('/var/spool/at');
        if (!dir) return;
        for (const k of Object.keys(dir.children)) if (/^a\d/.test(k)) delete dir.children[k];
        for (const j of this.atJobs) {
            const id = `a${String(j.id).padStart(5, '0')}${Math.floor(j.when.getTime() / 60000).toString(16).padStart(8, '0')}`;
            dir.children[id] = { type: 'file', permissions: '0700', owner: j.user, group: j.user, size: j.text.length, modified: new Date(), content: j.script };
        }
    }

    _atAllowed(user) {
        if (user === 'root') return true;
        const allow = this._node('/etc/at.allow'), deny = this._node('/etc/at.deny');
        const has = (n) => (n.content || '').split('\n').map(x => x.trim()).includes(user);
        if (allow) return has(allow);
        if (deny) return !has(deny);
        return false;
    }

    at(args, stdin = '') {
        const mode = args[0] && args[0].startsWith('-') ? args[0] : null;
        if (mode === '-l') return this.atq([]);
        if (mode === '-d') return this.atrm(args.slice(1));
        if (mode === '-c') return this._atShow(args[1]);
        if (mode === '-V') return this._err('at version 3.2.1', 0);
        if (!this._atAllowed(this.fs.currentUser)) return this._err(`You do not have permission to use at.`, 1);
        let file = null, queue = 'a';
        const words = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-f') file = args[++i]; else if (a === '-q') queue = args[++i]; else if (a === '-m' || a === '-M' || a === '-v') { /* accepted */ }
            else if (a.startsWith('-') && a.length > 1 && !/^-\d/.test(a)) return this._err(`Usage: at [-V] [-q x] [-f file] [-mMlbv] timespec ...\n       at [-V] [-q x] [-f file] [-mMlbv] -t time\n       at -c job ...\n       atq [-V] [-q x]\n       atrm [-V] job ...\n       batch`, 1);
            else words.push(a);
        }
        if (!words.length) return this._err('Garbled time', 1);
        let script;
        if (file) {
            const n = this._node(file);
            if (!n) return this._err(`${file}: No such file or directory\nCannot open input file`, 1);
            script = n.content || '';
        } else if (stdin || this.shared.parent._hasStdin) script = stdin;
        else {
            const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell && window.terminal.getShell();
            const typed = sh ? sh.takeInput({ mode: 'eof', prompt: 'at> ' }) : null;
            if (typed === null) return this._err('at: no commands given (pipe them in, e.g. echo cmd | at now + 1 minute)', 1);
            script = typed;
        }
        if (!script.trim()) return this._err('at: no commands given', 1);
        const when = this._parseAtTime(words);
        if (!when) return this._err('Garbled time', 1);
        const now = this._now();
        if (when.getTime() < now.getTime() - 1000) return this._err('at: refusing to create job destined in the past', 1);
        const id = ++this.atSerial;
        const tm = this._tm();
        const job = { id, when, user: this.fs.currentUser, text: script, queue, script: `#!/bin/sh\n# atrun uid=${this.fs.users[this.fs.currentUser].uid} gid=${this.fs.users[this.fs.currentUser].gid}\n# mail ${this.fs.currentUser} 0\numask 22\ncd ${this.fs.currentPath} || {\n\t echo 'Execution directory inaccessible' >&2\n\t exit 1\n}\n${script}` };
        this.atJobs.push(job);
        this._syncAtFiles();
        const atd = this._svc('atd');
        const warn = atd && atd.active ? '' : "Can't open /var/run/atd.pid to signal atd. No atd running?\n";
        return this._err(`${warn}warning: commands will be executed using /bin/sh\njob ${id} at ${tm.format(when, tm.tm.tz, '%a %b %e %H:%M:%S %Y')}`, 0);
    }

    batch(args, stdin = '') { return this.at(['now', ...args], stdin); }

    atq(args) {
        const tm = this._tm();
        const mine = this._isRoot() ? this.atJobs : this.atJobs.filter(j => j.user === this.fs.currentUser);
        const lines = mine.slice().sort((a, b) => a.when - b.when).map(j => `${j.id}\t${tm.format(j.when, tm.tm.tz, '%a %b %e %H:%M:%S %Y')} ${j.queue} ${j.user}`);
        return this._ok(lines.join('\n'));
    }

    atrm(args) {
        if (!args.length) return this._err('Usage: atrm [-V] job ...', 1);
        const errs = [];
        for (const a of args) {
            const id = parseInt(a, 10);
            const j = this.atJobs.find(x => x.id === id);
            if (!j || (!this._isRoot() && j.user !== this.fs.currentUser)) { errs.push(`Cannot find jobid ${a}`); continue; }
            this.atJobs = this.atJobs.filter(x => x !== j);
        }
        this._syncAtFiles();
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    _atShow(idStr) {
        const j = this.atJobs.find(x => x.id === parseInt(idStr, 10));
        if (!j) return this._err(`Cannot find jobid ${idStr}`, 1);
        return this._ok(j.script);
    }

    _runAt(j) {
        const r = this.runAs(j.user, j.text, {}, null);
        const out = r.out + r.err;
        if (out.trim()) this._mail(j.user, `Output from your job ${String(j.id).padStart(8, ' ')}`, j.user, out);
        this._writeFile('/var/log/cron', `${this._stamp(this._now())} rhcsa-lab atd[${900 + j.id}]: (${j.user}) JOB ${j.id} DONE\n`, '0600', 'root', 'root', true);
    }

    // ===== mail (read the mbox) =====

    mail(args, stdin = '') {
        let subject = '';
        const rcpt = [];
        for (let i = 0; i < args.length; i++) { if (args[i] === '-s') subject = args[++i]; else if (!args[i].startsWith('-')) rcpt.push(args[i]); }
        if (rcpt.length) {
            const body = stdin || '';
            if (!body && !this.shared.parent._hasStdin) return this._err('mail: sending needs a message body (e.g. echo text | mail -s subject user)', 1);
            for (const r of rcpt) {
                const to = r.split('@')[0];
                if (!this.fs.users[to]) return this._err(`${r}... User unknown`, 1);
                this._mail(to, subject || '(no subject)', this.fs.currentUser, body);
            }
            return this._ok('');
        }
        const box = this._node('/var/spool/mail/' + this.fs.currentUser);
        const text = box ? box.content || '' : '';
        const msgs = text.split(/^From /m).filter(Boolean);
        if (!msgs.length) return this._err('No mail for ' + this.fs.currentUser, 1);
        const lines = [`Heirloom Mail version 12.5 7/5/10.  Type ? for help.\n"/var/spool/mail/${this.fs.currentUser}": ${msgs.length} message${msgs.length > 1 ? 's' : ''} ${msgs.length} new`];
        msgs.forEach((m, i) => {
            const from = (/^(\S+)\s+(.*)$/m.exec(m) || [])[1] || 'root@rhcsa-lab.example.com';
            const date = (/^\S+\s+(.*)$/m.exec(m) || [])[1] || '';
            const subj = (/^Subject: (.*)$/m.exec(m) || [])[1] || '';
            const size = m.length;
            lines.push(`${i === msgs.length - 1 ? '>' : ' '}N ${String(i + 1).padStart(2)} ${from.padEnd(22).slice(0, 22)} ${date.slice(0, 16)} ${String(m.split('\n').length).padStart(3)}/${String(size).padEnd(5)} "${subj}"`);
        });
        return this._ok(lines.join('\n'));
    }
}

if (typeof window !== 'undefined') {
    window.SchedulerCommands = SchedulerCommands;
}
