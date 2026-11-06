// Login sessions: su, sudo (with /etc/sudoers rules), interactive passwd, chpasswd, exit back to the previous user
// Part of Red Cat RHCSA Terminal Simulator
//
// `su - bob` really switches the prompt, home directory and identity until `exit`; `sudo` checks sudoers, asks for a
// password the first time, logs to /var/log/secure and runs the command as the target user.

class SessionEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.session = this;
        this.stack = [];
        this.sudoStamp = {};           // user -> time of the last successful sudo password
        this.nextPid = 4300;
        const root = this.fs.users.root;
        if (root && root.pwText === undefined) root.pwText = 'redhat';
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    get parent() { return this.shared.parent; }
    _sh() { return typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _emit(text) { const io = this.parent._curIo; if (io && text) io.out(text); }
    _ask(prompt, secret) { const sh = this._sh(); if (!sh) return null; return sh.takeInput({ mode: 'line', prompt, secret: !!secret }); }

    _secure(msg) {
        const path = '/var/log/secure';
        let n = this.fs.getNode(path);
        const tm = this._tm();
        const stamp = tm ? tm.format(this._now(), tm.tm.tz, '%b %e %H:%M:%S') : '';
        const line = `${stamp} ${this.parent.hostname} ${msg}\n`;
        if (!n) {
            const dir = this.fs.getNode('/var/log');
            if (!dir || !dir.children) return;
            dir.children.secure = { type: 'file', permissions: '0600', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' };
            n = dir.children.secure;
        }
        n.content = (n.content || '') + line;
        n.size = n.content.length;
        n.modified = new Date();
    }

    _pid() { return this.nextPid++; }

    _pwOk(user, pw) {
        const u = this.fs.users[user];
        if (!u) return false;
        if (u.pw === 'none') return true;
        if (u.locked || u.pw === 'locked') return false;
        if (u.pwText !== undefined) return pw === u.pwText;
        return pw !== '' && pw !== null && pw !== undefined;
    }

    // ===== identity switching =====
    _loginEnv(user, login) {
        const u = this.fs.users[user];
        const env = this.shared.env;
        env.HOME = u.home; env.USER = user; env.LOGNAME = user; env.SHELL = u.shell || '/bin/bash';
        if (login) env.PATH = user === 'root' ? '/root/.local/bin:/root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin' : `/home/${user}/.local/bin:/home/${user}/bin:/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin`;
    }

    _push(user, login) {
        this.stack.push({ user: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid, cwd: this.fs.currentPath, env: Object.assign({}, this.shared.env) });
        const u = this.fs.users[user];
        this.fs.currentUser = user; this.fs.currentUid = u.uid; this.fs.currentGid = u.gid;
        this._loginEnv(user, login);
        if (login) this.fs.currentPath = u.home;
    }

    sessionExit() {
        if (!this.stack.length) return false;
        const s = this.stack.pop();
        this.fs.currentUser = s.user; this.fs.currentUid = s.uid; this.fs.currentGid = s.gid; this.fs.currentPath = s.cwd;
        for (const k of Object.keys(this.shared.env)) delete this.shared.env[k];
        Object.assign(this.shared.env, s.env);
        return true;
    }

    // run a command line as another user and restore the identity afterwards
    _runAs(user, cmdline, stdin, login, keepCwd) {
        const u = this.fs.users[user];
        const sh = this._sh();
        if (!sh) return this._err('cannot run: shell not available', 1);
        const saved = { user: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid, cwd: this.fs.currentPath, env: Object.assign({}, this.shared.env) };
        const o = [], e = [];
        const io = { stdin: { text: stdin || '', pos: 0 }, out: (s) => { if (s) o.push(s); }, err: (s) => { if (s) e.push(s); }, piped: true, hasStdin: !!stdin };
        this.fs.currentUser = user; this.fs.currentUid = u.uid; this.fs.currentGid = u.gid;
        this._loginEnv(user, login);
        if (login) this.fs.currentPath = u.home; else if (!keepCwd) this.fs.currentPath = saved.cwd;
        let rc = 0;
        try {
            rc = sh.runScriptText(cmdline, 'sudo', [], io);
        } finally {
            this.fs.currentUser = saved.user; this.fs.currentUid = saved.uid; this.fs.currentGid = saved.gid; this.fs.currentPath = saved.cwd;
            for (const k of Object.keys(this.shared.env)) delete this.shared.env[k];
            Object.assign(this.shared.env, saved.env);
        }
        return { stdout: o.join(''), stderr: e.join(''), exitCode: rc, rawStdout: o.join('') };
    }

    // ===== su =====
    su(args) {
        let login = false, cmd = null, shell = null, target = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-' || a === '-l' || a === '--login') login = true;
            else if (a === '-c' || a === '--command') cmd = args[++i];
            else if (a.startsWith('--command=')) cmd = a.slice(10);
            else if (a === '-s' || a === '--shell') shell = args[++i];
            else if (a === '-m' || a === '-p' || a === '--preserve-environment') { /* keep env */ }
            else if (a === '--help') return this._ok('Usage:\n su [options] [-] [USER [argument...]]\n\nChange the effective user ID and group ID to that of USER.');
            else if (a.startsWith('-') && a.length > 1) { for (const ch of a.slice(1)) { if (ch === 'l') login = true; } }
            else if (!target) target = a;
        }
        target = target || 'root';
        const u = this.fs.users[target];
        if (!u) return this._err(`su: user ${target} does not exist or the user entry does not contain all the required fields`, 1);
        const me = this.fs.currentUser;
        if (this.fs.currentUid !== 0) {
            const pw = this._ask('Password: ', true);
            if (pw === null || !this._pwOk(target, pw)) {
                this._secure(`su[${this._pid()}]: pam_unix(su${login ? '-l' : ''}:auth): authentication failure; logname=${me} uid=${this.fs.currentUid} euid=${this.fs.users[me] ? this.fs.users[me].uid : 0} tty=/dev/pts/0 ruser=${me} rhost=  user=${target}`);
                return this._err('su: Authentication failure', 1);
            }
        }
        if (/nologin|false$/.test(shell || u.shell || '') && this.fs.currentUid !== 0) return this._err('This account is currently not available.', 1);
        this._secure(`su[${this._pid()}]: pam_unix(su${login ? '-l' : ''}:session): session opened for user ${target}(uid=${u.uid}) by ${me}(uid=${this.fs.currentUid})`);
        if (cmd !== null) {
            const r = this._runAs(target, cmd, '', login);
            this._secure(`su[${this._pid()}]: pam_unix(su:session): session closed for user ${target}`);
            return r;
        }
        this._push(target, login);
        return this._ok('');
    }

    // ===== sudoers =====
    _sudoers() {
        const lines = [];
        const read = (p) => { const n = this.fs.getNode(p); if (n && n.type === 'file') lines.push(...(n.content || '').split('\n')); };
        read('/etc/sudoers');
        const d = this.fs.getNode('/etc/sudoers.d');
        if (d && d.children) for (const f of Object.keys(d.children).sort()) if (!f.includes('.') && !f.endsWith('~')) read('/etc/sudoers.d/' + f);
        return lines.map(l => l.trim()).filter(l => l && !l.startsWith('#') && !/^Defaults/.test(l) && !/^(User_Alias|Cmnd_Alias|Host_Alias|Runas_Alias)/.test(l));
    }

    _groupsOf(user) {
        const out = [];
        for (const [g, v] of Object.entries(this.fs.groups)) if (v.members.includes(user) || (this.fs.users[user] && this.fs.users[user].gid === v.gid)) out.push(g);
        return out;
    }

    // returns { any: bool (user matches at least one rule), allowed: bool, nopasswd: bool }
    _sudoCheck(user, runas, cmdPath) {
        if (user === 'root') return { any: true, allowed: true, nopasswd: true };
        const groups = this._groupsOf(user);
        const host = this.parent.hostname;
        let any = false, allowed = false, nopasswd = false;
        for (const l of this._sudoers()) {
            const m = /^(%?[\w.@-]+|ALL)\s+([\w.*-]+)\s*=\s*(?:\(([^)]*)\))?\s*(.*)$/.exec(l);
            if (!m) continue;
            const who = m[1];
            const matches = who === 'ALL' || (who.startsWith('%') ? groups.includes(who.slice(1)) : who === user);
            if (!matches) continue;
            if (m[2] !== 'ALL' && m[2] !== host && m[2] !== host.split('.')[0]) continue;
            any = true;
            const ru = (m[3] || 'ALL').split(':')[0].trim();
            if (ru !== 'ALL' && ru !== runas && !ru.split(',').map(s => s.trim()).includes(runas)) continue;
            let rest = m[4];
            let np = false;
            const tags = /^((?:[A-Z]+:\s*)+)/.exec(rest);
            if (tags) { np = /NOPASSWD/.test(tags[1]); rest = rest.slice(tags[1].length); }
            const cmds = rest.split(',').map(s => s.trim()).filter(Boolean);
            const ok = cmds.some(c => c === 'ALL' || c === cmdPath || (c.endsWith('/*') && cmdPath.startsWith(c.slice(0, -1))) || (c.split(/\s+/)[0] === cmdPath));
            if (ok) { allowed = true; nopasswd = nopasswd || np; }
        }
        return { any, allowed, nopasswd };
    }

    _resolveCmd(name) {
        if (name.includes('/')) return name;
        for (const d of ['/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin']) { const n = this.fs.getNode(d + '/' + name); if (n && n.type === 'file') return d + '/' + name; }
        const sh = this._sh();
        if (sh && sh.t.commandMethod(name)) return '/usr/bin/' + name;
        return null;
    }

    sudo(args) {
        let user = 'root', login = false, shellMode = false, list = false, kill = false, validate = false, nonInteractive = false, stdinPw = false;
        const rest = [];
        let i = 0;
        for (; i < args.length; i++) {
            const a = args[i];
            if (a === '--') { i++; break; }
            if (!a.startsWith('-') ) break;
            if (a === '-u' || a === '--user') user = args[++i];
            else if (a.startsWith('--user=')) user = a.slice(7);
            else if (a === '-i' || a === '--login') login = true;
            else if (a === '-s' || a === '--shell') shellMode = true;
            else if (a === '-l' || a === '--list') list = true;
            else if (a === '-k' || a === '-K' || a === '--reset-timestamp' || a === '--remove-timestamp') kill = true;
            else if (a === '-v' || a === '--validate') validate = true;
            else if (a === '-n' || a === '--non-interactive') nonInteractive = true;
            else if (a === '-S' || a === '--stdin') stdinPw = true;
            else if (a === '-g' || a === '--group' || a === '-p' || a === '--prompt' || a === '-C' || a === '-h' && false) i++;
            else if (a === '-V' || a === '--version') return this._ok('Sudo version 1.9.5p2');
            else if (a === '-E' || a === '-H' || a === '-b' || a === '-A' || a === '--preserve-env' || a.startsWith('--preserve-env=') || a.startsWith('-E')) { /* tolerated */ }
            else if (a === '--help' || a === '-h') return this._ok('sudo - execute a command as another user\n\nusage: sudo -h | -K | -k | -V\nusage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]\nusage: sudo -l [-ABkNnS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]\nusage: sudo [-ABbEHkNnPS] [-r role] [-t type] [-C num] [-D directory] [-g group] [-h host] [-p prompt] [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [<command>]');
            else return this._err(`sudo: invalid option -- '${a.replace(/^-+/, '')}'\nusage: sudo -h | -K | -k | -V`, 1);
        }
        const cmdArgs = args.slice(i);
        const me = this.fs.currentUser;
        if (kill && !cmdArgs.length) { delete this.sudoStamp[me]; return this._ok(''); }
        if (!list && !validate && !login && !shellMode && !cmdArgs.length) return this._err('usage: sudo -h | -K | -k | -V\nusage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]\nusage: sudo -l [-ABkNnS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]', 1);
        if (!this.fs.users[user]) return this._err(`sudo: unknown user ${user}`, 1);
        if (kill) delete this.sudoStamp[me];
        const pid = this._pid();
        const cwd = this.fs.currentPath;
        const first = cmdArgs[0];
        const cmdPath = login || shellMode ? (this.fs.users[user].shell || '/bin/bash') : (first ? this._resolveCmd(first) : null);
        // authorisation
        const chk = this._sudoCheck(me, user, cmdPath || '');
        const stamp = this.sudoStamp[me];
        const fresh = stamp && (this._now() - stamp) < 5 * 60 * 1000;
        let authed = false;
        if (me !== 'root' && !(chk.allowed && chk.nopasswd) && !fresh) {
            if (nonInteractive) return this._err('sudo: a password is required', 1);
            let ok = false;
            for (let t = 0; t < 3 && !ok; t++) {
                const pw = this._ask(`[sudo] password for ${me}: `, true);
                if (pw === null) return this._err(`sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper\nsudo: a password is required`, 1);
                if (this._pwOk(me, pw)) ok = true;
                else if (t < 2) this._emit('Sorry, try again.\n');
            }
            if (!ok) { this._secure(`sudo[${pid}]: pam_unix(sudo:auth): authentication failure; logname=${me} uid=${this.fs.currentUid} euid=0 tty=/dev/pts/0 ruser=${me} rhost=  user=${me}`); this._secure(`sudo[${pid}]:     ${me} : 3 incorrect password attempts ; TTY=pts/0 ; PWD=${cwd} ; USER=${user} ; COMMAND=${cmdPath || ''}`); return this._err('sudo: 3 incorrect password attempts', 1); }
            authed = true;
        }
        if (!chk.any) {
            this._secure(`sudo[${pid}]:     ${me} : user NOT in sudoers ; TTY=pts/0 ; PWD=${cwd} ; USER=${user} ; COMMAND=${cmdPath || (first || '')}${cmdArgs.length > 1 ? ' ' + cmdArgs.slice(1).join(' ') : ''}`);
            return this._err(`${me} is not in the sudoers file.`, 1);
        }
        if (authed || (fresh && chk.allowed)) this.sudoStamp[me] = this._now();
        if (list) {
            const rules = this._sudoers().filter(l => { const m = /^(%?[\w.@-]+|ALL)\s/.exec(l); return m && (m[1] === 'ALL' || (m[1].startsWith('%') ? this._groupsOf(me).includes(m[1].slice(1)) : m[1] === me)); });
            const lines = [`Matching Defaults entries for ${me} on ${this.parent.hostname}:`, '    !visiblepw, always_set_home, match_group_by_gid, always_query_group_plugin, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS LC_CTYPE", secure_path=/sbin\\:/bin\\:/usr/sbin\\:/usr/bin', '', `User ${me} may run the following commands on ${this.parent.hostname}:`];
            for (const r of rules) { const m = /^\S+\s+\S+\s*=\s*(?:\(([^)]*)\))?\s*(.*)$/.exec(r); lines.push(`    (${m && m[1] ? m[1] : 'ALL'}) ${m ? m[2] : 'ALL'}`); }
            if (me === 'root') lines.push('    (ALL) ALL');
            return this._ok(lines.join('\n'));
        }
        if (validate && !cmdArgs.length) return this._ok('');
        if (!chk.allowed) {
            this._secure(`sudo[${pid}]:     ${me} : command not allowed ; TTY=pts/0 ; PWD=${cwd} ; USER=${user} ; COMMAND=${cmdPath || first}`);
            return this._err(`Sorry, user ${me} is not allowed to execute '${cmdPath || first}${cmdArgs.length > 1 ? ' ' + cmdArgs.slice(1).join(' ') : ''}' as ${user} on ${this.parent.hostname}.`, 1);
        }
        if (login || shellMode) {
            this._secure(`sudo[${pid}]:     ${me} : TTY=pts/0 ; PWD=${cwd} ; USER=${user} ; COMMAND=${this.fs.users[user].shell || '/bin/bash'}`);
            this._secure(`sudo[${pid}]: pam_unix(sudo:session): session opened for user ${user}(uid=${this.fs.users[user].uid}) by ${me}(uid=${this.fs.currentUid})`);
            if (cmdArgs.length) { const r = this._runAs(user, cmdArgs.join(' '), '', login); return r; }
            this._push(user, login);
            return this._ok('');
        }
        if (!cmdPath) return this._err(`sudo: ${first}: command not found`, 1);
        this._secure(`sudo[${pid}]:     ${me} : TTY=pts/0 ; PWD=${cwd} ; USER=${user} ; COMMAND=${cmdPath}${cmdArgs.length > 1 ? ' ' + cmdArgs.slice(1).join(' ') : ''}`);
        this._secure(`sudo[${pid}]: pam_unix(sudo:session): session opened for user ${user}(uid=${this.fs.users[user].uid}) by ${me}(uid=${this.fs.currentUid})`);
        const quote = (w) => (/^[A-Za-z0-9_@%+=:,./-]+$/.test(w) ? w : "'" + w.replace(/'/g, "'\\''") + "'");
        const stdinText = this.parent._hasStdin ? '' : '';
        return this._runAs(user, cmdArgs.map(quote).join(' '), '', false, true);
    }

    // ===== passwd (interactive) and chpasswd =====
    installHooks(parent) {
        this._prevPasswd = parent.passwd;
        parent.passwd = (args, stdin) => this._passwd(args, stdin);
    }

    _weak(pw) {
        if (pw.length < 8) return 'BAD PASSWORD: The password is shorter than 8 characters';
        if (/^(password|12345678|qwertyui|redhat12|letmein1)/i.test(pw) || ['password', 'redhat', 'qwerty123', 'admin123'].includes(pw.toLowerCase())) return 'BAD PASSWORD: The password fails the dictionary check - it is based on a dictionary word';
        return null;
    }

    _passwd(args, stdin) {
        const pos = args.filter(a => !a.startsWith('-'));
        const stdinMode = args.includes('--stdin');
        const opts = args.filter(a => a.startsWith('-') && a !== '--stdin');
        if (opts.length) return this._prevPasswd(args, stdin);
        const username = pos[0] || this.fs.currentUser;
        const u = this.fs.users[username];
        if (stdinMode) {
            const r = this._prevPasswd(args, stdin);
            if (!r.exitCode && u) u.pwText = String(stdin || '').split('\n')[0];
            return r;
        }
        if (!u) return this._err(`passwd: user '${username}' does not exist`, 1);
        const self = username === this.fs.currentUser;
        const root = this.fs.currentUid === 0;
        if (!self && !root) return this._err(`passwd: You may not view or modify password information for ${username}.`, 1);
        if (!this._sh()) return this._prevPasswd(args, stdin);
        this._emit(`Changing password for user ${username}.\n`);
        if (!root) {
            this._emit(`Changing password for ${username}.\n`);
            const cur = this._ask('Current password: ', true);
            if (cur === null || !this._pwOk(username, cur)) return this._err('passwd: Authentication token manipulation error', 10);
        }
        for (let attempt = 0; attempt < 3; attempt++) {
            const p1 = this._ask('New password: ', true);
            if (p1 === null) return this._err('passwd: Authentication token manipulation error', 10);
            const weak = this._weak(p1);
            if (weak) {
                this._emit(weak + '\n');
                if (!root) { if (attempt === 2) return this._err('passwd: Have exhausted maximum number of retries for service', 10); continue; }
            }
            const p2 = this._ask('Retype new password: ', true);
            if (p2 === null) return this._err('passwd: Authentication token manipulation error', 10);
            if (p1 !== p2) {
                this._emit('Sorry, passwords do not match.\n');
                if (root) return this._err('passwd: Authentication token manipulation error', 10);
                if (attempt === 2) return this._err('passwd: Have exhausted maximum number of retries for service', 10);
                continue;
            }
            const r = this._prevPasswd(['--stdin', username], p1 + '\n');
            if (r.exitCode) return r;
            u.pwText = p1;
            this._secure(`passwd[${this._pid()}]: pam_unix(passwd:chauthtok): password changed for ${username}`);
            return this._ok('passwd: all authentication tokens updated successfully.');
        }
        return this._err('passwd: Have exhausted maximum number of retries for service', 10);
    }

    chpasswd(args, stdin) {
        if (this.fs.currentUid !== 0) return this._err('chpasswd: Permission denied.', 1);
        const lines = String(stdin || '').split('\n').filter(l => l.trim());
        if (!lines.length) return this._ok('');
        const errs = [];
        const sets = [];
        lines.forEach((l, i) => {
            const idx = l.indexOf(':');
            if (idx < 0) { errs.push(`chpasswd: line ${i + 1}: missing new password`); return; }
            const user = l.slice(0, idx), pw = l.slice(idx + 1);
            if (!this.fs.users[user]) { errs.push(`chpasswd: line ${i + 1}: user '${user}' does not exist`); return; }
            sets.push([user, pw]);
        });
        if (errs.length) return { stdout: '', stderr: errs.join('\n') + '\nchpasswd: error detected, changes ignored', exitCode: 1 };
        for (const [user, pw] of sets) {
            const r = this._prevPasswd(['--stdin', user], pw + '\n');
            if (r.exitCode) return r;
            this.fs.users[user].pwText = pw;
        }
        return this._ok('');
    }
}

if (typeof window !== 'undefined') {
    window.SessionEngine = SessionEngine;
}
