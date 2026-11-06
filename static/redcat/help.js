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

  -c, --changes          like verbose but report only when a change is made
  -f, --silent, --quiet  suppress most error messages
  -v, --verbose          output a diagnostic for every file processed
      --dereference      affect the referent of each symbolic link (this is
                         the default), rather than the symbolic link itself
  -h, --no-dereference   affect symbolic links instead of any referenced file
                         (useful only on systems that can change the
                         ownership of a symlink)
      --no-preserve-root  do not treat '/' specially (the default)
      --preserve-root    fail to operate recursively on '/'
      --reference=RFILE  use RFILE's group rather than specifying a
                         GROUP value
  -R, --recursive        operate on files and directories recursively

The following options modify how a hierarchy is traversed when the -R
option is also specified.  If more than one is specified, only the final
one takes effect.

  -H                     if a command line argument is a symbolic link
                         to a directory, traverse it
  -L                     traverse every symbolic link to a directory
                         encountered
  -P                     do not traverse any symbolic links (default)

      --help     display this help and exit
      --version  output version information and exit

Examples:
  chgrp staff /u      Change the group of /u to "staff".
  chgrp -hR staff /u  Change the group of /u and subfiles to "staff".

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/chgrp>
or available locally via: info '(coreutils) chgrp invocation'`,

    'setfacl': `Usage: setfacl [-bkndRLP] { -m|-M|-x|-X ... } file ...

Options:
  -m, --modify=acl        modify the current ACL(s) of file(s)
  -M, --modify-file=file  read ACL entries to modify from file
  -x, --remove=acl        remove entries from the ACL(s) of file(s)
  -X, --remove-file=file  read ACL entries to remove from file
  -b, --remove-all        remove all extended ACL entries
  -k, --remove-default    remove the default ACL
      --set=acl           set the ACL(s) of file(s), replacing the current ACL
      --set-file=file     read ACL entries to set from file
      --mask              do recalculate the effective rights mask
  -n, --no-mask           don't recalculate the effective rights mask
  -d, --default           operations apply to the default ACL
  -R, --recursive         recurse into subdirectories
  -L, --logical           logical walk, follow symbolic links
  -P, --physical          physical walk, do not follow symbolic links
      --restore=file      restore ACLs (inverse of 'getfacl -R')
      --test              test mode (ACLs are not modified)
  -v, --version           print version and exit
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

Mount a filesystem.

Options:
  -a, --all                       mount all filesystems mentioned in fstab
  -c, --no-canonicalize           don't canonicalize paths
  -f, --fake                      dry run; skip the mount(2) syscall
  -F, --fork                      fork off for each device (use with -a)
  -T, --fstab <path>              alternative file to /etc/fstab
  -i, --internal-only             don't call the mount.<type> helpers
  -l, --show-labels               show also filesystem labels
  -n, --no-mtab                   don't write to /etc/mtab
      --options-mode <mode>       what to do with options loaded from fstab
      --options-source <source>   mount options source
      --options-source-force      force use of options from fstab/mstab
  -o, --options <list>            comma-separated list of mount options
  -O, --test-opts <list>          limit the set of filesystems (use with -a)
  -r, --read-only                 mount the filesystem read-only (same as -o ro)
  -t, --types <list>              limit the set of filesystem types
      --source <src>              explicitly specifies the source (path, label, uuid)
      --target <target>           explicitly specifies mountpoint
      --target-prefix <path>      specifies path used for all mountpoints
  -v, --verbose                   say what is being done
  -w, --rw, --read-write          mount the filesystem read-write (default)
  -h, --help                      display this help
  -V, --version                   display version

Source:
  -L, --label <label>             synonym for LABEL=<label>
  -U, --uuid <uuid>               synonym for UUID=<uuid>
  LABEL=<label>                   specifies device by filesystem label
  UUID=<uuid>                     specifies device by filesystem UUID
  PARTLABEL=<label>               specifies device by partition label
  PARTUUID=<uuid>                 specifies device by partition uuid
  ID=<id>                         specifies device by udev hardware ID
  <device>                        specifies device by path
  <directory>                     mountpoint for bind mounts (see --bind/rbind)
  <file>                          regular file for loopdev setup

Operations:
  -B, --bind                      mount a subtree somewhere else (same as -o bind)
  -M, --move                      move a subtree to some other place
  -R, --rbind                     mount a subtree and all submounts somewhere else
  --make-shared                   mark a subtree as shared
  --make-slave                    mark a subtree as slave
  --make-private                  mark a subtree as private
  --make-unbindable               mark a subtree as unbindable
  --make-rshared                  recursively mark a whole subtree as shared
  --make-rslave                   recursively mark a whole subtree as slave
  --make-rprivate                 recursively mark a whole subtree as private
  --make-unbindable               recursively mark a whole subtree as unbindable`,

    'tar': `Usage: tar [OPTION...] [FILE]...
GNU 'tar' saves many files together into a single tape or disk archive, and can
restore individual files from the archive.

Examples:
  tar -cf archive.tar foo bar     # Create archive.tar from files foo and bar.
  tar -tvf archive.tar            # List all files in archive.tar verbosely.
  tar -xf archive.tar             # Extract all files from archive.tar.

 Main operation mode:
  -A, --catenate, --concatenate   append tar files to an archive
  -c, --create                    create a new archive
      --delete                    delete from the archive (not on mag tapes!)
  -d, --diff, --compare           find differences between archive and file system
  -r, --append                    append files to the end of an archive
      --test-label                test the archive volume label and exit
  -t, --list                      list the contents of an archive
  -u, --update                    only append files newer than copy in archive
  -x, --extract, --get            extract files from an archive

 Operation modifiers:

      --check-device              check device numbers when creating incremental
                                  archives (default)
  -g, --listed-incremental=FILE   handle new GNU-format incremental backup
  -G, --incremental               handle old GNU-format incremental backup
      --hole-detection=TYPE       technique to detect holes
      --ignore-failed-read        do not exit with nonzero on unreadable files
      --level=NUMBER              dump level for created listed-incremental archive
      --no-check-device           do not check device numbers when creating
                                  incremental archives
      --no-seek                   archive is not seekable
  -n, --seek                      archive is seekable
      --occurrence[=NUMBER]       process only the NUMBERth occurrence of each file in the 
                                  archive; this option is valid only in conjunction with 
                                  one of the subcommands --delete, --diff, --extract or 
                                  --list and when a list of files is given either on 
                                  the command line or via the -T option; NUMBER defaults to 1
      --sparse-version=MAJOR[.MINOR]
                                  set version of the sparse format to use (implies --sparse)
  -S, --sparse                    handle sparse files efficiently

 Local file name selection:
      --add-file=FILE             add given FILE to the archive (useful if its name starts with a dash)
  -C, --directory=DIR             change to directory DIR
      --exclude=PATTERN           exclude files, given as a PATTERN
      --exclude-backups           exclude backup and lock files
      --exclude-caches            exclude contents of directories containing CACHEDIR.TAG, 
                                  except for the tag file itself
      --exclude-caches-all        exclude directories containing CACHEDIR.TAG
      --exclude-caches-under      exclude everything under directories containing
                                  CACHEDIR.TAG
      --exclude-ignore=FILE       read exclude patterns for each directory from
                                  FILE, if it exists
      --exclude-ignore-recursive=FILE
                                  read exclude patterns for each directory and its
                                  subdirectories from FILE, if it exists
      --exclude-tag=FILE          exclude contents of directories containing FILE,
                                  except for FILE itself
      --exclude-tag-all=FILE      exclude directories containing FILE
      --exclude-tag-under=FILE    exclude everything under directories containing FILE
      --exclude-vcs               exclude version control system directories
      --exclude-vcs-ignores       read exclude patterns from the VCS ignore files
      --no-null                   disable the effect of the previous --null option
      --no-recursion              avoid descending automatically in directories
      --no-unquote                do not unquote input file or member names
      --no-verbatim-files-from   -T treats file names starting with dash as options (default)
      --null                     -T reads null-terminated names; implies --verbatim-files-from
      --recursion                recurse into directories (default)
  -T, --files-from=FILE          get names to extract or create from FILE
      --unquote                  unquote input file or member names (default)
      --verbatim-files-from      -T reads file names verbatim (no escape or option handling)
  -X, --exclude-from=FILE        exclude patterns listed in FILE

 File name matching options (affect both exclude and include patterns):

      --anchored                 patterns match file name start
      --ignore-case              ignore case
      --no-anchored              patterns match after any '/' (default for exclusion)
      --no-ignore-case           case sensitive matching (default)
      --no-wildcards             verbatim string matching
      --no-wildcards-match-slash   wildcards do not match '/'
      --wildcards               use wildcards (default for exclusion)
      --wildcards-match-slash   wildcards match '/' (default)

 Overwrite control:

      --keep-directory-symlink   preserve existing symlinks to directories when extracting
      --keep-newer-files         don't replace existing files that are newer than their archive copies
  -k, --keep-old-files           don't replace existing files when extracting, treat them as errors
      --no-overwrite-dir         preserve metadata of existing directories
      --one-top-level[=DIR]      create a subdirectory to avoid having loose files extracted
      --overwrite                overwrite existing files when extracting
      --overwrite-dir            overwrite metadata of existing directories when extracting (default)
      --recursive-unlink         empty hierarchies prior to extracting directory
      --remove-files             remove files after adding them to the archive
      --skip-old-files           don't replace existing files when extracting, silently skip over them
  -U, --unlink-first             remove each file prior to extracting over it
  -W, --verify                   attempt to verify the archive after writing it

 Select output stream:

      --ignore-command-error     ignore exit codes of children
      --no-ignore-command-error  treat non-zero exit codes of children as error
  -O, --to-stdout                extract files to standard output
      --to-command=COMMAND       pipe extracted files to another program

 Handling of file attributes:

      --atime-preserve[=METHOD]   preserve access times on dumped files, either by restoring the times 
                                  after reading (METHOD='replace'; default) or by not setting the
                                  times in the first place (METHOD='system')
    --clamp-mtime                 only set time when the file is more recent than what was given with --mtime
      --delay-directory-restore   delay setting modification times and
                                  permissions of extracted directories until the end
                                  of extraction
      --group=NAME                force NAME as group for added files
      --group-map=FILE            use FILE to map file owner GIDs and names
      --mode=CHANGES              force (symbolic) mode CHANGES for added files
      --mtime=DATE-OR-FILE        set mtime for added files from DATE-OR-FILE
  -m, --touch                     don't extract file modified time
      --no-delay-directory-restore
                                  cancel the effect of --delay-directory-restore option
      --no-same-owner             extract files as yourself (default for ordinary users)
      --no-same-permissions       apply the user's umask when extracting permissions from the archive (default for ordinary users)
      --numeric-owner             always use numbers for user/group names
      --owner=NAME                force NAME as owner for added files
      --owner-map=FILE            use FILE to map file owner UIDs and names
  -p, --preserve-permissions, --same-permissions
                                  extract information about file permissions (default for superuser)
      --same-owner                try extracting files with the same ownership as exists in the archive (default for superuser)
      --sort=ORDER                directory sorting order: none (default), name or inode
  -s, --preserve-order, --same-order
                                  member arguments are listed in the same order as the files in the archive

 Handling of extended file attributes:

      --acls                      Enable the POSIX ACLs support
      --no-acls                   Disable the POSIX ACLs support
      --no-selinux                Disable the SELinux context support
      --no-xattrs                 Disable extended attributes support
      --selinux                   Enable the SELinux context support
      --xattrs                    Enable extended attributes support
      --xattrs-exclude=MASK       specify the exclude pattern for xattr keys
      --xattrs-include=MASK       specify the include pattern for xattr keys

 Device selection and switching:

      --force-local               archive file is local even if it has a colon
  -f, --file=ARCHIVE              use archive file or device ARCHIVE
  -F, --info-script=NAME, --new-volume-script=NAME
                                  run script at end of each tape (implies -M)
  -L, --tape-length=NUMBER        change tape after writing NUMBER x 1024 bytes
  -M, --multi-volume              create/list/extract multi-volume archive
      --rmt-command=COMMAND       use given rmt COMMAND instead of rmt
      --rsh-command=COMMAND       use remote COMMAND instead of rsh
      --volno-file=FILE           use/update the volume number in FILE

 Device blocking:

  -b, --blocking-factor=BLOCKS    BLOCKS x 512 bytes per record
  -B, --read-full-records         reblock as we read (for 4.2BSD pipes)
  -i, --ignore-zeros              ignore zeroed blocks in archive (means EOF)
      --record-size=NUMBER        NUMBER of bytes per record, multiple of 512

 Archive format selection:

  -H, --format=FORMAT             create archive of the given format

 FORMAT is one of the following:
    gnu                           GNU tar 1.13.x format
    oldgnu                        GNU format as per tar <= 1.12
    pax                           POSIX 1003.1-2001 (pax) format
    posix                         same as pax
    ustar                         POSIX 1003.1-1988 (ustar) format
    v7                            old V7 tar format

      --old-archive, --portability
                                  same as --format=v7
      --pax-option=keyword[[:]=value][,keyword[[:]=value]]...
                                  control pax keywords
      --posix                     same as --format=posix
  -V, --label=TEXT                create archive with volume name TEXT; at
                                  list/extract time, use TEXT as a globbing pattern for volume name

 Compression options:

  -a, --auto-compress             use archive suffix to determine the compression program
  -I, --use-compress-program=PROG
                                  filter through PROG (must accept -d)
  -j, --bzip2                     filter the archive through bzip2
  -J, --xz                        filter the archive through xz
      --lzip                      filter the archive through lzip
      --lzma                      filter the archive through xz --format=lzma
      --lzop                      filter the archive through lzop
      --no-auto-compress          do not use archive suffix to determine the compression program
      --zstd                      filter the archive through zstd
  -z, --gzip, --gunzip, --ungzip  filter the archive through gzip
  -Z, --compress, --uncompress    filter the archive through compress

 Local file selection:

      --backup[=CONTROL]          backup before removal, choose version CONTROL
      --hard-dereference          follow hard links; archive and dump the files they refer to
  -h, --dereference               follow symlinks; archive and dump the files they point to
  -K, --starting-file=MEMBER-NAME
                                  begin at member MEMBER-NAME when reading the archive
      --newer-mtime=DATE          compare date and time when data changed only
  -N, --newer=DATE-OR-FILE, --after-date=DATE-OR-FILE
                                  only store files newer than DATE-OR-FILE
      --one-file-system           stay in local file system when creating archive
  -P, --absolute-names            don't strip leading '/'s from file names
      --suffix=STRING             backup before removal, override usual suffix ('~' unless overridden 
                                  by environment variable SIMPLE_BACKUP_SUFFIX)

 File name transformations:

      --strip-components=NUMBER   strip NUMBER leading components from file names on extraction
      --transform=EXPRESSION, --xform=EXPRESSION
                                  use sed replace EXPRESSION to transform file names

 Informative output:

      --checkpoint[=NUMBER]       display progress messages every NUMBERth record (default 10)
      --checkpoint-action=ACTION  execute ACTION on each checkpoint
      --full-time                 print file time to its full resolution
      --index-file=FILE           send verbose output to FILE
  -l, --check-links               print a message if not all links are dumped
      --no-quote-chars=STRING     disable quoting for characters from STRING
      --quote-chars=STRING        additionally quote characters from STRING
      --quoting-style=STYLE       set name quoting style; see below for valid STYLE values
  -R, --block-number              show block number within archive with each message

      --show-defaults             show tar defaults
      --show-omitted-dirs         when listing or extracting, list each directory that does not match search criteria
      --show-snapshot-field-ranges
                                  show valid ranges for snapshot-file fields
      --show-transformed-names, --show-stored-names
                                  show file or archive names after transformation
      --totals[=SIGNAL]           print total bytes after processing the archive; with an argument - 
                                  print total bytes when this SIGNAL is delivered; Allowed signals 
                                  are: SIGHUP, SIGQUIT, SIGINT, SIGUSR1 and SIGUSR2; the names
                                  without SIG prefix are also accepted
      --utc                       print file modification times in UTC
  -v, --verbose                   verbosely list files processed
      --warning=KEYWORD           warning control
  -w, --interactive, --confirmation
                                  ask for confirmation for every action

 Compatibility options:

  -o                              when creating, same as --old-archive; when extracting, same as --no-same-owner

 Other options:

  -?, --help                      give this help list
      --restrict                  disable use of some potentially harmful options
      --usage                     give a short usage message
      --version                   print program version

Mandatory or optional arguments to long options are also mandatory or optional
for any corresponding short options.

The backup suffix is '~', unless set with --suffix or SIMPLE_BACKUP_SUFFIX.
The version control may be set with --backup or VERSION_CONTROL, values are:

  none, off                       never make backups
  t, numbered                     make numbered backups
  nil, existing                   numbered if numbered backups exist, simple otherwise
  never, simple                   always make simple backups

Valid arguments for the --quoting-style option are:

  literal
  shell
  shell-always
  shell-escape
  shell-escape-always
  c
  c-maybe
  escape
  locale
  clocale

