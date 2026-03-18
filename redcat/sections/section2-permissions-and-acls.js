/**
 * Section 2: Permissions and ACLs
 * 3 unique question sets for practice variety
 */

const section2Data = {
    id: 2,
    title: "Permissions and ACLs",
    description: "Practice managing file permissions and Access Control Lists.",
    totalPoints: 26,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Change the permissions of /opt/webapp to 755 (rwxr-xr-x).",
                expected: [
                    { command: "chmod", requiredValues: ["755", "/opt/webapp"] },
                    { command: "chmod", requiredValues: ["u=rwx,g=rx,o=rx", "/opt/webapp"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] },
                    { command: "stat", requiredValues: ["/opt/webapp"] }
                ],
                explanation: "chmod 755 gives owner full control, group and others read/execute. Common for web directories.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the permissions on /opt/webapp are correctly set to 755.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] },
                    { command: "stat", requiredValues: ["/opt/webapp"] }
                ],
                explanation: "Use 'ls -ld' for symbolic format (rwxr-xr-x) or 'stat' for numeric permissions.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Change the owner of /opt/webapp to 'webuser' and the group to 'developers'.",
                expected: [
                    { command: "chown", requiredValues: ["webuser:developers", "/opt/webapp"] },
                    { command: "chown", requiredValues: ["webuser", "/opt/webapp"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] },
                    { command: "stat", requiredValues: ["/opt/webapp"] }
                ],
                explanation: "chown user:group sets both owner and group simultaneously.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify the owner and group of /opt/webapp are correctly set.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] },
                    { command: "stat", requiredValues: ["/opt/webapp"] }
                ],
                explanation: "'ls -ld' shows ownership in the third and fourth columns.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set an ACL to give user 'sarah' read, write, and execute access to /opt/webapp.",
                expected: {
                    command: "setfacl",
                    requiredFlags: ["-m"],
                    requiredValues: ["u:sarah:rwx", "/opt/webapp"]
                },
                allowedPreChecks: [
                    { command: "getfacl", requiredValues: ["/opt/webapp"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] }
                ],
                explanation: "setfacl -m modifies ACL entries. Provides fine-grained access control.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify the ACL for user 'sarah' on /opt/webapp shows rwx permissions.",
                expected: [
                    { command: "getfacl", requiredValues: ["/opt/webapp"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/webapp"] }
                ],
                explanation: "getfacl displays all ACL entries. A '+' in ls output indicates ACLs are present.",
                points: 4
            },
            {
                id: 7,
                category: "Implementation",
                description: "Change only the group ownership of /var/backup to 'backup'.",
                expected: [
                    { command: "chgrp", requiredValues: ["backup", "/var/backup"] },
                    { command: "chown", requiredValues: [":backup", "/var/backup"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/var/backup"] },
                    { command: "stat", requiredValues: ["/var/backup"] }
                ],
                explanation: "chgrp changes only group ownership. ':group' in chown also works.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify the group ownership of /var/backup is set to 'backup'.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/var/backup"] },
                    { command: "stat", requiredValues: ["/var/backup"] }
                ],
                explanation: "Group ownership appears in the fourth column of 'ls -ld' output.",
                points: 3
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Set permissions on /etc/appconfig to 640 (rw-r-----).",
                expected: [
                    { command: "chmod", requiredValues: ["640", "/etc/appconfig"] },
                    { command: "chmod", requiredValues: ["u=rw,g=r,o=", "/etc/appconfig"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/appconfig"] },
                    { command: "stat", requiredValues: ["/etc/appconfig"] }
                ],
                explanation: "640 is typical for config files: owner rw, group r, others none. Balances security and usability.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify /etc/appconfig has 640 permissions.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/appconfig"] },
                    { command: "stat", requiredValues: ["/etc/appconfig"] }
                ],
                explanation: "Look for rw-r----- in ls output or 0640 in stat output.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Set the setgid bit on /shared/projects so new files inherit the group.",
                expected: [
                    { command: "chmod", requiredValues: ["g+s", "/shared/projects"] },
                    { command: "chmod", requiredValues: ["2755", "/shared/projects"] },
                    { command: "chmod", requiredValues: ["2775", "/shared/projects"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/shared/projects"] },
                    { command: "stat", requiredValues: ["/shared/projects"] }
                ],
                explanation: "setgid (g+s or 2xxx) ensures new files inherit directory's group. Essential for shared directories.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify the setgid bit is set on /shared/projects.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/shared/projects"] },
                    { command: "stat", requiredValues: ["/shared/projects"] }
                ],
                explanation: "setgid shows as 's' in group execute position (drwxr-sr-x).",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set an ACL on /data/reports to give the 'managers' group read and write access.",
                expected: {
                    command: "setfacl",
                    requiredFlags: ["-m"],
                    requiredValues: ["g:managers:rw", "/data/reports"]
                },
                allowedPreChecks: [
                    { command: "getfacl", requiredValues: ["/data/reports"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/data/reports"] },
                    { command: "stat", requiredValues: ["/data/reports"] }
                ],
                explanation: "setfacl -m g:groupname:perms sets group ACLs. Useful for multiple group access.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify the ACL for group 'managers' on /data/reports.",
                expected: [
                    { command: "getfacl", requiredValues: ["/data/reports"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/data/reports"] },
                    { command: "stat", requiredValues: ["/data/reports"] }
                ],
                explanation: "getfacl shows group ACL as 'group:managers:rw-'. ls -ld shows '+' for ACL. stat shows permissions with ACL indicator.",
                points: 4
            },
            {
                id: 7,
                category: "Implementation",
                description: "Set the sticky bit on /tmp/shared so users can only delete their own files.",
                expected: [
                    { command: "chmod", requiredValues: ["+t", "/tmp/shared"] },
                    { command: "chmod", requiredValues: ["o+t", "/tmp/shared"] },
                    { command: "chmod", requiredValues: ["1777", "/tmp/shared"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/tmp/shared"] },
                    { command: "stat", requiredValues: ["/tmp/shared"] }
                ],
                explanation: "Sticky bit (+t or 1xxx) prevents users from deleting others' files. Critical for shared temp directories.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify the sticky bit is set on /tmp/shared.",
                expected: [
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/tmp/shared"] },
                    { command: "stat", requiredValues: ["/tmp/shared"] }
                ],
                explanation: "Sticky bit shows as 't' or 'T' in others execute position (drwxrwxrwt).",
                points: 3
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Recursively change permissions on /srv/files to 644 for files.",
                expected: [
                    { command: "chmod", requiredFlags: ["-R"], requiredValues: ["644", "/srv/files"] },
                    { command: "chmod", requiredFlags: ["-R"], requiredValues: ["u=rw,g=r,o=r", "/srv/files"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/srv/files"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/srv/files"] }
                ],
                explanation: "Recursive chmod (-R) applies permissions to all files/directories. 644 is standard for readable files.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify files in /srv/files have 644 permissions.",
                expected: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/srv/files"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/srv/files"] },
                    { command: "find", requiredFlags: ["/srv/files", "-type", "f"], requiredValues: [] }
                ],
                explanation: "Use 'ls -lR' to recursively list permissions or 'find' to check file types.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Recursively change owner to 'appuser' and group to 'appsvc' for /opt/myapp.",
                expected: [
                    { command: "chown", requiredFlags: ["-R"], requiredValues: ["appuser:appsvc", "/opt/myapp"] },
                    { command: "chown", requiredFlags: ["-R"], requiredValues: ["appuser", "/opt/myapp"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/opt/myapp"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/myapp"] }
                ],
                explanation: "Recursive chown (-R) applies ownership to directory tree. Essential for application deployments.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify ownership of /opt/myapp and its contents.",
                expected: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/opt/myapp"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/myapp"] }
                ],
                explanation: "'ls -lR' shows ownership recursively. Check third and fourth columns.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set default ACL on /shared/docs so new files give group 'editors' rw access.",
                expected: {
                    command: "setfacl",
                    requiredFlags: ["-m"],
                    requiredValues: ["d:g:editors:rw", "/shared/docs"]
                },
                allowedPreChecks: [
                    { command: "getfacl", requiredValues: ["/shared/docs"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/shared/docs"] }
                ],
                explanation: "Default ACLs (d:) are inherited by new files/directories. Critical for maintaining permissions in shared spaces.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify the default ACL for group 'editors' on /shared/docs.",
                expected: [
                    { command: "getfacl", requiredValues: ["/shared/docs"] }
                ],
                explanation: "getfacl shows default ACLs with 'default:' prefix. Look for 'default:group:editors:rw-'.",
                points: 4
            },
            {
                id: 7,
                category: "Implementation",
                description: "Remove all ACLs from /test/file and revert to standard permissions.",
                expected: [
                    { command: "setfacl", requiredFlags: ["-b"], requiredValues: ["/test/file"] },
                    { command: "setfacl", requiredFlags: ["--remove-all"], requiredValues: ["/test/file"] }
                ],
                allowedPreChecks: [
                    { command: "getfacl", requiredValues: ["/test/file"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/test/file"] }
                ],
                explanation: "setfacl -b removes all ACL entries, reverting to standard Unix permissions only.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify /test/file has no ACLs remaining.",
                expected: [
                    { command: "getfacl", requiredValues: ["/test/file"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/test/file"] }
                ],
                explanation: "getfacl should show no extended ACLs. No '+' symbol in 'ls -l' output.",
                points: 3
            }
        ],
        
        // Set 4: Hard and soft links
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a hard link named /tmp/report-link pointing to /opt/data/report.txt.",
                expected: {
                    command: "ln",
                    requiredValues: ["/opt/data/report.txt", "/tmp/report-link"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/opt/data/report.txt"] },
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/tmp/report-link"] },
                    { command: "stat", requiredValues: ["/opt/data/report.txt"] }
                ],
                explanation: "Hard links share the same inode. Both files are equal references to the same data.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify both files share the same inode number.",
                expected: [
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/opt/data/report.txt"] },
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/tmp/report-link"] },
                    { command: "stat", requiredValues: ["/opt/data/report.txt"] },
                    { command: "stat", requiredValues: ["/tmp/report-link"] }
                ],
                explanation: "ls -li shows inode numbers (first column). Hard links have identical inodes.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create a symbolic link /home/user/docs pointing to /mnt/shared/documents.",
                expected: {
                    command: "ln",
                    requiredFlags: ["-s"],
                    requiredValues: ["/mnt/shared/documents", "/home/user/docs"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/home/user/docs"] },
                    { command: "readlink", requiredValues: ["/home/user/docs"] }
                ],
                explanation: "Symbolic links (-s) are like shortcuts, storing the path to target file.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify /home/user/docs is a symbolic link pointing to correct target.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/home/user/docs"] },
                    { command: "readlink", requiredValues: ["/home/user/docs"] },
                    { command: "file", requiredValues: ["/home/user/docs"] }
                ],
                explanation: "ls -l shows 'lrwxrwxrwx' and arrow pointing to target. readlink displays target path.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create hard link /backup/config.conf pointing to /etc/app/config.conf.",
                expected: {
                    command: "ln",
                    requiredValues: ["/etc/app/config.conf", "/backup/config.conf"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/etc/app/config.conf"] },
                    { command: "ls", requiredFlags: ["-li"], requiredValues: ["/backup/config.conf"] }
                ],
                explanation: "Hard links provide backup and access from multiple locations without duplication.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Count the number of hard links to /etc/app/config.conf.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/app/config.conf"] },
                    { command: "stat", requiredValues: ["/etc/app/config.conf"] }
                ],
                explanation: "The second column in 'ls -l' shows link count. stat shows 'Links:' value.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Create symbolic link /usr/local/bin/python pointing to /usr/bin/python3.",
                expected: {
                    command: "ln",
                    requiredFlags: ["-s"],
                    requiredValues: ["/usr/bin/python3", "/usr/local/bin/python"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/usr/local/bin/python"] },
                    { command: "readlink", requiredValues: ["/usr/local/bin/python"] }
                ],
                explanation: "Symlinks allow version-agnostic command names pointing to specific versions.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify the symlink resolves correctly and show target.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/usr/local/bin/python"] },
                    { command: "readlink", requiredFlags: ["-f"], requiredValues: ["/usr/local/bin/python"] },
                    { command: "file", requiredValues: ["/usr/local/bin/python"] }
                ],
                explanation: "readlink -f follows the link to show canonical absolute path.",
                points: 2
            }
        ],
        
        // Set 5: umask and default permissions
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Display the current umask value.",
                expected: [
                    { command: "umask", requiredValues: [] },
                    { command: "umask", requiredFlags: ["-S"], requiredValues: [] }
                ],
                explanation: "umask shows default permission mask (usually 0022). -S shows symbolic notation.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Set umask to 0027 for the current session.",
                expected: {
                    command: "umask",
                    requiredValues: ["0027"]
                },
                allowedPreChecks: [
                    { command: "umask", requiredValues: [] }
                ],
                explanation: "umask 0027 removes write/execute for others, read/write/execute for group gets restricted.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify umask is now 0027.",
                expected: [
                    { command: "umask", requiredValues: [] },
                    { command: "umask", requiredFlags: ["-S"], requiredValues: [] }
                ],
                explanation: "New umask affects permissions of newly created files and directories.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create test file /tmp/umask-test.txt to verify umask effect.",
                expected: {
                    command: "touch",
                    requiredValues: ["/tmp/umask-test.txt"]
                },
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/umask-test.txt"] }
                ],
                explanation: "Files created with umask 0027 will have 640 permissions (rw-r-----).",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Check permissions of the newly created umask-test.txt file.",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/umask-test.txt"] },
                    { command: "stat", requiredValues: ["/tmp/umask-test.txt"] }
                ],
                explanation: "With umask 0027, new files get 640 (666-027=640), new dirs get 750 (777-027=750).",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Find all files in /var/log with world-writable permissions (security risk).",
                expected: [
                    { command: "find", requiredFlags: ["/var/log", "-perm"], requiredValues: ["-002"] },
                    { command: "find", requiredFlags: ["/var/log", "-perm"], requiredValues: ["/002"] }
                ],
                allowedPreChecks: [
                    { command: "find", requiredFlags: ["/var/log", "-type"], requiredValues: ["f"] }
                ],
                explanation: "find -perm -002 finds files where others have write permission (security issue).",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "List files in /tmp with setuid or setgid bit set.",
                expected: [
                    { command: "find", requiredFlags: ["/tmp", "-perm"], requiredValues: ["-4000"] },
                    { command: "find", requiredFlags: ["/tmp", "-perm"], requiredValues: ["-2000"] },
                    { command: "find", requiredFlags: ["/tmp", "-perm"], requiredValues: ["-6000"] }
                ],
                explanation: "4000 is setuid, 2000 is setgid. -6000 finds files with either bit set.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Reset umask to default value 0022.",
                expected: {
                    command: "umask",
                    requiredValues: ["0022"]
                },
                allowedPreChecks: [
                    { command: "umask", requiredValues: [] }
                ],
                explanation: "umask 0022 is standard default: files get 644, directories get 755.",
                points: 2
            }
        ],
        
        // Set 6: Permission diagnosis and troubleshooting
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Find all files owned by user 'olduser' in /home and save list to /tmp/olduser-files.txt.",
                expected: {
                    command: "find",
                    requiredFlags: ["/home", "-user"],
                    requiredValues: ["olduser", ">", "/tmp/olduser-files.txt"]
                },
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/olduser-files.txt"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/olduser-files.txt"] }
                ],
                explanation: "find -user locates files by owner name. Essential for user cleanup or migration.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the list of files owned by olduser.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/olduser-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/olduser-files.txt"] }
                ],
                explanation: "Review found files before performing batch operations.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Recursively change ownership of /data/project to user 'developer' and group 'devteam'.",
                expected: [
                    { command: "chown", requiredFlags: ["-R"], requiredValues: ["developer:devteam", "/data/project"] },
                    { command: "chown", requiredFlags: ["-R"], requiredValues: ["developer", "/data/project"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/data/project"] }
                ],
                explanation: "-R recursively applies ownership changes to all files and subdirectories.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify ownership changes were applied recursively.",
                expected: [
                    { command: "ls", requiredFlags: ["-lR"], requiredValues: ["/data/project"] },
                    { command: "find", requiredFlags: ["/data/project", "-ls"], requiredValues: [] }
                ],
                explanation: "ls -lR shows recursive listing with ownership. find -ls provides detailed output.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Recursively set permissions 750 on all directories under /opt/app.",
                expected: {
                    command: "find",
                    requiredFlags: ["/opt/app", "-type", "d", "-exec"],
                    requiredValues: ["chmod", "750", "{}", "\\;"]
                },
                allowedPreChecks: [
                    { command: "find", requiredFlags: ["/opt/app", "-type"], requiredValues: ["d"] }
                ],
                explanation: "find with -exec applies commands to found items. -type d targets only directories.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify all directories under /opt/app have 750 permissions.",
                expected: [
                    { command: "find", requiredFlags: ["/opt/app", "-type", "d"], requiredValues: [] },
                    { command: "find", requiredFlags: ["/opt/app", "-type", "d", "-ls"], requiredValues: [] }
                ],
                explanation: "find -ls shows permissions. All directories should show drwxr-x---.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Find files in /var/www that are NOT owned by user 'apache' and save to /tmp/wrong-owner.txt.",
                expected: {
                    command: "find",
                    requiredFlags: ["/var/www", "!-user"],
                    requiredValues: ["apache", ">", "/tmp/wrong-owner.txt"]
                },
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/wrong-owner.txt"] }
                ],
                explanation: "! negates the condition. !-user apache finds files owned by anyone except apache.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Review the list of incorrectly owned files.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/wrong-owner.txt"] },
                    { command: "less", requiredValues: ["/tmp/wrong-owner.txt"] },
                    { command: "wc", requiredFlags: ["-l"], requiredValues: ["/tmp/wrong-owner.txt"] }
                ],
                explanation: "wc -l counts how many files need ownership correction.",
                points: 2
            }
        ]
    }
};
