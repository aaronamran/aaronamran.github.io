// /tmp directory structure
// Temporary files

export function createTmpDirectory() {
    return {
        'tmp': {
            type: 'directory',
            permissions: '1777',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {}
        }
    };
}
