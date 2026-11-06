/** Red Cat - Section 3: Permissions & ACLs */

function generateSection3Output(command, input, tokens) {
    // Get current filesystem state
    const fsState = typeof getFileSystemState === 'function' ? getFileSystemState() : {};
    
    // Handle ls commands with dynamic state
    if (command === 'ls') {
        // Handle ls -ld for specific paths (dynamic based on state)
        if (hasFlags(input, 'ld')) {
            // Extract path from command
            const pathMatch = input.match(/\/[^\s]+/);
            const path = pathMatch ? pathMatch[0] : null;
            
            if (path && fsState[path] && typeof generateLsOutput === 'function') {
                return generateLsOutput(path, fsState[path], true);
            }
            
            // Fallback to static output for paths not in state
            if (input.includes('/opt/webapp')) {
                const state = fsState['/opt/webapp'] || { mode: '0755', owner: 'root', group: 'root', acls: [] };
                return typeof generateLsOutput === 'function' 
                    ? generateLsOutput('/opt/webapp', state, true)
                    : 'drwxr-xr-x 2 root root 4096 Jan 20 12:00 /opt/webapp';
            }
            if (input.includes('/var/backup')) {
                const state = fsState['/var/backup'] || { mode: '0755', owner: 'root', group: 'root', acls: [] };
                return typeof generateLsOutput === 'function'
                    ? generateLsOutput('/var/backup', state, true)
                    : 'drwxr-xr-x 2 root backup 4096 Jan 20 11:30 /var/backup';
            }
            if (input.includes('/shared/projects')) {
                const state = fsState['/shared/projects'] || { mode: '0755', owner: 'root', group: 'root', acls: [] };
                return typeof generateLsOutput === 'function'
                    ? generateLsOutput('/shared/projects', state, true)
                    : 'drwxr-sr-x 2 root developers 4096 Jan 20 09:30 /shared/projects';
            }
            if (input.includes('/data/reports')) {
                const state = fsState['/data/reports'] || { mode: '0755', owner: 'root', group: 'root', acls: [] };
                return typeof generateLsOutput === 'function'
                    ? generateLsOutput('/data/reports', state, true)
                    : 'drwxr-xr-x+ 2 root managers 4096 Jan 20 14:00 /data/reports';
            }
            if (input.includes('/opt/data')) {
                const state = fsState['/opt/data'] || { mode: '0750', owner: 'root', group: 'root', acls: [] };
                return typeof generateLsOutput === 'function'
                    ? generateLsOutput('/opt/data', state, true)
                    : 'drwxr-x---+ 2 alice sysops 4096 Jan 20 12:00 /opt/data';
            }
        }
        // ls -la: show directory contents (all files including hidden)
        if (hasFlags(input, 'la') && !hasFlags(input, 'd')) {
            if (input.includes('/opt/webapp')) {
                return 'total 20\ndrwxr-xr-x+  2 webuser developers 4096 Jan 20 12:00 .\ndrwxr-xr-x  15 root    root       4096 Jan 20 09:00 ..\n-rw-r--r--   1 webuser developers 2048 Jan 20 12:00 index.html\n-rw-r--r--   1 webuser developers 4096 Jan 20 12:00 app.php\n-rw-r--r--   1 webuser developers 1024 Jan 20 12:00 style.css';
            }
            if (input.includes('/var/backup')) {
                return 'total 12\ndrwxr-xr-x  2 root backup 4096 Jan 20 11:30 .\ndrwxr-xr-x 17 root root   4096 Jan 20 09:00 ..\n-rw-r--r--  1 root backup 1024 Jan 20 11:30 readme.txt';
            }
            if (input.includes('/shared/projects')) {
                return 'total 16\ndrwxr-sr-x+  2 root developers 4096 Jan 20 09:30 .\ndrwxr-xr-x  17 root root       4096 Jan 20 09:00 ..\ndrwxr-sr-x   2 root developers 4096 Jan 20 09:30 web-project\ndrwxr-sr-x   2 root developers 4096 Jan 20 09:30 db-schema';
            }
            if (input.includes('/data/reports')) {
                return 'total 16\ndrwxr-xr-x+  2 root managers 4096 Jan 20 14:00 .\ndrwxr-xr-x  17 root root     4096 Jan 20 09:00 ..\n-rw-r--r--   1 root managers 2048 Jan 20 14:00 q1-report.pdf\n-rw-r--r--   1 root managers 1024 Jan 20 14:00 summary.txt';
            }
            if (input.includes('/tmp/shared')) {
                return 'total 16\ndrwxrwxrwt  2 root root 4096 Jan 20 15:00 .\ndrwxrwxrwt 17 root root 4096 Jan 20 09:00 ..\n-rw-r--r--  1 root root 1024 Jan 20 14:30 shared-data.txt';
            }
            if (input.includes('/shared/docs')) {
                return 'total 16\ndrwxr-xr-x+  2 root root 4096 Jan 20 13:00 .\ndrwxr-xr-x  17 root root 4096 Jan 20 09:00 ..\n-rw-r--r--   1 root root 1024 Jan 20 13:00 overview.md\n-rw-r--r--   1 root root 2048 Jan 20 13:00 guide.pdf';
            }
            if (input.includes('/srv/files')) {
                return 'total 16\ndrwxr-xr-x  2 root root 4096 Jan 20 10:00 .\ndrwxr-xr-x 17 root root 4096 Jan 20 09:00 ..\n-rw-r--r--  1 root root 1024 Jan 20 10:00 file1.txt\n-rw-r--r--  1 root root 2048 Jan 20 10:01 file2.txt';
            }
            if (input.includes('/opt/myapp')) {
                return 'total 16\ndrwxr-xr-x  4 appuser appsvc 4096 Jan 20 11:00 .\ndrwxr-xr-x 17 root    root   4096 Jan 20 09:00 ..\ndrwxr-xr-x  2 appuser appsvc 4096 Jan 20 11:00 bin\ndrwxr-xr-x  2 appuser appsvc 4096 Jan 20 11:00 config';
            }
            if (input.includes('/opt/app')) {
                return 'total 16\ndrwxr-x---  4 root root 4096 Jan 20 14:00 .\ndrwxr-xr-x 17 root root 4096 Jan 20 09:00 ..\ndrwxr-x---  2 root root 4096 Jan 20 14:00 bin\ndrwxr-x---  2 root root 4096 Jan 20 14:00 config';
            }
            if (input.includes('/data/project')) {
                return 'total 12\ndrwxr-xr-x  3 developer devteam 4096 Jan 20 14:00 .\ndrwxr-xr-x 17 root      root    4096 Jan 20 09:00 ..\ndrwxr-xr-x  2 developer devteam 4096 Jan 20 14:00 src\n-rw-r--r--  1 developer devteam 2048 Jan 20 14:00 README.md';
            }
            if (input.includes('/opt/data')) {
                return 'total 12\ndrwxr-x---+ 2 alice  sysops 4096 Jan 20 12:00 .\ndrwxr-xr-x 17 root   root   4096 Jan 20 09:00 ..\n-rw-r-----  1 alice  sysops 4096 Jan 20 10:00 report.txt';
            }
            if (input.includes('/var/logs')) {
                return 'total 12\ndrwxr-xr-x  2 root loggroup 4096 Jan 20 11:30 .\ndrwxr-xr-x 17 root root     4096 Jan 20 09:00 ..\n-rw-r-----  1 root loggroup 4096 Jan 20 11:30 app.log';
            }
        }

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
            const state = fsState['/opt/data'] || { mode: '0750', owner: 'alice', group: 'sysops', acls: 'user:bob:rw-' };
            return typeof generateLsOutput === 'function'
                ? generateLsOutput('/opt/data', state, true)
                : 'drwxr-x---+ 2 alice sysops 4096 Jan 20 12:00 /opt/data';
        }
        if (hasFlags(input, 'ld') && input.includes('/var/logs')) {
            const state = fsState['/var/logs'] || { mode: '0755', owner: 'root', group: 'loggroup' };
            return typeof generateLsOutput === 'function'
                ? generateLsOutput('/var/logs', state, true)
                : 'drwxr-xr-x 2 root loggroup 4096 Jan 20 11:30 /var/logs';
        }
        // Set 6 paths (missing entries)
        if (hasFlags(input, 'ld') && input.includes('/shared/docs')) {
            const state = fsState['/shared/docs'] || { mode: '0755', owner: 'root', group: 'root', acls: 'default:group:editors:rw-' };
            return typeof generateLsOutput === 'function'
                ? generateLsOutput('/shared/docs', state, true)
                : 'drwxr-xr-x+ 2 root root 4096 Jan 20 13:00 /shared/docs';
        }
        if (hasFlags(input, 'ld') && input.includes('/opt/app')) {
            const state = fsState['/opt/app'] || { mode: '0750', owner: 'root', group: 'root' };
            return typeof generateLsOutput === 'function'
                ? generateLsOutput('/opt/app', state, true)
                : 'drwxr-x--- 4 root root 4096 Jan 20 14:00 /opt/app';
        }
    }
    
    // Handle stat commands with dynamic state
    if (command === 'stat') {
        // Extract path from command
        const pathMatch = input.match(/\/[^\s]+/);
        const path = pathMatch ? pathMatch[0] : null;
        
        if (path && fsState[path] && typeof generateStatOutput === 'function') {
            return generateStatOutput(path, fsState[path], true);
        }
        
        // Fallback to static output
        if (input.includes('/opt/webapp')) {
            const state = fsState['/opt/webapp'] || { mode: '0755', owner: 'webuser', group: 'developers' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/opt/webapp', state, true)
                : '  File: /opt/webapp\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 12345      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: ( 1001/webuser)   Gid: ( 2001/developers)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/etc/appconfig')) {
            const state1 = fsState['/etc/appconfig'] || { mode: '0640', owner: 'root', group: 'appgroup' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/etc/appconfig', state1, false)
                : '  File: /etc/appconfig\n  Size: 2048      \tBlocks: 4          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 23456      Links: 1\nAccess: (0640/-rw-r-----)  Uid: (    0/    root)   Gid: ( 3001/appgroup)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/shared/projects')) {
            const state2 = fsState['/shared/projects'] || { mode: '2755', owner: 'root', group: 'developers' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/shared/projects', state2, true)
                : '  File: /shared/projects\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 34567      Links: 2\nAccess: (2755/drwxr-sr-x)  Uid: (    0/    root)   Gid: ( 2001/developers)\nAccess: 2026-01-20 09:30:00.000000000 -0500\nModify: 2026-01-20 09:30:00.000000000 -0500\nChange: 2026-01-20 09:30:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/tmp/shared')) {
            const state3 = fsState['/tmp/shared'] || { mode: '1777', owner: 'root', group: 'root' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/tmp/shared', state3, true)
                : '  File: /tmp/shared\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (1777/drwxrwxrwt)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 15:00:00.000000000 -0500\nModify: 2026-01-20 15:00:00.000000000 -0500\nChange: 2026-01-20 15:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/data/reports')) {
            const state4 = fsState['/data/reports'] || { mode: '0755', owner: 'root', group: 'managers' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/data/reports', state4, true)
                : '  File: /data/reports\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 54321      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: ( 3000/ managers)\nAccess: 2026-01-20 14:00:00.000000000 -0500\nModify: 2026-01-20 14:00:00.000000000 -0500\nChange: 2026-01-20 14:00:00.000000000 -0500\n Birth: -';
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
            const state5 = fsState['/opt/data'] || { mode: '0750', owner: 'alice', group: 'sysops', acls: 'user:bob:rw-' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/opt/data', state5, true)
                : '  File: /opt/data\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0750/drwxr-x---)  Uid: ( 5001/   alice)   Gid: ( 6000/  sysops)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/var/logs')) {
            const state6 = fsState['/var/logs'] || { mode: '0755', owner: 'root', group: 'loggroup' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/var/logs', state6, true)
                : '  File: /var/logs\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: ( 5000/loggroup)\nAccess: 2026-01-20 11:30:00.000000000 -0500\nModify: 2026-01-20 11:30:00.000000000 -0500\nChange: 2026-01-20 11:30:00.000000000 -0500\n Birth: -';
        }
        // Additional paths (missing stat entries)
        if (input.includes('/var/backup')) {
            const state7 = fsState['/var/backup'] || { mode: '0755', owner: 'root', group: 'backup' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/var/backup', state7, true)
                : '  File: /var/backup\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 11111      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: ( 4000/  backup)\nAccess: 2026-01-20 11:30:00.000000000 -0500\nModify: 2026-01-20 11:30:00.000000000 -0500\nChange: 2026-01-20 11:30:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/shared/docs')) {
            const state8 = fsState['/shared/docs'] || { mode: '0755', owner: 'root', group: 'root', acls: 'default:group:editors:rw-' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/shared/docs', state8, true)
                : '  File: /shared/docs\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 22222      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 13:00:00.000000000 -0500\nModify: 2026-01-20 13:00:00.000000000 -0500\nChange: 2026-01-20 13:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/test/file')) {
            return '  File: /test/file\n  Size: 512       \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 33333      Links: 1\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 12:30:00.000000000 -0500\nModify: 2026-01-20 12:30:00.000000000 -0500\nChange: 2026-01-20 12:30:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/opt/myapp')) {
            return '  File: /opt/myapp\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 44444      Links: 4\nAccess: (0755/drwxr-xr-x)  Uid: ( 1100/ appuser)   Gid: ( 1100/  appsvc)\nAccess: 2026-01-20 11:00:00.000000000 -0500\nModify: 2026-01-20 11:00:00.000000000 -0500\nChange: 2026-01-20 11:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/srv/files')) {
            return '  File: /srv/files\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 55555      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/opt/app')) {
            const state9 = fsState['/opt/app'] || { mode: '0750', owner: 'root', group: 'root' };
            return typeof generateStatOutput === 'function'
                ? generateStatOutput('/opt/app', state9, true)
                : '  File: /opt/app\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 66666      Links: 4\nAccess: (0750/drwxr-x---)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 14:00:00.000000000 -0500\nModify: 2026-01-20 14:00:00.000000000 -0500\nChange: 2026-01-20 14:00:00.000000000 -0500\n Birth: -';
        }
        if (input.includes('/data/project')) {
            return '  File: /data/project\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 77777      Links: 3\nAccess: (0755/drwxr-xr-x)  Uid: ( 1400/developer)   Gid: ( 2100/ devteam)\nAccess: 2026-01-20 14:00:00.000000000 -0500\nModify: 2026-01-20 14:00:00.000000000 -0500\nChange: 2026-01-20 14:00:00.000000000 -0500\n Birth: -';
        }
    }
    
    // Handle getfacl commands with dynamic state
    if (command === 'getfacl') {
        const pathMatch = input.match(/\/[^\s]+/);
        const path = pathMatch ? pathMatch[0] : null;
        
        if (path && fsState[path] && typeof generateGetfaclOutput === 'function') {
            return generateGetfaclOutput(path, fsState[path]);
        }
        
        // Fallback to static output with state-aware generation
        if (input.includes('/opt/webapp')) {
            const state = fsState['/opt/webapp'] || { mode: '0755', owner: 'webuser', group: 'developers', acls: 'user:sarah:rwx' };
            return typeof generateGetfaclOutput === 'function'
                ? generateGetfaclOutput('/opt/webapp', state)
                : '# file: /opt/webapp\n# owner: webuser\n# group: developers\nuser::rwx\nuser:sarah:rwx\ngroup::r-x\nmask::rwx\nother::r-x';
        }
        if (input.includes('/data/reports')) {
            const state = fsState['/data/reports'] || { mode: '0755', owner: 'root', group: 'managers', acls: 'group:managers:rw-' };
            return typeof generateGetfaclOutput === 'function'
                ? generateGetfaclOutput('/data/reports', state)
                : '# file: /data/reports\n# owner: root\n# group: managers\nuser::rwx\ngroup::r-x\ngroup:managers:rw-\nmask::rwx\nother::r-x';
        }
        if (input.includes('/shared/docs')) {
            const state = fsState['/shared/docs'] || { mode: '0755', owner: 'root', group: 'root', acls: 'default:group:editors:rw-' };
            return typeof generateGetfaclOutput === 'function'
                ? generateGetfaclOutput('/shared/docs', state)
                : '# file: /shared/docs\n# owner: root\n# group: root\nuser::rwx\ngroup::r-x\nother::r-x\ndefault:user::rwx\ndefault:group::r-x\ndefault:group:editors:rw-\ndefault:mask::rwx\ndefault:other::r-x';
        }
        if (input.includes('/test/file')) {
            const state = fsState['/test/file'] || { mode: '0644', owner: 'root', group: 'root' };
            return typeof generateGetfaclOutput === 'function'
                ? generateGetfaclOutput('/test/file', state)
                : '# file: /test/file\n# owner: root\n# group: root\nuser::rw-\ngroup::r--\nother::r--';
        }
        // Original path
        if (input.includes('/opt/data')) {
            const state = fsState['/opt/data'] || { mode: '0750', owner: 'alice', group: 'sysops', acls: 'user:bob:rw-' };
            return typeof generateGetfaclOutput === 'function'
                ? generateGetfaclOutput('/opt/data', state)
                : '# file: /opt/data\n# owner: alice\n# group: sysops\nuser::rwx\nuser:bob:rw-\ngroup::r-x\nmask::rwx\nother::---';
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
            if (input.includes('-exec') && input.includes('chmod')) {
                return ''; // chmod produces no output
            }
            if (input.includes('-ls')) {
                return '     -rw-r--r--   1 root     root         1024 Jan 20 10:00 /srv/files/script.sh\n     -rw-r--r--   1 root     root          512 Jan 20 10:00 /srv/files/data.txt\n     -rw-r--r--   1 root     root          256 Jan 20 10:00 /srv/files/subdir/notes.txt';
            }
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
function generateSection3PreCheck(task, command, input, tokens) {
    // Set1: /opt/webapp - before chmod/chown (shows restrictive/wrong state)
    if (input.includes('/opt/webapp')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxr-x--- 2 root root 4096 Jan 20 12:00 /opt/webapp';
        }
        if (command === 'stat') {
            return '  File: /opt/webapp\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 12345      Links: 2\nAccess: (0750/drwxr-x---)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 12:00:00.000000000 -0500\nModify: 2026-01-20 12:00:00.000000000 -0500\nChange: 2026-01-20 12:00:00.000000000 -0500\n Birth: -';
        }
        if (command === 'getfacl') {
            return '# file: opt/webapp\n# owner: root\n# group: root\nuser::rwx\ngroup::r-x\nother::---';
        }
    }

    // Set1: /var/backup - before chgrp backup
    if (input.includes('/var/backup')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 11:30 /var/backup';
        }
        if (command === 'stat') {
            return '  File: /var/backup\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 23456      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:30:00.000000000 -0500\nModify: 2026-01-20 11:30:00.000000000 -0500\nChange: 2026-01-20 11:30:00.000000000 -0500\n Birth: -';
        }
    }

    // Set2: /etc/appconfig - before chmod 640
    if (input.includes('/etc/appconfig')) {
        if (command === 'ls' && hasFlags(input, 'l')) {
            return '-rw-r--r-- 1 root root 512 Jan 20 10:00 /etc/appconfig';
        }
        if (command === 'stat') {
            return '  File: /etc/appconfig\n  Size: 512       \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 34567      Links: 1\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set2: /shared/projects - before setgid (no 's' in group execute)
    if (input.includes('/shared/projects')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 11:00 /shared/projects';
        }
        if (command === 'stat') {
            return '  File: /shared/projects\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 45678      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:00:00.000000000 -0500\nModify: 2026-01-20 11:00:00.000000000 -0500\nChange: 2026-01-20 11:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set2: /data/reports - before group ACL
    if (input.includes('/data/reports')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 11:00 /data/reports';
        }
        if (command === 'stat') {
            return '  File: /data/reports\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 56789      Links: 2\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:00:00.000000000 -0500\nModify: 2026-01-20 11:00:00.000000000 -0500\nChange: 2026-01-20 11:00:00.000000000 -0500\n Birth: -';
        }
        if (command === 'getfacl') {
            return '# file: data/reports\n# owner: root\n# group: root\nuser::rwx\ngroup::r-x\nother::r-x';
        }
    }

    // Set2: /tmp/shared - before sticky bit (shows 777, no 't')
    if (input.includes('/tmp/shared')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxrwxrwx 2 root root 4096 Jan 20 11:00 /tmp/shared';
        }
        if (command === 'stat') {
            return '  File: /tmp/shared\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 67890      Links: 2\nAccess: (0777/drwxrwxrwx)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 11:00:00.000000000 -0500\nModify: 2026-01-20 11:00:00.000000000 -0500\nChange: 2026-01-20 11:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set3: /srv/files - before chmod 644 on files (files have wrong perms)
    if (input.includes('/srv/files')) {
        if (command === 'ls') {
            return '/srv/files:\ntotal 12\ndrwxr-xr-x 2 root root 4096 Jan 20 10:00 subdir\n-rwxrwxrwx 1 root root 1024 Jan 20 10:00 script.sh\n-rwxrwxrwx 1 root root  512 Jan 20 10:00 data.txt\n\n/srv/files/subdir:\ntotal 4\n-rwxrwxrwx 1 root root 256 Jan 20 10:00 notes.txt';
        }
        if (command === 'find' && !input.includes('-exec')) {
            return '/srv/files/script.sh\n/srv/files/data.txt\n/srv/files/subdir/notes.txt';
        }
    }

    // Set3: /opt/myapp - before recursive chown appuser:appsvc
    if (input.includes('/opt/myapp')) {
        if (command === 'ls' && hasFlags(input, 'ld')) {
            return 'drwxr-xr-x 3 root root 4096 Jan 20 10:00 /opt/myapp';
        }
        if (command === 'ls' && hasFlags(input, 'lR')) {
            return '/opt/myapp:\ntotal 8\ndrwxr-xr-x 2 root root 4096 Jan 20 10:00 config\n-rw-r--r-- 1 root root  512 Jan 20 10:00 app.conf\n\n/opt/myapp/config:\ntotal 4\n-rw-r--r-- 1 root root 256 Jan 20 10:00 settings.json';
        }
        if (command === 'stat') {
            return '  File: /opt/myapp\n  Size: 4096      \tBlocks: 8          IO Block: 4096   directory\nDevice: fd00h/64768d\tInode: 78901      Links: 3\nAccess: (0755/drwxr-xr-x)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 10:00:00.000000000 -0500\nModify: 2026-01-20 10:00:00.000000000 -0500\nChange: 2026-01-20 10:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set3: /shared/docs - before default ACL for editors group
    if (input.includes('/shared/docs')) {
        if (command === 'ls' && (hasFlags(input, 'ld') || hasFlags(input, 'l'))) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 13:00 /shared/docs';
        }
        if (command === 'getfacl') {
            return '# file: shared/docs\n# owner: root\n# group: root\nuser::rwx\ngroup::r-x\nother::r-x';
        }
    }

    // Set3: /test/file - before ACL removal (shows '+' indicating ACLs exist)
    if (input.includes('/test/file')) {
        if (command === 'ls' && hasFlags(input, 'l')) {
            return '-rw-r--r--+ 1 root root 1024 Jan 20 12:00 /test/file';
        }
        if (command === 'getfacl') {
            return '# file: test/file\n# owner: root\n# group: root\nuser::rw-\nuser:alice:rw-\ngroup::r--\nmask::rw-\nother::r--';
        }
    }

    // Set6: /opt/app dirs - before chmod 750 (show mix of permissions)
    if (input.includes('/opt/app') && !input.includes('/opt/webapp') && !input.includes('/opt/myapp')) {
        if (command === 'find') {
            return '/opt/app\n/opt/app/bin\n/opt/app/lib\n/opt/app/conf';
        }
    }

    // Set6: /data/project - before recursive chown developer:devteam
    if (input.includes('/data/project')) {
        if (command === 'ls' && hasFlags(input, 'lR')) {
            return '/data/project:\ntotal 8\ndrwxr-xr-x 2 root root 4096 Jan 20 09:00 src\n-rw-r--r-- 1 root root  512 Jan 20 09:00 README.md\n\n/data/project/src:\ntotal 4\n-rw-r--r-- 1 root root 2048 Jan 20 09:00 main.c';
        }
    }

    // Set4: /opt/data/report.txt - before hard link (link count 1)
    if (input.includes('/opt/data/report.txt')) {
        if (command === 'ls' && hasFlags(input, 'li')) {
            return '131073 -rw-r--r-- 1 root root 2048 Jan 20 14:00 /opt/data/report.txt';
        }
        if (command === 'stat') {
            return '  File: /opt/data/report.txt\n  Size: 2048      \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 131073     Links: 1\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 14:00:00.000000000 -0500\nModify: 2026-01-20 14:00:00.000000000 -0500\nChange: 2026-01-20 14:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set4: /tmp/report-link - before creation (does not exist)
    if (input.includes('/tmp/report-link')) {
        if (command === 'ls') {
            return "ls: cannot access '/tmp/report-link': No such file or directory";
        }
    }

    // Set4: /home/user/docs symlink - before creation
    if (input.includes('/home/user/docs')) {
        if (command === 'ls') {
            return "ls: cannot access '/home/user/docs': No such file or directory";
        }
        if (command === 'readlink') {
            return "readlink: /home/user/docs: No such file or directory";
        }
    }

    // Set4: /etc/app/config.conf - before hard link (link count 1)
    if (input.includes('/etc/app/config.conf')) {
        if (command === 'ls' && hasFlags(input, 'li')) {
            return '262144 -rw-r--r-- 1 root root 1024 Jan 20 15:00 /etc/app/config.conf';
        }
        if (command === 'stat') {
            return '  File: /etc/app/config.conf\n  Size: 1024      \tBlocks: 8          IO Block: 4096   regular file\nDevice: fd00h/64768d\tInode: 262144     Links: 1\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-01-20 15:00:00.000000000 -0500\nModify: 2026-01-20 15:00:00.000000000 -0500\nChange: 2026-01-20 15:00:00.000000000 -0500\n Birth: -';
        }
    }

    // Set4: /backup/config.conf - before hard link creation
    if (input.includes('/backup/config.conf')) {
        if (command === 'ls' && hasFlags(input, 'li')) {
            return "ls: cannot access '/backup/config.conf': No such file or directory";
        }
    }

    // Set4: /usr/local/bin/python - before symlink creation
    if (input.includes('/usr/local/bin/python')) {
        if (command === 'ls') {
            return "ls: cannot access '/usr/local/bin/python': No such file or directory";
        }
        if (command === 'readlink') {
            return "readlink: /usr/local/bin/python: No such file or directory";
        }
    }

    // Set5: /tmp/umask-test.txt - before creation
    if (input.includes('/tmp/umask-test.txt')) {
        if (command === 'ls') {
            return "ls: cannot access '/tmp/umask-test.txt': No such file or directory";
        }
    }

    // Set6: /tmp/olduser-files.txt and /tmp/wrong-owner.txt
    if (input.includes('/tmp/olduser-files.txt')) {
        if (command === 'cat' || command === 'less') {
            return "cat: /tmp/olduser-files.txt: No such file or directory";
        }
        if (command === 'ls') {
            return "ls: cannot access '/tmp/olduser-files.txt': No such file or directory";
        }
    }

    if (input.includes('/tmp/wrong-owner.txt')) {
        if (command === 'cat' || command === 'less') {
            return "cat: /tmp/wrong-owner.txt: No such file or directory";
        }
    }

    return null;
}

/**
 * Section 3 Pre-Check Output (BEFORE state)
 */
