// Virtual Filesystem for RHCSA Practice Terminal
// Simulates a Linux filesystem with directories, files, permissions, and ownership
// Consolidated from modular architecture into single non-ES6 file for browser compatibility

// Helper functions to create directory structures

function createBinDirectory() {
    return {
        'bin': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'bash': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1234567, modified: new Date(), content: '' },
                'ls': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 147488, modified: new Date(), content: '' },
                'cat': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 55432, modified: new Date(), content: '' },
                'cp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 158632, modified: new Date(), content: '' },
                'mv': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 154536, modified: new Date(), content: '' },
                'rm': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 71544, modified: new Date(), content: '' },
                'grep': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 253992, modified: new Date(), content: '' },
                'sed': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 93488, modified: new Date(), content: '' },
                'awk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 481144, modified: new Date(), content: '' },
                'tar': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 495840, modified: new Date(), content: '' },
                'gzip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 99440, modified: new Date(), content: '' },
                'bzip2': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 44008, modified: new Date(), content: '' }
            }
        }
    };
}

function createBootDirectory() {
    return {
        'boot': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'grub2': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'grub.cfg': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 8192,
                            modified: new Date(),
                            content: '# GRUB2 configuration\nset default="0"\nset timeout=5\nmenuentry \'Red Hat Enterprise Linux 9\' {\n    linux /vmlinuz root=UUID=1234-5678\n    initrd /initramfs.img\n}\n'
                        },
                        'grubenv': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 1024,
                            modified: new Date(),
                            content: 'saved_entry=0\nkernel_opts=\n'
                        }
                    }
                },
                'vmlinuz-5.14.0-362.8.1.el9_3.x86_64': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 11534336,
                    modified: new Date(),
                    content: ''
                },
                'initramfs-5.14.0-362.8.1.el9_3.x86_64.img': {
                    type: 'file',
                    permissions: '0600',
                    owner: 'root',
                    group: 'root',
                    size: 37485312,
                    modified: new Date(),
                    content: ''
                },
                'System.map-5.14.0-362.8.1.el9_3.x86_64': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 4538419,
                    modified: new Date(),
                    content: ''
                }
            }
        }
    };
}

function createDevDirectory() {
    return {
        'dev': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'null': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'zero': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'random': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'urandom': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'sda': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sda1': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sda2': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdb': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdc': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdd': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' }
            }
        }
    };
}

