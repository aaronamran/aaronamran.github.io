/** Red Cat - Section 9: System Tuning & Analysis */

// Profile per set
const _s9profiles = { 1: 'throughput-performance', 2: 'virtual-guest', 3: 'balanced' };

function generateSection9Output(command, input, tokens) {
    const set = getQuestionSetForSection(appState.currentSectionId);
    const profile = _s9profiles[set] || 'throughput-performance';
    const progress = appState.sectionProgress[appState.currentSectionId];
    const done = progress ? progress.completedTasks : [];

    // dnf -y install tuned
    if (command === 'dnf' && input.includes('install') && input.includes('tuned')) {
        return 'Last metadata expiration check: 0:05:12 ago on Mon Apr  7 08:00:00 2026.\nDependencies resolved.\n================================================================================\n Package           Architecture  Version              Repository       Size\n================================================================================\nInstalling:\n tuned             noarch        2.21.0-1.el9         baseos           279 k\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 279 k\nInstalled size: 921 k\nDownloading Packages:\ntuned-2.21.0-1.el9.noarch.rpm               469 kB/s | 279 kB     00:00\n--------------------------------------------------------------------------------\nTotal                                        469 kB/s | 279 kB     00:00\nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1\n  Installing       : tuned-2.21.0-1.el9.noarch                             1/1\n  Running scriptlet: tuned-2.21.0-1.el9.noarch                             1/1\n  Verifying        : tuned-2.21.0-1.el9.noarch                             1/1\n\nInstalled:\n  tuned-2.21.0-1.el9.noarch\n\nComplete!';
    }

    // rpm -q tuned (check if installed)
    if (command === 'rpm' && input.includes('-q') && input.includes('tuned')) {
        return done.includes(1) ? 'tuned-2.21.0-1.el9.noarch' : 'package tuned is not installed';
    }

    // dnf list tuned
    if (command === 'dnf' && input.includes('list') && input.includes('tuned')) {
        return done.includes(1)
            ? 'Installed Packages\ntuned.noarch   2.21.0-1.el9   @baseos'
            : 'Available Packages\ntuned.noarch   2.21.0-1.el9   baseos';
    }

    // systemctl enable [--now] tuned
    if (command === 'systemctl' && input.includes('enable') && input.includes('tuned')) {
        return 'Created symlink /etc/systemd/system/multi-user.target.wants/tuned.service → /usr/lib/systemd/system/tuned.service.';
    }

    // systemctl start tuned
    if (command === 'systemctl' && input.includes('start') && input.includes('tuned')) {
        return null; // silent
    }

    // systemctl is-enabled tuned
    if (command === 'systemctl' && input.includes('is-enabled') && input.includes('tuned')) {
        return done.includes(2) ? 'enabled' : 'disabled';
    }

    // systemctl status tuned
    if (command === 'systemctl' && input.includes('status') && input.includes('tuned')) {
        const isRunning = done.includes(1) || done.includes(2);
        return isRunning
            ? `● tuned.service - Dynamic System Tuning Daemon\n   Loaded: loaded (/usr/lib/systemd/system/tuned.service; enabled; vendor preset: disabled)\n   Active: active (running) since Mon 2026-04-07 08:05:00 EST; 2h 20min ago\n Main PID: 1401 (tuned)\n   CGroup: /system.slice/tuned.service\n           └─1401 /usr/bin/python3 -Es /usr/sbin/tuned -l -P`
            : `● tuned.service - Dynamic System Tuning Daemon\n   Loaded: loaded (/usr/lib/systemd/system/tuned.service; disabled; vendor preset: disabled)\n   Active: inactive (dead)`;
    }

    // tuned-adm list
    if (command === 'tuned-adm' && input.includes('list')) {
        return 'Available profiles:\n- accelerator-performance     - Throughput performance based tuning with disabled higher latency STOP states\n- balanced                     - General non-specialized tuned profile\n- desktop                      - Optimize for the desktop use-case\n- hpc-compute                  - Optimize for HPC compute workloads\n- intel-sst                    - Configure for Intel Speed Select Base Frequency\n- latency-performance          - Optimize for deterministic performance at the cost of increased power consumption\n- network-latency              - Optimize for deterministic performance at the cost of increased power consumption, focused on low latency network performance\n- network-throughput           - Optimize for streaming network throughput, generally only necessary on older CPUs or 40G+ networks\n- optimize-serial-console      - Optimize for serial console use\n- powersave                    - A placeholder\n- throughput-performance       - Broadly applicable tuning that provides excellent performance across a variety of common server workloads\n- virtual-guest                - Optimize the settings for the virtual guest\n- virtual-host                 - Optimize the settings for the virtual host\nCurrent active profile: ' + (done.includes(4) ? profile : 'balanced');
    }

    // tuned-adm active
    if (command === 'tuned-adm' && input.includes('active')) {
        return `Current active profile: ${done.includes(4) ? profile : 'balanced'}`;
    }

    // tuned-adm profile <name>
    if (command === 'tuned-adm' && input.includes('profile') && !input.includes('active')) {
        const targetProfile = tokens[2] || profile;
        return `Switching to profile '${targetProfile}'\nSwitched to profile '${targetProfile}'`;
    }

    // tuned-adm recommend
    if (command === 'tuned-adm' && input.includes('recommend')) {
        return 'virtual-guest';
    }

    // mkdir /var/log/journal
    if (command === 'mkdir' && input.includes('/var/log/journal')) {
        return null; // silent success
    }

    // ls -ld /var/log/journal
    if (command === 'ls' && input.includes('/var/log/journal')) {
        if (!done.includes(6)) {
            return 'ls: cannot access \'/var/log/journal\': No such file or directory';
        }
        return 'drwxr-sr-x. 2 root systemd-journal 4096 Apr  7 10:20 /var/log/journal';
    }

    // journalctl --disk-usage
    if (command === 'journalctl' && input.includes('--disk-usage')) {
        return 'Archived and active journals take up 144.0M in the file system.';
    }

    // journalctl -p err
    if (command === 'journalctl' && (input.includes('-p') || input.includes('--priority'))) {
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:01:15 localhost kernel: ACPI BIOS Error (bug): AE_NOT_FOUND\nApr 07 08:01:17 localhost NetworkManager[965]: [ERR] Could not find device enp0s3\nApr 07 09:45:22 localhost sssd[1321]: [ERR] Failed to read configuration file';
    }

    // journalctl -u sshd
    if (command === 'journalctl' && (input.includes('-u') || input.includes('--unit'))) {
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:00:02 localhost systemd[1]: Starting OpenSSH server daemon...\nApr 07 08:00:02 localhost sshd[1098]: Server listening on 0.0.0.0 port 22.\nApr 07 08:00:02 localhost sshd[1098]: Server listening on :: port 22.\nApr 07 08:00:02 localhost systemd[1]: Started OpenSSH server daemon.\nApr 07 09:15:30 localhost sshd[3421]: Accepted publickey for root from 192.168.1.10 port 54321 ssh2';
    }

    // journalctl --since yesterday
    if (command === 'journalctl' && (input.includes('--since') || input.includes('yesterday'))) {
        return '-- Logs begin at Sun 2026-04-06 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 06 08:00:01 localhost systemd[1]: Starting system initialization...\nApr 06 08:00:05 localhost kernel: Linux version 5.14.0-362.el9.x86_64\nApr 06 12:30:00 localhost crond[8851]: (student) CMD (/home/student/scripts/backup.sh)\nApr 06 23:59:59 localhost systemd[1]: Stopping system...\nApr 07 08:00:01 localhost systemd[1]: Starting system initialization...';
    }

    // journalctl -n 50 -f
    if (command === 'journalctl' && (input.includes('-n') || input.includes('-f'))) {
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 10:28:01 localhost crond[9301]: (root) CMD (run-parts /etc/cron.hourly)\nApr 07 10:28:15 localhost sshd[3501]: Accepted publickey for root from 192.168.1.10\nApr 07 10:29:00 localhost NetworkManager[965]: Connectivity is now \'full\'\nApr 07 10:29:30 localhost systemd[1]: tuned.service: Scheduled restart job\nApr 07 10:30:00 localhost kernel: NET: Registered PF_UNIX/PF_LOCAL protocol family';
    }

    // generic journalctl
    if (command === 'journalctl') {
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:30:00 EST. --\nApr 07 08:00:00 localhost systemd-journal[211]: Runtime Journal\nApr 07 08:00:01 localhost systemd[1]: Starting system initialization...\nApr 07 08:00:05 localhost kernel: Linux version 5.14.0-362.el9.x86_64';
    }

    return null;
}

