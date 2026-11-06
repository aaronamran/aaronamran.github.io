// Text Processing Commands - grep, sed, awk, etc.
// Part of Red Cat RHCSA Terminal Simulator

class TextCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
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
    
    diff(args, stdin = '') {
        // Compare files line by line
        // Usage: diff file1 file2
        // Simplified version - supports basic unified diff format
        
        const flags = this.parseFlags(args, ['u', 'c', 'q', 'r']);
        
        if (flags.args.length < 2) {
            return { 
                stderr: 'diff: missing operand',
                stdout: '',
                exitCode: 2
            };
        }
        
        const [file1Path, file2Path] = flags.args;
        const file1 = this.fs.getNode(file1Path);
        const file2 = this.fs.getNode(file2Path);
        
        if (!file1) {
            return { 
                stderr: `diff: ${file1Path}: No such file or directory`,
                stdout: '',
                exitCode: 2
            };
        }
        
        if (!file2) {
            return { 
                stderr: `diff: ${file2Path}: No such file or directory`,
                stdout: '',
                exitCode: 2
            };
        }
        
        if (file1.type !== 'file' || file2.type !== 'file') {
            return { 
                stderr: 'diff: can only compare files',
                stdout: '',
                exitCode: 2
            };
        }
        
        const content1 = file1.content || '';
        const content2 = file2.content || '';
        
        // Quick comparison for -q flag
        if (flags.q) {
            if (content1 === content2) {
                return { stdout: '', stderr: '', exitCode: 0 };
            } else {
                return { 
                    stdout: `Files ${file1Path} and ${file2Path} differ`,
                    stderr: '',
                    exitCode: 1
                };
            }
        }
        
        const lines1 = content1.split('\n');
        const lines2 = content2.split('\n');
        
        // Simple line-by-line comparison (not true LCS algorithm)
        const output = [];
        
        if (flags.u) {
            // Unified diff format
            output.push(`--- ${file1Path}`);
            output.push(`+++ ${file2Path}`);
            output.push(`@@ -1,${lines1.length} +1,${lines2.length} @@`);
            
            const maxLen = Math.max(lines1.length, lines2.length);
            for (let i = 0; i < maxLen; i++) {
                const line1 = lines1[i];
                const line2 = lines2[i];
                
                if (line1 === undefined) {
                    output.push(`+${line2}`);
                } else if (line2 === undefined) {
                    output.push(`-${line1}`);
                } else if (line1 !== line2) {
                    output.push(`-${line1}`);
                    output.push(`+${line2}`);
                } else {
                    output.push(` ${line1}`);
                }
            }
        } else {
            // Traditional diff format
            const maxLen = Math.max(lines1.length, lines2.length);
            let diffFound = false;
            
            for (let i = 0; i < maxLen; i++) {
                const line1 = lines1[i];
                const line2 = lines2[i];
                
                if (line1 !== line2) {
                    diffFound = true;
                    if (line1 === undefined) {
                        output.push(`${i + 1}a${i + 1}`);
                        output.push(`> ${line2}`);
                    } else if (line2 === undefined) {
                        output.push(`${i + 1}d${i}`);
                        output.push(`< ${line1}`);
                    } else {
                        output.push(`${i + 1}c${i + 1}`);
                        output.push(`< ${line1}`);
                        output.push(`---`);
                        output.push(`> ${line2}`);
                    }
                }
            }
            
            if (!diffFound) {
                return { stdout: '', stderr: '', exitCode: 0 };
            }
        }
        
        return { 
            stdout: output.join('\n'),
            stderr: '',
            exitCode: content1 === content2 ? 0 : 1
        };
    }
    
    patch(args, stdin = '') {
        // Apply a diff patch to a file
        // Usage: patch file < patchfile OR patch < patchfile (reads filename from patch)
        // Simplified version
        
        if (args.length === 0 && !stdin) {
            return { 
                stderr: 'patch: missing operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        let patchContent = stdin;
        let targetFile = args[0];
        
        if (!patchContent) {
            return { 
                stderr: 'patch: no patch content provided',
                stdout: '',
                exitCode: 1
            };
        }
        
        // Parse unified diff format
        const lines = patchContent.split('\n');
        const oldFileMatch = lines.find(l => l.startsWith('---'));
        const newFileMatch = lines.find(l => l.startsWith('+++'));
        
        if (!targetFile && newFileMatch) {
            // Extract filename from patch
            targetFile = newFileMatch.substring(4).trim().split('\t')[0];
        }
        
        if (!targetFile) {
            return { 
                stderr: 'patch: cannot determine target file',
                stdout: '',
                exitCode: 1
            };
        }
        
        const file = this.fs.getNode(targetFile);
        if (!file) {
            return { 
                stderr: `patch: ${targetFile}: No such file or directory`,
                stdout: '',
                exitCode: 1
            };
        }
        
        if (file.type !== 'file') {
            return { 
                stderr: `patch: ${targetFile}: Not a regular file`,
                stdout: '',
                exitCode: 1
            };
        }
        
        // Simple patch application (not full implementation)
        const originalLines = (file.content || '').split('\n');
        const newLines = [];
        let inHunk = false;
        
        for (const line of lines) {
            if (line.startsWith('@@')) {
                inHunk = true;
                continue;
            }
            
            if (inHunk) {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                    newLines.push(line.substring(1));
                } else if (line.startsWith(' ')) {
                    newLines.push(line.substring(1));
                }
                // Skip lines starting with '-' (deletions)
            }
        }
        
        if (newLines.length > 0) {
            file.content = newLines.join('\n');
            file.size = file.content.length;
            file.modified = new Date();
            
            return { 
                stdout: `patching file ${targetFile}`,
                stderr: '',
                exitCode: 0
            };
        }
        
        return { 
            stderr: 'patch: malformed patch',
            stdout: '',
            exitCode: 1
        };
    }
    
    tr(args, stdin = '') {
        // Translate or delete characters
        // Usage: echo "hello" | tr 'a-z' 'A-Z'
        
        if (args.length < 1) {
            return { 
                stderr: 'tr: missing operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        const flags = this.parseFlags(args, ['d', 's', 'c']);
        
        if (flags.d) {
            // Delete characters in set1
            const set1 = this.expandCharSet(flags.args[0] || '');
            const result = stdin.split('').filter(c => !set1.includes(c)).join('');
            return { stdout: result, stderr: '', exitCode: 0 };
        }
        
        if (flags.args.length < 2 && !flags.d) {
            return { 
                stderr: 'tr: missing operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        const set1 = this.expandCharSet(flags.args[0]);
        const set2 = this.expandCharSet(flags.args[1]);
        
        // Build translation map
        const map = {};
        for (let i = 0; i < set1.length; i++) {
            map[set1[i]] = set2[i] || set2[set2.length - 1];
        }
        
        // Translate
        let result = stdin.split('').map(c => map[c] || c).join('');
        
        // Squeeze repeats if -s flag
        if (flags.s && set2.length > 0) {
            const squeezeChars = set2;
            for (const char of squeezeChars) {
                const regex = new RegExp(`${this.escapeRegex(char)}+`, 'g');
                result = result.replace(regex, char);
            }
        }
        
        return { stdout: result, stderr: '', exitCode: 0 };
    }
    
    expandCharSet(set) {
        // Expand character sets like 'a-z' to individual characters
        const chars = [];
        let i = 0;
        
        while (i < set.length) {
            if (i + 2 < set.length && set[i + 1] === '-') {
                // Range like a-z
                const start = set.charCodeAt(i);
                const end = set.charCodeAt(i + 2);
                for (let code = start; code <= end; code++) {
                    chars.push(String.fromCharCode(code));
                }
                i += 3;
            } else {
                chars.push(set[i]);
                i++;
            }
        }
        
        return chars;
    }
    
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    paste(args, stdin = '') {
        // Merge lines of files horizontally
        // Usage: paste file1 file2
        
        const flags = this.parseFlags(args, ['d', 's']);
        const delimiter = flags.d ? flags.args.shift() : '\t';
        
        if (flags.args.length === 0) {
            // Read from stdin
            if (!stdin) {
                return { stderr: 'paste: missing operand', stdout: '', exitCode: 1 };
            }
            return { stdout: stdin, stderr: '', exitCode: 0 };
        }
        
        // Read all files
        const filesContent = [];
        for (const filePath of flags.args) {
            const file = this.fs.getNode(filePath);
            if (!file) {
                return { 
                    stderr: `paste: ${filePath}: No such file or directory`,
                    stdout: '',
                    exitCode: 1
                };
            }
            if (file.type !== 'file') {
                return { 
                    stderr: `paste: ${filePath}: Not a regular file`,
                    stdout: '',
                    exitCode: 1
                };
            }
            filesContent.push((file.content || '').split('\n'));
        }
        
        // Merge lines horizontally
        const maxLines = Math.max(...filesContent.map(f => f.length));
        const output = [];
        
        for (let i = 0; i < maxLines; i++) {
            const lineParts = filesContent.map(fc => fc[i] || '');
            output.push(lineParts.join(delimiter));
        }
        
        return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
    }
    
    join(args, stdin = '') {
        // Join lines of two files on a common field
        // Usage: join file1 file2
        // Simplified version - assumes first field is join key
        
        const flags = this.parseFlags(args, ['t', '1', '2']);
        const delimiter = flags.t ? flags.args.shift() : ' ';
        
        if (flags.args.length < 2) {
            return { 
                stderr: 'join: missing file operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        const [file1Path, file2Path] = flags.args;
        const file1 = this.fs.getNode(file1Path);
        const file2 = this.fs.getNode(file2Path);
        
        if (!file1) {
            return { 
                stderr: `join: ${file1Path}: No such file or directory`,
                stdout: '',
                exitCode: 1
            };
        }
        
        if (!file2) {
            return { 
                stderr: `join: ${file2Path}: No such file or directory`,
                stdout: '',
                exitCode: 1
            };
        }
        
        const lines1 = (file1.content || '').split('\n').filter(l => l.trim());
        const lines2 = (file2.content || '').split('\n').filter(l => l.trim());
        
        // Build map from file2
        const map2 = {};
        for (const line of lines2) {
            const parts = line.split(delimiter);
            if (parts.length > 0) {
                const key = parts[0].trim();
                map2[key] = parts.slice(1).join(delimiter);
            }
        }
        
        // Join with file1
        const output = [];
        for (const line of lines1) {
            const parts = line.split(delimiter);
            if (parts.length > 0) {
                const key = parts[0].trim();
                if (map2.hasOwnProperty(key)) {
                    const file1Rest = parts.slice(1).join(delimiter);
                    output.push(`${key}${delimiter}${file1Rest}${delimiter}${map2[key]}`);
                }
            }
        }
        
        return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
    }
    
    tee(args, stdin = '') {
        // Read from stdin and write to stdout AND file(s)
        // Usage: command | tee file1 file2
        // -a flag appends instead of overwriting
        
        const flags = this.parseFlags(args, ['a']);
        const files = flags.args;
        
        if (files.length === 0) {
            return { 
                stderr: 'tee: missing file operand', 
                stdout: '',
                exitCode: 1 
            };
        }
        
        // Write to each file
        for (const file of files) {
            const parentPath = this.fs.getParentPath(file);
            const basename = this.fs.getBasename(file);
            const parent = this.fs.getNode(parentPath);
            
            if (!parent) {
                return { 
                    stderr: `tee: ${file}: No such file or directory`,
                    stdout: stdin,
                    exitCode: 1
                };
            }
            
            if (!this.fs.hasPermission(parent, 'w')) {
                return { 
                    stderr: `tee: ${file}: Permission denied`,
                    stdout: stdin,
                    exitCode: 1
                };
            }
            
            const existingFile = this.fs.getNode(file);
            const content = (flags.a && existingFile) ? (existingFile.content || '') + stdin : stdin;
            
            if (existingFile && existingFile.type === 'file') {
                existingFile.content = content;
                existingFile.size = content.length;
                existingFile.modified = new Date();
            } else if (!existingFile) {
                parent.children[basename] = {
                    type: 'file',
                    permissions: '0644',
                    owner: this.fs.currentUser,
                    group: this.fs.users[this.fs.currentUser].group,
                    size: content.length,
                    modified: new Date(),
                    content: content
                };
            }
        }
        
        // Output to stdout (so it can be piped further)
        return { stdout: stdin, stderr: '', exitCode: 0 };
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
    window.TextCommands = TextCommands;
}
