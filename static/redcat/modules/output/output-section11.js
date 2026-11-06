/** Red Cat - Section 11: Network Security */

function generateSection11Output(command, input, tokens) {
    // firewall-cmd --get-active-zones
    if (command === 'firewall-cmd' && input.includes('--get-active-zones')) {
        return 'public\n  interfaces: ens160';
    }

    // firewall-cmd --get-default-zone
    if (command === 'firewall-cmd' && input.includes('--get-default-zone')) {
        return 'public';
    }

    // firewall-cmd --set-default-zone
    if (command === 'firewall-cmd' && input.includes('--set-default-zone')) {
        return 'success';
    }

    // firewall-cmd --list-all
    if (command === 'firewall-cmd' && input.includes('--list-all')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const hasHttp = done.includes(3);
        const hasHttps = done.includes(5);
        const has8080 = done.includes(6);
        const services = ['cockpit', 'dhcpv6-client', 'ssh', hasHttp ? 'http' : null, hasHttps ? 'https' : null].filter(Boolean).join(' ');
        const ports = has8080 ? '8080/tcp' : '';
        return `public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: ${services}\n  ports: ${ports}\n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:`;
    }

    // firewall-cmd --list-services
    if (command === 'firewall-cmd' && input.includes('--list-services')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const hasHttp = done.includes(3);
        const hasHttps = done.includes(5);
        return ['cockpit', 'dhcpv6-client', 'ssh', hasHttp ? 'http' : null, hasHttps ? 'https' : null].filter(Boolean).join(' ');
    }

    // firewall-cmd --list-ports
    if (command === 'firewall-cmd' && input.includes('--list-ports')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        return done.includes(6) ? '8080/tcp' : '';
    }

    // firewall-cmd --add-service
    if (command === 'firewall-cmd' && input.includes('--add-service')) {
        return 'success';
    }

    // firewall-cmd --remove-service
    if (command === 'firewall-cmd' && input.includes('--remove-service')) {
        return 'success';
    }

    // firewall-cmd --add-port
    if (command === 'firewall-cmd' && input.includes('--add-port')) {
        return 'success';
    }

    // firewall-cmd --remove-port
    if (command === 'firewall-cmd' && input.includes('--remove-port')) {
        return 'success';
    }

    // firewall-cmd --reload
    if (command === 'firewall-cmd' && input.includes('--reload')) {
        return 'success';
    }

    // firewall-cmd --add-rich-rule / --list-rich-rules / --remove-rich-rule
    if (command === 'firewall-cmd' && input.includes('rich-rule')) {
        if (input.includes('--list-rich-rules')) {
            return 'rule family="ipv4" source address="192.168.2.0/24" service name="ssh" accept';
        }
        return 'success';
    }

    // systemctl status firewalld
    if (command === 'systemctl' && input.includes('status') && input.includes('firewalld')) {
        return '● firewalld.service - firewalld - dynamic firewall daemon\n   Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:00 EST; 2h 15min ago\n     Docs: man:firewalld(1)\n Main PID: 1090 (firewalld)\n   CGroup: /system.slice/firewalld.service\n           └─1090 /usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid';
    }

    // systemctl enable/start/stop/restart firewalld
    if (command === 'systemctl' && input.includes('firewalld')) {
        return null; // silent success
    }

    return null;
}

function generateSection11PreCheck(task, command, input, tokens) {
    // Task 3: HTTP not in firewall yet
    if (task.id === 3) {
        if (command === 'firewall-cmd' && input.includes('--list-all')) {
            return 'public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: cockpit dhcpv6-client ssh\n  ports: \n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:';
        }
        if (command === 'firewall-cmd' && input.includes('--list-services')) {
            return 'cockpit dhcpv6-client ssh';
        }
    }

    // Task 6: port 8080 not added yet
    if (task.id === 6) {
        if (command === 'firewall-cmd' && input.includes('--list-all')) {
            return 'public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: cockpit dhcpv6-client http ssh\n  ports: \n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:';
        }
        if (command === 'firewall-cmd' && input.includes('--list-ports')) {
            return '';
        }
    }

    return null;
}
