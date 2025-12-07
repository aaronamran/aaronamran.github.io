// /root directory structure
// Root user's home directory

export function createRootDirectory() {
    return {
        'root': {
            type: 'directory',
            permissions: '0550',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                '.bashrc': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 1024,
                    modified: new Date(),
                    content: '# .bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\nexport PS1="[\\u@\\h \\W]\\$ "\n'
                },
                '.bash_profile': {
                    type: 'file',
                    permissions: '0644',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    modified: new Date(),
                    content: '# .bash_profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\nPATH=$PATH:$HOME/bin\nexport PATH\n'
                },
                '.bash_history': {
                    type: 'file',
                    permissions: '0600',
                    owner: 'root',
                    group: 'root',
                    size: 2048,
                    modified: new Date(),
                    content: 'systemctl status firewalld\ncat /etc/fstab\nls -la /root\n'
                },
                '.ssh': {
                    type: 'directory',
                    permissions: '0700',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'authorized_keys': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: ''
                        }
                    }
                },
                'scripts': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'backup.sh': {
                            type: 'file',
                            permissions: '0755',
                            owner: 'root',
                            group: 'root',
                            size: 256,
                            modified: new Date(),
                            content: '#!/bin/bash\n# Backup script\ntar -czf /backup/data-$(date +%Y%m%d).tar.gz /data\n'
                        }
                    }
                },
                'documents': {
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