function createEtcDirectory() {
    return {
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
                'resolv.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 64,
                    modified: new Date(),
                    content: '# Generated by NetworkManager\nnameserver 8.8.8.8\nnameserver 8.8.4.4\n'
                },
                'ssh': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'sshd_config': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: '# SSH daemon configuration\nPort 22\nPermitRootLogin yes\nPasswordAuthentication yes\nPubkeyAuthentication yes\n'
                        }
                    }
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
                            children: {}
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
                'cron.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'crontab': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 128,
                    modified: new Date(),
                    content: 'SHELL=/bin/bash\nPATH=/sbin:/bin:/usr/sbin:/usr/bin\n'
                },
                'sysconfig': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'network-scripts': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'ifcfg-eth0': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 256,
                                    modified: new Date(),
                                    content: 'TYPE=Ethernet\nBOOTPROTO=dhcp\nDEFROUTE=yes\nNAME=eth0\nDEVICE=eth0\nONBOOT=yes\n'
                                }
                            }
                        },
                        'selinux': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 128,
                            modified: new Date(),
                            content: 'SELINUX=enforcing\nSELINUXTYPE=targeted\n'
                        },
                        'firewalld': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 64,
                            modified: new Date(),
                            content: 'FIREWALLD_ARGS=\n'
                        }
                    }
                },
                'pam.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'system-auth': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: '#%PAM-1.0\nauth        required      pam_env.so\nauth        sufficient    pam_unix.so nullok\nauth        required      pam_deny.so\n'
                        },
                        'password-auth': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: '#%PAM-1.0\nauth        required      pam_env.so\nauth        sufficient    pam_unix.so nullok\nauth        required      pam_deny.so\n'
                        },
                        'sshd': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '#%PAM-1.0\nauth       substack     password-auth\naccount    required     pam_nologin.so\n'
                        },
                        'sudo': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '#%PAM-1.0\nauth       include      system-auth\naccount    include      system-auth\n'
                        }
                    }
                },
                'security': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'limits.conf': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: '# /etc/security/limits.conf\n#<domain>      <type>  <item>         <value>\n*               soft    nofile         1024\n*               hard    nofile         4096\n'
                        },
                        'access.conf': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '# /etc/security/access.conf\n+ : ALL : ALL\n'
                        }
                    }
                },
                'NetworkManager': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'system-connections': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'NetworkManager.conf': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '[main]\nplugins=ifcfg-rh,keyfile\n\n[logging]\n'
                        }
                    }
                },
                'default': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'grub': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: 'GRUB_TIMEOUT=5\nGRUB_DISTRIBUTOR="Red Hat Enterprise Linux"\nGRUB_DEFAULT=saved\nGRUB_DISABLE_SUBMENU=true\nGRUB_TERMINAL_OUTPUT="console"\nGRUB_CMDLINE_LINUX="rhgb quiet"\nGRUB_DISABLE_RECOVERY="true"\n'
                        }
                    }
                },
                'profile.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'lang.sh': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 128,
                            modified: new Date(),
                            content: '#!/bin/sh\nexport LANG=en_US.UTF-8\n'
                        }
                    }
                },
                'httpd': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'conf': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'httpd.conf': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 2048,
                                    modified: new Date(),
                                    content: 'ServerRoot "/etc/httpd"\nListen 80\nInclude conf.modules.d/*.conf\nUser apache\nGroup apache\nServerAdmin root@localhost\nDocumentRoot "/var/www/html"\n'
                                }
                            }
                        },
                        'conf.d': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'chrony.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: '# Use public servers from the pool.ntp.org project.\npool 2.rhel.pool.ntp.org iburst\ndriftfile /var/lib/chrony/drift\nmakestep 1.0 3\nrtcsync\n'
                },
                'profile': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 1024,
                    modified: new Date(),
                    content: '# /etc/profile\npathmunge () {\n    if ! echo $PATH | /bin/grep -Eq "(^|:)$1($|:)" ; then\n        PATH=$1:$PATH\n    fi\n}\nfor i in /etc/profile.d/*.sh ; do\n    if [ -r "$i" ]; then\n        . "$i"\n    fi\ndone\n'
                },
                'bashrc': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: '# /etc/bashrc\nif [ -z "$PS1" ]; then\n   return\nfi\nalias ll=\'ls -la\'\nalias grep=\'grep --color=auto\'\n'
                },
                'os-release': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 256,
                    modified: new Date(),
                    content: 'NAME="Red Hat Enterprise Linux"\nVERSION="9.3 (Plow)"\nID="rhel"\nID_LIKE="fedora"\nVERSION_ID="9.3"\nPLATFORM_ID="platform:el9"\nPRETTY_NAME="Red Hat Enterprise Linux 9.3 (Plow)"\nANSI_COLOR="0;31"\nCPE_NAME="cpe:/o:redhat:enterprise_linux:9::baseos"\nHOME_URL="https://www.redhat.com/"\n'
                },
                'redhat-release': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 64,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux release 9.3 (Plow)\n'
                },
                'issue': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 64,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux 9.3\nKernel \\r on an \\m\n\n'
                },
                'motd': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: ''
                },
                'login.defs': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 1024,
                    modified: new Date(),
                    content: 'MAIL_DIR /var/spool/mail\nPASS_MAX_DAYS 99999\nPASS_MIN_DAYS 0\nPASS_MIN_LEN 5\nPASS_WARN_AGE 7\nUID_MIN 1000\nUID_MAX 60000\nGID_MIN 1000\nGID_MAX 60000\nCREATE_HOME yes\nUMASK 077\n'
                },
                'services': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    content: 'tcpmux          1/tcp\necho            7/tcp\necho            7/udp\ndiscard         9/tcp\ndiscard         9/udp\nftp             21/tcp\nssh             22/tcp\ntelnet          23/tcp\nsmtp            25/tcp\nhttp            80/tcp\nhttps           443/tcp\n'
                },
                'protocols': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 2048,
                    modified: new Date(),
                    content: 'ip      0       IP\nicmp    1       ICMP\nigmp    2       IGMP\ntcp     6       TCP\nudp     17      UDP\n'
                }
            }
        }
    };
}

