// Storage state: partitions (parted/fdisk), filesystems, mounts, df, findmnt, lsblk, swap, free
// Part of Red Cat RHCSA Terminal Simulator
//
// One shared state drives all of these commands, so that for example
// "parted mkpart" -> "mkfs.xfs" -> "mount" -> "df -h" -> "umount" behave like a real system.

class StorageCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.storage = this;

        const GiB = 1024 * 1024 * 1024;
        // Disks: size in bytes; partition tables keyed by disk path
        this.stDisks = {
            '/dev/sda': { size: 20 * GiB, model: 'Virtual disk', label: 'dos', id: '0x4f1b9c2d', parts: [
                { n: 1, startS: 2048, endS: 2099199, type: 'primary', flags: new Set(['boot']), code: '83', fsHint: 'xfs' },
                { n: 2, startS: 2099200, endS: 41943039, type: 'primary', flags: new Set(['lvm']), code: '8e', fsHint: null }
            ] },
            '/dev/sdb': { size: 10 * GiB, model: 'Virtual disk', label: null, id: null, parts: [] },
            '/dev/sdc': { size: 5 * GiB, model: 'Virtual disk', label: null, id: null, parts: [] },
            '/dev/sdd': { size: 5 * GiB, model: 'Virtual disk', label: null, id: null, parts: [] }
        };

        // Mounted filesystems (order = mount order)
        const xfsRoot = 'rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota';
        this.stMounts = [
            { src: 'sysfs', tgt: '/sys', type: 'sysfs', opts: 'rw,nosuid,nodev,noexec,relatime,seclabel' },
            { src: 'proc', tgt: '/proc', type: 'proc', opts: 'rw,nosuid,nodev,noexec,relatime' },
            { src: 'devtmpfs', tgt: '/dev', type: 'devtmpfs', opts: 'rw,nosuid,seclabel,size=4096k,nr_inodes=226688,mode=755,inode64' },
            { src: 'securityfs', tgt: '/sys/kernel/security', type: 'securityfs', opts: 'rw,nosuid,nodev,noexec,relatime' },
            { src: 'tmpfs', tgt: '/dev/shm', type: 'tmpfs', opts: 'rw,nosuid,nodev,seclabel,inode64' },
            { src: 'devpts', tgt: '/dev/pts', type: 'devpts', opts: 'rw,nosuid,noexec,relatime,seclabel,gid=5,mode=620,ptmxmode=000' },
            { src: 'tmpfs', tgt: '/run', type: 'tmpfs', opts: 'rw,nosuid,nodev,seclabel,size=374916k,nr_inodes=819200,mode=755,inode64' },
            { src: 'cgroup2', tgt: '/sys/fs/cgroup', type: 'cgroup2', opts: 'rw,nosuid,nodev,noexec,relatime,seclabel,nsdelegate,memory_recursiveprot' },
            { src: 'selinuxfs', tgt: '/sys/fs/selinux', type: 'selinuxfs', opts: 'rw,nosuid,noexec,relatime' },
            { src: '/dev/mapper/rhel-root', tgt: '/', type: 'xfs', opts: xfsRoot },
            { src: '/dev/sda1', tgt: '/boot', type: 'xfs', opts: 'rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota' },
            { src: 'tmpfs', tgt: '/run/user/0', type: 'tmpfs', opts: 'rw,nosuid,nodev,relatime,seclabel,size=187456k,nr_inodes=46864,mode=700,inode64' }
        ];

        // Filesystems known from the start (rhel-root is an LV, sda1 a plain partition)
        const x = () => sharedState.extra;
        this.stBase = {
            '/dev/mapper/rhel-root': { type: 'xfs', uuid: '3e1f0a52-8d47-4c19-b6a0-5f2d9c8e7b13', sizeMiB: 17 * 1024 - 1024 + 1024 - 1, usedMiB: 4300 },
            '/dev/sda1': { type: 'xfs', uuid: '7c6d5e0a-3f0b-4a3e-9d1a-2b8f4e5c6a71', sizeMiB: 1014, usedMiB: 234 },
            '/dev/mapper/rhel-swap': { type: 'swap', uuid: 'b9a7c3d1-2e4f-4a86-8c05-1d3e5f7a9b02', sizeMiB: 2048, usedMiB: 0 }
        };
        this.stSwaps = [{ name: '/dev/dm-1', dev: '/dev/mapper/rhel-swap', type: 'partition', sizeMiB: 2048, prio: -2 }];
        this._stFstabFix();
        this._stSyncProc();
    }

    // ===== helpers =====

    _x() { return this.shared.extra; }

    _stFstabFix() {
        const node = this.fs.getNode('/etc/fstab');
        if (!node) return;
        node.content = '\n#\n# /etc/fstab\n# Created by anaconda on Mon Oct 19 09:41:12 2026\n#\n# Accessible filesystems, by reference, are maintained under \'/dev/disk/\'.\n# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info.\n#\n# After editing this file, run \'systemctl daemon-reload\' to update systemd\n# units generated from this file.\n#\n/dev/mapper/rhel-root   /                       xfs     defaults        0 0\nUUID=7c6d5e0a-3f0b-4a3e-9d1a-2b8f4e5c6a71 /boot                   xfs     defaults        0 0\n/dev/mapper/rhel-swap   none                    swap    defaults        0 0\n';
        node.size = node.content.length;
    }

    _stSyncProc() {
        const mk = (path, content) => {
            const n = this.fs.getNode(path);
            if (n && n.type === 'file') { n.content = content; n.size = content.length; }
        };
        mk('/proc/mounts', this.stMounts.map(m => `${m.src} ${m.tgt} ${m.type} ${m.opts} 0 0`).join('\n') + '\n');
        mk('/proc/swaps', 'Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n' +
            this.stSwaps.map(s => `${s.name.padEnd(40)}${s.type.padEnd(16)}${String(s.sizeMiB * 1024).padEnd(16)}0\t\t${s.prio}`).join('\n') + '\n');
    }

    // Canonical block device name: LVs always as /dev/mapper/vg-lv
    canon(dev) {
        const lvs = this._x() ? this._x().xlvm.lvs : {};
        const m = /^\/dev\/([^/]+)\/([^/]+)$/.exec(dev);
        if (m && lvs[`${m[1]}/${m[2]}`]) return `/dev/mapper/${m[1]}-${m[2]}`;
        return dev;
    }

    _lvByDev(dev) {
        const lvs = this._x() ? this._x().xlvm.lvs : {};
        return Object.values(lvs).find(l => l.mapper === dev || l.path === dev) || null;
    }

    _part(dev) {
        const m = /^(\/dev\/[a-z]+)(\d+)$/.exec(dev);
        if (!m) return null;
        const d = this.stDisks[m[1]];
        if (!d) return null;
        const p = d.parts.find(x => x.n === parseInt(m[2], 10));
        return p ? { disk: m[1], d, p } : null;
    }

    deviceExists(dev) {
        dev = this.canon(dev);
        if (this.stDisks[dev]) return true;
        if (this._part(dev)) return true;
        if (this._lvByDev(dev)) return true;
        if (this.stBase[dev]) return true;
        return false;
    }

    sizeMiB(dev) {
        dev = this.canon(dev);
        if (this.stDisks[dev]) return Math.floor(this.stDisks[dev].size / 1048576);
        const p = this._part(dev);
        if (p) return Math.floor((p.p.endS - p.p.startS + 1) * 512 / 1048576);
        const lv = this._lvByDev(dev);
        if (lv) return lv.sizeMiB;
        if (this.stBase[dev]) return this.stBase[dev].sizeMiB;
        return 0;
    }

    fsInfo(dev) {
        dev = this.canon(dev);
        if (this.stBase[dev]) return this.stBase[dev];
        const x = this._x();
        return x ? x.xfsTypes[dev] || null : null;
    }

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _root() { return this.fs.currentUid === 0; }

    _hum(mib) {
        // df/lsblk style: IEC units, one decimal below 10
        const kb = mib * 1024;
        return this._humKiB(kb);
    }

    _humKiB(kb) {
        const units = ['K', 'M', 'G', 'T'];
        let v = kb;
        let i = 0;
        while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
        if (i === 0) return `${Math.ceil(v)}${units[i]}`;
        const r = v < 10 ? Math.ceil(v * 10) / 10 : Math.ceil(v);
        return `${r % 1 === 0 && v >= 10 ? r : r.toFixed(v < 10 ? 1 : 0)}${units[i]}`.replace(/\.0(?=[KMGT])/, '.0');
    }

    // lsblk style (no ceil, trailing .0 dropped)
    _lsSize(mib) {
        if (mib >= 1024 * 1024) return `${+(mib / 1048576).toFixed(1)}T`;
        if (mib >= 1024) return `${+(mib / 1024).toFixed(1)}G`;
        return `${+mib.toFixed(0)}M`;
    }

    _decUnit(bytes) {
        const units = ['B', 'kB', 'MB', 'GB', 'TB'];
        let v = bytes;
        let i = 0;
        while (v >= 10000 && i < units.length - 1) { v /= 1000; i++; }
        const s = v >= 100 ? String(Math.round(v)) : String(+v.toPrecision(3));
        return `${s}${units[i]}`;
    }

    // ===== partition tables =====

    _freeN(d) {
        const used = new Set(d.parts.map(p => p.n));
        for (let n = 1; n < 128; n++) if (!used.has(n)) return n;
        return null;
    }

    _syncDevNodes() {
        const dev = this.fs.getNode('/dev');
        if (!dev || !dev.children) return;
        for (const name of Object.keys(dev.children)) {
            if (/^sd[a-z]\d+$/.test(name) && !this._part('/dev/' + name)) delete dev.children[name];
        }
        for (const [disk, d] of Object.entries(this.stDisks)) {
            for (const p of d.parts) {
                const nm = (disk + p.n).replace('/dev/', '');
                if (!dev.children[nm]) {
                    dev.children[nm] = { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '', device: true };
                }
            }
        }
    }

    _parseLoc(text, d, isEnd, startS) {
        // returns sector (start) or exclusive-end sector
        const total = d.size / 512;
        let m = /^(-?\d+(?:\.\d+)?)(%|s|B|kB|KB|MB|GB|TB|KiB|MiB|GiB|TiB|K|M|G|T)?$/.exec(text);
        if (!m) return null;
        let n = parseFloat(m[1]);
        const u = m[2] || 'MiB';
        if (u === '%') return Math.floor(total * n / 100);
        const mult = { s: 512, B: 1, kB: 1000, KB: 1000, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776 }[u];
        if (n < 0) return total + Math.floor(n * mult / 512);
        return Math.round(n * mult / 512);
    }

    parted(args) {
        const opts = args.filter(a => a.startsWith('-') && a.length > 1);
        const script = opts.includes('-s') || opts.includes('--script');
        const rest = args.filter(a => !(a.startsWith('-') && a.length > 1));
        const listMode = opts.includes('-l') || opts.includes('--list');
        if (!this._root()) return this._err('Error: Could not stat device ' + (rest[0] || '') + ' - Permission denied.', 1);
        if (listMode) {
            const out = Object.keys(this.stDisks).map(dv => this._partedPrint(dv)).join('\n\n');
            return this._ok(out);
        }
        let dev = rest[0];
        if (!dev) return this._err('Error: No device found', 1);
        if (!this.stDisks[dev]) {
            if (/^\/dev\//.test(dev)) return this._err(`Error: Could not stat device ${dev} - No such file or directory.`, 1);
            return this._err('Error: Could not stat device ' + dev + ' - No such file or directory.', 1);
        }
        const d = this.stDisks[dev];
        let cmds = rest.slice(1);
        if (cmds.length === 0) {
            return this._ok(`GNU Parted 3.5\nUsing ${dev}\nWelcome to GNU Parted! Type 'help' to view a list of commands.\n(parted) \n(interactive mode is not available in this terminal: pass the commands as arguments, e.g. parted ${dev} mklabel gpt)`);
        }
        const out = [];
        const err = [];
        let i = 0;
        const need = (k) => cmds.slice(i + 1, i + 1 + k);
        while (i < cmds.length) {
            const c = cmds[i];
            if (c === 'print' || c === 'p') {
                const arg = cmds[i + 1] && ['free', 'all', 'devices', 'list'].includes(cmds[i + 1]) ? cmds[i + 1] : null;
                out.push(this._partedPrint(dev, arg === 'free')); i += arg ? 2 : 1; continue;
            }
            if (c === 'mklabel' || c === 'mktable') {
                const t = cmds[i + 1];
                if (!['gpt', 'msdos', 'dos'].includes(t)) { err.push(`Error: Expecting a disk label type.`); break; }
                if (d.parts.length && !script) {
                    out.push(`Warning: The existing disk label on ${dev} will be destroyed and all data on this disk will be lost. Do you want to continue?\nYes/No? Yes`);
                }
                for (const p of d.parts) { const nm = dev + p.n; const x = this._x(); if (x) delete x.xfsTypes[nm]; }
                d.label = t === 'gpt' ? 'gpt' : 'msdos';
                d.id = d.label === 'gpt' ? this._x()._uuid().toUpperCase() : '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
                d.parts = [];
                this._syncDevNodes();
                i += 2; continue;
            }
            if (c === 'mkpart') {
                if (!d.label) { err.push('Error: /dev/' + dev.replace('/dev/', '') + ': unrecognised disk label'); break; }
                // msdos: mkpart TYPE [FSTYPE] START END ; gpt: mkpart NAME [FSTYPE] START END
                const a = cmds.slice(i + 1);
                const isLoc = (s) => /^-?\d+(\.\d+)?(%|s|B|kB|KB|MB|GB|TB|KiB|MiB|GiB|TiB|K|M|G|T)?$/.test(s);
                let k = 0;
                const words = [];
                while (k < a.length && !isLoc(a[k])) { words.push(a[k]); k++; }
                const locs = [];
                while (k < a.length && isLoc(a[k]) && locs.length < 2) { locs.push(a[k]); k++; }
                if (locs.length < 2) { err.push('Error: Expecting start and end locations'); break; }
                let ptype = 'primary';
                let name = '';
                let fsHint = null;
                if (d.label === 'msdos') {
                    if (words[0] && ['primary', 'extended', 'logical'].includes(words[0])) { ptype = words.shift(); }
                    else if (words.length) { err.push(`Error: Expecting a partition type.`); break; }
                    fsHint = words[0] || null;
                } else {
                    if (words.length >= 2) { name = words[0]; fsHint = words[1]; }
                    else if (words.length === 1) { name = words[0]; }
                    if (ptype === 'primary' && name === 'primary') name = '';
                }
                let startS = this._parseLoc(locs[0], d, false);
                let endS = this._parseLoc(locs[1], d, true);
                if (startS === 0 || (/^0%$/.test(locs[0]))) startS = 2048;
                if (/^100%$/.test(locs[1])) endS = d.size / 512 - (d.label === 'gpt' ? 33 : 0);
                const total = d.size / 512;
                if (startS >= total || endS > total) { err.push(`Error: The location ${locs[1]} is outside of the device ${dev}.`); break; }
                if (endS <= startS) { err.push('Error: Can\'t have a partition outside the disk!'); break; }
                // end given as exclusive boundary -> last sector
                const lastS = endS - 1;
                if (d.parts.some(p => !(lastS < p.startS || startS > p.endS) && p.type !== 'extended') && !(ptype === 'logical')) {
                    err.push('Error: Can\'t have overlapping partitions.'); break;
                }
                if (d.label === 'msdos' && ptype !== 'logical' && d.parts.filter(p => p.type !== 'logical').length >= 4) {
                    err.push('Error: Too many primary partitions.'); break;
                }
                const n = ptype === 'logical' ? Math.max(5, ...d.parts.filter(p => p.n >= 5).map(p => p.n + 1), 5) : this._freeN(d);
                d.parts.push({ n, startS, endS: lastS, type: ptype, name, flags: new Set(), code: ptype === 'extended' ? '5' : '83', fsHint });
                d.parts.sort((p, q) => p.n - q.n);
                this._syncDevNodes();
                i += 1 + words.length + (d.label === 'msdos' && ['primary', 'extended', 'logical'].includes(ptype) ? 1 : 0) + 2 - (d.label === 'msdos' ? 0 : 0);
                // recompute index robustly: consume all consumed tokens
                i = cmds.indexOf('mkpart', i - 1 - words.length - 3 < 0 ? 0 : i - 1 - words.length - 3) + 1 + k;
                continue;
            }
            if (c === 'rm') {
                const n = parseInt(cmds[i + 1], 10);
                const idx = d.parts.findIndex(p => p.n === n);
                if (idx < 0) { err.push(`Error: Partition doesn't exist.`); break; }
                const x = this._x();
                const nm = dev + n;
                if (this.stMounts.some(m => m.src === nm)) { err.push(`Error: Partition ${nm} is being used. You must unmount it before you modify it with Parted.`); break; }
                d.parts.splice(idx, 1);
                if (x) delete x.xfsTypes[nm];
                this._syncDevNodes();
                i += 2; continue;
            }
            if (c === 'set') {
                const n = parseInt(cmds[i + 1], 10);
                const flag = cmds[i + 2];
                const state = cmds[i + 3];
                const p = d.parts.find(q => q.n === n);
                if (!p) { err.push(`Error: Partition doesn't exist.`); break; }
                const valid = ['boot', 'lvm', 'raid', 'swap', 'esp', 'bios_grub', 'legacy_boot', 'msftdata', 'hidden', 'diag', 'irst', 'root', 'prep'];
                if (!valid.includes(flag)) { err.push(`Error: Invalid flag: ${flag}`); break; }
                if (state === 'on') p.flags.add(flag); else if (state === 'off') p.flags.delete(flag); else { err.push('Error: Expecting a state (on/off)'); break; }
                if (flag === 'lvm') p.code = state === 'on' ? '8e' : '83';
                if (flag === 'swap') p.code = state === 'on' ? '82' : '83';
                if (flag === 'esp') p.code = state === 'on' ? 'ef' : '83';
                i += 4; continue;
            }
            if (c === 'name') {
                const n = parseInt(cmds[i + 1], 10);
                const p = d.parts.find(q => q.n === n);
                if (!p) { err.push(`Error: Partition doesn't exist.`); break; }
                if (d.label !== 'gpt') { err.push('Error: Partition names not supported on msdos labels'); break; }
                p.name = cmds[i + 2] || ''; i += 3; continue;
            }
            if (c === 'align-check') {
                const n = parseInt(cmds[i + 2], 10);
                const p = d.parts.find(q => q.n === n);
                if (!p) { err.push(`Error: Partition doesn't exist.`); break; }
                if (p.startS % 2048 === 0) out.push(`${n} aligned`); else { out.push(`${n} not aligned`); }
                i += 3; continue;
            }
            if (c === 'unit' || c === 'u') { i += 2; continue; }
            if (c === 'quit' || c === 'q') { i++; continue; }
            if (c === 'resizepart') {
                const n = parseInt(cmds[i + 1], 10);
                const p = d.parts.find(q => q.n === n);
                if (!p) { err.push(`Error: Partition doesn't exist.`); break; }
                const e = this._parseLoc(cmds[i + 2], d, true);
                if (e === null || e > d.size / 512) { err.push(`Error: The location ${cmds[i + 2]} is outside of the device ${dev}.`); break; }
                p.endS = e - 1; i += 3; continue;
            }
            err.push(`Error: Expecting a command (e.g. print, mklabel, mkpart, rm, set): ${c}`);
            break;
        }
        if (!err.length && out.length === 0) {
            return this._ok(!script && cmds.some(c => ['mkpart', 'rm'].includes(c)) ? 'Information: You may need to update /etc/fstab.\n' : '');
        }
        const info = !err.length && cmds.some(c => ['mkpart', 'rm'].includes(c)) && !script ? '\nInformation: You may need to update /etc/fstab.\n' : '';
        return { stdout: out.join('\n') + info, stderr: err.join('\n'), exitCode: err.length ? 1 : 0 };
    }

    _partedPrint(dev, withFree = false) {
        const d = this.stDisks[dev];
        const lines = [
            `Model: ${d.model === 'Virtual disk' ? 'VMware Virtual disk' : d.model} (scsi)`,
            `Disk ${dev}: ${this._decUnit(d.size)}`,
            'Sector size (logical/physical): 512B/512B',
            `Partition Table: ${d.label || 'unknown'}`,
            'Disk Flags: ',
            ''
        ];
        if (!d.label) return lines.slice(0, 5).join('\n') + '\n';
        const gpt = d.label === 'gpt';
        lines.push(gpt ? 'Number  Start   End     Size    File system  Name  Flags' : 'Number  Start   End     Size    Type     File system  Flags');
        const rows = [];
        let cursor = 2048;
        const sorted = d.parts.slice().sort((a, b) => a.startS - b.startS);
        const total = d.size / 512;
        const mkRow = (cols) => cols.join('  ');
        for (const p of sorted) {
            if (withFree && p.startS > cursor + 2048) rows.push({ free: true, startS: cursor, endS: p.startS - 1 });
            rows.push(p);
            cursor = p.endS + 1;
        }
        if (withFree && cursor < total - 2048) rows.push({ free: true, startS: cursor, endS: total - 1 });
        const fmt = (p) => {
            const st = this._decUnit(p.startS * 512);
            const en = this._decUnit((p.endS + 1) * 512);
            const sz = this._decUnit((p.endS - p.startS + 1) * 512);
            if (p.free) return `        ${st.padEnd(7)} ${en.padEnd(7)} ${sz.padEnd(7)} Free Space`;
            const x = this._x();
            const info = x ? x.xfsTypes[dev + p.n] : null;
            const fstype = info ? (info.type === 'swap' ? 'linux-swap(v1)' : info.type) : (p.fsHint && p.fsHint !== 'primary' && !this._x().xfsTypes[dev + p.n] ? '' : '');
            const flags = [...p.flags].join(', ');
            if (gpt) return ` ${String(p.n).padEnd(7)}${st.padEnd(8)}${en.padEnd(8)}${sz.padEnd(8)}${(fstype || '').padEnd(13)}${(p.name || '').padEnd(6)}${flags}`;
            return ` ${String(p.n).padEnd(7)}${st.padEnd(8)}${en.padEnd(8)}${sz.padEnd(8)}${p.type.padEnd(9)}${(fstype || '').padEnd(13)}${flags}`;
        };
        for (const r of rows) lines.push(fmt(r));
        lines.push('');
        return lines.join('\n');
    }

    // ---- fdisk: -l and scripted/stdin sessions
    _fdiskList(dev) {
        const d = this.stDisks[dev];
        const total = d.size / 512;
        const gib = d.size / 1073741824;
        const out = [
            `Disk ${dev}: ${+gib.toFixed(0)} GiB, ${d.size} bytes, ${total} sectors`,
            `Disk model: ${d.model}   `,
            'Units: sectors of 1 * 512 = 512 bytes',
            'Sector size (logical/physical): 512 bytes / 512 bytes',
            'I/O size (minimum/optimal): 512 bytes / 512 bytes'
        ];
        if (d.label) {
            out.push(`Disklabel type: ${d.label === 'gpt' ? 'gpt' : 'dos'}`);
            out.push(`Disk identifier: ${d.id}`);
        }
        if (d.parts.length) {
            out.push('');
            const gpt = d.label === 'gpt';
            out.push(gpt ? 'Device       Start      End  Sectors  Size Type' : 'Device     Boot   Start      End  Sectors Size Id Type');
            for (const p of d.parts.slice().sort((a, b) => a.startS - b.startS)) {
                const sec = p.endS - p.startS + 1;
                const size = this._lsSize(sec * 512 / 1048576).replace('M', 'M').replace(/(\d)$/, '$1');
                const tname = this._fdiskType(p, gpt);
                if (gpt) out.push(`${(dev + p.n).padEnd(12)} ${String(p.startS).padStart(7)} ${String(p.endS).padStart(8)} ${String(sec).padStart(8)} ${size.padStart(5)} ${tname}`);
                else out.push(`${(dev + p.n).padEnd(10)} ${p.flags.has('boot') ? '*' : ' '} ${String(p.startS).padStart(8)} ${String(p.endS).padStart(8)} ${String(sec).padStart(8)} ${size.padStart(4)} ${p.code.padStart(2)} ${tname}`);
            }
        }
        return out.join('\n');
    }

    _fdiskType(p, gpt) {
        if (p.type === 'extended') return 'Extended';
        if (p.flags.has('lvm') || p.code === '8e') return 'Linux LVM';
        if (p.flags.has('swap') || p.code === '82') return gpt ? 'Linux swap' : 'Linux swap / Solaris';
        if (p.flags.has('esp') || p.code === 'ef') return 'EFI System';
        if (p.flags.has('raid') || p.code === 'fd') return 'Linux raid autodetect';
        return gpt ? 'Linux filesystem' : 'Linux';
    }

    fdisk(args, stdin = '') {
        const opts = args.filter(a => a.startsWith('-'));
        const rest = args.filter(a => !a.startsWith('-'));
        if (!this._root()) return this._err(`fdisk: cannot open ${rest[0] || '/dev/sda'}: Permission denied`, 1);
        if (opts.includes('-l')) {
            const devs = rest.length ? rest : Object.keys(this.stDisks);
            for (const dv of devs) if (!this.stDisks[dv]) return this._err(`fdisk: cannot open ${dv}: No such file or directory`, 1);
            return this._ok(devs.map(dv => this._fdiskList(dv)).join('\n\n\n'));
        }
        const dev = rest[0];
        if (!dev) return this._err('Usage:\n fdisk [options] <disk>    change partition table\n fdisk [options] -l [<disk>] list partition table(s)', 1);
        const real = this.stDisks[dev];
        if (!real) return this._err(`fdisk: cannot open ${dev}: No such file or directory`, 1);
        const banner = 'Welcome to fdisk (util-linux 2.37.4).\nChanges will remain in memory only, until you decide to write them.\nBe careful before using the write command.\n';
        if (!stdin) return this._ok(banner + '\n(interactive prompts are not available in this terminal; pipe the answers, e.g.\n  printf "n\\np\\n1\\n\\n+1G\\nw\\n" | fdisk ' + dev + ')');

        // work on a copy until "w"
        const d = { ...real, parts: real.parts.map(p => ({ ...p, flags: new Set(p.flags) })) };
        const lines = stdin.split('\n');
        let li = 0;
        const out = [banner];
        const next = () => (li < lines.length ? lines[li++].trim() : null);
        const total = d.size / 512;
        let wrote = false;
        if (!d.label) {
            out.push('Device does not contain a recognized partition table.\nCreated a new DOS disklabel with disk identifier 0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0') + '.\n');
            d.label = 'msdos';
            d.id = '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
        }
        const parseLast = (txt, first) => {
            if (!txt) return total - 1;
            const m = /^\+(\d+)([KMGTP]?)$/i.exec(txt);
            if (m) {
                const mult = { '': 1, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776 }[m[2].toUpperCase()];
                return first + Math.floor(parseInt(m[1], 10) * mult / 512) - 1;
            }
            const sec = /^\d+$/.exec(txt);
            return sec ? parseInt(txt, 10) : null;
        };
        for (;;) {
            out.push('Command (m for help): ');
            const cmd = next();
            if (cmd === null) break;
            if (cmd === '') { continue; }
            if (cmd === 'q') { out.push(''); break; }
            if (cmd === 'm') { out.push('\nHelp:\n\n  DOS (MBR)\n   a   toggle a bootable flag\n   d   delete a partition\n   n   add a new partition\n   p   print the partition table\n   t   change a partition type\n   w   write table to disk and exit\n   q   quit without saving changes\n'); continue; }
            if (cmd === 'p') { out.push(this._fdiskList(dev).replace(/^/, '\n').replace(/\n$/, '') + '\n'); continue; }
            if (cmd === 'g') { d.label = 'gpt'; d.id = this._x()._uuid().toUpperCase(); d.parts = []; out.push('Created a new GPT disklabel (GUID: ' + d.id + ').\n'); continue; }
            if (cmd === 'o') { d.label = 'msdos'; d.id = '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0'); d.parts = []; out.push('Created a new DOS disklabel with disk identifier ' + d.id + '.\n'); continue; }
            if (cmd === 'n') {
                const gpt = d.label === 'gpt';
                let ptype = 'primary';
                if (!gpt) {
                    out.push('Partition type\n   p   primary (' + d.parts.filter(p => p.type !== 'logical' && p.type !== 'extended').length + ' primary, ' + d.parts.filter(p => p.type === 'extended').length + ' extended, ' + (4 - d.parts.filter(p => p.type !== 'logical').length) + ' free)\n   e   extended (container for logical partitions)\nSelect (default p): ');
                    const t = next();
                    if (t === 'e') ptype = 'extended';
                    else if (t === 'l') ptype = 'logical';
                    else if (t && t !== 'p') { out.push('Invalid value.'); continue; }
                }
                const free = this._freeN(d);
                out.push(`Partition number (${free}-${gpt ? 128 : 4}, default ${free}): `);
                const nTxt = next();
                const n = nTxt ? parseInt(nTxt, 10) : free;
                if (!n || d.parts.some(p => p.n === n)) { out.push(`Value out of range.`); continue; }
                const lastEnd = d.parts.reduce((m, p) => Math.max(m, p.endS), 2047);
                const firstDef = d.parts.length ? lastEnd + 1 : 2048;
                out.push(`First sector (${firstDef}-${total - 1}, default ${firstDef}): `);
                const fTxt = next();
                const first = fTxt ? parseInt(fTxt, 10) : firstDef;
                if (isNaN(first) || first < 2048 || first >= total || d.parts.some(p => first >= p.startS && first <= p.endS)) { out.push('Value out of range.'); continue; }
                out.push(`Last sector, +/-sectors or +/-size{K,M,G,T,P} (${first}-${total - 1}, default ${total - 1}): `);
                const lTxt = next();
                const last = parseLast(lTxt, first);
                if (last === null || last < first || last > total - 1) { out.push('Value out of range.'); continue; }
                if (d.parts.some(p => !(last < p.startS || first > p.endS))) { out.push('Value out of range.'); continue; }
                d.parts.push({ n, startS: first, endS: last, type: ptype, name: '', flags: new Set(), code: ptype === 'extended' ? '5' : '83' });
                d.parts.sort((a, b) => a.n - b.n);
                out.push(`\nCreated a new partition ${n} of type '${ptype === 'extended' ? 'Extended' : 'Linux filesystem'}' and of size ${this._lsSize((last - first + 1) * 512 / 1048576).replace(/G$/, ' GiB').replace(/M$/, ' MiB')}.\n`);
                continue;
            }
            if (cmd === 'd') {
                let n;
                if (d.parts.length === 0) { out.push('No partition is defined yet!'); continue; }
                if (d.parts.length === 1) n = d.parts[0].n;
                else { out.push(`Partition number (${d.parts.map(p => p.n).join(', ')}, default ${d.parts[d.parts.length - 1].n}): `); const t = next(); n = t ? parseInt(t, 10) : d.parts[d.parts.length - 1].n; }
                const idx = d.parts.findIndex(p => p.n === n);
                if (idx < 0) { out.push('Selected partition ' + n + ' does not exist.'); continue; }
                d.parts.splice(idx, 1);
                out.push(`Partition ${n} has been deleted.\n`);
                continue;
            }
            if (cmd === 't') {
                if (d.parts.length === 0) { out.push('No partition is defined yet!'); continue; }
                let n;
                if (d.parts.length === 1) n = d.parts[0].n;
                else { out.push(`Partition number (${d.parts.map(p => p.n).join(', ')}, default ${d.parts[d.parts.length - 1].n}): `); const t = next(); n = t ? parseInt(t, 10) : d.parts[d.parts.length - 1].n; }
                const p = d.parts.find(q => q.n === n);
                if (!p) { out.push('Value out of range.'); continue; }
                out.push(d.label === 'gpt' ? 'Partition type or alias (type L to list all): ' : 'Hex code or alias (type L to list all): ');
                const t = (next() || '').toLowerCase();
                const gpt = d.label === 'gpt';
                const map = gpt ? { '31': 'lvm', lvm: 'lvm', '19': 'swap', swap: 'swap', '1': 'esp', uefi: 'esp', '20': 'linux', linux: 'linux' }
                                : { '8e': 'lvm', lvm: 'lvm', '82': 'swap', swap: 'swap', '83': 'linux', linux: 'linux', ef: 'esp', fd: 'raid', raid: 'raid' };
                const kind = map[t];
                if (!kind) { out.push('Type of partition ' + n + ' is unchanged.'); continue; }
                p.flags.delete('lvm'); p.flags.delete('swap'); p.flags.delete('esp'); p.flags.delete('raid');
                if (kind === 'lvm') { p.flags.add('lvm'); p.code = '8e'; }
                else if (kind === 'swap') { p.flags.add('swap'); p.code = '82'; }
                else if (kind === 'esp') { p.flags.add('esp'); p.code = 'ef'; }
                else if (kind === 'raid') { p.flags.add('raid'); p.code = 'fd'; }
                else p.code = '83';
                out.push(`Changed type of partition '${this._fdiskType(p, gpt)}' to '${this._fdiskType(p, gpt)}'.\n`);
                continue;
            }
            if (cmd === 'a') { const n = parseInt(next(), 10); const p = d.parts.find(q => q.n === n) || d.parts[0]; if (p) { if (p.flags.has('boot')) p.flags.delete('boot'); else p.flags.add('boot'); } out.push('The bootable flag on partition ' + (p ? p.n : '') + ' is enabled now.\n'); continue; }
            if (cmd === 'w') {
                // refuse to change partitions that are mounted
                for (const p of real.parts) {
                    if (!d.parts.some(q => q.n === p.n && q.startS === p.startS) && this.stMounts.some(m => m.src === dev + p.n)) {
                        out.push(`\nThe partition table has been altered.\nCalling ioctl() to re-read partition table.\nRe-reading the partition table failed.: Device or resource busy\n\nThe kernel still uses the old table. The new table will be used at the next reboot or after you run partprobe(8) or partx(8).\nSyncing disks.`);
                        wrote = true;
                    }
                }
                real.label = d.label; real.id = d.id; real.parts = d.parts;
                this._syncDevNodes();
                if (!wrote) out.push('\nThe partition table has been altered.\nCalling ioctl() to re-read partition table.\nSyncing disks.');
                wrote = true;
                break;
            }
            out.push(`${cmd}: unknown command`);
        }
        if (!wrote) out.push('Command (m for help): \n(changes were not written: send "w" to save them)');
        return this._ok(out.join('\n'));
    }

    partprobe() {
        if (!this._root()) return this._err('Error: Could not open /dev/sda - Permission denied.', 1);
        this._syncDevNodes();
        return this._ok();
    }

    // ===== fstab / mount =====

    _fstab() {
        const node = this.fs.getNode('/etc/fstab');
        const rows = [];
        const text = (node && node.content) || '';
        text.split('\n').forEach((line, idx) => {
            const t = line.trim();
            if (!t || t.startsWith('#')) return;
            const c = t.split(/\s+/);
            if (c.length < 4) { rows.push({ bad: true, line: idx + 1, text: t }); return; }
            rows.push({ src: c[0], tgt: c[1], type: c[2], opts: c[3], dump: c[4] || '0', pass: c[5] || '0', line: idx + 1 });
        });
        return rows;
    }

    _resolveSrc(src) {
        // UUID= / LABEL= / PARTUUID= to a device
        let m = /^UUID=(.+)$/.exec(src);
        const x = this._x();
        if (m) {
            const want = m[1].replace(/"/g, '');
            for (const [dv, info] of Object.entries(this.stBase)) if (info.uuid === want) return dv;
            for (const [dv, info] of Object.entries(x ? x.xfsTypes : {})) if (info.uuid === want) return dv;
            return null;
        }
        m = /^LABEL=(.+)$/.exec(src);
        if (m) {
            const want = m[1].replace(/"/g, '');
            for (const [dv, info] of Object.entries(x ? x.xfsTypes : {})) if (info.label === want) return dv;
            return null;
        }
        return this.canon(src);
    }

    _optsFor(type, user, bind) {
        const u = (user || '').split(',').filter(Boolean).filter(o => !['defaults', 'remount', 'auto', 'nofail', 'user', 'users', '_netdev', 'noauto', 'bind', 'loop'].includes(o) && !o.startsWith('x-systemd'));
        const has = (o) => u.includes(o);
        const flags = [];
        flags.push(has('ro') ? 'ro' : 'rw');
        if (has('nosuid')) flags.push('nosuid');
        if (has('nodev')) flags.push('nodev');
        if (has('noexec')) flags.push('noexec');
        if (has('sync')) flags.push('sync');
        flags.push(has('noatime') ? 'noatime' : has('nodiratime') ? 'nodiratime' : 'relatime');
        if (type === 'nfs' || type === 'nfs4') {
            const get = (k, d) => { const f = u.find(o => o.startsWith(k + '=')); return f ? f.split('=')[1] : d; };
            const vers = get('vers', get('nfsvers', type === 'nfs4' ? '4.2' : '4.2'));
            return `${flags.join(',')},vers=${vers},rsize=${get('rsize', '262144')},wsize=${get('wsize', '262144')},namlen=255,${has('soft') ? 'soft' : 'hard'},proto=tcp,timeo=${get('timeo', '600')},retrans=2,sec=${get('sec', 'sys')},clientaddr=192.168.1.100,local_lock=none`;
        }
        if (type === 'vfat') return `${flags.join(',')},fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,errors=remount-ro`;
        if (type === 'tmpfs') return `${flags.join(',')},seclabel,inode64`;
        flags.push('seclabel');
        if (type === 'xfs') {
            const q = u.filter(o => ['usrquota', 'grpquota', 'prjquota', 'uquota', 'gquota', 'pquota', 'quota', 'uqnoenforce', 'gqnoenforce'].includes(o));
            const norm = { uquota: 'usrquota', gquota: 'grpquota', pquota: 'prjquota', quota: 'usrquota' };
            flags.push('attr2', 'inode64', 'logbufs=8', 'logbsize=32k');
            flags.push(q.length ? q.map(o => norm[o] || o).join(',') : 'noquota');
            return flags.join(',');
        }
        if (type === 'ext4' || type === 'ext3' || type === 'ext2') {
            const extra = u.filter(o => ['usrquota', 'grpquota', 'acl', 'discard', 'nobarrier'].includes(o));
            return [...flags, ...extra].join(',');
        }
        return flags.join(',');
    }

    _isMountedAt(tgt) { return this.stMounts.filter(m => m.tgt === tgt); }

    mount(args) {
        const optsList = [];
        let type = null;
        let all = false;
        let readonly = false, bind = false, showLabels = false, verbose = false, fake = false;
        const operands = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-t' || a === '--types') type = args[++i];
            else if (a.startsWith('--types=')) type = a.slice(8);
            else if (a === '-o' || a === '--options') optsList.push(args[++i] || '');
            else if (a.startsWith('--options=')) optsList.push(a.slice(10));
            else if (a === '-a' || a === '--all') all = true;
            else if (a === '-r' || a === '--read-only') readonly = true;
            else if (a === '-w' || a === '--rw') { /* default */ }
            else if (a === '--bind' || a === '-B') bind = true;
            else if (a === '-l') showLabels = true;
            else if (a === '-v') verbose = true;
            else if (a === '-f' || a === '--fake') fake = true;
            else if (a === '-n' || a === '--no-mtab') { /* ignore */ }
            else if (a === '-L' || a === '--label') operands.push('LABEL=' + args[++i]);
            else if (a === '-U' || a === '--uuid') operands.push('UUID=' + args[++i]);
            else if (a.startsWith('-') && a.length > 1 && !a.startsWith('--')) {
                // clustered short flags like -ro / -av
                for (const ch of a.slice(1)) {
                    if (ch === 'a') all = true; else if (ch === 'r') readonly = true; else if (ch === 'v') verbose = true; else if (ch === 'l') showLabels = true; else if (ch === 'f') fake = true; else if (ch === 'w' || ch === 'n') { /* ignore */ }
                    else return this._err(`mount: invalid option -- '${ch}'`, 1);
                }
            } else operands.push(a);
        }
        const optStr = optsList.join(',') + (readonly ? ',ro' : '');
        const optArr = optStr.split(',').filter(Boolean);

        if (operands.length === 0 && !all) {
            const lines = this.stMounts.filter(m => !type || type.split(',').includes(m.type)).map(m => `${m.src} on ${m.tgt} type ${m.type} (${m.opts})${showLabels && this._labelOf(m.src) ? ` [${this._labelOf(m.src)}]` : ''}`);
            return this._ok(lines.join('\n'));
        }
        if (!this._root()) {
            return this._err(operands.length === 1 ? `mount: ${operands[0]}: can't find in /etc/fstab.` : `mount: ${operands[1] || operands[0]}: must be superuser to use mount.`, operands.length === 1 ? 1 : 32);
        }
        if (all) return this._mountAll(type, fake);

        // remount
        if (optArr.includes('remount')) {
            const target = operands[operands.length - 1];
            const m = this.stMounts.slice().reverse().find(x => x.tgt === this._normPath(target) || x.src === this.canon(target));
            if (!m) return this._err(`mount: ${target}: mount point not mounted or bad option.\n       dmesg(1) may have more information after failed mount system call.`, 32);
            const cur = new Set(m.opts.split(','));
            if (optArr.includes('ro')) { cur.delete('rw'); cur.add('ro'); }
            if (optArr.includes('rw')) { cur.delete('ro'); cur.add('rw'); }
            const list = [...cur];
            if (list.includes('ro') && list.includes('rw')) list.splice(list.indexOf('rw'), 1);
            if (optArr.includes('noatime')) { const k = list.indexOf('relatime'); if (k >= 0) list[k] = 'noatime'; }
            for (const o of optArr) if (['nosuid', 'nodev', 'noexec', 'sync'].includes(o) && !list.includes(o)) list.splice(1, 0, o);
            // ro/rw first
            const rwFirst = list.filter(o => o === 'ro' || o === 'rw').concat(list.filter(o => o !== 'ro' && o !== 'rw'));
            m.opts = rwFirst.join(',');
            this._stSyncProc();
            return this._ok();
        }

        // one operand: look it up in fstab
        if (operands.length === 1 && !bind) {
            const want = operands[0];
            const row = this._fstab().find(r => !r.bad && (r.tgt === this._normPath(want) || r.src === want || this._resolveSrc(r.src) === this.canon(want)));
            if (!row) return this._err(`mount: ${want}: can't find in /etc/fstab.`, 1);
            return this._mountOne(this._resolveSrc(row.src) || row.src, row.tgt, type || row.type, (row.opts + ',' + optStr).split(','), row.src);
        }
        if (operands.length !== 2) return this._err('mount: bad usage\nTry \'mount --help\' for more information.', 32);
        let [dev, tgt] = operands;
        if (bind) return this._mountBind(dev, tgt);
        let real = /^(UUID|LABEL)=/.test(dev) ? this._resolveSrc(dev) : dev;
        if (!real) return this._err(`mount: ${tgt}: special device ${dev} does not exist.`, 32);
        return this._mountOne(real, tgt, type, optArr, dev, verbose);
    }

    _labelOf(dev) {
        const info = this.fsInfo(dev);
        return info && info.label ? info.label : '';
    }

    _normPath(p) {
        if (!p) return p;
        const r = this.fs.resolvePath(p);
        return r === '' ? '/' : r.replace(/\/+$/, '') || '/';
    }

    _mountAll(typeFilter, fake) {
        const errs = [];
        let code = 0;
        for (const r of this._fstab()) {
            if (r.bad) continue;
            const o = r.opts.split(',');
            if (o.includes('noauto') || r.type === 'swap' || r.tgt === 'none' || r.type === 'ignore') continue;
            if (typeFilter && !typeFilter.split(',').includes(r.type)) continue;
            if (this.stMounts.some(m => m.tgt === this._normPath(r.tgt) && (m.src === this._resolveSrc(r.src) || m.src === r.src))) continue;
            const src = this._resolveSrc(r.src) || r.src;
            const res = this._mountOne(src, r.tgt, r.type, o, r.src);
            if (res.exitCode) {
                if (o.includes('nofail') && /special device|does not exist/.test(res.stderr)) continue;
                errs.push(res.stderr); code = 32;
            }
        }
        return { stdout: '', stderr: errs.join('\n'), exitCode: code };
    }

    _mountBind(src, tgt) {
        const s = this._normPath(src), t = this._normPath(tgt);
        const sn = this.fs.getNode(s), tn = this.fs.getNode(t);
        if (!sn) return this._err(`mount: ${tgt}: mount point does not exist.`, 32);
        if (!tn) return this._err(`mount: ${tgt}: mount point does not exist.`, 32);
        const parent = this.stMounts.slice().reverse().find(m => s === m.tgt || s.startsWith(m.tgt === '/' ? '/' : m.tgt + '/'));
        this.stMounts.push({ src: parent ? parent.src : 'none', tgt: t, type: parent ? parent.type : 'none', opts: parent ? parent.opts : 'rw', bindOf: s });
        this._stSyncProc();
        return this._ok();
    }

    _mountOne(dev, tgtRaw, typeIn, optArr, shownDev, verbose) {
        const tgt = this._normPath(tgtRaw);
        const node = this.fs.getNode(tgtRaw);
        const isNfs = /^[^/\s]+:\/.*$/.test(dev) || typeIn === 'nfs' || typeIn === 'nfs4';
        const userOpts = optArr.filter(Boolean);
        if (!node || node.type !== 'directory') {
            return this._err(`mount: ${tgtRaw}: mount point does not exist.`, 32);
        }
        if (isNfs) {
            const m = /^([^:]+):(\/.*)$/.exec(dev);
            if (!m) return this._err(`mount.nfs: remote share not in 'host:dir' format`, 32);
            const host = m[1];
            if (!this._resolves(host)) return this._err(`mount.nfs: Failed to resolve server ${host}: Name or service not known`, 32);
            if (this.stMounts.some(x => x.src === dev && x.tgt === tgt)) return this._err(`mount.nfs: ${tgt} is already mounted or busy`, 32);
            const t = typeIn === 'nfs4' ? 'nfs4' : 'nfs4';
            const real = typeIn === 'nfs' ? 'nfs4' : (typeIn || 'nfs4');
            let opts = this._optsFor('nfs', userOpts.join(','));
            this.stMounts.push({ src: dev, tgt, type: real, opts: opts + `,addr=${this._ipOf(host)}` });
            this._stSyncProc();
            return this._ok();
        }
        if (dev === '/dev/sr0' || dev === '/dev/cdrom' || dev === '/dev/dvd') {
            if (this.stMounts.some(m => m.src === '/dev/sr0' && m.tgt === tgt)) return this._err(`mount: ${tgt}: /dev/sr0 already mounted on ${tgt}.`, 32);
            if (typeIn && typeIn !== 'auto' && typeIn !== 'iso9660' && typeIn !== 'udf') return this._err(`mount: ${tgt}: wrong fs type, bad option, bad superblock on /dev/sr0, missing codepage or helper program, or other error.`, 32);
            this.stMounts.push({ src: '/dev/sr0', tgt, type: 'iso9660', opts: 'ro,relatime,nojoliet,check=s,map=n,blocksize=2048,iocharset=utf8' });
            this._isoAttach(tgt);
            this._stSyncProc();
            return { stdout: '', stderr: `mount: ${tgt}: WARNING: source write-protected, mounted read-only.`, exitCode: 0 };
        }
        dev = this.canon(dev);
        if (typeIn === 'tmpfs') {
            this.stMounts.push({ src: 'tmpfs', tgt, type: 'tmpfs', opts: this._optsFor('tmpfs', userOpts.join(',')), size: userOpts.find(o => o.startsWith('size=')) });
            this._stSyncProc();
            return this._ok();
        }
        if (!/^\/dev\//.test(dev) && !this.fs.getNode(dev)) {
            return this._err(`mount: ${tgtRaw}: special device ${shownDev || dev} does not exist.`, 32);
        }
        if (!this.deviceExists(dev) && /^\/dev\//.test(dev)) return this._err(`mount: ${tgtRaw}: special device ${shownDev || dev} does not exist.`, 32);
        const info = this.fsInfo(dev);
        const bad = `mount: ${tgt}: wrong fs type, bad option, bad superblock on ${dev}, missing codepage or helper program, or other error.`;
        if (!info) return this._err(bad, 32);
        if (info.type === 'swap') return this._err(`mount: ${tgt}: unknown filesystem type 'swap'.`, 32);
        if (typeIn && typeIn !== 'auto' && typeIn !== info.type && !(typeIn === 'ext4' && info.type === 'ext3')) return this._err(bad, 32);
        const dupe = this.stMounts.find(m => m.src === dev && m.tgt === tgt);
        if (dupe) return this._err(`mount: ${tgt}: ${dev} already mounted on ${tgt}.`, 32);
        const elsewhere = this.stMounts.find(m => m.src === dev && m.tgt !== tgt);
        if (elsewhere && info.type === 'xfs' && !userOpts.includes('nouuid')) {
            return this._err(`mount: ${tgt}: wrong fs type, bad option, bad superblock on ${dev}, missing codepage or helper program, or other error.\n       dmesg(1) may have more information after failed mount system call.`, 32);
        }
        const opts = this._optsFor(info.type, userOpts.join(','));
        this.stMounts.push({ src: dev, tgt, type: info.type, opts });
        this._stSyncProc();
        if (verbose) return this._ok(`mount: ${dev} mounted on ${tgt}.`);
        return this._ok();
    }

    _resolves(host) {
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
        if (host === 'localhost') return true;
        const hosts = this.fs.getNode('/etc/hosts');
        const text = (hosts && hosts.content) || '';
        if (text.split('\n').some(l => !l.startsWith('#') && l.trim().split(/\s+/).slice(1).includes(host))) return true;
        return /\./.test(host) && /\.(example\.com|example\.org|lab|local|test)$/.test(host);
    }

    _ipOf(host) {
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
        if (host === 'localhost') return '127.0.0.1';
        const hosts = this.fs.getNode('/etc/hosts');
        for (const l of ((hosts && hosts.content) || '').split('\n')) {
            const c = l.trim().split(/\s+/);
            if (!l.startsWith('#') && c.slice(1).includes(host)) return c[0];
        }
        return '192.168.1.10';
    }

    umount(args) {
        const flags = args.filter(a => a.startsWith('-')).join('');
        const rest = args.filter(a => !a.startsWith('-'));
        if (!this._root()) return this._err(`umount: ${rest[0] || ''}: must be superuser to unmount.`, 32);
        if (flags.includes('a')) {
            const out = [];
            for (let i = this.stMounts.length - 1; i >= 0; i--) {
                const m = this.stMounts[i];
                if (/^(sysfs|proc|devtmpfs|securityfs|devpts|cgroup2|selinuxfs)$/.test(m.type) || ['/', '/run', '/dev/shm', '/run/user/0'].includes(m.tgt)) continue;
                if (this._busy(m.tgt)) { out.push(`umount: ${m.tgt}: target is busy.`); continue; }
                this._isoDetach(m);
                this.stMounts.splice(i, 1);
            }
            this._stSyncProc();
            return { stdout: '', stderr: out.join('\n'), exitCode: out.length ? 32 : 0 };
        }
        if (rest.length === 0) return this._err('umount: bad usage\nTry \'umount --help\' for more information.', 2);
        const errs = [];
        for (const r of rest) {
            const t = this._normPath(r);
            let idx = -1;
            for (let i = this.stMounts.length - 1; i >= 0; i--) {
                if (this.stMounts[i].tgt === t || this.stMounts[i].src === this.canon(r) || this.stMounts[i].src === r) { idx = i; break; }
            }
            if (idx < 0) { errs.push(`umount: ${r}: not mounted.`); continue; }
            const m = this.stMounts[idx];
            if (m.tgt === '/' || (!flags.includes('l') && this._busy(m.tgt)) || this.stMounts.some((x, j) => j !== idx && x.tgt.startsWith(m.tgt === '/' ? '//' : m.tgt + '/'))) {
                errs.push(m.type.startsWith('nfs') ? `umount.nfs4: ${m.tgt}: device is busy` : `umount: ${m.tgt}: target is busy.`);
                continue;
            }
            this._isoDetach(m);
            this.stMounts.splice(idx, 1);
        }
        this._stSyncProc();
        return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 32 : 0 };
    }

    // /dev/sr0: the installation DVD (BaseOS and AppStream repositories)
    _isoAttach(tgt) {
        const dir = this.fs.getNode(tgt);
        if (!dir || dir.type !== 'directory') return;
        dir.isoSaved = dir.children;
        const mk = (type, extra) => Object.assign({ type, permissions: type === 'directory' ? '0555' : '0444', owner: 'root', group: 'root', size: type === 'directory' ? 2048 : 0, modified: new Date() }, extra);
        const file = (content) => mk('file', { content, size: content.length });
        const repo = () => mk('directory', { children: { repodata: mk('directory', { children: { 'repomd.xml': file('<?xml version="1.0" encoding="UTF-8"?>\n<repomd xmlns="http://linux.duke.edu/metadata/repo"></repomd>\n') } }), Packages: mk('directory', { children: {} }) } });
        dir.children = {
            AppStream: repo(), BaseOS: repo(),
            EFI: mk('directory', { children: {} }), images: mk('directory', { children: {} }), isolinux: mk('directory', { children: {} }),
            '.discinfo': file('1698796800.000000\nRed Hat Enterprise Linux 9.3\nx86_64\n'),
            '.treeinfo': file('[general]\nfamily = Red Hat Enterprise Linux\nversion = 9.3\narch = x86_64\n'),
            media: file('[InstallMedia]\nname=Red Hat Enterprise Linux 9.3\n'),
            'media.repo': file('[InstallMedia]\nname=Red Hat Enterprise Linux 9.3\nmediaid=1698796800.000000\nmetadata_expire=-1\ngpgcheck=0\ncost=500\n'),
            'RPM-GPG-KEY-redhat-release': file('-----BEGIN PGP PUBLIC KEY BLOCK-----\n-----END PGP PUBLIC KEY BLOCK-----\n'),
            EULA: file('Red Hat Enterprise Linux End User License Agreement\n'), GPL: file('GNU GENERAL PUBLIC LICENSE Version 2\n')
        };
    }

    _isoDetach(m) {
        if (!m || (m.src !== '/dev/sr0' && !m.populated)) return;
        const dir = this.fs.getNode(m.tgt);
        if (dir && dir.isoSaved !== undefined) { dir.children = dir.isoSaved; delete dir.isoSaved; }
    }

    _busy(tgt) {
        const cwd = this.fs.currentPath;
        return cwd === tgt || cwd.startsWith(tgt === '/' ? '//' : tgt + '/');
    }

    // ===== df =====

    _usage(m) {
        // returns { sizeKiB, usedKiB } for a mount entry
        const T = m.type;
        if (T === 'tmpfs') {
            const size = m.tgt === '/dev/shm' ? 1873700 : (m.tgt === '/run' ? 749664 : (m.tgt === '/run/user/0' ? 374832 : 1873700));
            const sz = m.size ? this._sizeOpt(m.size.split('=')[1]) : size;
            const used = m.tgt === '/run' ? 8704 : 0;
            return { sizeKiB: sz, usedKiB: used };
        }
        if (T === 'devtmpfs') return { sizeKiB: 4096 * 1, usedKiB: 0, big: 1873700 };
        if (/^nfs/.test(T)) return { sizeKiB: 52428800, usedKiB: 2202009 };
        const info = m.src && this.stBase[m.src];
        if (info) return { sizeKiB: info.sizeMiB * 1024, usedKiB: info.usedMiB * 1024 };
        const finfo = this.fsInfo(m.src);
        const mib = (finfo && finfo.fsMiB) || this.sizeMiB(m.src);
        if (!mib) return { sizeKiB: 0, usedKiB: 0 };
        if (T === 'xfs') {
            const usable = Math.floor(mib * 1024 * 0.995);
            return { sizeKiB: usable - (mib >= 1024 ? Math.floor(mib * 1024 * 0.0) : 0), usedKiB: Math.max(34 * 1024, Math.floor(mib * 1024 * 0.0068)) };
        }
        if (T === 'vfat') return { sizeKiB: Math.floor(mib * 1024 * 0.997), usedKiB: 4 };
        const sz = Math.floor(mib * 1024 * 0.9625);
        return { sizeKiB: sz, usedKiB: 24 };
    }

    _sizeOpt(s) {
        const m = /^(\d+)([kKmMgG%]?)$/.exec(s || '');
        if (!m) return 1873700;
        const n = parseInt(m[1], 10);
        const u = m[2].toLowerCase();
        if (u === 'k') return n; if (u === 'm') return n * 1024; if (u === 'g') return n * 1048576;
        if (u === '%') return Math.floor(1873700 * n / 100);
        return Math.floor(n / 1024);
    }

    df(args) {
        const flags = new Set();
        const only = [];
        const excl = [];
        const ops = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-t' || a === '--type') only.push(args[++i]);
            else if (a === '-x' || a === '--exclude-type') excl.push(args[++i]);
            else if (a.startsWith('--type=')) only.push(a.slice(7));
            else if (a.startsWith('--exclude-type=')) excl.push(a.slice(15));
            else if (a.startsWith('--')) flags.add(a.slice(2));
            else if (a.startsWith('-') && a.length > 1) { for (const ch of a.slice(1)) flags.add(ch); }
            else ops.push(a);
        }
        const human = flags.has('h') || flags.has('human-readable');
        const si = flags.has('H') || flags.has('si');
        const inodes = flags.has('i') || flags.has('inodes');
        const showType = flags.has('T') || flags.has('print-type');
        const mb = flags.has('m');
        const pseudo = /^(sysfs|proc|securityfs|devpts|cgroup2|selinuxfs|none)$/;
        let list = this.stMounts.filter(m => flags.has('a') || flags.has('all') || !pseudo.test(m.type));
        if (only.length) list = list.filter(m => only.some(t => t.split(',').includes(m.type)));
        if (excl.length) list = list.filter(m => !excl.some(t => t.split(',').includes(m.type)));
        if (ops.length) {
            const pick = [];
            for (const o of ops) {
                const node = this.fs.getNode(o);
                if (!node) return this._err(`df: ${o}: No such file or directory`, 1);
                const p = this._normPath(o);
                const m = this.stMounts.slice().reverse().find(x => !pseudo.test(x.type) && (p === x.tgt || p.startsWith(x.tgt === '/' ? '/' : x.tgt + '/')));
                if (m && !pick.includes(m)) pick.push(m);
            }
            list = pick;
        }
        if (!list.length) return this._err('df: no file systems processed', 1);

        const rows = list.map(m => {
            const u = this._usage(m);
            let size = u.big || u.sizeKiB;
            if (m.type === 'devtmpfs') size = 1873700;
            const used = u.usedKiB;
            const avail = Math.max(0, size - used - (m.type === 'ext4' ? Math.floor(size * 0.05) : 0));
            let src = m.src;
            const pct = size ? Math.ceil(used * 100 / (used + avail || 1)) : 0;
            return { src, size, used, avail, pct, tgt: m.tgt, type: m.type };
        });
        if (inodes) {
            const header = ['Filesystem', showType ? 'Type' : null, 'Inodes', 'IUsed', 'IFree', 'IUse%', 'Mounted on'].filter(Boolean);
            const data = rows.map(r => {
                const total = r.type === 'tmpfs' ? 468728 : r.type === 'devtmpfs' ? 468728 : (r.type === 'ext4' ? Math.floor(r.size / 16) : Math.floor(r.size / 2));
                const used = r.type === 'tmpfs' ? (r.tgt === '/run' ? 780 : 1) : (r.type === 'ext4' ? 11 : (r.tgt === '/' ? 123456 : 3));
                const f = (n) => human ? this._humCount(n) : String(n);
                return [r.src, showType ? r.type : null, f(total), f(used), f(total - used), `${Math.max(1, Math.ceil(used * 100 / total))}%`.replace(/^1%$/, used / total < 0.005 ? '1%' : '1%'), r.tgt].filter(x => x !== null);
            });
            return this._ok(this._table(header, data, [0, 1]));
        }
        const unitName = human ? 'Size' : (mb ? '1M-blocks' : '1K-blocks');
        const header = ['Filesystem', showType ? 'Type' : null, unitName, 'Used', human ? 'Avail' : 'Available', 'Use%', 'Mounted on'].filter(Boolean);
        const fmt = (kb) => {
            if (human) return si ? this._humSI(kb) : this._humKiB(kb);
            if (mb) return String(Math.ceil(kb / 1024));
            return String(kb);
        };
        const data = rows.map(r => [r.src, showType ? r.type : null, fmt(r.size), fmt(r.used), fmt(r.avail), `${r.pct}%`, r.tgt].filter(x => x !== null));
        return this._ok(this._table(header, data, showType ? [0, 1] : [0]));
    }

    _humSI(kb) {
        let v = kb * 1024 / 1000;
        const u = ['K', 'M', 'G', 'T'];
        let i = 0;
        while (v >= 1000 && i < u.length - 1) { v /= 1000; i++; }
        return `${v < 10 ? (Math.ceil(v * 10) / 10).toFixed(1) : Math.ceil(v)}${u[i]}`;
    }

    _humCount(n) {
        if (n < 1000) return String(n);
        if (n < 1e6) return `${n < 1e4 ? (Math.ceil(n / 100) / 10).toFixed(1) : Math.ceil(n / 1000)}K`;
        return `${n < 1e7 ? (Math.ceil(n / 1e5) / 10).toFixed(1) : Math.ceil(n / 1e6)}M`;
    }

    _table(header, rows, leftCols = [0]) {
        const all = [header, ...rows];
        const w = header.map((_, c) => Math.max(...all.map(r => String(r[c]).length)));
        const fmtRow = (r) => r.map((v, c) => {
            const s = String(v);
            if (c === r.length - 1) return s;
            return leftCols.includes(c) ? s.padEnd(w[c]) : s.padStart(w[c]);
        }).join(' ');
        return all.map(fmtRow).join('\n');
    }

    // ===== findmnt =====

    findmnt(args) {
        let list = false, noHead = false, fstab = false, verify = false, real = false;
        let types = null;
        let cols = null;
        const ops = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-l' || a === '--list') list = true;
            else if (a === '-n' || a === '--noheadings') noHead = true;
            else if (a === '-s' || a === '--fstab') fstab = true;
            else if (a === '--verify') verify = true;
            else if (a === '-R' || a === '--real') real = true;
            else if (a === '-t' || a === '--types') types = args[++i];
            else if (a.startsWith('--types=')) types = a.slice(8);
            else if (a === '-o' || a === '--output') cols = args[++i];
            else if (a.startsWith('--output=')) cols = a.slice(9);
            else if (a === '-r' || a === '--raw' || a === '-v' || a === '-D' || a === '-f' || a === '-e') { /* tolerated */ }
            else if (a === '-T' || a === '--target') ops.push(args[++i]);
            else if (a === '-S' || a === '--source') ops.push(args[++i]);
            else if (a.startsWith('-')) return this._err(`findmnt: invalid option -- '${a.replace(/^-+/, '')}'`, 1);
            else ops.push(a);
        }
        if (verify) return this._findmntVerify();
        let entries;
        if (fstab) entries = this._fstab().filter(r => !r.bad).map(r => ({ src: r.src, tgt: r.tgt, type: r.type, opts: r.opts }));
        else entries = this.stMounts.map(m => ({ ...m }));
        if (types) entries = entries.filter(e => types.split(',').includes(e.type) || (types === 'nfs' && /^nfs/.test(e.type)));
        if (real) entries = entries.filter(e => !/^(sysfs|proc|devtmpfs|securityfs|tmpfs|devpts|cgroup2|selinuxfs)$/.test(e.type));
        if (ops.length) {
            const hit = [];
            for (const o of ops) {
                const p = this._normPath(o);
                const found = entries.filter(e => e.tgt === p || e.src === o || e.src === this.canon(o));
                if (!found.length) { const near = entries.slice().reverse().find(e => p.startsWith(e.tgt === '/' ? '/' : e.tgt + '/')); if (near && !fstab && !types) { /* findmnt PATH only matches exact targets */ } }
                hit.push(...found);
            }
            if (!hit.length) return { stdout: '', stderr: '', exitCode: 1 };
            entries = hit;
            list = true;
        }
        if (!entries.length && !fstab) return { stdout: '', stderr: '', exitCode: 1 };
        const colNames = (cols || 'TARGET,SOURCE,FSTYPE,OPTIONS').split(',').map(c => c.trim().toUpperCase());
        const val = (e, c) => ({ TARGET: e.tgt, SOURCE: e.src, FSTYPE: e.type, OPTIONS: e.opts, LABEL: this._labelOf(e.src), UUID: (this.fsInfo(e.src) || {}).uuid || '', FS: e.type, SIZE: '', USED: '', AVAIL: '', 'USE%': '', MAJ_MIN: '' }[c] || '');
        let rows;
        if (list || fstab || cols) {
            rows = entries.map(e => colNames.map(c => val(e, c)));
        } else {
            rows = this._findmntTree(entries).map(({ e, prefix }) => colNames.map((c, i) => (i === 0 ? prefix + e.tgt : val(e, c))));
        }
        const hdr = colNames;
        const widths = hdr.map((h, i) => Math.max(h.length, ...rows.map(r => r[i].length)));
        const fmt = (r) => r.map((v, i) => (i === r.length - 1 ? v : v.padEnd(widths[i]))).join(' ').trimEnd();
        const lines = [];
        if (!noHead) lines.push(fmt(hdr));
        for (const r of rows) lines.push(fmt(r));
        return this._ok(lines.join('\n'));
    }

    _findmntTree(entries) {
        const out = [];
        const parentOf = (e) => {
            let best = null;
            for (const o of entries) {
                if (o === e) continue;
                if (e.tgt === '/' ) return null;
                if (e.tgt === o.tgt) continue;
                if (e.tgt.startsWith(o.tgt === '/' ? '/' : o.tgt + '/')) { if (!best || o.tgt.length > best.tgt.length) best = o; }
            }
            return best;
        };
        const kids = new Map();
        const roots = [];
        for (const e of entries) {
            const p = parentOf(e);
            if (!p) roots.push(e); else { if (!kids.has(p)) kids.set(p, []); kids.get(p).push(e); }
        }
        const walk = (e, indent, isLast, depth) => {
            out.push({ e, prefix: depth === 0 ? '' : indent + (isLast ? '└─' : '├─') });
            const ch = (kids.get(e) || []);
            ch.forEach((c, i) => walk(c, depth === 0 ? '' : indent + (isLast ? '  ' : '│ '), i === ch.length - 1, depth + 1));
        };
        roots.forEach(r => walk(r, '', true, 0));
        return out;
    }

    _findmntVerify() {
        let errs = 0, warns = 0, parse = 0;
        const out = [];
        for (const r of this._fstab()) {
            if (r.bad) { parse++; out.push(`${r.text.split(/\s+/)[0] || 'fstab'}\n   [E] ${'line ' + r.line}: expected 4 or more columns`); continue; }
            const lines = [];
            if (r.type !== 'swap' && r.tgt !== 'none' && !this.fs.getNode(r.tgt)) { lines.push('   [W] target does not exist'); warns++; }
            const src = this._resolveSrc(r.src);
            if (r.type !== 'swap' || true) {
                if (!/^[^/\s]+:\//.test(r.src) && !(src && this.deviceExists(src))) {
                    if (!r.opts.split(',').includes('nofail')) { lines.push(`   [W] unreachable on boot required source: ${r.src}`); warns++; }
                }
            }
            if (!['xfs', 'ext4', 'ext3', 'ext2', 'vfat', 'swap', 'nfs', 'nfs4', 'tmpfs', 'iso9660', 'auto', 'btrfs'].includes(r.type)) { lines.push(`   [W] unknown filesystem type '${r.type}'`); warns++; }
            if (lines.length) out.push(`${r.tgt}\n${lines.join('\n')}`);
        }
        if (!out.length && !parse) return this._ok('Success, no errors or warnings detected');
        return { stdout: out.join('\n') + `\n${parse} parse errors, ${errs} errors, ${warns} warnings`, stderr: '', exitCode: errs || warns || parse ? 1 : 0 };
    }

    // ===== lsblk =====

    lsblk(args) {
        let fsMode = false, all = false, noDeps = false, bytes = false;
        const ops = [];
        let cols = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-f' || a === '--fs') fsMode = true;
            else if (a === '-a' || a === '--all') all = true;
            else if (a === '-d' || a === '--nodeps') noDeps = true;
            else if (a === '-b' || a === '--bytes') bytes = true;
            else if (a === '-o' || a === '--output') cols = args[++i];
            else if (a.startsWith('--output=')) cols = a.slice(9);
            else if (a === '-n' || a === '-l' || a === '-p' || a === '-r' || a === '-i') { /* tolerated */ }
            else if (a.startsWith('-') && a.length > 1) { for (const ch of a.slice(1)) { if (ch === 'f') fsMode = true; else if (ch === 'a') all = true; else if (ch === 'd') noDeps = true; else if (ch === 'b') bytes = true; else if (!'nlpri'.includes(ch)) return this._err(`lsblk: invalid option -- '${ch}'`, 1); } }
            else ops.push(a);
        }
        const mp = (dev) => {
            const ms = this.stMounts.filter(m => m.src === dev).map(m => m.tgt);
            const sw = this.stSwaps.filter(s => s.dev === dev || s.name === dev).map(() => '[SWAP]');
            return [...ms, ...sw];
        };
        const majmin = { '/dev/sda': '8:0', '/dev/sdb': '8:16', '/dev/sdc': '8:32', '/dev/sdd': '8:48' };
        const rows = [];
        const diskNames = Object.keys(this.stDisks).sort();
        let dmCounter = 0;
        const dmIndex = {};
        const dmFor = (dev) => { if (!(dev in dmIndex)) dmIndex[dev] = dmCounter++; return dmIndex[dev]; };
        // sda LVs first so the numbering matches a real system (dm-0 root, dm-1 swap)
        dmFor('/dev/mapper/rhel-root'); dmFor('/dev/mapper/rhel-swap');
        for (const lv of Object.values(this._x().xlvm.lvs)) dmFor(lv.mapper);
        const addDisk = (dv) => {
            const d = this.stDisks[dv];
            rows.push({ name: dv.replace('/dev/', ''), mm: majmin[dv], rm: '0', size: Math.floor(d.size / 1048576), ro: '0', type: 'disk', mp: [], dev: dv, depth: 0 });
            if (noDeps) return;
            const parts = d.parts.slice().sort((a, b) => a.n - b.n);
            parts.forEach((p, i) => {
                const pd = dv + p.n;
                const last = i === parts.length - 1;
                const size = Math.floor((p.endS - p.startS + 1) * 512 / 1048576);
                rows.push({ name: dv.replace('/dev/', '') + p.n, mm: `8:${parseInt(majmin[dv].split(':')[1], 10) + p.n}`, rm: '0', size, ro: '0', type: p.type === 'extended' ? 'part' : 'part', mp: mp(pd), dev: pd, depth: 1, last });
                // children: LVs on this PV
                const x = this._x();
                const pvs = x ? x.xlvm.pvs : {};
                if (dv === '/dev/sda' && p.n === 2) {
                    rows.push({ name: 'rhel-root', mm: `253:${dmFor('/dev/mapper/rhel-root')}`, rm: '0', size: 17 * 1024 - 1024 + 1023, ro: '0', type: 'lvm', mp: ['/'], dev: '/dev/mapper/rhel-root', depth: 2, last: false });
                    rows.push({ name: 'rhel-swap', mm: `253:${dmFor('/dev/mapper/rhel-swap')}`, rm: '0', size: 2048, ro: '0', type: 'lvm', mp: ['[SWAP]'], dev: '/dev/mapper/rhel-swap', depth: 2, last: true });
                }
                if (pvs[pd]) {
                    const lvs = Object.values(x.xlvm.lvs).filter(l => pvs[pd].vg === l.vg && x.xlvm.vgs[l.vg].pvs[0] === pd);
                    lvs.forEach((l, j) => rows.push({ name: `${l.vg}-${l.name}`, mm: `253:${dmFor(l.mapper)}`, rm: '0', size: l.sizeMiB, ro: '0', type: 'lvm', mp: mp(l.mapper), dev: l.mapper, depth: 2, last: j === lvs.length - 1 }));
                }
            });
            // whole-disk PVs
            const x = this._x();
            if (x.xlvm.pvs[dv] && !noDeps) {
                const pv = x.xlvm.pvs[dv];
                const lvs = Object.values(x.xlvm.lvs).filter(l => l.vg === pv.vg && x.xlvm.vgs[l.vg].pvs[0] === dv);
                lvs.forEach((l, j) => rows.push({ name: `${l.vg}-${l.name}`, mm: `253:${dmFor(l.mapper)}`, rm: '0', size: l.sizeMiB, ro: '0', type: 'lvm', mp: mp(l.mapper), dev: l.mapper, depth: 1, last: j === lvs.length - 1 }));
            }
        };
        const sel = ops.length ? ops.filter(o => this.stDisks[o]) : diskNames;
        if (ops.length && ops.some(o => !this.deviceExists(o))) return this._err(`lsblk: ${ops.find(o => !this.deviceExists(o))}: not a block device`, 32);
        for (const dv of sel) addDisk(dv);
        // sr0 always present
        if (!ops.length) rows.push({ name: 'sr0', mm: '11:0', rm: '1', size: 1024, ro: '0', type: 'rom', mp: [], dev: '/dev/sr0', depth: 0 });
        // tree prefixes
        const prefix = (r, i) => {
            if (r.depth === 0) return '';
            const stack = [];
            // compute ancestors "last" flags by scanning backwards
            let d = r.depth;
            let line = r.last === false ? '├─' : '└─';
            if (r.depth === 1) return line;
            // depth 2: look at parent's last flag
            for (let j = i - 1; j >= 0; j--) { if (rows[j].depth === 1) { return (rows[j].last ? '  ' : '│ ') + line; } }
            return line;
        };
        const names = rows.map((r, i) => prefix(r, i) + r.name);
        if (fsMode) {
            const header = ['NAME', 'FSTYPE', 'FSVER', 'LABEL', 'UUID', 'FSAVAIL', 'FSUSE%', 'MOUNTPOINTS'];
            const data = rows.map((r, i) => {
                const info = this.fsInfo(r.dev);
                const pv = this._x().xlvm.pvs[r.dev];
                const type = info ? info.type : (pv ? 'LVM2_member' : (r.dev === '/dev/sda2' ? 'LVM2_member' : ''));
                const ver = info ? (info.type === 'xfs' ? '' : info.type === 'swap' ? '1' : info.type === 'vfat' ? 'FAT32' : '1.0') : (type === 'LVM2_member' ? 'LVM2 001' : '');
                const uuid = info ? info.uuid : (pv ? pv.uuid : (r.dev === '/dev/sda2' ? 'Zk3r1a-Wq7m-9t2L-pQxN-4vYh-8sDe-Fg5bTc' : ''));
                let avail = '', use = '';
                const m = this.stMounts.find(x => x.src === r.dev);
                if (m) { const u = this._usage(m); const av = u.sizeKiB - u.usedKiB; avail = this._lsSizeKiB(av); use = `${Math.round(u.usedKiB * 100 / u.sizeKiB)}%`; }
                return [names[i], type, ver, info ? (info.label || '') : '', uuid, avail, use, r.mp.join(' ')];
            });
            return this._ok(this._lsTable(header, data));
        }
        const all_cols = { NAME: (r, i) => names[i], 'MAJ:MIN': r => r.mm, RM: r => r.rm, SIZE: r => (bytes ? String(r.size * 1048576) : this._lsSize(r.size)), RO: r => r.ro, TYPE: r => r.type, MOUNTPOINT: r => r.mp[0] || '', MOUNTPOINTS: r => r.mp.join(' '), FSTYPE: r => (this.fsInfo(r.dev) || {}).type || '', UUID: r => (this.fsInfo(r.dev) || {}).uuid || '', LABEL: r => (this.fsInfo(r.dev) || {}).label || '', PATH: r => r.dev };
        const use = (cols ? cols.split(',').map(c => c.trim().toUpperCase()) : ['NAME', 'MAJ:MIN', 'RM', 'SIZE', 'RO', 'TYPE', 'MOUNTPOINTS']);
        for (const c of use) if (!all_cols[c]) return this._err(`lsblk: unknown column: ${c}`, 1);
        const header = use;
        const data = rows.map((r, i) => use.map(c => all_cols[c](r, i)));
        // right-align SIZE like lsblk
        return this._ok(this._lsTable(header, data, use.map(c => (['SIZE', 'MAJ:MIN', 'RM', 'RO'].includes(c) ? 'r' : 'l'))));
    }

    _lsSizeKiB(kb) {
        const mib = kb / 1024;
        if (mib >= 1024) return `${+(mib / 1024).toFixed(1)}G`;
        return `${Math.round(mib)}M`;
    }

    _lsTable(header, rows, align = null) {
        const all = [header, ...rows];
        const w = header.map((_, c) => Math.max(...all.map(r => (r[c] || '').length)));
        const line = (r) => r.map((v, c) => {
            const s = v || '';
            if (c === r.length - 1) return s;
            return (align && align[c] === 'r') ? s.padStart(w[c]) : s.padEnd(w[c]);
        }).join(' ').trimEnd();
        return all.map(line).join('\n');
    }

    // ===== swap =====

    mkswap(args) {
        if (!this._root()) return this._err('mkswap: Permission denied', 1);
        const rest = args.filter(a => !a.startsWith('-'));
        const labelIdx = args.indexOf('-L');
        const dev = this.canon(rest[0] || '');
        if (!rest[0]) return this._err('Usage:\n mkswap [options] device [size]', 1);
        let mib;
        if (this.deviceExists(dev)) mib = this.sizeMiB(dev);
        else {
            const node = this.fs.getNode(dev);
            if (!node) return this._err(`mkswap: cannot open ${rest[0]}: No such file or directory`, 1);
            if (node.type !== 'file') return this._err(`mkswap: ${rest[0]}: Is a directory`, 1);
            mib = Math.floor((node.size || 0) / 1048576);
            if (mib < 1) return this._err(`mkswap: error: swap area needs to be at least 40 KiB`, 1);
        }
        if (this.stMounts.some(m => m.src === dev)) return this._err(`mkswap: ${dev} is mounted; will not make swapspace`, 1);
        const uuid = this._x()._uuid();
        const label = labelIdx >= 0 ? args[labelIdx + 1] : '';
        this._x().xfsTypes[dev] = { type: 'swap', uuid, label };
        const bytes = (mib - 0.0039) * 1048576;
        return this._ok(`Setting up swapspace version 1, size = ${mib >= 1024 ? (mib / 1024).toFixed(1) + ' GiB' : mib + ' MiB'} (${Math.floor(bytes)} bytes)\n${label ? `LABEL=${label}, ` : 'no label, '}UUID=${uuid}`);
    }

    swapon(args) {
        const opts = args.filter(a => a.startsWith('-'));
        const rest = args.filter(a => !a.startsWith('-'));
        if (opts.includes('--show') || opts.includes('-s') && false) return this._swapShow(args);
        if (opts.includes('-s') || opts.includes('--summary')) {
            return this._ok('Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n' + this.stSwaps.map(s => `${s.name.padEnd(40)}${s.type.padEnd(16)}${String(s.sizeMiB * 1024).padEnd(16)}0\t\t${s.prio}`).join('\n'));
        }
        if (!this._root() && (rest.length || opts.includes('-a') || opts.includes('--all'))) return this._err(`swapon: ${rest[0] || ''}: swapon failed: Operation not permitted`, 255);
        if (opts.includes('-a') || opts.includes('--all')) {
            const errs = [];
            for (const r of this._fstab()) {
                if (r.bad || r.type !== 'swap') continue;
                const dv = this._resolveSrc(r.src) || r.src;
                if (this.stSwaps.some(s => s.dev === dv || s.name === dv)) continue;
                const res = this._swapOn(dv);
                if (res.exitCode) errs.push(res.stderr);
            }
            return { stdout: '', stderr: errs.join('\n'), exitCode: errs.length ? 255 : 0 };
        }
        if (!rest.length) return this._swapShow(args);
        let target = rest[0];
        if (/^(UUID|LABEL)=/.test(target)) { const r = this._resolveSrc(target); if (!r) return this._err(`swapon: cannot find the device for ${target}`, 255); target = r; }
        return this._swapOn(this.canon(target));
    }

    _swapOn(dev) {
        const info = this.fsInfo(dev);
        const node = this.fs.getNode(dev);
        if (!info || info.type !== 'swap') {
            if (!this.deviceExists(dev) && !node) return this._err(`swapon: cannot open ${dev}: No such file or directory`, 255);
            return this._err(`swapon: ${dev}: read swap header failed`, 255);
        }
        if (this.stSwaps.some(s => s.dev === dev)) return this._err(`swapon: ${dev}: swapon failed: Device or resource busy`, 255);
        let warn = '';
        let mib, type = 'partition', name = dev;
        if (this.deviceExists(dev)) mib = this.sizeMiB(dev);
        else {
            type = 'file';
            mib = Math.floor((node.size || 0) / 1048576);
            const perm = node.permissions.slice(-4);
            if (!/^0?[0-7]00$/.test(perm.slice(-3) + '') && node.permissions.slice(-3) !== '600' && node.permissions.slice(-3) !== '400') {
                warn = `swapon: ${dev}: insecure permissions ${node.permissions.slice(-4)}, 0600 suggested.`;
            }
        }
        const prio = -2 - this.stSwaps.length;
        this.stSwaps.push({ name, dev, type, sizeMiB: mib, prio });
        this._stSyncProc();
        return { stdout: '', stderr: warn, exitCode: 0 };
    }

    _swapShow(args) {
        if (!this.stSwaps.length) return this._ok('');
        const data = this.stSwaps.map(s => [s.name, s.type, this._swapSize(s.sizeMiB), '0B', String(s.prio)]);
        const header = ['NAME', 'TYPE', 'SIZE', 'USED', 'PRIO'];
        const w = header.map((h, i) => Math.max(h.length, ...data.map(r => r[i].length)));
        const fmt = (r) => r.map((v, i) => (i < 2 ? v.padEnd(w[i]) : v.padStart(w[i]))).join(' ');
        return this._ok([fmt(header), ...data.map(fmt)].join('\n'));
    }

    _swapSize(mib) { return mib % 1024 === 0 ? `${mib / 1024}G` : mib >= 1024 ? `${+(mib / 1024).toFixed(1)}G` : `${mib}M`; }

    swapoff(args) {
        if (!this._root()) return this._err('swapoff: Operation not permitted', 255);
        const rest = args.filter(a => !a.startsWith('-'));
        if (args.includes('-a') || args.includes('--all')) { this.stSwaps = []; this._stSyncProc(); return this._ok(); }
        if (!rest.length) return this._err('Usage:\n swapoff [options] [<spec>]', 1);
        let t = rest[0];
        if (/^(UUID|LABEL)=/.test(t)) t = this._resolveSrc(t) || t;
        t = this.canon(t);
        const i = this.stSwaps.findIndex(s => s.dev === t || s.name === t);
        if (i < 0) return this._err(`swapoff: ${rest[0]}: swapoff failed: Invalid argument`, 255);
        this.stSwaps.splice(i, 1);
        this._stSyncProc();
        return this._ok();
    }

    // ===== free =====

    free(args) {
        const flags = new Set();
        let seconds = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-s') seconds = args[++i];
            else if (a.startsWith('--')) flags.add(a.slice(2));
            else if (a.startsWith('-')) for (const ch of a.slice(1)) flags.add(ch);
        }
        const totalKiB = 3841872;
        const x = this.shared.extra;
        const procMem = (this.shared.processes || []).reduce((s, p) => s + (p.mem || 0), 0);
        const usedKiB = Math.floor(260000 + totalKiB * procMem / 100);
        const sharedKiB = 8704;
        const cacheKiB = 345632;
        const freeKiB = totalKiB - usedKiB - cacheKiB;
        const availKiB = freeKiB + cacheKiB - 40000;
        const swapTotal = this.stSwaps.reduce((s, w) => s + w.sizeMiB * 1024, 0);
        const unit = flags.has('b') ? 1024 : flags.has('k') || flags.has('kilo') ? 1 : flags.has('m') || flags.has('mega') ? 1 / 1024 : flags.has('g') || flags.has('giga') ? 1 / 1048576 : 1;
        const human = flags.has('h') || flags.has('human');
        const si = flags.has('si');
        const fmt = (kib) => {
            if (human) {
                const units = ['Ki', 'Mi', 'Gi', 'Ti'];
                let v = kib; let i = 0;
                if (si) { v = kib * 1024 / 1000; const u = ['K', 'M', 'G', 'T']; while (v >= 1000 && i < 3) { v /= 1000; i++; } return v < 10 && i ? `${v.toFixed(1)}${u[i]}` : `${Math.round(v)}${u[i]}`; }
                if (kib < 1) return '0B';
                v = kib * 1024;
                if (v < 1024) return `${Math.round(v)}B`;
                v = kib; i = 0;
                while (v >= 1024 && i < 3) { v /= 1024; i++; }
                return (v < 10 && i > 0 ? v.toFixed(1) : String(Math.round(v))) + units[i];
            }
            const r = kib * unit;
            return String(unit === 1 ? Math.floor(r) : Math.floor(r));
        };
        const rows = [
            ['', 'total', 'used', 'free', 'shared', 'buff/cache', 'available'],
            ['Mem:', fmt(totalKiB), fmt(usedKiB), fmt(freeKiB), fmt(sharedKiB), fmt(cacheKiB), fmt(availKiB)],
            ['Swap:', fmt(swapTotal), human ? '0B' : '0', fmt(swapTotal)]
        ];
        if (flags.has('t') || flags.has('total')) rows.push(['Total:', fmt(totalKiB + swapTotal), fmt(usedKiB), fmt(freeKiB + swapTotal)]);
        const w = 12;
        const text = rows.map((r, i) => (i === 0 ? ' '.repeat(7) : r[0].padEnd(7)) + r.slice(1).map(c => c.padStart(w)).join('')).join('\n');
        return this._ok(text);
    }

    // ===== dd / fallocate / truncate (swap files and disk images) =====

    _makeFile(path, bytes) {
        const full = this.fs.resolvePath(path);
        const parentPath = this.fs.getParentPath(full);
        const base = this.fs.getBasename(full);
        const parent = this.fs.getNode(parentPath);
        if (!parent || parent.type !== 'directory') return false;
        const existing = parent.children[base];
        const grp = (this._x()._primaryGroupName ? this._x()._primaryGroupName(this.fs.currentUser) : this.fs.currentUser);
        parent.children[base] = {
            type: 'file', permissions: existing ? existing.permissions : '0644', owner: existing ? existing.owner : this.fs.currentUser,
            group: existing ? existing.group : grp, size: bytes, modified: new Date(), content: '', sparse: true
        };
        return true;
    }

    _sizeBytes(spec) {
        const m = /^(\d+(?:\.\d+)?)([KMGTkmgt]?)([iI]?[bB])?$/.exec(spec || '');
        if (!m) return null;
        const mult = { '': 1, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776 }[m[2].toUpperCase()];
        const decimal = m[3] && /^[bB]$/.test(m[3]) && m[2];
        return Math.floor(parseFloat(m[1]) * (decimal ? { K: 1000, M: 1e6, G: 1e9, T: 1e12 }[m[2].toUpperCase()] : mult));
    }

    fallocate(args) {
        let len = null; const ops = [];
        for (let i = 0; i < args.length; i++) { if (args[i] === '-l' || args[i] === '--length') len = args[++i]; else if (args[i].startsWith('--length=')) len = args[i].slice(9); else if (!args[i].startsWith('-')) ops.push(args[i]); }
        if (!len || !ops.length) return this._err('fallocate: no length arguments specified', 1);
        const b = this._sizeBytes(len);
        if (b === null || b <= 0) return this._err(`fallocate: invalid length value specified`, 1);
        if (!this._makeFile(ops[0], b)) return this._err(`fallocate: cannot open ${ops[0]}: No such file or directory`, 1);
        return this._ok();
    }

    truncate(args) {
        let size = null; const ops = [];
        for (let i = 0; i < args.length; i++) { if (args[i] === '-s' || args[i] === '--size') size = args[++i]; else if (args[i].startsWith('--size=')) size = args[i].slice(7); else if (!args[i].startsWith('-')) ops.push(args[i]); }
        if (size === null || !ops.length) return this._err('truncate: you must specify either \'--size\' or \'--reference\'', 1);
        const b = this._sizeBytes(size);
        if (b === null) return this._err(`truncate: Invalid number: '${size}'`, 1);
        if (!this._makeFile(ops[0], b)) return this._err(`truncate: cannot open '${ops[0]}' for writing: No such file or directory`, 1);
        return this._ok();
    }

    dd(args) {
        const kv = {};
        for (const a of args) { const m = /^(\w+)=(.*)$/.exec(a); if (m) kv[m[1]] = m[2]; else return this._err(`dd: unrecognized operand '${a}'`, 1); }
        if (!kv.of) return this._err('dd: this simulator only supports dd with of=FILE (for example dd if=/dev/zero of=/swapfile bs=1M count=1024)', 1);
        const bs = this._sizeBytes(kv.bs || '512');
        const count = kv.count ? parseInt(kv.count, 10) : null;
        if (bs === null || (kv.count && isNaN(count))) return this._err(`dd: invalid number: '${kv.bs || kv.count}'`, 1);
        if ((kv.if === '/dev/zero' || kv.if === '/dev/urandom') && count === null) return this._err('dd: refusing to read forever: pass count=N', 1);
        if (/^\/dev\//.test(kv.of) && this.deviceExists(kv.of)) {
            if (!this._root()) return this._err(`dd: failed to open '${kv.of}': Permission denied`, 1);
            const x = this._x();
            delete x.xfsTypes[this.canon(kv.of)];
            const bytes = bs * (count || 0);
            return { stdout: '', stderr: `${count}+0 records in\n${count}+0 records out\n${bytes} bytes (${this._ddHuman(bytes)}) copied, 0.5 s, ${this._ddRate(bytes, 0.5)}`, exitCode: 0 };
        }
        const bytes = bs * (count === null ? 1 : count);
        if (!this._makeFile(kv.of, bytes)) return this._err(`dd: failed to open '${kv.of}': No such file or directory`, 1);
        const secs = Math.max(0.2, bytes / 900000000);
        return { stdout: '', stderr: `${count}+0 records in\n${count}+0 records out\n${bytes} bytes (${this._ddHuman(bytes)}) copied, ${secs.toFixed(2)} s, ${this._ddRate(bytes, secs)}`, exitCode: 0 };
    }

    _ddHuman(b) { return b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB, ${(b / 1073741824).toFixed(1)} GiB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB, ${(b / 1048576).toFixed(1)} MiB` : `${b} B`; }
    _ddRate(b, s) { const r = b / s; return r >= 1e9 ? `${(r / 1e9).toFixed(1)} GB/s` : `${(r / 1e6).toFixed(0)} MB/s`; }
}

if (typeof window !== 'undefined') {
    window.StorageCommands = StorageCommands;
}