*This* tar defaults to:
--format=gnu -f- -b20 --quoting-style=escape --rmt-command=/etc/rmt
--rsh-command=/usr/bin/ssh`,

    'ls': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage: ls [OPTION]... [FILE]...
List information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not list implied . and ..
      --author               with -l, print the author of each file
  -b, --escape               print C-style escapes for nongraphic characters
      --block-size=SIZE      with -l, scale sizes by SIZE when printing them;
                               e.g., '--block-size=M'; see SIZE format below
  -B, --ignore-backups       do not list implied entries ending with ~
  -c                         with -lt: sort by, and show, ctime (time of last
                               modification of file status information);
                               with -l: show ctime and sort by name;
                               otherwise: sort by ctime, newest first
  -C                         list entries by columns
      --color[=WHEN]         colorize the output; WHEN can be 'always' (default
                               if omitted), 'auto', or 'never'; more info below
  -d, --directory            list directories themselves, not their contents
  -D, --dired                generate output designed for Emacs' dired mode
  -f                         do not sort, enable -aU, disable -ls --color
  -F, --classify             append indicator (one of */=>@|) to entries
      --file-type            likewise, except do not append '*'
      --format=WORD          across -x, commas -m, horizontal -x, long -l,
                               single-column -1, verbose -l, vertical -C
      --full-time            like -l --time-style=full-iso
  -g                         like -l, but do not list owner
      --group-directories-first
                             group directories before files;
                               can be augmented with a --sort option, but any
                               use of --sort=none (-U) disables grouping
  -G, --no-group             in a long listing, don't print group names
  -h, --human-readable       with -l and -s, print sizes like 1K 234M 2G etc.
      --si                   likewise, but use powers of 1000 not 1024
  -H, --dereference-command-line
                             follow symbolic links listed on the command line
      --dereference-command-line-symlink-to-dir
                             follow each command line symbolic link
                               that points to a directory
      --hide=PATTERN         do not list implied entries matching shell PATTERN
                               (overridden by -a or -A)
      --hyperlink[=WHEN]     hyperlink file names; WHEN can be 'always'
                               (default if omitted), 'auto', or 'never'
      --indicator-style=WORD  append indicator with style WORD to entry names:
                               none (default), slash (-p),
                               file-type (--file-type), classify (-F)
  -i, --inode                print the index number of each file
  -I, --ignore=PATTERN       do not list implied entries matching shell PATTERN
  -k, --kibibytes            default to 1024-byte blocks for disk usage;
                               used only with -s and per directory totals
  -l                         use a long listing format
  -L, --dereference          when showing file information for a symbolic
                               link, show information for the file the link
                               references rather than for the link itself
  -m                         fill width with a comma separated list of entries
  -n, --numeric-uid-gid      like -l, but list numeric user and group IDs
  -N, --literal              print entry names without quoting
  -o                         like -l, but do not list group information
  -p, --indicator-style=slash
                             append / indicator to directories
  -q, --hide-control-chars   print ? instead of nongraphic characters
      --show-control-chars   show nongraphic characters as-is (the default,
                               unless program is 'ls' and output is a terminal)
  -Q, --quote-name           enclose entry names in double quotes
      --quoting-style=WORD   use quoting style WORD for entry names:
                               literal, locale, shell, shell-always,
                               shell-escape, shell-escape-always, c, escape
                               (overrides QUOTING_STYLE environment variable)
  -r, --reverse              reverse order while sorting
  -R, --recursive            list subdirectories recursively
  -s, --size                 print the allocated size of each file, in blocks
  -S                         sort by file size, largest first
      --sort=WORD            sort by WORD instead of name: none (-U), size (-S),
                               time (-t), version (-v), extension (-X)
      --time=WORD            change the default of using modification times;
                               access time (-u): atime, access, use;
                               change time (-c): ctime, status;
                               birth time: birth, creation;
                             with -l, WORD determines which time to show;
                             with --sort=time, sort by WORD (newest first)
      --time-style=TIME_STYLE  time/date format with -l; see TIME_STYLE below
  -t                         sort by time, newest first; see --time
  -T, --tabsize=COLS         assume tab stops at each COLS instead of 8
  -u                         with -lt: sort by, and show, access time;
                               with -l: show access time and sort by name;
                               otherwise: sort by access time, newest first
  -U                         do not sort; list entries in directory order
  -v                         natural sort of (version) numbers within text
  -w, --width=COLS           set output width to COLS.  0 means no limit
  -x                         list entries by lines instead of by columns
  -X                         sort alphabetically by entry extension
  -Z, --context              print any security context of each file
  -1                         list one file per line.  Avoid '\n' with -q or -b
      --help     display this help and exit
      --version  output version information and exit

The SIZE argument is an integer and optional unit (example: 10K is 10*1024).
Units are K,M,G,T,P,E,Z,Y (powers of 1024) or KB,MB,... (powers of 1000).
Binary prefixes can be used, too: KiB=K, MiB=M, and so on.

The TIME_STYLE argument can be full-iso, long-iso, iso, locale, or +FORMAT.
FORMAT is interpreted like in date(1).  If FORMAT is FORMAT1<newline>FORMAT2,
then FORMAT1 applies to non-recent files and FORMAT2 to recent files.
TIME_STYLE prefixed with 'posix-' takes effect only outside the POSIX locale.
Also the TIME_STYLE environment variable sets the default style to use.

Using color to distinguish file types is disabled both by default and
with --color=never.  With --color=auto, ls emits color codes only when
standard output is connected to a terminal.  The LS_COLORS environment
variable can change the settings.  Use the dircolors command to set it.

Exit status:
 0  if OK,
 1  if minor problems (e.g., cannot access subdirectory),
 2  if serious trouble (e.g., cannot access command-line argument).

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/ls>
or available locally via: info '(coreutils) ls invocation'`
    },

    'clear': `clear: invalid option -- '-'
Usage: clear [options]

Options:
  -T TERM     use this instead of $TERM
  -V          print curses-version
  -x          do not try to clear scrollback`,

    'history': `history: history [-c] [-d offset] [n] or history -anrw [filename] or history -ps arg [arg...]
    Display or manipulate the history list.

    Display the history list with line numbers, prefixing each modified
    entry with a '*'.  An argument of N lists only the last N entries.

    Options:
      -c        clear the history list by deleting all of the entries
      -d offset delete the history entry at position OFFSET. Negative
                offsets count back from the end of the history list

      -a        append history lines from this session to the history file
      -n        read all history lines not already read from the history file
                and append them to the history list
      -r        read the history file and append the contents to the history
                list
      -w        write the current history to the history file

      -p        perform history expansion on each ARG and display the result
                without storing it in the history list
      -s        append the ARGs to the history list as a single entry

    If FILENAME is given, it is used as the history file.  Otherwise,
    if HISTFILE has a value, that is used, else ~/.bash_history.

    If the HISTTIMEFORMAT variable is set and not null, its value is used
    as a format string for strftime(3) to print the time stamp associated
    with each displayed history entry.  No time stamps are printed otherwise.

    Exit Status:
    Returns success unless an invalid option is given or an error occurs.`,

    'find': `Usage: find [-H] [-L] [-P] [-Olevel] [-D debugopts] [path...] [expression]

default path is the current directory; default expression is -print
expression may consist of: operators, options, tests, and actions:
operators (decreasing precedence; -and is implicit where no others are given):
      ( EXPR )   ! EXPR   -not EXPR   EXPR1 -a EXPR2   EXPR1 -and EXPR2
      EXPR1 -o EXPR2   EXPR1 -or EXPR2   EXPR1 , EXPR2
positional options (always true): -daystart -follow -regextype

normal options (always true, specified before other expressions):
      -depth --help -maxdepth LEVELS -mindepth LEVELS -mount -noleaf
      --version -xautofs -xdev -ignore_readdir_race -noignore_readdir_race
tests (N can be +N or -N or N): -amin N -anewer FILE -atime N -cmin N
      -cnewer FILE -ctime N -empty -false -fstype TYPE -gid N -group NAME
      -ilname PATTERN -iname PATTERN -inum N -iwholename PATTERN -iregex PATTERN
      -links N -lname PATTERN -mmin N -mtime N -name PATTERN -newer FILE
      -nouser -nogroup -path PATTERN -perm [-/]MODE -regex PATTERN
      -readable -writable -executable
      -wholename PATTERN -size N[bcwkMG] -true -type [bcdpflsD] -uid N
      -used N -user NAME -xtype [bcdpfls]      -context CONTEXT

actions: -delete -print0 -printf FORMAT -fprintf FILE FORMAT -print
      -fprint0 FILE -fprint FILE -ls -fls FILE -prune -quit
      -exec COMMAND ; -exec COMMAND {} + -ok COMMAND ;
      -execdir COMMAND ; -execdir COMMAND {} + -okdir COMMAND ;

Valid arguments for -D:
exec, opt, rates, search, stat, time, tree, all, help
Use '-D help' for a description of the options, or see find(1)

Please see also the documentation at http://www.gnu.org/software/findutils/.
You can report (and track progress on fixing) bugs in the "find"
program via the GNU findutils bug-reporting page at
https://savannah.gnu.org/bugs/?group=findutils or, if
you have no web access, by sending email to <bug-findutils@gnu.org>.`,

    'wc': `Usage: wc [OPTION]... [FILE]...
  or:  wc [OPTION]... --files0-from=F
Print newline, word, and byte counts for each FILE, and a total line if
more than one FILE is specified.  A word is a non-zero-length sequence of
characters delimited by white space.

With no FILE, or when FILE is -, read standard input.

The options below may be used to select which counts are printed, always in
the following order: newline, word, character, byte, maximum line length.
  -c, --bytes            print the byte counts
  -m, --chars            print the character counts
  -l, --lines            print the newline counts
      --files0-from=F    read input from the files specified by
                           NUL-terminated names in file F;
                           If F is - then read names from standard input
  -L, --max-line-length  print the maximum display width
  -w, --words            print the word counts
      --help     display this help and exit
      --version  output version information and exit

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/wc>
or available locally via: info '(coreutils) wc invocation'`,

    'less': `SUMMARY OF LESS COMMANDS

      Commands marked with * may be preceded by a number, N.
      Notes in parentheses indicate the behavior if N is given.
      A key preceded by a caret indicates the Ctrl key; thus ^K is ctrl-K.

  h  H                 Display this help.
  q  :q  Q  :Q  ZZ     Exit.
 ---------------------------------------------------------------------------

                           MOVING

  e  ^E  j  ^N  CR  *  Forward  one line   (or N lines).
  y  ^Y  k  ^K  ^P  *  Backward one line   (or N lines).
  f  ^F  ^V  SPACE  *  Forward  one window (or N lines).
  b  ^B  ESC-v      *  Backward one window (or N lines).
  z                 *  Forward  one window (and set window to N).
  w                 *  Backward one window (and set window to N).
  ESC-SPACE         *  Forward  one window, but don't stop at end-of-file.
  d  ^D             *  Forward  one half-window (and set half-window to N).
  u  ^U             *  Backward one half-window (and set half-window to N).
  ESC-)  RightArrow *  Right one half screen width (or N positions).
  ESC-(  LeftArrow  *  Left  one half screen width (or N positions).
  ESC-}  ^RightArrow   Right to last column displayed.
  ESC-{  ^LeftArrow    Left  to first column.
  F                    Forward forever; like "tail -f".
  ESC-F                Like F but stop when search pattern is found.
  r  ^R  ^L            Repaint screen.
  R                    Repaint screen, discarding buffered input.
        ---------------------------------------------------
        Default "window" is the screen height.
        Default "half-window" is half of the screen height.
 ---------------------------------------------------------------------------

                          SEARCHING

  /pattern          *  Search forward for (N-th) matching line.
  ?pattern          *  Search backward for (N-th) matching line.
  n                 *  Repeat previous search (for N-th occurrence).
  N                 *  Repeat previous search in reverse direction.
  ESC-n             *  Repeat previous search, spanning files.
  ESC-N             *  Repeat previous search, reverse dir. & spanning files.
  ESC-u                Undo (toggle) search highlighting.
  ESC-U                Clear search highlighting.
  &pattern          *  Display only matching lines.
        ---------------------------------------------------
        A search pattern may begin with one or more of:
        ^N or !  Search for NON-matching lines.
        ^E or *  Search multiple files (pass thru END OF FILE).
        ^F or @  Start search at FIRST file (for /) or last file (for ?).
        ^K       Highlight matches, but don't move (KEEP position).
        ^R       Don't use REGULAR EXPRESSIONS.
        ^W       WRAP search if no match found.
 ---------------------------------------------------------------------------

                           JUMPING

  g  <  ESC-<       *  Go to first line in file (or line N).
  G  >  ESC->       *  Go to last line in file (or line N).
  p  %              *  Go to beginning of file (or N percent into file).
  t                 *  Go to the (N-th) next tag.
  T                 *  Go to the (N-th) previous tag.
  {  (  [           *  Find close bracket } ) ].
  }  )  ]           *  Find open bracket { ( [.
  ESC-^F <c1> <c2>  *  Find close bracket <c2>.
  ESC-^B <c1> <c2>  *  Find open bracket <c1>.
        ---------------------------------------------------
        Each "find close bracket" command goes forward to the close bracket
          matching the (N-th) open bracket in the top line.
        Each "find open bracket" command goes backward to the open bracket
          matching the (N-th) close bracket in the bottom line.

  m<letter>            Mark the current top line with <letter>.
  M<letter>            Mark the current bottom line with <letter>.
  '<letter>            Go to a previously marked position.
  ''                   Go to the previous position.
  ^X^X                 Same as '.
  ESC-M<letter>        Clear a mark.
        ---------------------------------------------------
        A mark is any upper-case or lower-case letter.
        Certain marks are predefined:
             ^  means  beginning of the file
             $  means  end of the file
 ---------------------------------------------------------------------------

                        CHANGING FILES

  :e [file]            Examine a new file.
  ^X^V                 Same as :e.
  :n                *  Examine the (N-th) next file from the command line.
  :p                *  Examine the (N-th) previous file from the command line.
  :x                *  Examine the first (or N-th) file from the command line.
  :d                   Delete the current file from the command line list.
  =  ^G  :f            Print current file name.
 ---------------------------------------------------------------------------

                    MISCELLANEOUS COMMANDS

  -<flag>              Toggle a command line option [see OPTIONS below].
  --<name>             Toggle a command line option, by name.
  _<flag>              Display the setting of a command line option.
  __<name>             Display the setting of an option, by name.
  +cmd                 Execute the less cmd each time a new file is examined.

  !command             Execute the shell command with $SHELL.
  |Xcommand            Pipe file between current pos & mark X to shell command.
  s file               Save input to a file.
  v                    Edit the current file with $VISUAL or $EDITOR.
  V                    Print version number of "less".
 ---------------------------------------------------------------------------

                           OPTIONS

        Most options may be changed either on the command line,
        or from within less by using the - or -- command.
        Options may be given in one of two forms: either a single
        character preceded by a -, or a name preceded by --.

  -?  ........  --help
                  Display help (from command line).
  -a  ........  --search-skip-screen
                  Search skips current screen.
  -A  ........  --SEARCH-SKIP-SCREEN
                  Search starts just after target line.
  -b [N]  ....  --buffers=[N]
                  Number of buffers.
  -B  ........  --auto-buffers
                  Don't automatically allocate buffers for pipes.
  -c  -C  ....  --clear-screen --CLEAR-SCREEN
                  Repaint by clearing rather than scrolling.
  -d  ........  --dumb
                  Dumb terminal.
  -D xcolor  .  --color=xcolor
                  Set screen colors.
  -e  -E  ....  --quit-at-eof  --QUIT-AT-EOF
                  Quit at end of file.
  -f  ........  --force
                  Force open non-regular files.
  -F  ........  --quit-if-one-screen
                  Quit if entire file fits on first screen.
  -g  ........  --hilite-search
                  Highlight only last match for searches.
  -G  ........  --HILITE-SEARCH
                  Don't highlight any matches for searches.
  --old-bot
                  Revert to the old bottom of screen behavior.
  -h [N]  ....  --max-back-scroll=[N]
                  Backward scroll limit.
  -i  ........  --ignore-case
                  Ignore case in searches that do not contain uppercase.
  -I  ........  --IGNORE-CASE
                  Ignore case in all searches.
  -j [N]  ....  --jump-target=[N]
                  Screen position of target lines.
  -J  ........  --status-column
                  Display a status column at left edge of screen.
  -k [file]  .  --lesskey-file=[file]
                  Use a lesskey file.
  -K  ........  --quit-on-intr
                  Exit less in response to ctrl-C.
  -L  ........  --no-lessopen
                  Ignore the LESSOPEN environment variable.
  -m  -M  ....  --long-prompt  --LONG-PROMPT
                  Set prompt style.
  -n  ........  --line-numbers
                  Don't use line numbers.
  -N  ........  --LINE-NUMBERS
                  Use line numbers.
  -o [file]  .  --log-file=[file]
                  Copy to log file (standard input only).
  -O [file]  .  --LOG-FILE=[file]
                  Copy to log file (unconditionally overwrite).
  -p [pattern]  --pattern=[pattern]
                  Start at pattern (from command line).
  -P [prompt]   --prompt=[prompt]
                  Define new prompt.
  -q  -Q  ....  --quiet  --QUIET  --silent --SILENT
                  Quiet the terminal bell.
  -r  -R  ....  --raw-control-chars  --RAW-CONTROL-CHARS
                  Output "raw" control characters.
  -s  ........  --squeeze-blank-lines
                  Squeeze multiple blank lines.
  -S  ........  --chop-long-lines
                  Chop (truncate) long lines rather than wrapping.
  -t [tag]  ..  --tag=[tag]
                  Find a tag.
  -T [tagsfile] --tag-file=[tagsfile]
                  Use an alternate tags file.
  -u  -U  ....  --underline-special  --UNDERLINE-SPECIAL
                  Change handling of backspaces.
  -V  ........  --version
                  Display the version number of "less".
  -w  ........  --hilite-unread
                  Highlight first new line after forward-screen.
  -W  ........  --HILITE-UNREAD
                  Highlight first new line after any forward movement.
  -x [N[,...]]  --tabs=[N[,...]]
                  Set tab stops.
  -X  ........  --no-init
                  Don't use termcap init/deinit strings.
  -y [N]  ....  --max-forw-scroll=[N]
                  Forward scroll limit.
  -z [N]  ....  --window=[N]
                  Set size of window.
  -" [c[c]]  .  --quotes=[c[c]]
                  Set shell quote characters.
  -~  ........  --tilde
                  Don't display tildes after end of file.
  -# [N]  ....  --shift=[N]
                  Set horizontal scroll amount (0 = one half screen width).
                --file-size
                  Automatically determine the size of the input file.
                --follow-name
                  The F command changes files if the input file is renamed.
                --incsearch
                  Search file as each pattern character is typed in.
                --line-num-width=N
                  Set the width of the -N line number field to N characters.
                --mouse
                  Enable mouse input.
                --no-keypad
                  Don't send termcap keypad init/deinit strings.
                --no-histdups
                  Remove duplicates from command history.
                --rscroll=C
                  Set the character used to mark truncated lines.
                --save-marks
                  Retain marks across invocations of less.
                --status-col-width=N
                  Set the width of the -J status column to N characters.
                --use-backslash
                  Subsequent options use backslash as escape char.
                --use-color
                  Enables colored text.
                --wheel-lines=N
                  Each click of the mouse wheel moves N lines.


 ---------------------------------------------------------------------------

                          LINE EDITING

        These keys can be used to edit text being entered
        on the "command line" at the bottom of the screen.

 RightArrow ..................... ESC-l ... Move cursor right one character.
 LeftArrow ...................... ESC-h ... Move cursor left one character.
 ctrl-RightArrow  ESC-RightArrow  ESC-w ... Move cursor right one word.
 ctrl-LeftArrow   ESC-LeftArrow   ESC-b ... Move cursor left one word.
 HOME ........................... ESC-0 ... Move cursor to start of line.
 END ............................ ESC-$ ... Move cursor to end of line.
 BACKSPACE ................................ Delete char to left of cursor.
 DELETE ......................... ESC-x ... Delete char under cursor.
 ctrl-BACKSPACE   ESC-BACKSPACE ........... Delete word to left of cursor.
 ctrl-DELETE .... ESC-DELETE .... ESC-X ... Delete word under cursor.
 ctrl-U ......... ESC (MS-DOS only) ....... Delete entire line.
 UpArrow ........................ ESC-k ... Retrieve previous command line.
 DownArrow ...................... ESC-j ... Retrieve next command line.
 TAB ...................................... Complete filename & cycle.
 SHIFT-TAB ...................... ESC-TAB   Complete filename & reverse cycle.
 ctrl-L ................................... Complete filename, list all.
`,

    'more': `Usage:
 more [options] <file>...

A file perusal filter for CRT viewing.

Options:
 -d, --silent          display help instead of ringing bell
 -f, --logical         count logical rather than screen lines
 -l, --no-pause        suppress pause after form feed
 -c, --print-over      do not scroll, display text and clean line ends
 -p, --clean-print     do not scroll, clean screen and display text
 -s, --squeeze         squeeze multiple blank lines into one
 -u, --plain           suppress underlining and bold
 -n, --lines <number>  the number of lines per screenful
 -<number>             same as --lines
 +<number>             display file beginning from line number
 +/<pattern>           display file beginning from pattern match

 -h, --help            display this help
 -V, --version         display version

For more details see more(1).`,

    'systemctl': `systemctl [OPTIONS...] COMMAND ...

Query or send control commands to the system manager.

Unit Commands:
  list-units [PATTERN...]             List units currently in memory
  list-automounts [PATTERN...]        List automount units currently in memory,
                                      ordered by path
  list-sockets [PATTERN...]           List socket units currently in memory,
                                      ordered by address
  list-timers [PATTERN...]            List timer units currently in memory,
                                      ordered by next elapse
  is-active PATTERN...                Check whether units are active
  is-failed PATTERN...                Check whether units are failed
  status [PATTERN...|PID...]          Show runtime status of one or more units
  show [PATTERN...|JOB...]            Show properties of one or more
                                      units/jobs or the manager
  cat PATTERN...                      Show files and drop-ins of specified units
  help PATTERN...|PID...              Show manual for one or more units
  list-dependencies [UNIT...]         Recursively show units which are required
                                      or wanted by the units or by which those
                                      units are required or wanted
  start UNIT...                       Start (activate) one or more units
  stop UNIT...                        Stop (deactivate) one or more units
  reload UNIT...                      Reload one or more units
  restart UNIT...                     Start or restart one or more units
  try-restart UNIT...                 Restart one or more units if active
  reload-or-restart UNIT...           Reload one or more units if possible,
                                      otherwise start or restart
  try-reload-or-restart UNIT...       If active, reload one or more units,
                                      if supported, otherwise restart
  isolate UNIT                        Start one unit and stop all others
  kill UNIT...                        Send signal to processes of a unit
  clean UNIT...                       Clean runtime, cache, state, logs or
                                      configuration of unit
  freeze PATTERN...                   Freeze execution of unit processes
  thaw PATTERN...                     Resume execution of a frozen unit
  set-property UNIT PROPERTY=VALUE... Sets one or more properties of a unit
  bind UNIT PATH [PATH]               Bind-mount a path from the host into a
                                      unit's namespace
  mount-image UNIT PATH [PATH [OPTS]] Mount an image from the host into a
                                      unit's namespace
  service-log-level SERVICE [LEVEL]   Get/set logging threshold for service
  service-log-target SERVICE [TARGET] Get/set logging target for service
  reset-failed [PATTERN...]           Reset failed state for all, one, or more
                                      units
Unit File Commands:
  list-unit-files [PATTERN...]        List installed unit files
  enable [UNIT...|PATH...]            Enable one or more unit files
  disable UNIT...                     Disable one or more unit files
  reenable UNIT...                    Reenable one or more unit files
  preset UNIT...                      Enable/disable one or more unit files
                                      based on preset configuration
  preset-all                          Enable/disable all unit files based on
                                      preset configuration
  is-enabled UNIT...                  Check whether unit files are enabled
  mask UNIT...                        Mask one or more units
  unmask UNIT...                      Unmask one or more units
  link PATH...                        Link one or more units files into
                                      the search path
  revert UNIT...                      Revert one or more unit files to vendor
                                      version
  add-wants TARGET UNIT...            Add 'Wants' dependency for the target
                                      on specified one or more units
  add-requires TARGET UNIT...         Add 'Requires' dependency for the target
                                      on specified one or more units
  edit UNIT...                        Edit one or more unit files
  get-default                         Get the name of the default target
  set-default TARGET                  Set the default target

Machine Commands:
  list-machines [PATTERN...]          List local containers and host

Job Commands:
  list-jobs [PATTERN...]              List jobs
  cancel [JOB...]                     Cancel all, one, or more jobs

Environment Commands:
  show-environment                    Dump environment
  set-environment VARIABLE=VALUE...   Set one or more environment variables
  unset-environment VARIABLE...       Unset one or more environment variables
  import-environment VARIABLE...      Import all or some environment variables

Manager State Commands:
  daemon-reload                       Reload systemd manager configuration
  daemon-reexec                       Reexecute systemd manager
  log-level [LEVEL]                   Get/set logging threshold for manager
  log-target [TARGET]                 Get/set logging target for manager
  service-watchdogs [BOOL]            Get/set service watchdog state

System Commands:
  is-system-running                   Check whether system is fully running
  default                             Enter system default mode
  rescue                              Enter system rescue mode
  emergency                           Enter system emergency mode
  halt                                Shut down and halt the system
  poweroff                            Shut down and power-off the system
  reboot                              Shut down and reboot the system
  kexec                               Shut down and reboot the system with kexec
  exit [EXIT_CODE]                    Request user instance or container exit
  switch-root ROOT [INIT]             Change to a different root file system
  suspend                             Suspend the system
  hibernate                           Hibernate the system
  hybrid-sleep                        Hibernate and suspend the system
  suspend-then-hibernate              Suspend the system, wake after a period of
                                      time, and hibernate
Options:
  -h --help              Show this help
     --version           Show package version
     --system            Connect to system manager
     --user              Connect to user service manager
  -H --host=[USER@]HOST  Operate on remote host
  -M --machine=CONTAINER Operate on a local container
  -t --type=TYPE         List units of a particular type
     --state=STATE       List units with particular LOAD or SUB or ACTIVE state
     --failed            Shortcut for --state=failed
  -p --property=NAME     Show only properties by this name
  -P NAME                Equivalent to --value --property=NAME
  -a --all               Show all properties/all units currently in memory,
                         including dead/empty ones. To list all units installed
                         on the system, use 'list-unit-files' instead.
  -l --full              Don't ellipsize unit names on output
  -r --recursive         Show unit list of host and local containers
     --reverse           Show reverse dependencies with 'list-dependencies'
     --with-dependencies Show unit dependencies with 'status', 'cat',
                         'list-units', and 'list-unit-files'.
     --job-mode=MODE     Specify how to deal with already queued jobs, when
                         queueing a new job
  -T --show-transaction  When enqueuing a unit job, show full transaction
     --show-types        When showing sockets, explicitly show their type
     --value             When showing properties, only print the value
     --check-inhibitors=MODE
                         Whether to check inhibitors before shutting down,
                         sleeping, or hibernating
  -i                     Shortcut for --check-inhibitors=no
     --kill-whom=WHOM    Whom to send signal to
  -s --signal=SIGNAL     Which signal to send
     --what=RESOURCES    Which types of resources to remove
     --now               Start or stop unit after enabling or disabling it
     --dry-run           Only print what would be done
                         Currently supported by verbs: halt, poweroff, reboot,
                             kexec, suspend, hibernate, suspend-then-hibernate,
                             hybrid-sleep, default, rescue, emergency, and exit.
  -q --quiet             Suppress output
     --no-warn           Suppress several warnings shown by default
     --wait              For (re)start, wait until service stopped again
                         For is-system-running, wait until startup is completed
     --no-block          Do not wait until operation finished
     --no-wall           Don't send wall message before halt/power-off/reboot
     --no-reload         Don't reload daemon after en-/dis-abling unit files
     --legend=BOOL       Enable/disable the legend (column headers and hints)
     --no-pager          Do not pipe output into a pager
     --no-ask-password   Do not ask for system passwords
     --global            Edit/enable/disable/mask default user unit files
                         globally
     --runtime           Edit/enable/disable/mask unit files temporarily until
                         next reboot
  -f --force             When enabling unit files, override existing symlinks
                         When shutting down, execute action immediately
     --preset-mode=      Apply only enable, only disable, or all presets
     --root=PATH         Edit/enable/disable/mask unit files in the specified
                         root directory
     --image=PATH        Edit/enable/disable/mask unit files in the specified
                         image
  -n --lines=INTEGER     Number of journal entries to show
  -o --output=STRING     Change journal output mode (short, short-precise,
                             short-iso, short-iso-precise, short-full,
                             short-monotonic, short-unix, short-delta,
                             verbose, export, json, json-pretty, json-sse, cat)
     --firmware-setup    Tell the firmware to show the setup menu on next boot
     --boot-loader-menu=TIME
                         Boot into boot loader menu on next boot
     --boot-loader-entry=NAME
                         Boot into a specific boot loader entry on next boot
     --plain             Print unit dependencies as a list instead of a tree
     --timestamp=FORMAT  Change format of printed timestamps (pretty, unix,
                             us, utc, us+utc)
     --read-only         Create read-only bind mount
     --mkdir             Create directory before mounting, if missing
     --marked            Restart/reload previously marked units

See the systemctl(1) man page for details.`,

    'journalctl': `journalctl [OPTIONS...] [MATCHES...]

Query the journal.

Source Options:
     --system                Show the system journal
     --user                  Show the user journal for the current user
  -M --machine=CONTAINER     Operate on local container
  -m --merge                 Show entries from all available journals
  -D --directory=PATH        Show journal files from directory
     --file=PATH             Show journal file
     --root=ROOT             Operate on files below a root directory
     --image=IMAGE           Operate on files in filesystem image
     --namespace=NAMESPACE   Show journal data from specified journal namespace

Filtering Options:
  -S --since=DATE            Show entries not older than the specified date
  -U --until=DATE            Show entries not newer than the specified date
  -c --cursor=CURSOR         Show entries starting at the specified cursor
     --after-cursor=CURSOR   Show entries after the specified cursor
     --cursor-file=FILE      Show entries after cursor in FILE and update FILE
  -b --boot[=ID]             Show current boot or the specified boot
  -u --unit=UNIT             Show logs from the specified unit
     --user-unit=UNIT        Show logs from the specified user unit
  -t --identifier=STRING     Show entries with the specified syslog identifier
  -p --priority=RANGE        Show entries with the specified priority
     --facility=FACILITY...  Show entries with the specified facilities
  -g --grep=PATTERN          Show entries with MESSAGE matching PATTERN
     --case-sensitive[=BOOL] Force case sensitive or insensitive matching
  -k --dmesg                 Show kernel message log from the current boot

Output Control Options:
  -o --output=STRING         Change journal output mode (short, short-precise,
                               short-iso, short-iso-precise, short-full,
                               short-monotonic, short-unix, verbose, export,
                               json, json-pretty, json-sse, json-seq, cat,
                               with-unit)
     --output-fields=LIST    Select fields to print in verbose/export/json modes
  -n --lines[=INTEGER]       Number of journal entries to show
  -r --reverse               Show the newest entries first
     --show-cursor           Print the cursor after all the entries
     --utc                   Express time in Coordinated Universal Time (UTC)
  -x --catalog               Add message explanations where available
     --no-hostname           Suppress output of hostname field
     --no-full               Ellipsize fields
  -a --all                   Show all fields, including long and unprintable
  -f --follow                Follow the journal
     --no-tail               Show all lines, even in follow mode
  -q --quiet                 Do not show info messages and privilege warning

Pager Control Options:
     --no-pager              Do not pipe output into a pager
  -e --pager-end             Immediately jump to the end in the pager

Forward Secure Sealing (FSS) Options:
     --interval=TIME         Time interval for changing the FSS sealing key
     --verify-key=KEY        Specify FSS verification key
     --force                 Override of the FSS key pair with --setup-keys

Commands:
  -h --help                  Show this help text
     --version               Show package version
  -N --fields                List all field names currently used
  -F --field=FIELD           List all values that a specified field takes
     --list-boots            Show terse information about recorded boots
     --disk-usage            Show total disk usage of all journal files
     --vacuum-size=BYTES     Reduce disk usage below specified size
     --vacuum-files=INT      Leave only the specified number of journal files
     --vacuum-time=TIME      Remove journal files older than specified time
     --verify                Verify journal file consistency
     --sync                  Synchronize unwritten journal messages to disk
     --relinquish-var        Stop logging to disk, log to temporary file system
     --smart-relinquish-var  Similar, but NOP if log directory is on root mount
     --flush                 Flush all journal data from /run into /var
     --rotate                Request immediate rotation of the journal files
     --header                Show journal header information
     --list-catalog          Show all message IDs in the catalog
     --dump-catalog          Show entries in the message catalog
     --update-catalog        Update the message catalog database
     --setup-keys            Generate a new FSS key pair

See the journalctl(1) man page for details.`,

    'pidof': `Usage:
 pidof [options] [program [...]]

Options:
 -s, --single-shot         return one PID only
 -c, --check-root          omit processes with different root
 -q,                       quiet mode, only set the exit code
 -w, --with-workers        show kernel workers too
 -x                        also find shells running the named scripts
 -o, --omit-pid <PID,...>  omit processes with PID
 -S, --separator SEP       use SEP as separator put between PIDs
 -h, --help     display this help and exit
 -V, --version  output version information and exit

For more details see pidof(1).`,

    'pgrep': `Usage:
 pgrep [options] <pattern>

Options:
 -d, --delimiter <string>  specify output delimiter
 -l, --list-name           list PID and process name
 -a, --list-full           list PID and full command line
 -v, --inverse             negates the matching
 -w, --lightweight         list all TID
 -c, --count               count of matching processes
 -f, --full                use full process name to match
 -g, --pgroup <PGID,...>   match listed process group IDs
 -G, --group <GID,...>     match real group IDs
 -i, --ignore-case         match case insensitively
 -n, --newest              select most recently started
 -o, --oldest              select least recently started
 -O, --older <seconds>     select where older than seconds
 -P, --parent <PPID,...>   match only child processes of the given parent
 -s, --session <SID,...>   match session IDs
 -t, --terminal <tty,...>  match by controlling terminal
 -u, --euid <ID,...>       match by effective IDs
 -U, --uid <ID,...>        match by real IDs
 -x, --exact               match exactly with the command name
 -F, --pidfile <file>      read PIDs from file
 -L, --logpidfile          fail if PID file is not locked
 -r, --runstates <state>   match runstates [D,S,Z,...]
 --ns <PID>                match the processes that belong to the same
                           namespace as <pid>
 --nslist <ns,...>         list which namespaces will be considered for
                           the --ns option.
                           Available namespaces: ipc, mnt, net, pid, user, uts

 -h, --help     display this help and exit
 -V, --version  output version information and exit

For more details see pgrep(1).`,

    'ps': {
        helpFlags: ['--help'],  // -h means no header in ps, not help
        text: `Usage:
 ps [options]

 Try 'ps --help <simple|list|output|threads|misc|all>'
  or 'ps --help <s|l|o|t|m|a>'
 for additional help text.

For more details see ps(1).`
    },

    'kill': `kill: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]
    Send a signal to a job.

    Send the processes identified by PID or JOBSPEC the signal named by
    SIGSPEC or SIGNUM.  If neither SIGSPEC nor SIGNUM is present, then
    SIGTERM is assumed.

    Options:
      -s sig    SIG is a signal name
      -n sig    SIG is a signal number
      -l        list the signal names; if arguments follow '-l' they are
                assumed to be signal numbers for which names should be listed
      -L        synonym for -l

    Kill is a shell builtin for two reasons: it allows job IDs to be used
    instead of process IDs, and allows processes to be killed if the limit
    on processes that you can create is reached.

    Exit Status:
    Returns success unless an invalid option is given or an error occurs.`,

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

    'mkfs.xfs': `Usage:
 mkfs [options] [-t <type>] [fs-options] <device> [<size>]

Make a Linux filesystem.

Options:
 -t, --type=<type>  filesystem type; when unspecified, ext2 is used
     fs-options     parameters for the real filesystem builder
     <device>       path to the device to be used
     <size>         number of blocks to be used on the device
 -V, --verbose      explain what is being done;
                      specifying -V more than once will cause a dry-run
 -h, --help         display this help
 -V, --version      display version

For more details see mkfs(8).`,

    'mkfs.ext4': `Usage: mkfs.ext4 [-c|-l filename] [-b block-size] [-C cluster-size]
        [-i bytes-per-inode] [-I inode-size] [-J journal-options]
        [-G flex-group-size] [-N number-of-inodes] [-d root-directory]
        [-m reserved-blocks-percentage] [-o creator-os]
        [-g blocks-per-group] [-L volume-label] [-M last-mounted-directory]
        [-O feature[,...]] [-r fs-revision] [-E extended-option[,...]]
        [-t fs-type] [-T usage-type ] [-U UUID] [-e errors_behavior][-z undo_file]
        [-jnqvDFSV] device [blocks-count]`,

    'mkswap': `Usage:
 mkswap [options] device [size]

Set up a Linux swap area.

Options:
 -c, --check               check bad blocks before creating the swap area
 -f, --force               allow swap size area be larger than device
 -p, --pagesize SIZE       specify page size in bytes
 -L, --label LABEL         specify label
 -v, --swapversion NUM     specify swap-space version number
 -U, --uuid UUID           specify the uuid to use
     --verbose             verbose output
     --lock[=<mode>]       use exclusive device lock (yes, no or nonblock)
 -h, --help                display this help
 -V, --version             display version

For more details see mkswap(8).`,

    'blkid': `Usage:
 blkid --label <label> | --uuid <uuid>

 blkid [--cache-file <file>] [-ghlLv] [--output <format>] [--match-tag <tag>]
       [--match-token <token>] [<dev> ...]

 blkid -p [--match-tag <tag>] [--offset <offset>] [--size <size>]
       [--output <format>] <dev> ...

 blkid -i [--match-tag <tag>] [--output <format>] <dev> ...

Options:
 -c, --cache-file <file>    read from <file> instead of reading from the default
                              cache file (-c /dev/null means no cache)
 -d, --no-encoding          don't encode non-printing characters
 -g, --garbage-collect      garbage collect the blkid cache
 -o, --output <format>      output format; can be one of:
                              value, device, export or full; (default: full)
 -k, --list-filesystems     list all known filesystems/RAIDs and exit
 -s, --match-tag <tag>      show specified tag(s) (default show all tags)
 -t, --match-token <token>  find device with a specific token (NAME=value pair)
 -l, --list-one             look up only first device with token specified by -t
 -L, --label <label>        convert LABEL to device name
 -U, --uuid <uuid>          convert UUID to device name

Low-level probing options:
 -p, --probe                low-level superblocks probing (bypass cache)
 -i, --info                 gather information about I/O limits
 -H, --hint <value>         set hint for probing function
 -S, --size <size>          overwrite device size
 -O, --offset <offset>      probe at the given offset
 -u, --usages <list>        filter by "usage" (e.g. -u filesystem,raid)
 -n, --match-types <list>   filter by filesystem type (e.g. -n vfat,ext3)
 -D, --no-part-details      don't print info from partition table

 -h, --help                 display this help
 -V, --version              display version

Arguments:
 <size> and <offset> arguments may be followed by the suffixes for
   GiB, TiB, PiB, EiB, ZiB, and YiB (the "iB" is optional)

 <dev> specify device(s) to probe (default: all devices)

For more details see blkid(8).`,

    'lsblk': `Usage:
 lsblk [options] [<device> ...]

List information about block devices.

Options:
 -D, --discard        print discard capabilities
 -E, --dedup <column> de-duplicate output by <column>
 -I, --include <list> show only devices with specified major numbers
 -J, --json           use JSON output format
 -O, --output-all     output all columns
 -P, --pairs          use key="value" output format
 -S, --scsi           output info about SCSI devices
 -T, --tree[=<column>] use tree format output
 -a, --all            print all devices
 -b, --bytes          print SIZE in bytes rather than in human readable format
 -d, --nodeps         don't print slaves or holders
 -e, --exclude <list> exclude devices by major number (default: RAM disks)
 -f, --fs             output info about filesystems
 -i, --ascii          use ascii characters only
 -l, --list           use list format output
 -M, --merge          group parents of sub-trees (usable for RAIDs, Multi-path)
 -m, --perms          output info about permissions
 -n, --noheadings     don't print headings
 -o, --output <list>  output columns
 -p, --paths          print complete device path
 -r, --raw            use raw output format
 -s, --inverse        inverse dependencies
 -t, --topology       output info about topology
 -w, --width <num>    specifies output width as number of characters
 -x, --sort <column>  sort output by <column>
 -z, --zoned          print zone model
     --sysroot <dir>  use specified directory as system root

 -h, --help           display this help
 -V, --version        display version

Available output columns:
         NAME  device name
        KNAME  internal kernel device name
         PATH  path to the device node
      MAJ:MIN  major:minor device number
      FSAVAIL  filesystem size available
       FSSIZE  filesystem size
       FSTYPE  filesystem type
       FSUSED  filesystem size used
       FSUSE%  filesystem use percentage
      FSROOTS  mounted filesystem roots
        FSVER  filesystem version
   MOUNTPOINT  where the device is mounted
  MOUNTPOINTS  all locations where device is mounted
        LABEL  filesystem LABEL
         UUID  filesystem UUID
       PTUUID  partition table identifier (usually UUID)
       PTTYPE  partition table type
     PARTTYPE  partition type code or UUID
 PARTTYPENAME  partition type name
    PARTLABEL  partition LABEL
     PARTUUID  partition UUID
    PARTFLAGS  partition flags
           RA  read-ahead of the device
           RO  read-only device
           RM  removable device
      HOTPLUG  removable or hotplug device (usb, pcmcia, ...)
        MODEL  device identifier
       SERIAL  disk serial number
         SIZE  size of the device
        STATE  state of the device
        OWNER  user name
        GROUP  group name
         MODE  device node permissions
    ALIGNMENT  alignment offset
       MIN-IO  minimum I/O size
       OPT-IO  optimal I/O size
      PHY-SEC  physical sector size
      LOG-SEC  logical sector size
         ROTA  rotational device
        SCHED  I/O scheduler name
      RQ-SIZE  request queue size
         TYPE  device type
     DISC-ALN  discard alignment offset
    DISC-GRAN  discard granularity
     DISC-MAX  discard max bytes
    DISC-ZERO  discard zeroes data
        WSAME  write same max bytes
          WWN  unique storage identifier
         RAND  adds randomness
       PKNAME  internal parent kernel device name
         HCTL  Host:Channel:Target:Lun for SCSI
         TRAN  device transport type
   SUBSYSTEMS  de-duplicated chain of subsystems
          REV  device revision
       VENDOR  device vendor
        ZONED  zone model
          DAX  dax-capable device

For more details see lsblk(8).`,

    'swapon': `Usage:
 swapon [options] [<spec>]

Enable devices and files for paging and swapping.

Options:
 -a, --all                enable all swaps from /etc/fstab
 -d, --discard[=<policy>] enable swap discards, if supported by device
 -e, --ifexists           silently skip devices that do not exist
 -f, --fixpgsz            reinitialize the swap space if necessary
 -o, --options <list>     comma-separated list of swap options
 -p, --priority <prio>    specify the priority of the swap device
 -s, --summary            display summary about used swap devices (DEPRECATED)
     --show[=<columns>]   display summary in definable table
     --noheadings         don't print table heading (with --show)
     --raw                use the raw output format (with --show)
     --bytes              display swap size in bytes in --show output
 -v, --verbose            verbose mode

 -h, --help               display this help
 -V, --version            display version

The <spec> parameter:
 -L <label>             synonym for LABEL=<label>
 -U <uuid>              synonym for UUID=<uuid>
 LABEL=<label>          specifies device by swap area label
 UUID=<uuid>            specifies device by swap area UUID
 PARTLABEL=<label>      specifies device by partition label
 PARTUUID=<uuid>        specifies device by partition UUID
 <device>               name of device to be used
 <file>                 name of file to be used

Available discard policy types (for --discard):
 once    : only single-time area discards are issued
 pages   : freed pages are discarded before they are reused
If no policy is selected, both discard types are enabled (default).

Available output columns:
 NAME   device file or partition path
 TYPE   type of the device
 SIZE   size of the swap area
 USED   bytes in use
 PRIO   swap priority
 UUID   swap uuid
 LABEL  swap label

For more details see swapon(8).`,

    'swapoff': `Usage:
 swapoff [options] [<spec>]

Disable devices and files for paging and swapping.

Options:
 -a, --all              disable all swaps from /proc/swaps
 -v, --verbose          verbose mode

 -h, --help             display this help
 -V, --version          display version

The <spec> parameter:
 -L <label>             LABEL of device to be used
 -U <uuid>              UUID of device to be used
 LABEL=<label>          LABEL of device to be used
 UUID=<uuid>            UUID of device to be used
 <device>               name of device to be used
 <file>                 name of file to be used

For more details see swapoff(8).`,

    'free': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage:
 free [options]