function createHomeDirectory() {
    return {
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
                        '.bashrc': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 512,
                            modified: new Date(),
                            content: '# .bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\nexport PATH=$PATH:/usr/local/bin\n'
                        },
                        '.bash_profile': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 256,
                            modified: new Date(),
                            content: '# .bash_profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\n'
                        },
                        '.bash_history': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 1024,
                            modified: new Date(),
                            content: 'ls -la\ncd /var/log\nsudo tail -f /var/log/messages\n'
                        },
                        '.ssh': {
                            type: 'directory',
                            permissions: '0700',
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
                    children: {
                        '.bashrc': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'student',
                            group: 'student',
                            size: 256,
                            modified: new Date(),
                            content: '# .bashrc\nalias ll="ls -la"\n'
                        },
                        '.bash_profile': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'student',
                            group: 'student',
                            size: 128,
                            modified: new Date(),
                            content: '# .bash_profile\n'
                        }
                    }
                }
            }
        }
    };
}

function createLibDirectories() {
    return {
        'lib': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'modules': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        '5.14.0-362.8.1.el9_3.x86_64': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
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
                    children: {}
                }
            }
        },
        'lib64': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'libc.so.6': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 2156368, modified: new Date(), content: '' },
                'libm.so.6': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1165968, modified: new Date(), content: '' },
                'libpthread.so.0': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 155056, modified: new Date(), content: '' }
            }
        }
    };
}

function createMediaDirectory() {
    return {
        'media': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'cdrom': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'usb': {
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

function createMntDirectory() {
    return {
        'mnt': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {}
        }
    };
}

function createOptDirectory() {
    return {
        'opt': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {}
        }
    };
}

function createProcDirectory() {
    return {
        'proc': {
            type: 'directory',
            permissions: '0555',
            owner: 'root',
            group: 'root',
            size: 0,
            modified: new Date(),
            children: {
                'cpuinfo': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 158\nmodel name\t: Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz\n'
                },
                'meminfo': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:   12288000 kB\nBuffers:          512000 kB\nCached:          4096000 kB\n'
                },
                'version': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'Linux version 5.14.0-362.8.1.el9_3.x86_64 (mockbuild@x86-vm-09.build.eng.bos.redhat.com) (gcc version 11.4.1 20230605 (Red Hat 11.4.1-2)) #1 SMP PREEMPT_DYNAMIC\n'
                },
                'uptime': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: '12345.67 98765.43\n'
                },
                'loadavg': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: '0.45 0.32 0.28 1/234 5678\n'
                },
                'cmdline': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'BOOT_IMAGE=(hd0,gpt2)/vmlinuz-5.14.0-362.8.1.el9_3.x86_64 root=UUID=1234-5678 ro rhgb quiet\n'
                },
                'filesystems': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'nodev\tsysfs\nnodev\trootfs\nnodev\tproc\n\txfs\n\text4\n\text3\n\text2\n\tvfat\n'
                },
                'mounts': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: '/dev/mapper/rhel-root / xfs rw,relatime 0 0\n/dev/sda1 /boot ext4 rw,relatime 0 0\ntmpfs /run tmpfs rw,nosuid,nodev 0 0\n'
                },
                'partitions': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'major minor  #blocks  name\n\n   8        0   20971520 sda\n   8        1    1048576 sda1\n   8        2   19921920 sda2\n 253        0   17825792 dm-0\n 253        1    2095104 dm-1\n'
                },
                'swaps': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'Filename\t\t\t\tType\t\tSize\tUsed\tPriority\n/dev/dm-1                               partition\t2095104\t0\t-2\n'
                },
                'sys': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'kernel': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'hostname': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    content: 'rhcsa-lab\n'
                                },
                                'osrelease': {
                                    type: 'file',
                                    permissions: '0444',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    content: '5.14.0-362.8.1.el9_3.x86_64\n'
                                }
                            }
                        },
                        'vm': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'swappiness': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    content: '30\n'
                                }
                            }
                        },
                        'net': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'ipv4': {
                                    type: 'directory',
                                    permissions: '0555',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    children: {
                                        'ip_forward': {
                                            type: 'file',
                                            permissions: '0644',
                                            owner: 'root',
                                            group: 'root',
                                            size: 0,
                                            modified: new Date(),
                                            content: '0\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'net': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'dev': {
                            type: 'file',
                            permissions: '0444',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            content: 'Inter-|   Receive                                                |  Transmit\n face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n    lo:   65536     256    0    0    0     0          0         0    65536     256    0    0    0     0       0          0\n  eth0: 1048576    4096    0    0    0     0          0         0  524288    2048    0    0    0     0       0          0\n'
                        }
                    }
                }
            }
        }
    };
}

