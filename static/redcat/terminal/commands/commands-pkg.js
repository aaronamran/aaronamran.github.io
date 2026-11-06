// Package database: dnf / yum / rpm against a real catalog, repo files and an installed set
// Part of Red Cat RHCSA Terminal Simulator
//
// Installing a package creates its files, users and unit files, so which, rpm -ql/-qf/-qa, systemctl and
// ls all agree. Repositories are read from /etc/yum.repos.d/*.repo: a broken baseurl, a disabled repo or a
// missing gpgkey fails the way it does on a real system.

const PKG_CONTENT = {
    '/etc/nginx/mime.types': "types {\n    text/html                                        html htm shtml;\n    text/css                                         css;\n    text/xml                                         xml;\n    image/gif                                        gif;\n    image/jpeg                                       jpeg jpg;\n    application/javascript                           js;\n    application/json                                 json;\n    text/plain                                       txt;\n    image/png                                        png;\n    image/svg+xml                                    svg svgz;\n    application/pdf                                  pdf;\n    application/zip                                  zip;\n}\n",
    '/usr/share/nginx/html/index.html': '<!doctype html>\n<html>\n  <head>\n    <title>Test Page for the Nginx HTTP Server on Red Hat Enterprise Linux</title>\n  </head>\n  <body>\n    <h1>Welcome to <strong>nginx</strong> on Red Hat Enterprise Linux!</h1>\n  </body>\n</html>\n',
    '/etc/httpd/conf/httpd.conf': "#\n# This is the main Apache HTTP server configuration file.  It contains the\n# configuration directives that give the server its instructions.\n# See <URL:http://httpd.apache.org/docs/2.4/> for detailed information.\n#\nServerRoot \"/etc/httpd\"\n\n#\n# Listen: Allows you to bind Apache to specific IP addresses and/or\n# ports, instead of the default. See also the <VirtualHost>\n# directive.\n#\nListen 80\n\n#\n# Dynamic Shared Object (DSO) Support\n#\nInclude conf.modules.d/*.conf\n\n#\n# If you wish httpd to run as a different user or group, you must run\n# httpd as root initially and it will switch.\n#\nUser apache\nGroup apache\n\n# 'Main' server configuration\n\nServerAdmin root@localhost\n\n#ServerName www.example.com:80\n\n<Directory />\n    AllowOverride none\n    Require all denied\n</Directory>\n\n#\n# DocumentRoot: The directory out of which you will serve your\n# documents.\n#\nDocumentRoot \"/var/www/html\"\n\n<Directory \"/var/www\">\n    AllowOverride None\n    # Allow open access:\n    Require all granted\n</Directory>\n\n<Directory \"/var/www/html\">\n    Options Indexes FollowSymLinks\n    AllowOverride None\n    Require all granted\n</Directory>\n\n<IfModule dir_module>\n    DirectoryIndex index.html\n</IfModule>\n\n<Files \".ht*\">\n    Require all denied\n</Files>\n\nErrorLog \"logs/error_log\"\n\nLogLevel warn\n\n<IfModule log_config_module>\n    LogFormat \"%h %l %u %t \\\"%r\\\" %>s %b \\\"%{Referer}i\\\" \\\"%{User-Agent}i\\\"\" combined\n    LogFormat \"%h %l %u %t \\\"%r\\\" %>s %b\" common\n    CustomLog \"logs/access_log\" combined\n</IfModule>\n\n<IfModule alias_module>\n    ScriptAlias /cgi-bin/ \"/var/www/cgi-bin/\"\n</IfModule>\n\n<Directory \"/var/www/cgi-bin\">\n    AllowOverride None\n    Options None\n    Require all granted\n</Directory>\n\n<IfModule mime_module>\n    TypesConfig /etc/mime.types\n    AddType application/x-compress .Z\n    AddType application/x-gzip .gz .tgz\n</IfModule>\n\nAddDefaultCharset UTF-8\n\nEnableSendfile on\n\n# Supplemental configuration\n#\n# Load config files in the \"/etc/httpd/conf.d\" directory, if any.\nIncludeOptional conf.d/*.conf\n",
    '/etc/nginx/nginx.conf': "# For more information on configuration, see:\n#   * Official English Documentation: http://nginx.org/en/docs/\n#   * Official Russian Documentation: http://nginx.org/ru/docs/\n\nuser nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log;\npid /run/nginx.pid;\n\n# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.\ninclude /usr/share/nginx/modules/*.conf;\n\nevents {\n    worker_connections 1024;\n}\n\nhttp {\n    log_format  main  '$remote_addr - $remote_user [$time_local] \"$request\" '\n                      '$status $body_bytes_sent \"$http_referer\" '\n                      '\"$http_user_agent\" \"$http_x_forwarded_for\"';\n\n    access_log  /var/log/nginx/access.log  main;\n\n    sendfile            on;\n    tcp_nopush          on;\n    keepalive_timeout   65;\n    types_hash_max_size 4096;\n\n    include             /etc/nginx/mime.types;\n    default_type        application/octet-stream;\n\n    # Load modular configuration files from the /etc/nginx/conf.d directory.\n    include /etc/nginx/conf.d/*.conf;\n\n    server {\n        listen       80;\n        listen       [::]:80;\n        server_name  _;\n        root         /usr/share/nginx/html;\n\n        # Load configuration files for the default server block.\n        include /etc/nginx/default.d/*.conf;\n\n        error_page 404 /404.html;\n        location = /404.html {\n        }\n\n        error_page 500 502 503 504 /50x.html;\n        location = /50x.html {\n        }\n    }\n}\n",
    '/etc/auto.master': "#\n# Sample auto.master file\n# This is a 'master' automounter map and it has the following format:\n# mount-point [map-type[,format]:]map [options]\n# For details of the format look at auto.master(5).\n#\n/misc\t/etc/auto.misc\n#\n# NOTE: mounts done from a hosts map will be mounted with the\n#\t\"nosuid\" and \"nodev\" options unless the \"suid\" and \"dev\"\n#\toptions are explicitly given.\n#\n/net\t-hosts\n#\n# Include /etc/auto.master.d/*.autofs\n# The included files must conform to the format of this file.\n#\n+dir:/etc/auto.master.d\n#\n# Include central master map if it can be found using\n# nsswitch sources.\n#\n# Note that if there are entries for /net or /misc (as\n# above) in the included master map any keys that are the\n# same will not be seen as the first read key seen takes\n# precedence.\n#\n+auto.master\n",
    '/etc/auto.misc': "#\n# This is an automounter map and it has the following format\n# key [ -mount-options-separated-by-comma ] location\n# Details may be found in the autofs(5) manpage\n\ncd\t\t-fstype=iso9660,ro,nosuid,nodev\t:/dev/cdrom\n",
    '/etc/exports': '',
    '/etc/nfs.conf': "#\n# This is a general configuration for the\n# NFS daemons and tools\n#\n[general]\n[nfsd]\n# threads=8\n"
};

