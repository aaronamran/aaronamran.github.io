/** Red Cat - Section 5: Storage - Partitions & LVM */

/**
 * Section 5 Output Generator — called for Audit tasks and Implementation task.id===5
 *
 * set1 task flow:
 *   id1  Audit  lsblk                      → raw disk tree
 *   id2  Audit  blkid/lsblk /dev/sdb       → raw disk info (before pvcreate)
 *   id3  Impl   pvcreate /dev/sdb1         → silent (no output from generateSimulatedOutput)
 *   id4  Audit  pvdisplay/pvs/pvscan       → sdb1 as PV, no VG yet
 *   id5  Impl   vgcreate vg_data           → passthrough (task.id===5 exception in core)
 *   id6  Audit  vgdisplay/vgs/vgscan       → vg_data with sdb1
 *   id7  Impl   lvcreate lv_app 2G         → silent
 *   id8  Audit  lvdisplay/lvs/lvscan       → lv_app 2.00g in vg_data
 *   id9  Impl   lvextend +500M lv_app      → silent
 */
function generateSection5Output(command, input, tokens) {

    // ── lsblk ─────────────────────────────────────────────────────────────────
    if (command === 'lsblk') {
        if (input.includes('/dev/sdb') || (tokens.length > 1 && tokens[1] === 'sdb')) {
            // task 2: lsblk /dev/sdb — disk + partition present, no LVM yet
            return 'NAME   MAJ:MIN RM SIZE RO TYPE MOUNTPOINT\nsdb      8:16   0  10G  0 disk \n└─sdb1   8:17   0  10G  0 part ';
        }
        // task 1: lsblk — all block devices, sdb/sdc are raw disks
        return 'NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\nsda             8:0    0   20G  0 disk \n├─sda1          8:1    0    1G  0 part /boot\n└─sda2          8:2    0   19G  0 part \n  ├─rhel-root 253:0    0   17G  0 lvm  /\n  └─rhel-swap 253:1    0    2G  0 lvm  [SWAP]\nsdb             8:16   0   10G  0 disk \n└─sdb1          8:17   0   10G  0 part \nsdc             8:32   0    5G  0 disk \n└─sdc1          8:33   0    5G  0 part \nsr0            11:0    1 1024M  0 rom  ';
    }

    // ── blkid (task 2) ────────────────────────────────────────────────────────
    if (command === 'blkid') {
        // /dev/sdb before pvcreate: disk has no filesystem signature — real blkid returns nothing
        return '';
    }

    // ── pvdisplay / pvs / pvscan ──────────────────────────────────────────────
    // Handles both /dev/sdb1 (set1) and /dev/sdc1 (set2/set3)
    if (command === 'pvdisplay') {
        if (input.includes('/dev/sdc1')) {
            return '  --- Physical volume ---\n  PV Name               /dev/sdc1\n  VG Name               \n  PV Size               <5.00 GiB\n  Allocatable           yes\n  PE Size               4.00 MiB\n  Total PE              1279\n  Free PE               1279\n  Allocated PE          0\n  PV UUID               c9d8e7-f6a5-b4c3-d2e1-f0a9b8c7d6e5';
        }
        return '  --- Physical volume ---\n  PV Name               /dev/sdb1\n  VG Name               \n  PV Size               <10.00 GiB\n  Allocatable           yes\n  PE Size               4.00 MiB\n  Total PE              2559\n  Free PE               2559\n  Allocated PE          0\n  PV UUID               a1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5';
    }

    if (command === 'pvs') {
        if (input.includes('/dev/sdc1')) {
            return '  PV         VG     Fmt  Attr PSize   PFree  \n  /dev/sdc1         lvm2 a--   <5.00g <5.00g';
        }
        return '  PV         VG     Fmt  Attr PSize    PFree   \n  /dev/sdb1         lvm2 a--   <10.00g <10.00g';
    }

    if (command === 'pvscan') {
        // Show appropriate PV based on context
        if (input.includes('/dev/sdc1') || tokens.some(t => t === '/dev/sdc1')) {
            return '  PV /dev/sdc1                      lvm2 [<5.00 GiB]\n  Total: 1 [<5.00 GiB] / in use: 0 [0   ] / in no VG: 1 [<5.00 GiB]';
        }
        return '  PV /dev/sdb1                      lvm2 [<10.00 GiB]\n  Total: 1 [<10.00 GiB] / in use: 0 [0   ] / in no VG: 1 [<10.00 GiB]';
    }

    // ── vgdisplay / vgs / vgscan ──────────────────────────────────────────────
    // Handles vg_data (set1), vg_backup (set2), vg_prod (set3)
    if (command === 'vgdisplay') {
        if (input.includes('vg_backup') || tokens.some(t => t === 'vg_backup')) {
            return '  --- Volume group ---\n  VG Name               vg_backup\n  System ID             \n  Format                lvm2\n  Metadata Areas        1\n  Metadata Sequence No  1\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                0\n  Open LV               0\n  Max PV                0\n  Cur PV                1\n  Act PV                1\n  VG Size               <5.00 GiB\n  PE Size               4.00 MiB\n  Total PE              1279\n  Alloc PE / Size       0 / 0   \n  Free  PE / Size       1279 / <5.00 GiB\n  VG UUID               Yc2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c';
        }
        if (input.includes('vg_prod') || tokens.some(t => t === 'vg_prod')) {
            return '  --- Volume group ---\n  VG Name               vg_prod\n  System ID             \n  Format                lvm2\n  Metadata Areas        1\n  Metadata Sequence No  1\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                0\n  Open LV               0\n  Max PV                0\n  Cur PV                1\n  Act PV                1\n  VG Size               <5.00 GiB\n  PE Size               4.00 MiB\n  Total PE              1279\n  Alloc PE / Size       0 / 0   \n  Free  PE / Size       1279 / <5.00 GiB\n  VG UUID               Zd3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';
        }
        return '  --- Volume group ---\n  VG Name               vg_data\n  System ID             \n  Format                lvm2\n  Metadata Areas        1\n  Metadata Sequence No  1\n  VG Access             read/write\n  VG Status             resizable\n  MAX LV                0\n  Cur LV                0\n  Open LV               0\n  Max PV                0\n  Cur PV                1\n  Act PV                1\n  VG Size               <10.00 GiB\n  PE Size               4.00 MiB\n  Total PE              2559\n  Alloc PE / Size       0 / 0   \n  Free  PE / Size       2559 / <10.00 GiB\n  VG UUID               Xb1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b';
    }

    if (command === 'vgs') {
        if (input.includes('vg_backup') || tokens.some(t => t === 'vg_backup')) {
            return '  VG        #PV #LV #SN Attr   VSize   VFree  \n  vg_backup   1   0   0 wz--n- <5.00g <5.00g';
        }
        if (input.includes('vg_prod') || tokens.some(t => t === 'vg_prod')) {
            return '  VG      #PV #LV #SN Attr   VSize   VFree  \n  vg_prod   1   0   0 wz--n- <5.00g <5.00g';
        }
        return '  VG      #PV #LV #SN Attr   VSize    VFree   \n  vg_data   1   0   0 wz--n- <10.00g <10.00g';
    }

    if (command === 'vgscan') {
        if (input.includes('vg_backup')) {
            return '  Reading volume groups from cache.\n  Found volume group "vg_backup" using metadata type lvm2';
        }
        if (input.includes('vg_prod')) {
            return '  Reading volume groups from cache.\n  Found volume group "vg_prod" using metadata type lvm2';
        }
        return '  Reading volume groups from cache.\n  Found volume group "vg_data" using metadata type lvm2';
    }

    // ── lvdisplay / lvs / lvscan ──────────────────────────────────────────────
    // Handles lv_app (set1), lv_logs (set2), lv_web (set3)
    if (command === 'lvdisplay') {
        if (input.includes('lv_logs') || input.includes('vg_backup')) {
            return '  --- Logical volume ---\n  LV Path                /dev/vg_backup/lv_logs\n  LV Name                lv_logs\n  VG Name                vg_backup\n  LV UUID                Lv2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c\n  LV Write Access        read/write\n  LV Creation host, time rhcsa-lab, Tue Apr 07 2026\n  LV Status              available\n  # open                 0\n  LV Size                1.00 GiB\n  Current LE             256\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:3';
        }
        if (input.includes('lv_web') || input.includes('vg_prod')) {
            return '  --- Logical volume ---\n  LV Path                /dev/vg_prod/lv_web\n  LV Name                lv_web\n  VG Name                vg_prod\n  LV UUID                Lv3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d\n  LV Write Access        read/write\n  LV Creation host, time rhcsa-lab, Tue Apr 07 2026\n  LV Status              available\n  # open                 0\n  LV Size                1.50 GiB\n  Current LE             384\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:4';
        }
        return '  --- Logical volume ---\n  LV Path                /dev/vg_data/lv_app\n  LV Name                lv_app\n  VG Name                vg_data\n  LV UUID                Lv1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b\n  LV Write Access        read/write\n  LV Creation host, time rhcsa-lab, Tue Apr 07 2026\n  LV Status              available\n  # open                 0\n  LV Size                2.00 GiB\n  Current LE             512\n  Segments               1\n  Allocation             inherit\n  Read ahead sectors     auto\n  - currently set to     256\n  Block device           253:2';
    }

    if (command === 'lvs') {
        if (input.includes('lv_logs') || input.includes('vg_backup')) {
            return '  LV      VG        Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_logs vg_backup -wi-a----- 1.00g';
        }
        if (input.includes('lv_web') || input.includes('vg_prod')) {
            return '  LV     VG      Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_web vg_prod -wi-a----- 1.50g';
        }
        return '  LV     VG      Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_app vg_data -wi-a-----  2.00g';
    }

    if (command === 'lvscan') {
        if (input.includes('lv_logs') || input.includes('vg_backup')) {
            return "  ACTIVE            '/dev/vg_backup/lv_logs' [1.00 GiB] inherit";
        }
        if (input.includes('lv_web') || input.includes('vg_prod')) {
            return "  ACTIVE            '/dev/vg_prod/lv_web' [1.50 GiB] inherit";
        }
        return "  ACTIVE            '/dev/vg_data/lv_app' [2.00 GiB] inherit";
    }

    // ── vgcreate passthrough ──────────────────────────────────────────────────
    if (command === 'vgcreate') {
        const vgName = tokens.find((t, i) => i > 0 && !t.startsWith('-'));
        return vgName ? `  Volume group "${vgName}" successfully created` : null;
    }

    return null;
}

