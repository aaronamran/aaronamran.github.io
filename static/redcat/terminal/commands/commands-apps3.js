// python3 / perl one-liners, httpd and nginx configuration checks, the mariadb client, make/gcc, tmux and screen
// Part of Red Cat RHCSA Terminal Simulator

class AppEngine3 {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.apps3 = this;
        this.dbs = ['information_schema', 'mysql', 'performance_schema', 'sys'];
        this.dbUsers = [{ user: 'mariadb.sys', host: 'localhost' }, { user: 'root', host: 'localhost' }, { user: 'mysql', host: 'localhost' }];
        this.tmuxSessions = [];          // { name, created }
        this.screens = [];       // { name, pid, created }
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
    _readFile(f) { const n = this.fs.getNode(this.fs.resolvePath(f)); return n && n.type === 'file' ? n.content || '' : null; }
    _write(path, content, mode) {
        const abs = this.fs.resolvePath(path);
        const parts = abs.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: this.fs.currentUser, group: this.fs.currentUser, size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        const old = cur.children[name];
        cur.children[name] = { type: 'file', permissions: mode || (old ? old.permissions : '0644'), owner: old ? old.owner : this.fs.currentUser, group: old ? old.group : this.fs.currentUser, size: content.length, modified: new Date(), content };
    }
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
    _svcActive(name) { const s = this.shared.services[name]; return !!(s && s.active); }

    // =========================================================== python3
    python3(args, stdin) {
        let i = 0;
        const flags = [];
        while (i < args.length && args[i].startsWith('-') && !['-c', '-m'].includes(args[i])) flags.push(args[i++]);
        if (flags.includes('--version') || flags.includes('-V')) return this._ok('Python 3.9.18');
        if (args[i] === '-c') {
            const code = args[i + 1];
            if (code === undefined) return this._err('Argument expected for the -c option\nusage: python3 [option] ... [-c cmd | -m mod | file | -] [arg] ...\nTry `python3 -h\' for more information.', 2);
            return this._pyRun(code, '<string>');
        }
        if (args[i] === '-m') {
            const mod = args[i + 1];
            if (mod === 'http.server' || mod === 'SimpleHTTPServer') {
                const port = parseInt(args[i + 2] && /^\d+$/.test(args[i + 2]) ? args[i + 2] : '8000', 10);
                const apps = this.shared.apps;
                const f = apps ? apps._bindFail(port, 'tcp', 'python3') : null;
                if (f) return this._err(f, 1);
                this._emit(`Serving HTTP on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/) ...\n`);
                const sh = this._sh();
                if (sh) sh.takeInput({ mode: 'fgjob', prompt: '', ms: 0, onCancel: () => '\nKeyboard interrupt received, exiting.' });
                return this._ok('');
            }
            if (mod === 'json.tool') { try { const v = JSON.parse(stdin || (args[i + 2] ? this._readFile(args[i + 2]) : '') || ''); return this._ok(JSON.stringify(v, null, 4)); } catch (e) { return this._err(`Expecting value: line 1 column 1 (char 0)`, 1); } }
            if (mod === 'venv') {
                const dir = args[i + 2];
                if (!dir) return this._err('usage: venv [-h] [--system-site-packages] [--symlinks | --copies] [--clear] [--upgrade] [--without-pip] [--prompt PROMPT] [--upgrade-deps] ENV_DIR [ENV_DIR ...]\nvenv: error: the following arguments are required: ENV_DIR', 2);
                const d = this.fs.resolvePath(dir);
                this._write(d + '/pyvenv.cfg', 'home = /usr/bin\ninclude-system-site-packages = false\nversion = 3.9.18\n');
                this._write(d + '/bin/activate', `# This file must be used with "source bin/activate" *from bash*\nVIRTUAL_ENV="${d}"\nexport VIRTUAL_ENV\nPATH="$VIRTUAL_ENV/bin:$PATH"\nexport PATH\nPS1="(${d.split('/').pop()}) \${PS1:-}"\nexport PS1\n`);
                this._write(d + '/bin/python3', '#!/bin/sh\nexec /usr/bin/python3 "$@"\n', '0755');
                this._write(d + '/lib/python3.9/site-packages/.keep', '');
                return this._ok('');
            }
            if (mod === 'pip' || mod === 'ensurepip') return this._err(`/usr/bin/python3: No module named ${mod}`, 1);
            if (mod === 'timeit' || mod === 'this') return this._ok('');
            return this._err(`/usr/bin/python3: No module named ${mod}`, 1);
        }
        const file = args[i];
        if (!file || file === '-') {
            if (stdin) return this._pyRun(stdin, '<stdin>');
            return this._ok('Python 3.9.18 (main, Jan  4 2024, 00:00:00) \n[GCC 11.4.1 20231218 (Red Hat 11.4.1-3)] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> ');
        }
        const text = this._readFile(file);
        if (text === null) return this._err(`python3: can't open file '${this.fs.resolvePath(file)}': [Errno 2] No such file or directory`, 2);
        return this._pyRun(text, file);
    }

    _pyRun(code, fname) {
        const out = [];
        const env = { out, fname };
        let rc = 0, err = '';
        try { PyMini.run(code, env, this); } catch (e) {
            if (e instanceof PyMini.Exit) rc = e.code;
            else if (e instanceof PyMini.PyError) { err = e.format(fname); rc = 1; }
            else { err = `Traceback (most recent call last):\n  File "${fname}", line 1, in <module>\n${e.message}`; rc = 1; }
        }
        return { stdout: out.join(''), rawStdout: out.join(''), stderr: err, exitCode: rc };
    }

