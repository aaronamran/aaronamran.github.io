// Tab completion for the Red Cat terminal
// Part of Red Cat RHCSA Terminal Simulator
//
// Commands (builtins, programs in PATH, shell functions), file names, $variables and ~users complete like in bash.
// With the bash-completion package installed (it is by default) arguments of dnf, systemctl, nmcli, podman, git,
// firewall-cmd, useradd, chown, man, ssh and many more complete too; remove the package and they fall back to files.

class CompletionEngine {
    constructor(terminal) {
        this.t = terminal;
        this.lastKey = null;
    }

    get fs() { return this.t.fs; }
    get cmds() { return this.t.commands; }
    get shared() { return (this.t.commands && this.t.commands._shared) || {}; }

    // ===== entry point =====
    // returns { value, cursor, list, message } ; value === null means "nothing to change"
    run(line, cursor) {
        const before = line.slice(0, cursor);
        const after = line.slice(cursor);
        const ctx = this._parse(before);
        const cand = this._candidates(ctx);
        const key = before;
        const repeat = this.lastKey === key;
        this.lastKey = key;
        const partial = ctx.partial;
        if (cand.noMatch || !cand.list.length) return { value: null };
        if (cand.list.length > 100 && partial === '' && !repeat) { return { value: null, message: `Display all ${cand.list.length} possibilities? (y or n)` }; }
        const names = cand.list;
        if (names.length === 1) {
            const c = names[0];
            const done = this._insert(ctx, c, !/[\/=:]$/.test(c) && !cand.noSpace);
            return { value: before.slice(0, ctx.wordStart) + done + after, cursor: ctx.wordStart + done.length };
        }
        // longest common prefix
        let lcp = names[0];
        for (const n of names) { let i = 0; while (i < lcp.length && i < n.length && lcp[i] === n[i]) i++; lcp = lcp.slice(0, i); }
        if (lcp.length > partial.length) {
            const done = this._insert(ctx, lcp, false);
            return { value: before.slice(0, ctx.wordStart) + done + after, cursor: ctx.wordStart + done.length };
        }
        if (!repeat) return { value: null };
        return { value: null, list: this._columns(cand.display || names) };
    }

    _insert(ctx, text, space) {
        let s = text;
        if (!ctx.quote && !s.startsWith('$')) s = s.replace(/[^A-Za-z0-9_@%+=:,.\/~\-]/g, (m) => '\\' + m);
        if (ctx.quote) s = ctx.quote + s + (space ? ctx.quote : '');
        return s + (space ? ' ' : '');
    }

    _columns(items) {
        const sorted = items.slice();
        const w = Math.max(...sorted.map(s => s.length)) + 2;
        const cols = Math.max(1, Math.floor(80 / w));
        const rows = Math.ceil(sorted.length / cols);
        const out = [];
        for (let r = 0; r < rows; r++) {
            let line = '';
            for (let c = 0; c < cols; c++) { const v = sorted[c * rows + r]; if (v !== undefined) line += c === cols - 1 || c * rows + r + rows >= sorted.length ? v : v.padEnd(w); }
            out.push(line.replace(/\s+$/, ''));
        }
        return out.join('\n');
    }

    // ===== parsing the line up to the cursor =====
    _parse(before) {
        let cmdWords = [], cur = null, q = null, esc = false, pendingRedirect = false;
        const startWord = (i) => ({ text: '', start: i, quote: null, redirect: pendingRedirect });
        const flush = () => { if (cur) { cmdWords.push(cur); if (cur.redirect) pendingRedirect = false; cur = null; } };
        for (let i = 0; i < before.length; i++) {
            const ch = before[i];
            if (esc) { cur.text += ch; esc = false; continue; }
            if (q) { if (ch === q) q = null; else if (ch === '\\' && q === '"' && i + 1 < before.length) { cur.text += before[++i]; } else cur.text += ch; continue; }
            if (ch === '\\') { if (!cur) cur = startWord(i); esc = true; continue; }
            if (ch === '"' || ch === "'") { if (!cur) cur = startWord(i); cur.quote = ch; q = ch; continue; }
            if (/\s/.test(ch)) { flush(); continue; }
            if (ch === '|' || ch === ';' || ch === '&' || ch === '(' || ch === ')' || ch === '`') {
                if (ch === '(' && cur && cur.text.endsWith('$')) { cur.text = cur.text.slice(0, -1); if (!cur.text) cur = null; }
                flush(); cmdWords = []; pendingRedirect = false; continue;
            }
            if (ch === '>' || ch === '<') {
                if (cur && /^\d+$/.test(cur.text)) cur = null; else flush();
                pendingRedirect = true; continue;
            }
            if (!cur) cur = startWord(i);
            cur.text += ch;
        }
        const finished = cmdWords.filter(w => !w.redirect);
        const partialWord = cur;
        const partial = partialWord ? partialWord.text : '';
        const redirect = partialWord ? partialWord.redirect : pendingRedirect;
        // assignments and wrapper commands in front of the real command
        let args = finished.map(w => w.text);
        while (args.length && /^[A-Za-z_]\w*=/.test(args[0])) args.shift();
        const wrappers = ['sudo', 'env', 'time', 'nohup', 'nice', 'watch', 'xargs', 'exec', 'command', 'builtin', 'strace', 'timeout', 'stdbuf', 'setsid', 'ionice', 'unbuffer'];
        while (args.length && wrappers.includes(args[0])) {
            const w = args.shift();
            if (w === 'sudo') { while (args.length && /^-/.test(args[0])) { const a = args.shift(); if (['-u', '-g', '-h', '-p', '-C', '-r', '-t', '-U'].includes(a)) args.shift(); } }
            else if (w === 'timeout' || w === 'watch') { while (args.length && /^-/.test(args[0])) { const a = args.shift(); if (['-n', '-s', '-k'].includes(a)) args.shift(); } if (w === 'timeout' && args.length) args.shift(); }
            else while (args.length && (/^-/.test(args[0]) || /^\w+=/.test(args[0]))) args.shift();
        }
        return { args, partial, redirect, wordStart: partialWord ? partialWord.start : before.length, quote: partialWord ? partialWord.quote : null, idx: args.length, cmd: args[0] || null, before };
    }

