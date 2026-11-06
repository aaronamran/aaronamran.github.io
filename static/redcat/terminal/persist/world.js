// Saves and restores the whole simulated machine (filesystem plus the state inside every command engine)
// Part of Red Cat RHCSA Terminal Simulator
//
// Only what differs from a freshly built machine is stored ("delta"), so constants such as the package
// catalog or unit definitions are never saved and a changed site simply ignores a stale save.

class WorldState {
    static get KEY() { return 'redcat_world'; }
    static get VERSION() { return 1; }

    constructor(terminal) {
        this.terminal = terminal;
        this.pristine = {};
        this.saveTimer = null;
        this.warned = false;
    }

    // ------------------------------------------------------------ codec
    // JSON-safe form of a value; returns undefined for things that cannot be saved (functions, back-references)
    encode(v, depth = 0, seen = []) {
        if (v === undefined || typeof v === 'function' || typeof v === 'symbol') return undefined;
        if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
        if (typeof v === 'number') return Number.isFinite(v) ? v : { $: 'num', v: String(v) };
        if (typeof v === 'bigint') return { $: 'num', v: String(v) };
        if (depth > 40 || seen.includes(v) || this.isOpaque(v)) return undefined;
        if (v instanceof Date) return { $: 'date', v: v.getTime() };
        if (v instanceof RegExp) return { $: 're', s: v.source, f: v.flags };
        seen.push(v);
        let out;
        if (v instanceof Set) {
            out = { $: 'set', v: [...v].map(x => this.encode(x, depth + 1, seen)).filter(x => x !== undefined) };
        } else if (v instanceof Map) {
            out = { $: 'map', v: [...v].map(([k, x]) => [this.encode(k, depth + 1, seen), this.encode(x, depth + 1, seen)]).filter(p => p[0] !== undefined && p[1] !== undefined) };
        } else if (Array.isArray(v)) {
            out = v.map(x => { const e = this.encode(x, depth + 1, seen); return e === undefined ? null : e; });
        } else {
            out = {};
            for (const k of Object.keys(v)) {
                const d = Object.getOwnPropertyDescriptor(v, k);
                if (d && d.get) continue;   // derived value, not state
                const e = this.encode(v[k], depth + 1, seen);
                if (e !== undefined) out[k] = e;
            }
        }
        seen.pop();
        return out;
    }

    decode(v) {
        if (v === null || typeof v !== 'object') return v;
        if (Array.isArray(v)) return v.map(x => this.decode(x));
        switch (v.$) {
            case 'num': return Number(v.v);
            case 'date': return new Date(v.v);
            case 're': return new RegExp(v.s, v.f);
            case 'set': return new Set(v.v.map(x => this.decode(x)));
            case 'map': return new Map(v.v.map(([k, x]) => [this.decode(k), this.decode(x)]));
        }
        const out = {};
        for (const k of Object.keys(v)) out[k] = this.decode(v[k]);
        return out;
    }

    // objects that must never be walked into: the machine itself, its engines, the DOM
    isOpaque(v) {
        const t = this.terminal;
        if (v === t || v === t.fs || v === t.commands) return true;
        if (t.commands && (t.commands._shared === v || (t.commands._modules && t.commands._modules.includes(v)))) return true;
        if (typeof Node !== 'undefined' && v instanceof Node) return true;
        if (typeof Window !== 'undefined' && v instanceof Window) return true;
        return false;
    }

    // per-call scratch the shell leaves on the commands object
    static get TRANSIENT() { return ['_curIo', '_stdoutIsPipe', '_hasStdin']; }

    // ------------------------------------------------------------ targets
    targets() {
        const t = this.terminal, out = [['fs', t.fs, []]];
        if (t.commands) {
            out.push(['cmds', t.commands, ['fs', '_modules', '_shared', 'shared', 'parent']]);
            (t.commands._modules || []).forEach((m, i) => out.push([`m${i}:${m.constructor.name}`, m, ['fs', 'shared', 'parent']]));
        }
        return out;
    }

    // a different set of engines means the save belongs to another version of the site
    fingerprint() {
        return this.targets().map(([id]) => id).join('|');
    }

    str(v) { return JSON.stringify(v); }

