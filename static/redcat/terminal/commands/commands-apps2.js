// git, jq, bc/dc and openssl
// Part of Red Cat RHCSA Terminal Simulator
//
// git keeps a small repository in .git (commits, branches, index) so init/add/commit/status/log/diff/branch/checkout/
// merge behave consistently. jq runs a useful subset of the filter language. bc does decimal arithmetic with scale.
// openssl creates keys and self-signed certificates whose subject, dates and modulus can be inspected again.

class AppEngine2 {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.apps2 = this;
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    get parent() { return this.shared.parent; }
    _sh() { return typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _fmt(d, f) { const tm = this._tm(); return tm ? tm.format(d, tm.tm.tz, f) : d.toISOString(); }
    _isRoot() { return this.fs.currentUid === 0; }
    _home() { return (this.fs.users[this.fs.currentUser] || {}).home || '/root'; }
    _emit(text) { const io = this.parent._curIo; if (io && text) io.out(text); }
    _ask(prompt, secret) { const sh = this._sh(); return sh ? sh.takeInput({ mode: 'line', prompt, secret: !!secret }) : ''; }
    _hex(n) { let s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; }
    _b64(n) { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let s = ''; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * 64)]; return s; }
    _flags(args, valued) {
        const o = {}, rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '--') { rest.push(...args.slice(i + 1)); break; }
            if (a.startsWith('--')) { const [k, v] = a.slice(2).split('='); o[k] = v === undefined ? true : v; continue; }
            if (/^-[A-Za-z]/.test(a)) {
                for (let j = 1; j < a.length; j++) {
                    const ch = a[j];
                    if (valued && valued.includes(ch)) { o[ch] = a.slice(j + 1) || args[++i]; break; }
                    o[ch] = true;
                }
                continue;
            }
            rest.push(a);
        }
        return { o, rest };
    }
    _readFile(f) { const n = this.fs.getNode(this.fs.resolvePath(f)); return n && n.type === 'file' ? n.content || '' : null; }
    _write(path, content, mode) {
        const abs = this.fs.resolvePath(path);
        const parts = abs.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        const old = cur.children[name];
        cur.children[name] = { type: 'file', permissions: mode || (old ? old.permissions : '0644'), owner: old ? old.owner : this.fs.currentUser, group: old ? old.group : this.fs.currentUser, size: content.length, modified: new Date(), content };
    }
    _writable(path) { const par = this.fs.getNode(this.fs.resolvePath(path).replace(/\/[^/]*$/, '') || '/'); return par && par.children && this.fs.hasPermission(par, 'w'); }
    _sha1(s) { return UTIL_HASH.sha1(UTIL_HASH.utf8(s)); }

    // =========================================================== git
    git(args) {
        const g = { args: args.slice() };
        // global options
        while (g.args.length && g.args[0].startsWith('-') && !['--version', '--help', '-h'].includes(g.args[0])) {
            const a = g.args.shift();
            if (a === '-C') { g.cwd = g.args.shift(); } else if (a === '-c') g.args.shift();
        }
        const cmd = g.args.shift();
        const rest = g.args;
        if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') return this._ok('usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]\n           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]\n           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]\n           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]\n           [--super-prefix=<path>] [--config-env=<name>=<envvar>]\n           <command> [<args>]\n\nThese are common Git commands used in various situations:\n\nstart a working area (see also: git help tutorial)\n   clone     Clone a repository into a new directory\n   init      Create an empty Git repository or reinitialize an existing one\n\nwork on the current change (see also: git help everyday)\n   add       Add file contents to the index\n   mv        Move or rename a file, a directory, or a symlink\n   restore   Restore working tree files\n   rm        Remove files from the working tree and from the index\n\nexamine the history and state (see also: git help revisions)\n   diff      Show changes between commits, commit and working tree, etc\n   log       Show commit logs\n   show      Show various types of objects\n   status    Show the working tree status\n\ngrow, mark and tweak your common history\n   branch    List, create, or delete branches\n   commit    Record changes to the repository\n   merge     Join two or more development histories together\n   switch    Switch branches\n   tag       Create, list, delete or verify a tag object signed with GPG\n\ncollaborate (see also: git help workflows)\n   fetch     Download objects and refs from another repository\n   pull      Fetch from and integrate with another repository or a local branch\n   push      Update remote refs along with associated objects');
        if (cmd === '--version' || cmd === 'version') return this._ok('git version 2.39.3');
        if (cmd === 'init') return this._gitInit(rest);
        if (cmd === 'clone') return this._gitClone(rest);
        if (cmd === 'config') return this._gitConfig(rest);
        const repo = this._gitRepo();
        if (!repo) return this._err('fatal: not a git repository (or any of the parent directories): .git', 128);
        const R = repo;
        const h = {
            add: () => this._gitAdd(R, rest), status: () => this._gitStatus(R, rest), commit: () => this._gitCommit(R, rest), log: () => this._gitLog(R, rest),
            diff: () => this._gitDiff(R, rest), branch: () => this._gitBranch(R, rest), checkout: () => this._gitCheckout(R, rest), switch: () => this._gitCheckout(R, rest, true),
            restore: () => this._gitRestore(R, rest), reset: () => this._gitReset(R, rest), rm: () => this._gitRm(R, rest), mv: () => this._gitMv(R, rest),
            merge: () => this._gitMerge(R, rest), tag: () => this._gitTag(R, rest), remote: () => this._gitRemote(R, rest), show: () => this._gitShow(R, rest),
            push: () => this._gitNet(R, 'push', rest), pull: () => this._gitNet(R, 'pull', rest), fetch: () => this._gitNet(R, 'fetch', rest), stash: () => this._gitStash(R, rest)
        };
        if (!h[cmd]) return this._err(`git: '${cmd}' is not a git command. See 'git --help'.`, 1);
        const res = h[cmd]();
        if (!res.noSave) this._gitSave(R);
        return res;
    }

    _gitRepo() {
        let p = this.fs.currentPath;
        while (true) {
            const n = this.fs.getNode(p + '/.git');
            if (n && n.type === 'directory') {
                const st = n.children['rc.json'];
                let state = null;
                try { state = st ? JSON.parse(st.content) : null; } catch (e) { state = null; }
                if (!state) return null;
                return { root: p === '/' ? '' : p, gitNode: n, state };
            }
            if (p === '/') return null;
            p = p.replace(/\/[^/]*$/, '') || '/';
        }
    }

    _gitSave(R) { R.gitNode.children['rc.json'] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: JSON.stringify(R.state) }; }

    _gitConfigGet(R, key) {
        const read = (path) => { const n = this.fs.getNode(path); return n && n.content ? n.content : ''; };
        const parse = (text) => {
            const out = {}; let sec = '';
            for (const l of text.split('\n')) {
                const m = /^\s*\[([^\]\s"]+)(?:\s+"([^"]+)")?\]/.exec(l);
                if (m) { sec = m[2] ? `${m[1]}.${m[2]}` : m[1]; continue; }
                const kv = /^\s*([A-Za-z][\w-]*)\s*=\s*(.*)$/.exec(l);
                if (kv && sec) out[`${sec}.${kv[1]}`.toLowerCase()] = kv[2].trim();
            }
            return out;
        };
        const local = R ? parse(read(R.root + '/.git/config')) : {};
        const glob = parse(read(this._home() + '/.gitconfig'));
        const merged = Object.assign({}, glob, local);
        return key ? merged[key.toLowerCase()] : merged;
    }

    _gitConfigSet(file, key, val) {
        const [sec, ...rest] = key.split('.');
        const name = rest.pop();
        const section = rest.length ? `${sec} "${rest.join('.')}"` : sec;
        const n = this.fs.getNode(file);
        let text = n && n.content ? n.content : '';
        const header = `[${section}]`;
        if (!text.includes(header)) text += (text && !text.endsWith('\n') ? '\n' : '') + header + '\n';
        const lines = text.split('\n');
        const i = lines.indexOf(header);
        let j = i + 1, replaced = false;
        while (j < lines.length && !/^\[/.test(lines[j])) { if (new RegExp('^\\s*' + name + '\\s*=', 'i').test(lines[j])) { lines[j] = `\t${name} = ${val}`; replaced = true; } j++; }
        if (!replaced) lines.splice(i + 1, 0, `\t${name} = ${val}`);
        this._write(file, lines.join('\n').replace(/\n*$/, '\n'));
    }

    _gitConfig(rest) {
        const R = this._gitRepo();
        const glob = rest.includes('--global') || rest.includes('--system');
        const a = rest.filter(x => !x.startsWith('--'));
        if (rest.includes('--list') || rest.includes('-l')) {
            const all = this._gitConfigGet(glob ? null : R);
            const glo = glob ? (() => { const x = {}; const t = this.fs.getNode(this._home() + '/.gitconfig'); return x; })() : null;
            const m = glob ? this._gitConfigGet(null) : all;
            return this._ok(Object.entries(m).map(([k, v]) => `${k}=${v}`).join('\n'));
        }
        if (rest.includes('--unset')) return this._ok('');
        if (a.length === 1) { const v = this._gitConfigGet(glob ? null : R, a[0]); return v === undefined ? { stdout: '', stderr: '', exitCode: 1 } : this._ok(v); }
        if (a.length >= 2) {
            if (!glob && !R) return this._err('fatal: not in a git directory', 128);
            this._gitConfigSet(glob ? this._home() + '/.gitconfig' : R.root + '/.git/config', a[0], a.slice(1).join(' '));
            return this._ok('');
        }
        return this._err('usage: git config [<options>]', 129);
    }

    _gitInit(rest) {
        const dir = rest.filter(a => !a.startsWith('-'))[0];
        const target = this.fs.resolvePath(dir || '.');
        let node = this.fs.getNode(target);
        if (!node) { const par = this.fs.getNode(target.replace(/\/[^/]*$/, '') || '/'); if (!par || !par.children) return this._err(`fatal: cannot mkdir ${dir}: No such file or directory`, 128); par.children[target.split('/').pop()] = { type: 'directory', permissions: '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} }; node = this.fs.getNode(target); }
        if (!this.fs.hasPermission(node, 'w')) return this._err(`fatal: cannot mkdir ${target}/.git: Permission denied`, 128);
        const existing = node.children['.git'];
        const dirNode = () => ({ type: 'directory', permissions: '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} });
        const defBranch = (this._gitConfigGet(null, 'init.defaultbranch') || (rest.includes('-b') ? rest[rest.indexOf('-b') + 1] : null)) || 'master';
        const hint = !this._gitConfigGet(null, 'init.defaultbranch') && !rest.includes('-b') && !rest.some(a => a.startsWith('--initial-branch'));
        if (existing) return this._ok(`Reinitialized existing Git repository in ${target}/.git/`);
        const g = dirNode();
        g.children = { branches: dirNode(), hooks: dirNode(), info: dirNode(), objects: dirNode(), refs: dirNode() };
        g.children.HEAD = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: `ref: refs/heads/${defBranch}\n` };
        g.children.config = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n' };
        g.children.description = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: "Unnamed repository; edit this file 'description' to name the repository.\n" };
        g.children['rc.json'] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: JSON.stringify({ branches: {}, head: defBranch, commits: {}, index: {}, tags: {}, remotes: {}, stash: [] }) };
        node.children['.git'] = g;
        const lines = [];
        if (hint) lines.push("hint: Using 'master' as the name for the initial branch. This default branch name", 'hint: is subject to change. To configure the initial branch name to use in all', 'hint: of your new repositories, which will suppress this warning, call:', 'hint: ', 'hint: \tgit config --global init.defaultBranch <name>', 'hint: ', "hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and", "hint: 'development'. The just-created branch can be renamed via this command:", 'hint: ', 'hint: \tgit branch -m <name>');
        lines.push(`Initialized empty Git repository in ${target}/.git/`);
        return this._ok(lines.join('\n'));
    }

    _gitClone(rest) {
        const a = rest.filter(x => !x.startsWith('-'));
        const url = a[0];
        if (!url) return this._err('fatal: You must specify a repository to clone.\n\nusage: git clone [<options>] [--] <repo> [<dir>]', 129);
        const name = a[1] || url.replace(/\/+$/, '').split('/').pop().replace(/\.git$/, '').split(':').pop();
        const hostM = /^(?:https?|git|ssh):\/\/(?:[^@/]+@)?([^/:]+)/.exec(url) || /^[^@]+@([^:]+):/.exec(url);
        const out = [`Cloning into '${name}'...`];
        if (!hostM) {
            const src = this.fs.getNode(this.fs.resolvePath(url));
            if (!src) return { stdout: '', stderr: `${out[0]}\nfatal: repository '${url}' does not exist`, exitCode: 128 };
            return { stdout: '', stderr: `${out[0]}\nfatal: repository '${url}' does not exist`, exitCode: 128 };
        }
        const apps = this.shared.apps;
        const r = apps ? apps._resolve(hostM[1]) : { err: 'x' };
        if (r.err) return { stdout: '', stderr: `${out[0]}\nfatal: unable to access '${url}': Could not resolve host: ${hostM[1]}`, exitCode: 128 };
        const nm = this.shared.net;
        if (nm && nm._routeFor && !nm._routeFor(r.ip)) return { stdout: '', stderr: `${out[0]}\nfatal: unable to access '${url}': Failed to connect to ${hostM[1]} port 443 after 0 ms: Network is unreachable`, exitCode: 128 };
        const res = this._gitInit([name]);
        const dir = this.fs.getNode(this.fs.resolvePath(name));
        const R = { root: this.fs.resolvePath(name), gitNode: dir.children['.git'], state: JSON.parse(dir.children['.git'].children['rc.json'].content) };
        this._write(R.root + '/README.md', `# ${name}\n`);
        const msg = 'Initial commit';
        const files = { 'README.md': `# ${name}\n` };
        const id = this._sha1(name + Date.now());
        R.state.commits[id] = { id, parent: null, msg, author: 'Upstream <upstream@example.com>', date: this._now().getTime(), tree: files };
        R.state.branches[R.state.head] = id; R.state.index = Object.assign({}, files);
        R.state.remotes.origin = url;
        this._gitSave(R);
        out.push('remote: Enumerating objects: 3, done.', 'remote: Counting objects: 100% (3/3), done.', 'remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0', 'Receiving objects: 100% (3/3), done.');
        return { stdout: '', stderr: out.join('\n'), exitCode: 0 };
    }

    // ----- working tree helpers
    _wtFiles(R) {
        const out = {};
        const walk = (n, prefix) => {
            for (const [k, c] of Object.entries(n.children || {})) {
                if (k === '.git' && prefix === '') continue;
                const p = prefix ? prefix + '/' + k : k;
                if (c.type === 'directory') walk(c, p); else if (c.type === 'file') out[p] = c.content || '';
            }
        };
        const root = this.fs.getNode(R.root || '/');
        if (root) walk(root, '');
        return out;
    }

    _headTree(R) { const id = this._headId(R); return id ? R.state.commits[id].tree : {}; }
    _headId(R) { return R.state.head && R.state.branches[R.state.head] ? R.state.branches[R.state.head] : (/^[0-9a-f]{40}$/.test(R.state.head || '') ? R.state.head : null); }
    _rel(R, p) { const abs = this.fs.resolvePath(p); const root = R.root || ''; if (abs === root || abs === '/') return ''; return abs.startsWith(root + '/') ? abs.slice(root.length + 1) : null; }

    _gitAdd(R, rest) {
        const files = rest.filter(a => !a.startsWith('-'));
        const all = rest.includes('-A') || rest.includes('--all') || rest.includes('-u');
        if (!files.length && !all) return this._err("Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?\nhint: Turn this message off by running\nhint: \"git config advice.addEmptyPathspec false\"", 0);
        const wt = this._wtFiles(R);
        const idx = R.state.index;
        const targets = all ? [''] : files;
        const errs = [];
        for (const f of targets) {
            const rel = f === '.' ? this._rel(R, '.') : (f === '' ? '' : this._rel(R, f));
            if (rel === null) { errs.push(`fatal: ${f}: '${f}' is outside repository at '${R.root}'`); continue; }
            const matched = Object.keys(wt).filter(p => rel === '' || p === rel || p.startsWith(rel + '/'));
            const tracked = Object.keys(idx).filter(p => rel === '' || p === rel || p.startsWith(rel + '/'));
            if (!matched.length && !tracked.length) { errs.push(`fatal: pathspec '${f}' did not match any files`); continue; }
            for (const p of matched) if (!rest.includes('-u') || idx[p] !== undefined) idx[p] = wt[p];
            for (const p of tracked) if (wt[p] === undefined) delete idx[p];
        }
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 128 : 0 };
    }

    _lines(t) { const l = String(t).split('\n'); if (l[l.length - 1] === '') l.pop(); return l; }

    _diffOps(a, b) {
        const n = a.length, m = b.length;
        const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
        for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
        const ops = []; let i = 0, j = 0;
        while (i < n && j < m) { if (a[i] === b[j]) { ops.push([' ', a[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { ops.push(['-', a[i]]); i++; } else { ops.push(['+', b[j]]); j++; } }
        while (i < n) ops.push(['-', a[i++]]);
        while (j < m) ops.push(['+', b[j++]]);
        return ops;
    }

    _unified(path, oldText, newText, isNew, isDel) {
        const a = oldText === null ? [] : this._lines(oldText), b = newText === null ? [] : this._lines(newText);
        const ops = this._diffOps(a, b);
        const lines = [`diff --git a/${path} b/${path}`];
        if (isNew) lines.push('new file mode 100644', `index 0000000..${this._sha1(newText || '').slice(0, 7)}`);
        else if (isDel) lines.push('deleted file mode 100644', `index ${this._sha1(oldText || '').slice(0, 7)}..0000000`);
        else lines.push(`index ${this._sha1(oldText || '').slice(0, 7)}..${this._sha1(newText || '').slice(0, 7)} 100644`);
        lines.push(`--- ${isNew ? '/dev/null' : 'a/' + path}`, `+++ ${isDel ? '/dev/null' : 'b/' + path}`);
        const ctx = 3;
        const change = ops.map((o, i) => (o[0] !== ' ' ? i : -1)).filter(i => i >= 0);
        if (!change.length) return null;
        const hunks = [];
        let s = Math.max(0, change[0] - ctx), e = Math.min(ops.length - 1, change[0] + ctx);
        for (let k = 1; k < change.length; k++) { if (change[k] - ctx <= e + 1) e = Math.min(ops.length - 1, change[k] + ctx); else { hunks.push([s, e]); s = Math.max(0, change[k] - ctx); e = Math.min(ops.length - 1, change[k] + ctx); } }
        hunks.push([s, e]);
        for (const [hs, he] of hunks) {
            let ai = 0, bi = 0;
            for (let i = 0; i < hs; i++) { if (ops[i][0] !== '+') ai++; if (ops[i][0] !== '-') bi++; }
            const body = ops.slice(hs, he + 1);
            const ac = body.filter(o => o[0] !== '+').length, bc = body.filter(o => o[0] !== '-').length;
            lines.push(`@@ -${ac ? ai + 1 : ai}${ac === 1 ? '' : ',' + ac} +${bc ? bi + 1 : bi}${bc === 1 ? '' : ',' + bc} @@`);
            for (const o of body) lines.push(o[0] + o[1]);
        }
        return lines.join('\n');
    }

    _changes(R) {
        const head = this._headTree(R), idx = R.state.index, wt = this._wtFiles(R);
        const staged = [], unstaged = [], untracked = [];
        for (const p of new Set([...Object.keys(head), ...Object.keys(idx)])) {
            if (head[p] === undefined && idx[p] !== undefined) staged.push({ p, t: 'new file' });
            else if (head[p] !== undefined && idx[p] === undefined) staged.push({ p, t: 'deleted' });
            else if (head[p] !== idx[p]) staged.push({ p, t: 'modified' });
        }
        for (const p of Object.keys(idx)) { if (wt[p] === undefined) unstaged.push({ p, t: 'deleted' }); else if (wt[p] !== idx[p]) unstaged.push({ p, t: 'modified' }); }
        for (const p of Object.keys(wt)) if (idx[p] === undefined) untracked.push(p);
        const sort = (a, b) => a.p.localeCompare(b.p);
        return { staged: staged.sort(sort), unstaged: unstaged.sort(sort), untracked: untracked.sort() };
    }

    _gitStatus(R, rest) {
        const c = this._changes(R);
        const branch = R.state.branches[R.state.head] || !/^[0-9a-f]{40}$/.test(R.state.head) ? R.state.head : null;
        const hasCommits = !!this._headId(R);
        if (rest.includes('-s') || rest.includes('--short') || rest.includes('--porcelain')) {
            const rows = new Map();
            for (const s of c.staged) rows.set(s.p, [{ 'new file': 'A', deleted: 'D', modified: 'M' }[s.t], ' ']);
            for (const u of c.unstaged) { const r = rows.get(u.p) || [' ', ' ']; r[1] = u.t === 'deleted' ? 'D' : 'M'; rows.set(u.p, r); }
            const lines = [...rows.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([p, r]) => `${r[0]}${r[1]} ${p}`);
            for (const u of c.untracked) lines.push(`?? ${u}`);
            if (rest.includes('-b') || rest.includes('--branch')) lines.unshift(`## ${branch}${hasCommits ? '' : '...'}`);
            return this._ok(lines.join('\n'));
        }
        const out = [branch ? `On branch ${branch}` : `HEAD detached at ${R.state.head.slice(0, 7)}`];
        if (R.state.merging) {
            const wt = this._wtFiles(R);
            const un = Object.keys(wt).filter(p => /^<<<<<<< /m.test(wt[p]));
            if (un.length) {
                out.push('You have unmerged paths.', '  (fix conflicts and run "git commit")', '  (use "git merge --abort" to abort the merge)', '', 'Unmerged paths:', '  (use "git add <file>..." to mark resolution)');
                for (const p of un) out.push(`\tboth modified:   ${p}`);
                out.push('', 'no changes added to commit (use "git add" and/or "git commit -a")');
                return this._ok(out.join('\n'));
            }
        }
        if (!hasCommits) out.push('', 'No commits yet');
        if (c.staged.length) {
            out.push('', 'Changes to be committed:', hasCommits ? '  (use "git restore --staged <file>..." to unstage)' : '  (use "git rm --cached <file>..." to unstage)');
            for (const s of c.staged) out.push(`\t${(s.t + ':').padEnd(12)}${s.p}`);
        }
        if (c.unstaged.length) {
            out.push('', 'Changes not staged for commit:', '  (use "git add' + (c.unstaged.some(u => u.t === 'deleted') ? '/rm' : '') + ' <file>..." to update what will be committed)', '  (use "git restore <file>..." to discard changes in working directory)');
            for (const s of c.unstaged) out.push(`\t${(s.t + ':').padEnd(12)}${s.p}`);
        }
        if (c.untracked.length) {
            out.push('', 'Untracked files:', '  (use "git add <file>..." to include in what will be committed)');
            for (const u of c.untracked) out.push(`\t${u}`);
        }
        out.push('');
        if (c.staged.length || c.unstaged.length || c.untracked.length) {
            if (!c.staged.length && c.unstaged.length) out.push('no changes added to commit (use "git add" and/or "git commit -a")');
            else if (!c.staged.length) out.push(`nothing added to commit but untracked files present (use "git add" to track)`);
            else out.pop();
        } else out.push(hasCommits ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)');
        return this._ok(out.join('\n').replace(/\n+$/, ''));
    }

    _stat(R, before, after) {
        const names = new Set([...Object.keys(before), ...Object.keys(after)]);
        let files = 0, ins = 0, del = 0;
        const created = [], deleted = [];
        for (const p of names) {
            if (before[p] === after[p]) continue;
            files++;
            const ops = this._diffOps(before[p] === undefined ? [] : this._lines(before[p]), after[p] === undefined ? [] : this._lines(after[p]));
            ins += ops.filter(o => o[0] === '+').length; del += ops.filter(o => o[0] === '-').length;
            if (before[p] === undefined) created.push(p); else if (after[p] === undefined) deleted.push(p);
        }
        return { files, ins, del, created, deleted };
    }

    _gitCommit(R, rest) {
        let msg = null, all = false, amend = false;
        for (let i = 0; i < rest.length; i++) {
            const a = rest[i];
            if (a === '-m' || a === '--message') msg = rest[++i];
            else if (a.startsWith('-m') && a.length > 2) msg = a.slice(2);
            else if (a.startsWith('--message=')) msg = a.slice(10);
            else if (a === '-a' || a === '--all') all = true;
            else if (a === '-am' || a === '-ma') { all = true; msg = rest[++i]; }
            else if (a === '--amend') amend = true;
        }
        if (all) { const wt = this._wtFiles(R); for (const p of Object.keys(R.state.index)) { if (wt[p] === undefined) delete R.state.index[p]; else R.state.index[p] = wt[p]; } }
        const name = this._gitConfigGet(R, 'user.name'), email = this._gitConfigGet(R, 'user.email');
        if (!name || !email) return this._err(`Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account's default identity.\nOmit --global to set the identity only in this repository.\n\nfatal: unable to auto-detect email address (got '${this.fs.currentUser}@${this.parent.hostname}.(none)')`, 128);
        const c = this._changes(R);
        if (!c.staged.length && !amend) {
            const hdr = `On branch ${R.state.head}\n` + (this._headId(R) ? '' : '\nInitial commit\n');
            if (c.unstaged.length) return { stdout: hdr + '\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n' + c.unstaged.map(u => `\t${(u.t + ':').padEnd(12)}${u.p}`).join('\n') + '\n\nno changes added to commit (use "git add" and/or "git commit -a")', stderr: '', exitCode: 1 };
            if (c.untracked.length) return { stdout: hdr + '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n' + c.untracked.map(u => `\t${u}`).join('\n') + '\n\nnothing added to commit but untracked files present (use "git add" to track)', stderr: '', exitCode: 1 };
            return { stdout: hdr + 'nothing to commit, working tree clean', stderr: '', exitCode: 1 };
        }
        if (!msg) {
            return this._err('Aborting commit due to empty commit message.', 1);
        }
        const parentId = this._headId(R);
        const before = parentId ? R.state.commits[parentId].tree : {};
        const tree = Object.assign({}, R.state.index);
        const when = this._now().getTime();
        const id = this._sha1(JSON.stringify(tree) + msg + when + (parentId || ''));
        R.state.commits[id] = { id, parent: amend && parentId ? R.state.commits[parentId].parent : parentId, msg, author: `${name} <${email}>`, date: when, tree };
        const br = R.state.head;
        if (R.state.merging) { R.state.commits[id].parent2 = R.state.merging.theirs; delete R.state.merging; }
        R.state.branches[br] = id;
        const st = this._stat(R, before, tree);
        const out = [`[${br}${parentId ? '' : ' (root-commit)'} ${id.slice(0, 7)}] ${msg}`, ` ${st.files} file${st.files === 1 ? '' : 's'} changed${st.ins ? `, ${st.ins} insertion${st.ins === 1 ? '' : 's'}(+)` : ''}${st.del ? `, ${st.del} deletion${st.del === 1 ? '' : 's'}(-)` : ''}`];
        for (const p of st.created) out.push(` create mode 100644 ${p}`);
        for (const p of st.deleted) out.push(` delete mode 100644 ${p}`);
        return this._ok(out.join('\n'));
    }

    _chain(R, from) { const out = []; let id = from; while (id && R.state.commits[id]) { out.push(R.state.commits[id]); id = R.state.commits[id].parent; if (out.length > 500) break; } return out; }

    _refNames(R, id) {
        const names = [];
        if (this._headId(R) === id) names.push(R.state.branches[R.state.head] ? `HEAD -> ${R.state.head}` : 'HEAD');
        for (const [b, i] of Object.entries(R.state.branches)) if (i === id && !(R.state.head === b && this._headId(R) === id)) names.push(b);
        for (const [t, i] of Object.entries(R.state.tags)) if (i === id) names.push('tag: ' + t);
        return names.length ? ` (${names.join(', ')})` : '';
    }

    _gitLog(R, rest) {
        const head = this._headId(R);
        if (!head) return this._err(`fatal: your current branch '${R.state.head}' does not have any commits yet`, 128);
        const one = rest.includes('--oneline');
        let max = Infinity;
        rest.forEach((a, i) => { if (a === '-n') max = parseInt(rest[i + 1], 10); else if (/^-\d+$/.test(a)) max = parseInt(a.slice(1), 10); else if (a.startsWith('--max-count=')) max = parseInt(a.slice(12), 10); });
        const list = this._chain(R, head).slice(0, max);
        const out = [];
        for (const c of list) {
            if (one) { out.push(`${c.id.slice(0, 7)}${this._refNames(R, c.id)} ${c.msg}`); continue; }
            out.push(`commit ${c.id}${this._refNames(R, c.id)}`, `Author: ${c.author}`, `Date:   ${this._fmt(new Date(c.date), '%a %b %e %H:%M:%S %Y %z')}`, '', `    ${c.msg}`, '');
        }
        return this._ok(out.join('\n').replace(/\n+$/, ''));
    }

    _gitDiff(R, rest) {
        const staged = rest.includes('--staged') || rest.includes('--cached');
        const paths = rest.filter(a => !a.startsWith('-'));
        const head = this._headTree(R), idx = R.state.index, wt = this._wtFiles(R);
        const from = staged ? head : idx, to = staged ? idx : wt;
        const out = [];
        for (const p of Array.from(new Set([...Object.keys(from), ...Object.keys(staged ? idx : idx)])).concat(staged ? [] : []).sort()) {
            if (paths.length && !paths.some(x => { const r = this._rel(R, x); return r !== null && (p === r || p.startsWith(r + '/') || r === ''); })) continue;
            const a = from[p], b = to[p];
            if (!staged && idx[p] === undefined) continue;
            if (a === b) continue;
            const d = this._unified(p, a === undefined ? null : a, b === undefined ? null : b, a === undefined, b === undefined);
            if (d) out.push(d);
        }
        return this._ok(out.join('\n'));
    }

    _gitShow(R, rest) {
        const ref = rest.filter(a => !a.startsWith('-'))[0] || 'HEAD';
        const id = this._resolveRef(R, ref);
        if (!id) return this._err(`fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'`, 128);
        const c = R.state.commits[id];
        const before = c.parent ? R.state.commits[c.parent].tree : {};
        const out = [`commit ${c.id}${this._refNames(R, c.id)}`, `Author: ${c.author}`, `Date:   ${this._fmt(new Date(c.date), '%a %b %e %H:%M:%S %Y %z')}`, '', `    ${c.msg}`, ''];
        for (const p of Array.from(new Set([...Object.keys(before), ...Object.keys(c.tree)])).sort()) {
            if (before[p] === c.tree[p]) continue;
            const d = this._unified(p, before[p] === undefined ? null : before[p], c.tree[p] === undefined ? null : c.tree[p], before[p] === undefined, c.tree[p] === undefined);
            if (d) out.push(d);
        }
        return this._ok(out.join('\n'));
    }

    _resolveRef(R, ref) {
        if (ref === 'HEAD') return this._headId(R);
        const m = /^HEAD~(\d+)$/.exec(ref) || /^HEAD\^$/.exec(ref);
        if (m) { let id = this._headId(R); const n = m[1] ? parseInt(m[1], 10) : 1; for (let i = 0; i < n && id; i++) id = R.state.commits[id] ? R.state.commits[id].parent : null; return id; }
        if (R.state.branches[ref]) return R.state.branches[ref];
        if (R.state.tags[ref]) return R.state.tags[ref];
        const hit = Object.keys(R.state.commits).filter(i => i.startsWith(ref));
        return ref.length >= 4 && hit.length === 1 ? hit[0] : null;
    }

    _gitBranch(R, rest) {
        const names = rest.filter(a => !a.startsWith('-'));
        if (rest.includes('-d') || rest.includes('-D') || rest.includes('--delete')) {
            const out = [], errs = [];
            for (const n of names) {
                if (!R.state.branches[n]) { errs.push(`error: branch '${n}' not found.`); continue; }
                if (R.state.head === n) { errs.push(`error: Cannot delete branch '${n}' checked out at '${R.root}'`); continue; }
                out.push(`Deleted branch ${n} (was ${R.state.branches[n].slice(0, 7)}).`); delete R.state.branches[n];
            }
            return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
        }
        if (rest.includes('-m') || rest.includes('-M')) {
            const [a, b] = names.length === 2 ? names : [R.state.head, names[0]];
            if (R.state.branches[a] === undefined && a !== R.state.head) return this._err(`error: refname refs/heads/${a} not found\nfatal: Branch rename failed`, 128);
            if (R.state.branches[a]) { R.state.branches[b] = R.state.branches[a]; delete R.state.branches[a]; }
            if (R.state.head === a) R.state.head = b;
            return this._ok('');
        }
        if (names.length) {
            if (!this._headId(R)) return this._err('fatal: not a valid object name: \'' + (R.state.head) + '\'', 128);
            if (R.state.branches[names[0]]) return this._err(`fatal: a branch named '${names[0]}' already exists`, 128);
            R.state.branches[names[0]] = names[1] ? this._resolveRef(R, names[1]) : this._headId(R);
            return this._ok('');
        }
        const list = Object.keys(R.state.branches).sort();
        if (!list.includes(R.state.head) && this._headId(R) === null) return this._ok('');
        return this._ok(list.map(b => `${b === R.state.head ? '* ' : '  '}${b}`).join('\n'));
    }

    _applyTree(R, tree) {
        const wt = this._wtFiles(R);
        const oldIdx = R.state.index;
        for (const p of Object.keys(oldIdx)) if (tree[p] === undefined) { const n = this.fs.getNode(R.root + '/' + p); if (n) { const par = this.fs.getNode((R.root + '/' + p).replace(/\/[^/]*$/, '')); if (par && par.children) delete par.children[p.split('/').pop()]; } }
        for (const [p, c] of Object.entries(tree)) this._write(R.root + '/' + p, c);
        R.state.index = Object.assign({}, tree);
    }

    _gitCheckout(R, rest, isSwitch) {
        const create = rest.includes('-b') || rest.includes('-c') || rest.includes('-B') || rest.includes('--create');
        const dd = rest.indexOf('--');
        const names = rest.filter(a => !a.startsWith('-'));
        if (dd >= 0 || (!isSwitch && names.length && !R.state.branches[names[0]] && !create && R.state.index[names[0]] !== undefined)) {
            const files = dd >= 0 ? rest.slice(dd + 1) : names;
            return this._gitRestore(R, files);
        }
        if (!names.length) return this._err(isSwitch ? 'fatal: missing branch or commit argument' : 'fatal: you must specify path(s) to restore', 128);
        const target = names[0];
        if (create) {
            if (R.state.branches[target]) return this._err(`fatal: a branch named '${target}' already exists`, 128);
            R.state.branches[target] = names[1] ? this._resolveRef(R, names[1]) : this._headId(R);
            R.state.head = target;
            return { stdout: '', stderr: `Switched to a new branch '${target}'`, exitCode: 0 };
        }
        if (R.state.head === target) return { stdout: '', stderr: `Already on '${target}'`, exitCode: 0 };
        const id = R.state.branches[target];
        if (!id) {
            const ref = this._resolveRef(R, target);
            if (!ref) return this._err(isSwitch ? `fatal: invalid reference: ${target}` : `error: pathspec '${target}' did not match any file(s) known to git`, isSwitch ? 128 : 1);
            this._applyTree(R, R.state.commits[ref].tree); R.state.head = ref;
            return { stdout: '', stderr: `Note: switching to '${target}'.\n\nYou are in 'detached HEAD' state.`, exitCode: 0 };
        }
        const c = this._changes(R);
        const conflict = [...c.unstaged, ...c.staged].filter(x => (R.state.commits[id].tree[x.p] !== (this._headTree(R))[x.p]));
        if (conflict.length) return this._err(`error: Your local changes to the following files would be overwritten by checkout:\n${conflict.map(x => '\t' + x.p).join('\n')}\nPlease commit your changes or stash them before you switch branches.\nAborting`, 1);
        this._applyTree(R, R.state.commits[id].tree);
        R.state.head = target;
        return { stdout: '', stderr: `Switched to branch '${target}'`, exitCode: 0 };
    }

    _gitRestore(R, rest) {
        const staged = rest.includes('--staged') || rest.includes('-S');
        const files = rest.filter(a => !a.startsWith('-'));
        if (!files.length) return this._err('fatal: you must specify path(s) to restore', 128);
        const head = this._headTree(R);
        for (const f of files) {
            const rel = this._rel(R, f);
            const keys = Object.keys(Object.assign({}, head, R.state.index)).filter(p => rel === '' || p === rel || p.startsWith(rel + '/'));
            if (!keys.length) return this._err(`error: pathspec '${f}' did not match any file(s) known to git`, 1);
            for (const p of keys) {
                if (staged) { if (head[p] === undefined) delete R.state.index[p]; else R.state.index[p] = head[p]; }
                else if (R.state.index[p] !== undefined) this._write(R.root + '/' + p, R.state.index[p]);
            }
        }
        return this._ok('');
    }

    _gitReset(R, rest) {
        const hard = rest.includes('--hard'), soft = rest.includes('--soft');
        const args = rest.filter(a => !a.startsWith('-'));
        let ref = null; const files = [];
        for (const a of args) { if (!ref && this._resolveRef(R, a) && R.state.index[a] === undefined) ref = a; else files.push(a); }
        if (files.length) return this._gitRestore(R, ['--staged', ...files]);
        const id = ref ? this._resolveRef(R, ref) : this._headId(R);
        if (!id) return this._err(`fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.`, 128);
        if (R.state.branches[R.state.head] !== undefined) R.state.branches[R.state.head] = id;
        const tree = R.state.commits[id].tree;
        if (!soft) R.state.index = Object.assign({}, tree);
        if (hard) { this._applyTree(R, tree); return this._ok(`HEAD is now at ${id.slice(0, 7)} ${R.state.commits[id].msg}`); }
        if (!soft) { const c = this._changes(R); return this._ok(c.unstaged.length ? 'Unstaged changes after reset:\n' + c.unstaged.map(u => `${u.t === 'deleted' ? 'D' : 'M'}\t${u.p}`).join('\n') : ''); }
        return this._ok('');
    }

    _gitRm(R, rest) {
        const cached = rest.includes('--cached');
        const files = rest.filter(a => !a.startsWith('-'));
        if (!files.length) return this._err('usage: git rm [<options>] [--] <file>...', 129);
        const out = [];
        for (const f of files) {
            const rel = this._rel(R, f);
            if (R.state.index[rel] === undefined) return this._err(`fatal: pathspec '${f}' did not match any files`, 128);
            delete R.state.index[rel];
            if (!cached) { const par = this.fs.getNode((R.root + '/' + rel).replace(/\/[^/]*$/, '')); if (par && par.children) delete par.children[rel.split('/').pop()]; }
            out.push(`rm '${rel}'`);
        }
        return this._ok(out.join('\n'));
    }

    _gitMv(R, rest) {
        const [a, b] = rest.filter(x => !x.startsWith('-'));
        if (!a || !b) return this._err('usage: git mv [<options>] <source>... <destination>', 129);
        const ra = this._rel(R, a), rb = this._rel(R, b);
        if (R.state.index[ra] === undefined) return this._err(`fatal: not under version control, source=${a}, destination=${b}`, 128);
        R.state.index[rb] = R.state.index[ra]; delete R.state.index[ra];
        const par = this.fs.getNode((R.root + '/' + ra).replace(/\/[^/]*$/, ''));
        if (par && par.children) delete par.children[ra.split('/').pop()];
        this._write(R.root + '/' + rb, R.state.index[rb]);
        return this._ok('');
    }

    _gitTag(R, rest) {
        const names = rest.filter(a => !a.startsWith('-'));
        if (rest.includes('-d')) { const n = names[0]; if (!R.state.tags[n]) return this._err(`error: tag '${n}' not found.`, 1); const id = R.state.tags[n]; delete R.state.tags[n]; return this._ok(`Deleted tag '${n}' (was ${id.slice(0, 7)})`); }
        if (!names.length) return this._ok(Object.keys(R.state.tags).sort().join('\n'));
        if (!this._headId(R)) return this._err('fatal: Failed to resolve \'HEAD\' as a valid ref.', 128);
        if (R.state.tags[names[0]]) return this._err(`fatal: tag '${names[0]}' already exists`, 128);
        R.state.tags[names[0]] = names[1] ? this._resolveRef(R, names[1]) : this._headId(R);
        return this._ok('');
    }

    _gitRemote(R, rest) {
        const sub = rest[0];
        if (!sub || sub === '-v') { const lines = []; for (const [n, u] of Object.entries(R.state.remotes)) { if (sub === '-v') lines.push(`${n}\t${u} (fetch)`, `${n}\t${u} (push)`); else lines.push(n); } return this._ok(lines.join('\n')); }
        if (sub === 'add') { if (R.state.remotes[rest[1]]) return this._err(`error: remote ${rest[1]} already exists.`, 3); R.state.remotes[rest[1]] = rest[2]; return this._ok(''); }
        if (sub === 'remove' || sub === 'rm') { if (!R.state.remotes[rest[1]]) return this._err(`error: No such remote: '${rest[1]}'`, 2); delete R.state.remotes[rest[1]]; return this._ok(''); }
        if (sub === 'set-url') { R.state.remotes[rest[1]] = rest[2]; return this._ok(''); }
        if (sub === 'get-url') return R.state.remotes[rest[1]] ? this._ok(R.state.remotes[rest[1]]) : this._err(`error: No such remote '${rest[1]}'`, 2);
        return this._err(`error: Unknown subcommand: ${sub}`, 129);
    }

    _gitNet(R, op, rest) {
        const name = rest.filter(a => !a.startsWith('-'))[0] || 'origin';
        const url = R.state.remotes[name];
        if (!url) return this._err(op === 'pull' || op === 'fetch' ? `fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.` : `fatal: '${name}' does not appear to be a git repository\nfatal: Could not read from remote repository.\n\nPlease make sure you have the correct access rights\nand the repository exists.`, 128);
        const hostM = /^(?:https?|git|ssh):\/\/(?:[^@/]+@)?([^/:]+)/.exec(url) || /^[^@]+@([^:]+):/.exec(url);
        const apps = this.shared.apps;
        if (hostM && apps) {
            const r = apps._resolve(hostM[1]);
            if (r.err) return this._err(`fatal: unable to access '${url}': Could not resolve host: ${hostM[1]}`, 128);
        }
        if (op === 'push') return { stdout: '', stderr: 'remote: Permission to ' + url.replace(/^https?:\/\/[^/]+\//, '').replace(/\.git$/, '') + '.git denied to ' + this.fs.currentUser + '.\nfatal: unable to access \'' + url + '\': The requested URL returned error: 403', exitCode: 128 };
        return { stdout: op === 'pull' ? 'Already up to date.' : '', stderr: '', exitCode: 0 };
    }

    _gitStash(R, rest) {
        const sub = rest[0] || 'push';
        const c = this._changes(R);
        if (sub === 'list') return this._ok(R.state.stash.map((s, i) => `stash@{${i}}: WIP on ${R.state.head}: ${s.base}`).join('\n'));
        if (sub === 'pop' || sub === 'apply') {
            const s = sub === 'pop' ? R.state.stash.pop() : R.state.stash[R.state.stash.length - 1];
            if (!s) return this._err('No stash entries found.', 1);
            for (const [p, t] of Object.entries(s.files)) this._write(R.root + '/' + p, t);
            return this._ok(`On branch ${R.state.head}\nChanges applied from stash`);
        }
        if (!c.unstaged.length && !c.staged.length) return this._ok('No local changes to save');
        const files = {};
        const wt = this._wtFiles(R);
        for (const x of [...c.unstaged, ...c.staged]) if (wt[x.p] !== undefined) files[x.p] = wt[x.p];
        const id = this._headId(R);
        R.state.stash.push({ files, base: `${id.slice(0, 7)} ${R.state.commits[id].msg}` });
        this._applyTree(R, this._headTree(R));
        return this._ok(`Saved working directory and index state WIP on ${R.state.head}: ${id.slice(0, 7)} ${R.state.commits[id].msg}`);
    }

    _gitMerge(R, rest) {
        if (rest.includes('--abort')) {
            if (!R.state.merging) return this._err('fatal: There is no merge to abort (MERGE_HEAD missing).', 128);
            delete R.state.merging;
            this._applyTree(R, this._headTree(R));
            return this._ok('');
        }
        const target = rest.filter(a => !a.startsWith('-'))[0];
        if (!target) return this._err('fatal: No remote for the current branch.', 128);
        const theirs = R.state.branches[target] || this._resolveRef(R, target);
        if (!theirs) return this._err(`merge: ${target} - not something we can merge`, 1);
        const ours = this._headId(R);
        if (!ours) return this._err('fatal: HEAD is not a commit', 128);
        const oursChain = this._chain(R, ours).map(c => c.id), theirsChain = this._chain(R, theirs).map(c => c.id);
        if (oursChain.includes(theirs)) return this._ok('Already up to date.');
        const br = R.state.head;
        if (theirsChain.includes(ours)) {
            const before = R.state.commits[ours].tree, after = R.state.commits[theirs].tree;
            R.state.branches[br] = theirs;
            this._applyTree(R, after);
            const st = this._stat(R, before, after);
            const out = [`Updating ${ours.slice(0, 7)}..${theirs.slice(0, 7)}`, 'Fast-forward'];
            for (const p of Object.keys(after).concat(Object.keys(before).filter(k => after[k] === undefined)).filter((p, i, a) => a.indexOf(p) === i && before[p] !== after[p])) out.push(` ${p} | ${this._stat(R, { [p]: before[p] }, { [p]: after[p] }).ins + this._stat(R, { [p]: before[p] }, { [p]: after[p] }).del} +`);
            out.push(` ${st.files} file${st.files === 1 ? '' : 's'} changed${st.ins ? `, ${st.ins} insertion${st.ins === 1 ? '' : 's'}(+)` : ''}${st.del ? `, ${st.del} deletion${st.del === 1 ? '' : 's'}(-)` : ''}`);
            for (const p of st.created) out.push(` create mode 100644 ${p}`);
            return this._ok(out.join('\n'));
        }
        const baseId = oursChain.find(i => theirsChain.includes(i));
        const base = baseId ? R.state.commits[baseId].tree : {};
        const A = R.state.commits[ours].tree, B = R.state.commits[theirs].tree;
        const merged = {}; const conflicts = [];
        for (const p of new Set([...Object.keys(A), ...Object.keys(B), ...Object.keys(base)])) {
            const a = A[p], b = B[p], o = base[p];
            if (a === b) { if (a !== undefined) merged[p] = a; }
            else if (a === o) { if (b !== undefined) merged[p] = b; }
            else if (b === o) { if (a !== undefined) merged[p] = a; }
            else { conflicts.push(p); merged[p] = `<<<<<<< HEAD\n${a === undefined ? '' : a.replace(/\n?$/, '\n')}=======\n${b === undefined ? '' : b.replace(/\n?$/, '\n')}>>>>>>> ${target}\n`; }
        }
        if (conflicts.length) {
            for (const [p, c] of Object.entries(merged)) this._write(R.root + '/' + p, c);
            R.state.merging = { theirs, target };
            return { stdout: conflicts.map(p => `Auto-merging ${p}\nCONFLICT (content): Merge conflict in ${p}`).join('\n') + '\nAutomatic merge failed; fix conflicts and then commit the result.', stderr: '', exitCode: 1 };
        }
        const name = this._gitConfigGet(R, 'user.name'), email = this._gitConfigGet(R, 'user.email');
        if (!name || !email) return this._err('Committer identity unknown\n\n*** Please tell me who you are.\n\nfatal: unable to auto-detect email address', 128);
        const id = this._sha1(JSON.stringify(merged) + Date.now());
        const msg = `Merge branch '${target}'` + (br === 'master' ? '' : ` into ${br}`);
        R.state.commits[id] = { id, parent: ours, parent2: theirs, msg, author: `${name} <${email}>`, date: this._now().getTime(), tree: merged };
        R.state.branches[br] = id;
        this._applyTree(R, merged);
        const st = this._stat(R, A, merged);
        return this._ok(`Merge made by the 'ort' strategy.\n ${st.files} file${st.files === 1 ? '' : 's'} changed${st.ins ? `, ${st.ins} insertion${st.ins === 1 ? '' : 's'}(+)` : ''}${st.del ? `, ${st.del} deletion${st.del === 1 ? '' : 's'}(-)` : ''}`);
    }

    // =========================================================== jq
    jq(args, stdin) {
        const { o, rest } = this._flags(args, ['f', 'e']);
        const vars = {};
        const argv = args.slice();
        for (let i = 0; i < argv.length; i++) {
            if (argv[i] === '--arg') { vars[argv[i + 1]] = argv[i + 2]; argv.splice(i, 3); i--; }
            else if (argv[i] === '--argjson') { try { vars[argv[i + 1]] = JSON.parse(argv[i + 2]); } catch (e) { return this._err(`jq: Invalid JSON text passed to --argjson`, 2); } argv.splice(i, 3); i--; }
        }
        const flags = { r: false, c: false, n: false, s: false, S: false, e: false, j: false, tab: false };
        const pos = [];
        for (const a of argv) {
            if (a === '--raw-output') flags.r = true; else if (a === '--compact-output') flags.c = true; else if (a === '--null-input') flags.n = true; else if (a === '--slurp') flags.s = true; else if (a === '--sort-keys') flags.S = true; else if (a === '--exit-status') flags.e = true; else if (a === '--join-output') flags.j = true; else if (a === '--tab') flags.tab = true; else if (a === '--version' || a === '-V') return this._ok('jq-1.6'); else if (a === '-h' || a === '--help') return this._ok('Usage:\tjq [OPTIONS] FILTER [FILES...]\n\tjq [OPTIONS] --args FILTER [STRINGS...]');
            else if (/^-[a-zA-Z]+$/.test(a) && !pos.length) { for (const ch of a.slice(1)) { if ('rcnsSejC'.includes(ch)) flags[ch === 'C' ? 'color' : ch] = true; } }
            else pos.push(a);
        }
        const filter = pos.shift();
        if (filter === undefined) return this._err('Usage:\tjq [OPTIONS] FILTER [FILES...]', 2);
        let src = [];
        if (flags.n) src = [null];
        else {
            let text = '', errs = [];
            if (pos.length) { for (const f of pos) { const t = this._readFile(f); if (t === null) return this._err(`jq: error: Could not open ${f}: No such file or directory`, 2); text += t + '\n'; } } else text = stdin || '';
            try { src = this._jsonStream(text); } catch (e) { return this._err(`jq: error (at <stdin>:${text.split('\n').length}): ${e.message}`, 2); }
            if (flags.s) src = [src];
        }
        let ast;
        try { ast = this._jqParse(filter); } catch (e) { return this._err(`jq: error: ${e.message} at <top-level>, line 1:\n${filter}\njq: 1 compile error`, 3); }
        const out = []; let last = null, any = false;
        for (const input of src) {
            let results;
            try { results = this._jqEval(ast, input, Object.assign({}, vars)); } catch (e) { return { stdout: out.join(''), stderr: `jq: error (at <stdin>:0): ${e.message}`, exitCode: 5 }; }
            for (const r of results) {
                any = true; last = r;
                if (flags.r && typeof r === 'string') out.push(r + (flags.j ? '' : '\n'));
                else out.push(this._jqFmt(r, flags) + (flags.j ? '' : '\n'));
            }
        }
        const code = flags.e ? (!any || last === null || last === false ? 1 : 0) : 0;
        return { stdout: out.join('').replace(/\n$/, ''), rawStdout: undefined, stderr: '', exitCode: code };
    }

    _jsonStream(text) {
        const vals = []; let i = 0; const n = text.length;
        while (true) {
            while (i < n && /\s/.test(text[i])) i++;
            if (i >= n) break;
            let j = i, depth = 0, inStr = false;
            if (text[i] === '{' || text[i] === '[') {
                for (; j < n; j++) { const ch = text[j]; if (inStr) { if (ch === '\\') j++; else if (ch === '"') inStr = false; } else if (ch === '"') inStr = true; else if (ch === '{' || ch === '[') depth++; else if (ch === '}' || ch === ']') { depth--; if (depth === 0) { j++; break; } } }
            } else if (text[i] === '"') { for (j = i + 1; j < n; j++) { if (text[j] === '\\') j++; else if (text[j] === '"') { j++; break; } } }
            else { while (j < n && !/\s/.test(text[j])) j++; }
            const piece = text.slice(i, j);
            try { vals.push(JSON.parse(piece)); } catch (e) { throw new Error(`parse error: Invalid numeric literal at line ${text.slice(0, i).split('\n').length}, column ${j - text.lastIndexOf('\n', i)}`); }
            i = j;
        }
        return vals;
    }

    _jqFmt(v, f, ind = 0) {
        const pad = f.c ? '' : (f.tab ? '\t' : '  ').repeat(ind + 1), padEnd = f.c ? '' : (f.tab ? '\t' : '  ').repeat(ind), nl = f.c ? '' : '\n', sp = f.c ? '' : ' ';
        if (Array.isArray(v)) return v.length ? '[' + nl + v.map(x => pad + this._jqFmt(x, f, ind + 1)).join(',' + nl) + nl + padEnd + ']' : '[]';
        if (v && typeof v === 'object') {
            const keys = Object.keys(v); if (f.S) keys.sort();
            return keys.length ? '{' + nl + keys.map(k => pad + JSON.stringify(k) + ':' + sp + this._jqFmt(v[k], f, ind + 1)).join(',' + nl) + nl + padEnd + '}' : '{}';
        }
        return v === undefined ? 'null' : JSON.stringify(v);
    }

    // tokenizer + recursive descent
    _jqParse(src) {
        const toks = [];
        let i = 0;
        const isId = (c) => /[A-Za-z0-9_]/.test(c);
        while (i < src.length) {
            const c = src[i];
            if (/\s/.test(c)) { i++; continue; }
            if (c === '"') {
                let j = i + 1, parts = [], cur = '';
                while (j < src.length && src[j] !== '"') {
                    if (src[j] === '\\') {
                        if (src[j + 1] === '(') { let d = 1, k = j + 2; while (k < src.length && d) { if (src[k] === '(') d++; else if (src[k] === ')') d--; k++; } parts.push(cur); cur = ''; parts.push({ expr: this._jqParse(src.slice(j + 2, k - 1)) }); j = k; continue; }
                        const map = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\', '/': '/' };
                        cur += map[src[j + 1]] !== undefined ? map[src[j + 1]] : src[j + 1]; j += 2; continue;
                    }
                    cur += src[j++];
                }
                if (j >= src.length) throw new Error('syntax error, unterminated string');
                parts.push(cur);
                toks.push({ t: 'str', v: parts }); i = j + 1; continue;
            }
            if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) { let j = i; while (j < src.length && /[0-9.eE+-]/.test(src[j]) && !(/[+-]/.test(src[j]) && !/[eE]/.test(src[j - 1]))) j++; toks.push({ t: 'num', v: parseFloat(src.slice(i, j)) }); i = j; continue; }
            if (c === '$') { let j = i + 1; while (j < src.length && isId(src[j])) j++; toks.push({ t: 'var', v: src.slice(i + 1, j) }); i = j; continue; }
            if (c === '@') { let j = i + 1; while (j < src.length && isId(src[j])) j++; toks.push({ t: 'fmt', v: src.slice(i, j) }); i = j; continue; }
            if (/[A-Za-z_]/.test(c)) { let j = i; while (j < src.length && isId(src[j])) j++; toks.push({ t: 'id', v: src.slice(i, j) }); i = j; continue; }
            if (c === '.' && src[i + 1] === '.') { toks.push({ t: 'op', v: '..' }); i += 2; continue; }
            if (c === '.' && /[A-Za-z_]/.test(src[i + 1] || '')) { let j = i + 1; while (j < src.length && isId(src[j])) j++; toks.push({ t: 'field', v: src.slice(i + 1, j) }); i = j; continue; }
            if (c === '.' && src[i + 1] === '"') { const sub = this._jqParse(src.slice(i + 1).match(/^"(?:[^"\\]|\\.)*"/)[0]); toks.push({ t: 'fieldq', v: sub }); i += src.slice(i + 1).match(/^"(?:[^"\\]|\\.)*"/)[0].length + 1; continue; }
            const two = src.slice(i, i + 2);
            if (['==', '!=', '<=', '>=', '//', '|=', '+=', '-=', '*=', '/='].includes(two)) { toks.push({ t: 'op', v: two }); i += 2; continue; }
            if ('.[](){}|,:;+-*/%<>=?!'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
            throw new Error(`syntax error, unexpected INVALID_CHARACTER (Unix shell quoting issues?) "${c}"`);
        }
        let p = 0;
        const peek = () => toks[p], next = () => toks[p++];
        const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;
        const isId2 = (v) => peek() && peek().t === 'id' && peek().v === v;
        const expect = (v) => { if (!isOp(v)) throw new Error(`syntax error, unexpected ${peek() ? peek().v : 'end of file'}, expecting '${v}'`); p++; };
        const parsePipe = () => {
            if (isId2('def')) { next(); const name = next().v; const params = []; if (isOp('(')) { next(); while (!isOp(')')) { params.push(next().v); if (isOp(';')) next(); } next(); } expect(':'); const body = parsePipe(); expect(';'); const rest = parsePipe(); return { k: 'def', name, params, body, rest }; }
            let l = parseComma();
            if (isId2('as')) { next(); const v = next(); if (v.t !== 'var') throw new Error('syntax error, expected variable'); expect('|'); const body = parsePipe(); return { k: 'as', src: l, name: v.v, body }; }
            if (isOp('|')) { next(); return { k: 'pipe', l, r: parsePipe() }; }
            return l;
        };
        const parseComma = () => { let l = parseAlt(); while (isOp(',')) { next(); l = { k: 'comma', l, r: parseAlt() }; } return l; };
        const parseAlt = () => { let l = parseOr(); while (isOp('//')) { next(); l = { k: 'alt', l, r: parseOr() }; } return l; };
        const parseOr = () => { let l = parseAnd(); while (isId2('or')) { next(); l = { k: 'or', l, r: parseAnd() }; } return l; };
        const parseAnd = () => { let l = parseCmp(); while (isId2('and')) { next(); l = { k: 'and', l, r: parseCmp() }; } return l; };
        const parseCmp = () => { let l = parseAdd(); while (peek() && peek().t === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: parseAdd() }; } return l; };
        const parseAdd = () => { let l = parseMul(); while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) { const op = next().v; l = { k: 'bin', op, l, r: parseMul() }; } return l; };
        const parseMul = () => { let l = parsePostfix(); while (peek() && peek().t === 'op' && ['*', '/', '%'].includes(peek().v)) { const op = next().v; l = { k: 'bin', op, l, r: parsePostfix() }; } return l; };
        const parsePostfix = () => {
            let e = parsePrimary();
            while (true) {
                if (peek() && peek().t === 'field') { e = { k: 'idx', e, key: { k: 'lit', v: next().v } }; continue; }
                if (peek() && peek().t === 'fieldq') { e = { k: 'idx', e, key: next().v }; continue; }
                if (isOp('.') && toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '[') { next(); continue; }
                if (isOp('[')) {
                    next();
                    if (isOp(']')) { next(); e = { k: 'iter', e }; continue; }
                    if (isOp(':')) { next(); const to = parsePipe(); expect(']'); e = { k: 'slice', e, from: null, to }; continue; }
                    const idx = parsePipe();
                    if (isOp(':')) { next(); const to = isOp(']') ? null : parsePipe(); expect(']'); e = { k: 'slice', e, from: idx, to }; continue; }
                    expect(']'); e = { k: 'idx', e, key: idx }; continue;
                }
                if (isOp('?')) { next(); e = { k: 'try', e }; continue; }
                break;
            }
            return e;
        };
        const parsePrimary = () => {
            const t = next();
            if (!t) throw new Error('syntax error, unexpected end of file');
            if (t.t === 'num') return { k: 'lit', v: t.v };
            if (t.t === 'str') return { k: 'str', parts: t.v };
            if (t.t === 'var') return { k: 'var', name: t.v };
            if (t.t === 'fmt') { const nxt = peek(); if (nxt && nxt.t === 'str') { next(); return { k: 'fmt', f: t.v, e: { k: 'str', parts: nxt.v } }; } return { k: 'fmt', f: t.v, e: { k: 'id' } }; }
            if (t.t === 'field') return { k: 'idx', e: { k: 'id' }, key: { k: 'lit', v: t.v } };
            if (t.t === 'fieldq') return { k: 'idx', e: { k: 'id' }, key: t.v };
            if (t.t === 'op') {
                if (t.v === '.') { if (isOp('[')) return { k: 'id' }; return { k: 'id' }; }
                if (t.v === '..') return { k: 'recurse' };
                if (t.v === '(') { const e = parsePipe(); expect(')'); return e; }
                if (t.v === '-') return { k: 'neg', e: parsePostfix() };
                if (t.v === '[') { if (isOp(']')) { next(); return { k: 'arr', e: null }; } const e = parsePipe(); expect(']'); return { k: 'arr', e }; }
                if (t.v === '{') {
                    const ents = [];
                    while (!isOp('}')) {
                        let key, val = null;
                        const kt = next();
                        if (kt.t === 'id' || kt.t === 'field') key = { k: 'lit', v: kt.v };
                        else if (kt.t === 'str') key = { k: 'str', parts: kt.v };
                        else if (kt.t === 'var') { key = { k: 'lit', v: kt.v }; val = { k: 'var', name: kt.v }; }
                        else if (kt.t === 'op' && kt.v === '(') { key = parsePipe(); expect(')'); }
                        else throw new Error('syntax error in object construction');
                        if (isOp(':')) { next(); val = parseObjVal(); }
                        else if (!val) val = { k: 'idx', e: { k: 'id' }, key };
                        ents.push([key, val]);
                        if (isOp(',')) next();
                    }
                    next();
                    return { k: 'obj', ents };
                }
                throw new Error(`syntax error, unexpected '${t.v}'`);
            }
            if (t.t === 'id') {
                if (t.v === 'null') return { k: 'lit', v: null };
                if (t.v === 'true') return { k: 'lit', v: true };
                if (t.v === 'false') return { k: 'lit', v: false };
                if (t.v === 'if') {
                    const cond = parsePipe(); if (!isId2('then')) throw new Error("syntax error, expecting 'then'"); next();
                    const th = parsePipe(); const branches = [[cond, th]]; let el = null;
                    while (isId2('elif')) { next(); const c2 = parsePipe(); next(); branches.push([c2, parsePipe()]); }
                    if (isId2('else')) { next(); el = parsePipe(); }
                    if (!isId2('end')) throw new Error("syntax error, expecting 'end'"); next();
                    return { k: 'if', branches, el };
                }
                if (t.v === 'reduce' || t.v === 'foreach') {
                    const src2 = parsePostfix(); if (!isId2('as')) throw new Error("syntax error, expecting 'as'"); next();
                    const v = next(); expect('('); const init = parsePipe(); expect(';'); const upd = parsePipe(); let ext = null; if (isOp(';')) { next(); ext = parsePipe(); } expect(')');
                    return { k: t.v, src: src2, name: v.v, init, upd, ext };
                }
                const args2 = [];
                if (isOp('(')) { next(); while (!isOp(')')) { args2.push(parsePipe()); if (isOp(';')) next(); } next(); }
                return { k: 'call', name: t.v, args: args2 };
            }
            throw new Error('syntax error');
        };
        const parseObjVal = () => { let l = parseAlt(); while (isOp('|')) { next(); l = { k: 'pipe', l, r: parseAlt() }; } return l; };
        const ast = parsePipe();
        if (p < toks.length) throw new Error(`syntax error, unexpected ${toks[p].v}`);
        return ast;
    }

    _jqType(v) { return v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'object' ? 'object' : typeof v; }
    _jqCmp(a, b) {
        const order = { null: 0, boolean: 1, number: 2, string: 3, array: 4, object: 5 };
        const ta = this._jqType(a), tb = this._jqType(b);
        if (ta !== tb) return order[ta] - order[tb];
        if (ta === 'number' || ta === 'string') return a < b ? -1 : a > b ? 1 : 0;
        if (ta === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
        if (ta === 'array') { for (let i = 0; i < Math.min(a.length, b.length); i++) { const c = this._jqCmp(a[i], b[i]); if (c) return c; } return a.length - b.length; }
        if (ta === 'object') { const ka = Object.keys(a).sort(), kb = Object.keys(b).sort(); const c = this._jqCmp(ka, kb); if (c) return c; for (const k of ka) { const d = this._jqCmp(a[k], b[k]); if (d) return d; } }
        return 0;
    }
    _jqTruthy(v) { return !(v === null || v === false); }
    _jqStr(v) { return typeof v === 'string' ? v : JSON.stringify(v); }

    _jqEval(n, input, env) {
        const ev = (node, inp, e) => this._jqEval(node, inp, e || env);
        const bad = (msg) => { throw new Error(msg); };
        switch (n.k) {
            case 'id': return [input];
            case 'lit': return [n.v];
            case 'recurse': { const out = []; const walk = (v) => { out.push(v); if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); }; walk(input); return out; }
            case 'var': if (n.name in env) return [env[n.name]]; if (n.name === 'ENV') return [{}]; bad(`$${n.name} is not defined`); break;
            case 'str': { let outs = ['']; for (const part of n.parts) { if (typeof part === 'string') outs = outs.map(s => s + part); else { const vals = ev(part.expr, input); outs = outs.flatMap(s => vals.map(v => s + this._jqStr(v))); } } return outs; }
            case 'fmt': { const vals = ev(n.e, input); return vals.map(v => { const s = typeof v === 'string' ? v : this._jqStr(v); switch (n.f) { case '@base64': return btoa(unescape(encodeURIComponent(s))); case '@base64d': return decodeURIComponent(escape(atob(s))); case '@json': return JSON.stringify(v); case '@uri': return encodeURIComponent(s); case '@csv': return (Array.isArray(v) ? v : [v]).map(x => typeof x === 'string' ? '"' + x.replace(/"/g, '""') + '"' : String(x)).join(','); case '@tsv': return (Array.isArray(v) ? v : [v]).map(x => String(x).replace(/\t/g, '\\t')).join('\t'); case '@html': return s.replace(/[<>&'"]/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' }[ch])); case '@sh': return `'${s.replace(/'/g, "'\\''")}'`; default: return s; } }); }
            case 'neg': return ev(n.e, input).map(v => { if (typeof v !== 'number') bad(`${this._jqType(v)} (${JSON.stringify(v)}) cannot be negated`); return -v; });
            case 'pipe': return ev(n.l, input).flatMap(v => ev(n.r, v));
            case 'comma': return ev(n.l, input).concat(ev(n.r, input));
            case 'as': return ev(n.src, input).flatMap(v => ev(n.body, input, Object.assign({}, env, { [n.name]: v })));
            case 'def': { const fns = Object.assign({}, env.__fns || {}, { [n.name]: n }); return ev(n.rest, input, Object.assign({}, env, { __fns: fns })); }
            case 'alt': { const l = ev(n.l, input).filter(v => this._jqTruthy(v)); return l.length ? l : ev(n.r, input); }
            case 'or': return ev(n.l, input).flatMap(a => this._jqTruthy(a) ? [true] : ev(n.r, input).map(b => this._jqTruthy(b)));
            case 'and': return ev(n.l, input).flatMap(a => !this._jqTruthy(a) ? [false] : ev(n.r, input).map(b => this._jqTruthy(b)));
            case 'if': { for (const [c, t] of n.branches) { const cv = ev(c, input); const hit = cv.flatMap(x => (this._jqTruthy(x) ? ev(t, input) : null)); if (cv.length && this._jqTruthy(cv[0])) return ev(t, input); } return n.el ? ev(n.el, input) : [input]; }
            case 'try': try { return ev(n.e, input); } catch (e) { return []; }
            case 'arr': return [n.e ? ev(n.e, input) : []];
            case 'obj': {
                let outs = [{}];
                for (const [kn, vn] of n.ents) { const keys = ev(kn, input), vals = ev(vn, input); const next2 = []; for (const o of outs) for (const k of keys) for (const v of vals) next2.push(Object.assign({}, o, { [k]: v })); outs = next2; }
                return outs;
            }
            case 'iter': return ev(n.e, input).flatMap(v => { if (Array.isArray(v)) return v; if (v && typeof v === 'object') return Object.values(v); bad(`Cannot iterate over ${this._jqType(v)}${v === null ? '' : ' (' + JSON.stringify(v) + ')'}`); });
            case 'idx': return ev(n.e, input).flatMap(base => ev(n.key, input).map(k => {
                if (base === null) return null;
                if (typeof k === 'string') { if (base && typeof base === 'object' && !Array.isArray(base)) return base[k] === undefined ? null : base[k]; bad(`Cannot index ${this._jqType(base)} with "${k}"`); }
                if (typeof k === 'number') { if (Array.isArray(base)) { const i = k < 0 ? base.length + k : k; return base[i] === undefined ? null : base[i]; } bad(`Cannot index ${this._jqType(base)} with number`); }
                bad(`Cannot index ${this._jqType(base)} with ${this._jqType(k)}`);
            }));
            case 'slice': return ev(n.e, input).flatMap(base => { const f = n.from ? ev(n.from, input)[0] : 0, t = n.to ? ev(n.to, input)[0] : null; if (typeof base === 'string' || Array.isArray(base)) return [base.slice(f, t === null ? undefined : t)]; if (base === null) return [null]; bad(`Cannot index ${this._jqType(base)} with object`); });
            case 'bin': return ev(n.l, input).flatMap(a => ev(n.r, input).map(b => this._jqBin(n.op, a, b)));
            case 'reduce': { let acc = ev(n.init, input)[0]; for (const v of ev(n.src, input)) acc = ev(n.upd, acc, Object.assign({}, env, { [n.name]: v }))[0]; return [acc]; }
            case 'foreach': { let acc = ev(n.init, input)[0]; const out = []; for (const v of ev(n.src, input)) { acc = ev(n.upd, acc, Object.assign({}, env, { [n.name]: v }))[0]; out.push(...(n.ext ? ev(n.ext, acc, Object.assign({}, env, { [n.name]: v })) : [acc])); } return out; }
            case 'call': return this._jqCall(n, input, env);
            default: bad('unsupported filter');
        }
        return [];
    }

    _jqBin(op, a, b) {
        const ty = (v) => this._jqType(v);
        switch (op) {
            case '+': if (a === null) return b; if (b === null) return a; if (typeof a === 'number' && typeof b === 'number') return a + b; if (typeof a === 'string' && typeof b === 'string') return a + b; if (Array.isArray(a) && Array.isArray(b)) return a.concat(b); if (ty(a) === 'object' && ty(b) === 'object') return Object.assign({}, a, b); throw new Error(`${ty(a)} (${JSON.stringify(a)}) and ${ty(b)} (${JSON.stringify(b)}) cannot be added`);
            case '-': if (typeof a === 'number' && typeof b === 'number') return a - b; if (Array.isArray(a) && Array.isArray(b)) return a.filter(x => !b.some(y => this._jqCmp(x, y) === 0)); throw new Error(`${ty(a)} (${JSON.stringify(a)}) and ${ty(b)} (${JSON.stringify(b)}) cannot be subtracted`);
            case '*': if (typeof a === 'number' && typeof b === 'number') return a * b; if (typeof a === 'string' && typeof b === 'number') return b > 0 ? a.repeat(b) : null; throw new Error(`${ty(a)} (${JSON.stringify(a)}) and ${ty(b)} (${JSON.stringify(b)}) cannot be multiplied`);
            case '/': if (typeof a === 'number' && typeof b === 'number') { if (b === 0) throw new Error(`${ty(a)} (${a}) and ${ty(b)} (${b}) cannot be divided because the divisor is zero`); return a / b; } if (typeof a === 'string' && typeof b === 'string') return a.split(b); throw new Error(`${ty(a)} (${JSON.stringify(a)}) and ${ty(b)} (${JSON.stringify(b)}) cannot be divided`);
            case '%': return Math.trunc(a) % Math.trunc(b);
            case '==': return this._jqCmp(a, b) === 0; case '!=': return this._jqCmp(a, b) !== 0;
            case '<': return this._jqCmp(a, b) < 0; case '>': return this._jqCmp(a, b) > 0; case '<=': return this._jqCmp(a, b) <= 0; case '>=': return this._jqCmp(a, b) >= 0;
        }
        return null;
    }

    _jqCall(n, input, env) {
        const name = n.name, A = n.args;
        const ev = (node, inp) => this._jqEval(node, inp, env);
        const user = env.__fns && env.__fns[name];
        if (user && user.params.length === A.length) {
            const e2 = Object.assign({}, env);
            user.params.forEach((p, i) => { e2.__fns = Object.assign({}, e2.__fns, { [p]: { k: 'def', name: p, params: [], body: A[i] } }); });
            return this._jqEval(user.body, input, e2);
        }
        if (user && user.params.length === 0 && !A.length) return this._jqEval(user.body, input, env);
        const arg1 = () => A[0];
        const one = (f) => [f(input)];
        switch (name) {
            case 'empty': return [];
            case 'not': return [!this._jqTruthy(input)];
            case 'length': if (input === null) return [0]; if (typeof input === 'string' || Array.isArray(input)) return [input.length]; if (typeof input === 'object') return [Object.keys(input).length]; if (typeof input === 'number') return [Math.abs(input)]; throw new Error(`${this._jqType(input)} (${input}) has no length`);
            case 'keys': case 'keys_unsorted': if (Array.isArray(input)) return [input.map((_, i) => i)]; if (input && typeof input === 'object') return [name === 'keys' ? Object.keys(input).sort() : Object.keys(input)]; throw new Error(`${this._jqType(input)} (${JSON.stringify(input)}) has no keys`);
            case 'values': return input === null ? [] : [input];
            case 'type': return [this._jqType(input)];
            case 'add': return [Array.isArray(input) ? input.reduce((a, b) => this._jqBin('+', a, b), null) : Object.values(input || {}).reduce((a, b) => this._jqBin('+', a, b), null)];
            case 'first': return A.length ? [ev(arg1(), input)[0]].filter(x => x !== undefined) : [Array.isArray(input) && input.length ? input[0] : null];
            case 'last': return A.length ? [ev(arg1(), input).slice(-1)[0]] : [Array.isArray(input) && input.length ? input[input.length - 1] : null];
            case 'reverse': return [typeof input === 'string' ? Array.from(input).reverse().join('') : input === null ? [] : input.slice().reverse()];
            case 'sort': return [input.slice().sort((a, b) => this._jqCmp(a, b))];
            case 'sort_by': return [input.map(x => [ev(arg1(), x)[0], x]).sort((a, b) => this._jqCmp(a[0], b[0])).map(x => x[1])];
            case 'group_by': { const g = []; for (const [k, x] of input.map(x => [ev(arg1(), x)[0], x]).sort((a, b) => this._jqCmp(a[0], b[0]))) { const last = g[g.length - 1]; if (last && this._jqCmp(last.k, k) === 0) last.v.push(x); else g.push({ k, v: [x] }); } return [g.map(x => x.v)]; }
            case 'unique': return [input.slice().sort((a, b) => this._jqCmp(a, b)).filter((x, i, a) => i === 0 || this._jqCmp(a[i - 1], x) !== 0)];
            case 'unique_by': { const seen = []; const out = []; for (const x of input) { const k = ev(arg1(), x)[0]; if (!seen.some(s => this._jqCmp(s, k) === 0)) { seen.push(k); out.push(x); } } return [out]; }
            case 'min': return [input.length ? input.reduce((a, b) => (this._jqCmp(b, a) < 0 ? b : a)) : null];
            case 'max': return [input.length ? input.reduce((a, b) => (this._jqCmp(b, a) >= 0 ? b : a)) : null];
            case 'min_by': return [input.length ? input.reduce((a, b) => (this._jqCmp(ev(arg1(), b)[0], ev(arg1(), a)[0]) < 0 ? b : a)) : null];
            case 'max_by': return [input.length ? input.reduce((a, b) => (this._jqCmp(ev(arg1(), b)[0], ev(arg1(), a)[0]) >= 0 ? b : a)) : null];
            case 'map': return [(Array.isArray(input) ? input : Object.values(input)).flatMap(x => ev(arg1(), x))];
            case 'map_values': return [Array.isArray(input) ? input.flatMap(x => ev(arg1(), x).slice(0, 1)) : Object.fromEntries(Object.entries(input).map(([k, v]) => [k, ev(arg1(), v)[0]]))];
            case 'select': return ev(arg1(), input).filter(c => this._jqTruthy(c)).map(() => input);
            case 'recurse': return this._jqEval({ k: 'recurse' }, input, env);
            case 'to_entries': return [Object.entries(input).map(([key, value]) => ({ key, value }))];
            case 'from_entries': return [Object.fromEntries(input.map(e => [e.key !== undefined ? e.key : (e.name !== undefined ? e.name : e.k), e.value !== undefined ? e.value : e.v]))];
            case 'with_entries': return [Object.fromEntries(Object.entries(input).map(([key, value]) => ({ key, value })).flatMap(e => ev(arg1(), e)).map(e => [e.key, e.value]))];
            case 'has': { const k = ev(arg1(), input)[0]; return [Array.isArray(input) ? k >= 0 && k < input.length : input !== null && typeof input === 'object' && Object.prototype.hasOwnProperty.call(input, k)]; }
            case 'in': { const o = ev(arg1(), input)[0]; return [Object.prototype.hasOwnProperty.call(o, input)]; }
            case 'contains': { const b = ev(arg1(), input)[0]; const has = (x, y) => (typeof x === 'string' && typeof y === 'string' ? x.includes(y) : Array.isArray(x) && Array.isArray(y) ? y.every(yy => x.some(xx => has(xx, yy))) : x && y && typeof x === 'object' && typeof y === 'object' ? Object.keys(y).every(k => k in x && has(x[k], y[k])) : this._jqCmp(x, y) === 0); return [has(input, b)]; }
            case 'inside': { const b = ev(arg1(), input)[0]; return this._jqCall({ k: 'call', name: 'contains', args: [{ k: 'lit', v: input }] }, b, env); }
            case 'any': return [A.length ? input.some(x => ev(arg1(), x).some(c => this._jqTruthy(c))) : input.some(x => this._jqTruthy(x))];
            case 'all': return [A.length ? input.every(x => ev(arg1(), x).every(c => this._jqTruthy(c))) : input.every(x => this._jqTruthy(x))];
            case 'join': { const sep = ev(arg1(), input)[0]; return [input.map(x => (x === null ? '' : typeof x === 'string' ? x : String(x))).join(sep)]; }
            case 'split': return [input.split(ev(arg1(), input)[0])];
            case 'tostring': return [this._jqStr(input)];
            case 'tonumber': { const v = typeof input === 'number' ? input : parseFloat(input); if (Number.isNaN(v)) throw new Error(`Cannot parse '${input}' as number`); return [v]; }
            case 'tojson': return [JSON.stringify(input)];
            case 'fromjson': return [JSON.parse(input)];
            case 'ascii_downcase': return [input.toLowerCase()]; case 'ascii_upcase': return [input.toUpperCase()];
            case 'ltrimstr': { const p = ev(arg1(), input)[0]; return [typeof input === 'string' && input.startsWith(p) ? input.slice(p.length) : input]; }
            case 'rtrimstr': { const p = ev(arg1(), input)[0]; return [typeof input === 'string' && input.endsWith(p) ? input.slice(0, -p.length) : input]; }
            case 'startswith': return [input.startsWith(ev(arg1(), input)[0])]; case 'endswith': return [input.endsWith(ev(arg1(), input)[0])];
            case 'test': { const re = ev(arg1(), input)[0]; const fl = A[1] ? ev(A[1], input)[0] : ''; return [new RegExp(re, fl.replace(/[^gimsuy]/g, '')).test(input)]; }
            case 'match': case 'capture': case 'scan': { const re = new RegExp(ev(arg1(), input)[0], 'g' + (A[1] ? ev(A[1], input)[0] : '').replace(/[^imsuy]/g, '')); const res = []; let m; while ((m = re.exec(input))) { res.push(name === 'scan' ? m[0] : { offset: m.index, length: m[0].length, string: m[0], captures: m.slice(1).map(c => ({ string: c })) }); if (m[0] === '') re.lastIndex++; } return name === 'capture' ? res.map(r => Object.fromEntries(r.captures.map((c, i) => [i, c.string]))) : res; }
            case 'sub': case 'gsub': { const re = new RegExp(ev(arg1(), input)[0], name === 'gsub' ? 'g' : ''); return [input.replace(re, ev(A[1], input)[0])]; }
            case 'flatten': { const d = A.length ? ev(arg1(), input)[0] : Infinity; const fl = (a, depth) => a.flatMap(x => (Array.isArray(x) && depth > 0 ? fl(x, depth - 1) : [x])); return [fl(input, d)]; }
            case 'range': { const a = ev(A[0], input)[0]; if (A.length === 1) return Array.from({ length: Math.max(0, a) }, (_, i) => i); const b = ev(A[1], input)[0], s = A[2] ? ev(A[2], input)[0] : 1; const out = []; for (let i = a; s > 0 ? i < b : i > b; i += s) out.push(i); return out; }
            case 'floor': return [Math.floor(input)]; case 'ceil': return [Math.ceil(input)]; case 'round': return [Math.round(input)]; case 'sqrt': return [Math.sqrt(input)]; case 'fabs': case 'abs': return [Math.abs(input)];
            case 'limit': { const n2 = ev(A[0], input)[0]; return ev(A[1], input).slice(0, n2); }
            case 'del': { const paths = []; const clone = JSON.parse(JSON.stringify(input)); const d = (node, base) => { if (node.k === 'idx' && node.e.k === 'id') { const k = ev(node.key, input)[0]; if (Array.isArray(base)) base.splice(k, 1); else delete base[k]; } else if (node.k === 'iter' && node.e.k === 'id') { if (Array.isArray(base)) base.length = 0; else for (const k of Object.keys(base)) delete base[k]; } else if (node.k === 'idx') { for (const tgt of this._jqEval(node.e, clone, env)) { const k = ev(node.key, input)[0]; if (Array.isArray(tgt)) tgt.splice(k, 1); else if (tgt && typeof tgt === 'object') delete tgt[k]; } } }; d(arg1(), clone); return [clone]; }
            case 'env': return [{}];
            case 'now': return [Date.now() / 1000];
            case 'input_filename': return [null];
            case 'tojson': return [JSON.stringify(input)];
            case 'ascii': return [String.fromCharCode(input)];
            case 'splits': return input.split(new RegExp(ev(arg1(), input)[0]));
            case 'indices': case 'index': { const t = ev(arg1(), input)[0]; const idx = []; let i = -1; while ((i = input.indexOf(t, i + 1)) >= 0) idx.push(i); return name === 'index' ? [idx.length ? idx[0] : null] : [idx]; }
            case 'paths': { const out = []; const w = (v, p) => { if (Array.isArray(v)) v.forEach((x, i) => { out.push(p.concat(i)); w(x, p.concat(i)); }); else if (v && typeof v === 'object') for (const k of Object.keys(v)) { out.push(p.concat(k)); w(v[k], p.concat(k)); } }; w(input, []); return out; }
            case 'getpath': { let v = input; for (const k of ev(arg1(), input)[0]) { if (v === null) return [null]; v = v[k]; } return [v === undefined ? null : v]; }
            case 'error': throw new Error(A.length ? this._jqStr(ev(arg1(), input)[0]) : this._jqStr(input));
            case 'isnan': return [Number.isNaN(input)]; case 'infinite': return [Infinity]; case 'nan': return [NaN];
            case 'transpose': return [input[0].map((_, i) => input.map(r => r[i]))];
            case 'to_number': return [Number(input)];
            case 'objects': return this._jqType(input) === 'object' ? [input] : []; case 'arrays': return Array.isArray(input) ? [input] : []; case 'strings': return typeof input === 'string' ? [input] : []; case 'numbers': return typeof input === 'number' ? [input] : []; case 'nulls': return input === null ? [input] : []; case 'booleans': return typeof input === 'boolean' ? [input] : []; case 'iterables': return input && typeof input === 'object' ? [input] : []; case 'scalars': return input && typeof input === 'object' ? [] : [input];
            default: throw new Error(`${name}/${A.length} is not defined`);
        }
    }

    // =========================================================== bc / dc
    bc(args, stdin) {
        const { o, rest } = this._flags(args, ['e']);
        if (o.version || o.q === undefined && o.v) return this._ok('bc 1.07.1\nCopyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.');
        let text = '';
        if (rest.length) { for (const f of rest) { const t = this._readFile(f); if (t === null) return this._err(`bc: cannot open file ${f}`, 1); text += t + '\n'; } text += stdin || ''; } else text = stdin || '';
        if (o.e) text = o.e + '\n' + text;
        const P = { scale: o.l ? 20 : 0, vars: {}, last: { n: 0n, s: 0 } };
        const out = [];
        const errs = [];
        const stmts = text.split(/\n|;/).map(s => s.trim()).filter(Boolean);
        for (const s of stmts) {
            if (s === 'quit' || s === 'halt') break;
            try {
                const r = this._bcRun(s, P);
                if (r !== null) out.push(this._bcFmt(r, 10));
            } catch (e) { errs.push(`(standard_in) ${stmts.indexOf(s) + 1}: ${e.message}`); }
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 0 : 0 };
    }

    _bcFmt(v) {
        let s = v.n < 0n ? -v.n : v.n;
        let str = s.toString();
        if (v.s > 0) { str = str.padStart(v.s + 1, '0'); const ip = str.slice(0, -v.s), fp = str.slice(-v.s); str = (ip === '0' ? '' : ip) + '.' + fp; }
        if (v.n < 0n && /[1-9]/.test(str)) str = '-' + str;
        if (str === '') str = '0';
        if (str.length > 68) str = str.replace(/(.{68})/g, '$1\\\n');
        return str;
    }

    _bcRun(stmt, P) {
        const toks = stmt.match(/\d+\.?\d*|\.\d+|[A-Za-z_][A-Za-z_0-9]*|\^|\*\*|<=|>=|==|!=|&&|\|\||[-+*/%()=<>!,]/g) || [];
        let p = 0;
        const pow10 = (n) => 10n ** BigInt(n);
        const norm = (v) => v;
        const mk = (n, s) => ({ n, s });
        const lit = (str) => { const [ip, fp = ''] = str.split('.'); return mk(BigInt((ip || '0') + fp), fp.length); };
        const align = (a, b) => { const s = Math.max(a.s, b.s); return [a.n * pow10(s - a.s), b.n * pow10(s - b.s), s]; };
        const trunc = (v, s) => (v.s > s ? mk(v.n / pow10(v.s - s), s) : v);
        const add = (a, b) => { const [x, y, s] = align(a, b); return mk(x + y, s); };
        const sub = (a, b) => { const [x, y, s] = align(a, b); return mk(x - y, s); };
        const mul = (a, b) => { const full = mk(a.n * b.n, a.s + b.s); return trunc(full, Math.min(a.s + b.s, Math.max(P.scale, a.s, b.s))); };
        const div = (a, b) => { if (b.n === 0n) throw new Error('Runtime error (func=(main), adr=0): Divide by zero'); const sh = P.scale + b.s - a.s; const num = sh >= 0 ? a.n * pow10(sh) : a.n / pow10(-sh); return mk(num / b.n, P.scale); };
        const mod = (a, b) => { if (b.n === 0n) throw new Error('Runtime error (func=(main), adr=0): Remainder by zero'); const q = div(a, b); const qt = trunc(q, 0); return sub(a, trunc(mul(qt, b), Math.max(a.s, P.scale + b.s))); };
        const powf = (a, b) => { if (b.s > 0 && b.n % pow10(b.s) !== 0n) throw new Error('Runtime warning: non-zero scale in exponent'); let e = Number(b.n / pow10(b.s)); if (e >= 0) { let r = mk(1n, 0); for (let i = 0; i < e; i++) r = mul(r, a); return trunc(r, Math.min(a.s * e, Math.max(P.scale, a.s))); } return div(mk(1n, 0), powf(a, mk(BigInt(-e), 0))); };
        const isqrt = (n) => { if (n < 2n) return n; let x = n, y = (x + 1n) / 2n; while (y < x) { x = y; y = (x + n / x) / 2n; } return x; };
        const sqrt = (a) => { if (a.n < 0n) throw new Error('Runtime error (func=(main), adr=0): square root of negative number'); const s = Math.max(P.scale, a.s); const n = a.n * pow10(2 * s - a.s); return mk(isqrt(n), s); };
        const cmpv = (a, b) => { const [x, y] = align(a, b); return x < y ? -1 : x > y ? 1 : 0; };
        const bool = (b) => mk(b ? 1n : 0n, 0);
        const peek = () => toks[p], next = () => toks[p++];
        const parseExpr = () => parseOr();
        const parseOr = () => { let l = parseAnd(); while (peek() === '||') { next(); const r = parseAnd(); l = bool(l.n !== 0n || r.n !== 0n); } return l; };
        const parseAnd = () => { let l = parseCmp(); while (peek() === '&&') { next(); const r = parseCmp(); l = bool(l.n !== 0n && r.n !== 0n); } return l; };
        const parseCmp = () => { let l = parseAdd(); while (['<', '>', '<=', '>=', '==', '!='].includes(peek())) { const op = next(); const r = parseAdd(); const c = cmpv(l, r); l = bool(op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : op === '>=' ? c >= 0 : op === '==' ? c === 0 : c !== 0); } return l; };
        const parseAdd = () => { let l = parseMul(); while (peek() === '+' || peek() === '-') { const op = next(); const r = parseMul(); l = op === '+' ? add(l, r) : sub(l, r); } return l; };
        const parseMul = () => { let l = parsePow(); while (peek() === '*' || peek() === '/' || peek() === '%') { const op = next(); const r = parsePow(); l = op === '*' ? mul(l, r) : op === '/' ? div(l, r) : mod(l, r); } return l; };
        const parsePow = () => { const b = parseUnary(); if (peek() === '^' || peek() === '**') { next(); const e = parsePow(); return powf(b, e); } return b; };
        const parseUnary = () => { if (peek() === '-') { next(); const v = parseUnary(); return mk(-v.n, v.s); } if (peek() === '+') { next(); return parseUnary(); } if (peek() === '!') { next(); const v = parseUnary(); return bool(v.n === 0n); } return parseAtom(); };
        const parseAtom = () => {
            const t = next();
            if (t === undefined) throw new Error('syntax error');
            if (/^[\d.]/.test(t)) return lit(t);
            if (t === '(') { const v = parseExpr(); if (next() !== ')') throw new Error('syntax error'); return v; }
            if (t === 'sqrt') { next(); const v = parseExpr(); next(); return sqrt(v); }
            if (t === 'length') { next(); const v = parseExpr(); next(); return mk(BigInt(String(v.n < 0n ? -v.n : v.n).length), 0); }
            if (t === 'scale') { if (peek() === '(') { next(); const v = parseExpr(); next(); return mk(BigInt(v.s), 0); } return mk(BigInt(P.scale), 0); }
            if (t === 'last') return P.last;
            if (/^[A-Za-z_]/.test(t)) return P.vars[t] || mk(0n, 0);
            throw new Error('syntax error');
        };
        if (toks.length >= 2 && toks[0] === 'scale' && toks[1] === '=') { p = 2; const v = parseExpr(); P.scale = Number(v.n / pow10(v.s)); return null; }
        if (toks.length >= 2 && /^[A-Za-z_]/.test(toks[0]) && toks[1] === '=' ) { const name = toks[0]; p = 2; const v = parseExpr(); P.vars[name] = v; return null; }
        if (toks.length >= 2 && /^[A-Za-z_]/.test(toks[0]) && ['+', '-', '*', '/'].includes(toks[1]) && toks[2] === '=') { const name = toks[0]; const op = toks[1]; p = 3; const v = parseExpr(); const cur = P.vars[name] || mk(0n, 0); P.vars[name] = op === '+' ? add(cur, v) : op === '-' ? sub(cur, v) : op === '*' ? mul(cur, v) : div(cur, v); return null; }
        const v = parseExpr();
        if (p < toks.length) throw new Error('syntax error');
        P.last = v;
        return v;
    }

    dc(args, stdin) {
        const { o, rest } = this._flags(args, ['e']);
        const src = (o.e ? o.e + ' ' : '') + (rest.length ? rest.map(f => this._readFile(f) || '').join(' ') : '') + (stdin || '');
        const st = []; const out = [];
        let scale = 0;
        const toks = src.match(/-?\d+\.?\d*|[a-zA-Z+\-*/%^]|\S/g) || [];
        const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Math.trunc(n * 10 ** scale) / 10 ** scale));
        for (const t of toks) {
            if (/^-?\d/.test(t)) { st.push(parseFloat(t)); continue; }
            if (['+', '-', '*', '/', '%', '^'].includes(t)) { if (st.length < 2) { return { stdout: out.join('\n'), stderr: 'dc: stack empty', exitCode: 1 }; } const b = st.pop(), a = st.pop(); st.push(t === '+' ? a + b : t === '-' ? a - b : t === '*' ? a * b : t === '/' ? (scale ? a / b : Math.trunc(a / b)) : t === '%' ? a % b : a ** b); continue; }
            if (t === 'p') { if (!st.length) return { stdout: out.join('\n'), stderr: 'dc: stack empty', exitCode: 1 }; out.push(fmt(st[st.length - 1])); continue; }
            if (t === 'n') { out.push(fmt(st.pop())); continue; }
            if (t === 'f') { out.push(...st.slice().reverse().map(fmt)); continue; }
            if (t === 'c') { st.length = 0; continue; }
            if (t === 'd') { st.push(st[st.length - 1]); continue; }
            if (t === 'r') { const b = st.pop(), a = st.pop(); st.push(b, a); continue; }
            if (t === 'k') { scale = st.pop(); continue; }
            if (t === 'v') { st.push(Math.sqrt(st.pop())); continue; }
            if (t === 'q') break;
        }
        return this._ok(out.join('\n'));
    }

    // =========================================================== openssl
    openssl(args, stdin) {
        const sub = args[0];
        const rest = args.slice(1);
        if (!sub || sub === 'help') return this._ok('Standard commands\nasn1parse         ca               ciphers          cms\ncrl              crl2pkcs7        dgst             dhparam\ndsa              dsaparam         ec               ecparam\nenc              engine           errstr           gendsa\ngenpkey          genrsa           help             list\nnseq             ocsp             passwd           pkcs12\npkcs7            pkcs8            pkey             pkeyparam\npkeyutl          prime            rand             rehash\nreq              rsa              rsautl           s_client\ns_server         s_time           sess_id          smime\nspeed            spkac            srp              storeutl\nts               verify           version          x509');
        const fn = { version: '_osVersion', rand: '_osRand', passwd: '_osPasswd', dgst: '_osDgst', genrsa: '_osGenrsa', genpkey: '_osGenrsa', req: '_osReq', x509: '_osX509', rsa: '_osRsa', verify: '_osVerify', s_client: '_osSclient', enc: '_osEnc' }[sub];
        if (!fn) return this._err(`Invalid command '${sub}'; type "help" for a list.`, 1);
        return this[fn](rest, stdin);
    }

    _osVersion(rest) {
        if (rest.includes('-a')) return this._ok('OpenSSL 3.0.7 1 Nov 2022 (Library: OpenSSL 3.0.7 1 Nov 2022)\nbuilt on: Thu Nov  3 00:00:00 2022 UTC\nplatform: linux-x86_64\noptions:  bn(64,64)\ncompiler: gcc -fPIC -pthread -m64 -Wa,--noexecstack -Wall\nOPENSSLDIR: "/etc/pki/tls"\nENGINESDIR: "/usr/lib64/engines-3"\nMODULESDIR: "/usr/lib64/ossl-modules"\nCPUINFO: OPENSSL_ia32cap=0xfffa3203578bffff:0x4219c01a9');
        return this._ok('OpenSSL 3.0.7 1 Nov 2022 (Library: OpenSSL 3.0.7 1 Nov 2022)');
    }

    _osRand(rest) {
        const { o, rest: r } = this._flags(rest, []);
        const n = parseInt(r[r.length - 1], 10);
        if (Number.isNaN(n)) return this._err('Usage: rand [options] num', 1);
        if (rest.includes('-hex')) return this._ok(this._hex(n * 2));
        if (rest.includes('-base64')) { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(Math.floor(Math.random() * 256)); return this._ok(btoa(s)); }
        return this._ok(Array.from({ length: n }, () => String.fromCharCode(33 + Math.floor(Math.random() * 90))).join(''));
    }

    _osPasswd(rest, stdin) {
        const { o, rest: r } = this._flags(rest, ['salt']);
        let alg = '6';
        if (rest.includes('-1')) alg = '1'; else if (rest.includes('-5')) alg = '5'; else if (rest.includes('-apr1')) alg = 'apr1'; else if (rest.includes('-6')) alg = '6';
        const saltIdx = rest.indexOf('-salt');
        const salt = saltIdx >= 0 ? rest[saltIdx + 1] : this._b64(8).replace(/[+/]/g, '.');
        let pw = r.filter(x => x !== salt && !/^\d+$/.test(x) && x !== 'apr1').pop();
        if (rest.includes('-stdin')) pw = (stdin || '').split('\n')[0];
        if (pw === undefined) {
            const a = this._ask('Password: ', true), b = this._ask('Verifying - Password: ', true);
            if (a !== b) return this._err('Verify failure', 1);
            pw = a;
        }
        const alpha = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const enc = (hex, len) => { let s = ''; const bytes = hex.match(/../g).map(h => parseInt(h, 16)); let i = 0; while (s.length < len) { const v = (bytes[i % bytes.length] << 16) | (bytes[(i + 1) % bytes.length] << 8) | bytes[(i + 2) % bytes.length]; for (let k = 0; k < 4 && s.length < len; k++) s += alpha[(v >> (6 * k)) & 63]; i += 3; } return s; };
        const h = alg === '6' ? UTIL_HASH.sha512(UTIL_HASH.utf8(salt + pw)) : alg === '5' ? UTIL_HASH.sha256(UTIL_HASH.utf8(salt + pw)) : UTIL_HASH.md5(UTIL_HASH.utf8(salt + pw));
        const len = alg === '6' ? 86 : alg === '5' ? 43 : 22;
        return this._ok(`$${alg}$${salt}$${enc(h, len)}`);
    }

    _osDgst(rest, stdin) {
        const algos = { '-sha256': ['sha256', 'SHA2-256'], '-sha512': ['sha512', 'SHA2-512'], '-sha1': ['sha1', 'SHA1'], '-md5': ['md5', 'MD5'] };
        let alg = algos['-sha256'];
        for (const a of rest) if (algos[a]) alg = algos[a];
        const files = rest.filter(a => !a.startsWith('-') && !(rest[rest.indexOf(a) - 1] === '-out'));
        if (!files.length) return this._ok(`${alg[1]}(stdin)= ${UTIL_HASH[alg[0]](UTIL_HASH.utf8(stdin || ''))}`);
        const out = [];
        for (const f of files) { const t = this._readFile(f); if (t === null) return this._err(`Could not open file ${f}`, 1); out.push(`${alg[1]}(${f})= ${UTIL_HASH[alg[0]](UTIL_HASH.utf8(t))}`); }
        return this._ok(out.join('\n'));
    }

    // key and certificate "files": PEM text whose body carries the details so x509/rsa can read them back
    _pem(label, payload, extraBytes) {
        const json = JSON.stringify(payload);
        const head = String.fromCharCode(0x30, 0x82, 0x03, 0x4f, 0x30, 0x82, 0x02, 0x37);
        let pad = '';
        for (let i = 0; i < extraBytes; i++) pad += String.fromCharCode(Math.floor(Math.random() * 256));
        const b64 = btoa(head + json + '\0' + pad);
        return `-----BEGIN ${label}-----\n${b64.replace(/(.{64})/g, '$1\n').replace(/\n$/, '')}\n-----END ${label}-----\n`;
    }

    _unpem(text) {
        const m = /-----BEGIN ([A-Z ]+)-----\n([\s\S]*?)\n-----END \1-----/.exec(text || '');
        if (!m) return null;
        try {
            const bin = atob(m[2].replace(/\s/g, ''));
            const body = bin.slice(8);
            const json = body.slice(0, body.indexOf('\0'));
            return { label: m[1], data: JSON.parse(json) };
        } catch (e) { return null; }
    }

    _osGenrsa(rest) {
        const { o, rest: r } = this._flags(rest, ['out', 'algorithm']);
        const outIdx = rest.indexOf('-out');
        const out = outIdx >= 0 ? rest[outIdx + 1] : null;
        const bits = parseInt(r.filter(x => /^\d+$/.test(x)).pop() || '2048', 10);
        const id = this._hex(32);
        const pem = this._pem('PRIVATE KEY', { type: 'key', id, bits }, Math.floor(bits * 0.6));
        if (out) { this._write(out, pem, '0600'); return this._ok(''); }
        return this._ok(pem.replace(/\n$/, ''));
    }

    _subjectText(subj) { return subj.map(([k, v]) => `${k} = ${v}`).join(', '); }

    _osReq(rest) {
        const argv = rest.slice();
        const take = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
        const x509 = argv.includes('-x509'), nodes = argv.includes('-nodes') || argv.includes('-noenc');
        const newkey = take('-newkey'), keyIn = take('-key'), keyout = take('-keyout'), out = take('-out'), days = parseInt(take('-days') || '30', 10), subj = take('-subj');
        let id, keyPem = null;
        if (newkey) {
            const bits = parseInt((newkey.split(':')[1]) || '2048', 10);
            id = this._hex(32);
            keyPem = this._pem('PRIVATE KEY', { type: 'key', id, bits }, Math.floor(bits * 0.6));
        } else if (keyIn) {
            const t = this._readFile(keyIn);
            if (t === null) return this._err(`Could not open file or uri for loading private key from ${keyIn}`, 1);
            const k = this._unpem(t);
            if (!k) return this._err(`Could not read private key from ${keyIn}`, 1);
            id = k.data.id;
        } else return this._err('req: no private key: use -key or -newkey', 1);
        let fields;
        if (subj) {
            fields = [];
            for (const part of subj.split(/(?<!\\)\//).filter(Boolean)) { const [k, ...v] = part.split('='); fields.push([k, v.join('=')]); }
        } else {
            this._emit("-----\nYou are about to be asked to enter information that will be incorporated\ninto your certificate request.\nWhat you are about to enter is what is called a Distinguished Name or a DN.\nThere are quite a few fields but you can leave some blank\nFor some fields there will be a default value,\nIf you enter '.', the field will be left blank.\n-----\n");
            fields = [];
            for (const [k, label, def] of [['C', 'Country Name (2 letter code)', 'XX'], ['ST', 'State or Province Name (full name)', ''], ['L', 'Locality Name (eg, city)', 'Default City'], ['O', 'Organization Name (eg, company)', 'Default Company Ltd'], ['OU', 'Organizational Unit Name (eg, section)', ''], ['CN', 'Common Name (eg, your name or your server\'s hostname)', ''], ['emailAddress', 'Email Address', '']]) {
                const a = this._ask(`${label} [${def}]:`);
                if (a === null) return { stdout: '', stderr: '', exitCode: 1 };
                const v = a === '' ? def : a;
                if (v && v !== '.') fields.push([k, v]);
            }
        }
        const now = this._now().getTime();
        const serial = this._hex(32).toUpperCase();
        const cert = { type: x509 ? 'cert' : 'csr', id, subject: fields, issuer: fields, serial, notBefore: now, notAfter: now + days * 86400000, self: true };
        const body = this._pem(x509 ? 'CERTIFICATE' : 'CERTIFICATE REQUEST', cert, 700);
        if (keyPem && keyout) this._write(keyout, keyPem, '0600');
        else if (keyPem && !keyout) this._write('privkey.pem', keyPem, '0600');
        if (out) { this._write(out, body, '0644'); return { stdout: '', stderr: '', exitCode: 0 }; }
        return this._ok(body.replace(/\n$/, ''));
    }

    _certFrom(file, wantKinds) {
        const t = this._readFile(file);
        if (t === null) return { err: `Could not open file or uri for loading certificate from ${file}` };
        const u = this._unpem(t);
        if (!u || !wantKinds.includes(u.data.type)) return { err: `Could not read certificate from ${file}\nUnable to load certificate` };
        return { cert: u.data };
    }

    _dateStr(ms) { const tm = this._tm(); return (tm ? tm.format(new Date(ms), 'UTC', '%b %e %H:%M:%S %Y') : new Date(ms).toUTCString()) + ' GMT'; }

    _osX509(rest) {
        const argv = rest.slice();
        const take = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
        const file = take('-in');
        const req = argv.includes('-req');
        if (!file) return this._err('x509: reading certificate from stdin is not supported in Red Cat; use -in file', 1);
        const r = this._certFrom(file, req ? ['csr'] : ['cert']);
        if (r.err) return this._err(r.err, 1);
        const c = r.cert;
        if (req) {
            const keyFile = take('-signkey') || take('-CAkey');
            const days = parseInt(take('-days') || '30', 10);
            const out = take('-out');
            const now = this._now().getTime();
            const cert = Object.assign({}, c, { type: 'cert', serial: this._hex(32).toUpperCase(), notBefore: now, notAfter: now + days * 86400000 });
            if (keyFile) { const k = this._unpem(this._readFile(keyFile) || ''); if (k) cert.id = k.data.id; }
            const body = this._pem('CERTIFICATE', cert, 700);
            if (out) { this._write(out, body); return { stdout: '', stderr: 'Certificate request self-signature ok\nsubject=' + this._subjectText(c.subject), exitCode: 0 }; }
            return this._ok(body.replace(/\n$/, ''));
        }
        const out = [];
        const noout = argv.includes('-noout');
        if (argv.includes('-subject')) out.push('subject=' + this._subjectText(c.subject));
        if (argv.includes('-issuer')) out.push('issuer=' + this._subjectText(c.issuer));
        if (argv.includes('-serial')) out.push('serial=' + c.serial);
        if (argv.includes('-dates')) out.push('notBefore=' + this._dateStr(c.notBefore), 'notAfter=' + this._dateStr(c.notAfter));
        if (argv.includes('-startdate')) out.push('notBefore=' + this._dateStr(c.notBefore));
        if (argv.includes('-enddate')) out.push('notAfter=' + this._dateStr(c.notAfter));
        if (argv.includes('-modulus')) out.push('Modulus=' + UTIL_HASH.sha256(UTIL_HASH.utf8(c.id)).toUpperCase() + UTIL_HASH.sha256(UTIL_HASH.utf8(c.id + '2')).toUpperCase());
        if (argv.includes('-fingerprint')) { const h = UTIL_HASH.sha256(UTIL_HASH.utf8(JSON.stringify(c))).toUpperCase().match(/../g).join(':'); out.push(`${argv.includes('-sha1') ? 'sha1' : 'sha256'} Fingerprint=${h}`); }
        if (argv.includes('-checkend')) { const s = parseInt(take('-checkend'), 10); const expired = this._now().getTime() + s * 1000 > c.notAfter; return { stdout: expired ? 'Certificate will expire' : 'Certificate will not expire', stderr: '', exitCode: expired ? 1 : 0 }; }
        if (argv.includes('-text')) {
            const bits = 2048;
            out.push('Certificate:', '    Data:', '        Version: 3 (0x2)', '        Serial Number:', '            ' + c.serial.toLowerCase().match(/../g).join(':'), '        Signature Algorithm: sha256WithRSAEncryption', '        Issuer: ' + this._subjectText(c.issuer), '        Validity', '            Not Before: ' + this._dateStr(c.notBefore), '            Not After : ' + this._dateStr(c.notAfter), '        Subject: ' + this._subjectText(c.subject), '        Subject Public Key Info:', '            Public Key Algorithm: rsaEncryption', `                RSA Public-Key: (${bits} bit)`, '                Modulus:', ...(UTIL_HASH.sha256(UTIL_HASH.utf8(c.id)) + UTIL_HASH.sha256(UTIL_HASH.utf8(c.id + '2'))).match(/.{1,30}/g).map(l => '                    ' + l.match(/../g).join(':') + ':'), '                Exponent: 65537 (0x10001)', '        X509v3 extensions:', '            X509v3 Subject Key Identifier: ', '                ' + UTIL_HASH.sha1(UTIL_HASH.utf8(c.id)).toUpperCase().match(/../g).join(':'), '            X509v3 Basic Constraints: critical', '                CA:TRUE', '    Signature Algorithm: sha256WithRSAEncryption', '    Signature Value:', '        ' + UTIL_HASH.sha256(UTIL_HASH.utf8(c.id + c.serial)).match(/../g).join(':'));
        }
        if (!noout) out.push(this._readFile(file).replace(/\n$/, ''));
        return this._ok(out.join('\n'));
    }

    _osRsa(rest) {
        const argv = rest.slice();
        const take = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
        const file = take('-in');
        if (!file) return this._err('rsa: no input file (use -in)', 1);
        const t = this._readFile(file);
        if (t === null) return this._err(`Could not open file or uri for loading key from ${file}`, 1);
        const k = this._unpem(t);
        if (!k || k.data.type !== 'key') return this._err(`Could not read private key from ${file}`, 1);
        const out = [];
        if (argv.includes('-check')) out.push('RSA key ok');
        if (argv.includes('-modulus')) out.push('Modulus=' + UTIL_HASH.sha256(UTIL_HASH.utf8(k.data.id)).toUpperCase() + UTIL_HASH.sha256(UTIL_HASH.utf8(k.data.id + '2')).toUpperCase());
        let pem = null;
        if (argv.includes('-pubout')) pem = this._pem('PUBLIC KEY', { type: 'pub', id: k.data.id, bits: k.data.bits }, Math.floor(k.data.bits * 0.15));
        else if (!argv.includes('-noout')) pem = t;
        const o = take('-out');
        if (pem) { if (o) this._write(o, pem); else out.push(pem.replace(/\n$/, '')); }
        return { stdout: out.join('\n'), stderr: pem ? 'writing RSA key' : '', exitCode: 0 };
    }

    _osVerify(rest) {
        const argv = rest.slice();
        const ca = argv.indexOf('-CAfile') >= 0 ? argv[argv.indexOf('-CAfile') + 1] : null;
        const file = argv.filter((a, i) => !a.startsWith('-') && argv[i - 1] !== '-CAfile').pop();
        if (!file) return this._err('Usage: verify [options] [cert...]', 1);
        const r = this._certFrom(file, ['cert']);
        if (r.err) return this._err(`${r.err}\nerror ${file}: verification failed`, 2);
        const c = r.cert;
        if (this._now().getTime() > c.notAfter) return { stdout: '', stderr: `${this._subjectText(c.subject)}\nerror 10 at 0 depth lookup: certificate has expired\nerror ${file}: verification failed`, exitCode: 2 };
        if (ca) { const cr = this._certFrom(ca, ['cert']); if (!cr.err && cr.cert.id === c.id) return this._ok(`${file}: OK`); if (cr.err) return this._err(`Error loading file ${ca}`, 2); }
        return { stdout: '', stderr: `${this._subjectText(c.subject)}\nerror 18 at 0 depth lookup: self-signed certificate\nerror ${file}: verification failed`, exitCode: 2 };
    }

    _osSclient(rest) {
        const i = rest.indexOf('-connect');
        const target = i >= 0 ? rest[i + 1] : rest.find(a => /:\d+$/.test(a));
        if (!target) return this._err('s_client: no -connect target (host:port)', 1);
        const [host, portS] = target.split(':');
        const port = parseInt(portS || '443', 10);
        const apps = this.shared.apps;
        const pr = apps ? apps._probe(host, port, 'tcp') : { state: 'closed' };
        if (pr.state === 'unresolved') return this._err(`Could not resolve hostname ${host}`, 1);
        if (pr.state !== 'open') return { stdout: '', stderr: `connect:errno=111\n${this._hex(12)}:error:8000006F:system library:BIO_connect:Connection refused:../crypto/bio/bio_sock2.c:114:calling connect()\n${this._hex(12)}:error:10000067:BIO routines:BIO_connect:connect error:../crypto/bio/bio_sock2.c:116:`, exitCode: 1 };
        if (port !== 443 && port !== 8443 && port !== 993 && port !== 465) return { stdout: 'CONNECTED(00000003)\n' + this._hex(12) + ':error:0A00010B:SSL routines:ssl3_get_record:wrong version number:ssl/record/ssl3_record.c:354:\n---\nno peer certificate available\n---\nNo client certificate CA names sent\n---\nSSL handshake has read 5 bytes and written 295 bytes\nVerification: OK\n---\nNew, (NONE), Cipher is (NONE)\nSecure Renegotiation IS NOT supported\nNo ALPN negotiated\nEarly data was not sent\nVerify return code: 0 (ok)\n---', stderr: '', exitCode: 1 };
        const crt = this._readFile('/etc/pki/tls/certs/localhost.crt');
        const u = crt ? this._unpem(crt) : null;
        const subj = u ? this._subjectText(u.data.subject) : `CN = ${host}`;
        return this._ok(`CONNECTED(00000003)\ndepth=0 ${subj}\nverify error:num=18:self-signed certificate\nverify return:1\ndepth=0 ${subj}\nverify return:1\n---\nCertificate chain\n 0 s:${subj}\n   i:${subj}\n   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256\n---\nServer certificate\n-----BEGIN CERTIFICATE-----\n${crt ? crt.split('\n').slice(1, -2).join('\n') : this._b64(64)}\n-----END CERTIFICATE-----\nsubject=${subj}\nissuer=${subj}\n---\nSSL handshake has read 1534 bytes and written 436 bytes\nVerification error: self-signed certificate\n---\nNew, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384\nServer public key is 2048 bit\nSecure Renegotiation IS NOT supported\nCompression: NONE\nExpansion: NONE\nNo ALPN negotiated\nEarly data was not sent\nVerify return code: 18 (self-signed certificate)\n---\nDONE`);
    }

    _osEnc(rest, stdin) {
        const argv = rest.slice();
        const take = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
        const decrypt = argv.includes('-d');
        const b64 = argv.includes('-a') || argv.includes('-base64');
        const inF = take('-in'), outF = take('-out');
        let pass = take('-pass'); if (pass && pass.startsWith('pass:')) pass = pass.slice(5); else if (pass && pass.startsWith('file:')) pass = (this._readFile(pass.slice(5)) || '').split('\n')[0];
        const cipher = argv.find(a => /^-(aes|des|bf|camellia)/.test(a));
        if (!cipher && !b64) return this._err('enc: no cipher specified (use e.g. -aes-256-cbc)', 1);
        let data = inF ? this._readFile(inF) : (stdin || '');
        if (data === null) return this._err(`Can't open "${inF}" for reading, No such file or directory`, 1);
        if (cipher && pass === null) { const a = this._ask(`enter ${cipher.slice(1).toUpperCase()} ${decrypt ? 'decryption' : 'encryption'} password:`, true); if (!decrypt) { const b = this._ask('Verifying - enter ' + cipher.slice(1).toUpperCase() + ' encryption password:', true); if (a !== b) return this._err('Verify failure\nbad password read', 1); } pass = a; }
        let result;
        if (!cipher) { try { result = decrypt ? decodeURIComponent(escape(atob(data.replace(/\s/g, '')))) : btoa(unescape(encodeURIComponent(data))).replace(/(.{64})/g, '$1\n').replace(/\n$/, '') + '\n'; } catch (e) { return this._err('Invalid input', 1); } }
        else if (!decrypt) {
            const salt = this._hex(16);
            const key = UTIL_HASH.sha256(UTIL_HASH.utf8(pass + salt));
            const bytes = UTIL_HASH.utf8(data);
            const ks = (i) => parseInt(key.substr((i * 2) % 64, 2), 16);
            const body = Array.from(bytes).map((b, i) => (b ^ ks(i)).toString(16).padStart(2, '0')).join('');
            const tag = UTIL_HASH.sha256(UTIL_HASH.utf8(pass + data)).slice(0, 8);
            const raw = `Salted__${salt}${tag}${body}`;
            result = b64 ? btoa(raw).replace(/(.{64})/g, '$1\n').replace(/\n$/, '') + '\n' : raw;
        } else {
            let raw = data;
            if (b64) { try { raw = atob(data.replace(/\s/g, '')); } catch (e) { return this._err('bad decrypt', 1); } }
            const m = /^Salted__([0-9a-f]{16})([0-9a-f]{8})([0-9a-f]*)$/.exec(raw);
            if (!m) return this._err('bad magic number', 1);
            const key = UTIL_HASH.sha256(UTIL_HASH.utf8(pass + m[1]));
            const ks = (i) => parseInt(key.substr((i * 2) % 64, 2), 16);
            const bytes = m[3].match(/../g) || [];
            const plain = bytes.map((h, i) => parseInt(h, 16) ^ ks(i));
            let s = ''; for (const b of plain) s += String.fromCharCode(b);
            let text; try { text = decodeURIComponent(escape(s)); } catch (e) { text = s; }
            if (UTIL_HASH.sha256(UTIL_HASH.utf8(pass + text)).slice(0, 8) !== m[2]) return this._err('bad decrypt\n' + this._hex(12) + ':error:1C800064:Provider routines:ossl_cipher_unpadblock:bad decrypt:../providers/implementations/ciphers/ciphercommon_block.c:124:', 1);
            result = text;
        }
        if (outF) { this._write(outF, result); return this._ok(''); }
        return { stdout: result, rawStdout: result, stderr: '', exitCode: 0 };
    }
}

if (typeof window !== 'undefined') {
    window.AppEngine2 = AppEngine2;
}
