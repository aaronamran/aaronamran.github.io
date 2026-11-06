/** Red Cat - Section 1 */

function generateSection1Output(command, input, tokens) {
    const loginDates = getLoginDates();

    // ── cat ────────────────────────────────────────────────────────────────────
    if (command === 'cat' || command === 'less' || command === 'more') {
        if (input.includes('/tmp/logfiles.txt')) {
            return '/var/log/messages\n/var/log/secure\n/var/log/httpd/access.log\n/var/log/httpd/error.log\n/var/log/audit/audit.log\n/var/log/cron\n/var/log/maillog\n/var/log/dmesg';
        }
        if (input.includes('/tmp/localhost-line.txt')) {
            return '127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n::1         localhost localhost.localdomain localhost6 localhost6.localdomain6';
        }
        if (input.includes('/tmp/large-files.txt')) {
            return '/home/student/Downloads/rhel9.iso\n/home/student/backup/database.dump\n/home/student/vm/disk.img';
        }
        if (input.includes('/tmp/services-count.txt')) {
            return '11176 /etc/services';
        }
        if (input.includes('/tmp/recent-files.txt')) {
            return '/opt/app/config.yml\n/opt/app/logs/app.log\n/opt/scripts/deploy.sh\n/opt/data/cache.db';
        }
        if (input.includes('/tmp/errors.txt')) {
            return 'Jan 15 02:31:07 redcat kernel: error: unable to mount filesystem\nJan 15 08:14:22 redcat systemd[1]: Error starting httpd.service\nJan 15 09:45:00 redcat kernel: EXT4-fs error (device sda1)\nJan 15 14:02:18 redcat sshd[1234]: error: PAM authentication failed';
        }
        if (input.includes('/tmp/empty-files.txt')) {
            return '/tmp/old-lock\n/tmp/.session\n/tmp/placeholder';
        }
        if (input.includes('/tmp/process-count.txt')) {
            return '186';
        }
        if (input.includes('/tmp/webuser-files.txt')) {
            return '/srv/www/html/index.html\n/srv/www/html/app.php\n/srv/www/html/style.css\n/srv/www/cgi-bin/submit.cgi';
        }
        if (input.includes('/tmp/failed-login-count.txt')) {
            return '47';
        }
        if (input.includes('/tmp/insecure-files.txt')) {
            return '/var/www/html/uploads/temp.php\n/var/www/html/admin/debug.sh\n/var/www/cgi-bin/old-script.cgi';
        }
        if (input.includes('/tmp/log-size.txt')) {
            return '2.4G\t/var/log';
        }
        if (input.includes('/tmp/vitest.txt')) {
            return 'Hello RHCSA\nLine 2';
        }
        if (input.includes('/etc/hosts')) {
            return '127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n::1         localhost localhost.localdomain localhost6 localhost6.localdomain6\n127.0.0.1   redcat.example.com redcat';
        }
        if (input.includes('/var/log/messages')) {
            return 'Jan 15 09:00:01 redcat systemd[1]: Starting System Logging Service...\nJan 15 09:00:02 redcat rsyslogd: [origin software="rsyslogd" version="8.2102.0"]\nJan 15 09:00:05 redcat kernel: SELinux:  policy loaded\nJan 15 14:02:18 redcat kernel: error: EXT4-fs error (device sda1)\nJan 15 14:45:00 redcat systemd[1]: Error starting httpd.service\nJan 15 15:10:33 redcat kernel: warning: possible circular locking dependency';
        }
        if (input.includes('/var/log/app.log')) {
            return 'error: database connection timeout\ninfo: server started on port 8080\nwarning: disk usage at 85%\nerror: failed to write cache\ninfo: user login: admin\nwarning: rate limit exceeded\nerror: SSL certificate expiring soon';
        }
        if (input.includes('/tmp/test.log')) {
            return 'success: backup completed\nfail: network unreachable\nfail: authentication denied\nsuccess: service restarted\nfail: disk write error\nsuccess: sync complete';
        }
        if (input.includes('/tmp/contacts.txt')) {
            return 'Alice Smith <alice.smith@example.com>\nBob Jones <bob.jones@company.org>\nAdmin Contact: admin@redcat.local\nSupport: support.team@helpdesk.net';
        }
        if (input.includes('/usr/share/doc/openssh')) {
            return 'CHANGES  COPYING  ChangeLog  FAQ  INSTALL  OVERVIEW  README  README.platform  TODO';
        }
    }

    // ── wc ────────────────────────────────────────────────────────────────────
    if (command === 'wc') {
        if (hasFlags(input, 'l')) {
            if (input.includes('/tmp/errors.txt')) {
                return '4 /tmp/errors.txt';
            }
            if (input.includes('/etc/services')) {
                return '11176 /etc/services';
            }
            if (input.includes('/tmp/vitest.txt')) {
                return '2 /tmp/vitest.txt';
            }
            if (input.includes('/tmp/failed-login-count.txt')) {
                return '1 /tmp/failed-login-count.txt';
            }
        }
    }

    // ── find ──────────────────────────────────────────────────────────────────
    if (command === 'find') {
        // find is typically an Implementation command but some Audit tasks use it
        return null;
    }

    // ── grep ──────────────────────────────────────────────────────────────────
    if (command === 'grep' || command === 'egrep') {
        // Set 1: grep localhost /etc/hosts
        if (input.includes('localhost') && input.includes('/etc/hosts')) {
            return '127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4\n::1         localhost localhost.localdomain localhost6 localhost6.localdomain6';
        }

        // Set 3: grep -c "Failed password" /var/log/secure
        if (input.includes('Failed password') && input.includes('/var/log/secure')) {
            if (hasFlags(input, 'c')) {
                return '47';
            }
            return 'Jan 15 03:12:45 redcat sshd[2341]: Failed password for root from 192.168.50.22 port 54210 ssh2\nJan 15 03:13:01 redcat sshd[2342]: Failed password for invalid user admin from 192.168.50.22 port 54211 ssh2\nJan 15 03:13:15 redcat sshd[2343]: Failed password for root from 10.0.0.105 port 49881 ssh2';
        }

        // Set 6: grep -i error /var/log/messages
        if (input.includes('error') && input.includes('/var/log/messages')) {
            if (hasFlags(input, 'ic') || (hasFlags(input, 'i') && input.includes('| wc'))) {
                return '32';
            }
            if (hasFlags(input, 'i')) {
                return 'Jan 15 02:31:07 redcat kernel: error: unable to mount filesystem\nJan 15 08:14:22 redcat systemd[1]: Error starting httpd.service\nJan 15 09:45:00 redcat kernel: EXT4-fs error (device sda1)\nJan 15 14:02:18 redcat sshd[1234]: error: PAM authentication failed\nJan 15 15:33:10 redcat kernel: Error in SCSI subsystem\nJan 15 16:00:05 redcat crondsystemd[1]: ERROR: cron job failed';
            }
        }

        // Set 6: grep -r TODO /opt/app
        if (input.includes('TODO') && input.includes('/opt/app')) {
            if (hasFlags(input, 'rl') || hasFlags(input, 'Rl')) {
                return '/opt/app/src/main.py\n/opt/app/src/utils.py\n/opt/app/config/settings.py';
            }
            if (hasFlags(input, 'r') || hasFlags(input, 'R')) {
                return '/opt/app/src/main.py:42:    # TODO: implement retry logic\n/opt/app/src/utils.py:17:    # TODO: add error handling\n/opt/app/config/settings.py:5:# TODO: move secrets to vault';
            }
        }

        // Set 6: grep -E "^(error|warning)" /var/log/app.log
        if ((input.includes('error|warning') || input.includes('warning|error')) && input.includes('/var/log/app.log')) {
            return 'error: database connection timeout\nwarning: disk usage at 85%\nerror: failed to write cache\nwarning: rate limit exceeded\nerror: SSL certificate expiring soon';
        }

        // Set 6: grep -n fail /var/log/auth.log
        if (input.includes('fail') && input.includes('/var/log/auth.log')) {
            if (hasFlags(input, 'n')) {
                return '8:Jan 15 03:12:45 redcat sshd[2341]: Failed password for root\n23:Jan 15 03:13:01 redcat sshd[2342]: Failed password for admin\n47:Jan 15 08:00:12 redcat sudo: pam_unix(sudo:auth): authentication failure\n61:Jan 15 09:15:33 redcat sshd[3001]: Failed password for invalid user test';
            }
        }

        // Set 6: grep -v success /tmp/test.log
        if (input.includes('success') && input.includes('/tmp/test.log') && hasFlags(input, 'v')) {
            return 'fail: network unreachable\nfail: authentication denied\nfail: disk write error';
        }

        // Set 6: grep -E IP addresses /var/log/secure
        if (input.includes('[0-9]') && input.includes('/var/log/secure')) {
            if (hasFlags(input, 'Eo') || hasFlags(input, 'Eo')) {
                return '192.168.50.22\n192.168.50.22\n10.0.0.105\n10.0.0.105\n172.16.1.8';
            }
            return 'Jan 15 03:12:45 redcat sshd[2341]: Failed password for root from 192.168.50.22 port 54210 ssh2\nJan 15 03:13:15 redcat sshd[2343]: Failed password for root from 10.0.0.105 port 49881 ssh2\nJan 15 08:55:02 redcat sshd[2901]: Accepted password for student from 172.16.1.8 port 60012 ssh2';
        }

        // Set 6: grep -E -o email from /tmp/contacts.txt
        if (input.includes('@') && input.includes('/tmp/contacts.txt')) {
            return 'alice.smith@example.com\nbob.jones@company.org\nadmin@redcat.local\nsupport.team@helpdesk.net';
        }

        // Set 6: grep -C kernel panic /var/log/messages
        if (input.includes('kernel panic') && input.includes('/var/log/messages')) {
            return 'Jan 15 02:28:00 redcat kernel: Starting kernel initialization\nJan 15 02:28:01 redcat kernel: Memory: 8192MB total\nJan 15 02:28:02 redcat kernel: kernel panic - not syncing: VFS: Unable to mount root fs\n--\nJan 15 02:28:03 redcat kernel: CPU: 0 PID: 1 Comm: swapper/0\nJan 15 02:28:04 redcat kernel: Hardware name: VMware Virtual Platform\nJan 15 02:28:05 redcat kernel: Call Trace:';
        }
        
        // Set 5: grep Welcome /tmp/vitest.txt
        if (input.includes('Welcome') && input.includes('/tmp/vitest.txt')) {
            return 'Welcome RHCSA';
        }
    }

    // ── tar ───────────────────────────────────────────────────────────────────
    if (command === 'tar') {
        // tar -tzf (list gzip archive)
        if (hasFlags(input, 'tz') || (hasFlags(input, 't') && hasFlags(input, 'z'))) {
            if (input.includes('httpd-config.tar.gz')) {
                return 'etc/httpd/\netc/httpd/conf/\netc/httpd/conf/httpd.conf\netc/httpd/conf.d/\netc/httpd/conf.d/ssl.conf\netc/httpd/conf.d/welcome.conf\netc/httpd/conf.modules.d/\netc/httpd/conf.modules.d/00-base.conf\netc/httpd/logs\netc/httpd/modules\netc/httpd/run';
            }
        }
        // tar -tJf (list xz archive)
        if (hasFlags(input, 'tJ') || (hasFlags(input, 't') && hasFlags(input, 'J'))) {
            if (input.includes('nginx-backup.tar.xz')) {
                return 'etc/nginx/\netc/nginx/nginx.conf\netc/nginx/conf.d/\netc/nginx/conf.d/default.conf\netc/nginx/mime.types\netc/nginx/fastcgi_params\netc/nginx/scgi_params\netc/nginx/uwsgi_params';
            }
        }
        // tar extraction (xjf) - no output unless -v
        if (hasFlags(input, 'xj') || (hasFlags(input, 'x') && hasFlags(input, 'j'))) {
            if (hasFlags(input, 'v')) {
                return 'restore/\nrestore/etc/\nrestore/etc/config.conf\nrestore/var/\nrestore/var/data/\nrestore/var/data/backup.db';
            }
            return '';
        }
        // tar create (czf / cJf) - no output unless -v
        if (hasFlags(input, 'cz') || (hasFlags(input, 'c') && hasFlags(input, 'z'))) {
            if (hasFlags(input, 'v')) {
                if (input.includes('httpd-config.tar.gz')) {
                    return 'etc/httpd/\netc/httpd/conf/\netc/httpd/conf/httpd.conf\netc/httpd/conf.d/\netc/httpd/conf.d/ssl.conf\netc/httpd/conf.modules.d/\netc/httpd/conf.modules.d/00-base.conf';
                }
            }
            return '';
        }
        if (hasFlags(input, 'cJ') || (hasFlags(input, 'c') && hasFlags(input, 'J'))) {
            if (hasFlags(input, 'v')) {
                if (input.includes('nginx-backup.tar.xz')) {
                    return 'etc/nginx/\netc/nginx/nginx.conf\netc/nginx/conf.d/\netc/nginx/conf.d/default.conf\netc/nginx/mime.types\netc/nginx/fastcgi_params';
                }
            }
            return '';
        }
    }

    // ── ls ────────────────────────────────────────────────────────────────────
    if (command === 'ls') {
        if (input.includes('/restore')) {
            if (hasFlags(input, 'lR') || hasFlags(input, 'Rl')) {
                return `total 12\ndrwxr-xr-x 4 root root 4096 ${loginDates.lsShortFormat} 12:00 .\ndrwxr-xr-x 3 root root 4096 ${loginDates.lsShortFormat} 12:00 ..\ndrwxr-xr-x 2 root root 4096 ${loginDates.lsShortFormat} 12:00 etc\ndrwxr-xr-x 3 root root 4096 ${loginDates.lsShortFormat} 12:00 var\n\n/restore/etc:\ntotal 4\n-rw-r--r-- 1 root root 512 ${loginDates.lsShortFormat} 12:00 config.conf\n\n/restore/var/data:\ntotal 4\n-rw-r--r-- 1 root root 2048 ${loginDates.lsShortFormat} 12:00 backup.db`;
            }
            return `total 12\ndrwxr-xr-x 4 root root 4096 ${loginDates.lsShortFormat} 12:00 .\ndrwxr-xr-x 3 root root 4096 ${loginDates.lsShortFormat} 12:00 ..\ndrwxr-xr-x 2 root root 4096 ${loginDates.lsShortFormat} 12:00 etc\ndrwxr-xr-x 3 root root 4096 ${loginDates.lsShortFormat} 12:00 var`;
        }
        if (input.includes('/tmp/httpd-config.tar.gz')) {
            return `-rw-r--r-- 1 root root 8.4K ${loginDates.lsShortFormat} 10:15 /tmp/httpd-config.tar.gz`;
        }
        if (input.includes('/tmp/nginx-backup.tar.xz')) {
            return `-rw-r--r-- 1 root root 6.1K ${loginDates.lsShortFormat} 11:30 /tmp/nginx-backup.tar.xz`;
        }
        if (input.includes('/usr/share/doc/systemd')) {
            return `total 36\ndrwxr-xr-x  2 root root  4096 ${loginDates.lsShortFormat} 09:00 .\ndrwxr-xr-x 42 root root  4096 ${loginDates.lsShortFormat} 09:00 ..\n-rw-r--r--  1 root root  8765 ${loginDates.lsShortFormat} 09:00 CHANGES\n-rw-r--r--  1 root root 35147 ${loginDates.lsShortFormat} 09:00 LICENSE\n-rw-r--r--  1 root root  1842 ${loginDates.lsShortFormat} 09:00 README`;
        }
        if (input.includes('/usr/share/doc/openssh')) {
            return `total 48\ndrwxr-xr-x  2 root root  4096 ${loginDates.lsShortFormat} 09:00 .\n-rw-r--r--  1 root root  3218 ${loginDates.lsShortFormat} 09:00 CHANGES\n-rw-r--r--  1 root root  4742 ${loginDates.lsShortFormat} 09:00 COPYING\n-rw-r--r--  1 root root 16370 ${loginDates.lsShortFormat} 09:00 ChangeLog\n-rw-r--r--  1 root root  6190 ${loginDates.lsShortFormat} 09:00 FAQ\n-rw-r--r--  1 root root  2628 ${loginDates.lsShortFormat} 09:00 INSTALL\n-rw-r--r--  1 root root  2094 ${loginDates.lsShortFormat} 09:00 OVERVIEW\n-rw-r--r--  1 root root  3564 ${loginDates.lsShortFormat} 09:00 README\n-rw-r--r--  1 root root  1328 ${loginDates.lsShortFormat} 09:00 TODO`;
        }
        if (input.includes('/tmp/logfiles.txt')) {
            return `-rw-r--r-- 1 root root 124 ${loginDates.lsShortFormat} 10:05 /tmp/logfiles.txt`;
        }
    }

    // ── du ────────────────────────────────────────────────────────────────────
    if (command === 'du') {
        if (input.includes('/var/log')) {
            return '2.4G\t/var/log';
        }
    }

    // ── ps ────────────────────────────────────────────────────────────────────
    if (command === 'ps') {
        // ps aux | wc -l (count processes)
        if (input.includes('wc') && input.includes('-l')) {
            return '186';
        }
    }

    // ── man ───────────────────────────────────────────────────────────────────
    if (command === 'man') {
        if (tokens.includes('useradd') || (tokens.includes('1') && tokens.includes('useradd'))) {
            return 'USERADD(8)               System Management Commands               USERADD(8)\n\nNAME\n       useradd - create a new user or update default new user information\n\nSYNOPSIS\n       useradd [options] LOGIN\n\nDESCRIPTION\n       useradd is a low level utility for adding users.\n       When invoked without the -D option, the useradd command\n       creates a new user account using the values specified on\n       the command line plus the default values from the system.\n\nOPTIONS\n       -d, --home-dir HOME_DIR\n              The new user will be created using HOME_DIR\n       -m, --create-home\n              Create the user home directory\n       -s, --shell SHELL\n              The name of the user login shell\n       -u, --uid UID\n              The numerical value of the user ID\n       -g, --gid GROUP\n              The group name or number of the user initial login group\n\n(END)';
        }
        if (tokens.includes('fstab') || (tokens.includes('5') && tokens.includes('fstab'))) {
            return 'FSTAB(5)                   File Formats and Conventions                   FSTAB(5)\n\nNAME\n       fstab - static information about the filesystems\n\nDESCRIPTION\n       The file fstab contains descriptive information about the\n       filesystems the system can mount.  fstab is only read by\n       programs, and not written; it is the duty of the system\n       administrator to properly maintain this file.\n\n       Each filesystem is described on a separate line; fields on\n       each line are separated by tabs or spaces.\n\n       The following is a typical example of an fstab entry:\n\n            /dev/sda1  /  ext4  defaults  1 1\n\n(END)';
        }
        if (tokens.includes('-k') || tokens.includes('-f') || tokens.includes('-w') || tokens.includes('-a')) {
            return null; // man -k, man -f, man -wa handled by apropos/whatis output
        }
        return null;
    }

    // ── apropos / whatis ──────────────────────────────────────────────────────
    if (command === 'apropos' || (command === 'man' && hasFlags(input, 'k'))) {
        if (input.includes('network')) {
            return 'ip (8)               - show / manipulate routing, network devices, interfaces and tunnels\nifconfig (8)         - configure a network interface\nnmcli (1)            - command-line tool for controlling NetworkManager\nnetstat (8)          - Print network connections, routing tables\nss (8)               - another utility to investigate sockets\nping (8)             - send ICMP ECHO_REQUEST to network hosts\ntraceroute (8)       - print the route packets trace to network host\nnmap (1)             - Network exploration tool and security / port scanner';
        }
        if (input.includes('firewall')) {
            return 'firewall-cmd (1)     - firewalld command line client\nfirewalld (1)        - Dynamic Firewall Manager\niptables (8)         - administration tool for IPv4 packet filtering and NAT\nip6tables (8)        - IPv6 packet filter administration\nnft (8)              - Administration tool of the nftables framework for packet filtering';
        }
        return null;
    }

    if (command === 'whatis' || (command === 'man' && hasFlags(input, 'f'))) {
        if (input.includes('systemctl')) {
            return 'systemctl (1)        - Control the systemd system and service manager';
        }
        if (input.includes('passwd')) {
            return 'passwd (1)           - update user authentication tokens\npasswd (5)           - password file';
        }
        return null;
    }

    // ── which / type / rpm ────────────────────────────────────────────────────
    if (command === 'which') {
        if (input.includes('vi')) return '/usr/bin/vi';
        if (input.includes('vim')) return '/usr/bin/vim';
        if (input.includes('nano')) return '/usr/bin/nano';
        if (input.includes('info')) return '/usr/bin/info';
        return null;
    }

    if (command === 'type') {
        if (input.includes('vi')) return 'vi is /usr/bin/vi';
        return null;
    }

    if (command === 'rpm') {
        if (hasFlags(input, 'q') && hasFlags(input, 'a') && input.includes('grep')) {
            if (input.includes('editor') || input.includes('vim')) {
                return 'vim-minimal-8.2.2637-20.el9.x86_64\nvim-enhanced-8.2.2637-20.el9.x86_64\nvim-common-8.2.2637-20.el9.x86_64\nvim-filesystem-8.2.2637-20.el9.noarch';
            }
        }
        if (hasFlags(input, 'q') && input.includes('vim')) {
            return 'vim-enhanced-8.2.2637-20.el9.x86_64';
        }
    }

    // ── vim --version ─────────────────────────────────────────────────────────
    if ((command === 'vim' || command === 'vi') && input.includes('--version')) {
        return 'VIM - Vi IMproved 8.2 (2019 Dec 12, compiled Apr 14 2023 14:45:31)\nIncluded patches: 1-2637\nCompiled by mockbuild@koji-rhel9\nMassive version without GUI.  Features included (+) or not (-):\n+acl               +file_in_path      +mouse_urxvt\n+arabic            +find_in_path      +mouse_xterm\n+autocmd           +float             +multi_byte\n   system vimrc file: "/etc/vimrc"\n     user vimrc file: "$HOME/.vimrc"\n      user exrc file: "$HOME/.exrc"\n       defaults file: "$VIMRUNTIME/defaults.vim"';
    }

    // ── mandb ─────────────────────────────────────────────────────────────────
    if (command === 'mandb' || command === 'makewhatis') {
        return 'Purging old database entries in /usr/share/man...\nProcessing manual pages under /usr/share/man...\n3152 man subdirectories contained newer manual pages.\n23104 manual pages were added.\n0 stray cats were added.\n0 old database entries were purged.\nUpdating index cache for path `/usr/share/man/man1\'.\nUpdating index cache for path `/usr/share/man/man5\'.\nUpdating index cache for path `/usr/share/man/man8\'.';
    }

    // ── yum list ──────────────────────────────────────────────────────────────
    if (command === 'yum' && input.includes('list') && input.includes('installed') && input.includes('grep')) {
        if (input.includes('editor')) {
            return 'vim-minimal.x86_64          8.2.2637-20.el9          @anaconda\nvim-enhanced.x86_64         8.2.2637-20.el9          @baseos\nnano.x86_64                 5.6.1-5.el9              @appstream';
        }
    }

    // ── info ──────────────────────────────────────────────────────────────────
    if (command === 'info') {
        if (input.includes('bash')) {
            return 'File: bash.info,  Node: Top,  Next: Introduction,  Up: (dir)\n\nBash: The GNU Bourne-Again SHell\n*******************************\n\nThis text is a brief description of the features that are present in\nthe Bash shell (version 5.1, 7 January 2021).\n\n   This is Edition 5.1, last updated 7 January 2021,\nof \'The GNU Bash Reference Manual\',\nfor \'Bash\', Version 5.1.\n\n--zz-Info: (bash.info.gz)Top, 288 lines --Top--';
        }
    }

    // ── sed ───────────────────────────────────────────────────────────────────
    if (command === 'sed') {
        // sed with -i modifies in place and produces no stdout output
        if (hasFlags(input, 'i')) {
            return '';
        }
    }

    // ── echo ──────────────────────────────────────────────────────────────────
    if (command === 'echo') {
        // echo "Line 2" >> /tmp/vitest.txt produces no stdout
        if (input.includes('>>')) {
            return '';
        }
    }

    return null;
}

