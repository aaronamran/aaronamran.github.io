/**
 * Section 6: Storage - File Systems
 * NEW FOCUS - Critical for RHCSA EX200
 * 3 unique question sets for practice variety
 * 
 * Focus areas:
 * - Creating filesystems (XFS, EXT4, vfat)
 * - /etc/fstab configuration with UUIDs
 * - Swap management
 * - Mount options and persistent mounts
 */

const section6Data = {
    id: 6,
    title: "Storage: File Systems",
    description: "Master filesystem creation, mounting, and persistent configuration with /etc/fstab.",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Create an XFS filesystem on /dev/vg_data/lv_app.",
                expected: [
                    { command: "mkfs.xfs", requiredValues: ["/dev/vg_data/lv_app"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["xfs", "/dev/vg_data/lv_app"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/vg_data/lv_app"] },
                    { command: "lsblk", requiredFlags: ["-f"], requiredValues: ["/dev/vg_data/lv_app"] }
                ],
                explanation: "XFS is the default filesystem in RHEL 9. Use mkfs.xfs or mkfs -t xfs.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify that /dev/vg_data/lv_app has an XFS filesystem.",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/vg_data/lv_app"] },
                    { command: "lsblk", requiredFlags: ["-f"], requiredValues: ["/dev/vg_data/lv_app"] }
                ],
                explanation: "blkid shows the UUID and filesystem type. lsblk -f shows filesystem info in tree format.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create mount point /data/apps for the application data.",
                expected: {
                    command: "mkdir",
                    requiredValues: ["/data/apps"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/data/apps"] }
                ],
                explanation: "Always create the mount point directory before mounting.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Mount /dev/vg_data/lv_app to /data/apps.",
                expected: {
                    command: "mount",
                    orderedValues: ["/dev/vg_data/lv_app", "/data/apps"]
                },
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["/data/apps"] },
                    { command: "findmnt", requiredValues: ["/data/apps"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/data/apps"] }
                ],
                explanation: "mount <device> <mount_point> attaches the filesystem to the directory tree.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Retrieve the UUID of /dev/vg_data/lv_app for /etc/fstab entry.",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/vg_data/lv_app"] },
                    { command: "lsblk", requiredFlags: ["-f", "-o"], requiredValues: ["/dev/vg_data/lv_app"] }
                ],
                explanation: "UUIDs are preferred in /etc/fstab because they don't change if device names shift. Use blkid to get the UUID.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create an EXT4 filesystem on /dev/sdc2.",
                expected: [
                    { command: "mkfs.ext4", requiredValues: ["/dev/sdc2"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["ext4", "/dev/sdc2"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/sdc2"] },
                    { command: "lsblk", requiredFlags: ["-f"] }
                ],
                explanation: "EXT4 is widely used for compatibility. It's slower than XFS but supports shrinking.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create swap space on /dev/sdd1.",
                expected: {
                    command: "mkswap",
                    requiredValues: ["/dev/sdd1"]
                },
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/sdd1"] },
                    { command: "swapon", requiredFlags: ["--show"] }
                ],
                explanation: "mkswap formats a partition or file as swap space.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Activate the swap space on /dev/sdd1.",
                expected: {
                    command: "swapon",
                    requiredValues: ["/dev/sdd1"]
                },
                allowedPreChecks: [
                    { command: "swapon", requiredFlags: ["--show"] },
                    { command: "free", requiredFlags: ["-h"] }
                ],
                explanation: "swapon activates swap. Use swapon --show or free -h to verify.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify that the swap space on /dev/sdd1 is active.",
                expected: [
                    { command: "swapon", requiredFlags: ["--show"] },
                    { command: "free", requiredFlags: ["-h"] }
                ],
                explanation: "swapon --show lists all active swap devices. free -h shows total swap available.",
                points: 1
            },
            {
                id: 10,
                category: "Implementation",
                description: "Deactivate the swap space on /dev/sdd1.",
                expected: {
                    command: "swapoff",
                    requiredValues: ["/dev/sdd1"]
                },
                allowedPreChecks: [
                    { command: "swapon", requiredFlags: ["--show"] }
                ],
                explanation: "swapoff deactivates swap. Useful before removing or reformatting swap partitions.",
                points: 1
            }
        ],
        set2: [
            // Placeholder for set2
            {
                id: 1,
                category: "Implementation",
                description: "Create a vfat (FAT32) filesystem on /dev/sde1 for USB compatibility.",
                expected: [
                    { command: "mkfs.vfat", requiredValues: ["/dev/sde1"] },
                    { command: "mkfs", requiredFlags: ["-t"], requiredValues: ["vfat", "/dev/sde1"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/sde1"] }
                ],
                explanation: "vfat (FAT32) provides maximum compatibility with Windows and USB devices.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Mount /dev/sde1 to /mnt/usb with read-only option.",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["ro", "/dev/sde1", "/mnt/usb"] },
                    { command: "mount", requiredFlags: ["-r"], orderedValues: ["/dev/sde1", "/mnt/usb"] }
                ],
                allowedPreChecks: [
                    { command: "findmnt", requiredValues: ["/mnt/usb"] }
                ],
                explanation: "The -o ro option (or -r shorthand) mounts the filesystem as read-only.",
                points: 3
            }
        ],
        set3: [
            // Placeholder for set3
            {
                id: 1,
                category: "Implementation",
                description: "Create an XFS filesystem on /dev/vg_backup/lv_logs.",
                expected: [
                    { command: "mkfs.xfs", requiredValues: ["/dev/vg_backup/lv_logs"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: ["/dev/vg_backup/lv_logs"] }
                ],
                explanation: "XFS is highly scalable and performs well with large files.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create mount point /var/log/archive and mount /dev/vg_backup/lv_logs there.",
                expected: [
                    { command: "mkdir", requiredValues: ["/var/log/archive"] },
                    { command: "mount", orderedValues: ["/dev/vg_backup/lv_logs", "/var/log/archive"] }
                ],
                allowedPreChecks: [
                    { command: "findmnt", requiredValues: ["/var/log/archive"] }
                ],
                explanation: "Create the directory first, then mount the filesystem.",
                points: 3
            }
        ]
    }
};