Options:
 -b, --bytes         show output in bytes
     --kilo          show output in kilobytes
     --mega          show output in megabytes
     --giga          show output in gigabytes
     --tera          show output in terabytes
     --peta          show output in petabytes
 -k, --kibi          show output in kibibytes
 -m, --mebi          show output in mebibytes
 -g, --gibi          show output in gibibytes
     --tebi          show output in tebibytes
     --pebi          show output in pebibytes
 -h, --human         show human-readable output
     --si            use powers of 1000 not 1024
 -l, --lohi          show detailed low and high memory statistics
 -t, --total         show total for RAM + swap
 -s N, --seconds N   repeat printing every N seconds
 -c N, --count N     repeat printing N times, then exit
 -w, --wide          wide output

     --help     display this help and exit
 -V, --version  output version information and exit

For more details see free(1).`
    },

    'dnf': `usage: dnf [options] COMMAND

List of Main Commands:

alias                     List or create command aliases
autoremove                remove all unneeded packages that were originally installed as dependencies
check                     check for problems in the packagedb
check-update              check for available package upgrades
clean                     remove cached data
deplist                   [deprecated, use repoquery --deplist] List package's dependencies and what packages provide them
distro-sync               synchronize installed packages to the latest available versions
downgrade                 Downgrade a package
group                     display, or use, the groups information
help                      display a helpful usage message
history                   display, or use, the transaction history
info                      display details about a package or group of packages
install                   install a package or packages on your system
list                      list a package or groups of packages
makecache                 generate the metadata cache
mark                      mark or unmark installed packages as installed by user.
module                    Interact with Modules.
provides                  find what package provides the given value
reinstall                 reinstall a package
remove                    remove a package or packages from your system
repolist                  display the configured software repositories
repoquery                 search for packages matching keyword
repository-packages       run commands on top of all packages in given repository
search                    search package details for the given string
shell                     run an interactive DNF shell
swap                      run an interactive DNF mod for remove and install one spec
updateinfo                display advisories about packages
upgrade                   upgrade a package or packages on your system
upgrade-minimal           upgrade, but only 'newest' package match which fixes a problem that affects your system

List of Plugin Commands:

builddep                  Install build dependencies for package or spec file
changelog                 Show changelog data of packages
config-manager            manage dnf configuration options and repositories
copr                      Interact with Copr repositories.
debug-dump                dump information about installed rpm packages to file
debug-restore             restore packages recorded in debug-dump file
debuginfo-install         install debuginfo packages
download                  Download package to current directory
groups-manager            create and edit groups metadata file
kpatch                    Toggles automatic installation of kpatch-patch packages
needs-restarting          determine updated binaries that need restarting
offline-distrosync        Prepare offline distrosync of the system
offline-upgrade           Prepare offline upgrade of the system
playground                Interact with Playground repository.
repoclosure               Display a list of unresolved dependencies for repositories
repodiff                  List differences between two sets of repositories
repograph                 Output a full package dependency graph in dot format
repomanage                Manage a directory of rpm packages
reposync                  download all packages from remote repo
system-upgrade            Prepare system for upgrade to a new release

General DNF options:
  -c [config file], --config [config file]
                        config file location
  -q, --quiet           quiet operation
  -v, --verbose         verbose operation
  --version             show DNF version and exit
  --installroot [path]  set install root
  --nodocs              do not install documentations
  --noplugins           disable all plugins
  --enableplugin [plugin]
                        enable plugins by name
  --disableplugin [plugin]
                        disable plugins by name
  --releasever RELEASEVER
                        override the value of $releasever in config and repo files
  --setopt SETOPTS      set arbitrary config and repo options
  --skip-broken         resolve depsolve problems by skipping packages
  -h, --help, --help-cmd
                        show command help
  --allowerasing        allow erasing of installed packages to resolve dependencies
  -b, --best            try the best available package versions in transactions.
  --nobest              do not limit the transaction to the best candidate
  -C, --cacheonly       run entirely from system cache, don't update cache
  -R [minutes], --randomwait [minutes]
                        maximum command wait time
  -d [debug level], --debuglevel [debug level]
                        debugging output level
  --debugsolver         dumps detailed solving results into files
  --showduplicates      show duplicates, in repos, in list/search commands
  -e ERRORLEVEL, --errorlevel ERRORLEVEL
                        error output level
  --obsoletes           enables dnf's obsoletes processing logic for upgrade or display capabilities that the package obsoletes for info,
                        list and repoquery
  --rpmverbosity [debug level name]
                        debugging output level for rpm
  -y, --assumeyes       automatically answer yes for all questions
  --assumeno            automatically answer no for all questions
  --enablerepo [repo]   Temporarily enable repositories for the purpose of the current dnf command. Accepts an id, a comma-separated list
                        of ids, or a glob of ids. This option can be specified multiple times.
  --disablerepo [repo]  Temporarily disable active repositories for the purpose of the current dnf command. Accepts an id, a comma-
                        separated list of ids, or a glob of ids. This option can be specified multiple times, but is mutually exclusive
                        with '--repo'.
  --repo [repo], --repoid [repo]
                        enable just specific repositories by an id or a glob, can be specified multiple times
  --enable              enable repos with config-manager command (automatically saves)
  --disable             disable repos with config-manager command (automatically saves)
  -x [package], --exclude [package], --excludepkgs [package]
                        exclude packages by name or glob
  --disableexcludes [repo], --disableexcludepkgs [repo]
                        disable excludepkgs
  --repofrompath [repo,path]
                        label and path to an additional repository to use (same path as in a baseurl), can be specified multiple times.
  --noautoremove        disable removal of dependencies that are no longer used
  --nogpgcheck          disable gpg signature checking (if RPM policy allows)
  --color COLOR         control whether color is used
  --refresh             set metadata as expired before running the command
  -4                    resolve to IPv4 addresses only
  -6                    resolve to IPv6 addresses only
  --destdir DESTDIR, --downloaddir DESTDIR
                        set directory to copy packages to
  --downloadonly        only download packages
  --comment COMMENT     add a comment to transaction
  --bugfix              Include bugfix relevant packages, in updates
  --enhancement         Include enhancement relevant packages, in updates
  --newpackage          Include newpackage relevant packages, in updates
  --security            Include security relevant packages, in updates
  --advisory ADVISORY, --advisories ADVISORY
                        Include packages needed to fix the given advisory, in updates
  --bz BUGZILLA, --bzs BUGZILLA
                        Include packages needed to fix the given BZ, in updates
  --cve CVES, --cves CVES
                        Include packages needed to fix the given CVE, in updates
  --sec-severity {Critical,Important,Moderate,Low}, --secseverity {Critical,Important,Moderate,Low}
                        Include security relevant packages matching the severity, in updates
  --forcearch ARCH      Force the use of an architecture`,

    'yum': `usage: yum [options] COMMAND

