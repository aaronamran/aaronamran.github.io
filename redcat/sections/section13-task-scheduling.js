const section13Data = {
    id: 13,
    title: "Task Scheduling",
    description: "Schedule tasks with cron, at, and systemd timers",    totalPoints: 24,    questionSets: {
        // Set 1: Cron basics
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "Display current user's crontab.",
                expected: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "crontab -l lists scheduled cron jobs for current user.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Edit current user's crontab.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "crontab -e opens editor (EDITOR env var). Format: min hour day month weekday command",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Create cron job running script every day at 2:30 AM.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "30 2 * * * /path/to/script.sh. Fields: minute hour day month weekday.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create cron job running every hour at 15 minutes past.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "15 * * * * command. Asterisk (*) means every value.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Create cron job running every Monday at 9 AM.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "0 9 * * 1 command. Weekdays: 0=Sunday, 1=Monday, ..., 6=Saturday.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create cron job running every 5 minutes.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "*/5 * * * * command. Step values: */5 means every 5 units.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Remove all cron jobs for current user.",
                expected: [
                    { command: "crontab", requiredFlags: ["-r"], requiredValues: [] }
                ],
                explanation: "crontab -r removes entire crontab. Use with caution!",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "View another user's crontab as root.",
                expected: [
                    { command: "crontab", requiredFlags: ["-u"], requiredValues: ["username", "-l"] }
                ],
                allowedPreChecks: [],
                explanation: "crontab -u user -l. Only root can manage other users' crontabs.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Check crond service status.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "crond"] }
                ],
                explanation: "crond daemon must be running for cron jobs to execute.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "View cron logs for executed jobs.",
                expected: [
                    { command: "grep", requiredValues: ["CRON", "/var/log/cron"] },
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["crond"] }
                ],
                allowedPreChecks: [],
                explanation: "Cron job execution logged to /var/log/cron and journalctl.",
                points: 2
            }
        ],
        
        // Set 2: System cron directories
        set2: [
            {
                id: 1,
                category: "Audit",
                description: "List scripts in /etc/cron.daily directory.",
                expected: [
                    { command: "ls", requiredValues: ["/etc/cron.daily"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/cron.daily"] }
                ],
                explanation: "Scripts here run once daily via anacron/cron.daily.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create script in /etc/cron.daily for daily backups.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/cron.daily/backup"] },
                    { command: "chmod", requiredValues: ["+x", "/etc/cron.daily/backup"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/etc/cron.daily"] }
                ],
                explanation: "Scripts must be executable, no extension needed.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "View /etc/cron.hourly contents.",
                expected: [
                    { command: "ls", requiredValues: ["/etc/cron.hourly"] }
                ],
                explanation: "Scripts run every hour.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create job in /etc/cron.d directory.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/cron.d/custom-job"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/etc/cron.d"] }
                ],
                explanation: "/etc/cron.d uses crontab format with username: min hour day mon dow user command",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "View system-wide /etc/crontab file.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/crontab"] },
                    { command: "less", requiredValues: ["/etc/crontab"] }
                ],
                explanation: "System crontab includes username field after time specification.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Check when daily/weekly/monthly jobs run.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/anacrontab"] },
                    { command: "grep", requiredValues: ["daily", "/etc/anacrontab"] }
                ],
                allowedPreChecks: [],
                explanation: "anacron ensures periodic jobs run even if system was off.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "List allowed users for cron access.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/cron.allow"] }
                ],
                explanation: "If cron.allow exists, only listed users can use cron.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Deny specific user from using cron.",
                expected: [
                    { command: "echo", requiredValues: ["username", ">>", "/etc/cron.deny"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/cron.deny"] }
                ],
                explanation: "cron.deny blocks listed users. cron.allow takes precedence if exists.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Force anacron to run all jobs immediately.",
                expected: [
                    { command: "anacron", requiredFlags: ["-f"], requiredValues: [] }
                ],
                explanation: "anacron -f forces execution, ignoring timestamps.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "View timestamp of last anacron job execution.",
                expected: [
                    { command: "ls", requiredValues: ["/var/spool/anacron"] },
                    { command: "cat", requiredValues: ["/var/spool/anacron/cron.daily"] }
                ],
                allowedPreChecks: [],
                explanation: "Timestamps prevent jobs from running multiple times per period.",
                points: 2
            }
        ],
        
        // Set 3: at and batch commands
        set3: [
            {
                id: 1,
                category: "Audit",
                description: "Schedule one-time job with at command for tomorrow 10 AM.",
                expected: [
                    { command: "at", requiredValues: ["10:00", "tomorrow"] },
                    { command: "echo", requiredValues: ["|", "at", "10:00", "tomorrow"] }
                ],
                explanation: "at 10:00 tomorrow, then enter commands, Ctrl+D to finish.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "List all pending at jobs.",
                expected: [
                    { command: "atq", requiredValues: [] },
                    { command: "at", requiredFlags: ["-l"], requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "atq and at -l show queue. Job ID, time, and user displayed.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "View details of specific at job.",
                expected: [
                    { command: "at", requiredFlags: ["-c"], requiredValues: ["job_id"] }
                ],
                explanation: "at -c shows full job definition including environment.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Remove at job from queue.",
                expected: [
                    { command: "atrm", requiredValues: ["job_id"] },
                    { command: "at", requiredFlags: ["-d"], requiredValues: ["job_id"] }
                ],
                allowedPreChecks: [
                    { command: "atq", requiredValues: [] }
                ],
                explanation: "atrm or at -d deletes queued job. Use job ID from atq.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Schedule job for specific date and time.",
                expected: [
                    { command: "at", requiredValues: ["15:30", "12/25/2024"] },
                    { command: "at", requiredValues: ["3:30pm", "December", "25"] }
                ],
                explanation: "Many time formats accepted: HH:MM, now + N hours/days/weeks, specific dates.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Schedule job to run in 2 hours.",
                expected: [
                    { command: "at", requiredValues: ["now", "+", "2", "hours"] }
                ],
                allowedPreChecks: [],
                explanation: "Relative times: now + N minutes|hours|days|weeks|months",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Use batch command to run job when load permits.",
                expected: [
                    { command: "batch", requiredValues: [] }
                ],
                explanation: "batch runs job when system load < 0.8 (configurable). Like at but waits for low load.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Check atd service status.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "atd"] }
                ],
                allowedPreChecks: [],
                explanation: "atd daemon must be running for at/batch jobs to execute.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Control at access with /etc/at.allow.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/at.allow"] },
                    { command: "echo", requiredValues: ["username", ">>", "/etc/at.allow"] }
                ],
                explanation: "Like cron, at.allow/at.deny control user access.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Schedule job from file instead of interactive input.",
                expected: [
                    { command: "at", requiredValues: ["10:00", "-f", "/root/script.sh"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/root/script.sh"] }
                ],
                explanation: "at -f file time. Reads commands from file instead of stdin.",
                points: 3
            }
        ],
        
        // Set 4: Systemd timers basics
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "List all active systemd timers.",
                expected: [
                    { command: "systemctl", requiredValues: ["list-timers"] },
                    { command: "systemctl", requiredValues: ["list-timers", "--all"] }
                ],
                explanation: "Systemd timers are modern replacement for cron.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "View details of systemd timer.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "timer-name.timer"] },
                    { command: "systemctl", requiredValues: ["cat", "timer-name.timer"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["list-timers"] }
                ],
                explanation: "Each .timer unit activates corresponding .service unit.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Create simple systemd timer unit file.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/mytask.timer"] }
                ],
                explanation: "[Timer] section: OnCalendar= (absolute) or OnBootSec=/OnUnitActiveSec= (relative).",
                points: 4
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create corresponding service unit for timer.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/mytask.service"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/etc/systemd/system/mytask.timer"] }
                ],
                explanation: "Service unit defines what to execute. Timer unit defines when.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Enable and start systemd timer.",
                expected: [
                    { command: "systemctl", requiredValues: ["enable", "--now", "mytask.timer"] },
                    { command: "systemctl", requiredValues: ["start", "mytask.timer"] }
                ],
                explanation: "Enable makes timer persistent across reboots. Start activates immediately.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "View when timer will next trigger.",
                expected: [
                    { command: "systemctl", requiredValues: ["list-timers", "mytask.timer"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "mytask.timer"] }
                ],
                explanation: "Shows 'NEXT' column with next activation time.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "View timer logs in journal.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["mytask.timer"] },
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["mytask.service"] }
                ],
                explanation: "Check both timer and service logs for complete picture.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Create OnCalendar timer for daily execution at 3 AM.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/daily.timer"] }
                ],
                allowedPreChecks: [],
                explanation: "OnCalendar=daily or OnCalendar=*-*-* 03:00:00",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Test OnCalendar expression syntax.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["calendar", "daily"] },
                    { command: "systemd-analyze", requiredValues: ["calendar", "Mon", "*-*-1", "12:00"] }
                ],
                explanation: "systemd-analyze calendar validates and shows next occurrences.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Disable and stop systemd timer.",
                expected: [
                    { command: "systemctl", requiredValues: ["disable", "--now", "mytask.timer"] },
                    { command: "systemctl", requiredValues: ["stop", "mytask.timer"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "mytask.timer"] }
                ],
                explanation: "Disable removes from startup. Stop deactivates immediately.",
                points: 2
            }
        ],
        
        // Set 5: Advanced cron patterns
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Create cron job with range: weekdays only (Mon-Fri).",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "0 9 * * 1-5 command. Ranges use dash: 1-5 = Mon through Fri.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Create cron job with list: specific days.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "0 9 * * 1,3,5 command. Lists use comma: Mon, Wed, Fri.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create cron job using special strings.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "@reboot, @yearly, @annually, @monthly, @weekly, @daily, @midnight, @hourly",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Create cron job that runs at boot.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "@reboot /path/to/script. Executes once at system startup.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Redirect cron job output to log file.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "* * * * * command >> /var/log/cron-output.log 2>&1",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Set MAILTO variable in crontab for error emails.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "MAILTO=user@example.com at top of crontab. Empty MAILTO= disables mail.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Set PATH variable in crontab.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "PATH=/usr/bin:/bin at top. Cron has minimal default PATH.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Create cron job that runs twice daily.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "0 9,17 * * * command. Runs at 9 AM and 5 PM.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Create cron job for first day of every month.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "crontab", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "0 0 1 * * command. Runs at midnight on day 1.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Create job running every 30 minutes during business hours.",
                expected: [
                    { command: "crontab", requiredFlags: ["-e"], requiredValues: [] }
                ],
                explanation: "*/30 9-17 * * 1-5 command. Every 30 min, 9AM-5PM, Mon-Fri.",
                points: 4
            }
        ],
        
        // Set 6: Systemd timer advanced patterns
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Create timer running 5 minutes after boot.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/bootdelay.timer"] }
                ],
                allowedPreChecks: [],
                explanation: "OnBootSec=5min. Relative to system boot time.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Create timer running 10 minutes after last activation.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/recurring.timer"] }
                ],
                explanation: "OnUnitActiveSec=10min. Relative to last service activation.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create timer with AccuracySec for flexible scheduling.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/flexible.timer"] }
                ],
                allowedPreChecks: [],
                explanation: "AccuracySec=1h. Allows timer to trigger within window for power saving.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Create persistent timer that catches up missed runs.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/persistent.timer"] }
                ],
                explanation: "Persistent=true. If system was off, runs immediately on boot.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create timer for hourly execution using OnCalendar.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/hourly.timer"] }
                ],
                allowedPreChecks: [],
                explanation: "OnCalendar=hourly or OnCalendar=*:0/1. Multiple OnCalendar entries combine.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Create timer for weekly execution on Monday.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/weekly.timer"] }
                ],
                explanation: "OnCalendar=weekly or OnCalendar=Mon *-*-* 00:00:00",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Test timer immediately with systemctl start.",
                expected: [
                    { command: "systemctl", requiredValues: ["start", "mytask.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["list-units", "*mytask*"] }
                ],
                explanation: "Start .service directly to test without waiting for timer.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "View timer file with systemctl cat.",
                expected: [
                    { command: "systemctl", requiredValues: ["cat", "timer-name.timer"] }
                ],
                explanation: "Shows timer unit file content including drop-ins.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Reload systemd after creating/editing timer.",
                expected: [
                    { command: "systemctl", requiredValues: ["daemon-reload"] }
                ],
                allowedPreChecks: [],
                explanation: "Required after editing unit files in /etc/systemd/system/.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Create timer running on specific calendar dates.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/systemd/system/specific.timer"] }
                ],
                explanation: "OnCalendar=2024-12-25 09:00:00. ISO format for specific dates.",
                points: 3
            }
        ]
    }
};
