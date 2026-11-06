// /run directory structure
// Runtime variable data

export function createRunDirectory() {
    return {
        'run': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'systemd': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'lock': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                }
            }
        }
    };
}