List of Main Commands:

alias                     List or create command aliases
autoremove                remove all unneeded packages that were originally installed as dependencies
check                     check for problems in the packagedb
check-update              check for available package upgrades
clean                     remove cached data
deplist                   [deprecated, use repoquery --deplist] List package's dependencies and what packages provide them
distro-sync               synchronize installed packages to the latest available versions
downgrade                 Downgrade a package
group                     display, or use, the groups information
help                      display a helpful usage message
history                   display, or use, the transaction history
info                      display details about a package or group of packages
install                   install a package or packages on your system
list                      list a package or groups of packages
makecache                 generate the metadata cache
mark                      mark or unmark installed packages as installed by user.
module                    Interact with Modules.
provides                  find what package provides the given value
reinstall                 reinstall a package
remove                    remove a package or packages from your system
repolist                  display the configured software repositories
repoquery                 search for packages matching keyword
repository-packages       run commands on top of all packages in given repository
search                    search package details for the given string
shell                     run an interactive YUM shell
swap                      run an interactive YUM mod for remove and install one spec
updateinfo                display advisories about packages
upgrade                   upgrade a package or packages on your system
upgrade-minimal           upgrade, but only 'newest' package match which fixes a problem that affects your system

List of Plugin Commands:

builddep                  Install build dependencies for package or spec file
changelog                 Show changelog data of packages
config-manager            manage yum configuration options and repositories
copr                      Interact with Copr repositories.
debug-dump                dump information about installed rpm packages to file
debug-restore             restore packages recorded in debug-dump file
debuginfo-install         install debuginfo packages
download                  Download package to current directory
groups-manager            create and edit groups metadata file
kpatch                    Toggles automatic installation of kpatch-patch packages
needs-restarting          determine updated binaries that need restarting
offline-distrosync        Prepare offline distrosync of the system
offline-upgrade           Prepare offline upgrade of the system
playground                Interact with Playground repository.
repoclosure               Display a list of unresolved dependencies for repositories
repodiff                  List differences between two sets of repositories
repograph                 Output a full package dependency graph in dot format
repomanage                Manage a directory of rpm packages
reposync                  download all packages from remote repo
system-upgrade            Prepare system for upgrade to a new release

General YUM options:
  -c [config file], --config [config file]
                        config file location
  -q, --quiet           quiet operation
  -v, --verbose         verbose operation
  --version             show YUM version and exit
  --installroot [path]  set install root
  --nodocs              do not install documentations
  --noplugins           disable all plugins
  --enableplugin [plugin]
                        enable plugins by name
  --disableplugin [plugin]
                        disable plugins by name
  --releasever RELEASEVER
                        override the value of $releasever in config and repo files
  --setopt SETOPTS      set arbitrary config and repo options
  --skip-broken         resolve depsolve problems by skipping packages
  -h, --help, --help-cmd
                        show command help
  --allowerasing        allow erasing of installed packages to resolve dependencies
  -b, --best            try the best available package versions in transactions.
  --nobest              do not limit the transaction to the best candidate
  -C, --cacheonly       run entirely from system cache, don't update cache
  -R [minutes], --randomwait [minutes]
                        maximum command wait time
  -d [debug level], --debuglevel [debug level]
                        debugging output level
  --debugsolver         dumps detailed solving results into files
  --showduplicates      show duplicates, in repos, in list/search commands
  -e ERRORLEVEL, --errorlevel ERRORLEVEL
                        error output level
  --obsoletes           enables yum's obsoletes processing logic for upgrade or display capabilities that the package obsoletes for info,
                        list and repoquery
  --rpmverbosity [debug level name]
                        debugging output level for rpm
  -y, --assumeyes       automatically answer yes for all questions
  --assumeno            automatically answer no for all questions
  --enablerepo [repo]   Temporarily enable repositories for the purpose of the current dnf command. Accepts an id, a comma-separated list
                        of ids, or a glob of ids. This option can be specified multiple times.
  --disablerepo [repo]  Temporarily disable active repositories for the purpose of the current dnf command. Accepts an id, a comma-
                        separated list of ids, or a glob of ids. This option can be specified multiple times, but is mutually exclusive
                        with '--repo'.
  --repo [repo], --repoid [repo]
                        enable just specific repositories by an id or a glob, can be specified multiple times
  --enable              enable repos with config-manager command (automatically saves)
  --disable             disable repos with config-manager command (automatically saves)
  -x [package], --exclude [package], --excludepkgs [package]
                        exclude packages by name or glob
  --disableexcludes [repo], --disableexcludepkgs [repo]
                        disable excludepkgs
  --repofrompath [repo,path]
                        label and path to an additional repository to use (same path as in a baseurl), can be specified multiple times.
  --noautoremove        disable removal of dependencies that are no longer used
  --nogpgcheck          disable gpg signature checking (if RPM policy allows)
  --color COLOR         control whether color is used
  --refresh             set metadata as expired before running the command
  -4                    resolve to IPv4 addresses only
  -6                    resolve to IPv6 addresses only
  --destdir DESTDIR, --downloaddir DESTDIR
                        set directory to copy packages to
  --downloadonly        only download packages
  --comment COMMENT     add a comment to transaction
  --bugfix              Include bugfix relevant packages, in updates
  --enhancement         Include enhancement relevant packages, in updates
  --newpackage          Include newpackage relevant packages, in updates
  --security            Include security relevant packages, in updates
  --advisory ADVISORY, --advisories ADVISORY
                        Include packages needed to fix the given advisory, in updates
  --bz BUGZILLA, --bzs BUGZILLA
                        Include packages needed to fix the given BZ, in updates
  --cve CVES, --cves CVES
                        Include packages needed to fix the given CVE, in updates
  --sec-severity {Critical,Important,Moderate,Low}, --secseverity {Critical,Important,Moderate,Low}
                        Include security relevant packages matching the severity, in updates
  --forcearch ARCH      Force the use of an architecture`,

    'rpm': `Usage: rpm [OPTION...]

Query/Verify package selection options:
  -a, --all                          query/verify all packages
  -f, --file                         query/verify package(s) owning installed file
      --path                         query/verify package(s) owning path, installed or not
  -g, --group                        query/verify package(s) in group
  -p, --package                      query/verify a package file
      --pkgid                        query/verify package(s) with package identifier
      --hdrid                        query/verify package(s) with header identifier
      --triggeredby                  query the package(s) triggered by the package
      --whatconflicts                query/verify the package(s) which conflict with a dependency
      --whatrequires                 query/verify the package(s) which require a dependency
      --whatobsoletes                query/verify the package(s) which obsolete a dependency
      --whatprovides                 query/verify the package(s) which provide a dependency
      --whatrecommends               query/verify the package(s) which recommends a dependency
      --whatsuggests                 query/verify the package(s) which suggests a dependency
      --whatsupplements              query/verify the package(s) which supplements a dependency
      --whatenhances                 query/verify the package(s) which enhances a dependency
      --nomanifest                   do not process non-package files as manifests

Query/Verify file selection options:
  -c, --configfiles                  only include configuration files
  -d, --docfiles                     only include documentation files
  -L, --licensefiles                 only include license files
  -A, --artifactfiles                only include artifact files
      --noghost                      exclude %%ghost files
      --noconfig                     exclude %%config files
      --noartifact                   exclude %%artifact files

Query options (with -q or --query):
      --dump                         dump basic file information
  -l, --list                         list files in package
      --queryformat=QUERYFORMAT      use the following query format
  -s, --state                        display the states of the listed files

Verify options (with -V or --verify):
      --nofiledigest                 don't verify digest of files
      --nofiles                      don't verify files in package
      --nodeps                       don't verify package dependencies
      --noscript                     don't execute verify script(s)

Install/Upgrade/Erase options:
      --allfiles                     install all files, even configurations which might otherwise be skipped
      --allmatches                   remove all packages which match <package> (normally an error is generated if <package> specified
                                     multiple packages)
      --badreloc                     relocate files in non-relocatable package
  -e, --erase=<package>+             erase (uninstall) package
      --excludedocs                  do not install documentation
      --excludepath=<path>           skip files with leading component <path>
      --force                        short hand for --replacepkgs --replacefiles
  -F, --freshen=<packagefile>+       upgrade package(s) if already installed
  -h, --hash                         print hash marks as package installs (good with -v)
      --ignorearch                   don't verify package architecture
      --ignoreos                     don't verify package operating system
      --ignoresize                   don't check disk space before installing
      --noverify                     short hand for --ignorepayload --ignoresignature
  -i, --install                      install package(s)
      --justdb                       update the database, but do not modify the filesystem
      --nodeps                       do not verify package dependencies
      --nofiledigest                 don't verify digest of files
      --nocontexts                   don't install file security contexts
      --nocaps                       don't install file capabilities
      --noorder                      do not reorder package installation to satisfy dependencies
      --noscripts                    do not execute package scriptlet(s)
      --notriggers                   do not execute any scriptlet(s) triggered by this package
      --oldpackage                   upgrade to an old version of the package (--force on upgrades does this automatically)
      --percent                      print percentages as package installs
      --prefix=<dir>                 relocate the package to <dir>, if relocatable
      --relocate=<old>=<new>         relocate files from path <old> to <new>
      --replacefiles                 ignore file conflicts between packages
      --replacepkgs                  reinstall if the package is already present
      --test                         don't install, but tell if it would work or not
  -U, --upgrade=<packagefile>+       upgrade package(s)
      --reinstall=<packagefile>+     reinstall package(s)

Common options for all rpm modes and executables:
  -D, --define='MACRO EXPR'          define MACRO with value EXPR
      --undefine=MACRO               undefine MACRO
  -E, --eval='EXPR'                  print macro expansion of EXPR
      --target=CPU-VENDOR-OS         Specify target platform
      --macros=<FILE:...>            read <FILE:...> instead of default file(s)
      --load=<FILE>                  load a single macro file
      --noplugins                    don't enable any plugins
      --nodigest                     don't verify package digest(s)
      --nosignature                  don't verify package signature(s)
      --rcfile=<FILE:...>            read <FILE:...> instead of default file(s)
  -r, --root=ROOT                    use ROOT as top level directory (default: "/")
      --dbpath=DIRECTORY             use database in DIRECTORY
      --querytags                    display known query tags
      --showrc                       display final rpmrc and macro configuration
      --quiet                        provide less detailed output
  -v, --verbose                      provide more detailed output
      --version                      print the version of rpm being used

Options implemented via popt alias/exec:
      --scripts                      list install/erase scriptlets from package(s)
      --setperms                     set permissions of files in a package
      --setugids                     set user/group ownership of files in a package
      --setcaps                      set capabilities of files in a package
      --restore                      restore file/directory permissions
      --conflicts                    list capabilities this package conflicts with
      --obsoletes                    list other packages removed by installing this package
      --provides                     list capabilities that this package provides
      --requires                     list capabilities required by package(s)
      --recommends                   list capabilities recommended by package(s)
      --suggests                     list capabilities suggested by package(s)
      --supplements                  list capabilities supplemented by package(s)
      --enhances                     list capabilities enhanced by package(s)
      --info                         list descriptive information from package(s)
      --changelog                    list change logs for this package
      --changes                      list changes for this package with full time stamps
      --xml                          list metadata in xml
      --triggers                     list trigger scriptlets from package(s)
      --filetriggers                 list filetrigger scriptlets from package(s)
      --last                         list package(s) by install time, most recent first
      --dupes                        list duplicated packages
      --filesbypkg                   list all files from each package
      --fileclass                    list file names with their classes
      --filecolor                    list file names with their colors
      --fileprovide                  list file names with their provides
      --filerequire                  list file names with requires
      --filecaps                     list file names with their POSIX1.e capabilities

Help options:
  -?, --help                         Show this help message
      --usage                        Display brief usage message`,

    'nmcli': `Usage: nmcli [OPTIONS] OBJECT { COMMAND | help }

OPTIONS
  -a, --ask                                ask for missing parameters
  -c, --colors auto|yes|no                 whether to use colors in output
  -e, --escape yes|no                      escape columns separators in values
  -f, --fields <field,...>|all|common      specify fields to output
  -g, --get-values <field,...>|all|common  shortcut for -m tabular -t -f
  -h, --help                               print this help
  -m, --mode tabular|multiline             output mode
  -o, --overview                           overview mode
  -p, --pretty                             pretty output
  -s, --show-secrets                       allow displaying passwords
  -t, --terse                              terse output
  -v, --version                            show program version
  -w, --wait <seconds>                     set timeout waiting for finishing operations

OBJECT
  g[eneral]       NetworkManager's general status and operations
  n[etworking]    overall networking control
  r[adio]         NetworkManager radio switches
  c[onnection]    NetworkManager's connections
  d[evice]        devices managed by NetworkManager
  a[gent]         NetworkManager secret agent or polkit agent
  m[onitor]       monitor NetworkManager changes`,

    'firewall-cmd': `Usage: firewall-cmd [OPTIONS...]

General Options
  -h, --help           Prints a short help text and exits
  -V, --version        Print the version string of firewalld
  -q, --quiet          Do not print status messages

Status Options
  --state              Return and print firewalld state
  --reload             Reload firewall and keep state information
  --complete-reload    Reload firewall and lose state information
  --runtime-to-permanent
                       Create permanent from runtime configuration
  --reset-to-defaults
                       Reset configuration to firewalld's default configuration
  --check-config       Check permanent configuration for errors

Log Denied Options
  --get-log-denied     Print the log denied value
  --set-log-denied=<value>
                       Set log denied value

Permanent Options
  --permanent          Set an option permanently
                       Usable for options marked with [P]

Zone Options
  --get-default-zone   Print default zone for connections and interfaces
  --set-default-zone=<zone>
                       Set default zone
  --get-active-zones   Print currently active zones
  --get-zones          Print predefined zones [P]
  --get-services       Print predefined services [P]
  --get-icmptypes      Print predefined icmptypes [P]
  --get-zone-of-interface=<interface>
                       Print name of the zone the interface is bound to [P]
  --get-zone-of-source=<source>[/<mask>]|<MAC>|ipset:<ipset>
                       Print name of the zone the source is bound to [P]
  --list-all-zones     List everything added for or enabled in all zones [P]
  --new-zone=<zone>    Add a new zone [P only]
  --new-zone-from-file=<filename> [--name=<zone>]
                       Add a new zone from file with optional name [P only]
  --delete-zone=<zone> Delete an existing zone [P only]
  --load-zone-defaults=<zone>
                       Load zone default settings [P only]
  --zone=<zone>        Use this zone to set or query options, else default zone
                       Usable for options marked with [Z]
  --info-zone=<zone>   Print information about a zone
  --path-zone=<zone>   Print file path of a zone [P only]

Policy Options
  --get-policies       Print predefined policies
  --get-active-policies
                       Print currently active policies
  --list-all-policies  List everything added for or enabled in all policies
  --new-policy=<policy>
                       Add a new empty policy
  --new-policy-from-file=<filename> [--name=<policy>]
                       Add a new policy from file with optional name override [P only]
  --delete-policy=<policy>
                       Delete an existing policy
  --load-policy-defaults=<policy>
                       Load policy default settings
  --policy=<policy>    Use this policy to set or query options
                       Usable for options marked with [O]
  --info-policy=<policy>
                       Print information about a policy
  --path-policy=<policy>
                       Print file path of a policy

IPSet Options
  --get-ipset-types    Print the supported ipset types
  --new-ipset=<ipset> --type=<ipset type> [--option=<key>[=<value>]]..
                       Add a new ipset [P only]
  --new-ipset-from-file=<filename> [--name=<ipset>]
                       Add a new ipset from file with optional name [P only]
  --delete-ipset=<ipset>
                       Delete an existing ipset [P only]
  --load-ipset-defaults=<ipset>
                       Load ipset default settings [P only]
  --info-ipset=<ipset> Print information about an ipset
  --path-ipset=<ipset> Print file path of an ipset [P only]
  --get-ipsets         Print predefined ipsets
  --ipset=<ipset> --set-description=<description>
                       Set new description to ipset [P only]
  --ipset=<ipset> --get-description
                       Print description for ipset [P only]
  --ipset=<ipset> --set-short=<description>
                       Set new short description to ipset [P only]
  --ipset=<ipset> --get-short
                       Print short description for ipset [P only]
  --ipset=<ipset> --add-entry=<entry>
                       Add a new entry to an ipset [P]
  --ipset=<ipset> --remove-entry=<entry>
                       Remove an entry from an ipset [P]
  --ipset=<ipset> --query-entry=<entry>
                       Return whether ipset has an entry [P]
  --ipset=<ipset> --get-entries
                       List entries of an ipset [P]
  --ipset=<ipset> --add-entries-from-file=<entry>
                       Add a new entries to an ipset [P]
  --ipset=<ipset> --remove-entries-from-file=<entry>
                       Remove entries from an ipset [P]

IcmpType Options
  --new-icmptype=<icmptype>
                       Add a new icmptype [P only]
  --new-icmptype-from-file=<filename> [--name=<icmptype>]
                       Add a new icmptype from file with optional name [P only]
  --delete-icmptype=<icmptype>
                       Delete an existing icmptype [P only]
  --load-icmptype-defaults=<icmptype>
                       Load icmptype default settings [P only]
  --info-icmptype=<icmptype>
                       Print information about an icmptype
  --path-icmptype=<icmptype>
                       Print file path of an icmptype [P only]
  --icmptype=<icmptype> --set-description=<description>
                       Set new description to icmptype [P only]
  --icmptype=<icmptype> --get-description
                       Print description for icmptype [P only]
  --icmptype=<icmptype> --set-short=<description>
                       Set new short description to icmptype [P only]
  --icmptype=<icmptype> --get-short
                       Print short description for icmptype [P only]
  --icmptype=<icmptype> --add-destination=<ipv>
                       Enable destination for ipv in icmptype [P only]
  --icmptype=<icmptype> --remove-destination=<ipv>
                       Disable destination for ipv in icmptype [P only]
  --icmptype=<icmptype> --query-destination=<ipv>
                       Return whether destination ipv is enabled in icmptype [P only]
  --icmptype=<icmptype> --get-destinations
                       List destinations in icmptype [P only]

Service Options
  --new-service=<service>
                       Add a new service [P only]
  --new-service-from-file=<filename> [--name=<service>]
                       Add a new service from file with optional name [P only]
  --delete-service=<service>
                       Delete an existing service [P only]
  --load-service-defaults=<service>
                       Load icmptype default settings [P only]
  --info-service=<service>
                       Print information about a service
  --path-service=<service>
                       Print file path of a service [P only]
  --service=<service> --set-description=<description>
                       Set new description to service [P only]
  --service=<service> --get-description
                       Print description for service [P only]
  --service=<service> --set-short=<description>
                       Set new short description to service [P only]
  --service=<service> --get-short
                       Print short description for service [P only]
  --service=<service> --add-port=<portid>[-<portid>]/<protocol>
                       Add a new port to service [P only]
  --service=<service> --remove-port=<portid>[-<portid>]/<protocol>
                       Remove a port from service [P only]
  --service=<service> --query-port=<portid>[-<portid>]/<protocol>
                       Return whether the port has been added for service [P only]
  --service=<service> --get-ports
                       List ports of service [P only]
  --service=<service> --add-protocol=<protocol>
                       Add a new protocol to service [P only]
  --service=<service> --remove-protocol=<protocol>
                       Remove a protocol from service [P only]
  --service=<service> --query-protocol=<protocol>
                       Return whether the protocol has been added for service [P only]
  --service=<service> --get-protocols
                       List protocols of service [P only]
  --service=<service> --add-source-port=<portid>[-<portid>]/<protocol>
                       Add a new source port to service [P only]
  --service=<service> --remove-source-port=<portid>[-<portid>]/<protocol>
                       Remove a source port from service [P only]
  --service=<service> --query-source-port=<portid>[-<portid>]/<protocol>
                       Return whether the source port has been added for service [P only]
  --service=<service> --get-source-ports
                       List source ports of service [P only]
  --service=<service> --add-helper=<helper>
                       Add a new helper to service [P only]
  --service=<service> --remove-helper=<helper>
                       Remove a helper from service [P only]
  --service=<service> --query-helper=<helper>
                       Return whether the helper has been added for service [P only]
  --service=<service> --get-service-helpers
                       List helpers of service [P only]
  --service=<service> --set-destination=<ipv>:<address>[/<mask>]
                       Set destination for ipv to address in service [P only]
  --service=<service> --remove-destination=<ipv>
                       Disable destination for ipv i service [P only]
  --service=<service> --query-destination=<ipv>:<address>[/<mask>]
                       Return whether destination ipv is set for service [P only]
  --service=<service> --get-destinations
                       List destinations in service [P only]
  --service=<service> --add-include=<service>
                       Add a new include to service [P only]
  --service=<service> --remove-include=<service>
                       Remove a include from service [P only]
  --service=<service> --query-include=<service>
                       Return whether the include has been added for service [P only]
  --service=<service> --get-includes
                       List includes of service [P only]

