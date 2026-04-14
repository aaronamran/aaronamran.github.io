/**
 * Red Cat - Output Generation Module
 * 
 * Generates simulated command output for audit tasks and pre-check commands
 */

/**
 * Helper function to check if input contains specific flags regardless of order
 * @param {string} input - User's full input
 * @param {string} flagString - Flag string to check (e.g., 'ld', 'li', 'lR')
 * @returns {boolean} - True if all flags in flagString are present
 */
function hasFlags(input, flagString) {
    // Match all flag groups (e.g., -ld, -l, -d, --long)
    const flagMatches = input.match(/-[a-zA-Z]+/g);
    if (!flagMatches) return false;
    
    // Combine all single-dash flags into one string
    const allFlags = flagMatches
        .filter(f => !f.startsWith('--')) // Exclude long options
        .map(f => f.substring(1)) // Remove the dash
        .join('');
    
    // Check if all required flags are present
    return flagString.split('').every(flag => allFlags.includes(flag));
}

/**
 * Generate simulated command output for audit tasks (AFTER state)
 * @param {object} task - The task object
 * @param {string} input - User's full input
 * @param {object} grepParsed - Parsed grep info if present
 * @returns {string|null} - Simulated output or null
 */
function generateSimulatedOutput(task, input, grepParsed) {
    // Only generate output for audit tasks and passwd task
    if (task.category !== 'Audit' && task.id !== 5) {
        return null;
    }
    
    const baseCommand = grepParsed ? grepParsed.command : input;
    const tokens = baseCommand.trim().split(/\s+/);
    const command = tokens[0];
    
    // Import section-specific output generators
    const sectionId = appState.currentSectionId;
    
    if (sectionId === 1) {
        return generateSection1Output(command, input, tokens);
    } else if (sectionId === 2) {
        return generateSection2Output(command, input, tokens);
    } else if (sectionId === 3) {
        return generateSection3Output(command, input, tokens);
    } else if (sectionId === 4) {
        return generateSection4Output(command, input, tokens);
    } else if (sectionId === 5) {
        return generateSection5Output(command, input, tokens);
    } else if (sectionId === 6) {
        return generateSection6Output(command, input, tokens);
    } else if (sectionId === 7) {
        return generateSection7Output(command, input, tokens);
    } else if (sectionId === 8) {
        return generateSection8Output(command, input, tokens);
    } else if (sectionId === 9) {
        return generateSection9Output(command, input, tokens);
    } else if (sectionId === 10) {
        return generateSection10Output(command, input, tokens);
    } else if (sectionId === 11) {
        return generateSection11Output(command, input, tokens);
    } else if (sectionId === 12) {
        return generateSection12Output(command, input, tokens);
    } else if (sectionId === 13) {
        return generateSection13Output(command, input, tokens);
    } else if (sectionId === 14) {
        return generateSection14Output(command, input, tokens);
    } else if (sectionId === 15) {
        return generateSection15Output(command, input, tokens);
    }
    
    return null;
}

/**
 * Section 1: Users and Groups - Output Generator
 */
function generateSection1Output(command, input, tokens) {
    // Handle echo piped to passwd (Implementation task 5)
    if (command === 'echo' && input.includes('|') && input.includes('passwd')) {
        if (input.includes('alice') || input.includes('bob') || input.includes('sarah')) {
            const user = input.match(/passwd\s+(\w+)/)?.[1] || 'user';
            return `Changing password for user ${user}.\npasswd: all authentication tokens updated successfully.`;
        }
    }
    
    // Handle getent commands
    if (command === 'getent') {
        const database = tokens[1];
        const key = tokens[2];
        
        if (database === 'group') {
            if (key === 'developers' || key === '3000') {
                return 'developers:x:3000:bob';
            } else if (key === 'sysops' || key === '6000') {
                return 'sysops:x:6000:alice';
            } else if (key === 'webadmins' || key === '5500') {
                return 'webadmins:x:5500:';
            } else if (key === 'appsvc' || key === '999') {
                return 'appsvc:x:999:';
            } else if (key === 'appadmins' || key === '3500') {
                return 'appadmins:x:3500:sysadmin,developer';
            } else if (key === 'wheel') {
                return 'wheel:x:10:admin1,sysadmin';
            } else if (!key) {
                return 'root:x:0:\nbin:x:1:\ndaemon:x:2:\nwheel:x:10:admin1,sysadmin\nappsvc:x:999:\ndevelopers:x:3000:bob\nappadmins:x:3500:sysadmin,developer\nwebadmins:x:5500:\nsysops:x:6000:alice\nusers:x:100:';
            }
        } else if (database === 'passwd') {
            if (key === 'bob') {
                return 'bob:x:4001:4001::/home/bob:/bin/bash';
            } else if (key === 'alice') {
                return 'alice:x:5001:5001::/home/alice:/sbin/nologin';
            } else if (key === 'sarah') {
                return 'sarah:x:6500:5500::/home/sarah:/bin/bash';
            } else if (key === 'sysadmin') {
                return 'sysadmin:x:2500:2500::/home/sysadmin:/bin/bash';
            } else if (key === 'appadmin') {
                return 'appadmin:x:998:999::/var/lib/appadmin:/sbin/nologin';
            } else if (key === 'contractor') {
                return 'contractor:x:1500:1500::/home/contractor:/bin/bash';
            } else if (key === 'appuser') {
                return 'appuser:x:1100:1100::/opt/appuser:/bin/bash';
            } else if (key === 'operator') {
                return 'operator:x:1200:1200::/home/operator:/bin/bash';
            } else if (key === 'admin1') {
                return 'admin1:x:1300:1300::/home/admin1:/bin/bash';
            } else if (key === 'developer') {
                return 'developer:x:1400:1400::/home/developer:/bin/bash';
            } else if (key === 'dbadmin') {
                return 'dbadmin:x:1600:1600::/home/dbadmin:/bin/bash';
            } else if (!key) {
                return 'root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nappadmin:x:998:999::/var/lib/appadmin:/sbin/nologin\noperator:x:1200:1200::/home/operator:/bin/bash\nadmin1:x:1300:1300::/home/admin1:/bin/bash\nsysadmin:x:2500:2500::/home/sysadmin:/bin/bash\nbob:x:4001:4001::/home/bob:/bin/bash\nalice:x:5001:5001::/home/alice:/sbin/nologin\nsarah:x:6500:5500::/home/sarah:/bin/bash\nnobody:x:99:99:Nobody:/:/sbin/nologin';
            }
        } else if (database === 'shadow') {
            if (key === 'alice' || key === 'bob' || key === 'sarah' || key === 'sysadmin' || key === 'contractor' || key === 'operator') {
                return `${key}:$6$randomhash...:19745:0:99999:7:::`;
            }
        }
    }
    
    // Handle id command
    if (command === 'id') {
        const user = tokens[1];
        if (hasFlags(input, 'un')) {
            return 'student';
        } else if (user === 'alice') {
            return 'uid=5001(alice) gid=5001(alice) groups=5001(alice),6000(sysops)';
        } else if (user === 'bob') {
            return 'uid=4001(bob) gid=4001(bob) groups=4001(bob),3000(developers)';
        } else if (user === 'sarah') {
            return 'uid=6500(sarah) gid=5500(webadmins) groups=5500(webadmins)';
        } else if (user === 'sysadmin') {
            return 'uid=2500(sysadmin) gid=2500(sysadmin) groups=2500(sysadmin),10(wheel),3500(appadmins)';
        } else if (user === 'appadmin') {
            return 'uid=998(appadmin) gid=999(appsvc) groups=999(appsvc)';
        } else if (user === 'contractor') {
            return 'uid=1500(contractor) gid=1500(contractor) groups=1500(contractor),3000(developers),5500(webadmins)';
        } else if (user === 'appuser') {
            return 'uid=1100(appuser) gid=1100(appuser) groups=1100(appuser)';
        } else if (user === 'operator') {
            return 'uid=1200(operator) gid=1200(operator) groups=1200(operator)';
        } else if (user === 'admin1') {
            return 'uid=1300(admin1) gid=1300(admin1) groups=1300(admin1),10(wheel)';
        } else if (user === 'developer') {
            return 'uid=1400(developer) gid=1400(developer) groups=1400(developer),3500(appadmins)';
        } else if (user === 'dbadmin') {
            return 'uid=1600(dbadmin) gid=1600(dbadmin) groups=1600(dbadmin),10(wheel)';
        }
    }
    
    // Handle groups command
    if (command === 'groups') {
        const user = tokens[1];
        if (user === 'alice') {
            return 'alice : alice sysops';
        } else if (user === 'bob') {
            return 'bob : bob developers';
        } else if (user === 'sarah') {
            return 'sarah : webadmins';
        } else if (user === 'sysadmin') {
            return 'sysadmin : sysadmin wheel appadmins';
        } else if (user === 'contractor') {
            return 'contractor : contractor developers webadmins';
        } else if (user === 'admin1') {
            return 'admin1 : admin1 wheel';
        } else if (user === 'developer') {
            return 'developer : developer appadmins';
        } else if (user === 'dbadmin') {
            return 'dbadmin : dbadmin wheel';
        }
    }
    
    // Handle grep commands
    if (command === 'grep') {
        if (input.includes('/etc/shadow')) {
            const user = input.match(/grep\s+(\w+)/)?.[1];
            if (user) {
                return `${user}:$6$randomhash...:19745:0:99999:7:::`;
            }
        }
        if (input.includes('/etc/passwd')) {
            if (input.includes('alice')) {
                return 'alice:x:5001:5001::/home/alice:/sbin/nologin';
            } else if (input.includes('bob')) {
                return 'bob:x:4001:4001::/home/bob:/bin/bash';
            } else if (input.includes('appadmin')) {
                return 'appadmin:x:998:999::/var/lib/appadmin:/sbin/nologin';
            } else if (input.includes('/sbin/nologin')) {
                return 'bin:x:1:1:bin:/bin:/sbin/nologin\nappadmin:x:998:999::/var/lib/appadmin:/sbin/nologin\nnobody:x:99:99:Nobody:/:/sbin/nologin\nalice:x:5001:5001::/home/alice:/sbin/nologin';
            }
        }
        if (input.includes('/etc/group') && input.includes('appadmins')) {
            return 'appadmins:x:3500:sysadmin,developer';
        }
        if (input.includes('sudo') && input.includes('/var/log/secure')) {
            return 'Jan 20 10:15:32 redcat sudo:  sysadmin : TTY=pts/0 ; PWD=/home/sysadmin ; USER=root ; COMMAND=/bin/ls\nJan 20 11:30:45 redcat sudo:  admin1 : TTY=pts/1 ; PWD=/home/admin1 ; USER=root ; COMMAND=/bin/cat /var/log/messages';
        }
    }
    
    // Handle cat commands
    if (command === 'cat') {
        if (input.includes('/etc/passwd')) {
            return 'root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\nappadmin:x:998:999::/var/lib/appadmin:/sbin/nologin\noperator:x:1200:1200::/home/operator:/bin/bash\nsysadmin:x:2500:2500::/home/sysadmin:/bin/bash\nbob:x:4001:4001::/home/bob:/bin/bash\nalice:x:5001:5001::/home/alice:/sbin/nologin\nsarah:x:6500:5500::/home/sarah:/bin/bash\nnobody:x:99:99:Nobody:/:/sbin/nologin';
        }
    }
    
    // Handle chage -l command
    if (command === 'chage' && tokens.includes('-l')) {
        const user = tokens[tokens.length - 1];
        if (user === 'bob') {
            return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: Mar 21, 2026\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: never\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 60\nNumber of days of warning before password expires\t: 7';
        } else if (user === 'sarah') {
            return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: Mar 06, 2026\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: never\nMinimum number of days between password change\t: 0\nMaximum number of days between password change\t\t: 45\nNumber of days of warning before password expires\t: 7';
        } else if (user === 'contractor') {
            return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: Apr 20, 2026\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: Dec 31, 2026\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 90\nNumber of days of warning before password expires\t: 7';
        } else if (user === 'operator') {
            return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: Apr 20, 2026\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: Dec 31, 2027\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 90\nNumber of days of warning before password expires\t: 7';
        } else {
            return 'Last password change\t\t\t\t\t: Jan 20, 2026\nPassword expires\t\t\t\t\t: Apr 20, 2026\nPassword inactive\t\t\t\t\t: never\nAccount expires\t\t\t\t\t\t: never\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 90\nNumber of days of warning before password expires\t: 7';
        }
    }
    
    // Handle passwd -S command (password status)
    if (command === 'passwd' && tokens.includes('-S')) {
        const user = tokens[tokens.length - 1];
        if (user === 'bob') {
            return 'bob PS 2026-01-20 0 60 7 -1 (Password set, SHA512 crypt.)';
        }
        if (user === 'sarah') {
            return 'sarah PS 2026-01-20 0 45 7 -1 (Password set, SHA512 crypt.)';
        }
        return `${user} PS 2026-01-20 0 99999 7 -1 (Password set, SHA512 crypt.)`;
    }
    
    // Handle whoami command
    if (command === 'whoami') {
        return 'student';
    }
    
    // Handle who command
    if (command === 'who') {
        return 'student   pts/0        2026-01-20 08:30 (192.168.1.100)\nroot      tty1         2026-01-20 08:00';
    }
    
    // Handle w command
    if (command === 'w') {
        return ' 14:30:15 up 6:30,  2 users,  load average: 0.15, 0.10, 0.05\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nstudent  pts/0    192.168.1.100    08:30    0.00s  0.15s  0.01s w\nroot     tty1     -                08:00    6:30m  0.02s  0.02s -bash';
    }
    
    // Handle users command
    if (command === 'users') {
        return 'root student';
    }
    
    // Handle visudo command
    if (command === 'visudo' && tokens.includes('-c')) {
        return '/etc/sudoers: parsed OK\n/etc/sudoers.d/custom: parsed OK';
    }
    
    // Handle ls command for home directories
    if (command === 'ls' && hasFlags(input, 'ld')) {
        if (input.includes('/opt/appuser')) {
            return 'drwx------ 2 appuser appuser 4096 Jan 20 10:00 /opt/appuser';
        } else if (input.includes('/home/bob')) {
            return 'drwx------ 2 bob bob 4096 Jan 20 09:00 /home/bob';
        }
    }
    
    return null;
}

/**
 * Section 2: Permissions and ACLs - Output Generator
 */
