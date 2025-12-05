// RHCSA Commands Library
// Simulates 100+ Linux commands for RHCSA practice

class RHCSACommands {
    constructor(filesystem) {
        this.fs = filesystem;
        
        // Environment variables (Phase 1.3)
        this.env = {
            'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'HOME': '/root',
            'USER': 'root',
            'SHELL': '/bin/bash',
            'HOSTNAME': 'rhcsa-lab',
            'LANG': 'en_US.UTF-8',
            'PWD': '/root',
            'OLDPWD': '/root',
            'TERM': 'xterm-256color',
            'LOGNAME': 'root'
        };
        
        // Virtual system state
        this.selinuxMode = 'enforcing';
        this.hostname = 'rhcsa-lab';
        this.installedPackages = ['httpd', 'vim', 'bash', 'systemd', 'kernel', 'firewalld'];
        this.availablePackages = ['nginx', 'postgresql', 'mariadb', 'python3', 'git', 'tar'];
        
        // Systemd services state
        this.services = {
            'httpd': { enabled: false, active: false, description: 'The Apache HTTP Server' },
            'sshd': { enabled: true, active: true, description: 'OpenSSH server daemon' },
            'firewalld': { enabled: true, active: true, description: 'firewalld - dynamic firewall daemon' },
            'chronyd': { enabled: true, active: true, description: 'NTP client/server' },
            'nginx': { enabled: false, active: false, description: 'nginx HTTP server' }
        };
        
        // Virtual processes
        this.processes = [
            { pid: 1, user: 'root', cpu: 0.1, mem: 0.5, command: 'systemd' },
            { pid: 234, user: 'root', cpu: 0.0, mem: 0.2, command: 'sshd' },
            { pid: 567, user: 'root', cpu: 0.0, mem: 0.3, command: 'firewalld' },
            { pid: 890, user: 'root', cpu: 0.1, mem: 0.1, command: 'chronyd' }
        ];
        
        // LVM state
        this.pvs = [];
        this.vgs = [];
        this.lvs = [];
        
        // Virtual disks
        this.disks = {
            '/dev/sda': { size: '20G', type: 'disk', children: [] },
            '/dev/sdb': { size: '10G', type: 'disk', children: [] },
            '/dev/sdc': { size: '5G', type: 'disk', children: [] }
        };
        
        // Firewall zones and rules
        this.firewallZones = {
            'public': { services: ['ssh', 'dhcpv6-client'], ports: [] }
        };
        
        // Network interfaces state
        this.networkInterfaces = {
            'lo': {
                ipv4: '127.0.0.1/8',
                ipv6: '::1/128',
                mac: '00:00:00:00:00:00',
                state: 'UP'
            },
            'eth0': {
                ipv4: '192.168.1.100/24',
                ipv6: 'fe80::5254:ff:fe12:3456/64',
                mac: '52:54:00:12:34:56',
                state: 'UP',
                gateway: '192.168.1.1'
            }
        };
        
        // Command history
        this.commandHistory = [];
        
        // Last exit code for $?
        this.lastExitCode = 0;
        
        // Positional parameters for scripts: $0, $1-$9, $#, $@, $*
        this.scriptArgs = ['bash']; // Default: $0 is shell name, empty args
    }
    
    // ===== HELPER METHODS =====
    
    expandVariables(str) {
        // Expand environment variables: $VAR or ${VAR}
        // Special variables: $? (exit code), $0-$9 (positional), $#, $@, $*
        return str.replace(/\$\{?([A-Za-z_?@*#0-9][A-Za-z0-9_]*)\}?/g, (match, varName) => {
            // Exit code
            if (varName === '?') {
                return String(this.lastExitCode);
            }
            // Positional parameter count
            if (varName === '#') {
                return String(this.scriptArgs.length - 1); // -1 because $0 is script name
            }
            // All positional parameters (space-separated)
            if (varName === '@' || varName === '*') {
                return this.scriptArgs.slice(1).join(' ');
            }
            // Individual positional parameter $0-$9
            if (/^[0-9]$/.test(varName)) {
                const index = parseInt(varName);
                return this.scriptArgs[index] || '';
            }
            // Regular environment variable
            if (this.env.hasOwnProperty(varName)) {
                return this.env[varName];
            }
            return ''; // Unknown variables expand to empty string
        });
    }
    
    // ===== ENVIRONMENT & VARIABLES (Phase 1.3) =====
    
    echo(args, stdin = '') {
        let flags = { n: false, e: false, E: false };
        let text = [];
        
        // Parse flags
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n') {
                flags.n = true;
            } else if (args[i] === '-e') {
                flags.e = true;
            } else if (args[i] === '-E') {
                flags.E = true;
            } else {
                // All remaining args are the text to echo
                text = args.slice(i);
                break;
            }
        }
        
        let output = text.join(' ');
        
        // Expand variables
        output = this.expandVariables(output);
        
        // Handle escape sequences if -e is enabled
        if (flags.e) {
            output = output
                .replace(/\\\\n/g, '\n')
                .replace(/\\\\t/g, '\t')
                .replace(/\\\\r/g, '\r')
                .replace(/\\\\\\\\/g, '\\')
                .replace(/\\\\"/g, '"')
                .replace(/\\\\'/g, "'");
        }
        
        // Add newline unless -n is specified
        if (!flags.n) {
            output += '\n';
        }
        
        return { stdout: output, exitCode: 0 };
    }
    
    env(args, stdin = '') {
        if (args.length > 0) {
            // env VAR=value command args... (run command with modified env)
            // For simplicity, just show error for now
            return { stderr: 'env: command execution with modified environment not yet implemented', exitCode: 1 };
        }
        
        // Display all environment variables
        const lines = [];
        for (const [key, value] of Object.entries(this.env).sort()) {
            lines.push(`${key}=${value}`);
        }
        
        return { stdout: lines.join('\n') + '\n', exitCode: 0 };
    }
    
    export(args, stdin = '') {
        if (args.length === 0) {
            // Display all exported variables
            const lines = [];
            for (const [key, value] of Object.entries(this.env).sort()) {
                lines.push(`declare -x ${key}="${value}"`);
            }
            return { stdout: lines.join('\n') + '\n', exitCode: 0 };
        }
        
        // Parse VAR=value assignments
        for (const arg of args) {
            const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
            if (match) {
                const [, varName, value] = match;
                // Expand variables in the value
                this.env[varName] = this.expandVariables(value);
            } else {
                // Just variable name - mark as exported (set to empty if not exists)
                if (!this.env.hasOwnProperty(arg)) {
                    this.env[arg] = '';
                }
            }
        }
        
        // Update PWD to match current directory
        this.env['PWD'] = this.fs.currentPath;
        this.env['USER'] = this.fs.currentUser;
        this.env['LOGNAME'] = this.fs.currentUser;
        this.env['HOME'] = this.fs.users[this.fs.currentUser]?.home || '/root';
        
        return { stdout: '', exitCode: 0 };
    }
    
    printenv(args, stdin = '') {
        if (args.length === 0) {
            // Display all environment variables (values only)
            const lines = [];
            for (const value of Object.values(this.env)) {
                lines.push(value);
            }
            return { stdout: lines.join('\n') + '\n', exitCode: 0 };
        }
        
        // Print specific variable(s)
        const lines = [];
        for (const varName of args) {
            if (this.env.hasOwnProperty(varName)) {
                lines.push(this.env[varName]);
            }
        }
        
        return { stdout: lines.join('\n') + (lines.length > 0 ? '\n' : ''), exitCode: 0 };
    }
    
    unset(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'unset: not enough arguments', exitCode: 1 };
        }
        
        for (const varName of args) {
            delete this.env[varName];
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    // ===== ESSENTIAL TOOLS =====
    
    ls(args) {
        const flags = this.parseFlags(args, ['l', 'a', 'h', 'R', 'Z']);
        const path = flags.args[0] || this.fs.currentPath;
        
        const node = this.fs.getNode(path);
        if (!node) {
            return { error: `ls: cannot access '${path}': No such file or directory` };
        }
        
        if (node.type !== 'directory') {
            return { output: this.fs.getBasename(path) };
        }
        
        if (!this.fs.hasPermission(node, 'r')) {
            return { error: `ls: cannot open directory '${path}': Permission denied` };
        }
        
        let output = [];
        
        if (flags.l) {
            // Long listing format
            if (flags.a) {
                output.push(this.formatLongListing('.', node, flags.Z));
                output.push(this.formatLongListing('..', node, flags.Z));
            }
            
            for (const [name, child] of Object.entries(node.children || {})) {
                if (!flags.a && name.startsWith('.')) continue;
                output.push(this.formatLongListing(name, child, flags.Z));
            }
        } else {
            // Simple listing
            const items = [];
            if (flags.a) {
                items.push('.', '..');
            }
            
            for (const name of Object.keys(node.children || {})) {
                if (!flags.a && name.startsWith('.')) continue;
                items.push(name);
            }
            
            output.push(items.join('  '));
        }
        
        return { output: output.join('\n') };
    }
    
    formatLongListing(name, node, showSelinux = false) {
        let type = '-';
        if (node.type === 'directory') type = 'd';
        else if (node.type === 'symlink') type = 'l';
        
        const perms = this.formatPermissions(node.permissions);
        const links = 1;
        const size = node.size || 0;
        const date = this.formatDate(node.modified);
        
        let displayName = name;
        if (node.type === 'directory') {
            displayName = `<span class="file-directory">${name}</span>`;
        } else if (node.type === 'symlink') {
            displayName = `<span class="file-symlink">${name}</span> -> ${node.linkTarget}`;
        }
        
        // SELinux context if -Z flag
        let selinuxContext = '';
        if (showSelinux) {
            const ctx = node.selinux || { user: 'unconfined_u', role: 'object_r', type: 'user_home_t', level: 's0' };
            selinuxContext = `${ctx.user}:${ctx.role}:${ctx.type}:${ctx.level} `;
        }
        
        return `${type}${perms} ${links} ${node.owner.padEnd(8)} ${node.group.padEnd(8)} ${selinuxContext}${String(size).padStart(8)} ${date} ${displayName}`;
    }
    
    formatPermissions(perms) {
        const octal = perms.slice(1);
        let result = '';
        
        for (const digit of octal) {
            const num = parseInt(digit);
            result += (num & 4 ? 'r' : '-');
            result += (num & 2 ? 'w' : '-');
            result += (num & 1 ? 'x' : '-');
        }
        
        return result;
    }
    
    formatDate(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        const day = String(date.getDate()).padStart(2);
        const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return `${month} ${day} ${time}`;
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
        
        // Update OLDPWD before changing directory
        this.env['OLDPWD'] = this.fs.currentPath;
        this.fs.currentPath = resolved;
        // Update PWD environment variable
        this.env['PWD'] = resolved;
        
        return { stdout: '', exitCode: 0, changeDir: true };
    }
    
    pwd(args, stdin = '') {
        return { stdout: this.fs.currentPath + '\n', exitCode: 0 };
    }
    
    mkdir(args) {
        const flags = this.parseFlags(args, ['p']);
        
        if (flags.args.length === 0) {
            return { error: 'mkdir: missing operand' };
        }
        
        for (const path of flags.args) {
            const resolved = this.fs.resolvePath(path);
            const parentPath = this.fs.getParentPath(resolved);
            const basename = this.fs.getBasename(resolved);
            
            const parent = this.fs.getNode(parentPath);
            if (!parent) {
                if (flags.p) {
                    // Create parent directories (simplified)
                    return { error: 'mkdir -p: complex path creation not yet implemented' };
                }
                return { error: `mkdir: cannot create directory '${path}': No such file or directory` };
            }
            
            if (parent.children[basename]) {
                return { error: `mkdir: cannot create directory '${path}': File exists` };
            }
            
            parent.children[basename] = {
                type: 'directory',
                permissions: '0755',
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                size: 4096,
                modified: new Date(),
                children: {}
            };
        }
        
        return { output: '' };
    }
    
    touch(args) {
        if (args.length === 0) {
            return { error: 'touch: missing file operand' };
        }
        
        for (const path of args) {
            const resolved = this.fs.resolvePath(path);
            const parentPath = this.fs.getParentPath(resolved);
            const basename = this.fs.getBasename(resolved);
            
            const parent = this.fs.getNode(parentPath);
            if (!parent) {
                return { error: `touch: cannot touch '${path}': No such file or directory` };
            }
            
            if (parent.children[basename]) {
                // Update timestamp
                parent.children[basename].modified = new Date();
            } else {
                // Create new file
                parent.children[basename] = {
                    type: 'file',
                    permissions: '0644',
                    owner: this.fs.currentUser,
                    group: this.fs.currentUser,
                    size: 0,
                    modified: new Date(),
                    content: ''
                };
            }
        }
        
        return { output: '' };
    }
    
    cat(args) {
        if (args.length === 0) {
            return { error: 'cat: missing file operand' };
        }
        
        let output = [];
        
        for (const path of args) {
            const node = this.fs.getNode(path);
            if (!node) {
                return { error: `cat: ${path}: No such file or directory` };
            }
            
            if (node.type !== 'file') {
                return { error: `cat: ${path}: Is a directory` };
            }
            
            if (!this.fs.hasPermission(node, 'r')) {
                return { error: `cat: ${path}: Permission denied` };
            }
            
            output.push(node.content || '');
        }
        
        return { output: output.join('\n') };
    }
    
    rm(args) {
        const flags = this.parseFlags(args, ['r', 'f']);
        
        if (flags.args.length === 0) {
            return { error: 'rm: missing operand' };
        }
        
        for (const path of flags.args) {
            const resolved = this.fs.resolvePath(path);
            const parentPath = this.fs.getParentPath(resolved);
            const basename = this.fs.getBasename(resolved);
            
            const parent = this.fs.getNode(parentPath);
            if (!parent || !parent.children[basename]) {
                if (!flags.f) {
                    return { error: `rm: cannot remove '${path}': No such file or directory` };
                }
                continue;
            }
            
            const node = parent.children[basename];
            
            if (node.type === 'directory' && !flags.r) {
                return { error: `rm: cannot remove '${path}': Is a directory` };
            }
            
            delete parent.children[basename];
        }
        
        return { output: '' };
    }
    
    chmod(args) {
        if (args.length < 2) {
            return { error: 'chmod: missing operand' };
        }
        
        const mode = args[0];
        const path = args[1];
        
        const node = this.fs.getNode(path);
        if (!node) {
            return { error: `chmod: cannot access '${path}': No such file or directory` };
        }
        
        // Simple octal mode (e.g., 755, 644)
        if (/^[0-7]{3,4}$/.test(mode)) {
            node.permissions = mode.length === 3 ? '0' + mode : mode;
            return { output: '' };
        }
        
        return { error: `chmod: invalid mode: '${mode}'` };
    }
    
    chown(args) {
        if (args.length < 2) {
            return { error: 'chown: missing operand' };
        }
        
        const owner = args[0];
        const path = args[1];
        
        const node = this.fs.getNode(path);
        if (!node) {
            return { error: `chown: cannot access '${path}': No such file or directory` };
        }
        
        if (this.fs.currentUid !== 0) {
            return { error: 'chown: Operation not permitted' };
        }
        
        // Parse owner:group format
        if (owner.includes(':')) {
            const [ownerName, groupName] = owner.split(':');
            if (!this.fs.users[ownerName]) {
                return { error: `chown: invalid user: '${ownerName}'` };
            }
            node.owner = ownerName;
            if (groupName) {
                if (!this.fs.groups[groupName]) {
                    return { error: `chown: invalid group: '${groupName}'` };
                }
                node.group = groupName;
            }
        } else {
            if (!this.fs.users[owner]) {
                return { error: `chown: invalid user: '${owner}'` };
            }
            node.owner = owner;
        }
        
        return { output: '' };
    }
    
    grep(args, stdin = '') {
        const flags = this.parseFlags(args, ['i', 'v', 'n', 'r', 'c']);
        
        // If stdin provided, search in stdin instead of file
        if (stdin && flags.args.length >= 1) {
            const pattern = flags.args[0];
            const lines = stdin.split('\n');
            let matches = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let match = false;
                
                if (flags.i) {
                    match = line.toLowerCase().includes(pattern.toLowerCase());
                } else {
                    match = line.includes(pattern);
                }
                
                if (flags.v) match = !match; // Invert match
                
                if (match) {
                    if (flags.n) {
                        matches.push(`${i + 1}:${line}`);
                    } else {
                        matches.push(line);
                    }
                }
            }
            
            if (flags.c) {
                return { stdout: matches.length + '\n', exitCode: 0 };
            }
            
            return { stdout: matches.join('\n') + (matches.length > 0 ? '\n' : ''), exitCode: matches.length > 0 ? 0 : 1 };
        }
        
        if (flags.args.length < 2) {
            return { stderr: 'grep: missing operand', exitCode: 2 };
        }
        
        const pattern = flags.args[0];
        const path = flags.args[1];
        
        const node = this.fs.getNode(path);
        if (!node) {
            return { stderr: `grep: ${path}: No such file or directory`, exitCode: 2 };
        }
        
        if (node.type !== 'file') {
            return { stderr: `grep: ${path}: Is a directory`, exitCode: 2 };
        }
        
        const content = node.content || '';
        const lines = content.split('\n');
        let matches = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let match = false;
            
            if (flags.i) {
                match = line.toLowerCase().includes(pattern.toLowerCase());
            } else {
                match = line.includes(pattern);
            }
            
            if (flags.v) match = !match; // Invert match
            
            if (match) {
                if (flags.n) {
                    matches.push(`${i + 1}:${line}`);
                } else {
                    matches.push(line);
                }
            }
        }
        
        if (flags.c) {
            return { stdout: matches.length + '\n', exitCode: 0 };
        }
        
        return { stdout: matches.join('\n') + (matches.length > 0 ? '\n' : ''), exitCode: matches.length > 0 ? 0 : 1 };
    }
    
