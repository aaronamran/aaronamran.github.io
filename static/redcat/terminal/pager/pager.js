// Interactive pager for less, more and man (full-screen overlay, like vi)
// Part of Red Cat RHCSA Terminal Simulator

class Pager {
    constructor(terminal) {
        this.terminal = terminal;
        this.active = false;
        this.keyHandler = null;
    }

    // spec: { kind: 'less'|'more'|'man', text, name, title, flags:{N,F,i,S}, initialSearch }
    open(spec) {
        this.spec = spec;
        this.kind = spec.kind || 'less';
        this.name = spec.name || '';
        this.title = spec.title || '';
        this.flags = spec.flags || {};
        this.rawLines = String(spec.text).replace(/\n$/, '').split('\n');
        this.stack = [];
        this.top = 0;
        this.pattern = null;
        this.searchDir = 1;
        this.prompt = null;       // { ch: '/', buf: '' } while a search or ':' command is being typed
        this.count = '';
        this.message = '';
        this.helpShown = false;
        this.active = true;

        this.buildDom();
        this.measure();
        if (this.kind === 'top') {
            this.topSort = 'cpu';
            this.delay = Math.max(0.5, spec.delay || 3);
            this.topRefresh();
            this.startTopTimer();
        } else this.wrapLines();
        if (spec.initialSearch) { this.pattern = this.makeRegex(spec.initialSearch); if (this.pattern) this.searchFrom(0, 1, true); }
        this.render();
        this.keyHandler = (e) => this.handleKey(e);
        document.addEventListener('keydown', this.keyHandler, true);
    }

    buildDom() {
        const term = document.getElementById('terminal');
        this.hidden = [];
        for (const el of Array.from(term.children)) {
            this.hidden.push([el, el.style.display]);
            el.style.display = 'none';
        }
        this.root = document.createElement('div');
        this.root.className = 'pager-overlay';
        this.root.style.cssText = 'display:flex;flex-direction:column;height:100%;min-height:420px;background:#000;color:#c0c0c0;font-family:"Courier New",Courier,monospace;font-size:13px;';
        this.bodyEl = document.createElement('div');
        this.bodyEl.style.cssText = 'flex:1;overflow:hidden;white-space:pre;padding:0 2px;line-height:1.3;';
        this.statusEl = document.createElement('div');
        this.statusEl.style.cssText = 'white-space:pre;padding:0 2px;line-height:1.3;min-height:1.3em;';
        this.root.appendChild(this.bodyEl);
        this.root.appendChild(this.statusEl);
        term.appendChild(this.root);
    }

    // rows and columns that fit the overlay (falls back to 24x80 where nothing is laid out, e.g. in tests)
    measure() {
        let rows = 24, cols = 80;
        try {
            const probe = document.createElement('span');
            probe.textContent = 'MMMMMMMMMM';
            probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;';
            this.root.appendChild(probe);
            const cw = probe.getBoundingClientRect().width / 10;
            probe.remove();
            const h = this.root.getBoundingClientRect().height, w = this.root.getBoundingClientRect().width;
            if (cw > 0 && w > 0) cols = Math.max(40, Math.floor((w - 4) / cw));
            if (h > 0) rows = Math.max(10, Math.min(60, Math.floor(h / (13 * 1.3))));
        } catch (e) { /* keep defaults */ }
        this.rows = rows;
        this.cols = cols;
        this.page = this.rows - 1;
    }

    wrapLines() {
        const out = [];
        this.rawLines.forEach((l, i) => {
            const line = l.replace(/\t/g, '        ');
            if (this.flags.S || line.length <= this.cols - (this.flags.N ? 8 : 0)) { out.push({ s: line, n: i + 1, first: true }); return; }
            const w = this.cols - (this.flags.N ? 8 : 0);
            for (let p = 0, first = true; p < line.length; p += w, first = false) out.push({ s: line.slice(p, p + w), n: i + 1, first });
        });
        this.lines = out.length ? out : [{ s: '', n: 1, first: true }];
    }

