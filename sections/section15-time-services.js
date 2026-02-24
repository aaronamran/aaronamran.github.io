const section15Data = {
    id: 15,
    title: "Time & Date Services",
    description: "Configure system time, time zones, and NTP synchronization",
    totalPoints: 26,
    questionSets: {
        // Set 1: Basic time and date commands
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "Display current system date and time.",
                expected: [
                    { command: "date", requiredValues: [] },
                    { command: "timedatectl", requiredValues: [] }
                ],
                explanation: "date shows current time. timedatectl shows comprehensive time/timezone info.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Set system date manually.",
                expected: [
                    { command: "date", requiredValues: ["-s", "'2024-12-25", "10:30:00'"] },
                    { command: "timedatectl", requiredValues: ["set-time", "'2024-12-25", "10:30:00'"] }
                ],
                allowedPreChecks: [
                    { command: "date", requiredValues: [] }
                ],
                explanation: "Requires root. Disabled if NTP sync is enabled.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display hardware clock (RTC) time.",
                expected: [
                    { command: "hwclock", requiredValues: [] },
                    { command: "hwclock", requiredFlags: ["-r"], requiredValues: [] }
                ],
                explanation: "Hardware clock persists when system is off. Battery-powered.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Synchronize system clock to hardware clock.",
                expected: [
                    { command: "hwclock", requiredValues: ["--systohc"] },
                    { command: "hwclock", requiredFlags: ["-w"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "hwclock", requiredValues: [] }
                ],
                explanation: "--systohc writes system time to hardware clock. -w is short form.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Synchronize hardware clock to system clock.",
                expected: [
                    { command: "hwclock", requiredValues: ["--hctosys"] },
                    { command: "hwclock", requiredFlags: ["-s"], requiredValues: [] }
                ],
                explanation: "--hctosys reads hardware clock to system time. -s is short form.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Display current time zone.",
                expected: [
                    { command: "timedatectl", requiredValues: [] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/localtime"] }
                ],
                allowedPreChecks: [],
                explanation: "/etc/localtime symlink points to zone file in /usr/share/zoneinfo.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "List all available time zones.",
                expected: [
                    { command: "timedatectl", requiredValues: ["list-timezones"] },
                    { command: "ls", requiredValues: ["/usr/share/zoneinfo"] }
                ],
                explanation: "Hierarchical structure: Region/City (e.g., America/New_York).",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Set system time zone to America/New_York.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-timezone", "America/New_York"] }
                ],
                allowedPreChecks: [
                    { command: "timedatectl", requiredValues: [] }
                ],
                explanation: "Updates /etc/localtime symlink. Takes effect immediately.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check if system clock is set to UTC.",
                expected: [
                    { command: "timedatectl", requiredValues: [] },
                    { command: "cat", requiredValues: ["/etc/adjtime"] }
                ],
                explanation: "RTC in UTC mode is best practice for Linux servers.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Set hardware clock to use UTC.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-local-rtc", "0"] }
                ],
                allowedPreChecks: [
                    { command: "timedatectl", requiredValues: [] }
                ],
                explanation: "0 = UTC, 1 = local time. Use UTC except for Windows dual-boot.",
                points: 2
            }
        ],
        
        // Set 2: NTP and chrony configuration
        set2: [
            {
                id: 1,
                category: "Audit",
                description: "Check NTP synchronization status.",
                expected: [
                    { command: "timedatectl", requiredValues: [] },
                    { command: "timedatectl", requiredValues: ["status"] }
                ],
                explanation: "'NTP synchronized: yes' indicates active time sync.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Enable NTP synchronization.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-ntp", "true"] }
                ],
                allowedPreChecks: [
                    { command: "timedatectl", requiredValues: [] }
                ],
                explanation: "Enables automatic time synchronization via chronyd or systemd-timesyncd.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Disable NTP synchronization.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-ntp", "false"] }
                ],
                explanation: "Allows manual time setting. Not recommended for production.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Check chronyd service status.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "chronyd"] }
                ],
                allowedPreChecks: [],
                explanation: "chronyd is default NTP implementation in RHEL 8/9.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "View chrony NTP sources.",
                expected: [
                    { command: "chronyc", requiredValues: ["sources"] }
                ],
                explanation: "Shows configured NTP servers and sync status. * indicates current best.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "View detailed chrony tracking information.",
                expected: [
                    { command: "chronyc", requiredValues: ["tracking"] }
                ],
                allowedPreChecks: [
                    { command: "chronyc", requiredValues: ["sources"] }
                ],
                explanation: "Shows current time offset, drift rate, and sync status.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Edit chrony configuration file.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/chrony.conf"] },
                    { command: "cat", requiredValues: ["/etc/chrony.conf"] }
                ],
                explanation: "Main config at /etc/chrony.conf. Define NTP servers with 'server' or 'pool' directives.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Add custom NTP server to chrony configuration.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/chrony.conf"] },
                    { command: "echo", requiredValues: ["'server", "ntp.example.com", "iburst'", ">>", "/etc/chrony.conf"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["server", "/etc/chrony.conf"] }
                ],
                explanation: "iburst option speeds up initial sync. Use pool for server groups.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Restart chronyd after configuration change.",
                expected: [
                    { command: "systemctl", requiredValues: ["restart", "chronyd"] }
                ],
                explanation: "Required for chrony.conf changes to take effect.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Force immediate chrony time synchronization.",
                expected: [
                    { command: "chronyc", requiredValues: ["makestep"] }
                ],
                allowedPreChecks: [
                    { command: "chronyc", requiredValues: ["tracking"] }
                ],
                explanation: "Forces immediate step adjustment instead of gradual slew.",
                points: 2
            }
        ],
        
        // Set 3: Time synchronization monitoring
        set3: [
            {
                id: 1,
                category: "Audit",
                description: "View NTP server statistics.",
                expected: [
                    { command: "chronyc", requiredValues: ["sourcestats"] }
                ],
                explanation: "Shows polling intervals, sample count, and server reliability.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "View chrony NTP activity.",
                expected: [
                    { command: "chronyc", requiredValues: ["activity"] }
                ],
                allowedPreChecks: [],
                explanation: "Shows number of online/offline sources, selections.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Check if system can reach NTP servers.",
                expected: [
                    { command: "chronyc", requiredValues: ["sources", "-v"] }
                ],
                explanation: "Verbose mode shows reach status (octal bitmask of last 8 polls).",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "View chrony client access configuration.",
                expected: [
                    { command: "grep", requiredValues: ["allow", "/etc/chrony.conf"] },
                    { command: "chronyc", requiredValues: ["clients"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/chrony.conf"] }
                ],
                explanation: "allow directive permits NTP client access. chronyc clients shows connected clients.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify firewall allows NTP (UDP 123).",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] },
                    { command: "ss", requiredFlags: ["-ulnp"], requiredValues: ["|", "grep", ":123"] }
                ],
                explanation: "NTP uses UDP port 123. Add with: firewall-cmd --add-service=ntp --permanent",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "View chrony drift file.",
                expected: [
                    { command: "cat", requiredValues: ["/var/lib/chrony/drift"] }
                ],
                allowedPreChecks: [],
                explanation: "Records clock drift rate (ppm). Helps maintain accuracy between syncs.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Monitor chrony waitsync for time sync completion.",
                expected: [
                    { command: "chronyc", requiredValues: ["waitsync", "30", "0.01"] }
                ],
                explanation: "Waits up to 30 sec for sync within 0.01 sec. Useful in scripts.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "View chrony NTS (Network Time Security) status.",
                expected: [
                    { command: "chronyc", requiredValues: ["authdata"] }
                ],
                allowedPreChecks: [
                    { command: "chronyc", requiredValues: ["sources"] }
                ],
                explanation: "NTS provides authenticated NTP. Shows key and certificate status.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check system time offset from NTP.",
                expected: [
                    { command: "chronyc", requiredValues: ["tracking"] },
                    { command: "timedatectl", requiredValues: ["timesync-status"] }
                ],
                explanation: "System offset shows difference from true time. Should be milliseconds.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "View chrony command history and version.",
                expected: [
                    { command: "chronyc", requiredValues: ["-v"] },
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["chrony"] }
                ],
                allowedPreChecks: [],
                explanation: "chronyc -v shows version. Useful for compatibility checking.",
                points: 2
            }
        ],
        
        // Set 4: Advanced chrony configuration
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Configure chrony to act as NTP server.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/chrony.conf"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["allow", "/etc/chrony.conf"] }
                ],
                explanation: "Add: allow 192.168.1.0/24 to permit client network.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Configure makestep threshold.",
                expected: [
                    { command: "grep", requiredValues: ["makestep", "/etc/chrony.conf"] }
                ],
                explanation: "makestep 1 3 = step if offset > 1 sec, max 3 times after clock start.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Configure local stratum for offline operation.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/chrony.conf"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/chrony.conf"] }
                ],
                explanation: "local stratum 10 allows serving time even when NTP unreachable.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Configure chrony to use specific network interface.",
                expected: [
                    { command: "grep", requiredValues: ["bindaddress", "/etc/chrony.conf"] }
                ],
                explanation: "bindaddress 192.168.1.1 binds chronyd to specific IP.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set chrony drift file location.",
                expected: [
                    { command: "grep", requiredValues: ["driftfile", "/etc/chrony.conf"] }
                ],
                allowedPreChecks: [],
                explanation: "driftfile /var/lib/chrony/drift. Stores clock drift rate.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Configure chrony log directory.",
                expected: [
                    { command: "grep", requiredValues: ["logdir", "/etc/chrony.conf"] },
                    { command: "ls", requiredValues: ["/var/log/chrony"] }
                ],
                explanation: "logdir /var/log/chrony. Enable specific logs: log measurements statistics tracking",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Configure RTC (hardware clock) sync.",
                expected: [
                    { command: "grep", requiredValues: ["rtcsync", "/etc/chrony.conf"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/chrony.conf"] }
                ],
                explanation: "rtcsync enables kernel to sync hardware clock every 11 minutes.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Configure chrony to prefer specific NTP server.",
                expected: [
                    { command: "grep", requiredValues: ["prefer", "/etc/chrony.conf"] }
                ],
                explanation: "server ntp.example.com iburst prefer. Prefers this server when available.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Set chrony to require at least N sources.",
                expected: [
                    { command: "grep", requiredValues: ["minsources", "/etc/chrony.conf"] }
                ],
                allowedPreChecks: [],
                explanation: "minsources 2 requires >= 2 sources before sync. Improves reliability.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Configure rate limiting for chrony NTP server.",
                expected: [
                    { command: "grep", requiredValues: ["ratelimit", "/etc/chrony.conf"] }
                ],
                explanation: "ratelimit interval 3 burst 8 limits client request rate (DDoS protection).",
                points: 3
            }
        ],
        
        // Set 5: Time zone management  
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Search for time zone by city name.",
                expected: [
                    { command: "timedatectl", requiredValues: ["list-timezones", "|", "grep", "London"] }
                ],
                allowedPreChecks: [],
                explanation: "Pipe list-timezones to grep for easier searching.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Set time zone to UTC.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-timezone", "UTC"] }
                ],
                explanation: "UTC is recommended for servers to avoid DST complications.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Display time in different time zone without changing system.",
                expected: [
                    { command: "TZ=America/Los_Angeles", requiredValues: ["date"] }
                ],
                allowedPreChecks: [],
                explanation: "TZ environment variable overrides default for single command.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "View time zone database version.",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["tzdata"] },
                    { command: "dnf", requiredValues: ["info", "tzdata"] }
                ],
                explanation: "tzdata package contains time zone definitions. Update regularly for DST changes.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set user-specific time zone.",
                expected: [
                    { command: "echo", requiredValues: ["'export", "TZ=Europe/Paris'", ">>", "~/.bashrc"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["TZ", "~/.bashrc"] }
                ],
                explanation: "TZ in .bashrc sets per-user zone without affecting system.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "View time zone information file directly.",
                expected: [
                    { command: "zdump", requiredValues: ["-v", "America/New_York"] },
                    { command: "cat", requiredValues: ["/usr/share/zoneinfo/America/New_York"] }
                ],
                explanation: "zdump shows DST transitions. Binary zone files in /usr/share/zoneinfo.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Compare time zones with zdump.",
                expected: [
                    { command: "zdump", requiredValues: ["America/New_York", "Europe/London", "Asia/Tokyo"] }
                ],
                allowedPreChecks: [],
                explanation: "zdump shows current time in multiple zones simultaneously.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Create custom time zone link.",
                expected: [
                    { command: "ln", requiredFlags: ["-s"], requiredValues: ["/usr/share/zoneinfo/America/New_York", "/etc/localtime"] }
                ],
                explanation: "Manual alternative to timedatectl set-timezone. Creates symlink.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "View all US time zones.",
                expected: [
                    { command: "timedatectl", requiredValues: ["list-timezones", "|", "grep", "America/"] },
                    { command: "ls", requiredValues: ["/usr/share/zoneinfo/America/"] }
                ],
                allowedPreChecks: [],
                explanation: "Time zones organized by region/country directories.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Check if Daylight Saving Time is active.",
                expected: [
                    { command: "date", requiredValues: ["+%Z"] },
                    { command: "timedatectl", requiredValues: ["|", "grep", "DST"] }
                ],
                explanation: "Abbreviation changes: EST/EDT, PST/PDT. RTC DST field in timedatectl output.",
                points: 2
            }
        ],
        
        // Set 6: Time troubleshooting
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Fix time drift by forcing immediate sync.",
                expected: [
                    { command: "chronyc", requiredValues: ["makestep"] },
                    { command: "systemctl", requiredValues: ["restart", "chronyd"] }
                ],
                allowedPreChecks: [
                    { command: "chronyc", requiredValues: ["tracking"] }
                ],
                explanation: "makestep jumps time immediately. Restart forces fresh server poll.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Diagnose why NTP sync is not working.",
                expected: [
                    { command: "chronyc", requiredValues: ["sources", "-v"] },
                    { command: "chronyc", requiredValues: ["sourcestats"] }
                ],
                explanation: "Check Reach column (should be 377). Check State for selection issues.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Test NTP server connectivity manually.",
                expected: [
                    { command: "chronyc", requiredValues: ["add", "server", "ntp.example.com"] },
                    { command: "nc", requiredFlags: ["-u"], requiredValues: ["ntp.example.com", "123"] }
                ],
                allowedPreChecks: [
                    { command: "ping", requiredValues: ["ntp.example.com"] }
                ],
                explanation: "Verify DNS resolution and UDP 123 port reachability.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Check chronyd logs for errors.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["chronyd"] },
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["chronyd", "-f"] }
                ],
                explanation: "Look for 'No suitable source' or 'Can't synchronise' messages.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Verify chronyd is enabled and running.",
                expected: [
                    { command: "systemctl", requiredValues: ["is-enabled", "chronyd"] },
                    { command: "systemctl", requiredValues: ["is-active", "chronyd"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "chronyd"] }
                ],
                explanation: "Should show 'enabled' and 'active'. Enable/start if not.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Fix large time offset preventing sync.",
                expected: [
                    { command: "timedatectl", requiredValues: ["set-ntp", "false"] },
                    { command: "timedatectl", requiredValues: ["set-time", "'correct-time'"] },
                    { command: "timedatectl", requiredValues: ["set-ntp", "true"] }
                ],
                explanation: "If offset too large, manually set approximate time then enable NTP.",
                points: 4
            },
            {
                id: 7,
                category: "Implementation",
                description: "Resolve chronyd bind errors.",
                expected: [
                    { command: "ss", requiredFlags: ["-ulnp"], requiredValues: ["|", "grep", ":123"] },
                    { command: "lsof", requiredFlags: ["-i"], requiredValues: [":123"] }
                ],
                allowedPreChecks: [
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["chronyd"] }
                ],
                explanation: "Check if another NTP daemon (ntpd) is using port 123.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Fix chronyd not starting after config error.",
                expected: [
                    { command: "chronyd", requiredFlags: ["-n"], requiredValues: [] },
                    { command: "journalctl", requiredFlags: ["-xe", "-u"], requiredValues: ["chronyd"] }
                ],
                explanation: "chronyd -n runs in foreground showing config errors.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Reset chrony state to fix persistent issues.",
                expected: [
                    { command: "systemctl", requiredValues: ["stop", "chronyd"] },
                    { command: "rm", requiredFlags: ["-f"], requiredValues: ["/var/lib/chrony/drift"] },
                    { command: "systemctl", requiredValues: ["start", "chronyd"] }
                ],
                allowedPreChecks: [],
                explanation: "Removing drift file forces clean state. Last resort for sync issues.",
                points: 4
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify system time matches upstream sources.",
                expected: [
                    { command: "chronyc", requiredValues: ["tracking"] },
                    { command: "date", requiredValues: [] },
                    { command: "chronyc", requiredValues: ["sources"] }
                ],
                explanation: "System offset should be < 1 second. Large offset indicates problem.",
                points: 2
            }
        ]
    }
};