function createRootDirectory() {
    return {
        'root': {
            type: 'directory',
            permissions: '0550',
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
                    size: 1024,
                    modified: new Date(),
                    content: '# .bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\nexport PS1="[\\u@\\h \\W]\\$ "\n'
                },
                '.bash_profile': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: '# .bash_profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\nPATH=$PATH:$HOME/bin\nexport PATH\n'
                },
                '.bash_history': {
                    type: 'file',
                    permissions: '0600',
                    owner: 'root',
                    group: 'root',
                    size: 2048,
                    modified: new Date(),
                    content: 'systemctl status firewalld\ncat /etc/fstab\nls -la /root\n'
                },
                '.ssh': {
                    type: 'directory',
                    permissions: '0700',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'authorized_keys': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: ''
                        }
                    }
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
                            content: '#!/bin/bash\n# Backup script\ntar -czf /backup/data-$(date +%Y%m%d).tar.gz /data\n'
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
                    children: {}
                }
            }
        }
    };
}

function createRunDirectory() {
    return {
        'run': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'systemd': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'lock': {
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

function createSbinDirectory() {
    return {
        'sbin': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'fdisk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'mkfs.xfs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                'mkfs.ext4': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 134567, modified: new Date(), content: '' },
                'mount': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 87654, modified: new Date(), content: '' },
                'umount': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 76543, modified: new Date(), content: '' },
                'ip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 987654, modified: new Date(), content: '' },
                'iptables': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'firewall-cmd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 156789, modified: new Date(), content: '' },
                'semanage': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'restorecon': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' }
            }
        }
    };
}

function createSrvDirectory() {
    return {
        'srv': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'www': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'ftp': {
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

function createSysDirectory() {
    return {
        'sys': {
            type: 'directory',
            permissions: '0555',
            owner: 'root',
            group: 'root',
            size: 0,
            modified: new Date(),
            children: {
                'class': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'net': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'lo': {
                                    type: 'symlink',
                                    permissions: '0777',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    target: '../../devices/virtual/net/lo',
                                    content: ''
                                },
                                'eth0': {
                                    type: 'symlink',
                                    permissions: '0777',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    target: '../../devices/pci0000:00/0000:00:03.0/net/eth0',
                                    content: ''
                                }
                            }
                        },
                        'block': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'sda': {
                                    type: 'symlink',
                                    permissions: '0777',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    target: '../../devices/pci0000:00/0000:00:1f.2/ata1/host0/target0:0:0/0:0:0:0/block/sda',
                                    content: ''
                                }
                            }
                        }
                    }
                },
                'block': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'sda': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'size': {
                                    type: 'file',
                                    permissions: '0444',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    content: '41943040\n'
                                },
                                'removable': {
                                    type: 'file',
                                    permissions: '0444',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    content: '0\n'
                                }
                            }
                        }
                    }
                },
                'devices': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'virtual': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {}
                        },
                        'system': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {
                                'cpu': {
                                    type: 'directory',
                                    permissions: '0555',
                                    owner: 'root',
                                    group: 'root',
                                    size: 0,
                                    modified: new Date(),
                                    children: {}
                                }
                            }
                        }
                    }
                },
                'kernel': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'mm': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {}
                        }
                    }
                }
            }
        }
    };
}

