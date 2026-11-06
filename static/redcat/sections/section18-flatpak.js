// Section 18: Flatpak
// RHCSA 10 - Flatpak application management
const section18Data = {
    id: 18,
    title: "Flatpak",
    description: "Master Flatpak for RHCSA 10 - application installation, management, permissions, and offline deployment",
    totalPoints: 60,
    questionSets: {
        // Set 1: Basic Setup and Installation (20 points)
        set1: [
            {
                id: 1,
                category: "Implementation",
                description: "Install the Flatpak package using DNF.",
                expected: [
                    { command: "dnf", requiredFlags: ["-y"], requiredValues: ["install", "flatpak"] }
                ],
                allowedPreChecks: [],
                explanation: "DNF installs Flatpak from AppStream repository. -y skips confirmation.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Add the Flathub remote system-wide (use URL: https://flathub.org/repo/flathub.flatpakrepo). Use the --if-not-exists flag to avoid conflicts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--if-not-exists"], requiredValues: ["remote-add", "flathub", "https://flathub.org/repo/flathub.flatpakrepo"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["remotes"] }
                ],
                explanation: "--if-not-exists prevents errors if remote already exists. Flathub is primary Flatpak source.",
                points: 4
            },
            {
                id: 3,
                category: "Audit",
                description: "Search for Firefox in the Flatpak repositories.",
                expected: [
                    { command: "flatpak", requiredValues: ["search", "firefox"] }
                ],
                explanation: "flatpak search queries all configured remotes for application names/descriptions.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Install Firefox (org.mozilla.firefox) from Flathub system-wide without confirmation prompts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["-y"], requiredValues: ["install", "flathub", "org.mozilla.firefox"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["list"] }
                ],
                explanation: "-y flag skips confirmation. System-wide installation requires sudo/root.",
                points: 4
            },
            {
                id: 5,
                category: "Audit",
                description: "List all installed Flatpak applications (exclude runtimes).",
                expected: [
                    { command: "flatpak", requiredFlags: ["--app"], requiredValues: ["list"] }
                ],
                explanation: "--app filters to show only applications, excluding runtimes and extensions.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Run Firefox using Flatpak.",
                expected: [
                    { command: "flatpak", requiredValues: ["run", "org.mozilla.firefox"] }
                ],
                explanation: "flatpak run launches application with proper sandboxing and permissions.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Show detailed information about the Firefox application.",
                expected: [
                    { command: "flatpak", requiredValues: ["info", "org.mozilla.firefox"] }
                ],
                explanation: "info displays version, installation size, runtime dependencies, and commit hash.",
                points: 3
            }
        ],
        
        // Set 2: User-Level Management and Permissions (20 points)
        set2: [
            {
                id: 1,
                category: "Implementation",
                description: "Add the Flathub remote for the current user only (use --user flag, --if-not-exists and https://flathub.org/repo/flathub.flatpakrepo).",
                expected: [
                    { command: "flatpak", requiredFlags: ["--if-not-exists", "--user"], requiredValues: ["remote-add", "flathub", "https://flathub.org/repo/flathub.flatpakrepo"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredFlags: ["--user"], requiredValues: ["remotes"] }
                ],
                explanation: "--user scopes remote to current user's ~/.local/share/flatpak. No root required.",
                points: 4
            },
            {
                id: 2,
                category: "Implementation",
                description: "Install GIMP (org.gimp.GIMP) from Flathub for the current user only, without confirmation prompts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--user", "-y"], requiredValues: ["install", "flathub", "org.gimp.GIMP"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredFlags: ["--user"], requiredValues: ["list"] }
                ],
                explanation: "User-level installation requires no privileges. Applications stored in user space.",
                points: 4
            },
            {
                id: 3,
                category: "Audit",
                description: "List all Flatpak applications installed for the current user.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--user", "--app"], requiredValues: ["list"] }
                ],
                explanation: "--user shows only user-installed apps. System apps require omitting --user flag.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Grant Firefox (org.mozilla.firefox) access to the home directory for the current user.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--user", "--filesystem=home"], requiredValues: ["override", "org.mozilla.firefox"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredFlags: ["--show-permissions"], requiredValues: ["info", "org.mozilla.firefox"] }
                ],
                explanation: "override modifies sandbox permissions. --filesystem=home grants home directory access.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Show the permissions for Firefox (org.mozilla.firefox).",
                expected: [
                    { command: "flatpak", requiredFlags: ["--show-permissions"], requiredValues: ["info", "org.mozilla.firefox"] }
                ],
                explanation: "Displays filesystem access, network access, device access, and D-Bus permissions.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Update all Flatpak applications without confirmation prompts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["-y"], requiredValues: ["update"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["list"] }
                ],
                explanation: "Updates all applications and runtimes. Run weekly alongside DNF updates.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Remove all unused Flatpak runtimes without confirmation prompts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--unused", "-y"], requiredValues: ["uninstall"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredFlags: ["--runtime"], requiredValues: ["list"] }
                ],
                explanation: "--unused removes runtimes no longer required by installed applications. Saves disk space.",
                points: 3
            }
        ],
        
        // Set 3: Offline Installation and Maintenance (20 points)
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Add a local Flatpak remote named 'usb-repo' from /mnt/usb/flatpak-offline for the current user. Disable GPG verification using --no-gpg-verify.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--user", "--no-gpg-verify"], requiredValues: ["remote-add", "usb-repo", "/mnt/usb/flatpak-offline"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredFlags: ["--user"], requiredValues: ["remotes"] }
                ],
                explanation: "--no-gpg-verify required for local repositories. Critical for air-gapped environments.",
                points: 4
            },
            {
                id: 2,
                category: "Audit",
                description: "List all available applications in the usb-repo remote.",
                expected: [
                    { command: "flatpak", requiredValues: ["remote-ls", "usb-repo"] }
                ],
                explanation: "remote-ls shows applications/runtimes available from specific remote.",
                points: 2
            },
            {
                id: 3,
                category: "Implementation",
                description: "Install LibreOffice (org.libreoffice.LibreOffice) from usb-repo without confirmation prompts.",
                expected: [
                    { command: "flatpak", requiredFlags: ["-y"], requiredValues: ["install", "usb-repo", "org.libreoffice.LibreOffice"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["remote-ls", "usb-repo"] }
                ],
                explanation: "Install from USB works identically to online remotes. Runtimes included on USB.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Remove the usb-repo remote.",
                expected: [
                    { command: "flatpak", requiredValues: ["remote-delete", "usb-repo"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["remotes"] }
                ],
                explanation: "remote-delete removes remote configuration. Doesn't affect installed applications.",
                points: 2
            },
            {
                id: 5,
                category: "Implementation",
                description: "Repair the Flatpak installation for the current user.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--user"], requiredValues: ["repair"] }
                ],
                allowedPreChecks: [],
                explanation: "repair verifies refs, checks metadata, and prunes orphaned objects. Fixes corruption.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Uninstall GIMP (org.gimp.GIMP) and delete its application data.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--delete-data"], requiredValues: ["uninstall", "org.gimp.GIMP"] }
                ],
                allowedPreChecks: [
                    { command: "flatpak", requiredValues: ["list"] }
                ],
                explanation: "--delete-data removes application data from ~/.var/app/. Default preserves data.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "List all installed Flatpak runtimes.",
                expected: [
                    { command: "flatpak", requiredFlags: ["--runtime"], requiredValues: ["list"] }
                ],
                explanation: "Runtimes are shared frameworks (Freedesktop, GNOME platforms). Updated separately.",
                points: 3
            }
        ]
    }
};
