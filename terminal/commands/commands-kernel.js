// Kernel Module Commands - lsmod, modprobe, modinfo, rmmod, insmod
// Part of Red Cat RHCSA Terminal Simulator

class KernelModuleCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.parent = sharedState.parent;
        
        // Initialize kernel module system
        if (!this.parent.kernelModules) {
            this.parent.kernelModules = [
                { name: 'ext4', size: 847872, used: 2, usedBy: [] },
                { name: 'mbcache', size: 16384, used: 1, usedBy: ['ext4'] },
                { name: 'jbd2', size: 143360, used: 1, usedBy: ['ext4'] },
                { name: 'xfs', size: 1273856, used: 1, usedBy: [] },
                { name: 'sd_mod', size: 53248, used: 3, usedBy: [] },
                { name: 'sg', size: 40960, used: 0, usedBy: [] },
                { name: 'virtio_blk', size: 20480, used: 2, usedBy: [] },
                { name: 'virtio_scsi', size: 24576, used: 0, usedBy: [] },
                { name: 'virtio_net', size: 57344, used: 0, usedBy: [] },
                { name: 'net_failover', size: 20480, used: 1, usedBy: ['virtio_net'] },
                { name: 'virtio_pci', size: 28672, used: 0, usedBy: ['virtio_blk', 'virtio_net', 'virtio_scsi'] },
                { name: 'virtio_ring', size: 32768, used: 4, usedBy: ['virtio_blk', 'virtio_net', 'virtio_pci', 'virtio_scsi'] },
                { name: 'virtio', size: 20480, used: 4, usedBy: ['virtio_blk', 'virtio_net', 'virtio_pci', 'virtio_ring', 'virtio_scsi'] },
                { name: 'serio_raw', size: 16384, used: 0, usedBy: [] },
                { name: 'ata_piix', size: 36864, used: 0, usedBy: [] },
                { name: 'libata', size: 266240, used: 1, usedBy: ['ata_piix'] },
                { name: 'dm_mirror', size: 28672, used: 0, usedBy: [] },
                { name: 'dm_region_hash', size: 20480, used: 1, usedBy: ['dm_mirror'] },
                { name: 'dm_log', size: 20480, used: 2, usedBy: ['dm_mirror', 'dm_region_hash'] },
                { name: 'dm_mod', size: 151552, used: 8, usedBy: ['dm_mirror', 'dm_log'] }
            ];
        }
    }

    lsmod(args) {
        // List loaded kernel modules
        let output = ['Module                  Size  Used by'];
        
        for (const mod of this.parent.kernelModules) {
            const usedByStr = mod.usedBy.length > 0 ? mod.usedBy.join(',') : '';
            output.push(`${mod.name.padEnd(23)} ${String(mod.size).padStart(6)} ${String(mod.used).padStart(2)} ${usedByStr}`);
        }
        
        return { output: output.join('\n') };
    }

    modprobe(args) {
        // Load/unload kernel modules
        if (this.fs.currentUid !== 0) {
            return { error: 'modprobe: ERROR: could not insert module: Operation not permitted' };
        }
        
        if (args.length === 0) {
            return { error: 'modprobe: missing module name\nTry \'modprobe --help\' for more information.' };
        }
        
        const flags = this.parseFlags(args, ['r', 'v', 'a', 'l']);
        
        // Remove module (-r)
        if (flags.r) {
            const moduleName = flags.args[0];
            if (!moduleName) {
                return { error: 'modprobe: missing module name' };
            }
            
            const moduleIndex = this.parent.kernelModules.findIndex(m => m.name === moduleName);
            if (moduleIndex === -1) {
                return { error: `modprobe: FATAL: Module ${moduleName} not found.` };
            }
            
            const module = this.parent.kernelModules[moduleIndex];
            if (module.used > 0) {
                return { error: `modprobe: FATAL: Module ${moduleName} is in use.` };
            }
            
            this.parent.kernelModules.splice(moduleIndex, 1);
            return { output: '' };
        }
        
        // List modules (-l)
        if (flags.l) {
            const pattern = flags.args[0] || '*';
            const kernelVersion = '5.14.0-362.8.1.el9_3.x86_64';
            const modulePath = `/lib/modules/${kernelVersion}/kernel/drivers`;
            
            return { output: `${modulePath}/net/ethernet/virtio_net.ko.xz
${modulePath}/block/virtio_blk.ko.xz
${modulePath}/scsi/virtio_scsi.ko.xz
${modulePath}/char/virtio_console.ko.xz
${modulePath}/gpu/drm/virtio/virtio-gpu.ko.xz` };
        }
        
        // Load module
        const moduleName = flags.args[0];
        if (!moduleName) {
            return { error: 'modprobe: missing module name' };
        }
        
        // Check if already loaded
        const existingModule = this.parent.kernelModules.find(m => m.name === moduleName);
        if (existingModule) {
            return { output: '' }; // Already loaded, silent success
        }
        
        // Simulate loading a new module
        const availableModules = {
            'nfs': { size: 532480, description: 'Network File System v4' },
            'nfsd': { size: 565248, description: 'NFS Server' },
            'cifs': { size: 843776, description: 'Common Internet File System' },
            'vfat': { size: 20480, description: 'VFAT filesystem support' },
            'fat': { size: 81920, description: 'FAT filesystem support' },
            'dm_crypt': { size: 49152, description: 'Device mapper crypto target' },
            'loop': { size: 32768, description: 'Loopback device support' }
        };
        
        if (availableModules[moduleName]) {
            this.parent.kernelModules.push({
                name: moduleName,
                size: availableModules[moduleName].size,
                used: 0,
                usedBy: []
            });
            return { output: '' };
        }
        
        return { error: `modprobe: FATAL: Module ${moduleName} not found in directory /lib/modules/5.14.0-362.8.1.el9_3.x86_64` };
    }

    modinfo(args) {
        // Display module information
        if (args.length === 0) {
            return { error: 'modinfo: missing module name\nTry \'modinfo --help\' for more information.' };
        }
        
        const moduleName = args[0];
        
        // Common module info database
        const moduleInfo = {
            'ext4': {
                filename: '/lib/modules/5.14.0-362.8.1.el9_3.x86_64/kernel/fs/ext4/ext4.ko.xz',
                description: 'Fourth Extended Filesystem',
                author: 'Remy Card, Stephen Tweedie, et al.',
                license: 'GPL',
                depends: 'mbcache,jbd2',
                vermagic: '5.14.0-362.8.1.el9_3.x86_64 SMP preempt mod_unload modversions'
            },
            'virtio_net': {
                filename: '/lib/modules/5.14.0-362.8.1.el9_3.x86_64/kernel/drivers/net/virtio_net.ko.xz',
                description: 'Virtio network driver',
                author: 'Rusty Russell <rusty@rustcorp.com.au>',
                license: 'GPL',
                depends: 'net_failover,virtio,virtio_ring',
                vermagic: '5.14.0-362.8.1.el9_3.x86_64 SMP preempt mod_unload modversions'
            },
            'xfs': {
                filename: '/lib/modules/5.14.0-362.8.1.el9_3.x86_64/kernel/fs/xfs/xfs.ko.xz',
                description: 'SGI XFS filesystem',
                author: 'Silicon Graphics, Inc.',
                license: 'GPL',
                depends: '',
                vermagic: '5.14.0-362.8.1.el9_3.x86_64 SMP preempt mod_unload modversions'
            }
        };
        
        const info = moduleInfo[moduleName];
        if (!info) {
            return { error: `modinfo: ERROR: Module ${moduleName} not found.` };
        }
        
        let output = [];
        output.push(`filename:       ${info.filename}`);
        output.push(`description:    ${info.description}`);
        output.push(`author:         ${info.author}`);
        output.push(`license:        ${info.license}`);
        if (info.depends) {
            output.push(`depends:        ${info.depends}`);
        }
        output.push(`retpoline:      Y`);
        output.push(`vermagic:       ${info.vermagic}`);
        output.push(`sig_id:         PKCS#7`);
        output.push(`signer:         Red Hat Enterprise Linux kernel signing key`);
        
        return { output: output.join('\n') };
    }

    insmod(args) {
        // Insert kernel module (low-level, doesn't handle dependencies)
        if (this.fs.currentUid !== 0) {
            return { error: 'insmod: ERROR: could not insert module: Operation not permitted' };
        }
        
        if (args.length === 0) {
            return { error: 'insmod: ERROR: missing module path\nUsage: insmod filename [args]' };
        }
        
        const modulePath = args[0];
        const moduleName = modulePath.split('/').pop().replace(/\.ko(\.xz)?$/, '');
        
        // Check if module file exists
        if (!modulePath.endsWith('.ko') && !modulePath.endsWith('.ko.xz')) {
            return { error: `insmod: ERROR: could not load module ${modulePath}: No such file or directory` };
        }
        
        // Check if already loaded
        const existingModule = this.parent.kernelModules.find(m => m.name === moduleName);
        if (existingModule) {
            return { error: `insmod: ERROR: could not insert '${moduleName}': File exists` };
        }
        
        // Load module (simplified, no dependency checking)
        this.parent.kernelModules.push({
            name: moduleName,
            size: 32768,
            used: 0,
            usedBy: []
        });
        
        return { output: '' };
    }

    rmmod(args) {
        // Remove kernel module (low-level)
        if (this.fs.currentUid !== 0) {
            return { error: 'rmmod: ERROR: could not remove module: Operation not permitted' };
        }
        
        if (args.length === 0) {
            return { error: 'rmmod: ERROR: missing module name\nUsage: rmmod [options] modulename' };
        }
        
        const moduleName = args[0];
        const moduleIndex = this.parent.kernelModules.findIndex(m => m.name === moduleName);
        
        if (moduleIndex === -1) {
            return { error: `rmmod: ERROR: Module ${moduleName} is not currently loaded` };
        }
        
        const module = this.parent.kernelModules[moduleIndex];
        
        // Check if module is in use
        if (module.used > 0) {
            return { error: `rmmod: ERROR: Module ${moduleName} is in use` };
        }
        
        // Check if other modules depend on this one
        const dependentModules = this.parent.kernelModules.filter(m => 
            m.usedBy.includes(moduleName)
        );
        
        if (dependentModules.length > 0) {
            return { error: `rmmod: ERROR: Module ${moduleName} is in use by: ${dependentModules.map(m => m.name).join(' ')}` };
        }
        
        // Remove module
        this.parent.kernelModules.splice(moduleIndex, 1);
        return { output: '' };
    }

    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (validFlags.includes(char)) {
                        flags[char] = true;
                    }
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        flags.args = remainingArgs;
        return flags;
    }
}

if (typeof window !== 'undefined') {
    window.KernelModuleCommands = KernelModuleCommands;
}
