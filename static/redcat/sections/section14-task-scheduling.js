const section14Data = {
    id: 14,
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
                category: "Implementation",
                description: "Write the crontab entry that runs /usr/local/bin/backup.sh every day at 2:30 AM.",
                expected: [{ match: ["^30 0?2 \\* \\* \\* /usr/local/bin/backup\\.sh$","^echo [\"']30 0?2 \\* \\* \\* /usr/local/bin/backup\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']30 0?2 \\* \\* \\* /usr/local/bin/backup\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Fields: minute (30) hour (2) day-of-month (*) month (*) day-of-week (*). Add it with crontab -e.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Write the crontab entry that runs /usr/local/bin/check.sh at 15 minutes past every hour.",
                expected: [{ match: ["^15 \\* \\* \\* \\* /usr/local/bin/check\\.sh$","^echo [\"']15 \\* \\* \\* \\* /usr/local/bin/check\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']15 \\* \\* \\* \\* /usr/local/bin/check\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Minute 15, every hour, every day: 15 * * * *.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Write the crontab entry that runs /usr/local/bin/report.sh every Monday at 9 AM.",
                expected: [{ match: ["^0 0?9 \\* \\* (?:1|Mon|mon) /usr/local/bin/report\\.sh$","^echo [\"']0 0?9 \\* \\* (?:1|Mon|mon) /usr/local/bin/report\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']0 0?9 \\* \\* (?:1|Mon|mon) /usr/local/bin/report\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Day-of-week 1 (or Mon) is Monday: 0 9 * * 1.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Write the crontab entry that runs /usr/local/bin/poll.sh every 5 minutes.",
                expected: [{ match: ["^(?:\\*/5|\\*/05|0,5,10,15,20,25,30,35,40,45,50,55) \\* \\* \\* \\* /usr/local/bin/poll\\.sh$","^echo [\"'](?:\\*/5|\\*/05|0,5,10,15,20,25,30,35,40,45,50,55) \\* \\* \\* \\* /usr/local/bin/poll\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"'](?:\\*/5|\\*/05|0,5,10,15,20,25,30,35,40,45,50,55) \\* \\* \\* \\* /usr/local/bin/poll\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "*/5 in the minute field means every 5 minutes.",
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
                description: "Write the /etc/cron.d entry that runs /usr/local/bin/cleanup.sh as root every day at 4:15 AM.",
                expected: [{ match: ["^15 0?4 \\* \\* \\* root /usr/local/bin/cleanup\\.sh$","^echo [\"']15 0?4 \\* \\* \\* root /usr/local/bin/cleanup\\.sh[\"'] ?>>? ?/etc/cron\\.d/\\S+$"] }],
                hint: "System cron format: minute hour day month weekday USER command",
                explanation: "Files in /etc/cron.d use the system crontab format: there is a sixth field with the user name before the command.",
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
                category: "Implementation",
                description: "Write the [Timer] line that makes mytask.timer fire every Monday at 09:00.",
                expected: [{ match: ["^OnCalendar=Mon(?: \\*-\\*-\\*)? 0?9:00(?::00)?$","^echo [\"']OnCalendar=Mon(?: \\*-\\*-\\*)? 0?9:00(?::00)?[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnCalendar=",
                explanation: "OnCalendar uses [weekday] [date] time. Check an expression with systemd-analyze calendar.",
                points: 4
            },
            {
                id: 4,
                category: "Implementation",
                description: "Write the [Service] line that makes mytask.service run /usr/local/bin/mytask.sh.",
                expected: [{ match: ["^ExecStart=/usr/local/bin/mytask\\.sh$","^echo [\"']ExecStart=/usr/local/bin/mytask\\.sh[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is ExecStart=",
                explanation: "A timer activates the service of the same name; ExecStart= is the command that service runs.",
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
                description: "Write the OnCalendar line for a timer that runs daily at 3 AM.",
                expected: [{ match: ["^OnCalendar=\\*-\\*-\\* 0?3:00(?::00)?$","^echo [\"']OnCalendar=\\*-\\*-\\* 0?3:00(?::00)?[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnCalendar=",
                explanation: "*-*-* 03:00:00 means every day at 03:00. (OnCalendar=daily means midnight.)",
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
                description: "Write the crontab entry that runs /opt/scripts/weekday.sh at 8:30 AM on weekdays (Monday to Friday).",
                expected: [{ match: ["^30 0?8 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/weekday\\.sh$","^echo [\"']30 0?8 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/weekday\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']30 0?8 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/weekday\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "A range in the day-of-week field: 1-5 (Mon-Fri).",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/mwf.sh at midnight on Monday, Wednesday and Friday.",
                expected: [{ match: ["^0 0 \\* \\* (?:1,3,5|Mon,Wed,Fri|mon,wed,fri) /opt/scripts/mwf\\.sh$","^echo [\"']0 0 \\* \\* (?:1,3,5|Mon,Wed,Fri|mon,wed,fri) /opt/scripts/mwf\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']0 0 \\* \\* (?:1,3,5|Mon,Wed,Fri|mon,wed,fri) /opt/scripts/mwf\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "A comma separated list in the day-of-week field: 1,3,5.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Write the crontab entry that uses a special string to run /opt/scripts/weekly.sh once a week.",
                expected: [{ match: ["^@weekly /opt/scripts/weekly\\.sh$","^echo [\"']@weekly /opt/scripts/weekly\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']@weekly /opt/scripts/weekly\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Special strings start with @ and replace the five time fields",
                explanation: "@weekly is shorthand for 0 0 * * 0. Others: @hourly, @daily, @monthly, @yearly, @reboot.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/startup.sh every time the system boots.",
                expected: [{ match: ["^@reboot /opt/scripts/startup\\.sh$","^echo [\"']@reboot /opt/scripts/startup\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']@reboot /opt/scripts/startup\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Special strings start with @ and replace the five time fields",
                explanation: "@reboot runs the job once when crond starts at boot.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/job.sh daily at 1:00 AM and appends stdout and stderr to /var/log/job.log.",
                expected: [{ match: ["^0 0?1 \\* \\* \\* /opt/scripts/job\\.sh ?(?:>> ?/var/log/job\\.log 2>&1|&>> ?/var/log/job\\.log)$","^echo [\"']0 0?1 \\* \\* \\* /opt/scripts/job\\.sh ?(?:>> ?/var/log/job\\.log 2>&1|&>> ?/var/log/job\\.log)[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']0 0?1 \\* \\* \\* /opt/scripts/job\\.sh ?(?:>> ?/var/log/job\\.log 2>&1|&>> ?/var/log/job\\.log)[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Use >> to append and 2>&1 to send stderr to the same place as stdout.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Write the crontab line that makes cron mail job output to admin@example.com.",
                expected: [{ match: ["^MAILTO=[\"']?admin@example\\.com[\"']?$","^echo [\"']MAILTO=[\"']?admin@example\\.com[\"']?[\"'] ?>>? ?\\S+$"] }],
                hint: "A VARIABLE=value line, not a job",
                explanation: "MAILTO is a variable line placed above the jobs in the crontab. MAILTO=\"\" disables mail.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Write the crontab line that sets PATH to /usr/local/bin:/usr/bin:/bin for the jobs.",
                expected: [{ match: ["^PATH=[\"']?/usr/local/bin:/usr/bin:/bin[\"']?$","^echo [\"']PATH=[\"']?/usr/local/bin:/usr/bin:/bin[\"']?[\"'] ?>>? ?\\S+$"] }],
                hint: "A VARIABLE=value line, not a job",
                explanation: "Cron runs jobs with a minimal PATH (/usr/bin:/bin); set PATH explicitly or use full paths.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/sync.sh at 6:00 AM and 6:00 PM every day.",
                expected: [{ match: ["^0 (?:0?6,18|6,18) \\* \\* \\* /opt/scripts/sync\\.sh$","^echo [\"']0 (?:0?6,18|6,18) \\* \\* \\* /opt/scripts/sync\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']0 (?:0?6,18|6,18) \\* \\* \\* /opt/scripts/sync\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "A comma separated list in the hour field: 6,18.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/monthly.sh at 3:00 AM on the first day of every month.",
                expected: [{ match: ["^0 0?3 1 \\* \\* /opt/scripts/monthly\\.sh$","^echo [\"']0 0?3 1 \\* \\* /opt/scripts/monthly\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"']0 0?3 1 \\* \\* /opt/scripts/monthly\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Day-of-month 1: 0 3 1 * *. (@monthly would run at midnight, not 3 AM.)",
                points: 3
            },
            {
                id: 10,
                category: "Implementation",
                description: "Write the crontab entry that runs /opt/scripts/poll.sh every 30 minutes from 9:00 to 17:59, Monday to Friday.",
                expected: [{ match: ["^(?:\\*/30|0,30) 9-17 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/poll\\.sh$","^echo [\"'](?:\\*/30|0,30) 9-17 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/poll\\.sh[\"'] ?(?:\\| ?crontab -|>>? ?\\S+)$","^\\(crontab -l(?: 2>/dev/null)?; echo [\"'](?:\\*/30|0,30) 9-17 \\* \\* (?:1-5|Mon-Fri|mon-fri) /opt/scripts/poll\\.sh[\"']\\) ?\\| ?crontab -$"] }],
                hint: "Format: minute hour day-of-month month day-of-week command",
                explanation: "Minute */30, hours 9-17, weekdays 1-5.",
                points: 4
            }
        ],
        
        // Set 6: Systemd timer advanced patterns
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Write the [Timer] line that starts the unit 5 minutes after boot.",
                expected: [{ match: ["^OnBootSec=(?:5min|5m|300s|300)$","^echo [\"']OnBootSec=(?:5min|5m|300s|300)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnBootSec=",
                explanation: "OnBootSec is relative to system boot (monotonic timer).",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Write the [Timer] line that starts the unit again 10 minutes after it was last activated.",
                expected: [{ match: ["^OnUnitActiveSec=(?:10min|10m|600s|600)$","^echo [\"']OnUnitActiveSec=(?:10min|10m|600s|600)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnUnitActiveSec=",
                explanation: "OnUnitActiveSec is relative to the last time the unit was activated.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Write the [Timer] line that lets the timer fire up to 1 minute later than scheduled to save wakeups.",
                expected: [{ match: ["^AccuracySec=(?:1min|1m|60s|60)$","^echo [\"']AccuracySec=(?:1min|1m|60s|60)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is AccuracySec=",
                explanation: "AccuracySec sets the window in which systemd may delay the trigger (default 1min).",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Write the [Timer] line that makes a missed run (system was off) execute at the next boot.",
                expected: [{ match: ["^Persistent=(?:true|yes|1|on)$","^echo [\"']Persistent=(?:true|yes|1|on)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is Persistent=",
                explanation: "Persistent=true stores the last trigger time on disk and catches up missed OnCalendar runs.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Write the OnCalendar line for a timer that runs every hour.",
                expected: [{ match: ["^OnCalendar=(?:hourly|\\*-\\*-\\* \\*:00:00|\\*:00(?::00)?|\\*:0)$","^echo [\"']OnCalendar=(?:hourly|\\*-\\*-\\* \\*:00:00|\\*:00(?::00)?|\\*:0)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnCalendar=",
                explanation: "hourly is shorthand for *-*-* *:00:00.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Write the OnCalendar line for a timer that runs every Monday at 00:00.",
                expected: [{ match: ["^OnCalendar=(?:weekly|Mon|Mon \\*-\\*-\\* 00:00:00|Mon 00:00(?::00)?)$","^echo [\"']OnCalendar=(?:weekly|Mon|Mon \\*-\\*-\\* 00:00:00|Mon 00:00(?::00)?)[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnCalendar=",
                explanation: "weekly is shorthand for Mon *-*-* 00:00:00.",
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
                category: "Implementation",
                description: "Write the OnCalendar line for a timer that runs at midnight on the 1st and 15th of every month.",
                expected: [{ match: ["^OnCalendar=\\*-\\*-(?:1,15|01,15) 00:00(?::00)?$","^echo [\"']OnCalendar=\\*-\\*-(?:1,15|01,15) 00:00(?::00)?[\"'] ?>>? ?\\S+$"] }],
                hint: "Directive name is OnCalendar=",
                explanation: "A comma separated list in the day field: *-*-01,15 00:00:00.",
                points: 3
            }
        ]
    }
};
