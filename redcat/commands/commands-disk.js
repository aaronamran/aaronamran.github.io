// Disk and LVM Management Commands
// Part of Red Cat RHCSA Terminal Simulator

class DiskCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.disks = sharedState.disks;
        this.pvs = sharedState.pvs;
        this.vgs = sharedState.vgs;
        this.lvs = sharedState.lvs;
    }

    // Placeholder - commands will be moved here
    // df, du, lsblk, blkid, fdisk, parted
    // pvcreate, pvs, pvdisplay, vgcreate, vgs, vgdisplay
    // lvcreate, lvs, lvdisplay, lvextend, lvreduce
    // mkswap, swapon, swapoff, mount, umount, findmnt
    // fsck, showmount, exportfs, autofs

    df(args) {
        const flags = this.parseFlags(args, ['h', 'T']);
        
        if (flags.h) {
            return { output: `Filesystem                Size  Used Avail Use% Mounted on
devtmpfs                  886M     0  886M   0% /dev
tmpfs                     915M     0  915M   0% /dev/shm
tmpfs                     915M  8.5M  907M   1% /run
/dev/mapper/rhel-root      17G  4.2G   13G  25% /
/dev/sda1                1014M  234M  781M  24% /boot
tmpfs                     183M     0  183M   0% /run/user/0` };
        }
        
        return { output: `Filesystem              1K-blocks    Used Available Use% Mounted on
devtmpfs                   906752       0    906752   0% /dev
tmpfs                      936960       0    936960   0% /dev/shm
tmpfs                      936960    8704    928256   1% /run
/dev/mapper/rhel-root    17811456 4402176  13409280  25% /
/dev/sda1                 1038336  239616    798720  24% /boot
tmpfs                      187392       0    187392   0% /run/user/0` };
    }

    du(args) {
        const flags = this.parseFlags(args, ['h', 's', 'a']);
        const path = flags.args[0] || this.fs.currentPath;
        
        if (flags.h && flags.s) {
            return { output: `4.5M\t${path}` };
        }
        
        if (flags.s) {
            return { output: `4608\t${path}` };
        }
        
        return { output: `128\t${path}/subdir1\n256\t${path}/subdir2\n4608\t${path}` };
    }

    lsblk(args) {
        const flags = this.parseFlags(args, ['f', 'a']);
        
        return { output: `NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda             8:0    0   20G  0 disk
├─sda1          8:1    0    1G  0 part /boot
└─sda2          8:2    0   19G  0 part
  ├─rhel-root 253:0    0   17G  0 lvm  /
  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]
sr0            11:0    1 1024M  0 rom` };
    }

    blkid(args) {
        return { output: `/dev/sda1: UUID="12345678-1234-1234-1234-123456789abc" TYPE="xfs"
/dev/sda2: UUID="abcdef12-3456-7890-abcd-ef1234567890" TYPE="LVM2_member"
/dev/mapper/rhel-root: UUID="fedcba98-7654-3210-fedc-ba9876543210" TYPE="xfs"
/dev/mapper/rhel-swap: UUID="11111111-2222-3333-4444-555555555555" TYPE="swap"` };
    }

    fdisk(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'fdisk: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l']);
        
        if (flags.l) {
            return { output: `Disk /dev/sda: 20 GiB, 21474836480 bytes, 41943040 sectors
Disk model: Virtual Disk    
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x12345678

Device     Boot   Start      End  Sectors  Size Id Type
/dev/sda1  *       2048  2099199  2097152    1G 83 Linux
/dev/sda2       2099200 41943039 39843840   19G 8e Linux LVM


Disk /dev/sdb: 10 GiB, 10737418240 bytes, 20971520 sectors
Disk model: Virtual Disk    
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes` };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'fdisk: must specify device' };
        }
        
        return { output: `Welcome to fdisk (util-linux 2.37.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help):` };
    }

    parted(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'parted: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['l']);
        
        if (flags.l) {
            return { output: `Model: VMware Virtual disk (scsi)
Disk /dev/sda: 21.5GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags: 

Number  Start   End     Size    Type     File system  Flags
 1      1049kB  1075MB  1074MB  primary  xfs          boot
 2      1075MB  21.5GB  20.4GB  primary               lvm


Model: VMware Virtual disk (scsi)
Disk /dev/sdb: 10.7GB
Sector size (logical/physical): 512B/512B
Partition Table: msdos
Disk Flags:` };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'parted: must specify device' };
        }
        
        return { output: `GNU Parted 3.5
Using ${device}
Welcome to GNU Parted! Type 'help' to view a list of commands.
(parted)` };
    }

    pvcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'pvcreate: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'pvcreate: Please enter a physical volume path' };
        }
        
        const device = args[0];
        
        // Initialize LVM metadata if not exists
        if (!this.lvmMetadata) {
            this.lvmMetadata = {
                physicalVolumes: {},
                volumeGroups: {},
                logicalVolumes: {}
            };
        }
        
        // Create physical volume
        this.lvmMetadata.physicalVolumes[device] = {
            name: device,
            vg: null,
            size: '10.00g',
            free: '10.00g',
            uuid: this.generateUUID()
        };
        
        return { output: `  Physical volume "${device}" successfully created.` };
    }

    pvs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.physicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = '  PV         VG     Fmt  Attr PSize  PFree \n';
        for (const [name, pv] of Object.entries(this.lvmMetadata.physicalVolumes)) {
            const vg = pv.vg || '';
            output += `  ${name.padEnd(10)} ${vg.padEnd(6)} lvm2 a--  ${pv.size.padEnd(6)} ${pv.free}\n`;
        }
        return { output };
    }

    pvdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.physicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [name, pv] of Object.entries(this.lvmMetadata.physicalVolumes)) {
            output.push(`  --- Physical volume ---
  PV Name               ${name}
  VG Name               ${pv.vg || ''}
  PV Size               ${pv.size}
  Allocatable           yes
  PE Size               4.00 MiB
  Total PE              2559
  Free PE               2559
  Allocated PE          0
  PV UUID               ${pv.uuid}\n`);
        }
        return { output: output.join('\n') };
    }

    vgcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'vgcreate: Permission denied' };
        }
        
        if (args.length < 2) {
            return { error: 'vgcreate: Please provide volume group name and physical volume(s)' };
        }
        
        const vgName = args[0];
        const pvs = args.slice(1);
        
        if (!this.lvmMetadata) {
            return { error: 'vgcreate: Physical volume(s) not found. Run pvcreate first.' };
        }
        
        // Check if all PVs exist
        for (const pv of pvs) {
            if (!this.lvmMetadata.physicalVolumes[pv]) {
                return { error: `vgcreate: Physical volume "${pv}" not found` };
            }
        }
        
        // Create volume group
        this.lvmMetadata.volumeGroups[vgName] = {
            name: vgName,
            pvs: pvs,
            size: '10.00g',
            free: '10.00g',
            lvCount: 0,
            uuid: this.generateUUID()
        };
        
        // Update PVs to reference this VG
        for (const pv of pvs) {
            this.lvmMetadata.physicalVolumes[pv].vg = vgName;
        }
        
        return { output: `  Volume group "${vgName}" successfully created` };
    }

    vgs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.volumeGroups).length === 0) {
            return { output: '' };
        }
        
        let output = '  VG     #PV #LV #SN Attr   VSize  VFree \n';
        for (const [name, vg] of Object.entries(this.lvmMetadata.volumeGroups)) {
            output += `  ${name.padEnd(6)} ${String(vg.pvs.length).padStart(3)} ${String(vg.lvCount).padStart(3)}   0 wz--n- ${vg.size.padEnd(6)} ${vg.free}\n`;
        }
        return { output };
    }

    vgdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.volumeGroups).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [name, vg] of Object.entries(this.lvmMetadata.volumeGroups)) {
            output.push(`  --- Volume group ---
  VG Name               ${name}
  System ID             
  Format                lvm2
  Metadata Areas        ${vg.pvs.length}
  Metadata Sequence No  1
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                ${vg.lvCount}
  Open LV               0
  Max PV                0
  Cur PV                ${vg.pvs.length}
  Act PV                ${vg.pvs.length}
  VG Size               ${vg.size}
  PE Size               4.00 MiB
  Total PE              2559
  Alloc PE / Size       0 / 0   
  Free  PE / Size       2559 / ${vg.free}
  VG UUID               ${vg.uuid}\n`);
        }
        return { output: output.join('\n') };
    }

    lvcreate(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvcreate: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'n']);
        
        let size = null;
        let name = null;
        let vgName = null;
        
        // Parse -L flag (size)
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                size = args[lIndex + 1];
            }
        }
        
        // Parse -n flag (name)
        if (flags.n) {
            const nIndex = args.indexOf('-n');
            if (nIndex !== -1 && args[nIndex + 1]) {
                name = args[nIndex + 1];
            }
        }
        
        // VG name is the last argument
        vgName = flags.args[flags.args.length - 1];
        
        if (!size || !name || !vgName) {
            return { error: 'lvcreate: Please specify size (-L), name (-n), and volume group' };
        }
        
        if (!this.lvmMetadata || !this.lvmMetadata.volumeGroups[vgName]) {
            return { error: `lvcreate: Volume group "${vgName}" not found` };
        }
        
        const lvPath = `/dev/${vgName}/${name}`;
        
        // Create logical volume
        this.lvmMetadata.logicalVolumes[lvPath] = {
            name: name,
            vg: vgName,
            size: size,
            path: lvPath,
            uuid: this.generateUUID()
        };
        
        this.lvmMetadata.volumeGroups[vgName].lvCount++;
        
        return { output: `  Logical volume "${name}" created.` };
    }

    lvs(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.logicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = '  LV     VG     Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n';
        for (const [path, lv] of Object.entries(this.lvmMetadata.logicalVolumes)) {
            output += `  ${lv.name.padEnd(6)} ${lv.vg.padEnd(6)} -wi-a----- ${lv.size}\n`;
        }
        return { output };
    }

    lvdisplay(args) {
        if (!this.lvmMetadata || Object.keys(this.lvmMetadata.logicalVolumes).length === 0) {
            return { output: '' };
        }
        
        let output = [];
        for (const [path, lv] of Object.entries(this.lvmMetadata.logicalVolumes)) {
            output.push(`  --- Logical volume ---
  LV Path                ${path}
  LV Name                ${lv.name}
  VG Name                ${lv.vg}
  LV UUID                ${lv.uuid}
  LV Write Access        read/write
  LV Creation host, time rhcsa-lab, ${new Date().toString()}
  LV Status              available
  # open                 0
  LV Size                ${lv.size}
  Current LE             512
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           253:2\n`);
        }
        return { output: output.join('\n') };
    }

    lvextend(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvextend: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'r']);
        
        if (flags.args.length === 0) {
            return { error: 'lvextend: Please specify logical volume path' };
        }
        
        const lvPath = flags.args[0];
        
        if (!this.lvmMetadata || !this.lvmMetadata.logicalVolumes[lvPath]) {
            return { error: `lvextend: Logical volume "${lvPath}" not found` };
        }
        
        let newSize = null;
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                newSize = args[lIndex + 1];
            }
        }
        
        if (!newSize) {
            return { error: 'lvextend: Please specify new size with -L' };
        }
        
        this.lvmMetadata.logicalVolumes[lvPath].size = newSize;
        
        if (flags.r) {
            return { output: `  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.\n  Filesystem also resized.` };
        }
        
        return { output: `  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
    }

    lvreduce(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'lvreduce: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['L', 'r', 'f']);
        
        if (flags.args.length === 0) {
            return { error: 'lvreduce: Please specify logical volume path' };
        }
        
        const lvPath = flags.args[0];
        
        if (!this.lvmMetadata || !this.lvmMetadata.logicalVolumes[lvPath]) {
            return { error: `lvreduce: Logical volume "${lvPath}" not found` };
        }
        
        let newSize = null;
        if (flags.L) {
            const lIndex = args.indexOf('-L');
            if (lIndex !== -1 && args[lIndex + 1]) {
                newSize = args[lIndex + 1];
            }
        }
        
        if (!newSize) {
            return { error: 'lvreduce: Please specify new size with -L' };
        }
        
        if (!flags.f) {
            return { error: `WARNING: Reducing active logical volume to ${newSize}.\n  THIS MAY DESTROY YOUR DATA (filesystem etc.)\nDo you really want to reduce ${lvPath}? [y/n]: Operation cancelled.` };
        }
        
        this.lvmMetadata.logicalVolumes[lvPath].size = newSize;
        
        if (flags.r) {
            return { output: `  Filesystem resized.\n  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
        }
        
        return { output: `  WARNING: Reducing active logical volume to ${newSize}.\n  THIS MAY DESTROY YOUR DATA (filesystem etc.)\n  Size of logical volume ${lvPath} changed to ${newSize}.\n  Logical volume ${lvPath} successfully resized.` };
    }

    mkswap(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'mkswap: Permission denied' };
        }
        
        if (args.length === 0) {
            return { error: 'mkswap: No device specified' };
        }
        
        const device = args[0];
        
        // Initialize swap metadata if not exists
        if (!this.swapDevices) {
            this.swapDevices = {};
        }
        
        this.swapDevices[device] = {
            uuid: this.generateUUID(),
            size: '2 GiB',
            active: false
        };
        
        return { output: `Setting up swapspace version 1, size = 2 GiB (2147483648 bytes)
no label, UUID=${this.swapDevices[device].uuid}` };
    }

    swapon(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'swapon: Permission denied' };
        }
        
        if (args.length === 0) {
            // Show active swap
            if (!this.swapDevices || Object.keys(this.swapDevices).length === 0) {
                return { output: '' };
            }
            
            let output = 'NAME      TYPE      SIZE   USED PRIO\n';
            for (const [device, info] of Object.entries(this.swapDevices)) {
                if (info.active) {
                    output += `${device.padEnd(9)} partition ${info.size.padEnd(6)} 0B   -2\n`;
                }
            }
            return { output };
        }
        
        const device = args[0];
        
        if (!this.swapDevices) {
            this.swapDevices = {};
        }
        
        if (!this.swapDevices[device]) {
            return { error: `swapon: ${device}: read swap header failed` };
        }
        
        this.swapDevices[device].active = true;
        return { output: '' };
    }

    swapoff(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'swapoff: Permission denied' };
        }
        
        if (args.length === 0) {
            // Turn off all swap
            if (this.swapDevices) {
                for (const device in this.swapDevices) {
                    this.swapDevices[device].active = false;
                }
            }
            return { output: '' };
        }
        
        const device = args[0];
        
        if (!this.swapDevices || !this.swapDevices[device]) {
            return { error: `swapoff: ${device}: not found` };
        }
        
        this.swapDevices[device].active = false;
        return { output: '' };
    }

    mount(args) {
        if (args.length === 0) {
            return { output: `sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
devtmpfs on /dev type devtmpfs (rw,nosuid,size=906752k,nr_inodes=226688,mode=755)
/dev/mapper/rhel-root on / type xfs (rw,relatime,attr2,inode64,noquota)
/dev/sda1 on /boot type xfs (rw,relatime,attr2,inode64,noquota)` };
        }
        
        if (this.fs.currentUid !== 0) {
            return { error: 'mount: only root can do that' };
        }
        
        const device = args[0];
        const mountpoint = args[1];
        
        if (!device || !mountpoint) {
            return { error: 'mount: must specify device and mountpoint' };
        }
        
        return { output: '' };
    }

    umount(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'umount: only root can do that' };
        }
        
        if (args.length === 0) {
            return { error: 'umount: must specify mountpoint' };
        }
        
        return { output: '' };
    }

    findmnt(args) {
        const flags = this.parseFlags(args, ['t']);
        
        return { output: `TARGET                                SOURCE     FSTYPE     OPTIONS
/                                     /dev/mapper/rhel-root
                                                 xfs        rw,relatime,attr2,inode64,noquota
├─/sys                                sysfs      sysfs      rw,nosuid,nodev,noexec,relatime
├─/proc                               proc       proc       rw,nosuid,nodev,noexec,relatime
├─/dev                                devtmpfs   devtmpfs   rw,nosuid,size=906752k
└─/boot                               /dev/sda1  xfs        rw,relatime,attr2,inode64,noquota` };
    }

    fsck(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'fsck: Permission denied' };
        }
        
        const device = args[0];
        if (!device) {
            return { error: 'fsck: must specify device' };
        }
        
        return { output: `fsck from util-linux 2.37.4
e2fsck 1.46.5 (30-Dec-2021)
${device}: clean, 24567/65536 files, 123456/262144 blocks` };
    }

    lsof(args) {
        return { output: `COMMAND    PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
systemd      1 root  cwd    DIR  253,0     4096  128 /
systemd      1 root  txt    REG  253,0  1624520 1234 /usr/lib/systemd/systemd
sshd       234 root    3u  IPv4  12345      0t0  TCP *:22 (LISTEN)
httpd      456 root    4u  IPv4  23456      0t0  TCP *:80 (LISTEN)` };
    }

    showmount(args) {
        const flags = this.parseFlags(args, ['e', 'a']);
        
        if (flags.e) {
            const server = flags.args[0] || 'localhost';
            return { output: `Export list for ${server}:
/nfs/shared    192.168.1.0/24
/nfs/data      *(rw,sync,no_root_squash)
/home          10.0.0.0/8(rw,sync)` };
        }
        
        if (flags.a) {
            return { output: `All mount points on localhost:
192.168.1.10:/nfs/shared
192.168.1.10:/nfs/data
192.168.1.20:/home` };
        }
        
        return { output: `Hosts on localhost:\n192.168.1.10\n192.168.1.20` };
    }

    exportfs(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'exportfs: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['a', 'r', 'u', 'v']);
        
        if (flags.a && flags.r) {
            return { output: `exporting *:/nfs/shared
exporting 192.168.1.0/24:/nfs/data
exporting 10.0.0.0/8:/home` };
        }
        
        if (flags.v) {
            return { output: `/nfs/shared     192.168.1.0/24(rw,sync,wdelay,hide,nocrossmnt,secure,root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,root_squash,no_all_squash)
/nfs/data       *(rw,sync,wdelay,hide,nocrossmnt,secure,no_root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,no_root_squash,no_all_squash)
/home           10.0.0.0/8(rw,sync,wdelay,hide,nocrossmnt,secure,root_squash,no_all_squash,no_subtree_check,secure_locks,acl,no_pnfs,anonuid=65534,anongid=65534,sec=sys,rw,secure,root_squash,no_all_squash)` };
        }
        
        return { output: `/nfs/shared\t192.168.1.0/24\n/nfs/data\t*(rw,sync,no_root_squash)\n/home\t\t10.0.0.0/8(rw,sync)` };
    }

    autofs(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'autofs: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['v', 'V']);
        
        if (flags.V) {
            return { output: `Linux automount version 5.1.8` };
        }
        
        if (args[0] === 'status') {
            return { output: `● autofs.service - Automounts filesystems on demand
   Loaded: loaded (/usr/lib/systemd/system/autofs.service; enabled; vendor preset: disabled)
   Active: active (running) since ${new Date().toUTCString()}
 Main PID: 1234 (automount)
   Status: "1 mount (1 unimplemented), 1 expire"
    Tasks: 4
   Memory: 1.2M
   CGroup: /system.slice/autofs.service
           └─1234 /usr/sbin/automount --foreground --dont-check-daemon

Auto-mount points:
  /misc (auto.misc)
  /net (auto.net)` };
        }
        
        if (args[0] === 'start') {
            return { output: `Starting automount...
Loaded autofs maps from /etc/auto.master
Started automount daemon` };
        }
        
        if (args[0] === 'stop') {
            return { output: `Stopping automount daemon...
Unmounting auto-mounted filesystems
Stopped automount` };
        }
        
        if (args[0] === 'restart' || args[0] === 'reload') {
            return { output: `Reloading automount configuration...
Re-reading map configuration from /etc/auto.master
Configuration reloaded` };
        }
        
        return { output: `Usage: autofs {start|stop|restart|reload|status}
       autofs -V

Automounter daemon for on-demand mounting of filesystems.
Configuration files:
  /etc/auto.master      - Master map
  /etc/auto.misc        - Miscellaneous mounts
  /etc/auto.net         - Network mounts

Managed by systemd: systemctl {start|stop|status} autofs` };
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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
    window.DiskCommands = DiskCommands;
}
