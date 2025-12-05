// Virtual Filesystem for RHCSA Practice Terminal
// Simulates a Linux filesystem with directories, files, permissions, and ownership

class VirtualFilesystem {
    constructor() {
        this.currentPath = '/root';
        this.currentUser = 'root';
        this.currentUid = 0;
        this.currentGid = 0;
        
        // Initialize filesystem structure
        this.fs = this.createInitialFilesystem();
        
        // User database (simulated /etc/passwd)
        this.users = {
            'root': { uid: 0, gid: 0, home: '/root', shell: '/bin/bash', password: 'x' },
            'aaron': { uid: 1000, gid: 1000, home: '/home/aaron', shell: '/bin/bash', password: 'x' },
            'student': { uid: 1001, gid: 1001, home: '/home/student', shell: '/bin/bash', password: 'x' }
        };
        
        // Group database (simulated /etc/group)
        this.groups = {
            'root': { gid: 0, members: ['root'] },
            'wheel': { gid: 10, members: ['root', 'aaron'] },
            'aaron': { gid: 1000, members: ['aaron'] },
            'student': { gid: 1001, members: ['student'] }
        };
    }
    
    createInitialFilesystem() {
        return {
            '/': {
                type: 'directory',
                permissions: '0755',
                owner: 'root',
                group: 'root',
                size: 4096,
                modified: new Date(),
                children: {
                    'root': {
                        type: 'directory',
                        permissions: '0700',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {
                            '.bashrc': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 176,
                                modified: new Date(),
                                content: '# .bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\n'
                            },
                            '.bash_history': {
                                type: 'file',
                                permissions: '0600',
                                owner: 'root',
                                group: 'root',
                                size: 0,
                                modified: new Date(),
                                content: ''
                            },
                            'scripts': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'backup.sh': {
                                        type: 'file',
                                        permissions: '0755',
                                        owner: 'root',
                                        group: 'root',
                                        size: 256,
                                        modified: new Date(),
                                        content: '#!/bin/bash\n# Backup script\ntar -czf /tmp/backup.tar.gz /etc\necho "Backup complete"\n'
                                    }
                                }
                            },
                            'documents': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'notes.txt': {
                                        type: 'file',
                                        permissions: '0644',
                                        owner: 'root',
                                        group: 'root',
                                        size: 128,
                                        modified: new Date(),
                                        content: 'RHCSA Practice Notes\n====================\n\nRemember to practice:\n- User management\n- File permissions\n- SELinux contexts\n'
                                    }
                                }
                            },
                            'README.txt': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 89,
                                modified: new Date(),
                                content: 'Welcome to the RHCSA practice environment!\n\nType "help" for available commands.\n'
                            }
                        }
                    },
                    'home': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {
                            'aaron': {
                                type: 'directory',
                                permissions: '0700',
                                owner: 'aaron',
                                group: 'aaron',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'projects': {
                                        type: 'directory',
                                        permissions: '0755',
                                        owner: 'aaron',
                                        group: 'aaron',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {}
                                    },
                                    'Documents': {
                                        type: 'directory',
                                        permissions: '0755',
                                        owner: 'aaron',
                                        group: 'aaron',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {}
                                    }
                                }
                            },
                            'student': {
                                type: 'directory',
                                permissions: '0700',
                                owner: 'student',
                                group: 'student',
                                size: 4096,
                                modified: new Date(),
                                children: {}
                            }
                        }
                    },
                    'etc': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {
                            'passwd': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: 'root:x:0:0:root:/root:/bin/bash\naaron:x:1000:1000:Aaron:/home/aaron:/bin/bash\nstudent:x:1001:1001:Student:/home/student:/bin/bash\n'
                            },
                            'group': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 128,
                                modified: new Date(),
                                content: 'root:x:0:\nwheel:x:10:root,aaron\naaron:x:1000:\nstudent:x:1001:\n'
                            },
                            'shadow': {
                                type: 'file',
                                permissions: '0000',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: 'root:$6$encrypted:19000:0:99999:7:::\n'
                            },
                            'hosts': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 64,
                                modified: new Date(),
                                content: '127.0.0.1   localhost localhost.localdomain\n192.168.1.10 rhcsa-lab.example.com rhcsa-lab\n'
                            },
                            'hostname': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 10,
                                modified: new Date(),
                                content: 'rhcsa-lab\n'
                            },
                            'fstab': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: '# /etc/fstab\nUUID=1234-5678  /       xfs     defaults        0 0\nUUID=abcd-efgh  /boot   ext4    defaults        0 0\n'
                            },
                            'sudoers': {
                                type: 'file',
                                permissions: '0440',
                                owner: 'root',
                                group: 'root',
                                size: 128,
                                modified: new Date(),
                                content: 'root    ALL=(ALL)       ALL\n%wheel  ALL=(ALL)       ALL\n'
                            },
                            'selinux': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'config': {
                                        type: 'file',
                                        permissions: '0644',
                                        owner: 'root',
                                        group: 'root',
                                        size: 128,
                                        modified: new Date(),
                                        content: 'SELINUX=enforcing\nSELINUXTYPE=targeted\n'
                                    }
                                }
                            },
                            'systemd': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'system': {
                                        type: 'directory',
                                        permissions: '0755',
                                        owner: 'root',
                                        group: 'root',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {
                                            'backup.timer': {
                                                type: 'file',
                                                permissions: '0644',
                                                owner: 'root',
                                                group: 'root',
                                                size: 256,
                                                modified: new Date(),
                                                content: '[Unit]\nDescription=Daily backup timer\nRequires=backup.service\n\n[Timer]\nOnCalendar=daily\nOnCalendar=*-*-* 02:00:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n'
                                            },
                                            'backup.service': {
                                                type: 'file',
                                                permissions: '0644',
                                                owner: 'root',
                                                group: 'root',
                                                size: 256,
                                                modified: new Date(),
                                                content: '[Unit]\nDescription=Daily backup service\n\n[Service]\nType=oneshot\nExecStart=/root/scripts/backup.sh\nUser=root\n'
                                            },
                                            'cleanup.timer': {
                                                type: 'file',
                                                permissions: '0644',
                                                owner: 'root',
                                                group: 'root',
                                                size: 256,
                                                modified: new Date(),
                                                content: '[Unit]\nDescription=Weekly cleanup timer\nRequires=cleanup.service\n\n[Timer]\nOnCalendar=weekly\nOnCalendar=Sun *-*-* 03:00:00\nPersistent=true\n\n[Install]\nWantedBy=timers.target\n'
                                            },
                                            'cleanup.service': {
                                                type: 'file',
                                                permissions: '0644',
                                                owner: 'root',
                                                group: 'root',
                                                size: 256,
                                                modified: new Date(),
                                                content: '[Unit]\nDescription=Weekly cleanup service\n\n[Service]\nType=oneshot\nExecStart=/usr/bin/find /tmp -type f -mtime +7 -delete\nUser=root\n'
                                            }
                                        }
                                    }
                                }
                            },
                            'yum.repos.d': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'rhel.repo': {
                                        type: 'file',
                                        permissions: '0644',
                                        owner: 'root',
                                        group: 'root',
                                        size: 256,
                                        modified: new Date(),
                                        content: '[rhel-9-baseos]\nname=Red Hat Enterprise Linux 9 - BaseOS\nbaseurl=https://cdn.redhat.com/content/dist/rhel9/\nenabled=1\ngpgcheck=1\n'
                                    }
                                }
                            },
                            'exports': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: '# /etc/exports - NFS export definitions\n/share          192.168.1.0/24(rw,sync,no_root_squash)\n/data           *(ro,sync)\n/home/shared    192.168.1.100(rw,sync) 192.168.1.101(rw,sync)\n/backup         10.0.0.0/8(ro,sync,all_squash)\n'
                            },
                            'auto.master': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: '# /etc/auto.master - Automount master map\n#\n# Mount point    Map file              Options\n/misc            /etc/auto.misc        --timeout=60\n/net             /etc/auto.net         --timeout=60\n/home            /etc/auto.home        --timeout=120\n'
                            },
                            'auto.misc': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 256,
                                modified: new Date(),
                                content: '# /etc/auto.misc - Miscellaneous automount entries\n#\n# Key            Options                Location\ncd               -fstype=iso9660,ro     :/dev/cdrom\nusb              -fstype=auto           :/dev/sdb1\nbackup           -fstype=nfs,ro         nfs-server.example.com:/backup\n'
                            },
                            'auto.net': {
                                type: 'file',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 128,
                                modified: new Date(),
                                content: '#!/bin/bash\n# /etc/auto.net - NFS automount script\n# This file is executable and generates NFS mount entries on-demand\nkey="$1"\necho "-fstype=nfs,rw ${key}:/"\n'
                            },
                            'auto.home': {
                                type: 'file',
                                permissions: '0644',
                                owner: 'root',
                                group: 'root',
                                size: 128,
                                modified: new Date(),
                                content: '# /etc/auto.home - Home directory automount entries\n#\n# Key            Options                Location\n*                -fstype=nfs,rw         nfs-server.example.com:/home/&\n'
                            }
                        }
                    },
                    'var': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {
                            'log': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'messages': {
                                        type: 'file',
                                        permissions: '0644',
                                        owner: 'root',
                                        group: 'root',
                                        size: 4096,
                                        modified: new Date(),
                                        content: 'Dec  5 10:30:00 rhcsa-lab systemd[1]: Started System Logging Service.\nDec  5 10:30:05 rhcsa-lab kernel: Linux version 5.14.0-362.8.1.el9_3.x86_64 (mockbuild@x86-vm-09.build.eng.bos.redhat.com)\nDec  5 10:30:10 rhcsa-lab NetworkManager[892]: <info>  [1701774610.4523] device (eth0): state change: ip-config -> ip-check (reason \'none\', sys-iface-state: \'managed\')\nDec  5 10:30:15 rhcsa-lab systemd[1]: Starting Firewall daemon...\nDec  5 10:30:20 rhcsa-lab firewalld[945]: SUCCESS: FIREWALL START\nDec  5 10:30:25 rhcsa-lab chronyd[823]: Selected source 216.239.35.0 (2.rhel.pool.ntp.org)\nDec  5 10:30:30 rhcsa-lab systemd[1]: Started NFS server and services.\nDec  5 10:30:35 rhcsa-lab autofs[1145]: lookup_mount: lookup(file): looking up /misc/cd\nDec  5 10:31:00 rhcsa-lab crond[1234]: (root) CMD (run-parts /etc/cron.hourly)\nDec  5 10:35:00 rhcsa-lab systemd[1]: Started User Manager for UID 1000.\nDec  5 11:00:00 rhcsa-lab kernel: SELinux: Context system_u:object_r:httpd_sys_content_t:s0 is not valid.\n'
                                    },
                                    'secure': {
                                        type: 'file',
                                        permissions: '0600',
                                        owner: 'root',
                                        group: 'root',
                                        size: 2048,
                                        modified: new Date(),
                                        content: 'Dec  5 10:30:00 rhcsa-lab sshd[1234]: Server listening on 0.0.0.0 port 22.\nDec  5 10:30:00 rhcsa-lab sshd[1234]: Server listening on :: port 22.\nDec  5 10:32:15 rhcsa-lab sudo:   aaron : TTY=pts/0 ; PWD=/home/aaron ; USER=root ; COMMAND=/usr/bin/systemctl status firewalld\nDec  5 10:32:15 rhcsa-lab sudo: pam_unix(sudo:session): session opened for user root by aaron(uid=1000)\nDec  5 10:32:16 rhcsa-lab sudo: pam_unix(sudo:session): session closed for user root\nDec  5 10:45:23 rhcsa-lab sshd[2345]: Accepted publickey for aaron from 192.168.1.100 port 54321 ssh2: RSA SHA256:abc123def456\nDec  5 10:45:23 rhcsa-lab sshd[2345]: pam_unix(sshd:session): session opened for user aaron by (uid=0)\nDec  5 11:15:00 rhcsa-lab unix_chkpwd[3456]: password check failed for user (student)\nDec  5 11:15:02 rhcsa-lab sshd[3457]: Failed password for student from 192.168.1.101 port 42000 ssh2\n'
                                    },
                                    'cron': {
                                        type: 'file',
                                        permissions: '0600',
                                        owner: 'root',
                                        group: 'root',
                                        size: 1024,
                                        modified: new Date(),
                                        content: 'Dec  5 10:00:01 rhcsa-lab CROND[5678]: (root) CMD (/usr/lib64/sa/sa1 1 1)\nDec  5 10:01:01 rhcsa-lab CROND[5689]: (root) CMD (run-parts /etc/cron.hourly)\nDec  5 11:00:01 rhcsa-lab CROND[5723]: (aaron) CMD (/home/aaron/scripts/backup.sh)\n'
                                    },
                                    'audit': {
                                        type: 'directory',
                                        permissions: '0700',
                                        owner: 'root',
                                        group: 'root',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {
                                            'audit.log': {
                                                type: 'file',
                                                permissions: '0600',
                                                owner: 'root',
                                                group: 'root',
                                                size: 8192,
                                                modified: new Date(),
                                                content: 'type=USER_AUTH msg=audit(1701774610.123:100): pid=1234 uid=1000 auid=1000 ses=3 msg=\'op=PAM:authentication acct="aaron" exe="/usr/bin/sudo" hostname=? addr=? terminal=/dev/pts/0 res=success\'\ntype=SYSCALL msg=audit(1701774610.456:101): arch=c000003e syscall=59 success=yes exit=0 a0=7ffe1234 a1=7ffe5678 ppid=1234 pid=2345 auid=1000 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 comm="systemctl"\n'
                                            }
                                        }
                                    }
                                }
                            },
                            'www': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'html': {
                                        type: 'directory',
                                        permissions: '0755',
                                        owner: 'root',
                                        group: 'root',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {}
                                    }
                                }
                            }
                        }
                    },
                    'usr': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {
                            'bin': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {}
                            },
                            'share': {
                                type: 'directory',
                                permissions: '0755',
                                owner: 'root',
                                group: 'root',
                                size: 4096,
                                modified: new Date(),
                                children: {
                                    'doc': {
                                        type: 'directory',
                                        permissions: '0755',
                                        owner: 'root',
                                        group: 'root',
                                        size: 4096,
                                        modified: new Date(),
                                        children: {}
                                    }
                                }
                            }
                        }
                    },
                    'tmp': {
                        type: 'directory',
                        permissions: '1777',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {}
                    },
                    'dev': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {}
                    },
                    'proc': {
                        type: 'directory',
                        permissions: '0555',
                        owner: 'root',
                        group: 'root',
                        size: 0,
                        modified: new Date(),
                        children: {}
                    },
                    'sys': {
                        type: 'directory',
                        permissions: '0555',
                        owner: 'root',
                        group: 'root',
                        size: 0,
                        modified: new Date(),
                        children: {}
                    },
                    'boot': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {}
                    },
                    'mnt': {
                        type: 'directory',
                        permissions: '0755',
                        owner: 'root',
                        group: 'root',
                        size: 4096,
                        modified: new Date(),
                        children: {}
                    }
                }
            }
        };
    }
    
    // Path resolution
    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        } else if (path === '~') {
            return this.users[this.currentUser].home;
        } else if (path.startsWith('~/')) {
            return this.users[this.currentUser].home + path.slice(1);
        } else if (path === '.') {
            return this.currentPath;
        } else if (path === '..') {
            const parts = this.currentPath.split('/').filter(p => p);
            parts.pop();
            return '/' + parts.join('/') || '/';
        } else {
            return this.currentPath === '/' 
                ? '/' + path 
                : this.currentPath + '/' + path;
        }
    }
    
    // Get node at path
    getNode(path) {
        const resolved = this.resolvePath(path);
        const parts = resolved.split('/').filter(p => p);
        
        let current = this.fs['/'];
        
        for (const part of parts) {
            if (!current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        
        return current;
    }
    
    // Check if path exists
    exists(path) {
        return this.getNode(path) !== null;
    }
    
    // Check permissions
    hasPermission(node, permission) {
        if (this.currentUid === 0) return true; // root can do anything
        
        const perms = node.permissions;
        const owner = node.owner;
        const group = node.group;
        
        // Check owner permissions
        if (this.currentUser === owner) {
            const ownerPerms = parseInt(perms[2]);
            if (permission === 'r' && (ownerPerms & 4)) return true;
            if (permission === 'w' && (ownerPerms & 2)) return true;
            if (permission === 'x' && (ownerPerms & 1)) return true;
        }
        
        // Check group permissions
        if (this.groups[group] && this.groups[group].members.includes(this.currentUser)) {
            const groupPerms = parseInt(perms[3]);
            if (permission === 'r' && (groupPerms & 4)) return true;
            if (permission === 'w' && (groupPerms & 2)) return true;
            if (permission === 'x' && (groupPerms & 1)) return true;
        }
        
        // Check other permissions
        const otherPerms = parseInt(perms[4]);
        if (permission === 'r' && (otherPerms & 4)) return true;
        if (permission === 'w' && (otherPerms & 2)) return true;
        if (permission === 'x' && (otherPerms & 1)) return true;
        
        return false;
    }
    
    // Get parent directory path
    getParentPath(path) {
        const resolved = this.resolvePath(path);
        const parts = resolved.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/') || '/';
    }
    
    // Get basename
    getBasename(path) {
        const parts = path.split('/').filter(p => p);
        return parts[parts.length - 1] || '/';
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.VirtualFilesystem = VirtualFilesystem;
}
