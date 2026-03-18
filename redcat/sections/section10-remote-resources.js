/**
 * Section 10: Remote Resources
 * 3 unique question sets for practice variety
 */

const section10Data = {
    id: 10,
    title: "Remote Resources",
    description: "Mount and configure NFS shares and network file systems",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "Display NFS exports available on server 192.168.10.50",
                expected: [
                    { command: "showmount", requiredFlags: ["-e"], requiredValues: ["192.168.10.50"] },
                    { command: "showmount", requiredFlags: ["--exports"], requiredValues: ["192.168.10.50"] }
                ],
                explanation: "showmount -e queries remote NFS server for available exports.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create mount point /mnt/nfsdata",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/nfsdata"] },
                    { command: "mkdir", requiredValues: ["/mnt/nfsdata"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/nfsdata"] }
                ],
                explanation: "Create directory to serve as NFS mount point.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Mount NFS share 192.168.10.50:/data to /mnt/nfsdata",
                expected: [
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs", "192.168.10.50:/data", "/mnt/nfsdata"] },
                    { command: "mount", requiredValues: ["192.168.10.50:/data", "/mnt/nfsdata"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/nfsdata"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "mount -t nfs attaches remote NFS shares to local filesystem.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify the NFS mount is active",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/nfsdata"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["/mnt/nfsdata"] },
                    { command: "findmnt", requiredValues: ["/mnt/nfsdata"] }
                ],
                explanation: "Confirm NFS share is mounted and accessible.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Display all currently mounted NFS filesystems",
                expected: [
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "df", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "findmnt", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "Filter mount output to show only NFS type filesystems.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Add NFS mount to /etc/fstab for persistence: 192.168.10.50:/data /mnt/nfsdata nfs defaults 0 0",
                expected: [
                    { command: "echo", requiredValues: ["192.168.10.50:/data", "/mnt/nfsdata", "nfs", "defaults", "0", "0", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] },
                    { command: "nano", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "tail", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "fstab entry ensures NFS mounts automatically at boot.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Test fstab NFS entry by unmounting and remounting with mount -a",
                expected: [
                    { command: "umount", requiredValues: ["/mnt/nfsdata"] },
                    { command: "mount", requiredFlags: ["-a"] },
                    { command: "df", requiredFlags: ["-h"] }
                ],
                explanation: "mount -a validates fstab entries by mounting all defined filesystems.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Display NFS client activity statistics",
                expected: [
                    { command: "nfsstat" },
                    { command: "nfsstat", requiredFlags: ["-c"] }
                ],
                explanation: "nfsstat shows NFS performance metrics and RPC call statistics.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Audit",
                description: "Check available NFS shares on server 10.0.5.100",
                expected: [
                    { command: "showmount", requiredFlags: ["-e"], requiredValues: ["10.0.5.100"] },
                    { command: "showmount", requiredFlags: ["--exports"], requiredValues: ["10.0.5.100"] }
                ],
                explanation: "Query NFS server for list of exported directories.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create mount point /mnt/shared and mount 10.0.5.100:/exports/shared with read-only option",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/shared"] },
                    { command: "mount", requiredFlags: ["-t", "-o"], requiredValues: ["nfs", "ro", "10.0.5.100:/exports/shared", "/mnt/shared"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/shared"] },
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/shared"] }
                ],
                explanation: "ro option mounts NFS share in read-only mode for data safety.",
                points: 4
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify /mnt/shared is mounted read-only",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/shared"] },
                    { command: "findmnt", requiredValues: ["/mnt/shared"] }
                ],
                explanation: "Mount options should include 'ro' flag.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Remount /mnt/shared as read-write without unmounting",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rw", "/mnt/shared"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/shared"] }
                ],
                explanation: "remount changes mount options on active filesystems.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Confirm /mnt/shared is now read-write",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/shared"] },
                    { command: "findmnt", requiredValues: ["/mnt/shared"] }
                ],
                explanation: "Options should now show 'rw' instead of 'ro'.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Display NFS mounted filesystems with their mount options",
                expected: [
                    { command: "findmnt", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "View all NFS mounts and their configuration details.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Add NFS mount to fstab with nosuid,noexec options: 10.0.5.100:/exports/shared /mnt/shared nfs nosuid,noexec 0 0",
                expected: [
                    { command: "echo", requiredValues: ["10.0.5.100:/exports/shared", "/mnt/shared", "nfs", "nosuid,noexec", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "grep", requiredValues: ["/mnt/shared", "/etc/fstab"] }
                ],
                explanation: "nosuid blocks setuid bits, noexec prevents binary execution for security.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Show NFS mount information including server and mount options",
                expected: [
                    { command: "nfsstat", requiredFlags: ["-m"] },
                    { command: "findmnt", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "nfsstat -m displays per-mount NFS statistics and options.",
                points: 2
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Audit",
                description: "List NFS exports from server nfs.example.com",
                expected: [
                    { command: "showmount", requiredFlags: ["-e"], requiredValues: ["nfs.example.com"] },
                    { command: "showmount", requiredFlags: ["--exports"], requiredValues: ["nfs.example.com"] }
                ],
                explanation: "showmount works with hostnames or IP addresses.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create /mnt/backups and mount nfs.example.com:/backup with soft mount option",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/backups"] },
                    { command: "mount", requiredFlags: ["-t", "-o"], requiredValues: ["nfs", "soft", "nfs.example.com:/backup", "/mnt/backups"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/mnt/backups"] },
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/backups"] }
                ],
                explanation: "soft mount allows operations to timeout if server is unavailable.",
                points: 4
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify soft option is active on /mnt/backups mount",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/backups"] },
                    { command: "findmnt", requiredValues: ["/mnt/backups"] },
                    { command: "nfsstat", requiredFlags: ["-m"] }
                ],
                explanation: "Check mount options include 'soft' parameter.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Mount nfs.example.com:/logs to /mnt/logs with NFSv4 explicitly",
                expected: [
                    { command: "mkdir", requiredFlags: ["-p"], requiredValues: ["/mnt/logs"] },
                    { command: "mount", requiredFlags: ["-t", "-o"], requiredValues: ["nfs", "nfsvers=4", "nfs.example.com:/logs", "/mnt/logs"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/logs"] }
                ],
                explanation: "nfsvers=4 option forces NFSv4 protocol usage.",
                points: 4
            },
            {
                id: 5,
                category: "Audit",
                description: "Display all active filesystem mounts showing type and options",
                expected: [
                    { command: "findmnt" },
                    { command: "mount" }
                ],
                explanation: "findmnt provides tree view of all mount points and details.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Unmount all NFS shares under /mnt",
                expected: [
                    { command: "umount", requiredValues: ["/mnt/backups"] },
                    { command: "umount", requiredValues: ["/mnt/logs"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "Gracefully detach NFS mounts before system changes.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify no NFS mounts remain active",
                expected: [
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "df", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "Should return empty result if all NFS mounts removed.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Display NFS client RPC statistics",
                expected: [
                    { command: "nfsstat", requiredFlags: ["-c"] },
                    { command: "nfsstat" }
                ],
                explanation: "nfsstat -c shows client-side NFS RPC call counts and performance.",
                points: 2
            }
        ],
        
        // Set 4: autofs for NFS
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Configure autofs to automatically mount NFS share from server.com:/exports/home.",
                expected: [
                    { command: "echo", requiredValues: ["'/net /etc/auto.net'", ">>", "/etc/auto.master"] },
                    { command: "vi", requiredValues: ["/etc/auto.master"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] },
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["autofs"] }
                ],
                explanation: "autofs mounts NFS shares on-demand, unmounts after idle period.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify autofs master configuration.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] },
                    { command: "grep", requiredValues: ["'/net'", "/etc/auto.master"] }
                ],
                explanation: "Master file maps mount points to configuration files.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create /etc/auto.nfs map file for NFS shares.",
                expected: [
                    { command: "echo", requiredValues: ["'home -rw,soft server.com:/exports/home'", ">", "/etc/auto.nfs"] },
                    { command: "vi", requiredValues: ["/etc/auto.nfs"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/auto.nfs"] }
                ],
                explanation: "Map files define NFS server, export path, and mount options.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Display auto.nfs configuration.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/auto.nfs"] },
                    { command: "less", requiredValues: ["/etc/auto.nfs"] }
                ],
                explanation: "Verify mount key, options, and NFS server path.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Add auto.nfs entry to auto.master for /mnt/nfs base mount.",
                expected: [
                    { command: "echo", requiredValues: ["'/mnt/nfs /etc/auto.nfs'", ">>", "/etc/auto.master"] },
                    { command: "vi", requiredValues: ["/etc/auto.master"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/auto.master"] }
                ],
                explanation: "Maps /mnt/nfs/* to definitions in /etc/auto.nfs.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Restart autofs service to apply new configuration.",
                expected: [
                    { command: "systemctl", requiredValues: ["restart", "autofs"] },
                    { command: "systemctl", requiredValues: ["reload", "autofs"] }
                ],
                explanation: "autofs must reload configuration to recognize new maps.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Test autofs by accessing /mnt/nfs/home.",
                expected: [
                    { command: "ls", requiredValues: ["/mnt/nfs/home"] },
                    { command: "cd", requiredValues: ["/mnt/nfs/home"] }
                ],
                allowedPreChecks: [
                    { command: "df", requiredFlags: ["-h"], requiredValues: [] }
                ],
                explanation: "Accessing mount point triggers automatic NFS mount.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify NFS share was auto-mounted.",
                expected: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/nfs"] },
                    { command: "df", requiredFlags: ["-h"], requiredValues: ["|", "grep", "/mnt/nfs"] }
                ],
                explanation: "autofs mounts appear in mount and df output when active.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Configure autofs timeout to 60 seconds.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/autofs.conf"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^timeout.*/timeout = 60/'", "/etc/autofs.conf"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["timeout", "/etc/autofs.conf"] }
                ],
                explanation: "Timeout controls how long before idle mounts are unmounted.",
                points: 4
            },
            {
                id: 10,
                category: "Audit",
                description: "Check autofs service status and active mounts.",
                expected: [
                    { command: "systemctl", requiredValues: ["status", "autofs"] },
                    { command: "automount", requiredFlags: ["-m"], requiredValues: [] }
                ],
                explanation: "Verify autofs is running and monitoring configured mount points.",
                points: 2
            }
        ],
        
        // Set 5: fstab advanced options
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Add NFS mount to /etc/fstab that doesn't prevent boot if unavailable.",
                expected: [
                    { command: "echo", requiredValues: ["'server:/export /mnt/nfs nfs defaults,nofail 0 0'", ">>", "/etc/fstab"] },
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "nofail prevents boot failure if NFS server unavailable.",
                points: 4
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify fstab entry syntax without mounting.",
                expected: [
                    { command: "findmnt", requiredValues: ["--verify"] },
                    { command: "mount", requiredFlags: ["-fav"], requiredValues: [] }
                ],
                explanation: "findmnt --verify checks fstab syntax. mount -fav does fake mount test.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Add noauto option to prevent automatic mounting at boot.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/fstab"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/defaults/defaults,noauto/'", "/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "noauto requires manual mount, useful for removable media.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Display all fstab entries.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/fstab"] },
                    { command: "column", requiredFlags: ["-t"], requiredValues: ["/etc/fstab"] }
                ],
                explanation: "column -t formats fstab for easier reading.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Add x-systemd.automount option for on-demand mounting via systemd.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/fstab"] },
                    { command: "echo", requiredValues: ["'server:/data /mnt/data nfs x-systemd.automount 0 0'", ">>", "/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "x-systemd.automount creates systemd automount unit for lazy mounting.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Reload systemd to process new fstab entries.",
                expected: [
                    { command: "systemctl", requiredValues: ["daemon-reload"] },
                    { command: "systemctl", requiredValues: ["list-units", "--type=automount"] }
                ],
                explanation: "systemd creates .automount units from x-systemd options in fstab.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Add _netdev option for network filesystem.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/fstab"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/defaults/defaults,_netdev/'", "/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "_netdev delays mount until network is available.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Test mounting all fstab entries.",
                expected: [
                    { command: "mount", requiredFlags: ["-a"], requiredValues: [] }
                ],
                explanation: "mount -a mounts all filesystems in fstab (except noauto).",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Add UUID-based entry to fstab for NFS mount.",
                expected: [
                    { command: "blkid", requiredValues: ["/dev/sdb1"] },
                    { command: "echo", requiredValues: ["'UUID=<uuid> /mnt/disk ext4 defaults 0 2'", ">>", "/etc/fstab"] }
                ],
                allowedPreChecks: [
                    { command: "blkid", requiredValues: [] }
                ],
                explanation: "UUID is more reliable than device names which can change.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display currently mounted filesystems that match fstab.",
                expected: [
                    { command: "findmnt", requiredValues: ["--fstab"] },
                    { command: "mount", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "findmnt --fstab shows which fstab entries are currently mounted.",
                points: 2
            }
        ],
        
        // Set 6: NFS troubleshooting
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Display exported NFS shares from server 192.168.1.10.",
                expected: [
                    { command: "showmount", requiredFlags: ["-e"], requiredValues: ["192.168.1.10"] }
                ],
                explanation: "showmount -e queries NFS server for available exports.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Check if NFS ports are accessible from client.",
                expected: [
                    { command: "nc", requiredFlags: ["-zv"], requiredValues: ["192.168.1.10", "2049"] },
                    { command: "telnet", requiredValues: ["192.168.1.10", "2049"] },
                    { command: "rpcinfo", requiredFlags: ["-p"], requiredValues: ["192.168.1.10"] }
                ],
                allowedPreChecks: [
                    { command: "ping", requiredFlags: ["-c", "3"], requiredValues: ["192.168.1.10"] }
                ],
                explanation: "NFS uses port 2049. rpcinfo shows all RPC services.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display NFS mount statistics.",
                expected: [
                    { command: "nfsstat", requiredValues: [] },
                    { command: "nfsstat", requiredFlags: ["-c"], requiredValues: [] }
                ],
                explanation: "nfsstat shows RPC statistics helpful for performance analysis.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Force unmount stuck NFS mount.",
                expected: [
                    { command: "umount", requiredFlags: ["-f"], requiredValues: ["/mnt/nfs"] },
                    { command: "umount", requiredFlags: ["-l"], requiredValues: ["/mnt/nfs"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/nfs"] }
                ],
                explanation: "-f forces unmount. -l lazy unmount (detaches immediately, cleans up when able).",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Check for stale NFS file handles.",
                expected: [
                    { command: "ls", requiredValues: ["/mnt/nfs"] },
                    { command: "find", requiredValues: ["/mnt/nfs", "-type", "f"] }
                ],
                explanation: "Stale file handles cause I/O errors. Indicates server-side export changes.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Display active NFS mounts with server details.",
                expected: [
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "df", requiredFlags: ["-t"], requiredValues: ["nfs"] },
                    { command: "findmnt", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: [] }
                ],
                explanation: "Shows which NFS shares are currently mounted and their options.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Check NFS protocol version in use.",
                expected: [
                    { command: "nfsstat", requiredFlags: ["-m"], requiredValues: [] },
                    { command: "mount", requiredFlags: ["-t"], requiredValues: ["nfs"] }
                ],
                explanation: "nfsstat -m shows per-mount statistics including NFS version.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Test NFS server connectivity and response time.",
                expected: [
                    { command: "rpcinfo", requiredFlags: ["-p"], requiredValues: ["192.168.1.10"] },
                    { command: "showmount", requiredFlags: ["-e"], requiredValues: ["192.168.1.10"] }
                ],
                allowedPreChecks: [
                    { command: "ping", requiredFlags: ["-c", "3"], requiredValues: ["192.168.1.10"] }
                ],
                explanation: "rpcinfo checks if RPC services respond. Timeout indicates firewall/service issues.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Display NFS I/O statistics for performance analysis.",
                expected: [
                    { command: "nfsiostat", requiredValues: [] },
                    { command: "iostat", requiredFlags: ["-x"], requiredValues: [] }
                ],
                explanation: "nfsiostat shows NFS-specific I/O metrics for tuning.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Remount NFS share with different options without unmounting.",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rsize=8192,wsize=8192", "/mnt/nfs"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["|", "grep", "/mnt/nfs"] }
                ],
                explanation: "remount changes options on live mount. rsize/wsize affect transfer size.",
                points: 4
            }
        ]
    }
};
