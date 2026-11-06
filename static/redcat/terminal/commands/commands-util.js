// Everyday utilities that were missing: md5sum/sha*sum, base64, expr, timeout, realpath, mktemp, nl, tac, rev, shuf,
// column, od, xxd, hexdump, strings, ldd, cmp, comm, fold, split, install, rmdir, nproc, watch, lastlog and friends
// Part of Red Cat RHCSA Terminal Simulator

const UTIL_HASH = (() => {
    const utf8 = (s) => {
        const out = [];
        for (const ch of String(s)) {
            const c = ch.codePointAt(0);
            if (c < 0x80) out.push(c);
            else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
            else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
            else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
        }
        return Uint8Array.from(out);
    };
    const hex = (words, le, bytesPer) => {
        let s = '';
        for (const w of words) for (let i = 0; i < bytesPer; i++) {
            const shift = le ? i * 8 : (bytesPer - 1 - i) * 8;
            s += ((Number((BigInt(w) >> BigInt(shift)) & 255n)) + 256).toString(16).slice(1);
        }
        return s;
    };
    const primes = (n) => { const p = []; for (let i = 2; p.length < n; i++) if (p.every(q => i % q)) p.push(i); return p; };
    const isqrt = (n) => { if (n < 2n) return n; let x = n, y = (x + 1n) / 2n; while (y < x) { x = y; y = (x + n / x) / 2n; } return x; };
    const icbrt = (n) => { let x = 1n << BigInt(Math.ceil(n.toString(2).length / 3) + 1); while (true) { const y = (2n * x + n / (x * x)) / 3n; if (y >= x) return x; x = y; } };
    let K256 = null, K512 = null, H256 = null, H512 = null;
    const init = () => {
        if (K256) return;
        const pr = primes(80);
        K256 = pr.slice(0, 64).map(p => Number(icbrt(BigInt(p) << 96n) & 0xffffffffn));
        K512 = pr.map(p => icbrt(BigInt(p) << 192n) & 0xffffffffffffffffn);
        H256 = pr.slice(0, 8).map(p => Number(isqrt(BigInt(p) << 64n) & 0xffffffffn));
        H512 = pr.slice(0, 8).map(p => isqrt(BigInt(p) << 128n) & 0xffffffffffffffffn);
    };
    const pad = (bytes, block, lenBytes, le) => {
        const len = bytes.length;
        const total = Math.ceil((len + 1 + lenBytes) / block) * block;
        const buf = new Uint8Array(total);
        buf.set(bytes); buf[len] = 0x80;
        const dv = new DataView(buf.buffer);
        const bits = BigInt(len) * 8n;
        if (lenBytes === 8) { dv.setUint32(total - 8, Number(bits & 0xffffffffn), le); dv.setUint32(total - 4, Number(bits >> 32n), le); if (!le) { dv.setUint32(total - 8, Number(bits >> 32n), false); dv.setUint32(total - 4, Number(bits & 0xffffffffn), false); } }
        else { dv.setBigUint64(total - 8, bits, false); }
        return buf;
    };
    const rotl = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
    const rotr = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;
    const md5 = (bytes) => {
        const K = []; for (let i = 0; i < 64; i++) K.push(Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);
        const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
        let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
        const buf = pad(bytes, 64, 8, true);
        const dv = new DataView(buf.buffer);
        for (let off = 0; off < buf.length; off += 64) {
            const M = []; for (let i = 0; i < 16; i++) M.push(dv.getUint32(off + i * 4, true));
            let A = a0, B = b0, C = c0, D = d0;
            for (let i = 0; i < 64; i++) {
                let F, g;
                if (i < 16) { F = (B & C) | (~B & D); g = i; }
                else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
                else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
                else { F = C ^ (B | ~D); g = (7 * i) % 16; }
                F = (F + A + K[i] + M[g]) >>> 0;
                A = D; D = C; C = B;
                B = (B + rotl(F, S[i])) >>> 0;
            }
            a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
        }
        return hex([a0, b0, c0, d0], true, 4);
    };
    const sha1 = (bytes) => {
        let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
        const buf = pad(bytes, 64, 8, false);
        const dv = new DataView(buf.buffer);
        for (let off = 0; off < buf.length; off += 64) {
            const w = []; for (let i = 0; i < 16; i++) w.push(dv.getUint32(off + i * 4, false));
            for (let i = 16; i < 80; i++) w.push(rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1));
            let a = h0, b = h1, c = h2, d = h3, e = h4;
            for (let i = 0; i < 80; i++) {
                let f, k;
                if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
                else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
                else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
                else { f = b ^ c ^ d; k = 0xca62c1d6; }
                const t = (rotl(a, 5) + (f >>> 0) + e + k + w[i]) >>> 0;
                e = d; d = c; c = rotl(b, 30); b = a; a = t;
            }
            h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
        }
        return hex([h0, h1, h2, h3, h4], false, 4);
    };
    const sha256 = (bytes) => {
        init();
        const h = H256.slice();
        const buf = pad(bytes, 64, 8, false);
        const dv = new DataView(buf.buffer);
        for (let off = 0; off < buf.length; off += 64) {
            const w = []; for (let i = 0; i < 16; i++) w.push(dv.getUint32(off + i * 4, false));
            for (let i = 16; i < 64; i++) {
                const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
                const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
                w.push((w[i - 16] + s0 + w[i - 7] + s1) >>> 0);
            }
            let [a, b, c, d, e, f, g, hh] = h;
            for (let i = 0; i < 64; i++) {
                const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                const ch = (e & f) ^ (~e & g);
                const t1 = (hh + (S1 >>> 0) + (ch >>> 0) + K256[i] + w[i]) >>> 0;
                const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = ((S0 >>> 0) + (maj >>> 0)) >>> 0;
                hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
            }
            const add = [a, b, c, d, e, f, g, hh];
            for (let i = 0; i < 8; i++) h[i] = (h[i] + add[i]) >>> 0;
        }
        return hex(h, false, 4);
    };
    const sha512 = (bytes) => {
        init();
        const M64 = 0xffffffffffffffffn;
        const r = (x, n) => ((x >> BigInt(n)) | (x << BigInt(64 - n))) & M64;
        const h = H512.slice();
        const buf = new Uint8Array(Math.ceil((bytes.length + 1 + 16) / 128) * 128);
        buf.set(bytes); buf[bytes.length] = 0x80;
        const dv = new DataView(buf.buffer);
        dv.setBigUint64(buf.length - 8, BigInt(bytes.length) * 8n, false);
        for (let off = 0; off < buf.length; off += 128) {
            const w = []; for (let i = 0; i < 16; i++) w.push(dv.getBigUint64(off + i * 8, false));
            for (let i = 16; i < 80; i++) {
                const s0 = r(w[i - 15], 1) ^ r(w[i - 15], 8) ^ (w[i - 15] >> 7n);
                const s1 = r(w[i - 2], 19) ^ r(w[i - 2], 61) ^ (w[i - 2] >> 6n);
                w.push((w[i - 16] + s0 + w[i - 7] + s1) & M64);
            }
            let [a, b, c, d, e, f, g, hh] = h;
            for (let i = 0; i < 80; i++) {
                const S1 = r(e, 14) ^ r(e, 18) ^ r(e, 41);
                const ch = (e & f) ^ (~e & M64 & g);
                const t1 = (hh + S1 + ch + K512[i] + w[i]) & M64;
                const S0 = r(a, 28) ^ r(a, 34) ^ r(a, 39);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = (S0 + maj) & M64;
                hh = g; g = f; f = e; e = (d + t1) & M64; d = c; c = b; b = a; a = (t1 + t2) & M64;
            }
            const add = [a, b, c, d, e, f, g, hh];
            for (let i = 0; i < 8; i++) h[i] = (h[i] + add[i]) & M64;
        }
        return hex(h, false, 8);
    };
    return { utf8, md5, sha1, sha256, sha512 };
})();

class UtilEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.util = this;
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

    // read operands (files, '-' or stdin when there are none); collects "No such file" style errors
    _inputs(files, stdin, cmd) {
        const out = [], errs = [];
        const list = files.length ? files : ['-'];
        for (const f of list) {
            if (f === '-') { out.push({ name: '-', text: stdin || '' }); continue; }
            const path = this.fs.resolvePath(f);
            const n = this.fs.getNode(path);
            if (!n) { errs.push(`${cmd}: ${f}: No such file or directory`); continue; }
            if (n.type === 'directory') { errs.push(`${cmd}: ${f}: Is a directory`); continue; }
            if (!this.fs.hasPermission(n, 'r')) { errs.push(`${cmd}: ${f}: Permission denied`); continue; }
            out.push({ name: f, text: n.content || '', node: n });
        }
        return { inputs: out, errs };
    }

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

    _result(out, errs, code) { return { stdout: out, stderr: errs.join('\n'), exitCode: code !== undefined ? code : (errs.length ? 1 : 0) }; }

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

    _write(path, content, mode) {
        const abs = this.fs.resolvePath(path);
        const dir = this.fs.getNode(abs.replace(/\/[^/]*$/, '') || '/');
        if (!dir || !dir.children) return false;
        const name = abs.split('/').pop();
        const old = dir.children[name];
        dir.children[name] = { type: 'file', permissions: mode || (old ? old.permissions : '0644'), owner: old ? old.owner : this.fs.currentUser, group: old ? old.group : this.fs.currentUser, size: content.length, modified: new Date(), content };
        return true;
    }

    // ===== checksums =====
    _sum(name, algo, args, stdin) {
        const { o, rest } = this._flags(args, []);
        if (o.c || o.check) {
            const { inputs, errs } = this._inputs(rest, stdin, name);
            let ok = 0, bad = 0, missing = 0, malformed = 0;
            const out = [];
            for (const inp of inputs) {
                for (const line of inp.text.split('\n')) {
                    if (!line.trim()) continue;
                    const m = /^([0-9a-fA-F]+)\s[ *](.+)$/.exec(line);
                    if (!m) { malformed++; continue; }
                    const n = this.fs.getNode(this.fs.resolvePath(m[2]));
                    if (!n || n.type !== 'file') { out.push(`${name}: ${m[2]}: No such file or directory`); out.push(`${m[2]}: FAILED open or read`); missing++; continue; }
                    const h = UTIL_HASH[algo](UTIL_HASH.utf8(n.content || ''));
                    if (h === m[1].toLowerCase()) { ok++; if (!o.quiet && !o.s) out.push(`${m[2]}: OK`); } else { bad++; out.push(`${m[2]}: FAILED`); }
                }
            }
            const warn = [];
            if (malformed) warn.push(`${name}: WARNING: ${malformed} line${malformed > 1 ? 's are' : ' is'} improperly formatted`);
            if (missing) warn.push(`${name}: WARNING: ${missing} listed file${missing > 1 ? 's' : ''} could not be read`);
            if (bad) warn.push(`${name}: WARNING: ${bad} computed checksum${bad > 1 ? 's' : ''} did NOT match`);
            const stdout = out.filter(l => !/^sha|^md5/.test(l) || true).join('\n');
            return { stdout, stderr: [...errs, ...warn].join('\n'), exitCode: bad || missing || (malformed && !ok) ? 1 : 0 };
        }
        const { inputs, errs } = this._inputs(rest, stdin, name);
        const out = inputs.map(i => `${UTIL_HASH[algo](UTIL_HASH.utf8(i.text))} ${o.b || o.binary ? '*' : ' '}${i.name}`);
        return this._result(out.join('\n'), errs);
    }
    md5sum(args, stdin) { return this._sum('md5sum', 'md5', args, stdin); }
    sha1sum(args, stdin) { return this._sum('sha1sum', 'sha1', args, stdin); }
    sha256sum(args, stdin) { return this._sum('sha256sum', 'sha256', args, stdin); }
    sha512sum(args, stdin) { return this._sum('sha512sum', 'sha512', args, stdin); }

    cksum(args, stdin) {
        const { inputs, errs } = this._inputs(args.filter(a => !a.startsWith('-')), stdin, 'cksum');
        const crcTable = []; for (let n = 0; n < 256; n++) { let c = n << 24; for (let k = 0; k < 8; k++) c = c & 0x80000000 ? ((c << 1) ^ 0x04c11db7) : (c << 1); crcTable.push(c >>> 0); }
        const out = inputs.map(i => {
            const b = UTIL_HASH.utf8(i.text);
            let crc = 0;
            for (const x of b) crc = ((crc << 8) ^ crcTable[((crc >>> 24) ^ x) & 255]) >>> 0;
            let len = b.length;
            while (len > 0) { crc = ((crc << 8) ^ crcTable[((crc >>> 24) ^ (len & 255)) & 255]) >>> 0; len = Math.floor(len / 256); }
            crc = (~crc) >>> 0;
            return `${crc} ${b.length}${i.name === '-' ? '' : ' ' + i.name}`;
        });
        return this._result(out.join('\n'), errs);
    }

    // ===== base64 =====
    base64(args, stdin) {
        const { o, rest } = this._flags(args, ['w']);
        const { inputs, errs } = this._inputs(rest, stdin, 'base64');
        const wrap = o.w !== undefined ? parseInt(o.w, 10) : (o.wrap !== undefined ? parseInt(o.wrap, 10) : 76);
        if (Number.isNaN(wrap)) return this._err(`base64: invalid wrap size: '${o.w || o.wrap}'`);
        const out = [];
        for (const inp of inputs) {
            if (o.d || o.decode) {
                const clean = inp.text.replace(/[\r\n]/g, '').replace(o.i || o['ignore-garbage'] ? /[^A-Za-z0-9+/=]/g : /$^/, '');
                if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) { out.push(''); errs.push('base64: invalid input'); continue; }
                let bin = '';
                try { bin = atob(clean); } catch (e) { errs.push('base64: invalid input'); continue; }
                let s = bin;
                try { s = decodeURIComponent(escape(bin)); } catch (e) { s = bin; }
                out.push(s);
            } else {
                let enc = '';
                try { enc = btoa(unescape(encodeURIComponent(inp.text))); } catch (e) { enc = btoa(inp.text); }
                if (wrap > 0) enc = enc.replace(new RegExp(`(.{${wrap}})`, 'g'), '$1\n').replace(/\n$/, '');
                out.push(enc + '\n');
            }
        }
        const text = out.join('');
        return { stdout: text, rawStdout: o.d || o.decode ? text : undefined, stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }

    // ===== expr =====
    expr(args) {
        if (!args.length) return this._err("expr: missing operand\nTry 'expr --help' for more information.", 2);
        let pos = 0;
        const fail = (m) => { const e = new Error(m); e.expr = true; throw e; };
        const peek = () => args[pos];
        const isInt = (v) => /^-?\d+$/.test(String(v));
        const truthy = (v) => !(v === '' || v === '0' || v === 0 || v === null);
        const parseOr = () => { let l = parseAnd(); while (peek() === '|') { pos++; const r = parseAnd(); l = truthy(l) ? l : r; } return l; };
        const parseAnd = () => { let l = parseCmp(); while (peek() === '&') { pos++; const r = parseCmp(); l = truthy(l) && truthy(r) ? l : 0; } return l; };
        const parseCmp = () => {
            let l = parseAdd();
            while (['=', '==', '!=', '<', '>', '<=', '>='].includes(peek())) {
                const op = args[pos++]; const r = parseAdd();
                const num = isInt(l) && isInt(r);
                const a = num ? parseInt(l, 10) : String(l), b = num ? parseInt(r, 10) : String(r);
                let res;
                switch (op) { case '=': case '==': res = a === b; break; case '!=': res = a !== b; break; case '<': res = a < b; break; case '>': res = a > b; break; case '<=': res = a <= b; break; default: res = a >= b; }
                l = res ? 1 : 0;
            }
            return l;
        };
        const num = (v) => { if (!isInt(v)) fail('non-integer argument'); return parseInt(v, 10); };
        const parseAdd = () => { let l = parseMul(); while (peek() === '+' || peek() === '-') { const op = args[pos++]; const r = parseMul(); l = op === '+' ? num(l) + num(r) : num(l) - num(r); } return l; };
        const parseMul = () => {
            let l = parseMatch();
            while (peek() === '*' || peek() === '/' || peek() === '%') {
                const op = args[pos++]; const r = parseMatch();
                const a = num(l), b = num(r);
                if (op !== '*' && b === 0) fail('division by zero');
                l = op === '*' ? a * b : op === '/' ? Math.trunc(a / b) : a % b;
            }
            return l;
        };
        const parseMatch = () => {
            let l = parseAtom();
            while (peek() === ':') {
                pos++; const r = parseAtom();
                let re; try { re = new RegExp('^(?:' + String(r).replace(/\\\(/g, '(').replace(/\\\)/g, ')') + ')'); } catch (e) { fail('Invalid regular expression'); }
                const m = re.exec(String(l));
                l = m ? (m.length > 1 ? (m[1] === undefined ? '' : m[1]) : m[0].length) : (/\(/.test(String(r)) ? '' : 0);
            }
            return l;
        };
        const parseAtom = () => {
            const t = args[pos++];
            if (t === undefined) fail('syntax error: missing argument');
            if (t === '(') { const v = parseOr(); if (args[pos++] !== ')') fail("syntax error: expecting ')' after '" + (args[pos - 1] || '') + "'"); return v; }
            if (t === 'length') { const s = parseAtom(); return String(s).length; }
            if (t === 'substr') { const s = String(parseAtom()), p = num(parseAtom()), l = num(parseAtom()); return p < 1 || l < 1 ? '' : s.substr(p - 1, l); }
            if (t === 'index') { const s = String(parseAtom()), c = String(parseAtom()); let best = 0; for (const ch of c) { const i = s.indexOf(ch); if (i >= 0 && (best === 0 || i + 1 < best)) best = i + 1; } return best; }
            if (t === 'match') { const s = parseAtom(), r = parseAtom(); let re; try { re = new RegExp('^(?:' + String(r) + ')'); } catch (e) { fail('Invalid regular expression'); } const m = re.exec(String(s)); return m ? (m.length > 1 ? m[1] || '' : m[0].length) : 0; }
            return t;
        };
        let res;
        try { res = parseOr(); if (pos < args.length) fail(`syntax error: unexpected argument '${args[pos]}'`); } catch (e) { if (e.expr) return this._err('expr: ' + e.message, 2); throw e; }
        return { stdout: String(res), stderr: '', exitCode: truthy(res) ? 0 : 1 };
    }

    // ===== timeout / watch =====
    timeout(args) {
        const rest = [];
        let sig = 'TERM';
        let i = 0;
        for (; i < args.length; i++) {
            const a = args[i];
            if (a === '-s' || a === '--signal') { sig = args[++i]; continue; }
            if (a === '-k' || a === '--kill-after') { i++; continue; }
            if (/^--(foreground|preserve-status|verbose)$/.test(a) || /^-[vp]$/.test(a)) continue;
            break;
        }
        const dur = args[i];
        const cmd = args.slice(i + 1);
        if (dur === undefined) return this._err("timeout: missing operand\nTry 'timeout --help' for more information.", 125);
        const m = /^(\d+(?:\.\d+)?)([smhd]?)$/.exec(dur);
        if (!m) return this._err(`timeout: invalid time interval '${dur}'\nTry 'timeout --help' for more information.`, 125);
        if (!cmd.length) return this._err("timeout: missing operand\nTry 'timeout --help' for more information.", 125);
        const limit = parseFloat(m[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[m[2] || 's']);
        const quote = (a) => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${a.replace(/'/g, "'\\''")}'`);
        const line = cmd.map(quote).join(' ');
        const je = this.shared.jobEngine;
        if (je) {
            const C = je._classify(line);
            if (C.kind === 'long' && !C.stop && (C.secs === 0 ? limit > 0 : C.secs > limit)) return { stdout: '', stderr: '', exitCode: sig === 'KILL' || sig === '9' ? 137 : 124 };
        }
        const r = this._exec(line, '');
        return { stdout: r.out, stderr: r.err, exitCode: r.rc };
    }

    watch(args) {
        let interval = 2;
        const cmd = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (cmd.length) { cmd.push(a); continue; }
            if (a === '-n' || a === '--interval') { interval = parseFloat(args[++i]); continue; }
            if (/^-n\d/.test(a)) { interval = parseFloat(a.slice(2)); continue; }
            if (/^-[dtbcxeg]+$/.test(a) || /^--(differences|no-title|beep|color|exec)/.test(a)) continue;
            cmd.push(a);
        }
        if (!cmd.length) return this._err('watch: no command', 1);
        if (!(interval >= 0.1)) interval = 0.1;
        const line = cmd.join(' ');
        const r = this._exec(line, '');
        const head = `Every ${interval.toFixed(1)}s: ${line}`;
        const stamp = `${this.parent.hostname}: ${this._fmt(this._now(), '%a %b %e %H:%M:%S %Y')}`;
        const pad = Math.max(1, 80 - head.length - stamp.length);
        this.parent._curIo && this.parent._curIo.out(`${head}${' '.repeat(pad)}${stamp}\n\n${r.out}${r.err}`);
        const sh = this._sh();
        if (sh) sh.takeInput({ mode: 'fgjob', prompt: '', ms: 0, onCancel: () => '' });
        return this._ok('');
    }

    // ===== path and temp files =====
    realpath(args) {
        const { o, rest } = this._flags(args, []);
        if (!rest.length) return this._err("realpath: missing operand\nTry 'realpath --help' for more information.");
        const out = [], errs = [];
        for (const p of rest) {
            const abs = this.fs.resolvePath(p);
            const exists = !!this.fs.getNode(abs);
            const parentOk = !!this.fs.getNode(abs.replace(/\/[^/]*$/, '') || '/');
            if (o.e && !exists) { errs.push(`realpath: ${p}: No such file or directory`); continue; }
            if (!o.m && !exists && !parentOk) { errs.push(`realpath: ${p}: No such file or directory`); continue; }
            let r = abs;
            if (!o.s && !o['no-symlinks'] && this.parent.readlink && exists) { const x = this.parent.readlink(['-f', p]); if (x && x.stdout) r = x.stdout.trim(); }
            out.push(o.relativeTo ? r : r);
        }
        return this._result(out.join('\n'), errs);
    }

    mktemp(args) {
        const { o, rest } = this._flags(args, ['p']);
        let tpl = rest.find(a => !a.startsWith('-')) || 'tmp.XXXXXXXXXX';
        if (!/X{3,}$/.test(tpl)) return this._err(`mktemp: too few X's in template '${tpl}'`);
        const dir = o.p || o.tmpdir || (rest.length ? '' : (this.parent.env && this.parent.env.TMPDIR) || '/tmp');
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const name = tpl.replace(/X+$/, (m) => Array.from({ length: m.length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
        const path = name.startsWith('/') ? name : (dir ? dir.replace(/\/$/, '') + '/' + name : name);
        const abs = this.fs.resolvePath(path);
        const par = this.fs.getNode(abs.replace(/\/[^/]*$/, '') || '/');
        if (!par || !par.children) return this._err(`mktemp: failed to create ${o.d ? 'directory' : 'file'} via template '${path}': No such file or directory`);
        if (!this.fs.hasPermission(par, 'w')) return this._err(`mktemp: failed to create ${o.d ? 'directory' : 'file'} via template '${path}': Permission denied`);
        if (o.u) return this._ok(abs);
        const base = abs.split('/').pop();
        par.children[base] = o.d
            ? { type: 'directory', permissions: '0700', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} }
            : { type: 'file', permissions: '0600', owner: this.fs.currentUser, group: this.fs.currentUser, size: 0, modified: new Date(), content: '' };
        return this._ok(abs);
    }

    // ===== text tools =====
    _lines(text) { const l = text.split('\n'); if (l[l.length - 1] === '') l.pop(); return l; }

    nl(args, stdin) {
        const { o, rest } = this._flags(args, ['b', 'n', 's', 'w', 'v', 'i']);
        const { inputs, errs } = this._inputs(rest, stdin, 'nl');
        const style = o.b || 't', fmt = o.n || 'rn', sep = o.s !== undefined ? o.s : '\t', width = parseInt(o.w || '6', 10);
        let n = o.v !== undefined ? parseInt(o.v, 10) : 1;
        const inc = o.i !== undefined ? parseInt(o.i, 10) : 1;
        const out = [];
        for (const inp of inputs) for (const l of this._lines(inp.text)) {
            const number = style === 'a' || (style === 't' && l.trim() !== '') || (/^p/.test(style) && new RegExp(style.slice(1)).test(l));
            if (!number) { out.push(' '.repeat(width + sep.length) + l); continue; }
            const num = fmt === 'ln' ? String(n).padEnd(width) : fmt === 'rz' ? String(n).padStart(width, '0') : String(n).padStart(width);
            out.push(num + sep + l); n += inc;
        }
        return this._result(out.join('\n'), errs);
    }

    tac(args, stdin) {
        const { inputs, errs } = this._inputs(args.filter(a => !a.startsWith('-')), stdin, 'tac');
        const out = [];
        for (const inp of inputs) out.push(...this._lines(inp.text).reverse());
        return this._result(out.join('\n'), errs);
    }

    rev(args, stdin) {
        const { inputs, errs } = this._inputs(args.filter(a => !a.startsWith('-')), stdin, 'rev');
        const out = [];
        for (const inp of inputs) for (const l of this._lines(inp.text)) out.push(Array.from(l).reverse().join(''));
        return this._result(out.join('\n'), errs);
    }

    shuf(args, stdin) {
        const { o, rest } = this._flags(args, ['n', 'i', 'e']);
        let lines;
        const errs = [];
        if (o.i) { const m = /^(-?\d+)-(-?\d+)$/.exec(o.i); if (!m) return this._err(`shuf: invalid input range: '${o.i}'`); lines = []; for (let x = parseInt(m[1], 10); x <= parseInt(m[2], 10); x++) lines.push(String(x)); }
        else if (o.e) { lines = [o.e, ...rest]; }
        else { const r = this._inputs(rest, stdin, 'shuf'); errs.push(...r.errs); lines = []; for (const inp of r.inputs) lines.push(...this._lines(inp.text)); }
        for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; }
        if (o.n) lines = lines.slice(0, parseInt(o.n, 10));
        return this._result(lines.join('\n'), errs);
    }

    column(args, stdin) {
        const { o, rest } = this._flags(args, ['s', 'o', 'c']);
        const { inputs, errs } = this._inputs(rest, stdin, 'column');
        const rows = [];
        for (const inp of inputs) rows.push(...this._lines(inp.text));
        if (o.t || o.table) {
            const sepRe = o.s ? new RegExp('[' + o.s.replace(/[\]\\^-]/g, '\\$&') + ']') : /\s+/;
            const cells = rows.map(r => r.trim().split(sepRe));
            const w = [];
            cells.forEach(c => c.forEach((x, i) => { w[i] = Math.max(w[i] || 0, x.length); }));
            const outSep = o.o !== undefined ? o.o : '  ';
            return this._result(cells.map(c => c.map((x, i) => (i === c.length - 1 ? x : x.padEnd(w[i]))).join(outSep)).join('\n'), errs);
        }
        const width = parseInt(o.c || '80', 10);
        const maxw = Math.max(0, ...rows.map(r => r.length)) + 2;
        const cols = Math.max(1, Math.floor(width / maxw));
        const per = Math.ceil(rows.length / cols);
        const out = [];
        for (let r = 0; r < per; r++) { const parts = []; for (let c = 0; c < cols; c++) { const v = rows[c * per + r]; if (v !== undefined) parts.push(v.padEnd(maxw)); } out.push(parts.join('').replace(/\s+$/, '')); }
        return this._result(out.join('\n'), errs);
    }

    // ===== binary dumps =====
    _bytes(text) { return UTIL_HASH.utf8(text); }

    od(args, stdin) {
        const { o, rest } = this._flags(args, ['A', 't', 'N', 'j', 'w']);
        const { inputs, errs } = this._inputs(rest, stdin, 'od');
        const bytes = [];
        for (const inp of inputs) bytes.push(...this._bytes(inp.text));
        const base = (o.A || 'o');
        const width = parseInt(o.w || '16', 10);
        const radix = (n) => (base === 'x' ? n.toString(16).padStart(7, '0') : base === 'd' ? String(n).padStart(7, '0') : base === 'n' ? '' : n.toString(8).padStart(7, '0'));
        let type = o.t || (o.c ? 'c' : o.x ? 'x2' : o.b ? 'o1' : 'o2');
        const lim = o.N ? parseInt(o.N, 10) : bytes.length;
        const data = bytes.slice(parseInt(o.j || '0', 10), parseInt(o.j || '0', 10) + lim);
        const out = [];
        const esc = (b) => ({ 0: '\\0', 7: '\\a', 8: '\\b', 9: '\\t', 10: '\\n', 11: '\\v', 12: '\\f', 13: '\\r' }[b] || (b >= 32 && b < 127 ? String.fromCharCode(b) : b.toString(8).padStart(3, '0')));
        for (let off = 0; off < data.length; off += width) {
            const chunk = data.slice(off, off + width);
            let cells;
            if (type === 'c') cells = chunk.map(b => esc(b).padStart(4));
            else if (/^x1/.test(type)) cells = chunk.map(b => b.toString(16).padStart(2, '0').padStart(3));
            else if (/^d1|^u1/.test(type)) cells = chunk.map(b => String(b).padStart(4));
            else if (/^o1/.test(type)) cells = chunk.map(b => b.toString(8).padStart(3, '0').padStart(4));
            else {
                const size = /x4|o4|d4|u4/.test(type) ? 4 : 2;
                cells = [];
                for (let i = 0; i < chunk.length; i += size) { let v = 0; for (let k = size - 1; k >= 0; k--) v = v * 256 + (chunk[i + k] || 0); cells.push((/^x/.test(type) ? v.toString(16).padStart(size * 2, '0') : /^d|^u/.test(type) ? String(v) : v.toString(8).padStart(size === 2 ? 6 : 11, '0')).padStart(size === 2 ? 7 : 12)); }
            }
            out.push(radix(off) + cells.join(''));
        }
        out.push(radix(data.length));
        return this._result(out.join('\n'), errs);
    }

    xxd(args, stdin) {
        const { o, rest } = this._flags(args, ['l', 'c', 'g', 's']);
        const { inputs, errs } = this._inputs(rest, stdin, 'xxd');
        if (o.r) {
            const hex = inputs.map(i => i.text).join('').split('\n').map(l => (o.p ? l : l.replace(/^[0-9a-f]+:\s*/i, '').replace(/\s{2}.*$/, ''))).join('').replace(/\s+/g, '');
            let s = '';
            for (let i = 0; i + 1 < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            return { stdout: s, rawStdout: s, stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
        }
        let bytes = [];
        for (const inp of inputs) bytes.push(...this._bytes(inp.text));
        if (o.l) bytes = bytes.slice(0, parseInt(o.l, 10));
        const out = [];
        if (o.p) {
            const cols = parseInt(o.c || '30', 10);
            for (let i = 0; i < bytes.length; i += cols) out.push(bytes.slice(i, i + cols).map(b => b.toString(16).padStart(2, '0')).join(''));
            return this._result(out.join('\n'), errs);
        }
        const cols = parseInt(o.c || '16', 10), grp = parseInt(o.g || '2', 10);
        for (let off = 0; off < bytes.length; off += cols) {
            const chunk = bytes.slice(off, off + cols);
            let hex = '';
            for (let i = 0; i < cols; i += grp) { const part = chunk.slice(i, i + grp).map(b => b.toString(16).padStart(2, '0')).join(''); hex += part.padEnd(grp * 2) + ' '; }
            out.push(`${off.toString(16).padStart(8, '0')}: ${hex} ${chunk.map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('')}`);
        }
        return this._result(out.join('\n'), errs);
    }

    hexdump(args, stdin) {
        const { o, rest } = this._flags(args, ['n', 's']);
        const { inputs, errs } = this._inputs(rest, stdin, 'hexdump');
        let bytes = [];
        for (const inp of inputs) bytes.push(...this._bytes(inp.text));
        if (o.n) bytes = bytes.slice(0, parseInt(o.n, 10));
        const out = [];
        if (o.C) {
            for (let off = 0; off < bytes.length; off += 16) {
                const chunk = bytes.slice(off, off + 16);
                const h = chunk.map(b => b.toString(16).padStart(2, '0'));
                const left = h.slice(0, 8).join(' ').padEnd(23), right = h.slice(8).join(' ').padEnd(23);
                out.push(`${off.toString(16).padStart(8, '0')}  ${left}  ${right}  |${chunk.map(b => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('')}|`);
            }
            out.push(bytes.length.toString(16).padStart(8, '0'));
        } else {
            for (let off = 0; off < bytes.length; off += 16) {
                const chunk = bytes.slice(off, off + 16);
                const words = [];
                for (let i = 0; i < chunk.length; i += 2) words.push((((chunk[i + 1] || 0) << 8) | chunk[i]).toString(16).padStart(4, '0'));
                out.push(off.toString(16).padStart(7, '0') + ' ' + words.join(' '));
            }
            out.push(bytes.length.toString(16).padStart(7, '0'));
        }
        return this._result(out.join('\n'), errs);
    }

    strings(args, stdin) {
        const { o, rest } = this._flags(args, ['n']);
        const min = parseInt(o.n || '4', 10);
        const { inputs, errs } = this._inputs(rest, stdin, 'strings');
        const out = [];
        for (const inp of inputs) { const re = new RegExp(`[\\x20-\\x7e\\t]{${min},}`, 'g'); const m = inp.text.match(re); if (m) out.push(...m); }
        return this._result(out.join('\n'), errs);
    }

    ldd(args) {
        const out = [], errs = [];
        const known = {
            ls: ['libselinux.so.1 => /lib64/libselinux.so.1', 'libcap.so.2 => /lib64/libcap.so.2'], cat: [], bash: ['libtinfo.so.6 => /lib64/libtinfo.so.6'], grep: ['libpcre.so.1 => /lib64/libpcre.so.1', 'libc.so.6 => /lib64/libc.so.6'],
            sshd: ['libcrypt.so.2 => /lib64/libcrypt.so.2', 'libaudit.so.1 => /lib64/libaudit.so.1', 'libselinux.so.1 => /lib64/libselinux.so.1', 'libpam.so.0 => /lib64/libpam.so.0'],
            systemctl: ['libsystemd-shared-252.so => /usr/lib64/systemd/libsystemd-shared-252.so', 'libcap.so.2 => /lib64/libcap.so.2'], ssh: ['libcrypto.so.3 => /lib64/libcrypto.so.3', 'libselinux.so.1 => /lib64/libselinux.so.1'],
            curl: ['libcurl.so.4 => /lib64/libcurl.so.4'], python3: ['libpython3.9.so.1.0 => /lib64/libpython3.9.so.1.0', 'libm.so.6 => /lib64/libm.so.6'], passwd: ['libselinux.so.1 => /lib64/libselinux.so.1', 'libaudit.so.1 => /lib64/libaudit.so.1']
        };
        if (!args.length) return this._err("ldd: missing file arguments\nTry `ldd --help' for more information.");
        const files = args.filter(a => !a.startsWith('-'));
        for (const f of files) {
            let path = f;
            if (!f.includes('/')) { path = ['/usr/bin', '/usr/sbin', '/bin', '/sbin'].map(d => d + '/' + f).find(p => this.fs.getNode(p)) || f; }
            const n = this.fs.getNode(path);
            if (!n) { errs.push(`ldd: ${f}: No such file or directory`); continue; }
            if (n.type === 'directory') { errs.push(`ldd: ${f}: not regular file`); continue; }
            const base = path.split('/').pop();
            const script = (n.content || '').startsWith('#!');
            const prefix = files.length > 1 ? `${f}:\n` : '';
            if (script || /\.(sh|conf|txt|cfg|repo|service|timer)$/.test(base) || path.startsWith('/etc/')) { out.push(prefix + '\tnot a dynamic executable'); continue; }
            const addr = (n) => '0x00007f' + (Math.floor(Math.random() * 0xffffff)).toString(16).padStart(6, '0') + '000';
            const libs = ['linux-vdso.so.1 (0x00007ffd' + Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0') + '1000)'];
            for (const l of (known[base] || [])) libs.push(l + ' (' + addr() + ')');
            libs.push('libc.so.6 => /lib64/libc.so.6 (' + addr() + ')');
            libs.push('/lib64/ld-linux-x86-64.so.2 (' + addr() + ')');
            out.push(prefix + libs.map(l => '\t' + l).join('\n'));
        }
        return this._result(out.join('\n'), errs);
    }

    // ===== comparing and splitting =====
    cmp(args) {
        const { o, rest } = this._flags(args, []);
        if (rest.length < 2) return this._err('cmp: missing operand after ‘' + (rest[0] || 'cmp') + '’\nTry \'cmp --help\' for more information.', 2);
        const read = (f) => { if (f === '-') return { text: '' }; const n = this.fs.getNode(this.fs.resolvePath(f)); return n ? { text: n.content || '' } : { err: `cmp: ${f}: No such file or directory` }; };
        const a = read(rest[0]), b = read(rest[1]);
        if (a.err || b.err) return this._err([a.err, b.err].filter(Boolean).join('\n'), 2);
        const x = this._bytes(a.text), y = this._bytes(b.text);
        const out = [];
        const n = Math.min(x.length, y.length);
        for (let i = 0; i < n; i++) {
            if (x[i] !== y[i]) {
                if (o.s || o.silent) return { stdout: '', stderr: '', exitCode: 1 };
                if (o.l) { out.push(`${i + 1} ${x[i].toString(8).padStart(3)} ${y[i].toString(8).padStart(3)}`); continue; }
                const line = x.slice(0, i).filter(c => c === 10).length + 1;
                return { stdout: `${rest[0]} ${rest[1]} differ: byte ${i + 1}, line ${line}`, stderr: '', exitCode: 1 };
            }
        }
        if (x.length !== y.length) {
            if (o.s) return { stdout: '', stderr: '', exitCode: 1 };
            return { stdout: out.join('\n'), stderr: `cmp: EOF on ${x.length < y.length ? rest[0] : rest[1]} after byte ${n}${o.l ? '' : ', line ' + (x.slice(0, n).filter(c => c === 10).length)}`, exitCode: 1 };
        }
        return { stdout: out.join('\n'), stderr: '', exitCode: out.length ? 1 : 0 };
    }

    comm(args) {
        const { o, rest } = this._flags(args, []);
        if (rest.length < 2) return this._err(`comm: missing operand after '${rest[rest.length - 1] || 'comm'}'\nTry 'comm --help' for more information.`);
        const rd = (f) => { const n = this.fs.getNode(this.fs.resolvePath(f)); return n && n.type === 'file' ? this._lines(n.content || '') : null; };
        const a = rd(rest[0]), b = rd(rest[1]);
        if (!a) return this._err(`comm: ${rest[0]}: No such file or directory`);
        if (!b) return this._err(`comm: ${rest[1]}: No such file or directory`);
        const out = [];
        let i = 0, j = 0;
        const col = (c, s) => { if (o[c]) return; const pre = (c === '2' ? (o['1'] ? 0 : 1) : c === '3' ? (o['1'] ? 0 : 1) + (o['2'] ? 0 : 1) : 0); out.push('\t'.repeat(pre) + s); };
        while (i < a.length || j < b.length) {
            if (j >= b.length || (i < a.length && a[i] < b[j])) col('1', a[i++]);
            else if (i >= a.length || b[j] < a[i]) col('2', b[j++]);
            else { col('3', a[i]); i++; j++; }
        }
        return this._ok(out.join('\n'));
    }

    fold(args, stdin) {
        const { o, rest } = this._flags(args, ['w']);
        const w = parseInt(o.w || '80', 10);
        const { inputs, errs } = this._inputs(rest, stdin, 'fold');
        const out = [];
        for (const inp of inputs) for (const l of this._lines(inp.text)) {
            let s = l;
            if (!s.length) { out.push(''); continue; }
            while (s.length > w) {
                let cut = w;
                if (o.s) { const sp = s.lastIndexOf(' ', w - 1); if (sp > 0) cut = sp + 1; }
                out.push(s.slice(0, cut)); s = s.slice(cut);
            }
            out.push(s);
        }
        return this._result(out.join('\n'), errs);
    }

    split(args, stdin) {
        const { o, rest } = this._flags(args, ['l', 'b', 'a', 'C']);
        const file = rest[0], prefix = rest[1] || 'x';
        let text;
        if (!file || file === '-') text = stdin || '';
        else { const n = this.fs.getNode(this.fs.resolvePath(file)); if (!n) return this._err(`split: cannot open '${file}' for reading: No such file or directory`); text = n.content || ''; }
        const alen = parseInt(o.a || '2', 10);
        const suffix = (i) => { if (o.d) return String(i).padStart(alen, '0'); let s = ''; let n = i; for (let k = 0; k < alen; k++) { s = String.fromCharCode(97 + (n % 26)) + s; n = Math.floor(n / 26); } return s; };
        let chunks = [];
        if (o.b) {
            const m = /^(\d+)([KMG]?)$/i.exec(o.b);
            if (!m) return this._err(`split: invalid number of bytes: ‘${o.b}’`);
            const size = parseInt(m[1], 10) * ({ '': 1, K: 1024, M: 1048576, G: 1073741824 }[m[2].toUpperCase()]);
            for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
        } else {
            const per = parseInt(o.l || '1000', 10);
            const lines = text.split('\n'); const trail = lines[lines.length - 1] === ''; if (trail) lines.pop();
            for (let i = 0; i < lines.length; i += per) chunks.push(lines.slice(i, i + per).join('\n') + (i + per < lines.length || trail ? '\n' : ''));
        }
        chunks.forEach((c, i) => this._write(suffix.length ? prefix + suffix(i) : prefix, c));
        return this._ok('');
    }

    // ===== files and directories =====
    rmdir(args) {
        const { o, rest } = this._flags(args, []);
        if (!rest.length) return this._err("rmdir: missing operand\nTry 'rmdir --help' for more information.");
        const errs = [];
        for (const d of rest) {
            let abs = this.fs.resolvePath(d);
            const chain = o.p || o.parents ? abs.split('/').filter(Boolean).map((_, i, a) => '/' + a.slice(0, a.length - i).join('/')) : [abs];
            for (const p of chain) {
                if (p === '/') break;
                const n = this.fs.getNode(p);
                if (!n) { errs.push(`rmdir: failed to remove '${d}': No such file or directory`); break; }
                if (n.type !== 'directory') { errs.push(`rmdir: failed to remove '${d}': Not a directory`); break; }
                if (Object.keys(n.children || {}).length) { if (!o['ignore-fail-on-non-empty']) errs.push(`rmdir: failed to remove '${p === abs ? d : p}': Directory not empty`); break; }
                const par = this.fs.getNode(p.replace(/\/[^/]*$/, '') || '/');
                if (!par || !this.fs.hasPermission(par, 'w')) { errs.push(`rmdir: failed to remove '${d}': Permission denied`); break; }
                if (o.v || o.verbose) errs.push(`rmdir: removing directory, '${p === abs ? d : p}'`);
                delete par.children[p.split('/').pop()];
            }
        }
        const real = errs.filter(e => !/removing directory/.test(e));
        return { stdout: errs.filter(e => /removing directory/.test(e)).join('\n'), stderr: real.join('\n'), exitCode: real.length ? 1 : 0 };
    }

    install(args) {
        const { o, rest } = this._flags(args, ['m', 'o', 'g', 't']);
        const mode = o.m || (o.d ? '0755' : '0755');
        const call = (cmd, a) => { const f = this.parent[cmd]; return typeof f === 'function' ? f.call(this.parent, a) : { stdout: '', stderr: '', exitCode: 0 }; };
        const errs = [];
        if (o.d) {
            if (!rest.length) return this._err("install: missing file operand\nTry 'install --help' for more information.");
            for (const d of rest) { const r = call('mkdir', ['-p', d]); if (r.exitCode) errs.push(r.stderr); else { call('chmod', [mode, d]); if (o.o) call('chown', [o.o + (o.g ? ':' + o.g : ''), d]); } }
            return this._result('', errs.filter(Boolean));
        }
        const target = o.t || rest[rest.length - 1];
        const srcs = o.t ? rest : rest.slice(0, -1);
        if (!srcs.length) return this._err(`install: missing destination file operand after '${rest[0] || ''}'\nTry 'install --help' for more information.`);
        for (const s of srcs) {
            const dstNode = this.fs.getNode(this.fs.resolvePath(target));
            const dest = dstNode && dstNode.children ? target.replace(/\/$/, '') + '/' + s.split('/').pop() : target;
            const r = call('cp', [s, dest]);
            if (r.exitCode) { errs.push(r.stderr.replace(/^cp:/, 'install:')); continue; }
            call('chmod', [mode, dest]);
            if (o.o || o.g) call('chown', [(o.o || '') + (o.g ? ':' + o.g : ''), dest]);
        }
        return this._result('', errs.filter(Boolean));
    }

    // ===== system info =====
    nproc(args) { return this._ok(args.includes('--all') ? '2' : '2'); }
    arch() { return this._ok('x86_64'); }
    tty() { const io = this.parent._curIo; return io && io.piped ? { stdout: 'not a tty', stderr: '', exitCode: 1 } : this._ok('/dev/pts/0'); }
    mesg(args) { return args[0] === 'n' ? this._ok('') : (args[0] === 'y' ? this._ok('') : this._ok('is y')); }
    factor(args, stdin) {
        const nums = args.length ? args : (stdin || '').split(/\s+/).filter(Boolean);
        const out = [], errs = [];
        for (const a of nums) {
            if (!/^\d+$/.test(a)) { errs.push(`factor: ‘${a}’ is not a valid positive integer`); continue; }
            let n = BigInt(a); const f = [];
            for (let p = 2n; p * p <= n && f.length < 64; p++) while (n % p === 0n) { f.push(p); n /= p; }
            if (n > 1n || !f.length) f.push(n);
            out.push(`${a}: ${f.join(' ')}`);
        }
        return this._result(out.join('\n'), errs);
    }
    users() { const u = new Set(['root']); const w = this.parent.who; if (typeof w === 'function') { /* who lists the same session */ } u.add(this.fs.currentUser); return this._ok([...u].join(' ')); }
    lastlog(args) {
        const rows = [];
        const users = Object.entries(this.fs.users).filter(([n, u]) => u.uid === 0 || u.uid >= 1000 || n === 'nobody').sort((a, b) => a[1].uid - b[1].uid);
        rows.push('Username         Port     From             Latest');
        for (const [n, u] of users) {
            if (n === this.fs.currentUser || n === 'root') rows.push(`${n.padEnd(16)} pts/0    192.168.1.10     ${this._fmt(this._now(), '%a %b %e %H:%M:%S %z %Y')}`);
            else rows.push(`${n.padEnd(16)}                                   **Never logged in**`);
        }
        return this._ok(rows.join('\n'));
    }
    lastb() {
        if (!this._isRoot()) return this._err('lastb: cannot open /var/log/btmp: Permission denied');
        return this._ok(`\nbtmp begins ${this._fmt(new Date(this._now().getTime() - 6 * 86400000), '%a %b %e %H:%M:%S %Y')}`);
    }
    wall(args, stdin) {
        const msg = args.length ? args.join(' ') : (stdin || '').trim();
        if (!this._isRoot() && false) return this._err('wall: permission denied');
        return this._ok(`\nBroadcast message from ${this.fs.currentUser}@${this.parent.hostname} (pts/0) (${this._fmt(this._now(), '%a %b %e %H:%M:%S %Y')}):\n\n${msg}\n`);
    }
    write(args, stdin) {
        if (!args.length) return this._err('Usage: write user [tty]');
        if (!this.fs.users[args[0]]) return this._err(`write: ${args[0]} is not logged in`);
        return this._err(`write: ${args[0]} is not logged in`);
    }
    ionice(args) {
        const { o, rest } = this._flags(args, ['c', 'n', 'p']);
        if (o.p && !o.c && !o.n) return this._ok('best-effort: prio 4');
        if (!rest.length && !o.p) return this._ok('best-effort: prio 4');
        if (rest.length) { const r = this._exec(rest.join(' '), ''); return { stdout: r.out, stderr: r.err, exitCode: r.rc }; }
        return this._ok('');
    }
    taskset(args) {
        const { o, rest } = this._flags(args, ['c']);
        if (o.p) {
            const pid = rest[rest.length - 1];
            const found = this.shared.processes.find(p => String(p.pid) === pid);
            if (!found) return this._err(`taskset: failed to get pid ${pid}'s affinity: No such process`);
            if (rest.length > 1 || (o.c && rest.length)) return this._ok(`pid ${pid}'s current affinity list: 0,1\npid ${pid}'s new affinity list: ${o.c || rest[0]}`);
            return this._ok(o.c ? `pid ${pid}'s current affinity list: 0,1` : `pid ${pid}'s current affinity mask: 3`);
        }
        if (!rest.length) return this._err('Usage: taskset [options] [mask | cpu-list] [pid|cmd [args...]]');
        const r = this._exec(rest.slice(1).join(' '), '');
        return { stdout: r.out, stderr: r.err, exitCode: r.rc };
    }
    chrt(args) {
        const { o, rest } = this._flags(args, []);
        if (o.p && rest.length === 1) { const pid = rest[0]; if (!this.shared.processes.find(p => String(p.pid) === pid)) return this._err(`chrt: failed to get pid ${pid}'s policy: No such process`); return this._ok(`pid ${pid}'s current scheduling policy: SCHED_OTHER\npid ${pid}'s current scheduling priority: 0`); }
        return this._ok('');
    }
    pwck() {
        const out = [];
        for (const [n, u] of Object.entries(this.fs.users)) if (u.home && u.home !== '/' && !/nologin|false/.test(u.shell || '') && !this.fs.getNode(u.home)) out.push(`user '${n}': directory '${u.home}' does not exist`);
        out.push('pwck: no changes');
        return { stdout: out.join('\n'), stderr: '', exitCode: out.length > 1 ? 2 : 0 };
    }
    grpck() { return this._ok(''); }
    pwconv() { return this._ok(''); }
    grpconv() { return this._ok(''); }
    faillock(args) {
        const { o } = this._flags(args, ['user']);
        const u = (args.indexOf('--user') >= 0 ? args[args.indexOf('--user') + 1] : null) || this.fs.currentUser;
        if (args.includes('--reset')) return this._ok('');
        return this._ok(`${u}:\nWhen                Type  Source                                           Valid`);
    }
    info(args) {
        const topic = args.find(a => !a.startsWith('-'));
        if (!topic) return this._ok('Next: (dir)    Prev: (dir)    Up: (dir)\n\nFile: dir,\tNode: Top\tThis is the top of the INFO tree\n\n* Menu:\n\nBasics\n* Common options: (coreutils)Common options.\n* Coreutils: (coreutils).       Core GNU utilities.');
        if (typeof this.parent.man === 'function') return this.parent.man([topic]);
        return this._err(`info: No menu item '${topic}' in node '(dir)Top'`);
    }
}

if (typeof window !== 'undefined') {
    window.UtilEngine = UtilEngine;
    window.UTIL_HASH = UTIL_HASH;
}
if (typeof module !== 'undefined') module.exports = { UTIL_HASH, UtilEngine };
