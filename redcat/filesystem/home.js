// /home directory structure
// User home directories

export function createHomeDirectory() {
    return {
        'home': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'aaron': {
                    type: 'directory',
                    permissions: '0700',
                    owner: 'aaron',
                    group: 'aaron',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        '.bashrc': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 512,
                            modified: new Date(),
                            content: '# .bashrc\nalias ll="ls -la"\nalias grep="grep --color=auto"\nexport PATH=$PATH:/usr/local/bin\n'
                        },
                        '.bash_profile': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 256,
                            modified: new Date(),
                            content: '# .bash_profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\n'
                        },
                        '.bash_history': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 1024,
                            modified: new Date(),
                            content: 'ls -la\ncd /var/log\nsudo tail -f /var/log/messages\n'
                        },
                        '.ssh': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'aaron',
                            group: 'aaron',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'student': {
                    type: 'directory',
                    permissions: '0700',
                    owner: 'student',
                    group: 'student',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        '.bashrc': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'student',
                            group: 'student',
                            size: 256,
                            modified: new Date(),
                            content: '# .bashrc\nalias ll="ls -la"\n'
                        },
                        '.bash_profile': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'student',
                            group: 'student',
                            size: 128,
                            modified: new Date(),
                            content: '# .bash_profile\n'
                        }
                    }
                }
            }
        }
    };
}