    // =========================================================== perl
    perl(args, stdin) {
        if (args.includes('-v') || args.includes('--version')) return this._ok("\nThis is perl 5, version 32, subversion 1 (v5.32.1) built for x86_64-linux-thread-multi\n\nCopyright 1987-2021, Larry Wall\n\nPerl may be copied only under the terms of either the Artistic License or the\nGNU General Public License, which may be found in the Perl 5 source kit.\n\nComplete documentation for Perl, including FAQ lists, should be found on\nthis system using \"man perl\" or \"perldoc perl\".  If you have access to the\nInternet, point your browser at https://www.perl.org/, the Perl Home Page.\n");
        let flags = '', code = null, files = [], inPlace = false;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-e' || a === '-E') { code = args[++i]; continue; }
            if (/^-[a-zA-Z]+$/.test(a) && code === null) { flags += a.slice(1); if (a.includes('i')) inPlace = true; if (/e$/.test(a)) code = args[++i]; continue; }
            files.push(a);
        }
        if (code === null) {
            if (files.length) { const t = this._readFile(files[0]); if (t === null) return this._err(`Can't open perl script "${files[0]}": No such file or directory`, 2); code = t; files = files.slice(1); }
            else return this._err('perl: reading program from stdin is not supported', 2);
        }
        const lines = [];
        if (/[np]/.test(flags)) {
            const inputs = files.length ? files.map(f => ({ f, t: this._readFile(f) })) : [{ f: '-', t: stdin || '' }];
            for (const inp of inputs) { if (inp.t === null) return this._err(`Can't open ${inp.f}: No such file or directory.`, 2); }
            const out = [];
            let n = 0;
            for (const inp of inputs) {
                const res = [];
                for (const line of (inp.t.endsWith('\n') ? inp.t.slice(0, -1) : inp.t).split('\n')) {
                    n++;
                    let $_ = line + (flags.includes('l') ? '' : '\n');
                    if (flags.includes('l')) $_ = line;
                    const r = this._perlLine(code, $_, n, flags);
                    if (r.printed !== null) res.push(...r.printed);
                    if (/p/.test(flags) && !r.suppress) res.push(r.value + (flags.includes('l') ? '\n' : ''));
                }
                if (inPlace && inp.f !== '-') this._write(inp.f, res.join(''));
                else out.push(...res);
            }
            return this._ok(out.join('').replace(/\n$/, ''));
        }
        return this._perlProgram(code, flags);
    }

    _perlStr(s, ctx) {
        return s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\"/g, '"').replace(/\$_/g, () => ctx.$_ === undefined ? '' : ctx.$_).replace(/\$(\d)/g, (m, d) => (ctx.m && ctx.m[d] !== undefined ? ctx.m[d] : '')).replace(/\$\./g, () => String(ctx.n || '')).replace(/\$F\[(-?\d+)\]/g, (m, k) => { const f = ctx.F || []; return f[k < 0 ? f.length + parseInt(k, 10) : k] || ''; });
    }

    _perlLine(code, line, n, flags) {
        const ctx = { $_: line, n, F: /a/.test(flags) ? line.replace(/\n$/, '').split(/\s+/).filter(Boolean) : [], m: [] };
        const printed = [];
        let suppress = false;
        for (const raw of code.split(/;\s*/).filter(Boolean)) {
            let st = raw.trim(), cond = null, neg = false;
            const mod = /^(.*?)\s+(if|unless)\s+(.+)$/.exec(st);
            if (mod) { st = mod[1]; cond = mod[3]; neg = mod[2] === 'unless'; }
            else if (/^\/.+\/[i]?$/.test(st)) { cond = st; st = ''; }
            if (cond !== null) { const ok = this._perlCond(cond, ctx); if (neg ? ok : !ok) { if (/^(print|say)\b/.test(st)) suppress = true; continue; } }
            let m;
            if ((m = /^s\/((?:[^\/\\]|\\.)*)\/((?:[^\/\\]|\\.)*)\/([gi]*)$/.exec(st))) {
                const re = new RegExp(m[1], m[3]);
                ctx.$_ = ctx.$_.replace(re, (...a) => m[2].replace(/\$(\d)/g, (_, d) => a[parseInt(d, 10)] || ''));
                continue;
            }
            if ((m = /^(?:print|say)(?:\s+(.*))?$/.exec(st))) {
                printed.push(m[1] === undefined || m[1] === '' ? ctx.$_ : this._perlEval(m[1], ctx));
                suppress = true;
            }
        }
        return { printed: printed.length ? printed.map(p => (flags.includes('l') && !p.endsWith('\n') ? p + '\n' : p)) : null, suppress, value: ctx.$_ };
    }

    _perlCond(c, ctx) {
        let m;
        if ((m = /^\/(.+)\/(i?)$/.exec(c.trim()))) { const r = new RegExp(m[1], m[2]).exec(ctx.$_); ctx.m = r ? r : []; return !!r; }
        if ((m = /^\$_\s*=~\s*\/(.+)\/(i?)$/.exec(c.trim()))) { const r = new RegExp(m[1], m[2]).exec(ctx.$_); ctx.m = r ? r : []; return !!r; }
        if ((m = /^\$\.\s*(==|<|>|<=|>=|!=)\s*(\d+)$/.exec(c.trim()))) { const n = ctx.n, v = parseInt(m[2], 10); return m[1] === '==' ? n === v : m[1] === '<' ? n < v : m[1] === '>' ? n > v : m[1] === '<=' ? n <= v : m[1] === '>=' ? n >= v : n !== v; }
        return true;
    }

    _perlEval(expr, ctx) {
        const parts = expr.split(/\s*,\s*/);
        return parts.map(p => {
            const sm = /^"((?:[^"\\]|\\.)*)"$/.exec(p.trim()) || /^'((?:[^'\\]|\\.)*)'$/.exec(p.trim());
            if (sm) return this._perlStr(sm[1], ctx);
            if (/^\$_$/.test(p.trim())) return ctx.$_;
            if (/^\$F\[-?\d+\]$/.test(p.trim())) return this._perlStr(p.trim(), ctx);
            if (/^\$\.$/.test(p.trim())) return String(ctx.n);
            if (/^\d+(\.\d+)?$/.test(p.trim())) return p.trim();
            return '';
        }).join('');
    }

    _perlProgram(code, flags) {
        const out = [];
        const ctx = { $_: '', n: 0 };
        const stmts = code.split(/;\s*/).map(s => s.trim()).filter(Boolean);
        for (const s of stmts) {
            let m;
            if ((m = /^(print|say)\s+(.*)$/.exec(s))) { out.push(this._perlEval(m[2], ctx) + (m[1] === 'say' ? '\n' : '')); continue; }
            if (/^(use|no)\s/.test(s)) continue;
            if ((m = /^printf\s+"((?:[^"\\]|\\.)*)"\s*,\s*(.+)$/.exec(s))) { let k = 0; const vals = m[2].split(/\s*,\s*/); out.push(m[1].replace(/\\n/g, '\n').replace(/%(\d*)(s|d|f)/g, (_, w, t) => String(vals[k++]).replace(/^"|"$/g, ''))); continue; }
            return this._err(`perl: only simple print/say statements are simulated in Red Cat (${s.slice(0, 40)})`, 255);
        }
        return { stdout: out.join(''), rawStdout: out.join(''), stderr: '', exitCode: 0 };
    }

    // =========================================================== httpd / apachectl
    _httpdFiles(main) {
        const files = [];
        const seen = new Set();
        const errors = [];
        const root = '/etc/httpd';
        const expand = (pat) => {
            const abs = pat.startsWith('/') ? pat : root + '/' + pat;
            const dir = abs.replace(/\/[^/]*$/, '');
            const base = abs.split('/').pop();
            const dn = this.fs.getNode(dir);
            if (!/[*?]/.test(base)) return this.fs.getNode(abs) ? [abs] : [];
            if (!dn || !dn.children) return [];
            const re = new RegExp('^' + base.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            return Object.keys(dn.children).filter(k => re.test(k) && dn.children[k].type === 'file').sort().map(k => dir + '/' + k);
        };
        const load = (path) => {
            if (seen.has(path)) return;
            seen.add(path);
            const text = this._readFile(path);
            if (text === null) return;
            const lines = text.split('\n');
            files.push({ path, lines });
            lines.forEach((l, i) => {
                const m = /^\s*(Include|IncludeOptional)\s+(\S+)/i.exec(l);
                if (!m) return;
                const hit = expand(m[2].replace(/^"|"$/g, ''));
                if (!hit.length && m[1].toLowerCase() === 'include') errors.push({ path, line: i + 1, msg: `No matches for the wildcard '${m[2]}' in '${root}', failing (use IncludeOptional if required)` });
                hit.forEach(load);
            });
        };
        load(main || root + '/conf/httpd.conf');
        return { files, errors };
    }

    _httpdCheck() {
        const { files, errors } = this._httpdFiles();
        if (!files.length) return { err: { path: '/etc/httpd/conf/httpd.conf', line: 0, msg: "Could not open configuration file /etc/httpd/conf/httpd.conf: No such file or directory" } };
        if (errors.length) return { err: errors[0] };
        const known = new Set('ServerRoot Listen Include IncludeOptional User Group ServerAdmin ServerName DocumentRoot DirectoryIndex ErrorLog LogLevel LogFormat CustomLog TransferLog ScriptAlias Alias AliasMatch Redirect RedirectMatch AddType AddHandler AddDefaultCharset AddIcon AddIconByType AddIconByEncoding AddEncoding AddLanguage AddOutputFilter DefaultIcon DefaultType EnableSendfile EnableMMAP TypesConfig MIMEMagicFile Options AllowOverride Require Order Allow Deny SetEnv SetEnvIf PassEnv UnsetEnv ServerSignature ServerTokens TraceEnable KeepAlive KeepAliveTimeout MaxKeepAliveRequests Timeout StartServers MinSpareThreads MaxSpareThreads ThreadsPerChild MaxRequestWorkers MaxConnectionsPerChild ServerLimit ThreadLimit PidFile LoadModule LoadFile SSLEngine SSLCertificateFile SSLCertificateKeyFile SSLCertificateChainFile SSLProtocol SSLCipherSuite SSLCACertificateFile SSLVerifyClient SSLOptions SSLRandomSeed SSLSessionCache SSLSessionCacheTimeout SSLPassPhraseDialog SSLCryptoDevice ProxyPass ProxyPassReverse ProxyRequests ProxyPreserveHost RewriteEngine RewriteRule RewriteCond RewriteBase RewriteLog Header RequestHeader ExpiresActive ExpiresByType ExpiresDefault AuthType AuthName AuthUserFile AuthGroupFile AuthBasicProvider AuthzUserFile ErrorDocument FileETag HostnameLookups IndexOptions IndexIgnore IndexOrderDefault ReadmeName HeaderName LanguagePriority ForceLanguagePriority BrowserMatch UseCanonicalName AcceptFilter AcceptPathInfo AddCharset CacheRoot CacheEnable CacheDisable ContentDigest CookieName CGIMapExtension SuexecUserGroup ScriptSock DeflateCompressionLevel SetOutputFilter SetInputFilter LimitRequestBody LimitRequestFields LimitRequestFieldSize LimitRequestLine LimitXMLRequestBody MaxRangeOverlaps MaxRangeReversals MaxRanges NameVirtualHost Satisfy WSGIScriptAlias WSGIDaemonProcess WSGIProcessGroup php_value php_flag php_admin_value php_admin_flag Define UnDefine Mutex ProtocolsHonorOrder Protocols RewriteMap Group SSLUseStapling SSLStaplingCache SSLHonorCipherOrder SSLCompression SSLSessionTickets SSLProxyEngine ServerAlias DocumentRootMatch ErrorLogFormat LogIOTrackTTFB CoreDumpDirectory ScoreBoardFile Script ScriptLog DirectorySlash DirectoryCheckHandler FallbackResource ForceType Action'.split(' ').map(x => x.toLowerCase()));
        const sectionOpen = /^\s*<(Directory|DirectoryMatch|Files|FilesMatch|Location|LocationMatch|VirtualHost|IfModule|IfDefine|IfVersion|Limit|LimitExcept|Proxy|ProxyMatch|If|ElseIf|Else|Macro|RequireAny|RequireAll|RequireNone)(\s[^>]*)?>/i;
        const sectionClose = /^\s*<\/(\w+)\s*>/;
        for (const f of files) {
            const stack = [];
            for (let i = 0; i < f.lines.length; i++) {
                const raw = f.lines[i];
                const l = raw.trim();
                if (!l || l[0] === '#') continue;
                let m;
                if ((m = sectionOpen.exec(l))) { stack.push({ name: m[1], line: i + 1 }); continue; }
                if (/^\s*<[A-Za-z]+/.test(l) && !/>/.test(l)) return { err: { path: f.path, line: i + 1, msg: `${l.match(/<\w+/)[0]}> directive missing closing '>'` } };
                if ((m = sectionClose.exec(l))) {
                    const top = stack.pop();
                    if (!top) return { err: { path: f.path, line: i + 1, msg: `</${m[1]}> without matching <${m[1]}> section` } };
                    if (top.name.toLowerCase() !== m[1].toLowerCase()) return { err: { path: f.path, line: i + 1, msg: `Expected </${top.name}> but saw </${m[1]}>` } };
                    continue;
                }
                const dir = l.split(/\s+/)[0];
                if (!known.has(dir.toLowerCase())) return { err: { path: f.path, line: i + 1, msg: `Invalid command '${dir}', perhaps misspelled or defined by a module not included in the server configuration` } };
                const arg = l.slice(dir.length).trim().replace(/^"|"$/g, '');
                const dl = dir.toLowerCase();
                if (dl === 'documentroot' && !this.fs.getNode(arg)) return { err: { path: f.path, line: i + 1, msg: `DocumentRoot '${arg}' is not a directory, or is not readable` } };
                if (dl === 'listen' && !/^(\[.*\]:|[\d.]+:)?\d+$/.test(arg.split(/\s+/)[0])) return { err: { path: f.path, line: i + 1, msg: `Invalid address or port: ${arg}` } };
                if (dl === 'sslcertificatefile' || dl === 'sslcertificatekeyfile') { const n = this.fs.getNode(arg); if (!n || !(n.content || '').length) return { err: { path: f.path, line: i + 1, msg: `${dir}: file '${arg}' does not exist or is empty` } }; }
                if (dl === 'user' && !this.fs.users[arg]) return { err: { path: f.path, line: i + 1, msg: `Syntax error on line ${i + 1} of ${f.path}:\nbad user name ${arg}`.replace(/^Syntax error[^\n]*\n/, '') } };
                if (dl === 'group' && !this.fs.groups[arg]) return { err: { path: f.path, line: i + 1, msg: `bad group name ${arg}` } };
            }
            if (stack.length) return { err: { path: f.path, line: stack[stack.length - 1].line, msg: `<${stack[stack.length - 1].name}> was not closed.` } };
        }
        // sslengine on without a certificate is fine; listen duplicates are only seen when starting
        const listens = [];
        for (const f of files) for (const l of f.lines) { const m = /^\s*Listen\s+(\S+)/i.exec(l); if (m) listens.push(m[1]); }
        return { ok: true, files, listens };
    }

    _httpdErr(e) { return `AH00526: Syntax error on line ${e.line} of ${e.path}:\n${e.msg}`; }

    httpd(args) {
        const { o, rest } = this._flags2(args);
        if (o.v) return this._ok('Server version: Apache/2.4.57 (Red Hat Enterprise Linux)\nServer built:   Feb 13 2024 00:00:00');
        if (o.V) return this._ok('Server version: Apache/2.4.57 (Red Hat Enterprise Linux)\nServer built:   Feb 13 2024 00:00:00\nServer\'s Module Magic Number: 20120211:127\nServer loaded:  APR 1.7.0, APR-UTIL 1.6.1, APR-ICONV 1.2.2\nCompiled using: APR 1.7.0, APR-UTIL 1.6.1, APR-ICONV 1.2.2\nArchitecture:   64-bit\nServer MPM:     event\n  threaded:     yes (fixed thread count)\n    forked:     yes (variable process count)\nServer compiled with....\n -D APR_HAS_SENDFILE\n -D APR_HAS_MMAP\n -D APR_HAVE_IPV6 (IPv4-mapped addresses enabled)\n -D APR_USE_PROC_PTHREAD_SERIALIZE\n -D SINGLE_LISTEN_UNSERIALIZED_ACCEPT\n -D APR_HAS_OTHER_CHILD\n -D AP_HAVE_RELIABLE_PIPED_LOGS\n -D DYNAMIC_MODULE_LIMIT=256\n -D HTTPD_ROOT="/etc/httpd"\n -D SUEXEC_BIN="/usr/sbin/suexec"\n -D DEFAULT_PIDLOG="/run/httpd/httpd.pid"\n -D DEFAULT_SCOREBOARD="logs/apache_runtime_status"\n -D DEFAULT_ERRORLOG="logs/error_log"\n -D AP_TYPES_CONFIG_FILE="conf/mime.types"\n -D SERVER_CONFIG_FILE="conf/httpd.conf"');
        if (o.l) return this._ok('Compiled in modules:\n  core.c\n  mod_so.c\n  http_core.c');
        if (o.M || o.t || o.S || o.D) {
            const c = this._httpdCheck();
            if (c.err) return { stdout: '', stderr: this._httpdErr(c.err), exitCode: 1 };
            if (o.M) return this._ok(' core_module (static)\n so_module (static)\n http_module (static)\n access_compat_module (shared)\n alias_module (shared)\n auth_basic_module (shared)\n authz_core_module (shared)\n authz_host_module (shared)\n autoindex_module (shared)\n deflate_module (shared)\n dir_module (shared)\n env_module (shared)\n filter_module (shared)\n headers_module (shared)\n log_config_module (shared)\n mime_module (shared)\n mpm_event_module (shared)\n rewrite_module (shared)\n setenvif_module (shared)\n ssl_module (shared)\n systemd_module (shared)\n unixd_module (shared)');
            if (o.S) {
                const lines = ['VirtualHost configuration:', 'ServerRoot: "/etc/httpd"', 'Main DocumentRoot: "/var/www/html"', 'Main ErrorLog: "/etc/httpd/logs/error_log"', 'Mutex default: dir="/run/httpd/" mechanism=default', 'Mutex mpm-accept: using_defaults', 'Mutex watchdog-callback: using_defaults', 'PidFile: "/run/httpd/httpd.pid"', 'Define: _RH_HAS_HTTPPROTOCOLOPTIONS', 'Define: DUMP_VHOSTS', 'Define: DUMP_RUN_CFG', 'User: name="apache" id=48', 'Group: name="apache" id=48'];
                return this._ok(lines.join('\n'));
            }
            if (o.t) return { stdout: 'Syntax OK', stderr: this._servername() ? '' : `AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using ${this._myIp()}. Set the 'ServerName' directive globally to suppress this message`, exitCode: 0 };
        }
        if (!this._isRoot()) return this._err('(13)Permission denied: AH00072: make_sock: could not bind to address [::]:80\n(13)Permission denied: AH00072: make_sock: could not bind to address 0.0.0.0:80\nno listening sockets available, shutting down\nAH00015: Unable to open logs', 1);
        const sc = this.parent.systemctl;
        if (o.k) { const act = rest[0] || args[args.indexOf('-k') + 1]; if (['start', 'stop', 'restart', 'graceful'].includes(act)) return sc.call(this.parent, [act === 'graceful' ? 'reload' : act, 'httpd']); }
        return this._ok('');
    }
    _flags2(args) { const o = {}, rest = []; for (let i = 0; i < args.length; i++) { const a = args[i]; if (/^-[A-Za-z]$/.test(a)) o[a[1]] = true; else rest.push(a); } return { o, rest }; }
    _myIp() { const nm = this.shared.net; return (nm && nm._myAddrs ? nm._myAddrs().find(a => /^\d+\.\d+\.\d+\.\d+$/.test(a) && !a.startsWith('127.')) : null) || '192.168.1.100'; }
    _servername() { const { files } = this._httpdFiles(); return files.some(f => f.lines.some(l => /^\s*ServerName\s/i.test(l))); }

    apachectl(args) {
        const a = args[0];
        if (!a) return this._err('Usage: apachectl [-hvVtSMDXLKTZ] [-k start|stop|restart|graceful|graceful-stop]', 1);
        if (a === 'configtest' || a === '-t') return this.httpd(['-t']);
        if (['start', 'stop', 'restart', 'graceful', 'graceful-stop', 'status', 'fullstatus'].includes(a)) {
            if (a === 'status' || a === 'fullstatus') return this.parent.systemctl.call(this.parent, ['status', 'httpd']);
            return this.parent.systemctl.call(this.parent, [a === 'graceful' ? 'reload' : a === 'graceful-stop' ? 'stop' : a, 'httpd']);
        }
        return this.httpd(args);
    }

    // =========================================================== nginx
    nginx(args) {
        const { o } = this._flags2(args);
        const main = '/etc/nginx/nginx.conf';
        if (args.includes('-v')) return { stdout: 'nginx version: nginx/1.20.1', stderr: '', exitCode: 0 };
        if (args.includes('-V')) return { stdout: 'nginx version: nginx/1.20.1\nbuilt by gcc 11.4.1 20231218 (Red Hat 11.4.1-3) (GCC) \nbuilt with OpenSSL 3.0.7 1 Nov 2022\nTLS SNI support enabled\nconfigure arguments: --prefix=/usr/share/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib64/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --http-client-body-temp-path=/var/lib/nginx/tmp/client_body --pid-path=/run/nginx.pid --lock-path=/run/lock/subsys/nginx --user=nginx --group=nginx --with-http_ssl_module --with-http_v2_module', stderr: '', exitCode: 0 };
        if (args.includes('-t') || args.includes('-T')) {
            const r = this._nginxCheck(main);
            if (r.err) return { stdout: '', stderr: `nginx: [emerg] ${r.err.msg} in ${r.err.path}:${r.err.line}\nnginx: configuration file ${main} test failed`, exitCode: 1 };
            const head = `nginx: the configuration file ${main} syntax is ok\nnginx: configuration file ${main} test is successful`;
            if (args.includes('-T')) return this._ok(head + '\n# configuration file ' + main + ':\n' + r.files.map(f => (f.path === main ? '' : `# configuration file ${f.path}:\n`) + f.text).join(''));
            return this._ok(head);
        }
        const si = args.indexOf('-s');
        if (si >= 0) {
            const sig = args[si + 1];
            if (!['stop', 'quit', 'reopen', 'reload'].includes(sig)) return { stdout: '', stderr: `nginx: invalid option: "-s ${sig || ''}"`, exitCode: 1 };
            if (!this._svcActive('nginx')) return { stdout: '', stderr: `nginx: [error] open() "/run/nginx.pid" failed (2: No such file or directory)`, exitCode: 1 };
            if (!this._isRoot()) return { stdout: '', stderr: `nginx: [alert] kill(${(this.shared.services.nginx.mainPid || 1)}, 1) failed (1: Operation not permitted)`, exitCode: 1 };
            if (sig === 'reload') { const r = this._nginxCheck(main); if (r.err) return { stdout: '', stderr: `nginx: [emerg] ${r.err.msg} in ${r.err.path}:${r.err.line}`, exitCode: 1 }; return this._ok(''); }
            if (sig === 'stop' || sig === 'quit') return this.parent.systemctl.call(this.parent, ['stop', 'nginx']);
            return this._ok('');
        }
        if (o.h || args.includes('-?')) return this._ok('nginx version: nginx/1.20.1\nUsage: nginx [-?hvVtTq] [-s signal] [-p prefix]\n             [-e filename] [-c filename] [-g directives]\n\nOptions:\n  -?,-h         : this help\n  -v            : show version and exit\n  -V            : show version and configure options then exit\n  -t            : test configuration and exit\n  -T            : test configuration, dump it and exit\n  -q            : suppress non-error messages during configuration testing\n  -s signal     : send signal to a master process: stop, quit, reopen, reload');
        if (!this._isRoot()) return { stdout: '', stderr: 'nginx: [warn] the "user" directive makes sense only if the master process runs with super-user privileges, ignored in /etc/nginx/nginx.conf:5\nnginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)', exitCode: 1 };
        const r = this._nginxCheck(main);
        if (r.err) return { stdout: '', stderr: `nginx: [emerg] ${r.err.msg} in ${r.err.path}:${r.err.line}`, exitCode: 1 };
        if (this._svcActive('nginx')) return { stdout: '', stderr: 'nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)\nnginx: [emerg] still could not bind()', exitCode: 1 };
        return this.parent.systemctl.call(this.parent, ['start', 'nginx']);
    }

    _nginxCheck(main) {
        const files = [];
        const seen = new Set();
        const known = new Set('user worker_processes error_log pid include events worker_connections http log_format access_log sendfile tcp_nopush tcp_nodelay keepalive_timeout types_hash_max_size default_type server listen server_name root index location error_page return rewrite try_files proxy_pass proxy_set_header proxy_redirect proxy_read_timeout proxy_connect_timeout proxy_send_timeout proxy_buffering proxy_buffers proxy_buffer_size upstream fastcgi_pass fastcgi_param fastcgi_index fastcgi_read_timeout ssl_certificate ssl_certificate_key ssl_protocols ssl_ciphers ssl_session_cache ssl_session_timeout ssl_prefer_server_ciphers gzip gzip_types gzip_comp_level gzip_min_length gzip_vary client_max_body_size add_header expires allow deny auth_basic auth_basic_user_file autoindex alias internal charset set if map limit_req limit_conn limit_req_zone limit_conn_zone resolver worker_rlimit_nofile multi_accept use daemon master_process load_module stream types ssl_dhparam ssl_stapling http2 server_tokens keepalive_requests client_body_buffer_size client_header_buffer_size large_client_header_buffers send_timeout sendfile_max_chunk open_file_cache real_ip_header set_real_ip_from proxy_http_version proxy_cache proxy_cache_path proxy_cache_valid proxy_pass_header proxy_hide_header uwsgi_pass scgi_pass etag log_not_found lingering_close reset_timedout_connection access_log_off absolute_redirect port_in_redirect underscores_in_headers ignore_invalid_headers server_name_in_redirect satisfy status stub_status mirror proxy_next_upstream proxy_ssl_verify ssl_verify_client ssl_client_certificate ssl_trusted_certificate ssl_early_data zone least_conn ip_hash hash keepalive weight max_fails fail_timeout backup down'.split(' '));
        // split a file into statements, keeping the line a statement starts on
        const parse = (path, text) => {
            const out = [];
            let cur = '', line = 1, startLine = 1, q = null;
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === '\n') line++;
                if (q) { cur += ch; if (ch === q && text[i - 1] !== '\\') q = null; continue; }
                if (ch === '#') { while (i < text.length && text[i] !== '\n') i++; line++; cur += ' '; continue; }
                if (ch === '"' || ch === "'") { if (!cur.trim()) startLine = line; q = ch; cur += ch; continue; }
                if (ch === ';') { out.push({ k: 'dir', text: cur.trim(), line: startLine }); cur = ''; continue; }
                if (ch === '{') { out.push({ k: 'open', text: cur.trim(), line: startLine }); cur = ''; continue; }
                if (ch === '}') { if (cur.trim()) out.push({ k: 'unterminated', text: cur.trim(), line: startLine }); out.push({ k: 'close', text: '', line }); cur = ''; continue; }
                if (!cur.trim() && !/\s/.test(ch)) startLine = line;
                cur += ch;
            }
            if (cur.trim()) out.push({ k: 'eof', text: cur.trim(), line: startLine });
            return out;
        };
        const expand = (pat) => {
            const dir = pat.replace(/\/[^/]*$/, ''), base = pat.split('/').pop();
            if (!/[*?]/.test(base)) return this.fs.getNode(pat) ? [pat] : null;
            const dn = this.fs.getNode(dir);
            if (!dn || !dn.children) return [];
            const re = new RegExp('^' + base.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
            return Object.keys(dn.children).filter(k => re.test(k) && dn.children[k].type === 'file').sort().map(k => dir + '/' + k);
        };
        const check = (path, depthIn) => {
            if (seen.has(path)) return null;
            seen.add(path);
            const text = this._readFile(path);
            if (text === null) return { path, line: 0, msg: `open() "${path}" failed (2: No such file or directory)` };
            files.push({ path, text: text.endsWith('\n') ? text : text + '\n' });
            const st = parse(path, text);
            let depth = 0;
            const stack = [];
            for (const s of st) {
                if (s.k === 'unterminated') return { path, line: s.line, msg: `directive "${s.text.split(/\s+/)[0]}" is not terminated by ";"` };
                if (s.k === 'eof') return { path, line: s.line, msg: depth ? 'unexpected end of file, expecting "}"' : 'unexpected end of file, expecting ";" or "}"' };
                if (s.k === 'close') { depth--; stack.pop(); if (depth < 0) return { path, line: s.line, msg: 'unexpected "}"' }; continue; }
                const first = s.text.split(/\s+/)[0];
                if (stack[stack.length - 1] === 'types' && s.k === 'dir') continue;
                if (!first) { if (s.k === 'open') { depth++; stack.push(''); continue; } return { path, line: s.line, msg: 'unexpected ";"' }; }
                if (!known.has(first)) return { path, line: s.line, msg: `unknown directive "${first}"` };
                if (s.k === 'open') { depth++; stack.push(first); continue; }
                if (first === 'include') {
                    const pat = s.text.slice(7).trim().replace(/^["']|["']$/g, '');
                    const hit = expand(pat);
                    if (hit === null) return { path, line: s.line, msg: `open() "${pat}" failed (2: No such file or directory)` };
                    for (const h of hit) { const e = check(h); if (e) return e; }
                }
            }
            if (depth > 0) return { path, line: text.split('\n').length, msg: 'unexpected end of file, expecting "}"' };
            return null;
        };
        const e0 = check(main);
        if (e0) return { err: e0 };
        return { ok: true, files };
    }

    // =========================================================== mariadb client
    mysql(args, stdin) {
        const argv = args.slice();
        let user = 'root', exec = null, db = null, pw = null, batch = false, host = null;
        const rest = [];
        for (let i = 0; i < argv.length; i++) {
            const a = argv[i];
            if (a === '-u') user = argv[++i]; else if (a.startsWith('-u') && a.length > 2) user = a.slice(2); else if (a.startsWith('--user=')) user = a.slice(7);
            else if (a === '-e' || a === '--execute') exec = argv[++i]; else if (a.startsWith('--execute=')) exec = a.slice(10);
            else if (a === '-p') pw = ''; else if (a.startsWith('-p') && a.length > 2) pw = a.slice(2);
            else if (a === '-h') host = argv[++i];
            else if (a === '-B' || a === '--batch' || a === '-N' || a === '--skip-column-names') batch = true;
            else if (a === '--version' || a === '-V') return this._ok('mysql  Ver 15.1 Distrib 10.5.22-MariaDB, for Linux (x86_64) using  EditLine wrapper');
            else if (a.startsWith('-')) continue; else rest.push(a);
        }
        db = rest[0] || null;
        if (!this._svcActive('mariadb')) return this._err(`ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (2)`, 1);
        if (!this._isRoot() && user === 'root') return this._err(`ERROR 1698 (28000): Access denied for user 'root'@'localhost'`, 1);
        if (!this.dbUsers.some(u => u.user === user) ) return this._err(`ERROR 1045 (28000): Access denied for user '${user}'@'localhost' (using password: ${pw === null ? 'NO' : 'YES'})`, 1);
        if (pw === '') { const p = this._sh() ? this._sh().takeInput({ mode: 'line', prompt: 'Enter password: ', secret: true }) : ''; if (p === null) return { stdout: '', stderr: '', exitCode: 1 }; }
        const text = exec !== null ? exec : (stdin || '');
        if (!text.trim()) return this._ok(`Welcome to the MariaDB monitor.  Commands end with ; or \\g.\nYour MariaDB connection id is ${8 + this.dbs.length}\nServer version: 10.5.22-MariaDB MariaDB Server\n\nCopyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.\n\nType 'help;' or '\\h' for help. Type '\\c' to clear the current input statement.\n\nMariaDB [(none)]> Bye`);
        const out = [], errs = [];
        let cur = db;
        let n = 0;
        for (const raw of text.split(/;\s*(?:\n|$)|;\s*$|;(?=\s)/)) {
            const s = raw.trim();
            if (!s) continue;
            n++;
            const r = this._sql(s, cur, batch);
            if (r.use) cur = r.use;
            if (r.err) { errs.push(`ERROR ${r.err} at line ${n}`.replace(/^ERROR (\d+ \([A-Z0-9]+\)): (.*) at line (\d+)$/, 'ERROR $1 at line $3: $2')); break; }
            if (r.out) out.push(r.out);
        }
        return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }
    mariadb(args, stdin) { return this.mysql(args, stdin); }
    mysqldump(args) {
        if (!this._svcActive('mariadb')) return this._err("mysqldump: Got error: 2002: \"Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (2)\" when trying to connect", 2);
        const db = args.filter(a => !a.startsWith('-'))[0];
        if (!db) return this._err('Usage: mysqldump [OPTIONS] database [tables]', 1);
        if (!this.dbs.includes(db)) return this._err(`mysqldump: Got error: 1049: "Unknown database '${db}'" when selecting the database`, 2);
        return this._ok(`-- MariaDB dump 10.19  Distrib 10.5.22-MariaDB, for Linux (x86_64)\n--\n-- Host: localhost    Database: ${db}\n-- ------------------------------------------------------\n-- Server version\t10.5.22-MariaDB\n\n-- Dump completed on ${this._fmt(this._now(), '%Y-%m-%d %H:%M:%S')}`);
    }

    _table(head, rows, batch) {
        if (batch) return rows.map(r => r.join('\t')).join('\n');
        const w = head.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length)));
        const line = '+' + w.map(x => '-'.repeat(x + 2)).join('+') + '+';
        const fmt = (r) => '| ' + r.map((c, i) => String(c).padEnd(w[i])).join(' | ') + ' |';
        return [line, fmt(head), line, ...rows.map(fmt), line].join('\n');
    }

    _sql(stmt, cur, batch) {
        const s = stmt.replace(/\s+/g, ' ').trim();
        let m;
        if (/^show databases$/i.test(s)) return { out: this._table(['Database'], this.dbs.slice().sort().map(d => [d]), batch) };
        if ((m = /^create (database|schema)( if not exists)? `?(\w+)`?$/i.exec(s))) { if (this.dbs.includes(m[3])) return m[2] ? {} : { err: `1007 (HY000): Can't create database '${m[3]}'; database exists` }; this.dbs.push(m[3]); return {}; }
        if ((m = /^drop (database|schema)( if exists)? `?(\w+)`?$/i.exec(s))) { if (!this.dbs.includes(m[3])) return m[2] ? {} : { err: `1008 (HY000): Can't drop database '${m[3]}'; database doesn't exist` }; this.dbs.splice(this.dbs.indexOf(m[3]), 1); return {}; }
        if ((m = /^use `?(\w+)`?$/i.exec(s))) { if (!this.dbs.includes(m[1])) return { err: `1049 (42000): Unknown database '${m[1]}'` }; return { use: m[1] }; }
        if (/^show tables$/i.test(s)) { if (!cur) return { err: '1046 (3D000): No database selected' }; return { out: cur === 'mysql' ? this._table(['Tables_in_mysql'], [['db'], ['user'], ['tables_priv']], batch) : '' }; }
        if ((m = /^select (version\(\)|@@version)$/i.exec(s))) return { out: this._table([m[1]], [['10.5.22-MariaDB']], batch) };
        if (/^select (user\(\)|current_user\(\))$/i.test(s)) return { out: this._table([s.slice(7)], [['root@localhost']], batch) };
        if (/^select database\(\)$/i.test(s)) return { out: this._table(['database()'], [[cur || 'NULL']], batch) };
        if ((m = /^select (\d+)\s*([-+*\/])\s*(\d+)(?: as (\w+))?$/i.exec(s))) { const a = +m[1], b = +m[3]; const v = m[2] === '+' ? a + b : m[2] === '-' ? a - b : m[2] === '*' ? a * b : a / b; return { out: this._table([m[4] || `${m[1]} ${m[2]} ${m[3]}`.replace(/ /g, m[2] === '/' ? '/' : ' ')], [[String(v)]], batch) }; }
        if ((m = /^select (\d+)$/i.exec(s))) return { out: this._table([m[1]], [[m[1]]], batch) };
        if (/^select user, ?host from mysql\.user$/i.test(s)) return { out: this._table(['User', 'Host'], this.dbUsers.map(u => [u.user, u.host]), batch) };
        if ((m = /^create user( if not exists)? '?(\w+)'?(?:@'?([\w.%]+)'?)?(?: identified by '[^']*')?$/i.exec(s))) { const host = m[3] || '%'; if (this.dbUsers.some(u => u.user === m[2] && u.host === host)) return m[1] ? {} : { err: `1396 (HY000): Operation CREATE USER failed for '${m[2]}'@'${host}'` }; this.dbUsers.push({ user: m[2], host }); return {}; }
        if ((m = /^drop user( if exists)? '?(\w+)'?(?:@'?([\w.%]+)'?)?$/i.exec(s))) { const host = m[3] || '%'; const i = this.dbUsers.findIndex(u => u.user === m[2] && u.host === host); if (i < 0) return m[1] ? {} : { err: `1396 (HY000): Operation DROP USER failed for '${m[2]}'@'${host}'` }; this.dbUsers.splice(i, 1); return {}; }
        if (/^(grant|revoke|flush|set password|alter user|set)\b/i.test(s)) return {};
        if (/^status$/i.test(s)) return { out: 'mysql  Ver 15.1 Distrib 10.5.22-MariaDB, for Linux (x86_64) using  EditLine wrapper\n\nConnection id:\t\t9\nCurrent database:\t' + (cur || '') + '\nCurrent user:\t\troot@localhost\nServer:\t\t\tMariaDB\nServer version:\t\t10.5.22-MariaDB MariaDB Server\nUNIX socket:\t\t/var/lib/mysql/mysql.sock' };
        if (/^show (grants|processlist|status|variables)/i.test(s)) return { out: '' };
        return { err: `1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near '${s.slice(0, 20)}' at line 1` };
    }

    // =========================================================== gcc / make
    _compile(name, args) {
        const o = { out: null, c: false, link: [], files: [], std: null };
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-o') o.out = args[++i]; else if (a === '-c') o.c = true; else if (a === '-I' || a === '-L' || a === '-D' || a === '-include') i++;
            else if (a.startsWith('-l')) o.link.push(a.slice(2)); else if (a.startsWith('-')) continue; else o.files.push(a);
        }
        if (args.includes('--version') || args.includes('-dumpversion') && false) return { r: this._ok(`${name} (GCC) 11.4.1 20231218 (Red Hat 11.4.1-3)\nCopyright (C) 2021 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.  There is NO\nwarranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\n`) };
        if (args.includes('-dumpversion')) return { r: this._ok('11') };
        if (!o.files.length) return { r: this._err(`${name}: fatal error: no input files\ncompilation terminated.`, 1) };
        const warnings = [];
        const bodies = [];
        for (const f of o.files) {
            const text = this._readFile(f);
            if (text === null) return { r: this._err(`${name}: error: ${f}: No such file or directory\n${name}: fatal error: no input files\ncompilation terminated.`, 1) };
            if (!/\.(c|cc|cpp|o|s)$/.test(f)) return { r: this._err(`${name}: warning: ${f}: linker input file unused because linking not done`, 1) };
            if (/\.o$/.test(f)) { bodies.push(text); continue; }
            const lines = text.split('\n');
            const hdr = new Set(['stdio.h', 'stdlib.h', 'string.h', 'unistd.h', 'math.h', 'errno.h', 'time.h', 'ctype.h', 'signal.h', 'fcntl.h', 'sys/types.h', 'sys/stat.h', 'sys/socket.h', 'netinet/in.h', 'arpa/inet.h', 'pthread.h', 'stdint.h', 'stdbool.h', 'limits.h', 'assert.h', 'stdarg.h', 'dirent.h', 'sys/wait.h', 'iostream', 'vector', 'string']);
            let hasStdio = false;
            for (let i = 0; i < lines.length; i++) {
                const m = /^\s*#include\s*[<"]([^>"]+)[>"]/.exec(lines[i]);
                if (m) { if (m[1] === 'stdio.h') hasStdio = true; if (!hdr.has(m[1]) && !this.fs.getNode(this.fs.resolvePath(m[1]))) return { r: this._err(`${f}:${i + 1}:10: fatal error: ${m[1]}: No such file or directory\n    ${i + 1} | ${lines[i].trim()}\n      |          ^${'~'.repeat(Math.max(1, m[1].length + 1))}\ncompilation terminated.`, 1) }; }
            }
            const opens = (text.match(/\{/g) || []).length, closes = (text.match(/\}/g) || []).length;
            if (opens > closes) return { r: this._err(`${f}: In function ‘main’:\n${f}:${lines.length}:1: error: expected declaration or statement at end of input`, 1) };
            if (closes > opens) return { r: this._err(`${f}:${lines.length}:1: error: expected identifier or ‘(’ before ‘}’ token`, 1) };
            const pOpen = (text.match(/\(/g) || []).length, pClose = (text.match(/\)/g) || []).length;
            if (pOpen !== pClose) return { r: this._err(`${f}:1:1: error: expected ‘)’ before ‘;’ token`, 1) };
            const missingSemi = lines.findIndex((l, i) => /^\s*(printf|puts|return|int\s+\w+\s*=|char\s+\w+\s*\[)[^;{}]*$/.test(l) && !/[;{},(+\-*\/&|<>=?:^%!~.]\s*$/.test(l) && lines[i + 1] !== undefined && !/^\s*[,.)]/.test(lines[i + 1]) && !/\\\s*$/.test(l));
            if (missingSemi >= 0) return { r: this._err(`${f}: In function ‘main’:\n${f}:${missingSemi + 2}:5: error: expected ‘;’ before ‘${(lines[missingSemi + 1] || '}').trim().split(/\s/)[0]}’\n    ${missingSemi + 1} |     ${lines[missingSemi].trim()}\n      |                      ^\n      |                      ;`, 1) };
            if (/\bprintf\s*\(/.test(text) && !hasStdio) warnings.push(`${f}: In function ‘main’:\n${f}:${lines.findIndex(l => /printf\s*\(/.test(l)) + 1}:5: warning: implicit declaration of function ‘printf’ [-Wimplicit-function-declaration]\n${f}:1:1: note: include ‘<stdio.h>’ or provide a declaration of ‘printf’`);
            if (!o.c && !/\bmain\s*\(/.test(text)) return { r: { stdout: '', stderr: `/usr/bin/ld: /usr/lib/gcc/x86_64-redhat-linux/11/../../../../lib64/crt1.o: in function \`_start':\n(.text+0x1b): undefined reference to \`main'\ncollect2: error: ld returned 1 exit status`, exitCode: 1 } };
            // a "program": the printf/puts calls in order, exit code from the last return
            const script = ['#!/bin/sh', `# built by Red Cat ${name} from ${f}`];
            let code = 0;
            for (const l of lines) {
                let m;
                if ((m = /\bprintf\s*\(\s*"((?:[^"\\]|\\.)*)"\s*(?:,\s*(.*?))?\)\s*;/.exec(l))) script.push(`printf '${m[1].replace(/'/g, "'\\''").replace(/%l?[dif]/g, '%s')}'${m[2] ? ' ' + m[2].split(/\s*,\s*/).map(x => (/^"/.test(x) ? `'${x.replace(/^"|"$/g, '')}'` : /^\d+$/.test(x) ? x : "''")).join(' ') : ''}`);
                else if ((m = /\bputs\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)\s*;/.exec(l))) script.push(`printf '%s\\n' '${m[1].replace(/\\n/g, '').replace(/'/g, "'\\''")}'`);
                else if ((m = /\breturn\s+(\d+)\s*;/.exec(l))) code = parseInt(m[1], 10);
            }
            script.push(`exit ${code}`);
            bodies.push(script.join('\n') + '\n');
        }
        const outName = o.out || (o.c ? o.files[0].replace(/\.\w+$/, '.o') : 'a.out');
        const content = o.c ? bodies[0] : bodies.length === 1 ? bodies[0] : bodies[0];
        this._write(outName, content, o.c ? '0644' : '0755');
        return { r: { stdout: '', stderr: warnings.join('\n'), exitCode: 0 } };
    }
    gcc(args) { return this._compile('gcc', args).r; }
    cc(args) { return this._compile('cc', args).r; }

    make(args) {
        const { o, targets, vars, file } = (() => {
            const o = {}, targets = [], vars = {};
            let file = null;
            for (let i = 0; i < args.length; i++) {
                const a = args[i];
                if (a === '-f') file = args[++i]; else if (a === '-C') o.C = args[++i]; else if (/^-[a-zA-Z]+$/.test(a)) for (const ch of a.slice(1)) o[ch] = true; else if (/^--/.test(a)) o[a.slice(2)] = true; else if (/^\w+=/.test(a)) { const [k, ...v] = a.split('='); vars[k] = v.join('='); } else targets.push(a);
            }
            return { o, targets, vars, file };
        })();
        if (o.version || o.v) return this._ok('GNU Make 4.3\nBuilt for x86_64-redhat-linux-gnu\nCopyright (C) 1988-2020 Free Software Foundation, Inc.\nLicense GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>\nThis is free software: you are free to change and redistribute it.\nThere is NO WARRANTY, to the extent permitted by law.');
        const dir = o.C ? this.fs.resolvePath(o.C) : this.fs.currentPath;
        const mf = file || ['GNUmakefile', 'makefile', 'Makefile'].find(n => this.fs.getNode(dir + '/' + n));
        if (!mf) return this._err('make: *** No targets specified and no makefile found.  Stop.', 2);
        const text = this._readFile(mf.startsWith('/') ? mf : dir + '/' + mf);
        if (text === null) return this._err(`make: ${mf}: No such file or directory\nmake: *** No rule to make target '${mf}'.  Stop.`, 2);
        const V = Object.assign({}, vars);
        const rules = {};
        let first = null, cur = null;
        const lines = text.replace(/\\\n\s*/g, ' ').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const l = lines[i];
            if (/^\s*#/.test(l) || !l.trim()) { if (!l.trim()) cur = cur && /^\t/.test(l) ? cur : cur; continue; }
            if (/^\t/.test(l)) { if (!cur) return this._err(`${mf}:${i + 1}: *** recipe commences before first target.  Stop.`, 2); if (!cur.rline) cur.rline = i + 1; cur.recipe.push(l.slice(1)); continue; }
            let m = /^(\w+)\s*(:=|\?=|\+=|=)\s*(.*)$/.exec(l);
            if (m) { if (m[2] === '?=') { if (V[m[1]] === undefined) V[m[1]] = m[3]; } else if (m[2] === '+=') V[m[1]] = (V[m[1]] ? V[m[1]] + ' ' : '') + m[3]; else if (V[m[1]] === undefined || !(m[1] in vars)) V[m[1]] = m[3]; cur = null; continue; }
            m = /^([^:=\s][^:=]*?)\s*:(?!=)\s*(.*)$/.exec(l);
            if (m) {
                for (const t of m[1].split(/\s+/)) { if (t === '.PHONY') { m[2].split(/\s+/).forEach(x => { rules[x] = rules[x] || { deps: [], recipe: [] }; rules[x].phony = true; }); cur = null; continue; } rules[t] = rules[t] || { deps: [], recipe: [] }; rules[t].deps.push(...m[2].split(/\s+/).filter(Boolean)); if (first === null && !t.startsWith('.')) first = t; cur = rules[t]; }
                continue;
            }
            return this._err(`${mf}:${i + 1}: *** missing separator.  Stop.`, 2);
        }
        const expand = (s, auto) => s.replace(/\$\(([^)]+)\)|\$\{([^}]+)\}|\$([@<^])/g, (mm, a, b, c) => { const k = a || b || c; if (auto && k in auto) return auto[k]; if (k in V) return expand(V[k], auto); return ''; });
        const out = [], errs = [];
        const done = new Set();
        const build = (t, depth) => {
            if (depth > 50) { errs.push(`make: Circular dependency dropped.`); return false; }
            const r = rules[t];
            const exists = !!this.fs.getNode(dir + '/' + t);
            if (!r) { if (exists) return true; errs.push(`make: *** No rule to make target '${t}'${depth ? `, needed by '${depth && 'parent'}'` : ''}.  Stop.`.replace(`, needed by 'parent'`, '')); return false; }
            if (done.has(t)) return true;
            for (const d of r.deps.map(x => expand(x)).join(' ').split(/\s+/).filter(Boolean)) { if (!build(d, depth + 1)) return false; }
            if (!r.phony && exists && r.recipe.length && r.deps.length === 0 ) { done.add(t); out.push(`make: '${t}' is up to date.`); return true; }
            const auto = { '@': t, '<': (r.deps[0] || ''), '^': r.deps.join(' ') };
            for (const cmd of r.recipe) {
                let c = expand(cmd, auto);
                let silent = false, ignore = false;
                while (/^[@\-+]/.test(c)) { if (c[0] === '@') silent = true; if (c[0] === '-') ignore = true; c = c.slice(1); }
                if (!silent && !o.s) out.push(c);
                if (o.n) continue;
                const prevCwd = this.fs.currentPath; this.fs.currentPath = dir;
                const res = this._exec(c, '');
                this.fs.currentPath = prevCwd;
                if (res.out) out.push(res.out.replace(/\n$/, ''));
                if (res.err) out.push(res.err.replace(/\n$/, ''));
                if (res.rc !== 0 && !ignore && !o.k) { errs.push(`make: *** [${mf}:${rules[t].rline || 1}: ${t}] Error ${res.rc}`); return false; }
            }
            done.add(t);
            return true;
        };
        const goals = targets.length ? targets : (first ? [first] : []);
        if (!goals.length) return this._err('make: *** No targets.  Stop.', 2);
        for (const g of goals) { if (!build(g, 0)) return { stdout: out.join('\n'), stderr: errs.join('\n'), exitCode: 2 }; if (!rules[g] || (!rules[g].recipe.length && !out.length)) out.push(`make: Nothing to be done for '${g}'.`); }
        return this._ok(out.join('\n'));
    }

    // =========================================================== tmux / screen
    _tmuxProc(on) {
        const P = this.shared.processes;
        const i = P.findIndex(p => p.comm === 'tmux: server');
        if (on && i < 0) { const sv = this.shared.svc; const pid = sv ? sv.svNextPid++ : 7000; P.push({ pid, ppid: 1, user: this.fs.currentUser, cpu: 0, mem: 0.1, tty: '?', stat: 'Ss', ni: 0, command: 'tmux new-session -d', comm: 'tmux: server', time: '00:00:00', start: sv && sv._hhmm ? sv._hhmm(this._now()) : '00:00', service: null, domain: 'unconfined_t' }); if (sv && sv._svSort) sv._svSort(); }
        if (!on && i >= 0) P.splice(i, 1);
    }

    tmux(args) {
        const sub = args[0];
        if (args.includes('-V')) return this._ok('tmux 3.2a');
        const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
        const created = () => this._fmt(this._now(), '%a %b %e %H:%M:%S %Y');
        if (!sub || sub === 'new' || sub === 'new-session') {
            const name = val('-s') || String(this.tmuxSessions.length);
            if (this.tmuxSessions.some(s => s.name === name)) return this._err(`duplicate session: ${name}`, 1);
            this.tmuxSessions.push({ name, created: created() });
            this._tmuxProc(true);
            if (args.includes('-d')) return this._ok('');
            return this._ok(`[detached (from session ${name})]`);
        }
        if (sub === 'ls' || sub === 'list-sessions') {
            if (!this.tmuxSessions.length) return this._err(`no server running on /tmp/tmux-${this.fs.currentUid}/default`, 1);
            return this._ok(this.tmuxSessions.map((s, i) => `${s.name}: 1 windows (created ${s.created})${i === 0 ? ' (attached)' : ''}`.replace(' (attached)', '')).join('\n'));
        }
        if (sub === 'a' || sub === 'attach' || sub === 'attach-session' || sub === 'at') {
            if (!this.tmuxSessions.length) return this._err('no sessions', 1);
            const t = val('-t');
            const s = t ? this.tmuxSessions.find(x => x.name === t) : this.tmuxSessions[0];
            if (!s) return this._err(`can't find session: ${t}`, 1);
            return this._ok(`[detached (from session ${s.name})]`);
        }
        if (sub === 'kill-session') { const t = val('-t'); const i = this.tmuxSessions.findIndex(x => x.name === t); if (i < 0) return this._err(`can't find session: ${t}`, 1); this.tmuxSessions.splice(i, 1); if (!this.tmuxSessions.length) this._tmuxProc(false); return this._ok(''); }
        if (sub === 'kill-server') { if (!this.tmuxSessions.length) return this._err(`no server running on /tmp/tmux-${this.fs.currentUid}/default`, 1); this.tmuxSessions.length = 0; this._tmuxProc(false); return this._ok(''); }
        if (sub === 'has-session') { const t = val('-t'); return { stdout: '', stderr: this.tmuxSessions.some(x => x.name === t) ? '' : `can't find session: ${t}`, exitCode: this.tmuxSessions.some(x => x.name === t) ? 0 : 1 }; }
        if (sub === 'rename-session') { const t = val('-t') || (this.tmuxSessions[0] || {}).name; const s = this.tmuxSessions.find(x => x.name === t); if (!s) return this._err(`can't find session: ${t}`, 1); s.name = args[args.length - 1]; return this._ok(''); }
        if (sub === 'list-windows') { const t = val('-t'); return this._ok(`0: bash* (1 panes) [80x24] [layout b25f,80x24,0,0,0] @0 (active)`); }
        if (sub === 'send-keys') { const t = val('-t'); const keys = args.slice(args.indexOf('-t') + 2).filter(x => x !== 'Enter' && x !== 'C-m'); if (!this.tmuxSessions.length) return this._err('no server running on /tmp/tmux-' + this.fs.currentUid + '/default', 1); if (args.includes('Enter')) this._exec(keys.join(' '), ''); return this._ok(''); }
        if (sub === 'source-file' || sub === 'set' || sub === 'set-option' || sub === 'bind' || sub === 'bind-key') return this._ok('');
        if (sub === 'list-keys') return this._ok('bind-key    -T prefix C-b   send-prefix\nbind-key    -T prefix d     detach-client\nbind-key    -T prefix c     new-window\nbind-key    -T prefix n     next-window');
        return this._err(`unknown command: ${sub}`, 1);
    }

    screen(args) {
        const val = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
        const dir = `/run/screen/S-${this.fs.currentUser}`;
        if (args.includes('-v') || args.includes('--version')) return this._ok('Screen version 4.08.00 (GNU) 05-Feb-20');
        if (args.includes('-ls') || args.includes('-list')) {
            if (!this.screens.length) return { stdout: `No Sockets found in ${dir}.\n`.replace(/\n$/, ''), stderr: '', exitCode: 1 };
            return this._ok(`There ${this.screens.length === 1 ? 'is a screen' : 'are screens'} on:\n` + this.screens.map(s => `\t${s.pid}.${s.name}\t(${s.created})\t(Detached)`).join('\n') + `\n${this.screens.length} Socket${this.screens.length === 1 ? '' : 's'} in ${dir}.`);
        }
        const name = val('-S');
        if (args.includes('-X')) { const t = name; const i = this.screens.findIndex(s => s.name === t || `${s.pid}.${s.name}` === t); if (i < 0) return this._err(`No screen session found.`, 1); if (args.includes('quit')) this.screens.splice(i, 1); return this._ok(''); }
        if (args.includes('-r') || args.includes('-R') || args.includes('-x') || args.includes('-d')) {
            const t = val('-r') || val('-R') || val('-x') || name;
            const s = t && !t.startsWith('-') ? this.screens.find(x => x.name === t || String(x.pid) === t || `${x.pid}.${x.name}` === t) : this.screens[0];
            if (!s) return this._err(`There is no screen to be resumed${t && !t.startsWith('-') ? ' matching ' + t : ''}.`, 1);
            return this._ok(`[detached from ${s.pid}.${s.name}]`);
        }
        const sv = this.shared.svc;
        const pid = (sv ? sv.svNextPid++ : 7100);
        const sname = name || `pts-0.${this.parent.hostname}`;
        this.screens.push({ name: sname, pid, created: this._fmt(this._now(), '%m/%d/%Y %I:%M:%S %p') });
        if (args.includes('-dm') || args.includes('-dmS') || args.includes('-d')) return this._ok('');
        return this._ok(`[detached from ${pid}.${sname}]`);
    }
}

// ---------------------------------------------------------------------------------------------------------------
// A small Python interpreter: expressions, print, assignments, if/elif/else, for, while, def/return, list
// comprehensions, a few modules. Enough for one-liners and simple scripts; anything else is reported clearly.
const PyMini = (() => {
    class PyError extends Error {
        constructor(type, msg, line) { super(msg); this.type = type; this.line = line || 1; }
        format(fname) { return `Traceback (most recent call last):\n  File "${fname}", line ${this.line}, in <module>\n${this.type}: ${this.message}`.replace(/: $/, ''); }
    }
    class Exit extends Error { constructor(code) { super('exit'); this.code = code; } }
    class Break extends Error {}
    class Continue extends Error {}
    class Return extends Error { constructor(v) { super('return'); this.v = v; } }
    class PyFloat { constructor(v) { this.v = v; } }
    class PyTuple { constructor(items) { this.items = items; } }
    const isInt = (x) => typeof x === 'bigint';
    const isNum = (x) => typeof x === 'bigint' || x instanceof PyFloat || typeof x === 'boolean';
    const num = (x) => (typeof x === 'boolean' ? (x ? 1n : 0n) : x);
    const fv = (x) => (x instanceof PyFloat ? x.v : Number(num(x)));

    const typeName = (x) => x === null ? 'NoneType' : typeof x === 'boolean' ? 'bool' : isInt(x) ? 'int' : x instanceof PyFloat ? 'float' : typeof x === 'string' ? 'str' : Array.isArray(x) ? 'list' : x instanceof PyTuple ? 'tuple' : x instanceof Map ? 'dict' : x instanceof Set ? 'set' : typeof x === 'function' || (x && x.fn) ? 'function' : 'object';
    const fmtFloat = (v) => { if (Number.isInteger(v) && Math.abs(v) < 1e16) return v.toFixed(1); if (!isFinite(v)) return v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan'; let s = String(v); if (/e/.test(s)) s = s.replace(/e([+-])(\d)$/, 'e$10$2'); return s; };
    const repr = (x) => {
        if (x === null) return 'None';
        if (typeof x === 'boolean') return x ? 'True' : 'False';
        if (isInt(x)) return x.toString();
        if (x instanceof PyFloat) return fmtFloat(x.v);
        if (typeof x === 'string') { const q = x.includes("'") && !x.includes('"') ? '"' : "'"; return q + x.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(new RegExp(q, 'g'), '\\' + q) + q; }
        if (Array.isArray(x)) return '[' + x.map(repr).join(', ') + ']';
        if (x instanceof PyTuple) return '(' + x.items.map(repr).join(', ') + (x.items.length === 1 ? ',' : '') + ')';
        if (x instanceof Map) return '{' + [...x.entries()].map(([k, v]) => repr(k) + ': ' + repr(v)).join(', ') + '}';
        if (x instanceof Set) return x.size ? '{' + [...x].map(repr).join(', ') + '}' : 'set()';
        if (x && x.tn) return `<class '${x.tn}'>`;
        if (x && x.fn) return `<function ${x.name} at 0x7f${Math.floor(Math.random() * 1e8).toString(16)}>`;
        return String(x);
    };
    const str = (x) => (typeof x === 'string' ? x : repr(x));
    const truthy = (x) => !(x === null || x === false || x === 0n || (x instanceof PyFloat && x.v === 0) || x === '' || (Array.isArray(x) && !x.length) || (x instanceof PyTuple && !x.items.length) || (x instanceof Map && !x.size) || (x instanceof Set && !x.size));
    const eq = (a, b) => { if (isNum(a) && isNum(b)) return fv(a) === fv(b) && (isInt(num(a)) && isInt(num(b)) ? num(a) === num(b) : true); if (typeof a !== typeof b) return false; if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => eq(v, b[i])); if (a instanceof PyTuple && b instanceof PyTuple) return eq(a.items, b.items); return a === b; };
    const lt = (a, b) => { if (isNum(a) && isNum(b)) return fv(a) < fv(b); if (typeof a === 'string' && typeof b === 'string') return a < b; if ((Array.isArray(a) && Array.isArray(b))) { for (let i = 0; i < Math.min(a.length, b.length); i++) { if (lt(a[i], b[i])) return true; if (lt(b[i], a[i])) return false; } return a.length < b.length; } throw new PyError('TypeError', `'<' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`); };
    const iterOf = (x) => { if (Array.isArray(x)) return x; if (x instanceof PyTuple) return x.items; if (typeof x === 'string') return Array.from(x); if (x instanceof Map) return [...x.keys()]; if (x instanceof Set) return [...x]; throw new PyError('TypeError', `'${typeName(x)}' object is not iterable`); };

    // ---- tokenizer
    const tokenize = (src, line) => {
        const toks = []; let i = 0;
        while (i < src.length) {
            const c = src[i];
            if (c === ' ' || c === '\t') { i++; continue; }
            if (c === '#') break;
            const m = /^(?:[fFrRbB]{0,2})(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/.exec(src.slice(i));
            if (m && (/^[fFrRbB]{0,2}['"]/.test(src.slice(i)))) { const raw = m[0]; const pm = /^([fFrRbB]*)(['"]{3}|['"])/.exec(raw); const prefix = pm[1].toLowerCase(), q = pm[2]; let body = raw.slice(pm[0].length, raw.length - q.length); if (!prefix.includes('r')) body = body.replace(/\\(n|t|\\|'|"|r|0)/g, (_, k) => ({ n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"', r: '\r', 0: '\0' }[k])); toks.push({ t: 'str', v: body, f: prefix.includes('f') }); i += raw.length; continue; }
            const nm = /^(\d+\.\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+[eE][+-]?\d+|0[xX][0-9a-fA-F]+|\d+(?:_\d+)*)/.exec(src.slice(i));
            if (nm && !/[A-Za-z_]/.test(src[i - 1] || ' ')) { const t = nm[0].replace(/_/g, ''); toks.push({ t: 'num', v: /^0[xX]/.test(t) ? BigInt(t) : /[.eE]/.test(t) ? new PyFloat(parseFloat(t)) : BigInt(t) }); i += nm[0].length; continue; }
            const id = /^[A-Za-z_][A-Za-z_0-9]*/.exec(src.slice(i));
            if (id) { toks.push({ t: 'id', v: id[0] }); i += id[0].length; continue; }
            const op = /^(\*\*=|\/\/=|\*\*|\/\/|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|->|:=|[-+*\/%()\[\]{},:.<>=@])/.exec(src.slice(i));
            if (op) { toks.push({ t: 'op', v: op[0] }); i += op[0].length; continue; }
            throw new PyError('SyntaxError', 'invalid syntax', line);
        }
        return toks;
    };

    // ---- expression parser -> closures
    const KW = new Set(['and', 'or', 'not', 'in', 'is', 'if', 'else', 'for', 'lambda', 'None', 'True', 'False']);
    const parseExpr = (toks, line, interp) => {
        let p = 0;
        const peek = () => toks[p], next = () => toks[p++];
        const isOp = (v) => toks[p] && toks[p].t === 'op' && toks[p].v === v;
        const isKw = (v) => toks[p] && toks[p].t === 'id' && toks[p].v === v;
        const err = () => new PyError('SyntaxError', 'invalid syntax', line);
        const ternary = () => {
            const e = orExpr();
            if (isKw('if')) { next(); const c = orExpr(); if (!isKw('else')) throw err(); next(); const f = ternary(); return (sc) => (truthy(c(sc)) ? e(sc) : f(sc)); }
            return e;
        };
        const orExpr = () => { let l = andExpr(); while (isKw('or')) { next(); const r = andExpr(); const ll = l; l = (sc) => { const a = ll(sc); return truthy(a) ? a : r(sc); }; } return l; };
        const andExpr = () => { let l = notExpr(); while (isKw('and')) { next(); const r = notExpr(); const ll = l; l = (sc) => { const a = ll(sc); return truthy(a) ? r(sc) : a; }; } return l; };
        const notExpr = () => { if (isKw('not')) { next(); const e = notExpr(); return (sc) => !truthy(e(sc)); } return cmpExpr(); };
        const cmpExpr = () => {
            let l = addExpr();
            const ops = [];
            while (true) {
                let op = null;
                if (peek() && peek().t === 'op' && ['==', '!=', '<', '>', '<=', '>='].includes(peek().v)) op = next().v;
                else if (isKw('in')) { next(); op = 'in'; }
                else if (isKw('not') && toks[p + 1] && toks[p + 1].v === 'in') { next(); next(); op = 'not in'; }
                else if (isKw('is')) { next(); if (isKw('not')) { next(); op = 'is not'; } else op = 'is'; }
                else break;
                ops.push([op, addExpr()]);
            }
            if (!ops.length) return l;
            const first = l;
            return (sc) => {
                let a = first(sc);
                for (const [op, re] of ops) {
                    const b = re(sc);
                    let r;
                    switch (op) { case '==': r = eq(a, b); break; case '!=': r = !eq(a, b); break; case '<': r = lt(a, b); break; case '>': r = lt(b, a); break; case '<=': r = lt(a, b) || eq(a, b); break; case '>=': r = lt(b, a) || eq(a, b); break; case 'in': r = contains(b, a); break; case 'not in': r = !contains(b, a); break; case 'is': r = a === b || (a === null && b === null); break; default: r = !(a === b); }
                    if (!r) return false;
                    a = b;
                }
                return true;
            };
        };
        const contains = (c, x) => { if (typeof c === 'string') { if (typeof x !== 'string') throw new PyError('TypeError', "'in <string>' requires string as left operand, not " + typeName(x)); return c.includes(x); } if (c instanceof Map) return [...c.keys()].some(k => eq(k, x)); if (c instanceof Set) return [...c].some(k => eq(k, x)); return iterOf(c).some(v => eq(v, x)); };
        const addExpr = () => {
            let l = mulExpr();
            while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) { const op = next().v; const r = mulExpr(); const ll = l; l = (sc) => arith(op, ll(sc), r(sc)); }
            return l;
        };
        const mulExpr = () => {
            let l = unary();
            while (peek() && peek().t === 'op' && ['*', '/', '//', '%'].includes(peek().v)) { const op = next().v; const r = unary(); const ll = l; l = (sc) => arith(op, ll(sc), r(sc)); }
            return l;
        };
        const unary = () => {
            if (isOp('-')) { next(); const e = unary(); return (sc) => { const v = e(sc); if (!isNum(v)) throw new PyError('TypeError', `bad operand type for unary -: '${typeName(v)}'`); return v instanceof PyFloat ? new PyFloat(-v.v) : -num(v); }; }
            if (isOp('+')) { next(); return unary(); }
            return power();
        };
        const power = () => { const b = postfix(); if (isOp('**')) { next(); const e = unary(); return (sc) => arith('**', b(sc), e(sc)); } return b; };
        const callArgs = () => {
            const pos = [], kw = [];
            while (!isOp(')')) {
                if (peek().t === 'id' && toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '=' ) { const k = next().v; next(); kw.push([k, ternary()]); }
                else pos.push(ternary());
                if (isOp(',')) next(); else if (isKw('for')) { /* generator argument */ const bodyE = pos.pop(); next(); const target = next().v; if (!isKw('in')) throw err(); next(); const it = orExpr(); let cond = null; if (isKw('if')) { next(); cond = orExpr(); } pos.push((sc) => { const out = []; for (const v of iterOf(it(sc))) { const s2 = Object.create(sc); s2[target] = v; if (!cond || truthy(cond(s2))) out.push(bodyE(s2)); } return out; }); }
            }
            next();
            return { pos, kw };
        };
        const postfix = () => {
            let e = atom();
            while (true) {
                if (isOp('(')) { next(); const a = callArgs(); const ee = e; e = (sc) => callv(ee(sc), a.pos.map(f => f(sc)), a.kw.map(([k, f]) => [k, f(sc)]), interp, sc); continue; }
                if (isOp('[')) {
                    next();
                    let lo = null, hi = null, slice = false, step = null;
                    if (!isOp(':')) lo = ternary();
                    if (isOp(':')) { slice = true; next(); if (!isOp(']') && !isOp(':')) hi = ternary(); if (isOp(':')) { next(); if (!isOp(']')) step = ternary(); } }
                    if (!isOp(']')) throw err();
                    next();
                    const ee = e, l = lo, h = hi, s = step;
                    e = slice ? (sc) => { const b = ee(sc); const arr = typeof b === 'string' ? Array.from(b) : iterOf(b); const n = arr.length; const st = s ? Number(num(s(sc))) : 1; let a0 = l ? Number(num(l(sc))) : (st > 0 ? 0 : n - 1), b0 = h ? Number(num(h(sc))) : (st > 0 ? n : -n - 1); if (a0 < 0) a0 += n; if (b0 < 0) b0 += n; const out = []; if (st > 0) for (let k = Math.max(0, a0); k < Math.min(n, b0); k += st) out.push(arr[k]); else for (let k = Math.min(n - 1, a0); k > Math.max(-1, b0); k += st) out.push(arr[k]); return typeof b === 'string' ? out.join('') : b instanceof PyTuple ? new PyTuple(out) : out; } : (sc) => index(ee(sc), l(sc));
                    continue;
                }
                if (isOp('.')) { next(); const name = next().v; const ee = e; e = (sc) => getattr(ee(sc), name, interp); continue; }
                break;
            }
            return e;
        };
        const atom = () => {
            const t = next();
            if (!t) throw err();
            if (t.t === 'num') return () => t.v;
            if (t.t === 'str') {
                let s = t;
                const parts = [s];
                while (peek() && peek().t === 'str') parts.push(next());
                const compiled = parts.map(pt => (pt.f ? fstring(pt.v, line, interp) : () => pt.v));
                return (sc) => compiled.map(f => f(sc)).join('');
            }
            if (t.t === 'id') {
                if (t.v === 'None') return () => null; if (t.v === 'True') return () => true; if (t.v === 'False') return () => false;
                if (t.v === 'lambda') { const params = []; while (!isOp(':')) { params.push(next().v); if (isOp(',')) next(); } next(); const body = ternary(); return (sc) => ({ fn: true, name: '<lambda>', params, call: (args) => { const s2 = Object.create(sc); params.forEach((pn, i) => { s2[pn] = args[i]; }); return body(s2); } }); }
                if (KW.has(t.v)) throw err();
                return (sc) => { if (t.v in sc) return sc[t.v]; if (t.v in interp.builtins) return interp.builtins[t.v]; throw new PyError('NameError', `name '${t.v}' is not defined`, line); };
            }
            if (t.v === '(') {
                if (isOp(')')) { next(); return () => new PyTuple([]); }
                const first = ternary();
                if (isKw('for')) { next(); const target = next().v; next(); const it = orExpr(); let cond = null; if (isKw('if')) { next(); cond = orExpr(); } next(); return (sc) => { const out = []; for (const v of iterOf(it(sc))) { const s2 = Object.create(sc); s2[target] = v; if (!cond || truthy(cond(s2))) out.push(first(s2)); } return out; }; }
                if (isOp(',')) { const items = [first]; while (isOp(',')) { next(); if (isOp(')')) break; items.push(ternary()); } if (!isOp(')')) throw err(); next(); return (sc) => new PyTuple(items.map(f => f(sc))); }
                if (!isOp(')')) throw err();
                next();
                return first;
            }
            if (t.v === '[') {
                if (isOp(']')) { next(); return () => []; }
                const first = ternary();
                if (isKw('for')) {
                    next();
                    const targets = [next().v]; while (isOp(',')) { next(); targets.push(next().v); }
                    if (!isKw('in')) throw err(); next();
                    const it = orExpr(); let cond = null; if (isKw('if')) { next(); cond = orExpr(); }
                    if (!isOp(']')) throw err(); next();
                    return (sc) => { const out = []; for (const v of iterOf(it(sc))) { const s2 = Object.create(sc); if (targets.length === 1) s2[targets[0]] = v; else iterOf(v).forEach((x, i) => { s2[targets[i]] = x; }); if (!cond || truthy(cond(s2))) out.push(first(s2)); } return out; };
                }
                const items = [first];
                while (isOp(',')) { next(); if (isOp(']')) break; items.push(ternary()); }
                if (!isOp(']')) throw err(); next();
                return (sc) => items.map(f => f(sc));
            }
            if (t.v === '{') {
                if (isOp('}')) { next(); return () => new Map(); }
                const first = ternary();
                if (isOp(':')) {
                    next(); const v1 = ternary();
                    if (isKw('for')) { next(); const k = next().v; let vn = null; if (isOp(',')) { next(); vn = next().v; } next(); const it = orExpr(); let cond = null; if (isKw('if')) { next(); cond = orExpr(); } next(); return (sc) => { const m = new Map(); for (const v of iterOf(it(sc))) { const s2 = Object.create(sc); if (vn) { const pair = iterOf(v); s2[k] = pair[0]; s2[vn] = pair[1]; } else s2[k] = v; if (!cond || truthy(cond(s2))) m.set(first(s2), v1(s2)); } return m; }; }
                    const pairs = [[first, v1]];
                    while (isOp(',')) { next(); if (isOp('}')) break; const k = ternary(); if (!isOp(':')) throw err(); next(); pairs.push([k, ternary()]); }
                    if (!isOp('}')) throw err(); next();
                    return (sc) => { const m = new Map(); for (const [k, v] of pairs) m.set(k(sc), v(sc)); return m; };
                }
                const items = [first];
                while (isOp(',')) { next(); if (isOp('}')) break; items.push(ternary()); }
                if (!isOp('}')) throw err(); next();
                return (sc) => new Set(items.map(f => f(sc)));
            }
            throw err();
        };
        const e = ternary();
        let result = e;
        if (isOp(',')) { const items = [e]; while (isOp(',')) { next(); if (p >= toks.length) break; items.push(ternary()); } result = (sc) => new PyTuple(items.map(f => f(sc))); }
        if (p < toks.length) throw err();
        return result;
    };

    const fstring = (body, line, interp) => {
        const parts = [];
        let i = 0, cur = '';
        while (i < body.length) {
            if (body[i] === '{' && body[i + 1] === '{') { cur += '{'; i += 2; continue; }
            if (body[i] === '}' && body[i + 1] === '}') { cur += '}'; i += 2; continue; }
            if (body[i] === '{') {
                let d = 1, j = i + 1;
                while (j < body.length && d) { if (body[j] === '{') d++; else if (body[j] === '}') d--; j++; }
                let inner = body.slice(i + 1, j - 1), spec = '';
                const cm = /^(.*?)(?<![=!<>])!?([rs])?:([^:\]]*)$/.exec(inner);
                const colon = inner.lastIndexOf(':');
                if (colon > 0 && !/[\[\](){}'"]/.test(inner.slice(colon + 1)) ) { spec = inner.slice(colon + 1); inner = inner.slice(0, colon); }
                let conv = '';
                const bm = /^(.*)!([rs])$/.exec(inner); if (bm) { inner = bm[1]; conv = bm[2]; }
                parts.push(cur); cur = '';
                parts.push({ e: parseExpr(tokenize(inner, line), line, interp), spec, conv });
                i = j; continue;
            }
            cur += body[i++];
        }
        parts.push(cur);
        return (sc) => parts.map(p => (typeof p === 'string' ? p : formatSpec(p.conv === 'r' ? repr(p.e(sc)) : p.conv === 's' ? str(p.e(sc)) : p.e(sc), p.spec))).join('');
    };

    const formatSpec = (v, spec) => {
        if (!spec) return str(v);
        const m = /^([<>^]?)(\+?)(0?)(\d*)(,?)(?:\.(\d+))?([sdfxXobeE%]?)$/.exec(spec);
        if (!m) return str(v);
        let [, align, , zero, width, comma, prec, type] = m;
        let s;
        if (type === 'f' || (prec !== undefined && type === '') && isNum(v)) s = fv(v).toFixed(prec === undefined ? 6 : parseInt(prec, 10));
        else if (type === 'd') s = num(v).toString();
        else if (type === 'x') s = num(v).toString(16); else if (type === 'X') s = num(v).toString(16).toUpperCase(); else if (type === 'o') s = num(v).toString(8); else if (type === 'b') s = num(v).toString(2);
        else if (type === 'e') s = fv(v).toExponential(prec === undefined ? 6 : parseInt(prec, 10)).replace(/e([+-])(\d)$/, 'e$10$2');
        else if (type === '%') s = (fv(v) * 100).toFixed(prec === undefined ? 6 : parseInt(prec, 10)) + '%';
        else s = str(v);
        if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const w = width ? parseInt(width, 10) : 0;
        const numeric = isNum(v);
        if (zero && numeric) return s.padStart(w, '0');
        if (align === '<' || (!align && !numeric)) return s.padEnd(w);
        if (align === '^') { const total = Math.max(0, w - s.length); return ' '.repeat(Math.floor(total / 2)) + s + ' '.repeat(total - Math.floor(total / 2)); }
        return s.padStart(w);
    };

    const arith = (op, a, b) => {
        if (op === '+') {
            if (typeof a === 'string' && typeof b === 'string') return a + b;
            if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
            if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple(a.items.concat(b.items));
        }
        if (op === '*') {
            if (typeof a === 'string' && isInt(num(b))) return b > 0 ? a.repeat(Number(num(b))) : '';
            if (isInt(num(a)) && typeof b === 'string') return a > 0 ? b.repeat(Number(num(a))) : '';
            if (Array.isArray(a) && isInt(num(b))) { let out = []; for (let i = 0; i < Number(num(b)); i++) out = out.concat(a); return out; }
        }
        if (op === '%' && typeof a === 'string') { let k = 0; const args = b instanceof PyTuple ? b.items : [b]; return a.replace(/%(-?\d*)(?:\.(\d+))?([sdifrx%])/g, (m, w, pr, t) => { if (t === '%') return '%'; const v = args[k++]; let s = t === 's' ? str(v) : t === 'r' ? repr(v) : t === 'x' ? num(v).toString(16) : t === 'f' ? fv(v).toFixed(pr === undefined ? 6 : parseInt(pr, 10)) : num(typeof v === 'string' ? BigInt(v) : v).toString(); if (w) s = parseInt(w, 10) < 0 ? s.padEnd(-parseInt(w, 10)) : s.padStart(parseInt(w, 10)); return s; }); }
        if (!isNum(a) || !isNum(b)) throw new PyError('TypeError', `unsupported operand type(s) for ${op}: '${typeName(a)}' and '${typeName(b)}'`);
        const bothInt = isInt(num(a)) && isInt(num(b));
        const x = num(a), y = num(b);
        switch (op) {
            case '+': return bothInt ? x + y : new PyFloat(fv(a) + fv(b));
            case '-': return bothInt ? x - y : new PyFloat(fv(a) - fv(b));
            case '*': return bothInt ? x * y : new PyFloat(fv(a) * fv(b));
            case '/': if (fv(b) === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return new PyFloat(fv(a) / fv(b));
            case '//': if (fv(b) === 0) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero'); if (bothInt) { let q = x / y; if ((x % y !== 0n) && ((x < 0n) !== (y < 0n))) q -= 1n; return q; } return new PyFloat(Math.floor(fv(a) / fv(b)));
            case '%': if (fv(b) === 0) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero'); if (bothInt) { return ((x % y) + y) % y; } { const m = fv(a) % fv(b); return new PyFloat(m !== 0 && (m < 0) !== (fv(b) < 0) ? m + fv(b) : m); }
            case '**': if (bothInt) { if (y >= 0n) return x ** y; return new PyFloat(Number(x) ** Number(y)); } return new PyFloat(fv(a) ** fv(b));
        }
        throw new PyError('TypeError', 'bad operands');
    };

    const index = (b, k) => {
        if (b instanceof Map) { for (const [kk, v] of b) if (eq(kk, k)) return v; throw new PyError('KeyError', repr(k)); }
        if (typeof b === 'string' || Array.isArray(b) || b instanceof PyTuple) {
            const arr = b instanceof PyTuple ? b.items : b;
            if (!isNum(k) || !isInt(num(k))) throw new PyError('TypeError', `${typeName(b)} indices must be integers or slices, not ${typeName(k)}`);
            let i = Number(num(k)); if (i < 0) i += arr.length;
            if (i < 0 || i >= arr.length) throw new PyError('IndexError', `${typeName(b)} index out of range`);
            return arr[i];
        }
        throw new PyError('TypeError', `'${typeName(b)}' object is not subscriptable`);
    };

    // ---- attribute access: str/list/dict methods and a few modules
    const bound = (name, fn) => ({ fn: true, name, call: fn });
    const getattr = (o, name, interp) => {
        if (o && o.module) { if (name in o.module) return o.module[name]; throw new PyError('AttributeError', `module '${o.name}' has no attribute '${name}'`); }
        if (typeof o === 'string') {
            const S = {
                upper: () => o.toUpperCase(), lower: () => o.toLowerCase(), title: () => o.replace(/\b\w/g, c => c.toUpperCase()).replace(/(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()), capitalize: () => o.charAt(0).toUpperCase() + o.slice(1).toLowerCase(), swapcase: () => Array.from(o).map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
                strip: (a) => (a.length ? o.replace(new RegExp(`^[${a[0].replace(/[\]\\^-]/g, '\\$&')}]+|[${a[0].replace(/[\]\\^-]/g, '\\$&')}]+$`, 'g'), '') : o.trim()), lstrip: () => o.replace(/^\s+/, ''), rstrip: () => o.replace(/\s+$/, ''),
                split: (a) => (a.length && a[0] !== null ? (a[1] !== undefined ? splitN(o, a[0], Number(num(a[1]))) : o.split(a[0])) : o.trim().split(/\s+/).filter(Boolean)), rsplit: (a) => (a.length ? o.split(a[0]) : o.trim().split(/\s+/).filter(Boolean)), splitlines: () => o.split(/\r?\n/).filter((x, i, arr) => !(i === arr.length - 1 && x === '')),
                join: (a) => iterOf(a[0]).map(x => { if (typeof x !== 'string') throw new PyError('TypeError', `sequence item 0: expected str instance, ${typeName(x)} found`); return x; }).join(o), replace: (a) => o.split(a[0]).join(a[1]),
                startswith: (a) => (a[0] instanceof PyTuple ? a[0].items.some(x => o.startsWith(x)) : o.startsWith(a[0])), endswith: (a) => (a[0] instanceof PyTuple ? a[0].items.some(x => o.endsWith(x)) : o.endsWith(a[0])),
                find: (a) => BigInt(o.indexOf(a[0])), rfind: (a) => BigInt(o.lastIndexOf(a[0])), index: (a) => { const i = o.indexOf(a[0]); if (i < 0) throw new PyError('ValueError', 'substring not found'); return BigInt(i); }, count: (a) => BigInt(o.split(a[0]).length - 1),
                isdigit: () => /^\d+$/.test(o), isalpha: () => /^[A-Za-z]+$/.test(o), isalnum: () => /^[A-Za-z0-9]+$/.test(o), isspace: () => /^\s+$/.test(o), isupper: () => o !== '' && o === o.toUpperCase() && o !== o.toLowerCase(), islower: () => o !== '' && o === o.toLowerCase() && o !== o.toUpperCase(),
                zfill: (a) => o.padStart(Number(num(a[0])), '0'), center: (a) => { const w = Number(num(a[0])), t = Math.max(0, w - o.length); return ' '.repeat(Math.floor(t / 2)) + o + ' '.repeat(t - Math.floor(t / 2)); }, ljust: (a) => o.padEnd(Number(num(a[0])), a[1] || ' '), rjust: (a) => o.padStart(Number(num(a[0])), a[1] || ' '),
                format: (a, kw) => { let k = 0; return o.replace(/\{([^}:!]*)(?::([^}]*))?\}/g, (m, n, sp) => formatSpec(n === '' ? a[k++] : /^\d+$/.test(n) ? a[parseInt(n, 10)] : (kw.find(x => x[0] === n) || [])[1], sp || '')); },
                encode: () => o, partition: (a) => { const i = o.indexOf(a[0]); return i < 0 ? new PyTuple([o, '', '']) : new PyTuple([o.slice(0, i), a[0], o.slice(i + a[0].length)]); }
            };
            if (S[name]) return bound(name, (a, kw) => S[name](a, kw));
        }
        if (Array.isArray(o)) {
            const L = {
                append: (a) => { o.push(a[0]); return null; }, extend: (a) => { o.push(...iterOf(a[0])); return null; }, insert: (a) => { o.splice(Number(num(a[0])), 0, a[1]); return null; }, pop: (a) => { if (!o.length) throw new PyError('IndexError', 'pop from empty list'); const i = a.length ? Number(num(a[0])) : o.length - 1; return o.splice(i < 0 ? o.length + i : i, 1)[0]; },
                remove: (a) => { const i = o.findIndex(x => eq(x, a[0])); if (i < 0) throw new PyError('ValueError', 'list.remove(x): x not in list'); o.splice(i, 1); return null; }, reverse: () => { o.reverse(); return null; }, sort: (a, kw) => { const rev = kw.find(x => x[0] === 'reverse'); const key = kw.find(x => x[0] === 'key'); const kf = key ? (x) => key[1].call([x], []) : (x) => x; o.sort((x, y) => (lt(kf(x), kf(y)) ? -1 : lt(kf(y), kf(x)) ? 1 : 0)); if (rev && truthy(rev[1])) o.reverse(); return null; },
                index: (a) => { const i = o.findIndex(x => eq(x, a[0])); if (i < 0) throw new PyError('ValueError', `${repr(a[0])} is not in list`); return BigInt(i); }, count: (a) => BigInt(o.filter(x => eq(x, a[0])).length), copy: () => o.slice(), clear: () => { o.length = 0; return null; }
            };
            if (L[name]) return bound(name, (a, kw) => L[name](a, kw));
        }
        if (o instanceof Map) {
            const D = {
                keys: () => [...o.keys()], values: () => [...o.values()], items: () => [...o.entries()].map(([k, v]) => new PyTuple([k, v])), get: (a) => { for (const [k, v] of o) if (eq(k, a[0])) return v; return a.length > 1 ? a[1] : null; },
                update: (a) => { for (const [k, v] of (a[0] instanceof Map ? a[0] : new Map())) o.set(k, v); return null; }, pop: (a) => { for (const [k, v] of o) if (eq(k, a[0])) { o.delete(k); return v; } if (a.length > 1) return a[1]; throw new PyError('KeyError', repr(a[0])); }, setdefault: (a) => { for (const [k, v] of o) if (eq(k, a[0])) return v; o.set(a[0], a[1] === undefined ? null : a[1]); return a[1] === undefined ? null : a[1]; }, copy: () => new Map(o), clear: () => { o.clear(); return null; }
            };
            if (D[name]) return bound(name, (a, kw) => D[name](a, kw));
        }
        if (o instanceof Set) {
            const T = { add: (a) => { o.add(a[0]); return null; }, remove: (a) => { o.delete(a[0]); return null; }, discard: (a) => { o.delete(a[0]); return null; }, union: (a) => new Set([...o, ...iterOf(a[0])]), intersection: (a) => new Set([...o].filter(x => iterOf(a[0]).includes(x))), difference: (a) => new Set([...o].filter(x => !iterOf(a[0]).includes(x))) };
            if (T[name]) return bound(name, (a) => T[name](a));
        }
        if (o instanceof PyFloat && name === 'is_integer') return bound(name, () => Number.isInteger(o.v));
        throw new PyError('AttributeError', `'${typeName(o)}' object has no attribute '${name}'`);
    };
    const splitN = (s, sep, n) => { const out = []; let rest = s; while (n-- > 0) { const i = rest.indexOf(sep); if (i < 0) break; out.push(rest.slice(0, i)); rest = rest.slice(i + sep.length); } out.push(rest); return out; };

    const callv = (f, args, kw, interp, sc) => {
        if (f && f.fn) return f.call(args, kw);
        if (typeof f === 'function') return f(args, kw);
        throw new PyError('TypeError', `'${typeName(f)}' object is not callable`);
    };

    class Interp {
        constructor(env, host) {
            this.env = env; this.host = host;
            const out = env.out;
            const B = this.builtins = {};
            const def = (n, f) => { B[n] = { fn: true, name: n, call: f }; };
            def('print', (a, kw) => { const sep = (kw.find(x => x[0] === 'sep') || [, ' '])[1], end = (kw.find(x => x[0] === 'end') || [, '\n'])[1]; out.push(a.map(str).join(sep) + end); return null; });
            def('len', (a) => { const x = a[0]; if (typeof x === 'string' || Array.isArray(x)) return BigInt(x.length); if (x instanceof PyTuple) return BigInt(x.items.length); if (x instanceof Map || x instanceof Set) return BigInt(x.size); throw new PyError('TypeError', `object of type '${typeName(x)}' has no len()`); });
            def('str', (a) => (a.length ? str(a[0]) : '')); def('repr', (a) => repr(a[0]));
            def('int', (a) => { const x = a[0]; if (x === undefined) return 0n; if (typeof x === 'string') { const base = a[1] ? Number(num(a[1])) : 10; const s = x.trim().replace(/_/g, ''); if (!(base === 10 ? /^[+-]?\d+$/ : /^[+-]?[0-9a-zA-Z]+$/).test(s)) throw new PyError('ValueError', `invalid literal for int() with base ${base}: ${repr(x)}`); return base === 10 ? BigInt(s) : BigInt(parseInt(s, base)); } if (x instanceof PyFloat) return BigInt(Math.trunc(x.v)); return num(x); });
            def('float', (a) => { const x = a[0]; if (x === undefined) return new PyFloat(0); if (typeof x === 'string') { const v = parseFloat(x); if (Number.isNaN(v) && !/nan/i.test(x)) throw new PyError('ValueError', `could not convert string to float: ${repr(x)}`); return new PyFloat(v); } return new PyFloat(fv(x)); });
            def('bool', (a) => truthy(a[0])); def('abs', (a) => (a[0] instanceof PyFloat ? new PyFloat(Math.abs(a[0].v)) : (num(a[0]) < 0n ? -num(a[0]) : num(a[0]))));
            def('list', (a) => (a.length ? iterOf(a[0]).slice() : [])); def('tuple', (a) => new PyTuple(a.length ? iterOf(a[0]).slice() : [])); def('set', (a) => new Set(a.length ? iterOf(a[0]) : []));
            def('dict', (a, kw) => { const m = new Map(); if (a.length) for (const p of iterOf(a[0])) { const q = iterOf(p); m.set(q[0], q[1]); } for (const [k, v] of kw) m.set(k, v); return m; });
            def('range', (a) => { const n = a.map(x => Number(num(x))); const [s, e, st] = n.length === 1 ? [0, n[0], 1] : [n[0], n[1], n[2] || 1]; const out2 = []; for (let i = s; st > 0 ? i < e : i > e; i += st) { out2.push(BigInt(i)); if (out2.length > 1e6) break; } return out2; });
            def('sum', (a) => iterOf(a[0]).reduce((x, y) => arith('+', x, y), a[1] !== undefined ? a[1] : 0n));
            def('min', (a) => { const items = a.length === 1 ? iterOf(a[0]) : a; if (!items.length) throw new PyError('ValueError', 'min() arg is an empty sequence'); return items.reduce((x, y) => (lt(y, x) ? y : x)); });
            def('max', (a) => { const items = a.length === 1 ? iterOf(a[0]) : a; if (!items.length) throw new PyError('ValueError', 'max() arg is an empty sequence'); return items.reduce((x, y) => (lt(x, y) ? y : x)); });
            def('sorted', (a, kw) => { const arr = iterOf(a[0]).slice(); const key = kw.find(x => x[0] === 'key'), rev = kw.find(x => x[0] === 'reverse'); const kf = key ? (x) => key[1].call([x], []) : (x) => x; arr.sort((x, y) => (lt(kf(x), kf(y)) ? -1 : lt(kf(y), kf(x)) ? 1 : 0)); if (rev && truthy(rev[1])) arr.reverse(); return arr; });
            def('reversed', (a) => iterOf(a[0]).slice().reverse()); def('enumerate', (a) => iterOf(a[0]).map((x, i) => new PyTuple([BigInt(i + (a[1] ? Number(num(a[1])) : 0)), x])));
            def('zip', (a) => { const its = a.map(iterOf); const n = Math.min(...its.map(x => x.length)); return Array.from({ length: n }, (_, i) => new PyTuple(its.map(x => x[i]))); });
            def('map', (a) => iterOf(a[1]).map(x => callv(a[0], [x], [], this))); def('filter', (a) => iterOf(a[1]).filter(x => (a[0] === null ? truthy(x) : truthy(callv(a[0], [x], [], this)))));
            def('any', (a) => iterOf(a[0]).some(truthy)); def('all', (a) => iterOf(a[0]).every(truthy));
            def('round', (a) => { const v = fv(a[0]); if (a.length > 1) { const d = Number(num(a[1])); const f = 10 ** d; return new PyFloat(Math.round(v * f) / f); } const r = Math.round(v); return BigInt(Math.abs(v % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r); });
            def('pow', (a) => arith('**', a[0], a[1])); def('divmod', (a) => new PyTuple([arith('//', a[0], a[1]), arith('%', a[0], a[1])]));
            def('chr', (a) => String.fromCodePoint(Number(num(a[0])))); def('ord', (a) => BigInt(a[0].codePointAt(0)));
            def('hex', (a) => '0x' + num(a[0]).toString(16)); def('bin', (a) => '0b' + num(a[0]).toString(2)); def('oct', (a) => '0o' + num(a[0]).toString(8));
            def('type', (a) => ({ fn: true, name: 'type', call: () => null, tn: typeName(a[0]), toString() { return `<class '${typeName(a[0])}'>`; } }));
            def('isinstance', (a) => { const names = (a[1] instanceof PyTuple ? a[1].items : [a[1]]).map(x => x && x.name); return names.includes(typeName(a[0])) || (names.includes('int') && typeof a[0] === 'boolean'); });
            def('input', (a) => { if (a.length) out.push(str(a[0])); return ''; });
            def('exit', (a) => { throw new Exit(a.length ? Number(num(a[0])) : 0); }); B.quit = B.exit;
            def('open', () => { throw new PyError('FileNotFoundError', "[Errno 2] No such file or directory"); });
            def('callable', (a) => !!(a[0] && a[0].fn)); def('id', () => 140234567890123n); def('hash', (a) => BigInt(Array.from(str(a[0])).reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)));
            for (const nm of ['int', 'str', 'float', 'list', 'dict', 'tuple', 'set', 'bool']) B[nm].name = nm;
            this.modules = {
                math: { module: { pi: new PyFloat(Math.PI), e: new PyFloat(Math.E), sqrt: bound('sqrt', (a) => { if (fv(a[0]) < 0) throw new PyError('ValueError', 'math domain error'); return new PyFloat(Math.sqrt(fv(a[0]))); }), floor: bound('floor', (a) => BigInt(Math.floor(fv(a[0])))), ceil: bound('ceil', (a) => BigInt(Math.ceil(fv(a[0])))), pow: bound('pow', (a) => new PyFloat(fv(a[0]) ** fv(a[1]))), log: bound('log', (a) => new PyFloat(a[1] ? Math.log(fv(a[0])) / Math.log(fv(a[1])) : Math.log(fv(a[0])))), log2: bound('log2', (a) => new PyFloat(Math.log2(fv(a[0])))), log10: bound('log10', (a) => new PyFloat(Math.log10(fv(a[0])))), sin: bound('sin', (a) => new PyFloat(Math.sin(fv(a[0])))), cos: bound('cos', (a) => new PyFloat(Math.cos(fv(a[0])))), tan: bound('tan', (a) => new PyFloat(Math.tan(fv(a[0])))), factorial: bound('factorial', (a) => { let r = 1n; for (let i = 2n; i <= num(a[0]); i++) r *= i; return r; }), gcd: bound('gcd', (a) => { let x = num(a[0]), y = num(a[1]); x = x < 0n ? -x : x; y = y < 0n ? -y : y; while (y) { [x, y] = [y, x % y]; } return x; }), fabs: bound('fabs', (a) => new PyFloat(Math.abs(fv(a[0])))) }, name: 'math' },
                sys: { module: { version: '3.9.18 (main, Jan  4 2024, 00:00:00) \n[GCC 11.4.1 20231218 (Red Hat 11.4.1-3)]', platform: 'linux', argv: [env.fname], version_info: new PyTuple([3n, 9n, 18n]), maxsize: 9223372036854775807n, exit: bound('exit', (a) => { throw new Exit(a.length ? Number(num(a[0])) : 0); }), path: ['', '/usr/lib64/python39.zip', '/usr/lib64/python3.9', '/usr/lib64/python3.9/lib-dynload', '/usr/lib64/python3.9/site-packages'], executable: '/usr/bin/python3' }, name: 'sys' },
                os: { module: { getcwd: bound('getcwd', () => host.fs.currentPath), getpid: bound('getpid', () => 4321n), getuid: bound('getuid', () => BigInt(host.fs.currentUid)), getlogin: bound('getlogin', () => host.fs.currentUser), listdir: bound('listdir', (a) => { const n = host.fs.getNode(host.fs.resolvePath(a.length ? a[0] : '.')); if (!n || !n.children) throw new PyError('FileNotFoundError', `[Errno 2] No such file or directory: ${repr(a[0] || '.')}`); return Object.keys(n.children); }), uname: bound('uname', () => new PyTuple(['Linux', host.parent.hostname, '5.14.0-362.8.1.el9_3.x86_64', '#1 SMP PREEMPT_DYNAMIC', 'x86_64'])), environ: new Map(Object.entries(host.parent.env || {})), sep: '/', linesep: '\n', name: 'posix', system: bound('system', (a) => { const r = host._exec(a[0], ''); out.push(r.out + r.err); return BigInt(r.rc); }), getenv: bound('getenv', (a) => ((host.parent.env || {})[a[0]] !== undefined ? host.parent.env[a[0]] : (a.length > 1 ? a[1] : null))), path: { module: { join: bound('join', (a) => a.join('/').replace(/\/+/g, '/')), exists: bound('exists', (a) => !!host.fs.getNode(host.fs.resolvePath(a[0]))), isfile: bound('isfile', (a) => { const n = host.fs.getNode(host.fs.resolvePath(a[0])); return !!n && n.type === 'file'; }), isdir: bound('isdir', (a) => { const n = host.fs.getNode(host.fs.resolvePath(a[0])); return !!n && n.type === 'directory'; }), basename: bound('basename', (a) => a[0].split('/').pop()), dirname: bound('dirname', (a) => a[0].replace(/\/[^/]*$/, '') || '/'), abspath: bound('abspath', (a) => host.fs.resolvePath(a[0])), splitext: bound('splitext', (a) => { const m = /^(.*?)(\.[^./]*)?$/.exec(a[0]); return new PyTuple([m[1], m[2] || '']); }) }, name: 'os.path' } }, name: 'os' },
                platform: { module: { system: bound('system', () => 'Linux'), node: bound('node', () => host.parent.hostname), release: bound('release', () => '5.14.0-362.8.1.el9_3.x86_64'), machine: bound('machine', () => 'x86_64'), python_version: bound('python_version', () => '3.9.18') }, name: 'platform' },
                socket: { module: { gethostname: bound('gethostname', () => host.parent.hostname) }, name: 'socket' },
                getpass: { module: { getuser: bound('getuser', () => host.fs.currentUser) }, name: 'getpass' },
                random: { module: { random: bound('random', () => new PyFloat(Math.random())), randint: bound('randint', (a) => BigInt(Math.floor(Math.random() * (Number(num(a[1])) - Number(num(a[0])) + 1)) + Number(num(a[0])))), choice: bound('choice', (a) => { const x = iterOf(a[0]); return x[Math.floor(Math.random() * x.length)]; }), shuffle: bound('shuffle', (a) => { for (let i = a[0].length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[0][i], a[0][j]] = [a[0][j], a[0][i]]; } return null; }), seed: bound('seed', () => null) }, name: 'random' },
                time: { module: { time: bound('time', () => new PyFloat(Date.now() / 1000)), sleep: bound('sleep', () => null), strftime: bound('strftime', (a) => host._fmt(host._now(), a[0])), ctime: bound('ctime', () => host._fmt(host._now(), '%a %b %e %H:%M:%S %Y')) }, name: 'time' },
                json: { module: { dumps: bound('dumps', (a, kw) => JSON.stringify(toJs(a[0]), null, (kw.find(x => x[0] === 'indent') || [])[1] !== undefined ? Number(num((kw.find(x => x[0] === 'indent') || [])[1])) : undefined).replace(/":/g, '": ').replace(/":  /g, '": ').replace(/,"/g, ', "')), loads: bound('loads', (a) => { try { return fromJs(JSON.parse(a[0])); } catch (e) { throw new PyError('json.decoder.JSONDecodeError', 'Expecting value: line 1 column 1 (char 0)'); } }) }, name: 'json' },
                datetime: { module: { datetime: { module: { now: bound('now', () => ({ module: { strftime: bound('strftime', (a) => host._fmt(host._now(), a[0])), year: BigInt(host._now().getFullYear()), isoformat: bound('isoformat', () => host._now().toISOString()) }, name: 'datetime' })), today: bound('today', () => ({ module: { strftime: bound('strftime', (a) => host._fmt(host._now(), a[0])) }, name: 'datetime' })) }, name: 'datetime' } }, name: 'datetime' },
                subprocess: { module: { run: bound('run', () => { throw new PyError('PermissionError', '[Errno 13] Permission denied'); }) }, name: 'subprocess' }
            };
        }
    }
    const toJs = (x) => { if (x === null) return null; if (typeof x === 'bigint') return Number(x); if (x instanceof PyFloat) return x.v; if (Array.isArray(x)) return x.map(toJs); if (x instanceof PyTuple) return x.items.map(toJs); if (x instanceof Map) return Object.fromEntries([...x.entries()].map(([k, v]) => [str(k), toJs(v)])); return x; };
    const fromJs = (x) => { if (x === null) return null; if (typeof x === 'number') return Number.isInteger(x) ? BigInt(x) : new PyFloat(x); if (Array.isArray(x)) return x.map(fromJs); if (typeof x === 'object') return new Map(Object.entries(x).map(([k, v]) => [k, fromJs(v)])); return x; };

    // ---- statements: indentation based
    const run = (code, env, host) => {
        const interp = new Interp(env, host);
        const rawLines = code.replace(/\r\n/g, '\n').split('\n');
        // join continuation lines inside brackets and after backslashes
        const lines = [];
        let buf = '', depth = 0, startLine = 0;
        rawLines.forEach((l, idx) => {
            const stripped = l.replace(/#.*$/, (m, off) => (/["']/.test(l.slice(0, off)) ? m : ''));
            if (!buf) startLine = idx + 1;
            buf += (buf ? ' ' : '') + (buf ? stripped.trim() : stripped.replace(/\s+$/, ''));
            for (const ch of stripped) { if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; }
            if (depth > 0 || /\\\s*$/.test(buf)) { buf = buf.replace(/\\\s*$/, ''); return; }
            lines.push({ text: buf, no: startLine });
            buf = ''; depth = 0;
        });
        const prog = lines.filter(l => l.text.trim() !== '');
        const globals = Object.create(null);
        const blocks = (start, indent, scope) => {
            let i = start;
            const stmts = [];
            while (i < prog.length) {
                const l = prog[i];
                const ind = l.text.match(/^\s*/)[0].length;
                if (ind < indent) break;
                if (ind > indent) throw new PyError('IndentationError', 'unexpected indent', l.no);
                const text = l.text.trim();
                const m = /^(if|elif|else|for|while|def|try|except|finally|with|class)\b(.*):\s*(.*)$/.exec(text);
                if (m && !/^(\w+\s*=)/.test(text) && (/:\s*$/.test(text) || m[3])) {
                    const kw = m[1];
                    let head = m[2].trim(), inline = m[3].trim();
                    if (kw === 'else' || kw === 'try' || kw === 'finally') { head = ''; }
                    let body;
                    let next = i + 1;
                    if (inline) { body = [{ simple: inline, no: l.no }]; }
                    else {
                        const childInd = next < prog.length ? prog[next].text.match(/^\s*/)[0].length : 0;
                        if (childInd <= indent) throw new PyError('IndentationError', `expected an indented block after '${kw}' statement on line ${l.no}`, l.no + 1);
                        const sub = blocks(next, childInd, scope);
                        body = sub.stmts; next = sub.end;
                    }
                    stmts.push({ kw, head, body, no: l.no });
                    i = next;
                    continue;
                }
                stmts.push({ simple: text, no: l.no });
                i++;
            }
            return { stmts, end: i };
        };
        const { stmts } = blocks(0, prog.length ? prog[0].text.match(/^\s*/)[0].length : 0);
        const evalE = (src, sc, no) => parseExpr(tokenize(src, no), no, interp)(sc);
        const assignTo = (target, value, sc, no) => {
            target = target.trim();
            if (/^[A-Za-z_]\w*$/.test(target)) { sc[target] = value; return; }
            if (/^\(.*\)$/.test(target) || target.includes(',')) { const names = target.replace(/^\(|\)$/g, '').split(',').map(s => s.trim()).filter(Boolean); const vals = iterOf(value); if (vals.length !== names.length) throw new PyError('ValueError', vals.length > names.length ? `too many values to unpack (expected ${names.length})` : `not enough values to unpack (expected ${names.length}, got ${vals.length})`, no); names.forEach((n, i) => assignTo(n, vals[i], sc, no)); return; }
            const sm = /^(.+)\[(.+)\]$/.exec(target);
            if (sm) { const base = evalE(sm[1], sc, no), key = evalE(sm[2], sc, no); if (Array.isArray(base)) { let k = Number(num(key)); if (k < 0) k += base.length; if (k < 0 || k >= base.length) throw new PyError('IndexError', 'list assignment index out of range', no); base[k] = value; } else if (base instanceof Map) { for (const kk of base.keys()) if (eq(kk, key)) { base.set(kk, value); return; } base.set(key, value); } else throw new PyError('TypeError', `'${typeName(base)}' object does not support item assignment`, no); return; }
            throw new PyError('SyntaxError', 'cannot assign to expression here', no);
        };
        const exec = (list, sc) => {
            let chainDone = false;
            for (let idx = 0; idx < list.length; idx++) {
                const s = list[idx];
                if (s.simple !== undefined || s.text !== undefined) {
                    const text = (s.simple !== undefined ? s.simple : s.text).trim();
                    for (const part of splitSemis(text)) execSimple(part.trim(), sc, s.no);
                    continue;
                }
                switch (s.kw) {
                    case 'if': {
                        let done = false;
                        if (truthy(evalE(s.head, sc, s.no))) { exec(s.body, sc); done = true; }
                        while (list[idx + 1] && (list[idx + 1].kw === 'elif' || list[idx + 1].kw === 'else')) { const nx = list[++idx]; if (done) continue; if (nx.kw === 'elif') { if (truthy(evalE(nx.head, sc, nx.no))) { exec(nx.body, sc); done = true; } } else { exec(nx.body, sc); done = true; } }
                        break;
                    }
                    case 'for': {
                        const m = /^(.+?)\s+in\s+(.+)$/.exec(s.head);
                        if (!m) throw new PyError('SyntaxError', 'invalid syntax', s.no);
                        const items = iterOf(evalE(m[2], sc, s.no));
                        let broke = false;
                        for (const v of items) { assignTo(m[1], v, sc, s.no); try { exec(s.body, sc); } catch (e) { if (e instanceof Break) { broke = true; break; } if (e instanceof Continue) continue; throw e; } }
                        if (!broke && list[idx + 1] && list[idx + 1].kw === 'else') exec(list[++idx].body, sc);
                        break;
                    }
                    case 'while': { let n = 0; while (truthy(evalE(s.head, sc, s.no))) { if (++n > 200000) throw new PyError('KeyboardInterrupt', ''); try { exec(s.body, sc); } catch (e) { if (e instanceof Break) break; if (e instanceof Continue) continue; throw e; } } break; }
                    case 'def': {
                        const m = /^(\w+)\s*\((.*)\)$/.exec(s.head);
                        if (!m) throw new PyError('SyntaxError', 'invalid syntax', s.no);
                        const params = m[2].split(',').map(x => x.trim()).filter(Boolean).map(x => { const [n, d] = x.split('='); return { n: n.trim(), d: d !== undefined ? parseExpr(tokenize(d, s.no), s.no, interp)(sc) : undefined }; });
                        const f = { fn: true, name: m[1], call: (args, kw) => { const s2 = Object.create(sc); params.forEach((p, i) => { const k = kw.find(x => x[0] === p.n); s2[p.n] = i < args.length ? args[i] : k ? k[1] : p.d; if (s2[p.n] === undefined) throw new PyError('TypeError', `${m[1]}() missing 1 required positional argument: '${p.n}'`); }); try { exec(s.body, s2); } catch (e) { if (e instanceof Return) return e.v; throw e; } return null; } };
                        sc[m[1]] = f;
                        break;
                    }
                    case 'try': {
                        const handlers = []; let fin = null;
                        while (list[idx + 1] && (list[idx + 1].kw === 'except' || list[idx + 1].kw === 'finally' || list[idx + 1].kw === 'else')) { const nx = list[++idx]; if (nx.kw === 'except') handlers.push(nx); else if (nx.kw === 'finally') fin = nx; }
                        try { exec(s.body, sc); } catch (e) {
                            if (!(e instanceof PyError)) throw e;
                            const h = handlers.find(hh => { const t = hh.head.replace(/\s+as\s+\w+$/, '').trim(); return !t || t === 'Exception' || t === 'BaseException' || t.split(/[,()\s]+/).filter(Boolean).includes(e.type); });
                            if (!h) throw e;
                            const as = /\s+as\s+(\w+)$/.exec(h.head); if (as) sc[as[1]] = e.message;
                            exec(h.body, sc);
                        } finally { if (fin) exec(fin.body, sc); }
                        break;
                    }
                    case 'elif': case 'else': case 'except': case 'finally': throw new PyError('SyntaxError', 'invalid syntax', s.no);
                    default: throw new PyError('SyntaxError', `${s.kw} statements are not supported in Red Cat's python3`, s.no);
                }
            }
        };
        const splitSemis = (t) => { const parts = []; let cur = '', q = null, d = 0; for (const ch of t) { if (q) { cur += ch; if (ch === q) q = null; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if ('([{'.includes(ch)) d++; if (')]}'.includes(ch)) d--; if (ch === ';' && d === 0) { parts.push(cur); cur = ''; } else cur += ch; } parts.push(cur); return parts.filter(x => x.trim()); };
        const execSimple = (text, sc, no) => {
            let m;
            if (text === 'pass') return;
            if (text === 'break') throw new Break();
            if (text === 'continue') throw new Continue();
            if ((m = /^return(?:\s+(.*))?$/.exec(text))) throw new Return(m[1] ? evalE(m[1], sc, no) : null);
            if ((m = /^import\s+(.+)$/.exec(text))) { for (const part of m[1].split(',')) { const [mod, as] = part.trim().split(/\s+as\s+/); const base = mod.split('.')[0]; if (!interp.modules[base]) throw new PyError('ModuleNotFoundError', `No module named '${base}'`, no); sc[as || base] = interp.modules[base]; } return; }
            if ((m = /^from\s+([\w.]+)\s+import\s+(.+)$/.exec(text))) { const mod = interp.modules[m[1].split('.')[0]]; if (!mod) throw new PyError('ModuleNotFoundError', `No module named '${m[1]}'`, no); for (const part of m[2].replace(/[()]/g, '').split(',')) { const [n, as] = part.trim().split(/\s+as\s+/); const v = n === '*' ? null : (mod.module[n]); if (v === undefined) throw new PyError('ImportError', `cannot import name '${n}' from '${m[1]}'`, no); sc[as || n] = v; } return; }
            if ((m = /^del\s+(.+)$/.exec(text))) { delete sc[m[1].trim()]; return; }
            if ((m = /^(?:global|nonlocal)\s+/.exec(text))) return;
            if ((m = /^assert\s+(.+)$/.exec(text))) { if (!truthy(evalE(m[1], sc, no))) throw new PyError('AssertionError', '', no); return; }
            if ((m = /^raise\s*(\w+)?(?:\((.*)\))?$/.exec(text))) { throw new PyError(m[1] || 'RuntimeError', m[2] ? str(evalE(m[2], sc, no)) : '', no); }
            const aug = /^(.+?)\s*(\*\*|\/\/|[-+*\/%])=\s*(.+)$/.exec(text);
            if (aug && !/[=!<>]=/.test(aug[1])) { assignTo(aug[1], arith(aug[2], evalE(aug[1], sc, no), evalE(aug[3], sc, no)), sc, no); return; }
            const eqIdx = findAssign(text);
            if (eqIdx > 0) {
                const targets = []; let rest = text;
                let idx2;
                while ((idx2 = findAssign(rest)) > 0) { targets.push(rest.slice(0, idx2)); rest = rest.slice(idx2 + 1); }
                const v = evalE(rest, sc, no);
                for (const t of targets) assignTo(t, v, sc, no);
                return;
            }
            evalE(text, sc, no);
        };
        const findAssign = (t) => { let q = null, d = 0; for (let k = 0; k < t.length; k++) { const ch = t[k]; if (q) { if (ch === q && t[k - 1] !== '\\') q = null; continue; } if (ch === '"' || ch === "'") { q = ch; continue; } if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) d--; else if (ch === '=' && d === 0 && t[k + 1] !== '=' && !'=!<>+-*/%'.includes(t[k - 1] || ' ') && !(t[k - 1] === ':' )) return k; } return -1; };
        const top = Object.create(null);
        exec(stmts, top);
    };
    return { run, PyError, Exit };
})();

if (typeof window !== 'undefined') {
    window.AppEngine3 = AppEngine3;
    window.PyMini = PyMini;
}
