// /var directory structure
// Variable data (logs, caches, spools)

export function createVarDirectory() {
    return {
        'var': {
            type: 'directory',
            permissions: '0755',
            owner: 'root',
            group: 'root',
            size: 4096,
            modified: new Date(),
            children: {
                'log': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'messages': {
                            type: 'file',
                            permissions: '0644',
                            owner: 'root',
                            group: 'root',
                            size: 2048,
                            modified: new Date(),
                            content: 'Dec  5 10:30:00 rhcsa-lab systemd[1]: Started System Logging Service.\nDec  5 10:30:05 rhcsa-lab kernel: Linux version 5.14.0-362.8.1.el9_3.x86_64\nDec  5 10:30:15 rhcsa-lab systemd[1]: Starting Firewall daemon...\n'
                        },
                        'secure': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 1024,
                            modified: new Date(),
                            content: 'Dec  5 10:30:00 rhcsa-lab sshd[1234]: Server listening on 0.0.0.0 port 22.\nDec  5 10:32:15 rhcsa-lab sudo:   aaron : TTY=pts/0 ; USER=root\n'
                        },
                        'cron': {
                            type: 'file',
                            permissions: '0600',
                            owner: 'root',
                            group: 'root',
                            size: 512,
                            modified: new Date(),
                            content: 'Dec  5 10:00:01 rhcsa-lab CROND[5678]: (root) CMD (/usr/lib64/sa/sa1 1 1)\n'
                        },
                        'audit': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'www': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'html': {
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
                'lib': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {}
                },
                'cache': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'yum': {
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
                'spool': {
                    type: 'directory',
                    permissions: '0755',
                    owner: 'root',
                    group: 'root',
                    size: 4096,
                    modified: new Date(),
                    children: {
                        'cron': {
                            type: 'directory',
                            permissions: '0700',
                            owner: 'root',
                            group: 'root',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        },
                        'mail': {
                            type: 'directory',
                            permissions: '0755',
                            owner: 'root',
                            group: 'mail',
                            size: 4096,
                            modified: new Date(),
                            children: {}
                        }
                    }
                },
                'tmp': {
                    type: 'directory',
                    permissions: '1777',
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
