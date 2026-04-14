// Core Shell Commands - Essential builtins and utilities
// Part of Red Cat RHCSA Terminal Simulator

class CoreCommands {
    constructor(sharedState) {
        // Reference to shared filesystem and state
        this.fs = sharedState.fs;
        this.env = sharedState.env;
        this.lastExitCode = sharedState.lastExitCode;
        this.scriptArgs = sharedState.scriptArgs;
        this.parent = sharedState.parent;  // Keep reference to parent for dynamic access
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
        // Get command history from parent (dynamic reference)
        const commandHistory = this.parent.commandHistory || [];
        
        // Parse options
        if (args.length > 0) {
            const option = args[0];
            
            // Clear history
            if (option === '-c') {
                this.parent.commandHistory = [];
                return { stdout: '', stderr: '', exitCode: 0 };
            }
            
            // Delete specific entry
            if (option === '-d' && args[1]) {
                const lineNum = parseInt(args[1]);
                if (isNaN(lineNum) || lineNum < 1 || lineNum > commandHistory.length) {
                    return { stderr: `history: ${args[1]}: history position out of range`, exitCode: 1 };
                }
                commandHistory.splice(lineNum - 1, 1);
                return { stdout: '', stderr: '', exitCode: 0 };
            }
            
            // Show last N commands
            const count = parseInt(option);
            if (!isNaN(count) && count > 0) {
                const start = Math.max(0, commandHistory.length - count);
                const lines = commandHistory
                    .slice(start)
                    .map((cmd, idx) => `  ${start + idx + 1}  ${cmd}`)
                    .join('\n');
                return { stdout: lines, stderr: '', exitCode: 0 };
            }
        }
        
        // Show all history
        if (commandHistory.length === 0) {
            return { stdout: '', stderr: '', exitCode: 0 };
        }
        
        const lines = commandHistory
            .map((cmd, idx) => `  ${idx + 1}  ${cmd}`)
            .join('\n');
        return { stdout: lines, stderr: '', exitCode: 0 };
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
            v: '#1 SMP PREEMPT_DYNAMIC Thu Nov 2 16:07:11 EDT 2023 (Red Hat 5.14.0-362.8.1.el9_3)',
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
Red Cat Terminal - RHCSA Practice Environment (100% Coverage)
==============================================================

📁 FILE OPERATIONS
   ls, cd, pwd, mkdir, touch, cat, rm, cp, mv, ln, chmod, chown, chgrp
   find, which, whereis, locate, stat, file, xargs, chattr, lsattr

📝 TEXT PROCESSING
   grep, sed, awk, head, tail, wc, sort, uniq, cut, diff, patch, tr, paste, join, tee

📦 COMPRESSION & ARCHIVES
   tar, gzip, gunzip, bzip2, bunzip2, xz, zip, unzip

👥 USER & GROUP MANAGEMENT
   useradd, userdel, usermod, passwd, groupadd, groupdel, groupmod, groups
   su, sudo, chage, id, whoami, w, who, last, newgrp, getfacl, setfacl

📦 PACKAGE MANAGEMENT
   dnf (install, remove, update, search, list, repolist)
   rpm (-qa, -qi, -ql, -qf)

⚙️  SYSTEM SERVICES & CONTROL
   systemctl (start, stop, restart, status, enable, disable, list-units)
   journalctl, systemd-analyze, timedatectl, hostnamectl, localectl, loginctl
   dmesg, logger, sysctl, tuned-adm

🚀 BOOT & INIT
   grub2-mkconfig, grub2-editenv, dracut

💾 DISK & FILESYSTEM
   df, du, lsblk, blkid, fdisk, parted, findmnt, lsof
   mount, umount, mkswap, swapon, swapoff, fsck
   mkfs.ext4, mkfs.xfs, mkfs.vfat

🔧 LVM (Logical Volume Manager)
   pvcreate, pvs, pvdisplay
   vgcreate, vgs, vgdisplay
   lvcreate, lvs, lvdisplay, lvextend, lvreduce

💎 ADVANCED STORAGE (NEW!)
   stratis (pool create/list/destroy, filesystem create/list)
   vdo (create, list, status, remove)

🧬 KERNEL MODULES (NEW!)
   lsmod, modprobe, modinfo, insmod, rmmod

🌐 NETWORK
   ip (addr, link, route), nmcli (con, dev)
   ping, hostname, hostnamectl, ssh, scp, curl, wget, rsync
   ss, netstat, dig, nslookup, host
   iptables, route, mtr, arping, ethtool  ← NEW!

🔒 SELINUX
   getenforce, setenforce, chcon, restorecon, semanage
   sestatus, getsebool, setsebool

⚡ PROCESS & RESOURCE MANAGEMENT
   ps, top, htop, kill, nice, renice, free, uptime, vmstat, iostat, sar

🔄 JOB CONTROL (NEW!)
   jobs, fg, bg, disown, nohup
   Ctrl+Z (suspend), Ctrl+C (interrupt)

⏰ SCHEDULING
   crontab, at, atq, atrm, anacron

🎯 SHELL FEATURES (NEW!)
   History expansion: !!, !$, !n, !string
   Brace expansion: {1..10}, {a..z}, {abc,def}
   Scripting: test, [, if/then/else, for, while, case, functions
   Redirection: >, >>, <, 2>, 2>&1, |
   Command substitution: $(command), Chaining: &&, ||, ;

🖥️  TERMINAL COMMANDS (NEW!)
   reset, stty, tput, logrotate

🔴 RHEL ECOSYSTEM (NEW!)
   subscription-manager (register, attach, status, list)
   insights-client (register, status, run)
   authselect (select, list, current)

📦 CONTAINERS
   podman (run, ps, images, pull, build, stop, rm, rmi)

🛠️  UTILITIES
   echo, env, export, printenv, set, unset, clear, history, man
   date, uname, whoami, id, bash, source

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: Use 'man <command>' for detailed help on any command
📚 Type 'scenarios' to see RHCSA practice scenarios
🎓 Click "Exam Mode" button for timed exam simulation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
        return { stdout: helpText, stderr: '', exitCode: 0 };
    }

    man(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'What manual page do you want?', exitCode: 1 };
        }
        
