const section15Data = {
    id: 15,
    title: "Boot Process & Maintenance",
    description: "Manage systemd targets, GRUB2, and boot process",
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
                    { command: "systemctl", requiredValues: ["list-units", "-t", "target"] },
                    { command: "systemctl", requiredValues: ["list-unit-files", "--type=target"] }
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
                description: "Write the line for /etc/default/grub that sets the boot menu timeout to 10 seconds.",
                expected: [{ command: "sed", requiredFlags: ["-i"], requiredValues: ["s/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=10/", "/etc/default/grub"] }, { match: ["^GRUB_TIMEOUT=10$","^echo [\"']GRUB_TIMEOUT=10[\"'] ?>>? ?\\S+$"] }],
                hint: "Variable name is GRUB_TIMEOUT",
                explanation: "After editing /etc/default/grub, regenerate the config with grub2-mkconfig -o /boot/grub2/grub.cfg.",
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
                category: "Implementation",
                description: "Write the line for /etc/default/grub that makes the second menu entry (index 1) the default.",
                expected: [{ match: ["^GRUB_DEFAULT=1$","^echo [\"']GRUB_DEFAULT=1[\"'] ?>>? ?\\S+$"] }],
                hint: "Variable name is GRUB_DEFAULT",
                explanation: "Indexes start at 0. GRUB_DEFAULT=saved together with grub2-set-default is the usual RHEL setup.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Write the line for /etc/default/grub that sets GRUB_CMDLINE_LINUX to contain the kernel argument console=ttyS0.",
                expected: [{ match: ["^GRUB_CMDLINE_LINUX=[\"'][^\"']*console=ttyS0[^\"']*[\"']$","^echo [\"']GRUB_CMDLINE_LINUX=[\"'][^\"']*console=ttyS0[^\"']*[\"'][\"'] ?>>? ?\\S+$"] }],
                hint: "Variable name is GRUB_CMDLINE_LINUX",
                explanation: "Keep the existing arguments inside the quotes and add the new one. Regenerate grub.cfg afterwards.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "List all GRUB menu entries.",
                expected: [
                    { command: "grubby", requiredValues: ["--info=ALL"] },
                    { command: "awk", requiredFlags: ["-F"], requiredValues: ["/menuentry", "{print", "$2}", "/boot/grub2/grub.cfg"] }
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
                description: "Reinstall GRUB2 to MBR after corruption (Legacy BIOS).",
                expected: [
                    { command: "grub2-install", requiredValues: ["/dev/sda"] }
                ],
                allowedPreChecks: [
                    { command: "lsblk", requiredValues: [] },
                    { command: "fdisk", requiredValues: ["-l"] }
                ],
                explanation: "Installs the GRUB2 bootloader image to the boot sector of the specified disk. Note: For UEFI systems, RHEL prefers EFI executable management over this command.",
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
        
        // Set 3: GRUB2 entries, kernel arguments and scheduled reboots
        set3: [
            {
                id: 1,
                category: "Audit",
                description: "Display the GRUB2 environment block to see which boot entry is saved as the default.",
                expected: [{"command":"grub2-editenv","requiredValues":["list"]}],
                allowedPreChecks: [],
                explanation: "grub2-editenv list prints saved_entry (and boot_success/boot_indeterminate) from /boot/grub2/grubenv.",
                points: 2
            },
            {
                id: 2,
                category: "Implementation",
                description: "Make the second boot menu entry (index 1) the permanent default.",
                expected: [{"command":"grub2-set-default","requiredValues":["1"]}],
                allowedPreChecks: [{"command":"grub2-editenv","requiredValues":["list"]}],
                explanation: "grub2-set-default writes saved_entry to grubenv. Verify with grub2-editenv list.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Boot entry index 0 only on the next reboot, without changing the permanent default.",
                expected: [{"command":"grub2-reboot","requiredValues":["0"]}],
                allowedPreChecks: [],
                explanation: "grub2-reboot sets next_entry in grubenv. GRUB boots it once, then reverts to saved_entry.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Add the kernel argument console=ttyS0 to every installed kernel.",
                expected: [{"command":"grubby","requiredFlags":["--update-kernel=ALL","--args=console=ttyS0"]},{"command":"grubby","requiredFlags":["--update-kernel","--args"],"requiredValues":["ALL","console=ttyS0"]}],
                allowedPreChecks: [],
                explanation: "grubby edits the BLS entries in /boot/loader/entries, so no grub2-mkconfig is needed.",
                points: 3
            },
            {
                id: 5,
                category: "Implementation",
                description: "Remove the kernel argument quiet from every installed kernel.",
                expected: [{"command":"grubby","requiredFlags":["--update-kernel=ALL","--remove-args=quiet"]},{"command":"grubby","requiredFlags":["--update-kernel","--remove-args"],"requiredValues":["ALL","quiet"]}],
                allowedPreChecks: [],
                explanation: "Removing quiet makes boot messages visible, which helps when troubleshooting.",
                points: 3
            },
            {
                id: 6,
                category: "Audit",
                description: "Show the full boot entry (kernel, args, initrd) of the current default kernel.",
                expected: [{"command":"grubby","requiredFlags":["--info=DEFAULT"]},{"command":"grubby","requiredFlags":["--info"],"requiredValues":["DEFAULT"]}],
                allowedPreChecks: [],
                explanation: "grubby --info=DEFAULT prints the index, kernel path, args, root, initrd and title.",
                points: 2
            },
            {
                id: 7,
                category: "Audit",
                description: "List the Boot Loader Specification entry files that GRUB2 uses on RHEL 9.",
                expected: [{"command":"ls","requiredValues":["/boot/loader/entries"]},{"command":"ls","requiredFlags":["-l"],"requiredValues":["/boot/loader/entries"]}],
                allowedPreChecks: [],
                explanation: "RHEL 8/9 keep one .conf per kernel in /boot/loader/entries instead of generating menuentry blocks.",
                points: 2
            },
            {
                id: 8,
                category: "Implementation",
                description: "Protect the GRUB2 menu with a password (interactive).",
                expected: [{"command":"grub2-setpassword"}],
                allowedPreChecks: [],
                explanation: "grub2-setpassword stores a PBKDF2 hash in /boot/grub2/user.cfg; editing entries then requires the root superuser login.",
                points: 3
            },
            {
                id: 9,
                category: "Implementation",
                description: "Schedule a reboot in 5 minutes.",
                expected: [{"command":"shutdown","requiredFlags":["-r"],"requiredValues":["+5"]}],
                allowedPreChecks: [],
                explanation: "shutdown -r +5 broadcasts a warning to logged-in users and reboots after five minutes.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Cancel the pending scheduled shutdown.",
                expected: [{"command":"shutdown","requiredFlags":["-c"]}],
                allowedPreChecks: [],
                explanation: "shutdown -c cancels a scheduled shutdown or reboot.",
                points: 2
            }
        ],
        
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
                    { command: "ls", requiredFlags: ["-l", "-h"], requiredValues: ["/boot"] }
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
            // Root password reset tasks moved to Section 19
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
                explanation: "Required after password reset or context changes in rescue mode. See Section 19 for password reset tasks.",
                points: 2
            },
            {
                id: 10,
                category: "Audit",
                description: "View and analyze boot failures.",
                expected: [
                    { command: "journalctl", requiredFlags: ["-x", "-b"], requiredValues: [] },
                    { command: "systemctl", requiredValues: ["--failed"] }
                ],
                explanation: "journalctl -xb shows boot with explanations. --failed lists failed services.",
                points: 2
            }
        ] // End Set 6 - Requires boot simulator
        */ // End PHASE 2 - Set 6
        ,
        // Set 6: Journal, boot logs and power management
        set6: [
            {
                id: 1,
                category: "Audit",
                description: "Show when the system was last rebooted.",
                expected: [{"command":"last","requiredValues":["reboot"]}],
                allowedPreChecks: [],
                explanation: "last reboot reads /var/log/wtmp and lists every boot with its kernel version.",
                points: 2
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the journal messages of the previous boot.",
                expected: [{"command":"journalctl","requiredFlags":["-b","-1"]},{"command":"journalctl","requiredFlags":["--boot=-1"]}],
                allowedPreChecks: [],
                explanation: "-b -1 selects the previous boot; this only works if the journal is persistent.",
                points: 3
            },
            {
                id: 3,
                category: "Implementation",
                description: "Create the directory that makes the systemd journal persistent across reboots.",
                expected: [{"command":"mkdir","requiredValues":["/var/log/journal"]},{"command":"mkdir","requiredFlags":["-p"],"requiredValues":["/var/log/journal"]}],
                allowedPreChecks: [],
                explanation: "With Storage=auto (default), journald stores logs on disk only if /var/log/journal exists.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Restart the journal daemon so it starts using /var/log/journal.",
                expected: [{"command":"systemctl","requiredValues":["restart","systemd-journald"]},{"command":"journalctl","requiredFlags":["--flush"]}],
                allowedPreChecks: [],
                explanation: "Restarting systemd-journald (or journalctl --flush) moves /run/log/journal into the persistent location.",
                points: 3
            },
            {
                id: 5,
                category: "Audit",
                description: "Show how much disk space the journal uses.",
                expected: [{"command":"journalctl","requiredFlags":["--disk-usage"]}],
                allowedPreChecks: [],
                explanation: "journalctl --disk-usage reports archived and active journal files.",
                points: 2
            },
            {
                id: 6,
                category: "Implementation",
                description: "Shrink the archived journal to at most 200M.",
                expected: [{"command":"journalctl","requiredFlags":["--vacuum-size=200M"]}],
                allowedPreChecks: [],
                explanation: "--vacuum-size removes the oldest archived journal files until the limit is met.",
                points: 3
            },
            {
                id: 7,
                category: "Audit",
                description: "Show only messages of priority err or worse from the current boot.",
                expected: [{"command":"journalctl","requiredFlags":["-b","-p"],"requiredValues":["err"]},{"command":"journalctl","requiredFlags":["-b","-p"],"requiredValues":["3"]}],
                allowedPreChecks: [],
                explanation: "-p err includes err, crit, alert and emerg. Combine with -b to limit the output to this boot.",
                points: 3
            },
            {
                id: 8,
                category: "Audit",
                description: "Check that the kdump service, which uses the crashkernel= boot parameter, is running.",
                expected: [{"command":"systemctl","requiredValues":["status","kdump"]},{"command":"systemctl","requiredValues":["is-active","kdump"]}],
                allowedPreChecks: [],
                explanation: "kdump needs memory reserved with crashkernel= on the kernel command line.",
                points: 2
            },
            {
                id: 9,
                category: "Audit",
                description: "Show the system runlevel equivalent and last boot time with who.",
                expected: [{"command":"who","requiredFlags":["-r"]},{"command":"who","requiredFlags":["-b"]}],
                allowedPreChecks: [],
                explanation: "who -r shows the runlevel; who -b shows the time of the last boot.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Reboot the system using systemd.",
                expected: [{"command":"systemctl","requiredValues":["reboot"]}],
                allowedPreChecks: [],
                explanation: "systemctl reboot is the systemd equivalent of reboot; poweroff and halt work the same way.",
                points: 2
            }
        ]
    }
};