class PackageEngine {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.shared = sharedState;
        sharedState.pkg = this;
        this.cat = {};
        this.installed = {};      // name -> { date, reason, repo, ver, rel }
        this.history = [];
        this.modules = this._moduleDefs();
        this.moduleState = {};    // name -> { enabled: stream, disabled: bool }
        this.groupsInstalled = new Set();
        this.metaBase = Date.now() - 83000;
        this._buildCatalog();
        this._seedInstalled();
        this._seedFiles();
        for (const n of Object.keys(this.installed)) this._materialize(n);
    }

    // ===== catalog =====
    // name|version|release|repo(b=baseos,a=appstream,e=extras)|sizeKB|summary|files;|requires,|license|group|url
    _buildCatalog() {
        const T = `
bash|5.1.8|6.el9|b|1768|The GNU Bourne Again shell|/usr/bin/bash;/etc/skel/.bashrc;/etc/skel/.bash_profile;/etc/skel/.bash_logout;/usr/share/man/man1/bash.1.gz|filesystem|GPLv3+|System Environment/Shells|https://www.gnu.org/software/bash
coreutils|8.32|35.el9|b|4120|A set of basic GNU tools commonly used in shell scripts|/usr/bin/ls;/usr/bin/cp;/usr/bin/mv;/usr/bin/rm;/usr/bin/cat;/usr/bin/chmod;/usr/bin/chown;/usr/bin/date;/usr/bin/sort;/usr/bin/wc;/usr/bin/id;/usr/bin/stat;/usr/bin/mkdir;/usr/bin/touch;/usr/bin/ln;/usr/bin/df;/usr/bin/du|glibc|GPLv3+|System Environment/Base|https://www.gnu.org/software/coreutils/
glibc|2.34|83.el9_3.7|b|7120|The GNU libc libraries|/usr/lib64/libc.so.6;/etc/ld.so.conf;/usr/sbin/ldconfig|basesystem|LGPLv2+|System Environment/Libraries|http://www.gnu.org/software/glibc/
filesystem|3.16|2.el9|b|0|The basic directory layout for a Linux system|/etc/fstab;/etc/hosts|setup|Public Domain|System Environment/Base|https://pagure.io/filesystem
setup|2.13.7|9.el9|b|720|A set of system configuration and setup files|/etc/passwd;/etc/group;/etc/shells;/etc/profile;/etc/services|basesystem|Public Domain|System Environment/Base|https://pagure.io/setup/
basesystem|11|13.el9|b|0|The skeleton package which defines a simple Red Hat Enterprise Linux system||filesystem|Public Domain|Unspecified|
systemd|252|18.el9|b|11500|System and Service Manager|/usr/lib/systemd/systemd;/usr/bin/systemctl;/usr/bin/journalctl;/usr/bin/timedatectl;/usr/bin/hostnamectl;/etc/systemd/system.conf;/etc/systemd/journald.conf|glibc|LGPLv2+ and MIT and GPLv2+|System Environment/Base|https://systemd.io
kernel|5.14.0|362.8.1.el9_3|b|0|The Linux kernel|/boot/vmlinuz-5.14.0-362.8.1.el9_3.x86_64;/boot/initramfs-5.14.0-362.8.1.el9_3.x86_64.img|glibc|GPLv2 and Redistributable, no modification permitted|System Environment/Kernel|https://www.kernel.org/
dnf|4.14.0|9.el9|b|1850|Package manager|/usr/bin/dnf;/etc/dnf/dnf.conf|python3|GPLv2+ and GPLv2 and GPL|System Environment/Base|https://github.com/rpm-software-management/dnf
rpm|4.16.1.3|27.el9|b|2200|The RPM package management system|/usr/bin/rpm;/usr/bin/rpmquery;/usr/bin/rpm2cpio|glibc|GPLv2+|System Environment/Base|http://www.rpm.org/
python3|3.9.18|1.el9_3|b|30|Python 3.9 interpreter|/usr/bin/python3;/usr/bin/python3.9|glibc|Python|Development/Languages|https://www.python.org/
sudo|1.9.5p2|10.el9_3|b|2440|Allows restricted root access for specified users|/usr/bin/sudo;/usr/bin/sudoedit;/usr/sbin/visudo;/etc/sudoers|glibc|ISC|Applications/System|https://www.sudo.ws/
shadow-utils|4.9|8.el9|b|4930|Utilities for managing accounts and shadow password files|/usr/sbin/useradd;/usr/sbin/usermod;/usr/sbin/userdel;/usr/sbin/groupadd;/usr/bin/chage;/etc/login.defs;/etc/default/useradd|glibc|BSD and GPLv2+|System Environment/Base|https://github.com/shadow-maint/shadow
util-linux|2.37.4|18.el9|b|3500|A collection of basic system utilities|/usr/bin/lsblk;/usr/sbin/fdisk;/usr/sbin/mkswap;/usr/bin/mount;/usr/bin/umount;/usr/bin/findmnt;/usr/sbin/blkid;/usr/bin/script;/usr/bin/logger;/usr/bin/su|glibc|GPLv2 and GPLv2+ and LGPLv2+ and BSD with advertising and Public Domain|System Environment/Base|https://github.com/util-linux/util-linux
procps-ng|3.3.17|13.el9|b|1100|System and process monitoring utilities|/usr/bin/ps;/usr/bin/top;/usr/bin/free;/usr/bin/uptime;/usr/bin/pgrep;/usr/bin/pkill;/usr/bin/kill;/usr/sbin/sysctl;/etc/sysctl.conf|glibc|GPL+ and GPLv2 and GPLv2+ and GPLv3+ and LGPLv2+|Applications/System|https://gitlab.com/procps-ng/procps
openssh|8.7p1|34.el9_3.3|b|1350|An open source implementation of SSH protocol version 2|/usr/bin/ssh-keygen;/usr/libexec/openssh/ssh-keysign|glibc|BSD|Applications/Internet|https://www.openssh.com/portable.html
openssh-clients|8.7p1|34.el9_3.3|b|700|An open source SSH client applications|/usr/bin/ssh;/usr/bin/scp;/usr/bin/sftp;/usr/bin/ssh-add;/usr/bin/ssh-copy-id;/etc/ssh/ssh_config|openssh|BSD|Applications/Internet|https://www.openssh.com/portable.html
openssh-server|8.7p1|34.el9_3.3|b|1020|An open source SSH server daemon|/usr/sbin/sshd;/etc/ssh/sshd_config;/usr/lib/systemd/system/sshd.service|openssh|BSD|System Environment/Daemons|https://www.openssh.com/portable.html
NetworkManager|1.44.0|5.el9_3|b|5900|Network connection manager and user applications|/usr/sbin/NetworkManager;/usr/bin/nmcli;/etc/NetworkManager/NetworkManager.conf;/usr/lib/systemd/system/NetworkManager.service|glibc|GPLv2+ and LGPLv2+|System Environment/Base|https://networkmanager.dev/
firewalld|1.3.4|1.el9|b|2200|A firewall daemon with D-Bus interface providing a dynamic firewall|/usr/sbin/firewalld;/usr/bin/firewall-cmd;/etc/firewalld/firewalld.conf;/usr/lib/systemd/system/firewalld.service|python3,firewalld-filesystem|GPLv2+|System Environment/Base|http://www.firewalld.org
firewalld-filesystem|1.3.4|1.el9|b|0|Firewalld directory layout and rpm macros|/usr/lib/firewalld/zones/public.xml|setup|GPLv2+|System Environment/Base|http://www.firewalld.org
chrony|4.3|1.el9|b|820|An NTP client/server|/usr/sbin/chronyd;/usr/bin/chronyc;/etc/chrony.conf;/etc/chrony.keys;/usr/lib/systemd/system/chronyd.service|glibc|GPLv2|System Environment/Daemons|https://chrony.tuxfamily.org
rsyslog|8.2102.0|117.el9|b|2300|Enhanced system logging and kernel message trapping daemon|/usr/sbin/rsyslogd;/etc/rsyslog.conf;/usr/lib/systemd/system/rsyslog.service|glibc|(GPLv3+ and ASL 2.0)|System Environment/Daemons|https://www.rsyslog.com/
cronie|1.5.7|11.el9|b|220|Cron daemon for executing programs at set times|/usr/sbin/crond;/usr/bin/crontab;/etc/crontab;/etc/cron.d/0hourly;/usr/lib/systemd/system/crond.service|glibc|GPLv2+ and MIT and BSD and ISC|System Environment/Base|https://github.com/cronie-crond/cronie
cronie-anacron|1.5.7|11.el9|b|50|Utility for running regular jobs|/usr/sbin/anacron;/etc/anacrontab|cronie|GPLv2+ and MIT and BSD and ISC|System Environment/Base|https://github.com/cronie-crond/cronie
at|3.2.2|11.el9|b|120|Job spooling tools|/usr/bin/at;/usr/bin/atq;/usr/bin/atrm;/usr/bin/batch;/usr/sbin/atd;/usr/lib/systemd/system/atd.service|glibc|GPLv3+ and GPLv2+ and ISC and MIT and Public Domain|System Environment/Daemons|http://ftp.debian.org/debian/pool/main/a/at
selinux-policy|38.1.23|1.el9_3.2|b|120|SELinux policy configuration|/etc/selinux/config;/usr/share/selinux/devel/Makefile|policycoreutils|GPLv2+|System Environment/Base|https://github.com/fedora-selinux/selinux-policy
selinux-policy-targeted|38.1.23|1.el9_3.2|b|16000|SELinux targeted policy|/etc/selinux/targeted/contexts/files/file_contexts|selinux-policy|GPLv2+|System Environment/Base|https://github.com/fedora-selinux/selinux-policy
policycoreutils|3.6|2.1.el9|b|690|SELinux policy core utilities|/usr/sbin/restorecon;/usr/sbin/setfiles;/usr/sbin/semodule;/usr/sbin/sestatus;/usr/sbin/setsebool;/usr/sbin/load_policy|glibc|GPLv2|System Environment/Base|https://github.com/SELinuxProject/selinux
libselinux-utils|3.6|1.el9|b|80|SELinux libselinux utilities|/usr/sbin/getenforce;/usr/sbin/setenforce;/usr/sbin/getsebool;/usr/sbin/matchpathcon;/usr/sbin/selinuxenabled|glibc|Public Domain|Development/Libraries|https://github.com/SELinuxProject/selinux
audit|3.1.2|2.el9|b|950|User space tools for kernel auditing|/usr/sbin/auditd;/usr/sbin/auditctl;/usr/sbin/ausearch;/usr/sbin/aureport;/etc/audit/auditd.conf;/usr/lib/systemd/system/auditd.service|glibc|GPLv2+|Application/System|https://github.com/linux-audit/
tuned|2.21.0|1.el9|b|1100|A dynamic adaptive system tuning daemon|/usr/sbin/tuned;/usr/sbin/tuned-adm;/etc/tuned/active_profile;/usr/lib/systemd/system/tuned.service|python3|GPLv2+|System Environment/Daemons|http://www.tuned-project.org/
lvm2|2.03.21|2.el9|b|2200|Userland logical volume management tools|/usr/sbin/lvm;/usr/sbin/pvcreate;/usr/sbin/vgcreate;/usr/sbin/lvcreate;/usr/sbin/lvextend;/etc/lvm/lvm.conf|glibc|GPLv2|System Environment/Base|http://sourceware.org/lvm2/
xfsprogs|5.14.2|4.el9|b|3500|Utilities for managing the XFS filesystem|/usr/sbin/mkfs.xfs;/usr/sbin/xfs_growfs;/usr/sbin/xfs_repair;/usr/sbin/xfs_admin|glibc|GPL+ and LGPLv2+|System Environment/Base|https://xfs.wiki.kernel.org/
e2fsprogs|1.46.5|4.el9|b|3100|Utilities for managing ext2, ext3, and ext4 file systems|/usr/sbin/mkfs.ext4;/usr/sbin/e2fsck;/usr/sbin/resize2fs;/usr/sbin/tune2fs|glibc|GPLv2|System Environment/Base|http://e2fsprogs.sourceforge.net/
parted|3.5|2.el9|b|110|The GNU disk partition manipulation program|/usr/sbin/parted;/usr/sbin/partprobe|glibc|GPLv3+|Applications/System|http://www.gnu.org/software/parted
tar|1.34|6.el9_1|b|2840|A GNU file archiving program|/usr/bin/tar|glibc|GPLv3+|Applications/Archiving|http://www.gnu.org/software/tar/
gzip|1.12|1.el9|b|390|The GNU data compression program|/usr/bin/gzip;/usr/bin/gunzip;/usr/bin/zcat|glibc|GPLv3+ and GFDL|Applications/File|http://www.gzip.org/
grep|3.6|5.el9|b|1000|Pattern matching utilities|/usr/bin/grep;/usr/bin/egrep;/usr/bin/fgrep|glibc|GPLv3+|Applications/Text|http://www.gnu.org/software/grep/
sed|4.8|9.el9|b|1000|A GNU stream text editor|/usr/bin/sed|glibc|GPLv3+|Applications/Text|http://sed.sourceforge.net/
gawk|5.1.0|6.el9|b|2700|The GNU version of the AWK text processing utility|/usr/bin/gawk;/usr/bin/awk|glibc|GPLv3+ and GPL and LGPLv2+ and BSD|Applications/Text|http://www.gnu.org/software/gawk/gawk.html
findutils|4.8.0|6.el9|b|1800|The GNU versions of find utilities|/usr/bin/find;/usr/bin/xargs;/usr/bin/locate|glibc|GPLv3+|Applications/File|http://www.gnu.org/software/findutils/
less|590|2.el9_2|b|390|A text file browser similar to more, but better|/usr/bin/less|glibc|GPLv3+|Applications/Text|http://www.greenwoodsoftware.com/less/
vim-minimal|8.2.2637|20.el9_1|b|1500|A minimal version of the VIM editor|/usr/bin/vi;/usr/bin/vim;/etc/virc|glibc|Vim and MIT|Applications/Editors|http://www.vim.org/
vim-common|8.2.2637|20.el9_1|a|20500|The common files needed by any version of the VIM editor|/usr/share/vim/vim82/doc/help.txt;/etc/vimrc|glibc|Vim and MIT|Applications/Editors|http://www.vim.org/
vim-enhanced|8.2.2637|20.el9_1|a|1850|A version of the VIM editor which includes recent enhancements|/usr/bin/vimdiff;/usr/bin/vimtutor;/usr/bin/rvim|vim-common|Vim and MIT|Applications/Editors|http://www.vim.org/
nano|5.6.1|5.el9|b|1950|A small text editor|/usr/bin/nano;/etc/nanorc|glibc|GPLv3+|Applications/Editors|https://www.nano-editor.org
man-db|2.9.3|7.el9|b|2300|Tools for searching and reading man pages|/usr/bin/man;/usr/bin/apropos;/usr/bin/whatis;/usr/bin/mandb|glibc|GPLv2+ and GPLv3+|System Environment/Base|https://www.nongnu.org/man-db/
man-pages|5.10|8.el9|a|4400|Linux kernel and C library user-space interface documentation|/usr/share/man/man2/open.2.gz|glibc|GPL+ and GPLv2+ and BSD and MIT and Copyright only and IEEE|Documentation|http://www.kernel.org/doc/man-pages/
iproute|6.2.0|5.el9_3|b|2200|Advanced IP routing and network device configuration tools|/usr/sbin/ip;/usr/sbin/ss;/usr/sbin/tc|glibc|GPLv2+ and Public Domain|Applications/System|https://wiki.linuxfoundation.org/networking/iproute2
iputils|20210202|9.el9|b|390|Network monitoring tools including ping|/usr/bin/ping;/usr/bin/tracepath;/usr/sbin/arping|glibc|BSD and GPLv2+|System Environment/Daemons|https://github.com/iputils/iputils
bind-utils|9.16.23|14.el9_3|a|450|Utilities for querying DNS name servers|/usr/bin/dig;/usr/bin/host;/usr/bin/nslookup;/usr/bin/nsupdate|bind-libs|MPLv2.0|Applications/System|https://www.isc.org/downloads/bind/
bind-libs|9.16.23|14.el9_3|a|1200|Libraries used by the BIND DNS packages|/usr/lib64/libdns.so.1608|glibc|MPLv2.0|Applications/System|https://www.isc.org/downloads/bind/
net-tools|2.0|0.64.20160912git.el9|b|320|Basic networking tools|/usr/sbin/ifconfig;/usr/sbin/route;/usr/bin/netstat;/usr/sbin/arp|glibc|GPLv2+|System Environment/Base|http://sourceforge.net/projects/net-tools/
curl|7.76.1|26.el9_3.3|b|290|A utility for getting files from remote servers (FTP, HTTP, and others)|/usr/bin/curl|libcurl|MIT|Applications/Internet|https://curl.se/
libcurl|7.76.1|26.el9_3.3|b|290|A library for getting files from web servers|/usr/lib64/libcurl.so.4|glibc|MIT|System Environment/Libraries|https://curl.se/
wget|1.21.1|7.el9|a|3200|A utility for retrieving files using the HTTP or FTP protocols|/usr/bin/wget;/etc/wgetrc|glibc|GPLv3+|Applications/Internet|http://www.gnu.org/software/wget/
rsync|3.2.5|2.el9|b|1830|A program for synchronizing files over a network|/usr/bin/rsync;/usr/lib/systemd/system/rsyncd.service;/etc/rsyncd.conf|glibc|GPLv3+|Applications/Internet|https://rsync.samba.org/
tree|1.8.0|10.el9|b|110|File system tree viewer|/usr/bin/tree|glibc|GPLv2+|Applications/File|http://mama.indstate.edu/users/ice/tree/
tmux|3.2a|4.el9|a|1130|A terminal multiplexer|/usr/bin/tmux|libevent|ISC and BSD|Applications/System|https://tmux.github.io/
libevent|2.1.12|8.el9_4|b|300|Abstract asynchronous event notification library|/usr/lib64/libevent-2.1.so.7|glibc|BSD and ISC|System Environment/Libraries|http://libevent.org
htop|3.2.1|2.el9|a|390|Interactive process viewer|/usr/bin/htop|glibc|GPLv2+|Applications/System|https://htop.dev/
lsof|4.94.0|3.el9|b|420|A tool which lists open files|/usr/sbin/lsof|glibc|zlib and Sendmail and LGPLv2+|Development/Debuggers|https://github.com/lsof-org/lsof
strace|5.18|2.el9|a|1500|Tracks and displays system calls associated with a running process|/usr/bin/strace|glibc|BSD|Development/Debuggers|https://strace.io
tcpdump|4.99.0|7.el9|a|1250|A network traffic monitoring tool|/usr/sbin/tcpdump|glibc|BSD with advertising|Applications/Internet|http://www.tcpdump.org
nmap|7.92|3.el9|a|5400|Network exploration tool and security scanner|/usr/bin/nmap;/usr/bin/ncat|glibc|Nmap|Applications/System|https://nmap.org/
nmap-ncat|7.92|3.el9|a|670|Nmap's Netcat replacement|/usr/bin/nc;/usr/bin/ncat|glibc|Nmap|Applications/System|https://nmap.org/ncat/
telnet|0.17|85.el9|a|60|The client program for the telnet remote login protocol|/usr/bin/telnet|glibc|BSD|Applications/Internet|http://web.archive.org/web/20070819111735/www.hcs.harvard.edu/~dholland/computers/netkit.html
psmisc|23.4|3.el9|b|420|Utilities for managing processes on your system|/usr/bin/killall;/usr/bin/pstree;/usr/bin/fuser;/usr/bin/peekfd|glibc|GPLv2+|Applications/System|http://sourceforge.net/projects/psmisc/
sysstat|12.5.4|7.el9|a|1700|Collection of performance monitoring tools for Linux|/usr/bin/iostat;/usr/bin/sar;/usr/bin/mpstat;/etc/sysconfig/sysstat;/usr/lib/systemd/system/sysstat.service|glibc|GPLv2+|Applications/System|http://sebastien.godard.pagesperso-orange.fr/
iotop|0.6|25.el9|a|70|Top like utility for I/O|/usr/sbin/iotop|python3|GPLv2+|Applications/System|http://guichaz.free.fr/iotop/
logrotate|3.18.0|8.el9|b|130|Rotates, compresses, removes and mails system log files|/usr/sbin/logrotate;/etc/logrotate.conf;/etc/logrotate.d/;/usr/lib/systemd/system/logrotate.timer|glibc|GPL+|System Environment/Base|https://github.com/logrotate/logrotate
git|2.39.3|1.el9_3|a|145|Fast Version Control System|/usr/bin/git|git-core|GPLv2|Development/Tools|https://git-scm.com/
git-core|2.39.3|1.el9_3|a|13500|Core package of git with minimal functionality|/usr/libexec/git-core/git|glibc|GPLv2|Development/Tools|https://git-scm.com/
zip|3.0|35.el9|b|270|A file compression and packaging utility compatible with PKZIP|/usr/bin/zip|glibc|BSD|Applications/Archiving|http://www.info-zip.org/Zip.html
unzip|6.0|56.el9|b|370|A utility for unpacking zip files|/usr/bin/unzip|glibc|BSD|Applications/Archiving|http://www.info-zip.org/UnZip.html
bzip2|1.0.8|8.el9|b|90|A file compression utility|/usr/bin/bzip2|glibc|BSD|Applications/File|https://sourceware.org/bzip2/
xz|5.2.5|8.el9_0|b|650|LZMA compression utilities|/usr/bin/xz|glibc|GPLv2+|Applications/File|https://tukaani.org/xz/
bash-completion|2.11|5.el9|b|1000|Programmable completion for Bash|/usr/share/bash-completion/bash_completion|bash|GPLv2+|Unspecified|https://github.com/scop/bash-completion/
mlocate|0.26|20.el9|b|300|An utility for finding files by name|/usr/bin/locate;/usr/bin/updatedb|glibc|GPLv2|Applications/System|https://pagure.io/mlocate
plocate|1.1.15|1.el9|a|220|Locate files|/usr/bin/plocate|glibc|GPLv2+|Applications/System|https://plocate.sesse.net/
mailx|12.5|43.el9|a|600|Enhanced implementation of the mailx command|/usr/bin/mail;/usr/bin/mailx|glibc|BSD with advertising|Applications/Internet|http://heirloom.sourceforge.net/mailx.html
postfix|3.5.9|26.el9|a|4400|Postfix Mail Transport Agent|/usr/sbin/postfix;/etc/postfix/main.cf;/usr/lib/systemd/system/postfix.service|glibc|(IBM and) GPLv2+|System Environment/Daemons|http://www.postfix.org
httpd|2.4.57|5.el9|a|45|Apache HTTP Server|/usr/sbin/httpd;/usr/sbin/apachectl;/etc/httpd/conf/httpd.conf;/etc/httpd/conf.d/welcome.conf;/etc/httpd/conf.modules.d/00-base.conf;/var/www/html/;/var/www/cgi-bin/;/var/log/httpd/;/usr/lib/systemd/system/httpd.service|httpd-core,httpd-filesystem,mailcap|ASL 2.0|System Environment/Daemons|https://httpd.apache.org/
httpd-core|2.4.57|5.el9|a|1450|httpd minimal core|/usr/lib64/httpd/modules/mod_so.so|apr,glibc|ASL 2.0|System Environment/Daemons|https://httpd.apache.org/
httpd-filesystem|2.4.57|5.el9|a|10|The basic directory layout for the Apache HTTP server|/etc/httpd/conf.d/|setup|ASL 2.0|System Environment/Daemons|https://httpd.apache.org/
mailcap|2.1.49|5.el9|b|60|Helper application and MIME type associations for file types|/etc/mime.types|setup|Public Domain and MIT|System Environment/Base|
apr|1.7.0|11.el9|a|120|Apache Portable Runtime library|/usr/lib64/libapr-1.so.0|glibc|ASL 2.0 and BSD with advertising and ISC and BSD|System Environment/Libraries|https://apr.apache.org/
mod_ssl|2.4.57|5.el9|a|110|SSL/TLS module for the Apache HTTP Server|/etc/httpd/conf.d/ssl.conf;/usr/lib64/httpd/modules/mod_ssl.so|httpd,openssl|ASL 2.0|System Environment/Daemons|https://httpd.apache.org/
mod_php|8.0.30|1.el9|a|20|PHP module for the Apache HTTP Server|/usr/lib64/httpd/modules/libphp.so|httpd|PHP and Zend and BSD and MIT and ASL 1.0 and NCSA|Development/Languages|http://www.php.net/
nginx|1.20.1|14.el9_2.1|a|40|A high performance web server and reverse proxy server|/usr/sbin/nginx;/etc/nginx/nginx.conf;/etc/nginx/mime.types;/etc/nginx/default.d/;/usr/share/nginx/modules/;/usr/share/nginx/html/index.html;/usr/share/nginx/html/404.html;/usr/share/nginx/html/50x.html;/var/log/nginx/;/usr/lib/systemd/system/nginx.service|nginx-core,nginx-filesystem|BSD|System Environment/Daemons|https://nginx.org/
nginx-core|1.20.1|14.el9_2.1|a|585|nginx minimal core|/usr/lib64/nginx/modules/|glibc|BSD|System Environment/Daemons|https://nginx.org/
nginx-filesystem|1.20.1|14.el9_2.1|a|10|The basic directory layout for the Nginx server|/etc/nginx/conf.d/|setup|BSD|System Environment/Daemons|https://nginx.org/
vsftpd|3.0.5|5.el9|a|170|Very Secure Ftp Daemon|/usr/sbin/vsftpd;/etc/vsftpd/vsftpd.conf;/var/ftp/pub/;/usr/lib/systemd/system/vsftpd.service|glibc|GPLv2 with exceptions|System Environment/Daemons|https://security.appspot.com/vsftpd.html
mariadb-server|10.5.22|1.el9_2|a|17500|The MariaDB server and related files|/usr/libexec/mysqld;/usr/bin/mysql_install_db;/etc/my.cnf.d/mariadb-server.cnf;/var/lib/mysql/;/usr/lib/systemd/system/mariadb.service|mariadb,mariadb-common|GPLv2 with exceptions and LGPLv2 and BSD|Applications/Databases|http://mariadb.org
mariadb|10.5.22|1.el9_2|a|6400|A very fast and robust SQL database server|/usr/bin/mysql;/usr/bin/mariadb;/usr/bin/mysqldump|mariadb-common|GPLv2 with exceptions and LGPLv2 and BSD|Applications/Databases|http://mariadb.org
mariadb-common|10.5.22|1.el9_2|a|30|The shared files required by server and client|/etc/my.cnf;/etc/my.cnf.d/|setup|GPLv2 with exceptions and LGPLv2 and BSD|Applications/Databases|http://mariadb.org
postgresql-server|13.11|1.el9|a|5800|The programs needed to create and run a PostgreSQL server|/usr/bin/postgres;/usr/bin/postgresql-setup;/var/lib/pgsql/data/;/usr/lib/systemd/system/postgresql.service|postgresql|PostgreSQL|Applications/Databases|http://www.postgresql.org/
postgresql|13.11|1.el9|a|1650|PostgreSQL client programs|/usr/bin/psql;/usr/bin/pg_dump|glibc|PostgreSQL|Applications/Databases|http://www.postgresql.org/
nfs-utils|2.5.4|20.el9|b|1450|NFS utilities and supporting clients and daemons for the kernel NFS server|/usr/sbin/exportfs;/usr/sbin/showmount;/usr/sbin/mount.nfs;/usr/sbin/nfsstat;/etc/exports;/etc/nfs.conf;/usr/lib/systemd/system/nfs-server.service|libnfsidmap,rpcbind|MIT and GPLv2 and GPLv2+ and BSD|System Environment/Daemons|http://sourceforge.net/projects/nfs
libnfsidmap|2.5.4|20.el9|b|110|NFSv4 User and Group ID Mapping Library|/usr/lib64/libnfsidmap.so.1|glibc|BSD|System Environment/Libraries|http://www.citi.umich.edu/projects/nfsv4/linux/
rpcbind|1.2.6|5.el9|b|120|Universal Addresses to RPC Program Number Mapper|/usr/sbin/rpcbind;/usr/bin/rpcinfo|glibc|BSD|System Environment/Daemons|http://nfsv4.bullopensource.org
autofs|5.1.7|58.el9|b|1100|A tool for automatically mounting and unmounting filesystems|/usr/sbin/automount;/etc/auto.master;/etc/auto.misc;/etc/auto.net;/etc/autofs.conf;/etc/auto.master.d/;/usr/lib/systemd/system/autofs.service|nfs-utils|GPLv2+|System Environment/Daemons|http://www.kernel.org/pub/linux/daemons/autofs
cifs-utils|6.15|3.el9|b|180|Utilities for doing and managing mounts of the Linux CIFS filesystem|/usr/sbin/mount.cifs|glibc|GPLv3|System Environment/Daemons|http://linux-cifs.samba.org/cifs-utils/
samba|4.18.6|2.el9_3|b|2500|Server and Client software to interoperate with Windows machines|/usr/sbin/smbd;/etc/samba/smb.conf;/usr/lib/systemd/system/smb.service|samba-common|GPLv3+ and LGPLv3+|System Environment/Daemons|https://www.samba.org
samba-common|4.18.6|2.el9_3|b|180|Files used by both Samba servers and clients|/etc/samba/smb.conf|glibc|GPLv3+ and LGPLv3+|System Environment/Daemons|https://www.samba.org
policycoreutils-python-utils|3.6|2.1.el9|b|165|SELinux policy core python utilities|/usr/sbin/semanage;/usr/bin/audit2allow;/usr/bin/audit2why;/usr/sbin/semodule_package|policycoreutils|GPLv2|System Environment/Base|https://github.com/SELinuxProject/selinux
setroubleshoot-server|3.3.32|1.el9|a|1500|SELinux troubleshoot server|/usr/bin/sealert;/usr/sbin/setroubleshootd|policycoreutils-python-utils|GPLv2+|Applications/System|https://gitlab.com/setroubleshoot/setroubleshoot
setroubleshoot|3.3.32|1.el9|a|2100|Helps troubleshoot SELinux problems|/usr/bin/sealert|setroubleshoot-server|GPLv2+|Applications/System|https://gitlab.com/setroubleshoot/setroubleshoot
selinux-policy-devel|38.1.23|1.el9_3.2|a|700|SELinux policy development files|/usr/share/selinux/devel/policygentool|selinux-policy|GPLv2+|System Environment/Base|https://github.com/fedora-selinux/selinux-policy
podman|4.6.1|9.el9_3|a|40|Manage Pods, Containers and Container Images|/usr/bin/podman|conmon,crun|ASL 2.0 and BSD and ISC and MPLv2.0|System Environment/Base|https://podman.io/
buildah|1.31.3|1.el9_3|a|26000|A command line tool used for creating OCI Images|/usr/bin/buildah|glibc|ASL 2.0 and BSD and ISC and MPLv2.0|Applications/Text|https://github.com/containers/buildah
skopeo|1.13.3|1.el9_3|a|24000|Inspect container images and repositories on registries|/usr/bin/skopeo|glibc|ASL 2.0 and BSD and ISC and MPLv2.0|Applications/Text|https://github.com/containers/skopeo
conmon|2.1.7|1.el9|a|110|OCI container runtime monitor|/usr/bin/conmon|glibc|ASL 2.0|System Environment/Base|https://github.com/containers/conmon
crun|1.8.7|1.el9|a|420|OCI runtime implemented in C|/usr/bin/crun|glibc|GPLv2+|Applications/System|https://github.com/containers/crun
container-tools|1|1.el9|a|0|Meta-package for container tools||podman,buildah,skopeo|MIT|Unspecified|
cockpit|297|1.el9|b|130|Web Console for Linux servers|/usr/bin/cockpit-bridge;/etc/cockpit/;/usr/lib/systemd/system/cockpit.socket|glibc|LGPLv2+|Applications/System|https://cockpit-project.org/
stratisd|3.5.9|1.el9|a|2800|Daemon that manages block devices to create filesystems|/usr/libexec/stratisd;/usr/lib/systemd/system/stratisd.service|glibc|MPLv2.0|System Environment/Daemons|https://stratis-storage.github.io/
stratis-cli|3.5.5|1.el9|a|390|Command-line tool for interacting with the Stratis daemon|/usr/bin/stratis|python3|ASL 2.0|System Environment/Base|https://stratis-storage.github.io/
vdo|8.2.1.6|3.el9|a|610|Management tools for Virtual Data Optimizer|/usr/bin/vdo|glibc|GPLv2|System Environment/Base|http://github.com/dm-vdo/vdo
device-mapper-multipath|0.8.7|22.el9_3|b|370|Tools to manage multipath devices using device-mapper|/usr/sbin/multipath;/etc/multipath.conf|glibc|GPLv2|System Environment/Base|http://christophe.varoqui.free.fr/
iscsi-initiator-utils|6.2.1.6|1.git4b3e853.el9|b|1260|iSCSI daemon and utility programs|/usr/sbin/iscsiadm;/usr/sbin/iscsid;/etc/iscsi/initiatorname.iscsi|glibc|GPLv2+|System Environment/Daemons|http://www.open-iscsi.org
targetcli|2.1.57|2.el9|b|220|An administration shell for storage targets|/usr/bin/targetcli|python3|ASL 2.0|System Environment/Base|https://github.com/open-iscsi/targetcli-fb
openssl|3.0.7|27.el9|b|1450|Utilities from the general purpose cryptography library with TLS implementation|/usr/bin/openssl;/etc/pki/tls/openssl.cnf|openssl-libs|ASL 2.0|System Environment/Libraries|http://www.openssl.org/
openssl-libs|3.0.7|27.el9|b|7000|A general purpose cryptography library with TLS implementation|/usr/lib64/libssl.so.3|glibc|ASL 2.0|System Environment/Libraries|http://www.openssl.org/
gcc|11.4.1|2.1.el9|a|88|Various compilers (C, C++, Objective-C, ...)|/usr/bin/gcc|glibc|GPLv3+ and GPLv3+ with exceptions and GPLv2+ with exceptions and LGPLv2+ and BSD|Development/Languages|http://gcc.gnu.org
make|4.3|7.el9|b|1500|A GNU tool which simplifies the build process for users|/usr/bin/make|glibc|GPLv3+|Development/Tools|http://www.gnu.org/software/make/
kernel-devel|5.14.0|362.8.1.el9_3|a|18700|Development package for building kernel modules to match the kernel|/usr/src/kernels/5.14.0-362.8.1.el9_3.x86_64/Makefile|glibc|GPLv2 and Redistributable, no modification permitted|System Environment/Kernel|https://www.kernel.org/
java-17-openjdk|17.0.9.0.9|2.el9|a|1000|OpenJDK 17 Runtime Environment|/usr/lib/jvm/java-17-openjdk/bin/java|glibc|ASL 1.1 and ASL 2.0 and BSD and BSD with advertising and GPL+ and GPLv2 and GPLv2 with exceptions and IJG and LGPLv2+ and MIT and MPLv2.0 and Public Domain and W3C and zlib|Development/Languages|http://openjdk.java.net/
nodejs|18.18.2|2.module+el9.3.0+20250+bcb9b9bb|a|11000|JavaScript runtime|/usr/bin/node;/usr/bin/npm|glibc|MIT and ASL 2.0 and ISC and BSD|Development/Languages|http://nodejs.org/
php|8.0.30|1.el9|a|10|PHP scripting language for creating dynamic web sites|/usr/bin/php|glibc|PHP and Zend and BSD and MIT and ASL 1.0 and NCSA|Development/Languages|http://www.php.net/
perl|5.32.1|481.el9|a|75|Practical Extraction and Report Language|/usr/bin/perl|glibc|(GPL+ or Artistic) and (GPLv2+ or Artistic) and BSD and Public Domain and UCD|Development/Languages|https://www.perl.org/
ansible-core|2.14.9|2.el9|a|3500|SSH-based configuration management, deployment, and task execution system|/usr/bin/ansible;/usr/bin/ansible-playbook;/etc/ansible/ansible.cfg|python3|GPLv3+|Development/Languages|https://ansible.com/
expect|5.45.4|16.el9|a|520|A program-script interaction and testing utility|/usr/bin/expect|glibc|Public Domain|Development/Languages|http://expect.nist.gov/
lftp|4.9.2|4.el9|a|2500|A sophisticated file transfer program|/usr/bin/lftp|glibc|GPLv3+|Applications/Internet|https://lftp.yar.ru/
ftp|0.17|89.el9|a|90|The standard UNIX FTP client|/usr/bin/ftp|glibc|BSD with advertising|Applications/Internet|ftp://ftp.uk.linux.org/pub/linux/Networking/netkit
elinks|0.12|0.62.pre6.el9|e|1300|A text-mode Web browser|/usr/bin/elinks|glibc|GPLv2|Applications/Internet|http://elinks.or.cz/
lynx|2.8.9|20.el9|a|1500|A text-based Web browser|/usr/bin/lynx|glibc|GPLv2|Applications/Internet|http://lynx.invisible-island.net/
dos2unix|7.4.2|4.el9|a|220|Text file format converters|/usr/bin/dos2unix|glibc|BSD|Applications/Text|http://waterlan.home.xs4all.nl/dos2unix.html
ncurses|6.2|10.20210508.el9|b|1000|Ncurses support utilities|/usr/bin/clear;/usr/bin/tput|glibc|MIT|Applications/System|https://invisible-island.net/ncurses/ncurses.html
kexec-tools|2.0.26|8.el9|b|1100|The kexec/kdump userspace component|/usr/sbin/kexec;/usr/sbin/kdumpctl;/etc/kdump.conf|glibc|GPLv2|Applications/System|https://kernel.org/pub/linux/utils/kernel/kexec/
dracut|057|53.git20240104.el9|b|610|Initramfs generator using udev|/usr/bin/dracut|glibc|GPLv2+ and LGPLv2+|System Environment/Base|https://dracut.wiki.kernel.org/
grub2-tools|2.06|70.el9_3.2|b|7200|Support tools for GRUB|/usr/sbin/grub2-mkconfig;/usr/sbin/grub2-install;/usr/bin/grub2-editenv;/etc/default/grub|glibc|GPLv3+|System Environment/Base|http://www.gnu.org/software/grub/
grubby|8.40|63.el9|b|220|Command line tool for updating bootloader configurations|/usr/sbin/grubby|glibc|GPLv2+|Applications/System|https://github.com/rhboot/grubby
sos|4.6.1|1.el9|b|1800|A set of tools to gather troubleshooting information from a system|/usr/sbin/sosreport|python3|GPLv2+|Applications/System|https://github.com/sosreport/sos
subscription-manager|1.29.37|1.el9|b|3400|Tools and libraries for subscription and repository management|/usr/sbin/subscription-manager;/etc/rhsm/rhsm.conf|python3|GPLv2|System Environment/Base|http://www.candlepinproject.org/
dnf-plugins-core|4.3.0|11.el9|b|120|Core Plugins for DNF|/usr/bin/dnf-config-manager;/etc/dnf/plugins/|dnf|GPLv2+|Unspecified|https://github.com/rpm-software-management/dnf-plugins-core
yum-utils|4.3.0|11.el9|b|80|Utilities based around the yum package manager|/usr/bin/yum-config-manager;/usr/bin/yumdownloader|dnf-plugins-core|GPLv2+|Unspecified|https://github.com/rpm-software-management/dnf-plugins-core
createrepo_c|0.20.1|2.el9|a|110|Creates a common metadata repository|/usr/bin/createrepo_c|glibc|GPLv2+|Unspecified|https://github.com/rpm-software-management/createrepo_c
jq|1.6|14.el9|a|180|Command-line JSON processor|/usr/bin/jq|glibc|MIT|Applications/Text|https://stedolan.github.io/jq/
bc|1.07.1|14.el9|b|230|GNU's bc (a numeric processing language) and dc (a calculator)|/usr/bin/bc;/usr/bin/dc|glibc|GPLv3+|Applications/Engineering|http://www.gnu.org/software/bc/
pciutils|3.7.0|5.el9|b|180|PCI bus related utilities|/usr/sbin/lspci;/usr/sbin/setpci;/usr/sbin/update-pciids|glibc|GPLv2+|Applications/System|https://mj.ucw.cz/sw/pciutils/
usbutils|014|1.el9|b|150|Linux USB utilities|/usr/bin/lsusb;/usr/bin/usb-devices|glibc|GPLv2+|Applications/System|http://www.linux-usb.org/
lsscsi|0.32|6.el9|b|60|List SCSI devices (or hosts) and associated information|/usr/bin/lsscsi|glibc|GPLv2+|Applications/System|http://sg.danny.cz/scsi/lsscsi.html
hdparm|9.62|2.el9|b|140|A utility for displaying and/or setting hard disk parameters|/usr/sbin/hdparm|glibc|BSD|Applications/System|https://sourceforge.net/projects/hdparm/
smartmontools|7.2|9.el9|b|2200|Tools for monitoring SMART capable hard disks|/usr/sbin/smartctl;/usr/sbin/smartd;/etc/smartmontools/smartd.conf;/usr/lib/systemd/system/smartd.service|glibc|GPLv2+|System Environment/Base|https://www.smartmontools.org/
whois|5.5.13|2.el9|a|120|Improved WHOIS client|/usr/bin/whois;/usr/bin/mkpasswd|glibc|GPLv2+|Applications/Internet|https://github.com/rfc1036/whois
screen|4.8.0|6.el9|a|600|A screen manager that supports multiple logins on one terminal|/usr/bin/screen|glibc|GPLv3+|Applications/System|https://www.gnu.org/software/screen/
iperf3|3.9|10.el9|a|90|Measurement tool for TCP/UDP bandwidth performance|/usr/bin/iperf3|glibc|BSD|Applications/Internet|http://software.es.net/iperf/
wireshark-cli|3.4.10|6.el9|a|6900|Network traffic analyzer (CLI)|/usr/bin/tshark|glibc|GPL+|Applications/Internet|http://www.wireshark.org/
flatpak|1.12.7|4.el9|a|1700|Application deployment framework for desktop apps|/usr/bin/flatpak;/etc/flatpak/remotes.d/|glibc|LGPLv2+|Unspecified|https://flatpak.org/
`;
        const repoOf = { b: 'baseos', a: 'appstream', e: 'extras' };
        for (const line of T.split('\n')) {
            if (!line.trim()) continue;
            const f = line.split('|');
            const files = (f[6] || '').split(';').filter(Boolean);
            this.cat[f[0]] = { name: f[0], ver: f[1], rel: f[2], repo: repoOf[f[3]], size: parseInt(f[4], 10) * 1024, summary: f[5], files, req: (f[7] || '').split(',').filter(Boolean), license: f[8], group: f[9], url: f[10] || '' };
        }
        this.updates = { openssl: { ver: '3.0.7', rel: '28.el9_4', repo: 'baseos' }, 'openssl-libs': { ver: '3.0.7', rel: '28.el9_4', repo: 'baseos' }, curl: { ver: '7.76.1', rel: '29.el9_4', repo: 'baseos' }, libcurl: { ver: '7.76.1', rel: '29.el9_4', repo: 'baseos' }, kernel: { ver: '5.14.0', rel: '427.13.1.el9_4', repo: 'baseos' }, sudo: { ver: '1.9.5p2', rel: '10.el9_3.1', repo: 'baseos' } };
        // package metadata that goes beyond the table
        const extra = {
            httpd: { units: ['httpd'], users: [{ n: 'apache', id: 48, home: '/usr/share/httpd', c: 'Apache' }] },
            nginx: { units: ['nginx'], users: [{ n: 'nginx', id: 991, home: '/var/lib/nginx', c: 'Nginx web server' }] },
            vsftpd: { units: ['vsftpd'] },
            'mariadb-server': { units: ['mariadb'], users: [{ n: 'mysql', id: 27, home: '/var/lib/mysql', c: 'MySQL server' }] },
            'postgresql-server': { units: ['postgresql'], users: [{ n: 'postgres', id: 26, home: '/var/lib/pgsql', c: 'PostgreSQL Server', shell: '/bin/bash' }] },
            'nfs-utils': { units: ['nfs-server'], users: [{ n: 'nfsnobody', id: 65534, home: '/var/lib/nfs', c: 'Anonymous NFS User', skip: true }] },
            autofs: { units: ['autofs'] },
            chrony: { units: ['chronyd'], users: [{ n: 'chrony', id: 992, home: '/var/lib/chrony', c: '' }] },
            tuned: { units: ['tuned'] }, audit: { units: ['auditd'] }, rsyslog: { units: ['rsyslog'] }, cronie: { units: ['crond'] }, at: { units: ['atd'] },
            firewalld: { units: ['firewalld'] }, 'openssh-server': { units: ['sshd'], users: [{ n: 'sshd', id: 74, home: '/usr/share/empty.sshd', c: 'Privilege-separated SSH' }] }, NetworkManager: { units: ['NetworkManager'] },
            postfix: { units: ['postfix'], users: [{ n: 'postfix', id: 89, home: '/var/spool/postfix', c: '' }] },
            samba: { units: ['smb'] }, cockpit: { units: [] },
            stratisd: { units: ['stratisd'] }
        };
        for (const [k, v] of Object.entries(extra)) if (this.cat[k]) Object.assign(this.cat[k], v);
        this.protectedPkgs = new Set(['systemd', 'dnf', 'rpm', 'glibc', 'bash', 'kernel', 'coreutils', 'filesystem', 'setup', 'basesystem', 'sudo', 'shadow-utils', 'util-linux', 'python3']);
        this.groups = {
            'Development Tools': { desc: 'A basic development environment.', mand: ['make', 'gcc'], def: ['git', 'perl'], opt: ['strace', 'tcpdump'] },
            'Basic Web Server': { desc: 'These tools allow you to run a Web server on the system.', mand: ['httpd'], def: ['mod_ssl'], opt: ['php', 'mod_php'] },
            'Container Management': { desc: 'Tools for managing Linux containers', mand: ['podman'], def: ['buildah', 'skopeo'], opt: [] },
            'Network Servers': { desc: 'These packages include network-based servers such as DHCP, Kerberos and NIS.', mand: [], def: ['nfs-utils', 'vsftpd'], opt: ['samba'] },
            'System Tools': { desc: 'This group is a collection of various tools for the system, such as the client for connecting to SMB shares and tools to monitor network traffic.', mand: [], def: ['rsync', 'tmux', 'cifs-utils'], opt: ['nmap', 'tcpdump', 'lftp', 'iotop'] },
            'Security Tools': { desc: 'Security tools for integrity and trust verification.', mand: [], def: ['setroubleshoot'], opt: [] },
            'Headless Management': { desc: 'Tools for managing the system without a graphical interface.', mand: [], def: ['cockpit'], opt: ['ansible-core'] },
            'Legacy UNIX Compatibility': { desc: 'Compatibility programs for migration from or working with legacy UNIX environments.', mand: [], def: ['telnet', 'ftp'], opt: ['expect'] },
            'Minimal Install': { desc: 'Basic functionality.', mand: [], def: [], opt: [], env: true },
            'Server': { desc: 'An integrated, easy-to-manage server.', mand: [], def: ['tuned', 'chrony'], opt: [], env: true },
            'Server with GUI': { desc: 'An integrated, easy-to-manage server with a graphical interface.', mand: [], def: [], opt: [], env: true }
        };
    }

    _moduleDefs() {
        return {
            nodejs: { streams: ['18', '20'], def: '18', profiles: 'common [d], development, minimal, s2i', summary: 'Javascript runtime', pkgs: { 18: ['nodejs'], 20: ['nodejs'] } },
            php: { streams: ['8.1'], def: '8.1', profiles: 'common [d], devel, minimal', summary: 'PHP scripting language', pkgs: { '8.1': ['php'] } },
            ruby: { streams: ['3.1'], def: '3.1', profiles: 'common [d]', summary: 'An interpreter of object-oriented scripting language', pkgs: {} },
            mariadb: { streams: ['10.11'], def: '10.11', profiles: 'client, galera, server [d]', summary: 'MariaDB Module', pkgs: { '10.11': ['mariadb-server'] } },
            postgresql: { streams: ['15', '16'], def: '15', profiles: 'client, server [d]', summary: 'PostgreSQL server and client module', pkgs: { 15: ['postgresql-server'], 16: ['postgresql-server'] } },
            nginx: { streams: ['1.22', '1.24'], def: '1.22', profiles: 'common [d]', summary: 'nginx webserver', pkgs: { '1.22': ['nginx'], '1.24': ['nginx'] } },
            'python39': { streams: ['3.9'], def: '3.9', profiles: 'build, common [d]', summary: 'Python programming language, version 3.9', pkgs: {} },
            'maven': { streams: ['3.8'], def: '3.8', profiles: 'common [d]', summary: 'Java project management and project comprehension tool', pkgs: {} }
        };
    }

    _seedInstalled() {
        const base = ['bash', 'coreutils', 'glibc', 'filesystem', 'setup', 'basesystem', 'systemd', 'kernel', 'dnf', 'rpm', 'python3', 'sudo', 'shadow-utils', 'util-linux', 'procps-ng', 'openssh', 'openssh-clients', 'openssh-server', 'NetworkManager', 'firewalld', 'firewalld-filesystem', 'chrony', 'rsyslog', 'cronie', 'cronie-anacron', 'at', 'selinux-policy', 'selinux-policy-targeted', 'policycoreutils', 'libselinux-utils', 'audit', 'tuned', 'lvm2', 'xfsprogs', 'e2fsprogs', 'parted', 'tar', 'gzip', 'grep', 'sed', 'gawk', 'findutils', 'less', 'vim-minimal', 'nano', 'man-db', 'iproute', 'iputils', 'curl', 'libcurl', 'logrotate', 'bzip2', 'xz', 'zip', 'unzip', 'mlocate', 'openssl', 'openssl-libs', 'ncurses', 'kexec-tools', 'dracut', 'grub2-tools', 'grubby', 'sos', 'subscription-manager', 'dnf-plugins-core', 'net-tools', 'rsync', 'mailcap', 'tree', 'psmisc', 'pciutils', 'usbutils', 'bash-completion'];
        const t0 = new Date(Date.now() - 90 * 86400000);
        for (const n of base) if (this.cat[n]) this.installed[n] = { date: t0, reason: 'user', repo: 'anaconda', ver: this.cat[n].ver, rel: this.cat[n].rel };
        // packages the lab starts with (legacy list: httpd, vim)
        for (const n of ['httpd', 'httpd-core', 'httpd-filesystem', 'apr', 'vim-common', 'vim-enhanced']) this.installed[n] = { date: t0, reason: n === 'httpd' || n === 'vim-enhanced' ? 'user' : 'dep', repo: 'anaconda', ver: this.cat[n].ver, rel: this.cat[n].rel };
        this.installed.kernel.ver = '5.14.0'; this.installed.kernel.rel = '362.8.1.el9_3';
        this.history = [{ id: 1, cmd: '', date: t0, user: 'System <unset>', actions: 'Install', altered: Object.keys(this.installed).length, items: [] }];
        this._syncLegacy();
    }

    _syncLegacy() {
        const arr = this.shared.installedPackages;
        if (!Array.isArray(arr)) return;
        arr.length = 0;
        for (const n of Object.keys(this.installed)) arr.push(n);
        if (this.shared.availablePackages && Array.isArray(this.shared.availablePackages)) {
            this.shared.availablePackages.length = 0;
            for (const n of Object.keys(this.cat)) if (!this.installed[n]) this.shared.availablePackages.push(n);
        }
    }

    _seedFiles() {
        // standard repo files and dnf.conf
        this._write('/etc/yum.repos.d/rhel.repo', '[rhel-9-for-x86_64-baseos-rpms]\nname=Red Hat Enterprise Linux 9 for x86_64 - BaseOS (RPMs)\nbaseurl=https://cdn.redhat.com/content/dist/rhel9/$releasever/x86_64/baseos/os\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n\n[rhel-9-for-x86_64-appstream-rpms]\nname=Red Hat Enterprise Linux 9 for x86_64 - AppStream (RPMs)\nbaseurl=https://cdn.redhat.com/content/dist/rhel9/$releasever/x86_64/appstream/os\nenabled=1\ngpgcheck=1\ngpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release\n');
        this._write('/etc/dnf/dnf.conf', '[main]\ngpgcheck=1\ninstallonly_limit=3\nclean_requirements_on_remove=True\nbest=True\nskip_if_unavailable=False\n', true);
        this._write('/etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release', '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBEuWpjMBEAC...\n-----END PGP PUBLIC KEY BLOCK-----\n', true);
        // content.example.com (lab classroom) resolves like the other lab hosts
        if (this.shared.net && this.shared.net.zone) {
            const z = this.shared.net.zone;
            for (const h of ['content.example.com', 'classroom.example.com', 'repo.example.com']) z[h] = Object.assign(z[h] || {}, { A: ['192.168.1.254'] });
        }
    }

    // ===== small helpers =====
    _ok(stdout = '') { return { stdout, stderr: '', exitCode: 0 }; }
    _err(stderr, exitCode = 1) { return { stdout: '', stderr, exitCode }; }
    _isRoot() { return this.fs.currentUid === 0; }
    _node(p) { return this.fs.getNode(p); }
    _tm() { return this.shared.timeCmds; }
    _now() { const tm = this._tm(); return tm ? tm.now() : new Date(); }
    _fmt(d, f) { const tm = this._tm(); return tm ? tm.format(d, tm.tm.tz, f) : d.toISOString(); }
    get parent() { return this.shared.parent; }

    _write(path, content, onlyMissing) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        let cur = this.fs.fs['/'];
        for (const p of parts) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
        if (onlyMissing && cur.children[name]) return;
        cur.children[name] = { type: 'file', permissions: /\/(s?bin|libexec)\//.test(path) ? '0755' : '0644', owner: 'root', group: 'root', size: content.length, modified: new Date(), content };
    }

    _mkdirs(path) {
        let cur = this.fs.fs['/'];
        for (const p of path.split('/').filter(Boolean)) {
            if (!cur.children[p]) cur.children[p] = { type: 'directory', permissions: '0755', owner: 'root', group: 'root', size: 4096, modified: new Date(), children: {} };
            cur = cur.children[p];
        }
    }

    _rmNode(path) {
        const parent = this._node(this.fs.getParentPath(path));
        if (parent && parent.children) delete parent.children[this.fs.getBasename(path)];
    }

    _nevra(n, withArch = true) { const e = this.cat[n]; const i = this.installed[n]; const ver = i ? i.ver : e.ver, rel = i ? i.rel : e.rel; return `${n}-${ver}-${rel}${withArch ? '.' + this._arch(n) : ''}`; }
    _arch(n) { return /^(basesystem|filesystem|setup|mailcap|container-tools|python3-.*|man-pages|selinux-policy.*|firewalld-filesystem|httpd-filesystem|nginx-filesystem|bash-completion|mariadb-common|samba-common|sos|tuned|setroubleshoot.*|policycoreutils-python-utils|ansible-core|dos2unix|createrepo_c|dnf-plugins-core|yum-utils|subscription-manager|stratis-cli|targetcli|dnf|iotop|selinux-policy-devel)$/.test(n) ? 'noarch' : 'x86_64'; }
    _size(b) { if (b >= 1048576) return (b / 1048576).toFixed(1) + ' M'; if (b >= 1024) return Math.round(b / 1024) + ' k'; return b + ' '; }
    _sizeB(b) { return this._size(b); }

    // ===== repositories =====
    _repos() {
        const out = [];
        const dir = this._node('/etc/yum.repos.d');
        if (!dir || !dir.children) return out;
        for (const f of Object.keys(dir.children).sort()) {
            const n = dir.children[f];
            if (n.type !== 'file' || !f.endsWith('.repo')) continue;
            let cur = null;
            for (const raw of (n.content || '').split('\n')) {
                const l = raw.trim();
                if (!l || l[0] === '#' || l[0] === ';') continue;
                const m = /^\[(.+)\]$/.exec(l);
                if (m) { cur = { id: m[1], file: f, name: m[1], enabled: true, gpgcheck: true, baseurl: '', mirrorlist: '', metalink: '', gpgkey: '' }; out.push(cur); continue; }
                const kv = /^([^=]+?)\s*=\s*(.*)$/.exec(l);
                if (kv && cur) {
                    const k = kv[1].toLowerCase();
                    if (k === 'enabled') cur.enabled = kv[2] === '1' || kv[2].toLowerCase() === 'true';
                    else if (k === 'gpgcheck') cur.gpgcheck = kv[2] === '1' || kv[2].toLowerCase() === 'true';
                    else if (['name', 'baseurl', 'mirrorlist', 'metalink', 'gpgkey'].includes(k)) cur[k] = kv[2];
                }
            }
        }
        return out;
    }

    _repoStatus(r) {
        const url = (r.baseurl || '').split(/[\s,]+/).filter(Boolean)[0] || '';
        const nm = this.shared.net;
        const netFail = (host, scheme) => {
            if (!nm) return null;
            const res = nm._getaddr(host);
            if (res.err === 'nxdomain') return `Curl error (6): Couldn't resolve host name for ${scheme}://${host}/repodata/repomd.xml [Could not resolve host: ${host}]`;
            if (res.err) return `Curl error (6): Couldn't resolve host name for ${scheme}://${host}/repodata/repomd.xml [Could not resolve host: ${host}]`;
            if (!nm._routeFor(res.ip)) return `Curl error (7): Couldn't connect to server for ${scheme}://${host}/repodata/repomd.xml [Failed to connect to ${host} port ${scheme === 'https' ? 443 : 80} after 0 ms: Network is unreachable]`;
            return null;
        };
        if (!url && !r.mirrorlist && !r.metalink) return { err: `Repository '${r.id}' has no mirror or baseurl set.` , fatal: true };
        if (url.startsWith('file://')) {
            const p = url.slice(7).replace(/\$\w+/g, '9') || '/';
            const stM = this.shared.storage;
            if (stM && stM.stMounts && stM.stMounts.some(m => m.tgt !== '/' && (p === m.tgt || p.startsWith(m.tgt + '/')))) return { ok: true, local: true };
            const n = this._node(p);
            if (!n || n.type !== 'directory') return { err: `Curl error (37): Couldn't read a file:// file for file://${p}/repodata/repomd.xml [Couldn't open file ${p}/repodata/repomd.xml]` };
            const st = this.shared.storage;
            const hasRepodata = n.children && n.children.repodata;
            const mounted = st && st.stMounts && st.stMounts.some(m => p === m.tgt || p.startsWith(m.tgt + '/'));
            if (!hasRepodata && !mounted && Object.keys(n.children || {}).length === 0) return { err: `Curl error (37): Couldn't read a file:// file for file://${p}/repodata/repomd.xml [Couldn't open file ${p}/repodata/repomd.xml]` };
            return { ok: true, local: true };
        }
        const m = /^(https?|ftp):\/\/([^/:]+)/.exec(url || r.mirrorlist || r.metalink);
        if (m) { const e = netFail(m[2], m[1]); if (e) return { err: e }; }
        else if (url) return { err: `Cannot prepare internal mirrorlist: Curl error (1): Unsupported protocol for ${url}` };
        if (/cdn\.redhat\.com/.test(url)) return { ok: true, rh: true };
        return { ok: true };
    }

    // returns { repos: [...usable], errors: [] } and healthy repo-id lookup by catalog repo key
    _repoCheck() {
        const repos = this._repos().filter(r => r.enabled);
        const errors = [];
        const usable = [];
        for (const r of repos) {
            const s = this._repoStatus(r);
            if (s.ok) { usable.push(Object.assign({}, r, { rh: !!s.rh })); } else errors.push({ repo: r, msg: s.err });
        }
        return { enabled: repos, usable, errors };
    }

    // repo serving a given catalog package, or null
    _repoFor(pkg, chk) {
        const key = this.cat[pkg] ? this.cat[pkg].repo : 'appstream';
        const norm = (r) => (r.id + ' ' + r.name).toLowerCase().replace(/[^a-z]/g, '');
        const word = { baseos: 'baseos', appstream: 'appstream', extras: 'extras' }[key];
        let generic = null;
        for (const r of chk.usable) {
            const nm = norm(r);
            if (nm.includes(word)) return r;
            if (!/baseos|appstream|extras|crb|codeready|supplementary|highavailability|resilient|debug|source|epel/.test(nm)) generic = generic || r;
        }
        return generic;
    }

    _metaLine() {
        const age = Math.floor((this._now().getTime() - this.metaBase) / 1000);
        const m = Math.floor(age / 60), s = age % 60;
        return `Last metadata expiration check: ${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')} ago on ${this._fmt(new Date(this.metaBase), '%a %d %b %Y %I:%M:%S %p %Z')}.`;
    }

    // run the repo health check; returns { err } or { chk }
    _needRepos(opts) {
        const chk = this._repoCheck();
        if (!chk.enabled.length) return { err: this._err('Error: There are no enabled repositories in "/etc/yum.repos.d", "/etc/yum/repos.d", "/etc/distro.repos.d".', 1) };
        if (chk.errors.length) {
            const L = [];
            for (const e of chk.errors) L.push(`Errors during downloading metadata for repository '${e.repo.id}':\n  - ${e.msg}`);
            const e = chk.errors[0];
            L.push(`Error: Failed to download metadata for repo '${e.repo.id}': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried`);
            return { err: { stdout: '', stderr: L.join('\n'), exitCode: 1 } };
        }
        if (!this._metaFresh) { this._metaFresh = true; this.metaBase = this._now().getTime() - 83000; }
        return { chk };
    }

    // ===== resolving requests =====
    _globToRe(p) { return new RegExp('^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'); }

    _parseSpec(spec) {
        // name, name-ver, name-ver-rel, name.arch
        let s = spec;
        s = s.replace(/\.(x86_64|noarch|i686|src)$/, '');
        if (this.cat[s]) return this.cat[s].name;
        const m = /^(.*?)-(\d[^-]*)(?:-(.*))?$/.exec(s);
        if (m && this.cat[m[1]]) {
            const e = this.cat[m[1]];
            if (e.ver === m[2] && (!m[3] || e.rel === m[3])) return e.name;
        }
        return null;
    }

    _byProvides(spec) {
        const hits = [];
        const isPath = spec.startsWith('/') || spec.startsWith('*/');
        const re = this._globToRe(spec);
        for (const e of Object.values(this.cat)) {
            if (isPath) { if (e.files.some(f => re.test(f))) hits.push(e.name); }
        }
        return hits;
    }

    _resolve(specs, chk) {
        // returns { pkgs:[names], notfound:[spec], rpmFiles:[node], groups:[] }
        const pkgs = [], notfound = [], files = [], groups = [];
        for (const sp of specs) {
            if (sp.startsWith('@')) { groups.push(sp.slice(1)); continue; }
            if (/\.rpm$/.test(sp)) {
                const n = this._node(this.fs.resolvePath(sp));
                if (!n || !n.rpm) { notfound.push(sp); continue; }
                files.push({ path: this.fs.resolvePath(sp), node: n });
                continue;
            }
            if (/[*?]/.test(sp) && !sp.startsWith('/') && !sp.startsWith('*/')) {
                const re = this._globToRe(sp);
                const m = Object.keys(this.cat).filter(n => re.test(n) && this._repoFor(n, chk));
                if (!m.length) notfound.push(sp); else pkgs.push(...m);
                continue;
            }
            let name = this._parseSpec(sp);
            if (!name && (sp.startsWith('/') || sp.startsWith('*/'))) { const h = this._byProvides(sp); if (h.length) name = h[0]; }
            if (!name && !sp.includes('/')) { const h = this._byProvides('*/' + sp); const bin = h.find(n => this.cat[n].files.some(f => f === '/usr/bin/' + sp || f === '/usr/sbin/' + sp)); if (bin && false) name = bin; }
            if (name && this._repoFor(name, chk) || (name && this.installed[name])) pkgs.push(name); else notfound.push(sp);
        }
        return { pkgs: [...new Set(pkgs)], notfound, files, groups };
    }

    // ===== install / remove planning =====
    _depClosure(names) {
        const out = [];
        const seen = new Set(Object.keys(this.installed));
        const walk = (n, asDep) => {
            if (seen.has(n)) return;
            const e = this.cat[n];
            if (!e) return;
            for (const d of e.req) walk(d, true);
            if (seen.has(n)) return;
            seen.add(n);
            out.push({ name: n, dep: asDep });
        };
        for (const n of names) walk(n, false);
        return out;
    }

    _dependents(n) { return Object.keys(this.installed).filter(x => this.cat[x] && this.cat[x].req.includes(n)); }

    _fmtTable(rows, hdr) {
        // rows of [name, arch, version, repo, size]
        const w = [Math.max(7, ...rows.map(r => r[0].length)) + 1, 13, Math.max(7, ...rows.map(r => r[2].length)) + 1, Math.max(10, ...rows.map(r => r[3].length)) + 1, 6];
        const total = 80;
        const sep = '='.repeat(total);
        const head = ` ${'Package'.padEnd(w[0])}${'Architecture'.padEnd(w[1])}${'Version'.padEnd(w[2])}${'Repository'.padEnd(w[3])}${'Size'.padStart(w[4])}`;
        return { sep, head, fmt: (r) => ` ${r[0].padEnd(w[0])}${r[1].padEnd(w[1])}${r[2].padEnd(w[2])}${r[3].padEnd(w[3])}${r[4].padStart(w[4])}` };
    }

    _prompt(assumeYes, assumeNo) {
        if (assumeYes) return 'y';
        if (assumeNo) return 'n';
        const cfg = (this._node('/etc/dnf/dnf.conf') || {}).content || '';
        if (/^assumeyes\s*=\s*(1|True|yes)/mi.test(cfg)) return 'y';
        const sh = typeof window !== 'undefined' && window.terminal && window.terminal.getShell ? window.terminal.getShell() : null;
        if (!sh) return null;
        return sh.takeInput({ mode: 'line', prompt: 'Is this ok [y/N]: ' });
    }

    // ===== users, units, files =====
    _asRoot(fn) {
        const s = { u: this.fs.currentUser, uid: this.fs.currentUid, gid: this.fs.currentGid };
        this.fs.currentUser = 'root'; this.fs.currentUid = 0; this.fs.currentGid = 0;
        try { return fn(); } finally { this.fs.currentUser = s.u; this.fs.currentUid = s.uid; this.fs.currentGid = s.gid; }
    }

    _materialize(n) {
        const e = this.cat[n];
        for (const f of e.files) {
            if (f.endsWith('/')) { this._mkdirs(f); continue; }
            if (this._node(f)) continue;
            let content = '';
            if (PKG_CONTENT[f] !== undefined) content = PKG_CONTENT[f];
            else if (/\/(s?bin|libexec)\//.test(f) && !/\.so/.test(f)) content = `#!/bin/sh\necho "${f.split('/').pop()}: installed by ${n} (this program is not simulated in Red Cat)"\n`;
            else if (/^\/etc\//.test(f) || /\.(conf|cfg|cnf)$/.test(f)) content = `# ${f.split('/').pop()} - ${e.summary}\n`;
            this._write(f, content);
        }
        for (const f of e.files) { const node = this._node(f); if (node && node.type === 'file' && node.pkgOrig === undefined) node.pkgOrig = node.content; }
        for (const u of (e.users || [])) if (!u.skip && !this.fs.users[u.n]) {
            this._asRoot(() => {
                try { this.parent.groupadd(['-r', '-g', String(u.id), u.n]); } catch (er) { /* group exists */ }
                try { this.parent.useradd(['-r', '-u', String(u.id), '-g', String(u.id), '-d', u.home, '-s', u.shell || '/sbin/nologin', '-c', u.c, u.n]); } catch (er) { /* user exists */ }
            });
        }
        for (const u of (e.units || [])) {
            const path = `/usr/lib/systemd/system/${u}.service`;
            if (!this._node(path)) this._write(path, `[Unit]\nDescription=${e.summary}\nAfter=network.target\n\n[Service]\nType=simple\nExecStart=/usr/sbin/${u}\n\n[Install]\nWantedBy=multi-user.target\n`);
        }
    }

    _dematerialize(n) {
        const e = this.cat[n];
        const warns = [];
        for (const u of (e.units || [])) {
            const S = this.shared.services[u];
            if (S && S.active && this.shared.svc && this.shared.svc._svKillProcs) { try { this.shared.svc._svKillProcs(u); } catch (er) { /* ignore */ } S.active = false; }
            if (S) S.enabled = false;
            this._rmNode(`/usr/lib/systemd/system/${u}.service`);
        }
        for (const f of e.files) {
            if (f.endsWith('/')) continue;
            const node = this._node(f);
            if (!node) continue;
            const isConf = /^\/etc\//.test(f);
            if (isConf && node.pkgOrig !== undefined && node.content !== node.pkgOrig) {
                this._write(f + '.rpmsave', node.content);
                warns.push(`warning: ${f} saved as ${f}.rpmsave`);
            }
            this._rmNode(f);
        }
        return warns;
    }

    // ===== transaction runner =====
    _runTransaction(kind, plan, opts, label) {
        const out = [];
        const n = plan.items.length;
        const verb = { install: 'Installing', remove: 'Erasing', upgrade: 'Upgrading', reinstall: 'Reinstalling' };
        out.push('Running transaction check', 'Transaction check succeeded.', 'Running transaction test', 'Transaction test succeeded.', 'Running transaction');
        out.push(`  Preparing        :${' '.repeat(54)}1/1`);
        const idx = (i) => `${i}/${n}`.padStart(8);
        const items = plan.items;
        let i = 0;
        const line = (a, b, k) => `  ${a.length >= 16 ? a + ':' : a.padEnd(16) + ':'} ${b}`.padEnd(77) + k;
        const warnings = [];
        for (const it of items) {
            i++;
            const nv = it.nevra;
            if (kind === 'remove') out.push(line('Erasing', nv, idx(i)));
            else out.push(line(kind === 'upgrade' ? 'Upgrading' : kind === 'reinstall' ? 'Reinstalling' : 'Installing', nv, idx(i)));
        }
        const scr = items.filter(it => (this.cat[it.name].units || []).length || (this.cat[it.name].users || []).length);
        for (const it of scr) out.push(line('Running scriptlet', it.nevra, idx(items.indexOf(it) + 1)));
        i = 0;
        for (const it of items) { i++; out.push(line(kind === 'remove' ? 'Verifying' : 'Verifying', it.nevra, idx(i))); }
        return { out, warnings };
    }

    dnf(argsIn) {
        let args = argsIn.slice();
        const opt = { yes: false, no: false, quiet: false, best: true, nogpg: false, enable: [], disable: [], skip: false, allowerasing: false, security: false, installroot: null, releasever: null, setopt: [] };
        const rest = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-y' || a === '--assumeyes') opt.yes = true;
            else if (a === '--assumeno') opt.no = true;
            else if (a === '-q' || a === '--quiet') opt.quiet = true;
            else if (a === '--nogpgcheck') opt.nogpg = true;
            else if (a === '--enablerepo') opt.enable.push(args[++i]);
            else if (a.startsWith('--enablerepo=')) opt.enable.push(a.slice(13));
            else if (a === '--disablerepo') opt.disable.push(args[++i]);
            else if (a.startsWith('--disablerepo=')) opt.disable.push(a.slice(14));
            else if (a === '--allowerasing') opt.allowerasing = true;
            else if (a === '--skip-broken' || a === '--skip-unavailable') opt.skip = true;
            else if (a === '--security') opt.security = true;
            else if (a === '-C' || a === '--cacheonly' || a === '-v' || a === '--verbose' || a === '-4' || a === '-6' || a === '--refresh' || a === '--best' || a === '--nobest' || a === '-e' || a === '--noplugins') { if (a === '-e') i++; }
            else if (a === '--releasever' || a === '--installroot' || a === '--setopt' || a === '--exclude' || a === '-x' || a === '--repo' || a === '--destdir' || a === '--downloaddir' || a === '--repoid') { rest.push(a, args[++i]); }
            else rest.push(a);
        }
        if (!rest.length) return this._ok(`usage: dnf [options] COMMAND\n\nList of Main Commands:\n\nalias                     List or create command aliases\nautoremove                remove all unneeded packages that were originally installed as dependencies\ncheck                     check for problems in the packagedb\ncheck-update              check for available package upgrades\nclean                     remove cached data\ndeplist                   [deprecated] List package's dependencies and what packages provide them\ndistro-sync               synchronize installed packages to the latest available versions\ndowngrade                 Downgrade a package\ngroup                     display, or use, the groups information\nhelp                      display a helpful usage message\nhistory                   display, or use, the transaction history\ninfo                      display details about a package or group of packages\ninstall                   install a package or packages on your system\nlist                      list a package or groups of packages\nmakecache                 generate the metadata cache\nmark                      mark or unmark installed packages as installed by user.\nmodule                    Interact with Modules.\nprovides                  find what package provides the given value\nreinstall                 reinstall a package\nremove                    remove a package or packages from your system\nrepolist                  display the configured software repositories\nrepoquery                 search for packages matching keyword\nsearch                    search package details for the given string\nupdate                    upgrade a package or packages on your system\nupgrade                   upgrade a package or packages on your system`);
        const cmd = rest[0];
        const tail = rest.slice(1);
        const rootOnly = ['install', 'remove', 'erase', 'upgrade', 'update', 'reinstall', 'autoremove', 'downgrade', 'distro-sync', 'group', 'groupinstall', 'groupremove', 'module', 'history', 'mark', 'config-manager', 'clean', 'makecache', 'download'];
        const needRoot = ['install', 'remove', 'erase', 'upgrade', 'update', 'reinstall', 'autoremove', 'downgrade', 'distro-sync', 'groupinstall', 'groupremove', 'mark'];
        const sub0 = tail[0];
        const isMut = needRoot.includes(cmd) || (cmd === 'group' && ['install', 'remove', 'erase', 'upgrade', 'update'].includes(sub0)) || (cmd === 'module' && ['enable', 'disable', 'reset', 'install', 'remove', 'update'].includes(sub0)) || (cmd === 'history' && ['undo', 'redo', 'rollback'].includes(sub0)) || cmd === 'config-manager' && !tail.includes('--dump');
        if (isMut && !this._isRoot()) return this._err('Error: This command has to be run with superuser privileges (under the root user on most systems).', 1);
        if (cmd === 'clean') { this._metaFresh = false; return this._ok(opt.quiet ? '' : tail[0] === 'all' || !tail.length ? '27 files removed' : '0 files removed'); }
        if (cmd === 'makecache') { const r = this._needRepos(opt); if (r.err) return r.err; this.metaBase = this._now().getTime(); return this._ok('Updating Subscription Management repositories.\nMetadata cache created.'.replace('Updating Subscription Management repositories.\n', '')); }
        if (cmd === 'history' && !tail.length || cmd === 'history' && tail[0] === 'list') return this._histList(tail[1] === 'all' ? null : null);
        if (cmd === 'history' && tail[0] === 'info') return this._histInfo(tail[1] || 'last');
        if (cmd === 'history' && (tail[0] === 'undo' || tail[0] === 'redo' || tail[0] === 'rollback')) return this._histUndo(tail[0], tail[1], opt, argsIn);
        if (cmd === 'repolist' || cmd === 'repoinfo') return this._repolist(tail, opt);
        if (cmd === 'config-manager') return this._configManager(argsIn.filter(a => a !== '-y'));
        if (cmd === 'alias') return this._ok('');
        if (cmd === 'help') return this.dnf([]);
        if (cmd === 'check') return this._ok('');
        if (cmd === 'needs-restarting') return this._ok(tail.includes('-r') ? 'No core libraries or services have been updated since boot-up.\nReboot should not be necessary.' : '');
        if (cmd === 'list' && (tail[0] === 'installed' || tail[0] === '--installed') || cmd === 'list' && tail.includes('--installed')) return this._list('installed', tail.filter(x => !x.startsWith('-') && x !== 'installed'));
        if (cmd === 'search') { return this._search(tail, opt); }
        if (cmd === 'repoquery' && (tail.includes('--installed') || tail.includes('-l') && false)) { /* handled in _repoquery */ }
        const need = this._needRepos(opt);
        if (need.err) return need.err;
        const chk = need.chk;
        switch (cmd) {
            case 'install': case 'localinstall': return this._install(tail, opt, chk, argsIn);
            case 'remove': case 'erase': return this._remove(tail, opt, chk, argsIn);
            case 'reinstall': return this._reinstall(tail, opt, chk, argsIn);
            case 'autoremove': return this._autoremove(opt, argsIn);
            case 'upgrade': case 'update': case 'upgrade-minimal': case 'distro-sync': return this._upgrade(tail, opt, chk, argsIn);
            case 'downgrade': return this._err(`Error: Package ${tail[0] || ''} of lowest version already installed, cannot downgrade it.`.replace('of lowest version already installed, cannot downgrade it', 'of lowest version already installed, cannot downgrade it'), 1);
            case 'check-update': case 'check-upgrade': return this._checkUpdate(chk, opt);
            case 'list': return this._list(tail[0] === 'updates' || tail[0] === 'upgrades' ? 'updates' : tail[0] === 'available' ? 'available' : tail[0] === 'all' ? 'all' : (tail[0] === 'recent' ? 'recent' : 'all'), tail.filter(x => !['installed', 'available', 'updates', 'upgrades', 'all', 'recent'].includes(x) && !x.startsWith('-')), chk);
            case 'info': case 'repoquery-info': return this._info(tail, chk, opt);
            case 'provides': case 'whatprovides': return this._provides(tail, chk);
            case 'repoquery': return this._repoquery(tail, chk);
            case 'deplist': return this._deplist(tail, chk);
            case 'download': return this._download(argsIn, chk);
            case 'group': case 'groups': return this._group(tail, opt, chk, argsIn);
            case 'groupinstall': return this._group(['install', ...tail], opt, chk, argsIn);
            case 'groupremove': return this._group(['remove', ...tail], opt, chk, argsIn);
            case 'grouplist': return this._group(['list', ...tail], opt, chk, argsIn);
            case 'module': return this._module(tail, opt, chk, argsIn);
            case 'mark': return this._ok('');
            default: return this._err(`No such command: ${cmd}. Please use /usr/bin/dnf --help\nIt could be a DNF plugin command, try: "dnf install 'dnf-command(${cmd})'"`, 1);
        }
    }

    // ----- install
    _install(specs, opt, chk, argsIn) {
        if (!specs.length) return this._err('Error: Need a package name or group to install', 1);
        const res = this._resolve(specs, chk);
        const out = [];
        if (!opt.quiet) out.push(this._metaLine());
        const already = [];
        let want = [];
        for (const p of res.pkgs) { if (this.installed[p]) already.push(p); else want.push(p); }
        // groups
        for (const g of res.groups) { const r = this._groupPkgs(g); if (!r) { out.push(`Error: Unable to find a match: @${g}`); res.notfound.push('@' + g); continue; } want.push(...r.filter(x => !this.installed[x] && this._repoFor(x, chk))); }
        // search "provides" fallback for install by command name (dnf install semanage fails like real)
        for (const a of already) out.push(`Package ${this._nevra(a)} is already installed.`);
        for (const nf of res.notfound) out.push(`No match for argument: ${nf}`);
        want = [...new Set(want)];
        const fileItems = res.files;
        if (!want.length && !fileItems.length) {
            if (res.notfound.length) { out.push(`Error: Unable to find a match: ${res.notfound.join(' ')}`); return { stdout: '', stderr: out.join('\n'), exitCode: 1 }; }
            out.push('Dependencies resolved.', 'Nothing to do.', 'Complete!');
            return this._ok(out.join('\n'));
        }
        const closure = this._depClosure(want);
        // gpg check on custom repos
        const gpgBad = closure.map(c => ({ c, repo: this._repoFor(c.name, chk) })).find(x => x.repo && x.repo.gpgcheck && !x.repo.rh && !opt.nogpg && !/cdn\.redhat\.com/.test(x.repo.baseurl) && !this._gpgKeyOk(x.repo));
        const items = closure.map(c => { const e = this.cat[c.name]; const r = this._repoFor(c.name, chk); return { name: c.name, dep: c.dep, repo: r ? r.id : 'baseos', size: e.size, nevra: `${c.name}-${e.ver}-${e.rel}.${this._arch(c.name)}`, ver: `${e.ver}-${e.rel}` }; });
        for (const f of fileItems) { const m = f.node.rpm; items.push({ name: m.name, dep: false, repo: '@commandline', size: f.node.size, nevra: `${m.name}-${m.ver}.${this._arch(m.name)}`, ver: m.ver, fromFile: true }); }
        const tableRows = [];
        const hdr = this._tableFor(items, 'Installing');
        out.push('Dependencies resolved.', ...hdr.lines);
        const totalDl = items.reduce((s, x) => s + x.size, 0);
        const instSize = Math.round(totalDl * 2.4);
        out.push('', 'Transaction Summary', '='.repeat(80), `Install  ${String(items.length).padStart(2)} Package${items.length > 1 ? 's' : ''}`, '', `Total download size: ${this._size(totalDl).trim()}`, `Installed size: ${this._size(instSize).trim()}`);
        const ans = this._prompt(opt.yes, opt.no);
        if (ans === null || ans === undefined) { out.push('Is this ok [y/N]: Operation aborted.'.replace(/^/, '')); return { stdout: '', stderr: out.join('\n'), exitCode: 1 }; }
        if (!opt.yes && !/^y(es)?$/i.test(String(ans).trim())) { return { stdout: out.join('\n') + '\nOperation aborted.', stderr: '', exitCode: 1 }; }
        if (gpgBad) {
            out.push('Downloading Packages:', ...items.map((x, i) => `(${i + 1}/${items.length}): ${x.name}-${x.ver}.${this._arch(x.name)}.rpm`.padEnd(60) + ' 2.3 MB/s | ' + this._size(x.size).trim().replace(' ', ' ') + '   00:00'));
            out.push('-'.repeat(80), `Total`.padEnd(60) + ` 2.3 MB/s | ${this._size(totalDl).trim()}   00:00`);
            const rpmName = `${gpgBad.c.name}-${this.cat[gpgBad.c.name].ver}-${this.cat[gpgBad.c.name].rel}.${this._arch(gpgBad.c.name)}.rpm`;
            out.push(`Public key for ${rpmName} is not installed`);
            return { stdout: '', stderr: out.join('\n') + '\nThe downloaded packages were saved in cache until the next successful transaction.\nYou can remove cached packages by executing \'dnf clean packages\'.\nError: GPG check FAILED', exitCode: 1 };
        }
        out.push('Downloading Packages:');
        items.forEach((x, i) => { if (!x.fromFile) out.push(`(${i + 1}/${items.length}): ${x.name}-${x.ver}.${this._arch(x.name)}.rpm`.padEnd(55) + ' ' + `${(this._rnd(1.4, 9.8)).toFixed(1)} MB/s | ${this._size(x.size).trim().replace(/ ([kM])$/, ' $1B')}  00:00`); });
        out.push('-'.repeat(80), 'Total'.padEnd(56) + `${(this._rnd(1.4, 9.8)).toFixed(1)} MB/s | ${this._size(totalDl).trim().replace(/ ([kM])$/, ' $1B')}  00:00`);
        const t = this._runTransaction('install', { items }, opt);
        out.push(...t.out);
        // apply
        const now = this._now();
        const nameList = [];
        for (const it of items) {
            const e = this.cat[it.name];
            const prev = this.installed[it.name];
            this.installed[it.name] = { date: now, reason: it.dep ? 'dep' : 'user', repo: it.repo, ver: it.fromFile ? it.ver.split('-')[0] : e.ver, rel: it.fromFile ? (it.ver.split('-')[1] || e.rel) : e.rel };
            this._materialize(it.name);
            nameList.push(it.nevra);
        }
        this._record(argsIn, 'Install', items.map(i => ({ name: i.name, act: 'Install', nevra: i.nevra })));
        this._syncLegacy();
        out.push('', 'Installed:');
        out.push(...this._wrapNames(nameList));
        out.push('', 'Complete!');
        return { stdout: out.join('\n'), stderr: res.notfound.length ? '' : '', exitCode: 0 };
    }

    _rnd(a, b) { return a + Math.random() * (b - a); }

    _gpgKeyOk(r) {
        if (!r.gpgkey) return false;
        const k = r.gpgkey.split(/[\s,]+/)[0];
        if (k.startsWith('file://')) return !!this._node(k.slice(7));
        return true;
    }

    _tableFor(items, label, widthItems) {
        const rows = (widthItems || items).map(i => [i.name, this._arch(i.name), i.ver, i.repo, this._size(i.size)]);
        const w = [Math.max(7, ...rows.map(r => r[0].length)) + 1, Math.max(13, 13), Math.max(7, ...rows.map(r => r[2].length)) + 1, Math.max(10, ...rows.map(r => r[3].length)) + 1, Math.max(5, ...rows.map(r => r[4].length))];
        const total = w.reduce((a, b) => a + b, 0) + 1;
        const sep = '='.repeat(80);
        const fmt = (r) => ` ${String(r[0]).padEnd(w[0])}${String(r[1]).padEnd(w[1])}${String(r[2]).padEnd(w[2])}${String(r[3]).padEnd(w[3])}${String(r[4]).padStart(Math.max(w[4], 6))}`;
        const lines = [sep, fmt(['Package', 'Architecture', 'Version', 'Repository', 'Size']), sep];
        const mainI = items.filter(i => !i.dep), depI = items.filter(i => i.dep);
        const lab = label;
        lines.push(`${lab}:`);
        for (const i of mainI) lines.push(fmt([i.name, this._arch(i.name), i.ver, i.repo, this._size(i.size)]));
        if (depI.length) { lines.push(`${lab} dependencies:`); for (const i of depI) lines.push(fmt([i.name, this._arch(i.name), i.ver, i.repo, this._size(i.size)])); }
        return { lines };
    }

    _wrapNames(list) {
        const w = Math.max(...list.map(s => s.length)) + 2;
        const per = Math.max(1, Math.floor(78 / w));
        const rows = [];
        for (let i = 0; i < list.length; i += per) rows.push('  ' + list.slice(i, i + per).map((s, j, a) => (j === a.length - 1 ? s : s.padEnd(w))).join(''));
        return rows;
    }

    _record(argsIn, action, items) {
        const cmd = argsIn.filter(a => a !== '-y').join(' ');
        this.history.push({ id: this.history.length + 1, cmd, date: this._now(), user: 'root', actions: action, altered: items.length, items });
    }

    // ----- remove
    _remove(specs, opt, chk, argsIn) {
        if (!specs.length) return this._err('Error: Need a package name', 1);
        const out = [];
        if (!opt.quiet) out.push(this._metaLine());
        let names = [];
        const nf = [];
        for (const sp of specs) {
            let n = this._parseSpec(sp);
            if (!n && /[*?]/.test(sp)) { const re = this._globToRe(sp); names.push(...Object.keys(this.installed).filter(x => re.test(x))); continue; }
            if (n && this.installed[n]) names.push(n); else nf.push(sp);
        }
        for (const x of nf) out.push(`No match for argument: ${x}`);
        names = [...new Set(names)];
        if (!names.length) { const msg = out.join('\n'); return { stdout: '', stderr: (msg ? msg + '\n' : '') + 'Error: No packages marked for removal.', exitCode: 1 }; }
        // dependents
        const removeSet = new Set(names);
        let grew = true;
        while (grew) { grew = false; for (const n of [...removeSet]) for (const d of this._dependents(n)) if (!removeSet.has(d)) { removeSet.add(d); grew = true; } }
        const prot = [...removeSet].filter(n => this.protectedPkgs.has(n));
        if (prot.length) return { stdout: out.join('\n'), stderr: `Error: \n Problem: The operation would result in removing the following protected packages: ${prot.sort().join(', ')}\n(try to add '--skip-broken' to skip uninstallable packages)`.replace('Error: \n Problem', 'Error: \n Problem'), exitCode: 1 };
        // unused dependencies (clean_requirements_on_remove)
        const unused = this._unusedDeps(removeSet);
        const items = [...removeSet].map(n => ({ name: n, dep: false, repo: '@' + (this.installed[n].repo === 'anaconda' ? 'anaconda' : this.installed[n].repo), size: this.cat[n].size, nevra: this._nevra(n), ver: `${this.installed[n].ver}-${this.installed[n].rel}` }));
        for (const u of unused) items.push({ name: u, dep: true, repo: '@' + this.installed[u].repo, size: this.cat[u].size, nevra: this._nevra(u), ver: `${this.installed[u].ver}-${this.installed[u].rel}` });
        const mainI = items.filter(i => !i.dep && names.includes(i.name)), depI = items.filter(i => !i.dep && !names.includes(i.name)), unI = items.filter(i => i.dep);
        const all = [...mainI, ...depI, ...unI];
        const lines = this._tableFor([], 'x', all).lines.slice(0, 3);
        const f = (i) => { const l = this._tableFor([i], 'x', all).lines; return l[l.length - 1]; };
        lines.push('Removing:'); mainI.forEach(i => lines.push(f(i)));
        if (depI.length) { lines.push('Removing dependent packages:'); depI.forEach(i => lines.push(f(i))); }
        if (unI.length) { lines.push('Removing unused dependencies:'); unI.forEach(i => lines.push(f(i))); }
        out.push('Dependencies resolved.', ...lines, '', 'Transaction Summary', '='.repeat(80), `Remove  ${String(all.length).padStart(3)} Package${all.length > 1 ? 's' : ''}`, '', `Freed space: ${this._size(all.reduce((s, x) => s + x.size * 2.4, 0)).trim()}`);
        const ans = this._prompt(opt.yes, opt.no);
        if (ans === null || ans === undefined) return { stdout: '', stderr: out.join('\n') + '\nIs this ok [y/N]: Operation aborted.', exitCode: 1 };
        if (!opt.yes && !/^y(es)?$/i.test(String(ans).trim())) return { stdout: out.join('\n') + '\nOperation aborted.', stderr: '', exitCode: 1 };
        const t = this._runTransaction('remove', { items: all }, opt);
        out.push(...t.out);
        const warns = [];
        for (const it of all) { warns.push(...this._dematerialize(it.name)); delete this.installed[it.name]; }
        this._record(argsIn, 'Removed', all.map(i => ({ name: i.name, act: 'Removed', nevra: i.nevra })));
        this._syncLegacy();
        out.push(...warns);
        out.push('', 'Removed:', ...this._wrapNames(all.map(i => i.nevra)), '', 'Complete!');
        return this._ok(out.join('\n'));
    }

    _unusedDeps(removeSet) {
        const res = [];
        let changed = true;
        const gone = new Set(removeSet);
        while (changed) {
            changed = false;
            for (const [n, v] of Object.entries(this.installed)) {
                if (gone.has(n) || v.reason !== 'dep') continue;
                const users = this._dependents(n).filter(d => !gone.has(d));
                if (!users.length) { gone.add(n); res.push(n); changed = true; }
            }
        }
        return res;
    }

    _autoremove(opt, argsIn) {
        const unused = this._unusedDeps(new Set());
        const out = [this._metaLine()];
        if (!unused.length) { out.push('Dependencies resolved.', 'Nothing to do.', 'Complete!'); return this._ok(out.join('\n')); }
        const items = unused.map(n => ({ name: n, dep: true, repo: '@' + this.installed[n].repo, size: this.cat[n].size, nevra: this._nevra(n), ver: `${this.installed[n].ver}-${this.installed[n].rel}` }));
        const lines = this._tableFor([], 'x', items).lines.slice(0, 3);
        lines.push('Removing:'); items.forEach(i => { const l = this._tableFor([i], 'x', items).lines; lines.push(l[l.length - 1]); });
        out.push('Dependencies resolved.', ...lines, '', 'Transaction Summary', '='.repeat(80), `Remove  ${String(items.length).padStart(3)} Packages`.replace(/Packages$/, items.length > 1 ? 'Packages' : 'Package'), '', `Freed space: ${this._size(items.reduce((s, x) => s + x.size * 2.4, 0)).trim()}`);
        const ans = this._prompt(opt.yes, opt.no);
        if (ans === null || ans === undefined) return { stdout: '', stderr: out.join('\n') + '\nIs this ok [y/N]: Operation aborted.', exitCode: 1 };
        if (!opt.yes && !/^y(es)?$/i.test(String(ans).trim())) return { stdout: out.join('\n') + '\nOperation aborted.', stderr: '', exitCode: 1 };
        out.push(...this._runTransaction('remove', { items }, opt).out);
        for (const it of items) { this._dematerialize(it.name); delete this.installed[it.name]; }
        this._record(argsIn, 'Removed', items.map(i => ({ name: i.name, act: 'Removed', nevra: i.nevra })));
        this._syncLegacy();
        out.push('', 'Removed:', ...this._wrapNames(items.map(i => i.nevra)), '', 'Complete!');
        return this._ok(out.join('\n'));
    }

    _reinstall(specs, opt, chk, argsIn) {
        const out = [this._metaLine()];
        const names = specs.map(s => this._parseSpec(s)).filter(Boolean);
        if (!names.length || names.some(n => !this.installed[n])) { const bad = specs.find(s => { const n = this._parseSpec(s); return !n || !this.installed[n]; }); return { stdout: '', stderr: `${out[0]}\nNo match for argument: ${bad}\nError: Unable to find a match: ${bad}`, exitCode: 1 }; }
        const items = names.map(n => ({ name: n, dep: false, repo: (this._repoFor(n, chk) || { id: 'baseos' }).id, size: this.cat[n].size, nevra: this._nevra(n), ver: `${this.cat[n].ver}-${this.cat[n].rel}` }));
        out.push('Dependencies resolved.', ...this._tableFor(items, 'Reinstalling').lines, '', 'Transaction Summary', '='.repeat(80), `Reinstall  ${items.length} Package${items.length > 1 ? 's' : ''}`, '', `Total download size: ${this._size(items.reduce((s, x) => s + x.size, 0)).trim()}`, `Installed size: ${this._size(items.reduce((s, x) => s + x.size * 2.4, 0)).trim()}`);
        const ans = this._prompt(opt.yes, opt.no);
        if (ans === null || ans === undefined) return { stdout: '', stderr: out.join('\n') + '\nIs this ok [y/N]: Operation aborted.', exitCode: 1 };
        if (!opt.yes && !/^y(es)?$/i.test(String(ans).trim())) return { stdout: out.join('\n') + '\nOperation aborted.', stderr: '', exitCode: 1 };
        out.push('Downloading Packages:', ...this._runTransaction('reinstall', { items }, opt).out);
        for (const n of names) { for (const f of this.cat[n].files) { if (!f.endsWith('/') && !this._node(f)) this._materialize(n); } this.installed[n].date = this._now(); }
        this._record(argsIn, 'Reinstall', items.map(i => ({ name: i.name, act: 'Reinstall', nevra: i.nevra })));
        out.push('', 'Reinstalled:', ...this._wrapNames(items.map(i => i.nevra)), '', 'Complete!');
        return this._ok(out.join('\n'));
    }

    // ----- upgrade
    _pendingUpdates(chk, only) {
        const list = [];
        for (const [n, u] of Object.entries(this.updates)) {
            if (!this.installed[n]) continue;
            if (this.installed[n].ver === u.ver && this.installed[n].rel === u.rel) continue;
            if (this.installed[n].upgraded && n !== 'kernel') continue;
            if (only && only.length && !only.includes(n)) continue;
            list.push({ name: n, ver: `${u.ver}-${u.rel}`, repo: (this._repoFor(n, chk) || { id: u.repo }).id, size: Math.round(this.cat[n].size * 1.02) });
        }
        return list;
    }

    _checkUpdate(chk, opt) {
        const ups = this._pendingUpdates(chk);
        const out = ['', ...ups.map(u => `${(u.name + '.' + this._arch(u.name)).padEnd(40)} ${u.ver.padEnd(24)} ${u.repo}`)];
        if (!opt.quiet) out.unshift(this._metaLine());
        return { stdout: ups.length ? out.join('\n') : (opt.quiet ? '' : this._metaLine()), stderr: '', exitCode: ups.length ? 100 : 0 };
    }

    _upgrade(specs, opt, chk, argsIn) {
        const only = specs.map(s => this._parseSpec(s)).filter(Boolean);
        const out = [this._metaLine()];
        const nf = specs.filter(s => !this._parseSpec(s));
        nf.forEach(s => out.push(`No match for argument: ${s}`));
        if (specs.length && nf.length === specs.length) return { stdout: '', stderr: out.join('\n') + `\nError: No packages marked for upgrade.`, exitCode: 1 };
        const ups = this._pendingUpdates(chk, specs.length ? only : null);
        if (!ups.length) { out.push('Dependencies resolved.', 'Nothing to do.', 'Complete!'); return this._ok(out.join('\n')); }
        const items = ups.map(u => ({ name: u.name, dep: false, repo: u.repo, size: u.size, nevra: `${u.name}-${u.ver}.${this._arch(u.name)}`, ver: u.ver, upg: true }));
        const kern = items.filter(i => i.name === 'kernel'), oth = items.filter(i => i.name !== 'kernel');
        const lines = this._tableFor([], 'x', items).lines.slice(0, 3);
        const rowOf = (i) => { const l = this._tableFor([i], 'x', items).lines; return l[l.length - 1]; };
        if (kern.length) { lines.push('Installing:'); kern.forEach(i => lines.push(rowOf(i))); }
        if (oth.length) { lines.push('Upgrading:'); oth.forEach(i => lines.push(rowOf(i))); }
        const tot = items.reduce((s, x) => s + x.size, 0);
        out.push('Dependencies resolved.', ...lines, '', 'Transaction Summary', '='.repeat(80));
        if (kern.length) out.push(`Install   ${kern.length} Package`);
        if (oth.length) out.push(`Upgrade  ${String(oth.length).padStart(2)} Package${oth.length > 1 ? 's' : ''}`);
        out.push('', `Total download size: ${this._size(tot).trim()}`);
        const ans = this._prompt(opt.yes, opt.no);
        if (ans === null || ans === undefined) return { stdout: '', stderr: out.join('\n') + '\nIs this ok [y/N]: Operation aborted.', exitCode: 1 };
        if (!opt.yes && !/^y(es)?$/i.test(String(ans).trim())) return { stdout: out.join('\n') + '\nOperation aborted.', stderr: '', exitCode: 1 };
        out.push('Downloading Packages:', ...this._runTransaction('upgrade', { items }, opt).out);
        const names = [];
        for (const it of items) {
            const u = this.updates[it.name];
            if (it.name === 'kernel') { this._write(`/boot/vmlinuz-${u.ver}-${u.rel}.x86_64`, ''); this._write(`/boot/initramfs-${u.ver}-${u.rel}.x86_64.img`, ''); this.installed.kernelNew = undefined; delete this.installed.kernelNew; this.extraKernel = `${u.ver}-${u.rel}.x86_64`; this.installed[it.name].upgraded = true; this.installed[it.name].rel2 = u.rel; this.installed[it.name].ver2 = u.ver; }
            else { this.installed[it.name].ver = u.ver; this.installed[it.name].rel = u.rel; this.installed[it.name].upgraded = true; this.installed[it.name].date = this._now(); }
            names.push(it.nevra);
        }
        this._record(argsIn, kern.length ? 'Install, Upgrade' : 'Upgrade', items.map(i => ({ name: i.name, act: 'Upgrade', nevra: i.nevra })));
        out.push('', ...(kern.length ? ['Installed:', ...this._wrapNames(kern.map(k => k.nevra)), ''] : []), ...(oth.length ? ['Upgraded:', ...this._wrapNames(oth.map(k => k.nevra))] : []), '', 'Complete!');
        return this._ok(out.join('\n'));
    }

    // ----- list / search / info
    _list(kind, pats, chk) {
        const out = [];
        const re = pats.length ? pats.map(p => this._globToRe(p.replace(/\.(x86_64|noarch)$/, ''))) : null;
        const match = (n) => !re || re.some(r => r.test(n));
        const row = (n, ver, repo) => `${(n + '.' + this._arch(n)).padEnd(40)}${ver.padEnd(24)}${repo}`;
        if (chk && !pats.length || chk) out.push(this._metaLine());
        let any = false;
        if (kind === 'installed' || kind === 'all') {
            const L = Object.keys(this.installed).sort().filter(match).map(n => row(n, `${this.installed[n].ver}-${this.installed[n].rel}`, '@' + (this.installed[n].repo === 'anaconda' ? 'anaconda' : this.installed[n].repo)));
            if (L.length) { out.push('Installed Packages', ...L); any = true; }
        }
        if (kind === 'available' || kind === 'all') {
            const L = Object.keys(this.cat).sort().filter(n => !this.installed[n] && match(n) && (chk ? this._repoFor(n, chk) : true)).map(n => row(n, `${this.cat[n].ver}-${this.cat[n].rel}`, chk ? this._repoFor(n, chk).id : this.cat[n].repo));
            if (L.length) { out.push('Available Packages', ...L); any = true; }
        }
        if (kind === 'updates') {
            const L = this._pendingUpdates(chk).filter(u => match(u.name)).map(u => row(u.name, u.ver, u.repo));
            if (L.length) { out.push('Available Upgrades', ...L); any = true; }
        }
        if (kind === 'recent') { any = true; }
        if (!any) { out.push('Error: No matching Packages to list'); return { stdout: '', stderr: out.slice(chk ? 1 : 0).join('\n'), exitCode: 1 }; }
        if (!chk) out.shift && out[0] && /^Last metadata/.test(out[0]) && out.shift();
        return this._ok(out.join('\n'));
    }

    _search(tail, opt) {
        const need = this._needRepos(opt);
        if (need.err) return need.err;
        const chk = need.chk;
        const terms = tail.filter(x => !x.startsWith('-'));
        if (!terms.length) return this._err('Error: search: too few arguments', 2);
        const all = tail.includes('all');
        const hits = [];
        const nameHits = [], sumHits = [];
        for (const e of Object.values(this.cat)) {
            if (!this._repoFor(e.name, chk) && !this.installed[e.name]) continue;
            const inName = terms.every(t => e.name.toLowerCase().includes(t.toLowerCase()));
            const inSum = terms.every(t => (e.summary + ' ' + e.name).toLowerCase().includes(t.toLowerCase()));
            if (inName) nameHits.push(e); else if (inSum) sumHits.push(e);
        }
        const out = [];
        if (!opt.quiet) out.push(this._metaLine());
        if (!nameHits.length && !sumHits.length) return { stdout: out.join('\n'), stderr: `No matches found.`.replace(/^/, ''), exitCode: 1 };
        const fmt = (e) => `${(e.name + '.' + this._arch(e.name)).padEnd(40)} : ${e.summary}`;
        if (nameHits.length) out.push(`${'='.repeat(21)} Name Matched: ${terms.join(', ')} ${'='.repeat(21)}`, ...nameHits.sort((a, b) => a.name.localeCompare(b.name)).map(fmt));
        if (sumHits.length) out.push(`${'='.repeat(17)} Summary Matched: ${terms.join(', ')} ${'='.repeat(17)}`, ...sumHits.sort((a, b) => a.name.localeCompare(b.name)).map(fmt));
        return this._ok(out.join('\n'));
    }

    _infoBlock(n, installed, chk) {
        const e = this.cat[n];
        const i = this.installed[n];
        const ver = installed && i ? i.ver : e.ver, rel = installed && i ? i.rel : e.rel;
        const repo = installed ? (i.repo === 'anaconda' ? '@System' : '@System') : (this._repoFor(n, chk) || { id: e.repo }).id;
        const L = [
            `Name         : ${n}`, `Version      : ${ver}`, `Release      : ${rel}`, `Architecture : ${this._arch(n)}`, `Size         : ${this._size(e.size * 2.4).trim()}`, `Source       : ${n}-${ver}-${rel}.src.rpm`,
            `Repository   : ${installed ? '@System' : repo}`
        ];
        if (installed) L.push(`From repo    : ${i.repo === 'anaconda' ? 'anaconda' : i.repo}`);
        L.push(`Summary      : ${e.summary}`, `URL          : ${e.url}`, `License      : ${e.license}`, `Description  : ${e.summary}.`);
        return L.join('\n');
    }

    _info(tail, chk, opt) {
        const specs = tail.filter(x => !x.startsWith('-'));
        if (!specs.length) return this._err('Error: info: too few arguments', 2);
        const out = [this._metaLine()];
        let found = false;
        const inst = [], avail = [];
        for (const sp of specs) {
            const names = /[*?]/.test(sp) ? Object.keys(this.cat).filter(n => this._globToRe(sp).test(n)) : [this._parseSpec(sp)].filter(Boolean);
            for (const n of names) { if (this.installed[n]) inst.push(n); if (!this.installed[n] && this._repoFor(n, chk)) avail.push(n); }
        }
        if (inst.length) { out.push('Installed Packages', inst.map(n => this._infoBlock(n, true, chk)).join('\n\n')); found = true; }
        if (avail.length) { out.push('Available Packages', avail.map(n => this._infoBlock(n, false, chk)).join('\n\n')); found = true; }
        if (!found) return { stdout: '', stderr: out[0] + '\nError: No matching Packages to list', exitCode: 1 };
        return this._ok(out.join('\n'));
    }

    _provides(tail, chk) {
        const specs = tail.filter(x => !x.startsWith('-'));
        if (!specs.length) return this._err('Error: provides: too few arguments', 2);
        const out = [this._metaLine()];
        let any = false;
        for (const sp of specs) {
            const hits = [];
            for (const e of Object.values(this.cat)) {
                if (!this._repoFor(e.name, chk) && !this.installed[e.name]) continue;
                const re = this._globToRe(sp);
                const matchedFiles = e.files.filter(f => re.test(f) || re.test(f.replace(/\/$/, '')));
                if (matchedFiles.length || re.test(e.name)) hits.push({ e, files: matchedFiles });
            }
            for (const h of hits) {
                any = true;
                const inst = this.installed[h.e.name];
                out.push(`${h.e.name}-${h.e.ver}-${h.e.rel}.${this._arch(h.e.name)} : ${h.e.summary}`, `Repo        : ${inst ? '@System' : this._repoFor(h.e.name, chk).id}`, 'Matched from:');
                if (h.files.length) { out.push(`Filename    : ${h.files[0]}`); } else out.push(`Provide    : ${h.e.name} = ${h.e.ver}-${h.e.rel}`);
                out.push('');
            }
        }
        if (!any) return { stdout: '', stderr: out[0] + '\nError: No Matches found', exitCode: 1 };
        return this._ok(out.join('\n').replace(/\n$/, ''));
    }

    _repoquery(tail, chk) {
        const flags = tail.filter(x => x.startsWith('-'));
        const specs = tail.filter(x => !x.startsWith('-'));
        const installedOnly = flags.includes('--installed');
        const names = specs.length ? specs.flatMap(sp => (/[*?]/.test(sp) ? Object.keys(this.cat).filter(n => this._globToRe(sp).test(n)) : [this._parseSpec(sp)].filter(Boolean))) : Object.keys(installedOnly ? this.installed : this.cat);
        const pool = names.filter(n => (installedOnly ? this.installed[n] : (this._repoFor(n, chk) || this.installed[n])));
        if (flags.includes('-l') || flags.includes('--list')) return this._ok(pool.flatMap(n => this.cat[n].files).join('\n'));
        if (flags.includes('--requires')) return this._ok(pool.flatMap(n => this.cat[n].req.length ? this.cat[n].req : ['/bin/sh']).join('\n'));
        if (flags.includes('--whatrequires') ) { const t = specs[0]; return this._ok(Object.values(this.cat).filter(e => e.req.includes(t)).map(e => `${e.name}-${e.ver}-${e.rel}.${this._arch(e.name)}`).join('\n')); }
        if (flags.includes('--info') || flags.includes('-i')) return this._ok(pool.map(n => this._infoBlock(n, !!this.installed[n], chk)).join('\n\n'));
        return this._ok(pool.sort().map(n => `${n}-${this.cat[n].ver}-${this.cat[n].rel}.${this._arch(n)}`).join('\n'));
    }

    _deplist(tail, chk) {
        const L = [];
        for (const sp of tail.filter(x => !x.startsWith('-'))) { const n = this._parseSpec(sp); if (!n) continue; const e = this.cat[n]; L.push(`package: ${n}-${e.ver}-${e.rel}.${this._arch(n)}`); for (const d of e.req) L.push(`  dependency: ${d}\n   provider: ${this._nevra(d)}`); }
        return this._ok(L.join('\n'));
    }

    _download(argsIn, chk) {
        const rest = argsIn.filter(a => !a.startsWith('-') && a !== 'download');
        const di = argsIn.findIndex(a => a === '--destdir');
        const dest = di >= 0 ? argsIn[di + 1] : (argsIn.find(a => a.startsWith('--destdir=')) || '').slice(10) || this.fs.currentPath;
        const dnode = this._node(this.fs.resolvePath(dest));
        if (!dnode || dnode.type !== 'directory') return this._err(`Error: --destdir ${dest}: No such directory`.replace(/^/, ''), 1);
        const pk = rest.filter(x => x !== dest);
        if (!pk.length) return this._err('Error: Need a package name', 1);
        const out = [this._metaLine()];
        for (const sp of pk) {
            const n = this._parseSpec(sp);
            if (!n || !this._repoFor(n, chk)) return { stdout: '', stderr: `No package ${sp} available.\nError: Unable to find a match: ${sp}`, exitCode: 1 };
            const e = this.cat[n];
            const fname = `${n}-${e.ver}-${e.rel}.${this._arch(n)}.rpm`;
            dnode.children[fname] = { type: 'file', permissions: '0644', owner: this.fs.currentUser, group: this.fs.currentUser, size: e.size, modified: new Date(), content: '\u0000RPM\u0000', rpm: { name: n, ver: `${e.ver}-${e.rel}`, summary: e.summary, files: e.files, conf: e.files.filter(f => /^\/etc\//.test(f) && !f.endsWith('/')), req: e.req.map(r => this._nevraReq(r)) } };
            out.push(`(1/1): ${fname}`.padEnd(56) + `${this._rnd(1.4, 9.8).toFixed(1)} MB/s | ${this._size(e.size).trim().replace(/ ([kM])$/, ' $1B')}  00:00`);
        }
        return this._ok(out.join('\n'));
    }

    _nevraReq(r) { const e = this.cat[r]; return e ? `${r} = ${e.ver}-${e.rel}` : r; }

    // ----- repolist / config-manager
    _repolist(tail, opt) {
        const all = tail.includes('all') || tail.includes('--all');
        const disabledOnly = tail.includes('disabled');
        const repos = this._repos().filter(r => all ? true : (disabledOnly ? !r.enabled : r.enabled));
        const chk = all || disabledOnly ? null : this._repoCheck();
        if (chk && chk.errors.length) {
            const L = [];
            for (const e of chk.errors) L.push(`Errors during downloading metadata for repository '${e.repo.id}':\n  - ${e.msg}`);
            L.push(`Error: Failed to download metadata for repo '${chk.errors[0].repo.id}': Cannot download repomd.xml: Cannot download repodata/repomd.xml: All mirrors were tried`);
            return { stdout: '', stderr: L.join('\n'), exitCode: 1 };
        }
        if (!repos.length) return this._ok(all || disabledOnly ? '' : '');
        const w = Math.max(7, ...repos.map(r => r.id.length)) + 2;
        const nw = Math.max(9, ...repos.map(r => r.name.length));
        const L = [`${'repo id'.padEnd(w)}${'repo name'.padEnd(all ? nw + 2 : 0)}${all ? 'status' : ''}`.trimEnd() || ''];
        if (!all) L[0] = `${'repo id'.padEnd(w)}repo name`;
        for (const r of repos) L.push(all ? `${r.id.padEnd(w)}${r.name.padEnd(nw + 2)}${r.enabled ? 'enabled' : 'disabled'}` : `${r.id.padEnd(w)}${r.name}`);
        return this._ok(L.join('\n'));
    }

    _configManager(args) {
        const rest = args.filter(a => a !== 'config-manager');
        const pos = rest.filter(a => !a.startsWith('--'));
        const ai = rest.findIndex(a => a === '--add-repo' || a.startsWith('--add-repo='));
        if (!this.installed['dnf-plugins-core']) return this._err('No such command: config-manager. Please use /usr/bin/dnf --help\nIt could be a DNF plugin command, try: "dnf install \'dnf-command(config-manager)\'"', 1);
        if (ai >= 0) {
            const url = rest[ai].includes('=') ? rest[ai].split('=').slice(1).join('=') : rest[ai + 1];
            if (!url) return this._err('Error: missing url for --add-repo', 1);
            const m = /^(https?|file|ftp):\/\/(.*)$/.exec(url);
            if (!m) return this._err('Error: Configuration of repo failed', 1);
            if (m[1] !== 'file') {
                const host = m[2].split('/')[0].split(':')[0];
                if (this.shared.net) { const r = this.shared.net._getaddr(host); if (r.err) return this._err(`Adding repo from: ${url}\nStatus code: 0 for ${url} (IP: )\nError: Configuration of repo failed`.replace(/^/, ''), 1); }
            }
            const id = m[2].replace(/[\/:]/g, '_').replace(/\.repo$/, '').replace(/_+$/, '');
            const content = /\.repo$/.test(url) ? `[${id}]\nname=Added from ${url}\nbaseurl=${url.replace(/\/[^/]+\.repo$/, '')}\nenabled=1\ngpgcheck=1\n` : `[${id}]\nname=added from: ${url}\nbaseurl=${url}\nenabled=1\n`;
            this._write(`/etc/yum.repos.d/${id}.repo`, content);
            return this._ok(`Adding repo from: ${url}`);
        }
        const en = rest.findIndex(a => a === '--set-enabled' || a === '--enable'), di = rest.findIndex(a => a === '--set-disabled' || a === '--disable');
        const setEnabled = (id, val) => {
            const dir = this._node('/etc/yum.repos.d');
            for (const f of Object.keys(dir.children)) {
                const n = dir.children[f];
                if (!f.endsWith('.repo')) continue;
                if (!new RegExp('^\\[' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]', 'm').test(n.content)) continue;
                const lines = n.content.split('\n'); let inSec = false, done = false;
                for (let i = 0; i < lines.length; i++) {
                    if (/^\[.*\]$/.test(lines[i].trim())) { if (inSec && !done) { lines.splice(i, 0, `enabled=${val}`); done = true; } inSec = lines[i].trim() === `[${id}]`; continue; }
                    if (inSec && /^enabled\s*=/.test(lines[i])) { lines[i] = `enabled=${val}`; done = true; }
                }
                if (inSec && !done) lines.splice(lines.length - (lines[lines.length - 1] === '' ? 1 : 0), 0, `enabled=${val}`);
                n.content = lines.join('\n'); n.modified = new Date();
                return true;
            }
            return false;
        };
        if (en >= 0 || di >= 0) {
            const idx = en >= 0 ? en : di;
            const id = rest[idx].includes('=') ? rest[idx].split('=')[1] : rest[idx + 1];
            if (!setEnabled(id, en >= 0 ? 1 : 0)) return this._err(`Error: No matching repo to modify: ${id}.`, 1);
            return this._ok('');
        }
        return this._ok('');
    }

    // ----- history
    _histList() {
        const L = ['ID     | Command line                                 | Date and time    | Action(s)      | Altered', '-'.repeat(103 > 80 ? 103 : 80)];
        for (const h of this.history.slice().reverse()) L.push(`${String(h.id).padStart(6)} | ${h.cmd.padEnd(45).slice(0, 45)} | ${this._fmt(h.date, '%Y-%m-%d %H:%M')} | ${h.actions.padEnd(14).slice(0, 14)} | ${String(h.altered).padStart(4)}${h.id === 1 ? ' EE' : ''}`);
        return this._ok(L.join('\n'));
    }

    _histInfo(ref) {
        const h = ref === 'last' ? this.history[this.history.length - 1] : this.history.find(x => x.id === parseInt(ref, 10));
        if (!h) return this._err(`Error: No transaction found: ${ref}`, 1);
        const L = [`Transaction ID : ${h.id}`, `Begin time     : ${this._fmt(h.date, '%a %d %b %Y %I:%M:%S %p %Z')}`, `Begin rpmdb    : ${100 + h.id}:${Math.random().toString(16).slice(2, 10)}`, `End time       : ${this._fmt(h.date, '%a %d %b %Y %I:%M:%S %p %Z')} (1 seconds)`, `User           : ${h.user === 'root' ? 'root <root>' : h.user}`, 'Return-Code    : Success', 'Releasever     : 9', `Command Line   : ${h.cmd}`, 'Comment        : ', 'Packages Altered:', ...h.items.map(i => `    ${i.act.padEnd(9)} ${i.nevra}`)];
        return this._ok(L.join('\n'));
    }

    _histUndo(kind, ref, opt, argsIn) {
        const h = (ref === 'last' || !ref) ? this.history[this.history.length - 1] : this.history.find(x => x.id === parseInt(ref, 10));
        if (!h || h.id === 1) return this._err(`Error: Transaction ID ${ref || ''} not found or cannot be undone`, 1);
        const out = [this._metaLine()];
        const removing = h.items.filter(i => i.act === 'Install').map(i => i.name).filter(n => this.installed[n]);
        const installing = h.items.filter(i => i.act === 'Removed').map(i => i.name).filter(n => !this.installed[n] && this.cat[n]);
        if (!removing.length && !installing.length) return this._err('Error: The following problems occurred while running a transaction:\n  Cannot find rpm nevra', 1);
        if (kind === 'undo') {
            if (removing.length) { const r = this._remove(removing, Object.assign({}, opt, { quiet: true }), null, argsIn); if (r.exitCode) return r; out.push(r.stdout); }
            if (installing.length) { const chk = this._repoCheck(); const r = this._install(installing, Object.assign({}, opt, { quiet: true }), chk, argsIn); if (r.exitCode) return r; out.push(r.stdout); }
        }
        return this._ok(out.join('\n'));
    }

    // ----- groups
    _groupPkgs(g) { const k = Object.keys(this.groups).find(x => x.toLowerCase() === g.toLowerCase().replace(/^"|"$/g, '')); if (!k) return null; const G = this.groups[k]; return [...G.mand, ...G.def]; }

    _group(tail, opt, chk, argsIn) {
        const sub = tail[0];
        const name = tail.slice(1).filter(x => !x.startsWith('-')).join(' ');
        if (sub === 'list' || sub === 'summary') {
            const envs = Object.entries(this.groups).filter(([, g]) => g.env), grs = Object.entries(this.groups).filter(([, g]) => !g.env);
            const instG = grs.filter(([k]) => this.groupsInstalled.has(k)), availG = grs.filter(([k]) => !this.groupsInstalled.has(k));
            const L = [this._metaLine(), 'Available Environment Groups:', ...envs.filter(([k]) => k !== 'Server').map(([k]) => '   ' + k), 'Installed Environment Groups:', '   Server'];
            if (instG.length) L.push('Installed Groups:', ...instG.map(([k]) => '   ' + k));
            L.push('Available Groups:', ...availG.map(([k]) => '   ' + k));
            return this._ok(L.join('\n'));
        }
        if (sub === 'info') {
            const k = Object.keys(this.groups).find(x => x.toLowerCase() === name.toLowerCase());
            if (!k) return this._err(`${this._metaLine()}\nError: No groups marked for info.`.replace(/\nError.*$/, '\nError: No group named ' + name + ' exists.'), 1);
            const G = this.groups[k];
            const L = [this._metaLine(), `Group: ${k}`, ` Description: ${G.desc}`];
            if (G.mand.length) L.push(' Mandatory Packages:', ...G.mand.map(x => '   ' + x));
            if (G.def.length) L.push(' Default Packages:', ...G.def.map(x => '   ' + x));
            if (G.opt.length) L.push(' Optional Packages:', ...G.opt.map(x => '   ' + x));
            return this._ok(L.join('\n'));
        }
        if (sub === 'install' || sub === 'upgrade' || sub === 'update') {
            const k = Object.keys(this.groups).find(x => x.toLowerCase() === name.toLowerCase().replace(/^"|"$/g, ''));
            if (!k) return { stdout: '', stderr: `${this._metaLine()}\nModule or Group '${name}' is not available.\nError: Unable to find a match: ${name}`.replace(/^/, ''), exitCode: 1 };
            const pk = this._groupPkgs(k).filter(p => this.cat[p]);
            const r = this._install(pk, opt, chk, argsIn);
            if (!r.exitCode) this.groupsInstalled.add(k);
            return r;
        }
        if (sub === 'remove' || sub === 'erase') {
            const k = Object.keys(this.groups).find(x => x.toLowerCase() === name.toLowerCase());
            if (!k) return { stdout: '', stderr: `Module or Group '${name}' is not available.\nError: No match for argument: ${name}`.replace(/^/, ''), exitCode: 1 };
            const pk = this._groupPkgs(k).filter(p => this.installed[p]);
            this.groupsInstalled.delete(k);
            if (!pk.length) return { stdout: '', stderr: 'Error: No packages marked for removal.', exitCode: 1 };
            return this._remove(pk, opt, chk, argsIn);
        }
        return this._err(`Error: Unknown group command: ${sub}`, 1);
    }

    // ----- modules
    _module(tail, opt, chk, argsIn) {
        const sub = tail[0] || 'list';
        const spec = tail.slice(1).filter(x => !x.startsWith('-'));
        const out = [this._metaLine()];
        if (sub === 'list') {
            const pat = spec[0];
            const mods = Object.entries(this.modules).filter(([k]) => !pat || k.includes(pat));
            const L = ['Red Hat Enterprise Linux 9 - AppStream', ['Name', 'Stream', 'Profiles', 'Summary'].map((h, i) => h.padEnd([14, 10, 38, 0][i])).join('').trimEnd()];
            for (const [k, m] of mods) {
                const st = this.moduleState[k];
                for (const s of m.streams) {
                    const flag = (st && st.enabled === s ? ' [e]' : '') + (m.def === s && !(st && st.enabled && st.enabled !== s) ? ' [d]' : '') + (st && st.disabled ? ' [x]' : '');
                    L.push(k.padEnd(14) + (s + flag).padEnd(10) + m.profiles.padEnd(38) + m.summary);
                }
            }
            L.push('', 'Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled');
            return this._ok(L.join('\n'));
        }
        if (sub === 'info') return this._ok(out.concat(spec.map(s => `Name             : ${s.split(':')[0]}\nStream           : ${(s.split(':')[1] || (this.modules[s.split(':')[0]] || {}).def || '')} [d]\nSummary          : ${(this.modules[s.split(':')[0]] || {}).summary || ''}`)).join('\n'));
        const parse = (s) => { const [n, st] = s.split(':'); return { n, st: (st || '').split('/')[0] }; };
        if (!spec.length) return this._err('Error: Problems in request:\nmissing groups or modules: ', 1);
        if (sub === 'enable') {
            for (const s of spec) {
                const { n, st } = parse(s);
                const m = this.modules[n];
                if (!m) return { stdout: '', stderr: `Error: Problems in request:\nmissing groups or modules: ${s}`, exitCode: 1 };
                const stream = st || m.def;
                if (!m.streams.includes(stream)) return { stdout: '', stderr: `Error: Problems in request:\nmissing groups or modules: ${s}`, exitCode: 1 };
                const cur = this.moduleState[n];
                if (cur && cur.enabled && cur.enabled !== stream) return { stdout: '', stderr: `Error: \n Problem: conflicting requests\n  - module ${n}:${stream} is not compatible with already enabled module ${n}:${cur.enabled}`.replace(/Error: \n Problem: .*/, `Error: The operation would result in switching of module '${n}' stream '${cur.enabled}' to stream '${stream}'\nError: It is not possible to switch enabled streams of a module unless explicitly enabled via configuration option module_stream_switch.\nIt is recommended to rather remove all installed content from the module, and reset the module using 'dnf module reset ${n}' command. After you reset the module, you can install the other stream.`), exitCode: 1 };
                this.moduleState[n] = { enabled: stream, disabled: false };
            }
            out.push('Dependencies resolved.', '='.repeat(80), ' Package          Architecture       Version             Repository         Size', '='.repeat(80), 'Enabling module streams:', ...spec.map(s => ` ${parse(s).n.padEnd(36)}${parse(s).st || this.modules[parse(s).n].def}`), '', 'Transaction Summary', '='.repeat(80), '', 'Complete!');
            return this._ok(out.join('\n'));
        }
        if (sub === 'disable') { for (const s of spec) { const { n } = parse(s); if (!this.modules[n]) return { stdout: '', stderr: `Error: Problems in request:\nmissing groups or modules: ${s}`, exitCode: 1 }; this.moduleState[n] = { enabled: null, disabled: true }; } return this._ok(out.concat(['Dependencies resolved.', 'Complete!']).join('\n')); }
        if (sub === 'reset') { for (const s of spec) { const { n } = parse(s); delete this.moduleState[n]; } return this._ok(out.concat(['Dependencies resolved.', 'Complete!']).join('\n')); }
        if (sub === 'install') {
            const pk = [];
            for (const s of spec) {
                const { n, st } = parse(s);
                const m = this.modules[n];
                if (!m) return { stdout: '', stderr: `Error: Problems in request:\nmissing groups or modules: ${s}`, exitCode: 1 };
                const stream = st || (this.moduleState[n] && this.moduleState[n].enabled) || m.def;
                if (!m.streams.includes(stream)) return { stdout: '', stderr: `Error: Problems in request:\nmissing groups or modules: ${s}`, exitCode: 1 };
                if (this.moduleState[n] && this.moduleState[n].disabled) return { stdout: '', stderr: `Error: \n Problem: conflicting requests\n  - module ${n} is disabled`.replace(/^/, ''), exitCode: 1 };
                this.moduleState[n] = { enabled: stream, disabled: false };
                pk.push(...(m.pkgs[stream] || []));
            }
            if (!pk.length) return this._ok(out.concat(['Dependencies resolved.', 'Nothing to do.', 'Complete!']).join('\n'));
            return this._install(pk, opt, chk, argsIn);
        }
        if (sub === 'remove') return this._ok(out.concat(['Dependencies resolved.', 'Nothing to do.', 'Complete!']).join('\n'));
        return this._err(`Error: Unknown module command: ${sub}`, 1);
    }

    yum(args, stdin) { return this.dnf(args, stdin); }

    // ===== rpm =====
    rpm(argsIn) {
        const args = argsIn.slice();
        if (!args.length) return this._err('Usage: rpm [OPTION...]\n\nQuery/Verify package selection options:\n  -a, --all                        query/verify all packages\n  -f, --file                       query/verify package(s) owning file\n\nQuery options (with -q or --query):\n  -c, --configfiles                list all configuration files\n  -d, --docfiles                   list all documentation files\n  -i, --info                       display package information\n  -l, --list                       list files in package\n  -R, --requires                   list capabilities required by package(s)', 1);
        const flagsRaw = args.filter(a => a.startsWith('-') && !a.startsWith('--')).join('').replace(/-/g, '');
        const longs = args.filter(a => a.startsWith('--'));
        const pos = args.filter(a => !a.startsWith('-'));
        const L = (x) => longs.includes(x);
        const isQuery = /q/.test(flagsRaw) || L('--query');
        if (L('--version')) return this._ok('RPM version 4.16.1.3');
        if (L('--import')) { if (!this._isRoot()) return this._err('error: Failed to import key: permission denied', 1); const k = pos[0]; if (!k || !this._node(this.fs.resolvePath(k)) && !/^https?:/.test(k)) return this._err(`error: ${k || ''}: import read failed(2).`.replace('error: : ', 'error: '), 1); return this._ok(''); }
        if (/K/.test(flagsRaw) || L('--checksig')) { const f = pos[0]; const n = this._node(this.fs.resolvePath(f || '')); if (!n) return this._err(`${f}: No such file or directory`.replace(/^/, ''), 1); return this._ok(`${f}: digests signatures OK`); }
        if (isQuery) return this._rpmQuery(flagsRaw, longs, pos);
        if (/V/.test(flagsRaw) || L('--verify')) return this._rpmVerify(flagsRaw, pos);
        if (/e/.test(flagsRaw) || L('--erase')) return this._rpmErase(pos, longs);
        if (/[iU]/.test(flagsRaw) || L('--install') || L('--upgrade') || /F/.test(flagsRaw)) return this._rpmInstall(flagsRaw, longs, pos);
        return this._err('error: no operation specified', 1);
    }

    _rpmQuery(flags, longs, pos) {
        const L = (x) => longs.includes(x);
        const all = /a/.test(flags) || L('--all');
        const fileMode = /f/.test(flags) || L('--file');
        const pkgFile = /p/.test(flags);
        const wantList = /l/.test(flags) || L('--list'), wantInfo = /i/.test(flags) || L('--info'), wantConf = /c/.test(flags) || L('--configfiles'), wantDoc = /d/.test(flags) || L('--docfiles'), wantReq = /R/.test(flags) || L('--requires'), wantProv = L('--provides'), wantWhatReq = L('--whatrequires'), wantWhatProv = L('--whatprovides'), wantScripts = L('--scripts'), wantLast = L('--last'), wantChangelog = /^.*$/.test('') && L('--changelog');
        if (wantWhatProv) { const out = []; for (const sp of pos) { const hits = Object.values(this.cat).filter(e => this.installed[e.name] && (e.name === sp || e.files.includes(sp) || this._globToRe(sp).test(e.name))); if (!hits.length) return this._err(`no package provides ${sp}`, 1); out.push(...hits.map(h => this._nevra(h.name))); } return this._ok(out.join('\n')); }
        if (wantWhatReq) { const t = pos[0]; const hits = Object.keys(this.installed).filter(n => this.cat[n] && this.cat[n].req.includes(t)); if (!hits.length) return this._err(`no package requires ${t}`, 1); return this._ok(hits.map(n => this._nevra(n)).join('\n')); }
        if (pkgFile) {
            const f = pos[0];
            const node = this._node(this.fs.resolvePath(f || ''));
            if (!node) return this._err(`error: open of ${f} failed: No such file or directory`, 1);
            if (!node.rpm) return this._err(`error: ${f}: not an rpm package (or package manifest)`, 1);
            const m = node.rpm;
            if (wantReq) return this._ok(m.req.join('\n') || 'rpmlib(CompressedFileNames) <= 3.0.4-1');
            if (wantList) return this._ok(m.files.join('\n'));
            if (wantInfo) return this._ok(this._rpmInfo(m.name, null, m));
            return this._ok(`${m.name}-${m.ver}.${this._arch(m.name)}`);
        }
        let names = [];
        if (all) {
            names = Object.keys(this.installed);
            if (pos.length) { const re = this._globToRe(pos[0]); names = names.filter(n => re.test(n)); }
            if (wantLast) names = names.sort((a, b) => this.installed[b].date - this.installed[a].date || a.localeCompare(b));
            else names = names.sort(() => 0).sort((a, b) => a.localeCompare(b));
            if (wantLast) return this._ok(names.map(n => `${this._nevra(n).padEnd(50)} ${this._fmt(this.installed[n].date, '%a %d %b %Y %I:%M:%S %p %Z')}`).join('\n'));
            if (!(wantList || wantInfo)) return this._ok(names.map(n => this._nevra(n, false)).join('\n'));
        } else if (fileMode) {
            const out = [];
            for (const f0 of pos) {
                let f = f0;
                const n = this._node(this.fs.resolvePath(f));
                const abs = this.fs.resolvePath(f);
                const owner = Object.keys(this.installed).find(p => this.cat[p] && this.cat[p].files.some(x => x === abs || x === abs + '/' || (x.endsWith('/') && false)));
                if (!n && !owner) { return this._err(`error: file ${f0}: No such file or directory`.replace('error: file', 'file').replace(/^file (.*): No such file or directory$/, `file $1: No such file or directory`), 1); }
                if (!owner) { out.push(`file ${abs} is not owned by any package`); continue; }
                out.push(this._nevra(owner));
            }
            const bad = out.some(o => o.startsWith('file '));
            if (wantList || wantInfo) { names = out.filter(o => !o.startsWith('file ')).map(o => Object.keys(this.installed).find(p => this._nevra(p) === o)); }
            else return { stdout: bad ? '' : out.join('\n'), stderr: out.filter(o => o.startsWith('file ')).join('\n'), exitCode: bad ? 1 : 0 };
        } else {
            const out = [], errs = [];
            for (const sp of pos) {
                const n = this._parseSpec(sp);
                if (n && this.installed[n]) names.push(n); else errs.push(`package ${sp} is not installed`);
            }
            if (errs.length && !names.length) return this._err(errs.join('\n'), 1);
            if (!pos.length) return this._err('error: no arguments given for query', 1);
            if (errs.length) { const r = this._rpmQueryNames(names, flags, longs); return { stdout: r.stdout, stderr: errs.join('\n'), exitCode: 1 }; }
        }
        return this._rpmQueryNames(names, flags, longs);
    }

    _rpmQueryNames(names, flags, longs) {
        const L = (x) => longs.includes(x);
        const wantList = /l/.test(flags) || L('--list'), wantInfo = /i/.test(flags) || L('--info'), wantConf = /c/.test(flags) || L('--configfiles'), wantDoc = /d/.test(flags) || L('--docfiles'), wantReq = /R/.test(flags) || L('--requires'), wantProv = L('--provides'), wantScripts = L('--scripts');
        const out = [];
        for (const n of names) {
            const e = this.cat[n];
            if (wantInfo) out.push(this._rpmInfo(n, this.installed[n]));
            else if (wantConf) out.push(...e.files.filter(f => /^\/etc\//.test(f) && !f.endsWith('/')));
            else if (wantDoc) out.push(...e.files.filter(f => /\/(doc|man)\//.test(f)));
            else if (wantList) out.push(...(e.files.length ? e.files.map(f => f.replace(/\/$/, '')) : ['(contains no files)']));
            else if (wantReq) out.push(...(e.req.length ? e.req.map(r => this._nevraReq(r)) : []), 'rpmlib(CompressedFileNames) <= 3.0.4-1', 'rpmlib(PayloadFilesHavePrefix) <= 4.0-1');
            else if (wantProv) out.push(`${n} = ${e.ver}-${e.rel}`, `${n}(x86-64) = ${e.ver}-${e.rel}`);
            else if (wantScripts) out.push(e.units && e.units.length ? `postinstall scriptlet (using /bin/sh):\n/usr/bin/systemctl daemon-reload >/dev/null 2>&1 || :` : '');
            else out.push(this._nevra(n));
        }
        return this._ok(out.join(wantInfo ? '\n\n' : '\n'));
    }

    _rpmInfo(n, inst, meta) {
        const e = this.cat[n] || { summary: meta ? meta.summary : '', license: 'GPLv2+', group: 'Unspecified', url: '', size: 100000, ver: '', rel: '' };
        const ver = inst ? inst.ver : (meta ? meta.ver.split('-')[0] : e.ver), rel = inst ? inst.rel : (meta ? (meta.ver.split('-')[1] || e.rel) : e.rel);
        return [`Name        : ${n}`, `Version     : ${ver}`, `Release     : ${rel}`, `Architecture: ${this._arch(n)}`, `Install Date: ${inst ? this._fmt(inst.date, '%a %d %b %Y %I:%M:%S %p %Z') : '(not installed)'}`, `Group       : ${e.group}`, `Size        : ${Math.round(e.size * 2.4)}`, `License     : ${e.license}`, 'Signature   : RSA/SHA256, Tue 14 Nov 2023 09:12:03 AM UTC, Key ID 199e2f91fd431d51', `Source RPM  : ${n}-${ver}-${rel}.src.rpm`, 'Build Date  : Tue 14 Nov 2023 09:08:41 AM UTC', 'Build Host  : x86-64-02.build.eng.rdu2.redhat.com', 'Packager    : Red Hat, Inc. <http://bugzilla.redhat.com/bugzilla>', 'Vendor      : Red Hat, Inc.', `URL         : ${e.url}`, `Summary     : ${e.summary}`, 'Description :', `${e.summary}.`].join('\n');
    }

    _rpmVerify(flags, pos) {
        const names = /a/.test(flags) ? Object.keys(this.installed) : pos.map(p => this._parseSpec(p)).filter(Boolean);
        if (!/a/.test(flags) && pos.length && !names.length) return this._err(`package ${pos[0]} is not installed`, 1);
        const out = [];
        for (const n of names) {
            if (!this.installed[n]) { out.push(`package ${n} is not installed`); continue; }
            for (const f of this.cat[n].files) {
                if (f.endsWith('/')) continue;
                const node = this._node(f);
                if (!node) { out.push(`missing     ${/^\/etc\//.test(f) ? 'c' : ' '} ${f}`.replace(/^missing     ( |c) /, (m, c) => `missing   ${c} `)); continue; }
                if (node.pkgOrig !== undefined && node.content !== node.pkgOrig) out.push(`S.5....T.  ${/^\/etc\//.test(f) ? 'c' : ' '} ${f}`);
            }
        }
        return { stdout: out.join('\n'), stderr: '', exitCode: out.length ? 1 : 0 };
    }

    _rpmErase(pos, longs) {
        if (!this._isRoot()) return this._err('error: can\'t create transaction lock on /var/lib/rpm/.rpm.lock (Permission denied)', 1);
        const errs = [];
        const names = [];
        for (const sp of pos) { const n = this._parseSpec(sp); if (n && this.installed[n]) names.push(n); else errs.push(`error: package ${sp} is not installed`); }
        if (errs.length) return this._err(errs.join('\n'), 1);
        if (!longs.includes('--nodeps')) {
            const dep = [];
            for (const n of names) for (const d of this._dependents(n)) if (!names.includes(d)) dep.push(`\t${n} is needed by (installed) ${this._nevra(d)}`);
            const prot = names.filter(n => this.protectedPkgs.has(n) && n !== 'kernel');
            if (dep.length || prot.length) return this._err('error: Failed dependencies:\n' + (dep.length ? dep : prot.map(p => `\t${p} is needed by (installed) dnf-4.14.0-9.el9.noarch`)).join('\n'), 1);
        }
        const warns = [];
        for (const n of names) { warns.push(...this._dematerialize(n)); delete this.installed[n]; }
        this._record(['rpm', '-e', ...pos], 'Erase', names.map(n => ({ name: n, act: 'Removed', nevra: n })));
        this._syncLegacy();
        return { stdout: '', stderr: warns.join('\n'), exitCode: 0 };
    }

    _rpmInstall(flags, longs, pos) {
        if (!this._isRoot()) return this._err('error: can\'t create transaction lock on /var/lib/rpm/.rpm.lock (Permission denied)', 1);
        if (!pos.length) return this._err('error: no packages given for install', 1);
        const upgrade = /U/.test(flags) || longs.includes('--upgrade');
        const out = [], errs = [];
        const files = [];
        for (const f of pos) {
            const n = this._node(this.fs.resolvePath(f));
            if (!n) { errs.push(`error: open of ${f} failed: No such file or directory`); continue; }
            if (!n.rpm) { errs.push(`error: ${f}: not an rpm package (or package manifest)`); continue; }
            files.push({ f, n });
        }
        if (errs.length && !files.length) return this._err(errs.join('\n'), 1);
        const noDeps = longs.includes('--nodeps');
        const names = files.map(x => x.n.rpm.name);
        if (!noDeps) {
            const missing = [];
            for (const { n } of files) for (const r of n.rpm.req) { const dep = r.split(/\s+/)[0]; if (this.cat[dep] && !this.installed[dep] && !names.includes(dep)) missing.push(`\t${dep} is needed by ${n.rpm.name}-${n.rpm.ver}.${this._arch(n.rpm.name)}`); }
            if (missing.length) return this._err('error: Failed dependencies:\n' + missing.join('\n'), 1);
        }
        const hash = '#'.repeat(32);
        const v = flags.includes('v') || longs.includes('--verbose'), h = flags.includes('h') || longs.includes('--hash');
        if (v || h) out.push(`Verifying...                          ${hash} [100%]`, `Preparing...                          ${hash} [100%]`);
        let i = 0;
        for (const { f, n } of files) {
            i++;
            const m = n.rpm;
            const cur = this.installed[m.name];
            if (cur && !upgrade && !longs.includes('--force') && !longs.includes('--replacepkgs')) { errs.push(`\tpackage ${m.name}-${m.ver}.${this._arch(m.name)} is already installed`.replace(/^/, '')); continue; }
            if (!this.cat[m.name]) this.cat[m.name] = { name: m.name, ver: m.ver.split('-')[0], rel: m.ver.split('-')[1] || '1', repo: 'extras', size: n.size, summary: m.summary, files: m.files, req: [], license: 'GPLv2+', group: 'Unspecified', url: '' };
            this.installed[m.name] = { date: this._now(), reason: 'user', repo: '@commandline', ver: m.ver.split('-')[0], rel: m.ver.split('-')[1] || this.cat[m.name].rel };
            this._materialize(m.name);
            if (v || h) out.push(`${upgrade ? 'Updating / installing...' : (i === 1 ? 'Updating / installing...' : '')}`.trim() ? '' : '');
            if (v || h) out.push(`${String(i).padStart(4)}:${m.name}-${m.ver}`.padEnd(38) + `${hash} [100%]`);
        }
        this._record(['rpm', upgrade ? '-U' : '-i', ...pos], 'Install', files.map(({ n }) => ({ name: n.rpm.name, act: 'Install', nevra: `${n.rpm.name}-${n.rpm.ver}` })));
        this._syncLegacy();
        const installedAny = files.length > errs.length;
        const o = out.filter(x => x !== '').join('\n').replace(/^(.*Preparing.*)$/m, installedAny ? '$1\nUpdating / installing...' : '$1');
        return { stdout: o, stderr: errs.join('\n'), exitCode: errs.length ? 1 : 0 };
    }
}

if (typeof window !== 'undefined') {
    window.PackageEngine = PackageEngine;
}
