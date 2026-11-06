/**
 * Section 9: System Tuning & Analysis
 * NEW SECTION - Critical for RHCSA EX200
 * 3 unique question sets for practice variety
 * 
 * Focus areas:
 * - tuned-adm (system performance profiles)
 * - journalctl (systemd journal analysis)
 * - Persistent journal configuration
 */

const section9Data = {
    id: 9,
    title: "System Tuning & Analysis",
    description: "Master system performance tuning with tuned and advanced log analysis with journalctl.",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Install the tuned service package.",
                expected: {
                    command: "dnf",
                    requiredFlags: ["-y"],
                    requiredValues: ["install", "tuned"]
                },
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["list", "tuned"] },
                    { command: "rpm", requiredValues: ["-q", "tuned"] }
                ],
                explanation: "The tuned daemon provides adaptive system tuning profiles for different workloads.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Start and enable the tuned service to persist across reboots.",
                expected: {
                    command: "systemctl",
                    requiredValues: ["enable", "tuned"]
                },
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "tuned"] },
                    { command: "systemctl", requiredValues: ["is-enabled", "tuned"] }
                ],
                explanation: "Tuned must be running to apply performance profiles.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "List all available tuned profiles.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["list"] }
                ],
                explanation: "tuned-adm list shows profiles like throughput-performance, virtual-guest, balanced, etc.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Set the system tuning profile to 'throughput-performance'.",
                expected: {
                    command: "tuned-adm",
                    requiredValues: ["profile", "throughput-performance"]
                },
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] },
                    { command: "tuned-adm", requiredValues: ["list"] }
                ],
                explanation: "The throughput-performance profile optimizes for maximum throughput. Use 'tuned-adm profile <name>' to switch profiles.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify the currently active tuned profile.",
                expected: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "tuned-adm active shows which profile is currently in use.",
                points: 1
            },
            {
                id: 6,
                category: "Implementation",
                description: "Configure the system journal to be persistent by creating /var/log/journal directory.",
                expected: {
                    command: "mkdir",
                    requiredValues: ["/var/log/journal"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/var/log/journal"] },
                    { command: "journalctl", requiredValues: ["--disk-usage"] }
                ],
                explanation: "Creating /var/log/journal makes systemd journal persistent across reboots. After creating, restart systemd-journald.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Display only error-level messages from the system journal.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-p"], requiredValues: ["err"] },
                    { command: "journalctl", requiredValues: ["--priority=err"] }
                ],
                explanation: "journalctl -p err filters log entries by priority. Values: emerg, alert, crit, err, warning, notice, info, debug.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Show journal entries for the 'sshd' service only.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["sshd"] },
                    { command: "journalctl", requiredValues: ["--unit=sshd"] }
                ],
                explanation: "journalctl -u <service> filters logs for a specific systemd unit.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Display journal entries since yesterday.",
                expected: [
                    { command: "journalctl", requiredValues: ["--since", "yesterday"] },
                    { command: "journalctl", requiredFlags: ["--since"], requiredValues: ["yesterday"] }
                ],
                explanation: "journalctl --since allows time-based filtering. Formats: 'yesterday', '2 hours ago', 'YYYY-MM-DD HH:MM:SS'.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Show the last 50 lines of the system journal and follow new entries.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-n", "-f"], requiredValues: ["50"] },
                    { command: "journalctl", requiredValues: ["-n50", "-f"] }
                ],
                explanation: "journalctl -n <number> -f shows recent entries and follows (like tail -f).",
                points: 1
            }
        ],
        set2: [
            // Placeholder for set2 - similar structure with different tasks
            {
                id: 1,
                category: "Implementation",
                description: "Switch the tuned profile to 'virtual-guest' for virtualized environments.",
                expected: {
                    command: "tuned-adm",
                    requiredValues: ["profile", "virtual-guest"]
                },
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "The virtual-guest profile optimizes performance for virtual machines.",
                points: 3
            }
        ],
        set3: [
            // Placeholder for set3
            {
                id: 1,
                category: "Implementation",
                description: "Set the tuned profile to 'balanced' for general workloads.",
                expected: {
                    command: "tuned-adm",
                    requiredValues: ["profile", "balanced"]
                },
                allowedPreChecks: [
                    { command: "tuned-adm", requiredValues: ["active"] }
                ],
                explanation: "The balanced profile provides a compromise between power saving and performance.",
                points: 3
            }
        ]
    }
};
