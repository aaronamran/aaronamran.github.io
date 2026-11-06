/**
 * Filesystem Utilities for Terminal Simulation
 * Handles dynamic generation of ls, stat, and getfacl output based on state
 */

/**
 * Convert octal mode to symbolic representation (rwxrwxrwx)
 * @param {string} mode - Octal mode (e.g., '0755')
 * @returns {string} - Symbolic mode (e.g., 'rwxr-xr-x')
 */
function modeToSymbolic(mode) {
    // Remove leading 0 if present
    const octal = mode.replace(/^0/, '');
    const modeNum = parseInt(octal, 8);
    
    const perms = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    const owner = perms[(modeNum >> 6) & 7];
    const group = perms[(modeNum >> 3) & 7];
    const other = perms[modeNum & 7];
    
    return owner + group + other;
}

/**
 * Generate ls -ld output for a file/directory
 * @param {string} path - File/directory path
 * @param {object} fileState - File state object { mode, owner, group, acls }
 * @param {boolean} isDirectory - Whether the path is a directory
 * @returns {string} - Formatted ls -ld output
 */
function generateLsOutput(path, fileState, isDirectory = true) {
    const type = isDirectory ? 'd' : '-';
    const symbolic = modeToSymbolic(fileState.mode);
    const aclMarker = fileState.acls && fileState.acls.length > 0 ? '+' : '';
    const stickyMarker = fileState.sticky ? 't' : '';
    const sgidMarker = fileState.sgid ? 's' : '';
    
    // Apply special bits to symbolic mode
    let finalSymbolic = symbolic;
    if (sgidMarker) {
        finalSymbolic = finalSymbolic.substring(0, 5) + 's' + finalSymbolic.substring(6);
    }
    if (stickyMarker) {
        finalSymbolic = finalSymbolic.substring(0, 8) + 't';
    }
    
    const mode = `${type}${finalSymbolic}${aclMarker}`;
    const links = isDirectory ? '2' : '1';
    const size = '4096';
    const date = 'Jan 20 12:00';
    
    return `${mode} ${links} ${fileState.owner} ${fileState.group} ${size} ${date} ${path}`;
}

/**
 * Generate stat output for a file/directory
 * @param {string} path - File/directory path
 * @param {object} fileState - File state object { mode, owner, group }
 * @param {boolean} isDirectory - Whether the path is a directory
 * @returns {string} - Formatted stat output
 */
function generateStatOutput(path, fileState, isDirectory = true) {
    const type = isDirectory ? 'directory' : 'regular file';
    const size = isDirectory ? '4096' : '2048';
    const symbolic = modeToSymbolic(fileState.mode);
    const mode = fileState.mode;
    
    return `  File: ${path}
  Size: ${size}      \tBlocks: 8          IO Block: 4096   ${type}
Device: fd00h/64768d\tInode: 12345      Links: 2
Access: (${mode}/${isDirectory ? 'd' : '-'}${symbolic})  Uid: ( 1001/${fileState.owner.padEnd(8)})   Gid: ( 2001/${fileState.group.padEnd(8)})
Access: 2026-01-20 12:00:00.000000000 -0500
Modify: 2026-01-20 12:00:00.000000000 -0500
Change: 2026-01-20 12:00:00.000000000 -0500
 Birth: -`;
}

/**
 * Generate getfacl output for a file/directory
 * @param {string} path - File/directory path
 * @param {object} fileState - File state object { mode, owner, group, acls }
 * @returns {string} - Formatted getfacl output
 */
function generateGetfaclOutput(path, fileState) {
    const symbolic = modeToSymbolic(fileState.mode);
    const ownerPerm = symbolic.substring(0, 3).replace(/-/g, '');
    const groupPerm = symbolic.substring(3, 6).replace(/-/g, '');
    const otherPerm = symbolic.substring(6, 9).replace(/-/g, '');
    
    let output = `# file: ${path}
# owner: ${fileState.owner}
# group: ${fileState.group}
user::${ownerPerm || '---'}
group::${groupPerm || '---'}`;
    
    // Add custom ACLs
    // (state may hold a single ACL as a plain string or several as an array)
    const customAcls = Array.isArray(fileState.acls) ? fileState.acls : (fileState.acls ? [fileState.acls] : []);
    if (customAcls.length > 0) {
        customAcls.forEach(acl => {
            output += `\n${acl}`;
        });
    }
    
    output += `\nother::${otherPerm || '---'}`;
    
    return output;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        modeToSymbolic,
        generateLsOutput,
        generateStatOutput,
        generateGetfaclOutput
    };
}

// Also make functions globally available for browser usage
if (typeof window !== 'undefined') {
    window.modeToSymbolic = modeToSymbolic;
    window.generateLsOutput = generateLsOutput;
    window.generateStatOutput = generateStatOutput;
    window.generateGetfaclOutput = generateGetfaclOutput;
}
