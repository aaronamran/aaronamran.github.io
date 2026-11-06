// Programs that come from packages: tree, nc/ncat, telnet, nmap, tcpdump, strace, fuser, mpstat, iotop, lspci, lsusb,
// ssh-keygen, createrepo_c, yumdownloader, dos2unix, sosreport and friends
// Part of Red Cat RHCSA Terminal Simulator
//
// A program only exists while its package is installed (dnf install tree makes `tree` work, dnf remove tree takes it
// away again), so installing a package is no longer just a message: the command really runs.

const APP_PKG = {
    tree: 'tree', nc: 'nmap-ncat', ncat: 'nmap-ncat', telnet: 'telnet', nmap: 'nmap', tcpdump: 'tcpdump', strace: 'strace',
    fuser: 'psmisc', iotop: 'iotop', lspci: 'pciutils', lsusb: 'usbutils', lsscsi: 'lsscsi', hdparm: 'hdparm', smartctl: 'smartmontools',
    createrepo_c: 'createrepo_c', createrepo: 'createrepo_c', yumdownloader: 'yum-utils', dos2unix: 'dos2unix', unix2dos: 'dos2unix',
    sosreport: 'sos', git: 'git', tmux: 'tmux', screen: 'screen', jq: 'jq', bc: 'bc', dc: 'bc', openssl: 'openssl', httpd: 'httpd', apachectl: 'httpd',
    nginx: 'nginx', mysql: 'mariadb', mariadb: 'mariadb', mysqldump: 'mariadb', make: 'make', gcc: 'gcc', cc: 'gcc', perl: 'perl', php: 'php',
    java: 'java-17-openjdk', node: 'nodejs', npm: 'nodejs', 'ssh-keygen': 'openssh', 'ssh-agent': 'openssh-clients', python3: 'python3',
    lftp: 'lftp', ftp: 'ftp', expect: 'expect', ansible: 'ansible-core', 'ansible-playbook': 'ansible-core', whois: 'whois', iperf3: 'iperf3'
};

