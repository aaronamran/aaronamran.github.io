// Container userland: a root filesystem, users, packages and processes per container, and real shells inside it
// Part of Red Cat RHCSA Terminal Simulator
//
// `podman run -it ubi9 bash`, `podman exec -it web bash` and `podman start -ai` swap the whole terminal over to
// the container: its own filesystem (with the -v volumes bind-mounted from the host), /etc/os-release, users,
// installed packages (dnf works inside a UBI container), process table and job table. `exit` swaps back.
// `podman run IMAGE command` and `podman exec CTR command` run through the same interpreter.

class ContainerEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.ctr = this;
        sharedState.ctrSession = { active: false };
        this.active = null;
        this.provMap = null;
        // permission wrapper: SELinux-denied and read-only bind mounts refuse access even to the container's root
        const fs = this.fs;
        const orig = fs.hasPermission.bind(fs);
        fs.hasPermission = (node, perm) => {
            if (node && node.ctrDenied) return false;
            if (node && node.ctrRO && perm === 'w') return false;
            return orig(node, perm);
        };
        const nm = sharedState.net;
        if (nm && nm.zone) nm.zone['cdn-ubi.redhat.com'] = Object.assign(nm.zone['cdn-ubi.redhat.com'] || {}, { A: ['23.45.12.80'] });
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 125) { return { stdout: '', stderr, exitCode }; }
    get parent() { return this.shared.parent; }
    get podman() { return this.shared.podman; }
    _sh() { return typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _clone(o) { try { return structuredClone(o); } catch (e) { return JSON.parse(JSON.stringify(o)); } }

    _isRhel(c) { const os = (c.entry && c.entry.os) || {}; return os.id === 'rhel' || os.id === 'centos'; }
    _isMinimal(c) { return /ubi-minimal|ubi9-minimal/.test(c.image || ''); }
    _osOf(c) { return (c.entry && c.entry.os) || { name: 'Red Hat Enterprise Linux', id: 'rhel', ver: '9.3 (Plow)', vid: '9.3', pretty: 'Red Hat Enterprise Linux 9.3 (Plow)' }; }
    _quote(a) { return /^[\w@%+=:,./-]+$/.test(a) ? a : `'${String(a).replace(/'/g, "'\\''")}'`; }
    _shellLike(argv) { return !!argv.length && /^(ba|da|z|k|a)?sh$/.test(argv[0].split('/').pop()) && !argv.includes('-c') && argv.slice(1).every(a => a.startsWith('-')); }

    // ===== building the root filesystem =====
    _put(v, path, content, mode, owner) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = v.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        cur.children[name] = { type: 'file', permissions: mode || '0644', owner: owner || 'root', group: owner || 'root', size: content.length, modified: new Date(), content };
    }

    _mkdir(v, path, mode, owner) {
        let cur = v.fs['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: mode || '0755', owner: owner || 'root', group: owner || 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        return cur;
    }

    _wipe(v, path) { const n = this._walk(v.fs, path); if (n && n.children) n.children = {}; }

    _walk(tree, path) {
        let cur = tree['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur || !cur.children || !cur.children[p]) return null;
            cur = cur.children[p];
        }
        return cur;
    }

    _build(c) {
        if (typeof VirtualFilesystem === 'undefined') return null;
        const v = new VirtualFilesystem();
        const os = this._osOf(c);
        const rhel = this._isRhel(c);
        const entry = c.entry || {};
        // identity databases
        const appUser = entry.user && /^\d+$/.test(String(entry.user)) ? { name: 'default', uid: parseInt(entry.user, 10) } : null;
        const home = appUser ? '/opt/app-root/src' : '/root';
        v.users = {
            root: { uid: 0, gid: 0, home: '/root', shell: '/bin/bash', password: 'x' },
            bin: { uid: 1, gid: 1, home: '/bin', shell: '/sbin/nologin', password: 'x' },
            daemon: { uid: 2, gid: 2, home: '/sbin', shell: '/sbin/nologin', password: 'x' },
            nobody: { uid: 65534, gid: 65534, home: '/', shell: '/sbin/nologin', password: 'x' }
        };
        v.groups = { root: { gid: 0, members: ['root'] }, bin: { gid: 1, members: [] }, daemon: { gid: 2, members: [] }, nobody: { gid: 65534, members: [] } };
        if (appUser) { v.users[appUser.name] = { uid: appUser.uid, gid: 0, home, shell: '/bin/bash', password: 'x' }; }
        const passwd = Object.entries(v.users).map(([n, u]) => `${n}:x:${u.uid}:${u.gid}:${n === 'root' ? 'root' : n === 'nobody' ? 'Kernel Overflow User' : n === 'default' ? '' : n}:${u.home}:${u.shell}`).join('\n') + '\n';
        const group = Object.entries(v.groups).map(([n, g]) => `${n}:x:${g.gid}:${g.members.join(',')}`).join('\n') + '\n';
        // clear what only makes sense on the host
        for (const d of ['/home', '/boot', '/var/log', '/var/spool/mail', '/mnt', '/media', '/srv', '/opt', '/usr/bin', '/usr/sbin', '/bin', '/sbin', '/usr/local/bin', '/usr/local/sbin', '/etc/ssh', '/etc/yum.repos.d', '/etc/sudoers.d', '/etc/NetworkManager', '/etc/firewalld', '/etc/chrony']) this._wipe(v, d);
        for (const p of ['/etc/sudoers', '/etc/fstab', '/etc/crontab', '/etc/chrony.conf', '/etc/exports']) { const pr = this._walk(v.fs, '/etc'); if (pr && pr.children) delete pr.children[p.split('/').pop()]; }
        this._wipe(v, '/root');
        this._mkdir(v, '/root', '0550');
        this._put(v, '/root/.bashrc', '# .bashrc\n\n# User specific aliases and functions\n\nalias rm=\'rm -i\'\nalias cp=\'cp -i\'\nalias mv=\'mv -i\'\n\n# Source global definitions\nif [ -f /etc/bashrc ]; then\n\t. /etc/bashrc\nfi\n');
        this._put(v, '/root/.bash_profile', '# .bash_profile\n\n# Get the aliases and functions\nif [ -f ~/.bashrc ]; then\n\t. ~/.bashrc\nfi\n\n# User specific environment and startup programs\n');
        this._put(v, '/root/.bash_logout', '# ~/.bash_logout\n');
        if (appUser) { this._mkdir(v, home, '0775', appUser.name); }
        this._put(v, '/etc/passwd', passwd);
        this._put(v, '/etc/group', group);
        this._put(v, '/etc/shadow', 'root:*:19700:0:99999:7:::\nbin:*:19700:0:99999:7:::\ndaemon:*:19700:0:99999:7:::\nnobody:*:19700:0:99999:7:::\n', '0000');
        this._put(v, '/etc/hostname', c.hostname + '\n');
        this._put(v, '/etc/hosts', `127.0.0.1\tlocalhost localhost.localdomain localhost4 localhost4.localdomain4\n::1\tlocalhost localhost.localdomain localhost6 localhost6.localdomain6\n${c.ip || '10.88.0.2'}\t${c.hostname} ${c.name}\n`);
        const rc = this.fs.getNode('/etc/resolv.conf');
        this._put(v, '/etc/resolv.conf', rc && rc.content ? rc.content : 'nameserver 8.8.8.8\n');
        this._put(v, '/etc/os-release', `NAME="${os.name}"\nVERSION="${os.ver}"\nID="${os.id}"\nVERSION_ID="${os.vid}"\nPRETTY_NAME="${os.pretty}"\nANSI_COLOR="0;31"\n${rhel ? 'HOME_URL="https://www.redhat.com/"\nBUG_REPORT_URL="https://bugzilla.redhat.com/"\n' : ''}`);
        this._put(v, '/run/.containerenv', `engine="podman-4.6.1"\nname="${c.name}"\nid="${c.id}"\nimage="${c.image}"\nimageid="${c.imageId || ''}"\nrootless=${c.owner && c.owner !== 'root' ? 1 : 0}\n`);
        const rel = this._node(v, '/etc/redhat-release');
        if (rhel) {
            const rn = `${os.name} release ${os.vid} (${os.ver.replace(/^[\d.]+ \(|\)$/g, '')})\n`;
            this._put(v, '/etc/redhat-release', rn);
            this._put(v, '/etc/system-release', rn);
            if (os.id === 'rhel') {
                const rp = (id, nm, path, en) => `[${id}]\nname = ${nm}\nbaseurl = https://cdn-ubi.redhat.com/content/public/ubi/dist/ubi9/9/$basearch/${path}/os\nenabled = ${en}\ngpgkey = file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\ngpgcheck = 1\n`;
                this._put(v, '/etc/yum.repos.d/ubi.repo', [rp('ubi-9-baseos-rpms', 'Red Hat Universal Base Image 9 (RPMs) - BaseOS', 'baseos', 1), rp('ubi-9-appstream-rpms', 'Red Hat Universal Base Image 9 (RPMs) - AppStream', 'appstream', 1), rp('ubi-9-codeready-builder-rpms', 'Red Hat Universal Base Image 9 (RPMs) - CodeReady Builder', 'codeready-builder', 0)].join('\n'));
            } else {
                this._put(v, '/etc/yum.repos.d/centos.repo', '[baseos]\nname=CentOS Stream 9 - BaseOS\nbaseurl=https://cdn-ubi.redhat.com/centos/9-stream/BaseOS/$basearch/os\nenabled=1\ngpgcheck=0\n\n[appstream]\nname=CentOS Stream 9 - AppStream\nbaseurl=https://cdn-ubi.redhat.com/centos/9-stream/AppStream/$basearch/os\nenabled=1\ngpgcheck=0\n');
            }
            this._put(v, '/etc/dnf/dnf.conf', '[main]\ngpgcheck=1\ninstallonly_limit=3\nclean_requirements_on_remove=True\nbest=True\nskip_if_unavailable=False\n');
            this._put(v, '/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release', '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBEuWpjMBEAC...\n-----END PGP PUBLIC KEY BLOCK-----\n');
        } else {
            const del = (p) => { const pr = this._walk(v.fs, p.replace(/\/[^/]*$/, '') || '/'); if (pr && pr.children) delete pr.children[p.split('/').pop()]; };
            del('/etc/yum.repos.d'); del('/etc/redhat-release'); del('/etc/system-release'); del('/etc/dnf');
        }
        if (entry.docroot) {
            const html = entry.kind === 'nginx' ? '<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and\nworking. Further configuration is required.</p>\n</body>\n</html>\n' : '<html><body><h1>It works!</h1></body></html>\n';
            this._put(v, entry.docroot.replace(/\/$/, '') + '/index.html', html);
        }
        const rf = { fs: v.fs, users: v.users, groups: v.groups, home, appUser, pkg: null, jobs: null };
        // packages of a UBI/CentOS image: files, rpm database
        if (rhel) {
            const base = this._isMinimal(c)
                ? ['bash', 'coreutils', 'glibc', 'filesystem', 'setup', 'basesystem', 'rpm', 'shadow-utils', 'util-linux', 'tar', 'gzip', 'grep', 'sed', 'gawk', 'findutils', 'less', 'curl', 'libcurl', 'openssl', 'openssl-libs', 'ncurses']
                : ['bash', 'coreutils', 'glibc', 'filesystem', 'setup', 'basesystem', 'dnf', 'rpm', 'python3', 'shadow-utils', 'util-linux', 'procps-ng', 'tar', 'gzip', 'grep', 'sed', 'gawk', 'findutils', 'less', 'vim-minimal', 'curl', 'libcurl', 'openssl', 'openssl-libs', 'ncurses', 'bzip2', 'xz'];
            const pk = this.shared.pkg;
            const t0 = new Date(Date.now() - 20 * 86400000);
            const installed = {};
            if (pk) for (const n of base) if (pk.cat[n]) installed[n] = { date: t0, reason: 'user', repo: os.id === 'rhel' ? 'ubi-9-baseos-rpms' : 'baseos', ver: pk.cat[n].ver, rel: pk.cat[n].rel };
            rf.pkg = { installed, history: [{ id: 1, cmd: '', date: t0, user: 'System <unset>', actions: 'Install', altered: Object.keys(installed).length, items: [] }], moduleState: {}, groupsInstalled: new Set(), metaFresh: false };
            this._withTree(rf, () => { for (const n of Object.keys(installed)) { try { pk._materialize(n); } catch (e) { /* keep going */ } } });
        }
        return rf;
    }

    _node(v, path) { return this._walk(v.fs, path); }

    // run fn with the container tree/users visible to the package engine (used while building)
    _withTree(rf, fn) {
        const fs = this.fs;
        const saved = { fs: fs.fs, users: fs.users, groups: fs.groups, pkg: this._pkgSwap(rf.pkg) };
        fs.fs = rf.fs; fs.users = rf.users; fs.groups = rf.groups;
        try { return fn(); } finally { rf.fs = fs.fs; rf.users = fs.users; rf.groups = fs.groups; rf.pkg = this._pkgSwap(saved.pkg); fs.fs = saved.fs; fs.users = saved.users; fs.groups = saved.groups; }
    }

    _pkgSwap(state) {
        const p = this.shared.pkg;
        if (!p) return null;
        const old = { installed: p.installed, history: p.history, moduleState: p.moduleState, groupsInstalled: p.groupsInstalled, metaFresh: p._metaFresh };
        if (state) { p.installed = state.installed; p.history = state.history; p.moduleState = state.moduleState; p.groupsInstalled = state.groupsInstalled; p._metaFresh = state.metaFresh; }
        if (p._syncLegacy) { try { p._syncLegacy(); } catch (e) { /* legacy lists are optional */ } }
        return old;
    }

    // ===== installing / leaving the container context =====
    _procsFor(c, user, shellPid, shellIsInit, noShell) {
        const entry = c.entry || {};
        const hhmm = this.shared.svc && this.shared.svc._hhmm ? this.shared.svc._hhmm(c.started ? new Date(c.started) : this._now()) : '00:00';
        const mk = (o) => Object.assign({ cpu: 0.0, mem: 0.1, user: 'root', tty: '?', stat: 'Ss', ni: 0, ppid: 0, time: '00:00:00', start: hhmm, service: null, domain: 'container_t' }, o, { comm: (o.comm || String(o.command).split(' ')[0].replace(/:$/, '').split('/').pop()).slice(0, 15) });
        const P = [];
        if (shellIsInit) {
            P.push(mk({ pid: 1, command: '/bin/bash', comm: 'bash', user, tty: 'pts/0', stat: 'Ss' }));
            return P;
        }
        const argv = c.argv || [];
        if (entry.kind === 'nginx' && !this.podman._cmdOverride(c)) {
            P.push(mk({ pid: 1, command: 'nginx: master process nginx -g daemon off;', comm: 'nginx' }));
            P.push(mk({ pid: 8, ppid: 1, user: 'nginx', command: 'nginx: worker process', comm: 'nginx', stat: 'S' }));
            P.push(mk({ pid: 9, ppid: 1, user: 'nginx', command: 'nginx: worker process', comm: 'nginx', stat: 'S' }));
        } else if (entry.kind === 'httpd' && !this.podman._cmdOverride(c)) {
            P.push(mk({ pid: 1, command: 'httpd -DFOREGROUND', comm: 'httpd' }));
            for (let i = 0; i < 4; i++) P.push(mk({ pid: 9 + i, ppid: 1, user: 'apache', command: 'httpd -DFOREGROUND', comm: 'httpd', stat: 'S' }));
        } else if (entry.kind === 'db' && !this.podman._cmdOverride(c)) {
            P.push(mk({ pid: 1, command: argv.join(' ') || 'mariadbd', user: 'mysql', stat: 'Ssl' }));
        } else {
            P.push(mk({ pid: 1, command: argv.join(' ') || 'sleep infinity' }));
        }
        if (!noShell) P.push(mk({ pid: shellPid, ppid: 0, command: '/bin/bash', comm: 'bash', user, tty: 'pts/0', stat: 'Ss' }));
        return P;
    }

    _install(c, o) {
        const fs = this.fs, sh = this.shared;
        const rf = c.rootfs || (c.rootfs = this._build(c));
        if (!rf) return null;
        const hostFs = fs.fs;
        const allowed = (c.vols || []).map(v => (v.host && this.podman._volAllowed ? this.podman._volAllowed(c, v) : true));
        const je = sh.jobEngine;
        const saved = {
            fs: fs.fs, users: fs.users, groups: fs.groups, cwd: fs.currentPath, user: fs.currentUser, uid: fs.currentUid, gid: fs.currentGid,
            env: Object.assign({}, sh.env), hostname: this.parent.hostname, procs: sh.processes.slice(),
            jobs: je ? je._jobSwap(null) : null, pkg: this._pkgSwap(rf.pkg), sess: sh.ctrSession
        };
        fs.fs = rf.fs; fs.users = rf.users; fs.groups = rf.groups;
        // identity
        let uname = 'root';
        const want = (o && o.user) || c.user || '';
        if (want) {
            const first = String(want).split(':')[0];
            if (/^\d+$/.test(first)) { const f = Object.entries(rf.users).find(([n, u]) => u.uid === parseInt(first, 10)); uname = f ? f[0] : 'root'; if (!f && first !== '0') { rf.users['u' + first] = { uid: parseInt(first, 10), gid: 0, home: '/', shell: '/bin/bash', password: 'x' }; uname = 'u' + first; } }
            else if (rf.users[first]) uname = first;
        }
        if (!want && rf.appUser) uname = rf.appUser.name;
        const u = rf.users[uname];
        fs.currentUser = uname; fs.currentUid = u.uid; fs.currentGid = u.gid;
        fs.currentPath = (o && o.workdir) || c.workdir || '/';
        if (!this._walk(fs.fs, fs.currentPath)) fs.currentPath = '/';
        // environment
        for (const k of Object.keys(sh.env)) delete sh.env[k];
        Object.assign(sh.env, { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', TERM: 'xterm', HOSTNAME: c.hostname, container: 'oci', HOME: u.home, PWD: fs.currentPath, SHLVL: '1' }, c.env || {});
        this.parent.hostname = c.hostname;
        // volumes
        this._attachVols(c, hostFs, allowed);
        // processes
        const shellIsInit = !!(o && o.initShell);
        const shellPid = shellIsInit ? 1 : 7 + Math.floor(Math.random() * 3);
        const P = this._procsFor(c, uname, shellPid, shellIsInit, !!(o && o.noShell));
        sh.processes.splice(0, sh.processes.length, ...P);
        sh.ctrSession = { active: true, cid: c.id, shellPid, depth: sh.session ? sh.session.stack.length : 0 };
        saved.hostFs = hostFs;
        return saved;
    }

    _attachVols(c, hostTree, allowed) {
        const fs = this.fs;
        (c.vols || []).forEach((v, i) => {
            const dst = (v.dst || '').replace(/\/+$/, '');
            if (!dst) return;
            const parentPath = dst.replace(/\/[^/]*$/, '') || '/';
            const pdir = this._walk(fs.fs, parentPath) || this._mkdirIn(fs.fs, parentPath);
            if (!pdir || !pdir.children) return;
            let src = null;
            if (v.host) src = this._walk(hostTree, v.src);
            else if (v.volume) src = this._walk(hostTree, `/var/lib/containers/storage/volumes/${v.src}/_data`);
            if (!src) return;
            const name = dst.split('/').pop();
            if (v.host && (!allowed[i] || (v.opts || []).includes('ro'))) {
                const cl = this._clone(src);
                const mark = (n, key) => { n[key] = true; if (n.children) for (const k of Object.keys(n.children)) mark(n.children[k], key); };
                mark(cl, !allowed[i] ? 'ctrDenied' : 'ctrRO');
                pdir.children[name] = cl;
            } else {
                pdir.children[name] = src;
            }
        });
    }

    _mkdirIn(tree, path) {
        let cur = tree['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        return cur;
    }

    _restore(saved) {
        const fs = this.fs, sh = this.shared;
        const c = this._curC;
        const rf = c && c.rootfs;
        if (rf) { rf.fs = fs.fs; rf.users = fs.users; rf.groups = fs.groups; }
        const je = sh.jobEngine;
        if (je) je._jobSwap(saved.jobs);
        const pk = this._pkgSwap(saved.pkg);
        if (rf) rf.pkg = pk;
        fs.fs = saved.fs; fs.users = saved.users; fs.groups = saved.groups;
        fs.currentPath = saved.cwd; fs.currentUser = saved.user; fs.currentUid = saved.uid; fs.currentGid = saved.gid;
        for (const k of Object.keys(sh.env)) delete sh.env[k];
        Object.assign(sh.env, saved.env);
        this.parent.hostname = saved.hostname;
        sh.processes.splice(0, sh.processes.length, ...saved.procs);
        sh.ctrSession = saved.sess && saved.sess.active ? saved.sess : { active: false };
    }

    // run fn inside the container and come back
    _within(c, o, fn) {
        const saved = this._install(c, o);
        if (!saved) return { out: '', err: '', code: 127, notFound: true };
        const prevC = this._curC;
        this._curC = c;
        try { return fn(); } finally { this._restore(saved); this._curC = prevC; }
    }

    // ===== non-interactive commands: run / exec =====
    _run(c, argv, o) {
        const sh = this._sh();
        if (!sh || !argv.length) return { out: '', err: '', code: 0 };
        const base = argv[0].split('/').pop();
        if (/^(ba|da|a)?sh$/.test(base) && argv.length === 1) return { out: '', err: '', code: 0 };
        const isC = /^(ba|da|a)?sh$/.test(base) && argv[1] === '-c' && argv[2] !== undefined;
        const line = isC ? argv[2] : argv.map(a => this._quote(a)).join(' ');
        return this._within(c, Object.assign({}, o, { noShell: true }), () => {
            const out = [], err = [];
            const io = { stdin: { text: (o && o.stdinText) || '', pos: 0 }, out: (s) => { if (s) out.push(s); }, err: (s) => { if (s) err.push(s); }, piped: true, hasStdin: false };
            const p = this.parent;
            const keep = { io: p._curIo, pipe: p._stdoutIsPipe, stdin: p._hasStdin, last: p.lastExitCode };
            const wasI = sh.interactive;
            sh.interactive = false;
            let rc = 0;
            try { rc = sh.runScriptText(line, 'bash', [], io); } finally { sh.interactive = wasI; p._curIo = keep.io; p._stdoutIsPipe = keep.pipe; p._hasStdin = keep.stdin; p.lastExitCode = keep.last; }
            const e = err.join('');
            if (!isC && rc === 127 && /command not found/.test(e)) return { notFound: true, out: '', err: '', code: 127 };
            return { out: out.join(''), err: e, code: rc };
        });
    }

    // ===== interactive sessions =====
    _enter(c, how, o) {
        if (this.active) return this._err('Error: already inside a container session', 125);
        const saved = this._install(c, Object.assign({}, o, { initShell: how !== 'exec' }));
        if (!saved) return this._err('Error: container filesystem is not available', 125);
        this._curC = c;
        this.active = { c, saved, how, rm: !!(o && o.rm) };
        this.active.depth = this.shared.ctrSession.depth;
        return this._ok('');
    }

    _leave(code) {
        const a = this.active;
        if (!a) return false;
        this.active = null;
        this._restore(a.saved);
        this._curC = null;
        const c = a.c;
        const pm = this.podman;
        const st = pm._store ? pm._store(c.owner) : null;
        if (a.how !== 'exec') {
            if (pm._killProcs) pm._killProcs(c);
            c.state = 'exited'; c.exitCode = code; c.finished = this._now();
            if (a.rm && st) pm._removeContainer(st, c);
        }
        this.parent.lastExitCode = code;
        return true;
    }

    installHooks(parent) {
        const self = this;
        const origExit = parent.sessionExit;
        parent.sessionExit = function (code) {
            const cs = self.shared.ctrSession;
            if (self.active && (!self.shared.session || self.shared.session.stack.length <= cs.depth)) {
                const rc = code !== undefined ? code : (parent.lastExitCode || 0);
                self._leave(rc);
                return 'quiet';
            }
            return origExit ? origExit.call(parent, code) : false;
        };
        parent._ctrActive = () => !!self.active;
        // read-only (:ro) and SELinux-denied bind mounts refuse changes made by file commands
        const guard = (name, verb, lastOnly) => {
            const orig = parent[name];
            if (typeof orig !== 'function') return;
            parent[name] = function (args, stdin) {
                if (self._curC) {
                    const list = (args || []).filter(a => typeof a === 'string' && !a.startsWith('-'));
                    const check = lastOnly ? list.slice(-1) : list;
                    for (const a of check) {
                        const abs = self.fs.resolvePath(a);
                        const n = self.fs.getNode(abs);
                        const par = self.fs.getNode(abs.replace(/\/[^/]*$/, '') || '/');
                        const hit = (k) => (n && n[k]) || (par && par[k]);
                        if (hit('ctrRO')) return { stdout: '', stderr: `${name}: ${verb} '${a}': Read-only file system`, exitCode: 1 };
                        if (hit('ctrDenied')) return { stdout: '', stderr: `${name}: ${verb} '${a}': Permission denied`, exitCode: 1 };
                    }
                }
                return orig.call(parent, args, stdin);
            };
        };
        guard('touch', 'cannot touch'); guard('mkdir', 'cannot create directory'); guard('rm', 'cannot remove'); guard('rmdir', 'failed to remove');
        guard('cp', 'cannot create regular file', true); guard('mv', 'cannot move', true); guard('ln', 'failed to create link', true); guard('install', 'cannot create regular file', true); guard('chmod', 'changing permissions of'); guard('chown', 'changing ownership of');
        const origId = parent.id;
        if (typeof origId === 'function') parent.id = function (args, stdin) { const r = origId.call(parent, args, stdin); if (self._curC && r && typeof r.stdout === 'string') r.stdout = r.stdout.replace(/ context=\S+/, ''); return r; };
        const origIp = parent.ip;
        if (typeof origIp === 'function') parent.ip = function (args, stdin) { if (self._curC) { const r = self._ip(args); if (r) return r; } return origIp.call(parent, args, stdin); };
        const origHostI = parent.hostnameCmd;
        if (typeof origHostI === 'function') parent.hostnameCmd = function (args, stdin) { if (self._curC && args.includes('-I')) return { stdout: self._curC.ip || '10.88.0.2', stderr: '', exitCode: 0 }; return origHostI.call(parent, args, stdin); };
        const prev = parent._cmdGate;
        parent._cmdGate = (name) => {
            const g = self._curC ? self._gate(name) : self._outside(name);
            if (g === false || typeof g === 'function') return g;
            return prev ? prev.call(parent, name) : true;
        };
    }

    // `ip` as a container sees it: lo and one veth
    _ip(args) {
        const c = this._curC;
        const a = args.filter(x => !x.startsWith('-'));
        const sub = a[0] || 'addr';
        const rootless = c.owner && c.owner !== 'root';
        const addr = c.ip || '10.88.0.2';
        const mask = rootless ? 24 : 16;
        const gw = rootless ? '10.0.2.2' : '10.88.0.1';
        const mac = '3e:' + (c.id.slice(0, 10).match(/../g) || ['aa', 'bb', 'cc', 'dd', 'ee']).join(':');
        const ifn = rootless ? 'tap0' : 'eth0@if5';
        if (/^(a|addr|address)$/.test(sub) && (a.length === 1 || a[1] === 'show' || a[1] === 'list' || a[1] === undefined)) {
            return this._ok(`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host \n       valid_lft forever preferred_lft forever\n2: ${ifn}: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000\n    link/ether ${mac} brd ff:ff:ff:ff:ff:ff link-netnsid 0\n    inet ${addr}/${mask} brd ${addr.replace(/\d+$/, '255')} scope global ${rootless ? 'tap0' : 'eth0'}\n       valid_lft forever preferred_lft forever`);
        }
        if (/^(r|route)$/.test(sub) && (a.length === 1 || a[1] === 'show' || a[1] === 'list')) {
            return this._ok(`default via ${gw} dev ${rootless ? 'tap0' : 'eth0'} \n${addr.replace(/\d+$/, '0')}/${mask} dev ${rootless ? 'tap0' : 'eth0'} proto kernel scope link src ${addr}`);
        }
        return null;
    }

    // commands that exist only inside containers
    _outside(name) { return ['apk', 'apt', 'apt-get', 'dpkg', 'microdnf'].includes(name) ? false : true; }

    _provides(name) {
        if (!this.provMap) {
            const m = {};
            const pk = this.shared.pkg;
            if (pk) for (const [n, e] of Object.entries(pk.cat)) for (const f of e.files) { const mm = /^\/(?:usr\/)?s?bin\/([^/]+)$/.exec(f); if (mm) (m[mm[1]] = m[mm[1]] || []).push(n); }
            this.provMap = m;
        }
        return this.provMap[name] || null;
    }

    _gate(name) {
        const c = this._curC;
        const rhel = this._isRhel(c);
        const HOST_ONLY = ['lsblk', 'fdisk', 'blkid', 'mkswap', 'swapon', 'swapoff', 'losetup', 'reboot', 'shutdown', 'poweroff', 'halt', 'podman', 'buildah', 'skopeo', 'nmcli', 'firewall-cmd', 'setenforce', 'getenforce', 'sestatus', 'semanage', 'journalctl', 'systemctl', 'hostnamectl', 'timedatectl', 'loginctl', 'exportfs', 'showmount', 'mount.nfs', 'tuned-adm', 'sudo', 'pvs', 'vgs', 'lvs', 'crontab', 'at', 'atq', 'nfsstat', 'kexec', 'grubby', 'sosreport', 'auditctl', 'ausearch', 'chronyc', 'sealert', 'audit2allow'];
        if (HOST_ONLY.includes(name)) return false;
        if (name === 'microdnf') return this._isMinimal(c) ? true : false;
        if (name === 'apk') return (c.entry && c.entry.os && c.entry.os.id === 'alpine') ? true : false;
        if (name === 'apt' || name === 'apt-get' || name === 'dpkg') return (c.entry && c.entry.os && /debian|ubuntu/.test(c.entry.os.id)) ? true : false;
        if (!rhel) {
            if (['dnf', 'yum', 'rpm', 'rpm2cpio', 'subscription-manager', 'yumdownloader', 'dnf-config-manager', 'yum-config-manager'].includes(name)) return false;
            const prov = this._provides(name);
            const generic = new Set(['bash', 'coreutils', 'util-linux', 'procps-ng', 'tar', 'gzip', 'bzip2', 'xz', 'zip', 'unzip', 'grep', 'sed', 'gawk', 'findutils', 'less', 'vim-minimal', 'nano', 'curl', 'wget', 'openssl', 'iproute', 'iputils', 'net-tools', 'shadow-utils', 'ncurses', 'tree', 'rsync', 'git', 'bind-utils', 'nmap-ncat', 'telnet', 'lsof', 'strace', 'psmisc', 'python3']);
            if (prov && !prov.some(p => generic.has(p))) return false;
            return true;
        }
        const prov = this._provides(name);
        const pk = this.shared.pkg;
        if (prov && pk && !prov.some(p => pk.installed[p])) return false;
        return true;
    }

    // ===== package managers of other distributions (output only) =====
    microdnf(args) { return this.parent.dnf ? this.parent.dnf(args.map(a => a)) : this._err('microdnf: not available', 1); }

    apk(args) {
        const sub = args[0];
        if (sub === 'add') return this._ok(`fetch https://dl-cdn.alpinelinux.org/alpine/v3.19/main/x86_64/APKINDEX.tar.gz\nfetch https://dl-cdn.alpinelinux.org/alpine/v3.19/community/x86_64/APKINDEX.tar.gz\n(1/1) Installing ${args.filter(a => !a.startsWith('-') && a !== 'add').join(' ')}\nExecuting busybox-1.36.1-r15.trigger\nOK: 9 MiB in 17 packages`);
        if (sub === 'update') return this._ok('fetch https://dl-cdn.alpinelinux.org/alpine/v3.19/main/x86_64/APKINDEX.tar.gz\nv3.19.0-100-g1d6a8a0f4d1 [https://dl-cdn.alpinelinux.org/alpine/v3.19/main]\nOK: 5370 distinct packages available');
        return this._ok('apk-tools 2.14.0, compiled for x86_64.');
    }

    apt(args) {
        const sub = args[0];
        if (sub === 'update') return this._ok('Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]\nFetched 8906 kB in 2s (4502 kB/s)\nReading package lists... Done');
        if (sub === 'install') return this._ok(`Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${args.filter(a => !a.startsWith('-') && a !== 'install').join(' ')}\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`);
        return this._ok('apt 2.6.1 (amd64)');
    }
    'apt-get'(args) { return this.apt(args); }
    dpkg(args) { return this._ok(args.includes('--version') ? 'Debian dpkg package management program version 1.21.22 (amd64).' : ''); }

    // ===== podman cp =====
    _cpCopy(rest) {
        const [a, b] = rest.filter(x => !x.startsWith('-'));
        if (!a || !b) return this._err('Error: must specify a source and a destination path', 125);
        const split = (s) => { const m = /^([^/:][^:]*):(.*)$/.exec(s); return m ? { ctr: m[1], path: m[2] || '/' } : { ctr: null, path: s }; };
        const src = split(a), dst = split(b);
        if (!!src.ctr === !!dst.ctr) return this._err('Error: copying between containers is not supported', 125);
        const pm = this.podman;
        const st = pm._store();
        const cname = src.ctr || dst.ctr;
        const c = pm._findContainer(st, cname);
        if (!c) return this._err(`Error: no container with name or ID "${cname}" found: no such container`, 125);
        const rf = c.rootfs || (c.rootfs = this._build(c));
        if (!rf) return this._err('Error: container filesystem is not available', 125);
        const base = (p) => p.replace(/\/+$/, '').split('/').pop();
        if (dst.ctr) {
            const node = this.fs.getNode(src.path);
            if (!node) return this._err(`Error: ${src.path}: no such file or directory`, 125);
            let target = dst.path;
            const dn = this._walk(rf.fs, target);
            if (dn && dn.children) target = target.replace(/\/+$/, '') + '/' + base(src.path);
            const pdir = this._mkdirIn(rf.fs, target.replace(/\/[^/]*$/, '') || '/');
            pdir.children[base(target)] = this._clone(node);
            return this._ok('');
        }
        const node = this._walk(rf.fs, src.path);
        if (!node) return this._err(`Error: "${src.path}" could not be found on container ${c.name}: No such file or directory`, 125);
        let target = this.fs.resolvePath(dst.path);
        const dn = this.fs.getNode(target);
        if (dn && dn.children) target = target.replace(/\/+$/, '') + '/' + base(src.path);
        const pdir = this.fs.getNode(target.replace(/\/[^/]*$/, '') || '/');
        if (!pdir || !pdir.children) return this._err(`Error: ${dst.path}: no such file or directory`, 125);
        const cl = this._clone(node);
        cl.owner = this.fs.currentUser; cl.group = this.fs.currentUser;
        pdir.children[base(target)] = cl;
        return this._ok('');
    }
}

if (typeof window !== 'undefined') {
    window.ContainerEngine = ContainerEngine;
}
