/** Red Cat - Section 13: Software Management */

function generateSection13Output(command, input, tokens) {
    // Task 2: Check if tmux is installed
    if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
        return 'tmux-3.2a-4.el9.x86_64';
    }
    
    if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
        return 'Installed Packages\ntmux.x86_64                                     3.2a-4.el9                                      @baseos';
    }
    
    // Task 4: Check tmux not installed
    if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
        return 'package tmux is not installed';
    }
    
    // Task 6: View package list
    if ((command === 'cat' || command === 'less' || command === 'wc') && input.includes('/tmp/pkg-count.txt')) {
        if (command === 'wc' && input.includes('-l')) {
            return '425 /tmp/pkg-count.txt';
        }
        return 'NetworkManager.x86_64\nbasesystem.noarch\nbash.x86_64\nbind-utils.x86_64\nchrony.x86_64\ncronie.x86_64\ncurl.x86_64\ndnf.noarch\nfirewalld.noarch\nglibc.x86_64\n...';
    }
    
    // Task 7: Check for updates
    if (command === 'dnf' && (input.includes('check-update') || (input.includes('list') && input.includes('updates')))) {
        return 'kernel.x86_64                                   5.14.0-362.el9                                  baseos\nsystemd.x86_64                                  252-14.el9_3                                    baseos\n\nObsolete Packages';
    }
    
    // Task 8: Show package info
    if ((command === 'dnf' || command === 'yum') && input.includes('info') && input.includes('kernel')) {
        return 'Installed Packages\nName         : kernel\nVersion      : 5.14.0\nRelease      : 362.el9\nArchitecture : x86_64\nSize         : 0.0\nSource       : kernel-5.14.0-362.el9.src.rpm\nRepository   : @anaconda\nSummary      : The Linux kernel\nURL          : https://www.kernel.org/\nLicense      : GPLv2\nDescription  : The kernel package contains the Linux kernel (vmlinuz)';
    }
    
    if (command === 'rpm' && hasFlags(input, 'qi') && input.includes('kernel')) {
        return 'Name        : kernel\nVersion     : 5.14.0\nRelease     : 362.el9\nArchitecture: x86_64\nInstall Date: Sun 23 Feb 2026 08:15:30 AM EST\nGroup       : System Environment/Kernel\nSize        : 0\nLicense     : GPLv2\nSignature   : RSA/SHA256\nSource RPM  : kernel-5.14.0-362.el9.src.rpm\nBuild Date  : Wed 10 Jan 2026 12:00:00 PM EST\nSummary     : The Linux kernel';
    }
    
    // dnf repolist - repository list
    if ((command === 'dnf' || command === 'yum') && input.includes('repolist')) {
        if (input.includes('all')) {
            return 'repo id                                        repo name\nappstream                                      Red Hat Enterprise Linux 9 - AppStream\nbaseos                                         Red Hat Enterprise Linux 9 - BaseOS\ncrb                                            Red Hat Enterprise Linux 9 - CodeReady Builder (disabled)\nepel                                           Extra Packages for Enterprise Linux 9 (disabled)\nepel-modular                                   Extra Packages for Enterprise Linux Modular 9 (disabled)';
        }
        if (input.includes('enabled') || !tokens[2]) {
            return 'repo id                                        repo name\nappstream                                      Red Hat Enterprise Linux 9 - AppStream\nbaseos                                         Red Hat Enterprise Linux 9 - BaseOS';
        }
    }
    
    // dnf history - transaction history
    if ((command === 'dnf' || command === 'yum') && input.includes('history')) {
        if (input.includes('list')) {
            return 'ID     | Command line                                  | Date and time    | Action(s)      | Altered\n---------------------------------------------------------------------------------------------------------------------------------------\n     5 | install httpd                                 | 2026-02-23 10:15 | Install        |    5\n     4 | update kernel                                 | 2026-02-20 14:30 | Upgrade        |    3\n     3 | install vim-enhanced                          | 2026-02-18 09:45 | Install        |    2\n     2 | install @base                                | 2026-02-15 08:20 | Install        |  425\n     1 |                                               | 2026-02-15 08:15 | Install        |  312';
        }
        if (input.includes('info') && input.includes('5')) {
            return 'Transaction ID : 5\nBegin time     : Sun Feb 23 10:15:32 2026\nBegin rpmdb    : 425:a1b2c3d4e5f67890abcdef1234567890abcdef12\nEnd time       : Sun Feb 23 10:16:15 2026\nEnd rpmdb      : 430:fedcba9876543210fedcba9876543210fedcba98\nUser           : root <root>\nReturn-Code    : Success\nReleasever     : 9\nCommand Line   : install httpd\nComment        : \nPackages Altered:\n    Install httpd-2.4.57-5.el9.x86_64                    @appstream\n    Install httpd-tools-2.4.57-5.el9.x86_64              @appstream\n    Install apr-1.7.0-11.el9.x86_64                      @appstream\n    Install apr-util-1.6.1-20.el9.x86_64                 @appstream\n    Install mod_http2-1.15.19-5.el9.x86_64               @appstream';
        }
        return 'ID     | Command line                                  | Date and time    | Action(s)      | Altered\n---------------------------------------------------------------------------------------------------------------------------------------\n     5 | install httpd                                 | 2026-02-23 10:15 | Install        |    5\n     4 | update kernel                                 | 2026-02-20 14:30 | Upgrade        |    3\n     3 | install vim-enhanced                          | 2026-02-18 09:45 | Install        |    2\n     2 | install @base                                | 2026-02-15 08:20 | Install        |  425\n     1 |                                               | 2026-02-15 08:15 | Install        |  312';
    }
    
    // yum-config-manager outputs
    if (command === 'yum-config-manager') {
        if (input.includes('--add-repo')) {
            return 'Adding repo from: http://repo.example.com/rhel9';
        }
        if (input.includes('--enable')) {
            return ''; // No output on success
        }
        if (input.includes('--disable')) {
            return ''; // No output on success
        }
    }
    
    // dnf group commands
    if ((command === 'dnf' || command === 'yum') && input.includes('group')) {
        if (input.includes('list')) {
            return 'Available Environment Groups:\n   Server with GUI\n   Server\n   Minimal Install\n   Workstation\n   Custom Operating System\nInstalled Environment Groups:\n   Server\nAvailable Groups:\n   Container Management\n   Development Tools\n   Headless Management\n   Legacy UNIX Compatibility\n   Network Servers\n   Scientific Support\n   Security Tools\n   Smart Card Support\n   System Tools';
        }
        if (input.includes('info') && input.includes('Development Tools')) {
            return 'Group: Development Tools\n Description: A basic development environment.\n Mandatory Packages:\n   =autoconf\n   =automake\n   =binutils\n   =gcc\n   =gcc-c++\n   =gdb\n   =glibc-devel\n   =make\n   =pkgconf\n   =pkgconf-m4\n   =pkgconf-pkg-config\n   =redhat-rpm-config\n Optional Packages:\n   -cmake\n   -expect\n   -rpmdevtools\n   -rpmlint';
        }
    }
    
    // subscription-manager outputs
    if (command === 'subscription-manager' && input.includes('status')) {
        return '+-------------------------------------------+\n   System Status Details\n+-------------------------------------------+\nOverall Status: Current\n\nSystem Purpose Status: Matched';
    }
    
    // dnf/yum install (Implementation tasks) - simplified output
    if ((command === 'dnf' || command === 'yum') && input.includes('install') && !input.includes('group')) {
        if (input.includes('httpd')) {
            return 'Last metadata expiration check: 0:05:23 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n httpd           x86_64    2.4.57-5.el9         appstream            1.5 M\nInstalling dependencies:\n httpd-tools     x86_64    2.4.57-5.el9         appstream             84 k\n apr             x86_64    1.7.0-11.el9         appstream            125 k\n\nTransaction Summary\n================================================================================\nInstall  3 Packages\n\nTotal download size: 1.7 M\nInstalled size: 5.1 M\nDownloading Packages:\n(1/3): apr-1.7.0-11.el9.x86_64.rpm              125 kB/s | 125 kB     00:01    \n(2/3): httpd-tools-2.4.57-5.el9.x86_64.rpm       84 kB/s |  84 kB     00:01    \n(3/3): httpd-2.4.57-5.el9.x86_64.rpm            1.5 MB/s | 1.5 MB     00:01    \n--------------------------------------------------------------------------------\nTotal                                           1.2 MB/s | 1.7 MB     00:01     \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : apr-1.7.0-11.el9.x86_64                                1/3 \n  Installing       : httpd-tools-2.4.57-5.el9.x86_64                        2/3 \n  Installing       : httpd-2.4.57-5.el9.x86_64                              3/3 \n  Running scriptlet: httpd-2.4.57-5.el9.x86_64                              3/3 \n  Verifying        : apr-1.7.0-11.el9.x86_64                                1/3 \n  Verifying        : httpd-2.4.57-5.el9.x86_64                              2/3 \n  Verifying        : httpd-tools-2.4.57-5.el9.x86_64                        3/3 \n\nInstalled:\n  apr-1.7.0-11.el9.x86_64                                                       \n  httpd-2.4.57-5.el9.x86_64                                                     \n  httpd-tools-2.4.57-5.el9.x86_64                                               \n\nComplete!';
        }
        if (input.includes('firewalld')) {
            return 'Last metadata expiration check: 0:10:45 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n firewalld       noarch    1.3.4-1.el9          baseos               504 k\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nTotal download size: 504 k\nInstalled size: 2.3 M\nDownloading Packages:\nfirewalld-1.3.4-1.el9.noarch.rpm                504 kB/s | 504 kB     00:01    \nRunning transaction check\nTransaction check succeeded.\nRunning transaction test\nTransaction test succeeded.\nRunning transaction\n  Preparing        :                                                        1/1 \n  Installing       : firewalld-1.3.4-1.el9.noarch                           1/1 \n  Running scriptlet: firewalld-1.3.4-1.el9.noarch                           1/1 \n  Verifying        : firewalld-1.3.4-1.el9.noarch                           1/1 \n\nInstalled:\n  firewalld-1.3.4-1.el9.noarch                                                  \n\nComplete!';
        }
        // Generic install output
        return 'Last metadata expiration check: 0:05:00 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Package         Arch      Version              Repository            Size\n================================================================================\nInstalling:\n package         x86_64    1.0-1.el9            baseos               100 k\n\nTransaction Summary\n================================================================================\nInstall  1 Package\n\nComplete!';
    }
    
    // dnf group install (Implementation tasks)
    if ((command === 'dnf' || command === 'yum') && input.includes('group') && input.includes('install')) {
        return 'Last metadata expiration check: 0:10:00 ago on Sun 23 Feb 2026 10:00:00 AM EST.\nDependencies resolved.\n================================================================================\n Group                                                                         \n================================================================================\nInstalling group/module packages:\n autoconf                  x86_64    2.69-38.el9       appstream    715 k\n automake                  noarch    1.16.2-8.el9      appstream    713 k\n gcc                       x86_64    11.4.1-2.el9      appstream     32 M\n make                      x86_64    1:4.3-7.el9       baseos       530 k\n\nTransaction Summary\n================================================================================\nInstall  45 Packages\n\nTotal download size: 85 M\nInstalled size: 210 M\nDownloading Packages:\n[... package download progress ...]\n\nComplete!';
    }
    
    return null;
}

/** Section 13 End */
function generateSection13PreCheck(task, command, input, tokens) {
    // Task 1 Pre-check: tmux not installed yet
    if (task.id === 1) {
        if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
            return 'package tmux is not installed';
        }
        if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
            return 'Error: No matching Packages to list';
        }
    }
    
    // Task 3 Pre-check: tmux installed (before remove)
    if (task.id === 3) {
        if (command === 'rpm' && input.includes('-q') && input.includes('tmux')) {
            return 'tmux-3.2a-4.el9.x86_64';
        }
        if (command === 'dnf' && input.includes('list') && input.includes('installed') && input.includes('tmux')) {
            return 'Installed Packages\ntmux.x86_64                                     3.2a-4.el9                                      @baseos';
        }
    }
    
    // Task 5 Pre-check: pkg-count file doesn't exist yet
    if (task.id === 5) {
        if ((command === 'cat' || command === 'less' || command === 'more') && 
            input.includes('/tmp/pkg-count.txt')) {
            return `${command}: /tmp/pkg-count.txt: No such file or directory`;
        }
    }
    
    return null;
}

/**
 * Section 8: Networking - Pre-Check Generator
 */
