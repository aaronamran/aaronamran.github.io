/**
 * Boot Simulator Modal - Section 19: Root Password Reset
 *
 * Simulates a full RHEL boot sequence:
 *   Shutdown → GRUB Menu → GRUB Editor → Boot Animation → Emergency Shell → Reboot
 *
 * Each stage maps to one or more section-19 tasks. Task completion is
 * reported back to app.js via the onTaskComplete / onAllComplete callbacks.
 */
class BootSimulator {
    constructor(options) {
        this.tasks            = options.tasks;            // bootModal task objects (ids 2-8)
        this.completedTaskIds = options.completedTaskIds || [];
        this.onTaskComplete   = options.onTaskComplete;   // fn(taskId, explanation)
        this.onAllComplete    = options.onAllComplete;    // fn() when all done

        // currentBootTaskIndex = index into this.tasks for the next task to complete
        this.currentBootTaskIndex = this.tasks.findIndex(t => !this.completedTaskIds.includes(t.id));
        if (this.currentBootTaskIndex < 0) this.currentBootTaskIndex = this.tasks.length;

        this.overlay      = null;
        this.screen       = null;
        this.stage        = null;
        this.grubTimer    = null;
        this.grubCountdown = 5;
        this.chrootActive = false;
        this.shellInputEl = null;
        this.shellOutputEl = null;
        this.keyHandler   = null;
        this.shellBuffer  = '';
        this.passwdStep   = 0;    // 0=inactive, 1=awaiting new pw, 2=awaiting confirm
        this.passwdActive = false;
        this.passwdEntry1 = '';
        this.passwdTask   = null;

        // ── Configurable per section ────────────────────────────────────────
        this.appendCommand   = options.appendCommand   || 'rd.break';
        this.initialPrompt   = options.initialPrompt   || 'switch_root:/# ';
        this.grubVersion     = options.grubVersion     || '2.06';
        this.grubTitle       = options.grubTitle       || 'Red Hat Enterprise Linux (5.14.0-503.14.1.el9_5.x86_64) 9.5 (Plow)';
        this.grubRescue      = options.grubRescue      || 'Red Hat Enterprise Linux (0-rescue-2b3c4d) 9.5 (Plow)';
        this.grubEditorLines = options.grubEditorLines || null;
        this.bootMessages    = options.bootMessages    || null;
        this.shellIntro      = options.shellIntro      || null;
        this.chrootTaskId    = options.chrootTaskId    !== undefined ? options.chrootTaskId : 5;
    }

    // ── Entry ─────────────────────────────────────────────────────────────────

    open() {
        this.injectStyles();
        this.createOverlay();

        const cur = this.currentTask;

        if (!cur) {
            // All tasks already done — just close immediately
            this.close();
            this.onAllComplete && this.onAllComplete();
            return;
        }

        // Resume at the right stage if some tasks were already completed
        if (cur.id >= 4)      { this.showEmergencyShell(); }
        else if (cur.id === 3) { this.showGrubEditor(); }
        else                   { this.startShutdownAnimation(); }
    }

