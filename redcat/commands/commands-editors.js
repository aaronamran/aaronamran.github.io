// Text Editor Commands - vi, vim, nano
// Part of Red Cat RHCSA Terminal Simulator

class EditorCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
    }

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
    window.EditorCommands = EditorCommands;
}
