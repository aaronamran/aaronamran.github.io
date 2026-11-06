// Section 19: Root Password Reset
// RHCSA - Root password recovery using rd.break and the boot simulator
const section19Data = {
    id: 19,
    title: "Root Password Reset",
    description: "Master root password recovery using rd.break and rescue methods",
    totalPoints: 22,
    questionSets: {
        // Set 1: Full rd.break recovery flow (tasks 1 in terminal, 2-8 in boot simulator)
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
                description: "Append 'rd.break' to the end of the linux kernel line, then press Ctrl+X to boot.",
                explanation: "rd.break interrupts initramfs before switching to the real root, dropping you into a rescue shell with /sysroot available.",
                points: 4
            },
            {
                id: 4,
                bootModal: true,
                category: "Implementation",
                description: "Remount /sysroot as read-write.",
                expected: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rw", "/sysroot"] }
                ],
                explanation: "/sysroot is mounted read-only by default in the rd.break shell. Write access is required to modify /etc/shadow.",
                points: 3
            },
            {
                id: 5,
                bootModal: true,
                category: "Implementation",
                description: "Change root into /sysroot to access the real filesystem.",
                expected: [
                    { command: "chroot", requiredValues: ["/sysroot"] }
                ],
                explanation: "chroot /sysroot makes /sysroot the new root directory, giving full access to the installed system.",
                points: 3
            },
            {
                id: 6,
                bootModal: true,
                category: "Implementation",
                description: "Reset the root password. Set the new password to: redhat",
                expected: [
                    { command: "passwd", requiredValues: ["root"] },
                    { command: "passwd", requiredValues: [] }
                ],
                explanation: "passwd changes the root password on the real filesystem. You will be prompted to enter and confirm a new password.",
                points: 4
            },
            {
                id: 7,
                bootModal: true,
                category: "Implementation",
                description: "Create the SELinux relabel file so file contexts are fixed on next boot.",
                expected: [
                    { command: "touch", requiredValues: ["/.autorelabel"] }
                ],
                explanation: "Without /.autorelabel, SELinux will deny login because /etc/shadow was modified outside SELinux's awareness.",
                points: 3
            },
            {
                id: 8,
                bootModal: true,
                category: "Implementation",
                description: "Exit the chroot shell, then exit the switch_root shell to restart the system.",
                expected: [
                    { command: "exit", requiredValues: [] }
                ],
                explanation: "The first 'exit' leaves the chroot (sh-5.1#). The second 'exit' leaves switch_root, triggering the reboot and SELinux relabeling.",
                points: 2
            }
        ]
    }
};