function generateSection2Output(command, input, tokens) {
    // Handle ls commands
    if (command === 'ls') {
        // Set 1 paths
        if (hasFlags(input, 'ld') && input.includes('/opt/webapp')) {
            return 'drwxr-xr-x 2 webuser developers 4096 Jan 20 12:00 /opt/webapp';
        }
        if (hasFlags(input, 'ld') && input.includes('/var/backup')) {
            return 'drwxr-xr-x 2 root backup 4096 Jan 20 11:30 /var/backup';
        }
        
        // Set 2 paths
        if ((input.includes('-l') || hasFlags(input, 'ld')) && input.includes('/etc/appconfig')) {
            return '-rw-r----- 1 root appgroup 2048 Jan 20 10:00 /etc/appconfig';
        }
        if (hasFlags(input, 'ld') && input.includes('/shared/projects')) {
            return 'drwxr-sr-x 2 root developers 4096 Jan 20 09:30 /shared/projects';
        }
        if (hasFlags(input, 'ld') && input.includes('/data/reports')) {
            return 'drwxr-xr-x+ 2 root managers 4096 Jan 20 14:00 /data/reports';
        }
        if (hasFlags(input, 'ld') && input.includes('/tmp/shared')) {
            return 'drwxrwxrwt 2 root root 4096 Jan 20 15:00 /tmp/shared';
        }
        
        // Set 3 paths
        if (input.includes('-l') && input.includes('/srv/files')) {
            if (input.includes('-R')) {
                return '/srv/files:\ntotal 8\n-rw-r--r-- 1 root root 1024 Jan 20 10:00 file1.txt\n-rw-r--r-- 1 root root 2048 Jan 20 10:01 file2.txt';
            }
            return 'total 8\n-rw-r--r-- 1 root root 1024 Jan 20 10:00 file1.txt\n-rw-r--r-- 1 root root 2048 Jan 20 10:01 file2.txt';
        }
        if (input.includes('-l') && input.includes('/opt/myapp')) {
            if (input.includes('-R')) {
                return '/opt/myapp:\ntotal 4\ndrwxr-xr-x 2 appuser appsvc 4096 Jan 20 11:00 bin\ndrwxr-xr-x 2 appuser appsvc 4096 Jan 20 11:00 config\n\n/opt/myapp/bin:\ntotal 8\n-rwxr-xr-x 1 appuser appsvc 4096 Jan 20 11:00 app';
            }
            return 'drwxr-xr-x 4 appuser appsvc 4096 Jan 20 11:00 /opt/myapp';
        }
        if (input.includes('-l') && input.includes('/test/file')) {
            return '-rw-r--r-- 1 root root 512 Jan 20 12:30 /test/file';
        }
        
        // Set 4 paths (hard and symbolic links)
        if (hasFlags(input, 'li') && input.includes('/opt/data/report.txt')) {
            return '1234567 -rw-r--r-- 2 root root 4096 Jan 20 10:00 /opt/data/report.txt';
        }
        if (hasFlags(input, 'li') && input.includes('/tmp/report-link')) {
            return '1234567 -rw-r--r-- 2 root root 4096 Jan 20 10:00 /tmp/report-link';
        }
        if (input.includes('-l') && input.includes('/home/user/docs')) {
            return 'lrwxrwxrwx 1 user user 21 Jan 20 10:30 /home/user/docs -> /mnt/shared/documents';
        }
        if (hasFlags(input, 'li') && input.includes('/etc/app/config.conf')) {
            return '7654321 -rw-r--r-- 2 root root 1024 Jan 20 11:00 /etc/app/config.conf';
        }
        if (hasFlags(input, 'li') && input.includes('/backup/config.conf')) {
            return '7654321 -rw-r--r-- 2 root root 1024 Jan 20 11:00 /backup/config.conf';
        }
        if (input.includes('-l') && input.includes('/usr/local/bin/python')) {
            return 'lrwxrwxrwx 1 root root 16 Jan 20 12:00 /usr/local/bin/python -> /usr/bin/python3';
        }
        
        // Set 5 paths
        if (input.includes('-l') && input.includes('/tmp/umask-test.txt')) {
            return '-rw-r----- 1 root root 0 Jan 20 13:00 /tmp/umask-test.txt';
        }
        
        // Systemd default target symlink
        if (input.includes('-l') && input.includes('/etc/systemd/system/default.target')) {
            return 'lrwxrwxrwx 1 root root 41 Jan 20 08:00 /etc/systemd/system/default.target -> /usr/lib/systemd/system/multi-user.target';
        }
        
        // Set 6 paths
        if (hasFlags(input, 'lR') && input.includes('/data/project')) {
            return '/data/project:\ntotal 8\ndrwxr-xr-x 2 developer devteam 4096 Jan 20 14:00 src\n-rw-r--r-- 1 developer devteam 2048 Jan 20 14:00 README.md\n\n/data/project/src:\ntotal 4\n-rw-r--r-- 1 developer devteam 1024 Jan 20 14:00 main.c';
        }
        
        // Original paths
        if (hasFlags(input, 'ld') && input.includes('/opt/data')) {
            return 'drwxr-x---+ 2 alice sysops 4096 Jan 20 12:00 /opt/data';
        }
        if (hasFlags(input, 'ld') && input.includes('/var/logs')) {
            return 'drwxr-xr-x 2 root loggroup 4096 Jan 20 11:30 /var/logs';
        }
    }
    
    // Handle stat commands
    if (command === 'stat') {
        if (input.includes('/opt/webapp')) {
            return '  File: /opt/webapp\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 12345      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: ( 1001/webuser)   Gid: ( 2001/developers)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/etc/appconfig')) {
            return '  File: /etc/appconfig\n  Size: 2048      \tBlocks: 4          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 23456      Links: 1\nAccess: (0640/-rw-r-----)  Uid: (    0/    root)   Gid: ( 3001/appgroup)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/shared/projects')) {
            return '  File: /shared/projects\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 34567      Links: 2\nAccess: (2755/drwxr-sr-x)  Uid: (    0/    root)   Gid: ( 2001/developers)\nAccess: 2026-01-20 09:30:00.000000000 -0500\nModify: 2026-01-20 09:30:00.000000000 -0500\nChange: 2026-01-20 09:30:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/tmp/shared')) {
            return '  File: /tmp/shared\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (1777/drwxrwxrwt)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 15:00:00.000000000 -0500\nModify: 2026-01-20 15:00:00.000000000 -0500\nChange: 2026-01-20 15:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/data/reports')) {
            return '  File: /data/reports\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 54321      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: ( 3000/ managers)\nAccess: 2026-01-20 14:00:00.000000000 -0500\nModify: 2026-01-20 14:00:00.000000000 -0500\nChange: 2026-01-20 14:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/tmp/umask-test.txt')) {
            return '  File: /tmp/umask-test.txt\n  Size: 0           \tBlocks: 0          IO Block: 4096   regular empty file\nDevice: fd00h/64768d\tInode: 56789      Links: 1\nAccess: (0640/-rw-r-----)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 13:00:00.000000000 -0500\nModify: 2026-01-20 13:00:00.000000000 -0500\nChange: 2026-01-20 13:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/opt/data/report.txt')) {
            return '  File: /opt/data/report.txt\n  Size: 4096      \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 1234567    Links: 2\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/tmp/report-link')) {
            return '  File: /tmp/report-link\n  Size: 4096      \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 1234567    Links: 2\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/etc/app/config.conf')) {
            return '  File: /etc/app/config.conf\n  Size: 1024      \tBlocks: 2          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 7654321    Links: 2\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:00:00.000000000 -0500\nModify: 2026-01-20 11:00:00.000000000 -0500\nChange: 2026-01-20 11:00:00.000000000 -0500\n Birth: -';
        }
        // Original paths
        if (input.includes('/opt/data')) {
            return '  File: /opt/data\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0750/drwxr-x---)  Uid: ( 5001/   alice)   Gid: ( 6000/  sysops)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/var/logs')) {
            return '  File: /var/logs\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: ( 5000/loggroup)\nAccess: 2026-01-20 11:30:00.000000000 -0500\nModify: 2026-01-20 11:30:00.000000000 -0500\nChange: 2026-01-20 11:30:00.000000000 -0500\n Birth: -';
        }
    }
    
    // Handle getfacl commands
    if (command === 'getfacl') {
        if (input.includes('/opt/webapp')) {
            return '# file: /opt/webapp\n# owner: webuser\n# group: developers\nuser::rwx\nuser:sarah:rwx\ngroup::r-x\nmask::rwx\nother::r-x';
        }
        if (input.includes('/data/reports')) {
            return '# file: /data/reports\n# owner: root\n# group: managers\nuser::rwx\ngroup::r-x\ngroup:managers:rw-\nmask::rwx\nother::r-x';
        }
        if (input.includes('/shared/docs')) {
            return '# file: /shared/docs\n# owner: root\n# group: root\nuser::rwx\ngroup::r-x\nother::r-x\ndefault:user::rwx\ndefault:group::r-x\ndefault:group:editors:rw-\ndefault:mask::rwx\ndefault:other::r-x';
        }
        if (input.includes('/test/file')) {
            return '# file: /test/file\n# owner: root\n# group: root\nuser::rw-\ngroup::r--\nother::r--';
        }
        // Original path
        if (input.includes('/opt/data')) {
            return '# file: /opt/data\n# owner: alice\n# group: sysops\nuser::rwx\nuser:bob:rw-\ngroup::r-x\nmask::rwx\nother::---';
        }
    }
    
    // Handle setfacl commands (Implementation tasks - silent on success)
    if (command === 'setfacl') {
        return ''; // Silent success - authentic RHEL behavior
    }
    
    // Handle readlink commands
    if (command === 'readlink') {
        if (input.includes('/etc/systemd/system/default.target')) {
            return '/usr/lib/systemd/system/multi-user.target';
        }
        if (input.includes('/home/user/docs')) {
            if (input.includes('-f')) {
                return '/mnt/shared/documents';
            }
            return '/mnt/shared/documents';
        }
        if (input.includes('/usr/local/bin/python')) {
            if (input.includes('-f')) {
                return '/usr/bin/python3';
            }
            return '/usr/bin/python3';
        }
    }
    
    // Handle file commands
    if (command === 'file') {
        if (input.includes('/home/user/docs')) {
            return '/home/user/docs: symbolic link to /mnt/shared/documents';
        }
        if (input.includes('/usr/local/bin/python')) {
            return '/usr/local/bin/python: symbolic link to /usr/bin/python3';
        }
    }
    
    // Handle umask commands
    if (command === 'umask') {
        if (input.includes('-S')) {
            // Assuming umask was set to 0027
            return 'u=rwx,g=rx,o=';
        }
        return '0027';
    }
    
    // Handle find commands
    if (command === 'find') {
        if (input.includes('/srv/files') && input.includes('-type') && input.includes('f')) {
            return '/srv/files/file1.txt\n/srv/files/file2.txt';
        }
        if (input.includes('/opt/app') && input.includes('-type') && input.includes('d')) {
            if (input.includes('-ls')) {
                return '     drwxr-x---   2 root     root         4096 Jan 20 14:00 /opt/app\n     drwxr-x---   2 root     root         4096 Jan 20 14:00 /opt/app/bin\n     drwxr-x---   2 root     root         4096 Jan 20 14:00 /opt/app/config';
            }
            return '/opt/app\n/opt/app/bin\n/opt/app/config';
        }
        if (input.includes('/var/log') && input.includes('-perm') && input.includes('002')) {
            return ''; // No world-writable files found (expected safe state)
        }
        if (input.includes('/tmp') && (input.includes('-perm') && (input.includes('4000') || input.includes('2000') || input.includes('6000')))) {
            return ''; // No setuid/setgid files found in /tmp (expected safe state)
        }
        if (input.includes('/data/project') && input.includes('-ls')) {
            return '     drwxr-xr-x   3 developer devteam      4096 Jan 20 14:00 /data/project\n     drwxr-xr-x   2 developer devteam      4096 Jan 20 14:00 /data/project/src\n     -rw-r--r--   1 developer devteam      2048 Jan 20 14:00 /data/project/README.md\n     -rw-r--r--   1 developer devteam      1024 Jan 20 14:00 /data/project/src/main.c';
        }
    }
    
    // Handle cat commands for file lists
    if (command === 'cat') {
        if (input.includes('/tmp/olduser-files.txt')) {
            return '/home/olduser/.bashrc\n/home/olduser/.profile\n/home/olduser/documents/file1.txt';
        }
        if (input.includes('/tmp/wrong-owner.txt')) {
            return '/var/www/html/test.html\n/var/www/cgi-bin/script.sh';
        }
    }
    
    // Handle wc commands
    if (command === 'wc' && input.includes('-l')) {
        if (input.includes('/tmp/wrong-owner.txt')) {
            return '2 /tmp/wrong-owner.txt';
        }
    }
    
    return null;
}

/**
 * Section 3: Storage and File Systems - Output Generator
 */
