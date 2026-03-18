/**
 * Red Cat - Command Help Text
 * 
 * This module contains help text for Linux commands.
 * Used when users run commands with -h or --help flags.
 */

const commandHelp = {
    'groupadd': {
        helpFlags: ['-h', '--help'],
        text: `Usage: groupadd [options] GROUP

Options:
  -f, --force                   exit successfully if the group already exists
                                and cancel -g if the GID already used
  -g, --gid GID                 use GID for the new group
  -h, --help                    display this help message and exit
  -K, --key KEY=VALUE           override /etc/login.defs defaults
  -o, --non-unique              allow to create groups with duplicate (non-unique) GID
  -p, --password PASSWORD       use this encrypted password for the new group
  -r, --system                  create a system account
  -R, --root CHROOT_DIR         directory to chroot into
  -P, --prefix PREFIX_DIR       directory prefix
  -U, --users USERS             list of user members of this group

Tip: Filter help with grep, e.g., groupadd -h | grep gid`
    },

    'useradd': {
        helpFlags: ['-h', '--help'],
        text: `Usage: useradd [options] LOGIN
       useradd -D
       useradd -D [options]

Options:
      --badname                 do not check for bad names
  -b, --base-dir BASE_DIR       base directory for the home directory of the new account
      --btrfs-subvolume-home    use BTRFS subvolume for home directory
  -c, --comment COMMENT         GECOS field of the new account
  -d, --home-dir HOME_DIR       home directory of the new account
  -D, --defaults                print or change default useradd configuration
  -e, --expiredate EXPIRE_DATE  expiration date of the new account
  -f, --inactive INACTIVE       password inactivity of the new account
  -g, --gid GROUP               name or ID of the primary group of the new account
  -G, --groups GROUPS           list of supplementary groups of the new acccount
  -h, --help                    display this help message and exit
  -k, --skel SKEL_DIR           use this alternative skeleton directory
  -K, --key KEY=VALUE           override /etc/login.defs defaults
  -l, --no-log-init             do not add the user to the lastlog and faillog databases
  -m, --create-home             create the user's home directory
  -M, --no-create-home          do not create the user's home directory
  -N, --no-user-group           do not create a group with the same name as the user
  -o, --non-unique              allow to create users with duplicate (non-unique) UID
  -p, --password PASSWORD       encrypted password for the new account
  -r, --system                  create a system account
  -R, --root CHROOT_DIR         directory to chroot into
  -P, --prefix PREFIX_DIR       prefix directory where the /etc/* files are located
  -s, --shell SHELL             login shell of the new account
  -u, --uid UID                 user ID of the new account
  -U, --user-group              create a group with the same name as the user
  -Z, --selinux-user SEUSER     use this SELinux user for the SELinux user mapping`
    },

    'usermod': `Usage: usermod [options] LOGIN

Options:
  -b, --badname                 allow bad names
  -c, --comment COMMENT         new value of the GECOS field
  -d, --home HOME_DIR           new home directory for the user account
  -e, --expiredate EXPIRE_DATE  set account expiration date to EXPIRE_DATE
  -f, --inactive INACTIVE       set password inactive after expiration to INACTIVE
  -g, --gid GROUP               force use GROUP as new primary group
  -G, --groups GROUPS           new list of supplementary GROUPS
  -a, --append                  append user to supplemental GROUPS mentioned by the -G option 
                                without removing the user from other groups
  -h, --help                    display this help message and exit
  -l, --login NEW_LOGIN         new value of the login name
  -s, --shell SHELL             new login shell for the user account
  -L, --lock                    lock the user account
  -m, --move-home               move the content of the home directory to the new location
                                (use only with -d)
  -o, --non-unique              allow using duplicate (non-unique) UID
  -p, --password PASSWORD       use encrypted password for the new account                                 
  -R, --root CHROOT_DIR         directory to chroot into
  -P, --prefix PREFIX_DIR       prefix directory where the /etc/* files are located
  -s, --shell SHELL             new login shell for the user account
  -u, --uid UID                 new UID for the user account
  -U, --unlock                  unlock the user account
  -v, --add-subuids FIRST-LAST  add range of subordinate uids
  -V, --del-subuids FIRST-LAST  remove range of subordinate uids
  -w, --add-subgids FIRST-LAST  add range of subordinate gids
  -W, --del-subgids FIRST-LAST  remove range of subordinate gids
  -Z, --selinux-user SEUSER     new SELinux user for the user account`,

    'chage': `Usage: chage [options] LOGIN

Options:
  -d, --lastday LAST_DAY        set date of last password change to LAST_DAY
  -E, --expiredate EXPIRE_DATE  set account expiration date to EXPIRE_DATE
  -h, --help                    display this help message and exit
  -i, --iso8601                 use YYYY-MM-DD when printing dates
  -I, --inactive INACTIVE       set password inactive after expiration to INACTIVE
  -l, --list                    show account aging information
  -m, --mindays MIN_DAYS        set minimum number of days before password change to MIN_DAYS
  -M, --maxdays MAX_DAYS        set maximum number of days before password change to MAX_DAYS
  -R, --root CHROOT_DIR         directory to chroot into
  -W, --warndays WARN_DAYS      set expiration warning days to WARN_DAYS`,

    'chmod': `Usage: chmod [OPTION]... MODE[,MODE]... FILE...
  or:  chmod [OPTION]... OCTAL-MODE FILE...
  or:  chmod [OPTION]... --reference=RFILE FILE...

Change the mode of each FILE to MODE.

Options:
  -c, --changes           like verbose but report only when a change is made
  -f, --silent, --quiet   suppress most error messages
  -v, --verbose           output a diagnostic for every file processed
      --no-preserve-root  do not treat '/' specially (the default)
      --preserve-root     fail to operate recursively on '/'
      --reference=RFILE   use RFILE's mode instead of MODE values
  -R, --recursive         change files and directories recursively
      --help              display this help and exit
      --version           output version information and exit`,

    'chown': `Usage: chown [OPTION]... [OWNER][:[GROUP]] FILE...
  or:  chown [OPTION]... --reference=RFILE FILE...

Change the owner and/or group of each FILE to OWNER and/or GROUP.
With --reference, change the owner and group of each FILE to those of RFILE.

Options:
  -c, --changes                like verbose but report only when a change is made
  -f, --silent, --quiet        suppress most error messages
  -v, --verbose                output a diagnostic for every file processed
      --dereference            affect the referent of each symbolic link (this is
                               the default), rather than the symbolic link itself
  -h, --no-dereference         affect symbolic links instead of any referenced file
                               (useful only on systems that can change the
                               ownership of a symlink)
      --from=CURRENT_OWNER:CURRENT_GROUP
                               change the owner and/or group of each file only if
                               its current owner and/or group match those specified
                               here. Either may be omitted, in which case a match
                               is not required for the omitted attribute
      --no-preserve-root       do not treat '/' specially (the default)
      --preserve-root          fail to operate recursively on '/'
      --reference=RFILE        use RFILE's owner and group rather than
                               specifying OWNER:GROUP values
  -R, --recursive              operate on files and directories recursively
      --help                   display this help and exit
      --version                output version information and exit

Owner is unchanged if missing. Group is unchanged if missing, but changed
to login group if implied by a ':' following a symbolic OWNER.
OWNER and GROUP may be numeric as well as symbolic.

Examples:
  chown root /u              Change the owner of /u to "root".
  chown root:staff /u        Likewise, but also change its group to "staff".
  chown -hR root /u          Change the owner of /u and subfiles to "root".`,

    'chgrp': `Usage: chgrp [OPTION]... GROUP FILE...
  or:  chgrp [OPTION]... --reference=RFILE FILE...

Change the group of each FILE to GROUP.
With --reference, change the group of each FILE to that of RFILE.

  -c, --changes           like verbose but report only when a change is made
  -f, --silent, --quiet   suppress most error messages
  -v, --verbose           output a diagnostic for every file processed
      --dereference       affect the referent of each symbolic link (this is
                          the default), rather than the symbolic link itself
  -h, --no-dereference    affect symbolic links instead of any referenced file
                          (useful only on systems that can change the 
                          ownership of a symlink)
  -R, --recursive         operate on files and directories recursively
      --help              display this help and exit
      --version           output version information and exit`,

    'setfacl': `Usage: setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...

Options:
  -m, --modify=acl        modify the current ACL(s) of file(s)
  -M, --modify-file=file  read ACL entries to modify from file
  -x, --remove=acl        remove entries from the ACL(s) of file(s)
  -X, --remove-file=file  read ACL entries to remove from file
  -b, --remove-all        remove all extended ACL entries
  -k, --remove-default    remove the default ACL
  -R, --recursive         recurse into subdirectories
  -d, --default           operations apply to the default ACL
  -h, --help              this help text`,

    'mkdir': `Usage: mkdir [OPTION]... DIRECTORY...

Create the DIRECTORY(ies), if they do not already exist.

Options:
  -m, --mode=MODE    set file mode (as in chmod), not a=rwx - umask
  -p, --parents      no error if existing, make parent directories as needed
  -v, --verbose      print a message for each created directory
      --help         display this help and exit`,

    'mount': `Usage: mount [-lhV]
       mount -a [options]
       mount [options] [--source] <source> | [--target] <directory>
       mount [options] <source> <directory>
       mount <operation> <mountpoint> [<target>]

Options:
  -a, --all               mount all filesystems mentioned in fstab
  -t, --types <list>      limit the set of filesystem types
  -o, --options <list>    comma-separated list of mount options
  -r, --read-only         mount the filesystem read-only
  -w, --rw, --read-write  mount the filesystem read-write (default)
  -h, --help              display this help`,

    'tar': `Usage: tar [OPTION...] [FILE]...

Options:
  -c, --create               create a new archive
  -x, --extract              extract files from an archive
  -t, --list                 list the contents of an archive
  -v, --verbose              verbosely list files processed
  -f, --file=ARCHIVE         use archive file or device ARCHIVE
  -z, --gzip                 filter the archive through gzip
  -j, --bzip2                filter the archive through bzip2
  -C, --directory=DIR        change to directory DIR
  -h, --help                 give this help list`,

    'ls': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage: ls [OPTION]... [FILE]...

List information about the FILEs (the current directory by default).

Options:
  -a, --all                  do not ignore entries starting with .
  -l                         use a long listing format
  -h, --human-readable       with -l, print sizes in human readable format
  -R, --recursive            list subdirectories recursively
  -t                         sort by modification time, newest first
      --help                 display this help and exit`
    },

    'clear': `Usage: clear [options]

Clear the terminal screen.

Options:
  -T, --terminal=TERM    terminal type
  -V, --version          output version information and exit
  -x                     do not try to clear scrollback
  -h, --help             display this help and exit

Note: You can pipe help output to grep to filter results.
      Example: clear -h | grep version`,

    'history': `Usage: history [options]

Display the command history for the current section.

Options:
  -c, --clear            clear the history list (for current section)
  -h, --help             display this help and exit

Description:
  The history command shows all commands you've entered in the
  current section. History is automatically cleared when you
  navigate to a different section.

Examples:
  history                Show all commands in current section
  history | grep ls      Filter history for 'ls' commands
  history -c             Clear history for current section`,

    'find': `Usage: find [path...] [expression]

Search for files in a directory hierarchy.

Expression options:
  -name pattern          Base of file name matches pattern (wildcards allowed)
  -iname pattern         Like -name, but case-insensitive
  -type c                File is of type: f (file), d (directory), l (link)
  -size n[cwbkMG]        File uses n units of space
                         c=bytes, w=two-byte words, b=512-byte blocks
                         k=kilobytes, M=megabytes, G=gigabytes
                         Use +n for greater than, -n for less than
  -mtime n               File was modified n days ago
  -user name             File is owned by user name
  -group name            File belongs to group name
  -perm mode             File's permission bits are exactly mode
  -empty                 File is empty and is either a regular file or directory

Actions:
  -print                 Print the full file name (default action)
  -ls                    List current file in ls -dils format
  -delete                Delete files; true if removal succeeded
  -exec cmd {} \\;        Execute cmd; true if 0 status is returned
  
Examples:
  find /etc -name "*.conf"              Find all .conf files in /etc
  find /var/log -size +1M               Find files larger than 1MB
  find /home -type d -empty             Find empty directories
  find . -name "*.txt" -mtime -7        Find .txt files modified in last 7 days`,

    'wc': `Usage: wc [OPTION]... [FILE]...

Print newline, word, and byte counts for each FILE.

Options:
  -c, --bytes            print the byte counts
  -m, --chars            print the character counts
  -l, --lines            print the newline counts
  -L, --max-line-length  print the maximum display width
  -w, --words            print the word counts
  -h, --help             display this help and exit

With no FILE, or when FILE is -, read standard input.

Examples:
  wc -l /etc/passwd                  Count lines in passwd file
  cat /etc/passwd | wc -l            Count lines via pipe
  wc -w document.txt                 Count words in document
  wc -c file.bin                     Count bytes in file`,

    'less': `Usage: less [options] [file...]

View file contents interactively (pager).

Navigation:
  Space, f         Forward one window
  b                Backward one window
  Enter, j         Forward one line
  k                Backward one line
  g                Go to first line
  G                Go to last line
  /pattern         Search forward for pattern
  ?pattern         Search backward for pattern
  n                Repeat previous search
  N                Repeat previous search in reverse direction
  q                Quit

Options:
  -N               Show line numbers
  -S               Chop long lines (don't wrap)
  -i               Ignore case in searches
  -I               Ignore case always in searches
  -F               Quit if entire file fits on one screen
  -X               Don't clear screen on exit
  -h               Display help

Examples:
  less /var/log/messages             View log file
  less -N /etc/passwd                View with line numbers
  cat file.txt | less                View piped input`,

    'more': `Usage: more [options] [file...]

View file contents page by page (simple pager).

Navigation:
  Space            Display next page
  Enter            Display next line
  b                Go back one page
  /pattern         Search for pattern
  n                Go to next match
  q                Quit
  h                Display help
  =                Display current line number

Options:
  -num             Specify screen size (num lines)
  -d               Display help prompts
  -l               Do not pause after form feed
  -f               Count logical lines (don't fold long lines)
  -p               Clear screen before displaying
  -c               Draw from top, clearing remainder of screen
  -s               Squeeze multiple blank lines into one

Examples:
  more /etc/hosts                    View hosts file
  more -d /var/log/messages          View with prompts
  cat file.txt | more                View piped input`,

    'systemctl': `Usage: systemctl [OPTIONS...] COMMAND [UNIT...]

Control the systemd system and service manager.

Unit Commands:
  start UNIT...              Start (activate) one or more units
  stop UNIT...               Stop (deactivate) one or more units
  restart UNIT...            Restart one or more units
  reload UNIT...             Reload one or more units
  status [UNIT...]           Show runtime status of units
  is-active UNIT...          Check whether units are active
  is-enabled UNIT...         Check whether unit files are enabled
  enable UNIT...             Enable one or more unit files
  disable UNIT...            Disable one or more unit files
  mask UNIT...               Mask one or more units
  unmask UNIT...             Unmask one or more units

System Commands:
  reboot                     Shut down and reboot the system
  poweroff                   Shut down and power-off the system
  suspend                    Suspend the system
  get-default                Get the default target
  set-default TARGET         Set the default target
  isolate TARGET             Start one unit and stop all others
  list-units [PATTERN...]    List units currently in memory
  list-sockets [PATTERN...]  List socket units currently in memory

Options:
  -h, --help                 Show help
  -a, --all                  Show all properties/units
  -t, --type=TYPE            List units of a particular type
  --state=STATE              Show only units in specified state
  --failed                   Show only failed units
  -l, --full                 Don't truncate output
  --now                      Start or stop unit after enabling/disabling
  -q, --quiet                Suppress output

Examples:
  systemctl start httpd                Start Apache service
  systemctl stop crond                 Stop cron service
  systemctl status sshd                Check SSH status
  systemctl enable httpd               Enable at boot
  systemctl is-enabled httpd           Check if enabled
  systemctl set-default multi-user.target  Boot to text mode`,

    'journalctl': `Usage: journalctl [OPTIONS...] [MATCHES...]

Query the systemd journal.

Options:
  -h, --help                 Show help
  -b, --boot[=ID]            Show messages from a specific boot
  -u, --unit=UNIT            Show messages for the specified unit
  -p, --priority=RANGE       Show messages within priority range
                             (0=emerg, 1=alert, 2=crit, 3=err, 4=warning, 
                              5=notice, 6=info, 7=debug)
  -f, --follow               Follow the journal
  -n, --lines=N              Show N most recent journal entries
  -r, --reverse              Show newest entries first
  -o, --output=STRING        Change journal output mode (short, json, verbose)
  -k, --dmesg                Show kernel messages
  -x, --catalog              Add message explanations
  --since=DATE               Show entries not older than DATE
  --until=DATE               Show entries not newer than DATE
  --disk-usage               Show disk usage of journal files
  --vacuum-size=SIZE         Reduce disk usage below SIZE
  --vacuum-time=TIME         Remove journal files older than TIME

Priority Levels:
  emerg (0), alert (1), crit (2), err (3), warning (4), 
  notice (5), info (6), debug (7)

Examples:
  journalctl -u httpd                  View logs for httpd service
  journalctl -p err                    Show all error priority logs
  journalctl -b                        Show logs from current boot
  journalctl -f                        Follow journal in real-time
  journalctl -u sshd -n 50             Show last 50 lines for sshd
  journalctl --since "1 hour ago"      Show logs from last hour
  journalctl -p err -b                 Show errors from current boot`,

    'pidof': `Usage: pidof [options] program [...]

Find the process ID of a running program.

Options:
  -s                 Single shot - return only one PID
  -c                 Only return PIDs with same root directory
  -q                 Quiet mode, only set exit code
  -w                 Show also workers (threads)
  -x                 Also return PIDs of shells running scripts
  -o pid             Omit processes with specified PID
  -h                 Display help

Exit Codes:
  0    At least one program was found
  1    No program was found

Examples:
  pidof httpd                          Find PID of httpd
  pidof sshd crond                     Find PIDs of multiple programs
  pidof -s httpd                       Return only one PID
  pidof httpd > /tmp/httpd-pid.txt     Save PID to file`,

    'pgrep': `Usage: pgrep [options] pattern

Look up processes based on name and other attributes.

Selection Options:
  -u, --euid EUID...         Match by effective user ID
  -U, --uid UID...           Match by real user ID
  -G, --gid GID...           Match by real group ID
  -g, --pgrp PGRP...         Match by process group ID
  -s, --sid SID...           Match by session ID
  -t, --terminal TERM...     Match by controlling terminal
  -P, --parent PPID...       Match by parent process ID
  -n, --newest               Select the newest matching process
  -o, --oldest               Select the oldest matching process
  -x, --exact                Match exactly with command name

Output Options:
  -a, --list-full            List the full command line
  -l, --list-name            List the process name with PID
  -c, --count                Count of matching processes

Examples:
  pgrep httpd                          Find PIDs of httpd processes
  pgrep -u apache httpd                Find httpd processes by user
  pgrep -l sshd                        List name and PID
  pgrep -x crond                       Exact match for crond
  pgrep httpd > /tmp/httpd-pid.txt     Save PIDs to file`,

    'ps': {
        helpFlags: ['--help'],  // -h means no header in ps, not help
        text: `Usage: ps [options]

Report a snapshot of current processes.

Selection Options:
  -e, -A            Select all processes
  -a                Select all with a tty except session leaders
  -u USER           Select by effective user
  -p PID            Select by process ID
  -C CMD            Select by command name
  --ppid PID        Select by parent process ID

Output Options:
  -f                Full format listing
  -l                Long format
  u                 User-oriented format
  x                 Include processes without controlling ttys
  aux               Common BSD-style output (all processes)

Examples:
  ps aux                               List all processes (BSD style)
  ps -ef                               List all processes (Unix style)
  ps -u apache                         Show processes by user
  ps -p 1234                           Show specific process
  ps aux | grep httpd                  Find httpd processes`
    },

    'kill': `Usage: kill [options] <pid> [...]

Send a signal to a process.

Options:
  -s, --signal SIG           Signal to send (default: TERM)
  -l, --list [SIG]           List signal names
  -L, --table                List signal names in a table
  -h, --help                 Display help

Common Signals:
  1  HUP     Hangup - reload configuration
  2  INT     Interrupt (Ctrl+C)
  3  QUIT    Quit
  9  KILL    Force kill (cannot be caught)
  15 TERM    Terminate gracefully (default)
  18 CONT    Continue if stopped
  19 STOP    Stop process

Examples:
  kill 1234                            Terminate process 1234
  kill -9 1234                         Force kill process 1234
  kill -HUP 1234                       Send hangup signal
  kill -15 $(pidof httpd)              Terminate all httpd processes
  kill -l                              List all signal names`,

    'mkfs': `Usage: mkfs [options] [-t type] [fs-options] device

Build a Linux filesystem on a device.

Options:
  -t, --type TYPE            Specify filesystem type (ext4, xfs, vfat, etc.)
  -V, --verbose              Explain what is being done
  -h, --help                 Display help

Common Filesystem Types:
  ext4                       Fourth extended filesystem (default)
  xfs                        XFS filesystem (RHEL default)
  vfat                       FAT32 filesystem
  btrfs                      B-tree filesystem

Examples:
  mkfs.xfs /dev/sdb1                   Create XFS filesystem
  mkfs.ext4 /dev/sdc1                  Create ext4 filesystem
  mkfs -t xfs /dev/sdb1                Create XFS using -t flag
  mkfs.xfs -f /dev/sdb1                Force creation (overwrite existing)

Note: mkfs is a frontend for filesystem-specific mkfs.* commands.`,

    'mkfs.xfs': `Usage: mkfs.xfs [options] device

Construct an XFS filesystem.

Options:
  -f                         Force overwrite of existing filesystem
  -b size=value              Set block size (512, 1024, 2048, 4096)
  -i size=value              Set inode size (256, 512, 1024, 2048)
  -l size=value              Set log size
  -d size=value              Set data section size
  -n size=value              Set naming/directory block size
  -L label                   Set filesystem label
  -N                         Dry run - don't create filesystem
  -q                         Quiet mode
  -V                         Print version and exit

Examples:
  mkfs.xfs /dev/sdb1                   Create XFS filesystem
  mkfs.xfs -f /dev/sdb1                Force creation
  mkfs.xfs -L "data" /dev/sdb1         Create with label
  mkfs.xfs -b size=4096 /dev/sdb1      Set 4K block size`,

    'mkfs.ext4': `Usage: mkfs.ext4 [options] device

Create an ext4 filesystem.

Options:
  -b block-size              Set block size (1024, 2048, 4096)
  -L label                   Set volume label
  -N number-of-inodes        Set number of inodes
  -m reserved-blocks-%       Set % of blocks reserved for superuser
  -j                         Create ext3 journal
  -F                         Force creation
  -q                         Quiet mode
  -V                         Verbose mode

Examples:
  mkfs.ext4 /dev/sdc1                  Create ext4 filesystem
  mkfs.ext4 -L "backup" /dev/sdc1      Create with label
  mkfs.ext4 -F /dev/sdc1               Force creation`,

    'mkswap': `Usage: mkswap [options] device

Set up a Linux swap area.

Options:
  -L, --label LABEL          Specify a label
  -U, --uuid UUID            Specify UUID
  -p, --pagesize SIZE        Specify page size in bytes
  -f, --force                Force creation
  -v, --swapversion NUM      Specify swap version (1 or 2)
  -h, --help                 Display help
  -V, --version              Display version

Examples:
  mkswap /dev/sdc1                     Create swap on /dev/sdc1
  mkswap -L "swap1" /dev/sdc1          Create with label
  swapon /dev/sdc1                     Activate swap after creation

Typical Workflow:
  1. mkswap /dev/sdc1                  Create swap signature
  2. swapon /dev/sdc1                  Activate swap
  3. Add to /etc/fstab for persistence`,

    'blkid': `Usage: blkid [options] [device...]

Locate/print block device attributes.

Options:
  -L label                   Find device with specified label
  -U uuid                    Find device with specified UUID
  -s tag                     Show only specified tag (UUID, TYPE, LABEL)
  -o format                  Output format (value, device, list, full)
  -p                         Low-level superblock probing
  -i                         Show I/O Limits (topology)
  -H                         Show hint about usage
  -h, --help                 Display help

Examples:
  blkid                                List all devices with UUIDs
  blkid /dev/sdb1                      Show UUID and TYPE for sdb1
  blkid -s UUID /dev/sdb1              Show only UUID
  blkid -U a1b2c3d4-e5f6-7890          Find device by UUID
  blkid -L "data"                      Find device by label
  blkid /dev/sdb1 > /tmp/uuid.txt      Save device info to file`,

    'lsblk': `Usage: lsblk [options] [device...]

List block devices.

Options:
  -a, --all                  Print all devices
  -b, --bytes                Print size in bytes
  -d, --nodeps               Don't print slave/holder devices
  -f, --fs                   Show filesystem information
  -l, --list                 Use list format output
  -m, --perms                Show permissions
  -n, --noheadings           Don't print headings
  -o, --output columns       Specify output columns
  -p, --paths                Print complete device paths
  -r, --raw                  Use raw output format
  -t, --topology             Show topology information

Output Columns:
  NAME, FSTYPE, LABEL, UUID, MOUNTPOINT, SIZE, TYPE

Examples:
  lsblk                                List all block devices
  lsblk -f                             Show filesystem information
  lsblk -f /dev/sdb1                   Show filesystem for sdb1
  lsblk -o NAME,SIZE,TYPE,MOUNTPOINT   Custom columns`,

    'swapon': `Usage: swapon [options] device

Enable device for swapping.

Options:
  -a, --all                  Enable all swaps in /etc/fstab
  -d, --discard[=policy]     Enable discard (TRIM) for SSD
  -e, --ifexists             Silently skip non-existing devices
  -p, --priority priority    Set swap priority (-1 to 32767)
  -s, --summary              Display swap usage summary
  --show[=columns]           Display summary in definable table
  -v, --verbose              Verbose mode
  -h, --help                 Display help

Examples:
  swapon /dev/sdc1                     Activate swap on /dev/sdc1
  swapon -a                            Activate all swap in fstab
  swapon --show                        Show active swap devices
  swapon -s                            Show swap summary
  swapon -p 10 /dev/sdc1               Set priority to 10`,

    'swapoff': `Usage: swapoff [options] device

Disable device for swapping.

Options:
  -a, --all                  Disable all swaps
  -v, --verbose              Verbose mode
  -h, --help                 Display help

Examples:
  swapoff /dev/sdc1                    Deactivate swap on /dev/sdc1
  swapoff -a                           Deactivate all swap devices`,

    'free': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage: free [options]

Display amount of free and used memory in the system.

Options:
  -b, --bytes                Show output in bytes
  -k, --kibi                 Show output in kibibytes (default)
  -m, --mebi                 Show output in mebibytes
  -g, --gibi                 Show output in gibibytes
  -h, --human                Show human-readable output
  -t, --total                Display total for RAM + swap
  -s, --seconds N            Repeat every N seconds
  -c, --count N              Repeat N times
  -w, --wide                 Wide mode (separate buffers/cache)
  -l, --lohi                 Show detailed low and high memory
  --help                     Display help

Output Fields:
  total                      Total installed memory
  used                       Used memory
  free                       Unused memory
  shared                     Memory used by tmpfs
  buff/cache                 Memory used for buffers/cache
  available                  Estimation of memory available for starting new apps

Examples:
  free                                 Show memory in kibibytes
  free -h                              Human-readable format
  free -m                              Show in mebibytes
  free -h -s 2                         Update every 2 seconds`
    },

    'dnf': `Usage: dnf [options] COMMAND

DNF is the next-generation version of YUM, package manager for RPM-based systems.

Common Commands:
  install PACKAGE            Install a package or group of packages
  remove  PACKAGE            Remove a package or packages
  upgrade PACKAGE            Upgrade a package or packages
  update  PACKAGE            Alias for upgrade
  check-update               Check for available package upgrades
  search  KEYWORD            Search package details for the given keyword
  info    PACKAGE            Display details about a package
  list    [PATTERN]          List packages by name
  provides FILE              Find packages that provide the specified content
  repolist                   Display enabled software repositories
  clean   all                Remove cached data
  history                    List or undo DNF transactions

Options:
  -y, --assumeyes            Automatically answer yes for all questions
  -q, --quiet                Quiet operation
  -v, --verbose              Verbose operation
  --nogpgcheck               Skip GPG signature checking
  --enablerepo=REPO          Enable additional repositories
  --disablerepo=REPO         Disable repositories

List Commands:
  list installed             List all installed packages
  list available             List available packages
  list updates               List available updates
  list all                   List all packages

Examples:
  dnf install tmux                     Install tmux package
  dnf remove tmux                      Remove tmux package
  dnf list installed                   List all installed packages
  dnf list installed | wc -l           Count installed packages
  dnf check-update                     Check for available updates
  dnf info kernel                      Show kernel package information
  dnf search nginx                     Search for nginx packages`,

    'yum': `Usage: yum [options] COMMAND

YUM is the traditional package manager for RPM-based systems (alias for DNF on RHEL 8+).

Common Commands:
  install PACKAGE            Install a package or group of packages
  remove  PACKAGE            Remove a package or packages
  update  PACKAGE            Update a package or packages
  check-update               Check for available package updates
  search  KEYWORD            Search package details for the given keyword
  info    PACKAGE            Display details about a package
  list    [PATTERN]          List packages by name
  provides FILE              Find packages that provide the specified content
  repolist                   Display enabled software repositories
  clean   all                Remove cached data
  history                    List or undo YUM transactions

Options:
  -y, --assumeyes            Automatically answer yes for all questions
  -q, --quiet                Quiet operation
  -v, --verbose              Verbose operation

Examples:
  yum install tmux                     Install tmux package
  yum remove tmux                      Remove tmux package
  yum list installed                   List all installed packages
  yum check-update                     Check for available updates
  yum info kernel                      Show kernel package information

Note: On RHEL 8+ and Fedora, 'yum' is an alias to 'dnf'.`,

    'rpm': `Usage: rpm [options] [PACKAGE]

RPM Package Manager - query and verify packages.

Query Options:
  -q, --query               Query mode
  -a, --all                 Query all installed packages
  -i, --info                Display package information
  -l, --list                List files in package
  -f, --file FILE           Query package owning FILE
  -p, --package FILE        Query an uninstalled package file
  --whatprovides CAP        Query packages providing capability
  --whatrequires CAP        Query packages requiring capability
  --changelog               Display change log information

Query Format Options:
  --qf, --queryformat       Use custom query format

Verify Options:
  -V, --verify              Verify mode
  -Va                       Verify all installed packages

Common Query Commands:
  rpm -q PACKAGE            Check if package is installed
  rpm -qa                   List all installed packages
  rpm -qi PACKAGE           Show detailed package information
  rpm -ql PACKAGE           List files installed by package
  rpm -qf FILE              Find which package owns FILE
  rpm -qc PACKAGE           List configuration files

Examples:
  rpm -q tmux                          Check if tmux is installed
  rpm -qa                              List all installed packages
  rpm -qi kernel                       Show kernel package information
  rpm -ql bash                         List files in bash package
  rpm -qf /bin/ls                      Find package owning /bin/ls`,

    'nmcli': `Usage: nmcli [options] OBJECT { COMMAND | help }

NetworkManager command-line tool for controlling NetworkManager.

Objects:
  general       NetworkManager general status and operations
  networking    Overall networking control
  connection    NetworkManager connections
  device        Devices managed by NetworkManager

Connection Commands:
  show [NAME]               Show connection details
  up NAME                   Activate a connection
  down NAME                 Deactivate a connection
  add TYPE OPTIONS          Add a new connection
  modify NAME OPTIONS       Modify a connection
  delete NAME               Delete a connection
  reload                    Reload connection files

Device Commands:
  status                    Show device status
  show [DEVICE]             Show device details
  connect DEVICE            Connect the device
  disconnect DEVICE         Disconnect the device
  wifi list                 List available WiFi networks

Options:
  -t, --terse               Terse output
  -p, --pretty              Pretty output
  -m, --mode MODE           Output mode (tabular, multiline)
  -c, --colors {yes|no|auto} Whether to use colors
  -f, --fields FIELD        Specify fields to output
  -g, --get-values          Shortcut for --mode tabular --terse --fields

Examples:
  nmcli connection show                Show all connections
  nmcli c s                            Short form of above
  nmcli device show                    Show all devices
  nmcli d show ens160                  Show specific device details
  nmcli connection up ens160           Activate connection
  nmcli device wifi list               List WiFi networks`,

    'firewall-cmd': `Usage: firewall-cmd [options]

Command-line tool for firewalld, the dynamic firewall daemon.

Zone Commands:
  --get-default-zone        Get default zone
  --set-default-zone=ZONE   Set default zone
  --get-active-zones        Get active zones
  --get-zones               Get all available zones
  --list-all                List everything added for the active zone
  --list-all-zones          List everything for all zones

Service Commands:
  --list-services           List services added for zone
  --add-service=SERVICE     Add service to zone
  --remove-service=SERVICE  Remove service from zone
  --get-services            List all available services

Port Commands:
  --list-ports              List ports added for zone
  --add-port=PORT/PROTOCOL  Add port to zone (e.g., 8080/tcp)
  --remove-port=PORT        Remove port from zone

Options:
  --zone=ZONE               Use this zone (default: active zone)
  --permanent               Set permanently (requires reload)
  --reload                  Reload firewall rules
  --runtime-to-permanent    Make runtime settings permanent

Examples:
  firewall-cmd --list-all              List all settings for active zone
  firewall-cmd --list-services         List enabled services
  firewall-cmd --add-service=http      Add http service temporarily
  firewall-cmd --permanent --add-service=http
                                       Add http permanently (needs reload)
  firewall-cmd --reload                Reload firewall rules
  firewall-cmd --add-port=8080/tcp     Add port 8080/tcp
  firewall-cmd --list-ports            List open ports`,

    'ip': `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }

Show and manipulate routing, network devices, interfaces and tunnels.

Objects:
  address (addr, a)         Protocol (IPv4 or IPv6) address
  link (l)                  Network device
  route (r)                 Routing table entry
  neighbor (neigh, n)       ARP or NDISC cache entry
  netns                     Manage network namespaces

Address Commands:
  add ADDRESS dev DEVICE    Add protocol address
  del ADDRESS dev DEVICE    Delete protocol address
  show [dev DEVICE]         Show protocol addresses
  flush dev DEVICE          Flush protocol addresses

Link Commands:
  set DEVICE {up|down}      Change device state
  show [DEVICE]             Display device attributes

Route Commands:
  add PREFIX via ADDRESS    Add new route
  del PREFIX                Delete route
  show                      List routes

Options:
  -4, -6                    IPv4/IPv6 only
  -s, -stats                Output more information
  -h, -human                Human-readable output
  -c, -color                Use color output
  -br, -brief               Brief output

Examples:
  ip addr show                         Show all addresses
  ip a                                 Short form of above
  ip addr show ens160                  Show addresses for ens160
  ip link show                         Show all network interfaces
  ip route show                        Show routing table
  ip -4 addr                           Show only IPv4 addresses`,

    'hostnamectl': `Usage: hostnamectl [options] [COMMAND]

Control the system hostname and related settings.

Commands:
  status                    Show current hostname settings (default)
  set-hostname NAME         Set system hostname
  set-icon-name NAME        Set icon name for host
  set-chassis TYPE          Set chassis type
  set-deployment ENV        Set deployment environment
  set-location LOCATION     Set location string

Options:
  -h, --help                Show help message
  --version                 Show package version
  --no-ask-password         Do not prompt for password
  -H, --host=[USER@]HOST    Operate on remote host
  -M, --machine=CONTAINER   Operate on local container
  --transient               Only set transient hostname
  --static                  Only set static hostname
  --pretty                  Only set pretty hostname

Hostname Types:
  Static hostname           Traditional hostname stored in /etc/hostname
  Transient hostname        Dynamic hostname from network config
  Pretty hostname           Free-form UTF-8 hostname for presentation

Examples:
  hostnamectl                          Show current hostname settings
  hostnamectl status                   Same as above
  hostnamectl set-hostname server1     Set hostname to server1
  cat /etc/hostname                    View stored hostname`,

    'nslookup': `Usage: nslookup [options] [name] [server]

Query Internet domain name servers.

Interactive Commands:
  server NAME               Set default server to NAME
  set type=TYPE             Set query type (A, MX, NS, etc.)
  exit                      Exit the program

Options:
  -type=TYPE                Set query type
  -timeout=N                Set timeout to N seconds
  -port=N                   Set port number to N
  -debug                    Enable debugging mode

Query Types:
  A                         IPv4 address (default)
  AAAA                      IPv6 address
  MX                        Mail exchange
  NS                        Name servers
  PTR                       Pointer for reverse lookup
  SOA                       Start of authority
  TXT                       Text strings

Examples:
  nslookup redhat.com               Query A record for redhat.com
  nslookup redhat.com 8.8.8.8       Query using specific DNS server
  nslookup -type=MX redhat.com      Query MX records
  nslookup -type=NS redhat.com      Query nameservers`,

    'dig': `Usage: dig [@server] [name] [type]

DNS lookup utility from BIND.

Query Options:
  +[no]short                Short form answer (A records only)
  +[no]tcp                  Use TCP instead of UDP
  +[no]stats                Print statistics
  +trace                    Trace delegation from root
  +time=N                   Set query timeout to N seconds
  +tries=N                  Set number of UDP attempts
  +[no]recurse              Enable/disable recursion

Query Types:
  A                         IPv4 address (default)
  AAAA                      IPv6 address
  MX                        Mail exchange
  NS                        Name servers
  SOA                       Start of authority
  TXT                       Text records
  ANY                       Any available records

Examples:
  dig redhat.com                      Query A record for redhat.com
  dig redhat.com MX                   Query MX records
  dig @8.8.8.8 redhat.com             Query using specific DNS server
  dig redhat.com +short               Short output showing only IP
  dig -x 192.168.1.1                  Reverse DNS lookup
  dig redhat.com ANY                  Query all record types`,

    'host': `Usage: host [options] name [server]

Simple DNS lookup utility.

Options:
  -a                        All query (same as -v -t ANY)
  -C                        Query SOA records
  -t TYPE                   Query type (A, MX, NS, etc.)
  -v                        Verbose output
  -w                        Wait forever for response
  -4                        Use IPv4 only
  -6                        Use IPv6 only
  -d                        Debug mode
  -r                        Disable recursion

Query Types:
  A                         IPv4 address (default)
  AAAA                      IPv6 address
  MX                        Mail exchange
  NS                        Name servers
  SOA                       Start of authority
  TXT                       Text records

Examples:
  host redhat.com                     Query A record for redhat.com
  host -t MX redhat.com               Query MX records
  host -t NS redhat.com               Query nameservers
  host redhat.com 8.8.8.8             Query using specific DNS server
  host -a redhat.com                  Query all records`,

    'podman': `Usage: podman [options] COMMAND

Manage pods, containers and images with Podman (daemonless container engine).

Container Commands:
  run [OPTIONS] IMAGE       Run a command in a new container
  start CONTAINER           Start one or more containers
  stop CONTAINER            Stop one or more containers
  restart CONTAINER         Restart one or more containers
  rm CONTAINER              Remove one or more containers
  ps                        List containers
  exec CONTAINER CMD        Run command in running container
  logs CONTAINER            Fetch logs of a container
  inspect CONTAINER         Display detailed container information

Image Commands:
  images                    List images
  pull IMAGE                Pull an image from  registry
  push IMAGE                Push an image to registry
  rmi IMAGE                 Remove one or more images
  build                     Build an image from Dockerfile
  tag SOURCE TARGET         Create tag for an image

Common Options (run):
  -d, --detach              Run container in background
  -p, --publish HOST:CONT   Publish container port to host
  -v, --volume HOST:CONT    Bind mount a volume
  --name NAME               Assign name to container
  -e, --env VAR=VALUE       Set environment variable
  --rm                      Remove container when it exits
  -it                       Interactive with TTY

Examples:
  podman images                        List all images
  podman pull nginx                    Pull nginx image
  podman run -d --name web -p 8080:80 nginx
                                       Run nginx on port 8080
  podman ps                            List running containers
  podman ps -a                         List all containers
  podman stop web                      Stop container named web
  podman rm web                        Remove container named web
  podman rmi nginx                     Remove nginx image`,

    'showmount': `Usage: showmount [options] [host]

Show mount information for an NFS server.

Options:
  -e, --exports             Show NFS server export list
  -a, --all                 List both client hostname/IP and mounted directory
  -d, --directories         List only directories mounted by clients
  --no-headers              Don't print headers

Examples:
  showmount -e 192.168.1.100          Show exports from NFS server
  showmount -e nfs-server             Show exports using hostname
  showmount -a 192.168.1.100          Show clients and mount points
  showmount -d 192.168.1.100          Show directories being accessed`,

    'nfsstat': `Usage: nfsstat [options]

Display NFS client and server statistics.

Options:
  -c, --client              Display client-side statistics only
  -s, --server              Display server-side statistics only
  -m, --mounts              Display NFS mount information
  -r, --rpc                 Display RPC statistics
  -n, --nfs                 Display NFS statistics
  -3                        Display NFS version 3 statistics
  -4                        Display NFS version 4 statistics
  -o FACILITY               Display statistics for specified facility
  -v                        Verbose mode
  -Z, --sleep SECS          Display stats every SECS seconds

Examples:
  nfsstat                              Show all NFS statistics
  nfsstat -c                           Show client statistics only
  nfsstat -m                           Show mounted NFS volumes
  nfsstat -c -3                        Show NFSv3 client stats
  nfsstat -v                           Verbose statistics display`,

    'chronyc': `Usage: chronyc [OPTION]... [COMMAND]...
    
Options:
  -4                        Use IPv4 addresses only
  -6                        Use IPv6 addresses only
  -n                        Don't resolve hostnames
  -N                        Print original source names
  -c                        Enable CSV format
  -e                        End responses with dot
  -d                        Enable debug messages
  -m                        Accept multiple commands
  -h HOST                   Specify server (/run/chrony/chronyd.sock,127.0.0.1,::1)
  -p PORT                   Specify UDP port (323)
  -v, --version             Print version and exit
      --help                Print usage and exit`,

    'timedatectl': `Usage: timedatectl [OPTIONS...] COMMAND ...

Query or change system time and date settings.

Commands:
  status                    Show current time settings
  show                      Show properties of systemd-timedated
  set-time TIME             Set system time
  set-timezone ZONE         Set system timezone
  list-timezones            Show known timezones
  set-local-rtc BOOL        Control whether RTC is in local time
  set-ntp BOOL              Enable or disable network time synchronization

Options:
  -h, --help                Show this help
  --version                 Show package version
  --no-pager                Do not pipe output into a pager
  --no-ask-password         Do not prompt for password
  -H, --host=[USER@]HOST    Operate on remote host
  -M, --machine=CONTAINER   Operate on local container
  --adjust-system-clock     Adjust system clock when changing local RTC mode

Examples:
  timedatectl status             Show current date/time settings
  timedatectl set-timezone Asia/Dubai
                                 Set timezone
  timedatectl set-ntp true       Enable NTP synchronization
  timedatectl list-timezones     List all timezones`,

    'date': `Usage: date [OPTION]... [+FORMAT]
   or: date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]

Display or set the system date and time.

Options:
  -d, --date=STRING         Display time described by STRING, not 'now'
  -f, --file=DATEFILE       Like --date; once for each line of DATEFILE
  -I[FMT], --iso-8601[=FMT] Output date/time in ISO 8601 format
  -r, --reference=FILE      Display the last modification time of FILE
  -s, --set=STRING          Set time described by STRING
  -u, --utc, --universal    Print or set Coordinated Universal Time (UTC)
  -R, --rfc-email           Output date/time in RFC 5322 format
  --rfc-3339=FMT            Output date/time in RFC 3339 format
  -h, --help                Display this help and exit

Format controls:
  %Y    Year (e.g., 2026)
  %m    Month (01..12)
  %d    Day of month (01..31)
  %H    Hour (00..23)
  %M    Minute (00..59)
  %S    Second (00..60)
  %Z    Time zone (e.g., EST)
  %s    Seconds since 1970-01-01 00:00:00 UTC

Examples:
  date                      Display current date and time
  date +%Y-%m-%d            Display date in YYYY-MM-DD format
  date --set="2026-02-24 14:30:00"
                           Set system date and time`,

    'getenforce': `Usage: getenforce

Get the current mode of SELinux.

Description:
  Displays the current SELinux enforcement mode. Returns one of:
  - Enforcing:   SELinux security policy is enforced
  - Permissive:  SELinux prints warnings instead of enforcing
  - Disabled:    SELinux is completely disabled

Options:
  -h, --help                Display this help and exit

Examples:
  getenforce                Show current SELinux mode
  
Related commands:
  setenforce - Change SELinux mode temporarily
  sestatus   - Show detailed SELinux status`,

    'sestatus': `Usage: sestatus [OPTIONS]

Display the status of SELinux.

Options:
  -v                        Verbose, show context of files and processes
  -b                        Display current state of booleans
  -h, --help                Display this help and exit

Output includes:
  - SELinux status (enabled/disabled)
  - Current enforcement mode (enforcing/permissive)
  - Loaded policy name
  - MLS status
  - Policy booleans (with -b)
  - File and process contexts (with -v)

Examples:
  sestatus                  Show basic SELinux status
  sestatus -v               Show detailed status with contexts
  sestatus -b               Show SELinux boolean values`,

    'setenforce': `Usage: setenforce [Enforcing|Permissive|1|0]

Modify the mode SELinux is running in.

Arguments:
  Enforcing, 1              Set SELinux to enforcing mode
  Permissive, 0             Set SELinux to permissive mode

Description:
  Changes the current SELinux enforcement mode. This change is
  temporary and will not persist across reboots. To make permanent
  changes, edit /etc/selinux/config.

Options:
  -h, --help                Display this help and exit

Examples:
  setenforce 1              Enable enforcing mode
  setenforce 0              Enable permissive mode
  setenforce Enforcing      Enable enforcing mode (alternative)
  
Note: Cannot enable SELinux if status is disabled. Requires reboot.`,

    'semanage': `Usage: semanage OBJECT ACTION [OPTIONS]

SELinux Policy Management tool.

Objects:
  login                     Manage login mappings between users and SELinux users
  user                      Manage SELinux confined users
  port                      Manage network port type definitions
  fcontext                  Manage file context mapping definitions
  boolean                   Manage booleans to selectively enable functionality
  permissive                Manage process types in permissive mode
  module                    Manage SELinux policy modules

Common Actions:
  -l, --list                List records of the object type
  -a, --add                 Add a record of the object type
  -d, --delete              Delete a record of the object type
  -m, --modify              Modify a record of the object type

Port Options (for port object):
  -t, --type TYPE           SELinux type for the port
  -p, --proto PROTOCOL      Protocol (tcp/udp)

Fcontext Options:
  -t, --type TYPE           SELinux type
  -f, --ftype FILE_TYPE     File type (a for all files, d for directory)

Examples:
  semanage port -l          List all port type definitions
  semanage port -a -t http_port_t -p tcp 8080
                           Add port 8080 as http_port_t
  semanage fcontext -l      List file context mappings
  semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?"
                           Add file context for /web directory
  semanage boolean -l       List all SELinux booleans`,

    'chcon': `Usage: chcon [OPTION]... CONTEXT FILE...
   or: chcon [OPTION]... [-u USER] [-r ROLE] [-t TYPE] FILE...
   or: chcon [OPTION]... --reference=RFILE FILE...

Change file SELinux security context.

Options:
  -u, --user=USER           Set user USER in the target security context
  -r, --role=ROLE           Set role ROLE in the target security context
  -t, --type=TYPE           Set type TYPE in the target security context
  -l, --range=RANGE         Set range RANGE in the target security context
  -R, --recursive           Operate on files and directories recursively
  --reference=RFILE         Use RFILE's context instead of specifying values
  -h, --help                Display this help and exit
  -v, --verbose             Output a diagnostic for every file processed

Examples:
  chcon -t httpd_sys_content_t /var/www/html/index.html
                           Change type to httpd_sys_content_t
  chcon -R -t httpd_sys_content_t /var/www/html
                           Recursively change context
  chcon -u system_u -t admin_home_t file.txt
                           Set user and type
  
Note: Changes made by chcon are temporary and may be reset by 
restorecon or system relabeling. Use semanage fcontext for permanent changes.`,

    'restorecon': `Usage: restorecon [-R] [-v] [-F] FILE...

Restore file(s) default SELinux security contexts.

Options:
  -R, -r                    Operate recursively on directories
  -v                        Show changes in file labels
  -F                        Force reset of context to match file_context
  -n                        Don't change any file labels (dry run)
  -p                        Show progress by printing * every 1000 files
  -e DIRECTORY              Exclude directory
  -h, --help                Display this help and exit

Description:
  Restores the default SELinux context for files based on the
  system policy. This is the recommended way to fix SELinux contexts
  after modifying files or moving them between directories.

Examples:
  restorecon /var/www/html/index.html
                           Restore context for single file
  restorecon -Rv /var/www/html
                           Recursively restore with verbose output
  restorecon -v /home/user/*
                           Restore contexts for all files in directory`,

    'getsebool': `Usage: getsebool [-a] [boolean...]

Report SELinux boolean value(s).

Options:
  -a                        Show all SELinux booleans
  -h, --help                Display this help and exit

Description:
  Displays the current values of SELinux booleans. Booleans allow
  parts of SELinux policy to be changed at runtime without reloading
  or recompiling policy.

Examples:
  getsebool -a              List all SELinux booleans and their values
  getsebool httpd_can_network_connect
                           Check specific boolean value
  getsebool httpd_can_network_connect httpd_enable_cgi
                           Check multiple booleans`,

    'setsebool': `Usage: setsebool [-P] boolean value | bool1=val1 bool2=val2...

Set SELinux boolean value(s).

Options:
  -P                        Make the change persistent across reboots
                           (writes to policy configuration)
  -N                        Do not reload policy after commit
  -h, --help                Display this help and exit

Values:
  1, on, true               Enable the boolean
  0, off, false             Disable the boolean

Description:
  Manages SELinux policy booleans. Without -P, changes are temporary
  and lost on reboot. With -P, changes are saved to disk.

Examples:
  setsebool httpd_can_network_connect on
                           Temporarily enable boolean
  setsebool -P httpd_can_network_connect on
                           Permanently enable boolean
  setsebool -P httpd_can_network_connect=1 httpd_enable_cgi=1
                           Enable multiple booleans permanently`,

    'crontab': `Usage: crontab [-u user] [file]
   or: crontab [-u user] [-l | -r | -e] [-i]

Maintain crontab files for individual users.

Options:
  -u USER                   Specify user whose crontab is to be managed
  -l                        List user's crontab
  -r                        Remove user's crontab
  -e                        Edit user's crontab
  -i                        Prompt before removing crontab (with -r)
  -s                        Use SELinux context from MLS range
  -h, --help                Display this help and exit

Crontab Format:
  * * * * * command
  │ │ │ │ │
  │ │ │ │ └─── Day of week (0-7, Sun=0 or 7)
  │ │ │ └──── Month (1-12)
  │ │ └───── Day of month (1-31)
  │ └────── Hour (0-23)
  └─────── Minute (0-59)

Special Characters:
  *         Any value
  ,         Value list separator (1,3,5)
  -         Range of values (1-5)
  /         Step values (*/15 = every 15)

Examples:
  crontab -e                Edit current user's crontab
  crontab -l                Display current crontab
  crontab -u alice -l       Display alice's crontab
  
  0 2 * * *  /usr/local/bin/backup.sh
                           Run backup at 2 AM daily
  */15 * * * * /usr/bin/check-system
                           Run every 15 minutes`,

    'grub2-mkconfig': `Usage: grub2-mkconfig [OPTION]

Generate a GRUB configuration file.

Options:
  -o, --output=FILE         Output generated config to FILE
                           (default: stdout)
  -h, --help                Display this help and exit
  -v, --version             Print version information

Description:
  Generates grub.cfg by running scripts in /etc/grub.d/ and using
  settings from /etc/default/grub. This is the recommended way to
  update GRUB configuration after kernel updates or changes.

Default output: /boot/grub2/grub.cfg

Examples:
  grub2-mkconfig -o /boot/grub2/grub.cfg
                           Generate config and save to default location
  grub2-mkconfig           Display generated config to stdout
  
After editing /etc/default/grub, always run:
  grub2-mkconfig -o /boot/grub2/grub.cfg`,

    'grubby': `Usage: grubby [OPTIONS]

Command line tool for configuring grub, lilo, elilo, yaboot and zipl.

Options:
  --default-kernel          Display the default kernel path
  --default-index           Display the default entry index
  --info=kernel-path        Display boot information for kernel
  --set-default=kernel-path Set default kernel
  --set-default-index=IDX   Set default boot entry by index
  --add-kernel=kernel-path  Add new boot entry
  --remove-kernel=kernel-path
                           Remove kernel from configuration
  --update-kernel=kernel-path
                           Update kernel configuration
  --args=args               Kernel arguments to add/use
  --remove-args=args        Kernel arguments to remove
  --title=entry-title       Title for the boot entry
  --grub2                   Use GRUB 2 configuration
  -h, --help                Display this help and exit

Examples:
  grubby --default-kernel   Show default kernel
  grubby --info=ALL         Show all boot entries
  grubby --set-default=/boot/vmlinuz-5.14.0-362.el9.x86_64
                           Set default kernel
  grubby --update-kernel=ALL --args="quiet"
                           Add 'quiet' to all kernels
  grubby --remove-args="rhgb quiet" --update-kernel=ALL
                           Remove boot arguments`,

    'systemd-analyze': `Usage: systemd-analyze [OPTIONS...] COMMAND

Analyze and debug system manager.

Commands:
  time                      Print time spent in boot
  blame                     Print list of slow-starting units
  critical-chain [UNIT]     Print critical chain of units
  plot                      Output SVG graphic boot sequence
  dot [PATTERN]             Output dependency graph in dot(1) format
  dump                      Dump server status
  verify [FILE...]          Check unit files for correctness
  calendar SPEC             Validate calendar time specification
  timespan SPAN             Validate time span specification
  security [UNIT]           Analyze security settings of unit

Options:
  -h, --help                Show this help
  --version                 Show package version
  --no-pager                Do not pipe output into a pager
  --system                  Operate on system systemd instance
  --user                    Operate on user systemd instance
  -H, --host=[USER@]HOST    Operate on remote host

Examples:
  systemd-analyze           Show boot time summary
  systemd-analyze blame     List services by startup time
  systemd-analyze critical-chain
                           Show critical path to reach target
  systemd-analyze critical-chain network.target
                           Show critical path for network`,

    'getent': `Usage: getent [option]... database key...

Get entries from administrative database.

Supported databases:
  passwd                    User account information
  group                     Group information
  hosts                     Hostname and address information
  services                  Network services
  protocols                 Network protocols
  networks                  Network names and numbers
  ahosts                    Host addresses (all families)
  ahostsv4                  IPv4 host addresses
  ahostsv6                  IPv6 host addresses

Options:
  -s, --service=CONFIG      Service configuration to use
  -h, --help                Display this help and exit
  -V, --version             Display version information

Examples:
  getent passwd             List all user accounts
  getent passwd alice       Show user 'alice' information
  getent group developers   Show 'developers' group info
  getent hosts server1      Resolve hostname to IP address`,

    'stat': `Usage: stat [OPTION]... FILE...

Display file or file system status.

Options:
  -L, --dereference         Follow symbolic links
  -f, --file-system         Display file system status
  -c, --format=FORMAT       Use specified FORMAT instead of default
  -t, --terse               Print information in terse form
  -h, --help                Display this help and exit

Format sequences:
  %n    File name
  %s    Total size in bytes
  %b    Number of blocks allocated
  %f    Raw mode in hex
  %a    Access rights in octal
  %A    Access rights in human readable form
  %F    File type
  %u    User ID of owner
  %U    User name of owner
  %g    Group ID of owner
  %G    Group name of owner

Examples:
  stat file.txt             Show detailed file information
  stat -f /home             Show filesystem information
  stat -c "%a %n" file.txt  Show octal permissions and filename`,

    'cat': `Usage: cat [OPTION]... [FILE]...

Concatenate files and print on the standard output.

Options:
  -A, --show-all            Equivalent to -vET
  -b, --number-nonblank     Number nonempty output lines
  -e                        Equivalent to -vE
  -E, --show-ends           Display $ at end of each line
  -n, --number              Number all output lines
  -s, --squeeze-blank       Suppress repeated empty output lines
  -t                        Equivalent to -vT
  -T, --show-tabs           Display TAB characters as ^I
  -v, --show-nonprinting    Use ^ and M- notation for control chars
  -h, --help                Display this help and exit

Examples:
  cat file.txt              Display file contents
  cat file1 file2           Concatenate and display files
  cat -n file.txt           Display with line numbers
  cat file1 > file2         Copy file1 to file2`,

    'grep': `Usage: grep [OPTION]... PATTERN [FILE]...

Search for PATTERN in each FILE.

Options:
  -E, --extended-regexp     PATTERN is an extended regular expression
  -F, --fixed-strings       PATTERN is a set of newline-separated strings
  -i, --ignore-case         Ignore case distinctions
  -v, --invert-match        Select non-matching lines
  -w, --word-regexp         Match whole words only
  -x, --line-regexp         Match whole lines only
  -c, --count               Print only count of matching lines
  -n, --line-number         Print line number with output
  -H, --with-filename       Print filename with output lines
  -h, --no-filename         Suppress filename prefix
  -r, --recursive           Read all files under each directory
  -A NUM, --after-context   Print NUM lines of trailing context
  -B NUM, --before-context  Print NUM lines of leading context
  -C NUM, --context         Print NUM lines of output context
  --color[=WHEN]            Use markers to highlight matching strings
  -h, --help                Display this help and exit

Examples:
  grep error logfile        Find 'error' in logfile
  grep -i error logfile     Case-insensitive search
  grep -r pattern /path     Recursively search directory
  grep -n "pattern" file    Show line numbers
  grep -v exclude file      Show lines NOT matching pattern`,

    'df': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage: df [OPTION]... [FILE]...

Show file system disk space usage.

Options:
  -a, --all                 Include pseudo, duplicate, inaccessible file systems
  -B, --block-size=SIZE     Scale sizes by SIZE before printing
  -h, --human-readable      Print sizes in human readable format (e.g., 1K 234M 2G)
  -H, --si                  Like -h, but use powers of 1000 not 1024
  -i, --inodes              List inode information instead of block usage
  -k                        Like --block-size=1K
  -l, --local               Limit listing to local file systems
  -T, --print-type          Print file system type
  -t, --type=TYPE           Limit listing to TYPE file systems
  -x, --exclude-type=TYPE   Limit listing to non-TYPE file systems
  -h, --help                Display this help and exit

Examples:
  df                        Show disk usage for all mounted filesystems
  df -h                     Show in human-readable format (GB, MB)
  df -T                     Show filesystem types
  df -h /home               Show usage for specific mount point
  df -i                     Show inode usage`
    },

    'ss': `Usage: ss [OPTIONS] [FILTER]

Socket statistics - investigate sockets.

Options:
  -n, --numeric             Don't resolve service names
  -r, --resolve             Resolve hostnames
  -a, --all                 Display all sockets
  -l, --listening           Display listening sockets
  -t, --tcp                 Display TCP sockets
  -u, --udp                 Display UDP sockets
  -p, --processes           Show process using socket
  -s, --summary             Print summary statistics
  -4, --ipv4                Display IPv4 sockets only
  -6, --ipv6                Display IPv6 sockets only
  -h, --help                Display this help and exit

State filters:
  state established         Show established connections
  state listening           Show listening sockets
  
Examples:
  ss -tuln                  List TCP and UDP listening ports
  ss -tunap                 List all TCP/UDP with process info
  ss -t state established   Show established TCP connections
  ss -tn sport = :22        Show connections on port 22`,

    'lvcreate': `Usage: lvcreate [OPTIONS] VolumeGroup

Create a logical volume.

Options:
  -L, --size Size[m|M|g|G|t|T]
                           Logical volume size
  -l, --extents Number[%{VG|FREE|ORIGIN}]
                           Number of logical extents
  -n, --name LogicalVolumeName
                           Name for new logical volume
  -s, --snapshot           Create a snapshot
  -p, --permission r|rw    Set read/write or read-only permissions
  -r, --readahead Number   Set readahead sector count
  -i, --stripes Number     Number of stripes
  -I, --stripesize Size    Size of each stripe
  -h, --help               Display this help and exit

Examples:
  lvcreate -L 10G -n lv_data vg_data
                           Create 10GB logical volume
  lvcreate -l 100%FREE -n lv_data vg_data
                           Use all free space
  lvcreate -L 5G -n lv_web datavg
                           Create 5GB LV named lv_web`,

    'lvextend': `Usage: lvextend [OPTIONS] LogicalVolume[Path]

Extend a logical volume.

Options:
  -L, --size [+]Size[m|M|g|G|t|T]
                           Extend to (or by) specified size
  -l, --extents [+]Number[%{VG|LV|FREE|ORIGIN}]
                           Extend to (or by) number of extents
  -r, --resizefs           Resize underlying filesystem together with LV
  -t, --test               Run in test mode
  -h, --help               Display this help and exit

Examples:
  lvextend -L +5G /dev/vg_data/lv_data
                           Add 5GB to logical volume
  lvextend -L 15G /dev/vg_data/lv_data
                           Extend to 15GB total
  lvextend -l +100%FREE /dev/vg_data/lv_data
                           Extend using all free space
  lvextend -r -L +2G /dev/vg_data/lv_data
                           Extend LV and resize filesystem`,

    'pvcreate': `Usage: pvcreate [OPTIONS] PhysicalVolume...

Initialize physical volume(s) for use by LVM.

Options:
  -f, --force              Force creation without confirmation
  -y, --yes                Answer yes to all prompts
  -M, --metadatatype lvm2  Set metadata type
  --dataalignment Size     Alignment of data area
  --metadatasize Size      Size of metadata area
  -h, --help               Display this help and exit

Description:
  Initializes a disk or partition for use with LVM. This writes
  an LVM label to the device, creating a physical volume.

Warning:
  This will destroy any existing data on the device!

Examples:
  pvcreate /dev/sdb1       Initialize /dev/sdb1 as physical volume
  pvcreate /dev/sdc /dev/sdd
                           Initialize multiple devices
  pvcreate -ff /dev/sdb1   Force initialization (destroys data)`,

    'vgcreate': `Usage: vgcreate [OPTIONS] VolumeGroupName PhysicalVolume...

Create a volume group.

Options:
  -s, --physicalextentsize Size[m|M|g|G|t|T]
                           Physical extent size (default 4MB)
  -l, --maxlogicalvolumes Number
                           Maximum logical volumes
  -p, --maxphysicalvolumes Number
                           Maximum physical volumes
  -A, --autobackup y|n     Enable/disable metadata backup
  -h, --help               Display this help and exit

Description:
  Creates a new volume group from one or more physical volumes.
  The physical volumes must already be initialized with pvcreate.

Examples:
  vgcreate vg_data /dev/sdb1
                           Create volume group from one PV
  vgcreate vg_data /dev/sdb1 /dev/sdc1
                           Create VG from multiple PVs
  vgcreate -s 8M vg_data /dev/sdb1
                           Create VG with 8MB extent size`,

    'findmnt': `Usage: findmnt [OPTIONS] [device|mountpoint]

Find a filesystem and print details about it.

Options:
  -s, --fstab              Search in /etc/fstab only
  -m, --mtab               Search in /etc/mtab only
  -k, --kernel             Search in /proc/self/mountinfo (default)
  -t, --types list         Limit the set of filesystem types
  -O, --options list       Limit the set of filesystems by mount options
  -A, --all                Print all filesystems
  -o, --output list        Output columns (SOURCE,TARGET,FSTYPE,OPTIONS)
  -n, --noheadings         Don't print headings
  -J, --json               Use JSON output format
  -h, --help               Display this help and exit

Examples:
  findmnt                  Show all mounted filesystems
  findmnt /home            Show details for /home mount
  findmnt -t ext4          Show all ext4 filesystems
  findmnt /dev/sda1        Show where /dev/sda1 is mounted`
};

/**
 * Get help text for a command
 * @param {string} command - The command name  
 * @param {string} flag - The help flag used (-h or --help), optional
 * @returns {string|null} Help text or null if not available
 */
function getCommandHelp(command, flag) {
    const helpEntry = commandHelp[command];
    if (!helpEntry) return null;
    
    // Handle both old string format and new object format during transition
    if (typeof helpEntry === 'string') {
        // Old format - accept both -h and --help
        // If flag is not provided or matches valid help flags, return the text
        if (!flag || flag === '-h' || flag === '--help') {
            return helpEntry;
        }
        return null;
    }
    
    // New format - check if the flag is in the allowed helpFlags array
    if (helpEntry.helpFlags) {
        // If no flag provided, return null (must specify correct flag for new format)
        if (!flag) return null;
        
        if (helpEntry.helpFlags.includes(flag)) {
            return helpEntry.text;
        }
    }
    
    return null;
}
