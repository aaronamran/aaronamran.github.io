/**
 * Section 1: Users and Groups
 * 3 unique question sets for practice variety
 */

const section1Data = {
    id: 1,
    title: "Users and Groups",
    description: "Master user and group management commands essential for RHCSA.",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a group named 'developers' with GID 3000.",
                expected: {
                    command: "groupadd",
                    requiredFlags: ["-g"],
                    requiredValues: ["3000", "developers"]
                },
                allowedPreChecks: [
                    { command: "getent", requiredValues: ["group", "developers"] },
                    { command: "getent", requiredValues: ["group", "3000"] },
                    { command: "getent", requiredValues: ["group"] }
                ],
                explanation: "The -g flag sets the Group ID. Groups should be created before assigning users to them.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify that the group 'developers' exists with the correct GID.",
                expected: [
                    { command: "getent", requiredValues: ["group", "developers"] },
                    { command: "getent", requiredValues: ["group", "3000"] },
                    { command: "getent", requiredValues: ["group"] }
                ],
                explanation: "Using 'getent group developers' or 'getent group 3000' confirms the group exists in the system database.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create user 'bob' (UID 4001) with 'developers' as secondary group.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-u", "-G"],
                    requiredValues: ["4001", "bob", "developers"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["bob"] },
                    { command: "getent", requiredValues: ["passwd", "bob"] }
                ],
                explanation: "Uppercase -G assigns supplementary groups. Lowercase -u sets the specific UID.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify 'bob' has the correct UID and group memberships.",
                expected: {
                    command: "id",
                    requiredValues: ["bob"]
                },
                explanation: "The 'id' command shows UID, primary GID, and all group memberships.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set the password 'RedHat2026!' for 'bob' using a non-interactive method.",
                expected: [
                    { command: "echo", requiredFlags: ["--stdin"], requiredValues: ["RedHat2026!", "|", "passwd", "bob"] },
                    { command: "echo", requiredFlags: ["--stdin"], requiredValues: ["\"RedHat2026!\"", "|", "passwd", "bob"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["bob", "/etc/shadow"] },
                    { command: "getent", requiredValues: ["shadow", "bob"] }
                ],
                explanation: "Using 'echo RedHat2026! | passwd --stdin bob' enables non-interactive password assignment in RHEL.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify that 'bob' has an active password.",
                expected: [
                    { command: "grep", requiredValues: ["bob", "/etc/shadow"] },
                    { command: "getent", requiredValues: ["shadow", "bob"] }
                ],
                explanation: "Checking /etc/shadow confirms a password hash exists for the user.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Configure 'bob' so his password expires every 60 days.",
                expected: {
                    command: "chage",
                    requiredFlags: ["-M"],
                    requiredValues: ["60", "bob"]
                },
                allowedPreChecks: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["bob"] }
                ],
                explanation: "The -M (Maximum) flag in chage sets password expiration interval.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify the password aging policy for 'bob' is set to 60 days.",
                expected: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["bob"] },
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["bob"] }
                ],
                explanation: "The 'chage -l' (list) command displays all password aging information. passwd -S shows password status in a compact format.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Modify 'bob' to change his shell to '/bin/bash'.",
                expected: {
                    command: "usermod",
                    requiredFlags: ["-s"],
                    requiredValues: ["/bin/bash", "bob"]
                },
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["bob", "/etc/passwd"] },
                    { command: "getent", requiredValues: ["passwd", "bob"] }
                ],
                explanation: "The usermod -s command updates the default shell in /etc/passwd.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify that the shell for 'bob' has been updated correctly.",
                expected: [
                    { command: "grep", requiredValues: ["bob", "/etc/passwd"] },
                    { command: "getent", requiredValues: ["passwd", "bob"] },
                    { command: "cat", requiredValues: ["/etc/passwd"] }
                ],
                explanation: "Use 'getent passwd bob' or 'grep bob /etc/passwd' to verify the shell is /bin/bash.",
                points: 2
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a group named 'webadmins' with GID 5500.",
                expected: {
                    command: "groupadd",
                    requiredFlags: ["-g"],
                    requiredValues: ["5500", "webadmins"]
                },
                allowedPreChecks: [
                    { command: "getent", requiredValues: ["group", "webadmins"] },
                    { command: "getent", requiredValues: ["group", "5500"] },
                    { command: "getent", requiredValues: ["group"] }
                ],
                explanation: "Creating groups with specific GIDs ensures consistency across systems.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify that the group 'webadmins' exists with GID 5500.",
                expected: [
                    { command: "getent", requiredValues: ["group", "webadmins"] },
                    { command: "getent", requiredValues: ["group", "5500"] },
                    { command: "getent", requiredValues: ["group"] }
                ],
                explanation: "getent queries the system database including /etc/group.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create user 'sarah' (UID 6500) with primary group 'webadmins' and home directory '/home/sarah'.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-u", "-g"],
                    requiredValues: ["6500", "sarah", "webadmins"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["sarah"] },
                    { command: "getent", requiredValues: ["passwd", "sarah"] }
                ],
                explanation: "Lowercase -g sets the primary group. The home directory is created automatically by default.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify 'sarah' has UID 6500 and primary group 'webadmins'.",
                expected: {
                    command: "id",
                    requiredValues: ["sarah"]
                },
                explanation: "The id command shows the primary group (first group listed).",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Set password 'Secure@Web99' for 'sarah' non-interactively.",
                expected: [
                    { command: "echo", requiredFlags: ["--stdin"], requiredValues: ["Secure@Web99", "|", "passwd", "sarah"] },
                    { command: "echo", requiredFlags: ["--stdin"], requiredValues: ["\"Secure@Web99\"", "|", "passwd", "sarah"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["sarah", "/etc/shadow"] },
                    { command: "getent", requiredValues: ["shadow", "sarah"] }
                ],
                explanation: "The passwd --stdin option reads the password from standard input.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Confirm 'sarah' has a password hash in /etc/shadow.",
                expected: [
                    { command: "grep", requiredValues: ["sarah", "/etc/shadow"] },
                    { command: "getent", requiredValues: ["shadow", "sarah"] }
                ],
                explanation: "A valid password shows as an encrypted hash in the second field of /etc/shadow.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Set 'sarah' password to expire every 45 days with 7 days warning.",
                expected: [
                    { command: "chage", requiredFlags: ["-M", "-W"], requiredValues: ["45", "7", "sarah"] },
                    { command: "chage", requiredFlags: ["-M"], requiredValues: ["45", "sarah"] }
                ],
                allowedPreChecks: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["sarah"] }
                ],
                explanation: "-M sets maximum days, -W sets warning days before expiration.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Display password aging information for 'sarah'.",
                expected: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["sarah"] },
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["sarah"] }
                ],
                explanation: "chage -l shows all password aging policies in human-readable format. passwd -S shows compact status.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Lock 'sarah' account (prevent login without deleting the account).",
                expected: [
                    { command: "usermod", requiredFlags: ["-L"], requiredValues: ["sarah"] },
                    { command: "passwd", requiredFlags: ["-l"], requiredValues: ["sarah"] }
                ],
                allowedPreChecks: [
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["sarah"] },
                    { command: "getent", requiredValues: ["shadow", "sarah"] }
                ],
                explanation: "usermod -L or passwd -l locks an account by prefixing the password hash with '!'.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify 'sarah' account is locked.",
                expected: [
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["sarah"] },
                    { command: "getent", requiredValues: ["shadow", "sarah"] }
                ],
                explanation: "passwd -S shows account status. 'L' indicates locked.",
                points: 2
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Create a system group named 'appsvc' with GID 999.",
                expected: [
                    { command: "groupadd", requiredFlags: ["-r", "-g"], requiredValues: ["999", "appsvc"] },
                    { command: "groupadd", requiredFlags: ["-g"], requiredValues: ["999", "appsvc"] }
                ],
                allowedPreChecks: [
                    { command: "getent", requiredValues: ["group", "appsvc"] },
                    { command: "getent", requiredValues: ["group", "999"] },
                    { command: "getent", requiredValues: ["group"] }
                ],
                explanation: "The -r flag creates a system group. System groups typically have GIDs below 1000.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify the 'appsvc' group exists with GID 999.",
                expected: [
                    { command: "getent", requiredValues: ["group", "appsvc"] },
                    { command: "getent", requiredValues: ["group", "999"] },
                    { command: "grep", requiredValues: ["appsvc", "/etc/group"] }
                ],
                explanation: "System groups are stored in /etc/group like regular groups.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create system user 'appadmin' (UID 998) with no home directory and shell /sbin/nologin.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-r", "-u", "-M", "-s"],
                    requiredValues: ["998", "appadmin", "/sbin/nologin"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["appadmin"] },
                    { command: "getent", requiredValues: ["passwd", "appadmin"] }
                ],
                explanation: "-r creates system user, -M prevents home directory creation, -s sets shell for service accounts.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify 'appadmin' is a system user with no home directory.",
                expected: [
                    { command: "id", requiredValues: ["appadmin"] },
                    { command: "getent", requiredValues: ["passwd", "appadmin"] },
                    { command: "grep", requiredValues: ["appadmin", "/etc/passwd"] }
                ],
                explanation: "System users have UIDs below 1000 and typically use /sbin/nologin shell.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create user 'contractor' with account expiration date 2026-12-31.",
                expected: [
                    { command: "useradd", requiredFlags: ["-e"], requiredValues: ["2026-12-31", "contractor"] },
                    { command: "useradd", requiredFlags: ["-e"], requiredValues: ["2026-12-31", "contractor"] }
                ],
                allowedPreChecks: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["contractor"] },
                    { command: "getent", requiredValues: ["shadow", "contractor"] }
                ],
                explanation: "The -e flag sets account expiration date in YYYY-MM-DD format.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify 'contractor' account expires on 2026-12-31.",
                expected: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["contractor"] },
                    { command: "getent", requiredValues: ["shadow", "contractor"] }
                ],
                explanation: "chage -l shows account expiration date in human-readable format.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Add 'contractor' to supplementary groups 'developers' and 'webadmins'.",
                expected: [
                    { command: "usermod", requiredFlags: ["-aG"], requiredValues: ["developers,webadmins", "contractor"] },
                    { command: "usermod", requiredFlags: ["-a", "-G"], requiredValues: ["developers,webadmins", "contractor"] }
                ],
                allowedPreChecks: [
                    { command: "id", requiredValues: ["contractor"] },
                    { command: "groups", requiredValues: ["contractor"] }
                ],
                explanation: "usermod -aG appends groups without removing existing memberships. -a is append mode.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify 'contractor' is member of developers and webadmins groups.",
                expected: [
                    { command: "id", requiredValues: ["contractor"] },
                    { command: "groups", requiredValues: ["contractor"] }
                ],
                explanation: "The groups command lists all groups a user belongs to.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Force 'contractor' to change password at next login.",
                expected: [
                    { command: "chage", requiredFlags: ["-d"], requiredValues: ["0", "contractor"] },
                    { command: "passwd", requiredFlags: ["-e"], requiredValues: ["contractor"] }
                ],
                allowedPreChecks: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["contractor"] }
                ],
                explanation: "chage -d 0 or passwd -e forces password change at next login by setting last password change to epoch.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify 'contractor' must change password at next login.",
                expected: {
                    command: "chage",
                    requiredFlags: ["-l"],
                    requiredValues: ["contractor"]
                },
                explanation: "chage -l shows 'Last password change' as a date in the past (Jan 01, 1970) when forced change is required.",
                points: 2
            }
        ],
        
        // Set 4: sudo configuration and /etc/sudoers
        set4: [
            {
                id: 1,
                category: "Implementation",
                description: "Add user 'admin1' to the wheel group to grant sudo privileges.",
                expected: {
                    command: "usermod",
                    requiredFlags: ["-aG"],
                    requiredValues: ["wheel", "admin1"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["admin1"] },
                    { command: "groups", requiredValues: ["admin1"] }
                ],
                explanation: "The wheel group grants sudo privileges on RHEL. Use -aG to append without removing existing groups.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify 'admin1' is member of the wheel group.",
                expected: [
                    { command: "id", requiredValues: ["admin1"] },
                    { command: "groups", requiredValues: ["admin1"] },
                    { command: "getent", requiredValues: ["group", "wheel"] }
                ],
                explanation: "Use id, groups, or getent group wheel to verify wheel group membership.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Check sudo configuration file syntax without making changes.",
                expected: {
                    command: "visudo",
                    requiredFlags: ["-c"],
                    requiredValues: []
                },
                explanation: "visudo -c checks /etc/sudoers syntax without opening the editor. Always validate before editing.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "View the wheel group sudo configuration in sudoers.",
                expected: [
                    { command: "grep", requiredFlags: ["-E"], requiredValues: ["wheel", "/etc/sudoers"] },
                    { command: "grep", requiredValues: ["%wheel", "/etc/sudoers"] }
                ],
                explanation: "The line '%wheel ALL=(ALL) ALL' grants full sudo access to wheel group members.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "List all files in /etc/sudoers.d/ directory.",
                expected: [
                    { command: "ls", requiredFlags: ["-la"], requiredValues: ["/etc/sudoers.d/"] },
                    { command: "ls", requiredValues: ["/etc/sudoers.d/"] }
                ],
                explanation: "/etc/sudoers.d/ contains individual sudo configuration files, included by main sudoers file.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Create user 'dbadmin' and add to wheel group in single command.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-G"],
                    requiredValues: ["wheel", "dbadmin"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["dbadmin"] }
                ],
                explanation: "Use -G during user creation to assign supplementary groups immediately.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify 'dbadmin' was created with wheel group membership.",
                expected: [
                    { command: "id", requiredValues: ["dbadmin"] },
                    { command: "groups", requiredValues: ["dbadmin"] }
                ],
                explanation: "dbadmin should show wheel in supplementary groups.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Display current user's sudo privileges.",
                expected: {
                    command: "sudo",
                    requiredFlags: ["-l"],
                    requiredValues: []
                },
                explanation: "sudo -l lists what commands the current user can run with sudo.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Remove 'dbadmin' from the wheel group.",
                expected: {
                    command: "gpasswd",
                    requiredFlags: ["-d"],
                    requiredValues: ["dbadmin", "wheel"]
                },
                allowedPreChecks: [
                    { command: "groups", requiredValues: ["dbadmin"] },
                    { command: "id", requiredValues: ["dbadmin"] }
                ],
                explanation: "gpasswd -d removes a user from a group. Alternative: usermod -G to reset groups.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify 'dbadmin' no longer has wheel group membership.",
                expected: [
                    { command: "id", requiredValues: ["dbadmin"] },
                    { command: "groups", requiredValues: ["dbadmin"] }
                ],
                explanation: "Wheel should not appear in the groups output after removal.",
                points: 2
            }
        ],
        
        // Set 5: Privileged access and user elevation
        set5: [
            {
                id: 1,
                category: "Implementation",
                description: "Create user 'sysadmin' with UID 2500 and immediate wheel group membership.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-u", "-G"],
                    requiredValues: ["2500", "wheel", "sysadmin"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["sysadmin"] }
                ],
                explanation: "Combine -u for specific UID and -G for supplementary groups in single command.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify 'sysadmin' has UID 2500 and wheel membership.",
                expected: [
                    { command: "id", requiredValues: ["sysadmin"] },
                    { command: "getent", requiredValues: ["passwd", "sysadmin"] }
                ],
                explanation: "id shows both UID and group memberships in one output.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Check who has recently used sudo on the system.",
                expected: [
                    { command: "grep", requiredValues: ["sudo", "/var/log/secure"] },
                    { command: "journalctl", requiredFlags: ["-u"], requiredValues: ["sudo"] },
                    { command: "last", requiredValues: [] }
                ],
                explanation: "Sudo usage is logged in /var/log/secure. journalctl can also track sudo activity.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Create group 'appadmins' with GID 3500.",
                expected: {
                    command: "groupadd",
                    requiredFlags: ["-g"],
                    requiredValues: ["3500", "appadmins"]
                },
                allowedPreChecks: [
                    { command: "getent", requiredValues: ["group", "appadmins"] },
                    { command: "getent", requiredValues: ["group", "3500"] }
                ],
                explanation: "Create groups for organizational access control, separate from system groups.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify 'appadmins' group exists with correct GID.",
                expected: [
                    { command: "getent", requiredValues: ["group", "appadmins"] },
                    { command: "getent", requiredValues: ["group", "3500"] },
                    { command: "grep", requiredValues: ["appadmins", "/etc/group"] }
                ],
                explanation: "getent queries the system database including /etc/group.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Add existing user 'sysadmin' to 'appadmins' group (keep existing groups).",
                expected: {
                    command: "usermod",
                    requiredFlags: ["-aG"],
                    requiredValues: ["appadmins", "sysadmin"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["sysadmin"] }
                ],
                explanation: "Always use -aG (append) to add groups without losing existing wheel membership.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify 'sysadmin' is member of both wheel and appadmins groups.",
                expected: [
                    { command: "id", requiredValues: ["sysadmin"] },
                    { command: "groups", requiredValues: ["sysadmin"] }
                ],
                explanation: "Both wheel and appadmins should appear in groups list.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "List all members of the appadmins group.",
                expected: [
                    { command: "getent", requiredValues: ["group", "appadmins"] },
                    { command: "grep", requiredValues: ["appadmins", "/etc/group"] },
                    { command: "lid", requiredFlags: ["-g"], requiredValues: ["appadmins"] }
                ],
                explanation: "Group members appear after the final colon in /etc/group entries.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Lock the 'sysadmin' account to prevent login.",
                expected: [
                    { command: "usermod", requiredFlags: ["-L"], requiredValues: ["sysadmin"] },
                    { command: "passwd", requiredFlags: ["-l"], requiredValues: ["sysadmin"] }
                ],
                allowedPreChecks: [
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["sysadmin"] },
                    { command: "grep", requiredValues: ["sysadmin", "/etc/shadow"] }
                ],
                explanation: "usermod -L or passwd -l locks account by prepending ! to password hash.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify 'sysadmin' account is locked.",
                expected: [
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["sysadmin"] },
                    { command: "grep", requiredValues: ["sysadmin", "/etc/shadow"] }
                ],
                explanation: "passwd -S shows 'L' for locked accounts. Shadow file shows ! prefix.",
                points: 2
            }
        ],
        
        // Set 6: User switching and su command
        set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Create user 'operator' with password 'op123'.",
                expected: [
                    { command: "useradd", requiredValues: ["operator"] },
                    { command: "echo", requiredFlags: ["--stdin"], requiredValues: ["op123", "|", "passwd", "operator"] }
                ],
                allowedPreChecks: [
                    { command: "id", requiredValues: ["operator"] }
                ],
                explanation: "Create user then set password using pipe for non-interactive setup.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify 'operator' user exists and has password set.",
                expected: [
                    { command: "id", requiredValues: ["operator"] },
                    { command: "passwd", requiredFlags: ["-S"], requiredValues: ["operator"] },
                    { command: "getent", requiredValues: ["shadow", "operator"] }
                ],
                explanation: "passwd -S shows password status (P for set, NP for no password, L for locked).",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display the current logged-in username.",
                expected: [
                    { command: "whoami", requiredValues: [] },
                    { command: "id", requiredFlags: ["-un"], requiredValues: [] }
                ],
                explanation: "whoami or id -un shows current effective username.",
                points: 2
            },
            {
                id: 4,
                category: "Audit",
                description: "Show all currently logged-in users.",
                expected: [
                    { command: "who", requiredValues: [] },
                    { command: "w", requiredValues: [] },
                    { command: "users", requiredValues: [] }
                ],
                explanation: "who, w, and users display active login sessions on the system.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Create user 'appuser' with home directory /opt/appuser.",
                expected: {
                    command: "useradd",
                    requiredFlags: ["-d"],
                    requiredValues: ["/opt/appuser", "appuser"]
                },
                allowedPreChecks: [
                    { command: "id", requiredValues: ["appuser"] },
                    { command: "getent", requiredValues: ["passwd", "appuser"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/appuser"] }
                ],
                explanation: "-d specifies custom home directory location instead of default /home.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Verify 'appuser' home directory is /opt/appuser.",
                expected: [
                    { command: "getent", requiredValues: ["passwd", "appuser"] },
                    { command: "grep", requiredValues: ["appuser", "/etc/passwd"] },
                    { command: "ls", requiredFlags: ["-ld"], requiredValues: ["/opt/appuser"] }
                ],
                explanation: "Home directory is the 6th field in /etc/passwd entries.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Modify 'operator' to change their login shell to /bin/bash.",
                expected: {
                    command: "usermod",
                    requiredFlags: ["-s"],
                    requiredValues: ["/bin/bash", "operator"]
                },
                allowedPreChecks: [
                    { command: "getent", requiredValues: ["passwd", "operator"] },
                    { command: "grep", requiredValues: ["operator", "/etc/passwd"] }
                ],
                explanation: "usermod -s changes the default login shell (7th field in /etc/passwd).",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify 'operator' shell is now /bin/bash.",
                expected: [
                    { command: "getent", requiredValues: ["passwd", "operator"] },
                    { command: "grep", requiredValues: ["operator", "/etc/passwd"] }
                ],
                explanation: "The shell is the last field after the final colon in passwd entries.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Set 'operator' account to expire on 2027-12-31.",
                expected: {
                    command: "usermod",
                    requiredFlags: ["-e"],
                    requiredValues: ["2027-12-31", "operator"]
                },
                allowedPreChecks: [
                    { command: "chage", requiredFlags: ["-l"], requiredValues: ["operator"] }
                ],
                explanation: "usermod -e sets account expiration date in YYYY-MM-DD format.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "Verify 'operator' account expiration date.",
                expected: {
                    command: "chage",
                    requiredFlags: ["-l"],
                    requiredValues: ["operator"]
                },
                explanation: "chage -l displays account expiration date and password aging information.",
                points: 2
            }
        ]
    }
};