    // ===== candidates =====
    _candidates(ctx) {
        const p = ctx.partial;
        // variables, users
        if (p.startsWith('${')) return { list: this._vars().map(v => '${' + v + '}').filter(v => v.startsWith(p)).sort() };
        if (p.startsWith('$') && !p.startsWith('$(')) return { list: this._vars().map(v => '$' + v).filter(v => v.startsWith(p)).sort() };
        if (/^~[A-Za-z0-9_-]*$/.test(p) && !ctx.redirect) { const users = Object.keys(this.fs.users).map(u => '~' + u + '/'); return { list: users.filter(u => u.startsWith(p)).sort() }; }
        if (ctx.redirect) return this._paths(p, false, false);
        // command position
        if (ctx.idx === 0) {
            if (p.includes('/')) return this._paths(p, false, true);
            return { list: this._commandNames(p), noSpace: false };
        }
        const special = this._special(ctx);
        if (special) {
            const list = Array.from(new Set(special.list || [])).filter(c => c.startsWith(p)).sort((a, b) => a.localeCompare(b, 'en'));
            if (list.length || special.only) return { list, noSpace: special.noSpace };
        }
        return this._paths(p, ['cd', 'pushd', 'rmdir', 'chroot'].includes(ctx.cmd), false);
    }

    _vars() { return Object.keys(this.cmds.env || {}).sort(); }