    close() {
        if (!this.active) return;
        this.active = false;
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        document.removeEventListener('keydown', this.keyHandler, true);
        this.root.remove();
        for (const [el, d] of this.hidden) el.style.display = d;
        // more leaves what was read in the scrollback, less (alternate screen) leaves nothing
        const shown = this.kind === 'more' ? this.lines.slice(0, Math.min(this.lines.length, this.top + this.page)).map(l => l.s).join('\n') : '';
        this.terminal.restoreFromPager(shown);
    }

    // ---------------------------------------------------------------- geometry
    maxTop() { return Math.max(0, this.lines.length - this.page); }
    atEnd() { return this.top >= this.maxTop(); }
    clampTop() { this.top = Math.max(0, Math.min(this.top, this.maxTop())); }

    percent() {
        const last = Math.min(this.lines.length, this.top + this.page);
        return Math.floor((last * 100) / this.lines.length);
    }

    // ---------------------------------------------------------------- search
    makeRegex(src) {
        try { return new RegExp(src, this.flags.i ? 'gi' : 'g'); } catch (e) { return null; }
    }

    // finds the next line (from `from`, direction dir) that matches; wraps never (like less)
    searchFrom(from, dir, silent) {
        if (!this.pattern) return false;
        for (let i = from; i >= 0 && i < this.lines.length; i += dir) {
            this.pattern.lastIndex = 0;
            if (this.pattern.test(this.lines[i].s)) {
                this.top = i;
                this.clampTopForSearch();
                return true;
            }
        }
        if (!silent) this.message = 'Pattern not found  (press RETURN)';
        return false;
    }
    clampTopForSearch() { if (this.top > this.maxTop() && this.lines.length > this.page) this.top = this.maxTop(); }

    // ---------------------------------------------------------------- rendering
    esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    highlight(s) {
        if (!this.pattern) return this.esc(s);
        let out = '', last = 0, m;
        this.pattern.lastIndex = 0;
        while ((m = this.pattern.exec(s)) !== null) {
            if (m[0] === '') { this.pattern.lastIndex++; continue; }
            out += this.esc(s.slice(last, m.index)) + '<span style="background:#c0c0c0;color:#000;">' + this.esc(m[0]) + '</span>';
            last = m.index + m[0].length;
        }
        return out + this.esc(s.slice(last));
    }

    statusText() {
        if (this.prompt) return this.prompt.ch + this.prompt.buf;
        if (this.message) return this.message;
        const n = this.lines.length, lastShown = Math.min(n, this.top + this.page);
        if (this.kind === 'top' && !this.helpShown) return '';
        if (this.helpShown) return 'HELP -- ' + (this.atEnd() ? 'END -- ' : '') + 'Press q when done';
        if (this.kind === 'more') return `--More--(${this.percent()}%)`;
        if (this.kind === 'man') {
            const lineNo = this.top + 1;
            if (this.atEnd()) return `Manual page ${this.title} line ${lineNo}/${n} (END) (press h for help or q to quit)`;
            return `Manual page ${this.title} line ${lineNo}/${n} ${this.percent()}% (press h for help or q to quit)`;
        }
        return this.atEnd() ? '(END)' : ':';
    }

    render() {
        if (!this.active) return;
        const frag = [];
        for (let i = 0; i < this.page; i++) {
            const l = this.lines[this.top + i];
            if (!l) { frag.push(this.kind === 'more' || this.kind === 'top' ? '' : '<span style="color:#5555ff;">~</span>'); continue; }
            const prefix = this.flags.N ? (l.first ? String(l.n).padStart(6) + '  ' : '        ') : '';
            frag.push(prefix + this.highlight(l.s));
        }
        this.bodyEl.innerHTML = frag.map(x => `<div style="min-height:1.3em;">${x || '&nbsp;'}</div>`).join('');
        const st = this.statusText();
        const reverse = this.kind !== 'top' && (this.kind !== 'less' || this.atEnd() || this.helpShown) && !this.prompt && !this.message;
        this.statusEl.innerHTML = reverse
            ? `<span style="background:#c0c0c0;color:#000;">${this.esc(st) || '&nbsp;'}</span>`
            : this.esc(st) + (this.prompt ? '<span style="background:#00ff00;">&nbsp;</span>' : '');
    }

