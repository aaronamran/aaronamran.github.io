/** Red Cat - Section 4 */

function generateSection4Output(command, input, tokens) {
    // Script execution: ./script.sh or bash/sh script.sh
    if (command.startsWith('./') || command === 'bash' || command === 'sh') {
        // Find the script name
        const scriptName = command.startsWith('./')
            ? command.substring(2)
            : tokens.find(t => t.endsWith('.sh') && !t.startsWith('-'));

        // bash -n = syntax check only — no output on success
        if (tokens.includes('-n')) return null;

        const isDebug = tokens.includes('-x');

        if (scriptName === 'hello.sh') {
            if (isDebug) return '+ echo \'Hello World\'\nHello World';
            return 'Hello World';
        }

        if (scriptName === 'userinfo.sh') {
            if (isDebug) return '+ MY_USER=root\n+ MY_HOST=server1.example.com\n+ echo root server1.example.com\nroot server1.example.com';
            return 'root\nserver1.example.com';
        }

        if (scriptName === 'args.sh') {
            // Collect args passed after the script name
            const scriptIdx = tokens.findIndex(t => t === scriptName || t === command);
            const scriptArgs = (scriptIdx >= 0 ? tokens.slice(scriptIdx + 1) : []).filter(t => !t.startsWith('-'));
            const args = scriptArgs.length > 0 ? scriptArgs : ['one', 'two', 'three'];
            if (isDebug) {
                return args.map(a => `+ echo ${a}\n${a}`).join('\n') + `\n+ echo ${args.length}\n${args.length}`;
            }
            return args.join('\n') + '\n' + args.length;
        }

        if (scriptName === 'checkargs.sh') {
            const scriptIdx = tokens.findIndex(t => t === scriptName || t === command);
            const scriptArgs = scriptIdx >= 0 ? tokens.slice(scriptIdx + 1).filter(t => !t.startsWith('-')) : [];
            if (scriptArgs.length !== 2) return 'Usage: checkargs.sh arg1 arg2';
            return null;
        }

        if (scriptName === 'documented.sh') {
            if (isDebug) return '+ echo \'Hello World\'\nHello World';
            return 'Hello World';
        }

        // Generic fallback for any other script - no visible output
        return null;
    }

    // grep commands - searching for patterns
    if (command === 'grep') {
        // Search /etc/hosts for localhost
        if (input.includes('localhost') && input.includes('/etc/hosts')) {
            return '127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n::1         localhost localhost.localdomain localhost6 localhost6.localdomain6';
        }
        // Case-insensitive search for 'error' in /var/log/messages
        if (input.match(/-i|--ignore-case/) && input.includes('error') && input.includes('/var/log/messages')) {
            return 'Feb 23 10:15:32 server1 kernel: ERROR: Device eth1 not found\nFeb 23 11:22:45 server1 systemd[1]: error: Failed to start service\nFeb 23 14:33:12 server1 audit: ERROR: audit_backlog limit exceeded';
        }
        // Search for 'Welcome' in /tmp/vitest.txt (after sed replacement)
        if (input.includes('Welcome') && input.includes('/tmp/vitest.txt')) {
            return 'Welcome RHCSA';
        }
        // Search for specific line numbers with -n
        if (input.includes('-n') && input.includes('root') && input.includes('/etc/passwd')) {
            return '1:root:x:0:0:root:/root:/bin/bash';
        }
        // Recursive grep in /etc for sshd_config mentions
        if (input.includes('-r') && input.includes('PermitRootLogin') && input.includes('/etc')) {
            return '/etc/ssh/sshd_config:PermitRootLogin no\n/etc/ssh/sshd_config.bak:PermitRootLogin yes';
        }
    }
    
    // wc commands - counting lines/words/bytes
    if (command === 'wc') {
        if (input.includes('-l')) {
            // Count lines in /etc/services
            if (input.includes('/etc/services')) {
                return '11473 /etc/services';
            }
            // Count error lines in /tmp/errors.txt
            if (input.includes('/tmp/errors.txt')) {
                return '3 /tmp/errors.txt';
            }
            // Count services in /tmp/services-count.txt
            if (input.includes('/tmp/services-count.txt')) {
                return '1 /tmp/services-count.txt';
            }
            // Count processes in /tmp/process-count.txt
            if (input.includes('/tmp/process-count.txt')) {
                return '1 /tmp/process-count.txt';
            }
            // Count lines in /tmp/vitest.txt (verification after sed)
            if (input.includes('/tmp/vitest.txt')) {
                return '2 /tmp/vitest.txt';
            }
        }
        if (input.includes('-w')) {
            // Word count
            if (input.includes('/tmp/vitest.txt')) {
                return '2 4 28 /tmp/vitest.txt';
            }
        }
    }
    
    // man/whatis/apropos commands - manual pages
    if (command === 'man') {
        if (input.includes('useradd')) {
            return 'USERADD(8)                System Management Commands               USERADD(8)\n\nNAME\n       useradd - create a new user or update default new user information\n\nSYNOPSIS\n       useradd [options] LOGIN\n\nDESCRIPTION\n       useradd is a low level utility for adding users.';
        }
        if (input.includes('fstab')) {
            return 'FSTAB(5)                    File Formats Manual                   FSTAB(5)\n\nNAME\n       fstab - static information about the filesystems\n\nDESCRIPTION\n       The file fstab contains descriptive information about the filesystems the\n       system can mount.';
        }
        if (input.includes('systemctl')) {
            return 'SYSTEMCTL(1)                    systemctl                   SYSTEMCTL(1)\n\nNAME\n       systemctl - Control the systemd system and service manager\n\nSYNOPSIS\n       systemctl [OPTIONS...] COMMAND [NAME...]';
        }
        if (input.includes('passwd') && input.includes('5')) {
            return 'PASSWD(5)                   File Formats Manual                  PASSWD(5)\n\nNAME\n       passwd - password file\n\nDESCRIPTION\n       /etc/passwd contains one line for each user account.';
        }
        if (input.includes('-k') && input.includes('network')) {
            return 'NetworkManager (8)   - network management daemon\nip (8)               - show / manipulate routing, network devices\nnmcli (1)            - command-line tool for controlling NetworkManager\nfirewall-cmd (1)     - firewall command line client';
        }
        if (input.includes('-k') && input.includes('firewall')) {
            return 'firewall-cmd (1)         - firewall command line client\nfirewall-config (1)      - firewall configuration tool\nfirewalld (1)            - Dynamic Firewall Manager';
        }
        if (input.includes('-f') && input.includes('systemctl')) {
            return 'systemctl (1)        - Control the systemd system and service manager';
        }
        if (hasFlags(input, 'wa') && input.includes('passwd')) {
            return '/usr/share/man/man1/passwd.1.gz\n/usr/share/man/man5/passwd.5.gz';
        }
    }
    
    if (command === 'whatis') {
        if (input.includes('systemctl')) {
            return 'systemctl (1)        - Control the systemd system and service manager';
        }
        if (input.includes('passwd')) {
            return 'passwd (1)           - update user\'s authentication tokens\npasswd (5)           - password file';
        }
        if (input.includes('apropos')) {
            return 'apropos (1)          - search the manual page names and descriptions';
        }
    }
    
    if (command === 'apropos') {
        if (input.includes('network')) {
            return 'NetworkManager (8)   - network management daemon\nip (8)               - show / manipulate routing, network devices\nnmcli (1)            - command-line tool for controlling NetworkManager\nnetstat (8)          - Print network connections, routing tables';
        }
        if (input.includes('firewall')) {
            return 'firewall-cmd (1)         - firewall command line client\nfirewall-config (1)      - firewall configuration tool\nfirewalld (1)            - Dynamic Firewall Manager';
        }
    }
    
    if (command === 'info' && input.includes('bash')) {
        return 'File: bash.info,  Node: Top\n\nBash Features\n*************\n\nThis text is a brief description of the features that are present in\nthe Bash shell (version 5.1, 21 December 2020).';
    }
    
    // find command outputs
    if (command === 'find') {
        // Find .log files in /var
        if (input.includes('/var') && input.includes('*.log')) {
            return '/var/log/messages.log\n/var/log/cron.log\n/var/log/secure.log\n/var/log/maillog\n/var/log/boot.log\n/var/log/httpd/access.log\n/var/log/httpd/error.log';
        }
        // Find large files in /home (>10MB)
        if (input.includes('/home') && input.includes('+10M')) {
            return '/home/alice/documents/video.mp4\n/home/alice/downloads/backup.tar.gz\n/home/bob/database.sql';
        }
        // Find recently modified files in /opt (-7 days)
        if (input.includes('/opt') && input.includes('-mtime') && input.includes('-7')) {
            return '/opt/app/config.xml\n/opt/data/updates.log\n/opt/scripts/backup.sh';
        }
        // Find empty files in /tmp
        if (input.includes('/tmp') && input.includes('-empty')) {
            return '/tmp/empty1.txt\n/tmp/empty2.log\n/tmp/.placeholder';
        }
    }
    
    // cat/less/more outputs for result files
    if (command === 'cat' || command === 'less' || command === 'more') {
        // /tmp/logfiles.txt - list of log files
        if (input.includes('/tmp/logfiles.txt')) {
            return '/var/log/messages.log\n/var/log/cron.log\n/var/log/secure.log\n/var/log/maillog\n/var/log/boot.log\n/var/log/httpd/access.log\n/var/log/httpd/error.log';
        }
        // /tmp/localhost-line.txt - grep result
        if (input.includes('/tmp/localhost-line.txt')) {
            return '127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n::1         localhost localhost.localdomain localhost6 localhost6.localdomain6';
        }
        // /tmp/large-files.txt - large files list
        if (input.includes('/tmp/large-files.txt')) {
            return '/home/alice/documents/video.mp4\n/home/alice/downloads/backup.tar.gz\n/home/bob/database.sql';
        }
        // /tmp/services-count.txt - line count result
        if (input.includes('/tmp/services-count.txt')) {
            return '11473';
        }
        // /tmp/recent-files.txt - recently modified files
        if (input.includes('/tmp/recent-files.txt')) {
            return '/opt/app/config.xml\n/opt/data/updates.log\n/opt/scripts/backup.sh';
        }
        // /tmp/errors.txt - grep error results
        if (input.includes('/tmp/errors.txt')) {
            return 'Feb 23 10:15:32 server1 kernel: ERROR: Device eth1 not found\nFeb 23 11:22:45 server1 systemd[1]: error: Failed to start service\nFeb 23 14:33:12 server1 audit: ERROR: audit_backlog limit exceeded';
        }
        // /tmp/empty-files.txt - empty files list
        if (input.includes('/tmp/empty-files.txt')) {
            return '/tmp/empty1.txt\n/tmp/empty2.log\n/tmp/.placeholder';
        }
        // /tmp/process-count.txt - process count
        if (input.includes('/tmp/process-count.txt')) {
            return '127';
        }
        // /tmp/configs.txt
        if (input.includes('/tmp/configs.txt')) {
            return '/etc/ssh/sshd_config\n/etc/dnf/dnf.conf\n/etc/yum.conf\n/etc/rsyslog.conf\n/etc/chrony.conf\n/etc/systemd/system.conf\n/etc/logrotate.conf';
        }
        // /tmp/alice-info.txt
        if (input.includes('/tmp/alice-info.txt')) {
            return 'alice:x:5001:5001::/home/alice:/sbin/nologin';
        }
        // /tmp/large-logs.txt
        if (input.includes('/tmp/large-logs.txt')) {
            return '/var/log/messages\n/var/log/audit/audit.log\n/var/log/lastlog';
        }
        // /tmp/user-count.txt
        if (input.includes('/tmp/user-count.txt')) {
            return '42';
        }
        // /tmp/log-size.txt - du result
        if (input.includes('/tmp/log-size.txt')) {
            return '2048576';
        }
        // /tmp/vitest.txt - after sed operations
        if (input.includes('/tmp/vitest.txt')) {
            return 'Welcome RHCSA\nLine 2';
        }
    }
    
    // tar command outputs
    if (command === 'tar') {
        // List httpd-config.tar.gz contents
        if (input.includes('-t') && input.includes('/tmp/httpd-config.tar.gz')) {
            return 'etc/httpd/\netc/httpd/conf/\netc/httpd/conf/httpd.conf\netc/httpd/conf.d/\netc/httpd/conf.d/ssl.conf\netc/httpd/conf.d/welcome.conf\netc/httpd/conf.modules.d/\netc/httpd/logs/';
        }
        // List alice-backup.tar.gz contents
        if (input.includes('-t') && input.includes('/tmp/alice-backup.tar.gz')) {
            return 'home/alice/\nhome/alice/.bashrc\nhome/alice/.bash_profile\nhome/alice/.bash_logout\nhome/alice/documents/\nhome/alice/documents/report.txt\nhome/alice/documents/notes.txt';
        }
    }
    
    // ls command outputs
    if (command === 'ls') {
        // List /restore directory after extraction
        if (input.includes('/restore')) {
            if (hasFlags(input, 'lR')) {
                return '/restore:\ntotal 4\ndrwxr-xr-x 3 root root 4096 Feb 23 12:00 etc\n\n/restore/etc:\ntotal 4\ndrwxr-xr-x 2 root root 4096 Feb 23 12:00 httpd\n\n/restore/etc/httpd:\ntotal 8\n-rw-r--r-- 1 root root 5432 Feb 23 12:00 httpd.conf';
            }
            return 'etc';
        }
        // List /usr/share/doc/systemd
        if (input.includes('/usr/share/doc/systemd')) {
            return 'AUTHORS\nCODING_STYLE\nLICENSE.GPL2\nLICENSE.LGPL2.1\nNEWS\nREADME';
        }
        // List /usr/share/doc/openssh
        if (input.includes('/usr/share/doc/openssh')) {
            return 'CREDITS\nOVERVIEW\nPROTOCOL\nREADME\nREADME.platform';
        }
    }
    
    // du command for disk usage
    if (command === 'du') {
        if (input.includes('-s') && input.includes('/var/log')) {
            return '2048576\t/var/log';
        }
    }
    
    // head/tail commands
    if (command === 'head') {
        if (input.includes('/etc/passwd')) {
            return 'root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nadm:x:3:4:adm:/var/adm:/sbin/nologin\nlp:x:4:7:lp:/var/spool/lpd:/sbin/nologin\nsync:x:5:0:sync:/sbin:/bin/sync\nshutdown:x:6:0:shutdown:/sbin:/sbin/shutdown\nhalt:x:7:0:halt:/sbin:/sbin/halt\nmail:x:8:12:mail:/var/spool/mail:/sbin/nologin\noperator:x:11:0:operator:/root:/sbin/nologin';
        }
    }
    
    if (command === 'tail') {
        if (input.includes('/var/log/messages')) {
            return 'Feb 23 16:45:01 server1 systemd[1]: Started Session 123 of user root.\nFeb 23 16:50:01 server1 systemd[1]: Started Session 124 of user alice.\nFeb 23 16:55:01 server1 systemd[1]: Starting dnf-makecache.service...';
        }
        if (input.includes('-f') && input.includes('/var/log/messages')) {
            return 'Feb 23 16:55:01 server1 systemd[1]: Starting dnf-makecache.service...\n(Following log file, press Ctrl+C to stop)';
        }
    }
    
    return null;
}