    get currentTask() {
        return this.tasks[this.currentBootTaskIndex] || null;
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    injectStyles() {
        if (document.getElementById('boot-simulator-styles')) return;
        const style = document.createElement('style');
        style.id = 'boot-simulator-styles';
        style.textContent = `
            @keyframes boot-blink { 0%,100%{opacity:1} 50%{opacity:0} }
            @keyframes boot-shake {
                0%,100%{transform:translateX(0)}
                20%,60%{transform:translateX(-4px)}
                40%,80%{transform:translateX(4px)}
            }
            #boot-simulator-screen { box-sizing:border-box; }
            #boot-simulator-screen *{ box-sizing:border-box; }
            .boot-cursor {
                display:inline-block;
                width:8px; height:13px;
                background:#ccc;
                vertical-align:middle;
                margin-left:1px;
                animation: boot-blink 1s step-end infinite;
            }
            .boot-shell-input:focus { outline:none; }
            .shell-cursor {
                animation: boot-blink 1s step-end infinite;
            }
            .grub-cursor {
                display:inline-block;
                background:#aaa;
                color:#000;
                min-width:0.6em;
                animation: boot-blink 1s step-end infinite;
            }
            .boot-task-badge {
                display:inline-block;
                background:#3a0000;
                border:1px solid #800;
                color:#f66;
                font-size:11px;
                padding:2px 7px;
                border-radius:3px;
                font-family:monospace;
            }
        `;
        document.head.appendChild(style);
    }

    // ── DOM ───────────────────────────────────────────────────────────────────

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'boot-simulator-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed', top: '0', left: '0',
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.25)',
            display: 'flex', justifyContent: 'flex-end',
            alignItems: 'center', paddingRight: '2%',
            zIndex: '10000',
            pointerEvents: 'none'
        });

        this.screen = document.createElement('div');
        this.screen.id = 'boot-simulator-screen';
        Object.assign(this.screen.style, {
            background: '#000',
            border: '2px solid #2a2a2a',
            borderRadius: '6px',
            width: '65%', maxWidth: '960px', height: '90vh',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'Courier New', Consolas, monospace",
            fontSize: '13px', lineHeight: '1.4',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(180,0,0,0.25), 0 8px 32px rgba(0,0,0,0.9)',
            pointerEvents: 'auto'
        });

        this.overlay.appendChild(this.screen);
        document.body.appendChild(this.overlay);
    }

    setScreen(html) {
        if (this.screen) this.screen.innerHTML = html;
    }

    // ── Stage 1: Shutdown Animation ───────────────────────────────────────────

    startShutdownAnimation() {
        this.stage = 'shutdown';
        const lines = [
            '<span style="color:#666">         Stopping <em>OpenSSH Server Daemon</em>...</span>',
            '<span style="color:#666">         Stopping <em>Postfix Mail Transport Agent</em>...</span>',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Stopped <em>OpenSSH Server Daemon</em>.',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Stopped <em>Postfix Mail Transport Agent</em>.',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Stopped <em>NetworkManager</em>.',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Reached target <em>Unmount All Filesystems</em>.',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Reached target <em>Late Shutdown Services</em>.',
            '<span style="color:#4a4">[  <b>OK</b>  ]</span> Finished <em>System Reboot</em>.',
            '',
            '<span style="color:#fff">         Rebooting.</span>'
        ];

        this.setScreen(`<div id="boot-out" style="padding:16px;flex:1;overflow-y:auto;color:#888;"></div>`);
        const out = this.screen.querySelector('#boot-out');

        let i = 0;
        const next = () => {
            if (i < lines.length) {
                const d = document.createElement('div');
                d.innerHTML = lines[i++];
                out.appendChild(d);
                setTimeout(next, 100);
            } else {
                // Brief blank screen, then GRUB
                setTimeout(() => { this.setScreen(''); setTimeout(() => this.showGrubMenu(), 400); }, 400);
            }
        };
        next();
    }

    // ── Stage 2: GRUB Menu ───────────────────────────────────────────────────

    showGrubMenu() {
        this.stage = 'grub-menu';
        this.grubCountdown = 5;
        if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }

        this.setScreen(`
            <div style="background:#000;color:#fff;padding:16px 20px;
                        flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                    <div style="text-align:center;font-size:14px;margin-bottom:20px;letter-spacing:2px;">
                        GNU GRUB&nbsp;&nbsp;version ${this.grubVersion}
                    </div>
                    <div style="border:1px solid #555;padding:6px 0;margin:0 2px;min-height:130px;">
                        <div style="background:#1a72c0;color:#fff;padding:4px 10px;">
                            ▶&nbsp; ${this.escapeHtml(this.grubTitle)}
                        </div>
                        <div style="color:#aaa;padding:4px 10px;">
                            &nbsp;&nbsp;&nbsp; ${this.escapeHtml(this.grubRescue)}
                        </div>
                    </div>
                    <div style="margin-top:14px;color:#aaa;font-size:12px;line-height:1.8;">
                        <div>Use the ↑ and ↓ keys to change the selection.</div>
                        <div>Press 'enter' to boot the selected OS, <strong style="color:#fff">'e'</strong> to edit the commands
                             before booting, or 'c' for a command line.</div>
                    </div>
                </div>
                <div>
                    <div style="color:#aaa;font-size:12px;">
                        The highlighted entry will be executed automatically in
                        <span id="grub-cd" style="color:#ff9;font-weight:bold;">5</span>s
                    </div>
                </div>
            </div>
        `);

        // Countdown resets; user must press 'e'
        if (this.grubTimer) clearInterval(this.grubTimer);
        this.grubTimer = setInterval(() => {
            this.grubCountdown--;
            const el = document.getElementById('grub-cd');
            if (el) {
                if (this.grubCountdown <= 0) { this.grubCountdown = 5; }
                el.textContent = this.grubCountdown;
            }
        }, 1000);

        this.keyHandler = (e) => {
            if (this.stage !== 'grub-menu') return;
            if (e.key !== 'e' && e.key !== 'E') return;
            e.preventDefault(); e.stopPropagation();

            if (this.grubTimer) { clearInterval(this.grubTimer); this.grubTimer = null; }
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;

            // Complete task 2 if pending
            if (this.currentBootTaskIndex === 0) {
                const t = this.tasks[0];
                this.onTaskComplete(t.id, t.explanation);
                this.currentBootTaskIndex = 1;
            }
            this.showGrubEditor();
        };
        document.addEventListener('keydown', this.keyHandler);
    }

    // ── Stage 3: GRUB Editor ─────────────────────────────────────────────────

    showGrubEditor() {
        this.stage = 'grub-editor';
        if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }

        const defaultEditorLines = [
            'load_video',
            'set gfxpayload=keep',
            'insmod gzio',
            'insmod part_gpt',
            'insmod xfs',
            "set root='hd0,gpt2'",
            "search --no-floppy --label --set=root 'boot'",
            "echo 'Loading Red Hat Enterprise Linux...'",
            'linux   /vmlinuz-5.14.0-503.14.1.el9_5.x86_64 root=/dev/mapper/rhel-root ro resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet',
            'initrd /initramfs-5.14.0-503.14.1.el9_5.x86_64.img'
        ];
        this.editorLines = this.grubEditorLines ? [...this.grubEditorLines] : [...defaultEditorLines];
        this.editorCursor = { line: 0, col: 0 };

        this.setScreen(`
            <div style="background:#000;color:#ccc;flex:1;display:flex;flex-direction:column;
                        font-family:'Courier New',Consolas,monospace;font-size:13px;height:100%;
                        overflow:hidden;padding:10px 14px 6px;">
                <div style="flex:1;border:2px solid #bbb;overflow:hidden;display:flex;flex-direction:column;margin-bottom:75px;">
                    <div id="grub-editor-body"
                         tabindex="0"
                         style="flex:1;overflow-y:auto;overflow-x:hidden;
                                padding:8px 10px;line-height:1.7;outline:none;
                                white-space:pre-wrap;word-break:break-word;cursor:default;">
                    </div>
                </div>
                <div style="color:#ccc;font-size:12px;line-height:1.6;">
                    Minimal BASH-like line editing is supported. TAB lists completions.<br>
                    ESC discards edits and returns to menu. CTRL-X starts the boot.
                </div>
            </div>
        `);

        const body = document.getElementById('grub-editor-body');

        const render = () => {
            const { line: curLine, col: curCol } = this.editorCursor;
            let html = '';
            this.editorLines.forEach((lineText, li) => {
                if (li === curLine) {
                    const before = this.escapeHtml(lineText.slice(0, curCol));
                    const ch = lineText[curCol];
                    const curSpan = ch !== undefined
                        ? `<span class="grub-cursor">${this.escapeHtml(ch)}</span>`
                        : `<span class="grub-cursor">&nbsp;</span>`;
                    const after = this.escapeHtml(lineText.slice(curCol + (ch !== undefined ? 1 : 0)));
                    html += `<div>${before}${curSpan}${after}</div>`;
                } else {
                    html += `<div>${this.escapeHtml(lineText) || '&nbsp;'}</div>`;
                }
            });
            body.innerHTML = html;
        };

        render();
        body.focus();

        const tryBoot = () => {
            const linuxLine = this.editorLines.find(l => /^linux[\s(]/.test(l));
            if (!linuxLine || !linuxLine.includes(this.appendCommand)) {
                body.style.animation = 'boot-shake 0.3s ease';
                setTimeout(() => { body.style.animation = ''; }, 400);
                return;
            }
            if (this.currentBootTaskIndex === 1) {
                const t = this.tasks[1];
                this.onTaskComplete(t.id, t.explanation);
                this.currentBootTaskIndex = 2;
            }
            this.showBootAnimation();
        };

        this.keyHandler = (e) => {
            if (this.stage !== 'grub-editor') return;

            const cur = this.editorCursor;
            const lines = this.editorLines;

            if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
                e.preventDefault(); e.stopPropagation();
                tryBoot();
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault(); e.stopPropagation();
                this.showGrubMenu();
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (cur.col > 0) cur.col--;
                else if (cur.line > 0) { cur.line--; cur.col = lines[cur.line].length; }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (cur.col < lines[cur.line].length) cur.col++;
                else if (cur.line < lines.length - 1) { cur.line++; cur.col = 0; }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cur.line > 0) { cur.line--; cur.col = Math.min(cur.col, lines[cur.line].length); }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (cur.line < lines.length - 1) { cur.line++; cur.col = Math.min(cur.col, lines[cur.line].length); }
            } else if (e.key === 'Home') {
                e.preventDefault();
                cur.col = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                cur.col = lines[cur.line].length;
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                if (cur.col > 0) {
                    lines[cur.line] = lines[cur.line].slice(0, cur.col - 1) + lines[cur.line].slice(cur.col);
                    cur.col--;
                }
            } else if (e.key === 'Delete') {
                e.preventDefault();
                if (cur.col < lines[cur.line].length) {
                    lines[cur.line] = lines[cur.line].slice(0, cur.col) + lines[cur.line].slice(cur.col + 1);
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                lines[cur.line] = lines[cur.line].slice(0, cur.col) + e.key + lines[cur.line].slice(cur.col);
                cur.col++;
            } else {
                return;
            }

            render();
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    // ── Stage 4: Boot Animation ───────────────────────────────────────────────

    showBootAnimation() {
        this.stage = 'booting';
        if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }

        const defaultMsgs = [
            `[    0.000000] Linux version 5.14.0-503.14.1.el9_5.x86_64`,
            `[    0.123456] Command line: BOOT_IMAGE=/vmlinuz... ${this.appendCommand}`,
            `[    1.024500] dracut: starting initramfs transition`,
            `[    2.134800] [  OK  ] Started dracut pre-pivot hook.`,
            `[    2.156200] [  OK  ] Reached target Switch Root.`,
            this.appendCommand === 'rd.break'
                ? `[*] dracut: rd.break: break before switch_root`
                : `[*] Kernel: executing init=${this.appendCommand}`,
            ``,
        ];
        const msgs = (this.bootMessages || defaultMsgs).map(m => this.escapeHtml(m));

        this.setScreen(`
            <div id="boot-anim-out"
                 style="padding:14px;flex:1;overflow-y:auto;background:#000;
                        color:#aaa;font-size:12px;font-family:monospace;"></div>
        `);
        const out = document.getElementById('boot-anim-out');

        let i = 0;
        const next = () => {
            if (i < msgs.length) {
                const d = document.createElement('div');
                d.innerHTML = msgs[i++];
                out.appendChild(d);
                out.scrollTop = out.scrollHeight;
                setTimeout(next, i < 3 ? 120 : 300);
            } else {
                setTimeout(() => this.showEmergencyShell(), 600);
            }
        };
        next();
    }

    // ── Stage 5: Emergency Shell ──────────────────────────────────────────────

    showEmergencyShell() {
        this.stage = 'emergency-shell';
        if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }

        const completedIds = this.completedTaskIds.concat(
            this.tasks.slice(0, this.currentBootTaskIndex).map(t => t.id)
        );
        if (this.chrootTaskId !== null && completedIds.includes(this.chrootTaskId)) this.chrootActive = true;

        this.shellBuffer  = '';
        this.passwdStep   = 0;
        this.passwdActive = false;
        this.passwdEntry1 = '';
        this.passwdTask   = null;

        this.setScreen(`
            <div id="shell-wrap"
                 tabindex="0"
                 style="background:#000;color:#ccc;flex:1;overflow-y:auto;
                        padding:10px 14px;line-height:1.7;outline:none;cursor:text;
                        font-family:'Courier New',Consolas,monospace;font-size:13px;">
            </div>
        `);

        this.shellOutputEl = document.getElementById('shell-wrap');

        const defaultIntro = [
            `[    5.124832] dracut: rd.break: break before switch_root`,
            `Generating "/run/initramfs/rdsosreport.txt"`,
            ``,
            `Entering emergency mode. Exit the shell to continue.`,
            `Type "journalctl" to view system logs.`,
            ``,
        ];
        const intro = this.shellIntro || defaultIntro;
        intro.forEach(line => this.appendLine(this.escapeHtml(line)));
        this.appendInputLine();

        this.shellOutputEl.addEventListener('click', () => this.shellOutputEl.focus());

        this.keyHandler = (e) => {
            if (this.stage !== 'emergency-shell') return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                const raw = this.passwdActive ? this.shellBuffer : this.shellBuffer.trim();
                this.freezeInputLine();
                this.shellBuffer = '';
                if (this.passwdActive) {
                    this.handlePasswdInput(raw);
                } else if (raw) {
                    this.handleShellCommand(raw);
                } else {
                    this.appendInputLine();
                }
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                if (this.shellBuffer.length > 0) {
                    this.shellBuffer = this.shellBuffer.slice(0, -1);
                    this.updateInputLine();
                }
            } else if (e.key.length === 1) {
                e.preventDefault();
                this.shellBuffer += e.key;
                this.updateInputLine();
            }
        };

        document.addEventListener('keydown', this.keyHandler);
        setTimeout(() => this.shellOutputEl.focus(), 60);
    }

    updatePrompt() {
        // prompt is read live by appendInputLine(); no DOM element to update
    }

    appendLine(html) {
        if (!this.shellOutputEl) return;
        const d = document.createElement('div');
        d.innerHTML = html;
        const inputLine = document.getElementById('shell-input-line');
        if (inputLine) this.shellOutputEl.insertBefore(d, inputLine);
        else           this.shellOutputEl.appendChild(d);
        this.shellOutputEl.scrollTop = this.shellOutputEl.scrollHeight;
    }

    appendInputLine(customPrompt) {
        if (!this.shellOutputEl) return;
        const prompt = customPrompt !== undefined
            ? customPrompt
            : (this.chrootActive ? 'sh-5.1# ' : this.initialPrompt);
        const displayBuf = this.passwdActive
            ? ''
            : this.escapeHtml(this.shellBuffer);
        const line = document.createElement('div');
        line.id = 'shell-input-line';
        line.innerHTML = `${this.escapeHtml(prompt)}<span id="shell-buf">${displayBuf}</span><span class="shell-cursor">_</span>`;
        this.shellOutputEl.appendChild(line);
        this.shellOutputEl.scrollTop = this.shellOutputEl.scrollHeight;
    }

    updateInputLine() {
        const buf = document.getElementById('shell-buf');
        if (buf) buf.textContent = this.passwdActive
            ? ''
            : this.shellBuffer;
        if (this.shellOutputEl) this.shellOutputEl.scrollTop = this.shellOutputEl.scrollHeight;
    }

    freezeInputLine() {
        const line = document.getElementById('shell-input-line');
        if (!line) return;
        line.removeAttribute('id');
        const cursor = line.querySelector('.shell-cursor');
        if (cursor) cursor.remove();
        const buf = line.querySelector('#shell-buf');
        if (buf) { const t = buf.textContent; buf.replaceWith(document.createTextNode(t)); }
    }

    // legacy alias used by startFinalReboot
    print(html) { this.appendLine(html); }

    // ── Shell Command Handling ────────────────────────────────────────────────

    handleShellCommand(raw) {
        const tokens  = raw.trim().split(/\s+/);
        const command = tokens[0];

        const task = this.currentTask;
        if (!task) return;

        if (this.validateShellCommand(raw, task)) {
            this.handleCorrectCommand(raw, command, tokens, task);
        } else {
            this.handleWrongCommand(command, raw, task);
        }
    }

    validateShellCommand(input, task) {
        if (!task.expected) return false;
        const tokens  = input.trim().split(/\s+/);
        const command = tokens[0];

        for (const exp of task.expected) {
            if (exp.command !== command) continue;

            const flagsOk = !exp.requiredFlags || !exp.requiredFlags.length ||
                exp.requiredFlags.every(f => tokens.includes(f));

            const valsOk = !exp.requiredValues || !exp.requiredValues.length ||
                exp.requiredValues.every(v => tokens.includes(v) || input.includes(v));

            if (flagsOk && valsOk) return true;
        }
        return false;
    }

    handleCorrectCommand(raw, command, tokens, task) {
        // passwd requires a multi-step password confirmation flow
        if (command === 'passwd') {
            this.appendLine(`Changing password for user root.`);
            this.passwdTask   = task;
            this.passwdStep   = 1;
            this.passwdEntry1 = '';
            this.passwdActive = true;
            this.appendInputLine('New password: ');
            return;
        }

        const out = this.getCommandOutput(command, raw);
        if (out !== null && out !== undefined) this.appendLine(out);

        if (command === 'chroot') {
            this.chrootActive = true;
        }
        if (command === 'exit' && this.chrootActive) {
            // First exit: leave chroot, back to switch_root
            this.chrootActive = false;
            this.appendLine(`exit`);
            this.appendInputLine();
            return;
        }
        if (command === 'exit' && !this.chrootActive) {
            // Second exit: leave switch_root, complete task and reboot
            this.onTaskComplete(task.id, task.explanation);
            this.currentBootTaskIndex++;
            if (!this.currentTask) this.startFinalReboot();
            else this.appendInputLine();
            return;
        }

        this.onTaskComplete(task.id, task.explanation);
        this.currentBootTaskIndex++;

        if (!this.currentTask) {
            this.startFinalReboot();
        } else {
            this.appendInputLine();
        }
    }

    handlePasswdInput(raw) {
        if (this.passwdStep === 1) {
            if (raw.length < 6) {
                this.appendLine(`BAD PASSWORD: The password is shorter than 6 characters`);
                this.appendInputLine('New password: ');
                return;
            }
            this.passwdEntry1 = raw;
            this.passwdStep   = 2;
            this.appendInputLine('Retype new password: ');
            return;
        }
        if (this.passwdStep === 2) {
            if (raw !== this.passwdEntry1) {
                this.appendLine(`Sorry, passwords do not match.`);
                this.appendLine(`New password updated was NOT successful.`);
                this.passwdStep   = 1;
                this.passwdEntry1 = '';
                this.appendInputLine('New password: ');
                return;
            }
            this.passwdStep   = 0;
            this.passwdActive = false;
            this.appendLine(`passwd: all authentication tokens updated successfully.`);
            const task = this.passwdTask;
            this.passwdTask = null;
            this.onTaskComplete(task.id, task.explanation);
            this.currentBootTaskIndex++;
            if (!this.currentTask) this.startFinalReboot();
            else this.appendInputLine();
        }
    }

    getCommandOutput(command, input) {
        return null;
    }

    handleWrongCommand(command, raw, task) {
        const knownCmds = ['mount','chroot','passwd','touch','exit','ls','cat','journalctl','pwd','echo','id','whoami','sync','reboot'];
        if (!knownCmds.includes(command)) {
            this.appendLine(`bash: ${this.escapeHtml(command)}: command not found`);
        } else if (command === 'mount') {
            this.appendLine(`mount: bad usage`);
        } else if (command === 'chroot') {
            const arg = raw.trim().split(/\s+/)[1] || '';
            this.appendLine(`chroot: cannot change root directory to '${this.escapeHtml(arg)}': No such file or directory`);
        } else if (command === 'passwd') {
            const arg = raw.trim().split(/\s+/)[1];
            if (arg && arg !== 'root') this.appendLine(`passwd: Unknown user name '${this.escapeHtml(arg)}'.`);
            else this.appendLine(`passwd: Authentication token manipulation error`);
        } else if (command === 'touch') {
            this.appendLine(`touch: cannot touch '${this.escapeHtml(raw.trim().split(/\s+/).slice(1).join(' '))}': No such file or directory`);
        } else if (command === 'sync') {
            // sync always runs silently
        } else {
            this.appendLine(`${this.escapeHtml(command)}: invalid usage`);
        }
        this.appendInputLine();
    }

    // ── Stage 6: Final Reboot ─────────────────────────────────────────────────

    startFinalReboot() {
        this.stage = 'rebooting';
        this.print('');
        this.print(`[   12.004512] systemd[1]: Reached target Switch Root.`);
        this.print(`[   12.005123] systemd[1]: Starting Switch Root...`);
        this.print(`[   12.006401] systemd[1]: Switching root.`);

        setTimeout(() => {
            if (this.screen) {
                this.screen.style.transition = 'opacity 1.2s ease';
                this.screen.style.opacity    = '0';
            }
        }, 2200);

        setTimeout(() => {
            this.close();
            this.onAllComplete && this.onAllComplete();
        }, 3600);
    }

    // ── Utilities ──────────────────────────────────────────────────────────────

    close() {
        if (this.grubTimer) { clearInterval(this.grubTimer); this.grubTimer = null; }
        if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }
        if (this.overlay && this.overlay.parentNode) { this.overlay.remove(); }
        this.overlay = null;
        this.screen  = null;
    }

    escapeHtml(t) {
        return String(t)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}
