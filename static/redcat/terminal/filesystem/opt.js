// /opt directory structure
// Optional software packages

export function createOptDirectory() {
    return {
        'opt': {
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
