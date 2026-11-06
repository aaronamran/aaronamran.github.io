/** Red Cat - Section 8: Systemd & Processes */

function generateSection8Output(command, input, tokens) {
    const set = getQuestionSetForSection(appState.currentSectionId);
    // set1: httpd / multi-user.target
    // set2: sshd / graphical.target
    const svc = set === 2 ? 'sshd' : 'httpd';
    const target = set === 2 ? 'graphical.target' : 'multi-user.target';

    const progress = appState.sectionProgress[appState.currentSectionId];
    const done = progress ? progress.completedTasks : [];

    // systemctl start|stop|restart|reload|enable|disable
    if (command === 'systemctl') {
        // start
        if (input.includes('start ') && (input.includes(svc) || input.includes('httpd') || input.includes('sshd'))) {
            return null; // silent success
        }

        // stop
        if (input.includes('stop ') && (input.includes(svc) || input.includes('httpd') || input.includes('sshd'))) {
            return null;
        }

        // restart
        if (input.includes('restart ')) {
            return null;
        }

        // reload
        if (input.includes('reload ') && !input.includes('daemon-reload')) {
            return null;
        }

        // daemon-reload
        if (input.includes('daemon-reload')) {
            return null;
        }

        // enable
        if (input.includes('enable ') && !input.includes('--now')) {
            const unit = tokens[2] || svc;
            const name = unit.replace('.service', '');
            return `Created symlink /etc/systemd/system/multi-user.target.wants/${name}.service → /usr/lib/systemd/system/${name}.service.`;
        }

        // disable
        if (input.includes('disable ')) {
            const unit = tokens[2] || svc;
            const name = unit.replace('.service', '');
            return `Removed /etc/systemd/system/multi-user.target.wants/${name}.service.`;
        }

        // status <svc>
        if (input.includes('status ') && input.includes(svc)) {
            const isActive = set === 1 ? done.includes(1) : !done.includes(1);
            const state = isActive ? 'active (running)' : 'inactive (dead)';
            const isEnabled = set === 1 ? done.includes(3) : !done.includes(3);
            const enabledStr = isEnabled ? 'enabled' : 'disabled';
            const pid = svc === 'httpd' ? 1234 : 1098;
            return `● ${svc}.service - ${svc === 'httpd' ? 'The Apache HTTP Server' : 'OpenSSH server daemon'}\n   Loaded: loaded (/usr/lib/systemd/system/${svc}.service; ${enabledStr}; vendor preset: disabled)\n   Active: ${state} since Mon 2026-04-07 08:00:00 EST; 2h 15min ago\n Main PID: ${pid} (${svc})\n   CGroup: /system.slice/${svc}.service\n           └─${pid} /usr/sbin/${svc}`;
        }

        // status chronyd
        if (input.includes('status') && input.includes('chronyd')) {
            return '● chronyd.service - NTP client/server\n   Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:05 EST; 2h 14min ago\n Main PID: 1105 (chronyd)\n   CGroup: /system.slice/chronyd.service\n           └─1105 /usr/sbin/chronyd -F 2';
        }

        // status firewalld
        if (input.includes('status') && input.includes('firewalld')) {
            return '● firewalld.service - firewalld - dynamic firewall daemon\n   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:02 EST; 2h 14min ago\n Main PID: 1090 (firewalld)\n   CGroup: /system.slice/firewalld.service\n           └─1090 /usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid';
        }

        // is-active
        if (input.includes('is-active')) {
            if (input.includes(svc)) {
                const isActive = set === 1 ? done.includes(1) : !done.includes(1);
                return isActive ? 'active' : 'inactive';
            }
            if (input.includes('chronyd')) return 'active';
            return 'inactive';
        }

        // is-enabled
        if (input.includes('is-enabled')) {
            if (input.includes(svc)) {
                const isEnabled = set === 1 ? done.includes(3) : !done.includes(3);
                return isEnabled ? 'enabled' : 'disabled';
            }
            return 'enabled';
        }

        // set-default
        if (input.includes('set-default')) {
            if (input.includes('multi-user.target')) {
                return 'Removed /etc/systemd/system/default.target.\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/multi-user.target.';
            }
            if (input.includes('graphical.target')) {
                return 'Removed /etc/systemd/system/default.target.\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/graphical.target.';
            }
        }

        // get-default
        if (input.includes('get-default')) {
            const hasSetDefault = set === 1 ? done.includes(5) : done.includes(5);
            return hasSetDefault ? target : (set === 1 ? 'graphical.target' : 'multi-user.target');
        }

        // list-units --type=service
        if (input.includes('list-units') && input.includes('service')) {
            return 'UNIT                          LOAD   ACTIVE SUB     DESCRIPTION\nchronyd.service               loaded active running NTP client/server\ncrond.service                 loaded active running Command Scheduler\nfirewalld.service             loaded active running firewalld - dynamic firewall daemon\nhttpd.service                 loaded active running The Apache HTTP Server\nNetworkManager.service        loaded active running Network Manager\nsshd.service                  loaded active running OpenSSH server daemon\ntuned.service                 loaded active running Dynamic System Tuning Daemon\n\nLEGEND: LOAD   = Reflects whether the unit definition was properly loaded.\n        ACTIVE = The high-level unit activation state.\n        SUB    = The low-level unit activation state.';
        }

        // --failed
        if (input.includes('--failed') || (input.includes('list-units') && input.includes('--failed'))) {
            return '  UNIT LOAD ACTIVE SUB DESCRIPTION\n0 loaded units listed.';
        }

        // list-dependencies
        if (input.includes('list-dependencies')) {
            const unit = tokens[2] || 'default.target';
            return `${unit}\n● ├─chronyd.service\n● ├─crond.service\n● ├─firewalld.service\n● ├─httpd.service\n● ├─NetworkManager.service\n● ├─sshd.service\n● └─basic.target\n●   ├─selinux-policy-migrate-local-changes@targeted.service\n●   └─paths.target`;
        }

        // cat <unit>.service
        if (input.includes('cat ') && input.includes('.service')) {
            const unitName = tokens.find(t => t.endsWith('.service')) || `${svc}.service`;
            return `# /usr/lib/systemd/system/${unitName}\n[Unit]\nDescription=${unitName === 'httpd.service' ? 'The Apache HTTP Server' : 'OpenSSH server daemon'}\nAfter=network.target\n\n[Service]\nType=notify\nExecStart=/usr/sbin/${svc}\nExecReload=/bin/kill -HUP $MAINPID\nKillMode=mixed\nPrivateTmp=true\n\n[Install]\nWantedBy=multi-user.target`;
        }
    }

    // firewall-cmd --reload (valid for section 8 task 8/set2)
    if (command === 'firewall-cmd' && input.includes('--reload')) {
        return 'success';
    }

    // journalctl -u <svc> -b
    if (command === 'journalctl') {
        // -b current boot
        if (input.includes('-b') && !input.includes('-u') && !input.includes('--since')) {
            return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:00:01 localhost systemd[1]: Starting The Apache HTTP Server...\nApr 07 08:00:01 localhost httpd[1234]: AH00558: httpd: Could not reliably determine the server\'s fully qualified domain name\nApr 07 08:00:01 localhost systemd[1]: Started The Apache HTTP Server.\nApr 07 08:00:05 localhost systemd[1]: Starting NTP client/server...\nApr 07 08:00:05 localhost chronyd[1105]: chronyd version 4.3 starting (+CMDMON +NTP +REFCLOCK +RTC +PRIVDROP +SCFILTER +SIGND +ASYNCDNS +NTS +SECHASH +IPV6 +DEBUG)';
        }

        // -u <svc> [-b]
        if (input.includes('-u')) {
            const unitArg = tokens[tokens.indexOf('-u') + 1] || svc;
            return `-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:00:01 localhost systemd[1]: Starting ${unitArg}...\nApr 07 08:00:01 localhost ${unitArg.replace('.service', '')}[1234]: Server started\nApr 07 08:00:01 localhost systemd[1]: Started ${unitArg}.\nApr 07 10:00:00 localhost systemd[1]: ${unitArg}: Scheduled restart job, restart counter is at 0.`;
        }

        // -p err
        if (input.includes('-p')) {
            return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:01:15 localhost kernel: ACPI BIOS Error (bug): AE_NOT_FOUND\nApr 07 08:01:17 localhost NetworkManager[965]: [ERR] Could not find device enp0s3\nApr 07 09:45:22 localhost sssd[1321]: [ERR] Failed to read configuration file';
        }

        // general journalctl
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:00:00 localhost systemd-journal[211]: Runtime Journal\nApr 07 08:00:01 localhost systemd[1]: Starting system initialization...\nApr 07 08:00:05 localhost kernel: Linux version 5.14.0-362.el9.x86_64\nApr 07 08:00:07 localhost NetworkManager[965]: Starting NetworkManager-1.44.0-3.el9';
    }

    // readlink /etc/systemd/system/default.target
    if (command === 'readlink' && input.includes('default.target')) {
        const hasSetDefault = done.includes(5);
        return hasSetDefault
            ? `/usr/lib/systemd/system/${target}`
            : `/usr/lib/systemd/system/${set === 1 ? 'graphical.target' : 'multi-user.target'}`;
    }

    // ls -l /etc/systemd/system/default.target
    if (command === 'ls' && input.includes('-l') && input.includes('default.target')) {
        const hasSetDefault = done.includes(5);
        const tgt = hasSetDefault ? target : (set === 1 ? 'graphical.target' : 'multi-user.target');
        return `lrwxrwxrwx. 1 root root 37 Apr  7 08:00 /etc/systemd/system/default.target -> /usr/lib/systemd/system/${tgt}`;
    }

    return null;
}