Options to Adapt and Query Zones and Policies
  --list-all           List everything added for or enabled [P] [Z] [O]
  --timeout=<timeval>  Enable an option for timeval time, where timeval is
                       a number followed by one of letters 's' or 'm' or 'h'
                       Usable for options marked with [T]
  --set-description=<description>
                       Set new description [P only] [Z] [O]
  --get-description    Print description [P only] [Z] [O]
  --get-target         Get the target [P only] [Z] [O]
  --set-target=<target>
                       Set the target [P only] [Z] [O]
  --set-short=<description>
                       Set new short description [Z] [O]
  --get-short          Print short description [P only] [Z] [O]
  --list-services      List services added [P] [Z]
  --add-service=<service>
                       Add a service [P] [Z] [O] [T]
  --remove-service=<service>
                       Remove a service [P] [Z] [O]
  --query-service=<service>
                       Return whether service has been added [P] [Z] [O]
  --list-ports         List ports added [P] [Z] [O]
  --add-port=<portid>[-<portid>]/<protocol>
                       Add the port [P] [Z] [O] [T]
  --remove-port=<portid>[-<portid>]/<protocol>
                       Remove the port [P] [Z] [O]
  --query-port=<portid>[-<portid>]/<protocol>
                       Return whether the port has been added [P] [Z] [O]
  --list-protocols     List protocols added [P] [Z] [O]
  --add-protocol=<protocol>
                       Add the protocol [P] [Z] [O] [T]
  --remove-protocol=<protocol>
                       Remove the protocol [P] [Z] [O]
  --query-protocol=<protocol>
                       Return whether the protocol has been added [P] [Z] [O]
  --list-source-ports  List source ports added [P] [Z] [O]
  --add-source-port=<portid>[-<portid>]/<protocol>
                       Add the source port [P] [Z] [O] [T]
  --remove-source-port=<portid>[-<portid>]/<protocol>
                       Remove the source port [P] [Z] [O]
  --query-source-port=<portid>[-<portid>]/<protocol>
                       Return whether the source port has been added [P] [Z] [O]
  --list-icmp-blocks   List Internet ICMP type blocks added [P] [Z] [O]
  --add-icmp-block=<icmptype>
                       Add an ICMP block [P] [Z] [O] [T]
  --remove-icmp-block=<icmptype>
                       Remove the ICMP block [P] [Z] [O]
  --query-icmp-block=<icmptype>
                       Return whether an ICMP block has been added [P] [Z] [O]
  --list-forward-ports List IPv4 forward ports added [P] [Z] [O]
  --add-forward-port=port=<portid>[-<portid>]:proto=<protocol>[:toport=<portid>[-<portid>]][:toaddr=<address>[/<mask>]]
                       Add the IPv4 forward port [P] [Z] [O] [T]
  --remove-forward-port=port=<portid>[-<portid>]:proto=<protocol>[:toport=<portid>[-<portid>]][:toaddr=<address>[/<mask>]]
                       Remove the IPv4 forward port [P] [Z] [O]
  --query-forward-port=port=<portid>[-<portid>]:proto=<protocol>[:toport=<portid>[-<portid>]][:toaddr=<address>[/<mask>]]
                       Return whether the IPv4 forward port has been added [P] [Z] [O]
  --add-masquerade     Enable IPv4 masquerade [P] [Z] [O] [T]
  --remove-masquerade  Disable IPv4 masquerade [P] [Z] [O]
  --query-masquerade   Return whether IPv4 masquerading has been enabled [P] [Z] [O]
  --list-rich-rules    List rich language rules added [P] [Z] [O]
  --add-rich-rule=<rule>
                       Add rich language rule 'rule' [P] [Z] [O] [T]
  --remove-rich-rule=<rule>
                       Remove rich language rule 'rule' [P] [Z] [O]
  --query-rich-rule=<rule>
                       Return whether a rich language rule 'rule' has been
                       added [P] [Z] [O]

Options to Adapt and Query Zones
  --add-icmp-block-inversion
                       Enable inversion of icmp blocks for a zone [P] [Z]
  --remove-icmp-block-inversion
                       Disable inversion of icmp blocks for a zone [P] [Z]
  --query-icmp-block-inversion
                       Return whether inversion of icmp blocks has been enabled
                       for a zone [P] [Z]
  --add-forward        Enable forwarding of packets between interfaces and
                       sources in a zone [P] [Z] [T]
  --remove-forward     Disable forwarding of packets between interfaces and
                       sources in a zone [P] [Z]
  --query-forward      Return whether forwarding of packets between interfaces
                       and sources has been enabled for a zone [P] [Z]

Options to Adapt and Query Policies
  --get-priority       Get the priority [P only] [O]
  --set-priority=<priority>
                       Set the priority [P only] [O]
  --list-ingress-zones
                       List ingress zones that are bound to a policy [P] [O]
  --add-ingress-zone=<zone>
                       Add the ingress zone to a policy [P] [O]
  --remove-ingress-zone=<zone>
                       Remove the ingress zone from a policy [P] [O]
  --query-ingress-zone=<zone>
                       Query whether the ingress zone has been adedd to a
                       policy [P] [O]
  --list-egress-zones
                       List egress zones that are bound to a policy [P] [O]
  --add-egress-zone=<zone>
                       Add the egress zone to a policy [P] [O]
  --remove-egress-zone=<zone>
                       Remove the egress zone from a policy [P] [O]
  --query-egress-zone=<zone>
                       Query whether the egress zone has been adedd to a
                       policy [P] [O]

Options to Handle Bindings of Interfaces
  --list-interfaces    List interfaces that are bound to a zone [P] [Z]
  --add-interface=<interface>
                       Bind the <interface> to a zone [P] [Z]
  --change-interface=<interface>
                       Change zone the <interface> is bound to [P] [Z]
  --query-interface=<interface>
                       Query whether <interface> is bound to a zone [P] [Z]
  --remove-interface=<interface>
                       Remove binding of <interface> from a zone [P] [Z]

Options to Handle Bindings of Sources
  --list-sources       List sources that are bound to a zone [P] [Z]
  --add-source=<source>[/<mask>]|<MAC>|ipset:<ipset>
                       Bind the source to a zone [P] [Z]
  --change-source=<source>[/<mask>]|<MAC>|ipset:<ipset>
                       Change zone the source is bound to [Z]
  --query-source=<source>[/<mask>]|<MAC>|ipset:<ipset>
                       Query whether the source is bound to a zone [P] [Z]
  --remove-source=<source>[/<mask>]|<MAC>|ipset:<ipset>
                       Remove binding of the source from a zone [P] [Z]

Helper Options
  --new-helper=<helper> --module=<module> [--family=<family>]
                       Add a new helper [P only]
  --new-helper-from-file=<filename> [--name=<helper>]
                       Add a new helper from file with optional name [P only]
  --delete-helper=<helper>
                       Delete an existing helper [P only]
  --load-helper-defaults=<helper>
                       Load helper default settings [P only]
  --info-helper=<helper> Print information about an helper
  --path-helper=<helper> Print file path of an helper [P only]
  --get-helpers         Print predefined helpers
  --helper=<helper> --set-description=<description>
                       Set new description to helper [P only]
  --helper=<helper> --get-description
                       Print description for helper [P only]
  --helper=<helper> --set-short=<description>
                       Set new short description to helper [P only]
  --helper=<helper> --get-short
                       Print short description for helper [P only]
  --helper=<helper> --add-port=<portid>[-<portid>]/<protocol>
                       Add a new port to helper [P only]
  --helper=<helper> --remove-port=<portid>[-<portid>]/<protocol>
                       Remove a port from helper [P only]
  --helper=<helper> --query-port=<portid>[-<portid>]/<protocol>
                       Return whether the port has been added for helper [P only]
  --helper=<helper> --get-ports
                       List ports of helper [P only]
  --helper=<helper> --set-module=<module>
                       Set module to helper [P only]
  --helper=<helper> --get-module
                       Get module from helper [P only]
  --helper=<helper> --set-family={ipv4|ipv6|}
                       Set family for helper [P only]
  --helper=<helper> --get-family
                       Get module from helper [P only]

Direct Options
  --direct             First option for all direct options
  --get-all-chains
                       Get all chains [P]
  --get-chains {ipv4|ipv6|eb} <table>
                       Get all chains added to the table [P]
  --add-chain {ipv4|ipv6|eb} <table> <chain>
                       Add a new chain to the table [P]
  --remove-chain {ipv4|ipv6|eb} <table> <chain>
                       Remove the chain from the table [P]
  --query-chain {ipv4|ipv6|eb} <table> <chain>
                       Return whether the chain has been added to the table [P]
  --get-all-rules
                       Get all rules [P]
  --get-rules {ipv4|ipv6|eb} <table> <chain>
                       Get all rules added to chain in table [P]
  --add-rule {ipv4|ipv6|eb} <table> <chain> <priority> <arg>...
                       Add rule to chain in table [P]
  --remove-rule {ipv4|ipv6|eb} <table> <chain> <priority> <arg>...
                       Remove rule with priority from chain in table [P]
  --remove-rules {ipv4|ipv6|eb} <table> <chain>
                       Remove rules from chain in table [P]
  --query-rule {ipv4|ipv6|eb} <table> <chain> <priority> <arg>...
                       Return whether a rule with priority has been added to
                       chain in table [P]
  --passthrough {ipv4|ipv6|eb} <arg>...
                       Pass a command through (untracked by firewalld)
  --get-all-passthroughs
                       Get all tracked passthrough rules [P]
  --get-passthroughs {ipv4|ipv6|eb} <arg>...
                       Get tracked passthrough rules [P]
  --add-passthrough {ipv4|ipv6|eb} <arg>...
                       Add a new tracked passthrough rule [P]
  --remove-passthrough {ipv4|ipv6|eb} <arg>...
                       Remove a tracked passthrough rule [P]
  --query-passthrough {ipv4|ipv6|eb} <arg>...
                       Return whether the tracked passthrough rule has been
                       added [P]

Lockdown Options
  --lockdown-on        Enable lockdown.
  --lockdown-off       Disable lockdown.
  --query-lockdown     Query whether lockdown is enabled

Lockdown Whitelist Options
  --list-lockdown-whitelist-commands
                       List all command lines that are on the whitelist [P]
  --add-lockdown-whitelist-command=<command>
                       Add the command to the whitelist [P]
  --remove-lockdown-whitelist-command=<command>
                       Remove the command from the whitelist [P]
  --query-lockdown-whitelist-command=<command>
                       Query whether the command is on the whitelist [P]
  --list-lockdown-whitelist-contexts
                       List all contexts that are on the whitelist [P]
  --add-lockdown-whitelist-context=<context>
                       Add the context context to the whitelist [P]
  --remove-lockdown-whitelist-context=<context>
                       Remove the context from the whitelist [P]
  --query-lockdown-whitelist-context=<context>
                       Query whether the context is on the whitelist [P]
  --list-lockdown-whitelist-uids
                       List all user ids that are on the whitelist [P]
  --add-lockdown-whitelist-uid=<uid>
                       Add the user id uid to the whitelist [P]
  --remove-lockdown-whitelist-uid=<uid>
                       Remove the user id uid from the whitelist [P]
  --query-lockdown-whitelist-uid=<uid>
                       Query whether the user id uid is on the whitelist [P]
  --list-lockdown-whitelist-users
                       List all user names that are on the whitelist [P]
  --add-lockdown-whitelist-user=<user>
                       Add the user name user to the whitelist [P]
  --remove-lockdown-whitelist-user=<user>
                       Remove the user name user from the whitelist [P]
  --query-lockdown-whitelist-user=<user>
                       Query whether the user name user is on the whitelist [P]

Panic Options
  --panic-on           Enable panic mode
  --panic-off          Disable panic mode
  --query-panic        Query whether panic mode is enabled`,

    'ip': `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
       ip [ -force ] -batch filename
where  OBJECT := { address | addrlabel | amt | fou | help | ila | ioam | l2tp |
                   link | macsec | maddress | monitor | mptcp | mroute | mrule |
                   neighbor | neighbour | netconf | netns | nexthop | ntable |
                   ntbl | route | rule | sr | tap | tcpmetrics |
                   token | tunnel | tuntap | vrf | xfrm }
       OPTIONS := { -V[ersion] | -s[tatistics] | -d[etails] | -r[esolve] |
                    -h[uman-readable] | -iec | -j[son] | -p[retty] |
                    -f[amily] { inet | inet6 | mpls | bridge | link } |
                    -4 | -6 | -M | -B | -0 |
                    -l[oops] { maximum-addr-flush-attempts } | -br[ief] |
                    -o[neline] | -t[imestamp] | -ts[hort] | -b[atch] [filename] |
                    -rc[vbuf] [size] | -n[etns] name | -N[umeric] | -a[ll] |
                    -c[olor]}`,

    'hostnamectl': `hostnamectl [OPTIONS...] COMMAND ...

Query or change system hostname.

Commands:
  status                 Show current hostname settings
  hostname [NAME]        Get/set system hostname
  icon-name [NAME]       Get/set icon name for host
  chassis [NAME]         Get/set chassis type for host
  deployment [NAME]      Get/set deployment environment for host
  location [NAME]        Get/set location for host

Options:
  -h --help              Show this help
     --version           Show package version
     --no-ask-password   Do not prompt for password
  -H --host=[USER@]HOST  Operate on remote host
  -M --machine=CONTAINER Operate on local container
     --transient         Only set transient hostname
     --static            Only set static hostname
     --pretty            Only set pretty hostname
     --json=pretty|short|off
                         Generate JSON output

See the hostnamectl(1) man page for details.`,

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

    'dig': `Usage:  dig [@global-server] [domain] [q-type] [q-class] {q-opt}
            {global-d-opt} host [@local-server] {local-d-opt}
            [ host [@local-server] {local-d-opt} [...]]
