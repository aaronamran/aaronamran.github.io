/** Red Cat - Section 7: Remote Resources */

function generateSection7Output(command, input, tokens) {
    // Task 1: Show NFS exports (server varies by set)
    if (command === 'showmount' && (input.includes('-e') || input.includes('--exports'))) {
        if (input.includes('192.168.10.50')) {
            return 'Export list for 192.168.10.50:\n/data          192.168.10.0/24\n/backup        *';
        }
        if (input.includes('10.0.5.100')) {
            return 'Export list for 10.0.5.100:\n/exports/shared   10.0.5.0/24\n/exports/data     *';
        }
        if (input.includes('nfs.example.com')) {
            return 'Export list for nfs.example.com:\n/backup        192.168.0.0/16\n/logs          *';
        }
        return 'Export list for 192.168.1.100:\n/exports/data  192.168.1.0/24\n/exports/share *';
    }
    
    // ls -ld for NFS mount points
    if (command === 'ls' && hasFlags(input, 'ld')) {
        if (input.includes('/mnt/nfsdata')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 10:00 /mnt/nfsdata';
        }
        if (input.includes('/mnt/shared')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 11:00 /mnt/shared';
        }
        if (input.includes('/mnt/backups')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 12:00 /mnt/backups';
        }
        if (input.includes('/mnt/logs')) {
            return 'drwxr-xr-x 2 root root 4096 Jan 20 13:00 /mnt/logs';
        }
    }
    
    // mount | grep for specific NFS mount points
    if (command === 'mount') {
        if (input.includes('/mnt/nfsdata')) {
            return '192.168.10.50:/data on /mnt/nfsdata type nfs4 (rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,hard,proto=tcp,timeo=600,retrans=2,sec=sys)';
        }
        if (input.includes('/mnt/shared') && !input.includes('remount')) {
            if (input.includes('ro') || (input.includes('grep') && !input.includes('remount'))) {
                return '10.0.5.100:/exports/shared on /mnt/shared type nfs4 (ro,relatime,vers=4.2,rsize=1048576,wsize=1048576,hard,proto=tcp,timeo=600,retrans=2,sec=sys)';
            }
            return '10.0.5.100:/exports/shared on /mnt/shared type nfs4 (rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,hard,proto=tcp,timeo=600,retrans=2,sec=sys)';
        }
        if (input.includes('/mnt/backups')) {
            return 'nfs.example.com:/backup on /mnt/backups type nfs4 (rw,relatime,soft,vers=4.2,rsize=1048576,wsize=1048576,proto=tcp,timeo=600,retrans=2,sec=sys)';
        }
        if (input.includes('/mnt/logs')) {
            return 'nfs.example.com:/logs on /mnt/logs type nfs4 (rw,relatime,nfsvers=4,rsize=1048576,wsize=1048576,hard,proto=tcp,timeo=600,retrans=2,sec=sys)';
        }
        if (input.includes('/mnt/nfs') && !input.includes('/mnt/nfsdata')) {
            return '192.168.1.100:/exports/data on /mnt/nfs type nfs4 (rw,relatime,vers=4.2,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.1.50,local_lock=none,addr=192.168.1.100)';
        }
    }
    
    // df for NFS mount points
    if (command === 'df') {
        if (input.includes('/mnt/nfsdata')) {
            return 'Filesystem               1K-blocks     Used Available Use% Mounted on\n192.168.10.50:/data    52428800  10485760  41943040  20% /mnt/nfsdata';
        }
        if (input.includes('/mnt/backups')) {
            return 'Filesystem                      1K-blocks     Used Available Use% Mounted on\nnfs.example.com:/backup       52428800  20971520  31457280  40% /mnt/backups';
        }
        if (input.includes('/mnt/nfs') && !input.includes('/mnt/nfsdata')) {
            return 'Filesystem                       1K-blocks      Used Available Use% Mounted on\n192.168.1.100:/exports/data    52428800  10485760  41943040  20% /mnt/nfs';
        }
    }
    
    // findmnt for NFS mount points
    if (command === 'findmnt') {
        if (input.includes('/mnt/nfsdata')) {
            return 'TARGET        SOURCE               FSTYPE OPTIONS\n/mnt/nfsdata  192.168.10.50:/data   nfs4   rw,relatime,vers=4.2,rsize=1048576,wsize=1048576';
        }
        if (input.includes('/mnt/shared')) {
            return 'TARGET       SOURCE                        FSTYPE OPTIONS\n/mnt/shared  10.0.5.100:/exports/shared   nfs4   rw,relatime,vers=4.2,rsize=1048576';
        }
        if (input.includes('/mnt/backups')) {
            return 'TARGET        SOURCE                    FSTYPE OPTIONS\n/mnt/backups  nfs.example.com:/backup   nfs4   rw,relatime,soft,vers=4.2,rsize=1048576';
        }
        if (input.includes('/mnt/logs')) {
            return 'TARGET     SOURCE                   FSTYPE OPTIONS\n/mnt/logs  nfs.example.com:/logs   nfs4   rw,relatime,nfsvers=4,rsize=1048576';
        }
        if (input.includes('-t') && input.includes('nfs')) {
            return 'TARGET        SOURCE                        FSTYPE OPTIONS\n/mnt/nfsdata  192.168.10.50:/data          nfs4   rw,relatime,vers=4.2\n/mnt/shared   10.0.5.100:/exports/shared   nfs4   ro,relatime,vers=4.2';
        }
        if (input.includes('/mnt/nfs') && !input.includes('/mnt/nfsdata')) {
            return 'TARGET    SOURCE                          FSTYPE OPTIONS\n/mnt/nfs  192.168.1.100:/exports/data     nfs4   rw,relatime,vers=4.2,rsize=1048576,wsize=1048576';
        }
    }
    
    // grep /etc/fstab for NFS entries
    if (command === 'grep' && input.includes('/etc/fstab')) {
        if (input.includes('/mnt/shared')) {
            return '10.0.5.100:/exports/shared /mnt/shared nfs nosuid,noexec 0 0';
        }
        if (input.includes('/mnt/nfsdata')) {
            return '192.168.10.50:/data /mnt/nfsdata nfs defaults 0 0';
        }
    }
    
    // Legacy /mnt/nfs handlers (for older set compatibility)
    if (command === 'df' && input.includes('/mnt/nfs') && !input.includes('/mnt/nfsdata')) {
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

/** Section 7 End */
function generateSection7PreCheck(task, command, input, tokens) {
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

// Version check for debugging
console.log('âœ… Output module loaded - syntax error fixed (2024-04-06)');
