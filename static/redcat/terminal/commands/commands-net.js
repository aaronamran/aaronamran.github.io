// Networking model: NetworkManager connections <-> devices <-> ip addr/route <-> resolv.conf <-> name resolution
// Part of Red Cat RHCSA Terminal Simulator
//
// nmcli keeps connection profiles (and writes them as keyfiles under /etc/NetworkManager/system-connections).
// Activating a profile (nmcli con up) applies it to the device; ip, ifconfig, route, ping, dig, nslookup,
// host, getent and hostnamectl all read the same state.

class NetEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.net = this;
        this.devices = {
            lo: { name: 'lo', type: 'loopback', mac: '00:00:00:00:00:00', mtu: 65536, up: true, addrs: [{ cidr: '127.0.0.1/8', scope: 'host', label: 'lo' }, { cidr: '::1/128', scope: 'host' }], active: null },
            eth0: { name: 'eth0', type: 'ethernet', mac: '52:54:00:12:34:56', mtu: 1500, up: true, addrs: [], active: null, alt: 'enp1s0' },
            eth1: { name: 'eth1', type: 'ethernet', mac: '52:54:00:ab:cd:02', mtu: 1500, up: false, addrs: [], active: null, alt: 'enp2s0' }
        };
        this.conns = [];
        this.kroutes = [];       // routes added with ip route (lost when the device is reconfigured)
        this.activeSeq = 1;
        this.dhcpDevices = ['eth0'];
        this.dhcp = { addr: '192.168.1.100/24', gw: '192.168.1.1', dns: ['8.8.8.8', '8.8.4.4'], lease: 3600 };
        this.dhcpStart = Date.now();
        this.zone = this._buildZone();
        const eth0 = this._newConn({ 'connection.id': 'eth0', 'connection.type': 'ethernet', 'connection.interface-name': 'eth0' });
        this.conns.push(eth0);
        this._activate(eth0, this.devices.eth0, true);
        this._writeKeyfile(eth0);
        this._setEtc('/etc/hostname', 'rhcsa-lab\n', true);
    }

    // ===== helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    _node(p) { return this.fs.getNode(p); }
    _text(p) { const n = this._node(p); return n && n.type === 'file' ? n.content || '' : null; }
    _uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
    _rnd(a, b) { return a + Math.random() * (b - a); }

    _setEtc(path, content, onlyIfMissing) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        if (onlyIfMissing && cur.children[name]) return;
        const perm = /system-connections/.test(path) ? '0600' : '0644';
        cur.children[name] = { type: 'file', permissions: perm, owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    _rm(path) {
        const parent = this._node(this.fs.getParentPath(path));
        if (parent && parent.children) delete parent.children[this.fs.getBasename(path)];
    }

    get parent() { return this.shared.parent; }

    // ===== IPv4 math =====
    _ip2n(ip) { const p = ip.split('.').map(Number); return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; }
    _n2ip(n) { return [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); }
    _isV4(s) { const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s); return !!m && m.slice(1).every(x => +x <= 255); }
    _isV6(s) { return /^[0-9a-fA-F:]+$/.test(s) && s.includes(':') && s.split(':').length <= 8; }
    _mask(len) { return len === 0 ? 0 : (0xffffffff << (32 - len)) >>> 0; }
    _net(cidr) { const [ip, l] = cidr.split('/'); const len = l === undefined ? 32 : +l; return { ip, len, net: (this._ip2n(ip) & this._mask(len)) >>> 0, bcast: ((this._ip2n(ip) & this._mask(len)) | (~this._mask(len) >>> 0)) >>> 0 }; }
    _inNet(ip, cidr) { const n = this._net(cidr); return (this._ip2n(ip) & this._mask(n.len)) >>> 0 === n.net; }
    _netStr(cidr) { const n = this._net(cidr); return `${this._n2ip(n.net)}/${n.len}`; }
    _netmask(len) { return this._n2ip(this._mask(len)); }

    // ===== connection profiles =====
    _newConn(props) {
        const c = { uuid: this._uuid(), props: {
            'connection.id': '', 'connection.type': 'ethernet', 'connection.interface-name': '', 'connection.autoconnect': 'yes',
            'ipv4.method': 'auto', 'ipv4.addresses': [], 'ipv4.gateway': '', 'ipv4.dns': [], 'ipv4.dns-search': [], 'ipv4.routes': [], 'ipv4.ignore-auto-dns': 'no', 'ipv4.never-default': 'no',
            'ipv6.method': 'auto', 'ipv6.addresses': [], 'ipv6.gateway': '', 'ipv6.dns': [], 'ipv6.dns-search': []
        }, active: null };
        Object.assign(c.props, props);
        return c;
    }

    static get LISTS() { return ['ipv4.addresses', 'ipv4.dns', 'ipv4.dns-search', 'ipv4.routes', 'ipv6.addresses', 'ipv6.dns', 'ipv6.dns-search', 'ipv6.routes']; }

    _known() {
        return new Set(['connection.id', 'connection.uuid', 'connection.type', 'connection.interface-name', 'connection.autoconnect', 'connection.autoconnect-priority', 'connection.zone', 'connection.master', 'connection.slave-type', 'connection.permissions',
            'ipv4.method', 'ipv4.addresses', 'ipv4.gateway', 'ipv4.dns', 'ipv4.dns-search', 'ipv4.routes', 'ipv4.route-metric', 'ipv4.ignore-auto-dns', 'ipv4.ignore-auto-routes', 'ipv4.never-default', 'ipv4.may-fail', 'ipv4.dhcp-client-id', 'ipv4.dhcp-hostname',
            'ipv6.method', 'ipv6.addresses', 'ipv6.gateway', 'ipv6.dns', 'ipv6.dns-search', 'ipv6.routes', 'ipv6.ignore-auto-dns', 'ipv6.addr-gen-mode', 'ipv6.never-default',
            '802-3-ethernet.mtu', '802-3-ethernet.mac-address', '802-3-ethernet.cloned-mac-address', 'bridge.stp', 'bridge.priority', 'bond.options', 'vlan.id', 'vlan.parent', 'team.config']);
    }

    _splitList(v) { return String(v).split(/[,\s]+/).map(s => s.trim()).filter(Boolean); }

    // validate and store one property assignment; returns error string or null
    _setProp(c, key, value, op) {
        const P = c.props;
        if (!this._known().has(key)) return `Error: invalid <setting>.<property> '${key}'.`;
        const isList = NetEngine.LISTS.includes(key);
        if (key === 'connection.uuid') return `Error: failed to modify connection.uuid: the property can't be changed.`;
        if (key === 'ipv4.method' && !['auto', 'manual', 'disabled', 'link-local', 'shared'].includes(value)) return `Error: failed to modify ipv4.method: invalid option '${value}', use one of [auto, disabled, link-local, manual, shared].`;
        if (key === 'ipv6.method' && !['auto', 'dhcp', 'manual', 'disabled', 'ignore', 'link-local', 'shared'].includes(value)) return `Error: failed to modify ipv6.method: invalid option '${value}', use one of [auto, dhcp, disabled, ignore, link-local, manual, shared].`;
        if (/autoconnect$|ignore-auto|never-default|may-fail|bridge\.stp/.test(key) && !['yes', 'no', 'true', 'false', 'on', 'off', '1', '0'].includes(String(value).toLowerCase())) return `Error: failed to modify ${key}: '${value}' is not a valid value; use yes/no.`.replace('a valid value; use yes/no', 'a boolean value');
        if (key.endsWith('mtu') && !/^\d+$/.test(value)) return `Error: failed to modify ${key}: '${value}' is not a valid number.`;
        if (isList) {
            const items = key.endsWith('addresses') ? String(value).split(',').map(s => s.trim()).filter(Boolean) : (key.endsWith('routes') ? String(value).split(',').map(s => s.trim()).filter(Boolean) : this._splitList(value));
            for (const it of items) {
                if (key === 'ipv4.addresses') {
                    const [ip, l] = it.split('/');
                    if (!this._isV4(ip)) return `Error: failed to modify ${key}: invalid IP address: Invalid IPv4 address '${it}'.`.replace(/: Invalid IPv4 address '([^']*)'\./, (m, x) => `: invalid IP address: ${x}`);
                    if (l !== undefined && !(/^\d+$/.test(l) && +l >= 1 && +l <= 32)) return `Error: failed to modify ${key}: invalid prefix '${l}'; <1-32> allowed.`;
                } else if (key === 'ipv6.addresses') {
                    const [ip, l] = it.split('/');
                    if (!this._isV6(ip)) return `Error: failed to modify ${key}: invalid IP address: ${it}`;
                    if (l !== undefined && !(/^\d+$/.test(l) && +l >= 1 && +l <= 128)) return `Error: failed to modify ${key}: invalid prefix '${l}'; <1-128> allowed.`;
                } else if (key === 'ipv4.dns') {
                    if (!this._isV4(it)) return `Error: failed to modify ipv4.dns: invalid IPv4 address '${it}'.`;
                } else if (key === 'ipv6.dns') {
                    if (!this._isV6(it)) return `Error: failed to modify ipv6.dns: invalid IPv6 address '${it}'.`;
                } else if (key === 'ipv4.routes') {
                    const [dst] = it.split(/\s+/);
                    if (!this._isV4(dst.split('/')[0])) return `Error: failed to modify ipv4.routes: invalid route: ${it}`;
                }
            }
            if (op === '+') { for (const it of items) if (!P[key].includes(it)) P[key].push(it); }
            else if (op === '-') {
                if (!items.length) return null;
                for (const it of items) { const i = /^\d+$/.test(it) && !P[key].includes(it) ? parseInt(it, 10) - 1 : P[key].indexOf(it); if (i < 0 || i >= P[key].length) return `Error: failed to modify ${key}: the property doesn't contain '${it}'.`.replace(/: the property doesn't contain '([^']*)'\./, ': value not found.'); P[key].splice(i, 1); }
            } else P[key] = items;
            return null;
        }
        if (key === 'ipv4.gateway' && value !== '' && !this._isV4(value)) return `Error: failed to modify ipv4.gateway: invalid IP address: Invalid IPv4 address '${value}'.`.replace(/: Invalid IPv4 address '([^']*)'\./, (m, x) => `: invalid IP address: ${x}`);
        if (key === 'ipv6.gateway' && value !== '' && !this._isV6(value)) return `Error: failed to modify ipv6.gateway: invalid IP address: ${value}`;
        if (/autoconnect$|ignore-auto|never-default|may-fail|bridge\.stp/.test(key)) value = ['yes', 'true', 'on', '1'].includes(String(value).toLowerCase()) ? 'yes' : 'no';
        P[key] = value;
        return null;
    }

    _findConn(ref, byUuid) {
        return this.conns.find(c => c.props['connection.id'] === ref) || this.conns.find(c => c.uuid === ref) || (byUuid ? null : this.conns.find(c => c.props['connection.interface-name'] === ref && false)) || null;
    }

    // ===== keyfiles =====
    _kfName(c) { return `/etc/NetworkManager/system-connections/${c.props['connection.id']}.nmconnection`; }

    _writeKeyfile(c) {
        const P = c.props;
        const out = ['[connection]', `id=${P['connection.id']}`, `uuid=${c.uuid}`, `type=${P['connection.type']}`];
        if (P['connection.interface-name']) out.push(`interface-name=${P['connection.interface-name']}`);
        if (P['connection.autoconnect'] === 'no') out.push('autoconnect=false');
        if (P['connection.master']) { out.push(`master=${P['connection.master']}`); out.push(`slave-type=${P['connection.slave-type'] || 'bridge'}`); }
        if (P['connection.zone']) out.push(`zone=${P['connection.zone']}`);
        out.push('');
        const t = P['connection.type'];
        if (t === 'ethernet') { out.push('[ethernet]'); if (P['802-3-ethernet.mtu']) out.push(`mtu=${P['802-3-ethernet.mtu']}`); out.push(''); }
        if (t === 'bridge') { out.push('[bridge]'); if (P['bridge.stp']) out.push(`stp=${P['bridge.stp'] === 'yes' ? 'true' : 'false'}`); out.push(''); }
        if (t === 'vlan') { out.push('[vlan]'); out.push(`id=${P['vlan.id'] || ''}`); out.push(`parent=${P['vlan.parent'] || ''}`); out.push(''); }
        if (t === 'bond') { out.push('[bond]'); out.push(`mode=${(/mode=([^,]+)/.exec(P['bond.options'] || '') || [0, 'balance-rr'])[1]}`); out.push(''); }
        if (!P['connection.master']) {
            const f4 = (k) => {
                out.push('[ipv4]');
                P['ipv4.addresses'].forEach((a, i) => out.push(`address${i + 1}=${a}${i === 0 && P['ipv4.gateway'] ? ',' + P['ipv4.gateway'] : ''}`));
                if (P['ipv4.dns'].length) out.push(`dns=${P['ipv4.dns'].join(';')};`);
                if (P['ipv4.dns-search'].length) out.push(`dns-search=${P['ipv4.dns-search'].join(';')};`);
                P['ipv4.routes'].forEach((r, i) => out.push(`route${i + 1}=${r.trim().split(/\s+/).join(',')}`));
                if (P['ipv4.ignore-auto-dns'] === 'yes') out.push('ignore-auto-dns=true');
                if (P['ipv4.never-default'] === 'yes') out.push('never-default=true');
                out.push(`method=${P['ipv4.method']}`);
                out.push('');
            };
            f4();
            out.push('[ipv6]');
            P['ipv6.addresses'].forEach((a, i) => out.push(`address${i + 1}=${a}${i === 0 && P['ipv6.gateway'] ? ',' + P['ipv6.gateway'] : ''}`));
            if (P['ipv6.dns'].length) out.push(`dns=${P['ipv6.dns'].join(';')};`);
            out.push('addr-gen-mode=eui64');
            out.push(`method=${P['ipv6.method']}`);
            out.push('');
        }
        out.push('[proxy]', '');
        this._setEtc(this._kfName(c), out.join('\n'));
    }

    _parseKeyfile(text) {
        const sec = {};
        let cur = null;
        for (const raw of text.split('\n')) {
            const l = raw.trim();
            if (!l || l[0] === '#') continue;
            const m = /^\[(.+)\]$/.exec(l);
            if (m) { cur = m[1]; sec[cur] = sec[cur] || {}; continue; }
            const kv = /^([^=]+)=(.*)$/.exec(l);
            if (kv && cur) sec[cur][kv[1].trim()] = kv[2].trim();
        }
        if (!sec.connection || !sec.connection.id) return null;
        const c = this._newConn({});
        const P = c.props;
        P['connection.id'] = sec.connection.id;
        c.uuid = sec.connection.uuid || c.uuid;
        P['connection.type'] = sec.connection.type || 'ethernet';
        P['connection.interface-name'] = sec.connection['interface-name'] || '';
        P['connection.autoconnect'] = sec.connection.autoconnect === 'false' ? 'no' : 'yes';
        P['connection.master'] = sec.connection.master || '';
        if (sec.ethernet && sec.ethernet.mtu) P['802-3-ethernet.mtu'] = sec.ethernet.mtu;
        for (const [fam, k] of [['ipv4', 'ipv4'], ['ipv6', 'ipv6']]) {
            const s = sec[fam];
            if (!s) continue;
            P[k + '.method'] = s.method || 'auto';
            P[k + '.addresses'] = []; P[k + '.gateway'] = '';
            Object.keys(s).filter(x => /^address\d+$/.test(x)).sort().forEach((x, i) => { const [a, g] = s[x].split(','); P[k + '.addresses'].push(a); if (i === 0 && g) P[k + '.gateway'] = g; });
            if (s.gateway) P[k + '.gateway'] = s.gateway;
            P[k + '.dns'] = (s.dns || '').split(';').filter(Boolean);
            P[k + '.dns-search'] = (s['dns-search'] || '').split(';').filter(Boolean);
            P[k + '.routes'] = Object.keys(s).filter(x => /^route\d+$/.test(x)).sort().map(x => s[x].split(',').join(' '));
            P[k + '.ignore-auto-dns'] = s['ignore-auto-dns'] === 'true' ? 'yes' : 'no';
            P[k + '.never-default'] = s['never-default'] === 'true' ? 'yes' : 'no';
        }
        if (sec.bridge && sec.bridge.stp) P['bridge.stp'] = sec.bridge.stp === 'true' ? 'yes' : 'no';
        if (sec.vlan) { P['vlan.id'] = sec.vlan.id || ''; P['vlan.parent'] = sec.vlan.parent || ''; }
        return c;
    }

    // ===== applying a profile to a device =====
    _deviceFor(c) {
        const n = c.props['connection.interface-name'];
        if (n) return this.devices[n] || null;
        const t = c.props['connection.type'];
        return Object.values(this.devices).find(d => d.type === t && !d.active) || null;
    }

    _activate(c, dev, silent) {
        const P = c.props;
        // deactivate whatever was on the device
        if (dev.active) { const old = this.conns.find(x => x.uuid === dev.active); if (old) old.active = null; }
        dev.active = c.uuid;
        c.active = { dev: dev.name, path: `/org/freedesktop/NetworkManager/ActiveConnection/${this.activeSeq++}`, start: Date.now() };
        dev.up = true;
        dev.addrs = dev.addrs.filter(a => a.scope === 'host');
        this.kroutes = this.kroutes.filter(r => r.dev !== dev.name);
        dev.dhcpLease = null;
        const metric = 100 + (dev.name === 'eth0' ? 0 : 1) * (Object.keys(this.devices).indexOf(dev.name) * 0 + (dev.name === 'eth1' ? 1 : 0));
        dev.metric = dev.name === 'eth0' ? 100 : 101;
        if (P['ipv4.method'] === 'manual' || P['ipv4.method'] === 'auto' || P['ipv4.method'] === 'shared') {
            for (const a of P['ipv4.addresses']) {
                const cidr = a.includes('/') ? a : a + '/32';
                dev.addrs.push({ cidr, scope: 'global', label: dev.name, noprefix: true });
            }
        }
        if (P['ipv4.method'] === 'auto' && this.dhcpDevices.includes(dev.name)) {
            dev.dhcpLease = { addr: this.dhcp.addr, gw: this.dhcp.gw, dns: this.dhcp.dns, start: Date.now() };
            if (!dev.addrs.some(a => a.cidr === this.dhcp.addr)) dev.addrs.push({ cidr: this.dhcp.addr, scope: 'global', label: dev.name, dynamic: true, noprefix: true });
        }
        if (P['ipv4.method'] === 'link-local') dev.addrs.push({ cidr: '169.254.' + (dev.name === 'eth1' ? '77.12' : '31.5') + '/16', scope: 'link', label: dev.name, noprefix: true });
        if (P['ipv6.method'] !== 'disabled' && P['ipv6.method'] !== 'ignore') {
            for (const a of P['ipv6.addresses']) dev.addrs.push({ cidr: a.includes('/') ? a : a + '/64', scope: 'global', noprefix: true });
            dev.addrs.push({ cidr: this._ll6(dev) + '/64', scope: 'link', noprefix: true, ll6: true });
        }
        this._rewriteResolv();
    }

    _ll6(dev) {
        const m = dev.mac.split(':').map(x => parseInt(x, 16));
        m[0] ^= 2;
        const h = (a, b) => ((a << 8) | b).toString(16);
        return `fe80::${h(m[0], m[1])}:${h(m[2], 0xff)}:fe${m[3].toString(16).padStart(2, '0')}:${h(m[4], m[5])}`.replace(/:0+(\w)/g, ':$1');
    }

    _deactivate(c) {
        if (!c.active) return;
        const dev = this.devices[c.active.dev];
        c.active = null;
        if (dev) {
            dev.active = null;
            dev.addrs = dev.addrs.filter(a => a.scope === 'host');
            dev.dhcpLease = null;
            if (dev.type !== 'loopback') dev.up = false;
            this.kroutes = this.kroutes.filter(r => r.dev !== dev.name);
        }
        this._rewriteResolv();
    }

    _rewriteResolv() {
        const dns = [], search = [];
        for (const c of this.conns) {
            if (!c.active) continue;
            const P = c.props;
            const dev = this.devices[c.active.dev];
            for (const d of P['ipv4.dns']) if (!dns.includes(d)) dns.push(d);
            for (const d of P['ipv6.dns']) if (!dns.includes(d)) dns.push(d);
            if (P['ipv4.ignore-auto-dns'] !== 'yes' && dev && dev.dhcpLease) for (const d of dev.dhcpLease.dns) if (!dns.includes(d)) dns.push(d);
            for (const s of P['ipv4.dns-search']) if (!search.includes(s)) search.push(s);
        }
        if (this._resolvManual) return;
        const lines = ['# Generated by NetworkManager'];
        if (search.length) lines.push('search ' + search.join(' '));
        for (const d of dns.slice(0, 3)) lines.push('nameserver ' + d);
        this._setEtc('/etc/resolv.conf', lines.join('\n') + '\n');
    }

    // ===== routing table =====
    _routes4() {
        const out = [];
        const devs = Object.values(this.devices).filter(d => d.up && d.type !== 'loopback');
        for (const d of devs) {
            const c = this.conns.find(x => x.uuid === d.active);
            const metric = d.metric || 100;
            for (const a of d.addrs.filter(x => !x.cidr.includes(':') && x.scope !== 'host')) {
                const n = this._net(a.cidr);
                if (n.len === 32) continue;
                out.push({ dst: `${this._n2ip(n.net)}/${n.len}`, dev: d.name, proto: 'kernel', scope: 'link', src: n.ip, metric: a.cidr.startsWith('169.254') ? 1000 + metric : metric });
            }
            if (c) {
                const P = c.props;
                const gw = P['ipv4.gateway'] || (P['ipv4.method'] === 'auto' && d.dhcpLease ? d.dhcpLease.gw : '');
                if (gw && P['ipv4.never-default'] !== 'yes') {
                    const src = (d.addrs.find(a => !a.cidr.includes(':') && this._inNet(gw, a.cidr)) || {}).cidr;
                    out.push({ dst: 'default', via: gw, dev: d.name, proto: P['ipv4.gateway'] ? 'static' : 'dhcp', src: src ? src.split('/')[0] : undefined, metric });
                }
                for (const r of P['ipv4.routes']) {
                    const [dst, via, met] = r.trim().split(/\s+/);
                    out.push({ dst: dst.includes('/') ? dst : dst + '/32', via, dev: d.name, proto: 'static', metric: met ? +met : metric });
                }
            }
        }
        for (const r of this.kroutes) out.push(r);
        const key = (r) => (r.dst === 'default' ? -1 : this._ip2n(r.dst.split('/')[0]));
        return out.sort((a, b) => key(a) - key(b) || a.metric - b.metric);
    }

    _defaultRoute() { return this._routes4().find(r => r.dst === 'default') || null; }

    _myAddrs() { const l = []; for (const d of Object.values(this.devices)) if (d.up) for (const a of d.addrs) l.push(a.cidr.split('/')[0]); return l; }

    // is `ip` reachable (and via which device)
    _routeFor(ip) {
        const rs = this._routes4().filter(r => r.dst === 'default' || this._inNet(ip, r.dst));
        let best = null;
        for (const r of rs) { const len = r.dst === 'default' ? 0 : +r.dst.split('/')[1]; if (!best || len > best.len || (len === best.len && r.metric < best.r.metric)) best = { r, len }; }
        return best ? best.r : null;
    }

    // ===== name resolution =====
    _buildZone() {
        const Z = {};
        const add = (n, rec) => { Z[n] = Object.assign(Z[n] || {}, rec); };
        add('example.com', { A: ['93.184.215.14'], AAAA: ['2606:2800:21f:cb07:6820:80da:af6b:8b2c'], MX: ['0 .'], NS: ['a.iana-servers.net.', 'b.iana-servers.net.'], TXT: ['"v=spf1 -all"'] });
        add('www.example.com', { A: ['93.184.215.14'], AAAA: ['2606:2800:21f:cb07:6820:80da:af6b:8b2c'] });
        add('redhat.com', { A: ['52.200.142.250'], MX: ['10 mx1.redhat.com.', '10 mx2.redhat.com.'], NS: ['ns1.redhat.com.', 'ns2.redhat.com.'], TXT: ['"v=spf1 include:spf.protection.outlook.com -all"'] });
        add('www.redhat.com', { CNAME: 'www.redhat.com.edgekey.net.', A: ['23.55.184.51'] });
        add('access.redhat.com', { A: ['23.55.184.51'] });
        add('cdn.redhat.com', { A: ['23.55.184.51'] });
        add('subscription.rhsm.redhat.com', { A: ['52.200.142.250'] });
        add('google.com', { A: ['142.250.80.46'], AAAA: ['2607:f8b0:4004:c1b::65'], MX: ['10 smtp.google.com.'], NS: ['ns1.google.com.', 'ns2.google.com.'] });
        add('www.google.com', { A: ['142.250.80.68'], AAAA: ['2607:f8b0:4004:c07::68'] });
        add('github.com', { A: ['140.82.112.3'] });
        add('dl.fedoraproject.org', { A: ['38.145.60.20'] });
        add('localhost', { A: ['127.0.0.1'], AAAA: ['::1'] });
        const lab = { 'gateway': '192.168.1.1', 'rhcsa-lab': '192.168.1.10', 'server1': '192.168.1.101', 'server2': '192.168.1.102', 'servera': '192.168.1.111', 'serverb': '192.168.1.112', 'classroom': '192.168.1.254', 'repo': '192.168.1.254', 'ntp': '192.168.1.254', 'utility': '192.168.1.253', 'nfs': '192.168.1.120', 'ldap': '192.168.1.121' };
        for (const [h, ip] of Object.entries(lab)) add(`${h}.example.com`, { A: [ip] });
        add('mail.example.com', { A: ['192.168.1.130'] });
        add('example.com', { SOA: 'ns.example.com. admin.example.com. 2024010101 3600 900 604800 86400' });
        return Z;
    }

    _hostsLookup(name) {
        const text = this._text('/etc/hosts') || '';
        const out = [];
        for (const raw of text.split('\n')) {
            const l = raw.replace(/#.*$/, '').trim();
            if (!l) continue;
            const f = l.split(/\s+/);
            if (f.slice(1).some(h => h.toLowerCase() === name.toLowerCase())) out.push({ ip: f[0], names: f.slice(1) });
        }
        return out;
    }

    _hostsReverse(ip) {
        const text = this._text('/etc/hosts') || '';
        for (const raw of text.split('\n')) { const l = raw.replace(/#.*$/, '').trim(); if (!l) continue; const f = l.split(/\s+/); if (f[0] === ip) return f.slice(1); }
        return null;
    }

    _resolvConf() {
        const t = this._text('/etc/resolv.conf') || '';
        const ns = [], search = [];
        for (const l of t.split('\n')) { const m = /^\s*nameserver\s+(\S+)/.exec(l); if (m) ns.push(m[1]); const s = /^\s*(?:search|domain)\s+(.*)$/.exec(l); if (s) search.push(...s[1].trim().split(/\s+/)); }
        return { ns, search };
    }

    _dnsServerState() {
        const rc = this._resolvConf();
        if (!rc.ns.length) return { err: 'noserver', rc };
        const ns = rc.ns.find(n => this._isV4(n) && (n.startsWith('127.') || this._myAddrs().includes(n) || this._routeFor(n)));
        if (!ns) return { err: 'timeout', server: rc.ns[0], rc };
        return { server: ns, rc };
    }

    _dnsLookup(name, type) {
        const n = name.toLowerCase().replace(/\.$/, '');
        const rec = this.zone[n];
        if (!rec) return null;
        if (type === 'ANY') return rec;
        if (rec.CNAME && (type === 'A' || type === 'AAAA')) return { CNAME: rec.CNAME, [type]: type === 'A' ? rec.A : rec.AAAA };
        return rec[type] ? { [type]: rec[type] } : {};
    }

    _ptrLookup(ip) {
        for (const [n, r] of Object.entries(this.zone)) if (r.A && r.A.includes(ip)) return n + '.';
        return null;
    }

    // name -> {ip, source} via nsswitch order (files dns); search domains applied when name has no dot
    _getaddr(name, wantV6) {
        const hit = this._hostsLookup(name);
        const pick = hit.find(h => wantV6 ? h.ip.includes(':') : !h.ip.includes(':'));
        if (pick) return { ip: pick.ip, canon: pick.names[0], source: 'files' };
        const st = this._dnsServerState();
        if (st.err) return { err: st.err };
        const cands = [name];
        if (!name.includes('.') || /^\d/.test(name) === false) for (const s of st.rc.search) cands.push(`${name}.${s}`);
        for (const c of cands) {
            const r = this._dnsLookup(c, wantV6 ? 'AAAA' : 'A');
            if (r && (wantV6 ? r.AAAA : r.A)) return { ip: (wantV6 ? r.AAAA : r.A)[0], canon: c, source: 'dns' };
        }
        return { err: 'nxdomain' };
    }

    // ===== installHooks =====
    installHooks(parent) {
        this._prevGetent = parent.getent;
        this._prevCurl = parent.curl;
        parent.getent = (args, stdin) => this._getentHook(args, stdin);
        parent.hostnameCmd = (args) => this._hostnameCmd(args);
    }

    // ===== nmcli =====
    _nmcliRoot() {
        if (this._isRoot()) return null;
        return 'Error: Insufficient privileges.';
    }

    nmcli(args) {
        const out = this._nmcli(args);
        return out;
    }

    _nmcli(argsIn) {
        let args = argsIn.slice();
        const flags = { terse: false, fields: null, get: null, pretty: false, ask: false };
        while (args.length && args[0].startsWith('-')) {
            const a = args.shift();
            if (a === '-t' || a === '--terse') flags.terse = true;
            else if (a === '-p' || a === '--pretty') flags.pretty = true;
            else if (a === '-f' || a === '--fields') flags.fields = args.shift();
            else if (a.startsWith('--fields=')) flags.fields = a.slice(9);
            else if (a === '-g' || a === '--get-values') { flags.get = args.shift(); flags.terse = true; }
            else if (a.startsWith('--get-values=')) { flags.get = a.slice(13); flags.terse = true; }
            else if (a === '-a' || a === '--ask' || a === '-m' || a === '--mode' || a === '-c' || a === '--colors' || a === '-w' || a === '--wait' || a === '-e' || a === '--escape') { if (['-m', '--mode', '-c', '--colors', '-w', '--wait', '-e', '--escape'].includes(a)) args.shift(); }
            else if (a === '-h' || a === '--help') return this._ok('Usage: nmcli [OPTIONS] OBJECT { COMMAND | help }\n\nOPTIONS\n  -a, --ask                                  ask for missing parameters\n  -c, --colors auto|yes|no                   whether to use colors in output\n  -e, --escape yes|no                        escape columns separators in values\n  -f, --fields <field,...>|all|common        specify fields to output\n  -g, --get-values <field,...>|all|common    shortcut for -m tabular -t -f\n  -h, --help                                 print this help\n  -m, --mode tabular|multiline               output mode\n  -p, --pretty                               pretty output\n  -t, --terse                                terse output\n  -v, --version                              show program version\n  -w, --wait <seconds>                       set timeout waiting for finishing operations\n\nOBJECT\n  g[eneral]       NetworkManager\'s general status and operations\n  n[etworking]    overall networking control\n  r[adio]         NetworkManager radio switches\n  c[onnection]    NetworkManager\'s connections\n  d[evice]        devices managed by NetworkManager\n  a[gent]         NetworkManager secret agent or polkit agent\n  m[onitor]       monitor NetworkManager changes');
            else if (a === '-v' || a === '--version') return this._ok('nmcli tool, version 1.44.2-1.el9');
        }
        const obj = args[0];
        if (obj === undefined) return this._deviceStatus(flags);
        const rest = args.slice(1);
        if ('connection'.startsWith(obj) && obj.length >= 1 && obj !== 'd') return this._conn(rest, flags);
        if ('device'.startsWith(obj) && obj.length >= 1) return this._dev(rest, flags);
        if ('general'.startsWith(obj) && obj.length >= 1) return this._general(rest);
        if ('networking'.startsWith(obj) && obj.length >= 1) return this._networking(rest);
        if ('radio'.startsWith(obj) && obj.length >= 1) return this._ok('WIFI-HW  WIFI     WWAN-HW  WWAN    \nmissing  disabled  missing  disabled');
        return this._err(`Error: argument '${obj}' not understood. Try passing --help instead.`, 2);
    }

    _table(rows, hdr, flags) {
        if (flags && flags.terse) return rows.map(r => r.join(':')).join('\n');
        const w = hdr.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
        const fmt = r => r.map((c, i) => (i === r.length - 1 ? String(c) : String(c).padEnd(w[i] + 2))).join('');
        return [fmt(hdr), ...rows.map(fmt)].join('\n');
    }

    _filterCols(rows, hdr, flags) {
        let idx = hdr.map((_, i) => i);
        const sel = flags.get || flags.fields;
        if (sel && sel !== 'all' && sel !== 'common') {
            const want = sel.split(',').map(s => s.trim().toUpperCase());
            idx = want.map(w => hdr.findIndex(h => h === w)).filter(i => i >= 0);
            if (!idx.length) return { err: `Error: invalid field '${sel.split(',')[0]}'; allowed fields: ${hdr.join(',')}` };
        }
        return { rows: rows.map(r => idx.map(i => r[i])), hdr: idx.map(i => hdr[i]) };
    }

    _deviceStatus(flags) {
        const hdr = ['DEVICE', 'TYPE', 'STATE', 'CONNECTION'];
        const rows = Object.values(this.devices).map(d => [d.name, d.type, d.type === 'loopback' ? 'unmanaged' : (d.active ? 'connected' : 'disconnected'), d.active ? this.conns.find(c => c.uuid === d.active).props['connection.id'] : '--']);
        for (const c of this.conns) if (['bridge', 'bond', 'vlan', 'team'].includes(c.props['connection.type']) && c.active) rows.splice(rows.length - 1, 0, [c.props['connection.interface-name'] || c.props['connection.id'], c.props['connection.type'], 'connected', c.props['connection.id']]);
        rows.sort((a, b) => (a[1] === 'loopback') - (b[1] === 'loopback'));
        const f = this._filterCols(rows, hdr, flags);
        if (f.err) return this._err(f.err, 2);
        return this._ok(this._table(f.rows, f.hdr, flags));
    }

    _general(rest) {
        const sub = rest[0] || 'status';
        if (sub === 'hostname') {
            if (rest[1]) { if (!this._isRoot()) return this._err('Error: Setting the hostname failed - Not authorized to control networking.', 1); return this._setHostname(rest[1], 'static'); }
            return this._ok(this.parent.hostname);
        }
        if (sub === 'status') return this._ok('STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN    \nconnected  full          missing  enabled  missing  enabled');
        if (sub === 'permissions') return this._ok('PERMISSION                                                        VALUE  \norg.freedesktop.NetworkManager.enable-disable-network             yes    ');
        if (sub === 'reload') return this._ok('');
        return this._err(`Error: argument '${sub}' not understood. Try passing --help instead.`, 2);
    }

    _networking(rest) {
        const sub = rest[0];
        if (!sub) return this._ok(this.netOff ? 'disabled' : 'enabled');
        if (sub === 'connectivity') return this._ok(this.netOff ? 'none' : 'full');
        if (sub === 'on' || sub === 'off') {
            if (!this._isRoot()) return this._err('Error: Failed to set networking: Not authorized to control networking.', 1);
            this.netOff = sub === 'off';
            for (const c of this.conns) {
                if (this.netOff && c.active) { c.wasActive = true; this._deactivate(c); }
                if (!this.netOff && c.wasActive) { c.wasActive = false; const d = this._deviceFor(c); if (d) this._activate(c, d, true); }
            }
            return this._ok('');
        }
        return this._err(`Error: argument '${sub}' not understood. Try passing --help instead.`, 2);
    }

    _dev(rest, flags) {
        const sub = rest[0] || 'status';
        const isSub = (full, min = 1) => sub.length >= min && full.startsWith(sub);
        if (isSub('status', 1)) return this._deviceStatus(flags);
        if (isSub('show', 1)) {
            const names = rest[1] ? [rest[1]] : Object.keys(this.devices);
            const parts = [];
            for (const n of names) {
                const d = this.devices[n];
                if (!d) return this._err(`Error: Device '${n}' not found.`, 10);
                parts.push(this._devShow(d, flags));
            }
            return this._ok(parts.join('\n\n'));
        }
        if (isSub('connect', 1) && sub !== 'disconnect') {
            if (!this._isRoot()) return this._err('Error: Failed to add/activate new connection: Not authorized to control networking.', 1);
            const d = this.devices[rest[1]];
            if (!rest[1]) return this._err('Error: No interface specified.', 2);
            if (!d) return this._err(`Error: Device '${rest[1]}' not found.`, 10);
            if (d.type === 'loopback') return this._err(`Error: Failed to add/activate new connection: Device class NMDeviceGeneric had no complete_connection method`, 1);
            const c = this.conns.find(x => x.props['connection.interface-name'] === d.name && x.props['connection.autoconnect'] !== undefined) || this.conns.find(x => x.props['connection.interface-name'] === d.name);
            if (!c) return this._err(`Error: Failed to add/activate new connection: Connection activation failed: No suitable connection found for device '${d.name}'.`.replace('Failed to add/activate new connection: Connection activation failed: No suitable connection found for device', 'No suitable connection found for device').replace(/^Error: No suitable/, 'Error: Failed to activate'), 4);
            return this._up(c, d.name);
        }
        if (isSub('disconnect', 2)) {
            if (!this._isRoot()) return this._err('Error: Device \'' + rest[1] + '\' (' + (this.devices[rest[1]] || {}).name + ') disconnection failed: Not authorized to control networking.', 1);
            const d = this.devices[rest[1]];
            if (!rest[1]) return this._err('Error: No interface specified.', 2);
            if (!d) return this._err(`Error: Device '${rest[1]}' not found.`, 10);
            if (!d.active) return this._err(`Error: Device '${d.name}' (${'/org/freedesktop/NetworkManager/Devices/' + (Object.keys(this.devices).indexOf(d.name) + 1)}) disconnecting failed: This device is not active`.replace(/Error: Device .* disconnecting failed/, `Error: Device '${d.name}' disconnecting failed`), 1);
            const c = this.conns.find(x => x.uuid === d.active);
            this._deactivate(c);
            return this._ok(`Device '${d.name}' successfully disconnected.`);
        }
        if (isSub('reapply', 2)) { const d = this.devices[rest[1]]; if (!d) return this._err(`Error: Device '${rest[1]}' not found.`, 10); const c = this.conns.find(x => x.uuid === d.active); if (!c) return this._err(`Error: Device '${d.name}' is not active`, 1); this._activate(c, d, true); return this._ok(`Connection successfully reapplied to device '${d.name}'.`); }
        if (isSub('modify', 3) || isSub('set', 3) || isSub('managed', 3)) return this._ok('');
        if (isSub('wifi', 1)) return this._ok('');
        if (isSub('delete', 1)) return this._err(`Error: Device '${rest[1]}' is not a software device.`, 1);
        return this._err(`Error: argument '${sub}' not understood. Try passing --help instead.`, 2);
    }

    _devShow(d, flags) {
        const c = d.active ? this.conns.find(x => x.uuid === d.active) : null;
        const L = [];
        const row = (k, v) => L.push(`${k}:`.padEnd(40) + v);
        row('GENERAL.DEVICE', d.name); row('GENERAL.TYPE', d.type); row('GENERAL.HWADDR', d.mac); row('GENERAL.MTU', String(d.mtu));
        row('GENERAL.STATE', d.type === 'loopback' ? '10 (unmanaged)' : (c ? '100 (connected)' : '30 (disconnected)'));
        row('GENERAL.CONNECTION', c ? c.props['connection.id'] : '--');
        row('GENERAL.CON-PATH', c ? c.active.path : '--');
        if (d.type === 'ethernet') row('WIRED-PROPERTIES.CARRIER', 'on');
        if (c) {
            const v4 = d.addrs.filter(a => !a.cidr.includes(':'));
            v4.forEach((a, i) => row(`IP4.ADDRESS[${i + 1}]`, a.cidr));
            const routes = this._routes4().filter(r => r.dev === d.name);
            const gw = routes.find(r => r.dst === 'default');
            row('IP4.GATEWAY', gw ? gw.via : '--');
            routes.forEach((r, i) => row(`IP4.ROUTE[${i + 1}]`, `dst = ${r.dst === 'default' ? '0.0.0.0/0' : r.dst}, nh = ${r.via || '0.0.0.0'}, mt = ${r.metric}`));
            const dns = c.props['ipv4.dns'].slice();
            if (c.props['ipv4.ignore-auto-dns'] !== 'yes' && d.dhcpLease) dns.push(...d.dhcpLease.dns);
            dns.forEach((x, i) => row(`IP4.DNS[${i + 1}]`, x));
            c.props['ipv4.dns-search'].forEach((x, i) => row(`IP4.DOMAIN[${i + 1}]`, x));
            if (d.dhcpLease) { row('DHCP4.OPTION[1]', 'dhcp_lease_time = 3600'); row('DHCP4.OPTION[2]', `ip_address = ${d.dhcpLease.addr.split('/')[0]}`); }
            const v6 = d.addrs.filter(a => a.cidr.includes(':'));
            v6.forEach((a, i) => row(`IP6.ADDRESS[${i + 1}]`, a.cidr));
            row('IP6.GATEWAY', '--');
            if (v6.length) row('IP6.ROUTE[1]', 'dst = fe80::/64, nh = ::, mt = 1024');
        }
        let text = L.join('\n');
        if (flags && (flags.fields || flags.get) && !(flags.fields === 'all' || flags.fields === 'common')) {
            const sel = (flags.get || flags.fields).split(',').map(s => s.trim().toUpperCase());
            const lines = text.split('\n').filter(l => sel.some(s => l.toUpperCase().startsWith(s + ':') || l.toUpperCase().startsWith(s + '[')));
            text = flags.get ? lines.map(l => l.replace(/^[^:]+:\s+/, '')).join('\n') : lines.join('\n');
        }
        return text;
    }

    _conn(rest, flags) {
        const sub = rest[0] || 'show';
        const is = (full, min = 1) => sub.length >= min && full.startsWith(sub);
        if (is('show', 1)) return this._connShow(rest.slice(1), flags);
        const needRoot = ['add', 'modify', 'edit', 'delete', 'up', 'down', 'reload', 'load', 'clone'].some(v => is(v, v === 'delete' ? 2 : v === 'down' ? 1 : v === 'up' ? 1 : 2)) && !is('show', 1);
        if (needRoot && !this._isRoot()) return this._err(is('up') || is('down') ? 'Error: Connection activation failed: Not authorized to control networking.' : 'Error: Failed to add/modify connection: Not authorized to control networking.'.replace('add/modify', is('delete', 2) ? 'delete' : 'modify'), 1);
        if (is('add', 1)) return this._connAdd(rest.slice(1));
        if (is('modify', 1)) return this._connModify(rest.slice(1));
        if (is('delete', 1)) return this._connDelete(rest.slice(1));
        if (is('up', 1)) {
            let ref = rest[1], ifn = null;
            const ii = rest.indexOf('ifname'); if (ii > 0) ifn = rest[ii + 1];
            if (rest[1] === 'id' || rest[1] === 'uuid') ref = rest[2];
            if (!ref) return this._err('Error: neither a valid connection nor device given.', 2);
            const c = this._findConn(ref);
            if (!c) { return this._err(`Error: unknown connection '${ref}'.\nError: no active connection provided.`.replace('\nError: no active connection provided.', ''), 10); }
            return this._up(c, ifn);
        }
        if (is('down', 1)) {
            let ref = rest[1];
            if (rest[1] === 'id' || rest[1] === 'uuid') ref = rest[2];
            if (!ref) return this._err('Error: neither a valid connection nor device given.', 2);
            const c = this._findConn(ref);
            if (!c) return this._err(`Error: '${ref}' is not an active connection.\nError: no active connection provided.`, 10);
            if (!c.active) return this._err(`Error: '${ref}' is not an active connection.\nError: no active connection provided.`, 10);
            const path = c.active.path;
            this._deactivate(c);
            return this._ok(`Connection '${c.props['connection.id']}' successfully deactivated (D-Bus active path: ${path})`);
        }
        if (is('reload', 3) || is('load', 3)) {
            const names = new Set();
            const dir = this._node('/etc/NetworkManager/system-connections');
            const found = [];
            if (dir && dir.children) for (const f of Object.keys(dir.children)) {
                if (!f.endsWith('.nmconnection')) continue;
                const c = this._parseKeyfile(dir.children[f].content || '');
                if (c) found.push(c);
            }
            for (const nc of found) {
                const old = this.conns.find(x => x.uuid === nc.uuid) || this.conns.find(x => x.props['connection.id'] === nc.props['connection.id']);
                if (old) { old.props = nc.props; old.uuid = nc.uuid; } else this.conns.push(nc);
            }
            this.conns = this.conns.filter(c => found.some(f => f.uuid === c.uuid));
            return this._ok('');
        }
        if (is('clone', 2)) {
            const src = this._findConn(rest[1]);
            if (!src) return this._err(`Error: unknown connection '${rest[1]}'.`, 10);
            if (!rest[2]) return this._err('Error: <new name> argument is required.', 2);
            const c = this._newConn(JSON.parse(JSON.stringify(src.props)));
            c.props['connection.id'] = rest[2];
            c.props['connection.interface-name'] = '';
            this.conns.push(c); this._writeKeyfile(c);
            return this._ok(`${rest[2]} (${c.uuid}) cloned from ${rest[1]}.`.replace(/^/, '').replace(/^(.*) cloned from (.*)\.$/, (m, a, b) => `${rest[2]} (${c.uuid}) cloned from ${b}.`));
        }
        if (is('edit', 2)) return this._err('Error: nmcli interactive editor is not available in this simulator; use "nmcli connection modify".', 1);
        return this._err(`Error: argument '${sub}' not understood. Try passing --help instead.`, 2);
    }

    _connShow(rest, flags) {
        let active = false, ref = null;
        for (let i = 0; i < rest.length; i++) { if (rest[i] === '--active') active = true; else if (rest[i] === 'id' || rest[i] === 'uuid' || rest[i] === 'path') ref = rest[++i]; else if (!rest[i].startsWith('--')) ref = rest[i]; }
        if (!ref) {
            const hdr = ['NAME', 'UUID', 'TYPE', 'DEVICE'];
            let list = this.conns;
            if (active) list = list.filter(c => c.active);
            const rows = list.map(c => [c.props['connection.id'], c.uuid, c.props['connection.type'], c.active ? c.active.dev : '--']);
            const f = this._filterCols(rows, hdr, flags);
            if (f.err) return this._err(f.err, 2);
            return this._ok(this._table(f.rows, f.hdr, flags));
        }
        const c = this._findConn(ref);
        if (!c) return this._err(`Error: ${ref} - no such connection profile.`, 10);
        const P = c.props;
        const L = [];
        const row = (k, v) => L.push([k, v]);
        const bool = v => (v === 'yes' ? 'yes' : 'no');
        const list = a => (a.length ? a.join(', ') : '--');
        row('connection.id', P['connection.id']); row('connection.uuid', c.uuid); row('connection.stable-id', '--'); row('connection.type', P['connection.type'] === 'ethernet' ? '802-3-ethernet' : P['connection.type']);
        row('connection.interface-name', P['connection.interface-name'] || '--'); row('connection.autoconnect', bool(P['connection.autoconnect'])); row('connection.autoconnect-priority', P['connection.autoconnect-priority'] || '0');
        row('connection.zone', P['connection.zone'] || '--'); row('connection.master', P['connection.master'] || '--'); row('connection.slave-type', P['connection.slave-type'] || '--');
        row('802-3-ethernet.mtu', P['802-3-ethernet.mtu'] || 'auto');
        row('ipv4.method', P['ipv4.method']); row('ipv4.dns', list(P['ipv4.dns'])); row('ipv4.dns-search', list(P['ipv4.dns-search'])); row('ipv4.addresses', list(P['ipv4.addresses'])); row('ipv4.gateway', P['ipv4.gateway'] || '--'); row('ipv4.routes', list(P['ipv4.routes']));
        row('ipv4.ignore-auto-dns', bool(P['ipv4.ignore-auto-dns'])); row('ipv4.never-default', bool(P['ipv4.never-default']));
        row('ipv6.method', P['ipv6.method']); row('ipv6.dns', list(P['ipv6.dns'])); row('ipv6.addresses', list(P['ipv6.addresses'])); row('ipv6.gateway', P['ipv6.gateway'] || '--');
        if (P['connection.type'] === 'bridge') row('bridge.stp', P['bridge.stp'] || 'yes');
        if (P['connection.type'] === 'vlan') { row('vlan.id', P['vlan.id'] || '0'); row('vlan.parent', P['vlan.parent'] || '--'); }
        if (c.active) {
            const d = this.devices[c.active.dev];
            row('GENERAL.NAME', P['connection.id']); row('GENERAL.UUID', c.uuid); row('GENERAL.DEVICES', d.name); row('GENERAL.STATE', 'activated'); row('GENERAL.DEFAULT', this._defaultRoute() && this._defaultRoute().dev === d.name ? 'yes' : 'no');
            d.addrs.filter(a => !a.cidr.includes(':')).forEach((a, i) => row(`IP4.ADDRESS[${i + 1}]`, a.cidr));
            const gw = this._routes4().find(r => r.dst === 'default' && r.dev === d.name); row('IP4.GATEWAY', gw ? gw.via : '--');
            const dns = P['ipv4.dns'].slice(); if (P['ipv4.ignore-auto-dns'] !== 'yes' && d.dhcpLease) dns.push(...d.dhcpLease.dns);
            dns.forEach((x, i) => row(`IP4.DNS[${i + 1}]`, x));
        }
        let rows = L;
        const sel = flags.get || flags.fields;
        if (sel && sel !== 'all' && sel !== 'common') {
            const want = sel.split(',').map(s => s.trim());
            rows = rows.filter(([k]) => want.some(w => k === w || k.startsWith(w + '.') || k.startsWith(w + '[')));
            if (!rows.length) return this._err(`Error: invalid field '${want[0]}'.`, 2);
        }
        if (flags.get) return this._ok(rows.map(r => r[1]).join('\n'));
        if (flags.terse) return this._ok(rows.map(r => r.join(':')).join('\n'));
        return this._ok(rows.map(([k, v]) => `${k}:`.padEnd(40) + v).join('\n'));
    }

    _connAdd(rest) {
        const props = {};
        const args = rest.slice();
        let autoconnectNo = false, save = true;
        const P = {};
        const aliases = { 'con-name': 'connection.id', 'ifname': 'connection.interface-name', 'type': 'connection.type', 'autoconnect': 'connection.autoconnect', 'master': 'connection.master', 'slave-type': 'connection.slave-type', 'ip4': 'ipv4.addresses', 'gw4': 'ipv4.gateway', 'ip6': 'ipv6.addresses', 'gw6': 'ipv6.gateway', 'mtu': '802-3-ethernet.mtu', 'dev': 'vlan.parent', 'id': 'vlan.id', 'stp': 'bridge.stp', 'mode': 'bond.mode', 'miimon': 'bond.miimon', 'con-id': 'connection.id', 'ethernet.mtu': '802-3-ethernet.mtu' };
        const assigns = [];
        for (let i = 0; i < args.length; i++) {
            const k = args[i];
            if (k === 'save') { i++; continue; }
            if (k === '--') continue;
            if (i + 1 >= args.length) return this._err(`Error: value for '${k}' is missing.`, 2);
            const v = args[++i];
            assigns.push([k, v]);
        }
        const typeA = assigns.find(a => a[0] === 'type');
        if (!typeA) return this._err("Error: 'type' argument is required.", 2);
        const type = typeA[1];
        const types = ['ethernet', 'bridge', 'bond', 'team', 'vlan', 'bridge-slave', 'bond-slave', 'team-slave', 'wifi', 'loopback', 'dummy', 'infiniband', 'tun', 'vpn'];
        if (!types.includes(type)) return this._err(`Error: invalid connection type; ${type} not recognized`.replace('invalid connection type; ' + type + ' not recognized', `failed to add connection: unknown connection type '${type}'`).replace('failed to add connection: ', ''), 2);
        const c = this._newConn({});
        c.props['connection.type'] = type.endsWith('-slave') ? 'ethernet' : type;
        if (type.endsWith('-slave')) c.props['connection.slave-type'] = type.replace('-slave', '');
        let ip4Given = false, method = null;
        for (const [k, v] of assigns) {
            if (k === 'type') continue;
            let key = aliases[k] || k;
            if (key === 'bond.mode') { c.props['bond.options'] = `mode=${v}`; continue; }
            if (key === 'bond.miimon') { c.props['bond.options'] = (c.props['bond.options'] ? c.props['bond.options'] + ',' : '') + `miimon=${v}`; continue; }
            let op = '';
            if (/^[+-]/.test(key)) { op = key[0]; key = key.slice(1); }
            if (key === 'ipv4.addresses') ip4Given = true;
            if (key === 'ipv4.method') method = v;
            const e = this._setProp(c, key, v, op);
            if (e) return this._err(e, 2);
        }
        const P_ = c.props;
        if (!P_['connection.id']) P_['connection.id'] = type === 'ethernet' ? `${type}-${P_['connection.interface-name'] || 'con'}` : `${type}-${P_['connection.interface-name'] || 'con'}`;
        if (type === 'ethernet' && !P_['connection.interface-name'] && !assigns.some(a => a[0] === 'ifname')) return this._err("Error: 'ifname' argument is required.", 2);
        if (['bridge', 'bond', 'team'].includes(type) && !P_['connection.interface-name']) P_['connection.interface-name'] = P_['connection.id'];
        if (ip4Given && !method) P_['ipv4.method'] = 'manual';
        if (P_['ipv4.method'] === 'manual' && !P_['ipv4.addresses'].length && !P_['connection.master']) return this._err(`Error: Failed to add '${P_['connection.id']}' connection: ipv4.addresses: this property cannot be empty for 'method=manual'`, 1);
        if (P_['ipv4.gateway'] && !P_['ipv4.addresses'].length) return this._err(`Error: Failed to add '${P_['connection.id']}' connection: ipv4.gateway: this property is not allowed for 'method=auto'`.replace("'method=auto'", `'method=${P_['ipv4.method']}'`), 1);
        if (P_['ipv6.addresses'].length && P_['ipv6.method'] === 'auto') P_['ipv6.method'] = 'manual';
        this.conns.push(c);
        this._writeKeyfile(c);
        // autoconnect: a new profile on a free device is activated right away
        const dev = this._deviceFor(c);
        if (dev && !dev.active && P_['connection.autoconnect'] === 'yes' && c.props['connection.type'] === 'ethernet' && !c.props['connection.master'] && (P_['ipv4.method'] !== 'auto' || this.dhcpDevices.includes(dev.name))) this._activate(c, dev, true);
        return this._ok(`Connection '${P_['connection.id']}' (${c.uuid}) successfully added.`);
    }

    _connModify(rest) {
        let ref = rest[0];
        if (ref === 'id' || ref === 'uuid') { ref = rest[1]; rest = rest.slice(1); }
        if (!ref) return this._err('Error: connection ID is missing.', 2);
        const c = this._findConn(ref);
        if (!c) return this._err(`Error: unknown connection '${ref}'.`, 10);
        const args = rest.slice(1);
        if (!args.length) return this._err('Error: <setting>.<property> argument is missing.', 2);
        const aliases = { 'ifname': 'connection.interface-name', 'con-name': 'connection.id', 'autoconnect': 'connection.autoconnect', 'ip4': 'ipv4.addresses', 'gw4': 'ipv4.gateway', 'ip6': 'ipv6.addresses', 'gw6': 'ipv6.gateway', 'ipv4.addr': 'ipv4.addresses' };
        const tmp = JSON.parse(JSON.stringify(c.props));
        const shadow = { props: tmp, uuid: c.uuid };
        let method = null, ipSet = false;
        for (let i = 0; i < args.length; i += 2) {
            let key = args[i];
            if (i + 1 >= args.length) return this._err(`Error: value for '${key}' is missing.`, 2);
            const v = args[i + 1];
            let op = '';
            if (/^[+-]/.test(key)) { op = key[0]; key = key.slice(1); }
            key = aliases[key] || key;
            if (key === 'ipv4.method') method = v;
            const e = this._setProp(shadow, key, v, op);
            if (e) return this._err(e, 2);
        }
        if (tmp['ipv4.method'] === 'manual' && !tmp['ipv4.addresses'].length && !tmp['connection.master']) return this._err(`Error: Failed to modify connection '${c.props['connection.id']}': ipv4.addresses: this property cannot be empty for 'method=manual'`, 1);
        if (tmp['ipv4.method'] === 'disabled' && tmp['ipv4.addresses'].length) { tmp['ipv4.addresses'] = []; tmp['ipv4.gateway'] = ''; }
        if (tmp['ipv4.method'] === 'auto' && tmp['ipv4.addresses'].length === 0 && c.props['ipv4.method'] === 'manual') tmp['ipv4.gateway'] = tmp['ipv4.gateway'];
        const renamed = tmp['connection.id'] !== c.props['connection.id'];
        const oldFile = this._kfName(c);
        c.props = tmp;
        if (renamed) this._rm(oldFile);
        this._writeKeyfile(c);
        return this._ok(`Connection '${c.props['connection.id']}' (${c.uuid}) successfully updated.`.replace(/^Connection '(.*)' \(.*\) successfully updated\.$/, () => ''));
    }

    _connDelete(rest) {
        let names = rest.filter(x => x !== 'id' && x !== 'uuid');
        if (!names.length) return this._err('Error: connection ID is missing.', 2);
        const out = [], errs = [];
        for (const n of names) {
            const c = this._findConn(n);
            if (!c) { errs.push(`Error: unknown connection '${n}'.\nError: cannot delete unknown connection(s): '${n}'.`); continue; }
            if (c.active) this._deactivate(c);
            this._rm(this._kfName(c));
            this.conns = this.conns.filter(x => x !== c);
            out.push(`Connection '${c.props['connection.id']}' (${c.uuid}) successfully deleted.`);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 10 : 0 };
    }

    _up(c, ifnameOpt) {
        const P = c.props;
        if (this.netOff) return this._err('Error: Connection activation failed: Network connectivity is disabled (NetworkManager networking is off).'.replace('Network connectivity is disabled (NetworkManager networking is off)', 'Connection \'' + P['connection.id'] + '\' is not available on device ' + (P['connection.interface-name'] || 'eth0') + ' because device is strictly unmanaged'), 4);
        if (['bridge', 'bond', 'team'].includes(P['connection.type'])) {
            const name = P['connection.interface-name'];
            if (!this.devices[name]) this.devices[name] = { name, type: P['connection.type'], mac: '52:54:00:' + [1, 2, 3].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'), mtu: 1500, up: true, addrs: [], active: null };
        }
        if (P['connection.type'] === 'vlan') {
            const name = P['connection.interface-name'] || `${P['vlan.parent']}.${P['vlan.id']}`;
            if (!this.devices[name]) this.devices[name] = { name, type: 'vlan', mac: (this.devices[P['vlan.parent']] || {}).mac || '52:54:00:00:00:99', mtu: 1500, up: true, addrs: [], active: null };
            P['connection.interface-name'] = P['connection.interface-name'] || name;
        }
        let dev;
        if (ifnameOpt) { dev = this.devices[ifnameOpt]; if (!dev) return this._err(`Error: Connection activation failed: No suitable device found for this connection (device ${ifnameOpt} not available because device is not available).`.replace(/\(device .*\)\./, `(device ${ifnameOpt} not found).`), 4); }
        else dev = this._deviceFor(c);
        if (P['connection.master']) {
            const m = this.conns.find(x => x.props['connection.id'] === P['connection.master'] || x.props['connection.interface-name'] === P['connection.master']);
            const sl = this.devices[P['connection.interface-name']];
            if (!m) return this._err(`Error: Connection activation failed: Master connection '${P['connection.master']}' not found.`.replace(/Master connection .* not found\./, 'Unknown master'), 4);
            if (!sl) return this._err(`Error: Connection activation failed: No suitable device found for this connection (device ${P['connection.interface-name']} not available because device was not found).`.replace(/\(device .*\)/, '(device not found)'), 4);
            sl.up = true; c.active = { dev: sl.name, path: `/org/freedesktop/NetworkManager/ActiveConnection/${this.activeSeq++}`, start: Date.now() }; sl.active = c.uuid; sl.master = m.props['connection.interface-name'];
            return this._ok(`Connection successfully activated (master waiting for slaves) (D-Bus active path: ${c.active.path})`.replace(' (master waiting for slaves)', ''));
        }
        if (!dev) return this._err(`Error: Connection activation failed: No suitable device found for this connection (device ${P['connection.interface-name'] || 'lo'} not available because profile is not compatible with device (mismatching interface name)).`.replace(/\(device .* not available because profile is not compatible with device \(mismatching interface name\)\)/, `(device lo not available because device is strictly unmanaged).`), 4);
        if (c.active && c.active.dev !== dev.name) this._deactivate(c);
        if (P['ipv4.method'] === 'auto' && !P['ipv4.addresses'].length && !this.dhcpDevices.includes(dev.name) && P['ipv6.method'] === 'disabled') return this._err('Error: Connection activation failed: IP configuration could not be reserved (no available address, timeout, etc.)', 4);
        if (P['ipv4.method'] === 'auto' && !P['ipv4.addresses'].length && !this.dhcpDevices.includes(dev.name)) {
            this._activate(c, dev, true);
            return this._ok(`Connection successfully activated (D-Bus active path: ${c.active.path})`);
        }
        this._activate(c, dev, true);
        return this._ok(`Connection successfully activated (D-Bus active path: ${c.active.path})`);
    }

    // ===== hostname =====
    _hostnameValid(h) { return h.length <= 64 && /^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(h) && !/\.\./.test(h); }

    _staticHostname() { const t = this._text('/etc/hostname'); return t === null ? '' : t.split('\n')[0].trim(); }

    _setHostname(h, which) {
        if (h !== '' && !this._hostnameValid(h)) return this._err(`Failed to set hostname: Invalid hostname '${h}'`.replace(/^/, ''), 1);
        if (which !== 'transient') this._setEtc('/etc/hostname', h ? h + '\n' : '');
        if (which !== 'static' || true) this.parent.hostname = h || 'localhost';
        if (which === 'pretty') this._pretty = h;
        return this._ok('');
    }

    _hostnameCmd(args) {
        const o = args.filter(a => !a.startsWith('-'));
        const opts = args.filter(a => a.startsWith('-'));
        if (opts.includes('--version')) return this._ok('hostname 3.23');
        if (opts.includes('-I') || opts.includes('--all-ip-addresses')) return this._ok(Object.values(this.devices).filter(d => d.up && d.type !== 'loopback').flatMap(d => d.addrs.filter(a => !a.cidr.includes(':') && a.scope === 'global').map(a => a.cidr.split('/')[0])).join(' ') + ' ');
        if (opts.includes('-i')) { const h = this.parent.hostname; const r = this._getaddr(h); return this._ok(r.ip || '127.0.0.1'); }
        if (opts.includes('-s') || opts.includes('--short')) return this._ok(this.parent.hostname.split('.')[0]);
        if (opts.includes('-d') || opts.includes('--domain')) return this._ok(this.parent.hostname.includes('.') ? this.parent.hostname.split('.').slice(1).join('.') : '');
        if (opts.includes('-f') || opts.includes('--fqdn') || opts.includes('--long')) { const r = this._hostsReverse((this._getaddr(this.parent.hostname).ip) || ''); return this._ok(r ? r[0] : this.parent.hostname); }
        if (opts.includes('-F')) { const f = o[0]; const t = this._text(f); if (t === null) return this._err(`hostname: can't open \`${f}': No such file or directory`, 1); if (!this._isRoot()) return this._err('hostname: you must be root to change the host name', 1); this.parent.hostname = t.split('\n')[0].trim(); return this._ok(''); }
        if (!o.length) return this._ok(this.parent.hostname);
        if (!this._isRoot()) return this._err('hostname: you must be root to change the host name', 1);
        if (!this._hostnameValid(o[0])) return this._err('hostname: the specified hostname is invalid', 1);
        this.parent.hostname = o[0];
        return this._ok('');
    }

    hostnamectl(args) {
        const pos = args.filter(a => !a.startsWith('-'));
        const opts = args.filter(a => a.startsWith('-'));
        const verb = pos[0] || 'status';
        const which = opts.includes('--static') ? 'static' : opts.includes('--transient') ? 'transient' : opts.includes('--pretty') ? 'pretty' : null;
        if (verb === 'set-hostname') {
            if (!pos.length || pos.length < 2) return this._err('Too few arguments.', 1);
            if (!this._isRoot()) return this._err('Could not set property: Interactive authentication required.', 1);
            return this._setHostname(pos[1], which || 'all');
        }
        if (verb === 'hostname') {
            if (pos[1] !== undefined) return this.hostnamectl(['set-hostname', pos[1], ...opts]);
            return this._ok(this.parent.hostname);
        }
        if (verb === 'set-icon-name' || verb === 'set-chassis' || verb === 'set-deployment' || verb === 'set-location') {
            if (!this._isRoot()) return this._err('Could not set property: Interactive authentication required.', 1);
            return this._ok('');
        }
        if (verb === 'status') {
            const st = this._staticHostname();
            if (which === 'static') return this._ok(st);
            if (which === 'transient') return this._ok(this.parent.hostname);
            if (which === 'pretty') return this._ok(this._pretty || '');
            const L = [];
            if (this._pretty) L.push(`   Static hostname: ${st || '(unset)'}`.replace(/^/, '')), L.unshift(`   Pretty hostname: ${this._pretty}`);
            else L.push(`   Static hostname: ${st || '(unset)'}`);
            if (this.parent.hostname !== st) L.push(`Transient hostname: ${this.parent.hostname}`);
            L.push('         Icon name: computer-vm', '           Chassis: vm \u{1F5B4}', '        Machine ID: 4f2a9c8d3b1e4a60a7d5c2e91b3f8a07', '           Boot ID: 8d1c2f6e5a7b4c93b0e1d4a2f9c63e58', '    Virtualization: kvm', '  Operating System: Red Hat Enterprise Linux 9.3 (Plow)', '       CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos', '            Kernel: Linux 5.14.0-362.8.1.el9_3.x86_64', '      Architecture: x86-64', '   Hardware Vendor: QEMU', '    Hardware Model: Standard PC _Q35 + ICH9, 2009_'.replace(/_(.*)_/, '($1)'), '  Firmware Version: 1.16.0-4.el9');
            return this._ok(L.join('\n'));
        }
        return this._err(`Unknown command verb ${verb}.`, 1);
    }

    // ===== ip =====
    _devIdx(name) { return Object.keys(this.devices).indexOf(name) + 1; }

    ip(args) {
        let fam = null, brief = false, oneline = false, stats = false, rest = [];
        for (const a of args) {
            if (a === '-4' || a === '-family=inet') fam = 4; else if (a === '-6') fam = 6;
            else if (a === '-br' || a === '-brief' || a === '-b') brief = true;
            else if (a === '-o' || a === '-oneline') oneline = true;
            else if (a === '-s' || a === '-stats' || a === '-statistics') stats = true;
            else if (a === '-c' || a === '-color' || a === '-h' || a === '-human' || a === '-d' || a === '-details' || a === '-json' || a === '-j') { /* tolerated */ }
            else rest.push(a);
        }
        if (!rest.length) return this._err('Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n       ip [ -force ] -batch filename\nwhere  OBJECT := { address | addrlabel | fou | help | ila | ioam | l2tp | link |\n                   maddress | monitor | mptcp | mroute | mrule | neighbor | neighbour |\n                   netconf | netns | nexthop | ntable | ntbl | route | rule | sr | tap |\n                   tcpmetrics | token | tunnel | tuntap | vrf | xfrm }\n       OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] |\n                    -h[uman-readable] | -iec | -j[son] | -p[retty] |\n                    -f[amily] { inet | inet6 | mpls | bridge | link } |\n                    -4 | -6 | -M | -B | -0 |\n                    -l[oops] { maximum-addr-flush-attempts } | -br[ief] |\n                    -o[neline] | -t[imestamp] | -ts[hort] | -b[atch] [filename] |\n                    -rc[vbuf] [size] | -n[etns] name | -N[umeric] | -a[ll] |\n                    -c[olor]}', 255);
        const obj = rest[0], r = rest.slice(1);
        const m = (full, min) => obj.length >= min && full.startsWith(obj);
        if (obj === '-V' || obj === '-Version') return this._ok('ip utility, iproute2-6.2.0, libbpf 1.2.0');
        if (m('address', 1)) return this._ipAddr(r, fam, brief, oneline);
        if (m('link', 1)) return this._ipLink(r, brief, oneline, stats);
        if (m('route', 1)) return this._ipRoute(r, fam);
        if (m('neighbor', 1) || m('neighbour', 1)) return this._ipNeigh(r);
        if (m('maddress', 2)) return this._ok('');
        if (m('rule', 2)) return this._ok('0:\tfrom all lookup local\n32766:\tfrom all lookup main\n32767:\tfrom all lookup default');
        if (m('netns', 2) || m('tunnel', 2) || m('tuntap', 2) || m('monitor', 2) || m('vrf', 2)) return this._ok('');
        return this._err(`Object "${obj}" is unknown, try "ip help".`, 1);
    }

    _ipAddr(r, fam, brief, oneline) {
        const sub = r[0] || 'show';
        const isSub = (f, min = 1) => sub.length >= min && f.startsWith(sub);
        if (isSub('show', 1) || isSub('list', 1) || isSub('lst', 3) || !r.length || (sub.startsWith('dev'))) {
            let devName = null;
            const rr = (isSub('show', 1) || isSub('list', 1) || sub.startsWith('dev') && false) ? r.slice(1) : r;
            for (let i = 0; i < rr.length; i++) { if (rr[i] === 'dev') devName = rr[++i]; else if (!['up', 'scope', 'label', 'to', 'primary', 'secondary', 'dynamic', 'permanent', 'tentative'].includes(rr[i]) && !devName) devName = rr[i]; else if (rr[i] === 'scope') i++; }
            if (!r.length) devName = null;
            const list = Object.values(this.devices);
            const show = devName ? list.filter(d => d.name === devName) : list;
            if (devName && !show.length) return this._err(`Device "${devName}" does not exist.`, 1);
            const L = [];
            if (brief) {
                for (const d of show) {
                    const st = d.type === 'loopback' ? 'UNKNOWN' : (d.up ? 'UP' : 'DOWN');
                    const as = d.addrs.filter(a => fam === 4 ? !a.cidr.includes(':') : fam === 6 ? a.cidr.includes(':') : true).map(a => a.cidr);
                    L.push(`${d.name.padEnd(16)} ${st.padEnd(14)} ${as.join(' ')}`.trimEnd() + ' ');
                }
                return this._ok(L.join('\n'));
            }
            for (const d of show) {
                const flagsUp = d.type === 'loopback' ? '<LOOPBACK,UP,LOWER_UP>' : (d.up ? '<BROADCAST,MULTICAST,UP,LOWER_UP>' : '<BROADCAST,MULTICAST>');
                const state = d.type === 'loopback' ? 'UNKNOWN' : (d.up ? 'UP' : 'DOWN');
                L.push(`${this._devIdx(d.name)}: ${d.name}: ${flagsUp} mtu ${d.mtu} qdisc ${d.type === 'loopback' ? 'noqueue' : (d.up ? 'fq_codel' : 'fq_codel')} state ${state} group default qlen ${d.type === 'loopback' ? 1000 : 1000}`);
                L.push(d.type === 'loopback' ? `    link/loopback ${d.mac} brd 00:00:00:00:00:00` : `    link/ether ${d.mac} brd ff:ff:ff:ff:ff:ff`);
                if (d.alt) L.push(`    altname ${d.alt}`);
                for (const a of d.addrs) {
                    const v6 = a.cidr.includes(':');
                    if (fam === 4 && v6 || fam === 6 && !v6) continue;
                    if (v6) { L.push(`    inet6 ${a.cidr} scope ${a.scope}${a.noprefix ? ' noprefixroute' : ''} `); L.push('       valid_lft forever preferred_lft forever'); }
                    else {
                        const n = this._net(a.cidr);
                        const brd = d.type === 'loopback' || n.len >= 31 ? '' : ` brd ${this._n2ip(n.bcast)}`;
                        const lft = a.dynamic ? (() => { const left = Math.max(0, 3600 - Math.floor((Date.now() - this.dhcpStart) / 1000) % 3600); return `${left}sec preferred_lft ${left}sec`; })() : 'forever preferred_lft forever';
                        L.push(`    inet ${a.cidr}${brd} scope ${a.scope}${a.dynamic ? ' dynamic' : ''}${a.noprefix ? ' noprefixroute' : ''} ${a.label || d.name}`);
                        L.push(`       valid_lft ${lft}`);
                    }
                }
            }
            return this._ok(oneline ? L.join('\n') : L.join('\n'));
        }
        if (isSub('add', 1) || isSub('delete', 1) || isSub('del', 3) || isSub('change', 1) || isSub('replace', 1)) {
            if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2);
            const adding = isSub('add', 1) || isSub('replace', 1) || isSub('change', 1);
            const addr = r[1];
            const di = r.indexOf('dev');
            if (!addr || addr === 'dev') return this._err('Command "' + sub + '" is unknown, try "ip address help".'.replace(/^Command .*$/, 'Usage: ip address {add|change|replace} IFADDR dev IFNAME [ LIFETIME ]'), 255);
            if (di < 0 || !r[di + 1]) return this._err('Not enough information: "dev" argument is required.', 255);
            const d = this.devices[r[di + 1]];
            if (!d) return this._err(`Cannot find device "${r[di + 1]}"`, 1);
            const v6 = addr.includes(':');
            if (!v6 && !this._isV4(addr.split('/')[0])) return this._err(`Error: any valid prefix is expected rather than "${addr}".`, 1);
            if (v6 && !this._isV6(addr.split('/')[0])) return this._err(`Error: any valid prefix is expected rather than "${addr}".`, 1);
            const pl = addr.split('/')[1];
            if (pl !== undefined && (!/^\d+$/.test(pl) || +pl > (v6 ? 128 : 32))) return this._err(`Error: ${v6 ? 'inet6' : 'inet'} prefix is expected rather than "${addr}".`, 1);
            const cidr = addr.includes('/') ? addr : addr + (v6 ? '/128' : '/32');
            if (adding) {
                if (d.addrs.some(a => a.cidr === cidr)) return isSub('replace', 1) ? this._ok('') : this._err('RTNETLINK answers: File exists', 2);
                d.addrs.push({ cidr, scope: 'global', label: (r.indexOf('label') >= 0 ? r[r.indexOf('label') + 1] : d.name) });
            } else {
                const i = d.addrs.findIndex(a => a.cidr === cidr);
                if (i < 0) return this._err('Error: ' + (v6 ? 'inet6' : 'inet') + ' address not found.'.replace('Error: inet address not found.', 'RTNETLINK answers: Cannot assign requested address').replace(/^Error: inet6 address not found\.$/, 'RTNETLINK answers: Cannot assign requested address'), 2);
                d.addrs.splice(i, 1);
            }
            return this._ok('');
        }
        if (isSub('flush', 1)) {
            if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2);
            const di = r.indexOf('dev');
            const d = this.devices[di >= 0 ? r[di + 1] : r[1]];
            if (!d) return this._err(`Device "${di >= 0 ? r[di + 1] : r[1]}" does not exist.`, 1);
            d.addrs = d.addrs.filter(a => a.scope === 'host' && d.type === 'loopback' ? true : a.ll6 && false);
            return this._ok('');
        }
        return this._err(`Command "${sub}" is unknown, try "ip address help".`, 255);
    }

    _ipLink(r, brief, oneline, stats) {
        const sub = r[0] || 'show';
        const isSub = (f, min = 1) => sub.length >= min && f.startsWith(sub);
        if (isSub('show', 1) || isSub('list', 1) || !r.length) {
            const dn = r[0] && !isSub('show', 1) && !isSub('list', 1) ? r[0] : (r.indexOf('dev') >= 0 ? r[r.indexOf('dev') + 1] : r[1]);
            const list = Object.values(this.devices).filter(d => !dn || d.name === dn);
            if (dn && !list.length) return this._err(`Device "${dn}" does not exist.`, 1);
            const L = [];
            for (const d of list) {
                const st = d.type === 'loopback' ? 'UNKNOWN' : (d.up ? 'UP' : 'DOWN');
                if (brief) { L.push(`${d.name.padEnd(16)} ${st.padEnd(14)} ${d.mac} ${d.type === 'loopback' ? '<LOOPBACK,UP,LOWER_UP>' : (d.up ? '<BROADCAST,MULTICAST,UP,LOWER_UP>' : '<BROADCAST,MULTICAST>')} `); continue; }
                L.push(`${this._devIdx(d.name)}: ${d.name}: ${d.type === 'loopback' ? '<LOOPBACK,UP,LOWER_UP>' : (d.up ? '<BROADCAST,MULTICAST,UP,LOWER_UP>' : '<BROADCAST,MULTICAST>')} mtu ${d.mtu} qdisc ${d.type === 'loopback' ? 'noqueue' : 'fq_codel'} state ${st} mode DEFAULT group default qlen 1000`);
                L.push(d.type === 'loopback' ? `    link/loopback ${d.mac} brd 00:00:00:00:00:00` : `    link/ether ${d.mac} brd ff:ff:ff:ff:ff:ff`);
                if (d.alt) L.push(`    altname ${d.alt}`);
                if (stats) { L.push('    RX:  bytes packets errors dropped  missed   mcast'); L.push(`    ${String(d.up ? 1843921 : 0).padStart(10)}   ${String(d.up ? 4210 : 0).padStart(6)}      0       0       0       0`); L.push('    TX:  bytes packets errors dropped carrier collsns'); L.push(`    ${String(d.up ? 912230 : 0).padStart(10)}   ${String(d.up ? 3320 : 0).padStart(6)}      0       0       0       0`); }
            }
            return this._ok(L.join('\n'));
        }
        if (isSub('set', 1) || isSub('add', 1) || isSub('delete', 1)) {
            if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2);
            if (isSub('add', 1)) {
                const name = r[r.indexOf('name') + 1] || r[1];
                const ti = r.indexOf('type');
                const type = ti >= 0 ? r[ti + 1] : 'dummy';
                if (this.devices[name]) return this._err('RTNETLINK answers: File exists', 2);
                this.devices[name] = { name, type, mac: '52:54:00:' + [1, 2, 3].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'), mtu: 1500, up: false, addrs: [], active: null };
                return this._ok('');
            }
            if (isSub('delete', 1)) { const name = r[r.indexOf('dev') >= 0 ? r.indexOf('dev') + 1 : 1]; if (!this.devices[name]) return this._err(`Cannot find device "${name}"`, 1); if (['lo', 'eth0', 'eth1'].includes(name)) return this._err('RTNETLINK answers: Operation not supported', 2); delete this.devices[name]; return this._ok(''); }
            const di = r.indexOf('dev');
            const name = di >= 0 ? r[di + 1] : r[1];
            const d = this.devices[name];
            if (!d) return this._err(`Cannot find device "${name}"`, 1);
            const opts = r.slice(di >= 0 ? di + 2 : 2);
            for (let i = 0; i < opts.length; i++) {
                if (opts[i] === 'up') { d.up = true; }
                else if (opts[i] === 'down') { d.up = false; this.kroutes = this.kroutes.filter(x => x.dev !== d.name); }
                else if (opts[i] === 'mtu') { const v = +opts[++i]; if (!(v >= 68 && v <= 65535)) return this._err('Error: mtu greater than device maximum.', 2); d.mtu = v; }
                else if (opts[i] === 'name') { d.name = opts[++i]; }
                else if (opts[i] === 'address') { d.mac = opts[++i]; }
                else if (opts[i] === 'promisc' || opts[i] === 'multicast' || opts[i] === 'arp') i++;
            }
            return this._ok('');
        }
        return this._err(`Command "${sub}" is unknown, try "ip link help".`, 255);
    }

    _fmtRoute(r) {
        let s = r.dst;
        if (r.via) s += ` via ${r.via}`;
        s += ` dev ${r.dev}`;
        if (r.proto) s += ` proto ${r.proto}`;
        if (r.proto === 'kernel') s += ' scope link';
        if (r.src) s += ` src ${r.src}`;
        if (r.metric !== undefined && r.metric !== null) s += ` metric ${r.metric}`;
        return s;
    }

    _ipRoute(r, fam) {
        const sub = r[0] || 'show';
        const isSub = (f, min = 1) => sub.length >= min && f.startsWith(sub);
        if (fam === 6) {
            if (isSub('show', 1) || isSub('list', 1)) {
                const L = [];
                for (const d of Object.values(this.devices)) if (d.up && d.type !== 'loopback' && d.addrs.some(a => a.ll6)) L.push(`fe80::/64 dev ${d.name} proto kernel metric 1024 pref medium`);
                return this._ok(L.join('\n'));
            }
        }
        if (isSub('show', 1) || isSub('list', 1) || isSub('ls', 2) || !r.length) {
            let rs = this._routes4().map(x => this._fmtRoute(x));
            const rr = r.slice(1);
            const di = rr.indexOf('dev'); if (di >= 0) { const dn = rr[di + 1]; rs = this._routes4().filter(x => x.dev === dn).map(x => this._fmtRoute(x)); }
            return this._ok(rs.join('\n'));
        }
        if (isSub('get', 1)) {
            const ip = r[1];
            if (!ip || !this._isV4(ip)) return this._err(`Error: any valid address is expected rather than "${ip || ''}".`, 1);
            if (this._myAddrs().includes(ip) || ip.startsWith('127.')) return this._ok(`local ${ip} dev lo src ${ip} uid 0 \n    cache <local> `);
            const rt = this._routeFor(ip);
            if (!rt) return this._err('RTNETLINK answers: Network is unreachable', 2);
            const d = this.devices[rt.dev];
            const src = (d.addrs.find(a => !a.cidr.includes(':')) || {}).cidr;
            return this._ok(`${ip}${rt.via ? ' via ' + rt.via : ''} dev ${rt.dev} src ${src ? src.split('/')[0] : ''} uid 0 \n    cache `);
        }
        if (isSub('add', 1) || isSub('replace', 1) || isSub('change', 2) || isSub('append', 2)) {
            if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2);
            let dst = r[1];
            if (!dst) return this._err('Usage: ip route { list | flush } SELECTOR\n       ip route save SELECTOR\n       ip route restore\n       ip route showdump\n       ip route get [ ROUTE_GET_FLAGS ] ADDRESS\n                            [ from ADDRESS iif STRING ]\n                            [ oif STRING ] [ tos TOS ]\n                            [ mark NUMBER ] [ vrf NAME ]\n                            [ ipproto PROTOCOL ] [ sport NUMBER ] [ dport NUMBER ]\n       ip route { add | del | change | append | replace } ROUTE', 255);
            const vi = r.indexOf('via'), di = r.indexOf('dev'), mi = r.indexOf('metric');
            const via = vi >= 0 ? r[vi + 1] : null;
            let dev = di >= 0 ? r[di + 1] : null;
            if (dst !== 'default') { if (!this._isV4(dst.split('/')[0]) || (dst.includes('/') && !(+dst.split('/')[1] >= 0 && +dst.split('/')[1] <= 32))) return this._err(`Error: ${dst.includes('/') ? 'inet prefix is expected rather than "' + dst + '".' : 'Invalid prefix for given prefix length.'}`.replace(/^Error: Invalid.*$/, `Error: any valid prefix is expected rather than "${dst}".`), 1); if (!dst.includes('/')) dst += '/32'; else { const n = this._net(dst); if (this._n2ip(n.net) !== n.ip) return this._err('Error: Invalid prefix for given prefix length.', 1); } }
            if (via && !this._isV4(via)) return this._err(`Error: inet address is expected rather than "${via}".`, 1);
            if (!via && !dev) return this._err('Error: either "to" is duplicate, or "' + (r[2] || '') + '" is a garbage.', 1);
            if (via) {
                const reach = this._routes4().find(x => x.dst !== 'default' && this._inNet(via, x.dst)) ;
                if (!reach) return this._err('Error: Nexthop has invalid gateway.', 2);
                if (!dev) dev = reach.dev;
            }
            if (dev && !this.devices[dev]) return this._err(`Cannot find device "${dev}"`, 1);
            if (dev && !this.devices[dev].up) return this._err('Error: Device for nexthop is not up.', 2);
            const ex = this.kroutes.find(x => x.dst === dst && (x.metric === (mi >= 0 ? +r[mi + 1] : 0)));
            const existing = this._routes4().find(x => x.dst === dst && x.metric === (mi >= 0 ? +r[mi + 1] : x.metric) && x.via === (via || x.via));
            if (isSub('add', 1) && (ex || (dst === 'default' && this._routes4().some(x => x.dst === 'default' && x.metric === (mi >= 0 ? +r[mi + 1] : 0))))) return this._err('RTNETLINK answers: File exists', 2);
            if (isSub('replace', 1)) this.kroutes = this.kroutes.filter(x => x.dst !== dst);
            this.kroutes.push({ dst, via: via || undefined, dev, proto: undefined, metric: mi >= 0 ? +r[mi + 1] : (dst === 'default' ? 0 : undefined), static: true });
            return this._ok('');
        }
        if (isSub('delete', 1) || isSub('del', 3)) {
            if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2);
            let dst = r[1];
            if (!dst) return this._err('Error: argument "ROUTE" is required.'.replace(/.*/, 'Usage: ip route del ROUTE'), 255);
            if (dst !== 'default' && !dst.includes('/')) dst += '/32';
            const i = this.kroutes.findIndex(x => x.dst === dst);
            if (i >= 0) { this.kroutes.splice(i, 1); return this._ok(''); }
            // removing a NetworkManager-managed route: drop it from the device until the next activation
            const nm = this._routes4().find(x => x.dst === dst);
            if (nm) { nm.suppress = true; const d = this.devices[nm.dev]; const c = this.conns.find(x => x.uuid === d.active); if (c && nm.dst === 'default') { c.props['ipv4.gateway'] = ''; if (d.dhcpLease) d.dhcpLease.gw = ''; this._tempNoGw = this._tempNoGw || {}; this._tempNoGw[d.name] = true; } return this._ok(''); }
            return this._err('RTNETLINK answers: No such process', 2);
        }
        if (isSub('flush', 1)) { if (!this._isRoot()) return this._err('RTNETLINK answers: Operation not permitted', 2); this.kroutes = []; return this._ok(''); }
        return this._err(`Command "${sub}" is unknown, try "ip route help".`, 255);
    }

    _ipNeigh(r) {
        const gw = this._defaultRoute();
        const L = [];
        if (gw) L.push(`${gw.via} dev ${gw.dev} lladdr 52:54:00:a1:b2:c3 REACHABLE`);
        return this._ok(L.join('\n'));
    }

    // ===== ifconfig / route (legacy net-tools) =====
    ifconfig(args) {
        const only = args.filter(a => !a.startsWith('-'))[0];
        const L = [];
        for (const d of Object.values(this.devices)) {
            if (only && d.name !== only) continue;
            if (!args.includes('-a') && !d.up && !only) continue;
            const v4 = d.addrs.find(a => !a.cidr.includes(':'));
            const flags = d.type === 'loopback' ? '73<UP,LOOPBACK,RUNNING>' : (d.up ? '4163<UP,BROADCAST,RUNNING,MULTICAST>' : '4098<BROADCAST,MULTICAST>');
            L.push(`${d.name}: flags=${flags}  mtu ${d.mtu}`);
            if (v4) {
                const n = this._net(v4.cidr);
                L.push(`        inet ${n.ip}  netmask ${this._netmask(n.len)}${d.type === 'loopback' ? '' : '  broadcast ' + this._n2ip(n.bcast)}`);
            }
            for (const a of d.addrs.filter(x => x.cidr.includes(':'))) L.push(`        inet6 ${a.cidr.split('/')[0]}  prefixlen ${a.cidr.split('/')[1]}  scopeid 0x${a.scope === 'host' ? '10<host>' : '20<link>'}`);
            L.push(d.type === 'loopback' ? '        loop  txqueuelen 1000  (Local Loopback)' : `        ether ${d.mac}  txqueuelen 1000  (Ethernet)`);
            L.push('        RX packets 4210  bytes 1843921 (1.7 MiB)', '        RX errors 0  dropped 0  overruns 0  frame 0', '        TX packets 3320  bytes 912230 (890.8 KiB)', '        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0', '');
        }
        if (only && !L.length) return this._err(`${only}: error fetching interface information: Device not found`, 1);
        return this._ok(L.join('\n').replace(/\n$/, ''));
    }

    route(args) {
        const rs = this._routes4();
        if (!args.length || args[0] === '-n' || args[0] === '-e') {
            const num = args.includes('-n');
            const L = ['Kernel IP routing table', 'Destination     Gateway         Genmask         Flags Metric Ref    Use Iface'];
            for (const r of rs) {
                const isDef = r.dst === 'default';
                const [ip, l] = isDef ? ['0.0.0.0', 0] : r.dst.split('/');
                const dstTxt = isDef && !num ? 'default' : ip;
                L.push(`${dstTxt.padEnd(15)} ${(r.via || '0.0.0.0').padEnd(15)} ${this._netmask(+l).padEnd(15)} ${(r.via ? 'UG' : 'U').padEnd(5)} ${String(r.metric || 0).padEnd(6)} 0        0 ${r.dev}`);
            }
            return this._ok(L.join('\n'));
        }
        if (args[0] === 'add' || args[0] === 'del') {
            if (!this._isRoot()) return this._err(args[0] === 'add' ? 'SIOCADDRT: Operation not permitted' : 'SIOCDELRT: Operation not permitted', 1);
            const a = args.slice(1);
            const gi = a.indexOf('gw'), di = a.indexOf('dev'), mi = a.indexOf('netmask');
            let dst = 'default';
            if (a[0] === 'default') dst = 'default';
            else if (a[0] === '-net' || a[0] === '-host') { dst = a[1]; if (a[0] === '-host') dst += '/32'; else if (!dst.includes('/')) dst += mi >= 0 ? '/' + this._maskLen(a[mi + 1]) : '/24'; }
            else dst = a[0];
            if (args[0] === 'del') { const i = this.kroutes.findIndex(x => x.dst === dst); if (i < 0) return this._err('SIOCDELRT: No such process', 1); this.kroutes.splice(i, 1); return this._ok(''); }
            const via = gi >= 0 ? a[gi + 1] : null;
            let dev = di >= 0 ? a[di + 1] : null;
            if (via) { const reach = this._routes4().find(x => x.dst !== 'default' && this._inNet(via, x.dst)); if (!reach) return this._err('SIOCADDRT: Network is unreachable', 1); dev = dev || reach.dev; }
            if (!dev) return this._err('SIOCADDRT: No such device', 1);
            this.kroutes.push({ dst, via: via || undefined, dev, metric: dst === 'default' ? 0 : undefined, static: true });
            return this._ok('');
        }
        return this._err('Usage: route [-nNvee] [-FC] [<AF>]           List kernel routing tables', 1);
    }

    _maskLen(mask) { let n = this._ip2n(mask), c = 0; while (n & 0x80000000) { c++; n = (n << 1) >>> 0; } return c; }

    // ===== ping / traceroute =====
    ping(args) {
        let count = 4, quiet = false, host = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-c') count = parseInt(args[++i], 10); else if (/^-c\d+$/.test(a)) count = parseInt(a.slice(2), 10);
            else if (a === '-W' || a === '-w' || a === '-i' || a === '-s' || a === '-t' || a === '-I' || a === '-Q' || a === '-M') i++;
            else if (a === '-q') quiet = true;
            else if (a === '-4' || a === '-6' || a === '-n' || a === '-v' || a === '-D' || a === '-A' || a === '-f' || a === '-b' || a === '-U') { /* tolerated */ }
            else if (!a.startsWith('-')) host = a;
        }
        if (!host) return this._err('ping: usage error: Destination address required', 2);
        if (!(count >= 1)) return this._err(`ping: invalid argument: '${args[args.indexOf('-c') + 1]}'`, 2);
        let ip = host, canon = host;
        if (!this._isV4(host)) {
            if (host === 'localhost') ip = '127.0.0.1';
            else {
                const r = this._getaddr(host);
                if (r.err) return this._err(r.err === 'nxdomain' ? `ping: ${host}: Name or service not known` : `ping: ${host}: Temporary failure in name resolution`, 2);
                ip = r.ip; canon = r.canon || host;
                if (ip.includes(':')) return this._err('ping: connect: Network is unreachable', 2);
            }
        }
        const label = this._isV4(host) ? ip : `${canon} (${ip})`;
        const header = `PING ${this._isV4(host) ? ip : canon} (${ip}) 56(84) bytes of data.`;
        const mine = this._myAddrs();
        let kind;
        if (mine.includes(ip) || ip.startsWith('127.')) kind = 'local';
        else {
            const rt = this._routeFor(ip);
            if (!rt) return { stdout: '', stderr: 'ping: connect: Network is unreachable', exitCode: 2 };
            const onLink = rt.dst !== 'default' && !rt.via;
            const known = ip === this._gwOf(rt) || this._knownHost(ip);
            kind = onLink ? (known ? 'lan' : 'unreach') : (this._knownHost(ip) || !this._privateIp(ip) ? 'wan' : 'unreach-remote');
            if (kind === 'unreach-remote') kind = 'wan';
        }
        const ttl = kind === 'local' ? 64 : kind === 'lan' ? 64 : 53;
        const out = [header];
        const times = [];
        let recv = 0;
        const srcIp = (() => { const rt = this._routeFor(ip); const d = rt && this.devices[rt.dev]; const a = d && d.addrs.find(x => !x.cidr.includes(':')); return a ? a.cidr.split('/')[0] : '127.0.0.1'; })();
        for (let i = 1; i <= count; i++) {
            if (kind === 'unreach') { out.push(`From ${srcIp} icmp_seq=${i} Destination Host Unreachable`); continue; }
            const t = kind === 'local' ? this._rnd(0.02, 0.09) : kind === 'lan' ? this._rnd(0.25, 0.9) : this._rnd(11, 24);
            times.push(t); recv++;
            out.push(`64 bytes from ${this._isV4(host) ? ip : `${canon} (${ip})`}: icmp_seq=${i} ttl=${ttl} time=${t.toFixed(kind === 'wan' ? 1 : 3)} ms`);
        }
        const loss = Math.round((count - recv) / count * 100);
        const tail = [`--- ${this._isV4(host) ? ip : canon} ping statistics ---`, `${count} packets transmitted, ${recv} received,${kind === 'unreach' ? ` +${count} errors,` : ''} ${loss}% packet loss, time ${(count - 1) * 1000 + (kind === 'unreach' ? 3000 : 1) }ms`];
        if (times.length) { const mn = Math.min(...times), mx = Math.max(...times), av = times.reduce((a, b) => a + b, 0) / times.length; const sd = Math.sqrt(times.reduce((a, b) => a + (b - av) ** 2, 0) / times.length); tail.push(`rtt min/avg/max/mdev = ${[mn, av, mx, sd].map(x => x.toFixed(3)).join('/')} ms`); }
        else if (kind === 'unreach') tail.push('pipe 4');
        const body = quiet ? [header] : out;
        return { stdout: [...body, '', ...tail].join('\n').replace(/\n\n--- /, '\n\n--- '), stderr: '', exitCode: recv ? 0 : (kind === 'unreach' ? 1 : 1) };
    }

    _gwOf(rt) { return rt.via || null; }
    _privateIp(ip) { return this._inNet(ip, '10.0.0.0/8') || this._inNet(ip, '172.16.0.0/12') || this._inNet(ip, '192.168.0.0/16'); }
    _knownHost(ip) {
        const known = new Set(['192.168.1.1', '192.168.1.254', '192.168.1.253', '192.168.1.101', '192.168.1.102', '192.168.1.111', '192.168.1.112', '192.168.1.120', '192.168.1.121', '192.168.1.130', '192.168.1.10', '8.8.8.8', '8.8.4.4', '1.1.1.1']);
        if (known.has(ip)) return true;
        for (const r of Object.values(this.zone)) if (r.A && r.A.includes(ip)) return true;
        return false;
    }

    traceroute(args) {
        const host = args.filter(a => !a.startsWith('-'))[0];
        if (!host) return this._err('Specify "host" missing argument.', 2);
        let ip = host;
        if (!this._isV4(host)) { const r = this._getaddr(host); if (r.err) return this._err(`${host}: Name or service not known\nCannot handle "host" cmdline arg \`${host}' on position 1 (argc 1)`, 2); ip = r.ip; }
        const rt = this._routeFor(ip);
        if (!rt) return this._err('connect: Network is unreachable', 2);
        const L = [`traceroute to ${host} (${ip}), 30 hops max, 60 byte packets`];
        const t = () => this._rnd(0.3, 0.9).toFixed(3);
        if (rt.via) { L.push(` 1  _gateway (${rt.via})  ${t()} ms  ${t()} ms  ${t()} ms`); if (!this._privateIp(ip)) L.push(` 2  ${ip}  ${(this._rnd(11, 20)).toFixed(3)} ms  ${(this._rnd(11, 20)).toFixed(3)} ms  ${(this._rnd(11, 20)).toFixed(3)} ms`); }
        else L.push(` 1  ${ip}  ${t()} ms  ${t()} ms  ${t()} ms`);
        return this._ok(L.join('\n'));
    }

    // ===== dig / nslookup / host / getent =====
    _dnsFail(tool, st, name) {
        if (st.err === 'noserver') return { noServer: true };
        return { timeout: true, server: st.server };
    }

    dig(args) {
        let type = 'A', server = null, name = null, short = false, noall = false, answerOnly = false, reverse = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a.startsWith('@')) server = a.slice(1);
            else if (a === '-t') type = (args[++i] || 'A').toUpperCase();
            else if (a === '-x') { reverse = true; name = args[++i]; }
            else if (a === '+short') short = true;
            else if (a === '+noall') noall = true;
            else if (a === '+answer') answerOnly = true;
            else if (a === '-4' || a === '-6' || a === '-p' || a.startsWith('+')) { if (a === '-p') i++; }
            else if (/^(A|AAAA|MX|NS|TXT|SOA|PTR|CNAME|ANY|SRV)$/i.test(a) && name) type = a.toUpperCase();
            else if (!name) name = a;
        }
        if (!name && !reverse) return this._ok('; <<>> DiG 9.16.23-RH <<>>\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 31822\n;; flags: qr rd ra; QUERY: 1, ANSWER: 13, AUTHORITY: 0, ADDITIONAL: 1');
        const st = server ? { server, rc: this._resolvConf() } : this._dnsServerState();
        const serverIp = server || st.server;
        const fail = () => {
            if (st.err === 'noserver') return this._ok(`; <<>> DiG 9.16.23-RH <<>> ${name}\n;; global options: +cmd\n;; connection timed out; no servers could be reached`.replace(/^/, '')) && { stdout: short ? '' : `; <<>> DiG 9.16.23-RH <<>> ${name}\n;; global options: +cmd\n;; connection timed out; no servers could be reached`, stderr: '', exitCode: 9 };
            return { stdout: short ? '' : `;; communications error to ${serverIp}#53: timed out\n;; communications error to ${serverIp}#53: timed out\n;; communications error to ${serverIp}#53: timed out\n\n; <<>> DiG 9.16.23-RH <<>> ${name}\n;; global options: +cmd\n;; no servers could be reached`, stderr: '', exitCode: 9 };
        };
        if (!server && st.err) return fail();
        let qname = name, qtype = type, ans = [], status = 'NOERROR';
        if (reverse) {
            if (!this._isV4(name)) return this._err(`Invalid IP address ${name}`, 10);
            qname = name.split('.').reverse().join('.') + '.in-addr.arpa';
            qtype = 'PTR';
            const p = this._ptrLookup(name);
            if (p) ans.push([qname + '.', 'PTR', p]); else status = 'NXDOMAIN';
        } else {
            const rec = this._dnsLookup(qname, qtype);
            if (rec === null) status = 'NXDOMAIN';
            else {
                const base = qname.replace(/\.$/, '') + '.';
                if (rec.CNAME) ans.push([base, 'CNAME', rec.CNAME]);
                for (const [t, vals] of Object.entries(rec)) { if (t === 'CNAME') continue; (Array.isArray(vals) ? vals : [vals]).forEach(v => ans.push([rec.CNAME ? rec.CNAME : base, t, v])); }
            }
        }
        if (short) return { stdout: ans.map(a => a[2]).join('\n'), stderr: '', exitCode: 0 };
        const L = [];
        const body = () => {
            if (!noall || answerOnly) { /* sections */ }
        };
        if (noall && answerOnly) return this._ok(ans.map(a => `${a[0].padEnd(23)} ${'300'.padEnd(7)} IN      ${a[1].padEnd(7)} ${a[2]}`).join('\n'));
        L.push(`; <<>> DiG 9.16.23-RH <<>> ${args.filter(a => !a.startsWith('+')).join(' ')}`);
        L.push(';; global options: +cmd', ';; Got answer:', `;; ->>HEADER<<- opcode: QUERY, status: ${status}, id: ${Math.floor(Math.random() * 60000 + 1000)}`, `;; flags: qr rd ra; QUERY: 1, ANSWER: ${ans.length}, AUTHORITY: ${status === 'NXDOMAIN' ? 1 : 0}, ADDITIONAL: 1`, '', ';; OPT PSEUDOSECTION:', '; EDNS: version: 0, flags:; udp: 65494', ';; QUESTION SECTION:', `;${qname.replace(/\.$/, '')}.`.padEnd(32) + `IN      ${qtype}`);
        if (ans.length) { L.push('', ';; ANSWER SECTION:'); for (const a of ans) L.push(`${a[0].padEnd(31)} 300 IN ${a[1].padEnd(7)} ${a[2]}`); }
        else if (status === 'NXDOMAIN') L.push('', ';; AUTHORITY SECTION:', '.                       10800   IN      SOA     a.root-servers.net. nstld.verisign-grs.com. 2024010200 1800 900 604800 86400');
        L.push('', `;; Query time: ${Math.floor(this._rnd(3, 40))} msec`, `;; SERVER: ${serverIp}#53(${serverIp})`, `;; WHEN: ${this._whenStr()}`, `;; MSG SIZE  rcvd: ${60 + ans.length * 16}`, '');
        return this._ok(L.join('\n'));
    }

    _whenStr() { const tm = this.shared.timeCmds; return tm ? tm.format(tm.now(), tm.tm.tz, '%a %b %e %H:%M:%S %Z %Y') : new Date().toString(); }

    nslookup(args) {
        const pos = args.filter(a => !a.startsWith('-'));
        if (!pos.length) return this._err('nslookup: interactive mode is not supported in this simulator; give a name', 1);
        let name = pos[0];
        const type = (args.find(a => a.startsWith('-type=')) || '').slice(6).toUpperCase() || (args.includes('-q') ? '' : 'A');
        const server = pos[1];
        const st = server ? { server, rc: this._resolvConf() } : this._dnsServerState();
        if (!server && st.err) return { stdout: ';; communications error to 127.0.0.1#53: connection refused\n;; no servers could be reached', stderr: '', exitCode: 1 };
        const sv = server || st.server;
        const head = `Server:\t\t${sv}\nAddress:\t${sv}#53\n`;
        if (this._isV4(name)) {
            const p = this._ptrLookup(name) || (this._hostsReverse(name) || [null])[0];
            const arpa = name.split('.').reverse().join('.') + '.in-addr.arpa';
            if (!this._ptrLookup(name)) return { stdout: head + `\n** server can't find ${arpa}: NXDOMAIN`, stderr: '', exitCode: 1 };
            return this._ok(head + `\n${arpa}\tname = ${this._ptrLookup(name)}\n\nAuthoritative answers can be found from:`);
        }
        const rc = st.rc || this._resolvConf();
        const cands = [name]; if (!name.includes('.')) for (const s of rc.search) cands.push(`${name}.${s}`);
        for (const c of cands) {
            const t = type || 'A';
            const rec = this._dnsLookup(c, t);
            if (rec === null) continue;
            const L = [head, ''];
            const auth = this._dnsLookup(c, 'A') && /example\.com$/.test(c);
            if (!auth) L.push('Non-authoritative answer:');
            if (t === 'MX') (rec.MX || []).forEach(m => L.push(`${c}\tmail exchanger = ${m}`));
            else if (t === 'NS') (rec.NS || []).forEach(m => L.push(`${c}\tnameserver = ${m}`));
            else if (t === 'TXT') (rec.TXT || []).forEach(m => L.push(`${c}\ttext = ${m}`));
            else {
                if (rec.CNAME) L.push(`${c}\tcanonical name = ${rec.CNAME}`);
                L.push(`Name:\t${rec.CNAME ? rec.CNAME.replace(/\.$/, '') : c}`);
                const addrs = (rec.A || []).concat(t === 'A' ? [] : []);
                addrs.forEach(a => L.push(`Address: ${a}`));
                if (!addrs.length && rec.AAAA) rec.AAAA.forEach(a => L.push(`Address: ${a}`));
            }
            if (!auth) L.push('');
            return this._ok(L.join('\n').replace(/\n\n\n/g, '\n\n'));
        }
        return { stdout: head + `\n** server can't find ${name}: NXDOMAIN\n`, stderr: '', exitCode: 1 };
    }

    host(args) {
        const pos = args.filter(a => !a.startsWith('-'));
        const ti = args.indexOf('-t');
        const type = ti >= 0 ? (args[ti + 1] || 'A').toUpperCase() : null;
        const name = pos.filter(p => p !== (ti >= 0 ? args[ti + 1] : null))[0];
        if (!name) return this._err('Usage: host [-aCdlriTwv] [-N ndots] [-t type] [-W time]\n            [-R number] [-m flag] [-p port] hostname [server]\n       -a is equivalent to -v -t ANY\n       -A is like -a but omits RRSIG, NSEC, NSEC3\n       -c specifies query class for non-IN data\n       -C compares SOA records on authoritative nameservers\n       -d is equivalent to -v\n       -l lists all hosts in a domain, using AXFR\n       -m set memory debugging flag (trace|record|usage)\n       -N changes the number of dots allowed before root lookup is done\n       -p specifies the port on the server to query\n       -r disables recursive processing\n       -R specifies number of retries for UDP packets\n       -s a SERVFAIL response should stop query\n       -t specifies the query type\n       -T enables TCP/IP mode\n       -U enables UDP mode\n       -v enables verbose output\n       -V print version number and exit\n       -w specifies to wait forever for a reply\n       -W specifies how long to wait for a reply\n       -4 use IPv4 query transport only\n       -6 use IPv6 query transport only\n       -Z enables DNSSEC validation', 1);
        const st = this._dnsServerState();
        if (st.err) return { stdout: ';; connection timed out; no servers could be reached', stderr: '', exitCode: 1 };
        if (this._isV4(name)) {
            const p = this._ptrLookup(name);
            const arpa = name.split('.').reverse().join('.') + '.in-addr.arpa';
            if (!p) return { stdout: `Host ${arpa} not found: 3(NXDOMAIN)`, stderr: '', exitCode: 1 };
            return this._ok(`${arpa} domain name pointer ${p}`);
        }
        const rc = st.rc;
        const cands = [name]; if (!name.includes('.')) for (const s of rc.search) cands.push(`${name}.${s}`);
        for (const c of cands) {
            const rec = this._dnsLookup(c, 'ANY');
            if (!rec) continue;
            const L = [];
            const want = type || null;
            if (rec.CNAME && !want) L.push(`${c} is an alias for ${rec.CNAME}`);
            const nm = rec.CNAME ? rec.CNAME.replace(/\.$/, '') : c;
            if (!want || want === 'A') (rec.A || []).forEach(a => L.push(`${nm} has address ${a}`));
            if (!want || want === 'AAAA') (rec.AAAA || []).forEach(a => L.push(`${nm} has IPv6 address ${a}`));
            if (!want || want === 'MX') (rec.MX || []).forEach(m => L.push(`${c} mail is handled by ${m}`));
            if (want === 'NS') (rec.NS || []).forEach(m => L.push(`${c} name server ${m}`));
            if (want === 'TXT') (rec.TXT || []).forEach(m => L.push(`${c} descriptive text ${m}`));
            if (want === 'SOA' && rec.SOA) L.push(`${c} has SOA record ${rec.SOA}`);
            if (!L.length) L.push(`${c} has no ${want || 'A'} record`);
            return this._ok(L.join('\n'));
        }
        return { stdout: `Host ${name} not found: 3(NXDOMAIN)`, stderr: '', exitCode: 1 };
    }

    _getentHook(args, stdin) {
        const db = args[0];
        if (db !== 'hosts' && db !== 'ahosts' && db !== 'ahostsv4') return this._prevGetent(args, stdin);
        const keys = args.slice(1);
        const pad = (a) => a.padEnd(15);
        if (!keys.length) {
            const t = this._text('/etc/hosts') || '';
            const L = [];
            for (const raw of t.split('\n')) { const l = raw.replace(/#.*$/, '').trim(); if (!l) continue; const f = l.split(/\s+/); L.push(`${pad(f[0])} ${f.slice(1).join(' ')}`); }
            return this._ok(L.join('\n'));
        }
        const out = []; let code = 0;
        for (const k of keys) {
            if (this._isV4(k)) {
                const names = this._hostsReverse(k) || (this._ptrLookup(k) ? [this._ptrLookup(k).replace(/\.$/, '')] : null);
                if (!names) { code = 2; continue; }
                out.push(`${pad(k)} ${names.join(' ')}`);
            } else {
                const r = this._getaddr(k);
                if (r.err) { code = 2; continue; }
                const hits = r.source === 'files' ? this._hostsLookup(k) : null;
                if (hits && hits.length) out.push(`${pad(hits[0].ip)} ${hits[0].names.join(' ')}`);
                else out.push(`${pad(r.ip)} ${r.canon}`);
            }
        }
        return { stdout: out.join('\n'), stderr: '', exitCode: code };
    }
}

if (typeof window !== 'undefined') {
    window.NetEngine = NetEngine;
}
