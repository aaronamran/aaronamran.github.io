// /etc directory structure
// System configuration files

export function createEtcDirectory() {
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
                'os-release': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: `NAME="Red Hat Enterprise Linux"
VERSION="9.3 (Plow)"
ID="rhel"
ID_LIKE="fedora"
VERSION_ID="9.3"
PLATFORM_ID="platform:el9"
PRETTY_NAME="Red Hat Enterprise Linux 9.3 (Plow)"
ANSI_COLOR="0;31"
LOGO="fedora-logo-icon"
CPE_NAME="cpe:/o:redhat:enterprise_linux:9::baseos"
HOME_URL="https://www.redhat.com/"
DOCUMENTATION_URL="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9"
BUG_REPORT_URL="https://bugzilla.redhat.com/"
REDHAT_BUGZILLA_PRODUCT="Red Hat Enterprise Linux 9"
REDHAT_BUGZILLA_PRODUCT_VERSION=9.3
REDHAT_SUPPORT_PRODUCT="Red Hat Enterprise Linux"
REDHAT_SUPPORT_PRODUCT_VERSION="9.3"
`
                },
                'redhat-release': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 56,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux release 9.3 (Plow)\n'
                },
                'system-release': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 56,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux release 9.3 (Plow)\n'
                },
                'system-release-cpe': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 48,
                    modified: new Date(),
                    content: 'cpe:/o:redhat:enterprise_linux:9.3:ga:baseos\n'
                },
                'motd': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 256,
                    modified: new Date(),
                    content: `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║        Red Hat Enterprise Linux 9.3 (Plow)                       ║
║        RHCSA Practice Environment - Red Cat Terminal             ║
║                                                                   ║
║        Type 'help' for available commands                        ║
║        Type 'scenarios' to start exam practice                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

`
                },
                'issue': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 128,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux 9.3 (Plow)\nKernel \\r on an \\m (\\l)\n\n'
                },
                'issue.net': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 64,
                    modified: new Date(),
                    content: 'Red Hat Enterprise Linux 9.3 (Plow)\nKernel \\r on an \\m\n'
                },
                'nsswitch.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: `# /etc/nsswitch.conf
passwd:     files systemd
shadow:     files
group:      files systemd
hosts:      files dns myhostname
bootparams: files
ethers:     files
netmasks:   files
networks:   files
protocols:  files
rpc:        files
services:   files
netgroup:   files
publickey:  files
automount:  files
aliases:    files
`
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
                'profile.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
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
                            content: 'GRUB_TIMEOUT=5\nGRUB_DISTRIBUTOR="Red Hat Enterprise Linux"\nGRUB_DEFAULT=saved\nGRUB_DISABLE_SUBMENU=true\nGRUB_TERMINAL_OUTPUT="console"\nGRUB_CMDLINE_LINUX="rhgb quiet"\nGRUB_DISABLE_RECOVERY="true"\nGRUB_ENABLE_BLSCFG=true\n'
                        }
                    }
                },
                'rsyslog.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 1024,
                    modified: new Date(),
                    content: `# /etc/rsyslog.conf
# Provides support for local system logging

#### MODULES ####
module(load="imuxsock")
module(load="imjournal")

#### GLOBAL DIRECTIVES ####
$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat

#### RULES ####
*.info;mail.none;authpriv.none;cron.none                /var/log/messages
authpriv.*                                              /var/log/secure
mail.*                                                  -/var/log/maillog
cron.*                                                  /var/log/cron

*.emerg                                                 :omusrmsg:*
`
                },
                'rsyslog.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'logrotate.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'syslog': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '/var/log/messages\n/var/log/secure\n/var/log/maillog\n{\n    daily\n    rotate 7\n    missingok\n    notifempty\n    compress\n    postrotate\n        /bin/kill -HUP `cat /var/run/syslogd.pid 2> /dev/null` 2> /dev/null || true\n    endscript\n}\n'
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
                            content: '# PAM configuration for system authentication\nauth        required      pam_env.so\nauth        sufficient    pam_unix.so nullok\nauth        required      pam_deny.so\naccount     required      pam_unix.so\npassword    sufficient    pam_unix.so sha512 shadow\nsession     required      pam_unix.so\n'
                        },
                        'sshd': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '# PAM configuration for sshd\nauth       include      system-auth\naccount    required     pam_nologin.so\naccount    include      system-auth\npassword   include      system-auth\nsession    include      system-auth\n'
                        },
                        'sudo': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 128,
                            modified: new Date(),
                            content: '# PAM configuration for sudo\nauth       include      system-auth\naccount    include      system-auth\nsession    include      system-auth\n'
                        }
                    }
                },
                'sysctl.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 256,
                    modified: new Date(),
                    content: '# /etc/sysctl.conf\n# System kernel parameters\n# For more information, see sysctl.conf(5)\n'
                },
                'sysctl.d': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'chrony.conf': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: `# Use public servers from the pool.ntp.org project.
pool 2.rhel.pool.ntp.org iburst

# Record the rate at which the system clock gains/losses time.
driftfile /var/lib/chrony/drift

# Allow the system clock to be stepped in the first three updates
makestep 1.0 3

# Enable kernel synchronization of the real-time clock (RTC).
rtcsync

# Enable hardware timestamping on all interfaces that support it.
#hwtimestamp *

# Increase the minimum number of selectable sources required to adjust
# the system clock.
#minsources 2

# Specify directory for log files.
logdir /var/log/chrony
`
                }
            }
        }
    };
}
