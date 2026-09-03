/**
 * Section 7: Systems Maintenance
 * 3 unique question sets for practice variety
 */

const section7Data = {
    id: 7,
    title: "Systems Maintenance",
    description: "Manage software packages, repositories, and system updates",
    totalPoints: 24,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Install the httpd package",
                expected: [
                    { command: "dnf", requiredValues: ["install", "httpd"] },
                    { command: "dnf", requiredFlags: ["install", "-y"], requiredValues: ["httpd"] },
                    { command: "yum", requiredValues: ["install", "httpd"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["httpd"] },
                    { command: "dnf", requiredValues: ["list", "httpd"] }
                ],
                explanation: "dnf install installs packages. -y skips confirmation prompt.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify httpd package is installed",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["httpd"] },
                    { command: "dnf", requiredValues: ["list", "installed"], requiredFlags: ["|"], requiredValues: ["grep", "httpd"] }
                ],
                explanation: "rpm -q queries if a package is installed.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "List all available package groups",
                expected: [
                    { command: "dnf", requiredValues: ["group", "list"] },
                    { command: "dnf", requiredValues: ["grouplist"] },
                    { command: "yum", requiredValues: ["grouplist"] }
                ],
                allowedPreChecks: [],
                explanation: "dnf group list displays package groups for bulk installation.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Search for packages containing 'vim' in the name",
                expected: [
                    { command: "dnf", requiredValues: ["search", "vim"] },
                    { command: "yum", requiredValues: ["search", "vim"] }
                ],
                allowedPreChecks: [],
                explanation: "dnf search finds packages matching keywords.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Display information about the bash package",
                expected: [
                    { command: "dnf", requiredValues: ["info", "bash"] },
                    { command: "rpm", requiredFlags: ["-qi"], requiredValues: ["bash"] },
                    { command: "yum", requiredValues: ["info", "bash"] }
                ],
                explanation: "dnf info shows detailed package information including version and description.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "List all files installed by the coreutils package",
                expected: [
                    { command: "rpm", requiredFlags: ["-ql"], requiredValues: ["coreutils"] }
                ],
                allowedPreChecks: [],
                explanation: "rpm -ql lists all files belonging to an installed package.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Remove the wget package",
                expected: [
                    { command: "dnf", requiredValues: ["remove", "wget"] },
                    { command: "dnf", requiredFlags: ["remove", "-y"], requiredValues: ["wget"] },
                    { command: "yum", requiredValues: ["remove", "wget"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["wget"] }
                ],
                explanation: "dnf remove uninstalls packages from the system.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify wget is no longer installed",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["wget"] },
                    { command: "dnf", requiredValues: ["list", "installed", "wget"] }
                ],
                explanation: "rpm -q should show 'not installed' if removal succeeded.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Update all packages on the system",
                expected: [
                    { command: "dnf", requiredValues: ["update"] },
                    { command: "dnf", requiredFlags: ["update", "-y"] },
                    { command: "yum", requiredValues: ["update"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["check-update"] }
                ],
                explanation: "dnf update upgrades all installed packages to latest versions.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "List all enabled repositories",
                expected: [
                    { command: "dnf", requiredValues: ["repolist"] },
                    { command: "dnf", requiredValues: ["repolist", "enabled"] },
                    { command: "yum", requiredValues: ["repolist"] }
                ],
                explanation: "dnf repolist shows configured package repositories.",
                points: 2
            },
            {
                id: 11,
                category: "Implementation",
                description: "Find which package provides the /bin/ps file",
                expected: [
                    { command: "dnf", requiredValues: ["provides", "/bin/ps"] },
                    { command: "dnf", requiredValues: ["whatprovides", "/bin/ps"] },
                    { command: "rpm", requiredFlags: ["-qf"], requiredValues: ["/bin/ps"] }
                ],
                allowedPreChecks: [],
                explanation: "dnf provides or rpm -qf identifies which package owns a file.",
                points: 2
            },
            {
                id: 12,
                category: "Audit",
                description: "Display recent dnf transaction history",
                expected: [
                    { command: "dnf", requiredValues: ["history"] },
                    { command: "yum", requiredValues: ["history"] }
                ],
                explanation: "dnf history shows package installation/removal transactions.",
                points: 2
            }
        ],
        
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Install the firewalld package",
                expected: [
                    { command: "dnf", requiredValues: ["install", "firewalld"] },
                    { command: "dnf", requiredFlags: ["install", "-y"], requiredValues: ["firewalld"] },
                    { command: "yum", requiredValues: ["install", "firewalld"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["firewalld"] }
                ],
                explanation: "Install firewalld for managing firewall rules.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Confirm firewalld is installed with version",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["firewalld"] },
                    { command: "rpm", requiredFlags: ["-qi"], requiredValues: ["firewalld"] }
                ],
                explanation: "rpm -q shows package with version number.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Install the 'Development Tools' group",
                expected: [
                    { command: "dnf", requiredValues: ["group", "install", "\"Development Tools\""] },
                    { command: "dnf", requiredValues: ["groupinstall", "\"Development Tools\""] },
                    { command: "yum", requiredValues: ["groupinstall", "\"Development Tools\""] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["group", "list"] }
                ],
                explanation: "Group install deploys multiple related packages at once.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify Development Tools group is installed",
                expected: [
                    { command: "dnf", requiredValues: ["group", "list", "installed"] },
                    { command: "dnf", requiredValues: ["grouplist"] }
                ],
                explanation: "dnf group list installed shows installed groups.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Download the rsync package without installing it, save to /tmp",
                expected: [
                    { command: "dnf", requiredValues: ["download", "rsync", "--destdir=/tmp"] },
                    { command: "dnf", requiredFlags: ["--downloadonly", "--downloaddir=/tmp"], requiredValues: ["install", "rsync"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/*.rpm"] }
                ],
                explanation: "dnf download or --downloadonly retrieves RPMs without installing.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "List RPM files in /tmp",
                expected: [
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/tmp/*.rpm"] },
                    { command: "find", requiredValues: ["/tmp", "-name", "*.rpm"] }
                ],
                explanation: "Verify the rsync RPM was downloaded to /tmp.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Clean dnf cache to free disk space",
                expected: [
                    { command: "dnf", requiredValues: ["clean", "all"] },
                    { command: "yum", requiredValues: ["clean", "all"] }
                ],
                allowedPreChecks: [],
                explanation: "dnf clean all removes cached packages and metadata.",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Display disk space used by dnf cache",
                expected: [
                    { command: "du", requiredFlags: ["-sh"], requiredValues: ["/var/cache/dnf"] },
                    { command: "du", requiredFlags: ["-sh"], requiredValues: ["/var/cache/yum"] }
                ],
                explanation: "Check cache directory size after cleaning.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Check for available package updates without installing",
                expected: [
                    { command: "dnf", requiredValues: ["check-update"] },
                    { command: "yum", requiredValues: ["check-update"] }
                ],
                allowedPreChecks: [],
                explanation: "check-update lists packages with available updates.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "List all available package repositories including disabled ones",
                expected: [
                    { command: "dnf", requiredValues: ["repolist", "all"] },
                    { command: "yum", requiredValues: ["repolist", "all"] }
                ],
                explanation: "repolist all displays both enabled and disabled repos.",
                points: 2
            },
            {
                id: 11,
                category: "Implementation",
                description: "List all configuration files from the openssh-server package",
                expected: [
                    { command: "rpm", requiredFlags: ["-qc"], requiredValues: ["openssh-server"] }
                ],
                allowedPreChecks: [],
                explanation: "rpm -qc lists configuration files from a package.",
                points: 2
            },
            {
                id: 12,
                category: "Audit",
                description: "Show changelog for the kernel package",
                expected: [
                    { command: "rpm", requiredFlags: ["-q", "--changelog"], requiredValues: ["kernel"] },
                    { command: "dnf", requiredValues: ["changelog", "kernel"] }
                ],
                explanation: "rpm --changelog displays package version history and changes.",
                points: 2
            }
        ],
        
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Install the podman package",
                expected: [
                    { command: "dnf", requiredValues: ["install", "podman"] },
                    { command: "dnf", requiredFlags: ["install", "-y"], requiredValues: ["podman"] },
                    { command: "yum", requiredValues: ["install", "podman"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["podman"] }
                ],
                explanation: "Install container management tool podman.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Verify podman installation and display its version",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["podman"] },
                    { command: "podman", requiredValues: ["--version"] }
                ],
                explanation: "Confirm package installation and check version.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Reinstall the bash package (force reinstallation)",
                expected: [
                    { command: "dnf", requiredValues: ["reinstall", "bash"] },
                    { command: "dnf", requiredFlags: ["reinstall", "-y"], requiredValues: ["bash"] },
                    { command: "yum", requiredValues: ["reinstall", "bash"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["bash"] }
                ],
                explanation: "reinstall replaces package files, useful for fixing corrupted installations.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Verify bash package integrity after reinstall",
                expected: [
                    { command: "rpm", requiredFlags: ["-V"], requiredValues: ["bash"] },
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["bash"] }
                ],
                explanation: "rpm -V verifies package files against original checksums.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "List all orphaned packages (installed as dependencies but no longer needed)",
                expected: [
                    { command: "dnf", requiredValues: ["autoremove"] },
                    { command: "dnf", requiredValues: ["autoremove", "--assumeno"] },
                    { command: "package-cleanup", requiredValues: ["--leaves"] }
                ],
                allowedPreChecks: [],
                explanation: "dnf autoremove identifies and removes orphaned dependencies.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Display installed packages sorted by install date",
                expected: [
                    { command: "rpm", requiredFlags: ["-qa", "--last"] },
                    { command: "rpm", requiredFlags: ["-qa"], requiredValues: ["--last"] }
                ],
                explanation: "rpm -qa --last lists packages with most recently installed first.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Enable a repository called 'epel' for a single install of the 'htop' package",
                expected: [
                    { command: "dnf", requiredFlags: ["--enablerepo=epel"], requiredValues: ["install", "htop"] },
                    { command: "dnf", requiredValues: ["install", "htop", "--enablerepo=epel"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["repolist", "all"] }
                ],
                explanation: "--enablerepo temporarily enables a disabled repository for one transaction.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Verify htop is installed",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["htop"] },
                    { command: "dnf", requiredValues: ["list", "installed", "htop"] }
                ],
                explanation: "Confirm package from EPEL repository was installed.",
                points: 2
            },
            {
                id: 9,
                category: "Implementation",
                description: "Downgrade the systemd package to previous version (simulate recovery)",
                expected: [
                    { command: "dnf", requiredValues: ["downgrade", "systemd"] },
                    { command: "yum", requiredValues: ["downgrade", "systemd"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["list", "systemd"] },
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["systemd"] }
                ],
                explanation: "dnf downgrade reverts to earlier package version.",
                points: 3
            },
            {
                id: 10,
                category: "Audit",
                description: "Display documentation files from the systemd package",
                expected: [
                    { command: "rpm", requiredFlags: ["-qd"], requiredValues: ["systemd"] }
                ],
                explanation: "rpm -qd lists documentation files included in package.",
                points: 2
            },
            {
                id: 11,
                category: "Implementation",
                description: "Find which installed package provides the /etc/passwd file",
                expected: [
                    { command: "rpm", requiredFlags: ["-qf"], requiredValues: ["/etc/passwd"] }
                ],
                allowedPreChecks: [],
                explanation: "rpm -qf queries which package owns a specific file.",
                points: 2
            },
            {
                id: 12,
                category: "Audit",
                description: "Undo the last dnf transaction",
                expected: [
                    { command: "dnf", requiredValues: ["history", "undo", "last"] },
                    { command: "dnf", requiredValues: ["history", "undo"] }
                ],
                explanation: "dnf history undo rolls back recent package changes.",
                points: 2
            }
        ],
        
        // Set 4: Repository management
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "List all enabled repositories.",
                expected: [
                    { command: "dnf", requiredValues: ["repolist"] },
                    { command: "yum", requiredValues: ["repolist"] },
                    { command: "dnf", requiredValues: ["repolist", "enabled"] }
                ],
                explanation: "dnf repolist shows all active package repositories.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "List all repositories including disabled ones.",
                expected: [
                    { command: "dnf", requiredValues: ["repolist", "all"] },
                    { command: "yum", requiredValues: ["repolist", "all"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["repolist"] }
                ],
                explanation: "--all or 'all' shows both enabled and disabled repositories.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display detailed information about 'baseos' repository.",
                expected: [
                    { command: "dnf", requiredValues: ["repoinfo", "baseos"] },
                    { command: "yum", requiredValues: ["repoinfo", "baseos"] }
                ],
                explanation: "repoinfo shows repo URL, metadata expiration, size, and status.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Add new repository with ID 'custom-repo' from http://repo.example.com/rhel9.",
                expected: [
                    { command: "dnf", requiredValues: ["config-manager", "--add-repo", "http://repo.example.com/rhel9"] },
                    { command: "yum-config-manager", requiredValues: ["--add-repo", "http://repo.example.com/rhel9"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["repolist"] }
                ],
                explanation: "config-manager --add-repo creates new .repo file in /etc/yum.repos.d/.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify the new repository was added.",
                expected: [
                    { command: "dnf", requiredValues: ["repolist"] },
                    { command: "ls", requiredValues: ["/etc/yum.repos.d/"] },
                    { command: "cat", requiredValues: ["/etc/yum.repos.d/repo.example.com_rhel9.repo"] }
                ],
                explanation: "New .repo file created automatically from URL.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Disable repository 'custom-repo'.",
                expected: [
                    { command: "dnf", requiredValues: ["config-manager", "--set-disabled", "custom-repo"] },
                    { command: "yum-config-manager", requiredValues: ["--disable", "custom-repo"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["repolist", "all"] }
                ],
                explanation: "Disabling prevents dnf from using this repository for installs/updates.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Verify custom-repo is disabled.",
                expected: [
                    { command: "dnf", requiredValues: ["repolist", "all", "|", "grep", "custom-repo"] },
                    { command: "cat", requiredValues: ["/etc/yum.repos.d/custom-repo.repo"] }
                ],
                explanation: "Disabled repos show in 'repolist all' but not in default 'repolist'.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Enable repository 'custom-repo'.",
                expected: [
                    { command: "dnf", requiredValues: ["config-manager", "--set-enabled", "custom-repo"] },
                    { command: "yum-config-manager", requiredValues: ["--enable", "custom-repo"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["repolist", "all"] }
                ],
                explanation: "Re-enables repository for package operations.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "List all .repo files in /etc/yum.repos.d/.",
                expected: [
                    { command: "ls", requiredValues: ["/etc/yum.repos.d/"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/yum.repos.d/"] }
                ],
                explanation: "This directory contains all repository configuration files.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Clean all cached repository metadata.",
                expected: [
                    { command: "dnf", requiredValues: ["clean", "all"] },
                    { command: "yum", requiredValues: ["clean", "all"] }
                ],
                allowedPreChecks: [
                    { command: "du", requiredFlags: ["-sh"], requiredValues: ["/var/cache/dnf"] }
                ],
                explanation: "clean all removes cached packages and metadata, forcing fresh download.",
                points: 2
            }
        ],
        
        // Set 5: Flatpak basics
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Check if Flatpak is installed.",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["flatpak"] },
                    { command: "flatpak", requiredValues: ["--version"] },
                    { command: "which", requiredValues: ["flatpak"] }
                ],
                explanation: "Flatpak provides containerized application delivery.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Install Flatpak if not present.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "flatpak", "-y"] },
                    { command: "yum", requiredValues: ["install", "flatpak", "-y"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["flatpak"] }
                ],
                explanation: "Flatpak enables installation of sandboxed applications.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "List configured Flatpak remotes.",
                expected: [
                    { command: "flatpak", requiredValues: ["remotes"] }
                ],
                explanation: "Remotes are repositories for Flatpak applications.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Add Flathub repository.",
                expected: [
                    { command: "flatpak", requiredValues: ["remote-add", "--if-not-exists", "flathub", "https://flathub.org/repo/flathub.flatpakrepo"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["remotes"] }
                ],
                explanation: "Flathub is the primary Flatpak application repository.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify Flathub was added successfully.",
                expected: [
                    { command: "flatpak", requiredValues: ["remotes"] }
                ],
                explanation: "Should now show 'flathub' in remotes list.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "List all installed Flatpak applications.",
                expected: [
                    { command: "flatpak", requiredValues: ["list"] },
                    { command: "flatpak", requiredValues: ["list", "--app"] }
                ],
                allowedPreChecks: [],
                explanation: "flatpak list shows installed apps and runtimes.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "Search for available calculator applications in Flatpak.",
                expected: [
                    { command: "flatpak", requiredValues: ["search", "calculator"] }
                ],
                explanation: "Searches all configured remotes for matching applications.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Display information about org.gnome.Calculator flatpak.",
                expected: [
                    { command: "flatpak", requiredValues: ["info", "org.gnome.Calculator"] },
                    { command: "flatpak", requiredValues: ["remote-info", "flathub", "org.gnome.Calculator"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["search", "calculator"] }
                ],
                explanation: "info shows application details, dependencies, and size.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Check for Flatpak updates.",
                expected: [
                    { command: "flatpak", requiredValues: ["update", "--appstream"] },
                    { command: "flatpak", requiredValues: ["remote-ls", "--updates"] }
                ],
                explanation: "Flatpak updates applications and runtimes independently of system packages.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Remove unused Flatpak runtimes and applications.",
                expected: [
                    { command: "flatpak", requiredValues: ["uninstall", "--unused"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["list"] }
                ],
                explanation: "--unused removes unreferenced runtimes, freeing disk space.",
                points: 3
            }
        ],
        
        // Set 6: Local RPM handling
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Extract contents of RPM file /tmp/app-1.0-1.el9.x86_64.rpm without installing.",
                expected: [
                    { command: "rpm2cpio", requiredValues: ["/tmp/app-1.0-1.el9.x86_64.rpm", "|", "cpio", "-idmv"] },
                    { command: "rpm2cpio", requiredValues: ["/tmp/app-1.0-1.el9.x86_64.rpm", "|", "cpio", "-id"] }
                ],
                explanation: "rpm2cpio converts RPM to cpio archive for extraction.",
                points: 3
            },
            {
                id: 2,
                category: "Implementation",
                description: "Install local RPM file /tmp/custom-tool-2.4.rpm.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "/tmp/custom-tool-2.4.rpm"] },
                    { command: "yum", requiredValues: ["install", "/tmp/custom-tool-2.4.rpm"] },
                    { command: "rpm", requiredFlags: ["-ivh"], requiredValues: ["/tmp/custom-tool-2.4.rpm"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-qip"], requiredValues: ["/tmp/custom-tool-2.4.rpm"] }
                ],
                explanation: "dnf install resolves dependencies. rpm -ivh does not.",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Query information from uninstalled RPM file /tmp/app.rpm.",
                expected: [
                    { command: "rpm", requiredFlags: ["-qip"], requiredValues: ["/tmp/app.rpm"] },
                    { command: "rpm", requiredFlags: ["-qilp"], requiredValues: ["/tmp/app.rpm"] }
                ],
                explanation: "rpm -qip shows package info. -qilp lists files in RPM.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "List all files that would be installed from /tmp/package.rpm.",
                expected: [
                    { command: "rpm", requiredFlags: ["-qlp"], requiredValues: ["/tmp/package.rpm"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-qip"], requiredValues: ["/tmp/package.rpm"] }
                ],
                explanation: "rpm -qlp lists all files in RPM package before installing.",
                points: 2
            },
            {
                id: 5,
                category: "Audit", 
                description: "Display scripts that would run during installation of /tmp/app.rpm.",
                expected: [
                    { command: "rpm", requiredFlags: ["-qp", "--scripts"], requiredValues: ["/tmp/app.rpm"] }
                ],
                explanation: "Shows pre/post install/uninstall scripts. Important for security review.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Verify integrity and signatures of /tmp/signed.rpm.",
                expected: [
                    { command: "rpm", requiredFlags: ["-K"], requiredValues: ["/tmp/signed.rpm"] },
                    { command: "rpm", requiredFlags: ["--checksig"], requiredValues: ["/tmp/signed.rpm"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-qip"], requiredValues: ["/tmp/signed.rpm"] }
                ],
                explanation: "rpm -K verifies GPG signatures and checksums.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Check dependencies required by /tmp/app.rpm.",
                expected: [
                    { command: "rpm", requiredFlags: ["-qpR"], requiredValues: ["/tmp/app.rpm"] },
                    { command: "rpm", requiredFlags: ["-qp", "--requires"], requiredValues: ["/tmp/app.rpm"] }
                ],
                explanation: "Shows what packages/libraries are required before installation.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Force reinstall of RPM package ignoring dependencies.",
                expected: [
                    { command: "rpm", requiredFlags: ["-ivh", "--force", "--nodeps"], requiredValues: ["/tmp/app.rpm"] },
                    { command: "rpm", requiredFlags: ["--force"], requiredValues: ["/tmp/app.rpm"] }
                ],
                allowedPreChecks: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["app"] }
                ],
                explanation: "--force overwrites files. --nodeps skips dependency checks (dangerous!).",
                points: 4
            },
            {
                id: 9,
                category: "Audit",
                description: "Compare local RPM file with installed package to validate integrity.",
                expected: [
                    { command: "rpm", requiredFlags: ["-Vp"], requiredValues: ["/tmp/app.rpm"] }
                ],
                explanation: "rpm -Vp verifies files match installed version.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Install multiple RPM files from /tmp/rpms/ directory at once.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "/tmp/rpms/*.rpm"] },
                    { command: "rpm", requiredFlags: ["-ivh"], requiredValues: ["/tmp/rpms/*.rpm"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/tmp/rpms/"] }
                ],
                explanation: "Wildcards install multiple RPMs. dnf resolves inter-package dependencies.",
                points: 3
            }
        ]
    }
};
