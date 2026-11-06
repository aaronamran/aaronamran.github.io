// Console side of reboot, poweroff and emergency mode: shutdown and boot messages, login banner, power-off screen
// Part of Red Cat RHCSA Terminal Simulator
//
// The machine state is changed all at once by BootEngine (commands-boot.js); this file only plays the
// messages back, locks the keyboard while the machine "boots" and handles the emergency-mode password prompt.

Object.assign(Terminal.prototype, {
    bootEngine() { return this.commands._shared.boot; },

    // called by reboot, poweroff and friends while a line runs; the machine goes down once the line has finished
    queueBoot(info) {
        this.pendingBoot = info;
        return true;
    },

    runQueuedBoot() {
        const info = this.pendingBoot;
        this.pendingBoot = null;
        if (!info) return;
        const boot = this.bootEngine();
        const svc = this.commands._shared.svc;
        const S = this.commands._shared.services;
        this.booting = true;
        this.hideInputLine(true);
        this.scheduleSave();

        const lines = [];
        if (info.wall) lines.push({ t: 'text', s: `Broadcast message from root@${this.commands.hostname}: ${info.wall}` });
        if (!info.quick) {
            const names = Object.keys(S).filter(n => S[n].active && svc.svDefs[n] && svc.svDefs[n].desc).reverse().slice(0, 10);
            for (const n of names) lines.push({ t: 'ok', s: `Stopped ${svc.svDefs[n].desc}.` });
            lines.push({ t: 'ok', s: 'Unmounted /boot.' }, { t: 'ok', s: 'Reached target Unmount All Filesystems.' });
        }
        if (info.kind === 'reboot') {
            lines.push({ t: 'text', s: 'systemd-shutdown[1]: Sending SIGTERM to remaining processes...' }, { t: 'text', s: 'reboot: Restarting system' });
            this.play(lines, () => {
                const r = boot.bootMachine({});
                this.playBoot(r);
            });
        } else {
            lines.push({ t: 'text', s: info.kind === 'halt' ? 'reboot: System halted' : 'reboot: Power down' });
            this.play(lines, () => {
                boot.poweredOff = true;
                boot.history[boot.history.length - 1].end = new Date();
                this.showPoweredOff();
            });
        }
    },

    // prints console lines one after another
    play(lines, done) {
        const delay = this.bootDelay;
        const show = (l) => {
            if (l.t === 'ok') this.addOutput(`<span>[  <span class="success">OK</span>  ] ${this.escapeHtml(l.s)}</span>`);
            else if (l.t === 'fail') this.addOutput(`<span>[<span class="error">FAILED</span>] ${this.escapeHtml(l.s)}</span>`);
            else this.addOutput(`<span>${this.escapeHtml(l.s)}</span>`);
        };
        if (!delay) { lines.forEach(show); this.scrollToBottom(); done(); return; }
        // never slower than about four seconds for the whole log
        const step = Math.max(1, Math.min(delay, Math.floor(4000 / Math.max(1, lines.length))));
        let i = 0;
        this.bootSkip = false;
        const tick = () => {
            const burst = this.bootSkip ? lines.length : 1;
            for (let n = 0; n < burst && i < lines.length; n++) show(lines[i++]);
            this.scrollToBottom();
            if (i < lines.length) this.bootTimer = setTimeout(tick, step); else { this.bootTimer = null; done(); }
        };
        tick();
    },

    playBoot(result) {
        this.play(result.log, () => {
            if (result.emergency) { this.enterEmergency(); return; }
            this.finishBoot();
        });
    },

    loginBanner() {
        const host = this.commands.hostname;
        const svc = this.commands._shared.svc;
        const boot = this.bootEngine();
        this.addOutput('<span>&nbsp;</span>');
        this.addOutput('<span>Red Hat Enterprise Linux 9.3 (Plow)</span>');
        this.addOutput(`<span>Kernel ${this.escapeHtml(boot.kernel)} on an x86_64</span>`);
        this.addOutput('<span>&nbsp;</span>');
        this.addOutput(`<span>${this.escapeHtml(host)} login: root</span>`);
        const last = boot.history.length > 1 ? boot.history[boot.history.length - 2] : null;
        if (last && last.end) this.addOutput(`<span>Last login: ${this.escapeHtml(svc._loc(new Date(last.end.getTime() - 120000), '%a %b %e %H:%M:%S %Y'))} on tty1</span>`);
    },

    finishBoot() {
        this.booting = false;
        this.loginBanner();
        this.hideInputLine(false);
        this.historyIndex = this.history.length;
        this.updatePrompt();
        this.input.focus();
        this.scrollToBottom();
        this.saveSession();
    },

    hideInputLine(hide) {
        const line = document.querySelector('.input-line');
        if (line) line.style.display = hide ? 'none' : '';
        if (!hide && this.input) this.input.focus();
    },

    // ---------------------------------------------------------------- power off
    showPoweredOff() {
        this.booting = true;
        this.hideInputLine(true);
        this.addOutput('<span class="info">The machine is powered off. Press Enter to power it on.</span>');
        this.scrollToBottom();
        this.saveSession();
        if (this.powerKey) return;
        this.powerKey = (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            this.powerOn();
        };
        document.addEventListener('keydown', this.powerKey, true);
    },

    powerOn() {
        if (this.powerKey) { document.removeEventListener('keydown', this.powerKey, true); this.powerKey = null; }
        const boot = this.bootEngine();
        this.addOutput('<span>&nbsp;</span>');
        const r = boot.bootMachine({});
        this.playBoot(r);
    },

    // ---------------------------------------------------------------- emergency mode
    enterEmergency() {
        const boot = this.bootEngine();
        this.booting = false;
        this.hideInputLine(false);
        this.addOutput('<span>&nbsp;</span>');
        for (const f of boot.emergency.failed) this.addOutput(`<span>See 'systemctl status ${this.escapeHtml(this.mountUnit(f.tgt))}' for details.</span>`);
        this.addOutput('<span>You are in emergency mode. After logging in, type "journalctl -xb" to view</span>');
        this.addOutput('<span>system logs, "systemctl reboot" to reboot, "systemctl default" or "exit"</span>');
        this.addOutput('<span>to boot into default mode.</span>');
        this.askEmergencyPassword();
    },

    mountUnit(tgt) { return (tgt.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || '-') + '.mount'; },

    askEmergencyPassword(again) {
        if (again) this.addOutput('<span>Login incorrect</span>');
        this.addOutput('<span>Give root password for maintenance</span>');
        this.beginInput({
            mode: 'line', prompt: '(or press Control-D to continue): ', secret: true,
            onEof: () => { this.addOutput('<span>&nbsp;</span>'); this.leaveEmergency(); }
        }, (pw) => {
            const sess = this.commands._shared.session;
            if (pw === null) { this.askEmergencyPassword(false); return; }
            if (sess && sess._pwOk && !sess._pwOk('root', pw)) { this.askEmergencyPassword(true); return; }
            this.updatePrompt();
            this.saveSession();
        });
    },

    // "exit", Ctrl-D, systemctl default: carry on booting
    leaveEmergency() {
        const boot = this.bootEngine();
        if (!boot.emergency) return;
        if (this.inputMode) this.endInput();
        this.addOutput('<span>&nbsp;</span>');
        this.booting = true;
        this.hideInputLine(true);
        this.playBoot(boot.resumeBoot());
    },

    // page loaded while the machine was powered off or in emergency mode
    resumeAfterLoad() {
        const boot = this.bootEngine();
        if (!boot) return;
        if (boot.poweredOff) this.showPoweredOff();
        else if (boot.emergency) this.enterEmergency();
    }
});

// delay in ms between console lines; 0 prints everything at once (tests)
Object.defineProperty(Terminal.prototype, 'bootDelay', {
    get() { return this._bootDelay === undefined ? 14 : this._bootDelay; },
    set(v) { this._bootDelay = v; }
});
