// /lib and /lib64 directory structures
// Shared libraries

export function createLibDirectories() {
    return {
        'lib': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'modules': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        '5.14.0-362.8.1.el9_3.x86_64': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'systemd': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                }
            }
        },
        'lib64': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'libc.so.6': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 2156368, modified: new Date(), content: '' },
                'libm.so.6': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1165968, modified: new Date(), content: '' },
                'libpthread.so.0': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 155056, modified: new Date(), content: '' }
            }
        }
    };
}
