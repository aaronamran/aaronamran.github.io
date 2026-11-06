// NFS exports + autofs, and kernel tuning (sysctl, tuned-adm, nice/renice)
// Part of Red Cat RHCSA Terminal Simulator
//
// NfsEngine: /etc/exports drives exportfs/showmount/mount.nfs checks; autofs maps mount shares the first time a
// path below the automount directory is touched.
// TuneEngine: sysctl keys live in /proc/sys files, so `echo 1 > /proc/sys/...` and sysctl always agree; tuned
// profiles change those keys; nice/renice change the niceness shown by ps and top.

class NfsEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.nfs = this;
        this.applied = [];            // { path, client, opts }
        this.appliedFrom = null;
        this.auto = { loaded: false, tops: [], direct: [] };
        // remote lab servers
        this.remote = {
            '192.168.1.254': { names: ['classroom.example.com', 'content.example.com', 'repo.example.com'], exports: [['/exports/rhel9', '*'], ['/exports/home', '*.example.com'], ['/exports/data', '192.168.1.0/24']] },
            '192.168.1.120': { names: ['nfs.example.com'], exports: [['/srv/nfs/share', '*'], ['/srv/nfs/home', '192.168.1.0/24']] },
            '192.168.1.101': { names: ['server1.example.com'], exports: [['/srv/share', '192.168.1.0/24']] }
        };
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    get parent() { return this.shared.parent; }
    _node(p) { return this.fs.getNode(p); }
    _text(p) { const n = this._node(p); return n && n.type === 'file' ? n.content || '' : null; }
    _svcActive(name) { const s = this.shared.services[name]; return !!(s && s.active); }
    _host() { return this.parent.hostname; }
    _net() { return this.shared.net; }

    _myAddrs() { const nm = this._net(); return nm ? nm._myAddrs().concat(['127.0.0.1']) : ['127.0.0.1']; }
    _isLocal(host) {
        if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
        if (host === this._host() || host === this._host().split('.')[0]) return true;
        return this._myAddrs().includes(host);
    }
    _resolve(host) {
        if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
        const nm = this._net();
        if (!nm) return null;
        const r = nm._getaddr(host);
        return r.err ? null : r.ip;
    }

    _write(path, content) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        cur.children[name] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    // ===== /etc/exports =====
    _parseExports() {
        const files = [['/etc/exports', this._text('/etc/exports')]];
        const d = this._node('/etc/exports.d');
        if (d && d.children) for (const f of Object.keys(d.children).sort()) if (f.endsWith('.exports')) files.push([`/etc/exports.d/${f}`, d.children[f].content || '']);
        const rows = [], msgs = [];
        for (const [file, text] of files) {
            if (text === null) continue;
            let ln = 0;
            for (const raw of text.split('\n')) {
                ln++;
                const l = raw.replace(/#.*$/, '').trim();
                if (!l) continue;
                const m = /^(\S+)\s*(.*)$/.exec(l);
                const path = m[1].replace(/^"|"$/g, '');
                const rest = m[2].trim();
                if (!rest) { rows.push({ path, client: '*', opts: [], bare: true, file, ln }); msgs.push(`exportfs: No options for ${path} *: suggest *(sync) to avoid warning`); continue; }
                // clients: name(opts) name2(opts) ; a space before ( applies the options to everyone
                const tokens = rest.match(/[^\s(]+(?:\([^)]*\))?|\([^)]*\)/g) || [];
                for (const t of tokens) {
                    if (t.startsWith('(')) { rows.push({ path, client: '*', opts: t.slice(1, -1).split(',').filter(Boolean), file, ln, spaced: true }); msgs.push(`exportfs: ${file}:${ln}: warning: whitespace before '(' - applies the options to every client`.replace(/^exportfs: .*: warning: .*$/, `exportfs: No host name given with ${path} (${t.slice(1, -1)}), suggest *(${t.slice(1, -1)}) to avoid warning`)); continue; }
                    const cm = /^([^(]+)(?:\(([^)]*)\))?$/.exec(t);
                    if (!cm) continue;
                    const opts = cm[2] ? cm[2].split(',').filter(Boolean) : [];
                    if (!cm[2]) msgs.push(`exportfs: No options for ${path} ${cm[1]}: suggest ${cm[1]}(sync) to avoid warning`);
                    rows.push({ path, client: cm[1], opts, file, ln });
                }
            }
        }
        return { rows, msgs };
    }

    _effOpts(opts) {
        const known = ['ro', 'rw', 'sync', 'async', 'wdelay', 'no_wdelay', 'hide', 'nohide', 'crossmnt', 'subtree_check', 'no_subtree_check', 'secure', 'insecure', 'root_squash', 'no_root_squash', 'all_squash', 'no_all_squash', 'fsid', 'anonuid', 'anongid', 'sec', 'mountpoint', 'nocrossmnt', 'acl', 'no_acl', 'secure_locks', 'insecure_locks', 'no_auth_nlm', 'auth_nlm', 'pnfs', 'no_pnfs'];
        const bad = opts.find(o => !known.includes(o.split('=')[0]));
        const o = { sync: 'sync', wdelay: 'wdelay', hide: 'hide', sub: 'no_subtree_check', sec: 'sec=sys', rw: 'ro', secure: 'secure', rs: 'root_squash', as: 'no_all_squash', extra: [] };
        for (const x of opts) {
            const k = x.split('=')[0];
            if (x === 'rw') o.rw = 'rw'; else if (x === 'ro') o.rw = 'ro';
            else if (x === 'async') o.sync = 'async'; else if (x === 'sync') o.sync = 'sync';
            else if (x === 'no_wdelay') o.wdelay = null; else if (x === 'wdelay') o.wdelay = 'wdelay';
            else if (x === 'nohide') o.hide = 'nohide'; else if (x === 'crossmnt') o.hide = 'crossmnt';
            else if (x === 'subtree_check') o.sub = 'subtree_check';
            else if (x === 'insecure') o.secure = 'insecure';
            else if (x === 'no_root_squash') o.rs = 'no_root_squash';
            else if (x === 'all_squash') o.as = 'all_squash';
            else if (k === 'sec') o.sec = x;
            else if (k === 'anonuid' || k === 'anongid' || k === 'fsid') o.extra.push(x);
        }
        const list = [o.sync, o.wdelay, o.hide, o.sub, o.sec, o.rw, o.secure, o.rs, o.as, ...o.extra].filter(Boolean);
        return { text: list.join(','), bad, rw: o.rw === 'rw', noRootSquash: o.rs === 'no_root_squash', raw: o };
    }

    _clientMatches(spec, ip, hostname) {
        if (spec === '*' || spec === '') return true;
        const nm = this._net();
        if (/\//.test(spec) && /^\d/.test(spec)) { try { return nm._inNet(ip, spec); } catch (e) { return false; } }
        if (/^\d+\.\d+\.\d+\.\d+$/.test(spec)) return spec === ip;
        const re = new RegExp('^' + spec.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
        if (hostname && re.test(hostname)) return true;
        const r = this._resolve(spec);
        return r === ip;
    }

    // ===== exportfs =====
    _loadExports(silent) {
        const { rows, msgs } = this._parseExports();
        const errs = [];
        const out = [];
        for (const r of rows) {
            const n = this._node(r.path);
            if (!n) { errs.push(`exportfs: Failed to stat ${r.path}: No such file or directory`); continue; }
            const e = this._effOpts(r.opts);
            if (e.bad) { errs.push(`exportfs: ${r.file}:${r.ln}: unknown keyword "${e.bad}"`); continue; }
            out.push({ path: r.path, client: r.client, opts: e.text, rw: e.rw, noRootSquash: e.noRootSquash, tmp: false });
        }
        // temporary (-o) exports stay unless re-exported from the file
        const keep = this.applied.filter(a => a.tmp && !out.some(o => o.path === a.path && o.client === a.client));
        this.applied = out.concat(keep);
        return { errs, msgs: silent ? [] : msgs };
    }

    exportfs(args) {
        const flags = args.filter(a => a.startsWith('-')).join('').replace(/-/g, '');
        const pos = args.filter(a => !a.startsWith('-'));
        const oi = args.indexOf('-o');
        const verbose = flags.includes('v');
        if (!this._isRoot() && (flags.includes('a') || flags.includes('r') || flags.includes('u') || oi >= 0 || pos.length)) return this._err('exportfs: access denied', 1);
        if (flags.includes('u')) {
            if (flags.includes('a')) { this.applied = []; return this._ok(''); }
            const out = [];
            for (const p of pos) {
                const [host, path] = p.includes(':') ? p.split(/:(.*)/s) : ['*', p];
                const before = this.applied.length;
                this.applied = this.applied.filter(a => !(a.path === path && (a.client === host || host === '*' && false)));
                if (this.applied.length === before) return this._err(`exportfs: Could not find '${p}' to unexport.`, 1);
                if (verbose) out.push(`unexporting ${host}:${path}`);
            }
            return this._ok(out.join('\n'));
        }
        if (flags.includes('a') || flags.includes('r')) {
            const { errs, msgs } = this._loadExports();
            const out = [];
            if (verbose) for (const a of this.applied) out.push(`exporting ${a.client}:${a.path}`);
            return { stdout: out.join('\n'), stderr: [...msgs, ...errs].join('\n'), exitCode: errs.length ? 1 : 0 };
        }
        if (pos.length && oi >= 0 || (pos.length && pos[0].includes(':'))) {
            const opts = oi >= 0 ? args[oi + 1] : '';
            const spec = pos.find(p => p.includes(':') && p !== opts);
            if (!spec) return this._err('exportfs: Invalid export specification', 1);
            const [host, path] = spec.split(/:(.*)/s);
            if (!this._node(path)) return this._err(`exportfs: Failed to stat ${path}: No such file or directory`, 1);
            const e = this._effOpts((opts || '').split(',').filter(Boolean));
            this.applied.push({ path, client: host, opts: e.text, rw: e.rw, noRootSquash: e.noRootSquash, tmp: true });
            return this._ok('');
        }
        // list
        const lines = [];
        for (const a of this.applied) {
            const client = verbose ? `${a.client}(${a.opts})` : a.client;
            if (a.path.length > 14 || verbose) lines.push(a.path.length > 14 ? `${a.path}\n\t\t${client}` : `${a.path.padEnd(14)}\t${client}`);
            else lines.push(`${a.path.padEnd(14)}\t${client}`);
        }
        return this._ok(lines.join('\n'));
    }

    // ===== showmount / rpcinfo =====
    showmount(args) {
        const pos = args.filter(a => !a.startsWith('-'));
        const flags = args.filter(a => a.startsWith('-')).join('').replace(/-/g, '');
        const host = pos[0] || this._host();
        if (this._isLocal(pos[0])) {
            if (!this._svcActive('nfs-server')) return this._err('clnt_create: RPC: Program not registered', 1);
            const list = this.applied.filter(a => !a.tmp || true);
            if (flags.includes('a')) return this._ok(`All mount points on ${host}:\n` + this._mountedBy().join('\n'));
            if (flags.includes('d')) return this._ok(`Directories on ${host}:\n` + [...new Set(list.map(a => a.path))].join('\n'));
            return this._ok([`Export list for ${host}:`, ...this._exportRows(list)].join('\n'));
        }
        const ip = this._resolve(host);
        if (!ip) return this._err('clnt_create: RPC: Unknown host', 1);
        const nm = this._net();
        if (nm && !nm._routeFor(ip)) return this._err('clnt_create: RPC: Port mapper failure - Unable to receive: errno 113 (No route to host)', 1);
        const srv = this.remote[ip];
        if (!srv) return this._err('clnt_create: RPC: Port mapper failure - Timed out', 1);
        if (flags.includes('a')) return this._ok(`All mount points on ${host}:`);
        return this._ok([`Export list for ${host}:`, ...this._exportRows(srv.exports.map(([p, c]) => ({ path: p, client: c })))].join('\n'));
    }

    _exportRows(list) {
        const byPath = {};
        for (const a of list) (byPath[a.path] = byPath[a.path] || []).push(a.client);
        const w = Math.max(0, ...Object.keys(byPath).map(p => p.length)) + 1;
        return Object.entries(byPath).map(([p, c]) => `${p.padEnd(w)}${c.join(',')}`);
    }

    _mountedBy() { return []; }

    rpcinfo(args) {
        const host = args.filter(a => !a.startsWith('-'))[0];
        if (host && !this._isLocal(host)) return this._err(`rpcinfo: can't contact portmapper: RPC: Remote system error - Connection refused`, 1);
        if (!this._svcActive('rpcbind') && !this._svcActive('nfs-server')) return this._err('rpcinfo: can\'t contact portmapper: RPC: Remote system error - Connection refused', 1);
        const rows = [['100000', '4', 'tcp', '111', 'portmapper'], ['100000', '3', 'tcp', '111', 'portmapper'], ['100000', '2', 'tcp', '111', 'portmapper'], ['100000', '4', 'udp', '111', 'portmapper']];
        if (this._svcActive('nfs-server')) rows.push(['100005', '3', 'tcp', '20048', 'mountd'], ['100003', '4', 'tcp', '2049', 'nfs'], ['100003', '3', 'tcp', '2049', 'nfs'], ['100227', '3', 'tcp', '2049', 'nfs_acl'], ['100021', '4', 'tcp', '41721', 'nlockmgr']);
        return this._ok(['   program vers proto   port  service', ...rows.map(r => `${r[0].padStart(10)}${r[1].padStart(5)}${r[2].padStart(6)}${r[3].padStart(7)}  ${r[4]}`)].join('\n'));
    }

    // ===== mount-time checks (called from the storage module) =====
    nfsCheck(dev, typeIn) {
        const m = /^([^/\s]+):(\/.*)$/.exec(dev);
        if (!m) return null;
        const host = m[1], path = m[2].replace(/\/+$/, '') || '/';
        const ip = this._resolve(host);
        if (!ip) return this._err(`mount.nfs: Failed to resolve server ${host}: Name or service not known`, 32);
        const nm = this._net();
        if (nm && !this._isLocal(host) && !nm._routeFor(ip)) return this._err('mount.nfs: No route to host', 32);
        if (this._isLocal(host)) {
            if (!this._svcActive('nfs-server')) return this._err('mount.nfs: Connection refused', 32);
            const hit = this.applied.find(a => (a.path === path || path.startsWith(a.path + '/')) && this._clientMatches(a.client, ip, this._host()));
            if (!hit) return this._err(`mount.nfs: access denied by server while mounting ${dev}`, 32);
            return null;
        }
        const srv = this.remote[ip];
        if (!srv) return this._err('mount.nfs: Connection timed out', 32);
        const myIp = (nm && nm._myAddrs().find(a => a.startsWith('192.168.'))) || '192.168.1.100';
        const hit = srv.exports.find(([p, c]) => (p === path || path.startsWith(p + '/')) && this._clientMatches(c, myIp, this._host()));
        if (!hit) return this._err(`mount.nfs: access denied by server while mounting ${dev}`, 32);
        return null;
    }

    // ===== autofs =====
    installHooks(parent) {
        this._prevSystemctl = parent.systemctl;
        parent.systemctl = (args, stdin) => this._systemctl(args, stdin);
        const st = this.shared.storage;
        if (st && st._mountOne) {
            const orig = st._mountOne.bind(st);
            st._mountOne = (dev, tgt, typeIn, opts, shown, verbose) => {
                const isNfs = /^[^/\s]+:\/.*$/.test(dev) || typeIn === 'nfs' || typeIn === 'nfs4';
                if (isNfs) { const e = this.nfsCheck(dev, typeIn); if (e) return e; }
                const res = orig(dev, tgt, typeIn, opts, shown, verbose);
                if (isNfs && !res.exitCode) {
                    const t = st._normPath(tgt);
                    const entry = st.stMounts.slice().reverse().find(m => m.tgt === t && m.src === dev);
                    const mm = /^([^:]+):(\/.*)$/.exec(dev);
                    if (entry && mm) this._populateFromLocal(mm[1], mm[2], t, entry);
                }
                return res;
            };
        }
        // autofs triggers on path lookups
        const fs = this.fs;
        const origGet = fs.getNode.bind(fs);
        let busy = false;
        fs.getNode = (path) => {
            const n = origGet(path);
            if (n || busy || !this.auto.loaded || typeof path !== 'string') return n;
            busy = true;
            try {
                const abs = fs.resolvePath(path);
                if (this._autoTrigger(abs)) return origGet(path);
            } finally { busy = false; }
            return n;
        };
    }

    _systemctl(args, stdin) {
        const r = this._prevSystemctl(args, stdin);
        const pos = args.filter(a => !a.startsWith('-'));
        const verb = pos[0];
        const units = pos.slice(1).map(u => u.replace(/\.service$/, ''));
        if (!r.exitCode && !args.includes('--user')) {
            if (units.includes('nfs-server') || units.includes('nfs')) {
                if (['start', 'restart', 'reload', 'reload-or-restart'].includes(verb)) { const { errs } = this._loadExports(true); if (errs.length && verb !== 'reload') { /* exports with errors are skipped, like exportfs -r */ } }
                if (verb === 'stop') this.applied = [];
            }
            if (units.includes('autofs')) {
                if (['start', 'restart', 'reload', 'reload-or-restart'].includes(verb)) this._autoLoad();
                if (verb === 'stop') this._autoUnload();
            }
        }
        return r;
    }

    _readMap(path) {
        const t = this._text(path);
        if (t === null) return null;
        const rows = [];
        for (const raw of t.split('\n')) {
            const l = raw.replace(/#.*$/, '').trim();
            if (l) rows.push(l);
        }
        return rows;
    }

    _autoLoad() {
        this._autoUnload(true);
        const lines = [];
        const main = this._readMap('/etc/auto.master') || [];
        lines.push(...main);
        const d = this._node('/etc/auto.master.d');
        if (d && d.children) for (const f of Object.keys(d.children).sort()) if (f.endsWith('.autofs')) lines.push(...(this._readMap('/etc/auto.master.d/' + f) || []));
        const tops = [], direct = [];
        for (const l of lines) {
            const m = /^(\S+)\s+(?:(?:file|program|yp|ldap):)?(\S+)(?:\s+(.*))?$/.exec(l);
            if (!m) continue;
            if (/^\+/.test(l)) continue;
            const mount = m[1], map = m[2], opts = m[3] || '';
            const entries = this._readMap(map.replace(/^file:/, '')) || [];
            if (mount === '/-') {
                for (const e of entries) { const em = /^(\S+)\s+(?:(-\S+)\s+)?(\S+)$/.exec(e); if (em) direct.push({ key: em[1], opts: em[2] || '', loc: em[3], map }); }
            } else tops.push({ mount, map, opts, entries });
        }
        this.auto = { loaded: true, tops, direct, mounted: [] };
        const st = this.shared.storage;
        for (const t of tops) {
            this._mkdirs(t.mount);
            if (st) st.stMounts.push({ src: t.map, tgt: t.mount, type: 'autofs', opts: 'rw,relatime,fd=6,pgrp=1020,timeout=300,minproto=5,maxproto=5,indirect,pipe_ino=21452', auto: true });
        }
        for (const dctl of direct) {
            this._mkdirs(this.fs.getParentPath(dctl.key));
            if (st) st.stMounts.push({ src: dctl.map, tgt: dctl.key, type: 'autofs', opts: 'rw,relatime,fd=6,pgrp=1020,timeout=300,minproto=5,maxproto=5,direct,pipe_ino=21460', auto: true });
            const par = this._node(this.fs.getParentPath(dctl.key));
            if (par && par.children && !par.children[this.fs.getBasename(dctl.key)]) par.children[this.fs.getBasename(dctl.key)] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 0, modified: new Date(), children: {}, autoTrigger: true };
        }
        if (st) st._stSyncProc();
    }

    _autoUnload(quiet) {
        const st = this.shared.storage;
        if (st) {
            for (let i = st.stMounts.length - 1; i >= 0; i--) {
                const m = st.stMounts[i];
                if (m.auto || m.autoChild) {
                    st.stMounts.splice(i, 1);
                    const n = this.fs.getNode(m.tgt);
                    if (n && m.autoChild && n.autoCreated) this._rmNode(m.tgt);
                }
            }
            st._stSyncProc();
        }
        this.auto = { loaded: false, tops: [], direct: [], mounted: [] };
    }

    _mkdirs(path) {
        let cur = this.fs.fs['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
    }

    _rmNode(path) {
        const parent = this._node(this.fs.getParentPath(path));
        if (parent && parent.children) delete parent.children[this.fs.getBasename(path)];
    }

    // path was looked up but does not exist: mount it if an automount map says so
    _autoTrigger(abs) {
        if (!this._svcActive('autofs')) return false;
        const st = this.shared.storage;
        for (const t of this.auto.tops) {
            if (!abs.startsWith(t.mount + '/')) continue;
            const rel = abs.slice(t.mount.length + 1).split('/');
            const key = rel[0];
            let entry = t.entries.map(e => /^(\S+)\s+(?:(-\S+)\s+)?(\S+)$/.exec(e)).filter(Boolean).find(m => m[1] === key) || null;
            let loc = null, opts = '';
            if (entry) { loc = entry[3]; opts = entry[2] || ''; }
            else { const w = t.entries.map(e => /^(\*)\s+(?:(-\S+)\s+)?(\S+)$/.exec(e)).filter(Boolean)[0]; if (w) { loc = w[3].replace(/&/g, key); opts = w[2] || ''; } }
            if (!loc) return false;
            const target = `${t.mount}/${key}`;
            if (st && st.stMounts.some(m => m.tgt === target)) return false;
            const res = this._autoMount(loc, opts, target);
            return res;
        }
        for (const d of this.auto.direct) {
            if (abs === d.key || abs.startsWith(d.key + '/')) {
                if (st && st.stMounts.some(m => m.tgt === d.key && !m.auto)) return false;
                return this._autoMount(d.loc.replace(/^:/, ''), d.opts, d.key, true);
            }
        }
        return false;
    }

    _autoMount(loc, opts, target, direct) {
        const st = this.shared.storage;
        const optList = opts.replace(/^-/, '').split(',').filter(Boolean);
        const fstype = (optList.find(o => o.startsWith('fstype=')) || 'fstype=nfs4').slice(7);
        const mo = optList.filter(o => !o.startsWith('fstype='));
        if (/^[^/\s]+:\//.test(loc) || fstype.startsWith('nfs')) {
            const dev = loc.replace(/^:/, '');
            const bad = this.nfsCheck(dev, fstype);
            if (bad) { this._autoErr = bad.stderr; return false; }
            if (!direct) {
                const parent = this._node(this.fs.getParentPath(target));
                if (parent && parent.children) parent.children[this.fs.getBasename(target)] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 0, modified: new Date(), children: {}, autoCreated: true };
            }
            const m = /^([^:]+):(\/.*)$/.exec(dev);
            st.stMounts.push({ src: dev, tgt: target, type: fstype === 'nfs' ? 'nfs4' : fstype, opts: `rw,relatime,vers=4.2,rsize=262144,wsize=262144,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.1.100,local_lock=none,addr=${this._resolve(m[1]) || m[1]}`, autoChild: true });
            this._populateFromLocal(m[1], m[2], target, st.stMounts[st.stMounts.length - 1]);
            st._stSyncProc();
            return true;
        }
        // local filesystem maps (-fstype=ext4 :/dev/vdb1 and the like)
        if (loc.startsWith(':')) {
            const dev = loc.slice(1);
            if (!this.shared.storage.deviceExists(dev)) return false;
            if (!direct) {
                const parent = this._node(this.fs.getParentPath(target));
                if (parent && parent.children) parent.children[this.fs.getBasename(target)] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 0, modified: new Date(), children: {}, autoCreated: true };
            }
            st.stMounts.push({ src: dev, tgt: target, type: fstype, opts: 'rw,relatime', autoChild: true });
            st._stSyncProc();
            return true;
        }
        return false;
    }

    // a mounted share shows the files of the exported directory when the server is this machine
    _populateFromLocal(host, path, target, entry) {
        if (!this._isLocal(host)) return;
        const src = this._node(path), dst = this._node(target);
        if (src && dst && src.children && dst.isoSaved === undefined) {
            dst.isoSaved = dst.children;
            dst.children = src.children;
            if (entry) entry.populated = true;
        }
    }

    automount(args) {
        if (!this._isRoot()) return this._err('automount: only root can do that', 1);
        if (args.includes('-m') || args.includes('--dumpmaps')) {
            const L = ['', 'autofs dump map information', '===========================', ''];
            for (const t of this.auto.tops.length ? this.auto.tops : []) { L.push(`global options: none configured`, ''); L.push(`Mount point: ${t.mount}`, '', `source(s):`, '', `  type: file`, `  map: ${t.map}`, ''); for (const e of t.entries) { const m = /^(\S+)\s+(?:(-\S+)\s+)?(\S+)$/.exec(e); if (m) L.push(`  ${m[1]} | ${m[3]}`); } L.push(''); }
            return this._ok(L.join('\n'));
        }
        if (args.includes('--version') || args.includes('-V')) return this._ok('Linux automount version 5.1.7');
        return this._err('automount: automount(8) runs as a daemon; use "systemctl start autofs"', 1);
    }
}

