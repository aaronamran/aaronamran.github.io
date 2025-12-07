// File Operations Commands - ls, cp, mv, rm, etc.
// Part of Red Cat RHCSA Terminal Simulator

class FileCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
    }

    // ===== FILE LISTING AND DIRECTORY OPERATIONS =====

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
        
        // For symlinks, always show rwxrwxrwx (777) permissions
        const perms = (node.type === 'symlink') ? 'rwxrwxrwx' : this.formatPermissions(node.permissions);
        const links = 1;
        const size = node.size || 0;
        const date = this.formatDate(node.modified);
        
        let displayName = name;
        if (node.type === 'directory') {
            displayName = `<span class="file-directory">${name}</span>`;
        } else if (node.type === 'symlink') {
            // Use node.target (not linkTarget) for the symlink destination
            const target = node.target || 'unknown';
            displayName = `<span class="file-symlink">${name}</span> -> ${target}`;
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

    // ===== FILE COPYING AND MOVING =====

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

    // ===== COMPRESSION AND ARCHIVING =====

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

    // ===== FILE INSPECTION AND UTILITIES =====

    file(args, stdin = '') {
        // Determine file type
        // Usage: file /etc/passwd
        
        if (args.length === 0) {
            return { 
                stderr: 'file: missing operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        const output = [];
        
        for (const path of args) {
            const node = this.fs.getNode(path);
            
            if (!node) {
                output.push(`${path}: cannot open \`${path}' (No such file or directory)`);
                continue;
            }
            
            let fileType;
            
            if (node.type === 'directory') {
                fileType = 'directory';
            } else if (node.type === 'symlink') {
                fileType = `symbolic link to ${node.target}`;
            } else if (node.type === 'file') {
                // Determine file type based on content/extension
                const content = node.content || '';
                const ext = path.split('.').pop().toLowerCase();
                
                if (content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')) {
                    fileType = 'Bourne-Again shell script, ASCII text executable';
                } else if (content.startsWith('#!/usr/bin/python')) {
                    fileType = 'Python script, ASCII text executable';
                } else if (content.startsWith('#!')) {
                    fileType = 'script, ASCII text executable';
                } else if (ext === 'sh') {
                    fileType = 'POSIX shell script, ASCII text';
                } else if (ext === 'py') {
                    fileType = 'Python script, ASCII text';
                } else if (ext === 'c' || ext === 'h') {
                    fileType = 'C source, ASCII text';
                } else if (ext === 'cpp' || ext === 'cc' || ext === 'hpp') {
                    fileType = 'C++ source, ASCII text';
                } else if (ext === 'js') {
                    fileType = 'JavaScript source, ASCII text';
                } else if (ext === 'html') {
                    fileType = 'HTML document, ASCII text';
                } else if (ext === 'xml') {
                    fileType = 'XML document, ASCII text';
                } else if (ext === 'json') {
                    fileType = 'JSON data';
                } else if (ext === 'txt') {
                    fileType = 'ASCII text';
                } else if (ext === 'conf' || ext === 'cfg') {
                    fileType = 'ASCII text';
                } else if (ext === 'gz') {
                    fileType = 'gzip compressed data';
                } else if (ext === 'tar') {
                    fileType = 'tar archive';
                } else if (ext === 'zip') {
                    fileType = 'Zip archive data';
                } else if (content.length === 0) {
                    fileType = 'empty';
                } else if (/^[\x20-\x7E\n\r\t]*$/.test(content)) {
                    fileType = 'ASCII text';
                } else {
                    fileType = 'data';
                }
            } else {
                fileType = 'special file';
            }
            
            output.push(`${path}: ${fileType}`);
        }
        
        return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
    }
    
    stat(args, stdin = '') {
        // Display file or filesystem status
        // Usage: stat /etc/passwd
        
        if (args.length === 0) {
            return { 
                stderr: 'stat: missing operand',
                stdout: '',
                exitCode: 1
            };
        }
        
        const output = [];
        
        for (const path of args) {
            const node = this.fs.getNode(path);
            
            if (!node) {
                output.push(`stat: cannot stat '${path}': No such file or directory`);
                continue;
            }
            
            // Build stat output
            const lines = [];
            lines.push(`  File: ${path}`);
            
            // Size and type
            let typeStr = '';
            if (node.type === 'directory') {
                typeStr = 'directory';
            } else if (node.type === 'file') {
                typeStr = 'regular file';
            } else if (node.type === 'symlink') {
                typeStr = `symbolic link`;
            } else {
                typeStr = node.type;
            }
            
            lines.push(`  Size: ${node.size}\t\tBlocks: ${Math.ceil(node.size / 512)}\t\tIO Block: 4096\t${typeStr}`);
            
            // Device and Inode (simulated)
            const inode = this.getInodeNumber(path);
            lines.push(`Device: 803h/2051d\tInode: ${inode}\t\tLinks: 1`);
            
            // Permissions
            const accessOctal = node.permissions || '0755';
            const accessSymbolic = this.formatPermissionsNode(node);
            lines.push(`Access: (${accessOctal}/${accessSymbolic})\tUid: (    0/${node.owner})\tGid: (    0/${node.group})`);
            
            // Timestamps
            const modTime = node.modified ? node.modified.toString() : new Date().toString();
            lines.push(`Access: ${modTime}`);
            lines.push(`Modify: ${modTime}`);
            lines.push(`Change: ${modTime}`);
            lines.push(` Birth: -`);
            
            output.push(lines.join('\n'));
        }
        
        return { stdout: output.join('\n\n'), stderr: '', exitCode: 0 };
    }
    
    getInodeNumber(path) {
        // Generate a consistent pseudo-inode number from path
        let hash = 0;
        for (let i = 0; i < path.length; i++) {
            hash = ((hash << 5) - hash) + path.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    formatPermissionsNode(node) {
        // Convert node to symbolic permissions like drwxr-xr-x
        let result = '';
        
        if (node.type === 'directory') {
            result = 'd';
        } else if (node.type === 'symlink') {
            result = 'l';
        } else if (node.type === 'file') {
            result = '-';
        } else {
            result = '-';
        }
        
        const perms = node.permissions || '0755';
        const octal = perms.slice(-3); // Get last 3 digits
        
        for (const digit of octal) {
            const val = parseInt(digit);
            result += (val & 4) ? 'r' : '-';
            result += (val & 2) ? 'w' : '-';
            result += (val & 1) ? 'x' : '-';
        }
        
        return result;
    }

    xargs(args, stdin = '') {
        // Build and execute command from stdin
        // Usage: echo "file1 file2" | xargs rm
        // TODO: This is a simplified version - full xargs is very complex
        
        if (!stdin.trim()) {
            return { stdout: '', stderr: '', exitCode: 0 };
        }
        
        // Split stdin into arguments
        const stdinArgs = stdin.trim().split(/\s+/);
        
        // Combine with command args
        const fullArgs = [...args, ...stdinArgs];
        
        if (fullArgs.length === 0) {
            return { 
                stderr: 'xargs: command not specified',
                stdout: '',
                exitCode: 1
            };
        }
        
        // This would need to call back to the terminal to execute
        // For now, return a message indicating what would be executed
        const cmdLine = fullArgs.join(' ');
        return { 
            stdout: `xargs would execute: ${cmdLine}`,
            stderr: 'xargs: command execution not fully implemented in this simulator',
            exitCode: 0
        };
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
    window.FileCommands = FileCommands;
}
