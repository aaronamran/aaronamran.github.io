// /dev directory structure
// Device files

export function createDevDirectory() {
    return {
        'dev': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'null': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'zero': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'random': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'urandom': { type: 'file', permissions: '0666', owner: 'root', group: 'root', size: 0, modified: new Date(), content: '' },
                'sda': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sda1': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sda2': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdb': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdc': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' },
                'sdd': { type: 'file', permissions: '0660', owner: 'root', group: 'disk', size: 0, modified: new Date(), content: '' }
            }
        }
    };
}
