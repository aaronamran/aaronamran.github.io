// SELinux Security Commands
// Part of Red Cat RHCSA Terminal Simulator

class SELinuxCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.selinuxMode = sharedState.selinuxMode;
        this.selinuxBooleans = sharedState.selinuxBooleans;
    }

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
    window.SELinuxCommands = SELinuxCommands;
}
