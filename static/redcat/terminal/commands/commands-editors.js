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
        // --version / --help print and exit like the real binary
        if (args.includes('--version')) {
            return { stdout: 'VIM - Vi IMproved 8.2 (2019 Dec 12, compiled Aug 10 2023 00:00:00)\nIncluded patches: 1-2637\nModified by <bugzilla@redhat.com>\nCompiled by <bugzilla@redhat.com>\nHuge version without GUI.  Features included (+) or not (-):\n+acl               +file_in_path      +mouse_urxvt       -tag_any_white\n+arabicshape      +find_in_path      +mouse_xterm       -tcl\n+autocmd          +float             +multi_byte        +termguicolors', stderr: '', exitCode: 0 };
        }
        if (args.includes('--help')) {
            return { stdout: 'VIM - Vi IMproved 8.2 (2019 Dec 12, compiled Aug 10 2023 00:00:00)\n\nUsage: vim [arguments] [file ..]       edit specified file(s)\n   or: vim [arguments] -               read text from stdin\n   or: vim [arguments] -t tag          edit file where tag is defined\n   or: vim [arguments] -q [errorfile]  edit file with first error', stderr: '', exitCode: 0 };
        }
        // options such as -R or +10 are accepted and ignored
        const filename = args.filter(x => !x.startsWith('-') && !x.startsWith('+'))[0];
        
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
            // Check if we're in Section 4 (Shell Scripting) and use modal editor
            const isSection4 = typeof appState !== 'undefined' && appState.currentSectionId === 4;
            const useModal = isSection4 && typeof ViModal !== 'undefined';
            
            if (useModal) {
                // Use modal editor for Section 4
                const modal = new ViModal(window.terminal, this.fs);
                modal.open(fullPath, content);
            } else {
                // Use traditional vi editor for other sections
                window.terminal.openEditor('vim', fullPath, content);
            }
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
