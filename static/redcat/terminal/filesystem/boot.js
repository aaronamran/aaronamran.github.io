// /boot directory structure
// Boot loader files, kernel images, and initial RAM disk

export function createBootDirectory() {
    return {
        'boot': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'grub2': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'grub.cfg': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 8192,
                            modified: new Date(),
                            content: '# GRUB2 configuration\nset default="0"\nset timeout=5\nmenuentry \'Red Hat Enterprise Linux 9\' {\n    linux /vmlinuz root=UUID=1234-5678\n    initrd /initramfs.img\n}\n'
                        },
                        'grubenv': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 1024,
                            modified: new Date(),
                            content: 'saved_entry=0\nkernel_opts=\n'
                        }
                    }
                },
                'vmlinuz-5.14.0-362.8.1.el9_3.x86_64': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 11534336,
                    modified: new Date(),
                    content: ''
                },
                'initramfs-5.14.0-362.8.1.el9_3.x86_64.img': {
                    type: 'file',
                    permissions: '0600',
                    owner: 'root',
                    group: 'root',
                    size: 37485312,
                    modified: new Date(),
                    content: ''
                },
                'System.map-5.14.0-362.8.1.el9_3.x86_64': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 4538419,
                    modified: new Date(),
                    content: ''
                }
            }
        }
    };
}
