// /proc directory structure
// Process and kernel information

export function createProcDirectory() {
    return {
        'proc': {
            type: 'directory',
            permissions: '0555',
            owner: 'root',
            group: 'root',
            size: 0,
            modified: new Date(),
            children: {
                'cpuinfo': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 158\nmodel name\t: Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz\n'
                },
                'meminfo': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:   12288000 kB\nBuffers:          512000 kB\nCached:          4096000 kB\n'
                },
                'version': {
                    type: 'file',
                    permissions: '0444',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    modified: new Date(),
                    content: 'Linux version 5.14.0-362.8.1.el9_3.x86_64 (mockbuild@x86-vm-09.build.eng.bos.redhat.com) (gcc version 11.4.1 20230605 (Red Hat 11.4.1-2)) #1 SMP PREEMPT_DYNAMIC\n'
                }
            }
        }
    };
}