    _commandNames(prefix) {
        const set = new Set();
        const gate = this.cmds._cmdGate;
        for (const k of Object.keys(this.cmds)) {
            if (k.startsWith('_') || typeof this.cmds[k] !== 'function' || !k.startsWith(prefix)) continue;
            if (['constructor', 'installHooks', 'sessionExit'].includes(k)) continue;
            if (gate && gate(k) === false) continue;
            set.add(k === 'envCmd' ? 'env' : k === 'hostnameCmd' ? 'hostname' : k);
        }
        const builtins = [':', '.', 'source', 'alias', 'bg', 'bind', 'break', 'builtin', 'caller', 'cd', 'command', 'compgen', 'complete', 'continue', 'declare', 'dirs', 'disown', 'echo', 'enable', 'eval', 'exec', 'exit', 'export', 'false', 'fc', 'fg', 'getopts', 'hash', 'help', 'history', 'jobs', 'kill', 'let', 'local', 'logout', 'mapfile', 'popd', 'printf', 'pushd', 'pwd', 'read', 'readarray', 'readonly', 'return', 'set', 'shift', 'shopt', 'suspend', 'test', 'times', 'trap', 'true', 'type', 'typeset', 'ulimit', 'umask', 'unalias', 'unset', 'wait'];
        const keywords = ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'select', 'while', 'until', 'do', 'done', 'in', 'function', 'time', '{', '}', '!', '[[', ']]'];
        for (const b of builtins.concat(keywords)) if (b.startsWith(prefix)) set.add(b);
        const sh = this.t.getShell ? this.t.getShell() : null;
        if (sh && sh.funcs) for (const f of Object.keys(sh.funcs)) if (f.startsWith(prefix)) set.add(f);
        const path = ((this.cmds.env || {}).PATH || '').split(':');
        for (const d of path) {
            const n = this.fs.getNode(d || '.');
            if (n && n.children) for (const [name, c] of Object.entries(n.children)) if (c.type !== 'directory' && name.startsWith(prefix) && (!gate || gate(name) !== false)) set.add(name);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'en'));
    }

    _paths(p, dirsOnly, execOnly) {
        let dirPart = '', base = p;
        const i = p.lastIndexOf('/');
        if (i >= 0) { dirPart = p.slice(0, i + 1); base = p.slice(i + 1); }
        let lookup = dirPart || '.';
        if (lookup.startsWith('~')) lookup = lookup.replace(/^~/, (this.fs.users[this.fs.currentUser] || {}).home || '/root');
        const node = this.fs.getNode(lookup);
        if (!node || !node.children || !this.fs.hasPermission(node, 'r')) return { list: [], noMatch: true };
        const out = [];
        for (const [name, c] of Object.entries(node.children)) {
            if (!name.startsWith(base)) continue;
            if (name.startsWith('.') && !base.startsWith('.')) continue;
            let isDir = c.type === 'directory';
            if (c.type === 'symlink') { const tgt = this.fs.getNode(this.fs.resolvePath(c.target && c.target.startsWith('/') ? c.target : (lookup.replace(/\/$/, '') + '/' + c.target))); isDir = !!(tgt && tgt.type === 'directory'); }
            if (dirsOnly && !isDir) continue;
            if (execOnly && !isDir && !/[1357]/.test((c.permissions || '0644').slice(-3))) continue;
            out.push(dirPart + name + (isDir ? '/' : ''));
        }
        out.sort((a, b) => a.localeCompare(b, 'en'));
        return { list: out, display: out.map(x => x.slice(dirPart.length)) };
    }

    // ===== argument completion =====
    _hasBashCompletion() {
        const pk = this.shared.pkg;
        return !pk || !pk.installed || !!pk.installed['bash-completion'];
    }

    _special(ctx) {
        if (!this._hasBashCompletion()) return null;
        const { cmd, args, partial: p, idx } = ctx;
        const sub = args[1];
        const opts = (list) => (p.startsWith('-') ? { list, only: false } : null);
        const S = this.shared;
        const users = () => Object.keys(this.fs.users);
        const groups = () => Object.keys(this.fs.groups);
        switch (cmd) {
            case 'systemctl': {
                const verbs = ['status', 'start', 'stop', 'restart', 'reload', 'try-restart', 'reload-or-restart', 'enable', 'disable', 'mask', 'unmask', 'is-active', 'is-enabled', 'is-failed', 'show', 'cat', 'edit', 'list-units', 'list-unit-files', 'list-timers', 'list-sockets', 'list-dependencies', 'daemon-reload', 'daemon-reexec', 'get-default', 'set-default', 'isolate', 'reboot', 'poweroff', 'halt', 'rescue', 'emergency', 'kill', 'reset-failed', 'preset', 'revert'];
                if (p.startsWith('-')) return { list: ['--now', '--user', '--system', '--no-pager', '--no-legend', '--all', '--failed', '--full', '--type=service', '--state=running', '--runtime', '--force', '-l', '-a', '-t', '-H', '--version', '--help', '--no-reload', '-q', '--quiet'] };
                const verbIdx = args.findIndex((a, i) => i > 0 && !a.startsWith('-'));
                if (verbIdx < 0 || verbIdx === idx) return { list: verbs };
                const verb = args[verbIdx];
                if (['set-default', 'isolate'].includes(verb)) return { list: ['multi-user.target', 'graphical.target', 'rescue.target', 'emergency.target', 'basic.target', 'default.target', 'reboot.target', 'poweroff.target'] };
                if (['daemon-reload', 'get-default', 'reboot', 'poweroff', 'halt', 'list-units', 'list-unit-files', 'list-timers'].includes(verb)) return { list: [], only: true };
                return { list: this._unitNames(verb) };
            }
            case 'journalctl': {
                if (args[idx - 1] === '-u' || args[idx - 1] === '--unit') return { list: this._unitNames('status') };
                if (args[idx - 1] === '-p') return { list: ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'] };
                return opts(['-u', '-b', '-f', '-n', '-p', '-k', '-r', '-x', '-e', '--since=', '--until=', '--no-pager', '--list-boots', '--disk-usage', '--vacuum-size=', '--vacuum-time=', '--output=json', '-o', '--utc', '--user']);
            }
            case 'dnf': case 'yum': return this._dnf(ctx);
            case 'rpm': return this._rpm(ctx);
            case 'nmcli': return this._nmcli(ctx);
            case 'podman': return this._podman(ctx);
            case 'git': return this._git(ctx);
            case 'firewall-cmd': return this._firewall(ctx);
            case 'semanage': return this._semanage(ctx);
            case 'setsebool': case 'getsebool': {
                if (p.startsWith('-')) return { list: ['-P', '-a'] };
                const b = this._booleans();
                return { list: b };
            }
            case 'useradd': case 'adduser': case 'usermod': case 'userdel': case 'passwd': case 'chage': case 'id': case 'groups': case 'finger': case 'su': case 'chsh': case 'lastlog': case 'faillock': {
                if (['-g', '-G'].includes(args[idx - 1])) return { list: groups(), only: true };
                if (p.startsWith('-')) return { list: this._userOpts(cmd) };
                if (cmd === 'useradd') return null;
                if (cmd === 'su' && idx === 1 && !p) return { list: users().concat(['-']) };
                return { list: users() };
            }
            case 'chown': case 'chgrp': {
                if (p.startsWith('-')) return { list: ['-R', '-h', '-c', '-v', '--reference='] };
                const first = args.filter(a => !a.startsWith('-')).length === 1;
                if (!first) return null;
                if (cmd === 'chgrp') return { list: groups(), only: true };
                if (p.includes(':')) { const u = p.split(':')[0]; return { list: groups().map(g => u + ':' + g), only: true }; }
                return { list: users().map(u => u + ':'), noSpace: true, only: true };
            }
            case 'groupadd': case 'groupdel': case 'groupmod': case 'gpasswd': case 'newgrp': case 'getent': {
                if (cmd === 'getent' && idx === 1) return { list: ['passwd', 'group', 'hosts', 'services', 'shadow', 'networks', 'protocols', 'ahosts'] };
                if (cmd === 'getent' && args[1] === 'passwd') return { list: users() };
                if (cmd === 'getent' && args[1] === 'group') return { list: groups() };
                if (p.startsWith('-')) return { list: ['-g', '-n', '-o', '-r', '-f', '-a', '-d', '-M'] };
                return { list: groups() };
            }
            case 'man': case 'whatis': case 'apropos': case 'which': case 'type': case 'whereis': case 'help': case 'info': {
                if (cmd === 'man' && idx === 1 && !p) return { list: this._commandNames('') };
                if (p.startsWith('-')) return null;
                return { list: this._commandNames(p).concat(cmd === 'man' ? ['1', '2', '3', '4', '5', '6', '7', '8'].filter(() => idx === 1) : []) };
            }
            case 'ssh': case 'scp': case 'sftp': case 'ping': case 'telnet': case 'nc': case 'ncat': case 'traceroute': case 'dig': case 'nslookup': case 'host': case 'curl': case 'wget': case 'ssh-copy-id': case 'nmap': case 'rsync': {
                if (p.startsWith('-')) return null;
                if (p.includes('/') || p.includes(':') && cmd !== 'ssh' && cmd !== 'scp') return null;
                const hosts = this._hosts();
                if (['ssh', 'scp', 'sftp', 'ssh-copy-id'].includes(cmd) && p.includes('@')) { const u = p.split('@')[0]; return { list: hosts.map(h => u + '@' + h), only: true }; }
                if (['ssh', 'scp', 'sftp', 'ssh-copy-id'].includes(cmd)) { const l = hosts.slice(); if (p) l.push(...users().map(u => u + '@')); return { list: l, noSpace: false }; }
                return { list: hosts };
            }
            case 'mount': case 'umount': case 'fsck': case 'mkfs': case 'mkfs.xfs': case 'mkfs.ext4': case 'mkswap': case 'swapon': case 'swapoff': case 'xfs_growfs': case 'resize2fs': case 'blkid': case 'lsblk': case 'wipefs': case 'tune2fs': case 'e2fsck': case 'xfs_repair': case 'pvcreate': case 'vgcreate': case 'vgextend': case 'pvs': {
                if (p.startsWith('-')) return null;
                const devs = this._devices();
                if (cmd === 'umount') return { list: this._mountPoints().concat(devs) };
                if (cmd === 'mount') { const nonOpt = args.filter(a => !a.startsWith('-') && !/^(?:-t|-o)$/.test(a)); if (nonOpt.length <= 1) return { list: devs.concat(['UUID=', 'LABEL=']) }; return null; }
                if (p.startsWith('/dev/') || p === '' || '/dev/'.startsWith(p)) return { list: devs };
                return null;
            }
            case 'timedatectl': {
                if (idx === 1 || (!p.startsWith('-') && !args[1])) return { list: ['status', 'show', 'set-time', 'set-timezone', 'list-timezones', 'set-local-rtc', 'set-ntp', 'timesync-status', 'show-timesync'] };
                if (args[1] === 'set-timezone') return { list: this._timezones() };
                if (args[1] === 'set-ntp' || args[1] === 'set-local-rtc') return { list: ['true', 'false', 'yes', 'no', '1', '0'] };
                return { list: [], only: true };
            }
            case 'hostnamectl': return idx === 1 ? { list: ['status', 'hostname', 'set-hostname', 'icon-name', 'chassis', 'deployment', 'location'] } : null;
            case 'localectl': return idx === 1 ? { list: ['status', 'set-locale', 'list-locales', 'set-keymap', 'list-keymaps', 'set-x11-keymap'] } : null;
            case 'loginctl': return idx === 1 ? { list: ['list-sessions', 'session-status', 'list-users', 'user-status', 'show-session', 'show-user', 'terminate-session', 'terminate-user', 'enable-linger', 'disable-linger', 'lock-session', 'list-seats'] } : null;
            case 'sysctl': {
                if (p.startsWith('-')) return { list: ['-a', '-n', '-N', '-w', '-p', '--system', '--load'] };
                return { list: this._sysctlKeys() };
            }
            case 'tuned-adm': {
                if (idx === 1) return { list: ['list', 'active', 'profile', 'profile_info', 'off', 'recommend', 'verify', 'auto_profile', 'profile_mode'] };
                if (args[1] === 'profile' || args[1] === 'profile_info') return { list: this._tunedProfiles() };
                return { list: [], only: true };
            }
            case 'crontab': return opts(['-e', '-l', '-r', '-u', '-i']) || (args[idx - 1] === '-u' ? { list: users(), only: true } : null);
            case 'at': return opts(['-f', '-m', '-q', '-v', '-c', '-l', '-d']);
            case 'kill': case 'killall': case 'pkill': {
                if (cmd === 'kill' && p.startsWith('-')) return { list: ['-HUP', '-INT', '-QUIT', '-KILL', '-TERM', '-STOP', '-CONT', '-USR1', '-USR2', '-9', '-15', '-l', '-s'] };
                if (cmd === 'kill' && p.startsWith('%')) { const je = S.jobEngine; return { list: je ? je.table.filter(j => je._alive(j)).map(j => '%' + j.id) : [], only: true }; }
                if (cmd === 'kill') return { list: [], only: false };
                if (p.startsWith('-')) return { list: ['-HUP', '-INT', '-TERM', '-KILL', '-STOP', '-CONT', '-USR1', '-9', '-15', '-u', '-9', '-x', '-f'] };
                return { list: Array.from(new Set(((S.processes || []).filter(x => !/^\[.*\]$/.test(x.command)).map(x => x.comm)))) };
            }
            case 'export': case 'unset': case 'declare': case 'readonly': case 'local': case 'printenv': case 'typeset': {
                if (p.startsWith('-')) return null;
                return { list: this._vars(), noSpace: cmd === 'export' || cmd === 'declare' || cmd === 'readonly' || cmd === 'typeset' ? false : false };
            }
            case 'fg': case 'bg': case 'disown': case 'wait': { const je = S.jobEngine; return { list: je ? je.table.filter(j => je._alive(j)).map(j => '%' + j.id) : [], only: true }; }
            case 'setenforce': return { list: ['0', '1', 'Enforcing', 'Permissive'], only: true };
            case 'restorecon': case 'chcon': case 'ls': case 'cat': return null;
            case 'chmod': return p.startsWith('-') ? { list: ['-R', '-c', '-v', '-f', '--reference='] } : null;
            case 'ip': {
                const objs = ['address', 'link', 'route', 'neigh', 'rule', 'netns', 'maddress', 'monitor', 'tunnel', 'addr', 'a', 'l', 'r', 'n'];
                if (idx === 1) return { list: objs };
                if (idx === 2) { if (['address', 'addr', 'a'].includes(args[1])) return { list: ['add', 'del', 'show', 'flush', 'change', 'replace'] }; if (['link', 'l'].includes(args[1])) return { list: ['show', 'set', 'add', 'delete'] }; if (['route', 'r'].includes(args[1])) return { list: ['show', 'add', 'del', 'change', 'replace', 'flush', 'get'] }; }
                if (['dev'].includes(args[idx - 1])) return { list: ['lo', 'eth0', 'eth1'] };
                return null;
            }
            case 'ss': case 'netstat': return opts(['-t', '-u', '-l', '-n', '-p', '-a', '-tlnp', '-tulnp', '-s', '-r', '-4', '-6', '-e', '-o']);
            case 'tar': return p.startsWith('-') ? { list: ['-c', '-x', '-t', '-z', '-j', '-J', '-v', '-f', '-C', '-p', '--exclude=', '--gzip', '--bzip2', '--xz', '--list', '--extract', '--create', '--directory='] } : null;
            case 'lvcreate': case 'lvextend': case 'lvreduce': case 'lvremove': case 'lvs': case 'vgs': case 'vgremove': case 'vgreduce': case 'lvresize': case 'lvdisplay': case 'vgdisplay': case 'pvdisplay': {
                if (p.startsWith('-')) return { list: ['-n', '-L', '-l', '-r', '-f', '-y', '-t', '-s', '--name', '--size', '--extents', '--resizefs'] };
                if (p.startsWith('/dev/') || p === '') return { list: this._lvmPaths().concat(this._devices()) };
                return null;
            }
            case 'useradd_': return null;
            case 'nice': case 'renice': return null;
            case 'service': {
                if (idx === 1) return { list: Object.keys(S.services || {}) };
                if (idx === 2) return { list: ['start', 'stop', 'restart', 'status', 'reload', 'condrestart'] };
                return null;
            }
            case 'chkconfig': return null;
            case 'make': {
                const mf = this.fs.getNode(this.fs.currentPath + '/Makefile') || this.fs.getNode(this.fs.currentPath + '/makefile');
                if (!mf) return null;
                const targets = [];
                for (const l of (mf.content || '').split('\n')) { const m = /^([A-Za-z0-9_.-]+)\s*:(?!=)/.exec(l); if (m && !m[1].startsWith('.')) targets.push(m[1]); }
                return { list: targets };
            }
            case 'tmux': return idx === 1 ? { list: ['new-session', 'attach-session', 'list-sessions', 'kill-session', 'kill-server', 'new', 'attach', 'ls', 'send-keys', 'rename-session', 'has-session'] } : null;
            case 'openssl': return idx === 1 ? { list: ['version', 'rand', 'passwd', 'dgst', 'genrsa', 'req', 'x509', 'rsa', 'verify', 's_client', 'enc', 'help'] } : null;
            case 'ansible': case 'sudoedit': case 'visudo': return null;
            default: return null;
        }
    }

    _userOpts(cmd) {
        switch (cmd) {
            case 'useradd': return ['-c', '-d', '-e', '-f', '-g', '-G', '-m', '-M', '-N', '-o', '-r', '-s', '-u', '-U', '-k', '-p', '-b', '-D', '-l'];
            case 'usermod': return ['-a', '-c', '-d', '-e', '-g', '-G', '-l', '-L', '-m', '-s', '-u', '-U', '-aG', '-p'];
            case 'userdel': return ['-f', '-r', '-Z'];
            case 'passwd': return ['-l', '-u', '-d', '-e', '-i', '-n', '-w', '-x', '-S', '--stdin', '-k', '-a'];
            case 'chage': return ['-d', '-E', '-I', '-l', '-m', '-M', '-W'];
            default: return ['-l', '-s', '-c', '-m', '-p'];
        }
    }

    _unitNames(verb) {
        const S = this.shared;
        const names = new Set();
        for (const n of Object.keys(S.services || {})) {
            const s = S.services[n];
            if (verb === 'start' && s.active && !s.failed) continue;
            names.add(n + '.service');
        }
        const u = S.units;
        if (u && u.defs) for (const n of Object.keys(u.defs)) names.add(n.includes('.') ? n : n + '.service');
        for (const dir of ['/etc/systemd/system', '/usr/lib/systemd/system']) {
            const d = this.fs.getNode(dir);
            if (d && d.children) for (const k of Object.keys(d.children)) if (/\.(service|timer|socket|target|mount|path)$/.test(k) && d.children[k].type === 'file') names.add(k);
        }
        if (['is-active', 'status', 'show', 'cat', 'list-dependencies', 'enable', 'disable', 'mask', 'unmask', 'is-enabled'].includes(verb)) { ['multi-user.target', 'graphical.target', 'sockets.target', 'timers.target', 'network.target'].forEach(t => names.add(t)); }
        return Array.from(names);
    }

    _dnf(ctx) {
        const { args, partial: p, idx } = ctx;
        const verbs = ['install', 'remove', 'erase', 'update', 'upgrade', 'search', 'info', 'list', 'provides', 'whatprovides', 'repolist', 'repoinfo', 'repoquery', 'history', 'group', 'groups', 'module', 'clean', 'makecache', 'check-update', 'autoremove', 'reinstall', 'downgrade', 'download', 'config-manager', 'deplist', 'swap', 'distro-sync', 'check', 'mark', 'versionlock', 'needs-restarting', 'help', 'updateinfo', 'copr'];
        if (p.startsWith('-')) return { list: ['-y', '-q', '-v', '-C', '-x', '--assumeyes', '--assumeno', '--nogpgcheck', '--enablerepo=', '--disablerepo=', '--repo=', '--releasever=', '--allowerasing', '--skip-broken', '--best', '--nobest', '--setopt=', '--refresh', '--installroot=', '--downloadonly', '--downloaddir=', '--destdir=', '--resolve', '--exclude=', '--showduplicates', '--installed', '--available', '--extras', '--updates', '--help', '--version', '--quiet', '--cacheonly', '--security', '--bugfix'] };
        const verbIdx = args.findIndex((a, i) => i > 0 && !a.startsWith('-'));
        if (verbIdx < 0 || verbIdx === idx) return { list: verbs };
        const verb = args[verbIdx];
        const pk = this.shared.pkg;
        const all = pk ? Object.keys(pk.cat) : [];
        const inst = pk ? Object.keys(pk.installed) : [];
        switch (verb) {
            case 'install': return { list: all.filter(n => !(pk && pk.installed[n])).concat(['@']).filter(x => x !== '@') };
            case 'remove': case 'erase': case 'autoremove': return { list: inst };
            case 'reinstall': case 'downgrade': return { list: inst };
            case 'update': case 'upgrade': return { list: inst };
            case 'info': case 'list': case 'search': case 'download': case 'deplist': case 'repoquery': case 'provides': case 'whatprovides': return { list: all };
            case 'group': case 'groups': { const sub = args[verbIdx + 1]; if (verbIdx + 1 === idx) return { list: ['install', 'remove', 'list', 'info', 'summary', 'upgrade', 'mark'] }; return { list: ['Development Tools', 'Server with GUI', 'Minimal Install', 'Workstation', 'Virtualization Host', 'Container Management', 'System Tools', 'Network Servers', 'Basic Web Server', 'File and Storage Server', 'Legacy UNIX Compatibility', 'Security Tools', 'Headless Management', 'Smart Card Support', 'Server'].map(g => g.replace(/ /g, '\\ ')).map(g => g.replace(/\\ /g, ' ')) }; }
            case 'module': { if (verbIdx + 1 === idx) return { list: ['list', 'info', 'enable', 'disable', 'reset', 'install', 'remove', 'update', 'provides', 'repoquery'] }; return { list: ['nginx', 'nodejs', 'postgresql', 'mariadb', 'php', 'ruby', 'perl', 'python39', 'python311', 'container-tools', 'httpd', 'redis', 'maven', 'nginx:1.22', 'nodejs:18', 'postgresql:15', 'php:8.2', 'ruby:3.1'] }; }
            case 'history': { if (verbIdx + 1 === idx) return { list: ['list', 'info', 'undo', 'redo', 'rollback', 'userinstalled', 'store'] }; return { list: [], only: true }; }
            case 'clean': return { list: ['all', 'packages', 'metadata', 'dbcache', 'expire-cache'] };
            case 'config-manager': return { list: ['--add-repo', '--set-enabled', '--set-disabled', '--dump', '--enable', '--disable'] };
            case 'repolist': case 'repoinfo': return { list: ['all', 'enabled', 'disabled'] };
            case 'mark': return { list: ['install', 'remove', 'group'] };
            default: return { list: [], only: false };
        }
    }

    _rpm(ctx) {
        const { args, partial: p, idx } = ctx;
        if (p.startsWith('-')) return { list: ['-q', '-qa', '-qi', '-ql', '-qc', '-qd', '-qf', '-qR', '-qp', '-V', '-Va', '-i', '-U', '-F', '-e', '-K', '-h', '-v', '-vh', '-ivh', '-Uvh', '--import', '--last', '--whatprovides', '--whatrequires', '--requires', '--provides', '--scripts', '--changelog', '--nodeps', '--force', '--test', '--version', '--checksig', '--erase', '--install', '--upgrade', '--verify', '--query', '--all', '--info', '--list', '--configfiles', '--docfiles', '--file', '--package', '--rebuilddb', '--initdb'] };
        const pk = this.shared.pkg;
        const q = args.some(a => /^-(q|V|e)/.test(a) || /^--(query|verify|erase)$/.test(a));
        if (q && !args.some(a => /^-[a-zA-Z]*[af]/.test(a) && /a|f/.test(a.replace(/^-q/, '')) && /^-q[a-z]*f$/.test(a))) return { list: pk ? Object.keys(pk.installed) : [] };
        return null;
    }

    _nmcli(ctx) {
        const { args, partial: p, idx } = ctx;
        const net = this.shared.net;
        const conns = () => (net && net.conns ? net.conns.map(c => c.props ? c.props['connection.id'] : c.name).filter(Boolean) : []);
        if (p.startsWith('-')) return { list: ['-t', '-f', '-g', '-p', '-m', '-c', '-a', '-s', '-w', '--terse', '--fields', '--get-values', '--pretty', '--mode', '--colors', '--ask', '--show-secrets', '--wait', '--version', '--help'] };
        const obj = args[1];
        if (idx === 1) return { list: ['general', 'networking', 'radio', 'connection', 'device', 'agent', 'monitor'] };
        if (idx === 2) {
            const verbs = { connection: ['show', 'up', 'down', 'add', 'modify', 'clone', 'edit', 'delete', 'reload', 'load', 'import', 'export'], device: ['status', 'show', 'connect', 'reapply', 'modify', 'disconnect', 'delete', 'monitor', 'wifi', 'lldp'], general: ['status', 'hostname', 'permissions', 'logging', 'reload'], networking: ['on', 'off', 'connectivity'], radio: ['all', 'wifi', 'wwan'] };
            return { list: verbs[obj] || [] };
        }
        const verb = args[2];
        if (obj === 'connection' || obj === 'con' || obj === 'c') {
            if (['show', 'up', 'down', 'delete', 'modify', 'clone', 'edit', 'export'].includes(verb) && idx === 3) return { list: conns().concat(verb === 'show' || verb === 'up' ? ['id', 'uuid', 'path', '--active'] : ['id', 'uuid']) };
            if (verb === 'modify') return { list: ['ipv4.addresses', 'ipv4.gateway', 'ipv4.dns', 'ipv4.dns-search', 'ipv4.method', 'ipv4.routes', 'ipv4.ignore-auto-dns', 'ipv6.method', 'ipv6.addresses', 'ipv6.gateway', 'ipv6.dns', 'connection.autoconnect', 'connection.id', 'connection.interface-name', 'connection.zone', 'connection.autoconnect-priority', '802-3-ethernet.mtu', '+ipv4.addresses', '+ipv4.dns', '-ipv4.addresses', '-ipv4.dns', '+ipv4.routes'] };
            if (verb === 'add') {
                if (args[idx - 1] === 'type') return { list: ['ethernet', 'bridge', 'bond', 'team', 'vlan', 'wifi', 'dummy', 'loopback'] };
                if (args[idx - 1] === 'ipv4.method') return { list: ['auto', 'manual', 'disabled', 'shared', 'link-local'] };
                if (args[idx - 1] === 'ifname') return { list: ['eth0', 'eth1', 'lo'] };
                return { list: ['type', 'ifname', 'con-name', 'autoconnect', 'save', 'ip4', 'gw4', 'ipv4.method', 'ipv4.addresses', 'ipv4.gateway', 'ipv4.dns', 'ipv6.method', 'master', 'slave-type', 'mode', 'id', 'dev'] };
            }
            if (verb === 'show' && idx > 3) return { list: ['id', 'uuid'] };
        }
        if (obj === 'device' || obj === 'dev' || obj === 'd') {
            if (['show', 'connect', 'disconnect', 'reapply', 'modify', 'delete'].includes(verb) && idx === 3) return { list: ['lo', 'eth0', 'eth1'] };
        }
        if (obj === 'networking' && verb === 'connectivity') return { list: ['check'] };
        return { list: [], only: false };
    }

    _podman(ctx) {
        const { args, partial: p, idx } = ctx;
        const pm = this.shared.podman;
        const st = pm && pm._store ? pm._store() : null;
        const ctrs = () => (st ? st.containers.map(c => c.name) : []);
        const imgs = () => (st && st.images ? Object.values(st.images).map(i => i.ref).filter(Boolean) : []);
        const top = ['attach', 'build', 'commit', 'container', 'cp', 'create', 'diff', 'events', 'exec', 'export', 'generate', 'history', 'image', 'images', 'import', 'info', 'init', 'inspect', 'kill', 'load', 'login', 'logout', 'logs', 'machine', 'network', 'pause', 'perfdata', 'pod', 'port', 'ps', 'pull', 'push', 'rename', 'restart', 'rm', 'rmi', 'run', 'save', 'search', 'secret', 'start', 'stats', 'stop', 'system', 'tag', 'top', 'unpause', 'unshare', 'untag', 'version', 'volume', 'wait'];
        if (p.startsWith('-')) {
            const verb = args[1];
            if (verb === 'run' || verb === 'create') return { list: ['-d', '-i', '-t', '-it', '-dit', '--rm', '--name', '-p', '-v', '-e', '--env', '--publish', '--volume', '--user', '--workdir', '--hostname', '--network', '--restart', '--entrypoint', '--memory', '--cpus', '--privileged', '--pull=', '--replace', '--cap-add', '--security-opt', '--label', '--env-file', '-P', '--detach', '--interactive', '--tty'] };
            if (verb === 'ps') return { list: ['-a', '--all', '-q', '--quiet', '--format', '--filter', '-f', '--no-trunc', '--sort', '-l'] };
            if (verb === 'rm') return { list: ['-f', '-a', '--all', '--force', '-v', '--volumes'] };
            if (verb === 'exec') return { list: ['-i', '-t', '-it', '-u', '--user', '-w', '--workdir', '-e', '--env', '--privileged'] };
            if (verb === 'logs') return { list: ['-f', '--follow', '-n', '--tail', '--since', '-t', '--timestamps'] };
            if (verb === 'start') return { list: ['-a', '--attach', '-i', '--interactive', '-ai'] };
            return { list: ['--help', '--version', '--log-level=', '--root', '--runroot'] };
        }
        if (idx === 1) return { list: top };
        const verb = args[1];
        const pos = args.slice(2).filter(a => !a.startsWith('-')).length;
        if (['image', 'container', 'volume', 'network', 'system', 'pod', 'machine', 'secret'].includes(verb) && idx === 2) {
            const subs = { image: ['ls', 'list', 'pull', 'rm', 'inspect', 'tag', 'build', 'prune', 'exists', 'history', 'push', 'save', 'load', 'tree'], container: ['ls', 'list', 'run', 'start', 'stop', 'restart', 'rm', 'exec', 'logs', 'inspect', 'kill', 'port', 'top', 'create', 'exists', 'prune', 'commit', 'cp', 'diff'], volume: ['ls', 'create', 'rm', 'inspect', 'prune', 'exists'], network: ['ls', 'create', 'rm', 'inspect', 'prune', 'connect', 'disconnect'], system: ['prune', 'df', 'info', 'reset', 'migrate', 'service'], pod: ['create', 'ps', 'rm', 'start', 'stop'], machine: ['init', 'start', 'stop', 'ls'], secret: ['create', 'ls', 'rm', 'inspect'] };
            return { list: subs[verb] };
        }
        if (['start', 'stop', 'restart', 'rm', 'kill', 'logs', 'inspect', 'port', 'top', 'attach', 'pause', 'unpause', 'rename', 'exec', 'stats', 'diff', 'wait', 'export', 'commit', 'cp'].includes(verb)) {
            if (verb === 'exec' && pos > 1) return null;
            if (verb === 'cp') return { list: ctrs().map(c => c + ':') };
            return { list: ctrs() };
        }
        if (['run', 'create'].includes(verb)) {
            const optWithVal = ['--name', '-p', '-v', '-e', '--user', '-u', '--workdir', '-w', '--hostname', '-h', '--network', '--restart', '--entrypoint', '--memory', '-m', '--cpus', '--pull', '--label', '-l', '--env', '--publish', '--volume'];
            if (optWithVal.includes(args[idx - 1])) return args[idx - 1] === '--network' ? { list: ['host', 'bridge', 'none', 'slirp4netns', 'pasta'], only: true } : args[idx - 1] === '--restart' ? { list: ['no', 'always', 'on-failure', 'unless-stopped'], only: true } : args[idx - 1] === '-v' || args[idx - 1] === '--volume' ? null : { list: [], only: true };
            const imagePositions = args.slice(2).filter((a, i, arr) => !a.startsWith('-') && !optWithVal.includes(arr[i - 1]));
            if (imagePositions.length === 0) return { list: imgs().concat(['registry.access.redhat.com/ubi9/ubi', 'registry.access.redhat.com/ubi9/ubi-minimal', 'registry.access.redhat.com/ubi8/ubi', 'docker.io/library/nginx', 'docker.io/library/httpd', 'docker.io/library/alpine', 'docker.io/library/redis', 'docker.io/library/busybox', 'ubi9', 'ubi8']) };
            return null;
        }
        if (['rmi', 'tag', 'inspect', 'history', 'push', 'save', 'untag', 'pull'].includes(verb)) return { list: verb === 'pull' ? ['registry.access.redhat.com/ubi9/ubi', 'registry.access.redhat.com/ubi9/ubi-minimal', 'registry.access.redhat.com/ubi8/ubi', 'docker.io/library/nginx', 'docker.io/library/httpd', 'docker.io/library/alpine', 'ubi9', 'ubi8'] : imgs() };
        if (verb === 'generate') return idx === 2 ? { list: ['systemd', 'kube'] } : { list: ctrs().concat(['--name', '--files', '--new', '--restart-policy=']) };
        return null;
    }

    _git(ctx) {
        const { args, partial: p, idx } = ctx;
        const subs = ['add', 'branch', 'checkout', 'clone', 'commit', 'config', 'diff', 'fetch', 'init', 'log', 'merge', 'mv', 'pull', 'push', 'remote', 'reset', 'restore', 'rm', 'show', 'stash', 'status', 'switch', 'tag', 'rebase', 'cherry-pick', 'revert', 'blame', 'bisect', 'grep', 'clean'];
        if (idx === 1) return { list: subs };
        const sub = args[1];
        if (p.startsWith('-')) {
            const o = { commit: ['-m', '-a', '-am', '--amend', '--no-edit', '-v', '-s'], log: ['--oneline', '--graph', '--stat', '-n', '--all', '--decorate', '-p', '--author='], add: ['-A', '-u', '-p', '-n', '--all'], status: ['-s', '-b', '--short', '--branch'], diff: ['--staged', '--cached', '--stat', '--name-only'], branch: ['-a', '-d', '-D', '-m', '-r', '-v', '--list'], checkout: ['-b', '-B', '--'], reset: ['--hard', '--soft', '--mixed'], config: ['--global', '--list', '--unset', '--local'], push: ['-u', '--force', '--tags', '--set-upstream'], clone: ['--depth=', '-b', '--branch'] };
            return { list: o[sub] || [] };
        }
        const repo = this.shared.apps2 ? this.shared.apps2._gitRepo() : null;
        const branches = repo ? Object.keys(repo.state.branches) : [];
        if (['checkout', 'switch', 'merge', 'rebase', 'cherry-pick'].includes(sub)) return { list: branches.concat(repo ? Object.keys(repo.state.tags) : []) };
        if (sub === 'branch') return { list: branches };
        if (sub === 'remote') return idx === 2 ? { list: ['add', 'remove', 'rename', 'show', '-v', 'set-url', 'get-url'] } : { list: repo ? Object.keys(repo.state.remotes) : [] };
        if (['push', 'pull', 'fetch'].includes(sub)) return idx === 2 ? { list: repo ? Object.keys(repo.state.remotes) : [] } : { list: branches };
        if (sub === 'stash') return { list: ['push', 'pop', 'apply', 'list', 'drop', 'show', 'clear'] };
        if (sub === 'config') return { list: ['user.name', 'user.email', 'core.editor', 'init.defaultBranch', 'pull.rebase', 'alias.', 'color.ui', 'push.default'] };
        return null;
    }

    _firewall(ctx) {
        const { partial: p, args } = ctx;
        const services = ['ssh', 'http', 'https', 'dns', 'dhcp', 'dhcpv6-client', 'ftp', 'nfs', 'nfs3', 'mountd', 'rpc-bind', 'samba', 'samba-client', 'smtp', 'imap', 'imaps', 'pop3', 'pop3s', 'mysql', 'postgresql', 'ntp', 'cockpit', 'vnc-server', 'telnet', 'tftp', 'syslog', 'snmp', 'ldap', 'ldaps', 'kerberos', 'iscsi-target', 'libvirt', 'rsyncd', 'squid', 'vdsm'];
        const zones = ['public', 'trusted', 'drop', 'block', 'dmz', 'external', 'internal', 'home', 'work'];
        const val = /^(--[a-z-]+)=(.*)$/.exec(p);
        if (val) {
            const k = val[1];
            const pre = k + '=';
            if (['--add-service', '--remove-service', '--query-service'].includes(k)) return { list: services.map(s => pre + s), only: true };
            if (['--zone', '--set-default-zone', '--new-zone', '--delete-zone', '--add-interface', '--change-zone'].includes(k)) return k === '--zone' || k === '--set-default-zone' ? { list: zones.map(z => pre + z), only: true } : null;
            if (['--add-port', '--remove-port', '--query-port'].includes(k)) return { list: ['80/tcp', '443/tcp', '8080/tcp', '22/tcp', '53/udp', '2049/tcp', '3306/tcp', '5432/tcp', '9090/tcp'].map(s => pre + s), only: true, noSpace: false };
            if (k === '--add-source' || k === '--add-interface') return null;
            if (k === '--set-log-denied') return { list: ['all', 'unicast', 'broadcast', 'multicast', 'off'].map(s => pre + s), only: true };
            return null;
        }
        return { list: ['--state', '--reload', '--complete-reload', '--runtime-to-permanent', '--permanent', '--get-zones', '--get-default-zone', '--set-default-zone=', '--get-active-zones', '--get-services', '--list-all', '--list-all-zones', '--list-services', '--list-ports', '--list-interfaces', '--list-sources', '--list-rich-rules', '--zone=', '--add-service=', '--remove-service=', '--query-service=', '--add-port=', '--remove-port=', '--query-port=', '--add-source=', '--remove-source=', '--add-interface=', '--remove-interface=', '--change-interface=', '--add-rich-rule=', '--remove-rich-rule=', '--add-masquerade', '--remove-masquerade', '--query-masquerade', '--add-forward-port=', '--panic-on', '--panic-off', '--query-panic', '--new-zone=', '--delete-zone=', '--info-zone=', '--info-service=', '--get-log-denied', '--set-log-denied=', '--lockdown-on', '--lockdown-off', '--check-config', '--version', '--help', '--timeout=', '--direct'], noSpace: false };
    }

    _semanage(ctx) {
        const { args, partial: p, idx } = ctx;
        if (idx === 1) return { list: ['fcontext', 'port', 'boolean', 'login', 'user', 'permissive', 'node', 'interface', 'module', 'export', 'import', 'dontaudit', 'ibpkey', 'ibendport'] };
        const obj = args[1];
        if (idx === 2) return { list: ['-a', '-d', '-m', '-l', '-D', '-C', '--add', '--delete', '--modify', '--list', '--deleteall', '--extract'].filter(x => !x.startsWith('-')) .concat(['-l', '-a', '-d', '-m']) };
        if (p.startsWith('-')) {
            if (obj === 'fcontext') return { list: ['-a', '-d', '-m', '-l', '-t', '-s', '-f', '-e', '-C', '-D', '-N', '--add', '--delete', '--modify', '--list', '--type', '--equal', '--deleteall', '--noheading', '--locallist'] };
            if (obj === 'port') return { list: ['-a', '-d', '-m', '-l', '-t', '-p', '-C', '-D', '-N', '--add', '--delete', '--modify', '--list', '--type', '--proto', '--locallist', '--deleteall', '--noheading'] };
            if (obj === 'boolean') return { list: ['-l', '-m', '-1', '-0', '-C', '-D', '-N', '--list', '--modify', '--on', '--off', '--locallist', '--deleteall'] };
            if (obj === 'permissive') return { list: ['-a', '-d', '-l', '--add', '--delete', '--list'] };
            return { list: ['-a', '-d', '-m', '-l', '-D', '-C', '-N'] };
        }
        if (['-t', '--type'].includes(args[idx - 1])) return { list: ['httpd_sys_content_t', 'httpd_sys_rw_content_t', 'httpd_sys_script_exec_t', 'httpd_port_t', 'http_port_t', 'ssh_port_t', 'user_home_t', 'var_log_t', 'samba_share_t', 'public_content_t', 'public_content_rw_t', 'container_file_t', 'tmp_t', 'etc_t', 'mysqld_db_t', 'mysqld_port_t', 'nfs_t', 'cifs_t', 'usr_t', 'default_t', 'unconfined_t'], only: true };
        if (['-p', '--proto'].includes(args[idx - 1])) return { list: ['tcp', 'udp', 'dccp', 'sctp'], only: true };
        if (obj === 'boolean') return { list: this._booleans() };
        return null;
    }

    _booleans() {
        const se = this.shared.selinux;
        if (se && se.bools) return Object.keys(se.bools);
        if (se && se.booleans) return Object.keys(se.booleans);
        return ['httpd_can_network_connect', 'httpd_can_network_connect_db', 'httpd_enable_homedirs', 'httpd_read_user_content', 'httpd_unified', 'httpd_use_nfs', 'httpd_use_cifs', 'samba_enable_home_dirs', 'samba_export_all_rw', 'ftpd_anon_write', 'ftp_home_dir', 'nfs_export_all_rw', 'nfs_export_all_ro', 'use_nfs_home_dirs', 'container_manage_cgroup', 'virt_use_nfs', 'ssh_sysadm_login', 'mysql_connect_any', 'selinuxuser_ping', 'allow_ftpd_full_access', 'httpd_execmem', 'httpd_setrlimit', 'httpd_tmp_exec', 'httpd_can_sendmail', 'httpd_builtin_scripting', 'httpd_enable_cgi'];
    }

    _hosts() {
        const set = new Set(['localhost']);
        const h = this.fs.getNode('/etc/hosts');
        if (h && h.content) for (const l of h.content.split('\n')) { if (l.trim().startsWith('#')) continue; const f = l.trim().split(/\s+/).slice(1); f.forEach(x => x && set.add(x)); }
        const kh = this.fs.getNode(((this.fs.users[this.fs.currentUser] || {}).home || '/root') + '/.ssh/known_hosts');
        if (kh && kh.content) for (const l of kh.content.split('\n')) { const m = /^([^\s#]+)/.exec(l); if (m) m[1].split(',').forEach(x => set.add(x.replace(/^\[|\](:\d+)?$/g, ''))); }
        ['classroom.example.com', 'content.example.com', 'repo.example.com'].forEach(x => set.add(x));
        return Array.from(set);
    }

    _devices() {
        const set = [];
        const d = this.fs.getNode('/dev');
        if (d && d.children) for (const [k, c] of Object.entries(d.children)) if (/^(sd|vd|nvme|xvd|sr|loop|md|dm-|mapper|cdrom|fd)/.test(k) && c.type !== 'directory') set.push('/dev/' + k);
        const mp = this.fs.getNode('/dev/mapper');
        if (mp && mp.children) for (const k of Object.keys(mp.children)) if (k !== 'control') set.push('/dev/mapper/' + k);
        const st = this.shared.storage;
        if (st && st.stDisks) { /* disks created by the storage engine */ }
        return Array.from(new Set(set));
    }

    _lvmPaths() {
        const out = [];
        const d = this.fs.getNode('/dev');
        if (d && d.children) for (const [k, c] of Object.entries(d.children)) if (c.type === 'directory' && !['mapper', 'pts', 'shm', 'disk', 'block', 'char', 'net', 'bus', 'cpu', 'hugepages', 'mqueue'].includes(k)) { out.push('/dev/' + k + '/'); for (const lv of Object.keys(c.children || {})) out.push(`/dev/${k}/${lv}`); }
        return out;
    }

    _mountPoints() {
        const st = this.shared.storage;
        const out = [];
        if (st && st.stMounts) for (const m of st.stMounts) if (m.tgt && m.tgt !== '/') out.push(m.tgt);
        return Array.from(new Set(out));
    }

    _timezones() {
        return ['UTC', 'Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo', 'Africa/Cairo', 'Africa/Johannesburg', 'Pacific/Auckland', 'GMT', 'EST', 'PST8PDT', 'Etc/UTC'];
    }

    _tunedProfiles() {
        const t = this.shared.tune;
        if (t && Array.isArray(t.profiles)) return t.profiles.map(p => p[0]).concat(t._customProfiles ? t._customProfiles() : []);
        const out = ['accelerator-performance', 'balanced', 'desktop', 'hpc-compute', 'intel-sst', 'latency-performance', 'network-latency', 'network-throughput', 'optimize-serial-console', 'powersave', 'throughput-performance', 'virtual-guest', 'virtual-host'];
        const d = this.fs.getNode('/etc/tuned');
        if (d && d.children) for (const [k, c] of Object.entries(d.children)) if (c.type === 'directory') out.push(k);
        return Array.from(new Set(out));
    }

    _sysctlKeys() {
        const out = [];
        const walk = (n, prefix) => {
            for (const [k, c] of Object.entries(n.children || {})) {
                if (c.type === 'directory') walk(c, prefix + k + '.'); else out.push(prefix + k);
            }
        };
        const root = this.fs.getNode('/proc/sys');
        if (root) walk(root, '');
        return out;
    }
}

if (typeof window !== 'undefined') {
    window.CompletionEngine = CompletionEngine;
}