/**
 * Section 2: Permissions and ACLs - Output Generator
 */
function generateSection1PreCheck(task, command, input, tokens) {
    if (task.id === 1 && command === 'getent' && input.includes('group')) {
        if (input.includes('sysops') || input.includes('6000')) {
            return '';
        } else {
            return 'root:x:0:\nbin:x:1:\ndaemon:x:2:\nsys:x:3:\nadm:x:4:\ntty:x:5:\nusers:x:100:';
        }
    }
    
    if (task.id === 3) {
        if (command === 'id' && input.includes('alice')) {
            return 'id: \'alice\': no such user';
        }
        if (command === 'getent' && input.includes('passwd') && input.includes('alice')) {
            return '';
        }
    }
    
    if (task.id === 5) {
        if (command === 'getent' && input.includes('shadow') && input.includes('alice')) {
            return 'alice:!!:19745:0:99999:7:::';
        }
        if (command === 'grep' && input.includes('alice') && input.includes('/etc/shadow')) {
            return 'alice:!!:19745:0:99999:7:::';
        }
    }
    
    if (task.id === 7 && command === 'chage' && tokens.includes('-l') && input.includes('alice')) {
        return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: never\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: never\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 99999\nNumber of days of warning before password expires\t: 7';
    }
    
    if (task.id === 9) {
        if (command === 'grep' && input.includes('alice') && input.includes('/etc/passwd')) {
            return 'alice:x:5001:5001::/home/alice:/bin/bash';
        }
        if (command === 'getent' && input.includes('passwd') && input.includes('alice')) {
            return 'alice:x:5001:5001::/home/alice:/bin/bash';
        }
    }
    
    return null;
}

/**
 * Section 2 Pre-Check Output (BEFORE state)
 */
