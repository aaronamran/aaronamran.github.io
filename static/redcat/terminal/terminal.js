// Terminal Controller - Main logic for RHCSA Practice Terminal

class Terminal {
    constructor() {
        this.fs = new VirtualFilesystem();
        this.commands = new RHCSACommands(this.fs);
        this.history = [];

        // the machine survives refreshes and closed tabs: what changed since a fresh boot is kept in localStorage
        this.world = new WorldState(this);
        this.world.markPristine();

        this.historyIndex = -1;
        this.output = document.getElementById('output');
        this.input = document.getElementById('commandInput');
        this.prompt = document.getElementById('prompt');

        // Exam mode state
        this.examMode = false;
        this.examTimeRemaining = 3 * 60 * 60; // 3 hours in seconds
        this.examTimer = null;
        this.selectedScenario = null;

        this.restoreSession();
        this.init();
        this.setupSessionPersistence();
        this.resumeAfterLoad();
    }

    init() {
        // Set up event listeners
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearTerminal();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('Reset filesystem? All changes will be lost.')) {
                this.resetFilesystem();
            }
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.executeCommand('help');
        });

        // Keep terminal scrolled to bottom
        this.input.addEventListener('input', () => this.scrollToBottom());

        // Focus input when clicking anywhere in terminal
        document.getElementById('terminal').addEventListener('click', () => {
            this.input.focus();
        });

        // Global keyboard shortcuts for copy/paste
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+C - Copy selected text from terminal output
            if (e.key === 'C' && e.ctrlKey && e.shiftKey) {
                const selection = window.getSelection();
                if (selection.toString().length > 0) {
                    e.preventDefault();
                    navigator.clipboard.writeText(selection.toString()).then(() => {
                        console.log('Copied to clipboard');
                    }).catch(err => {
                        console.error('Failed to copy:', err);
                    });
                }
            }
            // Ctrl+Shift+V is handled in the input's keydown handler
        });

        // Update prompt
        this.updatePrompt();

        // Show welcome message if output is empty (first load)
        if (this.output.innerHTML.trim() === '' || this.output.innerHTML.includes('<!-- Welcome message will be added by JavaScript -->')) {
            this.showWelcomeMessage();
        }

        // Scroll to bottom on page load to show input line
        // Use multiple attempts to ensure it works after all rendering is complete
        this.scrollToBottom();
        setTimeout(() => this.scrollToBottom(), 0);
        setTimeout(() => this.scrollToBottom(), 50);
        setTimeout(() => this.scrollToBottom(), 200);

        // Also scroll on window load event (belt and suspenders)
        window.addEventListener('load', () => {
            setTimeout(() => this.scrollToBottom(), 100);
        });
    }

    setupScenarioHandlers() {
        const modal = document.getElementById('scenarioModal');
        const cancelBtn = document.getElementById('cancelScenario');
        const scenarioBtns = document.querySelectorAll('.scenario-btn');

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // Scenario selection buttons
        scenarioBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const scenario = btn.getAttribute('data-scenario');
                this.startExamWithScenario(scenario);
                modal.classList.remove('active');
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    showScenarioSelection() {
        if (this.examMode) {
            this.stopExamMode();
            return;
        }

        const modal = document.getElementById('scenarioModal');
        modal.classList.add('active');
    }

    showWelcomeMessage() {
        // Detect mobile (portrait mode)
        const isMobile = window.matchMedia('(max-aspect-ratio: 1/1)').matches;

        if (isMobile) {
            // Mobile-friendly compact welcome message with mobile-proof ASCII box
            const welcome =
`<div class="welcome-message"><pre class="ascii-box">
════════════════════════════════
Red Cat - RHEL 9 Terminal
By <a href="https://aaronamran.github.io/" target="_blank" style="color: #ff6666; text-decoration: underline;">@aaronamran</a>
════════════════════════════════
</pre>
Free terminal simulator
Runs locally in your browser

Type 'help' for commands</div>`;
            this.addOutput(welcome);
        } else {
            // Desktop full welcome message with mobile-proof ASCII box
            const welcome = `<div class="welcome-message"><pre class="ascii-box">╔═══════════════════════════════════════════════════════════╗
║  Red Cat - a Red Hat Enterprise Linux 9 terminal          ║
║  By <a href="https://aaronamran.github.io/" target="_blank" style="color: #ff6666; text-decoration: underline;">@aaronamran</a>                                           ║
║                                                           ║
║  Browser-based CLI simulator for RHCSA exam preparation   ║
║  All commands run locally client-side                     ║
║  No data is sent to servers                               ║
╚═══════════════════════════════════════════════════════════╝</pre>
Welcome! This terminal simulates a RHEL 9 system with:
  • Virtual filesystem with /etc, /var, /home directories
  • User and group management
  • Package management (dnf/yum)
  • systemd service control
  • LVM and storage management
  • SELinux configuration
  • Network configuration
  • And much more!

Type 'help' for available commands
Type 'man &lt;command&gt;' for command documentation

Your machine is saved in this browser and survives refreshes; use Reset to start over.</div>`;
            this.addOutput(welcome);
        }
    }

    setupSessionPersistence() {
        // the machine is saved shortly after every command; these catch everything else
        setInterval(() => { if (this.examMode) this.saveSession(); }, 5000);

        window.addEventListener('pagehide', () => this.saveSession());
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') this.saveSession(); });
        window.addEventListener('beforeunload', (e) => {
            this.saveSession();
            if (this.examMode) {
                e.preventDefault();
                e.returnValue = 'Exam in progress. Your machine is saved, but the exam timer stops while the page is closed.';
            }
        });
    }

    sessionExtras() {
        return { examMode: this.examMode, examTimeRemaining: this.examTimeRemaining, selectedScenario: this.selectedScenario };
    }

    saveSession() {
        if (this.world) this.world.save(this.sessionExtras());
    }

    scheduleSave() {
        if (this.world) this.world.scheduleSave(() => this.sessionExtras());
    }

    restoreSession() {
        sessionStorage.removeItem('rhcsa_session');   // older versions kept the session here
        try {
            const record = this.world.load();
            if (!record) return;
            this.world.apply(record.delta);
            const t = record.term || {};
            this.history = Array.isArray(t.history) ? t.history : [];
            this.examMode = t.examMode || false;
            this.examTimeRemaining = t.examTimeRemaining || 3 * 60 * 60;
            this.selectedScenario = t.selectedScenario || null;
            this.restoredAt = record.savedAt;
            if (this.commands.afterRestore) this.commands.afterRestore();
            // Resume exam timer if it was active
            if (this.examMode && this.selectedScenario) setTimeout(() => this.resumeExamMode(), 100);
        } catch (e) {
            console.error('Failed to restore the saved machine:', e);
            this.world.clear();
            this.fs = new VirtualFilesystem();
            this.commands = new RHCSACommands(this.fs);
            this.history = [];
            this.world = new WorldState(this);
            this.world.markPristine();
        }
    }

    toggleExamMode() {
        if (!this.examMode) {
            this.showScenarioSelection();
        } else {
            this.stopExamMode();
        }
    }

    getExamScenarios() {
        return {
            '1': {
                title: 'Scenario 1: Research Server Configuration',
                subtitle: 'server1.example.com',
                background: 'You are the system administrator of a small research server. A second system, server2.example.com, acts as a remote host for SSH, NFS, and file transfers.',
                credentials: 'Root password: RedHat123',
                sections: [
                    {
                        name: 'Essential Tools',
                        tasks: [
                            '1. Create directory /practice/tools',
                            '2. Create summary.txt with 3 lines: "RHCSA Practice", "Essential Tools", "Completed"',
                            '3. Find all /etc files with "conf" → save to /practice/tools/conf_list.txt',
                            '4. Append sorted user list from /etc/passwd to conf_list.txt',
                            '5. Extract lines with date pattern (YYYY-MM-DD) from /var/log/messages',
                            '6. Create tar.gz archive of /practice/tools at /root/tools_backup.tar.gz'
                        ]
                    },
                    {
                        name: 'Software Management',
                        tasks: [
                            '7. Configure repo: name=localrepo, baseurl=/repo, enabled=yes, gpgcheck=no',
                            '8. Install packages: tmux, tree',
                            '9. Remove package: sl (if present)',
                            '10. Add Flathub remote: https://flathub.org/repo/flathub.flatpakrepo',
                            '11. Install Flatpak: com.visualstudio.code'
                        ]
                    },
                    {
                        name: 'Shell Scripting',
                        tasks: [
                            '12. Create /usr/local/bin/checkusers.sh (check if user exists)',
                            '13. Script accepts username arg, prints "User <name> exists" or "not found"',
                            '14. Create /usr/local/bin/count_lines.sh (loop through /etc/*.conf)',
                            '15. For each .conf file, print: <filename>: <linecount>'
                        ]
                    },
                    {
                        name: 'Operating Running Systems',
                        tasks: [
                            '16. Set default boot target to multi-user.target',
                            '17. Find highest CPU process → save to /root/highcpu.txt',
                            '18. Configure journald for persistent logs across reboots',
                            '19. Ensure sshd is running and enabled at boot',
                            '20. Stop and disable avahi-daemon'
                        ]
                    },
                    {
                        name: 'Storage',
                        tasks: [
                            '21. Create GPT partition /dev/sdb1 (2GB)',
                            '22. Create PV on /dev/sdb1',
                            '23. Create VG: researchvg',
                            '24. Create LV: data (1.5G), format as XFS',
                            '25. Mount at /mnt/research permanently using UUID in /etc/fstab',
                            '26. Extend LV data by 300M and grow filesystem',
                            '27. Create 500M swap LV named swaplv, enable permanently'
                        ]
                    },
                    {
                        name: 'Filesystems & Network',
                        tasks: [
                            '28. Create FAT filesystem on /dev/sdb2 (500M)',
                            '29. Mount at /mnt/fatdrive',
                            '30. Mount NFS server2:/srv/nfs/share temporarily at /mnt/share',
                            '31. Configure autofs: master=/etc/auto.master.d/lab.autofs',
                            '32. Mount point=/nfslab, map=/etc/auto.lab, key=share'
                        ]
                    },
                    {
                        name: 'Task Scheduling',
                        tasks: [
                            '33. Create cron job: runs 3:45 AM daily',
                            '34. Execute /usr/local/bin/checkusers.sh root → /var/log/usercheck.log',
                            '35. Create systemd timer diskreport.timer (every 10 min)',
                            '36. Timer executes /usr/local/bin/diskreport.sh'
                        ]
                    },
                    {
                        name: 'Networking',
                        tasks: [
                            '37. Configure IP: 192.168.55.10/24',
                            '38. Set gateway: 192.168.55.1',
                            '39. Set DNS: 8.8.8.8',
                            '40. Set hostname to server1.example.com',
                            '41. Open firewall: http, https, nfs',
                            '42. Remove cockpit service from firewall'
                        ]
                    },
                    {
                        name: 'Users & Groups',
                        tasks: [
                            '43. Create user analyst (password: Test123!)',
                            '44. Create user developer (password: Code123!)',
                            '45. Create group research, add analyst to it',
                            '46. Set password aging for analyst: max=30 days, warning=7 days',
                            '47. Configure sudo: research group can run /usr/bin/systemctl without password'
                        ]
                    },
                    {
                        name: 'Security & SELinux',
                        tasks: [
                            '48. Generate SSH key for root on server1',
                            '49. Copy key to server2 for passwordless login',
                            '50. Set SELinux to enforcing mode',
                            '51. Restore default SELinux context on /mnt/research',
                            '52. Enable boolean: httpd_can_network_connect permanently',
                            '53. Add custom HTTP port 8081 to SELinux',
                            '54. FINAL: Reboot and verify all configurations persist'
                        ]
                    }
                ]
            },
            '2': {
                title: 'Scenario 2: IT Operations Setup',
                subtitle: 'serverA.example.com',
                background: 'You have just joined the IT operations team. Your task is to configure serverA to meet internal infrastructure requirements. The second machine, serverB, is reachable via SSH and provides services used throughout the company.',
                credentials: 'Root password: Practice123',
                sections: [
                    {
                        name: 'Essential Tools',
                        tasks: [
                            '1. Create directory /lab/system',
                            '2. Create notes.txt with 3 lines: \"RHCSA Simulation Exam 2\", \"Essential Tools Section\", \"Completed by <yourname>\"',
                            '3. Extract lines with \"boot\" from /etc/fstab → save to /lab/system/bootlines.txt',
                            '4. Append output of: ls -1 /usr/bin | wc -l',
                            '5. Extract IPv4 patterns from /var/log/secure → /lab/system/ip_matches.log',
                            '6. Create bzip2 archive: /root/system_archive.tar.bz2 of /lab/system'
                        ]
                    },
                    {
                        name: 'Software Management',
                        tasks: [
                            '7. Create /etc/yum.repos.d/lab.repo: name=labrepo, baseurl=/packages',
                            '8. Configure: enabled=1, gpgcheck=0',
                            '9. Install packages: wget, lsof',
                            '10. Remove httpd package (if installed)',
                            '11. Add Flatpak remote: https://dl.flathub.org/repo/flathub.flatpakrepo',
                            '12. Install Flatpak: org.gnome.Calculator'
                        ]
                    },
                    {
                        name: 'Shell Scripting',
                        tasks: [
                            '13. Create /usr/local/bin/usercheck.sh (accepts username)',
                            '14. If exists: print \"User <username> exists\", else \"does not exist\"',
                            '15. Create /usr/local/bin/service_report.sh',
                            '16. Loop through services starting with \"ss\", print: <service>: <active/inactive>'
                        ]
                    },
                    {
                        name: 'Operating Running Systems',
                        tasks: [
                            '17. Set default boot target to graphical.target',
                            '18. Configure GRUB menu timeout: 10 seconds',
                            '19. Generate top 5 memory processes → save to /root/memtops.txt',
                            '20. Enable persistent journaling',
                            '21. Enable and start chronyd',
                            '22. Stop and disable cups'
                        ]
                    },
                    {
                        name: 'Storage',
                        tasks: [
                            '23. Create GPT partition /dev/sdc1 (3GB)',
                            '24. Create PV on /dev/sdc1',
                            '25. Create VG: opsvg',
                            '26. Create LV: data2 (2.5G), format as ext4',
                            '27. Label filesystem as \"data2vol\"',
                            '28. Mount at /mnt/data2 permanently using label in /etc/fstab',
                            '29. Extend LV data2 by 500M and grow filesystem',
                            '30. Create 400M swap file: /swapfile1, enable permanently'
                        ]
                    },
                    {
                        name: 'Filesystems & Network',
                        tasks: [
                            '31. Create XFS filesystem on /dev/sdc2 (1G)',
                            '32. Mount at /xfsdata',
                            '33. Mount NFS serverB:/export/shared temporarily at /mnt/sharedtmp',
                            '34. Configure autofs: master=/etc/auto.master.d/shared.autofs',
                            '35. Mount point=/shared, map=/etc/auto.shared, key=public'
                        ]
                    },
                    {
                        name: 'Task Scheduling',
                        tasks: [
                            '36. Create cron job for root: runs every 15 minutes',
                            '37. Execute /usr/local/bin/service_report.sh → /var/log/service_status.log',
                            '38. Create systemd timer backupdata (runs at 02:00 daily)',
                            '39. Create /usr/local/bin/backup.sh: archive /etc → /var/backups/etc_<date>.tar.gz'
                        ]
                    },
                    {
                        name: 'Networking',
                        tasks: [
                            '40. Configure IP: 10.20.30.40/24',
                            '41. Set gateway: 10.20.30.1',
                            '42. Set DNS: 1.1.1.1 and 8.8.4.4',
                            '43. Set hostname to serverA.example.com',
                            '44. Add firewall rules: ssh, nfs, dhcpv6-client',
                            '45. Remove samba service from firewall'
                        ]
                    },
                    {
                        name: 'Users & Groups',
                        tasks: [
                            '46. Create user ops1 (password: Ops123!)',
                            '47. Create user ops2 (password: Ops234!)',
                            '48. Create group operations, add both users',
                            '49. Set password aging for ops2: max=45 days, warning=5 days',
                            '50. Configure sudo: operations group can run /usr/bin/yum without password'
                        ]
                    },
                    {
                        name: 'Security & SELinux',
                        tasks: [
                            '51. Generate SSH keys for root on serverA',
                            '52. Copy public key to root@serverB for passwordless login',
                            '53. Restore default SELinux context on /mnt/data2',
                            '54. Enable SELinux boolean: ftp_home_dir permanently',
                            '55. Configure SELinux: allow SSH on port 2222',
                            '56. FINAL: Reboot and verify all configurations persist'
                        ]
                    }
                ]
            },
            '3': {
                title: 'Scenario 3: Developer Workstation',
                subtitle: 'primary.example.com',
                background: 'You are the system administrator of primary.example.com, a general-purpose compute node used by internal developers. You will prepare the system to meet new organizational compliance requirements. The remote machine provides SSH endpoint, NFS export, and shared configuration repository.',
                credentials: 'Root password: LinuxLab123',
                sections: [
                    {
                        name: 'Essential Tools',
                        tasks: [
                            '1. Create directory /work/essentials',
                            '2. Create intro.txt with: \"RHCSA Simulation Exam 3\", \"Essentials Section\", \"<yourname>\"',
                            '3. Extract lines with \"Permit\" from /etc/ssh/sshd_config → /work/essentials/ssh_permit.txt',
                            '4. Append count of active users: who | wc -l',
                            '5. Extract usernames with UID < 500 from /etc/passwd → /work/essentials/lowuid.txt',
                            '6. Create gzip archive: /root/essentials_backup.tar.gz of /work/essentials'
                        ]
                    },
                    {
                        name: 'Software Management',
                        tasks: [
                            '7. Create /etc/yum.repos.d/internal.repo: name=internalrepo',
                            '8. Configure: baseurl=/internalrepo, enabled=1, gpgcheck=0',
                            '9. Install packages: vim-enhanced, bash-completion',
                            '10. Remove chrony package (if installed)',
                            '11. Add Flatpak remote: https://flathub.org/repo/flathub.flatpakrepo',
                            '12. Install Flatpak: org.gnome.Terminal'
                        ]
                    },
                    {
                        name: 'Shell Scripting',
                        tasks: [
                            '13. Create /usr/local/bin/checkport.sh (accepts port number)',
                            '14. If process listening: print \"Port <port> is in use\", else \"is free\"',
                            '15. Create /usr/local/bin/dirsize.sh',
                            '16. Loop through /home directories, print: <dirname>: <disk usage in MB>'
                        ]
                    },
                    {
                        name: 'Operating Running Systems',
                        tasks: [
                            '17. Set default boot target to multi-user.target',
                            '18. Configure GRUB menu timeout: 5 seconds',
                            '19. Generate top 7 CPU processes → save to /root/cputop7.txt',
                            '20. Enable persistent system journals',
                            '21. Start and enable rsyslog',
                            '22. Stop and mask bluetooth service'
                        ]
                    },
                    {
                        name: 'Storage',
                        tasks: [
                            '23. Create GPT partition /dev/sdd1 (4GB)',
                            '24. Create PV on /dev/sdd1',
                            '25. Create VG: devvg',
                            '26. Create LV: data3 (3.5G), format as XFS',
                            '27. Mount at /data/project permanently using UUID in /etc/fstab',
                            '28. Extend LV data3 by 1GB and grow filesystem',
                            '29. Create 600M swap LV named lv_swap, enable permanently'
                        ]
                    },
                    {
                        name: 'Filesystems & Network',
                        tasks: [
                            '30. Create ext4 filesystem on /dev/sdd2 (2GB)',
                            '31. Mount at /legacy',
                            '32. Mount NFS remote.example.com:/exports/teamshare temporarily at /mnt/teamtemp',
                            '33. Configure autofs: master=/etc/auto.master.d/team.autofs',
                            '34. Mount point=/teams, map=/etc/auto.teams, key=share'
                        ]
                    },
                    {
                        name: 'Task Scheduling',
                        tasks: [
                            '35. Create cron job for root: runs at 1:30 AM daily',
                            '36. Execute /usr/local/bin/dirsize.sh → /var/log/homesizes.log',
                            '37. Create systemd timer rotatejournal (runs every hour)',
                            '38. Timer executes /usr/local/bin/rotatejournal.sh',
                            '39. Script archives /var/log/journal → /var/log/journal_archive_<timestamp>.tar.gz'
                        ]
                    },
                    {
                        name: 'Networking',
                        tasks: [
                            '40. Configure IP: 172.22.10.50/24',
                            '41. Set gateway: 172.22.10.1',
                            '42. Set DNS: 8.8.8.8',
                            '43. Set hostname to primary.example.com',
                            '44. Add firewall rules: ssh, nfs, http (permanently)',
                            '45. Block smtp service (permanently)'
                        ]
                    },
                    {
                        name: 'Users & Groups',
                        tasks: [
                            '46. Create user engineer (password: Engi123!)',
                            '47. Create user tester (password: Test123!)',
                            '48. Create group devteam, add both users',
                            '49. Set password aging for tester: max=60 days, min=2 days, warn=10 days',
                            '50. Configure sudo: devteam group can run /usr/sbin/useradd without password'
                        ]
                    },
                    {
                        name: 'Security & SELinux',
                        tasks: [
                            '51. Generate SSH keys for root on primary',
                            '52. Configure passwordless SSH from root@primary → root@remote',
                            '53. Fix SELinux contexts on /data/project to default',
                            '54. Enable SELinux boolean: nis_enabled permanently',
                            '55. Allow httpd service to run on TCP port 9090',
                            '56. FINAL: Reboot and verify all configurations persist'
                        ]
                    }
                ]
            }
        };
    }

    startExamWithScenario(scenarioNum) {
        this.selectedScenario = scenarioNum;
        this.examMode = true;
        this.examTimeRemaining = 3 * 60 * 60; // 3 hours

        // Load scenario into sidebar
        this.loadScenarioToSidebar(scenarioNum);

        document.getElementById('examTimer').style.display = 'flex';
        document.getElementById('examBtn').textContent = '🛑 Stop Exam';
        document.getElementById('examBtn').classList.add('active');

        const scenarios = this.getExamScenarios();
        const scenario = scenarios[scenarioNum];

        this.addOutput('<div class="info"><strong>═══════════════════════════════════════</strong></div>');
        this.addOutput(`<div class="info"><strong>  RHCSA EXAM MODE STARTED</strong></div>`);
        this.addOutput(`<div class="info"><strong>  ${scenario.title}</strong></div>`);
        this.addOutput('<div class="info"><strong>  Time Limit: 3 hours</strong></div>');
        this.addOutput('<div class="info"><strong>═══════════════════════════════════════</strong></div>');

        this.startExamTimer();
        this.saveSession();
    }

    loadScenarioToSidebar(scenarioNum) {
        const scenarios = this.getExamScenarios();
        const scenario = scenarios[scenarioNum];
        const sidebar = document.getElementById('sidebar');

        // Replace sidebar content with exam scenario
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2>RHCSA Exam</h2>
            </div>

            <div class="objectives">
                <div class="exam-scenario-info">
                    <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">${scenario.title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem;"><strong>System:</strong> ${scenario.subtitle}</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; margin-bottom: 0.5rem;">${scenario.background}</p>
                    <p style="color: var(--info-color); font-size: 0.85rem; margin-bottom: 0;"><strong>🔑 ${scenario.credentials}</strong></p>
                </div>

                ${scenario.sections.map((section, idx) => `
                    <div class="objective-section">
                        <h3>${idx + 1}. ${section.name}</h3>
                        <ul>
                            ${section.tasks.map(task => `<li data-progress="0">${task}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>

            <div class="sidebar-footer">
                <p>⏱️ <strong>Tip:</strong> All tasks must survive reboot. Check work carefully before completing.</p>
            </div>
        `;
    }

    startExamMode() {
        const confirmed = confirm(
            'Start RHCSA Exam Simulation?\n\n' +
            'Duration: 3 hours\n' +
            'Session will be saved if you refresh the page\n' +
            'Session will be lost if you close the tab\n\n' +
            'Ready to begin?'
        );

        if (!confirmed) return;

        this.examMode = true;
        this.examTimeRemaining = 3 * 60 * 60; // 3 hours

        document.getElementById('examTimer').style.display = 'block';
        document.getElementById('examBtn').textContent = '🛑 Stop Exam';
        document.getElementById('examBtn').classList.add('active');

        this.addOutput('<div class="info"><strong>═══════════════════════════════════════</strong></div>');
        this.addOutput('<div class="info"><strong>  RHCSA EXAM MODE STARTED</strong></div>');
        this.addOutput('<div class="info"><strong>  Time Limit: 3 hours</strong></div>');
        this.addOutput('<div class="info"><strong>═══════════════════════════════════════</strong></div>');

        this.startExamTimer();
        this.saveSession();
    }

    resumeExamMode() {
        this.examMode = true;

        // Restore sidebar with scenario
        if (this.selectedScenario) {
            this.loadScenarioToSidebar(this.selectedScenario);
        }

        document.getElementById('examTimer').style.display = 'flex';
        document.getElementById('examBtn').textContent = '🛑 Stop Exam';
        document.getElementById('examBtn').classList.add('active');

        const scenarios = this.getExamScenarios();
        const scenario = scenarios[this.selectedScenario];

        this.addOutput('<div class="warning"><strong>EXAM SESSION RESTORED</strong></div>');
        if (scenario) {
            this.addOutput(`<div class="warning">${scenario.title}</div>`);
        }
        this.addOutput(`<div class="warning">Time remaining: ${this.formatTime(this.examTimeRemaining)}</div>`);

        this.startExamTimer();
    }

    startExamTimer() {
        this.updateTimerDisplay();

        this.examTimer = setInterval(() => {
            this.examTimeRemaining--;
            this.updateTimerDisplay();

            if (this.examTimeRemaining <= 0) {
                this.examTimeExpired();
            }
        }, 1000);
    }

    restoreOriginalSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2>RHCSA Objectives</h2>
            </div>

            <div class="objectives">
                <div class="objective-section">
                    <h3>Essential Tools</h3>
                    <ul>
                        <li data-progress="0">Shell commands & syntax</li>
                        <li data-progress="0">I/O redirection (>, |, 2>)</li>
                        <li data-progress="0">grep & regex</li>
                        <li data-progress="0">File operations</li>
                        <li data-progress="0">Permissions (chmod, chown)</li>
                        <li data-progress="0">Links (hard & soft)</li>
                        <li data-progress="0">Archive (tar, gzip)</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>User Management</h3>
                    <ul>
                        <li data-progress="0">Create/delete users</li>
                        <li data-progress="0">Password management</li>
                        <li data-progress="0">Groups & memberships</li>
                        <li data-progress="0">sudo configuration</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>Software Management</h3>
                    <ul>
                        <li data-progress="0">DNF/YUM repositories</li>
                        <li data-progress="0">Install/remove packages</li>
                        <li data-progress="0">RPM queries</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>System Operations</h3>
                    <ul>
                        <li data-progress="0">Boot/reboot/shutdown</li>
                        <li data-progress="0">systemd targets</li>
                        <li data-progress="0">Process management</li>
                        <li data-progress="0">Log files & journalctl</li>
                        <li data-progress="0">systemctl services</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>Storage & Filesystems</h3>
                    <ul>
                        <li data-progress="0">Partitioning (fdisk)</li>
                        <li data-progress="0">LVM (pv, vg, lv)</li>
                        <li data-progress="0">mkfs & mounting</li>
                        <li data-progress="0">fstab configuration</li>
                        <li data-progress="0">NFS & autofs</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>Networking</h3>
                    <ul>
                        <li data-progress="0">IP configuration</li>
                        <li data-progress="0">Hostname resolution</li>
                        <li data-progress="0">firewalld/firewall-cmd</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>Security</h3>
                    <ul>
                        <li data-progress="0">SELinux modes</li>
                        <li data-progress="0">SELinux contexts</li>
                        <li data-progress="0">SSH key-based auth</li>
                        <li data-progress="0">File permissions</li>
                    </ul>
                </div>

                <div class="objective-section">
                    <h3>Shell Scripting</h3>
                    <ul>
                        <li data-progress="0">Conditionals (if, test)</li>
                        <li data-progress="0">Loops (for, while)</li>
                        <li data-progress="0">Script parameters</li>
                    </ul>
                </div>
            </div>

            <div class="sidebar-footer">
                <p>💡 <strong>Tip:</strong> Commands persist in this session. Try <code>help</code> for available commands.</p>
            </div>
        `;
    }

    stopExamMode() {
        const confirmed = confirm(
            'Stop exam mode?\n\n' +
            'Your session will be saved and you can resume later by refreshing the page.\n' +
            'To completely clear the exam, use the Reset button.'
        );

        if (!confirmed) return;

        if (this.examTimer) {
            clearInterval(this.examTimer);
            this.examTimer = null;
        }

        this.examMode = false;
        this.restoreOriginalSidebar();

        document.getElementById('examTimer').style.display = 'none';
        document.getElementById('examBtn').textContent = '🎓 Exam Mode';
        document.getElementById('examBtn').classList.remove('active');

        this.addOutput('<div class="info"><strong>EXAM MODE PAUSED</strong></div>');
        this.addOutput('<div class="info">Refresh the page to resume your exam session.</div>');

        this.saveSession();
    }

    examTimeExpired() {
        clearInterval(this.examTimer);
        this.examTimer = null;
        this.examMode = false;
        this.selectedScenario = null;

        this.restoreOriginalSidebar();

        document.getElementById('examBtn').textContent = '🎓 Exam Mode';
        document.getElementById('examBtn').classList.remove('active');

        this.addOutput('<div class="error"><strong>═══════════════════════════════════════</strong></div>');
        this.addOutput('<div class="error"><strong>  TIME EXPIRED!</strong></div>');
        this.addOutput('<div class="error"><strong>  RHCSA Exam Simulation Complete</strong></div>');
        this.addOutput('<div class="error"><strong>═══════════════════════════════════════</strong></div>');
        this.addOutput('<div class="info">Review your work. Use "reset" to start a new session.</div>');

        this.saveSession();
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        display.textContent = this.formatTime(this.examTimeRemaining);

        // Change color based on time remaining
        display.classList.remove('warning', 'critical');
        if (this.examTimeRemaining <= 30 * 60) { // Last 30 minutes
            display.classList.add('warning');
        }
        if (this.examTimeRemaining <= 10 * 60) { // Last 10 minutes
            display.classList.add('critical');
        }
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    handleKeyDown(e) {
        if (this.activePager) return;
        if (this.booting) { e.preventDefault(); this.bootSkip = true; return; }
        if (this.inputMode && this.handleInputKey(e)) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            const rawLine = this.input.value;
            const continuing = !!this.contBuffer;
            const fullText = continuing ? this.contBuffer + '\n' + rawLine : rawLine;

            // Unfinished compound command, quote or here-document: ask for more input (PS2)
            if (fullText.trim() && typeof ShellInterpreter !== 'undefined' && ShellInterpreter.isIncomplete(fullText)) {
                this.addOutput(`<div class="command-echo"><span class="prompt">${continuing ? '> ' : this.getPromptText()}</span>${this.escapeHtml(rawLine)}</div>`);
                this.contBuffer = fullText;
                this.input.value = '';
                this.prompt.textContent = '> ';
                this.scrollToBottom();
                return;
            }

            let command = fullText.trim();
            let echoPrompt = continuing ? '> ' : this.getPromptText();
            this.contBuffer = '';
            if (continuing) this.updatePrompt();

            // Process history expansion before executing
            if (!continuing) command = this.expandHistory(command);

            if (command) {
                // multi-line commands are kept in history on one line
                let h = command;
                if (continuing) {
                    h = command.split('\n').reduce((acc, l, idx) => (idx === 0 ? l : acc + (/(\b(do|then|else|in)|\{|;|&&|\|\||\|)\s*$/.test(acc) ? ' ' : '; ') + l), '');
                    if (/<<-?\s*['"]?\w/.test(command)) h = command.split('\n')[0];
                }
                this.history.push(h);
                this.historyIndex = this.history.length;
                this.commands.commandHistory = this.history;
            }

            // Always add current prompt + command to output (even if empty command)
            if (command) {
                this.addOutput(`<div class="command-echo"><span class="prompt">${echoPrompt}</span>${this.escapeHtml(continuing ? rawLine : command)}</div>`);
            } else {
                this.addOutput(`<div class="command-echo"><span class="prompt">${echoPrompt}</span></div>`);
            }

            this.input.value = '';

            // Execute command if not empty
            if (this.commands._jobReap) this.commands._jobReap();
            if (command) {
                this.executeCommandOnly(command);
            }
            this.flushJobs();

            this.scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.handleTabCompletion();
        } else if (e.key === 'd' && e.ctrlKey && !e.shiftKey && !this.input.value) {
            e.preventDefault();
            this.addOutput(`<div class="command-echo"><span class="prompt">${this.getPromptText()}</span>exit</div>`);
            this.executeCommandOnly('exit');
            this.flushJobs();
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            this.clearTerminal();
        } else if (e.key === 'z' && e.ctrlKey) {
            e.preventDefault();
            // Ctrl+Z at an idle prompt does nothing (it stops a foreground job, see the fgjob input mode)
        } else if (e.key === 'c' && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            // Ctrl+C - Interrupt current command
            this.addOutput('^C');
            this.input.value = '';
            if (this.contBuffer) { this.contBuffer = ''; this.updatePrompt(); }
        } else if (e.key === 'C' && e.ctrlKey && e.shiftKey) {
            // Ctrl+Shift+C - Copy (handled by document-level listener if text is selected)
            // If no text selected in output, copy current input value
            const selection = window.getSelection();
            if (selection.toString().length === 0 && this.input.value) {
                e.preventDefault();
                navigator.clipboard.writeText(this.input.value).then(() => {
                    console.log('Input copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            }
        } else if (e.key === 'u' && e.ctrlKey) {
            e.preventDefault();
            // Ctrl+U - Clear current input line
            this.input.value = '';
        } else if (e.key === 'V' && e.ctrlKey && e.shiftKey) {
            // Ctrl+Shift+V - Paste from clipboard
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                // Insert text at cursor position
                const start = this.input.selectionStart;
                const end = this.input.selectionEnd;
                const currentValue = this.input.value;
                this.input.value = currentValue.substring(0, start) + text + currentValue.substring(end);
                // Set cursor position after pasted text
                const newPosition = start + text.length;
                this.input.setSelectionRange(newPosition, newPosition);
                this.input.focus();
            }).catch(err => {
                console.error('Failed to read clipboard:', err);
            });
        }
    }

    executeCommand(commandLine) {
        // This is now only called by buttons (help, etc.)
        // Add the command echo first
        this.addOutput(`<div class="command-echo"><span class="prompt">${this.getPromptText()}</span>${this.escapeHtml(commandLine)}</div>`);
        this.executeCommandOnly(commandLine);
    }

    // ---- shell interpreter integration
    getShell() {
        if (!this.shell && typeof ShellInterpreter !== 'undefined') this.shell = new ShellInterpreter(this);
        return this.shell;
    }

    printChunks(chunks) {
        let kind = null, buf = '';
        const out = [];
        for (const c of chunks) {
            if (c.k === kind) buf += c.s; else { if (kind) out.push({ k: kind, s: buf }); kind = c.k; buf = c.s; }
        }
        if (kind) out.push({ k: kind, s: buf });
        for (const c of out) {
            const text = c.s.replace(/\n$/, '');
            if (c.k === 'o') this.addOutput(text === '' ? '<span>&nbsp;</span>' : `<span>${this.escapeStrayHtml(text)}</span>`);
            else this.addOutput(text === '' ? '<span class="error">&nbsp;</span>' : `<span class="error">${this.escapeHtml(text)}</span>`);
        }
    }

    // Run a line through the interpreter. Commands that need typed input (read, passwd, cat, at...)
    // pause the line: the terminal asks, then replays the line from a snapshot with the answers.
    runShellLine(commandLine, state) {
        const sh = this.getShell();
        const st = state || { queue: [], shown: 0, snap: null };
        const mayAsk = /read|\.\/|\/\S+\.sh|bash|\bsh\b|source|\. |\bat\b|passwd|\bcat\b|crontab|batch/.test(commandLine);
        if (!st.snap && mayAsk) st.snap = this.takeSnapshot();
        this.pendingPager = null;
        this.pendingBoot = null;
        const mailBefore = this.mailSize();
        const res = sh.runTop(commandLine, { interactive: true, inputQueue: st.queue });
        if (sh.clearRequested) { sh.clearRequested = false; this.clearTerminal(); }
        // skip the part of the output that was already shown before the input was requested
        let skip = st.shown, shownNow = 0;
        const fresh = [];
        for (const c of res.chunks) {
            let text = c.s;
            if (skip > 0) { const cut = Math.min(skip, text.length); text = text.slice(cut); skip -= cut; }
            shownNow += c.s.length;
            if (text) fresh.push({ k: c.k, s: text });
        }
        this.printChunks(fresh);
        if (res.needInput) {
            st.shown = shownNow;
            const info = res.needInput;
            this.beginInput(info, (answer) => {
                if (answer === null) { if (st.snap) this.restoreSnapshot(st.snap); this.commands.lastExitCode = 130; this.updatePrompt(); return; }
                st.queue.push(answer);
                if (st.snap) this.restoreSnapshot(st.snap);
                this.runShellLine(commandLine, st);
            });
            return;
        }
        this.commands.lastExitCode = res.exitCode;
        this.updatePrompt();
        this.flushJobs();
        this.openPendingPager();
        this.scheduleSave();
        if (this.pendingBoot) this.runQueuedBoot();
        if (this.mailSize() > mailBefore) this.addOutput('<span>You have new mail in /var/spool/mail/' + this.fs.currentUser + '</span>');
    }

    mailSize() {
        const n = this.fs.getNode('/var/spool/mail/' + this.fs.currentUser);
        return n && n.content ? n.content.length : 0;
    }

    takeSnapshot() {
        try {
            return { fs: structuredClone(this.fs.fs), users: structuredClone(this.fs.users), groups: structuredClone(this.fs.groups), env: Object.assign({}, this.commands.env), cwd: this.fs.currentPath, user: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid };
        } catch (e) { return null; }
    }

    restoreSnapshot(s) {
        this.fs.fs = s.fs; this.fs.users = s.users; this.fs.groups = s.groups;
        for (const k of Object.keys(this.commands.env)) delete this.commands.env[k];
        Object.assign(this.commands.env, s.env);
        this.fs.currentPath = s.cwd; this.fs.currentUser = s.user; this.fs.currentUid = s.uid; this.fs.currentGid = s.gid;
    }

    // ---- typed input requested by a running command
    beginInput(info, cb) {
        this.inputMode = { info, lines: [], cb };
        this.prompt.textContent = info.prompt || '';
        if (info.secret) this.input.type = 'password';
        if (info.mode === 'fgjob') {
            // a foreground job owns the terminal until it ends (timer), Ctrl+C kills it, Ctrl+Z stops it
            this.fgStart = Date.now();
            if (info.ms) this.fgTimer = setTimeout(() => { if (this.inputMode && this.inputMode.info === info) { this.endInput(); cb('done'); } }, info.ms);
        }
        this.input.focus();
    }

    endInput() {
        if (this.fgTimer) { clearTimeout(this.fgTimer); this.fgTimer = null; }
        this.inputMode = null;
        this.input.type = 'text';
        this.updatePrompt();
    }

    handleInputKey(e) {
        const m = this.inputMode;
        const echo = (text) => this.addOutput('<div class="command-echo"><span class="prompt">' + this.escapeHtml(m.info.prompt || '') + '</span>' + this.escapeHtml(text) + '</div>');
        if (m.info.mode === 'fgjob') {
            if (e.key === 'c' && e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                this.addOutput('^C');
                this.input.value = '';
                const note = m.info.onCancel ? m.info.onCancel() : '';
                if (typeof note === 'string' && note) this.addOutput(`<span>${this.escapeStrayHtml(note)}</span>`);
                const cb = m.cb;
                this.endInput();
                cb(null);
                return true;
            }
            if (e.key === 'z' && e.ctrlKey) {
                e.preventDefault();
                this.addOutput('^Z');
                const el = Date.now() - (this.fgStart || Date.now());
                const cb = m.cb;
                this.endInput();
                cb('STOP:' + el);
                return true;
            }
            if (e.key === 'Enter') { e.preventDefault(); this.input.value = ''; this.addOutput('<span>&nbsp;</span>'); return true; }
            return false;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const line = this.input.value;
            this.input.value = '';
            echo(m.info.secret ? '' : line);
            if (m.info.mode === 'line') { const cb = m.cb; this.endInput(); cb(line); }
            else m.lines.push(line);
            return true;
        }
        if (e.key === 'd' && e.ctrlKey && m.info.onEof && !this.input.value) {
            e.preventDefault();
            this.input.value = '';
            this.endInput();
            m.info.onEof();
            return true;
        }
        if (e.key === 'd' && e.ctrlKey && m.info.mode === 'eof') {
            e.preventDefault();
            const text = m.lines.length ? m.lines.join('\n') + '\n' : '';
            const cb = m.cb;
            this.endInput();
            cb(text);
            return true;
        }
        if (e.key === 'c' && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            this.addOutput('^C');
            this.input.value = '';
            const cb = m.cb;
            this.endInput();
            cb(null);
            return true;
        }
        return false;
    }

    executeCommandOnly(commandLine) {
        // Execute without echoing (echo is done in handleKeyDown)
        if (typeof ShellInterpreter !== 'undefined' && ShellInterpreter.needsShell(commandLine)) {
            try {
                this.runShellLine(commandLine);
                return;
            } catch (err) {
                // an interpreter bug must never lock the terminal: fall back to the simple executor
                console.error('shell interpreter failed, using fallback:', err);
            }
        }

        // Split by command chaining operators (&&, ||, ;) but respect quotes
        const chainedCommands = this.splitByChainOperators(commandLine);

        let lastExitCode = 0;

        for (const { command: cmd, operator } of chainedCommands) {
            const trimmedCmd = cmd.trim();
            if (!trimmedCmd) continue;

            // Check if we should execute based on previous exit code and operator
            if (operator === '&&' && lastExitCode !== 0) {
                continue; // Skip if previous command failed
            }
            if (operator === '||' && lastExitCode === 0) {
                continue; // Skip if previous command succeeded
            }

            // Check for clear first
            const firstWord = trimmedCmd.split(/\s+/)[0];
            if (firstWord === 'clear') {
                this.clearTerminal();
                lastExitCode = 0;
                continue;
            }

            // Check for exit
            if (firstWord === 'exit' || firstWord === 'quit') {
                const exitArg = /^exit\s+(\d+)\s*$/.exec(trimmedCmd);
                const leftSession = firstWord === 'exit' && this.commands.sessionExit && this.commands.sessionExit(exitArg ? parseInt(exitArg[1], 10) : undefined);
                if (leftSession) {
                    if (leftSession !== 'quiet') this.addOutput('<span>logout</span>');
                    this.updatePrompt();
                    lastExitCode = 0;
                    continue;
                }
                this.addOutput('<span class="info">To exit, close this browser tab.</span>');
                lastExitCode = 0;
                continue;
            }

            // Check for scenarios
            if (firstWord === 'scenarios') {
                this.showScenarios();
                lastExitCode = 0;
                continue;
            }

            // Parse redirections and pipes
            const { commands: cmdChain, error: parseError } = this.parseRedirection(trimmedCmd);

            if (parseError) {
                this.addOutput(`<span class="error">${this.escapeHtml(parseError)}</span>`);
                lastExitCode = 1;
                continue;
            }

            // Execute command chain (handles pipes) and get exit code
            lastExitCode = this.executeCommandChain(cmdChain);
            this.commands.lastExitCode = lastExitCode; // visible to $? in the next command of the line
        }

        // Store last exit code for $? variable
        this.commands.lastExitCode = lastExitCode;

        // Save session after command in exam mode
        if (this.examMode) {
            this.saveSession();
        }

        this.scrollToBottom();
    }

    expandHistory(command) {
        // History expansion: !!, !$, !n, !string
        if (!command.includes('!')) {
            return command;
        }

        // Expand !! (last command)
        if (command.includes('!!')) {
            const lastCmd = this.history.length > 0 ? this.history[this.history.length - 1] : '';
            command = command.replace(/!!/g, lastCmd);
        }

        // Expand !$ (last argument of previous command)
        if (command.includes('!$')) {
            const lastCmd = this.history.length > 0 ? this.history[this.history.length - 1] : '';
            const lastArg = lastCmd.split(/\s+/).pop() || '';
            command = command.replace(/!\$/g, lastArg);
        }

        // Expand !n (command number n from history)
        command = command.replace(/!(\d+)/g, (match, num) => {
            const index = parseInt(num) - 1;
            return (index >= 0 && index < this.history.length) ? this.history[index] : match;
        });

        // Expand !string (most recent command starting with string)
        command = command.replace(/!([a-zA-Z][a-zA-Z0-9_-]*)/g, (match, str) => {
            for (let i = this.history.length - 1; i >= 0; i--) {
                if (this.history[i].startsWith(str)) {
                    return this.history[i];
                }
            }
            return match;
        });

        // Expand brace expansion: {a,b,c} or {1..10}
        command = this.expandBraces(command);

        return command;
    }

    expandBraces(command) {
        // Handle numeric ranges: {1..10}, {a..z}
        command = command.replace(/\{(\d+)\.\.(\d+)\}/g, (match, start, end) => {
            const s = parseInt(start);
            const e = parseInt(end);
            const result = [];
            if (s <= e) {
                for (let i = s; i <= e; i++) result.push(i);
            } else {
                for (let i = s; i >= e; i--) result.push(i);
            }
            return result.join(' ');
        });

        // Handle character ranges: {a..z}
        command = command.replace(/\{([a-z])\.\.([a-z])\}/g, (match, start, end) => {
            const s = start.charCodeAt(0);
            const e = end.charCodeAt(0);
            const result = [];
            if (s <= e) {
                for (let i = s; i <= e; i++) result.push(String.fromCharCode(i));
            } else {
                for (let i = s; i >= e; i--) result.push(String.fromCharCode(i));
            }
            return result.join(' ');
        });

        // Handle comma-separated lists: {a,b,c}
        command = command.replace(/\{([^}]+)\}/g, (match, contents) => {
            if (contents.includes(',')) {
                return contents.split(',').join(' ');
            }
            return match;
        });

        return command;
    }

    splitByChainOperators(commandLine) {
        // Split by &&, ||, and ; while respecting quotes
        const result = [];
        let current = '';
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let operator = null;
        let sub = 0;   // depth of $( ... ) substitutions, split later when they run

        for (let i = 0; i < commandLine.length; i++) {
            const char = commandLine[i];
            const nextChar = commandLine[i + 1];

            if (!inSingleQuote && char === '$' && nextChar === '(') {
                sub++;
                current += '$(';
                i++;
                continue;
            }
            if (sub > 0) {
                if (char === '(') sub++;
                else if (char === ')') sub--;
                current += char;
                continue;
            }
            if (char === "'" && !inDoubleQuote) {
                inSingleQuote = !inSingleQuote;
                current += char;
            } else if (char === '"' && !inSingleQuote) {
                inDoubleQuote = !inDoubleQuote;
                current += char;
            } else if (!inSingleQuote && !inDoubleQuote) {
                if (char === '&' && nextChar === '&') {
                    result.push({ command: current, operator: operator });
                    current = '';
                    operator = '&&';
                    i++; // Skip next &
                } else if (char === '|' && nextChar === '|') {
                    result.push({ command: current, operator: operator });
                    current = '';
                    operator = '||';
                    i++; // Skip next |
                } else if (char === ';') {
                    result.push({ command: current, operator: operator });
                    current = '';
                    operator = ';';
                } else {
                    current += char;
                }
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            result.push({ command: current, operator: operator });
        }

        return result;
    }

    executeCommandChain(cmdChain) {
        let stdin = '';
        let shouldUpdatePrompt = false;
        let exitCode = 0;

        for (let i = 0; i < cmdChain.length; i++) {
            const cmdInfo = cmdChain[i];
            const { command, args, inputRedirect, outputRedirect, errorRedirect } = cmdInfo;

            // Handle input redirection (<)
            if (inputRedirect) {
                const file = this.commands.fs.getNode(inputRedirect);
                if (!file) {
                    this.addOutput(`<span class="error">bash: ${inputRedirect}: No such file or directory</span>`);
                    return;
                }
                if (file.type !== 'file') {
                    this.addOutput(`<span class="error">bash: ${inputRedirect}: Is a directory</span>`);
                    return;
                }
                stdin = file.content || '';
            }

            // Execute command
            let result;

            try {
                const cmdFn = this.commandMethod(command);
                if (cmdFn) {
                    this.commands._stdoutIsPipe = i < cmdChain.length - 1;
                    result = cmdFn.call(this.commands, args, stdin);
                } else {
                    result = { stdout: '', stderr: `${command}: command not found`, exitCode: 127 };
                }
            } catch (err) {
                result = { stdout: '', stderr: `Error executing ${command}: ${err.message}`, exitCode: 1 };
            }

            // Normalize legacy format to new format
            if (result.output !== undefined || result.error !== undefined) {
                result = {
                    stdout: result.output || '',
                    stderr: result.error || '',
                    exitCode: result.error ? 1 : 0
                };
            }

            // Handle special flags
            if (result.clearScreen) {
                this.clearTerminal();
                return;
            }

            // Store changeDir flag for later (update prompt after output is displayed)
            if (result.changeDir) {
                shouldUpdatePrompt = true;
            }

            // Handle output redirection (>)
            if (outputRedirect) {
                const { file, append } = outputRedirect;
                const parentPath = this.commands.fs.getParentPath(file);
                const basename = this.commands.fs.getBasename(file);
                const parent = this.commands.fs.getNode(parentPath);

                if (!parent) {
                    this.addOutput(`<span class="error">bash: ${file}: No such file or directory</span>`);
                    return;
                }

                if (!this.commands.fs.hasPermission(parent, 'w')) {
                    this.addOutput(`<span class="error">bash: ${file}: Permission denied</span>`);
                    return;
                }

                const existingFile = this.commands.fs.getNode(file);
                const outText = outputRedirect.mergeStderr ? result.stdout + result.stderr : result.stdout;
                const content = append && existingFile ? (existingFile.content || '') + outText : outText;

                parent.children[basename] = {
                    type: 'file',
                    permissions: '0644',
                    owner: this.commands.fs.currentUser,
                    group: this.commands.fs.currentUser,
                    size: content.length,
                    modified: new Date(),
                    content: content
                };

                result.stdout = ''; // Don't display when redirected
                if (outputRedirect.mergeStderr) {
                    result.stderr = '';
                }
            }

            // Handle error redirection (2>)
            if (errorRedirect) {
                const { file, append, combineOutput } = errorRedirect;
                const parentPath = this.commands.fs.getParentPath(file);
                const basename = this.commands.fs.getBasename(file);
                const parent = this.commands.fs.getNode(parentPath);

                if (!parent) {
                    this.addOutput(`<span class="error">bash: ${file}: No such file or directory</span>`);
                    return;
                }

                if (!this.commands.fs.hasPermission(parent, 'w')) {
                    this.addOutput(`<span class="error">bash: ${file}: Permission denied</span>`);
                    return;
                }

                const existingFile = this.commands.fs.getNode(file);
                let content = combineOutput ? result.stdout + result.stderr : result.stderr;
                content = append && existingFile ? (existingFile.content || '') + content : content;

                parent.children[basename] = {
                    type: 'file',
                    permissions: '0644',
                    owner: this.commands.fs.currentUser,
                    group: this.commands.fs.currentUser,
                    size: content.length,
                    modified: new Date(),
                    content: content
                };

                if (combineOutput) {
                    result.stdout = '';
                }
                result.stderr = ''; // Don't display when redirected
            }

            // Display output if not redirected and not piped
            if (i === cmdChain.length - 1) {
                if (result.stderr) {
                    this.addOutput(`<span class="error">${this.escapeHtml(result.stderr)}</span>`);
                }
                if (result.stdout) {
                    this.addOutput(`<span>${this.escapeStrayHtml(result.stdout)}</span>`);
                }
                // Store the final exit code
                exitCode = result.exitCode || 0;
            } else {
                // Pass stdout to next command in pipe
                stdin = result.stdout;
                // Pipes continue even if intermediate commands fail
            }
        }

        // Update prompt after all output has been displayed
        if (shouldUpdatePrompt) {
            this.updatePrompt();
        }

        return exitCode;
    }

    parseRedirection(commandLine) {
        // Split by pipes first
        const pipeSegments = this.splitByPipes(commandLine);
        const commands = [];

        for (const segment of pipeSegments) {
            const cmdInfo = this.parseRedirectionSegment(segment.trim());
            if (cmdInfo.error) {
                return { error: cmdInfo.error };
            }
            commands.push(cmdInfo);
        }

        return { commands };
    }

    splitByPipes(line) {
        const segments = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let sub = 0;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (!(inQuotes && quoteChar === "'") && char === '$' && line[i + 1] === '(') {
                sub++;
                current += '$(';
                i++;
                continue;
            }
            if (sub > 0) {
                if (char === '(') sub++;
                else if (char === ')') sub--;
                current += char;
                continue;
            }
            if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                }
                current += char;
            } else if (char === '|' && !inQuotes) {
                segments.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        if (current) {
            segments.push(current);
        }

        return segments;
    }

    parseRedirectionSegment(segment) {
        let inputRedirect = null;
        let outputRedirect = null;
        let errorRedirect = null;
        let mergeStderr = false;
        let cmdString = '';

        // Quote-aware scan so that '>' / '<' inside quotes stay part of the arguments
        let quote = null;
        const readTarget = (from) => {
            let j = from;
            while (j < segment.length && segment[j] === ' ') j++;
            let target = '';
            let q = null;
            for (; j < segment.length; j++) {
                const c = segment[j];
                if (q) {
                    if (c === q) q = null; else target += c;
                } else if (c === '"' || c === "'") {
                    q = c;
                } else if (c === ' ' || c === '>' || c === '<') {
                    break;
                } else {
                    target += c;
                }
            }
            return { target, next: j };
        };

        for (let i = 0; i < segment.length;) {
            const c = segment[i];

            if (quote) {
                if (c === quote) quote = null;
                cmdString += c;
                i++;
                continue;
            }
            if (c === '"' || c === "'") {
                quote = c;
                cmdString += c;
                i++;
                continue;
            }

            const prev = i > 0 ? segment[i - 1] : ' ';

            // 2>&1 (merge stderr into stdout)
            if (segment.startsWith('2>&1', i)) {
                mergeStderr = true;
                i += 4;
                continue;
            }
            // &> file / &>> file
            if (c === '&' && segment[i + 1] === '>') {
                const append = segment[i + 2] === '>';
                const t = readTarget(i + (append ? 3 : 2));
                errorRedirect = { file: t.target, append, combineOutput: true };
                i = t.next;
                continue;
            }
            // 2> file / 2>> file
            if (c === '2' && segment[i + 1] === '>' && (prev === ' ' || i === 0)) {
                const append = segment[i + 2] === '>';
                const t = readTarget(i + (append ? 3 : 2));
                errorRedirect = { file: t.target, append, combineOutput: false };
                i = t.next;
                continue;
            }
            // 1> / > / >>
            if (c === '>' || (c === '1' && segment[i + 1] === '>' && prev === ' ')) {
                const gt = c === '>' ? i : i + 1;
                const append = segment[gt + 1] === '>';
                const t = readTarget(gt + (append ? 2 : 1));
                outputRedirect = { file: t.target, append };
                i = t.next;
                continue;
            }
            // here-doc / here-string markers are left untouched
            if (c === '<' && segment[i + 1] === '<') {
                while (segment[i] === '<') {
                    cmdString += '<';
                    i++;
                }
                continue;
            }
            // < file
            if (c === '<') {
                const t = readTarget(i + 1);
                inputRedirect = t.target;
                i = t.next;
                continue;
            }

            cmdString += c;
            i++;
        }

        cmdString = cmdString.trim();
        if (mergeStderr && outputRedirect) {
            outputRedirect.mergeStderr = true;
        }

        // Parse remaining command and arguments
        const parts = this.parseCommandLine(cmdString);

        if (parts.length === 0) {
            return { error: 'bash: syntax error near unexpected token' };
        }

        return {
            command: parts[0],
            args: parts.slice(1),
            inputRedirect,
            outputRedirect,
            errorRedirect
        };
    }

    parseCommandLine(line) {
        // Split by spaces, respecting quotes. Characters that have a meaning for variable,
        // brace or glob expansion are swapped for private markers while inside quotes so the
        // expansion steps leave them alone (awk '{print $1}', grep '[0-9]*', "a,b" ...).
        const SINGLE = { '$': '\u0001' };
        const QUOTED = { '{': '\u0002', '}': '\u0003', '*': '\u0004', '?': '\u0005', '[': '\u0006', ']': '\u0007', ',': '\u000e' };
        const restore = (s) => s
            .replace(/\u0001/g, '$').replace(/\u0002/g, '{').replace(/\u0003/g, '}').replace(/\u0004/g, '*')
            .replace(/\u0005/g, '?').replace(/\u0006/g, '[').replace(/\u0007/g, ']').replace(/\u000e/g, ',');

        const parts = [];
        let current = '';
        let hasToken = false;
        let inQuotes = false;
        let quoteChar = '';
        let subDepth = 0;       // inside $( ... ): kept verbatim and executed later
        let anyQuote = false;

        const flush = () => {
            if (current || hasToken) {
                // Expand variables before adding to parts
                const expanded = this.expandVariables(current);
                // Unquoted command substitution results are split into words, like bash does
                if (!anyQuote && /\$\(/.test(current) && /\s/.test(expanded.trim())) {
                    expanded.trim().split(/\s+/).forEach(w => parts.push(w));
                } else {
                    parts.push(expanded);
                }
                current = '';
            }
            hasToken = false;
            anyQuote = false;
        };

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            // $(command substitution): copy verbatim, including spaces and quotes
            if (subDepth > 0) {
                current += char;
                if (char === '(') subDepth++;
                else if (char === ')') subDepth--;
                continue;
            }
            if (char === '$' && line[i + 1] === '(' && !(inQuotes && quoteChar === "'")) {
                current += '$(';
                i++;
                subDepth = 1;
                hasToken = true;
                continue;
            }

            if ((char === '"' || char === "'") && (i === 0 || line[i-1] !== '\\')) {
                anyQuote = true;
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                    hasToken = true;
                } else if (char === quoteChar) {
                    inQuotes = false;
                    quoteChar = '';
                } else {
                    current += char;
                }
                // Don't include quotes in the final string
            } else if (char === ' ' && !inQuotes) {
                flush();
            } else if (inQuotes) {
                if (quoteChar === "'" && SINGLE[char]) current += SINGLE[char];
                else if (QUOTED[char]) current += QUOTED[char];
                else current += char;
            } else {
                current += char;
            }
        }
        flush();

        // Expand braces first, then globs, then put the protected characters back
        const braceExpanded = this.expandBraces(parts);
        return this.expandGlobs(braceExpanded).map(restore);
    }

    expandBraces(parts) {
        // Expand brace patterns like {a,b,c} and {1..10}
        const expanded = [];

        for (const part of parts) {
            if (this.hasBracePattern(part)) {
                const matches = this.expandBracePattern(part);
                expanded.push(...matches);
            } else {
                expanded.push(part);
            }
        }

        return expanded;
    }

    hasBracePattern(str) {
        // Check for brace expansion pattern
        return /\{[^}]+\}/.test(str);
    }

    expandBracePattern(str) {
        // Find first brace pattern
        const match = str.match(/\{([^}]+)\}/);
        if (!match) return [str];

        const fullPattern = match[0];
        const content = match[1];
        const prefix = str.substring(0, match.index);
        const suffix = str.substring(match.index + fullPattern.length);

        // Check if it's a range pattern {a..z} or {1..10}
        const rangeMatch = content.match(/^(\d+|[a-z])\.\.(\d+|[a-z])$/i);
        if (rangeMatch) {
            const [, start, end] = rangeMatch;
            const items = this.generateRange(start, end);
            const results = [];

            for (const item of items) {
                const expanded = prefix + item + suffix;
                // Recursively expand if there are more braces
                if (this.hasBracePattern(expanded)) {
                    results.push(...this.expandBracePattern(expanded));
                } else {
                    results.push(expanded);
                }
            }

            return results;
        }

        // Otherwise it's a list {a,b,c}
        const items = content.split(',');
        const results = [];

        for (const item of items) {
            const expanded = prefix + item.trim() + suffix;
            // Recursively expand if there are more braces
            if (this.hasBracePattern(expanded)) {
                results.push(...this.expandBracePattern(expanded));
            } else {
                results.push(expanded);
            }
        }

        return results;
    }

    generateRange(start, end) {
        // Generate range for numeric or alphabetic sequences
        const items = [];

        if (/^\d+$/.test(start) && /^\d+$/.test(end)) {
            // Numeric range
            const startNum = parseInt(start);
            const endNum = parseInt(end);
            const step = startNum <= endNum ? 1 : -1;

            for (let i = startNum; step > 0 ? i <= endNum : i >= endNum; i += step) {
                items.push(String(i));
            }
        } else if (/^[a-z]$/i.test(start) && /^[a-z]$/i.test(end)) {
            // Alphabetic range
            const startCode = start.charCodeAt(0);
            const endCode = end.charCodeAt(0);
            const step = startCode <= endCode ? 1 : -1;

            for (let i = startCode; step > 0 ? i <= endCode : i >= endCode; i += step) {
                items.push(String.fromCharCode(i));
            }
        }

        return items;
    }

    expandGlobs(parts) {
        // Expand glob patterns like *.txt, file?.txt, file[1-3].txt
        const expanded = [];

        for (const part of parts) {
            // Check if part contains glob characters and is not quoted
            if (this.hasGlobPattern(part)) {
                const matches = this.matchGlob(part);
                if (matches.length > 0) {
                    expanded.push(...matches.sort());
                } else {
                    // No matches, keep the pattern as-is (bash behavior)
                    expanded.push(part);
                }
            } else {
                expanded.push(part);
            }
        }

        return expanded;
    }

    hasGlobPattern(str) {
        // Check if string contains unescaped glob characters
        return /[*?[\]]/.test(str) && !str.includes('\\*') && !str.includes('\\?');
    }

    matchGlob(pattern) {
        // Convert glob pattern to regex and match against filesystem
        const matches = [];

        // Determine if pattern has a path component
        const lastSlash = pattern.lastIndexOf('/');
        let dirPath = '.';
        let filePattern = pattern;

        if (lastSlash > -1) {
            dirPath = pattern.substring(0, lastSlash) || '/';
            filePattern = pattern.substring(lastSlash + 1);
        }

        // Resolve directory path
        const resolvedDir = this.fs.resolvePath(dirPath);
        const dirNode = this.fs.getNode(resolvedDir);

        if (!dirNode || dirNode.type !== 'directory') {
            return [];
        }

        // Convert glob pattern to regex
        const regex = this.globToRegex(filePattern);

        // Match files in directory
        for (const [name, node] of Object.entries(dirNode.children || {})) {
            if (regex.test(name)) {
                const fullPath = dirPath === '.' ? name : `${dirPath}/${name}`;
                matches.push(fullPath);
            }
        }

        return matches;
    }

    globToRegex(pattern) {
        // Convert glob pattern to regex
        // * matches any characters except /
        // ? matches single character except /
        // [abc] matches any character in set
        // [a-z] matches range
        let regexStr = '^';

        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];

            if (char === '*') {
                regexStr += '[^/]*';
            } else if (char === '?') {
                regexStr += '[^/]';
            } else if (char === '[') {
                // Find closing bracket
                const closeIdx = pattern.indexOf(']', i + 1);
                if (closeIdx > -1) {
                    const charClass = pattern.substring(i + 1, closeIdx);
                    regexStr += '[' + charClass.replace(/\\/g, '\\\\') + ']';
                    i = closeIdx;
                } else {
                    regexStr += '\\[';
                }
            } else {
                // Escape regex special characters
                regexStr += char.replace(/[.+^${}()|\\]/g, '\\$&');
            }
        }

        regexStr += '$';
        return new RegExp(regexStr);
    }

    expandVariables(str) {
        // Expand environment variables: $VAR or ${VAR}
        // Also handle command substitution: $(command)

        // First, handle command substitution $(...)
        str = str.replace(/\$\(([^)]+)\)/g, (match, command) => {
            // Execute the command and capture its output
            try {
                const result = this.executeCommandForSubstitution(command.trim());
                // Return stdout, trimming trailing newline (bash behavior)
                return result.stdout.replace(/\n$/, '');
            } catch (err) {
                // If command fails, return empty string
                return '';
            }
        });

        // $? is the exit status of the previous command line
        str = str.replace(/\$\?/g, () => String(this.commands.lastExitCode || 0));

        // Then expand variables
        str = str.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (match, varName) => {
            if (this.commands.env && this.commands.env.hasOwnProperty(varName)) {
                return this.commands.env[varName];
            }
            return ''; // Unknown variables expand to empty string
        });

        return str;
    }

    executeCommandForSubstitution(commandLine) {
        // Execute command for $() substitution without adding to output
        const { commands: cmdChain, error: parseError } = this.parseRedirection(commandLine);

        if (parseError) {
            return { stdout: '', stderr: parseError, exitCode: 1 };
        }

        // Execute the command chain silently (no output to terminal)
        let stdin = '';
        let finalResult = { stdout: '', stderr: '', exitCode: 0 };

        for (let i = 0; i < cmdChain.length; i++) {
            const cmdInfo = cmdChain[i];
            const { command, args } = cmdInfo;

            try {
                const cmdFn = this.commandMethod(command);
                if (cmdFn) {
                    const result = cmdFn.call(this.commands, args, stdin);

                    // Normalize legacy format
                    if (result.output !== undefined || result.error !== undefined) {
                        finalResult = {
                            stdout: result.output || '',
                            stderr: result.error || '',
                            exitCode: result.error ? 1 : 0
                        };
                    } else {
                        finalResult = result;
                    }

                    // For pipes, pass stdout to next command
                    if (i < cmdChain.length - 1) {
                        stdin = finalResult.stdout;
                    }
                } else {
                    finalResult = { stdout: '', stderr: `${command}: command not found`, exitCode: 127 };
                    break;
                }
            } catch (err) {
                finalResult = { stdout: '', stderr: `Error: ${err.message}`, exitCode: 1 };
                break;
            }
        }

        return finalResult;
    }

    addOutput(html) {
        const div = document.createElement('div');
        div.className = 'output-line';
        div.innerHTML = html;
        this.output.appendChild(div);

        // Always scroll to bottom when new output is added
        this.scrollToBottom();
    }

    clearTerminal() {
        this.output.innerHTML = '';
        // Scroll to top to simulate real terminal behavior
        const terminalBody = document.getElementById('terminal');
        if (terminalBody) {
            terminalBody.scrollTop = 0;
        }
        // Also scroll the terminal-output container if it exists
        const output = document.querySelector('.terminal-output');
        if (output) {
            output.scrollTop = 0;
        }
    }

    resetFilesystem() {
        if (this.examMode) {
            const confirmed = confirm('Reset will end exam mode and clear all progress. Continue?');
            if (!confirmed) return;

            if (this.examTimer) {
                clearInterval(this.examTimer);
                this.examTimer = null;
            }
            this.examMode = false;
            this.selectedScenario = null;

            this.restoreOriginalSidebar();

            document.getElementById('examTimer').style.display = 'none';
            document.getElementById('examBtn').textContent = '🎓 Exam Mode';
            document.getElementById('examBtn').classList.remove('active');
        }

        this.world.clear();
        this.fs = new VirtualFilesystem();
        this.commands = new RHCSACommands(this.fs);
        this.world = new WorldState(this);
        this.world.markPristine();
        this.history = [];

        // Clear terminal output completely
        this.output.innerHTML = '';

        // Show welcome message again
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        welcomeDiv.innerHTML = `<div class="welcome-message"><pre class="ascii-box">╔═══════════════════════════════════════════════════════════╗
║  Red Cat - a Red Hat Enterprise Linux 9 terminal          ║
║  By <a href="https://aaronamran.github.io/" target="_blank" style="color: #00ff00; text-decoration: underline;">@aaronamran</a>                                           ║
║                                                           ║
║  Browser-based CLI simulator for RHCSA exam preparation   ║
║  All commands run locally client-side                     ║
║  No data is sent to servers                               ║
╚═══════════════════════════════════════════════════════════╝</pre>
Welcome! This terminal simulates a RHEL 9 system with:
  • Virtual filesystem with /etc, /var, /home directories
  • User and group management
  • Package management (dnf/yum)
  • systemd service control
  • LVM and storage management
  • SELinux configuration
  • Network configuration
  • And much more!

Type 'help' for available commands
Type 'man &lt;command&gt;' for command documentation

Your machine is saved in this browser and survives refreshes; use Reset to start over.</div>`;
        this.output.appendChild(welcomeDiv);

        this.addOutput('<span class="success">Filesystem reset successfully.</span>');
        this.updatePrompt();

        this.saveSession();
    }

    // background job output and the [1]+ Done lines bash prints before a prompt
    startJobTicker() {
        if (this.jobTicker) return;
        this.jobTicker = setInterval(() => { try { this.flushJobs(true); } catch (e) { /* never break the terminal */ } }, 1000);
    }

    flushJobs(outputOnly) {
        this.startJobTicker();
        const c = this.commands;
        if (!c || !c._jobReap || this.inputMode) return;
        c._jobReap();
        const o = c._jobOutput();
        if (o) this.addOutput(`<span>${this.escapeStrayHtml(o)}</span>`);
        if (outputOnly) return;
        const t = c._jobNotices();
        if (t) this.addOutput(`<span>${this.escapeHtml(t)}</span>`);
    }

    updatePrompt() {
        const promptText = this.getPromptText();
        this.prompt.textContent = promptText;
    }

    getPromptText() {
        const user = this.fs.currentUser;
        const host = this.commands.hostname;
        const cwd = this.fs.currentPath;
        const path = cwd === this.fs.users[user].home
            ? '~'
            : (cwd === '/' ? '/' : cwd.split('/').filter(Boolean).pop());
        const symbol = user === 'root' ? '#' : '$';

        return `[${user}@${host} ${path}]${symbol} `;
    }

    scrollToBottom() {
        const terminal = document.getElementById('terminal');
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
            terminal.scrollTop = terminal.scrollHeight;
        });
    }

    // Look up the method implementing a command. 'env' and 'hostname' are state
    // properties on the command object, so their implementations live under other names.
    commandMethod(command) {
        // VAR=value (assignment) and VAR=value command args (one-off environment)
        const asg = /^([A-Za-z_][A-Za-z0-9_]*)=([\s\S]*)$/.exec(command);
        if (asg) {
            return (args, stdin) => {
                const env = this.commands.env;
                if (!args.length) {
                    env[asg[1]] = asg[2];
                    return { stdout: '', stderr: '', exitCode: 0 };
                }
                const had = Object.prototype.hasOwnProperty.call(env, asg[1]);
                const prev = env[asg[1]];
                env[asg[1]] = asg[2];
                const inner = this.commandMethod(args[0]);
                let res;
                try {
                    res = inner ? inner.call(this.commands, args.slice(1), stdin) : { stdout: '', stderr: `${args[0]}: command not found`, exitCode: 127 };
                } finally {
                    if (had) env[asg[1]] = prev; else delete env[asg[1]];
                }
                return res;
            };
        }
        if ((command === 'bash' || command === 'sh') && this.getShell()) {
            return (args, stdin) => this.getShell().bashCommand(command, args, stdin);
        }
        const aliases = { env: 'envCmd', hostname: 'hostnameCmd' };
        const fn = this.commands[aliases[command] || command];
        if (typeof fn !== 'function') return null;
        // programs that need a package (or only exist inside a container) are 'command not found' when it is missing
        if (command.charAt(0) !== '_' && this.commands._cmdGate) {
            const g = this.commands._cmdGate(command);
            if (g === false) return null;
            if (typeof g === 'function') return g;
        }
        return fn;
    }

    // Command output is inserted as HTML. Commands only emit <span> markup themselves,
    // so everything else (file contents, <placeholder> help text, & ) must be escaped.
    escapeStrayHtml(text) {
        return String(text)
            .replace(/&(?!(?:#\d+|[a-zA-Z]+);)/g, '&amp;')
            .replace(/<(?!\/?span\b)/g, '&lt;');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleTabCompletion() {
        if (this.inputMode) return;
        if (!this.completion && typeof CompletionEngine !== 'undefined') this.completion = new CompletionEngine(this);
        if (this.completion) {
            let r = null;
            try { r = this.completion.run(this.input.value, this.input.selectionStart === null || this.input.selectionStart === undefined ? this.input.value.length : this.input.selectionStart); } catch (err) { console.error('tab completion failed:', err); }
            if (r) {
                if (r.value !== null && r.value !== undefined) { this.input.value = r.value; try { this.input.setSelectionRange(r.cursor, r.cursor); } catch (e) { /* not focusable */ } }
                if (r.list || r.message) {
                    this.addOutput(`<div class="command-echo"><span class="prompt">${this.prompt.textContent}</span>${this.escapeHtml(this.input.value)}</div>`);
                    this.addOutput(`<span>${this.escapeHtml(r.list || r.message)}</span>`);
                    this.scrollToBottom();
                }
                return;
            }
        }
        const input = this.input.value;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];

        // Simple command completion (first word)
        if (parts.length === 1) {
            const availableCommands = Object.keys(this.commands)
                .filter(key => typeof this.commands[key] === 'function' && !key.startsWith('_'))
                .filter(key => !this.commands._cmdGate || this.commands._cmdGate(key) !== false)
                .filter(cmd => cmd.startsWith(lastPart));

            if (availableCommands.length === 1) {
                this.input.value = availableCommands[0] + ' ';
            } else if (availableCommands.length > 1) {
                this.addOutput(`<div class="command-echo"><span class="prompt">${this.getPromptText()}</span>${input}</div>`);
                this.addOutput(`<span class="info">${availableCommands.join('  ')}</span>`);
            }
        }

        // Path completion (simplified)
        // TODO: Implement full path completion
    }

    showScenarios() {
        const scenarios = `
<div class="info">
<h3>RHCSA Practice Scenarios</h3>

<strong>Scenario 1: User Management</strong>
1. Create a user 'john' with UID 2000
2. Set the password for john
3. Create a group 'developers' and add john to it
4. Create john's home directory

<strong>Scenario 2: File Permissions</strong>
1. Create a directory /data
2. Set permissions to 755
3. Create a file /data/shared.txt
4. Set permissions so owner can read/write, group can read, others nothing

<strong>Scenario 3: Package Management</strong>
1. List all installed packages
2. Install nginx package
3. Check if nginx is installed
4. Remove nginx package

<strong>Scenario 4: System Services</strong>
1. Check status of httpd service
2. Start httpd service
3. Enable httpd to start at boot
4. Verify httpd is enabled and active

<strong>Scenario 5: Basic Networking</strong>
1. Display current IP configuration
2. Check routing table
3. Ping localhost
4. Display hostname

<strong>Scenario 6: Log Analysis</strong>
1. View system logs in /var/log/messages
2. Use grep to find specific entries
3. Check secure log for SSH activity

<strong>Scenario 7: SELinux</strong>
1. Check current SELinux mode
2. Set SELinux to permissive mode
3. Check mode again

Try these scenarios to practice RHCSA skills!
Type 'help' to see all available commands.
</div>`;

        this.addOutput(scenarios);
    }

    // ===== EDITOR SUPPORT =====

    openEditor(editorType, filename, content = '') {
        // Hide terminal input
        const inputLine = document.querySelector('.input-line');
        if (inputLine) {
            this.savedInputLine = inputLine.style.display;
            inputLine.style.display = 'none';
        }

        // Initialize editor
        if (editorType === 'vi' || editorType === 'vim') {
            if (typeof ViEditor === 'undefined') {
                this.addOutput('Error: Vi editor not loaded');
                return;
            }
            this.activeEditor = new ViEditor(this, this.fs);
            this.activeEditor.open(filename, content);
        } else if (editorType === 'nano') {
            if (typeof NanoEditor === 'undefined') {
                this.addOutput('Error: Nano editor not loaded');
                return;
            }
            this.activeEditor = new NanoEditor(this, this.fs);
            this.activeEditor.open(filename, content);
        }
    }

    // ===== PAGER SUPPORT (less, more, man) =====

    // called by a command while a line runs; the pager opens once the whole line has finished
    queuePager(spec) {
        if (typeof Pager === 'undefined') return false;
        this.pendingPager = spec;
        return true;
    }

    openPendingPager() {
        const spec = this.pendingPager;
        this.pendingPager = null;
        if (!spec) return;
        this.input.blur();
        this.activePager = new Pager(this);
        this.activePager.open(spec);
    }

    restoreFromPager(leftBehind) {
        this.activePager = null;
        if (leftBehind) this.addOutput(`<span>${this.escapeStrayHtml(leftBehind)}</span>`);
        this.input.focus();
        this.updatePrompt();
        this.scrollToBottom();
        this.scheduleSave();
    }

    restoreFromEditor() {
        // Restore terminal input
        const inputLine = document.querySelector('.input-line');
        if (inputLine && this.savedInputLine !== undefined) {
            inputLine.style.display = this.savedInputLine;
        }

        this.activeEditor = null;
        this.input.focus();

        // Clear output and show prompt
        this.output.innerHTML = '';
        this.updatePrompt();
        if (this.afterEditor) {
            const cb = this.afterEditor;
            this.afterEditor = null;
            try { cb(); } catch (e) { console.error(e); }
        }
    }
}

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new Terminal();
});
