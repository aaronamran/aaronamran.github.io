// Package Management Commands - dnf, rpm
// Part of Red Cat RHCSA Terminal Simulator

class PackageCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.installedPackages = sharedState.installedPackages;
        this.availablePackages = sharedState.availablePackages;
    }

    // Placeholder - commands will be moved here
    // dnf, rpm

    dnf(args) {
        if (args.length === 0) {
            return { error: 'dnf: no command specified' };
        }
        
        const subcommand = args[0];
        const packageName = args[1];
        
        if (subcommand === 'install') {
            if (!packageName) {
                return { error: 'dnf install: no package specified' };
            }
            
            if (this.installedPackages.includes(packageName)) {
                return { output: `Package ${packageName} is already installed.` };
            }
            
            if (!this.availablePackages.includes(packageName)) {
                return { error: `No match for argument: ${packageName}` };
            }
            
            this.installedPackages.push(packageName);
            this.availablePackages = this.availablePackages.filter(p => p !== packageName);
            
            return { output: `Installing:\n ${packageName}\n\nInstalled:\n  ${packageName}-1.0.0-1.el9.x86_64\n\nComplete!` };
        }
        
        if (subcommand === 'remove') {
            if (!packageName) {
                return { error: 'dnf remove: no package specified' };
            }
            
            if (!this.installedPackages.includes(packageName)) {
                return { error: `No match for argument: ${packageName}` };
            }
            
            this.installedPackages = this.installedPackages.filter(p => p !== packageName);
            this.availablePackages.push(packageName);
            
            return { output: `Removing:\n ${packageName}\n\nRemoved:\n  ${packageName}-1.0.0-1.el9.x86_64\n\nComplete!` };
        }
        
        if (subcommand === 'list') {
            if (args[1] === 'installed') {
                return { output: `Installed Packages\n${this.installedPackages.map(p => `${p}.x86_64`).join('\n')}` };
            }
            return { output: `Available Packages\n${this.availablePackages.map(p => `${p}.x86_64`).join('\n')}` };
        }
        
        if (subcommand === 'update' || subcommand === 'upgrade') {
            return { output: `Checking for updates...\nNothing to do.` };
        }
        
        if (subcommand === 'search') {
            if (!packageName) {
                return { error: 'dnf search: no search string specified' };
            }
            const matches = this.availablePackages.filter(p => p.includes(packageName));
            if (matches.length === 0) {
                return { output: `No matches found for: ${packageName}` };
            }
            return { output: `==================== Name Matched: ${packageName} ====================\n${matches.map(p => `${p}.x86_64 : ${p} package`).join('\n')}` };
        }
        
        if (subcommand === 'info') {
            if (!packageName) {
                return { error: 'dnf info: no package specified' };
            }
            const installed = this.installedPackages.includes(packageName);
            const available = this.availablePackages.includes(packageName);
            
            if (!installed && !available) {
                return { error: `No matching packages to list` };
            }
            
            return { output: `Name         : ${packageName}\nVersion      : 1.0.0\nRelease      : 1.el9\nArchitecture : x86_64\nSize         : 1.2 M\nSource       : ${packageName}-1.0.0-1.el9.src.rpm\nRepository   : ${installed ? '@System' : 'appstream'}\nSummary      : ${packageName} package\nDescription  : This is a simulated package for RHCSA practice.` };
        }
        
        if (subcommand === 'groupinstall') {
            const groupName = args.slice(1).join(' ');
            if (!groupName) {
                return { error: 'dnf groupinstall: no group specified' };
            }
            return { output: `Installing Group: ${groupName}\n\nComplete!` };
        }
        
        if (subcommand === 'history') {
            return { output: `ID     | Command line             | Date and time    | Action(s)      | Altered\n-------------------------------------------------------------------------------\n     3 | install httpd            | 2024-12-05 10:00 | Install        |    1\n     2 | remove vim               | 2024-12-05 09:30 | Removed        |    1\n     1 | install firewalld        | 2024-12-05 09:00 | Install        |    1` };
        }
        
        if (subcommand === 'repolist') {
            return { output: `repo id                          repo name\nappstream                        Red Hat Enterprise Linux 9 - AppStream\nbaseos                           Red Hat Enterprise Linux 9 - BaseOS\nextras                           Red Hat Enterprise Linux 9 - Extras` };
        }
        
        return { error: `dnf: unknown subcommand: ${subcommand}` };
    }
    
    rpm(args) {
        const flags = this.parseFlags(args, ['q', 'a', 'i', 'l', 'f', 'e', 'v', 'h']);
        
        // rpm -qa: List all installed packages
        if (flags.q && flags.a) {
            return { output: this.installedPackages.map(p => `${p}-1.0.0-1.el9.x86_64`).join('\n') };
        }
        
        // rpm -qi: Package info
        if (flags.q && flags.i) {
            const pkg = flags.args[0];
            if (!pkg || !this.installedPackages.includes(pkg)) {
                return { error: `package ${pkg || 'name'} is not installed` };
            }
            return { output: `Name        : ${pkg}\nVersion     : 1.0.0\nRelease     : 1.el9\nArchitecture: x86_64\nInstall Date: Thu 05 Dec 2024 10:00:00 AM UTC\nGroup       : System Environment/Daemons\nSize        : 1234567\nLicense     : GPLv2\nSignature   : RSA/SHA256\nSource RPM  : ${pkg}-1.0.0-1.el9.src.rpm\nBuild Date  : Wed 04 Dec 2024 05:00:00 PM UTC\nBuild Host  : build.redhat.com\nRelocations : (not relocatable)\nPackager    : Red Hat, Inc.\nVendor      : Red Hat, Inc.\nURL         : https://example.com\nSummary     : ${pkg} package\nDescription : This is a simulated package for RHCSA practice.` };
        }
        
        // rpm -ql: List files in package
        if (flags.q && flags.l) {
            const pkg = flags.args[0];
            if (!pkg || !this.installedPackages.includes(pkg)) {
                return { error: `package ${pkg || 'name'} is not installed` };
            }
            return { output: `/etc/${pkg}/${pkg}.conf\n/usr/bin/${pkg}\n/usr/lib64/${pkg}/lib${pkg}.so\n/usr/share/doc/${pkg}/README\n/usr/share/man/man8/${pkg}.8.gz` };
        }
        
        // rpm -qf: Find package owning file
        if (flags.q && flags.f) {
            const file = flags.args[0];
            if (!file) {
                return { error: 'rpm: no file specified' };
            }
            // Simple simulation
            return { output: `${this.installedPackages[0] || 'coreutils'}-1.0.0-1.el9.x86_64` };
        }
        
        // rpm -q: Query package
        if (flags.q) {
            const pkg = flags.args[0];
            if (!pkg) {
                return { error: 'rpm: no package specified' };
            }
            if (this.installedPackages.includes(pkg)) {
                return { output: `${pkg}-1.0.0-1.el9.x86_64` };
            }
            return { error: `package ${pkg} is not installed` };
        }
        
        // rpm -ivh: Install package
        if (flags.i && flags.v && flags.h) {
            const pkg = flags.args[0];
            if (!pkg) {
                return { error: 'rpm: no package file specified' };
            }
            return { output: `Preparing...                          ################################# [100%]\nUpdating / installing...\n   1:${pkg.replace('.rpm', '')}        ################################# [100%]` };
        }
        
        // rpm -e: Erase/uninstall package
        if (flags.e) {
            const pkg = flags.args[0];
            if (!pkg) {
                return { error: 'rpm: no package specified' };
            }
            if (!this.installedPackages.includes(pkg)) {
                return { error: `package ${pkg} is not installed` };
            }
            this.installedPackages = this.installedPackages.filter(p => p !== pkg);
            return { output: '' };
        }
        
        return { error: 'rpm: no query mode specified' };
    }

    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (validFlags.includes(char)) {
                        flags[char] = true;
                    }
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        flags.args = remainingArgs;
        return flags;
    }
}

if (typeof window !== 'undefined') {
    window.PackageCommands = PackageCommands;
}