const SERVICE_NAMES = { 20: 'ftp-data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'domain', 67: 'dhcps', 68: 'dhcpc', 69: 'tftp', 80: 'http', 110: 'pop3', 111: 'rpcbind', 123: 'ntp', 139: 'netbios-ssn', 143: 'imap', 161: 'snmp', 389: 'ldap', 443: 'https', 445: 'microsoft-ds', 514: 'syslog', 631: 'ipp', 636: 'ldaps', 873: 'rsync', 993: 'imaps', 995: 'pop3s', 2049: 'nfs', 3306: 'mysql', 5432: 'postgresql', 5900: 'vnc', 8000: 'http-alt', 8080: 'http-proxy', 8443: 'https-alt', 9090: 'zeus-admin' };

const REMOTE_PORTS = {
    '192.168.1.254': [22, 53, 80, 111, 443, 2049], '192.168.1.120': [22, 111, 2049], '192.168.1.101': [22, 80, 443], '192.168.1.1': [53, 80, 443],
    '8.8.8.8': [53, 443], '8.8.4.4': [53, 443], '1.1.1.1': [53, 80, 443]
};

class AppEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.apps = this;
        const nm = sharedState.net;
        if (nm && nm.zone) for (const h of ['github.com', 'www.github.com', 'gitlab.com', 'pypi.org', 'registry.npmjs.org', 'dl.fedoraproject.org']) nm.zone[h] = Object.assign(nm.zone[h] || {}, { A: ['140.82.112.' + (3 + Object.keys(nm.zone).length % 200)] });
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
    _emit(text) { const io = this.parent._curIo; if (io && text) io.out(text); }
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
    _write(path, content, mode, owner) {
        const abs = this.fs.resolvePath(path);
        const parts = abs.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        const old = cur.children[name];
        const own = owner || (old ? old.owner : this.fs.currentUser);
        cur.children[name] = { type: 'file', permissions: mode || (old ? old.permissions : '0644'), owner: own, group: old ? old.group : own, size: content.length, modified: new Date(), content };
    }
    _mkdirp(path, mode) {
        let cur = this.fs.fs['/'];
        for (const p of this.fs.resolvePath(path).split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: mode || '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        return cur;
    }
    _hex(n) { let s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; }
    _b64(n) { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let s = ''; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * 64)]; return s; }
    _exec(cmdline, stdin) {
        const sh = this._sh();
        if (!sh) return { out: '', err: 'cannot run', rc: 127 };
        const out = [], err = [];
        const io = { stdin: { text: stdin || '', pos: 0 }, out: (s) => { if (s) out.push(s); }, err: (s) => { if (s) err.push(s); }, piped: true, hasStdin: !!stdin };
        const p = this.parent;
        const keep = { io: p._curIo, pipe: p._stdoutIsPipe, stdin: p._hasStdin };
        const wasI = sh.interactive;
        sh.interactive = false;
        let rc = 0;
        try { rc = sh.runScriptText(cmdline, 'bash', [], io); } finally { sh.interactive = wasI; p._curIo = keep.io; p._stdoutIsPipe = keep.pipe; p._hasStdin = keep.stdin; }
        return { out: out.join(''), err: err.join(''), rc };
    }

    // ===== availability =====
    _cmdGate(name) {
        const need = APP_PKG[name];
        if (!need) return true;
        const pk = this.shared.pkg;
        if (!pk || !pk.installed) return true;
        const list = Array.isArray(need) ? need : [need];
        if (!list.some(p => pk.installed[p])) return false;
        const e = pk.cat[list[0]];
        if (e) {
            const bin = e.files.find(f => f.endsWith('/' + name) && /\/s?bin\//.test(f));
            if (bin && !this.fs.getNode(bin) && pk.installed[list[0]]) return false;
        }
        return true;
    }

    installHooks(parent) {
        const self = this;
        parent._cmdGate = (name) => self._cmdGate(name);
        const svc = this.shared.svc;
        if (svc && svc._listeners) {
            const orig = svc._listeners.bind(svc);
            svc._listeners = () => {
                const own = [];
                for (const p of self.shared.processes) if (p.listen) own.push({ proto: p.listen.proto, addr: '0.0.0.0', port: p.listen.port, comm: p.comm, pid: p.pid });
                if (self.shared.ctrSession && self.shared.ctrSession.active) return own;
                return orig().concat(own);
            };
        }
    }

    // ===== network probing =====
    _resolve(host) {
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return { ip: host, canon: host };
        if (host === 'localhost') return { ip: '127.0.0.1', canon: 'localhost' };
        const nm = this.shared.net;
        const r = nm && nm._getaddr ? nm._getaddr(host) : { err: 'nxdomain' };
        return r.err ? { err: r.err } : { ip: r.ip, canon: r.canon || host };
    }

    _local(ip) {
        const nm = this.shared.net;
        return ip.startsWith('127.') || (nm && nm._myAddrs ? nm._myAddrs().includes(ip) : false);
    }

    _listeners() { const svc = this.shared.svc; return svc && svc._listeners ? svc._listeners() : []; }

    _probe(host, port, proto) {
        const r = this._resolve(host);
        if (r.err) return { state: 'unresolved' };
        const ip = r.ip;
        if (this._local(ip)) {
            const open = this._listeners().some(x => x.port === port && (x.proto || 'tcp') === (proto || 'tcp'));
            return { state: open ? 'open' : 'closed', ip, canon: r.canon };
        }
        const nm = this.shared.net;
        if (nm && nm._routeFor && !nm._routeFor(ip)) return { state: 'unreachable', ip, canon: r.canon };
        const ports = REMOTE_PORTS[ip];
        if (ports) return { state: ports.includes(port) && (proto || 'tcp') === 'tcp' ? 'open' : 'closed', ip, canon: r.canon };
        if (/^(10|172\.(1[6-9]|2\d|3[01])|192\.168)\./.test(ip)) return { state: 'timeout', ip, canon: r.canon };
        return { state: [80, 443].includes(port) ? 'open' : 'closed', ip, canon: r.canon };
    }

    _bindFail(port, proto, comm) {
        const python = comm === 'python3';
        if (port < 1024 && !this._isRoot()) return python ? 'PermissionError: [Errno 13] Permission denied' : `Ncat: bind to :::${port}: Permission denied. QUITTING.`;
        if (this._listeners().some(x => x.port === port && (x.proto || 'tcp') === proto)) return python ? 'OSError: [Errno 98] Address already in use' : `Ncat: bind to :::${port}: Address already in use. QUITTING.`;
        return null;
    }

    _serviceName(port, proto) { return SERVICE_NAMES[port] || (proto === 'udp' ? 'unknown' : 'unknown'); }

    // ===== tree =====
    tree(args) {
        const { o, rest } = this._flags(args, ['L', 'P', 'I', 'o']);
        const dirs = rest.length ? rest : ['.'];
        const maxDepth = o.L ? parseInt(o.L, 10) : Infinity;
        if (o.L && !(maxDepth > 0)) return this._err('tree: Invalid level, must be greater than 0.', 1);
        const globRe = (g) => new RegExp('^' + g.split('|').map(p => p.replace(/[.+^${}()\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')).join('$|^') + '$');
        const pRe = o.P ? globRe(o.P) : null, iRe = o.I ? globRe(o.I) : null;
        const lines = [];
        let nd = 0, nf = 0, code = 0;
        const hsize = (n) => { if (n < 1024) return String(n); const u = ['K', 'M', 'G']; let v = n / 1024, i = 0; while (v >= 1024 && i < 2) { v /= 1024; i++; } return (v < 10 ? v.toFixed(1) : Math.round(v)) + u[i]; };
        const info = (n, full) => {
            const parts = [];
            if (o.p) parts.push((n.type === 'directory' ? 'd' : n.type === 'symlink' ? 'l' : '-') + this._rwx(n.permissions));
            if (o.u) parts.push((n.owner || 'root').padEnd(8));
            if (o.g) parts.push((n.group || 'root').padEnd(8));
            if (o.s || o.h) parts.push(o.h ? hsize(n.size || 0).padStart(4) : String(n.size || 0).padStart(11));
            if (o.D) parts.push(this._fmt(n.modified ? new Date(n.modified) : this._now(), '%b %e %H:%M'));
            return parts.length ? '[' + parts.join(' ') + ']  ' : '';
        };
        const sortKids = (names, node) => {
            let list = names.slice();
            list.sort((a, b) => a.replace(/^\./, '').toLowerCase().localeCompare(b.replace(/^\./, '').toLowerCase(), 'en'));
            if (o.t) list.sort((a, b) => new Date(node.children[b].modified || 0) - new Date(node.children[a].modified || 0));
            if (o.r) list.reverse();
            if (o.dirsfirst) list = list.filter(n => node.children[n].type === 'directory').concat(list.filter(n => node.children[n].type !== 'directory'));
            return list;
        };
        const mark = (n) => (o.F ? (n.type === 'directory' ? '/' : n.type === 'symlink' ? '@' : /[1357]/.test((n.permissions || '0644').slice(-3)) ? '*' : '') : '');
        const walk = (node, path, prefix, depth) => {
            if (depth >= maxDepth) return;
            if (!this.fs.hasPermission(node, 'r')) { lines[lines.length - 1] += '  [error opening dir]'; return; }
            const names = Object.keys(node.children || {}).filter(n => (o.a || !n.startsWith('.')) && !(iRe && iRe.test(n)));
            const shown = sortKids(names.filter(n => {
                const c = node.children[n];
                if (o.d) return c.type === 'directory';
                if (pRe && c.type !== 'directory') return pRe.test(n);
                return true;
            }), node);
            shown.forEach((n, i) => {
                const c = node.children[n];
                const last = i === shown.length - 1;
                const full = (path === '/' ? '' : path) + '/' + n;
                const label = (o.f ? (o.i ? full : full) : n) + mark(c) + (c.type === 'symlink' ? ' -> ' + (c.target || '?') : '');
                const branch = o.i ? '' : (last ? '└── ' : '├── ');
                lines.push(prefix + branch + info(c) + label);
                if (c.type === 'directory') { nd++; walk(c, full, prefix + (o.i ? '' : (last ? '    ' : '│   ')), depth + 1); } else nf++;
            });
        };
        for (const d of dirs) {
            const abs = this.fs.resolvePath(d);
            const node = this.fs.getNode(abs);
            if (!node) { lines.push(`${d} [error opening dir]`); code = 2; continue; }
            if (node.type !== 'directory') { lines.push(d); nf++; continue; }
            lines.push(info(node) + d);
            walk(node, abs, '', 0);
        }
        if (!o.noreport) lines.push('', `${nd} director${nd === 1 ? 'y' : 'ies'}${o.d ? '' : `, ${nf} file${nf === 1 ? '' : 's'}`}`);
        return { stdout: lines.join('\n'), stderr: '', exitCode: code };
    }

    _rwx(mode) {
        const m = String(mode || '0644').slice(-3);
        return m.split('').map(d => { const n = parseInt(d, 10); return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-'); }).join('');
    }

    // ===== nc / ncat / telnet =====
    _nc(name, args, stdin) {
        const { o, rest } = this._flags(args, ['p', 'w', 'i', 's', 'e', 'c', 'm', 'g', 'G', 'q', 'T', 'x', 'X']);
        const verbose = !!o.v;
        const proto = o.u ? 'udp' : 'tcp';
        const ver = 'Ncat: Version 7.92 ( https://nmap.org/ncat )';
        if (o.l) {
            return this._err(`${name}: listening needs the terminal; run it in the background (${name} -l 8080 &) so you can connect to it`, 1);
        }
        if (rest.length < 2 && !(rest.length === 1 && o.p)) {
            if (!rest.length) return this._err('Ncat: You must specify a host to connect to. QUITTING.', 1);
        }
        const host = rest[0];
        const portArg = rest[1];
        if (!portArg) return this._err('Ncat: Could not resolve hostname "' + host + '": Name or service not known. QUITTING.', 1);
        const ports = [];
        const m = /^(\d+)(?:-(\d+))?$/.exec(portArg);
        if (m) { const a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a; for (let p = a; p <= b && ports.length < 1024; p++) ports.push(p); }
        else {
            const found = Object.entries(SERVICE_NAMES).find(([, n]) => n === portArg);
            if (!found) return this._err(`Ncat: Invalid port number "${portArg}". QUITTING.`, 1);
            ports.push(parseInt(found[0], 10));
        }
        const out = [], errs = [];
        if (verbose) errs.push(ver);
        let code = 1, data = '';
        for (const port of ports) {
            const r = this._probe(host, port, proto);
            if (r.state === 'unresolved') { errs.push(`Ncat: Could not resolve hostname "${host}": Name or service not known. QUITTING.`); return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: 1 }; }
            const ipShown = r.ip || host;
            if (r.state === 'open' || (proto === 'udp' && r.state === 'closed' && o.z === undefined)) {
                code = 0;
                if (verbose) errs.push(`Ncat: Connected to ${ipShown}:${port}.`);
                if (o.z && verbose) errs.push('Ncat: 0 bytes sent, 0 bytes received in 0.01 seconds.');
                if (!o.z) data += this._serviceReply(host, port, stdin);
            } else if (r.state === 'closed') {
                errs.push(`Ncat: Connection refused.`);
            } else if (r.state === 'unreachable') {
                errs.push('Ncat: Network is unreachable.');
            } else {
                errs.push('Ncat: Connection timed out.');
            }
        }
        return { stdout: data, rawStdout: data, stderr: errs.join('\n'), exitCode: ports.length === 1 ? code : (errs.some(e => /Connected/.test(e)) ? 0 : 1) };
    }

    // what a service answers when something connects and sends `stdin`
    _serviceReply(host, port, stdin) {
        if (port === 22) return 'SSH-2.0-OpenSSH_8.7\n';
        if (port === 25) return `220 ${this.parent.hostname} ESMTP Postfix\n`;
        if (port === 21) return '220 (vsFTPd 3.0.5)\n';
        if ([80, 8080, 8000, 443, 8443].includes(port) && /GET|HEAD|HTTP/.test(stdin || '')) {
            const scheme = port === 443 || port === 8443 ? 'https' : 'http';
            const r = this.parent.curl ? this.parent.curl(['-si', `${scheme}://${host}:${port}/`]) : null;
            if (r && r.stdout) return r.stdout.replace(/\r?\n/g, '\r\n') + '\n';
        }
        return '';
    }

    nc(args, stdin) { return this._nc('nc', args, stdin); }
    ncat(args, stdin) { return this._nc('ncat', args, stdin); }

    telnet(args) {
        const { rest } = this._flags(args);
        if (!rest.length) return this._ok('telnet> ');
        const host = rest[0], port = parseInt(rest[1] || '23', 10);
        if (Number.isNaN(port)) return this._err(`${rest[1]}: bad port`, 1);
        const r = this._probe(host, port, 'tcp');
        if (r.state === 'unresolved') return this._err(`${host}: Name or service not known`, 1);
        const lines = [`Trying ${r.ip}...`];
        if (r.state === 'open') {
            lines.push(`Connected to ${host}.`, "Escape character is '^]'.");
            const banner = this._serviceReply(host, port, '').replace(/\n$/, '');
            if (banner) lines.push(banner);
            lines.push('Connection closed by foreign host.');
            return { stdout: lines.join('\n'), stderr: '', exitCode: 1 };
        }
        if (r.state === 'closed') return { stdout: lines.join('\n'), stderr: `telnet: connect to address ${r.ip}: Connection refused`, exitCode: 1 };
        if (r.state === 'unreachable') return { stdout: lines.join('\n'), stderr: `telnet: connect to address ${r.ip}: Network is unreachable`, exitCode: 1 };
        return { stdout: lines.join('\n'), stderr: `telnet: connect to address ${r.ip}: Connection timed out`, exitCode: 1 };
    }

    // ===== nmap =====
    nmap(args) {
        const o = {}, targets = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-p') { o.p = args[++i]; continue; }
            if (/^-p\S/.test(a)) { o.p = a.slice(2); continue; }
            if (['-e', '-oN', '-oX', '-oG', '-iL', '--max-retries', '-S', '-g'].includes(a)) { i++; continue; }
            if (/^-T\d$/.test(a) || /^--/.test(a) && a !== '--version') continue;
            if (a === '--version') { o.V = true; continue; }
            if (a.startsWith('-')) { o[a.slice(1)] = true; continue; }
            targets.push(a);
        }
        if (o.V || o.version) return this._ok('Nmap version 7.92 ( https://nmap.org )\nPlatform: x86_64-redhat-linux-gnu\nCompiled with: nmap-liblua-5.3.5 openssl-3.0.7 libz-1.2.11 libpcre-8.44 libpcap-1.10.0 nmap-libdnet-1.12 ipv6\nCompiled without:\nAvailable nsock engines: epoll poll select');
        if (!targets.length) return this._ok('Nmap 7.92 ( https://nmap.org )\nUsage: nmap [Scan Type(s)] [Options] {target specification}\nTARGET SPECIFICATION:\n  Can pass hostnames, IP addresses, networks, etc.\n  Ex: scanme.nmap.org, microsoft.com/24, 192.168.0.1; 10.0.0-255.1-254\nHOST DISCOVERY:\n  -sL: List Scan - simply list targets to scan\n  -sn: Ping Scan - disable port scan\n  -Pn: Treat all hosts as online -- skip host discovery\nSEE THE MAN PAGE (https://nmap.org/book/man.html) FOR MORE OPTIONS AND EXAMPLES');
        const stamp = this._fmt(this._now(), '%Y-%m-%d %H:%M %Z');
        const out = [`Starting Nmap 7.92 ( https://nmap.org ) at ${stamp}`];
        let up = 0, total = 0;
        const rootScan = this._isRoot();
        const wanted = [];
        if (o.p) for (const part of String(o.p).split(',')) { const m = /^(\d+)(?:-(\d+))?$/.exec(part); if (m) { const a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : a; for (let p = a; p <= b; p++) wanted.push(p); } }
        for (const t of targets) {
            const cidr = /^(\d+\.\d+\.\d+)\.0\/24$/.exec(t);
            const hosts = cidr ? [`${cidr[1]}.1`, `${cidr[1]}.100`, `${cidr[1]}.101`, `${cidr[1]}.120`, `${cidr[1]}.254`] : [t];
            if (cidr) total += 256;
            for (const h of hosts) {
                const r = this._resolve(h);
                if (r.err) { out.push(`Failed to resolve "${h}".`); continue; }
                if (!cidr) total += 1;
                const nm = this.shared.net;
                const local = this._local(r.ip);
                const reach = local || (nm && nm._routeFor ? !!nm._routeFor(r.ip) : true);
                const known = local || REMOTE_PORTS[r.ip];
                if (!reach || (!known && !o.Pn)) {
                    if (cidr) continue;
                    out.push('Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn');
                    continue;
                }
                up++;
                if (o.sn) { out.push(`Nmap scan report for ${r.canon && r.canon !== r.ip ? r.canon + ' (' + r.ip + ')' : r.ip}`, `Host is up (0.00${Math.floor(Math.random() * 90 + 10)}s latency).`); continue; }
                const openPorts = local ? Array.from(new Set(this._listeners().filter(x => (x.proto || 'tcp') === 'tcp').map(x => x.port))).sort((a, b) => a - b) : (REMOTE_PORTS[r.ip] || []).slice();
                const scanned = wanted.length ? wanted : null;
                const shown = scanned ? scanned.filter(p => openPorts.includes(p)) : openPorts;
                const n = scanned ? scanned.length : (o.F ? 100 : 1000);
                const closed = n - shown.length;
                out.push(`Nmap scan report for ${r.canon && r.canon !== r.ip ? r.canon + ' (' + r.ip + ')' : r.ip}`);
                out.push(`Host is up (${local ? '0.000' + Math.floor(Math.random() * 90 + 10) : '0.00' + Math.floor(Math.random() * 80 + 10)}s latency).`);
                if (r.canon === 'localhost') out.push('Other addresses for localhost (not scanned): ::1');
                if (closed > 0) out.push(`Not shown: ${closed} closed tcp port${closed === 1 ? '' : 's'} (${rootScan ? 'reset' : 'conn-refused'})`);
                if (shown.length) {
                    const ver = (p) => {
                        if (p === 22) return 'OpenSSH 8.7 (protocol 2.0)';
                        if (p === 80 || p === 8080) { const S = this.shared.services; return S.nginx && S.nginx.active ? 'nginx 1.20.1' : 'Apache httpd 2.4.57 ((Red Hat Enterprise Linux))'; }
                        if (p === 443) return 'Apache httpd 2.4.57 ((Red Hat Enterprise Linux))';
                        if (p === 111) return '2-4 (RPC #100000)';
                        if (p === 2049) return '3-4 (RPC #100003)';
                        if (p === 3306) return 'MariaDB 10.5.22';
                        if (p === 9090) return 'Cockpit web service 311 or earlier';
                        return '';
                    };
                    const w = Math.max(...shown.map(p => `${p}/tcp`.length), 4);
                    const sw = Math.max(...shown.map(p => this._serviceName(p, 'tcp').length), 7);
                    out.push(`${'PORT'.padEnd(w)} STATE ${o.sV || o.A ? 'SERVICE'.padEnd(sw) + ' VERSION' : 'SERVICE'}`);
                    for (const p of shown) out.push(`${(p + '/tcp').padEnd(w)} open  ${o.sV || o.A ? this._serviceName(p, 'tcp').padEnd(sw) + ' ' + ver(p) : this._serviceName(p, 'tcp')}`.replace(/\s+$/, ''));
                } else if (!closed) out.push('All scanned ports are filtered');
                if (o.sV || o.A) out.push('', 'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .');
            }
        }
        if (!up && !targets.some(t => this._resolve(t).err)) out.push('Nmap done: ' + total + ' IP address' + (total === 1 ? '' : 'es') + ' (0 hosts up) scanned in ' + (Math.random() * 3 + 1).toFixed(2) + ' seconds');
        else out.push(`\nNmap done: ${total || 1} IP address${total === 1 ? '' : 'es'} (${up} host${up === 1 ? '' : 's'} up) scanned in ${(Math.random() * 0.4 + 0.05).toFixed(2)} seconds`);
        return this._ok(out.join('\n'));
    }

    // ===== tcpdump =====
    tcpdump(args) {
        const { o, rest } = this._flags(args, ['i', 'c', 'w', 'r', 's', 'F', 'W', 'C', 'G', 'z']);
        if (o.version) return this._ok('tcpdump version 4.99.0\nlibpcap version 1.10.0 (with TPACKET_V3)\nOpenSSL 3.0.7 1 Nov 2022');
        if (o.D) return this._ok('1.eth0 [Up, Running, Connected]\n2.any (Pseudo-device that captures on all interfaces) [Up, Running]\n3.lo [Up, Running, Loopback]\n4.eth1 [Up, Disconnected]\n5.nflog (Linux netfilter log (NFLOG) interface) [none]\n6.nfqueue (Linux netfilter queue (NFQUEUE) interface) [none]\n7.usbmon1 (USB bus number 1)');
        if (o.r) {
            const n = this.fs.getNode(this.fs.resolvePath(o.r));
            if (!n) return this._err(`tcpdump: ${o.r}: No such file or directory`, 1);
            const body = (n.content || '').replace(/^#PCAP\n/, '');
            if (!(n.content || '').startsWith('#PCAP\n')) return this._err(`tcpdump: ${o.r}: truncated dump file; tried to read 4 file header bytes, only got 0`, 1);
            return this._ok(`reading from file ${o.r}, link-type EN10MB (Ethernet), snapshot length 262144\n${body}`.replace(/\n$/, ''));
        }
        if (!this._isRoot()) return this._err(`tcpdump: ${o.i || 'eth0'}: You don't have permission to perform this capture on that device\n(socket: Operation not permitted)`, 1);
        const iface = o.i || 'eth0';
        if (!['eth0', 'eth1', 'lo', 'any'].includes(iface)) return this._err(`tcpdump: ${iface}: No such device exists\n(SIOCGIFHWADDR: No such device)`, 1);
        if (iface === 'eth1') return this._err('tcpdump: eth1: That device is not up', 1);
        const filter = rest.join(' ');
        const count = o.c ? parseInt(o.c, 10) : 0;
        const pkts = this._synthPackets(filter, !!o.n, count || 6, o.tt || o.t);
        const hdr = `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode\nlistening on ${iface}, link-type ${iface === 'lo' ? 'EN10MB (Ethernet)' : 'EN10MB (Ethernet)'}, snapshot length 262144 bytes`;
        const summary = (n) => `${n} packets captured\n${n} packets received by filter\n0 packets dropped by kernel`;
        if (o.w) {
            this._write(o.w, '#PCAP\n' + pkts.join('\n') + '\n', '0644', 'tcpdump');
            if (count) return { chunks: [{ k: 'o', s: `${hdr}\n${summary(count)}\n` }], exitCode: 0 };
        }
        if (count) return { chunks: [{ k: 'o', s: hdr + '\n' }, { k: 'o', s: pkts.join('\n') + '\n' }, { k: 'o', s: summary(count) + '\n' }], exitCode: 0 };
        // no -c: keep capturing until Ctrl+C
        this._emit(hdr + '\n' + pkts.join('\n') + '\n');
        const sh = this._sh();
        const n = pkts.length;
        if (sh) sh.takeInput({ mode: 'fgjob', prompt: '', ms: 0, onCancel: () => summary(n) });
        return this._ok('');
    }

    _synthPackets(filter, numeric, n, tsMode) {
        const now = this._now();
        const me = (this.shared.net && this.shared.net._myAddrs ? this.shared.net._myAddrs().find(a => /^\d+\.\d+\.\d+\.\d+$/.test(a) && !a.startsWith('127.')) : null) || '192.168.1.100';
        const peer = '192.168.1.10';
        const host = this.parent.hostname;
        const portM = /port\s+(\d+)/.exec(filter);
        const icmp = /\bicmp\b/.test(filter);
        const udpDns = /\b(udp|port 53|dns|domain)\b/.test(filter) && /53/.test(filter + ' 53');
        const hostM = /host\s+(\S+)/.exec(filter);
        const other = hostM ? this._resolve(hostM[1]).ip || hostM[1] : peer;
        const name = (p) => (numeric ? p : (SERVICE_NAMES[p] || p));
        const out = [];
        const stamp = (i) => {
            const d = new Date(now.getTime() + i * 37);
            return this._fmt(d, '%H:%M:%S') + '.' + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        };
        let seq = 1000 + Math.floor(Math.random() * 100000), ack = 1;
        for (let i = 0; out.length < n; i++) {
            const t = stamp(i);
            if (icmp) {
                const id = 4213, s = Math.floor(i / 2) + 1;
                if (i % 2 === 0) out.push(`${t} IP ${other} > ${me}: ICMP echo request, id ${id}, seq ${s}, length 64`);
                else out.push(`${t} IP ${me} > ${other}: ICMP echo reply, id ${id}, seq ${s}, length 64`);
            } else if (/^\s*(udp\s+port|port)\s+53\b/.test(filter) && !portM || (portM && portM[1] === '53')) {
                const id = 21000 + i;
                if (i % 2 === 0) out.push(`${t} IP ${me}.${40000 + i} > 8.8.8.8.${name(53)}: ${id}+ A? www.example.com. (33)`);
                else out.push(`${t} IP 8.8.8.8.${name(53)} > ${me}.${40000 + i - 1}: ${id - 1} 1/0/1 A 93.184.216.34 (49)`);
            } else {
                const port = portM ? parseInt(portM[1], 10) : 22;
                const cport = 51000 + (i >> 2);
                const proto = name(port);
                if (i % 3 === 0) { out.push(`${t} IP ${me}.${proto} > ${other}.${cport}: Flags [P.], seq ${seq}:${seq + 148}, ack ${ack}, win 501, length 148`); seq += 148; }
                else if (i % 3 === 1) { out.push(`${t} IP ${other}.${cport} > ${me}.${proto}: Flags [.], ack ${seq}, win 4096, length 0`); }
                else { out.push(`${t} IP ${other}.${cport} > ${me}.${proto}: Flags [P.], seq ${ack}:${ack + 36}, ack ${seq}, win 4096, length 36`); ack += 36; }
            }
        }
        return out.slice(0, n);
    }

    // ===== strace =====
    strace(args) {
        const { o, rest } = this._flags(args, ['e', 'o', 'p', 's', 'u', 'E', 'P']);
        if (o.V || o.version) return this._ok('strace -- version 5.18');
        if (o.p) {
            const pid = parseInt(o.p, 10);
            const p = this.shared.processes.find(x => x.pid === pid);
            if (!p) return this._err(`strace: attach: ptrace(PTRACE_SEIZE, ${pid}): No such process`, 1);
            if (!this._isRoot() && p.user !== this.fs.currentUser) return this._err(`strace: attach: ptrace(PTRACE_SEIZE, ${pid}): Operation not permitted`, 1);
            this._emit(`strace: Process ${pid} attached\nepoll_wait(4, `);
            const sh = this._sh();
            if (sh) sh.takeInput({ mode: 'fgjob', prompt: '', ms: 0, onCancel: () => `strace: Process ${pid} detached\n <detached ...>` });
            return this._ok('');
        }
        if (!rest.length) return this._err('strace: must have PROG [ARGS] or -p PID\nTry \'strace -h\' for more information.', 1);
        const cmd = rest[0];
        const r = this._exec(rest.map(a => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${a.replace(/'/g, "'\\''")}'`)).join(' '), '');
        const base = cmd.split('/').pop();
        const path = cmd.includes('/') ? cmd : ['/usr/bin/', '/usr/sbin/', '/bin/'].map(d => d + cmd).find(p => this.fs.getNode(p)) || '/usr/bin/' + cmd;
        if (r.rc === 127 && /command not found/.test(r.err)) return this._err(`strace: Can't stat '${cmd}': No such file or directory`, 1);
        const addr = () => '0x' + (0x55d0c0000000 + Math.floor(Math.random() * 0xfffff) * 4096).toString(16);
        const t = [];
        t.push(`execve("${path}", [${rest.map(a => JSON.stringify(a)).join(', ')}], 0x7ffd${this._hex(8)} /* 24 vars */) = 0`);
        t.push(`brk(NULL)                               = ${addr()}`);
        t.push('arch_prctl(0x3001 /* ARCH_??? */, 0x7ffd' + this._hex(8) + ') = -1 EINVAL (Invalid argument)');
        t.push('mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f' + this._hex(10));
        t.push('access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)');
        t.push('openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3');
        t.push('newfstatat(3, "", {st_mode=S_IFREG|0644, st_size=24731, ...}, AT_EMPTY_PATH) = 0');
        t.push('close(3)                                = 0');
        t.push('openat(AT_FDCWD, "/lib64/libc.so.6", O_RDONLY|O_CLOEXEC) = 3');
        t.push('read(3, "\\177ELF\\2\\1\\1\\3\\0\\0\\0\\0\\0\\0\\0\\0\\3\\0>\\0\\1\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0"..., 832) = 832');
        t.push('close(3)                                = 0');
        const target = rest.slice(1).filter(a => !a.startsWith('-'))[0];
        if (base === 'cat' || base === 'head' || base === 'tail' || base === 'wc' || base === 'grep') {
            if (target) {
                const ok = !!this.fs.getNode(this.fs.resolvePath(target));
                t.push(`openat(AT_FDCWD, "${target}", O_RDONLY) = ${ok ? 3 : '-1 ENOENT (No such file or directory)'}`);
                if (ok) { t.push(`read(3, ${JSON.stringify(r.out.slice(0, 32))}..., 131072) = ${r.out.length}`, `write(1, ${JSON.stringify(r.out.slice(0, 32))}..., ${r.out.length}) = ${r.out.length}`, 'read(3, "", 131072)                     = 0', 'close(3)                                = 0'); }
                else t.push(`write(2, ${JSON.stringify(r.err.slice(0, 40))}..., ${r.err.length}) = ${r.err.length}`);
            }
        } else if (base === 'ls') {
            t.push(`openat(AT_FDCWD, "${target || '.'}", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3`, 'getdents64(3, 0x55d0c0a4a4a0 /* 5 entries */, 32768) = 144', 'getdents64(3, 0x55d0c0a4a4a0 /* 0 entries */, 32768) = 0', 'close(3)                                = 0', `write(1, ${JSON.stringify(r.out.slice(0, 32))}..., ${r.out.length}) = ${r.out.length}`);
        } else if (r.out) {
            t.push(`write(1, ${JSON.stringify(r.out.slice(0, 40))}${r.out.length > 40 ? '...' : ''}, ${r.out.length}) = ${r.out.length}`);
        }
        t.push('close(1)                                = 0', 'close(2)                                = 0', `exit_group(${r.rc})                           = ?`, `+++ exited with ${r.rc} +++`);
        let trace = t.join('\n');
        if (o.c) {
            trace = '% time     seconds  usecs/call     calls    errors syscall\n------ ----------- ----------- --------- --------- ----------------\n 38.46    0.000050          12         4           mmap\n 23.08    0.000030           7         4           close\n 15.38    0.000020           5         4         1 openat\n 15.38    0.000020          20         1           execve\n  7.70    0.000010           5         2           read\n------ ----------- ----------- --------- --------- ----------------\n100.00    0.000130           6        15         1 total';
        }
        if (o.o) { this._write(o.o, trace + '\n'); return { stdout: r.out, stderr: r.err, exitCode: r.rc }; }
        return { stdout: r.out, stderr: [r.err.replace(/\n$/, ''), trace].filter(Boolean).join('\n'), exitCode: r.rc };
    }

    // ===== fuser =====
    fuser(args) {
        const { o, rest } = this._flags(args, ['n', 'k']);
        if (o.l) return this._ok(' HUP INT QUIT ILL TRAP ABRT BUS FPE KILL USR1 SEGV USR2 PIPE ALRM TERM STKFLT\n CHLD CONT STOP TSTP TTIN TTOU URG XCPU XFSZ VTALRM PROF WINCH POLL PWR SYS');
        if (!rest.length) return this._err('Usage: fuser [-fIMuvw] [-a|-s] [-4|-6] [-c|-m|-n SPACE]\n             [-k [-i] [-SIGNAL]] NAME...\n       fuser -l\n       fuser -V\nShow which processes use the named files, sockets, or filesystems.', 1);
        const out = [], errs = [];
        const verbose = o.v;
        const rows = [];
        let any = false;
        for (const t of rest) {
            const pm = /^(\d+)\/(tcp|udp)$/.exec(t) || (o.n && /^\d+$/.test(t) ? [t, t, o.n] : null);
            let pids = [];
            if (pm) {
                const port = parseInt(pm[1], 10), proto = pm[2];
                pids = this._listeners().filter(x => x.port === port && (x.proto || 'tcp') === proto).map(x => ({ pid: x.pid, access: 'F....', comm: x.comm })).filter((x, i, a) => a.findIndex(y => y.pid === x.pid) === i);
            } else {
                const abs = this.fs.resolvePath(t);
                const node = this.fs.getNode(abs);
                if (!node) { errs.push(`${t}: No such file or directory`); continue; }
                const cwd = this.fs.currentPath;
                const sessionPid = this.shared.ctrSession && this.shared.ctrSession.active ? this.shared.ctrSession.shellPid : 1201;
                if (cwd === abs || (o.m && cwd.startsWith(abs.replace(/\/$/, '') + '/'))) pids.push({ pid: sessionPid, access: '..c..', comm: 'bash' });
                for (const p of this.shared.processes) if (p.cwd === abs) pids.push({ pid: p.pid, access: '..c..', comm: p.comm });
            }
            const label = pm ? `${pm[1]}/${pm[2]}:` : `${t}:`;
            if (pids.length) any = true;
            if (verbose) {
                for (const x of pids) { const pr = this.shared.processes.find(p => p.pid === x.pid); rows.push(`${label.padEnd(20)} ${(pr ? pr.user : 'root').padEnd(10)} ${String(x.pid).padStart(5)} ${x.access} ${x.comm}`); }
            } else if (pids.length) {
                out.push(`${label.padEnd(20)}${pids.map(x => String(x.pid).padStart(6) + (o.m || !pm ? x.access.replace(/\./g, '').toLowerCase() : '')).join('')}`.replace(/\s+$/, ''));
            }
            if (o.k) for (const x of pids) { if (x.pid !== 1201 && this.parent._signalPid) this.parent._signalPid(x.pid, 9, errs, false); }
        }
        if (verbose && rows.length) out.push('                     USER        PID ACCESS COMMAND', ...rows);
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: any && !errs.length ? 0 : 1 };
    }

    // ===== sysstat / iotop =====
    mpstat(args) {
        const { o, rest } = this._flags(args, ['P', 'o']);
        const interval = rest[0] ? parseInt(rest[0], 10) : 0;
        const count = rest[1] ? parseInt(rest[1], 10) : (interval ? 1 : 1);
        const d = this._now();
        const date = this._fmt(d, '%m/%d/%Y');
        const head = `Linux 5.14.0-362.8.1.el9_3.x86_64 (${this.parent.hostname}) \t${date} \t_x86_64_\t(2 CPU)\n`;
        const cols = ['%usr', '%nice', '%sys', '%iowait', '%irq', '%soft', '%steal', '%guest', '%gnice', '%idle'].map(h => h.padStart(8)).join('');
        const vals = () => { const idle = 97 + Math.random() * 2.5; const busy = 100 - idle; return [busy * 0.5, 0, busy * 0.4, Math.random() * 0.1, 0, Math.random() * 0.05, 0, 0, 0, idle].map(v => v.toFixed(2).padStart(8)).join(''); };
        const row = (cpu, prefix) => `${prefix}${String(cpu).padEnd(3)}${vals()}`;
        const out = [head];
        const cpus = o.P === 'ALL' ? ['all', 0, 1] : (o.P !== undefined ? [o.P] : ['all']);
        out.push(`${this._fmt(d, '%I:%M:%S %p')}  CPU${cols}`);
        for (let i = 0; i < Math.max(1, count); i++) for (const c of cpus) out.push(row(c, this._fmt(new Date(d.getTime() + i * 1000), '%I:%M:%S %p') + '  '));
        if (count > 1) { out.push(''); out.push(`Average:     CPU${cols}`); for (const c of cpus) out.push(row(c, 'Average:     ')); }
        return this._ok(out.join('\n'));
    }

    iotop(args) {
        if (!this._isRoot()) return this._err('Netlink error: Operation not permitted (1). The kernel needs to be compiled with CONFIG_TASK_DELAY_ACCT, CONFIG_TASKSTATS and CONFIG_TASK_IO_ACCOUNTING and the process needs CAP_NET_ADMIN.', 1);
        const lines = ['Total DISK READ :       0.00 B/s | Total DISK WRITE :       7.72 K/s', 'Actual DISK READ:       0.00 B/s | Actual DISK WRITE:       3.86 K/s', '    TID  PRIO  USER     DISK READ DISK WRITE>    COMMAND'];
        const procs = this.shared.processes.filter(p => !/^\[.*\]$/.test(p.command)).slice(0, 8);
        procs.forEach((p, i) => lines.push(`${String(p.pid).padStart(7)} be/4 ${p.user.padEnd(8)}  0.00 B/s    ${i === 0 ? '3.86 K/s' : '0.00 B/s'} ${p.command}`));
        return this._ok(lines.join('\n'));
    }

    // ===== hardware listings =====
    lspci(args) {
        const { o } = this._flags(args);
        const dev = [
            ['00:00.0', 'Host bridge', 'Intel Corporation 440FX - 82441FX PMC [Natoma] (rev 02)', '8086:1237', null],
            ['00:01.0', 'ISA bridge', 'Intel Corporation 82371SB PIIX3 ISA [Natoma/Triton II]', '8086:7000', null],
            ['00:01.1', 'IDE interface', 'Intel Corporation 82371SB PIIX3 IDE [Natoma/Triton II]', '8086:7010', 'ata_piix'],
            ['00:01.3', 'Bridge', 'Intel Corporation 82371AB/EB/MB PIIX4 ACPI (rev 03)', '8086:7113', 'piix4_smbus'],
            ['00:02.0', 'VGA compatible controller', 'Red Hat, Inc. Virtio 1.0 GPU (rev 01)', '1af4:1050', 'virtio-pci'],
            ['00:03.0', 'Ethernet controller', 'Red Hat, Inc. Virtio network device', '1af4:1000', 'virtio-pci'],
            ['00:04.0', 'SCSI storage controller', 'Red Hat, Inc. Virtio block device', '1af4:1001', 'virtio-pci'],
            ['00:05.0', 'Unclassified device [00ff]', 'Red Hat, Inc. Virtio memory balloon', '1af4:1002', 'virtio-pci']
        ];
        const out = [];
        for (const [slot, cls, name, id, drv] of dev) {
            out.push(`${slot} ${cls}${o.nn ? ' [' + id.split(':')[0] + ']' : ''}: ${name}${o.nn ? ' [' + id + ']' : ''}`);
            if (o.v || o.k) { if (o.v) out.push(`\tSubsystem: Red Hat, Inc. Device 1100`, `\tPhysical Slot: ${parseInt(slot.slice(3, 5), 16)}`, `\tFlags: bus master, fast devsel, latency 0`); if (drv) out.push(`\tKernel driver in use: ${drv}`, `\tKernel modules: ${drv}`); if (o.v) out.push(''); }
        }
        return this._ok(out.join('\n'));
    }

    lsusb() {
        return this._ok('Bus 001 Device 002: ID 0627:0001 Adomax Technology Co., Ltd QEMU USB Tablet\nBus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\nBus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub');
    }

    lsscsi() {
        return this._ok('[0:0:0:0]    disk    QEMU     QEMU HARDDISK    2.5+  /dev/sda\n[1:0:0:0]    cd/dvd  QEMU     QEMU DVD-ROM     2.5+  /dev/sr0');
    }

    hdparm(args) {
        const { o, rest } = this._flags(args);
        const dev = rest[0];
        if (!dev) return this._err('Usage:  hdparm  [options] [device ...]', 1);
        if (!this.fs.getNode(dev)) return this._err(`${dev}: No such file or directory`, 2);
        if (!this._isRoot()) return this._err(`${dev}: Permission denied`, 1);
        if (o.t || o.T) return this._ok(`\n${dev}:\n${o.T ? ' Timing cached reads:   16230 MB in  1.99 seconds = 8157.76 MB/sec\n' : ''}${o.t ? ' Timing buffered disk reads: 1788 MB in  3.00 seconds = 595.87 MB/sec' : ''}`.replace(/\n$/, ''));
        if (o.I) return this._ok(`\n${dev}:\nSG_IO: bad/missing sense data, sb[]:  70 00 05 00 00 00 00 0a 00 00 00 00 20 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00\n\nATA device, with non-removable media\n\tModel Number:       QEMU HARDDISK\n\tFirmware Revision:  2.5+\nStandards:\n\tUsed: ATA/ATAPI-7 T13 1532D revision 4a\nCapabilities:\n\tLBA, IORDY(can be disabled)\n\tQueue depth: 32`);
        return this._ok(`\n${dev}:\n multcount     =  0 (off)\n IO_support    =  1 (32-bit)\n readonly      =  0 (off)\n readahead     = 256 (on)\n geometry      = 13054/255/63, sectors = 209715200, start = 0`);
    }

    smartctl(args) {
        const { o, rest } = this._flags(args);
        if (o.version || o.V) return this._ok('smartctl 7.2 2020-12-30 r5155 [x86_64-linux-5.14.0-362.8.1.el9_3.x86_64] (local build)\nCopyright (C) 2002-20, Bruce Allen, Christian Franke, www.smartmontools.org');
        const dev = rest[0];
        if (!dev) return this._err('smartctl 7.2 2020-12-30 r5155 [x86_64-linux-5.14.0-362.8.1.el9_3.x86_64] (local build)\nCopyright (C) 2002-20, Bruce Allen, Christian Franke, www.smartmontools.org\n\nUsage: smartctl [options] device\n\n=======> ERROR: no device specified', 1);
        if (!this._isRoot()) return this._err(`Smartctl open device: ${dev} failed: Permission denied`, 2);
        if (!this.fs.getNode(dev)) return this._err(`Smartctl open device: ${dev} failed: No such device`, 2);
        return this._ok(`smartctl 7.2 2020-12-30 r5155 [x86_64-linux-5.14.0-362.8.1.el9_3.x86_64] (local build)\nCopyright (C) 2002-20, Bruce Allen, Christian Franke, www.smartmontools.org\n\n=== START OF INFORMATION SECTION ===\nModel Family:     QEMU\nDevice Model:     QEMU HARDDISK\nFirmware Version: 2.5+\nUser Capacity:    107,374,182,400 bytes [107 GB]\nSector Size:      512 bytes logical/physical\nSMART support is: Unavailable - device lacks SMART capability.`);
    }

    // ===== ssh-keygen / ssh-agent =====
    _fingerprint(blob) {
        const hex = UTIL_HASH.sha256(UTIL_HASH.utf8(blob));
        const bytes = hex.match(/../g).map(h => parseInt(h, 16));
        let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
        return { b64: btoa(bin).replace(/=+$/, ''), bytes };
    }

    _randomart(bytes, label) {
        const W = 17, H = 9, chars = ' .o+=*BOX@%&#/^SE';
        const field = Array.from({ length: H }, () => new Array(W).fill(0));
        let x = 8, y = 4;
        for (const b of bytes) for (let s = 0; s < 8; s += 2) {
            const d = (b >> s) & 3;
            x = Math.max(0, Math.min(W - 1, x + (d & 1 ? 1 : -1)));
            y = Math.max(0, Math.min(H - 1, y + (d & 2 ? 1 : -1)));
            field[y][x] = Math.min(field[y][x] + 1, 14);
        }
        field[4][8] = 15; field[y][x] = 16;
        const tag = `[${label}]`;
        const padTotal = Math.max(0, W - tag.length);
        const left = Math.floor(padTotal / 2);
        const top = '+' + '-'.repeat(left) + tag + '-'.repeat(padTotal - left) + '+';
        const rows = field.map(r => '|' + r.map(v => chars[v]).join('') + '|');
        return [top, ...rows, '+----[SHA256]-----+'].join('\n');
    }

    'ssh-keygen'(args) {
        const { o, rest } = this._flags(args, ['t', 'b', 'f', 'N', 'C', 'R', 'E', 'm', 'O', 'a']);
        const home = (this.fs.users[this.fs.currentUser] || {}).home || '/root';
        const typeMap = { rsa: 'RSA', ed25519: 'ED25519', ecdsa: 'ECDSA', dsa: 'DSA' };
        if (o.R) {
            const kh = this.fs.getNode(home + '/.ssh/known_hosts');
            if (!kh) return this._err(`${home}/.ssh/known_hosts not found.`, 1);
            const lines = (kh.content || '').split('\n');
            const keep = lines.filter(l => !(l.trim() && l.split(/[ ,]/)[0].replace(/^\[|\]:\d+$/g, '') === o.R));
            if (keep.length === lines.length) return this._ok(`Host ${o.R} not found in ${home}/.ssh/known_hosts`);
            this._write(home + '/.ssh/known_hosts.old', kh.content);
            this._write(home + '/.ssh/known_hosts', keep.join('\n'));
            return this._ok(`# Host ${o.R} found: line 1\n${home}/.ssh/known_hosts updated.\nOriginal contents retained as ${home}/.ssh/known_hosts.old`);
        }
        if (o.A) {
            if (!this._isRoot()) return this._err('ssh-keygen: could not open /etc/ssh/ssh_host_rsa_key: Permission denied', 1);
            const made = [];
            for (const [t, label] of [['rsa', 'RSA'], ['ecdsa', 'ECDSA'], ['ed25519', 'ED25519']]) {
                const p = `/etc/ssh/ssh_host_${t}_key`;
                if (!this.fs.getNode(p)) { this._keyFiles(p, t, 3072, 'root@' + this.parent.hostname, '0640'); made.push(label); }
            }
            return this._ok(made.length ? `ssh-keygen: generating new host keys: ${made.join(' ')} ` : '');
        }
        if (o.l || o.y) {
            let f = o.f;
            if (!f) return this._err('ssh-keygen: ' + (o.l ? 'no key specified' : 'no key specified'), 1);
            f = f.replace(/^~/, home);
            const pub = this.fs.getNode(this.fs.resolvePath(f.endsWith('.pub') ? f : f + '.pub'));
            const prv = this.fs.getNode(this.fs.resolvePath(f));
            if (!prv && !pub) return this._err(`${o.f} does not exist`, 1);
            const pubText = pub ? pub.content : null;
            if (!pubText) return this._err(`${o.f} is not a public key file.`, 1);
            if (o.y) return this._ok(pubText.replace(/\n$/, ''));
            const m = /^(\S+)\s+(\S+)\s*(.*)$/.exec(pubText.trim());
            if (!m) return this._err(`${o.f} is not a public key file.`, 1);
            const fp = this._fingerprint(m[2]);
            const bits = { 'ssh-rsa': 3072, 'ssh-ed25519': 256, 'ecdsa-sha2-nistp256': 256 }[m[1]] || 3072;
            const kind = { 'ssh-rsa': 'RSA', 'ssh-ed25519': 'ED25519', 'ecdsa-sha2-nistp256': 'ECDSA' }[m[1]] || 'RSA';
            return this._ok(`${bits} SHA256:${fp.b64} ${m[3]} (${kind})`);
        }
        const type = (o.t || 'rsa').toLowerCase();
        if (!typeMap[type]) return this._err(`unknown key type ${o.t}`, 1);
        let bits = o.b ? parseInt(o.b, 10) : (type === 'rsa' ? 3072 : type === 'ecdsa' ? 256 : 256);
        if (type === 'rsa' && bits < 1024) return this._err('Invalid RSA key length: minimum is 1024 bits', 255);
        if (type === 'ecdsa' && ![256, 384, 521].includes(bits)) return this._err('Invalid ECDSA key length: valid lengths are 256, 384 or 521 bits', 255);
        const quiet = !!o.q;
        const sh = this._sh();
        const ask = (prompt, secret) => (sh ? sh.takeInput({ mode: 'line', prompt, secret: !!secret }) : '');
        if (!quiet) this._emit(`Generating public/private ${type} key pair.\n`);
        let file = o.f;
        const defName = `id_${type}`;
        if (!file) { file = ask(`Enter file in which to save the key (${home}/.ssh/${defName}): `); if (file === null || file === '') file = `${home}/.ssh/${defName}`; }
        file = file.replace(/^~/, home);
        const abs = this.fs.resolvePath(file);
        if (this.fs.getNode(abs)) {
            const ans = ask(`${abs} already exists.\nOverwrite (y/n)? `);
            if (ans === null || !/^y/i.test(ans)) return { stdout: '', stderr: '', exitCode: 1 };
        }
        let pass = o.N;
        if (pass === undefined) {
            for (let tries = 0; tries < 3; tries++) {
                const a = ask('Enter passphrase (empty for no passphrase): ', true);
                const b = ask('Enter same passphrase again: ', true);
                if (a === b) { pass = a || ''; break; }
                this._emit('Passphrases do not match.  Try again.\n');
            }
            if (pass === undefined) return this._err('passphrase confirmation failed', 1);
        }
        if (pass !== '' && pass.length < 5) return this._err('Passphrase is too short (minimum five characters).', 1);
        const comment = o.C !== undefined ? o.C : `${this.fs.currentUser}@${this.parent.hostname}`;
        const dir = abs.replace(/\/[^/]*$/, '');
        if (!this.fs.getNode(dir)) { const d = this._mkdirp(dir, '0700'); d.permissions = '0700'; }
        const pubBlob = this._keyFiles(abs, type, bits, comment, '0600');
        const fp = this._fingerprint(pubBlob);
        const label = `${typeMap[type]} ${bits}`;
        const out = [`Your identification has been saved in ${abs}`, `Your public key has been saved in ${abs}.pub`, 'The key fingerprint is:', `SHA256:${fp.b64} ${comment}`, "The key's randomart image is:", this._randomart(fp.bytes, label)];
        return this._ok(quiet ? '' : out.join('\n'));
    }

    _keyFiles(path, type, bits, comment, mode) {
        const blobLen = type === 'rsa' ? Math.floor(bits / 6) + 20 : type === 'ed25519' ? 36 : 104;
        const prefix = { rsa: 'AAAAB3NzaC1yc2EAAAADAQABAAAB', ed25519: 'AAAAC3NzaC1lZDI1NTE5AAAAI', ecdsa: 'AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBB' }[type] || 'AAAAB3Nza';
        const body = prefix + this._b64(Math.max(8, blobLen - prefix.length));
        const algo = { rsa: 'ssh-rsa', ed25519: 'ssh-ed25519', ecdsa: 'ecdsa-sha2-nistp256', dsa: 'ssh-dss' }[type];
        const pub = `${algo} ${body} ${comment}\n`;
        const lines = [];
        const total = type === 'rsa' ? Math.floor(bits * 0.5) : type === 'ed25519' ? 250 : 380;
        const raw = 'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAA' + this._b64(total);
        for (let i = 0; i < raw.length; i += 70) lines.push(raw.slice(i, i + 70));
        const priv = `-----BEGIN OPENSSH PRIVATE KEY-----\n${lines.join('\n')}\n-----END OPENSSH PRIVATE KEY-----\n`;
        this._write(path, priv, mode || '0600');
        this._write(path + '.pub', pub, '0644');
        return pub.split(' ')[1];
    }

    'ssh-agent'(args) {
        const pid = 4000 + Math.floor(Math.random() * 900);
        const sock = `/tmp/ssh-${this._b64(10).replace(/[+/]/g, 'X')}/agent.${pid - 1}`;
        if (args.includes('-k')) return this._ok('unset SSH_AUTH_SOCK;\nunset SSH_AGENT_PID;\necho Agent pid ' + pid + ' killed;');
        return this._ok(`SSH_AUTH_SOCK=${sock}; export SSH_AUTH_SOCK;\nSSH_AGENT_PID=${pid}; export SSH_AGENT_PID;\necho Agent pid ${pid};`);
    }

    // ===== repository tools =====
    createrepo_c(args) {
        const { o, rest } = this._flags(args, ['o', 'g', 'u', 'x', 'i', 'n', 'c', 'workers', 's', 'p', 'j', 'd']);
        if (o.version) return this._ok('Version: 0.20.1 (Features: )');
        const dirArg = rest[0];
        if (!dirArg) return this._err('Usage: createrepo_c [options] <directory_to_index>\n\ncreaterepo_c: error: no directory to index was specified', 1);
        const abs = this.fs.resolvePath(dirArg);
        const node = this.fs.getNode(abs);
        if (!node || node.type !== 'directory') return this._err(`Cannot access directory: ${dirArg}`, 1);
        if (!this.fs.hasPermission(node, 'w')) return this._err(`Cannot create /${abs.replace(/^\//, '')}/.repodata: Permission denied`, 1);
        let rpms = 0;
        const walk = (n) => { for (const [k, c] of Object.entries(n.children || {})) { if (c.type === 'directory') { if (k !== 'repodata') walk(c); } else if (k.endsWith('.rpm')) rpms++; } };
        walk(node);
        const h = () => this._hex(64);
        const stamp = Math.floor(this._now().getTime() / 1000);
        const files = { primary: h(), filelists: h(), other: h() };
        const xml = (name) => `<?xml version="1.0" encoding="UTF-8"?>\n<${name} xmlns="http://linux.duke.edu/metadata/${name}" packages="${rpms}">\n</${name}>\n`;
        this._mkdirp(abs + '/repodata');
        this._write(abs + '/repodata/repomd.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<repomd xmlns="http://linux.duke.edu/metadata/repo" xmlns:rpm="http://linux.duke.edu/metadata/rpm">\n  <revision>${stamp}</revision>\n  <data type="primary"><location href="repodata/${files.primary}-primary.xml.gz"/></data>\n  <data type="filelists"><location href="repodata/${files.filelists}-filelists.xml.gz"/></data>\n  <data type="other"><location href="repodata/${files.other}-other.xml.gz"/></data>\n</repomd>\n`);
        for (const [k, v] of Object.entries(files)) this._write(`${abs}/repodata/${v}-${k}.xml.gz`, xml(k));
        for (const [k, v] of Object.entries(files)) this._write(`${abs}/repodata/${h()}-${k}.sqlite.bz2`, '');
        const out = ['Directory walk started', `Directory walk done - ${rpms} packages`, `Temporary output repo path: ${abs}/.repodata/`, 'Preparing sqlite DBs', 'Pool started (with 5 workers)', 'Pool finished'];
        return this._ok(o.q || o.quiet ? '' : out.join('\n'));
    }
    createrepo(args) { return this.createrepo_c(args); }

    yumdownloader(args) {
        if (!args.length) return this._err('Usage: yumdownloader [options] <package>\n\nyumdownloader: error: Need at least one package name', 1);
        if (typeof this.parent.dnf !== 'function') return this._err('yumdownloader: dnf is not available', 1);
        return this.parent.dnf(['download', ...args.map(a => (a === '--destdir' ? '--destdir' : a))]);
    }

    // ===== dos2unix and friends =====
    _eol(name, to, args) {
        const { o, rest } = this._flags(args, ['n']);
        const q = o.q;
        const out = [], errs = [];
        const files = rest;
        if (!files.length) return this._err(`${name}: no input files`, 1);
        for (const f of files) {
            const n = this.fs.getNode(this.fs.resolvePath(f));
            if (!n) { errs.push(`${name}: ${f}: No such file or directory`); out.push(`${name}: Skipping ${f}, not a regular file.`); continue; }
            if (n.type !== 'file') { out.push(`${name}: Skipping ${f}, not a regular file.`); continue; }
            const text = n.content || '';
            n.content = to === 'unix' ? text.replace(/\r\n/g, '\n').replace(/\r(?!\n)/g, '\n') : text.replace(/\r?\n/g, '\r\n');
            n.size = n.content.length; n.modified = new Date();
            if (!q) out.push(`${name}: converting file ${f} to ${to === 'unix' ? 'Unix' : 'DOS'} format...`);
        }
        return { stdout: '', stderr: [...out.filter(x => !/Skipping/.test(x) || true), ...errs.filter(e => !out.some(x => x.includes(e)))].join('\n'), exitCode: errs.length ? 1 : 0 };
    }
    dos2unix(args) { return this._eol('dos2unix', 'unix', args); }
    unix2dos(args) { return this._eol('unix2dos', 'dos', args); }

    sosreport(args) {
        const { o } = this._flags(args, ['case-id', 'name', 'tmp-dir']);
        const ver = 'sos 4.6.1';
        if (o.version) return this._ok(`sosreport (version 4.6.1)`);
        if (!this._isRoot()) return this._err('sos requires root permissions to run.', 1);
        const sh = this._sh();
        const ask = (p) => (sh && !o.batch ? sh.takeInput({ mode: 'line', prompt: p }) : '');
        const intro = '\nThis command will collect diagnostic and configuration information from\nthis Red Hat Enterprise Linux system and installed applications.\n\nAn archive containing the collected information will be generated in\n/var/tmp/sos.' + this._hex(8) + ' and may be provided to a Red Hat support\nrepresentative.\n\nAny information provided to Red Hat will be treated in accordance with\nthe published support policies at:\n\n  Distribution Website : https://www.redhat.com/\n  Commercial Support   : https://www.access.redhat.com/\n\nThe generated archive may contain data considered sensitive and its\ncontent should be reviewed by the originating organization before being\npassed to any third party.\n\nNo changes will be made to system configuration.\n';
        if (!o.batch) { this._emit(`sosreport (version 4.6.1)\n${intro}\nPress ENTER to continue, or CTRL-C to quit.\n`); }
        const a1 = ask('');
        if (a1 === null) return { stdout: '', stderr: '', exitCode: 130 };
        const caseId = o['case-id'] || (o.batch ? '' : ask('Optionally, please enter the case id that you are generating this report for []: '));
        const stamp = this._fmt(this._now(), '%Y-%m-%d');
        const rnd = this._hex(7);
        const archive = `/var/tmp/sosreport-${this.parent.hostname}${caseId ? '-' + caseId : ''}-${stamp}-${rnd}.tar.xz`;
        const body = `sosreport archive (Red Cat): ${archive}\n`;
        this._write(archive, body, '0600', 'root');
        this._write(archive + '.sha256', UTIL_HASH.sha256(UTIL_HASH.utf8(body)) + '\n', '0644', 'root');
        const out = ['', 'Setting up archive ...', 'Setting up plugins ...', '[plugin:auditd] Could not open conf file /etc/audit/auditd.conf: [Errno 2] No such file or directory', 'Running plugins. Please wait ...', '', '  Starting 1/1   systemd         [Running: systemd]', '  Finished running plugins', 'Creating compressed archive...', '', 'Your sosreport has been generated and saved in:', `\t${archive}`, '', ' Size\t12.40MiB', ' Owner\troot', ' sha256\t' + UTIL_HASH.sha256(UTIL_HASH.utf8(body)), '', 'Please send this file to your support representative.', ''];
        return this._ok(out.join('\n'));
    }

    // ===== language and tool versions =====
    _verOnly(name, args, versions) {
        const v = args[0];
        const key = ['--version', '-version', '-v', '-V', 'version'].includes(v) ? v : null;
        if (!args.length || !key) return this._err(`${name}: this program is only simulated for version queries in Red Cat (${name} --version)`, 1);
        const text = versions[key] || versions.default;
        return text ? { stdout: text.stdout || '', stderr: text.stderr || '', exitCode: 0 } : this._err(`${name}: unrecognized option '${v}'`, 1);
    }
    java(args) { return this._verOnly('java', args, { default: { stderr: 'openjdk version "17.0.9" 2023-10-17 LTS\nOpenJDK Runtime Environment (Red_Hat-17.0.9.0.9-3) (build 17.0.9+9-LTS)\nOpenJDK 64-Bit Server VM (Red_Hat-17.0.9.0.9-3) (build 17.0.9+9-LTS, mixed mode, sharing)' } }); }
    node(args) { return this._verOnly('node', args, { default: { stdout: 'v18.18.2' } }); }
    npm(args) { return this._verOnly('npm', args, { default: { stdout: '9.8.1' } }); }
    php(args) { return this._verOnly('php', args, { default: { stdout: 'PHP 8.0.30 (cli) (built: Aug  1 2023 12:00:00) ( NTS gcc x86_64 )\nCopyright (c) The PHP Group\nZend Engine v4.0.30, Copyright (c) Zend Technologies' } }); }
    expect(args) { return this._verOnly('expect', args, { default: { stdout: 'expect version 5.45.4' } }); }
    lftp(args) { return this._verOnly('lftp', args, { default: { stdout: 'LFTP | Version 4.9.2 | Copyright (c) 1996-2020 Alexander V. Lukyanov' } }); }
    ftp(args) { return this._verOnly('ftp', args, { default: { stdout: 'ftp (GNU inetutils) 2.4' } }); }
    iperf3(args) { return this._verOnly('iperf3', args, { default: { stdout: 'iperf 3.9 (cJSON 1.7.15)\nLinux rhcsa-lab 5.14.0-362.8.1.el9_3.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64\nOptimizing for 500 ms' } }); }
    ansible(args) { return this._verOnly('ansible', args, { '--version': { stdout: 'ansible [core 2.14.9]\n  config file = /etc/ansible/ansible.cfg\n  configured module search path = [\'/root/.ansible/plugins/modules\', \'/usr/share/ansible/plugins/modules\']\n  python version = 3.9.18 (main, Jan  4 2024, 00:00:00) [GCC 11.4.1 20231218 (Red Hat 11.4.1-3)]\n  jinja version = 3.1.2\n  libyaml = True' } }); }
    'ansible-playbook'(args) { return this.ansible(args); }
    whois(args) {
        const { rest } = this._flags(args);
        if (!rest.length) return this._err('Usage: whois [OPTION]... OBJECT...', 1);
        const r = this._resolve(rest[0]);
        if (r.err) return this._err(`No whois server is known for this kind of object.`, 1);
        return this._ok(`Domain Name: ${rest[0].toUpperCase()}\nRegistry Domain ID: 2336799_DOMAIN_COM-VRSN\nRegistrar WHOIS Server: whois.iana.org\nUpdated Date: 2024-08-14T07:01:34Z\nCreation Date: 1995-08-14T04:00:00Z\nName Server: A.IANA-SERVERS.NET\nName Server: B.IANA-SERVERS.NET\nDNSSEC: signedDelegation\n>>> Last update of whois database: ${this._fmt(this._now(), '%Y-%m-%dT%H:%M:%SZ')} <<<`);
    }
}

if (typeof window !== 'undefined') {
    window.AppEngine = AppEngine;
}
