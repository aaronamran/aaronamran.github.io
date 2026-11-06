// Shell interpreter: a synchronous bash subset for the Red Cat terminal.
//
// Supports: variables and parameter expansion, arrays, command/arithmetic substitution, quoting,
// here-documents, pipelines, redirections, && || ; &, if/for/while/until/case, functions,
// [ ], [[ ]], (( )), break/continue/return/exit, set -e/-u/-x, trap EXIT, scripts (shebang,
// bash file, source), read from redirected input, and the usual builtins.
//
// Commands themselves are the simulator's command methods; this file only provides the language.

(function (root) {
    'use strict';

    class IncompleteError extends Error {}
    class ShellSyntaxError extends Error {}
    class BreakSignal { constructor(n) { this.n = n; } }
    class ContinueSignal { constructor(n) { this.n = n; } }
    class ReturnSignal { constructor(code) { this.code = code; } }
    class ExitSignal { constructor(code) { this.code = code; } }
    class NeedInput { constructor(info) { this.info = info; } }
    class ErrExitSignal { constructor(code) { this.code = code; } }

    const RESERVED = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac', 'in', 'function', '{', '}', '!', '[[', ']]', 'select', 'time']);

    // ===================================================================== lexer

    class Lexer {
        constructor(src) {
            this.src = src;
            this.i = 0;
            this.line = 1;
            this.tokens = [];
            this.pendingHeredocs = [];
            this.inCond = false;
        }

        err(msg) { throw new ShellSyntaxError(msg); }

        tokenize() {
            const s = this.src;
            let atCommandStart = true;
            while (this.i < s.length) {
                const c = s[this.i];
                if (c === ' ' || c === '\t') { this.i++; continue; }
                if (c === '\\' && s[this.i + 1] === '\n') { this.i += 2; this.line++; continue; }
                if (c === '#') { while (this.i < s.length && s[this.i] !== '\n') this.i++; continue; }
                if (c === '\n') {
                    this.tokens.push({ type: 'nl', line: this.line });
                    this.i++;
                    this.line++;
                    this.readHeredocBodies();
                    continue;
                }
                if (this.inCond) {
                    // inside [[ ... ]] only whitespace-separated && || ( ) < > are operators; everything else is a word
                    const m = /^(&&|\|\||\(|\)|<|>)(?=\s)/.exec(s.slice(this.i));
                    if (m) { this.i += m[0].length; this.tokens.push({ type: 'op', v: m[1], line: this.line }); continue; }
                    const w = this.readWord(true);
                    this.tokens.push(w);
                    if (w.segs.length === 1 && w.segs[0].k === 'lit' && w.segs[0].s === ']]') this.inCond = false;
                    continue;
                }
                const st0 = this.i;
                const op = this.readOperator();
                if (op) { op.s = st0; op.e = this.i; op.src = s; this.tokens.push(op); continue; }
                const w = this.readWord();
                w.s = st0; w.e = this.i; w.src = s;
                this.tokens.push(w);
                if (w.segs.length === 1 && w.segs[0].k === 'lit' && w.segs[0].s === '[[') this.inCond = true;
            }
            if (this.pendingHeredocs.length) throw new IncompleteError('heredoc');
            return this.tokens;
        }

        readOperator() {
            const s = this.src;
            const i = this.i;
            const line = this.line;
            // fd-number redirections: 2> 2>> 2>&1 1> &> &>>
            let m = /^(\d*)(>>|>&|>\||>|<<<|<<-|<<|<&|<>|<)/.exec(s.slice(i, i + 6));
            if (m && !(m[1] && /\w/.test(s[i - 1] || ' ') && i > 0 && /\S/.test(s[i - 1]) && false)) {
                // a leading number only counts when it stands alone
                const prev = s[i - 1];
                if (m[1] === '' || !prev || /[\s;&|(]/.test(prev)) {
                    // process substitution <( ) and >( ) are not redirections
                    if ((m[2] === '<' || m[2] === '>') && s[i + m[0].length] === '(') return null;
                    this.i += m[0].length;
                    const tok = { type: 'op', v: m[2], fd: m[1] === '' ? null : parseInt(m[1], 10), line };
                    if (m[2] === '<<' || m[2] === '<<-') this.queueHeredoc(tok);
                    return tok;
                }
            }
            m = /^(&>>|&>)/.exec(s.slice(i, i + 3));
            if (m) { this.i += m[0].length; return { type: 'op', v: m[1], fd: null, line }; }
            m = /^(&&|\|\||;;&|;;|;&|\|&)/.exec(s.slice(i, i + 3));
            if (m) { this.i += m[0].length; return { type: 'op', v: m[1], line }; }
            const c = s[i];
            if (c === '|' || c === '&' || c === ';' || c === '(' || c === ')') {
                if (c === '(' && s[i + 1] === '(' ) {
                    // (( arithmetic )) command: handled as a word-like token
                    const end = this.findArithEnd(i + 2);
                    if (end !== -1) {
                        this.i = end + 2;
                        return { type: 'arith', expr: s.slice(i + 2, end), line };
                    }
                }
                this.i++;
                return { type: 'op', v: c, line };
            }
            return null;
        }

        findArithEnd(from) {
            const s = this.src;
            let depth = 0;
            for (let j = from; j < s.length; j++) {
                if (s[j] === '(') depth++;
                else if (s[j] === ')') {
                    if (depth === 0) return s[j + 1] === ')' ? j : -1;
                    depth--;
                }
            }
            return -1;
        }

        queueHeredoc(tok) {
            this.pendingHeredocs.push(tok);
        }

        readHeredocBodies() {
            const s = this.src;
            while (this.pendingHeredocs.length) {
                const tok = this.pendingHeredocs.shift();
                // the delimiter word is the next word token after the operator
                const idx = this.tokens.indexOf(tok);
                const wt = this.tokens[idx + 1];
                if (!wt || wt.type !== 'word') this.err("syntax error near unexpected token `newline'");
                const quoted = wt.segs.some(sg => sg.k === 'sq' || sg.k === 'dq' || sg.k === 'esc');
                const delim = wt.segs.map(sg => (sg.s !== undefined ? sg.s : '')).join('');
                const strip = tok.v === '<<-';
                const lines = [];
                let found = false;
                while (this.i <= s.length) {
                    if (this.i >= s.length) break;
                    let e = s.indexOf('\n', this.i);
                    const raw = e === -1 ? s.slice(this.i) : s.slice(this.i, e);
                    this.i = e === -1 ? s.length : e + 1;
                    this.line++;
                    const cmp = strip ? raw.replace(/^\t+/, '') : raw;
                    if (cmp === delim) { found = true; break; }
                    lines.push(strip ? raw.replace(/^\t+/, '') : raw);
                    if (e === -1) break;
                }
                if (!found) throw new IncompleteError('heredoc');
                tok.heredoc = { body: lines.join('\n') + (lines.length ? '\n' : ''), expand: !quoted };
            }
        }

        // ---- words
        readWord(cond) {
            const s = this.src;
            const segs = [];
            let lit = '';
            const flush = () => { if (lit) { segs.push({ k: 'lit', s: lit }); lit = ''; } };
            const startLine = this.line;
            let started = false;
            while (this.i < s.length) {
                const c = s[this.i];
                if (c === ' ' || c === '\t' || c === '\n') break;
                if (!cond && (c === '|' || c === ';' || c === ')')) break;
                if (!cond && c === '&') break;
                if (!cond && c === '(') { if (lit.endsWith('=')) { /* array assignment a=( */ } else break; }
                if (!cond && (c === '<' || c === '>') && s[this.i + 1] !== '(') break;
                if (cond && c === ';') break;
                started = true;
                if (c === '\\') {
                    if (s[this.i + 1] === '\n') { this.i += 2; this.line++; continue; }
                    flush();
                    segs.push({ k: 'esc', s: s[this.i + 1] === undefined ? '\\' : s[this.i + 1] });
                    this.i += 2;
                    continue;
                }
                if (c === "'") {
                    flush();
                    const e = s.indexOf("'", this.i + 1);
                    if (e === -1) throw new IncompleteError('quote');
                    segs.push({ k: 'sq', s: s.slice(this.i + 1, e) });
                    this.line += (s.slice(this.i, e).match(/\n/g) || []).length;
                    this.i = e + 1;
                    continue;
                }
                if (c === '"') {
                    flush();
                    this.i++;
                    segs.push({ k: 'dq', parts: this.readDouble() });
                    continue;
                }
                if (c === '$') {
                    const p = this.readDollar(false);
                    if (p) { flush(); segs.push(p); continue; }
                    lit += c; this.i++; continue;
                }
                if (c === '`') {
                    flush();
                    segs.push(this.readBacktick());
                    continue;
                }
                if ((c === '<' || c === '>') && s[this.i + 1] === '(') {
                    flush();
                    const e = this.matchParen(this.i + 1);
                    segs.push({ k: 'psub', dir: c, code: s.slice(this.i + 2, e) });
                    this.i = e + 1;
                    continue;
                }
                if (c === '(' && lit.endsWith('=')) {
                    // array literal: name=( ... )
                    flush();
                    const e = this.matchParen(this.i);
                    segs.push({ k: 'arrlit', code: s.slice(this.i + 1, e) });
                    this.i = e + 1;
                    continue;
                }
                lit += c;
                this.i++;
            }
            flush();
            if (!started && !segs.length) this.err('syntax error');
            return { type: 'word', segs, line: startLine };
        }

        readDouble() {
            const s = this.src;
            const parts = [];
            let lit = '';
            const flush = () => { if (lit) { parts.push({ k: 'lit', s: lit }); lit = ''; } };
            while (true) {
                if (this.i >= s.length) throw new IncompleteError('quote');
                const c = s[this.i];
                if (c === '"') { this.i++; break; }
                if (c === '\n') this.line++;
                if (c === '\\') {
                    const n = s[this.i + 1];
                    if (n === '$' || n === '`' || n === '"' || n === '\\') { lit += n; this.i += 2; continue; }
                    if (n === '\n') { this.i += 2; this.line++; continue; }
                    lit += c; this.i++; continue;
                }
                if (c === '$') {
                    const p = this.readDollar(true);
                    if (p) { flush(); parts.push(p); continue; }
                    lit += c; this.i++; continue;
                }
                if (c === '`') { flush(); parts.push(this.readBacktick()); continue; }
                lit += c;
                this.i++;
            }
            flush();
            return parts;
        }

        matchParen(open) {
            // index of the ')' matching the '(' at open; aware of quotes and nesting
            const s = this.src;
            let depth = 0;
            for (let j = open; j < s.length; j++) {
                const c = s[j];
                if (c === '\\') { j++; continue; }
                if (c === "'") { const e = s.indexOf("'", j + 1); if (e === -1) throw new IncompleteError('quote'); j = e; continue; }
                if (c === '"') { j++; while (j < s.length && s[j] !== '"') { if (s[j] === '\\') j++; j++; } continue; }
                if (c === '(') depth++;
                else if (c === ')') { depth--; if (depth === 0) return j; }
            }
            throw new IncompleteError('paren');
        }

        readBacktick() {
            const s = this.src;
            let j = this.i + 1;
            let code = '';
            while (j < s.length && s[j] !== '`') {
                if (s[j] === '\\' && (s[j + 1] === '`' || s[j + 1] === '\\' || s[j + 1] === '$')) { code += s[j + 1]; j += 2; continue; }
                code += s[j++];
            }
            if (j >= s.length) throw new IncompleteError('backtick');
            this.i = j + 1;
            return { k: 'cmd', code };
        }

        readDollar(inDq) {
            const s = this.src;
            const n = s[this.i + 1];
            if (n === '(') {
                if (s[this.i + 2] === '(') {
                    // $(( arithmetic ))
                    const end = this.findArithEnd(this.i + 3);
                    if (end !== -1) {
                        const expr = s.slice(this.i + 3, end);
                        this.i = end + 2;
                        return { k: 'arith', expr };
                    }
                }
                const e = this.matchParen(this.i + 1);
                const code = s.slice(this.i + 2, e);
                this.i = e + 1;
                return { k: 'cmd', code };
            }
            if (n === '{') {
                let depth = 0;
                let j = this.i + 1;
                for (; j < s.length; j++) {
                    if (s[j] === '\\') { j++; continue; }
                    if (s[j] === '{') depth++;
                    else if (s[j] === '}') { depth--; if (depth === 0) break; }
                }
                if (j >= s.length) throw new IncompleteError('brace');
                const spec = s.slice(this.i + 2, j);
                this.i = j + 1;
                return { k: 'param', spec };
            }
            if (n === "'" && !inDq) {
                // $'ansi quoted'
                const e = s.indexOf("'", this.i + 2);
                if (e === -1) throw new IncompleteError('quote');
                let body = s.slice(this.i + 2, e);
                this.i = e + 1;
                body = body.replace(/\\(n|t|r|\\|'|a|e|0)/g, (m, k) => ({ n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", a: '\x07', e: '\x1b', 0: '\0' }[k]));
                return { k: 'sq', s: body };
            }
            if (n !== undefined && /[A-Za-z_]/.test(n)) {
                let j = this.i + 1;
                while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
                const name = s.slice(this.i + 1, j);
                this.i = j;
                return { k: 'param', spec: name };
            }
            if (n !== undefined && /[0-9@*#?$!\-]/.test(n)) {
                this.i += 2;
                return { k: 'param', spec: n };
            }
            return null;
        }
    }

    // ===================================================================== parser

    class Parser {
        constructor(tokens) {
            this.t = tokens;
            this.p = 0;
        }

        peek(o = 0) { return this.t[this.p + o]; }
        next() { return this.t[this.p++]; }
        eof() { return this.p >= this.t.length; }

        wordText(tok) {
            if (!tok || tok.type !== 'word') return null;
            if (tok.segs.every(s => s.k === 'lit')) return tok.segs.map(s => s.s).join('');
            return null;
        }

        isReserved(tok, w) {
            return tok && tok.type === 'word' && this.wordText(tok) === w;
        }

        skipNl() { while (!this.eof() && (this.peek().type === 'nl' || (this.peek().type === 'op' && this.peek().v === ';' && false))) this.p++; }
        skipSep() { while (!this.eof() && (this.peek().type === 'nl' || (this.peek().type === 'op' && this.peek().v === ';'))) this.p++; }

        parseProgram() {
            const list = this.parseList(() => false);
            if (!this.eof()) {
                const tok = this.peek();
                const txt = tok.type === 'word' ? this.wordText(tok) || '...' : (tok.v || tok.type);
                throw new ShellSyntaxError(`syntax error near unexpected token \`${txt}'`);
            }
            return list;
        }

        // stop(tok) returns true when tok ends the list (closing keyword)
        parseList(stop) {
            const items = [];
            while (true) {
                this.skipSep();
                if (this.eof()) break;
                const tok = this.peek();
                if (stop(tok)) break;
                if (tok.type === 'op' && (tok.v === ')' || tok.v === ';;' || tok.v === ';&' || tok.v === ';;&')) break;
                const p0 = this.p;
                const node = this.parseAndOr();
                let bg = false;
                const sep = this.peek();
                let text = '';
                if (sep && sep.type === 'op' && sep.v === '&') {
                    bg = true;
                    const ft = this.t[p0], lt = this.t[this.p - 1];
                    if (ft && lt && ft.src !== undefined && ft.s !== undefined && lt.e !== undefined) text = ft.src.slice(ft.s, lt.e);
                    this.p++;
                }
                items.push({ node, bg, text });
            }
            return { t: 'list', items };
        }

        parseAndOr() {
            const first = this.parsePipeline();
            const rest = [];
            while (!this.eof()) {
                const tok = this.peek();
                if (tok.type === 'op' && (tok.v === '&&' || tok.v === '||')) {
                    this.p++;
                    this.skipNl();
                    if (this.eof()) throw new IncompleteError('andor');
                    rest.push({ op: tok.v, node: this.parsePipeline() });
                } else break;
            }
            return rest.length ? { t: 'andor', first, rest } : first;
        }

        parsePipeline() {
            let neg = false;
            if (this.isReserved(this.peek(), '!')) { neg = true; this.p++; }
            if (this.isReserved(this.peek(), 'time')) this.p++;
            const cmds = [this.parseCommand()];
            while (!this.eof()) {
                const tok = this.peek();
                if (tok.type === 'op' && (tok.v === '|' || tok.v === '|&')) {
                    this.p++;
                    this.skipNl();
                    if (this.eof()) throw new IncompleteError('pipe');
                    const c = this.parseCommand();
                    if (tok.v === '|&') cmds[cmds.length - 1].mergeErr = true;
                    cmds.push(c);
                } else break;
            }
            return cmds.length === 1 && !neg ? cmds[0] : { t: 'pipeline', cmds, neg };
        }

        parseRedirs(node) {
            const redirs = node.redirs || (node.redirs = []);
            while (!this.eof()) {
                const tok = this.peek();
                if (tok.type === 'op' && /^(>>|>&|>\||>|<<<|<<-|<<|<&|<>|<|&>>|&>)$/.test(tok.v)) {
                    this.p++;
                    if (tok.v === '<<' || tok.v === '<<-') {
                        const w = this.next();
                        if (!w || w.type !== 'word') throw new ShellSyntaxError("syntax error near unexpected token `newline'");
                        redirs.push({ op: tok.v, fd: tok.fd, heredoc: tok.heredoc, word: w });
                        continue;
                    }
                    const target = this.next();
                    if (!target || target.type !== 'word') throw new ShellSyntaxError("syntax error near unexpected token `newline'");
                    redirs.push({ op: tok.v, fd: tok.fd, word: target });
                } else break;
            }
            return node;
        }

        parseCommand() {
            const tok = this.peek();
            if (!tok) throw new IncompleteError('command');
            if (tok.type === 'arith') {
                this.p++;
                return this.parseRedirs({ t: 'arith', expr: tok.expr, line: tok.line });
            }
            if (tok.type === 'op' && tok.v === '(') {
                this.p++;
                const body = this.parseList(() => false);
                const close = this.next();
                if (!close || close.type !== 'op' || close.v !== ')') throw new IncompleteError('subshell');
                return this.parseRedirs({ t: 'subshell', body, line: tok.line });
            }
            if (tok.type === 'op') throw new ShellSyntaxError(`syntax error near unexpected token \`${tok.v}'`);
            if (tok.type === 'nl') throw new ShellSyntaxError("syntax error near unexpected token `newline'");
            const w = this.wordText(tok);
            switch (w) {
                case 'if': return this.parseIf();
                case 'for': return this.parseFor();
                case 'while': case 'until': return this.parseWhile(w);
                case 'case': return this.parseCase();
                case 'select': return this.parseFor();
                case '{': {
                    this.p++;
                    const body = this.parseList(t => this.isReserved(t, '}'));
                    if (this.eof() || !this.isReserved(this.peek(), '}')) throw new IncompleteError('group');
                    this.p++;
                    return this.parseRedirs({ t: 'group', body, line: tok.line });
                }
                case 'function': return this.parseFunction();
                case '[[': return this.parseCond();
                default: break;
            }
            // name() { ... }
            if (w && /^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(w) && this.peek(1) && this.peek(1).type === 'op' && this.peek(1).v === '(' && this.peek(2) && this.peek(2).type === 'op' && this.peek(2).v === ')') {
                this.p += 3;
                this.skipNl();
                const body = this.parseCommand();
                return { t: 'func', name: w, body, line: tok.line };
            }
            if (w && ['then', 'else', 'elif', 'fi', 'do', 'done', 'esac', '}', ']]'].includes(w)) throw new ShellSyntaxError(`syntax error near unexpected token \`${w}'`);
            return this.parseSimple();
        }

        expectWord(w) {
            this.skipSep();
            if (this.eof()) throw new IncompleteError(w);
            if (!this.isReserved(this.peek(), w)) {
                const tok = this.peek();
                throw new ShellSyntaxError(`syntax error near unexpected token \`${tok.type === 'word' ? this.wordText(tok) || '...' : tok.v || 'newline'}'`);
            }
            this.p++;
        }

        parseIf() {
            this.p++;
            const conds = [];
            let els = null;
            const isStop = (t) => t.type === 'word' && ['then', 'elif', 'else', 'fi'].includes(this.wordText(t));
            const cond = this.parseList(isStop);
            this.expectWord('then');
            const body = this.parseList(isStop);
            conds.push({ cond, body });
            while (true) {
                this.skipSep();
                if (this.eof()) throw new IncompleteError('fi');
                if (this.isReserved(this.peek(), 'elif')) {
                    this.p++;
                    const c2 = this.parseList(isStop);
                    this.expectWord('then');
                    const b2 = this.parseList(isStop);
                    conds.push({ cond: c2, body: b2 });
                } else if (this.isReserved(this.peek(), 'else')) {
                    this.p++;
                    els = this.parseList(isStop);
                } else break;
            }
            this.expectWord('fi');
            return this.parseRedirs({ t: 'if', conds, els, line: this.t[this.p - 1].line });
        }

        parseFor() {
            const kw = this.next();
            const line = kw.line;
            // for (( init; cond; step ))
            const nx = this.peek();
            if (nx && nx.type === 'arith') {
                this.p++;
                const parts = nx.expr.split(';');
                if (parts.length !== 3) throw new ShellSyntaxError('syntax error: arithmetic for requires three expressions');
                this.skipSep();
                this.expectWord('do');
                const body = this.parseList(t => this.isReserved(t, 'done'));
                this.expectWord('done');
                return this.parseRedirs({ t: 'cfor', init: parts[0], cond: parts[1], step: parts[2], body, line });
            }
            const vt = this.next();
            if (!vt || vt.type !== 'word') throw new IncompleteError('for');
            const name = this.wordText(vt);
            if (!name || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new ShellSyntaxError(`\`${name || '...'}': not a valid identifier`);
            let words = null;
            this.skipSepNoSemi();
            if (this.isReserved(this.peek(), 'in')) {
                this.p++;
                words = [];
                while (!this.eof() && this.peek().type === 'word') words.push(this.next());
            }
            this.skipSep();
            this.expectWord('do');
            const body = this.parseList(t => this.isReserved(t, 'done'));
            this.expectWord('done');
            return this.parseRedirs({ t: 'for', name, words, body, line });
        }

        skipSepNoSemi() { while (!this.eof() && this.peek().type === 'nl') this.p++; }

        parseWhile(kind) {
            const kw = this.next();
            const cond = this.parseList(t => this.isReserved(t, 'do'));
            this.expectWord('do');
            const body = this.parseList(t => this.isReserved(t, 'done'));
            this.expectWord('done');
            return this.parseRedirs({ t: 'while', until: kind === 'until', cond, body, line: kw.line });
        }

        parseCase() {
            const kw = this.next();
            const subj = this.next();
            if (!subj || subj.type !== 'word') throw new IncompleteError('case');
            this.skipSepNoSemi();
            if (!this.isReserved(this.peek(), 'in')) {
                if (this.eof()) throw new IncompleteError('case');
                throw new ShellSyntaxError("syntax error near unexpected token `" + (this.wordText(this.peek()) || '...') + "'");
            }
            this.p++;
            const clauses = [];
            while (true) {
                this.skipSep();
                if (this.eof()) throw new IncompleteError('esac');
                if (this.isReserved(this.peek(), 'esac')) { this.p++; break; }
                if (this.peek().type === 'op' && this.peek().v === '(') this.p++;
                const pats = [];
                while (true) {
                    const w = this.next();
                    if (!w || w.type !== 'word') throw new ShellSyntaxError('syntax error in case pattern');
                    pats.push(w);
                    const sep = this.next();
                    if (!sep) throw new IncompleteError('case');
                    if (sep.type === 'op' && sep.v === '|') continue;
                    if (sep.type === 'op' && sep.v === ')') break;
                    throw new ShellSyntaxError("syntax error near unexpected token `" + (sep.v || '...') + "'");
                }
                const body = this.parseList(t => this.isReserved(t, 'esac'));
                let term = ';;';
                if (this.peek() && this.peek().type === 'op' && [';;', ';&', ';;&'].includes(this.peek().v)) term = this.next().v;
                clauses.push({ pats, body, term });
            }
            return this.parseRedirs({ t: 'case', subj, clauses, line: kw.line });
        }

        parseFunction() {
            const kw = this.next();
            const nm = this.next();
            if (!nm || nm.type !== 'word') throw new IncompleteError('function');
            const name = this.wordText(nm);
            if (this.peek() && this.peek().type === 'op' && this.peek().v === '(') {
                this.p++;
                const c = this.next();
                if (!c || c.type !== 'op' || c.v !== ')') throw new ShellSyntaxError("syntax error near unexpected token `)'");
            }
            this.skipNl();
            if (this.eof()) throw new IncompleteError('function');
            const body = this.parseCommand();
            return { t: 'func', name, body, line: kw.line };
        }

        parseCond() {
            const open = this.next();
            // collect tokens up to ]]
            const toks = [];
            while (true) {
                if (this.eof()) throw new IncompleteError('[[');
                const t = this.peek();
                if (t.type === 'word' && this.wordText(t) === ']]') { this.p++; break; }
                if (t.type === 'nl') { this.p++; continue; }
                toks.push(t);
                this.p++;
            }
            let pos = 0;
            const parseOr = () => { let l = parseAnd(); while (toks[pos] && toks[pos].type === 'op' && toks[pos].v === '||') { pos++; l = { o: '||', l, r: parseAnd() }; } return l; };
            const parseAnd = () => { let l = parseNot(); while (toks[pos] && toks[pos].type === 'op' && toks[pos].v === '&&') { pos++; l = { o: '&&', l, r: parseNot() }; } return l; };
            const parseNot = () => {
                const t = toks[pos];
                if (t && t.type === 'word' && this.wordText(t) === '!') { pos++; return { o: '!', e: parseNot() }; }
                return parsePrimary();
            };
            const parsePrimary = () => {
                const t = toks[pos];
                if (!t) throw new ShellSyntaxError("syntax error in conditional expression");
                if (t.type === 'op' && t.v === '(') { pos++; const e = parseOr(); pos++; return e; }
                if (t.type !== 'word') throw new ShellSyntaxError("syntax error in conditional expression");
                const w = this.wordText(t);
                // unary file/string tests
                if (w && /^-[a-zA-Z]$/.test(w) && toks[pos + 1] && toks[pos + 1].type === 'word') { pos += 2; return { o: 'u', op: w, a: toks[pos - 1] }; }
                const a = t;
                pos++;
                const opTok = toks[pos];
                if (opTok && opTok.type === 'op' && (opTok.v === '<' || opTok.v === '>')) { pos++; const b = toks[pos++]; return { o: 'b', op: opTok.v, a, b }; }
                if (opTok && opTok.type === 'word') {
                    const ow = this.wordText(opTok);
                    if (['==', '=', '!=', '=~', '-eq', '-ne', '-lt', '-le', '-gt', '-ge', '-nt', '-ot', '-ef'].includes(ow)) { pos++; const b = toks[pos++]; return { o: 'b', op: ow, a, b }; }
                }
                return { o: 'u', op: '-n', a };
            };
            const expr = parseOr();
            return this.parseRedirs({ t: 'cond', expr, line: open.line });
        }

        parseSimple() {
            const first = this.peek();
            const node = { t: 'simple', assigns: [], words: [], redirs: [], line: first.line };
            let sawWord = false;
            while (!this.eof()) {
                const tok = this.peek();
                if (tok.type === 'op') {
                    if (/^(>>|>&|>\||>|<<<|<<-|<<|<&|<>|<|&>>|&>)$/.test(tok.v)) { this.parseRedirs(node); continue; }
                    break;
                }
                if (tok.type !== 'word') break;
                const txt = this.wordText(tok);
                if (!sawWord) {
                    // assignment word: NAME=value, NAME+=value, NAME[idx]=value
                    const m = tok.segs[0] && tok.segs[0].k === 'lit' ? /^([A-Za-z_][A-Za-z0-9_]*)(\[[^\]]*\])?(\+?=)/.exec(tok.segs[0].s) : null;
                    if (m) {
                        const rest = tok.segs.slice();
                        rest[0] = { k: 'lit', s: tok.segs[0].s.slice(m[0].length) };
                        if (!rest[0].s) rest.shift();
                        node.assigns.push({ name: m[1], idx: m[2] ? m[2].slice(1, -1) : null, append: m[3] === '+=', value: { type: 'word', segs: rest, line: tok.line } });
                        this.p++;
                        continue;
                    }
                }
                sawWord = true;
                node.words.push(tok);
                this.p++;
            }
            if (!node.words.length && !node.assigns.length && !node.redirs.length) {
                const tok = this.peek();
                throw new ShellSyntaxError(`syntax error near unexpected token \`${tok ? (tok.v || tok.type) : 'newline'}'`);
            }
            return node;
        }
    }

    // ===================================================================== arithmetic

    function arithEval(expr, env) {
        // env: { get(name) -> number, set(name, value), err(msg) }
        const src = expr;
        let i = 0;
        const ws = () => { while (i < src.length && /\s/.test(src[i])) i++; };
        const peekOp = (...ops) => { ws(); for (const o of ops) if (src.startsWith(o, i)) return o; return null; };
        const fail = (msg) => { throw new ShellSyntaxError(msg || `${expr.trim()}: syntax error: operand expected (error token is "${src.slice(i).trim()}")`); };
        const num = (s) => { const n = Number(s); return Number.isNaN(n) ? 0 : n; };

        function parseComma() { let v = parseAssign(); while (peekOp(',') === ',' && src[i + 1] !== undefined) { i++; v = parseAssign(); } return v; }
        function parseAssign() {
            ws();
            const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*(\*\*=|<<=|>>=|\+=|-=|\*=|\/=|%=|&=|\^=|\|=|=(?!=))/.exec(src.slice(i));
            if (m) {
                i += m[0].length;
                const rhs = parseAssign();
                let cur = env.get(m[1]);
                let v;
                switch (m[2]) {
                    case '=': v = rhs; break; case '+=': v = cur + rhs; break; case '-=': v = cur - rhs; break; case '*=': v = cur * rhs; break;
                    case '/=': if (rhs === 0) fail(`${expr.trim()}: division by 0 (error token is "${String(rhs)}")`); v = Math.trunc(cur / rhs); break;
                    case '%=': if (rhs === 0) fail(`${expr.trim()}: division by 0 (error token is "${String(rhs)}")`); v = cur % rhs; break;
                    case '&=': v = cur & rhs; break; case '|=': v = cur | rhs; break; case '^=': v = cur ^ rhs; break; case '<<=': v = cur << rhs; break; case '>>=': v = cur >> rhs; break; case '**=': v = Math.pow(cur, rhs); break;
                }
                env.set(m[1], v);
                return v;
            }
            return parseTernary();
        }
        function parseTernary() {
            const c = parseLor();
            if (peekOp('?') === '?') { i++; const a = parseAssign(); if (peekOp(':') !== ':') fail(); i++; const b = parseAssign(); return c ? a : b; }
            return c;
        }
        function parseLor() { let l = parseLand(); while (peekOp('||') === '||') { i += 2; const r = parseLand(); l = (l || r) ? 1 : 0; } return l; }
        function parseLand() { let l = parseBor(); while (peekOp('&&') === '&&') { i += 2; const r = parseBor(); l = (l && r) ? 1 : 0; } return l; }
        function parseBor() { let l = parseBxor(); while (peekOp('|') === '|' && src[i + 1] !== '|') { i++; l = l | parseBxor(); } return l; }
        function parseBxor() { let l = parseBand(); while (peekOp('^') === '^') { i++; l = l ^ parseBand(); } return l; }
        function parseBand() { let l = parseEq(); while (peekOp('&') === '&' && src[i + 1] !== '&') { i++; l = l & parseEq(); } return l; }
        function parseEq() { let l = parseRel(); for (;;) { const o = peekOp('==', '!='); if (!o) break; i += 2; const r = parseRel(); l = (o === '==' ? l === r : l !== r) ? 1 : 0; } return l; }
        function parseRel() { let l = parseShift(); for (;;) { const o = peekOp('<=', '>=', '<', '>'); if (!o || (o.length === 1 && (src[i + 1] === o))) break; i += o.length; const r = parseShift(); l = (o === '<' ? l < r : o === '>' ? l > r : o === '<=' ? l <= r : l >= r) ? 1 : 0; } return l; }
        function parseShift() { let l = parseAdd(); for (;;) { const o = peekOp('<<', '>>'); if (!o) break; i += 2; const r = parseAdd(); l = o === '<<' ? l << r : l >> r; } return l; }
        function parseAdd() { let l = parseMul(); for (;;) { const o = peekOp('+', '-'); if (!o || src[i + 1] === o) break; i++; const r = parseMul(); l = o === '+' ? l + r : l - r; } return l; }
        function parseMul() {
            let l = parsePow();
            for (;;) {
                const o = peekOp('*', '/', '%');
                if (!o || (o === '*' && src[i + 1] === '*')) break;
                i++;
                const r = parsePow();
                if ((o === '/' || o === '%') && r === 0) fail(`${expr.trim()}: division by 0 (error token is "${src.slice(i - 1).trim() || '0'}")`);
                l = o === '*' ? l * r : o === '/' ? Math.trunc(l / r) : l % r;
            }
            return l;
        }
        function parsePow() { const b = parseUnary(); if (peekOp('**') === '**') { i += 2; return Math.pow(b, parsePow()); } return b; }
        function parseUnary() {
            ws();
            const o = peekOp('++', '--', '+', '-', '!', '~');
            if (o === '++' || o === '--') {
                i += 2; ws();
                const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
                if (!m) fail();
                i += m[0].length;
                const v = env.get(m[0]) + (o === '++' ? 1 : -1);
                env.set(m[0], v);
                return v;
            }
            if (o) { i += o.length; const v = parseUnary(); return o === '-' ? -v : o === '+' ? v : o === '!' ? (v ? 0 : 1) : ~v; }
            return parsePostfix();
        }
        function parsePostfix() {
            ws();
            const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
            if (m && !/^[A-Za-z_]/.test(src[i - 1] || '')) {
                const after = src.slice(i + m[0].length).replace(/^\s*/, '');
                if (after.startsWith('++') || after.startsWith('--')) {
                    i += m[0].length; ws();
                    const op = src.slice(i, i + 2); i += 2;
                    const old = env.get(m[0]);
                    env.set(m[0], old + (op === '++' ? 1 : -1));
                    return old;
                }
            }
            return parsePrimary();
        }
        function parsePrimary() {
            ws();
            if (src[i] === '(') { i++; const v = parseComma(); ws(); if (src[i] !== ')') fail(); i++; return v; }
            let m = /^(0[xX][0-9a-fA-F]+|0[0-7]+|\d+#[0-9a-zA-Z]+|\d+)/.exec(src.slice(i));
            if (m) {
                i += m[0].length;
                const t = m[0];
                if (/^0[xX]/.test(t)) return parseInt(t, 16);
                if (/^0[0-7]+$/.test(t)) return parseInt(t, 8);
                if (t.includes('#')) { const [b, d] = t.split('#'); return parseInt(d, +b); }
                return parseInt(t, 10);
            }
            m = /^[A-Za-z_][A-Za-z0-9_]*(\[[^\]]*\])?/.exec(src.slice(i));
            if (m) { i += m[0].length; return env.get(m[0]); }
            if (i >= src.length) fail(`${expr.trim()}: syntax error: operand expected (error token is "")`);
            fail();
        }
        if (!src.trim()) return 0;
        const v = parseComma();
        ws();
        if (i < src.length) fail(`${expr.trim()}: syntax error in expression (error token is "${src.slice(i).trim()}")`);
        return v;
    }

    // ===================================================================== interpreter

    class ShellInterpreter {
        constructor(terminal) {
            this.t = terminal;
            this.funcs = {};
            this.arrays = {};          // name -> array or object (associative)
            this.assoc = new Set();
            this.scopes = [];          // local variable scopes (Map)
            this.positional = [];      // $1...
            this.scriptName = 'bash';
            this.options = { e: false, u: false, x: false, pipefail: false };
            this.traps = {};
            this.depth = 0;
            this.loopSteps = 0;
            this.lastBg = 0;
            this.curLine = 0;
            this.inScript = false;
            this.readonly = new Set();
        }

        get commands() { return this.t.commands; }
        get fs() { return this.t.commands.fs; }
        get env() { return this.t.commands.env; }

        // ---------------------------------------------------------- public helpers

        static isIncomplete(text) {
            try {
                const toks = new Lexer(text).tokenize();
                new Parser(toks).parseProgram();
                return false;
            } catch (e) {
                if (e instanceof IncompleteError) return true;
                return false;
            }
        }

        // does this line need the interpreter (as opposed to the simple command path)?
        static needsShell(line) {
            return true;   // every line runs through the interpreter; the old splitter stays as a fallback
        }

        // bash / sh as a command (bash script.sh args, bash -c 'cmd', echo cmd | bash)
        bashCommand(cmd, args, stdin) {
            const chunks = [];
            const io = { stdin: { text: stdin || '', pos: 0 }, out: (s) => { if (s) chunks.push({ k: 'o', s }); }, err: (s) => { if (s) chunks.push({ k: 'e', s }); } };
            let noExec = false, xtrace = false, errexit = false, unset = false, cstring = null;
            const rest = [];
            for (let i = 0; i < args.length; i++) {
                const a = args[i];
                if (a === '--version') return { stdout: 'GNU bash, version 5.1.8(1)-release (x86_64-redhat-linux-gnu)\nCopyright (C) 2020 Free Software Foundation, Inc.\nLicense GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>\n\nThis is free software; you are free to change and redistribute it.\nThere is NO WARRANTY, to the extent permitted by law.', stderr: '', exitCode: 0 };
                if (cstring === null && rest.length === 0 && /^-[a-zA-Z]+$/.test(a)) {
                    for (const ch of a.slice(1)) { if (ch === 'n') noExec = true; else if (ch === 'x') xtrace = true; else if (ch === 'e') errexit = true; else if (ch === 'u') unset = true; else if (ch === 'c') cstring = args[++i]; else if ('lisrv'.includes(ch)) { /* ignored */ } else return { stdout: '', stderr: `${cmd}: -${ch}: invalid option\nUsage:\t${cmd} [GNU long option] [option] ...`, exitCode: 2 }; }
                    continue;
                }
                rest.push(a);
            }
            let text, name, pos;
            if (cstring !== null) { text = cstring; name = rest[0] || cmd; pos = rest.slice(1); }
            else if (rest.length) {
                const node = this.fs.getNode(rest[0]);
                if (!node) return { stdout: '', stderr: `${cmd}: ${rest[0]}: No such file or directory`, exitCode: 127 };
                if (node.type === 'directory') return { stdout: '', stderr: `${cmd}: ${rest[0]}: Is a directory`, exitCode: 126 };
                if (!this.fs.hasPermission(node, 'r')) return { stdout: '', stderr: `${cmd}: ${rest[0]}: Permission denied`, exitCode: 126 };
                text = node.content || ''; name = rest[0]; pos = rest.slice(1);
            } else if (stdin) { text = stdin; name = cmd; pos = []; io.stdin = { text: '', pos: 0 }; }
            else return { stdout: '', stderr: `${cmd}: interactive shells are not available in the simulator; run ${cmd} script.sh or ${cmd} -c 'command'`, exitCode: 0 };
            const code = this.runScriptText(text, name, pos, io, { xtrace, noExec });
            let out = '', err = '';
            for (const c of chunks) { if (c.k === 'o') out += c.s; else err += c.s; }
            return { stdout: out.replace(/\n$/, ''), stderr: err.replace(/\n$/, ''), exitCode: code, rawStdout: out, chunks };
        }

        // ---------------------------------------------------------- variables

        lookupScope(name) {
            for (let k = this.scopes.length - 1; k >= 0; k--) if (this.scopes[k].has(name)) return this.scopes[k];
            return null;
        }

        getVar(name) {
            const sc = this.lookupScope(name);
            if (sc) return sc.get(name);
            if (Object.prototype.hasOwnProperty.call(this.env, name)) return this.env[name];
            if (this.arrays[name] !== undefined) {
                const a = this.arrays[name];
                return Array.isArray(a) ? (a[0] === undefined ? undefined : a[0]) : a['0'];
            }
            switch (name) {
                case 'RANDOM': return String(Math.floor(Math.random() * 32768));
                case 'LINENO': return String(this.curLine);
                case 'SECONDS': return String(Math.floor((Date.now() - (this.startTime || (this.startTime = Date.now()))) / 1000));
                case 'UID': case 'EUID': return String(this.fs.users[this.fs.currentUser] ? this.fs.users[this.fs.currentUser].uid : 0);
                case 'PWD': return this.fs.currentPath;
                case 'HOSTNAME': return this.commands.hostname || 'rhcsa-lab';
                case 'PPID': return '1190';
                case 'BASHPID': return '1201';
                case 'OSTYPE': return 'linux-gnu';
                case 'HOSTTYPE': return 'x86_64';
                case 'BASH_VERSION': return '5.1.8(1)-release';
                case 'IFS': return ' \t\n';
                default: return undefined;
            }
        }

        setVar(name, value) {
            if (this.readonly.has(name)) throw new ShellSyntaxError(`${name}: readonly variable`);
            const sc = this.lookupScope(name);
            if (sc) { sc.set(name, String(value)); return; }
            this.env[name] = String(value);
        }

        unsetVar(name) {
            const sc = this.lookupScope(name);
            if (sc) sc.delete(name);
            delete this.env[name];
            delete this.arrays[name];
        }

        arithEnv() {
            return {
                get: (n) => {
                    const m = /^([A-Za-z_]\w*)\[(.*)\]$/.exec(n);
                    let v;
                    if (m) { const a = this.arrays[m[1]]; const idx = this.assoc.has(m[1]) ? this.expandString(m[2], null) : this.evalArith(m[2]); v = a ? a[idx] : undefined; }
                    else v = this.getVar(n);
                    if (v === undefined || v === '') return 0;
                    const num = Number(v);
                    if (!Number.isNaN(num)) return Math.trunc(num);
                    return this.evalArith(String(v));
                },
                set: (n, v) => {
                    const m = /^([A-Za-z_]\w*)\[(.*)\]$/.exec(n);
                    if (m) { const a = this.arrays[m[1]] || (this.arrays[m[1]] = []); a[this.evalArith(m[2])] = String(v); } else this.setVar(n, v);
                }
            };
        }

        evalArith(expr) {
            // expand $vars inside first
            const expanded = this.expandString(expr, null, true);
            return arithEval(expanded, this.arithEnv());
        }

        // ---------------------------------------------------------- expansion

        specialParam(name) {
            switch (name) {
                case '?': return String(this.commands.lastExitCode || 0);
                case '#': return String(this.positional.length);
                case '@': case '*': return this.positional.join(' ');
                case '$': return '1201';
                case '!': return String(this.lastBg || '');
                case '-': return 'hB';
                case '0': return this.scriptName;
                default: return undefined;
            }
        }

        paramValue(spec) {
            // returns {value: string|undefined, array?: string[]}
            if (/^[0-9]+$/.test(spec) && spec !== '0') return { value: this.positional[parseInt(spec, 10) - 1] };
            const sp = this.specialParam(spec);
            if (sp !== undefined && spec !== '@' && spec !== '*') return { value: sp };
            if (spec === '@' || spec === '*') return { value: this.positional.join(' '), array: this.positional.slice(), star: spec === '*' };
            return { value: this.getVar(spec) };
        }

        expandParam(spec, dq, ctx) {
            // ${...} forms; returns {str} or {list} for "$@"-like
            const unbound = (n) => {
                if (this.options.u) throw new ShellSyntaxError(`${n}: unbound variable`);
                return '';
            };
            let m;
            // length: ${#var} ${#arr[@]} ${#1}
            if ((m = /^#(.+)$/.exec(spec)) && spec.length > 1 && spec !== '#') {
                const inner = m[1];
                let am = /^([A-Za-z_]\w*)\[([@*])\]$/.exec(inner);
                if (am) { const a = this.arrays[am[1]]; return { str: String(a ? (Array.isArray(a) ? a.filter(x => x !== undefined).length : Object.keys(a).length) : (this.getVar(am[1]) !== undefined ? 1 : 0)) }; }
                if (inner === '@' || inner === '*') return { str: String(this.positional.length) };
                am = /^([A-Za-z_]\w*)\[(.+)\]$/.exec(inner);
                if (am) { const a = this.arrays[am[1]]; const v = a ? a[this.assoc.has(am[1]) ? this.expandString(am[2], ctx) : this.evalArith(am[2])] : undefined; return { str: String(v === undefined ? 0 : v.length) }; }
                const pv = this.paramValue(inner).value;
                return { str: String(pv === undefined ? 0 : pv.length) };
            }
            // indirect ${!var} and ${!arr[@]}
            if ((m = /^!(.+)$/.exec(spec))) {
                const am = /^([A-Za-z_]\w*)\[[@*]\]$/.exec(m[1]);
                if (am) { const a = this.arrays[am[1]] || []; return { list: Array.isArray(a) ? a.map((v, k) => (v === undefined ? null : String(k))).filter(x => x !== null) : Object.keys(a) }; }
                const ref = this.paramValue(m[1]).value;
                return { str: ref === undefined ? '' : String(this.paramValue(ref).value || '') };
            }
            // array element / whole array
            m = /^([A-Za-z_]\w*)\[([^\]]*)\](.*)$/.exec(spec);
            if (m) {
                const [, name, idx, rest] = m;
                const arr = this.arrays[name];
                let base;
                if (idx === '@' || idx === '*') {
                    const vals = arr ? (Array.isArray(arr) ? arr.filter(x => x !== undefined) : Object.values(arr)) : (this.getVar(name) !== undefined ? [this.getVar(name)] : []);
                    if (!rest) return dq && idx === '@' ? { list: vals.map(String) } : { str: vals.join(' ') , words: vals.map(String) };
                    return this.applyModifier(vals.join(' '), rest, name, ctx, dq);
                }
                const key = this.assoc.has(name) ? this.expandString(idx, ctx) : this.evalArith(idx);
                base = arr ? arr[key] : (key === 0 ? this.getVar(name) : undefined);
                if (!rest) return { str: base === undefined ? unbound(name) : String(base) };
                return this.applyModifier(base, rest, name, ctx, dq);
            }
            m = /^(\d+|[@*#?$!\-]|[A-Za-z_]\w*)(.*)$/.exec(spec);
            if (!m) throw new ShellSyntaxError(`\${${spec}}: bad substitution`);
            const name = m[1];
            const rest = m[2];
            const pv = this.paramValue(name);
            if (!rest) {
                if (pv.array) return dq && !pv.star ? { list: pv.array } : { str: pv.value, words: pv.array };
                if (pv.value === undefined && name !== '@' && name !== '*') return { str: unbound(name) };
                return { str: pv.value === undefined ? '' : pv.value };
            }
            return this.applyModifier(pv.value, rest, name, ctx, dq, pv);
        }

        applyModifier(value, rest, name, ctx, dq, pv) {
            const isSet = value !== undefined;
            const empty = !isSet || value === '';
            let m;
            if ((m = /^(:?)([-=?+])([\s\S]*)$/.exec(rest))) {
                const colon = m[1] === ':';
                const op = m[2];
                const word = () => this.expandString(m[3], ctx);
                const useDefault = colon ? empty : !isSet;
                if (op === '-') return { str: useDefault ? word() : value };
                if (op === '=') { if (useDefault) { const w = word(); this.setVar(name, w); return { str: w }; } return { str: value }; }
                if (op === '+') return { str: useDefault ? '' : word() };
                if (op === '?') { if (useDefault) throw new ShellSyntaxError(`${name}: ${m[3] ? word() : 'parameter null or not set'}`); return { str: value }; }
            }
            const v = isSet ? String(value) : '';
            if ((m = /^:\s*(-?[^:]*)(?::\s*(-?.*))?$/.exec(rest)) && /^:[\s\-0-9]/.test(rest)) {
                if (pv && pv.array) {
                    let off = this.evalArith(m[1]);
                    if (off < 0) off += pv.array.length;
                    const len = m[2] !== undefined ? this.evalArith(m[2]) : undefined;
                    const arr = pv.array.slice(off, len === undefined ? undefined : off + len);
                    return dq && !pv.star ? { list: arr } : { str: arr.join(' ') };
                }
                let off = this.evalArith(m[1]);
                if (off < 0) off = Math.max(0, v.length + off);
                const len = m[2] !== undefined ? this.evalArith(m[2]) : undefined;
                return { str: len === undefined ? v.slice(off) : (len < 0 ? v.slice(off, v.length + len) : v.slice(off, off + len)) };
            }
            const toRe = (glob, greedy, anchor) => this.globToRegex(glob, anchor);
            if ((m = /^(##|#)([\s\S]*)$/.exec(rest))) {
                const re = new RegExp('^(?:' + this.globToRegex(this.expandString(m[2], ctx)) + ')');
                if (m[1] === '#') { for (let k = 0; k <= v.length; k++) if (new RegExp('^(?:' + this.globToRegex(this.expandString(m[2], ctx)) + ')$').test(v.slice(0, k))) return { str: v.slice(k) }; return { str: v }; }
                for (let k = v.length; k >= 0; k--) if (new RegExp('^(?:' + this.globToRegex(this.expandString(m[2], ctx)) + ')$').test(v.slice(0, k))) return { str: v.slice(k) };
                return { str: v };
            }
            if ((m = /^(%%|%)([\s\S]*)$/.exec(rest))) {
                const g = this.globToRegex(this.expandString(m[2], ctx));
                if (m[1] === '%') { for (let k = v.length; k >= 0; k--) if (new RegExp('^(?:' + g + ')$').test(v.slice(k))) return { str: v.slice(0, k) }; return { str: v }; }
                for (let k = 0; k <= v.length; k++) if (new RegExp('^(?:' + g + ')$').test(v.slice(k))) return { str: v.slice(0, k) };
                return { str: v };
            }
            if ((m = /^\/(\/|#|%)?([^\/]*)(?:\/([\s\S]*))?$/.exec(rest))) {
                const pat = this.expandString(m[2], ctx);
                const rep = m[3] !== undefined ? this.expandString(m[3], ctx) : '';
                let g = this.globToRegex(pat, true);
                if (m[1] === '#') g = '^(?:' + g + ')';
                else if (m[1] === '%') g = '(?:' + g + ')$';
                try { return { str: v.replace(new RegExp(g, m[1] === '/' ? 'g' : ''), () => rep) }; } catch (e) { return { str: v }; }
            }
            if ((m = /^(\^\^|\^|,,|,)(.*)$/.exec(rest))) {
                const all = m[1].length === 2;
                const up = m[1][0] === '^';
                const f = (s) => (up ? s.toUpperCase() : s.toLowerCase());
                return { str: all ? f(v) : f(v.slice(0, 1)) + v.slice(1) };
            }
            if (rest === '@Q') return { str: "'" + v.replace(/'/g, "'\\''") + "'" };
            throw new ShellSyntaxError(`\${${name}${rest}}: bad substitution`);
        }

        globToRegex(glob, noAnchors) {
            let re = '';
            for (let k = 0; k < glob.length; k++) {
                const c = glob[k];
                if (c === '*') re += '[\\s\\S]*';
                else if (c === '?') re += '[\\s\\S]';
                else if (c === '[') {
                    const e = glob.indexOf(']', k + 2);
                    if (e === -1) re += '\\[';
                    else { let body = glob.slice(k + 1, e); if (body[0] === '!') body = '^' + body.slice(1); re += '[' + body.replace(/\\/g, '\\\\') + ']'; k = e; }
                } else if (c === '\\' && k + 1 < glob.length) { re += glob[k + 1].replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); k++; }
                else re += c.replace(/[.*+?^${}()|\\\/]/g, '\\$&');
            }
            return re;
        }

        // expand a word (token) to a list of fields
        expandWord(word, ctx, opts = {}) {
            const fields = [];
            let cur = null;       // current field being built (string) or null
            let globOk = false;   // does the current field contain unquoted glob characters?
            let hasQuoted = false;
            const push = () => {
                if (cur !== null) {
                    fields.push({ s: cur, glob: globOk, q: hasQuoted });
                }
                cur = null; globOk = false; hasQuoted = false;
            };
            const add = (str, quoted, splittable) => {
                if (splittable) {
                    const ifs = this.getVar('IFS') !== undefined ? this.getVar('IFS') : ' \t\n';
                    if (ifs === '') { cur = (cur || '') + str; return; }
                    const re = new RegExp('[' + ifs.replace(/[\]\\^-]/g, '\\$&') + ']+');
                    const pieces = str.split(re);
                    pieces.forEach((pc, idx) => {
                        if (idx > 0) push();
                        if (pc !== '' || (idx === 0 && cur !== null)) { cur = (cur === null ? '' : cur) + pc; if (!quoted && /[*?\[]/.test(pc)) globOk = true; }
                    });
                    // leading separator: str started with whitespace -> end previous field
                    if (re.test(str.charAt(0)) && str.length && pieces[0] === '') { /* push done by split index */ }
                    return;
                }
                cur = (cur === null ? '' : cur) + str;
                if (!quoted && /[*?\[]/.test(str)) globOk = true;
                if (quoted) hasQuoted = true;
            };
            const expandSeg = (sg, inDq) => {
                switch (sg.k) {
                    case 'lit': add(sg.s, inDq, false); break;
                    case 'esc': add(sg.s, true, false); hasQuoted = true; break;
                    case 'sq': add(sg.s, true, false); hasQuoted = true; if (cur === null) cur = ''; break;
                    case 'dq': {
                        if (cur === null) cur = '';
                        hasQuoted = true;
                        for (const p of sg.parts) expandSeg(p, true);
                        break;
                    }
                    case 'param': {
                        const r = this.expandParam(sg.spec, inDq, ctx);
                        if (r.list) {
                            // "$@": each element its own field
                            if (!r.list.length) { if (cur === null) cur = null; break; }
                            r.list.forEach((x, idx) => { if (idx > 0) push(); add(String(x), true, false); });
                        } else if (inDq) add(r.str === undefined ? '' : r.str, true, false);
                        else if (r.words && !r.star) { r.words.forEach((x, idx) => { if (idx > 0) push(); add(String(x), true, false); }); }
                        else add(r.str === undefined ? '' : r.str, false, true);
                        break;
                    }
                    case 'cmd': {
                        const out = this.captureSub(sg.code, ctx);
                        add(out, inDq, !inDq);
                        break;
                    }
                    case 'arith': add(String(this.evalArith(sg.expr)), inDq, !inDq); break;
                    case 'psub': add(this.processSub(sg, ctx), true, false); break;
                    case 'arrlit': add('', true, false); break;
                    default: break;
                }
            };
            for (const sg of word.segs) expandSeg(sg, false);
            push();
            // tilde, brace, glob
            const result = [];
            for (const f of fields) {
                let s = f.s;
                if (!opts.noGlob) {
                    if (!f.q && /^~(\/|$)/.test(s)) s = (this.env.HOME || '/root') + s.slice(1);
                    else if (!f.q && /^~[a-z_][a-z0-9_-]*(\/|$)/.test(s)) { const u = s.slice(1).split('/')[0]; if (this.fs.users[u]) s = this.fs.users[u].home + s.slice(1 + u.length); }
                    if (!f.q && /\{[^{}]*(,|\.\.)[^{}]*\}/.test(s)) {
                        let list = [s];
                        try { list = this.t.expandBraces([s]); } catch (e) { list = [s]; }
                        for (const b of list) {
                            if (/[*?\[]/.test(b)) result.push(...this.globFiles(b)); else result.push(b);
                        }
                        continue;
                    }
                    if (f.glob) { result.push(...this.globFiles(s)); continue; }
                }
                result.push(s);
            }
            return result;
        }

        globFiles(pattern) {
            let hits = [];
            try { hits = this.t.expandGlobs([pattern]); } catch (e) { hits = [pattern]; }
            return hits;
        }

        expandString(text, ctx, forArith) {
            // expand a raw string as if it were inside double quotes (for ${x:-word}, arithmetic...)
            if (!/[$`\\]/.test(text)) return text;
            try {
                const lx = new Lexer('"' + text.replace(/"/g, '\\"') + '"');
                const tok = lx.readWord();
                const f = this.expandWord(tok, ctx, { noGlob: true });
                return f.join(' ');
            } catch (e) {
                if (e instanceof ShellSyntaxError) throw e;
                return text;
            }
        }

        expandToString(word, ctx) {
            // single-string expansion without word splitting or globbing (assignments, redirect targets, case subjects)
            const parts = [];
            const wrapped = { type: 'word', segs: [{ k: 'dq', parts: word.segs.map(s => (s.k === 'dq' ? null : s)).flatMap((s, idx) => (s === null ? word.segs[idx].parts : [s])) }] };
            // tilde
            const f = this.expandWord(wrapped, ctx, { noGlob: true });
            let out = f.join(' ');
            if (word.segs[0] && word.segs[0].k === 'lit' && /^~(\/|$)/.test(word.segs[0].s)) out = (this.env.HOME || '/root') + out.slice(1);
            return out;
        }

        // ---------------------------------------------------------- command substitution

        captureSub(code, ctx) {
            const io = this.newCapture();
            const saved = this.snapshot();
            try {
                this.runCode(code, io, { sub: true });
            } catch (e) {
                if (!(e instanceof ExitSignal) && !(e instanceof ReturnSignal)) throw e;
            } finally {
                this.restore(saved, true);
            }
            if (ctx && ctx.err) ctx.err(io.errText());
            else if (this.curErr) this.curErr(io.errText());
            return io.outText().replace(/\n+$/, '');
        }

        processSub(sg, ctx) {
            const io = this.newCapture();
            const saved = this.snapshot();
            try { this.runCode(sg.code, io, { sub: true }); } finally { this.restore(saved, true); }
            const name = `/tmp/.psub-${Math.floor(Math.random() * 1e6)}`;
            this.writeFile(name, io.outText(), false);
            return name;
        }

        newCapture() {
            const o = [], e = [];
            return {
                stdin: { text: '', pos: 0 },
                piped: true,
                out: (s) => { if (s) o.push(s); },
                err: (s) => { if (s) e.push(s); },
                outText: () => o.join(''),
                errText: () => e.join('')
            };
        }

        snapshot() {
            return { env: Object.assign({}, this.env), cwd: this.fs.currentPath, positional: this.positional.slice(), arrays: JSON.parse(JSON.stringify(this.arrays)), scopes: this.scopes.length, options: Object.assign({}, this.options), funcs: this.funcs, name: this.scriptName };
        }

        restore(s, keepFuncs) {
            for (const k of Object.keys(this.env)) if (!(k in s.env)) delete this.env[k];
            Object.assign(this.env, s.env);
            this.fs.currentPath = s.cwd;
            this.positional = s.positional;
            this.arrays = s.arrays;
            this.scopes.length = s.scopes;
            this.options = s.options;
            this.scriptName = s.name;
            if (this.fs.users[this.fs.currentUser]) this.env.PWD = this.fs.currentPath;
        }

        // ---------------------------------------------------------- running code

        runCode(code, io, opts = {}) {
            let ast;
            ast = new Parser(new Lexer(code).tokenize()).parseProgram();
            return this.execList(ast, io);
        }

        // top level: returns { chunks, exitCode }
        runTop(code, opts = {}) {
            const chunks = [];
            const io = {
                stdin: { text: opts.stdin || '', pos: 0 },
                out: (s) => { if (s) chunks.push({ k: 'o', s }); },
                err: (s) => { if (s) chunks.push({ k: 'e', s }); }
            };
            let code0 = 0;
            const wasScript = this.inScript;
            this.inScript = !!opts.script;
            if (!opts.script) this.topLine = code;
            this.steps = 0;
            const prevName = this.scriptName;
            this.interactive = !!opts.interactive;
            this.inputQueue = opts.inputQueue || [];
            this.inputPos = 0;
            if (opts.name) this.scriptName = opts.name;
            const prevPos = this.positional;
            if (opts.args) this.positional = opts.args;
            try {
                try {
                    code0 = this.runCode(code, io);
                } catch (e) {
                    if (e instanceof ExitSignal) code0 = e.code;
                    else if (e instanceof ErrExitSignal) code0 = e.code;
                    else if (e instanceof ReturnSignal) code0 = e.code;
                    else if (e instanceof BreakSignal || e instanceof ContinueSignal) code0 = 0;
                    else if (e instanceof NeedInput) { this.commands.lastExitCode = 130; return { chunks, exitCode: 130, needInput: e.info }; }
                    else if (e instanceof IncompleteError) { io.err(`${this.scriptName}: line ${this.curLine || 1}: syntax error: unexpected end of file\n`); code0 = 2; }
                    else if (e instanceof ShellSyntaxError) { io.err(`${this.inScript ? this.scriptName + ': line ' + (this.curLine || 1) + ': ' : 'bash: '}${e.message}\n`); code0 = e.message.includes('syntax error') ? 2 : 1; }
                    else throw e;
                }
                if (this.traps.EXIT) {
                    const tcode = this.traps.EXIT; delete this.traps.EXIT;
                    try { this.runCode(tcode, io); } catch (e) { if (!(e instanceof ExitSignal)) throw e; }
                }
            } finally {
                this.inScript = wasScript;
                this.scriptName = prevName;
                if (opts.args) this.positional = prevPos;
            }
            this.commands.lastExitCode = code0;
            return { chunks, exitCode: code0 };
        }

        // ask the user for input while a command runs (the terminal replays the line with the answers)
        takeInput(spec) {
            if (!this.interactive) return null;
            if (this.inputPos < this.inputQueue.length) return this.inputQueue[this.inputPos++];
            throw new NeedInput(spec);
        }

        statusSet(code) { this.commands.lastExitCode = code; return code; }

        execList(list, io) {
            let code = this.commands.lastExitCode || 0;
            for (const item of list.items) {
                if (item.bg && this.commands._jobStart) code = this.execBackground(item, io);
                else code = this.execNode(item.node, io, item.bg);
            }
            return code;
        }

        // cmd & : the job table starts it (long commands keep running, short ones finish at once)
        execBackground(item, io) {
            let ran = false;
            const run = () => {
                ran = true;
                try { return this.execNode(item.node, io); } catch (e) { if (e instanceof ErrExitSignal) return e.code; throw e; }
            };
            const pid = this.commands._jobStart(item.text || '', run, io);
            if (!ran && pid === false) { run(); return this.commands.lastExitCode || 0; }
            if (pid) this.lastBg = pid;
            return 0;
        }

        execNode(node, io, bg) {
            if (node.line) this.curLine = node.line;
            let code;
            switch (node.t) {
                case 'simple': code = this.execSimple(node, io); break;
                case 'pipeline': code = this.execPipeline(node, io); break;
                case 'andor': {
                    code = this.execNodeNoErrExit(node.first, io);
                    for (const r of node.rest) {
                        if (r.op === '&&' ? code === 0 : code !== 0) code = this.execNodeNoErrExit(r.node, io);
                    }
                    if (code !== 0 && this.options.e) {
                        // set -e applies only when the failing command is the last of the list
                        const last = node.rest[node.rest.length - 1];
                        const lastRan = last ? (last.op === '&&' ? true : false) : false;
                        if (lastRan && node.rest.length) throw new ErrExitSignal(code);
                    }
                    break;
                }
                case 'list': code = this.execList(node, io); break;
                case 'if': code = this.withRedirs(node, io, (io2) => this.execIf(node, io2)); break;
                case 'for': code = this.withRedirs(node, io, (io2) => this.execFor(node, io2)); break;
                case 'cfor': code = this.withRedirs(node, io, (io2) => this.execCFor(node, io2)); break;
                case 'while': code = this.withRedirs(node, io, (io2) => this.execWhile(node, io2)); break;
                case 'case': code = this.withRedirs(node, io, (io2) => this.execCase(node, io2)); break;
                case 'group': code = this.withRedirs(node, io, (io2) => this.execList(node.body, io2)); break;
                case 'subshell': code = this.withRedirs(node, io, (io2) => this.execSubshell(node, io2)); break;
                case 'arith': code = this.withRedirs(node, io, () => (this.evalArith(node.expr) !== 0 ? 0 : 1)); break;
                case 'cond': code = this.withRedirs(node, io, (io2) => (this.evalCond(node.expr, io2) ? 0 : 1)); break;
                case 'func': this.funcs[node.name] = node.body; code = 0; break;
                default: throw new ShellSyntaxError('unsupported construct');
            }
            this.statusSet(code);
            if (code !== 0 && this.options.e && !this.noErrExit && ['simple', 'pipeline', 'subshell', 'group', 'if', 'for', 'while', 'case', 'cond', 'arith'].includes(node.t) && !this.inCondition) {
                throw new ErrExitSignal(code);
            }
            if (code !== 0 && this.traps.ERR && !this.inCondition) { try { this.runCode(this.traps.ERR, io); } catch (e) { if (!(e instanceof ExitSignal)) throw e; } }
            return code;
        }

        execNodeNoErrExit(node, io) {
            const prev = this.noErrExit;
            this.noErrExit = true;
            try { return this.execNode(node, io); } finally { this.noErrExit = prev; }
        }

        execCondList(list, io) {
            const prev = this.inCondition;
            this.inCondition = true;
            try { return this.execList(list, io); } finally { this.inCondition = prev; }
        }

        execIf(node, io) {
            for (const c of node.conds) {
                if (this.execCondList(c.cond, io) === 0) return this.execList(c.body, io);
            }
            if (node.els) return this.execList(node.els, io);
            return 0;
        }

        tick() {
            if (++this.steps > 20000) throw new ShellSyntaxError('simulator stopped a loop that ran more than 20000 iterations (press Ctrl+C on a real system)');
        }

        execFor(node, io) {
            let items;
            if (node.words === null) items = this.positional.slice();
            else { items = []; for (const w of node.words) items.push(...this.expandWord(w, io)); }
            let code = 0;
            for (const it of items) {
                this.tick();
                this.setVar(node.name, it);
                try { code = this.execList(node.body, io); }
                catch (e) {
                    if (e instanceof BreakSignal) { if (e.n > 1) throw new BreakSignal(e.n - 1); break; }
                    if (e instanceof ContinueSignal) { if (e.n > 1) throw new ContinueSignal(e.n - 1); continue; }
                    throw e;
                }
            }
            return code;
        }

        execCFor(node, io) {
            if (node.init.trim()) this.evalArith(node.init);
            let code = 0;
            while (!node.cond.trim() || this.evalArith(node.cond) !== 0) {
                this.tick();
                try { code = this.execList(node.body, io); }
                catch (e) {
                    if (e instanceof BreakSignal) { if (e.n > 1) throw new BreakSignal(e.n - 1); break; }
                    if (e instanceof ContinueSignal) { if (e.n > 1) { throw new ContinueSignal(e.n - 1); } }
                    else throw e;
                }
                if (node.step.trim()) this.evalArith(node.step);
            }
            return code;
        }

        execWhile(node, io) {
            let code = 0;
            while (true) {
                this.tick();
                const c = this.execCondList(node.cond, io);
                if (node.until ? c === 0 : c !== 0) break;
                try { code = this.execList(node.body, io); }
                catch (e) {
                    if (e instanceof BreakSignal) { if (e.n > 1) throw new BreakSignal(e.n - 1); break; }
                    if (e instanceof ContinueSignal) { if (e.n > 1) throw new ContinueSignal(e.n - 1); continue; }
                    throw e;
                }
            }
            return code;
        }

        execCase(node, io) {
            const subj = this.expandToString(node.subj, io);
            let matched = false;
            for (const cl of node.clauses) {
                let hit = matched;
                if (!hit) {
                    for (const pw of cl.pats) {
                        const raw = pw.segs.map(s => (s.k === 'lit' ? s.s : (s.k === 'sq' ? s.s.replace(/[*?\[\]\\]/g, '\\$&') : (s.k === 'esc' ? '\\' + s.s : this.expandToString({ segs: [s] }, io))))).join('');
                        if (new RegExp('^(?:' + this.globToRegex(raw) + ')$').test(subj)) { hit = true; break; }
                    }
                }
                if (hit) {
                    const code = this.execList(cl.body, io);
                    if (cl.term === ';;') return code;
                    matched = cl.term === ';&' ? true : false;
                    if (cl.term === ';;&') matched = false;
                    if (cl.term === ';&') matched = true;
                    else if (cl.term !== ';;&') return code;
                }
            }
            return 0;
        }

        execSubshell(node, io) {
            const saved = this.snapshot();
            try { return this.execList(node.body, io); }
            catch (e) { if (e instanceof ExitSignal) return e.code; throw e; }
            finally { this.restore(saved); }
        }

        // ---------------------------------------------------------- redirections

        withRedirs(node, io, fn) {
            if (!node.redirs || !node.redirs.length) return fn(io);
            const r = this.setupRedirs(node.redirs, io);
            if (r.error) { io.err(r.error); return 1; }
            let code;
            try { code = fn(r.io); } finally { r.finish(); }
            return code;
        }

        setupRedirs(redirs, io) {
            const fileWrites = [];
            const state = { stdin: io.stdin, out: io.out, err: io.err };
            let outFile = null, errFile = null;
            let errorMsg = null;
            const sink = (path, append) => {
                const buf = [];
                fileWrites.push({ path, buf, append });
                return (s) => { if (s) buf.push(s); };
            };
            for (const rd of redirs) {
                const op = rd.op;
                if (op === '<<' || op === '<<-') {
                    const body = rd.heredoc ? (rd.heredoc.expand ? this.expandHeredoc(rd.heredoc.body, io) : rd.heredoc.body) : '';
                    state.stdin = { text: body, pos: 0 };
                    continue;
                }
                if (op === '<<<') { state.stdin = { text: this.expandToString(rd.word, io) + '\n', pos: 0 }; continue; }
                const target = this.expandToString(rd.word, io);
                if (op === '<') {
                    const node = this.fs.getNode(target);
                    if (!node) { errorMsg = `bash: ${target}: No such file or directory\n`; break; }
                    if (node.type !== 'file') { errorMsg = `bash: ${target}: Is a directory\n`; break; }
                    if (!this.fs.hasPermission(node, 'r')) { errorMsg = `bash: ${target}: Permission denied\n`; break; }
                    state.stdin = { text: node.content || '', pos: 0 };
                    continue;
                }
                const fd = rd.fd === null || rd.fd === undefined ? 1 : rd.fd;
                if (op === '>&' || op === '<&') {
                    if (/^\d+$/.test(target)) {
                        const to = parseInt(target, 10);
                        if (fd === 1 && to === 2) state.out = state.err;
                        else if (fd === 2 && to === 1) state.err = state.out;
                        continue;
                    }
                    if (target === '-') { if (fd === 1) state.out = () => {}; else state.err = () => {}; continue; }
                    // >&file  == &>file
                }
                const append = op === '>>' || op === '&>>';
                if (target === '/dev/null') {
                    if (op === '&>' || op === '&>>') { state.out = () => {}; state.err = () => {}; }
                    else if (fd === 2) state.err = () => {};
                    else state.out = () => {};
                    continue;
                }
                const chk = this.checkWritable(target, append);
                if (chk) { errorMsg = chk; break; }
                const s = sink(target, append);
                if (op === '&>' || op === '&>>' || (op === '>&')) { state.out = s; state.err = s; }
                else if (fd === 2) state.err = s;
                else state.out = s;
            }
            if (errorMsg) return { error: errorMsg };
            // files are created (truncated) up front, like a real shell
            for (const w of fileWrites) if (!w.append) this.writeFile(w.path, '', false);
            return {
                io: { stdin: state.stdin, out: state.out, err: state.err, piped: io.piped || state.out !== io.out, hasStdin: io.hasStdin || state.stdin !== io.stdin },
                finish: () => { for (const w of fileWrites) this.writeFile(w.path, w.buf.join(''), true); }
            };
        }

        expandHeredoc(body, ctx) {
            // $var, $(cmd), $((expr)) are expanded; quotes are literal
            try {
                const lx = new Lexer(body);
                const parts = [];
                let lit = '';
                const flush = () => { if (lit) { parts.push({ k: 'lit', s: lit }); lit = ''; } };
                const s = body;
                while (lx.i < s.length) {
                    const c = s[lx.i];
                    if (c === '\\' && /[$`\\]/.test(s[lx.i + 1] || '')) { lit += s[lx.i + 1]; lx.i += 2; continue; }
                    if (c === '$') { const p = lx.readDollar(true); if (p) { flush(); parts.push(p); continue; } }
                    if (c === '`') { flush(); parts.push(lx.readBacktick()); continue; }
                    lit += c; lx.i++;
                }
                flush();
                return this.expandWord({ type: 'word', segs: [{ k: 'dq', parts }] }, ctx, { noGlob: true }).join(' ');
            } catch (e) { return body; }
        }

        checkWritable(path, append) {
            const full = this.fs.resolvePath(path);
            const node = this.fs.getNode(full);
            if (this.commands._roPath && this.commands._roPath(full)) return `bash: ${path}: Read-only file system\n`;
            if (node && node.type === 'directory') return `bash: ${path}: Is a directory\n`;
            if (node) { if (!this.fs.hasPermission(node, 'w')) return `bash: ${path}: ${node.ctrRO ? 'Read-only file system' : 'Permission denied'}\n`; return null; }
            const parent = this.fs.getNode(this.fs.getParentPath(full));
            if (!parent || parent.type !== 'directory') return `bash: ${path}: No such file or directory\n`;
            if (!this.fs.hasPermission(parent, 'w')) return `bash: ${path}: ${parent.ctrRO ? 'Read-only file system' : 'Permission denied'}\n`;
            return null;
        }

        writeFile(path, content, append) {
            const full = this.fs.resolvePath(path);
            const parent = this.fs.getNode(this.fs.getParentPath(full));
            if (!parent || parent.type !== 'directory') return false;
            const base = this.fs.getBasename(full);
            const ex = parent.children[base];
            if (ex && ex.type === 'file') {
                ex.content = append ? (ex.content || '') + content : content;
                ex.size = ex.content.length;
                ex.modified = new Date();
                return true;
            }
            const user = this.fs.currentUser;
            const u = this.fs.users[user];
            const g = u ? (Object.keys(this.fs.groups).find(n => this.fs.groups[n].gid === u.gid) || user) : user;
            parent.children[base] = { type: 'file', permissions: '0644', owner: user, group: g, size: content.length, modified: new Date(), content };
            return true;
        }

        // ---------------------------------------------------------- pipelines

        execPipeline(node, io) {
            let input = io.stdin;
            const statuses = [];
            let code = 0;
            for (let k = 0; k < node.cmds.length; k++) {
                const cmd = node.cmds[k];
                const last = k === node.cmds.length - 1;
                let buf = [];
                const stageIo = {
                    piped: !last || io.piped,
                    hasStdin: k > 0 || io.hasStdin,
                    stdin: input,
                    out: last ? io.out : (s) => { if (s) buf.push(s); },
                    err: cmd.mergeErr && !last ? (s) => { if (s) buf.push(s); } : io.err
                };
                const prevInCond = this.inCondition;
                code = (() => { try { return this.execNodeInner(cmd, stageIo); } finally { this.inCondition = prevInCond; } })();
                statuses.push(code);
                input = { text: buf.join(''), pos: 0 };
            }
            let final = statuses[statuses.length - 1];
            if (this.options.pipefail) { const bad = statuses.filter(x => x !== 0); if (bad.length) final = bad[bad.length - 1]; }
            if (node.neg) final = final === 0 ? 1 : 0;
            return final;
        }

        // inside a pipeline each stage runs like a subshell for assignments, but we keep state simple
        execNodeInner(cmd, io) {
            const prev = this.noErrExit;
            this.noErrExit = true;
            try { return this.execNode(cmd, io); } finally { this.noErrExit = prev; }
        }

        // ---------------------------------------------------------- simple commands

        execSimple(node, io) {
            // assignments
            const assignEnv = [];
            for (const a of node.assigns) {
                if (a.value.segs.length === 1 && a.value.segs[0].k === 'arrlit') {
                    const code = a.value.segs[0].code;
                    const vals = this.parseArrayLiteral(code, io);
                    if (node.words.length === 0) {
                        if (a.append) { const cur = this.arrays[a.name] || (this.getVar(a.name) !== undefined ? [this.getVar(a.name)] : []); this.arrays[a.name] = Array.isArray(cur) ? cur.concat(vals.list) : cur; }
                        else if (vals.assoc) { this.assoc.add(a.name); this.arrays[a.name] = vals.map; }
                        else this.arrays[a.name] = vals.list;
                        delete this.env[a.name];
                    }
                    continue;
                }
                const val = this.expandToString(a.value, io);
                if (node.words.length === 0) {
                    if (a.idx !== null) {
                        const arr = this.arrays[a.name] || (this.arrays[a.name] = this.assoc.has(a.name) ? {} : []);
                        const key = this.assoc.has(a.name) ? this.expandString(a.idx, io) : this.evalArith(a.idx);
                        arr[key] = a.append && arr[key] !== undefined ? arr[key] + val : val;
                    } else {
                        const cur = this.getVar(a.name);
                        if (this.declaredInt && this.declaredInt.has(a.name)) this.setVar(a.name, String(this.evalArith(val)));
                        else this.setVar(a.name, a.append && cur !== undefined ? cur + val : val);
                    }
                } else {
                    assignEnv.push([a.name, val]);
                }
            }
            if (!node.words.length) {
                // redirections alone (> file) create/truncate the file
                if (node.redirs.length) { const r = this.setupRedirs(node.redirs, io); if (r.error) { io.err(r.error); return 1; } r.finish(); }
                return node.assigns.length ? (this.lastSubstStatus !== undefined ? this.lastSubstStatus : 0) : 0;
            }
            let argv = [];
            for (const w of node.words) argv.push(...this.expandWord(w, io));
            if (!argv.length) return 0;
            if (this.options.x) io.err('+ ' + argv.join(' ') + '\n');

            const r = this.setupRedirs(node.redirs, io);
            if (r.error) { io.err(r.error); return 1; }
            // temporary environment for this command
            const saved = {};
            for (const [k, v] of assignEnv) { saved[k] = Object.prototype.hasOwnProperty.call(this.env, k) ? this.env[k] : undefined; this.env[k] = v; }
            let code;
            try {
                code = this.runCommand(argv, r.io, node);
            } finally {
                for (const k of Object.keys(saved)) { if (saved[k] === undefined) delete this.env[k]; else this.env[k] = saved[k]; }
                r.finish();
            }
            return code;
        }

        parseArrayLiteral(code, io) {
            // ( a b "c d" [k]=v ... )
            const toks = new Lexer(code).tokenize().filter(t => t.type === 'word');
            const list = [];
            const map = {};
            let assoc = false;
            for (const t of toks) {
                const first = t.segs[0];
                const m = first && first.k === 'lit' ? /^\[([^\]]+)\]=(.*)$/.exec(first.s) : null;
                if (m) {
                    assoc = true;
                    const rest = t.segs.slice(); rest[0] = { k: 'lit', s: m[2] };
                    map[m[1]] = this.expandToString({ type: 'word', segs: rest }, io);
                    continue;
                }
                list.push(...this.expandWord(t, io));
            }
            return { list, map, assoc };
        }

        // run a command given its argv
        runCommand(argv, io, node) {
            const name = argv[0];
            const args = argv.slice(1);
            if (Object.prototype.hasOwnProperty.call(this.funcs, name)) return this.callFunction(name, args, io);
            const b = this.builtin(name, args, io, node);
            if (b !== undefined) return b;
            return this.runExternal(name, args, io, node);
        }

        callFunction(name, args, io) {
            if (this.depth > 200) { io.err(`bash: ${name}: maximum function nesting level exceeded\n`); return 1; }
            this.depth++;
            const savedPos = this.positional;
            this.positional = args;
            this.scopes.push(new Map());
            try {
                return this.execNode(this.funcs[name], io);
            } catch (e) {
                if (e instanceof ReturnSignal) return e.code;
                throw e;
            } finally {
                this.scopes.pop();
                this.positional = savedPos;
                this.depth--;
            }
        }

        // ---------------------------------------------------------- external commands & scripts

        runExternal(name, args, io, node) {
            const line = node && node.line ? node.line : this.curLine;
            const where = this.inScript ? `${this.scriptName}: line ${line}: ` : 'bash: ';
            // path commands: ./script, /usr/local/bin/x, relative/with/slash
            if (name.includes('/')) return this.runPath(name, args, io, where);
            const fn = this.t.commandMethod(name);
            if (fn) return this.callCommand(name, fn, args, io);
            // a program whose package is not installed does not exist, even if an empty placeholder file is on disk
            if (this.commands._cmdGate && this.commands._cmdGate(name) === false) { io.err(`${where}${name}: command not found\n`); return 127; }
            // PATH lookup for scripts
            const dirs = (this.env.PATH || '').split(':');
            for (const d of dirs) {
                const p = (d || '.') + '/' + name;
                const n = this.fs.getNode(p);
                if (n && n.type === 'file' && /[1357]/.test((n.permissions || '0644').slice(-3))) return this.runPath(p, args, io, where, name);
            }
            io.err(`${where}${name}: command not found\n`);
            return 127;
        }

        callCommand(name, fn, args, io) {
            this.commands._stdoutIsPipe = !!io.piped;
            this.commands._curIo = io;
            this.commands._hasStdin = !!io.hasStdin;
            let stdinText = io.stdin.text.slice(io.stdin.pos);
            let res;
            const ro = this.commands._roGuard ? this.commands._roGuard(name, args) : null;
            if (ro) { io.err(ro + '\n'); return 1; }
            try {
                res = fn.call(this.commands, args, stdinText);
            } catch (err) {
                if (err instanceof NeedInput || err instanceof ExitSignal || err instanceof ReturnSignal || err instanceof BreakSignal || err instanceof ContinueSignal || err instanceof ErrExitSignal || err instanceof ShellSyntaxError || err instanceof IncompleteError) throw err;
                io.err(`bash: ${name}: ${err.message}\n`);
                return 1;
            }
            if (res === undefined || res === null) return 0;
            if (res.output !== undefined || res.error !== undefined) res = { stdout: res.output || '', stderr: res.error || '', exitCode: res.error ? 1 : 0 };
            if (stdinText) io.stdin.pos = io.stdin.text.length;
            if (res.chunks) { for (const c of res.chunks) (c.k === 'o' ? io.out : io.err)(c.s); return typeof res.exitCode === 'number' ? res.exitCode : 0; }
            let out = res.rawStdout !== undefined ? res.rawStdout : res.stdout;
            if (out) {
                if (res.rawStdout === undefined && !out.endsWith('\n') && name !== 'echo' && name !== 'printf') out += '\n';
                io.out(out);
            }
            if (res.stderr) io.err(res.stderr.endsWith('\n') ? res.stderr : res.stderr + '\n');
            if (res.changeDir) this.cdChanged = true;
            if (res.clearScreen) this.clearRequested = true;
            return typeof res.exitCode === 'number' ? res.exitCode : 0;
        }

        runPath(path, args, io, where, shownName) {
            const full = this.fs.resolvePath(path);
            const node = this.fs.getNode(full);
            const shown = shownName || path;
            // /usr/bin/ls, /usr/sbin/ip, /usr/bin/podman ...: the simulated command, unless a real script lives there
            if (/^\/(usr\/)?(local\/)?s?bin\/[^/]+$/.test(full)) {
                const stub = !node || (node.type === 'file' && /not simulated in Red Cat/.test(node.content || ''));
                const base = full.split('/').pop();
                const fn = stub ? this.t.commandMethod(base) : null;
                if (fn) return this.callCommand(base, fn, args, io);
            }
            if (!node) { io.err(`${where}${shown}: No such file or directory\n`); return 127; }
            if (node.type === 'directory') { io.err(`${where}${shown}: Is a directory\n`); return 126; }
            const mode = (node.permissions || '0644').slice(-3);
            const exec = this.fs.currentUid === 0 ? /[1357]/.test(mode) : this.fs.hasPermission(node, 'x');
            if (!exec) { io.err(`${where}${shown}: Permission denied\n`); return 126; }
            return this.runScriptNode(node, shown, args, io, { shown });
        }

        runScriptNode(node, name, args, io, opts = {}) {
            const text = node.content || '';
            const first = text.split('\n')[0];
            const sb = /^#!\s*(\S+)(?:\s+(\S+))?/.exec(first);
            if (sb) {
                const interp = sb[1].split('/').pop() === 'env' ? (sb[2] || '') : sb[1].split('/').pop();
                if (!['bash', 'sh', 'dash', 'zsh', 'ksh'].includes(interp)) {
                    io.err(`bash: ${name}: ${sb[1]}: bad interpreter: No such file or directory\n`);
                    return 126;
                }
            }
            return this.runScriptText(text, name, args, io);
        }

        // run script text as a child shell: variable changes do not leak out
        runScriptText(text, name, args, io, opts = {}) {
            const saved = this.snapshot();
            const savedFuncs = this.funcs;
            const savedTraps = this.traps;
            const savedScript = this.inScript;
            const savedSteps = this.steps;
            this.funcs = Object.assign({}, this.funcs);
            this.traps = {};
            this.inScript = true;
            this.scriptName = name;
            this.positional = args.slice();
            this.options = { e: false, u: false, x: !!opts.xtrace, pipefail: false };
            if (opts.xtrace) this.options.x = true;
            let code = 0;
            try {
                let ast;
                try { ast = new Parser(new Lexer(text).tokenize()).parseProgram(); }
                catch (e) {
                    if (e instanceof IncompleteError) { io.err(`${name}: line ${text.split('\n').length}: syntax error: unexpected end of file\n`); return 2; }
                    if (e instanceof ShellSyntaxError) { io.err(`${name}: line ${this.curLine || 1}: ${e.message}\n`); return 2; }
                    throw e;
                }
                if (opts.noExec) return 0;
                try { code = this.execList(ast, io); }
                catch (e) {
                    if (e instanceof ExitSignal || e instanceof ErrExitSignal || e instanceof ReturnSignal) code = e.code;
                    else if (e instanceof ShellSyntaxError) { io.err(`${name}: line ${this.curLine}: ${e.message}\n`); code = e.message.includes('unbound variable') ? 1 : 1; }
                    else throw e;
                }
                if (this.traps.EXIT) { const t = this.traps.EXIT; delete this.traps.EXIT; try { this.runCode(t, io); } catch (e) { if (!(e instanceof ExitSignal)) throw e; } }
            } finally {
                this.restore(saved);
                this.funcs = savedFuncs;
                this.traps = savedTraps;
                this.inScript = savedScript;
                this.steps = savedSteps;
            }
            return code;
        }

        // ---------------------------------------------------------- conditions ([ ], [[ ]])

        fileTest(op, path) {
            const full = this.fs.resolvePath(path);
            const n = this.fs.getNode(full);
            switch (op) {
                case '-e': return !!n;
                case '-f': return !!n && n.type === 'file';
                case '-d': return !!n && n.type === 'directory';
                case '-L': case '-h': return !!n && n.type === 'symlink';
                case '-s': return !!n && n.type === 'file' && (n.size || (n.content || '').length) > 0;
                case '-r': return !!n && this.fs.hasPermission(n, 'r');
                case '-w': return !!n && this.fs.hasPermission(n, 'w');
                case '-x': return !!n && (n.type === 'directory' ? true : (this.fs.currentUid === 0 ? /[1357]/.test((n.permissions || '0644').slice(-3)) : this.fs.hasPermission(n, 'x')));
                case '-b': case '-c': return !!n && !!n.device;
                case '-p': case '-S': return false;
                case '-O': return !!n && n.owner === this.fs.currentUser;
                case '-G': return !!n;
                case '-u': return !!n && /^[4567]/.test(n.permissions || '');
                case '-g': return !!n && /^[2367]/.test(n.permissions || '');
                case '-k': return !!n && /^[1357]/.test(n.permissions || '');
                default: return false;
            }
        }

        // POSIX `test` on already-expanded args
        testArgs(a, io, bracket) {
            const bad = (msg) => { throw new ShellSyntaxError(msg); };
            let pos = 0;
            const unaryOps = ['-e', '-f', '-d', '-L', '-h', '-s', '-r', '-w', '-x', '-b', '-c', '-p', '-S', '-O', '-G', '-u', '-g', '-k', '-z', '-n', '-t'];
            const parseOr = () => { let v = parseAnd(); while (a[pos] === '-o') { pos++; const r = parseAnd(); v = v || r; } return v; };
            const parseAnd = () => { let v = parseNot(); while (a[pos] === '-a') { pos++; const r = parseNot(); v = v && r; } return v; };
            const parseNot = () => { if (a[pos] === '!') { pos++; return !parseNot(); } return parsePrim(); };
            const parsePrim = () => {
                if (a[pos] === '(') { pos++; const v = parseOr(); if (a[pos] !== ')') bad("`)' expected"); pos++; return v; }
                const x = a[pos];
                if (x === undefined) return false;
                // binary?
                const op = a[pos + 1];
                const binOps = ['=', '==', '!=', '-eq', '-ne', '-lt', '-le', '-gt', '-ge', '-nt', '-ot', '-ef', '<', '>'];
                if (op !== undefined && binOps.includes(op) && a[pos + 2] !== undefined) {
                    const y = a[pos + 2];
                    pos += 3;
                    if (['-eq', '-ne', '-lt', '-le', '-gt', '-ge'].includes(op)) {
                        if (!/^\s*[-+]?\d+\s*$/.test(x)) bad(`${x}: integer expression expected`);
                        if (!/^\s*[-+]?\d+\s*$/.test(y)) bad(`${y}: integer expression expected`);
                        const n1 = parseInt(x, 10), n2 = parseInt(y, 10);
                        return op === '-eq' ? n1 === n2 : op === '-ne' ? n1 !== n2 : op === '-lt' ? n1 < n2 : op === '-le' ? n1 <= n2 : op === '-gt' ? n1 > n2 : n1 >= n2;
                    }
                    if (op === '=' || op === '==') return x === y;
                    if (op === '!=') return x !== y;
                    if (op === '<') return x < y;
                    if (op === '>') return x > y;
                    if (op === '-nt' || op === '-ot') { const n1 = this.fs.getNode(x), n2 = this.fs.getNode(y); if (!n1 || !n2) return op === '-nt' ? !!n1 && !n2 : !n1 && !!n2; return op === '-nt' ? n1.modified > n2.modified : n1.modified < n2.modified; }
                    if (op === '-ef') return this.fs.resolvePath(x) === this.fs.resolvePath(y);
                }
                if (unaryOps.includes(x) && a[pos + 1] !== undefined) {
                    const y = a[pos + 1];
                    pos += 2;
                    if (x === '-z') return y === '';
                    if (x === '-n') return y !== '';
                    if (x === '-t') return false;
                    return this.fileTest(x, y);
                }
                pos++;
                return x !== '';
            };
            if (bracket) { if (a[a.length - 1] !== ']') bad("missing `]'"); a = a.slice(0, -1); }
            if (a.length === 0) return false;
            const v = parseOr();
            if (pos < a.length) bad(`${a[pos]}: binary operator expected`);
            return v;
        }

        evalCond(e, io) {
            switch (e.o) {
                case '||': return this.evalCond(e.l, io) || this.evalCond(e.r, io);
                case '&&': return this.evalCond(e.l, io) && this.evalCond(e.r, io);
                case '!': return !this.evalCond(e.e, io);
                case 'u': {
                    const v = this.expandToString(e.a, io);
                    if (e.op === '-z') return v === '';
                    if (e.op === '-n') return v !== '';
                    if (e.op === '-v') return this.getVar(v) !== undefined;
                    return this.fileTest(e.op, v);
                }
                case 'b': {
                    const x = this.expandToString(e.a, io);
                    if (e.op === '=~') {
                        const raw = e.b.segs.map(s => (s.k === 'lit' ? s.s : (s.k === 'sq' ? s.s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : (s.k === 'esc' ? '\\' + s.s : this.expandToString({ segs: [s] }, io))))).join('');
                        let m;
                        try { m = new RegExp(raw).exec(x); } catch (err) { throw new ShellSyntaxError('syntax error in regular expression'); }
                        if (m) { this.arrays.BASH_REMATCH = Array.from(m, v => (v === undefined ? '' : v)); } else this.arrays.BASH_REMATCH = [];
                        return !!m;
                    }
                    if (e.op === '==' || e.op === '=' || e.op === '!=') {
                        const raw = e.b.segs.map(s => (s.k === 'lit' ? s.s : (s.k === 'sq' ? s.s.replace(/[*?\[\]\\]/g, '\\$&') : (s.k === 'esc' ? '\\' + s.s : (s.k === 'dq' ? this.expandToString({ segs: [s] }, io).replace(/[*?\[\]\\]/g, '\\$&') : this.expandToString({ segs: [s] }, io)))))).join('');
                        const hit = new RegExp('^(?:' + this.globToRegex(raw) + ')$').test(x);
                        return e.op === '!=' ? !hit : hit;
                    }
                    const y = this.expandToString(e.b, io);
                    if (['-eq', '-ne', '-lt', '-le', '-gt', '-ge'].includes(e.op)) {
                        const n1 = this.evalArith(x), n2 = this.evalArith(y);
                        return e.op === '-eq' ? n1 === n2 : e.op === '-ne' ? n1 !== n2 : e.op === '-lt' ? n1 < n2 : e.op === '-le' ? n1 <= n2 : e.op === '-gt' ? n1 > n2 : n1 >= n2;
                    }
                    if (e.op === '<') return x < y;
                    if (e.op === '>') return x > y;
                    return this.testArgs([x, e.op, y], io, false);
                }
                default: return false;
            }
        }

        // ---------------------------------------------------------- builtins
        // returns exit status, or undefined when `name` is not a builtin

        builtin(name, args, io, node) {
            switch (name) {
                case ':': return 0;
                case 'true': return 0;
                case 'false': return 1;
                case '[': case 'test': {
                    try { return this.testArgs(args.slice(), io, name === '[') ? 0 : 1; }
                    catch (e) { if (e instanceof ShellSyntaxError) { io.err(`${this.inScript ? this.scriptName + ': line ' + this.curLine + ': ' : 'bash: '}${name}: ${e.message}\n`); return 2; } throw e; }
                }
                case 'exit': {
                    let c = args[0] !== undefined ? parseInt(args[0], 10) : (this.commands.lastExitCode || 0);
                    if (Number.isNaN(c)) { io.err(`bash: exit: ${args[0]}: numeric argument required\n`); c = 2; }
                    if (!this.inScript && !this.sourcing && this.scopes.length === 0) {
                        const left = this.commands.sessionExit && this.commands.sessionExit(args[0] !== undefined ? c : undefined);
                        if (left) { if (left !== 'quiet') io.out('logout\n'); return left === 'quiet' ? (args[0] !== undefined ? c : (this.commands.lastExitCode || 0)) : c; }
                        io.out('logout\n(this is a simulator: close the browser tab to leave)\n');
                        return c;
                    }
                    throw new ExitSignal(((c % 256) + 256) % 256);
                }
                case 'return': {
                    if (!this.scopes.length && !this.sourcing) { io.err('bash: return: can only `return\' from a function or sourced script\n'); return 1; }
                    const c = args[0] !== undefined ? parseInt(args[0], 10) : (this.commands.lastExitCode || 0);
                    throw new ReturnSignal(((c % 256) + 256) % 256);
                }
                case 'break': throw new BreakSignal(args[0] ? Math.max(1, parseInt(args[0], 10)) : 1);
                case 'continue': throw new ContinueSignal(args[0] ? Math.max(1, parseInt(args[0], 10)) : 1);
                case 'shift': {
                    const n = args[0] !== undefined ? parseInt(args[0], 10) : 1;
                    if (n > this.positional.length) return 1;
                    this.positional = this.positional.slice(n);
                    return 0;
                }
                case 'local': case 'declare': case 'typeset': case 'readonly': case 'export': return this.declareBuiltin(name, args, io);
                case 'unset': {
                    for (const a of args) { if (a.startsWith('-')) continue; const m = /^(\w+)\[(.+)\]$/.exec(a); if (m && this.arrays[m[1]]) delete this.arrays[m[1]][m[2]]; else if (name === 'unset' && this.funcs[a] && args.includes('-f')) delete this.funcs[a]; else this.unsetVar(a); }
                    return 0;
                }
                case 'set': return this.setBuiltin(args, io);
                case 'shopt': return 0;
                case 'read': return this.readBuiltin(args, io);
                case 'source': case '.': return this.sourceBuiltin(args, io);
                case 'eval': {
                    try { return this.runCode(args.join(' '), io); }
                    catch (e) { if (e instanceof IncompleteError || e instanceof ShellSyntaxError) { io.err(`bash: eval: ${e.message}\n`); return 2; } throw e; }
                }
                case 'exec': {
                    if (!args.length) return 0;
                    const code = this.runCommand(args, io, node);
                    throw new ExitSignal(code);
                }
                case 'trap': {
                    if (!args.length) { return 0; }
                    if (args[0] === '-l') { io.out(' 1) SIGHUP\t 2) SIGINT\t 3) SIGQUIT\t 15) SIGTERM\n'); return 0; }
                    if (args[0] === '-p') { for (const [k, v] of Object.entries(this.traps)) io.out(`trap -- '${v}' ${k}\n`); return 0; }
                    const act = args[0];
                    for (const sig of args.slice(1)) {
                        const s = String(sig).toUpperCase().replace(/^SIG/, '');
                        const key = s === '0' ? 'EXIT' : s;
                        if (act === '-' || act === '') delete this.traps[key]; else this.traps[key] = act;
                    }
                    return 0;
                }
                case 'let': {
                    let v = 0;
                    for (const a of args) v = this.evalArith(a);
                    return v !== 0 ? 0 : 1;
                }
                case 'type': return this.typeBuiltin(args, io);
                case 'command': {
                    if (args[0] === '-v' || args[0] === '-V') {
                        let st = 0;
                        for (const a of args.slice(1)) {
                            const r = this.resolveKind(a);
                            if (!r) st = 1; else io.out(args[0] === '-V' ? this.describe(a, r) + '\n' : (r.kind === 'file' ? r.path : a) + '\n');
                        }
                        return st;
                    }
                    if (!args.length) return 0;
                    const rest = args[0] === '-p' ? args.slice(1) : args;
                    const b = this.builtin(rest[0], rest.slice(1), io, node);
                    return b !== undefined ? b : this.runExternal(rest[0], rest.slice(1), io, node);
                }
                case 'builtin': { const b = this.builtin(args[0], args.slice(1), io, node); return b === undefined ? 1 : b; }
                case 'getopts': return this.getoptsBuiltin(args, io);
                case 'wait': case 'disown': { const fn = this.t.commandMethod(name); return fn ? this.callCommand(name, fn, args, io) : 0; }
                case 'times': io.out('0m0.000s 0m0.000s\n0m0.000s 0m0.000s\n'); return 0;
                case 'mapfile': case 'readarray': {
                    let nm = 'MAPFILE';
                    const rest = args.filter(a => !a.startsWith('-'));
                    if (rest[0]) nm = rest[0];
                    const t = io.stdin.text.slice(io.stdin.pos);
                    io.stdin.pos = io.stdin.text.length;
                    const lines = t.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
                    this.arrays[nm] = args.includes('-t') ? lines : lines.map(l => l + '\n');
                    return 0;
                }
                case 'printf': {
                    // -v var support, otherwise the command implementation
                    if (args[0] === '-v' && args[1]) {
                        const res = this.commands.printf(args.slice(2), '');
                        this.setVar(args[1], res.rawStdout !== undefined ? res.rawStdout : (res.stdout || ''));
                        return res.exitCode || 0;
                    }
                    return undefined;
                }
                case 'cd': {
                    let target = args.filter(a => a !== '--' && a !== '-L' && a !== '-P')[0];
                    const before = this.fs.currentPath;
                    let printIt = false;
                    if (target === '-') {
                        if (!this.env.OLDPWD) { io.err('bash: cd: OLDPWD not set\n'); return 1; }
                        target = this.env.OLDPWD; printIt = true;
                    }
                    const fn = this.t.commandMethod('cd');
                    const code = this.callCommand('cd', fn, target === undefined ? [] : [target], io);
                    if (code === 0) {
                        this.env.OLDPWD = before;
                        this.env.PWD = this.fs.currentPath;
                        if (printIt) io.out(this.fs.currentPath + '\n');
                    }
                    return code;
                }
                case 'pwd': { io.out(this.fs.currentPath + '\n'); return 0; }
                case 'alias': case 'unalias': return undefined;
                default: return undefined;
            }
        }

        declareBuiltin(name, args, io) {
            const flags = new Set();
            const items = [];
            for (const a of args) {
                if (/^-[a-zA-Z]+$/.test(a)) for (const ch of a.slice(1)) flags.add(ch);
                else if (a === '--') continue;
                else items.push(a);
            }
            if (name === 'declare' && flags.has('p') && !items.length) {
                for (const [k, v] of Object.entries(this.env)) io.out(`declare -x ${k}="${v}"\n`);
                return 0;
            }
            if (name === 'export' && !items.length) {
                for (const [k, v] of Object.entries(this.env)) io.out(`declare -x ${k}="${v}"\n`);
                return 0;
            }
            if (!items.length && (name === 'declare' || name === 'typeset')) return 0;
            for (const it of items) {
                const m = /^([A-Za-z_]\w*)(?:\[([^\]]*)\])?(\+?=)?([\s\S]*)$/.exec(it);
                if (!m) { io.err(`bash: ${name}: \`${it}': not a valid identifier\n`); return 1; }
                const [, nm, idx, eq, valRaw] = m;
                if (name === 'local') { if (!this.scopes.length) { io.err('bash: local: can only be used in a function\n'); return 1; } const sc = this.scopes[this.scopes.length - 1]; if (!sc.has(nm)) sc.set(nm, this.getVar(nm) !== undefined && false ? this.getVar(nm) : ''); if (!eq) { sc.delete(nm); sc.set(nm, ''); } }
                if (flags.has('A')) { this.assoc.add(nm); if (!this.arrays[nm]) this.arrays[nm] = {}; }
                else if (flags.has('a') && !this.arrays[nm]) this.arrays[nm] = [];
                if (flags.has('i')) (this.declaredInt = this.declaredInt || new Set()).add(nm);
                if (eq) {
                    let value = valRaw;
                    if (value.startsWith('(') && value.endsWith(')')) {
                        const vals = this.parseArrayLiteral(value.slice(1, -1), io);
                        if (vals.assoc || flags.has('A')) { this.assoc.add(nm); this.arrays[nm] = vals.map; } else this.arrays[nm] = vals.list;
                    } else if (idx !== undefined) {
                        const arr = this.arrays[nm] || (this.arrays[nm] = []);
                        arr[this.assoc.has(nm) ? idx : this.evalArith(idx)] = value;
                    } else {
                        if (flags.has('i')) value = String(this.evalArith(value));
                        if (name === 'local') this.scopes[this.scopes.length - 1].set(nm, value); else this.setVarGlobalOrLocal(nm, value, name);
                    }
                } else if (name === 'export' && this.lookupScope(nm)) { this.env[nm] = this.lookupScope(nm).get(nm); }
                if (name === 'readonly' || flags.has('r')) this.readonly.add(nm);
            }
            return 0;
        }

        setVarGlobalOrLocal(nm, value, builtinName) {
            if ((builtinName === 'declare' || builtinName === 'typeset') && this.scopes.length) { this.scopes[this.scopes.length - 1].set(nm, value); return; }
            this.setVar(nm, value);
        }

        setBuiltin(args, io) {
            if (!args.length) { for (const [k, v] of Object.entries(this.env)) io.out(`${k}=${v}\n`); return 0; }
            let i = 0;
            while (i < args.length) {
                const a = args[i];
                if (a === '--') { this.positional = args.slice(i + 1); return 0; }
                if (/^[-+][a-zA-Z]+$/.test(a)) {
                    const on = a[0] === '-';
                    for (const ch of a.slice(1)) {
                        if (ch === 'e') this.options.e = on; else if (ch === 'u') this.options.u = on; else if (ch === 'x') this.options.x = on;
                        else if (ch === 'o') { const o = args[++i]; if (o === 'pipefail') this.options.pipefail = on; else if (o === 'errexit') this.options.e = on; else if (o === 'nounset') this.options.u = on; else if (o === 'xtrace') this.options.x = on; }
                    }
                    i++;
                    continue;
                }
                if (/^[-+]o$/.test(a)) { const on = a[0] === '-'; const o = args[++i]; if (o === 'pipefail') this.options.pipefail = on; if (o === 'errexit') this.options.e = on; if (o === 'nounset') this.options.u = on; if (o === 'xtrace') this.options.x = on; i++; continue; }
                this.positional = args.slice(i);
                return 0;
            }
            return 0;
        }

        readBuiltin(args, io) {
            let prompt = null, raw = false, silent = false, delim = '\n', n = null, arrName = null, timeout = null;
            const names = [];
            for (let i = 0; i < args.length; i++) {
                const a = args[i];
                if (a === '-p') prompt = args[++i];
                else if (a === '-r') raw = true;
                else if (a === '-s') silent = true;
                else if (a === '-n') n = parseInt(args[++i], 10);
                else if (a === '-N') n = parseInt(args[++i], 10);
                else if (a === '-d') delim = args[++i];
                else if (a === '-t') timeout = args[++i];
                else if (a === '-a') arrName = args[++i];
                else if (/^-[rsp]+$/.test(a)) { for (const ch of a.slice(1)) { if (ch === 'r') raw = true; else if (ch === 's') silent = true; } }
                else names.push(a);
            }
            const src = io.stdin;
            let line;
            let fromTerminal = false;
            if (src.pos >= src.text.length) {
                if (this.interactive && !io.hasStdin) {
                    const ans = this.takeInput({ mode: 'line', prompt: prompt || '', secret: silent });
                    line = ans;
                    fromTerminal = true;
                } else {
                    for (const nm of names) this.setVar(nm, '');
                    if (!names.length) this.setVar('REPLY', '');
                    return 1;
                }
            }
            if (fromTerminal) { /* line already read */ }
            else if (n !== null) { line = src.text.slice(src.pos, src.pos + n); src.pos += n; }
            else {
                const e = src.text.indexOf(delim, src.pos);
                if (e === -1) { line = src.text.slice(src.pos); src.pos = src.text.length; } else { line = src.text.slice(src.pos, e); src.pos = e + delim.length; }
            }
            if (!raw) line = line.replace(/\\\n/g, '').replace(/\\(.)/g, '$1');
            if (arrName) { this.arrays[arrName] = line.split(/\s+/).filter(Boolean); return 0; }
            if (!names.length) { this.setVar('REPLY', line); return 0; }
            const ifs = this.getVar('IFS') !== undefined ? this.getVar('IFS') : ' \t\n';
            let rest = ifs ? line.replace(new RegExp('^[' + ifs.replace(/[\]\\^-]/g, '\\$&') + ']+'), '') : line;
            names.forEach((nm, idx) => {
                if (idx === names.length - 1) { this.setVar(nm, rest.replace(ifs ? new RegExp('[' + ifs.replace(/[\]\\^-]/g, '\\$&') + ']+$') : /$^/, '')); return; }
                const m = ifs ? new RegExp('[' + ifs.replace(/[\]\\^-]/g, '\\$&') + ']+').exec(rest) : null;
                if (!m) { this.setVar(nm, rest); rest = ''; return; }
                this.setVar(nm, rest.slice(0, m.index));
                rest = rest.slice(m.index + m[0].length);
            });
            return 0;
        }

        stdinIsPipe(io) { return true; }

        sourceBuiltin(args, io) {
            if (!args.length) { io.err('bash: source: filename argument required\nsource: usage: source filename [arguments]\n'); return 2; }
            let path = args[0];
            let node = this.fs.getNode(path);
            if (!node && !path.includes('/')) {
                for (const d of (this.env.PATH || '').split(':')) { const p = d + '/' + path; const n = this.fs.getNode(p); if (n) { node = n; path = p; break; } }
            }
            if (!node) { io.err(`bash: ${args[0]}: No such file or directory\n`); return 1; }
            if (node.type !== 'file') { io.err(`bash: ${args[0]}: Is a directory\n`); return 1; }
            if (!this.fs.hasPermission(node, 'r')) { io.err(`bash: ${args[0]}: Permission denied\n`); return 1; }
            const savedPos = this.positional;
            const savedName = this.scriptName;
            const savedScript = this.inScript;
            if (args.length > 1) this.positional = args.slice(1);
            this.scriptName = args[0];
            this.inScript = true;
            const prevSourcing = this.sourcing;
            this.sourcing = true;
            try {
                const ast = new Parser(new Lexer(node.content || '').tokenize()).parseProgram();
                return this.execList(ast, io);
            } catch (e) {
                if (e instanceof ReturnSignal) return e.code;
                if (e instanceof IncompleteError) { io.err(`${args[0]}: line ${(node.content || '').split('\n').length}: syntax error: unexpected end of file\n`); return 2; }
                if (e instanceof ShellSyntaxError) { io.err(`${args[0]}: line ${this.curLine}: ${e.message}\n`); return 2; }
                throw e;
            } finally {
                this.sourcing = prevSourcing;
                this.positional = savedPos;
                this.scriptName = savedName;
                this.inScript = savedScript;
            }
        }

        resolveKind(name) {
            if (['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done', 'case', 'esac', 'function', 'select', '[[', ']]', '{', '}', '!', 'in', 'time'].includes(name)) return { kind: 'keyword' };
            if (Object.prototype.hasOwnProperty.call(this.funcs, name)) return { kind: 'function' };
            const builtins = [':', '.', 'source', 'alias', 'bg', 'break', 'builtin', 'cd', 'command', 'continue', 'declare', 'echo', 'eval', 'exec', 'exit', 'export', 'false', 'fg', 'getopts', 'hash', 'help', 'history', 'jobs', 'kill', 'let', 'local', 'popd', 'printf', 'pushd', 'pwd', 'read', 'readonly', 'return', 'set', 'shift', 'shopt', 'test', 'times', 'trap', 'true', 'type', 'typeset', 'ulimit', 'umask', 'unalias', 'unset', 'wait', '['];
            if (builtins.includes(name)) return { kind: 'builtin' };
            for (const d of (this.env.PATH || '').split(':')) {
                const n = this.fs.getNode(d + '/' + name);
                if (n && n.type === 'file') return { kind: 'file', path: d + '/' + name };
            }
            if (this.t.commandMethod(name)) return { kind: 'file', path: '/usr/bin/' + name };
            return null;
        }

        describe(name, r) {
            if (r.kind === 'keyword') return `${name} is a shell keyword`;
            if (r.kind === 'builtin') return `${name} is a shell builtin`;
            if (r.kind === 'function') return `${name} is a function`;
            return `${name} is ${r.path}`;
        }

        typeBuiltin(args, io) {
            let st = 0;
            const names = args.filter(a => !a.startsWith('-'));
            const short = args.includes('-t');
            const pathOnly = args.includes('-p');
            for (const n of names) {
                const r = this.resolveKind(n);
                if (!r) { if (!short) io.err(`bash: type: ${n}: not found\n`); st = 1; continue; }
                if (short) io.out((r.kind === 'file' ? 'file' : r.kind) + '\n');
                else if (pathOnly) { if (r.kind === 'file') io.out(r.path + '\n'); }
                else io.out(this.describe(n, r) + '\n');
            }
            return st;
        }

        getoptsBuiltin(args, io) {
            const spec = args[0];
            const varName = args[1];
            const list = args.length > 2 ? args.slice(2) : this.positional;
            let idx = parseInt(this.getVar('OPTIND') || '1', 10);
            const silent = spec.startsWith(':');
            if (idx > list.length) { return 1; }
            let cur = list[idx - 1];
            if (!cur || cur === '--' || cur[0] !== '-' || cur === '-') { return 1; }
            const sub = parseInt(this.env.__optpos || '1', 10);
            const opt = cur[sub];
            const def = spec.replace(/^:/, '');
            const k = def.indexOf(opt);
            const advance = () => { if (sub + 1 < cur.length) this.env.__optpos = String(sub + 1); else { delete this.env.__optpos; this.setVar('OPTIND', String(idx + 1)); } };
            if (k < 0) { this.setVar(varName, '?'); if (silent) this.setVar('OPTARG', opt); else io.err(`${this.scriptName}: illegal option -- ${opt}\n`); advance(); return 0; }
            if (def[k + 1] === ':') {
                let val;
                if (sub + 1 < cur.length) val = cur.slice(sub + 1);
                else { val = list[idx]; idx++; }
                delete this.env.__optpos;
                if (val === undefined) { this.setVar(varName, silent ? ':' : '?'); if (silent) this.setVar('OPTARG', opt); else io.err(`${this.scriptName}: option requires an argument -- ${opt}\n`); this.setVar('OPTIND', String(idx + 1)); return 0; }
                this.setVar('OPTARG', val);
                this.setVar(varName, opt);
                this.setVar('OPTIND', String(idx + 1));
                return 0;
            }
            this.setVar(varName, opt);
            advance();
            return 0;
        }
    }

    root.ShellInterpreter = ShellInterpreter;
    root.ShellLexer = Lexer;
    root.ShellParser = Parser;
    root.ShellIncompleteError = IncompleteError;
    root.ShellSyntaxError = ShellSyntaxError;
})(typeof window !== 'undefined' ? window : globalThis);