function generateSection3Output(command, input, tokens) {
    // Handle ls commands
    if (command === 'ls') {
        if (hasFlags(input, 'ld') && input.includes('/mnt/backup')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 10:00 /mnt/backup';
        }
        if (hasFlags(input, 'ld') && input.includes('/media/usb')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 10:00 /media/usb';
        }
        if (hasFlags(input, 'ld') && input.includes('/mnt/external')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 10:00 /mnt/external';
        }
        if (input.includes('/mnt') && !input.includes('/mnt/backup')) {
            return 'backup';
        }
        if (input.includes('/media')) {
            return 'usb';
        }
        if (hasFlags(input, 'lh') && input.includes('data-backup.tar.gz')) {
            return '-rw-r--r-- 1 root root 245K Jan 20 14:30 data-backup.tar.gz';
        }
        if (input.includes('data-backup.tar.gz') && !hasFlags(input, 'lh')) {
            return 'data-backup.tar.gz';
        }
        if (hasFlags(input, 'lR') && input.includes('/backup/databases')) {
            return '/backup/databases:\ntotal 12\ndrwxr-xr-x 2 root root 4096 Jan 20 10:00 mysql\ndrwxr-xr-x 2 root root 4096 Jan 20 10:00 postgres\n\n/backup/databases/mysql:\ntotal 8\n-rw-r--r-- 1 root root 1234 Jan 20 10:00 backup.sql\n\n/backup/databases/postgres:\ntotal 8\n-rw-r--r-- 1 root root 2345 Jan 20 10:00 dump.sql';
        }
        if (input.includes('/restore/etc')) {
            return 'httpd';
        }
    }
    
    // Handle df commands
    if (command === 'df') {
        if (input.includes('/mnt/backup')) {
            return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sdb1       10485760 2097152   8388608  20% /mnt/backup';
        }
        if (input.includes('/mnt/external')) {
            return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sdb1       10485760 2097152   8388608  20% /mnt/external';
        }
        if (input.includes('/media/usb')) {
            return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sdc1        5242880 1048576   4194304  20% /media/usb';
        }
    }
    
    // Handle findmnt commands
    if (command === 'findmnt') {
        if (input.includes('/mnt/backup')) {
            return 'TARGET       SOURCE    FSTYPE OPTIONS\n/mnt/backup  /dev/sdb1 ext4   rw,relatime';
        }
        if (input.includes('/mnt/external')) {
            return 'TARGET         SOURCE    FSTYPE OPTIONS\n/mnt/external  /dev/sdb1 ext4   rw,relatime';
        }
        if (input.includes('/media/usb')) {
            return 'TARGET      SOURCE    FSTYPE OPTIONS\n/media/usb  /dev/sdc1 vfat   rw,relatime';
        }
    }
    
    // Handle mount commands
    if (command === 'mount') {
        if (input.includes('/mnt/backup') || (input.includes('/dev/sdb1') && !input.includes('/dev/sdb'))) {
            return '/dev/sdb1 on /mnt/backup type ext4 (rw,relatime)';
        }
        if (input.includes('/mnt/external')) {
            return '/dev/sdb1 on /mnt/external type ext4 (rw,relatime)';
        }
        if (input.includes('/media/usb') || input.includes('/dev/sdc1')) {
            return '/dev/sdc1 on /media/usb type vfat (rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=utf8)';
        }
    }
    
    // Handle blkid commands
    if (command === 'blkid') {
        if (input.includes('/dev/sdb1')) {
            return '/dev/sdb1: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="ext4" PARTUUID="12345678-01"';
        }
        if (input.includes('/dev/sdc1')) {
            return '/dev/sdc1: UUID="fedcba98-7654-3210-fedc-ba9876543210" TYPE="vfat" PARTUUID="87654321-01"';
        }
        if (input.includes('/dev/sdd1')) {
            return '/dev/sdd1: UUID="11223344-5566-7788-99aa-bbccddeeff00" TYPE="xfs" PARTUUID="aabbccdd-01"';
        }
        if (input.includes('/dev/sde1')) {
            return '/dev/sde1: UUID="99887766-5544-3322-1100-ffeeddccbbaa" TYPE="ext4" PARTUUID="ffeeddcc-01"';
        }
        if (input.includes('/dev/sdf1')) {
            return '/dev/sdf1: UUID="aaaabbbb-cccc-dddd-eeee-ffff00001111" TYPE="LVM2_member" PARTUUID="11112222-01"';
        }
    }
    
    // Handle cat commands
    if (command === 'cat') {
        if (input.includes('/tmp/uuid.txt')) {
            return 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        }
    }
    
    // Handle tar commands
    if (command === 'tar') {
        if (hasFlags(input, 'tzf') && input.includes('data-backup.tar.gz')) {
            return '/opt/data/\n/opt/data/file1.txt\n/opt/data/file2.txt\n/opt/data/config.conf\n/opt/data/subdir/\n/opt/data/subdir/data.db';
        }
        if (hasFlags(input, 'tzf') && input.includes('httpd-backup.tar.gz')) {
            return 'etc/httpd/\netc/httpd/conf/\netc/httpd/conf/httpd.conf\netc/httpd/conf.d/\netc/httpd/conf.d/ssl.conf';
        }
    }
    
    // LVM Physical Volume commands
    if (command === 'pvs') {
        if (!tokens[1]) {
            return '  PV         VG      Fmt  Attr PSize   PFree  \n  /dev/sdb1  datavg  lvm2 a--   <10.00g   5.00g\n  /dev/sdc1  datavg  lvm2 a--    <5.00g   2.00g\n  /dev/sdd1  appvg   lvm2 a--    <8.00g   3.00g\n  /dev/sde1  appvg   lvm2 a--    <8.00g   4.00g';
        }
        if (input.includes('/dev/sdb1')) {
            return '  PV         VG      Fmt  Attr PSize   PFree  \n  /dev/sdb1  datavg  lvm2 a--   <10.00g   5.00g';
        }
        if (input.includes('/dev/sdf1')) {
            return '  PV         VG   Fmt  Attr PSize  PFree \n  /dev/sdf1       lvm2 ---   8.00g  8.00g';
        }
    }
    
    if (command === 'pvdisplay') {
        if (input.includes('/dev/sdb1')) {
            return '  --- Physical volume ---\n  PV Name               /dev/sdb1\n  VG Name               datavg\n  PV Size               10.00 GiB / not usable 4.00 MiB\n  Allocatable           yes \n  PE Size               4.00 MiB\n  Total PE              2559\n  Free PE               1280\n  Allocated PE          1279\n  PV UUID               a1b2c3d4-e5f6-7890-abcd-ef1234567890';
        }
        if (input.includes('/dev/sdf1')) {
            return '  --- Physical volume ---\n  PV Name               /dev/sdf1\n  VG Name               \n  PV Size               8.00 GiB\n  Allocatable           NO\n  PE Size               8.00 MiB\n  Total PE              1024\n  Free PE               1024\n  Allocated PE          0\n  PV UUID               aaaabbbb-cccc-dddd-eeee-ffff00001111';
        }
    }
    
    if (command === 'pvscan') {
        return '  PV /dev/sdb1   VG datavg          lvm2 [<10.00 GiB / 5.00 GiB free]\n  PV /dev/sdc1   VG datavg          lvm2 [<5.00 GiB / 2.00 GiB free]\n  PV /dev/sdd1   VG appvg           lvm2 [<8.00 GiB / 3.00 GiB free]\n  PV /dev/sde1   VG appvg           lvm2 [<8.00 GiB / 4.00 GiB free]\n  Total: 4 [30.99 GiB] / in use: 4 [30.99 GiB] / in no VG: 0 [0   ]';
    }
    
    // LVM Volume Group commands
    if (command === 'vgs') {
        if (!tokens[1]) {
            return '  VG     #PV #LV #SN Attr   VSize   VFree \n  appvg    2   2   0 wz--n- <15.99g  7.00g\n  datavg   2   1   0 wz--n- <14.99g  7.00g';
        }
        if (input.includes('datavg')) {
            return '  VG     #PV #LV #SN Attr   VSize   VFree \n  datavg   2   1   0 wz--n- <14.99g  7.00g';
        }
        if (input.includes('appvg')) {
            return '  VG     #PV #LV #SN Attr   VSize   VFree \n  appvg    2   2   0 wz--n- <15.99g  7.00g';
        }
        if (input.includes('prodvg')) {
            return '  VG      #PV #LV #SN Attr   VSize   VFree \n  prodvg    2   2   0 wz--n- <15.99g  7.00g';
        }
        if (input.includes('-v')) {
            return '  VG     Attr   Ext   #PV #LV #SN VSize   VFree  VG UUID                                \n  appvg  wz--n- 4.00m   2   2   0 <15.99g  7.00g  bbbbcccc-dddd-eeee-ffff-000011112222\n  datavg wz--n- 4.00m   2   1   0 <14.99g  7.00g  ccccdddd-eeee-ffff-0000-111122223333';
        }
    }
    
    if (command === 'vgdisplay') {
        if (input.includes('datavg')) {
            return '  --- Volume group ---\n  VG Name               datavg\n  System ID             \n  Format                lvm2\n  Metadata Areas        2\n  Metadata Sequence No  3\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                1\n  Open LV               1\n  Max PV                0\n  Cur PV                2\n  Act PV                2\n  VG Size               14.99 GiB\n  PE Size               4.00 MiB\n  Total PE              3837\n  Alloc PE / Size       2048 / 8.00 GiB\n  Free  PE / Size       1789 / 7.00 GiB\n  VG UUID               ccccdddd-eeee-ffff-0000-111122223333';
        }
        if (input.includes('appvg')) {
            return '  --- Volume group ---\n  VG Name               appvg\n  System ID             \n  Format                lvm2\n  Metadata Areas        2\n  Metadata Sequence No  5\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                2\n  Open LV               0\n  Max PV                0\n  Cur PV                2\n  Act PV                2\n  VG Size               15.99 GiB\n  PE Size               8.00 MiB\n  Total PE              2046\n  Alloc PE / Size       1152 / 9.00 GiB\n  Free  PE / Size       894 / 7.00 GiB\n  VG UUID               bbbbcccc-dddd-eeee-ffff-000011112222';
        }
        if (input.includes('prodvg')) {
            return '  --- Volume group ---\n  VG Name               prodvg\n  System ID             \n  Format                lvm2\n  Metadata Areas        2\n  Metadata Sequence No  5\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                2\n  Open LV               0\n  Max PV                0\n  Cur PV                2\n  Act PV                2\n  VG Size               15.99 GiB\n  PE Size               8.00 MiB\n  Total PE              2046\n  Alloc PE / Size       1152 / 9.00 GiB\n  Free  PE / Size       894 / 7.00 GiB\n  VG UUID               bbbbcccc-dddd-eeee-ffff-000011112222';
        }
    }
    
    if (command === 'vgscan') {
        return '  Found volume group "appvg" using metadata type lvm2\n  Found volume group "datavg" using metadata type lvm2';
    }
    
    // LVM Logical Volume commands
    if (command === 'lvs') {
        if (!tokens[1]) {
            return '  LV     VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  dblv   appvg  -wi-a-----   2.00g                                                    \n  applv  datavg -wi-ao---- 500.00m                                                    \n  weblv  datavg -wi-a----- 700.00m';
        }
        if (input.includes('datavg/applv') || input.includes('applv')) {
            return '  LV    VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  applv datavg -wi-ao---- 500.00m';
        }
        if (input.includes('datavg/weblv') || input.includes('weblv')) {
            return '  LV    VG     Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  weblv datavg -wi-a----- 700.00m';
        }
        if (input.includes('appvg/dblv') || input.includes('dblv')) {
            return '  LV   VG    Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  dblv appvg -wi-a----- 2.00g';
        }
    }
    
    if (command === 'lvdisplay') {
        if (input.includes('/dev/datavg/applv') || input.includes('datavg/applv')) {
            return '  --- Logical volume ---\n  LV Path                /dev/datavg/applv\n  LV Name                applv\n  VG Name                datavg\n  LV UUID                11112222-3333-4444-5555-666677778888\n  LV Write Access        read/write\n  LV Creation host, time server1.example.com, 2026-02-23 10:00:00 -0500\n  LV Status              available\n  # open                 1\n  LV Size                500.00 MiB\n  Current LE             128\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:0';
        }
        if (input.includes('/dev/datavg/weblv') || input.includes('datavg/weblv')) {
            return '  --- Logical volume ---\n  LV Path                /dev/datavg/weblv\n  LV Name                weblv\n  VG Name                datavg\n  LV UUID                22223333-4444-5555-6666-777788889999\n  LV Write Access        read/write\n  LV Creation host, time server1.example.com, 2026-02-23 11:00:00 -0500\n  LV Status              available\n  # open                 0\n  LV Size                700.00 MiB\n  Current LE             175\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:1';
        }
        if (input.includes('/dev/appvg/dblv') || input.includes('appvg/dblv')) {
            return '  --- Logical volume ---\n  LV Path                /dev/appvg/dblv\n  LV Name                dblv\n  VG Name                appvg\n  LV UUID                33334444-5555-6666-7777-888899990000\n  LV Write Access        read/write\n  LV Creation host, time server1.example.com, 2026-02-23 12:00:00 -0500\n  LV Status              available\n  # open                 0\n  LV Size                2.00 GiB\n  Current LE             256\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:2';
        }
    }
    
    if (command === 'lvscan') {
        return "  ACTIVE            '/dev/datavg/applv' [500.00 MiB] inherit\n  ACTIVE            '/dev/datavg/weblv' [700.00 MiB] inherit\n  ACTIVE            '/dev/appvg/dblv' [2.00 GiB] inherit";
    }
    
    // LVM Creation/Modification commands (Implementation tasks)
    if (command === 'pvcreate') {
        if (input.includes('/dev/sdf1')) {
            return '  Physical volume "/dev/sdf1" successfully created.';
        }
        if (input.includes('/dev/sdb1')) {
            return '  Physical volume "/dev/sdb1" successfully created.';
        }
        if (input.includes('/dev/sdc1')) {
            return '  Physical volume "/dev/sdc1" successfully created.';
        }
        return '  Physical volume successfully created.';
    }
    
    if (command === 'vgcreate') {
        if (input.includes('datavg')) {
            return '  Volume group "datavg" successfully created';
        }
        if (input.includes('appvg')) {
            return '  Volume group "appvg" successfully created';
        }
        if (input.includes('prodvg')) {
            return '  Volume group "prodvg" successfully created';
        }
        return '  Volume group successfully created';
    }
    
    if (command === 'vgextend') {
        if (input.includes('datavg')) {
            return '  Volume group "datavg" successfully extended';
        }
        if (input.includes('appvg')) {
            return '  Volume group "appvg" successfully extended';
        }
        return '  Volume group successfully extended';
    }
    
    if (command === 'lvcreate') {
        if (input.includes('applv')) {
            return '  Logical volume "applv" created.';
        }
        if (input.includes('weblv')) {
            return '  Logical volume "weblv" created.';
        }
        if (input.includes('dblv')) {
            return '  Logical volume "dblv" created.';
        }
        if (input.includes('-L')) {
            // Extract LV name from -n parameter
            return '  Logical volume created.';
        }
        return '  Logical volume created.';
    }
    
    if (command === 'lvextend' || command === 'lvresize') {
        if (input.includes('applv')) {
            return '  Size of logical volume datavg/applv changed from 500.00 MiB (125 extents) to 1.00 GiB (256 extents).\n  Logical volume datavg/applv successfully resized.';
        }
        if (input.includes('weblv')) {
            return '  Size of logical volume datavg/weblv changed from 700.00 MiB (175 extents) to 2.00 GiB (512 extents).\n  Logical volume datavg/weblv successfully resized.';
        }
        return '  Logical volume successfully resized.';
    }
    
    // Partitioning commands
    if (command === 'fdisk') {
        if (input.includes('-l') && input.includes('/dev/sdb')) {
            return 'Disk /dev/sdb: 20 GiB, 21474836480 bytes, 41943040 sectors\nDisk model: Virtual disk    \nUnits: sectors of 1 * 512 = 512 bytes\nSector size (logical/physical): 512 bytes / 512 bytes\nI/O size (minimum/optimal): 512 bytes / 512 bytes\nDisklabel type: gpt\nDisk identifier: 12345678-1234-5678-1234-567812345678\n\nDevice       Start      End  Sectors Size Type\n/dev/sdb1     2048  1050623  1048576 512M Linux filesystem';
        }
    }
    
    if (command === 'parted') {
        if (input.includes('/dev/sdb') && input.includes('print')) {
            return 'Model: VMware Virtual disk (scsi)\nDisk /dev/sdb: 21.5GB\nSector size (logical/physical): 512B/512B\nPartition Table: gpt\nDisk Flags: \n\nNumber  Start   End     Size    File system  Name  Flags\n 1      1049kB  538MB   537MB                      lvm';
        }
        if (input.includes('/dev/sdc') && input.includes('print')) {
            return 'Model: VMware Virtual disk (scsi)\nDisk /dev/sdc: 10.7GB\nSector size (logical/physical): 512B/512B\nPartition Table: gpt\nDisk Flags: \n\nNumber  Start   End     Size    File system  Name  Flags\n 1      1049kB  1075MB  1074MB';
        }
    }
    
    if (command === 'gdisk') {
        if (input.includes('-l') && input.includes('/dev/sdb')) {
            return 'GPT fdisk (gdisk) version 1.0.7\n\nPartition table scan:\n  MBR: protective\n  BSD: not present\n  APM: not present\n  GPT: present\n\nFound valid GPT with protective MBR; using GPT.\nDisk /dev/sdb: 41943040 sectors, 20.0 GiB\nSector size (logical/physical): 512/512 bytes\nDisk identifier (GUID): 12345678-1234-5678-1234-567812345678\nPartition table holds up to 128 entries\nMain partition table begins at sector 2 and ends at sector 33\n\nNumber  Start (sector)    End (sector)  Size       Code  Name\n   1            2048         1050623   512.0 MiB   8E00  Linux LVM';
        }
    }
    
    if (command === 'lsblk') {
        if (input.includes('/dev/sdb')) {
            return 'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\nsdb      8:16   0   20G  0 disk \n└─sdb1   8:17   0  512M  0 part /mnt/backup';
        }
        if (input.includes('/dev/sdc')) {
            return 'NAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINT\nsdc      8:32   0  10G  0 disk \n└─sdc1   8:33   0   1G  0 part /media/usb';
        }
        if (!tokens[1]) {
            return 'NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\nsda               8:0    0   50G  0 disk \n├─sda1            8:1    0    1G  0 part /boot\n└─sda2            8:2    0   49G  0 part \n  ├─rhel-root   253:0    0   44G  0 lvm  /\n  └─rhel-swap   253:1    0    5G  0 lvm  [SWAP]\nsdb               8:16   0   20G  0 disk \n└─sdb1            8:17   0  512M  0 part /mnt/backup\nsdc               8:32   0   10G  0 disk \n└─sdc1            8:33   0    1G  0 part ';
        }
        if (input.includes('-f')) {
            return 'NAME            FSTYPE      LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT\nsda                                                                          \n├─sda1          xfs               a1b2c3d4-e5f6-7890-abcd-ef1234567890    800M    20% /boot\n└─sda2          LVM2_member       fedcba98-7654-3210-fedc-ba9876543210                \n  ├─rhel-root   xfs               11223344-5566-7788-99aa-bbccddeeff00   35.2G    20% /\n  └─rhel-swap   swap              99887766-5544-3322-1100-ffeeddccbbaa                [SWAP]\nsdb                                                                          \n└─sdb1          ext4              a1b2c3d4-e5f6-7890-abcd-ef1234567890    400M    20% /mnt/backup\nsdc                                                                          \n└─sdc1          vfat              fedcba98-7654-3210-fedc-ba9876543210    800M    20% ';
        }
    }
    
    return null;
}

/**
 * Section 4: Essential Tools - Output Generator
 */
