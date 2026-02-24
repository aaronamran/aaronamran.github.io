/**
 * Section 5: Running Systems
 * 3 unique question sets for practice variety
 */

const section5Data = {
    id: 5,
    title: "Running Systems",
    description: "Manage services, targets, and system processes with systemd",
    totalPoints: 32,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Start the httpd service",
                expected: [
                    { command: "systemctl", requiredValues: ["start", "httpd"] },
                    { command: "systemctl", requiredValues: ["start", "httpd.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "httpd"] }
                ],
                explanation: "systemctl start activates services immediately.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify httpd service is running",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "httpd"] },
                    { command: "systemctl", requiredValues: ["is-active", "httpd"] }
                ],
                explanation: "systemctl status shows detailed service state.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Enable httpd service to start at boot",
                expected: [
                    { command: "systemctl", requiredValues: ["enable", "httpd"] },
                    { command: "systemctl", requiredValues: ["enable", "httpd.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["is-enabled", "httpd"] }
                ],
                explanation: "systemctl enable creates symlinks for automatic startup.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Confirm httpd is enabled for boot",
                expected: [
                    { command: "systemctl", requiredValues: ["is-enabled", "httpd"] },
                    { command: "systemctl", requiredValues: ["status", "httpd"] }
                ],
                explanation: "is-enabled checks if service will start automatically.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set the default systemd target to multi-user.target",
                expected: [
                    { command: "systemctl", requiredValues: ["set-default", "multi-user.target"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["get-default"] }
                ],
                explanation: "set-default establishes which target boots by default.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Display the current default target",
                expected: [
                    { command: "systemctl", requiredValues: ["get-default"] },
                    { command: "readlink", requiredValues: ["/etc/systemd/system/default.target"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/systemd/system/default.target"] }
                ],
                explanation: "get-default shows the configured boot target. readlink or ls -l shows the symlink target directly.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "View journal logs for httpd service from the last boot only",
                expected: [
                    { command: "journalctl", requiredFlags: ["-u", "-b"], requiredValues: ["httpd"] },
                    { command: "journalctl", requiredFlags: ["-b"], requiredValues: ["-u", "httpd"] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -u filters by unit, -b shows only current boot.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Restart the chronyd service",
                expected: [
                    { command: "systemctl", requiredValues: ["restart", "chronyd"] },
                    { command: "systemctl", requiredValues: ["restart", "chronyd.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "chronyd"] }
                ],
                explanation: "restart stops and starts a service, applying configuration changes.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check chronyd service status",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "chronyd"] },
                    { command: "systemctl", requiredValues: ["is-active", "chronyd"] }
                ],
                explanation: "Verify service restarted successfully.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "List all failed services on the system",
                expected: [
                    { command: "systemctl", requiredFlags: ["--failed"] },
                    { command: "systemctl", requiredValues: ["list-units", "--failed"] }
                ],
                allowedPreChecks: [],
                explanation: "systemctl --failed quickly identifies problematic units.",
                points: 3
            },
            {
                id: 11,
                category: "Audit",
                description: "Display all currently loaded service units",
                expected: [
                    { command: "systemctl", requiredValues: ["list-units", "--type=service"] },
                    { command: "systemctl", requiredFlags: ["--type=service"] }
                ],
                explanation: "list-units with type filter shows specific unit categories.",
                points:  3
            },
            {
                id: 12,
                category: "Implementation",
                description: "View system boot messages from the current boot using journalctl",
                expected: [
                    { command: "journalctl", requiredFlags: ["-b"] },
                    { command: "journalctl", requiredFlags: ["-b", "0"] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -b shows messages from current boot session.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Stop the sshd service",
                expected: [
                    { command: "systemctl", requiredValues: ["stop", "sshd"] },
                    { command: "systemctl", requiredValues: ["stop", "sshd.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "sshd"] }
                ],
                explanation: "systemctl stop halts running services immediately.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify sshd service is stopped",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "sshd"] },
                    { command: "systemctl", requiredValues: ["is-active", "sshd"] }
                ],
                explanation: "Check service state shows inactive/stopped.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Disable sshd service from starting at boot",
                expected: [
                    { command: "systemctl", requiredValues: ["disable", "sshd"] },
                    { command: "systemctl", requiredValues: ["disable", "sshd.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["is-enabled", "sshd"] }
                ],
                explanation: "systemctl disable removes boot-time symlinks.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Confirm sshd is disabled",
                expected: [
                    { command: "systemctl", requiredValues: ["is-enabled", "sshd"] }
                ],
                explanation: "Should show 'disabled' status.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set the default systemd target to graphical.target",
                expected: [
                    { command: "systemctl", requiredValues: ["set-default", "graphical.target"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["get-default"] }
                ],
                explanation: "graphical.target boots into GUI mode.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify the default target is graphical",
                expected: [
                    { command: "systemctl", requiredValues: ["get-default"] }
                ],
                explanation: "Should display graphical.target.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "View journal logs with priority level error and above",
                expected: [
                    { command: "journalctl", requiredFlags: ["-p"], requiredValues: ["err"] },
                    { command: "journalctl", requiredFlags: ["-p"], requiredValues: ["3"] },
                    { command: "journalctl", requiredFlags: ["--priority"], requiredValues: ["err"] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -p filters by priority/severity level.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Reload the firewalld service configuration without full restart",
                expected: [
                    { command: "systemctl", requiredValues: ["reload", "firewalld"] },
                    { command: "systemctl", requiredValues: ["reload", "firewalld.service"] },
                    { command: "firewall-cmd", requiredValues: ["--reload"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "firewalld"] }
                ],
                explanation: "reload reloads configuration without stopping the service.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check firewalld service status",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "firewalld"] }
                ],
                explanation: "Verify service remains active after reload.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Display dependencies of the network.target",
                expected: [
                    { command: "systemctl", requiredValues: ["list-dependencies", "network.target"] }
                ],
                allowedPreChecks: [],
                explanation: "list-dependencies shows unit dependency tree.",
                points: 3
            },
            {
                id: 11,
                category: "Audit",
                description: "Show all socket units currently loaded",
                expected: [
                    { command: "systemctl", requiredValues: ["list-units", "--type=socket"] },
                    { command: "systemctl", requiredFlags: ["--type=socket"] }
                ],
                explanation: "Socket units provide IPC and network listening services.",
                points: 3
            },
            {
                id: 12,
                category: "Implementation",
                description: "View kernel messages from the current session",
                expected: [
                    { command: "journalctl", requiredFlags: ["-k"] },
                    { command: "journalctl", requiredFlags: ["--dmesg"] },
                    { command: "dmesg" }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -k or dmesg shows kernel ring buffer messages.",
                points: 3
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Enable and start the cockpit.socket service in one command",
                expected: [
                    { command: "systemctl", requiredValues: ["enable", "--now", "cockpit.socket"] },
                    { command: "systemctl", requiredFlags: ["--now"], requiredValues: ["enable", "cockpit.socket"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "cockpit.socket"] }
                ],
                explanation: "systemctl enable --now combines enable and start operations.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify cockpit.socket is active and enabled",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "cockpit.socket"] },
                    { command: "systemctl", requiredValues: ["is-active", "cockpit.socket"] }
                ],
                explanation: "Confirm both runtime state and boot configuration.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Mask the postfix service to prevent it from being started",
                expected: [
                    { command: "systemctl", requiredValues: ["mask", "postfix"] },
                    { command: "systemctl", requiredValues: ["mask", "postfix.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "postfix"] }
                ],
                explanation: "mask creates symlink to /dev/null, preventing service startup entirely.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Check if postfix is masked",
                expected: [
                    { command: "systemctl", requiredValues: ["is-enabled", "postfix"] },
                    { command: "systemctl", requiredValues: ["status", "postfix"] }
                ],
                explanation: "Masked units show 'masked' in their status.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Change to rescue.target immediately",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "rescue.target"] }
                ],
                allowedPreChecks: [],
                explanation: "isolate switches to a different target, stopping unnecessary services.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Display the currently active target",
                expected: [
                    { command: "systemctl", requiredValues: ["list-units", "--type=target"] },
                    { command: "systemctl", requiredFlags: ["--type=target"] }
                ],
                explanation: "Shows which targets are currently active.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "View journal logs for the last hour only",
                expected: [
                    { command: "journalctl", requiredFlags: ["--since"], requiredValues: ["\"1 hour ago\""] },
                    { command: "journalctl", requiredFlags: ["--since"], requiredValues: ["-1h"] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl --since filters entries by timestamp.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Kill the rsyslog service forcefully",
                expected: [
                    { command: "systemctl", requiredValues: ["kill", "rsyslog"] },
                    { command: "systemctl", requiredValues: ["kill", "rsyslog.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "rsyslog"] }
                ],
                explanation: "systemctl kill sends signals to service processes.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check if rsyslog is still running",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "rsyslog"] },
                    { command: "systemctl", requiredValues: ["is-active", "rsyslog"] }
                ],
                explanation: "Verify the kill signal terminated the process.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Show all timer units and their next activation time",
                expected: [
                    { command: "systemctl", requiredValues: ["list-timers"] },
                    { command: "systemctl", requiredValues: ["list-timers", "--all"] }
                ],
                allowedPreChecks: [],
                explanation: "Timer units schedule systemd service execution.",
                points: 3
            },
            {
                id: 11,
                category: "Audit",
                description: "Display properties of the sshd service",
                expected: [
                    { command: "systemctl", requiredValues: ["show", "sshd"] },
                    { command: "systemctl", requiredValues: ["show", "sshd.service"] }
                ],
                explanation: "show displays all service unit properties in detail.",
                points: 2
            },
            {
                id: 12,
                category: "Implementation",
                description: "Follow journal logs in real-time for the tuned service",
                expected: [
                    { command: "journalctl", requiredFlags: ["-u", "-f"], requiredValues: ["tuned"] },
                    { command: "journalctl", requiredFlags: ["-f"], requiredValues: ["-u", "tuned"] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -f follows log entries as they occur (like tail -f).",
                points: 3
            }
        ],
        
        // Set 4: Process management
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "Display all running processes with full details.",
                expected: [
                    { command: "ps", requiredFlags: ["aux"], requiredValues: [] },
                    { command: "ps", requiredFlags: ["-ef"], requiredValues: [] }
                ],
                explanation: "ps aux shows BSD-style listing. ps -ef shows UNIX-style with parent PIDs.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Find the process ID (PID) of httpd service.",
                expected: [
                    { command: "pidof", requiredValues: ["httpd"] },
                    { command: "pgrep", requiredValues: ["httpd"] },
                    { command: "ps", requiredFlags: ["aux"], requiredValues: ["|", "grep", "httpd"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "httpd"] }
                ],
                explanation: "pidof and pgrep find PIDs by process name. Faster than ps | grep.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display process tree showing parent-child relationships.",
                expected: [
                    { command: "pstree", requiredValues: [] },
                    { command: "ps", requiredFlags: ["auxf"], requiredValues: [] },
                    { command: "ps", requiredFlags: ["-ejH"], requiredValues: [] }
                ],
                explanation: "pstree shows hierarchical process tree. ps -ejH also shows hierarchy.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Monitor system processes in real-time using top.",
                expected: [
                    { command: "top", requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "top provides dynamic real-time view of running system. Press 'q' to quit.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Display top 10 CPU-consuming processes.",
                expected: [
                    { command: "ps", requiredFlags: ["aux", "--sort=-pcpu"], requiredValues: ["|", "head", "-10"] },
                    { command: "top", requiredFlags: ["-b", "-n", "1"], requiredValues: ["|", "head", "-20"] }
                ],
                explanation: "ps --sort sorts by CPU usage. -pcpu sorts descending (minus sign).",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Kill process with PID 1234 gracefully (SIGTERM).",
                expected: [
                    { command: "kill", requiredValues: ["1234"] },
                    { command: "kill", requiredFlags: ["-15"], requiredValues: ["1234"] },
                    { command: "kill", requiredFlags: ["-TERM"], requiredValues: ["1234"] }
                ],
                allowedPreChecks: [
                    { command: "ps", requiredFlags: ["-p"], requiredValues: ["1234"] }
                ],
                explanation: "kill without options sends SIGTERM (15). Allows graceful shutdown.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify process 1234 was terminated.",
                expected: [
                    { command: "ps", requiredFlags: ["-p"], requiredValues: ["1234"] },
                    { command: "kill", requiredFlags: ["-0"], requiredValues: ["1234"] }
                ],
                explanation: "ps -p checks specific PID. kill -0 tests if process exists without signaling.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Force kill all processes named 'badapp' (SIGKILL).",
                expected: [
                    { command: "pkill", requiredFlags: ["-9"], requiredValues: ["badapp"] },
                    { command: "killall", requiredFlags: ["-9"], requiredValues: ["badapp"] }
                ],
                allowedPreChecks: [
                    { command: "pgrep", requiredValues: ["badapp"] }
                ],
                explanation: "pkill kills by name. -9 (SIGKILL) forces immediate termination.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "List all signals that can be sent to processes.",
                expected: [
                    { command: "kill", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "Common signals: 1 (HUP), 9 (KILL), 15 (TERM), 18 (CONT), 19 (STOP).",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Display memory usage per process sorted by memory consumption.",
                expected: [
                    { command: "ps", requiredFlags: ["aux", "--sort=-rss"], requiredValues: [] },
                    { command: "ps", requiredFlags: ["aux", "--sort=-%mem"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "free", requiredFlags: ["-h"], requiredValues: [] }
                ],
                explanation: "--sort=-rss sorts by physical memory (RSS). -%mem sorts by percentage.",
                points: 3
            }
        ],
        
        // Set 5: Process priority
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Display nice values of all running processes.",
                expected: [
                    { command: "ps", requiredFlags: ["axo"], requiredValues: ["pid,ni,cmd"] },
                    { command: "ps", requiredFlags: ["aux"], requiredValues: [] }
                ],
                explanation: "Nice value ranges from -20 (highest priority) to 19 (lowest). Default is 0.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Start command 'sleep 300' with nice value 10.",
                expected: [
                    { command: "nice", requiredFlags: ["-n", "10"], requiredValues: ["sleep", "300"] },
                    { command: "nice", requiredFlags: ["-10"], requiredValues: ["sleep", "300"] }
                ],
                allowedPreChecks: [
                    { command: "nice", requiredValues: [] }
                ],
                explanation: "nice starts processes with adjusted priority. Positive values lower priority.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify the nice value of the sleep process.",
                expected: [
                    { command: "ps", requiredFlags: ["axo"], requiredValues: ["pid,ni,cmd", "|", "grep", "sleep"] },
                    { command: "ps", requiredFlags: ["aux"], requiredValues: ["|", "grep", "sleep"] }
                ],
                explanation: "NI column shows nice value. Should display 10.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Change nice value of process with PID 5678 to 5 using renice.",
                expected: [
                    { command: "renice", requiredFlags: ["-n", "5"], requiredValues: ["-p", "5678"] },
                    { command: "renice", requiredValues: ["5", "5678"] }
                ],
                allowedPreChecks: [
                    { command: "ps", requiredFlags: ["-p"], requiredValues: ["5678"] }
                ],
                explanation: "renice changes priority of running processes. -n specifies new nice value.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Confirm the nice value was changed for PID 5678.",
                expected: [
                    { command: "ps", requiredFlags: ["-p", "5678", "-o"], requiredValues: ["pid,ni,cmd"] },
                    { command: "ps", requiredFlags: ["aux"], requiredValues: ["|", "grep", "5678"] }
                ],
                explanation: "NI column should now show 5.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Start a background process with highest priority (nice -20).",
                expected: [
                    { command: "nice", requiredFlags: ["-n", "-20"], requiredValues: ["dd", "if=/dev/zero", "of=/dev/null"] }
                ],
                allowedPreChecks: [
                    { command: "ps", requiredFlags: ["aux"], requiredValues: [] }
                ],
                explanation: "Negative nice values require root. -20 is highest priority (real-time-like).",
                points: 4
            },
            {
                id: 7,
                category: "Audit",
                description: "List processes with nice value less than 0.",
                expected: [
                    { command: "ps", requiredFlags: ["axo"], requiredValues: ["pid,ni,cmd", "|", "awk", "'$2<0'"] },
                    { command: "ps", requiredFlags: ["aux"], requiredValues: ["|", "awk", "'$18<0'"] }
                ],
                explanation: "Negative nice values indicate high-priority processes.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Renice all processes owned by user 'appuser' to nice value 15.",
                expected: [
                    { command: "renice", requiredFlags: ["-n", "15"], requiredValues: ["-u", "appuser"] },
                    { command: "renice", requiredValues: ["15", "-u", "appuser"] }
                ],
                allowedPreChecks: [
                    { command: "ps", requiredFlags: ["-u"], requiredValues: ["appuser"] }
                ],
                explanation: "renice -u changes priority for all processes of a user.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Display current nice value (for your shell).",
                expected: [
                    { command: "nice", requiredValues: [] }
                ],
                explanation: "Running 'nice' without arguments shows nice value of current shell.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Show top 5 processes with lowest nice values (highest priority).",
                expected: [
                    { command: "ps", requiredFlags: ["axo"], requiredValues: ["pid,ni,cmd", "--sort=ni", "|", "head", "-5"] }
                ],
                allowedPreChecks: [
                    { command: "ps", requiredFlags: ["axo"], requiredValues: ["pid,ni,cmd"] }
                ],
                explanation: "--sort=ni sorts by nice value ascending (most negative first).",
                points: 3
            }
        ],
        
        // Set 6: tuned profiles
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Display currently active tuned profile.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "tuned daemon optimizes system performance for different workloads.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "List all available tuned profiles.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["list"] },
                    { command: "tuned-adm", requiredValues: ["profile_info"] }
                ],
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "Common profiles: balanced, powersave, throughput-performance, virtual-guest.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display recommended tuned profile for this system.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["recommend"] }
                ],
                explanation: "tuned analyzes hardware and recommends optimal profile.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Change tuned profile to 'throughput-performance'.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["profile", "throughput-performance"] }
                ],
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "throughput-performance maximizes disk and network throughput.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify the profile change was successful.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "Should show 'Current active profile: throughput-performance'.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Check if tuned service is running.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "tuned"] },
                    { command: "systemctl", requiredValues: ["is-active", "tuned"] }
                ],
                allowedPreChecks: [],
                explanation: "tuned must be running for profiles to take effect.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Display information about 'virtual-guest' profile.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["profile_info", "virtual-guest"] }
                ],
                explanation: "virtual-guest optimizes performance for VM guests.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Disable tuned and turn off profile optimizations.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["off"] },
                    { command: "systemctl", requiredValues: ["stop", "tuned"] }
                ],
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "tuned-adm off disables profile. System returns to default settings.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Confirm tuned is disabled.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "Should show 'No current active profile' when disabled.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Re-enable tuned with recommended profile.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["auto_profile"] },
                    { command: "systemctl", requiredValues: ["start", "tuned"] }
                ],
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["recommend"] }
                ],
                explanation: "auto_profile automatically selects recommended profile.",
                points: 3
            }
        ]
    }
};