    // ---------------------------------------------------------------- top
    topRefresh() {
        const text = this.spec.refresh({ rows: Math.max(3, this.page - 7), sort: this.topSort });
        this.rawLines = text.split('\n');
        this.wrapLines();
        this.top = 0;
    }

    startTopTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => { if (!this.prompt && !this.helpShown) { this.topRefresh(); this.render(); } }, this.delay * 1000);
    }

    handleTopKey(e) {
        const k = e.key;
        if (this.prompt) { this.handlePromptKey(e); return; }
        if (this.helpShown) {
            if (k === 'q' || k === 'Enter' || k === ' ') { const s = this.stack.pop(); this.lines = s.lines; this.top = 0; this.helpShown = false; this.topRefresh(); }
            return;
        }
        this.message = '';
        if (k === 'q' || k === 'Q' || (e.ctrlKey && k === 'c')) { this.close(); return; }
        if (k === ' ' || k === 'Enter') { this.topRefresh(); return; }
        if (k === 'P') this.topSort = 'cpu';
        else if (k === 'M') this.topSort = 'mem';
        else if (k === 'N') this.topSort = 'pid';
        else if (k === 'T') this.topSort = 'time';
        else if (k === 'h' || k === '?') { this.showHelp(); return; }
        else if (k === 'd' || k === 's') {
            this.prompt = { ch: `Change delay from ${this.delay.toFixed(1)} to `, buf: '', cb: (v) => {
                const d = parseFloat(v);
                if (!(d > 0)) { this.message = 'Unacceptable floating point'; return; }
                this.delay = Math.max(0.5, d);
                this.startTopTimer();
            } };
            return;
        } else if (k === 'k') {
            this.prompt = { ch: 'PID to signal/kill [default pid 1] ', buf: '', cb: (pid) => {
                const target = pid.trim() === '' ? '1' : pid.trim();
                if (!/^\d+$/.test(target)) { this.message = 'Unacceptable integer'; return; }
                this.prompt = { ch: `Send pid ${target} signal [15/sigterm] `, buf: '', cb: (sig) => {
                    const s = sig.trim() === '' ? '15' : sig.trim().replace(/^sig/i, '');
                    const r = window.terminal.commands.kill(['-s', s, target]);
                    this.message = r && r.stderr ? r.stderr.trim().replace(/^bash: /, '') : `Sent signal ${s} to pid ${target}`;
                    this.topRefresh();
                } };
            } };
            return;
        } else return;
        this.topRefresh();
    }

    // ---------------------------------------------------------------- help
    showHelp() {
        if (this.helpShown) return;
        const help = this.kind === 'top'
            ? ['Help for Interactive Commands - procps-ng 3.3.17', '',
               'Window 1:Def: Cumulative mode Off.  System: Delay ' + this.delay.toFixed(1) + ' secs; Secure mode Off.', '',
               "  Z,B,E,e   Global: 'Z' colors; 'B' bold; 'E'/'e' summary/task memory scale",
               "  l,t,m     Toggle Summary: 'l' load avg; 't' task/cpu stats; 'm' memory info",
               '  d or s    Set update interval',
               "  k,r       Manipulate tasks: 'k' kill; 'r' renice",
               '  P,M,N,T   Sort by: %CPU, %MEM, PID, TIME+',
               '  <Space> or <Enter>  Refresh the display',
               '  q         Quit', '', 'Press q, <Space> or <Enter> to continue']
            : this.kind === 'more'
            ? ['Most commands optionally preceded by integer argument k.  Defaults in brackets.',
               'Star (*) indicates argument becomes new default.', '',
               '<space>                 Display next k lines of text [current screen size]',
               'z                       Display next k lines of text [current screen size]*',
               '<return>                Display next k lines of text [1]*',
               'b or ^B                 Skip backwards k screenfuls of text [1]',
               '/<regular expression>   Search for kth occurrence of regular expression [1]',
               'n                       Search for kth occurrence of last r.e [1]',
               'q or Q                  Exit from more']
            : ['                  SUMMARY OF LESS COMMANDS', '',
               '  h  H                 Display this help.',
               '  q  :q  Q  :Q  ZZ     Exit.',
               ' ---------------------------------------------------------------------------', '',
               '                           MOVING', '',
               '  e  ^E  j  ^N  CR  *  Forward  one line   (or N lines).',
               '  y  ^Y  k  ^K  ^P  *  Backward one line   (or N lines).',
               '  f  ^F  ^V  SPACE  *  Forward  one window (or N lines).',
               '  b  ^B  ESC-v      *  Backward one window (or N lines).',
               '  d  ^D             *  Forward  one half-window (or N lines).',
               '  u  ^U             *  Backward one half-window (or N lines).', '',
               '                           JUMPING', '',
               '  g  <  ESC-<       *  Go to first line in file (or line N).',
               '  G  >  ESC->       *  Go to last line in file (or line N).',
               '  p  %              *  Go to beginning of file (or N percent into file).', '',
               '                           SEARCHING', '',
               '  /pattern          *  Search forward for (N-th) matching line.',
               '  ?pattern          *  Search backward for (N-th) matching line.',
               '  n                 *  Repeat previous search (for N-th occurrence).',
               '  N                 *  Repeat previous search in reverse direction.'];
        this.stack.push({ lines: this.lines, top: this.top });
        this.lines = help.map((s, i) => ({ s, n: i + 1, first: true }));
        this.top = 0;
        this.helpShown = true;
    }

    // ---------------------------------------------------------------- keys
    handleKey(e) {
        if (!this.active) return;
        const k = e.key;
        if (e.ctrlKey && (k === 'c' || k === 'C') && !e.shiftKey) {
            // Ctrl+C aborts a typed search; at the pager it only interrupts, less keeps running
            e.preventDefault(); e.stopPropagation();
            if (this.prompt) this.prompt = null;
            this.message = '';
            this.render();
            return;
        }
        if (e.ctrlKey && k === 'z') { e.preventDefault(); e.stopPropagation(); return; }
        e.preventDefault(); e.stopPropagation();

        if (this.prompt) { this.handlePromptKey(e); this.render(); return; }
        if (this.message) { this.message = ''; if (k === 'Enter' || k === ' ') { this.render(); return; } }

        if (this.kind === 'top') { this.handleTopKey(e); this.render(); return; }

        if (/^[0-9]$/.test(k) && !e.ctrlKey) { this.count += k; this.message = ''; return; }
        const n = this.count === '' ? null : parseInt(this.count, 10);
        this.count = '';
        const more = this.kind === 'more';

        if (this.helpShown) {
            if (k === 'q' || k === 'Q') { const s = this.stack.pop(); this.lines = s.lines; this.top = s.top; this.helpShown = false; this.render(); return; }
        }

        const lines = (d) => { this.top += d; this.clampTop(); };
        if (k === 'q' || k === 'Q') { this.close(); return; }
        if (k === 'Z') { this.zPending = true; return; }
        if (this.zPending) { this.zPending = false; if (k === 'Z') { this.close(); return; } }
        if (more) {
            const fwd = (d) => { lines(d); if (this.top + this.page >= this.lines.length) { this.render(); this.close(); return true; } return false; };
            if (k === ' ' || k === 'z' || k === 'f' || k === 'PageDown' || (e.ctrlKey && k === 'f')) { if (fwd(n || this.page)) return; }
            else if (k === 'Enter' || k === 'j' || k === 'ArrowDown') { if (fwd(n || 1)) return; }
            else if (k === 'd' || (e.ctrlKey && k === 'd')) { if (fwd(Math.floor(this.page / 2))) return; }
            else if (k === 'b' || k === 'PageUp' || (e.ctrlKey && k === 'b')) lines(-(n || 1) * this.page);
            else if (k === '/') this.prompt = { ch: '/', buf: '' };
            else if (k === 'n') this.repeatSearch(1);
            else if (k === 'h' || k === '?') this.showHelp();
            this.render();
            return;
        }

        switch (k) {
            case ' ': case 'f': case 'PageDown': lines(n || this.page); break;
            case 'F': break;
            case 'b': case 'PageUp': lines(-(n || this.page)); break;
            case 'j': case 'e': case 'Enter': case 'ArrowDown': lines(n || 1); break;
            case 'k': case 'y': case 'ArrowUp': lines(-(n || 1)); break;
            case 'd': lines(n || Math.floor(this.page / 2)); break;
            case 'u': lines(-(n || Math.floor(this.page / 2))); break;
            case 'g': case '<': case 'Home': this.top = n ? n - 1 : 0; this.clampTop(); break;
            case 'G': case '>': case 'End': this.top = n ? n - 1 : this.maxTop(); this.clampTop(); break;
            case 'p': case '%': if (n !== null) { this.top = Math.floor((this.lines.length * n) / 100); this.clampTop(); } break;
            case '/': this.prompt = { ch: '/', buf: '' }; break;
            case '?': this.prompt = { ch: '?', buf: '' }; break;
            case ':': this.prompt = { ch: ':', buf: '' }; break;
            case 'n': this.repeatSearch(1); break;
            case 'N': this.repeatSearch(-1); break;
            case 'h': case 'H': this.showHelp(); break;
            case 'r': case 'R': break;
            default:
                if (e.ctrlKey) {
                    if (k === 'f' || k === 'v') lines(this.page);
                    else if (k === 'b') lines(-this.page);
                    else if (k === 'd') lines(Math.floor(this.page / 2));
                    else if (k === 'u') lines(-Math.floor(this.page / 2));
                    else if (k === 'e' || k === 'n') lines(1);
                    else if (k === 'y' || k === 'p' || k === 'k') lines(-1);
                    else if (k === 'l') { /* redraw */ }
                }
        }
        this.render();
    }

    handlePromptKey(e) {
        const k = e.key, p = this.prompt;
        if (k === 'Escape') { this.prompt = null; return; }
        if (k === 'Backspace') { if (p.buf === '') this.prompt = null; else p.buf = p.buf.slice(0, -1); return; }
        if (k === 'Enter' && p.cb) { const buf = p.buf; this.prompt = null; p.cb(buf); return; }
        if (k === 'Enter') {
            const buf = p.buf; this.prompt = null;
            if (p.ch === ':') { if (/^[qQ]$/.test(buf.trim())) this.close(); else if (buf.trim() !== '') this.message = 'No next file  (press RETURN)'; return; }
            if (buf === '' && this.pattern) { this.repeatSearch(p.ch === '/' ? 1 : -1); return; }
            const re = this.makeRegex(buf);
            if (!re) { this.message = 'Invalid regular expression  (press RETURN)'; return; }
            this.pattern = re;
            this.searchDir = p.ch === '/' ? 1 : -1;
            this.doSearch();
            return;
        }
        if (p.ch === ':' && p.buf === '' && (k === 'q' || k === 'Q')) { this.prompt = null; this.close(); return; }
        if (k.length === 1 && !e.ctrlKey) p.buf += k;
    }

    doSearch() {
        if (this.searchDir === 1) this.searchFrom(this.top + 1, 1);
        else this.searchFrom(this.top - 1, -1);
    }

    repeatSearch(rel) {
        if (!this.pattern) { this.message = 'No previous regular expression  (press RETURN)'; return; }
        const dir = this.searchDir * rel;
        this.searchFrom(dir === 1 ? this.top + 1 : this.top - 1, dir);
    }
}

window.Pager = Pager;