        const command = args[0];
        const manPages = {
            // ========== CORE & SHELL ==========
            ls: 'LS(1)                         User Commands                         LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about FILEs (the current directory by default).\n\nOPTIONS\n       -a, --all\n              do not ignore entries starting with .\n\n       -l     use a long listing format\n\n       -h, --human-readable\n              with -l, print sizes in human readable format (e.g., 1K 234M 2G)\n\n       -R, --recursive\n              list subdirectories recursively',
            
            cd: 'CD(1)                          User Commands                         CD(1)\n\nNAME\n       cd - change the shell working directory\n\nSYNOPSIS\n       cd [-L|[-P]] [dir]\n\nDESCRIPTION\n       Change the shell working directory. Changes the current directory to DIR.\n       The default DIR is the value of the HOME shell variable.\n\nOPTIONS\n       -L     force symbolic links to be followed\n       -P     use the physical directory structure',
            
            pwd: 'PWD(1)                         User Commands                         PWD(1)\n\nNAME\n       pwd - print working directory\n\nSYNOPSIS\n       pwd [OPTION]...\n\nDESCRIPTION\n       Print the full filename of the current working directory.\n\nOPTIONS\n       -L     print the value of $PWD if it names the current working directory\n       -P     print the physical directory, without any symbolic links',
            
            echo: 'ECHO(1)                        User Commands                         ECHO(1)\n\nNAME\n       echo - display a line of text\n\nSYNOPSIS\n       echo [SHORT-OPTION]... [STRING]...\n\nDESCRIPTION\n       Echo the STRING(s) to standard output.\n\nOPTIONS\n       -n     do not output the trailing newline\n       -e     enable interpretation of backslash escapes\n       -E     disable interpretation of backslash escapes (default)',
            
            cat: 'CAT(1)                         User Commands                         CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [OPTION]... [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output. With no FILE, or when FILE is -, read standard input.\n\nOPTIONS\n       -n, --number\n              number all output lines',
            
            mkdir: 'MKDIR(1)                       User Commands                         MKDIR(1)\n\nNAME\n       mkdir - make directories\n\nSYNOPSIS\n       mkdir [OPTION]... DIRECTORY...\n\nDESCRIPTION\n       Create the DIRECTORY(ies), if they do not already exist.\n\nOPTIONS\n       -p, --parents\n              make parent directories as needed\n\n       -m, --mode=MODE\n              set file mode (as in chmod), not a=rwx - umask',
            
            touch: 'TOUCH(1)                       User Commands                         TOUCH(1)\n\nNAME\n       touch - change file timestamps\n\nSYNOPSIS\n       touch [OPTION]... FILE...\n\nDESCRIPTION\n       Update the access and modification times of each FILE to the current time.\n       A FILE argument that does not exist is created empty.',
            
            rm: 'RM(1)                          User Commands                         RM(1)\n\nNAME\n       rm - remove files or directories\n\nSYNOPSIS\n       rm [OPTION]... FILE...\n\nDESCRIPTION\n       Remove (unlink) the FILE(s).\n\nOPTIONS\n       -f, --force\n              ignore nonexistent files and arguments, never prompt\n\n       -r, -R, --recursive\n              remove directories and their contents recursively',
            
            cp: 'CP(1)                          User Commands                         CP(1)\n\nNAME\n       cp - copy files and directories\n\nSYNOPSIS\n       cp [OPTION]... SOURCE DEST\n\nDESCRIPTION\n       Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.\n\nOPTIONS\n       -r, -R, --recursive\n              copy directories recursively\n\n       -v, --verbose\n              explain what is being done',
            
            mv: 'MV(1)                          User Commands                         MV(1)\n\nNAME\n       mv - move (rename) files\n\nSYNOPSIS\n       mv [OPTION]... SOURCE DEST\n\nDESCRIPTION\n       Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.\n\nOPTIONS\n       -f, --force\n              do not prompt before overwriting\n\n       -v, --verbose\n              explain what is being done',
            
            ln: 'LN(1)                          User Commands                         LN(1)\n\nNAME\n       ln - make links between files\n\nSYNOPSIS\n       ln [OPTION]... TARGET LINK_NAME\n\nDESCRIPTION\n       Create a link to TARGET with the name LINK_NAME.\n\nOPTIONS\n       -s, --symbolic\n              make symbolic links instead of hard links\n\n       -f, --force\n              remove existing destination files',
            
            chmod: 'CHMOD(1)                       User Commands                         CHMOD(1)\n\nNAME\n       chmod - change file mode bits\n\nSYNOPSIS\n       chmod [OPTION]... MODE FILE...\n\nDESCRIPT ION\n       Change the mode of each FILE to MODE. Modes may be absolute (octal) or symbolic.\n\nEXAMPLES\n       chmod 755 file\n       chmod u+x file\n       chmod go-w file',
            
            chown: 'CHOWN(1)                       User Commands                         CHOWN(1)\n\nNAME\n       chown - change file owner and group\n\nSYNOPSIS\n       chown [OPTION]... [OWNER][:[GROUP]] FILE...\n\nDESCRIPTION\n       Change the owner and/or group of each FILE to OWNER and/or GROUP.\n\nOPTIONS\n       -R, --recursive\n              operate on files and directories recursively',
            
            chgrp: 'CHGRP(1)                       User Commands                         CHGRP(1)\n\nNAME\n       chgrp - change group ownership\n\nSYNOPSIS\n       chgrp [OPTION]... GROUP FILE...\n\nDESCRIPTION\n       Change the group of each FILE to GROUP.\n\nOPTIONS\n       -R, --recursive\n              operate on files and directories recursively',
            
            find: 'FIND(1)                        User Commands                         FIND(1)\n\nNAME\n       find - search for files in a directory hierarchy\n\nSYNOPSIS\n       find [-H] [-L] [-P] [path...] [expression]\n\nDESCRIPTION\n       Search for files in a directory hierarchy. The default path is the current directory.\n\nOPTIONS\n       -name pattern\n              Base of file name matches shell pattern\n\n       -type c\n              File is of type c (f=file, d=directory, l=link)\n\nEXAMPLE\n       find /etc -name "*.conf" -type f',
            
            which: 'WHICH(1)                       User Commands                         WHICH(1)\n\nNAME\n       which - shows the full path of (shell) commands\n\nSYNOPSIS\n       which [options] [--] programname [...]\n\nDESCRIPTION\n       Which takes one or more arguments. For each of its arguments it prints to stdout the full path of the executables that would have been executed when this argument had been entered at the shell prompt.',
            
            whereis: 'WHEREIS(1)                     User Commands                         WHEREIS(1)\n\nNAME\n       whereis - locate the binary, source, and manual page files for a command\n\nSYNOPSIS\n       whereis [options] name...\n\nDESCRIPTION\n       whereis locates the binary, source and manual files for the specified command names.',
            
            locate: 'LOCATE(1)                      User Commands                         LOCATE(1)\n\nNAME\n       locate - find files by name\n\nSYNOPSIS\n       locate [OPTION]... PATTERN...\n\nDESCRIPTION\n       locate reads one or more databases prepared by updatedb and writes file names matching at least one of the PATTERNs to standard output, one per line.',
            
            // ========== TEXT PROCESSING ==========
            grep: 'GREP(1)                        User Commands                         GREP(1)\n\nNAME\n       grep - print lines matching a pattern\n\nSYNOPSIS\n       grep [OPTIONS] PATTERN [FILE...]\n\nDESCRIPTION\n       Search for PATTERN in each FILE. By default, grep prints the matching lines.\n\nOPTIONS\n       -i, --ignore-case\n              Ignore case distinctions\n\n       -v, --invert-match\n              Invert the sense of matching\n\n       -r, --recursive\n              Read all files under each directory recursively\n\n       -n, --line-number\n              Prefix each line with 1-based line number',
            
            sed: 'SED(1)                         User Commands                         SED(1)\n\nNAME\n       sed - stream editor for filtering and transforming text\n\nSYNOPSIS\n       sed [OPTION]... {script} [input-file]...\n\nDESCRIPTION\n       Sed is a stream editor. A stream editor is used to perform basic text transformations on an input stream.\n\nCOMMANDS\n       s/regexp/replacement/\n              Substitute replacement for regexp\n\n       d      Delete pattern space\n\nEXAMPLE\n       sed "s/old/new/g" file.txt',
            
            awk: 'AWK(1)                         User Commands                         AWK(1)\n\nNAME\n       awk - pattern scanning and text processing language\n\nSYNOPSIS\n       awk [ -F fs ] [ -v var=value ] [ prog | -f progfile ] [ file ...  ]\n\nDESCRIPTION\n       Awk scans each input file for lines that match any of a set of patterns.\n\nBUILT-IN VARIABLES\n       $0     Entire line\n       $1,$2  First, second field\n       NR     Number of records\n       NF     Number of fields',
            
            head: 'HEAD(1)                        User Commands                         HEAD(1)\n\nNAME\n       head - output the first part of files\n\nSYNOPSIS\n       head [OPTION]... [FILE]...\n\nDESCRIPTION\n       Print the first 10 lines of each FILE to standard output.\n\nOPTIONS\n       -n, --lines=[-]NUM\n              print the first NUM lines instead of the first 10',
            
            tail: 'TAIL(1)                        User Commands                         TAIL(1)\n\nNAME\n       tail - output the last part of files\n\nSYNOPSIS\n       tail [OPTION]... [FILE]...\n\nDESCRIPTION\n       Print the last 10 lines of each FILE to standard output.\n\nOPTIONS\n       -n, --lines=[+]NUM\n              output the last NUM lines\n\n       -f, --follow\n              output appended data as the file grows',
            
            wc: 'WC(1)                          User Commands                         WC(1)\n\nNAME\n       wc - print newline, word, and byte counts for each file\n\nSYNOPSIS\n       wc [OPTION]... [FILE]...\n\nDESCRIPTION\n       Print newline, word, and byte counts for each FILE.\n\nOPTIONS\n       -l, --lines\n              print the newline counts\n\n       -w, --words\n              print the word counts\n\n       -c, --bytes\n              print the byte counts',
            
            sort: 'SORT(1)                        User Commands                         SORT(1)\n\nNAME\n       sort - sort lines of text files\n\nSYNOPSIS\n       sort [OPTION]... [FILE]...\n\nDESCRIPTION\n       Write sorted concatenation of all FILE(s) to standard output.\n\nOPTIONS\n       -n, --numeric-sort\n              compare according to string numerical value\n\n       -r, --reverse\n              reverse the result of comparisons\n\n       -u, --unique\n              output only the first of an equal run',
            
            uniq: 'UNIQ(1)                        User Commands                         UNIQ(1)\n\nNAME\n       uniq - report or omit repeated lines\n\nSYNOPSIS\n       uniq [OPTION]... [INPUT [OUTPUT]]\n\nDESCRIPTION\n       Filter adjacent matching lines from INPUT, writing to OUTPUT.\n\nOPTIONS\n       -c, --count\n              prefix lines by the number of occurrences\n\n       -d, --repeated\n              only print duplicate lines',
            
            cut: 'CUT(1)                         User Commands                         CUT(1)\n\nNAME\n       cut - remove sections from each line of files\n\nSYNOPSIS\n       cut OPTION... [FILE]...\n\nDESCRIPTION\n       Print selected parts of lines from each FILE to standard output.\n\nOPTIONS\n       -d, --delimiter=DELIM\n              use DELIM instead of TAB for field delimiter\n\n       -f, --fields=LIST\n              select only these fields',
            
            diff: 'DIFF(1)                        User Commands                         DIFF(1)\n\nNAME\n       diff - compare files line by line\n\nSYNOPSIS\n       diff [OPTION]... FILES\n\nDESCRIPTION\n       Compare FILES line by line.\n\nOPTIONS\n       -u, -U NUM, --unified[=NUM]\n              output NUM (default 3) lines of unified context',
            
            tr: 'TR(1)                          User Commands                         TR(1)\n\nNAME\n       tr - translate or delete characters\n\nSYNOPSIS\n       tr [OPTION]... SET1 [SET2]\n\nDESCRIPTION\n       Translate, squeeze, and/or delete characters from standard input, writing to standard output.\n\nOPTIONS\n       -d, --delete\n              delete characters in SET1\n\n       -s, --squeeze-repeats\n              replace each sequence of a repeated character',
            
            // ========== COMPRESSION ==========
            tar: 'TAR(1)                         User Commands                         TAR(1)\n\nNAME\n       tar - an archiving utility\n\nSYNOPSIS\n       tar [OPTION...] [FILE]...\n\nDESCRIPTION\n       GNU tar saves many files together into a single tape or disk archive.\n\nOPTIONS\n       -c, --create\n              create a new archive\n\n       -x, --extract\n              extract files from an archive\n\n       -t, --list\n              list the contents of an archive\n\n       -z, --gzip\n              filter the archive through gzip\n\n       -f, --file=ARCHIVE\n              use archive file ARCHIVE',
            
            gzip: 'GZIP(1)                        User Commands                         GZIP(1)\n\nNAME\n       gzip - compress files\n\nSYNOPSIS\n       gzip [ -d ] [ name ...  ]\n\nDESCRIPTION\n       Gzip reduces the size of the named files using Lempel-Ziv coding (LZ77).\n\nOPTIONS\n       -d, --decompress\n              Decompress',
            
            xz: 'XZ(1)                          User Commands                         XZ(1)\n\nNAME\n       xz - Compress or decompress .xz files\n\nSYNOPSIS\n       xz [option...] [file...]\n\nDESCRIPTION\n       xz is a general-purpose data compression tool with command line syntax similar to gzip and bzip2.\n\nOPTIONS\n       -d, --decompress\n              Decompress\n\n       -k, --keep\n              Don\'t delete the input files',
            
            // ========== USER MANAGEMENT ==========
            useradd: 'USERADD(8)                    System Commands                      USERADD(8)\n\nNAME\n       useradd - create a new user or update default new user information\n\nSYNOPSIS\n       useradd [options] LOGIN\n\nDESCRIPTION\n       useradd creates a new user account using the values specified on the command line plus the default values from the system.\n\nOPTIONS\n       -m, --create-home\n              Create the user\'s home directory\n\n       -s, --shell SHELL\n              The name of the user\'s login shell\n\n       -G, --groups GROUPS\n              List of supplementary groups',
            
            usermod: 'USERMOD(8)                    System Commands                      USERMOD(8)\n\nNAME\n       usermod - modify a user account\n\nSYNOPSIS\n       usermod [options] LOGIN\n\nDESCRIPTION\n       The usermod command modifies the system account files.\n\nOPTIONS\n       -aG, --append --groups GROUPS\n              Add the user to the supplementary GROUPS\n\n       -L, --lock\n              Lock a user\'s password\n\n       -U, --unlock\n              Unlock a user\'s password',
            
            userdel: 'USERDEL(8)                    System Commands                      USERDEL(8)\n\nNAME\n       userdel - delete a user account and related files\n\nSYNOPSIS\n       userdel [options] LOGIN\n\nDESCRIPTION\n       The userdel command modifies the system account files, deleting all entries that refer to the user name LOGIN.\n\nOPTIONS\n       -r, --remove\n              Files in the user\'s home directory will be removed',
            
            passwd: 'PASSWD(1)                      User Commands                         PASSWD(1)\n\nNAME\n       passwd - change user password\n\nSYNOPSIS\n       passwd [options] [LOGIN]\n\nDESCRIPTION\n       The passwd command changes passwords for user accounts.\n\nOPTIONS\n       --stdin\n              Read the new password from standard input',
            
            groupadd: 'GROUPADD(8)                   System Commands                      GROUPADD(8)\n\nNAME\n       groupadd - create a new group\n\nSYNOPSIS\n       groupadd [options] GROUP\n\nDESCRIPTION\n       The groupadd command creates a new group account using the values specified.\n\nOPTIONS\n       -g, --gid GID\n              The numerical value of the group\'s ID',
            
            sudo: 'SUDO(8)                        System Commands                      SUDO(8)\n\nNAME\n       sudo - execute a command as another user\n\nSYNOPSIS\n       sudo -h | -K | -k | -V\n       sudo -v [-AknS] [-g group] [-h host] [-p prompt] [-u user]\n       sudo -l [-AknS] [-g group] [-h host] [-p prompt] [-U user] [-u user] [command]\n       sudo [-AbEHknPS] [-C num] [-g group] [-h host] [-p prompt] [-T timeout] [-u user] [VAR=value] [-i | -s] [command]\n\nDESCRIPTION\n       sudo allows a permitted user to execute a command as the superuser or another user.',
            
            id: 'ID(1)                          User Commands                         ID(1)\n\nNAME\n       id - print real and effective user and group IDs\n\nSYNOPSIS\n       id [OPTION]... [USER]\n\nDESCRIPTION\n       Print user and group information for the specified USER, or for the current user.',
            
            whoami: 'WHOAMI(1)                      User Commands                         WHOAMI(1)\n\nNAME\n       whoami - print effective userid\n\nSYNOPSIS\n       whoami [OPTION]...\n\nDESCRIPTION\n       Print the user name associated with the current effective user ID.',
            
            su: 'SU(1)                          User Commands                         SU(1)\n\nNAME\n       su - run a command with substitute user and group ID\n\nSYNOPSIS\n       su [options] [-] [user [argument...]]\n\nDESCRIPTION\n       Change the effective user ID and group ID to that of USER.\n\nOPTIONS\n       -, -l, --login\n              Start the shell as a login shell',
            
            chage: 'CHAGE(1)                       User Commands                         CHAGE(1)\n\nNAME\n       chage - change user password expiry information\n\nSYNOPSIS\n       chage [options] LOGIN\n\nDESCRIPTION\n       The chage command changes the number of days between password changes and the date of the last password change.\n\nOPTIONS\n       -l, --list\n              Show account aging information\n\n       -M, --maxdays MAX_DAYS\n              Set the maximum number of days during which a password is valid',
            
            getfacl: 'GETFACL(1)                     User Commands                         GETFACL(1)\n\nNAME\n       getfacl - get file access control lists\n\nSYNOPSIS\n       getfacl file...\n\nDESCRIPTION\n       For each file, getfacl displays the file name, owner, group, and Access Control List (ACL).',
            
            setfacl: 'SETFACL(1)                     User Commands                         SETFACL(1)\n\nNAME\n       setfacl - set file access control lists\n\nSYNOPSIS\n       setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...\n\nDESCRIPTION\n       This utility sets Access Control Lists (ACLs) of files and directories.\n\nOPTIONS\n       -m, --modify=acl\n              Modify the current ACL\n\n       -x, --remove=acl\n              Remove entries from the ACL',
            
            // ========== SYSTEM & SERVICES ==========
            systemctl: 'SYSTEMCTL(1)                   System Commands                      SYSTEMCTL(1)\n\nNAME\n       systemctl - Control the systemd system and service manager\n\nSYNOPSIS\n       systemctl [OPTIONS...] COMMAND [NAME...]\n\nDESCRIPTION\n       systemctl may be used to introspect and control the state of the systemd system and service manager.\n\nCOMMANDS\n       start NAME...\n              Start (activate) one or more units\n\n       stop NAME...\n              Stop (deactivate) one or more units\n\n       restart NAME...\n              Restart one or more units\n\n       status [NAME...]\n              Show runtime status information about one or more units\n\n       enable NAME...\n              Enable one or more unit files\n\n       disable NAME...\n              Disable one or more unit files\n\n       list-units\n              List units currently in memory',
            
            journalctl: 'JOURNALCTL(1)                  System Commands                      JOURNALCTL(1)\n\nNAME\n       journalctl - Query the systemd journal\n\nSYNOPSIS\n       journalctl [OPTIONS...] [MATCHES...]\n\nDESCRIPTION\n       journalctl may be used to query the contents of the systemd journal.\n\nOPTIONS\n       -u, --unit=UNIT\n              Show messages for the specified systemd unit\n\n       -f, --follow\n              Show only the most recent journal entries\n\n       -p, --priority=RANGE\n              Filter output by message priorities or priority ranges\n\n       -x, --catalog\n              Augment log lines with explanation texts',
            
            timedatectl: 'TIMEDATECTL(1)                 System Commands                      TIMEDATECTL(1)\n\nNAME\n       timedatectl - Control the system time and date\n\nSYNOPSIS\n       timedatectl [OPTIONS...] {COMMAND}\n\nDESCRIPTION\n       timedatectl may be used to query and change the system clock and its settings.\n\nCOMMANDS\n       status\n              Show current settings of the system clock and RTC\n\n       set-time TIME\n              Set the system clock to the specified time\n\n       set-timezone TIMEZONE\n              Set the system timezone to the specified value\n\n       list-timezones\n              List available timezones',
            
            hostnamectl: 'HOSTNAMECTL(1)                 System Commands                      HOSTNAMECTL(1)\n\nNAME\n       hostnamectl - Control the system hostname\n\nSYNOPSIS\n       hostnamectl [OPTIONS...] {COMMAND}\n\nDESCRIPTION\n       hostnamectl may be used to query and change the system hostname and related settings.\n\nCOMMANDS\n       status\n              Show current system hostname and related information\n\n       set-hostname NAME\n              Set the system hostname to NAME',
            
            localectl: 'LOCALECTL(1)                   System Commands                      LOCALECTL(1)\n\nNAME\n       localectl - Control the system locale and keyboard layout settings\n\nSYNOPSIS\n       localectl [OPTIONS...] {COMMAND}\n\nDESCRIPTION\n       localectl may be used to query and change the system locale and keyboard layout settings.\n\nCOMMANDS\n       status\n              Show current settings of the system locale and keyboard mapping\n\n       set-locale LOCALE...\n              Set the system locale',
            
            loginctl: 'LOGINCTL(1)                    System Commands                      LOGINCTL(1)\n\nNAME\n       loginctl - Control the systemd login manager\n\nSYNOPSIS\n       loginctl [OPTIONS...] {COMMAND} [NAME...]\n\nDESCRIPTION\n       loginctl may be used to introspect and control the state of the systemd login manager.\n\nCOMMANDS\n       list-sessions\n              List currently active login sessions\n\n       list-users\n              List currently logged in users\n\n       terminate-session ID...\n              Terminate one or more login sessions',
            
            sysctl: 'SYSCTL(8)                      System Commands                      SYSCTL(8)\n\nNAME\n       sysctl - configure kernel parameters at runtime\n\nSYNOPSIS\n       sysctl [options] [variable[=value]]...\n\nDESCRIPTION\n       sysctl is used to modify kernel parameters at runtime. The parameters available are those listed under /proc/sys/.\n\nOPTIONS\n       -a, --all\n              Display all values currently available\n\n       -w, --write\n              Use this option when you want to change a sysctl setting\n\n       -p, --load[=FILE]\n              Load in sysctl settings from the file specified or /etc/sysctl.conf',
            
            dmesg: 'DMESG(1)                       User Commands                         DMESG(1)\n\nNAME\n       dmesg - print or control the kernel ring buffer\n\nSYNOPSIS\n       dmesg [options]\n\nDESCRIPTION\n       dmesg is used to examine or control the kernel ring buffer.\n\nOPTIONS\n       -c, --read-clear\n              Clear the ring buffer after printing\n\n       -T, --ctime\n              Print human-readable timestamps\n\n       -H, --human\n              Enable human-readable output',
            
            logger: 'LOGGER(1)                      User Commands                         LOGGER(1)\n\nNAME\n       logger - enter messages into the system log\n\nSYNOPSIS\n       logger [options] [message]\n\nDESCRIPTION\n       logger makes entries in the system log.\n\nOPTIONS\n       -p, --priority priority\n              Enter the message with the specified priority\n\n       -t, --tag tag\n              Mark every line to be logged with the specified tag',
            
            uname: 'UNAME(1)                       User Commands                         UNAME(1)\n\nNAME\n       uname - print system information\n\nSYNOPSIS\n       uname [OPTION]...\n\nDESCRIPTION\n       Print certain system information.\n\nOPTIONS\n       -a, --all\n              print all information\n\n       -r, --kernel-release\n              print the kernel release\n\n       -m, --machine\n              print the machine hardware name',
            
            date: 'DATE(1)                        User Commands                         DATE(1)\n\nNAME\n       date - print or set the system date and time\n\nSYNOPSIS\n       date [OPTION]... [+FORMAT]\n\nDESCRIPTION\n       Display the current time in the given FORMAT, or set the system date.',
            
            uptime: 'UPTIME(1)                      User Commands                         UPTIME(1)\n\nNAME\n       uptime - Tell how long the system has been running\n\nSYNOPSIS\n       uptime [options]\n\nDESCRIPTION\n       uptime gives a one line display of the following information: the current time, how long the system has been running, how many users are currently logged on, and the system load averages.',
            
            // ========== PROCESS MANAGEMENT ==========
            ps: 'PS(1)                          User Commands                         PS(1)\n\nNAME\n       ps - report a snapshot of the current processes\n\nSYNOPSIS\n       ps [options]\n\nDESCRIPTION\n       ps displays information about a selection of the active processes.\n\nOPTIONS\n       -e     Select all processes\n\n       -f     Do full-format listing\n\n       aux    BSD-style listing',
            
            top: 'TOP(1)                         User Commands                         TOP(1)\n\nNAME\n       top - display Linux processes\n\nSYNOPSIS\n       top -hv|-bcEeHiOSs1 -d secs -n max -u|U user -p pid(s) -o field -w [cols]\n\nDESCRIPTION\n       The top program provides a dynamic real-time view of a running system.',
            
            kill: 'KILL(1)                        User Commands                         KILL(1)\n\nNAME\n       kill - send a signal to a process\n\nSYNOPSIS\n       kill [-s signal|-p] [-q sigval] [-a] [--] pid...\n       kill -l [signal]\n\nDESCRIPTION\n       The command kill sends the specified signal to the specified process or process group.\n\nOPTIONS\n       -9     SIGKILL - force kill\n\n       -15    SIGTERM - terminate gracefully (default)\n\n       -l     List signal names',
            
            nice: 'NICE(1)                        User Commands                         NICE(1)\n\nNAME\n       nice - run a program with modified scheduling priority\n\nSYNOPSIS\n       nice [OPTION] [COMMAND [ARG]...]\n\nDESCRIPTION\n       Run COMMAND with an adjusted niceness, which affects scheduling priority.\n\nOPTIONS\n       -n, --adjustment=N\n              add integer N to the niceness (default 10)',
            
            renice: 'RENICE(1)                      User Commands                         RENICE(1)\n\nNAME\n       renice - alter priority of running processes\n\nSYNOPSIS\n       renice [-n] priority [[-p] pid ...] [[-g] pgrp ...] [[-u] user ...]\n\nDESCRIPTION\n       renice alters the scheduling priority of one or more running processes.',
            
            free: 'FREE(1)                        User Commands                         FREE(1)\n\nNAME\n       free - Display amount of free and used memory in the system\n\nSYNOPSIS\n       free [options]\n\nDESCRIPTION\n       free displays the total amount of free and used physical and swap memory in the system.\n\nOPTIONS\n       -h, --human\n              Show all output fields automatically scaled to shortest unit\n\n       -m     Display the amount of memory in mebibytes',
            
            // ========== JOB CONTROL ==========
            jobs: 'JOBS(1)                        Shell Builtin                         JOBS(1)\n\nNAME\n       jobs - Display status of jobs in current session\n\nSYNOPSIS\n       jobs [-l] [jobspec ...]\n\nDESCRIPTION\n       Lists the active jobs. The optional -l option lists process IDs in addition to the normal information.\n\nOUTPUT FORMAT\n       [1]+  Running                 sleep 100 &\n       [2]-  Stopped                 vi file.txt\n\n       + indicates current job\n       - indicates previous job',
            
            fg: 'FG(1)                          Shell Builtin                         FG(1)\n\nNAME\n       fg - Bring job to foreground\n\nSYNOPSIS\n       fg [jobspec]\n\nDESCRIPTION\n       Resume jobspec in the foreground, and make it the current job. If jobspec is not present, the shell\'s current job is used.\n\nJOB SPECIFICATIONS\n       %n     Job number n\n       %%     Current job\n       %+     Current job\n       %-     Previous job',
            
            bg: 'BG(1)                          Shell Builtin                         BG(1)\n\nNAME\n       bg - Resume job in background\n\nSYNOPSIS\n       bg [jobspec ...]\n\nDESCRIPTION\n       Resume each suspended job jobspec in the background, as if it had been started with &. If jobspec is not present, the shell\'s current job is used.',
            
            disown: 'DISOWN(1)                      Shell Builtin                         DISOWN(1)\n\nNAME\n       disown - Remove jobs from table of active jobs\n\nSYNOPSIS\n       disown [-h] [jobspec ...]\n\nDESCRIPTION\n       Remove each jobspec from the table of active jobs. Without any jobspecs, the current job is used.',
            
            nohup: 'NOHUP(1)                       User Commands                         NOHUP(1)\n\nNAME\n       nohup - run a command immune to hangups\n\nSYNOPSIS\n       nohup COMMAND [ARG]...\n\nDESCRIPTION\n       Run COMMAND, ignoring hangup signals. If standard output is a terminal, append output to nohup.out.',
            
            // ========== PACKAGE MANAGEMENT ==========
            dnf: 'DNF(8)                         System Commands                      DNF(8)\n\nNAME\n       dnf - Dandified YUM package manager\n\nSYNOPSIS\n       dnf [options] <command> [<arguments>...]\n\nDESCRIPTION\n       DNF is the next generation version of YUM, a package manager for RPM-based Linux distributions.\n\nCOMMANDS\n       install     Install packages\n       remove      Remove packages\n       update      Update packages\n       search      Search packages\n       list        List packages\n       repolist    Display configured repositories',
            
            rpm: 'RPM(8)                         System Commands                      RPM(8)\n\nNAME\n       rpm - RPM Package Manager\n\nSYNOPSIS\n       rpm [OPTIONS]\n\nDESCRIPTION\n       rpm is a powerful Package Manager for Red Hat based systems.\n\nQUERY OPTIONS\n       -q, --query\n              Query whether a package is installed\n\n       -a, --all\n              Query all installed packages\n\n       -i, --info\n              Display package information\n\n       -l, --list\n              List files in package\n\n       -f, --file\n              Query package owning file',
            
            // ========== STORAGE & LVM ==========
            df: 'DF(1)                          User Commands                         DF(1)\n\nNAME\n       df - report file system disk space usage\n\nSYNOPSIS\n       df [OPTION]... [FILE]...\n\nDESCRIPTION\n       df displays the amount of disk space available on the file system.\n\nOPTIONS\n       -h, --human-readable\n              print sizes in powers of 1024\n\n       -T, --print-type\n              print file system type',
            
            du: 'DU(1)                          User Commands                         DU(1)\n\nNAME\n       du - estimate file space usage\n\nSYNOPSIS\n       du [OPTION]... [FILE]...\n\nDESCRIPTION\n       Summarize disk usage of the set of FILEs, recursively for directories.\n\nOPTIONS\n       -h, --human-readable\n              print sizes in human readable format\n\n       -s, --summarize\n              display only a total for each argument',
            
            lsblk: 'LSBLK(8)                       System Commands                      LSBLK(8)\n\nNAME\n       lsblk - list block devices\n\nSYNOPSIS\n       lsblk [options] [device...]\n\nDESCRIPTION\n       lsblk lists information about all available or the specified block devices.',
            
            blkid: 'BLKID(8)                       System Commands                      BLKID(8)\n\nNAME\n       blkid - locate/print block device attributes\n\nSYNOPSIS\n       blkid [options] [device...]\n\nDESCRIPTION\n       The blkid program is the command-line interface to working with the libblkid library.',
            
            fdisk: 'FDISK(8)                       System Commands                      FDISK(8)\n\nNAME\n       fdisk - manipulate disk partition table\n\nSYNOPSIS\n       fdisk [options] device\n\nDESCRIPTION\n       fdisk is a dialog-driven program for creation and manipulation of partition tables.\n\nOPTIONS\n       -l     List the partition tables for the specified devices',
            
            parted: 'PARTED(8)                      System Commands                      PARTED(8)\n\nNAME\n       parted - a partition manipulation program\n\nSYNOPSIS\n       parted [options] [device [command [options...]]]\n\nDESCRIPTION\n       parted is a program to manipulate disk partitions. It supports multiple partition table formats.',
            
            mount: 'MOUNT(8)                       System Commands                      MOUNT(8)\n\nNAME\n       mount - mount a filesystem\n\nSYNOPSIS\n       mount [-fnrsvw] [-t fstype] [-o options] device mountpoint\n\nDESCRIPTION\n       All files accessible in a Unix system are arranged in one big tree, the file hierarchy, rooted at /. These files can be spread out over several devices. The mount command serves to attach the filesystem found on some device to the big file tree.\n\nOPTIONS\n       -a, --all\n              Mount all filesystems mentioned in fstab\n\n       -t, --types fstype\n              The argument following -t is used to indicate the filesystem type',
            
            umount: 'UMOUNT(8)                      System Commands                      UMOUNT(8)\n\nNAME\n       umount - unmount file systems\n\nSYNOPSIS\n       umount [-hhlnrv] {directory|device}...\n\nDESCRIPTION\n       The umount command detaches the filesystem(s) mentioned from the file hierarchy.',
            
            pvcreate: 'PVCREATE(8)                    LVM Tools                            PVCREATE(8)\n\nNAME\n       pvcreate - Initialize physical volume(s) for use by LVM\n\nSYNOPSIS\n       pvcreate device...\n\nDESCRIPTION\n       pvcreate initializes a Physical Volume (PV) for later use by the Logical Volume Manager (LVM).',
            
            pvs: 'PVS(8)                         LVM Tools                            PVS(8)\n\nNAME\n       pvs - Display information about physical volumes\n\nSYNOPSIS\n       pvs [options]\n\nDESCRIPTION\n       pvs produces formatted output about physical volumes.',
            
            vgcreate: 'VGCREATE(8)                    LVM Tools                            VGCREATE(8)\n\nNAME\n       vgcreate - Create a volume group\n\nSYNOPSIS\n       vgcreate vg_name pv_name...\n\nDESCRIPTION\n       vgcreate creates a new volume group called vg_name using the block special device pv_name.',
            
            vgs: 'VGS(8)                         LVM Tools                            VGS(8)\n\nNAME\n       vgs - Display information about volume groups\n\nSYNOPSIS\n       vgs [options]\n\nDESCRIPTION\n       vgs produces formatted output about volume groups.',
            
            lvcreate: 'LVCREATE(8)                    LVM Tools                            LVCREATE(8)\n\nNAME\n       lvcreate - Create a logical volume\n\nSYNOPSIS\n       lvcreate [-L|--size Size] [-n|--name String] VG\n\nDESCRIPTION\n       lvcreate creates a new LV in a VG.\n\nOPTIONS\n       -L, --size Size\n              Specifies the size of the LV\n\n       -n, --name String\n              Specifies the name for the new LV',
            
            lvs: 'LVS(8)                         LVM Tools                            LVS(8)\n\nNAME\n       lvs - Display information about logical volumes\n\nSYNOPSIS\n       lvs [options]\n\nDESCRIPTION\n       lvs produces formatted output about logical volumes.',
            
            lvextend: 'LVEXTEND(8)                    LVM Tools                            LVEXTEND(8)\n\nNAME\n       lvextend - Extend the size of a logical volume\n\nSYNOPSIS\n       lvextend -L|--size [+]Size LV\n\nDESCRIPTION\n       lvextend increases the size of an LV.\n\nOPTIONS\n       -r, --resizefs\n              Resize underlying filesystem together with the LV',
            
            // ========== KERNEL MODULES (NEW) ==========
            lsmod: 'LSMOD(8)                       System Commands                      LSMOD(8)\n\nNAME\n       lsmod - Show the status of modules in the Linux Kernel\n\nSYNOPSIS\n       lsmod\n\nDESCRIPTION\n       lsmod is a trivial program which nicely formats the contents of the /proc/modules, showing what kernel modules are currently loaded.',
            
            modprobe: 'MODPROBE(8)                    System Commands                      MODPROBE(8)\n\nNAME\n       modprobe - Add and remove modules from the Linux Kernel\n\nSYNOPSIS\n       modprobe [-r] [-v] modulename\n\nDESCRIPTION\n       modprobe intelligently adds or removes a module from the Linux kernel, considering dependencies.\n\nOPTIONS\n       -r, --remove\n              Remove module instead of loading\n\n       -v, --verbose\n              Print messages about what the program is doing\n\nEXAMPLES\n       modprobe ext4\n       modprobe -r nfs\n       modprobe -v virtio_net',
            
            modinfo: 'MODINFO(8)                     System Commands                      MODINFO(8)\n\nNAME\n       modinfo - Show information about a Linux Kernel module\n\nSYNOPSIS\n       modinfo [options] module_name\n\nDESCRIPTION\n       modinfo extracts information from the Linux Kernel modules given on the command line.\n\nFIELDS DISPLAYED\n       filename       Full path to the .ko module file\n       description    Brief description of module functionality\n       author         Module author\n       license        License type (GPL, proprietary, etc.)\n       depends        Comma-separated list of dependencies',
            
            insmod: 'INSMOD(8)                      System Commands                      INSMOD(8)\n\nNAME\n       insmod - Simple program to insert a module into the Linux Kernel\n\nSYNOPSIS\n       insmod [filename] [module options...]\n\nDESCRIPTION\n       insmod is a trivial program to insert a module into the kernel. Most users should use modprobe instead, which is more intelligent.\n\nNOTE\n       insmod does not handle dependencies; use modprobe for automatic dependency resolution.',
            
            rmmod: 'RMMOD(8)                       System Commands                      RMMOD(8)\n\nNAME\n       rmmod - Simple program to remove a module from the Linux Kernel\n\nSYNOPSIS\n       rmmod [-f] module_name\n\nDESCRIPTION\n       rmmod is a trivial program to remove a module from the kernel. Most users should use modprobe -r instead.\n\nOPTIONS\n       -f, --force\n              Force removal of module',
            
            // ========== ADVANCED STORAGE (NEW) ==========
            stratis: 'STRATIS(8)                     System Commands                      STRATIS(8)\n\nNAME\n       stratis - Configure Stratis local storage pools\n\nSYNOPSIS\n       stratis [GLOBAL_OPTIONS] pool <command> [args]\n       stratis [GLOBAL_OPTIONS] filesystem <command> [args]\n\nDESCRIPTION\n       Stratis is a local storage management solution focused on simplicity and ease of use. It uses thin provisioning by default and simplifies local storage management without an unnecessarily complex GUI.\n\nPOOL COMMANDS\n       create <pool_name> <device>...\n              Create a pool from one or more block devices\n\n       list\n              List all pools\n\n       destroy <pool_name>\n              Destroy a pool\n\nFILESYSTEM COMMANDS\n       create <pool_name> <fs_name>\n              Create a filesystem from a pool\n\n       list\n              List all filesystems\n\nEXAMPLES\n       stratis pool create mypool /dev/sdb\n       stratis filesystem create mypool data\n       mount /dev/stratis/mypool/data /mnt',
            
            vdo: 'VDO(8)                         System Commands                      VDO(8)\n\nNAME\n       vdo - Manage Virtual Data Optimizer volumes\n\nSYNOPSIS\n       vdo <command> [options]\n\nDESCRIPTION\n       VDO (Virtual Data Optimizer) provides inline data reduction for Linux in the form of deduplication, compression, and thin provisioning.\n\nCOMMANDS\n       create --name=<name> --device=<device> [--vdoLogicalSize=<size>]\n              Create a VDO volume\n\n       list\n              List all VDO volumes\n\n       status [--name=<name>]\n              Display status of VDO volume(s)\n\n       remove --name=<name>\n              Remove a VDO volume\n\nEXAMPLES\n       vdo create --name=myvdo --device=/dev/sdc --vdoLogicalSize=20G\n       vdo status --name=myvdo\n       mkfs.xfs -K /dev/mapper/myvdo\n       mount /dev/mapper/myvdo /mnt/vdo',
            
            // ========== RHEL ECOSYSTEM (NEW) ==========
            'subscription-manager': 'SUBSCRIPTION-MANAGER(8)        System Commands          SUBSCRIPTION-MANAGER(8)\n\nNAME\n       subscription-manager - Registers systems to a subscription management service\n\nSYNOPSIS\n       subscription-manager <command> [options]\n\nDESCRIPTION\n       subscription-manager is used to register a system with a subscription service like Red Hat Subscription Management (RHSM) or Satellite.\n\nCOMMANDS\n       register --username=<user> --password=<pass>\n              Register this system to subscription management\n\n       unregister\n              Unregister this system\n\n       list [--available|--consumed]\n              List subscriptions\n\n       attach --pool=<pool_id>\n              Attach a subscription to this system\n\n       status\n              Show subscription status\n\n       refresh\n              Refresh local data against the server\n\nEXAMPLES\n       subscription-manager register --username admin --password pass\n       subscription-manager list --available\n       subscription-manager attach --pool=8a85f98c7db4828b017dc512f8ab0be3',
            
            'insights-client': 'INSIGHTS-CLIENT(8)             System Commands          INSIGHTS-CLIENT(8)\n\nNAME\n       insights-client - Red Hat Insights client tool\n\nSYNOPSIS\n       insights-client [options]\n\nDESCRIPTION\n       insights-client is the client-side application for Red Hat Insights. Red Hat Insights is a pro­active diagnostic cloud service that helps identify and resolve issues before they affect operations.\n\nOPTIONS\n       --register\n              Register this system with Red Hat Insights\n\n       --unregister\n              Unregister this system from Red Hat Insights\n\n       --status\n              Check registration status\n\n       --test-connection\n              Test connectivity to Red Hat Insights\n\nEXAMPLES\n       insights-client --register\n       insights-client --status\n       insights-client\n              (Run collection and upload)',
            
            authselect: 'AUTHSELECT(8)                  System Commands                      AUTHSELECT(8)\n\nNAME\n       authselect - Modify system identity and authentication configuration\n\nSYNOPSIS\n       authselect <command> [options]\n\nDESCRIPTION\n       Authselect is a tool to configure system identity and authentication sources and providers.\n\nCOMMANDS\n       current\n              Show current authentication profile\n\n       list\n              List available profiles\n\n       select <profile> [features...]\n              Activate a profile\n\nPROFILES\n       sssd         System Security Services Daemon (recommended)\n       winbind      Samba Winbind for AD integration\n       nis          Network Information Service\n\nFEATURES\n       with-mkhomedir    Create home directory on first login\n       with-faillock     Account lockout after failed attempts\n\nEXAMPLES\n       authselect current\n       authselect list\n       authselect select sssd with-mkhomedir',
            
            // ========== TERMINAL COMMANDS (NEW) ==========
            reset: 'RESET(1)                       User Commands                         RESET(1)\n\nNAME\n       reset - terminal initialization\n\nSYNOPSIS\n       reset\n\nDESCRIPTION\n       reset reinitializes the terminal. This is useful after a program dies leaving a terminal in an abnormal state.',
            
            stty: 'STTY(1)                        User Commands                         STTY(1)\n\nNAME\n       stty - change and print terminal line settings\n\nSYNOPSIS\n       stty [-a] [SETTING]...\n\nDESCRIPTION\n       Print or change terminal characteristics.\n\nOPTIONS\n       -a, --all\n              print all current settings in human-readable form\n\n       size\n              print the number of rows and columns\n\nEXAMPLES\n       stty -a\n       stty size',
            
            tput: 'TPUT(1)                        User Commands                         TPUT(1)\n\nNAME\n       tput - initialize a terminal or query terminfo database\n\nSYNOPSIS\n       tput [-T type] capname [parameters...]\n\nDESCRIPTION\n       tput uses the terminfo database to make terminal-dependent capabilities and information available to the shell.\n\nCAPABILITIES\n       clear      Clear the screen\n       cols       Number of columns\n       lines      Number of lines\n       setaf N    Set foreground color (0-7)\n       setab N    Set background color (0-7)\n       bold       Enable bold text\n       sgr0       Reset all attributes\n\nEXAMPLES\n       tput clear\n       tput cols\n       tput setaf 2',
            
            logrotate: 'LOGROTATE(8)                   System Commands                      LOGROTATE(8)\n\nNAME\n       logrotate - rotates, compresses, and mails system logs\n\nSYNOPSIS\n       logrotate [-dfv] config_file\n\nDESCRIPTION\n       logrotate is designed to ease administration of systems that generate large numbers of log files. It allows automatic rotation, compression, removal, and mailing of log files.\n\nOPTIONS\n       -d, --debug\n              Turns on debug mode (implies -v). No changes will be made.\n\n       -f, --force\n              Force the rotation, even if it doesn\'t seem necessary\n\n       -v, --verbose\n              Turns on verbose mode\n\nEXAMPLES\n       logrotate /etc/logrotate.conf\n       logrotate -d /etc/logrotate.conf\n       logrotate -f /etc/logrotate.d/httpd',
            
            // ========== NETWORK ==========
            ip: 'IP(8)                          System Commands                      IP(8)\n\nNAME\n       ip - show / manipulate routing, network devices, interfaces and tunnels\n\nSYNOPSIS\n       ip [ OPTIONS ] OBJECT { COMMAND | help }\n\nOBJECTS\n       link       Network device\n       addr       Protocol (IP or IPv6) address on a device\n       route      Routing table entry\n\nCOMMANDS\n       show       Display information\n       add        Add new object\n       del        Delete object\n\nEXAMPLES\n       ip addr show\n       ip link show\n       ip route show\n       ip addr add 192.168.1.10/24 dev eth0',
            
            nmcli: 'NMCLI(1)                       User Commands                         NMCLI(1)\n\nNAME\n       nmcli - command-line tool for controlling NetworkManager\n\nSYNOPSIS\n       nmcli [OPTIONS] OBJECT { COMMAND | help }\n\nOBJECTS\n       con        NetworkManager connections\n       dev        Show devices managed by NetworkManager\n\nCOMMANDS\n       show       Show details\n       add        Add a connection\n       mod        Modify a connection\n       up/down    Activate/deactivate connection\n\nEXAMPLES\n       nmcli con show\n       nmcli dev status\ n       nmcli con mod eth0 ipv4.addresses 192.168.1.10/24',
            
            iptables: 'IPTABLES(8)                    System Commands                      IPTABLES(8)\n\nNAME\n       iptables - administration tool for IPv4 packet filtering and NAT\n\nSYNOPSIS\n       iptables [-t table] {-A|-D} chain rule-specification\n       iptables [-t table] -F [chain]\n       iptables [-t table] -L [chain]\n\nDESCRIPTION\n       iptables is used to set up, maintain, and inspect the tables of IPv4 packet filter rules in the Linux kernel.\n\nOPTIONS\n       -A, --append chain rule\n              Append rule to chain\n\n       -D, --delete chain rulenum\n              Delete rule from chain\n\n       -L, --list [chain]\n              List all rules in selected chain\n\n       -F, --flush [chain]\n              Flush the selected chain (all if none given)\n\nEXAMPLES\n       iptables -L -n -v\n       iptables -A INPUT -p tcp --dport 80 -j ACCEPT\n       iptables -F',
            
            route: 'ROUTE(8)                       System Commands                      ROUTE(8)\n\nNAME\n       route - show / manipulate the IP routing table (legacy)\n\nSYNOPSIS\n       route [-n]\n       route add [-net|-host] target [netmask Nm] [gw Gw]\n       route del [-net|-host] target\n\nDESCRIPTION\n       Route manipulates the kernel\'s IP routing tables. Its primary use is to set up static routes to specific hosts or networks via an interface.\n\nOPTIONS\n       -n     Show numerical addresses instead of trying to resolve hostnames\n\nEXAMPLES\n       route -n\n       route add -net 10.0.0.0/8 gw 192.168.1.1\n       route del -net 10.0.0.0/8',
            
            mtr: 'MTR(8)                         System Commands                      MTR(8)\n\nNAME\n       mtr - a network diagnostic tool\n\nSYNOPSIS\n       mtr [options] hostname\n\nDESCRIPTION\n       mtr combines the functionality of the traceroute and ping programs in a single network diagnostic tool. As mtr starts, it investigates the network connection between the host mtr runs on and hostname.',
            
            arping: 'ARPING(8)                      System Commands                      ARPING(8)\n\nNAME\n       arping - send ARP REQUEST to a neighbour host\n\nSYNOPSIS\n       arping [-I interface] [-c count] destination\n\nDESCRIPTION\n       arping sends ARP REQUEST packets to a neighbour host.\n\nOPTIONS\n       -I interface\n              Specify network interface\n\n       -c count\n              Stop after sending count ARP REQUEST packets\n\nEXAMPLES\n       arping -I eth0 192.168.1.1\n       arping -c 4 -I eth0 192.168.1.1',
            
            ethtool: 'ETHTOOL(8)                     System Commands                      ETHTOOL(8)\n\nNAME\n       ethtool - query or control network driver and hardware settings\n\nSYNOPSIS\n       ethtool devname\n       ethtool -i|--driver devname\n\nDESCRIPTION\n       ethtool is used to query and control network device driver and hardware settings, particularly for wired Ethernet devices.\n\nOPTIONS\n       devname (no options)\n              Display standard information about device\n\n       -i, --driver\n              Display driver information\n\nEXAMPLES\n       ethtool eth0\n       ethtool -i eth0',
            
            ping: 'PING(8)                        System Commands                      PING(8)\n\nNAME\n       ping - send ICMP ECHO_REQUEST to network hosts\n\nSYNOPSIS\n       ping [-c count] destination\n\nDESCRIPTION\n       ping uses the ICMP protocol\'s mandatory ECHO_REQUEST datagram to elicit an ICMP ECHO_RESPONSE from a host or gateway.\n\nOPTIONS\n       -c count\n              Stop after sending count ECHO_REQUEST packets',
            
            hostname: 'HOSTNAME(1)                    User Commands                         HOSTNAME(1)\n\nNAME\n       hostname - show or set the system\'s host name\n\nSYNOPSIS\n       hostname [name]\n\nDESCRIPTION\n       Hostname is used to display the system\'s DNS name, and to display or set its hostname or NIS domain name.',
            
            ss: 'SS(8)                          System Commands                      SS(8)\n\nNAME\n       ss - another utility to investigate sockets\n\nSYNOPSIS\n       ss [options]\n\nDESCRIPTION\n       ss is used to dump socket statistics. It allows showing information similar to netstat.\n\nOPTIONS\n       -t, --tcp\n              Display TCP sockets\n\n       -u, --udp\n              Display UDP sockets\n\n       -l, --listening\n              Display listening sockets\n\n       -n, --numeric\n              Do not resolve service names',
            
            curl: 'CURL(1)                        User Commands                         CURL(1)\n\nNAME\n       curl - transfer data from or to a server\n\nSYNOPSIS\n       curl [options] [URL...]\n\nDESCRIPTION\n       curl is a tool to transfer data from or to a server using one of the supported protocols.\n\nOPTIONS\n       -O, --remote-name\n              Write output to a local file named like the remote file\n\n       -o, --output <file>\n              Write to file instead of stdout',
            
            wget: 'WGET(1)                        User Commands                         WGET(1)\n\nNAME\n       wget - The non-interactive network downloader\n\nSYNOPSIS\n       wget [option]... [URL]...\n\nDESCRIPTION\n       GNU Wget is a free utility for non-interactive download of files from the Web.',
            
            dig: 'DIG(1)                         User Commands                         DIG(1)\n\nNAME\n       dig - DNS lookup utility\n\nSYNOPSIS\n       dig [@server] name [type]\n\nDESCRIPTION\n       dig (domain information groper) is a flexible tool for interrogating DNS name servers.',
            
            // ========== SELINUX ==========
            getenforce: 'GETENFORCE(8)                  System Commands                      GETENFORCE(8)\n\nNAME\n       getenforce - get the current mode of SELinux\n\nSYNOPSIS\n       getenforce\n\nDESCRIPTION\n       getenforce returns the current mode of SELinux. The output is one of: Enforcing, Permissive, or Disabled.',
            
            setenforce: 'SETENFORCE(8)                  System Commands                      SETENFORCE(8)\n\nNAME\n       setenforce - modify the mode SELinux is running in\n\nSYNOPSIS\n       setenforce [Enforcing|Permissive|1|0]\n\nDESCRIPTION\n       setenforce modifies the mode SELinux is running in.\n       Enforcing (1) = SELinux security policy is enforced\n       Permissive (0) = SELinux prints warnings instead of enforcing',
            
            chcon: 'CHCON(1)                       User Commands                         CHCON(1)\n\nNAME\n       chcon - change file SELinux security context\n\nSYNOPSIS\n       chcon [OPTION]... CONTEXT FILE...\n       chcon [OPTION]... [-t TYPE] FILE...\n\nDESCRIPTION\n       Change the SELinux security context of each FILE to CONTEXT.\n\nOPTIONS\n       -t, --type=TYPE\n              set type TYPE in the target security context\n\n       -R, --recursive\n              operate on files and directories recursively',
            
            restorecon: 'RESTORECON(8)                  System Commands                      RESTORECON(8)\n\nNAME\n       restorecon - restore file(s) default SELinux security contexts\n\nSYNOPSIS\n       restorecon [-R] file...\n\nDESCRIPTION\n       restorecon restores the default SELinux security contexts, it reads the contexts from the file_contexts file.\n\nOPTIONS\n       -R     operate recursively on directories',
            
            semanage: 'SEMANAGE(8)                    System Commands                      SEMANAGE(8)\n\nNAME\n       semanage - SELinux Policy Management tool\n\nSYNOPSIS\n       semanage {port|fcontext|login|user|...} {-l|-a|-d|-m} ...\n\nDESCRIPTION\n       semanage is used to configure certain elements of SELinux policy without requiring modification to or recompilation from policy sources.\n\nOBJECTS\n       port       Manage network port type definitions\n       fcontext   Manage file context mappings\n       login      Manage login mappings\n\nEXAMPLES\n       semanage port -l\n       semanage port -a -t http_port_t -p tcp 8080\n       semanage fcontext -l',
            
            sestatus: 'SESTATUS(8)                    System Commands                      SESTATUS(8)\n\nNAME\n       sestatus - SELinux status tool\n\nSYNOPSIS\n       sestatus [-v]\n\nDESCRIPTION\n       This tool is used to get the status of a system running SELinux.',
            
            getsebool: 'GETSEBOOL(8)                   System Commands                      GETSEBOOL(8)\n\nNAME\n       getsebool - get SELinux boolean value(s)\n\nSYNOPSIS\n       getsebool [-a] [boolean...]\n\nDESCRIPTION\n       getsebool reports where a particular SELinux boolean is on or off.\n\nOPTIONS\n       -a     Show all SELinux booleans',
            
            setsebool: 'SETSEBOOL(8)                   System Commands                      SETSEBOOL(8)\n\nNAME\n       setsebool - set SELinux boolean value\n\nSYNOPSIS\n       setsebool [-P] boolean value\n\nDESCRIPTION\n       setsebool sets the current state of a particular SELinux boolean.\n\nOPTIONS\n       -P     Make the setting persistent across reboots',
            
            // ========== SCHEDULING ==========
            crontab: 'CRONTAB(1)                     User Commands                         CRONTAB(1)\n\nNAME\n       crontab - maintain crontab files for individual users\n\nSYNOPSIS\n       crontab [ -e | -l | -r ]\n\nDESCRIPTION\n       crontab is the program used to install, deinstall or list the tables used to drive the cron daemon.\n\nOPTIONS\n       -e     Edit the current crontab\n       -l     List the current crontab\n       -r     Remove the current crontab\n\nFORMAT\n       minute hour day month weekday command\n       0-59   0-23 1-31 1-12  0-7\n\nEXAMPLE\n       0 2 * * * /usr/local/bin/backup.sh',
            
            at: 'AT(1)                          User Commands                         AT(1)\n\nNAME\n       at - execute commands at a later time\n\nSYNOPSIS\n       at [-f file] time\n\nDESCRIPTION\n       at reads commands from standard input or a specified file which are to be executed at a later time.',
            
            // ========== MISC ==========
            history: 'HISTORY(1)                     Shell Builtin                         HISTORY(1)\n\nNAME\n       history - Display and manipulate command history\n\nSYNOPSIS\n       history [n]\n       history -c\n       history -d offset\n\nDESCRIPTION\n       Display or manipulate the history list.\n\nOPTIONS\n       -c     Clear the history list\n       -d offset\n              Delete the history entry at position offset\n       n      Display last n commands',
            
            tar: 'TAR(1)                         User Commands                         TAR(1)\n\nNAME\n       tar - an archiving utility\n\nSYNOPSIS\n       tar [OPTION...] [FILE]...\n\nDESCRIPTION\n       GNU tar saves many files together into a single tape or disk archive, and can restore individual files from the archive.\n\nOPTIONS\n       -c, --create\n              create a new archive\n\n       -x, --extract, --get\n              extract files from an archive\n\n       -t, --list\n              list the contents of an archive\n\n       -z, --gzip\n              filter the archive through gzip\n\n       -j, --bzip2\n              filter the archive through bzip2\n\n       -f, --file=ARCHIVE\n              use archive file or device ARCHIVE\n\n       -v, --verbose\n              verbosely list files processed',
            
            test: 'TEST(1)                        Shell Builtin                         TEST(1)\n\nNAME\n       test - check file types and compare values\n\nSYNOPSIS\n       test EXPRESSION\n       [ EXPRESSION ]\n\nDESCRIPTION\n       Exit with the status determined by EXPRESSION.\n\nFILE OPERATORS\n       -d FILE   True if FILE exists and is a directory\n       -f FILE   True if FILE exists and is a regular file\n       -e FILE   True if FILE exists\n\nSTRING OPERATORS\n       -z STRING   True if STRING is empty\n       -n STRING   True if STRING is not empty\n\nNUMERIC OPERATORS\n       INTEGER1 -eq INTEGER2   Equal\n       INTEGER1 -ne INTEGER2   Not equal\n       INTEGER1 -gt INTEGER2   Greater than\n       INTEGER1 -lt INTEGER2   Less than'
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

    find(args, stdin = '') {
        // find command - search for files in directory hierarchy
        let searchPath = '.';
        let pattern = '';
        let nameSearch = false;
        let typeFilter = '';
        
        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name') {
                nameSearch = true;
                pattern = args[i + 1];
                i++;
            } else if (args[i] === '-type') {
                typeFilter = args[i + 1];
                i++;
            } else if (!args[i].startsWith('-')) {
                searchPath = args[i];
            }
        }
        
