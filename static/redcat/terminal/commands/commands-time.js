// Time model: date, timedatectl, hwclock, chronyc makestep
// Part of Red Cat RHCSA Terminal Simulator
//
// One clock model (system clock, hardware clock, time zone, NTP flag) drives all of these commands.

class TimeCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.timeCmds = this;
        const self = this;
        // NTP is on exactly when chronyd is running
        this.tm = { tz: 'America/New_York', localRtc: false, offsetMs: 0, rtcOffsetMs: 0, get ntp() { const c = self.shared.services.chronyd; return !!(c && c.active); } };
        this.tzAbbr = {
            'America/New_York': ['EST', 'EDT'], 'America/Chicago': ['CST', 'CDT'], 'America/Denver': ['MST', 'MDT'], 'America/Los_Angeles': ['PST', 'PDT'], 'America/Phoenix': ['MST', 'MST'],
            'America/Toronto': ['EST', 'EDT'], 'America/Anchorage': ['AKST', 'AKDT'], 'Europe/London': ['GMT', 'BST'], 'Europe/Dublin': ['GMT', 'IST'], 'Europe/Paris': ['CET', 'CEST'], 'Europe/Berlin': ['CET', 'CEST'],
            'Europe/Madrid': ['CET', 'CEST'], 'Europe/Rome': ['CET', 'CEST'], 'Europe/Amsterdam': ['CET', 'CEST'], 'Europe/Moscow': ['MSK', 'MSK'], 'Asia/Tokyo': ['JST', 'JST'], 'Asia/Seoul': ['KST', 'KST'], 'Asia/Kolkata': ['IST', 'IST'],
            'Asia/Shanghai': ['CST', 'CST'], 'Asia/Hong_Kong': ['HKT', 'HKT'], 'Australia/Sydney': ['AEST', 'AEDT'], 'Pacific/Auckland': ['NZST', 'NZDT'], 'UTC': ['UTC', 'UTC'], 'Etc/UTC': ['UTC', 'UTC'], 'GMT': ['GMT', 'GMT'],
            'Africa/Johannesburg': ['SAST', 'SAST'], 'Africa/Cairo': ['EET', 'EEST'], 'Europe/Athens': ['EET', 'EEST'], 'Pacific/Honolulu': ['HST', 'HST']
        };
        this.sysFile();
    }

    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _root() { return this.fs.currentUid === 0; }

    now() { return new Date(Date.now() + this.tm.offsetMs); }
    rtc() { return new Date(Date.now() + this.tm.rtcOffsetMs); }

    validTz(z) {
        if (z === 'UTC' || z === 'GMT') return true;
        try { new Intl.DateTimeFormat('en-US', { timeZone: z }); return /^[A-Za-z_]+(\/[A-Za-z_+\-0-9]+)*$/.test(z) && z.includes('/'); } catch (e) { return false; }
    }

    // wall clock parts of an instant in a zone
    parts(date, tz) {
        const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short' });
        const o = {};
        for (const p of f.formatToParts(date)) o[p.type] = p.value;
        const asUtc = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second);
        const offMin = Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
        const abbrs = this.tzAbbr[tz];
        let abbr;
        if (abbrs) {
            const jan = this.offsetMin(new Date(Date.UTC(date.getUTCFullYear(), 0, 1)), tz), jul = this.offsetMin(new Date(Date.UTC(date.getUTCFullYear(), 6, 1)), tz);
            const std = Math.min(jan, jul);
            abbr = offMin === std || jan === jul ? abbrs[0] : abbrs[1];
        } else {
            const sign = offMin < 0 ? '-' : '+';
            const a = Math.abs(offMin);
            abbr = `${sign}${String(Math.floor(a / 60)).padStart(2, '0')}${a % 60 ? String(a % 60).padStart(2, '0') : ''}`;
        }
        return { Y: +o.year, m: +o.month, d: +o.day, H: +o.hour % 24, M: +o.minute, S: +o.second, wd: o.weekday, offMin, abbr, ms: date.getUTCMilliseconds() };
    }

    offsetMin(date, tz) {
        const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
        const o = {};
        for (const p of f.formatToParts(date)) o[p.type] = p.value;
        return Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second) - Math.floor(date.getTime() / 1000) * 1000) / 60000);
    }

    zoneOf(env) { const tz = env && env.TZ; return tz && this.validTz(tz) ? tz : (tz === 'UTC' ? 'UTC' : this.tm.tz); }

    sysFile() {
        const lt = this.fs.getNode('/etc/localtime');
        const tzn = this.fs.getNode('/etc/timezone');
        void lt; void tzn;
    }

    offStr(offMin, colon) {
        const sign = offMin < 0 ? '-' : '+';
        const a = Math.abs(offMin);
        return `${sign}${String(Math.floor(a / 60)).padStart(2, '0')}${colon ? ':' : ''}${String(a % 60).padStart(2, '0')}`;
    }

    format(date, tz, fmt) {
        const p = this.parts(date, tz);
        const pad = (n, w = 2, c = '0') => String(n).padStart(w, c);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mons = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dow = days.findIndex(d => d.startsWith(p.wd));
        const doy = Math.floor((Date.UTC(p.Y, p.m - 1, p.d) - Date.UTC(p.Y, 0, 0)) / 86400000);
        const h12 = p.H % 12 || 12;
        return fmt.replace(/%([-_0^#]?)([a-zA-Z%])/g, (m, flag, c) => {
            let r;
            switch (c) {
                case 'Y': r = String(p.Y); break; case 'y': r = pad(p.Y % 100); break; case 'C': r = pad(Math.floor(p.Y / 100)); break;
                case 'm': r = pad(p.m); break; case 'd': r = pad(p.d); break; case 'e': r = pad(p.d, 2, ' '); break;
                case 'H': r = pad(p.H); break; case 'I': r = pad(h12); break; case 'k': r = pad(p.H, 2, ' '); break; case 'l': r = pad(h12, 2, ' '); break;
                case 'M': r = pad(p.M); break; case 'S': r = pad(p.S); break; case 'N': r = pad(p.ms * 1000000, 9); break;
                case 'p': r = p.H < 12 ? 'AM' : 'PM'; break; case 'P': r = p.H < 12 ? 'am' : 'pm'; break;
                case 'a': r = days[dow].slice(0, 3); break; case 'A': r = days[dow]; break; case 'b': case 'h': r = mons[p.m - 1].slice(0, 3); break; case 'B': r = mons[p.m - 1]; break;
                case 'j': r = pad(doy, 3); break; case 'u': r = String(dow || 7); break; case 'w': r = String(dow); break;
                case 'Z': r = p.abbr; break; case 'z': r = this.offStr(p.offMin, false); break;
                case 's': r = String(Math.floor(date.getTime() / 1000)); break;
                case 'F': r = `${p.Y}-${pad(p.m)}-${pad(p.d)}`; break; case 'T': r = `${pad(p.H)}:${pad(p.M)}:${pad(p.S)}`; break; case 'R': r = `${pad(p.H)}:${pad(p.M)}`; break;
                case 'D': r = `${pad(p.m)}/${pad(p.d)}/${pad(p.Y % 100)}`; break; case 'x': r = `${pad(p.m)}/${pad(p.d)}/${pad(p.Y % 100)}`; break; case 'X': r = `${pad(p.H)}:${pad(p.M)}:${pad(p.S)}`; break;
                case 'c': r = `${days[dow].slice(0, 3)} ${mons[p.m - 1].slice(0, 3)} ${pad(p.d, 2, ' ')} ${pad(p.H)}:${pad(p.M)}:${pad(p.S)} ${p.Y}`; break;
                case 'r': r = `${pad(h12)}:${pad(p.M)}:${pad(p.S)} ${p.H < 12 ? 'AM' : 'PM'}`; break;
                case 'n': r = '\n'; break; case 't': r = '\t'; break; case '%': r = '%'; break;
                case 'U': r = pad(Math.floor((doy + 6 - dow) / 7)); break; case 'W': r = pad(Math.floor((doy + 6 - ((dow + 6) % 7)) / 7)); break; case 'V': r = pad(Math.max(1, Math.ceil((doy + 7 - (dow || 7)) / 7))); break; case 'G': r = String(p.Y); break;
                default: return m;
            }
            if (flag === '-') r = r.replace(/^[0 ]+(?=.)/, ''); else if (flag === '_') r = r.replace(/^0+(?=.)/, x => ' '.repeat(x.length)); else if (flag === '^') r = r.toUpperCase();
            return r;
        });
    }

    // GNU date -d parsing for the common forms
    parseDate(str, base, tz) {
        const s = str.trim().toLowerCase();
        const b = new Date(base.getTime());
        if (s === '' || s === 'now') return b;
        let m;
        if ((m = /^@(-?\d+)$/.exec(s))) return new Date(parseInt(m[1], 10) * 1000);
        const startOfDay = (d) => { const p = this.parts(d, tz); return this.fromLocal(p.Y, p.m, p.d, 0, 0, 0, tz); };
        if (s === 'today') return startOfDay(b);
        if (s === 'tomorrow') return new Date(startOfDay(b).getTime() + 86400000 + 0);
        if (s === 'yesterday') return new Date(startOfDay(b).getTime() - 86400000);
        const units = { second: 1000, sec: 1000, minute: 60000, min: 60000, hour: 3600000, day: 86400000, week: 604800000, fortnight: 1209600000 };
        const rel = (n, unit) => {
            unit = unit.replace(/s$/, '');
            if (unit === 'month' || unit === 'year') {
                const p = this.parts(b, tz);
                return this.fromLocal(p.Y + (unit === 'year' ? n : 0), p.m + (unit === 'month' ? n : 0), p.d, p.H, p.M, p.S, tz);
            }
            return units[unit] ? new Date(b.getTime() + n * units[unit]) : null;
        };
        if ((m = /^([+-]?\d+)\s*(second|sec|minute|min|hour|day|week|fortnight|month|year)s?(\s+ago)?$/.exec(s))) return rel((m[3] ? -1 : 1) * parseInt(m[1], 10), m[2]);
        if ((m = /^(next|last)\s+(day|week|month|year|hour|minute)$/.exec(s))) return rel(m[1] === 'next' ? 1 : -1, m[2]);
        if ((m = /^(next|last)?\s*(sun|mon|tue|wed|thu|fri|sat)[a-z]*$/.exec(s))) {
            const names = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const target = names.indexOf(m[2]);
            const p = this.parts(b, tz);
            const cur = names.indexOf(p.wd.toLowerCase().slice(0, 3));
            let diff = (target - cur + 7) % 7;
            if (m[1] === 'last') diff = diff === 0 ? -7 : diff - 7; else if (diff === 0 && m[1] === 'next') diff = 7;
            const d = startOfDay(b);
            return new Date(d.getTime() + diff * 86400000);
        }
        if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ t](\d{1,2}):(\d{2})(?::(\d{2}))?)?(?:\s*(utc|z))?$/.exec(s))) {
            if (m[7]) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)));
            return this.fromLocal(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0), tz);
        }
        if ((m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s))) { const p = this.parts(b, tz); return this.fromLocal(p.Y, p.m, p.d, +m[1], +m[2], +(m[3] || 0), tz); }
        if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) return this.fromLocal(+m[3], +m[1], +m[2], 0, 0, 0, tz);
        return null;
    }

    fromLocal(Y, mo, d, H, M, S, tz) {
        const guess = Date.UTC(Y, mo - 1, d, H, M, S);
        let t = guess - this.offsetMin(new Date(guess), tz) * 60000;
        t = guess - this.offsetMin(new Date(t), tz) * 60000;
        return new Date(t);
    }

    // ===== date =====

    date(args) {
        let utc = false, fmt = null, dStr = null, setStr = null, rfc = false, iso = null, ref = null;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-u' || a === '--utc' || a === '--universal') utc = true;
            else if (a === '-R' || a === '--rfc-email') rfc = true;
            else if (a === '-d' || a === '--date') dStr = args[++i];
            else if (a.startsWith('--date=')) dStr = a.slice(7);
            else if (a.startsWith('-d') && a.length > 2) dStr = a.slice(2);
            else if (a === '-s' || a === '--set') setStr = args[++i];
            else if (a.startsWith('--set=')) setStr = a.slice(6);
            else if (a === '-I' || a.startsWith('-I') || a.startsWith('--iso-8601')) iso = a.includes('=') ? a.split('=')[1] : (a.length > 2 && a.startsWith('-I') ? a.slice(2) : 'date');
            else if (a === '-r' || a === '--reference') ref = args[++i];
            else if (a.startsWith('+')) fmt = a.slice(1);
            else if (a.startsWith('-') && a.length > 1) return this._err(`date: invalid option -- '${a.replace(/^-+/, '')}'\nTry 'date --help' for more information.`, 1);
            else if (/^\d{8,12}$/.test(a)) setStr = a;
            else return this._err(`date: invalid date ‘${a}’`, 1);
        }
        const env = this.shared.env || {};
        const tz = utc ? 'UTC' : this.zoneOf(env);
        if (setStr !== null) {
            if (!this._root()) return this._err(`date: cannot set date: Operation not permitted\n${this.format(this.now(), tz, '%a %b %e %T %Z %Y')}`, 1);
            const when = this.parseDate(setStr, this.now(), tz);
            if (!when) return this._err(`date: invalid date ‘${setStr}’`, 1);
            this.tm.offsetMs = when.getTime() - Date.now();
            return this._ok(this.format(when, tz, '%a %b %e %T %Z %Y'));
        }
        let when = this.now();
        if (ref) { const n = this.fs.getNode(ref); if (!n) return this._err(`date: ${ref}: No such file or directory`, 1); when = n.modified || when; }
        if (dStr !== null) { when = this.parseDate(dStr, when, tz); if (!when) return this._err(`date: invalid date ‘${dStr}’`, 1); }
        if (rfc) return this._ok(this.format(when, tz, '%a, %d %b %Y %T %z'));
        if (iso) return this._ok(iso === 'date' ? this.format(when, tz, '%F') : iso === 'seconds' ? this.format(when, tz, '%FT%T') + this.offStr(this.parts(when, tz).offMin, true) : this.format(when, tz, '%FT%H:%M') + this.offStr(this.parts(when, tz).offMin, true));
        return this._ok(this.format(when, tz, fmt !== null ? fmt : '%a %b %e %I:%M:%S %p %Z %Y').replace(/^/, ''));
    }

    // ===== timedatectl =====

    timedatectl(args) {
        const verb = args.find(a => !a.startsWith('-'));
        const tm = this.tm;
        const status = () => {
            const n = this.now();
            const l = this.parts(n, tm.tz);
            const u = this.parts(n, 'UTC');
            const r = this.rtc();
            const fmt = (d, tz, abbr) => this.format(d, tz, `%a %Y-%m-%d %H:%M:%S${abbr ? ' %Z' : ''}`);
            const synced = tm.ntp && Math.abs(tm.offsetMs) < 1000 ? 'yes' : (tm.ntp ? 'no' : 'no');
            return [
                `               Local time: ${fmt(n, tm.tz, true)}`,
                `           Universal time: ${fmt(n, 'UTC', true)}`,
                `                 RTC time: ${fmt(r, tm.localRtc ? tm.tz : 'UTC', false)}`,
                `                Time zone: ${tm.tz} (${l.abbr}, ${this.offStr(l.offMin, false)})`,
                `System clock synchronized: ${tm.ntp && Math.abs(tm.offsetMs) < 1000 ? 'yes' : 'no'}`,
                `              NTP service: ${tm.ntp ? 'active' : 'inactive'}`,
                `          RTC in local TZ: ${tm.localRtc ? 'yes' : 'no'}`
            ].join('\n') + (tm.localRtc ? '\n\nWarning: The system is configured to read the RTC time in the local time zone.\n         This mode cannot be fully supported. It will create various problems\n         with time zone changes and daylight saving time adjustments. The RTC\n         time is never updated, it relies on external facilities to maintain it.\n         If at all possible, use RTC in UTC by calling\n         \'timedatectl set-local-rtc 0\'.' : '');
        };
        if (!verb || verb === 'status') return this._ok(status());
        if (verb === 'show') {
            const n = this.now();
            return this._ok([`Timezone=${tm.tz}`, `LocalRTC=${tm.localRtc ? 'yes' : 'no'}`, 'CanNTP=yes', `NTP=${tm.ntp ? 'yes' : 'no'}`, `NTPSynchronized=${tm.ntp && Math.abs(tm.offsetMs) < 1000 ? 'yes' : 'no'}`, `TimeUSec=${this.format(n, tm.tz, '%a %Y-%m-%d %H:%M:%S %Z')}`, `RTCTimeUSec=${this.format(this.rtc(), 'UTC', '%a %Y-%m-%d %H:%M:%S')}`].join('\n'));
        }
        if (verb === 'list-timezones') {
            let zones;
            try { zones = Intl.supportedValuesOf('timeZone').filter(z => z.includes('/')); } catch (e) { zones = Object.keys(this.tzAbbr).filter(z => z.includes('/')); }
            zones = zones.filter(z => !/^(Etc|SystemV|US|Canada|Brazil|Chile|Mexico|Antarctica\/(Macquarie|McMurdo|South_Pole))\//.test(z));
            zones.push('UTC');
            zones.sort();
            return this._ok(zones.join('\n'));
        }
        const needRoot = () => (this._root() ? null : this._err('Failed to ' + (verb === 'set-timezone' ? 'set time zone' : verb === 'set-time' ? 'set time' : verb === 'set-ntp' ? 'set ntp' : 'set local RTC') + ': Interactive authentication required.'));
        if (verb === 'set-timezone') {
            const z = args[args.indexOf(verb) + 1];
            if (!z) return this._err('Failed to set time zone: Invalid argument', 1);
            const e = needRoot(); if (e) return e;
            const zz = z === 'Etc/UTC' ? 'UTC' : z;
            if (!this.validTz(zz)) return this._err(`Failed to set time zone: Invalid time zone '${z}'`, 1);
            tm.tz = z;
            const lt = this.fs.getNode('/etc/localtime');
            if (lt) { lt.target = `../usr/share/zoneinfo/${z}`; lt.type = 'symlink'; }
            return this._ok();
        }
        if (verb === 'set-time') {
            const e = needRoot(); if (e) return e;
            const str = args.slice(args.indexOf(verb) + 1).filter(a => !a.startsWith('--')).join(' ');
            if (tm.ntp) return this._err('Failed to set time: Automatic time synchronization is enabled', 1);
            const when = this.parseDate(str, this.now(), tm.tz);
            if (!when || !/^\d{4}-\d{1,2}-\d{1,2}|^\d{1,2}:\d{2}/.test(str.trim())) return this._err(`Failed to parse time specification '${str}'`, 1);
            tm.offsetMs = when.getTime() - Date.now();
            tm.rtcOffsetMs = tm.offsetMs;
            return this._ok();
        }
        if (verb === 'set-ntp') {
            const e = needRoot(); if (e) return e;
            const v = (args[args.indexOf(verb) + 1] || '').toLowerCase();
            if (!['true', 'false', 'yes', 'no', '1', '0', 'on', 'off'].includes(v)) return this._err('Failed to parse bool', 1);
            const on = ['true', 'yes', '1', 'on'].includes(v);
            const S = this.shared.services;
            if (S.chronyd) {
                if (on && this.shared.svc && !S.chronyd.active) this.shared.svc._svStart('chronyd');
                if (!on && S.chronyd.active && this.shared.svc) this.shared.svc._svStop('chronyd');
            }
            if (S.chronyd) S.chronyd.enabled = on;
            if (on) { tm.offsetMs = 0; }
            return this._ok();
        }
        if (verb === 'set-local-rtc') {
            const e = needRoot(); if (e) return e;
            const v = (args[args.indexOf(verb) + 1] || '').toLowerCase();
            tm.localRtc = ['1', 'yes', 'true', 'on'].includes(v);
            return this._ok();
        }
        if (verb === 'timesync-status') return this._err('Failed to query server: Could not activate remote peer: Unit dbus-org.freedesktop.timesync1.service not found.\nsystemd-timesyncd is not in use on this system; chronyd provides time synchronization (use "chronyc tracking").', 1);
        return this._err(`Unknown command verb ${verb}.`, 1);
    }

    // ===== hwclock =====

    hwclock(args) {
        if (!this._root()) return this._err('hwclock: Cannot access the Hardware Clock via any known method.\nhwclock: Use the --verbose option to see the details of our search for an access method.', 1);
        const tm = this.tm;
        const has = (...f) => args.some(a => f.includes(a));
        if (has('--systohc', '-w')) { tm.rtcOffsetMs = tm.offsetMs; return this._ok(); }
        if (has('--hctosys', '-s')) { tm.offsetMs = tm.rtcOffsetMs; return this._ok(); }
        if (has('--set')) {
            const di = args.findIndex(a => a.startsWith('--date='));
            const str = di >= 0 ? args[di].slice(7) : args[args.indexOf('--date') + 1];
            const when = str ? this.parseDate(str, this.now(), tm.localRtc ? tm.tz : 'UTC') : null;
            if (!when) return this._err('hwclock: invalid date \'' + (str || '') + '\'', 1);
            tm.rtcOffsetMs = when.getTime() - Date.now();
            return this._ok();
        }
        const local = has('--localtime') || (!has('-u', '--utc') && tm.localRtc);
        const tz = local ? tm.tz : 'UTC';
        const r = this.rtc();
        const p = this.parts(r, tz);
        const frac = '.' + String(((r.getTime() % 1000) * 1000 + 123456) % 1000000).padStart(6, '0');
        return this._ok(this.format(r, tz, '%Y-%m-%d %H:%M:%S') + frac + this.offStr(p.offMin, true));
    }

    // ===== chronyc makestep resets any manual clock offset =====

    installHooks(parent) {
        this._origChronyc = parent.chronyc;
        parent.chronyc = (args, stdin) => {
            const verb = args[0];
            const S = this.shared.services;
            if (verb === 'makestep') {
                if (!S.chronyd || !S.chronyd.active) return this._err('506 Cannot talk to daemon', 1);
                if (!this._root()) return this._err('501 Not authorised', 1);
                this.tm.offsetMs = 0;
                return this._ok('200 OK');
            }
            if (verb && ['tracking', 'sources', 'sourcestats', 'activity', 'makestep', 'burst', 'online', 'offline'].includes(verb) && (!S.chronyd || !S.chronyd.active)) {
                return this._err('506 Cannot talk to daemon', 1);
            }
            if (verb === 'tracking') {
                const off = this.tm.offsetMs / 1000;
                const r = this._origChronyc ? this._origChronyc(args, stdin) : null;
                let text = (r && (r.stdout || r.output)) || '';
                text = text.replace(/System time\s*:.*$/m, `System time     : ${Math.abs(off).toFixed(9)} seconds ${off < 0 ? 'slow' : 'fast'} of NTP time`);
                return this._ok(text);
            }
            return this._origChronyc ? this._origChronyc(args, stdin) : this._err('chronyc: command not found', 127);
        };
    }
}

if (typeof window !== 'undefined') {
    window.TimeCommands = TimeCommands;
}
