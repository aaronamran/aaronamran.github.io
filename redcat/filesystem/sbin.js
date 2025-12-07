// /sbin directory structure
// System binaries

export function createSbinDirectory() {
    return {
        'sbin': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'fdisk': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'mkfs.xfs': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' },
                'mkfs.ext4': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 134567, modified: new Date(), content: '' },
                'mount': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 87654, modified: new Date(), content: '' },
                'umount': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 76543, modified: new Date(), content: '' },
                'ip': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 987654, modified: new Date(), content: '' },
                'iptables': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'firewall-cmd': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 156789, modified: new Date(), content: '' },
                'semanage': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 234567, modified: new Date(), content: '' },
                'restorecon': { type: 'file', permissions: '0755', owner: 'root', group: 'root', size: 123456, modified: new Date(), content: '' }
            }
        }
    };
}