// ============================================================================================================

class TuneEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.tune = this;
        this.niceLevel = 0;
        this.keys = this._defaults();
        for (const [k, def] of Object.entries(this.keys)) this._procWrite(k, def.v, true);
        this._write('/etc/tuned/active_profile', 'virtual-guest\n');
        this._write('/etc/tuned/profile_mode', 'auto\n');
        this._write('/etc/tuned/recommended_profile', 'virtual-guest\n'.replace(/\n$/, ''));
        this._write('/usr/lib/sysctl.d/10-default-yama-scope.conf', '# The yama ptrace_scope sysctl allows to restrict ptrace.\nkernel.yama.ptrace_scope = 0\n');
        this._write('/usr/lib/sysctl.d/50-coredump.conf', '# Pass coredumps to systemd-coredump\nkernel.core_pattern=|/usr/lib/systemd/systemd-coredump %P %u %g %s %t %c %h\nkernel.core_pipe_limit=16\nfs.suid_dumpable=2\n'.replace(/^/, ''));
        this._write('/usr/lib/sysctl.d/50-default.conf', '# System default settings live in /usr/lib/sysctl.d/50-default.conf\nkernel.sysrq = 16\nkernel.core_uses_pid = 1\nnet.ipv4.conf.default.rp_filter = 2\nnet.ipv4.conf.all.rp_filter = 1\nnet.ipv4.conf.default.accept_source_route = 0\nfs.protected_hardlinks = 1\nfs.protected_symlinks = 1\n');
        this._write('/usr/lib/sysctl.d/50-pid-max.conf', '# The kernel default is 32768 on 32-bit systems\nkernel.pid_max = 4194304\n');
        this._write('/etc/sysctl.conf', '# sysctl settings are defined through files in\n# /usr/lib/sysctl.d/, /run/sysctl.d/, and /etc/sysctl.d/.\n#\n# Vendors settings live in /usr/lib/sysctl.d/.\n# To override a whole file, create a new file with the same in\n# /etc/sysctl.d/ and put new settings there. To override\n# only specific settings, add a file with a lexically later\n# name in /etc/sysctl.d/ and put new settings there.\n#\n# For more information, see sysctl.conf(5) and sysctl.d(5).\n', true);
        this._mkdirs('/etc/sysctl.d');
        this.profiles = this._profiles();
        this.profileEffects = {
            'throughput-performance': { 'vm.swappiness': '10', 'vm.dirty_ratio': '40', 'vm.dirty_background_ratio': '10' },
            'accelerator-performance': { 'vm.swappiness': '10', 'vm.dirty_ratio': '40', 'vm.dirty_background_ratio': '10' },
            'latency-performance': { 'vm.swappiness': '10' },
            'virtual-guest': { 'vm.swappiness': '30', 'vm.dirty_ratio': '30' },
            'virtual-host': { 'vm.swappiness': '10', 'vm.dirty_background_ratio': '5' },
            'hpc-compute': { 'vm.swappiness': '10' },
            'balanced': {}, 'balanced-battery': {}, 'desktop': {}, 'powersave': {}, 'network-latency': {}, 'network-throughput': {}, 'intel-sst': {}, 'optimize-serial-console': {}
        };
        this.active = 'virtual-guest';
        this.applyProfile('virtual-guest', true);
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    get parent() { return this.shared.parent; }
    _node(p) { return this.fs.getNode(p); }
    _text(p) { const n = this._node(p); return n && n.type === 'file' ? n.content || '' : null; }
    _mkdirs(path) {
        let cur = this.fs.fs['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
    }
    _write(path, content, onlyMissing) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        this._mkdirs('/' + parts.join('/'));
        const dir = this.fs.getNode('/' + parts.join('/'));
        if (onlyMissing && dir.children[name]) return;
        dir.children[name] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    // ===== sysctl keys =====
    // v = default, t = int | bool | str, min/max, ro
    _defaults() {
        const i = (v, min, max) => ({ v: String(v), t: 'int', min, max });
        const b = (v) => ({ v: String(v), t: 'int', min: 0, max: 1 });
        const s = (v, ro) => ({ v, t: 'str', ro });
        return {
            'kernel.hostname': s('rhcsa-lab'), 'kernel.ostype': s('Linux', true), 'kernel.osrelease': s('5.14.0-362.8.1.el9_3.x86_64', true), 'kernel.version': s('#1 SMP PREEMPT_DYNAMIC Wed Nov 8 17:36:32 UTC 2023', true),
            'kernel.pid_max': i(4194304, 301, 4194304), 'kernel.threads-max': i(31048, 1, 4194304), 'kernel.sysrq': i(16, 0, 511), 'kernel.panic': i(0, 0, 2147483647), 'kernel.panic_on_oops': b(1),
            'kernel.randomize_va_space': i(2, 0, 2), 'kernel.core_uses_pid': b(1), 'kernel.core_pattern': s('|/usr/lib/systemd/systemd-coredump %P %u %g %s %t %c %h'), 'kernel.core_pipe_limit': i(16, 0, 2147483647),
            'kernel.shmmax': i('18446744073692774399', 0), 'kernel.shmall': i('18446744073692774399', 0), 'kernel.shmmni': i(4096, 0), 'kernel.msgmax': i(8192, 0), 'kernel.msgmnb': i(16384, 0), 'kernel.sem': s('32000\t1024000000\t500\t32000'),
            'kernel.yama.ptrace_scope': i(0, 0, 3), 'kernel.dmesg_restrict': b(0), 'kernel.kptr_restrict': i(0, 0, 2), 'kernel.printk': s('7\t4\t1\t7'), 'kernel.modules_disabled': b(0),
            'net.ipv4.ip_forward': b(0), 'net.ipv4.tcp_syncookies': i(1, 0, 2), 'net.ipv4.icmp_echo_ignore_all': b(0), 'net.ipv4.icmp_echo_ignore_broadcasts': b(1), 'net.ipv4.ip_local_port_range': s('32768\t60999'), 'net.ipv4.ip_unprivileged_port_start': i(1024, 0, 65535),
            'net.ipv4.tcp_keepalive_time': i(7200, 1), 'net.ipv4.tcp_fin_timeout': i(60, 1), 'net.ipv4.conf.all.rp_filter': i(1, 0, 2), 'net.ipv4.conf.default.rp_filter': i(2, 0, 2), 'net.ipv4.conf.all.accept_redirects': b(1), 'net.ipv4.conf.all.send_redirects': b(1),
            'net.ipv4.conf.all.accept_source_route': b(0), 'net.ipv4.conf.default.accept_source_route': b(0), 'net.ipv4.conf.all.log_martians': b(0), 'net.ipv4.conf.all.forwarding': b(0), 'net.ipv4.tcp_max_syn_backlog': i(512, 1),
            'net.ipv6.conf.all.disable_ipv6': b(0), 'net.ipv6.conf.default.disable_ipv6': b(0), 'net.ipv6.conf.all.forwarding': b(0), 'net.core.somaxconn': i(4096, 0), 'net.core.rmem_max': i(212992, 0), 'net.core.wmem_max': i(212992, 0), 'net.core.netdev_max_backlog': i(1000, 1),
            'vm.swappiness': i(30, 0, 200), 'vm.dirty_ratio': i(30, 0, 100), 'vm.dirty_background_ratio': i(10, 0, 100), 'vm.overcommit_memory': i(0, 0, 2), 'vm.overcommit_ratio': i(50, 0), 'vm.max_map_count': i(65530, 1), 'vm.min_free_kbytes': i(67584, 0),
            'vm.vfs_cache_pressure': i(100, 0), 'vm.drop_caches': i(0, 0, 4), 'vm.nr_hugepages': i(0, 0), 'vm.panic_on_oom': i(0, 0, 2), 'vm.dirty_writeback_centisecs': i(500, 0), 'vm.dirty_expire_centisecs': i(3000, 0),
            'fs.file-max': i('9223372036854775807', 0), 'fs.nr_open': i(1073741816, 0), 'fs.inotify.max_user_watches': i(8192, 1), 'fs.inotify.max_user_instances': i(128, 1), 'fs.suid_dumpable': i(2, 0, 2), 'fs.protected_hardlinks': b(1), 'fs.protected_symlinks': b(1), 'fs.aio-max-nr': i(1048576, 0)
        };
    }

    _procPath(key) { return '/proc/sys/' + key.replace(/\./g, '/'); }
    _procWrite(key, value, create) {
        const p = this._procPath(key);
        const parts = p.split('/').filter(Boolean);
        const name = parts.pop();
        this._mkdirs('/' + parts.join('/'));
        const dir = this.fs.getNode('/' + parts.join('/'));
        const text = String(value) + '\n';
        if (!dir.children[name] || create) dir.children[name] = { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 0, modified: new Date(), content: text };
        else { dir.children[name].content = text; dir.children[name].modified = new Date(); }
    }
    _get(key) {
        if (key === 'kernel.hostname') return this.parent.hostname;
        const n = this._node(this._procPath(key));
        if (n && n.type === 'file') return (n.content || '').replace(/\n$/, '');
        return null;
    }
    _normKey(k) { return k.includes('/') ? k.replace(/\//g, '.') : k; }

    // returns error string or null
    _set(key, value, fromFile) {
        const def = this.keys[key];
        if (!def) return `sysctl: cannot stat ${this._procPath(key)}: No such file or directory`;
        if (!this._isRoot()) return `sysctl: permission denied on key '${key}'`;
        if (def.ro) return `sysctl: setting key "${key}": Operation not permitted`;
        const v = String(value).trim();
        if (def.t === 'int') {
            if (!/^-?\d+$/.test(v)) return `sysctl: setting key "${key}": Invalid argument`;
            const n = BigInt(v);
            if (def.min !== undefined && n < BigInt(def.min)) return `sysctl: setting key "${key}": Invalid argument`;
            if (def.max !== undefined && n > BigInt(def.max)) return `sysctl: setting key "${key}": Invalid argument`;
        } else if (!v.length) return `sysctl: setting key "${key}": Invalid argument`;
        if (key === 'kernel.hostname') { this.parent.hostname = v; return null; }
        this._procWrite(key, v);
        return null;
    }

    sysctl(args) {
        const opts = {};
        const keys = [];
        let file = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-a' || a === '--all' || a === '-A' || a === '-X') opts.a = true;
            else if (a === '-n' || a === '--values') opts.n = true;
            else if (a === '-N' || a === '--names') opts.N = true;
            else if (a === '-w' || a === '--write') opts.w = true;
            else if (a === '-e' || a === '--ignore') opts.e = true;
            else if (a === '-q' || a === '--quiet') opts.q = true;
            else if (a === '--system') opts.system = true;
            else if (a === '-p' || a === '--load') { opts.p = true; if (args[i + 1] && !args[i + 1].startsWith('-') && !args[i + 1].includes('=') && !this.keys[args[i + 1]]) file = args[++i]; }
            else if (a.startsWith('-p') && a.length > 2) { opts.p = true; file = a.slice(2); }
            else if (a.startsWith('--load=')) { opts.p = true; file = a.slice(7); }
            else if (a === '-h' || a === '--help') return this._ok('Usage:\n sysctl [options] [variable[=value] ...]\n\nOptions:\n  -a, --all            display all variables\n  -n, --values         print only values of the given variable(s)\n  -e, --ignore         ignore unknown variables errors\n  -N, --names          print only variable names\n  -q, --quiet          do not echo variable set\n  -w, --write          enable writing a value to variable\n  -p, --load[=<file>]  read values from file\n      --system         read values from all system directories');
            else if (a === '-V' || a === '--version') return this._ok('sysctl from procps-ng 3.3.17');
            else if (a.startsWith('-') && a.length > 1) return this._err(`sysctl: invalid option -- '${a.replace(/^-+/, '')}'\n\nUsage:\n sysctl [options] [variable[=value] ...]\n\nSee sysctl(8) for more information.`, 1);
            else keys.push(a);
        }
        if (opts.system) return this._loadSystem(opts);
        if (opts.p) return this._loadFile(file || '/etc/sysctl.conf', opts, false);
        if (opts.a) {
            const rows = Object.keys(this.keys).sort().map(k => (opts.N ? k : opts.n ? this._get(k) : `${k} = ${this._get(k)}`));
            return this._ok(rows.join('\n'));
        }
        if (!keys.length) return this._err('sysctl: no variables specified\nTry `sysctl --help\' for more information.', 255);
        const out = [], errs = [];
        let code = 0;
        for (const raw of keys) {
            if (raw.includes('=')) {
                const idx = raw.indexOf('=');
                const key = this._normKey(raw.slice(0, idx).trim());
                const val = raw.slice(idx + 1);
                if (!this.fs.currentUid === 0 && false) continue;
                const e = this._set(key, val.replace(/^["']|["']$/g, ''));
                if (e) { errs.push(e); code = 255; continue; }
                if (!opts.q) out.push(opts.n ? this._get(key) : `${key} = ${this._get(key)}`);
            } else {
                const key = this._normKey(raw);
                const v = this._get(key);
                if (v === null) { if (!opts.e) { errs.push(`sysctl: cannot stat ${this._procPath(key)}: No such file or directory`); code = 255; } continue; }
                out.push(opts.N ? key : opts.n ? v : `${key} = ${v}`);
            }
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _loadFile(path, opts, header) {
        const node = this._node(this.fs.resolvePath(path));
        if (!node || node.type !== 'file') return this._err(`sysctl: cannot open "${this.fs.resolvePath(path)}": No such file or directory`, 255);
        const out = [], errs = [];
        let code = 0;
        let ln = 0;
        for (const raw of (node.content || '').split('\n')) {
            ln++;
            const l = raw.trim();
            if (!l || l[0] === '#' || l[0] === ';') continue;
            const idx = l.indexOf('=');
            if (idx < 0) { errs.push(`sysctl: ${path}(${ln}): invalid syntax, continuing...`); continue; }
            let key = this._normKey(l.slice(0, idx).trim());
            const ignore = key.startsWith('-');
            if (ignore) key = key.slice(1);
            const e = this._set(key, l.slice(idx + 1).trim());
            if (e) { if (!(ignore || opts.e)) { errs.push(e); code = 255; } continue; }
            if (!opts.q) out.push(`${key} = ${this._get(key)}`);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _loadSystem(opts) {
        const seen = {};
        for (const dir of ['/usr/lib/sysctl.d', '/etc/sysctl.d', '/run/sysctl.d']) {
            const d = this._node(dir);
            if (d && d.children) for (const f of Object.keys(d.children)) if (f.endsWith('.conf') && d.children[f].type !== 'directory') seen[f] = `${dir}/${f}`;
        }
        const files = Object.keys(seen).sort().map(f => seen[f]);
        files.push('/etc/sysctl.conf');
        const out = [], errs = [];
        let code = 0;
        for (const f of files) {
            if (!this._node(f)) continue;
            out.push(`* Applying ${f} ...`);
            const r = this._loadFile(f, opts, true);
            if (r.stdout) out.push(r.stdout);
            if (r.stderr) errs.push(r.stderr);
            if (r.exitCode) code = r.exitCode;
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    // ===== tuned =====
    _profiles() {
        return [
            ['accelerator-performance', 'Throughput performance based tuning with disabled higher latency STOP states'],
            ['balanced', 'General non-specialized TuneD profile'],
            ['balanced-battery', 'Balanced profile biased towards power savings changes for battery'],
            ['desktop', 'Optimize for the desktop use-case'],
            ['hpc-compute', 'Optimize for HPC compute workloads'],
            ['intel-sst', 'Configure for Intel Speed Select Base Frequency'],
            ['latency-performance', 'Optimize for deterministic performance at the cost of increased power consumption'],
            ['network-latency', 'Optimize for deterministic performance at the cost of increased power consumption, focused on low latency network performance'],
            ['network-throughput', 'Optimize for streaming network throughput, generally only necessary on older CPUs or 40G+ networks'],
            ['optimize-serial-console', 'Optimize for serial console use.'],
            ['powersave', 'Optimize for low power consumption'],
            ['throughput-performance', 'Broadly applicable tuning that provides excellent performance across a variety of common server workloads'],
            ['virtual-guest', 'Optimize for running inside a virtual guest'],
            ['virtual-host', 'Optimize for running KVM guests']
        ];
    }

    _customProfiles() {
        const d = this._node('/etc/tuned');
        const out = [];
        if (d && d.children) for (const [n, v] of Object.entries(d.children)) if (v.type === 'directory' && v.children && v.children['tuned.conf']) out.push(n);
        return out;
    }

    _profileExists(name) { return this.profiles.some(p => p[0] === name) || this._customProfiles().includes(name); }

    _profileConf(name) {
        const n = this._node(`/etc/tuned/${name}/tuned.conf`);
        if (!n) return null;
        const sec = {}; let cur = null;
        for (const raw of (n.content || '').split('\n')) {
            const l = raw.trim();
            if (!l || l[0] === '#' || l[0] === ';') continue;
            const m = /^\[(.+)\]$/.exec(l);
            if (m) { cur = m[1]; sec[cur] = sec[cur] || {}; continue; }
            const kv = /^([^=]+)=(.*)$/.exec(l);
            if (kv && cur) sec[cur][kv[1].trim()] = kv[2].trim();
        }
        return sec;
    }

    _effectsOf(name, seen) {
        seen = seen || new Set();
        if (seen.has(name)) return {};
        seen.add(name);
        let eff = Object.assign({}, this.profileEffects[name] || {});
        const conf = this._profileConf(name);
        if (conf) {
            const inc = conf.main && conf.main.include;
            if (inc) eff = Object.assign({}, this._effectsOf(inc, seen), eff);
            if (conf.sysctl) Object.assign(eff, conf.sysctl);
        }
        return eff;
    }

    applyProfile(name, quiet) {
        const eff = this._effectsOf(name);
        const saved = this.fs.currentUid;
        this.fs.currentUid = 0;
        try { for (const [k, v] of Object.entries(eff)) if (this.keys[k]) this._set(k, v); } finally { this.fs.currentUid = saved; }
        this.active = name;
        this.expected = eff;
    }

    'tuned-adm'(args) { return this.tunedadm(args); }

    tunedadm(args) {
        const sub = args[0];
        const svc = this.shared.services.tuned;
        const running = !!(svc && svc.active);
        const activeFile = (this._text('/etc/tuned/active_profile') || '').trim();
        if (!sub || sub === '--help' || sub === '-h') return this._ok('usage: tuned-adm [-h] [--debug] [--async] [--timeout TIMEOUT] [--version]\n                  {list,active,off,profile,profile_info,recommend,verify,auto_profile,profile_mode} ...\n\nCommand line client for controlling tuned daemon');
        if (sub === '--version') return this._ok('tuned-adm 2.21.0');
        const needDaemon = () => (running ? null : this._err('Cannot talk to Tuned daemon via DBus. Is Tuned daemon running?', 1));
        if (sub === 'list') {
            const e = needDaemon(); if (e) return e;
            const rows = this.profiles.concat(this._customProfiles().map(n => [n, (((this._profileConf(n) || {}).main || {}).summary) || 'User profile'])).sort((a, b) => a[0].localeCompare(b[0]));
            const L = ['Available profiles:', ...rows.map(r => `- ${r[0].padEnd(28)} - ${r[1]}`), activeFile ? `Current active profile: ${activeFile}` : 'No current active profile.'];
            return this._ok(L.join('\n'));
        }
        if (sub === 'active') {
            const e = needDaemon(); if (e) return e;
            const mode = (this._text('/etc/tuned/profile_mode') || 'auto').trim();
            return this._ok(activeFile ? `Current active profile: ${activeFile}` : 'No current active profile.');
        }
        if (sub === 'recommend') return this._ok('virtual-guest');
        if (sub === 'profile_mode') { const e = needDaemon(); if (e) return e; const m = (this._text('/etc/tuned/profile_mode') || 'auto').trim(); return this._ok(`Profile selection mode: ${m === 'auto' ? 'automatic' : 'manual'}.`.replace('Profile selection mode: automatic.', 'Profile selection mode: Automatic (recommended)').replace('Profile selection mode: manual.', 'Profile selection mode: Manual')); }
        if (sub === 'profile_info') { const n = args[1] || activeFile; if (!this._profileExists(n)) return this._err(`Cannot find profile '${n}' in '['/etc/tuned', '/usr/lib/tuned']'.`, 1); const d = (this.profiles.find(p => p[0] === n) || [n, 'User profile'])[1]; return this._ok(`Profile name:\n${n}\n\n\nProfile summary:\n${d}\n\n\nProfile description:\n`); }
        if (sub === 'verify') {
            const e = needDaemon(); if (e) return e;
            const eff = this._effectsOf(activeFile || this.active);
            const bad = Object.entries(eff).filter(([k, v]) => this.keys[k] && String(this._get(k)) !== String(v));
            if (!bad.length) return this._ok("Verification succeeded, current system settings match the preset profile.\nSee TuneD log file ('/var/log/tuned/tuned.log') for details.");
            return { stdout: '', stderr: `Verification failed, current system settings differ from the preset profile.\nYou can mostly fix this by restarting the TuneD daemon, e.g.:\n  systemctl restart tuned\nor\n  tuned-adm off ; tuned-adm profile ${activeFile}\nSometimes (e.g. when some plugins are not supported) it may not work, so you may want to see the log file.\nSee TuneD log file ('/var/log/tuned/tuned.log') for details.`, exitCode: 1 };
        }
        if (['profile', 'off', 'auto_profile'].includes(sub)) {
            if (!this._isRoot()) return this._err('Failed to authenticate: Interactive authentication required.'.replace(/^.*$/, 'tuned-adm: Permission denied (must be root)'), 1);
            const e = needDaemon(); if (e) return e;
            if (sub === 'off') { this._write('/etc/tuned/active_profile', ''); this._write('/etc/tuned/profile_mode', 'manual\n'); this.active = ''; return this._ok(''); }
            if (sub === 'auto_profile') { this._write('/etc/tuned/active_profile', 'virtual-guest\n'); this._write('/etc/tuned/profile_mode', 'auto\n'); this.applyProfile('virtual-guest'); return this._ok('Profile selection mode set to auto.'.replace(/^.*$/, '')); }
            const names = args.slice(1).filter(a => !a.startsWith('-'));
            if (!names.length) return this._err('usage: tuned-adm profile [-h] [profiles ...]\ntuned-adm profile: error: the following arguments are required: profiles', 2);
            for (const n of names) if (!this._profileExists(n)) return this._err(`Cannot find profile '${n}' in '['/etc/tuned', '/usr/lib/tuned']'.\nTrying to (re)start tuned...\nCannot talk to Tuned daemon via DBus. Is Tuned daemon running?`.split('\nTrying')[0], 1);
            this._write('/etc/tuned/active_profile', names.join(' ') + '\n');
            this._write('/etc/tuned/profile_mode', 'manual\n');
            for (const n of names) this.applyProfile(n);
            return this._ok('');
        }
        return this._err(`usage: tuned-adm [-h] ...\ntuned-adm: error: argument action: invalid choice: '${sub}'`, 2);
    }

    // ===== nice / renice =====
    nice(args) {
        let adj = null, i = 0;
        for (; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' || a === '--adjustment') { adj = args[++i]; if (adj === undefined) return this._err("nice: option requires an argument -- 'n'\nTry 'nice --help' for more information.", 125); }
            else if (a.startsWith('--adjustment=')) adj = a.slice(13);
            else if (/^-n\S+$/.test(a)) adj = a.slice(2);
            else if (/^--?\d+$/.test(a)) adj = a.startsWith('--') ? '-' + a.slice(2) : a.slice(1);
            else if (a === '--help') return this._ok('Usage: nice [OPTION] [COMMAND [ARG]...]\nRun COMMAND with an adjusted niceness, which affects process scheduling.\nWith no COMMAND, print the current niceness.  Niceness values range from\n-20 (most favorable to the process) to 19 (least favorable to the process).');
            else if (a === '--') { i++; break; }
            else break;
        }
        const cmd = args.slice(i);
        if (adj !== null && !/^[+-]?\d+$/.test(adj)) return this._err(`nice: invalid adjustment \`${adj}'`, 125);
        const delta = adj === null ? 10 : parseInt(adj, 10);
        if (!cmd.length) { if (adj !== null) return this._err("nice: a command must be specified when an adjustment is given".replace(/^.*$/, 'nice: a command must be given with an adjustment\nTry \'nice --help\' for more information.'), 125); return this._ok(String(this.niceLevel)); }
        let level = Math.max(-20, Math.min(19, this.niceLevel + delta));
        let warn = '';
        if (level < this.niceLevel && !this._isRoot()) { warn = 'nice: cannot set niceness: Permission denied'; level = this.niceLevel; }
        const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null;
        if (!sh) return this._err('nice: shell unavailable', 125);
        const saved = this.niceLevel;
        this.niceLevel = level;
        const o = [], e = [];
        const io = { stdin: { text: '', pos: 0 }, out: (s) => { if (s) o.push(s); }, err: (s) => { if (s) e.push(s); }, piped: true };
        const quote = (w) => (/^[A-Za-z0-9_@%+=:,./-]+$/.test(w) ? w : "'" + w.replace(/'/g, "'\\''") + "'");
        let rc = 0;
        try { rc = sh.runScriptText(cmd.map(quote).join(' '), 'nice', [], io); } finally { this.niceLevel = saved; }
        return { stdout: o.join(''), stderr: (warn ? warn + '\n' : '') + e.join(''), exitCode: rc, rawStdout: o.join('') };
    }

    renice(args) {
        let prio = null, mode = 'p';
        const ids = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' || a === '--priority') prio = args[++i];
            else if (a === '-p' || a === '--pid') mode = 'p'; else if (a === '-u' || a === '--user') mode = 'u'; else if (a === '-g' || a === '--pgrp') mode = 'g';
            else if (/^-\d+$/.test(a) && prio === null) prio = a;
            else if (a === '-h' || a === '--help') return this._ok('Usage:\n renice [-n] <priority> [-p|--pid] <pid>...\n renice [-n] <priority>  -g|--pgrp <pgid>...\n renice [-n] <priority>  -u|--user <user>...');
            else if (prio === null && /^[+-]?\d+$/.test(a)) prio = a;
            else ids.push(a);
        }
        if (prio === null || !ids.length) return this._err('renice: not enough arguments\nTry \'renice --help\' for more information.'.replace(/^renice: not enough arguments/, 'Usage:\n renice [-n] <priority> [-p|--pid] <pid>...\n renice [-n] <priority>  -g|--pgrp <pgid>...\n renice [-n] <priority>  -u|--user <user>...\n\nFor more details see renice(1).').replace(/\nTry.*$/, ''), 1);
        if (!/^[+-]?\d+$/.test(prio)) return this._err(`renice: invalid priority '${prio}'`, 1);
        const target = Math.max(-20, Math.min(19, parseInt(prio, 10)));
        const P = this.shared.processes;
        const out = [], errs = [];
        let code = 0;
        const apply = (p, label) => {
            const old = p.ni || 0;
            if (!this._isRoot() && p.user !== this.fs.currentUser) { errs.push(`renice: failed to set priority for ${label}: Permission denied`); code = 1; return; }
            if (!this._isRoot() && target < old) { errs.push(`renice: failed to set priority for ${label}: Permission denied`); code = 1; return; }
            p.ni = target;
            out.push(`${label}, old priority ${old}, new priority ${target}`);
        };
        for (const id of ids) {
            if (mode === 'u') {
                const procs = P.filter(p => p.user === id || (/^\d+$/.test(id) && this.fs.users[p.user] && String(this.fs.users[p.user].uid) === id));
                if (!this.fs.users[id] && !/^\d+$/.test(id)) { errs.push(`renice: failed to get user ID for ${id}`.replace(/^renice: failed to get user ID for (.*)$/, 'renice: unknown user $1')); code = 1; continue; }
                if (!procs.length) { out.push(`${this.fs.users[id] ? this.fs.users[id].uid : id} (user ID) old priority 0, new priority ${target}`); continue; }
                const old = procs[0].ni || 0;
                let denied = false;
                for (const p of procs) { if (!this._isRoot() && (p.user !== this.fs.currentUser || target < (p.ni || 0))) { denied = true; break; } }
                if (denied) { errs.push(`renice: failed to set priority for ${this.fs.users[id] ? this.fs.users[id].uid : id} (user ID): Permission denied`); code = 1; continue; }
                for (const p of procs) p.ni = target;
                out.push(`${this.fs.users[id] ? this.fs.users[id].uid : id} (user ID) old priority ${old}, new priority ${target}`);
            } else {
                if (!/^\d+$/.test(id)) { errs.push(`renice: invalid value '${id}'`.replace(/^renice: invalid value/, 'renice: failed to parse argument: \'' + id + '\'').replace(/'.*'$/, `'${id}'`)); code = 1; continue; }
                const p = P.find(x => x.pid === parseInt(id, 10));
                if (!p) { errs.push(`renice: failed to get priority for ${id} (process ID): No such process`); code = 1; continue; }
                apply(p, `${id} (process ID)`);
            }
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }
}

if (typeof window !== 'undefined') {
    window.NfsEngine = NfsEngine;
    window.TuneEngine = TuneEngine;
}
