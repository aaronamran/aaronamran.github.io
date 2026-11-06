// /usr directory structure
// User programs and data

export function createUsrDirectory() {
    return {
        'usr': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'bin': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'vi': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 1234567, modified: new Date(), content: '' },
                        'vim': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 3234567, modified: new Date(), content: '' },
                        'nano': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'find': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 324567, modified: new Date(), content: '' },
                        'ssh': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 874321, modified: new Date(), content: '' },
                        'scp': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                        'wget': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 834567, modified: new Date(), content: '' },
                        'curl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                        'systemctl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 734567, modified: new Date(), content: '' },
                        'journalctl': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 534567, modified: new Date(), content: '' }
                    }
                },
                'sbin': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'useradd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 134567, modified: new Date(), content: '' },
                        'userdel': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 124567, modified: new Date(), content: '' },
                        'usermod': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 144567, modified: new Date(), content: '' },
                        'groupadd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 114567, modified: new Date(), content: '' },
                        'groupdel': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 104567, modified: new Date(), content: '' },
                        'chpasswd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 94567, modified: new Date(), content: '' }
                    }
                },
                'lib': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'lib64': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'share': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'doc': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'man': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {
                                'man1': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                },
                                'man5': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {}
                                },
                                'man8': {
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
                    }
                },
                'local': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'bin': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'sbin': {
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
            }
        }
    };
}