Where:  domain    is in the Domain Name System
        q-class  is one of (in,hs,ch,...) [default: in]
        q-type   is one of (a,any,mx,ns,soa,hinfo,axfr,txt,...) [default:a]
                 (Use ixfr=version for type ixfr)
        q-opt    is one of:
                 -4                  (use IPv4 query transport only)
                 -6                  (use IPv6 query transport only)
                 -b address[#port]   (bind to source address/port)
                 -c class            (specify query class)
                 -f filename         (batch mode)
                 -k keyfile          (specify tsig key file)
                 -m                  (enable memory usage debugging)
                 -p port             (specify port number)
                 -q name             (specify query name)
                 -r                  (do not read ~/.digrc)
                 -t type             (specify query type)
                 -u                  (display times in usec instead of msec)
                 -x dot-notation     (shortcut for reverse lookups)
                 -y [hmac:]name:key  (specify named base64 tsig key)
        d-opt    is of the form +keyword[=value], where keyword is:
                 +[no]aaflag         (Set AA flag in query (+[no]aaflag))
                 +[no]aaonly         (Set AA flag in query (+[no]aaflag))
                 +[no]additional     (Control display of additional section)
                 +[no]adflag         (Set AD flag in query (default on))
                 +[no]all            (Set or clear all display flags)
                 +[no]answer         (Control display of answer section)
                 +[no]authority      (Control display of authority section)
                 +[no]badcookie      (Retry BADCOOKIE responses)
                 +[no]besteffort     (Try to parse even illegal messages)
                 +bufsize[=###]      (Set EDNS0 Max UDP packet size)
                 +[no]cdflag         (Set checking disabled flag in query)
                 +[no]class          (Control display of class in records)
                 +[no]cmd            (Control display of command line -
                                      global option)
                 +[no]comments       (Control display of packet header
                                      and section name comments)
                 +[no]cookie         (Add a COOKIE option to the request)
                 +[no]crypto         (Control display of cryptographic
                                      fields in records)
                 +[no]defname        (Use search list (+[no]search))
                 +[no]dnssec         (Request DNSSEC records)
                 +domain=###         (Set default domainname)
                 +[no]dscp[=###]     (Set the DSCP value to ### [0..63])
                 +[no]edns[=###]     (Set EDNS version) [0]
                 +ednsflags=###      (Set EDNS flag bits)
                 +[no]ednsnegotiation (Set EDNS version negotiation)
                 +ednsopt=###[:value] (Send specified EDNS option)
                 +noednsopt          (Clear list of +ednsopt options)
                 +[no]expandaaaa     (Expand AAAA records)
                 +[no]expire         (Request time to expire)
                 +[no]fail           (Don't try next server on SERVFAIL)
                 +[no]header-only    (Send query without a question section)
                 +[no]identify       (ID responders in short answers)
                 +[no]idnin          (Parse IDN names [default=on on tty])
                 +[no]idnout         (Convert IDN response [default=on on tty])
                 +[no]ignore         (Don't revert to TCP for TC responses.)
                 +[no]keepalive      (Request EDNS TCP keepalive)
                 +[no]keepopen       (Keep the TCP socket open between queries)
                 +[no]mapped         (Allow mapped IPv4 over IPv6)
                 +[no]multiline      (Print records in an expanded format)
                 +ndots=###          (Set search NDOTS value)
                 +[no]nsid           (Request Name Server ID)
                 +[no]nssearch       (Search all authoritative nameservers)
                 +[no]onesoa         (AXFR prints only one soa record)
                 +[no]opcode=###     (Set the opcode of the request)
                 +padding=###        (Set padding block size [0])
                 +[no]qr             (Print question before sending)
                 +[no]question       (Control display of question section)
                 +[no]raflag         (Set RA flag in query (+[no]raflag))
                 +[no]rdflag         (Recursive mode (+[no]recurse))
                 +[no]recurse        (Recursive mode (+[no]rdflag))
                 +retry=###          (Set number of UDP retries) [2]
                 +[no]rrcomments     (Control display of per-record comments)
                 +[no]search         (Set whether to use searchlist)
                 +[no]short          (Display nothing except short
                                      form of answers - global option)
                 +[no]showsearch     (Search with intermediate results)
                 +[no]split=##       (Split hex/base64 fields into chunks)
                 +[no]stats          (Control display of statistics)
                 +subnet=addr        (Set edns-client-subnet option)
                 +[no]tcflag         (Set TC flag in query (+[no]tcflag))
                 +[no]tcp            (TCP mode (+[no]vc))
                 +timeout=###        (Set query timeout) [5]
                 +[no]trace          (Trace delegation down from root [+dnssec])
                 +tries=###          (Set number of UDP attempts) [3]
                 +[no]ttlid          (Control display of ttls in records)
                 +[no]ttlunits       (Display TTLs in human-readable units)
                 +[no]unexpected     (Print replies from unexpected sources
                                      default=off)
                 +[no]unknownformat  (Print RDATA in RFC 3597 "unknown" format)
                 +[no]vc             (TCP mode (+[no]tcp))
                 +[no]yaml           (Present the results as YAML)
                 +[no]zflag          (Set Z flag in query)
        global d-opts and servers (before host name) affect all queries.
        local d-opts and servers (after host name) affect only that lookup.
        -h                           (print help and exit)
        -v                           (print version and exit)`,

    'host': `Usage: host [-aCdilrTvVw] [-c class] [-N ndots] [-t type] [-W time]
            [-R number] [-m flag] [-p port] hostname [server]
       -a is equivalent to -v -t ANY
       -A is like -a but omits RRSIG, NSEC, NSEC3
       -c specifies query class for non-IN data
       -C compares SOA records on authoritative nameservers
       -d is equivalent to -v
       -l lists all hosts in a domain, using AXFR
       -m set memory debugging flag (trace|record|usage)
       -N changes the number of dots allowed before root lookup is done
       -p specifies the port on the server to query
       -r disables recursive processing
       -R specifies number of retries for UDP packets
       -s a SERVFAIL response should stop query
       -t specifies the query type
       -T enables TCP/IP mode
       -U enables UDP mode
       -v enables verbose output
       -V print version number and exit
       -w specifies to wait forever for a reply
       -W specifies how long to wait for a reply
       -4 use IPv4 query transport only
       -6 use IPv6 query transport only`,

    'podman': `Manage pods, containers and images

Usage:
  podman [options] [command]

Available Commands:
  artifact    Manage OCI artifacts
  attach      Attach to a running container
  auto-update Auto update containers according to their auto-update policy
  build       Build an image using instructions from Containerfiles
  commit      Create new image based on the changed container
  compose     Run compose workloads via an external provider such as docker-compose or podman-compose
  container   Manage containers
  cp          Copy files/folders between a container and the local filesystem
  create      Create but do not start a container
  diff        Display the changes to the object's file system
  events      Show podman system events
  exec        Run a process in a running container
  export      Export container's filesystem contents as a tar archive
  farm        Farm out builds to remote machines
  generate    Generate structured data based on containers, pods or volumes
  healthcheck Manage health checks on containers
  help        Help about any command
  history     Show history of a specified image
  image       Manage images
  images      List images in local storage
  import      Import a tarball to create a filesystem image
  info        Display podman system information
  init        Initialize one or more containers
  inspect     Display the configuration of object denoted by ID
  kill        Kill one or more running containers with a specific signal
  kube        Play containers, pods or volumes from a structured file
  load        Load image(s) from a tar archive
  login       Log in to a container registry
  logout      Log out of a container registry
  logs        Fetch the logs of one or more containers
  machine     Manage a virtual machine
  manifest    Manipulate manifest lists and image indexes
  mount       Mount a working container's root filesystem
  network     Manage networks
  pause       Pause all the processes in one or more containers
  pod         Manage pods
  port        List port mappings or a specific mapping for the container
  ps          List containers
  pull        Pull an image from a registry
  push        Push an image to a specified destination
  quadlet     Allows users to manage Quadlets
  rename      Rename an existing container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images from local storage
  run         Run a command in a new container
  save        Save image(s) to an archive
  search      Search registry for image
  secret      Manage secrets
  start       Start one or more containers
  stats       Display a live stream of container resource usage statistics
  stop        Stop one or more containers
  system      Manage podman
  tag         Add an additional name to a local image
  top         Display the running processes of a container
  unmount     Unmount working container's root filesystem
  unpause     Unpause the processes in one or more containers
  unshare     Run a command in a modified user namespace
  untag       Remove a name from a local image
  update      Update an existing container
  version     Display the Podman version information
  volume      Manage volumes
  wait        Block on one or more containers

Options:
      --cdi-spec-dir stringArray    Set the CDI spec directory path (may be set multiple times) (default [/etc/cdi,/var/run/cdi])
      --cgroup-manager string       Cgroup manager to use ("cgroupfs"|"systemd") (default "systemd")
      --config string               Path to directory containing authentication config file
      --conmon string               Path of the conmon binary
  -c, --connection string           Connection to use for remote Podman service (CONTAINER_CONNECTION)
      --events-backend string       Events backend to use ("file"|"journald"|"none") (default "journald")
      --help                        Help for podman
      --hooks-dir stringArray       Set the OCI hooks directory path (may be set multiple times) (default [/usr/share/containers/oci/hooks.d])
      --identity string             path to SSH identity file, (CONTAINER_SSHKEY)
      --imagestore string           Path to the 'image store', different from 'graph root', use this to split storing the image into a separate 'image store', see 'man containers-storage.conf' for details
      --log-level string            Log messages above specified level (trace, debug, info, warn, warning, error, fatal, panic) (default "warn")
      --module stringArray          Load the containers.conf(5) module
      --network-cmd-path string     Path to the command for configuring the network
      --network-config-dir string   Path of the configuration directory for networks
      --out string                  Send output (stdout) from podman to a file
  -r, --remote                      Access remote Podman service
      --root string                 Path to the graph root directory where images, containers, etc. are stored
      --runroot string              Path to the 'run directory' where all state information is stored
      --runtime string              Path to the OCI-compatible binary used to run containers. (default "crun")
      --runtime-flag stringArray    add global flags for the container runtime
      --ssh string                  define the ssh mode (default "golang")
      --storage-driver string       Select which storage driver is used to manage storage of images and containers
      --storage-opt stringArray     Used to pass an option to the storage driver
      --syslog                      Output podman-internal logs to syslog as well as the console (default false)
      --tmpdir string               Path to the tmp directory for libpod state content.

                                    Note: use the environment variable 'TMPDIR' to change the temporary storage location for container images, '/var/tmp'.
                                     (default "/run/libpod")
      --transient-store             Enable transient container storage
      --url string                  URL to access Podman service (CONTAINER_HOST) (default "unix:///run/podman/podman.sock")
  -v, --version                     version for podman
      --volumepath string           Path to the volume directory in which volume data is stored`,

    'showmount': `Usage: showmount [-adehv]
       [--all] [--directories] [--exports]
       [--no-headers] [--help] [--version] [host]`,

    'nfsstat': `Usage: nfsstat [OPTION]...

  -m, --mounts          Show statistics on mounted NFS filesystems
  -c, --client          Show NFS client statistics
  -s, --server          Show NFS server statistics
  -2                    Show NFS version 2 statistics
  -3                    Show NFS version 3 statistics
  -4                    Show NFS version 4 statistics
  -o [facility]         Show statistics on particular facilities.
     nfs                NFS protocol information
     rpc                General RPC information
     net                Network layer statistics
     fh                 Usage information on the server's file handle cache
     io                 Usage information on the server's io statistics
     ra                 Usage information on the server's read ahead cache
     rc                 Usage information on the server's request reply cache
     all                Select all of the above
  -v, --verbose, --all  Same as '-o all'
  -r, --rpc             Show RPC statistics
  -n, --nfs             Show NFS statistics
  -Z[#], --sleep[=#]    Collects stats until interrupted.
                            Cumulative stats are then printed
                            If # is provided, stats will be output every
                            # seconds.
  -S, --since file      Shows difference between current stats and those in 'file'
  -l, --list            Prints stats in list format
  --version             Show program version
  --help                What you just did`,

    'chronyc': `Usage: chronyc [OPTION]... [COMMAND]...

Options:
  -4            Use IPv4 addresses only
  -6            Use IPv6 addresses only
  -n            Don't resolve hostnames
  -N            Print original source names
  -c            Enable CSV format
  -e            End responses with dot
  -d            Enable debug messages
  -m            Accept multiple commands
  -h HOST       Specify server (/run/chrony/chronyd.sock,127.0.0.1,::1)
  -p PORT       Specify UDP port (323)
  -v, --version Print version and exit
      --help    Print usage and exit`,

    'timedatectl': `timedatectl [OPTIONS...] COMMAND ...

Query or change system time and date settings.

Commands:
  status                   Show current time settings
  show                     Show properties of systemd-timedated
  set-time TIME            Set system time
  set-timezone ZONE        Set system time zone
  list-timezones           Show known time zones
  set-local-rtc BOOL       Control whether RTC is in local time
  set-ntp BOOL             Enable or disable network time synchronization

systemd-timesyncd Commands:
  timesync-status          Show status of systemd-timesyncd
  show-timesync            Show properties of systemd-timesyncd

Options:
  -h --help                Show this help message
     --version             Show package version
     --no-pager            Do not pipe output into a pager
     --no-ask-password     Do not prompt for password
  -H --host=[USER@]HOST    Operate on remote host
  -M --machine=CONTAINER   Operate on local container
     --adjust-system-clock Adjust system clock when changing local RTC mode
     --monitor             Monitor status of systemd-timesyncd
  -p --property=NAME       Show only properties by this name
  -a --all                 Show all properties, including empty ones
     --value               When showing properties, only print the value

See the timedatectl(1) man page for details.`,

    'date': `Usage: date [OPTION]... [+FORMAT]
  or:  date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]
Display the current time in the given FORMAT, or set the system date.

Mandatory arguments to long options are mandatory for short options too.
  -d, --date=STRING          display time described by STRING, not 'now'
      --debug                annotate the parsed date,
                              and warn about questionable usage to stderr
  -f, --file=DATEFILE        like --date; once for each line of DATEFILE
  -I[FMT], --iso-8601[=FMT]  output date/time in ISO 8601 format.
                               FMT='date' for date only (the default),
                               'hours', 'minutes', 'seconds', or 'ns'
                               for date and time to the indicated precision.
                               Example: 2006-08-14T02:34:56-06:00
  -R, --rfc-email            output date and time in RFC 5322 format.
                               Example: Mon, 14 Aug 2006 02:34:56 -0600
      --rfc-3339=FMT         output date/time in RFC 3339 format.
                               FMT='date', 'seconds', or 'ns'
                               for date and time to the indicated precision.
                               Example: 2006-08-14 02:34:56-06:00
  -r, --reference=FILE       display the last modification time of FILE
  -s, --set=STRING           set time described by STRING
  -u, --utc, --universal     print or set Coordinated Universal Time (UTC)
      --help     display this help and exit
      --version  output version information and exit

FORMAT controls the output.  Interpreted sequences are:

  %%   a literal %
  %a   locale's abbreviated weekday name (e.g., Sun)
  %A   locale's full weekday name (e.g., Sunday)
  %b   locale's abbreviated month name (e.g., Jan)
  %B   locale's full month name (e.g., January)
  %c   locale's date and time (e.g., Thu Mar  3 23:05:25 2005)
  %C   century; like %Y, except omit last two digits (e.g., 20)
  %d   day of month (e.g., 01)
  %D   date; same as %m/%d/%y
  %e   day of month, space padded; same as %_d
  %F   full date; like %+4Y-%m-%d
  %g   last two digits of year of ISO week number (see %G)
  %G   year of ISO week number (see %V); normally useful only with %V
  %h   same as %b
  %H   hour (00..23)
  %I   hour (01..12)
  %j   day of year (001..366)
  %k   hour, space padded ( 0..23); same as %_H
  %l   hour, space padded ( 1..12); same as %_I
  %m   month (01..12)
  %M   minute (00..59)
  %n   a newline
  %N   nanoseconds (000000000..999999999)
  %p   locale's equivalent of either AM or PM; blank if not known
  %P   like %p, but lower case
  %q   quarter of year (1..4)
  %r   locale's 12-hour clock time (e.g., 11:11:04 PM)
  %R   24-hour hour and minute; same as %H:%M
  %s   seconds since 1970-01-01 00:00:00 UTC
  %S   second (00..60)
  %t   a tab
  %T   time; same as %H:%M:%S
  %u   day of week (1..7); 1 is Monday
  %U   week number of year, with Sunday as first day of week (00..53)
  %V   ISO week number, with Monday as first day of week (01..53)
  %w   day of week (0..6); 0 is Sunday
  %W   week number of year, with Monday as first day of week (00..53)
  %x   locale's date representation (e.g., 12/31/99)
  %X   locale's time representation (e.g., 23:13:48)
  %y   last two digits of year (00..99)
  %Y   year
  %z   +hhmm numeric time zone (e.g., -0400)
  %:z  +hh:mm numeric time zone (e.g., -04:00)
  %::z  +hh:mm:ss numeric time zone (e.g., -04:00:00)
  %:::z  numeric time zone with : to necessary precision (e.g., -04, +05:30)
  %Z   alphabetic time zone abbreviation (e.g., EDT)

By default, date pads numeric fields with zeroes.
The following optional flags may follow '%':

  -  (hyphen) do not pad the field
  _  (underscore) pad with spaces
  0  (zero) pad with zeros
  +  pad with zeros, and put '+' before future years with >4 digits
  ^  use upper case if possible
  #  use opposite case if possible

After any flags comes an optional field width, as a decimal number;
then an optional modifier, which is either
E to use the locale's alternate representations if available, or
O to use the locale's alternate numeric symbols if available.

Examples:
Convert seconds since the epoch (1970-01-01 UTC) to a date
  $ date --date='@2147483647'

Show the time on the west coast of the US (use tzselect(1) to find TZ)
  $ TZ='America/Los_Angeles' date

Show the local time for 9AM next Friday on the west coast of the US
  $ date --date='TZ="America/Los_Angeles" 09:00 next Fri'

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/date>
or available locally via: info '(coreutils) date invocation'`,

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

    'sestatus': `Usage: sestatus [OPTION]

  -v  Verbose check of process and file contexts.
  -b  Display current state of booleans.

Without options, show SELinux status.`,

    'setenforce': `Usage: setenforce [Enforcing|Permissive|1|0]`,

    'semanage': `usage: semanage [-h] {import,export,login,user,port,ibpkey,ibendport,interface,module,node,fcontext,boolean,permissive,dontaudit} ...

semanage is used to configure certain elements of SELinux policy with-out requiring modification or recompilation from policy source.

positional arguments:
  {import,export,login,user,port,ibpkey,ibendport,interface,module,node,fcontext,boolean,permissive,dontaudit}
    import              Import local customizations
    export              Output local customizations
    login               Manage login mappings between linux users and SELinux confined users
    user                Manage SELinux confined users (Roles and levels for an SELinux user)
    port                Manage network port type definitions
    ibpkey              Manage infiniband ibpkey type definitions
    ibendport           Manage infiniband end port type definitions
    interface           Manage network interface type definitions
    module              Manage SELinux policy modules
    node                Manage network node type definitions
    fcontext            Manage file context mapping definitions
    boolean             Manage booleans to selectively enable functionality
    permissive          Manage process type enforcement mode
    dontaudit           Disable/Enable dontaudit rules in policy

optional arguments:
  -h, --help            show this help message and exit`,

    'chcon': `Usage: chcon [OPTION]... CONTEXT FILE...
  or:  chcon [OPTION]... [-u USER] [-r ROLE] [-l RANGE] [-t TYPE] FILE...
  or:  chcon [OPTION]... --reference=RFILE FILE...
Change the SELinux security context of each FILE to CONTEXT.
With --reference, change the security context of each FILE to that of RFILE.

Mandatory arguments to long options are mandatory for short options too.
      --dereference      affect the referent of each symbolic link (this is
                         the default), rather than the symbolic link itself
  -h, --no-dereference   affect symbolic links instead of any referenced file
  -u, --user=USER        set user USER in the target security context
  -r, --role=ROLE        set role ROLE in the target security context
  -t, --type=TYPE        set type TYPE in the target security context
  -l, --range=RANGE      set range RANGE in the target security context
      --no-preserve-root  do not treat '/' specially (the default)
      --preserve-root    fail to operate recursively on '/'
      --reference=RFILE  use RFILE's security context rather than specifying
                         a CONTEXT value
  -R, --recursive        operate on files and directories recursively
  -v, --verbose          output a diagnostic for every file processed

The following options modify how a hierarchy is traversed when the -R
option is also specified.  If more than one is specified, only the final
one takes effect.

  -H                     if a command line argument is a symbolic link
                         to a directory, traverse it
  -L                     traverse every symbolic link to a directory
                         encountered
  -P                     do not traverse any symbolic links (default)

      --help     display this help and exit
      --version  output version information and exit

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/chcon>
or available locally via: info '(coreutils) chcon invocation'`,

    'restorecon': `usage:  restorecon [-iIDFmnprRv0xT] [-e excludedir] pathname...
usage:  restorecon [-iIDFmnprRv0xT] [-e excludedir] -f filename`,

    'getsebool': `usage:  getsebool -a or getsebool boolean...`,

    'setsebool': `Usage:  setsebool [ -NPV ] boolean value | bool1=val1 bool2=val2...`,

    'crontab': `Usage:
 crontab [options] file
 crontab [options]
 crontab -n [hostname]

Options:
 -u <user>  define user
 -e         edit user's crontab
 -l         list user's crontab
 -r         delete user's crontab
 -i         prompt before deleting
 -n <host>  set host in cluster to run users' crontabs
 -c         get host in cluster to run users' crontabs
 -T <file>  test a crontab file syntax
 -s         selinux context
 -V         print version and exit
 -x <mask>  enable debugging

Default operation is replace, per 1003.2`,

    'grub2-mkconfig': `Usage: grub2-mkconfig [OPTION]
Generate a grub config file

  -o, --output=FILE       output generated config to FILE [default=stdout]
  --no-grubenv-update     do not update variables in the grubenv file
  --update-bls-cmdline    overwrite BLS cmdline args with default args
  -h, --help              print this message and exit
  -V, --version           print the version information and exit

Report bugs to <bug-grub@gnu.org>.`,

    'grubby': `Usage: grubby [OPTION...]
      --add-kernel=kernel-path            add an entry for the specified kernel
      --args=args                         default arguments for the new kernel or new arguments for kernel being updated)
      --bad-image-okay                    don't sanity check images in boot entries (for testing only)
  -c, --config-file=path                  path to grub config file to update ("-" for stdin)
      --copy-default                      use the default boot entry as a template for the new entry being added; if the default is not a linux image, or if the kernel referenced by the default image does not exist, the
                                          first linux entry whose kernel does exist is used as the template
      --default-kernel                    display the path of the default kernel
      --default-index                     display the index of the default kernel
      --default-title                     display the title of the default kernel
      --env=path                          path for environment data
      --grub2                             configure grub2 bootloader
      --info=kernel-path                  display boot information for specified kernel
      --initrd=initrd-path                initrd image for the new kernel
  -i, --extra-initrd=initrd-path          auxiliary initrd image for things other than the new kernel
      --make-default                      make the newly added entry the default boot entry
      --remove-args=STRING                remove kernel arguments
      --remove-kernel=kernel-path         remove all entries for the specified kernel
      --set-default=kernel-path           make the first entry referencing the specified kernel the default
      --set-default-index=entry-index     make the given entry index the default entry
      --title=entry-title                 title to use for the new kernel entry
      --update-kernel=kernel-path         updated information for the specified kernel
      --zipl                              configure zipl bootloader
  -b, --bls-directory                     path to directory containing the BootLoaderSpec fragment files
      --no-etc-grub-update                don't update the GRUB_CMDLINE_LINUX variable in /etc/default/grub

Help options:
  -h, --help                              Show this help message`,

    'systemd-analyze': `systemd-analyze [OPTIONS...] COMMAND ...

Profile systemd, show unit dependencies, check unit files.

Commands:
  [time]                     Print time required to boot the machine
  blame                      Print list of running units ordered by
                             time to init
  critical-chain [UNIT...]   Print a tree of the time critical chain
                             of units
  plot                       Output SVG graphic showing service
                             initialization
  dot [UNIT...]              Output dependency graph in dot(1) format
  dump [PATTERN...]          Output state serialization of service
                             manager
  cat-config                 Show configuration file and drop-ins
  unit-files                 List files and symlinks for units
  unit-paths                 List load directories for units
  exit-status [STATUS...]    List exit status definitions
  capability [CAP...]        List capability definitions
  syscall-filter [NAME...]   List syscalls in seccomp filters
  filesystems [NAME...]      List known filesystems
  condition CONDITION...     Evaluate conditions and asserts
  compare-versions VERSION1 [OP] VERSION2
                             Compare two version strings
  verify FILE...             Check unit files for correctness
  calendar SPEC...           Validate repetitive calendar time
                             events
  timestamp TIMESTAMP...     Validate a timestamp
  timespan SPAN...           Validate a time span
  security [UNIT...]         Analyze security of unit
  inspect-elf FILE...        Parse and print ELF package metadata

Options:
     --recursive-errors=MODE Control which units are verified
     --offline=BOOL          Perform a security review on unit file(s)
     --threshold=N           Exit with a non-zero status when overall
                             exposure level is over threshold value
     --security-policy=PATH  Use custom JSON security policy instead
                             of built-in one
     --json=pretty|short|off Generate JSON output of the security
                             analysis table, or plot's raw time data
     --no-pager              Do not pipe output into a pager
     --no-legend             Disable column headers and hints in plot
                             with either --table or --json=
     --system                Operate on system systemd instance
     --user                  Operate on user systemd instance
     --global                Operate on global user configuration
  -H --host=[USER@]HOST      Operate on remote host
  -M --machine=CONTAINER     Operate on local container
     --order                 Show only order in the graph
     --require               Show only requirement in the graph
     --from-pattern=GLOB     Show only origins in the graph
     --to-pattern=GLOB       Show only destinations in the graph
     --fuzz=SECONDS          Also print services which finished SECONDS
                             earlier than the latest in the branch
     --man[=BOOL]            Do [not] check for existence of man pages
     --generators[=BOOL]     Do [not] run unit generators
                             (requires privileges)
     --iterations=N          Show the specified number of iterations
     --base-time=TIMESTAMP   Calculate calendar times relative to
                             specified time
     --profile=name|PATH     Include the specified profile in the
                             security review of the unit(s)
     --table                 Output plot's raw time data as a table
  -h --help                  Show this help
     --version               Show package version
  -q --quiet                 Do not emit hints
     --root=PATH             Operate on an alternate filesystem root
     --image=PATH            Operate on disk image as filesystem root

See the systemd-analyze(1) man page for details.`,

    'getent': `Usage: getent [OPTION...] database [key ...]
Get entries from administrative database.

  -A, --no-addrconfig        do not filter out unsupported IPv4/IPv6 addresses
                             (with ahosts*)
  -i, --no-idn               disable IDN encoding
  -s, --service=CONFIG       Service configuration to be used
  -?, --help                 Give this help list
      --usage                Give a short usage message
  -V, --version              Print program version

Mandatory or optional arguments to long options are also mandatory or optional
for any corresponding short options.

Supported databases:
ahosts ahostsv4 ahostsv6 aliases ethers group gshadow hosts initgroups
netgroup networks passwd protocols rpc services shadow

For bug reporting instructions, please see:
<https://www.gnu.org/software/libc/bugs.html>.`,

    'stat': `Usage: stat [OPTION]... FILE...
Display file or file system status.

Mandatory arguments to long options are mandatory for short options too.
  -L, --dereference     follow links
  -f, --file-system     display file system status instead of file status
      --cached=MODE     specify how to use cached attributes;
                          useful on remote file systems. See MODE below
  -c  --format=FORMAT   use the specified FORMAT instead of the default;
                          output a newline after each use of FORMAT
      --printf=FORMAT   like --format, but interpret backslash escapes,
                          and do not output a mandatory trailing newline;
                          if you want a newline, include \n in FORMAT
  -t, --terse           print the information in terse form
      --help     display this help and exit
      --version  output version information and exit

The --cached MODE argument can be; always, never, or default.
\`always\` will use cached attributes if available, while
\`never\` will try to synchronize with the latest attributes, and
\`default\` will leave it up to the underlying file system.

The valid format sequences for files (without --file-system):

  %a   permission bits in octal (note '#' and '0' printf flags)
  %A   permission bits and file type in human readable form
  %b   number of blocks allocated (see %B)
  %B   the size in bytes of each block reported by %b
  %C   SELinux security context string
  %d   device number in decimal
  %D   device number in hex
  %f   raw mode in hex
  %F   file type
  %g   group ID of owner
  %G   group name of owner
  %h   number of hard links
  %i   inode number
  %m   mount point
  %n   file name
  %N   quoted file name with dereference if symbolic link
  %o   optimal I/O transfer size hint
  %s   total size, in bytes
  %t   major device type in hex, for character/block device special files
  %T   minor device type in hex, for character/block device special files
  %u   user ID of owner
  %U   user name of owner
  %w   time of file birth, human-readable; - if unknown
  %W   time of file birth, seconds since Epoch; 0 if unknown
  %x   time of last access, human-readable
  %X   time of last access, seconds since Epoch
  %y   time of last data modification, human-readable
  %Y   time of last data modification, seconds since Epoch
  %z   time of last status change, human-readable
  %Z   time of last status change, seconds since Epoch

Valid format sequences for file systems:

  %a   free blocks available to non-superuser
  %b   total data blocks in file system
  %c   total file nodes in file system
  %d   free file nodes in file system
  %f   free blocks in file system
  %i   file system ID in hex
  %l   maximum length of filenames
  %n   file name
  %s   block size (for faster transfers)
  %S   fundamental block size (for block counts)
  %t   file system type in hex
  %T   file system type in human readable form

--terse is equivalent to the following FORMAT:
    %n %s %b %f %u %g %D %i %h %t %T %X %Y %Z %W %o %C
--terse --file-system is equivalent to the following FORMAT:
    %n %i %l %t %s %S %b %f %a %c %d

NOTE: your shell may have its own version of stat, which usually supersedes
the version described here.  Please refer to your shell's documentation
for details about the options it supports.

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/stat>
or available locally via: info '(coreutils) stat invocation'`,

    'cat': `Usage: cat [OPTION]... [FILE]...
Concatenate FILE(s) to standard output.

With no FILE, or when FILE is -, read standard input.

  -A, --show-all           equivalent to -vET
  -b, --number-nonblank    number nonempty output lines, overrides -n
  -e                       equivalent to -vE
  -E, --show-ends          display $ at end of each line
  -n, --number             number all output lines
  -s, --squeeze-blank      suppress repeated empty output lines
  -t                       equivalent to -vT
  -T, --show-tabs          display TAB characters as ^I
  -u                       (ignored)
  -v, --show-nonprinting   use ^ and M- notation, except for LFD and TAB
      --help     display this help and exit
      --version  output version information and exit

Examples:
  cat f - g  Output f's contents, then standard input, then g's contents.
  cat        Copy standard input to standard output.

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/cat>
or available locally via: info '(coreutils) cat invocation'`,

    'grep': `Usage: grep [OPTION]... PATTERNS [FILE]...
Search for PATTERNS in each FILE.
Example: grep -i 'hello world' menu.h main.c
PATTERNS can contain multiple patterns separated by newlines.

Pattern selection and interpretation:
  -E, --extended-regexp     PATTERNS are extended regular expressions
  -F, --fixed-strings       PATTERNS are strings
  -G, --basic-regexp        PATTERNS are basic regular expressions
  -P, --perl-regexp         PATTERNS are Perl regular expressions
  -e, --regexp=PATTERNS     use PATTERNS for matching
  -f, --file=FILE           take PATTERNS from FILE
  -i, --ignore-case         ignore case distinctions in patterns and data
      --no-ignore-case      do not ignore case distinctions (default)
  -w, --word-regexp         match only whole words
  -x, --line-regexp         match only whole lines
  -z, --null-data           a data line ends in 0 byte, not newline

Miscellaneous:
  -s, --no-messages         suppress error messages
  -v, --invert-match        select non-matching lines
  -V, --version             display version information and exit
      --help                display this help text and exit

Output control:
  -m, --max-count=NUM       stop after NUM selected lines
  -b, --byte-offset         print the byte offset with output lines
  -n, --line-number         print line number with output lines
      --line-buffered       flush output on every line
  -H, --with-filename       print file name with output lines
  -h, --no-filename         suppress the file name prefix on output
      --label=LABEL         use LABEL as the standard input file name prefix
  -o, --only-matching       show only nonempty parts of lines that match
  -q, --quiet, --silent     suppress all normal output
      --binary-files=TYPE   assume that binary files are TYPE;
                            TYPE is 'binary', 'text', or 'without-match'
  -a, --text                equivalent to --binary-files=text
  -I                        equivalent to --binary-files=without-match
  -d, --directories=ACTION  how to handle directories;
                            ACTION is 'read', 'recurse', or 'skip'
  -D, --devices=ACTION      how to handle devices, FIFOs and sockets;
                            ACTION is 'read' or 'skip'
  -r, --recursive           like --directories=recurse
  -R, --dereference-recursive
                            likewise, but follow all symlinks
      --include=GLOB        search only files that match GLOB (a file pattern)
      --exclude=GLOB        skip files that match GLOB
      --exclude-from=FILE   skip files that match any file pattern from FILE
      --exclude-dir=GLOB    skip directories that match GLOB
  -L, --files-without-match print only names of FILEs with no selected lines
  -l, --files-with-matches  print only names of FILEs with selected lines
  -c, --count               print only a count of selected lines per FILE
  -T, --initial-tab         make tabs line up (if needed)
  -Z, --null                print 0 byte after FILE name

Context control:
  -B, --before-context=NUM  print NUM lines of leading context
  -A, --after-context=NUM   print NUM lines of trailing context
  -C, --context=NUM         print NUM lines of output context
  -NUM                      same as --context=NUM
      --group-separator=SEP use SEP as a group separator
      --no-group-separator  use empty string as a group separator
      --color[=WHEN],
      --colour[=WHEN]       use markers to highlight the matching strings;
                            WHEN is 'always', 'never', or 'auto'
  -U, --binary              do not strip CR characters at EOL (MSDOS/Windows)

When FILE is '-', read standard input.  With no FILE, read '.' if
recursive, '-' otherwise.  With fewer than two FILEs, assume -h.
Exit status is 0 if any line is selected, 1 otherwise;
if any error occurs and -q is not given, the exit status is 2.

Report bugs to: bug-grep@gnu.org
GNU grep home page: <http://www.gnu.org/software/grep/>
General help using GNU software: <https://www.gnu.org/gethelp/>`,

    'df': {
        helpFlags: ['--help'],  // -h means human-readable, not help
        text: `Usage: df [OPTION]... [FILE]...
Show information about the file system on which each FILE resides,
or all file systems by default.

Mandatory arguments to long options are mandatory for short options too.
  -a, --all             include pseudo, duplicate, inaccessible file systems
  -B, --block-size=SIZE  scale sizes by SIZE before printing them; e.g.,
                           '-BM' prints sizes in units of 1,048,576 bytes;
                           see SIZE format below
      --direct          show statistics for a file instead of mount point
  -h, --human-readable  print sizes in powers of 1024 (e.g., 1023M)
  -H, --si              print sizes in powers of 1000 (e.g., 1.1G)
  -i, --inodes          list inode information instead of block usage
  -k                    like --block-size=1K
  -l, --local           limit listing to local file systems
      --no-sync         do not invoke sync before getting usage info (default)
      --output[=FIELD_LIST]  use the output format defined by FIELD_LIST,
                               or print all fields if FIELD_LIST is omitted.
  -P, --portability     use the POSIX output format
      --sync            invoke sync before getting usage info
      --total           elide all entries insignificant to available space,
                          and produce a grand total
  -t, --type=TYPE       limit listing to file systems of type TYPE
  -T, --print-type      print file system type
  -x, --exclude-type=TYPE   limit listing to file systems not of type TYPE
  -v                    (ignored)
      --help     display this help and exit
      --version  output version information and exit

Display values are in units of the first available SIZE from --block-size,
and the DF_BLOCK_SIZE, BLOCK_SIZE and BLOCKSIZE environment variables.
Otherwise, units default to 1024 bytes (or 512 if POSIXLY_CORRECT is set).

The SIZE argument is an integer and optional unit (example: 10K is 10*1024).
Units are K,M,G,T,P,E,Z,Y (powers of 1024) or KB,MB,... (powers of 1000).
Binary prefixes can be used, too: KiB=K, MiB=M, and so on.

FIELD_LIST is a comma-separated list of columns to be included.  Valid
field names are: 'source', 'fstype', 'itotal', 'iused', 'iavail', 'ipcent',
'size', 'used', 'avail', 'pcent', 'file' and 'target' (see info page).

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/df>
or available locally via: info '(coreutils) df invocation'`
    },

    'ss': `Usage: ss [ OPTIONS ]
       ss [ OPTIONS ] [ FILTER ]
   -h, --help          this message
   -V, --version       output version information
   -n, --numeric       don't resolve service names
   -r, --resolve       resolve host names
   -a, --all           display all sockets
   -l, --listening     display listening sockets
   -B, --bound-inactive display TCP bound but inactive sockets
   -o, --options       show timer information
   -e, --extended      show detailed socket information
   -m, --memory        show socket memory usage
   -p, --processes     show process using socket
   -T, --threads       show thread using socket
   -i, --info          show internal TCP information
       --tipcinfo      show internal tipc socket information
   -s, --summary       show socket usage summary
       --tos           show tos and priority information
       --cgroup        show cgroup information
   -b, --bpf           show bpf filter socket information
   -E, --events        continually display sockets as they are destroyed
   -Z, --context       display task SELinux security contexts
   -z, --contexts      display task and socket SELinux security contexts
   -N, --net           switch to the specified network namespace name

   -4, --ipv4          display only IP version 4 sockets
   -6, --ipv6          display only IP version 6 sockets
   -0, --packet        display PACKET sockets
   -t, --tcp           display only TCP sockets
   -M, --mptcp         display only MPTCP sockets
   -S, --sctp          display only SCTP sockets
   -u, --udp           display only UDP sockets
   -d, --dccp          display only DCCP sockets
   -w, --raw           display only RAW sockets
   -x, --unix          display only Unix domain sockets
       --tipc          display only TIPC sockets
       --vsock         display only vsock sockets
       --xdp           display only XDP sockets
   -f, --family=FAMILY display sockets of type FAMILY
       FAMILY := {inet|inet6|link|unix|netlink|vsock|tipc|xdp|help}

   -K, --kill          forcibly close sockets, display what was closed
   -H, --no-header     Suppress header line
   -O, --oneline       socket's data printed on a single line
       --inet-sockopt  show various inet socket options

   -A, --query=QUERY, --socket=QUERY
       QUERY := {all|inet|tcp|mptcp|udp|raw|unix|unix_dgram|unix_stream|unix_seqpacket|packet|packet_raw|packet_dgram|netlink|dccp|sctp|vsock_stream|vsock_dgram|tipc|xdp}[,QUERY]

   -D, --diag=FILE     Dump raw information about TCP sockets to FILE
   -F, --filter=FILE   read filter information from FILE
       FILTER := [ state STATE-FILTER ] [ EXPRESSION ]
       STATE-FILTER := {all|connected|synchronized|bucket|big|TCP-STATES}
         TCP-STATES := {established|syn-sent|syn-recv|fin-wait-{1,2}|time-wait|closed|close-wait|last-ack|listening|closing}
          connected := {established|syn-sent|syn-recv|fin-wait-{1,2}|time-wait|close-wait|last-ack|closing}
       synchronized := {established|syn-recv|fin-wait-{1,2}|time-wait|close-wait|last-ack|closing}
             bucket := {syn-recv|time-wait}
                big := {established|syn-sent|fin-wait-{1,2}|closed|close-wait|last-ack|listening|closing}`,

    'lvcreate': {
        helpFlags: ['-h', '--help'],
        longHelpText: `  lvcreate - Create a logical volume

  Create an LV that returns errors when used.
  lvcreate --type error -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ COMMON_OPTIONS ]

  Create an LV that returns zeros when read.
  lvcreate --type zero -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ COMMON_OPTIONS ]

  Create a linear LV.
  lvcreate --type linear -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a linear LV.
  lvcreate -L|--size Size[m|UNIT] VG
        [ --type linear ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a striped LV (also see lvcreate --stripes).
  lvcreate --type striped -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a striped LV.
  lvcreate -i|--stripes Number -L|--size Size[m|UNIT] VG
        [ --type striped ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a mirror LV (also see --type raid1).
  lvcreate --type mirror -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -m|--mirrors Number ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --mirrorlog core|disk ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid1 or mirror LV.
  lvcreate -m|--mirrors Number -L|--size Size[m|UNIT] VG
        [ --type raid1|mirror ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --mirrorlog core|disk ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid LV (a specific raid level must be used, e.g. raid1).
  lvcreate --type raid -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -m|--mirrors Number ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid10 LV.
  lvcreate -m|--mirrors Number -i|--stripes Number -L|--size Size[m|UNIT] VG
        [ --type raid10 ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a COW snapshot LV of an origin LV
  (also see --snapshot).
  lvcreate --type snapshot -L|--size Size[m|UNIT] LV
        [ -l|--extents Number[PERCENT] ]
        [ -s|--snapshot ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a COW snapshot LV of an origin LV.
  lvcreate -s|--snapshot -L|--size Size[m|UNIT] LV
        [ --type snapshot ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a sparse COW snapshot LV of a virtual origin LV
  (also see --snapshot).
  lvcreate --type snapshot -L|--size Size[m|UNIT] -V|--virtualsize Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -s|--snapshot ]
        [ -c|--chunksize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin pool.
  lvcreate --type thin-pool -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --thinpool LV_new ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin pool.
  lvcreate -T|--thin -L|--size Size[m|UNIT] VG
        [ --type thin-pool ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin pool named in --thinpool.
  lvcreate -L|--size Size[m|UNIT] --thinpool LV_new VG
        [ --type thin-pool ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a cache pool.
  lvcreate --type cache-pool -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a cache pool named by the --cachepool arg
  (variant, uses --cachepool in place of --name).
  lvcreate --type cache-pool -L|--size Size[m|UNIT] --cachepool LV_new VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV in a thin pool.
  lvcreate --type thin -V|--virtualsize Size[m|UNIT] --thinpool LV VG
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV in a thin pool named in the first arg
  (variant, also see --thinpool for naming pool).
  lvcreate --type thin -V|--virtualsize Size[m|UNIT] LV
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV in a thin pool.
  lvcreate -V|--virtualsize Size[m|UNIT] --thinpool LV VG
        [ --type thin ] (implied)
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV in the thin pool named in the first arg
  (also see --thinpool for naming pool.)
  lvcreate -V|--virtualsize Size[m|UNIT] LV
        [ --type thin ] (implied)
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an existing thin LV.
  lvcreate --type thin LV
        [ -T|--thin ]
        [ -s|--snapshot ]
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an existing thin LV.
  lvcreate -T|--thin LV
        [ --type thin ] (implied)
        [ -s|--snapshot ]
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an existing thin LV.
  lvcreate -s|--snapshot LV
        [ --type thin ] (implied)
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an external origin LV.
  lvcreate --type thin --thinpool LV LV
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an external origin LV.
  lvcreate -s|--snapshot --thinpool LV LV
        [ --type thin ] (implied)
        [ COMMON_OPTIONS ]

  Create a LV that returns VDO when used.
  lvcreate --type vdo -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -V|--virtualsize Size[m|UNIT] ]
        [    --vdo ]
        [    --vdopool LV_new ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a VDO LV with VDO pool.
  lvcreate --vdo -L|--size Size[m|UNIT] VG
        [ --type vdo ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -V|--virtualsize Size[m|UNIT] ]
        [    --vdopool LV_new ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a VDO LV with VDO pool.
  lvcreate --vdopool LV_new -L|--size Size[m|UNIT] VG
        [ --type vdo ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -V|--virtualsize Size[m|UNIT] ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV, first creating a thin pool for it,
  where the new thin pool is named by the --thinpool arg.
  lvcreate --type thin -V|--virtualsize Size[m|UNIT] -L|--size Size[m|UNIT] --thinpool LV_new VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV, first creating a thin pool for it,
  where the new thin pool is named by --thinpool.
  lvcreate -V|--virtualsize Size[m|UNIT] -L|--size Size[m|UNIT] --thinpool LV_new VG
        [ --type thin ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV, first creating a thin pool for it,
  where the new thin pool is named in the first arg,
  or the new thin pool name is generated when the first
  arg is a VG name.
  lvcreate --type thin -V|--virtualsize Size[m|UNIT] -L|--size Size[m|UNIT] VG|LV_new
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV, first creating a thin pool for it,
  where the new thin pool is named in the first arg,
  or the new thin pool name is generated when the first
  arg is a VG name.
  lvcreate -T|--thin -V|--virtualsize Size[m|UNIT] -L|--size Size[m|UNIT] VG|LV_new
        [ --type thin ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV, first creating a thin pool for it.
  Create a sparse snapshot of a virtual origin LV
  Chooses type thin or snapshot according to
  config setting sparse_segtype_default.
  lvcreate -L|--size Size[m|UNIT] -V|--virtualsize Size[m|UNIT] VG
        [ --type thin|snapshot ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -s|--snapshot ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachepool
  which converts the new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachepool LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachepool
  which converts the new LV to type cache.
  lvcreate -L|--size Size[m|UNIT] --cachepool LV VG
        [ --type cache ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachepool
  which converts the new LV to type cache.
  (variant, also use --cachepool).
  lvcreate --type cache -L|--size Size[m|UNIT] LV
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  When the LV arg is a cachepool, then create a new LV and
  attach the cachepool arg to it.
  (variant, use --type cache and --cachepool.)
  When the LV arg is not a cachepool, then create a new cachepool
  and attach it to the LV arg (alternative, use lvconvert.)
  lvcreate -H|--cache -L|--size Size[m|UNIT] LV
        [ --type cache ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachevol
  which converts the new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachevol LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach a cachevol created from
  the specified cache device, which converts the
  new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachedevice PV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachesize Size[m|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachevol
  which converts the new LV to type writecache.
  lvcreate --type writecache -L|--size Size[m|UNIT] --cachevol LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --cachesettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach a cachevol created from
  the specified cache device, which converts the
  new LV to type writecache.
  lvcreate --type writecache -L|--size Size[m|UNIT] --cachedevice PV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --cachesize Size[m|UNIT] ]
        [    --cachesettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Common options for command:
        [ -a|--activate y|n|ay ]
        [ -A|--autobackup y|n ]
        [ -C|--contiguous y|n ]
        [ -M|--persistent y|n ]
        [ -j|--major Number ]
        [ -k|--setactivationskip y|n ]
        [ -K|--ignoreactivationskip ]
        [ -n|--name String ]
        [ -p|--permission rw|r ]
        [ -r|--readahead auto|none|Number ]
        [ -W|--wipesignatures y|n ]
        [ -Z|--zero y|n ]
        [    --addtag Tag ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --setautoactivation y|n ]
        [    --ignoremonitoring ]
        [    --metadataprofile String ]
        [    --minor Number ]
        [    --monitor y|n ]
        [    --nosync ]
        [    --noudevsync ]
        [    --reportformat basic|json|json_std ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Special options for command:
        [ --extents Number[PERCENT] ]
        The --extents option can be used in place of --size.
        The number allows an optional percent suffix.

        [ --name String ]
        The --name option is not required but is typically used.
        When a name is not specified, a new LV name is generated
        with the "lvol" prefix and a unique numeric suffix.

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`,
        text: `  lvcreate - Create a logical volume

  Create a linear LV.
  lvcreate -L|--size Size[m|UNIT] VG
        [ --type linear ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a striped LV.
  lvcreate -i|--stripes Number -L|--size Size[m|UNIT] VG
        [ --type striped ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid1 or mirror LV.
  lvcreate -m|--mirrors Number -L|--size Size[m|UNIT] VG
        [ --type raid1|mirror ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --mirrorlog core|disk ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid LV (a specific raid level must be used, e.g. raid1).
  lvcreate --type raid -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -m|--mirrors Number ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a raid10 LV.
  lvcreate -m|--mirrors Number -i|--stripes Number -L|--size Size[m|UNIT] VG
        [ --type raid10 ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -R|--regionsize Size[m|UNIT] ]
        [    --minrecoveryrate Size[k|UNIT] ]
        [    --maxrecoveryrate Size[k|UNIT] ]
        [    --raidintegrity y|n ]
        [    --raidintegritymode String ]
        [    --raidintegrityblocksize Number ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a COW snapshot LV of an origin LV.
  lvcreate -s|--snapshot -L|--size Size[m|UNIT] LV
        [ --type snapshot ] (implied)
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin pool.
  lvcreate --type thin-pool -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -T|--thin ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --thinpool LV_new ]
        [    --discards passdown|nopassdown|ignore ]
        [    --errorwhenfull y|n ]
        [    --pooldatavdo y|n ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a cache pool.
  lvcreate --type cache-pool -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a thin LV in a thin pool.
  lvcreate -V|--virtualsize Size[m|UNIT] --thinpool LV VG
        [ --type thin ] (implied)
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an existing thin LV.
  lvcreate -s|--snapshot LV
        [ --type thin ] (implied)
        [ COMMON_OPTIONS ]

  Create a thin LV that is a snapshot of an external origin LV.
  lvcreate --type thin --thinpool LV LV
        [ -T|--thin ]
        [ COMMON_OPTIONS ]

  Create a LV that returns VDO when used.
  lvcreate --type vdo -L|--size Size[m|UNIT] VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -V|--virtualsize Size[m|UNIT] ]
        [    --vdo ]
        [    --vdopool LV_new ]
        [    --compression y|n ]
        [    --deduplication y|n ]
        [    --vdosettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachepool
  which converts the new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachepool LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -H|--cache ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [    --poolmetadatasize Size[m|UNIT] ]
        [    --poolmetadataspare y|n ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachevol
  which converts the new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachevol LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach a cachevol created from
  the specified cache device, which converts the
  new LV to type cache.
  lvcreate --type cache -L|--size Size[m|UNIT] --cachedevice PV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ -c|--chunksize Size[k|UNIT] ]
        [    --cachesize Size[m|UNIT] ]
        [    --cachemode writethrough|writeback|passthrough ]
        [    --cachepolicy String ]
        [    --cachesettings String ]
        [    --cachemetadataformat auto|1|2 ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach the specified cachevol
  which converts the new LV to type writecache.
  lvcreate --type writecache -L|--size Size[m|UNIT] --cachevol LV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --cachesettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Create a new LV, then attach a cachevol created from
  the specified cache device, which converts the
  new LV to type writecache.
  lvcreate --type writecache -L|--size Size[m|UNIT] --cachedevice PV VG
        [ -l|--extents Number[PERCENT] ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --cachesize Size[m|UNIT] ]
        [    --cachesettings String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Common options for command:
        [ -a|--activate y|n|ay ]
        [ -A|--autobackup y|n ]
        [ -C|--contiguous y|n ]
        [ -M|--persistent y|n ]
        [ -j|--major Number ]
        [ -k|--setactivationskip y|n ]
        [ -K|--ignoreactivationskip ]
        [ -n|--name String ]
        [ -p|--permission rw|r ]
        [ -r|--readahead auto|none|Number ]
        [ -W|--wipesignatures y|n ]
        [ -Z|--zero y|n ]
        [    --addtag Tag ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --setautoactivation y|n ]
        [    --ignoremonitoring ]
        [    --metadataprofile String ]
        [    --minor Number ]
        [    --monitor y|n ]
        [    --nosync ]
        [    --noudevsync ]
        [    --reportformat basic|json|json_std ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`
    },

    'lvextend': {
        helpFlags: ['-h', '--help'],
        longHelpText: `  lvextend - Add space to a logical volume

  Extend an LV by a specified size.
  lvextend -L|--size [+]Size[m|UNIT] LV
        [ -l|--extents [+]Number[PERCENT] ]
        [ -r|--resizefs ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --poolmetadatasize [+]Size[m|UNIT] ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Extend an LV by specified PV extents.
  lvextend LV PV ...
        [ -r|--resizefs ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]

  Extend a pool metadata SubLV by a specified size.
  lvextend --poolmetadatasize [+]Size[m|UNIT] LV
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Extend an LV according to a predefined policy.
  lvextend --usepolicies LV
        [ -r|--resizefs ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Common options for command:
        [ -A|--autobackup y|n ]
        [ -f|--force ]
        [ -m|--mirrors Number ]
        [ -n|--nofsck ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --nosync ]
        [    --noudevsync ]
        [    --reportformat basic|json|json_std ]
        [    --type linear|striped|snapshot|raid|mirror|thin|thin-pool|vdo|vdo-pool|cache|cache-pool|writecache ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Special options for command:
        [ --extents Number[PERCENT] ]
        The --extents option can be used in place of --size.
        The number allows an optional percent suffix.

          Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`,
        text: `  lvextend - Add space to a logical volume

  Extend an LV by a specified size.
  lvextend -L|--size [+]Size[m|UNIT] LV
        [ -l|--extents [+]Number[PERCENT] ]
        [ -r|--resizefs ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --poolmetadatasize [+]Size[m|UNIT] ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Extend an LV by specified PV extents.
  lvextend LV PV ...
        [ -r|--resizefs ]
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]

  Extend a pool metadata SubLV by a specified size.
  lvextend --poolmetadatasize [+]Size[m|UNIT] LV
        [ -i|--stripes Number ]
        [ -I|--stripesize Size[k|UNIT] ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Extend an LV according to a predefined policy.
  lvextend --usepolicies LV
        [ -r|--resizefs ]
        [    --fs String ]
        [    --fsmode String ]
        [ COMMON_OPTIONS ]
        [ PV ... ]

  Common options for command:
        [ -A|--autobackup y|n ]
        [ -f|--force ]
        [ -m|--mirrors Number ]
        [ -n|--nofsck ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --nosync ]
        [    --noudevsync ]
        [    --reportformat basic|json|json_std ]
        [    --type linear|striped|snapshot|raid|mirror|thin|thin-pool|vdo|vdo-pool|cache|cache-pool|writecache ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`
    },

    'pvcreate': {
        helpFlags: ['-h', '--help'],
        longHelpText: `  pvcreate - Initialize physical volume(s) for use by LVM

  pvcreate PV ...
        [ -f|--force ]
        [ -M|--metadatatype lvm2 ]
        [ -u|--uuid String ]
        [ -Z|--zero y|n ]
        [    --dataalignment Size[k|UNIT] ]
        [    --dataalignmentoffset Size[k|UNIT] ]
        [    --bootloaderareasize Size[m|UNIT] ]
        [    --labelsector Number ]
        [    --pvmetadatacopies 0|1|2 ]
        [    --metadatasize Size[m|UNIT] ]
        [    --metadataignore y|n ]
        [    --norestorefile ]
        [    --setphysicalvolumesize Size[m|UNIT] ]
        [    --reportformat basic|json|json_std ]
        [    --restorefile String ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`,
        text: `pvcreate - Initialize physical volume(s) for use by LVM

  pvcreate PV ...
        [ -f|--force ]
        [ -M|--metadatatype lvm2 ]
        [ -u|--uuid String ]
        [ -Z|--zero y|n ]
        [    --dataalignment Size[k|UNIT] ]
        [    --dataalignmentoffset Size[k|UNIT] ]
        [    --bootloaderareasize Size[m|UNIT] ]
        [    --labelsector Number ]
        [    --pvmetadatacopies 0|1|2 ]
        [    --metadatasize Size[m|UNIT] ]
        [    --metadataignore y|n ]
        [    --norestorefile ]
        [    --setphysicalvolumesize Size[m|UNIT] ]
        [    --reportformat basic|json|json_std ]
        [    --restorefile String ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`
    },

    'vgcreate': {
        helpFlags: ['-h', '--help'],
        longHelpText: `  vgcreate - Create a volume group

  vgcreate VG_new PV ...
        [ -A|--autobackup y|n ]
        [ -c|--clustered y|n ]
        [ -l|--maxlogicalvolumes Number ]
        [ -p|--maxphysicalvolumes Number ]
        [ -M|--metadatatype lvm2 ]
        [ -s|--physicalextentsize Size[m|UNIT] ]
        [ -f|--force ]
        [ -Z|--zero y|n ]
        [    --addtag Tag ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --metadataprofile String ]
        [    --labelsector Number ]
        [    --metadatasize Size[m|UNIT] ]
        [    --pvmetadatacopies 0|1|2 ]
        [    --vgmetadatacopies all|unmanaged|Number ]
        [    --reportformat basic|json|json_std ]
        [    --dataalignment Size[k|UNIT] ]
        [    --dataalignmentoffset Size[k|UNIT] ]
        [    --shared ]
        [    --systemid String ]
        [    --locktype sanlock|dlm|none ]
        [    --setautoactivation y|n ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`,
        text: `  vgcreate - Create a volume group

  vgcreate VG_new PV ...
        [ -A|--autobackup y|n ]
        [ -c|--clustered y|n ]
        [ -l|--maxlogicalvolumes Number ]
        [ -p|--maxphysicalvolumes Number ]
        [ -M|--metadatatype lvm2 ]
        [ -s|--physicalextentsize Size[m|UNIT] ]
        [ -f|--force ]
        [ -Z|--zero y|n ]
        [    --addtag Tag ]
        [    --alloc contiguous|cling|cling_by_tags|normal|anywhere|inherit ]
        [    --metadataprofile String ]
        [    --labelsector Number ]
        [    --metadatasize Size[m|UNIT] ]
        [    --pvmetadatacopies 0|1|2 ]
        [    --vgmetadatacopies all|unmanaged|Number ]
        [    --reportformat basic|json|json_std ]
        [    --dataalignment Size[k|UNIT] ]
        [    --dataalignmentoffset Size[k|UNIT] ]
        [    --shared ]
        [    --systemid String ]
        [    --locktype sanlock|dlm|none ]
        [    --setautoactivation y|n ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`
    },

    'findmnt': `Usage:
 findmnt [options]
 findmnt [options] <device> | <mountpoint>
 findmnt [options] <device> <mountpoint>
 findmnt [options] [--source <device>] [--target <path> | --mountpoint <dir>]

Find a (mounted) filesystem.

Options:
 -s, --fstab            search in static table of filesystems
 -m, --mtab             search in table of mounted filesystems
                          (includes user space mount options)
 -k, --kernel           search in kernel table of mounted
                          filesystems (default)

 -p, --poll[=<list>]    monitor changes in table of mounted filesystems
 -w, --timeout <num>    upper limit in milliseconds that --poll will block

 -A, --all              disable all built-in filters, print all filesystems
 -a, --ascii            use ASCII chars for tree formatting
 -b, --bytes            print sizes in bytes rather than in human readable format
 -C, --nocanonicalize   don't canonicalize when comparing paths
 -c, --canonicalize     canonicalize printed paths
 -D, --df               imitate the output of df(1)
 -d, --direction <word> direction of search, 'forward' or 'backward'
 -e, --evaluate         convert tags (LABEL,UUID,PARTUUID,PARTLABEL)
                          to device names
 -F, --tab-file <path>  alternative file for -s, -m or -k options
 -f, --first-only       print the first found filesystem only
 -i, --invert           invert the sense of matching
 -J, --json             use JSON output format
 -l, --list             use list format output
 -N, --task <tid>       use alternative namespace (/proc/<tid>/mountinfo file)
 -n, --noheadings       don't print column headings
 -O, --options <list>   limit the set of filesystems by mount options
 -o, --output <list>    the output columns to be shown
     --output-all       output all available columns
 -P, --pairs            use key="value" output format
     --pseudo           print only pseudo-filesystems
     --shadowed         print only filesystems over-mounted by another filesystem
 -R, --submounts        print all submounts for the matching filesystems
 -r, --raw              use raw output format
     --real             print only real filesystems
 -S, --source <string>  the device to mount (by name, maj:min,
                          LABEL=, UUID=, PARTUUID=, PARTLABEL=)
 -T, --target <path>    the path to the filesystem to use
     --tree             enable tree format output if possible
 -M, --mountpoint <dir> the mountpoint directory
 -t, --types <list>     limit the set of filesystems by FS types
 -U, --uniq             ignore filesystems with duplicate target
 -u, --notruncate       don't truncate text in columns
 -v, --nofsroot         don't print [/dir] for bind or btrfs mounts

 -x, --verify           verify mount table content (default is fstab)
     --verbose          print more details
     --vfs-all          print all VFS options

 -h, --help             display this help
 -V, --version          display version

Available output columns:
      ACTION  action detected by --poll
       AVAIL  filesystem size available
        FREQ  dump(8) period in days [fstab only]
      FSROOT  filesystem root
      FSTYPE  filesystem type
  FS-OPTIONS  FS specific mount options
          ID  mount ID
       LABEL  filesystem label
     MAJ:MIN  major:minor device number
 OLD-OPTIONS  old mount options saved by --poll
  OLD-TARGET  old mountpoint saved by --poll
     OPTIONS  all mount options
  OPT-FIELDS  optional mount fields
      PARENT  mount parent ID
   PARTLABEL  partition label
    PARTUUID  partition UUID
      PASSNO  pass number on parallel fsck(8) [fstab only]
 PROPAGATION  VFS propagation flags
        SIZE  filesystem size
      SOURCE  source device
      TARGET  mountpoint
         TID  task ID
        USED  filesystem size used
        USE%  filesystem use percentage
        UUID  filesystem UUID
 VFS-OPTIONS  VFS specific mount options

For more details see findmnt(8).`,

    'pvscan': {
        helpFlags: ['-h', '--help', '--longhelp'],
        text: `U  pvscan - List all physical volumes

  Display PV information.
  pvscan
        [ -e|--exported ]
        [ -n|--novolumegroup ]
        [ -s|--short ]
        [ -u|--uuid ]
        [ -A|--allpvs ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Record that a PV is online or offline.
  pvscan --cache
        [ -j|--major Number ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [    --minor Number ]
        [    --noudevsync ]
        [ COMMON_OPTIONS ]
        [ String|PV ... ]

  Record that a PV is online and autoactivate the VG if complete.
  pvscan --cache -a|--activate ay
        [ -j|--major Number ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [    --minor Number ]
        [    --noudevsync ]
        [    --autoactivation String ]
        [ COMMON_OPTIONS ]
        [ String|PV ... ]

  Record that a PV is online and list the VG using the PV.
  pvscan --cache --listvg PV
        [    --ignorelockingfailure ]
        [    --checkcomplete ]
        [    --vgonline ]
        [    --udevoutput ]
        [    --autoactivation String ]
        [ COMMON_OPTIONS ]

  Record that a PV is online and list LVs using the PV.
  pvscan --cache --listlvs PV
        [    --ignorelockingfailure ]
        [    --checkcomplete ]
        [    --vgonline ]
        [ COMMON_OPTIONS ]

  List LVs using the PV.
  pvscan --listlvs PV
        [ COMMON_OPTIONS ]

  List the VG using the PV.
  pvscan --listvg PV
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`,
        longHelpText: `  pvscan - List all physical volumes

  Display PV information.
  pvscan
        [ -e|--exported ]
        [ -n|--novolumegroup ]
        [ -s|--short ]
        [ -u|--uuid ]
        [ -A|--allpvs ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Record that a PV is online or offline.
  pvscan --cache
        [ -j|--major Number ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [    --minor Number ]
        [    --noudevsync ]
        [ COMMON_OPTIONS ]
        [ String|PV ... ]

  Record that a PV is online and autoactivate the VG if complete.
  pvscan --cache -a|--activate ay
        [ -j|--major Number ]
        [    --ignorelockingfailure ]
        [    --reportformat basic|json|json_std ]
        [    --minor Number ]
        [    --noudevsync ]
        [    --autoactivation String ]
        [ COMMON_OPTIONS ]
        [ String|PV ... ]

  Record that a PV is online and list the VG using the PV.
  pvscan --cache --listvg PV
        [    --ignorelockingfailure ]
        [    --checkcomplete ]
        [    --vgonline ]
        [    --udevoutput ]
        [    --autoactivation String ]
        [ COMMON_OPTIONS ]

  Record that a PV is online and list LVs using the PV.
  pvscan --cache --listlvs PV
        [    --ignorelockingfailure ]
        [    --checkcomplete ]
        [    --vgonline ]
        [ COMMON_OPTIONS ]

  List LVs using the PV.
  pvscan --listlvs PV
        [ COMMON_OPTIONS ]

  List the VG using the PV.
  pvscan --listvg PV
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`
    },

    'vgscan': {
        helpFlags: ['-h', '--help', '--longhelp'],
        text: `  vgscan - Search for all volume groups

  vgscan
        [    --ignorelockingfailure ]
        [    --mknodes ]
        [    --notifydbus ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`,
        longHelpText: `  vgscan - Search for all volume groups

  vgscan
        [    --ignorelockingfailure ]
        [    --mknodes ]
        [    --notifydbus ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`
    },

    'lvscan': {
        helpFlags: ['-h', '--help', '--longhelp'],
        text: `  lvscan - List all logical volumes in all volume groups

  lvscan
        [ -a|--all ]
        [ -b|--blockdevice ]
        [    --ignorelockingfailure ]
        [    --readonly ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Use --longhelp to show all options and advanced commands.`,
        longHelpText: `  lvscan - List all logical volumes in all volume groups

  lvscan
        [ -a|--all ]
        [ -b|--blockdevice ]
        [    --ignorelockingfailure ]
        [    --readonly ]
        [    --reportformat basic|json|json_std ]
        [ COMMON_OPTIONS ]

  Common options for lvm:
        [ -d|--debug ]
        [ -h|--help ]
        [ -q|--quiet ]
        [ -v|--verbose ]
        [ -y|--yes ]
        [ -t|--test ]
        [    --commandprofile String ]
        [    --config String ]
        [    --driverloaded y|n ]
        [    --nolocking ]
        [    --lockopt String ]
        [    --longhelp ]
        [    --profile String ]
        [    --version ]
        [    --devicesfile String ]
        [    --devices PV ]
        [    --nohints ]
        [    --journal String ]

  Common variables for lvm:
        Variables in option or position args are capitalized,
        e.g. PV, VG, LV, Size, Number, String, Tag.

        PV
        Physical Volume name, a device path under /dev.
        For commands managing physical extents, a PV positional arg
        generally accepts a suffix indicating a range (or multiple ranges)
        of PEs. When the first PE is omitted, it defaults to the start of
        the device, and when the last PE is omitted it defaults to the end.
        PV[:PE-PE]... is start and end range (inclusive),
        PV[:PE+PE]... is start and length range (counting from 0).

        LV
        Logical Volume name. See lvm(8) for valid names. An LV positional
        arg generally includes the VG name and LV name, e.g. VG/LV.
        LV followed by _<type> indicates that an LV of the given type is
        required. (raid represents raid<N> type).
        The _new suffix indicates that the LV name is new.

        Tag
        Tag name. See lvm(8) for information about tag names and using
        tags in place of a VG, LV or PV.

        Select
        Select indicates that a required positional arg can be omitted
        if the --select option is used. No arg appears in this position.

        Size[UNIT]
        Size is an input number that accepts an optional unit.
        Input units are always treated as base two values, regardless of
        capitalization, e.g. 'k' and 'K' both refer to 1024.
        The default input unit is specified by letter, followed by |UNIT.
        UNIT represents other possible input units: BbBsSkKmMgGtTpPeE.
        (This should not be confused with the output control --units, where
        capital letters mean multiple of 1000.)`
    },

    'mkfs.vfat': `mkfs.fat 4.2 (2021-01-31)
Usage: mkfs.vfat [OPTIONS] TARGET [BLOCKS]
Create FAT filesystem in TARGET, which can be a block device or file. Use only
up to BLOCKS 1024 byte blocks if specified. With the -C option, file TARGET will be
created with a size of 1024 bytes times BLOCKS, which must be specified.

Options:
  -a              Disable alignment of data structures
  -A              Toggle Atari variant of the filesystem
  -b SECTOR       Select SECTOR as location of the FAT32 backup boot sector
  -c              Check device for bad blocks before creating the filesystem
  -C              Create file TARGET then create filesystem in it
  -D NUMBER       Write BIOS drive number NUMBER to boot sector
  -f COUNT        Create COUNT file allocation tables
  -F SIZE         Select FAT size SIZE (12, 16 or 32)
  -g GEOM         Select disk geometry: heads/sectors_per_track
  -h NUMBER       Write hidden sectors NUMBER to boot sector
  -i VOLID        Set volume ID to VOLID (a 32 bit hexadecimal number)
  -I              Ignore and disable safety checks
  -l FILENAME     Read bad blocks list from FILENAME
  -m FILENAME     Replace default error message in boot block with contents of FILENAME
  -M TYPE         Set media type in boot sector to TYPE
  --mbr[=y|n|a]   Fill (fake) MBR table with one partition which spans whole disk
  -n LABEL        Set volume name to LABEL (up to 11 characters long)
  --codepage=N    use DOS codepage N to encode label (default: 850)
  -r COUNT        Make room for at least COUNT entries in the root directory
  -R COUNT        Set minimal number of reserved sectors to COUNT
  -s COUNT        Set number of sectors per cluster to COUNT
  -S SIZE         Select a sector size of SIZE (a power of two, at least 512)
  -v              Verbose execution
  --variant=TYPE  Select variant TYPE of filesystem (standard or Atari)

  --invariant     Use constants for randomly generated or time based values
  --offset=SECTOR Write the filesystem at a specific sector into the device file.
  --help          Show this help message and exit`,

    'tuned-adm': `usage: tuned-adm [-h] [--version] [--debug] [--async] [--timeout TIMEOUT] [--loglevel LOGLEVEL]
                 {list,active,off,profile,profile_info,recommend,verify,auto_profile,profile_mode,instance_acquire_devices,get_instances,instance_get_devices} ...

Manage tuned daemon.

positional arguments:
  {list,active,off,profile,profile_info,recommend,verify,auto_profile,profile_mode,instance_acquire_devices,get_instances,instance_get_devices}
    list                list available profiles or plugins (by default profiles)
    active              show active profile
    off                 switch off all tunings
    profile             switch to a given profile, or list available profiles if no profile is given
    profile_info        show information/description of given profile or current profile if no profile is specified
    recommend           recommend profile
    verify              verify profile
    auto_profile        enable automatic profile selection mode, switch to the recommended profile
    profile_mode        show current profile selection mode
    instance_acquire_devices
                        acquire devices from other instances and assign them to the given instance
    get_instances       list active instances of a given plugin or all active instances if no plugin is specified
    instance_get_devices
                        list devices assigned to a given instance

optional arguments:
  -h, --help            show this help message and exit
  --version, -v         show program's version number and exit
  --debug, -d           show debug messages
  --async, -a           with dbus do not wait on commands completion and return immediately
  --timeout TIMEOUT, -t TIMEOUT
                        with sync operation use specific timeout instead of the default 600 second(s)
  --loglevel LOGLEVEL, -l LOGLEVEL
                        level of log messages to capture (one of debug, info, warn, error, console, none). Default: console`,

    'flatpak': `Usage:
  flatpak [OPTION…] COMMAND

Builtin Commands:
 Manage installed applications and runtimes
  install                Install an application or runtime
  update                 Update an installed application or runtime
  uninstall              Uninstall an installed application or runtime
  mask                   Mask out updates and automatic installation
  pin                    Pin a runtime to prevent automatic removal
  list                   List installed apps and/or runtimes
  info                   Show info for installed app or runtime
  history                Show history
  config                 Configure flatpak
  repair                 Repair flatpak installation
  create-usb             Put applications or runtimes onto removable media

 Find applications and runtimes
  search                 Search for remote apps/runtimes

 Manage running applications
  run                    Run an application
  override               Override permissions for an application
  make-current           Specify default version to run
  enter                  Enter the namespace of a running application
  ps                     Enumerate running applications
  kill                   Stop a running application

 Manage file access
  documents              List exported files
  document-export        Grant an application access to a specific file
  document-unexport      Revoke access to a specific file
  document-info          Show information about a specific file

 Manage dynamic permissions
  permissions            List permissions
  permission-remove      Remove item from permission store
  permission-set         Set permissions
  permission-show        Show app permissions
  permission-reset       Reset app permissions

 Manage remote repositories
  remotes                List all configured remotes
  remote-add             Add a new remote repository (by URL)
  remote-modify          Modify properties of a configured remote
  remote-delete          Delete a configured remote
  remote-ls              List contents of a configured remote
  remote-info            Show information about a remote app or runtime

 Build applications
  build-init             Initialize a directory for building
  build                  Run a build command inside the build dir
  build-finish           Finish a build dir for export
  build-export           Export a build dir to a repository
  build-bundle           Create a bundle file from a ref in a local repository
  build-import-bundle    Import a bundle file
  build-sign             Sign an application or runtime
  build-update-repo      Update the summary file in a repository
  build-commit-from      Create new commit based on existing ref
  repo                   Show information about a repo

Help Options:
  -h, --help              Show help options

Application Options:
  --version               Print version information and exit
  --default-arch          Print default arch and exit
  --supported-arches      Print supported arches and exit
  --gl-drivers            Print active gl drivers and exit
  --installations         Print paths for system installations and exit
  --print-updated-env     Print the updated environment needed to run flatpaks
  --print-system-only     Only include the system installation with --print-updated-env
  -v, --verbose           Show debug information, -vv for more detail
  --ostree-verbose        Show OSTree debug information`,

    'loginctl': `loginctl [OPTIONS...] COMMAND ...

Send control commands to or query the login manager.

Session Commands:
  list-sessions            List sessions
  session-status [ID...]   Show session status
  show-session [ID...]     Show properties of sessions or the manager
  activate [ID]            Activate a session
  lock-session [ID...]     Screen lock one or more sessions
  unlock-session [ID...]   Screen unlock one or more sessions
  lock-sessions            Screen lock all current sessions
  unlock-sessions          Screen unlock all current sessions
  terminate-session ID...  Terminate one or more sessions
  kill-session ID...       Send signal to processes of a session

User Commands:
  list-users               List users
  user-status [USER...]    Show user status
  show-user [USER...]      Show properties of users or the manager
  enable-linger [USER...]  Enable linger state of one or more users
  disable-linger [USER...] Disable linger state of one or more users
  terminate-user USER...   Terminate all sessions of one or more users
  kill-user USER...        Send signal to processes of a user

Seat Commands:
  list-seats               List seats
  seat-status [NAME...]    Show seat status
  show-seat [NAME...]      Show properties of seats or the manager
  attach NAME DEVICE...    Attach one or more devices to a seat
  flush-devices            Flush all device associations
  terminate-seat NAME...   Terminate all sessions on one or more seats

Options:
  -h --help                Show this help
     --version             Show package version
     --no-pager            Do not pipe output into a pager
     --no-legend           Do not show the headers and footers
     --no-ask-password     Don't prompt for password
  -H --host=[USER@]HOST    Operate on remote host
  -M --machine=CONTAINER   Operate on local container
  -p --property=NAME       Show only properties by this name
  -P NAME                  Equivalent to --value --property=NAME
  -a --all                 Show all properties, including empty ones
     --value               When showing properties, only print the value
  -l --full                Do not ellipsize output
     --kill-whom=WHOM      Whom to send signal to
  -s --signal=SIGNAL       Which signal to send
  -n --lines=INTEGER       Number of journal entries to show
  -o --output=STRING       Change journal output mode (short, short-precise,
                             short-iso, short-iso-precise, short-full,
                             short-monotonic, short-unix, short-delta,
                             json, json-pretty, json-sse, json-seq, cat,
                             verbose, export, with-unit)

See the loginctl(1) man page for details.`,

      'passwd': `Usage: passwd [OPTION...] <accountName>
  -k, --keep-tokens       keep non-expired authentication tokens
  -d, --delete            delete the password for the named account (root only); also removes password lock if any
  -l, --lock              lock the password for the named account (root only)
  -u, --unlock            unlock the password for the named account (root only)
  -e, --expire            expire the password for the named account (root only)
  -f, --force             force operation
  -x, --maximum=DAYS      maximum password lifetime (root only)
  -n, --minimum=DAYS      minimum password lifetime (root only)
  -w, --warning=DAYS      number of days warning users receives before password expiration (root only)
  -i, --inactive=DAYS     number of days after password expiration when an account becomes disabled (root only)
  -S, --status            report password status on the named account (root only)
      --stdin             read new tokens from stdin (root only)

Help options:
  -?, --help              Show this help message
      --usage             Display brief usage message`
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
    
    // --longhelp support
    if (flag === '--longhelp') {
        if (helpEntry.longHelpText) return helpEntry.longHelpText;
        // Fall back to regular help text if longHelp not set yet
        return helpEntry.text || null;
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
