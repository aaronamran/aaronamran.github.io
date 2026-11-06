// /sys directory structure
// System device information

export function createSysDirectory() {
    return {
        'sys': {
            type: 'directory',
            permissions: '0555',
            owner: 'root',
            group: 'root',
            size: 0,
            modified: new Date(),
            children: {
                'class': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {
                        'net': {
                            type: 'directory',
                            permissions: '0555',
                            owner: 'root',
                            group: 'root',
                            size: 0,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'block': {
                    type: 'directory',
                    permissions: '0555',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    children: {}
                }
            }
        }
    };
}
