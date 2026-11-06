// Section 20: Root Password Reset — init=/bin/bash Method (RHEL 10)
// RHCSA - Root password recovery using init=/bin/bash boot parameter
const section20Data = {
    id: 20,
    title: "Root Password Reset (Bash Method)",
    description: "Reset the root password on RHEL 10 using the init=/bin/bash boot parameter",
    totalPoints: 19,
    questionSets: {
        // Set 1: Full init=/bin/bash recovery flow (task 1 in terminal, 2-8 in boot simulator)
        set1: [
            // ── Task 1: Normal terminal — triggers the boot simulator ──────────
            {
                id: 1,
                category: "Implementation",
                description: "Reboot the system to begin the root password reset procedure.",
                expected: [
                    { command: "reboot", requiredValues: [] },
                    { command: "systemctl", requiredValues: ["reboot"] }
                ],
                explanation: "Rebooting is the first step — you need to interrupt GRUB during startup to enter recovery mode.",
                points: 1,
                triggersBootModal: true
            },

            // ── Tasks 2-8: Completed inside the Boot Simulator modal ──────────
            {
                id: 2,
                bootModal: true,
                category: "Implementation",
                description: "At the GRUB menu, press 'e' to edit the boot entry.",
                explanation: "Pressing 'e' at the GRUB menu opens the kernel boot parameters for editing.",
                points: 2
            },
            {
                id: 3,
                bootModal: true,
                category: "Implementation",
                description: "Append 'init=/bin/bash' to the end of the linux kernel line, then press Ctrl+X to boot.",
                explanation: "init=/bin/bash replaces systemd with a direct bash shell, giving you root access before any services or SELinux start.",
                points: 4
            },
            {
                id: 4,
                bootModal: true,
                category: "Implementation",
                description: "Remount the root filesystem as read-write.",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rw", "/"] }
                ],
                explanation: "The root filesystem is mounted read-only. You must remount it rw to modify /etc/shadow.",
                points: 3
            },
            {
                id: 5,
                bootModal: true,
                category: "Implementation",
                description: "Reset the root password. Set the new password to: redhat",
                expected: [
                    { command: "passwd", requiredValues: [] }
                ],
                explanation: "Since you are already root in the bash shell, 'passwd' without arguments changes the root password directly.",
                points: 4
            },
            {
                id: 6,
                bootModal: true,
                category: "Implementation",
                description: "Create the SELinux relabel file so file contexts are fixed on next boot.",
                expected: [
                    { command: "touch", requiredValues: ["/.autorelabel"] }
                ],
                explanation: "Without /.autorelabel, SELinux will deny login because /etc/shadow was modified outside SELinux's awareness.",
                points: 2
            },
            {
                id: 7,
                bootModal: true,
                category: "Implementation",
                description: "Flush all filesystem buffers to disk before rebooting.",
                expected: [
                    { command: "sync", requiredValues: [] }
                ],
                explanation: "sync commits all pending writes to disk. Required before a forced reboot to prevent data corruption.",
                points: 1
            },
            {
                id: 8,
                bootModal: true,
                category: "Implementation",
                description: "Force a reboot to apply changes and trigger SELinux relabeling.",
                expected: [
                    { command: "reboot", requiredFlags: ["-f"] }
                ],
                explanation: "reboot -f performs a forced kernel reboot, bypassing the normal shutdown. The /.autorelabel file triggers SELinux relabeling on next boot.",
                points: 2
            }
        ]
    }
};
