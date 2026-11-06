/**
 * Section 4: Essential Tools
 * 3 unique question sets for practice variety
 */

const section1Data = {
    id: 1,
    title: "Essential Tools",
    description: "Master command-line tools: find, grep, tar, text processing, and I/O redirection",
    totalPoints: 30,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Find all .log files in /var and save the list to /tmp/logfiles.txt",
                expected: [
                    { command: "find", requiredFlags: ["-name"], requiredValues: ["/var", "*.log", ">", "/tmp/logfiles.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/logfiles.txt"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/logfiles.txt"] }
                ],
                explanation: "find searches directories recursively. Use -name with wildcards and redirect with >. Quote wildcards to prevent shell expansion.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the log files list from /tmp/logfiles.txt",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/logfiles.txt"] },
                    { command: "less", requiredValues: ["/tmp/logfiles.txt"] },
                    { command: "more", requiredValues: ["/tmp/logfiles.txt"] }
                ],
                explanation: "cat shows entire file, less/more allow scrolling through large files.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Search /etc/hosts for localhost and save result to /tmp/localhost-line.txt",
                expected: [
                    { command: "grep", requiredValues: ["localhost", "/etc/hosts", ">", "/tmp/localhost-line.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/localhost-line.txt"] },
                    { command: "grep", requiredValues: ["localhost", "/etc/hosts"] }
                ],
                explanation: "grep searches for patterns in files. Redirect output with > to save matches.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "View the localhost information that was saved",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/localhost-line.txt"] },
                    { command: "less", requiredValues: ["/tmp/localhost-line.txt"] }
                ],
                explanation: "Verify grep output was correctly saved by viewing file contents.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create a compressed tar archive of /etc/httpd as /tmp/httpd-config.tar.gz",
                expected: [
                    { command: "tar", requiredFlags: ["-czf"], requiredValues: ["/tmp/httpd-config.tar.gz", "/etc/httpd"] },
                    { command: "tar", requiredFlags: ["-czvf"], requiredValues: ["/tmp/httpd-config.tar.gz", "/etc/httpd"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l", "-h"], requiredValues: ["/tmp/httpd-config.tar.gz"] }
                ],
                explanation: "tar -czf creates gzipped archives. -c=create, -z=gzip, -f=filename.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "List the contents of httpd-config.tar.gz without extracting",
                expected: [
                    { command: "tar", requiredFlags: ["-t", "-z", "-f"], requiredValues: ["/tmp/httpd-config.tar.gz"] },
                    { command: "tar", requiredFlags: ["-t", "-z", "-v", "-f"], requiredValues: ["/tmp/httpd-config.tar.gz"] }
                ],
                explanation: "tar -tzf lists archive contents. -t=list, -z=gzip, -f=file.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Find all files larger than 10MB in /home and save to /tmp/large-files.txt",
                expected: [
                    { command: "find", requiredFlags: ["-size"], requiredValues: ["/home", "+10M", ">", "/tmp/large-files.txt"] },
                    { command: "find", requiredFlags: ["-type", "-size"], requiredValues: ["/home", "f", "+10M", ">", "/tmp/large-files.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/large-files.txt"] }
                ],
                explanation: "find -size +10M finds files larger than 10 megabytes.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Display the list of large files found",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/large-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/large-files.txt"] }
                ],
                explanation: "View the results of your size-based find command.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Count lines in /etc/services and save to /tmp/services-count.txt",
                expected: [
                    { command: "wc", requiredFlags: ["-l"], requiredValues: ["/etc/services", ">", "/tmp/services-count.txt"] },
                    { command: "cat", requiredValues: ["/etc/services", "|", "wc", "-l", ">", "/tmp/services-count.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/services-count.txt"] }
                ],
                explanation: "wc -l counts lines in files. Essential for analyzing file contents.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display the services line count",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/services-count.txt"] },
                    { command: "less", requiredValues: ["/tmp/services-count.txt"] }
                ],
                explanation: "View the count of services entries from /etc/services.",
                points: 4
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Find all files modified in the last 7 days in /opt and save to /tmp/recent-files.txt",
                expected: [
                    { command: "find", requiredFlags: ["-mtime", "-7"], requiredValues: ["/opt", ">", "/tmp/recent-files.txt"] },
                    { command: "find", requiredFlags: ["-mtime", "-type", "-7"], requiredValues: ["/opt", "f", ">", "/tmp/recent-files.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/recent-files.txt"] }
                ],
                explanation: "find -mtime -7 finds files modified within last 7 days. Critical for tracking changes.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the recently modified files list",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/recent-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/recent-files.txt"] }
                ],
                explanation: "Review files modified in the specified timeframe.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Search for the word 'error' in /var/log/messages (case-insensitive) and save to /tmp/errors.txt",
                expected: [
                    { command: "grep", requiredFlags: ["-i"], requiredValues: ["error", "/var/log/messages", ">", "/tmp/errors.txt"] },
                    { command: "grep", requiredFlags: ["--ignore-case"], requiredValues: ["error", "/var/log/messages", ">", "/tmp/errors.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/errors.txt"] },
                    { command: "wc", requiredFlags: ["-l"], requiredValues: ["/tmp/errors.txt"] }
                ],
                explanation: "grep -i performs case-insensitive searches. Essential for log analysis.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Count how many error lines were found",
                expected: [
                    { command: "wc", requiredFlags: ["-l"], requiredValues: ["/tmp/errors.txt"] },
                    { command: "cat", requiredValues: ["/tmp/errors.txt"] }
                ],
                explanation: "Use wc -l to count log error occurrences.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Extract the contents of /tmp/backup.tar.bz2 to /restore",
                expected: [
                    { command: "tar", requiredFlags: ["-x", "-j", "-f", "-C"], requiredValues: ["/tmp/backup.tar.bz2", "/restore"] },
                    { command: "tar", requiredFlags: ["-x", "-j", "-f"], requiredValues: ["/tmp/backup.tar.bz2", "-C", "/restore"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/restore"] }
                ],
                explanation: "tar -xjf extracts bzip2 archives. -C specifies extraction directory.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify extraction by listing /restore contents",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/restore"] },
                    { command: "ls", requiredFlags: ["-l", "-R"], requiredValues: ["/restore"] }
                ],
                explanation: "Confirm files were extracted to the correct location.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Find all empty regular files in /tmp and save their absolute paths to /tmp/empty-files.txt",
                expected: [
                    { command: "find", requiredFlags: ["-type", "-empty"], requiredValues: ["/tmp", "f", ">", "/tmp/empty-files.txt"] },
                    { command: "find", requiredFlags: ["-empty", "-type"], requiredValues: ["/tmp", "f", ">", "/tmp/empty-files.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/empty-files.txt"] }
                ],
                explanation: "find -empty locates zero-byte files. Useful for cleanup operations.",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Display the list of empty files found",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/empty-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/empty-files.txt"] }
                ],
                explanation: "Review empty files before deletion.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Count the number of running processes and save to /tmp/process-count.txt",
                expected: [
                    { command: "ps", requiredValues: ["aux", "|", "wc", "-l", ">", "/tmp/process-count.txt"] },
                    { command: "ps", requiredFlags: ["-e", "-f"], requiredValues: ["|", "wc", "-l", ">", "/tmp/process-count.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/process-count.txt"] }
                ],
                explanation: "Pipe ps output to wc -l to count running processes. Use 'ps aux' (BSD style) or 'ps -ef' (UNIX style).",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display the process count",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/process-count.txt"] }
                ],
                explanation: "View the total number of running processes.",
                points: 4
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Find all files owned by user 'webuser' in /srv and save to /tmp/webuser-files.txt",
                expected: [
                    { command: "find", requiredFlags: ["-user"], requiredValues: ["/srv", "webuser", ">", "/tmp/webuser-files.txt"] },
                    { command: "find", requiredFlags: ["-user", "-type"], requiredValues: ["/srv", "webuser", "f", ">", "/tmp/webuser-files.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/webuser-files.txt"] }
                ],
                explanation: "find -user searches by file ownership. Critical for audit and security.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Display files owned by webuser",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/webuser-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/webuser-files.txt"] }
                ],
                explanation: "Review file ownership results.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Search for lines containing 'Failed password' in /var/log/secure and count them, saving the result to /tmp/failed-login-count.txt",
                expected: [
                    { command: "grep", requiredFlags: ["-c"], requiredValues: ["Failed password", "/var/log/secure", ">", "/tmp/failed-login-count.txt"] },
                    { command: "grep", requiredValues: ["Failed password", "/var/log/secure", "|", "wc", "-l", ">", "/tmp/failed-login-count.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/failed-login-count.txt"] }
                ],
                explanation: "grep -c counts matches or pipe to wc -l. Must save result to file with >. Use quotes around 'Failed password' to treat it as one argument.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Display the failed login attempt count",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/failed-login-count.txt"] }
                ],
                explanation: "View security metrics from log analysis.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create a tar archive with xz compression of /etc/nginx as /tmp/nginx-backup.tar.xz",
                expected: [
                    { command: "tar", requiredFlags: ["-c", "-J", "-f"], requiredValues: ["/tmp/nginx-backup.tar.xz", "/etc/nginx"] },
                    { command: "tar", requiredFlags: ["-c", "-J", "-v", "-f"], requiredValues: ["/tmp/nginx-backup.tar.xz", "/etc/nginx"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l", "-h"], requiredValues: ["/tmp/nginx-backup.tar.xz"] }
                ],
                explanation: "tar -cJf uses xz compression. Offers best compression ratio.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "List contents of nginx-backup.tar.xz",
                expected: [
                    { command: "tar", requiredFlags: ["-t", "-J", "-f"], requiredValues: ["/tmp/nginx-backup.tar.xz"] },
                    { command: "tar", requiredFlags: ["-t", "-J", "-v", "-f"], requiredValues: ["/tmp/nginx-backup.tar.xz"] }
                ],
                explanation: "tar -tJf lists xz-compressed archives.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Find all files with permissions 777 in /var/www and save to /tmp/insecure-files.txt",
                expected: [
                    { command: "find", requiredFlags: ["-perm"], requiredValues: ["/var/www", "777", ">", "/tmp/insecure-files.txt"] },
                    { command: "find", requiredFlags: ["-perm", "-777"], requiredValues: ["/var/www", ">", "/tmp/insecure-files.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/insecure-files.txt"] }
                ],
                explanation: "find -perm searches by permissions. 777 is world-writable (insecure).",
                points: 4
            },
            {
                id: 8,
                category: "Audit",
                description: "Display the insecure files list",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/insecure-files.txt"] },
                    { command: "less", requiredValues: ["/tmp/insecure-files.txt"] }
                ],
                explanation: "Review files with potentially insecure permissions.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Get the total disk space used by /var/log and save to /tmp/log-size.txt",
                expected: [
                    { command: "du", requiredFlags: ["-s", "-h"], requiredValues: ["/var/log", ">", "/tmp/log-size.txt"] },
                    { command: "du", requiredFlags: ["-s", "-h"], requiredValues: ["/var/log", "|", "tee", "/tmp/log-size.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/log-size.txt"] }
                ],
                explanation: "du -sh shows summary of disk usage in human-readable format.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display the log directory size",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/log-size.txt"] }
                ],
                explanation: "View total disk space consumed by logs.",
                points: 4
            }
        ],
        
        // Set 4: System documentation
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "Display the manual page for the 'useradd' command.",
                expected: [
                    { command: "man", requiredValues: ["useradd"] },
                    { command: "man", requiredFlags: ["1"], requiredValues: ["useradd"] }
                ],
                explanation: "man displays manual pages. Essential for learning command syntax and options.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Search for commands related to 'network' in manual pages.",
                expected: [
                    { command: "apropos", requiredValues: ["network"] },
                    { command: "man", requiredFlags: ["-k"], requiredValues: ["network"] }
                ],
                allowedPreChecks: [
                    { command: "whatis", requiredValues: ["apropos"] }
                ],
                explanation: "apropos (or man -k) searches manual page descriptions for keywords.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display one-line description of 'systemctl' command.",
                expected: [
                    { command: "whatis", requiredValues: ["systemctl"] },
                    { command: "man", requiredFlags: ["-f"], requiredValues: ["systemctl"] }
                ],
                explanation: "whatis (or man -f) shows brief description from NAME section of manual.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "View the information page for 'bash'.",
                expected: [
                    { command: "info", requiredValues: ["bash"] }
                ],
                allowedPreChecks: [
                    { command: "which", requiredValues: ["info"] }
                ],
                explanation: "info pages provide detailed GNU documentation in hyperlinked format.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "List available documentation in /usr/share/doc for 'systemd'.",
                expected: [
                    { command: "ls", requiredValues: ["/usr/share/doc/systemd"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/usr/share/doc/systemd"] }
                ],
                explanation: "/usr/share/doc contains README files, examples, changelogs for packages.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Search manual pages for commands that mention 'firewall'.",
                expected: [
                    { command: "apropos", requiredValues: ["firewall"] },
                    { command: "man", requiredFlags: ["-k"], requiredValues: ["firewall"] }
                ],
                allowedPreChecks: [
                    { command: "apropos", requiredFlags: ["-l"], requiredValues: [] }
                ],
                explanation: "Use apropos to discover commands related to specific tasks.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Display manual page for /etc/fstab configuration file.",
                expected: [
                    { command: "man", requiredValues: ["fstab"] },
                    { command: "man", requiredFlags: ["5"], requiredValues: ["fstab"] }
                ],
                explanation: "Section 5 covers file formats. man 5 fstab shows fstab syntax and options.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Show all manual page sections for 'passwd'.",
                expected: [
                    { command: "man", requiredFlags: ["-w", "-a"], requiredValues: ["passwd"] },
                    { command: "whatis", requiredValues: ["passwd"] }
                ],
                allowedPreChecks: [
                    { command: "man", requiredFlags: ["1"], requiredValues: ["passwd"] },
                    { command: "man", requiredFlags: ["5"], requiredValues: ["passwd"] }
                ],
                explanation: "passwd has multiple sections: (1) command, (5) file format. -wa shows all.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "List the documentation files in /usr/share/doc/openssh.",
                expected: [
                    { command: "ls", requiredValues: ["/usr/share/doc/openssh"] }
                ],
                explanation: "Package documentation often contains important configuration examples.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Update manual page database (for apropos/whatis).",
                expected: [
                    { command: "mandb", requiredValues: [] },
                    { command: "makewhatis", requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "apropos", requiredValues: [] }
                ],
                explanation: "mandb rebuilds whatis database. Run after installing new packages.",
                points: 3
            }
        ],
        
        // Set 5: Text editor basics
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Check if vi/vim is installed on the system.",
                expected: [
                    { command: "which", requiredValues: ["vi"] },
                    { command: "which", requiredValues: ["vim"] },
                    { command: "type", requiredValues: ["vi"] },
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["vim"] }
                ],
                explanation: "vi is mandatory RHCSA skill. which shows path if installed.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Create file /tmp/vitest.txt containing the line 'Hello RHCSA' (open it with vi, or write it from the command line).",
                expected: [
                    { command: "vi", requiredValues: ["/tmp/vitest.txt"] },
                    { command: "vim", requiredValues: ["/tmp/vitest.txt"] },
                    { command: "echo", requiredValues: ["Hello RHCSA", ">", "/tmp/vitest.txt"] },
                    { command: "printf", requiredValues: ["Hello RHCSA", ">", "/tmp/vitest.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "In vi: press 'i' for insert mode, type text, ESC key, :wq to save.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify the file content.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] },
                    { command: "less", requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "File should contain 'Hello RHCSA'.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "List all text editors installed on the system.",
                expected: [
                    { command: "rpm", requiredFlags: ["-q", "-a"], requiredValues: ["|", "grep", "editor"] },
                    { command: "rpm", requiredFlags: ["-q", "-a"], requiredValues: ["|", "grep", "vim"] },
                    { command: "yum", requiredValues: ["list", "installed", "|", "grep", "editor"] }
                ],
                allowedPreChecks: [
                    { command: "which", requiredValues: ["nano"] },
                    { command: "which", requiredValues: ["vi"] }
                ],
                explanation: "Common editors: vi/vim (mandatory), nano, emacs, gedit.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Check the version of vi/vim installed.",
                expected: [
                    { command: "vim", requiredFlags: ["--version"], requiredValues: [] },
                    { command: "vi", requiredFlags: ["--version"], requiredValues: [] }
                ],
                explanation: "Shows vim version and compile options. Useful for troubleshooting.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Edit /tmp/vitest.txt and append line 'Line 2' using sed.",
                expected: [
                    { command: "echo", requiredValues: ["Line 2", ">>", "/tmp/vitest.txt"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["a\\Line 2", "/tmp/vitest.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "sed -i edits files in place. 'a' appends text. Use quotes around 'Line 2' for echo.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify the file now has two lines.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] },
                    { command: "wc", requiredFlags: ["-l"], requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "wc -l counts lines. Should show 2.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Replace 'Hello' with 'Welcome' in /tmp/vitest.txt using sed.",
                expected: [
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["s/Hello/Welcome/", "/tmp/vitest.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "sed s/old/new/ performs substitution. -i modifies file directly.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Confirm the replacement was successful.",
                expected: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] },
                    { command: "grep", requiredValues: ["Welcome", "/tmp/vitest.txt"] }
                ],
                explanation: "File should now contain 'Welcome RHCSA'.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Delete all lines containing 'Line' from /tmp/vitest.txt using sed.",
                expected: [
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["/Line/d", "/tmp/vitest.txt"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/vitest.txt"] }
                ],
                explanation: "sed /pattern/d deletes matching lines. Useful for log cleanup.",
                points: 3
            }
        ],
        
        // Set 6: Advanced grep and text processing
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Search for the word 'error' (case insensitive) in /var/log/messages.",
                expected: [
                    { command: "grep", requiredFlags: ["-i"], requiredValues: ["error", "/var/log/messages"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/var/log/messages"] }
                ],
                explanation: "grep -i ignores case differences. Essential for log analysis.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Count how many times 'error' appears in /var/log/messages.",
                expected: [
                    { command: "grep", requiredFlags: ["-i", "-c"], requiredValues: ["error", "/var/log/messages"] },
                    { command: "grep", requiredFlags: ["-i"], requiredValues: ["error", "/var/log/messages", "|", "wc", "-l"] }
                ],
                explanation: "grep -c counts matching lines. Pipe to wc -l also works.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Search recursively for 'TODO' in all files under /opt/app.",
                expected: [
                    { command: "grep", requiredFlags: ["-r"], requiredValues: ["TODO", "/opt/app"] },
                    { command: "grep", requiredFlags: ["-R"], requiredValues: ["TODO", "/opt/app"] }
                ],
                allowedPreChecks: [
                    { command: "find", requiredValues: ["/opt/app"] }
                ],
                explanation: "grep -r searches directories recursively. Useful for code searches.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Show only filenames containing 'TODO' in /opt/app.",
                expected: [
                    { command: "grep", requiredFlags: ["-r", "-l"], requiredValues: ["TODO", "/opt/app"] }
                ],
                explanation: "grep -l shows only filenames, not matching lines. Good for investigations.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Search for lines starting with 'error' or 'warning' in /var/log/app.log.",
                expected: [
                    { command: "grep", requiredFlags: ["-E"], requiredValues: ["^(error|warning)", "/var/log/app.log"] },
                    { command: "egrep", requiredValues: ["^(error|warning)", "/var/log/app.log"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/var/log/app.log"] }
                ],
                explanation: "grep -E enables extended regex. ^ anchors to line start, | means OR. Quote the pattern.",
                points: 4
            },
            {
                id: 6,
                category: "Audit",
                description: "Display lines with line numbers containing 'fail' in /var/log/auth.log.",
                expected: [
                    { command: "grep", requiredFlags: ["-n"], requiredValues: ["fail", "/var/log/auth.log"] }
                ],
                explanation: "grep -n shows line numbers. Helpful for identifying log entry positions.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Find lines NOT containing 'success' in /tmp/test.log.",
                expected: [
                    { command: "grep", requiredFlags: ["-v"], requiredValues: ["success", "/tmp/test.log"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/tmp/test.log"] }
                ],
                explanation: "grep -v inverts match, showing non-matching lines.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Search for IP addresses (pattern: xxx.xxx.xxx.xxx) in /var/log/secure.",
                expected: [
                    { command: "grep", requiredFlags: ["-E"], requiredValues: ["[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}", "/var/log/secure"] },
                    { command: "grep", requiredFlags: ["-E", "-o"], requiredValues: ["[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}", "/var/log/secure"] }
                ],
                explanation: "grep -E with regex pattern matches IP addresses. -o shows only matching part.",
                points: 4
            },
            {
                id: 9,
                category: "Implementation",
                description: "Show 3 lines before and after each match of 'kernel panic' in /var/log/messages.",
                expected: [
                    { command: "grep", requiredFlags: ["-C", "3"], requiredValues: ["kernel panic", "/var/log/messages"] },
                    { command: "grep", requiredFlags: ["-C3"], requiredValues: ["kernel panic", "/var/log/messages"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["kernel panic", "/var/log/messages"] }
                ],
                explanation: "grep -C shows context: -C 3 shows 3 lines before and after match. Use quotes around 'kernel panic'.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Extract all email addresses from /tmp/contacts.txt using grep.",
                expected: [
                    { command: "grep", requiredFlags: ["-E", "-o"], requiredValues: ["[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", "/tmp/contacts.txt"] }
                ],
                explanation: "grep -E with email regex pattern. -o shows only matching email addresses.",
                points: 4
            }
        ]
    }
};
