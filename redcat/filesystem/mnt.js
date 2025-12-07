// /mnt directory structure
// Temporary mount point

export function createMntDirectory() {
    return {
        'mnt': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {}
        }
    };
}
