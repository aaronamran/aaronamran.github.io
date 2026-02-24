/**
 * Section 3: Storage and File Systems
 * 3 unique question sets for practice variety
 */

const section3Data = {
    id: 3,
    title: "Storage and File Systems",
    description: "Practice mounting file systems and managing storage.",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a directory named /mnt/external.",
                expected: {
                    command: "mkdir",
                    requiredValues: ["/mnt/external"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/external"] },
                    { command: "ls", requiredValues: ["/mnt"] }
                ],
                explanation: "mkdir creates mount points. Always create the directory before mounting.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify that the directory /mnt/external exists.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/external"] },
                    { command: "ls", requiredValues: ["/mnt"] }
                ],
                explanation: "Use 'ls -ld' to verify directory existence and permissions.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Mount the device /dev/sdc1 to /mnt/external.",
                expected: {
                    command: "mount",
                    requiredValues: ["/dev/sdc1", "/mnt/external"]
                },
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["/mnt/external"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/mnt/external"] },
                    { command: "findmnt", requiredValues: ["/mnt/external"] }
                ],
                explanation: "mount attaches filesystems to the directory tree at specified mount points.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify that /dev/sdc1 is mounted at /mnt/external.",
                expected: [
                    { command: "mount", requiredValues: ["/mnt/external"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/mnt/external"] },
                    { command: "findmnt", requiredValues: ["/mnt/external"] }
                ],
                explanation: "Use mount, df, or findmnt to verify active mounts.",
                points: 4
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create a compressed archive of /etc/httpd named httpd-backup.tar.gz in /tmp.",
                expected: {
                    command: "tar",
                    requiredFlags: ["-czf"],
                    requiredValues: ["/tmp/httpd-backup.tar.gz", "/etc/httpd"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["/tmp/httpd-backup.tar.gz"] },
                    { command: "ls", requiredValues: ["/tmp/httpd-backup.tar.gz"] }
                ],
                explanation: "tar -czf creates compressed gzip archives. -c=create, -z=gzip, -f=filename.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify that the archive /tmp/httpd-backup.tar.gz was created.",
                expected: [
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["/tmp/httpd-backup.tar.gz"] },
                    { command: "tar", requiredFlags: ["-tzf"], requiredValues: ["/tmp/httpd-backup.tar.gz"] },
                    { command: "ls", requiredValues: ["/tmp/httpd-backup.tar.gz"] }
                ],
                explanation: "Use 'ls -lh' to verify file or 'tar -tzf' to list archive contents.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Create mount point /media/usb for removable storage.",
                expected: {
                    command: "mkdir",
                    requiredValues: ["/media/usb"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/media/usb"] },
                    { command: "ls", requiredValues: ["/media"] }
                ],
                explanation: "/media is the conventional location for removable media mount points.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify /media/usb directory exists.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/media/usb"] },
                    { command: "ls", requiredValues: ["/media"] }
                ],
                explanation: "Confirm directory creation before attempting to mount.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Mount /dev/sdd1 to /media/usb with read-only option.",
                expected: [
                    { command: "mount", requiredFlags: ["-o", "ro"], requiredValues: ["/dev/sdd1", "/mnt/usb"] },
                    { command: "mount", requiredFlags: ["-r"], requiredValues: ["/dev/sdd1", "/media/usb"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["/media/usb"] },
                    { command: "findmnt", requiredValues: ["/media/usb"] }
                ],
                explanation: "Read-only mounts (-o ro or -r) protect data from accidental modification.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify /dev/sdd1 is mounted read-only at /media/usb.",
                expected: [
                    { command: "mount", requiredValues: ["/media/usb"] },
                    { command: "findmnt", requiredValues: ["/media/usb"] }
                ],
                explanation: "mount output shows 'ro' in options for read-only mounts.",
                points: 4
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create a bzip2-compressed archive of /var/log named logs-backup.tar.bz2.",
                expected: {
                    command: "tar",
                    requiredFlags: ["-cjf"],
                    requiredValues: ["logs-backup.tar.bz2", "/var/log"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["logs-backup.tar.bz2"] },
                    { command: "tar", requiredFlags: ["-tjf"], requiredValues: ["logs-backup.tar.bz2"] }
                ],
                explanation: "tar -cjf uses bzip2 compression (-j), which offers better compression than gzip.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify logs-backup.tar.bz2 archive was created successfully.",
                expected: [
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["logs-backup.tar.bz2"] },
                    { command: "tar", requiredFlags: ["-tjf"], requiredValues: ["logs-backup.tar.bz2"] },
                    { command: "ls", requiredValues: ["logs-backup.tar.bz2"] }
                ],
                explanation: "tar -tjf lists bzip2 archive contents. -t=list, -j=bzip2, -f=file.",
                points: 3
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Create nested directories /backup/databases/mysql with one command.",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/backup/databases/mysql"] },
                    { command: "mkdir", requiredFlags: ["--parents"], requiredValues: ["/backup/databases/mysql"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/backup"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/backup/databases/mysql"] }
                ],
                explanation: "mkdir -p creates parent directories as needed. Essential for directory tree creation.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the nested directory structure /backup/databases/mysql exists.",
                expected: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/backup"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/backup/databases/mysql"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/backup/databases"] }
                ],
                explanation: "'ls -lR' recursively lists directory contents to verify structure.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Mount /dev/sde1 by UUID to /mnt/data. First save the UUID to /tmp/uuid.txt.",
                expected: [
                    { command: "blkid", requiredFlags: ["-s", "UUID"], requiredValues: ["/dev/sde1", ">", "/tmp/uuid.txt"] },
                    { command: "blkid", requiredValues: ["/dev/sde1", ">", "/tmp/uuid.txt"] },
                    { command: "lsblk", requiredFlags: ["-no", "UUID"], requiredValues: ["/dev/sde1", ">", "/tmp/uuid.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/uuid.txt"] },
                    { command: "blkid", requiredValues: ["/dev/sde1"] }
                ],
                explanation: "UUIDs provide persistent device identification even if device names change. Essential for fstab.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify the UUID was saved to /tmp/uuid.txt.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/uuid.txt"] },
                    { command: "less", requiredValues: ["/tmp/uuid.txt"] },
                    { command: "more", requiredValues: ["/tmp/uuid.txt"] }
                ],
                explanation: "Verify UUID before using it in mount commands or fstab entries.",
                points: 4
            },
            {
                id: 5,
                category: "Implementation",
                description: "Extract /etc/httpd from httpd-backup.tar.gz to /restore.",
                expected: [
                    { command: "tar", requiredFlags: ["-xzf", "-C"], requiredValues: ["httpd-backup.tar.gz", "/restore"] },
                    { command: "tar", requiredFlags: ["-xzf"], requiredValues: ["httpd-backup.tar.gz", "-C", "/restore"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/restore"] },
                    { command: "ls", requiredValues: ["/restore/etc/httpd"] }
                ],
                explanation: "tar -xzf extracts gzip archives. -C changes to target directory before extracting.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify /etc/httpd was extracted to /restore.",
                expected: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/restore"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/restore/etc/httpd"] },
                    { command: "ls", requiredValues: ["/restore/etc"] }
                ],
                explanation: "Check directory structure to confirm successful extraction to target location.",
                points: 3
            }
        ],
        
        // Set 4: GPT partitioning
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "Display the partition table of disk /dev/sdb.",
                expected: [
                    { command: "fdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] },
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] },
                    { command: "gdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] },
                    { command: "lsblk", requiredFlags: [], requiredValues: ["/dev/sdb"] }
                ],
                explanation: "fdisk -l shows partition layout. parted and gdisk work better with GPT.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create a new GPT partition table on /dev/sdb.",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["mklabel", "gpt"] },
                    { command: "gdisk", requiredValues: ["/dev/sdb"] }
                ],
                allowedPreChecks: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] },
                    { command: "fdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] }
                ],
                explanation: "GPT is modern partitioning scheme supporting >2TB and many partitions. Use parted or gdisk.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify /dev/sdb now has GPT partition table.",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] },
                    { command: "gdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] },
                    { command: "fdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] }
                ],
                explanation: "parted print shows 'Partition Table: gpt'. MBR disks show 'msdos'.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create a 500MB partition on /dev/sdb using parted.",
                expected: {
                    command: "parted",
                    requiredFlags: ["/dev/sdb"],
                    requiredValues: ["mkpart", "500MB"]
                },
                allowedPreChecks: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] }
                ],
                explanation: "parted mkpart creates partitions. Syntax: mkpart [name] [start] [end].",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify the new partition was created.",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] },
                    { command: "lsblk", requiredValues: ["/dev/sdb"] },
                    { command: "fdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] }
                ],
                explanation: "lsblk shows tree of block devices. New partition appears as /dev/sdb1.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create a 1GB partition on /dev/sdc starting at 1MiB.",
                expected: {
                    command: "parted",
                    requiredFlags: ["/dev/sdc"],
                    requiredValues: ["mkpart", "1MiB", "1GiB"]
                },
                allowedPreChecks: [
                    { command: "parted", requiredFlags: ["/dev/sdc"], requiredValues: ["print"] }
                ],
                explanation: "Start at 1MiB for proper alignment. Specify end as 1GiB or +1024MiB.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Display partition alignment information for /dev/sdc1.",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdc"], requiredValues: ["align-check", "optimal", "1"] },
                    { command: "parted", requiredFlags: ["/dev/sdc"], requiredValues: ["print"] }
                ],
                explanation: "Proper alignment is critical for SSD performance. align-check verifies this.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Set partition type of /dev/sdb1 to Linux LVM (type 8e or lvm flag).",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["set", "1", "lvm", "on"] },
                    { command: "fdisk", requiredValues: ["/dev/sdb"] }
                ],
                allowedPreChecks: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] }
                ],
                explanation: "Setting partition type helps system recognize intended use. LVM flag = 8e in fdisk.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify partition type is set to LVM.",
                expected: [
                    { command: "parted", requiredFlags: ["/dev/sdb"], requiredValues: ["print"] },
                    { command: "fdisk", requiredFlags: ["-l"], requiredValues: ["/dev/sdb"] }
                ],
                explanation: "Flags column in parted shows 'lvm'. fdisk shows type '8e' or 'Linux LVM'.",
                points: 2
            }
        ],
        
        // Set 5: Physical Volumes (PV)
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Initialize /dev/sdb1 as a physical volume for LVM.",
                expected: {
                    command: "pvcreate",
                    requiredValues: ["/dev/sdb1"]
                },
                allowedPreChecks: [
                    { command: "pvs", requiredValues: [] },
                    { command: "pvdisplay", requiredValues: [] },
                    { command: "lsblk", requiredValues: [] }
                ],
                explanation: "pvcreate initializes partitions/disks for use in LVM. First step in LVM setup.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display all physical volumes in the system.",
                expected: [
                    { command: "pvs", requiredValues: [] },
                    { command: "pvdisplay", requiredValues: [] },
                    { command: "pvscan", requiredValues: [] }
                ],
                explanation: "pvs shows summary, pvdisplay shows detailed info, pvscan discovers all PVs.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display detailed information about physical volume /dev/sdb1.",
                expected: [
                    { command: "pvdisplay", requiredValues: ["/dev/sdb1"] },
                    { command: "pvs", requiredValues: ["/dev/sdb1"] }
                ],
                explanation: "pvdisplay shows size, UUID, VG name (if assigned), PE size, and free space.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Initialize /dev/sdc1 and /dev/sdd1 as physical volumes.",
                expected: {
                    command: "pvcreate",
                    requiredValues: ["/dev/sdc1", "/dev/sdd1"]
                },
                allowedPreChecks: [
                    { command: "pvs", requiredValues: [] }
                ],
                explanation: "Multiple devices can be initialized with single pvcreate command.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "List all PVs showing size and free space.",
                expected: [
                    { command: "pvs", requiredFlags: [], requiredValues: [] },
                    { command: "pvdisplay", requiredValues: [] }
                ],
                explanation: "pvs output shows PV name, VG name, Fmt, Attr, PSize, PFree columns.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Remove physical volume from /dev/sde1 (if it exists).",
                expected: {
                    command: "pvremove",
                    requiredValues: ["/dev/sde1"]
                },
                allowedPreChecks: [
                    { command: "pvs", requiredValues: [] },
                    { command: "pvdisplay", requiredValues: ["/dev/sde1"] }
                ],
                explanation: "pvremove removes LVM label from device. Device must not be in use by any VG.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify /dev/sde1 no longer appears as a physical volume.",
                expected: [
                    { command: "pvs", requiredValues: [] },
                    { command: "pvscan", requiredValues: [] }
                ],
                explanation: "After pvremove, device disappears from pvs output.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Change the physical extent size to 8MB when creating PV on /dev/sdf1.",
                expected: {
                    command: "pvcreate",
                    requiredFlags: ["-s", "8m"],
                    requiredValues: ["/dev/sdf1"]
                },
                allowedPreChecks: [
                    { command: "pvdisplay", requiredValues: ["/dev/sdf1"] }
                ],
                explanation: "PE size affects granularity of allocation. Default is 4MB, can be 1MB-128MB.",
                points: 4
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify PE size for /dev/sdf1.",
                expected: [
                    { command: "pvdisplay", requiredValues: ["/dev/sdf1"] }
                ],
                explanation: "pvdisplay shows 'PE Size' field. Should display 8.00 MiB.",
                points: 2
            }
        ],
        
        // Set 6: Volume Groups (VG)
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Create volume group 'datavg' using physical volume /dev/sdb1.",
                expected: {
                    command: "vgcreate",
                    requiredValues: ["datavg", "/dev/sdb1"]
                },
                allowedPreChecks: [
                    { command: "vgs", requiredValues: [] },
                    { command: "vgdisplay", requiredValues: [] },
                    { command: "pvs", requiredValues: [] }
                ],
                explanation: "vgcreate creates VG from one or more PVs. VG name must be unique.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display all volume groups in the system.",
                expected: [
                    { command: "vgs", requiredValues: [] },
                    { command: "vgdisplay", requiredValues: [] },
                    { command: "vgscan", requiredValues: [] }
                ],
                explanation: "vgs shows summary with VG name, PV count, LV count, size. vgdisplay shows details.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display detailed information about volume group 'datavg'.",
                expected: [
                    { command: "vgdisplay", requiredValues: ["datavg"] },
                    { command: "vgs", requiredValues: ["datavg"] }
                ],
                explanation: "vgdisplay shows size, PE size, total/free PEs, PV count, LV count, UUID.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Extend volume group 'datavg' by adding physical volume /dev/sdc1.",
                expected: {
                    command: "vgextend",
                    requiredValues: ["datavg", "/dev/sdc1"]
                },
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["datavg"] },
                    { command: "pvs", requiredValues: [] }
                ],
                explanation: "vgextend adds PVs to existing VG, increasing available space for LVs.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify datavg now includes both /dev/sdb1 and /dev/sdc1.",
                expected: [
                    { command: "vgdisplay", requiredValues: ["datavg"] },
                    { command: "pvs", requiredValues: [] },
                    { command: "vgs", requiredFlags: ["-v"], requiredValues: ["datavg"] }
                ],
                explanation: "vgdisplay shows increased size and PV count. pvs shows both devices in datavg.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create volume group 'appvg' with PVs /dev/sdd1 and /dev/sde1, PE size 8MB.",
                expected: {
                    command: "vgcreate",
                    requiredFlags: ["-s", "8m"],
                    requiredValues: ["appvg", "/dev/sdd1", "/dev/sde1"]
                },
                allowedPreChecks: [
                    { command: "vgdisplay", requiredValues: ["appvg"] },
                    { command: "pvs", requiredValues: [] }
                ],
                explanation: "-s sets PE size. Multiple PVs can be specified in one command.",
                points: 4
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify PE size for appvg is 8MB.",
                expected: [
                    { command: "vgdisplay", requiredValues: ["appvg"] }
                ],
                explanation: "vgdisplay shows 'PE Size' field. Should display 8.00 MiB.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Remove physical volume /dev/sde1 from volume group appvg.",
                expected: {
                    command: "vgreduce",
                    requiredValues: ["appvg", "/dev/sde1"]
                },
                allowedPreChecks: [
                    { command: "vgs", requiredValues: ["appvg"] },
                    { command: "pvs", requiredValues: [] }
                ],
                explanation: "vgreduce removes PV from VG. PV must have no allocated PEs (no LV data).",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Verify appvg no longer includes /dev/sde1.",
                expected: [
                    { command: "vgdisplay", requiredValues: ["appvg"] },
                    { command: "pvs", requiredValues: [] },
                    { command: "vgs", requiredFlags: ["-v"], requiredValues: ["appvg"] }
                ],
                explanation: "vgdisplay shows reduced size and PV count. pvs shows /dev/sde1 without VG assignment.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Rename volume group 'appvg' to 'prodvg'.",
                expected: {
                    command: "vgrename",
                    requiredValues: ["appvg", "prodvg"]
                },
                allowedPreChecks: [
                    { command: "vgs", requiredValues: [] }
                ],
                explanation: "vgrename changes VG name. VG must not be in use during rename.",
                points: 3
            },
            {
                id: 11,
                category: "Audit",
                description: "Verify volume group was renamed to prodvg.",
                expected: [
                    { command: "vgs", requiredValues: [] },
                    { command: "vgdisplay", requiredValues: ["prodvg"] }
                ],
                explanation: "vgs now shows 'prodvg' instead of 'appvg'. Old name no longer exists.",
                points: 2
            }
        ]
    }
};