function generateSection4Output(command, input, tokens) {
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
function generateSection5Output(command, input, tokens) {
    // systemctl commands
    if (command === 'systemctl') {
        // Check httpd status
        if (input.includes('status') && input.includes('httpd')) {
            return '● httpd.service - The Apache HTTP Server\n     Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)\n     Active: active (running) since Sun 2026-02-23 10:15:32 EST; 2h 15min ago\n       Docs: man:httpd.service(8)\n   Main PID: 1234 (httpd)\n     Status: "Total requests: 0; Idle/Busy workers 100/0;Requests/sec: 0; Bytes served/sec:   0 B/sec"\n      Tasks: 213 (limit: 23065)\n     Memory: 24.5M\n        CPU: 1.234s\n     CGroup: /system.slice/httpd.service\n             ├─1234 /usr/sbin/httpd -DFOREGROUND\n             ├─1235 /usr/sbin/httpd -DFOREGROUND\n             ├─1236 /usr/sbin/httpd -DFOREGROUND\n             └─1237 /usr/sbin/httpd -DFOREGROUND\n\nFeb 23 10:15:32 localhost.localdomain systemd[1]: Starting The Apache HTTP Server...\nFeb 23 10:15:32 localhost.localdomain httpd[1234]: AH00558: httpd: Could not reliably determine server fully qualified domain name\nFeb 23 10:15:32 localhost.localdomain systemd[1]: Started The Apache HTTP Server.';
        }
        
        if (input.includes('is-active') && input.includes('httpd')) {
            return 'active';
        }
        
        // Check httpd enabled status
        if (input.includes('is-enabled') && input.includes('httpd')) {
            return 'enabled';
        }
        
        // systemctl enable commands (Implementation tasks)
        if (input.includes('enable') && !input.includes('--now') && !input.includes('is-enabled')) {
            if (input.includes('httpd')) {
                return 'Created symlink /etc/systemd/system/multi-user.target.wants/httpd.service → /usr/lib/systemd/system/httpd.service.';
            }
            if (input.includes('firewalld')) {
                return 'Created symlink /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service → /usr/lib/systemd/system/firewalld.service.\nCreated symlink /etc/systemd/system/multi-user.target.wants/firewalld.service → /usr/lib/systemd/system/firewalld.service.';
            }
            if (input.includes('sshd')) {
                return 'Created symlink /etc/systemd/system/multi-user.target.wants/sshd.service → /usr/lib/systemd/system/sshd.service.';
            }
            if (input.includes('crond')) {
                return 'Created symlink /etc/systemd/system/multi-user.target.wants/crond.service → /usr/lib/systemd/system/crond.service.';
            }
            // Generic enable output
            return 'Created symlink /etc/systemd/system/multi-user.target.wants/' + input.match(/enable\s+(\S+)/)?.[1] + '.service → /usr/lib/systemd/system/' + input.match(/enable\s+(\S+)/)?.[1] + '.service.';
        }
        
        // systemctl disable command (Implementation tasks)
        if (input.includes('disable') && !input.includes('--now')) {
            if (input.includes('httpd')) {
                return 'Removed /etc/systemd/system/multi-user.target.wants/httpd.service.';
            }
            if (input.includes('firewalld')) {
                return 'Removed /etc/systemd/system/multi-user.target.wants/firewalld.service.\nRemoved /etc/systemd/system/dbus-org.fedoraproject.FirewallD1.service.';
            }
            // Generic disable output
            return 'Removed /etc/systemd/system/multi-user.target.wants/' + input.match(/disable\s+(\S+)/)?.[1] + '.service.';
        }
        
        // systemctl start/stop/restart (Implementation tasks - silent success)
        if (input.includes('start') || input.includes('stop') || input.includes('restart')) {
            if (!input.includes('status')) {
                return ''; // Silent on success
            }
        }
        
        // systemctl daemon-reload (Implementation task - silent success)
        if (input.includes('daemon-reload')) {
            return '';
        }
        
        // Get default boot target
        if (input.includes('get-default')) {
            return 'multi-user.target';
        }
        
        // Check crond status (stopped)
        if (input.includes('status') && input.includes('crond')) {
            return '○ crond.service - Command Scheduler\n     Loaded: loaded (/usr/lib/systemd/system/crond.service; enabled; vendor preset: enabled)\n     Active: inactive (dead) since Sun 2026-02-23 12:30:15 EST; 5min ago\n       Docs: man:crond(8)\n             man:crontab(5)\n    Process: 1145 ExecStart=/usr/sbin/crond -n $CRONDARGS (code=exited, status=0/SUCCESS)\n   Main PID: 1145 (code=exited, status=0/SUCCESS)\n        CPU: 12ms\n\nFeb 23 08:15:42 localhost.localdomain systemd[1]: Started Command Scheduler.\nFeb 23 12:30:15 localhost.localdomain systemd[1]: Stopping Command Scheduler...\nFeb 23 12:30:15 localhost.localdomain systemd[1]: crond.service: Deactivated successfully.\nFeb 23 12:30:15 localhost.localdomain systemd[1]: Stopped Command Scheduler.';
        }
        
        if (input.includes('is-active') && input.includes('crond')) {
            return 'inactive';
        }
        
        // sshd service status
        if (input.includes('status') && input.includes('sshd')) {
            return '● sshd.service - OpenSSH server daemon\n     Loaded: loaded (/usr/lib/systemd/system/sshd.service; enabled; vendor preset: enabled)\n     Active: active (running) since Sun 2026-02-23 08:15:42 EST; 8h ago\n       Docs: man:sshd(8)\n             man:sshd_config(5)\n   Main PID: 1098 (sshd)\n      Tasks: 1 (limit: 23065)\n     Memory: 4.2M\n        CPU: 234ms\n     CGroup: /system.slice/sshd.service\n             └─1098 /usr/sbin/sshd -D';
        }
    }
    
    // journalctl commands
    if (command === 'journalctl') {
        // View journal errors
        if ((input.includes('-p') || input.includes('--priority')) && 
            (input.includes('err') || input.includes('3'))) {
            return '-- Journal begins at Mon 2026-02-23 08:15:30 EST, ends at Sun 2026-02-23 12:35:42 EST. --\nFeb 23 08:16:05 localhost.localdomain kernel: ACPI BIOS Error (bug): Could not resolve symbol\nFeb 23 08:16:12 localhost.localdomain systemd[1]: Failed to start Network Manager Wait Online.\nFeb 23 10:22:35 localhost.localdomain bluetoothd[892]: Failed to set privacy: Rejected (0x0b)';
        }
        
        // View httpd journal
        if ((input.includes('-u') || input.includes('--unit')) && input.includes('httpd')) {
            return '-- Journal begins at Mon 2026-02-23 08:15:30 EST, ends at Sun 2026-02-23 12:35:42 EST. --\nFeb 23 10:15:32 localhost.localdomain systemd[1]: Starting The Apache HTTP Server...\nFeb 23 10:15:32 localhost.localdomain httpd[1234]: Server configured, listening on: port 80\nFeb 23 10:15:32 localhost.localdomain systemd[1]: Started The Apache HTTP Server.';
        }
        
        // View crond journal
        if ((input.includes('-u') || input.includes('--unit')) && input.includes('crond')) {
            return '-- Journal begins at Mon 2026-02-23 08:15:30 EST, ends at Sun 2026-02-23 12:35:42 EST. --\nFeb 23 08:15:42 localhost.localdomain systemd[1]: Started Command Scheduler.\nFeb 23 12:30:15 localhost.localdomain systemd[1]: Stopping Command Scheduler...\nFeb 23 12:30:15 localhost.localdomain systemd[1]: crond.service: Deactivated successfully.';
        }
    }
    
    // ps commands - process listings
    if (command === 'ps') {
        // ps aux - full process list
        if (input.includes('aux') && !input.includes('grep') && !input.includes('sort')) {
            return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 243512 15632 ?        Ss   08:15   0:02 /usr/lib/systemd/systemd --switched-root --system --deserialize 18\nroot           2  0.0  0.0      0     0 ?        S    08:15   0:00 [kthreadd]\nroot           3  0.0  0.0      0     0 ?        I<   08:15   0:00 [rcu_gp]\nroot        1098  0.0  0.0 112860  7420 ?        Ss   08:15   0:00 /usr/sbin/sshd -D\nroot        1145  0.0  0.0  25388  2548 ?        Ss   08:15   0:00 /usr/sbin/crond -n\napache      1234  0.2  0.5 224080 87456 ?        Ss   10:15   0:02 /usr/sbin/httpd -DFOREGROUND\napache      1235  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND\napache      1236  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND\napache      1237  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND\nroot        2345  0.1  0.2  62488 34512 ?        Ss   11:00   0:05 /usr/bin/python3 /usr/sbin/firewalld --nofork --nopid\nroot        3456  0.0  0.1  53764  9876 ?        Ss   08:15   0:00 /usr/sbin/rsyslogd -n\nroot        4567  0.0  0.0      0     0 ?        I    12:00   0:00 [kworker/0:1-events]\nroot        5678  0.0  0.0   9876  3456 pts/0    R+   16:45   0:00 ps aux';
        }
        
        // ps -ef - process list with parent PIDs
        if (hasFlags(input, 'ef')) {
            return 'UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 08:15 ?        00:00:02 /usr/lib/systemd/systemd --switched-root --system\nroot           2       0  0 08:15 ?        00:00:00 [kthreadd]\nroot        1098       1  0 08:15 ?        00:00:00 /usr/sbin/sshd -D\nroot       1145       1  0 08:15 ?        00:00:00 /usr/sbin/crond -n\napache      1234       1  0 10:15 ?        00:00:02 /usr/sbin/httpd -DFOREGROUND\napache      1235    1234  0 10:15 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND\napache      1236    1234  0 10:15 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND\napache      1237    1234  0 10:15 ?        00:00:00 /usr/sbin/httpd -DFOREGROUND\nroot        2345       1  0 11:00 ?        00:00:05 /usr/bin/python3 /usr/sbin/firewalld --nofork\nroot        3456       1  0 08:15 ?        00:00:00 /usr/sbin/rsyslogd -n';
        }
        
        // ps aux with grep httpd
        if (input.includes('aux') && input.includes('grep') && input.includes('httpd')) {
            return 'apache      1234  0.2  0.5 224080 87456 ?        Ss   10:15   0:02 /usr/sbin/httpd -DFOREGROUND\napache      1235  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND\napache      1236  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND\napache      1237  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND';
        }
        
        // ps -p <PID> - specific process
        if (input.includes('-p') && input.includes('1234')) {
            return '  PID TTY      STAT   TIME COMMAND\n 1234 ?        Ss     0:02 /usr/sbin/httpd -DFOREGROUND';
        }
        
        // ps aux --sort=-pcpu - sorted by CPU usage
        if (input.includes('sort') && input.includes('pcpu')) {
            return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\napache      1234  0.2  0.5 224080 87456 ?        Ss   10:15   0:02 /usr/sbin/httpd -DFOREGROUND\nroot        2345  0.1  0.2  62488 34512 ?        Ss   11:00   0:05 /usr/bin/python3 /usr/sbin/firewalld --nofork\nroot           1  0.0  0.1 243512 15632 ?        Ss   08:15   0:02 /usr/lib/systemd/systemd --switched-root\nroot        1098  0.0  0.0 112860  7420 ?        Ss   08:15   0:00 /usr/sbin/sshd -D\napache      1235  0.0  0.5 224216 87592 ?        S    10:15   0:00 /usr/sbin/httpd -DFOREGROUND';
        }
        
        // ps auxf - forest view
        if (input.includes('auxf')) {
            return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 243512 15632 ?        Ss   08:15   0:02 /usr/lib/systemd/systemd --switched-root\nroot        1098  0.0  0.0 112860  7420 ?        Ss   08:15   0:00  \\_ /usr/sbin/sshd -D\napache      1234  0.2  0.5 224080 87456 ?        Ss   10:15   0:02  \\_ /usr/sbin/httpd -DFOREGROUND\napache      1235  0.0  0.5 224216 87592 ?        S    10:15   0:00      \\_ /usr/sbin/httpd -DFOREGROUND\napache      1236  0.0  0.5 224216 87592 ?        S    10:15   0:00      \\_ /usr/sbin/httpd -DFOREGROUND\napache      1237  0.0  0.5 224216 87592 ?        S    10:15   0:00      \\_ /usr/sbin/httpd -DFOREGROUND';
        }
    }
    
    // pgrep - find process IDs
    if (command === 'pgrep') {
        if (input.includes('httpd')) {
            return '1234\n1235\n1236\n1237';
        }
        if (input.includes('sshd')) {
            return '1098';
        }
        if (input.includes('crond')) {
            return '1145';
        }
    }
    
    // pstree - process tree
    if (command === 'pstree') {
        return 'systemd─┬─ModemManager───2*[{ModemManager}]\n        ├─NetworkManager───2*[{NetworkManager}]\n        ├─accounts-daemon───2*[{accounts-daemon}]\n        ├─crond\n        ├─dbus-daemon\n        ├─firewalld───{firewalld}\n        ├─httpd───3*[httpd]\n        ├─polkitd───2*[{polkitd}]\n        ├─rsyslogd───2*[{rsyslogd}]\n        ├─sshd\n        ├─systemd-journal\n        ├─systemd-logind\n        └─systemd-udevd';
    }
    
    // top - process monitor
    if (command === 'top') {
        return 'top - 16:45:30 up  8:30,  1 user,  load average: 0.15, 0.21, 0.18\nTasks: 187 total,   1 running, 186 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  1.2 us,  0.5 sy,  0.0 ni, 98.0 id,  0.2 wa,  0.0 hi,  0.1 si,  0.0 st\nMiB Mem :  15872.5 total,  10234.2 free,   2456.8 used,   3181.5 buff/cache\nMiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  12845.6 avail Mem\n\n    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n   1234 apache    20   0  224080  87456  12345 S   0.2   0.5   0:02.34 httpd\n   2345 root      20   0   62488  34512   8765 S   0.1   0.2   0:05.12 firewalld\n      1 root      20   0  243512  15632  10234 S   0.0   0.1   0:02.45 systemd\n   1098 root      20   0  112860   7420   5432 S   0.0   0.0   0:00.12 sshd\n   1145 root      20   0   25388   2548   1876 S   0.0   0.0   0:00.05 crond\n   1235 apache    20   0  224216  87592  12356 S   0.0   0.5   0:00.45 httpd\n   1236 apache    20   0  224216  87592  12356 S   0.0   0.5   0:00.43 httpd\n   1237 apache    20   0  224216  87592  12356 S   0.0   0.5   0:00.41 httpd\n   3456 root      20   0   53764   9876   6543 S   0.0   0.1   0:00.23 rsyslogd';
    }
    
    // kill verification - no output for successful kill
    if (command === 'kill') {
        return ''; // kill produces no output on success
    }
    
    // pkill verification - no output for successful kill
    if (command === 'pkill') {
        return ''; // pkill produces no output on success
    }
    
    // View httpd PID file
    if ((command === 'cat' || command === 'less' || command === 'more') && 
        input.includes('/tmp/httpd-pid.txt')) {
        return '1234';
    }
    
    return null;
}

/**
 * Section 6: File Systems - Output Generator
 */
function generateSection6Output(command, input, tokens) {
    // Task 2: View filesystem info
    if (command === 'blkid' && input.includes('/dev/sdb1')) {
        return '/dev/sdb1: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="xfs" PARTUUID="12345678-01"';
    }
    
    if (command === 'lsblk' && input.includes('-f') && input.includes('/dev/sdb1')) {
        return 'NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT\nsdb1   xfs          a1b2c3d4-e5f6-7890-abcd-ef1234567890                    /mnt/data';
    }
    
    if (command === 'lsblk' && input.includes('-f') && !input.includes('/dev/')) {
        return 'NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT\nsda                                                                           \n├─sda1 xfs          12345678-90ab-cdef-1234-567890abcdef    456M    12% /boot\n└─sda2 xfs          abcdef01-2345-6789-abcd-ef0123456789   25.3G    45% /\nsdb                                                                           \n└─sdb1 xfs          a1b2c3d4-e5f6-7890-abcd-ef1234567890    9.5G     1% /mnt/data\nsdc                                                                           \n└─sdc1 swap         fedcba98-7654-3210-fedc-ba9876543210                [SWAP]';
    }
    
    // Task 4: Check mount status
    if (command === 'mount' && input.includes('/mnt/data')) {
        return '/dev/sdb1 on /mnt/data type xfs (rw,relatime,attr2,inode64,logbufs=8,logbsize=32k,noquota)';
    }
    
    if (command === 'df' && input.includes('/mnt/data')) {
        return 'Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sdb1       10475520  102400  10373120   1% /mnt/data';
    }
    
    if (command === 'findmnt' && input.includes('/mnt/data')) {
        return 'TARGET     SOURCE    FSTYPE OPTIONS\n/mnt/data  /dev/sdb1 xfs    rw,relatime,attr2,inode64,logbufs=8,logbsize=32k,noquota';
    }
    
    // Task 6: View saved UUID
    if ((command === 'cat' || command === 'less' || command === 'more') && 
        input.includes('/tmp/sdb1-uuid.txt')) {
        return '/dev/sdb1: UUID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" TYPE="xfs" PARTUUID="12345678-01"';
    }
    
    // Task 8: View swap info
    if (command === 'blkid' && input.includes('/dev/sdc1')) {
        return '/dev/sdc1: UUID="fedcba98-7654-3210-fedc-ba9876543210" TYPE="swap" PARTUUID="87654321-01"';
    }
    
    if (command === 'lsblk' && input.includes('-f') && input.includes('/dev/sdc1')) {
        return 'NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT\nsdc1   swap         fedcba98-7654-3210-fedc-ba9876543210                [SWAP]';
    }
    
    // Task 10: View active swap
    if (command === 'swapon' && (input.includes('--show') || input.includes('-s'))) {
        return 'NAME      TYPE      SIZE USED PRIO\n/dev/sdc1 partition   2G   0B   -2';
    }
    
    if (command === 'cat' && input.includes('/proc/swaps')) {
        return 'Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority\n/dev/sdc1                               partition\t2097148\t\t0\t\t-2';
    }
    
    if (command === 'free' && input.includes('-h')) {
        return '               total        used        free      shared  buff/cache   available\nMem:            15Gi       2.5Gi       10Gi       156Mi       2.8Gi        12Gi\nSwap:          2.0Gi          0B       2.0Gi';
    }
    
    // mkfs commands - create filesystems
    if (command === 'mkfs.xfs' || (command === 'mkfs' && input.includes('xfs'))) {
        if (input.includes('/dev/sdb1') || input.includes('/dev/sdd1')) {
            return 'meta-data=/dev/sdb1              isize=512    agcount=4, agsize=655360 blks\n         =                       sectsz=512   attr=2, projid32bit=1\n         =                       crc=1        finobt=1, sparse=1, rmapbt=0\n         =                       reflink=1    bigtime=1 inobtcount=1\ndata     =                       bsize=4096   blocks=2621440, imaxpct=25\n         =                       sunit=0      swidth=0 blks\nnaming   =version 2              bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log           bsize=4096   blocks=2560, version=2\n         =                       sectsz=512   sunit=0 blks, lazy-count=1\nrealtime =none                   extsz=4096   blocks=0, rtextents=0';
        }
    }
    
    if (command === 'mkfs.ext4' || (command === 'mkfs' && input.includes('ext4'))) {
        if (input.includes('/dev/sdb1') || input.includes('/dev/sdc1')) {
            return 'mke2fs 1.46.5 (30-Dec-2021)\nCreating filesystem with 2621440 4k blocks and 655360 inodes\nFilesystem UUID: a1b2c3d4-e5f6-7890-abcd-ef1234567890\nSuperblock backups stored on blocks: \n\t32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632\n\nAllocating group tables: done                            \nWriting inode tables: done                            \nCreating journal (16384 blocks): done\nWriting superblocks and filesystem accounting information: done';
        }
    }
    
    if (command === 'mkswap') {
        return 'Setting up swapspace version 1, size = 2 GiB (2147479552 bytes)\nno label, UUID=fedcba98-7654-3210-fedc-ba9876543210';
    }
    
    // xfs_info - XFS filesystem information
    if (command === 'xfs_info') {
        return 'meta-data=/dev/sdb1              isize=512    agcount=4, agsize=655360 blks\n         =                       sectsz=512   attr=2, projid32bit=1\n         =                       crc=1        finobt=1, sparse=1, rmapbt=0\n         =                       reflink=1    bigtime=1 inobtcount=1\ndata     =                       bsize=4096   blocks=2621440, imaxpct=25\n         =                       sunit=0      swidth=0 blks\nnaming   =version 2              bsize=4096   ascii-ci=0, ftype=1\nlog      =internal log           bsize=4096   blocks=2560, version=2\n         =                       sectsz=512   sunit=0 blks, lazy-count=1\nrealtime =none                   extsz=4096   blocks=0, rtextents=0';
    }
    
    // tune2fs - ext4 filesystem parameters
    if (command === 'tune2fs' && input.includes('-l')) {
        return 'tune2fs 1.46.5 (30-Dec-2021)\nFilesystem volume name:   <none>\nLast mounted on:          /mnt/data\nFilesystem UUID:          a1b2c3d4-e5f6-7890-abcd-ef1234567890\nFilesystem magic number:  0xEF53\nFilesystem revision #:    1 (dynamic)\nFilesystem features:      has_journal ext_attr resize_inode dir_index filetype extent 64bit flex_bg sparse_super large_file huge_file dir_nlink extra_isize metadata_csum\nFilesystem flags:         signed_directory_hash \nDefault mount options:    user_xattr acl\nFilesystem state:         clean\nErrors behavior:          Continue\nFilesystem OS type:       Linux\nInode count:              655360\nBlock count:              2621440\nReserved block count:     131072\nFree blocks:              2519040\nFree inodes:              655349\nFirst block:              0\nBlock size:               4096\nFragment size:            4096\nGroup descriptor size:    64\nReserved GDT blocks:      1024\nBlocks per group:         32768\nFragments per group:      32768\nInodes per group:         16384\nInode blocks per group:   1024\nFlex block group size:    16\nFilesystem created:       Sun Feb 23 10:00:00 2026\nLast mount time:          Sun Feb 23 10:05:00 2026\nLast write time:          Sun Feb 23 10:05:00 2026\nMount count:              1\nMaximum mount count:      -1\nLast checked:             Sun Feb 23 10:00:00 2026\nCheck interval:           0 (<none>)\nLifetime writes:          102 MB\nReserved blocks uid:      0 (user root)\nReserved blocks gid:      0 (group root)\nFirst inode:              11\nInode size:               256\nRequired extra isize:     32\nDesired extra isize:      32\nJournal inode:            8\nDefault directory hash:   half_md4\nDirectory Hash Seed:      12345678-90ab-cdef-1234-567890abcdef\nJournal backup:           inode blocks\nChecksum type:            crc32c\nChecksum:                 0xabcdef12';
    }
    
    // /etc/fstab - mount configuration
    if (command === 'cat' && input.includes('/etc/fstab')) {
        return '#\n# /etc/fstab\n# Created by anaconda on Sun Feb 23 08:15:00 2026\n#\n# Accessible filesystems, by reference, are maintained under \'/dev/disk/\'\n# See man pages fstab(5), findmfs(8), mount(8) and/or blkid(8) for more info.\n#\n# After editing this file, run \'systemctl daemon-reload\' to update systemd\n# units generated from this file.\n#\nUUID=12345678-90ab-cdef-1234-567890abcdef /                       xfs     defaults        0 0\nUUID=abcdef01-2345-6789-abcd-ef0123456789 /bootxfs     defaults        0 0\nUUID=fedcba98-7654-3210-fedc-ba9876543210 none                    swap    defaults        0 0\nUUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890 /mnt/data               xfs     defaults        0 0\nUUID=11112222-3333-4444-5555-666677778888 /mnt/storage            xfs     noatime         0 0\n/swapfile                                 none                    swap    defaults        0 0';
    }
    
    if (command === 'tail' && input.includes('/etc/fstab')) {
        return 'UUID=12345678-90ab-cdef-1234-567890abcdef /                       xfs     defaults        0 0\nUUID=abcdef01-2345-6789-abcd-ef0123456789 /boot                   xfs     defaults        0 0\nUUID=fedcba98-7654-3210-fedc-ba9876543210 none                    swap    defaults        0 0\nUUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890 /mnt/data               xfs     defaults        0 0\nUUID=11112222-3333-4444-5555-666677778888 /mnt/storage            xfs     noatime         0 0\n/swapfile                                 none                    swap    defaults        0 0';
    }
    
    if (command === 'grep' && input.includes('/etc/fstab')) {
        if (input.includes('/mnt/storage')) {
            return 'UUID=11112222-3333-4444-5555-666677778888 /mnt/storage            xfs     noatime         0 0';
        }
        if (input.includes('swap')) {
            return 'UUID=fedcba98-7654-3210-fedc-ba9876543210 none                    swap    defaults        0 0\n/swapfile                                 none                    swap    defaults        0 0';
        }
    }
    
    // fsck commands - filesystem check
    if (command === 'fsck' || command === 'fsck.xfs' || command === 'fsck.ext4') {
        if (input.includes('xfs')) {
            return 'If you wish to check the consistency of an XFS filesystem or\nrepair a damaged filesystem, see xfs_repair(8).';
        }
        return 'fsck from util-linux 2.37.4\ne2fsck 1.46.5 (30-Dec-2021)\n/dev/sdb1: clean, 11/655360 files, 102400/2621440 blocks';
    }
    
    if (command === 'xfs_repair') {
        return 'Phase 1 - find and verify superblock...\nPhase 2 - using internal log\n        - zero log...\n        - scan filesystem freespace and inode maps...\n        - found root inode chunk\nPhase 3 - for each AG...\n        - scan and clear agi unlinked lists...\n        - process known inodes and perform inode discovery...\n        - agno = 0\n        - agno = 1\n        - agno = 2\n        - agno = 3\n        - process newly discovered inodes...\nPhase 4 - check for duplicate blocks...\n        - setting up duplicate extent list...\n        - check for inodes claiming duplicate blocks...\n        - agno = 0\n        - agno = 1\n        - agno = 2\n        - agno = 3\nPhase 5 - rebuild AG headers and trees...\n        - reset superblock...\nPhase 6 - check inode connectivity...\n        - resetting contents of realtime bitmap and summary inodes\n        - traversing filesystem ...\n        - traversal finished ...\n        - moving disconnected inodes to lost+found ...\nPhase 7 - verify and correct link counts...\ndone';
    }
    
    // e2label / xfs_admin - filesystem labels
    if (command === 'e2label') {
        return 'data-volume';
    }
    
    if (command === 'xfs_admin') {
        if (input.includes('-l')) {
            return 'label = "data-volume"';
        }
    }
    
    return null;
}

/**
 * Section 7: Systems Maintenance - Output Generator
 */
function generateSection7Output(command, input, tokens) {
    // Task 2: Check if tmux is installed
    if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
        return 'tmux-3.2a-4.el9.x86_64';
    }
    
    if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
        return 'Installed Packages\ntmux.x86_64                                     3.2a-4.el9                                      @baseos';
    }
    
    // Task 4: Check tmux not installed
    if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
        return 'package tmux is not installed';
    }
    
    // Task 6: View package list
    if ((command === 'cat' || command === 'less' || command === 'wc') && input.includes('/tmp/pkg-count.txt')) {
        if (command === 'wc' && input.includes('-l')) {
            return '425 /tmp/pkg-count.txt';
        }
        return 'NetworkManager.x86_64\nbasesystem.noarch\nbash.x86_64\nbind-utils.x86_64\nchrony.x86_64\ncronie.x86_64\ncurl.x86_64\ndnf.noarch\nfirewalld.noarch\nglibc.x86_64\n...';
    }
    
    // Task 7: Check for updates
    if (command === 'dnf' && (input.includes('check-update') || (input.includes('list') && input.includes('updates')))) {
        return 'kernel.x86_64                                   5.14.0-362.el9                                  baseos\nsystemd.x86_64                                  252-14.el9_3                                    baseos\n\nObsolete Packages';
    }
    
    // Task 8: Show package info
    if ((command === 'dnf' || command === 'yum') && input.includes('info') && input.includes('kernel')) {
        return 'Installed Packages\nName         : kernel\nVersion      : 5.14.0\nRelease      : 362.el9\nArchitecture : x86_64\nSize         : 0.0\nSource       : kernel-5.14.0-362.el9.src.rpm\nRepository   : @anaconda\nSummary      : The Linux kernel\nURL          : https://www.kernel.org/\nLicense      : GPLv2\nDescription  : The kernel package contains the Linux kernel (vmlinuz)';
    }
    
    if (command === 'rpm' && hasFlags(input, 'qi') && input.includes('kernel')) {
        return 'Name        : kernel\nVersion     : 5.14.0\nRelease     : 362.el9\nArchitecture: x86_64\nInstall Date: Sun 23 Feb 2026 08:15:30 AM EST\nGroup       : System Environment/Kernel\nSize        : 0\nLicense     : GPLv2\nSignature   : RSA/SHA256\nSource RPM  : kernel-5.14.0-362.el9.src.rpm\nBuild Date  : Wed 10 Jan 2026 12:00:00 PM EST\nSummary     : The Linux kernel';
    }
    
    // dnf repolist - repository list
    if ((command === 'dnf' || command === 'yum') && input.includes('repolist')) {
        if (input.includes('all')) {
            return 'repo id                                        repo name\nappstream                                      Red Hat Enterprise Linux 9 - AppStream\nbaseos                                         Red Hat Enterprise Linux 9 - BaseOS\ncrb                                            Red Hat Enterprise Linux 9 - CodeReady Builder (disabled)\nepel                                           Extra Packages for Enterprise Linux 9 (disabled)\nepel-modular                                   Extra Packages for Enterprise Linux Modular 9 (disabled)';
        }
        if (input.includes('enabled') || !tokens[2]) {
            return 'repo id                                        repo name\nappstream                                      Red Hat Enterprise Linux 9 - AppStream\nbaseos                                         Red Hat Enterprise Linux 9 - BaseOS';
        }
    }
    
    // dnf history - transaction history
    if ((command === 'dnf' || command === 'yum') && input.includes('history')) {
        if (input.includes('list')) {
            return 'ID     | Command line                                  | Date and time    | Action(s)      | Altered\n---------------------------------------------------------------------------------------------------------------------------------------\n     5 | install httpd                                 | 2026-02-23 10:15 | Install        |    5\n     4 | update kernel                                 | 2026-02-20 14:30 | Upgrade        |    3\n     3 | install vim-enhanced                          | 2026-02-18 09:45 | Install        |    2\n     2 | install @base                                | 2026-02-15 08:20 | Install        |  425\n     1 |                                               | 2026-02-15 08:15 | Install        |  312';
        }
        if (input.includes('info') && input.includes('5')) {
            return 'Transaction ID : 5\nBegin time     : Sun Feb 23 10:15:32 2026\nBegin rpmdb    : 425:a1b2c3d4e5f67890abcdef1234567890abcdef12\nEnd time       : Sun Feb 23 10:16:15 2026\nEnd rpmdb      : 430:fedcba9876543210fedcba9876543210fedcba98\nUser           : root <root>\nReturn-Code    : Success\nReleasever     : 9\nCommand Line   : install httpd\nComment        : \nPackages Altered:\n    Install httpd-2.4.57-5.el9.x86_64                    @appstream\n    Install httpd-tools-2.4.57-5.el9.x86_64              @appstream\n    Install apr-1.7.0-11.el9.x86_64                      @appstream\n    Install apr-util-1.6.1-20.el9.x86_64                 @appstream\n    Install mod_http2-1.15.19-5.el9.x86_64               @appstream';
        }
        return 'ID     | Command line                                  | Date and time    | Action(s)      | Altered\n---------------------------------------------------------------------------------------------------------------------------------------\n     5 | install httpd                                 | 2026-02-23 10:15 | Install        |    5\n     4 | update kernel                                 | 2026-02-20 14:30 | Upgrade        |    3\n     3 | install vim-enhanced                          | 2026-02-18 09:45 | Install        |    2\n     2 | install @base                                | 2026-02-15 08:20 | Install        |  425\n     1 |                                               | 2026-02-15 08:15 | Install        |  312';
    }
    
    // yum-config-manager outputs
    if (command === 'yum-config-manager') {
        if (input.includes('--add-repo')) {
            return 'Adding repo from: http://repo.example.com/rhel9';
        }
        if (input.includes('--enable')) {
            return ''; // No output on success
        }
        if (input.includes('--disable')) {
            return ''; // No output on success
        }
    }
    
    // dnf group commands
    if ((command === 'dnf' || command === 'yum') && input.includes('group')) {
        if (input.includes('list')) {
            return 'Available Environment Groups:\n   Server with GUI\n   Server\n   Minimal Install\n   Workstation\n   Custom Operating System\nInstalled Environment Groups:\n   Server\nAvailable Groups:\n   Container Management\n   Development Tools\n   Headless Management\n   Legacy UNIX Compatibility\n   Network Servers\n   Scientific Support\n   Security Tools\n   Smart Card Support\n   System Tools';
        }
        if (input.includes('info') && input.includes('Development Tools')) {
            return 'Group: Development Tools\n Description: A basic development environment.\n Mandatory Packages:\n   =autoconf\n   =automake\n   =binutils\n   =gcc\n   =gcc-c++\n   =gdb\n   =glibc-devel\n   =make\n   =pkgconf\n   =pkgconf-m4\n   =pkgconf-pkg-config\n   =redhat-rpm-config\n Optional Packages:\n   -cmake\n   -expect\n   -rpmdevtools\n   -rpmlint';
        }
    }
    
    // subscription-manager outputs
    if (command === 'subscription-manager' && input.includes('status')) {
        return '+-------------------------------------------+\n   System Status Details\n+-------------------------------------------+\nOverall Status: Current\n\nSystem Purpose Status: Matched';
    }
    
    // dnf/yum install (Implementation tasks) - simplified output
    if ((command === 'dnf' || command === 'yum') && input.includes('install') && !input.includes('group')) {
        if (input.includes('httpd')) {
            return 'Last metadata expiration check: 0:05:23 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n httpd           x86_64    2.4.57-5.el9         appstream            1.5 M\nInstalling dependencies:\n httpd-tools     x86_64    2.4.57-5.el9         appstream             84 k\n apr             x86_64    1.7.0-11.el9         appstream            125 k\n\nTransaction Summary\n================================================================================\nInstall  3 Packages\n\nTotal download size: 1.7 M\nInstalled size: 5.1 M\nDownloading Packages:\n(1/3): apr-1.7.0-11.el9.x86_64.rpm              125 kB/s | 125 kB     00:01    \n(2/3): httpd-tools-2.4.57-5.el9.x86_64.rpm       84 kB/s |  84 kB     00:01    \n(3/3): httpd-2.4.57-5.el9.x86_64.rpm            1.5 MB/s | 1.5 MB     00:01    \n--------------------------------------------------------------------------------\nTotal                                           1.2 MB/s | 1.7 MB     00:01     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : apr-1.7.0-11.el9.x86_64                                1/3 \n  Installing       : httpd-tools-2.4.57-5.el9.x86_64                        2/3 \n  Installing       : httpd-2.4.57-5.el9.x86_64                              3/3 \n  Running scriptlet: httpd-2.4.57-5.el9.x86_64                              3/3 \n  Verifying        : apr-1.7.0-11.el9.x86_64                                1/3 \n  Verifying        : httpd-2.4.57-5.el9.x86_64                              2/3 \n  Verifying        : httpd-tools-2.4.57-5.el9.x86_64                        3/3 \n\nInstalled:\n  apr-1.7.0-11.el9.x86_64                                                       \n  httpd-2.4.57-5.el9.x86_64                                                     \n  httpd-tools-2.4.57-5.el9.x86_64                                               \n\nComplete!';
        }
        if (input.includes('firewalld')) {
            return 'Last metadata expiration check: 0:10:45 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n firewalld       noarch    1.3.4-1.el9          baseos               504 k\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 504 k\nInstalled size: 2.3 M\nDownloading Packages:\nfirewalld-1.3.4-1.el9.noarch.rpm                504 kB/s | 504 kB     00:01    \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : firewalld-1.3.4-1.el9.noarch                           1/1 \n  Running scriptlet: firewalld-1.3.4-1.el9.noarch                           1/1 \n  Verifying        : firewalld-1.3.4-1.el9.noarch                           1/1 \n\nInstalled:\n  firewalld-1.3.4-1.el9.noarch                                                  \n\nComplete!';
        }
        // Generic install output
        return 'Last metadata expiration check: 0:05:00 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n package         x86_64    1.0-1.el9            baseos               100 k\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nComplete!';
    }
    
    // dnf group install (Implementation tasks)
    if ((command === 'dnf' || command === 'yum') && input.includes('group') && input.includes('install')) {
        return 'Last metadata expiration check: 0:10:00 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Group                                                                         \n================================================================================\nInstalling group/module packages:\n autoconf                  x86_64    2.69-38.el9       appstream    715 k\n automake                  noarch    1.16.2-8.el9      appstream    713 k\n gcc                       x86_64    11.4.1-2.el9      appstream     32 M\n make                      x86_64    1:4.3-7.el9       baseos       530 k\n\nTransaction Summary\n================================================================================\nInstall  45 Packages\n\nTotal download size: 85 M\nInstalled size: 210 M\nDownloading Packages:\n[... package download progress ...]\n\nComplete!';
    }
    
    return null;
}