function createTmpDirectory() {
    return {
        'tmp': {
            type: 'directory',
            permissions: '1777',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {}
        }
    };
}

function createUsrDirectory() {
    return {
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
                    children: {
                        // Text editors
                        'vi': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1234567, modified: new Date(), content: '' },
                        'vim': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 3234567, modified: new Date(), content: '' },
                        'nano': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'emacs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 4567890, modified: new Date(), content: '' },
                        
                        // File utilities
                        'find': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 324567, modified: new Date(), content: '' },
                        'locate': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'updatedb': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'which': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 12345, modified: new Date(), content: '' },
                        'whereis': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 15678, modified: new Date(), content: '' },
                        
                        // Network utilities
                        'ssh': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 874321, modified: new Date(), content: '' },
                        'scp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'sftp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 167890, modified: new Date(), content: '' },
                        'wget': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 834567, modified: new Date(), content: '' },
                        'curl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'ping': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 56789, modified: new Date(), content: '' },
                        'traceroute': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'netstat': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        'ss': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' },
                        'ip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'dig': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 189012, modified: new Date(), content: '' },
                        'nslookup': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'host': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        
                        // System utilities
                        'systemctl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 734567, modified: new Date(), content: '' },
                        'journalctl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 534567, modified: new Date(), content: '' },
                        'hostnamectl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'timedatectl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 56789, modified: new Date(), content: '' },
                        'localectl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 43210, modified: new Date(), content: '' },
                        'loginctl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        
                        // Text processing
                        'awk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 456789, modified: new Date(), content: '' },
                        'sed': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'cut': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 67890, modified: new Date(), content: '' },
                        'paste': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'join': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 54321, modified: new Date(), content: '' },
                        'sort': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'uniq': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'tr': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'wc': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 23456, modified: new Date(), content: '' },
                        'head': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'tail': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'diff': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'patch': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        
                        // Compression utilities
                        'tar': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 567890, modified: new Date(), content: '' },
                        'gzip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'gunzip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        'bzip2': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' },
                        'bunzip2': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'xz': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'unxz': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 198765, modified: new Date(), content: '' },
                        'zip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'unzip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 289012, modified: new Date(), content: '' },
                        
                        // Programming languages and interpreters
                        'python3': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 5678901, modified: new Date(), content: '' },
                        'python': { type: 'symlink', target: 'python3', permissions: '0777', owner: 'root', group: 'root', size: 7, modified: new Date() },
                        'perl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 4567890, modified: new Date(), content: '' },
                        'ruby': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 3456789, modified: new Date(), content: '' },
                        'bash': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1234567, modified: new Date(), content: '' },
                        'sh': { type: 'symlink', target: 'bash', permissions: '0777', owner: 'root', group: 'root', size: 4, modified: new Date() },
                        
                        // Development tools
                        'gcc': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 6789012, modified: new Date(), content: '' },
                        'g++': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 6890123, modified: new Date(), content: '' },
                        'make': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'git': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 3456789, modified: new Date(), content: '' },
                        'svn': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 2345678, modified: new Date(), content: '' },
                        
                        // Package management
                        'rpm': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 456789, modified: new Date(), content: '' },
                        'yum': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'dnf': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        
                        // Disk utilities
                        'df': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        'du': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        
                        // Process utilities
                        'ps': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'top': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'htop': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 289012, modified: new Date(), content: '' },
                        'pgrep': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'pkill': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 43210, modified: new Date(), content: '' },
                        'killall': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 56789, modified: new Date(), content: '' },
                        
                        // Miscellaneous
                        'xargs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 67890, modified: new Date(), content: '' },
                        'tee': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'watch': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'yes': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 12345, modified: new Date(), content: '' },
                        'sleep': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 23456, modified: new Date(), content: '' },
                        'date': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 67890, modified: new Date(), content: '' },
                        'cal': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'bc': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        'expr': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'seq': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 23456, modified: new Date(), content: '' },
                        'basename': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'dirname': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 32109, modified: new Date(), content: '' },
                        'file': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'stat': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' }
                    }
                },
                'sbin': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        // User management
                        'useradd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 134567, modified: new Date(), content: '' },
                        'userdel': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 124567, modified: new Date(), content: '' },
                        'usermod': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 144567, modified: new Date(), content: '' },
                        'groupadd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 114567, modified: new Date(), content: '' },
                        'groupdel': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 104567, modified: new Date(), content: '' },
                        'groupmod': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 124567, modified: new Date(), content: '' },
                        'chpasswd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 94567, modified: new Date(), content: '' },
                        'adduser': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' },
                        'deluser': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 134567, modified: new Date(), content: '' },
                        
                        // Network configuration
                        'ifconfig': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'route': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        'arp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'iptables': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 456789, modified: new Date(), content: '' },
                        'iptables-save': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'iptables-restore': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 245678, modified: new Date(), content: '' },
                        'firewalld': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 567890, modified: new Date(), content: '' },
                        'nmcli': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'nmtui': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        
                        // Disk and filesystem management
                        'fdisk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'parted': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 456789, modified: new Date(), content: '' },
                        'mkfs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'mkfs.ext4': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 267890, modified: new Date(), content: '' },
                        'mkfs.xfs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 278901, modified: new Date(), content: '' },
                        'fsck': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 198765, modified: new Date(), content: '' },
                        'e2fsck': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'xfs_repair': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'tune2fs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        'blkid': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'lsblk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' },
                        
                        // LVM management
                        'pvcreate': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'pvdisplay': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 189012, modified: new Date(), content: '' },
                        'pvremove': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        'vgcreate': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 245678, modified: new Date(), content: '' },
                        'vgdisplay': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 198765, modified: new Date(), content: '' },
                        'vgextend': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 187654, modified: new Date(), content: '' },
                        'lvcreate': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 256789, modified: new Date(), content: '' },
                        'lvdisplay': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 209876, modified: new Date(), content: '' },
                        'lvextend': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 198765, modified: new Date(), content: '' },
                        'lvreduce': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 189012, modified: new Date(), content: '' },
                        'lvremove': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        
                        // Service management
                        'service': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'chkconfig': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' },
                        
                        // Security and SELinux
                        'setenforce': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' },
                        'getenforce': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' },
                        'sestatus': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 67890, modified: new Date(), content: '' },
                        'semanage': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'restorecon': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'chcon': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        
                        // System management
                        'shutdown': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'reboot': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 98765, modified: new Date(), content: '' },
                        'halt': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 87654, modified: new Date(), content: '' },
                        'poweroff': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 94321, modified: new Date(), content: '' },
                        'init': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'telinit': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        
                        // Logging
                        'rsyslogd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 345678, modified: new Date(), content: '' },
                        'logrotate': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 178901, modified: new Date(), content: '' },
                        
                        // Cron
                        'crond': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'anacron': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 145678, modified: new Date(), content: '' }
                    }
                },
                'lib': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'lib64': {
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
                            children: {
                                'bash': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'README': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 12345, modified: new Date(), content: 'GNU Bash documentation' }
                                    }
                                },
                                'systemd': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                }
                            }
                        },
                        'man': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'man1': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'ls.1.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 5678, modified: new Date(), content: '' },
                                        'cd.1.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 3456, modified: new Date(), content: '' },
                                        'cat.1.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 4321, modified: new Date(), content: '' },
                                        'grep.1.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 8765, modified: new Date(), content: '' },
                                        'bash.1.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 45678, modified: new Date(), content: '' }
                                    }
                                },
                                'man5': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'passwd.5.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 6789, modified: new Date(), content: '' },
                                        'group.5.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 5432, modified: new Date(), content: '' },
                                        'fstab.5.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 7890, modified: new Date(), content: '' }
                                    }
                                },
                                'man8': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'systemctl.8.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 23456, modified: new Date(), content: '' },
                                        'firewalld.8.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 18765, modified: new Date(), content: '' },
                                        'useradd.8.gz': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 12345, modified: new Date(), content: '' }
                                    }
                                }
                            }
                        },
                        'applications': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'icons': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'hicolor': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                }
                            }
                        },
                        'fonts': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'locale': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'en_US': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                }
                            }
                        },
                        'zoneinfo': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'America': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'New_York': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 3519, modified: new Date(), content: '' },
                                        'Chicago': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 3519, modified: new Date(), content: '' },
                                        'Los_Angeles': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 3519, modified: new Date(), content: '' }
                                    }
                                },
                                'Europe': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'London': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 2945, modified: new Date(), content: '' },
                                        'Paris': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 3223, modified: new Date(), content: '' }
                                    }
                                },
                                'UTC': { type: 'file', permissions: '0644', owner: 'root', group: 'root', size: 127, modified: new Date(), content: '' }
                            }
                        }
                    }
                },
                'libexec': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'systemd': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'systemd-sysv-install': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 23456, modified: new Date(), content: '' },
                                'systemd-cgroups-agent': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 34567, modified: new Date(), content: '' }
                            }
                        },
                        'openssh': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'ssh-keysign': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' }
                            }
                        },
                        'firewalld': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'local': {
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
                        'sbin': {
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
        }
    };
}