        const results = [];
        const searchNode = this.fs.getNode(searchPath);
        
        if (!searchNode) {
            return { stderr: `find: '${searchPath}': No such file or directory`, exitCode: 1 };
        }
        
        const traverse = (path, node) => {
            // Check if matches
            const basename = this.fs.getBasename(path) || path;
            let matches = true;
            
            if (nameSearch && pattern) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
                matches = regex.test(basename);
            }
            
            if (typeFilter) {
                if (typeFilter === 'f' && node.type !== 'file') matches = false;
                if (typeFilter === 'd' && node.type !== 'directory') matches = false;
            }
            
            if (matches) {
                results.push(path);
            }
            
            // Recursively search subdirectories
            if (node.type === 'directory' && node.children) {
                for (const [name, child] of Object.entries(node.children)) {
                    const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
                    traverse(childPath, child);
                }
            }
        };
        
        traverse(this.fs.resolvePath(searchPath), searchNode);
        return { stdout: results.join('\n'), stderr: '', exitCode: 0 };
    }

    which(args, stdin = '') {
        // which command - locate a command
        if (args.length === 0) {
            return { stderr: 'which: missing argument', exitCode: 1 };
        }
        
        const command = args[0];
        const paths = this.env.PATH.split(':');
        const results = [];
        
        for (const path of paths) {
            const fullPath = `${path}/${command}`;
            const node = this.fs.getNode(fullPath);
            if (node && node.type === 'file') {
                results.push(fullPath);
                break; // which only returns first match
            }
        }
        
        if (results.length === 0) {
            return { stderr: '', exitCode: 1 };
        }
        
        return { stdout: results.join('\n'), stderr: '', exitCode: 0 };
    }

    whereis(args, stdin = '') {
        // whereis command - locate binary, source, and man pages
        if (args.length === 0) {
            return { stderr: 'whereis: missing argument', exitCode: 1 };
        }
        
        const command = args[0];
        const locations = [];
        
        // Check binary locations
        const binaryPaths = ['/bin', '/sbin', '/usr/bin', '/usr/sbin', '/usr/local/bin'];
        for (const path of binaryPaths) {
            const fullPath = `${path}/${command}`;
            if (this.fs.exists(fullPath)) {
                locations.push(fullPath);
            }
        }
        
        // Check man page locations
        const manPaths = ['/usr/share/man/man1', '/usr/share/man/man8'];
        for (const path of manPaths) {
            const manPath = `${path}/${command}.1.gz`;
            if (this.fs.exists(manPath)) {
                locations.push(manPath);
            }
        }
        
        if (locations.length === 0) {
            return { stdout: `${command}:`, stderr: '', exitCode: 0 };
        }
        
        return { stdout: `${command}: ${locations.join(' ')}`, stderr: '', exitCode: 0 };
    }

    locate(args, stdin = '') {
        // locate command - find files by name (simplified)
        if (args.length === 0) {
            return { stderr: 'locate: missing argument', exitCode: 1 };
        }
        
        const pattern = args[0];
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        const results = [];
        
        const traverse = (path, node) => {
            if (regex.test(path)) {
                results.push(path);
            }
            
            if (node.type === 'directory' && node.children) {
                for (const [name, child] of Object.entries(node.children)) {
                    const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
                    traverse(childPath, child);
                }
            }
        };
        
        traverse('/', this.fs.getNode('/'));
        
        if (results.length === 0) {
            return { stdout: '', stderr: '', exitCode: 0 };
        }
        
        return { stdout: results.join('\n'), stderr: '', exitCode: 0 };
    }

    dmesg(args, stdin = '') {
        // dmesg command - print kernel ring buffer
        const flags = this.parseFlags(args, ['c', 'T', 'H', 'w', 'l']);
        
        const kernelMessages = `[    0.000000] Linux version 5.14.0-362.8.1.el9_3.x86_64 (mockbuild@x86-64-01.build.eng.bos.redhat.com) (gcc (GCC) 11.4.1 20230605 (Red Hat 11.4.1-2), GNU ld version 2.35.2-37.el9) #1 SMP PREEMPT_DYNAMIC Thu Nov 2 16:07:11 EDT 2023
[    0.000000] Command line: BOOT_IMAGE=(hd0,msdos1)/vmlinuz-5.14.0-362.8.1.el9_3.x86_64 root=UUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890 ro quiet
[    0.000000] x86/fpu: Supporting XSAVE feature 0x001: 'x87 floating point registers'
[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'
[    0.153421] PCI: Using configuration type 1 for base access
[    0.287943] ACPI: Added _OSI(Module Device)
[    0.287945] ACPI: Added _OSI(Processor Device)
[    0.454123] pci 0000:00:00.0: [8086:1237] type 00 class 0x060000
[    1.234567] e1000 0000:00:03.0 eth0: Intel(R) PRO/1000 Network Connection
[    1.567890] input: AT Translated Set 2 keyboard as /devices/platform/i8042/serio0/input/input0
[    2.345678] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)
[    2.987654] systemd[1]: systemd 252 running in system mode
[    3.123456] systemd[1]: Detected virtualization kvm.
[    3.456789] systemd[1]: Reached target Basic System.
[    4.567890] firewalld[567]: SUCCESS: Loaded firewall configuration
[    5.678901] sshd[234]: Server listening on 0.0.0.0 port 22.
[    5.789012] chronyd[890]: Selected source 0.pool.ntp.org`;
        
        if (flags.c) {
            return { stdout: kernelMessages + '\n[dmesg: read kernel buffer would be cleared]', stderr: '', exitCode: 0 };
        }
        
        return { stdout: kernelMessages, stderr: '', exitCode: 0 };
    }

    test(args, stdin = '') {
        // test command - evaluate conditional expressions
        // Also accessible via [ ... ]
        if (args.length === 0) {
            return { stdout: '', stderr: '', exitCode: 1 };
        }
        
        // Remove trailing ] if present (for [ ... ] syntax)
        let testArgs = [...args];
        if (testArgs[testArgs.length - 1] === ']') {
            testArgs.pop();
        }
        
        // File tests
        if (testArgs[0] === '-e') {
            // -e file: exists
            const result = this.fs.exists(testArgs[1]);
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        if (testArgs[0] === '-f') {
            // -f file: is regular file
            const node = this.fs.getNode(testArgs[1]);
            const result = node && node.type === 'file';
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        if (testArgs[0] === '-d') {
            // -d file: is directory
            const node = this.fs.getNode(testArgs[1]);
            const result = node && node.type === 'directory';
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        if (testArgs[0] === '-r' || testArgs[0] === '-w' || testArgs[0] === '-x') {
            // -r/-w/-x file: is readable/writable/executable
            const node = this.fs.getNode(testArgs[1]);
            if (!node) return { stdout: '', stderr: '', exitCode: 1 };
            
            const perm = testArgs[0] === '-r' ? 'r' : testArgs[0] === '-w' ? 'w' : 'x';
            const result = this.fs.hasPermission(node, perm);
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        if (testArgs[0] === '-z') {
            // -z string: string is empty
            const result = !testArgs[1] || testArgs[1].length === 0;
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        if (testArgs[0] === '-n') {
            // -n string: string is not empty
            const result = testArgs[1] && testArgs[1].length > 0;
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        // String comparisons
        if (testArgs.length === 3) {
            const left = testArgs[0];
            const op = testArgs[1];
            const right = testArgs[2];
            
            if (op === '==' || op === '=') {
                return { stdout: '', stderr: '', exitCode: left === right ? 0 : 1 };
            }
            if (op === '!=') {
                return { stdout: '', stderr: '', exitCode: left !== right ? 0 : 1 };
            }
            
            // Numeric comparisons
            const leftNum = parseInt(left);
            const rightNum = parseInt(right);
            
            if (op === '-eq') {
                return { stdout: '', stderr: '', exitCode: leftNum === rightNum ? 0 : 1 };
            }
            if (op === '-ne') {
                return { stdout: '', stderr: '', exitCode: leftNum !== rightNum ? 0 : 1 };
            }
            if (op === '-lt') {
                return { stdout: '', stderr: '', exitCode: leftNum < rightNum ? 0 : 1 };
            }
            if (op === '-le') {
                return { stdout: '', stderr: '', exitCode: leftNum <= rightNum ? 0 : 1 };
            }
            if (op === '-gt') {
                return { stdout: '', stderr: '', exitCode: leftNum > rightNum ? 0 : 1 };
            }
            if (op === '-ge') {
                return { stdout: '', stderr: '', exitCode: leftNum >= rightNum ? 0 : 1 };
            }
        }
        
        // Default: if single argument, test if non-empty string
        if (testArgs.length === 1) {
            const result = testArgs[0] && testArgs[0].length > 0;
            return { stdout: '', stderr: '', exitCode: result ? 0 : 1 };
        }
        
        return { stdout: '', stderr: 'test: unknown operator', exitCode: 2 };
    }

    // Alias [ as test
    '['(args, stdin = '') {
        return this.test(args, stdin);
    }

    xz(args, stdin = '') {
        // xz compression utility
        if (args.length === 0) {
            return { stderr: 'xz: missing file operand', exitCode: 1 };
        }
        
        const flags = this.parseFlags(args, ['d', 'z', 'k', 'v', 'l']);
        
        if (flags.d) {
            // Decompress
            const file = flags.args[0];
            if (!file) {
                return { stderr: 'xz: missing file name', exitCode: 1 };
            }
            
            if (!file.endsWith('.xz')) {
                return { stderr: `xz: ${file}: Unknown suffix -- skipping`, exitCode: 1 };
            }
            
            const node = this.fs.getNode(file);
            if (!node) {
                return { stderr: `xz: ${file}: No such file or directory`, exitCode: 1 };
            }
            
            // Simulate decompression
            const outFile = file.slice(0, -3);
            const parent = this.fs.getNode(this.fs.getParentPath(file));
            const basename = this.fs.getBasename(outFile);
            
            if (parent && parent.children) {
                parent.children[basename] = {
                    type: 'file',
                    permissions: node.permissions,
                    owner: node.owner,
                    group: node.group,
                    size: Math.round(node.size * 1.5),
                    modified: new Date(),
                    content: ''
                };
                
                if (!flags.k) {
                    delete parent.children[this.fs.getBasename(file)];
                }
            }
            
            return { stdout: '', stderr: '', exitCode: 0 };
        }
        
        // Compress (default)
        const file = flags.args[0];
        if (!file) {
            return { stderr: 'xz: missing file name', exitCode: 1 };
        }
        
        const node = this.fs.getNode(file);
        if (!node) {
            return { stderr: `xz: ${file}: No such file or directory`, exitCode: 1 };
        }
        
        if (node.type !== 'file') {
            return { stderr: `xz: ${file}: Is a directory`, exitCode: 1 };
        }
        
        // Simulate compression
        const outFile = file + '.xz';
        const parent = this.fs.getNode(this.fs.getParentPath(file));
        const basename = this.fs.getBasename(outFile);
        
        if (parent && parent.children) {
            parent.children[basename] = {
                type: 'file',
                permissions: node.permissions,
                owner: node.owner,
                group: node.group,
                size: Math.round(node.size * 0.3),
                modified: new Date(),
                content: ''
            };
            
            if (!flags.k) {
                delete parent.children[this.fs.getBasename(file)];
            }
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
