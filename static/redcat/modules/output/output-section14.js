/** Red Cat - Section 14: Task Scheduling */

function generateSection14Output(command, input, tokens) {
    // crontab -l : list current user's crontab
    if (command === 'crontab' && input.includes('-l')) {
        return '# m h  dom mon dow   command\n30 2 * * * /home/student/scripts/backup.sh\n15 * * * * /usr/local/bin/sync.sh\n0 9 * * 1 /home/student/weekly-report.sh';
    }

    // crontab -r : remove crontab
    if (command === 'crontab' && input.includes('-r')) {
        return null; // silent success
    }

    // crontab -e : edit crontab
    if (command === 'crontab' && input.includes('-e')) {
        return null;
    }

    // crontab -u <user> -l : view another user's crontab
    if (command === 'crontab' && input.includes('-u') && input.includes('-l')) {
        return '# bob\'s crontab\n0 3 * * * /home/bob/cleanup.sh';
    }

    // systemctl status crond
    if (command === 'systemctl' && input.includes('status') && input.includes('crond')) {
        return '● crond.service - Command Scheduler\n   Loaded: loaded (/usr/lib/systemd/system/crond.service; enabled; vendor preset: enabled)\n   Active: active (running) since Mon 2026-04-07 08:00:00 EST; 1h 5min ago\n Main PID: 1142 (crond)\n   CGroup: /system.slice/crond.service\n           └─1142 /usr/sbin/crond -n';
    }

    // grep CRON /var/log/cron
    if (command === 'grep' && input.includes('CRON') && input.includes('/var/log/cron')) {
        return 'Apr  7 09:15:01 localhost CROND[8820]: (root) CMD (/usr/lib64/sa/sa1 1 1)\nApr  7 09:30:01 localhost CROND[8851]: (student) CMD (/home/student/scripts/backup.sh)\nApr  7 10:15:01 localhost CROND[9002]: (student) CMD (/usr/local/bin/sync.sh)';
    }

    // journalctl -u crond
    if (command === 'journalctl' && input.includes('-u') && input.includes('crond')) {
        return '-- Logs begin at Mon 2026-04-07 08:00:00 EST, end at Mon 2026-04-07 10:20:00 EST. --\nApr 07 08:00:01 localhost crond[1142]: (CRON) STARTUP (fork ok)\nApr 07 09:30:01 localhost crond[8851]: (student) CMD (/home/student/scripts/backup.sh)\nApr 07 10:15:01 localhost crond[9002]: (student) CMD (/usr/local/bin/sync.sh)';
    }

    // ls /etc/cron.daily
    if (command === 'ls' && input.includes('/etc/cron.daily')) {
        if (input.includes('-l')) {
            return 'total 24\n-rwx------. 1 root root 219 Aug  9  2024 logrotate\n-rwxr-xr-x. 1 root root 618 Aug  9  2024 man-db.cron\n-rwx------. 1 root root 208 Apr  1 12:00 backup';
        }
        return 'backup  logrotate  man-db.cron';
    }

    // ls /etc/cron.hourly
    if (command === 'ls' && input.includes('/etc/cron.hourly')) {
        return '0anacron';
    }

    // ls /etc/cron.d
    if (command === 'ls' && input.includes('/etc/cron.d')) {
        return '0hourly  custom-job  sysstat';
    }

    // cat /etc/crontab
    if ((command === 'cat' || command === 'less') && input.includes('/etc/crontab')) {
        return 'SHELL=/bin/bash\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n\n# For details see man 4 crontabs\n# m h  dom mon dow user  command\n17 *  * * * root  cd / && run-parts --report /etc/cron.hourly\n25 6  * * * root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n47 6  * * 7 root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )';
    }

    // cat /etc/anacrontab
    if ((command === 'cat' || command === 'grep') && input.includes('/etc/anacrontab')) {
        if (command === 'grep' && input.includes('daily')) {
            return '1\t5\tcron.daily\trun-parts /etc/cron.daily';
        }
        return '# /etc/anacrontab: configuration file for anacron\nSHELL=/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\nRANDOM_DELAY=45\nSTART_HOURS_RANGE=3-22\n#period in days   delay in minutes   job-identifier   command\n1\t5\tcron.daily\trun-parts /etc/cron.daily\n7\t25\tcron.weekly\trun-parts /etc/cron.weekly\n@monthly 45 cron.monthly run-parts /etc/cron.monthly';
    }

    // cat /etc/cron.allow
    if (command === 'cat' && input.includes('/etc/cron.allow')) {
        return 'root\nstudent';
    }

    // cat /etc/cron.deny
    if (command === 'cat' && input.includes('/etc/cron.deny')) {
        return '';
    }

    // anacron -f
    if (command === 'anacron' && input.includes('-f')) {
        return null;
    }

    // ls /var/spool/anacron
    if (command === 'ls' && input.includes('/var/spool/anacron')) {
        return 'cron.daily  cron.monthly  cron.weekly';
    }

    // cat /var/spool/anacron/cron.daily
    if (command === 'cat' && input.includes('/var/spool/anacron/cron.daily')) {
        return '20260407';
    }

    // atq / at -l : list at jobs
    if ((command === 'atq') || (command === 'at' && input.includes('-l'))) {
        return '1\tTue Apr  8 10:00:00 2026 a student\n2\tTue Apr  8 14:30:00 2026 a student';
    }

    // at -c <job>: view at job contents
    if (command === 'at' && input.includes('-c')) {
        return '#!/bin/sh\n# atrun uid=1000 gid=1000\n# mail student 0\numask 22\n...\necho "Backup starting" >> /tmp/backup.log\n/home/student/scripts/backup.sh >> /tmp/backup.log 2>&1';
    }

    // atrm or at -d : remove at job
    if (command === 'atrm' || (command === 'at' && input.includes('-d'))) {
        return null;
    }

    // systemctl list-timers
    if (command === 'systemctl' && input.includes('list-timers')) {
        return 'NEXT                          LEFT          LAST                          PASSED       UNIT                         ACTIVATES\nMon 2026-04-08 00:00:00 EST   13h 42min left Mon 2026-04-07 00:00:00 EST  10h 17min ago logrotate.timer              logrotate.service\nMon 2026-04-07 15:40:56 EST   4min 58s left  Mon 2026-04-07 14:40:56 EST  54min 59s ago systemd-tmpfiles-clean.timer systemd-tmpfiles-clean.service\n\n2 timers listed.';
    }

    // systemctl cat <timer>
    if (command === 'systemctl' && input.includes('cat') && input.includes('.timer')) {
        return '# /usr/lib/systemd/system/logrotate.timer\n[Unit]\nDescription=Daily rotation of log files\n\n[Timer]\nOnCalendar=daily\nAccuracySec=1h\nPersistent=true\n\n[Install]\nWantedBy=timers.target';
    }

    return null;
}

function generateSection14PreCheck(task, command, input, tokens) {
    // before editing crontab — show it's empty
    if (command === 'crontab' && input.includes('-l')) {
        return 'no crontab for student';
    }

    // ls before creating /etc/cron.daily/backup
    if (command === 'ls' && input.includes('/etc/cron.daily')) {
        return 'logrotate  man-db.cron';
    }

    // ls before creating /etc/cron.d/custom-job
    if (command === 'ls' && input.includes('/etc/cron.d')) {
        return '0hourly  sysstat';
    }

    return null;
}
/** Red Cat - Section 13: Software Management */