function createVarDirectory() {
    return {
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
                            size: 2048,
                            modified: new Date(),
                            content: 'Dec  5 10:30:00 rhcsa-lab systemd[1]: Started System Logging Service.\nDec  5 10:30:05 rhcsa-lab kernel: Linux version 5.14.0-362.8.1.el9_3.x86_64\nDec  5 10:30:15 rhcsa-lab systemd[1]: Starting Firewall daemon...\n'
                        },
                        'secure': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 1024,
                            modified: new Date(),
                            content: 'Dec  5 10:30:00 rhcsa-lab sshd[1234]: Server listening on 0.0.0.0 port 22.\nDec  5 10:32:15 rhcsa-lab sudo:   aaron : TTY=pts/0 ; USER=root\n'
                        },
                        'cron': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: 'Dec  5 10:00:01 rhcsa-lab CROND[5678]: (root) CMD (/usr/lib64/sa/sa1 1 1)\n'
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
                                    size: 4096,
                                    modified: new Date(),
                                    content: 'type=SYSCALL msg=audit(1701864000.123:456): arch=c000003e syscall=59 success=yes\n'
                                }
                            }
                        },
                        'dmesg': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 8192,
                            modified: new Date(),
                            content: '[    0.000000] Linux version 5.14.0-362.8.1.el9_3.x86_64\n[    0.000000] Command line: BOOT_IMAGE=(hd0,gpt2)/vmlinuz-5.14.0-362.8.1.el9_3.x86_64 root=UUID=1234-5678 ro rhgb quiet\n[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: \'x87 floating point registers\'\n[    1.234567] PCI: Using configuration type 1 for base access\n[    2.345678] NET: Registered protocol family 2\n[    3.456789] audit: initializing netlink subsys (disabled)\n'
                        },
                        'boot.log': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 2048,
                            modified: new Date(),
                            content: '[  OK  ] Started Show Plymouth Boot Screen.\n[  OK  ] Started Forward Password Requests to Wall Directory Watch.\n[  OK  ] Reached target Local Encrypted Volumes.\n[  OK  ] Reached target Paths.\n[  OK  ] Reached target Remote File Systems.\n'
                        },
                        'lastlog': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 1024,
                            modified: new Date(),
                            content: ''
                        },
                        'wtmp': {
                            type: 'file',
                            permissions: '0664',
                            owner: 'root',
                            group: 'utmp',
                            size: 512,
                            modified: new Date(),
                            content: ''
                        },
                        'btmp': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'utmp',
                            size: 256,
                            modified: new Date(),
                            content: ''
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
                            children: {
                                'index.html': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 256,
                                    modified: new Date(),
                                    content: '<!DOCTYPE html>\n<html>\n<head><title>Test Page</title></head>\n<body><h1>It works!</h1></body>\n</html>\n'
                                }
                            }
                        },
                        'cgi-bin': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'lib': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'rpm': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'Packages': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 102400,
                                    modified: new Date(),
                                    content: '[RPM Database]'
                                }
                            }
                        },
                        'NetworkManager': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'chrony': {
                            type: 'directory',
                            permissions: '0750',
                            owner: 'chrony',
                            group: 'chrony',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'drift': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'chrony',
                                    group: 'chrony',
                                    size: 64,
                                    modified: new Date(),
                                    content: '0.123456\n'
                                }
                            }
                        }
                    }
                },
                'cache': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'yum': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'dnf': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'spool': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'cron': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'mail': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'mail',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'root': {
                                    type: 'file',
                                    permissions: '0600',
                                    owner: 'root',
                                    group: 'mail',
                                    size: 0,
                                    modified: new Date(),
                                    content: ''
                                }
                            }
                        },
                        'at': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'daemon',
                            group: 'daemon',
                            size: 4096,
                            modified: new Date(),
                            children: {}
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
                'run': {
                    type: 'symlink',
                    permissions: '0777',
                    owner: 'root',
                    group: 'root',
                    size: 6,
                    modified: new Date(),
                    target: '../run',
                    content: ''
                },
                'lock': {
                    type: 'symlink',
                    permissions: '0777',
                    owner: 'root',
                    group: 'root',
                    size: 11,
                    modified: new Date(),
                    target: '../run/lock',
                    content: ''
                }
            }
        }
    };
}