function generateSection8PreCheck(task, command, input, tokens) {
    const set = getQuestionSetForSection(appState.currentSectionId);
    const svc = set === 2 ? 'sshd' : 'httpd';

    // Pre-check: service status before start/stop
    if (command === 'systemctl' && input.includes('status') && input.includes(svc)) {
        const defaultState = set === 1 ? 'inactive (dead)' : 'active (running)';
        const defaultEnabled = set === 1 ? 'disabled' : 'enabled';
        const pid = svc === 'httpd' ? 1234 : 1098;
        return `● ${svc}.service - ${svc === 'httpd' ? 'The Apache HTTP Server' : 'OpenSSH server daemon'}\n   Loaded: loaded (/usr/lib/systemd/system/${svc}.service; ${defaultEnabled}; vendor preset: disabled)\n   Active: ${defaultState}`;
    }

    // Pre-check: is-enabled before enable/disable
    if (command === 'systemctl' && input.includes('is-enabled') && input.includes(svc)) {
        return set === 1 ? 'disabled' : 'enabled';
    }

    // Pre-check: get-default before set-default
    if (command === 'systemctl' && input.includes('get-default')) {
        return set === 1 ? 'graphical.target' : 'multi-user.target';
    }

    // Pre-check: chronyd status before restart
    if (command === 'systemctl' && input.includes('status') && input.includes('chronyd')) {
        return '● chronyd.service - NTP client/server\n   Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:05 EST; 2h 14min ago\n Main PID: 1105 (chronyd)';
    }

    // Pre-check: firewalld status before reload
    if (command === 'systemctl' && input.includes('status') && input.includes('firewalld')) {
        return '● firewalld.service - firewalld - dynamic firewall daemon\n   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:02 EST; 2h 14min ago\n Main PID: 1090 (firewalld)';
    }

    return null;
}
/** Red Cat - Section 8 */

