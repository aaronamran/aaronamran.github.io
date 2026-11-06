/**
 * Red Cat - Task Data Loader
 * 
 * This file loads section data from modular section files.
 * Each section is defined in sections/section{N}-.js with 3 unique question sets.
 * 
 * Structure:
 * - sections: Array of section objects loaded from individual files
 * - Each section contains:
 *   - id: Unique identifier
 *   - title: Section name
 *   - description: What this section covers
 *   - totalPoints: Points available in this section
 *   - questionSets: Object with set1, set2, set3 arrays
 * 
 * Task structure (within each questionSet):
 * - id: Unique identifier within the question set
 * - category: Implementation or Audit
 * - description: What the user needs to do
 * - expected: Validation criteria (array of objects for multiple solutions)
 *   - command: Required command name
 *   - requiredFlags: Array of flags that must be present
 *   - requiredValues: Array of values that must be present
 * - allowedPreChecks: Commands allowed before implementation
 * - explanation: Why this is the correct solution
 * - points: Points awarded for this task
 */

// Load section data from individual files
const sections = [
    section1Data, // Essential Tools
    section2Data, // Users & Groups
    section3Data, // Permissions & ACLs
    section4Data, // Shell Scripting
    section5Data, // Storage: Partitions & LVM
    section6Data, // Storage: File Systems
    section7Data, // Remote Resources
    section8Data, // Systemd & Processes
    section9Data, // System Tuning & Analysis
    section10Data, // Networking
    section11Data, // Network Security
    section12Data, // SELinux Security
    section13Data, // Software Management
    section14Data, // Task Scheduling
    section15Data, // Boot Process & Maintenance
    section16Data, // Rootless Containers
    section17Data, // Time Services
    section18Data, // Flatpak
    section19Data, // Root Password Reset
    section20Data  // Root Password Reset (Bash Method)
];

/**
 * List of supported commands in this trainer
 * Commands not in this list will be rejected
 */
const supportedCommands = [
    'groupadd',
    'useradd',
    'usermod',
    'passwd',
    'chage',
    'mkdir',
    'chmod',
    'chown',
    'chgrp',
    'setfacl',
    'getfacl',
    'mount',
    'umount',
    'mkfs',
    'mkfs.xfs',
    'mkfs.ext4',
    'mkswap',
    'swapon',
    'swapoff',
    'blkid',
    'lsblk',
    'systemctl',
    'journalctl',
    'pidof',
    'pgrep',
    'ps',
    'kill',
    'dnf',
    'yum',
    'rpm',
    'firewall-cmd',
    'nmcli',
    'ip',
    'hostnamectl',
    'nslookup',
    'dig',
    'host',
    'podman',
    'skopeo',
    'sysctl',
    'exportfs',
    'chpasswd',
    'systemd-run',
    'traceroute',
    'showmount',
    'nfsstat',
    'tar',
    'find',
    'grep',
    'ls',
    'cat',
    'less',
    'more',
    'wc',
    'touch',
    'rm',
    'cp',
    'mv',
    'getent',
    'id',
    'echo',
    'stat',
    'df',
    'findmnt',
    'free',
    // SELinux commands
    'getenforce',
    'setenforce',
    'sestatus',
    'semanage',
    'chcon',
    'restorecon',
    'matchpathcon',
    'getsebool',
    'setsebool',
    'ausearch',
    'sealert',
    'audit2allow',
    'semodule',
    'sesearch',
    'fixfiles',
    // Shell scripting
    'bash',
    'sh',
    'test',
    'read',
    'vi',
    'sed',
    'awk',
    // Task scheduling
    'crontab',
    'anacron',
    'at',
    'atq',
    'atrm',
    'batch',
    'systemd-analyze',
    // Boot and GRUB
    'grub2-mkconfig',
    'grub2-install',
    'grubby',
    'uname',
    'dracut',
    'lsmod',
    'modprobe',
    'insmod',
    'rmmod',
    'modinfo',
    'lsinitrd',
    'dmesg',
    'chroot',
    // Time services
    'date',
    'timedatectl',
    'hwclock',
    'chronyc',
    'chronyd',
    'zdump',
    // Additional utilities
    'ln',
    'fsck',
    'tune2fs',
    'xfs_admin',
    'parted',
    'gdisk',
    'fdisk',
    'pvcreate',
    'pvs',
    'pvdisplay',
    'vgcreate',
    'vgs',
    'vgdisplay',
    'vgextend',
    'vgrename',
    'lvcreate',
    'lvs',
    'lvdisplay',
    'lvextend',
    'lvremove',
    'xfs_growfs',
    'resize2fs',
    'autofs',
    'ssh',
    'scp',
    'rsync',
    'ssh-keygen',
    'ssh-copy-id',
    'man',
    'info',
    'apropos',
    'pkill',
    'pstree',
    'nice',
    'renice',
    'tuned-adm',
    'top',
    'htop',
    'ss',
    'netstat',
    'rpcinfo',
    'package-cleanup',
    'rpm2cpio',
    'flatpak',
    'nc',
    'lsof',
    'grub2-set-default',
    'grub2-reboot',
    'grub2-setpassword',
    'grub2-editenv',
    'shutdown',
    'reboot',
    'poweroff',
    'printf',
    'seq',
    'basename',
    'dirname',
    'truncate',
    'gzip',
    'gunzip',
    'bzip2',
    'bunzip2',
    'xz',
    'unxz',
    'zcat',
    'bzcat',
    'xzcat',
    'cut',
    'head',
    'sort',
    'uniq',
    'tee',
    'cpio',
    'partprobe',
    'vgremove',
    'curl',
    'wget',
    'logger',
    'whereis',
    'locate',
    'xargs',
    'tr',
    'diff',
    'history',
    'alias',
    'env',
    'export',
    'source',
    // Added after audit: used by task answers but previously rejected
    'automount',
    'cd',
    'column',
    'command',
    'dd',
    'du',
    'e2fsck',
    'e2label',
    'egrep',
    'fallocate',
    'file',
    'for',
    'fsck.ext4',
    'gpasswd',
    'groups',
    'hostname',
    'ifconfig',
    'iostat',
    'killall',
    'last',
    'lid',
    'loginctl',
    'lvrename',
    'lvscan',
    'makewhatis',
    'mandb',
    'mkfs.vfat',
    'nano',
    'nfsiostat',
    'ping',
    'pvremove',
    'pvscan',
    'readlink',
    'rename',
    'route',
    'set',
    'sshd',
    'sudo',
    'tail',
    'telnet',
    'type',
    'umask',
    'users',
    'vgreduce',
    'vgscan',
    'vim',
    'visudo',
    'w',
    'whatis',
    'which',
    'who',
    'whoami',
    'xfs_info',
    'yum-config-manager',
    'tree',
    'ncat',
    'nmap',
    'tcpdump',
    'strace',
    'fuser',
    'mpstat',
    'iotop',
    'lspci',
    'lsusb',
    'lsscsi',
    'hdparm',
    'smartctl',
    'ssh-agent',
    'createrepo_c',
    'createrepo',
    'yumdownloader',
    'dos2unix',
    'unix2dos',
    'sosreport',
    'git',
    'jq',
    'bc',
    'dc',
    'openssl',
    'python3',
    'perl',
    'httpd',
    'apachectl',
    'nginx',
    'mysql',
    'mariadb',
    'mysqldump',
    'make',
    'gcc',
    'cc',
    'tmux',
    'screen',
    'md5sum',
    'sha1sum',
    'sha256sum',
    'sha512sum',
    'cksum',
    'base64',
    'expr',
    'timeout',
    'watch',
    'realpath',
    'mktemp',
    'nl',
    'tac',
    'rev',
    'shuf',
    'od',
    'xxd',
    'hexdump',
    'strings',
    'ldd',
    'cmp',
    'comm',
    'fold',
    'split',
    'install',
    'rmdir',
    'nproc',
    'arch',
    'tty',
    'mesg',
    'factor',
    'lastlog',
    'lastb',
    'wall',
    'write',
    'ionice',
    'taskset',
    'chrt',
    'pwck',
    'grpck',
    'pwconv',
    'grpconv',
    'faillock',
    'nohup',
    'wait',
    'fg',
    'bg',
    'disown',
    'jobs',
    'microdnf',
    'apk',
    'apt',
    'apt-get',
    'dpkg',
    'whois',
    'java',
    'node',
    'npm',
    'php',
    'ansible',
    'ansible-playbook',
    'expect',
    'lftp',
    'ftp',
    'iperf3',
    'sync',
    'exit',
    '['
];

