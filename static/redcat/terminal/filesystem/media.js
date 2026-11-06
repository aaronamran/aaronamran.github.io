// /media directory structure  
// Removable media mount points

export function createMediaDirectory() {
    return {
        'media': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'cdrom': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'usb': {
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