/**
 * Section 8: Networking - Output Generator
 */
function generateSection8Output(command, input, tokens) {
    // Task 1: Show network connections
    if (command === 'nmcli' && (input.includes('connection show') || input.includes('c s'))) {
        return 'NAME    UUID                                  TYPE      DEVICE \nens160  a1b2c3d4-e5f6-7890-abcd-ef1234567890  ethernet  ens160\nvirbr0  fedcba98-7654-3210-fedc-ba9876543210  bridge    virbr0';
    }
    
    // Task 2 & 5: Show firewall rules
    if (command === 'firewall-cmd' && input.includes('--list-all')) {
        return 'public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: cockpit dhcpv6-client http ssh\n  ports: 8080/tcp\n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:';
    }
    
    if (command === 'firewall-cmd' && input.includes('--list-services')) {
        return 'cockpit dhcpv6-client http ssh';
    }
    
    if (command === 'firewall-cmd' && input.includes('--list-ports')) {
        return '8080/tcp';
    }
    
    // Task 7: Show hostname
    if (command === 'hostnamectl' || (command === 'hostnamectl' && input.includes('status'))) {
        return ' Static hostname: localhost.localdomain\n       Icon name: computer-vm\n         Chassis: vm\n      Machine ID: a1b2c3d4e5f67890abcdef1234567890\n         Boot ID: fedcba9876543210fedcba9876543210\n  Virtualization: vmware\nOperating System: Red Hat Enterprise Linux 9.3 (Plow)\n     CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos\n          Kernel: Linux 5.14.0-362.el9.x86_64\n    Architecture: x86-64\n Hardware Vendor: VMware, Inc.\n  Hardware Model: VMware Virtual Platform';
    }
    
    if (command === 'cat' && input.includes('/etc/hostname')) {
        return 'localhost.localdomain';
    }
    
    // Task 8: Show IP addresses
    if (command === 'ip' && (input.includes('addr show') || input.includes('a'))) {
        return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host \n       valid_lft forever preferred_lft forever\n2: ens160: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 00:0c:29:12:34:56 brd ff:ff:ff:ff:ff:ff\n    altname enp2s0\n    inet 192.168.1.50/24 brd 192.168.1.255 scope global noprefixroute ens160\n       valid_lft forever preferred_lft forever\n    inet6 fe80::20c:29ff:fe12:3456/64 scope link noprefixroute \n       valid_lft forever preferred_lft forever';
    }
    
    if (command === 'nmcli' && input.includes('device show')) {
        return 'GENERAL.DEVICE:                         ens160\nGENERAL.TYPE:                           ethernet\nGENERAL.HWADDR:                         00:0C:29:12:34:56\nGENERAL.MTU:                            1500\nGENERAL.STATE:                          100 (connected)\nGENERAL.CONNECTION:                     ens160\nIP4.ADDRESS[1]:                         192.168.1.50/24\nIP4.GATEWAY:                            192.168.1.1\nIP4.DNS[1]:                             192.168.1.1';
    }
    
    // Task 9: DNS lookup
    if (command === 'nslookup' && input.includes('redhat.com')) {
        return 'Server:\t\t192.168.1.1\nAddress:\t192.168.1.1#53\n\nNon-authoritative answer:\nName:\tredhat.com\nAddress: 52.200.142.250';
    }
    
    if (command === 'dig' && input.includes('redhat.com')) {
        return '; <<>> DiG 9.16.23-RH <<>> redhat.com\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1\n\n;; QUESTION SECTION:\n;redhat.com.\t\t\tIN\tA\n\n;; ANSWER SECTION:\nredhat.com.\t\t300\tIN\tA\t52.200.142.250\n\n;; Query time: 12 msec\n;; SERVER: 192.168.1.1#53(192.168.1.1)\n;; WHEN: Sun Feb 23 12:45:30 EST 2026\n;; MSG SIZE  rcvd: 55';
    }
    
    if (command === 'host' && input.includes('redhat.com')) {
        return 'redhat.com has address 52.200.142.250\nredhat.com mail is handled by 10 mx1.redhat.com.';
    }
    
    // Task 12: Test network connectivity
    if (command === 'ping') {
        if (input.includes('8.8.8.8')) {
            return 'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.\n64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=12.3 ms\n64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=11.8 ms\n64 bytes from 8.8.8.8: icmp_seq=3 ttl=115 time=12.1 ms\n\n--- 8.8.8.8 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 11.825/12.067/12.283/0.189 ms';
        }
        if (input.includes('192.168.1.100')) {
            return 'PING 192.168.1.100 (192.168.1.100) 56(84) bytes of data.\n64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=0.234 ms\n64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=0.198 ms\n64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=0.256 ms\n\n--- 192.168.1.100 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2004ms\nrtt min/avg/max/mdev = 0.198/0.229/0.256/0.024 ms';
        }
        return 'PING localhost (127.0.0.1) 56(84) bytes of data.\n64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.035 ms\n64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.041 ms\n64 bytes from localhost (127.0.0.1): icmp_seq=3 ttl=64 time=0.038 ms\n\n--- localhost ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2048ms\nrtt min/avg/max/mdev = 0.035/0.038/0.041/0.002 ms';
    }
    
    // Task 10 (set4): Show SSH connections
    if (command === 'ss') {
        if (hasFlags(input, 'tn') && (input.includes('sport') || input.includes(':22'))) {
            return 'State      Recv-Q Send-Q Local Address:Port               Peer Address:Port              \nESTAB      0      0      192.168.1.50:22                 192.168.1.10:54321            \nESTAB      0      0      192.168.1.50:22                 192.168.1.11:54322';
        }
        if (input.includes('-tulnp') || input.includes('-tulpn')) {
            return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process                                        \ntcp    LISTEN  0       128            0.0.0.0:22             0.0.0.0:*      users:(("sshd",pid=1098,fd=3))                \ntcp    LISTEN  0       511            0.0.0.0:80             0.0.0.0:*      users:(("httpd",pid=1234,fd=4))               \ntcp    LISTEN  0       511            0.0.0.0:443            0.0.0.0:*      users:(("httpd",pid=1234,fd=6))               \ntcp    LISTEN  0       128               [::]:22                [::]:*      users:(("sshd",pid=1098,fd=4))                \ntcp    LISTEN  0       511               [::]:80                [::]:*      users:(("httpd",pid=1234,fd=5))               \nudp    UNCONN  0       0              0.0.0.0:68             0.0.0.0:*      users:(("NetworkManager",pid=1045,fd=23))';
        }
        if (input.includes('-s')) {
            return 'Total: 187\nTCP:   45 (estab 12, closed 5, orphaned 0, timewait 3)\nTransport Total     IP        IPv6\nRAW\t  0         0         0        \nUDP\t  12        8         4        \nTCP\t  40        25        15       \nINET\t  52        33        19       \nFRAG\t  0         0         0';
        }
        return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  \ntcp    ESTAB   0       0        192.168.1.50:22       192.168.1.10:54321\ntcp    ESTAB   0       0        192.168.1.50:80       192.168.1.15:48292';
    }
    
    if (command === 'who') {
        return 'root     pts/0        2026-02-23 10:15 (192.168.1.10)\nalice    pts/1        2026-02-23 11:30 (192.168.1.11)';
    }
    
    // firewall-cmd commands (Implementation tasks)
    if (command === 'firewall-cmd') {
        if (input.includes('--add-service')) {
            return 'success';
        }
        if (input.includes('--remove-service')) {
            return 'success';
        }
        if (input.includes('--add-port')) {
            return 'success';
        }
        if (input.includes('--remove-port')) {
            return 'success';
        }
        if (input.includes('--reload')) {
            return 'success';
        }
        if (input.includes('--set-default-zone')) {
            return 'success';
        }
    }
    
    // nmcli commands (Implementation tasks)
    if (command === 'nmcli') {
        if (input.includes('connection add') || input.includes('con add')) {
            if (input.includes('office')) {
                return 'Connection \'office\' (a1b2c3d4-e5f6-7890-abcd-ef1234567890) successfully added.';
            }
            if (input.includes('static-eth')) {
                return 'Connection \'static-eth\' (fedcba98-7654-3210-fedc-ba9876543210) successfully added.';
            }
            return 'Connection successfully added.';
        }
        if (input.includes('connection modify') || input.includes('con mod')) {
            return ''; // Silent success for modify
        }
        if (input.includes('connection up') || input.includes('con up')) {
            if (input.includes('office')) {
                return 'Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)';
            }
            return 'Connection successfully activated';
        }
        if (input.includes('connection down') || input.includes('con down')) {
            return 'Connection successfully deactivated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)';
        }
        if (input.includes('connection delete') || input.includes('con del')) {
            return ''; // Silent success
        }
        if (input.includes('connection reload') || input.includes('con reload')) {
            return ''; // Silent success
        }
    }
    
    // hostnamectl set-hostname (Implementation task)
    if (command === 'hostnamectl' && input.includes('set-hostname')) {
        return ''; // Silent success
    }
    
    return null;
}