function generateSection9PreCheck(task, command, input, tokens) {
    const set = getQuestionSetForSection(appState.currentSectionId);
    const profile = _s9profiles[set] || 'throughput-performance';

    // pre-check: rpm -q tuned before installing
    if (command === 'rpm' && input.includes('-q') && input.includes('tuned')) {
        return 'package tuned is not installed';
    }

    // pre-check: systemctl status tuned before enable
    if (command === 'systemctl' && input.includes('status') && input.includes('tuned')) {
        return '● tuned.service - Dynamic System Tuning Daemon\n   Loaded: loaded (/usr/lib/systemd/system/tuned.service; disabled; vendor preset: disabled)\n   Active: inactive (dead)';
    }

    // pre-check: is-enabled before enable
    if (command === 'systemctl' && input.includes('is-enabled') && input.includes('tuned')) {
        return 'disabled';
    }

    // pre-check: active profile before switching
    if (command === 'tuned-adm' && input.includes('active')) {
        return 'Current active profile: balanced';
    }

    // pre-check: ls /var/log/journal (not created yet)
    if (command === 'ls' && input.includes('/var/log/journal')) {
        return "ls: cannot access '/var/log/journal': No such file or directory";
    }

    // pre-check: disk-usage before mkdir
    if (command === 'journalctl' && input.includes('--disk-usage')) {
        return 'Archived and active journals take up 8.0M in the file system.';
    }

    return null;
}