/**
 * Section 5 Pre-Check Generator — called for allowed pre-checks on Implementation tasks
 *
 * task.id dispatch is safe here because:
 *   set1 Audit tasks (1,2,4,6,8) never reach pre-check handlers
 *   set2 has only 4 tasks, so ids 5,7,9 are exclusive to set1
 *   ids 1,2,3 shared between sets are disambiguated by command name
 */
function generateSection5PreCheck(task, command, input, tokens) {

    // ── set3 task 1: pvs/pvdisplay/pvscan (audit all PVs - show none initially) ───
    if (task.id === 1) {
        if (command === 'pvs') {
            return '  PV         VG     Fmt  Attr PSize PFree';
        }
        if (command === 'pvdisplay') {
            return '  No physical volumes found';
        }
        if (command === 'pvscan') {
            return '  No matching physical volumes found';
        }
    }

    // ── set3 task 2: pvcreate /dev/sdc1 (pre-check: pvs/pvdisplay — not PV yet) ──
    // ── set2 task 1: pvcreate /dev/sdc1 (pre-check: pvs — no PVs yet) ────────
    if (task.id === 2 || (task.id === 1 && command === 'pvs' && input.includes('set2'))) {
        if (command === 'pvs' && input.includes('/dev/sdc1')) {
            return '  Failed to find device "/dev/sdc1".';
        }
        if (command === 'pvs') {
            return '  PV         VG     Fmt  Attr PSize PFree';
        }
        if (command === 'pvdisplay' && input.includes('/dev/sdc1')) {
            return '  Failed to find physical volume "/dev/sdc1".';
        }
    }

    // ── task 3 (set1: pvcreate /dev/sdb1 | set2: lvcreate lv_logs | set3: pvs audit after pvcreate) ───
    if (task.id === 3) {
        // set1 pre-checks: pvdisplay/pvs/pvscan for /dev/sdb1 (not a PV yet)
        if (command === 'pvdisplay' && input.includes('/dev/sdb1')) {
            return '  Failed to find physical volume "/dev/sdb1".';
        }
        if (command === 'pvs' && input.includes('/dev/sdb1')) {
            return '  Failed to find device "/dev/sdb1".';
        }
        if (command === 'pvscan' && !input.includes('vg_prod')) {
            return '  No matching physical volumes found';
        }
        // set2 pre-check: lvs before lvcreate lv_logs (vg_backup exists, no LVs yet)
        // set3: after pvcreate, show /dev/sdc1 as PV
        if (command === 'lvs') {
            return '  LV     VG     Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert';
        }
        if (command === 'pvs' && input.includes('/dev/sdc1')) {
            return '  PV         VG     Fmt  Attr PSize   PFree  \n  /dev/sdc1         lvm2 a--   <5.00g <5.00g';
        }
        if (command === 'pvdisplay' && input.includes('/dev/sdc1')) {
            return '  --- Physical volume ---\n  PV Name               /dev/sdc1\n  VG Name               \n  PV Size               <5.00 GiB\n  Allocatable           yes\n  PE Size               4.00 MiB\n  Total PE              1279\n  Free PE               1279\n  Allocated PE          0\n  PV UUID               c9d8e7-f6a5-b4c3-d2e1-f0a9b8c7d6e5';
        }
        if (command === 'pvscan' && input.includes('vg_prod')) {
            return '  PV /dev/sdc1                      lvm2 [<5.00 GiB]\n  Total: 1 [<5.00 GiB] / in use: 0 [0   ] / in no VG: 1 [<5.00 GiB]';
        }
    }

    // ── set2 task 2: vgcreate vg_backup (pre-check: vgs — no VGs yet) ────────
    // ── set3 task 4: vgcreate vg_prod (pre-check: vgs/vgdisplay) ─────────────
    if (task.id === 4 || (task.id === 2 && command === 'vgs')) {
        if (command === 'vgs') {
            return '  VG     #PV #LV #SN Attr   VSize VFree';
        }
        if (command === 'vgdisplay') {
            return '  No volume groups found';
        }
    }

    // ── set2 task 4: lvextend /dev/vg_backup/lv_logs (pre-check: lvs) ────────
    if (task.id === 4 && command === 'lvs' && input.includes('vg_backup')) {
        return '  LV      VG        Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_logs vg_backup -wi-a----- 1.00g';
    }

    // ── set1 task 5: vgcreate vg_data (pre-check: vgdisplay/vgs/vgscan) ──────
    // ── set3 task 5: vgs/vgdisplay/vgscan audit after vgcreate vg_prod ───────
    if (task.id === 5) {
        if (command === 'vgdisplay' && !input.includes('vg_prod')) {
            return '  Volume group "vg_data" not found\n  Cannot process volume group vg_data';
        }
        if (command === 'vgdisplay' && input.includes('vg_prod')) {
            return '  --- Volume group ---\n  VG Name               vg_prod\n  System ID             \n  Format                lvm2\n  VG Size               <5.00 GiB\n  PE Size               4.00 MiB\n  Total PE              1279\n  Alloc PE / Size       0 / 0   \n  Free  PE / Size       1279 / <5.00 GiB';
        }
        if (command === 'vgs' && !input.includes('vg_prod')) {
            return '  VG     #PV #LV #SN Attr   VSize VFree';
        }
        if (command === 'vgs' && input.includes('vg_prod')) {
            return '  VG      #PV #LV #SN Attr   VSize   VFree  \n  vg_prod   1   0   0 wz--n- <5.00g <5.00g';
        }
        if (command === 'vgscan' && !input.includes('vg_prod')) {
            return '  Reading volume groups from cache.\n  No volume groups found.';
        }
        if (command === 'vgscan' && input.includes('vg_prod')) {
            return '  Reading volume groups from cache.\n  Found volume group "vg_prod" using metadata type lvm2';
        }
    }

    // ── set3 task 6: lvcreate lv_web (pre-check: lvs/lvdisplay) ──────────────
    if (task.id === 6) {
        if (command === 'lvs') {
            return '  LV     VG     Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert';
        }
        if (command === 'lvdisplay') {
            return '  No volume groups found';
        }
    }

    // ── set1 task 7: lvcreate lv_app (pre-check: lvdisplay/lvs/lvscan) ───────
    // ── set3 task 7: lvs/lvdisplay audit after lvcreate lv_web ───────────────
    if (task.id === 7) {
        if (command === 'lvdisplay' && !input.includes('vg_prod')) {
            return '  Failed to find logical volume "vg_data/lv_app".';
        }
        if (command === 'lvdisplay' && input.includes('vg_prod')) {
            return '  --- Logical volume ---\n  LV Path                /dev/vg_prod/lv_web\n  LV Name                lv_web\n  VG Name                vg_prod\n  LV Size                1.50 GiB\n  Block device           253:4';
        }
        if (command === 'lvs' && !input.includes('vg_prod')) {
            return '  LV     VG     Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert';
        }
        if (command === 'lvs' && input.includes('vg_prod')) {
            return '  LV     VG      Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_web vg_prod -wi-a----- 1.50g';
        }
        if (command === 'lvscan') {
            return '  No volume groups found';
        }
    }

    // ── set3 task 8: lvextend +500M /dev/vg_prod/lv_web (pre-check) ──────────
    // ── set1 task 9: lvextend +500M /dev/vg_data/lv_app (pre-check) ──────────
    if (task.id === 8 || task.id === 9) {
        if (command === 'lvdisplay' && input.includes('vg_prod')) {
            return '  --- Logical volume ---\n  LV Path                /dev/vg_prod/lv_web\n  LV Name                lv_web\n  VG Name                vg_prod\n  LV Write Access        read/write\n  LV Status              available\n  # open                 0\n  LV Size                1.50 GiB\n  Current LE             384\n  Block device           253:4';
        }
        if (command === 'lvdisplay' && input.includes('vg_data')) {
            return '  --- Logical volume ---\n  LV Path                /dev/vg_data/lv_app\n  LV Name                lv_app\n  VG Name                vg_data\n  LV UUID                Lv1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b\n  LV Write Access        read/write\n  LV Status              available\n  # open                 0\n  LV Size                2.00 GiB\n  Current LE             512\n  Block device           253:2';
        }
        if (command === 'lvs' && input.includes('vg_prod')) {
            return '  LV     VG      Attr       LSize Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_web vg_prod -wi-a----- 1.50g';
        }
        if (command === 'lvs' && input.includes('vg_data')) {
            return '  LV     VG      Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert\n  lv_app vg_data -wi-a----- 2.00g';
        }
    }

    return null;
}

