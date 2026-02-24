const section11Data = {
    id: 11,
    title: "SELinux Security",
    description: "Understand and Configure SELinux",
    totalPoints: 26,
    questionSets: {
        // Set 1: SELinux basics and modes
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "Display current SELinux status and mode.",
                expected: [
                    { command: "getenforce", requiredValues: [] },
                    { command: "sestatus", requiredValues: [] }
                ],
                explanation: "SELinux modes: Enforcing (active), Permissive (logs only), Disabled.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Temporarily set SELinux to permissive mode.",
                expected: [
                    { command: "setenforce", requiredValues: ["0"] },
                    { command: "setenforce", requiredValues: ["Permissive"] }
                ],
                allowedPreChecks: [
                    { command: "getenforce", requiredValues: [] }
                ],
                explanation: "setenforce 0 or Permissive temporarily changes mode until reboot.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify SELinux mode changed to permissive.",
                expected: [
                    { command: "getenforce", requiredValues: [] },
                    { command: "sestatus", requiredValues: [] }
                ],
                explanation: "Should display 'Permissive' instead of 'Enforcing'.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Set SELinux back to enforcing mode.",
                expected: [
                    { command: "setenforce", requiredValues: ["1"] },
                    { command: "setenforce", requiredValues: ["Enforcing"] }
                ],
                allowedPreChecks: [
                    { command: "getenforce", requiredValues: [] }
                ],
                explanation: "setenforce 1 or Enforcing activates SELinux policy enforcement.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Display SELinux configuration file.",
                expected: [
                    { command: "cat", requiredValues: ["/etc/selinux/config"] },
                    { command: "less", requiredValues: ["/etc/selinux/config"] }
                ],
                explanation: "/etc/selinux/config controls persistent SELinux mode at boot.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Configure SELinux to start in enforcing mode at boot.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/selinux/config"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^SELINUX=.*/SELINUX=enforcing/'", "/etc/selinux/config"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/selinux/config"] }
                ],
                explanation: "SELINUX=enforcing in config ensures mode persists across reboots.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Display SELinux policy type.",
                expected: [
                    { command: "sestatus", requiredValues: [] },
                    { command: "grep", requiredValues: ["SELINUXTYPE", "/etc/selinux/config"] }
                ],
                explanation: "RHEL uses 'targeted' policy (protects network services).",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Check if SELinux is causing issues with a service.",
                expected: [
                    { command: "ausearch", requiredFlags: ["-m"], requiredValues: ["avc", "-ts", "recent"] },
                    { command: "grep", requiredValues: ["denied", "/var/log/audit/audit.log"] }
                ],
                allowedPreChecks: [
                    { command: "tail", requiredValues: ["/var/log/audit/audit.log"] }
                ],
                explanation: "AVC (Access Vector Cache) denials indicate SELinux blocks.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "Display SELinux booleans related to httpd.",
                expected: [
                    { command: "getsebool", requiredFlags: ["-a"], requiredValues: ["|", "grep", "httpd"] },
                    { command: "semanage", requiredValues: ["boolean", "-l", "|", "grep", "httpd"] }
                ],
                explanation: "Booleans enable/disable specific SELinux features without policy changes.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Display all SELinux contexts for files in /var/www/html.",
                expected: [
                    { command: "ls", requiredFlags: ["-Z"], requiredValues: ["/var/www/html"] },
                    { command: "ls", requiredFlags: ["-lZ"], requiredValues: ["/var/www/html"] }
                ],
                allowedPreChecks: [],
                explanation: "The -Z flag displays SELinux security context labels.",
                points: 2
            }
        ],
        
        // Set 2: SELinux contexts
        set2: [
            {
                id: 1,
                category: "Audit",
                description: "Display SELinux context of /var/www/html directory.",
                expected: [
                    { command: "ls", requiredFlags: ["-Zd"], requiredValues: ["/var/www/html"] },
                    { command: "stat", requiredValues: ["/var/www/html"] }
                ],
                explanation: "Context format: user:role:type:level. Type is most important.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Change SELinux context type of /var/www/html/index.html to httpd_sys_content_t.",
                expected: [
                    { command: "chcon", requiredFlags: ["-t"], requiredValues: ["httpd_sys_content_t", "/var/www/html/index.html"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-Z"], requiredValues: ["/var/www/html/index.html"] }
                ],
                explanation: "chcon temporarily changes context. Won't survive relabel.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify context change was applied.",
                expected: [
                    { command: "ls", requiredFlags: ["-Z"], requiredValues: ["/var/www/html/index.html"] }
                ],
                explanation: "Context should now show httpd_sys_content_t type.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Copy file preserving SELinux context.",
                expected: [
                    { command: "cp", requiredFlags: ["--preserve=context"], requiredValues: ["/tmp/file.txt", "/var/www/html/"] },
                    { command: "cp", requiredFlags: ["-Z"], requiredValues: ["/tmp/file.txt", "/var/www/html/"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-Z"], requiredValues: ["/tmp/file.txt"] }
                ],
                explanation: "--preserve=context keeps source context. Default inherits destination context.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Display default SELinux context for /var/www/html directory.",
                expected: [
                    { command: "semanage", requiredValues: ["fcontext", "-l", "|", "grep", "/var/www"] },
                    { command: "matchpathcon", requiredValues: ["/var/www/html"] }
                ],
                explanation: "semanage fcontext shows policy-defined default contexts.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Set default context for /web directory to match /var/www.",
                expected: [
                    { command: "semanage", requiredValues: ["fcontext", "-a", "-t", "httpd_sys_content_t", "/web(/.*)?"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["fcontext", "-l", "|", "grep", "/web"] }
                ],
                explanation: "semanage fcontext -a adds persistent context rule. (/.*)}? applies to all contents.",
                points: 4
            },
            {
                id: 7,
                category: "Audit",
                description: "Apply default contexts to /web directory recursively.",
                expected: [
                    { command: "restorecon", requiredFlags: ["-Rv"], requiredValues: ["/web"] }
                ],
                explanation: "restorecon applies default policy contexts. -R recursive, -v verbose.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Display process SELinux context for httpd service.",
                expected: [
                    { command: "ps", requiredFlags: ["auxZ"], requiredValues: ["|", "grep", "httpd"] },
                    { command: "ps", requiredFlags: ["-eZ"], requiredValues: ["|", "grep", "httpd"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "httpd"] }
                ],
                explanation: "Processes run in specific domains (e.g., httpd_t).",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Find all files with SELinux context type user_home_t in /tmp.",
                expected: [
                    { command: "find", requiredValues: ["/tmp", "-context", "*:user_home_t:*"] },
                    { command: "find", requiredValues: ["/tmp", "-context", "user_home_t"] }
                ],
                explanation: "find -context searches by SELinux context patterns.",
                points: 3
            },
            {
                id: 10,
                category: "Implementation",
                description: "Recursively change context of /opt/app to match /usr/share.",
                expected: [
                    { command: "chcon", requiredFlags: ["-R", "--reference=/usr/share"], requiredValues: ["/opt/app"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-Zd"], requiredValues: ["/usr/share"] }
                ],
                explanation: "--reference copies context from another file/directory.",
                points: 4
            }
        ],
        
        // Set 3: SELinux booleans
        set3: [
            {
                id: 1,
                category: "Audit",
                description: "Display all SELinux booleans and their status.",
                expected: [
                    { command: "getsebool", requiredFlags: ["-a"], requiredValues: [] },
                    { command: "semanage", requiredValues: ["boolean", "-l"] }
                ],
                explanation: "Booleans toggle SELinux features on/off. Hundreds available.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Check status of httpd_can_network_connect boolean.",
                expected: [
                    { command: "getsebool", requiredValues: ["httpd_can_network_connect"] }
                ],
                allowedPreChecks: [
                    { command: "getsebool", requiredFlags: ["-a"], requiredValues: ["|", "grep", "httpd"] }
                ],
                explanation: "This boolean allows httpd to make network connections.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Enable httpd_can_network_connect temporarily.",
                expected: [
                    { command: "setsebool", requiredValues: ["httpd_can_network_connect", "on"] },
                    { command: "setsebool", requiredValues: ["httpd_can_network_connect", "1"] }
                ],
                explanation: "Without -P, change is temporary (lost on reboot).",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Verify the boolean was enabled.",
                expected: [
                    { command: "getsebool", requiredValues: ["httpd_can_network_connect"] }
                ],
                allowedPreChecks: [],
                explanation: "Should show 'httpd_can_network_connect --> on'.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Enable httpd_can_network_connect permanently.",
                expected: [
                    { command: "setsebool", requiredFlags: ["-P"], requiredValues: ["httpd_can_network_connect", "on"] }
                ],
                explanation: "-P makes change persistent across reboots. Takes longer to apply.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Check if ftpd_anon_write boolean is enabled.",
                expected: [
                    { command: "getsebool", requiredValues: ["ftpd_anon_write"] }
                ],
                allowedPreChecks: [
                    { command: "getsebool", requiredFlags: ["-a"], requiredValues: ["|", "grep", "ftp"] }
                ],
                explanation: "Controls whether FTP allows anonymous write access.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Display description of httpd_enable_homedirs boolean.",
                expected: [
                    { command: "semanage", requiredValues: ["boolean", "-l", "|", "grep", "httpd_enable_homedirs"] }
                ],
                explanation: "semanage boolean -l shows descriptions for each boolean.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Enable httpd to access user home directories (httpd_enable_homedirs).",
                expected: [
                    { command: "setsebool", requiredFlags: ["-P"], requiredValues: ["httpd_enable_homedirs", "on"] }
                ],
                allowedPreChecks: [
                    { command: "getsebool", requiredValues: ["httpd_enable_homedirs"] }
                ],
                explanation: "Allows httpd to serve content from ~/public_html directories.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "List all booleans related to NFS.",
                expected: [
                    { command: "getsebool", requiredFlags: ["-a"], requiredValues: ["|", "grep", "nfs"] },
                    { command: "semanage", requiredValues: ["boolean", "-l", "|", "grep", "nfs"] }
                ],
                explanation: "NFS booleans control share access, home directory mounting, etc.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Disable ftpd_full_access boolean permanently.",
                expected: [
                    { command: "setsebool", requiredFlags: ["-P"], requiredValues: ["ftpd_full_access", "off"] },
                    { command: "setsebool", requiredFlags: ["-P"], requiredValues: ["ftpd_full_access", "0"] }
                ],
                allowedPreChecks: [
                    { command: "getsebool", requiredValues: ["ftpd_full_access"] }
                ],
                explanation: "Disabling booleans increases security by restricting service capabilities.",
                points: 3
            }
        ],
        
        // Set 4: SELinux troubleshooting
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "Search for recent SELinux denials in audit log.",
                expected: [
                    { command: "ausearch", requiredFlags: ["-m"], requiredValues: ["avc", "-ts", "today"] },
                    { command: "grep", requiredValues: ["denied", "/var/log/audit/audit.log", "|", "tail", "-20"] }
                ],
                explanation: "AVC denials logged to /var/log/audit/audit.log.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Use sealert to analyze SELinux denials.",
                expected: [
                    { command: "sealert", requiredFlags: ["-a"], requiredValues: ["/var/log/audit/audit.log"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["setroubleshoot-server"] }
                ],
                explanation: "sealert provides human-readable analysis and suggested fixes.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Check for SELinux alerts in messages log.",
                expected: [
                    { command: "grep", requiredValues: ["sealert", "/var/log/messages"] },
                    { command: "tail", requiredFlags: ["-f"], requiredValues: ["/var/log/messages", "|", "grep", "SELinux"] }
                ],
                explanation: "setroubleshoot logs readable alerts to /var/log/messages.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Install setroubleshoot packages for SELinux troubleshooting.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "setroubleshoot", "setroubleshoot-server", "-y"] },
                    { command: "yum", requiredValues: ["install", "setroubleshoot-server", "-y"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["setroubleshoot"] }
                ],
                explanation: "setroubleshoot analyzes denials and suggests fixes.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Generate SELinux policy module from audit log denials.",
                expected: [
                    { command: "audit2allow", requiredFlags: ["-a"], requiredValues: [] },
                    { command: "audit2allow", requiredFlags: ["-w", "-a"], requiredValues: [] }
                ],
                explanation: "audit2allow converts denials to policy rules. -w shows why denied.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create and compile custom SELinux policy module.",
                expected: [
                    { command: "audit2allow", requiredFlags: ["-a", "-M"], requiredValues: ["mypolicy"] }
                ],
                allowedPreChecks: [
                    { command: "ausearch", requiredFlags: ["-m"], requiredValues: ["avc"] }
                ],
                explanation: "-M creates .te and .pp module files from denials.",
                points: 4
            },
            {
                id: 7,
                category: "Audit",
                description: "Install custom SELinux policy module.",
                expected: [
                    { command: "semodule", requiredFlags: ["-i"], requiredValues: ["mypolicy.pp"] }
                ],
                explanation: "semodule -i installs compiled policy module (.pp file).",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "List all installed SELinux policy modules.",
                expected: [
                    { command: "semodule", requiredFlags: ["-l"], requiredValues: [] },
                    { command: "semodule", requiredValues: ["--list"] }
                ],
                allowedPreChecks: [],
                explanation: "Shows custom and system policy modules with priorities.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Remove custom SELinux policy module.",
                expected: [
                    { command: "semodule", requiredFlags: ["-r"], requiredValues: ["mypolicy"] }
                ],
                explanation: "semodule -r removes installed policy module.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Check if SELinux is blocking a specific port for httpd.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "http"] },
                    { command: "sesearch", requiredValues: ["--allow", "-s", "httpd_t", "-c", "tcp_socket"] }
                ],
                allowedPreChecks: [
                    { command: "ss", requiredFlags: ["-tuln"], requiredValues: [] }
                ],
                explanation: "semanage port shows allowed ports for services.",
                points: 3
            }
        ],
        
        // Set 5: SELinux port management
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Display all ports labeled for http.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "http"] }
                ],
                explanation: "Default http ports: 80, 443, 488, 8008, 8009, 8443, 9000.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Add port 8080 to http_port_t SELinux type.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-a", "-t", "http_port_t", "-p", "tcp", "8080"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "8080"] }
                ],
                explanation: "Allows httpd to bind to port 8080. Without this, binding fails with SELinux enforcing.",
                points: 4
            },
            {
                id: 3,
                category: "Audit",
                description: "Verify port 8080 was added to http_port_t.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "8080"] }
                ],
                explanation: "Should show 8080 in http_port_t list.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Delete port 8080 from http_port_t type.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-d", "-t", "http_port_t", "-p", "tcp", "8080"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "8080"] }
                ],
                explanation: "semanage port -d removes port from SELinux policy.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "List all ports configured for SSH.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "ssh"] }
                ],
                explanation: "Default SSH port: 22. Shows ssh_port_t type.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Add custom port 2222 to ssh_port_t for non-standard SSH.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-a", "-t", "ssh_port_t", "-p", "tcp", "2222"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "ssh"] }
                ],
                explanation: "Required when SSH daemon configured to use non-default port.",
                points: 4
            },
            {
                id: 7,
                category: "Audit",
                description: "Display only custom port modifications (not defaults).",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "-C"] }
                ],
                explanation: "-C shows only locally modified settings, not policy defaults.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Modify port 2222 to different SELinux type.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-m", "-t", "http_port_t", "-p", "tcp", "2222"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "2222"] }
                ],
                explanation: "semanage port -m modifies existing port label.",
                points: 4
            },
            {
                id: 9,
                category: "Audit",
                description: "List all ports for nfs_t type.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "|", "grep", "nfs"] }
                ],
                explanation: "Shows ports allowed for NFS service (2049, etc.).",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Export port customizations to file for backup.",
                expected: [
                    { command: "semanage", requiredValues: ["port", "-l", "-C", ">", "/root/selinux-ports-backup.txt"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["port", "-l", "-C"] }
                ],
                explanation: "Document customizations before system changes or migrations.",
                points: 3
            }
        ],
        
        // Set 6: SELinux advanced operations
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Relabel entire filesystem to fix context issues.",
                expected: [
                    { command: "touch", requiredValues: ["/.autorelabel"] },
                    { command: "fixfiles", requiredValues: ["relabel"] }
                ],
                explanation: "/.autorelabel triggers relabel on next boot. fixfiles relabel does it immediately.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Check for files with incorrect SELinux context in /var/www.",
                expected: [
                    { command: "restorecon", requiredFlags: ["-Rn"], requiredValues: ["/var/www"] },
                    { command: "matchpathcon", requiredFlags: ["-V"], requiredValues: ["/var/www"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-Z"], requiredValues: ["/var/www"] }
                ],
                explanation: "restorecon -n does dry-run showing what would change.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Display SELinux user mappings.",
                expected: [
                    { command: "semanage", requiredValues: ["login", "-l"] }
                ],
                explanation: "Maps Linux users to SELinux users (user_u, staff_u, sysadm_u, etc.).",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Map Linux user 'john' to SELinux user staff_u.",
                expected: [
                    { command: "semanage", requiredValues: ["login", "-a", "-s", "staff_u", "john"] }
                ],
                allowedPreChecks: [
                    { command: "semanage", requiredValues: ["login", "-l"] }
                ],
                explanation: "Controls what SELinux contexts user's processes can run in.",
                points: 4
            },
            {
                id: 5,
                category: "Audit",
                description: "Display available SELinux users.",
                expected: [
                    { command: "semanage", requiredValues: ["user", "-l"] }
                ],
                explanation: "Shows SELinux users and their allowed roles.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Backup all SELinux customizations.",
                expected: [
                    { command: "semanage", requiredValues: ["-o", "/root/selinux-backup.txt"] }
                ],
                allowedPreChecks: [],
                explanation: "Saves fcontext, port, boolean, and other customizations.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Restore SELinux customizations from backup.",
                expected: [
                    { command: "semanage", requiredValues: ["-i", "/root/selinux-backup.txt"] }
                ],
                explanation: "Applies saved customizations after system rebuild or migration.",
                points: 3
            },
            {
                id: 8,
                category: "Implementation",
                description: "Check SELinux policy version.",
                expected: [
                    { command: "sestatus", requiredValues: [] },
                    { command: "cat", requiredValues: ["/sys/fs/selinux/policyvers"] }
                ],
                allowedPreChecks: [],
                explanation: "Policy version indicates kernel SELinux support level.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Display network port contexts for running services.",
                expected: [
                    { command: "ss", requiredFlags: ["-tulnZ"], requiredValues: [] },
                    { command: "netstat", requiredFlags: ["-tulnZ"], requiredValues: [] }
                ],
                explanation: "-Z shows SELinux context for listening ports and processes.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Temporarily disable SELinux denials for httpd domain only.",
                expected: [
                    { command: "semodule", requiredFlags: ["-d"], requiredValues: ["httpd"] }
                ],
                allowedPreChecks: [
                    { command: "semodule", requiredFlags: ["-l"], requiredValues: ["|", "grep", "httpd"] }
                ],
                explanation: "semodule -d disables specific module. Re-enable with semodule -e httpd.",
                points: 4
            }
        ]
    }
};