    sed(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'sed: missing command', exitCode: 1 };
        }
        
        const command = args[0];
        let input = stdin;
        
        // If no stdin, read from file
        if (!stdin && args.length >= 2) {
            const filePath = args[1];
            const node = this.fs.getNode(filePath);
            if (!node) {
                return { stderr: `sed: can't read ${filePath}: No such file or directory`, exitCode: 2 };
            }
            if (node.type !== 'file') {
                return { stderr: `sed: ${filePath}: Is a directory`, exitCode: 2 };
            }
            input = node.content || '';
        }
        
        if (!input) {
            return { stderr: 'sed: no input', exitCode: 1 };
        }
        
        let lines = input.split('\n');
        let output = [];
        
        // Parse common sed commands
        // s/pattern/replacement/ - substitute
        const substMatch = command.match(/^s\/([^\/]*)\/([^\/]*)\/([g]?)$/);
        if (substMatch) {
            const pattern = substMatch[1];
            const replacement = substMatch[2];
            const global = substMatch[3] === 'g';
            
            for (const line of lines) {
                if (global) {
                    output.push(line.split(pattern).join(replacement));
                } else {
                    output.push(line.replace(pattern, replacement));
                }
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // /pattern/d - delete lines matching pattern
        const deleteMatch = command.match(/^\/(.*)\/d$/);
        if (deleteMatch) {
            const pattern = deleteMatch[1];
            for (const line of lines) {
                if (!line.includes(pattern)) {
                    output.push(line);
                }
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // /pattern/p - print lines matching pattern
        const printMatch = command.match(/^\/(.*)\/p$/);
        if (printMatch) {
            const pattern = printMatch[1];
            for (const line of lines) {
                if (line.includes(pattern)) {
                    output.push(line);
                }
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // Numeric line operations: 1d, 2p, 3,5d, etc.
        const lineDeleteMatch = command.match(/^(\d+)d$/);
        if (lineDeleteMatch) {
            const lineNum = parseInt(lineDeleteMatch[1]) - 1;
            lines = lines.filter((_, i) => i !== lineNum);
            return { stdout: lines.join('\n') + '\n', exitCode: 0 };
        }
        
        return { stderr: `sed: unknown command: ${command}`, exitCode: 1 };
    }
    
    awk(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'awk: missing program', exitCode: 1 };
        }
        
        const program = args[0];
        let input = stdin;
        
        // If no stdin, read from file
        if (!stdin && args.length >= 2) {
            const filePath = args[1];
            const node = this.fs.getNode(filePath);
            if (!node) {
                return { stderr: `awk: can't open ${filePath}: No such file or directory`, exitCode: 2 };
            }
            if (node.type !== 'file') {
                return { stderr: `awk: ${filePath}: Is a directory`, exitCode: 2 };
            }
            input = node.content || '';
        }
        
        if (!input) {
            return { stdout: '', exitCode: 0 };
        }
        
        const lines = input.split('\n');
        let output = [];
        
        // Common awk patterns
        // '{print $1}' - print first field
        const printFieldMatch = program.match(/^\{print \$(\d+)\}$/);
        if (printFieldMatch) {
            const fieldNum = parseInt(printFieldMatch[1]);
            for (const line of lines) {
                const fields = line.split(/\s+/);
                if (fieldNum === 0) {
                    output.push(line);
                } else if (fields[fieldNum - 1]) {
                    output.push(fields[fieldNum - 1]);
                }
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // '{print $1,$2}' - print multiple fields
        const printMultiMatch = program.match(/^\{print ([^}]+)\}$/);
        if (printMultiMatch) {
            const printExpr = printMultiMatch[1];
            for (const line of lines) {
                const fields = line.split(/\s+/);
                let result = printExpr.replace(/\$(\d+)/g, (match, num) => {
                    const n = parseInt(num);
                    if (n === 0) return line;
                    return fields[n - 1] || '';
                });
                // Remove commas used for spacing
                result = result.replace(/,/g, ' ');
                output.push(result);
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // '/pattern/ {print}' - print lines matching pattern
        const patternMatch = program.match(/^\/(.*)\/\s*\{print\}$/);
        if (patternMatch) {
            const pattern = patternMatch[1];
            for (const line of lines) {
                if (line.includes(pattern)) {
                    output.push(line);
                }
            }
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        // 'NR==1' or 'NR>1' - line number conditions
        const nrMatch = program.match(/^NR([=><]+)(\d+)\s*\{print\}$/);
        if (nrMatch) {
            const operator = nrMatch[1];
            const lineNum = parseInt(nrMatch[2]);
            lines.forEach((line, i) => {
                const nr = i + 1;
                let condition = false;
                if (operator === '==') condition = nr === lineNum;
                else if (operator === '>') condition = nr > lineNum;
                else if (operator === '<') condition = nr < lineNum;
                else if (operator === '>=') condition = nr >= lineNum;
                else if (operator === '<=') condition = nr <= lineNum;
                
                if (condition) output.push(line);
            });
            return { stdout: output.join('\n') + '\n', exitCode: 0 };
        }
        
        return { stderr: `awk: syntax error near: ${program}`, exitCode: 1 };
    }
    
    head(args, stdin = '') {
        const flags = this.parseFlags(args, ['n']);
        let numLines = 10; // default
        
        // Parse -n flag
        if (flags.n && flags.args.length > 0 && /^\d+$/.test(flags.args[0])) {
            numLines = parseInt(flags.args[0]);
            flags.args = flags.args.slice(1);
        }
        
        // If stdin provided, read from stdin
        if (stdin) {
            const lines = stdin.split('\n');
            const output = lines.slice(0, numLines).join('\n');
            return { stdout: output + (output ? '\n' : ''), exitCode: 0 };
        }
        
        if (flags.args.length === 0) {
            return { stderr: 'head: missing file operand', exitCode: 1 };
        }
        
        const path = flags.args[0];
        const node = this.fs.getNode(path);
        
        if (!node) {
            return { stderr: `head: cannot open '${path}' for reading: No such file or directory`, exitCode: 1 };
        }
        
        if (node.type !== 'file') {
            return { stderr: `head: error reading '${path}': Is a directory`, exitCode: 1 };
        }
        
        const content = node.content || '';
        const lines = content.split('\n');
        const output = lines.slice(0, numLines).join('\n');
        
        return { stdout: output + (output ? '\n' : ''), exitCode: 0 };
    }
    
    tail(args, stdin = '') {
        const flags = this.parseFlags(args, ['n', 'f']);
        let numLines = 10; // default
        
        // Parse -n flag
        if (flags.n && flags.args.length > 0 && /^\d+$/.test(flags.args[0])) {
            numLines = parseInt(flags.args[0]);
            flags.args = flags.args.slice(1);
        }
        
        // If stdin provided, read from stdin
        if (stdin) {
            const lines = stdin.split('\n').filter(l => l !== '' || stdin.endsWith('\n'));
            const output = lines.slice(-numLines).join('\n');
            return { stdout: output + (output ? '\n' : ''), exitCode: 0 };
        }
        
        if (flags.args.length === 0) {
            return { stderr: 'tail: missing file operand', exitCode: 1 };
        }
        
        const path = flags.args[0];
        const node = this.fs.getNode(path);
        
        if (!node) {
            return { stderr: `tail: cannot open '${path}' for reading: No such file or directory`, exitCode: 1 };
        }
        
        if (node.type !== 'file') {
            return { stderr: `tail: error reading '${path}': Is a directory`, exitCode: 1 };
        }
        
        if (flags.f) {
            return { stdout: `tail: -f (follow) mode not supported in simulated environment\n`, exitCode: 0 };
        }
        
        const content = node.content || '';
        const lines = content.split('\n').filter(l => l !== '' || content.endsWith('\n'));
        const output = lines.slice(-numLines).join('\n');
        
        return { stdout: output + (output ? '\n' : ''), exitCode: 0 };
    }
    
    wc(args, stdin = '') {
        const flags = this.parseFlags(args, ['l', 'w', 'c', 'm']);
        
        let content = '';
        let filename = '';
        
        // If stdin provided, count from stdin
        if (stdin) {
            content = stdin;
        } else {
            if (flags.args.length === 0) {
                return { stderr: 'wc: missing file operand', exitCode: 1 };
            }
            
            const path = flags.args[0];
            filename = path;
            const node = this.fs.getNode(path);
            
            if (!node) {
                return { stderr: `wc: ${path}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `wc: ${path}: Is a directory`, exitCode: 1 };
            }
            
            content = node.content || '';
        }
        
        const lines = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const bytes = content.length;
        const chars = content.length; // Simplified: bytes = chars
        
        let output = '';
        
        // If no flags specified, show all three (lines, words, bytes)
        if (!flags.l && !flags.w && !flags.c && !flags.m) {
            output = `${lines} ${words} ${bytes}`;
        } else {
            const parts = [];
            if (flags.l) parts.push(lines);
            if (flags.w) parts.push(words);
            if (flags.c) parts.push(bytes);
            if (flags.m) parts.push(chars);
            output = parts.join(' ');
        }
        
        if (filename) {
            output += ` ${filename}`;
        }
        
        return { stdout: output + '\n', exitCode: 0 };
    }
    
    sort(args, stdin = '') {
        const flags = this.parseFlags(args, ['r', 'n', 'u', 'k']);
        
        let lines = [];
        
        // If stdin provided, sort from stdin
        if (stdin) {
            lines = stdin.split('\n').filter(l => l || stdin.endsWith('\n'));
        } else {
            if (flags.args.length === 0) {
                return { stderr: 'sort: missing file operand', exitCode: 1 };
            }
            
            const path = flags.args[0];
            const node = this.fs.getNode(path);
            
            if (!node) {
                return { stderr: `sort: cannot read: ${path}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `sort: read failed: ${path}: Is a directory`, exitCode: 1 };
            }
            
            const content = node.content || '';
            lines = content.split('\n').filter(l => l || content.endsWith('\n'));
        }
        
        // Sort lines
        if (flags.n) {
            // Numeric sort
            lines.sort((a, b) => {
                const numA = parseFloat(a) || 0;
                const numB = parseFloat(b) || 0;
                return numA - numB;
            });
        } else {
            // Alphabetic sort
            lines.sort();
        }
        
        // Reverse if -r flag
        if (flags.r) {
            lines.reverse();
        }
        
        // Unique if -u flag
        if (flags.u) {
            lines = [...new Set(lines)];
        }
        
        return { stdout: lines.join('\n') + (lines.length > 0 ? '\n' : ''), exitCode: 0 };
    }
    
    uniq(args, stdin = '') {
        const flags = this.parseFlags(args, ['c', 'd', 'u']);
        
        let lines = [];
        
        // If stdin provided, process from stdin
        if (stdin) {
            lines = stdin.split('\n').filter(l => l || stdin.endsWith('\n'));
        } else {
            if (flags.args.length === 0) {
                return { stderr: 'uniq: missing file operand', exitCode: 1 };
            }
            
            const path = flags.args[0];
            const node = this.fs.getNode(path);
            
            if (!node) {
                return { stderr: `uniq: ${path}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `uniq: ${path}: Is a directory`, exitCode: 1 };
            }
            
            const content = node.content || '';
            lines = content.split('\n').filter(l => l || content.endsWith('\n'));
        }
        
        // Process unique lines (only adjacent duplicates)
        const result = [];
        const counts = [];
        let prev = null;
        let count = 0;
        
        for (const line of lines) {
            if (line === prev) {
                count++;
            } else {
                if (prev !== null) {
                    result.push(prev);
                    counts.push(count);
                }
                prev = line;
                count = 1;
            }
        }
        
        if (prev !== null) {
            result.push(prev);
            counts.push(count);
        }
        
        // Apply flags
        let output = [];
        for (let i = 0; i < result.length; i++) {
            const line = result[i];
            const cnt = counts[i];
            
            if (flags.d && cnt === 1) continue; // Skip unique lines if -d
            if (flags.u && cnt > 1) continue;   // Skip duplicate lines if -u
            
            if (flags.c) {
                output.push(`${cnt} ${line}`);
            } else {
                output.push(line);
            }
        }
        
        return { stdout: output.join('\n') + (output.length > 0 ? '\n' : ''), exitCode: 0 };
    }
    
    cut(args, stdin = '') {
        const flags = this.parseFlags(args, ['d', 'f', 'c']);
        
        let delimiter = '\t';
        let fields = [];
        let chars = [];
        
        // Parse -d delimiter
        if (flags.d && flags.args.length > 0) {
            delimiter = flags.args[0];
            flags.args = flags.args.slice(1);
        }
        
        // Parse -f fields or -c characters
        if (flags.f && flags.args.length > 0) {
            const fieldSpec = flags.args[0];
            // Parse field spec: 1, 1-3, 1,3,5
            fields = this.parseFieldSpec(fieldSpec);
            flags.args = flags.args.slice(1);
        } else if (flags.c && flags.args.length > 0) {
            const charSpec = flags.args[0];
            chars = this.parseFieldSpec(charSpec);
            flags.args = flags.args.slice(1);
        }
        
        let lines = [];
        
        // If stdin provided, process from stdin
        if (stdin) {
            lines = stdin.split('\n');
        } else {
            if (flags.args.length === 0) {
                return { stderr: 'cut: missing file operand', exitCode: 1 };
            }
            
            const path = flags.args[0];
            const node = this.fs.getNode(path);
            
            if (!node) {
                return { stderr: `cut: ${path}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `cut: ${path}: Is a directory`, exitCode: 1 };
            }
            
            lines = (node.content || '').split('\n');
        }
        
        const output = [];
        
        for (const line of lines) {
            if (fields.length > 0) {
                // Field-based cut
                const parts = line.split(delimiter);
                const selected = fields.map(f => parts[f - 1] || '').filter(x => x !== '');
                output.push(selected.join(delimiter));
            } else if (chars.length > 0) {
                // Character-based cut
                const selected = chars.map(c => line[c - 1] || '').join('');
                output.push(selected);
            } else {
                output.push(line);
            }
        }
        
        return { stdout: output.join('\n') + (output.length > 0 && lines[lines.length - 1] !== '' ? '\n' : ''), exitCode: 0 };
    }
    
    parseFieldSpec(spec) {
        // Parse field/char specifications like "1", "1-3", "1,3,5", "1-3,5,7-9"
        const result = [];
        const parts = spec.split(',');
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(x => parseInt(x));
                for (let i = start; i <= end; i++) {
                    result.push(i);
                }
            } else {
                result.push(parseInt(part));
            }
        }
        
        return result;
    }
    
    tar(args, stdin = '') {
        const flags = this.parseFlags(args, ['c', 'x', 't', 'z', 'j', 'v', 'f']);
        
        // Simulated tar - we'll just show messages about what would happen
        if (flags.c) {
            // Create archive
            if (flags.args.length < 1) {
                return { stderr: 'tar: Refusing to write archive contents to terminal', exitCode: 1 };
            }
            
            const archiveName = flags.args[0];
            const files = flags.args.slice(1);
            
            if (files.length === 0) {
                return { stderr: 'tar: Cowardly refusing to create an empty archive', exitCode: 1 };
            }
            
            let output = `tar: Creating archive '${archiveName}'`;
            if (flags.z) output += ' (gzip compressed)';
            if (flags.j) output += ' (bzip2 compressed)';
            output += `\ntar: Adding ${files.length} file(s)\n`;
            
            if (flags.v) {
                files.forEach(f => output += `${f}\n`);
            }
            
            // Actually create a simulated archive file
            const parentPath = this.fs.getParentPath(archiveName);
            const basename = this.fs.getBasename(archiveName);
            const parent = this.fs.getNode(parentPath);
            
            if (parent) {
                parent.children[basename] = {
                    type: 'file',
                    permissions: '0644',
                    owner: this.fs.currentUser,
                    group: this.fs.currentUser,
                    size: 1024,
                    modified: new Date(),
                    content: `[Simulated tar archive containing: ${files.join(', ')}]`
                };
            }
            
            return { stdout: output, exitCode: 0 };
        } else if (flags.x) {
            // Extract archive
            if (flags.args.length < 1) {
                return { stderr: 'tar: Refusing to read archive contents from terminal', exitCode: 1 };
            }
            
            const archiveName = flags.args[0];
            const node = this.fs.getNode(archiveName);
            
            if (!node) {
                return { stderr: `tar: ${archiveName}: Cannot open: No such file or directory`, exitCode: 1 };
            }
            
            let output = `tar: Extracting from '${archiveName}'\n`;
            if (flags.v) {
                output += node.content || '[Archive contents would be extracted here]\n';
            }
            
            return { stdout: output, exitCode: 0 };
        } else if (flags.t) {
            // List archive contents
            if (flags.args.length < 1) {
                return { stderr: 'tar: Refusing to read archive contents from terminal', exitCode: 1 };
            }
            
            const archiveName = flags.args[0];
            const node = this.fs.getNode(archiveName);
            
            if (!node) {
                return { stderr: `tar: ${archiveName}: Cannot open: No such file or directory`, exitCode: 1 };
            }
            
            return { stdout: node.content || '[Archive listing would appear here]\n', exitCode: 0 };
        }
        
        return { stderr: 'tar: You must specify one of the -c, -t or -x options', exitCode: 1 };
    }
    
    gzip(args, stdin = '') {
        const flags = this.parseFlags(args, ['d', 'k', 'v', 'r', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        
        if (flags.d) {
            // Decompress (same as gunzip)
            return this.gunzip(args, stdin);
        }
        
        if (flags.args.length === 0) {
            return { stderr: 'gzip: compressed data not written to a terminal', exitCode: 1 };
        }
        
        for (const filename of flags.args) {
            const node = this.fs.getNode(filename);
            if (!node) {
                return { stderr: `gzip: ${filename}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `gzip: ${filename}: Is a directory`, exitCode: 1 };
            }
            
            // Create .gz file
            const gzName = filename + '.gz';
            const parent = this.fs.getNode(this.fs.getParentPath(filename));
            const basename = this.fs.getBasename(filename);
            
            parent.children[basename + '.gz'] = {
                type: 'file',
                content: `[Compressed: ${node.content || ''}]`,
                size: Math.floor((node.size || 0) * 0.3),
                permissions: node.permissions,
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                modified: new Date()
            };
            
            // Remove original unless -k (keep)
            if (!flags.k) {
                delete parent.children[basename];
            }
            
            if (flags.v) {
                const ratio = 70;
                return { stdout: `${filename}:\t ${ratio}% -- replaced with ${gzName}`, exitCode: 0 };
            }
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    gunzip(args, stdin = '') {
        const flags = this.parseFlags(args, ['k', 'v']);
        
        if (flags.args.length === 0) {
            return { stderr: 'gunzip: compressed data not read from a terminal', exitCode: 1 };
        }
        
        for (const filename of flags.args) {
            // Accept both .gz and non-.gz names
            let gzName = filename;
            if (!filename.endsWith('.gz')) {
                gzName = filename + '.gz';
            }
            
            const node = this.fs.getNode(gzName);
            if (!node) {
                return { stderr: `gunzip: ${gzName}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `gunzip: ${gzName}: Is a directory`, exitCode: 1 };
            }
            
            // Extract original name
            const originalName = gzName.replace(/\.gz$/, '');
            const parent = this.fs.getNode(this.fs.getParentPath(gzName));
            const basename = this.fs.getBasename(originalName);
            
            // Create decompressed file
            const content = (node.content || '').replace(/^\[Compressed: /, '').replace(/\]$/, '');
            parent.children[basename] = {
                type: 'file',
                content: content,
                size: content.length,
                permissions: node.permissions,
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                modified: new Date()
            };
            
            // Remove .gz file unless -k
            if (!flags.k) {
                delete parent.children[this.fs.getBasename(gzName)];
            }
            
            if (flags.v) {
                return { stdout: `${gzName}:\t -- replaced with ${originalName}`, exitCode: 0 };
            }
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    bzip2(args, stdin = '') {
        const flags = this.parseFlags(args, ['d', 'k', 'v', 'z']);
        
        if (flags.d) {
            // Decompress (same as bunzip2)
            return this.bunzip2(args, stdin);
        }
        
        if (flags.args.length === 0) {
            return { stderr: 'bzip2: I won\'t write compressed data to a terminal', exitCode: 1 };
        }
        
        for (const filename of flags.args) {
            const node = this.fs.getNode(filename);
            if (!node) {
                return { stderr: `bzip2: ${filename}: No such file or directory`, exitCode: 1 };
            }
            
            if (node.type !== 'file') {
                return { stderr: `bzip2: ${filename}: Is a directory`, exitCode: 1 };
            }
            
            // Create .bz2 file
            const bz2Name = filename + '.bz2';
            const parent = this.fs.getNode(this.fs.getParentPath(filename));
            const basename = this.fs.getBasename(filename);
            
            parent.children[basename + '.bz2'] = {
                type: 'file',
                content: `[BZ2 Compressed: ${node.content || ''}]`,
                size: Math.floor((node.size || 0) * 0.25),
                permissions: node.permissions,
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                modified: new Date()
            };
            
            // Remove original unless -k
            if (!flags.k) {
                delete parent.children[basename];
            }
            
            if (flags.v) {
                const ratio = 75;
                return { stdout: `${filename}: ${ratio}:1, 0.${100-ratio} bits/byte, ${ratio}% saved`, exitCode: 0 };
            }
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    bunzip2(args, stdin = '') {
        const flags = this.parseFlags(args, ['k', 'v']);
        
        if (flags.args.length === 0) {
            return { stderr: 'bunzip2: I won\'t read compressed data from a terminal', exitCode: 1 };
        }
        
        for (const filename of flags.args) {
            let bz2Name = filename;
            if (!filename.endsWith('.bz2')) {
                bz2Name = filename + '.bz2';
            }
            
            const node = this.fs.getNode(bz2Name);
            if (!node) {
                return { stderr: `bunzip2: ${bz2Name}: No such file or directory`, exitCode: 1 };
            }
            
            const originalName = bz2Name.replace(/\.bz2$/, '');
            const parent = this.fs.getNode(this.fs.getParentPath(bz2Name));
            const basename = this.fs.getBasename(originalName);
            
            const content = (node.content || '').replace(/^\[BZ2 Compressed: /, '').replace(/\]$/, '');
            parent.children[basename] = {
                type: 'file',
                content: content,
                size: content.length,
                permissions: node.permissions,
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                modified: new Date()
            };
            
            if (!flags.k) {
                delete parent.children[this.fs.getBasename(bz2Name)];
            }
            
            if (flags.v) {
                return { stdout: `${bz2Name}: done`, exitCode: 0 };
            }
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    zip(args, stdin = '') {
        const flags = this.parseFlags(args, ['r', 'v', 'q']);
        
        if (flags.args.length < 2) {
            return { stderr: 'zip error: Missing archive name or files', exitCode: 1 };
        }
        
        const zipName = flags.args[0];
        const files = flags.args.slice(1);
        
        let contents = [];
        for (const filename of files) {
            const node = this.fs.getNode(filename);
            if (!node) {
                return { stderr: `zip: ${filename}: No such file or directory`, exitCode: 1 };
            }
            contents.push(filename);
        }
        
        // Create .zip file
        const finalZipName = zipName.endsWith('.zip') ? zipName : zipName + '.zip';
        const parent = this.fs.getNode(this.fs.getParentPath(finalZipName));
        if (!parent) {
            return { stderr: `zip: ${finalZipName}: No such file or directory`, exitCode: 1 };
        }
        
        parent.children[this.fs.getBasename(finalZipName)] = {
            type: 'file',
            content: `[ZIP Archive containing: ${contents.join(', ')}]`,
            size: Math.floor(contents.length * 100),
            permissions: '0644',
            owner: this.fs.currentUser,
            group: this.fs.currentUser,
            modified: new Date()
        };
        
        if (!flags.q) {
            return { stdout: `  adding: ${contents.join('\n  adding: ')}\n`, exitCode: 0 };
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    unzip(args, stdin = '') {
        const flags = this.parseFlags(args, ['l', 'v', 'q']);
        
        if (flags.args.length === 0) {
            return { stderr: 'UnZip: missing archive filename', exitCode: 1 };
        }
        
        const zipName = flags.args[0];
        const node = this.fs.getNode(zipName);
        
        if (!node) {
            return { stderr: `unzip: ${zipName}: No such file or directory`, exitCode: 1 };
        }
        
        if (flags.l) {
            // List contents
            return { stdout: `Archive:  ${zipName}\n  Length      Date    Time    Name\n---------  ---------- -----   ----\n${node.content || '[Archive contents]'}\n---------                     -------\n        0                     0 files`, exitCode: 0 };
        }
        
        // Extract (simulated)
        if (!flags.q) {
            return { stdout: `Archive:  ${zipName}\n  inflating: ${node.content || '[files extracted]'}`, exitCode: 0 };
        }
        
        return { stdout: '', exitCode: 0 };
    }
    
    cp(args) {
        const flags = this.parseFlags(args, ['r', 'R', 'v', 'p']);
        
        if (flags.args.length < 2) {
            return { error: 'cp: missing file operand' };
        }
        
        const sources = flags.args.slice(0, -1);
        const destPath = flags.args[flags.args.length - 1];
        
        for (const sourcePath of sources) {
            const result = this.copyPath(sourcePath, destPath, flags.r || flags.R, flags.v);
            if (result.error) {
                return result;
            }
        }
        
        return { output: '' };
    }
    
    copyPath(sourcePath, destPath, recursive, verbose) {
        const sourceNode = this.fs.getNode(sourcePath);
        if (!sourceNode) {
            return { error: `cp: cannot stat '${sourcePath}': No such file or directory` };
        }
        
        if (!this.fs.hasPermission(sourceNode, 'r')) {
            return { error: `cp: cannot open '${sourcePath}' for reading: Permission denied` };
        }
        
        // Check if destination is a directory
        const destNode = this.fs.getNode(destPath);
        let finalDestPath = destPath;
        
        if (destNode && destNode.type === 'directory') {
            // Copy into directory with same name
            const basename = this.fs.getBasename(sourcePath);
            finalDestPath = destPath === '/' ? '/' + basename : destPath + '/' + basename;
        }
        
        // If source is directory and -r not specified
        if (sourceNode.type === 'directory' && !recursive) {
            return { error: `cp: -r not specified; omitting directory '${sourcePath}'` };
        }
        
        // Get parent directory of destination
        const destParentPath = this.fs.getParentPath(finalDestPath);
        const destBasename = this.fs.getBasename(finalDestPath);
        const destParent = this.fs.getNode(destParentPath);
        
        if (!destParent) {
            return { error: `cp: cannot create regular file '${finalDestPath}': No such file or directory` };
        }
        
        if (!this.fs.hasPermission(destParent, 'w')) {
            return { error: `cp: cannot create regular file '${finalDestPath}': Permission denied` };
        }
        
        // Perform deep copy
        destParent.children[destBasename] = this.deepCopyNode(sourceNode);
        
        if (verbose) {
            return { output: `'${sourcePath}' -> '${finalDestPath}'` };
        }
        
        return { output: '' };
    }
    
    deepCopyNode(node) {
        const copy = {
            type: node.type,
            permissions: node.permissions,
            owner: node.owner,
            group: node.group,
            size: node.size,
            modified: new Date(),
            content: node.content
        };
        
        if (node.type === 'directory') {
            copy.children = {};
            for (const [name, child] of Object.entries(node.children || {})) {
                copy.children[name] = this.deepCopyNode(child);
            }
        }
        
        if (node.linkTarget) {
            copy.linkTarget = node.linkTarget;
        }
        
        return copy;
    }
    
    mv(args) {
        const flags = this.parseFlags(args, ['v', 'f']);
        
        if (flags.args.length < 2) {
            return { error: 'mv: missing file operand' };
        }
        
        const sources = flags.args.slice(0, -1);
        const destPath = flags.args[flags.args.length - 1];
        
        for (const sourcePath of sources) {
            const result = this.movePath(sourcePath, destPath, flags.v, flags.f);
            if (result.error) {
                return result;
            }
        }
        
        return { output: '' };
    }
    
    movePath(sourcePath, destPath, verbose, force) {
        const resolvedSource = this.fs.resolvePath(sourcePath);
        const sourceNode = this.fs.getNode(sourcePath);
        
        if (!sourceNode) {
            return { error: `mv: cannot stat '${sourcePath}': No such file or directory` };
        }
        
        const sourceParentPath = this.fs.getParentPath(resolvedSource);
        const sourceBasename = this.fs.getBasename(resolvedSource);
        const sourceParent = this.fs.getNode(sourceParentPath);
        
        if (!this.fs.hasPermission(sourceParent, 'w')) {
            return { error: `mv: cannot remove '${sourcePath}': Permission denied` };
        }
        
        // Check if destination is a directory
        const destNode = this.fs.getNode(destPath);
        let finalDestPath = destPath;
        
        if (destNode && destNode.type === 'directory') {
            // Move into directory with same name
            finalDestPath = destPath === '/' ? '/' + sourceBasename : destPath + '/' + sourceBasename;
        }
        
        // Check if destination exists
        const finalDestNode = this.fs.getNode(finalDestPath);
        if (finalDestNode && !force) {
            return { error: `mv: cannot move '${sourcePath}' to '${finalDestPath}': File exists` };
        }
        
        // Get destination parent
        const destParentPath = this.fs.getParentPath(finalDestPath);
        const destBasename = this.fs.getBasename(finalDestPath);
        const destParent = this.fs.getNode(destParentPath);
        
        if (!destParent) {
            return { error: `mv: cannot move '${sourcePath}' to '${finalDestPath}': No such file or directory` };
        }
        
        if (!this.fs.hasPermission(destParent, 'w')) {
            return { error: `mv: cannot create regular file '${finalDestPath}': Permission denied` };
        }
        
        // Move: copy node reference and delete from source
        destParent.children[destBasename] = sourceNode;
        delete sourceParent.children[sourceBasename];
        
        if (verbose) {
            return { output: `'${sourcePath}' -> '${finalDestPath}'` };
        }
        
        return { output: '' };
    }
    
    ln(args) {
        const flags = this.parseFlags(args, ['s', 'v', 'f']);
        
        if (flags.args.length < 2) {
            return { error: 'ln: missing file operand' };
        }
        
        const targetPath = flags.args[0];
        const linkPath = flags.args[1];
        
        const targetNode = this.fs.getNode(targetPath);
        
        // For hard links, target must exist
        if (!flags.s && !targetNode) {
            return { error: `ln: failed to access '${targetPath}': No such file or directory` };
        }
        
        // Hard links cannot point to directories
        if (!flags.s && targetNode && targetNode.type === 'directory') {
            return { error: `ln: '${targetPath}': hard link not allowed for directory` };
        }
        
        // Get link destination
        const linkParentPath = this.fs.getParentPath(linkPath);
        const linkBasename = this.fs.getBasename(linkPath);
        const linkParent = this.fs.getNode(linkParentPath);
        
        if (!linkParent) {
            return { error: `ln: failed to create link '${linkPath}': No such file or directory` };
        }
        
        if (!this.fs.hasPermission(linkParent, 'w')) {
            return { error: `ln: failed to create link '${linkPath}': Permission denied` };
        }
        
        // Check if link already exists
        if (linkParent.children[linkBasename] && !flags.f) {
            return { error: `ln: failed to create link '${linkPath}': File exists` };
        }
        
        if (flags.s) {
            // Symbolic link - store path as string
            linkParent.children[linkBasename] = {
                type: 'symlink',
                permissions: '0777',
                owner: this.fs.currentUser,
                group: this.fs.currentUser,
                size: targetPath.length,
                modified: new Date(),
                linkTarget: targetPath
            };
        } else {
            // Hard link - create reference to same node
            linkParent.children[linkBasename] = targetNode;
        }
        
        if (flags.v) {
            return { output: `'${linkPath}' -> '${targetPath}'` };
        }
        
        return { output: '' };
    }
    
    // ===== USER MANAGEMENT =====
    
    useradd(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'useradd: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['m', 'u', 'g', 's']);
        const username = flags.args[0];
        
        if (!username) {
            return { error: 'useradd: missing username' };
        }
        
        if (this.fs.users[username]) {
            return { error: `useradd: user '${username}' already exists` };
        }
        
        const uid = Object.keys(this.fs.users).length + 1000;
        const gid = uid;
        
        this.fs.users[username] = {
            uid: uid,
            gid: gid,
            home: `/home/${username}`,
            shell: '/bin/bash',
            password: 'x'
        };
        
        this.fs.groups[username] = {
            gid: gid,
            members: [username]
        };
        
        // Create home directory if -m flag
        if (flags.m) {
            const homeNode = this.fs.getNode('/home');
            homeNode.children[username] = {
                type: 'directory',
                permissions: '0700',
                owner: username,
                group: username,
                size: 4096,
                modified: new Date(),
                children: {}
            };
        }
        
        return { output: '' };
    }
    
    userdel(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'userdel: Permission denied' };
        }
        
        const username = args[0];
        
        if (!username) {
            return { error: 'userdel: missing username' };
        }
        
        if (!this.fs.users[username]) {
            return { error: `userdel: user '${username}' does not exist` };
        }
        
        delete this.fs.users[username];
        delete this.fs.groups[username];
        
        return { output: '' };
    }
    
    passwd(args) {
        const username = args[0] || this.fs.currentUser;
        
        if (!this.fs.users[username]) {
            return { error: `passwd: user '${username}' does not exist` };
        }
        
        if (username !== this.fs.currentUser && this.fs.currentUid !== 0) {
            return { error: 'passwd: Permission denied' };
        }
        
        return { output: `Changing password for user ${username}.\nNew password: [simulated]\npasswd: all authentication tokens updated successfully.` };
    }
    
    usermod(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'usermod: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['a', 'G', 'L', 'U', 's', 'd', 'l']);
        const username = flags.args[0];
        
        if (!username) {
            return { error: 'usermod: missing username' };
        }
        
        if (!this.fs.users[username]) {
            return { error: `usermod: user '${username}' does not exist` };
        }
        
        // -aG: Add user to supplementary groups
        if (flags.a && flags.G) {
            const groupsIndex = args.indexOf('-aG');
            if (groupsIndex !== -1 && args[groupsIndex + 1]) {
                const groups = args[groupsIndex + 1].split(',');
                for (const group of groups) {
                    if (!this.fs.groups[group]) {
                        return { error: `usermod: group '${group}' does not exist` };
                    }
                    if (!this.fs.groups[group].members.includes(username)) {
                        this.fs.groups[group].members.push(username);
                    }
                }
                return { output: '' };
            }
        }
        
        // -L: Lock user account
        if (flags.L) {
            this.fs.users[username].locked = true;
            return { output: '' };
        }
        
        // -U: Unlock user account
        if (flags.U) {
            this.fs.users[username].locked = false;
            return { output: '' };
        }
        
        // -s: Change shell
        if (flags.s) {
            const shellIndex = args.indexOf('-s');
            if (shellIndex !== -1 && args[shellIndex + 1]) {
                this.fs.users[username].shell = args[shellIndex + 1];
                return { output: '' };
            }
        }
        
        // -d: Change home directory
        if (flags.d) {
            const homeIndex = args.indexOf('-d');
            if (homeIndex !== -1 && args[homeIndex + 1]) {
                this.fs.users[username].home = args[homeIndex + 1];
                return { output: '' };
            }
        }
        
        // -l: Change username
        if (flags.l) {
            const newName = flags.args[1];
            if (!newName) {
                return { error: 'usermod: option requires an argument -- l' };
            }
            if (this.fs.users[newName]) {
                return { error: `usermod: user '${newName}' already exists` };
            }
            this.fs.users[newName] = this.fs.users[username];
            delete this.fs.users[username];
            return { output: '' };
        }
        
        return { output: '' };
    }
    
    groupadd(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'groupadd: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['g']);
        const groupname = flags.args[0];
        
        if (!groupname) {
            return { error: 'groupadd: missing group name' };
        }
        
        if (this.fs.groups[groupname]) {
            return { error: `groupadd: group '${groupname}' already exists` };
        }
        
        const gid = Object.keys(this.fs.groups).length + 1000;
        
        this.fs.groups[groupname] = {
            gid: flags.g ? parseInt(flags.args[1]) : gid,
            members: []
        };
        
        return { output: '' };
    }
    
    groupdel(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'groupdel: Permission denied' };
        }
        
        const groupname = args[0];
        
        if (!groupname) {
            return { error: 'groupdel: missing group name' };
        }
        
        if (!this.fs.groups[groupname]) {
            return { error: `groupdel: group '${groupname}' does not exist` };
        }
        
        // Check if it's a primary group for any user
        for (const user in this.fs.users) {
            if (this.fs.users[user].gid === this.fs.groups[groupname].gid) {
                return { error: `groupdel: cannot remove the primary group of user '${user}'` };
            }
        }
        
        delete this.fs.groups[groupname];
        return { output: '' };
    }
    
    groupmod(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'groupmod: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['n', 'g']);
        const groupname = flags.args[0];
        
        if (!groupname) {
            return { error: 'groupmod: missing group name' };
        }
        
        if (!this.fs.groups[groupname]) {
            return { error: `groupmod: group '${groupname}' does not exist` };
        }
        
        // -n: Rename group
        if (flags.n) {
            const newName = flags.args[1];
            if (!newName) {
                return { error: 'groupmod: option requires an argument -- n' };
            }
            if (this.fs.groups[newName]) {
                return { error: `groupmod: group '${newName}' already exists` };
            }
            this.fs.groups[newName] = this.fs.groups[groupname];
            delete this.fs.groups[groupname];
            return { output: '' };
        }
        
        // -g: Change GID
        if (flags.g) {
            const newGid = parseInt(flags.args[1]);
            if (isNaN(newGid)) {
                return { error: 'groupmod: invalid group ID' };
            }
            this.fs.groups[groupname].gid = newGid;
            return { output: '' };
        }
        
        return { output: '' };
    }
    
    groups(args) {
        const username = args[0] || this.fs.currentUser;
        
        if (!this.fs.users[username]) {
            return { error: `groups: '${username}': no such user` };
        }
        
        const userGroups = [];
        for (const groupName in this.fs.groups) {
            if (this.fs.groups[groupName].members.includes(username)) {
                userGroups.push(groupName);
            }
        }
        
        return { output: `${username} : ${userGroups.join(' ')}` };
    }
    
    su(args) {
        const username = args[0] || 'root';
        
        if (!this.fs.users[username]) {
            return { error: `su: user ${username} does not exist` };
        }
        
        if (this.fs.users[username].locked) {
            return { error: `su: user ${username} is locked` };
        }
        
        // Simulate password prompt and switch
        this.fs.currentUser = username;
        this.fs.currentUid = this.fs.users[username].uid;
        
        return { output: `[Switched to user ${username}]\nPassword: [simulated]`, changeUser: true };
    }
    
    sudo(args) {
        if (args.length === 0) {
            return { error: 'sudo: a command must be specified' };
        }
        
        // Check if user is in sudoers (wheel group)
        const wheelGroup = this.fs.groups['wheel'];
        if (!wheelGroup || !wheelGroup.members.includes(this.fs.currentUser)) {
            return { error: `${this.fs.currentUser} is not in the sudoers file. This incident will be reported.` };
        }
        
        return { output: '[sudo] password for ' + this.fs.currentUser + ': [simulated]\n[Command executed as root]', sudo: true };
    }
    
    chage(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'chage: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l', 'M', 'E']);
        const username = flags.args[0];
        
        if (!username) {
            return { error: 'chage: missing username' };
        }
        
        if (!this.fs.users[username]) {
            return { error: `chage: user '${username}' does not exist` };
        }
        
        // -l: List password expiry info
        if (flags.l) {
            return { output: `Last password change\t\t\t\t: Dec 05, 2024\nPassword expires\t\t\t\t: never\nPassword inactive\t\t\t\t: never\nAccount expires\t\t\t\t\t: never\nMinimum number of days between password change\t\t: 0\nMaximum number of days between password change\t\t: 99999\nNumber of days of warning before password expires\t: 7` };
        }
        
        // -M: Set maximum password age
        if (flags.M) {
            const days = flags.args[1];
            if (!days) {
                return { error: 'chage: option requires an argument -- M' };
            }
            this.fs.users[username].maxPasswordAge = parseInt(days);
            return { output: '' };
        }
        
        // -E: Set account expiration date
        if (flags.E) {
            const date = flags.args[1];
            if (!date) {
                return { error: 'chage: option requires an argument -- E' };
            }
            this.fs.users[username].expireDate = date;
            return { output: '' };
        }
        
        return { output: 'Changing the aging information for ' + username };
    }
    
    chgrp(args) {
        const flags = this.parseFlags(args, ['R', 'v']);
        
        if (flags.args.length < 2) {
            return { error: 'chgrp: missing operand' };
        }
        
        const group = flags.args[0];
        const paths = flags.args.slice(1);
        
        if (!this.fs.groups[group]) {
            return { error: `chgrp: invalid group: '${group}'` };
        }
        
        for (const path of paths) {
            const node = this.fs.getNode(path);
            if (!node) {
                return { error: `chgrp: cannot access '${path}': No such file or directory` };
            }
            
            if (this.fs.currentUid !== 0 && node.owner !== this.fs.currentUser) {
                return { error: `chgrp: changing group of '${path}': Operation not permitted` };
            }
            
            node.group = group;
            
            if (flags.v) {
                return { output: `changed group of '${path}' to ${group}` };
            }
        }
        
        return { output: '' };
    }
    
    umask(args) {
        if (args.length === 0) {
            // Display current umask
            return { output: this.fs.umask || '0022' };
        }
        
        // Set new umask
        const newMask = args[0];
        if (!/^[0-7]{3,4}$/.test(newMask)) {
            return { error: 'umask: invalid mode' };
        }
        
        this.fs.umask = newMask;
        return { output: '' };
    }
    
    getfacl(args) {
        if (args.length === 0) {
            return { error: 'getfacl: missing file operand' };
        }
        
        const path = args[0];
        const node = this.fs.getNode(path);
        
        if (!node) {
            return { error: `getfacl: ${path}: No such file or directory` };
        }
        
        const acl = node.acl || [];
        let output = `# file: ${path}\n# owner: ${node.owner}\n# group: ${node.group}\nuser::${node.permissions.slice(-3, -2)}${node.permissions.slice(-2, -1)}${node.permissions.slice(-1)}\ngroup::${node.permissions.slice(-3, -2)}${node.permissions.slice(-2, -1)}-\nother::${node.permissions.slice(-1)}--\n`;
        
        for (const entry of acl) {
            output += `${entry}\n`;
        }
        
        return { output };
    }
    
    setfacl(args) {
        const flags = this.parseFlags(args, ['m', 'x', 'b', 'k']);
        
        if (flags.args.length < 2) {
            return { error: 'setfacl: missing operand' };
        }
        
        // -m: Modify ACL
        if (flags.m) {
            const aclIndex = args.indexOf('-m');
            if (aclIndex !== -1 && args[aclIndex + 1]) {
                const aclEntry = args[aclIndex + 1];
                const path = args[aclIndex + 2];
                
                const node = this.fs.getNode(path);
                if (!node) {
                    return { error: `setfacl: ${path}: No such file or directory` };
                }
                
                if (!node.acl) {
                    node.acl = [];
                }
                
                node.acl.push(aclEntry);
                return { output: '' };
            }
        }
        
        // -x: Remove ACL entry
        if (flags.x) {
            const aclIndex = args.indexOf('-x');
            if (aclIndex !== -1 && args[aclIndex + 1]) {
                const aclEntry = args[aclIndex + 1];
                const path = args[aclIndex + 2];
                
                const node = this.fs.getNode(path);
                if (!node || !node.acl) {
                    return { error: `setfacl: ${path}: No such file or directory` };
                }
                
                node.acl = node.acl.filter(entry => !entry.startsWith(aclEntry));
                return { output: '' };
            }
        }
        
        return { output: '' };
    }
    
    last(args) {
        // Simulate last login information
        return { output: `root     pts/0        192.168.1.100    Thu Dec  5 10:15   still logged in\n${this.fs.currentUser}     pts/1        192.168.1.101    Thu Dec  5 09:30   still logged in\n\nwtmp begins Thu Dec  5 09:00:00 2024` };
    }
    
    newgrp(args) {
        if (args.length === 0) {
            return { error: 'newgrp: missing group name' };
        }
        
        const groupName = args[0];
        
        if (!this.fs.groups[groupName]) {
            return { error: `newgrp: group '${groupName}' does not exist` };
        }
        
        // Check if user is member of the group
        if (!this.fs.groups[groupName].members.includes(this.fs.currentUser) && this.fs.currentUid !== 0) {
            return { error: `newgrp: Permission denied` };
        }
        
        // Change current group
        const user = this.fs.users[this.fs.currentUser];
        if (user) {
            user.currentGroup = groupName;
        }
        
        return { output: `[Switched to group ${groupName}]\nPassword: [simulated]` };
    }
    
    logger(args) {
        const flags = this.parseFlags(args, ['p', 't', 'i']);
        
        if (flags.args.length === 0) {
            return { error: 'logger: missing message' };
        }
        
        const message = flags.args.join(' ');
        let priority = 'user.notice';
        let tag = this.fs.currentUser;
        let pid = Math.floor(Math.random() * 30000) + 1000;
        
        // -p: priority (facility.level)
        if (flags.p) {
            const pIndex = args.indexOf('-p');
            if (pIndex !== -1 && args[pIndex + 1]) {
                priority = args[pIndex + 1];
            }
        }
        
        // -t: tag
        if (flags.t) {
            const tIndex = args.indexOf('-t');
            if (tIndex !== -1 && args[tIndex + 1]) {
                tag = args[tIndex + 1];
            }
        }
        
        // Simulate adding to journal (would normally go to /var/log/messages or journald)
        // For simulation, we just return success
        if (flags.i) {
            // -i: log process ID
            return { output: `[Message logged with ${priority}: ${tag}[${pid}]: ${message}]` };
        }
        
        return { output: `[Message logged with ${priority}: ${tag}: ${message}]` };
    }
    
    w(args) {
        const uptime = '2 days, 3:45';
        const users = 2;
        const load = '0.15, 0.10, 0.08';
        
        return { output: ` ${new Date().toTimeString().split(' ')[0]} up ${uptime},  ${users} users,  load average: ${load}\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    192.168.1.100    10:15    0.00s  0.03s  0.01s -bash\n${this.fs.currentUser}     pts/1    192.168.1.101    09:30    1:15   0.05s  0.02s vim file.txt` };
    }
    
    who(args) {
        return { output: `root     pts/0        ${new Date().toISOString().split('T')[0]} 10:15 (192.168.1.100)\n${this.fs.currentUser}     pts/1        ${new Date().toISOString().split('T')[0]} 09:30 (192.168.1.101)` };
    }
    
    // ===== PACKAGE MANAGEMENT =====
    
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
            return { output: `ID     | Command line             | Date and time    | Action(s)      | Altered
-------------------------------------------------------------------------------
     3 | install httpd            | 2024-12-05 10:00 | Install        |    1
     2 | remove vim               | 2024-12-05 09:30 | Removed        |    1
     1 | install firewalld        | 2024-12-05 09:00 | Install        |    1` };
        }
        
        if (subcommand === 'repolist') {
            return { output: `repo id                          repo name
appstream                        Red Hat Enterprise Linux 9 - AppStream
baseos                           Red Hat Enterprise Linux 9 - BaseOS
extras                           Red Hat Enterprise Linux 9 - Extras` };
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
    
    // ===== SYSTEMD SERVICES =====
    
    systemctl(args) {
        if (args.length === 0) {
            return { error: 'systemctl: missing command' };
        }
        
        const command = args[0];
        const service = args[1];
        
        if (command === 'start') {
            if (!service) {
                return { error: 'systemctl start: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to start ${service}: Unit not found.` };
            }
            
            this.services[service].active = true;
            return { output: '' };
        }
        
        if (command === 'stop') {
            if (!service) {
                return { error: 'systemctl stop: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to stop ${service}: Unit not found.` };
            }
            
            this.services[service].active = false;
            return { output: '' };
        }
        
        if (command === 'enable') {
            if (!service) {
                return { error: 'systemctl enable: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to enable ${service}: Unit not found.` };
            }
            
            this.services[service].enabled = true;
            return { output: `Created symlink /etc/systemd/system/multi-user.target.wants/${service} → /usr/lib/systemd/system/${service}.service` };
        }
        
        if (command === 'disable') {
            if (!service) {
                return { error: 'systemctl disable: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to disable ${service}: Unit not found.` };
            }
            
            this.services[service].enabled = false;
            return { output: `Removed /etc/systemd/system/multi-user.target.wants/${service}.service` };
        }
        
        if (command === 'status') {
            if (!service) {
                return { error: 'systemctl status: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Unit ${service} could not be found.` };
            }
            
            const svc = this.services[service];
            const active = svc.active ? 'active (running)' : 'inactive (dead)';
            const enabled = svc.enabled ? 'enabled' : 'disabled';
            
            return { output: `● ${service}.service - ${svc.description}\n   Loaded: loaded (/usr/lib/systemd/system/${service}.service; ${enabled})\n   Active: ${active} since ${new Date().toUTCString()}\n Main PID: 1234 (${service})\n    Tasks: 1\n   Memory: 2.3M\n   CGroup: /system.slice/${service}.service\n           └─1234 /usr/sbin/${service}` };
        }
        
        if (command === 'is-active') {
            if (!service) {
                return { error: 'systemctl is-active: missing service name' };
            }
            
            if (!this.services[service]) {
                return { output: 'unknown' };
            }
            
            return { output: this.services[service].active ? 'active' : 'inactive' };
        }
        
        if (command === 'is-enabled') {
            if (!service) {
                return { error: 'systemctl is-enabled: missing service name' };
            }
            
            if (!this.services[service]) {
                return { output: 'disabled' };
            }
            
            return { output: this.services[service].enabled ? 'enabled' : 'disabled' };
        }
        
        if (command === 'restart') {
            if (!service) {
                return { error: 'systemctl restart: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to restart ${service}: Unit not found.` };
            }
            
            this.services[service].active = true;
            return { output: '' };
        }
        
        if (command === 'reload') {
            if (!service) {
                return { error: 'systemctl reload: missing service name' };
            }
            
            if (!this.services[service]) {
                return { error: `Failed to reload ${service}: Unit not found.` };
            }
            
            return { output: '' };
        }
        
        if (command === 'daemon-reload') {
            return { output: '' };
        }
        
        if (command === 'list-units') {
            let output = 'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\n';
            for (const svcName in this.services) {
                const svc = this.services[svcName];
                const load = 'loaded';
                const active = svc.active ? 'active' : 'inactive';
                const sub = svc.active ? 'running' : 'dead';
                output += `${svcName}.service`.padEnd(25) + load.padEnd(7) + active.padEnd(7) + sub.padEnd(8) + svc.description + '\n';
            }
            return { output };
        }
        
        if (command === 'set-default') {
            if (this.fs.currentUid !== 0) {
                return { error: 'systemctl: Permission denied' };
            }
            const target = service;
            if (!target) {
                return { error: 'systemctl set-default: missing target' };
            }
            if (!this.systemdDefaultTarget) {
                this.systemdDefaultTarget = 'multi-user.target';
            }
            this.systemdDefaultTarget = target;
            return { output: `Removed /etc/systemd/system/default.target.\nCreated symlink /etc/systemd/system/default.target → /usr/lib/systemd/system/${target}.` };
        }
        
        if (command === 'get-default') {
            return { output: this.systemdDefaultTarget || 'multi-user.target' };
        }
        
        if (command === 'isolate') {
            if (this.fs.currentUid !== 0) {
                return { error: 'systemctl: Permission denied' };
            }
            const target = service;
            if (!target) {
                return { error: 'systemctl isolate: missing target' };
            }
            return { output: '' };
        }
        
        if (command === 'list-timers') {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24*60*60*1000);
            const formatTime = (date) => {
                const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
                return `${day} ${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
            };
            
            let output = 'NEXT                         LEFT          LAST                         PASSED       UNIT                         ACTIVATES\n';
            
            // Add realistic timers
            const timers = [
                { next: '12h 34m left', last: '11h 26m ago', unit: 'dnf-makecache.timer', activates: 'dnf-makecache.service' },
                { next: '23h 45m left', last: '12m 15s ago', unit: 'systemd-tmpfiles-clean.timer', activates: 'systemd-tmpfiles-clean.service' },
                { next: formatTime(tomorrow), last: formatTime(new Date(now.getTime() - 24*60*60*1000)), unit: 'logrotate.timer', activates: 'logrotate.service' },
                { next: '6 days left', last: '1 day 2h ago', unit: 'unbound-anchor.timer', activates: 'unbound-anchor.service' }
            ];
            
            for (const timer of timers) {
                output += `${timer.next.padEnd(29)}${timer.last.padEnd(29)}${timer.unit.padEnd(29)}${timer.activates}\n`;
            }
            
            output += `\n${timers.length} timers listed.`;
            return { output };
        }
        
        if (command === '--user') {
            // systemctl --user [command] [service]
            const userCommand = args[1];
            const userService = args[2];
            
            if (!this.userServices) {
                this.userServices = {};
            }
            
            if (!this.userServices[this.fs.currentUser]) {
                this.userServices[this.fs.currentUser] = {
                    'pulseaudio': { active: true, enabled: true, description: 'Sound Service' },
                    'dbus': { active: true, enabled: true, description: 'D-Bus User Message Bus' },
                    'gvfs-daemon': { active: true, enabled: false, description: 'Virtual filesystem service' }
                };
            }
            
            const userSvcs = this.userServices[this.fs.currentUser];
            
            if (userCommand === 'list-units') {
                let output = 'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\n';
                for (const svcName in userSvcs) {
                    const svc = userSvcs[svcName];
                    const load = 'loaded';
                    const active = svc.active ? 'active' : 'inactive';
                    const sub = svc.active ? 'running' : 'dead';
                    output += `${svcName}.service`.padEnd(25) + load.padEnd(7) + active.padEnd(7) + sub.padEnd(8) + svc.description + '\n';
                }
                return { output };
            }
            
            if (userCommand === 'status') {
                if (!userService || !userSvcs[userService]) {
                    return { error: `Unit ${userService || 'unknown'} could not be found.` };
                }
                const svc = userSvcs[userService];
                const active = svc.active ? 'active (running)' : 'inactive (dead)';
                const enabled = svc.enabled ? 'enabled' : 'disabled';
                
                return { output: `● ${userService}.service - ${svc.description}\n   Loaded: loaded (/usr/lib/systemd/user/${userService}.service; ${enabled})\n   Active: ${active} since ${new Date().toUTCString()}\n Main PID: ${1000 + Math.floor(Math.random() * 1000)} (${userService})\n   CGroup: /user.slice/user-${this.fs.currentUid}.slice/user@${this.fs.currentUid}.service/${userService}.service` };
            }
            
            if (userCommand === 'start' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].active = true;
                    return { output: '' };
                }
                return { error: `Failed to start ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'stop' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].active = false;
                    return { output: '' };
                }
                return { error: `Failed to stop ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'enable' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].enabled = true;
                    return { output: `Created symlink /home/${this.fs.currentUser}/.config/systemd/user/default.target.wants/${userService}.service → /usr/lib/systemd/user/${userService}.service` };
                }
                return { error: `Failed to enable ${userService}: Unit not found.` };
            }
            
            if (userCommand === 'disable' && userService) {
                if (userSvcs[userService]) {
                    userSvcs[userService].enabled = false;
                    return { output: `Removed /home/${this.fs.currentUser}/.config/systemd/user/default.target.wants/${userService}.service` };
                }
                return { error: `Failed to disable ${userService}: Unit not found.` };
            }
            
            return { error: 'systemctl --user: usage: systemctl --user [start|stop|enable|disable|status|list-units] [service]' };
        }
        
        return { error: `systemctl: unknown command: ${command}` };
    }
    
    'systemd-analyze'(args) {
        if (args.length === 0 || args[0] === 'time') {
            return { output: `Startup finished in 1.234s (kernel) + 2.567s (initrd) + 5.890s (userspace) = 9.691s
graphical.target reached after 5.890s in userspace` };
        }
        
        if (args[0] === 'blame') {
            return { output: `          2.234s firewalld.service
          1.567s NetworkManager.service
          0.890s sshd.service
          0.456s chronyd.service
          0.234s systemd-journald.service` };
        }
        
        if (args[0] === 'critical-chain') {
            return { output: `The time when unit became active or started is printed after the "@" character.
The time the unit took to start is printed after the "+" character.

graphical.target @5.890s
└─multi-user.target @5.890s
  └─firewalld.service @3.656s +2.234s
    └─network.target @3.234s
      └─NetworkManager.service @1.667s +1.567s` };
        }
        
        return { error: `systemd-analyze: unknown command: ${args[0]}` };
    }
    
    'grub2-mkconfig'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'grub2-mkconfig: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['o']);
        const output = flags.o ? args[args.indexOf('-o') + 1] : '/boot/grub2/grub.cfg';
        
        return { output: `Generating grub configuration file ...\nFound linux image: /boot/vmlinuz-5.14.0-284.el9.x86_64\nFound initrd image: /boot/initramfs-5.14.0-284.el9.x86_64.img\ndone` };
    }
    
    'grub2-editenv'(args) {
        if (args.length === 0) {
            return { error: 'grub2-editenv: missing command' };
        }
        
        const subcommand = args[0];
        
        if (subcommand === 'list' || subcommand === '-') {
            return { output: `saved_entry=0\nkernelopts=root=/dev/mapper/rhel-root ro crashkernel=auto resume=/dev/mapper/rhel-swap rd.lvm.lv=rhel/root rd.lvm.lv=rhel/swap` };
        }
        
        if (subcommand === 'set') {
            if (this.fs.currentUid !== 0) {
                return { error: 'grub2-editenv: Permission denied' };
            }
            return { output: '' };
        }
        
        return { error: `grub2-editenv: unknown command: ${subcommand}` };
    }
    
    dracut(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'dracut: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['f', 'v']);
        
        return { output: `dracut: Executing: /usr/bin/dracut -f
dracut: *** Creating initramfs image file '/boot/initramfs-5.14.0-284.el9.x86_64.img' ***
dracut: *** Creating image file ***
dracut: *** Creating image file done ***
dracut: *** Creating initramfs image file '/boot/initramfs-5.14.0-284.el9.x86_64.img' done ***` };
    }
    
    df(args) {
        const flags = this.parseFlags(args, ['h', 'T']);
        
        if (flags.h) {
            return { output: `Filesystem                Size  Used Avail Use% Mounted on
devtmpfs                  886M     0  886M   0% /dev
tmpfs                     915M     0  915M   0% /dev/shm
tmpfs                     915M  8.5M  907M   1% /run
/dev/mapper/rhel-root      17G  4.2G   13G  25% /
/dev/sda1                1014M  234M  781M  24% /boot
tmpfs                     183M     0  183M   0% /run/user/0` };
        }
        
        return { output: `Filesystem              1K-blocks    Used Available Use% Mounted on
devtmpfs                   906752       0    906752   0% /dev
tmpfs                      936960       0    936960   0% /dev/shm
tmpfs                      936960    8704    928256   1% /run
/dev/mapper/rhel-root    17811456 4402176  13409280  25% /
/dev/sda1                 1038336  239616    798720  24% /boot
tmpfs                      187392       0    187392   0% /run/user/0` };
    }
    
    du(args) {
        const flags = this.parseFlags(args, ['h', 's', 'a']);
        const path = flags.args[0] || this.fs.currentPath;
        
        if (flags.h && flags.s) {
            return { output: `4.5M\t${path}` };
        }
        
        if (flags.s) {
            return { output: `4608\t${path}` };
        }
        
        return { output: `128\t${path}/subdir1\n256\t${path}/subdir2\n4608\t${path}` };
    }
    
    lsblk(args) {
        const flags = this.parseFlags(args, ['f', 'a']);
        
        return { output: `NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0   20G  0 disk
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   19G  0 part
  ├─rhel-root 253:0    0   17G  0 lvm  /
  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]
sr0            11:0    1 1024M  0 rom` };
    }
    
    blkid(args) {
        return { output: `/dev/sda1: UUID="12345678-1234-1234-1234-123456789abc" TYPE="xfs"
/dev/sda2: UUID="abcdef12-3456-7890-abcd-ef1234567890" TYPE="LVM2_member"
/dev/mapper/rhel-root: UUID="fedcba98-7654-3210-fedc-ba9876543210" TYPE="xfs"
/dev/mapper/rhel-swap: UUID="11111111-2222-3333-4444-555555555555" TYPE="swap"` };
    }
    
    // ===== LVM COMMANDS (Simulated) =====
    
    pvcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'pvcreate: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'pvcreate: Please enter a physical volume path' };
        }
        
        const device = args[0];
        
        // Initialize LVM metadata if not exists
        if (!this.lvmMetadata) {
            this.lvmMetadata = {
                physicalVolumes: {},
                volumeGroups: {},
                logicalVolumes: {}
            };
        }
        
        // Create physical volume
        this.lvmMetadata.physicalVolumes[device] = {
            name: device,
            vg: null,
            size: '10.00g',
            free: '10.00g',
            uuid: this.generateUUID()
        };
        
        return { output: `  Physical volume "${device}" successfully created.` };
    }
    
    pvs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.physicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = '  PV         VG     Fmt  Attr PSize  PFree \n';
        for (const [name, pv] of Object.entries(this.lvmMetadata.physicalVolumes)) {
            const vg = pv.vg || '';
            output += `  ${name.padEnd(10)} ${vg.padEnd(6)} lvm2 a--  ${pv.size.padEnd(6)} ${pv.free}\n`;
        }
        return { output };
    }
    
    pvdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.physicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [name, pv] of Object.entries(this.lvmMetadata.physicalVolumes)) {
            output.push(`  --- Physical volume ---
  PV Name               ${name}
  VG Name               ${pv.vg || ''}
  PV Size               ${pv.size}
  Allocatable           yes
  PE Size               4.00 MiB
  Total PE              2559
  Free PE               2559
  Allocated PE          0
  PV UUID               ${pv.uuid}\n`);
        }
        return { output: output.join('\n') };
    }
    
    vgcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'vgcreate: Permission denied' };
        }
        
        if (args.length < 2) {
            return { error: 'vgcreate: Please provide volume group name and physical volume(s)' };
        }
        
        const vgName = args[0];
        const pvs = args.slice(1);
        
        if (!this.lvmMetadata) {
            return { error: 'vgcreate: Physical volume(s) not found. Run pvcreate first.' };
        }
        
        // Check if all PVs exist
        for (const pv of pvs) {
            if (!this.lvmMetadata.physicalVolumes[pv]) {
                return { error: `vgcreate: Physical volume "${pv}" not found` };
            }
        }
        
        // Create volume group
        this.lvmMetadata.volumeGroups[vgName] = {
            name: vgName,
            pvs: pvs,
            size: '10.00g',
            free: '10.00g',
            lvCount: 0,
            uuid: this.generateUUID()
        };
        
        // Update PVs to reference this VG
        for (const pv of pvs) {
            this.lvmMetadata.physicalVolumes[pv].vg = vgName;
        }
        
        return { output: `  Volume group "${vgName}" successfully created` };
    }
    
    vgs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.volumeGroups).length === 0) {
            return { output: '' };
        }
        
        let output = '  VG     #PV #LV #SN Attr   VSize  VFree \n';
        for (const [name, vg] of Object.entries(this.lvmMetadata.volumeGroups)) {
            output += `  ${name.padEnd(6)} ${String(vg.pvs.length).padStart(3)} ${String(vg.lvCount).padStart(3)}   0 wz--n- ${vg.size.padEnd(6)} ${vg.free}\n`;
        }
        return { output };
    }
    
    vgdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.volumeGroups).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [name, vg] of Object.entries(this.lvmMetadata.volumeGroups)) {
            output.push(`  --- Volume group ---
  VG Name               ${name}
  System ID             
  Format                lvm2
  Metadata Areas        ${vg.pvs.length}
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                ${vg.lvCount}
  Open LV               0
  Max PV                0
  Cur PV                ${vg.pvs.length}
  Act PV                ${vg.pvs.length}
  VG Size               ${vg.size}
  PE Size               4.00 MiB
  Total PE              2559
  Alloc PE / Size       0 / 0   
  Free  PE / Size       2559 / ${vg.free}
  VG UUID               ${vg.uuid}\n`);
        }
        return { output: output.join('\n') };
    }
    
    lvcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvcreate: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'n']);
        
        let size = null;
        let name = null;
        let vgName = null;
        
        // Parse -L flag (size)
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                size = args[lIndex + 1];
            }
        }
        
        // Parse -n flag (name)
        if (flags.n) {
            const nIndex = args.indexOf('-n');
            if (nIndex !== -1 && args[nIndex + 1]) {
                name = args[nIndex + 1];
            }
        }
        
        // VG name is the last argument
        vgName = flags.args[flags.args.length - 1];
        
        if (!size || !name || !vgName) {
            return { error: 'lvcreate: Please specify size (-L), name (-n), and volume group' };
        }
        
        if (!this.lvmMetadata || !this.lvmMetadata.volumeGroups[vgName]) {
            return { error: `lvcreate: Volume group "${vgName}" not found` };
        }
        
        const lvPath = `/dev/${vgName}/${name}`;
        
        // Create logical volume
        this.lvmMetadata.logicalVolumes[lvPath] = {
            name: name,
            vg: vgName,
            size: size,
            path: lvPath,
            uuid: this.generateUUID()
        };
        
        this.lvmMetadata.volumeGroups[vgName].lvCount++;
        
        return { output: `  Logical volume "${name}" created.` };
    }
    
    lvs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.logicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = '  LV     VG     Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n';
        for (const [path, lv] of Object.entries(this.lvmMetadata.logicalVolumes)) {
            output += `  ${lv.name.padEnd(6)} ${lv.vg.padEnd(6)} -wi-a----- ${lv.size}\n`;
        }
        return { output };
    }
    
    lvdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.logicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [path, lv] of Object.entries(this.lvmMetadata.logicalVolumes)) {
            output.push(`  --- Logical volume ---
  LV Path                ${path}
  LV Name                ${lv.name}
  VG Name                ${lv.vg}
  LV UUID                ${lv.uuid}
  LV Write Access        read/write
  LV Creation host, time rhcsa-lab, ${new Date().toString()}
  LV Status              available
  # open                 0
  LV Size                ${lv.size}
  Current LE             512
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:2\n`);
        }
        return { output: output.join('\n') };
    }
    
    lvextend(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvextend: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'r']);
        
        if (flags.args.length === 0) {
            return { error: 'lvextend: Please specify logical volume path' };
        }
        
        const lvPath = flags.args[0];
        
        if (!this.lvmMetadata || !this.lvmMetadata.logicalVolumes[lvPath]) {
            return { error: `lvextend: Logical volume "${lvPath}" not found` };
        }
        
        let newSize = null;
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                newSize = args[lIndex + 1];
            }
        }
        
        if (!newSize) {
            return { error: 'lvextend: Please specify new size with -L' };
        }
        
        this.lvmMetadata.logicalVolumes[lvPath].size = newSize;
        
        if (flags.r) {
            return { output: `  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.\n  Filesystem also resized.` };
        }
        
        return { output: `  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
    }
    
    lvreduce(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvreduce: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'r', 'f']);
        
        if (flags.args.length === 0) {
            return { error: 'lvreduce: Please specify logical volume path' };
        }
        
        const lvPath = flags.args[0];
        
        if (!this.lvmMetadata || !this.lvmMetadata.logicalVolumes[lvPath]) {
            return { error: `lvreduce: Logical volume "${lvPath}" not found` };
        }
        
        let newSize = null;
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                newSize = args[lIndex + 1];
            }
        }
        
        if (!newSize) {
            return { error: 'lvreduce: Please specify new size with -L' };
        }
        
        if (!flags.f) {
            return { error: `WARNING: Reducing active logical volume to ${newSize}.\n  THIS MAY DESTROY YOUR DATA (filesystem etc.)\nDo you really want to reduce ${lvPath}? [y/n]: Operation cancelled.` };
        }
        
        this.lvmMetadata.logicalVolumes[lvPath].size = newSize;
        
        if (flags.r) {
            return { output: `  Filesystem resized.\n  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
        }
        
        return { output: `  WARNING: Reducing active logical volume to ${newSize}.\n  THIS MAY DESTROY YOUR DATA (filesystem etc.)\n  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
    }
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // ===== FILESYSTEM CREATION =====
    
    'mkfs.ext4'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'mkfs.ext4: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'mkfs.ext4: No device specified' };
        }
        
        const device = args[0];
        
        return { output: `mke2fs 1.46.5 (30-Dec-2021)
Creating filesystem with 2621440 4k blocks and 655360 inodes
Filesystem UUID: ${this.generateUUID()}
Superblock backups stored on blocks: 
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632

Allocating group tables: done                            
Writing inode tables: done                            
Creating journal (16384 blocks): done
Writing superblocks and filesystem accounting information: done` };
    }
    
    'mkfs.xfs'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'mkfs.xfs: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'mkfs.xfs: No device specified' };
        }
        
        const device = args[0];
        const flags = this.parseFlags(args, ['f']);
        
        return { output: `meta-data=${device}              isize=512    agcount=4, agsize=655360 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=1 inobtcount=1
data     =                       bsize=4096   blocks=2621440, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0` };
    }
    
    'mkfs.vfat'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'mkfs.vfat: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'mkfs.vfat: No device specified' };
        }
        
        const device = args[0];
        
        return { output: `mkfs.fat 4.2 (2021-01-31)
${device}: creating filesystem with 2621440 sectors (10 GB)` };
    }
    
    mkswap(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'mkswap: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'mkswap: No device specified' };
        }
        
        const device = args[0];
        
        // Initialize swap metadata if not exists
        if (!this.swapDevices) {
            this.swapDevices = {};
        }
        
        this.swapDevices[device] = {
            uuid: this.generateUUID(),
            size: '2 GiB',
            active: false
        };
        
        return { output: `Setting up swapspace version 1, size = 2 GiB (2147483648 bytes)
no label, UUID=${this.swapDevices[device].uuid}` };
    }
    
    swapon(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'swapon: Permission denied' };
        }
        
        if (args.length === 0) {
            // Show active swap
            if (!this.swapDevices || Object.keys(this.swapDevices).length === 0) {
                return { output: '' };
            }
            
            let output = 'NAME      TYPE      SIZE   USED PRIO\n';
            for (const [device, info] of Object.entries(this.swapDevices)) {
                if (info.active) {
                    output += `${device.padEnd(9)} partition ${info.size.padEnd(6)} 0B   -2\n`;
                }
            }
            return { output };
        }
        
        const device = args[0];
        
        if (!this.swapDevices) {
            this.swapDevices = {};
        }
        
        if (!this.swapDevices[device]) {
            return { error: `swapon: ${device}: read swap header failed` };
        }
        
        this.swapDevices[device].active = true;
        return { output: '' };
    }
    
    swapoff(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'swapoff: Permission denied' };
        }
        
        if (args.length === 0) {
            // Turn off all swap
            if (this.swapDevices) {
                for (const device in this.swapDevices) {
                    this.swapDevices[device].active = false;
                }
            }
            return { output: '' };
        }
        
        const device = args[0];
        
        if (!this.swapDevices || !this.swapDevices[device]) {
            return { error: `swapoff: ${device}: not found` };
        }
        
        this.swapDevices[device].active = false;
        return { output: '' };
    }
    
    mount(args) {
        if (args.length === 0) {
            return { output: `sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
devtmpfs on /dev type devtmpfs (rw,nosuid,size=906752k,nr_inodes=226688,mode=755)
/dev/mapper/rhel-root on / type xfs (rw,relatime,attr2,inode64,noquota)
/dev/sda1 on /boot type xfs (rw,relatime,attr2,inode64,noquota)` };
        }
        
        if (this.fs.currentUid !== 0) {
            return { error: 'mount: only root can do that' };
        }
        
        const device = args[0];
        const mountpoint = args[1];
        
        if (!device || !mountpoint) {
            return { error: 'mount: must specify device and mountpoint' };
        }
        
        return { output: '' };
    }
    
    umount(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'umount: only root can do that' };
        }
        
        if (args.length === 0) {
            return { error: 'umount: must specify mountpoint' };
        }
        
        return { output: '' };
    }
    
    findmnt(args) {
        const flags = this.parseFlags(args, ['t']);
        
        return { output: `TARGET                                SOURCE     FSTYPE     OPTIONS
/                                     /dev/mapper/rhel-root
                                                 xfs        rw,relatime,attr2,inode64,noquota
├─/sys                                sysfs      sysfs      rw,nosuid,nodev,noexec,relatime
├─/proc                               proc       proc       rw,nosuid,nodev,noexec,relatime
├─/dev                                devtmpfs   devtmpfs   rw,nosuid,size=906752k
└─/boot                               /dev/sda1  xfs        rw,relatime,attr2,inode64,noquota` };
    }
    
    lsof(args) {
        return { output: `COMMAND    PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
systemd      1 root  cwd    DIR  253,0     4096  128 /
systemd      1 root  txt    REG  253,0  1624520 1234 /usr/lib/systemd/systemd
sshd       234 root    3u  IPv4  12345      0t0  TCP *:22 (LISTEN)
httpd      456 root    4u  IPv4  23456      0t0  TCP *:80 (LISTEN)` };
    }
    
    fsck(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'fsck: Permission denied' };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'fsck: must specify device' };
        }
        
        return { output: `fsck from util-linux 2.37.4
e2fsck 1.46.5 (30-Dec-2021)
${device}: clean, 24567/65536 files, 123456/262144 blocks` };
    }
    
    'tune2fs'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'tune2fs: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l', 'c', 'm', 'i', 'L']);
        
        if (flags.l && args.length > 1) {
            const device = args[args.indexOf('-l') + 1] || args[args.length - 1];
            return { output: `tune2fs 1.46.5 (30-Dec-2021)
Filesystem volume name:   <none>
Last mounted on:          /
Filesystem UUID:          a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6
Filesystem magic number:  0xEF53
Filesystem revision #:    1 (dynamic)
Filesystem features:      has_journal ext_attr resize_inode dir_index filetype needs_recovery extent 64bit flex_bg sparse_super large_file huge_file dir_nlink extra_isize metadata_csum
Filesystem flags:         signed_directory_hash
Default mount options:    user_xattr acl
Filesystem state:         clean
Errors behavior:          Continue
Filesystem OS type:       Linux
Inode count:              65536
Block count:              262144
Reserved block count:     13107
Free blocks:              138688
Free inodes:              40969
First block:              0
Block size:               4096
Fragment size:            4096
Group descriptor size:    64
Reserved GDT blocks:      127
Blocks per group:         32768
Fragments per group:      32768
Inodes per group:         16384
Inode blocks per group:   1024
Flex block group size:    16
Filesystem created:       ${new Date().toUTCString()}
Last mount time:          ${new Date().toUTCString()}
Last write time:          ${new Date().toUTCString()}
Mount count:              12
Maximum mount count:      -1
Last checked:             ${new Date().toUTCString()}
Check interval:           0 (<none>)
Lifetime writes:          2048 MB
Reserved blocks uid:      0 (user root)
Reserved blocks gid:      0 (group root)
First inode:              11
Inode size:               256
Required extra isize:     32
Desired extra isize:      32
Journal inode:            8
Default directory hash:   half_md4
Directory Hash Seed:      12345678-90ab-cdef-1234-567890abcdef
Journal backup:           inode blocks` };
        }
        
        const device = args[args.length - 1];
        if (!device || device.startsWith('-')) {
            return { error: 'tune2fs: must specify device' };
        }
        
        return { output: `tune2fs 1.46.5 (30-Dec-2021)
Setting maximal mount count to -1` };
    }
    
    'xfs_repair'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'xfs_repair: Permission denied' };
        }
        
        const device = args[args.length - 1];
        if (!device || device.startsWith('-')) {
            return { error: 'xfs_repair: must specify device' };
        }
        
        return { output: `Phase 1 - find and verify superblock...
Phase 2 - using internal log
        - zero log...
        - scan filesystem freespace and inode maps...
        - found root inode chunk
Phase 3 - for each AG...
        - scan and clear agi unlinked lists...
        - process known inodes and perform inode discovery...
        - agno = 0
        - agno = 1
        - agno = 2
        - agno = 3
        - process newly discovered inodes...
Phase 4 - check for duplicate blocks...
        - setting up duplicate extent list...
        - check for inodes claiming duplicate blocks...
        - agno = 0
        - agno = 1
        - agno = 2
        - agno = 3
Phase 5 - rebuild AG headers and trees...
        - reset superblock...
Phase 6 - check inode connectivity...
        - resetting contents of realtime bitmap and summary inodes
        - traversing filesystem ...
        - traversal finished ...
        - moving disconnected inodes to lost+found ...
Phase 7 - verify and correct link counts...
done` };
    }
    
    'resize2fs'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'resize2fs: Permission denied' };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'resize2fs: must specify device' };
        }
        
        const size = args[1] || 'maximum';
        
        return { output: `resize2fs 1.46.5 (30-Dec-2021)
Resizing the filesystem on ${device} to ${size === 'maximum' ? '524288' : size} (4k) blocks.
The filesystem on ${device} is now ${size === 'maximum' ? '524288' : size} (4k) blocks long.` };
    }
    
    'xfs_growfs'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'xfs_growfs: Permission denied' };
        }
        
        const mountpoint = args[args.length - 1];
        if (!mountpoint || mountpoint.startsWith('-')) {
            return { error: 'xfs_growfs: must specify mountpoint' };
        }
        
        return { output: `meta-data=/dev/mapper/rhel-root isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=2560, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 262144 to 524288` };
    }
    
    crontab(args) {
        const flags = this.parseFlags(args, ['l', 'e', 'r', 'u']);
        
        if (!this.cronJobs) {
            this.cronJobs = {};
        }
        
        if (!this.cronJobs[this.fs.currentUser]) {
            this.cronJobs[this.fs.currentUser] = [];
        }
        
        // -l: List cron jobs
        if (flags.l) {
            const jobs = this.cronJobs[this.fs.currentUser];
            if (jobs.length === 0) {
                return { output: 'no crontab for ' + this.fs.currentUser };
            }
            return { output: jobs.join('\n') };
        }
        
        // -e: Edit crontab (simulated)
        if (flags.e) {
            return { output: `[Crontab editor for ${this.fs.currentUser}]\n# Add cron jobs in format:\n# * * * * * command\n# minute hour day month weekday command\n\n[Simulated - use "crontab -l" to list existing jobs]` };
        }
        
        // -r: Remove all cron jobs
        if (flags.r) {
            this.cronJobs[this.fs.currentUser] = [];
            return { output: '' };
        }
        
        // -u: Specify user (root only)
        if (flags.u) {
            if (this.fs.currentUid !== 0) {
                return { error: 'crontab: must be privileged to use -u' };
            }
            const user = flags.args[0];
            if (!this.fs.users[user]) {
                return { error: `crontab: user '${user}' unknown` };
            }
            if (!this.cronJobs[user]) {
                this.cronJobs[user] = [];
            }
            return { output: this.cronJobs[user].join('\n') || 'no crontab for ' + user };
        }
        
        return { output: 'usage: crontab [-l | -e | -r] [-u user]' };
    }
    
    at(args) {
        if (args.length === 0) {
            return { error: 'at: usage: at [-V] [-q queue] [-f file] [-mldbv] TIME' };
        }
        
        const time = args[0];
        
        if (!this.atJobs) {
            this.atJobs = [];
        }
        
        const jobId = this.atJobs.length + 1;
        this.atJobs.push({
            id: jobId,
            time: time,
            user: this.fs.currentUser,
            command: '[simulated command]'
        });
        
        return { output: `job ${jobId} at ${time}` };
    }
    
    atq(args) {
        if (!this.atJobs || this.atJobs.length === 0) {
            return { output: '' };
        }
        
        let output = '';
        for (const job of this.atJobs) {
            output += `${job.id}\t${job.time}\ta\t${job.user}\n`;
        }
        return { output };
    }
    
    atrm(args) {
        if (args.length === 0) {
            return { error: 'atrm: usage: atrm job [job...]' };
        }
        
        if (!this.atJobs) {
            this.atJobs = [];
        }
        
        const jobId = parseInt(args[0]);
        this.atJobs = this.atJobs.filter(job => job.id !== jobId);
        
        return { output: '' };
    }
    
    anacron(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'anacron: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['n', 's', 'f', 'u', 't']);
        
        if (flags.t) {
            return { output: `Anacron 2.3 started on ${new Date().toDateString()}
Normal exit (0 jobs run)` };
        }
        
        if (flags.n) {
            return { output: `Anacron 2.3 started on ${new Date().toDateString()}
Will run missed jobs now
Job \`cron.daily' started
Job \`cron.daily' terminated
Job \`cron.weekly' started
Job \`cron.weekly' terminated
Normal exit (2 jobs run)` };
        }
        
        if (flags.u) {
            return { output: `Updated timestamps for all jobs` };
        }
        
        return { output: `Anacron 2.3
Usage: anacron [-s] [-f] [-n] [-d] [-q] [-t anacrontab] [-S spooldir] [job]
       anacron [-S spooldir] -u [job]
       anacron [-V|-h]

  -s         Serialize execution of jobs
  -f         Force execution, ignore timestamps
  -n         Run jobs now, ignore delays
  -d         Don't fork to background
  -q         Suppress stderr messages
  -u         Update timestamps without running jobs
  -t <file>  Use alternative anacrontab
  -S <dir>   Select alternative spool directory
  -V         Print version and exit
  -h         Print this message and exit` };
    }
    
    cron(args) {
        return { output: `cron daemon information:
The cron daemon is managed by systemd.
Use: systemctl status crond
     systemctl start crond
     systemctl stop crond

Edit user cron jobs with: crontab -e
List user cron jobs with: crontab -l

System-wide cron jobs are in:
  /etc/crontab          - System crontab
  /etc/cron.d/          - System cron jobs
  /etc/cron.daily/      - Daily jobs
  /etc/cron.weekly/     - Weekly jobs
  /etc/cron.monthly/    - Monthly jobs` };
    }
    
    // ===== SELINUX =====
    
    getenforce(args) {
        return { output: this.selinuxMode.charAt(0).toUpperCase() + this.selinuxMode.slice(1) };
    }
    
    setenforce(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'setenforce: Permission denied' };
        }
        
        const mode = args[0];
        
        if (mode === '0' || mode === 'Permissive' || mode === 'permissive') {
            this.selinuxMode = 'permissive';
            return { output: '' };
        }
        
        if (mode === '1' || mode === 'Enforcing' || mode === 'enforcing') {
            this.selinuxMode = 'enforcing';
            return { output: '' };
        }
        
        return { error: `setenforce: invalid mode: ${mode}` };
    }
    
    chcon(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'chcon: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['t', 'u', 'r', 'R']);
        
        if (flags.args.length === 0) {
            return { error: 'chcon: missing file operand' };
        }
        
        // -t: Set type
        if (flags.t) {
            const typeIndex = args.indexOf('-t');
            if (typeIndex !== -1 && args[typeIndex + 1]) {
                const type = args[typeIndex + 1];
                const path = args[typeIndex + 2];
                
                const node = this.fs.getNode(path);
                if (!node) {
                    return { error: `chcon: cannot access '${path}': No such file or directory` };
                }
                
                if (!node.selinux) {
                    node.selinux = { user: 'unconfined_u', role: 'object_r', type: 'user_home_t' };
                }
                node.selinux.type = type;
                
                return { output: '' };
            }
        }
        
        // Full context: chcon user:role:type:level file
        if (flags.args.length >= 2 && flags.args[0].includes(':')) {
            const context = flags.args[0].split(':');
            const path = flags.args[1];
            
            const node = this.fs.getNode(path);
            if (!node) {
                return { error: `chcon: cannot access '${path}': No such file or directory` };
            }
            
            node.selinux = {
                user: context[0] || 'unconfined_u',
                role: context[1] || 'object_r',
                type: context[2] || 'user_home_t',
                level: context[3] || 's0'
            };
            
            return { output: '' };
        }
        
        return { error: 'chcon: missing operand' };
    }
    
    restorecon(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'restorecon: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['R', 'v']);
        
        if (flags.args.length === 0) {
            return { error: 'restorecon: missing file operand' };
        }
        
        const path = flags.args[0];
        const node = this.fs.getNode(path);
        
        if (!node) {
            return { error: `restorecon: cannot access '${path}': No such file or directory` };
        }
        
        // Restore default context based on file location
        const defaultContexts = {
            '/etc': 'system_u:object_r:etc_t:s0',
            '/home': 'unconfined_u:object_r:user_home_t:s0',
            '/var/www': 'system_u:object_r:httpd_sys_content_t:s0',
            '/tmp': 'system_u:object_r:tmp_t:s0'
        };
        
        let context = 'unconfined_u:object_r:user_home_t:s0';
        for (const [pathPrefix, ctx] of Object.entries(defaultContexts)) {
            if (path.startsWith(pathPrefix)) {
                context = ctx;
                break;
            }
        }
        
        const parts = context.split(':');
        node.selinux = {
            user: parts[0],
            role: parts[1],
            type: parts[2],
            level: parts[3]
        };
        
        if (flags.v) {
            return { output: `Relabeled ${path} from unconfined_u:object_r:user_tmp_t:s0 to ${context}` };
        }
        
        return { output: '' };
    }
    
    semanage(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'semanage: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'semanage: missing command' };
        }
        
        const object = args[0];
        
        // semanage port -l
        if (object === 'port') {
            if (args[1] === '-l' || args[1] === '--list') {
                return { output: `SELinux Port Type              Proto    Port Number\n\nhttp_port_t                    tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000\nssh_port_t                     tcp      22` };
            }
            
            // semanage port -a -t <type> -p <proto> <port>
            if (args[1] === '-a' || args[1] === '--add') {
                return { output: '' };
            }
        }
        
        // semanage fcontext -l
        if (object === 'fcontext') {
            if (args[1] === '-l' || args[1] === '--list') {
                return { output: `SELinux fcontext                  type               Context\n\n/.*                               all files          system_u:object_r:default_t:s0\n/etc/.*                           all files          system_u:object_r:etc_t:s0\n/var/www(/.*)?                    all files          system_u:object_r:httpd_sys_content_t:s0` };
            }
            
            // semanage fcontext -a -t <type> <path>
            if (args[1] === '-a' || args[1] === '--add') {
                return { output: '' };
            }
        }
        
        // semanage login -l
        if (object === 'login') {
            if (args[1] === '-l' || args[1] === '--list') {
                return { output: `Login Name           SELinux User         MLS/MCS Range        Service

__default__          unconfined_u         s0-s0:c0.c1023       *
root                 unconfined_u         s0-s0:c0.c1023       *
system_u             system_u             s0-s0:c0.c1023       *` };
            }
        }
        
        // semanage boolean -l
        if (object === 'boolean') {
            if (args[1] === '-l' || args[1] === '--list') {
                if (!this.selinuxBooleans) {
                    this.selinuxBooleans = {
                        'httpd_can_network_connect': false,
                        'httpd_can_network_connect_db': false,
                        'httpd_enable_cgi': true,
                        'httpd_enable_homedirs': false,
                        'ftp_home_dir': false,
                        'ssh_chroot_rw_homedirs': false,
                        'allow_ftpd_anon_write': false,
                        'allow_httpd_mod_auth_pam': false,
                        'selinuxuser_execstack': false,
                        'virt_use_nfs': false
                    };
                }
                
                let output = ['SELinux boolean                State  Default Description\n'];
                const descriptions = {
                    'httpd_can_network_connect': 'Allow httpd to connect to network',
                    'httpd_can_network_connect_db': 'Allow httpd to connect to database',
                    'httpd_enable_cgi': 'Enable CGI scripts in httpd',
                    'httpd_enable_homedirs': 'Allow httpd to access user home directories',
                    'ftp_home_dir': 'Allow ftp to read/write files in user home directories',
                    'ssh_chroot_rw_homedirs': 'Allow ssh to chroot to home directories',
                    'allow_ftpd_anon_write': 'Allow anonymous FTP write access',
                    'allow_httpd_mod_auth_pam': 'Allow httpd to use PAM authentication',
                    'selinuxuser_execstack': 'Allow user domains to execute from stack',
                    'virt_use_nfs': 'Allow virtual machines to use NFS'
                };
                
                for (const [name, value] of Object.entries(this.selinuxBooleans)) {
                    const state = value ? 'on' : 'off';
                    const desc = descriptions[name] || 'No description';
                    output.push(`${name.padEnd(35)} (${state.padEnd(3)} , ${state.padEnd(3)})  ${desc}`);
                }
                
                return { output: output.join('\n') };
            }
        }
        
        return { error: `semanage: unknown object: ${object}` };
    }
    
    sestatus(args) {
        const flags = this.parseFlags(args, ['v', 'b']);
        
        if (flags.b) {
            // Show SELinux booleans
            return { output: `SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   ${this.selinuxMode}
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33

Process contexts:
Current context:                unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
Init context:                   system_u:system_r:init_t:s0
/usr/sbin/sshd                  system_u:system_r:sshd_t:s0-s0:c0.c1023

File contexts:
Controlling terminal:           unconfined_u:object_r:user_devpts_t:s0
/etc/passwd                     system_u:object_r:passwd_file_t:s0
/etc/shadow                     system_u:object_r:shadow_t:s0` };
        }
        
        return { output: `SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   ${this.selinuxMode}
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33` };
    }
    
    getsebool(args) {
        const flags = this.parseFlags(args, ['a']);
        
        // Initialize SELinux booleans if not exists
        if (!this.selinuxBooleans) {
            this.selinuxBooleans = {
                'httpd_can_network_connect': false,
                'httpd_can_network_connect_db': false,
                'httpd_enable_cgi': true,
                'httpd_enable_homedirs': false,
                'ftp_home_dir': false,
                'ssh_chroot_rw_homedirs': false,
                'allow_ftpd_anon_write': false,
                'allow_httpd_mod_auth_pam': false,
                'selinuxuser_execstack': false,
                'virt_use_nfs': false
            };
        }
        
        // -a: Show all booleans
        if (flags.a) {
            let output = [];
            for (const [name, value] of Object.entries(this.selinuxBooleans)) {
                output.push(`${name} --> ${value ? 'on' : 'off'}`);
            }
            return { output: output.join('\n') };
        }
        
        // Show specific boolean
        if (flags.args.length > 0) {
            const boolName = flags.args[0];
            if (this.selinuxBooleans.hasOwnProperty(boolName)) {
                return { output: `${boolName} --> ${this.selinuxBooleans[boolName] ? 'on' : 'off'}` };
            } else {
                return { error: `getsebool: SELinux boolean ${boolName} does not exist` };
            }
        }
        
        return { error: 'getsebool: missing boolean name (use -a to show all)' };
    }
    
    setsebool(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'setsebool: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['P']);
        
        // Initialize SELinux booleans if not exists
        if (!this.selinuxBooleans) {
            this.selinuxBooleans = {
                'httpd_can_network_connect': false,
                'httpd_can_network_connect_db': false,
                'httpd_enable_cgi': true,
                'httpd_enable_homedirs': false,
                'ftp_home_dir': false,
                'ssh_chroot_rw_homedirs': false,
                'allow_ftpd_anon_write': false,
                'allow_httpd_mod_auth_pam': false,
                'selinuxuser_execstack': false,
                'virt_use_nfs': false
            };
        }
        
        if (flags.args.length < 2) {
            return { error: 'usage: setsebool [ -P ] boolean value' };
        }
        
        const boolName = flags.args[0];
        const value = flags.args[1];
        
        if (!this.selinuxBooleans.hasOwnProperty(boolName)) {
            return { error: `setsebool: SELinux boolean ${boolName} does not exist` };
        }
        
        if (value !== 'on' && value !== 'off' && value !== '1' && value !== '0') {
            return { error: `setsebool: illegal value ${value}` };
        }
        
        this.selinuxBooleans[boolName] = (value === 'on' || value === '1');
        
        if (flags.P) {
            return { output: `[SELinux boolean ${boolName} set persistently to ${value}]` };
        }
        
        return { output: '' };
    }
    
    journalctl(args) {
        const flags = this.parseFlags(args, ['u', 'f', 'n', 'b', 'p', 'x', 'e']);
        
        // -u: Filter by unit
        if (flags.u) {
            const unitIndex = args.indexOf('-u');
            if (unitIndex !== -1 && args[unitIndex + 1]) {
                const unit = args[unitIndex + 1];
                return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 10:00:00 rhcsa-lab systemd[1]: Starting ${unit}...\nDec 05 10:00:01 rhcsa-lab ${unit}[1234]: Started successfully\nDec 05 10:00:01 rhcsa-lab systemd[1]: Started ${unit}.` };
            }
        }
        
        // -f: Follow (tail -f style)
        if (flags.f) {
            return { output: '[Following journal... Press Ctrl+C to stop]\nDec 05 12:00:00 rhcsa-lab systemd[1]: Started Session 1 of user root.' };
        }
        
        // -n: Number of lines
        if (flags.n) {
            const lines = flags.args[0] || '10';
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 11:59:50 rhcsa-lab systemd[1]: Started Session 1 of user root.\nDec 05 11:59:55 rhcsa-lab sshd[234]: Accepted publickey for root from 192.168.1.1\nDec 05 12:00:00 rhcsa-lab cron[567]: (root) CMD (run-parts /etc/cron.hourly)` };
        }
        
        // -b: Boot messages
        if (flags.b) {
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 09:00:00 rhcsa-lab kernel: Linux version 5.14.0-284.el9.x86_64\nDec 05 09:00:01 rhcsa-lab systemd[1]: Reached target Basic System.\nDec 05 09:00:02 rhcsa-lab systemd[1]: Started Network Manager.` };
        }
        
        // -p: Priority level
        if (flags.p) {
            const priority = flags.args[0];
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 11:00:00 rhcsa-lab systemd[1]: Failed to start some-service.\nDec 05 11:30:00 rhcsa-lab kernel: Out of memory: Kill process 1234.` };
        }
        
        // -x: Add explanatory help texts
        if (flags.x) {
            return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 10:00:00 rhcsa-lab systemd[1]: Starting Network Manager...\n-- Subject: A start job for unit NetworkManager.service has begun execution` };
        }
        
        // Default: Show all logs
        return { output: `-- Journal begins at Thu 2024-12-05 09:00:00 UTC, ends at Thu 2024-12-05 12:00:00 UTC. --\nDec 05 09:00:00 rhcsa-lab kernel: Linux version 5.14.0-284.el9.x86_64\nDec 05 09:00:01 rhcsa-lab systemd[1]: Reached target Basic System.\nDec 05 10:00:00 rhcsa-lab sshd[234]: Server listening on 0.0.0.0 port 22.\nDec 05 11:00:00 rhcsa-lab cron[567]: (root) CMD (run-parts /etc/cron.hourly)\nDec 05 12:00:00 rhcsa-lab systemd[1]: Started Session 1 of user root.` };
    }
    
    ausearch(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'ausearch: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['m', 'ts', 'te']);
        
        // -m: Message type
        if (flags.m) {
            const msgType = flags.args[0];
            return { output: `----\ntime->Thu Dec  5 10:00:00 2024\ntype=${msgType.toUpperCase()} msg=audit(1701774000.000:100): avc:  denied  { read } for  pid=1234 comm="httpd" name="index.html" scontext=system_u:system_r:httpd_t:s0 tcontext=unconfined_u:object_r:user_home_t:s0 tclass=file permissive=0` };
        }
        
        return { output: 'ausearch: no events found' };
    }
    
    // ===== NETWORKING =====
    
    ip(args) {
        if (args.length === 0) {
            return { error: 'ip: missing command' };
        }
        
        const subcommand = args[0];
        
        // ip addr show / ip a
        if (subcommand === 'addr' || subcommand === 'a' || subcommand === 'address') {
            if (args[1] === 'show' || args.length === 1) {
                // Show all interfaces
                let output = [];
                let index = 1;
                
                for (const [ifname, ifdata] of Object.entries(this.networkInterfaces)) {
                    const flags = ifname === 'lo' ? '<LOOPBACK,UP,LOWER_UP>' : '<BROADCAST,MULTICAST,UP,LOWER_UP>';
                    output.push(`${index}: ${ifname}: ${flags} mtu ${ifname === 'lo' ? '65536' : '1500'} qdisc noqueue state ${ifdata.state} group default qlen 1000`);
                    output.push(`    link/ether ${ifdata.mac} brd ff:ff:ff:ff:ff:ff`);
                    output.push(`    inet ${ifdata.ipv4} ${ifname === 'lo' ? 'scope host' : 'brd ' + this.calculateBroadcast(ifdata.ipv4) + ' scope global'} ${ifname}`);
                    output.push(`       valid_lft forever preferred_lft forever`);
                    index++;
                }
                
                return { output: output.join('\n') };
            }
            
            // ip addr add <IP> dev <interface>
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                const ipAddr = args[2];
                const devIndex = args.indexOf('dev');
                
                if (!ipAddr || devIndex === -1 || !args[devIndex + 1]) {
                    return { error: 'ip addr add: missing address or device' };
                }
                
                const iface = args[devIndex + 1];
                
                if (!this.networkInterfaces[iface]) {
                    return { error: `Cannot find device "${iface}"` };
                }
                
                this.networkInterfaces[iface].ipv4 = ipAddr;
                return { output: '' };
            }
            
            // ip addr del <IP> dev <interface>
            if (args[1] === 'del' || args[1] === 'delete') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                return { output: '' };
            }
        }
        
        // ip link show / ip l
        if (subcommand === 'link' || subcommand === 'l') {
            let output = [];
            let index = 1;
            
            for (const [ifname, ifdata] of Object.entries(this.networkInterfaces)) {
                const flags = ifname === 'lo' ? '<LOOPBACK,UP,LOWER_UP>' : '<BROADCAST,MULTICAST,UP,LOWER_UP>';
                output.push(`${index}: ${ifname}: ${flags} mtu ${ifname === 'lo' ? '65536' : '1500'} qdisc noqueue state ${ifdata.state} mode DEFAULT group default qlen 1000`);
                output.push(`    link/ether ${ifdata.mac} brd ff:ff:ff:ff:ff:ff`);
                index++;
            }
            
            return { output: output.join('\n') };
        }
        
        // ip route show / ip r
        if (subcommand === 'route' || subcommand === 'r') {
            // ip route add
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'RTNETLINK answers: Operation not permitted' };
                }
                
                const network = args[2];
                const viaIndex = args.indexOf('via');
                const devIndex = args.indexOf('dev');
                
                if (!network) {
                    return { error: 'ip route add: missing network' };
                }
                
                // Initialize routes if not exists
                if (!this.staticRoutes) {
                    this.staticRoutes = [];
                }
                
                const route = { network };
                
                if (viaIndex !== -1 && args[viaIndex + 1]) {
                    route.via = args[viaIndex + 1];
                }
                
                if (devIndex !== -1 && args[devIndex + 1]) {
                    route.dev = args[devIndex + 1];
                }
                
                this.staticRoutes.push(route);
                return { output: '' };
            }
            
            // ip route show
            const gateway = this.networkInterfaces.eth0.gateway || '192.168.1.1';
            const network = this.calculateNetwork(this.networkInterfaces.eth0.ipv4);
            let output = `default via ${gateway} dev eth0 proto dhcp metric 100\n${network} dev eth0 proto kernel scope link src ${this.networkInterfaces.eth0.ipv4.split('/')[0]} metric 100`;
            
            // Add static routes
            if (this.staticRoutes && this.staticRoutes.length > 0) {
                for (const route of this.staticRoutes) {
                    let routeLine = route.network;
                    if (route.via) routeLine += ` via ${route.via}`;
                    if (route.dev) routeLine += ` dev ${route.dev}`;
                    output += '\n' + routeLine;
                }
            }
            
            return { output };
        }
        
        return { error: `ip: unknown command: ${subcommand}` };
    }
    
    traceroute(args) {
        if (args.length === 0) {
            return { error: 'traceroute: missing host' };
        }
        
        const host = args[0];
        
        return { output: `traceroute to ${host} (93.184.216.34), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  1.234 ms  1.189 ms  1.156 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.645 ms  5.612 ms
 3  172.16.0.1 (172.16.0.1)  12.345 ms  12.312 ms  12.289 ms
 4  * * *
 5  93.184.216.1 (93.184.216.1)  23.456 ms  23.423 ms  23.390 ms
 6  ${host} (93.184.216.34)  25.678 ms  25.645 ms  25.612 ms` };
    }
    
    calculateBroadcast(cidr) {
        const [ip, mask] = cidr.split('/');
        const parts = ip.split('.');
        const maskNum = parseInt(mask);
        const lastOctet = Math.pow(2, 32 - maskNum) - 1;
        return `${parts[0]}.${parts[1]}.${parts[2]}.255`;
    }
    
    calculateNetwork(cidr) {
        const [ip, mask] = cidr.split('/');
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/${mask}`;
    }
    
    nmcli(args) {
        if (args.length === 0) {
            return { error: 'nmcli: missing command' };
        }
        
        // nmcli connection show
        if (args[0] === 'connection' || args[0] === 'con' || args[0] === 'c') {
            if (args[1] === 'show') {
                return { output: `NAME    UUID                                  TYPE      DEVICE\neth0    5fb06bd0-0bb0-7ffb-45f1-d6edd65f3e03  ethernet  eth0` };
            }
            
            // nmcli con add
            if (args[1] === 'add') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const typeIndex = args.indexOf('type');
                const ifnameIndex = args.indexOf('ifname');
                const conNameIndex = args.indexOf('con-name');
                
                if (typeIndex === -1 || !args[typeIndex + 1]) {
                    return { error: 'Error: missing connection type' };
                }
                
                const type = args[typeIndex + 1];
                const ifname = ifnameIndex !== -1 ? args[ifnameIndex + 1] : 'eth1';
                const conName = conNameIndex !== -1 ? args[conNameIndex + 1] : ifname;
                
                return { output: `Connection '${conName}' (${this.generateUUID()}) successfully added.` };
            }
            
            // nmcli con up/down
            if (args[1] === 'up') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                if (!connection) {
                    return { error: 'Error: missing connection name' };
                }
                
                return { output: `Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)` };
            }
            
            if (args[1] === 'down') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                if (!connection) {
                    return { error: 'Error: missing connection name' };
                }
                
                return { output: `Connection '${connection}' successfully deactivated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)` };
            }
            
            // nmcli con mod <connection> ipv4.addresses <IP>
            if (args[1] === 'mod' || args[1] === 'modify') {
                if (this.fs.currentUid !== 0) {
                    return { error: 'Error: Operation not permitted' };
                }
                
                const connection = args[2];
                const property = args[3];
                const value = args[4];
                
                if (!connection || !property || !value) {
                    return { error: 'nmcli: missing arguments' };
                }
                
                if (property === 'ipv4.addresses' && this.networkInterfaces[connection]) {
                    this.networkInterfaces[connection].ipv4 = value;
                    return { output: `Connection '${connection}' successfully updated.` };
                }
                
                if (property.startsWith('ipv4.')) {
                    return { output: `Connection '${connection}' successfully updated.` };
                }
                
                return { error: `Error: unknown property: '${property}'` };
            }
        }
        
        // nmcli device show
        if (args[0] === 'device' || args[0] === 'dev' || args[0] === 'd') {
            return { output: `GENERAL.DEVICE:                         eth0
GENERAL.TYPE:                           ethernet
GENERAL.HWADDR:                         52:54:00:12:34:56
GENERAL.MTU:                            1500
GENERAL.STATE:                          100 (connected)
IP4.ADDRESS[1]:                         ${this.networkInterfaces.eth0.ipv4}
IP4.GATEWAY:                            ${this.networkInterfaces.eth0.gateway || '192.168.1.1'}` };
        }
        
        return { error: `nmcli: unknown command: ${args[0]}` };
    }
    
    ping(args) {
        if (args.length === 0) {
            return { error: 'ping: missing host operand' };
        }
        
        const host = args[0];
        return { output: `PING ${host} (192.168.1.1) 56(84) bytes of data.
64 bytes from ${host} (192.168.1.1): icmp_seq=1 ttl=64 time=0.234 ms
64 bytes from ${host} (192.168.1.1): icmp_seq=2 ttl=64 time=0.189 ms
64 bytes from ${host} (192.168.1.1): icmp_seq=3 ttl=64 time=0.201 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.189/0.208/0.234/0.018 ms` };
    }
    
    hostname(args) {
        if (args.length === 0) {
            return { output: this.hostname };
        }
        
        if (this.fs.currentUid !== 0) {
            return { error: 'hostname: you must be root to change the hostname' };
        }
        
        this.hostname = args[0];
        return { output: '' };
    }
    
    ifconfig(args) {
        // ifconfig is legacy, redirect to ip addr
        return this.ip(['addr']);
    }
    
    'firewall-cmd'(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'Authorization failed.' };
        }
        
        if (!this.firewallZones) {
            this.firewallZones = {
                'public': {
                    services: ['ssh', 'dhcpv6-client'],
                    ports: [],
                    default: true
                },
                'trusted': {
                    services: [],
                    ports: [],
                    default: false
                }
            };
        }
        
        const flags = this.parseFlags(args, ['permanent', 'reload']);
        
        // --list-all
        if (args.includes('--list-all')) {
            const zone = args.includes('--zone') ? args[args.indexOf('--zone') + 1] : 'public';
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            const z = this.firewallZones[zone];
            return { output: `${zone}${z.default ? ' (active)' : ''}\n  target: default\n  icmp-block-inversion: no\n  interfaces: eth0\n  sources:\n  services: ${z.services.join(' ')}\n  ports: ${z.ports.join(' ')}\n  protocols:\n  forward: no\n  masquerade: no\n  forward-ports:\n  source-ports:\n  icmp-blocks:\n  rich rules:` };
        }
        
        // --get-zones
        if (args.includes('--get-zones')) {
            return { output: Object.keys(this.firewallZones).join(' ') };
        }
        
        // --get-default-zone
        if (args.includes('--get-default-zone')) {
            for (const [zone, data] of Object.entries(this.firewallZones)) {
                if (data.default) return { output: zone };
            }
            return { output: 'public' };
        }
        
        // --set-default-zone=<zone>
        if (args.some(arg => arg.startsWith('--set-default-zone='))) {
            const zone = args.find(arg => arg.startsWith('--set-default-zone=')).split('=')[1];
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            for (const z in this.firewallZones) {
                this.firewallZones[z].default = (z === zone);
            }
            return { output: 'success' };
        }
        
        // --add-service=<service>
        if (args.some(arg => arg.startsWith('--add-service='))) {
            const service = args.find(arg => arg.startsWith('--add-service=')).split('=')[1];
            const zone = args.includes('--zone') ? args[args.indexOf('--zone') + 1] : 'public';
            
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            if (!this.firewallZones[zone].services.includes(service)) {
                this.firewallZones[zone].services.push(service);
            }
            return { output: 'success' };
        }
        
        // --remove-service=<service>
        if (args.some(arg => arg.startsWith('--remove-service='))) {
            const service = args.find(arg => arg.startsWith('--remove-service=')).split('=')[1];
            const zone = args.includes('--zone') ? args[args.indexOf('--zone') + 1] : 'public';
            
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            this.firewallZones[zone].services = this.firewallZones[zone].services.filter(s => s !== service);
            return { output: 'success' };
        }
        
        // --add-port=<port/protocol>
        if (args.some(arg => arg.startsWith('--add-port='))) {
            const port = args.find(arg => arg.startsWith('--add-port=')).split('=')[1];
            const zone = args.includes('--zone') ? args[args.indexOf('--zone') + 1] : 'public';
            
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            if (!this.firewallZones[zone].ports.includes(port)) {
                this.firewallZones[zone].ports.push(port);
            }
            return { output: 'success' };
        }
        
        // --remove-port=<port/protocol>
        if (args.some(arg => arg.startsWith('--remove-port='))) {
            const port = args.find(arg => arg.startsWith('--remove-port=')).split('=')[1];
            const zone = args.includes('--zone') ? args[args.indexOf('--zone') + 1] : 'public';
            
            if (!this.firewallZones[zone]) {
                return { error: `Error: INVALID_ZONE: ${zone}` };
            }
            
            this.firewallZones[zone].ports = this.firewallZones[zone].ports.filter(p => p !== port);
            return { output: 'success' };
        }
        
        // --reload
        if (args.includes('--reload')) {
            return { output: 'success' };
        }
        
        return { error: 'firewall-cmd: invalid option' };
    }
    
    ss(args) {
        const flags = this.parseFlags(args, ['t', 'u', 'l', 'n', 'p', 'a']);
        
        // ss -tunlp (most common)
        let output = 'Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process\n';
        
        if (flags.t || flags.a) {
            output += 'tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*          users:(("sshd",pid=234,fd=3))\n';
            output += 'tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*          users:(("httpd",pid=456,fd=4))\n';
            output += 'tcp    ESTAB   0       0       192.168.1.100:22      192.168.1.1:54321  users:(("sshd",pid=789,fd=3))\n';
        }
        
        if (flags.u || flags.a) {
            output += 'udp    UNCONN  0       0       0.0.0.0:68            0.0.0.0:*          users:(("dhclient",pid=123,fd=6))\n';
        }
        
        return { output };
    }
    
    curl(args) {
        if (args.length === 0) {
            return { error: 'curl: try \'curl --help\' for more information' };
        }
        
        const flags = this.parseFlags(args, ['I', 'o', 'O', 'L', 's', 'v']);
        const url = flags.args[0];
        
        if (!url) {
            return { error: 'curl: no URL specified' };
        }
        
        // -I: Fetch headers only
        if (flags.I) {
            return { output: `HTTP/1.1 200 OK\nServer: nginx/1.20.1\nDate: ${new Date().toUTCString()}\nContent-Type: text/html\nContent-Length: 612\nConnection: keep-alive` };
        }
        
        // Simulate fetching content
        return { output: `<!DOCTYPE html>\n<html>\n<head><title>Simulated Page</title></head>\n<body><h1>This is a simulated curl response for ${url}</h1></body>\n</html>` };
    }
    
    wget(args) {
        if (args.length === 0) {
            return { error: 'wget: missing URL' };
        }
        
        const flags = this.parseFlags(args, ['O', 'q', 'c']);
        const url = flags.args[0];
        
        if (!url) {
            return { error: 'wget: missing URL' };
        }
        
        // Extract filename
        const filename = url.split('/').pop() || 'index.html';
        
        // Create simulated file
        const parent = this.fs.getNode(this.fs.currentPath);
        parent.children[filename] = {
            type: 'file',
            content: `[Downloaded content from ${url}]`,
            size: 1024,
            permissions: '0644',
            owner: this.fs.currentUser,
            group: this.fs.currentUser,
            modified: new Date()
        };
        
        if (!flags.q) {
            return { output: `--${new Date().toISOString()}--  ${url}\nResolving host...\nConnecting to host... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1024 (1.0K) [text/html]\nSaving to: '${filename}'\n\n${filename}   100%[==================>]   1.00K  --.-KB/s    in 0s\n\n${new Date().toISOString()} (12.3 MB/s) - '${filename}' saved [1024/1024]` };
        }
        
        return { output: '' };
    }
    
    rsync(args) {
        if (args.length < 2) {
            return { error: 'rsync: missing source or destination' };
        }
        
        const flags = this.parseFlags(args, ['a', 'v', 'z', 'r', 'n', 'u', 'delete', 'progress']);
        
        if (flags.args.length < 2) {
            return { error: 'rsync: must specify source and destination' };
        }
        
        const source = flags.args[0];
        const dest = flags.args[1];
        
        // Simulate dry-run
        if (flags.n) {
            return { output: `sending incremental file list\nfile1.txt\nfile2.txt\nfile3.txt\n\nsent 234 bytes  received 45 bytes  558.00 bytes/sec\ntotal size is 12,345  speedup is 44.24 (DRY RUN)` };
        }
        
        // Simulate verbose output
        if (flags.v) {
            return { output: `sending incremental file list\nfile1.txt\nfile2.txt\nfile3.txt\n\nsent 12,567 bytes  received 234 bytes  25,602.00 bytes/sec\ntotal size is 12,345  speedup is 0.96` };
        }
        
        // Basic rsync
        return { output: `sent 12,567 bytes  received 234 bytes  8,534.00 bytes/sec\ntotal size is 12,345  speedup is 0.96` };
    }
    
    fdisk(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'fdisk: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l']);
        
        if (flags.l) {
            return { output: `Disk /dev/sda: 20 GiB, 21474836480 bytes, 41943040 sectors
Disk model: Virtual Disk    
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x12345678

Device     Boot   Start      End  Sectors  Size Id Type
/dev/sda1  *       2048  2099199  2097152    1G 83 Linux
/dev/sda2       2099200 41943039 39843840   19G 8e Linux LVM


Disk /dev/sdb: 10 GiB, 10737418240 bytes, 20971520 sectors
Disk model: Virtual Disk    
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes` };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'fdisk: must specify device' };
        }
        
        return { output: `Welcome to fdisk (util-linux 2.37.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help):` };
    }
    
    parted(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'parted: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l']);
        
        if (flags.l) {
            return { output: `Model: VMware Virtual disk (scsi)
Disk /dev/sda: 21.5GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  1075MB  1074MB  primary  xfs          boot
 2      1075MB  21.5GB  20.4GB  primary               lvm


Model: VMware Virtual disk (scsi)
Disk /dev/sdb: 10.7GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:` };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'parted: must specify device' };
        }
        
        return { output: `GNU Parted 3.5
Using ${device}
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted)` };
    }
    
    netstat(args) {
        // netstat is deprecated, redirect to ss
        return this.ss(args);
    }
    
    dig(args) {
        if (args.length === 0) {
            return { error: 'dig: missing domain name' };
        }
        
        const domain = args[0];
        const recordType = args[1] || 'A';
        
        return { output: `; <<>> DiG 9.16.23-RH <<>> ${domain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;${domain}.			IN	A

;; ANSWER SECTION:
${domain}.		300	IN	A	93.184.216.34

;; Query time: 23 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: ${new Date().toString()}
;; MSG SIZE  rcvd: 56` };
    }
    
    nslookup(args) {
        if (args.length === 0) {
            return { error: 'nslookup: missing domain name' };
        }
        
        const domain = args[0];
        
        return { output: `Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	${domain}
Address: 93.184.216.34` };
    }
    
    host(args) {
        if (args.length === 0) {
            return { error: 'host: missing domain name' };
        }
        
        const domain = args[0];
        
        return { output: `${domain} has address 93.184.216.34\n${domain} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946\n${domain} mail is handled by 10 mail.${domain}.` };
    }
    
    sysctl(args) {
        const flags = this.parseFlags(args, ['a', 'w', 'p']);
        
        // Initialize kernel parameters if not exists
        if (!this.kernelParams) {
            this.kernelParams = {
                'kernel.hostname': 'rhcsa-lab',
                'kernel.ostype': 'Linux',
                'kernel.osrelease': '5.14.0-362.24.1.el9_3.x86_64',
                'kernel.pid_max': '4194304',
                'net.ipv4.ip_forward': '0',
                'net.ipv4.tcp_syncookies': '1',
                'net.ipv6.conf.all.disable_ipv6': '0',
                'vm.swappiness': '30',
                'vm.dirty_ratio': '20',
                'fs.file-max': '9223372036854775807'
            };
        }
        
        // -a: Display all parameters
        if (flags.a) {
            let output = [];
            for (const [key, value] of Object.entries(this.kernelParams).sort()) {
                output.push(`${key} = ${value}`);
            }
            return { output: output.join('\n') };
        }
        
        // -w: Write value (requires root)
        if (flags.w) {
            if (this.fs.currentUid !== 0) {
                return { error: 'sysctl: setting key requires root' };
            }
            
            const wIndex = args.indexOf('-w');
            if (wIndex !== -1 && args[wIndex + 1]) {
                const assignment = args[wIndex + 1];
                const [key, value] = assignment.split('=');
                if (key && value) {
                    this.kernelParams[key.trim()] = value.trim();
                    return { output: `${key.trim()} = ${value.trim()}` };
                }
            }
            return { error: 'sysctl: malformed assignment' };
        }
        
        // -p: Load settings from /etc/sysctl.conf
        if (flags.p) {
            return { output: '[Loaded sysctl settings from /etc/sysctl.conf]' };
        }
        
        // Show specific parameter
        if (flags.args.length > 0) {
            const key = flags.args[0];
            if (this.kernelParams.hasOwnProperty(key)) {
                return { output: `${key} = ${this.kernelParams[key]}` };
            } else {
                return { error: `sysctl: cannot stat /proc/sys/${key.replace(/\\./g, '/')}: No such file or directory` };
            }
        }
        
        return { error: 'sysctl: no variables specified' };
    }
    
    // ===== NFS & REMOTE FILESYSTEMS =====
    
    showmount(args) {
        const flags = this.parseFlags(args, ['e', 'a']);
        
        if (flags.e) {
            const server = flags.args[0] || 'localhost';
            return { output: `Export list for ${server}:
/nfs/shared    192.168.1.0/24
/nfs/data      *(rw,sync,no_root_squash)
/home          10.0.0.0/8(rw,sync)` };
        }
        
        if (flags.a) {
            return { output: `All mount points on localhost:
192.168.1.10:/nfs/shared
192.168.1.10:/nfs/data
192.168.1.20:/home` };
        }
        
        return { output: `Hosts on localhost:\n192.168.1.10\n192.168.1.20` };
    }
    
    exportfs(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'exportfs: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['a', 'r', 'u', 'v']);
        
        if (flags.a && flags.r) {
            return { output: `exporting *:/nfs/shared
exporting 192.168.1.0/24:/nfs/data
exporting 10.0.0.0/8:/home` };
        }
        
        if (flags.v) {
            return { output: `/nfs/shared     192.168.1.0/24(rw,sync,wdelay,hide,nocrossmnt,secure,root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,root_squash,no_all_squash)
/nfs/data       *(rw,sync,wdelay,hide,nocrossmnt,secure,no_root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,no_root_squash,no_all_squash)
/home           10.0.0.0/8(rw,sync,wdelay,hide,nocrossmnt,secure,root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,root_squash,no_all_squash)` };
        }
        
        return { output: `/nfs/shared\t192.168.1.0/24\n/nfs/data\t*(rw,sync,no_root_squash)\n/home\t\t10.0.0.0/8(rw,sync)` };
    }
    
    tzselect(args) {
        return { output: `Please identify a location so that time zone rules can be set correctly.
Please select a continent, ocean, "coord", or "TZ".
 1) Africa
 2) Americas
 3) Antarctica
 4) Asia
 5) Atlantic Ocean
 6) Australia
 7) Europe
 8) Indian Ocean
 9) Pacific Ocean
10) coord - I want to use geographical coordinates.
11) TZ - I want to specify the timezone using the Posix TZ format.
#? [Selection required - interactive mode simulated]

Current timezone: America/New_York (EST5EDT)
To change timezone, use: timedatectl set-timezone <timezone>` };
    }
    
    htop(args) {
        return { output: `htop - Interactive process viewer
[Use 'top' command for process monitoring in this simulator]

  CPU[|||                                                  5.2%]   Tasks: 127, 453 thr; 1 running
  Mem[||||||||||||||||                                 987M/3.7G]   Load average: 0.15 0.08 0.03 
  Swp[                                                   0K/2.0G]   Uptime: 12 days, 08:34:21

    PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
      1 root       20   0  173M 13.6M  8.7M S  0.0  0.4  0:03.45 /usr/lib/systemd/systemd --switched-root --system
    234 root       20   0  220M 12.3M  9.8M S  0.0  0.3  0:01.23 /usr/sbin/sshd -D
    456 apache     20   0  185M 45.6M  7.8M S  2.0  1.2  1:23.45 /usr/sbin/httpd -DFOREGROUND
    789 mysql      20   0 1234M  234M 23.4M S  5.0  6.2  5:12.34 /usr/sbin/mysqld

F1Help F2Setup F3Search F4Filter F5Tree F6SortBy F7Nice F8Nice+ F9Kill F10Quit` };
    }
    
    autofs(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'autofs: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['v', 'V']);
        
        if (flags.V) {
            return { output: `Linux automount version 5.1.8` };
        }
        
        if (args[0] === 'status') {
            return { output: `● autofs.service - Automounts filesystems on demand
   Loaded: loaded (/usr/lib/systemd/system/autofs.service; enabled; vendor preset: disabled)
   Active: active (running) since ${new Date().toUTCString()}
 Main PID: 1234 (automount)
   Status: "1 mount (1 unimplemented), 1 expire"
    Tasks: 4
   Memory: 1.2M
   CGroup: /system.slice/autofs.service
           └─1234 /usr/sbin/automount --foreground --dont-check-daemon

Auto-mount points:
  /misc (auto.misc)
  /net (auto.net)` };
        }
        
        if (args[0] === 'start') {
            return { output: `Starting automount...
Loaded autofs maps from /etc/auto.master
Started automount daemon` };
        }
        
        if (args[0] === 'stop') {
            return { output: `Stopping automount daemon...
Unmounting auto-mounted filesystems
Stopped automount` };
        }
        
        if (args[0] === 'restart' || args[0] === 'reload') {
            return { output: `Reloading automount configuration...
Re-reading map configuration from /etc/auto.master
Configuration reloaded` };
        }
        
        return { output: `Usage: autofs {start|stop|restart|reload|status}
       autofs -V

Automounter daemon for on-demand mounting of filesystems.
Configuration files:
  /etc/auto.master      - Master map
  /etc/auto.misc        - Miscellaneous mounts
  /etc/auto.net         - Network mounts

Managed by systemd: systemctl {start|stop|status} autofs` };
    }
    
    // ===== TEXT EDITORS =====
    
    vi(args, stdin = '') {
        return this.vim(args, stdin);
    }
    
    vim(args, stdin = '') {
        // Parse arguments
        const filename = args[0];
        
        if (!filename) {
            return { output: '', error: 'vim: Missing filename\nUsage: vim <filename>' };
        }
        
        // Resolve path
        const fullPath = this.fs.resolvePath(filename);
        
        // Check if file exists and read content
        let content = '';
        const fileNode = this.fs.getNode(fullPath);
        
        if (fileNode) {
            if (fileNode.type === 'directory') {
                return { output: '', error: `vim: ${filename}: Is a directory` };
            }
            
            // Check read permission
            if (!this.fs.checkPermission(fileNode, 'r')) {
                return { output: '', error: `vim: ${filename}: Permission denied` };
            }
            
            content = fileNode.content || '';
        }
        
        // Open editor (needs window.terminal reference)
        if (typeof window !== 'undefined' && window.terminal) {
            window.terminal.openEditor('vim', fullPath, content);
            return { output: '', error: '' };
        }
        
        return { output: '', error: 'vim: Editor not available' };
    }
    
    nano(args, stdin = '') {
        // Parse arguments
        const filename = args[0];
        
        if (!filename) {
            return { output: '', error: 'nano: Missing filename\nUsage: nano <filename>' };
        }
        
        // Resolve path
        const fullPath = this.fs.resolvePath(filename);
        
        // Check if file exists and read content
        let content = '';
        const fileNode = this.fs.getNode(fullPath);
        
        if (fileNode) {
            if (fileNode.type === 'directory') {
                return { output: '', error: `nano: ${filename}: Is a directory` };
            }
            
            // Check read permission
            if (!this.fs.checkPermission(fileNode, 'r')) {
                return { output: '', error: `nano: ${filename}: Permission denied` };
            }
            
            content = fileNode.content || '';
        }
        
        // Open editor (needs window.terminal reference)
        if (typeof window !== 'undefined' && window.terminal) {
            window.terminal.openEditor('nano', fullPath, content);
            return { output: '', error: '' };
        }
        
        return { output: '', error: 'nano: Editor not available' };
    }
    
    // ===== SHELL SCRIPTING =====
    
    bash(args, stdin = '') {
        if (args.length === 0) {
            return { output: '', error: 'bash: Interactive mode not supported in browser. Use: bash script.sh' };
        }
        
        // Handle -c flag (execute command string)
        if (args[0] === '-c') {
            const code = args.slice(1).join(' ');
            return this.executeBashCode(code, ['bash', '-c']);
        }
        
        // Execute script file
        const scriptPath = args[0];
        const scriptArgs = args;
        
        return this.executeBashFile(scriptPath, scriptArgs);
    }
    
    source(args, stdin = '') {
        if (args.length === 0) {
            return { output: '', error: 'source: filename argument required\nUsage: source filename [arguments]' };
        }
        
        const scriptPath = args[0];
        const scriptArgs = args;
        
        // Source executes in current shell context
        return this.executeBashFile(scriptPath, scriptArgs);
    }
    
    // Dot command (alias for source)
    '.'(args, stdin = '') {
        return this.source(args, stdin);
    }
    
    executeBashFile(filepath, args) {
        // Check if bash interpreter is available
        if (typeof BashInterpreter === 'undefined') {
            return { output: '', error: 'bash: Interpreter not loaded' };
        }
        
        // Create interpreter instance
        const interpreter = new BashInterpreter(this, this.fs);
        
        // Execute file (async, but we'll handle it synchronously for now)
        // In a real implementation, this would be async
        try {
            // For now, execute synchronously (we'd need to refactor terminal.js for async)
            const result = this.syncExecuteBashFile(interpreter, filepath, args);
            return result;
        } catch (error) {
            return { output: '', error: `bash: ${error.message}` };
        }
    }
    
    syncExecuteBashFile(interpreter, filepath, args) {
        // Resolve path
        const fullPath = this.fs.resolvePath(filepath);
        const fileNode = this.fs.getNode(fullPath);
        
        if (!fileNode) {
            return { output: '', error: `bash: ${filepath}: No such file or directory` };
        }
        
        if (fileNode.type !== 'file') {
            return { output: '', error: `bash: ${filepath}: Is a directory` };
        }
        
        // Check if executable (for ./ execution)
        if (filepath.startsWith('./') && !this.fs.checkPermission(fileNode, 'x')) {
            return { output: '', error: `bash: ${filepath}: Permission denied` };
        }
        
        // Execute script
        const code = fileNode.content;
        return this.executeBashCode(code, args);
    }
    
    executeBashCode(code, args = ['bash']) {
        if (typeof BashInterpreter === 'undefined') {
            return { output: '', error: 'bash: Interpreter not loaded' };
        }
        
        try {
            // Save current script args
            const savedArgs = this.scriptArgs;
            this.scriptArgs = args;
            
            // Lexer
            const lexer = new BashLexer(code);
            const tokens = lexer.tokenize();
            
            // Parser
            const parser = new BashParser(tokens);
            const ast = parser.parse();
            
            // Executor
            const executor = new BashExecutor(this, this.fs);
            
            // Execute synchronously (simplified - real version would be async)
            let output = '';
            let error = '';
            let exitCode = 0;
            
            // Execute program body
            for (const stmt of ast.body) {
                const result = this.executeASTNode(executor, stmt);
                output += result.output;
                error += result.error;
                exitCode = result.exitCode;
                this.lastExitCode = exitCode;
            }
            
            // Restore script args
            this.scriptArgs = savedArgs;
            
            return { output, error, exitCode };
        } catch (error) {
            return { output: '', error: `bash: ${error.message}` };
        }
    }
    
    executeASTNode(executor, node) {
        // Synchronous execution wrapper
        // This is a simplified version - full async would be better
        try {
            if (node.type === 'Command') {
                const expandedArgs = [];
                for (const arg of node.args) {
                    expandedArgs.push(this.expandVariables(arg));
                }
                
                if (expandedArgs.length > 0) {
                    const cmdName = expandedArgs[0];
                    const cmdArgs = expandedArgs.slice(1);
                    
                    // Check for assignment
                    if (cmdName.includes('=')) {
                        const [varName, ...valueParts] = cmdName.split('=');
                        const value = valueParts.join('=');
                        this.env[varName] = value;
                        executor.variables[varName] = value;
                        return { output: '', error: '', exitCode: 0 };
                    }
                    
                    // Execute command
                    const result = this.executeCommand(cmdName, cmdArgs);
                    return {
                        output: result.output || result.stdout || '',
                        error: result.error || result.stderr || '',
                        exitCode: result.exitCode !== undefined ? result.exitCode : (result.error ? 1 : 0)
                    };
                }
            }
            
            // For other node types, use executor (this is simplified)
            return { output: '', error: `bash: Unsupported statement type: ${node.type}`, exitCode: 1 };
        } catch (error) {
            return { output: '', error: `bash: ${error.message}`, exitCode: 1 };
        }
    }
    
    // ===== PROCESS MANAGEMENT =====
    
    ps(args) {
        const flags = this.parseFlags(args, ['a', 'u', 'x', 'e', 'f', 'Z']);
        
        // Header
        let header = 'PID   USER     CPU  MEM  COMMAND';
        if (flags.Z) {
            header = 'LABEL                                                     PID   USER     CPU  MEM  COMMAND';
        }
        
        let output = [header];
        
        for (const proc of this.processes) {
            let line = `${String(proc.pid).padEnd(5)} ${proc.user.padEnd(8)} ${proc.cpu.toFixed(1)}  ${proc.mem.toFixed(1)}  ${proc.command}`;
            
            if (flags.Z) {
                const ctx = proc.selinux || { user: 'unconfined_u', role: 'unconfined_r', type: 'unconfined_t', level: 's0-s0:c0.c1023' };
                const selinuxLabel = `${ctx.user}:${ctx.role}:${ctx.type}:${ctx.level}`;
                line = `${selinuxLabel.padEnd(57)} ${String(proc.pid).padEnd(5)} ${proc.user.padEnd(8)} ${proc.cpu.toFixed(1)}  ${proc.mem.toFixed(1)}  ${proc.command}`;
            }
            
            output.push(line);
        }
        
        return { output: output.join('\n') };
    }
    
    top(args) {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const upDays = Math.floor(Math.random() * 30) + 1;
        const upHours = Math.floor(Math.random() * 24);
        const upMins = Math.floor(Math.random() * 60);
        return { output: `top - ${time} up ${upDays} days, ${upHours}:${upMins.toString().padStart(2, '0')},  1 user,  load average: 0.15, 0.08, 0.03
Tasks: 127 total,   1 running, 126 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.3 us,  0.7 sy,  0.0 ni, 97.8 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3789.7 total,   1245.2 free,    987.4 used,   1557.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2556.8 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0  173844  13928   8932 S   0.0   0.4   0:03.45 systemd
    234 root      20   0   15296   5124   3456 S   0.0   0.1   0:00.23 sshd
    567 root      20   0  621304  24576  16384 S   0.0   0.6   0:01.12 firewalld
    890 chrony    20   0   89764   3456   2816 S   0.0   0.1   0:00.34 chronyd
   1234 root      20   0  243652  12288   8192 S   0.0   0.3   0:00.67 rsyslogd
   1456 root      20   0  224568   8192   6144 S   0.0   0.2   0:00.45 NetworkManager

[Press q to quit (simulated)]` };
    }
    
    kill(args) {
        if (args.length === 0) {
            return { error: 'kill: missing operand' };
        }
        
        const pid = parseInt(args[0]);
        const proc = this.processes.find(p => p.pid === pid);
        
        if (!proc) {
            return { error: `kill: (${pid}) - No such process` };
        }
        
        if (proc.user !== this.fs.currentUser && this.fs.currentUid !== 0) {
            return { error: `kill: (${pid}) - Operation not permitted` };
        }
        
        this.processes = this.processes.filter(p => p.pid !== pid);
        return { output: '' };
    }
    
    free(args) {
        const flags = this.parseFlags(args, ['h', 'm', 'g', 'k']);
        
        // Human readable
        if (flags.h) {
            return { output: `               total        used        free      shared  buff/cache   available
Mem:           3.7Gi       963Mi       1.2Gi        24Mi       1.5Gi       2.5Gi
Swap:          2.0Gi         0Bi       2.0Gi` };
        }
        
        // Megabytes
        if (flags.m) {
            return { output: `               total        used        free      shared  buff/cache   available
Mem:            3790         963        1245          24        1557        2557
Swap:           2048           0        2048` };
        }
        
        // Default: kilobytes
        return { output: `               total        used        free      shared  buff/cache   available
Mem:         3881472      986624     1275136       24576     1595392     2618368
Swap:        2097152           0     2097152` };
    }
    
    uptime(args) {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const upDays = Math.floor(Math.random() * 30) + 1;
        const upHours = Math.floor(Math.random() * 24);
        const upMins = Math.floor(Math.random() * 60);
        const load1 = (Math.random() * 0.5).toFixed(2);
        const load5 = (Math.random() * 0.3).toFixed(2);
        const load15 = (Math.random() * 0.2).toFixed(2);
        return { output: ` ${time} up ${upDays} days, ${upHours}:${upMins.toString().padStart(2, '0')},  1 user,  load average: ${load1}, ${load5}, ${load15}` };
    }
    
    vmstat(args) {
        const interval = args[0] || '';
        
        return { output: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 1048576 102400 421888    0    0     5    10   50  100  1  1 98  0  0` };
    }
    
    iostat(args) {
        const flags = this.parseFlags(args, ['x', 'c', 'd', 'h']);
        
        return { output: `Linux 5.14.0-284.el9.x86_64 (rhcsa-lab)     ${new Date().toLocaleDateString()}     _x86_64_    (2 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.25    0.00    0.15    0.05    0.00   99.55

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
sda               1.23        12.34        23.45         0.00     123456     234567          0
sdb               0.45         4.56         5.67         0.00      45678      56789          0` };
    }
    
    sar(args) {
        return { output: `Linux 5.14.0-284.el9.x86_64 (rhcsa-lab)     ${new Date().toLocaleDateString()}     _x86_64_    (2 CPU)

${new Date().toTimeString().split(' ')[0]}     CPU     %user     %nice   %system   %iowait    %steal     %idle
${new Date().toTimeString().split(' ')[0]}     all      0.25      0.00      0.15      0.05      0.00     99.55
Average:        all      0.25      0.00      0.15      0.05      0.00     99.55` };
    }
    
    nice(args) {
        if (args.length === 0) {
            return { error: 'nice: missing operand' };
        }
        
        const flags = this.parseFlags(args, ['n']);
        const niceness = flags.n ? (args[1] || '10') : '10';
        const command = flags.args.join(' ');
        
        return { output: `[Running '${command}' with niceness ${niceness}]` };
    }
    
    renice(args) {
        if (args.length < 2) {
            return { error: 'renice: missing operand' };
        }
        
        const priority = args[0];
        const pid = args[1];
        
        return { output: `${pid} (process ID) old priority 0, new priority ${priority}` };
    }
    
    // ===== HELP & UTILITY =====
    
    help(args) {
        return { stdout: `RHCSA Practice Terminal - Available Commands:

FILE OPERATIONS:
  ls, cd, pwd, mkdir, touch, cat, rm, cp, mv, ln
  chmod, chown, chgrp, umask

TEXT PROCESSING:
  grep, head, tail, wc, sort, uniq, cut
  sed, awk, find

TEXT EDITORS:
  vi, vim, nano - Full-featured modal and simple text editors

SHELL SCRIPTING:
  bash script.sh - Execute bash script with full interpreter
  ./script.sh - Execute script (requires executable permission)
  source, . - Source script in current shell
  if/then/else/fi, for/in/do/done, while, until, case/esac
  test, [ ], [[ ]] - Test conditions
  function, return, break, continue
  export, local, declare, readonly, eval, shift

ARCHIVES & COMPRESSION:
  tar, gzip, gunzip, bzip2, bunzip2, zip, unzip

I/O REDIRECTION:
  >      Redirect stdout to file (overwrite)
  >>     Redirect stdout to file (append)
  2>     Redirect stderr to file
  &>     Redirect both stdout and stderr to file
  <      Redirect file content as stdin
  |      Pipe stdout to next command

ENVIRONMENT & VARIABLES:
  echo, env, export, printenv, unset, set
  $VAR   Variable expansion
  \${VAR} Variable expansion (alternate syntax)

USER MANAGEMENT:
  useradd, userdel, usermod, passwd, groupadd, groupdel
  id, whoami, su, sudo

PACKAGE MANAGEMENT:
  dnf (install, remove, list), yum, rpm

SYSTEM SERVICES:
  systemctl (start, stop, enable, disable, status)
  journalctl, systemd-analyze

PROCESS MANAGEMENT:
  ps, top, kill, nice, renice

NETWORKING:
  ip, ping, hostname, nmcli, firewall-cmd, ss

STORAGE & LVM:
  fdisk, parted, lsblk, df, du
  pvcreate, vgcreate, lvcreate, lvextend
  mkfs, mount, umount, blkid

SELINUX:
  getenforce, setenforce, ls -Z, chcon, restorecon
  semanage, getsebool, setsebool

SYSTEM INFO:
  uname, uptime, date, timedatectl, hostnamectl

OTHER:
  man, help, clear, history, exit

Type 'man <command>' for detailed help on a specific command.
Type 'man redirection' for I/O redirection examples.
Type 'man variables' for environment variable usage.
Type 'scenarios' for practice exercises.`, exitCode: 0 };
    }
    
    man(args, stdin = '') {
        if (args.length === 0) {
            return { stderr: 'What manual page do you want?', exitCode: 1 };
        }
        
        const cmd = args[0];
        const manPages = {
            'ls': 'LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs (the current directory by default).\n\nOPTIONS\n       -a, --all\n              do not ignore entries starting with .\n\n       -l     use a long listing format\n\n       -h, --human-readable\n              with -l, print sizes in human readable format',
            'cp': 'CP(1)\n\nNAME\n       cp - copy files and directories\n\nSYNOPSIS\n       cp [OPTION]... SOURCE... DEST\n\nDESCRIPTION\n       Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.\n\nOPTIONS\n       -r, -R, --recursive\n              copy directories recursively\n\n       -v, --verbose\n              explain what is being done\n\n       -p     preserve mode, ownership, and timestamps\n\nEXAMPLES\n       cp file1 file2\n              Copy file1 to file2\n\n       cp -r dir1 dir2\n              Copy directory dir1 to dir2',
            'mv': 'MV(1)\n\nNAME\n       mv - move (rename) files\n\nSYNOPSIS\n       mv [OPTION]... SOURCE... DEST\n\nDESCRIPTION\n       Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.\n\nOPTIONS\n       -v, --verbose\n              explain what is being done\n\n       -f, --force\n              do not prompt before overwriting\n\nEXAMPLES\n       mv file1 file2\n              Rename file1 to file2\n\n       mv file1 dir/\n              Move file1 to directory dir',
            'ln': 'LN(1)\n\nNAME\n       ln - make links between files\n\nSYNOPSIS\n       ln [OPTION]... TARGET LINK_NAME\n\nDESCRIPTION\n       Create a link to TARGET with the name LINK_NAME.\n       By default, creates hard links. Use -s for symbolic links.\n\nOPTIONS\n       -s, --symbolic\n              make symbolic links instead of hard links\n\n       -v, --verbose\n              print name of each linked file\n\n       -f, --force\n              remove existing destination files\n\nEXAMPLES\n       ln file1 file2\n              Create hard link file2 to file1\n\n       ln -s /path/to/file link\n              Create symbolic link named link',
            'chmod': 'CHMOD(1)\n\nNAME\n       chmod - change file mode bits\n\nSYNOPSIS\n       chmod [OPTION]... MODE FILE...\n\nDESCRIPTION\n       Change the mode of each FILE to MODE.\n\nEXAMPLES\n       chmod 755 file\n              Set rwxr-xr-x permissions\n\n       chmod u+x file\n              Add execute permission for owner',
            'systemctl': 'SYSTEMCTL(1)\n\nNAME\n       systemctl - Control the systemd system and service manager\n\nSYNOPSIS\n       systemctl [COMMAND] [UNIT]\n\nCOMMANDS\n       start UNIT\n              Start (activate) one or more units\n\n       stop UNIT\n              Stop (deactivate) one or more units\n\n       enable UNIT\n              Enable one or more unit files\n\n       status UNIT\n              Show runtime status of one or more units',
            'echo': 'ECHO(1)\n\nNAME\n       echo - display a line of text\n\nSYNOPSIS\n       echo [OPTION]... [STRING]...\n\nDESCRIPTION\n       Echo the STRING(s) to standard output.\n\nOPTIONS\n       -n     do not output the trailing newline\n\n       -e     enable interpretation of backslash escapes\n\n       -E     disable interpretation of backslash escapes (default)\n\nEXAMPLES\n       echo "Hello World"\n              Display text\n\n       echo $HOME\n              Display value of HOME variable\n\n       echo -n "No newline"\n              Display text without newline\n\n       echo -e "Line1\\nLine2"\n              Display text with newline escape',
            'export': 'EXPORT(1)\n\nNAME\n       export - set export attribute for variables\n\nSYNOPSIS\n       export [name[=value] ...]\n\nDESCRIPTION\n       The  shell  marks each name to be passed to child processes\n       in the environment.\n\nEXAMPLES\n       export VAR=value\n              Set and export variable\n\n       export PATH=/new/path:$PATH\n              Prepend to PATH variable\n\n       export\n              Display all exported variables',
            'grep': 'GREP(1)\n\nNAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep [OPTION]... PATTERN [FILE]\n\nDESCRIPTION\n       Search for PATTERN in FILE or standard input.\n\nOPTIONS\n       -i     ignore case distinctions\n\n       -v     invert match (select non-matching lines)\n\n       -n     prefix output with line numbers\n\n       -c     count matching lines\n\nEXAMPLES\n       grep error log.txt\n              Find lines containing "error"\n\n       grep -i ERROR log.txt\n              Case-insensitive search\n\n       cat file | grep pattern\n              Search in piped input',
            'head': 'HEAD(1)\n\nNAME\n       head - output the first part of files\n\nSYNOPSIS\n       head [OPTION]... [FILE]\n\nDESCRIPTION\n       Print the first 10 lines of FILE to standard output.\n\nOPTIONS\n       -n NUM output the first NUM lines\n\nEXAMPLES\n       head file.txt\n              Show first 10 lines\n\n       head -n 5 file.txt\n              Show first 5 lines\n\n       cat file | head -n 20\n              Show first 20 lines from pipe',
            'tail': 'TAIL(1)\n\nNAME\n       tail - output the last part of files\n\nSYNOPSIS\n       tail [OPTION]... [FILE]\n\nDESCRIPTION\n       Print the last 10 lines of FILE to standard output.\n\nOPTIONS\n       -n NUM output the last NUM lines\n       -f     follow file (not supported in simulation)\n\nEXAMPLES\n       tail file.txt\n              Show last 10 lines\n\n       tail -n 20 file.txt\n              Show last 20 lines',
            'wc': 'WC(1)\n\nNAME\n       wc - print newline, word, and byte counts\n\nSYNOPSIS\n       wc [OPTION]... [FILE]\n\nDESCRIPTION\n       Print line, word, and byte counts for FILE.\n\nOPTIONS\n       -l     print the line counts\n       -w     print the word counts\n       -c     print the byte counts\n\nEXAMPLES\n       wc file.txt\n              Count lines, words, bytes\n\n       wc -l file.txt\n              Count only lines\n\n       cat file | wc -w\n              Count words from pipe',
            'sort': 'SORT(1)\n\nNAME\n       sort - sort lines of text files\n\nSYNOPSIS\n       sort [OPTION]... [FILE]\n\nDESCRIPTION\n       Sort lines of text alphabetically.\n\nOPTIONS\n       -r     reverse sort order\n       -n     compare according to numerical value\n       -u     output only unique lines\n\nEXAMPLES\n       sort file.txt\n              Sort alphabetically\n\n       sort -n numbers.txt\n              Sort numerically\n\n       sort -u file.txt\n              Sort and remove duplicates',
            'uniq': 'UNIQ(1)\n\nNAME\n       uniq - report or omit repeated lines\n\nSYNOPSIS\n       uniq [OPTION]... [FILE]\n\nDESCRIPTION\n       Filter adjacent matching lines from FILE.\n\nOPTIONS\n       -c     prefix lines by occurrence count\n       -d     only print duplicate lines\n       -u     only print unique lines\n\nEXAMPLES\n       uniq file.txt\n              Remove adjacent duplicates\n\n       sort file.txt | uniq\n              Remove all duplicates\n\n       uniq -c file.txt\n              Count occurrences',
            'cut': 'CUT(1)\n\nNAME\n       cut - remove sections from lines of files\n\nSYNOPSIS\n       cut [OPTION]... [FILE]\n\nDESCRIPTION\n       Print selected parts of lines from FILE.\n\nOPTIONS\n       -d DELIM    use DELIM as field delimiter\n       -f LIST     select only these fields\n       -c LIST     select only these characters\n\nEXAMPLES\n       cut -d: -f1 /etc/passwd\n              Extract first field (username)\n\n       cut -c1-10 file.txt\n              Extract characters 1-10\n\n       cat file | cut -d, -f2,4\n              Extract fields 2 and 4',
            'tar': 'TAR(1)\n\nNAME\n       tar - tape archiver\n\nSYNOPSIS\n       tar [OPTION]... [FILE]...\n\nDESCRIPTION\n       Create, list, or extract tar archives.\n\nOPTIONS\n       -c     create archive\n       -x     extract archive\n       -t     list archive contents\n       -z     compress with gzip\n       -v     verbose output\n       -f     specify archive filename\n\nEXAMPLES\n       tar -czf archive.tar.gz files\n              Create compressed archive\n\n       tar -xzf archive.tar.gz\n              Extract compressed archive\n\n       tar -tzf archive.tar.gz\n              List archive contents',
            'gzip': 'GZIP(1)\n\nNAME\n       gzip - compress files\n\nSYNOPSIS\n       gzip [OPTION]... [FILE]...\n\nDESCRIPTION\n       Compress files using Lempel-Ziv coding (LZ77).\n       Each file is replaced by one with .gz extension.\n\nOPTIONS\n       -d     decompress (same as gunzip)\n       -k     keep original files\n       -v     verbose mode\n       -1 to -9   compression level (1=fast, 9=best)\n\nEXAMPLES\n       gzip file.txt\n              Compress file.txt to file.txt.gz\n\n       gzip -k file.txt\n              Compress but keep original\n\n       gzip -9 file.txt\n              Maximum compression\n\n       gzip -d file.txt.gz\n              Decompress (same as gunzip)',
            'gunzip': 'GUNZIP(1)\n\nNAME\n       gunzip - decompress files\n\nSYNOPSIS\n       gunzip [OPTION]... [FILE]...\n\nDESCRIPTION\n       Decompress files compressed with gzip.\n       Each file is replaced by decompressed version.\n\nOPTIONS\n       -k     keep compressed files\n       -v     verbose mode\n\nEXAMPLES\n       gunzip file.txt.gz\n              Decompress to file.txt\n\n       gunzip -k file.txt.gz\n              Decompress but keep .gz file\n\n       gunzip *.gz\n              Decompress all .gz files',
            'bzip2': 'BZIP2(1)\n\nNAME\n       bzip2 - compress files using Burrows-Wheeler algorithm\n\nSYNOPSIS\n       bzip2 [OPTION]... [FILE]...\n\nDESCRIPTION\n       Compress files using Burrows-Wheeler block sorting.\n       Better compression than gzip but slower.\n       Each file is replaced by one with .bz2 extension.\n\nOPTIONS\n       -d     decompress (same as bunzip2)\n       -k     keep original files\n       -v     verbose mode\n       -z     force compression\n\nEXAMPLES\n       bzip2 file.txt\n              Compress file.txt to file.txt.bz2\n\n       bzip2 -k file.txt\n              Compress but keep original\n\n       bzip2 -d file.txt.bz2\n              Decompress (same as bunzip2)',
            'bunzip2': 'BUNZIP2(1)\n\nNAME\n       bunzip2 - decompress files\n\nSYNOPSIS\n       bunzip2 [OPTION]... [FILE]...\n\nDESCRIPTION\n       Decompress files compressed with bzip2.\n       Each file is replaced by decompressed version.\n\nOPTIONS\n       -k     keep compressed files\n       -v     verbose mode\n\nEXAMPLES\n       bunzip2 file.txt.bz2\n              Decompress to file.txt\n\n       bunzip2 -k file.txt.bz2\n              Decompress but keep .bz2 file\n\n       bunzip2 *.bz2\n              Decompress all .bz2 files',
            'zip': 'ZIP(1)\n\nNAME\n       zip - package and compress files\n\nSYNOPSIS\n       zip [OPTIONS] archive.zip files...\n\nDESCRIPTION\n       Create ZIP archives compatible with Windows and other systems.\n\nOPTIONS\n       -r     recurse into directories\n       -v     verbose mode\n       -q     quiet mode\n\nEXAMPLES\n       zip archive.zip file1 file2\n              Create archive with files\n\n       zip -r backup.zip /home/user\n              Archive directory recursively\n\n       zip -q archive.zip *.txt\n              Quietly archive all .txt files',
            'unzip': 'UNZIP(1)\n\nNAME\n       unzip - extract compressed files\n\nSYNOPSIS\n       unzip [OPTIONS] archive.zip\n\nDESCRIPTION\n       Extract files from ZIP archives.\n\nOPTIONS\n       -l     list archive contents without extracting\n       -v     verbose mode\n       -q     quiet mode\n\nEXAMPLES\n       unzip archive.zip\n              Extract all files\n\n       unzip -l archive.zip\n              List contents without extracting\n\n       unzip -q backup.zip\n              Quietly extract files',
            'variables': 'BASH VARIABLES(1)\n\nNAME\n       Shell Variables - environment and variable expansion\n\nDESCRIPTION\n       Variables store data that can be used by the shell and commands.\n       Environment variables are passed to child processes.\n\nVARIABLE EXPANSION\n       $VAR or ${VAR}\n              Expand to the value of VAR\n\n       ${VAR:-default}\n              Use default if VAR is unset (not yet implemented)\n\n       ${VAR:=default}\n              Assign default if VAR is unset (not yet implemented)\n\nCOMMAND SUBSTITUTION\n       $(command)\n              Execute command and substitute its output\n              The trailing newline is removed\n\n       Examples:\n              echo "Current dir: $(pwd)"\n              files=$(ls)\n              echo "User: $(whoami) in $(pwd)"\n\nCOMMON ENVIRONMENT VARIABLES\n       PATH   Directories to search for commands\n       HOME   User\'s home directory\n       USER   Current username\n       PWD    Current working directory\n       OLDPWD Previous working directory\n       SHELL  Path to user\'s shell\n       HOSTNAME   System hostname\n       LANG   Locale settings\n\nEXAMPLES\n       echo $HOME\n              Display home directory\n\n       echo "User is $USER"\n              Use variable in string\n\n       cd $HOME\n              Change to home directory\n\n       export MYVAR="hello"\n              Create and export variable\n\n       echo $MYVAR\n              Display variable value\n\n       echo "I am in $(pwd)"\n              Use command substitution\n\n       export CURRENT_USER=$(whoami)\n              Store command output in variable\n\nCOMMANDS\n       export VAR=value   Set and export variable\n       unset VAR          Remove variable\n       env                Display all environment variables\n       printenv VAR       Display specific variable',
            'redirection': 'BASH REDIRECTION(1)\n\nNAME\n       I/O Redirection - redirect input and output\n\nDESCRIPTION\n       Redirection allows commands to read from and write to files,\n       or chain commands together.\n\nOPERATORS\n       >      Redirect stdout to file (overwrite)\n              Example: ls > files.txt\n\n       >>     Redirect stdout to file (append)\n              Example: echo "line" >> log.txt\n\n       2>     Redirect stderr to file\n              Example: command 2> errors.txt\n\n       &>     Redirect both stdout and stderr to file\n              Example: command &> output.txt\n\n       <      Redirect file as stdin\n              Example: grep pattern < file.txt\n\n       |      Pipe stdout to next command\n              Example: cat file.txt | grep pattern\n\nEXAMPLES\n       ls -l > listing.txt\n              Save directory listing to file\n\n       cat file1.txt file2.txt > combined.txt\n              Combine files into one\n\n       grep error log.txt 2> /dev/null\n              Search but suppress error messages\n\n       ls | grep txt\n              List files and filter for .txt files\n\n       cat file.txt | grep pattern | sort\n              Chain multiple commands together'
        };
        
        if (manPages[cmd]) {
            return { stdout: manPages[cmd], exitCode: 0 };
        }
        
        return { stdout: `No manual entry for ${cmd}\n\n[Simulated man page - not all commands have full documentation]`, exitCode: 0 };
    }
    
    clear(args) {
        return { stdout: '', exitCode: 0, clearScreen: true };
    }
    
    history(args) {
        return { stdout: this.commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n'), exitCode: 0 };
    }
    
    whoami(args) {
        return { stdout: this.fs.currentUser, exitCode: 0 };
    }
    
    id(args) {
        const flags = this.parseFlags(args, ['Z']);
        const user = flags.args[0] || this.fs.currentUser;
        const userData = this.fs.users[user];
        
        if (!userData) {
            return { error: `id: '${user}': no such user` };
        }
        
        // SELinux context if -Z flag
        if (flags.Z) {
            const ctx = userData.selinux || { user: 'unconfined_u', role: 'unconfined_r', type: 'unconfined_t', level: 's0-s0:c0.c1023' };
            return { output: `${ctx.user}:${ctx.role}:${ctx.type}:${ctx.level}` };
        }
        
        return { output: `uid=${userData.uid}(${user}) gid=${userData.gid}(${user}) groups=${userData.gid}(${user})` };
    }
    
    uname(args) {
        const flags = this.parseFlags(args, ['a', 'r', 's', 'n', 'm']);
        
        if (flags.a) {
            return { output: 'Linux rhcsa-lab 5.14.0-362.24.1.el9_3.x86_64 #1 SMP PREEMPT_DYNAMIC Tue Jan 23 20:12:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux' };
        }
        
        if (flags.r) {
            return { output: '5.14.0-362.24.1.el9_3.x86_64' };
        }
        
        if (flags.s) {
            return { output: 'Linux' };
        }
        
        if (flags.n) {
            return { output: 'rhcsa-lab' };
        }
        
        if (flags.m) {
            return { output: 'x86_64' };
        }
        
        return { output: 'Linux' };
    }
    
    date(args) {
        return { output: new Date().toString() };
    }
    
    timedatectl(args) {
        if (args.length === 0) {
            return { output: `               Local time: ${new Date().toString()}
           Universal time: ${new Date().toUTCString()}
                 RTC time: ${new Date().toUTCString()}
                Time zone: America/New_York (EST, -0500)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no` };
        }
        
        const subcommand = args[0];
        
        if (subcommand === 'status') {
            return this.timedatectl([]);
        }
        
        if (subcommand === 'list-timezones') {
            return { output: `Africa/Abidjan\nAfrica/Accra\nAmerica/New_York\nAmerica/Chicago\nAmerica/Los_Angeles\nAsia/Tokyo\nEurope/London\nEurope/Paris\nUTC` };
        }
        
        if (subcommand === 'set-timezone') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            const tz = args[1];
            if (!tz) {
                return { error: 'timedatectl: missing timezone argument' };
            }
            return { output: '' };
        }
        
        if (subcommand === 'set-time') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            const time = args[1];
            if (!time) {
                return { error: 'timedatectl: missing time argument' };
            }
            return { output: '' };
        }
        
        if (subcommand === 'set-ntp') {
            if (this.fs.currentUid !== 0) {
                return { error: 'timedatectl: Permission denied' };
            }
            return { output: '' };
        }
        
        return { error: `timedatectl: unknown command: ${subcommand}` };
    }
    
    hwclock(args) {
        const flags = this.parseFlags(args, ['r', 'w', 's', 'systohc', 'hctosys']);
        
        if (flags.r || args.length === 0) {
            return { output: new Date().toString() };
        }
        
        if (flags.w || flags.systohc) {
            if (this.fs.currentUid !== 0) {
                return { error: 'hwclock: Permission denied' };
            }
            return { output: '' };
        }
        
        if (flags.s || flags.hctosys) {
            if (this.fs.currentUid !== 0) {
                return { error: 'hwclock: Permission denied' };
            }
            return { output: '' };
        }
        
        return { output: new Date().toString() };
    }
    
    chronyc(args) {
        if (args.length === 0 || args[0] === 'tracking') {
            return { output: `Reference ID    : A9FEA97B (169.254.169.123)
Stratum         : 3
Ref time (UTC)  : ${new Date().toUTCString()}
System time     : 0.000000023 seconds fast of NTP time
Last offset     : +0.000000456 seconds
RMS offset      : 0.000001234 seconds
Frequency       : 5.678 ppm fast
Residual freq   : +0.012 ppm
Skew            : 0.123 ppm
Root delay      : 0.012345678 seconds
Root dispersion : 0.001234567 seconds
Update interval : 64.5 seconds
Leap status     : Normal` };
        }
        
        if (args[0] === 'sources') {
            return { output: `MS Name/IP address         Stratum Poll Reach LastRx Last sample               
===============================================================================
^* time.google.com               2   6   377    34   +123us[ +456us] +/-   12ms
^- ntp.ubuntu.com                2   6   377    35   -234us[ -567us] +/-   23ms
^+ 0.pool.ntp.org                3   6   377    36   +345us[ +678us] +/-   34ms` };
        }
        
        if (args[0] === 'activity') {
            return { output: `200 OK
3 sources online
0 sources offline
0 sources doing burst (return to online)
0 sources doing burst (return to offline)
0 sources with unknown address` };
        }
        
        return { error: `chronyc: unknown command: ${args[0]}` };
    }
    
    'tuned-adm'(args) {
        if (args.length === 0 || args[0] === 'active') {
            return { output: `Current active profile: virtual-guest` };
        }
        
        if (args[0] === 'list') {
            return { output: `Available profiles:
- balanced                    - General non-specialized tuned profile
- desktop                     - Optimize for the desktop use-case
- latency-performance         - Optimize for deterministic performance
- network-latency             - Optimize for deterministic performance in network
- network-throughput          - Optimize for streaming network throughput
- powersave                   - Optimize for low power consumption
- throughput-performance      - Broadly applicable tuning that provides excellent performance
- virtual-guest               - Optimize for running inside a virtual guest
- virtual-host                - Optimize for running KVM guests
Current active profile: virtual-guest` };
        }
        
        if (args[0] === 'profile') {
            if (this.fs.currentUid !== 0) {
                return { error: 'tuned-adm: Permission denied' };
            }
            
            const profile = args[1];
            if (!profile) {
                return { error: 'tuned-adm: missing profile name' };
            }
            
            return { output: `[Tuned profile ${profile} activated]` };
        }
        
        if (args[0] === 'recommend') {
            return { output: `virtual-guest` };
        }
        
        return { error: `tuned-adm: unknown command: ${args[0]}` };
    }
    
    hostnamectl(args) {
        if (args.length === 0 || args[0] === 'status') {
            return { output: `   Static hostname: ${this.hostname}
         Icon name: computer-vm
           Chassis: vm
        Machine ID: 1234567890abcdef1234567890abcdef
           Boot ID: abcdef1234567890abcdef1234567890
    Virtualization: kvm
  Operating System: Red Hat Enterprise Linux 9.0 (Plow)
       CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos
            Kernel: Linux 5.14.0-284.el9.x86_64
      Architecture: x86-64` };
        }
        
        if (args[0] === 'set-hostname') {
            if (this.fs.currentUid !== 0) {
                return { error: 'hostnamectl: Permission denied' };
            }
            const newHostname = args[1];
            if (!newHostname) {
                return { error: 'hostnamectl: missing hostname argument' };
            }
            this.hostname = newHostname;
            return { output: '' };
        }
        
        return { error: `hostnamectl: unknown command: ${args[0]}` };
    }
    
    // ===== CONTAINER MANAGEMENT =====
    
    podman(args) {
        if (args.length === 0) {
            return { error: 'podman: missing command' };
        }
        
        const command = args[0];
        
        if (!this.podmanContainers) {
            this.podmanContainers = [
                { id: 'a1b2c3d4e5f6', image: 'registry.access.redhat.com/ubi9/ubi:latest', name: 'web-server', status: 'Up 2 hours', ports: '8080->80/tcp' },
                { id: 'f6e5d4c3b2a1', image: 'docker.io/library/postgres:15', name: 'database', status: 'Up 3 hours', ports: '5432->5432/tcp' }
            ];
        }
        
        if (!this.podmanImages) {
            this.podmanImages = [
                { id: '1234567890ab', repository: 'registry.access.redhat.com/ubi9/ubi', tag: 'latest', created: '2 weeks ago', size: '234 MB' },
                { id: 'ab0987654321', repository: 'docker.io/library/postgres', tag: '15', created: '3 weeks ago', size: '412 MB' },
                { id: 'fedcba098765', repository: 'docker.io/library/nginx', tag: 'latest', created: '1 week ago', size: '187 MB' }
            ];
        }
        
        if (command === 'ps') {
            const flags = this.parseFlags(args.slice(1), ['a']);
            let output = 'CONTAINER ID  IMAGE                                              COMMAND               CREATED      STATUS          PORTS                   NAMES\n';
            
            for (const container of this.podmanContainers) {
                output += `${container.id}  ${container.image.padEnd(50)} /bin/sh           2 hours ago  ${container.status.padEnd(15)} ${container.ports.padEnd(23)} ${container.name}\n`;
            }
            
            return { output };
        }
        
        if (command === 'images') {
            let output = 'REPOSITORY                                TAG         IMAGE ID      CREATED        SIZE\n';
            
            for (const image of this.podmanImages) {
                output += `${image.repository.padEnd(45)} ${image.tag.padEnd(11)} ${image.id}  ${image.created.padEnd(14)} ${image.size}\n`;
            }
            
            return { output };
        }
        
        if (command === 'pull') {
            const image = args[1];
            if (!image) {
                return { error: 'podman pull: missing image name' };
            }
            
            return { output: `Trying to pull ${image}...
Getting image source signatures
Copying blob 123abc456def done  
Copying blob 789ghi012jkl done  
Copying blob 345mno678pqr done  
Copying config abcdef123456 done  
Writing manifest to image destination
Storing signatures
${this.generateUUID().slice(0, 12)}` };
        }
        
        if (command === 'run') {
            const flags = this.parseFlags(args.slice(1), ['d', 'it', 'p', 'name', 'rm']);
            const image = flags.args[0];
            
            if (!image) {
                return { error: 'podman run: missing image name' };
            }
            
            const containerId = this.generateUUID().slice(0, 12);
            
            if (flags.d) {
                return { output: containerId };
            }
            
            return { output: `Running container ${containerId} from image ${image}...\n[Container output would appear here]` };
        }
        
        if (command === 'build') {
            const flags = this.parseFlags(args.slice(1), ['t', 'f']);
            
            return { output: `STEP 1/5: FROM registry.access.redhat.com/ubi9/ubi:latest
STEP 2/5: RUN dnf install -y httpd
--> Using cache 123abc456def
STEP 3/5: COPY index.html /var/www/html/
--> 456def789ghi
STEP 4/5: EXPOSE 80
--> 789ghi012jkl
STEP 5/5: CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]
COMMIT my-web-app
--> 012jkl345mno
Successfully tagged localhost/my-web-app:latest
012jkl345mno` };
        }
        
        if (command === 'stop') {
            const containerName = args[1];
            if (!containerName) {
                return { error: 'podman stop: missing container name or ID' };
            }
            
            return { output: containerName };
        }
        
        if (command === 'rm') {
            const containerName = args[1];
            if (!containerName) {
                return { error: 'podman rm: missing container name or ID' };
            }
            
            return { output: containerName };
        }
        
        if (command === 'rmi') {
            const imageName = args[1];
            if (!imageName) {
                return { error: 'podman rmi: missing image name or ID' };
            }
            
            return { output: `Untagged: ${imageName}\nDeleted: sha256:${this.generateUUID()}` };
        }
        
        return { error: `podman: unknown command: ${command}` };
    }
    
    // Parse command flags
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

// Export for use in terminal.js
if (typeof window !== 'undefined') {
    window.RHCSACommands = RHCSACommands;
}