/**
 * Get section by ID with specified or random question set selection
 * @param {number} sectionId - The ID of the section
 * @param {number} questionSetIndex - Optional: specific question set (1-6). If not provided, randomly selected.
 * @returns {object|null} The section object with tasks from selected question set, or null if not found
 */
function getSectionById(sectionId, questionSetIndex = null) {
    const baseSection = sections.find(section => section.id === sectionId);
    if (!baseSection) return null;
    
    // Get available question sets (detect which sets exist)
    const availableSets = [];
    for (let i = 1; i <= 6; i++) {
        if (baseSection.questionSets[`set${i}`]) {
            availableSets.push(i);
        }
    }
    
    // If no sets available, return null
    if (availableSets.length === 0) {
        console.error(`❌ Section ${sectionId} has no available question sets`);
        return null;
    }
    
    // Determine which question set to use
    let setIndex;
    if (questionSetIndex !== null && availableSets.includes(questionSetIndex)) {
        // Use specified set if it exists
        setIndex = questionSetIndex;
    } else {
        // Randomly select from available sets
        setIndex = availableSets[Math.floor(Math.random() * availableSets.length)];
    }
    
    // Get the appropriate question set from the modular section data
    const setKey = `set${setIndex}`;
    const tasks = baseSection.questionSets[setKey];
    
    // Compute total points from the selected task set
    const setTotalPoints = tasks.reduce((sum, task) => sum + (task.points || 0), 0);

    // Return section with the selected question set
    return {
        id: baseSection.id,
        title: baseSection.title,
        description: baseSection.description,
        totalPoints: setTotalPoints,
        tasks: tasks,
        questionSetIndex: setIndex  // Track which set was used
    };
}

/**
 * Get total number of sections
 * @returns {number} Total sections
 */
function getTotalSections() {
    return sections.length;
}

/**
 * Check if a command is supported
 * @param {string} command - The command to check
 * @returns {boolean} True if supported, false otherwise
 */
function isCommandSupported(command) {
    if (supportedCommands.includes(command)) return true;
    // Script paths (./hello.sh, /root/args.sh) and variable assignments (TZ=UTC date, arr=(a b))
    return /^(\.{0,2}\/\S+|[A-Za-z_][A-Za-z0-9_]*=\S*)$/.test(command);
}