/**
 * Section 9: Containers - Output Generator
 */
function generateSection9Output(command, input, tokens) {
    // Task 1 & 3: List images
    if (command === 'podman' && (input.includes('images') || (input.includes('image') && input.includes('ls')))) {
        return 'REPOSITORY                 TAG         IMAGE ID      CREATED      SIZE\ndocker.io/library/nginx    latest      a1b2c3d4e5f6  2 weeks ago  187 MB';
    }
    
    // Task 5: List containers
    if (command === 'podman' && input.includes('ps')) {
        if (input.includes('-a')) {
            return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS                    PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  5 minutes ago  Exited (0) 1 minute ago   0.0.0.0:8080->80/tcp  webserver';
        }
        return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS        PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  5 minutes ago  Up 5 minutes  0.0.0.0:8080->80/tcp  webserver';
    }
    
    if (command === 'podman' && input.includes('container') && input.includes('ls')) {
        return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS        PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  5 minutes ago  Up 5 minutes  0.0.0.0:8080->80/tcp  webserver';
    }
    
    // Task 7: List stopped containers
    if (command === 'podman' && input.includes('ps') && input.includes('-a')) {
        return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS                    PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  10 minutes ago  Exited (0) 2 minutes ago  0.0.0.0:8080->80/tcp  webserver';
    }
    
    // Task 6 (set1) & Task 3 (set2): Inspect container/image
    if (command === 'podman' && input.includes('inspect')) {
        if (input.includes('nginx:alpine') || input.includes('nginx') && !input.includes('webapp') && !input.includes('webserver')) {
            return '[\n    {\n        "Id": "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",\n        "Digest": "sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",\n        "RepoTags": [\n            "docker.io/library/nginx:alpine"\n        ],\n        "RepoDigests": [\n            "docker.io/library/nginx@sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"\n        ],\n        "Parent": "",\n        "Comment": "",\n        "Created": "2026-02-09T10:15:32.123456789Z",\n        "Container": "",\n        "Config": {\n            "Hostname": "",\n            "Domainname": "",\n            "User": "",\n            "Env": [\n                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",\n                "NGINX_VERSION=1.25.3"\n            ],\n            "Cmd": [\n                "nginx",\n                "-g",\n                "daemon off;"\n            ],\n            "Image": "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",\n            "Volumes": null,\n            "WorkingDir": "",\n            "Entrypoint": [\n                "/docker-entrypoint.sh"\n            ],\n            "Labels": {\n                "maintainer": "NGINX Docker Maintainers <docker-maint@nginx.com>"\n            },\n            "StopSignal": "SIGQUIT"\n        },\n        "Architecture": "amd64",\n        "Os": "linux",\n        "Size": 41234567,\n        "VirtualSize": 41234567,\n        "GraphDriver": {\n            "Name": "overlay",\n            "Data": {\n                "UpperDir": "/var/lib/containers/storage/overlay/abc123/diff",\n                "WorkDir": "/var/lib/containers/storage/overlay/abc123/work"\n            }\n        },\n        "RootFS": {\n            "Type": "layers",\n            "Layers": [\n                "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",\n                "sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",\n                "sha256:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"\n            ]\n        }\n    }\n]';
        }
        // Container inspect (webapp or webserver)
        return '[\n    {\n        "Id": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",\n        "Created": "2026-02-23T10:15:32.123456789-05:00",\n        "Path": "nginx",\n        "Args": [\n            "-g",\n            "daemon off;"\n        ],\n        "State": {\n            "Status": "running",\n            "Running": true,\n            "Paused": false,\n            "Restarting": false,\n            "OOMKilled": false,\n            "Dead": false,\n            "Pid": 5678,\n            "ExitCode": 0,\n            "StartedAt": "2026-02-23T10:15:33.456789012-05:00",\n            "FinishedAt": "0001-01-01T00:00:00Z"\n        },\n        "Image": "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",\n        "Name": "webserver",\n        "RestartCount": 0,\n        "Driver": "overlay",\n        "Platform": "linux",\n        "HostConfig": {\n            "NetworkMode": "bridge",\n            "PortBindings": {\n                "80/tcp": [\n                    {\n                        "HostIp": "0.0.0.0",\n                        "HostPort": "8080"\n                    }\n                ]\n            },\n            "RestartPolicy": {\n                "Name": "no",\n                "MaximumRetryCount": 0\n            }\n        },\n        "Config": {\n            "Hostname": "1234567890ab",\n            "Env": [\n                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",\n                "NGINX_VERSION=1.25.3"\n            ],\n            "Cmd": [\n                "nginx",\n                "-g",\n                "daemon off;"\n            ],\n            "Image": "docker.io/library/nginx:latest",\n            "WorkingDir": ""\n        },\n        "NetworkSettings": {\n            "Bridge": "",\n            "Gateway": "10.88.0.1",\n            "IPAddress": "10.88.0.15",\n            "IPPrefixLen": 16,\n            "MacAddress": "02:42:0a:58:00:0f",\n            "Networks": {\n                "bridge": {\n                    "Gateway": "10.88.0.1",\n                    "IPAddress": "10.88.0.15",\n                    "IPPrefixLen": 16,\n                    "MacAddress": "02:42:0a:58:00:0f"\n                }\n            },\n            "Ports": {\n                "80/tcp": [\n                    {\n                        "HostIp": "0.0.0.0",\n                        "HostPort": "8080"\n                    }\n                ]\n            }\n        },\n        "Mounts": []\n    }\n]';
    }
    
    // Task 5 (set2): Show container logs
    if (command === 'podman' && input.includes('logs')) {
        return '/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration\n/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh\n10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf\n10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf\n/docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh\n/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh\n/docker-entrypoint.sh: Configuration complete; ready for start up\n2026/02/23 15:15:33 [notice] 1#1: using the "epoll" event method\n2026/02/23 15:15:33 [notice] 1#1: nginx/1.25.3\n2026/02/23 15:15:33 [notice] 1#1: built by gcc 12.2.1 20220924 (Alpine 12.2.1_git20220924-r10) \n2026/02/23 15:15:33 [notice] 1#1: OS: Linux 5.14.0-362.el9.x86_64\n2026/02/23 15:15:33 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1048576:1048576\n2026/02/23 15:15:33 [notice] 1#1: start worker processes\n2026/02/23 15:15:33 [notice] 1#1: start worker process 29\n192.168.1.10 - - [23/Feb/2026:15:16:45 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.76.1" "-"\n192.168.1.10 - - [23/Feb/2026:15:17:12 +0000] "GET /index.html HTTP/1.1" 200 615 "-" "Mozilla/5.0" "-"';
    }
    
    // podman run (Implementation tasks) - returns container ID
    if (command === 'podman' && input.includes('run')) {
        if (input.includes('-d')) {
            // Detached mode returns just container ID
            return '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        }
        // Interactive mode would show container output, but we'll return ID for simplicity
        return '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    }
    
    // podman pull (Implementation tasks) - shows download progress
    if (command === 'podman' && input.includes('pull')) {
        if (input.includes('nginx')) {
            return 'Trying to pull docker.io/library/nginx:latest...\nGetting image source signatures\nCopying blob sha256:a1b2c3d4e5f6...\nCopying blob sha256:fedcba987654...\nCopying blob sha256:112233445566...\nCopying config sha256:a1b2c3d4e5f6...\nWriting manifest to image destination\nStoring signatures\nsha256:a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890';
        }
        if (input.includes('httpd')) {
            return 'Trying to pull docker.io/library/httpd:latest...\nGetting image source signatures\nCopying blob sha256:abc123def456...\nCopying blob sha256:789012ghi345...\nCopying config sha256:fedcba987654...\nWriting manifest to image destination\nStoring signatures\nsha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
        }
        return 'Trying to pull image...\nGetting image source signatures\nCopying blob...\nCopying config...\nWriting manifest to image destination\nStoring signatures';
    }
    
    // podman stop/start/restart (Implementation tasks) - returns container ID
    if (command === 'podman' && (input.includes('stop') || input.includes('start') || input.includes('restart'))) {
        if (input.includes('webserver')) {
            return 'webserver';
        }
        if (input.includes('webapp')) {
            return 'webapp';
        }
        return '1234567890ab'; // Returns first 12 chars of container ID
    }
    
    // podman rm/rmi (Implementation tasks) - returns container/image ID
    if (command === 'podman' && (input.includes(' rm ') || input.includes(' rmi '))) {
        if (input.includes('webserver')) {
            return '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        }
        if (input.includes('webapp')) {
            return '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        }
        if (input.includes('nginx')) {
            return 'Untagged: docker.io/library/nginx:latest\nDeleted: sha256:a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890';
        }
        return 'Deleted';
    }
    
    // podman generate systemd (Implementation task)
    if (command === 'podman' && input.includes('generate') && input.includes('systemd')) {
        return '# container-webserver.service\n# autogenerated by Podman 4.6.1\n# Sun Feb 23 10:15:32 EST 2026\n\n[Unit]\nDescription=Podman container-webserver.service\nDocumentation=man:podman-generate-systemd(1)\nWants=network-online.target\nAfter=network-online.target\nRequiresMountsFor=%t/containers\n\n[Service]\nEnvironment=PODMAN_SYSTEMD_UNIT=%n\nRestart=on-failure\nTimeoutStopSec=70\nExecStart=/usr/bin/podman start webserver\nExecStop=/usr/bin/podman stop -t 10 webserver\nExecStopPost=/usr/bin/podman rm -f webserver\nPIDFile=%t/containers/container-webserver.pid\nType=forking\n\n[Install]\nWantedBy=default.target';
    }
    
    return null;
}

/**
 * Section 10: Remote Resources - Output Generator
 */
function generateSection10Output(command, input, tokens) {
    // Task 1: Show NFS exports
    if (command === 'showmount' && (input.includes('-e') || input.includes('--exports'))) {
        return 'Export list for 192.168.1.100:\n/exports/data  192.168.1.0/24\n/exports/share *';
    }
    
    // Task 3: Verify NFS mount
    if (command === 'mount' && input.includes('/mnt/nfs')) {
        return '192.168.1.100:/exports/data on /mnt/nfs type nfs4 (rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.1.50,local_lock=none,addr=192.168.1.100)';
    }
    
    if (command === 'df' && input.includes('/mnt/nfs')) {
        return 'Filesystem                       1K-blocks      Used Available Use% Mounted on\n192.168.1.100:/exports/data    52428800  10485760  41943040  20% /mnt/nfs';
    }
    
    if (command === 'findmnt' && input.includes('/mnt/nfs')) {
        return 'TARGET    SOURCE                          FSTYPE OPTIONS\n/mnt/nfs  192.168.1.100:/exports/data     nfs4   rw,relatime,vers=4.2,rsize=1048576,wsize=1048576';
    }
    
    // Task 6: Show NFS mounts
    if (command === 'mount' && input.includes('-t') && input.includes('nfs')) {
        return '192.168.1.100:/exports/data on /mnt/nfs type nfs4 (rw,relatime,vers=4.2)';
    }
    
    if (command === 'findmnt' && input.includes('-t') && input.includes('nfs')) {
        return 'TARGET    SOURCE                          FSTYPE OPTIONS\n/mnt/nfs  192.168.1.100:/exports/data     nfs4   rw,relatime,vers=4.2';
    }
    
    if (command === 'df' && input.includes('-t') && input.includes('nfs')) {
        return 'Filesystem                       1K-blocks      Used Available Use% Mounted on\n192.168.1.100:/exports/data    52428800  10485760  41943040  20% /mnt/nfs';
    }
    
    // Task 7: NFS statistics
    if (command === 'nfsstat') {
        if (input.includes('-c')) {
            return 'Client rpc stats:\ncalls      retrans    authrefrsh\n1234       0          1234';
        }
        if (input.includes('-m')) {
            return '/mnt/nfs from 192.168.1.100:/exports/data\n Flags:\trw,relatime,vers=4.2,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp\n Stats:\tage=3600';
        }
        return 'Client rpc stats:\ncalls      retrans    authrefrsh\n1234       0          1234\n\nClient nfs v4:\nnull         read         write        commit       open         \n0         0% 123       10% 45         3% 12         1% 89         7%';
    }
    
    return null;
}

/**
 * Section 11: SELinux - Output Generator
 */
function generateSection11Output(command, input, tokens) {
    // SELinux status and mode
    if (command === 'getenforce') {
        return 'Enforcing';
    }
    
    if (command === 'sestatus') {
        return 'SELinux status:                 enabled\nSELinuxfs mount:                /sys/fs/selinux\nSELinux root directory:         /etc/selinux\nLoaded policy name:             targeted\nCurrent mode:                   enforcing\nMode from config file:          enforcing\nPolicy MLS status:              enabled\nPolicy deny_unknown status:     allowed\nMemory protection checking:     actual (secure)\nMax kernel policy version:      33';
    }
    
    // SELinux contexts
    if (command === 'ls' && input.includes('-Z')) {
        if (input.includes('/var/www/html')) {
            return 'unconfined_u:object_r:httpd_sys_content_t:s0 index.html\nunconfined_u:object_r:httpd_sys_content_t:s0 app.php';
        }
        if (input.includes('/tmp')) {
            return 'unconfined_u:object_r:user_tmp_t:s0 file1.txt\nunconfined_u:object_r:user_tmp_t:s0 file2.txt';
        }
    }
    
    if (command === 'stat' && input.includes('/var/www/html')) {
        return '  File: /var/www/html\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nContext: system_u:object_r:httpd_sys_content_t:s0\nAccess: 2026-02-23 12:00:00.000000000 -0500\nModify: 2026-02-23 12:00:00.000000000 -0500\nChange: 2026-02-23 12:00:00.000000000 -0500\n Birth: -';
    }
    
    // SELinux booleans
    if (command === 'getsebool') {
        if (input.includes('-a')) {
            return 'httpd_can_network_connect --> off\nhttpd_enable_homedirs --> off\nhttpd_use_nfs --> off\nftpd_anon_write --> off\nftpd_full_access --> on';
        }
        if (input.includes('httpd_can_network_connect')) {
            return 'httpd_can_network_connect --> on';
        }
        if (input.includes('httpd_enable_homedirs')) {
            return 'httpd_enable_homedirs --> on';
        }
        if (input.includes('ftpd_anon_write')) {
            return 'ftpd_anon_write --> off';
        }
    }
    
    if (command === 'semanage' && input.includes('boolean')) {
        return 'SELinux boolean                State  Default Description\nhttpd_can_network_connect      (on   ,   on)  Allow httpd to make network connections\nhttpd_enable_homedirs          (on   ,  off)  Allow httpd to read home directories\nhttpd_use_nfs                  (off  ,  off)  Allow httpd to access NFS file systems\nftpd_anon_write                (off  ,  off)  Allow ftp servers to upload files\nftpd_full_access               (on   ,  off)  Allow ftp servers full access';
    }
    
    // SELinux ports
    if (command === 'semanage' && input.includes('port')) {
        if (input.includes('-a') || input.includes('--add')) {
            return ''; // Silent success for semanage port -a
        }
        if (input.includes('-d') || input.includes('--delete')) {
            return ''; // Silent success for semanage port -d
        }
        if (input.includes('http')) {
            return 'SELinux Port Type              Proto    Port Number\n\nhttp_port_t                    tcp      80, 443, 488, 8008, 8009, 8080, 8443, 9000';
        }
        if (input.includes('ssh')) {
            return 'SELinux Port Type              Proto    Port Number\n\nssh_port_t                     tcp      22, 2222';
        }
        if (input.includes('-l') && input.includes('-C')) {
            return 'SELinux Port Type              Proto    Port Number\n\nhttp_port_t                    tcp      8080\nssh_port_t                     tcp      2222';
        }
        if (input.includes('8080')) {
            return 'http_port_t                    tcp      8080';
        }
    }
    
    // SELinux modification commands (Implementation tasks)
    if (command === 'setsebool') {
        if (input.includes('-P')) {
            return ''; // Silent success for setsebool -P
        }
        return ''; // Silent success
    }
    
    if (command === 'semanage' && input.includes('fcontext')) {
        if (input.includes('-a') || input.includes('--add')) {
            return ''; // Silent success
        }
        if (input.includes('-d') || input.includes('--delete')) {
            return ''; // Silent success
        }
    }
    
    if (command === 'restorecon') {
        if (input.includes('-v')) {
            if (input.includes('/var/www/html')) {
                return 'Relabeled /var/www/html/index.html from unconfined_u:object_r:user_home_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0';
            }
            return 'Relabeled file from unconfined_u:object_r:user_tmp_t:s0 to system_u:object_r:httpd_sys_content_t:s0';
        }
        return ''; // Silent without -v
    }
    
    if (command === 'chcon') {
        return ''; // Silent success
    }
    
    // SELinux file contexts  
    if (command === 'matchpathcon') {
        if (input.includes('/var/www/html')) {
            return '/var/www/html\tsystem_u:object_r:httpd_sys_content_t:s0';
        }
    }
    
    if (command === 'ausearch') {
        if (input.includes('avc')) {
            return '----\ntime->Sun Feb 23 12:00:00 2026\ntype=AVC msg=audit(1708704000.123:456): avc:  denied  { write } for  pid=1234 comm="httpd" name="index.html" dev="sda1" ino=67890 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:user_home_t:s0 tclass=file permissive=0';
        }
    }
    
    if (command === 'grep' && input.includes('denied') && input.includes('/var/log/audit/audit.log')) {
        return 'type=AVC msg=audit(1708704000.123:456): avc:  denied  { write } for  pid=1234 comm="httpd" name="index.html" dev="sda1" ino=67890 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:user_home_t:s0 tclass=file permissive=0';
    }
    
    // SELinux user mappings
    if (command === 'semanage' && input.includes('login')) {
        return 'Login Name           SELinux User         MLS/MCS Range        Service\n\n__default__          unconfined_u         s0-s0:c0.c1023       *\njohn                 staff_u              s0-s0:c0.c1023       *\nroot                 unconfined_u         s0-s0:c0.c1023       *';
    }
    
    if (command === 'semanage' && input.includes('user')) {
        return '                Labeling   MLS/       MLS/                          \nSELinux User    Prefix     MCS Level  MCS Range                      SELinux Roles\n\nguest_u         user       s0         s0                             guest_r\nroot            user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r\nstaff_u         user       s0         s0-s0:c0.c1023                 staff_r sysadm_r system_r unconfined_r\nunconfined_u    user       s0         s0-s0:c0.c1023                 system_r unconfined_r\nuser_u          user       s0         s0                             user_r';
    }
    
    // SELinux modules
    if (command === 'semodule' && input.includes('-l')) {
        return 'abrt\t1.7.1\napache\t3.14.3\nauthlogin\t3.14.3\nbase\t3.14.3\nchronyd\t3.14.3\ncontainer\t3.14.3\ncron\t3.14.3\nfirewalld\t3.14.3\nhttpd\t3.14.3\nmysql\t3.14.3\npostfix\t3.14.3\nssh\t3.14.3';
    }
    
    if (command === 'ps' && (input.includes('auxZ') || input.includes('-eZ'))) {
        return 'LABEL                               USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nsystem_u:system_r:httpd_t:s0        apache      1234  0.0  0.5 224080  5456 ?        Ss   08:15   0:02 /usr/sbin/httpd -DFOREGROUND\nsystem_u:system_r:sshd_t:s0-s0:c0.c1023 root     1145  0.0  0.2 112860  2548 ?    Ss   08:15   0:00 /usr/sbin/sshd -D';
    }
    
    return null;
}

/**
 * Section 12: Shell Scripting - Output Generator
 */
function generateSection12Output(command, input, tokens) {
    // Script execution outputs
    if (command === 'bash' || command === 'sh') {
        if (input.includes('script.sh')) {
            return 'Script executed successfully\nOutput: Hello World\nExit code: 0';
        }
    }
    
    // Test command outputs
    if (command === 'test' || command === '[') {
        return ''; // test command produces no output, uses exit codes
    }
    
    // echo outputs for variable expansion
    if (command === 'echo') {
        if (input.includes('$PATH')) {
            return '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
        }
        if (input.includes('$HOME')) {
            return '/root';
        }
        if (input.includes('$USER')) {
            return 'root';
        }
    }
    
    // File checks
    if (command === 'ls' && input.includes('/usr/local/bin')) {
        return 'backup.sh  cleanup.sh  monitor.sh';
    }
    
    if (command === 'cat' && input.includes('.sh')) {
        return '#!/bin/bash\n\n# Sample script\necho "Running backup..."\nrsync -av /data/ /backup/\necho "Backup complete"';
    }
    
    return null;
}

/**
 * Section 13: Task Scheduling - Output Generator
 */
function generateSection13Output(command, input, tokens) {
    // Crontab commands
    if (command === 'crontab' && input.includes('-l')) {
        return '# m h  dom mon dow   command\n0 2 * * * /usr/local/bin/backup.sh\n*/15 * * * * /usr/local/bin/check-disk.sh\n30 3 * * 1 /usr/local/bin/weekly-report.sh';
    }
    
    // at/atq commands
    if (command === 'atq' || (command === 'at' && input.includes('-l'))) {
        return '1\tWed Feb 24 10:00:00 2026 a root\n2\tThu Feb 25 15:30:00 2026 a root';
    }
    
    if (command === 'at' && input.includes('-c')) {
        return '#!/bin/sh\n# atrun uid=0 gid=0\n# mail     root 0\numask 22\ncd /root || {\n\t echo \'Execution directory inaccessible\' >&2\n\t exit 1\n}\n/usr/local/bin/cleanup.sh';
    }
    
    // systemctl timer commands
    if (command === 'systemctl' && input.includes('list-timers')) {
        return 'NEXT                        LEFT          LAST                        PASSED       UNIT                         ACTIVATES                     \nWed 2026-02-24 00:00:00 EST 7h left       Tue 2026-02-23 00:00:00 EST 16h ago      dnf-makecache.timer          dnf-makecache.service\nWed 2026-02-24 03:10:00 EST 10h left      Tue 2026-02-23 03:10:00 EST 13h ago      systemd-tmpfiles-clean.timer systemd-tmpfiles-clean.service\nWed 2026-02-24 06:00:00 EST 13h left      Tue 2026-02-23 06:00:00 EST 10h ago      logrotate.timer              logrotate.service\n\n3 timers listed.';
    }
    
    // crond/atd status
    if (command === 'systemctl' && input.includes('status')) {
        if (input.includes('crond')) {
            return '● crond.service - Command Scheduler\n     Loaded: loaded (/usr/lib/systemd/system/crond.service; enabled; vendor preset: enabled)\n     Active: active (running) since Tue 2026-02-23 08:15:00 EST; 8h ago\n       Docs: man:crond(8)\n             man:crontab(5)\n   Main PID: 1145 (crond)\n      Tasks: 1 (limit: 23065)\n     Memory: 1.2M\n        CPU: 23ms\n     CGroup: /system.slice/crond.service\n             └─1145 /usr/sbin/crond -n';
        }
        if (input.includes('atd')) {
            return '● atd.service - Deferred execution scheduler\n     Loaded: loaded (/usr/lib/systemd/system/atd.service; enabled; vendor preset: enabled)\n     Active: active (running) since Tue 2026-02-23 08:15:00 EST; 8h ago\n   Main PID: 1156 (atd)\n      Tasks: 1 (limit: 23065)\n     Memory: 612.0K\n        CPU: 12ms\n     CGroup: /system.slice/atd.service\n             └─1156 /usr/sbin/atd -f';
        }
    }
    
    // Cron logs
    if (command === 'grep' && input.includes('CRON') && input.includes('/var/log/cron')) {
        return 'Feb 23 02:00:01 server1 CROND[12345]: (root) CMD (/usr/local/bin/backup.sh)\nFeb 23 02:15:01 server1 CROND[12456]: (root) CMD (/usr/local/bin/check-disk.sh)\nFeb 23 03:30:01 server1 CROND[12567]: (root) CMD (/usr/local/bin/weekly-report.sh)';
    }
    
    if (command === 'journalctl' && input.includes('crond')) {
        return 'Feb 23 02:00:01 server1 crond[1145]: (*system*) RELOAD (/etc/cron.d/0hourly)\nFeb 23 02:00:01 server1 crond[1145]: (root) CMD (/usr/local/bin/backup.sh)\nFeb 23 02:15:01 server1 crond[1145]: (root) CMD (/usr/local/bin/check-disk.sh)';
    }
    
    // anacron/cron directories
    if (command === 'ls') {
        if (input.includes('/etc/cron.daily')) {
            return 'logrotate  man-db.cron';
        }
        if (input.includes('/etc/cron.hourly')) {
            return '0anacron';
        }
        if (input.includes('/etc/cron.d')) {
            return '0hourly  sysstat';
        }
    }
    
    if (command === 'cat' && input.includes('/etc/anacrontab')) {
        return '# /etc/anacrontab: configuration file for anacron\n\n# See anacron(8) and anacrontab(5) for details.\n\nSHELL=/bin/sh\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\nMAILTO=root\n# the maximal random delay added to the base delay of the jobs\nRANDOM_DELAY=45\n# the jobs will be started during the following hours only\nSTART_HOURS_RANGE=3-22\n\n#period in days   delay in minutes   job-identifier   command\n1\t5\tcron.daily\t\tnice run-parts /etc/cron.daily\n7\t25\tcron.weekly\t\tnice run-parts /etc/cron.weekly\n@monthly 45\tcron.monthly\t\tnice run-parts /etc/cron.monthly';
    }
    
    return null;
}

/**
 * Section 14: Boot & GRUB - Output Generator
 */
function generateSection14Output(command, input, tokens) {
    // systemctl target commands
    if (command === 'systemctl' && input.includes('get-default')) {
        return 'multi-user.target';
    }
    
    if (command === 'systemctl' && input.includes('list-units') && input.includes('target')) {
        return 'UNIT                   LOAD   ACTIVE SUB    DESCRIPTION                              \nbasic.target           loaded active active Basic System\ncryptsetup.target      loaded active active Local Encrypted Volumes\ngetty.target           loaded active active Login Prompts\nlocal-fs.target        loaded active active Local File Systems\nmulti-user.target      loaded active active Multi-User System\nnetwork.target         loaded active active Network\npaths.target           loaded active active Paths\nremote-fs.target       loaded active active Remote File Systems\nslices.target          loaded active active Slices\nsockets.target         loaded active active Sockets\nswap.target            loaded active active Swap\nsysinit.target         loaded active active System Initialization\ntimers.target          loaded active active Timers\n\n13 loaded units listed.';
    }
    
    // GRUB commands
    if (command === 'cat' && input.includes('/proc/cmdline')) {
        return 'BOOT_IMAGE=(hd0,gpt2)/vmlinuz-5.14.0-362.el9.x86_64 root=/dev/mapper/rhel-root ro crashkernel=1G-4G:192M,4G-64G:256M,64G-:512M resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet';
    }
    
    if (command === 'grub2-editenv' && input.includes('list')) {
        return 'saved_entry=0\nkernelopts=root=/dev/mapper/rhel-root ro crashkernel=1G-4G:192M,4G-64G:256M,64G-:512M resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap rhgb quiet';
    }
    
    // Kernel information
    if (command === 'uname' && input.includes('-r')) {
        return '5.14.0-362.el9.x86_64';
    }
    
    if (command === 'lsmod') {
        return 'Module                  Size  Used by\nipmi_devintf           20480  0\nipmi_msghandler        65536  1 ipmi_devintf\nvmw_vsock_virtio_transport_common    32768  1 vmw_vsock_virtio_transport\nvsock                  36864  2 vmw_vsock_virtio_transport_common,vmw_vsock_virtio_transport\nvmw_vmci               77824  2 vmw_vsock_virtio_transport_common,vsock\ni40e                  548864  0\nxt_conntrack           16384  1\nnf_conntrack          139264  2 xt_conntrack,nfnetlink_cttimeout';
    }
    
    if (command === 'lsmod' && input.includes('grep')) {
        if (input.includes('vmw')) {
            return 'vmw_vsock_virtio_transport_common    32768  1 vmw_vsock_virtio_transport\nvmw_vmci               77824  2 vmw_vsock_virtio_transport_common,vsock';
        }
    }
    
    if (command === 'modinfo' && input.includes('vmw_vmci')) {
        return 'filename:       /lib/modules/5.14.0-362.el9.x86_64/kernel/drivers/misc/vmw_vmci/vmw_vmci.ko.xz\nlicense:        GPL v2\ndescription:    VMware VMCI Driver\nauthor:         VMware, Inc.\nalias:          pci:v000015ADd00000740sv*sd*bc*sc*i*\nretpoline:      Y\nintree:         Y\nname:           vmw_vmci\nvermagic:       5.14.0-362.el9.x86_64 SMP preempt mod_unload modversions \nsig_id:         PKCS#7\nsigner:         Red Hat Enterprise Linux kernel signing key\nsig_key:        A1:2B:3C:4D:5E:6F:70:80:90:A0:B0:C0:D0:E0:F0:10';
    }
    
    return null;
}

/**
 * Section 15: Time & Date Services - Output Generator
 */
function generateSection15Output(command, input, tokens) {
    // Date/time commands
    if (command === 'date') {
        if (!tokens[1]) {
            return 'Wed Feb 23 16:45:30 EST 2026';
        }
        if (input.includes('+%Z')) {
            return 'EST';
        }
        if (input.includes('+%z')) {
            return '-0500';
        }
    }
    
    if (command === 'timedatectl') {
        if (!tokens[1] || input.includes('status')) {
            return '               Local time: Wed 2026-02-23 16:45:30 EST\n           Universal time: Wed 2026-02-23 21:45:30 UTC\n                 RTC time: Wed 2026-02-23 21:45:30\n                Time zone: America/New_York (EST, -0500)\nSystem clock synchronized: yes\n              NTP service: active\n          RTC in local TZ: no';
        }
        if (input.includes('list-timezones')) {
            return 'Africa/Abidjan\nAfrica/Accra\nAfrica/Addis_Ababa\nAmerica/Chicago\nAmerica/Denver\nAmerica/Los_Angeles\nAmerica/New_York\nAsia/Tokyo\nEurope/London\nEurope/Paris\nUTC';
        }
    }
    
    if (command === 'hwclock') {
        return '2026-02-23 21:45:30.123456-05:00';
    }
    
    // Chrony commands
    if (command === 'chronyc' && input.includes('sources')) {
        if (input.includes('-v')) {
            return `  .-- Source mode  '^' = server, '=' = peer, '#' = local clock.
 / .- Source state '*' = current best, '+' = combined, '-' = not combined,
| /             'x' = may be in error, '~' = too variable, '?' = unusable.
||                                                 .- xxxx [ xxxx ] +/- xxxx
||      Reachability register (octal) -.           |  xxxx   xxxx     xxxx
||      Log2(Polling interval) --.      |          |   \\____ ____/   /   
||                                \\     |          |        /         |    
MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* time1.google.com              1   6   377    23   +123us[ +145us] +/-   15ms
^- time2.google.com              1   6   377    24   +234us[ +256us] +/-   18ms
^+ time3.google.com              1   6   377    25   -156us[ -134us] +/-   16ms
^- time4.google.com              1   6   377    26   +789us[ +811us] +/-   22ms`;
        }
        return 'MS Name/IP address         Stratum Poll Reach LastRx Last sample               \n===============================================================================\n^* time1.google.com              1   6   377    23   +123us[ +145us] +/-   15ms\n^- time2.google.com              1   6   377    24   +234us[ +256us] +/-   18ms\n^+ time3.google.com              1   6   377    25   -156us[ -134us] +/-   16ms\n^- time4.google.com              1   6   377    26   +789us[ +811us] +/-   22ms';
    }
    
    if (command === 'chronyc' && input.includes('tracking')) {
        return 'Reference ID    : C0A80101 (time1.google.com)\nStratum         : 2\nRef time (UTC)  : Wed Feb 23 21:45:00 2026\nSystem time     : 0.000145234 seconds fast of NTP time\nLast offset     : +0.000123456 seconds\nRMS offset      : 0.000234567 seconds\nFrequency       : 23.456 ppm slow\nResidual freq   : +0.003 ppm\nSkew            : 0.124 ppm\nRoot delay      : 0.015432101 seconds\nRoot dispersion : 0.000987654 seconds\nUpdate interval : 64.3 seconds\nLeap status     : Normal';
    }
    
    if (command === 'chronyc' && input.includes('activity')) {
        return '200 OK\n4 sources online\n0 sources offline\n0 sources doing burst (return to online)\n0 sources doing burst (return to offline)\n0 sources with unknown address';
    }
    
    if (command === 'chronyc' && input.includes('sourcestats')) {
        return 'Name/IP Address            NP  NR  Span  Frequency  Freq Skew  Offset  Std Dev\n==============================================================================\ntime1.google.com            8   5   519     +0.012      0.124  +123us   234us\ntime2.google.com            8   5   519     +0.023      0.135  +234us   312us\ntime3.google.com            8   5   519     -0.015      0.128  -156us   245us\ntime4.google.com            8   5   519     +0.078      0.142  +789us   401us';
    }
    
    // Chrony config
    if (command === 'cat' && input.includes('/etc/chrony.conf')) {
        return '# Use public servers from the pool.ntp.org project.\n# Please consider joining the pool (https://www.pool.ntp.org/join.html).\npool 2.rhel.pool.ntp.org iburst\n\n# Use NTP servers from DHCP.\nsourcedir /run/chrony-dhcp\n\n# Record the rate  at which the system clock gains/losses time.\ndriftfile /var/lib/chrony/drift\n\n# Allow the system clock to be stepped in the first three updates\n# if its offset is larger than 1 second.\nmakestep 1.0 3\n\n# Enable kernel synchronization of the real-time clock (RTC).\nrtcsync\n\n# Enable hardware timestamping on all interfaces that support it.\n#hwtimestamp *\n\n# Serve time even if not synchronized to a time source.\n#local stratum 10\n\n# Specify file containing keys for NTP authentication.\nkeyfile /etc/chrony.keys\n\n# Save NTS keys and cookies.\nntsdumpdir /var/lib/chrony\n\n# Insert/delete leap seconds by slewing instead of stepping.\n#leapsecmode slew\n\n# Get TAI-UTC offset and leap seconds from the system tz database.\nleapsectz right/UTC\n\n# Specify directory for log files.\nlogdir /var/log/chrony\n\n# Select which information is logged.\n#log measurements statistics tracking';
    }
    
    if (command === 'cat' && input.includes('/var/lib/chrony/drift')) {
        return '23.456';
    }
    
    // systemctl chronyd status
    if (command === 'systemctl' && input.includes('status') && input.includes('chronyd')) {
        return '● chronyd.service - NTP client/server\n     Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)\n     Active: active (running) since Tue 2026-02-23 08:15:00 EST; 8h ago\n       Docs: man:chronyd(8)\n             man:chronyc(1)\n   Main PID: 1089 (chronyd)\n      Tasks: 1 (limit: 23065)\n     Memory: 2.1M\n        CPU: 123ms\n     CGroup: /system.slice/chronyd.service\n             └─1089 /usr/sbin/chronyd -F 2\n\nFeb 23 08:15:00 server1.example.com systemd[1]: Starting NTP client/server...\nFeb 23 08:15:00 server1.example.com chronyd[1089]: chronyd version 4.3 starting (+CMDMON +NTP +REFCLOCK +RTC +PRIVDROP +SCFILTER +SIGND +ASYNCDNS +NTS +SECHASH +IPV6 +DEBUG)\nFeb 23 08:15:00 server1.example.com chronyd[1089]: Frequency 23.456 +/- 0.124 ppm read from /var/lib/chrony/drift\nFeb 23 08:15:00 server1.example.com systemd[1]: Started NTP client/server.\nFeb 23 08:15:06 server1.example.com chronyd[1089]: Selected source 216.239.35.0 (time1.google.com)\nFeb 23 08:15:06 server1.example.com chronyd[1089]: System clock was stepped by 0.000123 seconds';
    }
    
    return null;
}

/**
 * Generate pre-check output for Implementation tasks (BEFORE state)
 * @param {object} task - The task object
 * @param {string} input - User's full input
 * @param {object} grepParsed - Parsed grep info if present
 * @returns {string|null} - Pre-check output or null
 */
function generatePreCheckOutput(task, input, grepParsed) {
    const questionSetIndex = getQuestionSetForSection(appState.currentSectionId);
    const section = getSectionById(appState.currentSectionId, questionSetIndex);
    const baseCommand = grepParsed ? grepParsed.command : input;
    const tokens = baseCommand.trim().split(/\s+/);
    const command = tokens[0];
    
    // Section-specific pre-check generators
    if (section.id === 1) {
        return generateSection1PreCheck(task, command, input, tokens);
    } else if (section.id === 2) {
        return generateSection2PreCheck(task, command, input, tokens);
    } else if (section.id === 3) {
        return generateSection3PreCheck(task, command, input, tokens);
    } else if (section.id === 4) {
        return generateSection4PreCheck(task, command, input, tokens);
    } else if (section.id === 5) {
        return generateSection5PreCheck(task, command, input, tokens);
    } else if (section.id === 6) {
        return generateSection6PreCheck(task, command, input, tokens);
    } else if (section.id === 7) {
        return generateSection7PreCheck(task, command, input, tokens);
    } else if (section.id === 8) {
        return generateSection8PreCheck(task, command, input, tokens);
    } else if (section.id === 9) {
        return generateSection9PreCheck(task, command, input, tokens);
    } else if (section.id === 10) {
        return generateSection10PreCheck(task, command, input, tokens);
    }
    
    return null;
}


/**
 * Section 1 Pre-Check Output (BEFORE state)
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
function generateSection2PreCheck(task, command, input, tokens) {
    if (task.id === 1) {
        if (command === 'ls' && hasFlags(input, 'ld') && input.includes('/opt/data')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 12:00 /opt/data';
        }
        if (command === 'stat' && input.includes('/opt/data')) {
            return '  File: /opt/data\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
    }
    
    if (task.id === 3) {
        if (command === 'ls' && hasFlags(input, 'ld') && input.includes('/opt/data')) {
            return 'drwxr-x--- 2 root root 4096 Jan 20 12:00 /opt/data';
        }
        if (command === 'stat' && input.includes('/opt/data')) {
            return '  File: /opt/data\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0750/drwxr-x---)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
    }
    
    if (task.id === 5) {
        if (command === 'getfacl' && input.includes('/opt/data')) {
            return '# file: /opt/data\n# owner: alice\n# group: sysops\nuser::rwx\ngroup::r-x\nother::---';
        }
        if (command === 'ls' && hasFlags(input, 'ld') && input.includes('/opt/data')) {
            return 'drwxr-x--- 2 alice sysops 4096 Jan 20 12:00 /opt/data';
        }
    }
    
    if (task.id === 7) {
        if (command === 'ls' && hasFlags(input, 'ld') && input.includes('/var/logs')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 11:30 /var/logs';
        }
        if (command === 'stat' && input.includes('/var/logs')) {
            return '  File: /var/logs\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:30:00.000000000 -0500\nModify: 2026-01-20 11:30:00.000000000 -0500\nChange: 2026-01-20 11:30:00.000000000 -0500\n Birth: -';
        }
    }
    
    return null;
}

/**
 * Section 3 Pre-Check Output (BEFORE state)
 */
function generateSection3PreCheck(task, command, input, tokens) {
    if (task.id === 1 && command === 'ls') {
        if (hasFlags(input, 'ld') && input.includes('/mnt/backup')) {
            return 'ls: cannot access \'/mnt/backup\': No such file or directory';
        }
        if (input.includes('/mnt') && !input.includes('/mnt/backup')) {
            return '';
        }
    }
    
    if (task.id === 3) {
        if (command === 'mount' && (input.includes('/mnt/backup') || input.includes('/dev/sdb1'))) {
            return '';
        }
        if (command === 'df' && input.includes('/mnt/backup')) {
            return 'df: /mnt/backup: No such file or directory';
        }
        if (command === 'findmnt' && input.includes('/mnt/backup')) {
            return '';
        }
    }
    
    if (task.id === 5 && command === 'ls' && input.includes('data-backup.tar.gz')) {
        return 'ls: cannot access \'data-backup.tar.gz\': No such file or directory';
    }
    
    return null;
}

/**
 * Section 4 Pre-Check Output (BEFORE state)
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
function generateSection5PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: httpd not running yet
    if (task.id === 1) {
        if (command === 'systemctl' && input.includes('status') && input.includes('httpd')) {
            return '○ httpd.service - The Apache HTTP Server\n     Loaded: loaded (/usr/lib/systemd/system/httpd.service; disabled; vendor preset: disabled)\n     Active: inactive (dead)\n       Docs: man:httpd.service(8)';
        }
        if (command === 'systemctl' && input.includes('is-active') && input.includes('httpd')) {
            return 'inactive';
        }
    }
    
    // Task 3 Pre-check: httpd not enabled yet
    if (task.id === 3) {
        if (command === 'systemctl' && input.includes('is-enabled') && input.includes('httpd')) {
            return 'disabled';
        }
    }
    
    // Task 5 Pre-check: default target is graphical
    if (task.id === 5) {
        if (command === 'systemctl' && input.includes('get-default')) {
            return 'graphical.target';
        }
    }
    
    // Task 7 Pre-check: crond is running
    if (task.id === 7) {
        if (command === 'systemctl' && input.includes('status') && input.includes('crond')) {
            return '● crond.service - Command Scheduler\n     Loaded: loaded (/usr/lib/systemd/system/crond.service; enabled; vendor preset: enabled)\n     Active: active (running) since Sun 2026-02-23 08:15:42 EST; 4h 15min ago\n       Docs: man:crond(8)\n             man:crontab(5)\n   Main PID: 1145 (crond)\n      Tasks: 1 (limit: 23065)\n     Memory: 1.2M\n        CPU: 12ms\n     CGroup: /system.slice/crond.service\n             └─1145 /usr/sbin/crond -n';
        }
        if (command === 'systemctl' && input.includes('is-active') && input.includes('crond')) {
            return 'active';
        }
    }
    
    // Task 11 Pre-check: PID file doesn't exist yet
    if (task.id === 11) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/httpd-pid.txt')) {
            return `${command}: /tmp/httpd-pid.txt: No such file or directory`;
        }
        if (command === 'ls' && input.includes('-l') && input.includes('/tmp/httpd-pid.txt')) {
            return 'ls: cannot access \'/tmp/httpd-pid.txt\': No such file or directory';
        }
    }
    
    return null;
}
/**
 * Section 6 Pre-Check Output (BEFORE state)
 */
function generateSection6PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: No filesystem on /dev/sdb1 yet
    if (task.id === 1) {
        if (command === 'blkid' && input.includes('/dev/sdb1')) {
            return '';
        }
        if (command === 'lsblk' && input.includes('-f') && input.includes('/dev/sdb1')) {
            return 'NAME   FSTYPE LABEL UUID FSAVAIL FSUSE% MOUNTPOINT\nsdb1';
        }
    }
    
    // Task 3 Pre-check: Not mounted yet
    if (task.id === 3) {
        if (command === 'mount' && input.includes('/mnt/data')) {
            return '';
        }
        if (command === 'df' && input.includes('/mnt/data')) {
            return 'df: /mnt/data: No such file or directory';
        }
        if (command === 'findmnt' && input.includes('/mnt/data')) {
            return '';
        }
    }
    
    // Task 5 Pre-check: UUID file doesn't exist yet
    if (task.id === 5) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/sdb1-uuid.txt')) {
            return `${command}: /tmp/sdb1-uuid.txt: No such file or directory`;
        }
    }
    
    // Task 7 Pre-check: No swap on /dev/sdc1 yet
    if (task.id === 7) {
        if (command === 'blkid' && input.includes('/dev/sdc1')) {
            return '';
        }
        if (command === 'lsblk' && input.includes('-f') && input.includes('/dev/sdc1')) {
            return 'NAME   FSTYPE LABEL UUID FSAVAIL FSUSE% MOUNTPOINT\nsdc1';
        }
        if (command === 'swapon' && (input.includes('--show') || input.includes('-s'))) {
            return '';
        }
    }
    
    // Task 9 Pre-check: Swap not activated yet
    if (task.id === 9) {
        if (command === 'swapon' && (input.includes('--show') || input.includes('-s'))) {
            return '';
        }
        if (command === 'cat' && input.includes('/proc/swaps')) {
            return 'Filename\t\t\t\tType\t\tSize\t\tUsed\t\tPriority';
        }
    }
    
    return null;
}

/**
 * Section 7: Systems Maintenance - Pre-Check Generator
 */
function generateSection7PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: tmux not installed yet
    if (task.id === 1) {
        if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
            return 'package tmux is not installed';
        }
        if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
            return 'Error: No matching Packages to list';
        }
    }
    
    // Task 3 Pre-check: tmux installed (before remove)
    if (task.id === 3) {
        if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
            return 'tmux-3.2a-4.el9.x86_64';
        }
        if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
            return 'Installed Packages\ntmux.x86_64                                     3.2a-4.el9                                      @baseos';
        }
    }
    
    // Task 5 Pre-check: pkg-count file doesn't exist yet
    if (task.id === 5) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/pkg-count.txt')) {
            return `${command}: /tmp/pkg-count.txt: No such file or directory`;
        }
    }
    
    return null;
}

