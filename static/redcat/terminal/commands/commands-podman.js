// podman: images, containers, volumes, builds, generate systemd and rootless user services
// Part of Red Cat RHCSA Terminal Simulator
//
// State is kept per user (root and rootless users have separate storage). Pulls need working DNS and a route
// (see commands-net.js), published ports conflict with services and other containers, host directories mounted
// without :z/:Z are blocked by SELinux, and `podman generate systemd` writes units that really start the container.

class PodmanEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.podman = this;
        this.stores = {};            // username -> { images:{}, containers:[], volumes:{}, loggedIn:Set }
        this.nextPid = 12000;
        this.userUnits = {};         // username -> { name -> { active, enabled } }
        this.linger = new Set();
        this.hexSeed = 1;
        this._catalog();
    }

    // ===== catalog =====
    _catalog() {
        const rhel = { name: 'Red Hat Enterprise Linux', id: 'rhel', ver: '9.3 (Plow)', vid: '9.3', pretty: 'Red Hat Enterprise Linux 9.3 (Plow)' };
        const rhel8 = { name: 'Red Hat Enterprise Linux', id: 'rhel', ver: '8.9 (Ootpa)', vid: '8.9', pretty: 'Red Hat Enterprise Linux 8.9 (Ootpa)' };
        const alp = { name: 'Alpine Linux', id: 'alpine', ver: '3.19.0', vid: '3.19.0', pretty: 'Alpine Linux v3.19' };
        const deb = { name: 'Debian GNU/Linux', id: 'debian', ver: '12 (bookworm)', vid: '12', pretty: 'Debian GNU/Linux 12 (bookworm)' };
        // ref -> image
        this.registry = {
            'registry.access.redhat.com/ubi9/ubi': { tags: ['latest', '9.3', '9.2'], size: 230, cmd: ['/bin/bash'], os: rhel, arch: 'amd64', ports: [], daemon: false },
            'registry.access.redhat.com/ubi9/ubi-minimal': { tags: ['latest', '9.3'], size: 107, cmd: ['/bin/bash'], os: rhel, ports: [], daemon: false },
            'registry.access.redhat.com/ubi9/ubi-init': { tags: ['latest'], size: 252, cmd: ['/sbin/init'], os: rhel, ports: [], daemon: true },
            'registry.access.redhat.com/ubi8/ubi': { tags: ['latest', '8.9'], size: 215, cmd: ['/bin/bash'], os: rhel8, ports: [], daemon: false },
            'registry.access.redhat.com/ubi9/httpd-24': { tags: ['latest'], size: 337, cmd: ['/usr/bin/run-httpd'], os: rhel, ports: [8080, 8443], daemon: true, kind: 'httpd', docroot: '/var/www/html', user: '1001' },
            'registry.access.redhat.com/ubi9/nginx-122': { tags: ['latest'], size: 318, cmd: ['nginx', '-g', 'daemon off;'], os: rhel, ports: [8080, 8443], daemon: true, kind: 'nginx', docroot: '/opt/app-root/src', user: '1001' },
            'registry.access.redhat.com/ubi9/mariadb-105': { tags: ['latest'], size: 480, cmd: ['run-mysqld'], os: rhel, ports: [3306], daemon: true, kind: 'db', user: '27' },
            'registry.access.redhat.com/ubi9/python-39': { tags: ['latest'], size: 330, cmd: ['/bin/bash'], os: rhel, ports: [8080], daemon: false, user: '1001' },
            'docker.io/library/nginx': { tags: ['latest', 'alpine', '1.25'], size: 192, cmd: ['nginx', '-g', 'daemon off;'], os: deb, ports: [80], daemon: true, kind: 'nginx', docroot: '/usr/share/nginx/html' },
            'docker.io/library/httpd': { tags: ['latest', '2.4', 'alpine'], size: 148, cmd: ['httpd-foreground'], os: deb, ports: [80], daemon: true, kind: 'httpd', docroot: '/usr/local/apache2/htdocs' },
            'docker.io/library/alpine': { tags: ['latest', '3.19'], size: 7.4, cmd: ['/bin/sh'], os: alp, ports: [], daemon: false },
            'docker.io/library/busybox': { tags: ['latest'], size: 4.3, cmd: ['sh'], os: alp, ports: [], daemon: false },
            'docker.io/library/redis': { tags: ['latest', '7'], size: 138, cmd: ['redis-server'], os: deb, ports: [6379], daemon: true, kind: 'db' },
            'docker.io/library/postgres': { tags: ['latest', '15', '16'], size: 432, cmd: ['postgres'], os: deb, ports: [5432], daemon: true, kind: 'db', needsEnv: 'POSTGRES_PASSWORD' },
            'docker.io/library/mariadb': { tags: ['latest', '10.11'], size: 396, cmd: ['mariadbd'], os: deb, ports: [3306], daemon: true, kind: 'db', needsEnv: 'MARIADB_ROOT_PASSWORD' },
            'docker.io/library/mysql': { tags: ['latest', '8'], size: 603, cmd: ['mysqld'], os: deb, ports: [3306], daemon: true, kind: 'db', needsEnv: 'MYSQL_ROOT_PASSWORD' },
            'docker.io/library/ubuntu': { tags: ['latest', '22.04'], size: 77, cmd: ['/bin/bash'], os: { name: 'Ubuntu', id: 'ubuntu', ver: '22.04.3 LTS (Jammy Jellyfish)', vid: '22.04', pretty: 'Ubuntu 22.04.3 LTS' }, ports: [], daemon: false },
            'docker.io/library/python': { tags: ['latest', '3.12'], size: 1010, cmd: ['python3'], os: deb, ports: [], daemon: false },
            'quay.io/centos/centos': { tags: ['stream9'], size: 150, cmd: ['/bin/bash'], os: { name: 'CentOS Stream', id: 'centos', ver: '9', vid: '9', pretty: 'CentOS Stream 9' }, ports: [], daemon: false },
            'registry.redhat.io/rhel9/rhel-guest-image': { tags: ['latest'], size: 600, cmd: ['/bin/bash'], os: rhel, ports: [], daemon: false, auth: true },
            'registry.redhat.io/rhel9/httpd-24': { tags: ['latest'], size: 337, cmd: ['/usr/bin/run-httpd'], os: rhel, ports: [8080], daemon: true, kind: 'httpd', docroot: '/var/www/html', auth: true }
        };
        this.aliases = { ubi9: 'registry.access.redhat.com/ubi9/ubi', 'ubi9/ubi': 'registry.access.redhat.com/ubi9/ubi', 'ubi9-minimal': 'registry.access.redhat.com/ubi9/ubi-minimal', 'ubi9-init': 'registry.access.redhat.com/ubi9/ubi-init', ubi8: 'registry.access.redhat.com/ubi8/ubi', 'ubi9/httpd-24': 'registry.access.redhat.com/ubi9/httpd-24', 'ubi9/nginx-122': 'registry.access.redhat.com/ubi9/nginx-122', 'ubi9/mariadb-105': 'registry.access.redhat.com/ubi9/mariadb-105', 'ubi9/python-39': 'registry.access.redhat.com/ubi9/python-39', nginx: 'docker.io/library/nginx', httpd: 'docker.io/library/httpd', alpine: 'docker.io/library/alpine', busybox: 'docker.io/library/busybox', redis: 'docker.io/library/redis', postgres: 'docker.io/library/postgres', mariadb: 'docker.io/library/mariadb', mysql: 'docker.io/library/mysql', ubuntu: 'docker.io/library/ubuntu', python: 'docker.io/library/python', centos: 'quay.io/centos/centos' };
        this.names = ['angry_bohr', 'brave_curie', 'clever_darwin', 'eager_turing', 'epic_hopper', 'happy_lovelace', 'jolly_newton', 'keen_ritchie', 'lucid_tesla', 'quirky_knuth', 'silly_pike', 'upbeat_wing'];
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 125) { return { stdout: '', stderr, exitCode }; }
    _user() { return this.fs.currentUser; }
    _isRoot() { return this.fs.currentUid === 0; }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _node(p) { return this.fs.getNode(p); }
    get parent() { return this.shared.parent; }
    _store(u) {
        const k = u || this._user();
        if (!this.stores[k]) this.stores[k] = { images: {}, containers: [], volumes: {}, loggedIn: new Set() };
        return this.stores[k];
    }
    _hex(n) { let s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; }
    _write(path, content, mode) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: this._user(), group: this._user(), size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        const usr = this.fs.users[this._user()];
        cur.children[name] = { type: 'file', permissions: mode || '0644', owner: this._user(), group: usr ? this._grp(usr) : this._user(), size: content.length, modified: new Date(), content };
    }
    _grp(usr) { return this._user(); }
    _mkdirp(path) {
        let cur = this.fs.fs['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: this._user(), group: this._user(), size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
    }
    _ago(d) {
        const s = Math.max(0, Math.floor((this._now() - d) / 1000));
        if (s < 2) return 'Less than a second ago';
        if (s < 60) return `${s} seconds ago`;
        if (s < 3600) return `${Math.floor(s / 60)} minute${Math.floor(s / 60) > 1 ? 's' : ''} ago`;
        if (s < 86400) return `${Math.floor(s / 3600)} hour${Math.floor(s / 3600) > 1 ? 's' : ''} ago`;
        return `${Math.floor(s / 86400)} day${Math.floor(s / 86400) > 1 ? 's' : ''} ago`;
    }
    _sizeStr(mb) { return mb >= 1000 ? (mb / 1000).toFixed(2).replace(/0$/, '') + ' GB' : mb.toFixed(mb < 10 ? 1 : 0).replace(/\.0$/, '') + ' MB'; }

    // ===== image references =====
    // returns { repo, tag, full, short, entry } or { err }
    _parseRef(ref) {
        let name = ref, tag = 'latest', digest = null;
        const at = name.indexOf('@'); if (at >= 0) { digest = name.slice(at + 1); name = name.slice(0, at); }
        const lastSlash = name.lastIndexOf('/');
        const colon = name.lastIndexOf(':');
        if (colon > lastSlash) { tag = name.slice(colon + 1); name = name.slice(0, colon); }
        let alias = null;
        let repo = name;
        const first = name.split('/')[0];
        const hasRegistry = name.includes('/') && (first.includes('.') || first.includes(':') || first === 'localhost');
        if (!hasRegistry) {
            if (this.aliases[name]) { alias = name; repo = this.aliases[name]; }
            else return { err: 'short', name, tag };
        }
        return { repo, tag, alias, ref: `${repo}:${tag}` };
    }

    _localImage(store, ref) {
        const direct = store.images[ref];
        if (direct) return direct;
        // match by id prefix, or short repo name
        const byId = Object.values(store.images).find(i => ref.length >= 3 && i.id.startsWith(ref.replace(/^sha256:/, '')));
        if (byId) return byId;
        const p = this._parseRef(ref);
        if (!p.err && store.images[p.ref]) return store.images[p.ref];
        const local = store.images[`localhost/${ref.includes(':') ? ref : ref + ':latest'}`];
        if (local) return local;
        return null;
    }

    _registryHost(repo) { return repo.split('/')[0]; }

    _netCheck(host, ref) {
        const nm = this.shared.net;
        if (!nm) return null;
        const r = nm._getaddr(host);
        const dns = nm._dnsServerState ? nm._dnsServerState() : {};
        if (r.err === 'nxdomain') return `Error: initializing source docker://${ref}: pinging container registry ${host}: Get "https://${host}/v2/": dial tcp: lookup ${host} on ${dns.server || '127.0.0.53'}:53: no such host`;
        if (r.err) return `Error: initializing source docker://${ref}: pinging container registry ${host}: Get "https://${host}/v2/": dial tcp: lookup ${host}: Temporary failure in name resolution`;
        if (!nm._routeFor(r.ip)) return `Error: initializing source docker://${ref}: pinging container registry ${host}: Get "https://${host}/v2/": dial tcp ${r.ip}:443: connect: network is unreachable`;
        return null;
    }

    _ensureZone() {
        const nm = this.shared.net;
        if (!nm || !nm.zone) return;
        const add = { 'registry.access.redhat.com': '23.40.113.17', 'registry.redhat.io': '23.40.113.18', 'docker.io': '54.236.113.205', 'registry-1.docker.io': '54.236.113.205', 'quay.io': '52.4.72.11', 'index.docker.io': '54.236.113.205' };
        for (const [h, ip] of Object.entries(add)) if (!nm.zone[h]) nm.zone[h] = { A: [ip] };
    }

    // pull an image into the store; returns { err } or { image, lines }
    _pull(store, refStr, quiet) {
        this._ensureZone();
        const p = this._parseRef(refStr);
        const lines = [];
        if (p.err === 'short') {
            return { err: `Error: short-name resolution enforced but cannot prompt without a TTY`.replace(/^/, '') };
        }
        if (p.alias) lines.push(`Resolved "${p.alias}" as an alias (/etc/containers/registries.conf.d/000-shortnames.conf)`);
        if (p.repo.startsWith('localhost/')) return { err: `Error: initializing source docker://${p.ref}: pinging container registry localhost: Get "https://localhost/v2/": dial tcp [::1]:443: connect: connection refused` };
        const host = this._registryHost(p.repo);
        const neterr = this._netCheck(host, p.ref);
        if (neterr) return { err: neterr };
        const entry = this.registry[p.repo];
        if (!entry) return { err: `Error: initializing source docker://${p.ref}: reading manifest ${p.tag} in ${p.repo}: manifest unknown` };
        if (entry.auth && !store.loggedIn.has(host)) return { err: `Error: initializing source docker://${p.ref}: unable to retrieve auth token: invalid username/password: unauthorized: Please login to the Red Hat Registry using your Customer Portal credentials. Further instructions can be found here: https://access.redhat.com/RegistryAuthentication` };
        if (!entry.tags.includes(p.tag)) return { err: `Error: initializing source docker://${p.ref}: reading manifest ${p.tag} in ${p.repo}: manifest unknown` };
        lines.push(`Trying to pull ${p.ref}...`);
        lines.push('Getting image source signatures', 'Checking if image destination supports signatures', `Copying blob sha256:${this._hex(12)} done  `.replace(/done  $/, 'done   |'), `Copying blob sha256:${this._hex(12)} done   |`, `Copying config sha256:${this._hex(12)} done   |`, 'Writing manifest to image destination', 'Storing signatures');
        let img = store.images[p.ref];
        if (!img) {
            const id = this._hex(64);
            img = { id, repo: p.repo, tag: p.tag, ref: p.ref, entry, created: new Date(this._now().getTime() - 21 * 86400000), size: entry.size, cmd: entry.cmd.slice(), ports: entry.ports.slice(), env: [], user: entry.user || '', workdir: '/', local: false };
            store.images[p.ref] = img;
        }
        lines.push(img.id);
        return { image: img, lines: quiet ? [img.id] : lines };
    }

    // ===== command entry =====
    podman(argsIn) {
        const args = argsIn.slice();
        if (!args.length) return this._ok(this._usage());
        // global options
        while (args.length && args[0].startsWith('-') && !['-h', '--help', '-v', '--version'].includes(args[0])) { const a = args.shift(); if (['--root', '--runroot', '--log-level', '--storage-driver', '--url', '--connection', '-c', '--cgroup-manager'].includes(a)) args.shift(); }
        const cmd = args.shift();
        let rest = args;
        if (['rm', 'rmi', 'stop', 'ps', 'kill', 'restart', 'images', 'start', 'logs', 'prune'].includes(cmd) || (cmd === 'system' && rest[0] === 'prune')) {
            rest = rest.flatMap(a => (/^-[a-zA-Z]{2,}$/.test(a) ? a.slice(1).split('').map(ch => '-' + ch) : [a]));
        }
        const noun = { container: 'container', image: 'image', volume: 'volume', network: 'network', system: 'system', pod: 'pod', machine: 'machine', secret: 'secret', generate: 'generate', auto: 'auto' };
        if (cmd === '--version' || cmd === '-v' || cmd === 'version' && !rest.length && false) return this._ok('podman version 4.6.1');
        if (cmd === 'version') return this._ok('Client:       Podman Engine\nVersion:      4.6.1\nAPI Version:  4.6.1\nGo Version:   go1.20.10\nBuilt:        Wed Nov  8 08:00:00 2023\nOS/Arch:      linux/amd64');
        if (cmd === '--help' || cmd === '-h' || cmd === 'help') return this._ok(this._usage());
        switch (cmd) {
            case 'pull': return this._cmdPull(rest);
            case 'images': return this._cmdImages(rest);
            case 'image': return this._noun('image', rest);
            case 'container': return this._noun('container', rest);
            case 'ps': return this._cmdPs(rest);
            case 'run': return this._cmdRun(rest, false);
            case 'create': return this._cmdRun(rest, true);
            case 'start': return this._cmdStart(rest);
            case 'stop': return this._cmdStop(rest);
            case 'restart': return this._cmdRestart(rest);
            case 'kill': return this._cmdKill(rest);
            case 'rm': return this._cmdRm(rest);
            case 'rmi': return this._cmdRmi(rest);
            case 'exec': return this._cmdExec(rest);
            case 'logs': return this._cmdLogs(rest);
            case 'inspect': return this._cmdInspect(rest);
            case 'port': return this._cmdPort(rest);
            case 'top': return this._cmdTop(rest);
            case 'build': return this._cmdBuild(rest);
            case 'tag': return this._cmdTag(rest);
            case 'commit': return this._cmdCommit(rest);
            case 'search': return this._cmdSearch(rest);
            case 'login': return this._cmdLogin(rest);
            case 'logout': return this._ok('Removed login credentials for ' + (rest[0] || 'registry.access.redhat.com'));
            case 'volume': return this._cmdVolume(rest);
            case 'network': return this._cmdNetwork(rest);
            case 'generate': return this._cmdGenerate(rest);
            case 'system': return this._cmdSystem(rest);
            case 'info': return this._cmdInfo(rest);
            case 'rename': return this._cmdRename(rest);
            case 'cp': return this.shared.ctr ? this.shared.ctr._cpCopy(rest) : this._ok('');
            case 'attach': return this._cmdAttach(rest);
            case 'unshare': case 'pod': case 'machine': case 'secret': case 'auto-update': return this._err(`Error: podman ${cmd} is not simulated in Red Cat`, 125);
            default: return this._err(`Error: unrecognized command \`podman ${cmd}\`\nTry 'podman --help' for more information.`, 125);
        }
    }

    _usage() {
        return 'Manage pods, containers and images\n\nUsage:\n  podman [options] [command]\n\nAvailable Commands:\n  attach      Attach to a running container\n  build       Build an image using instructions from Containerfiles\n  commit      Create new image based on the changed container\n  cp          Copy files/folders between a container and the local filesystem\n  create      Create but do not start a container\n  exec        Run a process in a running container\n  generate    Generate structured data based on containers, pods or volumes\n  images      List images in local storage\n  info        Display podman system information\n  inspect     Display the configuration of object denoted by ID\n  kill        Kill one or more running containers with a specific signal\n  login       Log in to a container registry\n  logout      Log out of a container registry\n  logs        Fetch the logs of one or more containers\n  network     Manage networks\n  port        List port mappings or a specific mapping for the container\n  ps          List containers\n  pull        Pull an image from a registry\n  restart     Restart one or more containers\n  rm          Remove one or more containers\n  rmi         Remove one or more images from local storage\n  run         Run a command in a new container\n  search      Search registry for image\n  start       Start one or more containers\n  stop        Stop one or more running containers\n  system      Manage podman\n  tag         Add an additional name to a local image\n  top         Display the running processes of a container\n  version     Display the Podman version information\n  volume      Manage volumes';
    }

    _noun(kind, rest) {
        const sub = rest[0];
        const tail = rest.slice(1);
        if (kind === 'image') {
            const m = { ls: 'images', list: 'images', pull: 'pull', rm: 'rmi', tag: 'tag', inspect: 'inspect', build: 'build', prune: 'imageprune', exists: 'imageexists' };
            if (sub === 'prune') return this._cmdSystem(['prune', ...tail]);
            if (sub === 'exists') { const st = this._store(); return { stdout: '', stderr: '', exitCode: this._localImage(st, tail[0] || '') ? 0 : 1 }; }
            if (sub === 'inspect') return this._cmdInspect(['--type', 'image', ...tail]);
            if (m[sub]) return this.podman([m[sub], ...tail]);
        } else {
            const m = { ls: 'ps', list: 'ps', run: 'run', start: 'start', stop: 'stop', restart: 'restart', rm: 'rm', exec: 'exec', logs: 'logs', inspect: 'inspect', kill: 'kill', port: 'port', top: 'top', create: 'create', prune: 'prune' };
            if (sub === 'ls' || sub === 'list') return this._cmdPs(tail);
            if (sub === 'prune') return this._cmdSystem(['prune', ...tail]);
            if (sub === 'exists') { const st = this._store(); return { stdout: '', stderr: '', exitCode: this._findContainer(st, tail[0] || '') ? 0 : 1 }; }
            if (sub === 'inspect') return this._cmdInspect(['--type', 'container', ...tail]);
            if (m[sub]) return this.podman([m[sub], ...tail]);
        }
        return this._err(`Error: unrecognized command \`podman ${kind} ${sub || ''}\``, 125);
    }

    // ----- pull / images / rmi / tag / search / login
    _cmdPull(rest) {
        const quiet = rest.includes('-q') || rest.includes('--quiet');
        const refs = rest.filter(a => !a.startsWith('-'));
        if (!refs.length) return this._err('Error: image name must be specified', 125);
        const st = this._store();
        const out = [];
        for (const r of refs) {
            const res = this._pull(st, r, quiet);
            if (res.err) return { stdout: out.join('\n'), stderr: res.err, exitCode: 125 };
            out.push(...res.lines);
        }
        return this._ok(out.join('\n'));
    }

    _imgRows(st) {
        return Object.values(st.images).filter(i => !i.hidden).sort((a, b) => b.created - a.created);
    }

    _cmdImages(rest) {
        const st = this._store();
        const fmtI = rest.indexOf('--format');
        const fmt = fmtI >= 0 ? rest[fmtI + 1] : null;
        const quiet = rest.includes('-q') || rest.includes('--quiet');
        const pats = rest.filter((a, i) => !a.startsWith('-') && rest[i - 1] !== '--format');
        let imgs = this._imgRows(st);
        if (pats.length) imgs = imgs.filter(i => pats.some(p => i.repo.includes(p) || i.repo.endsWith('/' + p)));
        if (quiet) return this._ok(imgs.map(i => i.id.slice(0, 12)).join('\n'));
        const rowObj = (i) => ({ Repository: i.repo, Tag: i.tag, ID: i.id.slice(0, 12), Created: this._ago(i.created), Size: this._sizeStr(i.size), Digest: 'sha256:' + i.id, CreatedAt: i.created.toISOString() });
        if (fmt) return this._ok(imgs.map(i => this._tpl(fmt, rowObj(i))).join('\n'));
        const rows = imgs.map(i => [i.repo, i.tag, i.id.slice(0, 12), this._ago(i.created), this._sizeStr(i.size)]);
        const hdr = ['REPOSITORY', 'TAG', 'IMAGE ID', 'CREATED', 'SIZE'];
        return this._ok(this._table(hdr, rows));
    }

    _table(hdr, rows) {
        const w = hdr.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)) + 2);
        const f = r => r.map((c, i) => (i === r.length - 1 ? String(c) : String(c).padEnd(w[i]))).join('');
        return [f(hdr), ...rows.map(f)].join('\n');
    }

    _tpl(fmt, obj) {
        return String(fmt).replace(/\{\{\s*(json\s+)?\.?([A-Za-z0-9_.\[\]]*)\s*\}\}/g, (m, j, path) => {
            let v = obj;
            for (const k of path.split('.').filter(Boolean)) { if (v == null) break; v = v[k]; }
            if (v === undefined || v === null) return j ? 'null' : '<no value>';
            if (typeof v === 'object') return JSON.stringify(v);
            return String(v);
        }).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }

    _cmdRmi(rest) {
        const st = this._store();
        const force = rest.includes('-f') || rest.includes('--force');
        const all = rest.includes('-a') || rest.includes('--all');
        const refs = all ? Object.values(st.images).map(i => i.id) : rest.filter(a => !a.startsWith('-'));
        if (!refs.length) return this._err('Error: image name or ID must be specified', 125);
        const out = [], errs = [];
        let code = 0;
        for (const r of refs) {
            const img = this._localImage(st, r);
            if (!img) { errs.push(`Error: ${r}: image not known`); code = 1; continue; }
            const users = st.containers.filter(c => c.image === img.ref || c.imageId === img.id);
            if (users.length && !force) { errs.push(`Error: image used by ${users[0].id}: image is in use by a container: consider listing external containers and force-removing image`); code = 2; continue; }
            if (users.length && force) for (const c of users) this._removeContainer(st, c);
            // remove all tags of the same id when removed by id, or just the tag
            const byRef = Object.keys(st.images).includes(r) || this._parseRef(r).ref;
            const sameId = Object.values(st.images).filter(i => i.id === img.id);
            if (sameId.length > 1 && !/^[0-9a-f]{3,}$/.test(r)) { delete st.images[img.ref]; out.push(`Untagged: ${img.ref}`); }
            else { for (const i of sameId) { out.push(`Untagged: ${i.ref}`); delete st.images[i.ref]; } out.push(`Deleted: ${img.id}`); }
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _cmdTag(rest) {
        const st = this._store();
        const [src, ...dsts] = rest.filter(a => !a.startsWith('-'));
        if (!src || !dsts.length) return this._err('Error: must provide at least two arguments', 125);
        const img = this._localImage(st, src);
        if (!img) return this._err(`Error: ${src}: image not known`, 125);
        for (const d of dsts) {
            let repo = d, tag = 'latest';
            const lastSlash = d.lastIndexOf('/'), colon = d.lastIndexOf(':');
            if (colon > lastSlash) { tag = d.slice(colon + 1); repo = d.slice(0, colon); }
            const first = repo.split('/')[0];
            if (!(repo.includes('/') && (first.includes('.') || first.includes(':') || first === 'localhost'))) repo = 'localhost/' + repo;
            st.images[`${repo}:${tag}`] = Object.assign({}, img, { repo, tag, ref: `${repo}:${tag}` });
        }
        return this._ok('');
    }

    _cmdSearch(rest) {
        this._ensureZone();
        const term = rest.filter(a => !a.startsWith('-'))[0];
        if (!term) return this._err('Error: search term cannot be empty', 125);
        const neterr = this._netCheck('registry.access.redhat.com', term);
        if (neterr) return this._err(neterr.replace(/^Error: initializing source docker:\/\/[^:]*: pinging container registry/, 'Error: couldn\'t search registry "registry.access.redhat.com": pinging container registry'), 125);
        const L = [];
        for (const [repo, e] of Object.entries(this.registry)) if (repo.includes(term) && !repo.startsWith('registry.redhat.io')) L.push([repo.split('/')[0] + '/' + repo.split('/').slice(1).join('/'), `${e.os ? e.os.name : ''} image`]);
        if (!L.length) return this._ok('NAME  DESCRIPTION');
        return this._ok(this._table(['NAME', 'DESCRIPTION'], L));
    }

    _cmdLogin(rest) {
        const host = rest.filter((a, i) => !a.startsWith('-') && !['-u', '-p', '--username', '--password'].includes(rest[i - 1])).pop() || 'registry.access.redhat.com';
        const u = rest.indexOf('-u') >= 0 ? rest[rest.indexOf('-u') + 1] : (rest.find(a => a.startsWith('--username=')) || '').slice(11);
        const p = rest.indexOf('-p') >= 0 ? rest[rest.indexOf('-p') + 1] : (rest.find(a => a.startsWith('--password=')) || '').slice(11);
        if (!u || !p) {
            const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null;
            let user = u, pass = p;
            if (sh) {
                if (!user) user = sh.takeInput({ mode: 'line', prompt: 'Username: ' });
                if (!pass) pass = sh.takeInput({ mode: 'line', prompt: 'Password: ', secret: true });
            }
            if (!user || !pass) return this._err('Error: logging into "' + host + '": invalid username/password', 125);
        }
        this._ensureZone();
        const neterr = this._netCheck(host, host);
        if (neterr) return this._err(`Error: authenticating creds for "${host}": pinging container registry ${host}: ${neterr.split(': pinging container registry ' + host + ': ')[1] || 'network error'}`, 125);
        this._store().loggedIn.add(host);
        return this._ok('Login Succeeded!');
    }

    // ----- containers
    _findContainer(st, ref) {
        if (!ref) return null;
        return st.containers.find(c => c.name === ref || c.id === ref || (ref.length >= 3 && c.id.startsWith(ref))) || null;
    }

    _cmdPs(rest) {
        const st = this._store();
        const all = rest.includes('-a') || rest.includes('--all');
        const quiet = rest.includes('-q') || rest.includes('--quiet');
        const fmtI = rest.indexOf('--format');
        const fmt = fmtI >= 0 ? rest[fmtI + 1] : (rest.find(a => a.startsWith('--format=')) || '').slice(9) || null;
        const noTrunc = rest.includes('--no-trunc');
        const filters = [];
        rest.forEach((a, i) => { if (a === '--filter' || a === '-f') filters.push(rest[i + 1]); else if (a.startsWith('--filter=')) filters.push(a.slice(9)); });
        let list = st.containers.filter(c => all || c.state === 'running');
        for (const f of filters) {
            const [k, v] = f.split('=');
            if (k === 'name') list = list.filter(c => c.name.includes(v));
            else if (k === 'status') list = list.filter(c => (c.state === v) || (v === 'exited' && c.state === 'exited'));
            else if (k === 'ancestor') list = list.filter(c => c.image.includes(v));
            else if (k === 'id') list = list.filter(c => c.id.startsWith(v));
        }
        if (quiet) return this._ok(list.map(c => c.id.slice(0, 12)).join('\n'));
        const obj = (c) => ({ ID: noTrunc ? c.id : c.id.slice(0, 12), Names: c.name, Image: this._imgName(c), Command: c.cmdStr, Status: this._status(c), State: c.state, Ports: this._portsStr(c), CreatedAt: c.created.toISOString(), Created: this._ago(c.created), Pid: c.pid || 0 });
        if (fmt) {
            if (fmt === 'table') return this._ok(this._table(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'], list.map(c => this._psRow(c))));
            return this._ok(list.map(c => this._tpl(fmt.replace(/^table\s+/, ''), obj(c))).join('\n'));
        }
        return this._ok(this._table(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'], list.map(c => this._psRow(c))).replace(/^(.*)$/m, m => m));
    }

    _psRow(c) { return [c.id.slice(0, 12), this._imgName(c), c.cmdStr.length > 20 ? c.cmdStr.slice(0, 17) + '...' : c.cmdStr, this._ago(c.created), this._status(c), this._portsStr(c), c.name]; }
    _imgName(c) { return c.image.replace(/:latest$/, ':latest'); }
    _portsStr(c) { return c.ports.map(p => `${p.ip === '0.0.0.0' || !p.ip ? '0.0.0.0' : p.ip}:${p.host}->${p.cont}/${p.proto}`).join(', '); }
    _status(c) {
        if (c.state === 'running') return `Up ${this._ago(c.started).replace(' ago', '')}`.replace('Up Less than a second', 'Up Less than a second');
        if (c.state === 'exited') return `Exited (${c.exitCode}) ${this._ago(c.finished || c.created)}`;
        return 'Created';
    }

    _parseRunArgs(rest) {
        const o = { detach: false, name: null, ports: [], publishAll: false, vols: [], env: [], rm: false, tty: false, interactive: false, user: null, workdir: null, restart: null, hostname: null, entrypoint: null, network: null, labels: [], replace: false, pull: 'missing', cidfile: null, memory: null, sdnotify: null };
        const argv = [];
        let image = null, cmd = [];
        for (let i = 0; i < rest.length; i++) {
            const a = rest[i];
            if (image) { cmd.push(a); continue; }
            const val = () => rest[++i];
            if (a === '-d' || a === '--detach') o.detach = true;
            else if (/^-[dit]{2,}$/.test(a)) { if (a.includes('d')) o.detach = true; if (a.includes('i')) o.interactive = true; if (a.includes('t')) o.tty = true; }
            else if (a === '-t' || a === '--tty') o.tty = true;
            else if (a === '-i' || a === '--interactive') o.interactive = true;
            else if (a === '--rm') o.rm = true;
            else if (a === '--replace') o.replace = true;
            else if (a === '-P' || a === '--publish-all') o.publishAll = true;
            else if (a === '--name') o.name = val(); else if (a.startsWith('--name=')) o.name = a.slice(7);
            else if (a === '-p' || a === '--publish') o.ports.push(val()); else if (a.startsWith('--publish=')) o.ports.push(a.slice(10));
            else if (a === '-v' || a === '--volume') o.vols.push(val()); else if (a.startsWith('--volume=')) o.vols.push(a.slice(9));
            else if (a === '--mount') o.vols.push('mount:' + val());
            else if (a === '-e' || a === '--env') o.env.push(val()); else if (a.startsWith('--env=')) o.env.push(a.slice(6));
            else if (a === '-u' || a === '--user') o.user = val();
            else if (a === '-w' || a === '--workdir') o.workdir = val();
            else if (a === '--restart') o.restart = val(); else if (a.startsWith('--restart=')) o.restart = a.slice(10);
            else if (a === '--hostname' || a === '-h') o.hostname = val();
            else if (a === '--entrypoint') o.entrypoint = val();
            else if (a === '--network' || a === '--net') o.network = val();
            else if (a === '-l' || a === '--label') o.labels.push(val());
            else if (a === '--pull') o.pull = val(); else if (a.startsWith('--pull=')) o.pull = a.slice(7);
            else if (a === '--cidfile') o.cidfile = val(); else if (a.startsWith('--cidfile=')) o.cidfile = a.slice(10);
            else if (a === '--memory' || a === '-m' || a === '--cpus' || a === '--cgroups' || a === '--sdnotify' || a === '--security-opt' || a === '--cap-add' || a === '--cap-drop' || a === '--dns' || a === '--add-host' || a === '--env-file' || a === '--pod' || a === '--log-driver' || a === '--timeout' || a === '--userns' || a === '--stop-timeout' || a === '--tz') i++;
            else if (a.startsWith('-') && a.length > 1) { /* tolerated flag */ }
            else image = a;
        }
        return { o, image, cmd };
    }

    _cmdRun(rest, createOnly) {
        const st = this._store();
        const { o, image, cmd } = this._parseRunArgs(rest);
        if (!image) return this._err('Error: must specify image', 125);
        const out = [];
        // image
        let img = this._localImage(st, image);
        if (!img) {
            const res = this._pull(st, image, false);
            if (res.err) return this._err(res.err, 125);
            img = res.image;
            out.push(...res.lines);
        }
        // name conflicts
        if (o.name) {
            const clash = st.containers.find(c => c.name === o.name);
            if (clash && o.replace) this._removeContainer(st, clash);
            else if (clash) return this._err(`Error: creating container storage: the container name "${o.name}" is already in use by ${clash.id}. You have to remove that container to be able to reuse that name: that name is already in use`, 125);
        }
        const entry = img.entry || {};
        // env requirements of database images
        const envMap = {};
        for (const e of (img.env || [])) { const [k, ...v] = e.split('='); envMap[k] = v.join('='); }
        for (const e of o.env) { const [k, ...v] = e.split('='); envMap[k] = v.join('='); }
        // volumes
        const vols = [];
        for (const v of o.vols) {
            let spec = v;
            if (v.startsWith('mount:')) {
                const m = {}; v.slice(6).split(',').forEach(kv => { const [k, val] = kv.split('='); m[k] = val === undefined ? true : val; });
                spec = `${m.source || m.src}:${m.destination || m.dst || m.target}${m.relabel ? ':' + (m.relabel === 'private' ? 'Z' : 'z') : ''}`;
            }
            const parts = spec.split(':');
            const src = parts[0], dst = parts[1], opts = (parts[2] || '').split(',').filter(Boolean);
            if (!dst) return this._err(`Error: invalid container path "${src}", must be an absolute path`, 125);
            if (!dst.startsWith('/')) return this._err(`Error: invalid container path "${dst}", must be an absolute path`, 125);
            if (src.startsWith('/') || src.startsWith('./') || src.startsWith('~')) {
                const abs = this.fs.resolvePath(src.replace(/^~/, (this.fs.users[this._user()] || {}).home || '/root'));
                const n = this._node(abs);
                if (!n) return this._err(`Error: statfs ${abs}: no such file or directory`, 125);
                vols.push({ src: abs, dst, opts, host: true });
            } else {
                if (!st.volumes[src]) { st.volumes[src] = { name: src, created: this._now(), mount: `/var/lib/containers/storage/volumes/${src}/_data` }; this._mkdirp(st.volumes[src].mount); }
                vols.push({ src, dst, opts, host: false, volume: true });
            }
        }
        // :z / :Z relabel the host directory so container_t may use it
        const se = this.shared.selinux;
        for (const v of vols) {
            if (v.host && (v.opts.includes('Z') || v.opts.includes('z'))) {
                const asRoot = this.parent.chcon;
                if (asRoot) { const s = { u: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid }; this.fs.currentUser = 'root'; this.fs.currentUid = 0; this.fs.currentGid = 0; try { this.parent.chcon(['-R', '-t', 'container_file_t', v.src]); } catch (e) { /* label engine unavailable */ } finally { this.fs.currentUser = s.u; this.fs.currentUid = s.uid; this.fs.currentGid = s.gid; } }
            }
        }
        // ports
        const ports = [];
        const rootless = !this._isRoot();
        const unpriv = this._unprivStart();
        for (const spec of o.ports) {
            const m = /^(?:(\d{1,3}(?:\.\d{1,3}){3}):)?(?:(\d+)(?:-\d+)?:)?(\d+)(?:-\d+)?(?:\/(tcp|udp))?$/.exec(spec);
            if (!m) return this._err(`Error: invalid containerPort: ${spec}`, 125);
            const cont = parseInt(m[3], 10);
            let host = m[2] ? parseInt(m[2], 10) : this._randomPort();
            ports.push({ ip: m[1] || '0.0.0.0', host, cont, proto: m[4] || 'tcp' });
        }
        if (o.publishAll) for (const p of (img.ports || [])) ports.push({ ip: '0.0.0.0', host: this._randomPort(), cont: p, proto: 'tcp' });
        for (const p of ports) {
            if (rootless && p.host < unpriv) return this._err(`Error: rootlessport cannot expose privileged port ${p.host}, you can add 'net.ipv4.ip_unprivileged_port_start=${p.host}' to /etc/sysctl.conf (currently ${unpriv}), or choose a larger port number (>= ${unpriv}): listen tcp ${p.ip}:${p.host}: bind: permission denied`, 126);
            if (!createOnly && this._portBusy(p.host, p.proto)) return this._err(rootless ? `Error: rootlessport listen tcp ${p.ip}:${p.host}: bind: address already in use` : `Error: cannot listen on the TCP port: listen tcp4 ${p.ip}:${p.host}: bind: address already in use`, 126);
        }
        // command
        let argv = cmd.length ? cmd : (o.entrypoint ? [o.entrypoint] : (img.cmd || ['/bin/sh']));
        if (o.entrypoint && cmd.length) argv = [o.entrypoint, ...cmd];
        const needs = entry.needsEnv;
        const id = this._hex(64);
        const name = o.name || this.names[Math.floor(Math.random() * this.names.length)];
        const c = { id, name, image: img.ref, imageId: img.id, entry, argv, cmdStr: argv.join(' '), created: this._now(), started: null, finished: null, state: 'created', exitCode: 0, ports, vols, env: envMap, rm: o.rm, restart: o.restart, hostname: o.hostname || id.slice(0, 12), user: o.user || img.user || '', workdir: o.workdir || img.workdir || '/', logs: [], owner: this._user(), pid: 0, ip: rootless ? '10.0.2.100' : this._nextIp(st), tty: o.tty, interactive: o.interactive, labels: o.labels };
        st.containers.push(c);
        if (o.cidfile) this._write(this.fs.resolvePath(o.cidfile), id);
        if (createOnly) return this._ok(id);
        const r = this._startContainer(st, c, needs);
        if (r.err) { return this._err(r.err, 126); }
        // foreground run prints the command's output; -d prints the id
        if (o.detach) return this._ok([...out, id].join('\n'));
        if ((o.tty || o.interactive) && this.shared.ctr && this.shared.ctr._shellLike(c.argv)) {
            // an interactive shell: the terminal switches over to the container until `exit`
            const r = this.shared.ctr._enter(c, 'run', { rm: o.rm });
            if (r.stderr) return r;
            return this._ok(out.join('\n'));
        }
        const logText = c.logs.join('\n');
        if (o.rm && c.state === 'exited') this._removeContainer(st, c);
        return { stdout: [...out, logText].filter(x => x !== '').join('\n'), stderr: c.stderr || '', exitCode: c.state === 'exited' ? c.exitCode : 0 };
    }

    _nextIp(st) { return '10.88.0.' + (2 + st.containers.length); }
    _randomPort() { return 32768 + Math.floor(Math.random() * 20000); }
    _unprivStart() { const n = this._node('/proc/sys/net/ipv4/ip_unprivileged_port_start'); return n && n.content ? parseInt(n.content, 10) || 1024 : 1024; }

    _portBusy(port, proto) {
        for (const st of Object.values(this.stores)) for (const c of st.containers) if (c.state === 'running' && c.ports.some(p => p.host === port && p.proto === proto)) return true;
        const svc = this.shared.svc;
        if (svc && svc._listeners) { try { if (svc._listeners().some(r => r.port === port && r.proto === proto)) return true; } catch (e) { /* ignore */ } }
        return false;
    }

    // run the container: simple daemons stay up, commands run to completion
    _startContainer(st, c, needsEnv) {
        const entry = c.entry || {};
        const base = c.argv[0] ? c.argv[0].split('/').pop() : '';
        c.logs = [];
        c.stderr = '';
        if (needsEnv && !c.env[needsEnv] && !Object.keys(c.env).some(k => /PASSWORD|ALLOW_EMPTY/.test(k))) {
            c.state = 'exited'; c.exitCode = 1; c.started = this._now(); c.finished = this._now();
            c.logs.push(`Database is uninitialized and superuser password is not specified.\n       You must specify ${needsEnv} to a non-empty value for the superuser. For example,\n       "-e ${needsEnv}=password" on "docker run".`);
            return {};
        }
        // port clash with a container that is already running
        for (const p of c.ports) {
            if (this._portBusy(p.host, p.proto) && !(c.state === 'running')) {
                const same = st.containers.some(x => x !== c && x.state === 'running' && x.ports.some(q => q.host === p.host && q.proto === p.proto));
                if (same) return { err: this._isRoot() ? `Error: cannot listen on the TCP port: listen tcp4 ${p.ip}:${p.host}: bind: address already in use` : `Error: rootlessport listen tcp ${p.ip}:${p.host}: bind: address already in use` };
            }
        }
        const daemonKinds = { httpd: true, nginx: true, db: true };
        const longSleep = base === 'sleep' && (c.argv[1] === 'infinity' || parseInt(c.argv[1], 10) >= 30);
        const shellTty = (c.tty || c.interactive) && this.shared.ctr && this.shared.ctr._shellLike(c.argv);
        const isDaemon = (entry.daemon && !this._cmdOverride(c)) || longSleep || shellTty || ['tail', 'init'].includes(base) && c.argv.includes('-f');
        c.started = this._now();
        c.finished = null;
        if (isDaemon) {
            c.state = 'running';
            this._spawnProcs(c);
            if (entry.kind === 'httpd') c.logs.push(`AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using ${c.ip}. Set the 'ServerName' directive globally to suppress this message`, `[${this._stamp()}] [mpm_event:notice] [pid 1:tid 1] AH00489: Apache/2.4.57 (Unix) configured -- resuming normal operations`, `[${this._stamp()}] [core:notice] [pid 1:tid 1] AH00094: Command line: 'httpd -D FOREGROUND'`);
            else if (entry.kind === 'nginx') c.logs.push('/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh', `${this._stamp(true)} [notice] 1#1: nginx/1.25.3`, `${this._stamp(true)} [notice] 1#1: start worker processes`);
            else if (entry.kind === 'db') c.logs.push(`${this._stamp()} 0 [Note] ${base} starting as process 1 ...`, `${this._stamp()} 0 [Note] ready for connections.`);
            return {};
        }
        const r = this._execIn(c, c.argv, { stdinText: '' });
        c.logs.push(...(r.out ? r.out.replace(/\n$/, '').split('\n') : []));
        c.stderr = r.err || '';
        if (r.notFound) { c.state = 'exited'; c.exitCode = 127; c.finished = this._now(); c.stderr = `Error: crun: executable file \`${c.argv[0]}\` not found in $PATH: No such file or directory: OCI runtime attempted to invoke a command that was not found`; c.logs = []; return {}; }
        if (r.sleeps) { c.state = 'running'; this._spawnProcs(c); return {}; }
        c.state = 'exited'; c.exitCode = r.code; c.finished = this._now();
        return {};
    }

    _cmdOverride(c) { return c.argv.join(' ') !== (c.entry && c.entry.cmd ? c.entry.cmd.join(' ') : ''); }
    _stamp(nginx) { const tm = this._tm(); const d = this._now(); return tm ? tm.format(d, tm.tm.tz, nginx ? '%Y/%m/%d %H:%M:%S' : '%a %b %d %H:%M:%S.000000 %Y') : d.toISOString(); }

    _spawnProcs(c) {
        const P = this.shared.processes;
        const user = c.owner;
        const conmon = this.nextPid++;
        const main = this.nextPid++;
        c.pid = main; c.conmon = conmon;
        P.push({ pid: conmon, ppid: 1, user, cpu: 0, mem: 0.1, tty: '?', stat: 'Ssl', ni: 0, command: `/usr/bin/conmon --api-version 1 -c ${c.id} -u ${c.id} -r /usr/bin/crun -b /var/lib/containers/storage/overlay-containers/${c.id}/userdata -p /run/containers/storage/overlay-containers/${c.id}/userdata/pidfile -n ${c.name}`, comm: 'conmon', service: null, container: c.id, domain: 'container_runtime_t', start: '', time: '00:00:00' });
        const argv = c.argv.join(' ');
        const shown = c.entry && c.entry.kind === 'nginx' ? 'nginx: master process nginx -g daemon off;' : (c.entry && c.entry.kind === 'httpd' ? 'httpd -DFOREGROUND' : argv);
        P.push({ pid: main, ppid: conmon, user, cpu: 0, mem: 0.2, tty: '?', stat: 'Ss', ni: 0, command: shown, comm: shown.split(' ')[0].replace(/:$/, '').slice(0, 15), service: null, container: c.id, domain: 'container_t', start: '', time: '00:00:00' });
        P.sort((a, b) => a.pid - b.pid);
    }

    _killProcs(c) {
        const P = this.shared.processes;
        for (let i = P.length - 1; i >= 0; i--) if (P[i].container === c.id) P.splice(i, 1);
        c.pid = 0;
    }

    _stopContainer(c, killed) {
        if (c.state !== 'running') return;
        this._killProcs(c);
        c.state = 'exited';
        c.exitCode = killed ? 137 : 0;
        c.finished = this._now();
    }

    _removeContainer(st, c) {
        this._stopContainer(c, true);
        const i = st.containers.indexOf(c);
        if (i >= 0) st.containers.splice(i, 1);
    }

    _cmdAttach(rest) {
        const st = this._store();
        const ref = rest.filter(a => !a.startsWith('-'))[0];
        const c = this._findContainer(st, ref);
        if (!ref) return this._err('Error: you must provide one container name or id', 125);
        if (!c) return this._err(`Error: no container with name or ID "${ref}" found: no such container`, 125);
        if (c.state !== 'running') return this._err('Error: can only attach to running containers', 125);
        if (this.shared.ctr && this.shared.ctr._shellLike(c.argv) && (c.tty || c.interactive)) return this.shared.ctr._enter(c, 'attach', {});
        return this._ok((c.logs || []).join('\n'));
    }

    _cmdStart(rest) {
        const st = this._store();
        const refs = rest.filter(a => !a.startsWith('-'));
        if ((rest.includes('-a') || rest.includes('--attach')) && (rest.includes('-i') || rest.includes('--interactive')) && refs.length === 1 && this.shared.ctr) {
            const c0 = this._findContainer(st, refs[0]);
            if (c0 && c0.state !== 'running' && this.shared.ctr._shellLike(c0.argv)) {
                c0.state = 'running'; c0.started = this._now(); c0.finished = null; c0.tty = true; c0.interactive = true;
                this._spawnProcs(c0);
                return this.shared.ctr._enter(c0, 'start', {});
            }
            if (c0 && c0.state === 'running') return this._cmdAttach([refs[0]]);
        }
        if (!refs.length) return this._err('Error: no container with name or ID "" found: no such container', 125);
        const out = [], errs = [];
        let code = 0;
        for (const r of refs) {
            const c = this._findContainer(st, r);
            if (!c) { errs.push(`Error: no container with name or ID "${r}" found: no such container`); code = 125; continue; }
            if (c.state === 'running') { out.push(c.name); continue; }
            const res = this._startContainer(st, c, (c.entry || {}).needsEnv);
            if (res.err) { errs.push(res.err); code = 125; continue; }
            if (c.state === 'exited' && c.exitCode) { errs.push(`Error: unable to start container "${c.id}": ${c.stderr.replace(/^Error: /, '') || 'container exited immediately'}`); code = 125; continue; }
            out.push(c.name);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _cmdStop(rest) {
        const st = this._store();
        const all = rest.includes('-a') || rest.includes('--all');
        const refs = rest.filter((a, i) => !a.startsWith('-') && !['-t', '--time'].includes(rest[i - 1]));
        const list = all ? st.containers.filter(c => c.state === 'running').map(c => c.name) : refs;
        if (!list.length) return this._err('Error: no container with name or ID "" found: no such container', 125);
        const out = [], errs = [];
        let code = 0;
        for (const r of list) {
            const c = this._findContainer(st, r);
            if (!c) { errs.push(`Error: no container with name or ID "${r}" found: no such container`); code = 125; continue; }
            this._stopContainer(c, false);
            out.push(c.name);
            if (c.rm) this._removeContainer(st, c);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _cmdRestart(rest) {
        const st = this._store();
        const refs = rest.filter((a, i) => !a.startsWith('-') && !['-t', '--time'].includes(rest[i - 1]));
        const out = [];
        for (const r of refs) {
            const c = this._findContainer(st, r);
            if (!c) return this._err(`Error: no container with name or ID "${r}" found: no such container`, 125);
            this._stopContainer(c, false);
            const res = this._startContainer(st, c, (c.entry || {}).needsEnv);
            if (res.err) return this._err(res.err, 125);
            out.push(c.name);
        }
        return this._ok(out.join('\n'));
    }

    _cmdKill(rest) {
        const st = this._store();
        const refs = rest.filter((a, i) => !a.startsWith('-') && rest[i - 1] !== '-s' && rest[i - 1] !== '--signal');
        const out = [];
        for (const r of refs) {
            const c = this._findContainer(st, r);
            if (!c) return this._err(`Error: no container with name or ID "${r}" found: no such container`, 125);
            if (c.state !== 'running') return this._err(`Error: can only kill running containers. ${c.id} is in state ${c.state}: container state improper`, 125);
            this._stopContainer(c, true);
            out.push(c.name);
        }
        return this._ok(out.join('\n'));
    }

    _cmdRm(rest) {
        const st = this._store();
        const force = rest.includes('-f') || rest.includes('--force');
        const all = rest.includes('-a') || rest.includes('--all');
        const refs = all ? st.containers.map(c => c.name) : rest.filter(a => !a.startsWith('-'));
        if (!refs.length && all) return this._ok('');
        if (!refs.length) return this._err('Error: no container with name or ID "" found: no such container', 125);
        const out = [], errs = [];
        let code = 0;
        for (const r of refs) {
            const c = this._findContainer(st, r);
            if (!c) { errs.push(`Error: no container with name or ID "${r}" found: no such container`); code = 1; continue; }
            if (c.state === 'running' && !force) { errs.push(`Error: cannot remove container ${c.id} as it is running - running or paused containers cannot be removed without force: container state improper`); code = 2; continue; }
            this._removeContainer(st, c);
            out.push(r === c.name || all ? (all ? c.id : r) : c.id);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: code };
    }

    _cmdRename(rest) {
        const st = this._store();
        const [a, b] = rest.filter(x => !x.startsWith('-'));
        const c = this._findContainer(st, a);
        if (!c) return this._err(`Error: no container with name or ID "${a}" found: no such container`, 125);
        c.name = b; return this._ok('');
    }

    // ----- exec / logs / top / port / inspect
    _cmdExec(rest) {
        const st = this._store();
        const opts = { user: null };
        let i = 0;
        for (; i < rest.length; i++) { const a = rest[i]; if (a === '-u' || a === '--user' || a === '-w' || a === '--workdir' || a === '-e' || a === '--env') { if (a === '-u' || a === '--user') opts.user = rest[i + 1]; if (a === '-w' || a === '--workdir') opts.workdir = rest[i + 1]; i++; } else if (/^-[a-zA-Z]*[it][a-zA-Z]*$/.test(a) || a === '--interactive' || a === '--tty') { opts.inter = true; } else if (a.startsWith('-')) continue; else break; }
        const ref = rest[i];
        const cmd = rest.slice(i + 1);
        const c = this._findContainer(st, ref);
        if (!ref) return this._err('Error: must provide a non-empty container name or ID', 125);
        if (!c) return this._err(`Error: no container with name or ID "${ref}" found: no such container`, 125);
        if (c.state !== 'running') return this._err(`Error: can only create exec sessions on running containers: container state improper`, 125);
        if (!cmd.length) return this._err('Error: must provide a non-empty command to start an exec session: invalid argument', 125);
        if (opts.inter && this.shared.ctr && this.shared.ctr._shellLike(cmd)) return this.shared.ctr._enter(c, 'exec', { user: opts.user, workdir: opts.workdir });
        const r = this._execIn(c, cmd, { user: opts.user, workdir: opts.workdir });
        if (r.notFound) return { stdout: '', stderr: `Error: crun: executable file \`${cmd[0]}\` not found in $PATH: No such file or directory: OCI runtime attempted to invoke a command that was not found`, exitCode: 127 };
        return { stdout: (r.out || '').replace(/\n$/, ''), stderr: (r.err || '').replace(/\n$/, ''), exitCode: r.code };
    }

    // a tiny userland for the commands people actually run in containers
    _execIn(c, argv, o) {
        const os = (c.entry && c.entry.os) || { name: 'Linux', id: 'linux', ver: '1', vid: '1', pretty: 'Linux' };
        const user = (o && o.user) || c.user || 'root';
        const uname = /^\d+$/.test(user) ? (user === '0' ? 'root' : 'default') : user;
        let [cmd, ...a] = argv;
        const base = cmd.split('/').pop();
        const res = (out, code = 0, err = '') => ({ out: out === '' ? '' : out + '\n', err: err ? err + '\n' : '', code });
        const daemonish = ['redis-server', 'postgres', 'mysqld', 'mariadbd', 'run-mysqld', 'run-httpd', 'httpd-foreground', 'init'].includes(base) || (base === 'sleep' && (a[0] === 'infinity' || parseFloat(a[0]) >= 30)) || (base === 'tail' && a.includes('-f')) || ((base === 'nginx' || base === 'httpd') && a.some(x => /daemon off|-DFOREGROUND/.test(x))) || (/^(ba|da|a)?sh$/.test(base) && !a.length);
        if (this.shared.ctr && !daemonish && !(c.entry && c.entry.os && c.entry.os.id === 'rhel' && false)) {
            const rr = this.shared.ctr._run(c, argv, o);
            if (rr && !rr.notFound) return rr;
            if (rr && rr.notFound) return { notFound: true, out: '', err: '', code: 127 };
        }
        if (base === 'sh' || base === 'bash') {
            const ci = a.indexOf('-c');
            if (ci >= 0 && a[ci + 1] !== undefined) {
                const parts = a[ci + 1].split(/\s*(?:&&|;)\s*/).filter(Boolean);
                let out = '', err = '', code = 0;
                for (const p of parts) { const w = p.match(/"[^"]*"|'[^']*'|\S+/g).map(x => x.replace(/^["']|["']$/g, '')); const r = this._execIn(c, w, o); out += r.out; err += r.err; code = r.code; if (r.notFound) return r; if (code) break; }
                return { out, err, code };
            }
            return { out: '', err: '', code: 0 };
        }
        switch (base) {
            case 'echo': return res(a.join(' '));
            case 'true': return res('', 0);
            case 'false': return res('', 1);
            case 'whoami': return res(uname);
            case 'id': return res(uname === 'root' ? 'uid=0(root) gid=0(root) groups=0(root)' : `uid=${/^\d+$/.test(user) ? user : 1001}(${uname}) gid=0(root) groups=0(root)`);
            case 'hostname': return res(c.hostname);
            case 'pwd': return res(c.workdir);
            case 'uname': return res(a.includes('-r') ? '5.14.0-362.8.1.el9_3.x86_64' : a.includes('-a') ? 'Linux ' + c.hostname + ' 5.14.0-362.8.1.el9_3.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' : 'Linux');
            case 'date': return res(this._stamp().replace(/\.\d+/, ''));
            case 'env': case 'printenv': return res(['PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'TERM=xterm', `HOSTNAME=${c.hostname}`, 'container=oci', ...Object.entries(c.env).map(([k, v]) => `${k}=${v}`), 'HOME=/root'].join('\n'));
            case 'sleep': { const n = parseFloat(a[0]); if (a[0] === 'infinity' || n >= 30) return { out: '', err: '', code: 0, sleeps: true }; return res('', 0); }
            case 'ls': {
                const target = a.filter(x => !x.startsWith('-'))[0] || c.workdir;
                const v = c.vols.find(x => target === x.dst || target.startsWith(x.dst + '/'));
                if (v && v.host) {
                    if (!this._volAllowed(c, v)) return res('', 2, `ls: cannot open directory '${target}': Permission denied`);
                    const n = this._node(v.src + target.slice(v.dst.length));
                    if (n && n.children) return res(Object.keys(n.children).sort().join('  '));
                }
                if (target === '/') return res('bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var');
                if (target === '/etc') return res('hostname  hosts  os-release  passwd  resolv.conf');
                return res('');
            }
            case 'cat': {
                const f = a.filter(x => !x.startsWith('-'))[0];
                if (!f) return res('');
                if (f === '/etc/os-release') return res(`NAME="${os.name}"\nVERSION="${os.ver}"\nID="${os.id}"\nVERSION_ID="${os.vid}"\nPRETTY_NAME="${os.pretty}"`);
                if (f === '/etc/hostname') return res(c.hostname);
                if (f === '/etc/redhat-release' && os.id === 'rhel') return res(`Red Hat Enterprise Linux release ${os.vid} (${os.ver.replace(/^[\d.]+ \(|\)$/g, '')})`);
                if (f === '/etc/passwd') return res('root:x:0:0:root:/root:/bin/bash');
                const v = c.vols.find(x => f.startsWith(x.dst + '/') || f === x.dst);
                if (v && v.host) {
                    if (!this._volAllowed(c, v)) return res('', 1, `cat: ${f}: Permission denied`);
                    const n = this._node(v.src + f.slice(v.dst.length));
                    if (n && n.type === 'file') return res((n.content || '').replace(/\n$/, ''));
                }
                return res('', 1, `cat: ${f}: No such file or directory`);
            }
            case 'touch': case 'mkdir': {
                const f = a.filter(x => !x.startsWith('-'))[0] || '';
                const v = c.vols.find(x => f.startsWith(x.dst + '/') || f === x.dst);
                if (v && v.host) {
                    if (!this._volAllowed(c, v)) return res('', 1, `${base}: cannot ${base === 'touch' ? 'touch' : 'create directory'} '${f}': Permission denied`);
                    if (v.opts.includes('ro')) return res('', 1, `${base}: cannot ${base === 'touch' ? 'touch' : 'create directory'} '${f}': Read-only file system`);
                    const p = v.src + f.slice(v.dst.length);
                    if (base === 'touch') this._write(p, '', '0644'); else this._mkdirp(p);
                    return res('');
                }
                return res('');
            }
            case 'rpm': case 'dnf': case 'microdnf': case 'yum': {
                if (os.id !== 'rhel') return { notFound: true };
                if (a[0] === '-q' || a[0] === '--version') return res(a[0] === '--version' ? 'RPM version 4.16.1.3' : `package ${a[1] || ''} is not installed`, a[0] === '-q' ? 1 : 0);
                return res('Complete!');
            }
            case 'python3': case 'python': return base === 'python' && os.id !== 'debian' ? { notFound: true } : (a[0] === '--version' ? res('Python 3.9.18') : res(''));
            case 'curl': case 'wget': return res('', 6, `curl: (6) Could not resolve host: ${a[a.length - 1] || ''}`);
            case 'apk': return os.id === 'alpine' ? res('OK: 8 MiB in 16 packages') : { notFound: true };
            case 'apt': case 'apt-get': return os.id === 'debian' || os.id === 'ubuntu' ? res('Reading package lists... Done') : { notFound: true };
            case 'nginx': case 'httpd': return a.includes('-v') ? res(base === 'nginx' ? 'nginx version: nginx/1.25.3' : 'Server version: Apache/2.4.57 (Unix)') : res('');
            case 'redis-server': case 'postgres': case 'mysqld': case 'mariadbd': return { out: '', err: '', code: 0, sleeps: true };
            case 'bash': case 'sh': return res('');
            case 'tail': return a.includes('-f') ? { out: '', err: '', code: 0, sleeps: true } : res('');
            default: return { notFound: true, out: '', err: '', code: 127 };
        }
    }

    // SELinux: container_t may only use host directories labelled container_file_t (or relabelled with :z/:Z)
    _volAllowed(c, v) {
        const se = this.shared.selinux;
        if (!se || se.mode === 'disabled' || se.mode === 'permissive') return true;
        if (v.opts.includes('Z') || v.opts.includes('z')) return true;
        const n = this._node(v.src);
        if (!n) return true;
        let lab;
        try { lab = se.label(v.src, n); } catch (e) { return true; }
        const t = lab && lab.type;
        if (['container_file_t', 'svirt_sandbox_file_t', 'container_ro_file_t', 'container_share_t'].includes(t)) return true;
        // log the denial like the real system would
        try { se.logAvc({ src: 'container_t', comm: c.argv[0].split('/').pop(), exe: '/usr/bin/crun', perm: 'read', tclass: 'dir', tcontext: lab, path: v.src, user: 'root' }); } catch (e) { /* ignore */ }
        return false;
    }

    _cmdLogs(rest) {
        const st = this._store();
        const refs = rest.filter((a, i) => !a.startsWith('-') && !['--tail', '--since', '-n'].includes(rest[i - 1]));
        const c = this._findContainer(st, refs[0]);
        if (!refs.length) return this._err('Error: no container with name or ID "" found: no such container', 125);
        if (!c) return this._err(`Error: no container with name or ID "${refs[0]}" found: no such container`, 125);
        let logs = c.logs.slice();
        const ti = rest.findIndex(a => a === '--tail' || a === '-n');
        if (ti >= 0) logs = logs.slice(-parseInt(rest[ti + 1], 10));
        return this._ok(logs.join('\n'));
    }

    _cmdTop(rest) {
        const st = this._store();
        const c = this._findContainer(st, rest.filter(a => !a.startsWith('-'))[0]);
        if (!c) return this._err(`Error: no container with name or ID "${rest[0] || ''}" found: no such container`, 125);
        if (c.state !== 'running') return this._err('Error: top can only be used on running containers: container state improper', 125);
        return this._ok(`USER        PID         PPID        %CPU        ELAPSED         TTY         TIME        COMMAND\n${(c.user === '0' || !c.user ? 'root' : c.user).padEnd(12)}1           0           0.000       ${this._ago(c.started).replace(' ago', '')}  ?           0s          ${c.argv.join(' ')}`);
    }

    _cmdPort(rest) {
        const st = this._store();
        const a = rest.filter(x => !x.startsWith('-'));
        const all = rest.includes('-a') || rest.includes('--all');
        if (all) return this._ok(st.containers.filter(c => c.state === 'running' && c.ports.length).map(c => `${c.id.slice(0, 12)}\t${c.ports.map(p => `${p.cont}/${p.proto} -> ${p.ip}:${p.host}`).join('\n\t\t')}`).join('\n'));
        const c = this._findContainer(st, a[0]);
        if (!c) return this._err(`Error: no container with name or ID "${a[0] || ''}" found: no such container`, 125);
        let ps = c.ports;
        if (a[1]) ps = ps.filter(p => `${p.cont}/${p.proto}` === a[1] || String(p.cont) === a[1].split('/')[0]);
        if (a[1] && !ps.length) return this._err(`Error: failed to find published port "${a[1]}"`, 125);
        return this._ok(ps.map(p => a[1] ? `${p.ip}:${p.host}` : `${p.cont}/${p.proto} -> ${p.ip}:${p.host}`).join('\n'));
    }

    _inspectContainer(c) {
        return {
            Id: c.id, Created: c.created.toISOString(), Path: c.argv[0], Args: c.argv.slice(1),
            State: { OciVersion: '1.1.0', Status: c.state, Running: c.state === 'running', Paused: false, Restarting: false, OOMKilled: false, Dead: false, Pid: c.pid || 0, ExitCode: c.exitCode, Error: '', StartedAt: c.started ? c.started.toISOString() : '0001-01-01T00:00:00Z', FinishedAt: c.finished ? c.finished.toISOString() : '0001-01-01T00:00:00Z' },
            Image: c.imageId, ImageName: c.image, Name: c.name, RestartCount: 0, Driver: 'overlay',
            MountLabel: 'system_u:object_r:container_file_t:s0:c1,c2', ProcessLabel: 'system_u:system_r:container_t:s0:c1,c2',
            Mounts: c.vols.map(v => ({ Type: v.volume ? 'volume' : 'bind', Name: v.volume ? v.src : undefined, Source: v.src, Destination: v.dst, Driver: v.volume ? 'local' : undefined, Mode: v.opts.join(','), RW: !v.opts.includes('ro'), Propagation: 'rprivate' })),
            Config: { Hostname: c.hostname, Domainname: '', User: c.user, Env: ['PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'TERM=xterm', 'container=oci', ...Object.entries(c.env).map(([k, v]) => `${k}=${v}`), `HOSTNAME=${c.hostname}`], Cmd: c.argv, Image: c.image, WorkingDir: c.workdir, Labels: Object.fromEntries((c.labels || []).map(l => l.split('='))), Tty: !!c.tty },
            NetworkSettings: { IPAddress: c.state === 'running' ? c.ip : '', Gateway: '10.88.0.1', MacAddress: '2e:9a:' + c.id.slice(0, 8).replace(/(..)(?=.)/g, '$1:'), Ports: Object.fromEntries(c.ports.map(p => [`${p.cont}/${p.proto}`, [{ HostIp: p.ip === '0.0.0.0' ? '' : p.ip, HostPort: String(p.host) }]])) },
            HostConfig: { Binds: c.vols.map(v => `${v.src}:${v.dst}${v.opts.length ? ':' + v.opts.join(',') : ''}`), PortBindings: Object.fromEntries(c.ports.map(p => [`${p.cont}/${p.proto}`, [{ HostIp: p.ip === '0.0.0.0' ? '' : p.ip, HostPort: String(p.host) }]])), RestartPolicy: { Name: c.restart || '', MaximumRetryCount: 0 }, AutoRemove: !!c.rm, NetworkMode: this._isRoot() ? 'bridge' : 'slirp4netns' }
        };
    }

    _inspectImage(i) {
        return { Id: i.id, Digest: 'sha256:' + i.id, RepoTags: [i.ref], RepoDigests: [`${i.repo}@sha256:${i.id}`], Parent: '', Created: i.created.toISOString(), Config: { User: i.user, ExposedPorts: Object.fromEntries((i.ports || []).map(p => [`${p}/tcp`, {}])), Env: ['PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', ...(i.env || [])], Cmd: i.cmd, WorkingDir: i.workdir === '/' ? '' : i.workdir, Labels: { architecture: 'x86_64' } }, Architecture: 'amd64', Os: 'linux', Size: Math.round(i.size * 1048576), VirtualSize: Math.round(i.size * 1048576), Labels: {}, NamesHistory: [i.ref] };
    }

    _cmdInspect(rest) {
        const st = this._store();
        let fmt = null, type = null;
        const refs = [];
        for (let i = 0; i < rest.length; i++) {
            const a = rest[i];
            if (a === '--format' || a === '-f') fmt = rest[++i];
            else if (a.startsWith('--format=')) fmt = a.slice(9);
            else if (a === '--type' || a === '-t') type = rest[++i];
            else if (a.startsWith('-')) continue;
            else refs.push(a);
        }
        if (!refs.length) return this._err('Error: you must provide at least one name or id', 125);
        const out = [];
        for (const r of refs) {
            let obj = null;
            if (type !== 'image') { const c = this._findContainer(st, r); if (c) obj = this._inspectContainer(c); }
            if (!obj && type !== 'container') { const i = this._localImage(st, r); if (i) obj = this._inspectImage(i); }
            if (!obj && type !== 'container' && type !== 'image' && st.volumes[r]) { const v = st.volumes[r]; obj = { Name: v.name, Driver: 'local', Mountpoint: v.mount, CreatedAt: v.created.toISOString(), Labels: {}, Scope: 'local', Options: {} }; }
            if (!obj) return this._err(`Error: inspecting object: no such ${type || 'object'}: "${r}"`, 125);
            out.push(obj);
        }
        if (fmt) return this._ok(out.map(o => this._tpl(fmt, o)).join('\n'));
        return this._ok(JSON.stringify(out, null, 4));
    }

    // ----- build
    _cmdBuild(rest) {
        const st = this._store();
        let tag = null, file = null;
        const pos = [];
        for (let i = 0; i < rest.length; i++) {
            const a = rest[i];
            if (a === '-t' || a === '--tag') tag = rest[++i]; else if (a.startsWith('--tag=')) tag = a.slice(6);
            else if (a === '-f' || a === '--file') file = rest[++i]; else if (a.startsWith('--file=')) file = a.slice(7);
            else if (a === '--build-arg' || a === '--format' || a === '--target' || a === '--platform' || a === '--layers') i += a === '--layers' ? 0 : 1;
            else if (a.startsWith('-')) continue;
            else pos.push(a);
        }
        const ctx = this.fs.resolvePath(pos[0] || '.');
        const cn = this._node(ctx);
        if (!cn || cn.type !== 'directory') return this._err(`Error: building at STEP "": context directory ${pos[0] || '.'} does not exist`, 125);
        let fpath = file ? this.fs.resolvePath(file) : null;
        if (!fpath) for (const n of ['Containerfile', 'Dockerfile']) if (cn.children && cn.children[n]) { fpath = ctx + '/' + n; break; }
        const fnode = fpath ? this._node(fpath) : null;
        if (!fnode) return this._err(`Error: no Containerfile or Dockerfile specified or found in context directory, ${ctx}: ${file ? 'no such file or directory' : 'no such file or directory'}`, 125);
        const lines = [];
        const raw = (fnode.content || '').split('\n');
        const insns = [];
        for (let i = 0; i < raw.length; i++) { let l = raw[i].trim(); if (!l || l.startsWith('#')) continue; while (l.endsWith('\\') && i + 1 < raw.length) { l = l.slice(0, -1) + ' ' + raw[++i].trim(); } const m = /^(\w+)\s*(.*)$/.exec(l); if (m) insns.push([m[1].toUpperCase(), m[2]]); }
        if (!insns.length || insns[0][0] !== 'FROM') return this._err(`Error: parsing ${fpath.split('/').pop()}: no FROM instruction found`, 125);
        const total = insns.length;
        let base = null, cmd = null, ports = [], env = [], user = '', workdir = '/';
        let n = 0;
        const stepOut = [];
        for (const [op, arg] of insns) {
            n++;
            stepOut.push(`STEP ${n}/${total}: ${op} ${arg}`);
            if (op === 'FROM') {
                const refName = arg.split(/\s+/)[0];
                let img = this._localImage(st, refName);
                if (!img) { const res = this._pull(st, refName, false); if (res.err) return { stdout: stepOut.slice(0, -1).join('\n'), stderr: `${res.err}\nError: creating build container: ${res.err.replace(/^Error: /, '')}`.split('\n')[0], exitCode: 125 }; img = res.image; stepOut.push(...res.lines); }
                base = img; cmd = img.cmd; ports = (img.ports || []).slice(); user = img.user || ''; env = (img.env || []).slice();
            } else if (op === 'RUN') {
                if (!base) continue;
                const os = (base.entry && base.entry.os) || {};
                if (/\b(dnf|yum|microdnf)\b/.test(arg) && os.id !== 'rhel') return { stdout: stepOut.join('\n'), stderr: `/bin/sh: ${arg.match(/\b(dnf|yum|microdnf)\b/)[1]}: command not found\nError: building at STEP "RUN ${arg}": while running runtime: exit status 127`, exitCode: 127 };
                if (/\bapt(-get)?\b/.test(arg) && !['debian', 'ubuntu'].includes(os.id)) return { stdout: stepOut.join('\n'), stderr: `/bin/sh: apt-get: command not found\nError: building at STEP "RUN ${arg}": while running runtime: exit status 127`, exitCode: 127 };
                if (/\b(dnf|yum|microdnf) .*install/.test(arg)) { const pk = arg.replace(/.*install\s+/, '').split(/\s+/).filter(x => !x.startsWith('-') && x !== '&&'); const cat = this.shared.pkg && this.shared.pkg.cat; const bad = cat ? pk.find(p => !cat[p] && /^[\w.+-]+$/.test(p)) : null; if (bad) return { stdout: stepOut.join('\n'), stderr: `No match for argument: ${bad}\nError: Unable to find a match: ${bad}\nError: building at STEP "RUN ${arg}": while running runtime: exit status 1`, exitCode: 1 }; }
                stepOut.push(`--> ${this._hex(11)}`);
            } else if (op === 'COPY' || op === 'ADD') {
                const parts = arg.replace(/^--\S+\s+/, '').split(/\s+/);
                const srcs = parts.slice(0, -1);
                for (const s of srcs) { if (/^https?:/.test(s)) continue; const sp = this.fs.resolvePath(s, ctx); const abs = s.startsWith('/') ? s : ctx + '/' + s; if (!this._node(abs.replace(/\/\.$/, ''))) return { stdout: stepOut.join('\n'), stderr: `Error: building at STEP "${op} ${arg}": checking on sources under "${ctx}": copier: stat: "${s.startsWith('/') ? s : '/' + s}": no such file or directory`, exitCode: 125 }; }
                stepOut.push(`--> ${this._hex(11)}`);
            } else if (op === 'CMD') { try { cmd = JSON.parse(arg); } catch (e) { cmd = ['/bin/sh', '-c', arg]; } stepOut.push(`--> ${this._hex(11)}`); }
            else if (op === 'ENTRYPOINT') { try { cmd = JSON.parse(arg); } catch (e) { cmd = ['/bin/sh', '-c', arg]; } stepOut.push(`--> ${this._hex(11)}`); }
            else if (op === 'EXPOSE') { for (const p of arg.split(/\s+/)) { const pn = parseInt(p, 10); if (pn) ports.push(pn); } stepOut.push(`--> ${this._hex(11)}`); }
            else if (op === 'ENV') { env.push(arg.replace(/\s+/, '=')); stepOut.push(`--> ${this._hex(11)}`); }
            else if (op === 'USER') { user = arg; stepOut.push(`--> ${this._hex(11)}`); }
            else if (op === 'WORKDIR') { workdir = arg; stepOut.push(`--> ${this._hex(11)}`); }
            else stepOut.push(`--> ${this._hex(11)}`);
        }
        const id = this._hex(64);
        let repo = tag || null, t = 'latest';
        if (repo) { const ls = repo.lastIndexOf('/'), cp = repo.lastIndexOf(':'); if (cp > ls) { t = repo.slice(cp + 1); repo = repo.slice(0, cp); } const first = repo.split('/')[0]; if (!(repo.includes('/') && (first.includes('.') || first.includes(':') || first === 'localhost'))) repo = 'localhost/' + repo; }
        const entry = Object.assign({}, base.entry, { daemon: base.entry.daemon || (cmd && /httpd|nginx|run-/.test(cmd.join(' '))), kind: base.entry.kind || (cmd && /httpd/.test(cmd.join(' ')) ? 'httpd' : cmd && /nginx/.test(cmd.join(' ')) ? 'nginx' : undefined), cmd });
        const img = { id, repo: repo || '<none>', tag: repo ? t : '<none>', ref: repo ? `${repo}:${t}` : id, entry, created: this._now(), size: base.size + 12, cmd, ports, env, user, workdir, local: true };
        st.images[img.ref] = img;
        stepOut.push(`COMMIT ${tag || ''}`.trim(), `--> ${id.slice(0, 11)}`);
        if (repo) stepOut.push(`Successfully tagged ${repo}:${t}`);
        stepOut.push(id);
        return this._ok(stepOut.join('\n'));
    }

    _cmdCommit(rest) {
        const st = this._store();
        const pos = rest.filter((a, i) => !a.startsWith('-') && !['-m', '-a', '-c', '--author', '--message', '--change'].includes(rest[i - 1]));
        const c = this._findContainer(st, pos[0]);
        if (!c) return this._err(`Error: no container with name or ID "${pos[0] || ''}" found: no such container`, 125);
        const base = st.images[c.image] || Object.values(st.images).find(i => i.id === c.imageId);
        const id = this._hex(64);
        let repo = pos[1] || null, t = 'latest';
        if (repo) { const ls = repo.lastIndexOf('/'), cp = repo.lastIndexOf(':'); if (cp > ls) { t = repo.slice(cp + 1); repo = repo.slice(0, cp); } const first = repo.split('/')[0]; if (!(repo.includes('/') && (first.includes('.') || first.includes(':') || first === 'localhost'))) repo = 'localhost/' + repo; }
        const img = Object.assign({}, base, { id, repo: repo || '<none>', tag: repo ? t : '<none>', ref: repo ? `${repo}:${t}` : id, created: this._now(), local: true });
        st.images[img.ref] = img;
        return this._ok(id);
    }

    // ----- volumes / networks / system / info
    _cmdVolume(rest) {
        const st = this._store();
        const sub = rest[0];
        const args = rest.slice(1).filter(a => !a.startsWith('-'));
        if (sub === 'create') {
            const name = args[0] || this._hex(64);
            if (st.volumes[name]) return this._ok(name);
            st.volumes[name] = { name, created: this._now(), mount: `/var/lib/containers/storage/volumes/${name}/_data` };
            this._mkdirp(st.volumes[name].mount);
            return this._ok(name);
        }
        if (sub === 'ls' || sub === 'list') {
            const rows = Object.values(st.volumes).map(v => ['local', v.name]);
            return this._ok(this._table(['DRIVER', 'VOLUME NAME'], rows));
        }
        if (sub === 'rm' || sub === 'remove') {
            const out = [], errs = [];
            for (const n of args) { if (!st.volumes[n]) { errs.push(`Error: no volume with name "${n}" found: no such volume`); continue; } if (st.containers.some(c => c.vols.some(v => v.src === n))) { errs.push(`Error: volume ${n} is being used by the following container(s): ${st.containers.find(c => c.vols.some(v => v.src === n)).id}: volume is being used`); continue; } delete st.volumes[n]; out.push(n); }
            return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 2 : 0 };
        }
        if (sub === 'inspect') return this._cmdInspect(['--type', 'volume', ...args]);
        if (sub === 'prune') { const out = []; for (const n of Object.keys(st.volumes)) if (!st.containers.some(c => c.vols.some(v => v.src === n))) { delete st.volumes[n]; out.push(n); } return this._ok(out.join('\n')); }
        return this._err(`Error: unrecognized command \`podman volume ${sub || ''}\``, 125);
    }

    _cmdNetwork(rest) {
        const sub = rest[0];
        if (sub === 'ls' || sub === 'list') return this._ok(this._table(['NETWORK ID', 'NAME', 'DRIVER'], [['2f259bab93aa', 'podman', 'bridge']]));
        if (sub === 'inspect') return this._ok(JSON.stringify([{ name: 'podman', id: '2f259bab93aaaaa2542ba43ef33eb990d0999ee1b9924b557b7be53c0b7a1bb9', driver: 'bridge', network_interface: 'podman0', subnets: [{ subnet: '10.88.0.0/16', gateway: '10.88.0.1' }], ipv6_enabled: false, internal: false, dns_enabled: false }], null, 4));
        return this._ok('');
    }

    _cmdSystem(rest) {
        const st = this._store();
        const sub = rest[0];
        if (sub === 'prune') {
            const out = [];
            for (const c of st.containers.slice()) if (c.state !== 'running') { out.push(c.id); this._removeContainer(st, c); }
            if (rest.includes('-a') || rest.includes('--all')) for (const i of Object.values(st.images)) if (!st.containers.some(c => c.imageId === i.id)) { out.push(i.id); delete st.images[i.ref]; }
            return this._ok(out.join('\n') + (out.length ? '\n' : '') + 'Total reclaimed space: 0B'.replace(/^/, ''));
        }
        if (sub === 'df') return this._ok(this._table(['TYPE', 'TOTAL', 'ACTIVE', 'SIZE', 'RECLAIMABLE'], [['Images', String(Object.keys(st.images).length), String(new Set(st.containers.map(c => c.imageId)).size), this._sizeStr(Object.values(st.images).reduce((s, i) => s + i.size, 0)), '0B (0%)'], ['Containers', String(st.containers.length), String(st.containers.filter(c => c.state === 'running').length), '0B', '0B (0%)'], ['Local Volumes', String(Object.keys(st.volumes).length), '0', '0B', '0B (0%)']]));
        if (sub === 'reset' || sub === 'migrate' || sub === 'renumber') { st.images = {}; st.containers = []; st.volumes = {}; this.shared.processes.forEach((p, i, arr) => { if (p.container) arr.splice(i, 1); }); return this._ok(''); }
        if (sub === 'info') return this._cmdInfo(rest.slice(1));
        return this._err(`Error: unrecognized command \`podman system ${sub || ''}\``, 125);
    }

    _cmdInfo(rest) {
        const root = this._isRoot();
        const L = ['host:', '  arch: amd64', '  buildahVersion: 1.31.3', '  cgroupControllers:', '  - cpuset', '  - cpu', '  - io', '  - memory', '  - pids', '  cgroupManager: systemd', '  cgroupVersion: v2', '  conmon:', '    package: conmon-2.1.7-1.el9.x86_64', '    path: /usr/bin/conmon', '    version: \'conmon version 2.1.7, commit: 7f2b0f1c3e5a9d8d3a0a6a2e5b7d8c4f9e1a2b3c\'', '  hostname: ' + this.parent.hostname, '  kernel: 5.14.0-362.8.1.el9_3.x86_64', '  os: linux', '  ociRuntime:', '    name: crun', '    path: /usr/bin/crun', '    version: |-', '      crun version 1.8.7', `  rootless: ${root ? 'false' : 'true'}`, '  security:', '    selinuxEnabled: true', 'store:', `  graphDriverName: overlay`, `  graphRoot: ${root ? '/var/lib/containers/storage' : '/home/' + this._user() + '/.local/share/containers/storage'}`, `  runRoot: ${root ? '/run/containers/storage' : '/run/user/1000/containers'}`, 'registries:', '  search:', '  - registry.access.redhat.com', '  - registry.redhat.io', '  - docker.io', 'version:', '  APIVersion: 4.6.1', '  Version: 4.6.1'];
        return this._ok(L.join('\n'));
    }

    // ----- generate systemd
    _cmdGenerate(rest) {
        if (rest[0] !== 'systemd') return this._err(`Error: unrecognized command \`podman generate ${rest[0] || ''}\``, 125);
        const args = rest.slice(1);
        const st = this._store();
        let name = false, files = false, fresh = false, restart = 'on-failure', prefix = 'container', stop = 10, newName = null;
        const refs = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' || a === '--name') name = true; else if (a === '-f' || a === '--files') files = true; else if (a === '--new') fresh = true;
            else if (a.startsWith('--restart-policy=')) restart = a.slice(17); else if (a === '--restart-policy') restart = args[++i];
            else if (a.startsWith('--container-prefix=')) prefix = a.slice(19); else if (a === '--container-prefix') prefix = args[++i];
            else if (a === '-t' || a === '--time') stop = parseInt(args[++i], 10); else if (a.startsWith('--time=')) stop = parseInt(a.slice(7), 10);
            else if (a.startsWith('-')) continue; else refs.push(a);
        }
        if (!refs.length) return this._err('Error: provide at least one container or pod name or ID', 125);
        const out = [], written = [];
        for (const r of refs) {
            const c = this._findContainer(st, r);
            if (!c) return this._err(`Error: ${r} does not refer to a container or pod: no pod with name or ID ${r} found: no such pod: no container with name or ID "${r}" found: no such container`, 125);
            const ref = name ? c.name : c.id;
            const unit = `${prefix}-${name ? c.name : c.id}.service`;
            const pidfile = this._isRoot() ? `/run/containers/storage/overlay-containers/${c.id}/userdata/conmon.pid` : `%t/containers/overlay-containers/${c.id}/userdata/conmon.pid`;
            const d = this._now();
            const tm = this._tm();
            const stamp = tm ? tm.format(d, tm.tm.tz, '%a %b %e %H:%M:%S %Z %Y') : d.toString();
            const L = [`# ${unit}`, '# autogenerated by Podman 4.6.1', `# ${stamp}`, '', '[Unit]', `Description=Podman ${unit}`, 'Documentation=man:podman-generate-systemd(1)', 'Wants=network-online.target', 'After=network-online.target', 'RequiresMountsFor=%t/containers', '', '[Service]', 'Environment=PODMAN_SYSTEMD_UNIT=%n', `Restart=${restart}`, `TimeoutStopSec=${stop + 60}`];
            if (fresh) {
                const portsStr = c.ports.map(p => ` -p ${p.ip !== '0.0.0.0' ? p.ip + ':' : ''}${p.host}:${p.cont}`).join('');
                const volStr = c.vols.map(v => ` -v ${v.src}:${v.dst}${v.opts.length ? ':' + v.opts.join(',') : ''}`).join('');
                L.push('ExecStartPre=/bin/rm -f %t/%n.ctr-id', `ExecStart=/usr/bin/podman run --cidfile=%t/%n.ctr-id --cgroups=no-conmon --rm --sdnotify=conmon --replace -d --name ${c.name}${portsStr}${volStr} ${c.image}`, `ExecStop=/usr/bin/podman stop --ignore -t ${stop} --cidfile=%t/%n.ctr-id`, `ExecStopPost=/usr/bin/podman rm -f --ignore -t ${stop} --cidfile=%t/%n.ctr-id`, 'Type=notify', 'NotifyAccess=all');
            } else {
                L.push(`ExecStart=/usr/bin/podman start ${ref}`, `ExecStop=/usr/bin/podman stop \\`, `\t-t ${stop} ${ref}`, `ExecStopPost=/usr/bin/podman stop \\`, `\t-t ${stop} ${ref}`, `PIDFile=${pidfile}`, 'Type=forking');
            }
            L.push('', '[Install]', 'WantedBy=default.target');
            const text = L.join('\n') + '\n';
            if (files) {
                const dir = this.fs.currentPath;
                this._write(`${dir === '/' ? '' : dir}/${unit}`, text);
                written.push(`${dir === '/' ? '' : dir}/${unit}`);
            } else out.push(text.replace(/\n$/, ''));
        }
        return this._ok(files ? written.join('\n') : out.join('\n\n'));
    }

    // ===== hooks: systemctl --user, loginctl, curl against published ports, ss listeners =====
    installHooks(parent) {
        this._prevSystemctl = parent.systemctl;
        this._prevCurl = parent.curl;
        parent.systemctl = (args, stdin) => this._systemctl(args, stdin);
        parent.curl = (args, stdin) => this._curl(args, stdin);
        const svc = this.shared.svc;
        if (svc && svc._listeners) {
            const orig = svc._listeners.bind(svc);
            svc._listeners = () => {
                const rows = orig();
                for (const [u, st] of Object.entries(this.stores)) for (const c of st.containers) if (c.state === 'running') for (const p of c.ports) rows.push({ proto: p.proto, addr: p.ip === '0.0.0.0' ? '0.0.0.0' : p.ip, port: p.host, comm: u === 'root' ? 'conmon' : 'rootlessport', pid: c.conmon || c.pid });
                return rows;
            };
        }
    }

    loginctl(args) {
        const sub = args[0];
        const who = args.find((a, i) => i > 0 && !a.startsWith('-')) || this._user();
        if (sub === 'enable-linger') {
            if (!this._isRoot() && who !== this._user()) return this._err('Could not enable linger: Interactive authentication required.', 1);
            if (!this.fs.users[who]) return this._err(`Failed to look up user ${who}: No such process`, 1);
            this.linger.add(who);
            this._write(`/var/lib/systemd/linger/${who}`, '');
            return this._ok('');
        }
        if (sub === 'disable-linger') { this.linger.delete(who); const n = this._node('/var/lib/systemd/linger'); if (n && n.children) delete n.children[who]; return this._ok(''); }
        if (sub === 'show-user') { const u = this.fs.users[who]; if (!u) return this._err(`Failed to look up user ${who}: No such process`, 1); return this._ok(`UID=${u.uid}\nGID=${u.gid}\nName=${who}\nLinger=${this.linger.has(who) ? 'yes' : 'no'}\nState=${who === this._user() ? 'active' : 'closing'}`); }
        if (sub === 'list-sessions' || !sub) return this._ok(`SESSION  UID USER SEAT  TTY\n      1 ${this.fs.currentUid} ${this._user()} seat0 tty1\n\n1 sessions listed.`);
        if (sub === 'list-users') return this._ok(`UID USER\n${this.fs.currentUid} ${this._user()}\n\n1 users listed.`);
        return this._ok('');
    }

    _userUnitDir() { const u = this.fs.users[this._user()]; return `${u ? u.home : '/root'}/.config/systemd/user`; }

    _systemctl(args, stdin) {
        if (!args.includes('--user')) return this._prevSystemctl(args, stdin);
        const pos = args.filter(a => !a.startsWith('-'));
        const opts = args.filter(a => a.startsWith('-'));
        const verb = pos[0];
        const units = pos.slice(1);
        const me = this._user();
        if (!this.userUnits[me]) this.userUnits[me] = {};
        const U = this.userUnits[me];
        const dir = this._userUnitDir();
        if (me === 'root' && !this._node('/run/user/0')) return this._err('Failed to connect to bus: No medium found', 1);
        if (!verb) return this._ok('');
        if (verb === 'daemon-reload') return this._ok('');
        const name = (u) => (/\.\w+$/.test(u) ? u : u + '.service');
        const out = [], errs = [];
        let code = 0;
        for (const raw of units) {
            const n = name(raw);
            const path = `${dir}/${n}`;
            const node = this._node(path);
            const s = U[n] || (U[n] = { active: false, enabled: false });
            if (!node && !['stop', 'is-active', 'is-enabled', 'disable'].includes(verb)) { errs.push(verb.startsWith('is-') ? '' : `Failed to ${verb} ${n}: Unit ${n} not found.`); code = verb.startsWith('is-') ? 1 : 5; continue; }
            switch (verb) {
                case 'start': case 'restart': {
                    const run = (key) => { const m = new RegExp('^' + key + '=(.*)$', 'm').exec(node.content || ''); return m ? m[1].replace(/\\\n\s*/g, ' ') : null; };
                    const execStart = (node.content.match(/^ExecStart=(.*)$/m) || [])[1];
                    if (verb === 'restart') this._runUser(node.content, 'ExecStop');
                    const r = this._runUser(node.content, 'ExecStart');
                    if (r.code) { errs.push(`Job for ${n} failed because the control process exited with error code.\nSee "systemctl --user status ${n}" and "journalctl --user -xeu ${n}" for details.`); code = 1; s.active = false; s.failed = true; s.log = r.err; } else { s.active = true; s.failed = false; s.since = this._now(); }
                    break;
                }
                case 'stop': if (node) this._runUser(node.content, 'ExecStop'); s.active = false; break;
                case 'enable': {
                    s.enabled = true;
                    out.push(`Created symlink ${dir}/default.target.wants/${n} → ${path}.`);
                    this._write(`${dir}/default.target.wants/${n}`, node.content);
                    if (opts.includes('--now')) { const r = this._runUser(node.content, 'ExecStart'); if (r.code) { errs.push(`Job for ${n} failed because the control process exited with error code.`); code = 1; } else { s.active = true; s.since = this._now(); } }
                    break;
                }
                case 'disable': { s.enabled = false; const wd = this._node(`${dir}/default.target.wants`); if (wd && wd.children && wd.children[n]) { delete wd.children[n]; out.push(`Removed "${dir}/default.target.wants/${n}".`); } if (opts.includes('--now')) { if (node) this._runUser(node.content, 'ExecStop'); s.active = false; } break; }
                case 'is-active': out.push(s.active ? 'active' : (s.failed ? 'failed' : 'inactive')); if (!s.active) code = 3; break;
                case 'is-enabled': out.push(s.enabled ? 'enabled' : 'disabled'); if (!s.enabled) code = 1; break;
                case 'status': {
                    const desc = ((node.content.match(/^Description=(.*)$/m) || [])[1]) || n;
                    out.push(`${s.active ? '●' : '○'} ${n} - ${desc}`, `     Loaded: loaded (${path}; ${s.enabled ? 'enabled' : 'disabled'}; preset: disabled)`, s.active ? `     Active: active (running) since ${s.since ? s.since.toString().slice(0, 24) : ''}` : `     Active: ${s.failed ? 'failed' : 'inactive (dead)'}`);
                    if (!s.active) code = 3;
                    break;
                }
                default: break;
            }
        }
        if (['start', 'restart', 'enable'].includes(verb) && !this.linger.has(me) && false) out.push('');
        return { stdout: out.filter(x => x !== '').join('\n'), stderr: errs.filter(x => x !== '').join('\n'), exitCode: code };
    }

    _runUser(content, key) {
        const m = new RegExp('^' + key + '=((?:.*\\\\\\n)*.*)$', 'm').exec(content || '');
        if (!m) return { code: 0 };
        const line = m[1].replace(/\\\n\s*/g, ' ').replace(/^[-@+!:]+/, '').replace(/%t/g, '/run/user/1000').replace(/%n/g, 'unit.service');
        const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null;
        if (!sh) return { code: 0 };
        const o = [], e = [];
        const io = { stdin: { text: '', pos: 0 }, out: (s) => o.push(s), err: (s) => e.push(s), piped: true };
        const rc = sh.runScriptText(line, 'unit', [], io);
        return { code: rc, out: o.join(''), err: e.join('') };
    }

    // web servers inside published containers answer curl on their host port
    _curl(args, stdin) {
        const urlArg = args.filter(a => !a.startsWith('-')).pop();
        const m = urlArg ? /^(?:https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(?::(\d+))?(\/[^?#]*)?/.exec(urlArg) : null;
        if (m) {
            const port = m[2] ? parseInt(m[2], 10) : 80;
            for (const [u, st] of Object.entries(this.stores)) for (const c of st.containers) {
                if (c.state !== 'running') continue;
                const p = c.ports.find(x => x.host === port && x.proto === 'tcp');
                if (!p) continue;
                const kind = (c.entry || {}).kind;
                if (kind !== 'httpd' && kind !== 'nginx') return { stdout: '', stderr: `curl: (52) Empty reply from server`, exitCode: 52 };
                const docroot = c.entry.docroot || '/var/www/html';
                const v = c.vols.find(x => x.dst === docroot || docroot.startsWith(x.dst + '/'));
                const silent = args.includes('-s') || args.includes('--silent');
                const head = args.includes('-I') || args.includes('--head') || args.includes('-i') || args.includes('--include');
                let status = 200, body = kind === 'nginx' ? '<!DOCTYPE html>\n<html>\n<head>\n<title>Welcome to nginx!</title>\n</head>\n<body>\n<h1>Welcome to nginx!</h1>\n<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>\n</body>\n</html>' : '<html><body><h1>It works!</h1></body></html>';
                if (v && v.host) {
                    if (!this._volAllowed(c, v)) { status = 403; body = '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">\n<html><head>\n<title>403 Forbidden</title>\n</head><body>\n<h1>Forbidden</h1>\n<p>You don\'t have permission to access this resource.</p>\n</body></html>'; c.logs.push(`[${this._stamp()}] [authz_core:error] [pid 1] [client 10.0.2.100:40000] AH01630: client denied by server configuration: ${docroot}/`); }
                    else {
                        const path = (m[3] && m[3] !== '/') ? m[3] : '/index.html';
                        const n = this._node(v.src + path.replace(/\/$/, '/index.html'));
                        if (n && n.type === 'file') body = n.content || ''; else { status = 404; body = '<h1>404 Not Found</h1>'; }
                    }
                }
                const oi = args.findIndex(a => a === '-o' || a === '--output');
                const wi = args.findIndex(a => a === '-w' || a === '--write-out');
                const hdr = `HTTP/1.1 ${status} ${status === 200 ? 'OK' : status === 403 ? 'Forbidden' : 'Not Found'}\nServer: ${kind === 'nginx' ? 'nginx/1.25.3' : 'Apache/2.4.57 (Unix)'}\nContent-Type: text/html\n`;
                if (status >= 400 && args.includes('-f')) return { stdout: '', stderr: `curl: (22) The requested URL returned error: ${status}`, exitCode: 22 };
                let text = (args.includes('-I') || args.includes('--head') ? hdr : head ? hdr + '\n' + body : body);
                if (oi >= 0) { const target = args[oi + 1]; if (target !== '/dev/null') this._write(this.fs.resolvePath(target), body); text = ''; }
                if (wi >= 0) text += args[wi + 1].replace(/%\{http_code\}/g, String(status)).replace(/\\n/g, '\n');
                return { stdout: text, stderr: '', exitCode: 0 };
            }
        }
        return this._prevCurl(args, stdin);
    }

    // skopeo (inspect only)
    skopeo(args) {
        const sub = args[0];
        if (sub === '--version') return this._ok('skopeo version 1.13.3');
        if (sub === 'inspect') {
            const ref = (args.filter(a => !a.startsWith('-')).pop() || '').replace(/^docker:\/\//, '');
            const st = this._store();
            this._ensureZone();
            const p = this._parseRef(ref);
            if (p.err) return this._err(`FATA[0000] Error parsing image name "docker://${ref}": short-name resolution enforced but cannot prompt without a TTY`, 1);
            const host = this._registryHost(p.repo);
            const ne = this._netCheck(host, p.ref);
            if (ne) return this._err('FATA[0000] ' + ne.replace(/^Error: /, ''), 1);
            const e = this.registry[p.repo];
            if (!e || !e.tags.includes(p.tag)) return this._err(`FATA[0000] Error parsing image name "docker://${ref}": reading manifest ${p.tag} in ${p.repo}: manifest unknown`, 1);
            return this._ok(JSON.stringify({ Name: p.repo, Tag: p.tag, Digest: 'sha256:' + this._hex(64), RepoTags: e.tags, Created: '2023-11-14T09:00:00Z', DockerVersion: '', Labels: { architecture: 'x86_64' }, Architecture: 'amd64', Os: 'linux', Layers: ['sha256:' + this._hex(64)], Env: ['container=oci'] }, null, 4));
        }
        return this._err('Usage:\n  skopeo [flags]\n  skopeo [command]\n\nAvailable Commands:\n  copy        Copy an IMAGE-NAME from one location to another\n  inspect     Inspect image IMAGE-NAME', 1);
    }
}

if (typeof window !== 'undefined') {
    window.PodmanEngine = PodmanEngine;
}