// Main VirtualFilesystem class

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
        const fs = {
            '/': {
                type: 'directory',
                permissions: '0755',
                owner: 'root',
                group: 'root',
                size: 4096,
                modified: new Date(),
                children: {}
            }
        };

        // Add all root-level directories
        fs['/'].children = {
            ...createBinDirectory(),
            ...createBootDirectory(),
            ...createDevDirectory(),
            ...createEtcDirectory(),
            ...createHomeDirectory(),
            ...createLibDirectories(),
            ...createMediaDirectory(),
            ...createMntDirectory(),
            ...createOptDirectory(),
            ...createProcDirectory(),
            ...createRootDirectory(),
            ...createRunDirectory(),
            ...createSbinDirectory(),
            ...createSrvDirectory(),
            ...createSysDirectory(),
            ...createTmpDirectory(),
            ...createUsrDirectory(),
            ...createVarDirectory()
        };

        return fs;
    }
    
    // Path resolution
    resolvePath(path) {
        let resolved;
        
        // Handle absolute, home, and relative paths
        if (path.startsWith('/')) {
            resolved = path;
        } else if (path === '~') {
            return this.users[this.currentUser].home;
        } else {
            resolved = this.currentPath + '/' + path;
        }
        
        // Normalize path by handling . and ..
        const parts = resolved.split('/').filter(p => p);
        const normalized = [];
        
        for (const part of parts) {
            if (part === '..') {
                // Go up one directory (remove last part)
                if (normalized.length > 0) {
                    normalized.pop();
                }
            } else if (part !== '.') {
                // Skip current directory (.), add anything else
                normalized.push(part);
            }
        }
        
        return '/' + normalized.join('/');
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
