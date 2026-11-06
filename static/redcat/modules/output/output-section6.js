/** Red Cat - Section 6 */

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
