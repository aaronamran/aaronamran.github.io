// /bin directory structure
// Essential command binaries for all users

export function createBinDirectory() {
    return {
        'bin': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'bash': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1234567, modified: new Date(), content: '' },
                'ls': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 147488, modified: new Date(), content: '' },
                'cat': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 55432, modified: new Date(), content: '' },
                'cp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 158632, modified: new Date(), content: '' },
                'mv': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 154536, modified: new Date(), content: '' },
                'rm': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 71544, modified: new Date(), content: '' },
                'grep': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 253992, modified: new Date(), content: '' },
                'sed': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 93488, modified: new Date(), content: '' },
                'awk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 481144, modified: new Date(), content: '' },
                'tar': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 495840, modified: new Date(), content: '' },
                'gzip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 99440, modified: new Date(), content: '' },
                'bzip2': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 44008, modified: new Date(), content: '' }
            }
        }
    };
}