/**
 * Section 8: Networking - Pre-Check Generator
 */
function generateSection8PreCheck(task, command, input, tokens) {
    // Task 3 Pre-check: http service not in firewall yet
    if (task.id === 3) {
        if (command === 'firewall-cmd' && input.includes('--list-all')) {
            return 'public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: cockpit dhcpv6-client ssh\n  ports: \n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:';
        }
        if (command === 'firewall-cmd' && input.includes('--list-services')) {
            return 'cockpit dhcpv6-client ssh';
        }
    }
    
    // Task 6 Pre-check: port 8080 not added yet
    if (task.id === 6) {
        if (command === 'firewall-cmd' && input.includes('--list-all')) {
            return 'public (active)\n  target: default\n  icmp-block-inversion: no\n  interfaces: ens160\n  sources: \n  services: cockpit dhcpv6-client http ssh\n  ports: \n  protocols: \n  forward: yes\n  masquerade: no\n  forward-ports: \n  source-ports: \n  icmp-blocks: \n  rich rules:';
        }
        if (command === 'firewall-cmd' && input.includes('--list-ports')) {
            return '';
        }
    }
    
    return null;
}

/**
 * Section 9: Containers - Pre-Check Generator
 */
function generateSection9PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: No images yet
    if (task.id === 1) {
        if (command === 'podman' && (input.includes('images') || (input.includes('image') && input.includes('ls')))) {
            return 'REPOSITORY  TAG  IMAGE ID  CREATED  SIZE';
        }
    }
    
    // Task 2 Pre-check: nginx not pulled yet
    if (task.id === 2) {
        if (command === 'podman' && (input.includes('images') || (input.includes('image') && input.includes('ls')))) {
            return 'REPOSITORY  TAG  IMAGE ID  CREATED  SIZE';
        }
    }
    
    // Task 4 Pre-check: No containers running yet
    if (task.id === 4) {
        if (command === 'podman' && input.includes('ps')) {
            if (input.includes('-a')) {
                return 'CONTAINER ID  IMAGE  COMMAND  CREATED  STATUS  PORTS  NAMES';
            }
            return 'CONTAINER ID  IMAGE  COMMAND  CREATED  STATUS  PORTS  NAMES';
        }
    }
    
    // Task 6 Pre-check: Container running (before stop)
    if (task.id === 6) {
        if (command === 'podman' && input.includes('ps')) {
            if (input.includes('-a')) {
                return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS        PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  5 minutes ago  Up 5 minutes  0.0.0.0:8080->80/tcp  webserver';
            }
            return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS        PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  5 minutes ago  Up 5 minutes  0.0.0.0:8080->80/tcp  webserver';
        }
    }
    
    // Task 8 Pre-check: Container exists (before remove)
    if (task.id === 8) {
        if (command === 'podman' && input.includes('ps') && input.includes('-a')) {
            return 'CONTAINER ID  IMAGE                           COMMAND               CREATED        STATUS                    PORTS                 NAMES\n1234567890ab  docker.io/library/nginx:latest  nginx -g daemon o...  10 minutes ago  Exited (0) 2 minutes ago  0.0.0.0:8080->80/tcp  webserver';
        }
    }
    
    return null;
}

