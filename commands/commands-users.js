// User and Group Management Commands
// Part of Red Cat RHCSA Terminal Simulator

class UserCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
    }

    // Placeholder - commands will be moved here
    // useradd, userdel, passwd, usermod, groupadd, groupdel
    // groupmod, groups, su, sudo, chage, getfacl, setfacl
    // last, newgrp, w, who

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
    
    w(args) {
        const uptime = '2 days, 3:45';
        const users = 2;
        const load = '0.15, 0.10, 0.08';
        
        return { output: ` ${new Date().toTimeString().split(' ')[0]} up ${uptime},  ${users} users,  load average: ${load}\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    192.168.1.100    10:15    0.00s  0.03s  0.01s -bash\n${this.fs.currentUser}     pts/1    192.168.1.101    09:30    1:15   0.05s  0.02s vim file.txt` };
    }
    
    who(args) {
        return { output: `root     pts/0        ${new Date().toISOString().split('T')[0]} 10:15 (192.168.1.100)\n${this.fs.currentUser}     pts/1        ${new Date().toISOString().split('T')[0]} 09:30 (192.168.1.101)` };
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
    window.UserCommands = UserCommands;
}
