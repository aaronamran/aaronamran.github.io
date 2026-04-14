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
                            children: {
                                'kernel': {
                                    type: 'directory',
                                    permissions: '0755',
                                    owner: 'root',
                                    group: 'root',
                                    size: 4096,
                                    modified: new Date(),
                                    children: {
                                        'fs': {
                                            type: 'directory',
                                            permissions: '0755',
                                            owner: 'root',
                                            group: 'root',
                                            size: 4096,
                                            modified: new Date(),
                                            children: {
                                                'ext4': {
                                                    type: 'directory',
                                                    permissions: '0755',
                                                    owner: 'root',
                                                    group: 'root',
                                                    size: 4096,
                                                    modified: new Date(),
                                                    children: {
                                                        'ext4.ko.xz': {
                                                            type: 'file',
                                                            permissions: '0644',
                                                            owner: 'root',
                                                            group: 'root',
                                                            size: 847872,
                                                            modified: new Date(),
                                                            content: '[Binary kernel module]'
                                                        }
                                                    }
                                                },
                                                'xfs': {
                                                    type: 'directory',
                                                    permissions: '0755',
                                                    owner: 'root',
                                                    group: 'root',
                                                    size: 4096,
                                                    modified: new Date(),
                                                    children: {
                                                        'xfs.ko.xz': {
                                                            type: 'file',
                                                            permissions: '0644',
                                                            owner: 'root',
                                                            group: 'root',
                                                            size: 1273856,
                                                            modified: new Date(),
                                                            content: '[Binary kernel module]'
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        'drivers': {
                                            type: 'directory',
                                            permissions: '0755',
                                            owner: 'root',
                                            group: 'root',
                                            size: 4096,
                                            modified: new Date(),
                                            children: {
                                                'net': {
                                                    type: 'directory',
                                                    permissions: '0755',
                                                    owner: 'root',
                                                    group: 'root',
                                                    size: 4096,
                                                    modified: new Date(),
                                                    children: {
                                                        'virtio_net.ko.xz': {
                                                            type: 'file',
                                                            permissions: '0644',
                                                            owner: 'root',
                                                            group: 'root',
                                                            size: 57344,
                                                            modified: new Date(),
                                                            content: '[Binary kernel module]'
                                                        }
                                                    }
                                                },
                                                'block': {
                                                    type: 'directory',
                                                    permissions: '0755',
                                                    owner: 'root',
                                                    group: 'root',
                                                    size: 4096,
                                                    modified: new Date(),
                                                    children: {
                                                        'virtio_blk.ko.xz': {
                                                            type: 'file',
                                                            permissions: '0644',
                                                            owner: 'root',
                                                            group: 'root',
                                                            size: 20480,
                                                            modified: new Date(),
                                                            content: '[Binary kernel module]'
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                'modules.dep': {
                                    type: 'file',
                                    permissions: '0644',
                                    owner: 'root',
                                    group: 'root',
                                    size: 2048,
                                    modified: new Date(),
                                    content: 'kernel/fs/ext4/ext4.ko.xz: kernel/fs/jbd2/jbd2.ko.xz kernel/fs/mbcache.ko.xz\nkernel/drivers/net/virtio_net.ko.xz: kernel/drivers/virtio/virtio.ko.xz\n'
                                }
                            }
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