/**
 * Section 10: Remote Resources - Pre-Check Generator
 */
function generateSection10PreCheck(task, command, input, tokens) {
    // Task 2 Pre-check: Not mounted yet
    if (task.id === 2) {
        if (command === 'mount' && input.includes('/mnt/nfs')) {
            return '';
        }
        if (command === 'df' && input.includes('/mnt/nfs')) {
            return 'df: /mnt/nfs: No such file or directory';
        }
        if (command === 'findmnt' && input.includes('/mnt/nfs')) {
            return '';
        }
    }
    
    // Task 4 Pre-check: NFS mounted (before umount)
    if (task.id === 4) {
        if (command === 'mount' && input.includes('/mnt/nfs')) {
            return '192.168.1.100:/exports/data on /mnt/nfs type nfs4 (rw,relatime,vers=4.2)';
        }
        if (command === 'df' && input.includes('/mnt/nfs')) {
            return 'Filesystem                       1K-blocks      Used Available Use% Mounted on\n192.168.1.100:/exports/data    52428800  10485760  41943040  20% /mnt/nfs';
        }
        if (command === 'findmnt' && input.includes('/mnt/nfs')) {
            return 'TARGET    SOURCE                          FSTYPE OPTIONS\n/mnt/nfs  192.168.1.100:/exports/data     nfs4   rw,relatime,vers=4.2';
        }
    }
    
    return null;
}