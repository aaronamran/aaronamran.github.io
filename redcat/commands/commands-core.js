// Core Shell Commands - Essential builtins and utilities
// Part of Red Cat RHCSA Terminal Simulator

class CoreCommands {
    constructor(sharedState) {
        // Reference to shared filesystem and state
        this.fs = sharedState.fs;
        this.env = sharedState.env;
        this.lastExitCode = sharedState.lastExitCode;
        this.scriptArgs = sharedState.scriptArgs;
    }

    echo(args, stdin = '') {
        let output = args.join(' ');
        
        // Handle -n flag (no trailing newline)
        let addNewline = true;
        if (args[0] === '-n') {
            addNewline = false;
            output = args.slice(1).join(' ');
        }
        
        // Handle -e flag (enable backslash escapes)
        if (args[0] === '-e') {
            output = args.slice(1).join(' ');
            output = output
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\\\/g, '\\');
        }
        
        return { stdout: output + (addNewline ? '\n' : ''), stderr: '', exitCode: 0 };
    }

    env(args, stdin = '') {
        if (args.length === 0) {
            const lines = Object.entries(this.env).map(([key, val]) => `${key}=${val}`);
            return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
        }
        return { stdout: '', stderr: 'env: command execution not implemented', exitCode: 1 };
    }

    export(args, stdin = '') {
        if (args.length === 0) {
            const lines = Object.entries(this.env).map(([key, val]) => `declare -x ${key}="${val}"`);
            return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
        }
        
        for (const arg of args) {
            const eqIdx = arg.indexOf('=');
            if (eqIdx > 0) {
                const key = arg.substring(0, eqIdx);
                let value = arg.substring(eqIdx + 1);
                value = value.replace(/^["']|["']$/g, '');
                this.env[key] = value;
            }
        }
        
        return { stdout: '', stderr: '', exitCode: 0 };
    }

    printenv(args, stdin = '') {
        if (args.length === 0) {
            const lines = Object.entries(this.env).map(([key, val]) => `${val}`);
            return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
        }
        
        const varName = args[0];
        if (this.env.hasOwnProperty(varName)) {
            return { stdout: this.env[varName], stderr: '', exitCode: 0 };
        }
        
        return { stdout: '', stderr: '', exitCode: 1 };
    }

    unset(args, stdin = '') {
        for (const varName of args) {
            delete this.env[varName];
        }
        return { stdout: '', stderr: '', exitCode: 0 };
    }

    pwd(args, stdin = '') {
        return { stdout: this.fs.currentPath + '\n', exitCode: 0 };
    }

    cd(args, stdin = '') {
        const path = args[0] || this.fs.users[this.fs.currentUser].home;
        const resolved = this.fs.resolvePath(path);
        
        const node = this.fs.getNode(path);
        if (!node) {
            return { stderr: `cd: ${path}: No such file or directory`, exitCode: 1 };
        }
        
        if (node.type !== 'directory') {
            return { stderr: `cd: ${path}: Not a directory`, exitCode: 1 };
        }
        
        if (!this.fs.hasPermission(node, 'x')) {
            return { stderr: `cd: ${path}: Permission denied`, exitCode: 1 };
        }
        
        this.env['OLDPWD'] = this.fs.currentPath;
        this.fs.currentPath = resolved;
        this.env['PWD'] = resolved;
        
        return { stdout: '', exitCode: 0, changeDir: true };
    }

    clear(args) {
        return { stdout: '', stderr: '', exitCode: 0, clearScreen: true };
    }

    history(args) {
        return { output: 'Command history feature not yet implemented' };
    }

    whoami(args) {
        return { stdout: this.fs.currentUser, stderr: '', exitCode: 0 };
    }

    id(args) {
        const username = args[0] || this.fs.currentUser;
        const user = this.fs.users[username];
        
        if (!user) {
            return { stderr: `id: ${username}: no such user`, exitCode: 1 };
        }
        
        const uid = user.uid;
        const gid = user.gid;
        const group = user.group;
        
        return { 
            stdout: `uid=${uid}(${username}) gid=${gid}(${group}) groups=${gid}(${group})`,
            stderr: '',
            exitCode: 0
        };
    }

    uname(args) {
        const flags = this.parseFlags(args, ['a', 's', 'n', 'r', 'v', 'm', 'o']);
        
        const info = {
            s: 'Linux',
            n: 'rhcsa-lab',
            r: '5.14.0-362.8.1.el9_3.x86_64',
            v: '#1 SMP PREEMPT_DYNAMIC Thu Nov 2 16:07:11 EDT 2023',
            m: 'x86_64',
            o: 'GNU/Linux'
        };
        
        let output = [];
        if (flags.a) {
            output = [info.s, info.n, info.r, info.v, info.m, info.o];
        } else {
            if (flags.s || Object.keys(flags).length === 1) output.push(info.s);
            if (flags.n) output.push(info.n);
            if (flags.r) output.push(info.r);
            if (flags.v) output.push(info.v);
            if (flags.m) output.push(info.m);
            if (flags.o) output.push(info.o);
        }
        
        return { stdout: output.join(' '), stderr: '', exitCode: 0 };
    }

    date(args) {
        return { stdout: new Date().toString(), stderr: '', exitCode: 0 };
    }

    help(args) {
        const helpText = `
Red Cat Terminal - RHCSA Practice Environment
==============================================

File Operations: ls, cd, pwd, mkdir, touch, cat, rm, cp, mv, ln, chmod, chown, chgrp
Text Processing: grep, sed, awk, head, tail, wc, sort, uniq, cut, diff, patch, tr, paste, join
Compression: tar, gzip, gunzip, bzip2, bunzip2, zip, unzip
User Management: useradd, userdel, usermod, passwd, groupadd, groupdel, groups, su, sudo
Package Management: dnf, rpm
System Services: systemctl, journalctl
Disk Management: df, du, lsblk, blkid, fdisk, parted
LVM: pvcreate, pvs, vgcreate, vgs, lvcreate, lvs, lvextend, lvreduce
Filesystem: mount, umount, mkswap, swapon, fsck
Network: ip, nmcli, ping, hostname, curl, wget, ss, netstat, dig
SELinux: getenforce, setenforce, chcon, restorecon, semanage, sestatus
Process: ps, top, kill, nice, renice, free, uptime
Scheduling: crontab, at, atq, atrm
Utilities: echo, env, export, printenv, clear, history, man, find

Use 'man <command>' for detailed help on specific commands.
Type 'scenarios' to see practice scenarios.
        `;
        return { stdout: helpText, stderr: '', exitCode: 0 };
    }

    man(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'What manual page do you want?', exitCode: 1 };
        }
        
        const command = args[0];
        const manPages = {
            ls: 'ls - list directory contents\n\nUsage: ls [OPTION]... [FILE]...\n\nOptions:\n  -l  use a long listing format\n  -a  do not ignore entries starting with .\n  -h  with -l, print human readable sizes\n  -R  list subdirectories recursively',
            cd: 'cd - change directory\n\nUsage: cd [DIR]\n\nChange the shell working directory to DIR.',
            grep: 'grep - print lines matching a pattern\n\nUsage: grep [OPTION]... PATTERN [FILE]...\n\nOptions:\n  -i  ignore case\n  -v  invert match\n  -r  recursive\n  -n  show line numbers',
            chmod: 'chmod - change file mode bits\n\nUsage: chmod [OPTION]... MODE FILE...\n\nChange the mode of each FILE to MODE.',
            systemctl: 'systemctl - Control the systemd system and service manager\n\nUsage: systemctl [OPTIONS...] COMMAND [NAME...]\n\nCommands:\n  start, stop, restart, status, enable, disable, list-units'
        };
        
        const manPage = manPages[command] || `No manual entry for ${command}`;
        return { stdout: manPage, stderr: '', exitCode: manPages[command] ? 0 : 16 };
    }

    bash(args, stdin = '') {
        return { stdout: 'bash: interactive shell not implemented in simulator', stderr: '', exitCode: 0 };
    }

    source(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'source: filename argument required', exitCode: 1 };
        }
        return { stdout: 'source: script execution not yet fully implemented', stderr: '', exitCode: 0 };
    }

    umask(args) {
        if (args.length === 0) {
            return { stdout: '0022', stderr: '', exitCode: 0 };
        }
        return { stdout: '', stderr: '', exitCode: 0 };
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

// Export for use in main commands
if (typeof window !== 'undefined') {
    window.CoreCommands = CoreCommands;
}
