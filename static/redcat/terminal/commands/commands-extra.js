// Extra / corrected commands
// Part of Red Cat RHCSA Terminal Simulator
//
// Loaded after every other command module, so the methods defined here win over
// older, simpler versions of the same command (their option parsing treated
// option arguments as operands, e.g. "useradd -u 1500 bob" created user "1500").

class ExtraCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.extra = this;
        this.xlvm = { pvs: {}, vgs: {}, lvs: {} };       // LVM state (see lvm helpers)
        this.xfsTypes = {};                              // device -> filesystem type (mkfs)
        this.xfw = null;                                 // firewalld state (lazily created)
        // Services that tasks and docs refer to but the base simulation did not define
        const extra = {
            'systemd-journald': [true, true, 'Journal Service'], kdump: [true, true, 'Crash recovery kernel arming'],
            crond: [true, true, 'Command Scheduler'], atd: [true, true, 'Deferred execution scheduler'],
            rsyslog: [true, true, 'System Logging Service'], NetworkManager: [true, true, 'Network Manager'],
            tuned: [true, true, 'Dynamic System Tuning Daemon'], autofs: [false, false, 'Automounts filesystems on demand'],
            'nfs-server': [false, false, 'NFS server and services'], auditd: [true, true, 'Security Auditing Service'],
            'systemd-timesyncd': [false, false, 'Network Time Synchronization']
        };
        for (const [n, [en, act, d]] of Object.entries(extra)) {
            if (this.shared.services && !this.shared.services[n]) this.shared.services[n] = { enabled: en, active: act, description: d };
        }
    }

    // ===== SMALL HELPERS =====

    _ok(stdout = '') {
        return { stdout, stderr: '', exitCode: 0 };
    }

    _err(stderr, exitCode = 1) {
        return { stdout: '', stderr, exitCode };
    }

    _uuid() {
        const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        return `${hex(8)}-${hex(4)}-4${hex(3)}-${'89ab'[Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`;
    }

    // Option parser: takesArg is a string of short options that take a value,
    // longTakesArg a list of long option names that take a value.
    _opts(args, takesArg = '', longTakesArg = []) {
        const o = {};
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '--') {
                rest.push(...args.slice(i + 1));
                break;
            }
            if (a.startsWith('--')) {
                const eq = a.indexOf('=');
                const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
                if (eq > 0) {
                    o[name] = a.slice(eq + 1);
                } else if (longTakesArg.includes(name) && i + 1 < args.length) {
                    o[name] = args[++i];
                } else {
                    o[name] = true;
                }
            } else if (a.startsWith('-') && a.length > 1 && !/^-\d/.test(a)) {
                for (let j = 1; j < a.length; j++) {
                    const c = a[j];
                    if (takesArg.includes(c)) {
                        const attached = a.slice(j + 1);
                        if (attached) {
                            o[c] = attached;
                        } else if (i + 1 < args.length) {
                            o[c] = args[++i];
                        } else {
                            o[c] = '';
                            o._missing = c;
                        }
                        break;
                    }
                    o[c] = true;
                }
            } else {
                rest.push(a);
            }
        }
        return { o, rest };
    }

    _today() {
        return new Date();
    }

    _fmtDate(d) {
        const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${m[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    }

    _isoDate(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    _isRoot() {
        return this.fs.currentUid === 0;
    }

    // ===== USER / GROUP DATABASE =====

    _groupByGid(gid) {
        for (const [name, g] of Object.entries(this.fs.groups)) {
            if (g.gid === gid) return name;
        }
        return null;
    }

    _findGroup(ref) {
        if (ref === undefined || ref === null || ref === '') return null;
        if (this.fs.groups[ref]) return ref;
        if (/^\d+$/.test(String(ref))) return this._groupByGid(parseInt(ref, 10));
        return null;
    }

    _nextId(used, start, end) {
        for (let id = start; id <= end; id++) {
            if (!used.has(id)) return id;
        }
        return end;
    }

    _usedUids() {
        return new Set(Object.values(this.fs.users).map(u => u.uid));
    }

    _usedGids() {
        return new Set(Object.values(this.fs.groups).map(g => g.gid));
    }

    _userGroups(username) {
        const u = this.fs.users[username];
        const list = [];
        const primary = this._groupByGid(u.gid);
        if (primary) list.push(primary);
        for (const [name, g] of Object.entries(this.fs.groups)) {
            if (name !== primary && g.members.includes(username)) list.push(name);
        }
        return list;
    }

    _aging(u) {
        if (!u.aging) {
            u.aging = { lastChange: Math.floor(Date.now() / 86400000), min: 0, max: 99999, warn: 7, inactive: -1, expire: null };
        }
        if (!u.pw) u.pw = u.locked ? 'locked' : 'set';
        return u.aging;
    }

    // Regenerate /etc/passwd, /etc/group and /etc/shadow from the in-memory database
    _syncAccountFiles() {
        const write = (path, content, perms) => {
            const node = this.fs.getNode(path);
            if (node && node.type === 'file') {
                node.content = content;
                node.size = content.length;
                node.modified = new Date();
            }
        };
        let passwd = '';
        let shadow = '';
        for (const [name, u] of Object.entries(this.fs.users)) {
            const gecos = u.gecos !== undefined ? u.gecos : (name === 'root' ? 'root' : name.charAt(0).toUpperCase() + name.slice(1));
            passwd += `${name}:x:${u.uid}:${u.gid}:${gecos}:${u.home}:${u.shell}\n`;
            const ag = this._aging(u);
            let hash = '!!';
            if (u.pw === 'set') hash = '$6$' + (u.salt || (u.salt = Math.random().toString(36).slice(2, 10))) + '$' + '.'.repeat(20);
            else if (u.pw === 'none') hash = '';
            else if (u.pw === 'locked') hash = '!!';
            if (u.locked && u.pw === 'set') hash = '!' + hash;
            const expire = ag.expire ? Math.floor(new Date(ag.expire).getTime() / 86400000) : '';
            shadow += `${name}:${hash}:${ag.lastChange}:${ag.min}:${ag.max}:${ag.warn}:${ag.inactive === -1 ? '' : ag.inactive}:${expire}:\n`;
        }
        let group = '';
        for (const [name, g] of Object.entries(this.fs.groups)) {
            // /etc/group lists only supplementary members (not users whose primary group it is)
            const supp = g.members.filter(m => !(this.fs.users[m] && this.fs.users[m].gid === g.gid));
            group += `${name}:x:${g.gid}:${supp.join(',')}\n`;
        }
        write('/etc/passwd', passwd);
        write('/etc/group', group);
        write('/etc/shadow', shadow);
    }

    _homeParent(home) {
        const parts = home.split('/').filter(Boolean);
        const base = parts.pop();
        return { parentPath: '/' + parts.join('/'), base };
    }

    _makeHome(username, u) {
        const { parentPath, base } = this._homeParent(u.home);
        const parent = this.fs.getNode(parentPath);
        if (!parent || parent.type !== 'directory' || !base) return;
        const group = this._groupByGid(u.gid) || username;
        parent.children[base] = {
            type: 'directory',
            permissions: '0700',
            owner: username,
            group,
            size: 4096,
            modified: new Date(),
            children: {}
        };
        for (const f of ['.bash_logout', '.bash_profile', '.bashrc']) {
            parent.children[base].children[f] = {
                type: 'file', permissions: '0644', owner: username, group, size: 0, modified: new Date(), content: ''
            };
        }
    }

    // ===== useradd / userdel / usermod =====

    useradd(args) {
        const { o, rest } = this._opts(args, 'ugGsdcepkKfDb', ['uid', 'gid', 'groups', 'shell', 'home-dir', 'comment', 'expiredate', 'password']);
        if (!this._isRoot()) return this._err('useradd: Permission denied.');
        if (o._missing) return this._err(`useradd: option requires an argument -- '${o._missing}'`);
        const username = rest[0];
        if (!username) return this._err('Usage: useradd [options] LOGIN');
        if (!/^[a-z_][a-z0-9_-]*\$?$/i.test(username)) return this._err(`useradd: invalid user name '${username}'`);
        if (this.fs.users[username]) return this._err(`useradd: user '${username}' already exists`);

        const system = !!o.r;
        const uidOpt = o.u !== undefined ? o.u : o.uid;
        let uid;
        if (uidOpt !== undefined && uidOpt !== true) {
            if (!/^\d+$/.test(String(uidOpt))) return this._err(`useradd: invalid user ID '${uidOpt}'`);
            uid = parseInt(uidOpt, 10);
            if (this._usedUids().has(uid) && !o.o) return this._err(`useradd: UID ${uid} is not unique`);
        } else {
            uid = system ? this._nextId(this._usedUids(), 201, 999) : this._nextId(this._usedUids(), 1000, 60000);
        }

        // Primary group
        let gid;
        let createGroup = false;
        const gOpt = o.g !== undefined ? o.g : o.gid;
        if (gOpt !== undefined && gOpt !== true) {
            const gname = this._findGroup(gOpt);
            if (!gname) return this._err(`useradd: group '${gOpt}' does not exist`);
            gid = this.fs.groups[gname].gid;
        } else if (o.N) {
            gid = this.fs.groups.users ? this.fs.groups.users.gid : 100;
        } else {
            createGroup = true;
            const used = this._usedGids();
            gid = (!used.has(uid)) ? uid : (system ? this._nextId(used, 201, 999) : this._nextId(used, 1000, 60000));
        }

        // Supplementary groups
        const suppOpt = o.G !== undefined ? o.G : o.groups;
        const supp = [];
        if (suppOpt !== undefined && suppOpt !== true && suppOpt !== '') {
            for (const ref of String(suppOpt).split(',')) {
                const gname = this._findGroup(ref);
                if (!gname) return this._err(`useradd: group '${ref}' does not exist`);
                supp.push(gname);
            }
        }

        const shell = o.s !== undefined ? o.s : (o.shell !== undefined ? o.shell : (system ? '/sbin/nologin' : '/bin/bash'));
        const homeOpt = o.d !== undefined ? o.d : o['home-dir'];
        const home = homeOpt && homeOpt !== true ? homeOpt : (system ? `/var/lib/${username}` : `/home/${username}`);
        const comment = o.c !== undefined ? o.c : (o.comment !== undefined ? o.comment : '');

        let expire = null;
        const eOpt = o.e !== undefined ? o.e : o.expiredate;
        if (eOpt !== undefined && eOpt !== true && eOpt !== '') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(eOpt) || isNaN(new Date(eOpt).getTime())) return this._err(`useradd: invalid date '${eOpt}'`);
            expire = eOpt;
        }

        if (createGroup) {
            this.fs.groups[username] = { gid, members: [] };
        }
        const user = {
            uid, gid, home, shell, password: 'x', gecos: comment,
            pw: 'locked',
            aging: { lastChange: Math.floor(Date.now() / 86400000), min: 0, max: 99999, warn: 7, inactive: -1, expire }
        };
        this.fs.users[username] = user;
        for (const g of supp) {
            if (!this.fs.groups[g].members.includes(username)) this.fs.groups[g].members.push(username);
        }
        // Primary group membership is implicit, but keep it listed for the permission checks
        const pg = this._groupByGid(gid);
        if (pg && !this.fs.groups[pg].members.includes(username)) this.fs.groups[pg].members.push(username);

        // RHEL default is CREATE_HOME=yes (system accounts: no)
        if ((o.m || (!o.M && !system)) && !o.M) {
            this._makeHome(username, user);
            if (this.shared.parent.seRestoreTree) this.shared.parent.seRestoreTree(user.home, { force: true });
        }

        this._syncAccountFiles();
        return this._ok();
    }

    userdel(args) {
        const { o, rest } = this._opts(args);
        if (!this._isRoot()) return this._err('userdel: Permission denied.');
        const username = rest[0];
        if (!username) return this._err('Usage: userdel [options] LOGIN');
        const u = this.fs.users[username];
        if (!u) return this._err(`userdel: user '${username}' does not exist`);
        if (username === this.fs.currentUser) return this._err(`userdel: user ${username} is currently used by process 1`);

        delete this.fs.users[username];
        for (const [gname, g] of Object.entries(this.fs.groups)) {
            g.members = g.members.filter(m => m !== username);
            // Remove the private group when it is no longer anyone's primary group
            if (gname === username && g.gid === u.gid && !Object.values(this.fs.users).some(x => x.gid === g.gid)) {
                delete this.fs.groups[gname];
            }
        }
        if (o.r) {
            const { parentPath, base } = this._homeParent(u.home);
            const parent = this.fs.getNode(parentPath);
            if (parent && parent.children && parent.children[base]) delete parent.children[base];
        }
        this._syncAccountFiles();
        return this._ok();
    }

    usermod(args) {
        const { o, rest } = this._opts(args, 'ugGsdcelp', ['uid', 'gid', 'groups', 'shell', 'home', 'comment', 'expiredate', 'login']);
        if (!this._isRoot()) return this._err('usermod: Permission denied.');
        if (o._missing) return this._err(`usermod: option requires an argument -- '${o._missing}'`);
        const username = rest[0];
        if (!username) return this._err('Usage: usermod [options] LOGIN');
        const u = this.fs.users[username];
        if (!u) return this._err(`usermod: user '${username}' does not exist`);
        this._aging(u);

        const gOpt = o.G !== undefined ? o.G : o.groups;
        if (gOpt !== undefined && gOpt !== true) {
            const names = String(gOpt).split(',').filter(Boolean);
            for (const ref of names) {
                if (!this._findGroup(ref)) return this._err(`usermod: group '${ref}' does not exist`);
            }
            const resolved = names.map(r => this._findGroup(r));
            if (!(o.a || o.append)) {
                // -G alone replaces the supplementary list
                for (const g of Object.values(this.fs.groups)) {
                    if (g.gid !== u.gid) g.members = g.members.filter(m => m !== username);
                }
            }
            for (const g of resolved) {
                if (!this.fs.groups[g].members.includes(username)) this.fs.groups[g].members.push(username);
            }
        } else if (o.a || o.append) {
            return this._err('usermod: option -a requires option -G');
        }

        const pgOpt = o.g !== undefined ? o.g : o.gid;
        if (pgOpt !== undefined && pgOpt !== true) {
            const gname = this._findGroup(pgOpt);
            if (!gname) return this._err(`usermod: group '${pgOpt}' does not exist`);
            u.gid = this.fs.groups[gname].gid;
            if (!this.fs.groups[gname].members.includes(username)) this.fs.groups[gname].members.push(username);
        }
        const uidOpt = o.u !== undefined ? o.u : o.uid;
        if (uidOpt !== undefined && uidOpt !== true) {
            if (!/^\d+$/.test(String(uidOpt))) return this._err(`usermod: invalid user ID '${uidOpt}'`);
            const nu = parseInt(uidOpt, 10);
            if (this._usedUids().has(nu) && nu !== u.uid && !o.o) return this._err(`usermod: UID '${nu}' already exists`);
            u.uid = nu;
        }
        const sOpt = o.s !== undefined ? o.s : o.shell;
        if (sOpt !== undefined && sOpt !== true) u.shell = sOpt;
        const cOpt = o.c !== undefined ? o.c : o.comment;
        if (cOpt !== undefined && cOpt !== true) u.gecos = cOpt;
        const eOpt = o.e !== undefined ? o.e : o.expiredate;
        if (eOpt !== undefined && eOpt !== true) {
            if (eOpt === '' || eOpt === '-1') u.aging.expire = null;
            else if (/^\d{4}-\d{2}-\d{2}$/.test(eOpt) && !isNaN(new Date(eOpt).getTime())) u.aging.expire = eOpt;
            else return this._err(`usermod: invalid date '${eOpt}'`);
        }
        const dOpt = o.d !== undefined ? o.d : o.home;
        if (dOpt !== undefined && dOpt !== true) {
            const old = u.home;
            u.home = dOpt;
            if (o.m) {
                const a = this._homeParent(old);
                const b = this._homeParent(dOpt);
                const pa = this.fs.getNode(a.parentPath);
                const pb = this.fs.getNode(b.parentPath);
                if (pa && pb && pa.children[a.base]) {
                    pb.children[b.base] = pa.children[a.base];
                    delete pa.children[a.base];
                }
            }
        }
        if (o.L || o.lock) {
            u.locked = true;
        }
        if (o.U || o.unlock) {
            u.locked = false;
        }
        const lOpt = o.l !== undefined ? o.l : o.login;
        if (lOpt !== undefined && lOpt !== true) {
            if (this.fs.users[lOpt]) return this._err(`usermod: user '${lOpt}' already exists`);
            this.fs.users[lOpt] = u;
            delete this.fs.users[username];
            for (const g of Object.values(this.fs.groups)) {
                g.members = g.members.map(m => (m === username ? lOpt : m));
            }
        }
        this._syncAccountFiles();
        return this._ok();
    }

    // ===== groupadd / groupdel / groupmod / gpasswd =====

    groupadd(args) {
        const { o, rest } = this._opts(args, 'g', ['gid']);
        if (!this._isRoot()) return this._err('groupadd: Permission denied.');
        if (o._missing) return this._err(`groupadd: option requires an argument -- '${o._missing}'`);
        const name = rest[0];
        if (!name) return this._err('Usage: groupadd [options] GROUP');
        if (this.fs.groups[name]) {
            return o.f ? this._ok() : this._err(`groupadd: group '${name}' already exists`);
        }
        const gOpt = o.g !== undefined ? o.g : o.gid;
        let gid;
        if (gOpt !== undefined && gOpt !== true) {
            if (!/^\d+$/.test(String(gOpt))) return this._err(`groupadd: invalid group ID '${gOpt}'`);
            gid = parseInt(gOpt, 10);
            if (this._usedGids().has(gid) && !o.o) return this._err(`groupadd: GID '${gid}' already exists`);
        } else {
            gid = o.r ? this._nextId(this._usedGids(), 201, 999) : this._nextId(this._usedGids(), 1000, 60000);
        }
        this.fs.groups[name] = { gid, members: [] };
        this._syncAccountFiles();
        return this._ok();
    }

    groupdel(args) {
        if (!this._isRoot()) return this._err('groupdel: Permission denied.');
        const name = args[0];
        if (!name) return this._err('Usage: groupdel [options] GROUP');
        const g = this.fs.groups[name];
        if (!g) return this._err(`groupdel: group '${name}' does not exist`);
        const owner = Object.entries(this.fs.users).find(([, u]) => u.gid === g.gid);
        if (owner) return this._err(`groupdel: cannot remove the primary group of user '${owner[0]}'`);
        delete this.fs.groups[name];
        this._syncAccountFiles();
        return this._ok();
    }

    groupmod(args) {
        const { o, rest } = this._opts(args, 'gn', ['gid', 'new-name']);
        if (!this._isRoot()) return this._err('groupmod: Permission denied.');
        const name = rest[0];
        if (!name) return this._err('Usage: groupmod [options] GROUP');
        const g = this.fs.groups[name];
        if (!g) return this._err(`groupmod: group '${name}' does not exist`);
        const gOpt = o.g !== undefined ? o.g : o.gid;
        if (gOpt !== undefined && gOpt !== true) {
            if (!/^\d+$/.test(String(gOpt))) return this._err(`groupmod: invalid group ID '${gOpt}'`);
            const ng = parseInt(gOpt, 10);
            if (this._usedGids().has(ng) && ng !== g.gid && !o.o) return this._err(`groupmod: GID '${ng}' already exists`);
            for (const u of Object.values(this.fs.users)) if (u.gid === g.gid) u.gid = ng;
            g.gid = ng;
        }
        const nOpt = o.n !== undefined ? o.n : o['new-name'];
        if (nOpt !== undefined && nOpt !== true) {
            if (this.fs.groups[nOpt]) return this._err(`groupmod: group '${nOpt}' already exists`);
            this.fs.groups[nOpt] = g;
            delete this.fs.groups[name];
        }
        this._syncAccountFiles();
        return this._ok();
    }

    gpasswd(args) {
        const { o, rest } = this._opts(args, 'adMA');
        if (!this._isRoot()) return this._err('gpasswd: Permission denied.');
        const group = rest[rest.length - 1];
        if (!group) return this._err('Usage: gpasswd [option] GROUP');
        const g = this.fs.groups[group];
        if (!g) return this._err(`gpasswd: group '${group}' does not exist`);
        if (o.a !== undefined && o.a !== true) {
            if (!this.fs.users[o.a]) return this._err(`gpasswd: user '${o.a}' does not exist`);
            if (!g.members.includes(o.a)) g.members.push(o.a);
            this._syncAccountFiles();
            return this._ok(`Adding user ${o.a} to group ${group}`);
        }
        if (o.d !== undefined && o.d !== true) {
            if (!this.fs.users[o.d]) return this._err(`gpasswd: user '${o.d}' does not exist`);
            if (!g.members.includes(o.d)) return this._err(`gpasswd: user '${o.d}' is not a member of '${group}'`);
            g.members = g.members.filter(m => m !== o.d);
            this._syncAccountFiles();
            return this._ok(`Removing user ${o.d} from group ${group}`);
        }
        if (o.M !== undefined && o.M !== true) {
            g.members = String(o.M).split(',').filter(n => this.fs.users[n]);
            this._syncAccountFiles();
            return this._ok();
        }
        return this._ok();
    }

    // ===== id / groups / getent =====

    id(args) {
        const { o, rest } = this._opts(args);
        const username = rest[0] || this.fs.currentUser;
        const u = this.fs.users[username];
        if (!u) return this._err(`id: '${username}': no such user`);
        const pgName = this._groupByGid(u.gid) || String(u.gid);
        const names = this._userGroups(username);
        const gids = names.map(n => this.fs.groups[n].gid);
        const useName = !!o.n;
        if (o.Z) return this._ok(username === 'root' || username === this.fs.currentUser ? 'unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023' : `id: cannot print security context when user specified`);
        if (o.u) return this._ok(useName ? username : String(u.uid));
        if (o.g) return this._ok(useName ? pgName : String(u.gid));
        if (o.G) return this._ok(useName ? names.join(' ') : gids.join(' '));
        const groups = names.map(n => `${this.fs.groups[n].gid}(${n})`).join(',');
        let out = `uid=${u.uid}(${username}) gid=${u.gid}(${pgName}) groups=${groups || `${u.gid}(${pgName})`}`;
        if (username === 'root') out += ' context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023';
        return this._ok(out);
    }

    groups(args) {
        if (args.length === 0) {
            return this._ok(this._userGroups(this.fs.currentUser).join(' '));
        }
        const lines = [];
        for (const username of args) {
            if (!this.fs.users[username]) return this._err(`groups: '${username}': no such user`);
            lines.push(`${username} : ${this._userGroups(username).join(' ')}`);
        }
        return this._ok(lines.join('\n'));
    }

    getent(args) {
        const db = args[0];
        const keys = args.slice(1);
        if (!db) return this._err('Usage: getent [OPTION...] database [key ...]');
        const passwdLine = (n) => {
            const u = this.fs.users[n];
            const gecos = u.gecos !== undefined ? u.gecos : (n === 'root' ? 'root' : n.charAt(0).toUpperCase() + n.slice(1));
            return `${n}:x:${u.uid}:${u.gid}:${gecos}:${u.home}:${u.shell}`;
        };
        const groupLine = (n) => {
            const g = this.fs.groups[n];
            const supp = g.members.filter(m => !(this.fs.users[m] && this.fs.users[m].gid === g.gid));
            return `${n}:x:${g.gid}:${supp.join(',')}`;
        };
        let lines = [];
        if (db === 'passwd') {
            const all = Object.keys(this.fs.users);
            if (keys.length === 0) lines = all.map(passwdLine);
            else {
                for (const k of keys) {
                    const n = all.find(x => x === k || String(this.fs.users[x].uid) === k);
                    if (!n) return { stdout: lines.join('\n'), stderr: '', exitCode: 2 };
                    lines.push(passwdLine(n));
                }
            }
        } else if (db === 'group') {
            const all = Object.keys(this.fs.groups);
            if (keys.length === 0) lines = all.map(groupLine);
            else {
                for (const k of keys) {
                    const n = all.find(x => x === k || String(this.fs.groups[x].gid) === k);
                    if (!n) return { stdout: lines.join('\n'), stderr: '', exitCode: 2 };
                    lines.push(groupLine(n));
                }
            }
        } else if (db === 'shadow') {
            if (!this._isRoot()) return this._err('', 2);
            const node = this.fs.getNode('/etc/shadow');
            const all = (node.content || '').split('\n').filter(Boolean);
            lines = keys.length ? all.filter(l => keys.includes(l.split(':')[0])) : all;
            if (keys.length && lines.length === 0) return this._err('', 2);
        } else if (db === 'hosts') {
            const node = this.fs.getNode('/etc/hosts');
            const all = (node.content || '').split('\n').filter(l => l.trim() && !l.startsWith('#'));
            const hit = all.filter(l => keys.length === 0 || l.split(/\s+/).slice(1).some(h => keys.includes(h)) || keys.includes(l.split(/\s+/)[0]));
            if (keys.length && hit.length === 0) return this._err('', 2);
            lines = hit.map(l => l.split(/\s+/)[0].padEnd(15) + ' ' + l.split(/\s+/).slice(1).join(' '));
        } else {
            return this._err(`Unknown database: ${db}`);
        }
        return this._ok(lines.join('\n'));
    }

    // ===== passwd / chage =====

    passwd(args, stdin = '') {
        const { o, rest } = this._opts(args, 'nxwi');
        const username = rest[0] || this.fs.currentUser;
        const u = this.fs.users[username];
        if (!u) return this._err(`passwd: user '${username}' does not exist`);
        const self = username === this.fs.currentUser;
        if (!self && !this._isRoot()) return this._err('passwd: You may not view or modify password information for ' + username + '.');
        const ag = this._aging(u);

        if (o.S) {
            let code = 'PS';
            let msg = 'Password set, SHA512 crypt.';
            if (u.pw === 'none') { code = 'NP'; msg = 'Empty password.'; }
            else if (u.pw === 'locked' || u.locked) { code = 'LK'; msg = 'Password locked.'; }
            return this._ok(`${username} ${code} ${this._isoDate(new Date(ag.lastChange * 86400000))} ${ag.min} ${ag.max} ${ag.warn} ${ag.inactive} (${msg})`);
        }
        if (!this._isRoot() && (o.l || o.u || o.d || o.e || o.n || o.x || o.w || o.i)) {
            return this._err('passwd: Permission denied.');
        }
        if (o.l) { u.locked = true; this._syncAccountFiles(); return this._ok(`Locking password for user ${username}.\npasswd: Success`); }
        if (o.u) { u.locked = false; this._syncAccountFiles(); return this._ok(`Unlocking password for user ${username}.\npasswd: Success`); }
        if (o.d) { u.pw = 'none'; this._syncAccountFiles(); return this._ok(`Removing password for user ${username}.\npasswd: Success`); }
        if (o.e) { ag.lastChange = 0; this._syncAccountFiles(); return this._ok(`Expiring password for user ${username}.\npasswd: Success`); }
        if (o.n !== undefined || o.x !== undefined || o.w !== undefined || o.i !== undefined) {
            if (o.n !== undefined && o.n !== true) ag.min = parseInt(o.n, 10);
            if (o.x !== undefined && o.x !== true) ag.max = parseInt(o.x, 10);
            if (o.w !== undefined && o.w !== true) ag.warn = parseInt(o.w, 10);
            if (o.i !== undefined && o.i !== true) ag.inactive = parseInt(o.i, 10);
            this._syncAccountFiles();
            return this._ok(`Adjusting aging data for user ${username}.\npasswd: Success`);
        }
        if (o.stdin) {
            const pw = String(stdin || '').split('\n')[0];
            if (!pw) return this._err('passwd: Authentication token manipulation error');
            u.pw = 'set';
            u.locked = false;
            ag.lastChange = Math.floor(Date.now() / 86400000);
            this._syncAccountFiles();
            return this._ok(`Changing password for user ${username}.\npasswd: all authentication tokens updated successfully.`);
        }
        u.pw = 'set';
        ag.lastChange = Math.floor(Date.now() / 86400000);
        this._syncAccountFiles();
        return this._ok(`Changing password for user ${username}.\nNew password: \nRetype new password: \npasswd: all authentication tokens updated successfully.`);
    }

    chage(args) {
        const { o, rest } = this._opts(args, 'mMWIEd', ['lastday', 'mindays', 'maxdays', 'warndays', 'inactive', 'expiredate']);
        const username = rest[0] || (o.l ? this.fs.currentUser : null);
        if (!username) return this._err('Usage: chage [options] LOGIN');
        const u = this.fs.users[username];
        if (!u) return this._err(`chage: user '${username}' does not exist`);
        if (!this._isRoot() && !(o.l && username === this.fs.currentUser)) return this._err('chage: Permission denied.');
        const ag = this._aging(u);

        if (o.l) {
            const today = Math.floor(Date.now() / 86400000);
            const dayStr = (d) => this._fmtDate(new Date(d * 86400000));
            const last = ag.lastChange === 0 ? 'password must be changed' : dayStr(ag.lastChange);
            let expires = 'never';
            let inactive = 'never';
            if (ag.max !== 99999 && ag.max !== -1) {
                expires = ag.lastChange === 0 ? 'password must be changed' : dayStr(ag.lastChange + ag.max);
                if (ag.inactive !== -1 && ag.lastChange !== 0) inactive = dayStr(ag.lastChange + ag.max + ag.inactive);
            }
            const acct = ag.expire ? this._fmtDate(new Date(ag.expire + 'T00:00:00')) : 'never';
            void today;
            return this._ok([
                `Last password change\t\t\t\t\t: ${last}`,
                `Password expires\t\t\t\t\t: ${expires}`,
                `Password inactive\t\t\t\t\t: ${inactive}`,
                `Account expires\t\t\t\t\t\t: ${acct}`,
                `Minimum number of days between password change\t\t: ${ag.min}`,
                `Maximum number of days between password change\t\t: ${ag.max}`,
                `Number of days of warning before password expires\t: ${ag.warn}`
            ].join('\n'));
        }

        const num = (v, flag) => {
            if (!/^-?\d+$/.test(String(v))) return null;
            return parseInt(v, 10);
        };
        let changed = false;
        const pick = (short, long) => (o[short] !== undefined ? o[short] : o[long]);
        const m = pick('m', 'mindays'), M = pick('M', 'maxdays'), W = pick('W', 'warndays'), I = pick('I', 'inactive');
        const E = pick('E', 'expiredate'), d = pick('d', 'lastday');
        for (const [val, key, flag] of [[m, 'min', 'm'], [M, 'max', 'M'], [W, 'warn', 'W'], [I, 'inactive', 'I']]) {
            if (val !== undefined && val !== true) {
                const n = num(val);
                if (n === null) return this._err(`chage: invalid numeric argument '${val}'`);
                ag[key] = n;
                changed = true;
            }
        }
        if (E !== undefined && E !== true) {
            if (E === '-1') ag.expire = null;
            else if (/^\d{4}-\d{2}-\d{2}$/.test(E) && !isNaN(new Date(E).getTime())) ag.expire = E;
            else if (/^\d+$/.test(E)) ag.expire = this._isoDate(new Date(parseInt(E, 10) * 86400000));
            else return this._err(`chage: invalid date '${E}'`);
            changed = true;
        }
        if (d !== undefined && d !== true) {
            if (/^\d+$/.test(d)) ag.lastChange = parseInt(d, 10) === 0 ? 0 : parseInt(d, 10);
            else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) ag.lastChange = Math.floor(new Date(d).getTime() / 86400000);
            else return this._err(`chage: invalid date '${d}'`);
            changed = true;
        }
        if (!changed) return this._err('Usage: chage [options] LOGIN');
        this._syncAccountFiles();
        return this._ok();
    }

    visudo(args) {
        if (!this._isRoot()) return this._err('visudo: Permission denied');
        if (args.includes('-c')) return this._ok('/etc/sudoers: parsed OK');
        return this._err('visudo: the simulator cannot open an interactive editor; use "vi /etc/sudoers" instead');
    }

    // ===== ls / mkdir (replace the simplified versions) =====

    _primaryGroupName(username) {
        const u = this.fs.users[username];
        return (u && this._groupByGid(u.gid)) || username;
    }

    _inode(node) {
        if (!node._ino) node._ino = 1000 + Math.floor(Math.random() * 900000);
        return node._ino;
    }

    ls(args) {
        const { o, rest } = this._opts(args);
        const parent = this.shared.parent;
        const long = !!(o.l || o.o && false);
        const all = !!o.a;
        const almost = !!o.A;
        const showHidden = all || almost;
        const classify = !!o.F;
        const paths = rest.length ? rest : ['.'];
        const out = [];
        const errors = [];

        const decorate = (name, node) => {
            let n = name;
            if (node.type === 'directory') n = `<span class="file-directory">${name}</span>${classify ? '/' : ''}`;
            else if (node.type === 'symlink') n = `<span class="file-symlink">${name}</span>${classify ? '@' : ''}`;
            else if (classify && node.permissions && /[1357]/.test(node.permissions.slice(-3))) n = `${name}*`;
            return n;
        };
        const plainName = (name, node) => (node.type === 'directory' ? `<span class="file-directory">${name}</span>` : name);

        const entryLine = (name, node, shown, fullPath) => {
            if (o.Z && parent.seLabel && fullPath) node = Object.assign({}, node, { selinux: parent.seLabel(fullPath, node) });
            if (long) {
                let line = parent.formatLongListing(shown === undefined ? name : shown, node, !!o.Z);
                if (o.i) line = `${String(this._inode(node)).padStart(8)} ${line}`;
                if (o.h && node.size !== undefined && node.type !== 'directory') {
                    const s = node.size;
                    const hs = s >= 1073741824 ? (s / 1073741824).toFixed(1) + 'G' : s >= 1048576 ? (s / 1048576).toFixed(1) + 'M' : s >= 1024 ? (s / 1024).toFixed(1) + 'K' : String(s);
                    line = line.replace(String(s).padStart(8), hs.padStart(8));
                }
                return line;
            }
            let txt = decorate(shown === undefined ? name : shown, node);
            if (o.Z) {
                const c = node.selinux || { user: 'unconfined_u', role: 'object_r', type: 'user_home_t', level: 's0' };
                txt = `${c.user}:${c.role}:${c.type}:${c.level} ${txt}`;
            }
            if (o.i) txt = `${this._inode(node)} ${txt}`;
            return txt;
        };

        const sortNames = (names) => {
            let list = names.slice().sort((a, b) => a.replace(/^\./, '').toLowerCase().localeCompare(b.replace(/^\./, '').toLowerCase()));
            if (o.r) list.reverse();
            return list;
        };

        const listDir = (path, node, header) => {
            if (!this.fs.hasPermission(node, 'r')) {
                errors.push(`ls: cannot open directory '${path}': Permission denied`);
                return;
            }
            if (header) out.push(`${path}:`);
            const names = sortNames(Object.keys(node.children || {}).filter(n => showHidden || !n.startsWith('.')));
            const lines = [];
            if (all) {
                lines.push(entryLine('.', node, undefined, path));
                lines.push(entryLine('..', node, undefined, this.fs.getParentPath(path)));
            }
            for (const n of names) lines.push(entryLine(n, node.children[n], undefined, path.replace(/\/$/, '') + '/' + n));
            if (long) {
                const blocks = names.reduce((s, n) => s + Math.ceil((node.children[n].size || 0) / 4096) * 4, 0);
                out.push(`total ${blocks}`);
                out.push(...lines);
            } else if (o['1'] || o.Z || o.i || this.shared.parent._stdoutIsPipe) {
                out.push(...lines);
            } else if (lines.length) {
                out.push(lines.join('  '));
            }
            if (o.R) {
                for (const n of names) {
                    const child = node.children[n];
                    if (child.type === 'directory') {
                        out.push('');
                        listDir(path.replace(/\/$/, '') + '/' + n, child, true);
                    }
                }
            }
        };

        const files = [];
        const dirs = [];
        for (const p of paths) {
            const node = this.fs.getNode(p);
            if (!node) {
                errors.push(`ls: cannot access '${p}': No such file or directory`);
                continue;
            }
            if (node.type === 'directory' && !o.d) dirs.push([p, node]);
            else files.push([p, node]);
        }
        for (const [p, node] of files) out.push(entryLine(p, node, p, p));
        const multi = paths.length > 1 || o.R;
        dirs.forEach(([p, node], idx) => {
            if (files.length || idx > 0) out.push('');
            listDir(p, node, multi);
        });

        return {
            stdout: out.join('\n'),
            stderr: errors.join('\n'),
            exitCode: errors.length ? 2 : 0
        };
    }

    mkdir(args) {
        const { o, rest } = this._opts(args, 'm', ['mode']);
        if (rest.length === 0) return this._err("mkdir: missing operand\nTry 'mkdir --help' for more information.");
        const mode = o.m !== undefined ? o.m : o.mode;
        const perms = mode && /^[0-7]{3,4}$/.test(mode) ? '0' + mode.slice(-3) : '0755';
        const group = this._primaryGroupName(this.fs.currentUser);
        const errors = [];
        const verbose = [];

        for (const path of rest) {
            const resolved = this.fs.resolvePath(path);
            const parts = resolved.split('/').filter(Boolean);
            let cur = this.fs.fs['/'];
            let walked = '';
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                walked += '/' + part;
                const last = i === parts.length - 1;
                const existing = cur.children && cur.children[part];
                if (existing) {
                    if (last && !o.p) {
                        errors.push(`mkdir: cannot create directory '${path}': File exists`);
                        break;
                    }
                    if (existing.type !== 'directory' && !last) {
                        errors.push(`mkdir: cannot create directory '${path}': Not a directory`);
                        break;
                    }
                    if (existing.type !== 'directory' && last) {
                        errors.push(`mkdir: cannot create directory '${path}': File exists`);
                        break;
                    }
                    cur = existing;
                    continue;
                }
                if (!last && !o.p) {
                    errors.push(`mkdir: cannot create directory '${path}': No such file or directory`);
                    break;
                }
                if (!this.fs.hasPermission(cur, 'w')) {
                    errors.push(`mkdir: cannot create directory '${path}': Permission denied`);
                    break;
                }
                cur.children[part] = {
                    type: 'directory',
                    permissions: last ? perms : '0755',
                    owner: this.fs.currentUser,
                    group,
                    size: 4096,
                    modified: new Date(),
                    children: {}
                };
                verbose.push(`mkdir: created directory '${walked}'`);
                cur = cur.children[part];
            }
        }
        return {
            stdout: o.v ? verbose.join('\n') : '',
            stderr: errors.join('\n'),
            exitCode: errors.length ? 1 : 0
        };
    }

    // Block devices are virtual: accept any plausible /dev name, plus real nodes and logical volumes
    _devSizeMiB(dev) {
        return this.shared.storage ? (this.shared.storage.sizeMiB(dev) || 5120) : 5120;
    }

    _deviceExists(dev) {
        if (this.shared.storage) return this.shared.storage.deviceExists(dev);
        if (this.fs.getNode(dev)) return true;
        if (/^\/dev\/(sd|vd|xvd|hd)[a-z]+\d*$/.test(dev)) return true;
        if (/^\/dev\/nvme\d+n\d+(p\d+)?$/.test(dev)) return true;
        return false;
    }

    // ===== chmod / chown / chgrp =====

    _walk(path, node, recursive, fn) {
        fn(path, node);
        if (recursive && node.type === 'directory') {
            for (const [name, child] of Object.entries(node.children || {})) {
                this._walk(path.replace(/\/$/, '') + '/' + name, child, true, fn);
            }
        }
    }

    // Apply a symbolic or octal mode to a 4 digit permission string ("0755")
    _applyMode(current, mode, isDir) {
        if (/^[0-7]{1,4}$/.test(mode)) {
            return mode.padStart(4, '0');
        }
        let [sp, u, g, o] = current.padStart(4, '0').split('').map(Number);
        const clauses = mode.split(',');
        for (const clause of clauses) {
            const m = /^([ugoa]*)([-+=])([rwxXst]*)$/.exec(clause);
            if (!m) return null;
            const who = m[1] === '' ? 'a' : m[1];
            const targets = new Set();
            for (const w of who) {
                if (w === 'a') ['u', 'g', 'o'].forEach(t => targets.add(t));
                else targets.add(w);
            }
            let bits = 0;
            let spBits = 0;
            for (const c of m[3]) {
                if (c === 'r') bits |= 4;
                else if (c === 'w') bits |= 2;
                else if (c === 'x') bits |= 1;
                else if (c === 'X') { if (isDir || ((u | g | o) & 1)) bits |= 1; }
                else if (c === 's') { if (targets.has('u')) spBits |= 4; if (targets.has('g')) spBits |= 2; }
                else if (c === 't') spBits |= 1;
            }
            const apply = (cur, who2) => {
                if (m[2] === '+') return cur | bits;
                if (m[2] === '-') return cur & ~bits & 7;
                return bits;
            };
            if (targets.has('u')) u = apply(u);
            if (targets.has('g')) g = apply(g);
            if (targets.has('o')) o = apply(o);
            if (m[2] === '+') sp |= spBits;
            else if (m[2] === '-') sp &= ~spBits & 7;
            else if (m[2] === '=') {
                // "=" resets the special bits belonging to the named classes
                if (targets.has('u')) sp &= ~4;
                if (targets.has('g')) sp &= ~2;
                if (targets.has('o')) sp &= ~1;
                sp |= spBits;
            }
        }
        return '' + sp + u + g + o;
    }

    chmod(args) {
        // Symbolic modes such as "-w" or "u-x" look like options, so only R/v/c/f/V clusters count as flags
        const isFlag = (x) => /^-[RvcfV]+$/.test(x);
        const operands = args.filter(x => !isFlag(x));
        if (operands.length === 0) return this._err("chmod: missing operand\nTry 'chmod --help' for more information.");
        if (operands.length === 1) return this._err(`chmod: missing operand after '${operands[0]}'\nTry 'chmod --help' for more information.`);
        const modeIdx = args.findIndex(x => !isFlag(x));
        const flags = args.filter(a => /^-[RvcfV]+$/.test(a)).join('');
        const recursive = flags.includes('R');
        const verbose = flags.includes('v');
        const mode = args[modeIdx];
        const files = args.filter((a, i) => i !== modeIdx && !/^-[RvcfV]+$/.test(a));
        if (!/^([0-7]{1,4}|[ugoa]*[-+=][rwxXst]*(,[ugoa]*[-+=][rwxXst]*)*)$/.test(mode)) {
            return this._err(`chmod: invalid mode: '${mode}'\nTry 'chmod --help' for more information.`);
        }
        const out = [];
        const errors = [];
        for (const path of files) {
            const node = this.fs.getNode(path);
            if (!node) {
                errors.push(`chmod: cannot access '${path}': No such file or directory`);
                continue;
            }
            if (this.fs.currentUid !== 0 && node.owner !== this.fs.currentUser) {
                errors.push(`chmod: changing permissions of '${path}': Operation not permitted`);
                continue;
            }
            this._walk(path, node, recursive, (p, n) => {
                const before = n.permissions;
                const next = this._applyMode(n.permissions, mode, n.type === 'directory');
                n.permissions = next;
                if (verbose) out.push(`mode of '${p}' changed from ${before.slice(-4)} to ${next}`);
            });
        }
        return { stdout: out.join('\n'), stderr: errors.join('\n'), exitCode: errors.length ? 1 : 0 };
    }

    _chown(cmd, spec, files, recursive, groupOnly) {
        if (this.fs.currentUid !== 0) return this._err(`${cmd}: changing ownership: Operation not permitted`);
        let owner = null;
        let group = null;
        if (groupOnly) {
            group = spec;
        } else if (spec.includes(':') || spec.includes('.')) {
            const sep = spec.includes(':') ? ':' : '.';
            const [ow, gr] = spec.split(sep);
            owner = ow || null;
            group = gr === undefined ? null : gr;
            if (gr === '' && ow) group = this._primaryGroupName(ow);
        } else {
            owner = spec;
        }
        if (owner !== null) {
            if (/^\d+$/.test(owner)) {
                const found = Object.keys(this.fs.users).find(n => this.fs.users[n].uid === parseInt(owner, 10));
                if (!found) return this._err(`${cmd}: invalid user: '${spec}'`);
                owner = found;
            } else if (!this.fs.users[owner]) {
                return this._err(`${cmd}: invalid user: '${spec}'`);
            }
        }
        if (group !== null) {
            const gname = this._findGroup(group);
            if (!gname) return this._err(`${cmd}: invalid group: '${spec}'`);
            group = gname;
        }
        const errors = [];
        for (const path of files) {
            const node = this.fs.getNode(path);
            if (!node) {
                errors.push(`${cmd}: cannot access '${path}': No such file or directory`);
                continue;
            }
            this._walk(path, node, recursive, (p, n) => {
                if (owner !== null) n.owner = owner;
                if (group !== null) n.group = group;
            });
        }
        return { stdout: '', stderr: errors.join('\n'), exitCode: errors.length ? 1 : 0 };
    }

    chown(args) {
        const flags = args.filter(a => /^-[RvhfHLP]+$/.test(a)).join('');
        const rest = args.filter(a => !/^-[RvhfHLP]+$/.test(a));
        if (rest.length === 0) return this._err("chown: missing operand\nTry 'chown --help' for more information.");
        if (rest.length === 1) return this._err(`chown: missing operand after '${rest[0]}'\nTry 'chown --help' for more information.`);
        return this._chown('chown', rest[0], rest.slice(1), flags.includes('R'), false);
    }

    chgrp(args) {
        const flags = args.filter(a => /^-[RvhfHLP]+$/.test(a)).join('');
        const rest = args.filter(a => !/^-[RvhfHLP]+$/.test(a));
        if (rest.length === 0) return this._err("chgrp: missing operand\nTry 'chgrp --help' for more information.");
        if (rest.length === 1) return this._err(`chgrp: missing operand after '${rest[0]}'\nTry 'chgrp --help' for more information.`);
        return this._chown('chgrp', rest[0], rest.slice(1), flags.includes('R'), true);
    }

    // ===== head / tail =====

    // Accepts -n N, -nN and the legacy -N form (head -5 file)
    _lineCount(args) {
        let count = 10;
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' && i + 1 < args.length) { count = parseInt(args[++i], 10); }
            else if (/^-n\d+$/.test(a)) { count = parseInt(a.slice(2), 10); }
            else if (/^-\d+$/.test(a)) { count = parseInt(a.slice(1), 10); }
            else if (a === '-f' || a === '-F' || a === '-q' || a === '-v') { /* ignored */ }
            else if (a.startsWith('--lines=')) { count = parseInt(a.slice(8), 10); }
            else rest.push(a);
        }
        return { count: isNaN(count) ? 10 : count, rest };
    }

    _headTail(cmd, args, stdin) {
        const { count, rest } = this._lineCount(args);
        const take = (text) => {
            const lines = text.split('\n');
            if (lines.length && lines[lines.length - 1] === '') lines.pop();
            return (cmd === 'head' ? lines.slice(0, count) : lines.slice(Math.max(0, lines.length - count))).join('\n');
        };
        if (rest.length === 0) {
            if (!stdin && !this.shared.parent._hasStdin) return this._err(`${cmd}: missing file operand`);
            return this._ok(take(stdin || ''));
        }
        const out = [];
        const errors = [];
        for (const path of rest) {
            const node = this.fs.getNode(path);
            if (!node) { errors.push(`${cmd}: cannot open '${path}' for reading: No such file or directory`); continue; }
            if (node.type !== 'file') { errors.push(`${cmd}: error reading '${path}': Is a directory`); continue; }
            if (!this.fs.hasPermission(node, 'r')) { errors.push(`${cmd}: cannot open '${path}' for reading: Permission denied`); continue; }
            const body = take(node.content || '');
            out.push(rest.length > 1 ? `==> ${path} <==\n${body}` : body);
        }
        return { stdout: out.join('\n\n'), stderr: errors.join('\n'), exitCode: errors.length ? 1 : 0 };
    }

    head(args, stdin = '') {
        return this._headTail('head', args, stdin);
    }

    tail(args, stdin = '') {
        return this._headTail('tail', args, stdin);
    }

    // ===== getfacl / setfacl =====

    _aclPermString(n) {
        return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    }

    _parseAclPerm(text) {
        if (/^[0-7]$/.test(text)) return parseInt(text, 10);
        if (/^[rwx-]{1,3}$/.test(text)) {
            let n = 0;
            if (text.includes('r')) n |= 4;
            if (text.includes('w')) n |= 2;
            if (text.includes('x')) n |= 1;
            return n;
        }
        return null;
    }

    _aclFor(node) {
        if (!node.acl || Array.isArray(node.acl)) {
            node.acl = { users: {}, groups: {}, mask: null, def: null };
        }
        return node.acl;
    }

    _aclHasEntries(node) {
        const a = node.acl;
        if (!a || Array.isArray(a)) return false;
        return Object.keys(a.users).length > 0 || Object.keys(a.groups).length > 0 || a.mask !== null || a.def !== null;
    }

    _aclMask(node) {
        const a = node.acl;
        if (a.mask !== null) return a.mask;
        let m = parseInt(node.permissions.slice(-2, -1), 10);
        for (const v of Object.values(a.users)) m |= v;
        for (const v of Object.values(a.groups)) m |= v;
        return m;
    }

    getfacl(args) {
        const { o, rest } = this._opts(args);
        if (rest.length === 0) return this._err('Usage: getfacl [-aceEsRLPtpndvh] file ...');
        const blocks = [];
        const errors = [];
        let stripped = false;
        const perms = (p) => this._aclPermString(p);
        const render = (shown, node) => {
            const mode = node.permissions.slice(-3);
            const [ur, grMode, or] = mode.split('').map(Number);
            const gr = this._aclHasEntries(node) && node.acl.groupObj !== undefined ? node.acl.groupObj : grMode;
            const lines = [`# file: ${shown}`, `# owner: ${node.owner}`, `# group: ${node.group}`];
            const hasAcl = this._aclHasEntries(node);
            const acl = hasAcl ? node.acl : { users: {}, groups: {}, mask: null, def: null };
            lines.push(`user::${perms(ur)}`);
            for (const [n, v] of Object.entries(acl.users)) lines.push(`user:${n}:${perms(v)}`);
            lines.push(`group::${perms(hasAcl ? (acl.groupObj !== undefined ? acl.groupObj : gr) : gr)}`);
            for (const [n, v] of Object.entries(acl.groups)) lines.push(`group:${n}:${perms(v)}`);
            if (hasAcl && (Object.keys(acl.users).length || Object.keys(acl.groups).length || acl.mask !== null)) {
                lines.push(`mask::${perms(this._aclMask(node))}`);
            }
            lines.push(`other::${perms(or)}`);
            if (acl.def) {
                const d = acl.def;
                lines.push(`default:user::${perms(d.userObj !== undefined ? d.userObj : ur)}`);
                for (const [n, v] of Object.entries(d.users)) lines.push(`default:user:${n}:${perms(v)}`);
                lines.push(`default:group::${perms(d.groupObj !== undefined ? d.groupObj : gr)}`);
                for (const [n, v] of Object.entries(d.groups)) lines.push(`default:group:${n}:${perms(v)}`);
                let dm = d.mask;
                if (dm === null || dm === undefined) {
                    dm = d.groupObj !== undefined ? d.groupObj : gr;
                    for (const v of Object.values(d.users)) dm |= v;
                    for (const v of Object.values(d.groups)) dm |= v;
                }
                lines.push(`default:mask::${perms(dm)}`);
                lines.push(`default:other::${perms(d.other !== undefined ? d.other : or)}`);
            }
            return lines.join('\n') + '\n';
        };
        for (const p of rest) {
            const node = this.fs.getNode(p);
            if (!node) { errors.push(`getfacl: ${p}: No such file or directory`); continue; }
            let shown = p;
            if (shown.startsWith('/') && !o.p) { shown = shown.replace(/^\/+/, ''); stripped = true; }
            blocks.push(render(shown, node));
        }
        if (stripped) errors.unshift("getfacl: Removing leading '/' from absolute path names");
        return { stdout: blocks.join('\n').replace(/\n$/, ''), stderr: errors.join('\n'), exitCode: errors.some(x => !x.startsWith('getfacl: Removing')) ? 1 : 0 };
    }

    setfacl(args) {
        const { o, rest } = this._opts(args, 'mxMX', ['modify', 'remove', 'set']);
        const mSpec = o.m !== undefined ? o.m : o.modify;
        const xSpec = o.x !== undefined ? o.x : o.remove;
        const setSpec = o.set;
        const files = (mSpec !== undefined || xSpec !== undefined || setSpec !== undefined) ? rest : rest.slice(0);
        if (!mSpec && !xSpec && !setSpec && !o.b && !o.k) {
            return this._err('Usage: setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...');
        }
        if (files.length === 0) return this._err('Usage: setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...');
        const errors = [];

        for (const p of files) {
            const node = this.fs.getNode(p);
            if (!node) { errors.push(`setfacl: ${p}: No such file or directory`); continue; }
            const recursive = !!o.R;
            const apply = (path, n) => {
                if (o.b) {
                    if (n.acl && !Array.isArray(n.acl) && n.acl.groupObj !== undefined) {
                        n.permissions = n.permissions.slice(0, -2) + n.acl.groupObj + n.permissions.slice(-1);
                    }
                    n.acl = null;
                    return;
                }
                if (o.k) { if (n.acl && !Array.isArray(n.acl)) n.acl.def = null; return; }
                const spec = mSpec !== undefined ? mSpec : (xSpec !== undefined ? xSpec : setSpec);
                const remove = xSpec !== undefined;
                if (setSpec !== undefined) n.acl = null;
                const acl = this._aclFor(n);
                if (acl.groupObj === undefined) acl.groupObj = parseInt(n.permissions.slice(-2, -1), 10);
                for (const raw of String(spec).split(',')) {
                    const parts = raw.split(':');
                    let isDefault = !!o.d;
                    if (parts[0] === 'd' || parts[0] === 'default') { isDefault = true; parts.shift(); }
                    const kind = parts[0];
                    const name = parts[1] || '';
                    const permText = remove ? '' : parts[2];
                    if (!['u', 'user', 'g', 'group', 'm', 'mask', 'o', 'other'].includes(kind)) {
                        errors.push(`setfacl: Option -${remove ? 'x' : 'm'}: Invalid argument near character 1`);
                        return;
                    }
                    let perm = null;
                    if (!remove) {
                        perm = this._parseAclPerm(permText === undefined ? '' : permText);
                        if (perm === null) {
                            errors.push(`setfacl: Option -m: Invalid argument near character ${raw.length - (permText ? permText.length : 0) + 1}`);
                            return;
                        }
                    }
                    const k = kind[0];
                    if (name && k === 'u' && !this.fs.users[name] && !/^\d+$/.test(name)) {
                        errors.push(`setfacl: Option -${remove ? 'x' : 'm'}: Invalid argument near character ${raw.indexOf(':') + 2}`);
                        return;
                    }
                    if (name && k === 'g' && !this.fs.groups[name] && !/^\d+$/.test(name)) {
                        errors.push(`setfacl: Option -${remove ? 'x' : 'm'}: Invalid argument near character ${raw.indexOf(':') + 2}`);
                        return;
                    }
                    let target = acl;
                    if (isDefault) {
                        if (n.type !== 'directory') { errors.push(`setfacl: ${path}: Only directories can have default ACLs`); return; }
                        if (!acl.def) acl.def = { users: {}, groups: {}, mask: null };
                        target = acl.def;
                    }
                    if (k === 'u' && name) { if (remove) delete target.users[name]; else target.users[name] = perm; }
                    else if (k === 'g' && name) { if (remove) delete target.groups[name]; else target.groups[name] = perm; }
                    else if (k === 'u') {
                        if (isDefault) target.userObj = perm;
                        else n.permissions = n.permissions.slice(0, -3) + perm + n.permissions.slice(-2);
                    }
                    else if (k === 'g') {
                        if (isDefault) target.groupObj = perm;
                        else target.groupObj = perm;
                    }
                    else if (k === 'm') { target.mask = remove ? null : perm; }
                    else if (k === 'o') {
                        if (isDefault) target.other = perm;
                        else n.permissions = n.permissions.slice(0, -1) + perm;
                    }
                }
                // keep the group digit of the mode in sync with the mask (what ls -l shows)
                if (Object.keys(acl.users).length || Object.keys(acl.groups).length || acl.mask !== null) {
                    n.permissions = n.permissions.slice(0, -2) + this._aclMask(n) + n.permissions.slice(-1);
                } else if (acl.groupObj !== undefined) {
                    n.permissions = n.permissions.slice(0, -2) + acl.groupObj + n.permissions.slice(-1);
                }
            };
            this._walk(p, node, recursive, apply);
        }
        return { stdout: '', stderr: errors.join('\n'), exitCode: errors.length ? 1 : 0 };
    }

    // ===== cut / awk =====

    _readInputs(cmd, files, stdin) {
        if (files.length === 0) return { text: stdin || '', error: null };
        let text = '';
        for (const f of files) {
            const node = this.fs.getNode(f);
            if (!node) return { text: '', error: `${cmd}: ${f}: No such file or directory` };
            if (node.type !== 'file') return { text: '', error: `${cmd}: ${f}: Is a directory` };
            if (!this.fs.hasPermission(node, 'r')) return { text: '', error: `${cmd}: ${f}: Permission denied` };
            text += node.content || '';
            if (text && !text.endsWith('\n')) text += '\n';
        }
        return { text, error: null };
    }

    _rangeList(spec, max) {
        const set = new Set();
        for (const part of String(spec).split(',')) {
            const m = /^(\d*)-(\d*)$/.exec(part);
            if (m) {
                const from = m[1] === '' ? 1 : parseInt(m[1], 10);
                const to = m[2] === '' ? max : parseInt(m[2], 10);
                for (let i = from; i <= Math.min(to, max); i++) set.add(i);
            } else if (/^\d+$/.test(part)) {
                set.add(parseInt(part, 10));
            } else {
                return null;
            }
        }
        return [...set].sort((a, b) => a - b);
    }

    cut(args, stdin = '') {
        const { o, rest } = this._opts(args, 'dfcb', ['delimiter', 'fields', 'characters']);
        const delim = o.d !== undefined ? o.d : (o.delimiter !== undefined ? o.delimiter : '\t');
        const fieldSpec = o.f !== undefined ? o.f : o.fields;
        const charSpec = o.c !== undefined ? o.c : (o.b !== undefined ? o.b : o.characters);
        if (fieldSpec === undefined && charSpec === undefined) {
            return this._err('cut: you must specify a list of bytes, characters, or fields\nTry \'cut --help\' for more information.');
        }
        if (typeof delim === 'string' && delim.length > 1) return this._err('cut: the delimiter must be a single character\nTry \'cut --help\' for more information.');
        const { text, error } = this._readInputs('cut', rest, stdin);
        if (error) return this._err(error);
        const lines = text.split('\n');
        if (lines.length && lines[lines.length - 1] === '') lines.pop();
        const out = [];
        for (const line of lines) {
            if (charSpec !== undefined && charSpec !== true) {
                const idx = this._rangeList(charSpec, line.length);
                if (!idx) return this._err('cut: invalid byte, character or field list');
                out.push(idx.map(i => line[i - 1] || '').join(''));
            } else {
                if (!line.includes(delim)) { if (!o.s) out.push(line); continue; }
                const cols = line.split(delim);
                const idx = this._rangeList(fieldSpec, cols.length);
                if (!idx) return this._err('cut: invalid byte, character or field list');
                out.push(idx.map(i => cols[i - 1]).filter(v => v !== undefined).join(delim));
            }
        }
        return this._ok(out.join('\n'));
    }

    // ---- a small awk: BEGIN/END blocks, /regex/ and expression patterns, print/printf,
    //      $N, NF, NR, user variables, + - * / %, comparisons, ~ and !~, string concatenation
    _awkTokens(src) {
        const toks = [];
        let i = 0;
        const ops = ['&&', '||', '==', '!=', '<=', '>=', '!~', '+=', '-=', '*=', '/=', '++', '--', '~', '<', '>', '+', '-', '*', '/', '%', '=', '!', '(', ')', '{', '}', ';', ',', '$', '[', ']'];
        while (i < src.length) {
            const c = src[i];
            if (/\s/.test(c)) { if (c === '\n') toks.push({ t: ';' }); i++; continue; }
            if (c === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
            if (c === '"') {
                let s = '';
                i++;
                while (i < src.length && src[i] !== '"') {
                    if (src[i] === '\\' && i + 1 < src.length) {
                        const n = src[++i];
                        s += n === 'n' ? '\n' : n === 't' ? '\t' : n;
                    } else s += src[i];
                    i++;
                }
                i++;
                toks.push({ t: 'str', v: s });
                continue;
            }
            if (/[0-9.]/.test(c)) {
                let s = '';
                while (i < src.length && /[0-9.]/.test(src[i])) s += src[i++];
                toks.push({ t: 'num', v: parseFloat(s) });
                continue;
            }
            if (/[A-Za-z_]/.test(c)) {
                let s = '';
                while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
                toks.push({ t: 'id', v: s });
                continue;
            }
            if (c === '/') {
                // regex literal when it appears where an operand is expected
                const prev = toks[toks.length - 1];
                const operandExpected = !prev || ['op'].includes(prev.t) || (prev.t && !['num', 'str', 'id', ')', ']'].includes(prev.t));
                if (operandExpected) {
                    let s = '';
                    i++;
                    while (i < src.length && src[i] !== '/') {
                        if (src[i] === '\\' && src[i + 1] === '/') { s += '/'; i += 2; continue; }
                        s += src[i++];
                    }
                    i++;
                    toks.push({ t: 're', v: s });
                    continue;
                }
            }
            const op = ops.find(o => src.startsWith(o, i));
            if (!op) throw new Error(`syntax error at source line 1\n context is\n\t>>> ${src.slice(i, i + 10)} <<<`);
            toks.push({ t: op });
            i += op.length;
        }
        return toks;
    }

    awk(args, stdin = '') {
        let fs_ = null;
        const vars = {};
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-F') fs_ = args[++i];
            else if (a.startsWith('-F')) fs_ = a.slice(2);
            else if (a === '-v') { const kv = String(args[++i]).split('='); vars[kv[0]] = kv.slice(1).join('='); }
            else rest.push(a);
        }
        if (rest.length === 0) return this._err('usage: awk [-F fs][-v var=value][prog | -f progfile][file ...]');
        const src = rest[0];
        const { text, error } = this._readInputs('awk', rest.slice(1), stdin);
        if (error) return this._err(error.replace('awk: ', "awk: can't open file ").replace(': No such file or directory', '\n source line number 1'), 2);

        let toks;
        try { toks = this._awkTokens(src); } catch (err) { return this._err('awk: ' + err.message, 2); }
        let pos = 0;
        const peek = () => toks[pos];
        const next = () => toks[pos++];
        const accept = (t) => (peek() && peek().t === t ? next() : null);
        const expect = (t) => { if (!accept(t)) throw new Error(`awk: syntax error: expected ${t}`); };
        const skipSemis = () => { while (accept(';')); };

        // AST builders -------------------------------------------------
        const parseExpr = () => parseAssign();
        const parseAssign = () => {
            const start = pos;
            const left = parseOr();
            const t = peek();
            if (t && ['=', '+=', '-=', '*=', '/='].includes(t.t) && left.k === 'var') {
                next();
                return { k: 'assign', op: t.t, name: left.name, rhs: parseAssign() };
            }
            return left;
        };
        const bin = (sub, ops) => () => {
            let l = sub();
            while (peek() && ops.includes(peek().t)) { const op = next().t; l = { k: 'bin', op, l, r: sub() }; }
            return l;
        };
        const parsePrimary = () => {
            const t = next();
            if (!t) throw new Error('awk: syntax error: unexpected end');
            if (t.t === 'num') return { k: 'num', v: t.v };
            if (t.t === 'str') return { k: 'str', v: t.v };
            if (t.t === 're') return { k: 're', v: t.v };
            if (t.t === '$') { const e = parseUnary(); return { k: 'field', e }; }
            if (t.t === '(') { const e = parseExpr(); expect(')'); return e; }
            if (t.t === '-') return { k: 'neg', e: parseUnary() };
            if (t.t === '!') return { k: 'not', e: parseUnary() };
            if (t.t === '++' || t.t === '--') { const v = next(); return { k: 'assign', op: t.t === '++' ? '+=' : '-=', name: v.v, rhs: { k: 'num', v: 1 } }; }
            if (t.t === 'id') {
                if (peek() && peek().t === '(') {
                    next();
                    const argv = [];
                    if (!accept(')')) { do { argv.push(parseExpr()); } while (accept(',')); expect(')'); }
                    return { k: 'call', name: t.v, args: argv };
                }
                if (peek() && (peek().t === '++' || peek().t === '--')) {
                    const op = next().t;
                    return { k: 'post', name: t.v, op };
                }
                return { k: 'var', name: t.v };
            }
            throw new Error(`awk: syntax error near ${t.t}`);
        };
        const parseUnary = () => parsePrimary();
        const parseMul = bin(parseUnary, ['*', '/', '%']);
        const parseAdd = bin(parseMul, ['+', '-']);
        const parseConcat = () => {
            let l = parseAdd();
            while (peek() && ['num', 'str', 'id', '$', '(', 'not'].includes(peek().t) && !(peek().t === 'id' && ['in'].includes(peek().v))) {
                l = { k: 'cat', l, r: parseAdd() };
            }
            return l;
        };
        const parseCmp = bin(parseConcat, ['<', '>', '<=', '>=', '==', '!=', '~', '!~']);
        const parseAnd = bin(parseCmp, ['&&']);
        const parseOr = bin(parseAnd, ['||']);

        const parseSimple = () => {
            const t = peek();
            if (t && t.t === 'id' && (t.v === 'print' || t.v === 'printf')) {
                next();
                const exprs = [];
                if (peek() && ![';', '}'].includes(peek().t)) {
                    do { exprs.push(parseExpr()); } while (accept(','));
                }
                return { k: t.v, exprs };
            }
            if (t && t.t === 'id' && t.v === 'next') { next(); return { k: 'next' }; }
            if (t && t.t === 'id' && t.v === 'exit') { next(); return { k: 'exit' }; }
            return { k: 'expr', e: parseExpr() };
        };
        const parseBlock = () => {
            expect('{');
            const stmts = [];
            skipSemis();
            while (peek() && peek().t !== '}') {
                if (peek().t === 'id' && peek().v === 'if') {
                    next(); expect('(');
                    const cond = parseExpr(); expect(')');
                    skipSemis();
                    const thenB = peek().t === '{' ? parseBlock() : [parseSimple()];
                    skipSemis();
                    let elseB = null;
                    if (peek() && peek().t === 'id' && peek().v === 'else') { next(); skipSemis(); elseB = peek().t === '{' ? parseBlock() : [parseSimple()]; }
                    stmts.push({ k: 'if', cond, thenB, elseB });
                } else {
                    stmts.push(parseSimple());
                }
                skipSemis();
            }
            expect('}');
            return stmts;
        };

        const rules = [];
        let begin = [];
        let end = [];
        try {
            skipSemis();
            while (peek()) {
                const t = peek();
                if (t.t === 'id' && t.v === 'BEGIN') { next(); begin = begin.concat(parseBlock()); }
                else if (t.t === 'id' && t.v === 'END') { next(); end = end.concat(parseBlock()); }
                else {
                    let pat = null;
                    if (t.t !== '{') pat = parseExpr();
                    const body = peek() && peek().t === '{' ? parseBlock() : [{ k: 'print', exprs: [] }];
                    rules.push({ pat, body });
                }
                skipSemis();
            }
        } catch (err) {
            return this._err(err.message.startsWith('awk') ? err.message : 'awk: ' + err.message, 2);
        }

        // Evaluation -----------------------------------------------------
        const state = { NR: 0, NF: 0, fields: [], line: '', vars: Object.assign({ OFS: ' ', FS: fs_ === null ? ' ' : fs_ }, vars) };
        const out = [];
        const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
        const str = (v) => (typeof v === 'number' ? String(Number.isInteger(v) ? v : +v.toFixed(6)) : String(v === undefined ? '' : v));
        const truthy = (v) => (typeof v === 'number' ? v !== 0 : v !== '' && v !== undefined);
        const isNumLike = (v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
        const getField = (n) => (n === 0 ? state.line : state.fields[n - 1] === undefined ? '' : state.fields[n - 1]);
        const split = (line) => {
            const fsv = state.vars.FS;
            if (fsv === ' ') return line.trim() === '' ? [] : line.trim().split(/\s+/);
            if (fsv.length === 1) return line.split(fsv);
            return line.split(new RegExp(fsv));
        };
        const evalE = (n) => {
            switch (n.k) {
                case 'num': return n.v;
                case 'str': return n.v;
                case 're': return new RegExp(n.v).test(state.line) ? 1 : 0;
                case 'field': return getField(Math.floor(num(evalE(n.e))));
                case 'var':
                    if (n.name === 'NR') return state.NR;
                    if (n.name === 'NF') return state.NF;
                    return state.vars[n.name] === undefined ? '' : state.vars[n.name];
                case 'neg': return -num(evalE(n.e));
                case 'not': return truthy(evalE(n.e)) ? 0 : 1;
                case 'post': { const old = num(state.vars[n.name]); state.vars[n.name] = old + (n.op === '++' ? 1 : -1); return old; }
                case 'assign': {
                    const r = evalE(n.rhs);
                    const cur = state.vars[n.name];
                    let v = r;
                    if (n.op === '+=') v = num(cur) + num(r);
                    else if (n.op === '-=') v = num(cur) - num(r);
                    else if (n.op === '*=') v = num(cur) * num(r);
                    else if (n.op === '/=') v = num(cur) / num(r);
                    state.vars[n.name] = v;
                    return v;
                }
                case 'cat': return str(evalE(n.l)) + str(evalE(n.r));
                case 'call': {
                    const a = n.args.map(evalE);
                    switch (n.name) {
                        case 'length': return n.args.length ? str(a[0]).length : state.line.length;
                        case 'toupper': return str(a[0]).toUpperCase();
                        case 'tolower': return str(a[0]).toLowerCase();
                        case 'substr': { const s = str(a[0]); const st = Math.max(1, Math.floor(num(a[1]))); return a[2] === undefined ? s.slice(st - 1) : s.substr(st - 1, Math.floor(num(a[2]))); }
                        case 'int': return Math.trunc(num(a[0]));
                        case 'sqrt': return Math.sqrt(num(a[0]));
                        default: throw new Error(`awk: calling undefined function ${n.name}`);
                    }
                }
                case 'bin': {
                    if (n.op === '&&') return truthy(evalE(n.l)) && truthy(evalE(n.r)) ? 1 : 0;
                    if (n.op === '||') return truthy(evalE(n.l)) || truthy(evalE(n.r)) ? 1 : 0;
                    const l = evalE(n.l);
                    if (n.op === '~' || n.op === '!~') {
                        const rx = n.r.k === 're' ? new RegExp(n.r.v) : new RegExp(str(evalE(n.r)));
                        const m = rx.test(str(l));
                        return (n.op === '~' ? m : !m) ? 1 : 0;
                    }
                    const r = evalE(n.r);
                    switch (n.op) {
                        case '+': return num(l) + num(r);
                        case '-': return num(l) - num(r);
                        case '*': return num(l) * num(r);
                        case '/': return num(l) / num(r);
                        case '%': return num(l) % num(r);
                        default: {
                            const numeric = isNumLike(l) && isNumLike(r);
                            const a = numeric ? num(l) : str(l);
                            const b = numeric ? num(r) : str(r);
                            const res = n.op === '<' ? a < b : n.op === '>' ? a > b : n.op === '<=' ? a <= b : n.op === '>=' ? a >= b : n.op === '==' ? a === b : a !== b;
                            return res ? 1 : 0;
                        }
                    }
                }
                default: throw new Error('awk: internal error');
            }
        };
        const fmt = (format, vals) => {
            let i = 0;
            return format.replace(/%(-?)(\d*)(?:\.(\d+))?([sdif%])/g, (m, left, width, prec, conv) => {
                if (conv === '%') return '%';
                const v = vals[i++];
                let s;
                if (conv === 's') s = str(v);
                else if (conv === 'd' || conv === 'i') s = String(Math.trunc(num(v)));
                else s = prec !== undefined ? num(v).toFixed(parseInt(prec, 10)) : String(num(v));
                if (width) s = left ? s.padEnd(parseInt(width, 10)) : s.padStart(parseInt(width, 10));
                return s;
            });
        };
        let stop = false;
        const run = (stmts) => {
            for (const s of stmts) {
                if (stop) return 'exit';
                if (s.k === 'print') {
                    out.push(s.exprs.length ? s.exprs.map(x => str(evalE(x))).join(state.vars.OFS) : state.line);
                } else if (s.k === 'printf') {
                    const vals = s.exprs.map(evalE);
                    out.push(fmt(str(vals[0]), vals.slice(1)));
                    // printf does not add a newline; merge with following output
                    out[out.length - 1] = { raw: out[out.length - 1] };
                } else if (s.k === 'expr') {
                    evalE(s.e);
                } else if (s.k === 'if') {
                    const r = run(truthy(evalE(s.cond)) ? s.thenB : (s.elseB || []));
                    if (r) return r;
                } else if (s.k === 'next') {
                    return 'next';
                } else if (s.k === 'exit') {
                    stop = true;
                    return 'exit';
                }
            }
            return null;
        };

        try {
            run(begin);
            if (!stop) {
                const lines = text.split('\n');
                if (lines.length && lines[lines.length - 1] === '') lines.pop();
                for (const line of lines) {
                    state.NR++;
                    state.line = line;
                    state.fields = split(line);
                    state.NF = state.fields.length;
                    for (const r of rules) {
                        if (r.pat === null || truthy(evalE(r.pat))) {
                            const res = run(r.body);
                            if (res === 'next' || res === 'exit') break;
                        }
                    }
                    if (stop) break;
                }
            }
            stop = false;
            run(end);
        } catch (err) {
            return this._err(err.message.startsWith('awk') ? err.message : 'awk: ' + err.message, 2);
        }
        let result = '';
        for (let i = 0; i < out.length; i++) {
            const item = out[i];
            result += typeof item === 'object' ? item.raw : item + '\n';
        }
        return this._ok(result.replace(/\n$/, ''));
    }

    // ===== grep =====

    // Translate a POSIX regular expression (basic or extended) to a JavaScript RegExp source
    _posixToJs(pattern, extended) {
        const classes = {
            alpha: 'A-Za-z', digit: '0-9', alnum: 'A-Za-z0-9', upper: 'A-Z', lower: 'a-z',
            space: '\\s', blank: ' \\t', punct: '!-\\/:-@\\[-`{-~', xdigit: '0-9A-Fa-f'
        };
        let out = '';
        for (let i = 0; i < pattern.length; i++) {
            const c = pattern[i];
            if (c === '[') {
                let j = i + 1;
                let body = '';
                if (pattern[j] === '^') { body += '^'; j++; }
                if (pattern[j] === ']') { body += '\\]'; j++; }
                while (j < pattern.length && pattern[j] !== ']') {
                    if (pattern[j] === '[' && pattern[j + 1] === ':') {
                        const close = pattern.indexOf(':]', j + 2);
                        if (close > 0) {
                            const name = pattern.slice(j + 2, close);
                            body += classes[name] || '';
                            j = close + 2;
                            continue;
                        }
                    }
                    body += pattern[j] === '\\' ? '\\\\' : pattern[j];
                    j++;
                }
                out += '[' + body + ']';
                i = j;
                continue;
            }
            if (c === '\\' && i + 1 < pattern.length) {
                const n = pattern[++i];
                if (!extended && '(){}|+?'.includes(n)) out += n === '{' || n === '}' || n === '(' || n === ')' || n === '|' || n === '+' || n === '?' ? n : '\\' + n;
                else if (n === '<' || n === '>') out += '\\b';
                else out += '\\' + n;
                continue;
            }
            if (!extended && '(){}|+?'.includes(c)) { out += '\\' + c; continue; }
            out += c;
        }
        return out;
    }

    grep(args, stdin = '') {
        const patterns = [];
        const files = [];
        const o = {};
        let ctxA = 0, ctxB = 0;
        let sawPattern = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-e' || a === '--regexp') { patterns.push(args[++i]); sawPattern = true; continue; }
            if (a.startsWith('--regexp=')) { patterns.push(a.slice(9)); sawPattern = true; continue; }
            if (a === '-A' || a === '-B' || a === '-C') {
                const n = parseInt(args[++i], 10) || 0;
                if (a !== '-B') ctxA = n;
                if (a !== '-A') ctxB = n;
                continue;
            }
            const ctx = /^-([ABC])(\d+)$/.exec(a);
            if (ctx) { const n = parseInt(ctx[2], 10); if (ctx[1] !== 'B') ctxA = n; if (ctx[1] !== 'A') ctxB = n; continue; }
            if (/^-\d+$/.test(a)) { ctxA = ctxB = parseInt(a.slice(1), 10); continue; }
            if (a.startsWith('--')) {
                const name = a.slice(2).split('=')[0];
                const map = { 'ignore-case': 'i', 'invert-match': 'v', 'line-number': 'n', count: 'c', 'files-with-matches': 'l', 'files-without-match': 'L', recursive: 'r', 'extended-regexp': 'E', 'fixed-strings': 'F', 'word-regexp': 'w', 'line-regexp': 'x', 'only-matching': 'o', 'no-filename': 'h', 'with-filename': 'H', quiet: 'q', silent: 'q', 'no-messages': 's' };
                if (map[name]) o[map[name]] = true;
                continue;
            }
            if (a.startsWith('-') && a.length > 1) {
                for (const ch of a.slice(1)) o[ch] = true;
                continue;
            }
            if (!sawPattern) { patterns.push(a); sawPattern = true; }
            else files.push(a);
        }
        if (patterns.length === 0) return this._err('Usage: grep [OPTION]... PATTERNS [FILE]...\nTry \'grep --help\' for more information.', 2);
        const recursive = o.r || o.R;

        let regexes;
        try {
            regexes = patterns.flatMap(p => String(p).split('\n')).map(p => {
                let src = o.F ? p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : this._posixToJs(p, !!(o.E || o.P));
                if (o.w) src = '\\b(?:' + src + ')\\b';
                if (o.x) src = '^(?:' + src + ')$';
                return new RegExp(src, o.i ? 'gi' : 'g');
            });
        } catch (err) {
            return this._err('grep: Invalid regular expression', 2);
        }

        // Collect inputs
        const inputs = [];
        const errors = [];
        const collect = (path, node, shown) => {
            if (node.type === 'directory') {
                if (!recursive) { if (!o.s) errors.push(`grep: ${shown}: Is a directory`); return; }
                for (const name of Object.keys(node.children || {}).sort()) {
                    collect(path.replace(/\/$/, '') + '/' + name, node.children[name], shown.replace(/\/$/, '') + '/' + name);
                }
            } else if (node.type === 'file') {
                if (!this.fs.hasPermission(node, 'r')) { if (!o.s) errors.push(`grep: ${shown}: Permission denied`); return; }
                inputs.push({ name: shown, text: node.content || '' });
            }
        };
        if (files.length === 0) {
            if (recursive) {
                collect(this.fs.currentPath, this.fs.getNode(this.fs.currentPath), '.');
            } else {
                inputs.push({ name: '(standard input)', text: stdin || '' });
            }
        } else {
            for (const p of files) {
                const node = this.fs.getNode(p);
                if (!node) { if (!o.s) errors.push(`grep: ${p}: No such file or directory`); continue; }
                collect(p, node, p);
            }
        }
        const showName = o.H || (!o.h && (files.length > 1 || recursive));

        const out = [];
        let anyMatch = false;
        for (const inp of inputs) {
            const lines = inp.text.split('\n');
            if (lines.length && lines[lines.length - 1] === '') lines.pop();
            const hit = lines.map(line => {
                const m = regexes.some(r => { r.lastIndex = 0; return r.test(line); });
                return o.v ? !m : m;
            });
            const count = hit.filter(Boolean).length;
            if (count) anyMatch = true;
            if (o.q) continue;
            const prefix = (lineNo, sep) => (showName ? inp.name + sep : '') + (o.n ? lineNo + sep : '');
            if (o.c) { out.push((showName ? inp.name + ':' : '') + count); continue; }
            if (o.l) { if (count) out.push(inp.name); continue; }
            if (o.L) { if (!count) out.push(inp.name); continue; }
            if (o.o && !o.v) {
                lines.forEach((line, idx) => {
                    if (!hit[idx]) return;
                    for (const r of regexes) {
                        r.lastIndex = 0;
                        let m;
                        while ((m = r.exec(line)) !== null) {
                            if (m[0] === '') { r.lastIndex++; continue; }
                            out.push(prefix(idx + 1, ':') + m[0]);
                        }
                    }
                });
                continue;
            }
            const printed = new Set();
            let lastPrinted = -1;
            lines.forEach((line, idx) => {
                if (!hit[idx]) return;
                const from = Math.max(0, idx - ctxB), to = Math.min(lines.length - 1, idx + ctxA);
                if ((ctxA || ctxB) && lastPrinted >= 0 && from > lastPrinted + 1) out.push('--');
                for (let k = Math.max(from, lastPrinted + 1); k <= to; k++) {
                    if (printed.has(k)) continue;
                    printed.add(k);
                    out.push(prefix(k + 1, k === idx || hit[k] ? ':' : '-') + lines[k]);
                }
                lastPrinted = Math.max(lastPrinted, to);
            });
        }
        return {
            stdout: o.q ? '' : out.join('\n'),
            stderr: errors.join('\n'),
            exitCode: errors.length && !anyMatch ? 2 : (anyMatch ? 0 : 1)
        };
    }

    // ===== ps (real column layouts) =====

    _psRows() {
        return this._procs().map(p => ({
            pid: p.pid, user: p.user, cpu: p.cpu, mem: p.mem,
            ppid: p.pid === 1 ? 0 : 1, ni: p.ni || 0, cmd: p.command,
            comm: p.command.split(' ')[0].split('/').pop(),
            vsz: 20000 + p.pid * 13, rss: 3000 + p.pid * 7
        }));
    }

    ps(args) {
        const { o, rest } = this._opts(args.map(a => (/^(aux|auxf|axo|ax|aux[a-z]*)$/.test(a) ? '-' + a : a)), 'popU', ['sort']);
        let rows = this._psRows();
        if (o.p !== undefined && o.p !== true) {
            const want = String(o.p).split(',').map(Number);
            rows = rows.filter(r => want.includes(r.pid));
        }
        if (o.U !== undefined && o.U !== true) rows = rows.filter(r => r.user === o.U);
        const sortKey = o.sort ? String(o.sort) : null;
        if (sortKey) {
            const desc = sortKey.startsWith('-');
            const key = sortKey.replace(/^[-+]/, '').replace('%', '');
            const map = { pcpu: 'cpu', cpu: 'cpu', pmem: 'mem', mem: 'mem', rss: 'rss', vsz: 'vsz', pid: 'pid', ni: 'ni', nice: 'ni', user: 'user' };
            const k = map[key];
            if (!k) return this._err(`error: unknown sort key: ${key}`, 1);
            rows.sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (desc ? -1 : 1));
        }
        const header = (cols) => cols.map(c => c.h).join(' ');
        if (o.o !== undefined && o.o !== true) {
            const fields = String(o.o).split(',');
            const defs = {
                pid: { h: '    PID', v: r => String(r.pid).padStart(7) }, ppid: { h: '   PPID', v: r => String(r.ppid).padStart(7) },
                ni: { h: ' NI', v: r => String(r.ni).padStart(3) }, user: { h: 'USER    ', v: r => r.user.padEnd(8) },
                cmd: { h: 'CMD', v: r => r.cmd }, comm: { h: 'COMMAND', v: r => r.comm },
                '%cpu': { h: '%CPU', v: r => r.cpu.toFixed(1).padStart(4) }, '%mem': { h: '%MEM', v: r => r.mem.toFixed(1).padStart(4) },
                rss: { h: '  RSS', v: r => String(r.rss).padStart(5) }, vsz: { h: '   VSZ', v: r => String(r.vsz).padStart(6) },
                nice: { h: ' NI', v: r => String(r.ni).padStart(3) }, args: { h: 'COMMAND', v: r => r.cmd }, command: { h: 'COMMAND', v: r => r.cmd }
            };
            const cols = [];
            for (const fld of fields) {
                if (!defs[fld]) return this._err('error: unknown user-defined format specifier "' + fld + '"', 1);
                cols.push(defs[fld]);
            }
            return this._ok([header(cols), ...rows.map(r => cols.map(c => c.v(r)).join(' '))].join('\n'));
        }
        if (o.a && o.u && o.x || o.u) {
            const cols = 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND';
            const lines = rows.map(r => `${r.user.padEnd(8)} ${String(r.pid).padStart(7)} ${r.cpu.toFixed(1).padStart(4)} ${r.mem.toFixed(1).padStart(4)} ${String(r.vsz).padStart(6)} ${String(r.rss).padStart(5)} ?        Ss   09:00   0:0${r.pid % 10} ${r.pid === 1 ? '/usr/lib/systemd/systemd --switched-root --system --deserialize 31' : r.cmd}`);
            return this._ok([cols, ...lines].join('\n'));
        }
        if (o.e || o.f || o.A) {
            const full = !!o.f;
            const cols = full ? 'UID          PID    PPID  C STIME TTY          TIME CMD' : '    PID TTY          TIME CMD';
            const lines = rows.map(r => full
                ? `${r.user.padEnd(8)} ${String(r.pid).padStart(7)} ${String(r.ppid).padStart(7)}  0 09:00 ?        00:00:0${r.pid % 10} ${r.cmd}`
                : `${String(r.pid).padStart(7)} ?        00:00:0${r.pid % 10} ${r.comm}`);
            return this._ok([cols, ...lines].join('\n'));
        }
        if (o.a || o.x) {
            const lines = rows.map(r => `${String(r.pid).padStart(7)} ?        Ss     0:0${r.pid % 10} ${r.cmd}`);
            return this._ok(['    PID TTY      STAT   TIME COMMAND', ...lines].join('\n'));
        }
        return this._ok(['    PID TTY          TIME CMD', `   1201 pts/0    00:00:00 bash`, `   1250 pts/0    00:00:00 ps`].join('\n'));
    }

    // ===== filesystem / storage helpers =====

    xfs_info(args) {
        const t = args.filter(a => !a.startsWith('-'))[0];
        if (!t) return this._err('Usage: xfs_info [-V] [-t mtab] mountpoint | device');
        const known = Object.keys(this.xfsTypes).find(k => k === t && this.xfsTypes[k].type === 'xfs');
        if (!known && t !== '/' && t !== '/boot') return this._err(`xfs_info: ${t} is not a mounted XFS filesystem`);
        return this._ok(`meta-data=${t.padEnd(22)} isize=512    agcount=4, agsize=65536 blks\n         =                       sectsz=512   attr=2, projid32bit=1\ndata     =                       bsize=4096   blocks=262144, imaxpct=25\nnaming   =version 2              bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log           bsize=4096   blocks=16384, version=2`);
    }

    tune2fs(args) {
        if (!this._isRoot()) return this._err('tune2fs: Permission denied while trying to open device');
        const { o, rest } = this._opts(args, 'LUcCe');
        const dev = rest[0];
        if (!dev) return this._err('Usage: tune2fs [-c max_mounts_count] [-e errors_behavior] [-f] [-g group]\n\t[-i interval[d|m|w]] [-j] [-J journal_options] [-l]\n\t[-m reserved_blocks_percent] [-o [^]mount_options[,...]]\n\t[-r reserved_blocks_count] [-u user] [-C mount_count]\n\t[-L volume_label] [-M last_mounted_dir]\n\t[-O [^]feature[,...]] [-Q quota_options]\n\t[-E extended-option[,...]] [-T last_check_time] [-U UUID]\n\t[-I new_inode_size] [-z undo_file] device');
        const info = this.xfsTypes[dev];
        if (!info || !/^ext[234]$/.test(info.type)) return this._err(`tune2fs: Bad magic number in super-block while trying to open ${dev}\nFound a ${info ? info.type : 'dos'} filesystem on ${dev}.`);
        if (o.L !== undefined && o.L !== true) { info.label = o.L; return this._ok('tune2fs 1.46.5 (30-Dec-2021)'); }
        if (o.l) return this._ok(`tune2fs 1.46.5 (30-Dec-2021)\nFilesystem volume name:   ${info.label || '<none>'}\nFilesystem UUID:          ${info.uuid}\nFilesystem magic number:  0xEF53\nFilesystem features:      has_journal ext_attr resize_inode dir_index filetype extent 64bit flex_bg`);
        return this._ok('tune2fs 1.46.5 (30-Dec-2021)');
    }

    e2label(args) {
        const dev = args[0];
        if (!dev) return this._err('Usage: e2label device [newlabel]');
        const info = this.xfsTypes[dev];
        if (!info || !/^ext[234]$/.test(info.type)) return this._err(`e2label: Bad magic number in super-block while trying to open ${dev}`);
        if (args[1]) { info.label = args[1]; return this._ok(); }
        return this._ok(info.label || '');
    }

    xfs_admin(args) {
        const { o, rest } = this._opts(args, 'LU');
        const dev = rest[0];
        const info = this.xfsTypes[dev];
        if (!info || info.type !== 'xfs') return this._err(`xfs_admin: ${dev} is not a valid XFS filesystem (unexpected SB magic number 0x00000000)`);
        if (o.L !== undefined && o.L !== true) { info.label = o.L; return this._ok(`writing all SBs\nnew label = "${o.L}"`); }
        if (o.l) return this._ok(`label = "${info.label || ''}"`);
        return this._ok();
    }

    // ===== NFS / SELinux modules / GRUB helpers =====

    nfsstat(args) {
        const { o } = this._opts(args);
        if (o.m) return this._ok('No NFS mounted filesystems.');
        const client = 'Client rpc stats:\ncalls      retrans    authrefrsh\n0          0          0';
        const server = 'Server rpc stats:\ncalls      badcalls   badfmt     badauth    badclnt\n0          0          0          0          0';
        if (o.c) return this._ok(client);
        if (o.s) return this._ok(server);
        return this._ok(server + '\n\n' + client);
    }

    semodule(args) {
        const { o, rest } = this._opts(args, 'irel'.replace('l', ''), ['install', 'remove']);
        if (!this._isRoot() && !o.l) return this._err('semodule:  Permission denied');
        if (!this.xsemods) this.xsemods = ['abrt', 'accountsd', 'apache', 'chronyd', 'cockpit', 'firewalld', 'ssh', 'systemd', 'unconfined'];
        if (o.l || o.list) return this._ok(this.xsemods.join('\n'));
        const inst = o.i !== undefined ? o.i : o.install;
        if (inst !== undefined && inst !== true) {
            const name = String(inst).split('/').pop().replace(/\.pp$/, '');
            if (!this.fs.getNode(inst)) return this._err(`semodule:  Failed on ${inst}!`);
            if (!this.xsemods.includes(name)) this.xsemods.push(name);
            return this._ok();
        }
        const rem = o.r !== undefined ? o.r : o.remove;
        if (rem !== undefined && rem !== true) {
            if (!this.xsemods.includes(rem)) return this._err(`libsemanage.semanage_direct_remove_key: Unable to remove module ${rem} at priority 400. (No such file or directory).\nsemodule:  Failed!`);
            this.xsemods = this.xsemods.filter(m => m !== rem);
            return this._ok();
        }
        return this._err('usage:  semodule [option]... MODE...');
    }

    grubby(args) {
        const { o, rest } = this._opts(args, '', ['info', 'set-default', 'update-kernel', 'args', 'remove-args']);
        if (!this._isRoot()) return this._err('grubby: Permission denied');
        const g = this._grubState();
        const entry = (i) => `index=${i}\nkernel="${g.kernels[i]}"\nargs="${g.args}"\nroot="/dev/mapper/rhel-root"\ninitrd="/boot/initramfs-${g.kernels[i].split('vmlinuz-')[1]}.img"\ntitle="Red Hat Enterprise Linux (${g.kernels[i].split('vmlinuz-')[1]}) 9.3 (Plow)"`;
        if (o['default-kernel']) return this._ok(g.kernels[g.def]);
        if (o['default-index']) return this._ok(String(g.def));
        if (o.info !== undefined) {
            if (o.info === 'ALL') return this._ok(g.kernels.map((k, i) => entry(i)).join('\n'));
            if (o.info === 'DEFAULT') return this._ok(entry(g.def));
            const i = g.kernels.indexOf(o.info);
            return i < 0 ? this._err(`grubby: no kernel entry found for ${o.info}`) : this._ok(entry(i));
        }
        if (o['set-default'] !== undefined && o['set-default'] !== true) {
            const i = g.kernels.indexOf(o['set-default']);
            if (i < 0) return this._err(`The param ${o['set-default']} is incorrect`);
            g.def = i;
            return this._ok(`The default is /boot/loader/entries/${g.kernels[i].split('vmlinuz-')[1]}.conf with index ${i} and kernel ${g.kernels[i]}`);
        }
        if (o['update-kernel'] !== undefined) {
            if (o.args && o.args !== true) g.args += ' ' + o.args;
            if (o['remove-args'] && o['remove-args'] !== true) g.args = g.args.split(' ').filter(a => !String(o['remove-args']).split(' ').includes(a)).join(' ');
            return this._ok();
        }
        return this._err('grubby: missing option');
    }

    'ssh-keygen'(args) {
        const { o } = this._opts(args, 'tbCfNP');
        if (o.l) {
            const file = o.f && o.f !== true ? o.f : '';
            const node = this.fs.getNode(file);
            if (!node) return this._err(`${file} not found.`, 1);
            return this._ok(`3072 SHA256:${(node.fp || 'k3XbQ1mZ9o2vNf6sYtA0pLw8uC4dHrE7jGxVn5iMqRs')} ${node.comment || 'root@rhcsa-lab'} (${(node.keyType || 'RSA').toUpperCase()})`);
        }
        const type = o.t && o.t !== true ? o.t : 'rsa';
        if (!['rsa', 'ed25519', 'ecdsa', 'dsa'].includes(type)) return this._err(`unknown key type ${type}`);
        const home = this.fs.users[this.fs.currentUser].home;
        const path = o.f && o.f !== true ? o.f : `${home}/.ssh/id_${type}`;
        const comment = o.C && o.C !== true ? o.C : `${this.fs.currentUser}@rhcsa-lab`;
        const { parentPath, base } = this._homeParent(path);
        let dir = this.fs.getNode(parentPath);
        if (!dir && parentPath === home + '/.ssh') {
            const h = this.fs.getNode(home);
            if (h && h.children) {
                h.children['.ssh'] = { type: 'directory', permissions: '0700', owner: this.fs.currentUser, group: this._primaryGroupName(this.fs.currentUser), size: 4096, modified: new Date(), children: {} };
                dir = h.children['.ssh'];
            }
        }
        if (!dir) return this._err(`Saving key "${path}" failed: No such file or directory`);
        const bits = o.b && o.b !== true ? o.b : (type === 'rsa' ? '3072' : '256');
        const fp = Array.from({ length: 43 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[Math.floor(Math.random() * 64)]).join('');
        const grp = this._primaryGroupName(this.fs.currentUser);
        const mk = (perm, content) => ({ type: 'file', permissions: perm, owner: this.fs.currentUser, group: grp, size: content.length, modified: new Date(), content, fp, comment, keyType: type });
        dir.children[base] = mk('0600', '-----BEGIN OPENSSH PRIVATE KEY-----\n(simulated)\n-----END OPENSSH PRIVATE KEY-----\n');
        dir.children[base + '.pub'] = mk('0644', `ssh-${type === 'rsa' ? 'rsa' : type} AAAAB3Nza(simulated) ${comment}\n`);
        return this._ok(`Generating public/private ${type} key pair.\nYour identification has been saved in ${path}\nYour public key has been saved in ${path}.pub\nThe key fingerprint is:\nSHA256:${fp} ${comment}\nThe key's randomart image is:\n+---[${type.toUpperCase()} ${bits}]----+\n|   (simulated)   |\n+----[SHA256]-----+`);
    }

    'ssh-copy-id'(args) {
        const { rest } = this._opts(args, 'ipo');
        const target = rest[0];
        if (!target) return this._err('Usage: /usr/bin/ssh-copy-id [-h|-?|-f|-n|-s] [-i [identity_file]] [-p port] [-F alternative ssh_config file] [[-o <ssh -o options>] ...] [user@]hostname');
        const home = this.fs.users[this.fs.currentUser].home;
        const pub = Object.keys((this.fs.getNode(home + '/.ssh') || { children: {} }).children).find(n => n.endsWith('.pub'));
        if (!pub) return this._err('/usr/bin/ssh-copy-id: ERROR: No identities found');
        return this._ok(`/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "${home}/.ssh/${pub}"\n\nNumber of key(s) added: 1\n\nNow try logging into the machine, with:   "ssh '${target}'"\nand check to make sure that only the key(s) you wanted were added.`);
    }

    _grubState() {
        if (!this.xgrub) {
            this.xgrub = {
                kernels: ['/boot/vmlinuz-5.14.0-362.8.1.el9_3.x86_64', '/boot/vmlinuz-5.14.0-284.11.1.el9_2.x86_64'],
                def: 0, next: null,
                args: 'ro crashkernel=1G-4G:192M resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet'
            };
        }
        return this.xgrub;
    }

    'grub2-set-default'(args) {
        if (!this._isRoot()) return this._err('grub2-set-default: Permission denied');
        const g = this._grubState();
        const v = args[0];
        if (v === undefined) return this._err('Usage: grub2-set-default [OPTION] MENU_ENTRY');
        if (!/^\d+$/.test(v) || parseInt(v, 10) >= g.kernels.length) return this._err(`grub2-set-default: error: no such entry "${v}".`);
        g.def = parseInt(v, 10);
        return this._ok();
    }

    'grub2-reboot'(args) {
        if (!this._isRoot()) return this._err('grub2-reboot: Permission denied');
        const g = this._grubState();
        const v = args[0];
        if (v === undefined) return this._err('Usage: grub2-reboot [OPTION] MENU_ENTRY');
        if (!/^\d+$/.test(v) || parseInt(v, 10) >= g.kernels.length) return this._err(`grub2-reboot: error: no such entry "${v}".`);
        g.next = parseInt(v, 10);
        return this._ok();
    }

    'grub2-setpassword'() {
        if (!this._isRoot()) return this._err('grub2-setpassword: Permission denied');
        this._grubState().password = true;
        return this._ok('Enter password: \nConfirm password: ');
    }

    'grub2-editenv'(args) {
        if (args[0] !== 'list') return this._err('Usage: grub2-editenv FILENAME COMMAND [ARGS]\nTry \'grub2-editenv list\' to show the environment block.');
        const g = this._grubState();
        let out = `saved_entry=${this.xgrubName(g.def)}\nmenu_auto_hide=1\nboot_success=0\nboot_indeterminate=0`;
        if (g.next !== null) out += `\nnext_entry=${this.xgrubName(g.next)}`;
        return this._ok(out);
    }

    xgrubName(i) {
        return `${(this._grubState().kernels[i] || '').split('vmlinuz-')[1] ? '4a9d1c2e7b5f4e0f9a3c6d1e8b2f7a90' : ''}-${(this._grubState().kernels[i] || '').split('vmlinuz-')[1]}`;
    }

    shutdown(args) {
        const { o, rest } = this._opts(args);
        if (!this._isRoot()) return this._err('Failed to set wall message, ignoring: Interactive authentication required.\nFailed to call ScheduleShutdown in logind, proceeding with immediate shutdown: Interactive authentication required.\n' , 1);
        if (o.c) {
            if (!this.xshut) return this._err('', 0);
            this.xshut = null;
            return this._ok();
        }
        const when = rest[0] || '+1';
        if (!/^(now|\+\d+|\d{1,2}:\d{2})$/.test(when)) return this._err(`Bad time spec: ${when}`, 1);
        const kind = o.r ? 'reboot' : (o.H || o.P || o.h ? 'poweroff' : 'poweroff');
        if (when === 'now') return this._ok(`The system is going down for ${kind} NOW!`);
        this.xshut = { when, kind };
        return this._ok(`Shutdown scheduled for ${new Date(Date.now() + 60000 * (parseInt(when.replace('+', ''), 10) || 1)).toString().slice(0, 24)}, use 'shutdown -c' to cancel.`);
    }

    reboot() {
        if (!this._isRoot()) return this._err('Failed to reboot system via logind: Interactive authentication required.\nFailed to open initctl fifo: Permission denied\nFailed to talk to init daemon.', 1);
        return this._ok('Rebooting... (simulated: the terminal session stays up)');
    }

    poweroff() {
        if (!this._isRoot()) return this._err('Failed to power off system via logind: Interactive authentication required.', 1);
        return this._ok('Powering off... (simulated: the terminal session stays up)');
    }

    // ===== sed (addresses, s/y/d/p/q/a/i/c/=, -n -i -e -E, blocks) =====

    _sedParse(src, ext) {
        let i = 0;
        const n = src.length;
        const ws = () => { while (i < n && /[ \t]/.test(src[i])) i++; };
        const readDelimited = (delim) => {
            let out = '';
            while (i < n && src[i] !== delim) {
                if (src[i] === '\\' && i + 1 < n) {
                    if (src[i + 1] === delim) { out += delim === '/' ? '\\/' : delim; i += 2; continue; }
                    out += src[i] + src[i + 1]; i += 2; continue;
                }
                out += src[i++];
            }
            if (i >= n) throw new Error('unterminated');
            i++;
            return out;
        };
        const parseAddr = () => {
            ws();
            if (i >= n) return null;
            if (/\d/.test(src[i])) { let s = ''; while (i < n && /\d/.test(src[i])) s += src[i++]; if (src[i] === '~') { i++; let st = ''; while (i < n && /\d/.test(src[i])) st += src[i++]; return { t: 'step', first: parseInt(s, 10), step: parseInt(st, 10) }; } return { t: 'line', n: parseInt(s, 10) }; }
            if (src[i] === '$') { i++; return { t: 'last' }; }
            if (src[i] === '/' || src[i] === '\\') {
                let d = '/';
                if (src[i] === '\\') { i++; d = src[i]; }
                i++;
                const re = readDelimited(d);
                let flags = '';
                while (src[i] === 'I') { flags += 'i'; i++; }
                return { t: 're', re: new RegExp(this._posixToJs(re, ext), flags) };
            }
            return null;
        };
        const parseList = (inBlock) => {
            const cmds = [];
            while (i < n) {
                while (i < n && /[ \t\n;]/.test(src[i])) i++;
                if (i >= n) break;
                if (src[i] === '}') { if (inBlock) { i++; return cmds; } throw new Error('unexpected }'); }
                const a1 = parseAddr();
                let a2 = null;
                ws();
                if (a1 && src[i] === ',') { i++; a2 = parseAddr(); if (!a2) throw new Error('unexpected ,'); }
                ws();
                let neg = false;
                while (src[i] === '!') { neg = true; i++; ws(); }
                const c = src[i++];
                const cmd = { a1, a2, neg, c };
                if (c === '{') { cmd.block = parseList(true); cmds.push(cmd); continue; }
                if (c === 's') {
                    const d = src[i++];
                    if (!d || /[\n\\]/.test(d)) throw new Error('unterminated');
                    const pat = readDelimited(d);
                    const rep = readDelimited(d);
                    let flags = '';
                    while (i < n && /[gpiI0-9we]/.test(src[i])) { if (src[i] === 'w') { i = n; break; } flags += src[i++]; }
                    cmd.re = new RegExp(this._posixToJs(pat, ext) || '(?:)', 'g' === flags[0] ? '' : '');
                    cmd.reSrc = this._posixToJs(pat, ext);
                    cmd.rep = rep;
                    cmd.g = flags.includes('g');
                    cmd.p = flags.includes('p');
                    cmd.ic = /[iI]/.test(flags);
                    const num = /\d+/.exec(flags);
                    cmd.nth = num ? parseInt(num[0], 10) : 0;
                } else if (c === 'y') {
                    const d = src[i++];
                    const a = readDelimited(d), b = readDelimited(d);
                    if (a.length !== b.length) throw new Error("strings for `y' command are different lengths");
                    cmd.from = a; cmd.to = b;
                } else if (c === 'a' || c === 'i' || c === 'c') {
                    ws();
                    if (src[i] === '\\') { i++; while (i < n && src[i] !== '\n') i++; if (src[i] === '\n') i++; }
                    let text = '';
                    while (i < n && src[i] !== '\n') { if (src[i] === '\\' && i + 1 < n) { i++; text += src[i] === 'n' ? '\n' : src[i]; i++; } else text += src[i++]; }
                    cmd.text = text;
                } else if (['d', 'p', 'q', 'Q', '=', 'n', 'N', 'D', 'P', 'h', 'H', 'g', 'G', 'x', 'l'].includes(c)) {
                    if ((c === 'q' || c === 'Q') && /\d/.test(src[i] || '')) { let s = ''; while (/\d/.test(src[i] || '')) s += src[i++]; cmd.code = parseInt(s, 10); }
                } else if (c === undefined) {
                    throw new Error('missing command');
                } else {
                    throw new Error(`unknown command: \`${c}'`);
                }
                cmds.push(cmd);
            }
            if (inBlock) throw new Error('unmatched {');
            return cmds;
        };
        return parseList(false);
    }

    sed(args, stdin = '') {
        const scripts = [];
        const files = [];
        let inplace = false, suffix = '', quiet = false, ext = false, sawScript = false, separate = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-e' || a === '--expression') { scripts.push(args[++i]); sawScript = true; }
            else if (a.startsWith('--expression=')) { scripts.push(a.slice(13)); sawScript = true; }
            else if (a === '-n' || a === '--quiet' || a === '--silent') quiet = true;
            else if (a === '-E' || a === '-r' || a === '--regexp-extended') ext = true;
            else if (a === '-s' || a === '--separate') separate = true;
            else if (a === '--in-place') inplace = true;
            else if (a.startsWith('--in-place=')) { inplace = true; suffix = a.slice(11); }
            else if (a.startsWith('-i')) { inplace = true; suffix = a.slice(2); }
            else if (a === '-f') { const n = this.fs.getNode(args[++i]); if (!n) return this._err(`sed: couldn't open file ${args[i]}: No such file or directory`, 1); scripts.push(n.content); sawScript = true; }
            else if (/^-[nEr]+$/.test(a)) { if (a.includes('n')) quiet = true; if (/[Er]/.test(a)) ext = true; }
            else if (a.startsWith('-') && a.length > 1) return this._err(`sed: invalid option -- '${a.replace(/^-+/, '')}'\nUsage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...`, 1);
            else if (!sawScript) { scripts.push(a); sawScript = true; }
            else files.push(a);
        }
        if (!scripts.length) return this._err('Usage: sed [OPTION]... {script-only-if-no-other-script} [input-file]...', 1);
        let prog;
        try { prog = this._sedParse(scripts.join('\n'), ext); } catch (err) { return this._err(`sed: -e expression #1, char ${scripts.join('\n').length}: ${err.message}`, 1); }
        if (inplace && !files.length) return this._err('sed: no input files', 1);

        const runOn = (text, name) => {
            const lines = text.split('\n');
            const endsNl = text.endsWith('\n');
            if (endsNl) lines.pop();
            const out = [];
            const ranges = new WeakMap();
            let quit = false, exit = 0;
            const total = lines.length;
            let hold = '';
            const execList = (cmds, st) => {
                for (const cmd of cmds) {
                    if (quit) return;
                    let hit = this._sedMatch(cmd, st, ranges);
                    if (cmd.neg) hit = !hit;
                    if (!hit) continue;
                    switch (cmd.c) {
                        case '{': execList(cmd.block, st); if (st.deleted) return; break;
                        case 's': {
                            const re = new RegExp(cmd.reSrc || '(?:)', (cmd.ic ? 'i' : '') + 'g');
                            let count = 0, replaced = false;
                            const res = st.line.replace(re, (...m) => {
                                count++;
                                if ((cmd.nth && count < cmd.nth) || (!cmd.g && !cmd.nth && count > 1) || (cmd.nth && !cmd.g && count > cmd.nth)) return m[0];
                                replaced = true;
                                const groups = m.slice(1, -2).filter(x => typeof x !== 'object');
                                return cmd.rep.replace(/\\([0-9&nt\\])|&/g, (x, k) => (x === '&' ? m[0] : k === '&' ? '&' : k === 'n' ? '\n' : k === 't' ? '\t' : k === '\\' ? '\\' : (groups[parseInt(k, 10) - 1] || '')));
                            });
                            if (replaced) { st.line = res; st.subst = true; if (cmd.p) out.push(st.line); }
                            break;
                        }
                        case 'y': st.line = st.line.split('').map(ch => { const k = cmd.from.indexOf(ch); return k >= 0 ? cmd.to[k] : ch; }).join(''); break;
                        case 'd': st.deleted = true; return;
                        case 'D': st.deleted = true; return;
                        case 'p': case 'P': out.push(st.line); break;
                        case '=': out.push(String(st.n)); break;
                        case 'q': quit = true; exit = cmd.code || 0; if (!quiet) { st.after.forEach(x => out.push(x)); } return;
                        case 'Q': quit = true; exit = cmd.code || 0; st.deleted = true; return;
                        case 'a': st.after.push(cmd.text); break;
                        case 'i': out.push(cmd.text); break;
                        case 'c': st.deleted = true; if (!cmd.a2 || ranges.get(cmd) === 'end' || cmd.neg) out.push(cmd.text); return;
                        case 'h': hold = st.line; break;
                        case 'H': hold += '\n' + st.line; break;
                        case 'g': st.line = hold; break;
                        case 'G': st.line += '\n' + hold; break;
                        case 'x': { const t = hold; hold = st.line; st.line = t; break; }
                        case 'n': case 'N': break;
                        case 'l': out.push(st.line.replace(/\t/g, '\\t') + '$'); break;
                    }
                }
            };
            for (let k = 0; k < total && !quit; k++) {
                const st = { line: lines[k], n: k + 1, last: k === total - 1, deleted: false, after: [], subst: false };
                execList(prog, st);
                if (!st.deleted && !quiet) out.push(st.line);
                if (!st.deleted || quit) { /* auto-print handled above */ }
                st.after.forEach(x => { if (!(quit && !st.deleted && false)) out.push(x); });
                if (quit && st.deleted) break;
            }
            return { text: out.join('\n') + (out.length && (endsNl || !text) ? '\n' : (out.length ? '\n' : '')), exit };
        };

        if (!files.length) {
            const r = runOn(stdin || '', '-');
            return { stdout: r.text.replace(/\n$/, ''), stderr: '', exitCode: r.exit };
        }
        let outAll = '';
        const errs = [];
        for (const p of files) {
            const node = this.fs.getNode(p);
            if (!node) { errs.push(`sed: can't read ${p}: No such file or directory`); continue; }
            if (node.type !== 'file') { errs.push(`sed: couldn't edit ${p}: not a regular file`); continue; }
            if (!this.fs.hasPermission(node, 'r')) { errs.push(`sed: couldn't open file ${p}: Permission denied`); continue; }
            const r = runOn(node.content || '', p);
            if (inplace) {
                if (!this.fs.hasPermission(node, 'w')) { errs.push(`sed: couldn't open temporary file ${this.fs.getParentPath(p)}/sedXXXXXX: Permission denied`); continue; }
                if (suffix) {
                    const parent = this.fs.getNode(this.fs.getParentPath(p));
                    const bn = this.fs.getBasename(p);
                    const bak = suffix.includes('*') ? suffix.replace('*', bn) : bn + suffix;
                    parent.children[bak] = Object.assign({}, node, { content: node.content });
                }
                node.content = r.text; node.size = r.text.length; node.modified = new Date();
            } else outAll += r.text;
        }
        return { stdout: outAll.replace(/\n$/, ''), stderr: errs.join('\n'), exitCode: errs.length ? 2 : 0 };
    }

    _sedMatch(cmd, st, ranges) {
        const at = (a) => (a.t === 'line' ? st.n === a.n : a.t === 'last' ? st.last : a.t === 're' ? a.re.test(st.line) : a.t === 'step' ? (a.step ? st.n >= a.first && (st.n - a.first) % a.step === 0 : st.n === a.first) : false);
        if (!cmd.a1) return true;
        if (!cmd.a2) return at(cmd.a1);
        const state = ranges.get(cmd);
        if (state === 'active') {
            const a2 = cmd.a2;
            if (a2.t === 'line' ? st.n >= a2.n : at(a2)) { ranges.set(cmd, 'end'); ranges.set(cmd, 'done'); }
            return true;
        }
        if (at(cmd.a1)) {
            const a2 = cmd.a2;
            if (a2.t === 'line' ? a2.n <= st.n : false) { ranges.set(cmd, 'done'); return true; }
            ranges.set(cmd, 'active');
            return true;
        }
        return false;
    }

    // ===== printf / seq / basename / dirname =====

    printf(args) {
        if (!args.length) return this._err('printf: usage: printf [-v var] format [arguments]', 2);
        const fmt = args[0];
        const vals = args.slice(1);
        const esc = (s) => s.replace(/\\(n|t|r|\\|a|b|f|v|"|'|0[0-7]{0,3}|x[0-9a-fA-F]{1,2})/g, (m, k) => ({ n: '\n', t: '\t', r: '\r', '\\': '\\', a: '\x07', b: '\b', f: '\f', v: '\v', '"': '"', "'": "'" }[k] !== undefined ? { n: '\n', t: '\t', r: '\r', '\\': '\\', a: '\x07', b: '\b', f: '\f', v: '\v', '"': '"', "'": "'" }[k] : (k[0] === 'x' ? String.fromCharCode(parseInt(k.slice(1), 16)) : String.fromCharCode(parseInt(k, 8) || 0))));
        const re = /%(-?)(0?)(\d*)(?:\.(\d+))?([sdifxXoc%b])/g;
        let out = '';
        let vi = 0;
        const hasSpec = /%[^%]/.test(fmt.replace(/%%/g, ''));
        do {
            out += esc(fmt).replace(re, (m, left, zero, width, prec, conv) => {
                if (conv === '%') return '%';
                const v = vi < vals.length ? vals[vi++] : (conv === 's' || conv === 'b' || conv === 'c' ? '' : '0');
                let s;
                if (conv === 's') s = prec !== undefined ? String(v).slice(0, +prec) : String(v);
                else if (conv === 'b') s = esc(String(v));
                else if (conv === 'c') s = String(v)[0] || '';
                else if (conv === 'd' || conv === 'i') { const n = parseInt(v, 10); if (isNaN(n)) return '0'; s = String(n); }
                else if (conv === 'f') s = (parseFloat(v) || 0).toFixed(prec !== undefined ? +prec : 6);
                else if (conv === 'x') s = (parseInt(v, 10) || 0).toString(16);
                else if (conv === 'X') s = (parseInt(v, 10) || 0).toString(16).toUpperCase();
                else s = (parseInt(v, 10) || 0).toString(8);
                if (width) s = left ? s.padEnd(+width) : (zero && conv !== 's' ? s.padStart(+width, '0') : s.padStart(+width));
                return s;
            });
        } while (hasSpec && vi < vals.length);
        return this._ok(out.replace(/\n$/, ''));
    }

    seq(args) {
        const nums = args.filter(a => !a.startsWith('-') || /^-\d/.test(a)).map(Number);
        if (!nums.length || nums.some(isNaN)) return this._err(`seq: invalid floating point argument: '${args[0] || ''}'\nTry 'seq --help' for more information.`, 1);
        let first = 1, inc = 1, last;
        if (nums.length === 1) last = nums[0]; else if (nums.length === 2) { first = nums[0]; last = nums[1]; } else { first = nums[0]; inc = nums[1]; last = nums[2]; }
        if (inc === 0) return this._err("seq: invalid Zero increment value: '0'", 1);
        const out = [];
        for (let v = first; inc > 0 ? v <= last : v >= last; v += inc) { out.push(String(v)); if (out.length > 100000) break; }
        return this._ok(out.join('\n'));
    }

    basename(args) {
        const ops = args.filter(a => !a.startsWith('-'));
        if (!ops.length) return this._err("basename: missing operand\nTry 'basename --help' for more information.", 1);
        let b = ops[0].replace(/\/+$/, '').split('/').pop() || '/';
        if (ops[1] && b.endsWith(ops[1]) && b !== ops[1]) b = b.slice(0, -ops[1].length);
        return this._ok(b);
    }

    dirname(args) {
        const ops = args.filter(a => !a.startsWith('-'));
        if (!ops.length) return this._err("dirname: missing operand\nTry 'dirname --help' for more information.", 1);
        return this._ok(ops.map(p => { const t = p.replace(/\/+$/, ''); const i = t.lastIndexOf('/'); return i < 0 ? '.' : (i === 0 ? '/' : t.slice(0, i)); }).join('\n'));
    }

    // ===== tar and the compressors =====

    _cloneNode(n) {
        const c = Object.assign({}, n);
        delete c.selinux; delete c.acl; delete c._ino;
        if (n.type === 'directory') { c.children = {}; for (const [k, v] of Object.entries(n.children || {})) c.children[k] = this._cloneNode(v); }
        return c;
    }

    _permStr(n) {
        const m = (n.permissions || '0644').slice(-3);
        const t = n.type === 'directory' ? 'd' : n.type === 'symlink' ? 'l' : '-';
        const bits = (d) => ((d & 4) ? 'r' : '-') + ((d & 2) ? 'w' : '-') + ((d & 1) ? 'x' : '-');
        return t + [...m].map(x => bits(parseInt(x, 10))).join('');
    }

    _compMark(c) { return { gz: 'gzip compressed data, from Unix', bz2: 'bzip2 compressed data, block size = 900k', xz: 'XZ compressed data, checksum CRC64' }[c]; }
    _compRatio(c) { return { gz: 0.35, bz2: 0.3, xz: 0.25 }[c] || 1; }

    _entriesSize(entries) {
        let n = 0;
        for (const en of entries) n += 512 + (en.node.type === 'file' ? Math.ceil((en.node.size || 0) / 512) * 512 : 0);
        return Math.ceil((n + 1024) / 10240) * 10240;
    }

    tar(args, stdin = '') {
        // operation / flags (the first word may be a dash-less cluster: tar czf a.tgz dir)
        let words = args.slice();
        if (words[0] && !words[0].startsWith('-') && /^[cxtrudAvfzjJpPkOwhaC]+$/.test(words[0])) words[0] = '-' + words[0];
        let op = null, file = null, comp = null, verbose = false, chdir = null, strip = 0, toStdout = false, noOverwrite = false, keepAbs = false, auto = false;
        const excludes = [];
        const operands = [];
        for (let i = 0; i < words.length; i++) {
            const a = words[i];
            if (a === '--create') op = 'c'; else if (a === '--extract' || a === '--get') op = 'x'; else if (a === '--list') op = 't';
            else if (a === '--file') file = words[++i]; else if (a.startsWith('--file=')) file = a.slice(7);
            else if (a === '--gzip' || a === '--gunzip') comp = 'gz'; else if (a === '--bzip2') comp = 'bz2'; else if (a === '--xz') comp = 'xz';
            else if (a === '--verbose') verbose = true; else if (a === '--directory') chdir = words[++i]; else if (a.startsWith('--directory=')) chdir = a.slice(12);
            else if (a.startsWith('--exclude=')) excludes.push(a.slice(10)); else if (a === '--exclude') excludes.push(words[++i]);
            else if (a.startsWith('--strip-components=')) strip = parseInt(a.slice(19), 10); else if (a === '--strip-components') strip = parseInt(words[++i], 10);
            else if (a === '--to-stdout') toStdout = true; else if (a === '--keep-old-files') noOverwrite = true; else if (a === '--absolute-names') keepAbs = true; else if (a === '--auto-compress') auto = true;
            else if (/^--(preserve-permissions|numeric-owner|same-owner|no-same-owner|one-file-system|selinux|xattrs|acls|totals|overwrite|same-permissions)$/.test(a)) { /* accepted */ }
            else if (a.startsWith('--')) return this._err(`tar: unrecognized option '${a}'\nTry 'tar --help' or 'tar --usage' for more information.`, 64);
            else if (a.startsWith('-') && a.length > 1) {
                const cl = a.slice(1);
                for (let j = 0; j < cl.length; j++) {
                    const ch = cl[j];
                    if (ch === 'c' || ch === 'x' || ch === 't' || ch === 'r' || ch === 'u' || ch === 'A' || ch === 'd') op = op || ch;
                    else if (ch === 'f') { file = words[++i]; }
                    else if (ch === 'z') comp = 'gz'; else if (ch === 'j') comp = 'bz2'; else if (ch === 'J') comp = 'xz'; else if (ch === 'a') auto = true;
                    else if (ch === 'v') verbose = true; else if (ch === 'O') toStdout = true; else if (ch === 'k') noOverwrite = true; else if (ch === 'P') keepAbs = true;
                    else if (ch === 'C') { chdir = words[++i]; }
                    else if ('phsSwlmoUWT'.includes(ch)) { /* accepted */ }
                    else return this._err(`tar: invalid option -- '${ch}'\nTry 'tar --help' or 'tar --usage' for more information.`, 64);
                }
            } else operands.push(a);
        }
        if (!op) return this._err("tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' or 'tar --usage' for more information.", 2);
        if (op === 'r' || op === 'u' || op === 'A' || op === 'd') return this._err('tar: this simulator supports -c, -x and -t', 2);
        if (!file && op !== 'c') return this._err('tar: Refusing to read archive contents from terminal (missing -f option?)\ntar: Error is not recoverable: exiting now', 2);
        if (op === 'c' && !file) return this._err('tar: Refusing to write archive contents to terminal (missing -f option?)\ntar: Error is not recoverable: exiting now', 2);
        if (auto && file) comp = /\.(tar\.gz|tgz)$/.test(file) ? 'gz' : /\.(tar\.bz2|tbz2?)$/.test(file) ? 'bz2' : /\.(tar\.xz|txz)$/.test(file) ? 'xz' : comp;
        const errs = [];
        const out = [];
        const base0 = chdir ? this.fs.getNode(chdir) : this.fs.getNode(this.fs.currentPath);
        const baseDir = chdir ? this.fs.resolvePath(chdir) : this.fs.currentPath;
        if (chdir && (!base0 || base0.type !== 'directory')) return this._err(`tar: ${chdir}: Cannot open: No such file or directory\ntar: Error is not recoverable: exiting now`, 2);
        const absPath = (p) => (p.startsWith('/') ? p : (baseDir === '/' ? '' : baseDir) + '/' + p);
        // the archive named with -f is relative to the directory tar was started in, members to -C
        const fileAbs = (p) => (p.startsWith('/') ? p : (this.fs.currentPath === '/' ? '' : this.fs.currentPath) + '/' + p);

        if (op === 'c') {
            if (!operands.length) return this._err("tar: Cowardly refusing to create an empty archive\nTry 'tar --help' or 'tar --usage' for more information.", 2);
            const entries = [];
            let stripped = false;
            const globRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            const excluded = (name) => excludes.some(x => globRe(x).test(name) || globRe(x).test(name.split('/').pop()));
            const add = (shown, node) => {
                let nm = shown;
                if (!keepAbs && nm.startsWith('/')) { nm = nm.replace(/^\/+/, ''); stripped = true; }
                if (excluded(nm)) return;
                entries.push({ name: nm + (node.type === 'directory' ? '/' : ''), node: this._cloneNode(node) });
                if (node.type === 'directory') for (const [k, v] of Object.entries(node.children || {})) add((shown.replace(/\/$/, '') + '/' + k), v);
            };
            for (const op2 of operands) {
                const node = this.fs.getNode(absPath(op2));
                if (!node) { errs.push(`tar: ${op2}: Cannot stat: No such file or directory`); continue; }
                if (node.type === 'file' && !this.fs.hasPermission(node, 'r')) { errs.push(`tar: ${op2}: Cannot open: Permission denied`); continue; }
                add(op2, node);
            }
            if (stripped) errs.unshift("tar: Removing leading `/' from member names");
            const target = this.fs.getNode(fileAbs(file));
            if (target && target.tarEntries && entries.some(en => false)) { /* overwritten below */ }
            if (entries.length || !errs.some(x => x.includes('Cannot stat'))) {
                const raw = this._entriesSize(entries);
                const size = comp ? Math.max(120, Math.ceil(raw * this._compRatio(comp)) + 100) : raw;
                const parentPath = this.fs.getParentPath(fileAbs(file));
                const parent = this.fs.getNode(parentPath);
                if (!parent || parent.type !== 'directory') return this._err(`tar: ${file}: Cannot open: No such file or directory\ntar: Error is not recoverable: exiting now`, 2);
                if (!this.fs.hasPermission(parent, 'w')) return this._err(`tar: ${file}: Cannot open: Permission denied\ntar: Error is not recoverable: exiting now`, 2);
                const grp = this._primaryGroupName(this.fs.currentUser);
                parent.children[this.fs.getBasename(fileAbs(file))] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: grp, size, modified: new Date(), content: '(tar archive)', tarEntries: entries, tarComp: comp || null };
            }
            if (verbose) entries.forEach(en => out.push(en.name));
            const bad = errs.filter(x => x.includes('Cannot'));
            if (bad.length) errs.push('tar: Exiting with failure status due to previous errors');
            return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: bad.length ? 2 : 0 };
        }

        // read the archive for -t / -x
        const an = this.fs.getNode(fileAbs(file));
        if (!an) return this._err(`tar: ${file}: Cannot open: No such file or directory\ntar: Error is not recoverable: exiting now`, 2);
        if (an.type !== 'file') return this._err(`tar: ${file}: Cannot open: Is a directory\ntar: Error is not recoverable: exiting now`, 2);
        if (!this.fs.hasPermission(an, 'r')) return this._err(`tar: ${file}: Cannot open: Permission denied\ntar: Error is not recoverable: exiting now`, 2);
        const actual = an.tarComp || (an.compressed || null);
        if (comp && actual !== comp) {
            const tool = { gz: 'gzip: stdin: not in gzip format', bz2: 'bzip2: (stdin) is not a bzip2 file.', xz: 'xz: (stdin): File format not recognized' }[comp];
            return this._err(`${tool}\ntar: Child returned status ${comp === 'gz' ? 1 : 2}\ntar: Error is not recoverable: exiting now`, 2);
        }
        if (!an.tarEntries) return this._err('tar: This does not look like a tar archive\ntar: Skipping to next header\ntar: Exiting with failure status due to previous errors', 2);
        let entries = an.tarEntries;
        const sel = operands.length ? entries.filter(en => operands.some(o => en.name === o || en.name === o + '/' || en.name.startsWith(o.replace(/\/$/, '') + '/'))) : entries;
        if (operands.length) for (const o of operands) if (!entries.some(en => en.name === o || en.name === o + '/' || en.name.startsWith(o.replace(/\/$/, '') + '/'))) errs.push(`tar: ${o}: Not found in archive`);
        if (op === 't') {
            const lines = sel.map(en => {
                if (!verbose) return en.name;
                const n = en.node;
                const d = n.modified instanceof Date ? n.modified : new Date();
                const pad = (x) => String(x).padStart(2, '0');
                return `${this._permStr(n)} ${n.owner || 'root'}/${n.group || 'root'} ${String(n.type === 'file' ? n.size || 0 : 0).padStart(8)} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} ${en.name}`;
            });
            if (errs.length) errs.push('tar: Exiting with failure status due to previous errors');
            return { stdout: lines.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 2 : 0 };
        }
        // extract
        const root = this.fs.getNode(baseDir);
        if (!root || !this.fs.hasPermission(root, 'w')) return this._err(`tar: ${chdir || '.'}: Cannot open: Permission denied\ntar: Error is not recoverable: exiting now`, 2);
        const isRoot = this._isRoot();
        for (const en of sel) {
            let parts = en.name.replace(/\/$/, '').split('/').filter(Boolean);
            if (strip) { if (parts.length <= strip) continue; parts = parts.slice(strip); }
            let cur = root;
            let denied = false;
            for (let i = 0; i < parts.length; i++) {
                const last = i === parts.length - 1;
                if (!cur.children[parts[i]]) {
                    if (last && en.node.type !== 'directory') {
                        const cp = this._cloneNode(en.node);
                        cp.modified = en.node.modified instanceof Date ? en.node.modified : new Date();
                        if (!isRoot) { cp.owner = this.fs.currentUser; cp.group = this._primaryGroupName(this.fs.currentUser); }
                        if (toStdout) { out.push(cp.content || ''); break; }
                        cur.children[parts[i]] = cp;
                    } else {
                        cur.children[parts[i]] = { type: 'directory', permissions: last ? en.node.permissions : '0755', owner: isRoot && last ? en.node.owner : this.fs.currentUser, group: isRoot && last ? en.node.group : this._primaryGroupName(this.fs.currentUser), size: 4096, modified: new Date(), children: {} };
                    }
                } else if (last && en.node.type !== 'directory') {
                    if (noOverwrite) { errs.push(`tar: ${parts.join('/')}: Cannot open: File exists`); break; }
                    if (!this.fs.hasPermission(cur.children[parts[i]], 'w')) { errs.push(`tar: ${parts.join('/')}: Cannot open: Permission denied`); denied = true; break; }
                    const cp = this._cloneNode(en.node);
                    cp.owner = isRoot ? en.node.owner : cur.children[parts[i]].owner; cp.group = isRoot ? en.node.group : cur.children[parts[i]].group;
                    cur.children[parts[i]] = cp;
                }
                if (cur.children[parts[i]]) cur = cur.children[parts[i]];
                if (cur.type !== 'directory' && !last) { errs.push(`tar: ${parts.join('/')}: Cannot mkdir: Not a directory`); break; }
            }
            if (verbose && !denied && !toStdout) out.push(en.name);
        }
        const bad = errs.filter(x => x.includes('Cannot') || x.includes('Not found'));
        if (bad.length) errs.push('tar: Exiting with failure status due to previous errors');
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: bad.length ? 2 : 0 };
    }

    _compress(tool, args, stdin) {
        const spec = {
            gzip: { ext: '.gz', comp: 'gz' }, bzip2: { ext: '.bz2', comp: 'bz2' }, xz: { ext: '.xz', comp: 'xz' }
        };
        const s = spec[tool];
        let decompress = false, keep = false, toOut = false, list = false, force = false, verbose = false, recursive = false, test = false;
        const files = [];
        for (const a of args) {
            if (a === '--decompress' || a === '--uncompress') decompress = true; else if (a === '--keep') keep = true; else if (a === '--stdout' || a === '--to-stdout') toOut = true; else if (a === '--list') list = true; else if (a === '--force') force = true; else if (a === '--verbose') verbose = true; else if (a === '--recursive') recursive = true; else if (a === '--test') test = true;
            else if (/^-\d$/.test(a) || a === '--fast' || a === '--best') { /* level */ }
            else if (a.startsWith('--')) return this._err(`${tool}: unrecognized option '${a}'`, 1);
            else if (a.startsWith('-') && a.length > 1) { for (const ch of a.slice(1)) { if (ch === 'd') decompress = true; else if (ch === 'k') keep = true; else if (ch === 'c') toOut = true; else if (ch === 'l') list = true; else if (ch === 'f') force = true; else if (ch === 'v') verbose = true; else if (ch === 'r') recursive = true; else if (ch === 't') test = true; else if (/\d/.test(ch) || ch === 'q' || ch === 'z') { /* ok */ } else return this._err(`${tool}: invalid option -- '${ch}'`, 1); } }
            else files.push(a);
        }
        if (!files.length) return stdin ? this._ok(decompress ? stdin : stdin) : this._err(`${tool}: compressed data not written to a terminal. Use -f to force compression.\n${tool}: For help, type: '${tool} -h'.`, 1);
        const out = [], errs = [];
        for (const f of files) {
            const node = this.fs.getNode(f);
            if (!node) { errs.push(`${tool}: ${f}: No such file or directory`); continue; }
            if (node.type === 'directory') { errs.push(`${tool}: ${f} is a directory -- ignored`); continue; }
            if (list) { out.push(`         compressed        uncompressed  ratio uncompressed_name\n${String(node.size || 0).padStart(18)} ${String(node.origSize || Math.round((node.size || 0) / this._compRatio(s.comp))).padStart(19)}  ${Math.round(100 - 100 * (node.size || 1) / (node.origSize || (node.size || 1) / this._compRatio(s.comp)))}.0% ${f.replace(new RegExp(s.ext.replace('.', '\\.') + '$'), '')}`); continue; }
            if (test) { if (node.compressed !== s.comp) errs.push(`${tool}: ${f}: not in ${tool} format`); continue; }
            if (decompress) {
                if (node.compressed !== s.comp || !f.endsWith(s.ext)) { errs.push(f.endsWith(s.ext) ? `${tool}: ${f}: not in ${tool} format` : `${tool}: ${f}: unknown suffix -- ignored`); continue; }
                const outName = f.slice(0, -s.ext.length);
                const parent = this.fs.getNode(this.fs.getParentPath(f));
                const bn = this.fs.getBasename(outName);
                if (toOut) { out.push(node.content || ''); continue; }
                if (parent.children[bn] && !force) { errs.push(`${tool}: ${outName} already exists; not overwritten`); continue; }
                const cp = Object.assign({}, node);
                delete cp.compressed; cp.size = node.origSize || Math.round((node.size || 0) / this._compRatio(s.comp)); delete cp.origSize;
                parent.children[bn] = cp;
                if (!keep) delete parent.children[this.fs.getBasename(f)];
                if (verbose) out.push(`${f}:\t${Math.round(100 - 100 * (node.size || 1) / cp.size)}.0% -- replaced with ${outName}`);
            } else {
                if (node.compressed) { errs.push(`${tool}: ${f} already has ${s.ext} suffix -- unchanged`); continue; }
                if (f.endsWith(s.ext) && !node.tarEntries) { errs.push(`${tool}: ${f} already has ${s.ext} suffix -- unchanged`); continue; }
                const parent = this.fs.getNode(this.fs.getParentPath(f));
                const outName = this.fs.getBasename(f) + s.ext;
                if (toOut) { out.push('(compressed data)'); continue; }
                if (parent.children[outName] && !force) { errs.push(`${tool}: ${f}${s.ext} already exists; not overwritten`); continue; }
                const cp = Object.assign({}, node);
                cp.origSize = node.size || 0; cp.size = Math.max(40, Math.ceil((node.size || 0) * this._compRatio(s.comp)) + 20); cp.compressed = s.comp;
                parent.children[outName] = cp;
                if (!keep) delete parent.children[this.fs.getBasename(f)];
                if (verbose) out.push(`${f}:\t${Math.round(100 - 100 * cp.size / Math.max(1, cp.origSize))}.0% -- replaced with ${f}${s.ext}`);
            }
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    gzip(args, stdin) { return this._compress('gzip', args, stdin); }
    gunzip(args, stdin) { return this._compress('gzip', ['-d', ...args], stdin); }
    zcat(args, stdin) { return this._compress('gzip', ['-dc', ...args], stdin); }
    bzip2(args, stdin) { return this._compress('bzip2', args, stdin); }
    bunzip2(args, stdin) { return this._compress('bzip2', ['-d', ...args], stdin); }
    bzcat(args, stdin) { return this._compress('bzip2', ['-dc', ...args], stdin); }
    xz(args, stdin) { return this._compress('xz', args, stdin); }
    unxz(args, stdin) { return this._compress('xz', ['-d', ...args], stdin); }
    xzcat(args, stdin) { return this._compress('xz', ['-dc', ...args], stdin); }

    cat(args, stdin = '') {
        let number = false, numberNonBlank = false, showEnds = false, squeeze = false, showTabs = false;
        const files = [];
        for (const a of args) {
            if (a === '-') files.push('-');
            else if (a.startsWith('--')) {
                if (a === '--number') number = true; else if (a === '--number-nonblank') numberNonBlank = true; else if (a === '--show-ends') showEnds = true; else if (a === '--squeeze-blank') squeeze = true; else if (a === '--show-all') { showEnds = true; showTabs = true; }
                else return this._err(`cat: unrecognized option '${a}'\nTry 'cat --help' for more information.`, 1);
            } else if (a.startsWith('-') && a.length > 1) {
                for (const ch of a.slice(1)) { if (ch === 'n') number = true; else if (ch === 'b') numberNonBlank = true; else if (ch === 'E') showEnds = true; else if (ch === 's') squeeze = true; else if (ch === 'T') showTabs = true; else if (ch === 'A') { showEnds = true; showTabs = true; } else if (ch === 'v') { /* ok */ } else return this._err(`cat: invalid option -- '${ch}'\nTry 'cat --help' for more information.`, 1); }
            } else files.push(a);
        }
        let text = '';
        const errs = [];
        const sources = files.length ? files : ['-'];
        for (const f of sources) {
            if (f === '-') {
                if (!stdin && !this.shared.parent._hasStdin) {
                    const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell && window.terminal.getShell();
                    const typed = sh ? sh.takeInput({ mode: 'eof', prompt: '' }) : null;
                    if (typed !== null) { text += typed; continue; }
                }
                text += stdin || '';
                continue;
            }
            const node = this.fs.getNode(f);
            if (!node) { errs.push(`cat: ${f}: No such file or directory`); continue; }
            if (node.type === 'directory') { errs.push(`cat: ${f}: Is a directory`); continue; }
            if (!this.fs.hasPermission(node, 'r')) { errs.push(`cat: ${f}: Permission denied`); continue; }
            text += node.content || '';
            if (node.tarEntries || node.compressed) text = text.replace('(tar archive)', '');
        }
        if (number || numberNonBlank || showEnds || squeeze || showTabs) {
            const endsNl = text.endsWith('\n');
            let lines = text.split('\n'); if (endsNl) lines.pop();
            if (squeeze) lines = lines.filter((l, i) => !(l === '' && lines[i - 1] === ''));
            let n = 0;
            lines = lines.map(l => {
                let o = showTabs ? l.replace(/\t/g, '^I') : l;
                if (showEnds) o += '$';
                if (numberNonBlank ? l !== '' : number) { n++; o = String(n).padStart(6) + '\t' + o; }
                return o;
            });
            text = lines.join('\n') + (endsNl ? '\n' : '');
        }
        return { stdout: text.replace(/\n$/, ''), rawStdout: text, stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    // ===== trivial builtins =====

    true() {
        return { stdout: '', stderr: '', exitCode: 0 };
    }

    false() {
        return { stdout: '', stderr: '', exitCode: 1 };
    }

    sleep(args) {
        if (args.length === 0) return this._err("sleep: missing operand\nTry 'sleep --help' for more information.");
        if (!/^\d+(\.\d+)?[smhd]?$/.test(args[0])) return this._err(`sleep: invalid time interval '${args[0]}'`);
        return { stdout: '', stderr: '', exitCode: 0 };
    }

    // ===== ping =====

    ping(args) {
        const { o, rest } = this._opts(args, 'cwWistI');
        const host = rest[0];
        if (!host) return this._err('ping: usage error: Destination address required', 2);
        let ip = null;
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
            ip = host;
        } else if (host === 'localhost') {
            ip = '127.0.0.1';
        } else {
            const hosts = this.fs.getNode('/etc/hosts');
            for (const line of ((hosts && hosts.content) || '').split('\n')) {
                const cols = line.trim().split(/\s+/);
                if (cols.length > 1 && !line.startsWith('#') && cols.slice(1).includes(host)) ip = cols[0];
            }
            if (!ip && /\./.test(host)) ip = '93.184.216.34';
        }
        if (!ip) return this._err(`ping: ${host}: Name or service not known`, 2);
        let count = 4;
        if (o.c !== undefined && o.c !== true) {
            count = parseInt(o.c, 10);
            if (isNaN(count) || count < 1) return this._err(`ping: invalid argument: '${o.c}'`, 2);
        }
        const label = host === ip ? ip : `${host} (${ip})`;
        const lines = [`PING ${label} 56(84) bytes of data.`];
        const times = [];
        for (let i = 1; i <= count; i++) {
            const t = 0.15 + ((i * 37) % 50) / 100;
            times.push(t);
            lines.push(`64 bytes from ${host === ip ? ip : `${host} (${ip})`}: icmp_seq=${i} ttl=64 time=${t.toFixed(3)} ms`);
        }
        const min = Math.min(...times), max = Math.max(...times), avg = times.reduce((s, x) => s + x, 0) / times.length;
        lines.push('', `--- ${host} ping statistics ---`);
        lines.push(`${count} packets transmitted, ${count} received, 0% packet loss, time ${(count - 1) * 1001}ms`);
        lines.push(`rtt min/avg/max/mdev = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)}/0.052 ms`);
        return this._ok(lines.join('\n'));
    }

    // ===== pagers, small utilities =====

    less(args, stdin = '') {
        return this._pager('less', args, stdin);
    }

    more(args, stdin = '') {
        return this._pager('more', args, stdin);
    }

    // Hands text to the interactive pager when stdout is the terminal; returns null when it should just be printed.
    _tryPage(spec) {
        const t = typeof window !== 'undefined' ? window.terminal : null;
        if (!t || !t.queuePager) return null;
        const sh = t.getShell && t.getShell();
        if (!sh || !sh.interactive || t.commands._stdoutIsPipe) return null;
        return t.queuePager(spec) ? this._ok('') : null;
    }

    _pager(name, args, stdin) {
        const flags = {};
        let initialSearch = null;
        const files = [];
        for (const a of args) {
            if (a.startsWith('+/')) initialSearch = a.slice(2);
            else if (a.startsWith('--')) { if (a === '--line-numbers') flags.N = true; else if (a === '--ignore-case') flags.i = true; else if (a === '--quit-if-one-screen') flags.F = true; else if (a === '--chop-long-lines') flags.S = true; }
            else if (a.startsWith('-') && a.length > 1) for (const ch of a.slice(1)) flags[ch] = true;
            else files.push(a);
        }
        let text, label = '';
        if (files.length === 0) {
            if (!stdin) return this._err(`${name}: missing filename ("${name} --help" for help)`);
            text = stdin;
        } else {
            const out = [];
            for (const f of files) {
                const node = this.fs.getNode(f);
                if (!node) return this._err(`${f}: No such file or directory`);
                if (node.type !== 'file') return this._err(`${f} is a directory`);
                if (!this.fs.hasPermission(node, 'r')) return this._err(`${f}: Permission denied`);
                out.push(node.content || '');
            }
            text = out.join('\n');
            label = files[0];
        }
        const nlines = text.replace(/\n$/, '').split('\n').length;
        // more and less -F print short input directly instead of paging it
        if (nlines <= 23 && (name === 'more' || flags.F)) return this._ok(text);
        return this._tryPage({ kind: name, text, name: label, flags, initialSearch }) || this._ok(text);
    }

    readlink(args) {
        const { o, rest } = this._opts(args);
        if (rest.length === 0) return this._err('readlink: missing operand');
        const node = this.fs.getNode(rest[0]);
        if (!node) return { stdout: '', stderr: '', exitCode: 1 };
        if (node.type === 'symlink') {
            let target = node.target || '';
            if (o.f && !target.startsWith('/')) {
                target = this.fs.resolvePath(this.fs.getParentPath(rest[0]) + '/' + target);
            }
            return this._ok(target);
        }
        if (o.f) return this._ok(this.fs.resolvePath(rest[0]));
        return { stdout: '', stderr: '', exitCode: 1 };
    }

    envCmd(args) {
        const env = this.shared.env;
        if (args.length === 0) {
            return this._ok(Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n'));
        }
        return this._err('env: running commands through env is not supported in the simulator');
    }

    hostnameCmd(args) {
        const parent = this.shared.parent;
        const o = this._opts(args).rest;
        if (o.length === 0) return this._ok(parent.hostname || 'rhcsa-lab');
        if (!this._isRoot()) return this._err('hostname: you must be root to change the host name');
        parent.hostname = o[0];
        this.shared.env.HOSTNAME = o[0];
        return this._ok();
    }

    yum(args, stdin) {
        return this.shared.parent.dnf(args, stdin);
    }

    // ===== process lookup =====

    _procs() {
        return this.shared.processes;
    }

    pgrep(args) {
        const { o, rest } = this._opts(args, 'u');
        const pat = rest[0];
        if (!pat) return this._err('pgrep: no matching criteria specified');
        const hits = this._procs().filter(p => (o.f ? p.command : p.command.split(' ')[0]).includes(pat) && (o.u === undefined || o.u === true || p.user === o.u));
        if (hits.length === 0) return { stdout: '', stderr: '', exitCode: 1 };
        return this._ok(hits.map(p => (o.l ? `${p.pid} ${p.command}` : String(p.pid))).join('\n'));
    }

    pidof(args) {
        const name = args.filter(a => !a.startsWith('-'))[0];
        if (!name) return { stdout: '', stderr: '', exitCode: 1 };
        const hits = this._procs().filter(p => p.command.split(' ')[0] === name);
        if (hits.length === 0) return { stdout: '', stderr: '', exitCode: 1 };
        return this._ok(hits.map(p => p.pid).reverse().join(' '));
    }

    _killByName(cmd, args) {
        const names = args.filter(a => !a.startsWith('-'));
        if (names.length === 0) return this._err(`${cmd}: no process specified`);
        let killed = 0;
        const procs = this._procs();
        for (const name of names) {
            for (let i = procs.length - 1; i >= 0; i--) {
                if (procs[i].command.split(' ')[0] === name && procs[i].pid !== 1) {
                    procs.splice(i, 1);
                    killed++;
                }
            }
        }
        if (killed === 0) {
            return cmd === 'killall' ? this._err(`${names[0]}: no process found`) : { stdout: '', stderr: '', exitCode: 1 };
        }
        return this._ok();
    }

    pkill(args) {
        return this._killByName('pkill', args);
    }

    killall(args) {
        return this._killByName('killall', args);
    }

    // ===== whatis / apropos (tiny built-in database) =====

    _whatisDb() {
        return {
            ls: ['ls', '1', 'list directory contents'], cp: ['cp', '1', 'copy files and directories'],
            mv: ['mv', '1', 'move (rename) files'], rm: ['rm', '1', 'remove files or directories'],
            cat: ['cat', '1', 'concatenate files and print on the standard output'],
            grep: ['grep', '1', 'print lines that match patterns'], find: ['find', '1', 'search for files in a directory hierarchy'],
            tar: ['tar', '1', 'an archiving utility'], chmod: ['chmod', '1', 'change file mode bits'],
            chown: ['chown', '1', 'change file owner and group'], systemctl: ['systemctl', '1', 'Control the systemd system and service manager'],
            passwd: ['passwd', '1', 'update user\'s authentication tokens'], useradd: ['useradd', '8', 'create a new user or update default new user information'],
            usermod: ['usermod', '8', 'modify a user account'], groupadd: ['groupadd', '8', 'create a new group'],
            mount: ['mount', '8', 'mount a filesystem'], umount: ['umount', '8', 'unmount filesystems'],
            dnf: ['dnf', '8', 'DNF Command Reference'], rpm: ['rpm', '8', 'RPM Package Manager'],
            ssh: ['ssh', '1', 'OpenSSH remote login client'], scp: ['scp', '1', 'OpenSSH secure file copy'],
            fstab: ['fstab', '5', 'static information about the filesystems'], passwdfile: ['passwd', '5', 'password file'],
            'firewall-cmd': ['firewall-cmd', '1', 'firewalld command line client'], semanage: ['semanage', '8', 'SELinux Policy Management tool'],
            lvcreate: ['lvcreate', '8', 'Create a logical volume'], vgcreate: ['vgcreate', '8', 'Create a volume group'],
            pvcreate: ['pvcreate', '8', 'Initialize physical volume(s) for use by LVM'], podman: ['podman', '1', 'Simple management tool for pods, containers and images'],
            chronyc: ['chronyc', '1', 'command-line interface for chrony daemon'], crontab: ['crontab', '1', 'maintains crontab files for individual users'],
            nmcli: ['nmcli', '1', 'command-line tool for controlling NetworkManager']
        };
    }

    whatis(args) {
        const names = args.filter(a => !a.startsWith('-'));
        if (names.length === 0) return this._err('whatis what?');
        const db = this._whatisDb();
        const lines = [];
        let missing = false;
        for (const n of names) {
            const e = db[n];
            if (e) lines.push(`${e[0].padEnd(16)}(${e[1]}) - ${e[2]}`);
            else { lines.push(`${n}: nothing appropriate.`); missing = true; }
        }
        return { stdout: lines.join('\n'), stderr: '', exitCode: missing ? 16 : 0 };
    }

    apropos(args) {
        const words = args.filter(a => !a.startsWith('-'));
        if (words.length === 0) return this._err('apropos what?');
        const kw = words[0].toLowerCase();
        const hits = Object.values(this._whatisDb()).filter(e => e[0].toLowerCase().includes(kw) || e[2].toLowerCase().includes(kw));
        if (hits.length === 0) return this._err(`${words[0]}: nothing appropriate.`, 16);
        return this._ok(hits.map(e => `${e[0].padEnd(16)}(${e[1]}) - ${e[2]}`).join('\n'));
    }

    // ===== mkfs family / blkid / fs resize =====

    _mkfs(type, dev, force) {
        const st = this.shared.storage;
        if (!this._isRoot()) return this._err(`mkfs.${type}: cannot open ${dev || ''}: Permission denied`);
        if (!dev) return this._err(`mkfs.${type}: no device specified`);
        if (!/^\/dev\//.test(dev) && !this.fs.getNode(dev)) return this._err(`mkfs.${type}: cannot open ${dev}: No such file or directory`);
        const canon = st ? st.canon(dev) : dev;
        if (/^\/dev\//.test(canon) && !this._deviceExists(canon)) return this._err(`mkfs.${type}: cannot open ${dev}: No such file or directory`);
        if (st && st.stMounts.some(m => m.src === canon)) {
            return this._err(type === 'xfs' ? `mkfs.xfs: ${dev} contains a mounted filesystem\nUsage: mkfs.xfs\n/* blocksize */\t\t[-b size=num]` : `mke2fs: ${dev} is mounted; will not make a filesystem here!`);
        }
        const existing = st ? st.fsInfo(canon) : this.xfsTypes[canon];
        if (existing && !force) {
            if (type === 'xfs') return this._err(`mkfs.xfs: ${dev} appears to contain an existing filesystem (${existing.type}).\nmkfs.xfs: Use the -f option to force overwrite.`);
            if (/^ext|vfat/.test(type)) return { stdout: `${dev} contains a ${existing.type} file system\nProceed anyway? (y,N) `, stderr: '', exitCode: 1 };
        }
        const uuid = this._uuid();
        const fsMiB = st ? st.sizeMiB(canon) : 0;
        this.xfsTypes[canon] = { type, uuid, fsMiB };
        if (type === 'xfs') {
            const blocks = Math.max(1024, Math.floor((fsMiB || 1024) * 256));
            const agcount = fsMiB > 4096 ? 4 : (fsMiB > 1024 ? 4 : 4);
            const agsize = Math.ceil(blocks / agcount);
            return this._ok(`meta-data=${canon.padEnd(22)} isize=512    agcount=${agcount}, agsize=${agsize} blks\n         =                       sectsz=512   attr=2, projid32bit=1\n         =                       crc=1        finobt=1, sparse=1, rmapbt=0\n         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=0\ndata     =                       bsize=4096   blocks=${blocks}, imaxpct=25\n         =                       sunit=0      swidth=0 blks\nnaming   =version 2              bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log           bsize=4096   blocks=${Math.max(1368, Math.floor(blocks / 16))}, version=2\n         =                       sectsz=512   sunit=0 blks, lazy-count=1\nrealtime =none                   extsz=4096   blocks=0, rtextents=0`);
        }
        if (type === 'vfat') return this._ok('mkfs.fat 4.2 (2021-01-31)');
        const blocks4k = Math.floor((fsMiB || 1024) * 256);
        return this._ok(`mke2fs 1.46.5 (30-Dec-2021)\nCreating filesystem with ${blocks4k} 4k blocks and ${Math.floor(blocks4k / 4)} inodes\nFilesystem UUID: ${uuid}\nSuperblock backups stored on blocks: \n\t32768, 98304, 163840, 229376\n\nAllocating group tables: done                            \nWriting inode tables: done                            \nCreating journal (${Math.min(16384, Math.floor(blocks4k / 16))} blocks): done\nWriting superblocks and filesystem accounting information: done\n`);
    }

    mkfs(args) {
        const { o, rest } = this._opts(args, 't', ['type']);
        const type = o.t !== undefined ? o.t : o.type;
        if (type && !['xfs', 'ext4', 'ext3', 'ext2', 'vfat'].includes(type)) return this._err(`mkfs: failed to execute /usr/sbin/mkfs.${type}: No such file or directory`);
        if (!type || type === true) return this._err('mkfs: filesystem type required (use -t TYPE)');
        return this._mkfs(type, rest[rest.length - 1], !!(o.f || o.F));
    }

    'mkfs.xfs'(args) {
        const { o, rest } = this._opts(args, 'bdilnrsLmNp');
        return this._mkfs('xfs', rest[rest.length - 1], !!o.f);
    }

    'mkfs.ext4'(args) {
        const { o, rest } = this._opts(args, 'bcEgiILmNoOtTUdjl'.replace('j', '').replace('l', ''));
        return this._mkfs('ext4', rest[rest.length - 1], !!o.F);
    }

    'mkfs.ext3'(args) {
        const { o, rest } = this._opts(args, 'L');
        return this._mkfs('ext3', rest[rest.length - 1], !!o.F);
    }

    'mkfs.vfat'(args) {
        const { o, rest } = this._opts(args, 'nsSI');
        return this._mkfs('vfat', rest[rest.length - 1], !!o.F);
    }

    blkid(args) {
        const st = this.shared.storage;
        const tags = [];
        let fmt = 'full', byLabel = null, byUuid = null;
        const devs = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-s') tags.push(args[++i]);
            else if (a === '-o') fmt = args[++i];
            else if (a === '-L') byLabel = args[++i];
            else if (a === '-U') byUuid = args[++i];
            else if (a.startsWith('-')) { /* -c, -p, -g... accepted */ }
            else devs.push(a);
        }
        if (!this._isRoot() && !devs.length) return { stdout: '', stderr: '', exitCode: 2 };
        // every device that carries a signature
        const all = [];
        const push = (dev, info) => all.push({ dev, type: info.type, uuid: info.uuid, label: info.label || '' });
        if (st) for (const [dv, info] of Object.entries(st.stBase)) push(dv, info);
        push('/dev/sda2', { type: 'LVM2_member', uuid: 'Zk3r1a-Wq7m-9t2L-pQxN-4vYh-8sDe-Fg5bTc' });
        for (const [dv, info] of Object.entries(this.xfsTypes)) if (!all.some(a => a.dev === dv)) push(dv, info);
        for (const [dv, pv] of Object.entries(this.xlvm.pvs)) if (!all.some(a => a.dev === dv)) push(dv, { type: 'LVM2_member', uuid: pv.uuid.replace(/-/g, '').slice(0, 6) + '-' + pv.uuid.slice(9, 13) + '-' + pv.uuid.slice(14, 18) + '-' + pv.uuid.slice(19, 23) + '-' + pv.uuid.slice(24, 28) + '-' + pv.uuid.slice(28, 32) + '-' + pv.uuid.slice(32, 38) });
        all.sort((a, b) => a.dev.localeCompare(b.dev));
        let sel = all;
        if (byLabel !== null) { sel = all.filter(a => a.label === byLabel); return sel.length ? this._ok(sel[0].dev) : { stdout: '', stderr: '', exitCode: 2 }; }
        if (byUuid !== null) { sel = all.filter(a => a.uuid === byUuid); return sel.length ? this._ok(sel[0].dev) : { stdout: '', stderr: '', exitCode: 2 }; }
        if (devs.length) {
            const wanted = devs.map(d => (st ? st.canon(d) : d));
            sel = all.filter(a => wanted.includes(a.dev));
            if (!sel.length) return { stdout: '', stderr: '', exitCode: 2 };
        }
        const blockSize = (t) => (t === 'xfs' ? '512' : (t === 'ext4' || t === 'ext3' || t === 'ext2' ? '4096' : (t === 'vfat' ? '512' : null)));
        const partInfo = (dev) => {
            const p = st ? st._part(dev) : null;
            if (!p) return null;
            const id = (p.d.id || '').replace(/^0x/, '').toLowerCase();
            return p.d.label === 'gpt' ? { name: p.p.name, uuid: this._uuid() } : { uuid: id + '-' + String(p.p.n).padStart(2, '0') };
        };
        const lines = sel.map(a => {
            const rec = [['LABEL', a.label || null], ['UUID', a.uuid], ['BLOCK_SIZE', blockSize(a.type)], ['TYPE', a.type]];
            const pi = partInfo(a.dev);
            if (pi) { if (pi.name) rec.push(['PARTLABEL', pi.name]); rec.push(['PARTUUID', pi.uuid]); }
            let list = rec.filter(r => r[1]);
            if (tags.length) list = list.filter(r => tags.includes(r[0]));
            return { dev: a.dev, list };
        });
        if (fmt === 'device') return this._ok(lines.map(l => l.dev).join('\n'));
        if (fmt === 'value') return this._ok(lines.flatMap(l => l.list.map(r => r[1])).join('\n'));
        if (fmt === 'export') return this._ok(lines.map(l => ['DEVNAME=' + l.dev, ...l.list.map(r => r[0] + '=' + r[1])].join('\n')).join('\n\n'));
        return this._ok(lines.map(l => l.list.length ? `${l.dev}: ${l.list.map(r => `${r[0]}="${r[1]}"`).join(' ')}` : '').filter(Boolean).join('\n'));
    }

    _growFs(type, target) {
        const st = this.shared.storage;
        let dev = target;
        let mnt = st ? st.stMounts.slice().reverse().find(m => m.tgt === st._normPath(target)) : null;
        if (mnt) dev = mnt.src;
        else dev = st ? st.canon(target) : target;
        const info = this.xfsTypes[dev];
        return { st, dev, mnt, info };
    }

    xfs_growfs(args) {
        if (!this._isRoot()) return this._err('xfs_growfs: Permission denied');
        const target = args.filter(a => !a.startsWith('-'))[0];
        if (!target) return this._err('Usage: xfs_growfs [options] mountpoint');
        const { st, dev, mnt, info } = this._growFs('xfs', target);
        if (!mnt || !info || info.type !== 'xfs') return this._err(`xfs_growfs: ${target} is not a mounted XFS filesystem`);
        const have = info.fsMiB || 0;
        const size = st.sizeMiB(dev);
        const oldB = have * 256, newB = size * 256;
        const agc = 4;
        let out = `meta-data=${dev.padEnd(22)} isize=512    agcount=${agc}, agsize=${Math.ceil(oldB / agc)} blks\n         =                       sectsz=512   attr=2, projid32bit=1\n         =                       crc=1        finobt=1, sparse=1, rmapbt=0\n         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=0\ndata     =                       bsize=4096   blocks=${oldB}, imaxpct=25\n         =                       sunit=0      swidth=0 blks\nnaming   =version 2              bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log           bsize=4096   blocks=${Math.max(1368, Math.floor(oldB / 16))}, version=2\n         =                       sectsz=512   sunit=0 blks, lazy-count=1\nrealtime =none                   extsz=4096   blocks=0, rtextents=0\n`;
        if (newB === oldB) return this._ok(out + 'data size unchanged, skipping');
        info.fsMiB = size;
        return this._ok(out + `data blocks changed from ${oldB} to ${newB}`);
    }

    resize2fs(args) {
        if (!this._isRoot()) return this._err('resize2fs: Permission denied');
        const rest = args.filter(a => !a.startsWith('-'));
        if (!rest[0]) return this._err('Usage: resize2fs [-d debug_flags] [-f] [-F] [-M] [-P] [-p] device [-b|-s|new_size] [-S RAID-stride] [-z undo_file]');
        const { st, dev, mnt, info } = this._growFs('ext4', rest[0]);
        if (!info || !/^ext[234]$/.test(info.type)) return this._err(`resize2fs 1.46.5 (30-Dec-2021)\nresize2fs: Bad magic number in super-block while trying to open ${rest[0]}\nCouldn't find valid filesystem superblock.`);
        const size = st.sizeMiB(dev);
        const have = info.fsMiB || 0;
        if (size === have) return this._err(`resize2fs 1.46.5 (30-Dec-2021)\nThe filesystem is already ${size * 256} (4k) blocks long.  Nothing to do!\n`, 0);
        if (size < have && mnt) return this._err(`resize2fs 1.46.5 (30-Dec-2021)\nFilesystem at ${dev} is mounted on ${mnt.tgt}; on-line resizing required\nresize2fs: On-line shrinking not supported`);
        info.fsMiB = size;
        return this._ok(`resize2fs 1.46.5 (30-Dec-2021)\n${mnt ? `Filesystem at ${dev} is mounted on ${mnt.tgt}; on-line resizing required\nold_desc_blocks = 1, new_desc_blocks = 1\n` : ''}The filesystem on ${dev} is now ${size * 256} (4k) blocks long.\n`);
    }

    // ===== LVM =====

    _sizeToMiB(spec) {
        const m = /^([+-]?)(\d+(?:\.\d+)?)([kKmMgGtT]?)([bB]?)$/.exec(String(spec));
        if (!m) return null;
        const n = parseFloat(m[2]);
        const unit = (m[3] || 'm').toLowerCase();
        const mult = { k: 1 / 1024, m: 1, g: 1024, t: 1048576 }[unit];
        return { sign: m[1], mib: n * mult };
    }

    _fmtSize(mib, unit = null) {
        if (mib >= 1024 * 1024) return (mib / 1048576).toFixed(2) + 't';
        if (mib >= 1024) return (mib / 1024).toFixed(2) + 'g';
        return mib.toFixed(2) + 'm';
    }

    _vgFree(vg) {
        const total = vg.pvs.reduce((s, p) => s + Math.floor(this.xlvm.pvs[p].sizeMiB / vg.peMiB) * vg.peMiB, 0);
        const used = Object.values(this.xlvm.lvs).filter(l => l.vg === vg.name).reduce((s, l) => s + l.sizeMiB, 0);
        return { total, used, free: total - used };
    }

    _lvResolve(ref) {
        if (!ref) return null;
        const key = ref.replace(/^\/dev\/mapper\//, '').replace(/^\/dev\//, '').replace(/^([^/-]+)-([^/]+)$/, '$1/$2');
        return this.xlvm.lvs[key] || null;
    }

    pvcreate(args) {
        const { o, rest } = this._opts(args, 'sMZ', ['dataalignment', 'metadatasize', 'setphysicalvolumesize']);
        if (!this._isRoot()) return this._err('  pvcreate: Permission denied');
        if (rest.length === 0) return this._err('  Please enter a physical volume path.');
        const out = [];
        for (const dev of rest) {
            if (!dev.startsWith('/dev/')) return this._err(`  Device ${dev} not found.`);
            if (!this._deviceExists(dev)) return this._err(`  Device ${dev} not found.`);
            if (this.xlvm.pvs[dev] && !o.f) {
                if (this.xlvm.pvs[dev].vg) return this._err(`  Can't initialize physical volume "${dev}" of volume group "${this.xlvm.pvs[dev].vg}" without -ff`);
            }
            const sizeMiB = this._devSizeMiB(dev);
            this.xlvm.pvs[dev] = { dev, vg: null, sizeMiB, uuid: this._uuid() };
            delete this.xfsTypes[dev];
            out.push(`  Physical volume "${dev}" successfully created.`);
        }
        return this._ok(out.join('\n'));
    }

    pvremove(args) {
        if (!this._isRoot()) return this._err('  pvremove: Permission denied');
        const devs = args.filter(a => !a.startsWith('-'));
        if (devs.length === 0) return this._err('  Please enter a physical volume path.');
        const out = [];
        for (const dev of devs) {
            const pv = this.xlvm.pvs[dev];
            if (!pv) return this._err(`  Failed to find physical volume "${dev}".`);
            if (pv.vg) return this._err(`  PV ${dev} is used by VG ${pv.vg} so please use vgreduce first.\n  (If you are certain you need pvremove, then confirm by using --force twice.)`);
            delete this.xlvm.pvs[dev];
            out.push(`  Labels on physical volume "${dev}" successfully wiped.`);
        }
        return this._ok(out.join('\n'));
    }

    pvs(args) {
        const devs = args.filter(a => !a.startsWith('-'));
        const list = Object.values(this.xlvm.pvs).filter(p => devs.length === 0 || devs.includes(p.dev));
        const base = [{ dev: '/dev/sda2', vg: 'rhel', size: '<19.00g', free: '0 ' }];
        if (devs.length && list.length === 0 && !devs.includes('/dev/sda2')) return this._err(`  Failed to find physical volume "${devs[0]}".`, 5);
        const rows = [];
        if (devs.length === 0 || devs.includes('/dev/sda2')) rows.push(base[0]);
        for (const p of list) {
            const vg = p.vg ? this.xlvm.vgs[p.vg] : null;
            let free = this._fmtSize(p.sizeMiB);
            if (vg) {
                const used = Object.values(this.xlvm.lvs).filter(l => l.vg === vg.name).reduce((s, l) => s + l.sizeMiB, 0);
                free = this._fmtSize(Math.max(0, p.sizeMiB - used)); // approximation: LVs are packed on the first PV
            }
            rows.push({ dev: p.dev, vg: p.vg || '', size: this._fmtSize(p.sizeMiB), free });
        }
        const lines = ['  PV         VG     Fmt  Attr PSize   PFree  '];
        for (const r of rows) lines.push(`  ${r.dev.padEnd(10)} ${r.vg.padEnd(6)} lvm2 a--  ${String(r.size).padStart(7)} ${String(r.free).padStart(6)}`);
        return this._ok(lines.join('\n'));
    }

    pvdisplay(args) {
        const devs = args.filter(a => !a.startsWith('-'));
        const list = Object.values(this.xlvm.pvs).filter(p => devs.length === 0 || devs.includes(p.dev));
        if (devs.length && list.length === 0) return this._err(`  Failed to find physical volume "${devs[0]}".`, 5);
        return this._ok(list.map(p => {
            const vg = p.vg ? this.xlvm.vgs[p.vg] : null;
            const pe = vg ? vg.peMiB : 0;
            const totalPe = pe ? Math.floor(p.sizeMiB / pe) : 0;
            return `  --- ${vg ? 'Physical' : 'NEW Physical'} volume ---\n  PV Name               ${p.dev}\n  VG Name               ${p.vg || ''}\n  PV Size               ${this._fmtSize(p.sizeMiB).replace('g', ' GiB').replace('m', ' MiB')}\n  Allocatable           ${vg ? 'yes' : 'NO'}\n  PE Size               ${pe ? pe.toFixed(2) + ' MiB' : '0   '}\n  Total PE              ${totalPe}\n  Free PE               ${totalPe}\n  Allocated PE          0\n  PV UUID               ${p.uuid}\n`;
        }).join('\n'));
    }

    vgcreate(args) {
        const { o, rest } = this._opts(args, 's', ['physicalextentsize']);
        if (!this._isRoot()) return this._err('  vgcreate: Permission denied');
        if (rest.length < 2) return this._err('  Please provide volume group name and physical volumes');
        const name = rest[0];
        if (this.xlvm.vgs[name] || name === 'rhel') return this._err(`  A volume group called ${name} already exists.`);
        let peMiB = 4;
        const sOpt = o.s !== undefined ? o.s : o.physicalextentsize;
        if (sOpt !== undefined && sOpt !== true) {
            const sz = this._sizeToMiB(sOpt);
            if (!sz) return this._err(`  Invalid argument for --physicalextentsize: ${sOpt}`);
            peMiB = sz.mib;
        }
        const pvs = rest.slice(1);
        for (const dev of pvs) {
            let pv = this.xlvm.pvs[dev];
            if (!pv) {
                // vgcreate initialises unused devices itself
                if (!this._deviceExists(dev)) return this._err(`  Device ${dev} not found.`);
                pv = this.xlvm.pvs[dev] = { dev, vg: null, sizeMiB: this._devSizeMiB(dev), uuid: this._uuid() };
            }
            if (pv.vg) return this._err(`  Physical volume '${dev}' is already in volume group '${pv.vg}'\n  Unable to add physical volume '${dev}' to volume group '${name}'`);
        }
        this.xlvm.vgs[name] = { name, pvs: pvs.slice(), peMiB, uuid: this._uuid() };
        for (const dev of pvs) this.xlvm.pvs[dev].vg = name;
        return this._ok(`  Volume group "${name}" successfully created`);
    }

    vgextend(args) {
        if (!this._isRoot()) return this._err('  vgextend: Permission denied');
        const rest = args.filter(a => !a.startsWith('-'));
        if (rest.length < 2) return this._err('  Please enter volume group name and physical volume(s)');
        const vg = this.xlvm.vgs[rest[0]];
        if (!vg) return this._err(`  Volume group "${rest[0]}" not found`);
        for (const dev of rest.slice(1)) {
            let pv = this.xlvm.pvs[dev];
            if (!pv) {
                if (!this._deviceExists(dev)) return this._err(`  Device ${dev} not found.`);
                pv = this.xlvm.pvs[dev] = { dev, vg: null, sizeMiB: this._devSizeMiB(dev), uuid: this._uuid() };
            }
            if (pv.vg) return this._err(`  Physical volume '${dev}' is already in volume group '${pv.vg}'`);
            pv.vg = vg.name;
            vg.pvs.push(dev);
        }
        return this._ok(`  Volume group "${vg.name}" successfully extended`);
    }

    vgreduce(args) {
        if (!this._isRoot()) return this._err('  vgreduce: Permission denied');
        const rest = args.filter(a => !a.startsWith('-'));
        if (rest.length < 2) return this._err('  Please give volume group name and physical volume paths');
        const vg = this.xlvm.vgs[rest[0]];
        if (!vg) return this._err(`  Volume group "${rest[0]}" not found`);
        for (const dev of rest.slice(1)) {
            if (!vg.pvs.includes(dev)) return this._err(`  Physical Volume "${dev}" not in volume group "${vg.name}"`);
            if (vg.pvs.length === 1) return this._err(`  Can't remove final physical volume "${dev}" from volume group "${vg.name}"`);
            const after = this._vgFree({ ...vg, pvs: vg.pvs.filter(p => p !== dev) });
            if (after.free < 0) return this._err(`  Physical volume "${dev}" still in use`);
            vg.pvs = vg.pvs.filter(p => p !== dev);
            this.xlvm.pvs[dev].vg = null;
        }
        return this._ok(`  Removed "${rest[1]}" from volume group "${vg.name}"`);
    }

    vgremove(args) {
        if (!this._isRoot()) return this._err('  vgremove: Permission denied');
        const name = args.filter(a => !a.startsWith('-'))[0];
        const vg = this.xlvm.vgs[name];
        if (!vg) return this._err(`  Volume group "${name}" not found`);
        if (Object.values(this.xlvm.lvs).some(l => l.vg === name)) return this._err(`  Logical volume ${name}/${Object.values(this.xlvm.lvs).find(l => l.vg === name).name} contains a filesystem in use.`);
        for (const dev of vg.pvs) this.xlvm.pvs[dev].vg = null;
        delete this.xlvm.vgs[name];
        return this._ok(`  Volume group "${name}" successfully removed`);
    }

    vgrename(args) {
        if (!this._isRoot()) return this._err('  vgrename: Permission denied');
        const rest = args.filter(a => !a.startsWith('-'));
        if (rest.length !== 2) return this._err('  Old and new volume group names need specifying');
        const [from, to] = rest.map(r => r.replace(/^\/dev\//, ''));
        const vg = this.xlvm.vgs[from];
        if (!vg) return this._err(`  Volume group "${from}" not found`);
        if (this.xlvm.vgs[to]) return this._err(`  New volume group path exists: /dev/${to}`);
        vg.name = to;
        this.xlvm.vgs[to] = vg;
        delete this.xlvm.vgs[from];
        for (const dev of vg.pvs) this.xlvm.pvs[dev].vg = to;
        for (const [key, lv] of Object.entries(this.xlvm.lvs)) {
            if (lv.vg === from) {
                delete this.xlvm.lvs[key];
                lv.vg = to;
                lv.path = `/dev/${to}/${lv.name}`;
                lv.mapper = `/dev/mapper/${to}-${lv.name}`;
                this.xlvm.lvs[`${to}/${lv.name}`] = lv;
            }
        }
        return this._ok(`  Volume group "${from}" successfully renamed to "${to}"`);
    }

    vgs(args) {
        const names = args.filter(a => !a.startsWith('-'));
        const rows = [];
        if (names.length === 0 || names.includes('rhel')) rows.push({ name: 'rhel', npv: 1, nlv: 2, vsize: '<19.00g', vfree: '0 ' });
        for (const vg of Object.values(this.xlvm.vgs)) {
            if (names.length && !names.includes(vg.name)) continue;
            const f = this._vgFree(vg);
            rows.push({ name: vg.name, npv: vg.pvs.length, nlv: Object.values(this.xlvm.lvs).filter(l => l.vg === vg.name).length, vsize: this._fmtSize(f.total), vfree: this._fmtSize(f.free) });
        }
        if (names.length && rows.length === 0) return this._err(`  Volume group "${names[0]}" not found`, 5);
        const lines = ['  VG     #PV #LV #SN Attr   VSize   VFree  '];
        for (const r of rows) lines.push(`  ${r.name.padEnd(6)} ${String(r.npv).padStart(3)} ${String(r.nlv).padStart(3)}   0 wz--n- ${String(r.vsize).padStart(7)} ${String(r.vfree).padStart(6)}`);
        return this._ok(lines.join('\n'));
    }

    vgdisplay(args) {
        const names = args.filter(a => !a.startsWith('-'));
        const list = Object.values(this.xlvm.vgs).filter(v => names.length === 0 || names.includes(v.name));
        if (names.length && list.length === 0) return this._err(`  Volume group "${names[0]}" not found`, 5);
        return this._ok(list.map(vg => {
            const f = this._vgFree(vg);
            const lvCount = Object.values(this.xlvm.lvs).filter(l => l.vg === vg.name).length;
            return `  --- Volume group ---\n  VG Name               ${vg.name}\n  System ID             \n  Format                lvm2\n  Metadata Areas        ${vg.pvs.length}\n  Metadata Sequence No  1\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                ${lvCount}\n  Open LV               0\n  Max PV                0\n  Cur PV                ${vg.pvs.length}\n  Act PV                ${vg.pvs.length}\n  VG Size               ${this._fmtSize(f.total).replace('g', ' GiB').replace('m', ' MiB')}\n  PE Size               ${vg.peMiB.toFixed(2)} MiB\n  Total PE              ${Math.floor(f.total / vg.peMiB)}\n  Alloc PE / Size       ${Math.floor(f.used / vg.peMiB)} / ${this._fmtSize(f.used)}\n  Free  PE / Size       ${Math.floor(f.free / vg.peMiB)} / ${this._fmtSize(f.free)}\n  VG UUID               ${vg.uuid}\n`;
        }).join('\n'));
    }

    lvcreate(args) {
        const { o, rest } = this._opts(args, 'LlnsiI', ['size', 'extents', 'name']);
        if (!this._isRoot()) return this._err('  lvcreate: Permission denied');
        const vgName = (rest[0] || '').replace(/^\/dev\//, '');
        const lName = o.n !== undefined ? o.n : o.name;
        const sizeSpec = o.L !== undefined ? o.L : o.size;
        const extSpec = o.l !== undefined ? o.l : o.extents;
        if (!vgName) return this._err('  Please specify a logical volume to act on.\n  Please provide a volume group name');
        const vg = this.xlvm.vgs[vgName];
        if (!vg) return this._err(`  Volume group "${vgName}" not found\n  Cannot process volume group ${vgName}`);
        if (!lName || lName === true) return this._err('  Logical volume name is required (-n).');
        if (this.xlvm.lvs[`${vgName}/${lName}`]) return this._err(`  Logical Volume "${lName}" already exists in volume group "${vgName}"`);
        const f = this._vgFree(vg);
        let mib;
        if (sizeSpec !== undefined && sizeSpec !== true) {
            const sz = this._sizeToMiB(sizeSpec);
            if (!sz) return this._err(`  Invalid argument for --size: ${sizeSpec}`);
            mib = sz.mib;
        } else if (extSpec !== undefined && extSpec !== true) {
            const m = /^(\d+)%(FREE|VG|PVS)$/i.exec(extSpec);
            if (m) {
                const pct = parseInt(m[1], 10) / 100;
                mib = (m[2].toUpperCase() === 'FREE' ? f.free : f.total) * pct;
            } else if (/^\d+$/.test(extSpec)) {
                mib = parseInt(extSpec, 10) * vg.peMiB;
            } else {
                return this._err(`  Invalid argument for --extents: ${extSpec}`);
            }
        } else {
            return this._err('  Please specify either size or extents but not both.');
        }
        mib = Math.ceil(mib / vg.peMiB) * vg.peMiB;
        if (mib <= 0) return this._err('  Volume size 0 is invalid.');
        if (mib > f.free + 0.0001) return this._err(`  Volume group "${vgName}" has insufficient free space (${Math.floor(f.free / vg.peMiB)} extents): ${Math.ceil(mib / vg.peMiB)} required.`);
        this.xlvm.lvs[`${vgName}/${lName}`] = {
            name: lName, vg: vgName, sizeMiB: mib, uuid: this._uuid(),
            path: `/dev/${vgName}/${lName}`, mapper: `/dev/mapper/${vgName}-${lName}`
        };
        this._ensureDevNodes(vgName, lName);
        return this._ok(`  Logical volume "${lName}" created.`);
    }

    // Make /dev/<vg>/<lv> and /dev/mapper/<vg>-<lv> resolvable so mkfs, mount and ls work on them
    _ensureDevNodes(vg, lv) {
        const dev = this.fs.getNode('/dev');
        if (!dev || !dev.children) return;
        if (!dev.children[vg]) {
            dev.children[vg] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 100, modified: new Date(), children: {} };
        }
        dev.children[vg].children[lv] = { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '', device: true };
        if (!dev.children.mapper) {
            dev.children.mapper = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 100, modified: new Date(), children: {} };
        }
        dev.children.mapper.children[`${vg}-${lv}`] = { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '', device: true };
    }

    _removeDevNodes(vg, lv) {
        const dev = this.fs.getNode('/dev');
        if (!dev || !dev.children) return;
        if (dev.children[vg] && dev.children[vg].children) delete dev.children[vg].children[lv];
        if (dev.children.mapper && dev.children.mapper.children) delete dev.children.mapper.children[`${vg}-${lv}`];
    }

    lvextend(args) {
        const { o, rest } = this._opts(args, 'Llr'.replace('r', ''), ['size', 'extents']);
        if (!this._isRoot()) return this._err('  lvextend: Permission denied');
        const lv = this._lvResolve(rest[0]);
        if (!rest[0]) return this._err('  Please provide logical volume path.');
        if (!lv) return this._err(`  Failed to find logical volume "${rest[0].replace(/^\/dev\//, '')}"`);
        const vg = this.xlvm.vgs[lv.vg];
        const f = this._vgFree(vg);
        const sizeSpec = o.L !== undefined ? o.L : o.size;
        const extSpec = o.l !== undefined ? o.l : o.extents;
        let target;
        if (sizeSpec !== undefined && sizeSpec !== true) {
            const sz = this._sizeToMiB(sizeSpec);
            if (!sz) return this._err(`  Invalid argument for --size: ${sizeSpec}`);
            target = sz.sign === '+' ? lv.sizeMiB + sz.mib : sz.mib;
        } else if (extSpec !== undefined && extSpec !== true) {
            const m = /^([+]?)(\d+)%(FREE|VG)$/i.exec(extSpec);
            if (m) {
                const add = (m[3].toUpperCase() === 'FREE' ? f.free : f.total) * parseInt(m[2], 10) / 100;
                target = m[1] === '+' ? lv.sizeMiB + add : add;
            } else if (/^\+?\d+$/.test(extSpec)) {
                const n = parseInt(extSpec.replace('+', ''), 10) * vg.peMiB;
                target = extSpec.startsWith('+') ? lv.sizeMiB + n : n;
            } else {
                return this._err(`  Invalid argument for --extents: ${extSpec}`);
            }
        } else {
            return this._err('  Please specify either size or extents.');
        }
        target = Math.ceil(target / vg.peMiB) * vg.peMiB;
        if (target < lv.sizeMiB) return this._err('  New size (' + target + ') is less than current; use lvreduce.');
        if (target === lv.sizeMiB) return this._err(`  New size (${Math.floor(target / vg.peMiB)} extents) matches existing size (${Math.floor(target / vg.peMiB)} extents).\n  Run \`lvextend --help' for more information.`, 5);
        if (target - lv.sizeMiB > f.free + 0.0001) return this._err(`  Insufficient free space: ${Math.ceil((target - lv.sizeMiB) / vg.peMiB)} extents needed, but only ${Math.floor(f.free / vg.peMiB)} available`);
        const old = lv.sizeMiB;
        lv.sizeMiB = target;
        let out = `  Size of logical volume ${lv.vg}/${lv.name} changed from ${this._fmtSize(old)} (${Math.floor(old / vg.peMiB)} extents) to ${this._fmtSize(target)} (${Math.floor(target / vg.peMiB)} extents).\n  Logical volume ${lv.vg}/${lv.name} successfully resized.`;
        if (o.r || o.resizefs) {
            const info = this.xfsTypes[lv.mapper] || this.xfsTypes[lv.path];
            const st = this.shared.storage;
            if (info && st) {
                const mnt = st.stMounts.find(m => m.src === lv.mapper);
                const res = info.type === 'xfs' ? (mnt ? this.xfs_growfs([mnt.tgt]) : null) : this.resize2fs([lv.mapper]);
                if (info.type === 'xfs' && !mnt) info.fsMiB = lv.sizeMiB;
                out += info.type === 'xfs' ? '\n  xfs_growfs ' + (mnt ? mnt.tgt : lv.mapper) : '\n  resize2fs ' + lv.mapper;
                if (res && res.stdout) out += '\n' + res.stdout;
            } else {
                out += '\n  fsadm: Filesystem resize not possible: no filesystem found on ' + lv.path;
            }
        }
        return this._ok(out);
    }

    lvremove(args) {
        if (!this._isRoot()) return this._err('  lvremove: Permission denied');
        const refs = args.filter(a => !a.startsWith('-'));
        if (refs.length === 0) return this._err('  Please enter logical volume path(s)');
        const out = [];
        for (const r of refs) {
            const lv = this._lvResolve(r);
            if (!lv) return this._err(`  Failed to find logical volume "${r.replace(/^\/dev\//, '')}"`);
            if (this.shared.storage && this.shared.storage.stMounts.some(m => m.src === lv.mapper)) return this._err(`  Logical volume ${lv.vg}/${lv.name} contains a filesystem in use.`);
            delete this.xlvm.lvs[`${lv.vg}/${lv.name}`];
            this._removeDevNodes(lv.vg, lv.name);
            delete this.xfsTypes[lv.path];
            delete this.xfsTypes[lv.mapper];
            out.push(`  Logical volume "${lv.name}" successfully removed.`);
        }
        return this._ok(out.join('\n'));
    }

    lvrename(args) {
        if (!this._isRoot()) return this._err('  lvrename: Permission denied');
        const rest = args.filter(a => !a.startsWith('-'));
        let vgName, from, to;
        if (rest.length === 3) {
            [vgName, from, to] = rest;
        } else if (rest.length === 2) {
            const r = rest[0].replace(/^\/dev\//, '').split('/');
            vgName = r[0];
            from = r[1];
            to = rest[1].replace(/^\/dev\//, '').split('/').pop();
        } else {
            return this._err('  Old and new logical volume names required.');
        }
        const lv = this.xlvm.lvs[`${vgName}/${from}`];
        if (!lv) return this._err(`  Failed to find logical volume "${vgName}/${from}"`);
        if (this.xlvm.lvs[`${vgName}/${to}`]) return this._err(`  New logical volume path exists: ${vgName}/${to}`);
        delete this.xlvm.lvs[`${vgName}/${from}`];
        this._removeDevNodes(vgName, from);
        lv.name = to;
        lv.path = `/dev/${vgName}/${to}`;
        lv.mapper = `/dev/mapper/${vgName}-${to}`;
        this.xlvm.lvs[`${vgName}/${to}`] = lv;
        this._ensureDevNodes(vgName, to);
        return this._ok(`  Renamed "${from}" to "${to}" in volume group "${vgName}"`);
    }

    lvs(args) {
        const refs = args.filter(a => !a.startsWith('-'));
        let list = Object.values(this.xlvm.lvs);
        if (refs.length) {
            list = refs.map(r => this._lvResolve(r)).filter(Boolean);
            if (list.length === 0) {
                const vgs = refs.map(r => r.replace(/^\/dev\//, ''));
                list = Object.values(this.xlvm.lvs).filter(l => vgs.includes(l.vg));
                if (list.length === 0 && !vgs.some(v => this.xlvm.vgs[v] || v === 'rhel')) return this._err(`  Failed to find logical volume "${vgs[0]}"`, 5);
            }
        }
        const rows = [];
        if (refs.length === 0 || refs.includes('rhel')) {
            rows.push({ name: 'root', vg: 'rhel', size: '<17.00g' }, { name: 'swap', vg: 'rhel', size: '2.00g' });
        }
        for (const l of list) rows.push({ name: l.name, vg: l.vg, size: this._fmtSize(l.sizeMiB) });
        const lines = ['  LV    VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert'];
        for (const r of rows) lines.push(`  ${r.name.padEnd(5)} ${r.vg.padEnd(6)} -wi-ao---- ${String(r.size).padStart(7)}`);
        return this._ok(lines.join('\n'));
    }

    lvdisplay(args) {
        const refs = args.filter(a => !a.startsWith('-'));
        let list = Object.values(this.xlvm.lvs);
        if (refs.length) {
            list = refs.map(r => this._lvResolve(r)).filter(Boolean);
            if (list.length === 0) return this._err(`  Failed to find logical volume "${refs[0].replace(/^\/dev\//, '')}"`, 5);
        }
        return this._ok(list.map(l => {
            const vg = this.xlvm.vgs[l.vg];
            return `  --- Logical volume ---\n  LV Path                ${l.path}\n  LV Name                ${l.name}\n  VG Name                ${l.vg}\n  LV UUID                ${l.uuid}\n  LV Write Access        read/write\n  LV Status              available\n  # open                 0\n  LV Size                ${this._fmtSize(l.sizeMiB).replace('g', ' GiB').replace('m', ' MiB')}\n  Current LE             ${Math.floor(l.sizeMiB / vg.peMiB)}\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  Block device           253:2\n`;
        }).join('\n'));
    }

    // ===== firewall-cmd =====

    _fw() {
        if (!this.xfw) {
            const mk = () => ({ services: ['cockpit', 'dhcpv6-client', 'ssh'], ports: [] });
            this.xfw = {
                running: true,
                defaultZone: 'public',
                runtime: { public: mk(), block: { services: [], ports: [] }, dmz: { services: ['ssh'], ports: [] }, drop: { services: [], ports: [] }, external: { services: ['ssh'], ports: [] }, home: { services: ['cockpit', 'dhcpv6-client', 'mdns', 'samba-client', 'ssh'], ports: [] }, internal: { services: ['cockpit', 'dhcpv6-client', 'mdns', 'samba-client', 'ssh'], ports: [] }, trusted: { services: [], ports: [] }, work: { services: ['cockpit', 'dhcpv6-client', 'ssh'], ports: [] } },
                permanent: null
            };
            this.xfw.permanent = JSON.parse(JSON.stringify(this.xfw.runtime));
            this.xfw.permDefault = 'public';
        }
        return this.xfw;
    }

    'firewall-cmd'(args) {
        const fw = this._fw();
        const fsvc = this.shared.services && this.shared.services.firewalld;
        fw.running = !fsvc || !!fsvc.active;
        if (!fw.running && !args.includes('--version') && !args.includes('--state')) return this._err('FirewallD is not running', 252);
        const knownServices = ['amanda-client', 'cockpit', 'dhcp', 'dhcpv6', 'dhcpv6-client', 'dns', 'ftp', 'http', 'https', 'imap', 'imaps', 'kerberos', 'ldap', 'ldaps', 'mdns', 'mountd', 'mysql', 'nfs', 'nfs3', 'ntp', 'pop3', 'pop3s', 'postgresql', 'rpc-bind', 'samba', 'samba-client', 'smtp', 'smtps', 'snmp', 'ssh', 'syslog', 'telnet', 'tftp', 'vnc-server', 'wireguard'];
        if (!this._isRoot() && !args.includes('--state') && !args.includes('--version')) {
            return this._err('Authorization failed.\n    Make sure polkit agent is running or run the application as superuser.', 1);
        }
        if (args.length === 0) return this._err('usage: see firewall-cmd man page\nfirewall-cmd: error: no options specified', 2);

        const permanent = args.includes('--permanent');
        const zoneArg = args.find(a => a.startsWith('--zone='));
        const zoneIdx = args.indexOf('--zone');
        let zone = zoneArg ? zoneArg.slice(7) : (zoneIdx >= 0 ? args[zoneIdx + 1] : null);
        const explicitZone = !!zone;
        const store = permanent ? fw.permanent : fw.runtime;
        if (!zone) zone = permanent ? fw.permDefault : fw.defaultZone;

        const need = () => (store[zone] ? null : this._err(`Error: INVALID_ZONE: ${zone}`, 101));
        const opt = (name) => {
            const eq = args.find(a => a.startsWith(name + '='));
            if (eq) return eq.slice(name.length + 1);
            const i = args.indexOf(name);
            return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
        };
        const has = (name) => args.includes(name) || args.some(a => a.startsWith(name + '='));
        const fmtWords = (list) => list.slice().sort().join(' ');

        if (has('--version')) return this._ok('1.2.5');
        if (has('--state')) return fw.running ? this._ok('running') : this._err('not running', 252);
        if (has('--reload') || has('--complete-reload')) {
            fw.runtime = JSON.parse(JSON.stringify(fw.permanent));
            fw.defaultZone = fw.permDefault;
            return this._ok('success');
        }
        if (has('--runtime-to-permanent')) {
            fw.permanent = JSON.parse(JSON.stringify(fw.runtime));
            fw.permDefault = fw.defaultZone;
            return this._ok('success');
        }
        if (has('--get-default-zone')) return this._ok(fw.defaultZone);
        if (has('--set-default-zone')) {
            const z = opt('--set-default-zone');
            if (!z || !fw.runtime[z]) return this._err(`Error: INVALID_ZONE: ${z || ''}`, 101);
            fw.defaultZone = z;
            fw.permDefault = z;
            return this._ok('success');
        }
        if (has('--get-zones')) return this._ok(Object.keys(fw.runtime).join(' '));
        if (has('--get-services')) return this._ok(knownServices.join(' '));
        if (has('--get-active-zones')) return this._ok(`${fw.defaultZone}\n  interfaces: eth0`);
        if (has('--list-all-zones')) {
            return this._ok(Object.keys(store).map(z => this._fwZoneText(z, store[z], z === fw.defaultZone)).join('\n\n'));
        }

        let e = need();
        if (e) return e;
        const z = store[zone];

        if (has('--list-all')) return this._ok(this._fwZoneText(zone, z, zone === fw.defaultZone && !explicitZone || zone === fw.defaultZone));
        if (has('--list-services')) return this._ok(fmtWords(z.services));
        if (has('--list-ports')) return this._ok(z.ports.join(' '));

        const svcOps = [['--add-service', 'add'], ['--remove-service', 'remove'], ['--query-service', 'query']];
        for (const [flag, kind] of svcOps) {
            if (!has(flag)) continue;
            const svc = opt(flag);
            if (!svc) return this._err(`usage: see firewall-cmd man page\nfirewall-cmd: error: argument ${flag}: expected one argument`, 2);
            if (!knownServices.includes(svc)) return this._err(`Error: INVALID_SERVICE: '${svc}' not among existing services`, 101);
            const present = z.services.includes(svc);
            if (kind === 'query') return { stdout: present ? 'yes' : 'no', stderr: '', exitCode: present ? 0 : 1 };
            if (kind === 'add') {
                if (present) return this._ok(`Warning: ALREADY_ENABLED: '${svc}' already in '${zone}'\nsuccess`);
                z.services.push(svc);
                return this._ok('success');
            }
            if (!present) return this._ok(`Warning: NOT_ENABLED: '${svc}' not in '${zone}'\nsuccess`);
            z.services = z.services.filter(s => s !== svc);
            return this._ok('success');
        }
        const portOps = [['--add-port', 'add'], ['--remove-port', 'remove'], ['--query-port', 'query']];
        for (const [flag, kind] of portOps) {
            if (!has(flag)) continue;
            const port = opt(flag);
            if (!port) return this._err(`usage: see firewall-cmd man page\nfirewall-cmd: error: argument ${flag}: expected one argument`, 2);
            if (!/^\d+(-\d+)?\/(tcp|udp|sctp|dccp)$/.test(port)) return this._err(`Error: INVALID_PORT: ${port}`, 101);
            const present = z.ports.includes(port);
            if (kind === 'query') return { stdout: present ? 'yes' : 'no', stderr: '', exitCode: present ? 0 : 1 };
            if (kind === 'add') {
                if (present) return this._ok(`Warning: ALREADY_ENABLED: ${port}:${port.split('/')[1]}\nsuccess`);
                z.ports.push(port);
                return this._ok('success');
            }
            if (!present) return this._ok(`Warning: NOT_ENABLED: ${port}\nsuccess`);
            z.ports = z.ports.filter(p => p !== port);
            return this._ok('success');
        }
        return this._err('usage: see firewall-cmd man page\nfirewall-cmd: error: unrecognized or unsupported option in the simulator', 2);
    }

    _fwZoneText(name, z, active) {
        const hasIface = name === this._fw().defaultZone;
        return `${name}${active ? ' (active)' : ''}\n  target: default\n  icmp-block-inversion: no\n  interfaces: ${hasIface ? 'eth0' : ''}\n  sources: \n  services: ${z.services.slice().sort().join(' ')}\n  ports: ${z.ports.join(' ')}\n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules: \n`.replace(/\n$/, '');
    }
}

// Export for the aggregator in commands.js
if (typeof window !== 'undefined') {
    window.ExtraCommands = ExtraCommands;
}
