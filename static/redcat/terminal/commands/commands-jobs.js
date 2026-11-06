// Job control: cmd &, jobs, fg, bg, wait, disown, nohup, kill %n, Ctrl+Z / Ctrl+C on a foreground sleep
// Part of Red Cat RHCSA Terminal Simulator
//
// A background command gets a job number and a real entry in the process table, so ps, top, pgrep, pkill and
// kill all see it. `sleep` and the other long-running commands stay alive until their time is up (or they are
// killed); short commands run at once and are reported as Done at the next prompt, the way bash does.

class JobEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.jobEngine = this;
        this.table = [];          // jobs of the current shell
        this.orphans = [];        // disowned processes that still have to finish
        this.notes = [];          // { kind: 'out' | 'status', text }
        this.touch = 0;
        this.nextPid = 5200;
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    get parent() { return this.shared.parent; }
    _sh() { return typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _ms() { return this._now().getTime(); }
    _emit(text) { const io = this.parent._curIo; if (io && text) io.out(text); }
    _isRoot() { return this.fs.currentUid === 0; }

    _pid() { const sv = this.shared.svc; return sv && typeof sv.svNextPid === 'number' ? sv.svNextPid++ : this.nextPid++; }
    _shellPid() {
        const c = this.shared.ctrSession;
        if (c && c.active) return c.shellPid;
        return 1201;
    }
    _hhmm() { const sv = this.shared.svc; return sv && sv._hhmm ? sv._hhmm(this._now()) : '00:00'; }

    // The shell this engine belonged to is gone (page reloaded or machine rebooted): its jobs end,
    // nohup'd and disowned ones keep running unless the whole machine restarted.
    endSession(rebooted) {
        for (const j of this.table) {
            if (j.nohup && !rebooted && j.pid) this.orphans.push({ pid: j.pid, end: j.end });
            else if (j.pid) this._dropProc(j.pid);
        }
        this.table.length = 0;
        this.notes.length = 0;
        if (rebooted) { for (const o of this.orphans) this._dropProc(o.pid); this.orphans.length = 0; }
    }

    // ===== classifying what was started =====
    _peel(t) {
        let s = t.trim(), prev;
        do {
            prev = s;
            s = s.replace(/^(?:nohup|time|setsid|exec)\s+/, '')
                .replace(/^nice(?:\s+-n\s*-?\d+|\s+-\d+)?\s+/, '')
                .replace(/^stdbuf(?:\s+-[ioe]\w+)*\s+/, '')
                .replace(/^env(?:\s+\w+=\S*)*\s+/, '')
                .replace(/^\w+=\S*\s+(?=\S)/, '');
        } while (s !== prev);
        return s;
    }

    _stripRedir(s) { return s.replace(/\s*(?:&>>?|\d*(?:>>|>&|>|<))\s*&?\S+/g, ''); }

    _firstCmd(s) {
        let x = s.replace(/^[({]\s*/, '');
        x = x.split(/\s*(?:;|&&|\|\||\||\))\s*/)[0] || '';
        return this._stripRedir(x).trim();
    }

    _secs(spec) {
        let total = 0;
        for (const tok of spec.trim().split(/\s+/)) {
            const m = /^(\d+(?:\.\d+)?)([smhd]?)$/.exec(tok);
            if (!m) continue;
            total += parseFloat(m[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[m[2] || 's']);
        }
        return total;
    }

    _classify(text) {
        const clean = text.replace(/&\s*$/, '').trim();
        const s = this._peel(clean);
        const first = this._firstCmd(s);
        const w = first.split(/\s+/);
        const name = (w[0] || '').split('/').pop();
        const args = w.slice(1);
        const C = { kind: 'instant', secs: 0, cpu: 0, shown: first || clean, stop: null, composite: false };
        const noRedir = this._stripRedir(s);
        C.composite = /[;|&(){}\n]/.test(noRedir);
        // endless shell loops
        if (/^\s*[({]?\s*(?:while|until)\s+(?:true|:|\[\s*1\s*\]|\(\(\s*1\s*\)\))\s*[;\n]/.test(s) || /^\s*[({]?\s*for\s*\(\(\s*;\s*;\s*\)\)/.test(s)) {
            return Object.assign(C, { kind: 'long', secs: 0, shown: '-bash', composite: false, loop: true });
        }
        const sl = [...s.matchAll(/(?:^|[;&|({]|&&|\|\|)\s*sleep\s+((?:\d+(?:\.\d+)?[smhd]?\s*)+)/g)];
        if (sl.length) {
            const total = sl.reduce((t, m) => t + this._secs(m[1]), 0);
            return Object.assign(C, { kind: 'long', secs: total, shown: 'sleep ' + sl[0][1].trim() });
        }
        const has = (re) => args.some(a => re.test(a));
        const zero = args.some(a => /\/dev\/(zero|urandom|random)/.test(a));
        const forever = (cpu) => Object.assign(C, { kind: 'long', secs: 0, cpu: cpu || 0 });
        switch (name) {
            case 'ping': if (!has(/^-[a-zA-Z]*[cw]/)) return forever(0); break;
            case 'tail': if (has(/^(-[a-zA-Z]*[fF]|--follow.*)$/)) return forever(0); break;
            case 'yes': return forever(97.5);
            case 'stress': case 'stress-ng': return forever(99.0);
            case 'watch': return Object.assign(C, { stop: 'Stopped (tty output)', kind: 'long' });
            case 'dd': if (args.some(a => /^if=\/dev\/(zero|urandom|random)$/.test(a)) && !args.some(a => /^count=/.test(a))) return forever(98.4); break;
            case 'cat': if (zero) return forever(30.0); if (!args.filter(a => !a.startsWith('-')).length && !/<\s*\S+/.test(clean)) return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' }); break;
            case 'md5sum': case 'sha1sum': case 'sha256sum': case 'sha512sum': case 'gzip': case 'xz': case 'bzip2': case 'openssl': if (zero || (name === 'openssl' && args[0] === 'speed')) return forever(99.0); break;
            case 'python3': case 'python': if (args[0] === '-m' && /http\.server|SimpleHTTPServer/.test(args[1] || '')) { const port = parseInt(args[2] && /^\d+$/.test(args[2]) ? args[2] : '8000', 10); C.listen = { port, proto: 'tcp', comm: 'python3' }; C.startMsg = `Serving HTTP on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/) ...`; return forever(0); } if (!args.length) return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' }); break;
            case 'nc': case 'ncat': if (has(/^-[a-zA-Z]*l/)) { const nums = args.filter(a => /^\d+$/.test(a)); C.listen = { port: parseInt(nums[nums.length - 1] || '31337', 10), proto: has(/^-[a-zA-Z]*u/) ? 'udp' : 'tcp', comm: name === 'nc' ? 'nc' : 'ncat' }; return forever(0); } break;
            case 'sshd': if (has(/^-D$/)) return forever(0); break;
            case 'httpd': if (has(/^-X$/)) return forever(0); break;
            case 'read': case 'mysql': case 'mariadb': case 'psql': case 'su': case 'passwd': case 'ftp': case 'telnet': return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' });
            case 'bash': case 'sh': if (!args.length) return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' }); break;
            case 'sudo': if (!has(/^-[a-zA-Z]*n/)) return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' }); break;
            case 'dnf': case 'yum': if (!has(/^(-y|--assumeyes|--assumeno)$/) && args.some(a => /^(install|remove|erase|upgrade|update|reinstall|autoremove|downgrade|group|history|module)$/.test(a))) return Object.assign(C, { stop: 'Stopped (tty input)', kind: 'long' }); break;
            case 'vi': case 'vim': case 'nano': case 'less': case 'more': case 'man': case 'top': case 'htop': case 'emacs': return Object.assign(C, { stop: 'Stopped (tty output)', kind: 'long' });
            default: break;
        }
        return C;
    }

    // ===== table management =====
    _newId() { return this.table.length ? Math.max(...this.table.map(j => j.id)) + 1 : 1; }

    _addProc(job, C) {
        const P = this.shared.processes;
        const first = (C.shown || job.text).trim();
        const comm = (first.replace(/^-/, '').split(/\s+/)[0] || 'bash').split('/').pop().slice(0, 15);
        P.push({ pid: job.pid, ppid: this._shellPid(), user: this.fs.currentUser, cpu: C.cpu || 0.0, mem: C.cpu > 90 ? 0.0 : 0.1, tty: 'pts/0', stat: job.state.startsWith('Stopped') ? 'T' : (C.cpu > 90 ? 'R' : 'S'), ni: 0, command: first, comm, time: '00:00:00', start: this._hhmm(), service: null, domain: 'unconfined_t', job: job.id, listen: C.listen ? Object.assign({}, C.listen) : undefined });
        if (typeof this.shared.svc._svSort === 'function') this.shared.svc._svSort();
    }

    _proc(job) { return job.pid ? this.shared.processes.find(x => x.pid === job.pid && x.job === job.id) : null; }
    _dropProc(pid) { const P = this.shared.processes; const i = P.findIndex(x => x.pid === pid); if (i >= 0) P.splice(i, 1); }

    _alive(j) { return j.state === 'Running' || j.state.startsWith('Stopped'); }
    _prio() {
        const o = this.table.filter(j => this._alive(j)).sort((a, b) => b.touch - a.touch);
        return o.filter(j => j.state.startsWith('Stopped')).concat(o.filter(j => !j.state.startsWith('Stopped')));
    }
    _mark(j) { const l = this._prio(); const i = l.indexOf(j); return i === 0 ? '+' : i === 1 ? '-' : ' '; }

    _line(j, longFmt, withAmp) {
        const label = j.state;
        const pid = longFmt ? j.pid + ' ' : '';
        return `[${j.id}]${this._mark(j)}  ${pid}${label.padEnd(24)}${j.text}${withAmp && j.state === 'Running' ? ' &' : ''}`;
    }

    _resolve(spec) {
        const alive = this.table.filter(j => this._alive(j));
        const prio = this._prio();
        if (spec === undefined || spec === '%%' || spec === '%+' || spec === '%') return prio[0] || null;
        if (spec === '%-') return prio[1] || null;
        let m = /^%?(\d+)$/.exec(spec);
        if (m) return this.table.find(j => j.id === parseInt(m[1], 10) && (this._alive(j) || j.pending)) || null;
        m = /^%\?(.+)$/.exec(spec);
        if (m) return alive.find(j => j.text.includes(m[1])) || null;
        m = /^%(.+)$/.exec(spec);
        if (m) return alive.find(j => j.text.startsWith(m[1])) || null;
        return null;
    }

    // ===== starting jobs (called by the shell for `cmd &`) =====
    _jobStart(textIn, run, io) {
        const text = textIn.replace(/&\s*$/, '').trim();
        if (!text) return false;
        const C = this._classify(text);
        const id = this._newId();
        const nohup = /^\s*nohup\b/.test(text);
        const job = { id, pid: 0, text, state: 'Running', code: 0, touch: ++this.touch, end: null, exec: null, pending: false, lastSig: 0, nohup, tty: C.stop };
        if (C.kind === 'instant') {
            job.pid = this._pid();
            io.out(`[${id}] ${job.pid}\n`);
            let rc = 0;
            this.table.push(job);
            try { rc = run(); } catch (e) { if (e && e.constructor && e.constructor.name === 'NeedInput') { this.table.splice(this.table.indexOf(job), 1); throw e; } throw e; }
            job.code = rc || 0;
            job.state = rc ? `Exit ${rc}` : 'Done';
            job.pending = true;
            return job.pid;
        }
        job.pid = this._pid();
        if (C.listen && this.shared.apps && this.shared.apps._bindFail) {
            const f = this.shared.apps._bindFail(C.listen.port, C.listen.proto, C.listen.comm);
            if (f) {
                io.out(`[${id}] ${job.pid}\n`);
                io.err(f + '\n');
                job.state = 'Exit 1'; job.code = 1; job.pending = true; job.pid = 0;
                this.table.push(job);
                return job.pid || 1;
            }
        }
        if (C.stop) {
            job.state = C.stop;
        } else if (C.secs > 0) {
            job.end = this._ms() + C.secs * 1000;
            if (C.composite) job.exec = () => this._runDeferred(text);
        }
        this.table.push(job);
        this._addProc(job, C);
        io.out(`[${id}] ${job.pid}\n`);
        if (C.startMsg) io.out(C.startMsg + '\n');
        if (nohup && !/>/.test(text)) {
            io.err("nohup: ignoring input and appending output to 'nohup.out'\n");
            this._touchFile('nohup.out');
        }
        if (C.stop) { job.pending = true; }
        return job.pid;
    }

    _touchFile(name) {
        const path = this.fs.resolvePath(name);
        if (this.fs.getNode(path)) return;
        const dir = this.fs.getNode(path.replace(/\/[^/]*$/, '') || '/');
        if (dir && dir.children) dir.children[path.split('/').pop()] = { type: 'file', permissions: '0600', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: '' };
    }

    _runDeferred(text) {
        const sh = this._sh();
        const out = [];
        let rc = 0;
        if (!sh) return { rc: 0, out: '' };
        const io = { stdin: { text: '', pos: 0 }, out: (s) => { if (s) out.push(s); }, err: (s) => { if (s) out.push(s); }, piped: false, hasStdin: false };
        const wasInteractive = sh.interactive;
        sh.interactive = false;
        try { rc = sh.runScriptText(text.replace(/&\s*$/, ''), 'bash', [], io); } catch (e) { rc = 1; } finally { sh.interactive = wasInteractive; }
        return { rc: rc || 0, out: out.join('') };
    }

    // ===== reaping =====
    _sigLabel(sig) {
        return { 1: 'Hangup', 2: 'Interrupt', 3: 'Quit', 6: 'Aborted', 9: 'Killed', 10: 'User defined signal 1', 12: 'User defined signal 2', 13: 'Broken pipe', 14: 'Alarm clock', 15: 'Terminated' }[sig] || 'Terminated';
    }

    _complete(j, p) {
        if (p) this._dropProc(p.pid);
        let rc = 0;
        if (j.exec) { const r = j.exec(); rc = r.rc; if (r.out) this.notes.push({ kind: 'out', text: r.out }); }
        j.code = rc;
        j.state = rc ? `Exit ${rc}` : 'Done';
        j.pending = true;
    }

    _jobReap() {
        const now = this._ms();
        for (const j of this.table) {
            if (!this._alive(j)) continue;
            const p = this._proc(j);
            if (!p) { j.state = this._sigLabel(j.lastSig || 15); j.code = 128 + (j.lastSig || 15); j.pending = true; continue; }
            if (j.state === 'Running' && j.end !== null && now >= j.end) this._complete(j, p);
        }
        for (let i = this.orphans.length - 1; i >= 0; i--) {
            const o = this.orphans[i];
            if (!this.shared.processes.find(x => x.pid === o.pid)) { this.orphans.splice(i, 1); continue; }
            if (o.end !== null && now >= o.end) { this._dropProc(o.pid); this.orphans.splice(i, 1); }
        }
    }

    // text for the status lines bash prints before the next prompt
    _jobNotices() {
        const lines = [];
        for (const j of this.table.slice()) {
            if (!j.pending) continue;
            j.pending = false;
            lines.push(this._line(j, false, false));
            if (!this._alive(j)) this.table.splice(this.table.indexOf(j), 1);
        }
        return lines.join('\n');
    }

    _jobOutput() {
        const out = [];
        for (let i = this.notes.length - 1; i >= 0; i--) if (this.notes[i].kind === 'out') out.unshift(this.notes.splice(i, 1)[0].text);
        return out.join('').replace(/\n$/, '');
    }

    _jobSwap(state) {
        const old = { table: this.table, orphans: this.orphans, notes: this.notes, touch: this.touch };
        const s = state || { table: [], orphans: [], notes: [], touch: 0 };
        this.table = s.table; this.orphans = s.orphans; this.notes = s.notes; this.touch = s.touch;
        return old;
    }

    // ===== signals reaching a job's process =====
    _jobSignal(p, sig, errs, verbose) {
        const j = this.table.find(x => x.id === p.job);
        if (!this._isRoot() && p.user !== this.fs.currentUser) { if (verbose) errs.push(`bash: kill: (${p.pid}) - Operation not permitted`); return 1; }
        if (sig === 0) return 0;
        if (!j) { this._dropProc(p.pid); return 0; }
        if (sig === 18) {
            if (j.state.startsWith('Stopped')) {
                j.touch = ++this.touch;
                if (j.tty) { j.pending = true; return 0; }
                j.state = 'Running'; p.stat = 'S';
            }
            return 0;
        }
        if (sig === 19 || sig === 20 || sig === 21 || sig === 22) {
            if (j.state === 'Running') { j.state = 'Stopped'; p.stat = 'T'; j.pending = true; j.touch = ++this.touch; }
            return 0;
        }
        if (sig === 17 || sig === 23 || sig === 28) return 0;
        j.lastSig = sig;
        this._dropProc(p.pid);
        return 0;
    }

    installHooks(parent) {
        const self = this;
        const origSig = parent._signalPid;
        if (typeof origSig === 'function') {
            parent._signalPid = function (pid, sig, errs, verbose) {
                const p = self.shared.processes.find(x => x.pid === pid);
                if (p && p.job) return self._jobSignal(p, sig, errs, verbose);
                return origSig.call(parent, pid, sig, errs, verbose);
            };
        }
        const origKill = parent.kill;
        if (typeof origKill === 'function') {
            parent.kill = function (args, stdin) {
                if (!args.some(a => /^%/.test(a))) return origKill.call(parent, args, stdin);
                const errs = [];
                const out = [];
                for (let i = 0; i < args.length; i++) {
                    const a = args[i];
                    if (/^%/.test(a)) {
                        const j = self._resolve(a);
                        if (!j) { errs.push(`bash: kill: ${a}: no such job`); continue; }
                        out.push(String(j.pid));
                    } else out.push(a);
                }
                const only = out.filter(x => !/^-/.test(x));
                if (!only.length) return { stdout: '', stderr: errs.join('\n'), exitCode: 1 };
                const r = origKill.call(parent, out, stdin);
                if (errs.length) return { stdout: r.stdout, stderr: [errs.join('\n'), r.stderr].filter(Boolean).join('\n'), exitCode: 1 };
                return r;
            };
        }
    }

    // ===== commands =====
    jobs(args) {
        let longFmt = false, pidsOnly = false, runOnly = false, stopOnly = false;
        const specs = [];
        for (const a of args) {
            if (/^-[a-z]+$/.test(a)) { for (const ch of a.slice(1)) { if (ch === 'l') longFmt = true; else if (ch === 'p') pidsOnly = true; else if (ch === 'r') runOnly = true; else if (ch === 's') stopOnly = true; else if (ch !== 'n') return this._err(`bash: jobs: -${ch}: invalid option\njobs: usage: jobs [-lnprs] [jobspec ...] or jobs -x command [args]`, 2); } }
            else specs.push(a);
        }
        this._jobReap();
        let list = this.table.slice().sort((a, b) => a.id - b.id);
        const errs = [];
        if (specs.length) {
            list = [];
            for (const s of specs) { const j = this._resolve(s); if (!j) errs.push(`bash: jobs: ${s}: no such job`); else list.push(j); }
        }
        if (runOnly) list = list.filter(j => j.state === 'Running');
        if (stopOnly) list = list.filter(j => j.state.startsWith('Stopped'));
        const out = pidsOnly ? list.map(j => String(j.pid)) : list.map(j => this._line(j, longFmt, true));
        for (const j of list) { j.pending = false; if (!this._alive(j)) this.table.splice(this.table.indexOf(j), 1); }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    fg(args) {
        this._jobReap();
        const spec = args[0];
        const j = this._resolve(spec);
        if (!j || !this._alive(j)) return this._err(`bash: fg: ${spec === undefined ? 'current' : spec}: no such job`);
        const finite = j.end !== null;
        const remaining = finite ? Math.max(0, j.end - this._ms()) : 0;
        this._emit(j.text + '\n');
        if (finite && remaining <= 0) { this._dropProc(j.pid); this.table.splice(this.table.indexOf(j), 1); return this._ok(); }
        const sh = this._sh();
        const ans = sh ? sh.takeInput({ mode: 'fgjob', prompt: '', ms: finite ? remaining : 0, onCancel: () => { this._dropProc(j.pid); const i = this.table.indexOf(j); if (i >= 0) this.table.splice(i, 1); } }) : null;
        if (ans === null || ans === undefined) { this._dropProc(j.pid); this.table.splice(this.table.indexOf(j), 1); return this._ok(); }
        if (/^STOP/.test(String(ans))) {
            const p = this._proc(j);
            j.state = 'Stopped'; j.touch = ++this.touch; j.tty = null;
            if (p) p.stat = 'T';
            return { stdout: this._line(j, false, false), stderr: '', exitCode: 148 };
        }
        // the job ran to completion in the foreground
        let rc = 0;
        if (j.exec) rc = j.exec().rc;
        this._dropProc(j.pid);
        const i = this.table.indexOf(j);
        if (i >= 0) this.table.splice(i, 1);
        return { stdout: '', stderr: '', exitCode: rc };
    }

    bg(args) {
        this._jobReap();
        const spec = args[0];
        const j = this._resolve(spec);
        if (!j || !this._alive(j)) return this._err(`bash: bg: ${spec === undefined ? 'current' : spec}: no such job`);
        if (j.state === 'Running') return this._err(`bash: bg: job ${j.id} already in background`);
        j.touch = ++this.touch;
        const p = this._proc(j);
        const line = `[${j.id}]${this._mark(j)} ${j.text} &`;
        if (j.tty) { j.pending = true; return this._ok(line); }
        j.state = 'Running';
        if (p) p.stat = 'S';
        return this._ok(line);
    }

    disown(args) {
        this._jobReap();
        let all = false, running = false;
        const specs = [];
        for (const a of args) {
            if (/^-[ahr]+$/.test(a)) { if (a.includes('a')) all = true; if (a.includes('r')) running = true; }
            else specs.push(a);
        }
        let list;
        const errs = [];
        if (all || (running && !specs.length)) list = this.table.filter(j => this._alive(j) && (!running || j.state === 'Running'));
        else if (!specs.length) {
            const j = this._resolve(undefined);
            if (!j) return this._err('bash: disown: current: no such job');
            list = [j];
        } else {
            list = [];
            for (const s of specs) { const j = this._resolve(s); if (!j) errs.push(`bash: disown: ${s}: no such job`); else list.push(j); }
        }
        for (const j of list) {
            const p = this._proc(j);
            if (p) { delete p.job; this.orphans.push({ pid: p.pid, end: j.end }); }
            const i = this.table.indexOf(j);
            if (i >= 0) this.table.splice(i, 1);
        }
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    wait(args) {
        this._jobReap();
        const targets = [];
        const errs = [];
        const ops = args.filter(a => !/^-[nf]+$/.test(a));
        if (!ops.length) targets.push(...this.table.filter(j => j.state === 'Running'));
        for (const a of ops) {
            let j = /^%/.test(a) ? this._resolve(a) : this.table.find(x => String(x.pid) === a);
            if (!j) { errs.push(/^%/.test(a) ? `bash: wait: ${a}: no such job` : `bash: wait: pid ${a} is not a child of this shell`); continue; }
            targets.push(j);
        }
        let rc = errs.length ? 127 : 0;
        const out = [];
        for (const j of targets) {
            if (!this._alive(j)) { rc = j.code; const i = this.table.indexOf(j); if (i >= 0) this.table.splice(i, 1); continue; }
            if (j.state !== 'Running' || j.end === null) continue;   // endless or stopped jobs cannot be waited for here
            const p = this._proc(j);
            this._complete(j, p);
            rc = j.code;
            j.pending = false;
            this.table.splice(this.table.indexOf(j), 1);
        }
        const text = this._jobOutput();
        if (text) out.push(text);
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: rc };
    }

    nohup(args) {
        if (!args.length) return this._err("nohup: missing operand\nTry 'nohup --help' for more information.", 125);
        const sh = this._sh();
        if (!sh) return this._err('nohup: cannot run', 125);
        const io0 = this.parent._curIo;
        const quote = (a) => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${a.replace(/'/g, "'\\''")}'`);
        const cmd = args.map(quote).join(' ');
        const out = [];
        const io = { stdin: { text: '', pos: 0 }, out: (s) => { if (s) out.push(s); }, err: (s) => { if (s) out.push(s); }, piped: true, hasStdin: false };
        const wasInteractive = sh.interactive;
        sh.interactive = false;
        let rc = 0;
        try { rc = sh.runScriptText(cmd, 'nohup', [], io); } finally { sh.interactive = wasInteractive; }
        const text = out.join('');
        if (io0 && !io0.piped) {
            let path = this.fs.resolvePath('nohup.out');
            let dir = this.fs.getNode(path.replace(/\/[^/]*$/, '') || '/');
            const home = (this.fs.users[this.fs.currentUser] || {}).home || '/root';
            if (!dir || !dir.children) { path = home + '/nohup.out'; }
            let n = this.fs.getNode(path);
            if (!n) { this._touchFile(path); n = this.fs.getNode(path); }
            if (n && n.type === 'file') { n.content = (n.content || '') + text; n.size = n.content.length; n.modified = new Date(); }
            return { stdout: '', stderr: `nohup: ignoring input and appending output to '${path === this.fs.resolvePath('nohup.out') ? 'nohup.out' : path}'`, exitCode: rc };
        }
        return { stdout: text, stderr: 'nohup: ignoring input', exitCode: rc };
    }

    // a sleep typed on its own line keeps the prompt busy until it ends, Ctrl+C aborts it, Ctrl+Z stops it as a job
    sleep(args) {
        if (args.length === 0) return this._err("sleep: missing operand\nTry 'sleep --help' for more information.");
        let total = 0;
        for (const a of args) {
            if (a === 'infinity' || a === 'inf') { total = Infinity; continue; }
            if (!/^\d+(\.\d+)?[smhd]?$/.test(a)) return this._err(`sleep: invalid time interval '${a}'`);
            total += this._secs(a);
        }
        const sh = this._sh();
        const io = this.parent._curIo;
        const line = sh && sh.topLine ? sh.topLine : '';
        if (sh && sh.interactive && io && !io.piped && !sh.inScript && total > 0 && /^\s*sleep\s+[^;&|<>()$`]+$/.test(line)) {
            const ans = sh.takeInput({ mode: 'fgjob', prompt: '', ms: total === Infinity ? 0 : total * 1000, onCancel: () => {} });
            if (ans !== null && ans !== undefined && /^STOP/.test(String(ans))) {
                const elapsed = parseInt(String(ans).split(':')[1] || '0', 10) || 0;
                const id = this._newId();
                const text = line.trim();
                const job = { id, pid: this._pid(), text, state: 'Stopped', code: 0, touch: ++this.touch, end: total === Infinity ? null : this._ms() + Math.max(0, total * 1000 - elapsed), exec: null, pending: false, lastSig: 0, nohup: false, tty: null };
                this.table.push(job);
                this._addProc(job, { shown: 'sleep ' + args.join(' '), cpu: 0 });
                return { stdout: this._line(job, false, false), stderr: '', exitCode: 148 };
            }
        }
        return this._ok();
    }

    suspendCurrentJob() { return { output: '' }; }
}

if (typeof window !== 'undefined') {
    window.JobEngine = JobEngine;
}
