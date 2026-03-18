const section14Data = {
    id: 14,
    title: "Boot Process & GRUB",
    description: "Manage systemd targets, GRUB2, and boot process (Boot simulator tasks moved to Phase 2)",
    totalPoints: 30,
    questionSets: {
        // Set 1: Systemd targets
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "Display current default systemd target.",
                expected: [
                    { command: "systemctl", requiredValues: ["get-default"] }
                ],
                explanation: "Default target determines which services start at boot.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Set default target to multi-user (text mode).",
                expected: [
                    { command: "systemctl", requiredValues: ["set-default", "multi-user.target"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["get-default"] }
                ],
                explanation: "multi-user.target = runlevel 3 (text mode, networking enabled).",
                points: 3
            },
            {
                id: 3,
                category: "Audit",
                description: "Set default target to graphical (GUI mode).",
                expected: [
                    { command: "systemctl", requiredValues: ["set-default", "graphical.target"] }
                ],
                explanation: "graphical.target = runlevel 5 (GUI desktop environment).",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "List all available systemd targets.",
                expected: [
                    { command: "systemctl", requiredValues: ["list-units", "--type=target"] },
                    { command: "systemctl", requiredValues: ["list-units", "-t", "target"] }
                ],
                allowedPreChecks: [],
                explanation: "Targets group units for specific system states.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Switch to rescue target (single-user mode).",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "rescue.target"] }
                ],
                explanation: "isolate stops other units not required by target. Like runlevel 1.",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Switch to emergency target (minimal environment).",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "emergency.target"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["list-units", "-t", "target"] }
                ],
                explanation: "Emergency is more minimal than rescue. Root filesystem mounted read-only.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Return to default target.",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "default.target"] }
                ],
                explanation: "default.target is symlink to actual default (multi-user or graphical).",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "View dependencies of graphical target.",
                expected: [
                    { command: "systemctl", requiredValues: ["list-dependencies", "graphical.target"] }
                ],
                allowedPreChecks: [],
                explanation: "Shows tree of required units and targets.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Check if system boots into multi-user or graphical.",
                expected: [
                    { command: "systemctl", requiredValues: ["get-default"] },
                    { command: "ls", requiredFlags: ["-l"], requiredValues: ["/etc/systemd/system/default.target"] }
                ],
                explanation: "default.target symlink points to actual boot target.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "View current active target.",
                expected: [
                    { command: "systemctl", requiredValues: ["list-units", "--type=target", "--state=active"] }
                ],
                allowedPreChecks: [],
                explanation: "Multiple targets can be active simultaneously.",
                points: 2
            }
        ],
        
        // Set 2: GRUB2 configuration
        set2: [
            {
                id: 1,
                category: "Audit",
                description: "View GRUB2 configuration file.",
                expected: [
                    { command: "cat", requiredValues: ["/boot/grub2/grub.cfg"] },
                    { command: "less", requiredValues: ["/boot/grub2/grub.cfg"] }
                ],
                explanation: "Auto-generated file. DO NOT edit directly!",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Edit GRUB2 defaults configuration.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/default/grub"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/default/grub"] }
                ],
                explanation: "Edit this file, then run grub2-mkconfig to apply changes.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Regenerate GRUB2 configuration after editing defaults.",
                expected: [
                    { command: "grub2-mkconfig", requiredFlags: ["-o"], requiredValues: ["/boot/grub2/grub.cfg"] }
                ],
                explanation: "Reads /etc/default/grub and generates new grub.cfg.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Change GRUB timeout to 10 seconds.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/default/grub"] },
                    { command: "sed", requiredFlags: ["-i"], requiredValues: ["'s/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/'", "/etc/default/grub"] }
                ],
                allowedPreChecks: [
                    { command: "grep", requiredValues: ["GRUB_TIMEOUT", "/etc/default/grub"] }
                ],
                explanation: "GRUB_TIMEOUT sets boot menu display time. Remember grub2-mkconfig!",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Set default boot entry by index.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/default/grub"] }
                ],
                explanation: "GRUB_DEFAULT=0 (first entry), =1 (second), or ='saved' for last booted.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Add kernel parameter to GRUB_CMDLINE_LINUX.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/default/grub"] }
                ],
                allowedPreChecks: [
                    { command: "cat", requiredValues: ["/etc/default/grub"] }
                ],
                explanation: "Append to GRUB_CMDLINE_LINUX='...'. Applied to all boot entries.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "List all GRUB menu entries.",
                expected: [
                    { command: "grubby", requiredValues: ["--info=ALL"] },
                    { command: "awk", requiredFlags: ["-F"], requiredValues: ["'", "/menuentry", "/", "{print", "$2}", "/boot/grub2/grub.cfg"] }
                ],
                explanation: "grubby tool manages boot entries. Also grep menuentry grub.cfg.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Set default boot kernel with grubby.",
                expected: [
                    { command: "grubby", requiredValues: ["--set-default", "/boot/vmlinuz-*"] }
                ],
                allowedPreChecks: [
                    { command: "grubby", requiredValues: ["--default-kernel"] }
                ],
                explanation: "grubby --set-default sets kernel without editing config files.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "View current kernel command line.",
                expected: [
                    { command: "cat", requiredValues: ["/proc/cmdline"] }
                ],
                explanation: "Shows actual kernel parameters used for current boot.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Reinstall GRUB2 to MBR after corruption.",
                expected: [
                    { command: "grub2-install", requiredValues: ["/dev/sda"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk", requiredValues: [] }
                ],
                explanation: "Writes GRUB bootloader to disk MBR. Use device, not partition.",
                points: 4
            }
        ],
        
        // ===== PHASE 2: Boot Simulator Required =====
        // Set 3 & Set 6 moved to boot simulator (cannot be practiced in terminal)
        // These will be enabled when boot simulator modal is implemented
        
        /* PHASE 2 - Boot Simulator
        // Set 3: Boot parameters and troubleshooting
        set3: [
            {
                id: 1,
                category: "Implementation",
                description: "Boot to rescue mode from GRUB menu.",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "rescue.target"] }
                ],
                allowedPreChecks: [],
                explanation: "At GRUB: edit entry, append 'systemd.unit=rescue.target' to kernel line.",
                points: 3
            },
            {
                id: 2,
                category: "Audit",
                description: "Boot to emergency mode from GRUB menu.",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "emergency.target"] }
                ],
                explanation: "Append 'systemd.unit=emergency.target' or just 'emergency' to kernel line.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Boot with init=/bin/bash for password recovery.",
                expected: [
                    { command: "passwd", requiredValues: ["root"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredFlags: ["-o"], requiredValues: ["remount,rw", "/"] }
                ],
                explanation: "Bypasses systemd. Must remount / read-write, then touch /.autorelabel.",
                points: 4
            },
            {
                id: 4,
                category: "Audit",
                description: "Add rd.break to break at initramfs.",
                expected: [
                    { command: "chroot", requiredValues: ["/sysroot"] }
                ],
                explanation: "Drops to rescue shell before pivot to real root. Mount sysroot, chroot in.",
                points: 4
            },
            {
                id: 5,
                category: "Implementation",
                description: "Enable debug logging for systemd boot.",
                expected: [
                    { command: "systemd.log_level=debug", requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "Kernel parameter: systemd.log_level=debug. Verbose boot output.",
                points: 2
            },
            {
                id: 6,
                category: "Audit",
                description: "Boot with single or 1 for single-user mode.",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "rescue.target"] }
                ],
                explanation: "Legacy parameter. Equivalent to rescue.target in systemd.",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Disable SELinux at boot temporarily.",
                expected: [
                    { command: "setenforce", requiredValues: ["0"] }
                ],
                allowedPreChecks: [],
                explanation: "Kernel parameter: selinux=0 (disable) or enforcing=0 (permissive).",
                points: 2
            },
            {
                id: 8,
                category: "Audit",
                description: "Boot to specific systemd target via kernel parameter.",
                expected: [
                    { command: "systemd.unit=multi-user.target", requiredValues: [] }
                ],
                explanation: "Append systemd.unit=TARGET.target to kernel line at GRUB.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "View boot messages after system starts.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-b"], requiredValues: [] },
                    { command: "dmesg", requiredValues: [] }
                ],
                allowedPreChecks: [],
                explanation: "journalctl -b shows current boot logs. dmesg shows kernel messages.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "List previous boots in journal.",
                expected: [
                    { command: "journalctl", requiredValues: ["--list-boots"] }
                ],
                explanation: "Shows boot IDs. Use journalctl -b -1 for previous boot logs.",
                points: 2
            }
        ], // End Set 3 - Requires boot simulator
        */ // End PHASE 2 - Set 3
        
        // Set 4: Kernel management
        set4: [
            {
                id: 1,
                category: "Audit",
                description: "Display currently running kernel version.",
                expected: [
                    { command: "uname", requiredFlags: ["-r"], requiredValues: [] },
                    { command: "uname", requiredFlags: ["-a"], requiredValues: [] }
                ],
                explanation: "uname -r shows kernel release. -a shows all system info.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "List all installed kernels.",
                expected: [
                    { command: "rpm", requiredFlags: ["-q"], requiredValues: ["kernel"] },
                    { command: "dnf", requiredValues: ["list", "installed", "kernel"] }
                ],
                allowedPreChecks: [],
                explanation: "Multiple kernels can be installed for fallback.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "View kernel files in /boot.",
                expected: [
                    { command: "ls", requiredValues: ["/boot/vmlinuz-*"] },
                    { command: "ls", requiredFlags: ["-lh"], requiredValues: ["/boot"] }
                ],
                explanation: "vmlinuz-* = kernel, initramfs-* = initial RAM filesystem.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Install new kernel package.",
                expected: [
                    { command: "dnf", requiredValues: ["install", "kernel", "-y"] },
                    { command: "yum", requiredValues: ["install", "kernel", "-y"] }
                ],
                allowedPreChecks: [
                    { command: "dnf", requiredValues: ["check-update", "kernel"] }
                ],
                explanation: "Always install (not update) kernel to keep old version as fallback.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Remove old kernel packages.",
                expected: [
                    { command: "dnf", requiredValues: ["remove", "kernel-X.X.X"] },
                    { command: "package-cleanup", requiredValues: ["--oldkernels", "--count=2"] }
                ],
                explanation: "Keep at least 2 kernels. NEVER remove running kernel!",
                points: 3
            },
            {
                id: 6,
                category: "Implementation",
                description: "Regenerate initramfs for current kernel.",
                expected: [
                    { command: "dracut", requiredFlags: ["-f"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/boot/initramfs-*"] }
                ],
                explanation: "dracut -f overwrites existing initramfs. Needed after driver changes.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "View loaded kernel modules.",
                expected: [
                    { command: "lsmod", requiredValues: [] }
                ],
                explanation: "Lists currently loaded kernel modules with size and dependencies.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Load kernel module manually.",
                expected: [
                    { command: "modprobe", requiredValues: ["module_name"] }
                ],
                allowedPreChecks: [
                    { command: "lsmod", requiredValues: ["|", "grep", "module_name"] }
                ],
                explanation: "modprobe loads module with dependencies. insmod doesn't handle dependencies.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Unload kernel module.",
                expected: [
                    { command: "modprobe", requiredFlags: ["-r"], requiredValues: ["module_name"] },
                    { command: "rmmod", requiredValues: ["module_name"] }
                ],
                explanation: "modprobe -r removes module and unused dependencies. rmmod removes only specified module.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "View kernel module information.",
                expected: [
                    { command: "modinfo", requiredValues: ["module_name"] }
                ],
                allowedPreChecks: [],
                explanation: "Shows version, description, parameters, dependencies.",
                points: 2
            }
        ],
        
        // Set 5: systemctl boot analysis
        set5: [
            {
                id: 1,
                category: "Audit",
                description: "Analyze boot time performance.",
                expected: [
                    { command: "systemd-analyze", requiredValues: [] }
                ],
                explanation: "Shows total boot time breakdown: kernel, initrd, userspace.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Show slowest services during boot.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["blame"] }
                ],
                allowedPreChecks: [],
                explanation: "Lists services sorted by initialization time. Identifies bottlenecks.",
                points: 2
            },
            {
                id: 3,
                category: "Audit",
                description: "Display critical chain of boot process.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["critical-chain"] }
                ],
                explanation: "Shows dependency chain that took longest. @ markers show timing.",
                points: 2
            },
            {
                id: 4,
                category: "Implementation",
                description: "Plot boot sequence to SVG file.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["plot", ">", "boot.svg"] }
                ],
                allowedPreChecks: [],
                explanation: "Visual timeline of service activation. Open in web browser.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify systemd unit files for errors.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["verify", "unit.service"] }
                ],
                explanation: "Checks unit file syntax and dependencies without loading.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Show service security analysis.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["security", "service.service"] }
                ],
                allowedPreChecks: [
                    { command: "systemctl", requiredValues: ["status", "service.service"] }
                ],
                explanation: "Rates security features enabled for service.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Dump complete systemd state.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["dump"] }
                ],
                explanation: "Shows all units, jobs, and their properties. Very verbose.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Verify time spans and unit sizes syntax.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["timespan", "1h", "30min"] },
                    { command: "systemd-analyze", requiredValues: ["unit-files"] }
                ],
                allowedPreChecks: [],
                explanation: "Validates systemd configuration value formats.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Check unit file paths being used.",
                expected: [
                    { command: "systemd-analyze", requiredValues: ["unit-paths"] }
                ],
                explanation: "Shows directories systemd searches for unit files.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Compare boot times across multiple boots.",
                expected: [
                    { command: "systemd-analyze", requiredValues: [] },
                    { command: "journalctl", requiredValues: ["--list-boots"] }
                ],
                allowedPreChecks: [],
                explanation: "Track boot performance changes over time.",
                points: 2
            }
        ]
        
        /* PHASE 2 - Boot Simulator
        // Set 6: Boot recovery procedures  
        , set6: [
            {
                id: 1,
                category: "Implementation",
                description: "Reset root password using rd.break method.",
                expected: [
                    { command: "passwd", requiredValues: ["root"] }
                ],
                allowedPreChecks: [
                    { command: "mount", requiredValues: ["-o", "remount,rw", "/sysroot"] },
                    { command: "chroot", requiredValues: ["/sysroot"] }
                ],
                explanation: "Add rd.break to kernel params, mount -o remount,rw /sysroot, chroot /sysroot, passwd, touch /.autorelabel",
                points: 4
            },
            {
                id: 2,
                category: "Audit",
                description: "Repair corrupted filesystem at boot.",
                expected: [
                    { command: "fsck", requiredValues: ["/dev/sdXN"] }
                ],
                explanation: "Boot to rescue, unmount filesystem, run fsck. For root, add fsck.mode=force to kernel params.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Regenerate GRUB config after corruption.",
                expected: [
                    { command: "grub2-mkconfig", requiredFlags: ["-o"], requiredValues: ["/boot/grub2/grub.cfg"] }
                ],
                allowedPreChecks: [
                    { command: "ls", requiredValues: ["/boot/grub2/grub.cfg"] }
                ],
                explanation: "Boot from rescue media if GRUB completely broken.",
                points: 3
            },
            {
                id: 4,
                category: "Audit",
                description: "Fix fstab errors preventing boot.",
                expected: [
                    { command: "vi", requiredValues: ["/etc/fstab"] }
                ],
                explanation: "Boot to emergency mode, remount / rw, edit /etc/fstab, reboot.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Rebuild initramfs after missing kernel modules.",
                expected: [
                    { command: "dracut", requiredFlags: ["-f", "-v"], requiredValues: [] }
                ],
                allowedPreChecks: [
                    { command: "lsinitrd", requiredValues: ["/boot/initramfs-$(uname", "-r).img"] }
                ],
                explanation: "lsinitrd lists initramfs contents. dracut -f -v rebuilds with verbose output.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Boot older kernel version from GRUB menu.",
                expected: [
                    { command: "grubby", requiredValues: ["--default-index"] }
                ],
                explanation: "At GRUB menu, select from list. Make permanent: grubby --set-default-index=N",
                points: 2
            },
            {
                id: 7,
                category: "Implementation",
                description: "Disable problematic service preventing boot.",
                expected: [
                    { command: "systemctl", requiredValues: ["isolate", "rescue.target"] },
                    { command: "systemctl", requiredValues: ["mask", "problem.service"] }
                ],
                allowedPreChecks: [],
                explanation: "Boot to rescue, identify service with journalctl, systemctl mask to prevent start.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Restore system from rescue media.",
                expected: [
                    { command: "mount", requiredValues: ["/dev/sdXN", "/mnt"] },
                    { command: "chroot", requiredValues: ["/mnt"] }
                ],
                explanation: "Boot rescue ISO, mount root filesystem, chroot, fix issues, reinstall GRUB if needed.",
                points: 4
            },
            {
                id: 9,
                category: "Implementation",
                description: "Force SELinux relabel at next boot.",
                expected: [
                    { command: "touch", requiredValues: ["/.autorelabel"] }
                ],
                allowedPreChecks: [],
                explanation: "Required after password reset or context changes in rescue mode.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "View and analyze boot failures.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-xb"], requiredValues: [] },
                    { command: "systemctl", requiredValues: ["--failed"] }
                ],
                explanation: "journalctl -xb shows boot with explanations. --failed lists failed services.",
                points: 2
            }
        ] // End Set 6 - Requires boot simulator
        */ // End PHASE 2 - Set 6
    }
};