    markPristine() {
        this.pristine = {};
        for (const [id, obj, skip] of this.targets()) {
            const p = this.pristine[id] = {};
            for (const k of Object.keys(obj)) {
                if (skip.includes(k) || WorldState.TRANSIENT.includes(k)) continue;
                const e = this.encode(obj[k]);
                if (e !== undefined) p[k] = this.str(e);
            }
        }
    }

    // ------------------------------------------------------------ capture / apply
    capture() {
        const delta = {};
        for (const [id, obj, skip] of this.targets()) {
            const p = this.pristine[id] || {};
            for (const k of Object.keys(obj)) {
                if (skip.includes(k) || WorldState.TRANSIENT.includes(k)) continue;
                const e = this.encode(obj[k]);
                if (e === undefined) continue;
                const text = this.str(e);
                // values holding a timestamp are built from the clock at startup, so "unchanged" is relative to this load
                if (p[k] === text && !text.includes('"$":"date"')) continue;
                (delta[id] = delta[id] || {})[k] = e;
            }
        }
        return delta;
    }

    // Writes `value` into target[key], reusing the existing container so engines that share it keep sharing it.
    assignInPlace(target, key, value) {
        const cur = target[key];
        target[key] = this.merge(cur, value);
    }

    merge(cur, value) {
        const isPlain = (x) => x && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Date) && !(x instanceof Set) && !(x instanceof Map) && !(x instanceof RegExp);
        if (Array.isArray(cur) && Array.isArray(value)) {
            cur.length = 0;
            for (const x of value) cur.push(x);
            return cur;
        }
        if (cur instanceof Set && value instanceof Set) { cur.clear(); for (const x of value) cur.add(x); return cur; }
        if (cur instanceof Map && value instanceof Map) { cur.clear(); for (const [k, x] of value) cur.set(k, x); return cur; }
        if (isPlain(cur) && isPlain(value)) {
            for (const k of Object.keys(cur)) if (!(k in value)) delete cur[k];
            for (const k of Object.keys(value)) {
                const d = Object.getOwnPropertyDescriptor(cur, k);
                if (d && !d.set && d.get) continue;
                cur[k] = (k in cur) ? this.merge(cur[k], value[k]) : value[k];
            }
            return cur;
        }
        return value;
    }

    apply(delta) {
        const byId = new Map(this.targets().map(([id, obj]) => [id, obj]));
        for (const [id, props] of Object.entries(delta)) {
            const obj = byId.get(id);
            if (!obj) continue;
            for (const [k, v] of Object.entries(props)) this.assignInPlace(obj, k, this.decode(v));
        }
    }

    // ------------------------------------------------------------ storage
    storage() {
        try { return window.localStorage; } catch (e) { return null; }
    }

    save(extra = {}) {
        const c = this.terminal.commands;
        if (c && c._ctrActive && c._ctrActive()) return false;   // a container's filesystem is never the host's
        const ls = this.storage();
        if (!ls) return false;
        const record = {
            v: WorldState.VERSION,
            finger: this.fingerprint(),
            savedAt: Date.now(),
            delta: this.capture(),
            term: Object.assign({ history: this.terminal.history || [] }, extra)
        };
        try {
            ls.setItem(WorldState.KEY, JSON.stringify(record));
            return true;
        } catch (e) {
            if (!this.warned) { this.warned = true; console.warn('Red Cat: could not save the machine state', e); }
            return false;
        }
    }

    scheduleSave(extraFn) {
        if (this.saveTimer) return;
        this.saveTimer = setTimeout(() => {
            this.saveTimer = null;
            this.save(extraFn ? extraFn() : {});
        }, 400);
    }

    // returns the saved record when it fits this version of the machine, else null
    load() {
        const ls = this.storage();
        if (!ls) return null;
        let record;
        try { record = JSON.parse(ls.getItem(WorldState.KEY)); } catch (e) { return null; }
        if (!record || record.v !== WorldState.VERSION || record.finger !== this.fingerprint()) return null;
        return record;
    }

    clear() {
        if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
        const ls = this.storage();
        try { if (ls) ls.removeItem(WorldState.KEY); } catch (e) { /* ignore */ }
    }
}

window.WorldState = WorldState;
