/**
 * Section 6: File Systems
 * 3 unique question sets for practice variety
 */

const section6Data = {
    id: 6,
    title: "File Systems",
    description: "Create, mount, and manage file systems including swap",
    totalPoints: 28,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Create an ext4 file system on /dev/sdb1",
                expected: [
                    { command: "mkfs.ext4", requiredValues: ["/dev/sdb1"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["ext4", "/dev/sdb1"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk" },
                    { command: "blkid", requiredValues: ["/dev/sdb1"] }
                ],
                explanation: "mkfs.ext4 formats devices with ext4 filesystem, the RHEL default.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the ext4 filesystem on /dev/sdb1",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdb1"] },
                    { command: "lsblk", requiredFlags: ["-f"] },
                    { command: "file", requiredFlags: ["-s"], requiredValues: ["/dev/sdb1"] }
                ],
                explanation: "blkid displays block device attributes including filesystem type.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create directory /mnt/data and mount /dev/sdb1 there",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/data"] },
                    { command: "mount", requiredValues: ["/dev/sdb1", "/mnt/data"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/data"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "mkdir creates mount points, mount attaches filesystems.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify /dev/sdb1 is mounted at /mnt/data",
                expected: [
                    { command: "df", requiredFlags: ["-h"] },
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/data"] },
                    { command: "findmnt", requiredValues: ["/mnt/data"] }
                ],
                explanation: "df, mount, or findmnt show currently mounted filesystems.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Add /dev/sdb1 to /etc/fstab to mount at /mnt/data with defaults, using UUID",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdb1"] },
                    { command: "echo", requiredValues: ["UUID=", "/mnt/data", "ext4", "defaults", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "tail", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "/etc/fstab defines persistent mounts. Always use UUID for reliability.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify fstab entry is correct by testing it",
                expected: [
                    { command: "mount", requiredFlags: ["-a"] },
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/data"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "mount -a mounts all fstab entries, testing configuration validity.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create a 512MB swap partition on /dev/sdc1",
                expected: [
                    { command: "mkswap", requiredValues: ["/dev/sdc1"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk" },
                    { command: "blkid", requiredValues: ["/dev/sdc1"] }
                ],
                explanation: "mkswap formats partitions for use as swap space.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Enable the swap partition /dev/sdc1",
                expected: [
                    { command: "swapon", requiredValues: ["/dev/sdc1"] }
                ],
                allowedPreChecks: [
                    { command: "swapon", requiredFlags: ["--show"] },
                    { command: "free", requiredFlags: ["-h"] }
                ],
                explanation: "swapon activates swap devices for immediate use.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify swap is active",
                expected: [
                    { command: "swapon", requiredFlags: ["--show"] },
                    { command: "free", requiredFlags: ["-h"] },
                    { command: "cat", requiredValues: ["/proc/swaps"] }
                ],
                explanation: "swapon --show and free display active swap devices.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Add swap entry to /etc/fstab for persistence using UUID",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdc1"] },
                    { command: "echo", requiredValues: ["UUID=", "swap", "swap", "defaults", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "tail", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "Swap entry in fstab: UUID=xxx swap swap defaults 0 0",
                points: 4
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Create an xfs file system on /dev/sdd1",
                expected: [
                    { command: "mkfs.xfs", requiredValues: ["/dev/sdd1"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["xfs", "/dev/sdd1"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk" },
                    { command: "blkid", requiredValues: ["/dev/sdd1"] }
                ],
                explanation: "mkfs.xfs creates XFS filesystems, common for large files.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the xfs filesystem on /dev/sdd1",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdd1"] },
                    { command: "lsblk", requiredFlags: ["-f"] },
                    { command: "xfs_info", requiredValues: ["/dev/sdd1"] }
                ],
                explanation: "blkid shows filesystem type, xfs_info displays XFS details.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create directory /mnt/storage and mount /dev/sdd1 there with noatime option",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/storage"] },
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["noatime", "/dev/sdd1", "/mnt/storage"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/storage"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "noatime improves performance by not updating access times.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify /dev/sdd1 is mounted with noatime option",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/storage"] },
                    { command: "findmnt", requiredValues: ["/mnt/storage"] }
                ],
                explanation: "Check mount output shows noatime in options.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Add /dev/sdd1 to /etc/fstab to mount at /mnt/storage with noatime, use UUID",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdd1"] },
                    { command: "echo", requiredValues: ["UUID=", "/mnt/storage", "xfs", "noatime", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "grep", requiredValues: ["/mnt/storage", "/etc/fstab"] }
                ],
                explanation: "Custom mount options are specified in the 4th fstab field.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Test fstab by unmounting and remounting all",
                expected: [
                    { command: "umount", requiredValues: ["/mnt/storage"] },
                    { command: "mount", requiredFlags: ["-a"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "umount then mount -a tests fstab persistence.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create a 1GB swap file at /swapfile",
                expected: [
                    { command: "dd", requiredValues: ["if=/dev/zero", "of=/swapfile", "bs=1M", "count=1024"] },
                    { command: "fallocate", requiredFlags: ["-l"], requiredValues: ["1G", "/swapfile"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["/swapfile"] }
                ],
                explanation: "dd or fallocate creates swap files. fallocate is faster.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Set permissions to 600 on /swapfile, format it as swap, and enable it",
                expected: [
                    { command: "chmod", requiredValues: ["600", "/swapfile"] },
                    { command: "mkswap", requiredValues: ["/swapfile"] },
                    { command: "swapon", requiredValues: ["/swapfile"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/swapfile"] },
                    { command: "swapon", requiredFlags: ["--show"] }
                ],
                explanation: "Swap files must be 600 for security. Format with mkswap, activate with swapon.",
                points: 4
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify /swapfile is active as swap",
                expected: [
                    { command: "swapon", requiredFlags: ["--show"] },
                    { command: "free", requiredFlags: ["-h"] }
                ],
                explanation: "Confirm swapfile appears in swap list.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Add /swapfile to /etc/fstab for persistence",
                expected: [
                    { command: "echo", requiredValues: ["/swapfile", "swap", "swap", "defaults", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "grep", requiredValues: ["swapfile", "/etc/fstab"] }
                ],
                explanation: "Swapfile fstab entry: /swapfile swap swap defaults 0 0",
                points: 3
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a vfat filesystem on /dev/sde1",
                expected: [
                    { command: "mkfs.vfat", requiredValues: ["/dev/sde1"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["vfat", "/dev/sde1"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk" },
                    { command: "blkid", requiredValues: ["/dev/sde1"] }
                ],
                explanation: "mkfs.vfat creates FAT32 filesystems, used for USB drives and compatibility.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the vfat filesystem on /dev/sde1",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sde1"] },
                    { command: "lsblk", requiredFlags: ["-f"] }
                ],
                explanation: "Filesystem type should show vfat or FAT32.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create /media/usb and mount /dev/sde1 there read-only",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/media/usb"] },
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["ro", "/dev/sde1", "/media/usb"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/media/usb"] },
                    { command: "mount", requiredValues: ["|", "grep", "/media/usb"] }
                ],
                explanation: "ro option mounts filesystem in read-only mode for data protection.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify /dev/sde1 is mounted read-only",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/media/usb"] },
                    { command: "findmnt", requiredValues: ["/media/usb"] }
                ],
                explanation: "Mount options should include 'ro' for read-only.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Remount /media/usb as read-write without unmounting",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rw", "/media/usb"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/media/usb"] }
                ],
                explanation: "remount changes mount options without unmounting.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify /media/usb is now mounted read-write",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/media/usb"] },
                    { command: "findmnt", requiredValues: ["/media/usb"] }
                ],
                explanation: "Mount options should now show 'rw' instead of 'ro'.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Check and repair filesystem on /dev/sdf1 (unmounted)",
                expected: [
                    { command: "fsck", requiredValues: ["/dev/sdf1"] },
                    { command: "e2fsck", requiredFlags: ["-f"], requiredValues: ["/dev/sdf1"] },
                    { command: "fsck.ext4", requiredValues: ["/dev/sdf1"] }
                ],
                allowedPreChecks: [
                    { command: "umount", requiredValues: ["/dev/sdf1"] },
                    { command: "lsblk" }
                ],
                explanation: "fsck checks and repairs filesystems. Must be unmounted first.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Display disk space usage for all mounted filesystems in human-readable format",
                expected: [
                    { command: "df", requiredFlags: ["-h"] },
                    { command: "df", requiredFlags: ["-hT"] }
                ],
                allowedPreChecks: [],
                explanation: "df -h shows disk free space. -T adds filesystem type.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Display inode usage for all filesystems",
                expected: [
                    { command: "df", requiredFlags: ["-i"] },
                    { command: "df", requiredFlags: ["-ih"] }
                ],
                explanation: "df -i shows inode usage instead of block usage.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Set a label 'BACKUP' on the ext4 filesystem /dev/sdb1",
                expected: [
                    { command: "e2label", requiredValues: ["/dev/sdb1", "BACKUP"] },
                    { command: "tune2fs", requiredFlags: ["-L"], requiredValues: ["BACKUP", "/dev/sdb1"] }
                ],
                allowedPreChecks: [
                    { command: "e2label", requiredValues: ["/dev/sdb1"] },
                    { command: "blkid", requiredValues: ["/dev/sdb1"] }
                ],
                explanation: "e2label or tune2fs -L sets filesystem labels for easier identification.",
                points: 3
            }
        ],
        
        // Set 4: Logical Volumes (LV)
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Create 500MB logical volume named 'applv' in volume group 'datavg'.",
                expected: [
                    { command: "lvcreate", requiredFlags: ["-L", "500M"], requiredValues: ["-n", "applv", "datavg"] },
                    { command: "lvcreate", requiredFlags: ["-L", "500M", "-n"], requiredValues: ["applv", "datavg"] }
                ],
                allowedPreChecks: [
                    { command: "lvs", requiredValues: [] },
                    { command: "vgs", requiredValues: ["datavg"] }
                ],
                explanation: "lvcreate creates logical volumes. -L specifies size, -n specifies name.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display all logical volumes in the system.",
                expected: [
                    { command: "lvs", requiredValues: [] },
                    { command: "lvdisplay", requiredValues: [] },
                    { command: "lvscan", requiredValues: [] }
                ],
                explanation: "lvs shows summary, lvdisplay shows detailed info, lvscan discovers all LVs.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display detailed information about logical volume 'applv'.",
                expected: [
                    { command: "lvdisplay", requiredValues: ["/dev/datavg/applv"] },
                    { command: "lvdisplay", requiredValues: ["datavg/applv"] },
                    { command: "lvs", requiredValues: ["datavg/applv"] }
                ],
                explanation: "lvdisplay shows size, segments, status, device path, and usage.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create 2GB logical volume named 'dblv' using 100% of free space in 'appvg'.",
                expected: [
                    { command: "lvcreate", requiredFlags: ["-l", "100%FREE"], requiredValues: ["-n", "dblv", "appvg"] },
                    { command: "lvcreate", requiredFlags: ["-L", "2G", "-n"], requiredValues: ["dblv", "appvg"] }
                ],
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["appvg"] }
                ],
                explanation: "-l 100%FREE uses all available space. -L specifies exact size.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "List all LVs showing size and VG name.",
                expected: [
                    { command: "lvs", requiredValues: [] },
                    { command: "lvdisplay", requiredValues: [] }
                ],
                explanation: "lvs output shows LV name, VG name, Attr, LSize, Pool, Origin, Data%, etc.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create XFS filesystem on logical volume /dev/datavg/applv.",
                expected: [
                    { command: "mkfs.xfs", requiredValues: ["/dev/datavg/applv"] },
                    { command: "mkfs", requiredFlags: ["-t", "xfs"], requiredValues: ["/dev/datavg/applv"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/datavg/applv"] },
                    { command: "lvs", requiredValues: [] }
                ],
                explanation: "Logical volumes must have filesystem before mounting.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify XFS filesystem was created on applv.",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/datavg/applv"] },
                    { command: "lsblk", requiredFlags: ["-f"], requiredValues: [] },
                    { command: "xfs_info", requiredValues: ["/dev/datavg/applv"] }
                ],
                explanation: "blkid shows filesystem type and UUID. lsblk -f shows filesystem column.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Remove logical volume /dev/appvg/dblv.",
                expected: [
                    { command: "lvremove", requiredValues: ["/dev/appvg/dblv"] },
                    { command: "lvremove", requiredValues: ["appvg/dblv"] }
                ],
                allowedPreChecks: [
                    { command: "lvs", requiredValues: [] }
                ],
                explanation: "lvremove deletes logical volume. Must be unmounted first.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify dblv was removed.",
                expected: [
                    { command: "lvs", requiredValues: [] },
                    { command: "lvdisplay", requiredValues: [] }
                ],
                explanation: "After lvremove, volume disappears from lvs output.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Rename logical volume 'applv' to 'weblv'.",
                expected: [
                    { command: "lv rename", requiredValues: ["/dev/datavg/applv", "/dev/datavg/weblv"] },
                    { command: "lvrename", requiredValues: ["datavg/applv", "weblv"] }
                ],
                allowedPreChecks: [
                    { command: "lvs", requiredValues: [] }
                ],
                explanation: "lvrename changes LV name. Update /etc/fstab if volume is mounted at boot.",
                points: 3
            }
        ],
        
        // Set 5: Extending Logical Volumes
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Display current size of logical volume /dev/datavg/weblv.",
                expected: [
                    { command: "lvs", requiredValues: ["datavg/weblv"] },
                    { command: "lvdisplay", requiredValues: ["/dev/datavg/weblv"] }
                ],
                explanation: "Check size before extending to verify the increase.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Extend logical volume weblv by adding 200MB.",
                expected: [
                    { command: "lvextend", requiredFlags: ["-L", "+200M"], requiredValues: ["/dev/datavg/weblv"] },
                    { command: "lvextend", requiredFlags: ["-L"], requiredValues: ["+200M", "datavg/weblv"] }
                ],
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["datavg"] },
                    { command: "lvs", requiredValues: ["datavg/weblv"] }
                ],
                explanation: "lvextend increases LV size. + means add to current size.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify weblv was extended successfully.",
                expected: [
                    { command: "lvs", requiredValues: ["datavg/weblv"] },
                    { command: "lvdisplay", requiredValues: ["/dev/datavg/weblv"] }
                ],
                explanation: "Size should now show 700M (500M + 200M).",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Resize XFS filesystem on /dev/datavg/weblv to use new space.",
                expected: [
                    { command: "xfs_growfs", requiredValues: ["/dev/datavg/weblv"] },
                    { command: "xfs_growfs", requiredValues: ["/mnt/web"] }
                ],
                allowedPreChecks: [
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/dev/datavg/weblv"] },
                    { command: "mount", requiredValues: ["|", "grep", "weblv"] }
                ],
                explanation: "xfs_growfs expands XFS filesystem. Must be mounted to resize.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify filesystem uses the new space.",
                expected: [
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/dev/datavg/weblv"] },
                    { command: "xfs_info", requiredValues: ["/dev/datavg/weblv"] }
                ],
                explanation: "df should show increased filesystem size after xfs_growfs.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create 1GB ext4 logical volume 'datalv' in prodvg and extend by 500MB.",
                expected: [
                    { command: "lvcreate", requiredFlags: ["-L", "1G", "-n"], requiredValues: ["datalv", "prodvg"] }
                ],
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["prodvg"] }
                ],
                explanation: "Create LV first, then extend it as separate operation.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Extend datalv by 500MB and resize ext4 filesystem in one command.",
                expected: [
                    { command: "lvextend", requiredFlags: ["-L", "+500M", "-r"], requiredValues: ["/dev/prodvg/datalv"] },
                    { command: "lvextend", requiredFlags: ["-L", "+500M", "--resizefs"], requiredValues: ["prodvg/datalv"] }
                ],
                allowedPreChecks: [
                    { command: "lvs", requiredValues: ["prodvg/datalv"] }
                ],
                explanation: "-r or --resizefs automatically resizes filesystem after extending LV.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify datalv is now 1.5GB and filesystem was resized.",
                expected: [
                    { command: "lvs", requiredValues: ["prodvg/datalv"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/dev/prodvg/datalv"] }
                ],
                explanation: "Both LV size and filesystem size should show 1.5GB.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Extend datalv to use 100% of free space in prodvg.",
                expected: [
                    { command: "lvextend", requiredFlags: ["-l", "+100%FREE", "-r"], requiredValues: ["/dev/prodvg/datalv"] }
                ],
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["prodvg"] }
                ],
                explanation: "-l +100%FREE uses all remaining space in VG. -r resizes filesystem.",
                points: 4
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify datalv now uses all available space in prodvg.",
                expected: [
                    { command: "vgs", requiredValues: ["prodvg"] },
                    { command: "lvs", requiredValues: ["prodvg/datalv"] }
                ],
                explanation: "VG should show minimal or zero free space. LV size matches VG size.",
                points: 2
            }
        ],
        
        // Set 6: autofs basics
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Check if autofs package is installed.",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["autofs"] },
                    { command: "dnf", requiredValues: ["list", "installed", "autofs"] },
                    { command: "yum", requiredValues: ["list", "installed", "autofs"] }
                ],
                explanation: "autofs automatically mounts filesystems on demand.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Install autofs package if not present.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "autofs", "-y"] },
                    { command: "yum", requiredValues: ["install", "autofs", "-y"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["autofs"] }
                ],
                explanation: "autofs package provides automatic mounting capabilities.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display autofs master configuration file.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] },
                    { command: "less", requiredValues: ["/etc/auto.master"] }
                ],
                explanation: "/etc/auto.master is main autofs configuration defining mount points.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Add entry to /etc/auto.master for /mnt/auto with map file /etc/auto.misc.",
                expected: [
                    { command: "echo", requiredValues: ["'/mnt/auto /etc/auto.misc'", ">>", "/etc/auto.master"] },
                    { command: "vi", requiredValues: ["/etc/auto.master"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] }
                ],
                explanation: "Master file maps base directories to their config files.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify the auto.master entry was added.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] },
                    { command: "grep", requiredValues: ["'/mnt/auto'", "/etc/auto.master"] }
                ],
                explanation: "Entry should show: /mnt/auto /etc/auto.misc",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create /etc/auto.misc mapping for 'data' to mount /dev/sdb1.",
                expected: [
                    { command: "echo", requiredValues: ["'data -fstype=xfs :/dev/sdb1'", ">", "/etc/auto.misc"] },
                    { command: "vi", requiredValues: ["/etc/auto.misc"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/auto.misc"] }
                ],
                explanation: "Map files define specific mounts: key -options :device",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Display auto.misc configuration.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/auto.misc"] },
                    { command: "less", requiredValues: ["/etc/auto.misc"] }
                ],
                explanation: "Verify mount configuration before enabling autofs.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Start and enable autofs service.",
                expected: [
                    { command: "systemctl", requiredValues: ["start", "autofs"] },
                    { command: "systemctl", requiredValues: ["enable", "autofs"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "autofs"] }
                ],
                explanation: "autofs must be running for automatic mounts to work.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify autofs service is active and enabled.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "autofs"] },
                    { command: "systemctl", requiredValues: ["is-active", "autofs"] },
                    { command: "systemctl", requiredValues: ["is-enabled", "autofs"] }
                ],
                explanation: "Service must be active and enabled for persistent automatic mounting.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Reload autofs configuration after making changes.",
                expected: [
                    { command: "systemctl", requiredValues: ["reload", "autofs"] },
                    { command: "systemctl", requiredValues: ["restart", "autofs"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "autofs"] }
                ],
                explanation: "Reload applies config changes without stopping the service.",
                points: 3
            }
        ]
    }
};