/**
 * Section 5: Running Systems - Output Generator
 */
function generateSection4PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: configs.txt doesn't exist yet
    if (task.id === 1) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/configs.txt')) {
            return `${command}: /tmp/configs.txt: No such file or directory`;
        }
        if (command === 'ls' && input.includes('/tmp/configs.txt')) {
            return 'ls: cannot access \'/tmp/configs.txt\': No such file or directory';
        }
    }
    
    // Task 3 Pre-check: alice-info.txt doesn't exist yet
    if (task.id === 3) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/alice-info.txt')) {
            return `${command}: /tmp/alice-info.txt: No such file or directory`;
        }
        if (command === 'ls' && input.includes('/tmp/alice-info.txt')) {
            return 'ls: cannot access \'/tmp/alice-info.txt\': No such file or directory';
        }
    }
    
    // Task 5 Pre-check: alice-backup.tar.gz doesn't exist yet
    if (task.id === 5) {
        if (command === 'tar' && hasFlags(input, 'tzf') && 
            input.includes('/tmp/alice-backup.tar.gz')) {
            return 'tar: /tmp/alice-backup.tar.gz: Cannot open: No such file or directory\ntar: Error is not recoverable: exiting now';
        }
        if (command === 'ls' && input.includes('/tmp/alice-backup.tar.gz')) {
            return 'ls: cannot access \'/tmp/alice-backup.tar.gz\': No such file or directory';
        }
    }
    
    // Task 7 Pre-check: large-logs.txt doesn't exist yet
    if (task.id === 7) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/large-logs.txt')) {
            return `${command}: /tmp/large-logs.txt: No such file or directory`;
        }
        if (command === 'ls' && input.includes('/tmp/large-logs.txt')) {
            return 'ls: cannot access \'/tmp/large-logs.txt\': No such file or directory';
        }
    }
    
    // Task 9 Pre-check: user-count.txt doesn't exist yet
    if (task.id === 9) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/user-count.txt')) {
            return `${command}: /tmp/user-count.txt: No such file or directory`;
        }
        if (command === 'ls' && input.includes('/tmp/user-count.txt')) {
            return 'ls: cannot access \'/tmp/user-count.txt\': No such file or directory';
        }
    }
    
    return null;
}

/**
 * Section 5 Pre-Check Output (BEFORE state)
 */
